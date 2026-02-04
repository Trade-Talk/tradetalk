import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Maximize2, RefreshCw } from 'lucide-react';
import marketDataService from '../../services/marketDataService';

export default function InlineStockChart({ symbol, exchange = 'NSE', onExpand }) {
  const [data, setData] = useState(null);
  const [timeframe, setTimeframe] = useState('1D');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadChartData();
  }, [symbol, timeframe]);

  const loadChartData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [historical, quote] = await Promise.all([
        marketDataService.getHistoricalData(symbol, timeframe),
        marketDataService.getQuote(symbol)
      ]);
      setData({ historical, quote });
    } catch (error) {
      console.error('Chart error:', error);
      setError('Failed to load chart');
    } finally {
      setLoading(false);
    }
  };

  const renderMiniChart = () => {
    if (!data?.historical?.closes) return null;

    const prices = data.historical.closes;
    const max = Math.max(...prices);
    const min = Math.min(...prices);
    const range = max - min || 1;

    const points = prices.map((price, i) => {
      const x = (i / (prices.length - 1)) * 100;
      const y = 100 - ((price - min) / range) * 100;
      return `${x},${y}`;
    }).join(' ');

    const isPositive = prices[prices.length - 1] >= prices[0];

    return (
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`gradient-${symbol}-${timeframe}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity="0.3"/>
            <stop offset="100%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <polyline
          points={`0,100 ${points} 100,100`}
          fill={`url(#gradient-${symbol}-${timeframe})`}
        />
        <polyline
          points={points}
          fill="none"
          stroke={isPositive ? '#22c55e' : '#ef4444'}
          strokeWidth="0.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="bg-gray-950 border border-gray-900 rounded-lg p-4 animate-pulse">
        <div className="h-40 bg-gray-900 rounded flex items-center justify-center">
          <RefreshCw className="w-5 h-5 text-gray-700 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-950 border border-gray-900 rounded-lg p-4">
        <div className="h-40 flex flex-col items-center justify-center text-gray-600">
          <p className="text-sm mb-2">{error}</p>
          <button 
            onClick={loadChartData}
            className="text-xs text-white hover:text-gray-300 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { quote } = data || {};
  const isPositive = quote?.changePercent >= 0;

  return (
    <div className="bg-gray-950 border border-gray-900 rounded-lg overflow-hidden hover:border-gray-800 transition-colors">
      {/* Header */}
      <div className="p-4 border-b border-gray-900">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-white">{symbol}</span>
              <span className="text-xs text-gray-500">{exchange}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-light text-white">
                ₹{quote?.price.toFixed(2)}
              </span>
              <span className={`text-sm flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? <TrendingUp size={14} strokeWidth={1.5} /> : <TrendingDown size={14} strokeWidth={1.5} />}
                {isPositive ? '+' : ''}{quote?.changePercent.toFixed(2)}%
              </span>
            </div>
          </div>
          {onExpand && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onExpand(symbol, exchange);
              }}
              className="p-2 hover:bg-gray-900 rounded-lg transition-colors"
            >
              <Maximize2 size={16} className="text-gray-500" strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="h-32 p-4">
        {renderMiniChart()}
      </div>

      {/* Timeframe Selector */}
      <div className="px-4 pb-3 flex gap-2 overflow-x-auto hide-scrollbar">
        {['1D', '1W', '1M', '3M', '1Y'].map(tf => (
          <button
            key={tf}
            onClick={(e) => {
              e.stopPropagation();
              setTimeframe(tf);
            }}
            className={`px-3 py-1 rounded text-xs transition-colors flex-shrink-0 ${
              timeframe === tf
                ? 'bg-white text-black'
                : 'text-gray-500 hover:text-white'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="px-4 pb-4 grid grid-cols-3 gap-4 text-xs">
        <div>
          <div className="text-gray-500 mb-1">High</div>
          <div className="text-white font-light">₹{quote?.high.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-gray-500 mb-1">Low</div>
          <div className="text-white font-light">₹{quote?.low.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-gray-500 mb-1">Volume</div>
          <div className="text-white font-light">
            {quote?.volume ? (quote.volume / 1000000).toFixed(1) + 'M' : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
}
