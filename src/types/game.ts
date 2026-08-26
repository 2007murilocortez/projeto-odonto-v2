export type ChainStep = {
  id: string;
  order: number;
  label: string;
  hint?: string;
};

export type Pathway =
  | 'tooth-to-lung'
  | 'lung-to-tooth'
  | 'tooth-to-apnea'
  | 'apnea-to-tooth';

export type ChainScreen = {
  id: string;
  phase: 1 | 2;
  kind: 'chain';
  equation: { left: string; right: string };
  prompt?: string;
  steps: ChainStep[];
  successMessage: string;
  pathway: Pathway;
  reveal?: { symbol: string; caption: string };
};

export type OpeningScreen = {
  id: string;
  kind: 'opening';
  eyebrow: string;
  title: string;
  subtitle: string;
  body: string;
  affiliation: {
    author: string;
    course: string;
    institution: string;
  };
  cta: string;
};

export type QuizOptionId = 'A' | 'B';

export type QuizOption = {
  id: QuizOptionId;
  label: string;
  correct: boolean;
};

export type QuizScreen = {
  id: string;
  kind: 'quiz';
  eyebrow: string;
  question: string;
  options: QuizOption[];
  feedback: {
    correct: string;
    incorrect: string;
  };
};

export type ClosingScreen = {
  id: string;
  kind: 'closing';
  title: string;
  recap: string[];
  body: string;
  cta: string;
};

export type GameScreen = OpeningScreen | ChainScreen | QuizScreen | ClosingScreen;

export type GameState = {
  screenIndex: number;
  attemptsByScreen: Record<string, number>;
  quizAnswer: QuizOptionId | null;
  startedAt: number;
};
