-- Comprehensive RLS policy fix for all game-related tables
-- Ensures both players in the game AND game creators can perform operations
-- This prevents RLS errors when game creators manage game data before claiming a player slot

-- ============================================================================
-- PLAYER ACTION STATE
-- ============================================================================

DROP POLICY IF EXISTS "Users can access player action state" ON player_action_state;

CREATE POLICY "Users can view player action state"
  ON player_action_state FOR SELECT
  USING (
    is_user_in_game(game_id)
    OR is_game_creator(game_id)
  );

CREATE POLICY "Users can insert player action state"
  ON player_action_state FOR INSERT
  WITH CHECK (
    is_user_in_game(game_id)
    OR is_game_creator(game_id)
  );

CREATE POLICY "Users can update player action state"
  ON player_action_state FOR UPDATE
  USING (
    is_user_in_game(game_id)
    OR is_game_creator(game_id)
  )
  WITH CHECK (
    is_user_in_game(game_id)
    OR is_game_creator(game_id)
  );

CREATE POLICY "Users can delete player action state"
  ON player_action_state FOR DELETE
  USING (
    is_user_in_game(game_id)
    OR is_game_creator(game_id)
  );

-- ============================================================================
-- OBJECTIVES
-- ============================================================================

DROP POLICY IF EXISTS "Users can access objectives" ON objectives;

CREATE POLICY "Users can view objectives"
  ON objectives FOR SELECT
  USING (
    is_user_in_game(game_id)
    OR is_game_creator(game_id)
  );

CREATE POLICY "Users can insert objectives"
  ON objectives FOR INSERT
  WITH CHECK (
    is_user_in_game(game_id)
    OR is_game_creator(game_id)
  );

CREATE POLICY "Users can update objectives"
  ON objectives FOR UPDATE
  USING (
    is_user_in_game(game_id)
    OR is_game_creator(game_id)
  )
  WITH CHECK (
    is_user_in_game(game_id)
    OR is_game_creator(game_id)
  );

CREATE POLICY "Users can delete objectives"
  ON objectives FOR DELETE
  USING (
    is_user_in_game(game_id)
    OR is_game_creator(game_id)
  );

-- ============================================================================
-- TECHNOLOGY UNLOCKS
-- ============================================================================

DROP POLICY IF EXISTS "Users can access technology unlocks" ON technology_unlocks;

CREATE POLICY "Users can view technology unlocks"
  ON technology_unlocks FOR SELECT
  USING (
    is_user_in_game(game_id)
    OR is_game_creator(game_id)
  );

CREATE POLICY "Users can insert technology unlocks"
  ON technology_unlocks FOR INSERT
  WITH CHECK (
    is_user_in_game(game_id)
    OR is_game_creator(game_id)
  );

CREATE POLICY "Users can update technology unlocks"
  ON technology_unlocks FOR UPDATE
  USING (
    is_user_in_game(game_id)
    OR is_game_creator(game_id)
  )
  WITH CHECK (
    is_user_in_game(game_id)
    OR is_game_creator(game_id)
  );

CREATE POLICY "Users can delete technology unlocks"
  ON technology_unlocks FOR DELETE
  USING (
    is_user_in_game(game_id)
    OR is_game_creator(game_id)
  );

-- ============================================================================
-- SPEAKER HISTORY
-- ============================================================================

DROP POLICY IF EXISTS "Users can access speaker history" ON speaker_history;

CREATE POLICY "Users can view speaker history"
  ON speaker_history FOR SELECT
  USING (
    is_user_in_game(game_id)
    OR is_game_creator(game_id)
  );

CREATE POLICY "Users can insert speaker history"
  ON speaker_history FOR INSERT
  WITH CHECK (
    is_user_in_game(game_id)
    OR is_game_creator(game_id)
  );

CREATE POLICY "Users can update speaker history"
  ON speaker_history FOR UPDATE
  USING (
    is_user_in_game(game_id)
    OR is_game_creator(game_id)
  )
  WITH CHECK (
    is_user_in_game(game_id)
    OR is_game_creator(game_id)
  );

CREATE POLICY "Users can delete speaker history"
  ON speaker_history FOR DELETE
  USING (
    is_user_in_game(game_id)
    OR is_game_creator(game_id)
  );

-- ============================================================================
-- TIMER TRACKING
-- ============================================================================

DROP POLICY IF EXISTS "Users can access timer tracking" ON timer_tracking;

CREATE POLICY "Users can view timer tracking"
  ON timer_tracking FOR SELECT
  USING (
    is_user_in_game(game_id)
    OR is_game_creator(game_id)
  );

CREATE POLICY "Users can insert timer tracking"
  ON timer_tracking FOR INSERT
  WITH CHECK (
    is_user_in_game(game_id)
    OR is_game_creator(game_id)
  );

CREATE POLICY "Users can update timer tracking"
  ON timer_tracking FOR UPDATE
  USING (
    is_user_in_game(game_id)
    OR is_game_creator(game_id)
  )
  WITH CHECK (
    is_user_in_game(game_id)
    OR is_game_creator(game_id)
  );

CREATE POLICY "Users can delete timer tracking"
  ON timer_tracking FOR DELETE
  USING (
    is_user_in_game(game_id)
    OR is_game_creator(game_id)
  );
