-- Fetch all Row Level Security policies for The Custodians Archive
-- This query retrieves all RLS policies with their details for debugging

SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual AS using_expression,
  with_check AS with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
