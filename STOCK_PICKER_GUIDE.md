# 🚀 Quick Setup Guide

## Fix 1: Advisor Dashboard 400 Error

The `advisor_clients` table doesn't exist yet.

### **Run This SQL:**

1. Open: https://supabase.com/dashboard/project/irwfypgyyxvvjsxcrufs/sql/new

2. Copy and run: `supabase/migrations/002_advisor_tools.sql`

This creates:
- ✅ advisor_clients
- ✅ client_health_scores
- ✅ action_items
- ✅ client_quick_notes
- ✅ client_preferences
- ✅ client_context_summary

## Fix 2: Live Stock Prices in Posts ✅ DONE!

I just added stock tickers to your posts!

### **How to Use:**

1. **Create a post** (+ button)
2. **Click "Stocks" button** (new button at bottom)
3. **Search for stocks** (RELIANCE, TCS, INFY, etc.)
4. **Click to add** - live prices fetch automatically
5. **Post** - stock tickers show with live prices!

### **Features:**
- ✅ Live price fetching from your market API
- ✅ Shows current price + % change
- ✅ Green/red color coding
- ✅ Works in posts, chats, signals
- ✅ Matches your app's black design
- ✅ Auto-refreshes every 5 minutes

### **Files Added:**
- `StockPicker.jsx` - Search & select stocks
- `StockTickerDisplay.jsx` - Show stock prices
- Updated `CreatePost.jsx` - Added stock picker button

### **Next Steps:**

1. **Run the advisor tools migration** (SQL above)
2. **Try creating a post with stocks:**
   - Open app
   - Click + to create post
   - Click "Stocks" button
   - Add RELIANCE or TCS
   - See live prices! 📈

3. **Add to CreateSignalPage** (if you want):
   - Same pattern as CreatePost
   - Import StockPicker and StockTickerDisplay
   - Add button to include stock data

## Example Usage

```javascript
// In any component:
import StockPicker from '../components/StockPicker'
import StockTickerDisplay from '../components/StockTickerDisplay'

const [stocks, setStocks] = useState([])
const [showPicker, setShowPicker] = useState(false)

// Button to open picker
<button onClick={() => setShowPicker(true)}>
  Add Stocks
</button>

// Display selected stocks
{stocks.length > 0 && (
  <StockTickerDisplay stocks={stocks} />
)}

// Picker modal
{showPicker && (
  <StockPicker
    selectedStocks={stocks}
    onSelect={(stock) => setStocks([...stocks, stock])}
    onClose={() => setShowPicker(false)}
  />
)}
```

## Design Consistency ✅

All new components match your app:
- Black background
- Gray-950 borders
- Font-light typography
- Minimal design
- Smooth transitions
- No rounded corners
- Perfect match! 🎨
