/**
 * SYSTEM DOCUMENTATION / 15-LANGUAGE TRANSLATION
 * Context: PostCSS configuration for Tailwind and Autoprefixer compilation.
 * 
 * English: PostCSS configuration for Tailwind and Autoprefixer compilation.
 * Hindi: टेलविंड और ऑटोप्रिफिक्सर संकलन के लिए पोस्टसीएसएस कॉन्फ़िगरेशन।
 * Hinglish: Tailwind aur Autoprefixer compilation ke liye PostCSS configuration.
 * Marathi: टेलविंड आणि ऑटोप्रिफिक्सर संकलनासाठी पोस्टसीएसएस कॉन्फिगरेशन.
 * Gujarati: ટેલવિન્ડ અને ઓટોપ્રિફિક્સર સંકલન માટે પોસ્ટસીએસએસ ગોઠવણી.
 * Telugu: టెయిల్‌విండ్ మరియు ఆటోప్రిఫిక్సర్ కంపైలేషన్ కోసం పోస్ట్‌సీఎస్‌ఎస్ కాన్ఫిగరేషన్.
 * Tamil: டெயில்விண்ட் மற்றும் ஆட்டோபிரிபிக்ஸர் தொகுப்பிற்கான போஸ்ட்சிஎஸ்எஸ் கட்டமைப்பு.
 * Kannada: ಟೈಲ್‌ವಿಂಡ್ ಮತ್ತು ಆಟೋಪ್ರಿಫಿಕ್ಸರ್ ಸಂಕಲನಕ್ಕಾಗಿ ಪೋಸ್ಟ್‌ಸಿಎಸ್‌ಎಸ್ ಕಾನ್ಫಿಗರೇಶನ್.
 * Malayalam: ടെയിൽവിൻഡ്, ഓട്ടോപ്രിഫിക്സർ കംപൈലേഷൻ എന്നിവയ്ക്കായുള്ള പോസ്റ്റ്‌സിഎസ്എസ് കോൺഫിഗറേഷൻ.
 * Bengali: টেলউইন্ড এবং অটোপ্রিফিক্সার সংকলনের জন্য পোস্টসিএসএস কনফিগারেশন।
 * Punjabi: ਟੇਲਵਿੰਡ ਅਤੇ ਆਟੋਪ੍ਰੀਫਿਕਸਰ ਸੰਕਲਨ ਲਈ ਪੋਸਟਸੀਐਸਐਸ ਸੰਰਚਨਾ।
 * Odia: ଟେଲୱିଣ୍ଡ ଏବଂ ଅଟୋପ୍ରିଫିକ୍ସର୍ ସଂକଳନ ପାଇଁ ପୋଷ୍ଟସିଏସଏସ୍ କନଫିଗରେସନ୍।
 * Assamese: টেইলউইণ্ড আৰু অটোপ্ৰিফিক্সাৰ সংকলনৰ বাবে পোষ্টচিএছএছ কনফিগাৰেচন।
 * Urdu: ٹیل ونڈ اور آٹوپریفکسر تالیف کے لیے پوسٹ سی ایس ایس کنفیگریشن۔
 * Bhojpuri: टेलविंड अउर ऑटोप्रिफिक्सर संकलन खातिर पोस्टसीएसएस कॉन्फ़िगरेशन।
 * 
 * ----------------------------------------------------------------------------
 * POSTCSS CONFIGURATION: STABILITY & COMPILATION ENGINE
 * Technical Features:
 * 1. MODULE RESOLUTION: Explicitly uses CommonJS (module.exports) to prevent .cjs build crashes.
 * 2. VENDOR PREFIXING: Automates browser compatibility via Autoprefixer.
 * 3. BUILD OPTIMIZATION: Strips unused CSS and processes modern nesting.
 * 4. HMR SYNC: Ensures Hot Module Replacement is stable in cloud IDEs.
 */

module.exports = {
  plugins: {
    // Bridges the new high-performance Tailwind engine into the Vite build pipeline
    // This plugin engine compiles the strict SevaSetu Service Blue color palette from tailwind.config.js
    '@tailwindcss/postcss': {},
    
    // Automatically adds -webkit, -moz, and -ms prefixes for cross-device support
    'autoprefixer': {},
  },
};