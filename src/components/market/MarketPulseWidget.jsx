import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp, Activity } from 'lucide-react';

export default function MarketPulseWidget() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [sentiment, setSentiment] = useState(null);
  const [indices, setIndices] = useState([]);
  const [topMovers, setTopMovers] = useState([]);

  useEffect(() => {
    loadMarketData();
    const interval = setInterval(loadMarketData, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  const loadMarketData = async () => {
    // TODO: Replace with real API
    setSentiment({
      bullish: 67,
      bearish: 33,
      overall: 'bullish'
    });

    setIndices([
      { name: 'Nifty 50', value: 22450, change: 1.2, changeValue: 267 },
      { name: 'Sensex', value: 74123, change: 0.9, changeValue: 661 },
      { name: 'Bank Nifty', value: 48234, change: -0.5, changeValue: -242 }
    ]);

    setTopMovers([
      { symbol: 'RELIANCE', change: 3.4 },
      { symbol: 'TCS', change: 2.8 },
      { symbol: 'INFY', change: -1.9 }
    ]);
  };

  if (!isExpanded) {
    return (
      <div 
        onClick={() => setIsExpanded(true)}
        className="bg-gradient-to-r from-gray-950 to-black border-b border-gray-900 p-3 cursor-pointer hover:bg-gray-950 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity size={16} className="text-green-500" strokeWidth={1.5} />
            <span className="text-xs text-gray-400 font-light">Market Pulse</span>
            <span className="text-xs text-white">
              {indices[0]?.name} {indices[0]?.value.toLocaleString()}
              <span className={indices[0]?.change >= 0 ? 'text-green-500 ml-1' : 'text-red-500 ml-1'}>
                ({indices[0]?.change >= 0 ? '+' : ''}{indices[0]?.change}%)
              </span>
            </span>
          </div>
          <ChevronDown size={16} className="text-gray-500" strokeWidth={1.5} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-gray-950 to-black border-b border-gray-900">
      {/* Header */}
      <div 
        onClick={() => setIsExpanded(false)}
        className="p-4 cursor-pointer hover:bg-gray-950 transition-colors"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-white">Market Pulse</span>
            <span className="text-xs text-gray-500">LIVE</span>
          </div>
          <ChevronUp size={16} className="text-gray-500" strokeWidth={1.5} />
        </div>

        {/* Sentiment Bar */}
        {sentiment && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs">
                <TrendingUp size={14} className="text-green-500" strokeWidth={1.5} />
                <span className="text-green-500 font-light">{sentiment.bullish}% Bullish</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-red-500 font-light">{sentiment.bearish}% Bearish</span>
                <TrendingDown size={14} className="text-red-500" strokeWidth={1.5} />
              </div>
            </div>
            <div className="h-2 bg-gray-900 rounded-full overflow-hidden flex">
              <div 
                className="bg-green-500 transition-all duration-500"
                style={{ width: `${sentiment.bullish}%` }}
              />
              <div 
                className="bg-red-500 transition-all duration-500"
                style={{ width: `${sentiment.bearish}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Indices */}
      <div className="px-4 pb-3">
        <div className="grid grid-cols-3 gap-2">
          {indices.map((index, idx) => {
            const isPositive = index.change >= 0;
            return (
              <div 
                key={idx}
                className="bg-gray-950 border border-gray-900 rounded-lg p-3 hover:border-gray-800 transition-colors"
              >
                <div className="text-xs text-gray-500 mb-1 font-light truncate">{index.name}</div>
                <div className="text-sm font-light text-white mb-1">
                  {index.value.toLocaleString()}
                </div>
                <div className={`text-xs flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? <TrendingUp size={10} strokeWidth={1.5} /> : <TrendingDown size={10} strokeWidth={1.5} />}
                  {isPositive ? '+' : ''}{index.change}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Movers */}
      {topMovers.length > 0 && (
        <div className="px-4 pb-4">
          <div className="text-xs text-gray-500 mb-2 font-light">Top Movers</div>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            {topMovers.map((stock, idx) => {
              const isPositive = stock.change >= 0;
              return (
                <div 
                  key={idx}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-950 border border-gray-900 rounded-lg flex-shrink-0 hover:border-gray-800 transition-colors cursor-pointer"
                >
                  <span className="text-xs text-white font-light">{stock.symbol}</span>
                  <span className={`text-xs font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {isPositive ? '+' : ''}{stock.change}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
