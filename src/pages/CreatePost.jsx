import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Image as ImageIcon, X, Loader } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { db, storage } from '../lib/supabase'
import toast from 'react-hot-toast'

const POST_CATEGORIES = [
  { value: 'Discussion', emoji: '💬' },
  { value: 'Question', emoji: '❓' },
  { value: 'Analysis', emoji: '📊' },
  { value: 'Strategy', emoji: '🎯' },
  { value: 'Options', emoji: '🎲' },
  { value: 'Gain', emoji: '📈' },
  { value: 'Loss', emoji: '📉' },
  { value: 'Learning', emoji: '📚' },
  { value: 'News', emoji: '📰' },
  { value: 'Meme', emoji: '😂' },
]

export default function CreatePost() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const fileInputRef = useRef(null)

  const [content, setContent] = useState('')
  const [images, setImages] = useState([])
  const [category, setCategory] = useState('Discussion')
  const [showCategoryPicker, setShowCategoryPicker] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [posting, setPosting] = useState(false)

  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length + images.length > 4) {
      toast.error('Maximum 4 images')
      return
    }

    setUploading(true)
    const newImages = []

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} too large (max 5MB)`)
        continue
      }

      const { data: url, error } = await storage.uploadPostImage(user.id, file)
      if (error) {
        toast.error('Upload failed')
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
      toast.error('Add some content')
      return
    }

    setPosting(true)

    try {
      const { error } = await db.createPost({
        author_id: user.id,
        content: content.trim(),
        images: images,
        category: category,
        post_type: 'regular'
      })

      if (error) throw error

      toast.success('Posted!')
      navigate('/', { replace: true })
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to post')
    } finally {
      setPosting(false)
    }
  }

  const selectedCategory = POST_CATEGORIES.find(c => c.value === category)

  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-gray-950 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-gray-950 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
          </button>
          <h1 className="text-base font-light">New Post</h1>
        </div>
        <button
          onClick={handlePost}
          disabled={(!content.trim() && images.length === 0) || posting}
          className="px-5 py-1.5 bg-white text-black text-sm font-medium rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          {posting ? 'Posting...' : 'Post'}
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* User */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center text-white font-light text-sm border border-gray-900">
              {user?.full_name?.[0] || 'U'}
            </div>
            <div>
              <p className="font-light text-sm text-white">{user?.full_name || 'User'}</p>
              <p className="text-xs text-gray-600">@{user?.username}</p>
            </div>
          </div>

          {/* Category */}
          <div className="mb-4">
            <button
              onClick={() => setShowCategoryPicker(!showCategoryPicker)}
              className="px-3 py-1.5 bg-gray-950 border border-gray-900 rounded-full hover:border-gray-800 transition-all flex items-center gap-2 text-sm"
            >
              <span className="text-base">{selectedCategory?.emoji}</span>
              <span className="font-light text-white">{selectedCategory?.value}</span>
            </button>

            {showCategoryPicker && (
              <div className="mt-2 border border-gray-900 bg-gray-950 rounded-xl overflow-hidden">
                <div className="grid grid-cols-5 gap-px bg-gray-900">
                  {POST_CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => {
                        setCategory(cat.value)
                        setShowCategoryPicker(false)
                      }}
                      className={`p-3 bg-gray-950 hover:bg-gray-900 transition-colors flex flex-col items-center gap-1 ${
                        category === cat.value ? 'bg-gray-900' : ''
                      }`}
                    >
                      <span className="text-xl">{cat.emoji}</span>
                      <span className="text-[10px] font-light text-gray-400">{cat.value}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Text Input */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening?"
            className="w-full bg-transparent text-white placeholder-gray-600 focus:outline-none resize-none font-light text-[15px] leading-snug min-h-[120px]"
            maxLength={1000}
          />

          {content.length > 0 && (
            <div className="flex justify-end mb-2">
              <p className={`text-xs font-light ${content.length > 800 ? 'text-yellow-500' : 'text-gray-600'}`}>
                {content.length}/1000
              </p>
            </div>
          )}

          {/* Images */}
          {images.length > 0 && (
            <div className={`grid gap-1 rounded-xl overflow-hidden mb-4 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {images.map((image, index) => (
                <div key={index} className="relative aspect-square group">
                  <img
                    src={image}
                    alt=""
                    className="w-full h-full object-cover bg-gray-950"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1.5 bg-black/80 rounded-full hover:bg-black transition-all opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4 text-white" strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {uploading && (
            <div className="flex items-center justify-center py-8 bg-gray-950 rounded-xl border border-gray-900 mb-4">
              <Loader className="w-5 h-5 text-white animate-spin mr-2" />
              <span className="text-sm text-gray-400 font-light">Uploading...</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-950 p-4 bg-black">
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
          className="p-2.5 bg-gray-950 border border-gray-900 rounded-full hover:bg-gray-900 hover:border-gray-800 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ImageIcon className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}
