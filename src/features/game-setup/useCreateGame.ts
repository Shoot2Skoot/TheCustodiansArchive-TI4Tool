import { useState } from 'react';
import { createGame } from '@/lib/db/games';
import { createPlayer } from '@/lib/db/players';
import { initializeGameState } from '@/lib/db/gameState';
import { ensureAnonymousSession } from '@/lib/auth';
import { useStore } from '@/store';
import type { GameConfig } from '@/types';
import type { PlayerColor } from '@/types/enums';

interface PlayerSetup {
  position: number;
  color: PlayerColor | null;
  factionId: string | null;
  displayName: string;
}

interface CreateGameParams {
  config: Partial<GameConfig>;
  players: PlayerSetup[];
  speakerPosition: number;
}

export function useCreateGame() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setCurrentGame, setPlayers, setGameState } = useStore();

  const createNewGame = async ({ config, players, speakerPosition }: CreateGameParams) => {
    setIsCreating(true);
    setError(null);

    try {
      // Step 0: Ensure we have an anonymous session
      const session = await ensureAnonymousSession();
      const userId = session?.user?.id;

      if (!userId) {
        throw new Error('Failed to create session');
      }

      // Step 1: Create the game record
      const gameConfig: GameConfig = {
        playerCount: config.playerCount || 6,
        victoryPointLimit: config.victoryPointLimit || 10,
        timerEnabled: config.timerEnabled || false,
        timerMode: config.timerMode || 'per-turn',
        timerDurationMinutes: config.timerDurationMinutes || 5,
        showObjectives: config.showObjectives ?? true,
        showTechnologies: config.showTechnologies ?? true,
        showStrategyCards: config.showStrategyCards ?? true,
      };

      const game = await createGame(gameConfig, userId);

      if (!game) {
        throw new Error('Failed to create game');
      }

      // Step 2: Create all player records
      const createdPlayers = await Promise.all(
        players.map(async (player) => {
          if (!player.color || !player.factionId) {
            throw new Error(`Player ${player.position} is missing color or faction`);
          }

          return await createPlayer(
            game.id,
            player.position,
            player.color,
            player.factionId,
            player.displayName
          );
        })
      );

      // Filter out any null results
      const validPlayers = createdPlayers.filter((p) => p !== null);

      if (validPlayers.length !== players.length) {
        throw new Error('Failed to create all players');
      }

      // Step 3: Initialize game state with speaker
      const speakerPlayer = validPlayers.find((p) => p?.position === speakerPosition);

      if (!speakerPlayer) {
        throw new Error('Speaker player not found');
      }

      const gameState = await initializeGameState(game.id, speakerPlayer.id);

      if (!gameState) {
        throw new Error('Failed to initialize game state');
      }

      // Step 4: Update the store with the new game data
      setCurrentGame(game);
      setPlayers(validPlayers as any[]);
      setGameState(gameState);

      // Return the game ID for navigation
      return game.id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create game';
      setError(errorMessage);
      console.error('Error creating game:', err);
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createNewGame,
    isCreating,
    error,
  };
}
