import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, X, Loader } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { db } from '../../lib/supabase'
import toast from 'react-hot-toast'

export default function ConnectionRequests() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState({})

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    try {
      const { data, error } = await db.getConnectionRequests(user.id)
      if (error) throw error
      setRequests(data || [])
    } catch (error) {
      console.error('Error loading requests:', error)
      toast.error('Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (requestId) => {
    setActionLoading({ ...actionLoading, [requestId]: 'accepting' })
    try {
      const { error } = await db.acceptConnectionRequest(requestId)
      if (error) throw error
      
      setRequests(requests.filter(r => r.id !== requestId))
      toast.success('Connection accepted!')
    } catch (error) {
      console.error('Error accepting request:', error)
      toast.error('Failed to accept')
    } finally {
      setActionLoading({ ...actionLoading, [requestId]: null })
    }
  }

  const handleReject = async (requestId) => {
    setActionLoading({ ...actionLoading, [requestId]: 'rejecting' })
    try {
      const { error } = await db.rejectConnectionRequest(requestId)
      if (error) throw error
      
      setRequests(requests.filter(r => r.id !== requestId))
      toast.success('Request rejected')
    } catch (error) {
      console.error('Error rejecting request:', error)
      toast.error('Failed to reject')
    } finally {
      setActionLoading({ ...actionLoading, [requestId]: null })
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <Loader className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    )
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
        <h1 className="text-lg font-semibold text-gray-900 ml-2">Connection Requests</h1>
        {requests.length > 0 && (
          <span className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
            {requests.length}
          </span>
        )}
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">🤝</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending requests</h3>
            <p className="text-gray-600 text-center">
              You'll see connection requests from other investors here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {requests.map((request) => (
              <div key={request.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-3">
                  <div 
                    className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 cursor-pointer"
                    onClick={() => navigate(`/profile/${request.from_user.id}`)}
                  >
                    {request.from_user?.avatar_url ? (
                      <img src={request.from_user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      request.from_user?.full_name?.[0] || 'U'
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div 
                      className="cursor-pointer"
                      onClick={() => navigate(`/profile/${request.from_user.id}`)}
                    >
                      <p className="font-semibold text-gray-900 truncate">
                        {request.from_user?.full_name}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        @{request.from_user?.username}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(request.created_at)}
                      </p>
                    </div>
                    
                    {request.message && (
                      <p className="text-sm text-gray-700 mt-2 p-2 bg-gray-50 rounded">
                        {request.message}
                      </p>
                    )}

                    <div className="flex items-center space-x-2 mt-3">
                      <button
                        onClick={() => handleAccept(request.id)}
                        disabled={!!actionLoading[request.id]}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 active:scale-95 transition-all disabled:opacity-50 touch-manipulation"
                      >
                        {actionLoading[request.id] === 'accepting' ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Accept</span>
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleReject(request.id)}
                        disabled={!!actionLoading[request.id]}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 active:scale-95 transition-all disabled:opacity-50 touch-manipulation"
                      >
                        {actionLoading[request.id] === 'rejecting' ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <X className="w-4 h-4" />
                            <span>Decline</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
