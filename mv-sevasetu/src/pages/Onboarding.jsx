/**
 * SYSTEM DOCUMENTATION / 15-LANGUAGE TRANSLATION
 * Context: Organization Registration and Onboarding Portal.
 * 
 * English: Organization Registration.
 * Hindi: संगठन पंजीकरण।
 * Hinglish: Organization Registration.
 * Marathi: संस्था नोंदणी.
 * Gujarati: સંસ્થા નોંધણી.
 * Telugu: సంస్థ నమోదు.
 * Tamil: நிறுவன பதிவு.
 * Kannada: ಸಂಸ್ಥೆಯ ನೋಂದಣಿ.
 * Malayalam: സ്ഥാപന രജിസ്ട്രേഷൻ.
 * Bengali: প্রতিষ্ঠান নিবন্ধন।
 * Punjabi: ਸੰਸਥਾ ਰਜਿਸਟ੍ਰੇਸ਼ਨ।
 * Odia: ସଂସ୍ଥା ପଞ୍ଜିକରଣ।
 * Assamese: সংস্থা পঞ্জীয়ন।
 * Urdu: تنظیم کی رجسٹریشن۔
 * Bhojpuri: संगठन पंजीकरण।
 */

import { useState, useContext } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { AppContext } from '../main';

const ONBOARDING_TRANSLATIONS = {
  en: { title: "Organization Registration", subtitle: "Complete your account setup", selectedPlan: "Selected Plan", orgName: "Organization Name", email: "Email Address", password: "Password", phone: "Contact Number", register: "Create Account", loading: "Processing...", error: "Registration failed. Check details.", planError: "Please select a plan first." },
  hi: { title: "संगठन पंजीकरण", subtitle: "अपना खाता सेटअप पूरा करें", selectedPlan: "चयनित योजना", orgName: "संगठन का नाम", email: "ईमेल पता", password: "पासवर्ड", phone: "संपर्क नंबर", register: "खाता बनाएं", loading: "प्रोसेस हो रहा है...", error: "पंजीकरण विफल। विवरण जांचें।", planError: "कृपया पहले एक योजना चुनें।" },
  hinglish: { title: "Organization Registration", subtitle: "Apna account setup pura karein", selectedPlan: "Selected Plan", orgName: "Organization Name", email: "Email Address", password: "Password", phone: "Contact Number", register: "Account Banayein", loading: "Process ho raha hai...", error: "Registration fail. Details check karein.", planError: "Pehle plan select karein." },
  mr: { title: "संस्था नोंदणी", subtitle: "तुमचे खाते सेटअप पूर्ण करा", selectedPlan: "निवडलेली योजना", orgName: "संस्थेचे नाव", email: "ईमेल पत्ता", password: "पासवर्ड", phone: "संपर्क क्रमांक", register: "खाते तयार करा", loading: "प्रक्रिया करत आहे...", error: "नोंदणी अयशस्वी. तपशील तपासा.", planError: "कृपया प्रथम योजना निवडा." },
  gu: { title: "સંસ્થા નોંધણી", subtitle: "તમારું એકાઉન્ટ સેટઅપ પૂર્ણ કરો", selectedPlan: "પસંદ કરેલ પ્લાન", orgName: "સંસ્થાનું નામ", email: "ઇમેઇલ સરનામું", password: "પાસવર્ડ", phone: "સંપર્ક નંબર", register: "એકાઉન્ટ બનાવો", loading: "પ્રક્રિયા થઈ રહી છે...", error: "નોંધણી નિષ્ફળ. વિગતો ચકાસો.", planError: "કૃપા કરીને પહેલા પ્લાન પસંદ કરો." },
  te: { title: "సంస్థ నమోదు", subtitle: "మీ ఖాతా సెటప్‌ను పూర్తి చేయండి", selectedPlan: "ఎంచుకున్న ప్లాన్", orgName: "సంస్థ పేరు", email: "ఇమెయిల్ చిరునామా", password: "పాస్‌వర్డ్", phone: "సంప్రదింపు నంబర్", register: "ఖాతా సృష్టించండి", loading: "ప్రాసెస్ చేయబడుతోంది...", error: "నమోదు విఫలమైంది. వివరాలను తనిఖీ చేయండి.", planError: "దయచేసి ముందుగా ప్లాన్‌ను ఎంచుకోండి." },
  ta: { title: "நிறுவன பதிவு", subtitle: "உங்கள் கணக்கு அமைப்பை முடிக்கவும்", selectedPlan: "தேர்ந்தெடுக்கப்பட்ட திட்டம்", orgName: "நிறுவனத்தின் பெயர்", email: "மின்னஞ்சல் முகவரி", password: "கடவுச்சொல்", phone: "தொடர்பு எண்", register: "கணக்கை உருவாக்கவும்", loading: "செயலாக்கப்படுகிறது...", error: "பதிவு தோல்வியடைந்தது. விவரங்களை சரிபார்க்கவும்.", planError: "முதலில் ஒரு திட்டத்தை தேர்ந்தெடுக்கவும்." },
  kn: { title: "ಸಂಸ್ಥೆಯ ನೋಂದಣಿ", subtitle: "ನಿಮ್ಮ ಖಾತೆ ಸೆಟಪ್ ಪೂರ್ಣಗೊಳಿಸಿ", selectedPlan: "ಆಯ್ಕೆಮಾಡಿದ ಯೋಜನೆ", orgName: "ಸಂಸ್ಥೆಯ ಹೆಸರು", email: "ಇಮೇಲ್ ವಿಳಾಸ", password: "ಪಾಸ್‌ವರ್ಡ್", phone: "ಸಂಪರ್ಕ ಸಂಖ್ಯೆ", register: "ಖಾತೆ ರಚಿಸಿ", loading: "ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲಾಗುತ್ತಿದೆ...", error: "ನೋಂದಣಿ ವಿಫಲವಾಗಿದೆ. ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.", planError: "ದಯವಿಟ್ಟು ಮೊದಲು ಯೋಜನೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ." },
  ml: { title: "സ്ഥാപന രജിസ്ട്രേഷൻ", subtitle: "നിങ്ങളുടെ അക്കൗണ്ട് സജ്ജീകരണം പൂർത്തിയാക്കുക", selectedPlan: "തിരഞ്ഞെടുത്ത പ്ലാൻ", orgName: "സ്ഥാപനത്തിന്റെ പേര്", email: "ഇമെയിൽ വിലാസം", password: "പാസ്‌വേഡ്", phone: "ബന്ധപ്പെടേണ്ട നമ്പർ", register: "അക്കൗണ്ട് സൃഷ്ടിക്കുക", loading: "പ്രോസസ്സ് ചെയ്യുന്നു...", error: "രജിസ്ട്രേഷൻ പരാജയപ്പെട്ടു. വിവരങ്ങൾ പരിശോധിക്കുക.", planError: "ആദ്യം ഒരു പ്ലാൻ തിരഞ്ഞെടുക്കുക." },
  bn: { title: "প্রতিষ্ঠান নিবন্ধন", subtitle: "আপনার অ্যাকাউন্ট সেটআপ সম্পূর্ণ করুন", selectedPlan: "নির্বাচিত প্ল্যান", orgName: "প্রতিষ্ঠানের নাম", email: "ইমেইল ঠিকানা", password: "পাসওয়ার্ড", phone: "যোগাযোগের নম্বর", register: "অ্যাকাউন্ট তৈরি করুন", loading: "প্রক্রিয়া করা হচ্ছে...", error: "নিবন্ধন ব্যর্থ হয়েছে। বিবরণ পরীক্ষা করুন।", planError: "প্রথমে একটি প্ল্যান নির্বাচন করুন।" },
  pa: { title: "ਸੰਸਥਾ ਰਜਿਸਟ੍ਰੇਸ਼ਨ", subtitle: "ਆਪਣਾ ਖਾਤਾ ਸੈੱਟਅੱਪ ਪੂਰਾ ਕਰੋ", selectedPlan: "ਚੁਣੀ ਗਈ ਯੋਜਨਾ", orgName: "ਸੰਸਥਾ ਦਾ ਨਾਮ", email: "ਈਮੇਲ ਪਤਾ", password: "ਪਾਸਵਰਡ", phone: "ਸੰਪਰਕ ਨੰਬਰ", register: "ਖਾਤਾ ਬਣਾਓ", loading: "ਕਾਰਵਾਈ ਹੋ ਰਹੀ ਹੈ...", error: "ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਅਸਫਲ। ਵੇਰਵੇ ਦੀ ਜਾਂਚ ਕਰੋ।", planError: "ਕਿਰਪਾ ਕਰਕੇ ਪਹਿਲਾਂ ਯੋਜਨਾ ਚੁਣੋ।" },
  or: { title: "ସଂସ୍ଥା ପଞ୍ଜିକରଣ", subtitle: "ଆପଣଙ୍କ ଖାତା ସେଟଅପ୍ ସମ୍ପୂର୍ଣ୍ଣ କରନ୍ତୁ", selectedPlan: "ମନୋନୀତ ପ୍ଲାନ୍", orgName: "ସଂସ୍ଥାର ନାମ", email: "ଇମେଲ୍ ଠିକଣା", password: "ପାସୱାର୍ଡ", phone: "ଯୋଗାଯୋଗ ନମ୍ବର", register: "ଖାତା ସୃଷ୍ଟି କରନ୍ତୁ", loading: "ପ୍ରକ୍ରିୟାକରଣ ହେଉଛି...", error: "ପଞ୍ଜିକରଣ ବିଫଳ ହୋଇଛି। ବିବରଣୀ ଯାଞ୍ଚ କରନ୍ତୁ।", planError: "ଦୟାକରି ପ୍ରଥମେ ଏକ ପ୍ଲାନ୍ ବାଛନ୍ତୁ।" },
  as: { title: "সংস্থা পঞ্জীয়ন", subtitle: "আপোনাৰ একাউণ্ট ছেটআপ সম্পূৰ্ণ কৰক", selectedPlan: "নিৰ্বাচিত প্লেন", orgName: "সংস্থাৰ নাম", email: "ইমেইল ঠিকনা", password: "পাছৱৰ্ড", phone: "যোগাযোগৰ নম্বৰ", register: "একাউণ্ট সৃষ্টি কৰক", loading: "প্ৰক্ৰিয়া চলি আছে...", error: "পঞ্জীয়ন বিফল হৈছে। বিৱৰণ পৰীক্ষা কৰক।", planError: "অনুগ্ৰহ কৰি প্ৰথমে এটা প্লেন বাছনি কৰক।" },
  ur: { title: "تنظیم کی رجسٹریشن", subtitle: "اپنے اکاؤنٹ کا سیٹ اپ مکمل کریں", selectedPlan: "منتخب کردہ پلان", orgName: "تنظیم کا نام", email: "ای میل ایڈریس", password: "پاس ورڈ", phone: "رابطہ نمبر", register: "اکاؤنٹ بنائیں", loading: "عمل ہو رہا ہے...", error: "رجسٹریشن ناکام ہو گئی۔ تفصیلات چیک کریں۔", planError: "براہ کرم پہلے ایک پلان منتخب کریں۔" },
  bho: { title: "संगठन पंजीकरण", subtitle: "अपन खाता सेटअप पूरा करीं", selectedPlan: "चयनित योजना", orgName: "संगठन के नाम", email: "ईमेल पता", password: "पासवर्ड", phone: "संपर्क नंबर", register: "खाता बनाईं", loading: "प्रोसेस हो रहल बा...", error: "पंजीकरण विफल। विवरण जांचीं।", planError: "कृपया पहिले योजना चुनीं।" }
};

export default function Onboarding() {
  const { language, colors } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const currentLang = ONBOARDING_TRANSLATIONS[language] || ONBOARDING_TRANSLATIONS.en;
  
  const auth = getAuth();
  const db = getFirestore();

  const [orgName, setOrgName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Strict Interception: Extract plan from routing state
  const selectedPlan = location.state?.selectedPlan;

  // Strict Guard: Redirect to selection if payload is missing
  if (!selectedPlan) {
    return <Navigate to="/select-plan" replace />;
  }

  const handleRegistration = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      // 1. Create secure authentication identity
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Bind strict metadata payload to Firestore
      const orgPayload = {
        orgName: orgName,
        email: email,
        phone: phone,
        role: 'organization',
        planTier: selectedPlan,
        createdAt: serverTimestamp(),
        verificationStatus: 'pending'
      };

      await setDoc(doc(db, 'users', user.uid), orgPayload);

      // 3. App.jsx ProtectedRoutes will now detect the role and route to /org dashboard
      navigate('/org');
    } catch (error) {
      console.error(error);
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
          maxWidth: '500px', 
          borderRadius: '32px', 
          padding: '40px 32px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
          animation: 'fade-up 0.5s ease-out forwards'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ color: colors.Black, fontSize: '28px', fontWeight: '900', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
            {currentLang.title}
          </h1>
          <p style={{ color: colors.Black, opacity: 0.6, fontSize: '16px', margin: 0, fontWeight: '500' }}>
            {currentLang.subtitle}
          </p>
        </div>

        {/* Selected Plan Display Badge */}
        <div style={{ backgroundColor: '#EFF6FF', border: `1px solid ${colors.Primary}`, padding: '16px', borderRadius: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: colors.Black, fontSize: '14px', fontWeight: '600' }}>{currentLang.selectedPlan}</span>
          <span style={{ backgroundColor: colors.Primary, color: colors.White, padding: '4px 12px', borderRadius: '9999px', fontSize: '14px', fontWeight: '700' }}>{selectedPlan}</span>
        </div>

        {errorMsg && (
          <div style={{ backgroundColor: '#FEF2F2', border: `1px solid ${colors.Emergency}`, color: colors.Emergency, padding: '12px 16px', borderRadius: '12px', marginBottom: '24px', fontSize: '14px', fontWeight: '600', textAlign: 'center' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegistration} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <label style={{ display: 'block', color: colors.Black, fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>
              {currentLang.orgName}
            </label>
            <input 
              type="text" 
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              required
              style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', border: '1px solid #E5E7EB', fontSize: '16px', color: colors.Black, outline: 'none', backgroundColor: '#F9FAFB', boxSizing: 'border-box', fontWeight: '500' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: colors.Black, fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>
              {currentLang.email}
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', border: '1px solid #E5E7EB', fontSize: '16px', color: colors.Black, outline: 'none', backgroundColor: '#F9FAFB', boxSizing: 'border-box', fontWeight: '500' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: colors.Black, fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>
              {currentLang.password}
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', border: '1px solid #E5E7EB', fontSize: '16px', color: colors.Black, outline: 'none', backgroundColor: '#F9FAFB', boxSizing: 'border-box', fontWeight: '500' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: colors.Black, fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>
              {currentLang.phone}
            </label>
            <input 
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', border: '1px solid #E5E7EB', fontSize: '16px', color: colors.Black, outline: 'none', backgroundColor: '#F9FAFB', boxSizing: 'border-box', fontWeight: '500' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            style={{ width: '100%', padding: '16px', borderRadius: '9999px', backgroundColor: colors.Primary, color: colors.White, fontSize: '16px', fontWeight: '800', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer', marginTop: '12px', opacity: isLoading ? 0.7 : 1, transition: 'opacity 0.2s' }}
          >
            {isLoading ? currentLang.loading : currentLang.register}
          </button>
        </form>

      </div>
    </div>
  );
}