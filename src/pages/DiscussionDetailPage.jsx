import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, Loader, Heart, MessageCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function DiscussionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [discussion, setDiscussion] = useState(null)
  const [replies, setReplies] = useState([])
  const [loading, setLoading] = useState(true)
  const [newReply, setNewReply] = useState('')
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    loadDiscussion()
  }, [id])

  const loadDiscussion = async () => {
    try {
      setLoading(true)
      // TODO: Implement actual discussion fetching from database
      // For now, using mock data structure that matches database schema
      
      // This would be: const { data, error } = await db.getDiscussionById(id)
      
      // Mock discussion for development
      const mockDiscussion = {
        id: id,
        title: 'How to invest from scratch as a beginner?',
        content: 'I have ₹10,000 saved up and want to start investing. Where should I begin? What apps, brokers, or strategies would you recommend for someone completely new to the stock market?',
        author: {
          id: 'user1',
          full_name: 'Priya Sharma',
          username: 'priyalearns',
          avatar_url: null
        },
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        category: 'Learning',
        likes_count: 127,
        replies_count: 48
      }

      setDiscussion(mockDiscussion)
      loadReplies(id)
    } catch (error) {
      console.error('Error loading discussion:', error)
      toast.error('Failed to load discussion')
    } finally {
      setLoading(false)
    }
  }

  const loadReplies = async (discussionId) => {
    try {
      // TODO: Implement actual replies fetching
      // const { data, error } = await db.getDiscussionReplies(discussionId)
      
      // Mock replies for development
      const mockReplies = [
        {
          id: 1,
          content: 'Started with ₹10k myself last year. My advice: 1) Open a Zerodha account (lowest fees), 2) Start with index funds like Nifty 50, 3) Learn before jumping into individual stocks. Don\'t YOLO into penny stocks like I did!',
          author: {
            id: 'user2',
            full_name: 'Rajesh Kumar',
            username: 'rajeshvalue',
            avatar_url: null
          },
          created_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
          likes_count: 45
        },
        {
          id: 2,
          content: 'Best advice: Read "The Intelligent Investor" first. Then paper trade for 2-3 months. I wish someone told me this before I lost 30% in my first month trading without knowledge.',
          author: {
            id: 'user3',
            full_name: 'Amit Trader',
            username: 'amitfotrader',
            avatar_url: null
          },
          created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          likes_count: 38
        }
      ]

      setReplies(mockReplies)
    } catch (error) {
      console.error('Error loading replies:', error)
    }
  }

  const handlePostReply = async () => {
    if (!newReply.trim()) return
    if (!user) {
      toast.error('Please sign in to reply')
      return
    }

    setPosting(true)
    try {
      // TODO: Implement actual reply creation
      // const { data, error } = await db.createDiscussionReply({
      //   discussion_id: id,
      //   author_id: user.id,
      //   content: newReply.trim()
      // })

      // Mock reply creation for now
      const newReplyObj = {
        id: Date.now(),
        content: newReply.trim(),
        author: {
          id: user.id,
          full_name: user.user_metadata?.full_name || 'You',
          username: user.user_metadata?.username || 'user',
          avatar_url: user.user_metadata?.avatar_url || null
        },
        created_at: new Date().toISOString(),
        likes_count: 0
      }

      setReplies([...replies, newReplyObj])
      setNewReply('')
      toast.success('Reply posted!')
    } catch (error) {
      console.error('Error posting reply:', error)
      toast.error('Failed to post reply')
    } finally {
      setPosting(false)
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
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <Loader className="w-8 h-8 text-white animate-spin" />
      </div>
    )
  }

  if (!discussion) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center px-6">
        <h2 className="text-xl font-light text-white mb-2">Discussion not found</h2>
        <button
          onClick={() => navigate('/explore')}
          className="text-gray-400 font-light"
        >
          Go back to explore
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
          className="p-2 -ml-2 hover:bg-gray-950 rounded-full active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
        </button>
        <h1 className="text-base font-light text-white ml-2">Discussion</h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {/* Original Discussion Post */}
        <div className="p-4 border-b border-gray-950">
          {/* Category Badge */}
          {discussion.category && (
            <span className="inline-block px-2 py-0.5 bg-gray-900 text-gray-400 text-xs font-light mb-3">
              {discussion.category}
            </span>
          )}

          {/* Title */}
          <h2 className="text-white text-lg font-light mb-3 leading-relaxed">
            {discussion.title}
          </h2>

          {/* Content */}
          <p className="text-gray-300 text-sm font-light mb-4 leading-relaxed">
            {discussion.content}
          </p>

          {/* Author & Meta */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center text-white font-light border border-gray-900">
                {discussion.author?.avatar_url ? (
                  <img src={discussion.author.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-sm">{discussion.author?.full_name?.[0] || 'U'}</span>
                )}
              </div>
              <div>
                <p className="text-sm font-light text-white">{discussion.author?.full_name}</p>
                <p className="text-xs text-gray-500 font-light">
                  @{discussion.author?.username} · {formatDate(discussion.created_at)}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-gray-500">
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" strokeWidth={1.5} />
                <span className="text-xs font-light">{discussion.likes_count || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
                <span className="text-xs font-light">{discussion.replies_count || replies.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Replies */}
        <div className="divide-y divide-gray-950">
          {replies.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 text-sm font-light">No replies yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            replies.map((reply) => (
              <div key={reply.id} className="p-4">
                <div className="flex gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center text-white font-light border border-gray-900 flex-shrink-0">
                    {reply.author?.avatar_url ? (
                      <img src={reply.author.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-xs">{reply.author?.full_name?.[0] || 'U'}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-light text-white">{reply.author?.full_name}</span>
                      <span className="text-xs text-gray-500 font-light">
                        @{reply.author?.username}
                      </span>
                      <span className="text-xs text-gray-600 font-light">·</span>
                      <span className="text-xs text-gray-600 font-light">{formatDate(reply.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-300 font-light leading-relaxed mb-2">
                      {reply.content}
                    </p>
                    <div className="flex items-center gap-4 text-gray-500">
                      <button className="flex items-center gap-1 hover:text-white transition-colors">
                        <Heart className="w-4 h-4" strokeWidth={1.5} />
                        <span className="text-xs font-light">{reply.likes_count || 0}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Reply Input */}
      <div className="border-t border-gray-950 p-4 bg-black">
        <div className="flex gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center text-white font-light border border-gray-900 flex-shrink-0">
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-xs">{user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U'}</span>
            )}
          </div>
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handlePostReply()}
              placeholder="Write a reply..."
              className="flex-1 bg-gray-950 text-white px-4 py-2 rounded-full text-sm font-light focus:outline-none focus:ring-1 focus:ring-gray-800"
              disabled={posting}
            />
            <button
              onClick={handlePostReply}
              disabled={!newReply.trim() || posting}
              className="p-2 bg-white text-black rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              {posting ? (
                <Loader className="w-5 h-5 animate-spin" strokeWidth={2} />
              ) : (
                <Send className="w-5 h-5" strokeWidth={2} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
