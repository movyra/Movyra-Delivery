import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Import the background update system
import { registerSW } from 'virtual:pwa-register'

// 15-Language Translation Dictionary for Background Update Status
const t = {
    en: "Updating application to the latest version...",
    hi: "एप्लिकेशन को नवीनतम संस्करण में अपडेट किया जा रहा है...",
    hinglish: "Application latest version par update ho raha hai...",
    mr: "अॅप्लिकेशन नवीनतम आवृत्तीवर अपडेट होत आहे...",
    gu: "એપ્લિકેશનને નવીનતમ સંસ્કરણ પર અપડેટ કરવામાં આવી રહી છે...",
    te: "అప్లికేషన్ తాజా వెర్షన్‌కు నవీకరించబడుతోంది...",
    ta: "பயன்பாடு சமீபத்திய பதிப்பிற்கு புதுப்பிக்கப்படுகிறது...",
    kn: "ಅಪ್ಲಿಕೇಶನ್ ಇತ್ತೀಚಿನ ಆವೃತ್ತಿಗೆ ನವೀಕರಿಸಲಾಗುತ್ತಿದೆ...",
    ml: "അപ്ലിക്കേഷൻ ഏറ്റവും പുതിയ പതിപ്പിലേക്ക് അപ്‌ഡേറ്റുചെയ്യുന്നു...",
    bn: "অ্যাপ্লিকেশন সর্বশেষ সংস্করণে আপডেট করা হচ্ছে...",
    pa: "ਐਪਲੀਕੇਸ਼ਨ ਨੂੰ ਨਵੀਨਤਮ ਸੰਸਕਰਣ ਵਿੱਚ ਅੱਪਡੇਟ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...",
    or: "ଆପ୍ଲିକେସନ୍ ସର୍ବଶେଷ ସଂସ୍କରଣକୁ ଅପଡେଟ୍ ହେଉଛି...",
    as: "এপ্লিকেচন শেহতীয়া সংস্কৰণলৈ আপডেট কৰা হৈছে...",
    ur: "ایپلیکیشن کو تازہ ترین ورژن میں اپ ڈیٹ کیا جا رہا ہے۔۔۔",
    bho: "एप्लिकेशन नवीनतम संस्करण में अपडेट हो रहल बा..."
};

// Faulty Service Worker polling removed.
// Replaced with a strict cleanup function to unregister corrupt workers blocking Firebase Auth.
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
            for (let registration of registrations) {
                registration.unregister().then((isUnregistered) => {
                    if (isUnregistered) {
                        const savedLang = localStorage.getItem('nagrik_lang') || navigator.language.slice(0, 2);
                        const updateMessage = t[savedLang] || t['en'];
                        console.log(`[System Notice]: ${updateMessage}`);
                    }
                });
            }
        }).catch((error) => {
            console.error('Service Worker cleanup failed:', error);
        });
    });
}

// Initialize the new silent auto-update system
const updateApp = registerSW({
  immediate: true,
  onNeedRefresh() {
    // Automatically apply the new update without requiring user action
    updateApp(true);
  },
  onOfflineReady() {
    console.log('[System Notice]: Application assets are cached for immediate loading.');
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)