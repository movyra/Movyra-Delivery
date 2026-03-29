/** @type {import('tailwindcss').Config} */
export default {
  // SECTION 1: Content & Path Discovery
  // Strictly scans all source files to ensure real-time utility generation
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],

  theme: {
    extend: {
      // SECTION 2: Master Color Palette (High-Contrast Minimalist Tier)
      // Logic: Integrated stark minimal tokens based on the new pure black/white design system
      colors: { 
        // Strict Palette Tokens (New Design Specs)
        'movyra-black': '#000000',
        'movyra-white': '#FFFFFF',
        'movyra-off-white': '#F6F6F6',
        'movyra-accent-blue': '#276EF1',
        
        // Legacy Mappings (To prevent breaking existing components during transition)
        'movyra-blue': '#276EF1',       // Mapped to stark Accent Blue
        'movyra-surface': '#FFFFFF',    // Mapped to Pure White
        'movyra-surface-alt': '#F6F6F6', // Mapped to Off-White
        'textGray': '#8A8A8E',          // Retained strictly for legacy text fallbacks
        'surfaceDark': '#121212'        // Retained strictly for legacy dark mode maps
      },

      // SECTION 3: Typography Architecture
      // Logic: Prioritizes a geometric, elongated sans-serif for the high-contrast tech aesthetic
      fontFamily: {
        sans: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        display: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
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
      // Real-time shadow logic for interactive button states (Neutralized for stark aesthetic)
      boxShadow: { 
        'blueGlow': '0 10px 30px -10px rgba(39, 110, 241, 0.3)', // Mapped to new Accent Blue
        'premium': '0 20px 40px rgba(0,0,0,0.04)',
        'stark': '0 8px 24px rgba(0,0,0,0.08)'
      },

      // SECTION 6: Animation Keyframes (Real Logic)
      // Powers the network telemetry, GPS location UI, and loading states
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' }
        },
        // Real-time GPS Location & Signal Ping Keyframes
        'ping': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '75%, 100%': { transform: 'scale(2.5)', opacity: '0' }
        },
        // Real-time Network Telemetry Pulse Keyframes
        'pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.4' }
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.3s ease-out forwards',
        'pulse-soft': 'pulse-soft 2s infinite ease-in-out',
        'ping': 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }
    },
  },

  // SECTION 7: Plugin Injection
  // Keeps the config lean while allowing future safe area padding plugins
  plugins: [],
}