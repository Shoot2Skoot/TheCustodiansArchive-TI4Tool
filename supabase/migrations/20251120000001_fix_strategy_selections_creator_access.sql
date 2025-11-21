-- Fix strategy_selections RLS to also allow game creators
-- Game creators should be able to manage strategy selections even if they haven't claimed a player slot

DROP POLICY IF EXISTS "Users can insert strategy selections in their games" ON strategy_selections;

-- Allow both players in the game AND game creators to insert
CREATE POLICY "Users can insert strategy selections in their games"
  ON strategy_selections FOR INSERT
  WITH CHECK (
    is_user_in_game(game_id)
    OR is_game_creator(game_id)
  );

-- Also update the UPDATE policy for consistency
DROP POLICY IF EXISTS "Users can update strategy selections in their games" ON strategy_selections;

CREATE POLICY "Users can update strategy selections in their games"
  ON strategy_selections FOR UPDATE
  USING (
    is_user_in_game(game_id)
    OR is_game_creator(game_id)
  )
  WITH CHECK (
    is_user_in_game(game_id)
    OR is_game_creator(game_id)
  );

-- And DELETE policy
DROP POLICY IF EXISTS "Users can delete strategy selections in their games" ON strategy_selections;

CREATE POLICY "Users can delete strategy selections in their games"
  ON strategy_selections FOR DELETE
  USING (
    is_user_in_game(game_id)
    OR is_game_creator(game_id)
  );
