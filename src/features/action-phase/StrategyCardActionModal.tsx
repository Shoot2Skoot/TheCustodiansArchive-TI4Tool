import { Button } from '@/components/common';
import { STRATEGY_CARDS } from '@/lib/constants';
import { AbilityText } from '@/features/strategy-phase/AbilityText';
import styles from './StrategyCardActionModal.module.css';

interface StrategyCardActionModalProps {
  strategyCardId: number;
  playerName: string;
  onClose: () => void;
}

export function StrategyCardActionModal({
  strategyCardId,
  playerName,
  onClose,
}: StrategyCardActionModalProps) {
  const card = STRATEGY_CARDS.find((c) => c.id === strategyCardId);

  if (!card) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header} style={{ backgroundColor: card.color }}>
          <div className={styles.cardNumber}>{card.id}</div>
          <div className={styles.cardTitle}>
            <h2>{card.name}</h2>
            <p>{playerName} is using this strategy card</p>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.abilitySection}>
            <h3 className={styles.abilityLabel}>
              <span className={styles.primaryBadge}>PRIMARY</span> Active Player
            </h3>
            <div className={styles.abilityText}>
              <AbilityText text={card.primary} />
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.abilitySection}>
            <h3 className={styles.abilityLabel}>
              <span className={styles.secondaryBadge}>SECONDARY</span> Other Players
            </h3>
            <div className={styles.abilityText}>
              <AbilityText text={card.secondary} />
            </div>
            <p className={styles.secondaryNote}>
              Requires spending 1 command token from your strategy allocation
            </p>
          </div>
        </div>

        <div className={styles.footer}>
          <Button onClick={onClose} variant="primary" size="large">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
