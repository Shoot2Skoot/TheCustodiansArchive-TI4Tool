import { useEffect, useState } from 'react';
import { useStore } from '@/store';
import { getGameById } from '@/lib/db/games';
import { getGameState } from '@/lib/db/gameState';
import { getPlayersByGame } from '@/lib/db/players';
import { getAllStrategySelections } from '@/lib/db/strategySelections';

export function useLoadGame(gameId: string | undefined) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    setCurrentGame,
    setGameState,
    setPlayers,
    setStrategySelections,
    currentGame,
  } = useStore();

  useEffect(() => {
    if (!gameId) {
      setIsLoading(false);
      setError('No game ID provided');
      return;
    }

    // Skip if we already have this game loaded
    if (currentGame?.id === gameId) {
      setIsLoading(false);
      return;
    }

    async function loadGameData() {
      if (!gameId) return; // Type guard for async function
      try {
        setIsLoading(true);
        setError(null);

        // Load game, game state, and players in parallel
        const [game, gameState, players] = await Promise.all([
          getGameById(gameId),
          getGameState(gameId),
          getPlayersByGame(gameId),
        ]);

        if (!game) {
          throw new Error('Game not found');
        }

        if (!gameState) {
          throw new Error('Game state not found');
        }

        // Load all strategy selections for all rounds
        const strategySelections = await getAllStrategySelections(gameId);

        // Update store
        setCurrentGame(game);
        setGameState(gameState);
        setPlayers(players);
        setStrategySelections(strategySelections);

        setIsLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load game';
        setError(errorMessage);
        setIsLoading(false);
        console.error('Error loading game:', err);
      }
    }

    loadGameData();
  }, [gameId, currentGame?.id, setCurrentGame, setGameState, setPlayers, setStrategySelections]);

  return { isLoading, error };
}
