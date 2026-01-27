import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Trash2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../lib/supabase'
import StockTickerDisplay from '../StockTickerDisplay'
import toast from 'react-hot-toast'

export default function PostCard({ post, onDelete }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes_count || 0)
  const [showMenu, setShowMenu] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const isOwnPost = user?.id === post.author_id

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
      if (onDelete) onDelete(post.id)
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error('Failed to delete post')
    } finally {
      setDeleting(false)
      setShowMenu(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    if (days < 7) return `${days}d`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="cursor-pointer"
         onClick={() => navigate(`/post/${post.id}`)}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div 
            className="w-10 h-10 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center text-white font-light text-sm flex-shrink-0 cursor-pointer border border-gray-900"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/profile/${post.author?.id}`)
            }}
          >
            {post.author?.avatar_url ? (
              <img src={post.author.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              post.author?.full_name?.[0] || 'U'
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-light text-white truncate text-sm">
                {post.author?.full_name || 'Unknown'}
              </p>
              {post.author?.user_type === 'advisor' && post.author?.is_verified && (
                <span className="text-white flex-shrink-0 text-xs">✓</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 font-light">
              <span className="truncate">@{post.author?.username}</span>
              <span>·</span>
              <span className="flex-shrink-0">{formatDate(post.created_at)}</span>
            </div>
          </div>
        </div>

        {isOwnPost && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowMenu(!showMenu)
              }}
              className="p-2 hover:bg-gray-950 rounded-full transition-colors duration-200"
            >
              <MoreHorizontal className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
            </button>
            
            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMenu(false)
                  }}
                />
                <div className="absolute right-0 top-10 bg-gray-900 border border-gray-800 shadow-lg z-20 py-1 min-w-[150px]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete()
                    }}
                    disabled={deleting}
                    className="w-full px-4 py-2 text-left text-red-500 hover:bg-gray-950 flex items-center gap-2 disabled:opacity-50 text-sm font-light transition-colors duration-200"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    <span>{deleting ? 'Deleting...' : 'Delete post'}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {post.content && (
        <p className="text-white mb-3 whitespace-pre-wrap break-words font-light text-sm leading-relaxed">
          {post.content}
        </p>
      )}

      {/* Images */}
      {post.images && post.images.length > 0 && (
        <div className={`mb-3 ${
          post.images.length === 1 ? '' :
          post.images.length === 2 ? 'grid grid-cols-2 gap-2' :
          'grid grid-cols-2 gap-2'
        }`}>
          {post.images.slice(0, 4).map((image, index) => (
            <div 
              key={index}
              className={`relative ${
                post.images.length === 1 ? 'aspect-video' :
                post.images.length === 3 && index === 0 ? 'col-span-2 aspect-video' :
                'aspect-square'
              } overflow-hidden border border-gray-900`}
            >
              <img
                src={image}
                alt={`Post image ${index + 1}`}
                className="w-full h-full object-cover"
                onClick={(e) => e.stopPropagation()}
              />
              {post.images.length > 4 && index === 3 && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                  <span className="text-white text-2xl font-light">+{post.images.length - 4}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Stocks */}
      {post.stocks && post.stocks.length > 0 && (
        <div className="mb-3">
          <StockTickerDisplay stocks={post.stocks} />
        </div>
      )}

      {/* Actions - Using semantic colors only for like count */}
      <div className="flex items-center justify-between text-gray-500 pt-2">
        <button
          onClick={handleLike}
          className="flex items-center gap-2 hover:text-white transition-colors duration-200 active:scale-95"
        >
          <Heart className={`w-5 h-5 ${liked ? 'fill-red-500 text-red-500' : ''}`} strokeWidth={1.5} />
          <span className="text-sm font-light">{likesCount}</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/post/${post.id}`)
          }}
          className="flex items-center gap-2 hover:text-white transition-colors duration-200 active:scale-95"
        >
          <MessageCircle className="w-5 h-5" strokeWidth={1.5} />
          <span className="text-sm font-light">{post.comments_count || 0}</span>
        </button>

        <button
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-2 hover:text-white transition-colors duration-200 active:scale-95"
        >
          <Share2 className="w-5 h-5" strokeWidth={1.5} />
        </button>

        <button
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-2 hover:text-white transition-colors duration-200 active:scale-95"
        >
          <Bookmark className="w-5 h-5" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}
