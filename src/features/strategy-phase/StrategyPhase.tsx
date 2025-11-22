import { useState, useEffect, useCallback, useRef } from 'react';
import { Panel, Button } from '@/components/common';
import { StrategyCard } from './StrategyCard';
import { PlayPhaseEndEffectModal } from './PlayPhaseEndEffectModal';
import { STRATEGY_CARDS, getPlayerColor, type PlayerColor } from '@/lib/constants';
import { getFactionImage, FACTIONS } from '@/lib/factions';
import { useStore } from '@/store';
import { getCurrentUserId } from '@/lib/auth';
import { PhaseType, PromptType } from '@/lib/audio';
import { playPhaseEnter, playPhaseExit, playFactionPrompt } from '@/lib/audio';
import { normalizeFactionId } from '@/lib/audioHelpers';
import styles from './StrategyPhase.module.css';

// Module-level tracking to prevent duplicate sounds across StrictMode remounts
const audioPlayTracker = {
  hasPlayedPhaseEntry: false,
  lastPromptPlayerId: null as string | null,
  reset() {
    this.hasPlayedPhaseEntry = false;
    this.lastPromptPlayerId = null;
  }
};

interface Player {
  id: string;
  position: number;
  displayName: string;
  color: string;
  factionName: string;
  factionId: string;
}

interface LocalStrategySelection {
  playerId: string;
  cardId: number;
  tradeGoodBonus: number;
  selectionOrder: number;
}

interface StrategyPhaseProps {
  gameId: string;
  players: Player[];
  speakerPosition: number;
  roundNumber: number;
  initialTradeGoodBonuses?: Record<number, number>;
  onComplete: (selections: LocalStrategySelection[]) => void;
  onReset: () => void;
  onUndoRedoChange?: (handlers: {
    canUndo: boolean;
    canRedo: boolean;
    onUndo: () => void;
    onRedo: () => void;
  } | null) => void;
}

export function StrategyPhase({
  gameId: _gameId,
  players,
  speakerPosition,
  roundNumber: _roundNumber,
  initialTradeGoodBonuses,
  onComplete,
  onReset,
  onUndoRedoChange,
}: StrategyPhaseProps) {
  const [selections, setSelections] = useState<LocalStrategySelection[]>([]);
  const [tradeGoodBonuses, setTradeGoodBonuses] = useState<Record<number, number>>({});
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showPlayEffectModal, setShowPlayEffectModal] = useState(false);

  // Get undo/redo functions from store
  const pushHistory = useStore((state) => state.pushHistory);
  const canUndo = useStore((state) => state.canUndo);
  const canRedo = useStore((state) => state.canRedo);
  const currentGame = useStore((state) => state.currentGame);

  // Calculate player order based on speaker
  const playerOrder = getPlayerOrder(players, speakerPosition);

  // Get current user ID on mount
  useEffect(() => {
    getCurrentUserId().then(setCurrentUserId);
  }, []);

  // Play Strategy Phase entry sound once on mount and cleanup on unmount
  useEffect(() => {
    if (!audioPlayTracker.hasPlayedPhaseEntry) {
      audioPlayTracker.hasPlayedPhaseEntry = true;
      playPhaseEnter(PhaseType.STRATEGY);
    }

    // Reset tracker when component unmounts (when leaving phase)
    return () => {
      audioPlayTracker.reset();
    };
  }, []);

  // Initialize trade good bonuses from prop or default to 0
  useEffect(() => {
    if (initialTradeGoodBonuses) {
      setTradeGoodBonuses(initialTradeGoodBonuses);
    } else {
      const initialBonuses: Record<number, number> = {};
      STRATEGY_CARDS.forEach((card) => {
        initialBonuses[card.id] = 0;
      });
      setTradeGoodBonuses(initialBonuses);
    }
  }, [initialTradeGoodBonuses]);

  const currentPlayer = playerOrder[currentPlayerIndex];
  const isSelectionComplete = selections.length === players.length;
  const isHost = currentUserId && currentGame?.createdBy === currentUserId;

  // Play faction prompt when turn changes
  useEffect(() => {
    if (currentPlayer && !isSelectionComplete && currentPlayer.id !== audioPlayTracker.lastPromptPlayerId) {
      audioPlayTracker.lastPromptPlayerId = currentPlayer.id;
      const normalizedFactionId = normalizeFactionId(currentPlayer.factionId);
      playFactionPrompt(normalizedFactionId, PromptType.CHOOSE_STRATEGY, true);
    }
  }, [currentPlayer?.id, isSelectionComplete]);

  const handleCardSelect = (cardId: number) => {
    if (!currentPlayer || !currentUserId) return;

    const newSelection: LocalStrategySelection = {
      playerId: currentPlayer.id,
      cardId,
      tradeGoodBonus: tradeGoodBonuses[cardId] || 0,
      selectionOrder: selections.length + 1,
    };

    const newSelections = [...selections, newSelection];

    // Push to undo history BEFORE updating state
    pushHistory({
      type: 'strategySelection',
      data: selections as any, // Store the state BEFORE this action
      userId: currentUserId,
      timestamp: Date.now(),
    });

    setSelections(newSelections);

    // Move to next player
    setCurrentPlayerIndex(currentPlayerIndex + 1);
  };

  const handleUndo = useCallback(() => {
    if (!currentUserId || !canUndo(currentUserId, isHost || false)) return;

    // Get the undo stack to peek at the entry
    const undoStack = useStore.getState().undoStack;
    if (undoStack.length === 0) return;

    const entry = undoStack[undoStack.length - 1];
    if (!entry) return;

    // Manually manage the stacks - push CURRENT state to redo before undoing
    const currentStateEntry = {
      type: 'strategySelection' as const,
      data: selections as any,
      userId: currentUserId,
      timestamp: Date.now(),
    };

    // Pop from undo stack and push current state to redo stack
    useStore.setState((state) => ({
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, currentStateEntry as any],
    }));

    // Restore to the "before" state
    if (entry.type === 'strategySelection') {
      setSelections(entry.data as any);
      setCurrentPlayerIndex((entry.data as any).length);
    }
  }, [currentUserId, isHost, canUndo, selections]);

  const handleRedo = useCallback(() => {
    if (!canRedo()) return;

    // Get the redo stack to peek at the entry
    const redoStack = useStore.getState().redoStack;
    if (redoStack.length === 0) return;

    const entry = redoStack[redoStack.length - 1];
    if (!entry) return;

    // Manually manage the stacks - push CURRENT state to undo before redoing
    const currentStateEntry = {
      type: 'strategySelection' as const,
      data: selections as any,
      userId: currentUserId || '',
      timestamp: Date.now(),
    };

    // Pop from redo stack and push current state to undo stack
    useStore.setState((state) => ({
      redoStack: state.redoStack.slice(0, -1),
      undoStack: [...state.undoStack, currentStateEntry as any],
    }));

    // Restore to the "after" state
    if (entry.type === 'strategySelection') {
      setSelections(entry.data as any);
      setCurrentPlayerIndex((entry.data as any).length);
    }
  }, [canRedo, selections, currentUserId]);

  // Provide undo/redo handlers to parent component
  useEffect(() => {
    if (onUndoRedoChange) {
      onUndoRedoChange({
        canUndo: currentUserId ? canUndo(currentUserId, isHost || false) : false,
        canRedo: canRedo(),
        onUndo: handleUndo,
        onRedo: handleRedo,
      });
    }

    // Cleanup when component unmounts
    return () => {
      if (onUndoRedoChange) {
        onUndoRedoChange(null);
      }
    };
  }, [currentUserId, isHost, canUndo, canRedo, handleUndo, handleRedo, onUndoRedoChange]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z for undo (Cmd+Z on Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Ctrl+Y or Ctrl+Shift+Z for redo (Cmd+Shift+Z on Mac)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  const handleReset = () => {
    if (!currentUserId) return;

    // Push current state to undo history BEFORE resetting
    pushHistory({
      type: 'strategySelection',
      data: selections as any,
      userId: currentUserId,
      timestamp: Date.now(),
    });

    setSelections([]);
    setCurrentPlayerIndex(0);

    // Reset trade good bonuses to initial values
    if (initialTradeGoodBonuses) {
      setTradeGoodBonuses(initialTradeGoodBonuses);
    } else {
      const initialBonuses: Record<number, number> = {};
      STRATEGY_CARDS.forEach((card) => {
        initialBonuses[card.id] = 0;
      });
      setTradeGoodBonuses(initialBonuses);
    }

    onReset();
  };

  const handleEndPhase = () => {
    // Play phase exit sound
    playPhaseExit(PhaseType.STRATEGY);
    onComplete(selections);
  };

  const handleSwapComplete = (cardId1: number, cardId2: number) => {
    if (!currentUserId) return;

    // Find the selections for these cards
    const selection1 = selections.find((s) => s.cardId === cardId1);
    const selection2 = selections.find((s) => s.cardId === cardId2);

    if (!selection1 || !selection2) return;

    // Push current state to undo history BEFORE swapping
    pushHistory({
      type: 'strategySelection',
      data: selections as any,
      userId: currentUserId,
      timestamp: Date.now(),
    });

    // Create new selections array with swapped card IDs
    const newSelections = selections.map((s) => {
      if (s.cardId === cardId1) {
        return { ...s, cardId: cardId2 };
      } else if (s.cardId === cardId2) {
        return { ...s, cardId: cardId1 };
      }
      return s;
    });

    setSelections(newSelections);
  };

  const pickedCardIds = new Set(selections.map((s) => s.cardId));

  // Create a map of cardId -> player who picked it
  const cardPickedByMap = new Map(
    selections.map((s) => {
      const player = players.find((p) => p.id === s.playerId);
      return [
        s.cardId,
        player
          ? {
              factionId: player.factionId,
              factionName: player.factionName,
              playerName: player.displayName,
              color: getPlayerColor(player.color as PlayerColor),
            }
          : undefined,
      ];
    })
  );

  return (
    <div className={styles.container}>
      {/* Combined Turn Panel */}
      <Panel className={styles.turnIndicator}>
        <div className={styles.turnPanelLayout}>
          <div className={styles.turnPanelSpacer}></div>

          <div className={styles.turnPanelCenter}>
            {!isSelectionComplete ? (
              <>
                {/* Compact Turn Queue Bar */}
                <div className={styles.turnQueueBar}>
                  {playerOrder.map((player, index) => {
                    const hasSelected = selections.some((s) => s.playerId === player.id);
                    const isCurrent = index === currentPlayerIndex;
                    const isOnDeck = index === currentPlayerIndex + 1;

                    return (
                      <div
                        key={player.id}
                        className={`${styles.queueBarItem} ${isCurrent ? styles.queueBarCurrent : ''} ${isOnDeck ? styles.queueBarOnDeck : ''} ${hasSelected ? styles.queueBarCompleted : ''}`}
                        style={{
                          borderColor: getPlayerColor(player.color as PlayerColor),
                        }}
                      >
                        <img
                          src={getFactionImage(player.factionId, 'color')}
                          alt={player.factionName}
                          className={styles.queueBarIcon}
                        />
                        <div className={styles.queueBarInfo}>
                          <div className={styles.queueBarFaction} style={{ color: getPlayerColor(player.color as PlayerColor) }}>
                            {FACTIONS[player.factionId]?.shortName || player.factionName}
                          </div>
                          <div className={styles.queueBarPlayer}>
                            ({player.displayName})
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Current Turn Indicator */}
                <div className={styles.turnInfo}>
                  <div className={styles.currentTurnText}>
                    <span
                      className={styles.currentPlayer}
                      style={{ color: getPlayerColor((currentPlayer?.color as PlayerColor) || 'blue') }}
                    >
                      {currentPlayer?.factionName} ({currentPlayer?.displayName})
                    </span>
                    <span className={styles.turnPrompt}>, Choose Your Strategy...</span>
                    <span className={styles.turnCount}>
                      [{selections.length + 1}/{players.length}]
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Phase End Buttons - Centered */}
                <div className={styles.phaseEndButtons}>
                  <Button variant="secondary" onClick={handleReset}>
                    Reset Phase
                  </Button>
                  <Button variant="secondary" onClick={() => setShowPlayEffectModal(true)}>
                    Play End Phase Effect
                  </Button>
                  <Button variant="primary" onClick={handleEndPhase} className={styles.endPhaseButton}>
                    End Phase
                  </Button>
                </div>

                {/* Completion Message */}
                <div className={styles.turnInfo}>
                  <div className={styles.completedMessage}>
                    All strategy cards selected!
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </Panel>

      <div className={styles.cardsGrid}>
        {STRATEGY_CARDS.map((card) => (
          <StrategyCard
            key={card.id}
            cardId={card.id}
            tradeGoodBonus={tradeGoodBonuses[card.id] || 0}
            isSelected={false}
            isPicked={pickedCardIds.has(card.id)}
            pickedBy={cardPickedByMap.get(card.id)}
            onClick={() => handleCardSelect(card.id)}
            isBottomRow={card.id >= 5} // Cards 5-8 are in bottom row
          />
        ))}
      </div>

      <PlayPhaseEndEffectModal
        isOpen={showPlayEffectModal}
        onClose={() => setShowPlayEffectModal(false)}
        selections={selections}
        players={players}
        onSwapComplete={handleSwapComplete}
      />
    </div>
  );
}

// Helper function to get player order starting from speaker
function getPlayerOrder(players: Player[], speakerPosition: number): Player[] {
  const sorted = [...players].sort((a, b) => a.position - b.position);
  const speakerIndex = sorted.findIndex((p) => p.position === speakerPosition);

  if (speakerIndex === -1) return sorted;

  return [...sorted.slice(speakerIndex), ...sorted.slice(0, speakerIndex)];
}
