import { OpeningScreen } from './components/screens/OpeningScreen';
import { ChainScreen } from './components/screens/ChainScreen';
import { QuizScreen } from './components/screens/QuizScreen';
import { ClosingScreen } from './components/screens/ClosingScreen';
import { PhaseInterstitial } from './components/screens/PhaseInterstitial';
import { screens } from './data/screens';
import { useGameFlow } from './hooks/useGameFlow';

function App() {
  const flow = useGameFlow();

  if (flow.view.kind === 'interstitial') {
    return <PhaseInterstitial phase={flow.view.phase} />;
  }

  const screen = screens[flow.view.index];
  if (!screen) return null;

  switch (screen.kind) {
    case 'opening':
      return <OpeningScreen screen={screen} onStart={flow.startGame} />;
    case 'chain':
      return (
        <ChainScreen
          key={screen.id}
          screen={screen}
          onComplete={flow.completeChain}
          onAttempt={flow.recordAttempt}
        />
      );
    case 'quiz':
      return (
        <QuizScreen
          screen={screen}
          onAnswer={flow.answerQuiz}
          onComplete={flow.goToClosing}
        />
      );
    case 'closing':
      return <ClosingScreen screen={screen} onRestart={flow.restart} />;
  }
}

export default App;
