import type { StateCreator } from 'zustand';
import type { StrategySelection } from '../../types';

// Player action state for action phase
export interface PlayerActionState {
  playerId: string;
  strategyCardUsed: boolean;
  strategyCardUsedOnTurn?: number;
  hasPassed: boolean;
  tacticalActionsCount: number;
  componentActionsCount: number;
}

// Action phase state snapshot
export interface ActionPhaseState {
  currentTurnPlayerId: string;
  playerActionStates: PlayerActionState[];
  speakerPlayerId: string | null;
}

// History entry for undoable actions
interface StrategySelectionEntry {
  type: 'strategySelection';
  data: StrategySelection[];
  userId: string;
  timestamp: number;
}

interface ActionPhaseActionEntry {
  type: 'actionPhaseAction';
  actionType: 'tactical' | 'component';
  data: ActionPhaseState;
  userId: string;
  timestamp: number;
}

interface StrategyCardActionEntry {
  type: 'strategyCardAction';
  strategyCardId: number;
  data: ActionPhaseState;
  userId: string;
  timestamp: number;
}

interface PassActionEntry {
  type: 'passAction';
  data: ActionPhaseState;
  userId: string;
  timestamp: number;
}

interface SpeakerChangeEntry {
  type: 'speakerChange';
  newSpeakerId: string;
  data: ActionPhaseState;
  userId: string;
  timestamp: number;
}

interface ObjectiveToggleEntry {
  type: 'objectiveToggle';
  objectiveId: string;
  playerId: string;
  wasScored: boolean; // State before the toggle
  userId: string;
  timestamp: number;
}

interface MecatolRexClaimEntry {
  type: 'mecatolRexClaim';
  newOwnerId: string;
  previousOwnerId: string | null;
  wasClaimed: boolean; // Was Mecatol Rex claimed before this action?
  userId: string;
  timestamp: number;
}

type HistoryEntry =
  | StrategySelectionEntry
  | ActionPhaseActionEntry
  | StrategyCardActionEntry
  | PassActionEntry
  | SpeakerChangeEntry
  | ObjectiveToggleEntry
  | MecatolRexClaimEntry;

// Undo slice state interface
export interface UndoSliceState {
  // History stacks
  undoStack: HistoryEntry[];
  redoStack: HistoryEntry[];

  // Reload triggers
  objectivesReloadCounter: number;

  // Actions
  pushHistory: (entry: HistoryEntry) => void;
  undo: () => HistoryEntry | null;
  redo: () => HistoryEntry | null;
  clearHistory: () => void;
  canUndo: (currentUserId: string, isHost: boolean) => boolean;
  canRedo: () => boolean;
  triggerObjectivesReload: () => void;
}

// Create undo slice
export const createUndoSlice: StateCreator<UndoSliceState> = (set, get) => ({
  undoStack: [],
  redoStack: [],
  objectivesReloadCounter: 0,

  pushHistory: (entry) =>
    set((state) => ({
      undoStack: [...state.undoStack, entry],
      redoStack: [], // Clear redo stack when new action is performed
    })),

  undo: () => {
    const state = get();
    if (state.undoStack.length === 0) return null;

    const entry = state.undoStack[state.undoStack.length - 1];
    if (!entry) return null;

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
    if (!entry) return null;

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
    if (!lastEntry) return false;

    return lastEntry.userId === currentUserId;
  },

  canRedo: () => get().redoStack.length > 0,

  triggerObjectivesReload: () =>
    set((state) => ({
      objectivesReloadCounter: state.objectivesReloadCounter + 1,
    })),
});
