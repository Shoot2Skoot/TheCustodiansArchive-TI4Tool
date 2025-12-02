// ============================================================================
// TWILIGHT IMPERIUM 4TH EDITION — COMBAT TYPES
// ============================================================================

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export enum CombatPhase {
  ACTIVATION = 0,           // Phase 0: P0.1-P0.6
  SPACE_CANNON_OFFENSE = 1, // Phase 1: P1.1-P1.4
  SPACE_COMBAT = 2,         // Phase 2: P2.1-P2.6 (repeating)
  INVASION = 3,             // Phase 3: P3.1-P3.10
  GROUND_COMBAT = 4,        // Phase 4: P4.1-P4.6 (repeating)
  POST_COMBAT = 5,          // Post-Combat: PC.1-PC.3
}

export type CombatStep =
  | `P0.${1 | 2 | 3 | 4 | 5 | 6}`
  | `P1.${1 | 2 | 3 | 4}`
  | 'P1.1a'  // Player transition screen
  | 'P1.3a'  // Capacity trimming
  | `P2.${1 | 2 | 3 | 4 | 5 | 6}`
  | 'P2.2-assignment'  // Attacker hit assignment
  | 'P2.2-assignment-defender'  // Defender hit assignment
  | 'P2.5-defender'  // Defender retreat
  | `P3.${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10}`
  | `P4.${1 | 2 | 3 | 4 | 5 | 6}`
  | `PC.${1 | 2 | 3}`;

export enum UnitType {
  // Space Units
  WAR_SUN = 'war_sun',
  DREADNOUGHT = 'dreadnought',
  CRUISER = 'cruiser',
  CARRIER = 'carrier',
  DESTROYER = 'destroyer',
  FIGHTER = 'fighter',
  FLAGSHIP = 'flagship',

  // Ground Units
  INFANTRY = 'infantry',
  MECH = 'mech',

  // Structures
  PDS = 'pds',
  SPACE_DOCK = 'space_dock',
}

export enum CombatModifierSource {
  TECHNOLOGY = 'technology',
  ACTION_CARD = 'action_card',
  FACTION_ABILITY = 'faction_ability',
  LEADER = 'leader',
  PLANET_TRAIT = 'planet_trait',
  EXPLORATION_CARD = 'exploration_card',
  RELIC = 'relic',
  AGENDA = 'agenda',
  PROMISSORY_NOTE = 'promissory_note',
}

export enum CombatEventType {
  COMBAT_STARTED = 'combat_started',
  PHASE_CHANGED = 'phase_changed',
  STEP_CHANGED = 'step_changed',
  ROUND_STARTED = 'round_started',
  ABILITY_USED = 'ability_used',
  ACTION_CARD_PLAYED = 'action_card_played',
  PROMISSORY_NOTE_PLAYED = 'promissory_note_played',
  MODIFIER_APPLIED = 'modifier_applied',
  DICE_ROLLED = 'dice_rolled',
  HITS_PRODUCED = 'hits_produced',
  HITS_ASSIGNED = 'hits_assigned',
  UNIT_DESTROYED = 'unit_destroyed',
  SUSTAIN_DAMAGE_USED = 'sustain_damage_used',
  RETREAT_ANNOUNCED = 'retreat_announced',
  RETREAT_EXECUTED = 'retreat_executed',
  PLANET_CONTROL_CHANGED = 'planet_control_changed',
  COMBAT_ENDED = 'combat_ended',
}

// ============================================================================
// UNIT DEFINITIONS
// ============================================================================

export interface CombatUnit {
  id: string; // Unique ID for this specific unit instance
  type: UnitType;
  ownerId: string; // Player ID

  // Combat stats
  combatValue: number;
  combatRolls: number; // How many dice this unit rolls (e.g., x2 for fighters)

  // Damage state
  hasSustainDamage: boolean;
  isSustained: boolean; // Has taken sustain damage
  isDestroyed: boolean;

  // Special abilities
  hasAntiFighterBarrage: boolean;
  afbValue?: number;
  afbRolls?: number;

  hasBombardment: boolean;
  bombardmentValue?: number;
  bombardmentRolls?: number;
  ignoresPlanetaryShield?: boolean;

  hasSpaceCannon: boolean;
  spaceCannonValue?: number;
  spaceCannonRolls?: number;
  canFireAtAdjacentSystems?: boolean; // For PDS II

  hasPlanetaryShield: boolean;

  // Capacity (for carriers)
  capacity?: number;

  // Modifiers (from tech, action cards, etc.)
  modifiers: CombatModifier[];

  // Metadata
  isUpgraded: boolean;
  factionId: string;
  customName?: string; // For flagships
  planetId?: string; // For ground units and structures
}

export interface CombatModifier {
  id: string;
  source: CombatModifierSource;
  sourceName: string; // e.g., "Plasma Scoring", "Morale Boost", "Graviton Laser System"

  // What does this modifier affect?
  affectsPhase: CombatPhase[];
  affectsUnitTypes?: UnitType[]; // If undefined, affects all units

  // Modifier types
  combatBonus?: number; // +1, -1, etc.
  rerollMisses?: boolean;
  rerollHits?: boolean;
  additionalRolls?: number;
  changeHitValue?: number; // e.g., "hits on 5+ instead of 6+"

  // Special modifiers
  preventRetreat?: boolean;
  preventSustainDamage?: boolean;
  ignoreSpaceCannon?: boolean;
  ignorePlanetaryShield?: boolean;

  // Timing
  usedThisCombat: boolean;
  oneTimeUse: boolean; // Removed after use (e.g., action cards)
  perRound: boolean; // Resets each round
}

// ============================================================================
// COMBAT PARTICIPANT
// ============================================================================

export interface CombatParticipant {
  playerId: string;
  playerName: string;
  factionId: string;
  color: string;
  isAttacker: boolean;

  // Units in combat
  spaceUnits: CombatUnit[];
  groundForces: CombatUnit[];
  structures: CombatUnit[]; // PDS, Space Docks

  // Combat state
  queuedHits: number; // Hits that need to be assigned
  hitsProduced: number; // Hits this participant has produced

  // Retreat state
  hasAnnouncedRetreat: boolean;
  hasRetreated: boolean;
  retreatDestinationSystemId?: string;

  // Modifiers
  globalModifiers: CombatModifier[]; // Modifiers affecting all units

  // Resources spent
  actionCardsPlayed: string[];
  promissoryNotesPlayed: string[];
  abilitiesUsed: string[];
  technologiesExhausted: string[];
  leadersExhausted: string[];
}

// ============================================================================
// THIRD PARTY PARTICIPANTS (for Space Cannon from adjacent)
// ============================================================================

export interface ThirdPartyParticipant {
  playerId: string;
  playerName: string;
  factionId: string;

  // Only includes units that can fire Space Cannon
  spaceCannonUnits: CombatUnit[];

  // Which side are they helping? (by firing at the other side)
  firingAt: 'attacker' | 'defender';
}

// ============================================================================
// COMBAT STATE
// ============================================================================

export interface CombatState {
  // Basic identification
  id: string; // Unique combat ID
  gameId: string;
  systemId: string;
  planetIds: string[]; // For ground combat on multiple planets

  // Timing
  createdAt: string;
  updatedAt: string;

  // Flow control
  currentPhase: CombatPhase;
  currentStep: CombatStep;
  spaceCombatRound: number; // For Phase 2
  groundCombatRound: number; // For Phase 4
  currentPlanetIndex: number; // For multi-planet invasions

  // Participants
  attacker: CombatParticipant;
  defender: CombatParticipant;
  thirdPartyParticipants: ThirdPartyParticipant[];

  // Phase completion flags
  activationComplete: boolean;
  spaceCannonOffenseComplete: boolean;
  spaceCombatComplete: boolean;
  bombardmentComplete: boolean;
  invasionComplete: boolean;
  groundCombatComplete: boolean;

  // Special states
  afbFiredThisCombat: boolean; // AFB only fires in round 1 of space combat

  // Combat log
  log: CombatLogEntry[];

  // Completion
  isComplete: boolean;
  winner: 'attacker' | 'defender' | 'draw' | null;

  // Undo/Redo support
  canUndo: boolean;
  canRedo: boolean;
}

export interface CombatLogEntry {
  id: string;
  timestamp: string;
  phase: CombatPhase;
  step: CombatStep;
  round?: number;

  // What happened
  eventType: CombatEventType;
  description: string;

  // Structured data for different event types
  data?: {
    playerId?: string;
    unitType?: UnitType;
    unitId?: string;
    hits?: number;
    modifier?: CombatModifier;
    actionCard?: string;
    promissoryNote?: string;
    abilityName?: string;
  };
}

// ============================================================================
// STEP CONFIGURATION (for making steps easy to modify)
// ============================================================================

export interface StepConfig {
  step: CombatStep;
  title: string;
  description: string;

  // Conditional logic
  shouldSkip?: (state: CombatState) => boolean;

  // Available actions at this step
  availableActions: StepAction[];

  // What happens when the step completes
  onComplete?: (state: CombatState) => CombatState;

  // Next step logic (handles branching)
  getNextStep?: (state: CombatState) => CombatStep | 'PHASE_COMPLETE' | 'COMBAT_COMPLETE';
}

export interface StepAction {
  id: string;
  label: string;
  variant: 'primary' | 'secondary' | 'danger';

  // Visibility/availability
  isVisible?: (state: CombatState) => boolean;
  isDisabled?: (state: CombatState) => boolean;
  disabledReason?: string;

  // Handler
  onExecute: (state: CombatState, params?: any) => CombatState;

  // For actions that need user input
  requiresInput?: 'number' | 'unit_selection' | 'system_selection' | 'player_selection' | 'planet_selection' | 'custom';
  inputConfig?: {
    label: string;
    min?: number;
    max?: number;
    placeholder?: string;
  };
}

// ============================================================================
// ACTION CARD DEFINITIONS
// ============================================================================

export interface ActionCardDefinition {
  id: string;
  name: string;
  timing: CombatStep[];
  effect: (state: CombatState, params?: any) => CombatState;
  isPlayable: (state: CombatState) => boolean;
  requiresInput?: StepAction['requiresInput'];
  inputConfig?: StepAction['inputConfig'];
}

// ============================================================================
// FACTION ABILITY DEFINITIONS
// ============================================================================

export interface FactionAbilityDefinition {
  id: string;
  factionId: string;
  name: string;
  timing: CombatStep[];
  effect: (state: CombatState, params?: any) => CombatState;
  isAvailable: (state: CombatState) => boolean;
  requiresInput?: StepAction['requiresInput'];
  inputConfig?: StepAction['inputConfig'];
}

// ============================================================================
// PROMISSORY NOTE DEFINITIONS
// ============================================================================

export interface PromissoryNoteDefinition {
  id: string;
  factionId: string; // The faction whose promissory note this is
  name: string;
  timing: CombatStep[];
  effect: (state: CombatState, params?: any) => CombatState;
  isPlayable: (state: CombatState) => boolean;
  requiresInput?: StepAction['requiresInput'];
  inputConfig?: StepAction['inputConfig'];
}
