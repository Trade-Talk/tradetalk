import { useState, useRef, useEffect } from 'react';
import { Send, MoreVertical, Settings, TrendingUp, Lock, Unlock } from 'lucide-react';
import StockSidebar from './StockSidebar';

const ChatMode = {
  ADVISOR: 'advisor', // Only advisor can post (Broadcast)
  DISCUSSION: 'discussion', // Everyone can post
  QA: 'qa' // Q&A Mode - users post questions, advisor answers
};

export default function ContextualChatRoom({ roomId, advisor, currentUser, messages: initialMessages }) {
  const [messages, setMessages] = useState(initialMessages || []);
  const [inputText, setInputText] = useState('');
  const [chatMode, setChatMode] = useState(ChatMode.DISCUSSION);
  const [detectedStocks, setDetectedStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Extract stock symbols from messages (detect $SYMBOL pattern)
  useEffect(() => {
    const stockPattern = /\$([A-Z]+)/g;
    const allText = messages.map(m => m.text).join(' ');
    const matches = allText.match(stockPattern);
    
    if (matches) {
      const uniqueStocks = [...new Set(matches.map(m => m.replace('$', '')))];
      setDetectedStocks(uniqueStocks);
      
      // Auto-select the most recent stock mentioned
      if (uniqueStocks.length > 0 && !selectedStock) {
        setSelectedStock(uniqueStocks[uniqueStocks.length - 1]);
      }
    }
  }, [messages]);

  const canSendMessage = () => {
    if (chatMode === ChatMode.ADVISOR) {
      return currentUser.id === advisor.id;
    }
    return true;
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!inputText.trim() || !canSendMessage()) return;

    const newMessage = {
      id: Date.now(),
      user: currentUser,
      text: inputText,
      timestamp: new Date().toISOString(),
      type: chatMode === ChatMode.QA ? 'question' : 'message'
    };

    setMessages([...messages, newMessage]);
    setInputText('');
    inputRef.current?.focus();
  };

  const executeSignal = (signal) => {
    // Deep link to broker
    const symbol = signal.symbol;
    const exchange = signal.exchange;
    const direction = signal.direction;
    const price = signal.entry_min;
    
    const kiteUrl = `https://kite.zerodha.com/chart/ext/${symbol.toLowerCase()}`;
    window.open(kiteUrl, '_blank');
  };

  const renderMessage = (message) => {
    const isAdvisor = message.user.id === advisor.id;
    const isCurrentUser = message.user.id === currentUser.id;
    const isQuestion = message.type === 'question';

    // Check if message contains a signal
    const signalPattern = /SIGNAL:\s*(.+)/i;
    const signalMatch = message.text.match(signalPattern);

    return (
      <div
        key={message.id}
        className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''} ${
          isQuestion ? 'bg-yellow-50 p-3 rounded-lg' : ''
        }`}
      >
        <img
          src={message.user.avatar || `https://ui-avatars.com/api/?name=${message.user.name}`}
          alt={message.user.name}
          className="w-10 h-10 rounded-full flex-shrink-0"
        />
        <div className={`flex-1 ${isCurrentUser ? 'items-end' : 'items-start'} flex flex-col`}>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-sm font-semibold ${isAdvisor ? 'text-blue-600' : 'text-gray-900'}`}>
              {message.user.name}
              {isAdvisor && ' 🎯'}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          
          {signalMatch ? (
            // Render signal as a card
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 max-w-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-blue-900">📊 Trade Signal</span>
                <button
                  onClick={() => executeSignal({ symbol: 'RELIANCE', exchange: 'NSE', direction: 'LONG', entry_min: 2400 })}
                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                >
                  <TrendingUp size={12} />
                  Execute
                </button>
              </div>
              <p className="text-sm text-gray-700">{signalMatch[1]}</p>
            </div>
          ) : (
            <div
              className={`px-4 py-2 rounded-2xl max-w-md ${
                isCurrentUser
                  ? 'bg-blue-600 text-white'
                  : isQuestion
                  ? 'bg-white border border-yellow-300'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const ChatModeSettings = () => (
    <div className="absolute top-16 right-4 bg-white rounded-xl shadow-lg border border-gray-200 p-4 w-72 z-10">
      <h3 className="font-semibold text-gray-900 mb-3">Chat Mode</h3>
      
      <div className="space-y-2">
        <button
          onClick={() => { setChatMode(ChatMode.ADVISOR); setShowSettings(false); }}
          className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
            chatMode === ChatMode.ADVISOR
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Lock size={16} className="text-blue-600" />
            <span className="font-semibold text-sm">Advisor Mode</span>
          </div>
          <p className="text-xs text-gray-600">Only advisor can post (Broadcast)</p>
        </button>

        <button
          onClick={() => { setChatMode(ChatMode.DISCUSSION); setShowSettings(false); }}
          className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
            chatMode === ChatMode.DISCUSSION
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Unlock size={16} className="text-green-600" />
            <span className="font-semibold text-sm">Discussion Mode</span>
          </div>
          <p className="text-xs text-gray-600">Everyone can post and chat</p>
        </button>

        <button
          onClick={() => { setChatMode(ChatMode.QA); setShowSettings(false); }}
          className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
            chatMode === ChatMode.QA
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">❓</span>
            <span className="font-semibold text-sm">Q&A Mode</span>
          </div>
          <p className="text-xs text-gray-600">Users ask, advisor answers in queue</p>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={advisor.avatar || `https://ui-avatars.com/api/?name=${advisor.name}`}
              alt={advisor.name}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h2 className="font-bold text-gray-900">{advisor.name}'s Room</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{messages.length} messages</span>
                <span>•</span>
                <span className="capitalize">{chatMode} mode</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings size={20} />
          </button>

          {showSettings && <ChatModeSettings />}
        </div>

        {/* Stock Ticker (if stocks detected) */}
        {detectedStocks.length > 0 && (
          <div className="bg-blue-50 border-b border-blue-100 p-3">
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-sm text-gray-600 whitespace-nowrap">Discussed:</span>
              {detectedStocks.map(stock => (
                <button
                  key={stock}
                  onClick={() => setSelectedStock(stock)}
                  className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                    selectedStock === stock
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-blue-600 hover:bg-blue-100'
                  }`}
                >
                  ${stock}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-12">
              <p className="text-lg mb-2">👋 Welcome to the chat!</p>
              <p className="text-sm">Start discussing trades and market insights</p>
            </div>
          ) : (
            messages.map(renderMessage)
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          {!canSendMessage() && chatMode === ChatMode.ADVISOR && (
            <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              🔒 Advisor Mode: Only {advisor.name} can post messages
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                chatMode === ChatMode.QA
                  ? "Ask a question..."
                  : "Type a message... Use $SYMBOL to reference stocks"
              }
              disabled={!canSendMessage()}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || !canSendMessage()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send size={18} />
              Send
            </button>
          </form>

          <p className="text-xs text-gray-500 mt-2">
            💡 Tip: Reference stocks with $SYMBOL (e.g., $RELIANCE) to show live data
          </p>
        </div>
      </div>

      {/* Stock Sidebar */}
      {selectedStock && <StockSidebar symbol={selectedStock} exchange="NSE" />}
    </div>
  );
}
