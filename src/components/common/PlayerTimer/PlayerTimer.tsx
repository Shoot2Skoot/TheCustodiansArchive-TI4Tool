import { useState, useEffect } from 'react';
import { formatTime, getCurrentElapsedTime } from '@/lib/db/timers';
import type { TimerTracking } from '@/types';
import styles from './PlayerTimer.module.css';

interface PlayerTimerProps {
  timerData: TimerTracking | null;
  playerName?: string;
  isPaused?: boolean;
  compact?: boolean;
  showRoundTime?: boolean;
  currentRoundTime?: number; // Optional: pass in current round time
  hidePlayerName?: boolean; // Hide player name when shown next to current player
  hideTotalTime?: boolean; // Hide total time display
}

export function PlayerTimer({
  timerData,
  playerName,
  isPaused = false,
  compact = false,
  showRoundTime = true,
  currentRoundTime,
  hidePlayerName = false,
  hideTotalTime = false,
}: PlayerTimerProps) {
  const [currentElapsed, setCurrentElapsed] = useState(0);

  // Update elapsed time every second if active and not paused
  useEffect(() => {
    if (!timerData || !timerData.isCurrentTurn || isPaused) {
      return;
    }

    // Update immediately
    setCurrentElapsed(getCurrentElapsedTime(timerData));

    // Then update every second
    const interval = setInterval(() => {
      setCurrentElapsed(getCurrentElapsedTime(timerData));
    }, 1000);

    return () => clearInterval(interval);
  }, [timerData, isPaused]);

  if (!timerData) {
    return null;
  }

  const totalTime = timerData.totalTimeSeconds + currentElapsed;
  const isActive = timerData.isCurrentTurn && !isPaused;

  if (compact) {
    return (
      <div className={`${styles.container} ${styles.compact} ${isActive ? styles.active : ''}`}>
        <div className={styles.compactContent}>
          <span className={styles.playerName}>{playerName}</span>
          <span className={styles.time}>{formatTime(totalTime)}</span>
        </div>
        {isActive && <div className={styles.activeIndicator} />}
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${isActive ? styles.active : ''} ${hidePlayerName ? styles.noHeader : ''}`}>
      {!hidePlayerName && (
        <div className={styles.header}>
          <span className={styles.playerName}>{playerName}</span>
          {isActive && !isPaused && (
            <span className={styles.activeLabel}>Active Turn</span>
          )}
          {isPaused && isActive && (
            <span className={styles.pausedLabel}>Paused</span>
          )}
        </div>
      )}

      <div className={styles.times}>
        {showRoundTime && (
          <div className={styles.timeRow}>
            <span className={styles.label}>Current Round:</span>
            <span className={styles.value}>
              {formatTime((currentRoundTime ?? 0) + currentElapsed)}
            </span>
          </div>
        )}
        {!hideTotalTime && (
          <div className={styles.timeRow}>
            <span className={styles.label}>Total Time:</span>
            <span className={styles.value}>{formatTime(totalTime)}</span>
          </div>
        )}
      </div>

      {isActive && !isPaused && !hidePlayerName && <div className={styles.activeIndicator} />}
    </div>
  );
}
