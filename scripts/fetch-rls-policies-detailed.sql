-- Detailed RLS policy information with formatted output
-- This provides comprehensive information about each policy

WITH policy_details AS (
  SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    CASE cmd
      WHEN 'r' THEN 'SELECT'
      WHEN 'a' THEN 'INSERT'
      WHEN 'w' THEN 'UPDATE'
      WHEN 'd' THEN 'DELETE'
      WHEN '*' THEN 'ALL'
      ELSE cmd
    END AS command,
    qual AS using_expression,
    with_check AS with_check_expression,
    -- Check if RLS is enabled on the table
    (SELECT relrowsecurity FROM pg_class WHERE oid = (schemaname || '.' || tablename)::regclass) AS rls_enabled
  FROM pg_policies
  WHERE schemaname = 'public'
)
SELECT
  tablename AS "Table",
  policyname AS "Policy Name",
  command AS "Command",
  permissive AS "Permissive",
  roles AS "Roles",
  COALESCE(using_expression, '(none)') AS "USING",
  COALESCE(with_check_expression, '(none)') AS "WITH CHECK"
FROM policy_details
ORDER BY tablename, policyname;
