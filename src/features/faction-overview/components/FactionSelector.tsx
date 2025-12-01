import type { FactionData } from '@/data/factions';
import { getFactionImage } from '@/lib/factions';
import styles from './FactionSelector.module.css';

interface FactionSelectorProps {
  playerFactions: Array<{ player: any; faction: FactionData }>;
  selectedFactionId: string;
  onSelectFaction: (factionId: string) => void;
}

export function FactionSelector({
  playerFactions,
  selectedFactionId,
  onSelectFaction,
}: FactionSelectorProps) {
  return (
    <div className={styles.selector}>
      <div className={styles.label}>Select Faction:</div>
      <div className={styles.factionButtons}>
        {playerFactions.map(({ player, faction }) => (
          <button
            key={faction.id}
            className={`${styles.factionButton} ${
              selectedFactionId === faction.id ? styles.selected : ''
            }`}
            onClick={() => onSelectFaction(faction.id)}
            title={faction.name}
          >
            <img
              src={getFactionImage(faction.id, 'color')}
              alt={faction.name}
              className={styles.factionIcon}
            />
            <span className={styles.factionName}>{faction.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
