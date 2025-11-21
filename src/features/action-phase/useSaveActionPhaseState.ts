import { useState } from 'react';
import {
  markStrategyCardUsed,
  markPlayerPassed,
  incrementTacticalActions,
} from '@/lib/db/playerActionState';
import { updateGameState } from '@/lib/db/gameState';
import { supabase } from '@/lib/supabase';

interface SaveStrategyCardActionParams {
  gameId: string;
  roundNumber: number;
  playerId: string;
  strategyCardId: number;
}

interface SaveTacticalActionParams {
  gameId: string;
  roundNumber: number;
  playerId: string;
}

interface SavePassActionParams {
  gameId: string;
  roundNumber: number;
  playerId: string;
}

interface ChangeSpeakerParams {
  gameId: string;
  newSpeakerId: string;
}

export function useSaveActionPhaseState() {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveStrategyCardAction = async ({
    gameId,
    roundNumber,
    playerId,
    strategyCardId,
  }: SaveStrategyCardActionParams) => {
    setIsSaving(true);
    setError(null);

    try {
      // Mark player's strategy card as used in player_action_state
      await markStrategyCardUsed(gameId, playerId, roundNumber);

      // Also update the strategy_selections table to mark primary_action_used
      const { error: updateError } = await supabase
        .from('strategy_selections')
        .update({ primary_action_used: true })
        .eq('game_id', gameId)
        .eq('round_number', roundNumber)
        .eq('player_id', playerId)
        .eq('strategy_card_id', strategyCardId);

      if (updateError) throw updateError;

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to save strategy card action';
      setError(errorMessage);
      console.error('Error saving strategy card action:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const saveTacticalAction = async ({
    gameId,
    roundNumber,
    playerId,
  }: SaveTacticalActionParams) => {
    setIsSaving(true);
    setError(null);

    try {
      await incrementTacticalActions(gameId, playerId, roundNumber);
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to save tactical action';
      setError(errorMessage);
      console.error('Error saving tactical action:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const savePassAction = async ({ gameId, roundNumber, playerId }: SavePassActionParams) => {
    setIsSaving(true);
    setError(null);

    try {
      await markPlayerPassed(gameId, playerId, roundNumber);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save pass action';
      setError(errorMessage);
      console.error('Error saving pass action:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const changeSpeaker = async ({ gameId, newSpeakerId }: ChangeSpeakerParams) => {
    setIsSaving(true);
    setError(null);

    try {
      await updateGameState(gameId, {
        speakerPlayerId: newSpeakerId,
      });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to change speaker';
      setError(errorMessage);
      console.error('Error changing speaker:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    saveStrategyCardAction,
    saveTacticalAction,
    savePassAction,
    changeSpeaker,
    isSaving,
    error,
  };
}
