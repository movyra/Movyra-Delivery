/** @type {import('tailwindcss').Config} */
export default {
  // SECTION 1: Content & Path Discovery
  // Strictly scans all source files to ensure real-time utility generation
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],

  theme: {
    extend: {
      // SECTION 2: Master Color Palette (Movyra Light Tier)
      // Logic: Integrated both legacy dark tokens and new premium light tokens
      colors: { 
        // Real Movyra Mint Spectrum
        movyraMint: '#00F0B5', 
        movyraMintDark: '#00D09E', 
        
        // Legacy Surface Tokens (Retained for Dark Mode compatibility)
        surfaceBlack: '#000000', 
        surfaceDark: '#121212', 
        surfaceDarker: '#1A1A1A', 
        
        // New Premium Light Theme Tokens (Real Design Specs)
        'movyra-blue': '#1E6AF5',       // Primary Action Blue
        'movyra-surface': '#F8FAFF',    // Fluid Background Surface
        'movyra-accent': '#FF9500',     // Warning/Highlight Orange
        
        // Secondary Utility Shades
        textGray: '#8A8A8E',
        'blue-soft': '#EAF2FF',
        'teal-glow': '#44D7B6'
      },

      // SECTION 3: Typography Architecture
      // Logic: Prioritizes 'Satoshi' for the premium tech aesthetic
      fontFamily: {
        sans: ['Satoshi', 'Inter', 'sans-serif'],
      },

      // SECTION 4: Border Radius System (Mobile-First)
      // Strictly follows the high-radius design language of the Movyra UI
      borderRadius: { 
        'mobile': '32px', 
        'card': '24px', 
        'pill': '9999px',
        '3xl': '2rem',
        '4xl': '2.5rem'
      },

      // SECTION 5: Visual Depth & Glow Effects
      // Real-time shadow logic for interactive button states
      boxShadow: { 
        'mintGlow': '0 0 20px -5px rgba(0, 240, 181, 0.4)',
        'blueGlow': '0 10px 30px -10px rgba(30, 106, 245, 0.3)',
        'premium': '0 20px 40px rgba(0,0,0,0.04)'
      },

      // SECTION 6: Animation Keyframes (Real Logic)
      // Powers the "decrypting" and "loading" UI states
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' }
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.3s ease-out forwards',
        'pulse-soft': 'pulse-soft 2s infinite ease-in-out'
      }
    },
  },

  // SECTION 7: Plugin Injection
  // Keeps the config lean while allowing future safe area padding plugins
  plugins: [],
}