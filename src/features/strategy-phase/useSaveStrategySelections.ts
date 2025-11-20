import { useState } from 'react';
import { createStrategySelections, deleteStrategySelectionsForRound } from '@/lib/db/strategySelections';
import { updateGameState } from '@/lib/db/gameState';

interface StrategySelection {
  playerId: string;
  cardId: number;
  tradeGoodBonus: number;
  selectionOrder: number;
}

interface SaveSelectionsParams {
  gameId: string;
  roundNumber: number;
  selections: StrategySelection[];
}

export function useSaveStrategySelections() {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveSelections = async ({ gameId, roundNumber, selections }: SaveSelectionsParams) => {
    setIsSaving(true);
    setError(null);

    try {
      // Delete any existing selections for this round (in case of reset)
      await deleteStrategySelectionsForRound(gameId, roundNumber);

      // Create new selections
      const selectionsData = selections.map((s) => ({
        playerId: s.playerId,
        strategyCardId: s.cardId,
        selectionOrder: s.selectionOrder,
        tradeGoodBonus: s.tradeGoodBonus,
      }));

      await createStrategySelections(gameId, roundNumber, selectionsData);

      // Update game state to action phase
      await updateGameState(gameId, {
        currentPhase: 'action',
        phaseStartedAt: new Date().toISOString(),
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save strategy selections';
      setError(errorMessage);
      console.error('Error saving strategy selections:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const resetSelections = async (gameId: string, roundNumber: number) => {
    setIsSaving(true);
    setError(null);

    try {
      await deleteStrategySelectionsForRound(gameId, roundNumber);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset strategy selections';
      setError(errorMessage);
      console.error('Error resetting strategy selections:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    saveSelections,
    resetSelections,
    isSaving,
    error,
  };
}
