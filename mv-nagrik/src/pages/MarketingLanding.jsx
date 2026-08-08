/**
 * SYSTEM DOCUMENTATION / 15-LANGUAGE TRANSLATION
 * Context: Minimal Official Marketing Landing Page for NagrikSetu.
 * Brand: Movyra Civic (NagrikSetu)
 * Design: Exact match to custom mockups (Left-aligned hero, custom graphic, premium teal/white footer, interactive modals)
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
import { X, ArrowRight, ArrowUp, Globe, ShieldCheck, MapPin, Activity, Bell } from 'lucide-react';

const TRANSLATIONS = {
    en: {
        lang: "English", products: "Products", sitemap: "Sitemap", careers: "Careers", coming_soon: "Coming Soon",
        badge: "Smart Civic Platform",
        main_title: "Your City.\nConnected.",
        main_sub: "Report. Track. Resolve.",
        cta_btn: "Download App",
        val1_title: "Report", val1_sub: "Log civic issues.",
        val2_title: "Track", val2_sub: "Real-time status.",
        val3_title: "Alerts", val3_sub: "Official updates.",
        val4_title: "Secure", val4_sub: "Gov-grade data.",
        select_lang: "Select Language", built_by: "Built by"
    },
    hi: {
        lang: "हिन्दी", products: "उत्पाद", sitemap: "साइटमैप", careers: "करियर", coming_soon: "जल्द आ रहा है",
        badge: "स्मार्ट नागरिक मंच",
        main_title: "आपका शहर।\nजुड़ा हुआ।",
        main_sub: "रिपोर्ट करें। ट्रैक करें। समाधान करें।",
        cta_btn: "ऐप डाउनलोड करें",
        val1_title: "रिपोर्ट", val1_sub: "नागरिक समस्याएं दर्ज करें।",
        val2_title: "ट्रैक", val2_sub: "वास्तविक समय की स्थिति।",
        val3_title: "अलर्ट", val3_sub: "आधिकारिक अपडेट।",
        val4_title: "सुरक्षित", val4_sub: "सरकारी स्तर का डेटा।",
        select_lang: "भाषा चुनें", built_by: "निर्मित"
    },
    hinglish: {
        lang: "Hinglish", products: "Products", sitemap: "Sitemap", careers: "Careers", coming_soon: "Coming Soon",
        badge: "Smart Civic Platform",
        main_title: "Aapka City.\nConnected.",
        main_sub: "Report. Track. Resolve.",
        cta_btn: "App Download Karein",
        val1_title: "Report", val1_sub: "Civic issues log karein.",
        val2_title: "Track", val2_sub: "Real-time status.",
        val3_title: "Alerts", val3_sub: "Official updates.",
        val4_title: "Secure", val4_sub: "Gov-grade data.",
        select_lang: "Language Select Karein", built_by: "Built by"
    },
    mr: {
        lang: "मराठी", products: "उत्पादने", sitemap: "साइटमॅप", careers: "करिअर", coming_soon: "लवकरच येत आहे",
        badge: "स्मार्ट नागरी व्यासपीठ",
        main_title: "तुमचे शहर.\nजोडलेले.",
        main_sub: "तक्रार. ट्रॅक. निराकरण.",
        cta_btn: "ॲप डाउनलोड करा",
        val1_title: "तक्रार", val1_sub: "नागरी समस्या नोंदवा.",
        val2_title: "ट्रॅक", val2_sub: "रिअल-टाइम स्थिती.",
        val3_title: "अलर्ट", val3_sub: "अधिकृत अपडेट्स.",
        val4_title: "सुरक्षित", val4_sub: "सरकारी दर्जाचा डेटा.",
        select_lang: "भाषा निवडा", built_by: "निर्मित"
    },
    gu: {
        lang: "ગુજરાતી", products: "ઉત્પાદનો", sitemap: "સાઇટમેપ", careers: "કારકિર્દી", coming_soon: "ટૂંક સમયમાં",
        badge: "સ્માર્ટ નાગરિક પ્લેટફોર્મ",
        main_title: "તમારું શહેર.\nજોડાયેલ.",
        main_sub: "રિપોર્ટ. ટ્રૅક. ઉકેલ.",
        cta_btn: "એપ્લિકેશન ડાઉનલોડ",
        val1_title: "રિપોર્ટ", val1_sub: "નાગરિક સમસ્યાઓ નોંધો.",
        val2_title: "ટ્રૅક", val2_sub: "રિયલ-ટાઇમ સ્થિતિ.",
        val3_title: "એલર્ટ", val3_sub: "સત્તાવાર અપડેટ્સ.",
        val4_title: "સુરક્ષિત", val4_sub: "સરકારી સ્તરનો ડેટા.",
        select_lang: "ભાષા પસંદ કરો", built_by: "દ્વારા"
    },
    te: {
        lang: "తెలుగు", products: "ఉత్పత్తులు", sitemap: "సైట్‌మ్యాప్", careers: "కెరీర్స్", coming_soon: "త్వరలో",
        badge: "స్మార్ట్ ప్లాట్‌ఫారమ్",
        main_title: "మీ నగరం.\nకనెక్ట్ చేయబడింది.",
        main_sub: "నివేదిక. ట్రాక్. పరిష్కారం.",
        cta_btn: "యాప్ డౌన్‌లోడ్",
        val1_title: "నివేదిక", val1_sub: "పౌర సమస్యలను లాగ్ చేయండి.",
        val2_title: "ట్రాక్", val2_sub: "రియల్ టైమ్ స్థితి.",
        val3_title: "అలర్ట్స్", val3_sub: "అధికారిక నవీకరణలు.",
        val4_title: "సురక్షితం", val4_sub: "ప్రభుత్వ స్థాయి డేటా.",
        select_lang: "భాష ఎంచుకోండి", built_by: "నిర్మించినవారు"
    },
    ta: {
        lang: "தமிழ்", products: "தயாரிப்புகள்", sitemap: "தளவரைபடம்", careers: "தொழில்கள்", coming_soon: "விரைவில்",
        badge: "ஸ்மார்ட் தளம்",
        main_title: "உங்கள் நகரம்.\nஇணைக்கப்பட்டது.",
        main_sub: "அறிக்கை. கண்காணிப்பு. தீர்வு.",
        cta_btn: "செயலியை பதிவிறக்கு",
        val1_title: "அறிக்கை", val1_sub: "குடிமக்கள் பிரச்சனைகளை பதிவு செய்.",
        val2_title: "கண்காணி", val2_sub: "நிகழ்நேர நிலை.",
        val3_title: "எச்சரிக்கைகள்", val3_sub: "அதிகாரப்பூர்வ புதுப்பிப்புகள்.",
        val4_title: "பாதுகாப்பு", val4_sub: "அரசு தரவு.",
        select_lang: "மொழியைத் தேர்ந்தெடு", built_by: "உருவாக்கியவர்"
    },
    pa: {
        lang: "ਪੰਜਾਬੀ", products: "ਉਤਪਾਦ", sitemap: "ਸਾਈਟਮੈਪ", careers: "ਕਰੀਅਰ", coming_soon: "ਜਲਦੀ",
        badge: "ਸਮਾਰਟ ਪਲੇਟਫਾਰਮ",
        main_title: "ਤੁਹਾਡਾ ਸ਼ਹਿਰ.\nਜੁੜਿਆ ਹੋਇਆ।",
        main_sub: "ਰਿਪੋਰਟ. ਟਰੈਕ. ਹੱਲ।",
        cta_btn: "ਐਪ ਡਾਊਨਲੋਡ ਕਰੋ",
        val1_title: "ਰਿਪੋਰਟ", val1_sub: "ਨਾਗਰਿਕ ਸਮੱਸਿਆਵਾਂ ਦਰਜ ਕਰੋ।",
        val2_title: "ਟਰੈਕ", val2_sub: "ਰੀਅਲ-ਟਾਈਮ ਸਥਿਤੀ।",
        val3_title: "ਅਲਰਟ", val3_sub: "ਅਧਿਕਾਰਤ ਅੱਪਡੇਟ।",
        val4_title: "ਸੁਰੱਖਿਅਤ", val4_sub: "ਸਰਕਾਰੀ-ਗਰੇਡ ਡਾਟਾ।",
        select_lang: "ਭਾਸ਼ਾ ਚੁਣੋ", built_by: "ਦੁਆਰਾ ਬਣਾਇਆ"
    },
    bho: {
        lang: "भोजपुरी", products: "उत्पाद", sitemap: "साइटमैप", careers: "करियर", coming_soon: "जल्द",
        badge: "स्मार्ट मंच",
        main_title: "राउर शहर।\nजुडल बा।",
        main_sub: "रिपोर्ट। ट्रैक। समाधान।",
        cta_btn: "ऐप डाउनलोड",
        val1_title: "रिपोर्ट", val1_sub: "नागरिक समस्या दर्ज करीं।",
        val2_title: "ट्रैक", val2_sub: "रियल-टाइम स्थिति।",
        val3_title: "अलर्ट", val3_sub: "आधिकारिक अपडेट।",
        val4_title: "सुरक्षित", val4_sub: "सरकारी स्तर के डेटा।",
        select_lang: "भाषा चुनीं", built_by: "द्वारा बनावल"
    },
    ar: {
        lang: "العربية", products: "المنتجات", sitemap: "خريطة الموقع", careers: "وظائف", coming_soon: "قريباً",
        badge: "منصة ذكية",
        main_title: "مدينتك.\nمتصلة.",
        main_sub: "إبلاغ. تتبع. حل.",
        cta_btn: "تحميل التطبيق",
        val1_title: "إبلاغ", val1_sub: "تسجيل المشاكل المدنية.",
        val2_title: "تتبع", val2_sub: "الحالة في الوقت الحقيقي.",
        val3_title: "تنبيهات", val3_sub: "تحديثات رسمية.",
        val4_title: "آمن", val4_sub: "بيانات حكومية.",
        select_lang: "اختر اللغة", built_by: "بواسطة"
    },
    es: {
        lang: "Español", products: "Productos", sitemap: "Mapa del sitio", careers: "Carreras", coming_soon: "Pronto",
        badge: "Plataforma Inteligente",
        main_title: "Tu Ciudad.\nConectada.",
        main_sub: "Reporta. Rastrea. Resuelve.",
        cta_btn: "Descargar App",
        val1_title: "Reportar", val1_sub: "Registra problemas cívicos.",
        val2_title: "Rastrear", val2_sub: "Estado en tiempo real.",
        val3_title: "Alertas", val3_sub: "Actualizaciones oficiales.",
        val4_title: "Seguro", val4_sub: "Datos oficiales.",
        select_lang: "Idioma", built_by: "Por"
    },
    fr: {
        lang: "Français", products: "Produits", sitemap: "Plan du site", careers: "Carrières", coming_soon: "Bientôt",
        badge: "Plateforme Intelligente",
        main_title: "Votre Ville.\nConnectée.",
        main_sub: "Signalez. Suivez. Résolvez.",
        cta_btn: "Télécharger l'App",
        val1_title: "Signaler", val1_sub: "Signalez les problèmes locaux.",
        val2_title: "Suivre", val2_sub: "Statut en temps réel.",
        val3_title: "Alertes", val3_sub: "Mises à jour officielles.",
        val4_title: "Sécurisé", val4_sub: "Données gouvernementales.",
        select_lang: "Langue", built_by: "Par"
    },
    de: {
        lang: "Deutsch", products: "Produkte", sitemap: "Sitemap", careers: "Karriere", coming_soon: "Demnächst",
        badge: "Intelligente Plattform",
        main_title: "Ihre Stadt.\nVerbunden.",
        main_sub: "Melden. Verfolgen. Lösen.",
        cta_btn: "App Herunterladen",
        val1_title: "Melden", val1_sub: "Probleme erfassen.",
        val2_title: "Verfolgen", val2_sub: "Echtzeit-Status.",
        val3_title: "Warnungen", val3_sub: "Offizielle Updates.",
        val4_title: "Sicher", val4_sub: "Regierungsdaten.",
        select_lang: "Sprache", built_by: "Von"
    }
};

export default function MarketingLanding() {
    const navigate = useNavigate();
    const scrollRef = useRef(null);
    const [lang, setLang] = useState('en');
    const [showLangPrompt, setShowLangPrompt] = useState(false);
    const [showProductsPrompt, setShowProductsPrompt] = useState(false);
    const [showSitemapPrompt, setShowSitemapPrompt] = useState(false);

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

    const handleDownloadRedirect = () => {
        navigate('/download');
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
                <div className="flex items-center gap-0.3 cursor-pointer" onClick={scrollToTop}>
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
            <main className="w-full max-w-none px-6 md:px-12 lg:px-24 pt-16 pb-24 mb-12 flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10 flex-1">
                
                {/* Left Content - STRICTLY Left Aligned (items-start text-left) */}
                <motion.div initial="hidden" animate="visible" variants={fadeUp} className="w-full lg:w-[50%] xl:w-[45%] z-10 flex flex-col items-start justify-center text-left">
                    
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/40 mb-8">
                        <ShieldCheck size={16} color="#FFFFFF" />
                        <span className="text-[0.75rem] font-bold tracking-widest uppercase text-[#FFFFFF]">{currentT.badge}</span>
                    </div>

                    {/* Massive Title */}
                    <h1 className="text-[4rem] md:text-[5.5rem] lg:text-[6.5rem] font-black leading-[1] tracking-tighter mb-6 text-[#FFFFFF]">
                        {currentT.main_title.split('\n').map((line, i) => (
                            <React.Fragment key={i}>{line}<br/></React.Fragment>
                        ))}
                    </h1>
                    
                    {/* Subtitle */}
                    <p className="text-[1.25rem] md:text-[1.5rem] text-[#FFFFFF] font-medium leading-[1.6] mb-12 opacity-90">
                        {currentT.main_sub}
                    </p>
                    
                    {/* CTA Button */}
                    <button 
                        onClick={handleDownloadRedirect} 
                        style={{ backgroundColor: theme.accent, color: "#111111" }}
                        className="w-full sm:w-auto px-10 py-4 rounded-xl font-black text-[1.1rem] transition-transform hover:scale-105 outline-none shadow-lg mb-16 flex items-center justify-center gap-2"
                    >
                        {currentT.cta_btn} <ArrowRight size={20} />
                    </button>

                    {/* 2x2 Feature Grid - Strictly positioned below the button, left aligned */}
                    <div className="grid grid-cols-2 gap-x-12 gap-y-10 w-full max-w-[500px]">
                        {[
                            { icon: MapPin, title: currentT.val1_title, desc: currentT.val1_sub },
                            { icon: Activity, title: currentT.val2_title, desc: currentT.val2_sub },
                            { icon: Bell, title: currentT.val3_title, desc: currentT.val3_sub },
                            { icon: ShieldCheck, title: currentT.val4_title, desc: currentT.val4_sub }
                        ].map((item, idx) => (
                            <div key={idx} className="flex flex-col items-start text-left">
                                <div className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center mb-3">
                                    <item.icon size={20} color="#FFFFFF" />
                                </div>
                                <h4 className="text-[1.15rem] font-black text-[#FFFFFF] mb-1">{item.title}</h4>
                                <p className="text-[0.9rem] text-[#FFFFFF] opacity-80">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Right Graphic - Custom Smart City & Nature SVG Animation */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.2 }} className="w-full lg:w-[50%] h-[500px] lg:h-[750px] relative z-0 flex items-center justify-center lg:justify-end xl:pr-12">
                    <svg viewBox="0 0 600 600" className="w-full h-full max-w-[750px] drop-shadow-2xl" fill="none">
                        
                        {/* Sun / Halo */}
                        <motion.circle 
                            cx="300" cy="200" r="100" 
                            fill="rgba(255,179,0,0.1)" 
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} 
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} 
                        />
                        <circle cx="300" cy="200" r="50" fill={theme.accent} />
                        
                        {/* Distant Hills */}
                        <path d="M 0 450 Q 150 320 300 450 T 600 450 L 600 600 L 0 600 Z" fill="rgba(255,255,255,0.05)" />

                        {/* Cityscape (Buildings) */}
                        <path d="M 100 450 L 100 220 L 170 220 L 170 450 Z" fill="rgba(255,255,255,0.15)" />
                        <path d="M 190 450 L 190 120 L 270 120 L 270 450 Z" fill="rgba(255,255,255,0.25)" />
                        <path d="M 290 450 L 290 180 L 350 180 L 350 450 Z" fill="rgba(255,255,255,0.15)" />
                        <path d="M 370 450 L 370 80 L 470 80 L 470 450 Z" fill="rgba(255,255,255,0.2)" />

                        {/* Lit Windows */}
                        <rect x="210" y="150" width="20" height="20" fill={theme.accent} />
                        <rect x="240" y="210" width="20" height="20" fill={theme.accent} />
                        <rect x="390" y="120" width="20" height="20" fill={theme.accent} />
                        <rect x="440" y="300" width="20" height="20" fill={theme.accent} />
                        <rect x="120" y="260" width="20" height="20" fill={theme.accent} />
                        
                        {/* Nature / Trees */}
                        <path d="M 140 450 L 140 380" stroke="rgba(255,255,255,0.5)" strokeWidth="6" strokeLinecap="round" />
                        <circle cx="140" cy="350" r="30" fill="rgba(255,255,255,0.4)" />
                        <path d="M 330 450 L 330 350" stroke="rgba(255,255,255,0.5)" strokeWidth="6" strokeLinecap="round" />
                        <circle cx="330" cy="310" r="40" fill="rgba(255,255,255,0.4)" />
                        <path d="M 500 450 L 500 370" stroke="rgba(255,255,255,0.5)" strokeWidth="6" strokeLinecap="round" />
                        <circle cx="500" cy="330" r="35" fill="rgba(255,255,255,0.3)" />

                        {/* Animated Flowing Water / River at base */}
                        <motion.path 
                            d="M 0 480 C 150 450 300 510 600 480 L 600 600 L 0 600 Z" 
                            fill="rgba(255,255,255,0.15)" 
                            animate={{ d: ["M 0 480 C 150 450 300 510 600 480 L 600 600 L 0 600 Z", "M 0 480 C 150 510 300 450 600 480 L 600 600 L 0 600 Z", "M 0 480 C 150 450 300 510 600 480 L 600 600 L 0 600 Z"] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.path 
                            d="M 0 520 C 200 490 400 550 600 520 L 600 600 L 0 600 Z" 
                            fill="rgba(255,255,255,0.25)" 
                            animate={{ d: ["M 0 520 C 200 490 400 550 600 520 L 600 600 L 0 600 Z", "M 0 520 C 200 550 400 490 600 520 L 600 600 L 0 600 Z", "M 0 520 C 200 490 400 550 600 520 L 600 600 L 0 600 Z"] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        />

                        {/* Animated Flying Birds */}
                        <motion.path 
                            d="M 400 200 Q 410 190 420 200 Q 410 210 400 200" 
                            stroke="#FFFFFF" strokeWidth="2" fill="none" 
                            animate={{ x: [0, -100, 0], y: [0, -30, 0] }} 
                            transition={{ duration: 12, repeat: Infinity, ease: "linear" }} 
                        />
                        <motion.path 
                            d="M 450 150 Q 460 140 470 150 Q 460 160 450 150" 
                            stroke="#FFFFFF" strokeWidth="2" fill="none" 
                            animate={{ x: [0, -150, 0], y: [0, -20, 0] }} 
                            transition={{ duration: 15, repeat: Infinity, delay: 2, ease: "linear" }} 
                        />
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
                                <Link to="https://rebrand.ly/mvsahay" className="group flex flex-col items-center justify-center gap-2 bg-[#F9FAFB] border border-[#E0E0E0] p-6 rounded-2xl hover:border-[#CCCCCC] hover:shadow-sm transition-all text-center w-full outline-none">
                                    <div className="flex items-center gap-0.3">
                                        <img src="/logo-4.png" alt="Movyra" className="h-7 w-auto" onError={(e) => { e.target.style.display = 'none' }} />
                                        <span className="font-black text-[1.4rem] tracking-tighter text-[#111111]">
                                            ovyra <span className="font-medium text-[1.1rem] text-[#666666] ml-1">Sahay</span>
                                        </span>
                                    </div>
                                    <p className="text-[#666666] text-[0.85rem] leading-relaxed mt-1">
                                        Humanitarian rescue network.
                                    </p>
                                </Link>

                                {/* Movyra Civic */}
                                <Link to="https://rebrand.ly/mvcivic" className="group flex flex-col items-center justify-center gap-2 bg-[#F9FAFB] border border-[#E0E0E0] p-6 rounded-2xl hover:border-[#CCCCCC] hover:shadow-sm transition-all text-center w-full outline-none">
                                    <div className="flex items-center gap-0.3">
                                        <img src="/logo-3.png" alt="Movyra" className="h-7 w-auto" onError={(e) => { e.target.style.display = 'none' }} />
                                        <span className="font-black text-[1.4rem] tracking-tighter text-[#111111]">
                                            ovyra <span className="font-medium text-[1.1rem] text-[#666666] ml-1">Civic</span>
                                        </span>
                                    </div>
                                    <p className="text-[#666666] text-[0.85rem] leading-relaxed mt-1">
                                        Smart city management platform.
                                    </p>
                                </Link>

                                {/* Movyra NagrikSetu */}
                                <Link to="https://rebrand.ly/mnagriksetu" className="group flex flex-col items-center justify-center gap-2 bg-[#E0F2F1] border-2 border-[#00897B] p-6 rounded-2xl transition-all text-center w-full outline-none">
                                    <div className="flex items-center gap-0.3">
                                        <img src="/logo-6.png" alt="Movyra" className="h-7 w-auto" onError={(e) => { e.target.style.display = 'none' }} />
                                        <span className="font-black text-[1.4rem] tracking-tighter text-[#00897B]">
                                            ovyra <span className="font-bold text-[1.1rem] ml-1">NagrikSetu</span>
                                        </span>
                                    </div>
                                    <p className="text-[#00897B] text-[0.85rem] leading-relaxed mt-1 font-medium">
                                        Citizen grievance & reporting.
                                    </p>
                                </Link>

                                {/* Movyra SevaSetu */}
                                <Link to="https://rebrand.ly/msevasetu" onClick={(e) => { e.preventDefault(); alert("Movyra SevaSetu is Coming Soon!"); }} className="group flex flex-col items-center justify-center gap-2 bg-[#FFFFFF] border border-[#E0E0E0] p-6 rounded-2xl opacity-70 hover:bg-[#F5F5F5] transition-all text-center w-full outline-none relative cursor-pointer">
                                    <div className="flex items-center gap-0.3">
                                        <img src="/logo-7.png" alt="Movyra" className="h-7 w-auto" onError={(e) => { e.target.style.display = 'none' }} />
                                        <span className="font-black text-[1.4rem] tracking-tighter text-[#111111]">
                                            ovyra <span className="font-medium text-[1.1rem] text-[#666666] ml-1">SevaSetu</span>
                                        </span>
                                    </div>
                                    <span className="absolute top-3 right-3 text-[0.65rem] font-bold px-2 py-1 bg-[#F5F5F5] text-[#111111] rounded-full uppercase tracking-wider">Coming Soon</span>
                                </Link>
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
                            <p className="text-[#666666] text-[0.95rem] text-left mb-8">Go directly to app pages.</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                                <Link to="/home" className="bg-[#F9FAFB] border border-[#E0E0E0] p-4 rounded-xl font-bold text-[#111111] text-[0.95rem] hover:border-[#CCCCCC] hover:bg-[#F0F0F0] transition-colors text-left outline-none flex flex-col">
                                    <span>App Home</span>
                                    <span className="text-[#666666] font-normal text-[0.75rem] mt-1">Main screen</span>
                                </Link>
                                <Link to="/report" className="bg-[#F9FAFB] border border-[#E0E0E0] p-4 rounded-xl font-bold text-[#111111] text-[0.95rem] hover:border-[#CCCCCC] hover:bg-[#F0F0F0] transition-colors text-left outline-none flex flex-col">
                                    <span>File Complaint</span>
                                    <span className="text-[#666666] font-normal text-[0.75rem] mt-1">Report a problem</span>
                                </Link>
                                <Link to="/alerts" className="bg-[#F9FAFB] border border-[#E0E0E0] p-4 rounded-xl font-bold text-[#111111] text-[0.95rem] hover:border-[#CCCCCC] hover:bg-[#F0F0F0] transition-colors text-left outline-none flex flex-col">
                                    <span>Live Map</span>
                                    <span className="text-[#666666] font-normal text-[0.75rem] mt-1">See city issues</span>
                                </Link>
                                <Link to="/admin" className="bg-[#F9FAFB] border border-[#E0E0E0] p-4 rounded-xl font-bold text-[#111111] text-[0.95rem] hover:border-[#CCCCCC] hover:bg-[#F0F0F0] transition-colors text-left outline-none flex flex-col">
                                    <span>Admin Login</span>
                                    <span className="text-[#666666] font-normal text-[0.75rem] mt-1">For city staff</span>
                                </Link>
                                <Link to="/download" className="bg-[#E0F2F1] border border-[#00897B] p-4 rounded-xl font-bold text-[#00897B] text-[0.95rem] hover:bg-[#B2DFDB] transition-colors text-left outline-none flex flex-col sm:col-span-2">
                                    <span>Get App</span>
                                    <span className="text-[#007065] font-normal text-[0.75rem] mt-1">Download for your phone</span>
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
                        <a href="https://www.linkedin.com/company/getmovyra/" className="hover:opacity-70 transition-opacity outline-none">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        </a>
                        <a href="#" className="hover:opacity-70 transition-opacity outline-none">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
                        </a>
                        <a href="https://instagram.com/nagriksetu.app" className="hover:opacity-70 transition-opacity outline-none">
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
                    <Link to="https://getmovyra.in/careers" className="hover:opacity-70 transition-opacity outline-none uppercase">{currentT.careers}</Link>
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