import type { StateCreator } from 'zustand';
import type { StrategySelection } from '../../types';

// History entry for undoable actions
interface HistoryEntry {
  type: 'strategySelection';
  data: StrategySelection[];
  userId: string; // Track who made this action
  timestamp: number;
}

// Undo slice state interface
export interface UndoSliceState {
  // History stacks
  undoStack: HistoryEntry[];
  redoStack: HistoryEntry[];

  // Actions
  pushHistory: (entry: HistoryEntry) => void;
  undo: () => HistoryEntry | null;
  redo: () => HistoryEntry | null;
  clearHistory: () => void;
  canUndo: (currentUserId: string, isHost: boolean) => boolean;
  canRedo: () => boolean;
}

// Create undo slice
export const createUndoSlice: StateCreator<UndoSliceState> = (set, get) => ({
  undoStack: [],
  redoStack: [],

  pushHistory: (entry) =>
    set((state) => ({
      undoStack: [...state.undoStack, entry],
      redoStack: [], // Clear redo stack when new action is performed
    })),

  undo: () => {
    const state = get();
    if (state.undoStack.length === 0) return null;

    const entry = state.undoStack[state.undoStack.length - 1];
    set({
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, entry],
    });

    return entry;
  },

  redo: () => {
    const state = get();
    if (state.redoStack.length === 0) return null;

    const entry = state.redoStack[state.redoStack.length - 1];
    set({
      redoStack: state.redoStack.slice(0, -1),
      undoStack: [...state.undoStack, entry],
    });

    return entry;
  },

  clearHistory: () =>
    set({
      undoStack: [],
      redoStack: [],
    }),

  canUndo: (currentUserId, isHost) => {
    const state = get();
    if (state.undoStack.length === 0) return false;

    // Host can undo anything
    if (isHost) return true;

    // Non-host can only undo if the most recent action is theirs
    const lastEntry = state.undoStack[state.undoStack.length - 1];
    return lastEntry.userId === currentUserId;
  },

  canRedo: () => get().redoStack.length > 0,
});
