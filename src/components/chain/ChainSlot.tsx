import { useDroppable } from '@dnd-kit/core';
import type { ReactNode } from 'react';
import { slotId } from '../../utils/board';

type ChainSlotProps = {
  index: number;
  isEmpty: boolean;
  isOver: boolean;
  isLocked?: boolean;
  isRefused?: boolean;
  occupiedLabel?: string;
  children: ReactNode;
  onPlace: () => void;
};

export function ChainSlot({
  index,
  isEmpty,
  isOver,
  isLocked = false,
  isRefused = false,
  occupiedLabel,
  children,
  onPlace,
}: ChainSlotProps) {
  const { setNodeRef } = useDroppable({ id: slotId(index) });
  const position = index + 1;
  const ariaLabel = isEmpty
    ? `Posição ${position} da cadeia, vazia`
    : `Posição ${position} da cadeia, ocupada por ${occupiedLabel ?? ''}`;

  return (
    <div
      ref={setNodeRef}
      role="group"
      aria-label={ariaLabel}
      onClick={onPlace}
      className={[
        'relative min-h-11 w-full rounded-md border border-dashed transition-colors md:min-h-[72px]',
        isEmpty ? 'p-1' : 'p-0',
        isRefused ? 'animate-refuse-pulse' : '',
        isOver && isLocked
          ? 'border-line bg-tecido'
          : isOver
            ? 'border-oxigenio bg-tecido-alto'
            : 'border-line bg-transparent',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {isEmpty ? (
        <div className="flex min-h-11 items-center gap-2 px-3 py-2 md:min-h-[72px] md:gap-3 md:py-3">
          <span className="font-mono text-caption text-ink-muted">
            {String(position).padStart(2, '0')}
          </span>
          <span className="font-body text-card text-ink-muted">Arraste uma etapa</span>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
