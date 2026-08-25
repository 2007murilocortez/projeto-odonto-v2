import { useId, useLayoutEffect, useRef, useState } from 'react';
import { SCIENTIFIC_NOTE, SCIENTIFIC_NOTE_SUMMARY } from '../../data/screens';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import type { OpeningScreen as OpeningContent } from '../../types/game';
import { OpeningSpine } from '../opening/OpeningSpine';
import { AnchoredPopover } from '../ui/AnchoredPopover';
import { Button } from '../ui/Button';

type OpeningScreenProps = {
  screen: OpeningContent;
  onStart: () => void;
};

function TitleWithBreak({ title }: { title: string }) {
  const separator = ' × ';
  const index = title.indexOf(separator);
  if (index < 0) return <>{title}</>;
  return (
    <>
      {title.slice(0, index)} ×
      <br />
      {title.slice(index + separator.length)}
    </>
  );
}

export function OpeningScreen({ screen, onStart }: OpeningScreenProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const noteTriggerRef = useRef<HTMLButtonElement>(null);
  const notePanelId = useId();
  const [noteOpen, setNoteOpen] = useState(false);
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    headingRef.current?.focus();
  }, []);

  function closeNote() {
    setNoteOpen(false);
    noteTriggerRef.current?.focus();
  }

  return (
    <main className="app-shell flex min-h-dvh flex-col bg-noite text-ink">
      <div className="mx-auto flex w-full max-w-content flex-1 flex-col justify-center">
        <div className="grid grid-cols-[1.25rem_minmax(0,1fr)] items-stretch gap-x-3 md:grid-cols-[6rem_minmax(0,36rem)] md:gap-x-8 lg:grid-cols-[8rem_minmax(0,40rem)] lg:gap-x-12">
          <OpeningSpine reducedMotion={reducedMotion} />

          <div className="flex flex-col items-start gap-4 text-left md:gap-5">
            <p
              className="font-mono text-caption uppercase text-ink-muted"
              style={{ letterSpacing: 'var(--tracking-caption)' }}
            >
              {screen.eyebrow}
            </p>
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="font-display text-display-lg outline-none"
            >
              <TitleWithBreak title={screen.title} />
            </h1>
            <p className="font-body text-body text-ink">{screen.subtitle}</p>
            <p className="font-body text-body text-ink">{screen.body}</p>
            <p
              className="text-ink-muted"
              style={{ fontSize: 'var(--type-caption)', lineHeight: 1.45 }}
            >
              {screen.affiliation}
            </p>
            <Button onClick={onStart}>{screen.cta}</Button>
          </div>

          <footer className="col-start-2 pt-8 md:pt-10">
            <button
              ref={noteTriggerRef}
              type="button"
              className="inline-block min-h-11 border-0 bg-transparent p-0 text-left text-ink-muted underline decoration-dotted decoration-[var(--ink-muted)] underline-offset-4 [font:inherit]"
              style={{ fontSize: 'var(--type-caption)', lineHeight: 1.45 }}
              aria-expanded={noteOpen}
              aria-controls={noteOpen ? notePanelId : undefined}
              aria-haspopup="dialog"
              aria-label="Ler a nota científica completa"
              onClick={() => setNoteOpen((value) => !value)}
            >
              {SCIENTIFIC_NOTE_SUMMARY}
            </button>
            {noteOpen ? (
              <AnchoredPopover
                id={notePanelId}
                text={SCIENTIFIC_NOTE}
                anchorRef={noteTriggerRef}
                onClose={closeNote}
                label="Nota científica"
                tone="glossary"
              />
            ) : null}
          </footer>
        </div>
      </div>
    </main>
  );
}
