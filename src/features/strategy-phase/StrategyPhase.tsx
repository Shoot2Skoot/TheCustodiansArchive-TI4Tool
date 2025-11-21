import { useState, useEffect, useCallback } from 'react';
import { Panel, Button } from '@/components/common';
import { StrategyCard } from './StrategyCard';
import { PlayPhaseEndEffectModal } from './PlayPhaseEndEffectModal';
import { STRATEGY_CARDS, getPlayerColor } from '@/lib/constants';
import { getFactionImage, FACTIONS } from '@/lib/factions';
import { useStore } from '@/store';
import { getCurrentUserId } from '@/lib/auth';
import styles from './StrategyPhase.module.css';

interface Player {
  id: string;
  position: number;
  displayName: string;
  color: string;
  factionName: string;
  factionId: string;
}

interface StrategySelection {
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
  onComplete: (selections: StrategySelection[]) => void;
  onReset: () => void;
}

export function StrategyPhase({
  gameId,
  players,
  speakerPosition,
  roundNumber,
  initialTradeGoodBonuses,
  onComplete,
  onReset,
}: StrategyPhaseProps) {
  const [selections, setSelections] = useState<StrategySelection[]>([]);
  const [tradeGoodBonuses, setTradeGoodBonuses] = useState<Record<number, number>>({});
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showPlayEffectModal, setShowPlayEffectModal] = useState(false);

  // Get undo/redo functions from store
  const pushHistory = useStore((state) => state.pushHistory);
  const undo = useStore((state) => state.undo);
  const canUndo = useStore((state) => state.canUndo);
  const currentGame = useStore((state) => state.currentGame);

  // Calculate player order based on speaker
  const playerOrder = getPlayerOrder(players, speakerPosition);

  // Get current user ID on mount
  useEffect(() => {
    getCurrentUserId().then(setCurrentUserId);
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

  const handleCardSelect = (cardId: number) => {
    if (!currentPlayer || !currentUserId) return;

    const newSelection: StrategySelection = {
      playerId: currentPlayer.id,
      cardId,
      tradeGoodBonus: tradeGoodBonuses[cardId] || 0,
      selectionOrder: selections.length + 1,
    };

    const newSelections = [...selections, newSelection];

    // Push to undo history BEFORE updating state
    pushHistory({
      type: 'strategySelection',
      data: selections, // Store the state BEFORE this action
      userId: currentUserId,
      timestamp: Date.now(),
    });

    setSelections(newSelections);

    // Move to next player
    setCurrentPlayerIndex(currentPlayerIndex + 1);
  };

  const handleUndo = useCallback(() => {
    if (!currentUserId || !canUndo(currentUserId, isHost || false)) return;

    const entry = undo();
    if (entry && entry.type === 'strategySelection') {
      // Restore the previous state
      setSelections(entry.data);
      setCurrentPlayerIndex(entry.data.length);
    }
  }, [currentUserId, isHost, canUndo, undo]);

  // Keyboard shortcuts for undo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z for undo (Cmd+Z on Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo]);

  const handleReset = () => {
    setSelections([]);
    setCurrentPlayerIndex(0);

    // Clear undo history
    useStore.getState().clearHistory();

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
    onComplete(selections);
  };

  const handleSwapComplete = (cardId1: number, cardId2: number) => {
    // Find the selections for these cards
    const selection1 = selections.find((s) => s.cardId === cardId1);
    const selection2 = selections.find((s) => s.cardId === cardId2);

    if (!selection1 || !selection2) return;

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
              color: getPlayerColor(player.color),
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
                          borderColor: getPlayerColor(player.color),
                        }}
                      >
                        <img
                          src={getFactionImage(player.factionId, 'color')}
                          alt={player.factionName}
                          className={styles.queueBarIcon}
                        />
                        <div className={styles.queueBarInfo}>
                          <div className={styles.queueBarFaction} style={{ color: getPlayerColor(player.color) }}>
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
                      style={{ color: getPlayerColor(currentPlayer?.color || 'blue') }}
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
                  <Button variant="secondary" onClick={() => setShowPlayEffectModal(true)}>
                    Play
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

          <div className={styles.turnPanelActions}>
            <Button
              variant="secondary"
              onClick={handleUndo}
              disabled={!currentUserId || !canUndo(currentUserId, isHost || false)}
            >
              Undo
            </Button>
            <Button variant="secondary" onClick={handleReset}>
              Reset
            </Button>
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
