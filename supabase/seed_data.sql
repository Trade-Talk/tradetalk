-- =====================================================
-- TradeTalk Seed Data - Realistic Community Content
-- =====================================================
-- Run this AFTER setup.sql to populate with sample data
-- This uses YOUR existing user account to create demo posts
-- =====================================================

DO $$
DECLARE
  seed_user_id UUID;
  user_count INTEGER;
BEGIN
  -- Get the first user ID (your account)
  SELECT id INTO seed_user_id FROM profiles ORDER BY created_at ASC LIMIT 1;
  
  IF seed_user_id IS NULL THEN
    RAISE EXCEPTION 'No users found. Please create at least one user account first by signing up on the app.';
  END IF;
  
  RAISE NOTICE 'Using user ID: %', seed_user_id;
  
  -- Check how many users exist
  SELECT COUNT(*) INTO user_count FROM profiles;
  RAISE NOTICE 'Found % user(s) in the system', user_count;

  -- =====================================================
  -- CLEAR EXISTING SEED DATA (optional)
  -- =====================================================
  -- Uncomment the next line if you want to clear old seed data
  -- DELETE FROM posts WHERE content LIKE '%$BTC%' OR content LIKE '%$NVDA%' OR content LIKE '%Rule #1%';

  -- =====================================================
  -- CREATE POSTS
  -- =====================================================
  
  INSERT INTO posts (author_id, content, created_at) VALUES
    -- Crypto posts
    (seed_user_id, 'Just went all-in on $BTC at $95k. Either retiring next year or living in my car. No in between. 🚀', 
     NOW() - INTERVAL '2 hours'),
     
    (seed_user_id, '$ETH staking rewards are insane right now. 4.2% APY and you''re helping secure the network. Win-win.', 
     NOW() - INTERVAL '5 hours'),
     
    (seed_user_id, 'Anyone else think $SOL is way undervalued at $180? The speed and low fees make it a no-brainer for DeFi.', 
     NOW() - INTERVAL '8 hours'),
     
    (seed_user_id, 'Reminder: Not your keys, not your crypto. Just moved everything off exchanges to cold storage. Sleep better now.', 
     NOW() - INTERVAL '1 day'),
     
    (seed_user_id, 'Bought the $ETH dip at $3,200. Already up 8%. Sometimes you just gotta trust your gut.', 
     NOW() - INTERVAL '15 hours'),
    
    -- Stock posts
    (seed_user_id, '$NVDA earnings next week. Expecting a beat but stock might still drop because market is irrational. Classic sell the news.', 
     NOW() - INTERVAL '3 hours'),
     
    (seed_user_id, 'Bought 50 shares of $AAPL at $225. Long-term hold. Warren Buffett can''t be wrong... right? 📈', 
     NOW() - INTERVAL '6 hours'),
     
    (seed_user_id, '$TSLA down 8% today. Elon tweeted something stupid again. At this point I''m numb to it.', 
     NOW() - INTERVAL '9 hours'),
     
    (seed_user_id, '$MSFT is printing money with Azure. Cloud revenue up 30% YoY. This is my largest position and I''m not selling.', 
     NOW() - INTERVAL '1 day'),
     
    (seed_user_id, 'Finally green on $AMD. Held through a 40% drawdown. Diamond hands paid off 💎', 
     NOW() - INTERVAL '18 hours'),
    
    -- Options posts
    (seed_user_id, 'Sold $SPY 580 calls expiring Friday. Free money if we stay below that. Theta gang wins again. ⏰', 
     NOW() - INTERVAL '4 hours'),
     
    (seed_user_id, 'Buying $AMZN LEAPs for Jan 2027. $200 strike. Gonna forget about this for 2 years and hopefully 10x.', 
     NOW() - INTERVAL '7 hours'),
     
    (seed_user_id, 'Iron condor on $GOOGL paid off. Collected $2,400 premium. Stock literally did nothing. Perfect. 🦅', 
     NOW() - INTERVAL '10 hours'),
     
    (seed_user_id, 'Pro tip: Never sell puts on a stock you wouldn''t want to own. Got assigned $AMD shares at $180 and I''m actually happy about it.', 
     NOW() - INTERVAL '16 hours'),
    
    -- Futures posts
    (seed_user_id, 'Gold futures looking bullish. Fed rate cuts incoming = gold moon mission. Loaded up at $2,650.', 
     NOW() - INTERVAL '5 hours'),
     
    (seed_user_id, 'Oil futures got destroyed today. Down 6%. OPEC drama + weak China data = perfect storm.', 
     NOW() - INTERVAL '11 hours'),
    
    -- General trading wisdom
    (seed_user_id, 'Rule #1: Cut losses early. Rule #2: Let winners run. Rule #3: Ignore both rules when emotional. Working on Rule #3.', 
     NOW() - INTERVAL '1 hour'),
     
    (seed_user_id, 'Been trading for 3 years. Finally had my first profitable month. Only took 35 months of losses. Progress! 💪', 
     NOW() - INTERVAL '12 hours'),
     
    (seed_user_id, 'Portfolio update: 60% stocks, 30% crypto, 10% cash. Feel like I''m diversified but also feel like I''m not in enough meme stocks.', 
     NOW() - INTERVAL '20 hours'),
     
    (seed_user_id, 'Hot take: The best investment you can make is in yourself. Books, courses, mentors. Knowledge compounds faster than money.', 
     NOW() - INTERVAL '22 hours'),
    
    -- Discussion-style posts
    (seed_user_id, 'I see a lot of new traders going all-in on meme stocks without any risk management. My advice: Never risk more than 2-5% of your portfolio on a single trade. Always use stop losses. What are your thoughts on position sizing?', 
     NOW() - INTERVAL '6 hours'),
     
    (seed_user_id, 'I''ve been reading up on value investing vs growth investing. Warren Buffett swears by value, but Cathie Wood goes all-in on growth. In 2025, which makes more sense? Tech is expensive but also driving innovation. What''s your approach?', 
     NOW() - INTERVAL '10 hours'),
     
    (seed_user_id, 'Made $50k this year day trading. Lost $48k. Net $2k. Spent 8 hours a day glued to charts. Could''ve made more working at Starbucks. Anyone else realize day trading is a trap or am I missing something?', 
     NOW() - INTERVAL '14 hours'),
     
    (seed_user_id, 'I''m 25, make $80k/year, have $30k saved. Should I: A) Max out my Roth IRA B) Pay off student loans ($15k at 4.5%) C) YOLO into tech stocks D) All three somehow? What would you prioritize?', 
     NOW() - INTERVAL '18 hours'),
     
    (seed_user_id, 'Banks offering 4.5% on savings accounts right now. Meanwhile $SPY returns 12% average annually. Why are people keeping cash in savings when index funds exist? Am I missing something about liquidity/safety?', 
     NOW() - INTERVAL '1 day'),
     
    (seed_user_id, 'Reading "The Intelligent Investor" by Benjamin Graham. It''s from 1949 but the principles still feel relevant. What books actually changed how you invest? Looking for recommendations.', 
     NOW() - INTERVAL '1 day'),
     
    -- Debate-style posts
    (seed_user_id, 'Bitcoin vs Gold debate: BTC is digital gold with finite supply (21M), decentralized, no government can print more. Ultimate inflation hedge. But critics say it uses too much energy and has no intrinsic value. What''s your take?', 
     NOW() - INTERVAL '8 hours'),
     
    (seed_user_id, 'DCA (Dollar Cost Averaging) vs Timing the Market: Time in market beats timing the market. DCA removes emotion. But if you know a crash is coming, why keep buying? What do you think?', 
     NOW() - INTERVAL '12 hours'),
     
    (seed_user_id, 'Renting vs Buying: Mortgage builds equity, tax benefits, forced savings. But buying ties you down, maintenance costs add 30%+, and 2008 showed homes can crash. Thoughts?', 
     NOW() - INTERVAL '16 hours'),
     
    (seed_user_id, '$NVDA: King of AI chips with 95% market share, revenue up 200%+ YoY. But is it priced for perfection? P/E of 50+, competition heating up. When AI bubble pops, does NVDA fall hardest?', 
     NOW() - INTERVAL '20 hours'),
     
    (seed_user_id, 'ETFs vs Active Trading: ETFs give instant diversification, low fees (0.03%), match market returns. 90% of active managers underperform. But active trading lets you capitalize on opportunities. Which side are you on?', 
     NOW() - INTERVAL '1 day'),
     
    -- Beginner questions
    (seed_user_id, 'Stupid question: What''s the difference between a market order and a limit order? Just lost $50 because I used the wrong one 😅', 
     NOW() - INTERVAL '4 hours'),
     
    (seed_user_id, 'Can someone explain what "IV crush" means in options trading? Keep seeing people mention it after earnings.', 
     NOW() - INTERVAL '13 hours'),
     
    (seed_user_id, 'Is a Roth IRA really worth it? I''m 23 and the idea of locking money away until 59.5 feels crazy when I could be investing it now.', 
     NOW() - INTERVAL '17 hours'),
     
    -- Success stories
    (seed_user_id, 'Update: Turned $10k into $25k over 2 years with dividend stocks. Not sexy, but it''s honest work. Reinvesting every dividend.', 
     NOW() - INTERVAL '19 hours'),
     
    (seed_user_id, 'Finally hit $100k net worth at 28! Took 6 years of consistent investing. $500/month into index funds. Boring but it works.', 
     NOW() - INTERVAL '21 hours'),
     
    -- Losses and lessons
    (seed_user_id, 'Lost $5k on $TSLA options last week. Learned my lesson: Don''t bet against Elon, and don''t play with money you can''t afford to lose.', 
     NOW() - INTERVAL '23 hours'),
     
    (seed_user_id, 'Panic sold during yesterday''s dip. Stock recovered today. Down $2k. Why do I keep doing this to myself?', 
     NOW() - INTERVAL '2 days'),
     
    -- Market commentary
    (seed_user_id, 'Fed meeting next week. Rate cut expected but not guaranteed. Markets pricing in 25bps. If they hold, we dump. Thoughts?', 
     NOW() - INTERVAL '2 days'),
     
    (seed_user_id, 'S&P 500 at all-time highs but my portfolio is still down 5% YTD. How is this possible? Oh right, I pick individual stocks like an idiot.', 
     NOW() - INTERVAL '3 days'),
     
    (seed_user_id, 'China stimulus news hitting. $BABA up 12% pre-market. Anyone else loading up on Chinese stocks or is this a trap?', 
     NOW() - INTERVAL '3 days');

  RAISE NOTICE '✅ Posts inserted successfully!';

  -- =====================================================
  -- VERIFICATION
  -- =====================================================
  RAISE NOTICE '';
  RAISE NOTICE '📊 SEED DATA SUMMARY:';
  RAISE NOTICE '==========================================';
  RAISE NOTICE 'Total posts created: %', (SELECT COUNT(*) FROM posts WHERE author_id = seed_user_id);
  RAISE NOTICE 'User account: %', (SELECT username FROM profiles WHERE id = seed_user_id);
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Your feed is now populated!';
  RAISE NOTICE '🚀 Go to your app and start engaging with posts';
  RAISE NOTICE '';
  RAISE NOTICE '💡 TIP: Sign up with more accounts to create';
  RAISE NOTICE '   a more realistic multi-user community!';

END $$;

-- Show recent posts
SELECT 
  p.content,
  p.created_at,
  prof.username as author
FROM posts p
JOIN profiles prof ON p.author_id = prof.id
ORDER BY p.created_at DESC
LIMIT 10;
