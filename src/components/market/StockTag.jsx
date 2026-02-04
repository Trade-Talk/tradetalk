import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { getOHLCData } from '../../lib/marketData'

export default function StockTag({ symbol, exchange = 'NSE', compact = false }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!symbol) return

    let mounted = true

    const fetchData = async () => {
      try {
        const result = await getOHLCData(symbol, exchange)
        if (mounted) {
          setData(result)
          setLoading(false)
        }
      } catch (err) {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      mounted = false
    }
  }, [symbol, exchange])

  if (loading) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-900 rounded-md text-xs">
        <span className="text-gray-500 font-mono">${symbol}</span>
      </span>
    )
  }

  if (!data) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-900 border border-gray-800 rounded-md text-xs">
        <span className="text-gray-400 font-mono">${symbol}</span>
      </span>
    )
  }

  const isPositive = data.change >= 0

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${
        isPositive 
          ? 'bg-green-950 text-green-400 border-green-900' 
          : 'bg-red-950 text-red-400 border-red-900'
      }`}>
        <span className="font-mono">${symbol}</span>
        <span>{isPositive ? '+' : ''}{data.changePercent.toFixed(1)}%</span>
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
      isPositive 
        ? 'bg-green-950 text-green-400 border-green-900' 
        : 'bg-red-950 text-red-400 border-red-900'
    }`}>
      <span className="font-mono font-semibold">${symbol}</span>
      <span className="text-white">
        ₹{data.close.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
      </span>
      <span className="flex items-center gap-0.5">
        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {isPositive ? '+' : ''}{data.changePercent.toFixed(2)}%
      </span>
    </span>
  )
}
