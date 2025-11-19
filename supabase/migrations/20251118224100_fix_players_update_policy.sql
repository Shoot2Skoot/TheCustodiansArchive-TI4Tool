-- Fix Players UPDATE RLS Policy
--
-- Problem: UPDATE policy on players might be too restrictive
--
-- Solution: Allow game creators and players in the game to update players

-- Drop existing UPDATE policy if it exists
DROP POLICY IF EXISTS "Users can update players in their games" ON players;
DROP POLICY IF EXISTS "Users can update players" ON players;

-- Create UPDATE policy that allows game creators and players in the game
CREATE POLICY "Users can update players"
  ON players FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = players.game_id
        AND (games.created_by = auth.uid() OR is_user_in_game(players.game_id))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = players.game_id
        AND (games.created_by = auth.uid() OR is_user_in_game(players.game_id))
    )
  );
