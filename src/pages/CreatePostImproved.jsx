import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Image as ImageIcon, X, Loader } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { db, storage } from '../lib/supabase-mvp'
import toast from 'react-hot-toast'

// Extract stock symbols
const extractStockSymbols = (text) => {
  const matches = text.match(/\$[A-Z]{1,5}\b/g) || []
  return matches.map(s => s.substring(1))
}

const categories = ['Crypto', 'Stocks', 'Options', 'Futures', 'Forex', 'Commodities', 'ETFs', 'General']

export default function CreatePostImproved() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const fileInputRef = useRef(null)

  const [content, setContent] = useState('')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [posting, setPosting] = useState(false)
  
  // NEW: Post type states - Auto-select based on where user came from
  const [postType, setPostType] = useState(location.state?.postType || 'general')
  const [discussionTopic, setDiscussionTopic] = useState('')
  const [tags, setTags] = useState('')
  const [debateFor, setDebateFor] = useState('')
  const [debateAgainst, setDebateAgainst] = useState('')
  const [category, setCategory] = useState('General')

  // Auto-select post type if coming from a specific context
  useEffect(() => {
    if (location.state?.postType) {
      setPostType(location.state.postType)
    }
  }, [location.state])

  const detectedStocks = extractStockSymbols(content)

  const handleImageSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
    setImage(file)
  }

  const removeImage = () => {
    setImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handlePost = async () => {
    if (!content.trim()) {
      toast.error('Please write something')
      return
    }

    // NEW: Validate based on post type
    if (postType === 'discussion' && !discussionTopic.trim()) {
      toast.error('Please add a discussion topic')
      return
    }

    if (postType === 'debate' && (!debateFor.trim() || !debateAgainst.trim())) {
      toast.error('Please add both sides of the debate')
      return
    }

    if (!user || !user.id) {
      toast.error('Please sign in to create a post')
      navigate('/auth/signin')
      return
    }

    setPosting(true)

    try {
      let imageUrl = null

      if (image) {
        setUploading(true)
        const uploadResult = await storage.uploadPostImage(user.id, image)
        setUploading(false)
        
        if (uploadResult.error) {
          console.error('Image upload error:', uploadResult.error)
          toast.error('Failed to upload image')
          setPosting(false)
          return
        }
        imageUrl = uploadResult.data
      }

      const postData = {
        author_id: user.id,
        content: content.trim(),
        image_url: imageUrl,
        post_type: postType, // NEW
        category: postType === 'general' ? category : null // Add category for general posts
      }

      // NEW: Add type-specific fields
      if (postType === 'discussion') {
        postData.discussion_topic = discussionTopic.trim()
        if (tags.trim()) {
          postData.tags = tags.split(',').map(tag => tag.trim()).filter(Boolean)
        }
      }

      if (postType === 'debate') {
        postData.debate_sides = {
          for: debateFor.trim(),
          against: debateAgainst.trim()
        }
      }

      const result = await db.createPost(postData, detectedStocks)

      if (result.error) {
        console.error('Post creation error:', result.error)
        throw new Error(result.error.message || 'Failed to create post')
      }

      toast.success('Posted!')
      navigate('/', { replace: true, state: { refresh: true } })
    } catch (error) {
      console.error('Error creating post:', error)
      toast.error(error.message || 'Failed to create post. Please try again.')
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden safe-area-top">
      {/* Header */}
      <header className="border-b border-gray-950 px-4 py-3 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-gray-950 rounded-full transition-colors active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
        </button>
        <button
          onClick={handlePost}
          disabled={!content.trim() || posting || uploading}
          className="px-5 py-1.5 bg-white text-black text-sm font-medium rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          {posting ? 'Posting...' : 'Post'}
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* NEW: Post Type Selector - Only show if NOT coming from context */}
          {!location.state?.postType && (
            <div className="mb-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPostType('general')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-light transition-all ${
                    postType === 'general' 
                      ? 'bg-white text-black' 
                      : 'bg-gray-950 text-gray-400 hover:bg-gray-900'
                  }`}
                >
                  📝 General
                </button>
                <button
                  type="button"
                  onClick={() => setPostType('discussion')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-light transition-all ${
                    postType === 'discussion' 
                      ? 'bg-white text-black' 
                      : 'bg-gray-950 text-gray-400 hover:bg-gray-900'
                  }`}
                >
                  💭 Discussion
                </button>
                <button
                  type="button"
                  onClick={() => setPostType('debate')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-light transition-all ${
                    postType === 'debate' 
                      ? 'bg-white text-black' 
                      : 'bg-gray-950 text-gray-400 hover:bg-gray-900'
                  }`}
                >
                  ⚖️ Debate
                </button>
              </div>
            </div>
          )}

          {/* Show locked post type if coming from context */}
          {location.state?.postType && (
            <div className="mb-4 px-4 py-3 bg-gray-950 border border-gray-900 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Post Type</p>
              <p className="text-sm font-light text-white">
                {postType === 'general' && '📝 General'}
                {postType === 'discussion' && '💭 Discussion'}
                {postType === 'debate' && '⚖️ Debate'}
              </p>
            </div>
          )}

          {/* NEW: Category selector for general posts */}
          {postType === 'general' && (
            <div className="mb-4">
              <label className="block text-gray-500 text-xs mb-2 font-light">Category</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-light transition-all ${
                      category === cat
                        ? 'bg-white text-black'
                        : 'bg-gray-950 text-gray-400 hover:bg-gray-900 border border-gray-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* NEW: Discussion-specific fields */}
          {postType === 'discussion' && (
            <div className="mb-4 space-y-3">
              <input
                type="text"
                value={discussionTopic}
                onChange={(e) => setDiscussionTopic(e.target.value)}
                placeholder="Discussion topic (e.g., 'Best growth stocks for 2026')"
                className="w-full bg-gray-950 text-white rounded-lg px-4 py-2.5 text-sm font-light focus:outline-none focus:ring-2 focus:ring-white border border-gray-900"
              />
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Tags (comma-separated, e.g., stocks, investing, tech)"
                className="w-full bg-gray-950 text-white rounded-lg px-4 py-2.5 text-sm font-light focus:outline-none focus:ring-2 focus:ring-white border border-gray-900"
              />
            </div>
          )}

          {/* NEW: Debate-specific fields */}
          {postType === 'debate' && (
            <div className="mb-4 space-y-3">
              <div className="bg-green-900/10 rounded-lg p-3 border border-green-900/30">
                <label className="block text-green-400 text-xs mb-2 font-light">
                  👍 Argument FOR
                </label>
                <textarea
                  value={debateFor}
                  onChange={(e) => setDebateFor(e.target.value)}
                  placeholder="Why this is a good idea..."
                  rows={3}
                  className="w-full bg-gray-950 text-white rounded-lg px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-green-500 resize-none border border-gray-900"
                />
              </div>
              <div className="bg-red-900/10 rounded-lg p-3 border border-red-900/30">
                <label className="block text-red-400 text-xs mb-2 font-light">
                  👎 Argument AGAINST
                </label>
                <textarea
                  value={debateAgainst}
                  onChange={(e) => setDebateAgainst(e.target.value)}
                  placeholder="Why this might not work..."
                  rows={3}
                  className="w-full bg-gray-950 text-white rounded-lg px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-red-500 resize-none border border-gray-900"
                />
              </div>
            </div>
          )}

          {/* Text Input */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              postType === 'general' 
                ? "Share your trading thoughts, market analysis, or questions..." 
                : postType === 'discussion'
                ? "Share your thoughts and insights to start the discussion..."
                : "Present the topic and context for debate..."
            }
            className="w-full bg-transparent text-white placeholder-gray-600 focus:outline-none resize-none font-light text-[15px] leading-snug min-h-[200px]"
            autoFocus
          />

          {/* Character Count */}
          {content.length > 0 && (
            <div className="flex justify-end mb-4">
              <p className={`text-xs font-light ${content.length > 800 ? 'text-yellow-500' : 'text-gray-600'}`}>
                {content.length} characters
              </p>
            </div>
          )}

          {/* Detected Stocks */}
          {detectedStocks.length > 0 && (
            <div className="bg-gray-950 border border-gray-900 rounded-xl p-4 mb-4">
              <p className="text-xs text-gray-500 font-light mb-2">Stocks mentioned:</p>
              <div className="flex flex-wrap gap-2">
                {detectedStocks.map((stock, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1 bg-gray-900 text-white text-xs font-light border border-gray-800"
                  >
                    ${stock}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-600 font-light mt-2">
                Tip: Tag stocks with $ (e.g., $AAPL) to help others discover your analysis
              </p>
            </div>
          )}

          {/* Image Preview */}
          {imagePreview && (
            <div className="mb-4 relative">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-full rounded-xl max-h-[400px] object-cover"
              />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-full backdrop-blur-sm hover:bg-black transition-colors"
              >
                <X className="w-4 h-4 text-white" strokeWidth={2} />
              </button>
            </div>
          )}

          {/* Upload Status */}
          {uploading && (
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
              <Loader className="w-4 h-4 animate-spin" />
              <span className="font-light">Uploading image...</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-950 px-4 py-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || posting}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
        >
          <ImageIcon className="w-5 h-5" strokeWidth={1.5} />
          <span className="text-sm font-light">Add Image</span>
        </button>
      </footer>
    </div>
  )
}