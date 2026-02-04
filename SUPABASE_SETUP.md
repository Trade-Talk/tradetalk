# Fresh Supabase Setup Guide

## 🚀 Step-by-Step Setup Instructions

### 1. Create New Supabase Project

1. Go to https://supabase.com
2. Click "New Project"
3. Fill in:
   - **Project Name:** `tradetalk-community` (or your choice)
   - **Database Password:** Save this securely!
   - **Region:** Choose closest to your location
4. Click "Create new project"
5. Wait 2-3 minutes for setup to complete

---

### 2. Run the Database Migration

#### Option A: Using Supabase Dashboard (Recommended)

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Copy the **entire contents** of `/supabase/setup.sql`
4. Paste into the SQL editor
5. Click **"Run"** (or press Cmd/Ctrl + Enter)
6. Wait for execution to complete
7. You should see a success message with table counts

#### Option B: Using Supabase CLI

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run the migration
supabase db push
```

---

### 3. Enable Email Authentication

1. Go to **Authentication** → **Providers** (left sidebar)
2. Find **Email** provider
3. Make sure it's **enabled** (toggle should be green)
4. **Confirm Email:** Set to "Optional" for testing (can enable later)
5. Click **Save**

---

### 4. Get Your Project Credentials

1. Go to **Project Settings** (gear icon, bottom left)
2. Click **API** in the left menu
3. Copy these values:

   **Project URL:**
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```
   
   **Anon/Public Key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

### 5. Update Your .env File

1. Open `/tradetalk_community/.env`
2. Update with your new credentials:

```env
# New Supabase Configuration
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# App Configuration
VITE_APP_NAME=TradeTalk
VITE_APP_ENV=development
```

3. Save the file

---

### 6. Restart Your Development Server

```bash
# Stop the current server (Ctrl+C)

# Clear cache (optional but recommended)
rm -rf node_modules/.vite

# Start fresh
npm run dev
```

---

### 7. Verify Setup

#### A. Check Database Tables

1. In Supabase dashboard, go to **Table Editor**
2. You should see these tables:
   - ✅ profiles
   - ✅ posts
   - ✅ post_likes
   - ✅ comments
   - ✅ comment_likes
   - ✅ follows
   - ✅ connection_requests

#### B. Check Storage Buckets

1. Go to **Storage** (left sidebar)
2. You should see:
   - ✅ avatars (public)
   - ✅ post-images (public)

#### C. Test the App

1. Open http://localhost:5173
2. Go to `/auth/welcome`
3. Click "Get Started"
4. Create a test account:
   - Name: Test User
   - Email: test@example.com
   - Password: test123
   - User Type: Investor
5. Click "Create Account"
6. Should redirect to feed with no errors

---

### 8. First Test Post

1. Click the white **+** button (bottom right)
2. Type: "Testing the new setup! 🚀"
3. Click **Post**
4. Should see your post in the feed

---

## ✅ Verification Checklist

Run through this checklist to ensure everything works:

- [ ] Database tables created (7 tables)
- [ ] Storage buckets created (2 buckets)
- [ ] RLS policies enabled
- [ ] Triggers created
- [ ] Environment variables updated
- [ ] App starts without errors
- [ ] Can create account
- [ ] Can sign in
- [ ] Can create post
- [ ] Post appears in feed
- [ ] Can click post to see details
- [ ] Can add comment
- [ ] Comment appears

---

## 🐛 Troubleshooting

### Issue: "Failed to create post"

**Check:**
1. Open browser console (F12)
2. Look for the exact error message
3. Common causes:
   - Wrong Supabase credentials in .env
   - Tables not created properly
   - RLS policies blocking access

**Fix:**
```bash
# Restart server after .env changes
npm run dev
```

### Issue: "Row not found" when signing up

**Check:**
1. Go to Supabase → **Authentication** → **Users**
2. See if user was created
3. Check if profile was created in **Table Editor** → **profiles**

**Fix:**
If user exists but no profile:
1. Go to **SQL Editor**
2. Run:
```sql
SELECT * FROM auth.users;
```
3. Note the user ID
4. Manually create profile:
```sql
INSERT INTO profiles (id, email, full_name, username, user_type)
VALUES ('user-id-here', 'email@example.com', 'Test User', 'testuser', 'investor');
```

### Issue: "Permission denied" errors

**Check RLS Policies:**
1. Go to **Table Editor**
2. Click on a table (e.g., posts)
3. Click **RLS Enabled** should be ON
4. Click **View Policies**
5. Should see policies listed

**Fix:**
Re-run the setup.sql file to recreate policies.

### Issue: Storage upload fails

**Check Storage Policies:**
1. Go to **Storage** → **Policies**
2. Click on bucket (avatars or post-images)
3. Should see 3-4 policies per bucket

**Fix:**
The policies are created in setup.sql. Make sure you ran the entire file.

---

## 🔐 Security Notes

### For Development:
- Email confirmation is optional
- All data is viewable by everyone (public feed)
- Users can only edit/delete their own content

### Before Production:
1. Enable email confirmation
2. Review RLS policies
3. Add rate limiting
4. Enable CAPTCHA for signup
5. Review storage limits

---

## 📊 Database Structure Overview

```
profiles (users)
  ↓
posts (user posts)
  ├── post_likes (likes on posts)
  └── comments (comments on posts)
      └── comment_likes (likes on comments)

profiles
  └── follows (user follows user)
  └── connection_requests (friend requests)

Storage:
  ├── avatars/ (user profile pictures)
  └── post-images/ (images in posts)
```

---

## 🎯 Next Steps After Setup

1. **Test all features:**
   - Create posts ✓
   - Add comments ✓
   - Like posts ✓
   - Upload images ✓
   - Edit profile ✓

2. **Invite beta testers:**
   - Share the URL
   - Ask them to sign up
   - Collect feedback

3. **Monitor usage:**
   - Supabase Dashboard → **Reports**
   - Watch for errors
   - Check database size

4. **Optimize if needed:**
   - Add indexes for slow queries
   - Adjust RLS policies
   - Clean up test data

---

## 📞 Support

If you run into issues:

1. **Check browser console** for errors
2. **Check Supabase logs:**
   - Dashboard → **Logs** → **PostgreSQL**
3. **Check network tab** to see failed requests
4. **Reference:** FIXES_APPLIED.md for common issues

---

**Setup should take 5-10 minutes total.**

Good luck with your fresh start! 🚀
