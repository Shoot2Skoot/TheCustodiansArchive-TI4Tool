-- Fix Players SELECT RLS Policy to Allow Game Creators
--
-- Problem: The SELECT policy only allows users who are already players in the game
-- to view players. This creates a chicken-and-egg problem during INSERT - you can't
-- insert a player because you need to already be a player to pass the SELECT check.
--
-- Solution: Allow both game creators AND players in the game to view players

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Users can view players in their games" ON players;

-- Create new SELECT policy that allows both game creators and players
CREATE POLICY "Users can view players in their games"
  ON players FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = players.game_id
        AND (games.created_by = auth.uid() OR is_user_in_game(players.game_id))
    )
  );
