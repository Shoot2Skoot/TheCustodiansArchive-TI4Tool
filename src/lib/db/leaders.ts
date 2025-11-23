import { supabase } from '../supabase';
import type { LeaderUnlock } from '@/types/game';

/**
 * Get all leader unlocks for a specific game
 */
export async function getLeaderUnlocks(gameId: string): Promise<LeaderUnlock[]> {
  const { data, error } = await supabase
    .from('leader_unlocks')
    .select('*')
    .eq('game_id', gameId)
    .order('unlocked_at', { ascending: true });

  if (error) {
    console.error('Error fetching leader unlocks:', error);
    throw error;
  }

  return (data || []).map(row => ({
    id: row.id,
    gameId: row.game_id,
    playerId: row.player_id,
    leaderType: row.leader_type,
    unlockedAt: row.unlocked_at,
    unlockedRound: row.unlocked_round,
  }));
}

/**
 * Get leader unlocks for a specific player in a game
 */
export async function getPlayerLeaderUnlocks(
  gameId: string,
  playerId: string
): Promise<LeaderUnlock[]> {
  const { data, error } = await supabase
    .from('leader_unlocks')
    .select('*')
    .eq('game_id', gameId)
    .eq('player_id', playerId)
    .order('unlocked_at', { ascending: true });

  if (error) {
    console.error('Error fetching player leader unlocks:', error);
    throw error;
  }

  return (data || []).map(row => ({
    id: row.id,
    gameId: row.game_id,
    playerId: row.player_id,
    leaderType: row.leader_type,
    unlockedAt: row.unlocked_at,
    unlockedRound: row.unlocked_round,
  }));
}

/**
 * Unlock a leader for a player
 */
export async function unlockLeader(
  gameId: string,
  playerId: string,
  leaderType: 'commander' | 'hero',
  roundNumber: number
): Promise<LeaderUnlock> {
  const { data, error } = await supabase
    .from('leader_unlocks')
    .insert({
      game_id: gameId,
      player_id: playerId,
      leader_type: leaderType,
      unlocked_round: roundNumber,
    })
    .select()
    .single();

  if (error) {
    console.error('Error unlocking leader:', error);
    throw error;
  }

  return {
    id: data.id,
    gameId: data.game_id,
    playerId: data.player_id,
    leaderType: data.leader_type,
    unlockedAt: data.unlocked_at,
    unlockedRound: data.unlocked_round,
  };
}

/**
 * Remove a leader unlock (for undo functionality)
 */
export async function removeLeaderUnlock(
  gameId: string,
  playerId: string,
  leaderType: 'commander' | 'hero'
): Promise<void> {
  const { error } = await supabase
    .from('leader_unlocks')
    .delete()
    .eq('game_id', gameId)
    .eq('player_id', playerId)
    .eq('leader_type', leaderType);

  if (error) {
    console.error('Error removing leader unlock:', error);
    throw error;
  }
}

/**
 * Check if a specific leader is unlocked for a player
 */
export async function isLeaderUnlocked(
  gameId: string,
  playerId: string,
  leaderType: 'commander' | 'hero'
): Promise<boolean> {
  const { data, error } = await supabase
    .from('leader_unlocks')
    .select('id')
    .eq('game_id', gameId)
    .eq('player_id', playerId)
    .eq('leader_type', leaderType)
    .maybeSingle();

  if (error) {
    console.error('Error checking leader unlock status:', error);
    throw error;
  }

  return data !== null;
}
