import { useCallback, useEffect, useRef, useState } from 'react';
import { GlassCard } from './components/GlassCard';
import { QuestionInput } from './components/QuestionInput';
import { AnswerDisplay } from './components/AnswerDisplay';
import { ThemeToggle } from './components/ThemeToggle';
import { pickRandomAnswer } from './data/answers';
import { useRandomBackground } from './hooks/useRandomBackground';
import { useTheme } from './hooks/useTheme';
import type { Answer, Phase } from './types';

const AUTO_RESET_MS = 3000;
const FADE_MS = 500;

export default function App() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<Phase>('idle');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<Answer | null>(null);

  useRandomBackground();
  const { theme, toggleTheme } = useTheme();

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
    setPhase('fading');
    window.setTimeout(() => {
      setAnswer(pickRandomAnswer());
      setPhase('typing');
    }, FADE_MS);
  }, [question, phase]);

  const reset = useCallback(() => {
    setQuestion('');
    setAnswer(null);
    setPhase('idle');
  }, []);

  const isIdle = phase === 'idle';
  const isFading = phase === 'fading';

  return (
    <div
      className="min-h-full w-full flex items-center justify-center
                 px-4 py-8 md:px-12 md:py-12
                 [padding-top:max(2rem,env(safe-area-inset-top))]
                 [padding-bottom:max(2rem,env(safe-area-inset-bottom))]"
    >
      <div className="w-full max-w-[min(100%,720px)]">
        <GlassCard className="relative p-6 md:p-12 min-h-[60vh] md:min-h-[420px]
                              flex flex-col items-center justify-center gap-8 md:gap-10">
          <div className="absolute top-3 right-3 md:top-5 md:right-5">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>

          <h1 className="sr-only">答案之书</h1>

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

          {isFading && (
            <p
              key={question}
              className="text-center text-slate-700 dark:text-slate-200 animate-fade-out
                         text-[clamp(1.25rem,4vw,1.75rem)]
                         leading-relaxed"
            >
              {question}
            </p>
          )}

          {(phase === 'typing' || phase === 'revealed') && answer && (
            <div className="w-full animate-fade-in">
              <AnswerDisplay
                text={answer.text}
                typing={phase === 'typing'}
                onDoneTyping={() => setPhase('revealed')}
                onReset={reset}
              />
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
