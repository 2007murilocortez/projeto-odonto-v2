import { describe, expect, it } from 'vitest';
import { POST_SUCCESS_CONTEXT } from '../data/education';
import { splitGlossary } from './glossary';

function termValues(text: string) {
  const used = new Set<string>();
  return splitGlossary(text, used)
    .filter((piece) => piece.kind === 'term')
    .map((piece) => (piece.kind === 'term' ? piece.term : ''));
}

describe('splitGlossary', () => {
  it('destaca a primeira ocorrência de cada termo e ignora a segunda', () => {
    const used = new Set<string>();
    const first = splitGlossary(
      'A hipóxia intermitente e de novo hipóxia intermitente.',
      used,
    );
    const terms = first.filter((piece) => piece.kind === 'term');
    expect(terms).toHaveLength(1);
    expect(used.has('hipóxia intermitente')).toBe(true);

    const second = splitGlossary('Outra hipóxia intermitente na mesma tela.', used);
    expect(second.every((piece) => piece.kind === 'text')).toBe(true);
  });

  it('não trata mediadores pró-inflamatórios como mediadores inflamatórios', () => {
    expect(termValues(POST_SUCCESS_CONTEXT['perio-to-aos'])).toEqual([]);
  });

  it('marca os dois termos do contexto Periodontite → DPOC', () => {
    expect(termValues(POST_SUCCESS_CONTEXT['perio-to-dpoc'])).toEqual([
      'mediadores inflamatórios',
      'microaspiração',
    ]);
  });

  it('marca hipóxia intermitente e estresse oxidativo no contexto AOS → Periodontite', () => {
    expect(termValues(POST_SUCCESS_CONTEXT['aos-to-perio'])).toEqual([
      'hipóxia intermitente',
      'estresse oxidativo',
    ]);
  });
});
