import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Movyra by Bongo',
        short_name: 'Movyra',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        icons: [
          {
            src: '/logo.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  optimizeDeps: {
    // Explicitly pre-bundle heavy dependencies to prevent 504 Gateway Timeouts during lazy loading transitions
    include: ['@emailjs/browser', 'mapbox-gl', 'axios', 'framer-motion', 'lucide-react']
  },
  server: {
    // Ensures stable hot-module reloading and prevents network drops in cloud environments
    watch: {
      usePolling: true
    }
  }
});