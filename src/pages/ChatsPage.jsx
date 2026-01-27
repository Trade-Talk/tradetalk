import { Link } from 'react-router-dom'
import { Search, Users, Hash, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const mockChats = [
  {
    id: '1',
    type: 'advisor',
    name: 'Rajesh Kumar',
    lastMessage: 'Great question! For long-term, I recommend...',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    unread: 2,
    isOnline: true,
    isVerified: true
  },
  {
    id: '2',
    type: 'channel',
    name: 'Premium Picks',
    lastMessage: 'New recommendation: HDFC Bank',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    unread: 5,
    isPremium: true
  },
  {
    id: '3',
    type: 'group',
    name: 'Value Investors India',
    lastMessage: 'Amit: Anyone looking at ITC?',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    unread: 0,
    memberCount: 234
  },
  {
    id: '4',
    type: 'public',
    name: 'Market Hours Discussion',
    lastMessage: 'Live now: 156 members active',
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    unread: 0,
    isLive: true
  }
]

export default function ChatsPage() {
  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Premium Header */}
      <header className="border-b border-gray-950 sticky top-0 z-10 backdrop-blur-xl bg-black/80">
        <div className="px-6 py-5">
          <h1 className="text-base font-light mb-4 tracking-tight">Chats</h1>
          
          {/* Minimal Search */}
          <div className="relative">
            <Search className="absolute left-0 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-8 pr-4 py-3 bg-transparent border-0 border-b border-gray-900 text-white placeholder-gray-600 focus:border-white outline-none transition-colors duration-200 text-sm font-light"
            />
          </div>
        </div>
      </header>

      {/* Minimal Tabs */}
      <div className="border-b border-gray-950 sticky top-[89px] z-10 backdrop-blur-xl bg-black/80">
        <div className="flex gap-8 px-6">
          {['All', 'Advisors', 'Channels', 'Groups'].map((tab, idx) => (
            <button
              key={tab}
              className={`py-4 text-sm font-light transition-colors duration-200 relative ${
                idx === 0 ? 'text-white' : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              {tab}
              {idx === 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-px bg-white"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat List - Premium spacing */}
      <div className="divide-y divide-gray-950">
        {mockChats.map((chat) => (
          <Link
            key={chat.id}
            to={`/chat/${chat.id}`}
            className="flex items-center gap-3 px-6 py-5 hover:bg-gray-950/50 transition-colors duration-200 active:scale-[0.99]"
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center border border-gray-900">
                {chat.type === 'public' ? (
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
              {chat.isLive && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-pulse"></div>
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

      {/* Public Rooms - Minimal */}
      <div className="mt-2 border-t border-gray-950">
        <div className="px-6 py-4 border-b border-gray-950">
          <h2 className="text-sm font-light text-gray-400">Public Rooms</h2>
        </div>
        <Link
          to="/chat/market-live"
          className="flex items-center justify-between px-6 py-5 hover:bg-gray-950/50 transition-colors duration-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border border-gray-900 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <div className="font-light text-white text-sm">Market Hours Live</div>
              <div className="text-xs text-gray-600 font-light mt-0.5">287 active now</div>
            </div>
          </div>
          <button className="px-6 py-2 bg-white text-black text-sm font-medium hover:bg-gray-100 transition-all duration-200 active:scale-[0.98]">
            Join
          </button>
        </Link>
      </div>
    </div>
  )
}
