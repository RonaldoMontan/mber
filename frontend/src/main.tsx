import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { getUser } from './utils/storage'

try {
  getUser()
} catch (error) {
  console.warn('Failed to validate stored user data:', error)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
