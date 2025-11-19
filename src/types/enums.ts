// Enums and Type Definitions

export type GameStatus = 'setup' | 'in-progress' | 'completed' | 'abandoned';

export type GamePhase =
  | 'setup'
  | 'speaker-selection'
  | 'strategy'
  | 'action'
  | 'status'
  | 'agenda'
  | 'end-game';

export type PlayerColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'black' | 'orange' | 'pink';

export type ObjectiveType = 'public-stage-1' | 'public-stage-2' | 'secret';

export type TechnologyType = 'biotic' | 'warfare' | 'propulsion' | 'cybernetic';

export type EventType =
  | 'phase-change'
  | 'strategy-card-selected'
  | 'vp-change'
  | 'speaker-change'
  | 'player-action'
  | 'objective-scored'
  | 'technology-unlocked'
  | 'player-passed';

export type SpeakerSource = 'initial' | 'politics-card' | 'manual-change';

export type TimerMode = 'per-turn' | 'cumulative';
