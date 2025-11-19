import type { StateCreator } from 'zustand';
import type { Player } from '../../types';

// Player slice state interface
export interface PlayerSliceState {
  // Players in current game
  players: Player[];

  // Current user's player (if they've joined as a player)
  currentPlayerData: Player | null;

  // Actions
  setPlayers: (players: Player[]) => void;
  addPlayer: (player: Player) => void;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
  removePlayer: (playerId: string) => void;
  setCurrentPlayerData: (player: Player | null) => void;
  clearPlayers: () => void;
}

// Initial state
const initialState = {
  players: [],
  currentPlayerData: null,
};

// Create player slice
export const createPlayerSlice: StateCreator<PlayerSliceState> = (set) => ({
  ...initialState,

  setPlayers: (players) => set({ players }),

  addPlayer: (player) =>
    set((state) => ({
      players: [...state.players, player],
    })),

  updatePlayer: (playerId, updates) =>
    set((state) => ({
      players: state.players.map((p) => (p.id === playerId ? { ...p, ...updates } : p)),
    })),

  removePlayer: (playerId) =>
    set((state) => ({
      players: state.players.filter((p) => p.id !== playerId),
    })),

  setCurrentPlayerData: (player) => set({ currentPlayerData: player }),

  clearPlayers: () => set(initialState),
});
