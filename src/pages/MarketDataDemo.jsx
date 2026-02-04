import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MarketDataSidebar from '../components/market/MarketDataSidebar';
import StockReferenceInput from '../components/market/StockReferenceInput';
import StockPriceInline from '../components/market/StockPriceInline';

/**
 * MarketDataDemo - Demo page showing all market data features
 * 
 * This page demonstrates:
 * 1. Live Price Widgets (MarketDataSidebar)
 * 2. Quick Reference System (StockReferenceInput)
 * 3. Embeddable Charts (StockPriceInline)
 * 4. Price Alerts
 * 5. Compare Tool
 */

export default function MarketDataDemo() {
  const navigate = useNavigate();
  const [postContent, setPostContent] = useState('');
  const [stockReferences, setStockReferences] = useState([]);
  const [mockPosts, setMockPosts] = useState([
    {
      id: 1,
      user: 'Rajesh Kumar',
      role: 'Advisor',
      content: 'Looking at tech stocks, I think INFY is a strong buy right now.',
      timestamp: Date.now() - 7200000, // 2 hours ago
      stockReferences: [
        { symbol: 'INFY', price: 1414.20, timestamp: Date.now() - 7200000 }
      ]
    },
    {
      id: 2,
      user: 'Priya Sharma',
      role: 'Investor',
      content: 'Interesting! How does it compare to TCS?',
      timestamp: Date.now() - 3600000, // 1 hour ago
      stockReferences: [
        { symbol: 'TCS', price: 3580.10, timestamp: Date.now() - 3600000 }
      ]
    }
  ]);

  const handleStockDetected = (stockData) => {
    setStockReferences([stockData]);
  };

  const handlePost = () => {
    if (postContent.trim() && stockReferences.length > 0) {
      const newPost = {
        id: mockPosts.length + 1,
        user: 'You',
        role: 'Investor',
        content: postContent,
        timestamp: Date.now(),
        stockReferences: stockReferences
      };
      setMockPosts([newPost, ...mockPosts]);
      setPostContent('');
      setStockReferences([]);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-black border-b border-gray-900 p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold">Market Data Integration Demo</h1>
              <p className="text-sm text-gray-600">
                Try typing /RELIANCE or $INFY in the input below
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto p-4 space-y-6">
          {/* Feature Overview */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Key Features</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <span className="text-blue-400 font-medium">1.</span>
                <div>
                  <div className="text-white font-medium">Live Price Widgets</div>
                  <div className="text-gray-600">See the sidebar → with real-time prices</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-400 font-medium">2.</span>
                <div>
                  <div className="text-white font-medium">Quick Reference System</div>
                  <div className="text-gray-600">Type /AAPL or $NIFTY to instantly pull data</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-400 font-medium">3.</span>
                <div>
                  <div className="text-white font-medium">Embeddable Price Tags</div>
                  <div className="text-gray-600">Click on price tags below to see details</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-400 font-medium">4.</span>
                <div>
                  <div className="text-white font-medium">Historical Tracking</div>
                  <div className="text-gray-600">Old posts show "was ₹X, now ₹Y"</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-400 font-medium">5.</span>
                <div>
                  <div className="text-white font-medium">Verifiable References</div>
                  <div className="text-gray-600">Every price is timestamped & copyable</div>
                </div>
              </div>
            </div>
          </div>

          {/* Create Post */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <h3 className="text-sm font-medium mb-3">Try It: Create a Post</h3>
            <StockReferenceInput
              value={postContent}
              onChange={setPostContent}
              onStockDetected={handleStockDetected}
              placeholder="Type your thoughts... Try /RELIANCE or $INFY"
            />
            <button
              onClick={handlePost}
              disabled={!postContent.trim() || stockReferences.length === 0}
              className="mt-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              Post
            </button>
          </div>

          {/* Mock Discussion Thread */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-400">Discussion Thread</h3>
            
            {mockPosts.map(post => (
              <div key={post.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {post.user.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{post.user}</span>
                      <span className="text-gray-600 text-sm">• {post.role}</span>
                      <span className="text-gray-600 text-sm">
                        • {Math.floor((Date.now() - post.timestamp) / 60000)}m ago
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-300 mb-3">{post.content}</p>

                {/* Stock References */}
                <div className="flex flex-wrap gap-2">
                  {post.stockReferences.map((stock, idx) => (
                    <StockPriceInline
                      key={idx}
                      symbol={stock.symbol}
                      initialPrice={stock.price}
                      timestamp={stock.timestamp}
                      showCurrent={true}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Integration Instructions */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">How to Integrate</h3>
            <div className="space-y-4 text-sm text-gray-400">
              <div>
                <div className="text-white font-medium mb-1">Step 1: Install axios</div>
                <code className="bg-black px-2 py-1 rounded text-xs">npm install axios</code>
              </div>
              
              <div>
                <div className="text-white font-medium mb-1">Step 2: Get API key</div>
                <div>Sign up at <a href="https://finnhub.io/register" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">finnhub.io</a> (60 calls/min free)</div>
              </div>
              
              <div>
                <div className="text-white font-medium mb-1">Step 3: Add to .env</div>
                <code className="bg-black px-2 py-1 rounded text-xs block">VITE_FINNHUB_KEY=your_key_here</code>
              </div>
              
              <div>
                <div className="text-white font-medium mb-1">Step 4: Use components</div>
                <div className="bg-black p-3 rounded text-xs font-mono">
                  <div className="text-green-400">import</div> MarketDataSidebar <div className="text-green-400">from</div> './components/market/MarketDataSidebar'
                  <br />
                  <div className="text-green-400">import</div> StockReferenceInput <div className="text-green-400">from</div> './components/market/StockReferenceInput'
                </div>
              </div>

              <div>
                <div className="text-white font-medium mb-1">Full Documentation</div>
                <div>Check <code className="bg-black px-2 py-1 rounded text-xs">MARKET_DATA_INTEGRATION.md</code> in your project root</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 hidden lg:block">
        <MarketDataSidebar />
      </div>
    </div>
  );
}
