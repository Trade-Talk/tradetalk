import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  Search, Bell, TrendingUp, Loader, Plus, X, UserPlus
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/supabase'
import PostCard from '../components/posts/PostCard'
import toast from 'react-hot-toast'

export default function FeedPageIntegrated() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [allPosts, setAllPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])

  // Mock stock database for search
  const stockDatabase = [
    { symbol: 'RELIANCE', name: 'Reliance Industries', price: '2,450.30' },
    { symbol: 'TCS', name: 'Tata Consultancy Services', price: '3,620.50' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank', price: '1,520.80' },
    { symbol: 'INFY', name: 'Infosys', price: '1,440.20' },
    { symbol: 'ICICIBANK', name: 'ICICI Bank', price: '980.60' },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel', price: '1,180.40' },
    { symbol: 'ITC', name: 'ITC Ltd', price: '440.80' },
    { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', price: '1,750.30' },
    { symbol: 'LT', name: 'Larsen & Toubro', price: '3,420.60' },
    { symbol: 'AXISBANK', name: 'Axis Bank', price: '1,080.90' }
  ]

  useEffect(() => {
    let mounted = true
    const abortController = new AbortController()
    
    const loadFeed = async () => {
      try {
        setLoading(true)
        const postsResult = await db.getPosts(20, 0)
        if (!mounted) return

        if (postsResult.error) {
          if (postsResult.error.message?.includes('AbortError') || postsResult.error.code === 'ABORTED') {
            return
          }
          console.error('Posts error:', postsResult.error)
          toast.error('Failed to load posts')
        } else {
          setAllPosts(postsResult.data || [])
        }
      } catch (error) {
        if (error.message?.includes('AbortError') || error.name === 'AbortError') {
          return
        }
        if (mounted) {
          console.error('Error loading feed:', error)
          toast.error('Failed to load feed')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadFeed()
    return () => {
      mounted = false
      abortController.abort()
    }
  }, [refreshKey])

  useEffect(() => {
    if (location.state?.refresh) {
      setRefreshKey(prev => prev + 1)
      window.history.replaceState({}, document.title)
    }
  }, [location])

  // Search stocks
  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toUpperCase()
      const results = stockDatabase.filter(stock => 
        stock.symbol.includes(query) || 
        stock.name.toUpperCase().includes(query)
      ).slice(0, 5)
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  const handlePostDelete = (postId) => {
    setAllPosts(allPosts.filter(p => p.id !== postId))
  }

  const handleStockClick = (symbol) => {
    setShowSearch(false)
    setSearchQuery('')
    navigate(`/stock/${symbol}`)
  }

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-6 h-6 text-white animate-spin" strokeWidth={1.5} />
          <p className="text-xs text-gray-600">Loading feed...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-gray-900 px-6 py-4 flex items-center justify-between backdrop-blur-xl bg-black/95 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold tracking-tight">TradeTalk</h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/add-friends')}
            className="text-gray-500 hover:text-white transition-colors"
            title="Find Friends"
          >
            <UserPlus className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <button 
            onClick={() => setShowSearch(true)}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <Search className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <button 
            onClick={() => navigate('/notifications')}
            className="text-gray-500 hover:text-white transition-colors relative"
          >
            <Bell className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* Ticker Search Modal */}
      {showSearch && (
        <div className="absolute inset-0 bg-black/95 backdrop-blur-xl z-50 flex flex-col">
          <div className="border-b border-gray-900 px-6 py-4 flex items-center gap-3">
            <Search className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stocks... (e.g., RELIANCE, TCS)"
              className="flex-1 bg-transparent text-white placeholder-gray-600 outline-none text-sm"
              autoFocus
            />
            <button 
              onClick={() => {
                setShowSearch(false)
                setSearchQuery('')
              }}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {searchResults.length > 0 ? (
              <div className="divide-y divide-gray-900">
                {searchResults.map((stock) => (
                  <button
                    key={stock.symbol}
                    onClick={() => handleStockClick(stock.symbol)}
                    className="w-full px-6 py-4 hover:bg-gray-950 transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">{stock.symbol}</p>
                        <p className="text-xs text-gray-500">{stock.name}</p>
                      </div>
                      <p className="text-sm text-gray-400">₹{stock.price}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : searchQuery.trim() ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <Search className="w-12 h-12 text-gray-800 mb-4" strokeWidth={1} />
                <p className="text-sm text-gray-500">No stocks found for "{searchQuery}"</p>
              </div>
            ) : (
              <div className="px-6 py-8">
                <p className="text-xs text-gray-600 mb-4">Popular Stocks</p>
                <div className="grid grid-cols-2 gap-2">
                  {stockDatabase.slice(0, 6).map((stock) => (
                    <button
                      key={stock.symbol}
                      onClick={() => handleStockClick(stock.symbol)}
                      className="px-3 py-2 bg-gray-950 border border-gray-900 rounded-lg hover:bg-gray-900 transition-colors text-left"
                    >
                      <p className="text-xs font-semibold">{stock.symbol}</p>
                      <p className="text-[10px] text-gray-500 truncate">{stock.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Feed */}
      <div className="flex-1 overflow-y-auto pb-20">
        {allPosts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center px-6 text-center">
            <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mb-5">
              <TrendingUp className="w-8 h-8 text-gray-600" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-semibold mb-2 tracking-tight">
              No posts yet
            </h3>
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed mb-8">
              Be the first to share insights with the community
            </p>
            <button
              onClick={() => navigate('/create-post')}
              className="bg-white text-black px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors"
            >
              Create Post
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-900">
            {allPosts.map((post) => (
              <div 
                key={post.id} 
                className="px-6 py-5 hover:bg-gray-950/30 transition-colors"
              >
                <PostCard 
                  post={post} 
                  onDelete={handlePostDelete}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/create-post')}
        className="fixed bottom-20 right-6 w-14 h-14 bg-white text-black rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center z-20"
        aria-label="Create Post"
      >
        <Plus className="w-6 h-6" strokeWidth={2.5} />
      </button>
    </div>
  )
}
