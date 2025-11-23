import { useState } from 'react';
import { Button } from '@/components/common';
import { ALL_STAGE_1_OBJECTIVES, getObjectiveImage, type PublicObjective } from '@/lib/objectives';
import styles from './ObjectiveSelection.module.css';

interface ObjectiveSelectionProps {
  onComplete: (selectedObjectiveIds: string[]) => void;
  onBack: () => void;
}

export function ObjectiveSelection({ onComplete, onBack }: ObjectiveSelectionProps) {
  const [selectedObjectives, setSelectedObjectives] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const handleObjectiveClick = (objectiveId: string) => {
    const newSelected = new Set(selectedObjectives);
    if (newSelected.has(objectiveId)) {
      newSelected.delete(objectiveId);
    } else {
      // Only allow selecting up to 2 objectives
      if (newSelected.size < 2) {
        newSelected.add(objectiveId);
      }
    }
    setSelectedObjectives(newSelected);
  };

  const handleRandomSelection = () => {
    const shuffled = [...ALL_STAGE_1_OBJECTIVES].sort(() => Math.random() - 0.5);
    const randomTwo = shuffled.slice(0, 2);
    setSelectedObjectives(new Set(randomTwo.map(obj => obj.id)));
  };

  const handleContinue = () => {
    onComplete(Array.from(selectedObjectives));
  };

  // Filter objectives based on search term
  const filteredObjectives = ALL_STAGE_1_OBJECTIVES.filter(obj => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      obj.name.toLowerCase().includes(search) ||
      obj.condition.toLowerCase().includes(search)
    );
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <img src={getObjectiveImage(1)} alt="Stage I Objective" className={styles.objectiveIcon} />
          <div>
            <h2 className={styles.title}>Select Public Objectives</h2>
            <p className={styles.description}>
              Choose 2 Stage I objectives to reveal at game start
            </p>
          </div>
        </div>
        <Button
          variant="secondary"
          size="small"
          onClick={handleRandomSelection}
          className={styles.randomButton}
        >
          🎲 Random Selection
        </Button>
      </div>

      <div className={styles.searchContainer}>
        <div className={styles.selectionInfo}>
          <span className={styles.selectionCount}>
            Selected: {selectedObjectives.size}
          </span>
        </div>
        <input
          type="text"
          placeholder="Search objectives..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.objectivesContainer}>
        <div className={styles.objectiveGrid}>
          {filteredObjectives.map((objective) => (
            <ObjectiveCard
              key={objective.id}
              objective={objective}
              isSelected={selectedObjectives.has(objective.id)}
              onClick={() => handleObjectiveClick(objective.id)}
            />
          ))}
        </div>
        {filteredObjectives.length === 0 && (
          <div className={styles.noResults}>
            No objectives found matching "{searchTerm}"
          </div>
        )}
      </div>

      <div className={styles.infoBox}>
        <h3 className={styles.infoTitle}>About Public Objectives</h3>
        <p className={styles.infoText}>
          Public objectives are revealed during the Status Phase. Players compete to fulfill these objectives and earn victory points.
        </p>
        <ul className={styles.infoList}>
          <li>Stage I objectives are worth 1 victory point each</li>
          <li>Both selected objectives will be revealed at the start of the game (Round 1)</li>
          <li>Additional objectives can be revealed later during the Status Phase</li>
        </ul>
      </div>

      <div className={styles.actions}>
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button
          variant="primary"
          size="large"
          onClick={handleContinue}
          disabled={selectedObjectives.size !== 2}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

interface ObjectiveCardProps {
  objective: PublicObjective;
  isSelected: boolean;
  onClick: () => void;
}

function ObjectiveCard({ objective, isSelected, onClick }: ObjectiveCardProps) {
  return (
    <button
      className={`${styles.objectiveCard} ${isSelected ? styles.selected : ''}`}
      onClick={onClick}
    >
      <div className={styles.objectiveHeader}>
        <div className={styles.objectiveHeaderLeft}>
          <span className={`${styles.expansionBadge} ${styles[objective.expansion]}`}>
            {objective.expansion === 'base' ? 'Base Game' : 'Prophecy of Kings'}
          </span>
          <div className={styles.objectiveName}>{objective.name}</div>
        </div>
        <div className={styles.objectivePoints}>{objective.points} VP</div>
      </div>
      <div className={styles.objectiveCondition}>{objective.condition}</div>
      {isSelected && (
        <div className={styles.selectedBadge}>
          <span className={styles.checkmark}>✓</span>
        </div>
      )}
    </button>
  );
}
