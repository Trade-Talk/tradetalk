# Troubleshooting Guide

## Error: 406 - "daily_predictions" table not found

### Problem
Browser console shows:
```
[Error] Failed to load resource: the server responded with a status of 406 () (daily_predictions, line 0)
{
    "code": "PGRST116",
    "details": "The result contains 0 rows",
    "hint": null,
    "message": "Cannot coerce the result to a single JSON object"
}
```

### Root Cause
This error occurs when the browser is trying to access a `daily_predictions` table that doesn't exist in your Supabase database. This is usually caused by:
1. Browser cache holding onto old API calls
2. Service worker caching old requests
3. Old code that hasn't been cleared

### Solution

#### Step 1: Clear Browser Cache and Data
1. Open Chrome/Browser DevTools (F12)
2. Go to **Application** tab
3. Under **Storage**, click "Clear site data"
4. Make sure all checkboxes are selected:
   - Local storage
   - Session storage
   - IndexedDB
   - Cookies
   - Cache storage
   - Service workers
5. Click **Clear site data**

#### Step 2: Unregister Service Workers
1. In DevTools, go to **Application** > **Service Workers**
2. Click **Unregister** for all service workers
3. Or run this in Console:
```javascript
navigator.serviceWorker.getRegistrations().then(function(registrations) {
  for(let registration of registrations) {
    registration.unregister()
  }
})
```

#### Step 3: Hard Refresh
- Windows/Linux: `Ctrl + Shift + R` or `Ctrl + F5`
- Mac: `Cmd + Shift + R`

#### Step 4: Clear Browser History (if still persists)
1. Settings → Privacy and Security → Clear browsing data
2. Select "Cached images and files"
3. Time range: "All time"
4. Clear data

#### Step 5: Restart Development Server
```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

#### Step 6: Check Network Tab
1. Open DevTools → Network tab
2. Filter by "daily_predictions"
3. If you see any calls to this endpoint, note the file making the call
4. That file needs to be updated to remove the old API call

### Alternative: Check for Hidden Code
If clearing cache doesn't work, there might be code calling `daily_predictions`. Search for it:

```bash
# In your project root
grep -r "daily_predictions" src/
```

If this finds anything, that code needs to be removed or updated.

### Prevention
To prevent similar issues:
1. Always clear browser cache when switching between major feature branches
2. Use version control to track API changes
3. Document all database table names in your schema files
4. Use browser incognito mode for testing after major changes

## Still Having Issues?

If the error persists after all these steps:

1. **Check Supabase Logs**: Go to your Supabase dashboard → Logs → API logs
2. **Verify Table Exists**: Go to Supabase → Table Editor and confirm `daily_predictions` doesn't exist
3. **Create the Table** (if you actually need it):
   ```sql
   CREATE TABLE IF NOT EXISTS daily_predictions (
     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
     -- Add your columns here
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

## Current Database Tables
Your current schema includes these tables:
- `profiles`
- `advisor_verifications`
- `posts`
- `signals` (for smart trading signals)
- `advisor_stats`
- `chat_rooms`
- `chat_messages`
- `follows`
- `connection_requests`
- `post_likes`
- `post_bookmarks`
- `comments`
- `comment_likes`
- `subscriptions`

There is NO `daily_predictions` table in your current schema.
