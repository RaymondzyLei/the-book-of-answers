import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Category } from '../data/answers';

const STORAGE_KEY = 'book-of-answers-weights';
const CATEGORIES: Category[] = ['affirmative', 'negative', 'neutral', 'action', 'mysterious'];
const DEFAULTS: Record<Category, number> = {
  affirmative: 20,
  negative: 20,
  neutral: 20,
  action: 20,
  mysterious: 20,
};

export type Percentages = Record<Category, number>;

function sum(obj: Record<Category, number>): number {
  return Object.values(obj).reduce((s, v) => s + v, 0);
}

function readInitial(): Percentages {
  if (typeof window === 'undefined') return { ...DEFAULTS };
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (
        CATEGORIES.every((c) => typeof parsed[c] === 'number' && parsed[c] >= 0 && parsed[c] <= 100) &&
        sum(parsed as Percentages) === 100
      ) {
        return parsed as Percentages;
      }
    }
  } catch {
    /* invalid stored data, use defaults */
  }
  return { ...DEFAULTS };
}

/**
 * Redistribute percentages so they always sum to exactly 100.
 *
 * When a category's value changes by delta, the opposite amount
 * is taken from / given to the other categories proportionally.
 */
function redistribute(
  prev: Percentages,
  category: Category,
  newValue: number,
): Percentages {
  const old = prev[category];
  if (newValue === old) return prev;

  const delta = newValue - old;
  const others = CATEGORIES.filter((c) => c !== category);
  const othersSum = others.reduce((s, c) => s + prev[c], 0);

  // Trying to increase when others are all zero → can't exceed 100 %.
  if (othersSum === 0 && delta > 0) return prev;

  const next = { ...prev, [category]: newValue };

  if (othersSum === 0) {
    // All others at zero — distribute freed space equally.
    const remaining = 100 - newValue;
    const share = Math.floor(remaining / others.length);
    others.forEach((c, i) => {
      next[c] = share + (i < remaining - share * others.length ? 1 : 0);
    });
    return next;
  }

  // Proportional redistribution.
  const remaining = 100 - newValue;
  let allocated = 0;
  others.slice(0, -1).forEach((c) => {
    const share = Math.max(0, Math.round(remaining * (prev[c] / othersSum)));
    next[c] = share;
    allocated += share;
  });
  // Last category takes the rest so the total is exactly 100.
  const last = others[others.length - 1];
  next[last] = Math.max(0, remaining - allocated);

  return next;
}

export function useAnswerWeights() {
  const [percentages, setRaw] = useState<Percentages>(readInitial);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(percentages));
    } catch {
      /* localStorage unavailable; ignore */
    }
  }, [percentages]);

  const setPercentage = useCallback(
    (category: Category, raw: number) => {
      const clamped = Math.max(0, Math.min(100, Math.round(raw)));
      setRaw((prev) => redistribute(prev, category, clamped));
    },
    [],
  );

  const setPercentages = useCallback((next: Percentages) => {
    setRaw(next);
  }, []);

  const resetPercentages = useCallback(() => {
    setRaw({ ...DEFAULTS });
  }, []);

  const normalizedWeights = useMemo<Record<Category, number>>(
    () => ({
      affirmative: percentages.affirmative / 100,
      negative: percentages.negative / 100,
      neutral: percentages.neutral / 100,
      action: percentages.action / 100,
      mysterious: percentages.mysterious / 100,
    }),
    [percentages],
  );

  return { percentages, setPercentage, setPercentages, resetPercentages, normalizedWeights } as const;
}
