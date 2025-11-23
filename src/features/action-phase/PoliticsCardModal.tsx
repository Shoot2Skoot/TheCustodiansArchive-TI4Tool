import { useState } from 'react';
import { Button, StrategyCardNumber } from '@/components/common';
import { getFactionImage } from '@/lib/factions';
import styles from './PoliticsCardModal.module.css';

const POLITICS_CARD_COLOR = '#fff202';

interface Player {
  id: string;
  displayName: string;
  color: string;
  factionName: string;
  factionId: string;
}

interface PoliticsCardModalProps {
  players: Player[];
  currentSpeakerId: string | null;
  onSelectSpeaker: (playerId: string) => void;
  onCancel: () => void;
}

export function PoliticsCardModal({
  players,
  currentSpeakerId,
  onSelectSpeaker,
  onCancel,
}: PoliticsCardModalProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const handleConfirm = () => {
    if (selectedPlayerId) {
      onSelectSpeaker(selectedPlayerId);
    }
  };

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <StrategyCardNumber number={3} color={POLITICS_CARD_COLOR} size="medium" />
          <div className={styles.headerText}>
            <h2 className={styles.headerTitle}>POLITICS</h2>
            <p className={styles.headerSubtitle}>Choose New Speaker</p>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.playerGrid}>
            {players.map((player) => {
              const isCurrentSpeaker = player.id === currentSpeakerId;
              const isSelected = player.id === selectedPlayerId;

              return (
                <button
                  key={player.id}
                  className={`${styles.playerOption} ${isSelected ? styles.selected : ''} ${isCurrentSpeaker ? styles.currentSpeaker : ''}`}
                  onClick={() => !isCurrentSpeaker && setSelectedPlayerId(player.id)}
                  disabled={isCurrentSpeaker}
                  style={{
                    '--player-color': player.color,
                  } as React.CSSProperties}
                >
                  <img
                    src={getFactionImage(player.factionId, 'color')}
                    alt={player.factionName}
                    className={styles.factionIcon}
                  />
                  <div className={styles.playerInfo}>
                    <div className={styles.playerFaction} style={{ color: player.color }}>
                      {player.factionName}
                    </div>
                    <div className={styles.playerName}>{player.displayName}</div>
                  </div>
                  {isCurrentSpeaker && (
                    <div className={styles.speakerBadge}>Current Speaker</div>
                  )}
                  {isSelected && <div className={styles.checkmark}>✓</div>}
                </button>
              );
            })}
          </div>

          {selectedPlayerId && (
            <div className={styles.selectionInfo}>
              <strong>
                {players.find((p) => p.id === selectedPlayerId)?.displayName}
              </strong>{' '}
              will become the new speaker
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <Button onClick={onCancel} variant="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant="primary"
            disabled={!selectedPlayerId || selectedPlayerId === currentSpeakerId}
          >
            Confirm New Speaker
          </Button>
        </div>
      </div>
    </div>
  );
}
