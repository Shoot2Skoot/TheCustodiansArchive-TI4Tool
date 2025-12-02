import { useState } from 'react';
import type { CombatUnit } from '@/types/combatUnits';
import { getActiveUnits } from '@/types/combatUnits';
import { Button } from '@/components/common';
import styles from './CapacityTrimming.module.css';

interface CapacityTrimmingProps {
  units: CombatUnit[];
  excessUnits: number;
  totalCapacity: number;
  onComplete: (updatedUnits: CombatUnit[]) => void;
  playerName: string;
}

export function CapacityTrimming({
  units,
  excessUnits,
  totalCapacity,
  onComplete,
  playerName,
}: CapacityTrimmingProps) {
  const [currentUnits, setCurrentUnits] = useState<CombatUnit[]>(units);
  const [unitsToRemove, setUnitsToRemove] = useState<Set<string>>(new Set());

  // Carried units include ground forces and fighters
  const carriedUnits = getActiveUnits(currentUnits).filter(u => u.isGroundForce || u.type === 'fighter');
  const canConfirm = unitsToRemove.size === excessUnits;
  const hasSelectedSome = unitsToRemove.size > 0;

  const toggleUnit = (unitId: string) => {
    const newSet = new Set(unitsToRemove);
    if (newSet.has(unitId)) {
      newSet.delete(unitId);
    } else {
      // Only allow selection if we haven't reached the required number
      if (newSet.size < excessUnits) {
        newSet.add(unitId);
      }
    }
    setUnitsToRemove(newSet);
  };

  const handleConfirm = () => {
    // Mark selected units as destroyed
    const updatedUnits = currentUnits.map(unit => {
      if (unitsToRemove.has(unit.id)) {
        return { ...unit, state: 'destroyed' as const };
      }
      return unit;
    });

    onComplete(updatedUnits);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Capacity Exceeded</h3>
        <p className={styles.subtitle}>
          {playerName} must remove {excessUnits} carried unit{excessUnits !== 1 ? 's' : ''}
        </p>
        <div className={styles.capacityInfo}>
          <span className={styles.capacityLabel}>Total Capacity:</span>
          <span className={styles.capacityValue}>{totalCapacity}</span>
          <span className={styles.capacityLabel}>Carried Units:</span>
          <span className={styles.capacityValue}>{carriedUnits.length}</span>
          <span className={styles.capacityLabel}>Must Remove:</span>
          <span className={styles.capacityValueExcess}>{excessUnits}</span>
        </div>
      </div>

      <div className={styles.instructions}>
        <p>Select {excessUnits} unit{excessUnits !== 1 ? 's' : ''} to remove (fighters, infantry, mechs):</p>
        <p className={styles.progress}>
          Selected: {unitsToRemove.size} / {excessUnits}
        </p>
      </div>

      <div className={styles.unitsGrid}>
        {carriedUnits.map(unit => {
          const isSelected = unitsToRemove.has(unit.id);
          const canSelect = isSelected || unitsToRemove.size < excessUnits;

          return (
            <div
              key={unit.id}
              className={`${styles.unitCard} ${isSelected ? styles.unitSelected : ''} ${
                canSelect ? styles.unitSelectable : styles.unitDisabled
              }`}
              onClick={() => canSelect && toggleUnit(unit.id)}
            >
              <div className={styles.unitName}>{unit.displayName}</div>
              {unit.state === 'sustained' && (
                <div className={styles.sustainedBadge}>Sustained</div>
              )}
              {isSelected && <div className={styles.selectedBadge}>✓ Removing</div>}
            </div>
          );
        })}
      </div>

      <div className={styles.actions}>
        <Button onClick={handleConfirm} variant="primary" disabled={!canConfirm}>
          Confirm Removal ({unitsToRemove.size}/{excessUnits})
        </Button>
        {!canConfirm && hasSelectedSome && (
          <Button onClick={handleConfirm} variant="secondary">
            ⚠️ Continue Anyway (Card Effect Override)
          </Button>
        )}
        {!canConfirm && (
          <p className={styles.confirmHint}>
            {hasSelectedSome ? (
              <>Need {excessUnits - unitsToRemove.size} more, or continue anyway if using a special card effect</>
            ) : (
              <>Select {excessUnits} unit{excessUnits !== 1 ? 's' : ''} to remove</>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
