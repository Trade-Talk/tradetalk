import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, Plus, Loader, RefreshCw, TrendingUp } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/supabase-mvp'
import PostCard from '../components/posts/PostCard'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '📊' },
  { id: 'DD', label: 'DD', emoji: '📈' },
  { id: 'Discussion', label: 'Discussion', emoji: '💬' },
  { id: 'Meme', label: 'Meme', emoji: '😂' },
  { id: 'News', label: 'News', emoji: '📰' },
  { id: 'Gain', label: 'Gain', emoji: '🚀' },
  { id: 'Loss', label: 'Loss', emoji: '📉' },
  { id: 'Question', label: 'Question', emoji: '❓' }
]

export default function FeedPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    loadPosts()
  }, [selectedCategory])

  const loadPosts = async () => {
    try {
      const category = selectedCategory === 'all' ? null : selectedCategory
      const { data, error } = await db.getPosts(20, 0, category)
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

  const handlePostUpdate = (updatedPost) => {
    setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
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
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900">TradeTalk</h1>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 hover:bg-gray-100 rounded-full transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-gray-700 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => navigate('/search')}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <Search className="w-5 h-5 text-gray-700" />
          </button>
          <button 
            onClick={() => navigate('/notifications')}
            className="p-2 hover:bg-gray-100 rounded-full relative"
          >
            <Bell className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </header>

      {/* Category Filter */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 overflow-x-auto scrollbar-hide">
        <div className="flex space-x-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
                ${selectedCategory === cat.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              <span className="mr-1.5">{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feed Content */}
      <div className="max-w-2xl mx-auto">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {selectedCategory === 'all' ? 'No posts yet' : `No ${selectedCategory} posts yet`}
            </h3>
            <p className="text-gray-600 text-center mb-6">
              {selectedCategory === 'all' 
                ? 'Be the first to share your market insights!' 
                : `Be the first to post in ${selectedCategory}!`
              }
            </p>
            <button
              onClick={() => navigate('/create-post')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Post
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={handlePostDelete}
                onUpdate={handlePostUpdate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => navigate('/create-post')}
        className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center z-20"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  )
}
