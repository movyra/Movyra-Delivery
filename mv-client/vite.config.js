import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * VITE CONFIGURATION (STABILITY & INSTANT SYNC ENGINE)
 * Logic: 
 * 1. registerType 'autoUpdate' handles seamless background transitions.
 * 2. skipWaiting & clientsClaim: Forces the new service worker to take control immediately.
 * 3. optimizeDeps: PRE-BUNDLES Leaflet and React-Leaflet to fix the fatal ESM export crash.
 * 4. build.rollupOptions: Explicitly bundles map libraries to prevent module fragmentation.
 */

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Auto-update ensures the browser fetches the new version without user prompts
      registerType: 'autoUpdate',
      
      workbox: {
        // Force immediate activation of the new service worker logic
        skipWaiting: true,
        clientsClaim: true,
        // Purge old caches immediately to optimize device storage
        cleanupOutdatedCaches: true,
        // Patterns to cache for offline resilience and fast loading
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,webmanifest}'],
        // Max size set to 5MB to accommodate high-fidelity assets
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        // Runtime caching for external assets (CDN fonts and scripts)
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/unpkg\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'external-resources',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
            },
          },
        ]
      },

      manifest: {
        name: 'Movyra by AAT',
        short_name: 'Movyra',
        description: 'Premium Logistics and Delivery Platform',
        theme_color: '#F2F4F7',
        background_color: '#111111',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
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
    // PRE-BUNDLING: This is the PERMANENT FIX for 504 Timeouts and the Leaflet ESM Crash.
    include: [
      '@emailjs/browser', 
      'axios', 
      'framer-motion', 
      'lucide-react',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'react-router-dom',
      'clsx',
      'tailwind-merge',
      'zustand',
      'socket.io-client',
      // CRITICAL FIX: Force Vite to pre-bundle the map dependencies natively
      'leaflet',
      'react-leaflet'
    ],
    // REMOVED: exclude: ['leaflet'] - This was causing the fatal crash
  },

  build: {
    // Optimization: Ensure large chunks are split for better caching
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'zustand'],
          ui: ['framer-motion', 'lucide-react'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          maps: ['leaflet', 'react-leaflet'],
          socket: ['socket.io-client']
        }
      },
      // REMOVED: external: ['leaflet'] - Let Rollup handle the bundle internally
    }
  },

  server: {
    // Required for stable HMR (Hot Module Replacement) in cloud IDE environments
    watch: {
      usePolling: true
    },
    // Prevent server from crashing on minor port conflicts
    strictPort: false,
    hmr: {
      overlay: true
    }
  }
});