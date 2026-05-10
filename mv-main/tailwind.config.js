/** @type {import('tailwindcss').Config} */
export default {
  // FEATURE 1: Precise Content Tracking
  // Ensures every generated page in the src/pages directory is scanned for the latest UI classes
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  // FEATURE 2: High-Contrast Dark Mode
  // Set to 'class' to support our manual theme switcher and system preference sync
  darkMode: 'class',

  theme: {
    extend: {
      // FEATURE 3: Stark Monochromatic Palette (Uber-Style)
      // Enforces pure blacks, whites, and the specific premium light grey (#F2F4F7)
      colors: {
        brand: {
          black: '#000000',
          white: '#FFFFFF',
          grey: '#F2F4F7',
          stark: '#111111', // Used for secondary text contrast
        },
      },

      // FEATURE 4: Premium Typography Scale
      // Optimized for the "Inter" variable font with tight letter spacing for headings
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        'display': ['clamp(3.5rem, 8vw, 5.25rem)', { lineHeight: '1.05', letterSpacing: '-0.05em', fontWeight: '900' }],
        'heading': ['clamp(2.5rem, 5vw, 3rem)', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '900' }],
      },

      // FEATURE 5: Real-Time Interaction Animations
      // Custom keyframes for hardware-accelerated transitions used in the landing page sections
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'reveal': {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'reveal': 'reveal 0.8s cubic-bezier(0.77, 0, 0.175, 1) forwards',
        'float': 'float 3s ease-in-out infinite',
      },

      // FEATURE 6: Signature Border Radius
      // Uber-style rounded corners for containers and input fields
      borderRadius: {
        'uber': '14px',
        'super': '32px',
        'mega': '48px',
      },
    },
  },

  // FEATURE 7: Layout & Depth Plugins
  // Standard plugins for responsive design logic and complex grid layouts
  plugins: [],
}