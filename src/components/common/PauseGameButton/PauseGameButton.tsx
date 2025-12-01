import { useState } from 'react';
import { Button } from '@/components/common';
import { pauseGame, resumeGame } from '@/lib/db/timers';
import { getCurrentUserId } from '@/lib/auth';
import { useToast } from '@/components/common';
import styles from './PauseGameButton.module.css';

interface PauseGameButtonProps {
  gameId: string;
  isPaused: boolean;
  isHost: boolean;
  onPauseChange?: (isPaused: boolean) => void;
  compact?: boolean;
}

export function PauseGameButton({
  gameId,
  isPaused,
  isHost,
  onPauseChange,
  compact = false,
}: PauseGameButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const handleTogglePause = async () => {
    const userId = getCurrentUserId();
    if (!userId) {
      addToast('You must be logged in to pause the game', 'error');
      return;
    }

    setIsLoading(true);
    try {
      if (isPaused) {
        await resumeGame(gameId);
        addToast('Game resumed', 'success');
        onPauseChange?.(false);
      } else {
        await pauseGame(gameId, userId);
        addToast('Game paused', 'info');
        onPauseChange?.(true);
      }
    } catch (error) {
      console.error('Error toggling pause:', error);
      addToast(
        `Failed to ${isPaused ? 'resume' : 'pause'} game`,
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isHost) {
    // Non-hosts see pause status but can't control it
    if (!isPaused) return null;

    return (
      <div className={styles.pausedIndicator}>
        <span className={styles.pauseIcon}>⏸</span>
        <span className={styles.pauseText}>Game Paused</span>
      </div>
    );
  }

  return (
    <Button
      variant={isPaused ? 'primary' : 'secondary'}
      onClick={handleTogglePause}
      disabled={isLoading}
      className={compact ? styles.compactButton : ''}
      title={isPaused ? 'Resume game and timers' : 'Pause game and timers'}
    >
      <span className={styles.buttonContent}>
        <span className={styles.icon}>
          {isPaused ? '▶' : '⏸'}
        </span>
        {!compact && (
          <span className={styles.text}>
            {isPaused ? 'Resume' : 'Pause'}
          </span>
        )}
      </span>
    </Button>
  );
}
