#!/bin/bash

# Fix User Type Migration Script
# This script applies the migration to fix the user_type issue

echo "🔧 Applying user_type fix migration..."
echo ""
echo "This will:"
echo "1. Add 'learner' as a valid user_type option"
echo "2. Fix the trigger to properly set user_type from signup metadata"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Apply the migration
echo "📦 Applying migration..."
supabase db push

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration applied successfully!"
    echo ""
    echo "🎯 Next steps:"
    echo "1. Try registering as an investor again"
    echo "2. Check your profile to verify the user_type is correct"
    echo ""
    echo "Note: If you have existing test accounts with wrong user_type,"
    echo "you can update them manually in the Supabase dashboard:"
    echo "Go to Table Editor > profiles > find your user > edit user_type column"
else
    echo ""
    echo "❌ Migration failed. Please check the error above."
    echo ""
    echo "Alternative: You can manually run the SQL in Supabase Dashboard:"
    echo "1. Go to SQL Editor in your Supabase project"
    echo "2. Copy and paste the contents of:"
    echo "   supabase/migrations/003_fix_user_type_trigger.sql"
    echo "3. Click Run"
    exit 1
fi
