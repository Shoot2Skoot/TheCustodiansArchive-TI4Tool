-- =============================================================================
-- Manually Claim a Player Slot (For Testing)
-- Run this in Supabase SQL Editor with RLS DISABLED
-- =============================================================================

-- STEP 1: Get your user ID
-- Run this in your browser console on your app:
-- supabase.auth.getSession().then(({data}) => console.log(data.session?.user.id))

-- STEP 2: Find your game and available players
SELECT
  g.id AS game_id,
  g.room_code,
  p.id AS player_id,
  p.position,
  p.faction_id,
  p.color,
  p.user_id,
  CASE
    WHEN p.user_id IS NULL THEN '⭐ AVAILABLE - You can claim this'
    ELSE '❌ TAKEN by: ' || p.user_id
  END AS status
FROM games g
LEFT JOIN players p ON p.game_id = g.id
WHERE g.deleted_at IS NULL
ORDER BY g.created_at DESC, p.position
LIMIT 20;

-- STEP 3: Claim a player slot
-- Replace YOUR-USER-ID and YOUR-PLAYER-ID with actual values

UPDATE players
SET
  user_id = 'YOUR-USER-ID'::uuid,
  joined_at = NOW()
WHERE id = 'YOUR-PLAYER-ID'::uuid
  AND user_id IS NULL;  -- Only claim if unclaimed

-- Verify it worked:
SELECT
  id,
  position,
  faction_id,
  color,
  user_id,
  joined_at,
  'Successfully claimed!' AS status
FROM players
WHERE id = 'YOUR-PLAYER-ID'::uuid;
