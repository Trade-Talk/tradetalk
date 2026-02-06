-- =====================================================
-- FIX: Prevent auto-generation of gibberish usernames
-- =====================================================
-- This migration fixes the user signup flow to require
-- users to set their own username instead of getting
-- a gibberish auto-generated one like @user_2cccca19
-- =====================================================

-- Drop the old trigger that auto-generates usernames
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create new function that does NOT auto-generate username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create profile if it doesn't exist
  -- Do NOT set a username - let user choose their own
  INSERT INTO public.profiles (id, email, full_name, avatar_url, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    ),
    NULL  -- Don't auto-generate username - user will set it
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create trigger with new function
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- Optional: Clean up existing gibberish usernames
-- =====================================================
-- Uncomment the following if you want to reset existing
-- auto-generated usernames to NULL so users are prompted
-- to choose a new username on next login:

-- UPDATE profiles 
-- SET username = NULL 
-- WHERE username LIKE 'user_%' 
--   AND length(username) = 13  -- user_ + 8 char UUID
--   AND username ~ '^user_[a-f0-9]{8}$';

-- =====================================================
-- MIGRATION COMPLETE!
-- =====================================================
