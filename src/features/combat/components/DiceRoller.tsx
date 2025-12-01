import { useState } from 'react';
import { Button } from '@/components/common';
import type { DiceRoll, CombatUnit } from '@/types/combatUnits';
import { createDiceRoll } from '@/types/combatUnits';
import styles from './DiceRoller.module.css';

// ============================================================================
// SINGLE DIE DISPLAY
// ============================================================================

interface DieProps {
  roll: DiceRoll;
  canReroll: boolean;
  onReroll: () => void;
}

function Die({ roll, canReroll, onReroll }: DieProps) {
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

// ============================================================================
// UNIT ROLLER
// Shows all dice for a single unit
// ============================================================================

interface UnitRollerProps {
  unit: CombatUnit;
  targetValue: number; // Hit on this or higher
  rolls: DiceRoll[];
  canReroll: boolean;
  onRollsChange: (rolls: DiceRoll[]) => void;
}

function UnitRoller({ unit, targetValue, rolls, canReroll, onRollsChange }: UnitRollerProps) {
  const hits = rolls.filter(r => r.isHit).length;

  const handleReroll = (rollIndex: number) => {
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
        <span className={styles.unitHits}>
          {hits} hit{hits !== 1 ? 's' : ''}
        </span>
      </div>
      <div className={styles.diceRow}>
        {rolls.map((roll, index) => (
          <Die
            key={roll.id}
            roll={roll}
            canReroll={canReroll}
            onReroll={() => handleReroll(index)}
          />
        ))}
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

  const handleRollAll = () => {
    const newRolls = new Map<string, DiceRoll[]>();

    units.forEach(unit => {
      const targetValue = targetValueGetter(unit);
      const numRolls = rollsGetter(unit);
      const unitRolls: DiceRoll[] = [];

      for (let i = 0; i < numRolls; i++) {
        unitRolls.push(createDiceRoll(unit.id, i + 1, targetValue));
      }

      newRolls.set(unit.id, unitRolls);
    });

    setRolls(newRolls);
    setHasRolled(true);
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

  return (
    <div className={styles.batchRoller}>
      <h3>{title}</h3>

      {!hasRolled ? (
        <div className={styles.rollAllContainer}>
          <p>Ready to roll dice for {units.length} unit{units.length !== 1 ? 's' : ''}</p>
          <Button onClick={handleRollAll} variant="primary" size="large">
            🎲 Roll All Dice
          </Button>
        </div>
      ) : (
        <>
          <div className={styles.resultsContainer}>
            {units.map(unit => {
              const unitRolls = rolls.get(unit.id) || [];
              const targetValue = targetValueGetter(unit);
              return (
                <UnitRoller
                  key={unit.id}
                  unit={unit}
                  targetValue={targetValue}
                  rolls={unitRolls}
                  canReroll={canReroll}
                  onRollsChange={(newRolls) => handleUnitRollsChange(unit.id, newRolls)}
                />
              );
            })}
          </div>

          <div className={styles.summary}>
            <div className={styles.totalHits}>
              Total Hits: <span className={styles.hitsNumber}>{totalHits}</span>
            </div>
            <Button onClick={handleContinue} variant="primary" size="large">
              Continue to Hit Assignment →
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
