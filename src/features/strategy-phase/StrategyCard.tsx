import { useState, useEffect, useRef } from 'react';
import { STRATEGY_CARDS } from '@/lib/constants';
import { getFactionImage } from '@/lib/factions';
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
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Alternate between primary and secondary every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setShowPrimary((prev) => !prev);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Handle mouse enter with delay
  const handleMouseEnter = () => {
    if (isPicked) return; // Don't expand picked cards

    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    hoverTimeoutRef.current = setTimeout(() => {
      setIsExpanded(true);
    }, 600); // 600ms delay - intentional but responsive
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsExpanded(false);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  if (!card) {
    return null;
  }

  const tradeGoodImage = tradeGoodBonus === 1 ? tradeGood1 : tradeGood3;

  return (
    <div
      className={styles.cardWrapper}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
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
