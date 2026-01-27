# TradeTalk V2 - Social Hybrid Platform
## Product Specification Document

---

## 🎯 Core Vision

**"Financial Twitter meets Marketplace meets Chat"**

A habit-forming social platform where SEBI-verified advisors and investors engage daily through content, discussions, and direct advisory services.

---

## 👥 User Types

### 1. **Investors** (Free & Premium)
- Can post on their personal feed
- Can comment, like, share
- Can follow advisors
- Can join public chat rooms
- **Cannot** create advisory channels
- **Cannot** post as verified advisor
- Premium: Subscribe to advisors for exclusive content + chats

### 2. **Advisors** (SEBI Verified)
- Everything investors can do, PLUS:
- Create advisory channels (free/paid)
- Post daily market insights (with daily limit)
- Host private chat rooms for subscribers
- 1-on-1 consultations
- Verified badge on all content
- Performance tracking visible

### 3. **Platform Admin** (Future)
- Content moderation
- Advisor verification
- Analytics dashboard

---

## 📱 App Structure - Bottom Navigation

```
┌─────────────────────────────────────────┐
│                                         │
│           MAIN CONTENT AREA             │
│                                         │
└─────────────────────────────────────────┘
┌─────┬─────┬─────┬─────┬─────┐
│Feed │Exp. │  +  │Chat │ You │
└─────┴─────┴─────┴─────┴─────┘
```

### Tab 1: 🏠 Feed (Homepage)
**Purpose:** Daily engagement, content consumption

**Components:**
1. **Top Bar**
   - Logo (left)
   - Search icon (right)
   - Notifications bell (right)

2. **Quick Stats Widget** (Collapsible)
   - Nifty/Sensex ticker
   - Your portfolio snapshot
   - Swipe to dismiss

3. **Stories Row** (Horizontal scroll)
   - Advisor 24hr stories
   - Quick market takes
   - Live session indicators
   - Add your story (investors can add too)

4. **Feed Content** (Infinite scroll)
   - Mixed content from followed advisors
   - Community posts from investors
   - Recommended posts
   - Sponsored content
   - Ad slots every 5-7 posts

5. **Floating Action Button**
   - Create post (always accessible)

**Post Types in Feed:**
- Text posts (280 chars for investors, unlimited for advisors)
- Image posts (charts, screenshots)
- Stock cards (type $SYMBOL, auto-formats)
- Polls
- Video posts (max 60sec for investors, unlimited for advisors)
- Shared posts (repost with comment)

**Engagement Actions:**
- Reactions: 🚀 Bullish, 🐻 Bearish, 💡 Insight, 🤔 Hmm, ❤️ Like
- Comment (nested threads)
- Share/Repost
- Bookmark
- Report (for moderation)

---

### Tab 2: 🔍 Explore (Discovery)
**Purpose:** Find advisors, topics, trending content

**Sections:**

1. **Search Bar** (Sticky top)
   - Search advisors, posts, topics, stocks
   - Recent searches
   - Trending searches

2. **Trending Now** (Horizontal cards)
   - #TopicOfTheDay
   - Most discussed stocks
   - Viral posts

3. **Top Advisors** (Carousel)
   - This week's top performers
   - Most followed
   - Recently joined
   - Filter by specialty

4. **Browse by Category** (Grid)
   - Value Investing
   - Growth Stocks
   - Options Trading
   - Dividend Investing
   - Swing Trading
   - Mutual Funds
   - Technical Analysis
   - Fundamental Analysis

5. **Live Events**
   - Ongoing webinars
   - Scheduled AMAs
   - Market hours discussions

6. **Educational Content**
   - Free courses
   - Market basics
   - Strategy guides

**Advisor Cards in Explore:**
```
┌─────────────────────────────┐
│ 👤 [Photo] Rajesh Kumar     │
│    Value Investing ✓        │
│ ──────────────────────────  │
│ 3Y CAGR: 24.5% | 1.2K 👥   │
│ "Finding undervalued..."    │
│ ──────────────────────────  │
│ Free Channel | ₹1,999/mo    │
│ [View Profile] [Follow +]   │
└─────────────────────────────┘
```

---

### Tab 3: ➕ Create (Center Button)
**Purpose:** Quick content creation

**Modal opens with options:**

**For Investors:**
- 📝 Write post (text + images)
- 📊 Share trade result
- ❓ Ask question
- 📈 Share chart
- 🗳️ Create poll

**For Advisors (all above, plus):**
- 🎯 Stock recommendation (structured form)
- 📺 Go live (instant video session)
- 📄 Upload research report
- 📅 Schedule webinar

**Post Creation Flow:**
1. Choose post type
2. Fill content (rich text editor)
3. Add media (upload or paste)
4. Add tags (#, $)
5. Choose audience (Public / Subscribers only)
6. Post or Schedule

**Daily Limits:**
- Investors: Unlimited regular posts
- Advisors: 5 official recommendations/day (unlimited regular posts)

---

### Tab 4: 💬 Chats (Messaging)
**Purpose:** Direct communication, community discussions

**Sections:**

1. **Search Chats**

2. **My Advisors** (If subscribed)
   - Direct chats with subscribed advisors
   - Unread message count
   - Last message preview
   - Online status indicator

3. **Channels** (Advisor broadcast channels)
   - Free channels you joined
   - Premium channels (subscription)
   - Muted channels

4. **Group Chats**
   - Private groups you're in
   - Strategy-specific groups
   - Community groups

5. **Public Rooms**
   - Live market discussions
   - Topic-based rooms
   - "Currently online" count

**Chat Types:**

**A) Direct Messages (DM)**
- Free tier: Text only, 24hr response time
- Subscribed: Rich media, priority response, video call option

**B) Advisor Channels (Broadcast)**
- Advisor posts, subscribers receive
- Can react but not reply (unless premium)
- Think Telegram channels

**C) Group Chats**
- Multi-person conversations
- Up to 100 people
- Admins can moderate

**D) Public Rooms**
- Anyone can join
- Platform moderated
- Live during market hours

**Chat Features:**
- Stock cards (type $SYMBOL)
- Chart embeds (paste link)
- Voice messages
- File sharing (PDFs, images)
- Polls in chat
- Message reactions
- Pin important messages
- Search within chat
- Notification controls

---

### Tab 5: 👤 You (Profile)
**Purpose:** Personal hub, settings, subscriptions

**Sections:**

1. **Profile Header**
   - Profile photo
   - Name & username
   - Bio (50 chars)
   - Follower/Following count
   - Edit profile button

2. **Quick Stats** (For investors)
   - Total posts
   - Total followers
   - Engagement rate
   - Member since

2. **Quick Stats** (For advisors)
   - Subscriber count
   - SEBI reg number
   - Performance metrics
   - Verified badge

3. **Tabs:**
   
   **Posts Tab:**
   - Your feed posts
   - Your comments
   - Saved/Bookmarked posts
   
   **Portfolio Tab:** (Investors)
   - Connected portfolio
   - Holdings
   - Performance chart
   - Trade history
   
   **Subscriptions Tab:**
   - Active subscriptions
   - Upcoming renewals
   - Subscription history
   - Recommended advisors
   
   **Analytics Tab:** (Advisors only)
   - Subscriber growth
   - Content performance
   - Revenue analytics
   - Engagement metrics

4. **Settings**
   - Account settings
   - Notification preferences
   - Privacy settings
   - Payment methods
   - Help & Support
   - Terms & Privacy
   - Log out

---

## 🎮 Gamification & Retention Mechanics

### For Investors:
- **Streaks:** Daily check-in streak badge
- **Reputation Points:** Earn through engagement
- **Badges:** "Early Bird", "Market Maven", "Helper"
- **Levels:** Beginner → Intermediate → Advanced → Expert
- **Achievements:** "First profit", "100 followers", "1000 likes"

### For Advisors:
- **Performance Leaderboard:** Top performers this month
- **Engagement Score:** How active they are
- **Subscriber Milestones:** 100, 500, 1K, 5K
- **Quality Score:** Based on accuracy of picks
- **Response Rate:** Fast responder badge

---

## 📊 Content Algorithm (Feed)

**Factors:**
1. **Recency:** Posts from last 24hrs rank higher
2. **Engagement velocity:** Likes/comments per minute
3. **User affinity:** From accounts you engage with often
4. **Topic relevance:** Your watchlist stocks
5. **Creator reputation:** Verified advisors, high performers
6. **Content type:** Mix of text, images, videos
7. **Diversity:** Don't show same advisor repeatedly

**Personalization:**
- Your watchlist stocks appear more
- Advisors you follow get priority
- Topics you engage with
- Time of day you're active

---

## 💰 Monetization Model

### For Platform:
1. **Advisor Subscriptions:**
   - 18% commission on all subscriptions
   - Annual license fee: ₹15,000/year

2. **Transaction Fees:**
   - Consultation booking: ₹100/booking
   - Group chat hosting: ₹50/month

3. **Advertising:**
   - Sponsored posts in feed
   - Banner ads in explore
   - Broker partnerships

4. **Premium Features (Future):**
   - Advanced analytics for investors
   - Priority customer support
   - Ad-free experience

### For Advisors:
**Freemium Channel Model:**

**Free Channel:**
- Post daily market commentary
- Build audience
- Max 10 posts/day
- Public chat room access

**Paid Channel Options:**
Set by advisor:
- **₹999-₹2,999/mo:** Standard tier
  - Daily stock recommendations
  - Premium chat access
  - Weekly research reports
  - Email support

- **₹3,000-₹6,999/mo:** Premium tier
  - Everything in standard
  - 1-on-1 monthly call
  - Priority DMs
  - Exclusive webinars
  - Custom portfolio review

- **Custom Pricing:** For HNI advisory

**Other Revenue:**
- Consultation calls: Advisor sets rate
- Group sessions/webinars: Ticketed events
- Course creation: Sell courses

---

## 🔒 Verification & Compliance

### SEBI Verification:
1. Advisor submits SEBI registration number
2. Platform verifies with SEBI database (API)
3. Manual review of credentials
4. Verification badge assigned
5. Re-verification annually

### Content Moderation:
- **Automated:** AI flags suspicious content
  - Pump-and-dump schemes
  - Fake news
  - Guaranteed returns claims
  - Abusive language
  
- **Community:** Report button on all content
  
- **Manual Review:** Flagged content reviewed by team

### Compliance Features:
- Every recommendation has disclaimer
- Performance tracked immutably
- Can't delete past recommendations
- Audit trail for all paid advice
- Mandatory risk warnings

---

## 📲 Notification Strategy

### Push Notifications:

**High Priority (Always on):**
- DM from subscribed advisor
- Your post gets 100 likes
- Advisor you follow goes live
- Price alert on watchlist stock

**Medium Priority (User controlled):**
- New post from followed advisor
- Someone commented on your post
- Trending topic in your interest
- Subscription renewal reminder

**Low Priority (Opt-in):**
- Daily market summary
- Weekly performance digest
- Recommended advisors
- Educational content

**Notification Settings:**
- Customize per advisor
- Mute/unmute options
- Quiet hours
- Preview in lock screen

---

## 🎨 Design Principles

### Mobile-First:
- Bottom navigation (thumb-friendly)
- Single column feed
- Large tap targets (48px min)
- Swipe gestures
- Pull to refresh

### Performance:
- Lazy load images
- Infinite scroll (paginated)
- Cached feed content
- Optimistic UI updates
- Skeleton loading states

### Accessibility:
- Minimum contrast ratio 4.5:1
- Screen reader support
- Keyboard navigation
- Focus indicators
- Alt text for images

### Visual Design:
- Clean, modern interface
- Consistent spacing (8px grid)
- Brand colors (Blue primary)
- Clear typography hierarchy
- Subtle animations

---

## 🚀 MVP Feature Priority

### Phase 1 (Weeks 1-4): Core Feed
- ✅ Feed page with posts
- ✅ Create post (text + images)
- ✅ Like, comment, share
- ✅ Follow/unfollow
- ✅ User profiles
- ✅ Advisor verification badge
- ✅ Basic search

### Phase 2 (Weeks 5-8): Discovery & Chat
- ✅ Explore page with advisor discovery
- ✅ Direct messaging
- ✅ Advisor channels (broadcast)
- ✅ Subscription flow
- ✅ Payment integration

### Phase 3 (Weeks 9-12): Advanced Features
- ✅ Group chats
- ✅ Public rooms
- ✅ Stories
- ✅ Video posts
- ✅ Live sessions
- ✅ Analytics dashboard

### Phase 4 (Weeks 13-16): Polish & Scale
- ✅ Notifications
- ✅ Performance optimization
- ✅ Advanced moderation
- ✅ Reporting & analytics
- ✅ Beta testing

---

## 📐 Technical Architecture

### Frontend:
- React 18 (Web) / React Native (Mobile app later)
- React Router for navigation
- Context API + React Query for state
- Tailwind CSS for styling
- Socket.io for real-time chat
- Progressive Web App (PWA) capabilities

### Backend (Future):
- Node.js + Express
- PostgreSQL (user data, transactions)
- MongoDB (posts, messages)
- Redis (caching, real-time)
- S3 (media storage)
- WebSockets (chat)

### Key Integrations:
- SEBI API (verification)
- Razorpay (payments)
- Twilio (SMS/calls)
- SendGrid (emails)
- AWS (hosting)
- Firebase (push notifications)

---

## 🎯 Success Metrics

### Engagement:
- Daily Active Users (DAU)
- Session duration (target: 15+ min)
- Posts per user per day
- Comments per post
- Shares per post

### Retention:
- Day 1, 7, 30 retention rates
- Weekly active users
- Churn rate
- Session frequency

### Monetization:
- Subscription conversion rate
- Average revenue per user (ARPU)
- Advisor earnings
- Platform GMV

### Growth:
- New user signups
- Advisor applications
- Viral coefficient (invites)
- App store ratings

---

## 🔥 Viral Mechanics

1. **Invite Friends:**
   - Both get 1 month free premium
   - Leaderboard for top referrers

2. **Share to Social Media:**
   - Beautiful post cards for Twitter/LinkedIn
   - "Powered by TradeTalk" watermark

3. **Advisor Referral Program:**
   - Advisors earn 10% of referred advisor's revenue

4. **Challenges:**
   - "Best pick this month" contest
   - Winner gets featured

5. **User Generated Content:**
   - Encourage sharing wins
   - Showcase success stories

---

## 📱 User Journeys

### New Investor Journey:
1. Land on app → See trending feed
2. Sign up with Google/phone
3. Pick interests (value, growth, etc.)
4. Follow 5 recommended advisors
5. See personalized feed immediately
6. Engage (like, comment)
7. Day 7: Prompted to subscribe to favorite advisor

### New Advisor Journey:
1. Apply with SEBI credentials
2. Verification (1-2 days)
3. Set up profile + pricing
4. Create free channel
5. Post first market insight
6. Gain initial followers
7. Some convert to paid subscribers
8. Earn first revenue

### Daily Power User:
1. Morning: Check feed, see market open update
2. 10 AM: Advisor posts stock pick, you engage
3. Noon: Chat in group about strategy
4. 2 PM: Post your own trade result
5. 4 PM: Market close, check portfolio
6. Evening: Scroll feed, watch advisor's video
7. Night: Check tomorrow's watchlist

---

This is our complete spec! Now I'll start building the MVP. Ready to code? 🚀
