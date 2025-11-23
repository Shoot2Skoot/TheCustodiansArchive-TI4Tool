import { useEffect, useState, useRef, useCallback } from 'react';
import { Panel } from '@/components/common';
import { useStore } from '@/store';
import { getCurrentUserId } from '@/lib/auth';
import { getRevealedObjectives, toggleObjectiveCompletion } from '@/lib/db/objectives';
import { ALL_STAGE_1_OBJECTIVES, ALL_STAGE_2_OBJECTIVES } from '@/lib/objectives';
import { getFactionImage } from '@/lib/factions';
import type { ObjectiveRecord } from '@/lib/db/objectives';
import type { PublicObjective } from '@/lib/objectives';
import publicIcon1 from '@/assets/icons/color/public-1.png';
import publicIcon2 from '@/assets/icons/color/public-2.png';
import styles from './ObjectivesPanel.module.css';

interface ObjectivesPanelProps {
  gameId: string;
}

type AutoScrollSpeed = 'off' | 'slow' | 'medium' | 'fast';

const SPEED_INTERVALS: Record<AutoScrollSpeed, number | null> = {
  off: null,
  slow: 8000,
  medium: 5000,
  fast: 3000,
};

const SPEED_LABELS: Record<AutoScrollSpeed, string> = {
  off: '⏸',
  slow: '▶',
  medium: '▶▶',
  fast: '▶▶▶',
};

export function ObjectivesPanel({ gameId }: ObjectivesPanelProps) {
  const [objectives, setObjectives] = useState<ObjectiveRecord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoScrollSpeed, setAutoScrollSpeed] = useState<AutoScrollSpeed>('medium');
  const [isHovered, setIsHovered] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const gameState = useStore((state) => state.gameState);
  const players = useStore((state) => state.players);
  const pushHistory = useStore((state) => state.pushHistory);
  const objectivesReloadCounter = useStore((state) => state.objectivesReloadCounter);

  useEffect(() => {
    if (!gameId || !gameState) return;

    loadObjectives();
  }, [gameId, gameState?.currentRound, objectivesReloadCounter]);

  const loadObjectives = async () => {
    if (!gameState) return;
    console.log('Loading objectives for round:', gameState.currentRound);
    const revealed = await getRevealedObjectives(gameId, gameState.currentRound);
    console.log('Revealed objectives:', revealed);
    setObjectives(revealed);
  };

  const handleToggleCompletion = async (objectiveId: string, playerId: string) => {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return;

    // Find the objective to determine current state
    const objective = objectives.find(obj => obj.id === objectiveId);
    if (!objective) return;

    const wasScored = (objective.scored_by_players || []).includes(playerId);

    // Push to history before making the change
    pushHistory({
      type: 'objectiveToggle',
      objectiveId,
      playerId,
      wasScored,
      userId: currentUserId,
      timestamp: Date.now(),
    });

    // Toggle the objective
    const success = await toggleObjectiveCompletion(objectiveId, playerId);
    if (success) {
      // Reload objectives to get updated scorers
      loadObjectives();
    }
  };

  const getObjectiveDetails = (objectiveId: string): PublicObjective | undefined => {
    return [...ALL_STAGE_1_OBJECTIVES, ...ALL_STAGE_2_OBJECTIVES].find(
      (obj) => obj.id === objectiveId
    );
  };

  const scrollToIndex = useCallback((index: number, instant = false) => {
    if (!scrollRef.current) return;
    const cardWidth = 280; // Match CSS width
    const gap = 16; // var(--space-4)
    const scrollPosition = index * (cardWidth + gap);
    scrollRef.current.scrollTo({ left: scrollPosition, behavior: instant ? 'auto' : 'smooth' });
  }, []);

  const handlePrevious = useCallback(() => {
    if (objectives.length === 0) return;
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex - 1;
      scrollToIndex(newIndex);
      return newIndex;
    });
  }, [scrollToIndex]);

  const handleNext = useCallback(() => {
    if (objectives.length === 0) return;
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex + 1;
      scrollToIndex(newIndex);
      return newIndex;
    });
  }, [scrollToIndex]);

  // Handle infinite scroll wrap-around
  useEffect(() => {
    if (objectives.length === 0) return undefined;

    let timer: NodeJS.Timeout | undefined;

    // When we reach a cloned item at the end, reset to the beginning
    if (currentIndex >= objectives.length) {
      const actualIndex = currentIndex % objectives.length;
      // Wait for smooth scroll to complete before resetting
      timer = setTimeout(() => {
        setCurrentIndex(actualIndex);
        scrollToIndex(actualIndex, true); // Instant jump
      }, 500);
    }
    // When we go before the beginning (if allowing reverse), wrap to the end
    else if (currentIndex < 0) {
      const actualIndex = objectives.length + (currentIndex % objectives.length);
      timer = setTimeout(() => {
        setCurrentIndex(actualIndex);
        scrollToIndex(actualIndex, true); // Instant jump
      }, 500);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [currentIndex, objectives.length, scrollToIndex]);

  const cycleSpeed = () => {
    const speeds: AutoScrollSpeed[] = ['off', 'slow', 'medium', 'fast'];
    const currentSpeedIndex = speeds.indexOf(autoScrollSpeed);
    const nextSpeed = speeds[(currentSpeedIndex + 1) % speeds.length];
    setAutoScrollSpeed(nextSpeed);
  };

  // Autoscroll effect - pauses on hover
  useEffect(() => {
    const interval = SPEED_INTERVALS[autoScrollSpeed];
    if (interval === null || objectives.length === 0 || isHovered) return;

    const timer = setInterval(() => {
      handleNext();
    }, interval);

    return () => clearInterval(timer);
  }, [autoScrollSpeed, objectives.length, handleNext, isHovered]);

  if (objectives.length === 0) {
    return (
      <Panel className={styles.objectivesPanel} beveled>
        <div className={styles.emptyState}>
          <p>No public objectives revealed yet.</p>
          <p className={styles.emptyHint}>
            Objectives will be revealed at the start of each status phase.
          </p>
        </div>
      </Panel>
    );
  }

  // Create extended list with clones for infinite scroll effect
  const extendedObjectives = [...objectives, ...objectives];

  return (
    <Panel className={styles.objectivesPanel} beveled>
      <div
        className={styles.carouselContainer}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button
          className={styles.carouselButton}
          onClick={handlePrevious}
          aria-label="Previous objective"
        >
          ‹
        </button>

        <button
          className={`${styles.speedButton} ${autoScrollSpeed !== 'off' ? styles.active : ''}`}
          onClick={cycleSpeed}
          title={`Auto-scroll: ${autoScrollSpeed}`}
        >
          {SPEED_LABELS[autoScrollSpeed]}
        </button>

        <div className={styles.objectivesList} ref={scrollRef}>
          {extendedObjectives.map((objective, index) => {
          const details = getObjectiveDetails(objective.objective_id || '');
          if (!details) return null;

          const isStage2 = objective.objective_type === 'public-stage-2';
          const scoredByPlayers = objective.scored_by_players || [];

          return (
            <div key={`${objective.id}-${index}`} className={styles.objectiveCard}>
              <img
                className={styles.objectiveIcon}
                src={isStage2 ? publicIcon2 : publicIcon1}
                alt={isStage2 ? 'Stage II' : 'Stage I'}
              />

              <div className={styles.objectiveContent}>
                <div className={styles.objectiveName}>{details.name}</div>
                <div className={styles.objectiveCondition}>{details.condition}</div>
              </div>

              <div className={styles.objectiveScorers}>
                {players.map((player) => {
                  const hasScored = scoredByPlayers.includes(player.id);
                  return (
                    <button
                      key={player.id}
                      className={`${styles.factionIcon} ${hasScored ? styles.scored : ''}`}
                      onClick={() => handleToggleCompletion(objective.id, player.id)}
                      title={`${player.displayName || player.factionId} - ${hasScored ? 'Scored' : 'Not scored'}`}
                    >
                      <img
                        src={getFactionImage(player.factionId, 'color')}
                        alt={player.factionId}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        </div>

        <button
          className={styles.carouselButton}
          onClick={handleNext}
          aria-label="Next objective"
        >
          ›
        </button>
      </div>
    </Panel>
  );
}
