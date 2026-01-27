// Debug utility to check posts in database
// Run this in your browser console to see all posts

async function checkPosts() {
  const supabaseUrl = 'https://irwfypgyyxvvjsxcrufs.supabase.co'
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlyd2Z5cGd5eXh2dmpzeGNydWZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0ODM2NTcsImV4cCI6MjA4NDA1OTY1N30.J7p61ex-1KpUSJAwEz6IgUWgwLuwQeQ0H-OFDj7qIgE'
  
  const response = await fetch(`${supabaseUrl}/rest/v1/posts?select=*,author:profiles(*)&order=created_at.desc&limit=10`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  })
  
  const posts = await response.json()
  
  console.log('📊 Last 10 posts in database:')
  console.table(posts.map(p => ({
    id: p.id.substring(0, 8),
    author: p.author?.full_name || 'Unknown',
    content: (p.content || '').substring(0, 50),
    images: p.images?.length || 0,
    stocks: p.stocks?.length || 0,
    created: new Date(p.created_at).toLocaleString()
  })))
  
  console.log('\n🔍 Full post data:', posts)
  
  return posts
}

// Run it
checkPosts()
