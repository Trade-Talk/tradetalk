import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Image as ImageIcon, X, Loader } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { db, storage, extractStockSymbols } from '../lib/supabase-mvp'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { id: 'Discussion', label: 'Discussion', emoji: '💬' },
  { id: 'DD', label: 'DD (Due Diligence)', emoji: '📈' },
  { id: 'Meme', label: 'Meme', emoji: '😂' },
  { id: 'News', label: 'News', emoji: '📰' },
  { id: 'Gain', label: 'Gain', emoji: '🚀' },
  { id: 'Loss', label: 'Loss', emoji: '📉' },
  { id: 'Question', label: 'Question', emoji: '❓' }
]

export default function CreatePostMVP() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const fileInputRef = useRef(null)

  const [content, setContent] = useState('')
  const [category, setCategory] = useState('Discussion')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [posting, setPosting] = useState(false)

  // Extract stock symbols from content
  const detectedStocks = extractStockSymbols(content)

  const handleImageSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB')
      return
    }

    // Create preview
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

    setPosting(true)

    try {
      let imageUrl = null

      // Upload image if exists
      if (image) {
        setUploading(true)
        const { data: url, error: uploadError } = await storage.uploadPostImage(user.id, image)
        setUploading(false)
        
        if (uploadError) throw uploadError
        imageUrl = url
      }

      // Create post with stock symbols
      const { data, error } = await db.createPost({
        author_id: user.id,
        content: content.trim(),
        image_url: imageUrl,
        category
      }, detectedStocks)

      if (error) throw error

      toast.success('Post created! 🚀')
      navigate('/', { replace: true })
    } catch (error) {
      console.error('Error creating post:', error)
      toast.error('Failed to create post')
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 bg-white z-10">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Create Post</h1>
        <button
          onClick={handlePost}
          disabled={!content.trim() || posting || uploading}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {posting ? 'Posting...' : 'Post'}
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Category Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`
                  px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2
                  ${category === cat.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <span className="text-lg">{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text Input */}
        <div className="mb-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening in the markets? Use $SYMBOL to mention stocks (e.g., $AAPL, $RELIANCE)"
            className="w-full min-h-[200px] p-4 text-gray-900 placeholder-gray-400 resize-none focus:outline-none border border-gray-200 rounded-lg"
            autoFocus
          />
          <div className="flex items-center justify-between mt-2 px-1">
            <span className="text-sm text-gray-500">
              {content.length} characters
            </span>
            {detectedStocks.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Stocks detected:</span>
                {detectedStocks.map(stock => (
                  <span key={stock} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-mono rounded">
                    ${stock}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stock Detection Info */}
        {detectedStocks.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-lg">💡</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 mb-1">
                  Price tracking enabled
                </p>
                <p className="text-xs text-blue-700">
                  We'll save the current price of {detectedStocks.join(', ')} when you post. 
                  Your profile will show how your call performed!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Image Preview */}
        {imagePreview && (
          <div className="mb-4 relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full rounded-lg border border-gray-200"
            />
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 p-2 bg-gray-900 bg-opacity-75 hover:bg-opacity-90 rounded-full transition-all"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        )}

        {uploading && (
          <div className="flex items-center justify-center py-8">
            <Loader className="w-6 h-6 text-blue-600 animate-spin" />
            <span className="ml-2 text-gray-600 text-sm">Uploading image...</span>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={!!image || uploading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ImageIcon className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-700">Add Image</span>
          </button>

          {image && (
            <span className="text-sm text-gray-600">1 image attached</span>
          )}
        </div>

        <div className="mt-3 text-xs text-gray-500">
          💡 <strong>Tip:</strong> Type $SYMBOL (e.g., $AAPL, $RELIANCE) to track stock prices
        </div>
      </div>
    </div>
  )
}
