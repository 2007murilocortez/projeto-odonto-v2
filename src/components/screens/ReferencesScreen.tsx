import { useLayoutEffect, useRef } from 'react';
import { BIBLIOGRAPHY } from '../../data/references';
import { Button } from '../ui/Button';

type ReferencesScreenProps = {
  onBack: () => void;
};

export function ReferencesScreen({ onBack }: ReferencesScreenProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <main className="app-shell flex flex-col items-center bg-noite text-ink">
      <div className="flex w-full max-w-xl flex-col gap-4 md:gap-6">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-display outline-none"
        >
          Referências
        </h1>
        {BIBLIOGRAPHY.length === 0 ? (
          <p className="font-body text-body text-ink-muted">
            As referências serão adicionadas posteriormente.
          </p>
        ) : (
          <ol className="flex list-decimal flex-col gap-3 p-0 pl-5 font-body text-body">
            {BIBLIOGRAPHY.map((entry) => (
              <li key={entry}>{entry}</li>
            ))}
          </ol>
        )}
        <Button variant="secondary" onClick={onBack}>
          Voltar
        </Button>
      </div>
    </main>
  );
}
