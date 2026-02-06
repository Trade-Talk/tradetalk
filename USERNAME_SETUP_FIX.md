# Username Setup Flow - Fix Summary

## Problem
After signing up via Google OAuth (or other auth providers), users were getting auto-generated gibberish usernames like `@user_2cccca19` instead of being prompted to choose their own username.

## Root Cause
The database trigger function `handle_new_user()` was automatically generating usernames using:
```sql
COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8))
```

This created usernames like `user_2cccca19` whenever a user didn't have a username in their OAuth metadata.

## Solution Implemented

### 1. Database Migration (`supabase/fix_username_flow.sql`)
- Updated the `handle_new_user()` trigger function to set `username: NULL` instead of auto-generating
- Now users MUST choose their own username via the UI
- Optionally includes a query to reset existing gibberish usernames to NULL

**To apply this fix:**
```bash
# Run this in your Supabase SQL Editor
psql -h your-db-host -d postgres -f supabase/fix_username_flow.sql
```

Or copy the contents of `fix_username_flow.sql` and run it in the Supabase Dashboard SQL Editor.

### 2. Updated Auth Callback (`src/pages/auth/AuthCallback.jsx`)
**Changes:**
- Better logging for debugging
- Uses `maybeSingle()` instead of `single()` to avoid errors when profile doesn't exist
- Waits 500ms after getting session to let database trigger complete
- Properly redirects to `/auth/setup-username` when no username exists
- Redirects to home when username exists

**Flow:**
1. User completes OAuth
2. Callback checks if profile exists
3. If profile has no username → redirect to setup
4. If profile has username → redirect to home

### 3. Improved Username Setup Page (`src/pages/auth/SetupUsername.jsx`)
**Enhancements:**
- Checks authentication on mount
- Prevents access if not logged in
- Redirects to home if username already exists
- Debounced username availability checking (300ms delay)
- Better validation:
  - 3-20 characters
  - Only lowercase, numbers, underscores
  - Real-time availability checking
  - Removes @ if user types it
- Better error messages
- Improved UX with loading states

### 4. Protected Routes (`src/App.jsx`)
**New Setup:**
- Added `SetupRoute` component specifically for username setup
  - Requires user to be logged in
  - Doesn't redirect logged-in users away (unlike PublicRoute)
  
- Updated `ProtectedRoute` component
  - Now checks if user has a username
  - Redirects to setup if username is missing
  - Prevents access to app without username

## User Flow After Fix

### New Signup (OAuth)
1. User clicks "Sign in with Google"
2. OAuth completes → redirected to `/auth/callback`
3. Profile created with `username: NULL`
4. User redirected to `/auth/setup-username`
5. User chooses username
6. User redirected to home feed

### New Signup (Email/Password)
Same flow as above - all signup methods now go through username setup.

### Existing User (with username)
1. User signs in
2. Callback checks profile
3. Username exists → direct to home

### Existing User (gibberish username)
After running the database migration to reset gibberish usernames:
1. User signs in
2. Profile has `username: NULL`
3. Redirected to `/auth/setup-username`
4. User picks a proper username
5. Can access app

## Testing Checklist

- [ ] New Google signup → username setup page appears
- [ ] Username validation works (min 3 chars, max 20)
- [ ] Username availability checking works
- [ ] Cannot submit taken username
- [ ] Cannot submit invalid characters
- [ ] After setting username → redirected to home
- [ ] Existing users with usernames → direct to home
- [ ] Cannot access app pages without username
- [ ] Cannot access setup page when not logged in
- [ ] Real-time validation feedback (green check, red X)

## Files Modified

1. `supabase/fix_username_flow.sql` (NEW)
2. `src/pages/auth/AuthCallback.jsx`
3. `src/pages/auth/SetupUsername.jsx`
4. `src/App.jsx`

## Next Steps

1. **Apply the database migration** in Supabase
2. Test the flow with a new Google signup
3. (Optional) Reset existing gibberish usernames by uncommenting the UPDATE query in the migration
4. Consider adding:
   - Display name / bio setup on the same page
   - Skip option for advanced users
   - Profile photo upload during onboarding
   - Welcome tour after first login

## Notes

- The username field in the database is already set up with a UNIQUE constraint, so duplicates are impossible
- RLS policies already allow users to update their own profiles
- The flow works for ALL auth providers (Google, Apple, Email/Password)
- Users can still change their username later in settings (if you implement that feature)
