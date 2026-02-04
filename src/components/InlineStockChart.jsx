import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Maximize2, Loader, MapPin } from 'lucide-react'
import { getCurrentPrice } from '../lib/marketData'

export default function InlineStockChart({ stock, onExpand, postTimestamp, priceAtPost }) {
  const [priceData, setPriceData] = useState(null)
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('1D')

  useEffect(() => {
    loadData()
  }, [stock.symbol, timeframe])

  const loadData = async () => {
    setLoading(true)
    try {
      // Fetch current price
      const price = await getCurrentPrice(stock.symbol, stock.exchange || 'NSE')
      
      // Generate mock historical data (replace with real API)
      const historicalPrices = generateMockHistorical(price, timeframe)
      
      const previousPrice = stock.price || historicalPrices[0]
      const change = ((price - previousPrice) / previousPrice) * 100

      setPriceData({
        current: price,
        previous: previousPrice,
        change: change,
        high: Math.max(...historicalPrices),
        low: Math.min(...historicalPrices),
        volume: Math.random() * 10000000
      })

      setChartData(historicalPrices)
    } catch (error) {
      console.error('Error loading chart:', error)
      setPriceData({
        current: stock.price || 0,
        previous: stock.price || 0,
        change: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const generateMockHistorical = (currentPrice, tf) => {
    const points = tf === '1D' ? 24 : tf === '1W' ? 7 : tf === '1M' ? 30 : 90
    const volatility = 0.02
    const prices = []
    let price = currentPrice * (1 - volatility)

    for (let i = 0; i < points; i++) {
      price = price * (1 + (Math.random() - 0.5) * volatility)
      prices.push(price)
    }

    // Ensure last price matches current
    prices[prices.length - 1] = currentPrice
    return prices
  }

  const renderChart = () => {
    if (!chartData || chartData.length === 0) return null

    const max = Math.max(...chartData)
    const min = Math.min(...chartData)
    const range = max - min

    const points = chartData.map((price, i) => {
      const x = (i / (chartData.length - 1)) * 100
      const y = 100 - ((price - min) / range) * 100
      return `${x},${y}`
    }).join(' ')

    const areaPoints = `0,100 ${points} 100,100`
    const isPositive = priceData.change >= 0

    // Calculate position for "price at post" marker
    let markerX = null
    let markerY = null
    if (priceAtPost && postTimestamp) {
      // For now, place marker at 20% (can be calculated based on actual time)
      markerX = 20
      markerY = 100 - ((priceAtPost - min) / range) * 100
    }

    return (
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`gradient-${stock.symbol}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity="0.2"/>
            <stop offset="100%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <polyline
          points={areaPoints}
          fill={`url(#gradient-${stock.symbol})`}
        />
        <polyline
          points={points}
          fill="none"
          stroke={isPositive ? '#22c55e' : '#ef4444'}
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        {/* Price at post marker */}
        {markerX && markerY && (
          <>
            <line
              x1={markerX}
              y1="0"
              x2={markerX}
              y2="100"
              stroke="#3b82f6"
              strokeWidth="0.5"
              strokeDasharray="2,2"
              vectorEffect="non-scaling-stroke"
            />
            <circle
              cx={markerX}
              cy={markerY}
              r="2"
              fill="#3b82f6"
              vectorEffect="non-scaling-stroke"
            />
          </>
        )}
      </svg>
    )
  }

  if (loading) {
    return (
      <div className="bg-gray-950 border border-gray-900 rounded p-4">
        <div className="flex items-center justify-center h-32">
          <Loader className="w-6 h-6 text-gray-600 animate-spin" />
        </div>
      </div>
    )
  }

  const isPositive = priceData.change >= 0

  return (
    <div className="bg-gray-950 border border-gray-900 rounded overflow-hidden hover:border-gray-800 transition-colors">
      {/* Header */}
      <div className="p-3 border-b border-gray-900">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-white text-sm">{stock.symbol}</span>
              <span className="text-xs text-gray-500">{stock.exchange || 'NSE'}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-light text-white">
                ₹{priceData.current.toFixed(2)}
              </span>
              <span className={`text-xs flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? <TrendingUp size={12} strokeWidth={1.5} /> : <TrendingDown size={12} strokeWidth={1.5} />}
                {isPositive ? '+' : ''}{priceData.change.toFixed(2)}%
              </span>
            </div>
          </div>
          {onExpand && (
            <button 
              onClick={onExpand}
              className="p-1.5 hover:bg-gray-900 rounded transition-colors"
            >
              <Maximize2 size={14} className="text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="h-24 px-3 py-2">
        {renderChart()}
      </div>

      {/* Timeframe Selector */}
      <div className="px-3 py-2 flex gap-1 border-t border-gray-900">
        {['1D', '1W', '1M', '3M'].map(tf => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              timeframe === tf
                ? 'bg-white text-black'
                : 'text-gray-500 hover:text-white hover:bg-gray-900'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* Price at Post Banner (if available) */}
      {priceAtPost && (
        <div className="px-3 py-2 bg-blue-950/30 border-t border-blue-900/50 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <MapPin size={12} className="text-blue-400" />
            <span className="text-xs text-gray-400">Posted at:</span>
            <span className="text-xs text-white font-medium">₹{priceAtPost.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-1">
            {priceData.current > priceAtPost ? (
              <>
                <span className="text-xs text-green-500">+{((priceData.current - priceAtPost) / priceAtPost * 100).toFixed(2)}%</span>
                <TrendingUp size={12} className="text-green-500" />
              </>
            ) : priceData.current < priceAtPost ? (
              <>
                <span className="text-xs text-red-500">{((priceData.current - priceAtPost) / priceAtPost * 100).toFixed(2)}%</span>
                <TrendingDown size={12} className="text-red-500" />
              </>
            ) : (
              <span className="text-xs text-gray-500">±0.00%</span>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="px-3 pb-3 grid grid-cols-3 gap-3 text-xs">
        <div>
          <div className="text-gray-500 mb-0.5">High</div>
          <div className="text-white font-light">₹{priceData.high?.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-gray-500 mb-0.5">Low</div>
          <div className="text-white font-light">₹{priceData.low?.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-gray-500 mb-0.5">Vol</div>
          <div className="text-white font-light">{(priceData.volume / 1000000).toFixed(1)}M</div>
        </div>
      </div>
    </div>
  )
}
