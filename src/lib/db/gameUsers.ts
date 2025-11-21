import { supabase } from '@/lib/supabase';

/**
 * Join a game using a room code
 * This calls the database function which handles all validation
 * @param roomCode - The room code to join
 * @returns The game ID if successful, null otherwise
 */
export async function joinGameByRoomCode(roomCode: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc('join_game_by_room_code', {
      room_code_input: roomCode.toUpperCase().trim(),
    });

    if (error) {
      console.error('Error joining game:', error);
      throw new Error(error.message);
    }

    return data;
  } catch (err) {
    console.error('Failed to join game:', err);
    return null;
  }
}

/**
 * Get all users in a game
 * @param gameId - The game ID
 * @returns Array of game_users records
 */
export async function getGameUsers(gameId: string) {
  const { data, error } = await supabase
    .from('game_users')
    .select('*')
    .eq('game_id', gameId)
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching game users:', error);
    return [];
  }

  return data;
}

/**
 * Leave a game
 * @param gameId - The game ID to leave
 * @returns true if successful
 */
export async function leaveGame(gameId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error('No authenticated user');
    return false;
  }

  const { error } = await supabase
    .from('game_users')
    .delete()
    .eq('game_id', gameId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error leaving game:', error);
    return false;
  }

  return true;
}

/**
 * Remove a user from a game (creator only)
 * @param gameId - The game ID
 * @param userId - The user ID to remove
 * @returns true if successful
 */
export async function removeUserFromGame(gameId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('game_users')
    .delete()
    .eq('game_id', gameId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error removing user from game:', error);
    return false;
  }

  return true;
}
