# Data Models and Database Schema

## Table of Contents
- [Overview](#overview)
- [Database Tables](#database-tables)
  - [Core Tables](#core-tables)
  - [Game State Tables](#game-state-tables)
  - [Tracking Tables](#tracking-tables)
- [Relationships](#relationships)
- [Indexes](#indexes)
- [Row Level Security](#row-level-security)
- [TypeScript Interfaces](#typescript-interfaces)
- [Enums and Constants](#enums-and-constants)

---

## Overview

The database uses PostgreSQL via Supabase. The schema is designed for:
- **Real-time synchronization** via Supabase Realtime
- **Row-level security** to ensure players can only access their games
- **Efficient queries** with appropriate indexes
- **Flexible state tracking** using JSON columns where needed
- **Audit trail** with timestamps and event logging

### Design Principles

1. **Normalization**: Related data is split across tables to reduce redundancy
2. **Denormalization**: Current game state is denormalized for fast reads
3. **JSON Fields**: Used for flexible, nested data (e.g., configuration options)
4. **Timestamps**: All tables include `created_at` and `updated_at`
5. **Soft Deletes**: Games can be marked as deleted rather than hard-deleted

---

## Database Tables

### Core Tables

#### `games`

Stores game instances and metadata.

```sql
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_code VARCHAR(10) UNIQUE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'setup',
    -- 'setup', 'in-progress', 'completed', 'abandoned'

  -- Configuration (JSON for flexibility)
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
    -- Example:
    -- {
    --   "playerCount": 6,
    --   "vpLimit": 10,
    --   "showVPMeter": true,
    --   "fullscreen": false,
    --   "inactivityTimerMinutes": 15,
    --   "timerMode": "per-turn",
    --   "decisionBarEnabled": false,
    --   "decisionBarSeconds": 90,
    --   "detailedAgendaMode": true
    -- }

  -- Ownership
  created_by UUID REFERENCES auth.users(id),
    -- Can be null for anonymous host

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,

  -- Soft delete
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_games_room_code ON games(room_code);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_created_by ON games(created_by);
```

**Fields**:
- `id`: Unique game identifier
- `room_code`: Human-readable code for joining (e.g., "ALPHA7")
- `status`: Current game status (setup, in-progress, completed, abandoned)
- `config`: Game configuration (JSON object with all settings)
- `created_by`: User who created the game (nullable for anonymous)
- `created_at`, `updated_at`: Standard timestamps
- `started_at`: When Round 1 began
- `ended_at`: When game ended
- `deleted_at`: Soft delete timestamp

---

#### `players`

Stores players in each game.

```sql
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
    -- Can be null if player hasn't joined yet or is guest

  -- Player Configuration
  position INTEGER NOT NULL CHECK (position >= 1 AND position <= 8),
    -- Table order position (1-8)
  color VARCHAR(20) NOT NULL,
    -- 'red', 'blue', 'green', 'yellow', 'purple', 'black', 'orange', 'pink'
  faction_id VARCHAR(50) NOT NULL,
    -- Faction identifier (e.g., 'arborec', 'hacan', etc.)

  -- Player State
  victory_points INTEGER NOT NULL DEFAULT 0,

  -- Display
  display_name VARCHAR(100),
    -- Optional custom name, defaults to faction name

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
    -- When user claimed this player slot

  -- Constraints
  UNIQUE(game_id, position),
  UNIQUE(game_id, color),
  UNIQUE(game_id, faction_id)
);

-- Indexes
CREATE INDEX idx_players_game_id ON players(game_id);
CREATE INDEX idx_players_user_id ON players(user_id);
CREATE INDEX idx_players_position ON players(game_id, position);
```

**Fields**:
- `id`: Unique player identifier
- `game_id`: Reference to game
- `user_id`: Reference to user (nullable if not claimed)
- `position`: Table order (1-8), determines turn order
- `color`: Player color
- `faction_id`: Faction identifier
- `victory_points`: Current VP count
- `display_name`: Optional custom name
- `joined_at`: When user joined as this player

**Constraints**:
- Each game can have only one player at each position
- Each game can have only one player with each color
- Each game can have only one player with each faction

---

### Game State Tables

#### `game_state`

Stores current game state. One row per game, updated frequently.

```sql
CREATE TABLE game_state (
  game_id UUID PRIMARY KEY REFERENCES games(id) ON DELETE CASCADE,

  -- Round and Phase
  current_round INTEGER NOT NULL DEFAULT 0,
    -- 0 for setup phase, 1+ for actual rounds
  current_phase VARCHAR(30) NOT NULL DEFAULT 'setup',
    -- 'setup', 'speaker-selection', 'strategy', 'action', 'status', 'agenda', 'end-game'

  -- Current Turn
  current_turn_player_id UUID REFERENCES players(id),
    -- Player whose turn it is (relevant in action phase)

  -- Speaker
  speaker_player_id UUID REFERENCES players(id),

  -- Mecatol Rex
  mecatol_claimed BOOLEAN NOT NULL DEFAULT false,
  mecatol_claimed_round INTEGER,

  -- Timestamps
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- For inactivity timer
  phase_started_at TIMESTAMPTZ,
    -- When current phase started

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index
CREATE INDEX idx_game_state_phase ON game_state(current_phase);
```

**Fields**:
- `game_id`: Reference to game (primary key, 1:1 relationship)
- `current_round`: Current round number
- `current_phase`: Current game phase
- `current_turn_player_id`: Player whose turn it is
- `speaker_player_id`: Current speaker
- `mecatol_claimed`: Whether Mecatol Rex has been claimed
- `mecatol_claimed_round`: Round when Mecatol was claimed
- `last_activity_at`: For tracking inactivity
- `phase_started_at`: When current phase began

---

#### `strategy_selections`

Tracks strategy card selections per round.

```sql
CREATE TABLE strategy_selections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,

  -- Selection Details
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  strategy_card_id INTEGER NOT NULL CHECK (strategy_card_id >= 1 AND strategy_card_id <= 8),
    -- 1-8 for the 8 strategy cards
  selection_order INTEGER NOT NULL,
    -- Order in which cards were picked (1 = first, etc.)
  trade_good_bonus INTEGER NOT NULL DEFAULT 0,
    -- Trade goods gained from unpicked bonus

  -- Strategy Card Usage
  primary_action_used BOOLEAN NOT NULL DEFAULT false,

  -- Timestamps
  selected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  UNIQUE(game_id, round_number, strategy_card_id),
  UNIQUE(game_id, round_number, player_id)
);

-- Indexes
CREATE INDEX idx_strategy_selections_game_round ON strategy_selections(game_id, round_number);
CREATE INDEX idx_strategy_selections_player ON strategy_selections(player_id);
```

**Fields**:
- `game_id`: Reference to game
- `round_number`: Which round this selection is for
- `player_id`: Player who selected the card
- `strategy_card_id`: Which card (1-8)
- `selection_order`: Order of selection
- `trade_good_bonus`: Bonus trade goods received
- `primary_action_used`: Whether primary action has been used
- `selected_at`: When card was selected

**Constraints**:
- Each strategy card can only be selected once per round
- Each player can only select one strategy card per round

---

#### `player_action_state`

Tracks player actions during the action phase.

```sql
CREATE TABLE player_action_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,

  -- Action Tracking
  tactical_actions_count INTEGER NOT NULL DEFAULT 0,
    -- Number of tactical/component actions taken
  strategy_card_used BOOLEAN NOT NULL DEFAULT false,
  has_passed BOOLEAN NOT NULL DEFAULT false,

  -- Timestamps
  passed_at TIMESTAMPTZ,

  -- Constraints
  UNIQUE(game_id, player_id, round_number)
);

-- Index
CREATE INDEX idx_player_action_state_game_round ON player_action_state(game_id, round_number);
```

**Fields**:
- `game_id`: Reference to game
- `player_id`: Reference to player
- `round_number`: Current round
- `tactical_actions_count`: Number of tactical actions taken
- `strategy_card_used`: Whether strategy card primary action used
- `has_passed`: Whether player has passed
- `passed_at`: When player passed

---

### Tracking Tables

#### `objectives`

Tracks objectives in play and who has scored them.

```sql
CREATE TABLE objectives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,

  -- Objective Details
  objective_type VARCHAR(20) NOT NULL,
    -- 'public-stage-1', 'public-stage-2', 'secret'
  objective_id VARCHAR(50),
    -- Identifier for predefined objectives (nullable for custom objectives)
  objective_name VARCHAR(200) NOT NULL,
  objective_description TEXT,

  -- When Revealed
  revealed_round INTEGER NOT NULL,

  -- Who Scored
  scored_by_players UUID[] DEFAULT '{}',
    -- Array of player IDs who have scored this

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_objectives_game_id ON objectives(game_id);
CREATE INDEX idx_objectives_type ON objectives(game_id, objective_type);
```

**Fields**:
- `game_id`: Reference to game
- `objective_type`: Type of objective
- `objective_id`: Predefined objective identifier
- `objective_name`: Objective name
- `objective_description`: Objective text
- `revealed_round`: Round when revealed
- `scored_by_players`: Array of player IDs who scored this

---

#### `technology_unlocks`

Tracks technologies unlocked by each player.

```sql
CREATE TABLE technology_unlocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,

  -- Technology Details
  technology_id VARCHAR(50) NOT NULL,
    -- Technology identifier (e.g., 'plasma-scoring', 'graviton-laser-system')
  technology_type VARCHAR(20) NOT NULL,
    -- 'biotic', 'warfare', 'propulsion', 'cybernetic'

  -- When Unlocked
  unlocked_round INTEGER NOT NULL,

  -- Exhausted State
  is_exhausted BOOLEAN NOT NULL DEFAULT false,
    -- Some technologies exhaust when used

  -- Timestamps
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  UNIQUE(game_id, player_id, technology_id)
);

-- Indexes
CREATE INDEX idx_technology_unlocks_game_player ON technology_unlocks(game_id, player_id);
CREATE INDEX idx_technology_unlocks_type ON technology_unlocks(player_id, technology_type);
```

**Fields**:
- `game_id`: Reference to game
- `player_id`: Player who unlocked the tech
- `technology_id`: Technology identifier
- `technology_type`: Tech category
- `unlocked_round`: Round when unlocked
- `is_exhausted`: Exhaustion state
- `unlocked_at`: Timestamp

---

#### `game_events`

Event log for game history and undo functionality.

```sql
CREATE TABLE game_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,

  -- Event Details
  event_type VARCHAR(50) NOT NULL,
    -- 'phase-change', 'strategy-card-selected', 'vp-change',
    -- 'speaker-change', 'player-action', 'objective-scored', etc.
  event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    -- Flexible data for each event type

  -- Context
  round_number INTEGER,
  phase VARCHAR(30),
  player_id UUID REFERENCES players(id),
    -- Player who triggered the event (if applicable)

  -- Timestamps
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Undo Support
  is_undone BOOLEAN NOT NULL DEFAULT false,
  undone_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_game_events_game_id ON game_events(game_id, occurred_at DESC);
CREATE INDEX idx_game_events_type ON game_events(game_id, event_type);
CREATE INDEX idx_game_events_player ON game_events(player_id);
```

**Fields**:
- `game_id`: Reference to game
- `event_type`: Type of event
- `event_data`: JSON data for event details
- `round_number`: Round when event occurred
- `phase`: Phase when event occurred
- `player_id`: Player who triggered event
- `occurred_at`: When event happened
- `is_undone`: Whether this event has been undone
- `undone_at`: When it was undone

**Example Event Data**:
```json
{
  "event_type": "strategy-card-selected",
  "event_data": {
    "strategyCardId": 3,
    "strategyCardName": "Politics",
    "selectionOrder": 2,
    "tradeGoodBonus": 0
  }
}
```

---

#### `speaker_history`

Tracks speaker changes throughout the game.

```sql
CREATE TABLE speaker_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,

  -- When and How
  became_speaker_round INTEGER NOT NULL,
  became_speaker_via VARCHAR(30) NOT NULL,
    -- 'initial', 'politics-card', 'manual-change'

  -- Timestamps
  became_speaker_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index
CREATE INDEX idx_speaker_history_game ON speaker_history(game_id, became_speaker_round);
```

**Fields**:
- `game_id`: Reference to game
- `player_id`: Player who became speaker
- `became_speaker_round`: Round when they became speaker
- `became_speaker_via`: How they became speaker
- `became_speaker_at`: Timestamp

---

#### `timer_tracking`

Tracks time spent per player (if cumulative timer mode enabled).

```sql
CREATE TABLE timer_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,

  -- Time Tracking
  total_time_seconds INTEGER NOT NULL DEFAULT 0,
    -- Cumulative time in seconds

  -- Current Turn (for active tracking)
  turn_started_at TIMESTAMPTZ,
  is_current_turn BOOLEAN NOT NULL DEFAULT false,

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  UNIQUE(game_id, player_id)
);

-- Index
CREATE INDEX idx_timer_tracking_game ON timer_tracking(game_id);
```

**Fields**:
- `game_id`: Reference to game
- `player_id`: Reference to player
- `total_time_seconds`: Total time accumulated
- `turn_started_at`: When current turn started
- `is_current_turn`: Whether this player is currently taking their turn

---

## Relationships

### Entity Relationship Diagram

```
games (1) ──< (N) players
games (1) ──< (1) game_state
games (1) ──< (N) strategy_selections
games (1) ──< (N) player_action_state
games (1) ──< (N) objectives
games (1) ──< (N) technology_unlocks
games (1) ──< (N) game_events
games (1) ──< (N) speaker_history
games (1) ──< (N) timer_tracking

players (1) ──< (N) strategy_selections
players (1) ──< (N) player_action_state
players (1) ──< (N) technology_unlocks
players (1) ──< (N) game_events
players (1) ──< (N) speaker_history
players (1) ──< (N) timer_tracking

auth.users (1) ──< (N) games (created_by)
auth.users (1) ──< (N) players (user_id)
```

### Cascade Behavior

- **ON DELETE CASCADE**: When a game is deleted, all related records are deleted
- **ON DELETE CASCADE**: When a player is deleted, their actions/selections are deleted
- **Soft Deletes**: Games are typically soft-deleted (deleted_at set) rather than hard-deleted

---

## Indexes

### Primary Indexes

All tables have primary key indexes automatically.

### Secondary Indexes

```sql
-- Games
CREATE INDEX idx_games_room_code ON games(room_code);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_created_by ON games(created_by);

-- Players
CREATE INDEX idx_players_game_id ON players(game_id);
CREATE INDEX idx_players_user_id ON players(user_id);
CREATE INDEX idx_players_position ON players(game_id, position);

-- Game State
CREATE INDEX idx_game_state_phase ON game_state(current_phase);

-- Strategy Selections
CREATE INDEX idx_strategy_selections_game_round ON strategy_selections(game_id, round_number);
CREATE INDEX idx_strategy_selections_player ON strategy_selections(player_id);

-- Player Action State
CREATE INDEX idx_player_action_state_game_round ON player_action_state(game_id, round_number);

-- Objectives
CREATE INDEX idx_objectives_game_id ON objectives(game_id);
CREATE INDEX idx_objectives_type ON objectives(game_id, objective_type);

-- Technology Unlocks
CREATE INDEX idx_technology_unlocks_game_player ON technology_unlocks(game_id, player_id);
CREATE INDEX idx_technology_unlocks_type ON technology_unlocks(player_id, technology_type);

-- Game Events
CREATE INDEX idx_game_events_game_id ON game_events(game_id, occurred_at DESC);
CREATE INDEX idx_game_events_type ON game_events(game_id, event_type);
CREATE INDEX idx_game_events_player ON game_events(player_id);

-- Speaker History
CREATE INDEX idx_speaker_history_game ON speaker_history(game_id, became_speaker_round);

-- Timer Tracking
CREATE INDEX idx_timer_tracking_game ON timer_tracking(game_id);
```

---

## Row Level Security

### Security Policies

```sql
-- Enable RLS on all tables
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategy_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_action_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE technology_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE speaker_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE timer_tracking ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if user is in a game
CREATE OR REPLACE FUNCTION is_user_in_game(game_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM players
    WHERE game_id = game_uuid
      AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Games: Users can view games they're in or created
CREATE POLICY "Users can view their games"
  ON games FOR SELECT
  USING (
    created_by = auth.uid()
    OR is_user_in_game(id)
  );

CREATE POLICY "Users can create games"
  ON games FOR INSERT
  WITH CHECK (created_by = auth.uid() OR created_by IS NULL);

CREATE POLICY "Users can update their games"
  ON games FOR UPDATE
  USING (is_user_in_game(id));

-- Players: Users can view players in their games
CREATE POLICY "Users can view players in their games"
  ON players FOR SELECT
  USING (is_user_in_game(game_id));

CREATE POLICY "Users can insert players"
  ON players FOR INSERT
  WITH CHECK (is_user_in_game(game_id));

CREATE POLICY "Users can update players in their games"
  ON players FOR UPDATE
  USING (is_user_in_game(game_id));

-- Game State: Users in game can view and update
CREATE POLICY "Users can view game state"
  ON game_state FOR SELECT
  USING (is_user_in_game(game_id));

CREATE POLICY "Users can update game state"
  ON game_state FOR ALL
  USING (is_user_in_game(game_id));

-- Strategy Selections: Users in game can view and modify
CREATE POLICY "Users can access strategy selections"
  ON strategy_selections FOR ALL
  USING (is_user_in_game(game_id));

-- Player Action State: Users in game can access
CREATE POLICY "Users can access player action state"
  ON player_action_state FOR ALL
  USING (is_user_in_game(game_id));

-- Objectives: Users in game can access
CREATE POLICY "Users can access objectives"
  ON objectives FOR ALL
  USING (is_user_in_game(game_id));

-- Technology Unlocks: Users in game can access
CREATE POLICY "Users can access technology unlocks"
  ON technology_unlocks FOR ALL
  USING (is_user_in_game(game_id));

-- Game Events: Users in game can view (insert only via triggers)
CREATE POLICY "Users can view game events"
  ON game_events FOR SELECT
  USING (is_user_in_game(game_id));

CREATE POLICY "Users can create game events"
  ON game_events FOR INSERT
  WITH CHECK (is_user_in_game(game_id));

-- Speaker History: Users in game can view
CREATE POLICY "Users can access speaker history"
  ON speaker_history FOR ALL
  USING (is_user_in_game(game_id));

-- Timer Tracking: Users in game can access
CREATE POLICY "Users can access timer tracking"
  ON timer_tracking FOR ALL
  USING (is_user_in_game(game_id));
```

---

## TypeScript Interfaces

### Core Interfaces

```typescript
// Enums
export type GameStatus = 'setup' | 'in-progress' | 'completed' | 'abandoned';
export type GamePhase = 'setup' | 'speaker-selection' | 'strategy' | 'action' | 'status' | 'agenda' | 'end-game';
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

// Game Configuration
export interface GameConfig {
  playerCount: number;
  vpLimit: number;
  showVPMeter: boolean;
  fullscreen: boolean;
  inactivityTimerMinutes: number;
  timerMode: 'per-turn' | 'cumulative';
  decisionBarEnabled: boolean;
  decisionBarSeconds: number;
  detailedAgendaMode: boolean;
}

// Database Models
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

export interface GameState {
  gameId: string;
  currentRound: number;
  currentPhase: GamePhase;
  currentTurnPlayerId: string | null;
  speakerPlayerId: string | null;
  mecatolClaimed: boolean;
  mecatolClaimedRound: number | null;
  lastActivityAt: string;
  phaseStartedAt: string | null;
  updatedAt: string;
}

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

export interface Objective {
  id: string;
  gameId: string;
  objectiveType: ObjectiveType;
  objectiveId: string | null;
  objectiveName: string;
  objectiveDescription: string | null;
  revealedRound: number;
  scoredByPlayers: string[];
  createdAt: string;
}

export interface TechnologyUnlock {
  id: string;
  gameId: string;
  playerId: string;
  technologyId: string;
  technologyType: TechnologyType;
  unlockedRound: number;
  isExhausted: boolean;
  unlockedAt: string;
}

export interface GameEvent {
  id: string;
  gameId: string;
  eventType: EventType;
  eventData: Record<string, any>;
  roundNumber: number | null;
  phase: GamePhase | null;
  playerId: string | null;
  occurredAt: string;
  isUndone: boolean;
  undoneAt: string | null;
}

export interface SpeakerHistory {
  id: string;
  gameId: string;
  playerId: string;
  becameSpeakerRound: number;
  becameSpeakerVia: 'initial' | 'politics-card' | 'manual-change';
  becameSpeakerAt: string;
}

export interface TimerTracking {
  id: string;
  gameId: string;
  playerId: string;
  totalTimeSeconds: number;
  turnStartedAt: string | null;
  isCurrentTurn: boolean;
  updatedAt: string;
}
```

### Composite Interfaces (Frontend)

```typescript
// Full game state (combines multiple tables)
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

// Player with extended data
export interface PlayerExtended extends Player {
  strategyCard?: StrategySelection;
  actionState?: PlayerActionState;
  technologies: TechnologyUnlock[];
  isSpeaker: boolean;
  isCurrentTurn: boolean;
  totalTimeSeconds?: number;
}

// Strategy card with state
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
```

---

## Enums and Constants

### Faction IDs

```typescript
export const FACTIONS = {
  // Base Game
  'arborec': { name: 'The Arborec', expansion: 'base' },
  'barony': { name: 'The Barony of Letnev', expansion: 'base' },
  'saar': { name: 'The Clan of Saar', expansion: 'base' },
  'muaat': { name: 'The Embers of Muaat', expansion: 'base' },
  'hacan': { name: 'The Emirates of Hacan', expansion: 'base' },
  'sol': { name: 'The Federation of Sol', expansion: 'base' },
  'creuss': { name: 'The Ghosts of Creuss', expansion: 'base' },
  'l1z1x': { name: 'The L1Z1X Mindnet', expansion: 'base' },
  'mentak': { name: 'The Mentak Coalition', expansion: 'base' },
  'naalu': { name: 'The Naalu Collective', expansion: 'base' },
  'nekro': { name: 'The Nekro Virus', expansion: 'base' },
  'sardakk': { name: "Sardakk N'orr", expansion: 'base' },
  'jol-nar': { name: 'The Universities of Jol-Nar', expansion: 'base' },
  'winnu': { name: 'The Winnu', expansion: 'base' },
  'xxcha': { name: 'The Xxcha Kingdom', expansion: 'base' },
  'yin': { name: 'The Yin Brotherhood', expansion: 'base' },
  'yssaril': { name: 'The Yssaril Tribes', expansion: 'base' },

  // Prophecy of Kings
  'argent': { name: 'The Argent Flight', expansion: 'pok' },
  'empyrean': { name: 'The Empyrean', expansion: 'pok' },
  'mahact': { name: 'The Mahact Gene-Sorcerers', expansion: 'pok' },
  'naaz-rokha': { name: 'The Naaz-Rokha Alliance', expansion: 'pok' },
  'nomad': { name: 'The Nomad', expansion: 'pok' },
  'titans': { name: 'The Titans of Ul', expansion: 'pok' },
  'cabal': { name: 'The Vuil\'raith Cabal', expansion: 'pok' },

  // Codex
  'keleres-mentak': { name: 'The Council Keleres (Mentak)', expansion: 'codex' },
  'keleres-xxcha': { name: 'The Council Keleres (Xxcha)', expansion: 'codex' },
  'keleres-argent': { name: 'The Council Keleres (Argent)', expansion: 'codex' },
} as const;

export type FactionId = keyof typeof FACTIONS;
```

### Strategy Cards

```typescript
export const STRATEGY_CARDS = [
  {
    id: 1,
    name: 'Leadership',
    primary: 'Gain 3 command tokens.',
    secondary: 'Spend 1 influence to gain 1 command token.',
  },
  {
    id: 2,
    name: 'Diplomacy',
    primary: 'Choose 1 system other than the active system; that system is prevented from being the active system until your next turn.',
    secondary: 'Spend 1 token from your strategy pool to ready up to 2 exhausted planets you control.',
  },
  {
    id: 3,
    name: 'Politics',
    primary: 'Choose a player other than the speaker; that player becomes the speaker. Draw 2 action cards.',
    secondary: 'Spend 1 token from your strategy pool to draw 2 action cards.',
  },
  {
    id: 4,
    name: 'Construction',
    primary: 'Place 1 PDS or 1 space dock on a planet you control. Place 1 PDS on a planet you control.',
    secondary: 'Spend 1 token from your strategy pool and place or replace 1 structure.',
  },
  {
    id: 5,
    name: 'Trade',
    primary: 'Gain 3 trade goods. Replenish commodities.',
    secondary: 'Spend 1 token from your strategy pool to replenish your commodities.',
  },
  {
    id: 6,
    name: 'Warfare',
    primary: 'Remove 1 command token from your strategy or fleet pool and return it to your reinforcements. Then, place that command token on a planet you control or in a space area you control that does not contain 1 of your command tokens.',
    secondary: 'Spend 1 token from your strategy pool to use the PRODUCTION ability of 1 unit in any system.',
  },
  {
    id: 7,
    name: 'Technology',
    primary: 'Research 1 technology.',
    secondary: 'Spend 1 token from your strategy pool and 6 resources to research 1 technology.',
  },
  {
    id: 8,
    name: 'Imperial',
    primary: 'Immediately score 1 public objective; if you cannot, gain 1 victory point instead. Then, draw 1 secret objective.',
    secondary: 'Spend 1 token from your strategy pool to draw 1 secret objective.',
  },
] as const;
```

### Colors

```typescript
export const PLAYER_COLORS: PlayerColor[] = [
  'red',
  'blue',
  'green',
  'yellow',
  'purple',
  'black',
  'orange',
  'pink',
];

export const COLOR_HEX_MAP: Record<PlayerColor, string> = {
  red: '#D32F2F',
  blue: '#1976D2',
  green: '#388E3C',
  yellow: '#FBC02D',
  purple: '#7B1FA2',
  black: '#424242',
  orange: '#F57C00',
  pink: '#C2185B',
};
```

---

## Summary

This schema provides:
- **Complete game state tracking** across all phases
- **Flexible configuration** via JSON fields
- **Real-time synchronization** support via Supabase
- **Security** via Row Level Security policies
- **Event logging** for undo and audit trail
- **Performance** via appropriate indexes
- **Type safety** via TypeScript interfaces

The schema balances normalization (reducing redundancy) with denormalization (optimizing reads) to support a real-time multiplayer application.
