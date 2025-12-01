import type { CategoryType } from '../FactionComparisonPage';
import styles from './CategoryToggles.module.css';

interface CategoryTogglesProps {
  activeCategories: Set<CategoryType>;
  onToggle: (category: CategoryType) => void;
}

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

export function CategoryToggles({ activeCategories, onToggle }: CategoryTogglesProps) {
  return (
    <div className={styles.categoryToggles}>
      <div className={styles.header}>
        <span className={styles.label}>Display Categories</span>
        <div className={styles.actions}>
          <button
            className={styles.toggleAllButton}
            onClick={() => {
              if (activeCategories.size === CATEGORIES.length) {
                // Deselect all
                CATEGORIES.forEach((cat) => {
                  if (activeCategories.has(cat.id)) {
                    onToggle(cat.id);
                  }
                });
              } else {
                // Select all
                CATEGORIES.forEach((cat) => {
                  if (!activeCategories.has(cat.id)) {
                    onToggle(cat.id);
                  }
                });
              }
            }}
          >
            {activeCategories.size === CATEGORIES.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        {CATEGORIES.map((category) => {
          const isActive = activeCategories.has(category.id);
          return (
            <label key={category.id} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={isActive}
                onChange={() => onToggle(category.id)}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>{category.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
