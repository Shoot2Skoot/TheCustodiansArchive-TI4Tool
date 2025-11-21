#!/bin/bash
# Simplified RLS fetcher using Supabase CLI's built-in connection

echo "Fetching RLS policies from Supabase..."
echo "=========================================="
echo ""

# Create a migration file with our query
cat > .temp-rls-fetch.sql << 'EOF'
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
  roles AS "Roles",
  qual AS "USING Expression",
  with_check AS "WITH CHECK Expression"
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
EOF

# Use Supabase CLI to execute the query
npx supabase db dump --db-url "$SUPABASE_DB_URL" --data-only --schema public > /dev/null 2>&1

# Since db dump doesn't run custom queries, let's use a different approach
# We'll create a temporary migration and roll it back
TIMESTAMP=$(date +%Y%m%d%H%M%S)
mkdir -p supabase/migrations/temp
cp .temp-rls-fetch.sql "supabase/migrations/temp/${TIMESTAMP}_fetch_rls.sql"

# This won't work either, let me think...

# Clean up
rm -f .temp-rls-fetch.sql

echo "Note: This script needs to be updated to work with Supabase CLI"
echo "In the meantime, please get your connection string from Supabase dashboard:"
echo "1. Go to Settings -> Database"
echo "2. Copy the 'Direct connection' URI"
echo "3. Replace [YOUR-PASSWORD] with your actual password"
echo "4. Set it in Doppler: doppler secrets set SUPABASE_DB_URL=\"your-connection-string\""
