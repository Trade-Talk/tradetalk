import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Lock, AlertCircle, Target, Shield, Clock, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getCurrentPrice, isMarketOpen, getMarketStatus } from '../../lib/marketData';

const SignalStatus = {
  PENDING: 'pending',
  ACTIVE: 'active',
  TARGET_HIT: 'target_hit',
  STOP_HIT: 'stop_hit',
  EXPIRED: 'expired'
};

export default function SmartSignalCard({ signal, onUnlock, isSubscribed, onDelete }) {
  const [currentPrice, setCurrentPrice] = useState(signal.current_price || signal.entry_min);
  const [status, setStatus] = useState(signal.status || SignalStatus.PENDING);
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const advisor = signal.advisor || {
    full_name: 'Advisor',
    avatar_url: null,
    is_verified: false
  };

  const fetchLivePrice = async () => {
    try {
      setPriceLoading(true);
      setPriceError(null);
      
      const price = await getCurrentPrice(signal.symbol, signal.exchange || 'NSE');
      setCurrentPrice(parseFloat(price.toFixed(2)));
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error('Error fetching price:', error);
      setPriceError(error.message);
    } finally {
      setPriceLoading(false);
    }
  };

  useEffect(() => {
    fetchLivePrice();
    
    const marketStatus = getMarketStatus();
    if (marketStatus.isOpen && (status === SignalStatus.PENDING || status === SignalStatus.ACTIVE)) {
      const interval = setInterval(() => {
        fetchLivePrice();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [signal.symbol, signal.exchange]);

  useEffect(() => {
    if (status !== SignalStatus.ACTIVE && status !== SignalStatus.PENDING) return;

    const entryMin = parseFloat(signal.entry_min);
    const entryMax = parseFloat(signal.entry_max);
    const stopLoss = parseFloat(signal.stop_loss);
    const target1 = parseFloat(signal.targets[0]);

    if (status === SignalStatus.PENDING && currentPrice >= entryMin && currentPrice <= entryMax) {
      setStatus(SignalStatus.ACTIVE);
    }

    if (status === SignalStatus.ACTIVE) {
      if (signal.direction === 'LONG' && currentPrice <= stopLoss) {
        setStatus(SignalStatus.STOP_HIT);
      } else if (signal.direction === 'SHORT' && currentPrice >= stopLoss) {
        setStatus(SignalStatus.STOP_HIT);
      }

      if (signal.direction === 'LONG' && currentPrice >= target1) {
        setStatus(SignalStatus.TARGET_HIT);
      } else if (signal.direction === 'SHORT' && currentPrice <= target1) {
        setStatus(SignalStatus.TARGET_HIT);
      }
    }
  }, [currentPrice, signal, status]);

  const getPriceChange = () => {
    const entry = (parseFloat(signal.entry_min) + parseFloat(signal.entry_max)) / 2;
    const change = currentPrice - entry;
    const changePercent = ((change / entry) * 100).toFixed(2);
    return {
      value: change.toFixed(2),
      percent: changePercent,
      isPositive: signal.direction === 'LONG' ? change > 0 : change < 0
    };
  };

  const getEntryStatus = () => {
    if (status !== SignalStatus.PENDING) return null;
    
    const entryAvg = (parseFloat(signal.entry_min) + parseFloat(signal.entry_max)) / 2;
    
    if (signal.direction === 'LONG') {
      if (currentPrice > parseFloat(signal.entry_max) * 1.03) {
        return { type: 'missed', text: 'Entry Missed', color: 'text-red-500 bg-red-500/10' };
      } else if (currentPrice > parseFloat(signal.entry_max) * 1.01) {
        return { type: 'risk', text: 'High Risk', color: 'text-orange-500 bg-orange-500/10' };
      }
    } else {
      if (currentPrice < parseFloat(signal.entry_min) * 0.97) {
        return { type: 'missed', text: 'Entry Missed', color: 'text-red-500 bg-red-500/10' };
      } else if (currentPrice < parseFloat(signal.entry_min) * 0.99) {
        return { type: 'risk', text: 'High Risk', color: 'text-orange-500 bg-orange-500/10' };
      }
    }
    
    if (currentPrice >= parseFloat(signal.entry_min) && currentPrice <= parseFloat(signal.entry_max)) {
      return { type: 'good', text: 'Good Entry', color: 'text-green-500 bg-green-500/10' };
    }
    
    return null;
  };

  const getStatusBadge = () => {
    switch (status) {
      case SignalStatus.TARGET_HIT:
        return { text: 'Target Hit', color: 'text-green-500 border-green-500' };
      case SignalStatus.STOP_HIT:
        return { text: 'Stop Hit', color: 'text-red-500 border-red-500' };
      case SignalStatus.ACTIVE:
        return { text: 'Active', color: 'text-white border-gray-800' };
      case SignalStatus.PENDING:
        return { text: 'Pending', color: 'text-gray-400 border-gray-800' };
      default:
        return { text: 'Expired', color: 'text-gray-600 border-gray-800' };
    }
  };

  const priceChange = status === SignalStatus.ACTIVE || status === SignalStatus.PENDING ? getPriceChange() : null;
  const entryStatus = getEntryStatus();
  const marketStatus = getMarketStatus();
  const statusBadge = getStatusBadge();

  return (
    <div className="bg-black border border-gray-900 hover:border-gray-800 transition-colors duration-200">
      {/* Header - Premium spacing */}
      <div className="p-6 border-b border-gray-950">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-black border border-gray-900 flex items-center justify-center text-white font-light text-sm">
              {advisor.full_name?.[0] || 'A'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-light text-white text-sm">{advisor.full_name || 'Advisor'}</span>
                {advisor.is_verified && (
                  <span className="text-white text-xs">✓</span>
                )}
              </div>
              <span className="text-xs text-gray-500 font-light">
                {formatDistanceToNow(new Date(signal.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className={`px-3 py-1 border text-xs font-light ${statusBadge.color}`}>
              {statusBadge.text}
            </div>
            {entryStatus && (
              <div className={`px-3 py-1 text-xs font-light ${entryStatus.color}`}>
                {entryStatus.text}
              </div>
            )}
          </div>
        </div>

        {/* Direction & Symbol */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 px-3 py-1 text-sm font-medium ${
            signal.direction === 'LONG' ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'
          }`}>
            {signal.direction === 'LONG' ? <TrendingUp size={14} strokeWidth={2} /> : <TrendingDown size={14} strokeWidth={2} />}
            {signal.direction}
          </div>
          <span className="text-xl font-light text-white">{signal.symbol}</span>
          <span className="text-sm text-gray-500 font-light">({signal.exchange || 'NSE'})</span>
        </div>
      </div>

      {/* Price Info - High contrast for readability */}
      <div className="p-6 border-b border-gray-950">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <div className="text-xs text-gray-500 mb-2 font-light">Entry Zone</div>
            <div className="font-light text-white">
              ₹{signal.entry_min} - ₹{signal.entry_max}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-2 flex items-center gap-2 font-light">
              CMP 
              {marketStatus.isOpen && !priceLoading && (
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              )}
              {!marketStatus.isOpen && (
                <span className="text-xs text-gray-500">(Closed)</span>
              )}
              {priceLoading && (
                <RefreshCw size={10} className="animate-spin text-white" strokeWidth={1.5} />
              )}
            </div>
            <div className="font-light text-white">
              {priceLoading && !currentPrice ? (
                <span className="text-gray-500">Loading...</span>
              ) : priceError ? (
                <div>
                  <span className="text-red-500 text-xs">Error</span>
                  <button 
                    onClick={fetchLivePrice}
                    className="ml-2 text-xs text-white hover:text-gray-300 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <>
                  ₹{currentPrice.toFixed(2)}
                  {priceChange && (
                    <span className={`ml-2 text-sm font-medium ${priceChange.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                      {priceChange.isPositive ? '+' : ''}{priceChange.percent}%
                    </span>
                  )}
                  {lastUpdated && (
                    <div className="text-xs text-gray-500 mt-1 font-light">
                      {formatDistanceToNow(lastUpdated, { addSuffix: true })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Market Status */}
        {!marketStatus.isOpen && (
          <div className="mb-6 p-3 border border-gray-900 bg-gray-950">
            <div className="text-xs text-gray-500 flex items-center gap-2 font-light">
              <Clock size={12} strokeWidth={1.5} />
              {marketStatus.message}
            </div>
          </div>
        )}

        {/* Targets - Semantic colors for data */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3 font-light">
            <Target size={12} strokeWidth={1.5} />
            Targets
          </div>
          <div className="flex gap-2">
            {signal.targets.map((target, idx) => (
              <div
                key={idx}
                className={`flex-1 px-3 py-2 border ${
                  idx === 0 || isSubscribed
                    ? 'border-green-500/30 bg-green-500/10'
                    : 'border-gray-900 bg-gray-950 relative'
                }`}
              >
                <div className="text-xs text-gray-500 font-light">T{idx + 1}</div>
                {idx === 0 || isSubscribed ? (
                  <div className="font-light text-green-500">₹{target}</div>
                ) : (
                  <div className="flex items-center gap-1 text-gray-600">
                    <Lock size={12} strokeWidth={1.5} />
                    <span className="text-xs font-light">Locked</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Stop Loss - Semantic red for risk */}
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3 font-light">
            <Shield size={12} strokeWidth={1.5} />
            Stop Loss
          </div>
          <div className="px-3 py-2 border border-red-500/30 bg-red-500/10">
            <div className="font-light text-red-500">₹{signal.stop_loss}</div>
          </div>
        </div>
      </div>

      {/* Rationale */}
      {signal.rationale && (
        <div className="p-6 border-b border-gray-950">
          <div className="text-sm text-gray-400 mb-4 font-light leading-relaxed">
            {signal.rationale.substring(0, 120)}{signal.rationale.length > 120 ? '...' : ''}
          </div>

          {!isSubscribed && signal.rationale.length > 120 && (
            <button
              onClick={() => onUnlock?.(signal.id)}
              className="w-full py-3 px-4 bg-white text-black font-medium hover:bg-gray-100 transition-all duration-200 flex items-center justify-center gap-2 text-sm active:scale-[0.98]"
            >
              <Lock size={14} strokeWidth={2} />
              Unlock Full Analysis - ₹199/mo
            </button>
          )}
        </div>
      )}

      {/* Metadata - Improved contrast */}
      <div className="p-6">
        <div className="flex items-center gap-6 text-xs text-gray-500 font-light">
          <div className="flex items-center gap-2">
            <Clock size={12} strokeWidth={1.5} />
            {signal.timeframe}
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle size={12} strokeWidth={1.5} />
            Risk: {signal.risk_level}
          </div>
        </div>
      </div>
    </div>
  );
}
