import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, UserPlus, Loader, Users, Phone, MapPin, TrendingUp, Sparkles, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../lib/supabase'
import toast from 'react-hot-toast'

export default function AddFriendsRevamped() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [activeTab, setActiveTab] = useState('suggested') // 'suggested', 'search', 'following'
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState('username')
  const [searchResults, setSearchResults] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [searching, setSearching] = useState(false)
  const [loadingSuggestions, setLoadingSuggestions] = useState(true)
  const [actionLoading, setActionLoading] = useState({})
  const [dismissedSuggestions, setDismissedSuggestions] = useState(new Set())

  useEffect(() => {
    if (activeTab === 'suggested') {
      loadSuggestions()
    }
  }, [activeTab])

  const loadSuggestions = async () => {
    setLoadingSuggestions(true)
    try {
      // Get suggested users (this would be a smart algorithm in production)
      const { data, error } = await db.searchUsers('') // Get random users for now
      if (error) throw error
      
      // Filter out current user and add mock suggestion data
      const suggestedUsers = (data || [])
        .filter(u => u.id !== user?.id)
        .slice(0, 10)
        .map(u => ({
          ...u,
          suggestion_reason: getSuggestionReason(u),
          mutual_count: Math.floor(Math.random() * 15)
        }))
      
      setSuggestions(suggestedUsers)
    } catch (error) {
      console.error('Error loading suggestions:', error)
    } finally {
      setLoadingSuggestions(false)
    }
  }

  const getSuggestionReason = (user) => {
    const reasons = [
      'Similar interests',
      'Followed by people you follow',
      'Popular in your area',
      'New to TradeTalk',
      'Top advisor this week',
      'Similar investment style'
    ]
    return reasons[Math.floor(Math.random() * reasons.length)]
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setSearching(true)
    try {
      let data, error
      if (searchType === 'username') {
        ({ data, error } = await db.searchUsers(searchQuery.trim()))
      } else {
        ({ data, error } = await db.searchUsersByPhone(searchQuery.trim()))
      }

      if (error) throw error
      setSearchResults((data || []).filter(u => u.id !== user?.id))
      
      if (data?.length === 0) {
        toast.info('No users found')
      }
    } catch (error) {
      console.error('Error searching:', error)
      toast.error('Search failed')
    } finally {
      setSearching(false)
    }
  }

  const handleConnect = async (targetUser) => {
    if (!user) {
      toast.error('Please sign in')
      return
    }

    setActionLoading({ ...actionLoading, [targetUser.id]: true })

    try {
      const isTargetAdvisor = targetUser.user_type === 'advisor'
      
      if (isTargetAdvisor) {
        await db.followUser(user.id, targetUser.id)
        toast.success(`Following ${targetUser.full_name}! 🎉`)
      } else {
        await db.sendConnectionRequest(user.id, targetUser.id)
        toast.success(`Connection request sent! 📨`)
      }

      // Update UI
      if (activeTab === 'search') {
        setSearchResults(results => 
          results.map(r => r.id === targetUser.id ? { ...r, connected: true } : r)
        )
      } else {
        setSuggestions(suggs => 
          suggs.map(s => s.id === targetUser.id ? { ...s, connected: true } : s)
        )
      }
    } catch (error) {
      console.error('Error connecting:', error)
      if (error.code === '23505') {
        toast.error('Already connected')
      } else {
        toast.error('Failed to connect')
      }
    } finally {
      setActionLoading({ ...actionLoading, [targetUser.id]: false })
    }
  }

  const handleDismiss = (userId) => {
    setDismissedSuggestions(prev => new Set([...prev, userId]))
    toast('Suggestion dismissed', { icon: '👋' })
  }

  const renderUserCard = (user, isExpanded = false) => {
    const isAdvisor = user.user_type === 'advisor'
    const isDismissed = dismissedSuggestions.has(user.id)
    
    if (isDismissed) return null

    return (
      <div 
        key={user.id} 
        className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-all"
      >
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div 
            onClick={() => navigate(`/profile/${user.id}`)}
            className="flex-shrink-0 cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xl overflow-hidden">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                user.full_name?.[0] || 'U'
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div 
              onClick={() => navigate(`/profile/${user.id}`)}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-semibold text-gray-900 truncate">
                  {user.full_name}
                </h3>
                {isAdvisor && user.is_verified && (
                  <span className="text-blue-600 flex-shrink-0">✓</span>
                )}
              </div>
              <p className="text-sm text-gray-600 truncate mb-1">
                @{user.username}
              </p>
              
              {/* Bio or Tags */}
              {user.bio && (
                <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                  {user.bio}
                </p>
              )}

              {/* Advisor Badge */}
              {isAdvisor && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  <Sparkles className="w-3 h-3" />
                  SEBI Advisor
                </span>
              )}
            </div>

            {/* Suggestion Reason & Stats */}
            {isExpanded && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  {user.suggestion_reason && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>{user.suggestion_reason}</span>
                    </div>
                  )}
                  {user.mutual_count > 0 && (
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{user.mutual_count} mutual</span>
                    </div>
                  )}
                </div>
                
                {/* Mock recent post */}
                <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-700 italic">
                  "{isAdvisor ? 'Market looking strong today. Watch $RELIANCE for breakout.' : 'Just bought $AAPL at the dip. Bullish!'}"
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={() => handleConnect(user)}
                disabled={user.connected || actionLoading[user.id]}
                className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all ${
                  user.connected
                    ? 'bg-gray-200 text-gray-700 cursor-default'
                    : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                } disabled:opacity-50`}
              >
                {actionLoading[user.id] ? (
                  <Loader className="w-4 h-4 animate-spin mx-auto" />
                ) : user.connected ? (
                  <span className="flex items-center justify-center gap-1">
                    <Users className="w-4 h-4" />
                    {isAdvisor ? 'Following' : 'Connected'}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1">
                    <UserPlus className="w-4 h-4" />
                    {isAdvisor ? 'Follow' : 'Connect'}
                  </span>
                )}
              </button>
              
              {isExpanded && !user.connected && (
                <button
                  onClick={() => handleDismiss(user.id)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Add Friends</h1>
        </div>
        <UserPlus className="w-5 h-5 text-blue-600" />
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="flex gap-1">
          {[
            { id: 'suggested', label: 'Suggested', icon: Sparkles },
            { id: 'search', label: 'Search', icon: Search },
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 font-medium text-sm transition-all relative ${
                  activeTab === tab.id
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </div>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Search Tab Content */}
      {activeTab === 'search' && (
        <div className="bg-white border-b border-gray-200 p-4">
          {/* Search Type Toggle */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setSearchType('username')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                searchType === 'username'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                <Users className="w-4 h-4" />
                Username
              </div>
            </button>
            <button
              onClick={() => setSearchType('phone')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                searchType === 'phone'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                <Phone className="w-4 h-4" />
                Phone
              </div>
            </button>
          </div>

          {/* Search Input */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={searchType === 'phone' ? 'tel' : 'text'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={searchType === 'username' ? 'Search username or name...' : 'Enter phone number...'}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={!searchQuery.trim() || searching}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 transition-all active:scale-95"
            >
              {searching ? <Loader className="w-5 h-5 animate-spin" /> : 'Search'}
            </button>
          </div>

          {searchType === 'phone' && (
            <p className="mt-2 text-xs text-gray-500">
              💡 Only users who enabled phone search will appear
            </p>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'suggested' && (
          <div className="p-4">
            {/* Discovery Options */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button className="p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all text-left">
                <Phone className="w-5 h-5 text-blue-600 mb-2" />
                <div className="font-medium text-sm text-gray-900">From Contacts</div>
                <div className="text-xs text-gray-600">Find friends</div>
              </button>
              <button className="p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all text-left">
                <MapPin className="w-5 h-5 text-blue-600 mb-2" />
                <div className="font-medium text-sm text-gray-900">Near You</div>
                <div className="text-xs text-gray-600">Local investors</div>
              </button>
            </div>

            {/* Suggestions */}
            <div className="mb-2">
              <h2 className="text-base font-semibold text-gray-900 mb-3">
                Suggested For You
              </h2>
            </div>

            {loadingSuggestions ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                {suggestions.map(user => renderUserCard(user, true))}
              </div>
            )}

            {!loadingSuggestions && suggestions.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No suggestions at the moment</p>
                <button 
                  onClick={loadSuggestions}
                  className="mt-3 text-blue-600 text-sm font-medium"
                >
                  Refresh suggestions
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'search' && (
          <div className="p-4">
            {searching ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-3">
                {searchResults.map(user => renderUserCard(user, false))}
              </div>
            ) : searchQuery && !searching ? (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">
                  Try searching with a different {searchType === 'username' ? 'username' : 'phone number'}
                </p>
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Find Your Friends</h3>
                <p className="text-gray-600 mb-6">
                  Search for people using their username or phone number
                </p>
                <div className="space-y-3 text-sm text-gray-600 max-w-sm mx-auto text-left">
                  <div className="flex items-start gap-2">
                    <span>👤</span>
                    <p><strong>Follow Advisors:</strong> Get instant access to their insights</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>🤝</span>
                    <p><strong>Connect with Investors:</strong> Build your network</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
