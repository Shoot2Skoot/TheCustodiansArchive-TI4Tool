-- The Custodians Archive - Row Level Security Policies
-- Ensures players can only access games they're part of

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

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

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function: Check if user is in a game
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

-- Function: Check if user created a game
CREATE OR REPLACE FUNCTION is_game_creator(game_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM games
    WHERE id = game_uuid
      AND created_by = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GAMES TABLE POLICIES
-- ============================================================================

-- Users can view games they're in or created
CREATE POLICY "Users can view their games"
  ON games FOR SELECT
  USING (
    created_by = auth.uid()
    OR is_user_in_game(id)
  );

-- Users can create games
CREATE POLICY "Users can create games"
  ON games FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    OR created_by IS NULL  -- Allow anonymous game creation
  );

-- Users can update games they're in
CREATE POLICY "Users can update their games"
  ON games FOR UPDATE
  USING (is_user_in_game(id));

-- Only creators can delete games
CREATE POLICY "Creators can delete their games"
  ON games FOR DELETE
  USING (created_by = auth.uid());

-- ============================================================================
-- PLAYERS TABLE POLICIES
-- ============================================================================

-- Users can view players in their games
CREATE POLICY "Users can view players in their games"
  ON players FOR SELECT
  USING (is_user_in_game(game_id));

-- Users can insert players when creating/joining games
CREATE POLICY "Users can insert players"
  ON players FOR INSERT
  WITH CHECK (
    is_user_in_game(game_id)
    OR is_game_creator(game_id)
  );

-- Users can update players in their games
CREATE POLICY "Users can update players in their games"
  ON players FOR UPDATE
  USING (is_user_in_game(game_id));

-- Users can delete players (for game setup)
CREATE POLICY "Users can delete players in their games"
  ON players FOR DELETE
  USING (is_user_in_game(game_id));

-- ============================================================================
-- GAME STATE TABLE POLICIES
-- ============================================================================

-- Users in game can view game state
CREATE POLICY "Users can view game state"
  ON game_state FOR SELECT
  USING (is_user_in_game(game_id));

-- Users in game can insert game state (during setup)
CREATE POLICY "Users can insert game state"
  ON game_state FOR INSERT
  WITH CHECK (is_user_in_game(game_id));

-- Users in game can update game state
CREATE POLICY "Users can update game state"
  ON game_state FOR UPDATE
  USING (is_user_in_game(game_id));

-- ============================================================================
-- STRATEGY SELECTIONS TABLE POLICIES
-- ============================================================================

CREATE POLICY "Users can access strategy selections"
  ON strategy_selections FOR ALL
  USING (is_user_in_game(game_id));

-- ============================================================================
-- PLAYER ACTION STATE TABLE POLICIES
-- ============================================================================

CREATE POLICY "Users can access player action state"
  ON player_action_state FOR ALL
  USING (is_user_in_game(game_id));

-- ============================================================================
-- OBJECTIVES TABLE POLICIES
-- ============================================================================

CREATE POLICY "Users can access objectives"
  ON objectives FOR ALL
  USING (is_user_in_game(game_id));

-- ============================================================================
-- TECHNOLOGY UNLOCKS TABLE POLICIES
-- ============================================================================

CREATE POLICY "Users can access technology unlocks"
  ON technology_unlocks FOR ALL
  USING (is_user_in_game(game_id));

-- ============================================================================
-- GAME EVENTS TABLE POLICIES
-- ============================================================================

-- Users can view game events in their games
CREATE POLICY "Users can view game events"
  ON game_events FOR SELECT
  USING (is_user_in_game(game_id));

-- Users can create game events
CREATE POLICY "Users can create game events"
  ON game_events FOR INSERT
  WITH CHECK (is_user_in_game(game_id));

-- Users can update game events (for undo functionality)
CREATE POLICY "Users can update game events"
  ON game_events FOR UPDATE
  USING (is_user_in_game(game_id));

-- ============================================================================
-- SPEAKER HISTORY TABLE POLICIES
-- ============================================================================

CREATE POLICY "Users can access speaker history"
  ON speaker_history FOR ALL
  USING (is_user_in_game(game_id));

-- ============================================================================
-- TIMER TRACKING TABLE POLICIES
-- ============================================================================

CREATE POLICY "Users can access timer tracking"
  ON timer_tracking FOR ALL
  USING (is_user_in_game(game_id));

-- ============================================================================
-- REALTIME PUBLICATION
-- ============================================================================

-- Enable Realtime for all tables so clients can subscribe to changes
-- This is necessary for multiplayer real-time sync

-- Note: Supabase enables realtime on all tables by default in newer versions
-- But we can be explicit about it for clarity

-- The realtime configuration is typically done via the Supabase dashboard
-- or API, but we document it here for reference:
--
-- Tables to enable realtime on:
-- - games
-- - players
-- - game_state
-- - strategy_selections
-- - player_action_state
-- - objectives
-- - technology_unlocks
-- - game_events
-- - speaker_history
-- - timer_tracking
