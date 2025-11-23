import { useEffect, useState } from 'react';
import { Panel, Button } from '@/components/common';
import { PhaseType } from '@/lib/audio';
import { playPhaseEnter, playPhaseExit } from '@/lib/audio';
import { advancePhase } from '@/lib/db/gameState';
import type { GamePhase } from '@/types';
import styles from './StatusPhase.module.css';

interface StatusPhaseProps {
  gameId: string;
  roundNumber: number;
  onComplete: () => void;
}

export function StatusPhase({ gameId, roundNumber, onComplete }: StatusPhaseProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Play phase entry audio on mount
  useEffect(() => {
    playPhaseEnter(PhaseType.STATUS);
  }, []);

  const handleContinue = async () => {
    if (isTransitioning) return;

    setIsTransitioning(true);

    try {
      // Play phase exit audio
      playPhaseExit(PhaseType.STATUS);

      // Advance to next phase (agenda)
      await advancePhase(gameId, 'status' as GamePhase);

      // Call onComplete to trigger state reload in GamePage
      onComplete();
    } catch (error) {
      console.error('Error advancing from status phase:', error);
      setIsTransitioning(false);
    }
  };

  return (
    <div className={styles.container}>
      <Panel className={styles.mainPanel} beveled>
        <div className={styles.content}>
          <h2 className={styles.title}>Status Phase</h2>
          <div className={styles.description}>
            <p>During the Status Phase, players perform the following steps:</p>
            <ol className={styles.stepsList}>
              <li>Score objectives</li>
              <li>Reveal new public objective</li>
              <li>Draw action cards</li>
              <li>Remove command tokens from board</li>
              <li>Gain and redistribute command tokens</li>
              <li>Ready cards (planets, technologies, etc.)</li>
              <li>Repair units</li>
              <li>Return strategy cards</li>
            </ol>
            <p className={styles.note}>
              <strong>Note:</strong> This phase is currently a placeholder.
              Perform these steps manually and click Continue when ready.
            </p>
          </div>
          <div className={styles.actions}>
            <Button
              onClick={handleContinue}
              variant="primary"
              size="large"
              disabled={isTransitioning}
            >
              {isTransitioning ? 'Advancing...' : 'Continue to Agenda Phase'}
            </Button>
          </div>
        </div>
      </Panel>
    </div>
  );
}
