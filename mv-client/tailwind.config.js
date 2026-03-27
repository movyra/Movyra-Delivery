/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bongoBlue: '#00A3FF',
        uberBlack: '#000000',
        uberGray: '#F3F3F3',
        iosDark: '#121212',
        iosBorder: '#2A2A2A',
        // New Premium Design Tokens from Reference Images
        neonCloud: '#007AFF',
        deepMidnight: '#050505',
        // Movbot/Movyra Dark Mode Mobile Tokens
        movyraMint: '#00F0B5',
        movyraMintDark: '#00D09E',
        surfaceBlack: '#000000',
        surfaceDark: '#121212',
        surfaceDarker: '#1A1A1A',
        textGray: '#8A8A8E',
      },
      fontFamily: {
        sans: ['"SF Pro Display"', '"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"SF Mono"', 'monospace'],
        // Elegant Serif for high-end typography as seen in the references
        serif: ['"Playfair Display"', '"GT Super"', 'serif'],
      },
      borderRadius: {
        'ios': '32px',
        'uber': '12px',
        // Mobile Specific Border Radiuses
        'mobile': '32px',
        'card': '24px',
        'pill': '9999px',
      },
      boxShadow: {
        // Glowing orb effect
        'glow': '0 0 80px -10px rgba(0, 163, 255, 0.4)',
        // Movbot Mint Glow
        'mintGlow': '0 0 20px -5px rgba(0, 240, 181, 0.4)',
      }
    },
  },
  plugins: [],
}