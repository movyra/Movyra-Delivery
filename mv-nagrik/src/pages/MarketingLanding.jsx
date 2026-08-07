/**
 * SYSTEM DOCUMENTATION / 15-LANGUAGE TRANSLATION
 * Context: Minimal Official Marketing Landing Page for NagrikSetu.
 * Brand: Movyra Civic (NagrikSetu)
 *
 * SYSTEM COLORS REFERENCE (STRICT):
 * Primary Background: #00897B (Civic Teal)
 * Dark Text: #111111 (Deep Black)
 * Containers: #FFFFFF (Pure White)
 * Highlight CTA: #FFB300 (Action Yellow)
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowUp, Globe, ShieldCheck, MapPin, Activity, Bell } from 'lucide-react';

const TRANSLATIONS = {
    en: {
        lang: "English", products: "Products", careers: "Careers", coming_soon: "Coming Soon",
        badge: "Smart Civic Platform",
        main_title: "Empowering Citizens, Connecting Communities.",
        main_sub: "A trusted and simple platform to report local issues, track public repairs, and manage your city.",
        cta_btn: "Download Application",
        val1_title: "Report Issues", val1_sub: "Easily report local civic problems directly to authorities.",
        val2_title: "Track Progress", val2_sub: "See the status of current repairs in real time.",
        val3_title: "Live Updates", val3_sub: "Stay informed about your local area with official notices.",
        val4_title: "Secure Platform", val4_sub: "Your data and public service requests are stored safely.",
        select_lang: "Select Language", built_by: "Built by"
    },
    hi: {
        lang: "हिन्दी", products: "उत्पाद", careers: "करियर", coming_soon: "जल्द आ रहा है",
        badge: "स्मार्ट नागरिक मंच",
        main_title: "नागरिकों को सशक्त बनाना, समुदायों को जोड़ना।",
        main_sub: "स्थानीय समस्याओं की रिपोर्ट करने और सार्वजनिक सुधारों को ट्रैक करने के लिए एक विश्वसनीय मंच।",
        cta_btn: "एप्लिकेशन डाउनलोड करें",
        val1_title: "समस्याएं दर्ज करें", val1_sub: "स्थानीय नागरिक समस्याओं की सीधे अधिकारियों को रिपोर्ट करें।",
        val2_title: "प्रगति देखें", val2_sub: "वर्तमान सुधारों की स्थिति वास्तविक समय में देखें।",
        val3_title: "लाइव अपडेट", val3_sub: "आधिकारिक सूचनाओं के साथ अपने क्षेत्र के बारे में सूचित रहें।",
        val4_title: "सुरक्षित मंच", val4_sub: "आपका डेटा और अनुरोध सुरक्षित रूप से संग्रहीत किए जाते हैं।",
        select_lang: "भाषा चुनें", built_by: "निर्मित"
    },
    hinglish: {
        lang: "Hinglish", products: "Products", careers: "Careers", coming_soon: "Coming Soon",
        badge: "Smart Civic Platform",
        main_title: "Citizens ko empower karna, communities ko jodna.",
        main_sub: "Local issues report karne aur public repairs track karne ka trusted platform.",
        cta_btn: "Application Download Karein",
        val1_title: "Issues Report Karein", val1_sub: "Local civic problems ko directly authorities tak pahunchayein.",
        val2_title: "Progress Track Karein", val2_sub: "Current repairs ka status real time mein dekhein.",
        val3_title: "Live Updates", val3_sub: "Official notices ke sath apne area ke baare mein update rahein.",
        val4_title: "Secure Platform", val4_sub: "Aapka data aur requests safely store hoti hain.",
        select_lang: "Language Select Karein", built_by: "Built by"
    },
    mr: {
        lang: "मराठी", products: "उत्पादने", careers: "करिअर", coming_soon: "लवकरच येत आहे",
        badge: "स्मार्ट नागरी व्यासपीठ",
        main_title: "नागरिकांना सक्षम करणे, समुदायांना जोडणे.",
        main_sub: "स्थानिक समस्या नोंदवण्यासाठी आणि सार्वजनिक दुरुस्तीचा मागोवा घेण्यासाठी एक विश्वसनीय व्यासपीठ.",
        cta_btn: "ॲप्लिकेशन डाउनलोड करा",
        val1_title: "समस्या नोंदवा", val1_sub: "स्थानिक नागरी समस्यांची थेट अधिकाऱ्यांना सहजपणे तक्रार करा.",
        val2_title: "प्रगती पहा", val2_sub: "सध्याच्या दुरुस्तीची स्थिती रिअल टाइममध्ये पहा.",
        val3_title: "थेट अपडेट्स", val3_sub: "अधिकृत सूचनांसह तुमच्या स्थानिक क्षेत्राबद्दल माहिती मिळवा.",
        val4_title: "सुरक्षित व्यासपीठ", val4_sub: "तुमचा डेटा आणि विनंत्या सुरक्षितपणे जतन केल्या जातात.",
        select_lang: "भाषा निवडा", built_by: "निर्मित"
    },
    gu: {
        lang: "ગુજરાતી", products: "ઉત્પાદનો", careers: "કારકિર્દી", coming_soon: "ટૂંક સમયમાં આવી રહ્યું છે",
        badge: "સ્માર્ટ નાગરિક પ્લેટફોર્મ",
        main_title: "નાગરિકોને સશક્તિકરણ, સમુદાયોને જોડવા.",
        main_sub: "સ્થાનિક સમસ્યાઓ જણાવવા અને જાહેર સમારકામ જોવા માટે વિશ્વસનીય પ્લેટફોર્મ.",
        cta_btn: "એપ્લિકેશન ડાઉનલોડ કરો",
        val1_title: "સમસ્યાઓ નોંધાવો", val1_sub: "સ્થાનિક નાગરિક સમસ્યાઓની સીધી સત્તાવાળાઓને સરળતાથી જાણ કરો.",
        val2_title: "પ્રગતિ જુઓ", val2_sub: "વર્તમાન સમારકામની સ્થિતિ વાસ્તવિક સમયમાં જુઓ.",
        val3_title: "લાઇવ અપડેટ્સ", val3_sub: "સત્તાવાર સૂચનાઓ સાથે તમારા સ્થાનિક વિસ્તાર વિશે માહિતગાર રહો.",
        val4_title: "સુરક્ષિત પ્લેટફોર્મ", val4_sub: "તમારો ડેટા અને વિનંતીઓ સુરક્ષિત રીતે સંગ્રહિત છે.",
        select_lang: "ભાષા પસંદ કરો", built_by: "દ્વારા બનાવવામાં"
    },
    te: {
        lang: "తెలుగు", products: "ఉత్పత్తులు", careers: "కెరీర్స్", coming_soon: "త్వరలో వస్తుంది",
        badge: "స్మార్ట్ సివిక్ ప్లాట్‌ఫారమ్",
        main_title: "పౌరుల సాధికారత, సంఘాల అనుసంధానం.",
        main_sub: "స్థానిక సమస్యలను నివేదించడానికి మరియు ప్రజా మరమ్మతులను ట్రాక్ చేయడానికి నమ్మకమైన వేదిక.",
        cta_btn: "అప్లికేషన్ డౌన్‌లోడ్ చేయండి",
        val1_title: "సమస్యలను నివేదించండి", val1_sub: "స్థానిక పౌర సమస్యలను నేరుగా అధికారులకు సులభంగా నివేదించండి.",
        val2_title: "పురోగతిని చూడండి", val2_sub: "ప్రస్తుత మరమ్మతుల స్థితిని నిజ సమయంలో చూడండి.",
        val3_title: "ప్రత్యక్ష నవీకరణలు", val3_sub: "అధికారిక నోటీసులతో మీ స్థానిక ప్రాంతం గురించి తెలుసుకోండి.",
        val4_title: "సురక్షిత వేదిక", val4_sub: "మీ డేటా మరియు అభ్యర్థనలు సురక్షితంగా నిల్వ చేయబడతాయి.",
        select_lang: "భాషను ఎంచుకోండి", built_by: "నిర్మించినవారు"
    },
    ta: {
        lang: "தமிழ்", products: "தயாரிப்புகள்", careers: "தொழில்கள்", coming_soon: "விரைவில்",
        badge: "ஸ்மார்ட் குடிமக்கள் தளம்",
        main_title: "குடிமக்களுக்கு அதிகாரமளித்தல், சமூகங்களை இணைத்தல்.",
        main_sub: "உள்ளூர் பிரச்சனைகளைப் புகாரளிக்க மற்றும் பொது பழுதுகளைக் கண்காணிக்க நம்பகமான தளம்.",
        cta_btn: "பயன்பாட்டைப் பதிவிறக்கவும்",
        val1_title: "பிரச்சனைகளைப் புகாரளிக்கவும்", val1_sub: "உள்ளூர் குடிமக்கள் பிரச்சினைகளை அதிகாரிகளிடம் எளிதாகப் புகாரளிக்கவும்.",
        val2_title: "முன்னேற்றத்தைப் பார்க்கவும்", val2_sub: "தற்போதைய பழுதுகளின் நிலையை உண்மையான நேரத்தில் பார்க்கவும்.",
        val3_title: "நேரடி புதுப்பிப்புகள்", val3_sub: "அதிகாரப்பூர்வ அறிவிப்புகளுடன் உங்கள் உள்ளூர் பகுதியைப் பற்றி தெரிந்து கொள்ளுங்கள்.",
        val4_title: "பாதுகாப்பான தளம்", val4_sub: "உங்கள் தரவு மற்றும் கோரிக்கைகள் பாதுகாப்பாக சேமிக்கப்படுகின்றன.",
        select_lang: "மொழியைத் தேர்ந்தெடுக்கவும்", built_by: "உருவாக்கியவர்"
    },
    pa: {
        lang: "ਪੰਜਾਬੀ", products: "ਉਤਪਾਦ", careers: "ਕਰੀਅਰ", coming_soon: "ਜਲਦੀ ਆ ਰਿਹਾ ਹੈ",
        badge: "ਸਮਾਰਟ ਸਿਵਿਕ ਪਲੇਟਫਾਰਮ",
        main_title: "ਨਾਗਰਿਕਾਂ ਦਾ ਸਸ਼ਕਤੀਕਰਨ, ਭਾਈਚਾਰਿਆਂ ਨੂੰ ਜੋੜਨਾ।",
        main_sub: "ਸਥਾਨਕ ਸਮੱਸਿਆਵਾਂ ਦੀ ਰਿਪੋਰਟ ਕਰਨ ਅਤੇ ਜਨਤਕ ਮੁਰੰਮਤ ਨੂੰ ਟਰੈਕ ਕਰਨ ਲਈ ਇੱਕ ਭਰੋਸੇਯੋਗ ਪਲੇਟਫਾਰਮ।",
        cta_btn: "ਐਪਲੀਕੇਸ਼ਨ ਡਾਊਨਲੋਡ ਕਰੋ",
        val1_title: "ਮੁੱਦਿਆਂ ਦੀ ਰਿਪੋਰਟ ਕਰੋ", val1_sub: "ਸਥਾਨਕ ਨਾਗਰਿਕ ਸਮੱਸਿਆਵਾਂ ਦੀ ਸਿੱਧੇ ਅਧਿਕਾਰੀਆਂ ਨੂੰ ਆਸਾਨੀ ਨਾਲ ਰਿਪੋਰਟ ਕਰੋ।",
        val2_title: "ਤਰੱਕੀ ਟਰੈਕ ਕਰੋ", val2_sub: "ਅਸਲ ਸਮੇਂ ਵਿੱਚ ਮੌਜੂਦਾ ਮੁਰੰਮਤ ਦੀ ਸਥਿਤੀ ਦੇਖੋ।",
        val3_title: "ਲਾਈਵ ਅੱਪਡੇਟ", val3_sub: "ਅਧਿਕਾਰਤ ਨੋਟਿਸਾਂ ਦੇ ਨਾਲ ਆਪਣੇ ਸਥਾਨਕ ਖੇਤਰ ਬਾਰੇ ਸੂਚਿਤ ਰਹੋ।",
        val4_title: "ਸੁਰੱਖਿਅਤ ਪਲੇਟਫਾਰਮ", val4_sub: "ਤੁਹਾਡਾ ਡਾਟਾ ਅਤੇ ਬੇਨਤੀਆਂ ਸੁਰੱਖਿਅਤ ਢੰਗ ਨਾਲ ਸਟੋਰ ਕੀਤੀਆਂ ਜਾਂਦੀਆਂ ਹਨ।",
        select_lang: "ਭਾਸ਼ਾ ਚੁਣੋ", built_by: "ਦੁਆਰਾ ਬਣਾਇਆ ਗਿਆ"
    },
    bho: {
        lang: "भोजपुरी", products: "उत्पाद", careers: "करियर", coming_soon: "जल्द आवत बा",
        badge: "स्मार्ट नागरिक मंच",
        main_title: "नागरिक लोग के सशक्त कइल, समुदाय के जोड़ल।",
        main_sub: "स्थानीय समस्या बतावे आ सार्वजनिक मरम्मत ट्रैक करे खातिर एगो भरोसेमंद मंच।",
        cta_btn: "एप्लीकेशन डाउनलोड करीं",
        val1_title: "समस्या दर्ज करीं", val1_sub: "स्थानीय नागरिक समस्या के सीधा अधिकारी लोग के आसानी से रिपोर्ट करीं।",
        val2_title: "प्रगति ट्रैक करीं", val2_sub: "वर्तमान मरम्मत के स्थिति वास्तविक समय में देखीं।",
        val3_title: "लाइव अपडेट", val3_sub: "आधिकारिक नोटिस के साथ आपन एरिया के बारे में अपडेट रहीं।",
        val4_title: "सुरक्षित मंच", val4_sub: "राउर डेटा आ अनुरोध सुरक्षित रूप से संग्रहीत कइल जाला।",
        select_lang: "भाषा चुनीं", built_by: "द्वारा बनावल"
    },
    ar: {
        lang: "العربية", products: "المنتجات", careers: "وظائف", coming_soon: "قريباً",
        badge: "منصة المدنية الذكية",
        main_title: "تمكين المواطنين، ربط المجتمعات.",
        main_sub: "منصة موثوقة وبسيطة للإبلاغ عن المشكلات المحلية وتتبع الإصلاحات العامة.",
        cta_btn: "تنزيل التطبيق",
        val1_title: "الإبلاغ عن المشاكل", val1_sub: "قم بالإبلاغ بسهولة عن المشاكل المدنية المحلية للسلطات مباشرة.",
        val2_title: "تتبع التقدم", val2_sub: "انظر حالة الإصلاحات الحالية في الوقت الحقيقي.",
        val3_title: "تحديثات حية", val3_sub: "ابق على اطلاع بمنطقتك المحلية مع الإشعارات الرسمية.",
        val4_title: "منصة آمنة", val4_sub: "يتم تخزين بياناتك وطلبات الخدمة العامة بأمان.",
        select_lang: "اختر اللغة", built_by: "بنيت بواسطة"
    },
    es: {
        lang: "Español", products: "Productos", careers: "Carreras", coming_soon: "Próximamente",
        badge: "Plataforma Cívica Inteligente",
        main_title: "Empoderando a los ciudadanos, conectando comunidades.",
        main_sub: "Una plataforma confiable para reportar problemas locales y rastrear reparaciones.",
        cta_btn: "Descargar Aplicación",
        val1_title: "Reportar Problemas", val1_sub: "Reporte fácilmente problemas cívicos locales directamente a las autoridades.",
        val2_title: "Rastrear Progreso", val2_sub: "Vea el estado de las reparaciones actuales en tiempo real.",
        val3_title: "Actualizaciones en Vivo", val3_sub: "Manténgase informado sobre su área local con avisos oficiales.",
        val4_title: "Plataforma Segura", val4_sub: "Sus datos y solicitudes se almacenan de forma segura.",
        select_lang: "Seleccionar Idioma", built_by: "Construido por"
    },
    fr: {
        lang: "Français", products: "Produits", careers: "Carrières", coming_soon: "Bientôt disponible",
        badge: "Plateforme Civique Intelligente",
        main_title: "Autonomiser les citoyens, connecter les communautés.",
        main_sub: "Une plateforme simple pour signaler les problèmes locaux et suivre les réparations.",
        cta_btn: "Télécharger l'Application",
        val1_title: "Signaler des Problèmes", val1_sub: "Signalez facilement les problèmes locaux aux autorités.",
        val2_title: "Suivre les Progrès", val2_sub: "Voir l'état des réparations actuelles en temps réel.",
        val3_title: "Mises à jour en Direct", val3_sub: "Restez informé sur votre région avec des avis officiels.",
        val4_title: "Plateforme Sécurisée", val4_sub: "Vos données et demandes sont stockées en toute sécurité.",
        select_lang: "Choisir la Langue", built_by: "Construit par"
    },
    de: {
        lang: "Deutsch", products: "Produkte", careers: "Karriere", coming_soon: "Demnächst",
        badge: "Intelligente Bürgerplattform",
        main_title: "Bürger stärken, Gemeinschaften verbinden.",
        main_sub: "Eine vertrauenswürdige Plattform, um lokale Probleme zu melden und Reparaturen zu verfolgen.",
        cta_btn: "Anwendung Herunterladen",
        val1_title: "Probleme Melden", val1_sub: "Melden Sie lokale Bürgerprobleme ganz einfach direkt an die Behörden.",
        val2_title: "Fortschritt Verfolgen", val2_sub: "Sehen Sie den Status aktueller Reparaturen in Echtzeit.",
        val3_title: "Live-Updates", val3_sub: "Bleiben Sie mit offiziellen Mitteilungen über Ihre Umgebung informiert.",
        val4_title: "Sichere Plattform", val4_sub: "Ihre Daten und Anfragen werden sicher gespeichert.",
        select_lang: "Sprache Wählen", built_by: "Gebaut von"
    }
};

export default function MarketingLanding() {
    const navigate = useNavigate();
    
    // STATE MANAGEMENT
    const [lang, setLang] = useState('en');
    const [showLangPrompt, setShowLangPrompt] = useState(false);
    const [showProductsPrompt, setShowProductsPrompt] = useState(false);
    const [localCity, setLocalCity] = useState('India');

    useEffect(() => {
        const sysLang = navigator.language.slice(0, 2);
        if (TRANSLATIONS[sysLang]) setLang(sysLang);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDownloadRedirect = () => {
        navigate('/download');
    };

    const currentT = TRANSLATIONS[lang] || TRANSLATIONS['en'];
    const languageOptions = [
        { code: 'en', label: 'English' }, { code: 'hi', label: 'हिन्दी' }, { code: 'hinglish', label: 'Hinglish' },
        { code: 'mr', label: 'मराठी' }, { code: 'gu', label: 'ગુજરાતી' }, { code: 'te', label: 'తెలుగు' },
        { code: 'ta', label: 'தமிழ்' }, { code: 'pa', label: 'ਪੰਜਾਬੀ' }, { code: 'bho', label: 'भोजपुरी' },
        { code: 'ar', label: 'العربية' }, { code: 'es', label: 'Español' }, { code: 'fr', label: 'Français' },
        { code: 'de', label: 'Deutsch' }
    ];

    const stagger1 = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.1 } } };
    const stagger2 = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2 } } };
    const stagger3 = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.3 } } };

    return (
        // STRICTLY APPLIED: absolute top-0 left-0 w-full z-50 AND background color #00897B
        <div className="absolute top-0 left-0 w-full z-50 min-h-screen font-sans overflow-x-hidden flex flex-col relative" style={{ backgroundColor: '#00897B', color: '#FFFFFF' }}>
            
            <style>
                {`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade { animation: fadeIn 0.8s ease-out forwards; }
                html { scroll-behavior: smooth; }
                `}
            </style>

            {/* MINIMAL TOP HEADER */}
            <header className="w-full flex items-center justify-between px-8 md:px-16 py-8 animate-fade relative z-50">
                <div className="flex items-center gap-1 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
                    <img 
                        src="/logo-2.png" 
                        alt="Movyra Logo" 
                        className="h-8 w-auto mr-[1px]" 
                        onError={(e) => { e.target.style.display = 'none' }} 
                    />
                    <span className="font-black text-[1.5rem] tracking-tighter text-[#FFFFFF]">
                        ovyra <span className="font-medium text-[1rem] ml-1">NagrikSetu</span>
                    </span>
                </div>
                
                <div className="flex items-center gap-4 sm:gap-6 text-[0.9rem] font-bold">
                    <button 
                        onClick={() => setShowLangPrompt(true)}
                        className="flex items-center gap-2 text-[#FFFFFF] hover:text-[#E0E0E0] transition-colors outline-none"
                    >
                        <Globe size={16} /> <span className="hidden sm:inline">{currentT.lang}</span>
                    </button>
                    <button 
                        onClick={() => setShowProductsPrompt(true)}
                        className="hidden sm:block text-[#FFFFFF] hover:text-[#E0E0E0] transition-colors outline-none"
                    >
                        {currentT.products}
                    </button>
                </div>
            </header>

            {/* LANGUAGE SELECTOR MODAL */}
            <AnimatePresence>
                {showLangPrompt && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-[400px] bg-[#FFFFFF] rounded-3xl p-8 flex flex-col shadow-2xl relative max-h-[80vh] overflow-y-auto border border-[#E0E0E0]"
                        >
                            <button 
                                onClick={() => setShowLangPrompt(false)} 
                                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[#111111] hover:bg-[#F5F5F5] rounded-full transition-colors outline-none"
                            >
                                <X size={18} />
                            </button>
                            
                            <div className="w-12 h-12 mx-auto rounded-full border border-[#E0E0E0] flex items-center justify-center mb-4">
                                <Globe size={24} color="#111111" strokeWidth="1.5" />
                            </div>

                            <h2 className="text-[1.5rem] font-black tracking-tight mb-2 text-[#111111] text-center">Select Language</h2>
                            <p className="text-[#666666] text-[0.9rem] text-center mb-8">Choose your preferred viewing language.</p>
                            
                            <div className="flex flex-col gap-2">
                                {languageOptions.map((option) => (
                                    <button 
                                        key={option.code}
                                        onClick={() => { setLang(option.code); setShowLangPrompt(false); }}
                                        className={`w-full p-4 rounded-xl flex items-center justify-between group transition-colors outline-none ${lang === option.code ? 'bg-[#00897B] text-white border border-[#00897B]' : 'bg-[#F9FAFB] text-[#111111] border border-[#E0E0E0] hover:border-[#00897B]'}`}
                                    >
                                        <span className="font-bold text-[1rem]">{option.label}</span>
                                        {lang === option.code && <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* STRICT PRODUCTS ECOSYSTEM MODAL (Re-aligned & High Visibility) */}
            <AnimatePresence>
                {showProductsPrompt && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-[500px] bg-[#FFFFFF] rounded-3xl p-8 flex flex-col shadow-2xl relative border border-[#E0E0E0]"
                        >
                            <button 
                                onClick={() => setShowProductsPrompt(false)} 
                                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[#111111] hover:bg-[#F5F5F5] rounded-full transition-colors outline-none"
                            >
                                <X size={18} />
                            </button>

                            <h2 className="text-[1.5rem] font-black tracking-tight mb-2 text-[#111111] text-center mt-2">Also from us</h2>
                            <p className="text-[#666666] text-[0.9rem] text-center mb-8">Discover our connected platforms.</p>

                            <div className="flex flex-col gap-4">
                                {/* Sahay */}
                                <div className="flex items-center gap-4 p-4 rounded-2xl border border-[#E0E0E0] bg-[#F9FAFB] hover:border-[#CCCCCC] transition-colors cursor-pointer outline-none">
                                    <img src="/logo-2.png" alt="M" className="h-6 w-auto" onError={(e) => { e.target.style.display = 'none' }} />
                                    <div className="flex flex-col">
                                        <span className="font-black text-xl leading-none text-[#111111]">
                                            ovyra <span className="font-medium text-[1rem] text-[#666666] ml-1">Sahay</span>
                                        </span>
                                    </div>
                                </div>

                                {/* Civic */}
                                <div className="flex items-center gap-4 p-4 rounded-2xl border border-[#E0E0E0] bg-[#F9FAFB] hover:border-[#CCCCCC] transition-colors cursor-pointer outline-none">
                                    <img src="/logo-2.png" alt="M" className="h-6 w-auto" onError={(e) => { e.target.style.display = 'none' }} />
                                    <div className="flex flex-col">
                                        <span className="font-black text-xl leading-none text-[#111111]">
                                            ovyra <span className="font-medium text-[1rem] text-[#666666] ml-1">Civic</span>
                                        </span>
                                    </div>
                                </div>

                                {/* NagrikSetu (Active Highlight) */}
                                <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-[#00897B] bg-[#E0F2F1] outline-none">
                                    <img src="/logo-2.png" alt="M" className="h-6 w-auto" onError={(e) => { e.target.style.display = 'none' }} />
                                    <div className="flex flex-col">
                                        <span className="font-black text-xl leading-none text-[#00897B]">
                                            ovyra <span className="font-bold text-[1rem] ml-1">NagrikSetu</span>
                                        </span>
                                    </div>
                                </div>

                                {/* SevaSetu (Coming Soon) */}
                                <div className="flex items-center justify-between p-4 rounded-2xl border border-[#E0E0E0] bg-[#FFFFFF] opacity-70 outline-none">
                                    <div className="flex items-center gap-4">
                                        <img src="/logo.png" alt="M" className="h-6 w-auto" onError={(e) => { e.target.style.display = 'none' }} />
                                        <div className="flex flex-col">
                                            <span className="font-black text-xl leading-none text-[#111111]">
                                                ovyra <span className="font-medium text-[1rem] text-[#666666] ml-1">SevaSetu</span>
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-[0.75rem] font-bold px-3 py-1 bg-[#F5F5F5] text-[#111111] rounded-full uppercase tracking-wider">
                                        {currentT.coming_soon}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MAIN CONTAINER */}
            <div className="w-full max-w-[1400px] mx-auto px-8 md:px-16 py-12 flex flex-col lg:flex-row gap-20 items-center justify-between relative z-10 flex-1">
                
                {/* SECTION 1: MARKETING HERO & VALUE PROPOSITIONS */}
                <motion.div initial="hidden" animate="visible" variants={stagger1} className="flex-1 w-full">
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full mb-8 border border-white/30 bg-white/10">
                        <ShieldCheck size={18} color="#FFFFFF" />
                        <span className="text-[0.85rem] font-bold tracking-widest uppercase text-[#FFFFFF]">{currentT.badge}</span>
                    </div>

                    <h1 className="text-[3.5rem] md:text-[5rem] lg:text-[5.5rem] font-black leading-[1] tracking-tighter mb-6 text-[#FFFFFF] max-w-[800px]">
                        {currentT.main_title}
                    </h1>
                    
                    <p className="text-[1.25rem] md:text-[1.5rem] text-[#E0E0E0] font-medium leading-[1.5] max-w-[600px] mb-12">
                        {currentT.main_sub}
                    </p>

                    {/* DYNAMIC CTA */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md mb-16 relative">
                        <button onClick={handleDownloadRedirect} className="w-full bg-[#FFB300] text-[#111111] py-4 rounded-xl font-black text-[1.1rem] flex items-center justify-center gap-2 hover:bg-[#FFC107] transition-transform hover:scale-105 outline-none shadow-lg">
                            {currentT.cta_btn} <ArrowRight size={20} />
                        </button>
                    </div>
                    
                    {/* VALUE PROPOSITIONS GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="flex flex-col gap-2">
                            <div className="w-10 h-10 rounded-full border border-white/30 bg-white/10 flex items-center justify-center mb-2">
                                <MapPin size={18} color="#FFFFFF" />
                            </div>
                            <h4 className="font-black text-[1.2rem] text-[#FFFFFF]">{currentT.val1_title}</h4>
                            <p className="text-[#E0E0E0] text-[0.95rem] leading-relaxed">{currentT.val1_sub}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="w-10 h-10 rounded-full border border-white/30 bg-white/10 flex items-center justify-center mb-2">
                                <Activity size={18} color="#FFFFFF" />
                            </div>
                            <h4 className="font-black text-[1.2rem] text-[#FFFFFF]">{currentT.val2_title}</h4>
                            <p className="text-[#E0E0E0] text-[0.95rem] leading-relaxed">{currentT.val2_sub}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="w-10 h-10 rounded-full border border-white/30 bg-white/10 flex items-center justify-center mb-2">
                                <Bell size={18} color="#FFFFFF" />
                            </div>
                            <h4 className="font-black text-[1.2rem] text-[#FFFFFF]">{currentT.val3_title}</h4>
                            <p className="text-[#E0E0E0] text-[0.95rem] leading-relaxed">{currentT.val3_sub}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="w-10 h-10 rounded-full border border-white/30 bg-white/10 flex items-center justify-center mb-2">
                                <ShieldCheck size={18} color="#FFFFFF" />
                            </div>
                            <h4 className="font-black text-[1.2rem] text-[#FFFFFF]">{currentT.val4_title}</h4>
                            <p className="text-[#E0E0E0] text-[0.95rem] leading-relaxed">{currentT.val4_sub}</p>
                        </div>
                    </div>
                </motion.div>

                {/* GRAPHIC / ILLUSTRATION SECTION */}
                <motion.div initial="hidden" animate="visible" variants={stagger2} className="hidden lg:flex justify-end w-full lg:w-[480px] shrink-0">
                    <svg viewBox="0 0 400 400" className="w-full h-auto max-w-[500px]" fill="none">
                        <circle cx="200" cy="200" r="180" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="8 8"/>
                        <circle cx="200" cy="200" r="120" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                        <motion.circle cx="200" cy="200" r="60" fill="#FFFFFF" initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }} />
                        <path d="M200 140 L200 50 M260 200 L350 200 M200 260 L200 350 M140 200 L50 200" stroke="#FFFFFF" strokeWidth="3"/>
                        <circle cx="200" cy="50" r="8" fill="#FFB300" />
                        <circle cx="350" cy="200" r="8" fill="#FFB300" />
                        <circle cx="200" cy="350" r="8" fill="#FFB300" />
                        <circle cx="50" cy="200" r="8" fill="#FFB300" />
                    </svg>
                </motion.div>
            </div>

            {/* FOOTER ALIGNMENT */}
            <footer className="w-full max-w-[1400px] mx-auto mt-auto flex flex-col md:flex-row items-center justify-between gap-8 px-8 md:px-16 py-8 border-t border-white/20 opacity-0 animate-fade stagger-3 relative z-10">
                
                <div className="flex flex-col md:flex-row items-center gap-6 text-[0.8rem] font-bold text-[#FFFFFF]">
                    <div className="flex items-center gap-6">
                        <button onClick={() => setShowProductsPrompt(true)} className="hover:text-[#E0E0E0] transition-colors outline-none">{currentT.products}</button>
                        <span className="w-1 h-1 bg-[#FFFFFF] opacity-50 rounded-full"></span>
                        <Link to="/careers" className="hover:text-[#E0E0E0] transition-colors outline-none">{currentT.careers}</Link>
                        <span className="w-1 h-1 bg-[#FFFFFF] opacity-50 rounded-full"></span>
                        
                        <div className="flex items-center gap-2 uppercase tracking-wider">
                            {currentT.built_by} 
                            <a href="https://rebrand.ly/aatns" target="_blank" rel="noopener noreferrer" className="ml-1 hover:opacity-80 transition-opacity outline-none">
                                <img src="/aat.png" alt="AnyAstro" className="h-4 w-auto object-contain" onError={(e) => { e.target.style.display = 'none'; e.target.insertAdjacentHTML('afterend', '<span class="underline">AnyAstro</span>'); }} />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center cursor-pointer opacity-90" onClick={scrollToTop}>
                        <img 
                            src="/logo-2.png" 
                            alt="M" 
                            className="h-6 w-auto mr-[1px]" 
                            onError={(e) => { e.target.style.display = 'none' }} 
                        />
                        <span className="font-black text-xl -ml-[3px] text-[#FFFFFF]">
                            &nbsp;ovyra <span className="font-medium text-[0.75rem] ml-1 tracking-wide">NagrikSetu</span>
                        </span>
                    </div>

                    <button onClick={scrollToTop} className="p-2 rounded-full border border-white/30 text-[#FFFFFF] hover:bg-white/10 transition-colors outline-none">
                        <ArrowUp size={16} />
                    </button>
                </div>
            </footer>
        </div>
    );
}