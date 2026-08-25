import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import type { QuizOptionId, QuizScreen as QuizContent } from '../../types/game';
import { Button } from '../ui/Button';

type QuizScreenProps = {
  screen: QuizContent;
  onAnswer: (answer: QuizOptionId) => void;
  onComplete: () => void;
};

export function QuizScreen({ screen, onAnswer, onComplete }: QuizScreenProps) {
  const reducedMotion = useReducedMotion();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const [picked, setPicked] = useState<QuizOptionId | null>(null);
  const [status, setStatus] = useState<'idle' | 'wrong' | 'right'>('idle');
  const completedRef = useRef(false);

  useLayoutEffect(() => {
    headingRef.current?.focus();
  }, []);

  useLayoutEffect(() => {
    if (status !== 'right') return;
    feedbackRef.current?.focus();
  }, [status]);

  useEffect(() => {
    if (status !== 'right' || reducedMotion) return;
    const timeoutId = window.setTimeout(() => {
      if (completedRef.current) return;
      completedRef.current = true;
      onComplete();
    }, 1800);
    return () => window.clearTimeout(timeoutId);
  }, [status, reducedMotion, onComplete]);

  function choose(id: QuizOptionId) {
    if (status === 'right') return;
    const option = screen.options.find((item) => item.id === id);
    setPicked(id);
    onAnswer(id);
    if (option?.correct) {
      setStatus('right');
      return;
    }
    setStatus('wrong');
  }

  const feedback =
    status === 'right' ? screen.feedback.correct : status === 'wrong' ? screen.feedback.incorrect : null;
  const locked = status === 'right';

  return (
    <main className="app-shell flex flex-col items-center justify-center bg-noite text-ink">
      <div className="flex w-full max-w-xl flex-col gap-4 md:gap-6">
        <p className="font-mono text-caption uppercase text-ink-muted">{screen.eyebrow}</p>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-display outline-none"
        >
          {screen.question}
        </h1>
        <div className="flex flex-col gap-3" role="group" aria-label="Opções">
          {screen.options.map((option) => {
            const selected = picked === option.id;
            const border =
              selected && status === 'right'
                ? 'border-oxigenio'
                : selected && status === 'wrong'
                  ? 'border-inflamacao'
                  : 'border-line';
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => choose(option.id)}
                aria-disabled={locked || undefined}
                aria-pressed={selected}
                className={`flex min-h-11 items-center gap-3 rounded-md border bg-tecido px-4 py-3 text-left font-body text-card md:gap-4 md:px-5 md:py-4 ${border} ${locked ? 'pointer-events-none' : ''}`}
              >
                <span className="font-mono text-caption text-ink-muted">{option.id}</span>
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
        {feedback ? (
          <div
            ref={feedbackRef}
            tabIndex={-1}
            aria-live="polite"
            aria-atomic="true"
            className={status === 'right' ? 'text-oxigenio' : 'text-inflamacao'}
          >
            {feedback}
          </div>
        ) : null}
        {status === 'right' && reducedMotion ? (
          <Button
            onClick={() => {
              if (completedRef.current) return;
              completedRef.current = true;
              onComplete();
            }}
          >
            Avançar
          </Button>
        ) : null}
      </div>
    </main>
  );
}
