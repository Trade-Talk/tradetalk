import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ==========================================
// AUTH HELPERS - Simplified for MVP
// ==========================================

export const authHelpers = {
  async signUp(email, password, metadata) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })
      
      if (error) throw error

      // Profile is auto-created by trigger, but verify it exists
      if (data.user && data.user.id) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .single()
        
        if (profileError && profileError.code === 'PGRST116') {
          // Manually create profile if trigger failed
          await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email,
              full_name: metadata.full_name || 'User',
              username: metadata.username || `user_${data.user.id.substring(0, 8)}`,
              user_type: metadata.user_type || 'investor'
            })
        }
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('Signup error:', error)
      return { data: null, error }
    }
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  async getSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  },

  async getUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }
}

// ==========================================
// DATABASE HELPERS - Reddit-style MVP
// ==========================================

export const db = {
  // ===== USER PROFILES =====
  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  async getUserProfileByUsername(username) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
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

  async searchUsers(query) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, bio')
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
      .limit(20)
    return { data, error }
  },

  // ===== POSTS =====
  async getPosts(limit = 20, offset = 0) {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles(id, username, full_name, avatar_url, user_type, is_verified),
        likes:post_likes(count),
        comments:comments(count)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    // Transform the data to include counts
    const transformedData = data?.map(post => ({
      ...post,
      likes_count: post.likes?.[0]?.count || 0,
      comments_count: post.comments?.[0]?.count || 0
    }))
    
    return { data: transformedData, error }
  },

  async getPostById(postId) {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles(id, username, full_name, avatar_url, user_type, is_verified),
        likes:post_likes(count),
        comments:comments(count)
      `)
      .eq('id', postId)
      .single()
    
    if (data) {
      data.likes_count = data.likes?.[0]?.count || 0
      data.comments_count = data.comments?.[0]?.count || 0
    }
    
    return { data, error }
  },

  async getPostsByUser(userId, limit = 20, offset = 0) {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles(id, username, full_name, avatar_url, user_type, is_verified),
        likes:post_likes(count),
        comments:comments(count)
      `)
      .eq('author_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    const transformedData = data?.map(post => ({
      ...post,
      likes_count: post.likes?.[0]?.count || 0,
      comments_count: post.comments?.[0]?.count || 0
    }))
    
    return { data: transformedData, error }
  },

  async createPost(post, stockSymbols = []) {
    // Only insert fields that exist in the posts table
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .insert({
        author_id: post.author_id,
        content: post.content,
        image_url: post.image_url
      })
      .select(`
        *,
        author:profiles(id, username, full_name, avatar_url, user_type, is_verified)
      `)
      .single()
    
    if (postError) {
      console.error('Post creation error:', postError)
      return { data: null, error: postError }
    }

    // Add counts
    if (postData) {
      postData.likes_count = 0
      postData.comments_count = 0
    }

    return { data: postData, error: null }
  },

  async deletePost(postId) {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
    return { error }
  },

  // ===== LIKES =====
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

  async checkIfLiked(userId, postId) {
    const { data } = await supabase
      .from('post_likes')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .single()
    return !!data
  },

  // ===== COMMENTS =====
  async getComments(postId) {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:profiles(id, username, full_name, avatar_url, user_type, is_verified)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
    
    return { data, error }
  },

  async createComment(comment) {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: comment.post_id,
        author_id: comment.author_id,
        content: comment.content
      })
      .select(`
        *,
        author:profiles(id, username, full_name, avatar_url, user_type, is_verified)
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

  // ===== FOLLOWS =====
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
    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single()
    return !!data
  },

  async getFollowers(userId, limit = 50) {
    const { data, error } = await supabase
      .from('follows')
      .select(`
        follower:profiles!follows_follower_id_fkey(id, username, full_name, avatar_url, bio)
      `)
      .eq('following_id', userId)
      .limit(limit)
    return { data: data?.map(f => f.follower), error }
  },

  async getFollowing(userId, limit = 50) {
    const { data, error } = await supabase
      .from('follows')
      .select(`
        following:profiles!follows_following_id_fkey(id, username, full_name, avatar_url, bio)
      `)
      .eq('follower_id', userId)
      .limit(limit)
    return { data: data?.map(f => f.following), error }
  }
}

// ==========================================
// STORAGE HELPERS
// ==========================================

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

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

// Extract stock symbols from text (e.g., $AAPL, $TSLA)
export function extractStockSymbols(text) {
  const symbolRegex = /\$([A-Z]{1,5})/g
  const matches = text.match(symbolRegex)
  if (!matches) return []
  
  return [...new Set(matches.map(m => m.substring(1)))] // Remove $ and get unique
}

// Format numbers for display
export function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// Time ago formatting
export function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  
  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + 'y'
  
  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + 'mo'
  
  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + 'd'
  
  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + 'h'
  
  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + 'm'
  
  return Math.floor(seconds) + 's'
}
