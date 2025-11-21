import { useParams, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { useLoadGame } from '@/hooks';
import { useStore, selectCurrentPhase, selectPlayers, selectGameState, selectSpeaker, selectStrategySelections } from '@/store';
import { StrategyPhase } from '@/features/strategy-phase';
import { ActionPhase } from '@/features/action-phase';
import { calculateTradeGoodBonuses } from '@/features/strategy-phase/calculateTradeGoodBonuses';
import { useSaveStrategySelections } from '@/features/strategy-phase/useSaveStrategySelections';
import { FACTIONS } from '@/lib/factions';
import { Panel } from '@/components/common';
import styles from './GamePage.module.css';

export function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { isLoading, error } = useLoadGame(gameId);
  const { saveSelections } = useSaveStrategySelections();

  const currentPhase = useStore(selectCurrentPhase);
  const players = useStore(selectPlayers);
  const gameState = useStore(selectGameState);
  const speaker = useStore(selectSpeaker);
  const strategySelections = useStore(selectStrategySelections);

  // Calculate trade good bonuses from previous rounds
  const tradeGoodBonuses = useMemo(() => {
    if (!gameState) return {};
    return calculateTradeGoodBonuses(strategySelections, gameState.currentRound);
  }, [strategySelections, gameState]);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Panel className={styles.loadingPanel}>
          <div className={styles.loadingContent}>
            <div className={styles.spinner}></div>
            <p>Loading game...</p>
          </div>
        </Panel>
      </div>
    );
  }

  if (error || !gameId || !gameState) {
    return (
      <div className={styles.container}>
        <Panel className={styles.errorPanel}>
          <h2>Error</h2>
          <p>{error || 'Game not found'}</p>
          <button onClick={() => navigate('/')}>Return to Home</button>
        </Panel>
      </div>
    );
  }

  // Map players to include faction names
  const playersWithFactions = players.map((player) => ({
    ...player,
    factionName: FACTIONS[player.factionId]?.name || player.factionId,
  }));

  const handleStrategyComplete = async (selections: any[]) => {
    const success = await saveSelections({
      gameId,
      roundNumber: gameState.currentRound,
      selections,
    });

    if (success) {
      // The game state will be updated via realtime subscription
      // For now, we could show a success message or navigate somewhere
      console.log('Strategy selections saved successfully');
    }
  };

  const handleStrategyReset = () => {
    console.log('Strategy phase reset');
    // Could refresh the page or reload the data
  };

  // Render the appropriate phase component
  const renderPhase = () => {
    switch (currentPhase) {
      case 'setup':
        return (
          <Panel>
            <h2>Game Setup</h2>
            <p>Game setup complete. Waiting for first round to begin...</p>
          </Panel>
        );

      case 'speaker-selection':
        return (
          <Panel>
            <h2>Speaker Selection</h2>
            <p>Speaker selection phase (not yet implemented)</p>
          </Panel>
        );

      case 'strategy':
        return (
          <StrategyPhase
            gameId={gameId}
            players={playersWithFactions}
            speakerPosition={speaker?.position ?? 1}
            roundNumber={gameState.currentRound}
            initialTradeGoodBonuses={tradeGoodBonuses}
            onComplete={handleStrategyComplete}
            onReset={handleStrategyReset}
          />
        );

      case 'action':
        return (
          <ActionPhase
            gameId={gameId}
            players={playersWithFactions}
            roundNumber={gameState.currentRound}
            strategySelections={strategySelections}
            speakerPlayerId={gameState.speakerPlayerId}
            onComplete={() => {
              console.log('Action phase complete');
              // TODO: Transition to next phase (Status)
            }}
          />
        );

      case 'status':
        return (
          <Panel>
            <h2>Status Phase</h2>
            <p>Status phase (not yet implemented)</p>
          </Panel>
        );

      case 'agenda':
        return (
          <Panel>
            <h2>Agenda Phase</h2>
            <p>Agenda phase (not yet implemented)</p>
          </Panel>
        );

      default:
        return (
          <Panel>
            <h2>Unknown Phase</h2>
            <p>Phase: {currentPhase}</p>
          </Panel>
        );
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.gameHeader}>
        <button className={styles.backButton} onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        <div className={styles.gameInfo}>
          <span className={styles.gameTitle}>Round {gameState.currentRound}</span>
        </div>
        <div className={styles.phaseInfo}>
          <span className={styles.phaseName}>{currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)}</span>
        </div>
      </div>

      {renderPhase()}
    </div>
  );
}
