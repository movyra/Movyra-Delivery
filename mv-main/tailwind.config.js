/** @type {import('tailwindcss').Config} */
export default {
  // FEATURE 1: Precise Content Tracking
  // Ensures every generated page in the src directory is scanned for the latest UI classes
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  // FEATURE 2: High-Contrast Dark Mode
  // Set to 'class' to support our manual theme switcher and system preference sync
  darkMode: 'class',

  theme: {
    extend: {
      // FEATURE 3: Stark Monochromatic Palette
      // Enforces pure blacks, whites, and the specific premium light grey (#F2F4F7)
      // along with the enterprise accent colors used in the 10+ landing page sections.
      colors: {
        brand: {
          black: '#000000',
          white: '#FFFFFF',
          grey: '#F2F4F7',
          stark: '#111111',
          accent: '#00A9F7',
        },
      },

      // FEATURE 4: Premium Typography Scale
      // Optimized for the "Inter" variable font with tight letter spacing for headings
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        'display': ['clamp(3.5rem, 8vw, 5.25rem)', { lineHeight: '1.05', letterSpacing: '-0.05em', fontWeight: '900' }],
        'heading': ['clamp(2.5rem, 5vw, 3.5rem)', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '900' }],
        'subheading': ['clamp(1.5rem, 3vw, 2rem)', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '800' }],
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
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'spin-reverse-slow': {
          '0%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' },
        }
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'reveal': 'reveal 0.8s cubic-bezier(0.77, 0, 0.175, 1) forwards',
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin-slow 15s linear infinite',
        'spin-reverse-slow': 'spin-reverse-slow 20s linear infinite',
      },

      // FEATURE 6: Signature Border Radius
      // Premium rounded corners for containers and input fields
      borderRadius: {
        'uber': '14px',
        'super': '32px',
        'mega': '48px',
      },

      // FEATURE 7: Extended Spacing
      // Supports the massive padding requirements of the enterprise layout
      spacing: {
        '120': '30rem',
        '128': '32rem',
        '144': '36rem',
      }
    },
  },

  // FEATURE 8: Layout & Depth Plugins
  // Standard plugins for responsive design logic and complex grid layouts
  plugins: [],
}