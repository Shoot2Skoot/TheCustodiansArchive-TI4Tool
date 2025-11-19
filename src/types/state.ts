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
} from './game';
import type { Player } from './player';

// Full Game State (combines all tables for frontend)
export interface FullGameState {
  game: Game;
  gameState: GameState;
  players: Player[];
  strategySelections: StrategySelection[];
  playerActionStates: PlayerActionState[];
  objectives: Objective[];
  technologyUnlocks: TechnologyUnlock[];
  events: GameEvent[];
  speakerHistory: SpeakerHistory[];
  timerTracking: TimerTracking[];
}

// Strategy Card with State
export interface StrategyCard {
  id: number;
  name: string;
  primaryAction: string;
  secondaryAction: string;
  available: boolean;
  tradeGoodBonus: number;
  assignedTo?: string; // Player ID
  primaryActionUsed?: boolean;
}
