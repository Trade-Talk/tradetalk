import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, X, Loader } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function CreateSignalPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [creating, setCreating] = useState(false)

  const [formData, setFormData] = useState({
    direction: 'LONG',
    symbol: '',
    exchange: 'NSE',
    entry_min: '',
    entry_max: '',
    targets: [''],
    stop_loss: '',
    rationale: '',
    timeframe: 'SWING',
    risk_level: 'MEDIUM'
  })

  // Only advisors can access
  if (user?.user_type !== 'advisor') {
    return (
      <div className="h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <div className="text-6xl mb-6">🚫</div>
        <h2 className="text-2xl font-light tracking-tight mb-3">Advisor Only</h2>
        <p className="text-gray-600 text-center mb-8 font-light">
          Only verified advisors can create signals
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-white text-black px-8 py-3 text-sm font-medium hover:bg-gray-100 transition-colors duration-200"
        >
          Go to Feed
        </button>
      </div>
    )
  }

  const addTarget = () => {
    if (formData.targets.length < 3) {
      setFormData({ ...formData, targets: [...formData.targets, ''] })
    }
  }

  const removeTarget = (index) => {
    if (formData.targets.length > 1) {
      setFormData({
        ...formData,
        targets: formData.targets.filter((_, i) => i !== index)
      })
    }
  }

  const updateTarget = (index, value) => {
    const newTargets = [...formData.targets]
    newTargets[index] = value
    setFormData({ ...formData, targets: newTargets })
  }

  const validateForm = () => {
    if (!formData.symbol.trim()) {
      toast.error('Please enter a stock symbol')
      return false
    }
    if (!formData.entry_min || !formData.entry_max) {
      toast.error('Please enter entry zone')
      return false
    }
    if (parseFloat(formData.entry_min) >= parseFloat(formData.entry_max)) {
      toast.error('Entry max must be greater than entry min')
      return false
    }
    if (!formData.stop_loss) {
      toast.error('Please enter stop loss')
      return false
    }
    if (formData.targets.filter(t => t.trim()).length === 0) {
      toast.error('Please add at least one target')
      return false
    }
    
    // Validate direction-specific logic
    const entryAvg = (parseFloat(formData.entry_min) + parseFloat(formData.entry_max)) / 2
    const stopLoss = parseFloat(formData.stop_loss)
    
    if (formData.direction === 'LONG') {
      if (stopLoss >= entryAvg) {
        toast.error('For LONG signals, stop loss must be below entry zone')
        return false
      }
      for (const target of formData.targets.filter(t => t.trim())) {
        if (parseFloat(target) <= entryAvg) {
          toast.error('For LONG signals, targets must be above entry zone')
          return false
        }
      }
    } else {
      if (stopLoss <= entryAvg) {
        toast.error('For SHORT signals, stop loss must be above entry zone')
        return false
      }
      for (const target of formData.targets.filter(t => t.trim())) {
        if (parseFloat(target) >= entryAvg) {
          toast.error('For SHORT signals, targets must be below entry zone')
          return false
        }
      }
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setCreating(true)

    try {
      const signalData = {
        advisor_id: user.id,
        direction: formData.direction,
        symbol: formData.symbol.toUpperCase().trim(),
        exchange: formData.exchange,
        entry_min: parseFloat(formData.entry_min),
        entry_max: parseFloat(formData.entry_max),
        targets: formData.targets.filter(t => t.trim()).map(t => parseFloat(t)),
        stop_loss: parseFloat(formData.stop_loss),
        rationale: formData.rationale.trim() || null,
        timeframe: formData.timeframe,
        risk_level: formData.risk_level
      }

      const { error } = await db.createSignal(signalData)
      if (error) throw error

      toast.success('Signal created successfully!')
      navigate('/')
    } catch (error) {
      console.error('Error creating signal:', error)
      toast.error('Failed to create signal')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* Premium Header */}
      <header className="border-b border-gray-950 px-6 py-5 flex items-center justify-between backdrop-blur-xl bg-black/80 sticky top-0 z-10">
        <button 
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-white transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
        </button>
        <h1 className="text-base font-light tracking-tight">Post Signal</h1>
        <button
          onClick={handleSubmit}
          disabled={creating}
          className="bg-white text-black px-5 py-2 text-sm font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {creating ? <Loader className="w-4 h-4 animate-spin" strokeWidth={1.5} /> : 'Publish'}
        </button>
      </header>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="p-6 space-y-8 max-w-2xl mx-auto">
          {/* Direction */}
          <div>
            <label className="block text-sm font-light text-gray-400 mb-3">
              Direction
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, direction: 'LONG' })}
                className={`p-4 border font-light transition-all duration-200 ${
                  formData.direction === 'LONG'
                    ? 'border-white bg-white/5 text-white'
                    : 'border-gray-900 bg-black text-gray-600 hover:border-gray-800'
                }`}
              >
                LONG
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, direction: 'SHORT' })}
                className={`p-4 border font-light transition-all duration-200 ${
                  formData.direction === 'SHORT'
                    ? 'border-white bg-white/5 text-white'
                    : 'border-gray-900 bg-black text-gray-600 hover:border-gray-800'
                }`}
              >
                SHORT
              </button>
            </div>
          </div>

          {/* Symbol */}
          <div>
            <label className="block text-sm font-light text-gray-400 mb-3">
              Stock Symbol
            </label>
            <input
              type="text"
              value={formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
              placeholder="e.g., RELIANCE, TCS, INFY"
              className="w-full px-4 py-3 bg-black border border-gray-900 text-white placeholder-gray-700 focus:outline-none focus:border-gray-800 transition-colors duration-200 font-light"
            />
          </div>

          {/* Entry Zone */}
          <div>
            <label className="block text-sm font-light text-gray-400 mb-3">
              Entry Zone
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                step="0.01"
                value={formData.entry_min}
                onChange={(e) => setFormData({ ...formData, entry_min: e.target.value })}
                placeholder="Min"
                className="w-full px-4 py-3 bg-black border border-gray-900 text-white placeholder-gray-700 focus:outline-none focus:border-gray-800 transition-colors duration-200 font-light"
              />
              <input
                type="number"
                step="0.01"
                value={formData.entry_max}
                onChange={(e) => setFormData({ ...formData, entry_max: e.target.value })}
                placeholder="Max"
                className="w-full px-4 py-3 bg-black border border-gray-900 text-white placeholder-gray-700 focus:outline-none focus:border-gray-800 transition-colors duration-200 font-light"
              />
            </div>
          </div>

          {/* Targets */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-light text-gray-400">
                Targets
              </label>
              {formData.targets.length < 3 && (
                <button
                  type="button"
                  onClick={addTarget}
                  className="text-sm text-white font-light hover:text-gray-400 transition-colors duration-200"
                >
                  Add Target
                </button>
              )}
            </div>
            <div className="space-y-3">
              {formData.targets.map((target, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-xs font-light text-gray-600 w-16">
                    Target {index + 1}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={target}
                    onChange={(e) => updateTarget(index, e.target.value)}
                    placeholder="Price"
                    className="flex-1 px-4 py-3 bg-black border border-gray-900 text-white placeholder-gray-700 focus:outline-none focus:border-gray-800 transition-colors duration-200 font-light"
                  />
                  {formData.targets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTarget(index)}
                      className="text-gray-600 hover:text-white transition-colors duration-200"
                    >
                      <X className="w-5 h-5" strokeWidth={1.5} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Stop Loss */}
          <div>
            <label className="block text-sm font-light text-gray-400 mb-3">
              Stop Loss
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.stop_loss}
              onChange={(e) => setFormData({ ...formData, stop_loss: e.target.value })}
              placeholder="Price"
              className="w-full px-4 py-3 bg-black border border-gray-900 text-white placeholder-gray-700 focus:outline-none focus:border-gray-800 transition-colors duration-200 font-light"
            />
          </div>

          {/* Timeframe */}
          <div>
            <label className="block text-sm font-light text-gray-400 mb-3">
              Timeframe
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['INTRADAY', 'SWING', 'POSITIONAL'].map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => setFormData({ ...formData, timeframe: tf })}
                  className={`p-3 border text-xs font-light transition-all duration-200 ${
                    formData.timeframe === tf
                      ? 'border-white bg-white/5 text-white'
                      : 'border-gray-900 bg-black text-gray-600 hover:border-gray-800'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Risk Level */}
          <div>
            <label className="block text-sm font-light text-gray-400 mb-3">
              Risk Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['LOW', 'MEDIUM', 'HIGH'].map((risk) => (
                <button
                  key={risk}
                  type="button"
                  onClick={() => setFormData({ ...formData, risk_level: risk })}
                  className={`p-3 border text-xs font-light transition-all duration-200 ${
                    formData.risk_level === risk
                      ? 'border-white bg-white/5 text-white'
                      : 'border-gray-900 bg-black text-gray-600 hover:border-gray-800'
                  }`}
                >
                  {risk}
                </button>
              ))}
            </div>
          </div>

          {/* Rationale */}
          <div>
            <label className="block text-sm font-light text-gray-400 mb-3">
              Rationale (Optional)
            </label>
            <textarea
              value={formData.rationale}
              onChange={(e) => setFormData({ ...formData, rationale: e.target.value })}
              placeholder="Share your analysis..."
              rows={4}
              className="w-full px-4 py-3 bg-black border border-gray-900 text-white placeholder-gray-700 focus:outline-none focus:border-gray-800 resize-none transition-colors duration-200 font-light"
            />
          </div>

          {/* Info Box */}
          <div className="border border-gray-900 bg-gray-950/30 p-5">
            <h3 className="font-light text-white mb-3 text-sm">Signal Guidelines</h3>
            <ul className="text-xs text-gray-600 space-y-2 font-light leading-relaxed">
              <li>Ensure all prices are realistic and properly validated</li>
              <li>For LONG signals: Targets above entry, stop loss below</li>
              <li>For SHORT signals: Targets below entry, stop loss above</li>
              <li>Your signal performance affects your reputation score</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
