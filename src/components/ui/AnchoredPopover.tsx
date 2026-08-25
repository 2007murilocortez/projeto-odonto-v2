import { useLayoutEffect, useRef, type KeyboardEvent, type RefObject } from 'react';

type AnchoredPopoverProps = {
  id: string;
  text: string;
  anchorRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  label: string;
  tone?: 'hint' | 'glossary';
};

export function AnchoredPopover({
  id,
  text,
  anchorRef,
  onClose,
  label,
  tone = 'hint',
}: AnchoredPopoverProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    const anchor = anchorRef.current;
    if (!panel || !anchor) return;

    const rect = anchor.getBoundingClientRect();
    const width = Math.min(window.innerWidth - 24, 24 * 16);
    let left = rect.left + rect.width / 2 - width / 2;
    left = Math.max(12, Math.min(left, window.innerWidth - width - 12));
    const bottom = window.innerHeight - rect.top + 8;

    panel.style.width = `${width}px`;
    panel.style.left = `${left}px`;
    panel.style.bottom = `${bottom}px`;
    panel.focus();
  }, [anchorRef, text]);

  useLayoutEffect(() => {
    function onKey(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function handlePanelKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Tab') {
      event.preventDefault();
      anchorRef.current?.focus();
    }
  }

  const toneClass =
    tone === 'hint'
      ? 'border-placa text-placa'
      : 'border-line text-ink';

  return (
    <>
      <div
        className="fixed inset-0 z-20"
        aria-hidden
        onPointerDown={onClose}
      />
      <div
        ref={panelRef}
        id={id}
        role="dialog"
        aria-label={label}
        tabIndex={-1}
        onKeyDown={handlePanelKey}
        onPointerDown={(event) => event.stopPropagation()}
        className={`fixed z-30 rounded-md border bg-tecido-alto px-4 py-3 shadow-lift outline-none ${toneClass}`}
        style={{ fontSize: 'var(--type-caption)', lineHeight: 1.45 }}
      >
        {text}
      </div>
    </>
  );
}
