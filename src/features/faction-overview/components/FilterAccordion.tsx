import { useState } from 'react';
import { Panel } from '@/components/common';
import type { CategoryType } from '../FactionOverviewPage';
import styles from './FilterAccordion.module.css';

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

interface FilterAccordionProps {
  activeCategories: Set<CategoryType>;
  onToggleCategory: (category: CategoryType) => void;
}

export function FilterAccordion({ activeCategories, onToggleCategory }: FilterAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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
    <Panel className={styles.filterPanel} beveled>
      <button
        className={styles.accordionHeader}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className={styles.accordionTitle}>🔍 Filter Sections</span>
        <span className={styles.expandIcon}>{isExpanded ? '−' : '+'}</span>
      </button>

      {isExpanded && (
        <div className={styles.accordionContent}>
          <div className={styles.controls}>
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
    </Panel>
  );
}
