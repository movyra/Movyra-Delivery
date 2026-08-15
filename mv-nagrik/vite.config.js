import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Ensures assets use relative paths for Firebase Hosting SPA routing
  server: {
    proxy: {
      '/__/auth': {
        target: 'https://nagriksetu.web.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  preview: {
    proxy: {
      '/__/auth': {
        target: 'https://nagriksetu.web.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})