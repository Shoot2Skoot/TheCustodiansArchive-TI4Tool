import type { Mech } from '@/data/factions/types';
import styles from './MechSection.module.css';

interface MechSectionProps {
  mech: Mech;
}

export function MechSection({ mech }: MechSectionProps) {
  return (
    <div className={styles.content}>
      <div className={styles.name}>{mech.name}</div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Cost:</span>
          <span className={styles.statValue}>{mech.cost}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Combat:</span>
          <span className={styles.statValue}>{mech.combat}</span>
        </div>
      </div>

      {mech.abilities.length > 0 && (
        <div className={styles.abilities}>
          {mech.abilities.map((ability, index) => (
            <div key={index} className={styles.ability}>
              {ability}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
