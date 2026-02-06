import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function SignUp() {
  const navigate = useNavigate()
  const { signUp } = useAuth()

  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    username: ''
  })

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password || !formData.fullName) {
      toast.error('Please fill all required fields')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    // Generate username from email if not provided
    const username = formData.username || formData.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_')

    setLoading(true)

    try {
      const { error } = await signUp(
        formData.email,
        formData.password,
        {
          full_name: formData.fullName,
          username: username
        }
      )
      
      if (!error) {
        navigate('/')
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-md mx-auto px-6 pt-12 pb-20">
        {/* Back Button - Minimal */}
        <button
          onClick={() => navigate('/auth/welcome')}
          className="mb-16 text-gray-600 hover:text-white flex items-center gap-2 text-sm transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          Back
        </button>

        {/* Header - Premium typography */}
        <div className="mb-12">
          <h1 className="text-4xl font-light mb-3 tracking-tight">Create account</h1>
          <p className="text-sm text-gray-600 font-light">
            Join the trading community platform
          </p>
        </div>

        {/* Form - Premium spacing */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Full Name */}
          <div>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Full name"
              className="input-underline"
              disabled={loading}
              autoComplete="name"
            />
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email address"
              className="input-underline"
              disabled={loading}
              autoComplete="email"
            />
          </div>

          {/* Username (optional) */}
          <div>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username (optional)"
              className="input-underline"
              disabled={loading}
              autoComplete="username"
            />
            <p className="mt-2 text-xs text-gray-600">
              If not provided, we'll generate one from your email
            </p>
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password (min 6 characters)"
              className="input-underline pr-10"
              disabled={loading}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-3 text-gray-600 hover:text-white transition-colors duration-200"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" strokeWidth={1.5} />
              ) : (
                <Eye className="w-5 h-5" strokeWidth={1.5} />
              )}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-4 text-sm font-medium hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-12 active:scale-[0.98]"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Sign In Link - Clear hierarchy */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600 font-light">
            Already have an account?{' '}
            <Link 
              to="/auth/signin" 
              className="text-white hover:text-gray-300 transition-colors duration-200"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Terms - Minimal */}
        <div className="mt-16 text-center">
          <p className="text-xs text-gray-700 font-light">
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="text-gray-600 hover:text-white transition-colors duration-200">Terms</Link>
            {' and '}
            <Link to="/privacy" className="text-gray-600 hover:text-white transition-colors duration-200">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
