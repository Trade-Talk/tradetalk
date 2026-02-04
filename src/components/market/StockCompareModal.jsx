import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import marketDataService from '../../services/marketDataService';

/**
 * StockCompareModal - Compare multiple stocks side-by-side
 * 
 * Features:
 * - Compare 2-4 stocks
 * - Side-by-side price & performance
 * - Easy to see which is performing better
 */

export default function StockCompareModal({ initialStocks = [], onClose }) {
  const [stocks, setStocks] = useState(initialStocks);
  const [priceData, setPriceData] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (stocks.length > 0) {
      loadPrices();
    }
  }, [stocks]);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchStocks();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const loadPrices = async () => {
    setLoading(true);
    const data = {};
    for (const symbol of stocks) {
      try {
        const quote = await marketDataService.getQuote(symbol);
        data[symbol] = quote;
      } catch (error) {
        console.error(`Error loading ${symbol}:`, error);
      }
    }
    setPriceData(data);
    setLoading(false);
  };

  const searchStocks = async () => {
    const results = await marketDataService.searchSymbol(searchQuery);
    setSearchResults(results);
  };

  const addStock = (symbol) => {
    if (!stocks.includes(symbol) && stocks.length < 4) {
      setStocks([...stocks, symbol]);
    }
    setSearchQuery('');
  };

  const removeStock = (symbol) => {
    setStocks(stocks.filter(s => s !== symbol));
  };

  const getBestPerformer = () => {
    if (Object.keys(priceData).length === 0) return null;
    
    let best = null;
    let maxChange = -Infinity;

    Object.entries(priceData).forEach(([symbol, data]) => {
      if (data.changePercent > maxChange) {
        maxChange = data.changePercent;
        best = symbol;
      }
    });

    return best;
  };

  const bestPerformer = getBestPerformer();

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-800 rounded-lg max-w-3xl w-full p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-medium text-white mb-1">Compare Stocks</h2>
            <p className="text-sm text-gray-600">Side-by-side comparison of up to 4 stocks</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add Stock Search */}
        {stocks.length < 4 && (
          <div className="mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Add stock to compare (e.g., RELIANCE)..."
              className="w-full bg-black border border-gray-800 rounded px-4 py-2 text-white text-sm focus:outline-none focus:border-gray-700"
            />
            {searchResults.length > 0 && (
              <div className="mt-2 bg-black border border-gray-800 rounded max-h-40 overflow-y-auto">
                {searchResults.map(result => (
                  <button
                    key={result.symbol}
                    onClick={() => addStock(result.symbol)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-900 transition-colors"
                  >
                    <div className="text-white text-sm font-medium">{result.symbol}</div>
                    <div className="text-gray-600 text-xs">{result.description}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Comparison Grid */}
        {stocks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stocks.map(symbol => {
              const data = priceData[symbol];
              if (!data) return (
                <div key={symbol} className="bg-black border border-gray-800 rounded-lg p-4">
                  <div className="text-gray-600">Loading {symbol}...</div>
                </div>
              );

              const isPositive = data.changePercent >= 0;
              const isBest = symbol === bestPerformer && stocks.length > 1;

              return (
                <div key={symbol} className={`bg-black border rounded-lg p-4 ${isBest ? 'border-green-500/50' : 'border-gray-800'}`}>
                  {isBest && (
                    <div className="mb-2 text-xs text-green-500 font-medium">
                      🏆 Best Performer
                    </div>
                  )}
                  
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-lg font-medium text-white">{symbol}</div>
                      <div className="text-2xl font-light mt-1">₹{data.price.toFixed(2)}</div>
                    </div>
                    <button
                      onClick={() => removeStock(symbol)}
                      className="text-gray-600 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className={`flex items-center gap-2 text-sm mb-4 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span>{isPositive ? '+' : ''}{data.change.toFixed(2)}</span>
                    <span>({isPositive ? '+' : ''}{data.changePercent.toFixed(2)}%)</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-gray-600 mb-1">High</div>
                      <div className="text-white">₹{data.high.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 mb-1">Low</div>
                      <div className="text-white">₹{data.low.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 mb-1">Open</div>
                      <div className="text-white">₹{data.open.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 mb-1">Prev Close</div>
                      <div className="text-white">₹{data.previousClose.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-600">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Add stocks above to start comparing</p>
          </div>
        )}

        {/* Comparison Insights */}
        {stocks.length >= 2 && bestPerformer && (
          <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="text-sm text-green-400 font-medium mb-1">Quick Insight</div>
            <div className="text-sm text-gray-300">
              {bestPerformer} is outperforming with {priceData[bestPerformer].changePercent >= 0 ? '+' : ''}{priceData[bestPerformer].changePercent.toFixed(2)}% change today
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
