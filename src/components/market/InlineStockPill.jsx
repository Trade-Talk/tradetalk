import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Loader } from 'lucide-react'
import { getCurrentPrice } from '../../lib/marketData'

/**
 * Inline Stock Pill - Tier 1 Display
 * Shows inline with text: $AAPL ↑2.3%
 * Clickable to expand to compact card
 */
export default function InlineStockPill({ symbol, exchange = 'NSE', onClick }) {
  const [priceData, setPriceData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    loadPrice()
  }, [symbol, exchange])

  const loadPrice = async () => {
    try {
      setLoading(true)
      setError(false)
      
      // Try to get from cache first (1 minute cache)
      const cacheKey = `stock_${symbol}_${exchange}`
      const cached = sessionStorage.getItem(cacheKey)
      
      if (cached) {
        const { data, timestamp } = JSON.parse(cached)
        const age = Date.now() - timestamp
        if (age < 60000) { // 1 minute
          setPriceData(data)
          setLoading(false)
          return
        }
      }

      // Fetch fresh data
      const price = await getCurrentPrice(symbol, exchange)
      const mockPrevious = price * 0.98 // Mock previous price
      const change = ((price - mockPrevious) / mockPrevious) * 100

      const data = {
        current: price,
        change: change,
        isUp: change >= 0
      }

      // Cache it
      sessionStorage.setItem(cacheKey, JSON.stringify({
        data,
        timestamp: Date.now()
      }))

      setPriceData(data)
    } catch (err) {
      console.error('Error loading price:', err)
      setError(true)
      // Set fallback data
      setPriceData({
        current: 0,
        change: 0,
        isUp: true
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-mono">
        ${symbol}
        <Loader className="w-3 h-3 animate-spin" />
      </span>
    )
  }

  if (error || !priceData) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-mono">
        ${symbol}
      </span>
    )
  }

  const { change, isUp } = priceData

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono transition-all hover:scale-105 ${
        isUp 
          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
          : change < 0
          ? 'bg-red-100 text-red-700 hover:bg-red-200'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      ${symbol}
      {change !== 0 && (
        <>
          {isUp ? (
            <TrendingUp className="w-3 h-3" strokeWidth={2} />
          ) : (
            <TrendingDown className="w-3 h-3" strokeWidth={2} />
          )}
          <span className="font-medium">
            {change > 0 ? '+' : ''}{change.toFixed(1)}%
          </span>
        </>
      )}
    </button>
  )
}
