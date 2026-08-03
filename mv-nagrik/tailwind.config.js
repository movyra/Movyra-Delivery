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
      // FEATURE 3: Strict NagrikSetu Brand Palette
      // Replaces the Movyra blue with the citizen-focused Teal and designated status colors.
      colors: {
        civic: {
          teal: '#00897B',
          light: '#E0F2F1',
        },
        deep: {
          black: '#111111',
        },
        action: {
          yellow: '#FFB300',
        },
        success: {
          green: '#2E7D32',
          light: '#E8F5E9',
        },
        emergency: {
          red: '#D32F2F',
        },
        info: {
          blue: '#1565C0',
          light: '#E3F2FD',
        },
        border: {
          grey: '#E0E0E0',
        },
        disabled: {
          grey: '#9E9E9E',
        }
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
      // Custom keyframes for hardware-accelerated transitions
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

      // FEATURE 6: Signature NagrikSetu Border Radius
      // Premium, heavily rounded corners specifically requested for the floating cards
      borderRadius: {
        'nagrik-lg': '16px',
        'nagrik-xl': '24px',
        'nagrik-2xl': '32px',
        'nagrik-pill': '9999px',
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
      },
      
      // FEATURE 8: Depth Integration
      boxShadow: {
        'upward': '0 -4px 6px -1px rgba(0, 0, 0, 0.05), 0 -2px 4px -1px rgba(0, 0, 0, 0.03)',
        'nagrik-card': '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
      }
    },
  },

  // FEATURE 9: Layout & Depth Plugins
  // Standard plugins for responsive design logic and complex grid layouts
  plugins: [],
}