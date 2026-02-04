import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import marketDataService from '../../services/marketDataService';

/**
 * StockChartModal - Mini chart view for stock price history
 * 
 * Features:
 * - 30-day price history
 * - Simple line chart
 * - Price change indicators
 */

export default function StockChartModal({ symbol, onClose }) {
  const [chartData, setChartData] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [symbol]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [historical, quote] = await Promise.all([
        marketDataService.getHistoricalData(symbol, '1M'),
        marketDataService.getQuote(symbol)
      ]);
      setChartData(historical);
      setCurrentPrice(quote);
    } catch (error) {
      console.error('Error loading chart data:', error);
    }
    setLoading(false);
  };

  const renderSimpleChart = () => {
    if (!chartData || !chartData.closes) return null;

    const prices = chartData.closes;
    const max = Math.max(...prices);
    const min = Math.min(...prices);
    const range = max - min;

    // Create SVG path
    const points = prices.map((price, index) => {
      const x = (index / (prices.length - 1)) * 100;
      const y = 100 - ((price - min) / range) * 100;
      return `${x},${y}`;
    }).join(' ');

    const isPositive = prices[prices.length - 1] >= prices[0];

    return (
      <div className="relative h-48 bg-black rounded">
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          <polyline
            points={points}
            fill="none"
            stroke={isPositive ? '#22c55e' : '#ef4444'}
            strokeWidth="0.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-800 rounded-lg max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-medium text-white mb-1">{symbol}</h2>
            {currentPrice && (
              <div className="flex items-center gap-3">
                <span className="text-2xl font-light">₹{currentPrice.price.toFixed(2)}</span>
                <span className={`text-sm flex items-center gap-1 ${currentPrice.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {currentPrice.changePercent >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {currentPrice.changePercent >= 0 ? '+' : ''}{currentPrice.changePercent.toFixed(2)}%
                </span>
              </div>
            )}
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chart */}
        {loading ? (
          <div className="h-48 flex items-center justify-center text-gray-600">
            Loading chart...
          </div>
        ) : (
          <div>
            {renderSimpleChart()}
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-600 mb-1">High</div>
                <div className="text-white">₹{currentPrice?.high.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Low</div>
                <div className="text-white">₹{currentPrice?.low.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Open</div>
                <div className="text-white">₹{currentPrice?.open.toFixed(2)}</div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 text-xs text-gray-600">
          30-day price history • Data updates every 5 seconds
        </div>
      </div>
    </div>
  );
}
