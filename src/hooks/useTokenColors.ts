import { useMemo } from 'react';

export type TokenColors = {
  inflamacao: string;
  oxigenio: string;
};

function readToken(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

/**
 * Lê os hex computados dos tokens. Não usar `var()` em atributos SVG animados
 * (`fill` de SMIL / keyframes do Framer): a interpolação de cor não resolve
 * custom properties de forma confiável, então a paleta deixaria de ser a
 * fonte única de verdade.
 */
export function useTokenColors(): TokenColors {
  return useMemo(
    () => ({
      inflamacao: readToken('--inflamacao', '#E8594D'),
      oxigenio: readToken('--oxigenio', '#48D0C4'),
    }),
    [],
  );
}
