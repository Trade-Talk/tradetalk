import axios from 'axios';

/**
 * Market Data Service for TradeTalk v2
 * 
 * Handles all market data fetching with multiple provider support:
 * - Finnhub (recommended for real-time)
 * - Alpha Vantage (good for free tier)
 * - NSE India (for Indian stocks)
 * 
 * Features:
 * - Smart caching to reduce API calls
 * - Fallback providers if primary fails
 * - Rate limiting protection
 * - WebSocket support for real-time updates
 */

const FINNHUB_KEY = import.meta.env.VITE_FINNHUB_KEY;
const ALPHA_VANTAGE_KEY = import.meta.env.VITE_ALPHA_VANTAGE_KEY;

// Cache configuration
const cache = new Map();
const CACHE_DURATION = 5000; // 5 seconds
const MAX_CACHE_SIZE = 100;

// Rate limiting
const apiCallTimestamps = [];
const MAX_CALLS_PER_MINUTE = 50;

class MarketDataService {
  
  constructor() {
    this.websocket = null;
    this.subscribers = new Map();
  }

  /**
   * Check if we're within rate limits
   */
  checkRateLimit() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Clean old timestamps
    while (apiCallTimestamps.length > 0 && apiCallTimestamps[0] < oneMinuteAgo) {
      apiCallTimestamps.shift();
    }
    
    if (apiCallTimestamps.length >= MAX_CALLS_PER_MINUTE) {
      console.warn('Rate limit reached, using cached data');
      return false;
    }
    
    apiCallTimestamps.push(now);
    return true;
  }

  /**
   * Get cached data if available
   */
  getFromCache(key) {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  /**
   * Store data in cache
   */
  setCache(key, data) {
    // Prevent cache from growing too large
    if (cache.size >= MAX_CACHE_SIZE) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Get current quote for a symbol
   * Supports both US and Indian stock formats
   */
  async getQuote(symbol) {
    const cacheKey = `quote_${symbol}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    if (!this.checkRateLimit()) {
      return this.getMockData(symbol);
    }

    try {
      // Try Finnhub first (if key available)
      if (FINNHUB_KEY) {
        const data = await this.getFinnhubQuote(symbol);
        if (data) {
          this.setCache(cacheKey, data);
          return data;
        }
      }

      // Fallback to Alpha Vantage
      if (ALPHA_VANTAGE_KEY) {
        const data = await this.getAlphaVantageQuote(symbol);
        if (data) {
          this.setCache(cacheKey, data);
          return data;
        }
      }

      // If all else fails, return mock data
      return this.getMockData(symbol);

    } catch (error) {
      console.error('Error fetching quote:', error);
      return this.getMockData(symbol);
    }
  }

  /**
   * Finnhub API implementation
   */
  async getFinnhubQuote(symbol) {
    try {
      const response = await axios.get(
        `https://finnhub.io/api/v1/quote`,
        {
          params: {
            symbol: symbol,
            token: FINNHUB_KEY
          },
          timeout: 5000
        }
      );

      const data = response.data;
      
      return {
        symbol,
        price: data.c,
        change: data.d,
        changePercent: data.dp,
        high: data.h,
        low: data.l,
        open: data.o,
        previousClose: data.pc,
        timestamp: Date.now(),
        provider: 'finnhub'
      };
    } catch (error) {
      console.error('Finnhub API error:', error);
      return null;
    }
  }

  /**
   * Alpha Vantage API implementation
   */
  async getAlphaVantageQuote(symbol) {
    try {
      const response = await axios.get(
        `https://www.alphavantage.co/query`,
        {
          params: {
            function: 'GLOBAL_QUOTE',
            symbol: symbol,
            apikey: ALPHA_VANTAGE_KEY
          },
          timeout: 5000
        }
      );

      const quote = response.data['Global Quote'];
      
      if (!quote) return null;

      return {
        symbol,
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        high: parseFloat(quote['03. high']),
        low: parseFloat(quote['04. low']),
        open: parseFloat(quote['02. open']),
        previousClose: parseFloat(quote['08. previous close']),
        timestamp: Date.now(),
        provider: 'alphavantage'
      };
    } catch (error) {
      console.error('Alpha Vantage API error:', error);
      return null;
    }
  }

  /**
   * Mock data for development/fallback
   */
  getMockData(symbol) {
    const mockPrices = {
      'NIFTY': 21543.20,
      'SENSEX': 71123.45,
      'RELIANCE': 2845.60,
      'TCS': 3567.80,
      'INFY': 1432.90,
      'HDFCBANK': 1678.45,
      'ICICIBANK': 1023.30,
      'ITC': 412.50,
      'AAPL': 178.25,
      'GOOGL': 141.80,
      'MSFT': 378.90,
      'TSLA': 248.50
    };

    const basePrice = mockPrices[symbol] || 100;
    const variance = (Math.random() - 0.5) * (basePrice * 0.02);
    const currentPrice = basePrice + variance;
    const change = currentPrice - basePrice;
    const changePercent = (change / basePrice) * 100;

    return {
      symbol,
      price: parseFloat(currentPrice.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      high: parseFloat((currentPrice * 1.02).toFixed(2)),
      low: parseFloat((currentPrice * 0.98).toFixed(2)),
      open: basePrice,
      previousClose: basePrice,
      timestamp: Date.now(),
      provider: 'mock'
    };
  }

  /**
   * Get historical data for charts
   */
  async getHistoricalData(symbol, range = '1M') {
    const cacheKey = `historical_${symbol}_${range}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached) return cached;

    try {
      if (FINNHUB_KEY) {
        const to = Math.floor(Date.now() / 1000);
        const from = to - (30 * 24 * 60 * 60); // 30 days

        const response = await axios.get(
          `https://finnhub.io/api/v1/stock/candle`,
          {
            params: {
              symbol: symbol,
              resolution: 'D',
              from: from,
              to: to,
              token: FINNHUB_KEY
            }
          }
        );

        const data = {
          symbol,
          timestamps: response.data.t,
          closes: response.data.c,
          opens: response.data.o,
          highs: response.data.h,
          lows: response.data.l,
          volumes: response.data.v
        };

        this.setCache(cacheKey, data);
        return data;
      }

      return this.getMockHistoricalData(symbol);
    } catch (error) {
      console.error('Error fetching historical data:', error);
      return this.getMockHistoricalData(symbol);
    }
  }

  /**
   * Mock historical data
   */
  getMockHistoricalData(symbol) {
    const currentQuote = this.getMockData(symbol);
    const days = 30;
    const data = {
      symbol,
      timestamps: [],
      closes: [],
      opens: [],
      highs: [],
      lows: [],
      volumes: []
    };

    let price = currentQuote.price;
    
    for (let i = days; i >= 0; i--) {
      const timestamp = Date.now() - (i * 24 * 60 * 60 * 1000);
      const variance = (Math.random() - 0.5) * (price * 0.05);
      price = Math.max(price + variance, price * 0.8);

      data.timestamps.push(Math.floor(timestamp / 1000));
      data.closes.push(parseFloat(price.toFixed(2)));
      data.opens.push(parseFloat((price * 0.99).toFixed(2)));
      data.highs.push(parseFloat((price * 1.02).toFixed(2)));
      data.lows.push(parseFloat((price * 0.98).toFixed(2)));
      data.volumes.push(Math.floor(Math.random() * 10000000));
    }

    return data;
  }

  /**
   * Search for stock symbols
   */
  async searchSymbol(query) {
    try {
      if (FINNHUB_KEY) {
        const response = await axios.get(
          `https://finnhub.io/api/v1/search`,
          {
            params: {
              q: query,
              token: FINNHUB_KEY
            }
          }
        );

        return response.data.result || [];
      }

      // Mock search results
      return this.getMockSearchResults(query);
    } catch (error) {
      console.error('Error searching symbol:', error);
      return this.getMockSearchResults(query);
    }
  }

  /**
   * Mock search results
   */
  getMockSearchResults(query) {
    const allSymbols = [
      { symbol: 'RELIANCE', description: 'Reliance Industries Ltd' },
      { symbol: 'TCS', description: 'Tata Consultancy Services' },
      { symbol: 'INFY', description: 'Infosys Ltd' },
      { symbol: 'HDFCBANK', description: 'HDFC Bank Ltd' },
      { symbol: 'ICICIBANK', description: 'ICICI Bank Ltd' },
      { symbol: 'ITC', description: 'ITC Ltd' },
      { symbol: 'NIFTY', description: 'NIFTY 50 Index' },
      { symbol: 'SENSEX', description: 'BSE SENSEX Index' }
    ];

    return allSymbols.filter(s => 
      s.symbol.toLowerCase().includes(query.toLowerCase()) ||
      s.description.toLowerCase().includes(query.toLowerCase())
    );
  }

  /**
   * WebSocket connection for real-time updates
   */
  subscribeToRealtime(symbols, callback) {
    if (!FINNHUB_KEY) {
      console.warn('WebSocket requires Finnhub API key');
      return null;
    }

    if (this.websocket) {
      this.websocket.close();
    }

    this.websocket = new WebSocket(`wss://ws.finnhub.io?token=${FINNHUB_KEY}`);

    this.websocket.addEventListener('open', () => {
      console.log('WebSocket connected');
      symbols.forEach(symbol => {
        this.websocket.send(JSON.stringify({
          'type': 'subscribe',
          'symbol': symbol
        }));
      });
    });

    this.websocket.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'trade') {
        callback(data.data);
      }
    });

    this.websocket.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
    });

    return this.websocket;
  }

  /**
   * Close WebSocket connection
   */
  unsubscribeFromRealtime() {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }

  /**
   * Get multiple quotes at once (batch operation)
   */
  async getBatchQuotes(symbols) {
    const promises = symbols.map(symbol => this.getQuote(symbol));
    return Promise.all(promises);
  }

  /**
   * Format currency for display
   */
  formatCurrency(value, currency = 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  /**
   * Format percentage change
   */
  formatPercent(value) {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  }
}

export default new MarketDataService();
