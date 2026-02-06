import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader } from 'lucide-react'
import { supabase } from '../../lib/supabase-mvp'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function SetupUsername() {
  const navigate = useNavigate()
  const { loadUserProfile } = useAuth()
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [error, setError] = useState('')
  const [isAvailable, setIsAvailable] = useState(null)
  const [userId, setUserId] = useState(null)

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        toast.error('Please sign in first')
        navigate('/auth/welcome', { replace: true })
        return
      }

      setUserId(session.user.id)

      // Check if user already has a username
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', session.user.id)
        .single()

      if (profile?.username) {
        // User already has username, redirect to home
        navigate('/', { replace: true })
      }
    }

    checkAuth()
  }, [navigate])

  // Debounced username check
  useEffect(() => {
    if (!username || username.length < 3) {
      setIsAvailable(null)
      return
    }

    const timer = setTimeout(() => {
      checkUsername(username)
    }, 300)

    return () => clearTimeout(timer)
  }, [username])

  // Check username availability
  const checkUsername = async (value) => {
    setChecking(true)
    setError('')
    
    try {
      const { data, error: err } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', value.toLowerCase())
        .maybeSingle()

      if (err) {
        console.error('Error checking username:', err)
        setError('Error checking username availability')
        setIsAvailable(false)
        return
      }

      if (data) {
        // Username taken
        setIsAvailable(false)
        setError('This username is already taken')
      } else {
        // Username available
        setIsAvailable(true)
        setError('')
      }
    } catch (err) {
      console.error('Error checking username:', err)
      setError('Error checking username availability')
      setIsAvailable(false)
    } finally {
      setChecking(false)
    }
  }

  const handleUsernameChange = (e) => {
    let value = e.target.value.toLowerCase().trim()
    
    // Remove @ if user types it
    if (value.startsWith('@')) {
      value = value.substring(1)
    }

    // Only allow lowercase letters, numbers, and underscores
    if (value && !/^[a-z0-9_]*$/.test(value)) {
      setError('Only lowercase letters, numbers, and underscores allowed')
      return
    }

    // Maximum length check
    if (value.length > 20) {
      setError('Username must be 20 characters or less')
      return
    }

    setUsername(value)
    
    // Clear error if length is valid
    if (value.length === 0 || value.length >= 3) {
      setError('')
    } else if (value.length > 0) {
      setError('Username must be at least 3 characters')
      setIsAvailable(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!username || username.length < 3) {
      toast.error('Username must be at least 3 characters')
      return
    }

    if (username.length > 20) {
      toast.error('Username must be 20 characters or less')
      return
    }

    if (!isAvailable) {
      toast.error('This username is not available')
      return
    }

    setLoading(true)

    try {
      // Get current user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session?.user) {
        throw new Error('No active session. Please sign in again.')
      }

      console.log('Updating username for user:', session.user.id)

      // Update profile with username
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({ 
          username: username.toLowerCase(),
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id)
        .select()

      if (updateError) {
        console.error('Update error:', updateError)
        throw updateError
      }

      console.log('Username updated successfully:', data)

      // Reload the user profile in AuthContext to pick up the new username
      await loadUserProfile(session.user.id)
      
      toast.success('Welcome to TradeTalk! 🎉')
      
      // Navigate to home - the profile is now updated in context
      navigate('/', { replace: true })
      
    } catch (err) {
      console.error('Error setting username:', err)
      toast.error(err.message || 'Failed to set username. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light mb-2">Choose Your Username</h1>
          <p className="text-gray-400">This is how other traders will find you</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Username Input */}
          <div>
            <label htmlFor="username" className="block text-sm font-light text-gray-300 mb-3">
              Username
            </label>
            <div className="flex items-center">
              <span className="text-gray-600 mr-2 text-lg">@</span>
              <input
                id="username"
                type="text"
                value={username}
                onChange={handleUsernameChange}
                className={`block flex-1 px-0 py-3 border-0 border-b bg-black focus:outline-none placeholder-gray-600 text-white transition-colors text-lg ${
                  isAvailable === true
                    ? 'border-green-500 focus:border-green-500'
                    : isAvailable === false
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-800 focus:border-white'
                }`}
                placeholder="traderkid"
                autoFocus
                autoComplete="off"
                disabled={loading}
                required
              />
              {checking && (
                <Loader className="w-4 h-4 animate-spin text-gray-400 ml-2" />
              )}
              {!checking && isAvailable === true && (
                <span className="text-green-500 ml-2 text-sm">✓</span>
              )}
              {!checking && isAvailable === false && error && (
                <span className="text-red-500 ml-2 text-sm">✗</span>
              )}
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-500">{error}</p>
            )}
            {!error && (
              <p className="mt-3 text-xs text-gray-600">
                3-20 characters. Only lowercase letters, numbers, and underscores.
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !username || !isAvailable || checking}
            className="w-full py-4 bg-white text-black text-sm font-medium hover:bg-gray-100 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader className="animate-spin h-5 w-5 mr-2" />
                Setting up...
              </span>
            ) : (
              'Continue to TradeTalk'
            )}
          </button>
        </form>

        {/* Help text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            You can change your username anytime in settings
          </p>
        </div>
      </div>
    </div>
  )
}
