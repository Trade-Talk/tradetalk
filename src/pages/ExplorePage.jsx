import { useState, useEffect } from 'react'
import { Search, Users, MessageSquare, Sparkles, Loader, Plus, ThumbsUp, ThumbsDown } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/supabase'
import toast from 'react-hot-toast'

const tabs = [
  { id: 'discussions', label: 'Discussions', icon: MessageSquare },
  { id: 'debates', label: 'Debates', icon: MessageSquare },
  { id: 'people', label: 'Find People', icon: Users },
  { id: 'communities', label: 'Communities', icon: Sparkles }
]

export default function ExplorePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('discussions')
  const [loading, setLoading] = useState(false)

  // Tab-specific data
  const [discussions, setDiscussions] = useState([])
  const [debates, setDebates] = useState([])
  const [realUsers, setRealUsers] = useState([])
  const [communities, setCommunities] = useState([])
  const [joinedCommunities, setJoinedCommunities] = useState(new Set())

  // Load data based on active tab
  useEffect(() => {
    loadTabData()
  }, [activeTab, user])

  const loadTabData = async () => {
    if (!user) return

    setLoading(true)
    try {
      switch (activeTab) {
        case 'discussions':
          const { data: discussionData, error: discussionError } = await db.getDiscussions(20, 0)
          if (discussionError) throw discussionError
          setDiscussions(discussionData || [])
          break

        case 'debates':
          const { data: debateData, error: debateError } = await db.getDebates(20, 0)
          if (debateError) throw debateError
          setDebates(debateData || [])
          break

        case 'people':
          const { data: userData, error: userError } = await db.getSuggestedUsers(user.id, 20)
          if (userError) throw userError
          setRealUsers(userData || [])
          break

        case 'communities':
          const { data: communityData, error: communityError } = await db.getCommunities(50)
          if (communityError) throw communityError
          setCommunities(communityData || [])
          
          // Check which communities user has joined
          const joined = new Set()
          for (const community of communityData || []) {
            const { data: isMember } = await db.checkIfJoinedCommunity(user.id, community.id)
            if (isMember) joined.add(community.id)
          }
          setJoinedCommunities(joined)
          break
      }
    } catch (error) {
      console.error('Error loading tab data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async (e, userId) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      const { error } = await db.followUser(user.id, userId)
      if (error) throw error
      
      toast.success('Following user!')
      setRealUsers(realUsers.filter(u => u.id !== userId))
    } catch (error) {
      console.error('Error following user:', error)
      toast.error('Failed to follow user')
    }
  }

  const handleJoinCommunity = async (e, communityId) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      if (joinedCommunities.has(communityId)) {
        const { error } = await db.leaveCommunity(user.id, communityId)
        if (error) throw error
        
        setJoinedCommunities(prev => {
          const newSet = new Set(prev)
          newSet.delete(communityId)
          return newSet
        })
        
        setCommunities(communities.map(c => 
          c.id === communityId ? { ...c, member_count: Math.max(0, c.member_count - 1) } : c
        ))
        
        toast.success('Left community')
      } else {
        const { error } = await db.joinCommunity(user.id, communityId)
        if (error) throw error
        
        setJoinedCommunities(prev => new Set([...prev, communityId]))
        setCommunities(communities.map(c => 
          c.id === communityId ? { ...c, member_count: c.member_count + 1 } : c
        ))
        
        toast.success('Joined community!')
      }
    } catch (error) {
      console.error('Error with community:', error)
      toast.error('Failed to update community membership')
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    if (days < 7) return `${days}d`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header with Search */}
      <header className="border-b border-gray-950 sticky top-0 z-10 backdrop-blur-xl bg-black/80">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-base font-light tracking-tight">Explore</h1>
          </div>
          
          <div className="relative">
            <Search className="absolute left-0 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" strokeWidth={1.5} />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-4 py-3 bg-transparent border-0 border-b border-gray-900 text-white placeholder-gray-600 focus:border-white outline-none transition-colors duration-200 text-sm font-light"
            />
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex gap-6 px-6 pb-4 overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 text-sm font-light whitespace-nowrap transition-colors duration-200 pb-1 relative ${
                  activeTab === tab.id ? 'text-white' : 'text-gray-600 hover:text-gray-400'
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={1.5} />
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-white"></div>
                )}
              </button>
            )
          })}
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-6 h-6 text-white animate-spin" strokeWidth={1.5} />
        </div>
      ) : (
        <>
          {/* Discussions Tab */}
          {activeTab === 'discussions' && (
            <div className="px-6 py-6">
              {discussions.length > 0 ? (
                <div className="space-y-4">
                  {discussions.map((discussion) => (
                    <Link
                      key={discussion.id}
                      to={`/post/${discussion.id}`}
                      className="block border border-gray-900 rounded-lg p-4 hover:border-gray-800 transition-colors"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center flex-shrink-0">
                          {discussion.author?.avatar_url ? (
                            <img src={discussion.author.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="text-white font-light text-xs">
                              {discussion.author?.full_name?.[0] || '?'}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-light text-white text-sm">
                              {discussion.author?.full_name || 'Anonymous'}
                            </span>
                            <span className="text-gray-600 text-xs">·</span>
                            <span className="text-gray-600 text-xs">{formatDate(discussion.created_at)}</span>
                          </div>
                          {discussion.discussion_topic && (
                            <h3 className="font-light text-white text-base mb-2">{discussion.discussion_topic}</h3>
                          )}
                          <p className="text-sm text-gray-400 font-light line-clamp-2">{discussion.content}</p>
                          {discussion.tags && discussion.tags.length > 0 && (
                            <div className="flex gap-2 mt-2">
                              {discussion.tags.map((tag, i) => (
                                <span key={i} className="text-xs text-gray-500 font-light">#{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-600 font-light">
                        <span>{discussion.comments_count || 0} replies</span>
                        <span>{discussion.likes_count || 0} likes</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-sm font-light mb-4">No discussions yet</p>
                  <button
                    onClick={() => navigate('/create-post')}
                    className="inline-block px-4 py-2 bg-white text-black text-xs font-light rounded-full hover:bg-gray-100 transition-colors"
                  >
                    Start a Discussion
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Debates Tab */}
          {activeTab === 'debates' && (
            <div className="px-6 py-6">
              {debates.length > 0 ? (
                <div className="space-y-4">
                  {debates.map((debate) => {
                    const totalVotes = (debate.votes_for || 0) + (debate.votes_against || 0)
                    const forPercent = totalVotes > 0 ? Math.round((debate.votes_for / totalVotes) * 100) : 50
                    const againstPercent = 100 - forPercent

                    return (
                      <Link
                        key={debate.id}
                        to={`/post/${debate.id}`}
                        className="block border border-gray-900 rounded-lg p-4 hover:border-gray-800 transition-colors"
                      >
                        <div className="mb-3">
                          <h3 className="font-light text-white text-base mb-3">{debate.content}</h3>
                          
                          {debate.debate_sides && (
                            <div className="space-y-2 mb-3">
                              <div className="bg-green-900/10 border border-green-900/30 rounded p-2">
                                <p className="text-xs text-green-400 font-light mb-1">👍 FOR</p>
                                <p className="text-xs text-gray-400 font-light">{debate.debate_sides.for}</p>
                              </div>
                              <div className="bg-red-900/10 border border-red-900/30 rounded p-2">
                                <p className="text-xs text-red-400 font-light mb-1">👎 AGAINST</p>
                                <p className="text-xs text-gray-400 font-light">{debate.debate_sides.against}</p>
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2 h-2 rounded-full overflow-hidden bg-gray-950">
                            <div 
                              className="bg-green-500/80 transition-all duration-300" 
                              style={{ width: `${forPercent}%` }}
                            />
                            <div 
                              className="bg-red-500/80 transition-all duration-300" 
                              style={{ width: `${againstPercent}%` }}
                            />
                          </div>
                          
                          <div className="flex justify-between mt-2 text-xs font-light">
                            <span className="text-green-400">{forPercent}% FOR ({debate.votes_for || 0})</span>
                            <span className="text-red-400">{againstPercent}% AGAINST ({debate.votes_against || 0})</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-600 font-light">
                          <span>{totalVotes} votes</span>
                          <span>{formatDate(debate.created_at)}</span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-sm font-light mb-4">No debates yet</p>
                  <button
                    onClick={() => navigate('/create-post')}
                    className="inline-block px-4 py-2 bg-white text-black text-xs font-light rounded-full hover:bg-gray-100 transition-colors"
                  >
                    Create a Debate
                  </button>
                </div>
              )}
            </div>
          )}

          {/* People Tab */}
          {activeTab === 'people' && (
            <div className="px-6 py-6">
              {realUsers.length > 0 ? (
                <div className="space-y-4">
                  {realUsers.map((user) => (
                    <Link
                      key={user.id}
                      to={`/profile/${user.id}`}
                      className="block hover:bg-gray-950/50 transition-colors -mx-2 px-2 py-3 rounded"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center flex-shrink-0 border border-gray-900">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="text-white font-light text-sm">
                              {user.full_name?.[0] || user.username?.[0] || '?'}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-light text-white text-sm">
                              {user.full_name || user.username}
                            </span>
                            {user.is_verified && <span className="text-white text-xs">✓</span>}
                          </div>
                          <p className="text-xs text-gray-500 font-light">@{user.username}</p>
                          {user.bio && (
                            <p className="text-xs text-gray-500 font-light mt-2 line-clamp-2">{user.bio}</p>
                          )}
                        </div>
                        <button 
                          onClick={(e) => handleFollow(e, user.id)}
                          className="px-3 py-1 border border-gray-900 text-gray-400 text-xs font-light hover:text-white hover:border-gray-800 transition-all flex-shrink-0"
                        >
                          Follow
                        </button>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-sm font-light mb-4">No suggested users</p>
                  <Link
                    to="/add-friends"
                    className="inline-block px-4 py-2 border border-gray-900 text-white text-xs font-light hover:bg-gray-950 hover:border-gray-800 transition-all"
                  >
                    Find Friends
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Communities Tab */}
          {activeTab === 'communities' && (
            <div className="px-6 py-6">
              {communities.length > 0 ? (
                <div className="grid gap-4">
                  {communities.map((community) => (
                    <div
                      key={community.id}
                      className="border border-gray-900 rounded-lg p-4 hover:border-gray-800 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{community.icon}</div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-light text-white text-base mb-1">{community.name}</h3>
                          <p className="text-xs text-gray-500 font-light mb-2">{community.description}</p>
                          <p className="text-xs text-gray-600 font-light">
                            {community.member_count} {community.member_count === 1 ? 'member' : 'members'}
                          </p>
                        </div>
                        <button
                          onClick={(e) => handleJoinCommunity(e, community.id)}
                          className={`px-3 py-1 text-xs font-light transition-all flex-shrink-0 ${
                            joinedCommunities.has(community.id)
                              ? 'bg-gray-900 text-gray-400 hover:bg-gray-800'
                              : 'border border-gray-900 text-white hover:bg-gray-950'
                          }`}
                        >
                          {joinedCommunities.has(community.id) ? 'Joined' : 'Join'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-sm font-light">No communities available</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* FAB - Context Aware */}
      {(activeTab === 'discussions' || activeTab === 'debates') && (
        <button
          onClick={() => navigate('/create-post', { 
            state: { postType: activeTab === 'discussions' ? 'discussion' : 'debate' } 
          })}
          className="fixed bottom-20 right-6 w-14 h-14 bg-white text-black rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center z-20"
          aria-label={`Create ${activeTab === 'discussions' ? 'Discussion' : 'Debate'}`}
        >
          <Plus className="w-6 h-6" strokeWidth={2.5} />
        </button>
      )}
    </div>
  )
}