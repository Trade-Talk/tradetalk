#!/usr/bin/env node

/**
 * Simple Mock Data Cleanup Script
 * Run with: node scripts/cleanup-mock-data-simple.js
 * 
 * This version reads .env file manually without requiring dotenv package
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import readline from 'readline'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Read .env file manually
function loadEnvFile() {
  try {
    const envPath = join(__dirname, '..', '.env')
    const envFile = readFileSync(envPath, 'utf-8')
    const env = {}
    
    envFile.split('\n').forEach(line => {
      line = line.trim()
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=')
        const value = valueParts.join('=').trim()
        env[key.trim()] = value
      }
    })
    
    return env
  } catch (error) {
    console.error('❌ Could not read .env file:', error.message)
    return {}
  }
}

const env = loadEnvFile()
const supabaseUrl = env.VITE_SUPABASE_URL
const supabaseKey = env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Supabase credentials not found')
  console.error('Make sure your .env file contains:')
  console.error('  VITE_SUPABASE_URL=your-url')
  console.error('  VITE_SUPABASE_ANON_KEY=your-key')
  process.exit(1)
}

console.log('✅ Successfully loaded credentials from .env')
console.log(`   URL: ${supabaseUrl}\n`)

const supabase = createClient(supabaseUrl, supabaseKey)

// Mock user emails to delete
const MOCK_EMAILS = [
  'test@example.com',
  'demo@tradetalk.com',
  'mock@test.com',
]

function askQuestion(question) {
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

async function cleanup() {
  console.log('🧹 Mock Data Cleanup\n')
  console.log('⚠️  This will delete mock users and their data')
  console.log(`   Mock emails: ${MOCK_EMAILS.join(', ')}\n`)

  const proceed = await askQuestion('Continue? (yes/no): ')
  
  if (!proceed) {
    console.log('❌ Cancelled')
    process.exit(0)
  }

  console.log('\n🚀 Starting cleanup...\n')

  try {
    // Find mock users
    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('id, email, username')
      .in('email', MOCK_EMAILS)

    if (userError) throw userError

    if (!users || users.length === 0) {
      console.log('✅ No mock users found!')
      return
    }

    console.log(`Found ${users.length} mock users:`)
    users.forEach(u => console.log(`  - ${u.username} (${u.email})`))

    const userIds = users.map(u => u.id)

    // Delete posts
    console.log('\n📝 Deleting posts...')
    const { error: postsErr } = await supabase
      .from('posts')
      .delete()
      .in('author_id', userIds)
    if (postsErr) console.error('Posts error:', postsErr.message)
    else console.log('   ✓ Posts deleted')

    // Delete comments
    console.log('💬 Deleting comments...')
    const { error: commentsErr } = await supabase
      .from('comments')
      .delete()
      .in('author_id', userIds)
    if (commentsErr) console.error('Comments error:', commentsErr.message)
    else console.log('   ✓ Comments deleted')

    // Delete follows
    console.log('👥 Deleting follows...')
    const { error: followsErr } = await supabase
      .from('follows')
      .delete()
      .or(`follower_id.in.(${userIds.join(',')}),following_id.in.(${userIds.join(',')})`)
    if (followsErr) console.error('Follows error:', followsErr.message)
    else console.log('   ✓ Follows deleted')

    // Delete profiles
    console.log('👤 Deleting profiles...')
    const { error: profilesErr } = await supabase
      .from('profiles')
      .delete()
      .in('id', userIds)
    if (profilesErr) throw profilesErr
    console.log('   ✓ Profiles deleted')

    console.log('\n✅ Cleanup complete!')

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  }
}

setTimeout(() => cleanup().then(() => process.exit(0)), 1000)
