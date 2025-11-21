-- =============================================================================
-- RLS Policy Checker - Run this in Supabase SQL Editor
-- =============================================================================

-- 1. Check all RLS policies on strategy_selections table
SELECT
  policyname AS "Policy Name",
  CASE cmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    WHEN '*' THEN 'ALL'
    ELSE cmd
  END AS "Command",
  permissive AS "Permissive",
  roles AS "Roles",
  qual AS "USING Expression",
  with_check AS "WITH CHECK Expression"
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'strategy_selections'
ORDER BY policyname;

-- =============================================================================

-- 2. Check if RLS is enabled on strategy_selections
SELECT
  schemaname,
  tablename,
  rowsecurity AS "RLS Enabled"
FROM pg_tables
WHERE tablename = 'strategy_selections';

-- =============================================================================

-- 3. Test if is_user_in_game() function exists and works
SELECT
  proname AS "Function Name",
  prosrc AS "Function Source"
FROM pg_proc
WHERE proname = 'is_user_in_game';

-- =============================================================================

-- 4. Test if is_game_creator() function exists and works
SELECT
  proname AS "Function Name",
  prosrc AS "Function Source"
FROM pg_proc
WHERE proname = 'is_game_creator';

-- =============================================================================

-- 5. Check ALL RLS policies across all tables (for reference)
SELECT
  tablename AS "Table",
  policyname AS "Policy Name",
  CASE cmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    WHEN '*' THEN 'ALL'
    ELSE cmd
  END AS "Command",
  permissive AS "Permissive",
  qual AS "USING",
  with_check AS "WITH CHECK"
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =============================================================================

-- 6. Test INSERT permission directly (replace with your actual user ID and game ID)
-- This will show you if you can insert based on current policies
-- NOTE: This is a dry-run check, it won't actually insert data

-- First, get your current user ID:
SELECT auth.uid() AS "My User ID";

-- Then test if you're in a game (replace 'YOUR-GAME-ID' with actual game ID):
-- SELECT is_user_in_game('YOUR-GAME-ID'::uuid) AS "Am I in game?";
-- SELECT is_game_creator('YOUR-GAME-ID'::uuid) AS "Did I create game?";
