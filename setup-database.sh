#!/bin/bash

echo "🚀 Setting up TradeTalk Database..."
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   brew install supabase/tap/supabase"
    exit 1
fi

# Check if we're linked to a project
if [ ! -f ".supabase/config.toml" ]; then
    echo "❌ Not linked to a Supabase project."
    echo ""
    echo "Run one of:"
    echo "  supabase link --project-ref irwfypgyyxvvjsxcrufs"
    echo "  supabase init (for local development)"
    exit 1
fi

echo "📊 Running database migrations..."
echo ""

# Run the migration
supabase db push

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Sign up in your app to create a test user"
    echo "2. The profile will be auto-created via database trigger"
    echo "3. Start using the app!"
else
    echo ""
    echo "❌ Migration failed. Check the errors above."
    echo ""
    echo "You can also run the SQL manually:"
    echo "1. Go to: https://supabase.com/dashboard/project/irwfypgyyxvvjsxcrufs/editor"
    echo "2. Open: supabase/migrations/001_initial_schema.sql"
    echo "3. Copy and paste the SQL into the SQL editor"
    echo "4. Click 'Run'"
fi
