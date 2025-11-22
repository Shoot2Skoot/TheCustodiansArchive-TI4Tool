/**
 * Helper utilities for the audio system
 */

import { StrategyCardType } from './audio';

/**
 * Map strategy card ID (1-8) to StrategyCardType enum
 */
export function getStrategyCardAudioType(strategyCardId: number): StrategyCardType | null {
  switch (strategyCardId) {
    case 1:
      return StrategyCardType.LEADERSHIP;
    case 2:
      return StrategyCardType.DIPLOMACY;
    case 3:
      return StrategyCardType.POLITICS;
    case 4:
      return StrategyCardType.CONSTRUCTION;
    case 5:
      return StrategyCardType.TRADE;
    case 6:
      return StrategyCardType.WARFARE;
    case 7:
      return StrategyCardType.TECHNOLOGY;
    case 8:
      return StrategyCardType.IMPERIAL;
    default:
      console.warn(`Unknown strategy card ID: ${strategyCardId}`);
      return null;
  }
}

/**
 * Map faction IDs to audio file names
 * The faction IDs in the codebase are short (e.g., 'saar')
 * but audio files use descriptive names without "the_" prefix (e.g., 'clan_of_saar')
 */
const FACTION_AUDIO_MAP: Record<string, string> = {
  arborec: 'arborec',
  argent: 'argent_flight',
  creuss: 'ghosts_of_creuss',
  empyrean: 'empyrean',
  hacan: 'emirates_of_hacan',
  'jol-nar': 'universities_of_jolnar',
  keleres: 'council_keleres',
  l1z1x: 'l1z1x_mindnet',
  letnev: 'barony_of_letnev',
  mahact: 'mahact_gene_sorcerers',
  mentak: 'mentak_coalition',
  muaat: 'embers_of_muaat',
  naalu: 'naalu_collective',
  naaz: 'naaz_rokha_alliance',
  nekro: 'nekro_virus',
  nomad: 'nomad',
  cabal: 'vuil_raith_cabal',
  saar: 'clan_of_saar',
  sardakk: 'sardakk_norr',
  sol: 'federation_of_sol',
  titans: 'titans_of_ul',
  winnu: 'winnu',
  xxcha: 'xxcha_kingdom',
  yin: 'yin_brotherhood',
  yssaril: 'yssaril_tribes',
};

/**
 * Normalize faction ID to match audio file naming convention
 * Converts faction IDs to their corresponding audio file names
 */
export function normalizeFactionId(factionId: string): string {
  const normalizedInput = factionId.toLowerCase().trim();

  // Check if we have a direct mapping
  if (FACTION_AUDIO_MAP[normalizedInput]) {
    return FACTION_AUDIO_MAP[normalizedInput];
  }

  // Fallback: convert to snake_case (for any unmapped factions)
  return normalizedInput
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

/**
 * Get all faction IDs from a list of players
 */
export function getFactionIdsFromPlayers(players: Array<{ factionId: string }>): string[] {
  return players.map(p => normalizeFactionId(p.factionId));
}
