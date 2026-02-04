import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Trash2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../lib/supabase'
import StockTag from '../market/StockTag'
import toast from 'react-hot-toast'

// Extract stock symbols from text
const extractStockSymbols = (text) => {
  if (!text) return []
  const matches = text.match(/\$[A-Z]{1,5}\b/g) || []
  return [...new Set(matches.map(s => s.substring(1)))]
}

// Replace stock symbols with placeholders
const replaceStockSymbols = (text) => {
  if (!text) return { text, symbols: [] }
  const symbols = extractStockSymbols(text)
  let processedText = text
  
  symbols.forEach((symbol, index) => {
    processedText = processedText.replace(new RegExp(`\\$${symbol}\\b`, 'g'), `__STOCK_${index}__`)
  })
  
  return { text: processedText, symbols }
}

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

    if (minutes < 1) return 'now'
    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    if (days < 7) return `${days}d`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Process content with stock symbols
  const { text: processedText, symbols: stockSymbols } = replaceStockSymbols(post.content)
  const contentParts = processedText ? processedText.split(/(__STOCK_\d+__)/) : []

  return (
    <div className="cursor-pointer" onClick={() => navigate(`/post/${post.id}`)}>
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div 
            className="w-9 h-9 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center text-white font-light text-sm flex-shrink-0 cursor-pointer border border-gray-900"
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
            <div className="flex items-center gap-1.5">
              <p className="font-light text-white truncate text-sm">
                {post.author?.full_name || 'Unknown'}
              </p>
              {post.author?.user_type === 'advisor' && post.author?.is_verified && (
                <span className="text-white flex-shrink-0 text-xs">✓</span>
              )}
              <span className="text-gray-600 text-xs">·</span>
              <span className="text-gray-600 text-xs flex-shrink-0">{formatDate(post.created_at)}</span>
            </div>
            <div className="text-xs text-gray-600 font-light truncate">@{post.author?.username}</div>
          </div>
        </div>

        {isOwnPost && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowMenu(!showMenu)
              }}
              className="p-1.5 hover:bg-gray-950 rounded-full transition-colors"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-600" strokeWidth={1.5} />
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
                <div className="absolute right-0 top-8 bg-gray-900 border border-gray-800 shadow-lg z-20 rounded-lg overflow-hidden">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete()
                    }}
                    disabled={deleting}
                    className="w-full px-4 py-2.5 text-left text-red-500 hover:bg-gray-950 flex items-center gap-2 disabled:opacity-50 text-sm font-light transition-colors"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    <span>{deleting ? 'Deleting...' : 'Delete'}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Content with inline stock tags */}
      {post.content && (
        <div className="mb-2 whitespace-pre-wrap break-words font-light text-[15px] leading-snug">
          {contentParts.map((part, index) => {
            const stockMatch = part.match(/__STOCK_(\d+)__/)
            if (stockMatch) {
              const stockIndex = parseInt(stockMatch[1])
              const symbol = stockSymbols[stockIndex]
              return (
                <span key={index} onClick={(e) => e.stopPropagation()}>
                  <StockTag symbol={symbol} compact={true} />
                </span>
              )
            }
            return <span key={index} className="text-white">{part}</span>
          })}
        </div>
      )}

      {/* Images */}
      {post.images && post.images.length > 0 && (
        <div className={`mb-2.5 rounded-xl overflow-hidden ${
          post.images.length === 1 ? '' :
          'grid grid-cols-2 gap-0.5'
        }`}>
          {post.images.slice(0, 4).map((image, index) => (
            <div 
              key={index}
              className={`relative ${
                post.images.length === 1 ? 'aspect-video' :
                post.images.length === 3 && index === 0 ? 'col-span-2 aspect-video' :
                'aspect-square'
              } overflow-hidden bg-gray-950`}
            >
              <img
                src={image}
                alt=""
                className="w-full h-full object-cover"
                onClick={(e) => e.stopPropagation()}
              />
              {post.images.length > 4 && index === 3 && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <span className="text-white text-xl font-light">+{post.images.length - 4}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Single image from image_url (MVP compatibility) */}
      {post.image_url && !post.images && (
        <div className="mb-2.5 rounded-xl overflow-hidden">
          <img
            src={post.image_url}
            alt=""
            className="w-full aspect-video object-cover bg-gray-950"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 text-gray-600 pt-1.5">
        <button
          onClick={handleLike}
          className="flex items-center gap-1.5 hover:text-white transition-colors active:scale-95 px-2 py-1.5 -ml-2 rounded-full hover:bg-gray-950"
        >
          <Heart className={`w-[18px] h-[18px] ${liked ? 'fill-red-500 text-red-500' : ''}`} strokeWidth={1.5} />
          <span className="text-sm font-light">{likesCount || 0}</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/post/${post.id}`)
          }}
          className="flex items-center gap-1.5 hover:text-white transition-colors active:scale-95 px-2 py-1.5 rounded-full hover:bg-gray-950"
        >
          <MessageCircle className="w-[18px] h-[18px]" strokeWidth={1.5} />
          <span className="text-sm font-light">{post.comments_count || 0}</span>
        </button>

        <button
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 hover:text-white transition-colors active:scale-95 p-1.5 rounded-full hover:bg-gray-950 ml-auto"
        >
          <Share2 className="w-[18px] h-[18px]" strokeWidth={1.5} />
        </button>

        <button
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 hover:text-white transition-colors active:scale-95 p-1.5 rounded-full hover:bg-gray-950"
        >
          <Bookmark className="w-[18px] h-[18px]" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}
