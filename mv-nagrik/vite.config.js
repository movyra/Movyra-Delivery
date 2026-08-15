import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['**/*.png', '**/*.jpg', '**/*.mp3'],
      manifest: {
        name: 'NagrikSetu',
        short_name: 'NagrikSetu',
        description: 'Your digital bridge to a better community.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/logo3.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/logo2.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
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