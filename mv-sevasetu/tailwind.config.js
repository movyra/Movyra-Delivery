/**
 * SYSTEM DOCUMENTATION / 15-LANGUAGE TRANSLATION
 * Context: Tailwind configuration file with SevaSetu color system.
 * 
 * English: Tailwind configuration file with SevaSetu color system.
 * Hindi: सेवासेतु रंग प्रणाली के साथ टेलविंड कॉन्फ़िगरेशन फ़ाइल।
 * Hinglish: SevaSetu color system ke sath Tailwind configuration file.
 * Marathi: सेवासेतू रंग प्रणालीसह टेलविंड कॉन्फिगरेशन फाइल.
 * Gujarati: સેવાસેતુ રંગ સિસ્ટમ સાથે ટેલવિન્ડ ગોઠવણી ફાઇલ.
 * Telugu: సేవాసేతు రంగు సిస్టమ్‌తో టెయిల్‌విండ్ కాన్ఫిగరేషన్ ఫైల్.
 * Tamil: சேவாசேது வண்ண அமைப்புடன் டெயில்விண்ட் கட்டமைப்பு கோப்பு.
 * Kannada: ಸೇವಾಸೇತು ಬಣ್ಣದ ವ್ಯವಸ್ಥೆಯೊಂದಿಗೆ ಟೈಲ್‌ವಿಂಡ್ ಕಾನ್ಫಿಗರೇಶನ್ ಫೈಲ್.
 * Malayalam: സേവാ സേതു വർണ്ണ സിസ്റ്റമുള്ള ടെയിൽവിൻഡ് കോൺഫിഗറേഷൻ ഫയൽ.
 * Bengali: সেবাসেতু রঙ সিস্টেম সহ টেলউইন্ড কনফিগারেশন ফাইল।
 * Punjabi: ਸੇਵਾਸੇਤੂ ਰੰਗ ਸਿਸਟਮ ਨਾਲ ਟੇਲਵਿੰਡ ਸੰਰਚਨਾ ਫਾਈਲ।
 * Odia: ସେବାସେତୁ ରଙ୍ଗ ସିଷ୍ଟମ୍ ସହିତ ଟେଲୱିଣ୍ଡ କନଫିଗରେସନ୍ ଫାଇଲ୍।
 * Assamese: সেৱাসেতু ৰঙৰ চিষ্টেমৰ সৈতে টেইলউইণ্ড কনফিগাৰেচন ফাইল।
 * Urdu: سیوا سیتو رنگ سسٹم کے ساتھ ٹیل ونڈ کنفیگریشن فائل۔
 * Bhojpuri: सेवासेतु रंग सिस्टम के साथ टेलविंड कॉन्फ़िगरेशन फाइल।
 */

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
      // FEATURE 3: Strict SevaSetu Brand Palette
      // Replaces the legacy colors with the organization-focused Service Blue and designated status colors.
      colors: {
        sevasetu: {
          primary: '#2563EB',
          collaboration: '#60A5FA',
          light: '#EFF6FF',
        },
        deep: {
          black: '#111111',
        },
        pure: {
          white: '#FFFFFF',
        },
        success: {
          green: '#16A34A',
          light: '#ECFDF5',
        },
        emergency: {
          red: '#DC2626',
          light: '#FEF2F2',
        },
        resource: {
          amber: '#D97706',
        },
        border: {
          grey: '#E5E7EB',
        },
        disabled: {
          grey: '#9CA3AF',
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

      // FEATURE 6: Signature SevaSetu Border Radius
      // Premium, heavily rounded corners specifically requested for the floating cards and bottom navigation
      borderRadius: {
        'sevasetu-lg': '16px',
        'sevasetu-xl': '24px',
        'sevasetu-2xl': '32px',
        'sevasetu-pill': '9999px',
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
        'sevasetu-card': '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
      }
    },
  },

  // FEATURE 9: Layout & Depth Plugins
  // Standard plugins for responsive design logic and complex grid layouts
  plugins: [],
}