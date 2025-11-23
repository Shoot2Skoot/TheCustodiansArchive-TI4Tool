-- Quick test to verify leader_unlocks table exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'leader_unlocks'
ORDER BY ordinal_position;
