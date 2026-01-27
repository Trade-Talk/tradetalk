-- Check what tables exist and their structure
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE columns.table_name = tables.table_name) as column_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check if profiles table has data
SELECT COUNT(*) as profile_count FROM profiles;

-- Check if signals table exists and has data
SELECT COUNT(*) as signal_count FROM signals;

-- Check current user (if any)
SELECT 
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- Check if profiles exist for users
SELECT 
  u.id,
  u.email,
  p.full_name,
  p.username,
  p.user_type,
  p.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 5;
