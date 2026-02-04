import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, Loader, Heart, MessageCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { db, timeAgo } from '../lib/supabase-mvp'
import PostCardMVP from '../components/posts/PostCardMVP'
import toast from 'react-hot-toast'

export default function PostDetailMVP() {
  const { postId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    loadPost()
  }, [postId])

  const loadPost = async () => {
    try {
      // Get post
      const { data: postData, error: postError } = await db.getPostById(postId)
      if (postError) throw postError
      setPost(postData)

      // Get comments
      const { data: commentsData, error: commentsError } = await db.getComments(postId)
      if (commentsError) throw commentsError
      setComments(commentsData || [])
    } catch (error) {
      console.error('Error loading post:', error)
      toast.error('Failed to load post')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('Please sign in to comment')
      return
    }

    if (!commentText.trim()) {
      toast.error('Please write a comment')
      return
    }

    setPosting(true)

    try {
      const { data, error } = await db.createComment({
        post_id: postId,
        author_id: user.id,
        content: commentText.trim()
      })

      if (error) throw error

      setComments([...comments, data])
      setCommentText('')
      toast.success('Comment posted!')
    } catch (error) {
      console.error('Error posting comment:', error)
      toast.error('Failed to post comment')
    } finally {
      setPosting(false)
    }
  }

  const handleLikeComment = async (commentId) => {
    if (!user) {
      toast.error('Please sign in to like comments')
      return
    }

    try {
      await db.likeComment(user.id, commentId)
      // Update the comment in the list
      setComments(comments.map(c => 
        c.id === commentId 
          ? { ...c, like_count: (c.like_count || 0) + 1 }
          : c
      ))
    } catch (error) {
      console.error('Error liking comment:', error)
      toast.error('Failed to like comment')
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <p className="text-gray-600 mb-4">Post not found</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Go Home
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 sticky top-0 z-10">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Post</h1>
      </header>

      {/* Post */}
      <div className="bg-white border-b-8 border-gray-200">
        <PostCardMVP
          post={post}
          onDelete={() => navigate('/')}
          onUpdate={setPost}
        />
      </div>

      {/* Comments Section */}
      <div className="max-w-2xl mx-auto bg-white">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Comments ({comments.length})
          </h3>
        </div>

        {/* Comments List */}
        <div className="divide-y divide-gray-100">
          {comments.length === 0 ? (
            <div className="py-12 text-center">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No comments yet</p>
              <p className="text-sm text-gray-500 mt-1">Be the first to comment!</p>
            </div>
          ) : (
            comments.map(comment => (
              <div key={comment.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div 
                    onClick={() => navigate(`/profile/${comment.author.username}`)}
                    className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold cursor-pointer hover:opacity-90"
                  >
                    {comment.author.avatar_url ? (
                      <img src={comment.author.avatar_url} alt={comment.author.username} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      comment.author.username?.[0]?.toUpperCase() || 'U'
                    )}
                  </div>

                  {/* Comment Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span 
                        onClick={() => navigate(`/profile/${comment.author.username}`)}
                        className="font-semibold text-gray-900 text-sm hover:underline cursor-pointer"
                      >
                        {comment.author.username}
                      </span>
                      {comment.author.current_streak > 0 && (
                        <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-medium">
                          🔥 {comment.author.current_streak}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {timeAgo(comment.created_at)}
                      </span>
                    </div>
                    
                    <p className="text-gray-900 text-sm whitespace-pre-wrap break-words mb-2">
                      {comment.content}
                    </p>

                    {/* Comment Actions */}
                    <div className="flex items-center gap-4 text-xs">
                      <button
                        onClick={() => handleLikeComment(comment.id)}
                        className="flex items-center gap-1 text-gray-600 hover:text-red-500 transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                        <span>{comment.like_count || 0}</span>
                      </button>
                      
                      {user?.id === comment.author.id && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-gray-600 hover:text-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Comment Input (Fixed at bottom) */}
      {user && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-area-bottom">
          <form onSubmit={handleSubmitComment} className="max-w-2xl mx-auto">
            <div className="flex items-end gap-3">
              {/* User Avatar */}
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                {user.full_name?.[0] || user.username?.[0] || 'U'}
              </div>

              {/* Input */}
              <div className="flex-1">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={1}
                  onInput={(e) => {
                    e.target.style.height = 'auto'
                    e.target.style.height = e.target.scrollHeight + 'px'
                  }}
                />
              </div>

              {/* Send Button */}
              <button
                type="submit"
                disabled={!commentText.trim() || posting}
                className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0"
              >
                {posting ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Login prompt if not signed in */}
      {!user && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-gray-600 mb-3">Sign in to comment</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Sign In
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
