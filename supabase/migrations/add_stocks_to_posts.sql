-- Add stocks column to posts table
-- This allows posts to be tagged with stock tickers

ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS stocks JSONB DEFAULT NULL;

-- Add a comment to document the column
COMMENT ON COLUMN posts.stocks IS 'Array of stock objects with symbol, name, exchange, and price information';

-- Create an index for better query performance when filtering by stocks
CREATE INDEX IF NOT EXISTS idx_posts_stocks ON posts USING GIN (stocks);

-- Example stock structure:
-- [
--   {
--     "symbol": "RELIANCE",
--     "name": "Reliance Industries Limited",
--     "exchange": "NSE",
--     "price": 2450.50
--   }
-- ]
