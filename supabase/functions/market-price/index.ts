import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    })
  }

  try {
    const url = new URL(req.url)
    const symbol = url.searchParams.get('symbol')
    const exchange = url.searchParams.get('exchange') || 'NSE'
    
    if (!symbol) {
      return new Response(JSON.stringify({ 
        error: 'Symbol parameter is required' 
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    // Format symbol for Yahoo Finance
    const yahooSymbol = `${symbol.toUpperCase()}.${exchange === 'BSE' ? 'BO' : 'NS'}`
    
    console.log(`Fetching price for: ${yahooSymbol}`)
    
    // Try primary Yahoo Finance API
    let currentPrice = null
    let source = 'unknown'
    
    try {
      const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1m&range=1d`
      const response = await fetch(yahooUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.chart && data.chart.result && data.chart.result.length > 0) {
          const result = data.chart.result[0]
          const meta = result.meta
          currentPrice = meta.regularMarketPrice || meta.previousClose
          source = 'yahoo-v8'
        }
      }
    } catch (e) {
      console.error('Yahoo v8 API failed:', e.message)
    }
    
    // Fallback to Yahoo v7 Quote API
    if (!currentPrice) {
      try {
        const yahooUrl = `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${yahooSymbol}`
        const response = await fetch(yahooUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          
          if (data.quoteResponse && data.quoteResponse.result && data.quoteResponse.result.length > 0) {
            const quote = data.quoteResponse.result[0]
            currentPrice = quote.regularMarketPrice || quote.previousClose
            source = 'yahoo-v7'
          }
        }
      } catch (e) {
        console.error('Yahoo v7 API failed:', e.message)
      }
    }
    
    if (!currentPrice) {
      throw new Error('Unable to fetch price from any source')
    }
    
    console.log(`Successfully fetched ${yahooSymbol}: ₹${currentPrice} (${source})`)
    
    return new Response(JSON.stringify({
      symbol: symbol,
      exchange: exchange,
      yahooSymbol: yahooSymbol,
      price: currentPrice,
      source: source,
      timestamp: Date.now()
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=60' // Cache for 1 minute
      }
    })
    
  } catch (error) {
    console.error('Error:', error.message)
    
    return new Response(JSON.stringify({
      error: error.message,
      timestamp: Date.now()
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
})
