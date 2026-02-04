import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { db, timeAgo } from '../../lib/supabase-mvp'
import toast from 'react-hot-toast'

const CATEGORY_STYLES = {
  DD: 'bg-blue-100 text-blue-700 border-blue-200',
  Discussion: 'bg-gray-100 text-gray-700 border-gray-200',
  Meme: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  News: 'bg-purple-100 text-purple-700 border-purple-200',
  Gain: 'bg-green-100 text-green-700 border-green-200',
  Loss: 'bg-red-100 text-red-700 border-red-200',
  Question: 'bg-orange-100 text-orange-700 border-orange-200'
}

const CATEGORY_EMOJIS = {
  DD: '📈',
  Discussion: '💬',
  Meme: '😂',
  News: '📰',
  Gain: '🚀',
  Loss: '📉',
  Question: '❓'
}

export default function PostCardMVP({ post, onDelete, onUpdate }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.like_count || 0)
  const [showMenu, setShowMenu] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const isOwnPost = user?.id === post.author_id
  const stockSymbols = post.stock_symbols || []

  useEffect(() => {
    checkIfLiked()
  }, [post.id, user])

  const checkIfLiked = async () => {
    if (!user) return
    const isLiked = await db.checkIfLiked(user.id, post.id)
    setLiked(isLiked)
  }

  const handleLike = async (e) => {
    e.stopPropagation()
    if (!user) {
      toast.error('Please sign in to like posts')
      return
    }

    const newLiked = !liked
    setLiked(newLiked)
    setLikesCount(newLiked ? likesCount + 1 : likesCount - 1)

    try {
      if (newLiked) {
        await db.likePost(user.id, post.id)
      } else {
        await db.unlikePost(user.id, post.id)
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      setLiked(!newLiked)
      setLikesCount(newLiked ? likesCount - 1 : likesCount + 1)
      toast.error('Failed to update like')
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return

    setDeleting(true)
    try {
      const { error } = await db.deletePost(post.id)
      if (error) throw error

      toast.success('Post deleted')
      onDelete?.(post.id)
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error('Failed to delete post')
      setDeleting(false)
    }
  }

  const handleShare = (e) => {
    e.stopPropagation()
    const url = `${window.location.origin}/post/${post.id}`
    navigator.clipboard.writeText(url)
    toast.success('Link copied to clipboard!')
  }

  return (
    <div 
      onClick={() => navigate(`/post/${post.id}`)}
      className="bg-white p-4 hover:bg-gray-50 cursor-pointer transition-colors"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          {/* Avatar */}
          <div 
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/profile/${post.username}`)
            }}
            className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer hover:opacity-90"
          >
            {post.avatar_url ? (
              <img src={post.avatar_url} alt={post.username} className="w-full h-full rounded-full object-cover" />
            ) : (
              post.username?.[0]?.toUpperCase() || 'U'
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span 
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/profile/${post.username}`)
                }}
                className="font-semibold text-gray-900 hover:underline cursor-pointer"
              >
                {post.username || 'User'}
              </span>
              {post.current_streak > 0 && (
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                  🔥 {post.current_streak}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{timeAgo(post.created_at)}</span>
              {post.category && (
                <>
                  <span>•</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium border ${CATEGORY_STYLES[post.category] || CATEGORY_STYLES.Discussion}`}>
                    {CATEGORY_EMOJIS[post.category]} {post.category}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Menu */}
        {isOwnPost && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowMenu(!showMenu)
              }}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <MoreHorizontal className="w-5 h-5 text-gray-600" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete()
                  }}
                  disabled={deleting}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {deleting ? 'Deleting...' : 'Delete Post'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mb-3">
        <p className="text-gray-900 whitespace-pre-wrap break-words">
          {post.content}
        </p>
      </div>

      {/* Stock Symbols */}
      {stockSymbols.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {stockSymbols.map(symbol => (
            <span 
              key={symbol}
              onClick={(e) => e.stopPropagation()}
              className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg font-mono text-sm font-medium hover:bg-blue-100 transition-colors cursor-pointer"
            >
              ${symbol}
            </span>
          ))}
        </div>
      )}

      {/* Image */}
      {post.image_url && (
        <div className="mb-3 rounded-lg overflow-hidden border border-gray-200">
          <img
            src={post.image_url}
            alt="Post content"
            className="w-full h-auto"
            loading="lazy"
          />
        </div>
      )}

      {/* Engagement Bar */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-4">
          {/* Like */}
          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 group"
          >
            <Heart 
              className={`w-5 h-5 transition-colors ${
                liked 
                  ? 'fill-red-500 text-red-500' 
                  : 'text-gray-600 group-hover:text-red-500'
              }`}
            />
            <span className={`text-sm ${liked ? 'text-red-500 font-medium' : 'text-gray-600'}`}>
              {likesCount}
            </span>
          </button>

          {/* Comment */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/post/${post.id}`)
            }}
            className="flex items-center gap-1.5 group"
          >
            <MessageCircle className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
            <span className="text-sm text-gray-600">
              {post.comment_count || 0}
            </span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 group"
          >
            <Share2 className="w-5 h-5 text-gray-600 group-hover:text-green-600" />
          </button>
        </div>
      </div>
    </div>
  )
}
