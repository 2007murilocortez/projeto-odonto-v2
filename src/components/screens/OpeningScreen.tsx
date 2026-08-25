import { useLayoutEffect, useRef } from 'react';
import type { OpeningScreen as OpeningContent } from '../../types/game';
import { Button } from '../ui/Button';

type OpeningScreenProps = {
  screen: OpeningContent;
  onStart: () => void;
};

export function OpeningScreen({ screen, onStart }: OpeningScreenProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-noite px-6 py-12 text-ink">
      <div className="flex w-full max-w-xl flex-col items-center gap-5 text-center">
        <p className="font-mono text-caption uppercase text-ink-muted">{screen.eyebrow}</p>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-display-lg outline-none"
        >
          {screen.title}
        </h1>
        <p className="font-body text-body text-ink">{screen.subtitle}</p>
        <p className="font-body text-body text-ink-muted">{screen.body}</p>
        <Button onClick={onStart}>{screen.cta}</Button>
      </div>
    </main>
  );
}
