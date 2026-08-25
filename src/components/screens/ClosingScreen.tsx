import { useLayoutEffect, useRef, useState } from 'react';
import { chainScreens, SCIENTIFIC_NOTE } from '../../data/screens';
import type { ClosingScreen as ClosingContent } from '../../types/game';
import { Button } from '../ui/Button';
import { GlossaryScope, GlossaryText } from '../ui/GlossaryText';
import { ReferencesScreen } from './ReferencesScreen';

type ClosingScreenProps = {
  screen: ClosingContent;
  onRestart: () => void;
};

export function ClosingScreen({ screen, onRestart }: ClosingScreenProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [showReferences, setShowReferences] = useState(false);

  useLayoutEffect(() => {
    if (showReferences) return;
    headingRef.current?.focus();
  }, [showReferences]);

  if (showReferences) {
    return <ReferencesScreen onBack={() => setShowReferences(false)} />;
  }

  return (
    <main className="app-shell flex flex-col items-center justify-center bg-noite text-ink">
      <div className="flex w-full max-w-xl flex-col items-center gap-4 text-center md:gap-6">
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
        <ol className="flex w-full list-none flex-col gap-3 p-0 text-left">
          <GlossaryScope>
            {chainScreens.map((chain) => (
              <li key={chain.id} className="rounded-md border border-line bg-tecido px-3 py-2">
                <p
                  className="font-mono text-caption uppercase text-ink-muted"
                  style={{ letterSpacing: 'var(--tracking-caption)' }}
                >
                  {chain.equation.left} → {chain.equation.right}
                </p>
                <ol className="mt-1 flex list-none flex-col gap-0.5 p-0 font-body text-ink" style={{ fontSize: 'var(--type-caption)', lineHeight: 1.45 }}>
                  {[...chain.steps]
                    .sort((a, b) => a.order - b.order)
                    .map((step) => (
                      <li key={step.id}>
                        {String(step.order).padStart(2, '0')} · <GlossaryText text={step.label} />
                      </li>
                    ))}
                </ol>
              </li>
            ))}
          </GlossaryScope>
        </ol>
        <p className="font-body text-body text-ink">{screen.body}</p>
        <Button onClick={onRestart}>{screen.cta}</Button>
        <Button variant="secondary" onClick={() => setShowReferences(true)}>
          Referências
        </Button>
        <p
          id="nota-cientifica"
          className="max-w-prose text-ink-muted"
          style={{ fontSize: 'var(--type-caption)', lineHeight: 1.45 }}
        >
          {SCIENTIFIC_NOTE}
        </p>
      </div>
    </main>
  );
}
