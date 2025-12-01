import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Panel } from '@/components/common';
import { useGame } from '@/hooks';
import { useStore } from '@/store';
import { shallow } from 'zustand/shallow';
import { getCurrentUserId } from '@/lib/auth';
import { FilterPanel } from './components/FilterPanel';
import { FactionCarousel } from './components/FactionCarousel';
import { ALL_FACTIONS, FACTIONS_BY_ID } from '@/data/factions';
import type { FactionData } from '@/data/factions';
import styles from './FactionComparisonPage.module.css';

export type CategoryType =
  | 'abilities'
  | 'flagship'
  | 'mech'
  | 'startingTech'
  | 'commodities'
  | 'homeSystem'
  | 'promissory'
  | 'leaders';

// Default categories to show (per requirements)
const DEFAULT_CATEGORIES: Set<CategoryType> = new Set([
  'abilities',
  'startingTech',
  'commodities',
  'leaders',
  'promissory',
]);

export function FactionComparisonPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const { isLoading, error } = useGame(gameId || null);
  const players = useStore((state) => state.players, shallow);
  const game = useStore((state) => state.game);
  const currentUserId = getCurrentUserId();

  // Find current player
  const currentPlayer = players.find((p) => p.userId === currentUserId);

  // Default to current player, or null for "All Players"
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(
    currentPlayer?.id || null
  );

  const [activeCategories, setActiveCategories] = useState<Set<CategoryType>>(
    DEFAULT_CATEGORIES
  );

  const [searchQuery, setSearchQuery] = useState('');

  // Update selected player if current player changes
  useEffect(() => {
    if (currentPlayer && !selectedPlayerId) {
      setSelectedPlayerId(currentPlayer.id);
    }
  }, [currentPlayer, selectedPlayerId]);

  // Filter players based on selection
  const filteredPlayers = selectedPlayerId
    ? players.filter((p) => p.id === selectedPlayerId)
    : players;

  // Get faction data for filtered players
  const playerFactions: Array<{ player: typeof players[0]; faction: FactionData }> = [];
  for (const player of filteredPlayers) {
    const faction = FACTIONS_BY_ID.get(player.factionId);
    if (faction) {
      playerFactions.push({ player, faction });
    }
  }

  const toggleCategory = (category: CategoryType) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const codexConfig = game?.config?.expansions;

  if (!gameId) {
    return (
      <div className={styles.page}>
        <Panel className={styles.errorPanel}>
          <div className={styles.error}>Invalid game ID</div>
        </Panel>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.page}>
        <Panel className={styles.loadingPanel}>
          <div className={styles.loadingContent}>
            <div className={styles.spinner}></div>
            <p>Loading game...</p>
          </div>
        </Panel>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <Panel className={styles.errorPanel}>
          <h2>Error</h2>
          <p>{error}</p>
        </Panel>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Faction Comparison</h1>
        <p className={styles.subtitle}>
          View and compare faction abilities, units, and leaders
        </p>
      </header>

      <Panel className={styles.mainPanel} beveled>
        <FilterPanel
          players={players}
          selectedPlayerId={selectedPlayerId}
          onPlayerChange={setSelectedPlayerId}
          activeCategories={activeCategories}
          onCategoryToggle={toggleCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <FactionCarousel
          gameId={gameId}
          playerFactions={playerFactions}
          activeCategories={activeCategories}
          searchQuery={searchQuery}
          codexConfig={codexConfig}
        />
      </Panel>
    </div>
  );
}
