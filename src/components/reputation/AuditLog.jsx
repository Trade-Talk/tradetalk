import { useState } from 'react';
import { TrendingUp, TrendingDown, CheckCircle, XCircle, Clock, Filter } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

export default function AuditLog({ advisorId, signals }) {
  const [filter, setFilter] = useState('ALL'); // ALL, TARGET_HIT, STOP_HIT, ACTIVE
  const [timeRange, setTimeRange] = useState('90'); // 30, 90, 180, ALL

  const filteredSignals = signals.filter(signal => {
    if (filter !== 'ALL' && signal.status !== filter) return false;
    if (timeRange !== 'ALL') {
      const days = parseInt(timeRange);
      const signalDate = new Date(signal.created_at);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      if (signalDate < cutoffDate) return false;
    }
    return true;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      target_hit: {
        icon: <CheckCircle size={16} />,
        text: 'Target Hit',
        color: 'bg-green-100 text-green-700 border-green-300'
      },
      stop_hit: {
        icon: <XCircle size={16} />,
        text: 'Stop Hit',
        color: 'bg-red-100 text-red-700 border-red-300'
      },
      active: {
        icon: <Clock size={16} />,
        text: 'Active',
        color: 'bg-blue-100 text-blue-700 border-blue-300'
      },
      pending: {
        icon: <Clock size={16} />,
        text: 'Pending',
        color: 'bg-yellow-100 text-yellow-700 border-yellow-300'
      },
      expired: {
        icon: <XCircle size={16} />,
        text: 'Expired',
        color: 'bg-gray-100 text-gray-700 border-gray-300'
      }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
        {config.icon}
        {config.text}
      </span>
    );
  };

  const calculateReturn = (signal) => {
    if (signal.status === 'target_hit') {
      const entry = (signal.entry_min + signal.entry_max) / 2;
      const exit = signal.targets[0]; // First target
      const returnPercent = signal.direction === 'LONG'
        ? ((exit - entry) / entry) * 100
        : ((entry - exit) / entry) * 100;
      return returnPercent.toFixed(2);
    } else if (signal.status === 'stop_hit') {
      const entry = (signal.entry_min + signal.entry_max) / 2;
      const exit = signal.stop_loss;
      const returnPercent = signal.direction === 'LONG'
        ? ((exit - entry) / entry) * 100
        : ((entry - exit) / entry) * 100;
      return returnPercent.toFixed(2);
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            📋 Trade Audit Log
          </h2>
          <span className="text-sm text-gray-500">
            {filteredSignals.length} trades
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Immutable record of all trading signals. Once posted, signals cannot be deleted—only closed.
        </p>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <span className="text-sm text-gray-600 font-medium">Status:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">All</option>
              <option value="target_hit">Target Hit</option>
              <option value="stop_hit">Stop Hit</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 font-medium">Period:</span>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="180">Last 6 Months</option>
              <option value="ALL">All Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Signal List */}
      <div className="divide-y divide-gray-100">
        {filteredSignals.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-2">📭</div>
            <p className="text-gray-500">No signals found for the selected filters</p>
          </div>
        ) : (
          filteredSignals.map((signal) => {
            const returnPercent = calculateReturn(signal);
            return (
              <div key={signal.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      signal.direction === 'LONG' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {signal.direction === 'LONG' ? (
                        <TrendingUp className="text-green-700" size={20} />
                      ) : (
                        <TrendingDown className="text-red-700" size={20} />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 text-lg">
                          {signal.symbol}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({signal.exchange})
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                          signal.direction === 'LONG'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {signal.direction}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-0.5">
                        Posted {formatDistanceToNow(new Date(signal.created_at), { addSuffix: true })}
                        {' • '}
                        {format(new Date(signal.created_at), 'MMM d, yyyy h:mm a')}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    {getStatusBadge(signal.status)}
                    {returnPercent && (
                      <div className={`text-sm font-bold mt-1 ${
                        parseFloat(returnPercent) > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {parseFloat(returnPercent) > 0 ? '+' : ''}{returnPercent}%
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Entry:</span>
                    <div className="font-semibold text-gray-900">
                      ₹{signal.entry_min} - ₹{signal.entry_max}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Target:</span>
                    <div className="font-semibold text-green-600">
                      ₹{signal.targets[0]}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Stop Loss:</span>
                    <div className="font-semibold text-red-600">
                      ₹{signal.stop_loss}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Timeframe:</span>
                    <div className="font-semibold text-gray-900">
                      {signal.timeframe}
                    </div>
                  </div>
                </div>

                {signal.closed_at && (
                  <div className="mt-2 text-xs text-gray-500">
                    Closed {formatDistanceToNow(new Date(signal.closed_at), { addSuffix: true })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Summary */}
      {filteredSignals.length > 0 && (
        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {filteredSignals.filter(s => s.status === 'target_hit').length}
              </div>
              <div className="text-xs text-gray-600">Targets Hit</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {filteredSignals.filter(s => s.status === 'stop_hit').length}
              </div>
              <div className="text-xs text-gray-600">Stops Hit</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {filteredSignals.filter(s => s.status === 'active').length}
              </div>
              <div className="text-xs text-gray-600">Active</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {(
                  (filteredSignals.filter(s => s.status === 'target_hit').length /
                    (filteredSignals.filter(s => s.status === 'target_hit' || s.status === 'stop_hit').length || 1)) *
                  100
                ).toFixed(0)}%
              </div>
              <div className="text-xs text-gray-600">Win Rate</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
