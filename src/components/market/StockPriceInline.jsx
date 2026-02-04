import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Clock, Copy, Check, BarChart3, GitCompare } from 'lucide-react';
import marketDataService from '../../services/marketDataService';
import StockChartModal from './StockChartModal';
import StockCompareModal from './StockCompareModal';

/**
 * StockPriceInline - Embeddable stock price component
 * 
 * Features:
 * - Timestamped price (shows when it was posted)
 * - Current price comparison
 * - One-click copy for references
 * - Chart view button
 * - Compare button
 */

export default function StockPriceInline({ symbol, timestamp, initialPrice, showCurrent = true }) {
  const [priceData, setPriceData] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [showCompare, setShowCompare] = useState(false);

  // Fetch current price when showing details
  useEffect(() => {
    if (showDetails && showCurrent && !priceData) {
      fetchCurrentPrice();
    }
  }, [showDetails]);

  const fetchCurrentPrice = async () => {
    setLoading(true);
    try {
      const data = await marketDataService.getQuote(symbol);
      setPriceData(data);
    } catch (error) {
      console.error('Error fetching price:', error);
    }
    setLoading(false);
  };

  const handleCopy = (e) => {
    e.stopPropagation();
    const referenceText = `${symbol}: ₹${initialPrice.toFixed(2)} (at ${new Date(timestamp).toLocaleString()})`;
    navigator.clipboard.writeText(referenceText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isPositive = priceData && (priceData.price - initialPrice) >= 0;
  const priceDiff = priceData ? priceData.price - initialPrice : 0;
  const changePercent = priceData ? ((priceDiff / initialPrice) * 100) : 0;

  // Check if price is historical (older than 1 hour)
  const isHistorical = timestamp && (Date.now() - timestamp > 3600000);

  return (
    <>
      <div className="inline-block relative">
        <div
          onClick={() => setShowDetails(!showDetails)}
          className="inline-flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded px-3 py-1.5 cursor-pointer transition-colors"
        >
          <span className="text-sm font-medium text-blue-400">{symbol}</span>
          <span className="text-sm text-white">₹{initialPrice.toFixed(2)}</span>
          {timestamp && (
            <Clock className="w-3 h-3 text-gray-500" />
          )}
        </div>

        {/* Details Popup */}
        {showDetails && (
          <div className="absolute z-10 mt-2 bg-gray-900 border border-gray-800 rounded-lg shadow-xl p-4 min-w-[300px]">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-sm font-medium text-gray-400 mb-1">{symbol}</div>
                <div className="text-2xl font-light">₹{initialPrice.toFixed(2)}</div>
                {timestamp && (
                  <div className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(timestamp).toLocaleString()}
                  </div>
                )}
              </div>
              <button
                onClick={handleCopy}
                className="text-gray-500 hover:text-white transition-colors p-1"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Current Price Comparison */}
            {isHistorical && showCurrent && (
              <div className="pt-3 border-t border-gray-800 mb-3">
                {loading ? (
                  <div className="text-sm text-gray-600">Loading current price...</div>
                ) : priceData ? (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Current Price:</div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg">₹{priceData.price.toFixed(2)}</span>
                      <span className={`text-sm flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={fetchCurrentPrice}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Check current price →
                  </button>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-800">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowChart(true);
                  setShowDetails(false);
                }}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-750 rounded text-xs text-white transition-colors"
              >
                <BarChart3 className="w-3 h-3" />
                View Chart
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCompare(true);
                  setShowDetails(false);
                }}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-750 rounded text-xs text-white transition-colors"
              >
                <GitCompare className="w-3 h-3" />
                Compare
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Chart Modal */}
      {showChart && (
        <StockChartModal
          symbol={symbol}
          onClose={() => setShowChart(false)}
        />
      )}

      {/* Compare Modal */}
      {showCompare && (
        <StockCompareModal
          initialStocks={[symbol]}
          onClose={() => setShowCompare(false)}
        />
      )}
    </>
  );
}
