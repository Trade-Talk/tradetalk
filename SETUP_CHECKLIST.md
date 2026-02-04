# Fresh Supabase Setup - Checklist ✅

Use this checklist to ensure everything is set up correctly.

---

## Phase 1: Supabase Setup

### Create New Project
- [ ] Go to https://supabase.com
- [ ] Click "New Project"
- [ ] Enter project name: `tradetalk-community`
- [ ] Save database password securely
- [ ] Choose region
- [ ] Wait for project creation (2-3 min)

### Run Database Migration
- [ ] Open Supabase Dashboard
- [ ] Go to **SQL Editor**
- [ ] Open `/supabase/setup.sql` file
- [ ] Copy entire contents
- [ ] Paste into SQL Editor
- [ ] Click **Run**
- [ ] Verify success message

### Verify Tables Created
- [ ] Go to **Table Editor**
- [ ] See `profiles` table
- [ ] See `posts` table
- [ ] See `post_likes` table
- [ ] See `comments` table
- [ ] See `comment_likes` table
- [ ] See `follows` table
- [ ] See `connection_requests` table

### Verify Storage Buckets
- [ ] Go to **Storage**
- [ ] See `avatars` bucket (public)
- [ ] See `post-images` bucket (public)

### Enable Authentication
- [ ] Go to **Authentication** → **Providers**
- [ ] Verify **Email** is enabled
- [ ] Set "Confirm Email" to **Optional** (for testing)
- [ ] Click **Save**

---

## Phase 2: App Configuration

### Get Credentials
- [ ] Go to **Project Settings** (gear icon)
- [ ] Click **API**
- [ ] Copy **Project URL**
- [ ] Copy **Anon/Public Key**

### Update Environment Variables
- [ ] Open `/.env` file
- [ ] Replace `VITE_SUPABASE_URL` with your URL
- [ ] Replace `VITE_SUPABASE_ANON_KEY` with your key
- [ ] Save file

### Restart Development Server
- [ ] Stop current server (Ctrl+C)
- [ ] Optional: Clear cache `rm -rf node_modules/.vite`
- [ ] Run `npm run dev`
- [ ] Open http://localhost:5173

---

## Phase 3: Functional Testing

### Test Authentication
- [ ] Navigate to `/auth/welcome`
- [ ] Click "Get Started"
- [ ] Fill signup form:
  - Name: Your Name
  - Email: test@example.com
  - Password: test123456
  - User Type: Investor
- [ ] Click "Create Account"
- [ ] Should redirect to feed (no errors)

### Test Post Creation
- [ ] Click white **+** button (bottom right)
- [ ] Type: "Hello TradeTalk! 🚀"
- [ ] Optional: Add an image
- [ ] Click **Post**
- [ ] Should redirect to feed
- [ ] See your post in feed

### Test Comments
- [ ] Click on your post
- [ ] Type a comment: "Testing comments!"
- [ ] Press Send
- [ ] Comment should appear below post

### Test Likes
- [ ] Go back to feed
- [ ] Click heart icon on post
- [ ] Heart should turn red
- [ ] Like count should increase

### Test Profile
- [ ] Click profile tab (bottom nav)
- [ ] See your profile
- [ ] See your posts
- [ ] Profile should display correctly

---

## Phase 4: Verification

### Check Database
- [ ] Go to Supabase **Table Editor**
- [ ] Click **profiles** - should have 1 row (you)
- [ ] Click **posts** - should have 1 row (your post)
- [ ] Click **comments** - should have 1 row (your comment)
- [ ] Click **post_likes** - should have 1 row (your like)

### Check Storage
- [ ] Go to Supabase **Storage**
- [ ] If you uploaded image:
  - [ ] See file in **post-images** bucket
  - [ ] Click file to preview

### Check Logs (if errors)
- [ ] Go to **Logs** → **PostgreSQL**
- [ ] Look for any error messages
- [ ] Address any issues found

---

## Phase 5: Browser Testing

### Test in Chrome/Brave
- [ ] Sign up works
- [ ] Posts appear
- [ ] Comments work
- [ ] Images load

### Test in Firefox
- [ ] Sign up works
- [ ] Posts appear
- [ ] Comments work
- [ ] Images load

### Test on Mobile Browser
- [ ] Open on phone
- [ ] Layout looks good
- [ ] Can create post
- [ ] All features work

---

## Common Issues Checklist

If something doesn't work, check these:

### Posts not appearing
- [ ] Check browser console for errors
- [ ] Verify `getPosts()` returns data in Supabase
- [ ] Check RLS policies are enabled

### Can't create posts
- [ ] Verify user is logged in (check AuthContext)
- [ ] Check `posts` table has INSERT policy
- [ ] Check browser console for error message

### Images not uploading
- [ ] Check storage buckets exist
- [ ] Check storage policies are set
- [ ] Check file size < 5MB

### Comments not working
- [ ] Check `comments` table exists
- [ ] Check RLS policies
- [ ] Verify user_id matches post author

---

## Success Criteria

Your setup is complete when:

✅ All tables created (7 tables)
✅ All storage buckets created (2 buckets)
✅ Can sign up new user
✅ Can create post
✅ Post appears in feed
✅ Can add comment
✅ Can like post
✅ No console errors
✅ All features work smoothly

---

## 🎉 You're Done!

If all checkboxes are checked, your fresh Supabase setup is complete!

**Next steps:**
1. Invite 2-3 friends to test
2. Collect their feedback
3. Fix any bugs they find
4. Deploy to production when ready

---

## 📝 Notes Section

Use this space to track any issues or customizations:

```
Date: __________

Issues found:
- 
- 
- 

Resolved:
- 
- 
- 

Next steps:
- 
- 
- 
```

---

**Setup Time:** ~10-15 minutes
**Ready for:** Beta testing
**Status:** ✅ Production-ready after testing

Good luck! 🚀
