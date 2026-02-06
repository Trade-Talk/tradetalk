import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

// Debug logging
console.log('🔍 Environment check:')
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('VITE_SUPABASE_ANON_KEY exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY)
console.log('Using URL:', supabaseUrl)
console.log('Using Key (first 20 chars):', supabaseAnonKey.substring(0, 20) + '...')

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase environment variables not configured. Using placeholder values.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helpers
export const authHelpers = {
  // Sign up with email/password - SIMPLIFIED (no user types)
  async signUp(email, password, metadata) {
    try {
      // First, sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/`
        }
      })
      
      if (error) throw error

      // If signup succeeded, ensure profile is created with correct username
      if (data.user && data.user.id) {
        // Wait a moment for trigger to execute
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Check if profile exists
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('id, username')
          .eq('id', data.user.id)
          .single()
        
        // IMPORTANT: Use the username from metadata, not auto-generated
        const desiredUsername = metadata.username || `user_${data.user.id.substring(0, 8)}`
        
        if (profileError && profileError.code === 'PGRST116') {
          // Profile doesn't exist, create it
          console.log('Creating profile with username:', desiredUsername)
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: email,
              full_name: metadata.full_name || 'User',
              username: desiredUsername,
              is_verified: false
            })
          
          if (insertError) {
            console.error('Failed to create profile:', insertError)
          } else {
            console.log('✅ Profile created with username:', desiredUsername)
          }
        } else if (existingProfile) {
          // Profile exists but might have wrong username from trigger
          if (existingProfile.username !== desiredUsername) {
            console.log('Updating profile username from', existingProfile.username, 'to', desiredUsername)
            const { error: updateError } = await supabase
              .from('profiles')
              .update({
                username: desiredUsername,
                full_name: metadata.full_name || 'User'
              })
              .eq('id', data.user.id)
            
            if (updateError) {
              console.error('Failed to update profile username:', updateError)
            } else {
              console.log('✅ Profile username updated to:', desiredUsername)
            }
          }
        }
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('Signup error:', error)
      return { data: null, error }
    }
  },

  // Sign in with Google
  async signInWithGoogle() {
    // Use consistent callback URL for both local dev and Vercel production
    const callbackUrl = `${window.location.origin}/auth/callback`
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    return { data, error }
  },

  // Sign in with email/password
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // Sign in with phone OTP
  async signInWithPhone(phone) {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone
    })
    return { data, error }
  },

  // Verify phone OTP
  async verifyOTP(phone, token) {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms'
    })
    return { data, error }
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current session
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  },

  // Get current user
  async getUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }
}

// Database helpers
export const db = {
  // ==================== USER PROFILES ====================
  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  async updateUserProfile(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  },

  async createUserProfile(profile) {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profile)
      .select()
      .single()
    return { data, error }
  },

  // Search users by username or full name
  async searchUsers(query) {
    if (!query || query.trim().length === 0) {
      return { data: [], error: null }
    }

    const searchTerm = query.trim().toLowerCase()
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
      .limit(20)
    
    return { data: data || [], error }
  },

  // Search users by phone
  async searchUsersByPhone(phone) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('phone', phone)
      .eq('phone_searchable', true) // Only show users who opted in
      .limit(10)
    return { data: data || [], error }
  },

  // Get suggested users
  async getSuggestedUsers(currentUserId, limit = 10) {
    try {
      // Get users the current user is NOT following
      const { data: followingIds } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUserId)
      
      const followingIdList = followingIds?.map(f => f.following_id) || []
      
      // Get suggested users (exclude self and already following)
      let query = supabase
        .from('profiles')
        .select('*')
        .neq('id', currentUserId)
      
      if (followingIdList.length > 0) {
        query = query.not('id', 'in', `(${followingIdList.join(',')})`)
      }
      
      const { data, error } = await query.limit(limit * 2) // Get more to sort
      
      if (error) return { data: [], error }
      
      // Sort by: verified users first, then by created date (newer users)
      const sorted = (data || []).sort((a, b) => {
        // Verified users come first
        if (a.is_verified && !b.is_verified) return -1
        if (!a.is_verified && b.is_verified) return 1
        
        // Then by newest users
        return new Date(b.created_at) - new Date(a.created_at)
      }).slice(0, limit)
      
      return { data: sorted, error: null }
    } catch (error) {
      console.error('Error getting suggested users:', error)
      return { data: [], error }
    }
  },

  // ==================== POSTS ====================
  async getPosts(limit = 20, offset = 0) {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles(*)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    return { data, error }
  },

  async getPostById(postId) {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles(*)
      `)
      .eq('id', postId)
      .single()
    return { data, error }
  },

  async getPostsByUser(userId, limit = 20, offset = 0) {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles(*)
      `)
      .eq('author_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    return { data, error }
  },

  async createPost(post) {
    const { data, error } = await supabase
      .from('posts')
      .insert(post)
      .select(`
        *,
        author:profiles(*)
      `)
      .single()
    return { data, error }
  },

  async deletePost(postId) {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
    return { error }
  },

  // ==================== LIKES ====================
  async likePost(userId, postId) {
    const { data, error } = await supabase
      .from('post_likes')
      .insert({ user_id: userId, post_id: postId })
      .select()
      .single()
    return { data, error }
  },

  async unlikePost(userId, postId) {
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId)
    return { error }
  },


// NEW (FIXED):
  async checkIfLiked(userId, postId) {
  const { data, error } = await supabase
    .from('post_likes')
    .select('id')
    .eq('user_id', userId)
    .eq('post_id', postId)
    .maybeSingle() // Use maybeSingle() instead of single()
  
  // If no error and data exists, user has liked
  return { data: !!data, error: error && error.code !== 'PGRST116' ? error : null }
  },

  // ==================== COMMENTS ====================
  async getComments(postId) {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:profiles(*)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
    return { data, error }
  },

  async createComment(comment) {
    const { data, error } = await supabase
      .from('comments')
      .insert(comment)
      .select(`
        *,
        author:profiles(*)
      `)
      .single()
    return { data, error }
  },

  async deleteComment(commentId) {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
    return { error }
  },

  async likeComment(userId, commentId) {
    const { data, error } = await supabase
      .from('comment_likes')
      .insert({ user_id: userId, comment_id: commentId })
      .select()
      .single()
    return { data, error }
  },

  async unlikeComment(userId, commentId) {
    const { error } = await supabase
      .from('comment_likes')
      .delete()
      .eq('user_id', userId)
      .eq('comment_id', commentId)
    return { error }
  },

  async checkIfCommentLiked(userId, commentId) {
    const { data, error } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('user_id', userId)
      .eq('comment_id', commentId)
      .maybeSingle()
    
    return { data: !!data, error: error && error.code !== 'PGRST116' ? error : null }
  },

  // ==================== FOLLOWS ====================
  async followUser(followerId, followingId) {
    const { data, error } = await supabase
      .from('follows')
      .insert({ follower_id: followerId, following_id: followingId })
      .select()
      .single()
    return { data, error }
  },

  async unfollowUser(followerId, followingId) {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
    return { error }
  },

  async checkIfFollowing(followerId, followingId) {
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single()
    return { data: !!data, error }
  },

  async getFollowers(userId, limit = 50) {
    const { data, error } = await supabase
      .from('follows')
      .select(`
        follower:profiles!follows_follower_id_fkey(*)
      `)
      .eq('following_id', userId)
      .limit(limit)
    return { data: data?.map(f => f.follower), error }
  },

  async getFollowing(userId, limit = 50) {
    const { data, error } = await supabase
      .from('follows')
      .select(`
        following:profiles!follows_following_id_fkey(*)
      `)
      .eq('follower_id', userId)
      .limit(limit)
    return { data: data?.map(f => f.following), error }
  },

  // ==================== CONNECTION REQUESTS (deprecated, kept for backward compatibility) ====================
  async sendConnectionRequest(fromUserId, toUserId, message = null) {
    // Just create a follow relationship instead
    return this.followUser(fromUserId, toUserId)
  },

  async acceptConnectionRequest(requestId) {
    // No-op, kept for compatibility
    return { error: null }
  },

  async rejectConnectionRequest(requestId) {
    // No-op, kept for compatibility
    return { error: null }
  },

  async getConnectionRequests(userId) {
    // Return empty array, kept for compatibility
    return { data: [], error: null }
  },

  async checkConnectionRequestExists(fromUserId, toUserId) {
    // Check if following instead
    return this.checkIfFollowing(fromUserId, toUserId)
  },
  // =====================================================
// ADD THESE FUNCTIONS TO src/lib/supabase.js
// Add to the 'db' object
// =====================================================

// ==================== DISCUSSIONS ====================
  async getDiscussions(limit = 20, offset = 0) {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles(*),
        likes_count:post_likes(count),
        comments_count:comments(count)
      `)
      .eq('post_type', 'discussion')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    return { data, error }
  },

  // ==================== DEBATES ====================
  async getDebates(limit = 20, offset = 0) {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles(*),
        votes_for:debate_votes(count).eq(side, 'for'),
        votes_against:debate_votes(count).eq(side, 'against')
      `)
      .eq('post_type', 'debate')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    return { data, error }
  },

  async voteOnDebate(userId, postId, side) {
    // Check if user already voted
    const { data: existingVote } = await supabase
      .from('debate_votes')
      .select('id, side')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .maybeSingle()

    // If same side, remove vote
    if (existingVote && existingVote.side === side) {
      const { error } = await supabase
        .from('debate_votes')
        .delete()
        .eq('id', existingVote.id)
      return { data: null, error }
    }

    // If different side, update vote
    if (existingVote) {
      const { data, error } = await supabase
        .from('debate_votes')
        .update({ side })
        .eq('id', existingVote.id)
        .select()
        .single()
      return { data, error }
    }

    // New vote
    const { data, error } = await supabase
      .from('debate_votes')
      .insert({ user_id: userId, post_id: postId, side })
      .select()
      .single()
    return { data, error }
  },

  async getUserDebateVote(userId, postId) {
    const { data, error } = await supabase
      .from('debate_votes')
      .select('side')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .maybeSingle()
    return { data: data?.side || null, error }
  },

  // ==================== COMMUNITIES ====================
  async getCommunities(limit = 50) {
    const { data, error } = await supabase
      .from('communities')
      .select('*')
      .eq('is_public', true)
      .order('member_count', { ascending: false })
      .limit(limit)
    return { data, error }
  },

  async joinCommunity(userId, communityId) {
    const { data, error } = await supabase
      .from('community_members')
      .insert({ user_id: userId, community_id: communityId })
      .select()
      .single()
    return { data, error }
  },

  async leaveCommunity(userId, communityId) {
    const { error } = await supabase
      .from('community_members')
      .delete()
      .eq('user_id', userId)
      .eq('community_id', communityId)
    return { error }
  },

  async checkIfJoinedCommunity(userId, communityId) {
    const { data, error } = await supabase
      .from('community_members')
      .select('id')
      .eq('user_id', userId)
      .eq('community_id', communityId)
      .maybeSingle()
    return { data: !!data, error: error && error.code !== 'PGRST116' ? error : null }
  },

  async getUserCommunities(userId) {
    const { data, error } = await supabase
      .from('community_members')
      .select(`
        community:communities(*)
      `)
      .eq('user_id', userId)
    return { data: data?.map(m => m.community), error }
  }
}

// Storage helpers
export const storage = {
  async uploadAvatar(userId, file) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/avatar.${fileExt}`
    
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true })
    
    if (error) return { data: null, error }
    
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)
    
    return { data: urlData.publicUrl, error: null }
  },

  async uploadPostImage(userId, file) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`
    
    const { data, error } = await supabase.storage
      .from('post-images')
      .upload(fileName, file)
    
    if (error) return { data: null, error }
    
    const { data: urlData } = supabase.storage
      .from('post-images')
      .getPublicUrl(fileName)
    
    return { data: urlData.publicUrl, error: null }
  },

  async deletePostImage(url) {
    const path = url.split('/post-images/')[1]
    const { error } = await supabase.storage
      .from('post-images')
      .remove([path])
    return { error }
  }
}
