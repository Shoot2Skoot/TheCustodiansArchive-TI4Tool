-- Fix Players INSERT RLS Policy Using IN Clause
--
-- Problem: PostgreSQL auto-qualifies game_id as players.game_id in WITH CHECK
-- even when we write just game_id, causing the policy to fail during INSERT
--
-- Solution: Use IN clause with subquery instead of EXISTS to avoid
-- the auto-qualification behavior

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Users can insert players" ON players;

-- Create policy using IN clause (avoids auto-qualification issue)
CREATE POLICY "Users can insert players"
  ON players FOR INSERT
  WITH CHECK (
    game_id IN (
      SELECT id FROM games WHERE created_by = auth.uid()
    )
  );
