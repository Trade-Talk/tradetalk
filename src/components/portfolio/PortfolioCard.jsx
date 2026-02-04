import { TrendingUp, TrendingDown, Eye, PieChart, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PortfolioCard({ portfolio, author, isOwnPortfolio = false }) {
  const navigate = useNavigate();
  
  const totalGain = (portfolio.current_value || 0) - (portfolio.invested_value || 0);
  const gainPercent = portfolio.invested_value 
    ? ((totalGain / portfolio.invested_value) * 100).toFixed(2) 
    : 0;
  const isPositive = totalGain >= 0;

  return (
    <div className="bg-gradient-to-br from-gray-950 to-black border border-gray-900 rounded-lg p-5 hover:border-gray-800 transition-colors">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center flex-shrink-0">
          <PieChart size={20} className="text-white" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm text-white font-medium truncate">
            {isOwnPortfolio ? 'My Portfolio' : `${author?.full_name || 'User'}'s Portfolio`}
          </div>
          <div className="text-xs text-gray-500">
            {portfolio.holdings_count || 0} holdings • Updated {portfolio.last_updated || 'recently'}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <div className="text-xs text-gray-500 mb-1">Invested</div>
          <div className="text-white font-light">
            ₹{((portfolio.invested_value || 0) / 1000).toFixed(1)}K
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Current</div>
          <div className="text-white font-light">
            ₹{((portfolio.current_value || 0) / 1000).toFixed(1)}K
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Returns</div>
          <div className={`font-medium flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? <TrendingUp size={14} strokeWidth={1.5} /> : <TrendingDown size={14} strokeWidth={1.5} />}
            {isPositive ? '+' : ''}{gainPercent}%
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              isPositive ? 'bg-green-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(Math.abs(parseFloat(gainPercent)), 100)}%` }}
          />
        </div>
      </div>

      {/* Top Holdings */}
      {portfolio.top_holdings && portfolio.top_holdings.length > 0 && (
        <div className="space-y-2 mb-4 pb-4 border-b border-gray-900">
          <div className="text-xs text-gray-500 mb-2">Top Holdings</div>
          {portfolio.top_holdings.slice(0, 3).map((holding, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-gray-400 truncate">{holding.symbol}</span>
                <span className="text-xs text-gray-600">
                  {holding.quantity || 0} shares
                </span>
              </div>
              <span className={`font-light ${holding.gain_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {holding.gain_percent >= 0 ? '+' : ''}{holding.gain_percent?.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            navigate(isOwnPortfolio ? '/portfolio' : `/profile/${author?.id}?tab=portfolio`);
          }}
          className="flex-1 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm transition-colors flex items-center justify-center gap-2 active:scale-95"
        >
          <Eye size={14} strokeWidth={1.5} />
          View Full Portfolio
        </button>
        {isOwnPortfolio && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              navigate('/portfolio/analytics');
            }}
            className="px-3 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm transition-colors active:scale-95"
          >
            <BarChart3 size={14} strokeWidth={1.5} />
          </button>
        )}
      </div>
    </div>
  );
}
