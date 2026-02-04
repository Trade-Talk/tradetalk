import { useState } from 'react'

/**
 * InlineStockPill - Lightweight inline stock price display
 * Shows: $SYMBOL +2.3% (colored, clickable)
 * NO CHARTS - just instant price feedback
 */
export default function InlineStockPill({ symbol, onClick }) {
  const [priceData, setPriceData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Fetch price on mount
  useState(() => {
    fetchPrice()
  }, [symbol])

  const fetchPrice = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API call
      // For now, mock data
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setPriceData({
        price: 145.32,
        change: 3.45,
        changePercent: 2.43,
        isUp: Math.random() > 0.5
      })
    } catch (err) {
      console.error('Error fetching price:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-sm font-mono animate-pulse">
        ${symbol}
      </span>
    )
  }

  if (error || !priceData) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-sm font-mono">
        ${symbol}
      </span>
    )
  }

  const isUp = priceData.changePercent >= 0
  const colorClass = isUp ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'

  return (
    <button
      onClick={() => onClick?.(symbol, priceData)}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border ${colorClass} text-sm font-mono hover:opacity-80 transition-opacity cursor-pointer`}
    >
      <span className="font-semibold">${symbol}</span>
      <span className="text-xs">
        {isUp ? '↑' : '↓'}{Math.abs(priceData.changePercent).toFixed(2)}%
      </span>
    </button>
  )
}
