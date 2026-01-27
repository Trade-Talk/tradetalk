import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react'
import { supabase, authHelpers, db } from '../lib/supabase'
import toast from 'react-hot-toast'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUserProfile = useCallback(async (userId, signal) => {
    try {
      const { data, error } = await db.getUserProfile(userId)
      
      // Check if request was aborted
      if (signal?.aborted) return
      
      if (error) {
        // Silently ignore abort errors
        if (error.message?.includes('AbortError') || error.code === 'ABORTED') {
          return
        }
        console.error('Error loading profile:', error)
        return
      }
      
      if (data && !signal?.aborted) {
        setProfile(data)
        setUser(prev => ({ ...prev, ...data }))
      }
    } catch (error) {
      // Silently ignore abort errors
      if (error.message?.includes('AbortError') || error.name === 'AbortError') {
        return
      }
      console.error('Error loading profile:', error)
    }
  }, [])

  useEffect(() => {
    let mounted = true
    const abortController = new AbortController()
    
    // Check active session
    const initAuth = async () => {
      try {
        const session = await authHelpers.getSession()
        if (mounted && session?.user) {
          setUser(session.user)
          await loadUserProfile(session.user.id, abortController.signal)
        }
      } catch (error) {
        // Silently handle abort errors during unmount
        if (error.message?.includes('AbortError') || error.name === 'AbortError') {
          return
        }
        if (mounted) {
          console.error('Error checking user:', error)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      
      if (session?.user) {
        setUser(session.user)
        await loadUserProfile(session.user.id, abortController.signal)
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      mounted = false
      abortController.abort()
      subscription.unsubscribe()
    }
  }, [loadUserProfile])

  const signUp = useCallback(async (email, password, metadata) => {
    try {
      const { data, error } = await authHelpers.signUp(email, password, metadata)
      if (error) throw error
      
      toast.success('Account created! Please check your email for verification.')
      return { data, error: null }
    } catch (error) {
      toast.error(error.message)
      return { data: null, error }
    }
  }, [])

  const signIn = useCallback(async (email, password) => {
    try {
      // Check if Supabase is properly configured
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        // Mock authentication for development
        const mockUser = {
          id: 'mock-email-user',
          email: email,
          name: email.split('@')[0],
          provider: 'email'
        }
        setUser(mockUser)
        setProfile(mockUser)
        toast.success('Welcome back! (Demo Mode)')
        return { data: { user: mockUser }, error: null }
      }

      const { data, error } = await authHelpers.signIn(email, password)
      if (error) throw error
      
      toast.success('Welcome back!')
      return { data, error: null }
    } catch (error) {
      toast.error(error.message)
      return { data: null, error }
    }
  }, [])

  const signInWithPhone = useCallback(async (phone) => {
    try {
      const { data, error } = await authHelpers.signInWithPhone(phone)
      if (error) throw error
      
      toast.success('OTP sent to your phone!')
      return { data, error: null }
    } catch (error) {
      toast.error(error.message)
      return { data: null, error }
    }
  }, [])

  const verifyOTP = useCallback(async (phone, token) => {
    try {
      const { data, error } = await authHelpers.verifyOTP(phone, token)
      if (error) throw error
      
      toast.success('Phone verified!')
      return { data, error: null }
    } catch (error) {
      toast.error(error.message)
      return { data: null, error }
    }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    try {
      // Check if Supabase is properly configured
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        // Mock authentication for development
        const mockUser = {
          id: 'mock-google-user',
          email: 'demo@google.com',
          name: 'Demo User',
          provider: 'google'
        }
        setUser(mockUser)
        setProfile(mockUser)
        toast.success('Signed in with Google (Demo Mode)')
        return { data: { user: mockUser }, error: null }
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      })
      if (error) throw error
      
      return { data, error: null }
    } catch (error) {
      toast.error(error.message)
      return { data: null, error }
    }
  }, [])

  const signInWithApple = useCallback(async () => {
    try {
      // Check if Supabase is properly configured
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        // Mock authentication for development
        const mockUser = {
          id: 'mock-apple-user',
          email: 'demo@icloud.com',
          name: 'Demo User',
          provider: 'apple'
        }
        setUser(mockUser)
        setProfile(mockUser)
        toast.success('Signed in with Apple (Demo Mode)')
        return { data: { user: mockUser }, error: null }
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      })
      if (error) throw error
      
      return { data, error: null }
    } catch (error) {
      toast.error(error.message)
      return { data: null, error }
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      const { error } = await authHelpers.signOut()
      if (error) throw error
      
      setUser(null)
      setProfile(null)
      toast.success('Signed out successfully')
    } catch (error) {
      toast.error(error.message)
    }
  }, [])

  const updateProfile = useCallback(async (updates) => {
    try {
      const { data, error } = await db.updateUserProfile(user.id, updates)
      if (error) throw error
      
      setProfile(data)
      setUser(prev => ({ ...prev, ...data }))
      toast.success('Profile updated!')
      return { data, error: null }
    } catch (error) {
      toast.error(error.message)
      return { data: null, error }
    }
  }, [user?.id])

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    profile,
    loading,
    signUp,
    signIn,
    signInWithPhone,
    signInWithGoogle,
    signInWithApple,
    verifyOTP,
    signOut,
    updateProfile,
    loadUserProfile
  }), [
    user,
    profile,
    loading,
    signUp,
    signIn,
    signInWithPhone,
    signInWithGoogle,
    signInWithApple,
    verifyOTP,
    signOut,
    updateProfile,
    loadUserProfile
  ])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
