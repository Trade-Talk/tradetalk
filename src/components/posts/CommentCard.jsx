import { useState, useEffect } from 'react'
import { Heart, Trash2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../lib/supabase'
import toast from 'react-hot-toast'

export default function CommentCard({ comment, onDelete }) {
  const { user } = useAuth()
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(comment.likes_count || 0)
  const [loading, setLoading] = useState(true)

  const isOwnComment = user?.id === comment.author_id

  // Check if user has liked this comment
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!user || !comment.id) {
        setLoading(false)
        return
      }

      try {
        const { data, error } = await db.checkIfCommentLiked(user.id, comment.id)
        if (!error) {
          setLiked(data)
        }
      } catch (error) {
        console.error('Error checking comment like status:', error)
      } finally {
        setLoading(false)
      }
    }

    checkLikeStatus()
  }, [user, comment.id])

  const handleLike = async (e) => {
    e.stopPropagation()
    if (!user) {
      toast.error('Please sign in to like comments')
      return
    }

    // Optimistic update
    const newLiked = !liked
    const oldLiked = liked
    const oldCount = likesCount

    setLiked(newLiked)
    setLikesCount(newLiked ? likesCount + 1 : likesCount - 1)

    try {
      if (newLiked) {
        const { error } = await db.likeComment(user.id, comment.id)
        if (error) throw error
      } else {
        const { error } = await db.unlikeComment(user.id, comment.id)
        if (error) throw error
      }
    } catch (error) {
      console.error('Error toggling comment like:', error)
      // Revert on error
      setLiked(oldLiked)
      setLikesCount(oldCount)
      toast.error('Failed to update like')
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

  return (
    <div className="p-4">
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center text-white font-light flex-shrink-0 border border-gray-900">
          {comment.author?.avatar_url ? (
            <img src={comment.author.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="text-xs">{comment.author?.full_name?.[0] || 'U'}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <p className="font-light text-white text-sm truncate">
                {comment.author?.full_name || 'Unknown'}
              </p>
              <span className="text-xs text-gray-600 flex-shrink-0">
                · {formatDate(comment.created_at)}
              </span>
            </div>
            {isOwnComment && onDelete && (
              <button
                onClick={() => onDelete(comment.id)}
                className="p-1 hover:bg-gray-950 rounded text-gray-600 hover:text-red-500 touch-manipulation"
              >
                <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            )}
          </div>
          <p className="text-white text-sm mb-2 break-words font-light leading-snug">
            {comment.content}
          </p>
          
          {/* Like button */}
          <button
            onClick={handleLike}
            disabled={loading}
            className="flex items-center gap-1 hover:text-white transition-colors active:scale-95 -ml-1 px-1 py-0.5 disabled:opacity-50"
          >
            <Heart 
              className={`w-4 h-4 ${liked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
              strokeWidth={1.5} 
            />
            {likesCount > 0 && (
              <span className="text-xs font-light text-gray-600">{likesCount}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
