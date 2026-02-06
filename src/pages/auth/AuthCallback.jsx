import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase-mvp'
import { Loader } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('Processing authentication...')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Session error:', error)
          throw error
        }

        if (!session) {
          throw new Error('No session found')
        }

        console.log('Session found for user:', session.user.id)
        setStatus('Checking your profile...')

        // Wait a bit for database trigger to complete
        await new Promise(resolve => setTimeout(resolve, 500))

        // Check if profile exists and has username
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, full_name')
          .eq('id', session.user.id)
          .maybeSingle() // Use maybeSingle instead of single to avoid error if not found

        if (profileError) {
          console.error('Profile fetch error:', profileError)
          throw profileError
        }

        console.log('Profile:', profile)

        // If no profile exists or username is null/empty, redirect to setup
        if (!profile || !profile.username) {
          console.log('No username found, redirecting to setup')
          setStatus('Setting up your profile...')
          navigate('/auth/setup-username', { 
            replace: true,
            state: { userId: session.user.id } 
          })
        } else {
          // Profile exists with username - proceed to home
          console.log('Profile complete, redirecting to home')
          toast.success('Welcome back! 🚀')
          navigate('/', { replace: true })
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        toast.error(error.message || 'Authentication failed. Please try again.')
        navigate('/auth/welcome', { replace: true })
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <Loader className="w-12 h-12 animate-spin text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-light mb-2">
          {status}
        </h2>
        <p className="text-gray-600">
          You'll be redirected shortly...
        </p>
      </div>
    </div>
  )
}
