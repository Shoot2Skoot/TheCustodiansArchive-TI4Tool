-- =============================================================================
-- Test RLS Policies with Auth Context - Run in Supabase SQL Editor
-- =============================================================================

-- IMPORTANT: Make sure "RLS disabled" toggle is OFF in the SQL Editor
-- so that RLS policies are actually enforced during testing

-- =============================================================================
-- STEP 1: Get a real user ID from your auth.users table
-- =============================================================================

SELECT
  id AS "User ID",
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- Copy one of the user IDs from above, then use it below

-- =============================================================================
-- STEP 2: Set the auth context to that user
-- Replace 'YOUR-USER-ID-HERE' with actual UUID from step 1
-- =============================================================================

-- This sets the session to act as that user:
SET request.jwt.claims = '{"sub": "YOUR-USER-ID-HERE"}';

-- Verify it worked:
SELECT auth.uid() AS "Current User ID (should match)";

-- =============================================================================
-- STEP 3: Now test if the user can access a game
-- Replace 'YOUR-GAME-ID-HERE' with actual game UUID
-- =============================================================================

-- Check if user is in the game:
SELECT is_user_in_game('YOUR-GAME-ID-HERE'::uuid) AS "Am I in this game?";

-- Check if user created the game:
SELECT is_game_creator('YOUR-GAME-ID-HERE'::uuid) AS "Did I create this game?";

-- =============================================================================
-- STEP 4: Test INSERT into strategy_selections
-- This will actually attempt the insert with RLS enabled
-- =============================================================================

-- Get a game ID and player ID to test with:
SELECT
  g.id AS game_id,
  p.id AS player_id,
  p.user_id,
  g.created_by
FROM games g
LEFT JOIN players p ON p.game_id = g.id
WHERE g.deleted_at IS NULL
ORDER BY g.created_at DESC
LIMIT 5;

-- Now try to insert (replace the IDs):
-- NOTE: This will fail if RLS blocks it, which is what we want to test!
/*
INSERT INTO strategy_selections (
  game_id,
  round_number,
  player_id,
  strategy_card_id,
  selection_order,
  trade_good_bonus,
  primary_action_used
) VALUES (
  'YOUR-GAME-ID'::uuid,
  1,
  'YOUR-PLAYER-ID'::uuid,
  1,
  1,
  0,
  false
);
*/

-- =============================================================================
-- ALTERNATIVE: Just check the policies without auth context
-- =============================================================================

-- Run this with "RLS disabled" toggle ON to see the policies:
SELECT
  policyname AS "Policy Name",
  CASE cmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    WHEN '*' THEN 'ALL'
  END AS "Command",
  qual AS "USING",
  with_check AS "WITH CHECK"
FROM pg_policies
WHERE tablename = 'strategy_selections'
ORDER BY policyname;
