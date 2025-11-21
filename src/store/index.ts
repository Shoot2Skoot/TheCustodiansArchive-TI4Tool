import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createGameSlice, type GameSliceState } from './slices/gameSlice';
import { createPlayerSlice, type PlayerSliceState } from './slices/playerSlice';
import { createRealtimeSlice, type RealtimeSliceState } from './slices/realtimeSlice';
import { createUndoSlice, type UndoSliceState } from './slices/undoSlice';

// Combined store type
export type StoreState = GameSliceState & PlayerSliceState & RealtimeSliceState & UndoSliceState;

// Create the main store
export const useStore = create<StoreState>()(
  devtools(
    (...args) => ({
      ...createGameSlice(...args),
      ...createPlayerSlice(...args),
      ...createRealtimeSlice(...args),
      ...createUndoSlice(...args),
    }),
    {
      name: 'ti4-store',
    }
  )
);

// Selectors for better performance
export const selectCurrentGame = (state: StoreState) => state.currentGame;
export const selectGameState = (state: StoreState) => state.gameState;
export const selectPlayers = (state: StoreState) => state.players;
export const selectCurrentPlayerData = (state: StoreState) => state.currentPlayerData;
export const selectIsLoading = (state: StoreState) => state.isLoading;
export const selectError = (state: StoreState) => state.error;
export const selectIsConnected = (state: StoreState) => state.isConnected;
export const selectStrategySelections = (state: StoreState) => state.strategySelections;
export const selectPlayerActionStates = (state: StoreState) => state.playerActionStates;
export const selectObjectives = (state: StoreState) => state.objectives;

// Compound selectors
export const selectCurrentRound = (state: StoreState) => state.gameState?.currentRound ?? 0;
export const selectCurrentPhase = (state: StoreState) => state.gameState?.currentPhase ?? 'setup';
export const selectSpeaker = (state: StoreState) => {
  const speakerId = state.gameState?.speakerPlayerId;
  return state.players.find((p) => p.id === speakerId) ?? null;
};
export const selectCurrentTurnPlayer = (state: StoreState) => {
  const currentTurnPlayerId = state.gameState?.currentTurnPlayerId;
  return state.players.find((p) => p.id === currentTurnPlayerId) ?? null;
};
