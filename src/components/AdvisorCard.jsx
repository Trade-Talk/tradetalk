import { Link } from 'react-router-dom'
import { Shield, TrendingUp, Users, ChevronRight } from 'lucide-react'

export default function AdvisorCard({ advisor, compact = false }) {
  if (compact) {
    return (
      <Link
        to={`/advisor/${advisor.id}`}
        className="flex items-center gap-3 hover:bg-gray-950/50 transition-colors duration-200"
      >
        <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center flex-shrink-0 border border-gray-900">
          <span className="text-white font-light text-sm">
            {advisor.name.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-light text-white text-sm truncate">
              {advisor.name}
            </span>
            {advisor.isVerified && (
              <span className="text-white text-xs">✓</span>
            )}
          </div>
          <p className="text-xs text-gray-500 truncate font-light">{advisor.specialty}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" strokeWidth={1.5} />
      </Link>
    )
  }

  return (
    <Link
      to={`/advisor/${advisor.id}`}
      className="block"
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center flex-shrink-0 border border-gray-900">
          <span className="text-white font-light text-xl">
            {advisor.name.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-light text-white text-base truncate">
              {advisor.name}
            </span>
            {advisor.isVerified && (
              <span className="text-white text-sm">✓</span>
            )}
          </div>
          <p className="text-sm text-gray-400 mb-2 font-light">{advisor.specialty}</p>
          <p className="text-xs text-gray-500 line-clamp-2 font-light leading-relaxed">{advisor.bio}</p>
        </div>
      </div>

      {/* Stats - Using semantic colors for financial data */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <div className="text-sm font-medium text-green-500">+{advisor.cagr3y}%</div>
          <div className="text-xs text-gray-500 font-light">3Y CAGR</div>
        </div>
        <div>
          <div className="text-sm font-light text-white">{advisor.winRate}%</div>
          <div className="text-xs text-gray-500 font-light">Win Rate</div>
        </div>
        <div>
          <div className="text-sm font-light text-white">{advisor.followers}</div>
          <div className="text-xs text-gray-500 font-light">Followers</div>
        </div>
      </div>

      {/* Pricing */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm">
          {advisor.pricing.free && (
            <span className="px-3 py-1 border border-gray-900 text-gray-400 text-xs font-light">
              Free Channel
            </span>
          )}
          <span className="font-light text-white">
            ₹{advisor.pricing.premium}/mo
          </span>
        </div>
        <button className="px-6 py-2 bg-white text-black text-sm font-medium hover:bg-gray-100 transition-all duration-200 active:scale-[0.98]">
          Follow
        </button>
      </div>
    </Link>
  )
}
