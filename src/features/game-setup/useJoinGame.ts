import { useState } from 'react';
import { joinGameByRoomCode } from '@/lib/db/gameUsers';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store';

export function useJoinGame() {
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setCurrentGame, setPlayers, setGameState } = useStore();

  const joinGame = async (roomCode: string) => {
    setIsJoining(true);
    setError(null);

    try {
      // Join the game (this adds user to game_users table)
      const gameId = await joinGameByRoomCode(roomCode);

      if (!gameId) {
        throw new Error('Failed to join game');
      }

      // Fetch the game details
      const { data: game, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();

      if (gameError || !game) {
        throw new Error('Failed to fetch game details');
      }

      // Fetch all players
      const { data: players, error: playersError } = await supabase
        .from('players')
        .select('*')
        .eq('game_id', gameId)
        .order('position');

      if (playersError) {
        throw new Error('Failed to fetch players');
      }

      // Fetch game state
      const { data: gameState, error: gameStateError } = await supabase
        .from('game_state')
        .select('*')
        .eq('game_id', gameId)
        .single();

      if (gameStateError) {
        throw new Error('Failed to fetch game state');
      }

      // Update the store
      setCurrentGame(game);
      setPlayers(players || []);
      setGameState(gameState);

      return gameId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join game';
      setError(errorMessage);
      console.error('Error joining game:', err);
      return null;
    } finally {
      setIsJoining(false);
    }
  };

  return {
    joinGame,
    isJoining,
    error,
  };
}
