import { useState, useEffect } from 'react';
import { Button } from '@/components/common';
import type { DiceRoll, CombatUnit } from '@/types/combatUnits';
import { createDiceRoll, rollDie } from '@/types/combatUnits';
import styles from './DiceRoller.module.css';

// ============================================================================
// SINGLE DIE DISPLAY
// ============================================================================

interface DieProps {
  roll: DiceRoll | null; // null means unrolled
  canReroll: boolean;
  onReroll: () => void;
  isRolling?: boolean;
  rollingValue?: number;
}

function Die({ roll, canReroll, onReroll, isRolling = false, rollingValue }: DieProps) {
  // Unrolled state
  if (!roll && !isRolling) {
    return (
      <div className={styles.dieContainer}>
        <div className={`${styles.die} ${styles.dieUnrolled}`}>
          <span className={styles.dieValue}>?</span>
        </div>
      </div>
    );
  }

  // Rolling animation state
  if (isRolling && rollingValue !== undefined) {
    return (
      <div className={styles.dieContainer}>
        <div className={`${styles.die} ${styles.dieRolling}`}>
          <span className={styles.dieValue}>{rollingValue}</span>
        </div>
      </div>
    );
  }

  // Final result state
  if (roll) {
    const isHit = roll.isHit;
    const className = `${styles.die} ${isHit ? styles.dieHit : styles.dieMiss} ${roll.wasRerolled ? styles.dieRerolled : ''}`;

    return (
      <div className={styles.dieContainer}>
        <div className={className}>
          <span className={styles.dieValue}>{roll.result}</span>
        </div>
        {canReroll && (
          <button className={styles.rerollButton} onClick={onReroll}>
            ↻ Reroll
          </button>
        )}
        <div className={styles.dieLabel}>
          {isHit ? '✓ HIT' : '✗ Miss'}
        </div>
      </div>
    );
  }

  return null;
}

// ============================================================================
// UNIT ROLLER
// Shows all dice for a single unit
// ============================================================================

interface UnitRollerProps {
  unit: CombatUnit;
  targetValue: number; // Hit on this or higher
  numDice: number; // How many dice this unit rolls
  rolls: DiceRoll[] | null; // null means not rolled yet
  canReroll: boolean;
  onRollsChange: (rolls: DiceRoll[]) => void;
  isRolling?: boolean;
  rollingValues?: number[];
}

function UnitRoller({
  unit,
  targetValue,
  numDice,
  rolls,
  canReroll,
  onRollsChange,
  isRolling = false,
  rollingValues = []
}: UnitRollerProps) {
  const hits = rolls ? rolls.filter(r => r.isHit).length : 0;
  const hasRolled = rolls !== null;

  const handleReroll = (rollIndex: number) => {
    if (!rolls) return;
    const newRolls = [...rolls];
    const oldRoll = newRolls[rollIndex];
    newRolls[rollIndex] = createDiceRoll(
      unit.id,
      oldRoll.rollNumber,
      targetValue,
      true,
      'manual_reroll'
    );
    onRollsChange(newRolls);
  };

  return (
    <div className={styles.unitRoller}>
      <div className={styles.unitHeader}>
        <span className={styles.unitName}>{unit.displayName}</span>
        {hasRolled && (
          <span className={styles.unitHits}>
            {hits} hit{hits !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      <div className={styles.diceRow}>
        {Array.from({ length: numDice }).map((_, index) => {
          const roll = rolls ? rolls[index] : null;
          const rollingValue = isRolling ? rollingValues[index] : undefined;

          return (
            <Die
              key={`${unit.id}-die-${index}`}
              roll={roll}
              canReroll={canReroll && hasRolled}
              onReroll={() => handleReroll(index)}
              isRolling={isRolling}
              rollingValue={rollingValue}
            />
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// BATCH DICE ROLLER
// Rolls for multiple units at once
// ============================================================================

interface BatchDiceRollerProps {
  units: CombatUnit[];
  targetValueGetter: (unit: CombatUnit) => number; // Function to get combat value per unit
  rollsGetter: (unit: CombatUnit) => number; // Function to get # of dice per unit
  canReroll: boolean;
  onComplete: (results: Map<string, DiceRoll[]>) => void;
  title: string;
}

export function BatchDiceRoller({
  units,
  targetValueGetter,
  rollsGetter,
  canReroll,
  onComplete,
  title,
}: BatchDiceRollerProps) {
  const [rolls, setRolls] = useState<Map<string, DiceRoll[]>>(new Map());
  const [hasRolled, setHasRolled] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [rollingValues, setRollingValues] = useState<Map<string, number[]>>(new Map());

  // Animation settings
  const ANIMATION_DURATION_MS = 1500; // Total duration of animation
  const ANIMATION_INTERVAL_MS = 80; // How often to update rolling numbers

  const handleRollAll = () => {
    setIsRolling(true);
    setHasRolled(false);

    // Pre-calculate final results
    const finalRolls = new Map<string, DiceRoll[]>();
    units.forEach(unit => {
      const targetValue = targetValueGetter(unit);
      const numRolls = rollsGetter(unit);
      const unitRolls: DiceRoll[] = [];

      for (let i = 0; i < numRolls; i++) {
        unitRolls.push(createDiceRoll(unit.id, i + 1, targetValue));
      }

      finalRolls.set(unit.id, unitRolls);
    });

    // Start animation - cycle through random numbers
    const startTime = Date.now();
    const animationInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;

      if (elapsed >= ANIMATION_DURATION_MS) {
        // Animation complete - show final results
        clearInterval(animationInterval);
        setIsRolling(false);
        setRolls(finalRolls);
        setHasRolled(true);
        setRollingValues(new Map());
      } else {
        // Update with random numbers
        const newRollingValues = new Map<string, number[]>();
        units.forEach(unit => {
          const numRolls = rollsGetter(unit);
          const randomValues = Array.from({ length: numRolls }, () => rollDie());
          newRollingValues.set(unit.id, randomValues);
        });
        setRollingValues(newRollingValues);
      }
    }, ANIMATION_INTERVAL_MS);
  };

  const handleUnitRollsChange = (unitId: string, newRolls: DiceRoll[]) => {
    const updated = new Map(rolls);
    updated.set(unitId, newRolls);
    setRolls(updated);
  };

  const handleContinue = () => {
    onComplete(rolls);
  };

  const totalHits = Array.from(rolls.values())
    .flat()
    .filter(r => r.isHit).length;

  // Build unit info for display (always show, even before rolling)
  const unitInfo = units.map(unit => ({
    unit,
    targetValue: targetValueGetter(unit),
    numDice: rollsGetter(unit),
  }));

  return (
    <div className={styles.batchRoller}>
      <h3>{title}</h3>

      {/* Always show units and dice */}
      <div className={styles.resultsContainer}>
        {unitInfo.map(({ unit, targetValue, numDice }) => {
          const unitRolls = rolls.get(unit.id) || null;
          const unitRollingValues = rollingValues.get(unit.id) || [];

          return (
            <UnitRoller
              key={unit.id}
              unit={unit}
              targetValue={targetValue}
              numDice={numDice}
              rolls={unitRolls}
              canReroll={canReroll}
              onRollsChange={(newRolls) => handleUnitRollsChange(unit.id, newRolls)}
              isRolling={isRolling}
              rollingValues={unitRollingValues}
            />
          );
        })}
      </div>

      {/* Show roll button or continue button */}
      <div className={styles.summary}>
        {hasRolled && (
          <div className={styles.totalHits}>
            Total Hits: <span className={styles.hitsNumber}>{totalHits}</span>
          </div>
        )}

        {!hasRolled && !isRolling && (
          <Button onClick={handleRollAll} variant="primary" size="large">
            🎲 Roll All Dice
          </Button>
        )}

        {isRolling && (
          <div className={styles.rollingMessage}>
            Rolling dice...
          </div>
        )}

        {hasRolled && !isRolling && (
          <Button onClick={handleContinue} variant="primary" size="large">
            Continue →
          </Button>
        )}
      </div>
    </div>
  );
}
