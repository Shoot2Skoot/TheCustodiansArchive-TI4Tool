import { useParams, useNavigate } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
import { useGame } from '@/hooks';
import { useStore, selectCurrentPhase, selectPlayers, selectGameState, selectSpeaker, selectStrategySelections } from '@/store';
import { StrategyPhase } from '@/features/strategy-phase';
import { ActionPhase } from '@/features/action-phase';
import { calculateTradeGoodBonuses } from '@/features/strategy-phase/calculateTradeGoodBonuses';
import { useSaveStrategySelections } from '@/features/strategy-phase/useSaveStrategySelections';
import { getGameState } from '@/lib/db/gameState';
import { getStrategySelectionsByRound } from '@/lib/db/strategySelections';
import { FACTIONS } from '@/lib/factions';
import { Panel, Button } from '@/components/common';
import { voiceSettings } from '@/lib/voiceSettings';
import styles from './GamePage.module.css';

export function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { isLoading, error } = useGame(gameId || null);
  const { saveSelections } = useSaveStrategySelections();

  const currentPhase = useStore(selectCurrentPhase);
  const players = useStore(selectPlayers);
  const gameState = useStore(selectGameState);
  const speaker = useStore(selectSpeaker);
  const strategySelections = useStore(selectStrategySelections);

  // Get store actions
  const setGameState = useStore((state) => state.setGameState);
  const setStrategySelections = useStore((state) => state.setStrategySelections);

  // State for undo/redo functionality from child phases
  const [undoRedoHandlers, setUndoRedoHandlers] = useState<{
    canUndo: boolean;
    canRedo: boolean;
    onUndo: () => void;
    onRedo: () => void;
  } | null>(null);

  // State for audio control
  const [audioEnabled, setAudioEnabled] = useState(voiceSettings.isAudioEnabled());

  // Subscribe to voice settings changes
  useEffect(() => {
    const unsubscribe = voiceSettings.subscribe(() => {
      setAudioEnabled(voiceSettings.isAudioEnabled());
    });
    return unsubscribe;
  }, []);

  // Handle volume toggle
  const handleVolumeToggle = () => {
    voiceSettings.toggleAudio();
  };

  // Debug logging
  console.log('GamePage render - Phase:', currentPhase, 'GameState:', gameState);

  // Log when phase changes
  useEffect(() => {
    console.log('📍 Phase changed to:', currentPhase);
  }, [currentPhase]);

  // Log when gameState changes
  useEffect(() => {
    console.log('📍 GameState updated:', gameState);
  }, [gameState]);

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

  // Map players to include faction names and handle null displayName
  const playersWithFactions = players.map((player) => ({
    ...player,
    factionName: FACTIONS[player.factionId]?.name || player.factionId,
    displayName: player.displayName || `Player ${player.position}`,
  }));

  const handleStrategyComplete = async (selections: any[]) => {
    const success = await saveSelections({
      gameId,
      roundNumber: gameState.currentRound,
      selections,
    });

    if (success) {
      console.log('Strategy selections saved successfully');

      // Manually reload game state and strategy selections as a fallback
      // in case realtime updates don't trigger immediately
      try {
        const [newGameState, newSelections] = await Promise.all([
          getGameState(gameId),
          getStrategySelectionsByRound(gameId, gameState.currentRound),
        ]);

        if (newGameState) {
          console.log('Manually updating game state to:', newGameState.currentPhase);
          setGameState(newGameState);
        }

        if (newSelections) {
          setStrategySelections(newSelections);
        }
      } catch (err) {
        console.error('Failed to reload game state after strategy phase:', err);
      }
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
            onUndoRedoChange={setUndoRedoHandlers}
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
            onUndoRedoChange={setUndoRedoHandlers}
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
        <button className={styles.backButton} onClick={() => {
          // Clear audio tracking when leaving
          sessionStorage.removeItem('strategyPhase_audioEntry');
          sessionStorage.removeItem('strategyPhase_lastPromptPlayerId');
          sessionStorage.removeItem('actionPhase_audioEntry');
          sessionStorage.removeItem('actionPhase_lastPromptPlayerId');
          navigate('/', { replace: true });
        }}>
          ← Back to Home
        </button>
        <div className={styles.gameInfo}>
          <span className={styles.gameTitle}>Round {gameState.currentRound}</span>
        </div>
        <div className={styles.phaseInfo}>
          <span className={styles.phaseName}>{currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)}</span>
        </div>
        {undoRedoHandlers && (
          <div className={styles.undoRedoButtons}>
            <Button
              variant="secondary"
              onClick={undoRedoHandlers.onUndo}
              disabled={!undoRedoHandlers.canUndo}
            >
              Undo
            </Button>
            <Button
              variant="secondary"
              onClick={undoRedoHandlers.onRedo}
              disabled={!undoRedoHandlers.canRedo}
            >
              Redo
            </Button>
          </div>
        )}
        <div className={styles.volumeButton}>
          <Button
            variant="secondary"
            onClick={handleVolumeToggle}
            title={audioEnabled ? 'Mute audio' : 'Unmute audio'}
          >
            {audioEnabled ? '🔊' : '🔇'}
          </Button>
        </div>
      </div>

      {renderPhase()}
    </div>
  );
}
