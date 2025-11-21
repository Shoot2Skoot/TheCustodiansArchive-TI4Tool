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
 * Normalize faction ID to match audio file naming convention
 * Converts display names or IDs to lowercase snake_case format
 */
export function normalizeFactionId(factionId: string): string {
  return factionId
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

/**
 * Get all faction IDs from a list of players
 */
export function getFactionIdsFromPlayers(players: Array<{ factionId: string }>): string[] {
  return players.map(p => normalizeFactionId(p.factionId));
}
