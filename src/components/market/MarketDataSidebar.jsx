import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Search, Plus, X } from 'lucide-react';
import marketDataService from '../../services/marketDataService';

/**
 * MarketDataSidebar - Persistent sidebar with market data
 * 
 * Features:
 * - Watchlist of favorite stocks
 * - Live price updates
 * - Quick search
 * - Add/remove stocks
 */

export default function MarketDataSidebar() {
  const [watchlist, setWatchlist] = useState(['NIFTY', 'SENSEX', 'RELIANCE', 'TCS', 'INFY']);
  const [priceData, setPriceData] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  // Fetch prices for watchlist
  useEffect(() => {
    const fetchPrices = async () => {
      const data = {};
      for (const symbol of watchlist) {
        try {
          const quote = await marketDataService.getQuote(symbol);
          data[symbol] = quote;
        } catch (error) {
          console.error(`Error fetching ${symbol}:`, error);
        }
      }
      setPriceData(data);
    };

    fetchPrices();
    
    // Update every 10 seconds
    const interval = setInterval(fetchPrices, 10000);
    return () => clearInterval(interval);
  }, [watchlist]);

  // Search stocks
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const search = async () => {
        const results = await marketDataService.searchSymbol(searchQuery);
        setSearchResults(results);
      };
      search();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const addToWatchlist = (symbol) => {
    if (!watchlist.includes(symbol)) {
      setWatchlist([...watchlist, symbol]);
    }
    setSearchQuery('');
    setShowSearch(false);
  };

  const removeFromWatchlist = (symbol) => {
    setWatchlist(watchlist.filter(s => s !== symbol));
  };

  const StockCard = ({ symbol, data }) => {
    if (!data) return null;

    const isPositive = data.changePercent >= 0;

    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 hover:border-gray-700 transition-colors group">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="text-xs font-medium text-gray-500">{symbol}</div>
            <div className="text-lg font-light mt-1">₹{data.price.toFixed(2)}</div>
          </div>
          <button
            onClick={() => removeFromWatchlist(symbol)}
            className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-white transition-all p-1"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
        
        <div className={`flex items-center gap-1 text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{isPositive ? '+' : ''}{data.change.toFixed(2)}</span>
          <span>({isPositive ? '+' : ''}{data.changePercent.toFixed(2)}%)</span>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full bg-black border-l border-gray-900 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-900">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-white">Market Watch</h2>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="text-gray-500 hover:text-white transition-colors"
          >
            {showSearch ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>

        {/* Search */}
        {showSearch && (
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stocks..."
                className="w-full bg-gray-900 border border-gray-800 pl-9 pr-3 py-2 text-sm rounded focus:outline-none focus:border-gray-700"
                autoFocus
              />
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded max-h-40 overflow-y-auto">
                {searchResults.map((result) => (
                  <button
                    key={result.symbol}
                    onClick={() => addToWatchlist(result.symbol)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-800 transition-colors text-sm"
                  >
                    <div className="font-medium text-white">{result.symbol}</div>
                    <div className="text-xs text-gray-500 truncate">{result.description}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Watchlist */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {watchlist.map(symbol => (
          <StockCard key={symbol} symbol={symbol} data={priceData[symbol]} />
        ))}

        {watchlist.length === 0 && (
          <div className="text-center py-8 text-gray-600 text-sm">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No stocks in watchlist</p>
            <p className="text-xs mt-1">Click + to add stocks</p>
          </div>
        )}
      </div>

      {/* Footer Helper */}
      <div className="p-4 border-t border-gray-900">
        <div className="text-xs text-gray-600">
          <div className="mb-1">💡 Quick Reference</div>
          <div>Type /TICKER in posts to embed live prices</div>
        </div>
      </div>
    </div>
  );
}
