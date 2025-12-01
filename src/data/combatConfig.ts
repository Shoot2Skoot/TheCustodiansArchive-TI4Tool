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
  | 'space_dock'
  // Faction-Specific Units (Base Game)
  | 'letani_warrior' // Arborec Infantry
  | 'floating_factory' // Saar Space Dock
  | 'prototype_war_sun' // Muaat War Sun
  | 'spec_ops' // Sol Infantry
  | 'advanced_carrier' // Sol Carrier
  | 'super_dreadnought' // L1Z1X Dreadnought
  | 'hybrid_crystal_fighter' // Naalu Fighter
  | 'exotrireme' // Sardakk Dreadnought
  // Faction-Specific Units (Prophecy of Kings)
  | 'strike_wing_alpha' // Argent Destroyer
  | 'crimson_legionnaire' // Mahact Infantry
  | 'saturn_engine' // Titans Cruiser
  | 'hel_titan' // Titans PDS
  | 'dimensional_tear' // Vuil'raith Space Dock
  // Faction-Specific Units (Thunder's Edge)
  | 'exile' // Crimson Rebellion Destroyer
  | 'helios' // Last Bastion Space Dock
  | 'linkship'; // Ral Nel Destroyer

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

  // ============================================================================
  // FACTION-SPECIFIC UNITS (Base Game)
  // ============================================================================

  // Arborec Infantry
  letani_warrior: {
    id: 'letani_warrior',
    name: 'Letani Warrior',
    displayName: 'Letani Warrior',
    cost: 0.5,
    combat: 8, // 7 when upgraded
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

  // Saar Space Dock
  floating_factory: {
    id: 'floating_factory',
    name: 'Floating Factory',
    displayName: 'Floating Factory',
    cost: 4,
    combat: null,
    combatRolls: 0,
    move: 1, // 2 when upgraded
    capacity: 4, // 5 when upgraded
    hasSustainDamage: false,
    hasAntiFighterBarrage: false,
    hasBombardment: false,
    hasSpaceCannon: false,
    hasPlanetaryShield: false,
    isGroundForce: false,
    isShip: true, // Can move like a ship
    isStructure: true,
  },

  // Muaat War Sun
  prototype_war_sun: {
    id: 'prototype_war_sun',
    name: 'Prototype War Sun',
    displayName: 'Prototype War Sun',
    cost: 12, // 10 when upgraded
    combat: 3,
    combatRolls: 3,
    move: 1, // 3 when upgraded
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

  // Sol Infantry
  spec_ops: {
    id: 'spec_ops',
    name: 'Spec Ops',
    displayName: 'Spec Ops',
    cost: 0.5,
    combat: 7, // 6 when upgraded
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

  // Sol Carrier
  advanced_carrier: {
    id: 'advanced_carrier',
    name: 'Advanced Carrier',
    displayName: 'Advanced Carrier',
    cost: 3,
    combat: 9,
    combatRolls: 1,
    move: 1, // 2 when upgraded
    capacity: 6, // 8 when upgraded
    hasSustainDamage: false, // true when upgraded
    hasAntiFighterBarrage: false,
    hasBombardment: false,
    hasSpaceCannon: false,
    hasPlanetaryShield: false,
    isGroundForce: false,
    isShip: true,
    isStructure: false,
  },

  // L1Z1X Dreadnought
  super_dreadnought: {
    id: 'super_dreadnought',
    name: 'Super-Dreadnought',
    displayName: 'Super-Dreadnought',
    cost: 4,
    combat: 5, // 4 when upgraded
    combatRolls: 1,
    move: 1, // 2 when upgraded
    capacity: 2,
    hasSustainDamage: true,
    hasAntiFighterBarrage: false,
    hasBombardment: true,
    bombardmentValue: 5, // 4 when upgraded
    bombardmentRolls: 1,
    hasSpaceCannon: false,
    hasPlanetaryShield: false,
    isGroundForce: false,
    isShip: true,
    isStructure: false,
  },

  // Naalu Fighter
  hybrid_crystal_fighter: {
    id: 'hybrid_crystal_fighter',
    name: 'Hybrid Crystal Fighter',
    displayName: 'Hybrid Crystal Fighter',
    cost: 0.5,
    combat: 8, // 7 when upgraded
    combatRolls: 1,
    move: 0, // 2 when upgraded (can move independently)
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

  // Sardakk Dreadnought
  exotrireme: {
    id: 'exotrireme',
    name: 'Exotrireme',
    displayName: 'Exotrireme',
    cost: 4,
    combat: 5,
    combatRolls: 1,
    move: 1, // 2 when upgraded
    capacity: 1,
    hasSustainDamage: true,
    hasAntiFighterBarrage: false,
    hasBombardment: true,
    bombardmentValue: 4,
    bombardmentRolls: 2,
    hasSpaceCannon: false,
    hasPlanetaryShield: false,
    isGroundForce: false,
    isShip: true,
    isStructure: false,
  },

  // ============================================================================
  // FACTION-SPECIFIC UNITS (Prophecy of Kings)
  // ============================================================================

  // Argent Destroyer
  strike_wing_alpha: {
    id: 'strike_wing_alpha',
    name: 'Strike Wing Alpha',
    displayName: 'Strike Wing Alpha',
    cost: 1,
    combat: 8, // 7 when upgraded
    combatRolls: 1,
    move: 2,
    capacity: 1,
    hasSustainDamage: false,
    hasAntiFighterBarrage: true,
    afbValue: 9, // 6 when upgraded
    afbRolls: 2, // 3 when upgraded
    hasBombardment: false,
    hasSpaceCannon: false,
    hasPlanetaryShield: false,
    isGroundForce: false,
    isShip: true,
    isStructure: false,
  },

  // Mahact Infantry
  crimson_legionnaire: {
    id: 'crimson_legionnaire',
    name: 'Crimson Legionnaire',
    displayName: 'Crimson Legionnaire',
    cost: 0.5,
    combat: 8, // 7 when upgraded
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

  // Titans Cruiser
  saturn_engine: {
    id: 'saturn_engine',
    name: 'Saturn Engine',
    displayName: 'Saturn Engine',
    cost: 2,
    combat: 7, // 6 when upgraded
    combatRolls: 1,
    move: 2, // 3 when upgraded
    capacity: 1, // 2 when upgraded
    hasSustainDamage: false, // true when upgraded
    hasAntiFighterBarrage: false,
    hasBombardment: false,
    hasSpaceCannon: false,
    hasPlanetaryShield: false,
    isGroundForce: false,
    isShip: true,
    isStructure: false,
  },

  // Titans PDS
  hel_titan: {
    id: 'hel_titan',
    name: 'Hel-Titan',
    displayName: 'Hel-Titan',
    cost: 2,
    combat: 7, // 6 when upgraded
    combatRolls: 1,
    move: 0,
    capacity: 0,
    hasSustainDamage: true,
    hasAntiFighterBarrage: false,
    hasBombardment: false,
    hasSpaceCannon: true,
    spaceCannonValue: 6, // 5 when upgraded
    spaceCannonRolls: 1,
    hasPlanetaryShield: true,
    isGroundForce: true, // Also a ground force!
    isShip: false,
    isStructure: true,
  },

  // Vuil'raith Space Dock
  dimensional_tear: {
    id: 'dimensional_tear',
    name: 'Dimensional Tear',
    displayName: 'Dimensional Tear',
    cost: 4,
    combat: null,
    combatRolls: 0,
    move: 0,
    capacity: 0, // Special: 6 fighters don't count (12 when upgraded)
    hasSustainDamage: false,
    hasAntiFighterBarrage: false,
    hasBombardment: false,
    hasSpaceCannon: false,
    hasPlanetaryShield: false,
    isGroundForce: false,
    isShip: false,
    isStructure: true,
  },

  // ============================================================================
  // FACTION-SPECIFIC UNITS (Thunder's Edge)
  // ============================================================================

  // Crimson Rebellion Destroyer
  exile: {
    id: 'exile',
    name: 'Exile',
    displayName: 'Exile',
    cost: 1,
    combat: 8, // 7 when upgraded
    combatRolls: 1,
    move: 2,
    capacity: 0,
    hasSustainDamage: false,
    hasAntiFighterBarrage: true,
    afbValue: 9, // 6 when upgraded
    afbRolls: 2, // 3 when upgraded
    hasBombardment: false,
    hasSpaceCannon: false,
    hasPlanetaryShield: false,
    isGroundForce: false,
    isShip: true,
    isStructure: false,
  },

  // Last Bastion Space Dock
  helios: {
    id: 'helios',
    name: '4X4IC "HELIOS"',
    displayName: '4X4IC "HELIOS"',
    cost: 4,
    combat: null,
    combatRolls: 0,
    move: 0,
    capacity: 0, // Special: 3 fighters don't count
    hasSustainDamage: false,
    hasAntiFighterBarrage: false,
    hasBombardment: false,
    hasSpaceCannon: false,
    hasPlanetaryShield: false,
    isGroundForce: false,
    isShip: false,
    isStructure: true,
  },

  // Ral Nel Destroyer
  linkship: {
    id: 'linkship',
    name: 'Linkship',
    displayName: 'Linkship',
    cost: 1,
    combat: 9, // 8 when upgraded
    combatRolls: 1,
    move: 3, // 4 when upgraded
    capacity: 0,
    hasSustainDamage: false,
    hasAntiFighterBarrage: true,
    afbValue: 9, // 6 when upgraded
    afbRolls: 2, // 3 when upgraded
    hasBombardment: false,
    hasSpaceCannon: false, // Can use structures' space cannon ability
    hasPlanetaryShield: false,
    isGroundForce: false,
    isShip: true,
    isStructure: false,
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
// FACTION SPECIAL UNITS MAPPING
// Maps faction IDs to their special units (replaces base units)
// ============================================================================

export const FACTION_SPECIAL_UNITS: Record<string, Partial<Record<UnitType, UnitType>>> = {
  // Base Game
  arborec: {
    infantry: 'letani_warrior',
  },
  saar: {
    space_dock: 'floating_factory',
  },
  muaat: {
    war_sun: 'prototype_war_sun',
  },
  sol: {
    infantry: 'spec_ops',
    carrier: 'advanced_carrier',
  },
  l1z1x: {
    dreadnought: 'super_dreadnought',
  },
  naalu: {
    fighter: 'hybrid_crystal_fighter',
  },
  sardakk: {
    dreadnought: 'exotrireme',
  },

  // Prophecy of Kings
  argent: {
    destroyer: 'strike_wing_alpha',
  },
  mahact: {
    infantry: 'crimson_legionnaire',
  },
  titans: {
    cruiser: 'saturn_engine',
    pds: 'hel_titan',
  },
  "vuil'raith": {
    space_dock: 'dimensional_tear',
  },

  // Thunder's Edge
  // Note: These factions may not be in the base game
  // 'crimson': {
  //   destroyer: 'exile',
  // },
  // 'last-bastion': {
  //   space_dock: 'helios',
  // },
  // 'ral-nel': {
  //   destroyer: 'linkship',
  // },
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

/**
 * Get the correct unit type for a faction (returns faction-specific unit if available)
 */
export function getFactionUnitType(baseUnitType: UnitType, factionId: string): UnitType {
  const specialUnits = FACTION_SPECIAL_UNITS[factionId];
  if (specialUnits && specialUnits[baseUnitType]) {
    return specialUnits[baseUnitType]!;
  }
  return baseUnitType;
}

/**
 * Get all available unit types for a faction (includes their special units)
 */
export function getAvailableUnitsForFaction(factionId: string): UnitType[] {
  const availableUnits: UnitType[] = [];
  const specialUnits = FACTION_SPECIAL_UNITS[factionId] || {};

  // Add all base unit types
  Object.keys(BASE_UNITS).forEach(unitType => {
    // If this faction has a special version of this unit, use that instead
    const actualUnitType = getFactionUnitType(unitType as UnitType, factionId);
    if (!availableUnits.includes(actualUnitType)) {
      availableUnits.push(actualUnitType);
    }
  });

  return availableUnits;
}
