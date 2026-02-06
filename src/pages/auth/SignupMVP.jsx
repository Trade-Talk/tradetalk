import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, User, Loader, X } from 'lucide-react'
import { authHelpers } from '../../lib/supabase-mvp'
import toast from 'react-hot-toast'

export default function SignupMVP() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    fullName: ''
  })
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.email || !formData.password || !formData.username) {
      toast.error('Please fill in all required fields')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    if (!/^[a-z0-9_]+$/.test(formData.username)) {
      toast.error('Username can only contain lowercase letters, numbers, and underscores')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await authHelpers.signUp(
        formData.email,
        formData.password,
        {
          username: formData.username,
          full_name: formData.fullName || formData.username
        }
      )

      if (error) throw error

      toast.success('Welcome to TradeTalk! 🚀')
      navigate('/')
    } catch (error) {
      console.error('Signup error:', error)
      if (error.message?.includes('already registered')) {
        toast.error('This email is already registered')
      } else if (error.message?.includes('unique')) {
        toast.error('This username is already taken')
      } else {
        toast.error(error.message || 'Failed to create account')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true)
    try {
      const { data, error } = await authHelpers.signInWithGoogle()
      
      if (error) throw error
      
      // Redirect will happen automatically via Supabase
    } catch (error) {
      console.error('Google sign-up error:', error)
      toast.error('Failed to sign up with Google')
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Close Button */}
        <button
          onClick={() => navigate('/auth/welcome')}
          className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-light mb-2">TradeTalk</h1>
          <p className="text-gray-400">Join the trading community</p>
        </div>

        {/* Signup Form */}
        <div className="space-y-8">
          
          {/* Google Sign Up */}
          <button
            onClick={handleGoogleSignUp}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-4 border border-gray-800 bg-black hover:bg-gray-950 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <>
                <Loader className="animate-spin h-5 w-5" />
                Connecting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign up with Google
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-black text-gray-500">Or sign up with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-light text-gray-300 mb-3">
                Email *
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="block w-full px-0 py-3 border-0 border-b border-gray-800 bg-black focus:border-white focus:outline-none placeholder-gray-600 text-white"
                placeholder="you@example.com"
                required
                disabled={loading || googleLoading}
              />
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-light text-gray-300 mb-3">
                Username *
              </label>
              <div className="flex items-center">
                <span className="text-gray-600 mr-2">@</span>
                <input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                  className="block flex-1 px-0 py-3 border-0 border-b border-gray-800 bg-black focus:border-white focus:outline-none placeholder-gray-600 text-white"
                  placeholder="traderkid"
                  pattern="[a-z0-9_]+"
                  required
                  disabled={loading || googleLoading}
                />
              </div>
              <p className="mt-2 text-xs text-gray-600">
                Only lowercase letters, numbers, and underscores
              </p>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-light text-gray-300 mb-3">
                Full Name (optional)
              </label>
              <input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="block w-full px-0 py-3 border-0 border-b border-gray-800 bg-black focus:border-white focus:outline-none placeholder-gray-600 text-white"
                placeholder="John Doe"
                disabled={loading || googleLoading}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-light text-gray-300 mb-3">
                Password *
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="block w-full px-0 py-3 border-0 border-b border-gray-800 bg-black focus:border-white focus:outline-none placeholder-gray-600 text-white"
                placeholder="••••••••"
                minLength={6}
                required
                disabled={loading || googleLoading}
              />
              <p className="mt-2 text-xs text-gray-600">
                At least 6 characters
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-4 bg-white text-black text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-8"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin h-5 w-5 inline mr-2" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center pt-6 border-t border-gray-800">
            <p className="text-sm text-gray-400 mb-3">Already a member?</p>
            <Link
              to="/login"
              className="text-white font-light hover:text-gray-300 transition-colors"
            >
              Sign in to your account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
