import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Settings, UserPlus, UserMinus, Users, Loader, MessageCircle, Briefcase, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { db, authHelpers } from '../lib/supabase'
import PostCard from '../components/posts/PostCard'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [connectionRequest, setConnectionRequest] = useState(null)
  const [activeTab, setActiveTab] = useState('posts')
  const [loggingOut, setLoggingOut] = useState(false)

  const isOwnProfile = currentUser?.id === userId || (!userId && currentUser)
  const profileId = userId || currentUser?.id

  useEffect(() => {
    if (profileId) {
      loadProfile()
      loadPosts()
      if (!isOwnProfile) checkRelationship()
    }
  }, [profileId, isOwnProfile])

  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to log out?')) return

    setLoggingOut(true)
    try {
      const { error } = await authHelpers.signOut()
      if (error) throw error
      
      toast.success('Logged out successfully')
      navigate('/auth/welcome')
    } catch (error) {
      console.error('Error logging out:', error)
      toast.error('Failed to log out')
      setLoggingOut(false)
    }
  }

  const loadProfile = async () => {
    try {
      const { data, error } = await db.getUserProfile(profileId)
      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const loadPosts = async () => {
    try {
      const { data, error } = await db.getPostsByUser(profileId, 20, 0)
      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error('Error loading posts:', error)
    }
  }

  const checkRelationship = async () => {
    if (!currentUser || isOwnProfile) return

    try {
      const { data: followData } = await db.checkIfFollowing(currentUser.id, profileId)
      setIsFollowing(followData)

      if (currentUser.user_type === 'investor' && profile?.user_type === 'investor') {
        const { data: requestData } = await db.checkConnectionRequestExists(currentUser.id, profileId)
        setConnectionRequest(requestData)
      }
    } catch (error) {
      console.error('Error checking relationship:', error)
    }
  }

  const handleFollow = async () => {
    if (!currentUser) {
      toast.error('Please sign in')
      return
    }

    const isCurrentUserInvestor = currentUser.user_type === 'investor'
    const isTargetInvestor = profile.user_type === 'investor'
    const isTargetAdvisor = profile.user_type === 'advisor'

    if (isTargetAdvisor) {
      try {
        if (isFollowing) {
          await db.unfollowUser(currentUser.id, profileId)
          setIsFollowing(false)
          toast.success('Unfollowed')
        } else {
          await db.followUser(currentUser.id, profileId)
          setIsFollowing(true)
          toast.success('Following!')
        }
      } catch (error) {
        console.error('Error toggling follow:', error)
        toast.error('Failed to update')
      }
      return
    }

    if (isCurrentUserInvestor && isTargetInvestor) {
      if (connectionRequest) {
        toast.info('Connection request already sent')
        return
      }

      try {
        await db.sendConnectionRequest(currentUser.id, profileId)
        toast.success('Connection request sent!')
        setConnectionRequest({ status: 'pending' })
      } catch (error) {
        console.error('Error sending request:', error)
        toast.error('Failed to send request')
      }
      return
    }

    try {
      if (isFollowing) {
        await db.unfollowUser(currentUser.id, profileId)
        setIsFollowing(false)
        toast.success('Unfollowed')
      } else {
        await db.followUser(currentUser.id, profileId)
        setIsFollowing(true)
        toast.success('Following!')
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
      toast.error('Failed to update')
    }
  }

  const getActionButton = () => {
    if (isOwnProfile) return null

    const isCurrentUserInvestor = currentUser?.user_type === 'investor'
    const isTargetInvestor = profile?.user_type === 'investor'
    const isTargetAdvisor = profile?.user_type === 'advisor'

    if (isTargetAdvisor) {
      return (
        <button
          onClick={handleFollow}
          className={`px-6 py-2 text-sm font-medium transition-all duration-200 active:scale-[0.98] ${
            isFollowing
              ? 'border border-gray-900 text-white hover:bg-gray-950'
              : 'bg-white text-black hover:bg-gray-100'
          }`}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      )
    }

    if (isCurrentUserInvestor && isTargetInvestor) {
      if (isFollowing) {
        return (
          <button
            onClick={handleFollow}
            className="px-6 py-2 border border-gray-900 text-white text-sm font-medium hover:bg-gray-950 transition-all duration-200 active:scale-[0.98]"
          >
            Connected
          </button>
        )
      }

      if (connectionRequest?.status === 'pending') {
        return (
          <button
            disabled
            className="px-6 py-2 border border-gray-900 text-gray-500 text-sm font-medium cursor-not-allowed"
          >
            Request Sent
          </button>
        )
      }

      return (
        <button
          onClick={handleFollow}
          className="px-6 py-2 bg-white text-black text-sm font-medium hover:bg-gray-100 transition-all duration-200 active:scale-[0.98]"
        >
          Connect
        </button>
      )
    }

    return (
      <button
        onClick={handleFollow}
        className={`px-6 py-2 text-sm font-medium transition-all duration-200 active:scale-[0.98] ${
          isFollowing
            ? 'border border-gray-900 text-white hover:bg-gray-950'
            : 'bg-white text-black hover:bg-gray-100'
        }`}
      >
        {isFollowing ? 'Following' : 'Follow'}
      </button>
    )
  }

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <Loader className="w-6 h-6 text-white animate-spin" strokeWidth={1.5} />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center px-6">
        <h2 className="text-xl font-light text-white mb-4">Profile not found</h2>
        <button
          onClick={() => navigate('/')}
          className="text-gray-400 hover:text-white transition-colors"
        >
          Go back
        </button>
      </div>
    )
  }

  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* Premium Header */}
      <header className="border-b border-gray-950 px-6 py-4 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-white transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
        </button>
        <h1 className="text-base font-light">{profile.full_name}</h1>
        {isOwnProfile ? (
          <div className="flex items-center gap-4">
            {currentUser?.user_type === 'advisor' && (
              <button 
                onClick={() => navigate('/advisor-tools')}
                className="text-gray-500 hover:text-white transition-colors duration-200"
                title="Advisor Tools"
              >
                <Briefcase className="w-5 h-5" strokeWidth={1.5} />
              </button>
            )}
            <button 
              onClick={() => navigate('/add-friends')}
              className="text-gray-500 hover:text-white transition-colors duration-200"
              title="Add Friends"
            >
              <UserPlus className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <button 
              onClick={() => navigate('/settings')}
              className="text-gray-500 hover:text-white transition-colors duration-200"
              title="Settings"
            >
              <Settings className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <button 
              onClick={handleLogout}
              disabled={loggingOut}
              className="text-gray-500 hover:text-red-400 transition-colors duration-200 disabled:opacity-50"
              title="Log Out"
            >
              <LogOut className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
        ) : (
          <div className="w-5" />
        )}
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Profile Header */}
        <div className="px-6 py-8 border-b border-gray-950">
          {/* Avatar & Actions */}
          <div className="flex items-start justify-between mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center text-white text-3xl font-light border border-gray-900">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                profile.full_name?.[0] || 'U'
              )}
            </div>
            {!isOwnProfile && (
              <div className="flex items-center gap-3">
                {getActionButton()}
                <button className="p-2 border border-gray-900 hover:bg-gray-950 transition-colors duration-200">
                  <MessageCircle className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>
            )}
          </div>

          {/* Name & Bio - Improved contrast */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-light tracking-tight">{profile.full_name}</h2>
              {profile.user_type === 'advisor' && profile.is_verified && (
                <span className="text-white text-xl">✓</span>
              )}
            </div>
            <p className="text-gray-500 text-sm">@{profile.username}</p>
            {profile.user_type === 'advisor' && (
              <span className="inline-block mt-3 px-4 py-1.5 border border-gray-900 text-gray-400 text-xs font-light">
                Financial Advisor
              </span>
            )}
            {profile.bio && (
              <p className="mt-4 text-gray-400 text-sm font-light leading-relaxed">{profile.bio}</p>
            )}
          </div>

          {/* Stats - Improved contrast */}
          <div className="flex items-center gap-8 text-sm font-light">
            <button className="hover:text-gray-300 transition-colors duration-200">
              <span className="text-white">{profile.followers_count || 0}</span>
              <span className="text-gray-500"> Followers</span>
            </button>
            <button className="hover:text-gray-300 transition-colors duration-200">
              <span className="text-white">{profile.following_count || 0}</span>
              <span className="text-gray-500"> Following</span>
            </button>
            <div>
              <span className="text-white">{posts.length}</span>
              <span className="text-gray-500"> Posts</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-950 px-6 flex gap-8">
          <button
            onClick={() => setActiveTab('posts')}
            className={`py-4 text-sm font-light transition-colors duration-200 relative ${
              activeTab === 'posts' ? 'text-white' : 'text-gray-500 hover:text-gray-400'
            }`}
          >
            Posts
            {activeTab === 'posts' && (
              <div className="absolute bottom-0 left-0 right-0 h-px bg-white"></div>
            )}
          </button>
          {isOwnProfile && (
            <button
              onClick={() => setActiveTab('saved')}
              className={`py-4 text-sm font-light transition-colors duration-200 relative ${
                activeTab === 'saved' ? 'text-white' : 'text-gray-500 hover:text-gray-400'
              }`}
            >
              Saved
              {activeTab === 'saved' && (
                <div className="absolute bottom-0 left-0 right-0 h-px bg-white"></div>
              )}
            </button>
          )}
        </div>

        {/* Posts */}
        <div>
          {posts.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-gray-500 text-sm font-light">No posts yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-950">
              {posts.map((post) => (
                <div key={post.id} className="px-6 py-6 hover:bg-gray-950/50 transition-colors duration-200">
                  <PostCard post={post} onDelete={(id) => setPosts(posts.filter(p => p.id !== id))} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
