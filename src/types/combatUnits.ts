// ============================================================================
// COMBAT UNIT TRACKING SYSTEM
// Individual unit instances with state tracking for proper combat resolution
// ============================================================================

import type { UnitType, UnitStats } from '@/data/combatConfig';

// ============================================================================
// Unit State Types
// ============================================================================

export type UnitState = 'undamaged' | 'sustained' | 'destroyed';

export type CombatSide = 'attacker' | 'defender' | 'third_party';

// ============================================================================
// Combat Unit Instance
// Each individual ship/ground force is tracked separately
// ============================================================================

export interface CombatUnit {
  // Identity
  id: string; // Unique instance ID (e.g., "dread-1", "fighter-3")
  type: UnitType;
  owner: CombatSide;
  playerId: string;
  playerName: string;
  factionId: string;

  // State
  state: UnitState;

  // Stats (copied from combatConfig for quick access)
  displayName: string;
  combat: number | null;
  combatRolls: number;
  capacity: number;

  // Abilities
  hasSustainDamage: boolean;
  hasAntiFighterBarrage: boolean;
  afbValue?: number;
  afbRolls?: number;
  hasBombardment: boolean;
  bombardmentValue?: number;
  bombardmentRolls?: number;
  hasSpaceCannon: boolean;
  spaceCannonValue?: number;
  spaceCannonRolls?: number;

  // Classification
  isGroundForce: boolean;
  isShip: boolean;
  isStructure: boolean;

  // Combat tracking
  assignedToPlanet?: string; // For ground forces during invasion
  hasRolledThisRound?: boolean;
}

// ============================================================================
// Dice Roll Tracking
// ============================================================================

export interface DiceRoll {
  id: string; // Unique roll ID
  unitId: string; // Which unit rolled this die
  rollNumber: number; // Which die for this unit (1st, 2nd, 3rd...)
  result: number; // 1-10
  targetValue: number; // Hit on this or higher
  isHit: boolean; // result >= targetValue
  wasRerolled: boolean;
  rerollSource?: string; // "scramble_frequency", "jol_nar_ability", etc.
  timestamp: number;
}

export interface CombatRollResult {
  unitId: string;
  unitType: UnitType;
  unitName: string;
  rolls: DiceRoll[];
  totalHits: number;
}

// ============================================================================
// Hit Assignment Tracking
// ============================================================================

export interface PendingHit {
  id: string;
  sourceUnitId: string; // Unit that caused this hit
  targetSide: CombatSide;
  assignedToUnitId?: string; // Unit that will take this hit
  isAssigned: boolean;
}

// ============================================================================
// Combat Round State
// ============================================================================

export interface CombatRoundState {
  // Round tracking
  roundNumber: number;
  phase: 'space_cannon' | 'afb' | 'space_combat' | 'bombardment' | 'space_cannon_defense' | 'ground_combat';

  // Active units
  attackerUnits: CombatUnit[];
  defenderUnits: CombatUnit[];
  thirdPartyUnits: CombatUnit[];

  // Dice rolls this round
  rolls: CombatRollResult[];

  // Hit queue
  pendingHits: PendingHit[];

  // Retreat flags
  defenderAnnouncedRetreat: boolean;
  attackerAnnouncedRetreat: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a unique ID for a unit instance
 */
export function createUnitId(type: UnitType, index: number): string {
  return `${type}_${index}_${Date.now()}`;
}

/**
 * Create a combat unit from stats
 */
export function createCombatUnit(
  type: UnitType,
  stats: UnitStats,
  owner: CombatSide,
  playerId: string,
  playerName: string,
  factionId: string,
  index: number
): CombatUnit {
  return {
    id: createUnitId(type, index),
    type,
    owner,
    playerId,
    playerName,
    factionId,
    state: 'undamaged',
    displayName: stats.displayName,
    combat: stats.combat,
    combatRolls: stats.combatRolls,
    capacity: stats.capacity,
    hasSustainDamage: stats.hasSustainDamage,
    hasAntiFighterBarrage: stats.hasAntiFighterBarrage,
    afbValue: stats.afbValue,
    afbRolls: stats.afbRolls,
    hasBombardment: stats.hasBombardment,
    bombardmentValue: stats.bombardmentValue,
    bombardmentRolls: stats.bombardmentRolls,
    hasSpaceCannon: stats.hasSpaceCannon,
    spaceCannonValue: stats.spaceCannonValue,
    spaceCannonRolls: stats.spaceCannonRolls,
    isGroundForce: stats.isGroundForce,
    isShip: stats.isShip,
    isStructure: stats.isStructure,
  };
}

/**
 * Roll a single die (1-10)
 * Returns a random integer from 1 to 10 inclusive
 */
export function rollDie(): number {
  // Ensure we never return values outside 1-10 range
  const result = Math.floor(Math.random() * 10) + 1;
  return Math.min(Math.max(result, 1), 10);
}

/**
 * Create a dice roll record
 */
export function createDiceRoll(
  unitId: string,
  rollNumber: number,
  targetValue: number,
  wasRerolled: boolean = false,
  rerollSource?: string
): DiceRoll {
  const result = rollDie();
  return {
    id: `roll_${unitId}_${rollNumber}_${Date.now()}`,
    unitId,
    rollNumber,
    result,
    targetValue,
    isHit: result >= targetValue,
    wasRerolled,
    rerollSource,
    timestamp: Date.now(),
  };
}

/**
 * Filter units by state
 */
export function getActiveUnits(units: CombatUnit[]): CombatUnit[] {
  return units.filter(u => u.state !== 'destroyed');
}

export function getUndamagedUnits(units: CombatUnit[]): CombatUnit[] {
  return units.filter(u => u.state === 'undamaged');
}

export function getSustainedUnits(units: CombatUnit[]): CombatUnit[] {
  return units.filter(u => u.state === 'sustained');
}

export function getDestroyedUnits(units: CombatUnit[]): CombatUnit[] {
  return units.filter(u => u.state === 'destroyed');
}

/**
 * Count units by type
 */
export function countUnitsByType(units: CombatUnit[], type: UnitType): number {
  return getActiveUnits(units).filter(u => u.type === type).length;
}

/**
 * Assign a hit to a unit
 * Returns the updated unit with new state
 */
export function assignHitToUnit(unit: CombatUnit): CombatUnit {
  if (unit.state === 'destroyed') {
    return unit; // Already destroyed
  }

  if (unit.hasSustainDamage && unit.state === 'undamaged') {
    // First hit: sustain damage
    return { ...unit, state: 'sustained' };
  }

  // No sustain, or already sustained: destroy
  return { ...unit, state: 'destroyed' };
}

/**
 * Check if combat can continue
 */
export function canCombatContinue(attackerUnits: CombatUnit[], defenderUnits: CombatUnit[]): {
  canContinue: boolean;
  winner: 'attacker' | 'defender' | null;
} {
  const attackerHasUnits = getActiveUnits(attackerUnits).length > 0;
  const defenderHasUnits = getActiveUnits(defenderUnits).length > 0;

  if (!attackerHasUnits && !defenderHasUnits) {
    return { canContinue: false, winner: null }; // Draw (rare)
  }

  if (!attackerHasUnits) {
    return { canContinue: false, winner: 'defender' };
  }

  if (!defenderHasUnits) {
    return { canContinue: false, winner: 'attacker' };
  }

  return { canContinue: true, winner: null };
}
