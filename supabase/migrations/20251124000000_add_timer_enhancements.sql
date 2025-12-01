-- ============================================================================
-- Timer Enhancements Migration
-- ============================================================================
-- This migration adds:
-- 1. player_round_times table for storing individual round times
-- 2. Pause functionality fields to game_state table
-- 3. RLS policies for timer tables
-- ============================================================================

-- ============================================================================
-- 1. CREATE player_round_times TABLE
-- ============================================================================
-- Stores time spent by each player in each round
-- This allows for historical tracking and per-round analytics

CREATE TABLE player_round_times (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL CHECK (round_number > 0),

  -- Time tracking for this specific round
  time_seconds INTEGER NOT NULL DEFAULT 0 CHECK (time_seconds >= 0),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints: One record per player per round
  UNIQUE(game_id, player_id, round_number)
);

-- ============================================================================
-- 2. ADD PAUSE FUNCTIONALITY TO game_state
-- ============================================================================
-- Allows hosts to pause the game (stops timers for breaks, etc.)

ALTER TABLE game_state
  ADD COLUMN is_paused BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN paused_at TIMESTAMPTZ,
  ADD COLUMN paused_by_user_id UUID REFERENCES auth.users(id);

-- ============================================================================
-- 3. CREATE INDEXES
-- ============================================================================

-- Index for efficient querying of round times by game
CREATE INDEX idx_player_round_times_game ON player_round_times(game_id);

-- Index for querying specific player's round times
CREATE INDEX idx_player_round_times_player ON player_round_times(player_id);

-- Index for querying by round number (for round analytics)
CREATE INDEX idx_player_round_times_round ON player_round_times(game_id, round_number);

-- ============================================================================
-- 4. TRIGGERS FOR AUTOMATIC TIMESTAMPS
-- ============================================================================

CREATE TRIGGER update_player_round_times_updated_at BEFORE UPDATE ON player_round_times
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on player_round_times
ALTER TABLE player_round_times ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can view round times for games they're in
CREATE POLICY "Users can view round times for their games"
  ON player_round_times
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM game_users
      WHERE game_users.game_id = player_round_times.game_id
        AND game_users.user_id = auth.uid()
        AND game_users.is_active = true
    )
  );

-- INSERT: Users can insert round times for games they're in
CREATE POLICY "Users can insert round times for their games"
  ON player_round_times
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM game_users
      WHERE game_users.game_id = player_round_times.game_id
        AND game_users.user_id = auth.uid()
        AND game_users.is_active = true
    )
  );

-- UPDATE: Users can update round times for games they're in
CREATE POLICY "Users can update round times for their games"
  ON player_round_times
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM game_users
      WHERE game_users.game_id = player_round_times.game_id
        AND game_users.user_id = auth.uid()
        AND game_users.is_active = true
    )
  );

-- DELETE: Only game creator can delete round times
CREATE POLICY "Game creator can delete round times"
  ON player_round_times
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = player_round_times.game_id
        AND games.created_by = auth.uid()
    )
  );

-- ============================================================================
-- 6. HELPER FUNCTION: Get Total Time for Player
-- ============================================================================
-- This function calculates the total time from all rounds for a player

CREATE OR REPLACE FUNCTION get_player_total_time(
  p_game_id UUID,
  p_player_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_total_seconds INTEGER;
BEGIN
  SELECT COALESCE(SUM(time_seconds), 0)
  INTO v_total_seconds
  FROM player_round_times
  WHERE game_id = p_game_id
    AND player_id = p_player_id;

  RETURN v_total_seconds;
END;
$$;
