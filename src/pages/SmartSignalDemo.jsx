import { useState } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SmartSignalCard from '../components/signals/SmartSignalCard';
import CreateSignalForm from '../components/signals/CreateSignalForm';
import AdvisorScorecard from '../components/reputation/AdvisorScorecard';
import AuditLog from '../components/reputation/AuditLog';
import ContextualChatRoom from '../components/chat/ContextualChatRoom';

// Mock Data
const mockAdvisor = {
  id: 1,
  name: 'Rahul Sharma',
  avatar: 'https://ui-avatars.com/api/?name=Rahul+Sharma&background=2563eb&color=fff',
  sebi_registered: true,
  sebi_registration_number: 'INH000001234',
  bio: 'Technical analyst with 10+ years experience. Specializing in swing trading and momentum strategies.',
  badges: ['Options Expert', 'Intraday King', 'Top Performer Q1 2025'],
  specializations: ['Technical Analysis', 'Options Trading', 'Swing Trading', 'Momentum Stocks']
};

const mockStats = {
  accuracy: 78,
  avg_return: 24,
  risk_profile: 'MEDIUM',
  total_signals: 142,
  best_return: 87,
  avg_hold_time: '3.2 days',
  max_drawdown: 12,
  wins: 111,
  losses: 31
};

const mockSignals = [
  {
    id: 1,
    direction: 'LONG',
    symbol: 'RELIANCE',
    exchange: 'NSE',
    entry_min: 2400,
    entry_max: 2410,
    current_price: 2408,
    targets: [2450, 2480, 2500],
    stop_loss: 2380,
    rationale: 'Reliance forming a double bottom on 15m timeframe. Volume breakout confirmed with strong bullish candles. RSI showing positive divergence. Expect upside towards 2450 levels.',
    rationale_preview: 'Reliance forming a double bottom on 15m timeframe. Volume breakout confirmed...',
    timeframe: 'INTRADAY',
    risk_level: 'MEDIUM',
    status: 'active',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    direction: 'SHORT',
    symbol: 'TATASTEEL',
    exchange: 'NSE',
    entry_min: 145,
    entry_max: 146,
    current_price: 145.5,
    targets: [142, 140],
    stop_loss: 148,
    rationale: 'Breakdown below key support level of 145. High volume selling pressure. Moving averages showing bearish crossover.',
    timeframe: 'SWING',
    risk_level: 'HIGH',
    status: 'pending',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    direction: 'LONG',
    symbol: 'INFY',
    exchange: 'NSE',
    entry_min: 1650,
    entry_max: 1660,
    current_price: 1695,
    targets: [1700, 1720],
    stop_loss: 1640,
    rationale: 'Strong support at 1650. Bullish engulfing pattern on daily chart.',
    timeframe: 'SWING',
    risk_level: 'LOW',
    status: 'target_hit',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    closed_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  }
];

const mockMessages = [
  {
    id: 1,
    user: mockAdvisor,
    text: 'Good morning everyone! Markets opening strong today. Keep an eye on $RELIANCE - it\'s showing good momentum.',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    user: { id: 2, name: 'Priya Singh', avatar: null },
    text: 'Thanks for the update! What about $TATASTEEL?',
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    user: mockAdvisor,
    text: 'SIGNAL: $RELIANCE LONG Entry: 2400-2410, Target: 2450, SL: 2380',
    timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString()
  },
  {
    id: 4,
    user: { id: 3, name: 'Amit Kumar', avatar: null },
    text: 'Entered at 2405! Let\'s see how this plays out 🚀',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  }
];

export default function SmartSignalDemo() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('feed'); // feed, profile, chat
  const [showCreateSignal, setShowCreateSignal] = useState(false);
  const [signals, setSignals] = useState(mockSignals);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const currentUser = {
    id: 999,
    name: 'You',
    avatar: null
  };

  const handleCreateSignal = (signalData) => {
    setSignals([signalData, ...signals]);
    setShowCreateSignal(false);
  };

  const handleUnlock = (signalId) => {
    alert('Subscription feature - In production, this would prompt user to subscribe for ₹199/mo');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">Smart Signal System</h1>
              <p className="text-sm text-gray-500">Three Core Features Demo</p>
            </div>
            <div className="w-20" />
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('feed')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'feed'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📊 Signal Feed
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              👤 Advisor Profile
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'chat'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              💬 Contextual Chat
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        {activeTab === 'feed' && (
          <div className="p-4">
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                ⚡ Feature 1: Smart Signal Cards
              </h2>
              <p className="text-gray-700 mb-4">
                Unlike regular posts, Smart Signals are live, trackable data objects. The system automatically
                tracks if trades hit targets or stop losses based on real market data.
              </p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg text-sm">
                  <span className="font-semibold text-green-600">✓</span>
                  <span>Auto-tracking</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg text-sm">
                  <span className="font-semibold text-green-600">✓</span>
                  <span>Live prices</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg text-sm">
                  <span className="font-semibold text-green-600">✓</span>
                  <span>Monetization ready</span>
                </div>
              </div>
            </div>

            {/* Create Signal Button */}
            <button
              onClick={() => setShowCreateSignal(true)}
              className="w-full mb-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <Plus size={20} />
              Create New Signal
            </button>

            {/* Signal Cards */}
            <div className="space-y-6">
              {signals.map(signal => (
                <SmartSignalCard
                  key={signal.id}
                  signal={signal}
                  advisor={mockAdvisor}
                  onUnlock={handleUnlock}
                  isSubscribed={isSubscribed}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="p-4 space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                🏆 Feature 2: Trust & Reputation Engine
              </h2>
              <p className="text-gray-700 mb-4">
                Unlike Twitter's blue ticks (which can be bought), advisors earn "Performance Ticks"
                through verified, tracked performance. Every signal is permanently recorded in an audit log.
              </p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg text-sm">
                  <span className="font-semibold text-purple-600">✓</span>
                  <span>Auto-calculated stats</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg text-sm">
                  <span className="font-semibold text-purple-600">✓</span>
                  <span>Immutable audit log</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg text-sm">
                  <span className="font-semibold text-purple-600">✓</span>
                  <span>SEBI verification</span>
                </div>
              </div>
            </div>

            <AdvisorScorecard advisor={mockAdvisor} stats={mockStats} />
            <AuditLog advisorId={mockAdvisor.id} signals={signals} />
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="h-[calc(100vh-180px)]">
            <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-xl">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                💬 Feature 3: Contextual Chat
              </h2>
              <p className="text-gray-700 mb-4">
                Not just a WhatsApp clone. Chat understands the market. Reference stocks with $SYMBOL
                to show live data. Execute trades with one click via broker integrations.
              </p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg text-sm">
                  <span className="font-semibold text-green-600">✓</span>
                  <span>Stock detection</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg text-sm">
                  <span className="font-semibold text-green-600">✓</span>
                  <span>Live charts</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg text-sm">
                  <span className="font-semibold text-green-600">✓</span>
                  <span>3 chat modes</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <ContextualChatRoom
                roomId={1}
                advisor={mockAdvisor}
                currentUser={currentUser}
                messages={mockMessages}
              />
            </div>
          </div>
        )}
      </div>

      {/* Create Signal Modal */}
      {showCreateSignal && (
        <CreateSignalForm
          onClose={() => setShowCreateSignal(false)}
          onSubmit={handleCreateSignal}
          advisorId={mockAdvisor.id}
        />
      )}
    </div>
  );
}
