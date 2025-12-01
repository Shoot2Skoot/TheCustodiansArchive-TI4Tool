// ============================================================================
// COMBAT CONFIGURATION
// Central configuration for all unit stats, faction-specific overrides,
// and combat-related abilities
// ============================================================================

export type UnitType =
  // Space Units
  | 'war_sun'
  | 'dreadnought'
  | 'cruiser'
  | 'carrier'
  | 'destroyer'
  | 'fighter'
  | 'flagship'
  // Ground Units
  | 'infantry'
  | 'mech'
  // Structures
  | 'pds'
  | 'space_dock';

export interface UnitStats {
  id: UnitType;
  name: string;
  displayName: string;
  cost: number;
  combat: number | null; // null if unit doesn't participate in combat
  combatRolls: number; // How many dice this unit rolls
  move: number;
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
  hasPlanetaryShield: boolean;

  // Unit classification
  isGroundForce: boolean;
  isShip: boolean;
  isStructure: boolean;
}

// ============================================================================
// BASE UNIT DEFINITIONS
// ============================================================================

export const BASE_UNITS: Record<UnitType, UnitStats> = {
  // Space Units
  war_sun: {
    id: 'war_sun',
    name: 'War Sun',
    displayName: 'War Sun',
    cost: 12,
    combat: 3,
    combatRolls: 3,
    move: 2,
    capacity: 6,
    hasSustainDamage: true,
    hasAntiFighterBarrage: false,
    hasBombardment: true,
    bombardmentValue: 3,
    bombardmentRolls: 3,
    hasSpaceCannon: false,
    hasPlanetaryShield: false,
    isGroundForce: false,
    isShip: true,
    isStructure: false,
  },

  dreadnought: {
    id: 'dreadnought',
    name: 'Dreadnought',
    displayName: 'Dreadnought',
    cost: 4,
    combat: 5,
    combatRolls: 1,
    move: 1,
    capacity: 1,
    hasSustainDamage: true,
    hasAntiFighterBarrage: false,
    hasBombardment: true,
    bombardmentValue: 5,
    bombardmentRolls: 1,
    hasSpaceCannon: false,
    hasPlanetaryShield: false,
    isGroundForce: false,
    isShip: true,
    isStructure: false,
  },

  cruiser: {
    id: 'cruiser',
    name: 'Cruiser',
    displayName: 'Cruiser',
    cost: 2,
    combat: 7,
    combatRolls: 1,
    move: 2,
    capacity: 0,
    hasSustainDamage: false,
    hasAntiFighterBarrage: false,
    hasBombardment: false,
    hasSpaceCannon: false,
    hasPlanetaryShield: false,
    isGroundForce: false,
    isShip: true,
    isStructure: false,
  },

  carrier: {
    id: 'carrier',
    name: 'Carrier',
    displayName: 'Carrier',
    cost: 3,
    combat: 9,
    combatRolls: 1,
    move: 1,
    capacity: 4, // 6 with Carrier II
    hasSustainDamage: false,
    hasAntiFighterBarrage: false,
    hasBombardment: false,
    hasSpaceCannon: false,
    hasPlanetaryShield: false,
    isGroundForce: false,
    isShip: true,
    isStructure: false,
  },

  destroyer: {
    id: 'destroyer',
    name: 'Destroyer',
    displayName: 'Destroyer',
    cost: 1,
    combat: 9,
    combatRolls: 1,
    move: 2,
    capacity: 0,
    hasSustainDamage: false,
    hasAntiFighterBarrage: true,
    afbValue: 9,
    afbRolls: 2,
    hasBombardment: false,
    hasSpaceCannon: false,
    hasPlanetaryShield: false,
    isGroundForce: false,
    isShip: true,
    isStructure: false,
  },

  fighter: {
    id: 'fighter',
    name: 'Fighter',
    displayName: 'Fighter',
    cost: 0.5,
    combat: 9,
    combatRolls: 1,
    move: 0, // Fighters don't move independently
    capacity: 0,
    hasSustainDamage: false,
    hasAntiFighterBarrage: false,
    hasBombardment: false,
    hasSpaceCannon: false,
    hasPlanetaryShield: false,
    isGroundForce: false,
    isShip: true,
    isStructure: false,
  },

  flagship: {
    id: 'flagship',
    name: 'Flagship',
    displayName: 'Flagship',
    cost: 8,
    combat: 7, // Base value, overridden per faction
    combatRolls: 2, // Most flagships roll 2 dice
    move: 1,
    capacity: 3, // Base value, overridden per faction
    hasSustainDamage: true,
    hasAntiFighterBarrage: false,
    hasBombardment: false,
    hasSpaceCannon: false,
    hasPlanetaryShield: false,
    isGroundForce: false,
    isShip: true,
    isStructure: false,
  },

  // Ground Forces
  infantry: {
    id: 'infantry',
    name: 'Infantry',
    displayName: 'Infantry',
    cost: 0.5,
    combat: 8,
    combatRolls: 1,
    move: 0,
    capacity: 0,
    hasSustainDamage: false,
    hasAntiFighterBarrage: false,
    hasBombardment: false,
    hasSpaceCannon: false,
    hasPlanetaryShield: false,
    isGroundForce: true,
    isShip: false,
    isStructure: false,
  },

  mech: {
    id: 'mech',
    name: 'Mech',
    displayName: 'Mech',
    cost: 2,
    combat: 6,
    combatRolls: 1,
    move: 0,
    capacity: 0,
    hasSustainDamage: true,
    hasAntiFighterBarrage: false,
    hasBombardment: false,
    hasSpaceCannon: false,
    hasPlanetaryShield: false,
    isGroundForce: true,
    isShip: false,
    isStructure: false,
  },

  // Structures
  pds: {
    id: 'pds',
    name: 'PDS',
    displayName: 'PDS',
    cost: 2,
    combat: null,
    combatRolls: 0,
    move: 0,
    capacity: 0,
    hasSustainDamage: false,
    hasAntiFighterBarrage: false,
    hasBombardment: false,
    hasSpaceCannon: true,
    spaceCannonValue: 6,
    spaceCannonRolls: 1,
    hasPlanetaryShield: true,
    isGroundForce: false,
    isShip: false,
    isStructure: true,
  },

  space_dock: {
    id: 'space_dock',
    name: 'Space Dock',
    displayName: 'Space Dock',
    cost: 4,
    combat: null,
    combatRolls: 0,
    move: 0,
    capacity: 0,
    hasSustainDamage: false,
    hasAntiFighterBarrage: false,
    hasBombardment: false,
    hasSpaceCannon: false,
    hasPlanetaryShield: false,
    isGroundForce: false,
    isShip: false,
    isStructure: true,
  },
};

// ============================================================================
// FACTION-SPECIFIC FLAGSHIP STATS
// ============================================================================

export interface FlagshipStats {
  combat: number;
  combatRolls: number;
  capacity: number;
  // Special abilities are handled separately
  hasAntiFighterBarrage?: boolean;
  afbValue?: number;
  afbRolls?: number;
  hasBombardment?: boolean;
  bombardmentValue?: number;
  bombardmentRolls?: number;
  hasSpaceCannon?: boolean;
  spaceCannonValue?: number;
  spaceCannonRolls?: number;
}

export const FACTION_FLAGSHIPS: Record<string, FlagshipStats> = {
  // Base Game
  arborec: { combat: 7, combatRolls: 2, capacity: 5 },
  letnev: { combat: 5, combatRolls: 2, capacity: 3, hasBombardment: true, bombardmentValue: 5, bombardmentRolls: 3 },
  saar: { combat: 5, combatRolls: 2, capacity: 3, hasAntiFighterBarrage: true, afbValue: 6, afbRolls: 4 },
  muaat: { combat: 5, combatRolls: 2, capacity: 3 },
  hacan: { combat: 7, combatRolls: 2, capacity: 3 },
  sol: { combat: 5, combatRolls: 2, capacity: 12 },
  creuss: { combat: 5, combatRolls: 1, capacity: 3 },
  l1z1x: { combat: 5, combatRolls: 2, capacity: 5 },
  mentak: { combat: 7, combatRolls: 2, capacity: 3 },
  naalu: { combat: 9, combatRolls: 2, capacity: 6 },
  nekro: { combat: 9, combatRolls: 2, capacity: 3 },
  sardakk: { combat: 6, combatRolls: 2, capacity: 3 },
  'jol-nar': { combat: 6, combatRolls: 2, capacity: 3 },
  winnu: { combat: 7, combatRolls: 1, capacity: 3 },
  xxcha: { combat: 7, combatRolls: 2, capacity: 3, hasSpaceCannon: true, spaceCannonValue: 5, spaceCannonRolls: 3 },
  yin: { combat: 9, combatRolls: 2, capacity: 3 },
  yssaril: { combat: 5, combatRolls: 2, capacity: 3 },

  // Prophecy of Kings
  argent: { combat: 7, combatRolls: 2, capacity: 3 },
  empyrean: { combat: 5, combatRolls: 2, capacity: 3 },
  mahact: { combat: 5, combatRolls: 2, capacity: 3 },
  'naaz-rokha': { combat: 9, combatRolls: 2, capacity: 4 },
  nomad: { combat: 7, combatRolls: 2, capacity: 3, hasAntiFighterBarrage: true, afbValue: 8, afbRolls: 3 }, // Base Memoria
  titans: { combat: 7, combatRolls: 2, capacity: 3 },
  "vuil'raith": { combat: 5, combatRolls: 2, capacity: 3, hasBombardment: true, bombardmentValue: 5, bombardmentRolls: 1 },

  // Codex III
  keleres: { combat: 7, combatRolls: 2, capacity: 6 },
};

// ============================================================================
// FACTION-SPECIFIC UNIT OVERRIDES
// ============================================================================

export interface FactionUnitOverride {
  unitType: UnitType;
  overrides: Partial<UnitStats>;
}

export const FACTION_UNIT_OVERRIDES: Record<string, FactionUnitOverride[]> = {
  'jol-nar': [
    {
      unitType: 'infantry',
      overrides: {
        combat: 8, // -1 modifier applied in combat calculation
      },
    },
    {
      unitType: 'mech',
      overrides: {
        combat: 6, // -1 modifier applied in combat calculation
      },
    },
  ],

  sardakk: [
    {
      unitType: 'infantry',
      overrides: {
        combat: 8, // +1 modifier applied in combat calculation
      },
    },
    {
      unitType: 'mech',
      overrides: {
        combat: 6, // +1 modifier applied in combat calculation
      },
    },
  ],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get unit stats for a specific faction
 */
export function getUnitStats(unitType: UnitType, factionId?: string): UnitStats {
  const baseStats = { ...BASE_UNITS[unitType] };

  // Apply flagship stats if it's a flagship
  if (unitType === 'flagship' && factionId) {
    const flagshipStats = FACTION_FLAGSHIPS[factionId];
    if (flagshipStats) {
      return {
        ...baseStats,
        combat: flagshipStats.combat,
        combatRolls: flagshipStats.combatRolls,
        capacity: flagshipStats.capacity,
        hasAntiFighterBarrage: flagshipStats.hasAntiFighterBarrage || false,
        afbValue: flagshipStats.afbValue,
        afbRolls: flagshipStats.afbRolls,
        hasBombardment: flagshipStats.hasBombardment || false,
        bombardmentValue: flagshipStats.bombardmentValue,
        bombardmentRolls: flagshipStats.bombardmentRolls,
        hasSpaceCannon: flagshipStats.hasSpaceCannon || false,
        spaceCannonValue: flagshipStats.spaceCannonValue,
        spaceCannonRolls: flagshipStats.spaceCannonRolls,
      };
    }
  }

  // Apply faction-specific overrides
  if (factionId) {
    const overrides = FACTION_UNIT_OVERRIDES[factionId];
    if (overrides) {
      const override = overrides.find(o => o.unitType === unitType);
      if (override) {
        return { ...baseStats, ...override.overrides };
      }
    }
  }

  return baseStats;
}

/**
 * Calculate total capacity for a set of units
 */
export function calculateTotalCapacity(
  units: { [key in UnitType]?: number },
  factionId: string
): number {
  let capacity = 0;

  // Sum up capacity from all units
  (Object.entries(units) as [UnitType, number][]).forEach(([unitType, count]) => {
    if (count > 0) {
      const stats = getUnitStats(unitType, factionId);
      capacity += stats.capacity * count;
    }
  });

  return capacity;
}

/**
 * Calculate capacity needed for fighters and ground forces
 */
export function calculateNeededCapacity(units: { [key in UnitType]?: number }): number {
  return (units.fighter || 0) + (units.infantry || 0) + (units.mech || 0);
}

/**
 * Check if a faction has special capacity rules (e.g., Naalu)
 */
export function hasSpecialCapacityRules(factionId: string): boolean {
  // Naalu can move fighters and ground forces without capacity
  return factionId === 'naalu';
}

/**
 * Get all units with a specific ability
 */
export function getUnitsWithAbility(ability: 'afb' | 'bombardment' | 'space_cannon' | 'sustain'): UnitType[] {
  const units: UnitType[] = [];

  Object.entries(BASE_UNITS).forEach(([unitType, stats]) => {
    switch (ability) {
      case 'afb':
        if (stats.hasAntiFighterBarrage) units.push(unitType as UnitType);
        break;
      case 'bombardment':
        if (stats.hasBombardment) units.push(unitType as UnitType);
        break;
      case 'space_cannon':
        if (stats.hasSpaceCannon) units.push(unitType as UnitType);
        break;
      case 'sustain':
        if (stats.hasSustainDamage) units.push(unitType as UnitType);
        break;
    }
  });

  return units;
}
