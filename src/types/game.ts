import type { GameStatus, GamePhase } from './enums';

// Game Configuration
export interface GameConfig {
  playerCount: number;
  victoryPointLimit: number;
  timerEnabled: boolean;
  showObjectives: boolean;
  showTechnologies: boolean;
  showStrategyCards: boolean;

  // Expansion and Codex Configuration
  expansions?: {
    prophecyOfKings: boolean;
    codex1: boolean;  // Codex I - Ordinian (Omega promissory notes, faction techs)
    codex2: boolean;  // Codex II - Affinity (reference cards only)
    codex3: boolean;  // Codex III - Vigil (Omega leaders, Council Keleres)
    codex4: boolean;  // Codex IV - Liberation (relics, galactic events)
    codex45: boolean; // Codex 4.5 - Double Omega basic techs
  };
}

// Database Model - Game
export interface Game {
  id: string;
  roomCode: string;
  status: GameStatus;
  config: GameConfig;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  startedAt: string | null;
  endedAt: string | null;
  deletedAt: string | null;
}

// Database Model - Game State
export interface GameState {
  gameId: string;
  currentRound: number;
  currentPhase: GamePhase;
  currentTurnPlayerId: string | null;
  speakerPlayerId: string | null;
  mecatolClaimed: boolean;
  mecatolClaimedRound: number | null;
  mecatolRexOwnerId: string | null;
  lastActivityAt: string;
  phaseStartedAt: string | null;
  updatedAt: string;
  // Pause functionality
  isPaused: boolean;
  pausedAt: string | null;
  pausedByUserId: string | null;
}

// Database Model - Strategy Selection
export interface StrategySelection {
  id: string;
  gameId: string;
  roundNumber: number;
  playerId: string;
  strategyCardId: number;
  selectionOrder: number;
  tradeGoodBonus: number;
  primaryActionUsed: boolean;
  selectedAt: string;
}

// Database Model - Player Action State
export interface PlayerActionState {
  id: string;
  gameId: string;
  playerId: string;
  roundNumber: number;
  tacticalActionsCount: number;
  strategyCardUsed: boolean;
  hasPassed: boolean;
  passedAt: string | null;
}

// Database Model - Objective
export interface Objective {
  id: string;
  gameId: string;
  objectiveType: import('./enums').ObjectiveType;
  objectiveId: string | null;
  objectiveName: string;
  objectiveDescription: string | null;
  revealedRound: number;
  scoredByPlayers: string[];
  createdAt: string;
}

// Database Model - Technology Unlock
export interface TechnologyUnlock {
  id: string;
  gameId: string;
  playerId: string;
  technologyId: string;
  technologyType: import('./enums').TechnologyType;
  unlockedRound: number;
  isExhausted: boolean;
  unlockedAt: string;
}

// Database Model - Game Event
export interface GameEvent {
  id: string;
  gameId: string;
  eventType: import('./enums').EventType;
  eventData: Record<string, any>;
  roundNumber: number | null;
  phase: GamePhase | null;
  playerId: string | null;
  occurredAt: string;
  isUndone: boolean;
  undoneAt: string | null;
}

// Database Model - Speaker History
export interface SpeakerHistory {
  id: string;
  gameId: string;
  playerId: string;
  becameSpeakerRound: number;
  becameSpeakerVia: import('./enums').SpeakerSource;
  becameSpeakerAt: string;
}

// Database Model - Timer Tracking
export interface TimerTracking {
  id: string;
  gameId: string;
  playerId: string;
  totalTimeSeconds: number;
  turnStartedAt: string | null;
  isCurrentTurn: boolean;
  updatedAt: string;
}

// Database Model - Player Round Time
export interface PlayerRoundTime {
  id: string;
  gameId: string;
  playerId: string;
  roundNumber: number;
  timeSeconds: number;
  createdAt: string;
  updatedAt: string;
}

// Database Model - Leader Unlock
export interface LeaderUnlock {
  id: string;
  gameId: string;
  playerId: string;
  leaderType: 'commander' | 'hero';
  unlockedAt: string;
  unlockedRound: number;
}
