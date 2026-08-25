import { describe, expect, it } from 'vitest';
import type { ChainStep } from '../types/game';
import {
  allCardIds,
  countCorrectPositions,
  emptyBoard,
  isDestinationLocked,
  moveCard,
  type Board,
} from './board';
import { isOrderSorted, shuffleSteps } from './shuffle';

const ORDER_BY_ID = new Map([
  ['s1', 1],
  ['s2', 2],
  ['s3', 3],
  ['s4', 4],
]);

const IDS = ['s1', 's2', 's3', 's4'] as const;

function permute<T>(items: T[]): T[][] {
  if (items.length <= 1) return [items];
  const result: T[][] = [];
  items.forEach((item, index) => {
    const rest = [...items.slice(0, index), ...items.slice(index + 1)];
    for (const tail of permute(rest)) {
      result.push([item, ...tail]);
    }
  });
  return result;
}

function sampleSteps(): ChainStep[] {
  return IDS.map((id, index) => ({ id, order: index + 1, label: id }));
}

function sortedBoardIds(board: Board): string[] {
  return [...allCardIds(board)].sort();
}

describe('countCorrectPositions', () => {
  it('nunca resulta em exatamente 3 posições corretas nas 24 permutações', () => {
    const counts = new Set<number>();

    for (const permutation of permute([...IDS])) {
      const count = countCorrectPositions(permutation, ORDER_BY_ID);
      counts.add(count);
      expect(count).not.toBe(3);
    }

    expect(permute([...IDS])).toHaveLength(24);
    expect(counts.has(0)).toBe(true);
    expect(counts.has(1)).toBe(true);
    expect(counts.has(2)).toBe(true);
    expect(counts.has(4)).toBe(true);
  });

  it('conta 4 quando a ordem está correta e 0 quando está invertida', () => {
    expect(countCorrectPositions(['s1', 's2', 's3', 's4'], ORDER_BY_ID)).toBe(4);
    expect(countCorrectPositions(['s4', 's3', 's2', 's1'], ORDER_BY_ID)).toBe(0);
  });
});

describe('shuffleSteps', () => {
  it('nunca devolve a ordem original', () => {
    const steps = sampleSteps();
    const identityRng = () => 0.999999;

    expect(isOrderSorted(shuffleSteps(steps, identityRng))).toBe(false);

    for (let i = 0; i < 80; i += 1) {
      expect(isOrderSorted(shuffleSteps(steps, Math.random))).toBe(false);
    }
  });

  it('preserva os mesmos 4 cartões', () => {
    const steps = sampleSteps();
    const shuffled = shuffleSteps(steps, Math.random);
    expect(shuffled.map((step) => step.id).sort()).toEqual([...IDS]);
  });
});

describe('moveCard (swap)', () => {
  function fullTray(): Board {
    return emptyBoard([...IDS]);
  }

  it('preserva os 4 cartões em cada movimento — nenhum some, nenhum duplica', () => {
    let board = fullTray();
    const expected = [...IDS].sort();

    board = moveCard(board, 's1', 0, new Set());
    board = moveCard(board, 's2', 1, new Set());
    board = moveCard(board, 's3', 2, new Set());
    board = moveCard(board, 's4', 0, new Set());
    expect(sortedBoardIds(board)).toEqual(expected);
    expect(new Set(allCardIds(board)).size).toBe(4);

    board = moveCard(board, 's4', 2, new Set());
    expect(sortedBoardIds(board)).toEqual(expected);

    board = moveCard(board, 's2', 'tray', new Set());
    expect(sortedBoardIds(board)).toEqual(expected);
    expect(allCardIds(board)).toHaveLength(4);
  });

  it('rejeita drop em slot travado e mantém o tabuleiro intacto', () => {
    let board = fullTray();
    board = moveCard(board, 's1', 0, new Set());
    board = moveCard(board, 's2', 1, new Set());
    const locked = new Set(['s1']);
    const before = structuredClone(board);

    expect(isDestinationLocked(board, 0, locked)).toBe(true);
    const next = moveCard(board, 's2', 0, locked);
    expect(next).toEqual(before);
    expect(sortedBoardIds(next)).toEqual([...IDS].sort());
  });
});
