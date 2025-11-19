import type { StateCreator } from 'zustand';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Realtime slice state interface
export interface RealtimeSliceState {
  // Connection state
  isConnected: boolean;
  connectionError: string | null;

  // Active subscriptions
  gameChannel: RealtimeChannel | null;

  // Actions
  setConnected: (isConnected: boolean) => void;
  setConnectionError: (error: string | null) => void;
  setGameChannel: (channel: RealtimeChannel | null) => void;
  clearRealtime: () => void;
}

// Initial state
const initialState = {
  isConnected: false,
  connectionError: null,
  gameChannel: null,
};

// Create realtime slice
export const createRealtimeSlice: StateCreator<RealtimeSliceState> = (set) => ({
  ...initialState,

  setConnected: (isConnected) => set({ isConnected }),
  setConnectionError: (error) => set({ connectionError: error }),
  setGameChannel: (channel) => set({ gameChannel: channel }),
  clearRealtime: () => set(initialState),
});
