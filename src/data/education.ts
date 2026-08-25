/**
 * Conteúdo clínico da camada educacional.
 *
 * Sujeito a revisão pela responsável pelo projeto.
 * Altere a redação apenas neste arquivo — os componentes leem as chaves
 * (`POST_SUCCESS_CONTEXT`, `GLOSSARY`) e não duplicam o texto.
 */

/** Texto exibido após o overlay de acerto, uma entrada por cadeia. */
export const POST_SUCCESS_CONTEXT = {
  /** Periodontite → DPOC */
  'perio-to-dpoc':
    'A periodontite ativa libera mediadores inflamatórios e produtos bacterianos que podem alcançar o pulmão pela circulação e, em alguns casos, por microaspiração — uma via de plausibilidade para contribuir com o quadro de DPOC.',
  /** DPOC → Periodontite */
  'dpoc-to-perio':
    'Na DPOC, a inflamação pulmonar crônica eleva mediadores que sustentam inflamação sistêmica persistente, criando um ambiente que pode agravar a inflamação periodontal.',
  /** Periodontite → AOS */
  'perio-to-aos':
    'Os mediadores pró-inflamatórios da periodontite aumentam a carga inflamatória sistêmica, associada ao estado inflamatório descrito na apneia obstrutiva do sono.',
  /** AOS → Periodontite */
  'aos-to-perio':
    'A apneia provoca hipóxia intermitente, que favorece estresse oxidativo e inflamação sistêmica — um ambiente potencialmente favorável à inflamação periodontal.',
} as const;

export type ChainEducationId = keyof typeof POST_SUCCESS_CONTEXT;

/** Definições curtas; a chave é o termo a destacar na primeira ocorrência da tela. */
export const GLOSSARY = {
  'mediadores inflamatórios':
    'Moléculas de sinalização (como citocinas) liberadas na inflamação; circulam e podem afetar órgãos distantes da origem.',
  microaspiração:
    'Passagem de conteúdo da boca ou da faringe para as vias aéreas inferiores, em geral em pequenos volumes e de forma repetida.',
  'hipóxia intermitente':
    'Quedas repetidas da oxigenação, típicas dos eventos de apneia ao longo da noite, intercaladas com reoxigenação.',
  'estresse oxidativo':
    'Desequilíbrio entre oxidantes e antioxidantes que pode lesar células e manter inflamação.',
} as const;

export type GlossaryTerm = keyof typeof GLOSSARY;

/** Termos mais longos primeiro, para o destaque não fatiar uma expressão maior. */
export const GLOSSARY_TERMS = (Object.keys(GLOSSARY) as GlossaryTerm[]).sort(
  (a, b) => b.length - a.length,
);
