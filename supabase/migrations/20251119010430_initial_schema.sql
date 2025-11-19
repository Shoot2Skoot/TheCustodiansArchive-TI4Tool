-- The Custodians Archive - Initial Database Schema
-- Creates all tables, indexes, and constraints for the TI4 dashboard

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Games table
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code VARCHAR(10) UNIQUE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'setup'
    CHECK (status IN ('setup', 'in-progress', 'completed', 'abandoned')),

  -- Configuration (JSON for flexibility)
  config JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Ownership
  created_by UUID REFERENCES auth.users(id),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,

  -- Soft delete
  deleted_at TIMESTAMPTZ
);

-- Players table
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),

  -- Player Configuration
  position INTEGER NOT NULL CHECK (position >= 1 AND position <= 8),
  color VARCHAR(20) NOT NULL CHECK (color IN ('red', 'blue', 'green', 'yellow', 'purple', 'black', 'orange', 'pink')),
  faction_id VARCHAR(50) NOT NULL,

  -- Player State
  victory_points INTEGER NOT NULL DEFAULT 0,

  -- Display
  display_name VARCHAR(100),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  joined_at TIMESTAMPTZ,

  -- Constraints
  UNIQUE(game_id, position),
  UNIQUE(game_id, color),
  UNIQUE(game_id, faction_id)
);

-- ============================================================================
-- GAME STATE TABLES
-- ============================================================================

-- Game State table
CREATE TABLE game_state (
  game_id UUID PRIMARY KEY REFERENCES games(id) ON DELETE CASCADE,

  -- Round and Phase
  current_round INTEGER NOT NULL DEFAULT 0,
  current_phase VARCHAR(30) NOT NULL DEFAULT 'setup'
    CHECK (current_phase IN ('setup', 'speaker-selection', 'strategy', 'action', 'status', 'agenda', 'end-game')),

  -- Current Turn
  current_turn_player_id UUID REFERENCES players(id),

  -- Speaker
  speaker_player_id UUID REFERENCES players(id),

  -- Mecatol Rex
  mecatol_claimed BOOLEAN NOT NULL DEFAULT false,
  mecatol_claimed_round INTEGER,

  -- Timestamps
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  phase_started_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Strategy Selections table
CREATE TABLE strategy_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,

  -- Selection Details
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  strategy_card_id INTEGER NOT NULL CHECK (strategy_card_id >= 1 AND strategy_card_id <= 8),
  selection_order INTEGER NOT NULL,
  trade_good_bonus INTEGER NOT NULL DEFAULT 0,

  -- Strategy Card Usage
  primary_action_used BOOLEAN NOT NULL DEFAULT false,

  -- Timestamps
  selected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  UNIQUE(game_id, round_number, strategy_card_id),
  UNIQUE(game_id, round_number, player_id)
);

-- Player Action State table
CREATE TABLE player_action_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,

  -- Action Tracking
  tactical_actions_count INTEGER NOT NULL DEFAULT 0,
  strategy_card_used BOOLEAN NOT NULL DEFAULT false,
  has_passed BOOLEAN NOT NULL DEFAULT false,

  -- Timestamps
  passed_at TIMESTAMPTZ,

  -- Constraints
  UNIQUE(game_id, player_id, round_number)
);

-- ============================================================================
-- TRACKING TABLES
-- ============================================================================

-- Objectives table
CREATE TABLE objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,

  -- Objective Details
  objective_type VARCHAR(20) NOT NULL CHECK (objective_type IN ('public-stage-1', 'public-stage-2', 'secret')),
  objective_id VARCHAR(50),
  objective_name VARCHAR(200) NOT NULL,
  objective_description TEXT,

  -- When Revealed
  revealed_round INTEGER NOT NULL,

  -- Who Scored
  scored_by_players UUID[] DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Technology Unlocks table
CREATE TABLE technology_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,

  -- Technology Details
  technology_id VARCHAR(50) NOT NULL,
  technology_type VARCHAR(20) NOT NULL CHECK (technology_type IN ('biotic', 'warfare', 'propulsion', 'cybernetic')),

  -- When Unlocked
  unlocked_round INTEGER NOT NULL,

  -- Exhausted State
  is_exhausted BOOLEAN NOT NULL DEFAULT false,

  -- Timestamps
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  UNIQUE(game_id, player_id, technology_id)
);

-- Game Events table (for history and undo)
CREATE TABLE game_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,

  -- Event Details
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Context
  round_number INTEGER,
  phase VARCHAR(30),
  player_id UUID REFERENCES players(id),

  -- Timestamps
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Undo Support
  is_undone BOOLEAN NOT NULL DEFAULT false,
  undone_at TIMESTAMPTZ
);

-- Speaker History table
CREATE TABLE speaker_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,

  -- When and How
  became_speaker_round INTEGER NOT NULL,
  became_speaker_via VARCHAR(30) NOT NULL CHECK (became_speaker_via IN ('initial', 'politics-card', 'manual-change')),

  -- Timestamps
  became_speaker_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Timer Tracking table
CREATE TABLE timer_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,

  -- Time Tracking
  total_time_seconds INTEGER NOT NULL DEFAULT 0,

  -- Current Turn (for active tracking)
  turn_started_at TIMESTAMPTZ,
  is_current_turn BOOLEAN NOT NULL DEFAULT false,

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  UNIQUE(game_id, player_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Games indexes
CREATE INDEX idx_games_room_code ON games(room_code);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_created_by ON games(created_by);

-- Players indexes
CREATE INDEX idx_players_game_id ON players(game_id);
CREATE INDEX idx_players_user_id ON players(user_id);
CREATE INDEX idx_players_position ON players(game_id, position);

-- Game State indexes
CREATE INDEX idx_game_state_phase ON game_state(current_phase);

-- Strategy Selections indexes
CREATE INDEX idx_strategy_selections_game_round ON strategy_selections(game_id, round_number);
CREATE INDEX idx_strategy_selections_player ON strategy_selections(player_id);

-- Player Action State indexes
CREATE INDEX idx_player_action_state_game_round ON player_action_state(game_id, round_number);

-- Objectives indexes
CREATE INDEX idx_objectives_game_id ON objectives(game_id);
CREATE INDEX idx_objectives_type ON objectives(game_id, objective_type);

-- Technology Unlocks indexes
CREATE INDEX idx_technology_unlocks_game_player ON technology_unlocks(game_id, player_id);
CREATE INDEX idx_technology_unlocks_type ON technology_unlocks(player_id, technology_type);

-- Game Events indexes
CREATE INDEX idx_game_events_game_id ON game_events(game_id, occurred_at DESC);
CREATE INDEX idx_game_events_type ON game_events(game_id, event_type);
CREATE INDEX idx_game_events_player ON game_events(player_id);

-- Speaker History indexes
CREATE INDEX idx_speaker_history_game ON speaker_history(game_id, became_speaker_round);

-- Timer Tracking indexes
CREATE INDEX idx_timer_tracking_game ON timer_tracking(game_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_state_updated_at BEFORE UPDATE ON game_state
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timer_tracking_updated_at BEFORE UPDATE ON timer_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to generate unique room codes
CREATE OR REPLACE FUNCTION generate_room_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Exclude ambiguous characters
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;
