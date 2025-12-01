import type { FactionData, PromissoryNote, Leader } from './types';
import { getAllAgents, isNomad } from './types';

// Re-export helper functions
export { getAllAgents, isNomad } from './types';
export type { FactionData, PromissoryNote, Leader } from './types';

// Import all base game factions
import arborecData from './base-game/arborec.json';
import baronyOfLetnev from './base-game/letnev.json';
import clanOfSaar from './base-game/saar.json';
import embersOfMuaat from './base-game/muaat.json';
import emiratesOfHacan from './base-game/hacan.json';
import federationOfSol from './base-game/sol.json';
import ghostsOfCreuss from './base-game/creuss.json';
import l1z1xMindnet from './base-game/l1z1x.json';
import mentakCoalition from './base-game/mentak.json';
import naaluCollective from './base-game/naalu.json';
import nekroVirus from './base-game/nekro.json';
import sardakkNorr from './base-game/sardakk.json';
import universitiesOfJolNar from './base-game/jol-nar.json';
import winnu from './base-game/winnu.json';
import xxchaKingdom from './base-game/xxcha.json';
import yinBrotherhood from './base-game/yin.json';
import yssarilTribes from './base-game/yssaril.json';

// Import all Prophecy of Kings factions
import argentFlight from './prophecy-of-kings/argent.json';
import councilKeleres from './prophecy-of-kings/keleres.json';
import empyrean from './prophecy-of-kings/empyrean.json';
import mahactGeneSorcerers from './prophecy-of-kings/mahact.json';
import naazRokhaAlliance from './prophecy-of-kings/naaz-rokha.json';
import nomad from './prophecy-of-kings/nomad.json';
import titansOfUl from './prophecy-of-kings/titans.json';
import vuilraithCabal from './prophecy-of-kings/vuil\'raith.json';

// Type assertion for JSON imports
const baseFactions = [
  arborecData,
  baronyOfLetnev,
  clanOfSaar,
  embersOfMuaat,
  emiratesOfHacan,
  federationOfSol,
  ghostsOfCreuss,
  l1z1xMindnet,
  mentakCoalition,
  naaluCollective,
  nekroVirus,
  sardakkNorr,
  universitiesOfJolNar,
  winnu,
  xxchaKingdom,
  yinBrotherhood,
  yssarilTribes,
] as FactionData[];

const pokFactions = [
  argentFlight,
  councilKeleres,
  empyrean,
  mahactGeneSorcerers,
  naazRokhaAlliance,
  nomad,
  titansOfUl,
  vuilraithCabal,
] as FactionData[];

// Combine all factions
export const ALL_FACTIONS = [...baseFactions, ...pokFactions];

// Create a map for quick lookups
export const FACTIONS_BY_ID = new Map<string, FactionData>(
  ALL_FACTIONS.map(faction => [faction.id, faction])
);

/**
 * Get faction data by ID
 */
export function getFactionData(factionId: string): FactionData | undefined {
  return FACTIONS_BY_ID.get(factionId);
}

/**
 * Get all base game factions
 */
export function getBaseGameFactions(): FactionData[] {
  return baseFactions;
}

/**
 * Get all Prophecy of Kings factions
 */
export function getProphecyOfKingsFactions(): FactionData[] {
  return pokFactions;
}

/**
 * Get factions filtered by enabled expansions
 */
export function getAvailableFactions(pokEnabled: boolean): FactionData[] {
  if (pokEnabled) {
    return ALL_FACTIONS;
  }
  return baseFactions;
}

/**
 * Select the appropriate promissory note version based on codex configuration
 */
export function getPromissoryNote(
  faction: FactionData,
  codex1Enabled: boolean
): PromissoryNote {
  if (codex1Enabled && faction.promissoryNote.omega) {
    return faction.promissoryNote.omega;
  }
  return faction.promissoryNote.base;
}

/**
 * Select the appropriate leader version based on codex configuration
 */
export function getLeader(
  leaderData: { base: Leader; omega?: Leader },
  codex3Enabled: boolean
): Leader {
  if (codex3Enabled && leaderData.omega) {
    return leaderData.omega;
  }
  return leaderData.base;
}

/**
 * Get all leaders for a faction with appropriate codex versions applied
 */
export function getFactionLeaders(
  faction: FactionData,
  codex3Enabled: boolean
): {
  agent: Leader;
  commander: Leader;
  hero: Leader;
} {
  return {
    agent: getLeader(faction.leaders.agent, codex3Enabled),
    commander: getLeader(faction.leaders.commander, codex3Enabled),
    hero: getLeader(faction.leaders.hero, codex3Enabled),
  };
}

/**
 * Check if a faction has Omega components
 */
export function hasOmegaComponents(faction: FactionData): {
  promissoryNote: boolean;
  agent: boolean;
  commander: boolean;
  hero: boolean;
} {
  return {
    promissoryNote: !!faction.promissoryNote.omega,
    agent: !!faction.leaders.agent.omega,
    commander: !!faction.leaders.commander.omega,
    hero: !!faction.leaders.hero.omega,
  };
}

/**
 * Get faction IDs that have specific Omega components
 */
export function getFactionsWithOmegaPromissoryNotes(): string[] {
  return ALL_FACTIONS
    .filter(f => f.promissoryNote.omega)
    .map(f => f.id);
}

export function getFactionsWithOmegaLeaders(): string[] {
  return ALL_FACTIONS
    .filter(f => f.leaders.agent.omega || f.leaders.commander.omega || f.leaders.hero.omega)
    .map(f => f.id);
}
