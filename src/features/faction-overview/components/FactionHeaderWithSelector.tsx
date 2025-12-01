import { useState } from 'react';
import type { FactionData } from '@/data/factions';
import { getFactionImage } from '@/lib/factions';
import type { CategoryType } from '../FactionOverviewPage';
import styles from './FactionHeaderWithSelector.module.css';

const CATEGORIES: Array<{ id: CategoryType; label: string }> = [
  { id: 'abilities', label: 'Abilities' },
  { id: 'flagship', label: 'Flagship' },
  { id: 'mech', label: 'Mech' },
  { id: 'startingTech', label: 'Starting Tech' },
  { id: 'commodities', label: 'Commodities' },
  { id: 'homeSystem', label: 'Home System' },
  { id: 'promissory', label: 'Promissory Note' },
  { id: 'leaders', label: 'Leaders' },
];

interface FactionHeaderWithSelectorProps {
  playerFactions: Array<{ player: any; faction: FactionData }>;
  selectedFactionId: string;
  onSelectFaction: (factionId: string) => void;
  selectedPlayer: any;
  selectedFaction: FactionData;
  activeCategories: Set<CategoryType>;
  onToggleCategory: (category: CategoryType) => void;
}

export function FactionHeaderWithSelector({
  playerFactions,
  selectedFactionId,
  onSelectFaction,
  selectedPlayer,
  selectedFaction,
  activeCategories,
  onToggleCategory,
}: FactionHeaderWithSelectorProps) {
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [factionMenuOpen, setFactionMenuOpen] = useState(false);

  const toggleAll = () => {
    if (activeCategories.size === CATEGORIES.length) {
      // Deselect all
      CATEGORIES.forEach((cat) => {
        if (activeCategories.has(cat.id)) {
          onToggleCategory(cat.id);
        }
      });
    } else {
      // Select all
      CATEGORIES.forEach((cat) => {
        if (!activeCategories.has(cat.id)) {
          onToggleCategory(cat.id);
        }
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {/* Faction info */}
        <div className={styles.factionInfo}>
          <img
            src={getFactionImage(selectedFaction.id, 'color')}
            alt={selectedFaction.name}
            className={styles.factionIcon}
          />
          <div className={styles.factionText}>
            <h2 className={styles.factionName}>{selectedFaction.name}</h2>
            <div className={styles.playerInfo}>
              <span className={`${styles.playerColor} ${styles[selectedPlayer.color]}`}>
                {selectedPlayer.color}
              </span>
              {selectedPlayer.displayName && (
                <span className={styles.playerName}>{selectedPlayer.displayName}</span>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className={styles.actionButtons}>
          {/* Filter toggle button */}
          <button
            className={`${styles.iconButton} ${filterMenuOpen ? styles.active : ''}`}
            onClick={() => {
              setFilterMenuOpen(!filterMenuOpen);
              setFactionMenuOpen(false);
            }}
            title="Filter sections"
          >
            🔍
          </button>

          {/* Faction selector toggle button */}
          <button
            className={`${styles.iconButton} ${factionMenuOpen ? styles.active : ''}`}
            onClick={() => {
              setFactionMenuOpen(!factionMenuOpen);
              setFilterMenuOpen(false);
            }}
            title="Switch faction"
          >
            👥
          </button>
        </div>
      </div>

      {/* Filter dropdown */}
      {filterMenuOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <span className={styles.dropdownTitle}>Filter Sections</span>
            <button className={styles.toggleAllButton} onClick={toggleAll}>
              {activeCategories.size === CATEGORIES.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div className={styles.categoryGrid}>
            {CATEGORIES.map((category) => (
              <label key={category.id} className={styles.categoryLabel}>
                <input
                  type="checkbox"
                  checked={activeCategories.has(category.id)}
                  onChange={() => onToggleCategory(category.id)}
                  className={styles.checkbox}
                />
                <span className={styles.categoryText}>{category.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Faction selector dropdown */}
      {factionMenuOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <span className={styles.dropdownTitle}>Select Faction</span>
          </div>
          <div className={styles.factionGrid}>
            {playerFactions.map(({ player, faction }) => (
              <button
                key={faction.id}
                className={`${styles.factionItem} ${
                  selectedFactionId === faction.id ? styles.selected : ''
                }`}
                onClick={() => {
                  onSelectFaction(faction.id);
                  setFactionMenuOpen(false);
                }}
              >
                <img
                  src={getFactionImage(faction.id, 'color')}
                  alt={faction.name}
                  className={styles.factionItemIcon}
                />
                <span className={styles.factionItemName}>{faction.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
