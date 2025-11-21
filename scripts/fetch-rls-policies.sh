#!/bin/bash
# Fetch and display Row Level Security policies from Supabase

echo "Fetching RLS policies from Supabase..."
echo "=========================================="
echo ""

# Run the SQL query using Supabase CLI
npx supabase db execute --file scripts/fetch-rls-policies.sql --output table

echo ""
echo "=========================================="
echo "RLS policies fetched successfully!"
