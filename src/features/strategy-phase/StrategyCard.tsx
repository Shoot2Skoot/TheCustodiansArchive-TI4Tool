import { STRATEGY_CARDS } from '@/lib/constants';
import { getFactionImage } from '@/lib/factions';
import styles from './StrategyCard.module.css';
import tradeGood1 from '@/assets/icons/color/trade-good-1.png';
import tradeGood3 from '@/assets/icons/color/trade-good-3.png';

interface StrategyCardProps {
  cardId: number;
  tradeGoodBonus: number;
  isSelected: boolean;
  isPicked: boolean;
  pickedBy?: {
    factionId: string;
    factionName: string;
    playerName: string;
    color: string;
  };
  onClick: () => void;
}

export function StrategyCard({
  cardId,
  tradeGoodBonus,
  isSelected,
  isPicked,
  pickedBy,
  onClick,
}: StrategyCardProps) {
  const card = STRATEGY_CARDS.find((c) => c.id === cardId);

  if (!card) {
    return null;
  }

  const tradeGoodImage = tradeGoodBonus === 1 ? tradeGood1 : tradeGood3;

  return (
    <div
      className={`${styles.cardContainer} ${isSelected ? styles.selected : ''} ${isPicked ? styles.picked : ''}`}
      onClick={!isPicked ? onClick : undefined}
      role="button"
      tabIndex={isPicked ? -1 : 0}
      aria-label={`Strategy Card ${cardId}: ${card.name}`}
      aria-disabled={isPicked}
      style={{
        '--strategy-color': card.color,
        borderColor: card.color,
      } as React.CSSProperties}
    >
      {tradeGoodBonus > 0 && !isPicked && (
        <div className={styles.bonusBadge}>
          <img src={tradeGoodImage} alt="Trade Good" className={styles.bonusImage} />
          <span className={styles.bonusText}>+{tradeGoodBonus}</span>
        </div>
      )}

      <div className={styles.cardHeader}>
        <div className={styles.cardNumber} style={{ borderColor: card.color } as React.CSSProperties}>
          {cardId}
        </div>
        <div className={styles.cardName}>{card.name.toUpperCase()}</div>
      </div>

      <div className={styles.cardActions}>
        {isPicked && pickedBy ? (
          <div className={styles.pickedOverlay}>
            <img
              src={getFactionImage(pickedBy.factionId, 'color')}
              alt={pickedBy.factionName}
              className={styles.factionIcon}
            />
            <div className={styles.pickedInfo}>
              <div className={styles.factionName}>{pickedBy.factionName}</div>
              <div className={styles.playerName} style={{ color: pickedBy.color }}>
                {pickedBy.playerName}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.actionSection}>
              <div className={styles.actionLabel}>PRIMARY</div>
              <div className={styles.actionText}>{card.primary}</div>
            </div>
            <div className={styles.actionSection}>
              <div className={styles.actionLabel}>SECONDARY</div>
              <div className={styles.actionText}>{card.secondary}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
