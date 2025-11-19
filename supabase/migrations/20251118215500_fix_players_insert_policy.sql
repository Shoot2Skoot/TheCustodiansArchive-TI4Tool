-- Fix Players INSERT Policy
-- The issue was referencing players.game_id in WITH CHECK clause
-- During INSERT, the row doesn't exist yet, so we must use game_id directly

-- Drop the incorrect INSERT policy
DROP POLICY IF EXISTS "Users can insert players" ON players;

-- Recreate with correct column reference (game_id not players.game_id)
CREATE POLICY "Users can insert players"
  ON players FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = game_id  -- Direct reference to NEW row value
        AND games.created_by = auth.uid()
    )
  );
