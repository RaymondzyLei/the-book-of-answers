import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Category } from '../data/answers';
import type { Percentages } from '../hooks/useAnswerWeights';

interface CategoryMeta {
  key: Category;
  label: string;
  desc: string;
}

const CATEGORIES: CategoryMeta[] = [
  { key: 'affirmative', label: '肯定类', desc: '积极的、鼓励的答案' },
  { key: 'negative', label: '否定类', desc: '消极的、否定的答案' },
  { key: 'neutral', label: '中立类', desc: '中立的、哲学性的答案' },
  { key: 'action', label: '行动类', desc: '行动导向的建议' },
  { key: 'mysterious', label: '神秘类', desc: '神秘的、命运相关的答案' },
];

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  percentages: Percentages;
  onChange: (category: Category, value: number) => void;
  onReset: () => void;
  onBlackWhite: () => void;
}

export function SettingsPanel({ open, onClose, percentages, onChange, onReset, onBlackWhite }: SettingsPanelProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setVisible(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const handleTransitionEnd = useCallback(() => {
    if (!visible && open) onClose();
  }, [visible, open, onClose]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) setVisible(false);
    },
    [],
  );

  // After exit transition completes and parent sets open=false, unmount.
  if (!open && !visible) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4
                  bg-slate-900/30 dark:bg-black/50
                  backdrop-blur-sm
                  transition-opacity duration-300
                  ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={handleBackdropClick}
      onTransitionEnd={handleTransitionEnd}
    >
      <div
        className={`w-full max-w-sm
                    bg-white/70 dark:bg-slate-800/70
                    backdrop-blur-xl
                    border border-white/60 dark:border-slate-600/30
                    rounded-2xl shadow-2xl
                    p-6 md:p-8
                    transition-[transform,opacity] duration-300
                    ${visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            答案概率设置
          </h2>
          <button
            type="button"
            onClick={() => setVisible(false)}
            aria-label="关闭设置"
            className="w-8 h-8 rounded-full
                       flex items-center justify-center
                       text-slate-400 hover:text-slate-600
                       dark:text-slate-500 dark:hover:text-slate-300
                       hover:bg-slate-100 dark:hover:bg-slate-700
                       transition-colors cursor-pointer"
          >
            <svg
              width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Sliders */}
        <div className="space-y-5">
          {CATEGORIES.map((cat) => (
            <div key={cat.key}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {cat.label}
                </span>
                <span className="text-sm font-mono font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                  {percentages[cat.key]}%
                </span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-1.5">{cat.desc}</p>
              <input
                type="range"
                min="0"
                max="100"
                value={percentages[cat.key]}
                onChange={(e) => onChange(cat.key, Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer
                           bg-slate-200 dark:bg-slate-600
                           accent-sky-500 dark:accent-sky-400
                           [&::-webkit-slider-thumb]:appearance-none
                           [&::-webkit-slider-thumb]:w-4
                           [&::-webkit-slider-thumb]:h-4
                           [&::-webkit-slider-thumb]:rounded-full
                           [&::-webkit-slider-thumb]:bg-sky-500
                           [&::-webkit-slider-thumb]:dark:bg-sky-400
                           [&::-webkit-slider-thumb]:shadow-md
                           [&::-webkit-slider-thumb]:cursor-pointer"
              />
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-2">
          <button
            type="button"
            onClick={onBlackWhite}
            className="w-full py-2.5 rounded-xl
                       text-sm font-medium
                       text-sky-600 dark:text-sky-400
                       hover:text-sky-700 dark:hover:text-sky-300
                       bg-sky-50 dark:bg-sky-500/10
                       hover:bg-sky-100 dark:hover:bg-sky-500/20
                       border border-sky-200 dark:border-sky-500/20
                       transition-colors cursor-pointer"
          >
            非黑即白
          </button>
          <button
            type="button"
            onClick={onReset}
            className="w-full py-2.5 rounded-xl
                       text-sm text-slate-500 dark:text-slate-400
                       hover:text-slate-700 dark:hover:text-slate-200
                       hover:bg-slate-100 dark:hover:bg-slate-700/50
                       border border-slate-200 dark:border-slate-600/30
                       transition-colors cursor-pointer"
          >
            恢复默认
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
