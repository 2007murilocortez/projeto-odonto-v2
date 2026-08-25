import { useDroppable } from '@dnd-kit/core';
import type { ReactNode } from 'react';
import { TRAY_ID } from '../../utils/board';

type CardTrayProps = {
  children: ReactNode;
  isOver: boolean;
  onReturn: () => void;
};

export function CardTray({ children, isOver, onReturn }: CardTrayProps) {
  const { setNodeRef } = useDroppable({ id: TRAY_ID });

  return (
    <section
      ref={setNodeRef}
      onClick={onReturn}
      className={[
        'rounded-md border p-2 md:p-4 lg:p-5',
        isOver ? 'border-oxigenio bg-tecido-alto' : 'border-line bg-tecido',
      ].join(' ')}
      aria-label="Bandeja de etapas"
    >
      <h2 className="mb-1 font-mono text-caption uppercase text-ink-muted md:mb-4">Etapas</h2>
      <div className="flex h-[3.5rem] snap-x snap-mandatory gap-2 overflow-x-auto overflow-y-hidden overscroll-x-contain touch-pan-x md:grid md:h-auto md:snap-none md:grid-cols-2 md:gap-3 md:overflow-visible md:overscroll-auto">
        {children}
      </div>
    </section>
  );
}
