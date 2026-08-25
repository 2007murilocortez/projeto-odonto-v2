import { createContext, useContext, useId, useRef, useState, type ReactNode } from 'react';
import type { GlossaryTerm } from '../../data/education';
import { definitionOf, splitGlossary } from '../../utils/glossary';
import { AnchoredPopover } from './AnchoredPopover';

type GlossaryContextValue = {
  used: Set<string>;
  openTerm: string | null;
  setOpenTerm: (term: string | null) => void;
};

const GlossaryUsedContext = createContext<GlossaryContextValue | null>(null);

type GlossaryScopeProps = {
  children: ReactNode;
};

export function GlossaryScope({ children }: GlossaryScopeProps) {
  const used = new Set<string>();
  const [openTerm, setOpenTerm] = useState<string | null>(null);
  return (
    <GlossaryUsedContext.Provider value={{ used, openTerm, setOpenTerm }}>
      {children}
    </GlossaryUsedContext.Provider>
  );
}

type GlossaryTextProps = {
  text: string;
};

export function GlossaryText({ text }: GlossaryTextProps) {
  const ctx = useContext(GlossaryUsedContext);
  const used = ctx?.used ?? new Set<string>();
  const pieces = splitGlossary(text, used);

  return (
    <>
      {pieces.map((piece, index) =>
        piece.kind === 'text' ? (
          <span key={`t-${index}`}>{piece.value}</span>
        ) : (
          <GlossaryTermMark key={`g-${piece.term}`} term={piece.term} label={piece.value} />
        ),
      )}
    </>
  );
}

type GlossaryTermMarkProps = {
  term: GlossaryTerm;
  label: string;
};

function GlossaryTermMark({ term, label }: GlossaryTermMarkProps) {
  const ctx = useContext(GlossaryUsedContext);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const descriptionId = useId();
  const [localOpen, setLocalOpen] = useState(false);
  const definition = definitionOf(term);
  const open = ctx ? ctx.openTerm === term : localOpen;

  function setOpen(next: boolean) {
    if (ctx) {
      ctx.setOpenTerm(next ? term : null);
      return;
    }
    setLocalOpen(next);
  }

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="inline cursor-pointer border-0 bg-transparent p-0 text-left text-inherit underline decoration-dotted decoration-[var(--ink-muted)] underline-offset-4 [font:inherit]"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-haspopup="dialog"
        aria-describedby={descriptionId}
        onClick={() => setOpen(!open)}
      >
        {label}
      </button>
      <span id={descriptionId} className="sr-only">
        {definition}
      </span>
      {open ? (
        <AnchoredPopover
          id={panelId}
          text={definition}
          anchorRef={triggerRef}
          onClose={close}
          label={`Definição de ${term}`}
          tone="glossary"
        />
      ) : null}
    </>
  );
}
