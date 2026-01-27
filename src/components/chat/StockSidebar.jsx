import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, X } from 'lucide-react';

export default function StockSidebar({ symbol, exchange = 'NSE' }) {
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching stock data
    // In production, integrate with real API (e.g., Yahoo Finance, Alpha Vantage)
    const fetchStockData = async () => {
      setLoading(true);
      
      // Mock data for demo
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockData = {
        symbol: symbol,
        exchange: exchange,
        price: 2450.75,
        change: 32.50,
        changePercent: 1.35,
        open: 2420.00,
        high: 2465.00,
        low: 2415.00,
        volume: '1.2M',
        marketCap: '₹16.5T',
        dayRange: '2415.00 - 2465.00',
        fiftyTwoWeekRange: '2100.00 - 2600.00'
      };

      setStockData(mockData);
      setLoading(false);
    };

    if (symbol) {
      fetchStockData();
    }
  }, [symbol, exchange]);

  if (!symbol) return null;

  if (loading) {
    return (
      <div className="bg-white border-l border-gray-200 p-4 w-80">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-12 bg-gray-200 rounded mb-3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const isPositive = stockData.change >= 0;

  return (
    <div className="bg-white border-l border-gray-200 w-80 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{stockData.symbol}</h3>
            <p className="text-xs text-gray-500">{stockData.exchange}</p>
          </div>
        </div>

        <div className="mt-3">
          <div className="text-3xl font-bold text-gray-900">
            ₹{stockData.price.toFixed(2)}
          </div>
          <div className={`flex items-center gap-2 mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span className="font-semibold">
              {isPositive ? '+' : ''}{stockData.change.toFixed(2)} ({isPositive ? '+' : ''}{stockData.changePercent.toFixed(2)}%)
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            As of {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="p-4 border-b border-gray-100">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 text-center">
          <div className="text-gray-600 text-sm mb-2">📈 Live Chart</div>
          <div className="text-xs text-gray-500">Chart integration coming soon</div>
          <div className="mt-3">
            <a
              href={`https://kite.zerodha.com/chart/ext/${symbol.toLowerCase()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 text-xs font-medium hover:underline"
            >
              View on Zerodha Kite →
            </a>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 space-y-3 flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-gray-500 text-xs mb-1">Open</div>
            <div className="font-semibold text-gray-900">₹{stockData.open.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs mb-1">High</div>
            <div className="font-semibold text-green-600">₹{stockData.high.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs mb-1">Low</div>
            <div className="font-semibold text-red-600">₹{stockData.low.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-gray-500 text-xs mb-1">Volume</div>
            <div className="font-semibold text-gray-900">{stockData.volume}</div>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500 mb-2">Day Range</div>
          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="absolute h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
              style={{
                left: '0%',
                width: '75%' // Calculate based on current price position in range
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>₹{stockData.low}</span>
            <span>₹{stockData.high}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500 mb-2">52 Week Range</div>
          <div className="text-sm text-gray-900">{stockData.fiftyTwoWeekRange}</div>
        </div>

        <div className="pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500 mb-2">Market Cap</div>
          <div className="text-sm font-semibold text-gray-900">{stockData.marketCap}</div>
        </div>
      </div>

      {/* Action Button */}
      <div className="p-4 border-t border-gray-100">
        <a
          href={`https://kite.zerodha.com/orders/baskets/bulk?instrument=${symbol}&exchange=${exchange}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <TrendingUp size={18} />
          Trade on Zerodha
        </a>
        <p className="text-xs text-gray-500 text-center mt-2">
          Opens in Zerodha Kite
        </p>
      </div>
    </div>
  );
}
