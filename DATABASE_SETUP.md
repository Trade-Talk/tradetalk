# Database Setup Guide

## Problem
Your Supabase database doesn't have the required tables yet. That's why:
- Profile loading fails
- No signals are showing
- The app can't store any data

## Quick Fix (Recommended)

### Option 1: Use Supabase Dashboard (Easiest)

1. **Open Supabase SQL Editor:**
   https://supabase.com/dashboard/project/irwfypgyyxvvjsxcrufs/sql/new

2. **Copy the entire contents of:**
   `supabase/migrations/001_initial_schema.sql`

3. **Paste into the SQL editor and click "Run"**

4. **Verify tables were created:**
   - Go to Table Editor: https://supabase.com/dashboard/project/irwfypgyyxvvjsxcrufs/editor
   - You should see: `profiles`, `posts`, `signals`, `follows`, etc.

### Option 2: Use Supabase CLI

```bash
# Make the script executable
chmod +x setup-database.sh

# Link to your project (if not already done)
supabase link --project-ref irwfypgyyxvvjsxcrufs

# Run the setup
./setup-database.sh
```

## What Gets Created

The migration creates these tables:

### Core Tables
- ✅ **profiles** - User profiles (auto-created on signup)
- ✅ **posts** - Social media posts
- ✅ **post_likes** - Post likes
- ✅ **comments** - Comments on posts
- ✅ **comment_likes** - Comment likes
- ✅ **follows** - Follow relationships

### Trading Features
- ✅ **signals** - Trading signals from advisors
- ✅ **advisor_stats** - Advisor performance metrics
- ✅ **advisor_verifications** - Advisor verification requests
- ✅ **connection_requests** - Connection requests between users

### Auto-Features
- ✅ **Auto-create profile** - Trigger that creates profile when user signs up
- ✅ **Auto-update timestamps** - Triggers to update `updated_at` fields
- ✅ **Row Level Security (RLS)** - Security policies on all tables

## After Setup

1. **Test signup:**
   ```bash
   npm run dev
   ```
   - Go to http://localhost:5173
   - Sign up with email/password
   - Profile should be auto-created

2. **Verify in database:**
   - Check Table Editor to see your profile was created

3. **Create test data (optional):**
   - Create a post
   - If you're an advisor, create a signal
   - Test the feed

## Troubleshooting

### "Profile not found" error
- Run the migration again
- Check if `profiles` table exists
- Try signing out and signing in again

### "Signals table doesn't exist"
- The migration wasn't run successfully
- Check the SQL editor for errors
- Make sure you ran the ENTIRE migration file

### Still having issues?
1. Check Supabase logs: https://supabase.com/dashboard/project/irwfypgyyxvvjsxcrufs/logs/explorer
2. Verify your API keys in `.env` match the dashboard
3. Make sure you're connected to the right project

## Quick Test

After running the migration, test with this SQL:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Should return: profiles, posts, signals, follows, etc.
```
