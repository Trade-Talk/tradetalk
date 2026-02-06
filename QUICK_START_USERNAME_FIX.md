# Quick Start Guide - Username Setup Fix

## 🚀 Deploy the Fix

### Step 1: Apply Database Migration
Open your Supabase Dashboard → SQL Editor → New Query

Copy and paste the contents of `supabase/fix_username_flow.sql`

Click **Run** or press `Cmd/Ctrl + Enter`

✅ You should see: "DROP TRIGGER", "CREATE FUNCTION", "CREATE TRIGGER" success messages

### Step 2: (Optional) Reset Existing Gibberish Usernames

If you want to force existing users with gibberish usernames to choose new ones:

In the same SQL Editor, uncomment and run:
```sql
UPDATE profiles 
SET username = NULL 
WHERE username LIKE 'user_%' 
  AND length(username) = 13
  AND username ~ '^user_[a-f0-9]{8}$';
```

### Step 3: Test the Flow

1. **Sign out** of your current session
2. Click **"Sign in with Google"** (or any OAuth provider)
3. You should be redirected to the **username setup page**
4. Choose a username (e.g., `traderkid123`)
5. Click **"Continue to TradeTalk"**
6. You should land on the home feed

## 🎯 Expected Behavior

### Before the Fix
```
User signs up with Google
  ↓
Profile created with username: "user_2cccca19"  ← GIBBERISH
  ↓
User sent directly to app
  ↓
User sees gibberish username everywhere 😞
```

### After the Fix
```
User signs up with Google
  ↓
Profile created with username: NULL
  ↓
User redirected to /auth/setup-username  ← SETUP PAGE
  ↓
User chooses username: "dhwani_trader"
  ↓
Username saved to profile
  ↓
User redirected to app
  ↓
User sees their chosen username everywhere 🎉
```

## 🧪 Test Scenarios

### Scenario 1: New User Signup
- [ ] Sign up with Google → Should see username setup
- [ ] Sign up with Apple → Should see username setup  
- [ ] Sign up with Email/Password → Should see username setup

### Scenario 2: Username Validation
- [ ] Try username with 2 chars → Should show error
- [ ] Try username with special chars (!, @, #) → Should show error
- [ ] Try uppercase letters → Should auto-convert to lowercase
- [ ] Try taken username → Should show "Username taken"
- [ ] Enter available username → Should show green checkmark

### Scenario 3: Existing Users
- [ ] User with username signs in → Goes straight to home
- [ ] User with NULL username → Redirected to setup

### Scenario 4: Protected Routes
- [ ] Try accessing /profile without username → Redirect to setup
- [ ] Try accessing /chats without username → Redirect to setup
- [ ] After setting username → Can access all routes

## 🐛 Troubleshooting

### "I still see gibberish usernames"
- Did you run the database migration?
- Did you run the optional UPDATE query to reset existing usernames?
- Clear browser cache and sign out/in again

### "I'm stuck in a redirect loop"
- Check browser console for errors
- Check if the profile has username set: 
  ```sql
  SELECT id, email, username FROM profiles WHERE email = 'your@email.com';
  ```
- If username exists but still redirecting, clear browser storage

### "Username availability check isn't working"
- Check browser console for errors
- Verify RLS policies allow SELECT on profiles table
- Test with a simple query:
  ```sql
  SELECT username FROM profiles WHERE username = 'testuser';
  ```

### "Database trigger not working"
- Verify trigger exists:
  ```sql
  SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
  ```
- Check trigger function:
  ```sql
  SELECT prosrc FROM pg_proc WHERE proname = 'handle_new_user';
  ```

## 📝 Notes

- **Username Rules**: 3-20 chars, lowercase letters, numbers, underscores only
- **Unique Constraint**: Database enforces unique usernames (you can't have duplicates)
- **Changing Username**: Users can change it later in settings (if you build that feature)
- **All Auth Methods**: This works for Google, Apple, Email/Password, Phone, etc.

## 🎨 Customization Ideas

Want to enhance the onboarding flow? Consider adding:

1. **Display Name Field**
   ```jsx
   <input placeholder="Full Name (optional)" />
   ```

2. **Bio/About Field**
   ```jsx
   <textarea placeholder="Tell us about yourself" />
   ```

3. **Profile Photo Upload**
   ```jsx
   <input type="file" accept="image/*" />
   ```

4. **Skip for Now Option**
   ```jsx
   <button onClick={() => navigate('/')}>I'll do this later</button>
   ```

5. **Username Suggestions**
   ```jsx
   const suggestions = [
     googleName.toLowerCase() + Math.floor(Math.random() * 100),
     googleName.toLowerCase() + '_trader',
     // etc
   ]
   ```

## 📞 Need Help?

If you run into issues:
1. Check the browser console for errors
2. Check Supabase logs (Database → Logs)
3. Verify RLS policies are correct
4. Make sure auth is properly configured

---

**Ready to deploy?** Just run the SQL migration and test! 🚀
