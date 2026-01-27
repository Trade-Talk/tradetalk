#!/bin/bash

# Test Market Data API - Comprehensive test script

echo "🧪 Testing Market Data API..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Read .env file
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    exit 1
fi

# Extract Supabase URL and key
SUPABASE_URL=$(grep VITE_SUPABASE_URL .env | cut -d '=' -f2)
SUPABASE_KEY=$(grep VITE_SUPABASE_ANON_KEY .env | cut -d '=' -f2)

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
    echo -e "${RED}❌ Supabase credentials not found in .env${NC}"
    exit 1
fi

echo "📍 Supabase URL: $SUPABASE_URL"
echo ""

# Test symbols
SYMBOLS=("RELIANCE" "TCS" "INFY" "HDFC" "ICICIBANK")
EXCHANGE="NSE"

success_count=0
fail_count=0

echo "Testing ${#SYMBOLS[@]} stocks..."
echo "─────────────────────────────────────"
echo ""

for SYMBOL in "${SYMBOLS[@]}"; do
    echo -n "Testing $SYMBOL... "
    
    URL="${SUPABASE_URL}/functions/v1/market-price?symbol=${SYMBOL}&exchange=${EXCHANGE}"
    
    # Make request
    RESPONSE=$(curl -s "$URL" \
        -H "Authorization: Bearer $SUPABASE_KEY" \
        -H "Content-Type: application/json" \
        -w "\n%{http_code}")
    
    # Extract HTTP code (last line)
    HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" == "200" ]; then
        # Parse price from JSON
        PRICE=$(echo "$BODY" | grep -o '"price":[0-9.]*' | cut -d':' -f2)
        
        if [ ! -z "$PRICE" ]; then
            echo -e "${GREEN}✅ ₹${PRICE}${NC}"
            ((success_count++))
        else
            echo -e "${RED}❌ No price in response${NC}"
            ((fail_count++))
        fi
    else
        echo -e "${RED}❌ HTTP $HTTP_CODE${NC}"
        ERROR=$(echo "$BODY" | grep -o '"error":"[^"]*"' | cut -d':' -f2- | tr -d '"')
        if [ ! -z "$ERROR" ]; then
            echo "   Error: $ERROR"
        fi
        ((fail_count++))
    fi
    
    # Small delay to avoid rate limiting
    sleep 0.5
done

echo ""
echo "─────────────────────────────────────"
echo ""

# Summary
echo "📊 Test Summary:"
echo "   Passed: ${GREEN}${success_count}/${#SYMBOLS[@]}${NC}"
echo "   Failed: ${RED}${fail_count}/${#SYMBOLS[@]}${NC}"
echo ""

if [ $fail_count -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed${NC}"
    echo ""
    echo "Troubleshooting tips:"
    echo "1. Check if Edge Function is deployed:"
    echo "   supabase functions list"
    echo ""
    echo "2. Check function logs:"
    echo "   supabase functions logs market-price"
    echo ""
    echo "3. Verify .env credentials are correct"
    echo ""
    echo "4. Try deploying again:"
    echo "   supabase functions deploy market-price"
    exit 1
fi
