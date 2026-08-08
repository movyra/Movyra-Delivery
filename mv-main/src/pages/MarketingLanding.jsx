/**
 * SYSTEM DOCUMENTATION / 15-LANGUAGE TRANSLATION
 * Context: Official Marketing Landing Page for SevaSetu.
 * Brand: Movyra Civic (SevaSetu)
 * Theme: NGO, Charity, Hospital, Support Network
 *
 * SYSTEM COLORS REFERENCE (STRICT):
 * Primary Background: #2563EB (Service Blue)
 * Dark Text: #111111 (Deep Black)
 * Containers: #FFFFFF (Pure White)
 * Success: #16A34A (Green)
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowUp, Globe, ShieldCheck, Heart, Users, Home } from 'lucide-react';

const TRANSLATIONS = {
    en: {
        lang: "English", products: "Products", sitemap: "Sitemap", careers: "Careers", coming_soon: "Coming Soon", built_by: "Built by",
        badge: "NGO Support Platform",
        main_title: "Help Those\nIn Need.",
        main_sub: "NGO and Charity Registration Coming Soon.",
        cta_btn: "Join Waitlist",
        val1_title: "Support", val1_sub: "Help people easily.",
        val2_title: "Connect", val2_sub: "Find local NGOs.",
        val3_title: "Trust", val3_sub: "Verified groups.",
        val4_title: "Safe", val4_sub: "Secure platform."
    },
    hi: {
        lang: "हिन्दी", products: "उत्पाद", sitemap: "साइटमैप", careers: "करियर", coming_soon: "जल्द आ रहा है", built_by: "निर्मित",
        badge: "एनजीओ सपोर्ट प्लेटफॉर्म",
        main_title: "ज़रूरतमंदों की\nमदद करें।",
        main_sub: "एनजीओ और चैरिटी पंजीकरण जल्द आ रहा है।",
        cta_btn: "जल्द जुड़ें",
        val1_title: "सहायता", val1_sub: "आसानी से मदद करें।",
        val2_title: "जुड़ें", val2_sub: "एनजीओ खोजें।",
        val3_title: "भरोसा", val3_sub: "सत्यापित समूह।",
        val4_title: "सुरक्षित", val4_sub: "सुरक्षित मंच।"
    },
    hinglish: {
        lang: "Hinglish", products: "Products", sitemap: "Sitemap", careers: "Careers", coming_soon: "Coming Soon", built_by: "Built by",
        badge: "NGO Support Platform",
        main_title: "Zaruratmandon Ki\nMadad Karein.",
        main_sub: "NGO aur Charity Registration Jald Aa Raha Hai.",
        cta_btn: "Jald Judein",
        val1_title: "Support", val1_sub: "Asaani se madad karein.",
        val2_title: "Connect", val2_sub: "NGOs khojein.",
        val3_title: "Trust", val3_sub: "Verified groups.",
        val4_title: "Safe", val4_sub: "Secure platform."
    },
    mr: {
        lang: "मराठी", products: "उत्पादने", sitemap: "साइटमॅप", careers: "करिअर", coming_soon: "लवकरच येत आहे", built_by: "निर्मित",
        badge: "एनजीओ सपोर्ट प्लॅटफॉर्म",
        main_title: "गरजूंना\nमदत करा.",
        main_sub: "एनजीओ आणि चॅरिटी नोंदणी लवकरच येत आहे.",
        cta_btn: "लवकरच सामील व्हा",
        val1_title: "मदत", val1_sub: "सहज मदत करा.",
        val2_title: "जोडा", val2_sub: "एनजीओ शोधा.",
        val3_title: "विश्वास", val3_sub: "सत्यापित गट.",
        val4_title: "सुरक्षित", val4_sub: "सुरक्षित व्यासपीठ."
    },
    gu: {
        lang: "ગુજરાતી", products: "ઉત્પાદનો", sitemap: "સાઇટમેપ", careers: "કારકિર્દી", coming_soon: "ટૂંક સમયમાં", built_by: "દ્વારા",
        badge: "એનજીઓ સપોર્ટ પ્લેટફોર્મ",
        main_title: "જરૂરિયાતમંદોને\nમદદ કરો.",
        main_sub: "એનજીઓ અને ચેરિટી નોંધણી ટૂંક સમયમાં આવી રહ્યું છે.",
        cta_btn: "ટૂંક સમયમાં જોડાઓ",
        val1_title: "મદદ", val1_sub: "સરળતાથી મદદ કરો.",
        val2_title: "જોડાવો", val2_sub: "એનજીઓ શોધો.",
        val3_title: "વિશ્વાસ", val3_sub: "ચકાસાયેલ જૂથો.",
        val4_title: "સુરક્ષિત", val4_sub: "સુરક્ષિત પ્લેટફોર્મ."
    },
    te: {
        lang: "తెలుగు", products: "ఉత్పత్తులు", sitemap: "సైట్‌మ్యాప్", careers: "కెరీర్స్", coming_soon: "త్వరలో", built_by: "నిర్మించినవారు",
        badge: "ఎన్జీఓ సపోర్ట్ ప్లాట్‌ఫారమ్",
        main_title: "అవసరమైన వారికి\nసహాయం చేయండి.",
        main_sub: "ఎన్జీఓ మరియు స్వచ్ఛంద సంస్థల నమోదు త్వరలో వస్తుంది.",
        cta_btn: "త్వరలో చేరండి",
        val1_title: "సహాయం", val1_sub: "సులభంగా సహాయం చేయండి.",
        val2_title: "కనెక్ట్", val2_sub: "ఎన్జీఓలను కనుగొనండి.",
        val3_title: "నమ్మకం", val3_sub: "ధృవీకరించబడిన సమూహాలు.",
        val4_title: "సురక్షితం", val4_sub: "సురక్షిత ప్లాట్‌ఫారమ్."
    },
    ta: {
        lang: "தமிழ்", products: "தயாரிப்புகள்", sitemap: "தளவரைபடம்", careers: "தொழில்கள்", coming_soon: "விரைவில்", built_by: "உருவாக்கியவர்",
        badge: "என்ஜிஓ ஆதரவு தளம்",
        main_title: "தேவையானவர்களுக்கு\nஉதவுங்கள்.",
        main_sub: "என்ஜிஓ மற்றும் அறக்கட்டளை பதிவு விரைவில் வருகிறது.",
        cta_btn: "விரைவில் இணையுங்கள்",
        val1_title: "உதவி", val1_sub: "எளிதாக உதவுங்கள்.",
        val2_title: "இணைப்பு", val2_sub: "என்ஜிஓக்களைத் தேடுங்கள்.",
        val3_title: "நம்பிக்கை", val3_sub: "சரிபார்க்கப்பட்ட குழுக்கள்.",
        val4_title: "பாதுகாப்பு", val4_sub: "பாதுகாப்பான தளம்."
    },
    pa: {
        lang: "ਪੰਜਾਬੀ", products: "ਉਤਪਾਦ", sitemap: "ਸਾਈਟਮੈਪ", careers: "ਕਰੀਅਰ", coming_soon: "ਜਲਦੀ", built_by: "ਦੁਆਰਾ ਬਣਾਇਆ",
        badge: "ਐਨਜੀਓ ਸਪੋਰਟ ਪਲੇਟਫਾਰਮ",
        main_title: "ਲੋੜਵੰਦਾਂ ਦੀ\nਮਦਦ ਕਰੋ।",
        main_sub: "ਐਨਜੀਓ ਅਤੇ ਚੈਰਿਟੀ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਜਲਦੀ ਆ ਰਿਹਾ ਹੈ।",
        cta_btn: "ਜਲਦੀ ਜੁੜੋ",
        val1_title: "ਮਦਦ", val1_sub: "ਆਸਾਨੀ ਨਾਲ ਮਦਦ ਕਰੋ।",
        val2_title: "ਜੁੜੋ", val2_sub: "ਐਨਜੀਓ ਲੱਭੋ।",
        val3_title: "ਭਰੋਸਾ", val3_sub: "ਪ੍ਰਮਾਣਿਤ ਸਮੂਹ।",
        val4_title: "ਸੁਰੱਖਿਅਤ", val4_sub: "ਸੁਰੱਖਿਅਤ ਪਲੇਟਫਾਰਮ।"
    },
    bho: {
        lang: "भोजपुरी", products: "उत्पाद", sitemap: "साइटमैप", careers: "करियर", coming_soon: "जल्द", built_by: "द्वारा बनावल",
        badge: "एनजीओ सपोर्ट मंच",
        main_title: "जरूरतमंद के\nमदद करीं।",
        main_sub: "एनजीओ आ चैरिटी पंजीकरण जल्द आवत बा।",
        cta_btn: "जल्द जुड़ीं",
        val1_title: "मदद", val1_sub: "आसानी से मदद करीं।",
        val2_title: "जुड़ीं", val2_sub: "एनजीओ खोजीं।",
        val3_title: "भरोसा", val3_sub: "सत्यापित समूह।",
        val4_title: "सुरक्षित", val4_sub: "सुरक्षित मंच।"
    },
    ar: {
        lang: "العربية", products: "المنتجات", sitemap: "خريطة الموقع", careers: "وظائف", coming_soon: "قريباً", built_by: "بواسطة",
        badge: "منصة دعم المنظمات",
        main_title: "مساعدة\nالمحتاجين.",
        main_sub: "تسجيل المنظمات والجمعيات الخيرية - قريباً.",
        cta_btn: "انضم قريباً",
        val1_title: "مساعدة", val1_sub: "ساعد بسهولة.",
        val2_title: "تواصل", val2_sub: "ابحث عن المنظمات.",
        val3_title: "ثقة", val3_sub: "مجموعات معتمدة.",
        val4_title: "آمن", val4_sub: "منصة آمنة."
    },
    es: {
        lang: "Español", products: "Productos", sitemap: "Mapa del sitio", careers: "Carreras", coming_soon: "Pronto", built_by: "Por",
        badge: "Plataforma de ONG",
        main_title: "Ayuda a los\nNecesitados.",
        main_sub: "Registro de ONG y Caridad Próximamente.",
        cta_btn: "Únete Pronto",
        val1_title: "Apoyo", val1_sub: "Ayuda fácilmente.",
        val2_title: "Conectar", val2_sub: "Encuentra ONG.",
        val3_title: "Confianza", val3_sub: "Grupos verificados.",
        val4_title: "Seguro", val4_sub: "Plataforma segura."
    },
    fr: {
        lang: "Français", products: "Produits", sitemap: "Plan du site", careers: "Carrières", coming_soon: "Bientôt", built_by: "Par",
        badge: "Plateforme ONG",
        main_title: "Aidez les\nNécessiteux.",
        main_sub: "Inscription ONG et Association Bientôt.",
        cta_btn: "Rejoignez Bientôt",
        val1_title: "Soutien", val1_sub: "Aidez facilement.",
        val2_title: "Connecter", val2_sub: "Trouvez des ONG.",
        val3_title: "Confiance", val3_sub: "Groupes vérifiés.",
        val4_title: "Sûr", val4_sub: "Plateforme sécurisée."
    },
    de: {
        lang: "Deutsch", products: "Produkte", sitemap: "Sitemap", careers: "Karriere", coming_soon: "Demnächst", built_by: "Von",
        badge: "NGO-Plattform",
        main_title: "Helfen Sie\nBedürftigen.",
        main_sub: "NGO- und Wohltätigkeitsregistrierung Demnächst.",
        cta_btn: "Bald Beitreten",
        val1_title: "Hilfe", val1_sub: "Einfach helfen.",
        val2_title: "Verbinden", val2_sub: "NGOs finden.",
        val3_title: "Vertrauen", val3_sub: "Geprüfte Gruppen.",
        val4_title: "Sicher", val4_sub: "Sichere Plattform."
    }
};

export default function MarketingLanding() {
    const navigate = useNavigate();
    const scrollRef = useRef(null);
    const [lang, setLang] = useState('en');
    const [showLangPrompt, setShowLangPrompt] = useState(false);
    const [showProductsPrompt, setShowProductsPrompt] = useState(false);
    const [showSitemapPrompt, setShowSitemapPrompt] = useState(false);

    // STRICT COLOR VARIABLES (SevaSetu Brand)
    const theme = {
        primary: "#2563EB",    // Service Blue
        bg: "#2563EB",         // Main Background
        text: "#FFFFFF",       // White text for Blue background
        accent: "#FFFFFF",     // White Button for contrast
        accentText: "#2563EB", // Blue text on White Button
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

    const handleWaitlistClick = () => {
        alert(currentT.coming_soon);
    };

    const fadeUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

    return (
        // ABSOLUTE BREAKOUT: fixed inset-0 w-full h-[100dvh] ensures zero black borders and respects mobile address bar
        <div ref={scrollRef} className="fixed inset-0 w-full h-[100dvh] z-[9999] overflow-y-auto overflow-x-hidden font-sans flex flex-col" style={{ backgroundColor: theme.bg, color: theme.text }}>
            
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
                        src="/logo.png" 
                        alt="Movyra Logo" 
                        className="h-8 w-auto mr-[1px]" 
                        onError={(e) => { e.target.style.display = 'none' }} 
                    />
                    <span className="font-black text-[1.5rem] tracking-tighter text-[#FFFFFF]">
                        ovyra <span className="font-medium text-[1rem] ml-1 opacity-90">SevaSetu</span>
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
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/40 mb-8 bg-white/10">
                        <Heart size={16} color="#FFFFFF" fill="#FFFFFF" />
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
                    
                    {/* CTA Button - Primary Button Format (White Background, Service Blue Text) */}
                    <button 
                        onClick={handleWaitlistClick} 
                        style={{ backgroundColor: theme.accent, color: theme.accentText }}
                        className="w-full sm:w-auto px-10 py-4 rounded-xl font-black text-[1.1rem] transition-transform hover:scale-105 outline-none shadow-lg mb-16 flex items-center justify-center gap-2"
                    >
                        {currentT.cta_btn} <ArrowRight size={20} />
                    </button>

                    {/* 2x2 Feature Grid - Strictly positioned below the button, left aligned */}
                    <div className="grid grid-cols-2 gap-x-12 gap-y-10 w-full max-w-[500px]">
                        {[
                            { icon: Heart, title: currentT.val1_title, desc: currentT.val1_sub },
                            { icon: Users, title: currentT.val2_title, desc: currentT.val2_sub },
                            { icon: ShieldCheck, title: currentT.val3_title, desc: currentT.val3_sub },
                            { icon: Home, title: currentT.val4_title, desc: currentT.val4_sub }
                        ].map((item, idx) => (
                            <div key={idx} className="flex flex-col items-start text-left">
                                <div className="w-12 h-12 rounded-full border border-white/30 bg-white/10 flex items-center justify-center mb-3">
                                    <item.icon size={20} color="#FFFFFF" />
                                </div>
                                <h4 className="text-[1.15rem] font-black text-[#FFFFFF] mb-1">{item.title}</h4>
                                <p className="text-[0.9rem] text-[#FFFFFF] opacity-80">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Right Graphic - Custom Helping Hands & NGO Network Animation */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.2 }} className="w-full lg:w-[50%] h-[500px] lg:h-[750px] relative z-0 flex items-center justify-center lg:justify-end xl:pr-12">
                    <svg viewBox="0 0 600 600" className="w-full h-full max-w-[750px] drop-shadow-2xl" fill="none">
                        
                        {/* Background Pulse Circles (Network Reach) */}
                        <motion.circle 
                            cx="300" cy="300" r="180" 
                            stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="10 10"
                            animate={{ rotate: 360 }} 
                            transition={{ duration: 40, repeat: Infinity, ease: "linear" }} 
                        />
                        <motion.circle 
                            cx="300" cy="300" r="120" 
                            fill="rgba(255,255,255,0.05)" 
                            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }} 
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} 
                        />
                        
                        {/* Connecting Network Nodes (Hospitals/NGOs) */}
                        <path d="M 300 300 L 150 150 M 300 300 L 450 150 M 300 300 L 150 450 M 300 300 L 450 450" stroke="rgba(255,255,255,0.2)" strokeWidth="3" strokeLinecap="round" />
                        
                        {/* Outer Nodes */}
                        <circle cx="150" cy="150" r="20" fill="rgba(255,255,255,0.2)" />
                        <circle cx="450" cy="150" r="20" fill="rgba(255,255,255,0.2)" />
                        <circle cx="150" cy="450" r="20" fill="rgba(255,255,255,0.2)" />
                        <circle cx="450" cy="450" r="20" fill="rgba(255,255,255,0.2)" />

                        {/* Animated Pulses on Network Lines (Fixed Framer Motion SVG crash using relative x/y transforms) */}
                        <motion.circle cx="150" cy="150" r="6" fill="#FFFFFF" animate={{ x: [0, 75, 150], y: [0, 75, 150], opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0 }} />
                        <motion.circle cx="450" cy="150" r="6" fill="#FFFFFF" animate={{ x: [0, -75, -150], y: [0, 75, 150], opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} />
                        <motion.circle cx="150" cy="450" r="6" fill="#FFFFFF" animate={{ x: [0, 75, 150], y: [0, -75, -150], opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }} />
                        <motion.circle cx="450" cy="450" r="6" fill="#FFFFFF" animate={{ x: [0, -75, -150], y: [0, -75, -150], opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 1.5 }} />

                        {/* Central Support Icon (Heart in Hands) */}
                        <circle cx="300" cy="300" r="60" fill="#FFFFFF" shadow="0 10px 30px rgba(0,0,0,0.2)" />
                        
                        {/* Heart Shape */}
                        <motion.path 
                            d="M 300 320 C 300 320 270 290 270 275 C 270 260 285 250 300 265 C 315 250 330 260 330 275 C 330 290 300 320 300 320 Z" 
                            fill="#DC2626" 
                            animate={{ scale: [1, 1.15, 1] }} 
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />

                        {/* Supporting Hands Shape below the heart */}
                        <path d="M 260 310 C 270 330 290 340 300 340 C 310 340 330 330 340 310" stroke={theme.primary} strokeWidth="6" strokeLinecap="round" fill="none" />
                        <path d="M 250 315 L 265 315 M 350 315 L 335 315" stroke={theme.primary} strokeWidth="6" strokeLinecap="round" />
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
                                    <button key={option.code} onClick={() => { setLang(option.code); setShowLangPrompt(false); }} className={`w-full p-4 rounded-xl flex items-center justify-between group transition-colors outline-none ${lang === option.code ? 'bg-[#2563EB] text-white border border-[#2563EB]' : 'bg-[#F9FAFB] text-[#111111] border border-[#E0E0E0] hover:border-[#2563EB]'}`}>
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
                                <a href="https://rebrand.ly/mnagriksetu" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center justify-center gap-2 bg-[#F9FAFB] border border-[#E0E0E0] p-6 rounded-2xl hover:border-[#CCCCCC] hover:shadow-sm transition-all text-center w-full outline-none">
                                    <div className="flex items-center gap-0.3">
                                        <img src="/logo-6.png" alt="Movyra" className="h-7 w-auto" onError={(e) => { e.target.style.display = 'none' }} />
                                        <span className="font-black text-[1.4rem] tracking-tighter text-[#111111]">
                                            ovyra <span className="font-medium text-[1.1rem] text-[#666666] ml-1">NagrikSetu</span>
                                        </span>
                                    </div>
                                    <p className="text-[#666666] text-[0.85rem] leading-relaxed mt-1">Citizen grievance & reporting.</p>
                                </a>

                                {/* Movyra SevaSetu */}
                                <Link to="/landing" className="group flex flex-col items-center justify-center gap-2 bg-[#EFF6FF] border-2 border-[#2563EB] p-6 rounded-2xl transition-all text-center w-full outline-none">
                                    <div className="flex items-center gap-0.3">
                                        <img src="/logo-7.png" alt="Movyra" className="h-7 w-auto" onError={(e) => { e.target.style.display = 'none' }} />
                                        <span className="font-black text-[1.4rem] tracking-tighter text-[#2563EB]">
                                            ovyra <span className="font-bold text-[1.1rem] ml-1">SevaSetu</span>
                                        </span>
                                    </div>
                                    <p className="text-[#2563EB] text-[0.85rem] leading-relaxed mt-1 font-medium">NGO & charity support.</p>
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
                                <Link to="/home" className="bg-[#F9FAFB] border border-[#E0E0E0] p-4 rounded-xl font-bold text-[#111111] text-[0.95rem] hover:border-[#2563EB] hover:bg-[#EFF6FF] transition-colors text-left outline-none flex flex-col">
                                    <span>App Home</span>
                                    <span className="text-[#666666] font-normal text-[0.75rem] mt-1">Main screen</span>
                                </Link>
                                <Link to="/report" className="bg-[#F9FAFB] border border-[#E0E0E0] p-4 rounded-xl font-bold text-[#111111] text-[0.95rem] hover:border-[#2563EB] hover:bg-[#EFF6FF] transition-colors text-left outline-none flex flex-col">
                                    <span>Register NGO</span>
                                    <span className="text-[#666666] font-normal text-[0.75rem] mt-1">Join the network</span>
                                </Link>
                                <Link to="/alerts" className="bg-[#F9FAFB] border border-[#E0E0E0] p-4 rounded-xl font-bold text-[#111111] text-[0.95rem] hover:border-[#2563EB] hover:bg-[#EFF6FF] transition-colors text-left outline-none flex flex-col">
                                    <span>Live Map</span>
                                    <span className="text-[#666666] font-normal text-[0.75rem] mt-1">See city support</span>
                                </Link>
                                <Link to="/admin" className="bg-[#F9FAFB] border border-[#E0E0E0] p-4 rounded-xl font-bold text-[#111111] text-[0.95rem] hover:border-[#2563EB] hover:bg-[#EFF6FF] transition-colors text-left outline-none flex flex-col">
                                    <span>Admin Login</span>
                                    <span className="text-[#666666] font-normal text-[0.75rem] mt-1">For organizations</span>
                                </Link>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SEVASETU PREMIUM FOOTER STRICTLY (Responsive fix: flex-wrap, pb-12 for mobile) */}
            <footer className="w-full mt-auto bg-[#1E3A8A] flex flex-col md:flex-row items-center justify-between gap-6 px-6 md:px-12 lg:px-24 py-8 pb-12 border-t border-white/10 relative z-10">
                
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