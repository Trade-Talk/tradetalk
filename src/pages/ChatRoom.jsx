import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send } from 'lucide-react'
import { useState } from 'react'

export default function ChatRoom() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [message, setMessage] = useState('')

  return (
    <div className="h-screen bg-white flex flex-col safe-area-top">
      <header className="border-b border-gray-200 px-4 py-3 flex items-center">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full active:scale-95 transition-transform touch-manipulation"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div className="ml-3">
          <h1 className="text-base font-semibold text-gray-900">Chat Room</h1>
          <p className="text-xs text-gray-500">Chat ID: {id}</p>
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-center text-gray-600 text-sm">Chat messages will appear here</div>
      </div>
      
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-[16px] focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button className="p-3 bg-primary-600 text-white rounded-xl active:bg-primary-700 transition-colors touch-manipulation">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
