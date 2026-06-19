import { forwardRef } from 'react';

interface QuestionInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}

export const QuestionInput = forwardRef<HTMLInputElement, QuestionInputProps>(
  function QuestionInput({ value, onChange, onSubmit }, ref) {
    const empty = !value.trim();

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (empty) return;
          onSubmit();
        }}
        className="w-full"
      >
        <label htmlFor="question" className="sr-only">
          请输入你的问题
        </label>
        <div
          className="flex items-center gap-2 rounded-full
                     bg-white/60 dark:bg-slate-800/40
                     border border-white/70 dark:border-slate-600/40
                     backdrop-blur-md
                     pl-5 pr-1.5 py-1.5
                     transition-colors duration-200"
        >
          <input
            id="question"
            ref={ref}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="向答案之书提问…"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="send"
            className="flex-1 min-w-0 bg-transparent text-slate-800 dark:text-slate-100
                       placeholder:text-slate-400 dark:placeholder:text-slate-500
                       text-base md:text-lg leading-relaxed outline-none border-none focus:ring-0
                       px-0 py-2"
          />
          <button
            type="submit"
            disabled={empty}
            aria-label="提交问题"
            className="shrink-0 inline-flex items-center justify-center
                       w-10 h-10 md:w-11 md:h-11 rounded-full
                       bg-sky-500 hover:bg-sky-600 active:bg-sky-700
                       disabled:bg-slate-300 disabled:cursor-not-allowed
                       dark:bg-sky-500 dark:hover:bg-sky-400 dark:active:bg-sky-300
                       dark:disabled:bg-slate-700
                       text-white
                       transition-colors duration-200 cursor-pointer
                       min-h-[44px] min-w-[44px]"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="m13 5 7 7-7 7" />
            </svg>
          </button>
        </div>
      </form>
    );
  },
);
