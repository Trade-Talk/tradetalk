import { useState, useEffect } from 'react'
import { X, TrendingUp, TrendingDown, Loader, BarChart3, Star } from 'lucide-react'
import { getCurrentPrice } from '../../lib/marketData'

/**
 * Compact Stock Card - Tier 2 Display
 * Shows in modal/drawer when pill is tapped
 * Key metrics + CTAs
 */
export default function CompactStockCard({ symbol, exchange = 'NSE', onClose, onViewFullChart, onAddToWatchlist }) {
  const [priceData, setPriceData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [symbol, exchange])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Check cache (60 second cache for compact cards)
      const cacheKey = `stock_compact_${symbol}_${exchange}`
      const cached = sessionStorage.getItem(cacheKey)
      
      if (cached) {
        const { data, timestamp } = JSON.parse(cached)
        if (Date.now() - timestamp < 60000) {
          setPriceData(data)
          setLoading(false)
          return
        }
      }

      // Fetch full quote data
      const current = await getCurrentPrice(symbol, exchange)
      
      // Mock additional data (replace with real API)
      const mockOpen = current * 0.995
      const mockHigh = current * 1.02
      const mockLow = current * 0.98
      const mockPrevious = current * 0.98
      const change = current - mockPrevious
      const changePercent = (change / mockPrevious) * 100

      const data = {
        current,
        previous: mockPrevious,
        change,
        changePercent,
        open: mockOpen,
        high: mockHigh,
        low: mockLow,
        volume: Math.floor(Math.random() * 100000000),
        marketCap: (current * Math.floor(Math.random() * 10000000000)).toFixed(0),
        companyName: getCompanyName(symbol),
        isUp: change >= 0
      }

      // Cache it
      sessionStorage.setItem(cacheKey, JSON.stringify({
        data,
        timestamp: Date.now()
      }))

      setPriceData(data)
    } catch (error) {
      console.error('Error loading compact data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCompanyName = (sym) => {
    const names = {
      'AAPL': 'Apple Inc.',
      'RELIANCE': 'Reliance Industries',
      'TCS': 'Tata Consultancy Services',
      'INFY': 'Infosys',
      'HDFCBANK': 'HDFC Bank'
    }
    return names[sym] || `${sym} Limited`
  }

  const formatNumber = (num) => {
    if (num >= 1e12) return `₹${(num / 1e12).toFixed(2)}T`
    if (num >= 1e9) return `₹${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`
    return num.toLocaleString()
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
        <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md p-6">
          <div className="flex items-center justify-center h-48">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  if (!priceData) return null

  const { isUp, change, changePercent } = priceData

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-100">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-gray-900">${symbol}</h2>
              <span className="text-sm text-gray-500">{exchange}</span>
            </div>
            <p className="text-sm text-gray-600">{priceData.companyName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors -mr-2 -mt-2"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Price Info */}
        <div className="p-6 pb-4">
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-3xl font-bold text-gray-900">
              ₹{priceData.current.toFixed(2)}
            </span>
            <div className={`flex items-center gap-1 text-sm font-medium ${
              isUp ? 'text-green-600' : 'text-red-600'
            }`}>
              {isUp ? (
                <TrendingUp className="w-4 h-4" strokeWidth={2} />
              ) : (
                <TrendingDown className="w-4 h-4" strokeWidth={2} />
              )}
              <span>
                {change > 0 ? '+' : ''}₹{change.toFixed(2)} ({changePercent > 0 ? '+' : ''}{changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Updated just now • Market {new Date().getHours() >= 9 && new Date().getHours() < 16 ? 'Open' : 'Closed'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-xs text-gray-600 mb-1">Open</p>
              <p className="text-sm font-semibold text-gray-900">₹{priceData.open.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">High</p>
              <p className="text-sm font-semibold text-gray-900">₹{priceData.high.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Low</p>
              <p className="text-sm font-semibold text-gray-900">₹{priceData.low.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Volume</p>
              <p className="text-sm font-semibold text-gray-900">{formatNumber(priceData.volume)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-600 mb-1">Market Cap</p>
              <p className="text-sm font-semibold text-gray-900">{formatNumber(parseInt(priceData.marketCap))}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-0 pb-8">
          <button
            onClick={onViewFullChart}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            <BarChart3 className="w-5 h-5" />
            View Chart
          </button>
          <button
            onClick={onAddToWatchlist}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            <Star className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
