-- Fix Players Table RLS Policy
-- Allow game creators to add players without being in the game yet

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Users can insert players" ON players;
DROP POLICY IF EXISTS "Users can update players in their games" ON players;

-- Players: Allow inserting if you created the game (don't require being a player yet)
CREATE POLICY "Users can insert players"
  ON players FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = players.game_id
        AND games.created_by = auth.uid()
    )
  );

-- Players: Allow updating if you're in the game OR created it
CREATE POLICY "Users can update players"
  ON players FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = players.game_id
        AND (games.created_by = auth.uid() OR is_user_in_game(players.game_id))
    )
  );

-- Players: Allow deleting if you created the game
CREATE POLICY "Users can delete players"
  ON players FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = players.game_id
        AND games.created_by = auth.uid()
    )
  );
