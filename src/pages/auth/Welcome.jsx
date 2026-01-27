import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function Welcome() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Hero Section - Premium spacing and typography */}
      <div className="flex-1 px-6 pt-32 md:pt-40 pb-20 max-w-2xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-light mb-8 leading-none tracking-tight">
          Financial advice<br />
          you can verify.
        </h1>
        
        <p className="text-xl text-gray-400 mb-12 max-w-lg font-light leading-relaxed">
          Every recommendation timestamped. Every track record public. 
          Every advisor accountable.
        </p>

        <div className="space-y-3 max-w-sm">
          <button
            onClick={() => navigate('/auth/signup')}
            className="w-full bg-white text-black px-8 py-4 text-sm font-medium hover:bg-gray-100 transition-all duration-200 inline-flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            Get Started
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </button>
          
          <button
            onClick={() => navigate('/auth/signin')}
            className="w-full bg-transparent border border-gray-800 text-white px-8 py-4 text-sm font-medium hover:bg-gray-900 hover:border-gray-700 transition-all duration-200 active:scale-[0.98]"
          >
            Sign In
          </button>
        </div>

        <p className="text-xs text-gray-600 mt-8">
          Join 1,000+ investors verifying advice
        </p>
      </div>

      {/* Footer - Minimal divider */}
      <div className="border-t border-gray-950 py-8">
        <div className="max-w-2xl mx-auto px-6">
          <p className="text-xs text-gray-700 font-light">
            Built for investors who do their own research
          </p>
        </div>
      </div>
    </div>
  )
}
