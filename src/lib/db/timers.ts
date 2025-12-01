import { supabase } from '../supabase';
import type { TimerTracking, PlayerRoundTime } from '@/types';

/**
 * Initialize timer tracking for all players in a game
 * Called when a game starts
 */
export async function initializeTimerTracking(
  gameId: string,
  playerIds: string[]
): Promise<void> {
  const timerRecords = playerIds.map((playerId) => ({
    game_id: gameId,
    player_id: playerId,
    total_time_seconds: 0,
    is_current_turn: false,
    turn_started_at: null,
  }));

  const { error } = await supabase
    .from('timer_tracking')
    .insert(timerRecords);

  if (error) {
    console.error('Error initializing timer tracking:', error);
    throw error;
  }
}

/**
 * Start a player's turn - sets is_current_turn and records start time
 * Also ends any other player's active turn in the same game
 */
export async function startPlayerTurn(
  gameId: string,
  playerId: string
): Promise<void> {
  const now = new Date().toISOString();

  // First, end all other active turns in this game
  const { error: endError } = await supabase
    .from('timer_tracking')
    .update({
      is_current_turn: false,
      turn_started_at: null,
    })
    .eq('game_id', gameId)
    .eq('is_current_turn', true);

  if (endError) {
    console.error('Error ending other turns:', endError);
    // Don't throw - game might not have timer tracking enabled
    return;
  }

  // Start this player's turn
  const { error: startError } = await supabase
    .from('timer_tracking')
    .update({
      is_current_turn: true,
      turn_started_at: now,
    })
    .eq('game_id', gameId)
    .eq('player_id', playerId);

  if (startError) {
    console.error('Error starting player turn:', startError);
    // Don't throw - game might not have timer tracking enabled
    return;
  }
}

/**
 * End a player's turn - calculates elapsed time and adds to round time
 * Updates total time in timer_tracking
 */
export async function endPlayerTurn(
  gameId: string,
  playerId: string,
  roundNumber: number
): Promise<void> {
  // Get current timer tracking record
  const { data: timerData, error: fetchError } = await supabase
    .from('timer_tracking')
    .select('*')
    .eq('game_id', gameId)
    .eq('player_id', playerId)
    .maybeSingle();

  if (fetchError) {
    console.error('Error fetching timer data:', fetchError);
    // Don't throw - game might not have timer tracking enabled
    return;
  }

  if (!timerData) {
    // No timer tracking record exists - game doesn't have timers enabled
    return;
  }

  // Calculate elapsed time if turn was started
  let elapsedSeconds = 0;
  if (timerData.turn_started_at) {
    const startTime = new Date(timerData.turn_started_at);
    const endTime = new Date();
    elapsedSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
  }

  // Get existing round time if it exists
  const { data: existingRoundTime } = await supabase
    .from('player_round_times')
    .select('time_seconds')
    .eq('game_id', gameId)
    .eq('player_id', playerId)
    .eq('round_number', roundNumber)
    .maybeSingle();

  // Add to existing round time or start fresh
  const newRoundTime = (existingRoundTime?.time_seconds || 0) + elapsedSeconds;

  // Update or insert round time with accumulated time
  const { error: roundTimeError } = await supabase
    .from('player_round_times')
    .upsert(
      {
        game_id: gameId,
        player_id: playerId,
        round_number: roundNumber,
        time_seconds: newRoundTime,
      },
      {
        onConflict: 'game_id,player_id,round_number',
      }
    );

  if (roundTimeError) {
    console.error('Error saving round time:', roundTimeError);
    throw roundTimeError;
  }

  // Update total time and reset current turn
  const newTotalTime = timerData.total_time_seconds + elapsedSeconds;
  const { error: updateError } = await supabase
    .from('timer_tracking')
    .update({
      total_time_seconds: newTotalTime,
      is_current_turn: false,
      turn_started_at: null,
    })
    .eq('game_id', gameId)
    .eq('player_id', playerId);

  if (updateError) {
    console.error('Error updating timer tracking:', updateError);
    throw updateError;
  }
}

/**
 * Pause the game - stops all active timers
 */
export async function pauseGame(
  gameId: string,
  userId: string
): Promise<void> {
  const now = new Date().toISOString();

  // Get all active timers
  const { data: activeTimers, error: fetchError } = await supabase
    .from('timer_tracking')
    .select('*')
    .eq('game_id', gameId)
    .eq('is_current_turn', true);

  if (fetchError) {
    console.error('Error fetching active timers:', fetchError);
    throw fetchError;
  }

  // Calculate and save elapsed time for any active turns
  if (activeTimers && activeTimers.length > 0) {
    for (const timer of activeTimers) {
      if (timer.turn_started_at) {
        const startTime = new Date(timer.turn_started_at);
        const pauseTime = new Date();
        const elapsedSeconds = Math.floor((pauseTime.getTime() - startTime.getTime()) / 1000);

        // Update total time but keep is_current_turn true (we'll resume later)
        await supabase
          .from('timer_tracking')
          .update({
            total_time_seconds: timer.total_time_seconds + elapsedSeconds,
            turn_started_at: null, // Clear start time while paused
          })
          .eq('id', timer.id);
      }
    }
  }

  // Update game_state to mark as paused
  const { error: pauseError } = await supabase
    .from('game_state')
    .update({
      is_paused: true,
      paused_at: now,
      paused_by_user_id: userId,
    })
    .eq('game_id', gameId);

  if (pauseError) {
    console.error('Error pausing game:', pauseError);
    throw pauseError;
  }
}

/**
 * Resume the game - restarts any active timers
 */
export async function resumeGame(gameId: string): Promise<void> {
  const now = new Date().toISOString();

  // Get current turn player to restart their timer
  const { data: gameState, error: fetchError } = await supabase
    .from('game_state')
    .select('current_turn_player_id, is_paused')
    .eq('game_id', gameId)
    .single();

  if (fetchError) {
    console.error('Error fetching game state:', fetchError);
    throw fetchError;
  }

  if (!gameState?.is_paused) {
    // Already resumed, nothing to do
    return;
  }

  // Update game_state to mark as unpaused
  const { error: resumeError } = await supabase
    .from('game_state')
    .update({
      is_paused: false,
      paused_at: null,
      paused_by_user_id: null,
    })
    .eq('game_id', gameId);

  if (resumeError) {
    console.error('Error resuming game:', resumeError);
    throw resumeError;
  }

  // If there's an active player, restart their timer
  if (gameState.current_turn_player_id) {
    const { error: restartError } = await supabase
      .from('timer_tracking')
      .update({
        turn_started_at: now,
      })
      .eq('game_id', gameId)
      .eq('player_id', gameState.current_turn_player_id)
      .eq('is_current_turn', true);

    if (restartError) {
      console.error('Error restarting timer:', restartError);
      throw restartError;
    }
  }
}

/**
 * Get all timer tracking data for a game
 */
export async function getTimerTracking(
  gameId: string
): Promise<TimerTracking[]> {
  const { data, error } = await supabase
    .from('timer_tracking')
    .select('*')
    .eq('game_id', gameId)
    .order('total_time_seconds', { ascending: false });

  if (error) {
    console.error('Error fetching timer tracking:', error);
    throw error;
  }

  return data.map((row) => ({
    id: row.id,
    gameId: row.game_id,
    playerId: row.player_id,
    totalTimeSeconds: row.total_time_seconds,
    turnStartedAt: row.turn_started_at,
    isCurrentTurn: row.is_current_turn,
    updatedAt: row.updated_at,
  }));
}

/**
 * Get a specific player's timer data
 */
export async function getPlayerTimerData(
  gameId: string,
  playerId: string
): Promise<TimerTracking | null> {
  const { data, error } = await supabase
    .from('timer_tracking')
    .select('*')
    .eq('game_id', gameId)
    .eq('player_id', playerId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching player timer data:', error);
    // Return null instead of throwing - game might not have timers enabled
    return null;
  }

  if (!data) {
    // No timer tracking record exists for this player/game
    return null;
  }

  return {
    id: data.id,
    gameId: data.game_id,
    playerId: data.player_id,
    totalTimeSeconds: data.total_time_seconds,
    turnStartedAt: data.turn_started_at,
    isCurrentTurn: data.is_current_turn,
    updatedAt: data.updated_at,
  };
}

/**
 * Get all round times for a player
 */
export async function getPlayerRoundTimes(
  gameId: string,
  playerId: string
): Promise<PlayerRoundTime[]> {
  const { data, error } = await supabase
    .from('player_round_times')
    .select('*')
    .eq('game_id', gameId)
    .eq('player_id', playerId)
    .order('round_number', { ascending: true });

  if (error) {
    console.error('Error fetching player round times:', error);
    throw error;
  }

  return data.map((row) => ({
    id: row.id,
    gameId: row.game_id,
    playerId: row.player_id,
    roundNumber: row.round_number,
    timeSeconds: row.time_seconds,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

/**
 * Get the current round time for a specific player
 * Returns 0 if no round time exists yet
 */
export async function getPlayerCurrentRoundTime(
  gameId: string,
  playerId: string,
  roundNumber: number
): Promise<number> {
  const { data, error } = await supabase
    .from('player_round_times')
    .select('time_seconds')
    .eq('game_id', gameId)
    .eq('player_id', playerId)
    .eq('round_number', roundNumber)
    .maybeSingle();

  if (error) {
    console.error('Error fetching player current round time:', error);
    return 0;
  }

  return data?.time_seconds || 0;
}

/**
 * Get all round times for a specific round across all players
 */
export async function getRoundTimes(
  gameId: string,
  roundNumber: number
): Promise<PlayerRoundTime[]> {
  const { data, error } = await supabase
    .from('player_round_times')
    .select('*')
    .eq('game_id', gameId)
    .eq('round_number', roundNumber)
    .order('time_seconds', { ascending: false });

  if (error) {
    console.error('Error fetching round times:', error);
    throw error;
  }

  return data.map((row) => ({
    id: row.id,
    gameId: row.game_id,
    playerId: row.player_id,
    roundNumber: row.round_number,
    timeSeconds: row.time_seconds,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

/**
 * Get current elapsed time for active timer (without saving)
 * Returns seconds elapsed since turn_started_at
 */
export function getCurrentElapsedTime(timerData: TimerTracking): number {
  if (!timerData.turnStartedAt || !timerData.isCurrentTurn) {
    return 0;
  }

  const startTime = new Date(timerData.turnStartedAt);
  const now = new Date();
  return Math.floor((now.getTime() - startTime.getTime()) / 1000);
}

/**
 * Format seconds to MM:SS or HH:MM:SS
 */
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}
