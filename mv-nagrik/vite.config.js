import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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