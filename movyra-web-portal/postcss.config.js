/**
 * POSTCSS CONFIGURATION (STABILITY ENGINE)
 * Reason: Explicitly routes CSS processing to the @tailwindcss/postcss plugin.
 * This resolves the 'tailwindcss directly as a PostCSS plugin' error permanently.
 */
export default {
  plugins: {
    // Correct plugin for Tailwind CSS v4+ integration with Vite
    '@tailwindcss/postcss': {},
    // Handles cross-browser CSS prefixing for modern properties
    'autoprefixer': {},
  },
};