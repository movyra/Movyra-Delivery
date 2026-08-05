/**
 * SYSTEM DOCUMENTATION / 15-LANGUAGE TRANSLATION
 * Context: Secure Payment Gateway Handoff and Hash Generation.
 * 
 * English: Secure Checkout Processing.
 * Hindi: सुरक्षित चेकआउट प्रसंस्करण।
 * Hinglish: Secure Checkout Processing.
 * Marathi: सुरक्षित चेकआउट प्रक्रिया.
 * Gujarati: સુરક્ષિત ચેકઆઉટ પ્રક્રિયા.
 * Telugu: సురక్షిత చెక్అవుట్ ప్రాసెసింగ్.
 * Tamil: பாதுகாப்பான செக்அவுட் செயலாக்கம்.
 * Kannada: ಸುರಕ್ಷಿತ ಚೆಕ್‌ಔಟ್ ಪ್ರಕ್ರಿಯೆ.
 * Malayalam: സുരക്ഷിതമായ ചെക്ക്ഔട്ട് പ്രോസസ്സിംഗ്.
 * Bengali: নিরাপদ চেকআউট প্রক্রিয়াকরণ।
 * Punjabi: ਸੁਰੱਖਿਅਤ ਚੈੱਕਆਉਟ ਕਾਰਵਾਈ।
 * Odia: ସୁରକ୍ଷିତ ଚେକଆଉଟ୍ ପ୍ରକ୍ରିୟାକରଣ।
 * Assamese: সুৰক্ষিত চেকআউট প্ৰক্ৰিয়াকৰণ।
 * Urdu: محفوظ چیک آؤٹ پروسیسنگ۔
 * Bhojpuri: सुरक्षित चेकआउट प्रोसेसिंग।
 */

import React, { useState, useEffect, useRef, useContext } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { AppContext } from '../main';
import { useAuth } from '../context/AuthContext';
import { PAYU_CREDENTIALS, PAYU_CALLBACKS, getPayUEndpoint } from '../utils/payuConfig';
import { PLAN_TIERS } from '../utils/planLimits';

const CHECKOUT_TRANSLATIONS = {
  en: { title: "Secure Checkout", subtitle: "Preparing your secure payment transition.", warning: "Please do not refresh or close this page.", redirecting: "Redirecting to payment gateway...", error: "Payment initialization failed. Please try again." },
  hi: { title: "सुरक्षित चेकआउट", subtitle: "आपका सुरक्षित भुगतान संक्रमण तैयार कर रहा है।", warning: "कृपया इस पृष्ठ को रीफ्रेश या बंद न करें।", redirecting: "भुगतान गेटवे पर रीडायरेक्ट कर रहा है...", error: "भुगतान प्रारंभ विफल। कृपया पुनः प्रयास करें।" },
  hinglish: { title: "Secure Checkout", subtitle: "Aapka secure payment prepare ho raha hai.", warning: "Kripya is page ko refresh ya close na karein.", redirecting: "Payment gateway par redirect ho raha hai...", error: "Payment start fail hua. Phir se try karein." },
  mr: { title: "सुरक्षित चेकआउट", subtitle: "तुमचे सुरक्षित पेमेंट ट्रान्झिशन तयार करत आहे.", warning: "कृपया हे पृष्ठ रिफ्रेश किंवा बंद करू नका.", redirecting: "पेमेंट गेटवेवर पुनर्निर्देशित करत आहे...", error: "पेमेंट सुरू करणे अयशस्वी. कृपया पुन्हा प्रयत्न करा." },
  gu: { title: "સુરક્ષિત ચેકઆઉટ", subtitle: "તમારી સુરક્ષિત ચુકવણી સંક્રમણ તૈયાર કરી રહ્યાં છીએ.", warning: "કૃપા કરીને આ પૃષ્ઠને તાજું કરશો નહીં અથવા બંધ કરશો નહીં.", redirecting: "ચુકવણી ગેટવે પર રીડાયરેક્ટ કરી રહ્યાં છીએ...", error: "ચુકવણી પ્રારંભ નિષ્ફળ. કૃપા કરીને ફરી પ્રયાસ કરો." },
  te: { title: "సురక్షిత చెక్అవుట్", subtitle: "మీ సురక్షిత చెల్లింపు పరివర్తనను సిద్ధం చేస్తోంది.", warning: "దయచేసి ఈ పేజీని రిఫ్రెష్ చేయవద్దు లేదా మూసివేయవద్దు.", redirecting: "చెల్లింపు గేట్‌వేకి దారి మళ్లిస్తోంది...", error: "చెల్లింపు ప్రారంభం విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి." },
  ta: { title: "பாதுகாப்பான செக்அவுட்", subtitle: "உங்கள் பாதுகாப்பான கட்டண மாற்றத்தை தயார் செய்கிறது.", warning: "தயவுசெய்து இந்தப் பக்கத்தை புதுப்பிக்கவோ அல்லது மூடவோ வேண்டாம்.", redirecting: "கட்டண நுழைவாயிலுக்கு திருப்பி விடுகிறது...", error: "கட்டண துவக்கம் தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்." },
  kn: { title: "ಸುರಕ್ಷಿತ ಚೆಕ್‌ಔಟ್", subtitle: "ನಿಮ್ಮ ಸುರಕ್ಷಿತ ಪಾವತಿ ಪರಿವರ್ತನೆಯನ್ನು ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ.", warning: "ದಯವಿಟ್ಟು ಈ ಪುಟವನ್ನು ರಿಫ್ರೆಶ್ ಮಾಡಬೇಡಿ ಅಥವಾ ಮುಚ್ಚಬೇಡಿ.", redirecting: "ಪಾವತಿ ಗೇಟ್‌ವೇಗೆ ಮರುನಿರ್ದೇಶಿಸಲಾಗುತ್ತಿದೆ...", error: "ಪಾವತಿ ಪ್ರಾರಂಭ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ." },
  ml: { title: "സുരക്ഷിത ചെക്ക്ഔട്ട്", subtitle: "നിങ്ങളുടെ സുരക്ഷിത പേയ്‌മെന്റ് മാറ്റം തയ്യാറാക്കുന്നു.", warning: "ദയവായി ഈ പേജ് പുതുക്കുകയോ അടയ്ക്കുകയോ ചെയ്യരുത്.", redirecting: "പേയ്‌മെന്റ് ഗേറ്റ്‌വേയിലേക്ക് വഴിതിരിച്ചുവിടുന്നു...", error: "പേയ്‌മെന്റ് ആരംഭിക്കൽ പരാജയപ്പെട്ടു. ദയവായി വീണ്ടും ശ്രമിക്കുക." },
  bn: { title: "নিরাপদ চেকআউট", subtitle: "আপনার নিরাপদ পেমেন্ট রূপান্তর প্রস্তুত করা হচ্ছে।", warning: "দয়া করে এই পৃষ্ঠাটি রিফ্রেশ বা বন্ধ করবেন না।", redirecting: "পেমেন্ট গেটওয়েতে পুনর্নির্দেশ করা হচ্ছে...", error: "পেমেন্ট শুরু ব্যর্থ হয়েছে। আবার চেষ্টা করুন।" },
  pa: { title: "ਸੁਰੱਖਿਅਤ ਚੈੱਕਆਉਟ", subtitle: "ਤੁਹਾਡੀ ਸੁਰੱਖਿਅਤ ਭੁਗਤਾਨ ਤਬਦੀਲੀ ਤਿਆਰ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ।", warning: "ਕਿਰਪਾ ਕਰਕੇ ਇਸ ਪੰਨੇ ਨੂੰ ਰਿਫ੍ਰੈਸ਼ ਜਾਂ ਬੰਦ ਨਾ ਕਰੋ।", redirecting: "ਭੁਗਤਾਨ ਗੇਟਵੇ 'ਤੇ ਭੇਜਿਆ ਜਾ ਰਿਹਾ ਹੈ...", error: "ਭੁਗਤਾਨ ਸ਼ੁਰੂ ਕਰਨਾ ਅਸਫਲ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।" },
  or: { title: "ସୁରକ୍ଷିତ ଚେକଆଉଟ୍", subtitle: "ଆପଣଙ୍କର ସୁରକ୍ଷିତ ପେମେଣ୍ଟ ପ୍ରସ୍ତୁତ କରାଯାଉଛି।", warning: "ଦୟାକରି ଏହି ପୃଷ୍ଠାକୁ ରିଫ୍ରେସ୍ କିମ୍ବା ବନ୍ଦ କରନ୍ତୁ ନାହିଁ।", redirecting: "ପେମେଣ୍ଟ ଗେଟୱେକୁ ପଠାଯାଉଛି...", error: "ପେମେଣ୍ଟ ଆରମ୍ଭ ବିଫଳ ହେଲା। ଦୟାକରି ପୁନର୍ବାର ଚେଷ୍ଟା କରନ୍ତୁ।" },
  as: { title: "সুৰক্ষিত চেকআউট", subtitle: "আপোনাৰ সুৰক্ষিত পেমেণ্ট ট্ৰেঞ্জিচন প্ৰস্তুত কৰা হৈছে।", warning: "অনুগ্ৰহ কৰি এই পৃষ্ঠাটো ৰিফ্ৰেছ বা বন্ধ নকৰিব।", redirecting: "পেমেণ্ট গেটৱেলৈ পুনৰ নিৰ্দেশিত কৰা হৈছে...", error: "পেমেণ্ট আৰম্ভণি বিফল হৈছে। অনুগ্ৰহ কৰি পুনৰ চেষ্টা কৰক।" },
  ur: { title: "محفوظ چیک آؤٹ", subtitle: "آپ کی محفوظ ادائیگی کی منتقلی تیار کی جا رہی ہے۔", warning: "براہ کرم اس صفحہ کو ریفریش یا بند نہ کریں۔", redirecting: "ادائیگی گیٹ وے پر بھیجا جا رہا ہے...", error: "ادائیگی کا آغاز ناکام ہو گیا۔ براہ کرم دوبارہ کوشش کریں۔" },
  bho: { title: "सुरक्षित चेकआउट", subtitle: "राउर सुरक्षित भुगतान संक्रमण तइयार कइल जा रहल बा।", warning: "कृपया एह पेज के रिफ्रेश भा बंद मत करीं।", redirecting: "भुगतान गेटवे पर रीडायरेक्ट कइल जा रहल बा...", error: "भुगतान प्रारंभ विफल। कृपया फिर से कोशिश करीं।" }
};

export default function Checkout() {
  const { language, colors } = useContext(AppContext);
  const { user, isSuperAdmin } = useAuth();
  const location = useLocation();
  const formRef = useRef(null);
  
  const currentLang = CHECKOUT_TRANSLATIONS[language] || CHECKOUT_TRANSLATIONS.en;
  
  const [paymentData, setPaymentData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Extract selected plan from navigation state
  const selectedPlan = location.state?.selectedPlan;

  useEffect(() => {
    if (!selectedPlan || !user) return;

    const initializePayment = async () => {
      try {
        const planDetails = PLAN_TIERS[selectedPlan];
        const amount = planDetails.price;

        // If amount is 0 (Free Plan), bypass payment gateway and route directly to dashboard
        if (amount === 0) {
          window.location.href = '/org';
          return;
        }

        const functions = getFunctions();
        const generateHash = httpsCallable(functions, 'generatePayUHash');

        const transactionId = 'TXN' + Date.now() + Math.floor(Math.random() * 1000);
        const productInfo = `SevaSetu ${selectedPlan} Subscription`;

        // Request secure SHA-512 hash from Firebase Backend
        const response = await generateHash({
          txnid: transactionId,
          amount: amount.toString(),
          productinfo: productInfo,
          firstname: user.displayName || 'Organization',
          email: user.email,
          phone: '9999999999' // Fallback for required field if missing from auth object
        });

        const { hash } = response.data;

        setPaymentData({
          key: PAYU_CREDENTIALS.MERCHANT_KEY,
          txnid: transactionId,
          amount: amount.toString(),
          productinfo: productInfo,
          firstname: user.displayName || 'Organization',
          email: user.email,
          phone: '9999999999',
          surl: PAYU_CALLBACKS.SUCCESS_URL,
          furl: PAYU_CALLBACKS.FAILURE_URL,
          hash: hash,
          service_provider: 'payu_paisa'
        });

      } catch (error) {
        console.error("Hash generation error:", error);
        setErrorMsg(currentLang.error);
      }
    };

    initializePayment();
  }, [selectedPlan, user, currentLang]);

  // Automatically submit the form once paymentData state is populated securely
  useEffect(() => {
    if (paymentData && formRef.current) {
      formRef.current.submit();
    }
  }, [paymentData]);

  if (!selectedPlan) {
    return <Navigate to="/select-plan" replace />;
  }

  const payuUrl = getPayUEndpoint(isSuperAdmin);

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
          animation: 'fade-up 0.5s ease-out forwards'
        }}
      >
        <div style={{ 
          width: '64px', 
          height: '64px', 
          borderRadius: '50%', 
          backgroundColor: `${colors.Primary}15`, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          margin: '0 auto 24px auto',
          animation: 'spin-slow 3s linear infinite'
        }}>
          <div style={{ width: '32px', height: '32px', border: `4px solid ${colors.Primary}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin-slow 1s linear infinite' }}></div>
        </div>

        <h1 style={{ color: colors.Black, fontSize: '24px', fontWeight: '900', margin: '0 0 12px 0' }}>
          {currentLang.title}
        </h1>
        
        {errorMsg ? (
          <div style={{ backgroundColor: '#FEF2F2', border: `1px solid ${colors.Emergency}`, color: colors.Emergency, padding: '12px 16px', borderRadius: '12px', marginTop: '16px', fontSize: '14px', fontWeight: '600' }}>
            {errorMsg}
          </div>
        ) : (
          <>
            <p style={{ color: colors.Black, opacity: 0.7, fontSize: '16px', margin: '0 0 16px 0', fontWeight: '500' }}>
              {currentLang.subtitle}
            </p>
            <p style={{ color: colors.Primary, fontSize: '14px', margin: '0 0 8px 0', fontWeight: '700' }}>
              {currentLang.redirecting}
            </p>
            <p style={{ color: colors.Emergency, fontSize: '12px', margin: 0, fontWeight: '700' }}>
              {currentLang.warning}
            </p>
          </>
        )}

        {/* Hidden Form strictly required for PayU POST redirection */}
        {paymentData && (
          <form ref={formRef} action={payuUrl} method="POST" style={{ display: 'none' }}>
            <input type="hidden" name="key" value={paymentData.key} />
            <input type="hidden" name="txnid" value={paymentData.txnid} />
            <input type="hidden" name="amount" value={paymentData.amount} />
            <input type="hidden" name="productinfo" value={paymentData.productinfo} />
            <input type="hidden" name="firstname" value={paymentData.firstname} />
            <input type="hidden" name="email" value={paymentData.email} />
            <input type="hidden" name="phone" value={paymentData.phone} />
            <input type="hidden" name="surl" value={paymentData.surl} />
            <input type="hidden" name="furl" value={paymentData.furl} />
            <input type="hidden" name="hash" value={paymentData.hash} />
            <input type="hidden" name="service_provider" value={paymentData.service_provider} />
          </form>
        )}
      </div>
    </div>
  );
}