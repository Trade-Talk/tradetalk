import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Loader } from 'lucide-react'
import { getCurrentPrice } from '../lib/marketData'

export default function StockTickerDisplay({ stocks }) {
  const [prices, setPrices] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPrices = async () => {
      setLoading(true)
      const newPrices = {}

      for (const stock of stocks) {
        try {
          const price = await getCurrentPrice(stock.symbol, stock.exchange || 'NSE')
          newPrices[stock.symbol] = {
            current: price,
            previous: stock.price || price,
            change: stock.price ? ((price - stock.price) / stock.price) * 100 : 0
          }
        } catch (error) {
          console.error(`Failed to fetch ${stock.symbol}:`, error)
          newPrices[stock.symbol] = {
            current: stock.price || 0,
            previous: stock.price || 0,
            change: 0
          }
        }
      }

      setPrices(newPrices)
      setLoading(false)
    }

    if (stocks && stocks.length > 0) {
      fetchPrices()
    }
  }, [stocks])

  if (!stocks || stocks.length === 0) return null

  if (loading) {
    return (
      <div className="border border-gray-950 p-4 flex items-center justify-center">
        <Loader className="w-4 h-4 text-gray-600 animate-spin" strokeWidth={1.5} />
      </div>
    )
  }

  return (
    <div className="border border-gray-950 divide-y divide-gray-950">
      {stocks.map((stock) => {
        const priceData = prices[stock.symbol]
        if (!priceData) return null

        const isPositive = priceData.change >= 0

        return (
          <div key={stock.symbol} className="px-4 py-3 hover:bg-gray-950/50 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-light">{stock.symbol}</span>
                  <span className="text-xs text-gray-600">{stock.exchange || 'NSE'}</span>
                </div>
                {stock.name && (
                  <p className="text-xs text-gray-600 truncate">{stock.name}</p>
                )}
              </div>

              <div className="text-right">
                <div className="text-sm font-light mb-1">
                  ₹{priceData.current.toFixed(2)}
                </div>
                {priceData.change !== 0 && (
                  <div className={`text-xs flex items-center justify-end gap-1 ${
                    isPositive ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {isPositive ? (
                      <TrendingUp className="w-3 h-3" strokeWidth={1.5} />
                    ) : (
                      <TrendingDown className="w-3 h-3" strokeWidth={1.5} />
                    )}
                    {isPositive ? '+' : ''}{priceData.change.toFixed(2)}%
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
