import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { getCurrentPrice, getOHLCData } from '../../lib/marketData'

export default function StockPrice({ symbol, exchange = 'NSE', showChange = true, className = '' }) {
  const [price, setPrice] = useState(null)
  const [change, setChange] = useState(null)
  const [changePercent, setChangePercent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!symbol) return

    let mounted = true

    const fetchPrice = async () => {
      try {
        setLoading(true)
        setError(null)

        if (showChange) {
          const data = await getOHLCData(symbol, exchange)
          if (mounted) {
            setPrice(data.close)
            setChange(data.change)
            setChangePercent(data.changePercent)
          }
        } else {
          const currentPrice = await getCurrentPrice(symbol, exchange)
          if (mounted) {
            setPrice(currentPrice)
          }
        }
      } catch (err) {
        console.error('Error fetching price:', err)
        if (mounted) {
          setError(err.message)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchPrice()

    // Refresh every 30 seconds if market is open
    const interval = setInterval(fetchPrice, 30000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [symbol, exchange, showChange])

  if (loading) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <div className="h-4 w-16 bg-gray-800 rounded animate-pulse" />
        {showChange && <div className="h-3 w-12 bg-gray-800 rounded animate-pulse" />}
      </div>
    )
  }

  if (error || !price) {
    return null
  }

  const isPositive = change >= 0
  const Icon = isPositive ? TrendingUp : TrendingDown

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <span className="text-white font-medium text-sm">
        ₹{price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
      {showChange && change !== null && (
        <div className={`flex items-center gap-0.5 text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          <Icon className="w-3 h-3" strokeWidth={2.5} />
          <span className="font-medium">
            {Math.abs(changePercent).toFixed(2)}%
          </span>
        </div>
      )}
    </div>
  )
}
