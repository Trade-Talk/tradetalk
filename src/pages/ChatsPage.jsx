import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Users, Hash, Plus, MessageCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

// Mock data with unique IDs
const mockChannels = [
  {
    id: 'channel-1',
    type: 'channel',
    name: 'Premium Picks',
    lastMessage: 'New recommendation: HDFC Bank',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    unread: 5,
    isPremium: true,
    memberCount: 1234
  },
  {
    id: 'channel-2',
    type: 'channel',
    name: 'Daily Market Updates',
    lastMessage: 'Nifty opening analysis - Check pin',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    unread: 2,
    memberCount: 5678
  },
  {
    id: 'channel-3',
    type: 'channel',
    name: 'Options Strategies',
    lastMessage: 'Weekly expiry setup ready',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    unread: 0,
    memberCount: 892
  }
]

const mockGroups = [
  {
    id: 'group-1',
    type: 'group',
    name: 'Value Investors India',
    lastMessage: 'Amit: Anyone looking at ITC?',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    unread: 0,
    memberCount: 234
  },
  {
    id: 'group-2',
    type: 'group',
    name: 'Day Traders Hub',
    lastMessage: 'Sara: Scalping setup working well',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    unread: 3,
    memberCount: 567
  },
  {
    id: 'group-3',
    type: 'group',
    name: 'Options Gang',
    lastMessage: 'Raj: Weekly straddle update',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    unread: 0,
    memberCount: 445
  }
]

const mockDMs = [
  {
    id: 'dm-1',
    type: 'dm',
    name: 'Rajesh Kumar',
    lastMessage: 'Great question! For long-term, I recommend...',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    unread: 2,
    isOnline: true,
    isVerified: true
  },
  {
    id: 'dm-2',
    type: 'dm',
    name: 'Priya Sharma',
    lastMessage: 'Thanks for the tip! 🚀',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    unread: 0,
    isOnline: false
  },
  {
    id: 'dm-3',
    type: 'dm',
    name: 'Amit Desai',
    lastMessage: 'You: Check out my latest post',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    unread: 0,
    isOnline: true
  }
]

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'channels', label: 'Channels' },
  { id: 'groups', label: 'Groups' },
  { id: 'dms', label: 'DMs' }
]

export default function ChatsPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const allChats = [...mockChannels, ...mockGroups, ...mockDMs]
  const filteredChats = activeTab === 'all' ? allChats :
                       activeTab === 'channels' ? mockChannels :
                       activeTab === 'groups' ? mockGroups :
                       mockDMs

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header with Search */}
      <header className="border-b border-gray-950 sticky top-0 z-10 backdrop-blur-xl bg-black/80">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-base font-light tracking-tight">Chats</h1>
            <button
              onClick={() => {/* Handle new chat */}}
              className="p-2 hover:bg-gray-950 rounded-full transition-colors"
            >
              <Plus className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-0 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-4 py-3 bg-transparent border-0 border-b border-gray-900 text-white placeholder-gray-600 focus:border-white outline-none transition-colors duration-200 text-sm font-light"
            />
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex gap-8 px-6 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-sm font-light transition-colors duration-200 pb-1 relative ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-px bg-white"></div>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Chat List */}
      <div className="divide-y divide-gray-950">
        {filteredChats.map((chat) => (
          <Link
            key={chat.id}
            to={`/chat/${chat.id}`}
            className="flex items-center gap-3 px-6 py-5 hover:bg-gray-950/50 transition-colors duration-200 active:scale-[0.99]"
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center border border-gray-900">
                {chat.type === 'channel' ? (
                  <Hash className="w-5 h-5 text-white" strokeWidth={1.5} />
                ) : chat.type === 'group' ? (
                  <Users className="w-5 h-5 text-white" strokeWidth={1.5} />
                ) : (
                  <span className="text-white font-light text-sm">
                    {chat.name.split(' ').map(n => n[0]).join('')}
                  </span>
                )}
              </div>
              {chat.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-white border-2 border-black rounded-full"></div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="font-light text-white text-sm truncate">
                    {chat.name}
                  </span>
                  {chat.isPremium && (
                    <span className="text-xs px-2 py-0.5 border border-gray-900 text-gray-400 flex-shrink-0 font-light">
                      PRO
                    </span>
                  )}
                  {chat.isVerified && (
                    <span className="text-white flex-shrink-0 text-xs">✓</span>
                  )}
                </div>
                <span className="text-xs text-gray-600 ml-2 flex-shrink-0 font-light">
                  {formatDistanceToNow(chat.timestamp, { addSuffix: false })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 truncate flex-1 font-light">
                  {chat.lastMessage}
                </p>
                {chat.unread > 0 && (
                  <span className="ml-2 w-5 h-5 bg-white text-black text-xs font-medium rounded-full flex items-center justify-center flex-shrink-0">
                    {chat.unread}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {filteredChats.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 px-6">
          <div className="w-20 h-20 bg-gray-950 rounded-full flex items-center justify-center mb-4">
            <MessageCircle className="w-8 h-8 text-gray-600" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-light text-white mb-2">No conversations yet</h3>
          <p className="text-gray-500 text-center mb-6 text-sm">
            Start a conversation or join a channel
          </p>
        </div>
      )}
    </div>
  )
}
