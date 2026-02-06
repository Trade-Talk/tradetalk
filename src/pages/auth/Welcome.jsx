import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Welcome() {
  const navigate = useNavigate()
  const [showWaitlist, setShowWaitlist] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleGetStarted = () => {
    navigate('/signup')
  }

  const handleDismiss = () => {
    setShowWaitlist(false)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-6 pt-40 pb-20">
        <div className="max-w-2xl">
          <h1 className="text-6xl md:text-7xl font-light mb-8 leading-none tracking-tight">
            Where traders<br />
            connect &amp; grow.
          </h1>
          
          <p className="text-xl text-gray-400 mb-12 max-w-lg font-light">
            Share your trades. Learn from others. Build your network. A community for investors who show real results.
          </p>

          <button
            onClick={handleGetStarted}
            className="bg-white text-black px-8 py-4 text-sm font-medium hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
          >
            Join the Community
            <span className="text-gray-400">→</span>
          </button>
          
          <p className="text-xs text-gray-600 mt-6">
            Join thousands of traders
          </p>
        </div>
      </div>

      {/* Social Proof - Minimal */}
      <div className="border-t border-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-sm text-gray-600">
            A judgment-free space for investors of all levels
          </p>
        </div>
      </div>

      {/* Sign In Link at Bottom */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center">
        <button
          onClick={() => navigate('/login')}
          className="text-gray-400 hover:text-white text-sm transition-colors"
        >
          Already a member? <span className="text-white font-medium">Sign In</span>
        </button>
      </div>
    </div>
  )
}
