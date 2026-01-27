# Market Data API - CORS Solution

## Problem: Yahoo Finance API blocked by CORS

When calling Yahoo Finance API directly from the browser, you'll get CORS errors because Yahoo doesn't allow cross-origin requests from web apps.

## Solution Options

### Option 1: Backend Proxy (Recommended)

Create a simple backend API endpoint that fetches from Yahoo Finance and forwards to your frontend.

#### Using Supabase Edge Functions

1. Create a new Edge Function:

```bash
supabase functions new market-price
```

2. Add this code to `supabase/functions/market-price/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })
  }

  try {
    const url = new URL(req.url)
    const symbol = url.searchParams.get('symbol')
    const exchange = url.searchParams.get('exchange') || 'NSE'
    
    if (!symbol) {
      return new Response(JSON.stringify({ error: 'Symbol required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const yahooSymbol = `${symbol}.${exchange === 'BSE' ? 'BO' : 'NS'}`
    
    // Fetch from Yahoo Finance
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1m&range=1d`
    const response = await fetch(yahooUrl)
    const data = await response.json()
    
    const result = data.chart.result[0]
    const meta = result.meta
    const currentPrice = meta.regularMarketPrice || meta.previousClose
    
    return new Response(JSON.stringify({
      symbol: symbol,
      price: currentPrice,
      timestamp: Date.now()
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
    
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
})
```

3. Deploy:

```bash
supabase functions deploy market-price
```

4. Update `marketData.js` to use the proxy:

```javascript
async function fetchFromSupabaseProxy(symbol, exchange) {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
  const url = `${SUPABASE_URL}/functions/v1/market-price?symbol=${symbol}&exchange=${exchange}`
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
    }
  })
  
  if (!response.ok) throw new Error('Proxy failed')
  
  const data = await response.json()
  return data.price
}
```

---

### Option 2: CORS Proxy Service (Quick Fix)

Use a free CORS proxy service:

```javascript
async function fetchWithCORSProxy(yahooSymbol) {
  const proxyUrl = 'https://api.allorigins.win/raw?url='
  const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}`
  const url = proxyUrl + encodeURIComponent(yahooUrl)
  
  const response = await fetch(url)
  const data = await response.json()
  
  const result = data.chart.result[0]
  return result.meta.regularMarketPrice
}
```

**Warning:** Free CORS proxies are unreliable and may have rate limits.

---

### Option 3: Chrome Extension (For Development)

Install "CORS Unblock" extension for Chrome during development.

**Steps:**
1. Install from Chrome Web Store
2. Enable the extension
3. Reload your app
4. APIs should work

**Warning:** Only for development! Won't work for real users.

---

### Option 4: Use Alternative APIs

#### Alphavantage (Free tier available)

```javascript
async function fetchFromAlphavantage(symbol) {
  const API_KEY = 'YOUR_API_KEY' // Get from alphavantage.co
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}.BSE&apikey=${API_KEY}`
  
  const response = await fetch(url)
  const data = await response.json()
  
  return parseFloat(data['Global Quote']['05. price'])
}
```

#### Finnhub (Free tier available)

```javascript
async function fetchFromFinnhub(symbol) {
  const API_KEY = 'YOUR_API_KEY' // Get from finnhub.io
  const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}.NS&token=${API_KEY}`
  
  const response = await fetch(url)
  const data = await response.json()
  
  return data.c // Current price
}
```

---

## Recommended Implementation Steps

### Step 1: Create Supabase Edge Function (5 minutes)

```bash
cd v2-social-hybrid

# Create function
supabase functions new market-price

# Add the TypeScript code above

# Deploy
supabase functions deploy market-price
```

### Step 2: Update marketData.js

Add this function at the top of `src/lib/marketData.js`:

```javascript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

async function fetchFromSupabaseProxy(symbol, exchange) {
  const url = `${SUPABASE_URL}/functions/v1/market-price?symbol=${symbol}&exchange=${exchange}`
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  })
  
  if (!response.ok) {
    throw new Error(`Supabase proxy error: ${response.status}`)
  }
  
  const data = await response.json()
  
  if (data.error) {
    throw new Error(data.error)
  }
  
  return data.price
}
```

Then update the `getCurrentPrice` sources array:

```javascript
const sources = [
  () => fetchFromSupabaseProxy(symbol, exchange), // Try proxy first
  () => fetchFromYahooFinance(yahooSymbol),
  () => fetchFromYahooQuery2(yahooSymbol),
]
```

### Step 3: Test

Navigate to `/market-data-test` and try fetching a price. Should work now!

---

## Testing Without Backend

If you want to test without setting up the backend proxy:

1. **Use Mock Data Temporarily:**

```javascript
// In marketData.js, at the top
const USE_MOCK_FOR_TESTING = true

export async function getCurrentPrice(symbol, exchange = 'NSE') {
  if (USE_MOCK_FOR_TESTING) {
    console.log('⚠️ Using mock data')
    return getMockPrice(symbol)
  }
  
  // ... rest of the code
}
```

2. **Or install CORS extension** for Chrome (development only)

---

## Why CORS Blocks APIs

1. **Browser Security**: Browsers block requests to different domains by default
2. **Yahoo's Policy**: Yahoo Finance doesn't set `Access-Control-Allow-Origin: *`
3. **Solution**: Either use a backend proxy OR use APIs that allow CORS

---

## Quick Fix Right Now

Add this to `marketData.js` temporarily:

```javascript
// At the very top of getCurrentPrice()
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  console.warn('⚠️ CORS may block this request. See MARKET_DATA_CORS_SOLUTION.md')
  console.warn('Quick fix: Install "CORS Unblock" Chrome extension')
}
```

Then install "CORS Unblock" Chrome extension and it should work!

---

## Production Solution

For production, **ALWAYS use a backend proxy** (Option 1). Never rely on:
- CORS browser extensions (only work locally)
- Public CORS proxies (unreliable and slow)
- Client-side API calls to Yahoo (will fail for users)

The Supabase Edge Function solution is perfect because:
- ✅ Hosted on the same Supabase project
- ✅ No extra infrastructure needed
- ✅ Scales automatically
- ✅ Free tier is generous
- ✅ Low latency
