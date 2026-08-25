import type { ChainStep } from '../types/game';

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function parseSeedParam(search = window.location.search): number | undefined {
  const raw = new URLSearchParams(search).get('seed');
  if (raw === null || raw === '') return undefined;
  const numeric = Number(raw);
  return Number.isFinite(numeric) ? numeric : hashString(raw);
}

export function createRng(screenId: string): () => number {
  const seed = parseSeedParam();
  if (seed === undefined) return Math.random;
  return mulberry32(hashString(`${seed}:${screenId}`));
}

export function shuffle<T>(items: T[], random: () => number = Math.random): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const current = next[i];
    const swap = next[j];
    if (current === undefined || swap === undefined) continue;
    next[i] = swap;
    next[j] = current;
  }
  return next;
}

export function isOrderSorted(steps: ChainStep[]): boolean {
  return steps.every((step, index) => step.order === index + 1);
}

export function shuffleSteps(steps: ChainStep[], random: () => number = Math.random): ChainStep[] {
  let result = shuffle(steps, random);
  for (let attempt = 0; attempt < 24 && isOrderSorted(result); attempt += 1) {
    result = shuffle(steps, random);
  }
  if (isOrderSorted(result) && result.length > 1) {
    result = [...result];
    const first = result[0];
    const second = result[1];
    if (first && second) {
      result[0] = second;
      result[1] = first;
    }
  }
  return result;
}
