-- =============================================================================
-- New Architecture: User-to-Game Relationships (not User-to-Player)
-- This migration implements a more flexible permission model where:
-- 1. Users join games (tracked in game_users table)
-- 2. Any user in a game can make changes (UI controls which player)
-- 3. Game creators (via created_by) have host privileges
-- 4. Player.user_id is optional and not used for permissions
-- =============================================================================

-- Step 1: Create game_users join table
-- This tracks which users are in which games (separate from player assignments)
CREATE TABLE IF NOT EXISTS game_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Ensure a user can only join a game once
  UNIQUE(game_id, user_id),

  -- Index for performance
  CONSTRAINT game_users_game_id_idx UNIQUE(game_id, user_id)
);

-- Enable RLS on game_users
ALTER TABLE game_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for game_users table
-- Users can view all users in games they're in or created
CREATE POLICY "Users can view game memberships in their games"
  ON game_users FOR SELECT
  USING (
    user_id = auth.uid()
    OR game_id IN (
      SELECT id FROM games WHERE created_by = auth.uid()
    )
    OR game_id IN (
      SELECT game_id FROM game_users WHERE user_id = auth.uid()
    )
  );

-- Users can join games (INSERT) - we'll handle room code validation in app logic
CREATE POLICY "Users can join games"
  ON game_users FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own membership status
CREATE POLICY "Users can update their own game membership"
  ON game_users FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can leave games (DELETE their own membership)
CREATE POLICY "Users can leave games"
  ON game_users FOR DELETE
  USING (user_id = auth.uid());

-- Game creators can remove users from their games
CREATE POLICY "Creators can remove users from their games"
  ON game_users FOR DELETE
  USING (
    game_id IN (
      SELECT id FROM games WHERE created_by = auth.uid()
    )
  );

-- Step 2: Create new helper function that checks game_users table
CREATE OR REPLACE FUNCTION is_user_in_game_v2(game_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is in game_users table OR is the game creator
  RETURN EXISTS (
    SELECT 1 FROM game_users
    WHERE game_id = game_uuid
      AND user_id = auth.uid()
      AND is_active = true
  ) OR EXISTS (
    SELECT 1 FROM games
    WHERE id = game_uuid
      AND created_by = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create function to join game by room code
CREATE OR REPLACE FUNCTION join_game_by_room_code(room_code_input TEXT)
RETURNS UUID AS $$
DECLARE
  target_game_id UUID;
  existing_membership UUID;
BEGIN
  -- Find the game by room code
  SELECT id INTO target_game_id
  FROM games
  WHERE room_code = room_code_input
    AND deleted_at IS NULL
    AND status IN ('setup', 'active');  -- Can't join finished games

  IF target_game_id IS NULL THEN
    RAISE EXCEPTION 'Game not found or not joinable';
  END IF;

  -- Check if user is already in this game
  SELECT id INTO existing_membership
  FROM game_users
  WHERE game_id = target_game_id
    AND user_id = auth.uid();

  IF existing_membership IS NOT NULL THEN
    -- Already in the game, just return game_id
    RETURN target_game_id;
  END IF;

  -- Add user to game
  INSERT INTO game_users (game_id, user_id)
  VALUES (target_game_id, auth.uid());

  RETURN target_game_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Update RLS policies to use new approach
-- We'll update the most critical tables first: strategy_selections, game_state

-- Drop old strategy_selections policies
DROP POLICY IF EXISTS "Users can view strategy selections in their games" ON strategy_selections;
DROP POLICY IF EXISTS "Users can insert strategy selections in their games" ON strategy_selections;
DROP POLICY IF EXISTS "Users can update strategy selections in their games" ON strategy_selections;
DROP POLICY IF EXISTS "Users can delete strategy selections in their games" ON strategy_selections;

-- Create new permissive strategy_selections policies
CREATE POLICY "Users can view strategy selections in games they joined"
  ON strategy_selections FOR SELECT
  USING (is_user_in_game_v2(game_id));

CREATE POLICY "Users can insert strategy selections in games they joined"
  ON strategy_selections FOR INSERT
  WITH CHECK (is_user_in_game_v2(game_id));

CREATE POLICY "Users can update strategy selections in games they joined"
  ON strategy_selections FOR UPDATE
  USING (is_user_in_game_v2(game_id))
  WITH CHECK (is_user_in_game_v2(game_id));

CREATE POLICY "Users can delete strategy selections in games they joined"
  ON strategy_selections FOR DELETE
  USING (is_user_in_game_v2(game_id));

-- Update game_state policies
DROP POLICY IF EXISTS "Users can view game state in their games" ON game_state;
DROP POLICY IF EXISTS "Users can update game state in their games" ON game_state;

CREATE POLICY "Users can view game state in games they joined"
  ON game_state FOR SELECT
  USING (is_user_in_game_v2(game_id));

CREATE POLICY "Users can update game state in games they joined"
  ON game_state FOR UPDATE
  USING (is_user_in_game_v2(game_id))
  WITH CHECK (is_user_in_game_v2(game_id));

-- Update player_action_state policies
DROP POLICY IF EXISTS "Users can view player actions in their games" ON player_action_state;
DROP POLICY IF EXISTS "Users can insert player actions in their games" ON player_action_state;
DROP POLICY IF EXISTS "Users can update player actions in their games" ON player_action_state;
DROP POLICY IF EXISTS "Users can delete player actions in their games" ON player_action_state;

CREATE POLICY "Users can view player actions in games they joined"
  ON player_action_state FOR SELECT
  USING (is_user_in_game_v2(game_id));

CREATE POLICY "Users can insert player actions in games they joined"
  ON player_action_state FOR INSERT
  WITH CHECK (is_user_in_game_v2(game_id));

CREATE POLICY "Users can update player actions in games they joined"
  ON player_action_state FOR UPDATE
  USING (is_user_in_game_v2(game_id))
  WITH CHECK (is_user_in_game_v2(game_id));

CREATE POLICY "Users can delete player actions in games they joined"
  ON player_action_state FOR DELETE
  USING (is_user_in_game_v2(game_id));

-- Update objectives policies
DROP POLICY IF EXISTS "Users can view objectives in their games" ON objectives;
DROP POLICY IF EXISTS "Users can insert objectives in their games" ON objectives;
DROP POLICY IF EXISTS "Users can update objectives in their games" ON objectives;
DROP POLICY IF EXISTS "Users can delete objectives in their games" ON objectives;

CREATE POLICY "Users can view objectives in games they joined"
  ON objectives FOR SELECT
  USING (is_user_in_game_v2(game_id));

CREATE POLICY "Users can insert objectives in games they joined"
  ON objectives FOR INSERT
  WITH CHECK (is_user_in_game_v2(game_id));

CREATE POLICY "Users can update objectives in games they joined"
  ON objectives FOR UPDATE
  USING (is_user_in_game_v2(game_id))
  WITH CHECK (is_user_in_game_v2(game_id));

CREATE POLICY "Users can delete objectives in games they joined"
  ON objectives FOR DELETE
  USING (is_user_in_game_v2(game_id));

-- Update technology_unlocks policies
DROP POLICY IF EXISTS "Users can view technology unlocks in their games" ON technology_unlocks;
DROP POLICY IF EXISTS "Users can insert technology unlocks in their games" ON technology_unlocks;
DROP POLICY IF EXISTS "Users can update technology unlocks in their games" ON technology_unlocks;
DROP POLICY IF EXISTS "Users can delete technology unlocks in their games" ON technology_unlocks;

CREATE POLICY "Users can view technology unlocks in games they joined"
  ON technology_unlocks FOR SELECT
  USING (is_user_in_game_v2(game_id));

CREATE POLICY "Users can insert technology unlocks in games they joined"
  ON technology_unlocks FOR INSERT
  WITH CHECK (is_user_in_game_v2(game_id));

CREATE POLICY "Users can update technology unlocks in games they joined"
  ON technology_unlocks FOR UPDATE
  USING (is_user_in_game_v2(game_id))
  WITH CHECK (is_user_in_game_v2(game_id));

CREATE POLICY "Users can delete technology unlocks in games they joined"
  ON technology_unlocks FOR DELETE
  USING (is_user_in_game_v2(game_id));

-- Update speaker_history policies
DROP POLICY IF EXISTS "Users can view speaker history in their games" ON speaker_history;
DROP POLICY IF EXISTS "Users can insert speaker history in their games" ON speaker_history;
DROP POLICY IF EXISTS "Users can update speaker history in their games" ON speaker_history;
DROP POLICY IF EXISTS "Users can delete speaker history in their games" ON speaker_history;

CREATE POLICY "Users can view speaker history in games they joined"
  ON speaker_history FOR SELECT
  USING (is_user_in_game_v2(game_id));

CREATE POLICY "Users can insert speaker history in games they joined"
  ON speaker_history FOR INSERT
  WITH CHECK (is_user_in_game_v2(game_id));

CREATE POLICY "Users can update speaker history in games they joined"
  ON speaker_history FOR UPDATE
  USING (is_user_in_game_v2(game_id))
  WITH CHECK (is_user_in_game_v2(game_id));

CREATE POLICY "Users can delete speaker history in games they joined"
  ON speaker_history FOR DELETE
  USING (is_user_in_game_v2(game_id));

-- Update timer_tracking policies
DROP POLICY IF EXISTS "Users can view timer tracking in their games" ON timer_tracking;
DROP POLICY IF EXISTS "Users can insert timer tracking in their games" ON timer_tracking;
DROP POLICY IF EXISTS "Users can update timer tracking in their games" ON timer_tracking;
DROP POLICY IF EXISTS "Users can delete timer tracking in their games" ON timer_tracking;

CREATE POLICY "Users can view timer tracking in games they joined"
  ON timer_tracking FOR SELECT
  USING (is_user_in_game_v2(game_id));

CREATE POLICY "Users can insert timer tracking in games they joined"
  ON timer_tracking FOR INSERT
  WITH CHECK (is_user_in_game_v2(game_id));

CREATE POLICY "Users can update timer tracking in games they joined"
  ON timer_tracking FOR UPDATE
  USING (is_user_in_game_v2(game_id))
  WITH CHECK (is_user_in_game_v2(game_id));

CREATE POLICY "Users can delete timer tracking in games they joined"
  ON timer_tracking FOR DELETE
  USING (is_user_in_game_v2(game_id));

-- Step 5: Migrate existing games - add creators to game_users
-- This ensures all existing game creators are automatically in their games
INSERT INTO game_users (game_id, user_id, joined_at)
SELECT id, created_by, created_at
FROM games
WHERE created_by IS NOT NULL
  AND deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM game_users
    WHERE game_id = games.id
      AND user_id = games.created_by
  );

-- Step 6: Create index for performance
CREATE INDEX IF NOT EXISTS idx_game_users_user_id ON game_users(user_id);
CREATE INDEX IF NOT EXISTS idx_game_users_game_id ON game_users(game_id);

-- Add comment explaining the new architecture
COMMENT ON TABLE game_users IS 'Tracks which users are in which games. This is separate from player assignments - users join games and then pick which player/faction they control via the UI.';
