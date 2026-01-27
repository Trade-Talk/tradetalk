// Market Data Service - Multiple fallback sources for Indian stock prices

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const priceCache = new Map()

// Supabase configuration for Edge Function proxy
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Fetch from Supabase Edge Function (solves CORS issues)
 */
async function fetchFromSupabaseProxy(symbol, exchange) {
  if (!SUPABASE_URL) {
    throw new Error('Supabase URL not configured')
  }
  
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

/**
 * Fetch current price for a stock symbol with multiple fallbacks
 * @param {string} symbol - Stock symbol (e.g., 'RELIANCE')
 * @param {string} exchange - Exchange ('NSE' or 'BSE')
 * @returns {Promise<number>} Current price
 */
export async function getCurrentPrice(symbol, exchange = 'NSE') {
  const yahooSymbol = `${symbol}.${exchange === 'BSE' ? 'BO' : 'NS'}`
  
  // Check cache first
  const cacheKey = yahooSymbol
  const cached = priceCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`📊 Using cached price for ${yahooSymbol}: ₹${cached.price}`)
    return cached.price
  }

  // Try multiple sources in order
  const sources = [
    () => fetchFromSupabaseProxy(symbol, exchange), // Try Supabase proxy first (solves CORS)
    () => fetchFromYahooFinance(yahooSymbol),
    () => fetchFromYahooQuery2(yahooSymbol),
    () => fetchFromAlternativeAPI(symbol, exchange)
  ]

  let lastError = null

  for (const fetchSource of sources) {
    try {
      console.log(`🔍 Attempting to fetch price for ${yahooSymbol}...`)
      const currentPrice = await fetchSource()
      
      if (currentPrice && currentPrice > 0) {
        // Cache the price
        priceCache.set(cacheKey, {
          price: currentPrice,
          timestamp: Date.now()
        })

        console.log(`✅ Live price for ${yahooSymbol}: ₹${currentPrice}`)
        return currentPrice
      }
    } catch (error) {
      console.warn(`⚠️ Source failed:`, error.message)
      lastError = error
      continue // Try next source
    }
  }

  // All sources failed - try cached data (even if expired)
  if (cached) {
    console.log(`⚠️ All sources failed, using expired cache for ${yahooSymbol}: ₹${cached.price}`)
    return cached.price
  }
  
  // Last resort - throw error with helpful message
  throw new Error(
    `Failed to fetch price for ${symbol}. ` +
    `This could be due to:\n` +
    `1. CORS restrictions (browser blocking request)\n` +
    `2. Market closed or invalid symbol\n` +
    `3. API rate limits\n` +
    `Original error: ${lastError?.message || 'Unknown'}`
  )
}

/**
 * Method 1: Yahoo Finance v8 Chart API
 */
async function fetchFromYahooFinance(yahooSymbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1m&range=1d`
  
  const response = await fetch(url, {
    mode: 'cors',
    headers: {
      'Accept': 'application/json'
    }
  })
  
  if (!response.ok) {
    throw new Error(`Yahoo Finance v8 API error: ${response.status}`)
  }
  
  const data = await response.json()
  
  if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
    throw new Error('Invalid response from Yahoo Finance')
  }
  
  const result = data.chart.result[0]
  const meta = result.meta
  const currentPrice = meta.regularMarketPrice || meta.previousClose
  
  if (!currentPrice) {
    throw new Error('Price not found in response')
  }

  return currentPrice
}

/**
 * Method 2: Yahoo Finance v7 Quote API
 */
async function fetchFromYahooQuery2(yahooSymbol) {
  const url = `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${yahooSymbol}`
  
  const response = await fetch(url, {
    mode: 'cors',
    headers: {
      'Accept': 'application/json'
    }
  })
  
  if (!response.ok) {
    throw new Error(`Yahoo Finance v7 API error: ${response.status}`)
  }
  
  const data = await response.json()
  
  if (!data.quoteResponse || !data.quoteResponse.result || data.quoteResponse.result.length === 0) {
    throw new Error('Invalid response from Yahoo Finance v7')
  }
  
  const quote = data.quoteResponse.result[0]
  const currentPrice = quote.regularMarketPrice || quote.previousClose
  
  if (!currentPrice) {
    throw new Error('Price not found in v7 response')
  }

  return currentPrice
}

/**
 * Method 3: Alternative API (you can integrate with your backend proxy)
 */
async function fetchFromAlternativeAPI(symbol, exchange) {
  // This is a placeholder - you would implement your own backend proxy here
  // Example: const response = await fetch(`/api/market/price?symbol=${symbol}&exchange=${exchange}`)
  
  throw new Error('Alternative API not configured')
}

/**
 * Fetch OHLC data for a stock
 */
export async function getOHLCData(symbol, exchange = 'NSE') {
  const yahooSymbol = `${symbol}.${exchange === 'BSE' ? 'BO' : 'NS'}`
  
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=1d`
    
    const response = await fetch(url, {
      mode: 'cors',
      headers: {
        'Accept': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      throw new Error('Invalid response structure')
    }
    
    const result = data.chart.result[0]
    const meta = result.meta
    
    const change = (meta.regularMarketPrice || meta.previousClose) - meta.chartPreviousClose
    const changePercent = (change / meta.chartPreviousClose) * 100
    
    return {
      open: meta.regularMarketOpen || meta.chartPreviousClose,
      high: meta.regularMarketDayHigh || meta.regularMarketPrice,
      low: meta.regularMarketDayLow || meta.regularMarketPrice,
      close: meta.regularMarketPrice || meta.previousClose,
      previousClose: meta.chartPreviousClose,
      change: change,
      changePercent: changePercent
    }
  } catch (error) {
    console.error('Error fetching OHLC data:', error)
    throw new Error(`OHLC fetch failed: ${error.message}`)
  }
}

/**
 * Check if market is currently open (IST timezone)
 */
export function isMarketOpen() {
  const now = new Date()
  
  // Convert to IST (UTC+5:30)
  const istOffset = 5.5 * 60 * 60 * 1000
  const istTime = new Date(now.getTime() + istOffset)
  
  const day = istTime.getUTCDay() // 0 = Sunday, 6 = Saturday
  const hours = istTime.getUTCHours()
  const minutes = istTime.getUTCMinutes()
  
  // Market closed on weekends
  if (day === 0 || day === 6) {
    return false
  }
  
  // Market hours: 9:15 AM to 3:30 PM IST
  const currentTime = hours * 60 + minutes
  const marketOpen = 9 * 60 + 15 // 9:15 AM
  const marketClose = 15 * 60 + 30 // 3:30 PM
  
  return currentTime >= marketOpen && currentTime < marketClose
}

/**
 * Get time until market opens/closes (IST timezone)
 */
export function getMarketStatus() {
  const now = new Date()
  
  // Convert to IST
  const istOffset = 5.5 * 60 * 60 * 1000
  const istTime = new Date(now.getTime() + istOffset)
  
  const day = istTime.getUTCDay()
  const hours = istTime.getUTCHours()
  const minutes = istTime.getUTCMinutes()
  const currentMinutes = hours * 60 + minutes
  
  const marketOpen = 9 * 60 + 15 // 9:15 AM
  const marketClose = 15 * 60 + 30 // 3:30 PM
  
  // Weekend
  if (day === 0 || day === 6) {
    const daysUntilMonday = day === 0 ? 1 : 2
    return {
      isOpen: false,
      nextEvent: 'open',
      message: `Market opens Monday at 9:15 AM IST`,
      daysUntil: daysUntilMonday
    }
  }
  
  // Before market open
  if (currentMinutes < marketOpen) {
    const minutesUntilOpen = marketOpen - currentMinutes
    return {
      isOpen: false,
      nextEvent: 'open',
      message: `Market opens in ${Math.floor(minutesUntilOpen / 60)}h ${minutesUntilOpen % 60}m`,
      minutesUntil: minutesUntilOpen
    }
  }
  
  // Market is open
  if (currentMinutes >= marketOpen && currentMinutes < marketClose) {
    const minutesUntilClose = marketClose - currentMinutes
    return {
      isOpen: true,
      nextEvent: 'close',
      message: `Market closes in ${Math.floor(minutesUntilClose / 60)}h ${minutesUntilClose % 60}m`,
      minutesUntil: minutesUntilClose
    }
  }
  
  // After market close
  return {
    isOpen: false,
    nextEvent: 'open',
    message: 'Market opens tomorrow at 9:15 AM IST',
    hoursUntil: 24 - (currentMinutes - marketOpen) / 60
  }
}

/**
 * Batch fetch prices for multiple symbols
 */
export async function getBatchPrices(symbols, exchange = 'NSE') {
  const prices = {}
  
  // Fetch in parallel with a delay to avoid rate limiting
  const results = await Promise.allSettled(
    symbols.map((symbol, index) => 
      new Promise(resolve => 
        setTimeout(async () => {
          try {
            const price = await getCurrentPrice(symbol, exchange)
            resolve({ symbol, price })
          } catch (error) {
            console.error(`Failed to fetch ${symbol}:`, error.message)
            resolve({ symbol, price: null })
          }
        }, index * 200) // 200ms delay between requests
      )
    )
  )
  
  results.forEach(result => {
    if (result.status === 'fulfilled' && result.value) {
      prices[result.value.symbol] = result.value.price
    }
  })
  
  return prices
}

/**
 * Clear price cache
 */
export function clearCache() {
  priceCache.clear()
  console.log('📊 Price cache cleared')
}

/**
 * Format price for display
 */
export function formatPrice(price) {
  if (!price) return '—'
  return `₹${price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Format change with color
 */
export function formatChange(change, changePercent) {
  const isPositive = change >= 0
  return {
    text: `${isPositive ? '+' : ''}${change.toFixed(2)} (${isPositive ? '+' : ''}${changePercent.toFixed(2)}%)`,
    color: isPositive ? 'text-green-600' : 'text-red-600',
    bgColor: isPositive ? 'bg-green-50' : 'bg-red-50',
    isPositive
  }
}

/**
 * Get mock data for testing (when APIs fail)
 */
export function getMockPrice(symbol) {
  const mockPrices = {
    'RELIANCE': 2456.75,
    'TCS': 3678.90,
    'INFY': 1456.30,
    'HDFC': 2789.45,
    'ICICIBANK': 989.60,
    'HDFCBANK': 1567.80,
    'BAJFINANCE': 6789.30,
    'BHARTIARTL': 876.45,
    'ITC': 456.70,
    'WIPRO': 567.80
  }
  
  return mockPrices[symbol.toUpperCase()] || 1000 + Math.random() * 1000
}

// Export all functions
export default {
  getCurrentPrice,
  getOHLCData,
  isMarketOpen,
  getMarketStatus,
  getBatchPrices,
  clearCache,
  formatPrice,
  formatChange,
  getMockPrice
}
