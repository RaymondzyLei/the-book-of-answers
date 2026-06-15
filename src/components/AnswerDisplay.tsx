import { useTypewriter } from '../hooks/useTypewriter';

interface AnswerDisplayProps {
  text: string;
  typing: boolean;
  onDoneTyping: () => void;
  onReset: () => void;
}

export function AnswerDisplay({ text, typing, onDoneTyping, onReset }: AnswerDisplayProps) {
  const displayed = useTypewriter({ text, enabled: typing, onDone: onDoneTyping });

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <p
        className="text-center text-slate-800 dark:text-slate-100
                   font-medium tracking-tight text-balance break-words px-2
                   text-[clamp(2rem,10vw,3rem)] md:text-[clamp(2.5rem,8vw,4rem)]
                   leading-[1.4] md:leading-[1.45] min-h-[3em]"
        aria-live="polite"
        aria-atomic="true"
      >
        <span>{displayed}</span>
        {typing && displayed.length < text.length && (
          <span
            className="inline-block w-[0.08em] h-[0.9em] align-[-0.1em] ml-1
                       bg-slate-700 dark:bg-slate-100 animate-caret-blink"
            aria-hidden="true"
          />
        )}
      </p>
      {!typing && (
        <button
          type="button"
          onClick={onReset}
          className="px-5 py-2.5 rounded-full text-sm font-medium
                     text-slate-700 dark:text-slate-200
                     bg-white/60 hover:bg-white/85 active:bg-white/95
                     dark:bg-slate-800/50 dark:hover:bg-slate-700/70 dark:active:bg-slate-700/90
                     border border-white/70 dark:border-slate-600/40
                     backdrop-blur-md
                     transition-colors duration-200 cursor-pointer
                     min-h-[44px]"
        >
          再问一次
        </button>
      )}
    </div>
  );
}
