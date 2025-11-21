import { supabase } from '../supabase';
import type { Database } from '@/types/database';

type PlayerActionStateInsert = Database['public']['Tables']['player_action_state']['Insert'];
type PlayerActionStateUpdate = Database['public']['Tables']['player_action_state']['Update'];

/**
 * Create or update player action state for a round
 */
export async function upsertPlayerActionState(
  gameId: string,
  playerId: string,
  roundNumber: number,
  updates: Partial<PlayerActionStateUpdate>
) {
  const { data, error } = await supabase
    .from('player_action_state')
    .upsert({
      game_id: gameId,
      player_id: playerId,
      round_number: roundNumber,
      ...updates,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Mark player's strategy card as used
 */
export async function markStrategyCardUsed(
  gameId: string,
  playerId: string,
  roundNumber: number
) {
  return upsertPlayerActionState(gameId, playerId, roundNumber, {
    strategy_card_used: true,
  });
}

/**
 * Mark player as passed
 */
export async function markPlayerPassed(
  gameId: string,
  playerId: string,
  roundNumber: number
) {
  return upsertPlayerActionState(gameId, playerId, roundNumber, {
    has_passed: true,
    passed_at: new Date().toISOString(),
  });
}

/**
 * Increment player's tactical action count
 */
export async function incrementTacticalActions(
  gameId: string,
  playerId: string,
  roundNumber: number
) {
  // First, get current count
  const { data: currentState } = await supabase
    .from('player_action_state')
    .select('tactical_actions_count')
    .eq('game_id', gameId)
    .eq('player_id', playerId)
    .eq('round_number', roundNumber)
    .single();

  const currentCount = currentState?.tactical_actions_count || 0;

  return upsertPlayerActionState(gameId, playerId, roundNumber, {
    tactical_actions_count: currentCount + 1,
  });
}

/**
 * Get all player action states for a game round
 */
export async function getPlayerActionStates(gameId: string, roundNumber: number) {
  const { data, error } = await supabase
    .from('player_action_state')
    .select('*')
    .eq('game_id', gameId)
    .eq('round_number', roundNumber);

  if (error) throw error;
  return data || [];
}

/**
 * Initialize player action states for all players in a round
 */
export async function initializePlayerActionStates(
  gameId: string,
  playerIds: string[],
  roundNumber: number
) {
  const states: PlayerActionStateInsert[] = playerIds.map((playerId) => ({
    game_id: gameId,
    player_id: playerId,
    round_number: roundNumber,
    tactical_actions_count: 0,
    strategy_card_used: false,
    has_passed: false,
  }));

  const { data, error } = await supabase.from('player_action_state').insert(states).select();

  if (error) throw error;
  return data;
}
