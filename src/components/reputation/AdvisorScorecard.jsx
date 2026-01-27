import { TrendingUp, Award, Shield, Activity, Target, AlertTriangle } from 'lucide-react';

export default function AdvisorScorecard({ advisor, stats }) {
  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 70) return 'text-green-600';
    if (accuracy >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAccuracyBgColor = (accuracy) => {
    if (accuracy >= 70) return 'bg-green-50 border-green-200';
    if (accuracy >= 50) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getRiskColor = (risk) => {
    const riskColors = {
      LOW: 'text-green-600 bg-green-50',
      MEDIUM: 'text-yellow-600 bg-yellow-50',
      HIGH: 'text-red-600 bg-red-50'
    };
    return riskColors[risk] || 'text-gray-600 bg-gray-50';
  };

  const badges = advisor.badges || [];

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-4 mb-4">
          <img
            src={advisor.avatar || `https://ui-avatars.com/api/?name=${advisor.name}&size=80`}
            alt={advisor.name}
            className="w-20 h-20 rounded-full border-4 border-blue-100"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold text-gray-900">{advisor.name}</h2>
              {advisor.sebi_registered && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full flex items-center gap-1">
                  <Shield size={12} />
                  SEBI Verified
                </span>
              )}
            </div>
            {advisor.sebi_registration_number && (
              <p className="text-sm text-gray-500">
                SEBI Reg: {advisor.sebi_registration_number}
              </p>
            )}
            {advisor.bio && (
              <p className="text-sm text-gray-600 mt-2">{advisor.bio}</p>
            )}
          </div>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {badges.map((badge, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 text-yellow-800 text-xs font-semibold rounded-full flex items-center gap-1"
              >
                <Award size={12} />
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Performance Stats */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Activity size={20} />
          Performance (Last 90 Days)
        </h3>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Accuracy */}
          <div className={`p-4 rounded-xl border-2 ${getAccuracyBgColor(stats.accuracy)}`}>
            <div className="text-center">
              <div className={`text-3xl font-bold ${getAccuracyColor(stats.accuracy)}`}>
                {stats.accuracy}%
              </div>
              <div className="text-xs text-gray-600 mt-1 font-medium">Accuracy</div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.wins}W / {stats.losses}L
              </div>
            </div>
          </div>

          {/* Average Return */}
          <div className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {stats.avg_return > 0 ? '+' : ''}{stats.avg_return}%
              </div>
              <div className="text-xs text-gray-600 mt-1 font-medium">Avg Return</div>
              <div className="text-xs text-gray-500 mt-1">
                Per Trade
              </div>
            </div>
          </div>

          {/* Risk Profile */}
          <div className={`p-4 rounded-xl border-2 ${getRiskColor(stats.risk_profile)}`}>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {stats.risk_profile}
              </div>
              <div className="text-xs text-gray-600 mt-1 font-medium">Risk Level</div>
              <div className="text-xs text-gray-500 mt-1">
                Profile
              </div>
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
              <Target size={16} />
              <span className="font-medium">Total Signals</span>
            </div>
            <div className="text-xl font-bold text-gray-900">{stats.total_signals}</div>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
              <TrendingUp size={16} />
              <span className="font-medium">Best Return</span>
            </div>
            <div className="text-xl font-bold text-green-600">+{stats.best_return}%</div>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
              <Activity size={16} />
              <span className="font-medium">Avg Hold Time</span>
            </div>
            <div className="text-xl font-bold text-gray-900">{stats.avg_hold_time}</div>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
              <AlertTriangle size={16} />
              <span className="font-medium">Max Drawdown</span>
            </div>
            <div className="text-xl font-bold text-red-600">-{stats.max_drawdown}%</div>
          </div>
        </div>
      </div>

      {/* Specializations */}
      {advisor.specializations && advisor.specializations.length > 0 && (
        <div className="p-6 border-t border-gray-100">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Specializations</h4>
          <div className="flex flex-wrap gap-2">
            {advisor.specializations.map((spec, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
              >
                {spec}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="p-6 border-t border-gray-100 flex gap-3">
        <button className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
          Subscribe - ₹199/mo
        </button>
        <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
          View Audit Log
        </button>
      </div>
    </div>
  );
}
