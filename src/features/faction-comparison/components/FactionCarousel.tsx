import { useRef, useCallback, useState } from 'react';
import type { Player } from '@/types';
import type { FactionData } from '@/data/factions';
import type { CategoryType } from '../FactionComparisonPage';
import type { GameConfig } from '@/types/game';
import { FactionCard } from './FactionCard';
import styles from './FactionCarousel.module.css';

interface FactionCarouselProps {
  gameId: string;
  playerFactions: Array<{ player: Player; faction: FactionData }>;
  activeCategories: Set<CategoryType>;
  searchQuery: string;
  codexConfig?: GameConfig['expansions'];
}

export function FactionCarousel({
  gameId,
  playerFactions,
  activeCategories,
  searchQuery,
  codexConfig,
}: FactionCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollToIndex = useCallback((index: number) => {
    if (!scrollRef.current) return;
    const cardWidth = 320; // Match CSS width
    const gap = 16; // var(--space-4)
    const scrollPosition = index * (cardWidth + gap);
    scrollRef.current.scrollTo({ left: scrollPosition, behavior: 'smooth' });
  }, []);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      scrollToIndex(newIndex);
    }
  }, [currentIndex, scrollToIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < playerFactions.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      scrollToIndex(newIndex);
    }
  }, [currentIndex, playerFactions.length, scrollToIndex]);

  if (playerFactions.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No factions to display.</p>
        <p className={styles.emptyHint}>
          Players must be assigned factions to view faction comparison.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.carouselContainer}>
      <button
        className={styles.carouselButton}
        onClick={handlePrevious}
        disabled={currentIndex === 0}
        aria-label="Previous faction"
      >
        ‹
      </button>

      <div className={styles.factionsList} ref={scrollRef}>
        {playerFactions.map(({ player, faction }) => (
          <FactionCard
            key={player.id}
            gameId={gameId}
            player={player}
            faction={faction}
            activeCategories={activeCategories}
            codexConfig={codexConfig}
          />
        ))}
      </div>

      <button
        className={styles.carouselButton}
        onClick={handleNext}
        disabled={currentIndex >= playerFactions.length - 1}
        aria-label="Next faction"
      >
        ›
      </button>
    </div>
  );
}
