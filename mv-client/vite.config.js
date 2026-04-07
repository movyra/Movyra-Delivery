import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * VITE CONFIGURATION (INSTANT SYNC ENGINE)
 * Logic: 
 * - registerType 'autoUpdate' ensures the browser downloads the new build in the background.
 * - skipWaiting: true forces the new service worker to bypass the 'waiting' state.
 * - clientsClaim: true allows the new service worker to take control of the app immediately.
 * - optimizeDeps: Pre-bundles heavy logistics libraries to prevent 504 timeouts on refresh.
 */

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Changed to 'autoUpdate' to handle the transition without user prompts
      registerType: 'autoUpdate',
      
      workbox: {
        // Force immediate activation of the new service worker
        skipWaiting: true,
        clientsClaim: true,
        // Ensure old caches are purged immediately to save storage space
        cleanupOutdatedCaches: true,
        // Watch these patterns specifically for the 5-second heartbeat
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,webmanifest}'],
        // Increase limit to handle heavy mapping/UI assets
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024 
      },

      manifest: {
        name: 'Movyra by Bongo',
        short_name: 'Movyra',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'portrait',
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
    // Explicitly pre-bundle heavy dependencies to prevent 504 Gateway Timeouts 
    // during the high-speed background update transition.
    include: [
      '@emailjs/browser', 
      'leaflet', 
      'axios', 
      'framer-motion', 
      'lucide-react',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore'
    ]
  },

  server: {
    // Ensures stable hot-module reloading in cloud environments
    watch: {
      usePolling: true
    }
  }
});