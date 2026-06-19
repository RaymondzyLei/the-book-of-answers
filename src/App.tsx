import { useCallback, useEffect, useRef, useState } from 'react';
import { GlassCard } from './components/GlassCard';
import { QuestionInput } from './components/QuestionInput';
import { AnswerDisplay } from './components/AnswerDisplay';
import { SettingsPanel } from './components/SettingsPanel';
import { SettingsToggle } from './components/SettingsToggle';
import { ThemeToggle } from './components/ThemeToggle';
import { pickRandomAnswer } from './data/answers';
import { useAnswerWeights } from './hooks/useAnswerWeights';
import { useRandomBackground } from './hooks/useRandomBackground';
import { useTheme } from './hooks/useTheme';
import type { MorphState, Phase } from './types';

const AUTO_RESET_MS = 3000;
const SHRINK_MS = 500;
const EXPAND_MS = 500;

export default function App() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<Phase>('idle');
  const [morphState, setMorphState] = useState<MorphState | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);

  const shrinkTimerRef = useRef<number | null>(null);
  const expandTimerRef = useRef<number | null>(null);

  const [settingsOpen, setSettingsOpen] = useState(false);

  const { theme, toggleTheme } = useTheme();
  useRandomBackground(theme);

  const { percentages, setPercentage, setPercentages, resetPercentages, normalizedWeights } = useAnswerWeights();
  const weightsRef = useRef(normalizedWeights);
  weightsRef.current = normalizedWeights;

  const focusInput = useCallback(() => {
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  useEffect(() => {
    if (phase === 'idle') focusInput();
  }, [phase, focusInput]);

  // Auto reset after answer fully revealed.
  useEffect(() => {
    if (phase !== 'revealed') return;
    const t = window.setTimeout(() => reset(), AUTO_RESET_MS);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Cleanup morph timers on unmount.
  useEffect(() => {
    return () => {
      if (shrinkTimerRef.current !== null) {
        window.clearTimeout(shrinkTimerRef.current);
        shrinkTimerRef.current = null;
      }
      if (expandTimerRef.current !== null) {
        window.clearTimeout(expandTimerRef.current);
        expandTimerRef.current = null;
      }
    };
  }, []);

  // When keyboard pops up on mobile, scroll input into view.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => {
      if (phase === 'idle' && inputRef.current) {
        inputRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    };
    vv.addEventListener('resize', onResize);
    return () => vv.removeEventListener('resize', onResize);
  }, [phase]);

  const handleSubmit = useCallback(() => {
    const q = question.trim();
    if (!q || phase !== 'idle') return;
    setPhase('morphing');
    setMorphState('shrinking');
    shrinkTimerRef.current = window.setTimeout(() => {
      setMorphState('expanding');
      expandTimerRef.current = window.setTimeout(() => {
        setMorphState(null);
        setAnswer(pickRandomAnswer(weightsRef.current));
        setPhase('typing');
      }, EXPAND_MS);
    }, SHRINK_MS);
  }, [question, phase]);

  const handleBlackWhite = useCallback(() => {
    setPercentages({ affirmative: 50, negative: 50, neutral: 0, action: 0, mysterious: 0 });
  }, [setPercentages]);

  const reset = useCallback(() => {
    if (shrinkTimerRef.current !== null) {
      window.clearTimeout(shrinkTimerRef.current);
      shrinkTimerRef.current = null;
    }
    if (expandTimerRef.current !== null) {
      window.clearTimeout(expandTimerRef.current);
      expandTimerRef.current = null;
    }
    setMorphState(null);
    setQuestion('');
    setAnswer(null);
    setPhase('idle');
  }, []);

  const isIdle = phase === 'idle';
  const isMorphing = phase === 'morphing';
  const contentHidden = isMorphing;

  return (
    <div
      className="min-h-full w-full flex items-center justify-center
                 px-4 py-8 md:px-12 md:py-12
                 [padding-top:max(2rem,env(safe-area-inset-top))]
                 [padding-bottom:max(2rem,env(safe-area-inset-bottom))]"
    >
      <div className="w-full max-w-[min(100%,720px)]">
        <GlassCard
          morph={morphState}
          className="relative mx-auto p-6 md:p-12 min-h-[60vh] md:min-h-[420px]
                    flex flex-col items-center justify-center gap-8 md:gap-10"
        >
          {!isMorphing && (
            <>
              <div className="absolute top-3 left-3 md:top-5 md:left-5">
                <SettingsToggle onClick={() => setSettingsOpen(true)} />
              </div>
              <div className="absolute top-3 right-3 md:top-5 md:right-5">
                <ThemeToggle theme={theme} onToggle={toggleTheme} />
              </div>
            </>
          )}

          <h1 className="sr-only">答案之书</h1>

          <div
            className={`glass-content w-full flex flex-col items-center justify-center gap-6 ${
              contentHidden ? 'is-hidden' : ''
            }`}
          >
            {isIdle && (
              <div className="w-full animate-fade-in">
                <p className="text-center text-slate-400 dark:text-slate-500 text-sm md:text-base mb-6 tracking-widest uppercase">
                  答案之书
                </p>
                <QuestionInput
                  ref={inputRef}
                  value={question}
                  onChange={setQuestion}
                  onSubmit={handleSubmit}
                />
                <p className="text-center text-slate-400 dark:text-slate-500 text-xs mt-4">
                  按 Enter 揭示答案
                </p>
              </div>
            )}

            {(phase === 'typing' || phase === 'revealed') && answer && (
              <div className="w-full animate-fade-in">
                <AnswerDisplay
                  text={answer}
                  typing={phase === 'typing'}
                  onDoneTyping={() => setPhase('revealed')}
                  onReset={reset}
                />
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        percentages={percentages}
        onChange={setPercentage}
        onReset={resetPercentages}
        onBlackWhite={handleBlackWhite}
      />
    </div>
  );
}
