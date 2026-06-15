import { useEffect, useRef, useState } from 'react';

interface UseTypewriterOptions {
  text: string;
  /** ms per character; default 135ms */
  rate?: number;
  /** When true, the typewriter animates. When false, output is preserved (frozen). */
  enabled: boolean;
  /** Fires once when the full string has been displayed. */
  onDone?: () => void;
}

export function useTypewriter({
  text,
  rate = 135,
  enabled,
  onDone,
}: UseTypewriterOptions) {
  const [output, setOutput] = useState('');
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  // Only reset when the target text changes.
  useEffect(() => {
    setOutput('');
  }, [text]);

  useEffect(() => {
    if (!enabled || !text) return;
    let i = 0;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      if (now - last >= rate) {
        i += 1;
        setOutput(text.slice(0, i));
        last = now;
        if (i >= text.length) {
          onDoneRef.current?.();
          return;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, rate, enabled]);

  return output;
}
