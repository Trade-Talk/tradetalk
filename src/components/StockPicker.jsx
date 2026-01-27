import { useState, useEffect } from 'react'
import { Search, X, TrendingUp, Loader } from 'lucide-react'
import { getCurrentPrice } from '../lib/marketData'
import { formatPrice } from '../lib/marketData'

const POPULAR_STOCKS = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', exchange: 'NSE' },
  { symbol: 'TCS', name: 'Tata Consultancy Services', exchange: 'NSE' },
  { symbol: 'INFY', name: 'Infosys', exchange: 'NSE' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', exchange: 'NSE' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank', exchange: 'NSE' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel', exchange: 'NSE' },
  { symbol: 'ITC', name: 'ITC Limited', exchange: 'NSE' },
  { symbol: 'WIPRO', name: 'Wipro', exchange: 'NSE' },
]

export default function StockPicker({ onSelect, onClose, selectedStocks = [] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingPrices, setLoadingPrices] = useState({})
  const [prices, setPrices] = useState({})

  const filteredStocks = searchQuery
    ? POPULAR_STOCKS.filter(stock =>
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : POPULAR_STOCKS

  const fetchPrice = async (symbol, exchange) => {
    const key = `${symbol}-${exchange}`
    if (prices[key] || loadingPrices[key]) return

    setLoadingPrices(prev => ({ ...prev, [key]: true }))
    try {
      const price = await getCurrentPrice(symbol, exchange)
      setPrices(prev => ({ ...prev, [key]: price }))
    } catch (error) {
      console.error(`Failed to fetch ${symbol}:`, error)
    } finally {
      setLoadingPrices(prev => ({ ...prev, [key]: false }))
    }
  }

  useEffect(() => {
    // Fetch prices for visible stocks
    filteredStocks.slice(0, 8).forEach(stock => {
      fetchPrice(stock.symbol, stock.exchange)
    })
  }, [filteredStocks])

  const handleSelect = (stock) => {
    const key = `${stock.symbol}-${stock.exchange}`
    const price = prices[key]
    
    onSelect({
      symbol: stock.symbol,
      name: stock.name,
      exchange: stock.exchange,
      price: price
    })
  }

  const isSelected = (symbol) => {
    return selectedStocks.some(s => s.symbol === symbol)
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
      <div className="bg-black w-full sm:max-w-md sm:rounded-t-lg border-t border-gray-950 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-950 px-6 py-4 flex items-center justify-between">
          <h2 className="text-base font-light">Add Stock Ticker</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-white transition-colors duration-200"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-gray-950 px-6 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Search stocks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black border border-gray-950 text-white placeholder-gray-600 text-sm font-light focus:outline-none focus:border-gray-800 transition-colors duration-200"
              autoFocus
            />
          </div>
        </div>

        {/* Stock List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-950">
          {filteredStocks.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-gray-600">No stocks found</p>
            </div>
          ) : (
            filteredStocks.map((stock) => {
              const key = `${stock.symbol}-${stock.exchange}`
              const price = prices[key]
              const loading = loadingPrices[key]
              const selected = isSelected(stock.symbol)

              return (
                <button
                  key={key}
                  onClick={() => handleSelect(stock)}
                  disabled={selected}
                  className={`w-full px-6 py-4 flex items-center justify-between hover:bg-gray-950/50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                    selected ? 'bg-gray-950/30' : ''
                  }`}
                >
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-light">{stock.symbol}</span>
                      {selected && (
                        <span className="text-xs text-green-400">✓ Added</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">{stock.name}</p>
                  </div>

                  <div className="text-right">
                    {loading ? (
                      <Loader className="w-4 h-4 text-gray-600 animate-spin" strokeWidth={1.5} />
                    ) : price ? (
                      <div className="text-sm font-light">
                        {formatPrice(price)}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-600">—</div>
                    )}
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* Footer Hint */}
        <div className="border-t border-gray-950 px-6 py-3">
          <p className="text-xs text-gray-600 text-center">
            Live prices update every 5 minutes
          </p>
        </div>
      </div>
    </div>
  )
}
