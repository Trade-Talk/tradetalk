
# 🚨 URGENT: Run This Database Migration NOW

## What's Happening

When you sign up, you're being taken straight to the home page without seeing the username setup. This is because **the database trigger is still auto-generating usernames** before the app code can redirect you to the username setup page.

## The Fix (3 Minutes)

### 1️⃣ Open Supabase SQL Editor

Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

### 2️⃣ Copy This Entire SQL Code

```sql
-- =====================================================
-- FIX: Prevent auto-generation of gibberish usernames
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
```

### 3️⃣ Click "RUN" in Supabase

You should see:
```
✓ DROP TRIGGER
✓ DROP FUNCTION  
✓ CREATE FUNCTION
✓ CREATE TRIGGER
```

### 4️⃣ Clean Up Test Users

Delete any users you created during testing:

```sql
-- See all users
SELECT id, email, username FROM profiles;

-- Delete your test user (replace with your test email)
DELETE FROM auth.users WHERE email = 'your-test-email@gmail.com';
```

### 5️⃣ Test Fresh Signup

1. Sign out of your app
2. Clear browser cookies (Cmd+Shift+Delete on Chrome)
3. Sign up with Google using a NEW email
4. **You should now see the username setup page!** ✅

## Before vs After

### BEFORE (Current - Broken):
```
Sign up → DB creates profile with username "user_abc123" → Home page ❌
```

### AFTER (Fixed):
```
Sign up → DB creates profile with username NULL → Username setup page ✅
```

## If It Still Doesn't Work

1. **Verify migration ran**:
```sql
SELECT prosrc FROM pg_proc WHERE proname = 'handle_new_user';
```
Should contain `NULL  -- Don't auto-generate username`

2. **Clear browser completely**:
   - Chrome: Settings → Privacy → Clear browsing data → All time
   - Or use Incognito mode

3. **Use a totally fresh email** that has never signed up before

4. **Check browser console** for errors (F12 → Console tab)

## Why This Is Critical

**The code changes are already done** ✅
- ✅ AuthCallback.jsx - checks for username and redirects
- ✅ SetupUsername.jsx - username setup page  
- ✅ App.jsx - route protection

**But they won't work until you update the database trigger!**

The database is the FIRST thing that runs when a user signs up. If the database creates a username, the app thinks setup is complete and goes to home.

## TL;DR

1. Copy the SQL above
2. Paste in Supabase SQL Editor  
3. Click RUN
4. Delete test users
5. Try fresh signup
6. Should work! 🎉

---

**This is the SQL file I created earlier:** `supabase/fix_username_flow.sql`

It's the same SQL shown above. You can also copy from that file.
