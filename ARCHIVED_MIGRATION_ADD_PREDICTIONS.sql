-- ==================== MIGRATION: ADD SENTIMENT VOTER TABLES ====================
-- Run this in Supabase SQL Editor to add daily prediction features

-- Daily Predictions Table
CREATE TABLE IF NOT EXISTS daily_predictions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  prediction VARCHAR(10) NOT NULL CHECK (prediction IN ('bullish', 'bearish')),
  predicted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  result_calculated BOOLEAN DEFAULT FALSE,
  was_correct BOOLEAN,
  actual_direction VARCHAR(10),
  nifty_open DECIMAL(10, 2),
  nifty_close DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Prediction Stats Table
CREATE TABLE IF NOT EXISTS prediction_stats (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  total_predictions INTEGER DEFAULT 0,
  correct_predictions INTEGER DEFAULT 0,
  accuracy DECIMAL(5, 2) DEFAULT 0,
  streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  last_prediction_date DATE,
  badges TEXT[] DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_daily_predictions_user_date ON daily_predictions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_predictions_date ON daily_predictions(date DESC);

-- Enable RLS
ALTER TABLE daily_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_predictions
DROP POLICY IF EXISTS "Users can view own predictions" ON daily_predictions;
CREATE POLICY "Users can view own predictions"
  ON daily_predictions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own predictions" ON daily_predictions;
CREATE POLICY "Users can create own predictions"
  ON daily_predictions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own predictions" ON daily_predictions;
CREATE POLICY "Users can update own predictions"
  ON daily_predictions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for prediction_stats
DROP POLICY IF EXISTS "Stats are viewable by everyone" ON prediction_stats;
CREATE POLICY "Stats are viewable by everyone"
  ON prediction_stats FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can update own stats" ON prediction_stats;
CREATE POLICY "Users can update own stats"
  ON prediction_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can upsert own stats" ON prediction_stats;
CREATE POLICY "Users can upsert own stats"
  ON prediction_stats FOR UPDATE
  USING (auth.uid() = user_id);

-- ==================== SUCCESS ====================
-- Migration complete! New tables added:
-- ✅ daily_predictions
-- ✅ prediction_stats
--
-- Users can now make daily market predictions!
