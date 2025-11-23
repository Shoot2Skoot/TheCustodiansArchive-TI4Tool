-- Migration: Add leader unlocks table and expansion configuration to games
-- This supports the Faction Comparison feature

-- ============================================================================
-- LEADER UNLOCKS TABLE
-- ============================================================================
-- Tracks when commanders and heroes are unlocked for each player
-- Agents are always unlocked, so we don't track them

CREATE TABLE leader_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  leader_type TEXT NOT NULL CHECK (leader_type IN ('commander', 'hero')),
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unlocked_round INTEGER NOT NULL,

  -- Ensure each player can only unlock each leader type once per game
  UNIQUE(game_id, player_id, leader_type),

  -- Ensure valid references
  CONSTRAINT fk_game_id FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  CONSTRAINT fk_player_id FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

-- Index for faster lookups by game and player
CREATE INDEX idx_leader_unlocks_game_player
  ON leader_unlocks(game_id, player_id);

-- Index for faster lookups by game only (for retrieving all unlocks in a game)
CREATE INDEX idx_leader_unlocks_game
  ON leader_unlocks(game_id);

-- ============================================================================
-- EXPANSION CONFIGURATION
-- ============================================================================
-- Add expansion/codex configuration to games.config JSON field
-- This doesn't require a schema change since config is already JSONB
-- We're just documenting the expected structure:
--
-- config.expansions = {
--   prophecyOfKings: boolean,
--   codex1: boolean,  // Codex I - Ordinian (Omega promissory notes, faction techs)
--   codex2: boolean,  // Codex II - Affinity (reference cards only)
--   codex3: boolean,  // Codex III - Vigil (Omega leaders, Council Keleres)
--   codex4: boolean,  // Codex IV - Liberation (relics, galactic events)
--   codex45: boolean  // Codex 4.5 - Double Omega basic techs
-- }

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Enable RLS on leader_unlocks table
ALTER TABLE leader_unlocks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view leader unlocks for games they're part of
CREATE POLICY "Users can view leader unlocks for their games"
  ON leader_unlocks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM game_users
      WHERE game_users.game_id = leader_unlocks.game_id
      AND game_users.user_id = auth.uid()
    )
  );

-- Policy: Users can insert leader unlocks for games they're part of
CREATE POLICY "Users can insert leader unlocks for their games"
  ON leader_unlocks
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM game_users
      WHERE game_users.game_id = leader_unlocks.game_id
      AND game_users.user_id = auth.uid()
    )
  );

-- Policy: Users can delete leader unlocks for games they're part of
-- (This supports undo functionality)
CREATE POLICY "Users can delete leader unlocks for their games"
  ON leader_unlocks
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM game_users
      WHERE game_users.game_id = leader_unlocks.game_id
      AND game_users.user_id = auth.uid()
    )
  );

-- ============================================================================
-- REALTIME PUBLICATION
-- ============================================================================
-- Enable realtime for leader_unlocks table so clients get live updates
ALTER PUBLICATION supabase_realtime ADD TABLE leader_unlocks;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE leader_unlocks IS 'Tracks when faction commanders and heroes are unlocked during gameplay';
COMMENT ON COLUMN leader_unlocks.game_id IS 'Reference to the game';
COMMENT ON COLUMN leader_unlocks.player_id IS 'Reference to the player who unlocked the leader';
COMMENT ON COLUMN leader_unlocks.leader_type IS 'Type of leader: commander or hero (agents are always unlocked)';
COMMENT ON COLUMN leader_unlocks.unlocked_at IS 'Timestamp when the leader was unlocked';
COMMENT ON COLUMN leader_unlocks.unlocked_round IS 'Game round number when the leader was unlocked';
