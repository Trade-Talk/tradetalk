// Signal Price Update Service
// This should run as a background job (cron/scheduled function)
// Updates signal prices and statuses automatically

import { supabase } from './supabase'
import { getCurrentPrice, isMarketOpen } from './marketData'

/**
 * Update all active and pending signals with current prices
 * Should be called every 1-5 minutes during market hours
 */
export async function updateAllSignalPrices() {
  if (!isMarketOpen()) {
    console.log('⏸️ Market is closed, skipping price updates')
    return { updated: 0, message: 'Market closed' }
  }

  try {
    console.log('🔄 Starting batch signal price update...')

    // Get all active and pending signals
    const { data: signals, error } = await supabase
      .from('signals')
      .select('*')
      .in('status', ['pending', 'active'])
      .order('created_at', { ascending: false })

    if (error) throw error

    if (!signals || signals.length === 0) {
      console.log('📭 No active signals to update')
      return { updated: 0, message: 'No active signals' }
    }

    console.log(`📊 Found ${signals.length} active signals to update`)

    let updated = 0
    let statusChanged = 0

    // Update each signal
    for (const signal of signals) {
      try {
        // Fetch current price
        const currentPrice = await getCurrentPrice(signal.symbol, signal.exchange || 'NSE')

        // Determine new status based on price
        const newStatus = checkSignalStatus(signal, currentPrice)

        // Update in database
        const updates = {
          current_price: currentPrice,
          updated_at: new Date().toISOString()
        }

        // If status changed, add status updates
        if (newStatus !== signal.status) {
          updates.status = newStatus
          
          if (newStatus === 'active' && !signal.entry_triggered_at) {
            updates.entry_triggered_at = new Date().toISOString()
          }
          
          if (newStatus === 'target_hit') {
            updates.target_hit_at = new Date().toISOString()
            updates.closed_at = new Date().toISOString()
          }
          
          if (newStatus === 'stop_hit') {
            updates.closed_at = new Date().toISOString()
          }

          statusChanged++
          console.log(`📈 Signal ${signal.symbol}: ${signal.status} → ${newStatus} at ₹${currentPrice}`)
        }

        const { error: updateError } = await supabase
          .from('signals')
          .update(updates)
          .eq('id', signal.id)

        if (updateError) {
          console.error(`❌ Error updating signal ${signal.id}:`, updateError)
        } else {
          updated++
        }

        // If signal closed, recalculate advisor stats
        if (newStatus === 'target_hit' || newStatus === 'stop_hit') {
          await updateAdvisorStats(signal.advisor_id)
        }

      } catch (error) {
        console.error(`❌ Error processing signal ${signal.id}:`, error.message)
      }
    }

    const message = `Updated ${updated}/${signals.length} signals (${statusChanged} status changes)`
    console.log(`✅ ${message}`)
    
    return { 
      updated, 
      total: signals.length, 
      statusChanged,
      message 
    }

  } catch (error) {
    console.error('❌ Error in batch update:', error)
    return { error: error.message }
  }
}

/**
 * Check what status a signal should have based on current price
 */
function checkSignalStatus(signal, currentPrice) {
  const entryMin = parseFloat(signal.entry_min)
  const entryMax = parseFloat(signal.entry_max)
  const stopLoss = parseFloat(signal.stop_loss)
  const target1 = parseFloat(signal.targets[0])

  // Check if price is in entry zone (pending → active)
  if (signal.status === 'pending') {
    if (currentPrice >= entryMin && currentPrice <= entryMax) {
      return 'active'
    }
    return 'pending'
  }

  // Check targets and stop loss for active signals
  if (signal.status === 'active') {
    // Check stop loss hit
    if (signal.direction === 'LONG' && currentPrice <= stopLoss) {
      return 'stop_hit'
    }
    if (signal.direction === 'SHORT' && currentPrice >= stopLoss) {
      return 'stop_hit'
    }

    // Check target hit
    if (signal.direction === 'LONG' && currentPrice >= target1) {
      return 'target_hit'
    }
    if (signal.direction === 'SHORT' && currentPrice <= target1) {
      return 'target_hit'
    }

    return 'active'
  }

  // Already closed signals don't change
  return signal.status
}

/**
 * Recalculate advisor stats after signal closes
 */
async function updateAdvisorStats(advisorId) {
  try {
    console.log(`📊 Recalculating stats for advisor ${advisorId}`)

    // Get all closed signals for last 90 days
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    const { data: signals, error } = await supabase
      .from('signals')
      .select('*')
      .eq('advisor_id', advisorId)
      .in('status', ['target_hit', 'stop_hit', 'expired'])
      .gte('created_at', ninetyDaysAgo.toISOString())

    if (error) throw error

    const totalSignals = signals.length
    const wins = signals.filter(s => s.status === 'target_hit').length
    const losses = signals.filter(s => s.status === 'stop_hit').length

    const accuracy = totalSignals > 0 ? (wins / totalSignals) * 100 : 0

    // Calculate returns
    const returns = signals
      .filter(s => s.status === 'target_hit' || s.status === 'stop_hit')
      .map(s => {
        const entryAvg = (parseFloat(s.entry_min) + parseFloat(s.entry_max)) / 2
        
        if (s.status === 'target_hit') {
          const target = parseFloat(s.targets[0])
          return ((target - entryAvg) / entryAvg) * 100
        } else {
          const stopLoss = parseFloat(s.stop_loss)
          return ((stopLoss - entryAvg) / entryAvg) * 100
        }
      })

    const avgReturn = returns.length > 0 
      ? returns.reduce((a, b) => a + b, 0) / returns.length 
      : 0

    const bestReturn = returns.length > 0 ? Math.max(...returns) : 0
    const maxDrawdown = returns.length > 0 ? Math.min(...returns) : 0

    // Calculate average hold time
    const holdTimes = signals
      .filter(s => s.entry_triggered_at && s.closed_at)
      .map(s => new Date(s.closed_at) - new Date(s.entry_triggered_at))

    const avgHoldTime = holdTimes.length > 0
      ? holdTimes.reduce((a, b) => a + b, 0) / holdTimes.length
      : 0

    // Determine risk profile
    let riskProfile = 'MODERATE'
    if (avgReturn > 15) riskProfile = 'AGGRESSIVE'
    else if (avgReturn < 5) riskProfile = 'CONSERVATIVE'

    // Update stats
    const stats = {
      advisor_id: advisorId,
      accuracy_90d: accuracy,
      avg_return_90d: avgReturn,
      total_signals: totalSignals,
      wins,
      losses,
      best_return: bestReturn,
      max_drawdown: maxDrawdown,
      avg_hold_time: avgHoldTime,
      risk_profile: riskProfile,
      last_calculated: new Date().toISOString()
    }

    const { error: upsertError } = await supabase
      .from('advisor_stats')
      .upsert(stats)

    if (upsertError) throw upsertError

    console.log(`✅ Stats updated for advisor ${advisorId}: ${accuracy.toFixed(1)}% accuracy, ${avgReturn.toFixed(1)}% avg return`)

    return stats

  } catch (error) {
    console.error('Error updating advisor stats:', error)
    throw error
  }
}

/**
 * Update a single signal's price (useful for manual refresh)
 */
export async function updateSignalPrice(signalId) {
  try {
    // Get signal
    const { data: signal, error } = await supabase
      .from('signals')
      .select('*')
      .eq('id', signalId)
      .single()

    if (error) throw error

    // Fetch current price
    const currentPrice = await getCurrentPrice(signal.symbol, signal.exchange || 'NSE')

    // Check new status
    const newStatus = checkSignalStatus(signal, currentPrice)

    // Update
    const updates = {
      current_price: currentPrice,
      updated_at: new Date().toISOString()
    }

    if (newStatus !== signal.status) {
      updates.status = newStatus
      
      if (newStatus === 'active' && !signal.entry_triggered_at) {
        updates.entry_triggered_at = new Date().toISOString()
      }
      
      if (newStatus === 'target_hit') {
        updates.target_hit_at = new Date().toISOString()
        updates.closed_at = new Date().toISOString()
      }
      
      if (newStatus === 'stop_hit') {
        updates.closed_at = new Date().toISOString()
      }
    }

    const { data, error: updateError } = await supabase
      .from('signals')
      .update(updates)
      .eq('id', signalId)
      .select()
      .single()

    if (updateError) throw updateError

    // Update stats if closed
    if (newStatus === 'target_hit' || newStatus === 'stop_hit') {
      await updateAdvisorStats(signal.advisor_id)
    }

    return data

  } catch (error) {
    console.error('Error updating signal price:', error)
    throw error
  }
}

/**
 * Setup interval to auto-update prices
 * Call this when app starts
 */
export function startPriceUpdateService(intervalMinutes = 1) {
  console.log(`🚀 Starting price update service (every ${intervalMinutes} minutes)`)

  // Run immediately
  updateAllSignalPrices()

  // Then run on interval
  const interval = setInterval(() => {
    updateAllSignalPrices()
  }, intervalMinutes * 60 * 1000)

  // Return cleanup function
  return () => {
    console.log('🛑 Stopping price update service')
    clearInterval(interval)
  }
}

export default {
  updateAllSignalPrices,
  updateSignalPrice,
  updateAdvisorStats,
  startPriceUpdateService
}
