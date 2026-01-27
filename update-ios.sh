#!/bin/bash

# TradeTalk iOS Update & Sync Script
# This script ensures everything is properly set up and synced

echo "🚀 TradeTalk iOS Update & Sync"
echo "================================"
echo ""

# Step 1: Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules not found. Installing dependencies..."
    npm install
else
    echo "✓ node_modules found"
fi

# Step 2: Check if @capacitor/cli is installed
if [ ! -f "node_modules/.bin/cap" ]; then
    echo "⚠️  Capacitor CLI not found. Installing..."
    npm install @capacitor/cli --save-dev
else
    echo "✓ Capacitor CLI found"
fi

# Step 3: Build the web app
echo ""
echo "📦 Building web app..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✓ Build successful"

# Step 4: Sync with iOS
echo ""
echo "🔄 Syncing with iOS..."
./node_modules/.bin/cap sync ios

if [ $? -ne 0 ]; then
    echo "❌ Sync failed!"
    exit 1
fi

echo "✓ Sync successful"

# Step 5: Summary
echo ""
echo "================================"
echo "✅ All Done!"
echo ""
echo "Next steps:"
echo "1. Open Xcode: npm run ios:open"
echo "   OR: open ios/App/App.xcworkspace"
echo ""
echo "2. In Xcode:"
echo "   - Select your device/simulator"
echo "   - Click Run (▶️) button"
echo ""
echo "3. Or run directly: npm run ios:run"
echo "================================"
