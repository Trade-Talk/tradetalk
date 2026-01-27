import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, Loader, Heart, Trash2 } from 'lucide-react'
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

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <Loader className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="h-screen bg-white flex flex-col items-center justify-center px-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Post not found</h2>
        <button
          onClick={() => navigate('/')}
          className="text-primary-600 font-medium"
        >
          Go back to feed
        </button>
      </div>
    )
  }

  return (
    <div className="h-screen bg-white flex flex-col safe-area-top overflow-hidden">
      {/* Header */}
      <header className="border-b border-gray-200 px-4 py-3 flex items-center">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full active:scale-95 transition-transform touch-manipulation"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 ml-2">Post</h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {/* Post */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-start space-x-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
              {post.author?.avatar_url ? (
                <img src={post.author.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                post.author?.full_name?.[0] || 'U'
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <p className="font-semibold text-gray-900">
                  {post.author?.full_name || 'Unknown'}
                </p>
                {post.author?.user_type === 'advisor' && post.author?.is_verified && (
                  <span className="text-primary-600" title="Verified Advisor">✓</span>
                )}
              </div>
              <p className="text-sm text-gray-500">@{post.author?.username}</p>
            </div>
          </div>

          {post.content && (
            <p className="text-gray-900 text-lg mb-3 whitespace-pre-wrap break-words">
              {post.content}
            </p>
          )}

          {post.images && post.images.length > 0 && (
            <div className="mb-3 space-y-2">
              {post.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Post image ${index + 1}`}
                  className="w-full rounded-lg"
                />
              ))}
            </div>
          )}

          <p className="text-sm text-gray-500 mb-3">{formatDate(post.created_at)}</p>

          <div className="flex items-center space-x-6 text-gray-600 pt-3 border-t border-gray-200">
            <span className="text-sm"><strong>{post.likes_count || 0}</strong> Likes</span>
            <span className="text-sm"><strong>{comments.length}</strong> Comments</span>
          </div>
        </div>

        {/* Comments */}
        <div className="divide-y divide-gray-200">
          {comments.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <p>No comments yet</p>
              <p className="text-sm mt-1">Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {comment.author?.avatar_url ? (
                      <img src={comment.author.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      comment.author?.full_name?.[0] || 'U'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {comment.author?.full_name || 'Unknown'}
                        </p>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      {user?.id === comment.author_id && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="p-1 hover:bg-red-50 rounded text-red-600 touch-manipulation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-gray-900 text-sm mt-1 break-words">
                      {comment.content}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500 text-xs">
                        <Heart className="w-3.5 h-3.5" />
                        <span>{comment.likes_count || 0}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Comment Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex items-end space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              user?.full_name?.[0] || 'U'
            )}
          </div>
          <div className="flex-1 flex items-end space-x-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent max-h-32"
              rows="1"
              onInput={(e) => {
                e.target.style.height = 'auto'
                e.target.style.height = e.target.scrollHeight + 'px'
              }}
            />
            <button
              onClick={handlePostComment}
              disabled={!newComment.trim() || posting}
              className="p-2 bg-primary-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform touch-manipulation"
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
