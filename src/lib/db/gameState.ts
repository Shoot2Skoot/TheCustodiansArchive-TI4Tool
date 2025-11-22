import { supabase } from '../supabase';
import type { GameState, GamePhase } from '../../types';

// Helper to convert snake_case to camelCase
function toCamelCase(data: any): GameState {
  return {
    gameId: data.game_id,
    currentRound: data.current_round,
    currentPhase: data.current_phase,
    currentTurnPlayerId: data.current_turn_player_id,
    speakerPlayerId: data.speaker_player_id,
    mecatolClaimed: data.mecatol_claimed,
    mecatolClaimedRound: data.mecatol_claimed_round,
    lastActivityAt: data.last_activity_at,
    phaseStartedAt: data.phase_started_at,
    updatedAt: data.updated_at,
  };
}

// Create initial game state
export async function createGameState(gameId: string) {
  const { data, error } = await supabase
    .from('game_state')
    .insert({
      game_id: gameId,
      current_round: 0,
      current_phase: 'setup',
      mecatol_claimed: false,
      last_activity_at: new Date().toISOString(),
    } as any)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create game state: ${error.message}`);
  }

  return toCamelCase(data);
}

// Initialize game state with speaker
export async function initializeGameState(gameId: string, speakerPlayerId: string) {
  const { data, error } = await supabase
    .from('game_state')
    .insert({
      game_id: gameId,
      current_round: 1,
      current_phase: 'strategy',
      speaker_player_id: speakerPlayerId,
      mecatol_claimed: false,
      last_activity_at: new Date().toISOString(),
      phase_started_at: new Date().toISOString(),
    } as any)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to initialize game state: ${error.message}`);
  }

  return toCamelCase(data);
}

// Get game state
export async function getGameState(gameId: string) {
  const { data, error } = await supabase.from('game_state').select('*').eq('game_id', gameId).single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to get game state: ${error.message}`);
  }

  return toCamelCase(data);
}

// Update game state
export async function updateGameState(gameId: string, updates: Partial<GameState>) {
  console.log('🟢 updateGameState called with gameId:', gameId, 'updates:', updates);

  // Build update object with only defined values
  const updateData: any = {
    last_activity_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (updates.currentRound !== undefined) updateData.current_round = updates.currentRound;
  if (updates.currentPhase !== undefined) updateData.current_phase = updates.currentPhase;
  if (updates.currentTurnPlayerId !== undefined) updateData.current_turn_player_id = updates.currentTurnPlayerId;
  if (updates.speakerPlayerId !== undefined) updateData.speaker_player_id = updates.speakerPlayerId;
  if (updates.mecatolClaimed !== undefined) updateData.mecatol_claimed = updates.mecatolClaimed;
  if (updates.mecatolClaimedRound !== undefined) updateData.mecatol_claimed_round = updates.mecatolClaimedRound;
  if (updates.phaseStartedAt !== undefined) updateData.phase_started_at = updates.phaseStartedAt;

  console.log('🟢 Updating database with:', updateData);

  const { data, error } = await supabase
    .from('game_state')
    .update(updateData as any)
    .eq('game_id', gameId)
    .select()
    .single();

  if (error) {
    console.error('🔴 Failed to update game state:', error);
    throw new Error(`Failed to update game state: ${error.message}`);
  }

  console.log('🟢 Database updated successfully:', data);
  return toCamelCase(data);
}

// Update current phase
export async function updatePhase(gameId: string, phase: GamePhase) {
  return updateGameState(gameId, {
    currentPhase: phase,
    phaseStartedAt: new Date().toISOString(),
  });
}

// Update current round
export async function updateRound(gameId: string, round: number) {
  return updateGameState(gameId, {
    currentRound: round,
  });
}

// Set speaker
export async function setSpeaker(gameId: string, playerId: string) {
  return updateGameState(gameId, {
    speakerPlayerId: playerId,
  });
}

// Set current turn player
export async function setCurrentTurnPlayer(gameId: string, playerId: string | null) {
  return updateGameState(gameId, {
    currentTurnPlayerId: playerId,
  });
}

// Claim Mecatol Rex
export async function claimMecatolRex(gameId: string, round: number) {
  return updateGameState(gameId, {
    mecatolClaimed: true,
    mecatolClaimedRound: round,
  });
}

// Advance to next phase
export async function advancePhase(gameId: string, currentPhase: GamePhase): Promise<GameState> {
  const phaseOrder: GamePhase[] = ['setup', 'speaker-selection', 'strategy', 'action', 'status', 'agenda'];

  const currentIndex = phaseOrder.indexOf(currentPhase);
  let nextPhase: GamePhase;
  let shouldIncrementRound = false;

  if (currentIndex === -1 || currentIndex === phaseOrder.length - 1) {
    // If at end of phases, go back to strategy and increment round
    nextPhase = 'strategy';
    shouldIncrementRound = true;
  } else {
    nextPhase = phaseOrder[currentIndex + 1]!;
  }

  const currentState = await getGameState(gameId);
  if (!currentState) {
    throw new Error('Game state not found');
  }

  const updates: Partial<GameState> = {
    currentPhase: nextPhase,
    phaseStartedAt: new Date().toISOString(),
  };

  if (shouldIncrementRound) {
    updates.currentRound = currentState.currentRound + 1;
  }

  return updateGameState(gameId, updates);
}
