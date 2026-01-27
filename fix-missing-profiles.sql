-- Fix missing profiles for existing users
-- Run this in Supabase SQL Editor if you have users without profiles

-- First, check which users are missing profiles
SELECT 
  u.id,
  u.email,
  u.created_at,
  CASE WHEN p.id IS NULL THEN '❌ MISSING PROFILE' ELSE '✅ Has Profile' END as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- Create profiles for any users that are missing them
INSERT INTO profiles (id, email, full_name, username, user_type)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', 'User'),
  COALESCE(u.raw_user_meta_data->>'username', 'user_' || substr(u.id::text, 1, 8)),
  COALESCE((u.raw_user_meta_data->>'user_type')::text, 'investor')
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Verify all users now have profiles
SELECT 
  u.id,
  u.email,
  p.full_name,
  p.username,
  p.user_type,
  CASE WHEN p.id IS NULL THEN '❌ STILL MISSING' ELSE '✅ Fixed' END as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;
