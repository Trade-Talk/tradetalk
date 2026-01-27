import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Trophy, X, CheckCircle, Clock } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

/**
 * SentimentVoter Component - DISABLED
 * 
 * This component used the daily_predictions feature which has been removed.
 * The component is disabled and will not render anything.
 * 
 * To re-enable this feature:
 * 1. Run ARCHIVED_MIGRATION_ADD_PREDICTIONS.sql in Supabase
 * 2. Add the prediction API methods to src/lib/supabase.js
 * 3. Uncomment the code below
 */

export default function SentimentVoter() {
  // Component is disabled - daily_predictions feature removed
  // This prevents 404 errors when trying to access the non-existent table
  return null
}

/* ORIGINAL CODE - COMMENTED OUT
 * Uncomment this if you want to restore the daily predictions feature
 * Make sure to run the migration first!

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Trophy, X, CheckCircle, Clock } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

export default function SentimentVoter() {
  const { user } = useAuth()
  const [showPopup, setShowPopup] = useState(false)
  const [todayPrediction, setTodayPrediction] = useState(null)
  const [userStats, setUserStats] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tablesExist, setTablesExist] = useState(false)

  useEffect(() => {
    checkTablesAndPrediction()
  }, [user])

  const checkTablesAndPrediction = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      // Check if tables exist by trying to query them
      const { error: tableError } = await supabase
        .from('daily_predictions')
        .select('count')
        .limit(1)

      if (tableError) {
        // Tables don't exist - silently disable feature
        console.log('Prediction tables not yet created. Run MIGRATION_ADD_PREDICTIONS.sql')
        setTablesExist(false)
        setLoading(false)
        return
      }

      setTablesExist(true)
      
      const today = new Date().toISOString().split('T')[0]
      
      // Check if user already predicted today
      const { data: prediction, error: predError } = await supabase
        .from('daily_predictions')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single()

      if (!predError && prediction) {
        setTodayPrediction(prediction)
        
        // Check if market has closed (3:30 PM IST)
        const now = new Date()
        const marketClose = new Date()
        marketClose.setHours(15, 30, 0, 0)
        
        if (now > marketClose && !prediction.result_calculated) {
          await calculateResult(prediction)
        }
      } else {
        // Show popup if before market open (9:15 AM IST)
        const now = new Date()
        const marketOpen = new Date()
        marketOpen.setHours(9, 15, 0, 0)
        
        if (now < marketOpen && now.getHours() >= 7) { // Show from 7 AM to 9:15 AM
          setShowPopup(true)
        }
      }

      // Load user stats
      await loadUserStats()

    } catch (error) {
      console.error('Error checking prediction:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserStats = async () => {
    if (!user || !tablesExist) return

    try {
      const { data, error } = await supabase
        .from('prediction_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle() // Use maybeSingle to avoid error if no record

      if (data) {
        setUserStats(data)
      } else {
        // Initialize default stats
        setUserStats({
          total_predictions: 0,
          correct_predictions: 0,
          accuracy: 0,
          streak: 0
        })
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const submitPrediction = async (prediction) => {
    if (!user) {
      toast.error('Please sign in to predict')
      return
    }

    if (!tablesExist) {
      toast.error('Prediction feature not yet available')
      return
    }

    try {
      const today = new Date().toISOString().split('T')[0]
      
      const { data, error } = await supabase
        .from('daily_predictions')
        .insert({
          user_id: user.id,
          date: today,
          prediction: prediction, // 'bullish' or 'bearish'
          predicted_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      setTodayPrediction(data)
      setShowPopup(false)
      toast.success(`Prediction recorded: ${prediction.toUpperCase()}! Check back at 3:30 PM`)

    } catch (error) {
      console.error('Error submitting prediction:', error)
      toast.error('Failed to submit prediction')
    }
  }

  const calculateResult = async (prediction) => {
    if (!tablesExist) return

    try {
      // In production, fetch actual NIFTY opening and closing prices
      // For now, simulate with random result
      const isCorrect = Math.random() > 0.5
      
      await supabase
        .from('daily_predictions')
        .update({
          result_calculated: true,
          was_correct: isCorrect
        })
        .eq('id', prediction.id)

      // Update user stats
      const newTotal = (userStats?.total_predictions || 0) + 1
      const newCorrect = (userStats?.correct_predictions || 0) + (isCorrect ? 1 : 0)
      const newAccuracy = Math.round((newCorrect / newTotal) * 100)
      const newStreak = isCorrect ? (userStats?.streak || 0) + 1 : 0

      await supabase
        .from('prediction_stats')
        .upsert({
          user_id: user.id,
          total_predictions: newTotal,
          correct_predictions: newCorrect,
          accuracy: newAccuracy,
          streak: newStreak,
          best_streak: Math.max(newStreak, userStats?.best_streak || 0)
        })

      setResult({ isCorrect, prediction: prediction.prediction })
      loadUserStats()

      if (isCorrect) {
        toast.success('🎉 You predicted correctly! +1 to accuracy')
      }

    } catch (error) {
      console.error('Error calculating result:', error)
    }
  }

  // Don't render anything if tables don't exist or still loading
  if (loading || !tablesExist) return null

  return (
    <>
      {/* Daily Prediction Popup *\/}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-scale-in">
            {/* Header *\/}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Daily Market Prediction</h2>
              <button
                onClick={() => setShowPopup(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Question *\/}
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                NIFTY 50: Bullish or Bearish today?
              </h3>
              <p className="text-sm text-gray-600">
                Make your prediction before market opens
              </p>
            </div>

            {/* Stats Preview *\/}
            {userStats && userStats.total_predictions > 0 && (
              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                <div className="text-sm text-center">
                  <span className="font-semibold text-blue-900">Your Accuracy: </span>
                  <span className="text-blue-700">{userStats.accuracy}%</span>
                  <span className="text-gray-600 ml-2">
                    ({userStats.correct_predictions}/{userStats.total_predictions} correct)
                  </span>
                </div>
              </div>
            )}

            {/* Prediction Buttons *\/}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => submitPrediction('bullish')}
                className="flex flex-col items-center justify-center p-6 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all active:scale-95 shadow-lg"
              >
                <TrendingUp size={32} className="mb-2" />
                <span className="font-bold text-lg">BULLISH</span>
                <span className="text-xs opacity-80 mt-1">Market will rise</span>
              </button>

              <button
                onClick={() => submitPrediction('bearish')}
                className="flex flex-col items-center justify-center p-6 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all active:scale-95 shadow-lg"
              >
                <TrendingDown size={32} className="mb-2" />
                <span className="font-bold text-lg">BEARISH</span>
                <span className="text-xs opacity-80 mt-1">Market will fall</span>
              </button>
            </div>

            {/* Info *\/}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
              <div className="flex items-start gap-2">
                <Clock size={14} className="mt-0.5 flex-shrink-0" />
                <p>
                  Results revealed at 3:30 PM. Correct predictions earn you a badge and improve your accuracy score!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Result Notification *\/}
      {result && (
        <div className="fixed bottom-24 left-0 right-0 flex justify-center z-50 px-4">
          <div className={`${
            result.isCorrect ? 'bg-green-500' : 'bg-red-500'
          } text-white rounded-2xl p-4 shadow-2xl max-w-md w-full animate-slide-up`}>
            <div className="flex items-center gap-3">
              {result.isCorrect ? (
                <CheckCircle size={32} />
              ) : (
                <X size={32} />
              )}
              <div className="flex-1">
                <h3 className="font-bold text-lg">
                  {result.isCorrect ? '🎉 Correct Prediction!' : '❌ Incorrect Prediction'}
                </h3>
                <p className="text-sm opacity-90">
                  You predicted: {result.prediction.toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => setResult(null)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Badge (shows in profile) *\/}
      {userStats && userStats.total_predictions > 0 && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-4 shadow-lg mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              <span className="font-semibold">Prediction Stats</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold">{userStats.accuracy}%</div>
              <div className="text-xs opacity-80">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{userStats.streak}</div>
              <div className="text-xs opacity-80">Current Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{userStats.total_predictions}</div>
              <div className="text-xs opacity-80">Total Predictions</div>
            </div>
          </div>

          {userStats.accuracy >= 80 && (
            <div className="mt-3 bg-white/20 rounded-lg p-2 text-center text-sm font-medium">
              🏆 Expert Predictor Badge Earned!
            </div>
          )}
        </div>
      )}
    </>
  )
}

END COMMENTED CODE */
