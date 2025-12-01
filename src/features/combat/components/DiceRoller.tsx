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
  onReroll: (unitId: string, dieIndex: number) => void;
  isRolling?: boolean;
  rollingValues?: number[];
  rerollingDieIndex?: number | null; // Which die is currently rerolling
}

function UnitRoller({
  unit,
  targetValue,
  numDice,
  rolls,
  canReroll,
  onReroll,
  isRolling = false,
  rollingValues = [],
  rerollingDieIndex = null
}: UnitRollerProps) {
  const hits = rolls ? rolls.filter(r => r.isHit).length : 0;
  const hasRolled = rolls !== null;

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
          const isDieRolling = isRolling || rerollingDieIndex === index;
          const rollingValue = isDieRolling ? rollingValues[index] : undefined;

          return (
            <Die
              key={`${unit.id}-die-${index}`}
              roll={roll}
              canReroll={canReroll && hasRolled && rerollingDieIndex === null}
              onReroll={() => onReroll(unit.id, index)}
              isRolling={isDieRolling}
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
  onBack?: () => void; // Optional back button callback
  title: string;
}

export function BatchDiceRoller({
  units,
  targetValueGetter,
  rollsGetter,
  canReroll,
  onComplete,
  onBack,
  title,
}: BatchDiceRollerProps) {
  const [rolls, setRolls] = useState<Map<string, DiceRoll[]>>(new Map());
  const [hasRolled, setHasRolled] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [rollingValues, setRollingValues] = useState<Map<string, number[]>>(new Map());
  const [manualMode, setManualMode] = useState(false);
  const [manualValues, setManualValues] = useState<Map<string, (number | null)[]>>(new Map());
  const [rerollingDie, setRerollingDie] = useState<{ unitId: string; dieIndex: number } | null>(null);

  // Animation settings
  const ANIMATION_DURATION_MS = 1500; // Total duration of animation
  const REROLL_DURATION_MS = 1000; // Reroll animation is slightly faster
  const ANIMATION_INTERVAL_MS = 80; // How often to update rolling numbers

  const handleRollAll = () => {
    setIsRolling(true);
    setHasRolled(false);

    // Start animation - cycle through random numbers
    const startTime = Date.now();
    const animationInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;

      if (elapsed >= ANIMATION_DURATION_MS) {
        // Animation complete - NOW calculate final results (roll at the end)
        clearInterval(animationInterval);

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

        setIsRolling(false);
        setRolls(finalRolls);
        setHasRolled(true);
        setRollingValues(new Map());
      } else {
        // Update with random numbers (just for animation - not the final results)
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

  const handleReroll = (unitId: string, dieIndex: number) => {
    setRerollingDie({ unitId, dieIndex });

    const unit = units.find(u => u.id === unitId);
    if (!unit) return;

    const targetValue = targetValueGetter(unit);
    const numRolls = rollsGetter(unit);

    // Start animation for just this die
    const startTime = Date.now();
    const animationInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;

      if (elapsed >= REROLL_DURATION_MS) {
        // Animation complete - NOW calculate final result (roll at the end)
        clearInterval(animationInterval);

        // Update just this one die
        const updatedRolls = new Map(rolls);
        const unitRolls = [...(updatedRolls.get(unitId) || [])];
        const oldRoll = unitRolls[dieIndex];

        unitRolls[dieIndex] = createDiceRoll(
          unit.id,
          oldRoll.rollNumber,
          targetValue,
          true,
          'manual_reroll'
        );

        updatedRolls.set(unitId, unitRolls);
        setRolls(updatedRolls);
        setRerollingDie(null);
        setRollingValues(new Map());
      } else {
        // Update with random numbers for all dice of this unit (just for smooth animation)
        const newRollingValues = new Map<string, number[]>();
        const randomValues = Array.from({ length: numRolls }, () => rollDie());
        newRollingValues.set(unitId, randomValues);
        setRollingValues(newRollingValues);
      }
    }, ANIMATION_INTERVAL_MS);
  };

  const handleManualEntry = () => {
    // Initialize manual values for each unit
    const initialValues = new Map<string, (number | null)[]>();
    units.forEach(unit => {
      const numRolls = rollsGetter(unit);
      initialValues.set(unit.id, Array(numRolls).fill(null));
    });
    setManualValues(initialValues);
  };

  const handleManualValueChange = (unitId: string, dieIndex: number, value: string) => {
    const numValue = parseInt(value);
    if (value === '' || (numValue >= 1 && numValue <= 10)) {
      const updated = new Map(manualValues);
      const unitValues = [...(updated.get(unitId) || [])];
      unitValues[dieIndex] = value === '' ? null : numValue;
      updated.set(unitId, unitValues);
      setManualValues(updated);
    }
  };

  const handleManualSubmit = () => {
    // Convert manual values to DiceRoll objects
    const finalRolls = new Map<string, DiceRoll[]>();

    units.forEach(unit => {
      const targetValue = targetValueGetter(unit);
      const values = manualValues.get(unit.id) || [];
      const unitRolls: DiceRoll[] = [];

      values.forEach((value, index) => {
        if (value !== null) {
          // Create a DiceRoll with the manual value
          const roll = createDiceRoll(unit.id, index + 1, targetValue);
          roll.result = value;
          roll.isHit = value >= targetValue;
          unitRolls.push(roll);
        }
      });

      finalRolls.set(unit.id, unitRolls);
    });

    setRolls(finalRolls);
    setHasRolled(true);
  };

  const allManualValuesEntered = () => {
    for (const unit of units) {
      const values = manualValues.get(unit.id) || [];
      if (values.some(v => v === null)) {
        return false;
      }
    }
    return true;
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
      <div className={styles.header}>
        {onBack && (
          <Button onClick={onBack} variant="secondary" size="small">
            ← Back
          </Button>
        )}
        <h3 className={styles.title}>{title}</h3>
      </div>

      {/* Manual Mode Toggle */}
      {!hasRolled && !isRolling && (
        <div className={styles.modeToggle}>
          <label className={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={manualMode}
              onChange={(e) => {
                setManualMode(e.target.checked);
                if (e.target.checked) {
                  handleManualEntry();
                }
              }}
            />
            <span>Manual Entry (enter physical dice results)</span>
          </label>
        </div>
      )}

      {/* Manual Entry Mode */}
      {manualMode && !hasRolled ? (
        <div className={styles.manualEntryContainer}>
          {unitInfo.map(({ unit, targetValue, numDice }) => (
            <div key={unit.id} className={styles.manualUnitEntry}>
              <div className={styles.unitHeader}>
                <span className={styles.unitName}>{unit.displayName}</span>
                <span className={styles.targetInfo}>Needs {targetValue}+ to hit</span>
              </div>
              <div className={styles.manualDiceInputs}>
                {Array.from({ length: numDice }).map((_, index) => (
                  <input
                    key={`${unit.id}-input-${index}`}
                    type="number"
                    min="1"
                    max="10"
                    placeholder="1-10"
                    className={styles.dieInput}
                    value={manualValues.get(unit.id)?.[index] ?? ''}
                    onChange={(e) => handleManualValueChange(unit.id, index, e.target.value)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Automatic Mode - Show animated dice */
        <div className={styles.resultsContainer}>
          {unitInfo.map(({ unit, targetValue, numDice }) => {
            const unitRolls = rolls.get(unit.id) || null;
            const unitRollingValues = rollingValues.get(unit.id) || [];
            const rerollingDieIndex = rerollingDie?.unitId === unit.id ? rerollingDie.dieIndex : null;

            return (
              <UnitRoller
                key={unit.id}
                unit={unit}
                targetValue={targetValue}
                numDice={numDice}
                rolls={unitRolls}
                canReroll={canReroll}
                onReroll={handleReroll}
                isRolling={isRolling}
                rollingValues={unitRollingValues}
                rerollingDieIndex={rerollingDieIndex}
              />
            );
          })}
        </div>
      )}

      {/* Show roll button or continue button */}
      <div className={styles.summary}>
        {hasRolled && (
          <div className={styles.totalHits}>
            Total Hits: <span className={styles.hitsNumber}>{totalHits}</span>
          </div>
        )}

        {/* Automatic mode buttons */}
        {!manualMode && !hasRolled && !isRolling && (
          <Button onClick={handleRollAll} variant="primary" size="large">
            🎲 Roll All Dice
          </Button>
        )}

        {/* Manual mode button */}
        {manualMode && !hasRolled && (
          <Button
            onClick={handleManualSubmit}
            variant="primary"
            size="large"
            disabled={!allManualValuesEntered()}
          >
            Submit Dice Results
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
