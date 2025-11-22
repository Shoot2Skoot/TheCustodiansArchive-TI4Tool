import type { StateCreator } from 'zustand';
import type {
  Game,
  GameState,
  StrategySelection,
  PlayerActionState,
  Objective,
  TechnologyUnlock,
  GameEvent,
  SpeakerHistory,
  TimerTracking,
} from '../../types';

// Game slice state interface
export interface GameSliceState {
  // Current game data
  currentGame: Game | null;
  gameState: GameState | null;
  strategySelections: StrategySelection[];
  playerActionStates: PlayerActionState[];
  objectives: Objective[];
  technologyUnlocks: TechnologyUnlock[];
  events: GameEvent[];
  speakerHistory: SpeakerHistory[];
  timerTracking: TimerTracking[];

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentGame: (game: Game | null) => void;
  setGameState: (gameState: GameState | null) => void;
  setStrategySelections: (selections: StrategySelection[]) => void;
  setPlayerActionStates: (states: PlayerActionState[]) => void;
  setObjectives: (objectives: Objective[]) => void;
  setTechnologyUnlocks: (unlocks: TechnologyUnlock[]) => void;
  setEvents: (events: GameEvent[]) => void;
  setSpeakerHistory: (history: SpeakerHistory[]) => void;
  setTimerTracking: (tracking: TimerTracking[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearGame: () => void;
}

// Initial state
const initialState = {
  currentGame: null,
  gameState: null,
  strategySelections: [],
  playerActionStates: [],
  objectives: [],
  technologyUnlocks: [],
  events: [],
  speakerHistory: [],
  timerTracking: [],
  isLoading: false,
  error: null,
};

// Create game slice
export const createGameSlice: StateCreator<GameSliceState> = (set) => ({
  ...initialState,

  setCurrentGame: (game) => set({ currentGame: game }),
  setGameState: (gameState) => {
    console.log('🔵 Store setGameState called with:', gameState);
    set({ gameState });
    console.log('🔵 Store gameState updated');
  },
  setStrategySelections: (selections) => set({ strategySelections: selections }),
  setPlayerActionStates: (states) => set({ playerActionStates: states }),
  setObjectives: (objectives) => set({ objectives }),
  setTechnologyUnlocks: (unlocks) => set({ technologyUnlocks: unlocks }),
  setEvents: (events) => set({ events }),
  setSpeakerHistory: (history) => set({ speakerHistory: history }),
  setTimerTracking: (tracking) => set({ timerTracking: tracking }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearGame: () => set(initialState),
});
