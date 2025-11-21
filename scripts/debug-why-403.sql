-- =============================================================================
-- Debug why you're getting 403 on strategy_selections INSERT
-- Run this in Supabase SQL Editor with RLS DISABLED
-- =============================================================================

-- STEP 1: Find your most recent game
SELECT
  g.id AS game_id,
  g.room_code,
  g.created_by AS game_creator_user_id,
  g.status,
  g.created_at
FROM games g
WHERE g.deleted_at IS NULL
ORDER BY g.created_at DESC
LIMIT 5;

-- Copy a game_id from above, then use it below

-- =============================================================================
-- STEP 2: Check players in that game
-- Replace 'YOUR-GAME-ID' with the game_id from step 1
-- =============================================================================

SELECT
  p.id AS player_id,
  p.user_id AS player_user_id,
  p.position,
  p.faction_id,
  p.display_name,
  p.joined_at,
  CASE
    WHEN p.user_id IS NULL THEN 'UNCLAIMED - No user_id set'
    ELSE 'CLAIMED by user: ' || p.user_id
  END AS status
FROM players p
WHERE p.game_id = 'YOUR-GAME-ID'::uuid
ORDER BY p.position;

-- =============================================================================
-- STEP 3: Get YOUR current user ID from the application
-- You need to get this from your browser's localStorage or from the app
-- =============================================================================

-- Check in your browser console:
-- localStorage.getItem('supabase.auth.token')
-- Or look at the decoded JWT token

-- Then check if YOU are in the game:
SELECT
  p.id AS player_id,
  p.user_id,
  p.faction_id,
  'You ARE in this game!' AS result
FROM players p
WHERE p.game_id = 'YOUR-GAME-ID'::uuid
  AND p.user_id = 'YOUR-USER-ID'::uuid;  -- Replace with your actual user ID

-- If this returns no rows, that's your problem - you're not in the game!

-- =============================================================================
-- STEP 4: Check if you're the game creator
-- =============================================================================

SELECT
  g.id AS game_id,
  g.created_by,
  CASE
    WHEN g.created_by = 'YOUR-USER-ID'::uuid THEN 'YES - You created this game'
    ELSE 'NO - Someone else created this game'
  END AS are_you_creator
FROM games g
WHERE g.id = 'YOUR-GAME-ID'::uuid;

-- =============================================================================
-- STEP 5: The problem and solution
-- =============================================================================

/*
If you're getting a 403 error, it means BOTH of these are false:
1. You don't have a player record with your user_id in this game
2. You're not the game creator (created_by doesn't match your user_id)

SOLUTION:
You need to either:
A) Make sure you have a player record with YOUR user_id in the players table
B) Or make sure the game.created_by field matches YOUR user_id

To fix it, claim a player slot:
*/

-- Update a player record to claim it as yours:
/*
UPDATE players
SET user_id = 'YOUR-USER-ID'::uuid,
    joined_at = NOW()
WHERE game_id = 'YOUR-GAME-ID'::uuid
  AND position = 1  -- Or whichever position you want
  AND user_id IS NULL;  -- Only claim unclaimed slots
*/
