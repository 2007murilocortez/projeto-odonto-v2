import { useDraggable, useDroppable } from '@dnd-kit/core';
import { Check, GripVertical } from 'lucide-react';
import type { MouseEvent } from 'react';
import type { ChainStep } from '../../types/game';

type ChainCardProps = {
  step: ChainStep;
  slotNumber?: number;
  disabled?: boolean;
  isLocked?: boolean;
  isSelected?: boolean;
  isOverlay?: boolean;
  isCorrect?: boolean;
  isError?: boolean;
  isSuccess?: boolean;
  reducedMotion?: boolean;
  onSelect?: () => void;
};

export function ChainCard({
  step,
  slotNumber,
  disabled = false,
  isLocked = false,
  isSelected = false,
  isOverlay = false,
  isCorrect = false,
  isError = false,
  isSuccess = false,
  reducedMotion = false,
  onSelect,
}: ChainCardProps) {
  const draggableId = isOverlay ? `${step.id}-overlay` : step.id;
  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id: draggableId,
    disabled: disabled || isOverlay || isLocked,
  });
  const { setNodeRef: setDropRef } = useDroppable({
    id: draggableId,
    disabled: disabled || isOverlay || isLocked,
  });

  function setNodeRef(node: HTMLElement | null) {
    setDragRef(node);
    setDropRef(node);
  }

  const dragging = isOverlay || isDragging;
  const inactive = disabled || isLocked;

  function handleClick(event: MouseEvent<HTMLDivElement>) {
    event.stopPropagation();
    if (inactive || isOverlay) return;
    onSelect?.();
  }

  const className = [
    'flex w-full min-h-11 items-center gap-2 rounded-md border px-3 py-2 text-left font-body text-card md:min-h-[72px] md:items-start md:gap-3 md:px-4 md:py-4',
    'select-none',
    isSuccess
      ? 'border-oxigenio'
      : isCorrect || isLocked
        ? 'border-oxigenio-dim'
        : isSelected
          ? 'border-placa'
          : 'border-line',
    isSuccess && reducedMotion ? 'animate-success-fade' : '',
    isError ? 'animate-error-flash' : '',
    dragging ? 'scale-[1.03] -rotate-[1.2deg] cursor-grabbing opacity-95 shadow-lift' : '',
    !dragging && !inactive ? 'hover:-translate-y-[2px] hover:border-oxigenio-dim' : '',
    inactive ? 'cursor-default' : 'cursor-grab',
  ]
    .filter(Boolean)
    .join(' ');

  const backgroundColor = isSuccess
    ? 'color-mix(in srgb, var(--tecido) 96%, white)'
    : isSelected
      ? 'var(--tecido-alto)'
      : 'var(--tecido)';

  const face = (
    <>
      <span className="mt-0.5 shrink-0 text-ink-muted" aria-hidden>
        {isLocked || isSuccess ? (
          <Check size={16} strokeWidth={2} className="text-oxigenio-dim" />
        ) : (
          <GripVertical size={16} strokeWidth={1.75} />
        )}
      </span>
      {slotNumber ? (
        <span className="mt-0.5 shrink-0 font-mono text-caption text-ink-muted">
          {String(slotNumber).padStart(2, '0')}
        </span>
      ) : null}
      <span className="min-w-0 text-ink" style={{ textWrap: 'balance' }}>
        {step.label}
      </span>
    </>
  );

  if (isOverlay) {
    return (
      <div className={className} style={{ backgroundColor }}>
        {face}
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={{ backgroundColor, opacity: isDragging ? 0.35 : 1 }}
      className={className}
      onClick={handleClick}
      {...listeners}
      {...attributes}
      tabIndex={inactive ? -1 : 0}
      aria-disabled={inactive}
      aria-pressed={isSelected}
      aria-roledescription={isLocked ? 'cartão confirmado' : 'cartão arrastável'}
      aria-label={
        isLocked && slotNumber
          ? `${step.label}, posição ${slotNumber}, confirmada`
          : slotNumber
            ? `Etapa ${slotNumber}: ${step.label}`
            : `Etapa: ${step.label}`
      }
    >
      {face}
    </div>
  );
}
