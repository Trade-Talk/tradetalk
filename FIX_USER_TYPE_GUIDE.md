# Fix: User Type Registration Issue

## Problem
Users registering as "investor" are ending up as "advisor" in their profiles.

## Root Cause
The database trigger `handle_new_user()` that automatically creates user profiles when someone signs up was NOT reading the `user_type` from the signup metadata. It only set:
- id
- email  
- full_name
- username

So the `user_type` column was using the database default value of `'investor'`.

Additionally, the database constraint only allowed `'investor'` and `'advisor'`, but the signup form has a third option: `'learner'`.

## The Fix

### Option 1: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Create a new query
4. Copy and paste the contents of `FIX_USER_TYPE.sql`
5. Click **Run** button
6. You should see "Success. No rows returned"

### Option 2: Using Supabase CLI
```bash
chmod +x apply-user-type-fix.sh
./apply-user-type-fix.sh
```

## What the Fix Does

1. **Updates the CHECK constraint** to allow 3 user types instead of 2:
   - `investor`
   - `advisor`  
   - `learner`

2. **Updates the trigger function** to read `user_type` from signup metadata:
   ```sql
   user_type: COALESCE(NEW.raw_user_meta_data->>'user_type', 'investor')
   ```

3. **Recreates the trigger** with the updated function

## Testing the Fix

After applying the migration:

1. **Create a new test account**:
   - Go to your signup page
   - Select "Investor" as user type
   - Complete registration

2. **Verify in database**:
   ```sql
   SELECT id, email, full_name, user_type FROM profiles 
   ORDER BY created_at DESC LIMIT 5;
   ```

3. **Check in your app**: Your profile page should now correctly show "Investor" (or whatever you selected)

## Fixing Existing Accounts

If you already have test accounts with the wrong user_type, you can fix them:

### Via Supabase Dashboard:
1. Go to **Table Editor**
2. Select **profiles** table
3. Find your user row
4. Click the **user_type** cell
5. Change to the correct value (`investor`, `advisor`, or `learner`)
6. Changes save automatically

### Via SQL:
```sql
-- Replace 'your-user-id' with your actual user ID
UPDATE profiles 
SET user_type = 'investor' 
WHERE id = 'your-user-id';
```

## How User Type is Set During Signup

The flow is now:
1. User fills signup form and selects user type
2. Frontend calls `signUp(email, password, metadata)` where metadata includes `user_type`
3. Supabase creates auth user with metadata
4. Database trigger fires and reads `user_type` from `raw_user_meta_data`
5. Profile is created with correct user_type

## Files Created
- `supabase/migrations/003_fix_user_type_trigger.sql` - Migration file
- `FIX_USER_TYPE.sql` - Standalone SQL file  
- `apply-user-type-fix.sh` - Shell script to apply fix
- `FIX_USER_TYPE_GUIDE.md` - This file
