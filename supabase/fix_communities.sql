-- =====================================================
-- FIX: Handle existing communities table
-- Run this BEFORE add_categories_migration.sql
-- =====================================================

-- Check if communities table exists and fix slug column
DO $$
BEGIN
  -- If communities table exists, alter it
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'communities') THEN
    -- Drop NOT NULL constraint on slug if it exists
    ALTER TABLE communities ALTER COLUMN slug DROP NOT NULL;
    
    -- Add slug column if it doesn't exist
    ALTER TABLE communities ADD COLUMN IF NOT EXISTS slug TEXT;
    
    -- Add other missing columns
    ALTER TABLE communities ADD COLUMN IF NOT EXISTS cover_image TEXT;
    ALTER TABLE communities ADD COLUMN IF NOT EXISTS category TEXT;
    
    RAISE NOTICE 'Communities table updated successfully';
  END IF;
END $$;

-- Now run add_categories_migration.sql
SELECT 'Ready to run add_categories_migration.sql' as status;
