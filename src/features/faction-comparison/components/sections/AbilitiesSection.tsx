import type { FactionAbility } from '@/data/factions/types';
import styles from './AbilitiesSection.module.css';

interface AbilitiesSectionProps {
  abilities: FactionAbility[];
}

export function AbilitiesSection({ abilities }: AbilitiesSectionProps) {
  return (
    <div className={styles.content}>
      {abilities.map((ability, index) => (
        <div key={index} className={styles.ability}>
          <div className={styles.abilityName}>{ability.name}</div>
          <div className={styles.abilityDescription}>{ability.description}</div>
        </div>
      ))}
    </div>
  );
}
