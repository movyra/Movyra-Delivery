/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: { 
        movyraMint: '#00F0B5', 
        movyraMintDark: '#00D09E', 
        surfaceBlack: '#000000', 
        surfaceDark: '#121212', 
        surfaceDarker: '#1A1A1A', 
        textGray: '#8A8A8E',
        'movyra-blue': '#1E6AF5',
        'movyra-surface': '#F8FAFF',
        'movyra-accent': '#FF9500'
      },
      fontFamily: {
        sans: ['Satoshi', 'Inter', 'sans-serif'],
      },
      borderRadius: { 
        'mobile': '32px', 
        'card': '24px', 
        'pill': '9999px',
        '3xl': '2rem',
        '4xl': '2.5rem'
      },
      boxShadow: { 'mintGlow': '0 0 20px -5px rgba(0, 240, 181, 0.4)' }
    },
  }, plugins: [],
}