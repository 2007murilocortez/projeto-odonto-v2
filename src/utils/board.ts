export const SLOT_COUNT = 4;
export const TRAY_ID = 'tray';

export type Board = {
  slots: (string | null)[];
  tray: string[];
};

export function slotId(index: number): string {
  return `slot-${index}`;
}

export function parseSlotId(id: string): number | null {
  const match = /^slot-([0-3])$/.exec(id);
  return match ? Number(match[1]) : null;
}

export function emptyBoard(tray: string[]): Board {
  return {
    slots: Array.from({ length: SLOT_COUNT }, () => null),
    tray: [...tray],
  };
}

export function allCardIds(board: Board): string[] {
  return [...board.slots.filter((id): id is string => id !== null), ...board.tray];
}

export function resolveDestination(overId: string, board: Board): 'tray' | number | null {
  if (overId === TRAY_ID) return 'tray';
  const slot = parseSlotId(overId);
  if (slot !== null) return slot;
  const occupiedSlot = board.slots.indexOf(overId);
  if (occupiedSlot >= 0) return occupiedSlot;
  if (board.tray.includes(overId)) return 'tray';
  return null;
}

export function moveCard(
  board: Board,
  cardId: string,
  dest: 'tray' | number,
  lockedIds: ReadonlySet<string>,
): Board {
  if (lockedIds.has(cardId)) return board;

  const originSlot = board.slots.indexOf(cardId);
  const originTrayIndex = board.tray.indexOf(cardId);
  if (originSlot < 0 && originTrayIndex < 0) return board;

  if (dest === 'tray') {
    if (originTrayIndex >= 0) return board;
    return {
      slots: board.slots.map((id) => (id === cardId ? null : id)),
      tray: [...board.tray, cardId],
    };
  }

  if (dest < 0 || dest >= SLOT_COUNT) return board;

  const occupant = board.slots[dest] ?? null;
  if (occupant === cardId) return board;
  if (occupant && lockedIds.has(occupant)) return board;

  const slots = [...board.slots];
  const tray = [...board.tray];

  if (originSlot >= 0) {
    slots[originSlot] = null;
  } else {
    tray.splice(originTrayIndex, 1);
  }

  if (occupant) {
    if (originSlot >= 0) {
      slots[originSlot] = occupant;
    } else {
      tray.splice(originTrayIndex, 0, occupant);
    }
  }

  slots[dest] = cardId;
  return { slots, tray };
}

export function countCorrectPositions(
  slots: (string | null)[],
  orderById: ReadonlyMap<string, number>,
): number {
  let count = 0;
  for (let index = 0; index < slots.length; index += 1) {
    const id = slots[index];
    if (!id) continue;
    if (orderById.get(id) === index + 1) count += 1;
  }
  return count;
}

export function isDestinationLocked(
  board: Board,
  dest: 'tray' | number,
  lockedIds: ReadonlySet<string>,
): boolean {
  if (typeof dest !== 'number') return false;
  const occupant = board.slots[dest];
  return occupant !== null && occupant !== undefined && lockedIds.has(occupant);
}

export function describeDestination(dest: 'tray' | number | null): string {
  if (dest === 'tray') return 'a bandeja de etapas';
  if (typeof dest === 'number') return `a posição ${dest + 1} de 4`;
  return 'uma zona inválida';
}
