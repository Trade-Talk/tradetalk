import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal,
  Shield,
  Lock,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import InlineStockChart from './InlineStockChart'

export default function PostCard({ post }) {
  const [isLiked, setIsLiked] = useState(post.isLiked)
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked)
  const [likes, setLikes] = useState(post.likes)

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikes(isLiked ? likes - 1 : likes + 1)
  }

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
  }

  const renderStockSymbols = () => {
    if (!post.stockSymbols || post.stockSymbols.length === 0) return null
    
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {post.stockSymbols.map((symbol) => (
          <Link
            key={symbol}
            to={`/stock/${symbol}`}
            className="px-2.5 py-1 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium active:bg-primary-100 transition-colors"
          >
            ${symbol}
          </Link>
        ))}
      </div>
    )
  }

  return (
    <article className="post-card">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <Link 
          to={`/advisor/${post.author.id}`}
          className="flex items-start space-x-3 flex-1 active:opacity-70 transition-opacity"
        >
          {/* Avatar */}
          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-sm">
              {post.author.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          
          {/* Author info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1.5">
              <span className="font-semibold text-gray-900 text-sm truncate">
                {post.author.name}
              </span>
              {post.author.isVerified && (
                <Shield className="w-4 h-4 text-primary-600 flex-shrink-0" fill="currentColor" />
              )}
              {post.isPremium && (
                <Lock className="w-3.5 h-3.5 text-warning-600 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span className="truncate">{post.author.username}</span>
              {post.author.isAdvisor && post.author.specialty && (
                <>
                  <span>•</span>
                  <span className="truncate">{post.author.specialty}</span>
                </>
              )}
              <span>•</span>
              <span className="whitespace-nowrap">
                {formatDistanceToNow(post.timestamp, { addSuffix: true })}
              </span>
            </div>
          </div>
        </Link>
        
        {/* More button */}
        <button className="p-1.5 -mr-1.5 hover:bg-gray-100 rounded-full active:scale-95 transition-transform touch-manipulation">
          <MoreHorizontal className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <Link to={`/post/${post.id}`} className="block active:opacity-70 transition-opacity">
        <p className="text-gray-900 text-[15px] leading-relaxed whitespace-pre-wrap break-words">
          {post.content}
        </p>
        
        {/* Stock symbols */}
        {renderStockSymbols()}
        
        {/* Stock Charts (if post has stocks with price data) */}
        {post.stocks && post.stocks.length > 0 && (
          <div className="mt-3 space-y-3">
            {post.stocks.map((stock, index) => (
              <InlineStockChart
                key={`${stock.symbol}-${index}`}
                stock={stock}
                postTimestamp={post.timestamp}
                priceAtPost={stock.priceAtPost || stock.price}
              />
            ))}
          </div>
        )}
        
        {/* Images (if any) */}
        {post.images && post.images.length > 0 && (
          <div className="mt-3 rounded-xl overflow-hidden">
            <img 
              src={post.images[0]} 
              alt="Post content" 
              className="w-full h-auto"
            />
          </div>
        )}
      </Link>

      {/* Engagement bar */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <button 
          onClick={handleLike}
          className="flex items-center space-x-1.5 px-2 py-1.5 -mx-2 hover:bg-gray-50 rounded-lg active:scale-95 transition-all touch-manipulation"
        >
          <Heart 
            className={`w-5 h-5 transition-colors ${
              isLiked ? 'fill-danger-500 text-danger-500' : 'text-gray-600'
            }`}
          />
          <span className={`text-sm font-medium ${isLiked ? 'text-danger-500' : 'text-gray-600'}`}>
            {likes}
          </span>
        </button>

        <Link
          to={`/post/${post.id}`}
          className="flex items-center space-x-1.5 px-2 py-1.5 hover:bg-gray-50 rounded-lg active:scale-95 transition-all touch-manipulation"
        >
          <MessageCircle className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-600">{post.comments}</span>
        </Link>

        <button className="flex items-center space-x-1.5 px-2 py-1.5 hover:bg-gray-50 rounded-lg active:scale-95 transition-all touch-manipulation">
          <Share2 className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-600">{post.shares}</span>
        </button>

        <button 
          onClick={handleBookmark}
          className="p-1.5 hover:bg-gray-50 rounded-lg active:scale-95 transition-all touch-manipulation"
        >
          <Bookmark 
            className={`w-5 h-5 transition-colors ${
              isBookmarked ? 'fill-primary-600 text-primary-600' : 'text-gray-600'
            }`}
          />
        </button>
      </div>
    </article>
  )
}
