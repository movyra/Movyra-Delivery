/**
 * SYSTEM DOCUMENTATION / 15-LANGUAGE TRANSLATION
 * Context: Mandatory Subscription Plan Selection Screen.
 * 
 * English: Select Subscription Plan.
 * Hindi: सदस्यता योजना चुनें।
 * Hinglish: Subscription plan select karein.
 * Marathi: सदस्यता योजना निवडा.
 * Gujarati: સબ્સ્ક્રિપ્શન પ્લાન પસંદ કરો.
 * Telugu: సబ్‌స్క్రిప్షన్ ప్లాన్ ఎంచుకోండి.
 * Tamil: சந்தா திட்டத்தை தேர்ந்தெடுக்கவும்.
 * Kannada: ಚಂದಾದಾರಿಕೆ ಯೋಜನೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.
 * Malayalam: സബ്സ്ക്രിപ്ഷൻ പ്ലാൻ തിരഞ്ഞെടുക്കുക.
 * Bengali: সাবস্ক্রিপশন প্ল্যান নির্বাচন করুন।
 * Punjabi: ਗਾਹਕੀ ਯੋਜਨਾ ਚੁਣੋ।
 * Odia: ସବସ୍କ୍ରିପସନ୍ ପ୍ଲାନ୍ ବାଛନ୍ତୁ।
 * Assamese: চাবস্ক্ৰিপচন প্লেন বাছনি কৰক।
 * Urdu: سبسکرپشن پلان منتخب کریں۔
 * Bhojpuri: सदस्यता योजना चुनीं।
 */

import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../main';
import { PLAN_TIERS } from '../utils/planLimits';

const PLAN_TRANSLATIONS = {
  en: { title: "Select Subscription Plan", subtitle: "Choose a tier to register your organization", month: "/month", cases: "Active Cases", volunteers: "Volunteers", radius: "Service Radius", analytics: "Data Analytics", support: "Priority Support", badge: "Verification Badge", select: "Select Plan", unlimited: "Unlimited", km: "km" },
  hi: { title: "सदस्यता योजना चुनें", subtitle: "अपने संगठन को पंजीकृत करने के लिए एक टियर चुनें", month: "/महीना", cases: "सक्रिय मामले", volunteers: "स्वयंसेवक", radius: "सेवा क्षेत्र", analytics: "डेटा एनालिटिक्स", support: "प्राथमिकता सहायता", badge: "सत्यापन बैज", select: "योजना चुनें", unlimited: "असीमित", km: "किमी" },
  hinglish: { title: "Subscription Plan Chunein", subtitle: "Organization register karne ke liye tier select karein", month: "/month", cases: "Active Cases", volunteers: "Volunteers", radius: "Service Radius", analytics: "Data Analytics", support: "Priority Support", badge: "Verification Badge", select: "Plan Select Karein", unlimited: "Unlimited", km: "km" },
  mr: { title: "सदस्यता योजना निवडा", subtitle: "तुमच्या संस्थेची नोंदणी करण्यासाठी टियर निवडा", month: "/महिना", cases: "सक्रिय प्रकरणे", volunteers: "स्वयंसेवक", radius: "सेवा क्षेत्र", analytics: "डेटा अॅनालिटिक्स", support: "प्राधान्य समर्थन", badge: "सत्यापन बॅज", select: "योजना निवडा", unlimited: "अमर्यादित", km: "किमी" },
  gu: { title: "સબ્સ્ક્રિપ્શન પ્લાન પસંદ કરો", subtitle: "તમારી સંસ્થાની નોંધણી કરવા માટે ટિયર પસંદ કરો", month: "/મહિનો", cases: "સક્રિય કેસ", volunteers: "સ્વયંસેવકો", radius: "સેવા ત્રિજ્યા", analytics: "ડેટા એનાલિટિક્સ", support: "પ્રાધાન્યતા સપોર્ટ", badge: "ચકાસણી બેજ", select: "પ્લાન પસંદ કરો", unlimited: "અમર્યાદિત", km: "કિમી" },
  te: { title: "సబ్‌స్క్రిప్షన్ ప్లాన్ ఎంచుకోండి", subtitle: "మీ సంస్థను నమోదు చేయడానికి టైర్ ఎంచుకోండి", month: "/నెల", cases: "క్రియాశీల కేసులు", volunteers: "వాలంటీర్లు", radius: "సేవా పరిధి", analytics: "డేటా అనలిటిక్స్", support: "ప్రాధాన్యత మద్దతు", badge: "ధృవీకరణ బ్యాడ్జ్", select: "ప్లాన్ ఎంచుకోండి", unlimited: "అపరిమిత", km: "కి.మీ" },
  ta: { title: "சந்தா திட்டத்தை தேர்ந்தெடுக்கவும்", subtitle: "உங்கள் நிறுவனத்தை பதிவு செய்ய அடுக்கை தேர்ந்தெடுக்கவும்", month: "/மாதம்", cases: "செயலில் உள்ள வழக்குகள்", volunteers: "தொண்டர்கள்", radius: "சேவை ஆரம்", analytics: "தரவு பகுப்பாய்வு", support: "முன்னுரிமை ஆதரவு", badge: "சரிபார்ப்பு பேட்ஜ்", select: "திட்டத்தை தேர்ந்தெடுக்கவும்", unlimited: "வரம்பற்ற", km: "கி.மீ" },
  kn: { title: "ಚಂದಾದಾರಿಕೆ ಯೋಜನೆ ಆಯ್ಕೆಮಾಡಿ", subtitle: "ನಿಮ್ಮ ಸಂಸ್ಥೆಯನ್ನು ನೋಂದಾಯಿಸಲು ಶ್ರೇಣಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ", month: "/ತಿಂಗಳು", cases: "ಸಕ್ರಿಯ ಪ್ರಕರಣಗಳು", volunteers: "ಸ್ವಯಂಸೇವಕರು", radius: "ಸೇವಾ ವ್ಯಾಪ್ತಿ", analytics: "ಡೇಟಾ ಅನಾಲಿಟಿಕ್ಸ್", support: "ಆದ್ಯತೆಯ ಬೆಂಬಲ", badge: "ಪರಿಶೀಲನಾ ಬ್ಯಾಡ್ಜ್", select: "ಯೋಜನೆ ಆಯ್ಕೆಮಾಡಿ", unlimited: "ಅನಿಯಮಿತ", km: "ಕಿ.ಮೀ" },
  ml: { title: "സബ്സ്ക്രിപ്ഷൻ പ്ലാൻ തിരഞ്ഞെടുക്കുക", subtitle: "നിങ്ങളുടെ സ്ഥാപനം രജിസ്റ്റർ ചെയ്യാൻ ടയർ തിരഞ്ഞെടുക്കുക", month: "/മാസം", cases: "സജീവ കേസുകൾ", volunteers: "വളണ്ടിയർമാർ", radius: "സേവന പരിധി", analytics: "ഡാറ്റ അനലിറ്റിക്സ്", support: "മുൻഗണനാ പിന്തുണ", badge: "സ്ഥിരീകരണ ബാഡ്ജ്", select: "പ്ലാൻ തിരഞ്ഞെടുക്കുക", unlimited: "പരിധിയില്ലാത്ത", km: "കി.മീ" },
  bn: { title: "সাবস্ক্রিপশন প্ল্যান নির্বাচন করুন", subtitle: "আপনার প্রতিষ্ঠান নিবন্ধন করতে টিয়ার চয়ন করুন", month: "/মাস", cases: "সক্রিয় মামলা", volunteers: "স্বেচ্ছাসেবক", radius: "সেবা ব্যাসার্ধ", analytics: "ডেটা অ্যানালিটিক্স", support: "অগ্রাধিকার সমর্থন", badge: "যাচাইকরণ ব্যাজ", select: "প্ল্যান নির্বাচন করুন", unlimited: "সীমাহীন", km: "কিমি" },
  pa: { title: "ਗਾਹਕੀ ਯੋਜਨਾ ਚੁਣੋ", subtitle: "ਆਪਣੀ ਸੰਸਥਾ ਨੂੰ ਰਜਿਸਟਰ ਕਰਨ ਲਈ ਟੀਅਰ ਚੁਣੋ", month: "/ਮਹੀਨਾ", cases: "ਸਰਗਰਮ ਕੇਸ", volunteers: "ਵਲੰਟੀਅਰ", radius: "ਸੇਵਾ ਦਾ ਘੇਰਾ", analytics: "ਡੇਟਾ ਐਨਾਲਿਟਿਕਸ", support: "ਪਹਿਲ ਸਹਾਇਤਾ", badge: "ਤਸਦੀਕ ਬੈਜ", select: "ਯੋਜਨਾ ਚੁਣੋ", unlimited: "ਅਸੀਮਤ", km: "ਕਿਮੀ" },
  or: { title: "ସବସ୍କ୍ରିପସନ୍ ପ୍ଲାନ୍ ବାଛନ୍ତୁ", subtitle: "ଆପଣଙ୍କ ସଂସ୍ଥା ପଞ୍ଜିକରଣ କରିବାକୁ ଟିୟର ବାଛନ୍ତୁ", month: "/ମାସ", cases: "ସକ୍ରିୟ ମାମଲା", volunteers: "ସ୍ୱେଚ୍ଛାସେବୀ", radius: "ସେବା ପରିସର", analytics: "ଡାଟା ଆନାଲିଟିକ୍ସ", support: "ପ୍ରାଥମିକତା ସମର୍ଥନ", badge: "ଯାଞ୍ଚ ବ୍ୟାଜ୍", select: "ପ୍ଲାନ୍ ବାଛନ୍ତୁ", unlimited: "ଅସୀମିତ", km: "କିମି" },
  as: { title: "চাবস্ক্ৰিপচন প্লেন বাছনি কৰক", subtitle: "আপোনাৰ সংস্থা পঞ্জীয়ন কৰিবলৈ টিয়াৰ বাছনি কৰক", month: "/মাহ", cases: "সক্ৰিয় গোচৰ", volunteers: "স্বেচ্ছাসেৱক", radius: "সেৱা ব্যাসাৰ্ধ", analytics: "ডাটা এনালাইটিক্স", support: "প্ৰাথমিকতা সমৰ্থন", badge: "প্ৰমাণীকৰণ বেজ", select: "প্লেন বাছনি কৰক", unlimited: "অসীমিত", km: "কিমি" },
  ur: { title: "سبسکرپشن پلان منتخب کریں", subtitle: "اپنی تنظیم کو رجسٹر کرنے کے لیے ٹائر کا انتخاب کریں", month: "/مہینہ", cases: "فعال کیسز", volunteers: "رضاکار", radius: "سروس کا دائرہ", analytics: "ڈیٹا اینالیٹکس", support: "ترجیحی تعاون", badge: "تصدیقی بیج", select: "پلان منتخب کریں", unlimited: "لامحدود", km: "کلومیٹر" },
  bho: { title: "सदस्यता योजना चुनीं", subtitle: "अपन संगठन पंजीकृत करे खातिर टियर चुनीं", month: "/महीना", cases: "सक्रिय मामला", volunteers: "स्वयंसेवक", radius: "सेवा क्षेत्र", analytics: "डेटा एनालिटिक्स", support: "प्राथमिकता सहायता", badge: "सत्यापन बैज", select: "योजना चुनीं", unlimited: "असीमित", km: "किमी" }
};

export default function PlanSelection() {
  const { language, colors } = useContext(AppContext);
  const navigate = useNavigate();
  const currentLang = PLAN_TRANSLATIONS[language] || PLAN_TRANSLATIONS.en;

  const handlePlanSelect = (tierName) => {
    // Strictly route to onboarding with the selected plan data
    navigate('/onboarding', { state: { selectedPlan: tierName } });
  };

  const formatLimit = (value) => {
    return value >= 999999 ? currentLang.unlimited : value;
  };

  const PlanCard = ({ name, data }) => (
    <div 
      style={{
        backgroundColor: colors.White,
        borderRadius: '24px',
        padding: '32px 24px',
        width: '100%',
        maxWidth: '340px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        border: name === 'Impact' ? `2px solid ${colors.Primary}` : '1px solid #E5E7EB',
        animation: 'fade-up 0.5s ease-out forwards'
      }}
    >
      <div>
        <h2 style={{ color: colors.Black, fontSize: '24px', fontWeight: '800', margin: '0 0 8px 0' }}>
          {name}
        </h2>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span style={{ fontSize: '32px', fontWeight: '900', color: colors.Black }}>₹{data.price}</span>
          <span style={{ fontSize: '14px', color: '#6B7280', fontWeight: '500' }}>{currentLang.month}</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
        <FeatureItem label={currentLang.cases} value={formatLimit(data.maxActiveCases)} />
        <FeatureItem label={currentLang.volunteers} value={formatLimit(data.maxVolunteers)} />
        <FeatureItem label={currentLang.radius} value={`${formatLimit(data.serviceRadiusKm)} ${currentLang.km}`} />
        <FeatureItem label={currentLang.analytics} active={data.hasAnalytics} />
        <FeatureItem label={currentLang.badge} active={data.hasVerificationBadge} />
        <FeatureItem label={currentLang.support} active={data.hasPrioritySupport} />
      </div>

      <button
        onClick={() => handlePlanSelect(name)}
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: '9999px',
          backgroundColor: name === 'Impact' ? colors.Primary : colors.Black,
          color: colors.White,
          fontSize: '16px',
          fontWeight: '700',
          border: 'none',
          cursor: 'pointer',
          marginTop: 'auto'
        }}
      >
        {currentLang.select}
      </button>
    </div>
  );

  const FeatureItem = ({ label, value, active }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', backgroundColor: value || active ? colors.Success + '20' : '#E5E7EB' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={value || active ? colors.Success : '#9CA3AF'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <span style={{ fontSize: '14px', color: colors.Black, fontWeight: '500', opacity: value || active ? 1 : 0.5 }}>
        {label} {value && <span style={{ fontWeight: '700' }}>({value})</span>}
      </span>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F3F4F6', padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px', maxWidth: '600px' }}>
        <h1 style={{ color: colors.Black, fontSize: '32px', fontWeight: '900', margin: '0 0 12px 0', letterSpacing: '-0.5px' }}>
          {currentLang.title}
        </h1>
        <p style={{ color: colors.Black, opacity: 0.7, fontSize: '16px', margin: 0, fontWeight: '500' }}>
          {currentLang.subtitle}
        </p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'center', width: '100%', maxWidth: '1200px' }}>
        {Object.entries(PLAN_TIERS).map(([tierName, tierData]) => (
          <PlanCard key={tierName} name={tierName} data={tierData} />
        ))}
      </div>
    </div>
  );
}