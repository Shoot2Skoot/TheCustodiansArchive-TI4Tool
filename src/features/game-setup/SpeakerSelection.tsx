import { useState } from 'react';
import { Button } from '@/components/common';
import { getFactionImage } from '@/lib/factions';
import type { PlayerColor } from '@/types/enums';
import styles from './SpeakerSelection.module.css';

interface PlayerSetup {
  position: number;
  color: PlayerColor | null;
  factionId: string | null;
  displayName: string;
}

interface SpeakerSelectionProps {
  players: PlayerSetup[];
  onSelect: (speakerPosition: number) => void;
  onBack: () => void;
  isCreating?: boolean;
}

export function SpeakerSelection({ players, onSelect, onBack, isCreating = false }: SpeakerSelectionProps) {
  const [selectedSpeaker, setSelectedSpeaker] = useState<number | null>(null);

  const handleRandomSpeaker = () => {
    if (players.length === 0) return;
    const randomIndex = Math.floor(Math.random() * players.length);
    const randomPlayer = players[randomIndex];
    if (!randomPlayer) return;
    setSelectedSpeaker(randomPlayer.position);
  };

  const handleCreateGame = () => {
    if (selectedSpeaker !== null) {
      onSelect(selectedSpeaker);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Select Speaker</h2>
        <p className={styles.description}>
          Who will be the starting speaker?
        </p>
        <Button
          variant="secondary"
          size="small"
          onClick={handleRandomSpeaker}
          className={styles.randomButton}
        >
          🎲 Random Speaker
        </Button>
      </div>

      <div className={styles.playerGrid}>
        {players.map((player) => (
          <button
            key={player.position}
            className={`${styles.playerCard} ${selectedSpeaker === player.position ? styles.selected : ''}`}
            onClick={() => setSelectedSpeaker(player.position)}
          >
            <div className={styles.speakerBadge}>
              {selectedSpeaker === player.position && '👑'}
            </div>

            <div className={styles.factionImage}>
              {player.factionId && (
                <img
                  src={getFactionImage(player.factionId)}
                  alt={player.factionId}
                />
              )}
            </div>

            <div className={styles.playerInfo}>
              <div
                className={styles.colorDot}
                style={{ backgroundColor: `var(--color-player-${player.color})` }}
              />
              <div className={styles.playerName}>{player.displayName}</div>
            </div>

            <div className={styles.position}>Player {player.position}</div>
          </button>
        ))}
      </div>

      <div className={styles.infoBox}>
        <h3 className={styles.infoTitle}>About the Speaker</h3>
        <p className={styles.infoText}>
          The Speaker token determines turn order and breaks ties. The Speaker:
        </p>
        <ul className={styles.infoList}>
          <li>Goes first when selecting strategy cards</li>
          <li>Breaks ties during the agenda phase</li>
          <li>May pass the Speaker token using the Politics strategy card</li>
        </ul>
      </div>

      <div className={styles.actions}>
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button
          variant="primary"
          size="large"
          onClick={handleCreateGame}
          disabled={selectedSpeaker === null || isCreating}
        >
          {isCreating ? 'Creating Game...' : 'Create Game'}
        </Button>
      </div>
    </div>
  );
}
