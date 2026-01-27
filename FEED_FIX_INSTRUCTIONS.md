# Quick Fix for Missing Post in Feed

## The Problem
Your post was created but it's not showing in the feed because:
1. The `stocks` column doesn't exist in the database yet
2. The post creation likely failed silently or succeeded without stocks

## IMMEDIATE FIX - Do This Now!

### Step 1: Add the Stocks Column (REQUIRED)

Open your Supabase SQL Editor and run this:

```sql
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS stocks JSONB DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_posts_stocks ON posts USING GIN (stocks);
```

**How to do it:**
1. Go to https://supabase.com/dashboard/project/irwfypgyyxvvjsxcrufs
2. Click "SQL Editor" in left sidebar
3. Click "New query"
4. Paste the SQL above
5. Click "Run" (or Cmd/Ctrl + Enter)

### Step 2: Refresh Your Browser
After running the SQL:
1. Go back to your TradeTalk app
2. Hard refresh: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)
3. Your post should now appear!

### Step 3: Test Creating a New Post
1. Click create post
2. Add some text
3. Click the green "Add Stocks" button
4. Select a stock
5. Post it
6. It should appear in feed immediately!

## What I Fixed

1. **Auto-refresh after posting** - Feed now automatically refreshes when you create a post
2. **Stock display in feed** - Posts now show attached stocks with live prices
3. **Better navigation** - Uses state to trigger refresh

## If Post Still Missing

The post you created earlier might have failed to save due to the missing `stocks` column. After running the SQL migration:

1. Try creating a NEW post
2. The new post should appear immediately
3. Old posts might be lost if they failed to save

## Files Changed
- `FeedPageIntegrated.jsx` - Added auto-refresh on navigation
- `CreatePost.jsx` - Navigate with refresh state
- `PostCard.jsx` - Display stocks in feed

## Next Time
Always check your browser console for errors when something doesn't work - the PGRST204 error told us exactly what was wrong!
