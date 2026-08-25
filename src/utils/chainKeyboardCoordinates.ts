import {
  closestCorners,
  getFirstCollision,
  type KeyboardCoordinateGetter,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

const ARROWS = new Set(['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight']);

export const chainKeyboardCoordinates: KeyboardCoordinateGetter = (event, args) => {
  const fromSortable = sortableKeyboardCoordinates(event, args);
  if (fromSortable) return fromSortable;

  if (!ARROWS.has(event.code)) return;
  event.preventDefault();

  const { active, collisionRect, droppableRects, droppableContainers, over } = args.context;
  if (!active || !collisionRect) return;

  const filtered = droppableContainers.getEnabled().filter((entry) => {
    if (!entry || entry.disabled) return false;
    const rect = droppableRects.get(entry.id);
    if (!rect) return false;
    switch (event.code) {
      case 'ArrowDown':
        return collisionRect.top < rect.top;
      case 'ArrowUp':
        return collisionRect.top > rect.top;
      case 'ArrowLeft':
        return collisionRect.left > rect.left;
      case 'ArrowRight':
        return collisionRect.left < rect.left;
      default:
        return false;
    }
  });

  const collisions = closestCorners({
    active,
    collisionRect,
    droppableRects,
    droppableContainers: filtered,
    pointerCoordinates: null,
  });

  let closestId = getFirstCollision(collisions, 'id');
  if (closestId === over?.id && collisions.length > 1) {
    closestId = collisions[1]?.id;
  }
  if (closestId == null) return;

  const nextRect = droppableRects.get(closestId);
  if (!nextRect) return;
  return { x: nextRect.left, y: nextRect.top };
};
