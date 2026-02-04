import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Settings, UserPlus, UserCheck, Loader, TrendingUp, TrendingDown } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { db, formatNumber } from '../lib/supabase-mvp'
import PostCardMVP from '../components/posts/PostCardMVP'
import toast from 'react-hot-toast'

export default function ProfilePageMVP() {
  const { username } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)

  const isOwnProfile = user?.username === username

  useEffect(() => {
    loadProfile()
  }, [username])

  const loadProfile = async () => {
    try {
      // Get profile data
      const { data: profileData, error: profileError } = await db.getUserProfileByUsername(username)
      if (profileError) throw profileError
      
      setProfile(profileData)

      // Get user stats
      const { data: statsData } = await db.getUserStats(profileData.id)
      setStats(statsData)

      // Get user posts
      const { data: postsData, error: postsError } = await db.getPostsByUser(profileData.id, 20, 0)
      if (postsError) throw postsError
      
      setPosts(postsData || [])

      // Check if following
      if (user && !isOwnProfile) {
        const following = await db.checkIfFollowing(user.id, profileData.id)
        setIsFollowing(following)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async () => {
    if (!user) {
      toast.error('Please sign in to follow users')
      return
    }

    setFollowLoading(true)
    try {
      if (isFollowing) {
        await db.unfollowUser(user.id, profile.id)
        setIsFollowing(false)
        toast.success(`Unfollowed @${username}`)
      } else {
        await db.followUser(user.id, profile.id)
        setIsFollowing(true)
        toast.success(`Following @${username}`)
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
      toast.error('Failed to update follow status')
    } finally {
      setFollowLoading(false)
    }
  }

  const handlePostDelete = (postId) => {
    setPosts(posts.filter(p => p.id !== postId))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
        <p className="text-gray-600 mb-4">User not found</p>
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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Profile</h1>
        {isOwnProfile && (
          <button 
            onClick={() => navigate('/settings')}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <Settings className="w-5 h-5 text-gray-700" />
          </button>
        )}
      </header>

      {/* Profile Info */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          {/* Avatar */}
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.username} className="w-full h-full rounded-full object-cover" />
            ) : (
              profile.username?.[0]?.toUpperCase() || 'U'
            )}
          </div>

          {/* Follow/Edit Button */}
          {!isOwnProfile && (
            <button
              onClick={handleFollow}
              disabled={followLoading}
              className={`
                px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50
                ${isFollowing 
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                }
              `}
            >
              {followLoading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : isFollowing ? (
                <>
                  <UserCheck className="w-5 h-5 inline mr-1" />
                  Following
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5 inline mr-1" />
                  Follow
                </>
              )}
            </button>
          )}
        </div>

        {/* Name & Username */}
        <div className="mb-3">
          <h2 className="text-xl font-bold text-gray-900">
            {profile.full_name || profile.username}
          </h2>
          <p className="text-gray-600">@{profile.username}</p>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-gray-700 mb-4">{profile.bio}</p>
        )}

        {/* Stats Row */}
        <div className="flex items-center gap-6 text-sm">
          <div>
            <span className="font-bold text-gray-900">{formatNumber(profile.total_posts || 0)}</span>
            <span className="text-gray-600 ml-1">Posts</span>
          </div>
          <div>
            <span className="font-bold text-gray-900">{formatNumber(profile.follower_count || 0)}</span>
            <span className="text-gray-600 ml-1">Followers</span>
          </div>
          <div>
            <span className="font-bold text-gray-900">{formatNumber(profile.following_count || 0)}</span>
            <span className="text-gray-600 ml-1">Following</span>
          </div>
        </div>

        {/* Streak */}
        {profile.streak > 0 && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="text-sm font-semibold text-orange-900">{profile.streak} day streak</p>
              <p className="text-xs text-orange-700">Keep posting daily!</p>
            </div>
          </div>
        )}
      </div>

      {/* Performance Stats */}
      {stats && (
        <div className="bg-white border-b border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
            Performance
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Total Upvotes */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {formatNumber(stats.total_upvotes_received || 0)}
              </div>
              <div className="text-sm text-gray-600">Total Upvotes</div>
            </div>

            {/* Reputation */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {stats.reputation_score || 0}
              </div>
              <div className="text-sm text-gray-600">Reputation</div>
            </div>

            {/* Best Call */}
            {stats.best_call_percentage !== null && stats.best_call_percentage > 0 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <div className="text-2xl font-bold text-green-900">
                    +{stats.best_call_percentage.toFixed(1)}%
                  </div>
                </div>
                <div className="text-sm text-green-700">Best Call</div>
              </div>
            )}

            {/* Worst Call */}
            {stats.worst_call_percentage !== null && stats.worst_call_percentage < 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  <div className="text-2xl font-bold text-red-900">
                    {stats.worst_call_percentage.toFixed(1)}%
                  </div>
                </div>
                <div className="text-sm text-red-700">Worst Call</div>
              </div>
            )}

            {/* Avg Performance */}
            {stats.avg_stock_performance !== null && (
              <div className={`p-4 rounded-lg ${
                stats.avg_stock_performance >= 0 
                  ? 'bg-blue-50 border border-blue-200' 
                  : 'bg-gray-50 border border-gray-200'
              }`}>
                <div className={`text-2xl font-bold ${
                  stats.avg_stock_performance >= 0 ? 'text-blue-900' : 'text-gray-900'
                }`}>
                  {stats.avg_stock_performance >= 0 ? '+' : ''}
                  {stats.avg_stock_performance.toFixed(1)}%
                </div>
                <div className={`text-sm ${
                  stats.avg_stock_performance >= 0 ? 'text-blue-700' : 'text-gray-600'
                }`}>
                  Avg Performance
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Posts */}
      <div className="bg-white">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Posts ({posts.length})
          </h3>
        </div>
        
        {posts.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-600">No posts yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {posts.map(post => (
              <PostCardMVP
                key={post.id}
                post={post}
                onDelete={handlePostDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
