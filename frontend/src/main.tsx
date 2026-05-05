import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { clearAll } from './utils/storage'

// Validate localStorage integrity on startup
try {
  const userKey = 'mber_user'
  const userStr = localStorage.getItem(userKey)
  
  if (userStr) {
    const parsed = JSON.parse(userStr)
    if (!parsed || typeof parsed !== 'object') {
      console.warn('Corrupted localStorage detected, clearing cache')
      clearAll()
    }
  }
} catch (error) {
  console.warn('Failed to validate localStorage, clearing cache:', error)
  clearAll()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
