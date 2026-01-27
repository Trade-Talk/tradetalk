#!/bin/bash

# Deploy Market Price Edge Function to Supabase

echo "🚀 Deploying market-price Edge Function..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found!"
    echo "Install it with: npm install -g supabase"
    exit 1
fi

# Deploy the function
supabase functions deploy market-price

if [ $? -eq 0 ]; then
    echo "✅ Function deployed successfully!"
    echo ""
    echo "📝 Your Edge Function URL:"
    echo "https://YOUR_PROJECT_REF.supabase.co/functions/v1/market-price"
    echo ""
    echo "🧪 Test it with:"
    echo "curl 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/market-price?symbol=RELIANCE&exchange=NSE' \\"
    echo "  -H 'Authorization: Bearer YOUR_ANON_KEY'"
else
    echo "❌ Deployment failed!"
    exit 1
fi
