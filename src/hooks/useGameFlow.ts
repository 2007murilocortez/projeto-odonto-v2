import { useCallback, useEffect, useRef, useState } from 'react';
import type { GameState, QuizOptionId } from '../types/game';

export type GameView =
  | { kind: 'screen'; index: number }
  | { kind: 'interstitial'; phase: 1 | 2; nextIndex: number };

const INITIAL_STATE: GameState = {
  screenIndex: 0,
  attemptsByScreen: {},
  quizAnswer: null,
  startedAt: 0,
};

export function useGameFlow() {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [view, setView] = useState<GameView>({ kind: 'screen', index: 0 });
  const viewRef = useRef(view);

  useEffect(() => {
    viewRef.current = view;
  });

  useEffect(() => {
    if (view.kind !== 'interstitial') return undefined;
    const timeoutId = window.setTimeout(() => {
      setView({ kind: 'screen', index: view.nextIndex });
      setState((current) => ({ ...current, screenIndex: view.nextIndex }));
    }, 1400);
    return () => window.clearTimeout(timeoutId);
  }, [view]);

  const startGame = useCallback(() => {
    setState({
      screenIndex: 1,
      attemptsByScreen: {},
      quizAnswer: null,
      startedAt: Date.now(),
    });
    setView({ kind: 'interstitial', phase: 1, nextIndex: 1 });
  }, []);

  const completeChain = useCallback(() => {
    const current = viewRef.current;
    if (current.kind !== 'screen') return;
    if (current.index === 2) {
      setView({ kind: 'interstitial', phase: 2, nextIndex: 3 });
      return;
    }
    const nextIndex = current.index + 1;
    setState((value) => ({ ...value, screenIndex: nextIndex }));
    setView({ kind: 'screen', index: nextIndex });
  }, []);

  const recordAttempt = useCallback((screenId: string) => {
    setState((current) => ({
      ...current,
      attemptsByScreen: {
        ...current.attemptsByScreen,
        [screenId]: (current.attemptsByScreen[screenId] ?? 0) + 1,
      },
    }));
  }, []);

  const answerQuiz = useCallback((answer: QuizOptionId) => {
    setState((current) => ({ ...current, quizAnswer: answer }));
  }, []);

  const goToClosing = useCallback(() => {
    setState((current) => ({ ...current, screenIndex: 6 }));
    setView({ kind: 'screen', index: 6 });
  }, []);

  const restart = useCallback(() => {
    setState(INITIAL_STATE);
    setView({ kind: 'screen', index: 0 });
  }, []);

  return {
    state,
    view,
    startGame,
    completeChain,
    recordAttempt,
    answerQuiz,
    goToClosing,
    restart,
  };
}
