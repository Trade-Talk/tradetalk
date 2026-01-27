-- ==================== CLEANUP SCRIPT ====================
-- Run this in Supabase SQL Editor if daily_predictions table exists
-- This will completely remove the unused prediction feature

-- Drop tables if they exist
DROP TABLE IF EXISTS daily_predictions CASCADE;
DROP TABLE IF EXISTS prediction_stats CASCADE;

-- ==================== CLEANUP COMPLETE ====================
-- The following tables have been removed:
-- ❌ daily_predictions
-- ❌ prediction_stats
--
-- These tables were not being used by the application.
-- The app focuses on smart signals instead.
