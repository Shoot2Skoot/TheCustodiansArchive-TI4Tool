import type { CombatUnit } from '@/types/combatUnits';
import type { UnitType } from '@/data/combatConfig';
import { BASE_UNITS } from '@/data/combatConfig';
import { getActiveUnits } from '@/types/combatUnits';
import { getFactionById } from '@/lib/factions';
import { getUnitImage } from '@/data/shipImages';
import styles from '../CombatModal.module.css';

interface UnitPanelProps {
  side: 'attacker' | 'defender';
  units: CombatUnit[];
  playerName: string;
  factionId: string;
  onRollDice?: () => void;
  canRoll?: boolean;
}

export function UnitPanel({ side, units, playerName, factionId, onRollDice, canRoll = false }: UnitPanelProps) {
  const faction = getFactionById(factionId);
  const factionName = faction?.name || playerName;

  // Group units by category
  const ships = units.filter(u => u.isShip);
  const groundForces = units.filter(u => u.isGroundForce);
  const structures = units.filter(u => !u.isShip && !u.isGroundForce);

  const renderUnitCategory = (categoryName: string, categoryUnits: CombatUnit[]) => {
    if (categoryUnits.length === 0) return null;

    // Separate units with sustained damage (show individually) from those without (group by type)
    const unitsWithSustain = categoryUnits.filter(u => u.hasSustainDamage);
    const unitsWithoutSustain = categoryUnits.filter(u => !u.hasSustainDamage);

    // Group units without sustain by type
    interface GroupedUnit {
      type: UnitType;
      displayName: string;
      total: number;
      active: number;
      destroyed: number;
      imageUrl: string;
    }

    const grouped = new Map<UnitType, GroupedUnit>();
    unitsWithoutSustain.forEach(unit => {
      if (!grouped.has(unit.type)) {
        grouped.set(unit.type, {
          type: unit.type,
          displayName: unit.displayName,
          total: 0,
          active: 0,
          destroyed: 0,
          imageUrl: getUnitImage(unit.type),
        });
      }
      const group = grouped.get(unit.type)!;
      group.total++;
      if (unit.state === 'destroyed') {
        group.destroyed++;
      } else {
        group.active++;
      }
    });

    // Create a combined sorted list of all units
    type RenderItem =
      | { type: 'group'; data: GroupedUnit; cost: number }
      | { type: 'individual'; data: CombatUnit; cost: number };

    const allItems: RenderItem[] = [
      ...Array.from(grouped.values()).map(group => ({
        type: 'group' as const,
        data: group,
        cost: BASE_UNITS[group.type]?.cost ?? 0,
      })),
      ...unitsWithSustain.map(unit => ({
        type: 'individual' as const,
        data: unit,
        cost: BASE_UNITS[unit.type]?.cost ?? 0,
      })),
    ];

    // Sort all items by cost (highest to lowest)
    allItems.sort((a, b) => b.cost - a.cost);

    return (
      <div className={styles.unitCategory}>
        <div className={styles.categoryHeader}>{categoryName}</div>
        <div className={styles.unitsList}>
          {allItems.map((item, idx) => {
            if (item.type === 'group') {
              const group = item.data;
              const allDestroyed = group.destroyed === group.total;
              const statusClass = allDestroyed ? styles.destroyed : '';

              const combatValue = BASE_UNITS[group.type]?.combat ?? null;
              const combatRolls = BASE_UNITS[group.type]?.combatRolls ?? 1;
              const activeCount = group.active;

              return (
                <div key={`group-${group.type}`} className={`${styles.unitItem} ${styles.groupedUnit} ${statusClass}`}>
                  <img src={group.imageUrl} alt={group.displayName} className={styles.unitImage} />
                  <div className={styles.unitName}>{group.displayName}</div>
                  <div className={styles.unitQuantity}>x{activeCount}</div>

                  {/* Target number indicator */}
                  {combatValue !== null && (
                    <div className={styles.targetNumber}>
                      <div className={styles.targetDiamond}>
                        {combatValue}+
                      </div>
                    </div>
                  )}

                  {/* Dice display */}
                  {combatValue !== null && (
                    <div className={styles.diceContainer}>
                      {Array.from({ length: activeCount * combatRolls }).map((_, diceIdx) => (
                        <div key={diceIdx} className={styles.die}>
                          <div className={styles.dieUnrolled}>?</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {group.destroyed > 0 && (
                    <div className={styles.unitStatus}>
                      <span className={`${styles.statusBadge} ${styles.destroyed}`}>
                        {group.destroyed} 💀
                      </span>
                    </div>
                  )}
                </div>
              );
            } else {
              const unit = item.data;
              const statusClass =
                unit.state === 'destroyed' ? styles.destroyed :
                unit.state === 'sustained' ? styles.sustained :
                '';

              const imageUrl = getUnitImage(unit.type);
              const combatValue = unit.combat;
              const combatRolls = unit.combatRolls;

              return (
                <div key={unit.id} className={`${styles.unitItem} ${statusClass}`}>
                  <img src={imageUrl} alt={unit.displayName} className={styles.unitImage} />
                  <div className={styles.unitName}>{unit.displayName}</div>

                  {/* Target number indicator */}
                  {combatValue !== null && unit.state !== 'destroyed' && (
                    <div className={styles.targetNumber}>
                      <div className={styles.targetDiamond}>
                        {combatValue}+
                      </div>
                    </div>
                  )}

                  {/* Dice display */}
                  {combatValue !== null && unit.state !== 'destroyed' && (
                    <div className={styles.diceContainer}>
                      {Array.from({ length: combatRolls }).map((_, diceIdx) => (
                        <div key={diceIdx} className={styles.die}>
                          <div className={styles.dieUnrolled}>?</div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className={styles.unitStatus}>
                    {unit.state !== 'destroyed' && unit.hasSustainDamage && (
                      <span className={`${styles.statusBadge} ${styles.active}`}>
                        🛡️ SUSTAIN
                      </span>
                    )}
                    {unit.state === 'sustained' && (
                      <span className={`${styles.statusBadge} ${styles.sustained}`}>
                        ⚠️ DAMAGED
                      </span>
                    )}
                    {unit.state === 'destroyed' && (
                      <span className={`${styles.statusBadge} ${styles.destroyed}`}>
                        💀 DESTROYED
                      </span>
                    )}
                  </div>
                </div>
              );
            }
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={side === 'attacker' ? styles.attackerPanel : styles.defenderPanel}>
      <div className={styles.panelHeader}>
        <div className={styles.panelTitleRow}>
          <div>
            <h2 className={styles.panelTitle}>
              {side === 'attacker' ? '⚔️ Attacker' : '🛡️ Defender'}
            </h2>
            <div className={styles.panelSubtitle}>
              {factionName}
              {playerName !== factionName && <span> ({playerName})</span>}
            </div>
          </div>
          {canRoll && onRollDice && (
            <button className={styles.rollDiceButton} onClick={onRollDice}>
              🎲 Roll Dice
            </button>
          )}
        </div>
      </div>

      <div className={styles.unitsDisplay}>
        {renderUnitCategory('Ships', ships)}
        {renderUnitCategory('Ground Forces', groundForces)}
        {renderUnitCategory('Structures', structures)}
      </div>
    </div>
  );
}
