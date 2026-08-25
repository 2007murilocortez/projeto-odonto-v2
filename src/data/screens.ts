import type {
  ChainScreen,
  ClosingScreen,
  GameScreen,
  OpeningScreen,
  QuizScreen,
} from '../types/game';

export const openingScreen: OpeningScreen = {
  id: 'opening',
  kind: 'opening',
  eyebrow: 'Relação sistêmica',
  title: 'Doença periodontal × doenças respiratórias',
  subtitle: 'Aprenda na prática como a inflamação da boca conversa com o restante do corpo.',
  body: 'Você vai montar quatro cadeias de eventos. Em cada uma, arraste as etapas até formar o caminho correto.',
  // Preencher os placeholders; a abertura renderiza a string como está.
  affiliation: '{{DISCIPLINA}} · {{INSTITUIÇÃO}} · {{AUTORA}}',
  cta: 'Começar',
};

export const perioToDpocScreen: ChainScreen = {
  id: 'perio-to-dpoc',
  phase: 1,
  kind: 'chain',
  equation: { left: 'PERIODONTITE', right: 'DPOC' },
  steps: [
    {
      id: 's1',
      order: 1,
      label: 'Periodontite ativa',
      hint: 'Toda cadeia começa pela condição que já está instalada na boca.',
    },
    {
      id: 's2',
      order: 2,
      label: 'Mediadores inflamatórios e produtos bacterianos/orais',
      hint: 'Antes de alcançar o resto do corpo, algo precisa ser liberado no local.',
    },
    {
      id: 's3',
      order: 3,
      label: 'Inflamação sistêmica e possível microaspiração',
      hint: 'Falta o trajeto — como o que saiu da boca chega até o pulmão.',
    },
    {
      id: 's4',
      order: 4,
      label: 'Possível contribuição para o quadro respiratório',
      hint: 'O desfecho fica por último: é onde a cadeia chega, não de onde ela parte.',
    },
  ],
  successMessage: 'Conexão encontrada: Periodontite → DPOC',
  pathway: 'tooth-to-lung',
};

export const dpocToPerioScreen: ChainScreen = {
  id: 'dpoc-to-perio',
  phase: 1,
  kind: 'chain',
  prompt: 'Mas essa relação pode acontecer no sentido contrário?',
  equation: { left: 'DPOC', right: 'PERIODONTITE' },
  steps: [
    {
      id: 's1',
      order: 1,
      label: 'DPOC e inflamação pulmonar crônica',
      hint: 'Agora o ponto de partida é a condição respiratória já estabelecida.',
    },
    {
      id: 's2',
      order: 2,
      label: 'Aumento de mediadores inflamatórios',
      hint: 'O segundo passo ainda é local: o que a inflamação pulmonar libera.',
    },
    {
      id: 's3',
      order: 3,
      label: 'Inflamação sistêmica persistente',
      hint: 'Entre o pulmão e a gengiva existe uma etapa que atravessa o corpo inteiro.',
    },
    {
      id: 's4',
      order: 4,
      label: 'Potencial agravamento da inflamação periodontal',
      hint: 'O que a cadeia pode agravar vem no fim.',
    },
  ],
  successMessage: 'Conexão encontrada: DPOC → Periodontite',
  pathway: 'lung-to-tooth',
  reveal: { symbol: 'PERIODONTITE ⇄ DPOC', caption: 'A relação é bidirecional.' },
};

export const perioToAosScreen: ChainScreen = {
  id: 'perio-to-aos',
  phase: 2,
  kind: 'chain',
  equation: { left: 'PERIODONTITE', right: 'AOS' },
  steps: [
    {
      id: 's1',
      order: 1,
      label: 'Periodontite ativa',
      hint: 'Mesma origem da primeira cadeia: a condição periodontal instalada.',
    },
    {
      id: 's2',
      order: 2,
      label: 'Liberação de mediadores pró-inflamatórios',
      hint: 'Primeiro a liberação, depois o alcance sistêmico.',
    },
    {
      id: 's3',
      order: 3,
      label: 'Aumento da carga inflamatória sistêmica',
      hint: 'Antes do desfecho, a carga inflamatória precisa se acumular no organismo.',
    },
    {
      id: 's4',
      order: 4,
      label: 'Possível contribuição para o estado inflamatório associado à AOS',
      hint: 'A contribuição para o quadro associado à AOS encerra a cadeia.',
    },
  ],
  successMessage: 'Conexão encontrada: Periodontite → AOS',
  pathway: 'tooth-to-apnea',
};

export const aosToPerioScreen: ChainScreen = {
  id: 'aos-to-perio',
  phase: 2,
  kind: 'chain',
  prompt: 'E no caminho contrário?',
  equation: { left: 'AOS', right: 'PERIODONTITE' },
  steps: [
    {
      id: 's1',
      order: 1,
      label: 'Apneia obstrutiva do sono',
      hint: 'A cadeia parte do distúrbio do sono em si.',
    },
    {
      id: 's2',
      order: 2,
      label: 'Hipóxia intermitente',
      hint: 'O que a apneia provoca de imediato, durante a noite, vem logo em seguida.',
    },
    {
      id: 's3',
      order: 3,
      label: 'Estresse oxidativo e inflamação sistêmica',
      hint: 'A hipóxia não age sozinha — ela desencadeia uma resposta no corpo todo.',
    },
    {
      id: 's4',
      order: 4,
      label: 'Ambiente potencialmente favorável à inflamação periodontal',
      hint: 'Por último, o efeito sobre o tecido periodontal.',
    },
  ],
  successMessage: 'Conexão encontrada: AOS → Periodontite',
  pathway: 'apnea-to-tooth',
  reveal: {
    symbol: 'PERIODONTITE ⇄ AOS',
    caption: 'Novamente, encontramos uma relação bidirecional.',
  },
};

export const quizScreen: QuizScreen = {
  id: 'final-challenge',
  kind: 'quiz',
  eyebrow: 'Desafio final',
  question:
    'A relação sistêmica da periodontite acontece somente com doenças respiratórias, como DPOC e AOS?',
  options: [
    { id: 'A', label: 'Sim, a relação ocorre apenas com doenças respiratórias.', correct: false },
    {
      id: 'B',
      label: 'Não, a periodontite pode apresentar relação com diferentes condições sistêmicas.',
      correct: true,
    },
  ],
  feedback: {
    correct:
      'Correto! DPOC e AOS são exemplos respiratórios, mas a relação entre saúde periodontal e saúde sistêmica vai além do sistema respiratório.',
    incorrect: 'Incorreto. A relação sistêmica da periodontite não se limita às doenças respiratórias.',
  },
};

export const closingScreen: ClosingScreen = {
  id: 'closing',
  kind: 'closing',
  title: 'Duas vias, dois sentidos',
  recap: ['PERIODONTITE ⇄ DPOC', 'PERIODONTITE ⇄ AOS'],
  body: 'Cuidar da saúde periodontal é parte do cuidado com a saúde sistêmica.',
  cta: 'Jogar novamente',
};

export const chainScreens: ChainScreen[] = [
  perioToDpocScreen,
  dpocToPerioScreen,
  perioToAosScreen,
  aosToPerioScreen,
];

export const screens: GameScreen[] = [
  openingScreen,
  perioToDpocScreen,
  dpocToPerioScreen,
  perioToAosScreen,
  aosToPerioScreen,
  quizScreen,
  closingScreen,
];

/** Expansões da seção 5.2 e 5.4 — primeira aparição de cada sigla. */
export const ACRONYM_EXPANSIONS = {
  DPOC: 'DPOC — Doença Pulmonar Obstrutiva Crônica',
  AOS: 'AOS — Apneia Obstrutiva do Sono',
} as const;

/** Nota de contexto científico — seção 13, rodapé da tela de encerramento. */
export const SCIENTIFIC_NOTE =
  'Conteúdo educativo. As cadeias apresentadas descrevem mecanismos de plausibilidade biológica e associações descritas na literatura — não estabelecem relação de causa e efeito individual. Não substitui avaliação clínica.';

/** Uma linha no rodapé da abertura; o texto completo está em SCIENTIFIC_NOTE. */
export const SCIENTIFIC_NOTE_SUMMARY =
  'Conteúdo educativo: plausibilidade biológica e associações na literatura, não causa e efeito individual.';
