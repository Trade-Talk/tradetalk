import React, { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import marketDataService from '../../services/marketDataService';

/**
 * StockReferenceInput - Enhanced textarea that detects stock ticker mentions
 * 
 * Features:
 * - Detects /TICKER or $TICKER in real-time
 * - Shows live price preview
 * - Embeds price data in post metadata
 * - Works with existing post composer
 */

export default function StockReferenceInput({ value, onChange, onStockDetected, placeholder = "What's on your mind?" }) {
  const [detectedStock, setDetectedStock] = useState(null);
  const [priceData, setPriceData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Detect ticker mentions in real-time
  useEffect(() => {
    const tickerMatch = value.match(/[/$]([A-Z]{2,10})/);
    
    if (tickerMatch) {
      const ticker = tickerMatch[1];
      if (ticker !== detectedStock) {
        setDetectedStock(ticker);
        fetchPrice(ticker);
      }
    } else {
      setDetectedStock(null);
      setPriceData(null);
    }
  }, [value, detectedStock]);

  const fetchPrice = async (ticker) => {
    setLoading(true);
    try {
      const data = await marketDataService.getQuote(ticker);
      setPriceData(data);
      
      // Notify parent component about detected stock
      if (onStockDetected && data) {
        onStockDetected({
          symbol: ticker,
          price: data.price,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('Error fetching price:', error);
      setPriceData(null);
    }
    setLoading(false);
  };

  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[100px] bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gray-700 resize-none"
      />

      {/* Stock Detection Preview */}
      {detectedStock && (
        <div className="absolute bottom-full left-0 right-0 mb-2">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 shadow-xl">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
              <TrendingUp className="w-4 h-4" />
              <span>Detected: {detectedStock}</span>
            </div>
            
            {loading ? (
              <div className="text-sm text-gray-600">Fetching price...</div>
            ) : priceData ? (
              <div>
                <div className="text-white text-lg mb-1">
                  ₹{priceData.price.toFixed(2)}
                </div>
                <div className={`text-sm ${priceData.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {priceData.changePercent >= 0 ? '+' : ''}{priceData.changePercent.toFixed(2)}%
                </div>
                <div className="text-xs text-gray-600 mt-2">
                  This price will be embedded in your post with timestamp
                </div>
              </div>
            ) : (
              <div className="text-sm text-red-500">
                Stock not found
              </div>
            )}
          </div>
        </div>
      )}

      {/* Helper Text */}
      <div className="mt-2 text-xs text-gray-600">
        Pro tip: Type /TICKER or $TICKER to reference stock prices (e.g., /RELIANCE, $INFY)
      </div>
    </div>
  );
}
