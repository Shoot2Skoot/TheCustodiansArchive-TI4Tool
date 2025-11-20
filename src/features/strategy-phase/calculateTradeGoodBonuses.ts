import type { StrategySelection } from '@/types';

/**
 * Calculates trade good bonuses for strategy cards based on previous rounds.
 * Cards that weren't picked in a round get +1 trade good bonus that carries over.
 *
 * @param allSelections - All strategy selections for the game
 * @param currentRound - The current round number
 * @returns Record of cardId -> trade good bonus
 */
export function calculateTradeGoodBonuses(
  allSelections: StrategySelection[],
  currentRound: number
): Record<number, number> {
  const bonuses: Record<number, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
  };

  // If this is round 1, no bonuses (nothing to carry over)
  if (currentRound <= 1) {
    return bonuses;
  }

  // For each previous round, check which cards weren't picked
  for (let round = 1; round < currentRound; round++) {
    const roundSelections = allSelections.filter((s) => s.roundNumber === round);
    const pickedCardIds = new Set(roundSelections.map((s) => s.strategyCardId));

    // Any card that wasn't picked gets +1 bonus
    for (let cardId = 1; cardId <= 8; cardId++) {
      if (!pickedCardIds.has(cardId)) {
        bonuses[cardId] += 1;
      }
    }
  }

  return bonuses;
}
