-- =====================================================
-- SEED DATA - REAL POSTS FOR TESTING
-- Run this AFTER add_categories_migration.sql
-- =====================================================

DO $$
DECLARE
  seed_user_id UUID;
BEGIN
  -- Get the first user ID
  SELECT id INTO seed_user_id FROM profiles ORDER BY created_at ASC LIMIT 1;
  
  IF seed_user_id IS NULL THEN
    RAISE EXCEPTION 'No users found. Please create at least one user account first by signing up.';
  END IF;

  RAISE NOTICE 'Using user ID: %', seed_user_id;

  -- =====================================================
  -- CRYPTO POSTS
  -- =====================================================
  
  INSERT INTO posts (author_id, content, post_type, category, created_at) VALUES
  (seed_user_id, 'Just went all-in on $BTC at $95k. Either retiring next year or living in my car. No in between. 🚀', 'general', 'Crypto', NOW() - INTERVAL '2 hours'),
  (seed_user_id, '$ETH staking rewards are insane right now. 4.2% APY and you''re helping secure the network. Win-win.', 'general', 'Crypto', NOW() - INTERVAL '5 hours'),
  (seed_user_id, 'Anyone else think $SOL is way undervalued at $180? The speed and low fees make it a no-brainer for DeFi.', 'general', 'Crypto', NOW() - INTERVAL '8 hours'),
  (seed_user_id, 'Reminder: Not your keys, not your crypto. Just moved everything off exchanges to cold storage. Sleep better now.', 'general', 'Crypto', NOW() - INTERVAL '1 day'),
  (seed_user_id, 'Bought the $ETH dip at $3,200. Already up 8%. Sometimes you just gotta trust your gut.', 'general', 'Crypto', NOW() - INTERVAL '15 hours');

  -- =====================================================
  -- STOCK POSTS
  -- =====================================================
  
  INSERT INTO posts (author_id, content, post_type, category, created_at) VALUES
  (seed_user_id, '$NVDA earnings next week. Expecting a beat but stock might still drop because market is irrational. Classic sell the news.', 'general', 'Stocks', NOW() - INTERVAL '3 hours'),
  (seed_user_id, 'Bought 50 shares of $AAPL at $225. Long-term hold. Warren Buffett can''t be wrong... right? 📈', 'general', 'Stocks', NOW() - INTERVAL '6 hours'),
  (seed_user_id, '$TSLA down 8% today. Elon tweeted something stupid again. At this point I''m numb to it.', 'general', 'Stocks', NOW() - INTERVAL '9 hours'),
  (seed_user_id, '$MSFT is printing money with Azure. Cloud revenue up 30% YoY. This is my largest position and I''m not selling.', 'general', 'Stocks', NOW() - INTERVAL '1 day'),
  (seed_user_id, 'Finally green on $AMD. Held through a 40% drawdown. Diamond hands paid off 💎', 'general', 'Stocks', NOW() - INTERVAL '18 hours');

  -- =====================================================
  -- OPTIONS POSTS
  -- =====================================================
  
  INSERT INTO posts (author_id, content, post_type, category, created_at) VALUES
  (seed_user_id, 'Sold $SPY 580 calls expiring Friday. Free money if we stay below that. Theta gang wins again. ⏰', 'general', 'Options', NOW() - INTERVAL '4 hours'),
  (seed_user_id, 'Buying $AMZN LEAPs for Jan 2027. $200 strike. Gonna forget about this for 2 years and hopefully 10x.', 'general', 'Options', NOW() - INTERVAL '7 hours'),
  (seed_user_id, 'Iron condor on $GOOGL paid off. Collected $2,400 premium. Stock literally did nothing. Perfect. 🦅', 'general', 'Options', NOW() - INTERVAL '10 hours');

  -- =====================================================
  -- FUTURES POSTS
  -- =====================================================
  
  INSERT INTO posts (author_id, content, post_type, category, created_at) VALUES
  (seed_user_id, 'Gold futures looking bullish. Fed rate cuts incoming = gold moon mission. Loaded up at $2,650.', 'general', 'Futures', NOW() - INTERVAL '5 hours'),
  (seed_user_id, 'Oil futures got destroyed today. Down 6%. OPEC drama + weak China data = perfect storm.', 'general', 'Futures', NOW() - INTERVAL '11 hours');

  -- =====================================================
  -- GENERAL TRADING POSTS
  -- =====================================================
  
  INSERT INTO posts (author_id, content, post_type, category, created_at) VALUES
  (seed_user_id, 'Rule #1: Cut losses early. Rule #2: Let winners run. Rule #3: Ignore both rules when emotional. Working on Rule #3.', 'general', 'General', NOW() - INTERVAL '1 hour'),
  (seed_user_id, 'Been trading for 3 years. Finally had my first profitable month. Only took 35 months of losses. Progress! 💪', 'general', 'General', NOW() - INTERVAL '12 hours'),
  (seed_user_id, 'Portfolio update: 60% stocks, 30% crypto, 10% cash. Feel like I''m diversified but also feel like I''m not in enough meme stocks.', 'general', 'General', NOW() - INTERVAL '20 hours');

  -- =====================================================
  -- DISCUSSIONS
  -- =====================================================

  INSERT INTO posts (author_id, content, post_type, discussion_topic, tags, created_at) VALUES
  (seed_user_id, 'I see a lot of new traders going all-in on meme stocks and crypto without any risk management. My advice: Never risk more than 2-5% of your portfolio on a single trade. Also, always use stop losses. What are your thoughts on position sizing?', 'discussion', 'Best risk management strategies for beginners?', ARRAY['risk-management', 'beginners', 'strategy'], NOW() - INTERVAL '6 hours'),
  (seed_user_id, 'I''ve been reading up on value investing vs growth investing. Warren Buffett swears by value, but Cathie Wood goes all-in on growth. In 2025, which makes more sense? Tech is expensive but also driving innovation. What''s your approach?', 'discussion', 'Value investing vs growth investing in 2025', ARRAY['investing', 'strategy', 'value-vs-growth'], NOW() - INTERVAL '10 hours'),
  (seed_user_id, 'Made $50k this year day trading. Lost $48k. Net $2k. Spent 8 hours a day glued to charts. Could''ve made more working at Starbucks. Anyone else realize day trading is a trap or am I missing something?', 'discussion', 'Is day trading actually profitable long-term?', ARRAY['day-trading', 'profitability', 'reality-check'], NOW() - INTERVAL '14 hours'),
  (seed_user_id, 'I''m 25, make $80k/year, have $30k saved. Should I: A) Max out my Roth IRA B) Pay off student loans ($15k at 4.5%) C) YOLO into tech stocks D) Do all three somehow? What would you prioritize?', 'discussion', 'How to allocate savings at 25?', ARRAY['personal-finance', 'investing', 'advice'], NOW() - INTERVAL '18 hours'),
  (seed_user_id, 'Banks offering 4.5% on savings accounts right now. Meanwhile $SPY returns 12% average annually. Why are people keeping cash in savings when index funds exist? Am I missing something about liquidity/safety?', 'discussion', 'Savings account vs index funds in 2025', ARRAY['savings', 'investing', 'returns'], NOW() - INTERVAL '1 day'),
  (seed_user_id, 'Reading "The Intelligent Investor" by Benjamin Graham. It''s from 1949 but the principles still feel relevant. What books actually changed how you invest? Looking for recommendations.', 'discussion', 'Must-read investing books', ARRAY['books', 'learning', 'education'], NOW() - INTERVAL '1 day');

  -- =====================================================
  -- DEBATES
  -- =====================================================

  INSERT INTO posts (author_id, content, post_type, debate_sides, created_at) VALUES
  (seed_user_id, 'The great debate of our time. Which side are you on?', 'debate', '{"for": "Bitcoin is digital gold. Finite supply (21M), decentralized, no government can print more. Ultimate inflation hedge. Already proven itself over 15 years. Institutional adoption is accelerating. This is the future of money.", "against": "Bitcoin uses more energy than Argentina. Transaction fees spike during volatility. No intrinsic value. Can''t buy coffee with it. Governments will regulate it to death. Tulip mania 2.0. Gold has 5,000 years of history, Bitcoin has 15."}', NOW() - INTERVAL '8 hours'),
  (seed_user_id, 'The eternal question. What do you think?', 'debate', '{"for": "Time in market beats timing the market. DCA removes emotion, averages out volatility, and is backed by decades of data. You can''t predict bottoms. Just keep buying. Math doesn''t lie.", "against": "If you know a crash is coming, why keep buying? Smart money sells before corrections and buys the dip. DCA is for people who don''t want to think. Timing works if you''re disciplined and informed."}', NOW() - INTERVAL '12 hours'),
  (seed_user_id, 'Housing market edition. Pick a side.', 'debate', '{"for": "Rent is throwing money away. Mortgage builds equity. Tax benefits. Pride of ownership. Forced savings. In 30 years you own an asset. Renters own nothing.", "against": "Buying ties you down. Maintenance, property tax, HOA fees add 30%+ to mortgage. Market can crash (see 2008). Renting = flexibility. Invest the difference in stocks. Home ownership is a lifestyle choice, not an investment."}', NOW() - INTERVAL '16 hours'),
  (seed_user_id, 'The AI stock showdown.', 'debate', '{"for": "$NVDA is the king of AI chips. 95% market share in GPUs. Every AI company needs them. Revenue up 200%+ YoY. This is the new oil. Bet on the picks and shovels.", "against": "$NVDA is priced for perfection. P/E of 50+. Competition from AMD, Intel, and custom chips is heating up. When the AI bubble pops, NVDA falls hardest. Already 10x, how much higher can it go?"}', NOW() - INTERVAL '20 hours'),
  (seed_user_id, 'Active vs passive investing.', 'debate', '{"for": "ETFs give you instant diversification, low fees (0.03%), and match market returns. 90% of active managers underperform the S&P 500. Why pay 1% fees to lose? Just buy $VOO and forget it.", "against": "Active trading lets you capitalize on opportunities. ETFs are mediocre by design. With research and discipline, you can beat the market. All the greats—Buffett, Dalio, Lynch—were active. Passive is for people who give up."}', NOW() - INTERVAL '1 day');

  RAISE NOTICE 'Successfully inserted seed data!';
  
END $$;

-- =====================================================
-- Show results
-- =====================================================

SELECT 
  (SELECT COUNT(*) FROM posts WHERE post_type = 'general') as general_posts,
  (SELECT COUNT(*) FROM posts WHERE post_type = 'discussion') as discussions,
  (SELECT COUNT(*) FROM posts WHERE post_type = 'debate') as debates,
  (SELECT COUNT(*) FROM posts) as total_posts;

SELECT '🎉 Seed data inserted successfully!' as status;
SELECT '✅ Feed is now populated with 29 real posts!' as message;
SELECT '🚀 Ready for users to interact!' as ready;
