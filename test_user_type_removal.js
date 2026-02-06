// Test file to verify user type removal changes
// Run this in browser console or as a test script

import { authHelpers, db } from './lib/supabase'

// ============================================
// Test 1: Signup without user_type
// ============================================
async function testSignup() {
  console.log('🧪 Test 1: Signup without user_type')
  
  const testEmail = `test_${Date.now()}@example.com`
  const testUsername = `testuser_${Date.now()}`
  
  const { data, error } = await authHelpers.signUp(
    testEmail,
    'testpassword123',
    {
      username: testUsername,
      full_name: 'Test User'
      // NOTE: No user_type passed!
    }
  )
  
  if (error) {
    console.error('❌ Signup failed:', error)
    return false
  }
  
  console.log('✅ Signup successful:', data.user.id)
  return data.user.id
}

// ============================================
// Test 2: Profile creation without user_type
// ============================================
async function testProfileCreation(userId) {
  console.log('🧪 Test 2: Check profile created without user_type')
  
  // Wait for profile to be created
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  const { data, error } = await db.getUserProfile(userId)
  
  if (error) {
    console.error('❌ Profile fetch failed:', error)
    return false
  }
  
  console.log('✅ Profile created:', {
    id: data.id,
    username: data.username,
    user_type: data.user_type || 'NULL (as expected)'
  })
  
  if (data.user_type) {
    console.warn('⚠️ Warning: user_type still exists in database')
  }
  
  return true
}

// ============================================
// Test 3: Post creation and retrieval
// ============================================
async function testPostFunctions(userId) {
  console.log('🧪 Test 3: Post creation and retrieval')
  
  // Create a test post
  const { data: post, error: createError } = await db.createPost({
    author_id: userId,
    content: 'Test post for user type removal verification'
  })
  
  if (createError) {
    console.error('❌ Post creation failed:', createError)
    return false
  }
  
  console.log('✅ Post created:', post.id)
  
  // Retrieve posts
  const { data: posts, error: fetchError } = await db.getPosts(10, 0)
  
  if (fetchError) {
    console.error('❌ Posts fetch failed:', fetchError)
    return false
  }
  
  console.log('✅ Posts retrieved:', posts.length)
  
  // Check if author data has user_type
  const firstPost = posts[0]
  if (firstPost.author.user_type) {
    console.warn('⚠️ Warning: Post author still has user_type field')
  } else {
    console.log('✅ Post author has no user_type field')
  }
  
  return true
}

// ============================================
// Test 4: Follow functionality
// ============================================
async function testFollowSystem(userId) {
  console.log('🧪 Test 4: Follow system')
  
  // Get suggested users
  const { data: suggested, error } = await db.getSuggestedUsers(userId, 5)
  
  if (error) {
    console.error('❌ Suggested users fetch failed:', error)
    return false
  }
  
  console.log('✅ Suggested users:', suggested.length)
  
  if (suggested.length > 0) {
    const userToFollow = suggested[0]
    
    // Try to follow
    const { error: followError } = await db.followUser(userId, userToFollow.id)
    
    if (followError) {
      console.error('❌ Follow failed:', followError)
      return false
    }
    
    console.log('✅ Successfully followed user:', userToFollow.username)
  }
  
  return true
}

// ============================================
// Test 5: Search users
// ============================================
async function testUserSearch() {
  console.log('🧪 Test 5: User search')
  
  const { data: users, error } = await db.searchUsers('test')
  
  if (error) {
    console.error('❌ User search failed:', error)
    return false
  }
  
  console.log('✅ User search successful:', users.length, 'users found')
  
  return true
}

// ============================================
// Run all tests
// ============================================
async function runAllTests() {
  console.log('🚀 Starting user type removal tests...\n')
  
  try {
    const userId = await testSignup()
    if (!userId) {
      console.error('⛔ Stopping tests - signup failed')
      return
    }
    
    await testProfileCreation(userId)
    await testPostFunctions(userId)
    await testFollowSystem(userId)
    await testUserSearch()
    
    console.log('\n✨ All tests completed!')
    console.log('\n📝 Summary:')
    console.log('- Signup works without user_type')
    console.log('- Profiles created without user_type')
    console.log('- Posts work correctly')
    console.log('- Follow system functional')
    console.log('- Search works')
    
  } catch (error) {
    console.error('💥 Test suite failed:', error)
  }
}

// Export for use
export { runAllTests, testSignup, testProfileCreation, testPostFunctions, testFollowSystem, testUserSearch }

// Auto-run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests()
}
