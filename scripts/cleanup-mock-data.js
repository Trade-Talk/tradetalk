#!/usr/bin/env node

/**
 * Mock Data Cleanup Script
 * Removes fake profiles, posts, and test data from the database before deployment
 * 
 * Usage: node scripts/cleanup-mock-data.js
 */

import { createClient } from '@supabase/supabase-js'
import readline from 'readline'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Get directory path
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables from .env file
config({ path: join(__dirname, '..', '.env') })

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Supabase credentials not found in environment variables')
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env file')
  console.error(`Looking for .env file at: ${join(__dirname, '..', '.env')}`)
  process.exit(1)
}

console.log('✅ Successfully loaded environment variables')
console.log(`   Supabase URL: ${supabaseUrl}`)
console.log(`   Key loaded: ${supabaseKey ? 'Yes' : 'No'}\n`)

const supabase = createClient(supabaseUrl, supabaseKey)

// List of mock user IDs/emails to remove (add your test accounts here)
const MOCK_USER_IDENTIFIERS = [
  'test@example.com',
  'demo@tradetalk.com',
  'mock@test.com',
  // Add more test emails or user IDs here
]

// Function to prompt user for confirmation
function askForConfirmation(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y')
    })
  })
}

async function cleanupMockData() {
  console.log('🧹 Mock Data Cleanup Script')
  console.log('===========================\n')

  console.log('⚠️  WARNING: This will permanently delete:')
  console.log('  - Mock user profiles')
  console.log('  - Posts created by mock users')
  console.log('  - Comments from mock users')
  console.log('  - Connections involving mock users')
  console.log('  - Test debates and discussions\n')

  const confirmed = await askForConfirmation('Are you sure you want to proceed? (yes/no): ')
  
  if (!confirmed) {
    console.log('\n❌ Cleanup cancelled')
    process.exit(0)
  }

  console.log('\n🚀 Starting cleanup...\n')

  try {
    // Step 1: Find mock user IDs
    console.log('📋 Step 1: Identifying mock users...')
    const { data: mockUsers, error: userError } = await supabase
      .from('profiles')
      .select('id, email, username')
      .in('email', MOCK_USER_IDENTIFIERS)

    if (userError) throw userError

    const mockUserIds = mockUsers.map(u => u.id)
    console.log(`   Found ${mockUsers.length} mock users:`)
    mockUsers.forEach(u => console.log(`   - ${u.username} (${u.email})`))

    if (mockUserIds.length === 0) {
      console.log('\n✅ No mock users found. Database is clean!')
      return
    }

    // Step 2: Delete posts by mock users
    console.log('\n📝 Step 2: Deleting posts from mock users...')
    const { error: postsError, count: postsCount } = await supabase
      .from('posts')
      .delete()
      .in('author_id', mockUserIds)

    if (postsError) throw postsError
    console.log(`   ✓ Deleted ${postsCount || 0} posts`)

    // Step 3: Delete comments by mock users
    console.log('\n💬 Step 3: Deleting comments from mock users...')
    const { error: commentsError, count: commentsCount } = await supabase
      .from('comments')
      .delete()
      .in('author_id', mockUserIds)

    if (commentsError) throw commentsError
    console.log(`   ✓ Deleted ${commentsCount || 0} comments`)

    // Step 4: Delete connections involving mock users
    console.log('\n👥 Step 4: Deleting connections involving mock users...')
    const { error: followsError, count: followsCount } = await supabase
      .from('follows')
      .delete()
      .or(`follower_id.in.(${mockUserIds.join(',')}),following_id.in.(${mockUserIds.join(',')})`)

    if (followsError) throw followsError
    console.log(`   ✓ Deleted ${followsCount || 0} follow relationships`)

    // Step 5: Delete connection requests (if table exists)
    console.log('\n📨 Step 5: Deleting connection requests...')
    try {
      const { error: requestsError, count: requestsCount } = await supabase
        .from('connection_requests')
        .delete()
        .or(`from_user_id.in.(${mockUserIds.join(',')}),to_user_id.in.(${mockUserIds.join(',')})`)

      if (requestsError && !requestsError.message.includes('does not exist')) {
        throw requestsError
      }
      console.log(`   ✓ Deleted ${requestsCount || 0} connection requests`)
    } catch (err) {
      console.log('   ⚠️  Connection requests table not found (skipping)')
    }

    // Step 6: Delete signals from mock users (if table exists)
    console.log('\n📊 Step 6: Deleting signals from mock advisors...')
    try {
      const { error: signalsError, count: signalsCount } = await supabase
        .from('signals')
        .delete()
        .in('advisor_id', mockUserIds)

      if (signalsError && !signalsError.message.includes('does not exist')) {
        throw signalsError
      }
      console.log(`   ✓ Deleted ${signalsCount || 0} signals`)
    } catch (err) {
      console.log('   ⚠️  Signals table not found (skipping)')
    }

    // Step 7: Delete mock user profiles (do this last due to foreign key constraints)
    console.log('\n👤 Step 7: Deleting mock user profiles...')
    const { error: deleteUsersError } = await supabase
      .from('profiles')
      .delete()
      .in('id', mockUserIds)

    if (deleteUsersError) throw deleteUsersError
    console.log(`   ✓ Deleted ${mockUsers.length} user profiles`)

    console.log('\n✅ Cleanup completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`   - Users removed: ${mockUsers.length}`)
    console.log(`   - Posts deleted: ${postsCount || 0}`)
    console.log(`   - Comments deleted: ${commentsCount || 0}`)
    console.log(`   - Connections removed: ${followsCount || 0}`)
    console.log('\n🎉 Database is ready for production!')

  } catch (error) {
    console.error('\n❌ Error during cleanup:', error.message)
    console.error('Full error:', error)
    console.error('Please check the error and try again')
    process.exit(1)
  }
}

// Run the cleanup
console.log('Starting in 3 seconds...')
setTimeout(async () => {
  await cleanupMockData()
  process.exit(0)
}, 3000)
