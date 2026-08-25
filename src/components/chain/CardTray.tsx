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
        'w-full min-w-0 rounded-md border p-2 md:p-4 lg:p-5',
        isOver ? 'border-oxigenio bg-tecido-alto' : 'border-line bg-tecido',
      ].join(' ')}
      aria-label="Bandeja de etapas"
    >
      <h2 className="mb-1 font-mono text-caption uppercase text-ink-muted md:mb-4">Etapas</h2>
      <div className="grid grid-cols-2 gap-2 md:gap-3">{children}</div>
    </section>
  );
}
