-- Fix RLS Policies for Game State and Related Tables
-- This fixes the issue where game_state cannot be inserted during game creation

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can update game state" ON game_state;
DROP POLICY IF EXISTS "Users can view game state" ON game_state;

-- Game State: Allow users to view game state for games they're in or created
CREATE POLICY "Users can view game state"
  ON game_state FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = game_state.game_id
        AND (games.created_by = auth.uid() OR is_user_in_game(game_state.game_id))
    )
  );

-- Game State: Allow inserting for games the user created
CREATE POLICY "Users can insert game state for their games"
  ON game_state FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = game_state.game_id
        AND games.created_by = auth.uid()
    )
  );

-- Game State: Allow updating for games the user is in
CREATE POLICY "Users can update game state"
  ON game_state FOR UPDATE
  USING (is_user_in_game(game_id));

-- Game State: Allow deleting for games the user created
CREATE POLICY "Users can delete game state for their games"
  ON game_state FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = game_state.game_id
        AND games.created_by = auth.uid()
    )
  );

-- Similarly, fix players table to allow host to create players
DROP POLICY IF EXISTS "Users can insert players" ON players;

CREATE POLICY "Users can insert players"
  ON players FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = game_id
        AND (games.created_by = auth.uid() OR is_user_in_game(game_id))
    )
  );

-- Also ensure anonymous users can create games
DROP POLICY IF EXISTS "Users can create games" ON games;

CREATE POLICY "Users can create games"
  ON games FOR INSERT
  WITH CHECK (
    created_by = auth.uid() OR created_by IS NULL
  );

-- Allow game creators to update their games
DROP POLICY IF EXISTS "Users can update their games" ON games;

CREATE POLICY "Users can update games"
  ON games FOR UPDATE
  USING (
    created_by = auth.uid() OR is_user_in_game(id)
  );

-- Allow viewing games for creators and participants
DROP POLICY IF EXISTS "Users can view their games" ON games;

CREATE POLICY "Users can view games"
  ON games FOR SELECT
  USING (
    created_by = auth.uid() OR is_user_in_game(id)
  );
