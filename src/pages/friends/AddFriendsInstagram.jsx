import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, Loader, Users, UserPlus, Check } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../lib/supabase'
import toast from 'react-hot-toast'

export default function AddFriendsInstagram() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [activeTab, setActiveTab] = useState('suggested')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [searching, setSearching] = useState(false)
  const [loadingSuggestions, setLoadingSuggestions] = useState(true)
  const [actionLoading, setActionLoading] = useState({})
  const [connectionStates, setConnectionStates] = useState({})

  useEffect(() => {
    loadSuggestions()
  }, [])

  useEffect(() => {
    if (searchResults.length > 0) {
      checkConnectionStates(searchResults)
    }
  }, [searchResults])

  useEffect(() => {
    if (suggestions.length > 0) {
      checkConnectionStates(suggestions)
    }
  }, [suggestions])

  const checkConnectionStates = async (users) => {
    const states = {}
    for (const targetUser of users) {
      try {
        const { data: isFollowing } = await db.checkIfFollowing(user.id, targetUser.id)
        const { data: requestData } = await db.checkConnectionRequestExists(user.id, targetUser.id)
        
        states[targetUser.id] = {
          isFollowing: isFollowing || false,
          hasPendingRequest: requestData?.status === 'pending' || false
        }
      } catch (error) {
        states[targetUser.id] = { isFollowing: false, hasPendingRequest: false }
      }
    }
    setConnectionStates(prev => ({ ...prev, ...states }))
  }

  const loadSuggestions = async () => {
    setLoadingSuggestions(true)
    try {
      const { data, error } = await db.getSuggestedUsers(user?.id)
      if (error) throw error
      setSuggestions(data || [])
    } catch (error) {
      console.error('Error loading suggestions:', error)
    } finally {
      setLoadingSuggestions(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setSearching(true)
    setConnectionStates({})
    
    try {
      const { data, error } = await db.searchUsers(searchQuery.trim())
      if (error) throw error
      
      const filteredResults = (data || []).filter(u => u.id !== user?.id)
      setSearchResults(filteredResults)
      
      if (filteredResults.length === 0) {
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
      const isCurrentUserInvestor = user.user_type === 'investor'
      const isTargetInvestor = targetUser.user_type === 'investor'

      if (isTargetAdvisor) {
        const { error } = await db.followUser(user.id, targetUser.id)
        if (error) throw error
        
        toast.success(`Following ${targetUser.full_name}!`)
        setConnectionStates({
          ...connectionStates,
          [targetUser.id]: { isFollowing: true, hasPendingRequest: false }
        })
      } else if (isCurrentUserInvestor && isTargetInvestor) {
        const { error } = await db.sendConnectionRequest(user.id, targetUser.id)
        if (error) {
          if (error.code === '23505') {
            toast.error('Request already sent')
          } else {
            throw error
          }
        } else {
          toast.success(`Request sent to ${targetUser.full_name}!`)
          setConnectionStates({
            ...connectionStates,
            [targetUser.id]: { isFollowing: false, hasPendingRequest: true }
          })
        }
      } else {
        const { error } = await db.followUser(user.id, targetUser.id)
        if (error) throw error
        
        toast.success(`Following ${targetUser.full_name}!`)
        setConnectionStates({
          ...connectionStates,
          [targetUser.id]: { isFollowing: true, hasPendingRequest: false }
        })
      }
    } catch (error) {
      console.error('Error connecting:', error)
      toast.error('Failed to connect')
    } finally {
      setActionLoading({ ...actionLoading, [targetUser.id]: false })
    }
  }

  const getButtonState = (userId) => {
    const state = connectionStates[userId]
    if (!state) return { text: 'Follow', disabled: false, variant: 'primary' }
    
    if (state.isFollowing) {
      return { text: 'Following', disabled: true, variant: 'secondary' }
    }
    if (state.hasPendingRequest) {
      return { text: 'Requested', disabled: true, variant: 'secondary' }
    }
    return { text: 'Follow', disabled: false, variant: 'primary' }
  }

  const UserCard = ({ user: targetUser }) => {
    const buttonState = getButtonState(targetUser.id)
    const isLoading = actionLoading[targetUser.id]
    
    return (
      <div className="p-4 hover:bg-gray-950 transition-colors">
        <div className="flex items-center justify-between gap-3">
          <div 
            className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
            onClick={() => navigate(`/profile/${targetUser.id}`)}
          >
            <div className="w-11 h-11 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center text-white font-light flex-shrink-0 border border-gray-900">
              {targetUser.avatar_url ? (
                <img src={targetUser.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-sm">{targetUser.full_name?.[0] || 'U'}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-light text-white truncate text-sm">
                  {targetUser.full_name}
                </p>
                {targetUser.user_type === 'advisor' && targetUser.is_verified && (
                  <span className="text-white flex-shrink-0 text-xs">✓</span>
                )}
              </div>
              <p className="text-xs text-gray-600 truncate font-light">@{targetUser.username}</p>
              {targetUser.bio && (
                <p className="text-xs text-gray-500 truncate font-light mt-0.5">{targetUser.bio}</p>
              )}
            </div>
          </div>
          
          <button
            onClick={() => handleConnect(targetUser)}
            disabled={buttonState.disabled || isLoading}
            className={`ml-2 px-4 py-1.5 rounded-full font-medium transition-all flex-shrink-0 text-sm flex items-center gap-1.5 ${
              buttonState.variant === 'secondary'
                ? 'bg-gray-950 text-gray-500 cursor-default border border-gray-900'
                : 'bg-white text-black hover:bg-gray-100 active:scale-95'
            } disabled:opacity-50`}
          >
            {isLoading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : buttonState.variant === 'secondary' ? (
              <>
                <Check className="w-4 h-4" strokeWidth={2} />
                <span>{buttonState.text}</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" strokeWidth={1.5} />
                <span>{buttonState.text}</span>
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-black flex flex-col safe-area-top overflow-hidden">
      {/* Header */}
      <header className="border-b border-gray-950 px-4 py-3 flex items-center gap-3">
        <button 
          onClick={() => navigate(-1)}
          className="p-1.5 -ml-1.5 hover:bg-gray-950 rounded-full active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
        </button>
        <h1 className="text-base font-light text-white">Find People</h1>
      </header>

      {/* Tabs */}
      <div className="border-b border-gray-950 px-4">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('suggested')}
            className={`py-3 font-light text-sm relative transition-colors ${
              activeTab === 'suggested' ? 'text-white' : 'text-gray-600'
            }`}
          >
            Suggested
            {activeTab === 'suggested' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`py-3 font-light text-sm relative transition-colors ${
              activeTab === 'search' ? 'text-white' : 'text-gray-600'
            }`}
          >
            Search
            {activeTab === 'search' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'suggested' ? (
          <div>
            {loadingSuggestions ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-8 h-8 text-white animate-spin" />
              </div>
            ) : suggestions.length > 0 ? (
              <div className="divide-y divide-gray-950">
                {suggestions.map((suggestion) => (
                  <UserCard key={suggestion.id} user={suggestion} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <div className="w-20 h-20 bg-gray-950 rounded-full flex items-center justify-center mb-4 border border-gray-900">
                  <Users className="w-10 h-10 text-gray-600" strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-light text-white mb-2">No suggestions yet</h3>
                <p className="text-gray-600 text-center font-light text-sm max-w-xs">
                  Try searching for people to connect with
                </p>
                <button
                  onClick={() => setActiveTab('search')}
                  className="mt-4 px-6 py-2.5 bg-white text-black rounded-full font-medium text-sm hover:bg-gray-100 active:scale-95"
                >
                  Search Users
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Search Bar */}
            <div className="p-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600" strokeWidth={1.5} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search by name or username..."
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-950 border border-gray-900 text-white placeholder-gray-600 rounded-full focus:outline-none focus:border-gray-700 transition-colors font-light text-sm"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={!searchQuery.trim() || searching}
                  className="px-5 py-2.5 bg-white text-black rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform text-sm"
                >
                  {searching ? <Loader className="w-4 h-4 animate-spin" /> : 'Search'}
                </button>
              </div>
            </div>

            {/* Search Results */}
            {searching ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-8 h-8 text-white animate-spin" />
              </div>
            ) : searchResults.length > 0 ? (
              <div className="divide-y divide-gray-950">
                {searchResults.map((result) => (
                  <UserCard key={result.id} user={result} />
                ))}
              </div>
            ) : searchQuery && !searching ? (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <div className="w-20 h-20 bg-gray-950 rounded-full flex items-center justify-center mb-4 border border-gray-900">
                  <Search className="w-10 h-10 text-gray-600" strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-light text-white mb-1">No results found</h3>
                <p className="text-gray-600 text-center font-light text-sm">
                  Try searching for a different name or username
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <div className="w-20 h-20 bg-gray-950 rounded-full flex items-center justify-center mb-4 border border-gray-900">
                  <Search className="w-10 h-10 text-gray-600" strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-light text-white mb-2">Discover People</h3>
                <p className="text-gray-600 text-center font-light text-sm max-w-xs">
                  Search for traders, investors, and advisors to connect with
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
