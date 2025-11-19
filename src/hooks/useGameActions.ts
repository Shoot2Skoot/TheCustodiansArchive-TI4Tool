import { useState } from 'react';
import { useStore } from '../store';
import { updateGameState } from '../lib/db/gameState';
import { updatePlayer } from '../lib/db/players';
import type { GamePhase } from '../types';

/**
 * Hook for game actions (phase changes, VP updates, etc.)
 */
export function useGameActions() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gameState = useStore((state) => state.gameState);
  const setGameState = useStore((state) => state.setGameState);
  const updatePlayerState = useStore((state) => state.updatePlayer);

  // Change game phase
  const changePhase = async (phase: GamePhase) => {
    if (!gameState) return;

    setIsLoading(true);
    setError(null);

    try {
      const updated = await updateGameState(gameState.gameId, {
        currentPhase: phase,
        phaseStartedAt: new Date().toISOString(),
      });
      setGameState(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change phase');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Increment victory points
  const incrementVictoryPoints = async (playerId: string, currentVP: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const updated = await updatePlayer(playerId, {
        victoryPoints: currentVP + 1,
      });
      updatePlayerState(playerId, updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update victory points');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Decrement victory points
  const decrementVictoryPoints = async (playerId: string, currentVP: number) => {
    if (currentVP <= 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const updated = await updatePlayer(playerId, {
        victoryPoints: currentVP - 1,
      });
      updatePlayerState(playerId, updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update victory points');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Set current turn player
  const setCurrentTurnPlayer = async (playerId: string | null) => {
    if (!gameState) return;

    setIsLoading(true);
    setError(null);

    try {
      const updated = await updateGameState(gameState.gameId, {
        currentTurnPlayerId: playerId,
      });
      setGameState(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set current turn player');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Set speaker
  const setSpeaker = async (playerId: string) => {
    if (!gameState) return;

    setIsLoading(true);
    setError(null);

    try {
      const updated = await updateGameState(gameState.gameId, {
        speakerPlayerId: playerId,
      });
      setGameState(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set speaker');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    changePhase,
    incrementVictoryPoints,
    decrementVictoryPoints,
    setCurrentTurnPlayer,
    setSpeaker,
    isLoading,
    error,
  };
}
