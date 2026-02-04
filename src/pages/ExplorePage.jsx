import { useState } from 'react'
import { Search, Users, MessageSquare, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

// Mock discussions with realistic content
const discussions = [
  {
    id: 1,
    title: 'How to invest from scratch as a beginner? Share your experience!',
    author: 'Priya Sharma',
    authorUsername: '@priyalearns',
    timeAgo: '2h',
    replies: 48,
    likes: 127,
    preview: 'Started with ₹10k in 2023. My biggest mistake was not researching enough before buying...',
    hot: true,
    category: 'Learning'
  },
  {
    id: 2,
    title: 'PSU stocks or private sector - which is better for long term?',
    author: 'Rajesh Kumar',
    authorUsername: '@rajeshvalue',
    timeAgo: '5h',
    replies: 89,
    likes: 234,
    preview: 'Been tracking both for 3 years now. Here are my observations on valuations, growth...',
    category: 'Discussion'
  },
  {
    id: 3,
    title: 'Weekly options strategy that actually works - my 6 month journey',
    author: 'Amit Trader',
    authorUsername: '@amitfotrader',
    timeAgo: '1d',
    replies: 156,
    likes: 445,
    preview: 'Lost money for 4 months straight until I figured out this risk management system...',
    hot: true,
    category: 'Strategy'
  },
  {
    id: 4,
    title: 'How do you deal with FOMO when stocks keep going up?',
    author: 'Neha Patel',
    authorUsername: '@nehalearning',
    timeAgo: '3h',
    replies: 67,
    likes: 189,
    preview: 'Missed Nifty rally from 21k to 27k because I kept waiting for correction. Now what?',
    category: 'Question'
  },
  {
    id: 5,
    title: 'Best resources to learn technical analysis from zero',
    author: 'Vikram Singh',
    authorUsername: '@vikramcharts',
    timeAgo: '6h',
    replies: 93,
    likes: 298,
    preview: 'Spent 1 year learning TA. Here are free resources that actually helped me...',
    category: 'Learning'
  },
  {
    id: 6,
    title: 'Mid-cap vs large-cap allocation - what works for you?',
    author: 'Kavita Reddy',
    authorUsername: '@kavitainvests',
    timeAgo: '8h',
    replies: 72,
    likes: 167,
    preview: '60-40 allocation strategy I follow and why it suits my risk profile...',
    category: 'Discussion'
  }
]

// Active debates
const activeDebates = [
  {
    id: 1,
    question: 'Will Nifty hit 27000 before a 10% correction?',
    bullish: 1247,
    bearish: 892,
    participants: 156,
    endsIn: '2d',
    hot: true
  },
  {
    id: 2,
    question: 'Are PSU banks better than private banks in 2024?',
    for: 678,
    against: 543,
    participants: 89,
    endsIn: '5d'
  },
  {
    id: 3,
    question: 'Will small caps outperform large caps this quarter?',
    bullish: 445,
    bearish: 567,
    participants: 67,
    endsIn: '3d'
  }
]

// Featured community members
const featuredUsers = [
  {
    id: 1,
    name: 'Rajesh Kumar',
    username: '@rajeshkumar',
    role: 'Value Investor',
    followers: 1234,
    verified: true,
    badge: '📈 Top Contributor',
    bio: 'Finding undervalued gems. 5+ years experience.'
  },
  {
    id: 2,
    name: 'Priya Sharma',
    username: '@priyasharma',
    role: 'Day Trader',
    followers: 892,
    verified: true,
    badge: '⚡ Quick Calls',
    bio: 'Scalping & intraday. Technical analysis expert.'
  },
  {
    id: 3,
    name: 'Amit Desai',
    username: '@amittrader',
    role: 'F&O Specialist',
    followers: 2156,
    verified: true,
    badge: '🎯 Options Pro',
    bio: 'Weekly options strategies. Risk management focus.'
  },
  {
    id: 4,
    name: 'Neha Patel',
    username: '@nehalearns',
    role: 'Student',
    followers: 234,
    badge: '📚 Learning',
    bio: 'MBA student sharing my market learning journey!'
  }
]

// Communities to join
const communities = [
  { id: 1, name: 'Options Gang', members: 15234, icon: '🎲', description: 'F&O traders & strategies' },
  { id: 2, name: 'Value Hunters', members: 8956, icon: '💎', description: 'Long-term value investing' },
  { id: 3, name: 'Day Traders Hub', members: 12456, icon: '⚡', description: 'Intraday & scalping' },
  { id: 4, name: 'Market Newbies', members: 23456, icon: '🌱', description: 'Learning together' },
  { id: 5, name: 'Swing Traders', members: 6789, icon: '📊', description: 'Multi-day positions' },
  { id: 6, name: 'Short Sellers', members: 4523, icon: '🐻', description: 'Bearish plays & analysis' }
]

const tabs = [
  { id: 'discussions', label: 'Discussions', icon: MessageSquare },
  { id: 'debates', label: 'Debates', icon: MessageSquare },
  { id: 'people', label: 'Find People', icon: Users },
  { id: 'communities', label: 'Communities', icon: Sparkles }
]

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('discussions')

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header with Search */}
      <header className="border-b border-gray-950 sticky top-0 z-10 backdrop-blur-xl bg-black/80">
        <div className="px-6 py-5">
          <h1 className="text-base font-light mb-4 tracking-tight">Explore</h1>
          
          <div className="relative">
            <Search className="absolute left-0 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Search discussions, people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-4 py-3 bg-transparent border-0 border-b border-gray-900 text-white placeholder-gray-600 focus:border-white outline-none transition-colors duration-200 text-sm font-light"
            />
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex gap-6 px-6 pb-4 overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 text-sm font-light whitespace-nowrap transition-colors duration-200 pb-1 relative ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-gray-600 hover:text-gray-400'
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={1.5} />
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-white"></div>
                )}
              </button>
            )
          })}
        </div>
      </header>

      {/* Discussions Tab */}
      {activeTab === 'discussions' && (
        <div className="px-6 py-6">
          <div className="mb-6">
            <h2 className="text-sm font-light text-gray-400 mb-2">Active Discussions</h2>
            <p className="text-xs text-gray-500 font-light">Join conversations and share your trading journey</p>
          </div>
          <div className="space-y-4">
            {discussions.map((discussion) => (
              <Link
                key={discussion.id}
                to={`/discussion/${discussion.id}`}
                className="block p-4 border border-gray-900 hover:border-gray-800 transition-all rounded"
              >
                <div className="mb-3">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-white text-sm font-light leading-relaxed flex-1">
                      {discussion.title}
                    </h3>
                    {discussion.hot && (
                      <span className="text-xs px-2 py-0.5 bg-orange-500/10 text-orange-500 border border-orange-500/20 flex-shrink-0 font-light">
                        HOT
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 font-light leading-relaxed line-clamp-2">
                    {discussion.preview}
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="font-light">{discussion.author}</span>
                    <span>·</span>
                    <span className="font-light">{discussion.timeAgo}</span>
                    <span className="px-2 py-0.5 bg-gray-900 text-gray-400 font-light">
                      {discussion.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="font-light">💬 {discussion.replies}</span>
                    <span className="font-light">❤️ {discussion.likes}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <Link
            to="/create-discussion"
            className="block mt-6 py-4 border border-gray-900 text-white text-sm font-medium text-center hover:bg-gray-950 hover:border-gray-800 transition-all duration-200 active:scale-[0.98] rounded"
          >
            Start a Discussion
          </Link>
        </div>
      )}

      {/* Debates Tab */}
      {activeTab === 'debates' && (
        <div className="px-6 py-6">
          <div className="mb-6">
            <h2 className="text-sm font-light text-gray-400 mb-2">Active Debates</h2>
            <p className="text-xs text-gray-500 font-light">Vote on trending market debates</p>
          </div>
          <div className="space-y-4">
            {activeDebates.map((debate) => (
              <Link
                key={debate.id}
                to={`/debate/${debate.id}`}
                className="block p-4 border border-gray-900 hover:border-gray-800 transition-all rounded"
              >
                <div className="mb-4">
                  <p className="text-white text-sm font-light leading-relaxed">{debate.question}</p>
                </div>
                
                {/* Vote bars */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-900 h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 transition-all duration-300"
                        style={{ width: `${((debate.bullish || debate.for) / ((debate.bullish || debate.for) + (debate.bearish || debate.against))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-green-500 text-xs font-light w-12 text-right">{debate.bullish || debate.for}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-900 h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500 transition-all duration-300"
                        style={{ width: `${((debate.bearish || debate.against) / ((debate.bullish || debate.for) + (debate.bearish || debate.against))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-red-500 text-xs font-light w-12 text-right">{debate.bearish || debate.against}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="font-light">{debate.participants} participating</span>
                  <span className="font-light">Ends in {debate.endsIn}</span>
                </div>
              </Link>
            ))}
          </div>
          
          <Link
            to="/create-debate"
            className="block mt-6 py-4 border border-gray-900 text-white text-sm font-medium text-center hover:bg-gray-950 hover:border-gray-800 transition-all duration-200 active:scale-[0.98] rounded"
          >
            Start a Debate
          </Link>
        </div>
      )}

      {/* People Tab */}
      {activeTab === 'people' && (
        <div className="px-6 py-6">
          <div className="mb-6">
            <h2 className="text-sm font-light text-gray-400 mb-2">Find People</h2>
            <p className="text-xs text-gray-500 font-light">Connect with traders, investors, and learners</p>
          </div>
          <div className="space-y-4">
            {featuredUsers.map((user) => (
              <Link
                key={user.id}
                to={`/profile/${user.id}`}
                className="block hover:bg-gray-950/50 transition-colors -mx-2 px-2 py-3 rounded"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center flex-shrink-0 border border-gray-900">
                    <span className="text-white font-light text-sm">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-light text-white text-sm">{user.name}</span>
                      {user.verified && <span className="text-white text-xs">✓</span>}
                    </div>
                    <p className="text-xs text-gray-500 font-light">{user.username} • {user.role}</p>
                    {user.badge && (
                      <span className="inline-block mt-1 text-xs text-gray-400 font-light">{user.badge}</span>
                    )}
                  </div>
                  <button className="px-3 py-1 border border-gray-900 text-gray-400 text-xs font-light hover:text-white hover:border-gray-800 transition-all flex-shrink-0">
                    Follow
                  </button>
                </div>
                <p className="text-xs text-gray-500 font-light leading-relaxed ml-15">{user.bio}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Communities Tab */}
      {activeTab === 'communities' && (
        <div className="px-6 py-6">
          <div className="mb-6">
            <h2 className="text-sm font-light text-gray-400 mb-2">Communities</h2>
            <p className="text-xs text-gray-500 font-light">Find your tribe based on trading style</p>
          </div>
          <div className="space-y-3">
            {communities.map((community) => (
              <Link
                key={community.id}
                to={`/community/${community.id}`}
                className="block p-4 border border-gray-900 hover:border-gray-800 transition-all rounded"
              >
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                    {community.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-white text-sm font-light">{community.name}</h3>
                      <button className="px-3 py-1 border border-gray-900 text-gray-400 text-xs font-light hover:text-white hover:border-gray-800 transition-all flex-shrink-0">
                        Join
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 font-light">{community.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="font-light">{community.members.toLocaleString()} members</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
