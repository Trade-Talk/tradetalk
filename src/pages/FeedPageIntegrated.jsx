import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Search, Bell, TrendingUp, Loader, Plus } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/supabase'
import PostCard from '../components/posts/PostCard'
import SmartSignalCard from '../components/signals/SmartSignalCard'
import toast from 'react-hot-toast'

export default function FeedPageIntegrated() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [allPosts, setAllPosts] = useState([])
  const [allSignals, setAllSignals] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let mounted = true
    const abortController = new AbortController()
    
    const loadFeed = async () => {
      try {
        setLoading(true)
        
        const [postsResult, signalsResult] = await Promise.all([
          db.getPosts(20, 0),
          db.getSignals(20, 0)
        ])

        console.log('📥 Posts fetched:', postsResult.data?.length || 0, 'posts')
        console.log('📥 Signals fetched:', signalsResult.data?.length || 0, 'signals')
        if (postsResult.data && postsResult.data.length > 0) {
          console.log('📝 First post:', postsResult.data[0])
        }

        // Check if component is still mounted
        if (!mounted) return

        if (postsResult.error) {
          // Silently ignore abort errors
          if (postsResult.error.message?.includes('AbortError') || postsResult.error.code === 'ABORTED') {
            return
          }
          console.error('Posts error:', postsResult.error)
        } else {
          setAllPosts(postsResult.data || [])
        }

        if (signalsResult.error) {
          // Silently ignore abort errors
          if (signalsResult.error.message?.includes('AbortError') || signalsResult.error.code === 'ABORTED') {
            return
          }
          console.error('Signals error:', signalsResult.error)
          if (signalsResult.error.code !== '42P01') {
            toast.error('Failed to load signals')
          }
        } else {
          setAllSignals(signalsResult.data || [])
        }

      } catch (error) {
        // Silently ignore abort errors
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

  // Refresh feed when returning from create post
  useEffect(() => {
    if (location.state?.refresh) {
      setRefreshKey(prev => prev + 1)
      // Clear the state so it doesn't refresh again on next navigation
      window.history.replaceState({}, document.title)
    }
  }, [location])

  const feedItems = useMemo(() => {
    let items = []

    if (filter === 'all' || filter === 'posts') {
      items = [...items, ...allPosts.map(p => ({ ...p, type: 'post' }))]
    }

    if (filter === 'all' || filter === 'signals') {
      items = [...items, ...allSignals.map(s => ({ ...s, type: 'signal' }))]
    }

    items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    
    return items
  }, [allPosts, allSignals, filter])

  const handlePostDelete = (postId) => {
    setAllPosts(allPosts.filter(p => p.id !== postId))
  }

  const handleSignalDelete = (signalId) => {
    setAllSignals(allSignals.filter(s => s.id !== signalId))
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
      {/* Premium Header - Minimal, breathing room */}
      <header className="border-b border-gray-950 px-6 py-5 flex items-center justify-between backdrop-blur-xl bg-black/80 sticky top-0 z-10">
        <h1 className="text-base font-light tracking-tight">TradeTalk</h1>
        <div className="flex items-center gap-5">
          <button 
            onClick={() => navigate('/search')}
            className="text-gray-600 hover:text-white transition-colors duration-200"
          >
            <Search className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <button 
            onClick={() => navigate('/notifications')}
            className="text-gray-600 hover:text-white transition-colors duration-200 relative"
          >
            <Bell className="w-5 h-5" strokeWidth={1.5} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-white rounded-full"></span>
          </button>
        </div>
      </header>

      {/* Minimal Filter - Clear selection state */}
      <div className="border-b border-gray-950 px-6 py-4 flex gap-8">
        <button
          onClick={() => setFilter('all')}
          className={`text-sm font-light transition-colors duration-200 relative pb-1 ${
            filter === 'all' ? 'text-white' : 'text-gray-600 hover:text-gray-400'
          }`}
        >
          All
          {filter === 'all' && (
            <div className="absolute bottom-0 left-0 right-0 h-px bg-white"></div>
          )}
        </button>
        <button
          onClick={() => setFilter('signals')}
          className={`text-sm font-light transition-colors duration-200 relative pb-1 ${
            filter === 'signals' ? 'text-white' : 'text-gray-600 hover:text-gray-400'
          }`}
        >
          Signals
          {filter === 'signals' && (
            <div className="absolute bottom-0 left-0 right-0 h-px bg-white"></div>
          )}
        </button>
        <button
          onClick={() => setFilter('posts')}
          className={`text-sm font-light transition-colors duration-200 relative pb-1 ${
            filter === 'posts' ? 'text-white' : 'text-gray-600 hover:text-gray-400'
          }`}
        >
          Posts
          {filter === 'posts' && (
            <div className="absolute bottom-0 left-0 right-0 h-px bg-white"></div>
          )}
        </button>
      </div>

      {/* Feed - Premium spacing */}
      <div className="flex-1 overflow-y-auto pb-20">
        {feedItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center px-6 text-center">
            <TrendingUp className="w-12 h-12 text-gray-900 mb-6" strokeWidth={1} />
            <h3 className="text-xl font-light mb-3 tracking-tight">Your feed is empty</h3>
            <p className="text-sm text-gray-600 max-w-xs font-light leading-relaxed mb-8">
              Follow verified advisors to see timestamped signals and track records
            </p>
            <button
              onClick={() => navigate('/explore')}
              className="bg-white text-black px-8 py-3 text-sm font-medium hover:bg-gray-100 transition-colors duration-200"
            >
              Explore Advisors
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-950">
            {feedItems.map((item) => (
              <div 
                key={`${item.type}-${item.id}`} 
                className="px-6 py-6 hover:bg-gray-950/50 transition-colors duration-200"
              >
                {item.type === 'post' ? (
                  <PostCard 
                    post={item} 
                    onDelete={handlePostDelete}
                  />
                ) : (
                  <SmartSignalCard 
                    signal={item} 
                    onDelete={handleSignalDelete}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button - Only for Advisors */}
      {user?.user_type === 'advisor' && (
        <button
          onClick={() => navigate('/create-signal')}
          className="fixed bottom-20 right-6 w-14 h-14 bg-white text-black rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center z-20"
          aria-label="Post Signal"
        >
          <Plus className="w-6 h-6" strokeWidth={2} />
        </button>
      )}
    </div>
  )
}
