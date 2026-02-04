import { useState } from 'react';
import { Trophy, TrendingUp, Users, Clock, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TradingContestCard({ contest }) {
  const navigate = useNavigate();
  const [isJoining, setIsJoining] = useState(false);

  const timeLeft = getTimeLeft(contest.ends_at);
  const progress = (contest.participants_count / contest.max_participants) * 100;

  const handleJoin = async (e) => {
    e.stopPropagation();
    setIsJoining(true);
    // TODO: API call to join contest
    setTimeout(() => {
      setIsJoining(false);
      navigate(`/contest/${contest.id}`);
    }, 500);
  };

  return (
    <div 
      onClick={() => navigate(`/contest/${contest.id}`)}
      className="bg-gradient-to-br from-purple-950 to-black border border-purple-900 rounded-lg p-5 hover:border-purple-700 transition-all cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Trophy size={24} className="text-white" strokeWidth={2} />
          </div>
          <div>
            <h3 className="font-medium text-white text-lg">{contest.title}</h3>
            <p className="text-xs text-gray-400">{contest.type}</p>
          </div>
        </div>
        {contest.is_live && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/20 border border-red-500 rounded">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-red-400 font-medium">LIVE</span>
          </div>
        )}
      </div>

      {/* Prize Pool */}
      <div className="mb-4 p-3 bg-black/40 border border-purple-900/50 rounded-lg">
        <div className="text-xs text-purple-400 mb-1">Prize Pool</div>
        <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
          ₹{contest.prize_pool.toLocaleString()}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Winner takes ₹{(contest.prize_pool * 0.5).toLocaleString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
            <Users size={12} strokeWidth={1.5} />
            <span>Joined</span>
          </div>
          <div className="text-white font-light">{contest.participants_count}</div>
        </div>
        <div>
          <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
            <Target size={12} strokeWidth={1.5} />
            <span>Picks</span>
          </div>
          <div className="text-white font-light">{contest.picks_required}</div>
        </div>
        <div>
          <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
            <Clock size={12} strokeWidth={1.5} />
            <span>Ends in</span>
          </div>
          <div className="text-white font-light">{timeLeft}</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>{contest.participants_count} joined</span>
          <span>{contest.max_participants} max</span>
        </div>
        <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Leaderboard Preview */}
      {contest.top_performers && contest.top_performers.length > 0 && (
        <div className="mb-4 pb-4 border-b border-purple-900">
          <div className="text-xs text-gray-500 mb-2">Top Performers</div>
          <div className="space-y-2">
            {contest.top_performers.slice(0, 3).map((performer, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-4">#{idx + 1}</span>
                  <span className="text-sm text-white truncate">{performer.name}</span>
                </div>
                <span className={`text-sm font-medium ${
                  performer.returns >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {performer.returns >= 0 ? '+' : ''}{performer.returns}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Button */}
      {contest.has_joined ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/contest/${contest.id}`);
          }}
          className="w-full py-3 bg-purple-900/40 text-purple-300 rounded-lg font-medium hover:bg-purple-900/60 transition-colors flex items-center justify-center gap-2"
        >
          <TrendingUp size={16} strokeWidth={2} />
          View Your Picks
        </button>
      ) : contest.is_full ? (
        <button
          disabled
          className="w-full py-3 bg-gray-900 text-gray-600 rounded-lg font-medium cursor-not-allowed"
        >
          Contest Full
        </button>
      ) : (
        <button
          onClick={handleJoin}
          disabled={isJoining}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all active:scale-95 disabled:opacity-50"
        >
          {isJoining ? 'Joining...' : `Join Contest ${contest.entry_fee > 0 ? `• ₹${contest.entry_fee}` : '• Free'}`}
        </button>
      )}

      {/* Contest Rules Preview */}
      <div className="mt-3 text-xs text-gray-500 text-center">
        {contest.rules_preview || 'Pick 5 stocks, track for 1 week, highest returns win'}
      </div>
    </div>
  );
}

function getTimeLeft(endDate) {
  const now = new Date();
  const end = new Date(endDate);
  const diff = end - now;

  if (diff < 0) return 'Ended';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h`;
  
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${minutes}m`;
}
