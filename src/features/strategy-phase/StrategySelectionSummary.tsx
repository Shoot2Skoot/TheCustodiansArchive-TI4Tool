import { Panel, Button } from '@/components/common';
import { STRATEGY_CARDS, getPlayerColor } from '@/lib/constants';
import styles from './StrategySelectionSummary.module.css';

interface Player {
  id: string;
  displayName: string;
  color: string;
  factionName: string;
}

interface StrategySelection {
  playerId: string;
  cardId: number;
  tradeGoodBonus: number;
  selectionOrder: number;
}

interface StrategySelectionSummaryProps {
  selections: StrategySelection[];
  players: Player[];
  onReset: () => void;
  onEndPhase: () => void;
}

export function StrategySelectionSummary({
  selections,
  players,
  onReset,
  onEndPhase,
}: StrategySelectionSummaryProps) {
  // Sort selections by selection order
  const sortedSelections = [...selections].sort(
    (a, b) => a.selectionOrder - b.selectionOrder
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Strategy Phase Complete</h1>
        <p className={styles.description}>
          All players have selected their strategy cards
        </p>
      </div>

      <Panel className={styles.summaryPanel}>
        <div className={styles.selectionsList}>
          {sortedSelections.map((selection) => {
            const player = players.find((p) => p.id === selection.playerId);
            const card = STRATEGY_CARDS.find((c) => c.id === selection.cardId);

            if (!player || !card) return null;

            return (
              <div key={selection.playerId} className={styles.selectionItem}>
                <div className={styles.selectionOrder}>
                  {selection.selectionOrder}
                </div>

                <div className={styles.playerInfo}>
                  <div
                    className={styles.playerName}
                    style={{ color: getPlayerColor(player.color) }}
                  >
                    {player.displayName}
                  </div>
                  <div className={styles.factionName}>{player.factionName}</div>
                </div>

                <div
                  className={styles.cardPreview}
                  style={{
                    '--strategy-color': card.color,
                    borderColor: card.color
                  } as React.CSSProperties}
                >
                  <div
                    className={styles.cardNumber}
                    style={{ borderColor: card.color } as React.CSSProperties}
                  >
                    {card.id}
                  </div>
                  <div className={styles.cardName}>{card.name.toUpperCase()}</div>
                </div>

                {selection.tradeGoodBonus > 0 && (
                  <div className={styles.bonusInfo}>
                    <span className={styles.bonusIcon}>🪙</span>
                    <span className={styles.bonusText}>
                      +{selection.tradeGoodBonus} TG
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Panel>

      <div className={styles.actions}>
        <Button variant="secondary" onClick={onReset}>
          Reset Phase
        </Button>
        <Button variant="primary" onClick={onEndPhase}>
          End Phase
        </Button>
      </div>
    </div>
  );
}
