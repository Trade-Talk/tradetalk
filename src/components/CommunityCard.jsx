import { Link } from 'react-router-dom'
import { Users, TrendingUp } from 'lucide-react'

/**
 * CommunityCard Component
 * Displays community information with join functionality
 * 
 * @param {Object} community - Community data
 * @param {boolean} compact - Show compact version
 * @param {boolean} joined - Whether user has joined
 * @param {Function} onJoin - Callback when join button clicked
 */
export default function CommunityCard({ community, compact = false, joined = false, onJoin }) {
  if (compact) {
    return (
      <Link
        to={`/community/${community.id}`}
        className="flex items-center justify-between py-3 hover:bg-gray-950/50 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-xl flex-shrink-0">
            {community.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-light truncate">{community.name}</div>
            <div className="text-gray-500 text-xs font-light">{community.members.toLocaleString()} members</div>
          </div>
        </div>
        {!joined ? (
          <button
            onClick={(e) => {
              e.preventDefault()
              onJoin?.(community)
            }}
            className="px-3 py-1 border border-gray-900 text-gray-400 text-xs font-light hover:text-white hover:border-gray-800 transition-all flex-shrink-0"
          >
            Join
          </button>
        ) : (
          <span className="text-xs text-green-500 font-light flex-shrink-0">✓ Joined</span>
        )}
      </Link>
    )
  }

  return (
    <Link
      to={`/community/${community.id}`}
      className="block p-4 border border-gray-900 hover:border-gray-800 transition-all rounded"
    >
      <div className="flex items-start gap-3 mb-3">
        {/* Community Icon */}
        <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
          {community.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Community Name & Join Button */}
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white text-sm font-light">{community.name}</h3>
            {!joined ? (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  onJoin?.(community)
                }}
                className="px-4 py-1.5 border border-gray-900 text-gray-400 text-xs font-light hover:text-white hover:border-gray-800 transition-all flex-shrink-0"
              >
                Join
              </button>
            ) : (
              <span className="px-4 py-1.5 bg-gray-900 text-green-500 text-xs font-light flex-shrink-0 rounded">
                ✓ Joined
              </span>
            )}
          </div>
          
          {/* Description */}
          <p className="text-xs text-gray-500 font-light mb-3 leading-relaxed">
            {community.description}
          </p>
          
          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" strokeWidth={1.5} />
              <span className="font-light">{community.members.toLocaleString()} members</span>
            </div>
            {community.trending && (
              <div className="flex items-center gap-1 text-green-500">
                <TrendingUp className="w-3 h-3" strokeWidth={1.5} />
                <span className="font-light">Trending</span>
              </div>
            )}
            {community.postsToday && (
              <span className="font-light">{community.postsToday} posts today</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
