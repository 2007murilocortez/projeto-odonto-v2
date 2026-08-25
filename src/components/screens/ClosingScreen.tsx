import { useLayoutEffect, useRef } from 'react';
import { SCIENTIFIC_NOTE } from '../../data/screens';
import type { ClosingScreen as ClosingContent } from '../../types/game';
import { Button } from '../ui/Button';

type ClosingScreenProps = {
  screen: ClosingContent;
  onRestart: () => void;
};

export function ClosingScreen({ screen, onRestart }: ClosingScreenProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-noite px-6 py-12 text-ink">
      <div className="flex w-full max-w-xl flex-col items-center gap-6 text-center">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-display-lg outline-none"
        >
          {screen.title}
        </h1>
        <ul className="flex list-none flex-col gap-3 p-0">
          {screen.recap.map((item) => (
            <li
              key={item}
              className="font-display text-display text-oxigenio"
              style={{ letterSpacing: 'var(--tracking-equation)' }}
            >
              {item}
            </li>
          ))}
        </ul>
        <p className="font-body text-body text-ink">{screen.body}</p>
        <Button onClick={onRestart}>{screen.cta}</Button>
        <p
          className="max-w-prose text-ink-muted"
          style={{ fontSize: 'var(--type-caption)', lineHeight: 1.45 }}
        >
          {SCIENTIFIC_NOTE}
        </p>
      </div>
    </main>
  );
}
