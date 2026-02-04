import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, Loader, Trash2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function PostDetail() {
  const { postId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    loadPost()
    loadComments()
  }, [postId])

  const loadPost = async () => {
    try {
      const { data, error } = await db.getPostById(postId)
      if (error) throw error
      setPost(data)
    } catch (error) {
      console.error('Error loading post:', error)
      toast.error('Failed to load post')
    } finally {
      setLoading(false)
    }
  }

  const loadComments = async () => {
    try {
      const { data, error } = await db.getComments(postId)
      if (error) throw error
      setComments(data || [])
    } catch (error) {
      console.error('Error loading comments:', error)
    }
  }

  const handlePostComment = async () => {
    if (!newComment.trim()) return
    if (!user) {
      toast.error('Please sign in to comment')
      return
    }

    setPosting(true)
    try {
      const { data, error } = await db.createComment({
        post_id: postId,
        author_id: user.id,
        content: newComment.trim()
      })

      if (error) throw error

      setComments([...comments, data])
      setNewComment('')
      toast.success('Comment posted!')
    } catch (error) {
      console.error('Error posting comment:', error)
      toast.error('Failed to post comment')
    } finally {
      setPosting(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return

    try {
      const { error } = await db.deleteComment(commentId)
      if (error) throw error
      
      setComments(comments.filter(c => c.id !== commentId))
      toast.success('Comment deleted')
    } catch (error) {
      console.error('Error deleting comment:', error)
      toast.error('Failed to delete comment')
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

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <Loader className="w-8 h-8 text-white animate-spin" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center px-6">
        <h2 className="text-xl font-light text-white mb-2">Post not found</h2>
        <button
          onClick={() => navigate('/')}
          className="text-gray-400 font-light"
        >
          Go back
        </button>
      </div>
    )
  }

  return (
    <div className="h-screen bg-black flex flex-col safe-area-top overflow-hidden">
      {/* Header */}
      <header className="border-b border-gray-950 px-4 py-3 flex items-center">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 hover:bg-gray-950 rounded-full active:scale-95 transition-transform touch-manipulation"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
        </button>
        <h1 className="text-base font-light text-white ml-2">Post</h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {/* Post */}
        <div className="p-4 border-b border-gray-950">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-11 h-11 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center text-white font-light border border-gray-900">
              {post.author?.avatar_url ? (
                <img src={post.author.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-sm">{post.author?.full_name?.[0] || 'U'}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-light text-white text-sm">
                  {post.author?.full_name || 'Unknown'}
                </p>
                {post.author?.user_type === 'advisor' && post.author?.is_verified && (
                  <span className="text-white text-xs">✓</span>
                )}
              </div>
              <p className="text-xs text-gray-600 font-light">@{post.author?.username}</p>
            </div>
          </div>

          {post.content && (
            <p className="text-white text-[15px] mb-3 whitespace-pre-wrap break-words font-light leading-snug">
              {post.content}
            </p>
          )}

          {post.images && post.images.length > 0 && (
            <div className="mb-3 rounded-xl overflow-hidden">
              {post.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt=""
                  className="w-full"
                />
              ))}
            </div>
          )}

          <p className="text-xs text-gray-600 font-light mb-3">{formatDate(post.created_at)}</p>

          <div className="flex items-center gap-4 text-gray-600 pt-2 border-t border-gray-950">
            <span className="text-sm font-light"><strong className="text-white">{post.likes_count || 0}</strong> likes</span>
            <span className="text-sm font-light"><strong className="text-white">{comments.length}</strong> comments</span>
          </div>
        </div>

        {/* Comments */}
        <div className="divide-y divide-gray-950">
          {comments.length === 0 ? (
            <div className="py-12 text-center text-gray-600">
              <p className="font-light">No comments yet</p>
              <p className="text-sm mt-1 font-light">Be the first to comment</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="p-4">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center text-white font-light flex-shrink-0 border border-gray-900">
                    {comment.author?.avatar_url ? (
                      <img src={comment.author.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-xs">{comment.author?.full_name?.[0] || 'U'}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <p className="font-light text-white text-sm truncate">
                          {comment.author?.full_name || 'Unknown'}
                        </p>
                        <span className="text-xs text-gray-600 flex-shrink-0">
                          · {formatDate(comment.created_at)}
                        </span>
                      </div>
                      {user?.id === comment.author_id && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="p-1 hover:bg-gray-950 rounded text-gray-600 hover:text-red-500 touch-manipulation"
                        >
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                      )}
                    </div>
                    <p className="text-white text-sm mt-1 break-words font-light leading-snug">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Comment Input */}
      <div className="border-t border-gray-950 p-4 bg-black">
        <div className="flex items-end gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center text-white font-light flex-shrink-0 border border-gray-900">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-xs">{user?.full_name?.[0] || 'U'}</span>
            )}
          </div>
          <div className="flex-1 flex items-end gap-2">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handlePostComment()}
              placeholder="Write a comment..."
              className="flex-1 px-4 py-2.5 bg-gray-950 border border-gray-900 text-white placeholder-gray-600 rounded-full focus:outline-none focus:border-white transition-colors font-light text-sm"
            />
            <button
              onClick={handlePostComment}
              disabled={!newComment.trim() || posting}
              className="p-2.5 bg-white text-black rounded-full disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform touch-manipulation"
            >
              {posting ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
