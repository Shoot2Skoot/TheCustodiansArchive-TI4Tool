import type { HomeSystem } from '@/data/factions/types';
import styles from './HomeSystemSection.module.css';

interface HomeSystemSectionProps {
  homeSystem: HomeSystem;
}

export function HomeSystemSection({ homeSystem }: HomeSystemSectionProps) {
  return (
    <div className={styles.content}>
      {homeSystem.planets.map((planet, index) => (
        <div key={index} className={styles.planet}>
          <div className={styles.planetName}>{planet.name}</div>
          <div className={styles.planetStats}>
            <span className={styles.resource}>{planet.resources}</span>
            <span className={styles.separator}>/</span>
            <span className={styles.influence}>{planet.influence}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
