// Type definitions for faction data

export type ExpansionType = 'base' | 'pok';
export type LeaderType = 'agent' | 'commander' | 'hero';
export type AbilityType = 'passive' | 'action';
export type TechnologyType = 'biotic' | 'warfare' | 'propulsion' | 'cybernetic';
export type PlanetTrait = 'cultural' | 'industrial' | 'hazardous';

export interface FactionAbility {
  name: string;
  description: string;
  type: AbilityType;
}

export interface Leader {
  name: string;
  type: LeaderType;
  ability: string;
  unlockCondition?: string; // For commander/hero
}

export interface Flagship {
  name: string;
  cost: number;
  combat: string; // e.g., "5 (x2)"
  move: number;
  capacity: number;
  abilities: string[];
}

export interface Mech {
  name: string;
  cost: number;
  combat: string;
  abilities: string[];
}

export interface Planet {
  name: string;
  resources: number;
  influence: number;
  traits?: PlanetTrait[];
}

export interface HomeSystem {
  planets: Planet[];
}

export interface Technology {
  name: string;
  type: TechnologyType;
  color: string; // For display (e.g., "green", "red", "blue", "yellow")
}

export interface PromissoryNote {
  name: string;
  effect: string;
  returnCondition: string;
  placeFaceUp: boolean; // true for Support for Throne, Alliance
}

export interface FactionData {
  id: string;
  name: string;
  expansion: ExpansionType;

  abilities: FactionAbility[];
  flagship: Flagship;
  mech: Mech | null; // null for base game factions without PoK
  startingTechnologies: Technology[];
  commodityValue: number;
  homeSystem: HomeSystem;

  // Promissory notes (base version and Omega versions)
  promissoryNote: {
    base: PromissoryNote;
    omega?: PromissoryNote; // Codex I update
  };

  // Leaders (base and Omega versions)
  leaders: {
    agent: {
      base: Leader;
      omega?: Leader; // Codex III updates
    };
    commander: {
      base: Leader;
      omega?: Leader;
    };
    hero: {
      base: Leader;
      omega?: Leader;
    };
  };
}

/**
 * Type guard to check if faction is Nomad
 */
export function isNomad(factionId: string): boolean {
  return factionId === 'nomad';
}

/**
 * Helper to get all agents for a faction
 * Handles Nomad's special case of 3 agents
 */
export function getAllAgents(faction: FactionData): Leader[] {
  const agentData = faction.leaders.agent as any;

  // Check if this is Nomad with multiple agents
  // Nomad has agent.base, agent.agent2, and agent.agent3
  if (agentData.agent2 && agentData.agent3) {
    return [agentData.base, agentData.agent2, agentData.agent3];
  }

  // Standard faction with 1 agent
  return [agentData.base];
}
