-- Fix Game State UPDATE RLS Policy
--
-- Problem: UPDATE policy on game_state is likely too restrictive or missing,
-- causing "Cannot coerce the result to a single JSON object" error when
-- no rows are returned from the UPDATE operation.
--
-- Solution: Allow game creators to update game state

-- Drop existing UPDATE policy if it exists
DROP POLICY IF EXISTS "Users can update game state for their games" ON game_state;
DROP POLICY IF EXISTS "Users can update game state" ON game_state;

-- Create UPDATE policy that allows game creators and players
CREATE POLICY "Users can update game state"
  ON game_state FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = game_state.game_id
        AND games.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = game_state.game_id
        AND games.created_by = auth.uid()
    )
  );
