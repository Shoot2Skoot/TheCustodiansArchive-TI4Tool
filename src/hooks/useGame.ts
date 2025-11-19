import { useEffect, useState } from 'react';
import { useStore, selectCurrentGame, selectGameState, selectPlayers } from '../store';
import { getGameById, getGameByRoomCode } from '../lib/db/games';
import { getGameState } from '../lib/db/gameState';
import { getPlayersByGame } from '../lib/db/players';
import { subscribeToGame, unsubscribeFromGame } from '../lib/realtime';

/**
 * Hook to load and subscribe to a game by ID
 */
export function useGame(gameId: string | null) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const game = useStore(selectCurrentGame);
  const gameState = useStore(selectGameState);
  const players = useStore(selectPlayers);

  const setCurrentGame = useStore((state) => state.setCurrentGame);
  const setGameState = useStore((state) => state.setGameState);
  const setPlayers = useStore((state) => state.setPlayers);
  const setGameChannel = useStore((state) => state.setGameChannel);
  const clearGame = useStore((state) => state.clearGame);

  useEffect(() => {
    if (!gameId) {
      clearGame();
      return;
    }

    let channel: ReturnType<typeof subscribeToGame> | null = null;

    async function loadGame() {
      setIsLoading(true);
      setError(null);

      try {
        // Load game data
        const [gameData, gameStateData, playersData] = await Promise.all([
          getGameById(gameId!),
          getGameState(gameId!),
          getPlayersByGame(gameId!),
        ]);

        if (!gameData) {
          setError('Game not found');
          return;
        }

        // Update store
        setCurrentGame(gameData);
        setGameState(gameStateData);
        setPlayers(playersData);

        // Subscribe to real-time updates
        channel = subscribeToGame(gameId!);
        setGameChannel(channel);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load game');
      } finally {
        setIsLoading(false);
      }
    }

    loadGame();

    // Cleanup on unmount
    return () => {
      if (channel) {
        unsubscribeFromGame(channel);
      }
    };
  }, [gameId, setCurrentGame, setGameState, setPlayers, setGameChannel, clearGame]);

  return {
    game,
    gameState,
    players,
    isLoading,
    error,
  };
}

/**
 * Hook to join a game by room code
 */
export function useJoinGame() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setCurrentGame = useStore((state) => state.setCurrentGame);
  const setGameState = useStore((state) => state.setGameState);
  const setPlayers = useStore((state) => state.setPlayers);

  const joinGame = async (roomCode: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const game = await getGameByRoomCode(roomCode);

      if (!game) {
        setError('Game not found with that room code');
        return null;
      }

      // Load game data
      const [gameStateData, playersData] = await Promise.all([
        getGameState(game.id),
        getPlayersByGame(game.id),
      ]);

      // Update store
      setCurrentGame(game);
      setGameState(gameStateData);
      setPlayers(playersData);

      return game;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join game');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    joinGame,
    isLoading,
    error,
  };
}
