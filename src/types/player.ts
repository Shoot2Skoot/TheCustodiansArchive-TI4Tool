import type { PlayerColor } from './enums';
import type { StrategySelection, PlayerActionState, TechnologyUnlock } from './game';

// Database Model - Player
export interface Player {
  id: string;
  gameId: string;
  userId: string | null;
  position: number;
  color: PlayerColor;
  factionId: string;
  victoryPoints: number;
  displayName: string | null;
  createdAt: string;
  updatedAt: string;
  joinedAt: string | null;
}

// Extended Player (includes related data)
export interface PlayerExtended extends Player {
  strategyCard?: StrategySelection;
  actionState?: PlayerActionState;
  technologies: TechnologyUnlock[];
  isSpeaker: boolean;
  isCurrentTurn: boolean;
  totalTimeSeconds?: number;
}
