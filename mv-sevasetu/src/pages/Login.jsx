/**
 * SYSTEM DOCUMENTATION / 15-LANGUAGE TRANSLATION
 * Context: Secure Authentication Portal for SevaSetu.
 * 
 * English: Secure Authentication Portal.
 * Hindi: सुरक्षित प्रमाणीकरण पोर्टल।
 * Hinglish: Secure Authentication Portal.
 * Marathi: सुरक्षित प्रमाणीकरण पोर्टल.
 * Gujarati: સુરક્ષિત પ્રમાણીકરણ પોર્ટલ.
 * Telugu: సురక్షిత ప్రామాణీకరణ పోర్టల్.
 * Tamil: பாதுகாப்பான அங்கீகார போர்ட்டல்.
 * Kannada: ಸುರಕ್ಷಿತ ದೃಢೀಕರಣ ಪೋರ್ಟಲ್.
 * Malayalam: സുരക്ഷിത പ്രാമാണീകരണ പോർട്ടൽ.
 * Bengali: নিরাপদ প্রমাণীকরণ পোর্টাল।
 * Punjabi: ਸੁਰੱਖਿਅਤ ਪ੍ਰਮਾਣਿਕਤਾ ਪੋਰਟਲ।
 * Odia: ସୁରକ୍ଷିତ ପ୍ରମାଣୀକରଣ ପୋର୍ଟାଲ୍।
 * Assamese: সুৰক্ষিত প্ৰমাণীকৰণ পৰ্টেল।
 * Urdu: محفوظ تصدیق کا پورٹل۔
 * Bhojpuri: सुरक्षित प्रमाणीकरण पोर्टल।
 */

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { AppContext } from '../main';

const LOGIN_TRANSLATIONS = {
  en: { title: "Welcome", subtitle: "Access your account", email: "Email Address", password: "Password", signIn: "Sign In", createAccount: "Create Account", google: "Continue with Google", loading: "Processing...", error: "Authentication failed. Check your details.", toggleCreate: "Need an account? Create one", toggleLogin: "Have an account? Sign in" },
  hi: { title: "स्वागत है", subtitle: "अपना खाता एक्सेस करें", email: "ईमेल पता", password: "पासवर्ड", signIn: "साइन इन करें", createAccount: "खाता बनाएं", google: "Google के साथ जारी रखें", loading: "प्रोसेस हो रहा है...", error: "प्रमाणीकरण विफल। विवरण जांचें।", toggleCreate: "खाता चाहिए? एक बनाएं", toggleLogin: "खाता है? साइन इन करें" },
  hinglish: { title: "Welcome", subtitle: "Apna account access karein", email: "Email Address", password: "Password", signIn: "Sign In", createAccount: "Account banayein", google: "Google ke sath continue karein", loading: "Process ho raha hai...", error: "Authentication fail. Details check karein.", toggleCreate: "Account chahiye? Naya banayein", toggleLogin: "Account hai? Sign in karein" },
  mr: { title: "स्वागत आहे", subtitle: "तुमच्या खात्यात प्रवेश करा", email: "ईमेल पत्ता", password: "पासवर्ड", signIn: "साइन इन करा", createAccount: "खाते तयार करा", google: "Google सह सुरू ठेवा", loading: "प्रक्रिया करत आहे...", error: "प्रमाणीकरण अयशस्वी. तपशील तपासा.", toggleCreate: "खाते हवे आहे? एक तयार करा", toggleLogin: "खाते आहे? साइन इन करा" },
  gu: { title: "સ્વાગત છે", subtitle: "તમારું એકાઉન્ટ ઍક્સેસ કરો", email: "ઇમેઇલ સરનામું", password: "પાસવર્ડ", signIn: "સાઇન ઇન કરો", createAccount: "એકાઉન્ટ બનાવો", google: "Google સાથે ચાલુ રાખો", loading: "પ્રક્રિયા થઈ રહી છે...", error: "પ્રમાણીકરણ નિષ્ફળ. વિગતો ચકાસો.", toggleCreate: "એકાઉન્ટ જોઈએ છે? એક બનાવો", toggleLogin: "એકાઉન્ટ છે? સાઇન ઇન કરો" },
  te: { title: "స్వాగతం", subtitle: "మీ ఖాతాను యాక్సెస్ చేయండి", email: "ఇమెయిల్ చిరునామా", password: "పాస్‌వర్డ్", signIn: "సైన్ ఇన్ చేయండి", createAccount: "ఖాతా సృష్టించండి", google: "Google తో కొనసాగండి", loading: "ప్రాసెస్ చేయబడుతోంది...", error: "ప్రామాణీకరణ విఫలమైంది. వివరాలను తనిఖీ చేయండి.", toggleCreate: "ఖాతా కావాలా? ఒకటి సృష్టించండి", toggleLogin: "ఖాతా ఉందా? సైన్ ఇన్ చేయండి" },
  ta: { title: "வரவேற்கிறோம்", subtitle: "உங்கள் கணக்கை அணுகவும்", email: "மின்னஞ்சல் முகவரி", password: "கடவுச்சொல்", signIn: "உள்நுழையவும்", createAccount: "கணக்கை உருவாக்கவும்", google: "Google உடன் தொடரவும்", loading: "செயலாக்கப்படுகிறது...", error: "அங்கீகாரம் தோல்வியடைந்தது. விவரங்களை சரிபார்க்கவும்.", toggleCreate: "கணக்கு வேண்டுமா? ஒன்றை உருவாக்கவும்", toggleLogin: "கணக்கு உள்ளதா? உள்நுழையவும்" },
  kn: { title: "ಸ್ವಾಗತ", subtitle: "ನಿಮ್ಮ ಖಾತೆಯನ್ನು ಪ್ರವೇಶಿಸಿ", email: "ಇಮೇಲ್ ವಿಳಾಸ", password: "ಪಾಸ್‌ವರ್ಡ್", signIn: "ಸೈನ್ ಇನ್ ಮಾಡಿ", createAccount: "ಖಾತೆ ರಚಿಸಿ", google: "Google ನೊಂದಿಗೆ ಮುಂದುವರಿಯಿರಿ", loading: "ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲಾಗುತ್ತಿದೆ...", error: "ದೃಢೀಕರಣ ವಿಫಲವಾಗಿದೆ. ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.", toggleCreate: "ಖಾತೆ ಬೇಕೇ? ಒಂದನ್ನು ರಚಿಸಿ", toggleLogin: "ಖಾತೆ ಇದೆಯೇ? ಸೈನ್ ಇನ್ ಮಾಡಿ" },
  ml: { title: "സ്വാഗതം", subtitle: "നിങ്ങളുടെ അക്കൗണ്ട് ആക്സസ് ചെയ്യുക", email: "ഇമെയിൽ വിലാസം", password: "പാസ്‌വേഡ്", signIn: "സൈൻ ഇൻ ചെയ്യുക", createAccount: "അക്കൗണ്ട് സൃഷ്ടിക്കുക", google: "Google ഉപയോഗിച്ച് തുടരുക", loading: "പ്രോസസ്സ് ചെയ്യുന്നു...", error: "ആധികാരികത പരാജയപ്പെട്ടു. വിവരങ്ങൾ പരിശോധിക്കുക.", toggleCreate: "അക്കൗണ്ട് വേണോ? ഒരെണ്ണം സൃഷ്ടിക്കുക", toggleLogin: "അക്കൗണ്ട് ഉണ്ടോ? സൈൻ ഇൻ ചെയ്യുക" },
  bn: { title: "স্বাগতম", subtitle: "আপনার অ্যাকাউন্ট অ্যাক্সেস করুন", email: "ইমেইল ঠিকানা", password: "পাসওয়ার্ড", signIn: "সাইন ইন করুন", createAccount: "অ্যাকাউন্ট তৈরি করুন", google: "Google এর সাথে চালিয়ে যান", loading: "প্রক্রিয়া করা হচ্ছে...", error: "প্রমাণীকরণ ব্যর্থ হয়েছে। বিবরণ পরীক্ষা করুন।", toggleCreate: "অ্যাকাউন্ট প্রয়োজন? একটি তৈরি করুন", toggleLogin: "অ্যাকাউন্ট আছে? সাইন ইন করুন" },
  pa: { title: "ਜੀ ਆਇਆਂ ਨੂੰ", subtitle: "ਆਪਣੇ ਖਾਤੇ ਤੱਕ ਪਹੁੰਚ ਕਰੋ", email: "ਈਮੇਲ ਪਤਾ", password: "ਪਾਸਵਰਡ", signIn: "ਸਾਈਨ ਇਨ ਕਰੋ", createAccount: "ਖਾਤਾ ਬਣਾਓ", google: "Google ਨਾਲ ਜਾਰੀ ਰੱਖੋ", loading: "ਕਾਰਵਾਈ ਹੋ ਰਹੀ ਹੈ...", error: "ਪ੍ਰਮਾਣਿਕਤਾ ਅਸਫਲ। ਵੇਰਵੇ ਦੀ ਜਾਂਚ ਕਰੋ।", toggleCreate: "ਖਾਤਾ ਚਾਹੀਦਾ ਹੈ? ਇੱਕ ਬਣਾਓ", toggleLogin: "ਖਾਤਾ ਹੈ? ਸਾਈਨ ਇਨ ਕਰੋ" },
  or: { title: "ସ୍ୱାଗତମ୍", subtitle: "ଆପଣଙ୍କ ଖାତାକୁ ଆକ୍ସେସ୍ କରନ୍ତୁ", email: "ଇମେଲ୍ ଠିକଣା", password: "ପାସୱାର୍ଡ", signIn: "ସାଇନ୍ ଇନ୍ କରନ୍ତୁ", createAccount: "ଖାତା ସୃଷ୍ଟି କରନ୍ତୁ", google: "Google ସହିତ ଜାରି ରଖନ୍ତୁ", loading: "ପ୍ରକ୍ରିୟାକରଣ ହେଉଛି...", error: "ପ୍ରମାଣୀକରଣ ବିଫଳ ହୋଇଛି। ବିବରଣୀ ଯାଞ୍ଚ କରନ୍ତୁ।", toggleCreate: "ଖାତା ଦରକାର କି? ଗୋଟିଏ ସୃଷ୍ଟି କରନ୍ତୁ", toggleLogin: "ଖାତା ଅଛି କି? ସାଇନ୍ ଇନ୍ କରନ୍ତୁ" },
  as: { title: "স্বাগতম", subtitle: "আপোনাৰ একাউণ্ট এক্সেছ কৰক", email: "ইমেইল ঠিকনা", password: "পাছৱৰ্ড", signIn: "ছাইন ইন কৰক", createAccount: "একাউণ্ট সৃষ্টি কৰক", google: "Google ৰ সৈতে আগবাঢ়ক", loading: "প্ৰক্ৰিয়া চলি আছে...", error: "প্ৰমাণীকৰণ বিফল হৈছে। বিৱৰণ পৰীক্ষা কৰক।", toggleCreate: "একাউণ্ট লাগে নেকি? এটা সৃষ্টি কৰক", toggleLogin: "একাউণ্ট আছে নেকি? ছাইন ইন কৰক" },
  ur: { title: "خوش آمدید", subtitle: "اپنے اکاؤنٹ تک رسائی حاصل کریں", email: "ای میل ایڈریس", password: "پاس ورڈ", signIn: "سائن ان کریں", createAccount: "اکاؤنٹ بنائیں", google: "Google کے ساتھ جاری رکھیں", loading: "عمل ہو رہا ہے...", error: "تصدیق ناکام ہو گئی۔ تفصیلات چیک کریں۔", toggleCreate: "اکاؤنٹ چاہیے؟ ایک بنائیں", toggleLogin: "اکاؤنٹ ہے؟ سائن ان کریں" },
  bho: { title: "स्वागत बा", subtitle: "अपन खाता एक्सेस करीं", email: "ईमेल पता", password: "पासवर्ड", signIn: "साइन इन करीं", createAccount: "खाता बनाईं", google: "Google के साथ जारी रखीं", loading: "प्रोसेस हो रहल बा...", error: "प्रमाणीकरण विफल। विवरण जांचीं।", toggleCreate: "खाता चाहीं? एगो बनाईं", toggleLogin: "खाता बा? साइन इन करीं" }
};

export default function Login() {
  const { language, colors } = useContext(AppContext);
  const navigate = useNavigate();
  const auth = getAuth();
  const currentLang = LOGIN_TRANSLATIONS[language] || LOGIN_TRANSLATIONS.en;

  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthSuccess = () => {
    // App.jsx ProtectedRoutes will automatically intercept and route 
    // to /select-plan or dashboard based on the user's Firestore metadata.
    navigate('/');
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      handleAuthSuccess();
    } catch (error) {
      setErrorMsg(currentLang.error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg('');
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    
    try {
      await signInWithPopup(auth, provider);
      handleAuthSuccess();
    } catch (error) {
      setErrorMsg(currentLang.error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6', padding: '24px' }}>
      <div 
        style={{ 
          backgroundColor: colors.White, 
          width: '100%', 
          maxWidth: '400px', 
          borderRadius: '32px', 
          padding: '40px 32px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
          animation: 'fade-up 0.5s ease-out forwards'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ color: colors.Black, fontSize: '28px', fontWeight: '800', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
            {currentLang.title}
          </h1>
          <p style={{ color: colors.Black, opacity: 0.6, fontSize: '16px', margin: 0 }}>
            {currentLang.subtitle}
          </p>
        </div>

        {errorMsg && (
          <div style={{ backgroundColor: '#FEF2F2', border: `1px solid ${colors.Emergency}`, color: colors.Emergency, padding: '12px 16px', borderRadius: '12px', marginBottom: '24px', fontSize: '14px', fontWeight: '500', textAlign: 'center' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', color: colors.Black, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
              {currentLang.email}
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', border: '1px solid #E5E7EB', fontSize: '16px', color: colors.Black, outline: 'none', backgroundColor: '#F9FAFB', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: colors.Black, fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
              {currentLang.password}
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', border: '1px solid #E5E7EB', fontSize: '16px', color: colors.Black, outline: 'none', backgroundColor: '#F9FAFB', boxSizing: 'border-box' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            style={{ width: '100%', padding: '16px', borderRadius: '9999px', backgroundColor: colors.Primary, color: colors.White, fontSize: '16px', fontWeight: '700', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer', marginTop: '8px', opacity: isLoading ? 0.7 : 1, transition: 'opacity 0.2s' }}
          >
            {isLoading ? currentLang.loading : (isRegistering ? currentLang.createAccount : currentLang.signIn)}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', gap: '12px' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }}></div>
          <span style={{ color: colors.Black, opacity: 0.4, fontSize: '14px', fontWeight: '600' }}>OR</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }}></div>
        </div>

        <button 
          onClick={handleGoogleAuth}
          disabled={isLoading}
          type="button"
          style={{ width: '100%', padding: '16px', borderRadius: '9999px', backgroundColor: colors.White, color: colors.Black, fontSize: '16px', fontWeight: '600', border: '1px solid #E5E7EB', cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', transition: 'background-color 0.2s' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.78 15.68 17.58V20.34H19.25C21.34 18.41 22.56 15.58 22.56 12.25Z" fill="#4285F4"/>
            <path d="M12 23C14.97 23 17.46 22.02 19.25 20.34L15.68 17.58C14.71 18.23 13.46 18.62 12 18.62C9.17 18.62 6.77 16.71 5.89 14.14H2.21V16.99C4.01 20.57 7.7 23 12 23Z" fill="#34A853"/>
            <path d="M5.89 14.14C5.66 13.48 5.54 12.76 5.54 12C5.54 11.24 5.66 10.52 5.89 9.86V7.01H2.21C1.47 8.5 1.04 10.2 1.04 12C1.04 13.8 1.47 15.5 2.21 16.99L5.89 14.14Z" fill="#FBBC05"/>
            <path d="M12 5.38C13.62 5.38 15.06 5.94 16.2 7.03L19.33 3.9C17.45 2.14 14.97 1 12 1C7.7 1 4.01 3.43 2.21 7.01L5.89 9.86C6.77 7.29 9.17 5.38 12 5.38Z" fill="#EA4335"/>
          </svg>
          {currentLang.google}
        </button>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button 
            onClick={() => setIsRegistering(!isRegistering)}
            style={{ background: 'none', border: 'none', color: colors.Primary, fontSize: '14px', fontWeight: '600', cursor: 'pointer', padding: 0 }}
          >
            {isRegistering ? currentLang.toggleLogin : currentLang.toggleCreate}
          </button>
        </div>
      </div>
    </div>
  );
}