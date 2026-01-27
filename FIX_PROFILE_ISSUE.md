# 🔍 Database Already Exists!

## Good News
Your database tables already exist! The error `policy "Public profiles are viewable by everyone" for table "profiles" already exists` means the schema was already set up.

## The Real Issue
Your **existing users don't have profiles** created for them.

## Quick Fix (1 minute)

### Option 1: Sign Out and Sign Up Again (Easiest)

1. Sign out of your app
2. Sign up with a **NEW email address**
3. The profile will auto-create via the database trigger
4. Everything should work ✅

### Option 2: Fix Existing Users (If you want to keep your current account)

1. **Open Supabase SQL Editor:**
   https://supabase.com/dashboard/project/irwfypgyyxvvjsxcrufs/sql/new

2. **Run this SQL** (it's in `fix-missing-profiles.sql`):

```sql
-- Create profiles for users that are missing them
INSERT INTO profiles (id, email, full_name, username, user_type)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', 'User'),
  COALESCE(u.raw_user_meta_data->>'username', 'user_' || substr(u.id::text, 1, 8)),
  'investor'
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
```

3. **Refresh your app** - profile should now load ✅

## Verify It Worked

Run this in SQL Editor to check:

```sql
-- See all users and their profiles
SELECT 
  u.email,
  p.full_name,
  p.username,
  p.user_type,
  CASE WHEN p.id IS NULL THEN '❌ NO PROFILE' ELSE '✅ HAS PROFILE' END as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id;
```

All users should show "✅ HAS PROFILE"

## Why This Happened

The database trigger `on_auth_user_created` should auto-create profiles, but:
- It only runs for NEW signups
- Existing users created before the trigger don't have profiles
- The trigger is now working, so new signups will be fine

## What About Signals?

The signals table exists, but it's probably empty. To see signals:

1. **Make yourself an advisor:**
   ```sql
   UPDATE profiles 
   SET user_type = 'advisor' 
   WHERE email = 'your-email@example.com';
   ```

2. **Sign out and sign in again** (so the app sees you're an advisor)

3. **Create a signal** using the + button in the app

4. **View it in the feed** 🎉

## Summary

✅ Database is set up  
✅ Tables exist  
✅ Triggers are working  
❌ Your current user needs a profile  

**Quick fix:** Sign up with a new email, OR run the SQL above to fix your existing account.
