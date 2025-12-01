import { useState } from 'react';
import { createGame } from '@/lib/db/games';
import { createPlayer } from '@/lib/db/players';
import { initializeGameState } from '@/lib/db/gameState';
import { createInitialObjectives } from '@/lib/db/objectives';
import { initializeTimerTracking } from '@/lib/db/timers';
import { ensureAnonymousSession } from '@/lib/auth';
import { useStore } from '@/store';
import { supabase } from '@/lib/supabase';
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
  initialObjectives?: string[];
}

export function useCreateGame() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setCurrentGame, setPlayers, setGameState } = useStore();

  const createNewGame = async ({ config, players, speakerPosition, initialObjectives = [] }: CreateGameParams) => {
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
        timerEnabled: config.timerEnabled ?? true,
        showObjectives: config.showObjectives ?? true,
        showTechnologies: config.showTechnologies ?? true,
        showStrategyCards: config.showStrategyCards ?? true,
      };

      const game = await createGame(gameConfig, userId);

      if (!game) {
        throw new Error('Failed to create game');
      }

      // Step 1.5: Add creator to game_users table
      const { error: gameUserError } = await supabase
        .from('game_users')
        .insert({
          game_id: game.id,
          user_id: userId,
        } as any);

      if (gameUserError) {
        console.warn('Failed to add creator to game_users (may already exist):', gameUserError);
        // Don't throw - the migration may have already added them, or they might be added via trigger
      }

      // Step 2: Create all player records
      // Assign the creator to the first player (position 1)
      const createdPlayers = await Promise.all(
        players.map(async (player) => {
          if (!player.color || !player.factionId) {
            throw new Error(`Player ${player.position} is missing color or faction`);
          }

          // Assign creator's userId to the first player
          const playerUserId = player.position === 1 ? userId : undefined;

          return await createPlayer(
            game.id,
            player.position,
            player.color,
            player.factionId,
            player.displayName,
            playerUserId
          );
        })
      );

      // Filter out any null results
      const validPlayers = createdPlayers.filter((p) => p !== null);

      if (validPlayers.length !== players.length) {
        throw new Error('Failed to create all players');
      }

      // Step 2.5: Initialize timer tracking if enabled
      if (gameConfig.timerEnabled) {
        try {
          const playerIds = validPlayers.map(p => p!.id);
          await initializeTimerTracking(game.id, playerIds);
        } catch (timerError) {
          console.warn('Failed to initialize timer tracking:', timerError);
          // Don't throw - timers are not critical for game creation
        }
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

      // Step 3.5: Create initial objectives if provided
      if (initialObjectives.length > 0) {
        const objectivesCreated = await createInitialObjectives(game.id, initialObjectives);
        if (!objectivesCreated) {
          console.warn('Failed to create initial objectives');
          // Don't throw - this is not critical for game creation
        }
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
