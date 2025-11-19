-- Fix Games UPDATE RLS Policy
--
-- Problem: UPDATE policy on games might be too restrictive
--
-- Solution: Allow game creators to update their games

-- Drop existing UPDATE policy if it exists
DROP POLICY IF EXISTS "Users can update their games" ON games;
DROP POLICY IF EXISTS "Users can update games" ON games;

-- Create UPDATE policy that allows game creators
CREATE POLICY "Users can update their games"
  ON games FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());
