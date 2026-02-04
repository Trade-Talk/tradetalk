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
  // Sign up with email/password
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

      // If signup succeeded but profile creation failed, create it manually
      if (data.user && data.user.id) {
        // Wait a moment for trigger to execute
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Check if profile exists
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .single()
        
        // If no profile exists, create it manually
        if (profileError && profileError.code === 'PGRST116') {
          console.log('⚠️ Trigger failed, creating profile manually...')
          console.log('Creating profile with user_type:', metadata.user_type)
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: email,
              full_name: metadata.full_name || 'User',
              username: metadata.username || `user_${data.user.id.substring(0, 8)}`,
              user_type: metadata.user_type || 'investor',
              is_verified: false
            })
          
          if (insertError) {
            console.error('Failed to create profile manually:', insertError)
          } else {
            console.log('✅ Profile created manually with user_type:', metadata.user_type)
          }
        } else if (existingProfile) {
          // Profile exists but might have wrong user_type from trigger
          console.log('Profile exists, updating user_type to:', metadata.user_type)
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              user_type: metadata.user_type,
              full_name: metadata.full_name || 'User'
            })
            .eq('id', data.user.id)
          
          if (updateError) {
            console.error('Failed to update profile user_type:', updateError)
          } else {
            console.log('✅ Profile user_type updated to:', metadata.user_type)
          }
        }
      }
      
      return { data, error: null }
    } catch (error) {
      console.error('Signup error:', error)
      return { data: null, error }
    }
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

  async searchUsers(query) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
      .limit(20)
    return { data, error }
  },

  async searchUsersByPhone(phone) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('phone', phone)
      .eq('phone_searchable', true)
      .limit(10)
    return { data, error }
  },

  async getSuggestedUsers(currentUserId, limit = 10) {
    // Get users the current user is NOT following
    // Prioritize: verified advisors, popular users, new users
    const { data, error } = await supabase
      .from('profiles')
      .select('*, follower_count:follows!follows_following_id_fkey(count)')
      .neq('id', currentUserId)
      .limit(limit)
    
    if (error) return { data: [], error }
    
    // Sort by: verified advisors first, then by follower count
    const sorted = (data || []).sort((a, b) => {
      if (a.is_verified && !b.is_verified) return -1
      if (!a.is_verified && b.is_verified) return 1
      return (b.follower_count || 0) - (a.follower_count || 0)
    })
    
    return { data: sorted, error: null }
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

  async checkIfLiked(userId, postId) {
    const { data, error } = await supabase
      .from('post_likes')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .single()
    return { data: !!data, error }
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

  // ==================== FOLLOWS (HYBRID MODEL) ====================
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

  // ==================== CONNECTION REQUESTS (for investor-to-investor) ====================
  async sendConnectionRequest(fromUserId, toUserId, message = null) {
    const { data, error } = await supabase
      .from('connection_requests')
      .insert({
        from_user_id: fromUserId,
        to_user_id: toUserId,
        message,
        status: 'pending'
      })
      .select()
      .single()
    return { data, error }
  },

  async acceptConnectionRequest(requestId) {
    // Update request status
    const { error: updateError } = await supabase
      .from('connection_requests')
      .update({ 
        status: 'accepted',
        responded_at: new Date().toISOString()
      })
      .eq('id', requestId)

    if (updateError) return { error: updateError }

    // Get request details to create mutual follows
    const { data: request } = await supabase
      .from('connection_requests')
      .select('from_user_id, to_user_id')
      .eq('id', requestId)
      .single()

    if (request) {
      // Create mutual follows
      await db.followUser(request.from_user_id, request.to_user_id)
      await db.followUser(request.to_user_id, request.from_user_id)
    }

    return { error: null }
  },

  async rejectConnectionRequest(requestId) {
    const { error } = await supabase
      .from('connection_requests')
      .update({ 
        status: 'rejected',
        responded_at: new Date().toISOString()
      })
      .eq('id', requestId)
    return { error }
  },

  async getConnectionRequests(userId) {
    const { data, error } = await supabase
      .from('connection_requests')
      .select(`
        *,
        from_user:profiles!connection_requests_from_user_id_fkey(*)
      `)
      .eq('to_user_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async checkConnectionRequestExists(fromUserId, toUserId) {
    const { data, error } = await supabase
      .from('connection_requests')
      .select('id, status')
      .or(`and(from_user_id.eq.${fromUserId},to_user_id.eq.${toUserId}),and(from_user_id.eq.${toUserId},to_user_id.eq.${fromUserId})`)
      .single()
    return { data, error }
  },

  // ==================== ADVISOR VERIFICATION ====================
  async createAdvisorVerification(verification) {
    const { data, error } = await supabase
      .from('advisor_verifications')
      .insert(verification)
      .select()
      .single()
    return { data, error }
  },

  async getAdvisorVerification(userId) {
    const { data, error } = await supabase
      .from('advisor_verifications')
      .select('*')
      .eq('user_id', userId)
      .single()
    return { data, error }
  },

  async updateAdvisorVerification(verificationId, updates) {
    const { data, error } = await supabase
      .from('advisor_verifications')
      .update(updates)
      .eq('id', verificationId)
      .select()
      .single()
    return { data, error }
  },

  // ==================== SMART SIGNALS ====================
  async createSignal(signal) {
    const { data, error } = await supabase
      .from('signals')
      .insert({
        ...signal,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select(`
        *,
        advisor:profiles(*)
      `)
      .single()
    return { data, error }
  },

  async getSignals(limit = 20, offset = 0) {
    const { data, error } = await supabase
      .from('signals')
      .select(`
        *,
        advisor:profiles(*)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    return { data, error }
  },

  async getSignalById(signalId) {
    const { data, error } = await supabase
      .from('signals')
      .select(`
        *,
        advisor:profiles(*)
      `)
      .eq('id', signalId)
      .single()
    return { data, error }
  },

  async getSignalsByAdvisor(advisorId, limit = 20, offset = 0) {
    const { data, error } = await supabase
      .from('signals')
      .select(`
        *,
        advisor:profiles(*)
      `)
      .eq('advisor_id', advisorId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    return { data, error }
  },

  async updateSignalStatus(signalId, status, additionalData = {}) {
    const updates = {
      status,
      ...additionalData
    }
    
    if (status === 'active' && !additionalData.entry_triggered_at) {
      updates.entry_triggered_at = new Date().toISOString()
    }
    if (status === 'target_hit' && !additionalData.target_hit_at) {
      updates.target_hit_at = new Date().toISOString()
      updates.closed_at = new Date().toISOString()
    }
    if (status === 'stop_hit' && !additionalData.closed_at) {
      updates.closed_at = new Date().toISOString()
    }
    if (status === 'expired' && !additionalData.closed_at) {
      updates.closed_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('signals')
      .update(updates)
      .eq('id', signalId)
      .select()
      .single()
    return { data, error }
  },

  async updateSignalPrice(signalId, currentPrice) {
    const { data, error } = await supabase
      .from('signals')
      .update({ current_price: currentPrice })
      .eq('id', signalId)
      .select()
      .single()
    return { data, error }
  },

  async deleteSignal(signalId) {
    const { error } = await supabase
      .from('signals')
      .delete()
      .eq('id', signalId)
    return { error }
  },

  // ==================== ADVISOR STATS ====================
  async getAdvisorStats(advisorId) {
    const { data, error } = await supabase
      .from('advisor_stats')
      .select('*')
      .eq('advisor_id', advisorId)
      .single()
    return { data, error }
  },

  // ==================== ADVISOR TOOLS - PHASE 1 ====================
  
  // ===== CLIENT MANAGEMENT =====
  async getAdvisorClients(advisorId) {
    const { data, error } = await supabase
      .from('advisor_clients')
      .select(`
        *,
        client:profiles!advisor_clients_client_id_fkey(*)
      `)
      .eq('advisor_id', advisorId)
      .order('priority', { ascending: false })
      .order('last_reviewed_at', { ascending: true, nullsFirst: true })
    
    if (error) return { data, error }
    
    // Manually fetch health scores for each client
    const clientsWithHealth = await Promise.all(
      data.map(async (client) => {
        const { data: healthData } = await supabase
          .from('client_health_scores')
          .select('*')
          .eq('advisor_id', advisorId)
          .eq('client_id', client.client_id)
          .maybeSingle()
        
        return {
          ...client,
          health: healthData ? [healthData] : []
        }
      })
    )
    
    return { data: clientsWithHealth, error: null }
  },

  async addAdvisorClient(advisorId, clientId, metadata = {}) {
    const { data, error } = await supabase
      .from('advisor_clients')
      .insert({
        advisor_id: advisorId,
        client_id: clientId,
        ...metadata
      })
      .select(`
        *,
        client:profiles!advisor_clients_client_id_fkey(*)
      `)
      .single()
    return { data, error }
  },

  async updateAdvisorClient(advisorId, clientId, updates) {
    const { data, error } = await supabase
      .from('advisor_clients')
      .update(updates)
      .eq('advisor_id', advisorId)
      .eq('client_id', clientId)
      .select()
      .single()
    return { data, error }
  },

  async markClientReviewed(advisorId, clientId) {
    return this.updateAdvisorClient(advisorId, clientId, {
      last_reviewed_at: new Date().toISOString()
    })
  },

  // ===== CLIENT HEALTH SCORES =====
  async getClientHealthScore(advisorId, clientId) {
    const { data, error } = await supabase
      .from('client_health_scores')
      .select('*')
      .eq('advisor_id', advisorId)
      .eq('client_id', clientId)
      .single()
    return { data, error }
  },

  async getClientsNeedingAttention(advisorId, limit = 10) {
    const { data, error } = await supabase
      .from('client_health_scores')
      .select(`
        *,
        client:profiles!client_health_scores_client_id_fkey(*)
      `)
      .eq('advisor_id', advisorId)
      .or('needs_rebalancing.eq.true,needs_contact.eq.true,has_concentration_risk.eq.true')
      .order('overall_health', { ascending: true })
      .limit(limit)
    return { data, error }
  },

  async calculateClientHealth(advisorId, clientId) {
    const { data, error } = await supabase
      .rpc('calculate_client_health', {
        p_advisor_id: advisorId,
        p_client_id: clientId
      })
    return { data, error }
  },

  async recalculateAllClientHealth(advisorId) {
    // Get all clients
    const { data: clients, error: clientsError } = await this.getAdvisorClients(advisorId)
    if (clientsError) return { error: clientsError }

    // Calculate health for each
    const promises = clients.map(c => this.calculateClientHealth(advisorId, c.client_id))
    await Promise.all(promises)

    return { data: clients.length, error: null }
  },

  // ===== ACTION ITEMS =====
  async getActionItems(advisorId, filters = {}) {
    let query = supabase
      .from('action_items')
      .select(`
        *,
        client:profiles(*)
      `)
      .eq('advisor_id', advisorId)

    if (filters.status) {
      query = query.eq('status', filters.status)
    } else {
      query = query.in('status', ['pending', 'in_progress'])
    }

    if (filters.client_id) {
      query = query.eq('client_id', filters.client_id)
    }

    if (filters.priority) {
      query = query.eq('priority', filters.priority)
    }

    query = query.order('priority', { ascending: false })
    query = query.order('due_date', { ascending: true, nullsFirst: false })
    query = query.order('created_at', { ascending: true })

    const { data, error } = await query
    return { data, error }
  },

  async getActionItemsByPriority(advisorId) {
    const { data, error } = await this.getActionItems(advisorId)
    if (error) return { data: null, error }

    return {
      data: {
        urgent: data.filter(item => item.priority === 3),
        high: data.filter(item => item.priority === 2),
        medium: data.filter(item => item.priority === 1),
        low: data.filter(item => item.priority === 0)
      },
      error: null
    }
  },

  async createActionItem(advisorId, item) {
    const { data, error } = await supabase
      .from('action_items')
      .insert({
        advisor_id: advisorId,
        ...item,
        status: 'pending'
      })
      .select(`
        *,
        client:profiles(*)
      `)
      .single()
    return { data, error }
  },

  async updateActionItem(itemId, updates) {
    const { data, error } = await supabase
      .from('action_items')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', itemId)
      .select()
      .single()
    return { data, error }
  },

  async completeActionItem(itemId) {
    return this.updateActionItem(itemId, {
      status: 'completed',
      completed_at: new Date().toISOString()
    })
  },

  async snoozeActionItem(itemId, snoozeDays = 1) {
    const snoozeUntil = new Date()
    snoozeUntil.setDate(snoozeUntil.getDate() + snoozeDays)

    return this.updateActionItem(itemId, {
      status: 'snoozed',
      snoozed_until: snoozeUntil.toISOString()
    })
  },

  async deleteActionItem(itemId) {
    const { error } = await supabase
      .from('action_items')
      .delete()
      .eq('id', itemId)
    return { error }
  },

  async generateActionItemsForClient(advisorId, clientId) {
    const { data, error } = await supabase
      .rpc('generate_action_items_for_client', {
        p_advisor_id: advisorId,
        p_client_id: clientId
      })
    return { data, error }
  },

  // ===== QUICK NOTES =====
  async getClientQuickNotes(advisorId, clientId) {
    const { data, error } = await supabase
      .from('client_quick_notes')
      .select('*')
      .eq('advisor_id', advisorId)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async createQuickNote(advisorId, clientId, content, tags = []) {
    const { data, error } = await supabase
      .from('client_quick_notes')
      .insert({
        advisor_id: advisorId,
        client_id: clientId,
        content,
        tags
      })
      .select()
      .single()
    return { data, error }
  },

  async updateQuickNote(noteId, updates) {
    const { data, error } = await supabase
      .from('client_quick_notes')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', noteId)
      .select()
      .single()
    return { data, error }
  },

  async deleteQuickNote(noteId) {
    const { error } = await supabase
      .from('client_quick_notes')
      .delete()
      .eq('id', noteId)
    return { error }
  },

  async searchQuickNotes(advisorId, searchTerm) {
    const { data, error } = await supabase
      .from('client_quick_notes')
      .select(`
        *,
        client:profiles!client_quick_notes_client_id_fkey(*)
      `)
      .eq('advisor_id', advisorId)
      .or(`content.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`)
      .order('created_at', { ascending: false })
      .limit(50)
    return { data, error }
  },

  // ===== CLIENT PREFERENCES =====
  async getClientPreferences(advisorId, clientId) {
    const { data, error } = await supabase
      .from('client_preferences')
      .select('*')
      .eq('advisor_id', advisorId)
      .eq('client_id', clientId)
      .single()
    return { data, error }
  },

  async updateClientPreferences(advisorId, clientId, preferences) {
    const { data, error } = await supabase
      .from('client_preferences')
      .upsert({
        advisor_id: advisorId,
        client_id: clientId,
        ...preferences,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    return { data, error }
  },

  // ===== CLIENT CONTEXT SUMMARY =====
  async getClientContextSummary(advisorId, clientId) {
    const { data, error } = await supabase
      .from('client_context_summary')
      .select('*')
      .eq('advisor_id', advisorId)
      .eq('client_id', clientId)
      .single()
    return { data, error }
  },

  async updateClientContextSummary(advisorId, clientId, summary, keyPoints = []) {
    const { data, error } = await supabase
      .from('client_context_summary')
      .upsert({
        advisor_id: advisorId,
        client_id: clientId,
        summary,
        key_points: keyPoints,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    return { data, error }
  },

  async calculateAdvisorStats(advisorId) {
    // Get all closed signals for the advisor
    const { data: signals, error } = await supabase
      .from('signals')
      .select('*')
      .eq('advisor_id', advisorId)
      .in('status', ['target_hit', 'stop_hit', 'expired'])
      .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()) // Last 90 days
    
    if (error) return { data: null, error }

    const totalSignals = signals.length
    const wins = signals.filter(s => s.status === 'target_hit').length
    const losses = signals.filter(s => s.status === 'stop_hit').length
    
    const accuracy = totalSignals > 0 ? (wins / totalSignals) * 100 : 0
    
    // Calculate average returns
    const returns = signals
      .filter(s => s.status === 'target_hit' || s.status === 'stop_hit')
      .map(s => {
        if (s.status === 'target_hit') {
          const entryAvg = (parseFloat(s.entry_min) + parseFloat(s.entry_max)) / 2
          const targetPrice = s.targets && s.targets.length > 0 ? parseFloat(s.targets[0]) : entryAvg
          return ((targetPrice - entryAvg) / entryAvg) * 100
        } else {
          const entryAvg = (parseFloat(s.entry_min) + parseFloat(s.entry_max)) / 2
          const stopLoss = parseFloat(s.stop_loss)
          return ((stopLoss - entryAvg) / entryAvg) * 100
        }
      })
    
    const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0
    const bestReturn = returns.length > 0 ? Math.max(...returns) : 0
    const maxDrawdown = returns.length > 0 ? Math.min(...returns) : 0

    // Calculate average hold time
    const holdTimes = signals
      .filter(s => s.entry_triggered_at && s.closed_at)
      .map(s => new Date(s.closed_at) - new Date(s.entry_triggered_at))
    
    const avgHoldTime = holdTimes.length > 0 
      ? holdTimes.reduce((a, b) => a + b, 0) / holdTimes.length 
      : 0

    // Determine risk profile
    let riskProfile = 'MODERATE'
    if (avgReturn > 15) riskProfile = 'AGGRESSIVE'
    else if (avgReturn < 5) riskProfile = 'CONSERVATIVE'

    // Update or insert stats
    const stats = {
      advisor_id: advisorId,
      accuracy_90d: accuracy,
      avg_return_90d: avgReturn,
      total_signals: totalSignals,
      wins,
      losses,
      best_return: bestReturn,
      max_drawdown: maxDrawdown,
      avg_hold_time: avgHoldTime,
      risk_profile: riskProfile,
      last_calculated: new Date().toISOString()
    }

    const { data, error: updateError } = await supabase
      .from('advisor_stats')
      .upsert(stats)
      .select()
      .single()
    
    return { data, error: updateError }
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
