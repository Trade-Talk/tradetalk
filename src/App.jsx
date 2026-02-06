import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { lazy, Suspense } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'

// Layout (keep this non-lazy as it's always needed)
import MobileLayout from './components/MobileLayout'

// Lazy load pages
const FeedPageIntegrated = lazy(() => import('./pages/FeedPageIntegrated'))
const ExplorePage = lazy(() => import('./pages/ExplorePage'))
const CreatePost = lazy(() => import('./pages/CreatePostImproved'))
const ChatsPage = lazy(() => import('./pages/ChatsPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const PostDetail = lazy(() => import('./pages/PostDetail'))
const ChatRoom = lazy(() => import('./pages/ChatRoom'))
const DebatePage = lazy(() => import('./pages/DebatePage'))
const DiscussionDetailPage = lazy(() => import('./pages/DiscussionDetailPage'))

// Friends Pages
const AddFriends = lazy(() => import('./pages/friends/AddFriendsInstagram'))
const ConnectionRequests = lazy(() => import('./pages/friends/ConnectionRequests'))

// Demo Pages
const MarketDataDemo = lazy(() => import('./pages/MarketDataDemo'))

// Auth Pages (keep these non-lazy as they're entry points)
import Welcome from './pages/auth/Welcome'
import LoginMVP from './pages/auth/LoginMVP'
import SignupMVP from './pages/auth/SignupMVP'
import AuthCallback from './pages/auth/AuthCallback'
import SetupUsername from './pages/auth/SetupUsername'

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, profile, loading } = useAuth()
  
  if (loading) {
    return <PageLoader />
  }
  
  if (!user) {
    return <Navigate to="/auth/welcome" replace />
  }
  
  // If user is logged in but hasn't set a username yet, redirect to setup
  if (user && profile && !profile.username) {
    return <Navigate to="/auth/setup-username" replace />
  }
  
  return children
}

// Public Route (redirect if logged in)
function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <PageLoader />
  }
  
  if (user) {
    return <Navigate to="/" replace />
  }
  
  return children
}

// Setup Route (only accessible when logged in but no username)
function SetupRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <PageLoader />
  }
  
  if (!user) {
    return <Navigate to="/auth/welcome" replace />
  }
  
  return children
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/auth/welcome" element={<PublicRoute><Welcome /></PublicRoute>} />
        <Route path="/auth/signin" element={<PublicRoute><LoginMVP /></PublicRoute>} />
        <Route path="/auth/signup" element={<PublicRoute><SignupMVP /></PublicRoute>} />
        <Route path="/auth/setup-username" element={<SetupRoute><SetupUsername /></SetupRoute>} />
        <Route path="/login" element={<PublicRoute><LoginMVP /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignupMVP /></PublicRoute>} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        {/* Protected Routes with Bottom Navigation */}
        <Route path="/" element={<ProtectedRoute><MobileLayout /></ProtectedRoute>}>
          <Route index element={<FeedPageIntegrated />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="chats" element={<ChatsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        
        {/* Protected Full Screen Pages */}
        <Route path="/create-post" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
        <Route path="/post/:postId" element={<ProtectedRoute><PostDetail /></ProtectedRoute>} />
        <Route path="/profile/:userId" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/chat/:id" element={<ProtectedRoute><ChatRoom /></ProtectedRoute>} />
        <Route path="/debate/:debateId" element={<ProtectedRoute><DebatePage /></ProtectedRoute>} />
        <Route path="/discussion/:id" element={<ProtectedRoute><DiscussionDetailPage /></ProtectedRoute>} />
        <Route path="/add-friends" element={<ProtectedRoute><AddFriends /></ProtectedRoute>} />
        <Route path="/connection-requests" element={<ProtectedRoute><ConnectionRequests /></ProtectedRoute>} />
        <Route path="/demo/market-data" element={<ProtectedRoute><MarketDataDemo /></ProtectedRoute>} />
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <AppRoutes />
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
    </Router>
  )
}

export default App
