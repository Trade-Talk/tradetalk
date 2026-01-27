import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function SignIn() {
  const navigate = useNavigate()
  const { signIn } = useAuth()

  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill all fields')
      return
    }

    setLoading(true)

    try {
      const { error } = await signIn(formData.email, formData.password)
      
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
          <h1 className="text-4xl font-light mb-3 tracking-tight">Welcome back</h1>
          <p className="text-sm text-gray-600 font-light">
            Sign in to continue
          </p>
        </div>

        {/* Form - Underline inputs for premium feel */}
        <form onSubmit={handleSubmit} className="space-y-8">
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

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="input-underline pr-10"
              disabled={loading}
              autoComplete="current-password"
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

          {/* Forgot Password - Minimal */}
          <div className="text-right">
            <Link 
              to="/auth/forgot-password" 
              className="text-sm text-gray-600 hover:text-white transition-colors duration-200 font-light"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button - Premium spacing */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-4 text-sm font-medium hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-12 active:scale-[0.98]"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Sign Up Link - Clear hierarchy */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600 font-light">
            Don't have an account?{' '}
            <Link 
              to="/auth/signup" 
              className="text-white hover:text-gray-300 transition-colors duration-200"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
