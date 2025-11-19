-- Fix Players INSERT RLS Policy
--
-- Problem: The WITH CHECK clause was using players.game_id which references
-- the table row, but during INSERT the row doesn't exist yet.
--
-- Solution: Use game_id directly (the column value being inserted)
--
-- This allows game creators to insert players during game setup.

-- Drop the incorrect policy
DROP POLICY IF EXISTS "Users can insert players" ON players;

-- Recreate with correct syntax for INSERT operations
-- In WITH CHECK clauses, reference columns directly, not via table name
CREATE POLICY "Users can insert players"
  ON players FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = game_id  -- Direct column reference, not players.game_id
        AND games.created_by = auth.uid()
    )
  );
