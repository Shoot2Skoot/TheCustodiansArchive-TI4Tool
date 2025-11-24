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
  console.log('💰 calculateTradeGoodBonuses called:', { currentRound, totalSelections: allSelections.length });

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
    console.log('💰 Round 1 - no bonuses');
    return bonuses;
  }

  // For each previous round, check which cards weren't picked
  for (let round = 1; round < currentRound; round++) {
    const roundSelections = allSelections.filter((s) => s.roundNumber === round);
    const pickedCardIds = new Set(roundSelections.map((s) => s.strategyCardId));

    console.log(`💰 Round ${round} analysis:`, {
      roundSelectionsCount: roundSelections.length,
      pickedCardIds: Array.from(pickedCardIds),
    });

    // Any card that wasn't picked gets +1 bonus
    for (let cardId = 1; cardId <= 8; cardId++) {
      if (!pickedCardIds.has(cardId)) {
        bonuses[cardId] = (bonuses[cardId] || 0) + 1;
        console.log(`💰 Card ${cardId} was NOT picked in round ${round}, bonus now: ${bonuses[cardId]}`);
      }
    }
  }

  console.log('💰 Final bonuses:', bonuses);
  return bonuses;
}
