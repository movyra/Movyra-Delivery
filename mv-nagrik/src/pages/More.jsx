import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HeartPulse, PhoneCall, Sparkles, CloudSun, Stars, Coins, CircleDollarSign, ShoppingBasket, AlertCircle, Zap, Globe, Radio } from 'lucide-react';

export default function More() {
    const [lang, setLang] = useState('en');

    // Language Synchronization
    useEffect(() => {
        const savedLang = localStorage.getItem('nagrik_lang') || navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'hinglish', 'mr', 'gu', 'te', 'ta', 'kn', 'ml', 'bn', 'pa', 'or', 'as', 'ur', 'bho'];
        if (supported.includes(savedLang)) setLang(savedLang);

        const handleStorageChange = () => {
            const newLang = localStorage.getItem('nagrik_lang');
            if (newLang && supported.includes(newLang)) setLang(newLang);
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // 15 Comprehensive Indian Language Translations matching image requirements
    const t = {
        en: { m_more: "More", m_than: " Than Just", m_rep: "Reporting.", m_desc: "Access utilities, safety tools, community services, and daily updates.", c_em: "Emergency & Safety", i_first: "First Aid Guide", i_contact: "Emergency Contacts", c_med: "Media", i_horo: "Horoscope", i_fore: "Daily Forecast", i_zod: "Zodiac Traits", c_price: "Today's Prices", i_exch: "Exchange Rate", i_gold: "Gold & Silver", i_veg: "Vegetable Price", c_comm: "Community & Collaboration", i_civi: "Civialert", i_nea: "NEA", i_alpas: "Alpas", i_ntc: "NTC" },
        hi: { m_more: "सिर्फ", m_than: " रिपोर्टिंग", m_rep: "से अधिक।", m_desc: "उपयोगिताओं, सुरक्षा उपकरणों, सामुदायिक सेवाओं और दैनिक अपडेट तक पहुंचें।", c_em: "आपातकाल और सुरक्षा", i_first: "प्राथमिक चिकित्सा", i_contact: "आपातकालीन संपर्क", c_med: "मीडिया", i_horo: "राशिफल", i_fore: "दैनिक पूर्वानुमान", i_zod: "राशि चक्र के लक्षण", c_price: "आज के दाम", i_exch: "विनिमय दर", i_gold: "सोना और चांदी", i_veg: "सब्जी की कीमत", c_comm: "समुदाय और सहयोग", i_civi: "Civialert", i_nea: "NEA", i_alpas: "Alpas", i_ntc: "NTC" },
        hinglish: { m_more: "More", m_than: " Than Just", m_rep: "Reporting.", m_desc: "Utilities, safety tools, community services, aur daily updates access karein.", c_em: "Emergency & Safety", i_first: "First Aid Guide", i_contact: "Emergency Contacts", c_med: "Media", i_horo: "Horoscope", i_fore: "Daily Forecast", i_zod: "Zodiac Traits", c_price: "Aaj ke Prices", i_exch: "Exchange Rate", i_gold: "Gold & Silver", i_veg: "Vegetable Price", c_comm: "Community & Collaboration", i_civi: "Civialert", i_nea: "NEA", i_alpas: "Alpas", i_ntc: "NTC" },
        mr: { m_more: "केवळ", m_than: " रिपोर्टिंग", m_rep: "पेक्षा अधिक.", m_desc: "उपयुक्तता, सुरक्षा साधने, समुदाय सेवा आणि दैनिक अपडेट्समध्ये प्रवेश करा.", c_em: "आणीबाणी आणि सुरक्षा", i_first: "प्रथमोपचार मार्गदर्शक", i_contact: "आणीबाणी संपर्क", c_med: "माध्यमे", i_horo: "भविष्य", i_fore: "दैनिक अंदाज", i_zod: "राशीची वैशिष्ट्ये", c_price: "आजचे दर", i_exch: "विनिमय दर", i_gold: "सोने आणि चांदी", i_veg: "भाजीपाल्याचे दर", c_comm: "समुदाय आणि सहकार्य", i_civi: "Civialert", i_nea: "NEA", i_alpas: "Alpas", i_ntc: "NTC" },
        gu: { m_more: "ફક્ત", m_than: " રિપોર્ટિંગ", m_rep: "કરતા વધુ.", m_desc: "ઉપયોગિતાઓ, સુરક્ષા સાધનો, સમુદાય સેવાઓ અને દૈનિક અપડેટ્સ ઍક્સેસ કરો.", c_em: "કટોકટી અને સુરક્ષા", i_first: "પ્રથમ સહાય માર્ગદર્શિકા", i_contact: "કટોકટી સંપર્કો", c_med: "મીડિયા", i_horo: "જન્માક્ષર", i_fore: "દૈનિક આગાહી", i_zod: "રાશિચક્રના લક્ષણો", c_price: "આજના ભાવો", i_exch: "વિનિમય દર", i_gold: "સોનું અને ચાંદી", i_veg: "શાકભાજીના ભાવ", c_comm: "સમુદાય અને સહયોગ", i_civi: "Civialert", i_nea: "NEA", i_alpas: "Alpas", i_ntc: "NTC" },
        te: { m_more: "కేవలం", m_than: " రిపోర్టింగ్", m_rep: "కంటే ఎక్కువ.", m_desc: "ఉపయోగాలు, భద్రతా సాధనాలు, కమ్యూనిటీ సేవలు మరియు రోజువారీ నవీకరణలను యాక్సెస్ చేయండి.", c_em: "అత్యవసర మరియు భద్రత", i_first: "ప్రథమ చికిత్స మార్గదర్శి", i_contact: "అత్యవసర పరిచయాలు", c_med: "మీడియా", i_horo: "జాతకం", i_fore: "రోజువారీ సూచన", i_zod: "రాశిచక్ర లక్షణాలు", c_price: "నేటి ధరలు", i_exch: "మారకం రేటు", i_gold: "బంగారం మరియు వెండి", i_veg: "కూరగాయల ధర", c_comm: "కమ్యూనిటీ మరియు సహకారం", i_civi: "Civialert", i_nea: "NEA", i_alpas: "Alpas", i_ntc: "NTC" },
        ta: { m_more: "வெறும்", m_than: " அறிக்கையை", m_rep: "தாண்டி.", m_desc: "பயன்பாடுகள், பாதுகாப்பு கருவிகள், சமூக சேவைகள் மற்றும் தினசரி புதுப்பிப்புகளை அணுகவும்.", c_em: "அவசரம் மற்றும் பாதுகாப்பு", i_first: "முதலுதவி வழிகாட்டி", i_contact: "அவசர தொடர்புகள்", c_med: "ஊடகம்", i_horo: "ஜாதகம்", i_fore: "தினசரி முன்னறிவிப்பு", i_zod: "ராசி பண்புகள்", c_price: "இன்றைய விலைகள்", i_exch: "மாற்று வீதம்", i_gold: "தங்கம் மற்றும் வெள்ளி", i_veg: "காய்கறி விலை", c_comm: "சமூகம் மற்றும் ஒத்துழைப்பு", i_civi: "Civialert", i_nea: "NEA", i_alpas: "Alpas", i_ntc: "NTC" },
        kn: { m_more: "ಕೇವಲ", m_than: " ವರದಿ ಮಾಡುವುದಕ್ಕಿಂತ", m_rep: "ಹೆಚ್ಚು.", m_desc: "ಉಪಯುಕ್ತತೆಗಳು, ಸುರಕ್ಷತಾ ಪರಿಕರಗಳು, ಸಮುದಾಯ ಸೇವೆಗಳು ಮತ್ತು ದೈನಂದಿನ ನವೀಕರಣಗಳನ್ನು ಪ್ರವೇಶಿಸಿ.", c_em: "ತುರ್ತು ಮತ್ತು ಸುರಕ್ಷತೆ", i_first: "ಪ್ರಥಮ ಚಿಕಿತ್ಸಾ ಮಾರ್ಗದರ್ಶಿ", i_contact: "ತುರ್ತು ಸಂಪರ್ಕಗಳು", c_med: "ಮಾಧ್ಯಮ", i_horo: "ಜಾತಕ", i_fore: "ದೈನಂದಿನ ಮುನ್ಸೂಚನೆ", i_zod: "ರಾಶಿಚಕ್ರದ ಲಕ್ಷಣಗಳು", c_price: "ಇಂದಿನ ಬೆಲೆಗಳು", i_exch: "ವಿನಿಮಯ ದರ", i_gold: "ಚಿನ್ನ ಮತ್ತು ಬೆಳ್ಳಿ", i_veg: "ತರಕಾರಿ ಬೆಲೆ", c_comm: "ಸಮುದಾಯ ಮತ್ತು ಸಹಯೋಗ", i_civi: "Civialert", i_nea: "NEA", i_alpas: "Alpas", i_ntc: "NTC" },
        ml: { m_more: "വെറും", m_than: " റിപ്പോർട്ടിംഗിനേക്കാൾ", m_rep: "കൂടുതൽ.", m_desc: "യൂട്ടിലിറ്റികൾ, സുരക്ഷാ ടൂളുകൾ, കമ്മ്യൂണിറ്റി സേവനങ്ങൾ, ദൈനംദിന അപ്‌ഡേറ്റുകൾ എന്നിവ ആക്സസ് ചെയ്യുക.", c_em: "അടിയന്തരം & സുരക്ഷ", i_first: "പ്രഥമശുശ്രൂഷാ ഗൈഡ്", i_contact: "അടിയന്തര കോൺടാക്റ്റുകൾ", c_med: "മാധ്യമങ്ങൾ", i_horo: "ജാതകം", i_fore: "ദൈനംദിന പ്രവചനം", i_zod: "രാശിചിഹ്ന സവിശേഷതകൾ", c_price: "ഇന്നത്തെ വിലകൾ", i_exch: "വിനിമയ നിരക്ക്", i_gold: "സ്വർണ്ണവും വെള്ളിയും", i_veg: "പച്ചക്കറി വില", c_comm: "കമ്മ്യൂണിറ്റിയും സഹകരണവും", i_civi: "Civialert", i_nea: "NEA", i_alpas: "Alpas", i_ntc: "NTC" },
        bn: { m_more: "শুধু", m_than: " রিপোর্টিং", m_rep: "এর চেয়েও বেশি।", m_desc: "উপযোগিতা, নিরাপত্তা সরঞ্জাম, সম্প্রদায় পরিষেবা এবং দৈনিক আপডেট অ্যাক্সেস করুন।", c_em: "জরুরি এবং নিরাপত্তা", i_first: "প্রাথমিক চিকিৎসা নির্দেশিকা", i_contact: "জরুরি যোগাযোগ", c_med: "মিডিয়া", i_horo: "রাশিফল", i_fore: "দৈনিক পূর্বাভাস", i_zod: "রাশিচক্রের বৈশিষ্ট্য", c_price: "আজকের দাম", i_exch: "বিনিময় হার", i_gold: "সোনা ও রূপা", i_veg: "সবজির দাম", c_comm: "সম্প্রদায় এবং সহযোগিতা", i_civi: "Civialert", i_nea: "NEA", i_alpas: "Alpas", i_ntc: "NTC" },
        pa: { m_more: "ਸਿਰਫ਼", m_than: " ਰਿਪੋਰਟਿੰਗ", m_rep: "ਤੋਂ ਵੱਧ।", m_desc: "ਸਹੂਲਤਾਂ, ਸੁਰੱਖਿਆ ਸਾਧਨਾਂ, ਭਾਈਚਾਰਕ ਸੇਵਾਵਾਂ, ਅਤੇ ਰੋਜ਼ਾਨਾ ਅੱਪਡੇਟ ਤੱਕ ਪਹੁੰਚ ਕਰੋ।", c_em: "ਐਮਰਜੈਂਸੀ ਅਤੇ ਸੁਰੱਖਿਆ", i_first: "ਮੁੱਢਲੀ ਸਹਾਇਤਾ ਗਾਈਡ", i_contact: "ਐਮਰਜੈਂਸੀ ਸੰਪਰਕ", c_med: "ਮੀડિયા", i_horo: "ਕੁੰਡਲੀ", i_fore: "ਰੋਜ਼ਾਨਾ ਪੂਰਵ ਅਨੁਮਾਨ", i_zod: "ਰਾਸ਼ੀ ਦੇ ਗੁਣ", c_price: "ਅੱਜ ਦੀਆਂ ਕੀਮਤਾਂ", i_exch: "ਵਟਾਂਦਰਾ ਦਰ", i_gold: "ਸੋਨਾ ਅਤੇ ਚਾਂਦੀ", i_veg: "ਸਬਜ਼ੀਆਂ ਦੀ ਕੀਮਤ", c_comm: "ਭਾਈਚਾਰਾ ਅਤੇ ਸਹਿਯੋਗ", i_civi: "Civialert", i_nea: "NEA", i_alpas: "Alpas", i_ntc: "NTC" },
        or: { m_more: "କେବଳ", m_than: " ରିପୋର୍ଟିଂ", m_rep: "ଠାରୁ ଅଧିକ।", m_desc: "ଉପଯୋଗିତା, ସୁରକ୍ଷା ଉପକରଣ, ସମ୍ପ୍ରଦାୟ ସେବା ଏବଂ ଦୈନିକ ଅପଡେଟ୍ ଆକ୍ସେସ୍ କରନ୍ତୁ।", c_em: "ଜରୁରୀକାଳୀନ ଏବଂ ସୁରକ୍ଷା", i_first: "ପ୍ରାଥମିକ ଚିକିତ୍ସା ଗାଇଡ୍", i_contact: "ଜରୁରୀକାଳୀନ ଯୋଗାଯୋଗ", c_med: "ମିଡିଆ", i_horo: "ରାଶିଫଳ", i_fore: "ଦୈନିକ ପୂର୍ବାନୁମାନ", i_zod: "ରାଶିର ବୈଶିଷ୍ଟ୍ୟ", c_price: "ଆଜିର ଦର", i_exch: "ବିନିମୟ ହାର", i_gold: "ସୁନା ଏବଂ ରୂପା", i_veg: "ପନିପରିବା ଦର", c_comm: "ସମ୍ପ୍ରଦାୟ ଏବଂ ସହଯୋଗ", i_civi: "Civialert", i_nea: "NEA", i_alpas: "Alpas", i_ntc: "NTC" },
        as: { m_more: "কেৱল", m_than: " প্ৰতিবেদন", m_rep: "তকৈ অধিক।", m_desc: "উপযোগিতা, নিৰাপত্তা সঁজুলি, সম্প্ৰদায় সেৱা, আৰু দৈনিক আপডেটসমূহ ব্যৱহাৰ কৰক।", c_em: "জৰুৰীকালীন আৰু নিৰাপত্তা", i_first: "প্ৰাথমিক চিকিৎসা নিৰ্দেশিকা", i_contact: "জৰুৰীকালীন যোগাযোগ", c_med: "মিডিয়া", i_horo: "ৰাশিফল", i_fore: "দৈনিক পূৰ্বানুমান", i_zod: "ৰাশিচক্ৰৰ বৈশিষ্ট্য", c_price: "আজিৰ মূল্য", i_exch: "বিনিময় হাৰ", i_gold: "সোণ আৰু ৰূপ", i_veg: "পাচলিৰ মূল্য", c_comm: "সম্প্ৰদায় আৰু সহযোগিতা", i_civi: "Civialert", i_nea: "NEA", i_alpas: "Alpas", i_ntc: "NTC" },
        ur: { m_more: "صرف", m_than: " رپورٹنگ", m_rep: "سے زیادہ۔", m_desc: "سہولیات، حفاظتی ٹولز، کمیونٹی خدمات، اور روزانہ کی اپ ڈیٹس تک رسائی حاصل کریں۔", c_em: "ہنگامی اور حفاظت", i_first: "ابتدائی طبی امداد", i_contact: "ہنگامی رابطے", c_med: "میڈیا", i_horo: "زائچہ", i_fore: "روزانہ کی پیشن گوئی", i_zod: "رقم کی خصوصیات", c_price: "آج کی قیمتیں", i_exch: "شرح تبادلہ", i_gold: "سونا اور چاندی", i_veg: "سبزیوں کی قیمت", c_comm: "کمیونٹی اور تعاون", i_civi: "Civialert", i_nea: "NEA", i_alpas: "Alpas", i_ntc: "NTC" },
        bho: { m_more: "खाली", m_than: " रिपोर्टिंग", m_rep: "से ढेर।", m_desc: "सुविधा, सुरक्षा उपकरण, सामुदायिक सेवा, आ रोज के अपडेट प्राप्त करीं।", c_em: "आपातकाल आ सुरक्षा", i_first: "प्राथमिक चिकित्सा गाइड", i_contact: "आपातकालीन संपर्क", c_med: "मीडिया", i_horo: "राशिफल", i_fore: "रोज के पूर्वानुमान", i_zod: "राशि चक्र के लक्षण", c_price: "आज के दाम", i_exch: "विनिमय दर", i_gold: "सोना आ चानी", i_veg: "सब्जी के दाम", c_comm: "समुदाय आ सहयोग", i_civi: "Civialert", i_nea: "NEA", i_alpas: "Alpas", i_ntc: "NTC" }
    };

    const currentT = t[lang] || t['en'];

    // Real Action Logic - Functional Links to standard resources
    const openLink = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    // Staggered Animation Configuration
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    // Reusable utility button strictly bound to the requested colors (#FFFFFF background, #00897B icon, #111111 text)
    const UtilityButton = ({ icon: Icon, label, url }) => (
        <button 
            onClick={() => openLink(url)} 
            className="flex flex-col items-center justify-start gap-3 outline-none bg-[#FFFFFF] group"
        >
            <div className="w-16 h-16 bg-[#FFFFFF] rounded-2xl flex items-center justify-center border border-[#111111]/10 text-[#00897B] group-active:scale-95 transition-transform">
                <Icon size={26} strokeWidth={1.5} />
            </div>
            <span className="text-[0.65rem] font-black text-[#111111] text-center leading-tight max-w-[65px] tracking-wide">
                {label}
            </span>
        </button>
    );

    return (
        <div className="min-h-screen bg-[#FFFFFF] font-sans text-[#111111] pb-32">
            
            {/* Header Exactly Matching the Typography and Strict Colors */}
            <div className="pt-16 pb-8 px-6 max-w-[500px] mx-auto bg-[#FFFFFF]">
                <h1 className="text-[2.2rem] font-black leading-[1.1] tracking-tight text-[#111111]">
                    <span className="text-[#00897B]">{currentT.m_more}</span>
                    {currentT.m_than}
                    <br />
                    {currentT.m_rep}
                </h1>
                <p className="text-[1.05rem] font-medium text-[#111111]/70 mt-3 leading-relaxed pr-8">
                    {currentT.m_desc}
                </p>
            </div>

            <motion.div 
                className="max-w-[500px] mx-auto px-6 flex flex-col gap-8 bg-[#FFFFFF]"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                {/* Emergency & Safety Section */}
                <motion.div variants={itemVariants}>
                    <h2 className="text-[0.95rem] font-black text-[#111111] mb-5 tracking-tight">{currentT.c_em}</h2>
                    <div className="grid grid-cols-4 gap-2">
                        <UtilityButton icon={HeartPulse} label={currentT.i_first} url="https://indianredcross.org/ircs/firstaid" />
                        <UtilityButton icon={PhoneCall} label={currentT.i_contact} url="tel:112" />
                    </div>
                </motion.div>

                {/* Media Section */}
                <motion.div variants={itemVariants}>
                    <h2 className="text-[0.95rem] font-black text-[#111111] mb-5 tracking-tight">{currentT.c_med}</h2>
                    <div className="grid grid-cols-4 gap-2">
                        <UtilityButton icon={Sparkles} label={currentT.i_horo} url="https://www.astrology.com/horoscope/daily.html" />
                        <UtilityButton icon={CloudSun} label={currentT.i_fore} url="https://weather.com/" />
                        <UtilityButton icon={Stars} label={currentT.i_zod} url="https://www.astrology.com/zodiac-signs" />
                    </div>
                </motion.div>

                {/* Today's Prices Section */}
                <motion.div variants={itemVariants}>
                    <h2 className="text-[0.95rem] font-black text-[#111111] mb-5 tracking-tight">{currentT.c_price}</h2>
                    <div className="grid grid-cols-4 gap-2">
                        <UtilityButton icon={Coins} label={currentT.i_exch} url="https://www.xe.com/currencyconverter/" />
                        <UtilityButton icon={CircleDollarSign} label={currentT.i_gold} url="https://www.goodreturns.in/gold-rates/" />
                        <UtilityButton icon={ShoppingBasket} label={currentT.i_veg} url="https://vegetablemarketprice.com/" />
                    </div>
                </motion.div>

                {/* Community & Collaboration Section */}
                <motion.div variants={itemVariants}>
                    <h2 className="text-[0.95rem] font-black text-[#111111] mb-5 tracking-tight">{currentT.c_comm}</h2>
                    <div className="grid grid-cols-4 gap-2">
                        <UtilityButton icon={AlertCircle} label={currentT.i_civi} url="https://ndma.gov.in/" />
                        <UtilityButton icon={Zap} label={currentT.i_nea} url="https://powermin.gov.in/" />
                        <UtilityButton icon={Globe} label={currentT.i_alpas} url="https://www.india.gov.in/" />
                        <UtilityButton icon={Radio} label={currentT.i_ntc} url="https://www.bsnl.co.in/" />
                    </div>
                </motion.div>

            </motion.div>
        </div>
    );
}