import type { Flagship } from '@/data/factions/types';
import styles from './FlagshipSection.module.css';

interface FlagshipSectionProps {
  flagship: Flagship;
}

export function FlagshipSection({ flagship }: FlagshipSectionProps) {
  return (
    <div className={styles.content}>
        <div className={styles.name}>{flagship.name}</div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Cost:</span>
            <span className={styles.statValue}>{flagship.cost}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Combat:</span>
            <span className={styles.statValue}>{flagship.combat}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Move:</span>
            <span className={styles.statValue}>{flagship.move}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Capacity:</span>
            <span className={styles.statValue}>{flagship.capacity}</span>
          </div>
        </div>

      {flagship.abilities.length > 0 && (
        <div className={styles.abilities}>
          {flagship.abilities.map((ability, index) => (
            <div key={index} className={styles.ability}>
              {ability}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
