import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, UserPlus, Loader, Users, Phone } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../lib/supabase'
import toast from 'react-hot-toast'

export default function AddFriends() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState('username') // 'username' or 'phone'
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [actionLoading, setActionLoading] = useState({})

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
      
      // Filter out current user
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
      const isCurrentUserInvestor = user.user_type === 'investor'
      const isTargetInvestor = targetUser.user_type === 'investor'
      const isTargetAdvisor = targetUser.user_type === 'advisor'

      // Anyone can follow advisors directly
      if (isTargetAdvisor) {
        await db.followUser(user.id, targetUser.id)
        toast.success(`Following ${targetUser.full_name}!`)
      }
      // Investor-to-Investor needs connection request
      else if (isCurrentUserInvestor && isTargetInvestor) {
        await db.sendConnectionRequest(user.id, targetUser.id)
        toast.success(`Connection request sent to ${targetUser.full_name}!`)
      }
      // Default - direct follow
      else {
        await db.followUser(user.id, targetUser.id)
        toast.success(`Following ${targetUser.full_name}!`)
      }

      // Update UI to show connected state
      setSearchResults(results => 
        results.map(r => 
          r.id === targetUser.id ? { ...r, connected: true } : r
        )
      )
    } catch (error) {
      console.error('Error connecting:', error)
      if (error.code === '23505') {
        toast.error('Already connected or request pending')
      } else {
        toast.error('Failed to connect')
      }
    } finally {
      setActionLoading({ ...actionLoading, [targetUser.id]: false })
    }
  }

  const getButtonText = (targetUser) => {
    const isTargetAdvisor = targetUser.user_type === 'advisor'
    const isCurrentUserInvestor = user?.user_type === 'investor'
    const isTargetInvestor = targetUser.user_type === 'investor'

    if (targetUser.connected) {
      return isCurrentUserInvestor && isTargetInvestor ? 'Connected' : 'Following'
    }

    if (isTargetAdvisor) {
      return 'Follow'
    }

    if (isCurrentUserInvestor && isTargetInvestor) {
      return 'Connect'
    }

    return 'Follow'
  }

  return (
    <div className="h-screen bg-white flex flex-col safe-area-top overflow-hidden">
      {/* Header */}
      <header className="border-b border-gray-200 px-4 py-3 flex items-center">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full active:scale-95 transition-transform touch-manipulation"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 ml-2">Add Friends</h1>
      </header>

      {/* Search Type Toggle */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setSearchType('username')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors touch-manipulation ${
              searchType === 'username'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Search className="w-4 h-4" />
              <span>Username</span>
            </div>
          </button>
          <button
            onClick={() => setSearchType('phone')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors touch-manipulation ${
              searchType === 'phone'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Phone className="w-4 h-4" />
              <span>Phone</span>
            </div>
          </button>
        </div>

        {/* Search Input */}
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={searchType === 'phone' ? 'tel' : 'text'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={searchType === 'username' ? 'Search by username or name...' : 'Enter phone number...'}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={!searchQuery.trim() || searching}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform touch-manipulation"
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

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto">
        {searching ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-primary-600 animate-spin" />
          </div>
        ) : searchResults.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {searchResults.map((result) => (
              <div key={result.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div 
                    className="flex items-center space-x-3 flex-1 min-w-0 cursor-pointer"
                    onClick={() => navigate(`/profile/${result.id}`)}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {result.avatar_url ? (
                        <img src={result.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        result.full_name?.[0] || 'U'
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold text-gray-900 truncate">
                          {result.full_name}
                        </p>
                        {result.user_type === 'advisor' && result.is_verified && (
                          <span className="text-primary-600 flex-shrink-0" title="Verified Advisor">✓</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">@{result.username}</p>
                      {result.user_type === 'advisor' && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded">
                          Advisor
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleConnect(result)}
                    disabled={result.connected || actionLoading[result.id]}
                    className={`ml-3 px-4 py-2 rounded-lg font-medium transition-colors touch-manipulation flex-shrink-0 ${
                      result.connected
                        ? 'bg-gray-200 text-gray-700 cursor-default'
                        : 'bg-primary-600 text-white hover:bg-primary-700 active:scale-95'
                    } disabled:opacity-50`}
                  >
                    {actionLoading[result.id] ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : result.connected ? (
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{getButtonText(result)}</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1">
                        <UserPlus className="w-4 h-4" />
                        <span>{getButtonText(result)}</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : searchQuery && !searching ? (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600 text-center">
              Try searching with a different {searchType === 'username' ? 'username' : 'phone number'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Find Friends</h3>
            <p className="text-gray-600 text-center mb-6">
              Search for friends using their username or phone number
            </p>
            <div className="space-y-2 text-sm text-gray-600 w-full max-w-sm">
              <div className="flex items-start space-x-2">
                <span>👤</span>
                <p><strong>Follow Advisors:</strong> Get instant access to their insights</p>
              </div>
              <div className="flex items-start space-x-2">
                <span>🤝</span>
                <p><strong>Connect with Investors:</strong> Send connection requests to other investors</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
