/**
 * SYSTEM DOCUMENTATION / 15-LANGUAGE TRANSLATION
 * Context: Minimal Official Marketing Landing Page for NagrikSetu.
 * Brand: Movyra Civic (NagrikSetu)
 * Design: Exact match to custom mockups (Left-aligned hero, 2x2 grid, custom chart graphic)
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
        lang: "हिन्दी", products: "उत्पाद", careers: "करियर", coming_soon: "जल्द आ रहा है",
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
        lang: "Hinglish", products: "Products", careers: "Careers", coming_soon: "Coming Soon",
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
        lang: "मराठी", products: "उत्पादने", careers: "करिअर", coming_soon: "लवकरच येत आहे",
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
        lang: "ગુજરાતી", products: "ઉત્પાદનો", careers: "કારકિર્દી", coming_soon: "ટૂંક સમયમાં",
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
        lang: "తెలుగు", products: "ఉత్పత్తులు", careers: "కెరీర్స్", coming_soon: "త్వరలో",
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
        lang: "தமிழ்", products: "தயாரிப்புகள்", careers: "தொழில்கள்", coming_soon: "விரைவில்",
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
        lang: "ਪੰਜਾਬੀ", products: "ਉਤਪਾਦ", careers: "ਕਰੀਅਰ", coming_soon: "ਜਲਦੀ",
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
        lang: "भोजपुरी", products: "उत्पाद", careers: "करियर", coming_soon: "जल्द",
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
        lang: "العربية", products: "المنتجات", careers: "وظائف", coming_soon: "قريباً",
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
        lang: "Español", products: "Productos", careers: "Carreras", coming_soon: "Pronto",
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
        lang: "Français", products: "Produits", careers: "Carrières", coming_soon: "Bientôt",
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
        lang: "Deutsch", products: "Produkte", careers: "Karriere", coming_soon: "Demnächst",
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
    const [lang, setLang] = useState('en');
    const [showLangPrompt, setShowLangPrompt] = useState(false);
    const [showProductsPrompt, setShowProductsPrompt] = useState(false);

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
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDownloadRedirect = () => {
        navigate('/download');
    };

    const fadeUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

    return (
        // ABSOLUTE BREAKOUT: fixed inset-0 w-screen h-screen ensures zero black borders on widescreen
        <div className="fixed inset-0 w-screen h-screen z-[9999] overflow-y-auto overflow-x-hidden font-sans flex flex-col" style={{ backgroundColor: theme.bg, color: theme.text }}>
            
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
                <div className="flex items-center gap-0.5 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
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
                
                <div className="flex items-center gap-6 text-[0.95rem] font-bold">
                    <button onClick={() => setShowLangPrompt(true)} className="flex items-center gap-2 text-[#FFFFFF] hover:opacity-70 transition-opacity outline-none">
                        <Globe size={16} /> <span className="hidden sm:inline">{currentT.lang}</span>
                    </button>
                    <button onClick={() => setShowProductsPrompt(true)} className="hidden md:block text-[#FFFFFF] hover:opacity-70 transition-opacity outline-none">
                        {currentT.products}
                    </button>
                </div>
            </header>

            {/* MAIN CONTENT AREA - Matches the custom screenshot layout perfectly */}
            <main className="w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24 pt-16 pb-16 flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10 flex-1">
                
                {/* Left Content - STRICTLY Left Aligned */}
                <motion.div initial="hidden" animate="visible" variants={fadeUp} className="w-full lg:w-[55%] z-10 flex flex-col items-start justify-start text-left">
                    
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

                {/* Right Graphic - Custom Smart City / Nature SVG Animation */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.2 }} className="w-full lg:w-[45%] h-[500px] lg:h-[750px] relative z-0 flex items-center justify-center lg:justify-end xl:pr-12">
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
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-[400px] bg-[#FFFFFF] rounded-3xl p-8 flex flex-col shadow-2xl relative max-h-[80vh] overflow-y-auto border border-[#E0E0E0]">
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

            {/* STRICT PRODUCTS ECOSYSTEM MODAL */}
            <AnimatePresence>
                {showProductsPrompt && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-[500px] bg-[#FFFFFF] rounded-3xl p-8 flex flex-col shadow-2xl relative border border-[#E0E0E0]">
                            <button onClick={() => setShowProductsPrompt(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[#666666] hover:bg-gray-100 hover:text-[#111111] rounded-full transition-colors outline-none"><X size={18} /></button>
                            <h2 className="text-[1.5rem] font-black tracking-tight mb-8 text-[#111111] text-center mt-4">{currentT.products}</h2>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap0.3 p-4 rounded-2xl border border-[#E0E0E0] bg-[#F9FAFB] hover:border-[#CCCCCC] transition-colors cursor-pointer outline-none">
                                    <img src="/logo-4.png" alt="M" className="h-6 w-auto" onError={(e) => { e.target.style.display = 'none' }} />
                                    <div className="flex flex-col"><span className="font-black text-xl leading-none text-[#111111]">ovyra <span className="font-medium text-[1rem] text-[#666666] ml-1">Sahay</span></span></div>
                                </div>
                                <div className="flex items-center gap-0.3 p-4 rounded-2xl border border-[#E0E0E0] bg-[#F9FAFB] hover:border-[#CCCCCC] transition-colors cursor-pointer outline-none">
                                    <img src="/logo-3.png" alt="M" className="h-6 w-auto" onError={(e) => { e.target.style.display = 'none' }} />
                                    <div className="flex flex-col"><span className="font-black text-xl leading-none text-[#111111]">ovyra <span className="font-medium text-[1rem] text-[#666666] ml-1">Civic</span></span></div>
                                </div>
                                <div className="flex items-center gap-0.3 p-4 rounded-2xl border-2 border-[#00897B] bg-[#E0F2F1] outline-none">
                                    <img src="/logo-6.png" alt="M" className="h-6 w-auto" onError={(e) => { e.target.style.display = 'none' }} />
                                    <div className="flex flex-col"><span className="font-black text-xl leading-none text-[#00897B]">ovyra <span className="font-bold text-[1rem] ml-1">NagrikSetu</span></span></div>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-2xl border border-[#E0E0E0] bg-[#FFFFFF] opacity-70 outline-none">
                                    <div className="flex items-center gap-0.3">
                                        <img src="/logo-7.png" alt="M" className="h-6 w-auto" onError={(e) => { e.target.style.display = 'none' }} />
                                        <div className="flex flex-col"><span className="font-black text-xl leading-none text-[#111111]">ovyra <span className="font-medium text-[1rem] text-[#666666] ml-1">SevaSetu</span></span></div>
                                    </div>
                                    <span className="text-[0.75rem] font-bold px-3 py-1 bg-[#F5F5F5] text-[#111111] rounded-full uppercase tracking-wider">{currentT.coming_soon}</span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MINIMAL FOOTER - Match screenshot exactly without mt-auto to completely close gap */}
            <footer className="w-full bg-[#007065] flex flex-col md:flex-row items-center justify-between gap-8 px-6 md:px-12 lg:px-24 py-8 relative z-10 border-t border-white/10">
                
                <div className="flex flex-col md:flex-row items-center gap-6 text-[0.8rem] font-bold text-[#FFFFFF]">
                    <div className="flex items-center gap-6">
                        <button onClick={() => setShowProductsPrompt(true)} className="hover:opacity-70 transition-opacity outline-none uppercase">{currentT.products}</button>
                        <span className="w-1.5 h-1.5 bg-[#FFFFFF] opacity-50 rounded-full"></span>
                        <Link to="/careers" className="hover:opacity-70 transition-opacity outline-none uppercase">{currentT.careers}</Link>
                        <span className="w-1.5 h-1.5 bg-[#FFFFFF] opacity-50 rounded-full"></span>
                        
                        <div className="flex items-center gap-2 uppercase tracking-wider opacity-90">
                            {currentT.built_by} 
                            <a href="https://rebrand.ly/aatns" target="_blank" rel="noopener noreferrer" className="ml-1 hover:opacity-80 transition-opacity outline-none">
                                <img src="/aat.png" alt="AnyAstro" className="h-4 w-auto object-contain" onError={(e) => { e.target.style.display = 'none'; e.target.insertAdjacentHTML('afterend', '<span class="underline">AnyAstro</span>'); }} />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center opacity-90 cursor-pointer" onClick={scrollToTop}>
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

                    <button onClick={scrollToTop} className="p-2.5 rounded-full border border-white/30 text-[#FFFFFF] hover:bg-white/10 transition-colors outline-none flex items-center justify-center">
                        <ArrowUp size={16} />
                    </button>
                </div>
            </footer>
        </div>
    );
}