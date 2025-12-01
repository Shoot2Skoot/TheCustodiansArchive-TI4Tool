import type { Player } from '@/types';
import type { CategoryType } from '../FactionComparisonPage';
import { CategoryToggles } from './CategoryToggles';
import styles from './FilterPanel.module.css';

interface FilterPanelProps {
  players: Player[];
  selectedPlayerId: string | null;
  onPlayerChange: (playerId: string | null) => void;
  activeCategories: Set<CategoryType>;
  onCategoryToggle: (category: CategoryType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function FilterPanel({
  players,
  selectedPlayerId,
  onPlayerChange,
  activeCategories,
  onCategoryToggle,
  searchQuery,
  onSearchChange,
}: FilterPanelProps) {
  return (
    <div className={styles.filterPanel}>
      {/* Player Selection */}
      <div className={styles.playerFilter}>
        <label htmlFor="player-select" className={styles.label}>
          Player Filter
        </label>
        <select
          id="player-select"
          className={styles.select}
          value={selectedPlayerId || ''}
          onChange={(e) => onPlayerChange(e.target.value || null)}
        >
          <option value="">All Players</option>
          {players.map((player) => (
            <option key={player.id} value={player.id}>
              {player.displayName || player.factionId} ({player.color})
            </option>
          ))}
        </select>
      </div>

      {/* Category Toggles */}
      <CategoryToggles
        activeCategories={activeCategories}
        onToggle={onCategoryToggle}
      />

      {/* Search Bar (placeholder for future phase) */}
      {/* <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Search faction components..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={styles.searchInput}
        />
      </div> */}
    </div>
  );
}
