import { STRATEGY_CARDS } from '@/lib/constants';
import { StrategyCardNumber, Button } from '@/components/common';
import { AbilityText } from '../strategy-phase/AbilityText';
import styles from './ActionStrategyCard.module.css';

interface ActionStrategyCardProps {
  cardId: number;
  isUsed: boolean;
  usedOnTurn?: number;
  isInProgress?: boolean;
  onDone?: () => void;
  onCancel?: () => void;
}

export function ActionStrategyCard({
  cardId,
  isUsed,
  usedOnTurn,
  isInProgress = false,
  onDone,
  onCancel,
}: ActionStrategyCardProps) {
  const card = STRATEGY_CARDS.find((c) => c.id === cardId);

  if (!card) {
    return null;
  }

  return (
    <div className={styles.cardWrapper}>
      <div
        className={`${styles.cardContainer} ${isUsed ? styles.used : ''} ${isInProgress ? styles.inProgress : ''}`}
        style={{
          '--strategy-color': card.color,
          borderColor: card.color,
        } as React.CSSProperties}
      >
        <div className={styles.cardHeader}>
          <StrategyCardNumber number={cardId} color={card.color} size="medium" />
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
              {isInProgress && (
                <div className={styles.buttonContainer}>
                  {onCancel && (
                    <Button
                      onClick={onCancel}
                      variant="secondary"
                      size="large"
                      style={{ minWidth: '200px', fontSize: 'var(--font-size-2xl)', padding: 'var(--space-4) var(--space-6)' }}
                    >
                      Cancel
                    </Button>
                  )}
                  {onDone && (
                    <Button
                      onClick={onDone}
                      variant="primary"
                      size="large"
                      customColor="#1a1a1a"
                      customBorderColor="#22c55e"
                      style={{ minWidth: '225px', fontSize: 'var(--font-size-2xl)', padding: 'var(--space-4) var(--space-6)' }}
                    >
                      Done
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
