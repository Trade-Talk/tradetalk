import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, MessageSquare, TrendingUp, Clock, Users, Share2, Bookmark } from 'lucide-react'
import toast from 'react-hot-toast'

// Mock debate data
const mockDebate = {
  id: 1,
  question: 'Will Nifty hit 27000 before a 10% correction?',
  description: 'With current market momentum and global cues, where do you think Nifty is headed in the next 2-3 months? Cast your vote and share your analysis!',
  createdBy: {
    id: 'user1',
    name: 'Rajesh Kumar',
    username: '@rajeshkumar',
    avatar: 'RK'
  },
  createdAt: '2024-02-01T10:00:00Z',
  endsAt: '2024-02-05T23:59:59Z',
  bullish: 1247,
  bearish: 892,
  totalVotes: 2139,
  participants: 156,
  trending: true,
  tags: ['#Nifty', '#MarketOutlook', '#TechnicalAnalysis']
}

// Mock comments/arguments
const mockArguments = [
  {
    id: 1,
    userId: 'u1',
    name: 'Priya Sharma',
    username: '@priyasharma',
    avatar: 'PS',
    stance: 'bullish',
    timestamp: '2h ago',
    content: 'Strong support at 25800. If we hold above, 27K is inevitable. Banking sector showing strength + FII inflows positive.',
    upvotes: 45,
    replies: 8
  },
  {
    id: 2,
    userId: 'u2',
    name: 'Amit Desai',
    username: '@amittrader',
    avatar: 'AD',
    stance: 'bearish',
    timestamp: '4h ago',
    content: 'Overvalued territory. RSI showing divergence on daily. Risk:reward not favorable. Better to book profits and wait.',
    upvotes: 38,
    replies: 12
  },
  {
    id: 3,
    userId: 'u3',
    name: 'Vikram Singh',
    username: '@vikramshorts',
    avatar: 'VS',
    stance: 'bearish',
    timestamp: '5h ago',
    content: 'Global markets showing weakness. Dollar index strengthening. FIIs might start selling. Correction overdue.',
    upvotes: 29,
    replies: 5
  },
  {
    id: 4,
    userId: 'u4',
    name: 'Neha Patel',
    username: '@nehalearns',
    avatar: 'NP',
    stance: 'bullish',
    timestamp: '6h ago',
    content: 'Learning TA and everything points to bullish continuation. Higher highs, higher lows pattern intact. Momentum strong!',
    upvotes: 21,
    replies: 3
  }
]

export default function DebatePage() {
  const { debateId } = useParams()
  const navigate = useNavigate()
  const [userVote, setUserVote] = useState(null)
  const [sortBy, setSortBy] = useState('top') // 'top', 'recent', 'bullish', 'bearish'
  const [argument, setArgument] = useState('')

  const debate = mockDebate

  const handleVote = (stance) => {
    if (userVote === stance) {
      setUserVote(null)
      toast.success('Vote removed')
    } else {
      setUserVote(stance)
      toast.success(`Voted ${stance === 'bullish' ? '👍' : '👎'}`)
    }
  }

  const handleSubmitArgument = () => {
    if (!argument.trim()) return
    if (!userVote) {
      toast.error('Please cast your vote first')
      return
    }
    toast.success('Argument posted!')
    setArgument('')
  }

  const bullishPercentage = (debate.bullish / debate.totalVotes) * 100
  const bearishPercentage = (debate.bearish / debate.totalVotes) * 100

  // Calculate time remaining
  const timeRemaining = () => {
    const now = new Date()
    const end = new Date(debate.endsAt)
    const diff = end - now
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    return `${days}d ${hours}h`
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header */}
      <header className="border-b border-gray-950 sticky top-0 z-10 backdrop-blur-xl bg-black/80">
        <div className="flex items-center justify-between px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <h1 className="text-sm font-light">Debate</h1>
          <div className="flex items-center gap-3">
            <button className="text-gray-400 hover:text-white transition-colors">
              <Share2 className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">
              <Bookmark className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {/* Debate Question */}
      <section className="border-b border-gray-950 px-6 py-6">
        <div className="flex items-start gap-3 mb-4">
          <Link to={`/profile/${debate.createdBy.id}`} className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center border border-gray-900">
              <span className="text-white font-light text-xs">{debate.createdBy.avatar}</span>
            </div>
          </Link>
          <div className="flex-1">
            <Link to={`/profile/${debate.createdBy.id}`} className="text-white text-sm font-light hover:underline">
              {debate.createdBy.name}
            </Link>
            <p className="text-gray-500 text-xs font-light">{debate.createdBy.username}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <Clock className="w-3 h-3" strokeWidth={1.5} />
              <span className="font-light">Ends in {timeRemaining()}</span>
            </div>
          </div>
        </div>

        <h2 className="text-white text-lg font-light mb-3 leading-relaxed">{debate.question}</h2>
        <p className="text-gray-400 text-sm font-light mb-4 leading-relaxed">{debate.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {debate.tags.map((tag) => (
            <Link
              key={tag}
              to={`/search?q=${encodeURIComponent(tag)}`}
              className="px-3 py-1 border border-gray-900 text-gray-400 text-xs font-light hover:text-white hover:border-gray-800 transition-all"
            >
              {tag}
            </Link>
          ))}
        </div>

        {/* Voting */}
        <div className="space-y-3">
          <button
            onClick={() => handleVote('bullish')}
            className={`w-full p-4 border rounded transition-all ${
              userVote === 'bullish'
                ? 'border-green-500 bg-green-500/10'
                : 'border-gray-900 hover:border-green-500/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-white text-sm font-light">👍 Bullish / Yes</span>
              <span className="text-green-500 text-sm font-light">{debate.bullish} votes</span>
            </div>
            <div className="bg-gray-900 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${bullishPercentage}%` }}
              ></div>
            </div>
            <div className="text-green-500 text-xs font-light mt-1">{bullishPercentage.toFixed(1)}%</div>
          </button>

          <button
            onClick={() => handleVote('bearish')}
            className={`w-full p-4 border rounded transition-all ${
              userVote === 'bearish'
                ? 'border-red-500 bg-red-500/10'
                : 'border-gray-900 hover:border-red-500/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-white text-sm font-light">👎 Bearish / No</span>
              <span className="text-red-500 text-sm font-light">{debate.bearish} votes</span>
            </div>
            <div className="bg-gray-900 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all duration-300"
                style={{ width: `${bearishPercentage}%` }}
              ></div>
            </div>
            <div className="text-red-500 text-xs font-light mt-1">{bearishPercentage.toFixed(1)}%</div>
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mt-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" strokeWidth={1.5} />
            <span className="font-light">{debate.participants} participants</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" strokeWidth={1.5} />
            <span className="font-light">{mockArguments.length} arguments</span>
          </div>
        </div>
      </section>

      {/* Add Argument */}
      {userVote && (
        <section className="border-b border-gray-950 px-6 py-4">
          <textarea
            value={argument}
            onChange={(e) => setArgument(e.target.value)}
            placeholder="Share your analysis and reasoning..."
            className="w-full bg-transparent border border-gray-900 rounded px-4 py-3 text-white placeholder-gray-600 text-sm font-light focus:border-white outline-none resize-none"
            rows={3}
          />
          <div className="flex items-center justify-between mt-3">
            <span className={`text-xs font-light ${userVote === 'bullish' ? 'text-green-500' : 'text-red-500'}`}>
              Posting as {userVote === 'bullish' ? '👍 Bullish' : '👎 Bearish'}
            </span>
            <button
              onClick={handleSubmitArgument}
              disabled={!argument.trim()}
              className="px-6 py-2 bg-white text-black text-sm font-medium hover:bg-gray-100 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Post
            </button>
          </div>
        </section>
      )}

      {/* Sort Options */}
      <section className="border-b border-gray-950 px-6 py-3">
        <div className="flex gap-4 overflow-x-auto hide-scrollbar">
          {['Top', 'Recent', 'Bullish', 'Bearish'].map((option) => (
            <button
              key={option}
              onClick={() => setSortBy(option.toLowerCase())}
              className={`text-sm font-light whitespace-nowrap pb-1 relative transition-colors ${
                sortBy === option.toLowerCase()
                  ? 'text-white'
                  : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              {option}
              {sortBy === option.toLowerCase() && (
                <div className="absolute bottom-0 left-0 right-0 h-px bg-white"></div>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Arguments */}
      <section className="divide-y divide-gray-950">
        {mockArguments.map((arg) => (
          <div key={arg.id} className="px-6 py-4 hover:bg-gray-950/50 transition-colors">
            <div className="flex items-start gap-3 mb-3">
              <Link to={`/profile/${arg.userId}`} className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center border border-gray-900">
                  <span className="text-white font-light text-xs">{arg.avatar}</span>
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Link to={`/profile/${arg.userId}`} className="text-white text-sm font-light hover:underline">
                    {arg.name}
                  </Link>
                  <span className={`text-xs ${arg.stance === 'bullish' ? 'text-green-500' : 'text-red-500'}`}>
                    {arg.stance === 'bullish' ? '👍' : '👎'}
                  </span>
                  <span className="text-gray-500 text-xs">•</span>
                  <span className="text-gray-500 text-xs font-light">{arg.timestamp}</span>
                </div>
                <p className="text-white text-sm font-light leading-relaxed mb-3">{arg.content}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <button className="flex items-center gap-1 hover:text-white transition-colors">
                    <TrendingUp className="w-3 h-3" strokeWidth={1.5} />
                    <span className="font-light">{arg.upvotes}</span>
                  </button>
                  <button className="flex items-center gap-1 hover:text-white transition-colors">
                    <MessageSquare className="w-3 h-3" strokeWidth={1.5} />
                    <span className="font-light">{arg.replies}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
