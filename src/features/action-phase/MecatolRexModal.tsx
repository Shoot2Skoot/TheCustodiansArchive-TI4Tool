import { useState } from 'react';
import { Button } from '@/components/common';
import { getFactionImage } from '@/lib/factions';
import mecatolImage from '@/assets/mecatol/mecatol.png';
import custodiansImage from '@/assets/mecatol/Custodians.png';
import styles from './MecatolRexModal.module.css';

interface Player {
  id: string;
  displayName: string;
  color: string;
  factionName: string;
  factionId: string;
}

interface MecatolRexModalProps {
  players: Player[];
  mecatolRexOwnerId: string | null;
  custodiansTaken: boolean;
  onClaimMecatolRex: (playerId: string) => void;
  onClose: () => void;
}

type ModalState = 'display' | 'selecting';

export function MecatolRexModal({
  players,
  mecatolRexOwnerId,
  custodiansTaken,
  onClaimMecatolRex,
  onClose,
}: MecatolRexModalProps) {
  const [modalState, setModalState] = useState<ModalState>('display');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [ownershipChanged, setOwnershipChanged] = useState(false);

  const currentOwner = mecatolRexOwnerId ? players.find(p => p.id === mecatolRexOwnerId) : null;

  const handleClaimClick = () => {
    setModalState('selecting');
  };

  const handlePlayerSelect = (playerId: string) => {
    setSelectedPlayerId(playerId);
  };

  const handleConfirm = () => {
    if (!selectedPlayerId) return;

    setIsTransitioning(true);
    setModalState('display');

    // Fade out current icon, then call the claim function
    setTimeout(() => {
      onClaimMecatolRex(selectedPlayerId);
      setSelectedPlayerId(null);
      setIsTransitioning(false);
      setOwnershipChanged(true);
    }, 300);
  };

  const handleCancel = () => {
    if (modalState === 'selecting') {
      setModalState('display');
      setSelectedPlayerId(null);
    } else {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {modalState === 'display' ? (
          <>
            <div className={styles.header}>
              <h2>Mecatol Rex</h2>
              <p className={styles.subtitle}>
                {!custodiansTaken
                  ? "Under the protection of the custodians"
                  : `Under the control of ${currentOwner?.factionName || 'Unknown'}`
                }
              </p>
            </div>

            <div className={styles.content}>
              <div className={styles.instructionText}>
                {!custodiansTaken
                  ? "Click the Custodians token to claim Mecatol Rex (and gain one victory point)"
                  : "Click the faction icon to claim Mecatol Rex"
                }
              </div>

              <div className={styles.mecatolContainer}>
                {/* Image wrapper for proper absolute positioning */}
                <div className={styles.imageWrapper}>
                  <img src={mecatolImage} alt="Mecatol Rex" className={styles.mecatolImage} />

                  {/* Custodians Token or Faction Icon */}
                  <div className={styles.centerToken}>
                    {!custodiansTaken ? (
                      <button
                        className={`${styles.custodiansToken} ${isTransitioning ? styles.fadeOut : ''}`}
                        onClick={handleClaimClick}
                      >
                        <img
                          src={custodiansImage}
                          alt="Custodians Token"
                          className={styles.custodiansImage}
                        />
                        <div className={styles.tooltip}>Claim Mecatol Rex</div>
                      </button>
                    ) : currentOwner ? (
                      <button
                        className={`${styles.factionToken} ${isTransitioning ? styles.fadeOut : ''} ${styles.fadeIn}`}
                        onClick={handleClaimClick}
                        style={{
                          // @ts-ignore - CSS custom property
                          '--player-color': currentOwner.color,
                          animation: 'factionPulse 2s ease-in-out infinite'
                        }}
                      >
                        <img
                          src={getFactionImage(currentOwner.factionId, 'color')}
                          alt={currentOwner.factionName}
                          className={styles.factionImage}
                        />
                        <div className={styles.tooltip}>
                          Controlled by {currentOwner.displayName}<br/>
                          Click to change owner
                        </div>
                      </button>
                    ) : null}
                  </div>
                </div>

                {currentOwner && (
                  <div className={styles.ownerInfo}>
                    <strong style={{ color: currentOwner.color }}>{currentOwner.factionName}</strong>
                    {' '}controls Mecatol Rex
                  </div>
                )}
              </div>
            </div>

            <div className={styles.footer}>
              <Button onClick={onClose} variant="secondary">
                {ownershipChanged ? 'Close' : 'Cancel'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className={styles.header}>
              <h2>Claim Mecatol Rex</h2>
              <p>Select which player is claiming control</p>
            </div>

            <div className={styles.content}>
              <div className={styles.playerGrid}>
                {players.map((player) => {
                  const isCurrentOwner = player.id === mecatolRexOwnerId;
                  const isSelected = player.id === selectedPlayerId;

                  return (
                    <button
                      key={player.id}
                      className={`${styles.playerOption} ${isSelected ? styles.selected : ''} ${isCurrentOwner ? styles.currentOwner : ''}`}
                      onClick={() => handlePlayerSelect(player.id)}
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
                      {isCurrentOwner && (
                        <div className={styles.ownerBadge}>Current Owner</div>
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
                  will claim Mecatol Rex
                  {!custodiansTaken && ' and score 1 Victory Point'}
                </div>
              )}
            </div>

            <div className={styles.footer}>
              <Button onClick={handleCancel} variant="secondary">
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                variant="primary"
                disabled={!selectedPlayerId}
              >
                Confirm Claim
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
