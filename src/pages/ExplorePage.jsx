import { useState } from 'react'
import { Search, TrendingUp, Filter } from 'lucide-react'
import AdvisorCard from '../components/AdvisorCard'

const mockAdvisors = [
  {
    id: 'adv1',
    name: 'Rajesh Kumar',
    username: '@rajeshkumar',
    specialty: 'Value Investing',
    isVerified: true,
    followers: 1234,
    cagr3y: 24.5,
    winRate: 78,
    bio: 'Finding undervalued gems with strong fundamentals',
    pricing: { free: true, premium: 1999 }
  },
  {
    id: 'adv2',
    name: 'Priya Sharma',
    username: '@priyasharma',
    specialty: 'Growth Stocks',
    isVerified: true,
    followers: 892,
    cagr3y: 31.2,
    winRate: 72,
    bio: 'Tech-focused growth investing for the future',
    pricing: { free: true, premium: 2499 }
  },
  {
    id: 'adv3',
    name: 'Amit Desai',
    username: '@amittrader',
    specialty: 'Options Trading',
    isVerified: true,
    followers: 2156,
    cagr3y: 28.7,
    winRate: 65,
    bio: 'F&O specialist with risk management focus',
    pricing: { free: false, premium: 3499 }
  }
]

const categories = [
  'All',
  'Value Investing',
  'Growth Stocks',
  'Options Trading',
  'Dividend Investing',
  'Technical Analysis'
]

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Premium Header */}
      <header className="border-b border-gray-950 sticky top-0 z-10 backdrop-blur-xl bg-black/80">
        <div className="px-6 py-5">
          <h1 className="text-base font-light mb-4 tracking-tight">Explore</h1>
          
          {/* Minimal Search Bar */}
          <div className="relative">
            <Search className="absolute left-0 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Search advisors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-4 py-3 bg-transparent border-0 border-b border-gray-900 text-white placeholder-gray-600 focus:border-white outline-none transition-colors duration-200 text-sm font-light"
            />
          </div>
        </div>
        
        {/* Minimal Category Pills */}
        <div className="flex gap-6 px-6 pb-4 overflow-x-auto hide-scrollbar">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`text-sm font-light whitespace-nowrap transition-colors duration-200 pb-1 relative ${
                selectedCategory === category
                  ? 'text-white'
                  : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              {category}
              {selectedCategory === category && (
                <div className="absolute bottom-0 left-0 right-0 h-px bg-white"></div>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Trending Section - Minimal */}
      <section className="border-b border-gray-950 px-6 py-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-white" strokeWidth={1.5} />
          <h2 className="text-sm font-light">Trending</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {['#NiftyOptions', '#TechStocks', '#BankingRally', '#MarketAnalysis'].map((tag) => (
            <button
              key={tag}
              className="px-4 py-2 border border-gray-900 text-gray-400 text-sm font-light hover:text-white hover:border-gray-800 transition-all duration-200"
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* Top Advisors - Clean cards */}
      <section className="py-6">
        <div className="px-6 pb-4">
          <h2 className="text-sm font-light text-gray-400">Top Advisors</h2>
        </div>
        <div className="divide-y divide-gray-950">
          {mockAdvisors.map((advisor) => (
            <div key={advisor.id} className="px-6 py-6 hover:bg-gray-950/50 transition-colors duration-200">
              <AdvisorCard advisor={advisor} />
            </div>
          ))}
        </div>
      </section>

      {/* Load More - Minimal */}
      <div className="px-6 py-4">
        <button className="w-full py-4 border border-gray-900 text-white text-sm font-medium hover:bg-gray-950 hover:border-gray-800 transition-all duration-200 active:scale-[0.98]">
          Load More
        </button>
      </div>
    </div>
  )
}
