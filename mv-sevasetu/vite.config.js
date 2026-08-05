/**
 * SYSTEM DOCUMENTATION / 15-LANGUAGE TRANSLATION
 * Context: Vite bundler configuration for SevaSetu platform.
 * 
 * English: Vite bundler configuration for SevaSetu platform.
 * Hindi: सेवासेतु प्लेटफॉर्म के लिए वाइट बंडलर कॉन्फ़िगरेशन।
 * Hinglish: SevaSetu platform ke liye Vite bundler configuration.
 * Marathi: सेवासेतू प्लॅटफॉर्मसाठी व्हिट बंडलर कॉन्फिगरेशन.
 * Gujarati: સેવાસેતુ પ્લેટફોર્મ માટે વાઇટ બંડલર ગોઠવણી.
 * Telugu: సేవాసేతు ప్లాట్‌ఫారమ్ కోసం వైట్ బండ్లర్ కాన్ఫిగరేషన్.
 * Tamil: சேவாசேது தளத்திற்கான வைட் பண்ட்லர் கட்டமைப்பு.
 * Kannada: ಸೇವಾಸೇತು ಪ್ಲಾಟ್‌ಫಾರ್ಮ್‌ಗಾಗಿ ವೈಟ್ ಬಂಡ್ಲರ್ ಕಾನ್ಫಿಗರೇಶನ್.
 * Malayalam: സേവാ സേതു പ്ലാറ്റ്‌ഫോമിനായുള്ള വൈറ്റ് ബണ്ട്ലർ കോൺഫിഗറേഷൻ.
 * Bengali: সেবাসেতু প্ল্যাটফর্মের জন্য ভাইট বান্ডলার কনফিগারেশন।
 * Punjabi: ਸੇਵਾਸੇਤੂ ਪਲੇਟਫਾਰਮ ਲਈ ਵਾਈਟ ਬੰਡਲਰ ਸੰਰਚਨਾ।
 * Odia: ସେବାସେତୁ ପ୍ଲାଟଫର୍ମ ପାଇଁ ଭାଇଟ୍ ବଣ୍ଡଲର୍ କନଫିଗରେସନ୍।
 * Assamese: সেৱাসেতু প্লেটফৰ্মৰ বাবে ভাইট বাণ্ডলাৰ কনফিগাৰেচন।
 * Urdu: سیوا سیتو پلیٹ فارم کے لیے وائٹ بنڈلر کنفیگریشن۔
 * Bhojpuri: सेवासेतु प्लेटफॉर्म खातिर वाइट बंडलर कॉन्फ़िगरेशन।
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    strictPort: true,
    proxy: {
      '/__': {
        target: 'https://msevasetu.web.app',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
});