import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Users, AlertCircle, CheckSquare,
  TrendingDown, Search, RefreshCw, X, Loader, UserPlus
} from 'lucide-react'
import { db } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function AdvisorDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showAddClient, setShowAddClient] = useState(false)
  const [addingClient, setAddingClient] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [clientSearchQuery, setClientSearchQuery] = useState('')
  
  const [clients, setClients] = useState([])
  const [clientsNeedingAttention, setClientsNeedingAttention] = useState([])
  const [actionItems, setActionItems] = useState([])
  const [stats, setStats] = useState({
    totalClients: 0,
    needingAttention: 0,
    pendingActions: 0,
    reviewedToday: 0
  })

  const [selectedFilter, setSelectedFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadDashboard()
  }, [user])

  const loadDashboard = async () => {
    if (!user?.id) return

    try {
      setLoading(true)

      const [clientsResult, attentionResult, actionsResult] = await Promise.all([
        db.getAdvisorClients(user.id),
        db.getClientsNeedingAttention(user.id, 10),
        db.getActionItems(user.id)
      ])

      setClients(clientsResult.data || [])
      setClientsNeedingAttention(attentionResult.data || [])
      setActionItems(actionsResult.data || [])

      const today = new Date().toDateString()
      const reviewedToday = (clientsResult.data || []).filter(c => 
        c.last_reviewed_at && new Date(c.last_reviewed_at).toDateString() === today
      ).length

      setStats({
        totalClients: clientsResult.data?.length || 0,
        needingAttention: attentionResult.data?.length || 0,
        pendingActions: actionsResult.data?.length || 0,
        reviewedToday
      })

    } catch (error) {
      console.error('Error loading dashboard:', error)
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await db.recalculateAllClientHealth(user.id)
      await loadDashboard()
      toast.success('Dashboard refreshed')
    } catch (error) {
      console.error('Error refreshing:', error)
      toast.error('Failed to refresh')
    } finally {
      setRefreshing(false)
    }
  }

  const handleMarkReviewed = async (clientId) => {
    try {
      await db.markClientReviewed(user.id, clientId)
      await loadDashboard()
      toast.success('Marked as reviewed')
    } catch (error) {
      console.error('Error marking reviewed:', error)
      toast.error('Failed to mark as reviewed')
    }
  }

  const handleCompleteAction = async (actionId) => {
    try {
      await db.completeActionItem(actionId)
      await loadDashboard()
      toast.success('Action completed')
    } catch (error) {
      console.error('Error completing action:', error)
      toast.error('Failed to complete action')
    }
  }

  const handleSearchClients = async (query) => {
    setClientSearchQuery(query)
    if (!query || query.length < 2) {
      setSearchResults([])
      return
    }

    try {
      const { data, error } = await db.searchUsers(query)
      if (error) throw error
      
      // Filter out users who are already clients
      const existingClientIds = clients.map(c => c.client_id)
      const filtered = (data || []).filter(u => {
        if (existingClientIds.includes(u.id)) return false
        if (u.id === user.id) return false
        return true
      })
      
      setSearchResults(filtered)
    } catch (error) {
      console.error('Error searching users:', error)
      toast.error('Failed to search users')
    }
  }

  const handleAddClient = async (clientUser) => {
    try {
      setAddingClient(true)
      
      const existingClient = clients.find(c => c.client_id === clientUser.id)
      if (existingClient) {
        toast.error('This client is already in your list')
        return
      }
      
      const { data, error } = await db.addAdvisorClient(user.id, clientUser.id, {
        priority: 1,
        tags: []
      })
      
      if (error) {
        if (error.code === '23505') {
          toast.error('This client is already in your list')
        } else if (error.code === '23503') {
          toast.error('User not found')
        } else {
          toast.error(error.message || 'Failed to add client')
        }
        return
      }
      
      toast.success(`Added ${clientUser.full_name} as client`)
      setShowAddClient(false)
      setClientSearchQuery('')
      setSearchResults([])
      await loadDashboard()
    } catch (error) {
      console.error('Error adding client:', error)
      toast.error(error.message || 'Failed to add client')
    } finally {
      setAddingClient(false)
    }
  }

  const filteredClients = clients.filter(client => {
    if (selectedFilter === 'attention' && client.health?.[0]?.overall_health >= 70) {
      return false
    }
    if (selectedFilter === 'reviewed') {
      const today = new Date().toDateString()
      if (!client.last_reviewed_at || new Date(client.last_reviewed_at).toDateString() !== today) {
        return false
      }
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        client.client?.full_name?.toLowerCase().includes(query) ||
        client.client?.email?.toLowerCase().includes(query) ||
        client.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }

    return true
  })

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center safe-area-top">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-6 h-6 text-white animate-spin" />
          <p className="text-xs text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-black text-white flex flex-col safe-area-top overflow-hidden">
      {/* Header */}
      <header className="border-b border-gray-900 px-4 py-3 flex items-center justify-between bg-black sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-900 rounded-full active:scale-95 transition-all touch-manipulation"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Advisor Tools</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddClient(true)}
            className="px-3 py-1.5 bg-white text-black text-sm font-medium rounded-full hover:bg-gray-200 active:scale-95 transition-all touch-manipulation flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            Add Client
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 hover:bg-gray-900 rounded-full active:scale-95 transition-all disabled:opacity-50 touch-manipulation"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Stats Grid */}
        <div className="border-b border-gray-900 px-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-900 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Clients</p>
              <p className="text-2xl font-bold">{stats.totalClients}</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Need Attention</p>
              <p className="text-2xl font-bold text-red-500">{stats.needingAttention}</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Pending Tasks</p>
              <p className="text-2xl font-bold text-yellow-500">{stats.pendingActions}</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Reviewed Today</p>
              <p className="text-2xl font-bold text-green-500">{stats.reviewedToday}</p>
            </div>
          </div>
        </div>

        {/* Action Items */}
        {actionItems.length > 0 && (
          <div className="border-b border-gray-900 px-4 py-4">
            <h2 className="text-sm font-semibold mb-3">Action Items</h2>
            <div className="space-y-2">
              {actionItems.slice(0, 3).map(item => (
                <div key={item.id} className="flex items-start gap-3 bg-gray-900 rounded-lg p-3 active:bg-gray-800 transition-colors">
                  <button
                    onClick={() => handleCompleteAction(item.id)}
                    className="mt-0.5 w-5 h-5 border-2 border-gray-700 rounded hover:border-white active:scale-95 transition-all flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{item.title}</p>
                    {item.description && (
                      <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                    )}
                    {item.client && (
                      <p className="text-xs text-gray-600 mt-1">{item.client.full_name}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="border-b border-gray-900 px-4 py-3">
          <div className="flex gap-6 mb-3">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                selectedFilter === 'all' ? 'border-white text-white' : 'border-transparent text-gray-500'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedFilter('attention')}
              className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                selectedFilter === 'attention' ? 'border-white text-white' : 'border-transparent text-gray-500'
              }`}
            >
              Need Attention
            </button>
            <button
              onClick={() => setSelectedFilter('reviewed')}
              className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                selectedFilter === 'reviewed' ? 'border-white text-white' : 'border-transparent text-gray-500'
              }`}
            >
              Reviewed
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-gray-700"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Clients List */}
        <div className="divide-y divide-gray-900">
          {filteredClients.length === 0 ? (
            <div className="px-4 py-20 text-center">
              <Users className="w-12 h-12 text-gray-800 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No clients found</p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-white text-sm mt-2 hover:text-gray-400"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            filteredClients.map(client => {
              const health = client.health?.[0]
              const healthScore = health?.overall_health || 100

              return (
                <div
                  key={client.id}
                  onClick={() => navigate(`/advisor-tools/clients/${client.client_id}`)}
                  className="px-4 py-4 active:bg-gray-900 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {client.client?.full_name?.charAt(0) || '?'}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold truncate">
                          {client.client?.full_name || 'Unknown'}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">
                          {client.client?.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className={`text-sm font-bold ${getHealthColor(healthScore)}`}>
                        {healthScore}%
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMarkReviewed(client.client_id)
                        }}
                        className="p-2 hover:bg-gray-800 rounded-full active:scale-95 transition-all"
                      >
                        <CheckSquare className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {health && (health.needs_rebalancing || health.needs_contact) && (
                    <div className="flex gap-2 mt-2">
                      {health.needs_rebalancing && (
                        <span className="text-xs text-yellow-500 flex items-center gap-1">
                          <TrendingDown className="w-3 h-3" />
                          Rebalancing
                        </span>
                      )}
                      {health.needs_contact && (
                        <span className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Contact needed
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Add Client Modal */}
      {showAddClient && (
        <>
          <div 
            className="fixed inset-0 bg-black/80 z-40"
            onClick={() => {
              setShowAddClient(false)
              setClientSearchQuery('')
              setSearchResults([])
            }}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 bg-black border-t border-gray-900 max-h-[80vh] flex flex-col rounded-t-2xl">
            {/* Modal Header */}
            <div className="border-b border-gray-900 px-4 py-4 flex items-center justify-between flex-shrink-0">
              <h2 className="text-lg font-semibold">Add Client</h2>
              <button
                onClick={() => {
                  setShowAddClient(false)
                  setClientSearchQuery('')
                  setSearchResults([])
                }}
                className="p-2 hover:bg-gray-900 rounded-full active:scale-95 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="px-4 py-4 border-b border-gray-900 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search users by name or username..."
                  value={clientSearchQuery}
                  onChange={(e) => handleSearchClients(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-gray-700"
                  autoFocus
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Search for users to add as clients</p>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto">
              {clientSearchQuery.length < 2 ? (
                <div className="px-4 py-12 text-center">
                  <Users className="w-12 h-12 text-gray-800 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Type at least 2 characters to search</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <Users className="w-12 h-12 text-gray-800 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No users found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-900">
                  {searchResults.map(userResult => (
                    <div
                      key={userResult.id}
                      className="px-4 py-3 active:bg-gray-900 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                          {userResult.avatar_url ? (
                            <img src={userResult.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            userResult.full_name?.charAt(0) || '?'
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold truncate">
                            {userResult.full_name || 'Unknown'}
                          </h3>
                          <p className="text-xs text-gray-500 truncate">@{userResult.username}</p>
                          {userResult.user_type && (
                            <p className="text-xs text-gray-600 mt-0.5 capitalize">{userResult.user_type}</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddClient(userResult)}
                        disabled={addingClient}
                        className="px-4 py-2 bg-white text-black text-sm font-medium rounded-full hover:bg-gray-200 disabled:opacity-50 active:scale-95 transition-all flex-shrink-0"
                      >
                        {addingClient ? 'Adding...' : 'Add'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
