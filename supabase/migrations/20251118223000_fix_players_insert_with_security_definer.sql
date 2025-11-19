-- Fix Players INSERT RLS Policy Using Security Definer Function
--
-- Problem: The policy might not be able to properly query the games table
-- due to RLS context or permissions issues
--
-- Solution: Create a security definer function that can reliably check
-- if the current user created the game

-- Create a security definer function to check if user created the game
CREATE OR REPLACE FUNCTION user_created_game(game_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM games
    WHERE id = game_uuid
      AND created_by = auth.uid()
  );
END;
$$;

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Users can insert players" ON players;

-- Create policy using security definer function
CREATE POLICY "Users can insert players"
  ON players FOR INSERT
  WITH CHECK (
    user_created_game(game_id)
  );
