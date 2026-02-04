# TradeTalk - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- A Supabase account (already configured)

### Installation

1. **Install Dependencies**
```bash
npm install
```

2. **Verify Environment Variables**
Your `.env` file should have:
```
VITE_SUPABASE_URL=https://irwfypgyyxvvjsxcrufs.supabase.co
VITE_SUPABASE_ANON_KEY=[your-key-is-configured]
```
✅ Already configured!

3. **Start Development Server**
```bash
npm run dev
```

The app will open at `http://localhost:5173`

## 📱 Testing the App

### 1. First Time Setup
1. Visit `http://localhost:5173`
2. You'll see the Welcome page
3. Click "Get Started" to create an account

### 2. Create an Account
1. Fill in:
   - Full Name
   - Email
   - Password (min 6 characters)
   - User Type (Investor/Advisor/Learner)
2. Click "Create Account"
3. You'll be redirected to the feed

### 3. Create Your First Post
1. Click the white "+" button (bottom right)
2. Select a category
3. Write your post
4. Optionally add an image
5. Click "Post"
6. You'll be redirected back to the feed

### 4. Explore Features
- **Feed**: View all posts, filter by category
- **Search**: Click search icon to find stocks
- **Add Friends**: Click the user+ icon
- **Profile**: View your profile in the bottom nav
- **Like/Comment**: Interact with posts

## 🛠️ Health Check

To verify everything is working:
1. Open `health-check.html` in your browser
2. Click "Run Diagnostics"
3. All checks should be green ✅

## 🐛 Troubleshooting

### Issue: App won't load
**Fix:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
npm run dev
```

### Issue: "Failed to create post"
**Check:**
1. Are you logged in?
2. Did you write any content?
3. Check browser console for errors
4. Try without image first

### Issue: Posts not loading
**Fix:**
1. Check if Supabase is accessible
2. Verify .env file has correct keys
3. Check browser console for errors
4. Try refreshing the page

### Issue: Can't sign up/in
**Fix:**
1. Clear browser cache and cookies
2. Check if email is valid
3. Password must be 6+ characters
4. Check browser console for errors

## 📝 Common Tasks

### Reset Database (if needed)
If your database tables are corrupted:
1. Go to Supabase dashboard
2. Navigate to SQL Editor
3. Run the schema from `supabase/schema.sql`

### View Logs
```bash
# Browser console (F12)
# Look for errors in red

# Supabase logs
# Go to Supabase Dashboard > Logs
```

### Clear All Data (Fresh Start)
```bash
# Clear browser storage
localStorage.clear()
sessionStorage.clear()

# Then refresh page
```

## 🎯 What to Test

### Critical Paths
- [ ] Signup → Create Post → View in Feed
- [ ] Login → Like Post → Comment on Post
- [ ] Search Stocks → View Results
- [ ] Edit Profile → Upload Avatar
- [ ] View Other Profiles

### Edge Cases
- [ ] Try posting without content (should show error)
- [ ] Try uploading large image >5MB (should show error)
- [ ] Try posting without being logged in (should redirect)
- [ ] Try accessing protected routes without login

## 📞 Getting Help

1. Check `TESTING_GUIDE.md` for detailed testing
2. Run `health-check.html` for diagnostics
3. Check browser console for errors
4. Review Supabase logs in dashboard

## ✅ Ready for Beta Testing?

Before inviting users:
- [ ] All critical paths work
- [ ] No console errors on fresh load
- [ ] Signup/login works smoothly
- [ ] Posts can be created and viewed
- [ ] Mobile responsive (test on phone)
- [ ] Health check passes all tests

## 🚢 Deployment

When ready to deploy:

```bash
# Build production version
npm run build

# Preview production build locally
npm run preview

# Deploy to Vercel/Netlify
# Follow their deployment guides
```

---

**Need Help?** Check the browser console first, then the TESTING_GUIDE.md file.

**Last Updated**: Current deployment
