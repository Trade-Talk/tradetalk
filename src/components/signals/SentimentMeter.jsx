import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Activity, Users, Target } from 'lucide-react'
import { db } from '../../lib/supabase'

export default function SentimentMeter({ symbol }) {
  const [sentiment, setSentiment] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSentiment()
  }, [symbol])

  const loadSentiment = async () => {
    try {
      setLoading(true)
      
      // Get all active signals for this symbol from verified advisors
      const { data: signals, error } = await db.getSignals(100, 0)
      
      if (error) throw error

      // Filter for this symbol and active/pending signals only
      const relevantSignals = (signals || []).filter(s => 
        s.symbol === symbol && 
        (s.status === 'pending' || s.status === 'active')
      )

      if (relevantSignals.length === 0) {
        setSentiment(null)
        return
      }

      // Count bulls vs bears
      const bullishCount = relevantSignals.filter(s => s.direction === 'LONG').length
      const bearishCount = relevantSignals.filter(s => s.direction === 'SHORT').length
      const totalCount = relevantSignals.length

      const bullishPercent = Math.round((bullishCount / totalCount) * 100)
      
      // Determine overall sentiment
      let overallSentiment = 'NEUTRAL'
      let sentimentEmoji = '➡️'
      
      if (bullishPercent >= 70) {
        overallSentiment = 'STRONGLY BULLISH'
        sentimentEmoji = '🚀'
      } else if (bullishPercent >= 55) {
        overallSentiment = 'BULLISH'
        sentimentEmoji = '📈'
      } else if (bullishPercent <= 30) {
        overallSentiment = 'STRONGLY BEARISH'
        sentimentEmoji = '⚠️'
      } else if (bullishPercent <= 45) {
        overallSentiment = 'BEARISH'
        sentimentEmoji = '📉'
      }

      setSentiment({
        bullishPercent,
        bearishPercent: 100 - bullishPercent,
        bullishCount,
        bearishCount,
        totalAdvisors: totalCount,
        overallSentiment,
        sentimentEmoji,
        signals: relevantSignals
      })

    } catch (error) {
      console.error('Error loading sentiment:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    )
  }

  if (!sentiment) {
    return (
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Activity size={16} />
          <span>No active signals for {symbol} yet</span>
        </div>
      </div>
    )
  }

  const getSentimentColor = () => {
    if (sentiment.bullishPercent >= 70) return 'from-green-500 to-emerald-600'
    if (sentiment.bullishPercent >= 55) return 'from-green-400 to-green-500'
    if (sentiment.bullishPercent <= 30) return 'from-red-500 to-rose-600'
    if (sentiment.bullishPercent <= 45) return 'from-red-400 to-red-500'
    return 'from-gray-400 to-gray-500'
  }

  return (
    <div className={`bg-gradient-to-r ${getSentimentColor()} rounded-xl p-4 text-white shadow-lg`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          <span className="font-semibold text-sm">Market Sentiment</span>
        </div>
        <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full text-xs">
          <Users size={12} />
          <span>{sentiment.totalAdvisors} Advisors</span>
        </div>
      </div>

      {/* Sentiment Headline */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">{sentiment.sentimentEmoji}</span>
          <span className="text-xl font-bold">{sentiment.overallSentiment}</span>
        </div>
        <p className="text-sm opacity-90">
          {sentiment.bullishPercent}% of verified advisors have active BUY calls on {symbol} right now
        </p>
      </div>

      {/* Visual Bar */}
      <div className="mb-3">
        <div className="flex h-3 rounded-full overflow-hidden bg-white/20">
          <div 
            className="bg-green-400 transition-all duration-500"
            style={{ width: `${sentiment.bullishPercent}%` }}
          />
          <div 
            className="bg-red-400 transition-all duration-500"
            style={{ width: `${sentiment.bearishPercent}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs opacity-80">
          <div className="flex items-center gap-1">
            <TrendingUp size={12} />
            <span>{sentiment.bullishCount} Bullish</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingDown size={12} />
            <span>{sentiment.bearishCount} Bearish</span>
          </div>
        </div>
      </div>

      {/* Smart Money Indicator */}
      <div className="bg-white/10 rounded-lg p-2 text-xs">
        <div className="flex items-center gap-1">
          <Target size={12} />
          <span className="font-medium">Smart Money Insight:</span>
        </div>
        <p className="mt-1 opacity-90">
          {sentiment.bullishPercent >= 70 
            ? "Strong institutional buying interest detected"
            : sentiment.bullishPercent <= 30
            ? "Advisors are cautious - consider waiting"
            : "Mixed signals - watch for clearer direction"}
        </p>
      </div>
    </div>
  )
}
