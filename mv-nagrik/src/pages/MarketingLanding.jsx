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
        main_title: "Your City. Connected.",
        main_sub: "Report. Track. Resolve.",
        cta_btn: "Download App",
        val1_title: "Report", val1_sub: "Log civic issues.",
        val2_title: "Track", val2_sub: "Real-time status.",
        val3_title: "Alerts", val3_sub: "Official updates.",
        val4_title: "Secure", val4_sub: "Gov-grade data.",
        stat_title: "Transparency.", stat_desc: "Live city metrics.",
        work_title: "Workflow", 
        w1_t: "Log", w1_d: "Issue.", w2_t: "Assign", w2_d: "Team.", w3_t: "Fix", w3_d: "Done.",
        mob_title: "Go Mobile.", mob_desc: "Civic app for citizens.",
        imp_title: "Join Us.", imp_desc: "Build better cities.",
        footer_text: "NagrikSetu", select_lang: "Select Language", built_by: "Built by"
    },
    hi: {
        lang: "हिन्दी", products: "उत्पाद", careers: "करियर", coming_soon: "जल्द आ रहा है",
        badge: "स्मार्ट नागरिक मंच",
        main_title: "आपका शहर। जुड़ा हुआ।",
        main_sub: "रिपोर्ट करें। ट्रैक करें। समाधान करें।",
        cta_btn: "ऐप डाउनलोड करें",
        val1_title: "रिपोर्ट", val1_sub: "समस्या दर्ज करें।",
        val2_title: "ट्रैक", val2_sub: "लाइव स्थिति।",
        val3_title: "अलर्ट", val3_sub: "आधिकारिक अपडेट।",
        val4_title: "सुरक्षित", val4_sub: "सरकारी स्तर का डेटा।",
        stat_title: "पारदर्शिता।", stat_desc: "लाइव शहर मेट्रिक्स।",
        work_title: "कार्यप्रवाह", 
        w1_t: "लॉग", w1_d: "समस्या।", w2_t: "सौंपें", w2_d: "टीम।", w3_t: "ठीक", w3_d: "पूर्ण।",
        mob_title: "मोबाइल पर।", mob_desc: "नागरिकों के लिए ऐप।",
        imp_title: "जुड़ें।", imp_desc: "बेहतर शहर बनाएं।",
        footer_text: "नागरिकसेतु", select_lang: "भाषा चुनें", built_by: "निर्मित"
    },
    hinglish: {
        lang: "Hinglish", products: "Products", careers: "Careers", coming_soon: "Coming Soon",
        badge: "Smart Civic Platform",
        main_title: "Aapka City. Connected.",
        main_sub: "Report. Track. Resolve karein.",
        cta_btn: "App Download Karein",
        val1_title: "Report", val1_sub: "Issues log karein.",
        val2_title: "Track", val2_sub: "Live status.",
        val3_title: "Alerts", val3_sub: "Official updates.",
        val4_title: "Secure", val4_sub: "Gov-grade data.",
        stat_title: "Transparency.", stat_desc: "Live city metrics.",
        work_title: "Workflow", 
        w1_t: "Log", w1_d: "Issue.", w2_t: "Assign", w2_d: "Team.", w3_t: "Fix", w3_d: "Done.",
        mob_title: "Go Mobile.", mob_desc: "Citizens ke liye app.",
        imp_title: "Join Us.", imp_desc: "Behtar shehar banayein.",
        footer_text: "NagrikSetu", select_lang: "Language Select Karein", built_by: "Built by"
    },
    mr: {
        lang: "मराठी", products: "उत्पादने", careers: "करिअर", coming_soon: "लवकरच येत आहे",
        badge: "स्मार्ट नागरी व्यासपीठ",
        main_title: "तुमचे शहर. जोडलेले.",
        main_sub: "तक्रार. ट्रॅक. निराकरण.",
        cta_btn: "ॲप डाउनलोड करा",
        val1_title: "तक्रार", val1_sub: "समस्या नोंदवा.",
        val2_title: "ट्रॅक", val2_sub: "थेट स्थिती.",
        val3_title: "अलर्ट", val3_sub: "अधिकृत अपडेट्स.",
        val4_title: "सुरक्षित", val4_sub: "सरकारी डेटा.",
        stat_title: "पारदर्शकता.", stat_desc: "थेट शहर मेट्रिक्स.",
        work_title: "कार्यप्रवाह", 
        w1_t: "नोंद", w1_d: "समस्या.", w2_t: "असाइन", w2_d: "टीम.", w3_t: "दुरुस्त", w3_d: "पूर्ण.",
        mob_title: "मोबाईलवर.", mob_desc: "नागरिकांसाठी ॲप.",
        imp_title: "सामील व्हा.", imp_desc: "उत्तम शहरे बनवा.",
        footer_text: "नागरिकसेतू", select_lang: "भाषा निवडा", built_by: "निर्मित"
    },
    gu: {
        lang: "ગુજરાતી", products: "ઉત્પાદનો", careers: "કારકિર્દી", coming_soon: "ટૂંક સમયમાં",
        badge: "સ્માર્ટ નાગરિક પ્લેટફોર્મ",
        main_title: "તમારું શહેર. જોડાયેલ.",
        main_sub: "રિપોર્ટ. ટ્રૅક. ઉકેલ.",
        cta_btn: "એપ્લિકેશન ડાઉનલોડ",
        val1_title: "રિપોર્ટ", val1_sub: "સમસ્યા નોંધો.",
        val2_title: "ટ્રૅક", val2_sub: "લાઇવ સ્થિતિ.",
        val3_title: "એલર્ટ", val3_sub: "સત્તાવાર અપડેટ્સ.",
        val4_title: "સુરક્ષિત", val4_sub: "સરકારી ડેટા.",
        stat_title: "પારદર્શિતા.", stat_desc: "લાઇવ મેટ્રિક્સ.",
        work_title: "વર્કફ્લો", 
        w1_t: "નોંધ", w1_d: "સમસ્યા.", w2_t: "સોંપો", w2_d: "ટીમ.", w3_t: "ઉકેલ", w3_d: "પૂર્ણ.",
        mob_title: "મોબાઇલ પર.", mob_desc: "નાગરિકો માટે એપ્લિકેશન.",
        imp_title: "જોડાવો.", imp_desc: "સારા શહેરો બનાવો.",
        footer_text: "નાગરિકસેતુ", select_lang: "ભાષા પસંદ કરો", built_by: "દ્વારા"
    },
    te: {
        lang: "తెలుగు", products: "ఉత్పత్తులు", careers: "కెరీర్స్", coming_soon: "త్వరలో",
        badge: "స్మార్ట్ ప్లాట్‌ఫారమ్",
        main_title: "మీ నగరం. కనెక్ట్ చేయబడింది.",
        main_sub: "నివేదిక. ట్రాక్. పరిష్కారం.",
        cta_btn: "యాప్ డౌన్‌లోడ్",
        val1_title: "నివేదిక", val1_sub: "సమస్యలను లాగ్ చేయండి.",
        val2_title: "ట్రాక్", val2_sub: "లైవ్ స్థితి.",
        val3_title: "అలర్ట్స్", val3_sub: "అధికారిక నవీకరణలు.",
        val4_title: "సురక్షితం", val4_sub: "ప్రభుత్వ డేటా.",
        stat_title: "పారదర్శకత.", stat_desc: "లైవ్ సిటీ మెట్రిక్స్.",
        work_title: "వర్క్‌ఫ్లో", 
        w1_t: "లాగ్", w1_d: "సమస్య.", w2_t: "కేటాయింపు", w2_d: "బృందం.", w3_t: "పరిష్కారం", w3_d: "పూర్తయింది.",
        mob_title: "మొబైల్.", mob_desc: "పౌరుల యాప్.",
        imp_title: "చేరండి.", imp_desc: "మెరుగైన నగరాలు.",
        footer_text: "నాగ్రిక్‌సేతు", select_lang: "భాష ఎంచుకోండి", built_by: "నిర్మించినవారు"
    },
    ta: {
        lang: "தமிழ்", products: "தயாரிப்புகள்", careers: "தொழில்கள்", coming_soon: "விரைவில்",
        badge: "ஸ்மார்ட் தளம்",
        main_title: "உங்கள் நகரம். இணைக்கப்பட்டது.",
        main_sub: "அறிக்கை. கண்காணிப்பு. தீர்வு.",
        cta_btn: "செயலியை பதிவிறக்கு",
        val1_title: "அறிக்கை", val1_sub: "சிக்கல்களைப் பதிவு செய்.",
        val2_title: "கண்காணி", val2_sub: "நேரலை நிலை.",
        val3_title: "எச்சரிக்கைகள்", val3_sub: "அதிகாரப்பூர்வ புதுப்பிப்புகள்.",
        val4_title: "பாதுகாப்பு", val4_sub: "அரசு தரவு.",
        stat_title: "வெளிப்படைத்தன்மை.", stat_desc: "நேரலை அளவீடுகள்.",
        work_title: "பணிப்பாய்வு", 
        w1_t: "பதிவு", w1_d: "சிக்கல்.", w2_t: "ஒதுக்கீடு", w2_d: "குழு.", w3_t: "தீர்வு", w3_d: "முடிந்தது.",
        mob_title: "மொபைல்.", mob_desc: "குடிமக்களுக்கான செயலி.",
        imp_title: "இணையுங்கள்.", imp_desc: "சிறந்த நகரங்கள்.",
        footer_text: "நாகரிக் சேது", select_lang: "மொழியைத் தேர்ந்தெடு", built_by: "உருவாக்கியவர்"
    },
    pa: {
        lang: "ਪੰਜਾਬੀ", products: "ਉਤਪਾਦ", careers: "ਕਰੀਅਰ", coming_soon: "ਜਲਦੀ",
        badge: "ਸਮਾਰਟ ਪਲੇਟਫਾਰਮ",
        main_title: "ਤੁਹਾਡਾ ਸ਼ਹਿਰ. ਜੁੜਿਆ ਹੋਇਆ।",
        main_sub: "ਰਿਪੋਰਟ. ਟਰੈਕ. ਹੱਲ।",
        cta_btn: "ਐਪ ਡਾਊਨਲੋਡ ਕਰੋ",
        val1_title: "ਰਿਪੋਰਟ", val1_sub: "ਸਮੱਸਿਆ ਦਰਜ ਕਰੋ।",
        val2_title: "ਟਰੈਕ", val2_sub: "ਲਾਈਵ ਸਥਿਤੀ।",
        val3_title: "ਅਲਰਟ", val3_sub: "ਅਧਿਕਾਰਤ ਅੱਪਡੇਟ।",
        val4_title: "ਸੁਰੱਖਿਅਤ", val4_sub: "ਸਰਕਾਰੀ ਡਾਟਾ।",
        stat_title: "ਪਾਰਦਰਸ਼ਤਾ।", stat_desc: "ਲਾਈਵ ਮੈਟ੍ਰਿਕਸ।",
        work_title: "ਵਰਕਫਲੋ", 
        w1_t: "ਲਾਗ", w1_d: "ਸਮੱਸਿਆ।", w2_t: "ਸੌਂਪੋ", w2_d: "ਟੀਮ।", w3_t: "ਹੱਲ", w3_d: "ਪੂਰਾ।",
        mob_title: "ਮੋਬਾਈਲ 'ਤੇ।", mob_desc: "ਨਾਗਰਿਕਾਂ ਲਈ ਐਪ।",
        imp_title: "ਸ਼ਾਮਲ ਹੋਵੋ।", imp_desc: "ਬਿਹਤਰ ਸ਼ਹਿਰ।",
        footer_text: "ਨਾਗਰਿਕਸੇਤੂ", select_lang: "ਭਾਸ਼ਾ ਚੁਣੋ", built_by: "ਦੁਆਰਾ ਬਣਾਇਆ"
    },
    bho: {
        lang: "भोजपुरी", products: "उत्पाद", careers: "करियर", coming_soon: "जल्द",
        badge: "स्मार्ट मंच",
        main_title: "राउर शहर। जुडल बा।",
        main_sub: "रिपोर्ट। ट्रैक। समाधान।",
        cta_btn: "ऐप डाउनलोड",
        val1_title: "रिपोर्ट", val1_sub: "समस्या दर्ज करीं।",
        val2_title: "ट्रैक", val2_sub: "लाइव स्थिति।",
        val3_title: "अलर्ट", val3_sub: "आधिकारिक अपडेट।",
        val4_title: "सुरक्षित", val4_sub: "सरकारी डेटा।",
        stat_title: "पारदर्शिता।", stat_desc: "लाइव मेट्रिक्स।",
        work_title: "काम", 
        w1_t: "लॉग", w1_d: "समस्या।", w2_t: "सौंपीं", w2_d: "टीम।", w3_t: "ठीक", w3_d: "पूरा।",
        mob_title: "मोबाइल पर।", mob_desc: "नागरिक ऐप।",
        imp_title: "जुड़ीं।", imp_desc: "बेहतर शहर।",
        footer_text: "नागरिकसेतु", select_lang: "भाषा चुनीं", built_by: "द्वारा बनावल"
    },
    ar: {
        lang: "العربية", products: "المنتجات", careers: "وظائف", coming_soon: "قريباً",
        badge: "منصة ذكية",
        main_title: "مدينتك. متصلة.",
        main_sub: "إبلاغ. تتبع. حل.",
        cta_btn: "تحميل التطبيق",
        val1_title: "إبلاغ", val1_sub: "تسجيل المشاكل.",
        val2_title: "تتبع", val2_sub: "الحالة الحية.",
        val3_title: "تنبيهات", val3_sub: "تحديثات رسمية.",
        val4_title: "آمن", val4_sub: "بيانات حكومية.",
        stat_title: "شفافية.", stat_desc: "مقاييس حية.",
        work_title: "سير العمل", 
        w1_t: "سجل", w1_d: "مشكلة.", w2_t: "تعيين", w2_d: "فريق.", w3_t: "حل", w3_d: "تم.",
        mob_title: "تطبيق المحمول.", mob_desc: "تطبيق للمواطنين.",
        imp_title: "انضم إلينا.", imp_desc: "مدن أفضل.",
        footer_text: "ناغريك سيتو", select_lang: "اختر اللغة", built_by: "بواسطة"
    },
    es: {
        lang: "Español", products: "Productos", careers: "Carreras", coming_soon: "Pronto",
        badge: "Plataforma Inteligente",
        main_title: "Tu Ciudad. Conectada.",
        main_sub: "Reporta. Rastrea. Resuelve.",
        cta_btn: "Descargar App",
        val1_title: "Reportar", val1_sub: "Registra problemas.",
        val2_title: "Rastrear", val2_sub: "Estado en vivo.",
        val3_title: "Alertas", val3_sub: "Actualizaciones.",
        val4_title: "Seguro", val4_sub: "Datos oficiales.",
        stat_title: "Transparencia.", stat_desc: "Métricas en vivo.",
        work_title: "Proceso", 
        w1_t: "Reg.", w1_d: "Problema.", w2_t: "Asignar", w2_d: "Equipo.", w3_t: "Arreglar", w3_d: "Hecho.",
        mob_title: "Móvil.", mob_desc: "App ciudadana.",
        imp_title: "Únete.", imp_desc: "Mejores ciudades.",
        footer_text: "NagrikSetu", select_lang: "Idioma", built_by: "Por"
    },
    fr: {
        lang: "Français", products: "Produits", careers: "Carrières", coming_soon: "Bientôt",
        badge: "Plateforme Intelligente",
        main_title: "Votre Ville. Connectée.",
        main_sub: "Signalez. Suivez. Résolvez.",
        cta_btn: "Télécharger l'App",
        val1_title: "Signaler", val1_sub: "Problèmes locaux.",
        val2_title: "Suivre", val2_sub: "Statut en direct.",
        val3_title: "Alertes", val3_sub: "Mises à jour.",
        val4_title: "Sécurisé", val4_sub: "Données gouv.",
        stat_title: "Transparence.", stat_desc: "Métriques en direct.",
        work_title: "Processus", 
        w1_t: "Enreg.", w1_d: "Problème.", w2_t: "Assigner", w2_d: "Équipe.", w3_t: "Fixer", w3_d: "Fait.",
        mob_title: "Mobile.", mob_desc: "App citoyenne.",
        imp_title: "Rejoignez.", imp_desc: "Meilleures villes.",
        footer_text: "NagrikSetu", select_lang: "Langue", built_by: "Par"
    },
    de: {
        lang: "Deutsch", products: "Produkte", careers: "Karriere", coming_soon: "Demnächst",
        badge: "Intelligente Plattform",
        main_title: "Ihre Stadt. Verbunden.",
        main_sub: "Melden. Verfolgen. Lösen.",
        cta_btn: "App Herunterladen",
        val1_title: "Melden", val1_sub: "Probleme erfassen.",
        val2_title: "Verfolgen", val2_sub: "Live-Status.",
        val3_title: "Warnungen", val3_sub: "Updates.",
        val4_title: "Sicher", val4_sub: "Regierungsdaten.",
        stat_title: "Transparenz.", stat_desc: "Live-Metriken.",
        work_title: "Ablauf", 
        w1_t: "Protokoll", w1_d: "Problem.", w2_t: "Zuweisen", w2_d: "Team.", w3_t: "Lösen", w3_d: "Fertig.",
        mob_title: "Mobil.", mob_desc: "Bürger-App.",
        imp_title: "Mach mit.", imp_desc: "Bessere Städte.",
        footer_text: "NagrikSetu", select_lang: "Sprache", built_by: "Von"
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
        cardBg: "#FFFFFF",     // White cards
        cardText: "#111111",   // Black text in cards
        accent: "#FFB300",     // Action Yellow
        success: "#2E7D32"     // Success Green
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
                html { scroll-behavior: smooth; }
                `}
            </style>

            {/* MINIMAL TOP HEADER */}
            <header className="w-full flex items-center justify-between px-6 md:px-12 lg:px-16 py-8 animate-fade relative z-50">
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
                        className="flex items-center gap-2 text-[#FFFFFF] hover:opacity-70 transition-opacity outline-none"
                    >
                        <Globe size={16} /> <span className="hidden sm:inline">{currentT.lang}</span>
                    </button>
                    <button 
                        onClick={() => setShowProductsPrompt(true)}
                        className="hidden sm:block text-[#FFFFFF] hover:opacity-70 transition-opacity outline-none"
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

                            <h2 className="text-[1.4rem] font-black tracking-tight mb-2 text-[#111111] text-center mt-4">
                                {currentT.select_lang}
                            </h2>
                            
                            <div className="flex flex-col gap-2 mt-4">
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

            {/* STRICT PRODUCTS ECOSYSTEM MODAL */}
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

                            <h2 className="text-[1.5rem] font-black tracking-tight mb-8 text-[#111111] text-center mt-4">{currentT.products}</h2>

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
                                {/* NagrikSetu - Highlighted */}
                                <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-[#00897B] bg-[#E0F2F1] outline-none">
                                    <img src="/logo-2.png" alt="M" className="h-6 w-auto" onError={(e) => { e.target.style.display = 'none' }} />
                                    <div className="flex flex-col">
                                        <span className="font-black text-xl leading-none text-[#00897B]">
                                            ovyra <span className="font-bold text-[1rem] ml-1">NagrikSetu</span>
                                        </span>
                                    </div>
                                </div>
                                {/* SevaSetu - Coming Soon */}
                                <div className="flex items-center justify-between p-4 rounded-2xl border border-[#E0E0E0] bg-[#FFFFFF] opacity-70 outline-none">
                                    <div className="flex items-center gap-4">
                                        <img src="/logo-2.png" alt="M" className="h-6 w-auto" onError={(e) => { e.target.style.display = 'none' }} />
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
            <div className="w-full max-w-none mx-auto px-6 md:px-12 lg:px-16 py-12 flex flex-col lg:flex-row gap-16 items-center justify-between relative z-10 flex-1">
                
                {/* SECTION 1: MARKETING HERO & VALUE PROPOSITIONS */}
                <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }} className="flex-1 w-full xl:pl-12">
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full mb-8 border border-white/30 bg-white/10">
                        <ShieldCheck size={18} color="#FFFFFF" />
                        <span className="text-[0.85rem] font-bold tracking-widest uppercase text-[#FFFFFF]">{currentT.badge}</span>
                    </div>

                    <h1 className="text-[4rem] md:text-[5.5rem] lg:text-[6.5rem] font-black leading-[1] tracking-tighter mb-6 text-[#FFFFFF] max-w-[800px]">
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
                    <div className="grid grid-cols-2 gap-8 max-w-[800px]">
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

                {/* GRAPHIC / ILLUSTRATION SECTION - STRICTLY NEW ANIMATION */}
                <motion.div initial="hidden" animate="visible" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2 } } }} className="hidden lg:flex justify-center xl:justify-end w-full lg:w-[600px] shrink-0 xl:pr-12">
                    <svg viewBox="0 0 400 400" className="w-full h-auto max-w-[600px]" fill="none">
                        {/* Perspective Grid Background */}
                        <path d="M50 300 L350 300 M100 250 L300 250 M150 200 L250 200" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
                        <path d="M200 150 L50 350 M200 150 L350 350 M200 150 L200 350" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
                        
                        {/* Animated Central Glowing Shield */}
                        <motion.path 
                            d="M200 50 L300 90 V180 C300 260 200 340 200 340 C200 340 100 260 100 180 V90 L200 50 Z" 
                            stroke="rgba(255,255,255,0.2)" strokeWidth="4" 
                        />
                        <motion.path 
                            d="M200 50 L300 90 V180 C300 260 200 340 200 340 C200 340 100 260 100 180 V90 L200 50 Z" 
                            stroke="#FFB300" strokeWidth="4" 
                            strokeDasharray="1000" 
                            initial={{ strokeDashoffset: 1000 }} 
                            animate={{ strokeDashoffset: 0 }} 
                            transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse', ease: "easeInOut" }} 
                        />
                        
                        <circle cx="200" cy="180" r="45" fill="#FFFFFF" shadow="0 0 20px rgba(255,255,255,0.5)" />
                        <path d="M180 180 L195 195 L225 165" stroke="#00897B" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                        
                        {/* Orbiting / Pulsing Activity Nodes */}
                        <motion.circle cx="200" cy="80" r="6" fill="#FFB300" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} />
                        <motion.circle cx="130" cy="160" r="6" fill="#FFB300" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }} />
                        <motion.circle cx="270" cy="160" r="6" fill="#FFB300" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2, delay: 1 }} />
                        <motion.circle cx="200" cy="270" r="6" fill="#FFB300" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2, delay: 1.5 }} />
                    </svg>
                </motion.div>
            </div>

            {/* MINIMAL FOOTER */}
            <footer className="w-full mt-auto flex flex-col md:flex-row items-center justify-between gap-8 px-6 md:px-12 lg:px-16 py-8 border-t border-white/20 relative z-10 bg-[#007065]">
                
                <div className="flex flex-col md:flex-row items-center gap-6 text-[0.8rem] font-bold text-[#FFFFFF]">
                    <div className="flex items-center gap-6">
                        <button onClick={() => setShowProductsPrompt(true)} className="hover:opacity-70 transition-opacity outline-none">{currentT.products}</button>
                        <span className="w-1.5 h-1.5 bg-[#FFFFFF] opacity-50 rounded-full"></span>
                        <Link to="/careers" className="hover:opacity-70 transition-opacity outline-none">{currentT.careers}</Link>
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
                            ovyra <span className="font-medium text-[0.75rem] ml-1 tracking-wide">NagrikSetu</span>
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