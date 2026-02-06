-- =====================================================
-- Add Category and Post Type Support to Posts
-- =====================================================
-- Run this in Supabase SQL Editor after running setup.sql
-- Safe to run multiple times - won't error if columns exist
-- =====================================================

-- Drop existing constraints if they exist (ignore errors)
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_post_type_check;
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_category_check;

-- Add new columns to posts table
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS post_type TEXT DEFAULT 'general',
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS discussion_topic TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS debate_sides JSONB;

-- Add constraints
DO $$ 
BEGIN
  ALTER TABLE posts ADD CONSTRAINT posts_post_type_check 
    CHECK (post_type IN ('general', 'discussion', 'debate'));
EXCEPTION 
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ 
BEGIN
  ALTER TABLE posts ADD CONSTRAINT posts_category_check 
    CHECK (category IN ('Crypto', 'Stocks', 'Options', 'Futures', 'Forex', 'Commodities', 'ETFs', 'General'));
EXCEPTION 
  WHEN duplicate_object THEN NULL;
END $$;

-- Create indexes for category filtering
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category) WHERE category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(post_type);

-- =====================================================
-- Debate Votes Table (for debates)
-- =====================================================
CREATE TABLE IF NOT EXISTS debate_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  side TEXT CHECK (side IN ('for', 'against')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Indexes for debate_votes
CREATE INDEX IF NOT EXISTS idx_debate_votes_post ON debate_votes(post_id);
CREATE INDEX IF NOT EXISTS idx_debate_votes_user ON debate_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_debate_votes_side ON debate_votes(post_id, side);

-- Enable RLS for debate_votes
ALTER TABLE debate_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for debate_votes (drop existing first)
DROP POLICY IF EXISTS "Debate votes are viewable by everyone" ON debate_votes;
DROP POLICY IF EXISTS "Users can vote on debates" ON debate_votes;
DROP POLICY IF EXISTS "Users can change their vote" ON debate_votes;
DROP POLICY IF EXISTS "Users can remove their vote" ON debate_votes;

CREATE POLICY "Debate votes are viewable by everyone"
  ON debate_votes FOR SELECT
  USING (true);

CREATE POLICY "Users can vote on debates"
  ON debate_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can change their vote"
  ON debate_votes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can remove their vote"
  ON debate_votes FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- Communities Table
-- =====================================================
CREATE TABLE IF NOT EXISTS communities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT,
  description TEXT,
  icon TEXT,
  cover_image TEXT,
  category TEXT,
  member_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Communities are viewable by everyone" ON communities;
CREATE POLICY "Communities are viewable by everyone"
  ON communities FOR SELECT
  USING (is_public = true);

-- =====================================================
-- Community Members Table
-- =====================================================
CREATE TABLE IF NOT EXISTS community_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, community_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_community_members_user ON community_members(user_id);
CREATE INDEX IF NOT EXISTS idx_community_members_community ON community_members(community_id);

-- Enable RLS
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Community members are viewable by everyone" ON community_members;
DROP POLICY IF EXISTS "Users can join communities" ON community_members;
DROP POLICY IF EXISTS "Users can leave communities" ON community_members;

CREATE POLICY "Community members are viewable by everyone"
  ON community_members FOR SELECT
  USING (true);

CREATE POLICY "Users can join communities"
  ON community_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave communities"
  ON community_members FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- Insert Default Communities
-- =====================================================
INSERT INTO communities (name, slug, description, icon, is_public, member_count)
VALUES
  ('Crypto Traders', 'crypto-traders', 'Discussion and analysis of cryptocurrency markets', '₿', true, 1245),
  ('Stock Market', 'stock-market', 'Traditional stock market investing and trading', '📈', true, 3421),
  ('Options Trading', 'options-trading', 'Options strategies and market analysis', '📊', true, 892),
  ('Day Trading', 'day-trading', 'Intraday trading strategies and setups', '⚡', true, 2156),
  ('Long-term Investing', 'long-term-investing', 'Value investing and long-term strategies', '🎯', true, 1876),
  ('Technical Analysis', 'technical-analysis', 'Charts, patterns, and technical indicators', '📉', true, 1543),
  ('Fundamental Analysis', 'fundamental-analysis', 'Company research and valuation', '🔍', true, 987),
  ('Real Estate', 'real-estate', 'Real estate investing and REITs', '🏠', true, 654)
ON CONFLICT DO NOTHING;

-- =====================================================
-- Migration Complete!
-- =====================================================

SELECT 'Migration completed successfully!' as status;
