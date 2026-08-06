/**
 * SYSTEM DOCUMENTATION / 15-LANGUAGE TRANSLATION
 * Context: PayU Payment Status Callback and Redirection Handler.
 * 
 * English: Payment Status Handler.
 * Hindi: भुगतान स्थिति हैंडलर।
 * Hinglish: Payment Status Handler.
 * Marathi: पेमेंट स्थिती हँडलर.
 * Gujarati: ચુકવણી સ્થિતિ હેન્ડલર.
 * Telugu: చెల్లింపు స్థితి హ్యాండ్లర్.
 * Tamil: கட்டண நிலை கையாளுபவர்.
 * Kannada: ಪಾವತಿ ಸ್ಥಿತಿ ನಿರ್ವಾಹಕ.
 * Malayalam: പേയ്‌മെന്റ് സ്റ്റാറ്റസ് ഹാൻഡ്‌ലർ.
 * Bengali: পেমেন্ট স্ট্যাটাস হ্যান্ডলার।
 * Punjabi: ਭੁਗਤਾਨ സਥਿਤੀ ਹੈਂਡਲਰ।
 * Odia: ପେମେଣ୍ଟ ସ୍ଥିତି ହ୍ୟାଣ୍ଡଲର୍।
 * Assamese: পেমেণ্ট স্থিতি হেণ্ডলাৰ।
 * Urdu: ادائیگی کی حیثیت ہینڈلر۔
 * Bhojpuri: भुगतान स्थिति हैंडलर।
 */

import { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../main';

const STATUS_TRANSLATIONS = {
  en: { successTitle: "Payment Successful", successDesc: "Your subscription is now active.", failTitle: "Payment Failed", failDesc: "We could not process your transaction.", redirecting: "Redirecting to dashboard...", dashboardBtn: "Go to Dashboard", retryBtn: "Try Again" },
  hi: { successTitle: "भुगतान सफल", successDesc: "आपकी सदस्यता अब सक्रिय है।", failTitle: "भुगतान विफल", failDesc: "हम आपके लेनदेन को संसाधित नहीं कर सके।", redirecting: "डैशबोर्ड पर जा रहे हैं...", dashboardBtn: "डैशबोर्ड पर जाएं", retryBtn: "पुनः प्रयास करें" },
  hinglish: { successTitle: "Payment Successful", successDesc: "Aapki subscription ab active hai.", failTitle: "Payment Fail", failDesc: "Hum aapka transaction process nahi kar sake.", redirecting: "Dashboard par redirect ho rahe hain...", dashboardBtn: "Dashboard par jayein", retryBtn: "Phir se try karein" },
  mr: { successTitle: "पेमेंट यशस्वी", successDesc: "तुमची सदस्यता आता सक्रिय आहे.", failTitle: "पेमेंट अयशस्वी", failDesc: "आम्ही तुमच्या व्यवहारावर प्रक्रिया करू शकलो नाही.", redirecting: "डॅशबोर्डवर पुनर्निर्देशित करत आहे...", dashboardBtn: "डॅशबोर्डवर जा", retryBtn: "पुन्हा प्रयत्न करा" },
  gu: { successTitle: "ચુકવણી સફળ", successDesc: "તમારું સબ્સ્ક્રિપ્શન હવે સક્રિય છે.", failTitle: "ચુકવણી નિષ્ફળ", failDesc: "અમે તમારા વ્યવહાર પર પ્રક્રિયા કરી શક્યા નથી.", redirecting: "ડેશબોર્ડ પર રીડાયરેક્ટ કરી રહ્યાં છીએ...", dashboardBtn: "ડેશબોર્ડ પર જાઓ", retryBtn: "ફરી પ્રયાસ કરો" },
  te: { successTitle: "చెల్లింపు విజయవంతమైంది", successDesc: "మీ సభ్యత్వం ఇప్పుడు సక్రియంగా ఉంది.", failTitle: "చెల్లింపు విఫలమైంది", failDesc: "మేము మీ లావాదేవీని ప్రాసెస్ చేయలేకపోయాము.", redirecting: "డాష్‌బోర్డ్‌కి దారి మళ్లిస్తోంది...", dashboardBtn: "డాష్‌బోర్డ్‌కి వెళ్లండి", retryBtn: "మళ్లీ ప్రయత్నించండి" },
  ta: { successTitle: "கட்டணம் வெற்றிகரமாக செலுத்தப்பட்டது", successDesc: "உங்கள் சந்தா இப்போது செயலில் உள்ளது.", failTitle: "கட்டணம் தோல்வியடைந்தது", failDesc: "உங்கள் பரிவர்த்தனையை எங்களால் செயல்படுத்த முடியவில்லை.", redirecting: "டாஷ்போர்டுக்கு திருப்பி விடுகிறது...", dashboardBtn: "டாஷ்போர்டுக்கு செல்லவும்", retryBtn: "மீண்டும் முயற்சிக்கவும்" },
  kn: { successTitle: "ಪಾವತಿ ಯಶಸ್ವಿಯಾಗಿದೆ", successDesc: "ನಿಮ್ಮ ಚಂದಾದಾರಿಕೆ ಈಗ ಸಕ್ರಿಯವಾಗಿದೆ.", failTitle: "ಪಾವತಿ ವಿಫಲವಾಗಿದೆ", failDesc: "ನಿಮ್ಮ ವಹಿವಾಟನ್ನು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲು ನಮಗೆ ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.", redirecting: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಮರುನಿರ್ದೇಶಿಸಲಾಗುತ್ತಿದೆ...", dashboardBtn: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹೋಗಿ", retryBtn: "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ" },
  ml: { successTitle: "പേയ്‌മെന്റ് വിജയകരം", successDesc: "നിങ്ങളുടെ സബ്‌സ്‌ക്രിപ്‌ഷൻ ഇപ്പോൾ സജീവമാണ്.", failTitle: "പേയ്‌മെന്റ് പരാജയപ്പെട്ടു", failDesc: "നിങ്ങളുടെ ഇടപാട് പ്രോസസ്സ് ചെയ്യാൻ ഞങ്ങൾക്ക് കഴിഞ്ഞില്ല.", redirecting: "ഡാഷ്‌ബോർഡിലേക്ക് തിരിച്ചുവിടുന്നു...", dashboardBtn: "ഡാഷ്‌ബോർഡിലേക്ക് പോകുക", retryBtn: "വീണ്ടും ശ്രമിക്കുക" },
  bn: { successTitle: "পেমেন্ট সফল", successDesc: "আপনার সাবস্ক্রিপশন এখন সক্রিয়।", failTitle: "পেমেন্ট ব্যর্থ হয়েছে", failDesc: "আমরা আপনার লেনদেন প্রক্রিয়া করতে পারিনি।", redirecting: "ড্যাশবোর্ডে পুনর্নির্দেশ করা হচ্ছে...", dashboardBtn: "ড্যাশবোর্ডে যান", retryBtn: "আবার চেষ্টা করুন" },
  pa: { successTitle: "ਭੁਗਤਾਨ ਸਫਲ", successDesc: "ਤੁਹਾਡੀ ਗਾਹਕੀ ਹੁਣ ਸਰਗਰਮ ਹੈ।", failTitle: "ਭੁਗਤਾਨ ਅਸਫਲ", failDesc: "ਅਸੀਂ ਤੁਹਾਡੇ ਲੈਣ-ਦੇਣ ਦੀ ਪ੍ਰਕਿਰਿਆ ਨਹੀਂ ਕਰ ਸਕੇ।", redirecting: "ਡੈਸ਼ਬੋਰਡ 'ਤੇ ਭੇਜਿਆ ਜਾ ਰਿਹਾ ਹੈ...", dashboardBtn: "ਡੈਸ਼ਬੋਰਡ 'ਤੇ ਜਾਓ", retryBtn: "ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ" },
  or: { successTitle: "ପେମେଣ୍ଟ ସଫଳ", successDesc: "ଆପଣଙ୍କ ସବସ୍କ୍ରିପସନ୍ ବର୍ତ୍ତମାନ ସକ୍ରିୟ ଅଛି।", failTitle: "ପେମେଣ୍ଟ ବିଫଳ ହେଲା", failDesc: "ଆମେ ଆପଣଙ୍କର ଟ୍ରାଞ୍ଜାକ୍ସନ୍ ପ୍ରକ୍ରିୟାକରଣ କରିପାରିଲୁ ନାହିଁ।", redirecting: "ଡାସବୋର୍ଡକୁ ପଠାଯାଉଛି...", dashboardBtn: "ଡାସବୋର୍ଡକୁ ଯାଆନ୍ତୁ", retryBtn: "ପୁନର୍ବାର ଚେଷ୍ଟା କରନ୍ତୁ" },
  as: { successTitle: "পেমেণ্ট সফল", successDesc: "আপোনাৰ চাবস্ক্ৰিপচন এতিয়া সক্ৰিয়।", failTitle: "পেমেণ্ট বিফল হৈছে", failDesc: "আমি আপোনাৰ ট্ৰেঞ্জেকচন প্ৰক্ৰিয়া কৰিব নোৱাৰিলোঁ।", redirecting: "ডেচবোৰ্ডলৈ পুনৰ নিৰ্দেশিত কৰা হৈছে...", dashboardBtn: "ডেচবোৰ্ডলৈ যাওক", retryBtn: "পুনৰ চেষ্টা কৰক" },
  ur: { successTitle: "ادائیگی کامیاب", successDesc: "آپ کی سبسکرپشن اب فعال ہے۔", failTitle: "ادائیگی ناکام", failDesc: "ہم آپ کے لین دین پر کارروائی نہیں کر سکے۔", redirecting: "ڈیش بورڈ پر بھیجا جا رہا ہے...", dashboardBtn: "ڈیش بورڈ پر جائیں", retryBtn: "دوبارہ کوشش کریں" },
  bho: { successTitle: "भुगतान सफल", successDesc: "राउर सदस्यता अब सक्रिय बा।", failTitle: "भुगतान विफल", failDesc: "हम राउर लेनदेन के प्रोसेस ना कर सकनी।", redirecting: "डैशबोर्ड पर रीडायरेक्ट कइल जा रहल बा...", dashboardBtn: "डैशबोर्ड पर जाईं", retryBtn: "फिर से कोशिश करीं" }
};

export default function PaymentStatus() {
  const { language, colors } = useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();
  const currentLang = STATUS_TRANSLATIONS[language] || STATUS_TRANSLATIONS.en;

  // Strictly extract parameters during component initialization to prevent synchronous cascading renders in useEffect
  const queryParams = new URLSearchParams(location.search);
  const initialPaymentStatus = queryParams.get('status');
  const validStatus = (initialPaymentStatus === 'success' || initialPaymentStatus === 'failure') ? initialPaymentStatus : 'failure';

  const [status] = useState(validStatus);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Auto-redirect mechanism strictly bound to the derived status
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(status === 'success' ? '/org' : '/select-plan');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, navigate]);

  const handleManualAction = () => {
    navigate(status === 'success' ? '/org' : '/select-plan');
  };

  const isSuccess = status === 'success';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6', padding: '24px' }}>
      <div 
        style={{ 
          backgroundColor: colors.White, 
          width: '100%', 
          maxWidth: '400px', 
          borderRadius: '32px', 
          padding: '40px 32px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
          textAlign: 'center',
          animation: 'fade-up 0.5s ease-out forwards',
          borderTop: `6px solid ${isSuccess ? colors.Success : colors.Emergency}`
        }}
      >
        
        {/* Animated Icon strictly using authorized colors */}
        <div style={{ 
          width: '80px', 
          height: '80px', 
          borderRadius: '50%', 
          backgroundColor: isSuccess ? `${colors.Success}15` : `${colors.Emergency}15`, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 24px auto'
        }}>
          {isSuccess ? (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={colors.Success} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          ) : (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={colors.Emergency} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          )}
        </div>

        <h1 style={{ color: colors.Black, fontSize: '24px', fontWeight: '900', margin: '0 0 12px 0' }}>
          {isSuccess ? currentLang.successTitle : currentLang.failTitle}
        </h1>
        
        <p style={{ color: colors.Black, opacity: 0.7, fontSize: '16px', margin: '0 0 24px 0', fontWeight: '500' }}>
          {isSuccess ? currentLang.successDesc : currentLang.failDesc}
        </p>

        <button 
          onClick={handleManualAction}
          style={{ 
            width: '100%', 
            padding: '16px', 
            borderRadius: '9999px', 
            backgroundColor: isSuccess ? colors.Success : colors.Primary, 
            color: colors.White, 
            fontSize: '16px', 
            fontWeight: '800', 
            border: 'none', 
            cursor: 'pointer',
            marginBottom: '16px'
          }}
        >
          {isSuccess ? currentLang.dashboardBtn : currentLang.retryBtn}
        </button>

        <p style={{ color: colors.Black, opacity: 0.5, fontSize: '13px', margin: 0, fontWeight: '600' }}>
          {currentLang.redirecting} ({countdown}s)
        </p>

      </div>
    </div>
  );
}