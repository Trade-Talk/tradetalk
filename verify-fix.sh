#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   TradeTalk - Fix Verification Script${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if migration file was archived
if [ -f "MIGRATION_ADD_PREDICTIONS.sql" ]; then
    echo -e "${RED}❌ Old migration file still exists${NC}"
    echo "   Run: mv MIGRATION_ADD_PREDICTIONS.sql ARCHIVED_MIGRATION_ADD_PREDICTIONS.sql"
elif [ -f "ARCHIVED_MIGRATION_ADD_PREDICTIONS.sql" ]; then
    echo -e "${GREEN}✅ Migration file archived${NC}"
else
    echo -e "${YELLOW}⚠️  Migration file not found (might be already deleted)${NC}"
fi

# Check if cleanup script exists
if [ -f "CLEANUP_PREDICTIONS.sql" ]; then
    echo -e "${GREEN}✅ Cleanup SQL script exists${NC}"
    echo "   ${YELLOW}Action needed:${NC} Run this in Supabase SQL Editor"
else
    echo -e "${RED}❌ Cleanup SQL script missing${NC}"
fi

# Check if cache tool exists
if [ -f "clear-cache.html" ]; then
    echo -e "${GREEN}✅ Browser cache tool exists${NC}"
    echo "   ${YELLOW}Action needed:${NC} Visit http://localhost:3000/clear-cache.html"
else
    echo -e "${RED}❌ Cache clearing tool missing${NC}"
fi

# Search for any remaining references
echo ""
echo -e "${BLUE}Searching for 'daily_predictions' in code...${NC}"
SEARCH_RESULTS=$(grep -r "daily_predictions" src/ 2>/dev/null || true)

if [ -z "$SEARCH_RESULTS" ]; then
    echo -e "${GREEN}✅ No code references found${NC}"
else
    echo -e "${RED}❌ Found references (need to remove):${NC}"
    echo "$SEARCH_RESULTS"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Next Steps:${NC}"
echo ""
echo "1. ${BLUE}Supabase:${NC} Run CLEANUP_PREDICTIONS.sql in SQL Editor"
echo "2. ${BLUE}Browser:${NC} Visit http://localhost:3000/clear-cache.html"
echo "3. ${BLUE}Restart:${NC} npm run dev"
echo ""
echo -e "${GREEN}Then check browser console for errors!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
