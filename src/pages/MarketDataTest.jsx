import { useState } from 'react'
import { getCurrentPrice, getOHLCData, isMarketOpen, getMarketStatus, getBatchPrices } from '../lib/marketData'

export default function MarketDataTest() {
  const [symbol, setSymbol] = useState('RELIANCE')
  const [exchange, setExchange] = useState('NSE')
  const [price, setPrice] = useState(null)
  const [ohlc, setOhlc] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const marketStatus = getMarketStatus()

  const testPrice = async () => {
    setLoading(true)
    setError(null)
    setPrice(null)
    
    try {
      const currentPrice = await getCurrentPrice(symbol, exchange)
      setPrice(currentPrice)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const testOHLC = async () => {
    setLoading(true)
    setError(null)
    setOhlc(null)
    
    try {
      const data = await getOHLCData(symbol, exchange)
      setOhlc(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const testBatch = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const symbols = ['RELIANCE', 'TCS', 'INFY', 'HDFC', 'ICICIBANK']
      const prices = await getBatchPrices(symbols, 'NSE')
      console.log('Batch prices:', prices)
      alert(`Fetched ${Object.keys(prices).length} prices! Check console.`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          🧪 Market Data API Test
        </h1>

        {/* Market Status */}
        <div className={`mb-6 p-4 rounded-lg border-2 ${
          marketStatus.isOpen 
            ? 'bg-green-50 border-green-500' 
            : 'bg-red-50 border-red-500'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Market Status</div>
              <div className="text-xl font-bold">
                {marketStatus.isOpen ? '🟢 OPEN' : '🔴 CLOSED'}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {marketStatus.message}
              </div>
            </div>
            <div className="text-4xl">
              {marketStatus.isOpen ? '📈' : '⏸️'}
            </div>
          </div>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Symbol
            </label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="RELIANCE"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exchange
            </label>
            <div className="flex gap-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="NSE"
                  checked={exchange === 'NSE'}
                  onChange={(e) => setExchange(e.target.value)}
                  className="mr-2"
                />
                NSE
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="BSE"
                  checked={exchange === 'BSE'}
                  onChange={(e) => setExchange(e.target.value)}
                  className="mr-2"
                />
                BSE
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={testPrice}
              disabled={loading}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? '⏳ Loading...' : '💰 Get Current Price'}
            </button>

            <button
              onClick={testOHLC}
              disabled={loading}
              className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? '⏳ Loading...' : '📊 Get OHLC'}
            </button>
          </div>

          <button
            onClick={testBatch}
            disabled={loading}
            className="w-full mt-3 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? '⏳ Loading...' : '🔄 Test Batch (5 stocks)'}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">❌</span>
              <div>
                <div className="font-semibold text-red-900">Error</div>
                <div className="text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Price Display */}
        {price && (
          <div className="bg-green-50 border border-green-300 rounded-lg p-6 mb-6">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">
                {symbol} ({exchange})
              </div>
              <div className="text-5xl font-bold text-green-700 mb-2">
                ₹{price.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">
                Current Market Price
              </div>
            </div>
          </div>
        )}

        {/* OHLC Display */}
        {ohlc && (
          <div className="bg-blue-50 border border-blue-300 rounded-lg p-6 mb-6">
            <div className="text-center mb-4">
              <div className="text-sm text-gray-600">
                {symbol} ({exchange}) - Today's Data
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-3">
                <div className="text-xs text-gray-500">Open</div>
                <div className="text-xl font-bold text-gray-900">
                  ₹{ohlc.open?.toFixed(2)}
                </div>
              </div>

              <div className="bg-white rounded-lg p-3">
                <div className="text-xs text-gray-500">High</div>
                <div className="text-xl font-bold text-green-600">
                  ₹{ohlc.high?.toFixed(2)}
                </div>
              </div>

              <div className="bg-white rounded-lg p-3">
                <div className="text-xs text-gray-500">Low</div>
                <div className="text-xl font-bold text-red-600">
                  ₹{ohlc.low?.toFixed(2)}
                </div>
              </div>

              <div className="bg-white rounded-lg p-3">
                <div className="text-xs text-gray-500">Close</div>
                <div className="text-xl font-bold text-gray-900">
                  ₹{ohlc.close?.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="mt-4 bg-white rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">Change</div>
                  <div className={`text-lg font-bold ${
                    ohlc.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {ohlc.change >= 0 ? '+' : ''}{ohlc.change?.toFixed(2)} ({ohlc.changePercent >= 0 ? '+' : ''}{ohlc.changePercent?.toFixed(2)}%)
                  </div>
                </div>
                <div className="text-3xl">
                  {ohlc.change >= 0 ? '📈' : '📉'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div className="text-sm text-yellow-800">
              <div className="font-semibold mb-2">Testing Tips:</div>
              <ul className="list-disc list-inside space-y-1">
                <li>Try popular stocks: RELIANCE, TCS, INFY, HDFC</li>
                <li>Market hours: 9:15 AM - 3:30 PM IST (Mon-Fri)</li>
                <li>Prices are cached for 5 minutes</li>
                <li>Check browser console for detailed logs</li>
                <li>Batch test fetches 5 stocks at once</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
