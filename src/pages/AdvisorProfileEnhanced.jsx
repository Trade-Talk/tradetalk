import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader, MessageCircle, TrendingUp } from 'lucide-react'
import { db } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import AdvisorScorecard from '../components/reputation/AdvisorScorecard'
import AuditLog from '../components/reputation/AuditLog'
import SmartSignalCard from '../components/signals/SmartSignalCard'
import toast from 'react-hot-toast'

export default function AdvisorProfileEnhanced() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState(null)
  const [signals, setSignals] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('signals') // 'signals', 'stats', 'audit'
  const [isFollowing, setIsFollowing] = useState(false)

  useEffect(() => {
    loadAdvisorData()
  }, [id])

  const loadAdvisorData = async () => {
    try {
      // Load profile
      const { data: profileData, error: profileError } = await db.getUserProfile(id)
      if (profileError) throw profileError
      setProfile(profileData)

      // Load stats
      const { data: statsData } = await db.getAdvisorStats(id)
      setStats(statsData)

      // Load signals
      const { data: signalsData, error: signalsError } = await db.getSignalsByAdvisor(id, 50, 0)
      if (signalsError) throw signalsError
      setSignals(signalsData || [])

      // Check if following
      if (user) {
        const { data: followData } = await db.checkIfFollowing(user.id, id)
        setIsFollowing(!!followData)
      }
    } catch (error) {
      console.error('Error loading advisor data:', error)
      toast.error('Failed to load advisor profile')
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async () => {
    if (!user) {
      toast.error('Please sign in to follow advisors')
      return
    }

    try {
      if (isFollowing) {
        await db.unfollowUser(user.id, id)
        setIsFollowing(false)
        toast.success('Unfollowed')
      } else {
        await db.followUser(user.id, id)
        setIsFollowing(true)
        toast.success('Following!')
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
      toast.error('Failed to update follow status')
    }
  }

  const handleSignalDelete = (signalId) => {
    setSignals(signals.filter(s => s.id !== signalId))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white safe-area-top flex items-center justify-center">
        <Loader className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-white safe-area-top flex flex-col items-center justify-center p-6">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Advisor Not Found</h2>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium active:scale-95 transition-transform"
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white safe-area-top overflow-hidden flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 px-4 py-3 flex items-center sticky top-0 bg-white z-10">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full active:scale-95 transition-transform touch-manipulation"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 ml-2">
          {profile.full_name}
        </h1>
      </header>

      {/* Profile Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start space-x-4">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {profile.full_name?.[0] || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h2 className="text-xl font-bold text-gray-900">{profile.full_name}</h2>
              {profile.is_verified && (
                <span className="text-blue-500">✓</span>
              )}
            </div>
            <p className="text-gray-600">@{profile.username}</p>
            {profile.bio && (
              <p className="text-gray-700 mt-2">{profile.bio}</p>
            )}
            <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
              <span><strong className="text-gray-900">{profile.followers_count || 0}</strong> Followers</span>
              <span><strong className="text-gray-900">{profile.following_count || 0}</strong> Following</span>
              <span><strong className="text-gray-900">{signals.length}</strong> Signals</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-4">
          {user?.id !== id && (
            <>
              <button
                onClick={handleFollow}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all active:scale-95 touch-manipulation ${
                  isFollowing
                    ? 'bg-gray-200 text-gray-700'
                    : 'bg-primary-600 text-white'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
              <button
                onClick={() => navigate(`/chat/${id}`)}
                className="flex-1 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 active:scale-95 transition-all touch-manipulation flex items-center justify-center space-x-2"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Message</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 px-4 sticky top-[57px] bg-white z-10">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('signals')}
            className={`flex-1 py-3 font-medium transition-colors relative touch-manipulation ${
              activeTab === 'signals'
                ? 'text-primary-600'
                : 'text-gray-600'
            }`}
          >
            Signals
            {activeTab === 'signals' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-3 font-medium transition-colors relative touch-manipulation ${
              activeTab === 'stats'
                ? 'text-primary-600'
                : 'text-gray-600'
            }`}
          >
            Stats
            {activeTab === 'stats' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex-1 py-3 font-medium transition-colors relative touch-manipulation ${
              activeTab === 'audit'
                ? 'text-primary-600'
                : 'text-gray-600'
            }`}
          >
            Audit Log
            {activeTab === 'audit' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto pb-6">
        {activeTab === 'signals' && (
          <div className="divide-y divide-gray-200">
            {signals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <TrendingUp className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Signals Yet</h3>
                <p className="text-gray-600 text-center">
                  This advisor hasn't posted any signals yet.
                </p>
              </div>
            ) : (
              signals.map((signal) => (
                <div key={signal.id} className="p-4">
                  <SmartSignalCard 
                    signal={signal}
                    onDelete={handleSignalDelete}
                  />
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="p-4">
            <AdvisorScorecard advisor={{ ...profile, stats }} />
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="p-4">
            <AuditLog signals={signals} />
          </div>
        )}
      </div>
    </div>
  )
}
