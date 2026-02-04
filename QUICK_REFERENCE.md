# TradeTalk - Quick Reference

## 🗂️ File Organization

### Important Files to Know:

**Database & Auth:**
- `/supabase/setup.sql` - Complete database schema
- `/src/lib/supabase-mvp.js` - Database functions (fixed)
- `/src/contexts/AuthContext.jsx` - Authentication logic

**Main Pages:**
- `/src/pages/FeedPageIntegrated.jsx` - Home feed (fixed)
- `/src/pages/CreatePostImproved.jsx` - Create posts (fixed)
- `/src/pages/PostDetail.jsx` - View post & comments
- `/src/pages/auth/SignUp.jsx` - User registration
- `/src/pages/auth/SignIn.jsx` - User login

**Components:**
- `/src/components/posts/PostCard.jsx` - Post display (fixed)
- `/src/components/MobileLayout.jsx` - Bottom navigation

**Config:**
- `/.env` - Supabase credentials
- `/src/App.jsx` - Routing

**Documentation:**
- `/SUPABASE_SETUP.md` - Fresh setup guide
- `/FIXES_APPLIED.md` - What was fixed
- `/TESTING_GUIDE.md` - Testing checklist
- `/QUICKSTART.md` - Quick start for devs

---

## 📊 Database Tables Quick Ref

```sql
-- Core tables (all working)
profiles         -- User accounts
posts            -- User posts (text + optional image)
post_likes       -- Likes on posts
comments         -- Comments on posts
comment_likes    -- Likes on comments
follows          -- User following relationships
connection_requests -- Friend requests

-- Storage buckets
avatars         -- User profile pictures
post-images     -- Images in posts
```

---

## 🔑 Key Functions Reference

### supabase-mvp.js

```javascript
// Auth
authHelpers.signUp(email, password, metadata)
authHelpers.signIn(email, password)
authHelpers.signOut()
authHelpers.getSession()
authHelpers.getUser()

// Users
db.getUserProfile(userId)
db.updateUserProfile(userId, updates)
db.searchUsers(query)

// Posts
db.getPosts(limit, offset)          // ✅ Fixed
db.getPostById(postId)              // ✅ Fixed
db.createPost(post, stockSymbols)   // ✅ Fixed - no category
db.deletePost(postId)

// Likes
db.likePost(userId, postId)
db.unlikePost(userId, postId)

// Comments
db.getComments(postId)              // ✅ Fixed
db.createComment(comment)           // ✅ Fixed
db.deleteComment(commentId)

// Storage
storage.uploadAvatar(userId, file)
storage.uploadPostImage(userId, file)
storage.deletePostImage(url)
```

---

## 🚀 Common Commands

```bash
# Start development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Clear cache and restart
rm -rf node_modules/.vite
npm run dev
```

---

## 🔧 Environment Variables

```env
# Required
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...

# Optional
VITE_APP_NAME=TradeTalk
VITE_APP_ENV=development
```

---

## ✅ What Works Now

- ✅ User signup/login
- ✅ Create posts (text + image)
- ✅ View feed
- ✅ Like posts
- ✅ Comment on posts
- ✅ Delete own posts/comments
- ✅ User profiles
- ✅ Follow users
- ✅ Search stocks (static list)
- ✅ Image uploads

---

## ❌ What's Not Implemented

- ❌ Live market prices (intentionally removed)
- ❌ Debates feature (future)
- ❌ Notifications (future)
- ❌ Stock detail pages (future)
- ❌ Post categories (removed for simplicity)

---

## 🐛 Quick Troubleshooting

| Error | Quick Fix |
|-------|-----------|
| "Column does not exist" | Check you ran setup.sql completely |
| "Failed to create post" | Verify .env has correct Supabase credentials |
| "Permission denied" | Check RLS policies in Supabase dashboard |
| Page not loading | Clear cache: `rm -rf node_modules/.vite` |
| Changes not applying | Restart dev server: Ctrl+C then `npm run dev` |
| Login fails | Check Authentication → Providers → Email is enabled |

---

## 📱 Testing Flow

**Happy Path:**
1. Visit `/auth/welcome`
2. Sign up new user
3. Create a post
4. View in feed
5. Click post to comment
6. Like the post

**Should work without any errors!**

---

## 🎯 Routes

```
Public:
  /auth/welcome       - Landing page
  /auth/signup        - Registration
  /auth/signin        - Login

Protected:
  /                   - Feed (home)
  /create-post        - Create post
  /post/:id           - Post detail
  /profile/:id        - User profile
  /explore            - Explore page
  /chats              - Chat list
  /add-friends        - Find friends
```

---

## 💾 Supabase Dashboard Quick Links

Once logged into Supabase:

- **Table Editor** - View/edit data
- **Authentication** → **Users** - See user accounts
- **Storage** - View uploaded files
- **SQL Editor** - Run queries
- **Logs** → **PostgreSQL** - Database logs
- **Reports** - Usage statistics

---

## 🚦 Status Check

Run this SQL in Supabase to verify setup:

```sql
-- Check table counts
SELECT 
  'profiles' as table_name, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'posts', COUNT(*) FROM posts
UNION ALL
SELECT 'comments', COUNT(*) FROM comments
UNION ALL
SELECT 'post_likes', COUNT(*) FROM post_likes
UNION ALL
SELECT 'follows', COUNT(*) FROM follows;
```

---

## 📞 Need Help?

1. Check **SUPABASE_SETUP.md** for setup issues
2. Check **FIXES_APPLIED.md** for known issues
3. Check browser console for errors
4. Check Supabase logs for database errors

---

Last updated: Current deployment
