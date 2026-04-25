import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const defaultAllowedHosts = ['localhost', '127.0.0.1', '.onrender.com']
const renderHostname = process.env.RENDER_EXTERNAL_HOSTNAME
const customAllowedHosts = (process.env.VITE_ALLOWED_HOSTS || '')
  .split(',')
  .map((host) => host.trim())
  .filter(Boolean)

const allowedHosts = Array.from(
  new Set([
    ...defaultAllowedHosts,
    ...(renderHostname ? [renderHostname] : []),
    ...customAllowedHosts,
  ])
)

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  server: {
    host: true,
    port: 3000,
    allowedHosts,
    watch: {
      usePolling: true,
    },
  },
})
