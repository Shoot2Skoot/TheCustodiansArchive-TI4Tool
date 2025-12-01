import type { Technology } from '@/data/factions/types';
import styles from './StartingTechSection.module.css';

interface StartingTechSectionProps {
  technologies: Technology[];
}

export function StartingTechSection({ technologies }: StartingTechSectionProps) {
  const getColorClass = (color: string | undefined) => {
    if (!color) return '';
    switch (color.toLowerCase()) {
      case 'green':
        return styles.colorGreen;
      case 'red':
        return styles.colorRed;
      case 'blue':
        return styles.colorBlue;
      case 'yellow':
        return styles.colorYellow;
      default:
        return '';
    }
  };

  return (
    <div className={styles.content}>
      {technologies.length === 0 ? (
        <div className={styles.none}>None</div>
      ) : (
        technologies.map((tech, index) => (
          <div key={index} className={styles.tech}>
            <span className={`${styles.indicator} ${getColorClass(tech.color)}`}></span>
            <span className={styles.techName}>{tech.name}</span>
          </div>
        ))
      )}
    </div>
  );
}
