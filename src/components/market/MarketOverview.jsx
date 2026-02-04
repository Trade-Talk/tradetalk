import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import { getBatchPrices, getOHLCData, getMarketStatus } from '../../lib/marketData'

const POPULAR_STOCKS = [
  { symbol: 'RELIANCE', name: 'Reliance' },
  { symbol: 'TCS', name: 'TCS' },
  { symbol: 'INFY', name: 'Infosys' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank' },
]

export default function MarketOverview() {
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [marketStatus, setMarketStatus] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchMarketData()
    const status = getMarketStatus()
    setMarketStatus(status)

    // Refresh every minute
    const interval = setInterval(() => {
      fetchMarketData(true)
      setMarketStatus(getMarketStatus())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  const fetchMarketData = async (silent = false) => {
    if (!silent) setLoading(true)
    if (silent) setRefreshing(true)

    try {
      const stockData = await Promise.all(
        POPULAR_STOCKS.map(async (stock) => {
          try {
            const data = await getOHLCData(stock.symbol)
            return { ...stock, ...data, error: false }
          } catch (error) {
            return { ...stock, error: true }
          }
        })
      )
      setStocks(stockData)
    } catch (error) {
      console.error('Error fetching market data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-950 border border-gray-900 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-32 bg-gray-900 rounded animate-pulse" />
          <div className="h-4 w-24 bg-gray-900 rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-4 w-20 bg-gray-900 rounded animate-pulse" />
              <div className="h-4 w-16 bg-gray-900 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-950 border border-gray-900 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 pb-3 border-b border-gray-900">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-medium text-white">Market Overview</h3>
          <button
            onClick={() => fetchMarketData(true)}
            disabled={refreshing}
            className="p-1.5 hover:bg-gray-900 rounded-full transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        {marketStatus && (
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${marketStatus.isOpen ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`} />
            <span className="text-xs text-gray-500 font-light">{marketStatus.message}</span>
          </div>
        )}
      </div>

      {/* Stock List */}
      <div className="divide-y divide-gray-900">
        {stocks.map((stock) => {
          if (stock.error) {
            return (
              <div key={stock.symbol} className="p-3 px-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">${stock.symbol}</p>
                    <p className="text-xs text-gray-600">{stock.name}</p>
                  </div>
                  <span className="text-xs text-gray-600">—</span>
                </div>
              </div>
            )
          }

          const isPositive = stock.change >= 0
          const Icon = isPositive ? TrendingUp : TrendingDown

          return (
            <div key={stock.symbol} className="p-3 px-4 hover:bg-gray-900 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white">${stock.symbol}</p>
                    <span className="text-xs text-gray-600">{stock.name}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">
                    ₹{stock.close.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </p>
                  <div className={`flex items-center gap-1 justify-end text-xs ${
                    isPositive ? 'text-green-500' : 'text-red-500'
                  }`}>
                    <Icon className="w-3 h-3" strokeWidth={2.5} />
                    <span className="font-medium">
                      {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
