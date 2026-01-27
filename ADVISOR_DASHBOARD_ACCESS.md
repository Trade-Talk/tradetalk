# 🎯 Accessing the Advisor Dashboard

## Where is it?

The Advisor Dashboard is at: `/advisor-tools`

## How to Access It

### Method 1: From Your Profile (NEW - Just Added!)

1. Go to your **Profile** (bottom nav → Profile icon)
2. Look for the **briefcase icon** 💼 in the top right
3. Click it to go to Advisor Tools

**Note:** The briefcase icon only shows if you're an advisor.

### Method 2: Direct URL

Just type in the browser: 
```
http://localhost:5173/advisor-tools
```

### Method 3: Programmatically

```javascript
navigate('/advisor-tools')
```

## Who Can Access It?

- ✅ **Advisors** - Full access to all tools
- ❌ **Investors** - Cannot access (route is protected)

## Make Yourself an Advisor

If you don't see the briefcase icon, you need to be an advisor:

1. **Run this SQL in Supabase:**
   https://supabase.com/dashboard/project/irwfypgyyxvvjsxcrufs/sql/new

```sql
UPDATE profiles 
SET user_type = 'advisor' 
WHERE email = 'your-email@example.com';
```

2. **Sign out and sign back in**

3. **The briefcase icon should now appear** in your profile!

## What's in the Dashboard?

The Advisor Dashboard includes:

- 📊 **Client Overview** - See all your clients
- ⚠️ **Clients Needing Attention** - Priority alerts
- ✅ **Action Items** - Tasks and to-dos
- 📈 **Portfolio Health** - Client health scores
- 📝 **Quick Notes** - Client notes and context
- 🔍 **Search & Filter** - Find clients quickly

## Troubleshooting

### "I don't see the briefcase icon"
- Check if you're an advisor: Run the SQL above
- Sign out and sign in again
- Refresh the page

### "Page not found"
- Make sure you're logged in
- Check that you're an advisor
- URL should be: `http://localhost:5173/advisor-tools`

### "Empty dashboard"
- This is normal if you don't have clients yet
- The dashboard is for managing existing advisor-client relationships
- As you gain clients, they'll appear here

## Features Coming Soon

- Client onboarding workflow
- Performance analytics
- Automated rebalancing suggestions
- Communication templates
- Compliance tracking

---

**Quick Access Added:** I just added the briefcase icon to your profile page, so you can easily access Advisor Tools whenever you need them! 💼
