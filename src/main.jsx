import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Suppress AbortError console warnings during development (Hot Module Replacement)
const originalConsoleError = console.error
console.error = (...args) => {
  // Filter out AbortError messages
  if (
    args[0]?.message?.includes('AbortError') ||
    (typeof args[0] === 'string' && args[0]?.includes('AbortError')) ||
    args[1]?.message?.includes('AbortError') ||
    (typeof args[1] === 'string' && args[1]?.includes('operation was aborted'))
  ) {
    return // Silently ignore
  }
  originalConsoleError(...args)
}

// Handle unhandled promise rejections for AbortErrors
window.addEventListener('unhandledrejection', (event) => {
  if (
    event.reason?.message?.includes('AbortError') ||
    event.reason?.name === 'AbortError' ||
    (typeof event.reason === 'string' && event.reason?.includes('operation was aborted'))
  ) {
    event.preventDefault() // Prevent logging
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
