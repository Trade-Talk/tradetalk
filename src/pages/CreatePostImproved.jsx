import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Image as ImageIcon, X, Loader } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { db, storage } from '../lib/supabase-mvp'
import toast from 'react-hot-toast'

// Extract stock symbols
const extractStockSymbols = (text) => {
  const matches = text.match(/\$[A-Z]{1,5}\b/g) || []
  return matches.map(s => s.substring(1))
}

export default function CreatePostImproved() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const fileInputRef = useRef(null)

  const [content, setContent] = useState('')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [posting, setPosting] = useState(false)

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
        image_url: imageUrl
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
          {/* Text Input */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?

💡 Use $SYMBOL for stocks (e.g., $AAPL, $TSLA)"
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
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-light text-gray-400">Stocks detected:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {detectedStocks.map(stock => (
                  <span key={stock} className="px-2.5 py-1 bg-gray-900 text-white text-xs font-mono rounded-lg border border-gray-800">
                    ${stock}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative mb-4">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full rounded-xl border border-gray-900"
              />
              <button
                onClick={removeImage}
                className="absolute top-3 right-3 p-1.5 bg-black/80 backdrop-blur-sm rounded-full hover:bg-black transition-all"
              >
                <X className="w-4 h-4 text-white" strokeWidth={2} />
              </button>
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="flex items-center justify-center py-8 bg-gray-950 rounded-xl border border-gray-900 mb-4">
              <Loader className="w-5 h-5 text-white animate-spin mr-2" />
              <span className="text-sm text-gray-400 font-light">Uploading...</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="border-t border-gray-950 p-4 bg-black">
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
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-950 border border-gray-900 rounded-full hover:bg-gray-900 hover:border-gray-800 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ImageIcon className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
          <span className="text-sm font-light text-gray-400">
            {image ? 'Image attached' : 'Add photo'}
          </span>
        </button>
      </div>
    </div>
  )
}
