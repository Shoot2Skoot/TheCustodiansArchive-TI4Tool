import type { FactionData } from '@/data/factions';
import { getFactionImage } from '@/lib/factions';
import styles from './FactionHeader.module.css';

interface FactionHeaderProps {
  player: any;
  faction: FactionData;
}

export function FactionHeader({ player, faction }: FactionHeaderProps) {
  return (
    <div className={styles.factionHeader}>
      <img
        src={getFactionImage(faction.id, 'color')}
        alt={faction.name}
        className={styles.factionIcon}
      />
      <div className={styles.factionInfo}>
        <h2 className={styles.factionName}>{faction.name}</h2>
        <div className={styles.playerInfo}>
          <span className={`${styles.playerColor} ${styles[player.color]}`}>
            {player.color}
          </span>
          {player.displayName && (
            <span className={styles.playerName}>{player.displayName}</span>
          )}
        </div>
      </div>
    </div>
  );
}
