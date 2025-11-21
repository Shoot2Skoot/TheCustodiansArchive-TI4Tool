-- Fix strategy_selections RLS policy to allow inserts
-- The previous policy used FOR ALL with only USING clause, which doesn't allow inserts

-- Drop the old policy
DROP POLICY IF EXISTS "Users can access strategy selections" ON strategy_selections;

-- Create separate policies for better clarity and proper INSERT support
CREATE POLICY "Users can view strategy selections in their games"
  ON strategy_selections FOR SELECT
  USING (is_user_in_game(game_id));

CREATE POLICY "Users can insert strategy selections in their games"
  ON strategy_selections FOR INSERT
  WITH CHECK (is_user_in_game(game_id));

CREATE POLICY "Users can update strategy selections in their games"
  ON strategy_selections FOR UPDATE
  USING (is_user_in_game(game_id))
  WITH CHECK (is_user_in_game(game_id));

CREATE POLICY "Users can delete strategy selections in their games"
  ON strategy_selections FOR DELETE
  USING (is_user_in_game(game_id));
