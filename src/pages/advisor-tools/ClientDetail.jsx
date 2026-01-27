import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, CheckSquare, Plus, StickyNote,
  Calendar, AlertCircle, Tag, Trash2, Clock, X, Loader
} from 'lucide-react'
import { db } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function ClientDetail() {
  const { clientId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [client, setClient] = useState(null)
  const [healthScore, setHealthScore] = useState(null)
  const [actionItems, setActionItems] = useState([])
  const [quickNotes, setQuickNotes] = useState([])
  const [contextSummary, setContextSummary] = useState(null)

  const [activeTab, setActiveTab] = useState('overview')
  const [showAddAction, setShowAddAction] = useState(false)
  const [showAddNote, setShowAddNote] = useState(false)

  const [newAction, setNewAction] = useState({ title: '', description: '', priority: 1 })
  const [newNote, setNewNote] = useState({ content: '', tags: [] })
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    loadClientData()
  }, [clientId, user])

  const loadClientData = async () => {
    if (!user?.id || !clientId) return

    try {
      setLoading(true)

      const { data: clientsData } = await db.getAdvisorClients(user.id)
      const clientRel = clientsData?.find(c => c.client_id === clientId)
      
      if (!clientRel) {
        toast.error('Client not found')
        navigate('/advisor-tools')
        return
      }

      setClient(clientRel)

      const { data: healthData } = await db.getClientHealthScore(user.id, clientId)
      setHealthScore(healthData)

      const { data: actionsData } = await db.getActionItems(user.id, { client_id: clientId })
      setActionItems(actionsData || [])

      const { data: notesData } = await db.getClientQuickNotes(user.id, clientId)
      setQuickNotes(notesData || [])

      const { data: summaryData } = await db.getClientContextSummary(user.id, clientId)
      setContextSummary(summaryData)

    } catch (error) {
      console.error('Error loading client:', error)
      toast.error('Failed to load client data')
    } finally {
      setLoading(false)
    }
  }

  const handleAddAction = async () => {
    if (!newAction.title.trim()) {
      toast.error('Please enter a title')
      return
    }

    try {
      await db.createActionItem(user.id, {
        client_id: clientId,
        type: 'custom',
        ...newAction
      })
      
      setNewAction({ title: '', description: '', priority: 1 })
      setShowAddAction(false)
      loadClientData()
      toast.success('Action item added!')
    } catch (error) {
      console.error('Error adding action:', error)
      toast.error('Failed to add action')
    }
  }

  const handleCompleteAction = async (actionId) => {
    try {
      await db.completeActionItem(actionId)
      loadClientData()
      toast.success('Action completed!')
    } catch (error) {
      console.error('Error completing action:', error)
      toast.error('Failed to complete action')
    }
  }

  const handleDeleteAction = async (actionId) => {
    if (!confirm('Delete this action item?')) return

    try {
      await db.deleteActionItem(actionId)
      loadClientData()
      toast.success('Action deleted')
    } catch (error) {
      console.error('Error deleting action:', error)
      toast.error('Failed to delete action')
    }
  }

  const handleAddNote = async () => {
    if (!newNote.content.trim()) {
      toast.error('Please enter some content')
      return
    }

    try {
      await db.createQuickNote(user.id, clientId, newNote.content, newNote.tags)
      
      setNewNote({ content: '', tags: [] })
      setShowAddNote(false)
      loadClientData()
      toast.success('Note added!')
    } catch (error) {
      console.error('Error adding note:', error)
      toast.error('Failed to add note')
    }
  }

  const handleDeleteNote = async (noteId) => {
    if (!confirm('Delete this note?')) return

    try {
      await db.deleteQuickNote(noteId)
      loadClientData()
      toast.success('Note deleted')
    } catch (error) {
      console.error('Error deleting note:', error)
      toast.error('Failed to delete note')
    }
  }

  const handleAddTag = () => {
    if (!tagInput.trim()) return
    
    const tag = tagInput.trim().toLowerCase()
    if (!newNote.tags.includes(tag)) {
      setNewNote({ ...newNote, tags: [...newNote.tags, tag] })
    }
    setTagInput('')
  }

  const handleRemoveTag = (tag) => {
    setNewNote({ ...newNote, tags: newNote.tags.filter(t => t !== tag) })
  }

  const handleMarkReviewed = async () => {
    try {
      await db.markClientReviewed(user.id, clientId)
      loadClientData()
      toast.success('Marked as reviewed!')
    } catch (error) {
      console.error('Error marking reviewed:', error)
      toast.error('Failed to mark as reviewed')
    }
  }

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 3: return 'bg-red-900 text-red-300 border-red-800'
      case 2: return 'bg-orange-900 text-orange-300 border-orange-800'
      case 1: return 'bg-blue-900 text-blue-300 border-blue-800'
      default: return 'bg-gray-800 text-gray-300 border-gray-700'
    }
  }

  const getPriorityLabel = (priority) => {
    switch(priority) {
      case 3: return 'Urgent'
      case 2: return 'High'
      case 1: return 'Medium'
      default: return 'Low'
    }
  }

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center safe-area-top">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-6 h-6 text-white animate-spin" />
          <p className="text-xs text-gray-500">Loading client...</p>
        </div>
      </div>
    )
  }

  if (!client) {
    return null
  }

  const healthScoreValue = healthScore?.overall_health || 100

  return (
    <div className="h-screen bg-black text-white flex flex-col safe-area-top overflow-hidden">
      {/* Header */}
      <header className="border-b border-gray-900 px-4 py-3 bg-black sticky top-0 z-10">
        <button
          onClick={() => navigate('/advisor-tools')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-3 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Back to Dashboard</span>
        </button>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white text-xl font-semibold">
              {client.client?.full_name?.charAt(0) || '?'}
            </div>
            <div>
              <h1 className="text-xl font-bold">{client.client?.full_name}</h1>
              <p className="text-sm text-gray-500">{client.client?.email}</p>
              {client.tags && client.tags.length > 0 && (
                <div className="flex gap-1.5 mt-2">
                  {client.tags.map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 bg-gray-800 text-gray-400 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={`text-xl font-bold ${getHealthColor(healthScoreValue)} px-3 py-1.5 bg-gray-900 rounded-lg`}>
              {healthScoreValue}%
            </div>
            <button
              onClick={handleMarkReviewed}
              className="p-2 bg-white text-black rounded-full hover:bg-gray-200 active:scale-95 transition-all"
            >
              <CheckSquare className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mt-4 border-b border-gray-900 -mb-[1px]">
          {['overview', 'actions', 'notes'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-1 py-2 font-medium capitalize transition-colors text-sm border-b-2 ${
                activeTab === tab
                  ? 'text-white border-white'
                  : 'text-gray-500 border-transparent'
              }`}
            >
              {tab}
              {tab === 'actions' && actionItems.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-red-900 text-red-300 text-xs rounded-full">
                  {actionItems.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="p-4 space-y-4">
            {/* Health Alerts */}
            {healthScore && (healthScore.needs_rebalancing || healthScore.needs_contact || healthScore.has_concentration_risk) && (
              <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-300 mb-2 flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  Alerts
                </h3>
                <div className="space-y-1.5">
                  {healthScore.needs_rebalancing && (
                    <p className="text-yellow-200 text-xs">
                      • Portfolio needs rebalancing
                    </p>
                  )}
                  {healthScore.needs_contact && (
                    <p className="text-yellow-200 text-xs">
                      • No contact in {healthScore.days_since_contact} days
                    </p>
                  )}
                  {healthScore.has_concentration_risk && (
                    <p className="text-yellow-200 text-xs">
                      • Concentration risk detected
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Context Summary */}
            {contextSummary && (
              <div className="bg-gray-900 rounded-lg p-4">
                <h3 className="font-semibold mb-2 text-sm">Client Summary</h3>
                <p className="text-sm text-gray-300">{contextSummary.summary}</p>
                {contextSummary.key_points && contextSummary.key_points.length > 0 && (
                  <ul className="mt-3 space-y-1.5">
                    {contextSummary.key_points.map((point, i) => (
                      <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                        <span className="text-white mt-0.5">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Last Review */}
            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-500" />
                Last Review
              </h3>
              <p className="text-sm text-gray-400">
                {client.last_reviewed_at
                  ? new Date(client.last_reviewed_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : 'Never reviewed'}
              </p>
            </div>

            {/* Recent Notes */}
            {quickNotes.length > 0 && (
              <div className="bg-gray-900 rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                  <StickyNote className="w-4 h-4 text-gray-500" />
                  Recent Notes
                </h3>
                <div className="space-y-2">
                  {quickNotes.slice(0, 3).map(note => (
                    <div key={note.id} className="p-3 bg-black rounded-lg border border-gray-800">
                      <p className="text-sm text-gray-300">{note.content}</p>
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {note.tags.map(tag => (
                            <span key={tag} className="text-xs px-2 py-0.5 bg-gray-800 text-gray-400 rounded-full">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-600 mt-2">
                        {new Date(note.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
                {quickNotes.length > 3 && (
                  <button
                    onClick={() => setActiveTab('notes')}
                    className="text-white text-sm font-medium mt-3 hover:underline"
                  >
                    View all {quickNotes.length} notes →
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Actions Tab */}
        {activeTab === 'actions' && (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Action Items</h2>
              <button
                onClick={() => setShowAddAction(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black text-sm font-medium rounded-full hover:bg-gray-200 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {/* Add Action Form */}
            {showAddAction && (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Action title..."
                    value={newAction.title}
                    onChange={(e) => setNewAction({ ...newAction, title: e.target.value })}
                    className="w-full px-3 py-2.5 bg-black border border-gray-800 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-gray-700"
                  />
                  <textarea
                    placeholder="Description (optional)..."
                    value={newAction.description}
                    onChange={(e) => setNewAction({ ...newAction, description: e.target.value })}
                    className="w-full px-3 py-2.5 bg-black border border-gray-800 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-gray-700"
                    rows="2"
                  />
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">Priority</label>
                    <div className="flex gap-2">
                      {[0, 1, 2, 3].map(priority => (
                        <button
                          key={priority}
                          onClick={() => setNewAction({ ...newAction, priority })}
                          className={`px-3 py-1.5 text-xs rounded-lg border transition-all active:scale-95 ${
                            newAction.priority === priority
                              ? getPriorityColor(priority)
                              : 'bg-black text-gray-500 border-gray-800'
                          }`}
                        >
                          {getPriorityLabel(priority)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddAction}
                      className="px-4 py-2 bg-white text-black rounded-full hover:bg-gray-200 active:scale-95 transition-all text-sm font-medium"
                    >
                      Add Action
                    </button>
                    <button
                      onClick={() => {
                        setShowAddAction(false)
                        setNewAction({ title: '', description: '', priority: 1 })
                      }}
                      className="px-4 py-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 active:scale-95 transition-all text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Action Items List */}
            {actionItems.length === 0 ? (
              <div className="bg-gray-900 rounded-lg p-8 text-center">
                <CheckSquare className="w-12 h-12 mx-auto mb-3 text-gray-700" />
                <p className="text-sm text-gray-500">No action items yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {actionItems.map(item => (
                  <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleCompleteAction(item.id)}
                        className="mt-0.5 w-5 h-5 border-2 border-gray-700 rounded hover:border-white active:scale-95 transition-all flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3 className="font-medium text-sm">{item.title}</h3>
                            {item.description && (
                              <p className="text-xs text-gray-400 mt-1">{item.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(item.priority)}`}>
                                {getPriorityLabel(item.priority)}
                              </span>
                              {item.due_date && (
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(item.due_date).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteAction(item.id)}
                            className="p-1.5 hover:bg-red-900/50 rounded text-red-400 active:scale-95 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Quick Notes</h2>
              <button
                onClick={() => setShowAddNote(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black text-sm font-medium rounded-full hover:bg-gray-200 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {/* Add Note Form */}
            {showAddNote && (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="space-y-3">
                  <textarea
                    placeholder="Write a quick note..."
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    className="w-full px-3 py-2.5 bg-black border border-gray-800 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-gray-700"
                    rows="3"
                  />
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2">Tags</label>
                    <div className="flex gap-1.5 mb-2 flex-wrap">
                      {newNote.tags.map(tag => (
                        <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-gray-800 text-gray-300 rounded-full text-xs">
                          #{tag}
                          <button onClick={() => handleRemoveTag(tag)}>
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add a tag..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                        className="flex-1 px-3 py-2 bg-black border border-gray-800 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-gray-700"
                      />
                      <button
                        onClick={handleAddTag}
                        className="px-3 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 active:scale-95 transition-all"
                      >
                        <Tag className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddNote}
                      className="px-4 py-2 bg-white text-black rounded-full hover:bg-gray-200 active:scale-95 transition-all text-sm font-medium"
                    >
                      Add Note
                    </button>
                    <button
                      onClick={() => {
                        setShowAddNote(false)
                        setNewNote({ content: '', tags: [] })
                        setTagInput('')
                      }}
                      className="px-4 py-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 active:scale-95 transition-all text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notes List */}
            {quickNotes.length === 0 ? (
              <div className="bg-gray-900 rounded-lg p-8 text-center">
                <StickyNote className="w-12 h-12 mx-auto mb-3 text-gray-700" />
                <p className="text-sm text-gray-500">No notes yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {quickNotes.map(note => (
                  <div key={note.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm text-gray-300">{note.content}</p>
                        {note.tags && note.tags.length > 0 && (
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {note.tags.map(tag => (
                              <span key={tag} className="text-xs px-2 py-0.5 bg-gray-800 text-gray-400 rounded-full">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-gray-600 mt-2">
                          {new Date(note.created_at).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1.5 hover:bg-red-900/50 rounded text-red-400 active:scale-95 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
