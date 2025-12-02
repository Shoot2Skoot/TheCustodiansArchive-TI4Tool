import { useState } from 'react';
import { Button } from '@/components/common';
import type { CombatUnit } from '@/types/combatUnits';
import { assignHitToUnit, getActiveUnits } from '@/types/combatUnits';
import styles from './HitAssignment.module.css';

// ============================================================================
// UNIT CARD (Clickable)
// ============================================================================

interface UnitCardProps {
  unit: CombatUnit;
  onClick: () => void;
  isSelectable: boolean;
  justSustained: boolean; // Did this unit just use sustain damage?
  onDirectHit?: () => void; // Callback for Direct Hit card
}

function UnitCard({ unit, onClick, isSelectable, justSustained, onDirectHit }: UnitCardProps) {
  const stateClass =
    unit.state === 'sustained' ? styles.unitSustained :
    unit.state === 'destroyed' ? styles.unitDestroyed :
    styles.unitUndamaged;

  const selectableClass = isSelectable ? styles.unitSelectable : '';

  return (
    <div
      className={`${styles.unitCard} ${stateClass} ${selectableClass}`}
      onClick={isSelectable ? onClick : undefined}
    >
      <div className={styles.unitCardHeader}>
        <span className={styles.unitCardName}>{unit.displayName}</span>
        {unit.hasSustainDamage && (
          <span className={styles.sustainBadge}>
            {unit.state === 'sustained' ? '⚠️ DAMAGED' : '🛡️ SUSTAIN'}
          </span>
        )}
      </div>

      {unit.state === 'sustained' && (
        <div className={styles.damagedIndicator}>
          ⚠️ This unit has sustained damage
        </div>
      )}

      {unit.state === 'destroyed' && (
        <div className={styles.destroyedIndicator}>
          💀 DESTROYED
        </div>
      )}

      {isSelectable && (
        <div className={styles.clickPrompt}>
          Click to assign hit
        </div>
      )}

      {justSustained && onDirectHit && (
        <button className={styles.directHitButton} onClick={(e) => {
          e.stopPropagation(); // Prevent triggering unit click
          onDirectHit();
        }}>
          💥 Direct Hit
        </button>
      )}
    </div>
  );
}

// ============================================================================
// HIT ASSIGNMENT INTERFACE
// ============================================================================

interface HitAssignmentProps {
  units: CombatUnit[];
  hitsToAssign: number;
  targetPlayerName: string;
  onComplete: (updatedUnits: CombatUnit[]) => void;
  title: string;
  targetSide?: 'attacker' | 'defender'; // Visual indicator for which side is taking hits
}

export function HitAssignment({
  units,
  hitsToAssign,
  targetPlayerName,
  onComplete,
  title,
  targetSide,
}: HitAssignmentProps) {
  const [currentUnits, setCurrentUnits] = useState<CombatUnit[]>(units);
  const [hitsAssigned, setHitsAssigned] = useState(0);
  const [lastSustainedUnitId, setLastSustainedUnitId] = useState<string | null>(null);

  const handleUnitClick = (unitId: string) => {
    if (hitsAssigned >= hitsToAssign) {
      return; // All hits already assigned
    }

    // Find and update the unit
    const updatedUnits = currentUnits.map(unit => {
      if (unit.id === unitId) {
        const updatedUnit = assignHitToUnit(unit);

        // Track if this unit just went from undamaged to sustained
        if (unit.state === 'undamaged' && updatedUnit.state === 'sustained') {
          setLastSustainedUnitId(unit.id);
        }

        return updatedUnit;
      }
      return unit;
    });

    setCurrentUnits(updatedUnits);
    setHitsAssigned(hitsAssigned + 1);
  };

  const handleDirectHit = (unitId: string) => {
    // Direct Hit destroys the unit immediately
    const updatedUnits = currentUnits.map(unit => {
      if (unit.id === unitId) {
        return { ...unit, state: 'destroyed' as const };
      }
      return unit;
    });

    setCurrentUnits(updatedUnits);
    setLastSustainedUnitId(null); // Clear after using Direct Hit
  };

  const handleUndo = () => {
    if (hitsAssigned === 0) return;

    // Reset to initial state
    setCurrentUnits(units);
    setHitsAssigned(0);
    setLastSustainedUnitId(null); // Clear Direct Hit tracking
  };

  const handleConfirm = () => {
    onComplete(currentUnits);
  };

  const activeUnits = getActiveUnits(currentUnits);
  const allHitsAssigned = hitsAssigned >= hitsToAssign;
  const remainingHits = Math.max(0, hitsToAssign - hitsAssigned);

  return (
    <div className={styles.hitAssignment}>
      <h3>{title}</h3>

      {targetSide && (
        <div className={targetSide === 'attacker' ? styles.attackerBanner : styles.defenderBanner}>
          <span className={styles.bannerLabel}>
            {targetSide === 'attacker' ? '⚔️ ATTACKER UNITS' : '🛡️ DEFENDER UNITS'}
          </span>
        </div>
      )}

      <div className={styles.assignmentInfo}>
        <div className={styles.playerInfo}>
          <strong>{targetPlayerName}</strong> must assign hits
        </div>
        <div className={styles.hitsInfo}>
          <span className={styles.hitsRemaining}>
            {remainingHits} hit{remainingHits !== 1 ? 's' : ''} to assign
          </span>
          <span className={styles.hitsAssignedCount}>
            ({hitsAssigned} / {hitsToAssign} assigned)
          </span>
        </div>
      </div>

      {hitsToAssign === 0 ? (
        <div className={styles.noHits}>
          <p>No hits to assign!</p>
          <Button onClick={() => onComplete(currentUnits)} variant="primary">
            Continue →
          </Button>
        </div>
      ) : (
        <>
          <div className={styles.unitsGrid}>
            {currentUnits.map(unit => {
              const isDestroyed = unit.state === 'destroyed';
              const isSelectable = !allHitsAssigned && !isDestroyed;

              return (
                <UnitCard
                  key={unit.id}
                  unit={unit}
                  onClick={() => handleUnitClick(unit.id)}
                  isSelectable={isSelectable}
                  justSustained={unit.id === lastSustainedUnitId}
                  onDirectHit={() => handleDirectHit(unit.id)}
                />
              );
            })}
          </div>

          {activeUnits.length === 0 && (
            <div className={styles.noUnitsLeft}>
              <p>⚠️ All units destroyed!</p>
            </div>
          )}

          <div className={styles.actions}>
            <Button onClick={handleUndo} variant="secondary" disabled={hitsAssigned === 0}>
              ↶ Reset Assignment
            </Button>
            <Button
              onClick={handleConfirm}
              variant="primary"
              disabled={!allHitsAssigned}
            >
              {allHitsAssigned ? 'Confirm Assignment →' : `Assign ${remainingHits} more hit${remainingHits !== 1 ? 's' : ''}`}
            </Button>
          </div>

          {!allHitsAssigned && (
            <div className={styles.instructions}>
              <p><strong>Instructions:</strong></p>
              <ul>
                <li>Click on a unit to assign a hit to it</li>
                <li>Units with <span className={styles.sustainText}>🛡️ SUSTAIN</span> will be damaged first, destroyed on second hit</li>
                <li>Units without sustain are destroyed immediately</li>
                <li>You must assign all {hitsToAssign} hits before continuing</li>
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
