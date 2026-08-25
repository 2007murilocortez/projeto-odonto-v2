import { GLOSSARY, GLOSSARY_TERMS, type GlossaryTerm } from '../data/education';

export type GlossaryPiece =
  | { kind: 'text'; value: string }
  | { kind: 'term'; term: GlossaryTerm; value: string };

/**
 * Parte o texto destacando só termos ainda não usados nesta tela.
 * Mutates `used` na ordem em que os trechos são processados no render.
 */
export function splitGlossary(text: string, used: Set<string>): GlossaryPiece[] {
  const available = GLOSSARY_TERMS.filter((term) => !used.has(term));
  const pieces: GlossaryPiece[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    let hit: { index: number; term: GlossaryTerm } | null = null;
    const lower = remaining.toLowerCase();

    for (const term of available) {
      const index = lower.indexOf(term.toLowerCase());
      if (index < 0) continue;
      if (
        !hit ||
        index < hit.index ||
        (index === hit.index && term.length > hit.term.length)
      ) {
        hit = { index, term };
      }
    }

    if (!hit) {
      pieces.push({ kind: 'text', value: remaining });
      break;
    }

    if (hit.index > 0) {
      pieces.push({ kind: 'text', value: remaining.slice(0, hit.index) });
    }

    const value = remaining.slice(hit.index, hit.index + hit.term.length);
    pieces.push({ kind: 'term', term: hit.term, value });
    used.add(hit.term);
    available.splice(available.indexOf(hit.term), 1);
    remaining = remaining.slice(hit.index + hit.term.length);
  }

  return pieces;
}

export function definitionOf(term: GlossaryTerm): string {
  return GLOSSARY[term];
}
