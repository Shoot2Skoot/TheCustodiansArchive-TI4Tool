import { useState } from 'react';
import { joinGameByRoomCode } from '@/lib/db/gameUsers';
import { getGameById } from '@/lib/db/games';
import { getGameState } from '@/lib/db/gameState';
import { getPlayersByGame } from '@/lib/db/players';
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

      // Fetch the game details using db layer functions (which handle camelCase conversion)
      const game = await getGameById(gameId);
      if (!game) {
        throw new Error('Failed to fetch game details');
      }

      // Fetch all players
      const players = await getPlayersByGame(gameId);

      // Fetch game state
      const gameState = await getGameState(gameId);
      if (!gameState) {
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
