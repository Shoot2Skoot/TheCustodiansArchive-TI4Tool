import { useState, useEffect } from 'react';
import { Panel, Button } from '@/components/common';
import { StrategyCard } from './StrategyCard';
import { StrategySelectionSummary } from './StrategySelectionSummary';
import { STRATEGY_CARDS, getPlayerColor } from '@/lib/constants';
import { getFactionImage, FACTIONS } from '@/lib/factions';
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
  onComplete: (selections: StrategySelection[]) => void;
  onReset: () => void;
}

export function StrategyPhase({
  gameId,
  players,
  speakerPosition,
  roundNumber,
  onComplete,
  onReset,
}: StrategyPhaseProps) {
  const [selections, setSelections] = useState<StrategySelection[]>([]);
  const [tradeGoodBonuses, setTradeGoodBonuses] = useState<Record<number, number>>({});
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  // Calculate player order based on speaker
  const playerOrder = getPlayerOrder(players, speakerPosition);

  // Initialize trade good bonuses (all cards start with 0)
  useEffect(() => {
    const initialBonuses: Record<number, number> = {};
    STRATEGY_CARDS.forEach((card) => {
      initialBonuses[card.id] = 0;
    });
    setTradeGoodBonuses(initialBonuses);
  }, []);

  const currentPlayer = playerOrder[currentPlayerIndex];
  const isSelectionComplete = selections.length === players.length;

  const handleCardSelect = (cardId: number) => {
    if (!currentPlayer) return;

    const newSelection: StrategySelection = {
      playerId: currentPlayer.id,
      cardId,
      tradeGoodBonus: tradeGoodBonuses[cardId] || 0,
      selectionOrder: selections.length + 1,
    };

    setSelections([...selections, newSelection]);

    // Update trade good bonuses for remaining cards
    const newBonuses = { ...tradeGoodBonuses };
    delete newBonuses[cardId]; // Remove the selected card
    Object.keys(newBonuses).forEach((key) => {
      newBonuses[Number(key)] += 1;
    });
    setTradeGoodBonuses(newBonuses);

    // Move to next player
    setCurrentPlayerIndex(currentPlayerIndex + 1);

    // Check if all selections are complete
    if (selections.length + 1 === players.length) {
      setShowSummary(true);
    }
  };

  const handleReset = () => {
    setSelections([]);
    setCurrentPlayerIndex(0);
    setShowSummary(false);

    // Reset trade good bonuses
    const initialBonuses: Record<number, number> = {};
    STRATEGY_CARDS.forEach((card) => {
      initialBonuses[card.id] = 0;
    });
    setTradeGoodBonuses(initialBonuses);

    onReset();
  };

  const handleEndPhase = () => {
    onComplete(selections);
  };

  if (showSummary) {
    return (
      <StrategySelectionSummary
        selections={selections}
        players={players}
        onReset={handleReset}
        onEndPhase={handleEndPhase}
      />
    );
  }

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
              {!isSelectionComplete ? (
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
              ) : (
                <div className={styles.completedMessage}>
                  All strategy cards selected!
                </div>
              )}
            </div>
          </div>

          <div className={styles.turnPanelActions}>
            <Button variant="secondary" onClick={handleReset}>
              Reset Phase
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
          />
        ))}
      </div>
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
