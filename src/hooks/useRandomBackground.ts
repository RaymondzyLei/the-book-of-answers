import { useEffect, useMemo } from 'react';
import type { Theme } from './useTheme';

type Palette = readonly [string, string, string];

const LIGHT_PALETTES: readonly Palette[] = [
  ['#e0f2fe', '#f0f9ff', '#ffffff'],
  ['#dbeafe', '#e0e7ff', '#e0f2fe'],
  ['#f0f9ff', '#ecfeff', '#f5f3ff'],
  ['#ede9fe', '#dbeafe', '#cffafe'],
];

const DARK_PALETTES: readonly Palette[] = [
  ['#0f172a', '#1e293b', '#0c4a6e'],
  ['#0c4a6e', '#312e81', '#164e63'],
  ['#1e3a8a', '#1e293b', '#0c4a6e'],
  ['#0f172a', '#075985', '#1e1b4b'],
];

function buildNoiseSvg(seed: number): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'>
    <filter id='n'>
      <feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='${seed}'/>
      <feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 0'/>
    </filter>
    <rect width='100%' height='100%' filter='url(#n)'/>
  </svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}

function pickPalette(theme: Theme): Palette {
  const pool = theme === 'dark' ? DARK_PALETTES : LIGHT_PALETTES;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function useRandomBackground(theme: Theme) {
  const angle = useMemo(() => 135 + (Math.random() * 60 - 30), []);
  const seed = useMemo(() => Math.floor(Math.random() * 10000), []);
  const palette = useMemo(() => pickPalette(theme), [theme]);

  useEffect(() => {
    document.body.style.setProperty('--bg-angle', `${Math.round(angle)}deg`);
    document.body.style.setProperty('--noise-url', buildNoiseSvg(seed));
    document.body.style.setProperty('--bg-stop-1', palette[0]);
    document.body.style.setProperty('--bg-stop-2', palette[1]);
    document.body.style.setProperty('--bg-stop-3', palette[2]);
  }, [angle, seed, palette]);

  return { angle, seed, palette };
}
