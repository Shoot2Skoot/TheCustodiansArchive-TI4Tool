import { useState } from 'react';
import { Modal, Button } from '@/components/common';
import styles from './PlayPhaseEndEffectModal.module.css';
import quantumDataHubNode from '@/assets/cards/quantum-datahub-node.png';

type PhaseEndEffect = 'quantum-datahub' | 'imperial-arbiter';

interface StrategySelection {
  playerId: string;
  cardId: number;
  tradeGoodBonus: number;
  selectionOrder: number;
}

interface Player {
  id: string;
  position: number;
  displayName: string;
  color: string;
  factionName: string;
  factionId: string;
}

interface PlayPhaseEndEffectModalProps {
  isOpen: boolean;
  onClose: () => void;
  selections: StrategySelection[];
  players: Player[];
  onSwapComplete: (selection1Id: number, selection2Id: number) => void;
}

export function PlayPhaseEndEffectModal({
  isOpen,
  onClose,
  selections,
  players,
  onSwapComplete,
}: PlayPhaseEndEffectModalProps) {
  const [selectedEffect, setSelectedEffect] = useState<PhaseEndEffect | null>(null);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);

  const handleEffectSelect = (effect: PhaseEndEffect) => {
    setSelectedEffect(effect);
    setSelectedCards([]);
  };

  const handleCardClick = (cardId: number) => {
    if (selectedCards.includes(cardId)) {
      setSelectedCards(selectedCards.filter((id) => id !== cardId));
    } else if (selectedCards.length < 2) {
      setSelectedCards([...selectedCards, cardId]);
    }
  };

  const handleConfirmSwap = () => {
    if (selectedCards.length === 2) {
      onSwapComplete(selectedCards[0]!, selectedCards[1]!);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedEffect(null);
    setSelectedCards([]);
    onClose();
  };

  const handleBack = () => {
    setSelectedEffect(null);
    setSelectedCards([]);
  };

  // Get player info for a selection
  const getPlayerForSelection = (selection: StrategySelection) => {
    return players.find((p) => p.id === selection.playerId);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Play Phase End Effect">
      <div className={styles.modalContent}>
        {!selectedEffect ? (
          // Step 1: Select which effect to play
          <div className={styles.effectSelection}>
            <p className={styles.instructions}>Select which effect you want to play:</p>
            <div className={styles.effectOptions}>
              <button
                className={styles.effectCard}
                onClick={() => handleEffectSelect('quantum-datahub')}
              >
                <img
                  src={quantumDataHubNode}
                  alt="Quantum Datahub Node"
                  className={styles.cardImage}
                />
                <div className={styles.cardLabel}>Quantum Datahub Node</div>
                <div className={styles.cardSubtitle}>Emirates of Hacan Technology</div>
              </button>

              <button
                className={styles.effectCard}
                onClick={() => handleEffectSelect('imperial-arbiter')}
              >
                <div className={styles.placeholderImage}>
                  <span className={styles.placeholderText}>Image Coming Soon</span>
                </div>
                <div className={styles.cardLabel}>Imperial Arbiter</div>
                <div className={styles.cardSubtitle}>Agenda Card</div>
              </button>
            </div>
          </div>
        ) : (
          // Step 2: Select two cards to swap
          <div className={styles.swapSelection}>
            <p className={styles.instructions}>
              Select two strategy cards to swap:
              <span className={styles.selectionCount}>
                {' '}
                ({selectedCards.length}/2 selected)
              </span>
            </p>

            <div className={styles.cardList}>
              {selections.map((selection) => {
                const player = getPlayerForSelection(selection);
                const isSelected = selectedCards.includes(selection.cardId);

                return (
                  <button
                    key={selection.cardId}
                    className={`${styles.selectionItem} ${isSelected ? styles.selected : ''}`}
                    onClick={() => handleCardClick(selection.cardId)}
                    disabled={!isSelected && selectedCards.length >= 2}
                  >
                    <div className={styles.cardNumber}>{selection.cardId}</div>
                    <div className={styles.selectionInfo}>
                      <div className={styles.playerName}>
                        {player?.factionName} ({player?.displayName})
                      </div>
                    </div>
                    {isSelected && <div className={styles.checkmark}>✓</div>}
                  </button>
                );
              })}
            </div>

            <div className={styles.actions}>
              <Button variant="secondary" onClick={handleBack}>
                Back
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmSwap}
                disabled={selectedCards.length !== 2}
              >
                Confirm Swap
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
