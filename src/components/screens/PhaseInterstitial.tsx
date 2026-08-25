import { useLayoutEffect, useRef } from 'react';

type PhaseInterstitialProps = {
  phase: 1 | 2;
};

const COPY = {
  1: 'FASE 1 — DPOC',
  2: 'FASE 2 — APNEIA OBSTRUTIVA DO SONO',
} as const;

export function PhaseInterstitial({ phase }: PhaseInterstitialProps) {
  const headingRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <main className="app-shell flex items-center justify-center bg-noite text-ink">
      <p
        ref={headingRef}
        tabIndex={-1}
        className="animate-success-in px-2 text-center font-display text-display-lg uppercase outline-none"
        style={{ letterSpacing: 'var(--tracking-equation)' }}
      >
        {COPY[phase]}
      </p>
    </main>
  );
}
