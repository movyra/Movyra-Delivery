/**
 * SYSTEM DOCUMENTATION / 15-LANGUAGE TRANSLATION
 * Context: Official Download Page for NagrikSetu Application.
 * Brand: Movyra Civic (NagrikSetu)
 * Design: Exact match to MarketingLanding layout (Teal background, left-aligned content, custom landscape SVG, interactive modals)
 *
 * SYSTEM COLORS REFERENCE (STRICT):
 * Primary Background: #00897B (Civic Teal)
 * Dark Text: #111111 (Deep Black)
 * Containers: #FFFFFF (Pure White)
 * Highlight CTA: #FFB300 (Action Yellow)
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
// Removed failing Linkedin/Instagram/Youtube imports that caused Vite crashes
import { X, ArrowRight, ArrowUp, Globe, DownloadCloud, ShieldCheck, HardDrive, Hash, Activity } from 'lucide-react';

const TRANSLATIONS = {
    en: {
        lang: "English", products: "Products", sitemap: "Sitemap", careers: "Careers", coming_soon: "Coming Soon", built_by: "Built by",
        title: "Official Application Download", subtitle: "Secure Civic Platform by Movyra", 
        version: "Version", size: "Size", checksum: "Security Checksum", download: "Download Application", 
        guideTitle: "Installation Guide", 
        step1: "Click the download button to save the file to your phone.", 
        step2: "Open your downloads folder and tap the downloaded file.", 
        step3: "If a security warning appears, click 'Download Anyway' or 'Install Anyway'. This is normal for direct downloads.", 
        step4: "Complete the installation and open NagrikSetu."
    },
    hi: {
        lang: "हिन्दी", products: "उत्पाद", sitemap: "साइटमैप", careers: "करियर", coming_soon: "जल्द आ रहा है", built_by: "निर्मित",
        title: "आधिकारिक एप्लिकेशन डाउनलोड", subtitle: "मोविरा द्वारा सुरक्षित नागरिक मंच", 
        version: "संस्करण", size: "आकार", checksum: "सुरक्षा चेकसम", download: "एप्लिकेशन डाउनलोड करें", 
        guideTitle: "स्थापना गाइड", 
        step1: "फ़ाइल को अपने फोन में सहेजने के लिए डाउनलोड बटन पर क्लिक करें।", 
        step2: "अपना डाउनलोड फ़ोल्डर खोलें और डाउनलोड की गई फ़ाइल पर टैप करें।", 
        step3: "यदि कोई सुरक्षा चेतावनी दिखाई देती है, तो 'फिर भी डाउनलोड करें' या 'फिर भी इंस्टॉल करें' पर क्लिक करें। यह सीधे डाउनलोड के लिए सामान्य है।", 
        step4: "स्थापना पूरी करें और नागरिकसेतु खोलें।"
    },
    hinglish: {
        lang: "Hinglish", products: "Products", sitemap: "Sitemap", careers: "Careers", coming_soon: "Coming Soon", built_by: "Built by",
        title: "Official Application Download", subtitle: "Movyra dwara secure civic platform", 
        version: "Version", size: "Size", checksum: "Security Checksum", download: "Application Download Karein", 
        guideTitle: "Installation Guide", 
        step1: "File ko apne phone mein save karne ke liye download button dabayein.", 
        step2: "Apna downloads folder kholein aur file par tap karein.", 
        step3: "Agar security warning aaye, toh 'Download Anyway' par click karein. Yeh direct download ke liye normal hai.", 
        step4: "Installation pura karein aur NagrikSetu kholein."
    },
    mr: {
        lang: "मराठी", products: "उत्पादने", sitemap: "साइटमॅप", careers: "करिअर", coming_soon: "लवकरच येत आहे", built_by: "निर्मित",
        title: "अधिकृत ॲप्लिकेशन डाउनलोड", subtitle: "मोविरा द्वारे सुरक्षित नागरी व्यासपीठ", 
        version: "आवृत्ती", size: "आकार", checksum: "सुरक्षा चेकसम", download: "ॲप्लिकेशन डाउनलोड करा", 
        guideTitle: "स्थापना मार्गदर्शक", 
        step1: "फाइल तुमच्या फोनवर सेव्ह करण्यासाठी डाउनलोड बटणावर क्लिक करा.", 
        step2: "तुमचे डाउनलोड फोल्डर उघडा आणि डाउनलोड केलेल्या फाइलवर टॅप करा.", 
        step3: "सुरक्षा चेतावणी दिसल्यास, 'तरीही डाउनलोड करा' वर क्लिक करा. थेट डाउनलोडसाठी हे सामान्य आहे.", 
        step4: "स्थापना पूर्ण करा आणि नागरिकसेतू उघडा."
    },
    gu: {
        lang: "ગુજરાતી", products: "ઉત્પાદનો", sitemap: "સાઇટમેપ", careers: "કારકિર્દી", coming_soon: "ટૂંક સમયમાં", built_by: "દ્વારા",
        title: "સત્તાવાર એપ્લિકેશન ડાઉનલોડ", subtitle: "મોવિરા દ્વારા સુરક્ષિત નાગરિક પ્લેટફોર્મ", 
        version: "આવૃત્તિ", size: "કદ", checksum: "સુરક્ષા ચેકસમ", download: "એપ્લિકેશન ડાઉનલોડ કરો", 
        guideTitle: "स्थाપન માર્ગદર્શિકા", 
        step1: "ફાઇલને તમારા ફોનમાં સાચવવા માટે ડાઉનલોડ બટન પર ક્લિક કરો.", 
        step2: "તમારું ડાઉનલોડ્સ ફોલ્ડર ખોલો અને ડાઉનલોડ કરેલી ફાઇલ પર ટેપ કરો.", 
        step3: "જો કોઈ સુરક્ષા ચેતવણી દેખાય, તો 'તો પણ ડાઉનલોડ કરો' પર ક્લિક કરો. આ સીધા ડાઉનલોડ માટે સામાન્ય છે.", 
        step4: "સ્થાપન પૂર્ણ કરો અને નાગરિકસેતુ ખોલો."
    },
    te: {
        lang: "తెలుగు", products: "ఉత్పత్తులు", sitemap: "సైట్‌మ్యాప్", careers: "కెరీర్స్", coming_soon: "త్వరలో", built_by: "నిర్మించినవారు",
        title: "అధికారిక అప్లికేషన్ డౌన్‌లోడ్", subtitle: "మోవిరా ద్వారా సురక్షిత సివిక్ ప్లాట్‌ఫారమ్", 
        version: "వెర్షన్", size: "పరిమాణం", checksum: "భద్రతా చెక్‌సమ్", download: "అప్లికేషన్ డౌన్‌లోడ్ చేయండి", 
        guideTitle: "ఇన్‌స్టాలేషన్ గైడ్", 
        step1: "ఫైల్‌ను మీ ఫోన్‌లో సేవ్ చేయడానికి డౌన్‌లోడ్ బటన్‌ను క్లిక్ చేయండి.", 
        step2: "మీ డౌన్‌లోడ్‌ల ఫోల్డర్‌ను తెరిచి, డౌన్‌లోడ్ చేసిన ఫైల్‌పై నొక్కండి.", 
        step3: "భద్రతా హెచ్చరిక కనిపిస్తే, 'ఎలాగైనా డౌన్‌లోడ్ చేయి' క్లిక్ చేయండి. ప్రత్యక్ష డౌన్‌లోడ్‌లకు ఇది సాధారణం.", 
        step4: "ఇన్‌స్టాలేషన్‌ను పూర్తి చేసి, నాగ్రిక్‌సేతును తెరవండి."
    },
    ta: {
        lang: "தமிழ்", products: "தயாரிப்புகள்", sitemap: "தளவரைபடம்", careers: "தொழில்கள்", coming_soon: "விரைவில்", built_by: "உருவாக்கியவர்",
        title: "அதிகாரப்பூர்வ பயன்பாடு பதிவிறக்கம்", subtitle: "மோவிராவால் பாதுகாப்பான குடிமக்கள் தளம்", 
        version: "பதிப்பு", size: "அளவு", checksum: "பாதுகாப்பு குறியீடு", download: "பயன்பாட்டைப் பதிவிறக்கவும்", 
        guideTitle: "நிறுவல் வழிகாட்டி", 
        step1: "உங்கள் தொலைபேசியில் கோப்பைச் சேமிக்க பதிவிறக்க பொத்தானைக் கிளிக் செய்யவும்.", 
        step2: "உங்கள் பதிவிறக்கங்கள் கோப்புறையைத் திறந்து பதிவிறக்கிய கோப்பைத் தட்டவும்.", 
        step3: "பாதுகாப்பு எச்சரிக்கை தோன்றினால், 'எப்படியும் பதிவிறக்கு' என்பதைக் கிளிக் செய்யவும். நேரடி பதிவிறக்கங்களுக்கு இது சாதாரணமானது.", 
        step4: "நிறுவலை முடித்து நாகரிக் சேதுவை திறக்கவும்."
    },
    pa: {
        lang: "ਪੰਜਾਬੀ", products: "ਉਤਪਾਦ", sitemap: "ਸਾਈਟਮੈਪ", careers: "ਕਰੀਅਰ", coming_soon: "ਜਲਦੀ", built_by: "ਦੁਆਰਾ ਬਣਾਇਆ",
        title: "ਅਧਿਕਾਰਤ ਐਪਲੀਕੇਸ਼ਨ ਡਾਊਨਲੋਡ", subtitle: "ਮੋਵਿਰਾ ਦੁਆਰਾ ਸੁਰੱਖਿਅਤ ਨਾਗਰਿਕ ਪਲੇਟਫਾਰਮ", 
        version: "ਸੰਸਕਰਣ", size: "ਆਕਾਰ", checksum: "ਸੁਰੱਖਿਆ ਚੈੱਕਸਮ", download: "ਐਪਲੀਕੇਸ਼ਨ ਡਾਊਨਲੋਡ ਕਰੋ", 
        guideTitle: "ਇੰਸਟਾਲੇਸ਼ਨ ਗਾਈਡ", 
        step1: "ਆਪਣੇ ਫ਼ੋਨ ਵਿੱਚ ਫ਼ਾਈਲ ਨੂੰ ਸੁਰੱਖਿਅਤ ਕਰਨ ਲਈ ਡਾਊਨਲੋਡ ਬਟਨ 'ਤੇ ਕਲਿੱਕ ਕਰੋ।", 
        step2: "ਆਪਣਾ ਡਾਊਨਲੋਡ ਫੋਲਡਰ ਖੋਲ੍ਹੋ ਅਤੇ ਡਾਊਨਲੋਡ ਕੀਤੀ ਫ਼ਾਈਲ 'ਤੇ ਟੈਪ ਕਰੋ।", 
        step3: "ਜੇਕਰ ਕੋਈ ਸੁਰੱਖਿਆ ਚੇਤਾਵਨੀ ਦਿਖਾਈ ਦਿੰਦੀ ਹੈ, ਤਾਂ 'ਫਿਰ ਵੀ ਡਾਊਨਲੋਡ ਕਰੋ' 'ਤੇ ਕਲਿੱਕ ਕਰੋ। ਸਿੱਧੇ ਡਾਊਨਲੋਡ ਲਈ ਇਹ ਆਮ ਹੈ।", 
        step4: "ਇੰਸਟਾਲੇਸ਼ਨ ਪੂਰੀ ਕਰੋ ਅਤੇ ਨਾਗਰਿਕਸੇਤੂ ਖੋਲ੍ਹੋ।"
    },
    bho: {
        lang: "भोजपुरी", products: "उत्पाद", sitemap: "साइटमैप", careers: "करियर", coming_soon: "जल्द", built_by: "द्वारा बनावल",
        title: "आधिकारिक एप्लीकेशन डाउनलोड", subtitle: "मोविरा द्वारा सुरक्षित नागरिक मंच", 
        version: "संस्करण", size: "आकार", checksum: "सुरक्षा चेकसम", download: "एप्लीकेशन डाउनलोड करीं", 
        guideTitle: "स्थापना गाइड", 
        step1: "फ़ाइल के अपना फोन में सहेजे खातिर डाउनलोड बटन पर क्लिक करीं।", 
        step2: "अपन डाउनलोड फ़ोल्डर खोलीं आ डाउनलोड कइल गइल फ़ाइल पर टैप करीं।", 
        step3: "अगर कवनो सुरक्षा चेतावनी लउकत बा, त 'फिर भी डाउनलोड करीं' पर क्लिक करीं। सीधा डाउनलोड खातिर ई सामान्य बा।", 
        step4: "स्थापना पूरा करीं आ नागरिकसेतु खोलीं।"
    },
    ar: {
        lang: "العربية", products: "المنتجات", sitemap: "خريطة الموقع", careers: "وظائف", coming_soon: "قريباً", built_by: "بواسطة",
        title: "تحميل التطبيق الرسمي", subtitle: "منصة مدنية آمنة بواسطة موفيرا", 
        version: "الإصدار", size: "الحجم", checksum: "المجموع الاختباري للأمان", download: "تحميل التطبيق", 
        guideTitle: "دليل التثبيت", 
        step1: "انقر فوق زر التنزيل لحفظ الملف على هاتفك.", 
        step2: "افتح مجلد التنزيلات واضغط على الملف الذي تم تنزيله.", 
        step3: "إذا ظهر تحذير أمني، فانقر على 'تنزيل على أي حال'. هذا أمر طبيعي للتنزيلات المباشرة.", 
        step4: "أكمل التثبيت وافتح ناغريك سيتو."
    },
    es: {
        lang: "Español", products: "Productos", sitemap: "Mapa del sitio", careers: "Carreras", coming_soon: "Pronto", built_by: "Por",
        title: "Descarga de Aplicación Oficial", subtitle: "Plataforma cívica segura por Movyra", 
        version: "Versión", size: "Tamaño", checksum: "Suma de comprobación", download: "Descargar Aplicación", 
        guideTitle: "Guía de Instalación", 
        step1: "Haga clic en descargar para guardar el archivo.", 
        step2: "Abra sus descargas y toque el archivo.", 
        step3: "Si hay advertencia, toque 'Descargar de todos modos'.", 
        step4: "Complete la instalación y abra NagrikSetu."
    },
    fr: {
        lang: "Français", products: "Produits", sitemap: "Plan du site", careers: "Carrières", coming_soon: "Bientôt", built_by: "Par",
        title: "Téléchargement Officiel", subtitle: "Plateforme civique sécurisée par Movyra", 
        version: "Version", size: "Taille", checksum: "Somme de contrôle", download: "Télécharger l'App", 
        guideTitle: "Guide d'Installation", 
        step1: "Cliquez sur télécharger pour enregistrer le fichier.", 
        step2: "Ouvrez vos téléchargements et touchez le fichier.", 
        step3: "Si un avertissement apparaît, cliquez sur 'Télécharger quand même'.", 
        step4: "Terminez l'installation et ouvrez NagrikSetu."
    },
    de: {
        lang: "Deutsch", products: "Produkte", sitemap: "Sitemap", careers: "Karriere", coming_soon: "Demnächst", built_by: "Von",
        title: "Offizieller App-Download", subtitle: "Sichere Bürgerplattform von Movyra", 
        version: "Version", size: "Größe", checksum: "Sicherheitsprüfsumme", download: "App Herunterladen", 
        guideTitle: "Installationsanleitung", 
        step1: "Klicken Sie auf Herunterladen, um die Datei zu speichern.", 
        step2: "Öffnen Sie Ihre Downloads und tippen Sie auf die Datei.", 
        step3: "Bei einer Warnung klicken Sie auf 'Trotzdem herunterladen'.", 
        step4: "Schließen Sie die Installation ab und öffnen Sie NagrikSetu."
    }
};

export default function DownloadPage() {
    const navigate = useNavigate();
    const scrollRef = useRef(null);
    const [lang, setLang] = useState('en');
    const [showLangPrompt, setShowLangPrompt] = useState(false);
    const [showProductsPrompt, setShowProductsPrompt] = useState(false);
    const [showSitemapPrompt, setShowSitemapPrompt] = useState(false);

    // APPLICATION METADATA - Strictly update these values when you release a new APK
    const APP_VERSION = "1.0.0";
    const APP_SIZE = "1.94 MB";
    const GITHUB_APK_LINK = "https://github.com/movyra/movyra/releases/download/v1.0.0/NagrikSetu-v1.0.0.apk";
    const SHA_256_HASH = "26:FF:38:91:93:D8:6A:2D:21:1D:77:10:17:C4:60:4D:4B:3F:C9:2F:10:C2:2A:D0:09:60:8B:05:CC:C7:A3:4D";

    // STRICT COLOR VARIABLES (NagrikSetu Brand)
    const theme = {
        primary: "#00897B",    // Civic Teal
        bg: "#00897B",         // Main Background
        text: "#FFFFFF",       // White text for Teal background
        accent: "#FFB300",     // Action Yellow
    };

    const currentT = TRANSLATIONS[lang] || TRANSLATIONS['en'];

    const languageOptions = [
        { code: 'en', label: 'English' }, { code: 'hi', label: 'हिन्दी' }, { code: 'hinglish', label: 'Hinglish' },
        { code: 'mr', label: 'मराठी' }, { code: 'gu', label: 'ગુજરાતી' }, { code: 'te', label: 'తెలుగు' },
        { code: 'ta', label: 'தமிழ்' }, { code: 'pa', label: 'ਪੰਜਾਬੀ' }, { code: 'bho', label: 'भोजपुरी' },
        { code: 'ar', label: 'العربية' }, { code: 'es', label: 'Español' }, { code: 'fr', label: 'Français' },
        { code: 'de', label: 'Deutsch' }
    ];

    useEffect(() => {
        const sysLang = navigator.language.slice(0, 2);
        if (TRANSLATIONS[sysLang]) setLang(sysLang);
    }, []);

    const scrollToTop = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const fadeUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

    return (
        // ABSOLUTE BREAKOUT: fixed inset-0 w-screen h-[100dvh] ensures zero black borders and respects mobile address bar
        <div ref={scrollRef} className="fixed inset-0 w-screen h-[100dvh] z-[9999] overflow-y-auto overflow-x-hidden font-sans flex flex-col" style={{ backgroundColor: theme.bg, color: theme.text }}>
            
            <style>
                {`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade { animation: fadeIn 0.8s ease-out forwards; }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                `}
            </style>

            {/* MINIMAL TOP HEADER */}
            <header className="w-full flex items-center justify-between px-6 md:px-12 lg:px-24 py-8 animate-fade relative z-50">
                <div className="flex items-center gap-0.3 cursor-pointer" onClick={() => navigate('/landing')}>
                    <img 
                        src="/logo-2.png" 
                        alt="Movyra Logo" 
                        className="h-8 w-auto mr-[1px]" 
                        onError={(e) => { e.target.style.display = 'none' }} 
                    />
                    <span className="font-black text-[1.5rem] tracking-tighter text-[#FFFFFF]">
                        ovyra <span className="font-medium text-[1rem] ml-1 opacity-90">NagrikSetu</span>
                    </span>
                </div>
                
                <div className="flex items-center gap-4 sm:gap-6 text-[0.95rem] font-bold">
                    <button onClick={() => setShowLangPrompt(true)} className="flex items-center gap-2 text-[#FFFFFF] hover:opacity-70 transition-opacity outline-none">
                        <Globe size={16} /> <span className="hidden sm:inline">{currentT.lang}</span>
                    </button>
                    <button onClick={() => setShowProductsPrompt(true)} className="hidden md:block text-[#FFFFFF] hover:opacity-70 transition-opacity outline-none">
                        {currentT.products}
                    </button>
                </div>
            </header>

            {/* MAIN CONTENT AREA - Strictly Left Aligned & Edge-to-Edge Desktop Wide */}
            <main className="w-full max-w-none px-6 md:px-12 lg:px-24 pt-8 pb-24 mb-12 flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10 flex-1">
                
                {/* Left Content - STRICTLY Left Aligned (items-start text-left) */}
                <motion.div initial="hidden" animate="visible" variants={fadeUp} className="w-full lg:w-[50%] xl:w-[45%] z-10 flex flex-col items-start justify-center text-left">
                    
                    {/* Badge 
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/40 mb-8 bg-white/10">
                        <ShieldCheck size={16} color="#FFFFFF" />
                        <span className="text-[0.75rem] font-bold tracking-widest uppercase text-[#FFFFFF]">{currentT.badge}</span>
                    </div>*/}

                    {/* Massive Title */}
                    <h1 className="text-[3.5rem] md:text-[4.5rem] lg:text-[5.5rem] font-black leading-[1.1] tracking-tighter mb-4 text-[#FFFFFF]">
                        {currentT.title.split(' ').map((word, i) => (
                            <React.Fragment key={i}>{word}{i % 2 !== 0 ? <br/> : ' '}</React.Fragment>
                        ))}
                    </h1>
                    
                    {/* Subtitle */}
                    <p className="text-[1.1rem] md:text-[1.3rem] text-[#FFFFFF] font-medium leading-[1.6] mb-8 opacity-90">
                        {currentT.subtitle}
                    </p>

                    {/* Technical Metadata Box */}
                    <div className="w-full max-w-[500px] bg-white/10 border border-white/20 rounded-2xl p-6 mb-8 backdrop-blur-sm">
                        <div className="flex justify-between items-center mb-4 text-[0.95rem] font-bold text-[#FFFFFF]">
                            <div className="flex items-center gap-2"><HardDrive size={16} /> <span>{currentT.size}: {APP_SIZE}</span></div>
                            <div className="flex items-center gap-2"><Activity size={16} /> <span>{currentT.version}: {APP_VERSION}</span></div>
                        </div>
                        <div className="bg-black/20 p-4 rounded-xl">
                            <span className="text-[#FFFFFF] text-[0.85rem] font-bold mb-2 flex items-center gap-2"><Hash size={14} /> {currentT.checksum}</span>
                            <code className="text-[#FFB300] text-[0.75rem] break-all block leading-relaxed">{SHA_256_HASH}</code>
                        </div>
                    </div>
                    
                    {/* CTA Button */}
                    <a 
                        href={GITHUB_APK_LINK}
                        style={{ backgroundColor: theme.accent, color: "#111111" }}
                        className="w-full sm:w-auto px-12 py-5 rounded-xl font-black text-[1.2rem] transition-transform hover:scale-105 outline-none shadow-xl mb-12 flex items-center justify-center gap-3"
                    >
                        {currentT.download} <DownloadCloud size={24} />
                    </a>

                    {/* Installation Guide */}
                    <div className="w-full max-w-[500px]">
                        <h2 className="text-[1.4rem] font-black tracking-tight mb-6 text-[#FFFFFF]">{currentT.guideTitle}</h2>
                        
                        <div className="flex flex-col gap-5">
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center font-bold text-[#FFFFFF] flex-shrink-0 text-[0.9rem]">1</div>
                                <p className="text-[#FFFFFF] opacity-90 text-[0.95rem] leading-relaxed pt-1">{currentT.step1}</p>
                            </div>
                            
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center font-bold text-[#FFFFFF] flex-shrink-0 text-[0.9rem]">2</div>
                                <p className="text-[#FFFFFF] opacity-90 text-[0.95rem] leading-relaxed pt-1">{currentT.step2}</p>
                            </div>

                            <div className="flex items-start gap-4 bg-[#FFB300]/10 p-4 rounded-xl border-l-4 border-[#FFB300]">
                                <div className="w-8 h-8 rounded-full bg-[#FFB300] flex items-center justify-center font-black text-[#111111] flex-shrink-0 text-[0.9rem]">3</div>
                                <p className="text-[#FFFFFF] font-bold text-[0.95rem] leading-relaxed pt-1">{currentT.step3}</p>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-[#FFFFFF] flex items-center justify-center font-black text-[#00897B] flex-shrink-0 text-[0.9rem]">4</div>
                                <p className="text-[#FFFFFF] font-bold text-[0.95rem] leading-relaxed pt-1">{currentT.step4}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right Graphic - Custom Landscape SVG Animation (Mountains, Water, Birds, Secure Cloud) */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.2 }} className="w-full lg:w-[50%] h-[500px] lg:h-[750px] relative z-0 flex items-center justify-center lg:justify-end xl:pr-12">
                    <svg viewBox="0 0 600 600" className="w-full h-full max-w-[750px] drop-shadow-2xl" fill="none">
                        
                        {/* Sun / Halo */}
                        <motion.circle 
                            cx="300" cy="180" r="90" 
                            fill="rgba(255,179,0,0.1)" 
                            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.8, 0.3] }} 
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} 
                        />
                        <circle cx="300" cy="180" r="45" fill={theme.accent} />
                        
                        {/* Majestic Background Mountains */}
                        <path d="M 0 450 L 150 220 L 300 450 Z" fill="rgba(255,255,255,0.05)" />
                        <path d="M 150 450 L 350 150 L 550 450 Z" fill="rgba(255,255,255,0.08)" />
                        <path d="M 350 450 L 480 250 L 600 450 Z" fill="rgba(255,255,255,0.05)" />

                        {/* Foreground Mountains / Terrain */}
                        <path d="M -50 480 Q 150 350 350 480 T 650 480 L 650 600 L -50 600 Z" fill="rgba(255,255,255,0.12)" />
                        <path d="M -50 520 Q 200 420 400 520 T 650 520 L 650 600 L -50 600 Z" fill="rgba(255,255,255,0.18)" />

                        {/* Animated Flowing Water at the base */}
                        <motion.path 
                            d="M 0 540 C 150 510 300 570 600 540 L 600 600 L 0 600 Z" 
                            fill="rgba(255,255,255,0.25)" 
                            animate={{ d: ["M 0 540 C 150 510 300 570 600 540 L 600 600 L 0 600 Z", "M 0 540 C 150 570 300 510 600 540 L 600 600 L 0 600 Z", "M 0 540 C 150 510 300 570 600 540 L 600 600 L 0 600 Z"] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.path 
                            d="M 0 570 C 200 540 400 600 600 570 L 600 600 L 0 600 Z" 
                            fill="rgba(255,255,255,0.35)" 
                            animate={{ d: ["M 0 570 C 200 540 400 600 600 570 L 600 600 L 0 600 Z", "M 0 570 C 200 600 400 540 600 570 L 600 600 L 0 600 Z", "M 0 570 C 200 540 400 600 600 570 L 600 600 L 0 600 Z"] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        />

                        {/* Animated Flying Birds */}
                        <motion.path 
                            d="M 100 200 Q 115 185 130 200 Q 115 215 100 200" 
                            stroke="#FFFFFF" strokeWidth="2.5" fill="none" strokeLinecap="round"
                            animate={{ x: [0, 200, 400], y: [0, -50, -20], opacity: [0, 1, 0] }} 
                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }} 
                        />
                        <motion.path 
                            d="M 150 160 Q 160 150 170 160 Q 160 170 150 160" 
                            stroke="#FFFFFF" strokeWidth="2" fill="none" strokeLinecap="round"
                            animate={{ x: [0, 250, 500], y: [0, -30, -10], opacity: [0, 0.8, 0] }} 
                            transition={{ duration: 18, repeat: Infinity, delay: 3, ease: "linear" }} 
                        />

                        {/* Central Secure Download Hologram */}
                        <motion.g 
                            animate={{ y: [0, -15, 0] }} 
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        >
                            {/* Glowing Backplate */}
                            <circle cx="300" cy="350" r="70" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeDasharray="8 8" />
                            <circle cx="300" cy="350" r="55" fill="rgba(255,255,255,0.9)" shadow="0 10px 30px rgba(0,0,0,0.2)" />
                            
                            {/* Inner Download Arrow */}
                            <path d="M 300 320 L 300 365 M 280 345 L 300 365 L 320 345 M 280 375 L 320 375" stroke={theme.primary} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                        </motion.g>

                        {/* Connection Lines from App to Terrain */}
                        <path d="M 300 420 L 300 500" stroke="rgba(255,255,255,0.3)" strokeWidth="3" strokeDasharray="6 6" />
                        <circle cx="300" cy="500" r="5" fill="#FFFFFF" />
                    </svg>
                </motion.div>
            </main>

            {/* LANGUAGE SELECTOR MODAL */}
            <AnimatePresence>
                {showLangPrompt && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-[400px] bg-[#FFFFFF] rounded-3xl p-8 flex flex-col shadow-2xl relative max-h-[80vh] overflow-y-auto border border-[#E0E0E0] hide-scrollbar">
                            <button onClick={() => setShowLangPrompt(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[#111111] hover:bg-[#F5F5F5] rounded-full transition-colors outline-none"><X size={18} /></button>
                            <div className="w-12 h-12 mx-auto rounded-full border border-[#E0E0E0] flex items-center justify-center mb-4"><Globe size={24} color="#111111" strokeWidth="1.5" /></div>
                            <h2 className="text-[1.4rem] font-black tracking-tight mb-6 text-[#111111] text-center mt-4">{currentT.select_lang}</h2>
                            <div className="flex flex-col gap-2 mt-4">
                                {languageOptions.map((option) => (
                                    <button key={option.code} onClick={() => { setLang(option.code); setShowLangPrompt(false); }} className={`w-full p-4 rounded-xl flex items-center justify-between group transition-colors outline-none ${lang === option.code ? 'bg-[#00897B] text-white border border-[#00897B]' : 'bg-[#F9FAFB] text-[#111111] border border-[#E0E0E0] hover:border-[#00897B]'}`}>
                                        <span className="font-bold text-[1rem]">{option.label}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* STRICT PRODUCTS ECOSYSTEM MODAL LINKING */}
            <AnimatePresence>
                {showProductsPrompt && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-[500px] bg-[#FFFFFF] rounded-3xl p-10 flex flex-col shadow-2xl relative border border-[#E0E0E0] max-h-[90vh] overflow-y-auto hide-scrollbar">
                            <button onClick={() => setShowProductsPrompt(false)} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center text-[#888888] hover:bg-[#F5F5F5] hover:text-[#111111] rounded-full transition-colors outline-none"><X size={18} /></button>
                            
                            <h2 className="text-[1.8rem] font-black tracking-tight mb-2 text-[#111111] text-center mt-2">Also from us</h2>
                            <p className="text-[#666666] text-[0.95rem] text-center mb-8">Discover our connected platforms.</p>

                            <div className="flex flex-col gap-4">
                                {/* Movyra Sahay */}
                                <a href="https://rebrand.ly/mvsahay" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center justify-center gap-2 bg-[#F9FAFB] border border-[#E0E0E0] p-6 rounded-2xl hover:border-[#CCCCCC] hover:shadow-sm transition-all text-center w-full outline-none">
                                    <div className="flex items-center gap-0.3">
                                        <img src="/logo-4.png" alt="Movyra" className="h-7 w-auto" onError={(e) => { e.target.style.display = 'none' }} />
                                        <span className="font-black text-[1.4rem] tracking-tighter text-[#111111]">
                                            ovyra <span className="font-medium text-[1.1rem] text-[#666666] ml-1">Sahay</span>
                                        </span>
                                    </div>
                                    <p className="text-[#666666] text-[0.85rem] leading-relaxed mt-1">Humanitarian rescue network.</p>
                                </a>

                                {/* Movyra Civic */}
                                <a href="https://rebrand.ly/mvcivic" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center justify-center gap-2 bg-[#F9FAFB] border border-[#E0E0E0] p-6 rounded-2xl hover:border-[#CCCCCC] hover:shadow-sm transition-all text-center w-full outline-none">
                                    <div className="flex items-center gap-0.3">
                                        <img src="/logo-3.png" alt="Movyra" className="h-7 w-auto" onError={(e) => { e.target.style.display = 'none' }} />
                                        <span className="font-black text-[1.4rem] tracking-tighter text-[#111111]">
                                            ovyra <span className="font-medium text-[1.1rem] text-[#666666] ml-1">Civic</span>
                                        </span>
                                    </div>
                                    <p className="text-[#666666] text-[0.85rem] leading-relaxed mt-1">Smart city management platform.</p>
                                </a>

                                {/* Movyra NagrikSetu */}
                                <Link to="https://rebrand.ly/mnagriksetu" className="group flex flex-col items-center justify-center gap-2 bg-[#E0F2F1] border-2 border-[#00897B] p-6 rounded-2xl transition-all text-center w-full outline-none">
                                    <div className="flex items-center gap-0.3">
                                        <img src="/logo-6.png" alt="Movyra" className="h-7 w-auto" onError={(e) => { e.target.style.display = 'none' }} />
                                        <span className="font-black text-[1.4rem] tracking-tighter text-[#00897B]">
                                            ovyra <span className="font-bold text-[1.1rem] ml-1">NagrikSetu</span>
                                        </span>
                                    </div>
                                    <p className="text-[#00897B] text-[0.85rem] leading-relaxed mt-1 font-medium">Citizen grievance & reporting.</p>
                                </Link>

                                {/* Movyra SevaSetu */}
                                <button onClick={() => alert("Movyra SevaSetu is Coming Soon!")} className="group flex flex-col items-center justify-center gap-2 bg-[#FFFFFF] border border-[#E0E0E0] p-6 rounded-2xl opacity-70 hover:bg-[#F5F5F5] transition-all text-center w-full outline-none relative cursor-pointer">
                                    <div className="flex items-center gap-0.3">
                                        <img src="/logo-7.png" alt="Movyra" className="h-7 w-auto" onError={(e) => { e.target.style.display = 'none' }} />
                                        <span className="font-black text-[1.4rem] tracking-tighter text-[#111111]">
                                            ovyra <span className="font-medium text-[1.1rem] text-[#666666] ml-1">SevaSetu</span>
                                        </span>
                                    </div>
                                    <span className="absolute top-3 right-3 text-[0.65rem] font-bold px-2 py-1 bg-[#F5F5F5] text-[#111111] rounded-full uppercase tracking-wider">Coming Soon</span>
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SITEMAP MODAL */}
            <AnimatePresence>
                {showSitemapPrompt && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-[500px] bg-[#FFFFFF] rounded-3xl p-10 flex flex-col shadow-2xl relative border border-[#E0E0E0]">
                            <button onClick={() => setShowSitemapPrompt(false)} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center text-[#888888] hover:bg-[#F5F5F5] hover:text-[#111111] rounded-full transition-colors outline-none"><X size={18} /></button>
                            
                            <h2 className="text-[1.8rem] font-black tracking-tight mb-2 text-[#111111] text-left">{currentT.sitemap}</h2>
                            <p className="text-[#666666] text-[0.95rem] text-left mb-8">Direct navigation to all nagriksetu pages.</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                                <Link to="/home" className="bg-[#F9FAFB] border border-[#E0E0E0] p-4 rounded-xl font-bold text-[#111111] text-[0.95rem] hover:border-[#CCCCCC] hover:bg-[#F0F0F0] transition-colors text-left outline-none">
                                    Public Portal
                                </Link>
                                <Link to="/report" className="bg-[#F9FAFB] border border-[#E0E0E0] p-4 rounded-xl font-bold text-[#111111] text-[0.95rem] hover:border-[#CCCCCC] hover:bg-[#F0F0F0] transition-colors text-left outline-none">
                                    File a Report
                                </Link>
                                <Link to="/alerts" className="bg-[#F9FAFB] border border-[#E0E0E0] p-4 rounded-xl font-bold text-[#111111] text-[0.95rem] hover:border-[#CCCCCC] hover:bg-[#F0F0F0] transition-colors text-left outline-none">
                                    Live Transparency Map
                                </Link>
                                <Link to="/admin" className="bg-[#F9FAFB] border border-[#E0E0E0] p-4 rounded-xl font-bold text-[#111111] text-[0.95rem] hover:border-[#CCCCCC] hover:bg-[#F0F0F0] transition-colors text-left outline-none">
                                    Admin Console
                                </Link>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* TEAL & WHITE PREMIUM FOOTER STRICTLY (Responsive fix: flex-wrap, pb-12 for mobile) */}
            <footer className="w-full mt-auto bg-[#007065] flex flex-col md:flex-row items-center justify-between gap-6 px-6 md:px-12 lg:px-24 py-8 pb-12 border-t border-white/10 relative z-10">
                
                {/* Left Side: Language & Socials */}
                <div className="flex flex-wrap justify-center items-center gap-6">
                    <button onClick={() => setShowLangPrompt(true)} className="flex items-center gap-2 text-[#FFFFFF] font-bold text-[0.9rem] px-5 py-2.5 rounded-full border border-white/30 hover:bg-white/10 transition-colors outline-none">
                        <Globe size={16} /> <span className="hidden sm:inline">{currentT.lang}</span>
                    </button>
                    
                    <div className="flex items-center gap-5 text-[#FFFFFF]">
                        {/* Inline SVGs used to guarantee rendering without library crash */}
                        <a href="https://www.linkedin.com/company/getmovyra/" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity outline-none">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        </a>
                        <a href="#" className="hover:opacity-70 transition-opacity outline-none">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
                        </a>
                        <a href="https://instagram.com/nagriksetu.app" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity outline-none">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                        </a>
                        <a href="#" className="hover:opacity-70 transition-opacity outline-none">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.006 4.15H5.078z"/></svg>
                        </a>
                    </div>
                </div>

                {/* Right Side: Links & Built By */}
                <div className="flex flex-wrap justify-center items-center gap-4 text-[0.85rem] font-bold text-[#FFFFFF]">
                    <button onClick={() => setShowProductsPrompt(true)} className="hover:opacity-70 transition-opacity outline-none uppercase">{currentT.products}</button>
                    <span className="w-1.5 h-1.5 bg-[#FFFFFF] opacity-50 rounded-full"></span>
                    <button onClick={() => setShowSitemapPrompt(true)} className="hover:opacity-70 transition-opacity outline-none uppercase">{currentT.sitemap}</button>
                    <span className="w-1.5 h-1.5 bg-[#FFFFFF] opacity-50 rounded-full"></span>
                    <a href="https://getmovyra.in/careers" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity outline-none uppercase">{currentT.careers}</a>
                    <span className="w-1.5 h-1.5 bg-[#FFFFFF] opacity-50 rounded-full"></span>
                    
                    <div className="flex items-center gap-0.5 uppercase tracking-wider opacity-90">
                        {currentT.built_by} 
                        <a href="https://rebrand.ly/aatns" target="_blank" rel="noopener noreferrer" className="ml-1 hover:opacity-80 transition-opacity outline-none">
                            <img src="/aat.png" alt="AnyAstro" className="h-4 w-auto object-contain" onError={(e) => { e.target.style.display = 'none'; e.target.insertAdjacentHTML('afterend', '<span class="underline text-[#FFFFFF]">AnyAstro</span>'); }} />
                        </a>
                    </div>

                    <button onClick={scrollToTop} className="ml-2 p-2.5 rounded-full border border-white/30 text-[#FFFFFF] hover:bg-white/10 transition-colors outline-none flex items-center justify-center">
                        <ArrowUp size={16} />
                    </button>
                </div>
            </footer>
        </div>
    );
}