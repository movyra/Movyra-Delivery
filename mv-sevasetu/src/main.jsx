/**
 * SYSTEM DOCUMENTATION / 15-LANGUAGE TRANSLATION
 * Context: React entry point with global translation and strict color context.
 * 
 * English: React entry point with global translation and strict color context.
 * Hindi: वैश्विक अनुवाद और सख्त रंग संदर्भ के साथ रिएक्ट प्रवेश बिंदु।
 * Hinglish: Global translation aur strict color context ke sath React entry point.
 * Marathi: जागतिक भाषांतर आणि कठोर रंग संदर्भासह रिएक्ट एंट्री पॉइंट.
 * Gujarati: વૈશ્વિક અનુવાદ અને કડક રંગ સંદર્ભ સાથે રિએક્ટ પ્રવેશ બિંદુ.
 * Telugu: గ్లోబల్ అనువాదం మరియు ఖచ్చితమైన రంగు సందర్భంతో రియాక్ట్ ఎంట్రీ పాయింట్.
 * Tamil: உலகளாவிய மொழிபெயர்ப்பு மற்றும் கண்டிப்பான வண்ண சூழலுடன் ரியாக்ட் நுழைவுப் புள்ளி.
 * Kannada: ಜಾಗತಿಕ ಅನುವಾದ ಮತ್ತು ಕಟ್ಟುನಿಟ್ಟಾದ ಬಣ್ಣದ ಸಂದರ್ಭದೊಂದಿಗೆ ರಿಯಾಕ್ಟ್ ಪ್ರವೇಶ ಬಿಂದು.
 * Malayalam: ആഗോള വിവർത്തനവും കർശനമായ വർണ്ണ പശ്ചാത്തലവുമുള്ള റിയാക്റ്റ് എൻട്രി പോയിന്റ്.
 * Bengali: গ্লোবাল অনুবাদ এবং কঠোর রঙ প্রসঙ্গ সহ রিঅ্যাক্ট এন্ট্রি পয়েন্ট।
 * Punjabi: ਗਲੋਬਲ ਅਨੁਵਾਦ ਅਤੇ ਸਖ਼ਤ ਰੰਗ ਸੰਦਰਭ ਦੇ ਨਾਲ ਰਿਐਕਟ ਐਂਟਰੀ ਪੁਆਇੰਟ।
 * Odia: ଗ୍ଲୋବାଲ୍ ଅନୁବାଦ ଏବଂ କଠୋର ରଙ୍ଗ ପ୍ରସଙ୍ଗ ସହିତ ରିଆକ୍ଟ ଏଣ୍ଟ୍ରି ପଏଣ୍ଟ।
 * Assamese: গ্লোবেল অনুবাদ আৰু কঠোৰ ৰঙৰ প্ৰসংগৰ সৈতে ৰিএক্ত এন্ট্ৰি পইণ্ট।
 * Urdu: عالمی ترجمہ اور سخت رنگ کے تناظر کے ساتھ ری ایکٹ انٹری پوائنٹ۔
 * Bhojpuri: ग्लोबल अनुवाद अउर सख्त रंग संदर्भ के साथ रिएक्ट एंट्री पॉइंट।
 */

import { StrictMode, createContext, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// STRICT COLOR SET ENFORCEMENT
const SystemColors = {
  Primary: '#2563EB',
  Black: '#111111',
  White: '#FFFFFF',
  Success: '#16A34A',
  Emergency: '#DC2626'
};

// 15-LANGUAGE TRANSLATION DICTIONARY (SYSTEM STATES)
const SystemTranslations = {
  en: { loading: "System Loading", ready: "System Ready", error: "System Error", offline: "Network Offline" },
  hi: { loading: "सिस्टम लोड हो रहा है", ready: "सिस्टम तैयार है", error: "सिस्टम त्रुटि", offline: "नेटवर्क ऑफ़लाइन" },
  hinglish: { loading: "System load ho raha hai", ready: "System taiyar hai", error: "System error", offline: "Network offline" },
  mr: { loading: "सिस्टम लोड होत आहे", ready: "सिस्टम तयार आहे", error: "सिस्टम त्रुटी", offline: "नेटवर्क ऑफलाइन" },
  gu: { loading: "સિસ્ટમ લોડ થઈ રહી છે", ready: "સિસ્ટમ તૈયાર છે", error: "સિસ્ટમ ભૂલ", offline: "નેટવર્ક ઑફલાઇન" },
  te: { loading: "సిస్టమ్ లోడ్ అవుతోంది", ready: "సిస్టమ్ సిద్ధంగా ఉంది", error: "సిస్టమ్ లోపం", offline: "నెట్‌వర్క్ ఆఫ్‌లైన్" },
  ta: { loading: "சிஸ்டம் ஏற்றப்படுகிறது", ready: "சிஸ்டம் தயார்", error: "சிஸ்டம் பிழை", offline: "நெட்வொர்க் ஆஃப்லைன்" },
  kn: { loading: "ಸಿಸ್ಟಮ್ ಲೋಡ್ ಆಗುತ್ತಿದೆ", ready: "ಸಿಸ್ಟಮ್ ಸಿದ್ಧವಾಗಿದೆ", error: "ಸಿಸ್ಟಮ್ ದೋಷ", offline: "ನೆಟ್‌ವರ್ಕ್ ಆಫ್‌ಲೈನ್" },
  ml: { loading: "സിസ്റ്റം ലോഡുചെയ്യുന്നു", ready: "സിസ്റ്റം തയ്യാറാണ്", error: "സിസ്റ്റം പിശക്", offline: "നെറ്റ്‌വർക്ക് ഓഫ്‌ലൈൻ" },
  bn: { loading: "সিস্টেম লোড হচ্ছে", ready: "সিস্টেম প্রস্তুত", error: "সিস্টেম ত্রুটি", offline: "নেটওয়ার্ক অফলাইন" },
  pa: { loading: "ਸਿਸਟਮ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ", ready: "ਸਿਸਟਮ ਤਿਆਰ ਹੈ", error: "ਸਿਸਟਮ ਗਲਤੀ", offline: "ਨੈੱਟਵਰਕ ਆਫ਼ਲਾਈਨ" },
  or: { loading: "ସିଷ୍ଟମ୍ ଲୋଡ୍ ହେଉଛି", ready: "ସିଷ୍ଟମ୍ ପ୍ରସ୍ତୁତ", error: "ସିଷ୍ଟମ୍ ତ୍ରୁଟି", offline: "ନେଟୱାର୍କ ଅଫଲାଇନ୍" },
  as: { loading: "চিষ্টেম ল'ড হৈ আছে", ready: "চিষ্টেম প্ৰস্তুত", error: "চিষ্টেম ত্ৰুটি", offline: "নেটৱৰ্ক অফলাইন" },
  ur: { loading: "سسٹم لوڈ ہو رہا ہے", ready: "سسٹم تیار ہے", error: "سسٹم کی خرابی", offline: "نیٹ ورک آف لائن" },
  bho: { loading: "सिस्टम लोड हो रहल बा", ready: "सिस्टम तइयार बा", error: "सिस्टम त्रुटि", offline: "नेटवर्क ऑफलाइन" }
};

// GLOBAL CONTEXT INITIALIZATION
export const AppContext = createContext();

function AppProvider({ children }) {
  const [language, setLanguage] = useState('en');

  return (
    <AppContext.Provider value={{ colors: SystemColors, translations: SystemTranslations, language, setLanguage }}>
      {children}
    </AppContext.Provider>
  );
}

// REACT APPLICATION MOUNTING
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
)