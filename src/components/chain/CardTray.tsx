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
        'rounded-md border p-4 md:p-5',
        isOver ? 'border-oxigenio bg-tecido-alto' : 'border-line bg-tecido',
      ].join(' ')}
      aria-label="Bandeja de etapas"
    >
      <h2 className="mb-4 font-mono text-caption uppercase text-ink-muted">Etapas</h2>
      <div className="flex gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-2 md:overflow-visible">
        {children}
      </div>
    </section>
  );
}
