import { useState, useEffect } from 'react';
import { STRATEGY_CARDS } from '@/lib/constants';
import { AbilityText } from '../strategy-phase/AbilityText';
import styles from './ActionStrategyCard.module.css';

interface ActionStrategyCardProps {
  cardId: number;
  isUsed: boolean;
  usedOnTurn?: number;
}

export function ActionStrategyCard({
  cardId,
  isUsed,
  usedOnTurn,
}: ActionStrategyCardProps) {
  const card = STRATEGY_CARDS.find((c) => c.id === cardId);
  const [showPrimary, setShowPrimary] = useState(true);

  // Alternate between primary and secondary every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setShowPrimary((prev) => !prev);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  if (!card) {
    return null;
  }

  return (
    <div className={styles.cardWrapper}>
      <div
        className={`${styles.cardContainer} ${isUsed ? styles.used : ''}`}
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
          {isUsed ? (
            <div className={styles.usedOverlay}>
              <div className={styles.usedIcon}>✓</div>
              <div className={styles.usedInfo}>
                <div className={styles.usedTitle}>Strategy Card Used</div>
                {usedOnTurn && (
                  <div className={styles.usedTurn}>Used on Turn {usedOnTurn}</div>
                )}
              </div>
            </div>
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
