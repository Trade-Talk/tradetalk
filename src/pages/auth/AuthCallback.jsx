import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase-mvp'
import { Loader } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('Processing...')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) throw error

        if (session) {
          // Check if profile exists
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, username')
            .eq('id', session.user.id)
            .single()

          // If profile doesn't exist or username is missing, need to set username
          if (!profile || !profile.username) {
            setStatus('Setting up your profile...')
            
            // Generate username from email or Google name
            const email = session.user.email
            const googleName = session.user.user_metadata?.full_name || session.user.user_metadata?.name
            
            // Create username from email or name
            let username = email?.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '') || 'user'
            username = username + '_' + Math.random().toString(36).substring(2, 6)

            // Update or insert profile
            const { error: upsertError } = await supabase
              .from('profiles')
              .upsert({
                id: session.user.id,
                email: session.user.email,
                username: username,
                full_name: googleName || username,
                avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture
              }, {
                onConflict: 'id'
              })

            if (upsertError) {
              console.error('Profile creation error:', upsertError)
              // Continue anyway, they can update later
            }
          }

          toast.success('Welcome to TradeTalk! 🚀')
          navigate('/')
        } else {
          throw new Error('No session found')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        toast.error('Authentication failed. Please try again.')
        navigate('/login')
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {status}
        </h2>
        <p className="text-gray-600">
          You'll be redirected shortly...
        </p>
      </div>
    </div>
  )
}
