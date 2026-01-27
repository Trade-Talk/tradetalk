import { TrendingUp, TrendingDown, ChevronDown } from 'lucide-react'
import { useState } from 'react'

const mockMarketData = [
  { symbol: 'NIFTY 50', value: '21,894.75', change: '+123.45', changePercent: '+0.57%', isUp: true },
  { symbol: 'SENSEX', value: '72,410.38', change: '+298.67', changePercent: '+0.41%', isUp: true },
  { symbol: 'BANK NIFTY', value: '46,187.20', change: '-89.30', changePercent: '-0.19%', isUp: false },
]

export default function MarketTicker() {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!isExpanded) {
    return (
      <button 
        onClick={() => setIsExpanded(true)}
        className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-2.5 flex items-center justify-between active:opacity-90 transition-opacity touch-manipulation"
      >
        <div className="flex items-center space-x-4 overflow-x-auto hide-scrollbar flex-1">
          {mockMarketData.map((item) => (
            <div key={item.symbol} className="flex items-center space-x-2 whitespace-nowrap">
              <span className="font-semibold text-sm">{item.symbol}</span>
              <span className="text-sm">{item.value}</span>
              <span className={`text-xs font-medium ${item.isUp ? 'text-success-200' : 'text-danger-200'}`}>
                {item.changePercent}
              </span>
            </div>
          ))}
        </div>
        <ChevronDown className="w-4 h-4 ml-2 flex-shrink-0" />
      </button>
    )
  }

  return (
    <div className="bg-white border-b border-gray-200">
      <button 
        onClick={() => setIsExpanded(false)}
        className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
      >
        <span className="text-sm font-semibold text-gray-900">Market Overview</span>
        <ChevronDown className="w-4 h-4 text-gray-500 transform rotate-180" />
      </button>
      
      <div className="px-4 pb-3 space-y-2">
        {mockMarketData.map((item) => (
          <div key={item.symbol} className="flex items-center justify-between py-2">
            <div>
              <div className="font-semibold text-sm text-gray-900">{item.symbol}</div>
              <div className="text-lg font-bold text-gray-900 mt-0.5">{item.value}</div>
            </div>
            <div className="text-right">
              <div className={`flex items-center space-x-1 text-sm font-semibold ${
                item.isUp ? 'text-success-600' : 'text-danger-600'
              }`}>
                {item.isUp ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{item.change}</span>
              </div>
              <div className={`text-xs mt-0.5 ${
                item.isUp ? 'text-success-600' : 'text-danger-600'
              }`}>
                {item.changePercent}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
