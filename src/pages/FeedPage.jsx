import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, Plus, Loader, RefreshCw } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/supabase'
import PostCard from '../components/posts/PostCard'
import toast from 'react-hot-toast'

export default function FeedPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      const { data, error } = await db.getPosts(20, 0)
      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error('Error loading posts:', error)
      toast.error('Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadPosts()
    setRefreshing(false)
    toast.success('Feed refreshed')
  }

  const handlePostDelete = (postId) => {
    setPosts(posts.filter(p => p.id !== postId))
  }

  if (loading) {
    return (
      <div className="h-screen bg-white flex flex-col safe-area-top overflow-hidden">
        <header className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">TradeTalk</h1>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Search className="w-5 h-5 text-gray-700" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full relative">
              <Bell className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <Loader className="w-8 h-8 text-primary-600 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-white flex flex-col safe-area-top overflow-hidden">
      {/* Header */}
      <header className="border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 bg-white z-10">
        <h1 className="text-xl font-bold text-gray-900">TradeTalk</h1>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 hover:bg-gray-100 rounded-full active:scale-95 transition-transform touch-manipulation disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-gray-700 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => navigate('/search')}
            className="p-2 hover:bg-gray-100 rounded-full active:scale-95 transition-transform touch-manipulation"
          >
            <Search className="w-5 h-5 text-gray-700" />
          </button>
          <button 
            onClick={() => navigate('/notifications')}
            className="p-2 hover:bg-gray-100 rounded-full relative active:scale-95 transition-transform touch-manipulation"
          >
            <Bell className="w-5 h-5 text-gray-700" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </header>

      {/* Feed Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">📱</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to TradeTalk!</h3>
            <p className="text-gray-600 text-center mb-6">
              Start following advisors and investors to see their posts here
            </p>
            <button
              onClick={() => navigate('/explore')}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium active:scale-95 transition-transform touch-manipulation"
            >
              Explore Users
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {posts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post}
                onDelete={handlePostDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => navigate('/create-post')}
        className="fixed bottom-20 right-4 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 active:scale-95 transition-all flex items-center justify-center z-20 touch-manipulation"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  )
}
