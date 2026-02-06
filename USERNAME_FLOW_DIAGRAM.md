# TradeTalk Username Setup Flow

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     NEW USER SIGNUP FLOW                         │
└─────────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │  User visits │
    │   /signup    │
    └──────┬───────┘
           │
           ▼
    ┌──────────────────┐
    │ Clicks "Sign in  │
    │  with Google"    │
    └──────┬───────────┘
           │
           ▼
    ┌─────────────────────────┐
    │   Google OAuth Flow     │
    │  (External - Google)    │
    └──────┬──────────────────┘
           │
           ▼
    ┌────────────────────────────────┐
    │   /auth/callback               │
    │                                │
    │  • Get session                 │
    │  • Check profile               │
    │  • DB trigger creates profile  │
    │    with username: NULL         │
    └──────┬─────────────────────────┘
           │
           ├──── Has username? ────┐
           │                       │
        NO │                       │ YES
           │                       │
           ▼                       ▼
    ┌────────────────────┐  ┌──────────────┐
    │ /auth/setup-       │  │   Home (/)   │
    │  username          │  │              │
    │                    │  │   Welcome    │
    │ • Show form        │  │    back!     │
    │ • Real-time check  │  └──────────────┘
    │ • Validate input   │
    │ • Save username    │
    └──────┬─────────────┘
           │
           ▼
    ┌─────────────────┐
    │   Home (/)      │
    │                 │
    │  Welcome to     │
    │  TradeTalk! 🎉  │
    └─────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                  EXISTING USER LOGIN FLOW                        │
└─────────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │  User signs  │
    │      in      │
    └──────┬───────┘
           │
           ▼
    ┌────────────────────────┐
    │   /auth/callback       │
    │                        │
    │  • Check profile       │
    └──────┬─────────────────┘
           │
           ├──── Has username? ────┐
           │                       │
        NO │                       │ YES
           │                       │
           ▼                       ▼
    ┌────────────────┐     ┌──────────────┐
    │  /auth/setup-  │     │   Home (/)   │
    │   username     │     │              │
    │                │     │  Welcome     │
    │  (Pick one!)   │     │   back!      │
    └────────────────┘     └──────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                    USERNAME SETUP PAGE                           │
└─────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────┐
    │   Choose Your Username                  │
    │   This is how other traders will        │
    │   find you                              │
    │                                         │
    │   ┌────────────────────────────┐       │
    │   │ @ traderkid123        ✓    │       │
    │   └────────────────────────────┘       │
    │                                         │
    │   3-20 characters. Only letters,        │
    │   numbers, and underscores.             │
    │                                         │
    │   ┌────────────────────────────┐       │
    │   │  Continue to TradeTalk     │       │
    │   └────────────────────────────┘       │
    │                                         │
    │   You can change your username          │
    │   anytime in settings                   │
    └─────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                  USERNAME VALIDATION LOGIC                       │
└─────────────────────────────────────────────────────────────────┘

    User types: "TraderKid123!"
           │
           ▼
    ┌──────────────────────────┐
    │  Convert to lowercase    │
    │  "traderkid123!"         │
    └──────┬───────────────────┘
           │
           ▼
    ┌──────────────────────────┐
    │  Check special chars     │
    │  ❌ Has "!"              │
    │  → Show error            │
    └──────────────────────────┘

    User types: "ab"
           │
           ▼
    ┌──────────────────────────┐
    │  Check length            │
    │  ❌ Too short (< 3)      │
    │  → Show error            │
    └──────────────────────────┘

    User types: "traderkid"
           │
           ▼
    ┌──────────────────────────┐
    │  Wait 300ms (debounce)   │
    └──────┬───────────────────┘
           │
           ▼
    ┌──────────────────────────┐
    │  Check database          │
    │  SELECT from profiles    │
    │  WHERE username = ?      │
    └──────┬───────────────────┘
           │
           ├─── Found? ───┐
           │              │
        NO │              │ YES
           │              │
           ▼              ▼
    ┌──────────┐   ┌──────────────┐
    │ ✓ Show   │   │ ❌ Username  │
    │ Available│   │    Taken     │
    └──────────┘   └──────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE CHANGES                              │
└─────────────────────────────────────────────────────────────────┘

    BEFORE FIX:
    ┌────────────────────────────────────┐
    │  handle_new_user() trigger         │
    │                                    │
    │  username = 'user_' + UUID         │
    │           ↓                        │
    │  Result: "user_2cccca19"  ❌       │
    └────────────────────────────────────┘

    AFTER FIX:
    ┌────────────────────────────────────┐
    │  handle_new_user() trigger         │
    │                                    │
    │  username = NULL                   │
    │           ↓                        │
    │  User chooses username  ✓          │
    └────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                   ROUTE PROTECTION                               │
└─────────────────────────────────────────────────────────────────┘

    User tries to access /profile
           │
           ▼
    ┌──────────────────────────┐
    │  ProtectedRoute check    │
    └──────┬───────────────────┘
           │
           ├──── Logged in? ────┐
           │                    │
        NO │                    │ YES
           │                    │
           ▼                    ▼
    ┌────────────┐    ┌──────────────────┐
    │  Redirect  │    │ Has username?    │
    │  to login  │    └──────┬───────────┘
    └────────────┘           │
                             ├── NO ──┐
                             │        │
                          YES│        │
                             │        ▼
                             │  ┌─────────────┐
                             │  │  Redirect   │
                             │  │  to setup   │
                             │  └─────────────┘
                             │
                             ▼
                      ┌──────────────┐
                      │ Show /profile│
                      └──────────────┘
```

## Component Responsibilities

### AuthCallback.jsx
- ✅ Get OAuth session
- ✅ Check if profile exists
- ✅ Check if username exists
- ✅ Redirect to setup or home

### SetupUsername.jsx
- ✅ Validate username format
- ✅ Check username availability
- ✅ Save username to profile
- ✅ Redirect to home

### App.jsx (ProtectedRoute)
- ✅ Check authentication
- ✅ Check username exists
- ✅ Enforce setup completion

### App.jsx (SetupRoute)
- ✅ Only allow logged-in users
- ✅ Don't redirect if completing setup
- ✅ Redirect non-authed users to welcome

## Database Schema

```sql
profiles table:
  - id (UUID, PK, FK to auth.users)
  - email (TEXT, UNIQUE, NOT NULL)
  - username (TEXT, UNIQUE, NULLABLE)  ← Key field!
  - full_name (TEXT)
  - avatar_url (TEXT)
  - ...other fields
```

## Edge Cases Handled

1. ✅ User closes tab during setup → Redirected back on next visit
2. ✅ User tries to access app without username → Redirected to setup
3. ✅ Existing user with username → Skip setup
4. ✅ Username taken → Show error, prevent submission
5. ✅ Invalid characters → Show error, prevent submission
6. ✅ Database trigger race condition → Wait 500ms before checking
7. ✅ Multiple rapid availability checks → Debounced to 300ms
8. ✅ User types @ prefix → Automatically removed
9. ✅ Uppercase letters → Auto-converted to lowercase
10. ✅ Lost session during setup → Redirect to login
