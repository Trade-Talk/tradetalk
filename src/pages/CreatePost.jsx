import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Image as ImageIcon, X, Loader, TrendingUp } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { db, storage } from '../lib/supabase'
import StockPicker from '../components/StockPicker'
import StockTickerDisplay from '../components/StockTickerDisplay'
import toast from 'react-hot-toast'

export default function CreatePost() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const fileInputRef = useRef(null)

  const [content, setContent] = useState('')
  const [images, setImages] = useState([])
  const [stocks, setStocks] = useState([])
  const [showStockPicker, setShowStockPicker] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [posting, setPosting] = useState(false)

  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length + images.length > 4) {
      toast.error('Maximum 4 images allowed')
      return
    }

    setUploading(true)
    const newImages = []

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`)
        continue
      }

      const { data: url, error } = await storage.uploadPostImage(user.id, file)
      if (error) {
        toast.error('Failed to upload image')
        console.error(error)
      } else {
        newImages.push(url)
      }
    }

    setImages([...images, ...newImages])
    setUploading(false)
  }

  const removeImage = async (index) => {
    const imageUrl = images[index]
    await storage.deletePostImage(imageUrl)
    setImages(images.filter((_, i) => i !== index))
  }

  const handlePost = async () => {
    if (!content.trim() && images.length === 0) {
      toast.error('Please add some content or images')
      return
    }

    setPosting(true)

    try {
      const { error } = await db.createPost({
        author_id: user.id,
        content: content.trim(),
        images: images,
        stocks: stocks.length > 0 ? stocks : null,
        post_type: 'regular'
      })

      if (error) throw error

      toast.success('Post created!')
      navigate('/', { state: { refresh: true }, replace: true })
    } catch (error) {
      console.error('Error creating post:', error)
      toast.error('Failed to create post')
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* Premium Header */}
      <header className="border-b border-gray-950 px-6 py-4 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-white transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
        </button>
        <h1 className="text-base font-light">Create Post</h1>
        <button
          onClick={handlePost}
          disabled={(!content.trim() && images.length === 0) || posting}
          className="px-6 py-2 bg-white text-black text-sm font-medium hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98]"
        >
          {posting ? 'Posting...' : 'Post'}
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* User Info - Minimal */}
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-950">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center text-white font-light text-sm border border-gray-900">
              {user?.full_name?.[0] || user?.username?.[0] || 'U'}
            </div>
            <div>
              <p className="font-light text-white text-sm">{user?.full_name || 'User'}</p>
              <p className="text-xs text-gray-600">@{user?.username}</p>
            </div>
          </div>

          {/* Text Input - Clean */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full min-h-[200px] text-base font-light resize-none focus:outline-none bg-transparent text-white placeholder-gray-600"
            autoFocus
          />

          {/* Image Preview - Premium grid */}
          {images.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-2">
              {images.map((image, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={image}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover border border-gray-900"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1.5 bg-black/80 hover:bg-black transition-colors duration-200"
                  >
                    <X className="w-4 h-4 text-white" strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Stock Tickers */}
          {stocks.length > 0 && (
            <div className="mt-6">
              <StockTickerDisplay stocks={stocks} />
            </div>
          )}

          {uploading && (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-5 h-5 text-white animate-spin" strokeWidth={1.5} />
              <span className="ml-2 text-gray-600 text-sm font-light">Uploading images...</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Actions - Minimal */}
      <div className="border-t border-gray-950 p-6">
        <div className="flex items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={images.length >= 4 || uploading}
            className="flex items-center gap-2 px-6 py-2 border border-gray-900 hover:bg-gray-950 hover:border-gray-800 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ImageIcon className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
            <span className="text-gray-400 text-sm font-light">Photos</span>
          </button>
          
          <button
            onClick={() => setShowStockPicker(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white border border-emerald-500/20 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all duration-200"
          >
            <TrendingUp className="w-5 h-5" strokeWidth={2} />
            <span className="text-sm font-medium">Add Stocks</span>
          </button>
          
          {(images.length > 0 || stocks.length > 0) && (
            <div className="flex items-center gap-3 text-sm text-gray-600 font-light">
              {images.length > 0 && <span>{images.length}/4 photos</span>}
              {stocks.length > 0 && <span>{stocks.length} stock{stocks.length > 1 ? 's' : ''}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Stock Picker Modal */}
      {showStockPicker && (
        <StockPicker
          selectedStocks={stocks}
          onSelect={(stock) => {
            if (!stocks.find(s => s.symbol === stock.symbol)) {
              setStocks([...stocks, stock])
            }
          }}
          onClose={() => setShowStockPicker(false)}
        />
      )}
    </div>
  )
}
