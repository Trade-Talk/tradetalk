-- ============================================================
-- FIX: User Type Registration Issue
-- ============================================================
-- Problem: Users registering as "investor" are showing up as "advisor"
-- Root Cause: The database trigger doesn't read user_type from metadata
-- ============================================================

-- Step 1: Allow 'learner' as a valid user type
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_user_type_check;

ALTER TABLE profiles 
ADD CONSTRAINT profiles_user_type_check 
CHECK (user_type IN ('investor', 'advisor', 'learner'));

-- Step 2: Update the trigger to read user_type from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, username, user_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'investor')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Optional: Fix existing test accounts (if needed)
-- ============================================================
-- Uncomment the following lines if you want to update existing users
-- Replace 'your-user-id-here' with the actual user ID

-- UPDATE profiles 
-- SET user_type = 'investor' 
-- WHERE id = 'your-user-id-here';

-- ============================================================
-- Verification Query
-- ============================================================
-- Run this to check if the fix worked:
-- SELECT id, email, full_name, user_type FROM profiles;
