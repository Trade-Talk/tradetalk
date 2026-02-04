import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, UserPlus, Loader, Users, Phone, X, Sparkles } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../lib/supabase'
import toast from 'react-hot-toast'

export default function AddFriends() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [actionLoading, setActionLoading] = useState({})

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setSearching(true)
    try {
      const { data, error } = await db.searchUsers(searchQuery.trim())
      if (error) throw error
      
      setSearchResults((data || []).filter(u => u.id !== user?.id))
      
      if (data?.length === 0) {
        toast.info('No users found')
      }
    } catch (error) {
      console.error('Error:', error)
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
        await db.followUser(user.id, targetUser.id)
        toast.success(`Following ${targetUser.full_name}!`)
      } else if (isCurrentUserInvestor && isTargetInvestor) {
        await db.sendConnectionRequest(user.id, targetUser.id)
        toast.success(`Request sent to ${targetUser.full_name}!`)
      } else {
        await db.followUser(user.id, targetUser.id)
        toast.success(`Following ${targetUser.full_name}!`)
      }

      setSearchResults(results => 
        results.map(r => 
          r.id === targetUser.id ? { ...r, connected: true } : r
        )
      )
    } catch (error) {
      console.error('Error:', error)
      if (error.code === '23505') {
        toast.error('Already connected')
      } else {
        toast.error('Failed to connect')
      }
    } finally {
      setActionLoading({ ...actionLoading, [targetUser.id]: false })
    }
  }

  return (
    <div className="h-screen bg-black flex flex-col safe-area-top overflow-hidden">
      {/* Header */}
      <header className="border-b border-gray-950 px-4 py-3 flex items-center">
        <button 
          onClick={() => navigate(-1)}
          className="p-1.5 -ml-1.5 hover:bg-gray-950 rounded-full active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
        </button>
        <h1 className="text-base font-light text-white ml-2">Add Friends</h1>
      </header>

      {/* Search */}
      <div className="p-4 border-b border-gray-950">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600" strokeWidth={1.5} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search username..."
              className="w-full pl-10 pr-3 py-2.5 bg-gray-950 border border-gray-900 text-white placeholder-gray-600 rounded-full focus:outline-none focus:border-white transition-colors font-light text-sm"
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

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {searching ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-white animate-spin" />
          </div>
        ) : searchResults.length > 0 ? (
          <div className="divide-y divide-gray-950">
            {searchResults.map((result) => (
              <div key={result.id} className="p-4 hover:bg-gray-950 transition-colors">
                <div className="flex items-center justify-between">
                  <div 
                    className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
                    onClick={() => navigate(`/profile/${result.id}`)}
                  >
                    <div className="w-11 h-11 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center text-white font-light flex-shrink-0 border border-gray-900">
                      {result.avatar_url ? (
                        <img src={result.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-sm">{result.full_name?.[0] || 'U'}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-light text-white truncate text-sm">
                          {result.full_name}
                        </p>
                        {result.user_type === 'advisor' && result.is_verified && (
                          <span className="text-white flex-shrink-0 text-xs">✓</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 truncate font-light">@{result.username}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleConnect(result)}
                    disabled={result.connected || actionLoading[result.id]}
                    className={`ml-2 px-4 py-1.5 rounded-full font-medium transition-colors flex-shrink-0 text-sm ${
                      result.connected
                        ? 'bg-gray-950 text-gray-600 cursor-default border border-gray-900'
                        : 'bg-white text-black hover:bg-gray-100 active:scale-95'
                    } disabled:opacity-50`}
                  >
                    {actionLoading[result.id] ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : result.connected ? (
                      'Following'
                    ) : (
                      'Follow'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : searchQuery && !searching ? (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className="w-20 h-20 bg-gray-950 rounded-full flex items-center justify-center mb-4">
              <Search className="w-10 h-10 text-gray-600" strokeWidth={1.5} />
            </div>
            <h3 className="text-base font-light text-white mb-1">No results</h3>
            <p className="text-gray-600 text-center font-light text-sm">
              Try a different username
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className="w-20 h-20 bg-gray-950 rounded-full flex items-center justify-center mb-4">
              <Users className="w-10 h-10 text-gray-600" strokeWidth={1.5} />
            </div>
            <h3 className="text-base font-light text-white mb-2">Find People</h3>
            <p className="text-gray-600 text-center font-light text-sm">
              Search for friends to follow
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
