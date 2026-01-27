import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, Compass, Plus, MessageCircle, User } from 'lucide-react'

export default function MobileLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  
  const navItems = [
    { path: '/', icon: Home, label: 'Feed' },
    { path: '/explore', icon: Compass, label: 'Explore' },
    { path: '/create', icon: Plus, label: 'Create', isSpecial: true },
    { path: '/chats', icon: MessageCircle, label: 'Chats' },
    { path: '/profile', icon: User, label: 'Profile' },
  ]

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const handleCreate = () => {
    navigate('/create-post')
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-black">
      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* Premium Bottom Nav - Minimal, clear hierarchy */}
      <nav className="border-t border-gray-950 bg-black backdrop-blur-xl">
        <div className="flex items-center justify-around max-w-md mx-auto px-6 py-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            
            if (item.isSpecial) {
              return (
                <button
                  key={item.path}
                  onClick={handleCreate}
                  className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-all duration-200 active:scale-95 shadow-lg shadow-white/10"
                >
                  <Icon className="w-5 h-5 text-black" strokeWidth={2.5} />
                </button>
              )
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 transition-all duration-200 ${
                  active ? 'text-white' : 'text-gray-600 hover:text-gray-400'
                }`}
              >
                <Icon 
                  className="w-6 h-6"
                  strokeWidth={active ? 2 : 1.5}
                />
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
