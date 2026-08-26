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
    <main className="app-shell flex min-h-dvh flex-col justify-center bg-noite text-ink lg:h-dvh">
      <div className="mx-auto w-full max-w-content">
        <div className="grid grid-cols-[1.25rem_minmax(0,1fr)] items-stretch gap-x-3 md:grid-cols-[6rem_minmax(0,36rem)] md:gap-x-8 lg:grid-cols-[8rem_minmax(0,40rem)] lg:gap-x-12">
          <OpeningSpine reducedMotion={reducedMotion} />

          <div className="flex flex-col items-start text-left">
            <p
              className="font-mono text-caption uppercase text-ink-muted"
              style={{ letterSpacing: 'var(--tracking-caption)' }}
            >
              {screen.eyebrow}
            </p>
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="mt-4 font-display text-display-lg outline-none md:mt-5 lg:mt-8"
            >
              <TitleWithBreak title={screen.title} />
            </h1>
            <div className="mt-4 flex flex-col gap-3 md:mt-5 lg:mt-8 lg:gap-4">
              <p className="font-body text-body text-ink">{screen.subtitle}</p>
              <p className="font-body text-body text-ink">{screen.body}</p>
              <p
                className="hidden text-ink-muted [@media(pointer:coarse)]:block"
                style={{ fontSize: 'var(--type-caption)', lineHeight: 1.45 }}
              >
                No celular, toque em uma etapa e depois na posição.
              </p>
            </div>
            <div
              className="mt-8 max-w-full font-body lg:mt-10"
              style={{ fontSize: 'var(--type-caption)', lineHeight: 1.45 }}
            >
              <p className="text-ink-muted [overflow-wrap:normal] [word-break:normal]">
                {screen.affiliation.author}
              </p>
              <p
                className="[overflow-wrap:normal] [word-break:normal]"
                style={{ color: 'color-mix(in srgb, var(--ink-muted) 72%, var(--noite))' }}
              >
                {screen.affiliation.course} · {screen.affiliation.institution}
              </p>
            </div>
            <div className="mt-6 lg:mt-8">
              <Button onClick={onStart}>{screen.cta}</Button>
            </div>
          </div>

          <footer className="col-start-2 pt-8 md:pt-10 lg:pt-12">
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
