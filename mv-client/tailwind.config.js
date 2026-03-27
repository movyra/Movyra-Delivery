/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bongoBlue: '#00A3FF',
        uberBlack: '#000000',
        uberGray: '#F3F3F3',
        iosDark: '#121212',
        iosBorder: '#2A2A2A',
      },
      fontFamily: {
        sans: ['"SF Pro Display"', '"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"SF Mono"', 'monospace'],
      },
      borderRadius: {
        'ios': '32px',
        'uber': '12px'
      }
    },
  },
  plugins: [],
}