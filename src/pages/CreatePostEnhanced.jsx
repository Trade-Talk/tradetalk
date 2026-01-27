import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Image as ImageIcon, X, Loader, TrendingUp, MessageSquare } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { db, storage } from '../lib/supabase'
import CreateSignalForm from '../components/signals/CreateSignalForm'
import toast from 'react-hot-toast'

export default function CreatePostEnhanced() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const fileInputRef = useRef(null)

  // Post type selection
  const [postType, setPostType] = useState('regular') // 'regular' or 'signal'

  // Regular post state
  const [content, setContent] = useState('')
  const [images, setImages] = useState([])
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

  const handlePostRegular = async () => {
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
        post_type: 'regular'
      })

      if (error) throw error

      toast.success('Post created!')
      navigate('/')
    } catch (error) {
      console.error('Error creating post:', error)
      toast.error('Failed to create post')
    } finally {
      setPosting(false)
    }
  }

  const handlePostSignal = async (signalData) => {
    setPosting(true)

    try {
      // Create signal in database
      const { error } = await db.createSignal({
        ...signalData,
        advisor_id: user.id
      })

      if (error) throw error

      toast.success('Signal posted!')
      navigate('/')
    } catch (error) {
      console.error('Error creating signal:', error)
      toast.error('Failed to post signal')
    } finally {
      setPosting(false)
    }
  }

  // Check if user is advisor
  const isAdvisor = user?.user_type === 'advisor'

  return (
    <div className="h-screen bg-white flex flex-col safe-area-top overflow-hidden">
      {/* Header */}
      <header className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full active:scale-95 transition-transform touch-manipulation"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">
          {postType === 'signal' ? 'Create Signal' : 'Create Post'}
        </h1>
        <button
          onClick={postType === 'signal' ? undefined : handlePostRegular}
          disabled={postType === 'signal' || (!content.trim() && images.length === 0) || posting}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform touch-manipulation"
        >
          {posting ? 'Posting...' : 'Post'}
        </button>
      </header>

      {/* Post Type Selector (only for advisors) */}
      {isAdvisor && (
        <div className="border-b border-gray-200 px-4 py-3">
          <div className="flex space-x-2">
            <button
              onClick={() => setPostType('regular')}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all touch-manipulation ${
                postType === 'regular'
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-gray-200 text-gray-600'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="font-medium">Regular Post</span>
            </button>
            <button
              onClick={() => setPostType('signal')}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all touch-manipulation ${
                postType === 'signal'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                  : 'border-gray-200 text-gray-600'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">Trading Signal</span>
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {postType === 'regular' ? (
          <div className="p-4">
            {/* User Info */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.full_name?.[0] || user?.username?.[0] || 'U'}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{user?.full_name || 'User'}</p>
                <p className="text-sm text-gray-500">@{user?.username}</p>
              </div>
            </div>

            {/* Text Input */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full min-h-[200px] text-lg resize-none focus:outline-none"
              autoFocus
            />

            {/* Image Preview */}
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                {images.map((image, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={image}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors touch-manipulation"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {uploading && (
              <div className="flex items-center justify-center py-8">
                <Loader className="w-6 h-6 text-primary-600 animate-spin" />
                <span className="ml-2 text-gray-600">Uploading images...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4">
            <CreateSignalForm 
              onSubmit={handlePostSignal}
              onCancel={() => setPostType('regular')}
            />
          </div>
        )}
      </div>

      {/* Bottom Actions (only for regular posts) */}
      {postType === 'regular' && (
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center space-x-4">
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
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 active:scale-95 transition-all touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ImageIcon className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">Add Photos</span>
            </button>
            {images.length > 0 && (
              <span className="text-sm text-gray-500">{images.length}/4 images</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
