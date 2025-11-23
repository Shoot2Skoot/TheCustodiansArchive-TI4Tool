import { useEffect, useState } from 'react';
import { Panel, Button } from '@/components/common';
import { PhaseType } from '@/lib/audio';
import { playPhaseEnter, playPhaseExit } from '@/lib/audio';
import { advancePhase } from '@/lib/db/gameState';
import type { GamePhase } from '@/types';
import styles from './AgendaPhase.module.css';

interface AgendaPhaseProps {
  gameId: string;
  roundNumber: number;
  onComplete: () => void;
}

export function AgendaPhase({ gameId, roundNumber, onComplete }: AgendaPhaseProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Play phase entry audio on mount
  useEffect(() => {
    playPhaseEnter(PhaseType.AGENDA);
  }, []);

  const handleContinue = async () => {
    if (isTransitioning) return;

    setIsTransitioning(true);

    try {
      // Play phase exit audio
      playPhaseExit(PhaseType.AGENDA);

      // Advance to next phase (this will loop back to strategy and increment round)
      await advancePhase(gameId, 'agenda' as GamePhase);

      // Call onComplete to trigger state reload in GamePage
      onComplete();
    } catch (error) {
      console.error('Error advancing from agenda phase:', error);
      setIsTransitioning(false);
    }
  };

  return (
    <div className={styles.container}>
      <Panel className={styles.mainPanel} beveled>
        <div className={styles.content}>
          <h2 className={styles.title}>Agenda Phase</h2>
          <div className={styles.description}>
            <p>During the Agenda Phase, players vote on political outcomes:</p>
            <ol className={styles.stepsList}>
              <li>First Agenda - Reveal and resolve first agenda card</li>
              <li>Second Agenda - Reveal and resolve second agenda card</li>
              <li>Ready planets used for votes</li>
            </ol>
            <p className={styles.info}>
              The speaker always votes last and breaks ties.
              Players may use action cards and promissory notes during voting.
            </p>
            <p className={styles.note}>
              <strong>Note:</strong> This phase is currently a placeholder.
              Perform agenda voting manually and click Continue when ready.
            </p>
          </div>
          <div className={styles.roundAdvance}>
            <div className={styles.roundInfo}>
              Completing this phase will advance to <strong>Round {roundNumber + 1}</strong>
            </div>
          </div>
          <div className={styles.actions}>
            <Button
              onClick={handleContinue}
              variant="primary"
              size="large"
              disabled={isTransitioning}
            >
              {isTransitioning ? 'Advancing...' : `Continue to Round ${roundNumber + 1}`}
            </Button>
          </div>
        </div>
      </Panel>
    </div>
  );
}
