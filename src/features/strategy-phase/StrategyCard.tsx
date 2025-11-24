import { useState, useEffect } from 'react';
import { STRATEGY_CARDS } from '@/lib/constants';
import { getFactionImage } from '@/lib/factions';
import { StrategyCardNumber } from '@/components/common';
import { AbilityText } from './AbilityText';
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
  isBottomRow?: boolean;
}

export function StrategyCard({
  cardId,
  tradeGoodBonus,
  isSelected,
  isPicked,
  pickedBy,
  onClick,
  isBottomRow = false,
}: StrategyCardProps) {
  const card = STRATEGY_CARDS.find((c) => c.id === cardId);
  const [showPrimary, setShowPrimary] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  // Alternate between primary and secondary every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setShowPrimary((prev) => !prev);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Toggle expansion
  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card selection
    setIsExpanded((prev) => !prev);
  };

  if (!card) {
    return null;
  }

  const tradeGoodImage = tradeGoodBonus === 1 ? tradeGood1 : tradeGood3;

  return (
    <div className={styles.cardWrapper}>
      {tradeGoodBonus > 0 && !isPicked && (
        <div className={styles.bonusBadge}>
          <img src={tradeGoodImage} alt="Trade Good" className={styles.bonusImage} />
          <span className={styles.bonusText}>+{tradeGoodBonus}</span>
        </div>
      )}

      <div
        className={`${styles.cardContainer} ${isSelected ? styles.selected : ''} ${isPicked ? styles.picked : ''} ${isExpanded ? styles.expanded : ''} ${isBottomRow ? styles.bottomRow : ''}`}
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
        <div className={styles.cardHeader}>
          <StrategyCardNumber number={cardId} color={card.color} size="medium" />
          <div className={styles.cardName}>{card.name.toUpperCase()}</div>
          {!isPicked && (
            <button
              className={styles.expandButton}
              onClick={handleToggleExpand}
              aria-label={isExpanded ? 'Collapse card' : 'Expand card'}
            >
              {isExpanded ? '−' : '+'}
            </button>
          )}
        </div>

        <div className={styles.cardActions}>
          {isPicked && pickedBy ? (
            <div className={styles.pickedOverlay}>
              <img
                src={getFactionImage(pickedBy.factionId, 'color')}
                alt={pickedBy.factionName}
                className={styles.factionIcon}
              />
              {tradeGoodBonus > 0 && (
                <div className={styles.overlayBonus}>
                  <img src={tradeGoodImage} alt="Trade Good" className={styles.overlayBonusImage} />
                  <span className={styles.overlayBonusText}>+{tradeGoodBonus}</span>
                </div>
              )}
              <div className={styles.pickedInfo}>
                <div className={styles.factionName}>{pickedBy.factionName}</div>
                <div className={styles.playerName} style={{ color: pickedBy.color }}>
                  {pickedBy.playerName}
                </div>
              </div>
            </div>
          ) : isExpanded ? (
            <>
              <div className={`${styles.actionSection} ${styles.expandedSection}`}>
                <div className={styles.actionLabel}>PRIMARY</div>
                <div className={styles.abilityContent}>
                  <AbilityText text={card.primary} />
                </div>
              </div>
              <div className={`${styles.actionSection} ${styles.expandedSection}`}>
                <div className={styles.actionLabel}>SECONDARY</div>
                <div className={styles.abilityContent}>
                  <AbilityText text={card.secondary} />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className={styles.timerBar}>
                <div
                  key={showPrimary ? 'primary' : 'secondary'}
                  className={`${styles.timerProgress} ${showPrimary ? styles.timerFill : styles.timerEmpty}`}
                  style={{ '--strategy-color': card.color } as React.CSSProperties}
                />
              </div>
              <div className={`${styles.actionSection} ${styles.fullHeight}`}>
                <div className={styles.actionLabel}>{showPrimary ? 'PRIMARY' : 'SECONDARY'}</div>
                <div className={styles.abilityContent}>
                  <AbilityText text={showPrimary ? card.primary : card.secondary} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
