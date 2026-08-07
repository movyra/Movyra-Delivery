/**
 * SYSTEM DOCUMENTATION / 15-LANGUAGE TRANSLATION
 * Context: Official Marketing Landing Page for NagrikSetu Application.
 * Brand: Movyra Civic
 * 
 * English: Marketing Landing Page.
 * Hindi: मार्केटिंग लैंडिंग पेज।
 * Hinglish: Marketing Landing Page.
 * Marathi: मार्केटिंग लँडिंग पेज.
 * Gujarati: માર્કેટિંગ લેન્ડિંગ પેજ.
 * Telugu: మార్కెటింగ్ ల్యాండింగ్ పేజీ.
 * Tamil: சந்தைப்படுத்தல் இறங்கும் பக்கம்.
 * Kannada: ಮಾರ್ಕೆಟಿಂಗ್ ಲ್ಯಾಂಡಿಂಗ್ ಪುಟ.
 * Malayalam: മാർക്കറ്റിംഗ് ലാൻഡിംഗ് പേജ്.
 * Bengali: মার্কেটিং ল্যান্ডিং পেজ।
 * Punjabi: ਮਾਰਕੀਟਿੰਗ ਲੈਂਡਿੰਗ ਪੇਜ।
 * Odia: ମାର୍କେଟିଂ ଲ୍ୟାଣ୍ଡିଂ ପେଜ୍।
 * Assamese: মাৰ্কেটিং লেণ্ডিং পেজ।
 * Urdu: مارکیٹنگ لینڈنگ پیج۔
 * Bhojpuri: मार्केटिंग लैंडिंग पेज।
 *
 * SYSTEM COLORS REFERENCE (STRICT):
 * Primary / Background: #00897B
 * Dark Text: #111111
 * White: #FFFFFF
 * Action Yellow: #FFB300
 * Success Green: #2E7D32
 * Emergency Red: #D32F2F
 * Information Blue: #1565C0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const TRANSLATIONS = {
  en: { heroTitle: "Empowering Citizens, Connecting Communities", heroSub: "A trusted platform for public service and quick support.", cta: "Download Application", featuresTitle: "Platform Features", f1Title: "Report Issues", f1Desc: "Easily report local civic problems directly to authorities.", f2Title: "Emergency Help", f2Desc: "Get fast support during critical situations.", f3Title: "Community Updates", f3Desc: "Stay informed about your local area in real time.", footer: "NagrikSetu by Movyra Civic" },
  hi: { heroTitle: "नागरिकों को सशक्त बनाना, समुदायों को जोड़ना", heroSub: "सार्वजनिक सेवा और त्वरित सहायता के लिए एक विश्वसनीय मंच।", cta: "एप्लिकेशन डाउनलोड करें", featuresTitle: "मंच की विशेषताएं", f1Title: "समस्याएं दर्ज करें", f1Desc: "स्थानीय नागरिक समस्याओं की सीधे अधिकारियों को रिपोर्ट करें।", f2Title: "आपातकालीन मदद", f2Desc: "गंभीर स्थितियों के दौरान तेजी से सहायता प्राप्त करें।", f3Title: "सामुदायिक अपडेट", f3Desc: "वास्तविक समय में अपने स्थानीय क्षेत्र के बारे में सूचित रहें।", footer: "मोविरा सिविक द्वारा नागरिकसेतु" },
  hinglish: { heroTitle: "Citizens ko empower karna, communities ko jodna", heroSub: "Public service aur quick support ke liye trusted platform.", cta: "Application Download Karein", featuresTitle: "Platform Features", f1Title: "Issues Report Karein", f1Desc: "Local civic problems ko directly authorities tak pahunchayein.", f2Title: "Emergency Help", f2Desc: "Critical situations mein fast support paayein.", f3Title: "Community Updates", f3Desc: "Apne local area ke baare mein real time mein update rahein.", footer: "NagrikSetu by Movyra Civic" },
  mr: { heroTitle: "नागरिकांना सक्षम करणे, समुदायांना जोडणे", heroSub: "सार्वजनिक सेवा आणि त्वरित समर्थनासाठी एक विश्वसनीय व्यासपीठ.", cta: "ॲप्लिकेशन डाउनलोड करा", featuresTitle: "प्लॅटफॉर्म वैशिष्ट्ये", f1Title: "समस्या नोंदवा", f1Desc: "स्थानिक नागरी समस्यांची थेट अधिकाऱ्यांना सहजपणे तक्रार करा.", f2Title: "आपत्कालीन मदत", f2Desc: "गंभीर परिस्थितीत जलद मदत मिळवा.", f3Title: "सामुदायिक अद्यतने", f3Desc: "तुमच्या स्थानिक क्षेत्राबद्दल रिअल टाइममध्ये माहिती मिळवा.", footer: "मोविरा सिविक द्वारे नागरिकसेतू" },
  gu: { heroTitle: "નાગરિકોને સશક્તિકરણ, સમુદાયોને જોડવા", heroSub: "જાહેર સેવા અને ઝડપી સમર્થન માટે વિશ્વસનીય પ્લેટફોર્મ.", cta: "એપ્લિકેશન ડાઉનલોડ કરો", featuresTitle: "પ્લેટફોર્મ સુવિધાઓ", f1Title: "સમસ્યાઓ નોંધાવો", f1Desc: "સ્થાનિક નાગરિક સમસ્યાઓની સીધી સત્તાવાળાઓને સરળતાથી જાણ કરો.", f2Title: "કટોકટી મદદ", f2Desc: "ગંભીર પરિસ્થિતિઓ દરમિયાન ઝડપી આધાર મેળવો.", f3Title: "સમુદાય અપડેટ્સ", f3Desc: "તમારા સ્થાનિક વિસ્તાર વિશે રીઅલ ટાઇમમાં માહિતગાર રહો.", footer: "મોવિરા સિવિક દ્વારા નાગરિકસેતુ" },
  te: { heroTitle: "పౌరుల సాధికారత, సంఘాల అనుసంధానం", heroSub: "ప్రజా సేవ మరియు శీఘ్ర మద్దతు కోసం నమ్మకమైన వేదిక.", cta: "అప్లికేషన్ డౌన్‌లోడ్ చేయండి", featuresTitle: "ప్లాట్‌ఫారమ్ ఫీచర్లు", f1Title: "సమస్యలను నివేదించండి", f1Desc: "స్థానిక పౌర సమస్యలను నేరుగా అధికారులకు సులభంగా నివేదించండి.", f2Title: "అత్యవసర సహాయం", f2Desc: "క్లిష్ట పరిస్థితుల్లో వేగవంతమైన మద్దతు పొందండి.", f3Title: "సంఘం నవీకరణలు", f3Desc: "మీ స్థానిక ప్రాంతం గురించి నిజ సమయంలో తెలుసుకోండి.", footer: "మోవిరా సివిక్ ద్వారా నాగ్రిక్‌సేతు" },
  ta: { heroTitle: "குடிமக்களுக்கு அதிகாரமளித்தல், சமூகங்களை இணைத்தல்", heroSub: "பொது சேவை மற்றும் விரைவான ஆதரவிற்கான நம்பகமான தளம்.", cta: "பயன்பாட்டைப் பதிவிறக்கவும்", featuresTitle: "மேடை அம்சங்கள்", f1Title: "சிக்கல்களைப் புகாரளிக்கவும்", f1Desc: "உள்ளூர் குடிமக்கள் பிரச்சினைகளை அதிகாரிகளிடம் எளிதாகப் புகாரளிக்கவும்.", f2Title: "அவசர உதவி", f2Desc: "நெருக்கடியான சூழ்நிலைகளில் விரைவான ஆதரவைப் பெறுங்கள்.", f3Title: "சமூக புதுப்பிப்புகள்", f3Desc: "உங்கள் உள்ளூர் பகுதியைப் பற்றி உண்மையான நேரத்தில் தெரிந்து கொள்ளுங்கள்.", footer: "மோவிரா சிவிக் மூலம் நாகரிக் சேது" },
  kn: { heroTitle: "ನಾಗರಿಕರ ಸಬಲೀಕರಣ, ಸಮುದಾಯಗಳ ಸಂಪರ್ಕ", heroSub: "ಸಾರ್ವಜನಿಕ ಸೇವೆ ಮತ್ತು ತ್ವರಿತ ಬೆಂಬಲಕ್ಕಾಗಿ ವಿಶ್ವಾಸಾರ್ಹ ವೇದಿಕೆ.", cta: "ಅಪ್ಲಿಕೇಶನ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ", featuresTitle: "ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ವೈಶಿಷ್ಟ್ಯಗಳು", f1Title: "ಸಮಸ್ಯೆಗಳನ್ನು ವರದಿ ಮಾಡಿ", f1Desc: "ಸ್ಥಳೀಯ ನಾಗರಿಕ ಸಮಸ್ಯೆಗಳನ್ನು ನೇರವಾಗಿ ಅಧಿಕಾರಿಗಳಿಗೆ ಸುಲಭವಾಗಿ ವರದಿ ಮಾಡಿ.", f2Title: "ತುರ್ತು ಸಹಾಯ", f2Desc: "ನಿರ್ಣಾಯಕ ಸಂದರ್ಭಗಳಲ್ಲಿ ವೇಗವಾಗಿ ಬೆಂಬಲ ಪಡೆಯಿರಿ.", f3Title: "ಸಮುದಾಯ ನವೀಕರಣಗಳು", f3Desc: "ನಿಮ್ಮ ಸ್ಥಳೀಯ ಪ್ರದೇಶದ ಬಗ್ಗೆ ನೈಜ ಸಮಯದಲ್ಲಿ ಮಾಹಿತಿ ಪಡೆಯಿರಿ.", footer: "ಮೊವಿರಾ ಸಿವಿಕ್ ಅವರಿಂದ ನಾಗರಿಕ್‌ಸೇತು" },
  ml: { heroTitle: "പൗരന്മാരെ ശാക്തീകരിക്കുന്നു, കമ്മ്യൂണിറ്റികളെ ബന്ധിപ്പിക്കുന്നു", heroSub: "പൊതുസേവനത്തിനും വേഗത്തിലുള്ള പിന്തുണയ്ക്കുമുള്ള വിശ്വസനീയമായ പ്ലാറ്റ്ഫോം.", cta: "ആപ്ലിക്കേഷൻ ഡൗൺലോഡ് ചെയ്യുക", featuresTitle: "പ്ലാറ്റ്ഫോം സവിശേഷതകൾ", f1Title: "പ്രശ്നങ്ങൾ റിപ്പോർട്ട് ചെയ്യുക", f1Desc: "പ്രാദേശിക സിവിക് പ്രശ്നങ്ങൾ നേരിട്ട് അധികാരികളെ എളുപ്പത്തിൽ അറിയിക്കുക.", f2Title: "അടിയന്തര സഹായം", f2Desc: "നിർണായക സാഹചര്യങ്ങളിൽ വേഗത്തിലുള്ള പിന്തുണ നേടുക.", f3Title: "കമ്മ്യൂണിറ്റി അപ്‌ഡേറ്റുകൾ", f3Desc: "നിങ്ങളുടെ പ്രദേശത്തെക്കുറിച്ച് തത്സമയം അറിയുക.", footer: "മോവിറ സിവിക് നൽകുന്ന നാഗരിക് സേതു" },
  bn: { heroTitle: "নাগরিকদের ক্ষমতায়ন, সম্প্রদায়গুলিকে সংযুক্ত করা", heroSub: "জনসেবা এবং দ্রুত সমর্থনের জন্য একটি বিশ্বস্ত প্ল্যাটফর্ম।", cta: "অ্যাপ্লিকেশন ডাউনলোড করুন", featuresTitle: "প্ল্যাটফর্মের বৈশিষ্ট্য", f1Title: "সমস্যা রিপোর্ট করুন", f1Desc: "স্থানীয় নাগরিক সমস্যাগুলি সরাসরি কর্তৃপক্ষের কাছে সহজেই রিপোর্ট করুন।", f2Title: "জরুরী সাহায্য", f2Desc: "সঙ্কটজনক পরিস্থিতিতে দ্রুত সমর্থন পান।", f3Title: "সম্প্রদায় আপডেট", f3Desc: "রিয়েল টাইমে আপনার স্থানীয় এলাকা সম্পর্কে অবগত থাকুন।", footer: "মোভিরার সিভিক দ্বারা নাগরিকসেতু" },
  pa: { heroTitle: "ਨਾਗਰਿਕਾਂ ਦਾ ਸਸ਼ਕਤੀਕਰਨ, ਭਾਈਚਾਰਿਆਂ ਨੂੰ ਜੋੜਨਾ", heroSub: "ਜਨਤਕ ਸੇਵਾ ਅਤੇ ਤੁਰੰਤ ਸਹਾਇਤਾ ਲਈ ਇੱਕ ਭਰੋਸੇਯੋਗ ਪਲੇਟਫਾਰਮ।", cta: "ਐਪਲੀਕੇਸ਼ਨ ਡਾਊਨਲੋਡ ਕਰੋ", featuresTitle: "ਪਲੇਟਫਾਰਮ ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ", f1Title: "ਮੁੱਦਿਆਂ ਦੀ ਰਿਪੋਰਟ ਕਰੋ", f1Desc: "ਸਥਾਨਕ ਨਾਗਰਿਕ ਸਮੱਸਿਆਵਾਂ ਦੀ ਸਿੱਧੇ ਅਧਿਕਾਰੀਆਂ ਨੂੰ ਆਸਾਨੀ ਨਾਲ ਰਿਪੋਰਟ ਕਰੋ।", f2Title: "ਐਮਰਜੈਂਸੀ ਮਦਦ", f2Desc: "ਨਾਜ਼ੁਕ ਸਥਿਤੀਆਂ ਦੌਰਾਨ ਤੇਜ਼ ਸਹਾਇਤਾ ਪ੍ਰਾਪਤ ਕਰੋ।", f3Title: "ਭਾਈਚਾਰਕ ਅੱਪਡੇਟ", f3Desc: "ਆਪਣੇ ਸਥਾਨਕ ਖੇਤਰ ਬਾਰੇ ਅਸਲ ਸਮੇਂ ਵਿੱਚ ਸੂਚਿਤ ਰਹੋ।", footer: "ਮੋਵਿਰਾ ਸਿਵਿਕ ਦੁਆਰਾ ਨਾਗਰਿਕਸੇਤੂ" },
  or: { heroTitle: "ନାଗରିକମାନଙ୍କୁ ସଶକ୍ତ କରିବା, ସମ୍ପ୍ରଦାୟକୁ ଯୋଡିବା", heroSub: "ଜନସେବା ଏବଂ ତ୍ୱରିତ ସମର୍ଥନ ପାଇଁ ଏକ ବିଶ୍ୱସ୍ତ ପ୍ଲାଟଫର୍ମ।", cta: "ଆପ୍ଲିକେସନ୍ ଡାଉନଲୋଡ୍ କରନ୍ତୁ", featuresTitle: "ପ୍ଲାଟଫର୍ମ ବୈଶିଷ୍ଟ୍ୟଗୁଡିକ", f1Title: "ସମସ୍ୟା ରିପୋର୍ଟ କରନ୍ତୁ", f1Desc: "ସ୍ଥାନୀୟ ନାଗରିକ ସମସ୍ୟାଗୁଡ଼ିକୁ ସିଧାସଳଖ କର୍ତ୍ତୃପକ୍ଷଙ୍କୁ ସହଜରେ ରିପୋର୍ଟ କରନ୍ତୁ।", f2Title: "ଜରୁରୀକାଳୀନ ସାହାଯ୍ୟ", f2Desc: "ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ ପରିସ୍ଥିତିରେ ଦ୍ରୁତ ସମର୍ଥନ ପ୍ରାପ୍ତ କରନ୍ତୁ।", f3Title: "ସମ୍ପ୍ରଦାୟ ଅପଡେଟ୍", f3Desc: "ବାସ୍ତବ ସମୟରେ ଆପଣଙ୍କ ସ୍ଥାନୀୟ ଅଞ୍ଚଳ ବିଷୟରେ ଅବଗତ ରୁହନ୍ତୁ।", footer: "ମୋଭିରା ସିଭିକ୍ ଦ୍ୱାରା ନାଗରିକସେତୁ" },
  as: { heroTitle: "নাগৰিকক সৱলীকৰণ, সম্প্ৰদায়সমূহক সংযোগ কৰা", heroSub: "ৰাজহুৱা সেৱা আৰু দ্ৰুত সমৰ্থনৰ বাবে এক নিৰ্ভৰযোগ্য প্লেটফৰ্ম।", cta: "এপ্লিকেচন ডাউনলোড কৰক", featuresTitle: "প্লেটফৰ্মৰ বৈশিষ্ট্যসমূহ", f1Title: "সমস্যা ৰিপোৰ্ট কৰক", f1Desc: "স্থানীয় নাগৰিক সমস্যাবোৰ পোনপটীয়াকৈ কৰ্তৃপক্ষক সহজে ৰিপোৰ্ট কৰক।", f2Title: "জৰুৰীকালীন সহায়", f2Desc: "গুৰুত্বপূৰ্ণ পৰিস্থিতিত দ্ৰুত সমৰ্থন প্ৰাপ্ত কৰক।", f3Title: "সম্প্ৰদায়ৰ আপডেট", f3Desc: "আপোনাৰ স্থানীয় অঞ্চলৰ বিষয়ে ৰিয়েল টাইমত অৱগত থাকক।", footer: "মভিৰা চিভিকৰ দ্বাৰা নাগৰিকসেতু" },
  ur: { heroTitle: "شہریوں کو بااختیار بنانا، کمیونٹیز کو جوڑنا", heroSub: "عوامی خدمت اور فوری مدد کے لیے ایک قابل اعتماد پلیٹ فارم۔", cta: "ایپلیکیشن ڈاؤن لوڈ کریں", featuresTitle: "پلیٹ فارم کی خصوصیات", f1Title: "مسائل کی اطلاع دیں", f1Desc: "مقامی شہری مسائل کی براہ راست حکام کو آسانی سے اطلاع دیں۔", f2Title: "ہنگامی مدد", f2Desc: "اہم حالات کے دوران تیز رفتار مدد حاصل کریں۔", f3Title: "کمیونٹی اپ ڈیٹس", f3Desc: "اپنے مقامی علاقے کے بارے میں حقیقی وقت میں باخبر رہیں۔", footer: "موویرا سوک کی طرف سے ناگرک سیتو" },
  bho: { heroTitle: "नागरिक लोग के सशक्त कइल, समुदाय के जोड़ल", heroSub: "सार्वजनिक सेवा आ त्वरित समर्थन खातिर एगो विश्वसनीय मंच।", cta: "एप्लीकेशन डाउनलोड करीं", featuresTitle: "मंच के विशेषता", f1Title: "समस्या दर्ज करीं", f1Desc: "स्थानीय नागरिक समस्या के सीधा अधिकारी लोग के आसानी से रिपोर्ट करीं।", f2Title: "आपातकालीन मदद", f2Desc: "गंभीर स्थिति के दौरान तेजी से सहायता प्राप्त करीं।", f3Title: "सामुदायिक अपडेट", f3Desc: "वास्तविक समय में अपना स्थानीय क्षेत्र के बारे में सूचित रहीं।", footer: "मोविरा सिविक द्वारा नागरिकसेतु" }
};

export default function MarketingLanding() {
  const [language, setLanguage] = useState('en');
  const navigate = useNavigate();
  const t = TRANSLATIONS[language];

  // STRICT COLOR VARIABLES
  const BG_COLOR = "#00897B";
  const TEXT_WHITE = "#FFFFFF";
  const TEXT_BLACK = "#111111";
  const ACCENT_YELLOW = "#FFB300";
  const RED_EMERGENCY = "#D32F2F";
  const BLUE_INFO = "#1565C0";

  return (
    <div style={{ backgroundColor: BG_COLOR, minHeight: '100vh', fontFamily: 'sans-serif', overflowX: 'hidden' }}>
      
      {/* MINIMAL HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', backgroundColor: BG_COLOR, borderBottom: `1px solid ${TEXT_WHITE}30` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/movyra-logo.png" alt="Movyra Logo" style={{ height: '32px', width: 'auto' }} onError={(e) => { e.target.style.display = 'none' }} />
          <span style={{ color: TEXT_WHITE, fontSize: '20px', fontWeight: '800', letterSpacing: '0.5px' }}>NagrikSetu</span>
        </div>
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: `1px solid ${TEXT_WHITE}`, backgroundColor: 'transparent', color: TEXT_WHITE, fontWeight: '600', cursor: 'pointer', outline: 'none' }}
        >
          <option value="en" style={{color: TEXT_BLACK}}>English</option>
          <option value="hi" style={{color: TEXT_BLACK}}>हिन्दी</option>
          <option value="hinglish" style={{color: TEXT_BLACK}}>Hinglish</option>
          <option value="mr" style={{color: TEXT_BLACK}}>मराठी</option>
          <option value="gu" style={{color: TEXT_BLACK}}>ગુજરાતી</option>
          <option value="te" style={{color: TEXT_BLACK}}>తెలుగు</option>
          <option value="ta" style={{color: TEXT_BLACK}}>தமிழ்</option>
          <option value="kn" style={{color: TEXT_BLACK}}>ಕನ್ನಡ</option>
          <option value="ml" style={{color: TEXT_BLACK}}>മലയാളം</option>
          <option value="bn" style={{color: TEXT_BLACK}}>বাংলা</option>
          <option value="pa" style={{color: TEXT_BLACK}}>ਪੰਜਾਬੀ</option>
          <option value="or" style={{color: TEXT_BLACK}}>ଓଡ଼ିଆ</option>
          <option value="as" style={{color: TEXT_BLACK}}>অসমীয়া</option>
          <option value="ur" style={{color: TEXT_BLACK}}>اردو</option>
          <option value="bho" style={{color: TEXT_BLACK}}>भोजपुरी</option>
        </select>
      </header>

      {/* HERO SECTION WITH FRAMER MOTION */}
      <main style={{ padding: '60px 24px', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6 }}
        >
          <h1 style={{ color: TEXT_WHITE, fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: '900', lineHeight: '1.2', marginBottom: '24px', maxWidth: '800px', margin: '0 auto 24px auto' }}>
            {t.heroTitle}
          </h1>
          <p style={{ color: TEXT_WHITE, opacity: 0.9, fontSize: 'clamp(16px, 2vw, 20px)', fontWeight: '500', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px auto' }}>
            {t.heroSub}
          </p>
          
          {/* PRIMARY CTA - ACTION YELLOW FOR HIGH CONTRAST ON TEAL */}
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/download')}
            style={{ backgroundColor: ACCENT_YELLOW, color: TEXT_BLACK, padding: '16px 36px', borderRadius: '12px', border: 'none', fontSize: '18px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 8px 16px rgba(0,0,0,0.15)' }}
          >
            {t.cta}
          </motion.button>
        </motion.div>

        {/* FEATURES GRID */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ marginTop: '80px', paddingTop: '60px', borderTop: `1px solid ${TEXT_WHITE}30` }}
        >
          <h2 style={{ color: TEXT_WHITE, fontSize: '28px', fontWeight: '800', marginBottom: '48px' }}>
            {t.featuresTitle}
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', textAlign: 'left' }}>
            
            {/* Feature 1: Report Issues */}
            <div style={{ backgroundColor: TEXT_WHITE, padding: '32px', borderRadius: '16px', boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}>
              <div style={{ backgroundColor: '#E0F2F1', width: '56px', height: '56px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={BG_COLOR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="12" y1="18" x2="12" y2="12"></line>
                  <line x1="9" y1="15" x2="15" y2="15"></line>
                </svg>
              </div>
              <h3 style={{ color: TEXT_BLACK, fontSize: '20px', fontWeight: '800', marginBottom: '12px' }}>{t.f1Title}</h3>
              <p style={{ color: TEXT_BLACK, opacity: 0.7, fontSize: '15px', lineHeight: '1.6', margin: 0 }}>{t.f1Desc}</p>
            </div>

            {/* Feature 2: Emergency SOS */}
            <div style={{ backgroundColor: TEXT_WHITE, padding: '32px', borderRadius: '16px', boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}>
              <div style={{ backgroundColor: '#FFEBEE', width: '56px', height: '56px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={RED_EMERGENCY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </div>
              <h3 style={{ color: TEXT_BLACK, fontSize: '20px', fontWeight: '800', marginBottom: '12px' }}>{t.f2Title}</h3>
              <p style={{ color: TEXT_BLACK, opacity: 0.7, fontSize: '15px', lineHeight: '1.6', margin: 0 }}>{t.f2Desc}</p>
            </div>

            {/* Feature 3: Live Updates */}
            <div style={{ backgroundColor: TEXT_WHITE, padding: '32px', borderRadius: '16px', boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}>
              <div style={{ backgroundColor: '#E3F2FD', width: '56px', height: '56px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={BLUE_INFO} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <h3 style={{ color: TEXT_BLACK, fontSize: '20px', fontWeight: '800', marginBottom: '12px' }}>{t.f3Title}</h3>
              <p style={{ color: TEXT_BLACK, opacity: 0.7, fontSize: '15px', lineHeight: '1.6', margin: 0 }}>{t.f3Desc}</p>
            </div>

          </div>
        </motion.div>
      </main>

      {/* MINIMAL FOOTER */}
      <footer style={{ backgroundColor: BG_COLOR, padding: '32px 24px', textAlign: 'center', borderTop: `1px solid ${TEXT_WHITE}30` }}>
        <p style={{ color: TEXT_WHITE, opacity: 0.8, fontSize: '14px', fontWeight: '600', margin: 0 }}>
          &copy; {new Date().getFullYear()} {t.footer}
        </p>
      </footer>

    </div>
  );
}