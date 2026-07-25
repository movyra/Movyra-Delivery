import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShieldCheck, 
    AlertTriangle, 
    Activity, 
    Map, 
    BarChart3, 
    ArrowRight, 
    ArrowLeft,
    X,
    Sun,
    Moon
} from 'lucide-react';
import { useCivicStore } from '../../store/useCivicStore';

export default function CivicOnboarding() {
    const navigate = useNavigate();
    
    // State and Store Configuration
    const theme = useCivicStore((state) => state.theme);
    const toggleTheme = useCivicStore((state) => state.toggleTheme);
    const completeOnboarding = useCivicStore((state) => state.completeOnboarding);
    
    const [currentSlide, setCurrentSlide] = useState(0);
    const [lang, setLang] = useState('en');
    const [showLangPrompt, setShowLangPrompt] = useState(false);

    useEffect(() => {
        const sysLang = navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'mr', 'gu', 'te', 'ta', 'pa', 'bho', 'ar', 'es', 'fr', 'de'];
        if (supported.includes(sysLang)) setLang(sysLang);
    }, []);

    // 13-Language Onboarding Dictionary (Minimal & Simple)
    const t = {
        en: {
            lang: "EN", skip: "Skip", finish: "Start",
            s1_title: "Report Issues Fast", s1_desc: "See a problem in your city? Tell us what is wrong and where it is.",
            s2_title: "Track Progress", s2_desc: "Watch your report move from open to solved in real time.",
            s3_title: "View the Map", s3_desc: "See active issues in your neighborhood on a live map.",
            s4_title: "Check Results", s4_desc: "Look at how fast the city fixes problems in your area.",
            s5_title: "Safe & Secure", s5_desc: "Your data is protected. Only approved officials can see sensitive details."
        },
        hi: {
            lang: "HI", skip: "छोड़ें", finish: "शुरू करें",
            s1_title: "समस्याएं जल्दी बताएं", s1_desc: "अपने शहर में कोई समस्या देखें? हमें बताएं कि क्या और कहां गलत है।",
            s2_title: "प्रगति देखें", s2_desc: "अपनी रिपोर्ट को हल होते हुए लाइव देखें।",
            s3_title: "नक्शा देखें", s3_desc: "एक लाइव मैप पर अपने आस-पड़ोस की सक्रिय समस्याएं देखें।",
            s4_title: "परिणाम जांचें", s4_desc: "देखें कि शहर आपके क्षेत्र में कितनी जल्दी काम करता है।",
            s5_title: "सुरक्षित", s5_desc: "आपका डेटा सुरक्षित है। केवल अधिकारी ही महत्वपूर्ण विवरण देख सकते हैं।"
        },
        hinglish: {
            lang: "HIN", skip: "Skip", finish: "Start Karein",
            s1_title: "Issues Jaldi Report Karein", s1_desc: "City me koi problem hai? Humein batayein kya aur kahan galat hai.",
            s2_title: "Progress Track Karein", s2_desc: "Apni report ko solve hote hue live dekhein.",
            s3_title: "Map Dekhein", s3_desc: "Live map par apne area ke active issues dekhein.",
            s4_title: "Results Check Karein", s4_desc: "Dekhein city kitni jaldi aapke area me kaam karti hai.",
            s5_title: "Safe & Secure", s5_desc: "Aapka data safe hai. Sirf officials hi sensitive details dekh sakte hain."
        },
        mr: {
            lang: "MR", skip: "वगळा", finish: "सुरू करा",
            s1_title: "समस्या लवकर नोंदवा", s1_desc: "तुमच्या शहरात समस्या दिसली? आम्हाला सांगा काय आणि कुठे चुकीचे आहे.",
            s2_title: "प्रगती पहा", s2_desc: "तुमचा अहवाल सोडवला जात असताना थेट पहा.",
            s3_title: "नकाशा पहा", s3_desc: "थेट नकाशावर तुमच्या शेजारील सक्रिय समस्या पहा.",
            s4_title: "निकाल तपासा", s4_desc: "शहर तुमच्या भागात किती वेगाने काम करते ते पहा.",
            s5_title: "सुरक्षित", s5_desc: "तुमचा डेटा सुरक्षित आहे. केवळ अधिकारीच महत्त्वाचे तपशील पाहू शकतात."
        },
        gu: {
            lang: "GU", skip: "છોડી દો", finish: "શરૂ કરો",
            s1_title: "સમસ્યાઓ જલ્દી જણાવો", s1_desc: "તમારા શહેરમાં કોઈ સમસ્યા દેખાય છે? અમને કહો કે શું અને ક્યાં ખોટું છે.",
            s2_title: "પ્રગતિ જુઓ", s2_desc: "તમારો રિપોર્ટ ઉકેલાઈ રહ્યો હોય ત્યારે લાઈવ જુઓ.",
            s3_title: "નકશો જુઓ", s3_desc: "લાઈવ મેપ પર તમારા વિસ્તારની સક્રિય સમસ્યાઓ જુઓ.",
            s4_title: "પરિણામો તપાસો", s4_desc: "જુઓ કે શહેર તમારા વિસ્તારમાં કેટલી ઝડપથી કામ કરે છે.",
            s5_title: "સુરક્ષિત", s5_desc: "તમારો ડેટા સુરક્ષિત છે. માત્ર અધિકારીઓ જ મહત્વપૂર્ણ વિગતો જોઈ શકે છે."
        },
        te: {
            lang: "TE", skip: "దాటవేయి", finish: "ప్రారంభించండి",
            s1_title: "సమస్యలను త్వరగా నివేదించండి", s1_desc: "మీ నగరంలో సమస్య కనిపించిందా? ఏమి మరియు ఎక్కడ తప్పు జరిగిందో చెప్పండి.",
            s2_title: "పురోగతిని ట్రాక్ చేయండి", s2_desc: "మీ నివేదిక పరిష్కరించబడుతున్నప్పుడు ప్రత్యక్షంగా చూడండి.",
            s3_title: "మ్యాప్‌ని చూడండి", s3_desc: "లైవ్ మ్యాప్‌లో మీ ప్రాంతంలోని చురుకైన సమస్యలను చూడండి.",
            s4_title: "ఫలితాలను తనిఖీ చేయండి", s4_desc: "నగరం మీ ప్రాంతంలో ఎంత వేగంగా పనిచేస్తుందో చూడండి.",
            s5_title: "సురక్షితం", s5_desc: "మీ డేటా సురక్షితం. అధికారులు మాత్రమే ముఖ్యమైన వివరాలను చూడగలరు."
        },
        ta: {
            lang: "TA", skip: "தவிர்", finish: "தொடங்கு",
            s1_title: "பிரச்சனைகளை விரைவாக புகாரளிக்கவும்", s1_desc: "உங்கள் நகரத்தில் பிரச்சனை உள்ளதா? என்ன, எங்கே தவறு என்று எங்களிடம் கூறுங்கள்.",
            s2_title: "முன்னேற்றத்தைக் கண்காணிக்கவும்", s2_desc: "உங்கள் அறிக்கை தீர்க்கப்படுவதை நேரடியாகப் பாருங்கள்.",
            s3_title: "வரைபடத்தைப் பார்க்கவும்", s3_desc: "உங்கள் பகுதியில் உள்ள பிரச்சனைகளை நேரடி வரைபடத்தில் பார்க்கவும்.",
            s4_title: "முடிவுகளைச் சரிபார்க்கவும்", s4_desc: "உங்கள் பகுதியில் நகரம் எவ்வளவு வேகமாக வேலை செய்கிறது என்பதைப் பாருங்கள்.",
            s5_title: "பாதுகாப்பானது", s5_desc: "உங்கள் தரவு பாதுகாப்பானது. அதிகாரிகள் மட்டுமே முக்கிய விவரங்களைப் பார்க்க முடியும்."
        },
        pa: {
            lang: "PA", skip: "ਛੱਡੋ", finish: "ਸ਼ੁਰੂ ਕਰੋ",
            s1_title: "ਸਮੱਸਿਆਵਾਂ ਦੀ ਜਲਦੀ ਰਿਪੋਰਟ ਕਰੋ", s1_desc: "ਆਪਣੇ ਸ਼ਹਿਰ ਵਿੱਚ ਕੋਈ ਸਮੱਸਿਆ ਦੇਖੋ? ਸਾਨੂੰ ਦੱਸੋ ਕੀ ਅਤੇ ਕਿੱਥੇ ਗਲਤ ਹੈ।",
            s2_title: "ਤਰੱਕੀ ਦੇਖੋ", s2_desc: "ਆਪਣੀ ਰਿਪੋਰਟ ਨੂੰ ਹੱਲ ਹੁੰਦੇ ਹੋਏ ਲਾਈਵ ਦੇਖੋ।",
            s3_title: "ਨਕਸ਼ਾ ਦੇਖੋ", s3_desc: "ਲਾਈਵ ਮੈਪ 'ਤੇ ਆਪਣੇ ਇਲਾਕੇ ਦੀਆਂ ਸਰਗਰਮ ਸਮੱਸਿਆਵਾਂ ਦੇਖੋ।",
            s4_title: "ਨਤੀਜੇ ਚੈੱਕ ਕਰੋ", s4_desc: "ਦੇਖੋ ਕਿ ਸ਼ਹਿਰ ਤੁਹਾਡੇ ਖੇਤਰ ਵਿੱਚ ਕਿੰਨੀ ਤੇਜ਼ੀ ਨਾਲ ਕੰਮ ਕਰਦਾ ਹੈ।",
            s5_title: "ਸੁਰੱਖਿਅਤ", s5_desc: "ਤੁਹਾਡਾ ਡੇਟਾ ਸੁਰੱਖਿਅਤ ਹੈ। ਸਿਰਫ਼ ਅਧਿਕਾਰੀ ਹੀ ਅਹਿਮ ਵੇਰਵੇ ਦੇਖ ਸਕਦੇ ਹਨ।"
        },
        bho: {
            lang: "BHO", skip: "छोड़ीं", finish: "शुरू करीं",
            s1_title: "समस्या जल्दी बताईं", s1_desc: "आपन शहर में कवनो समस्या देखल? हमनी के बताईं का आ कहाँ गलत बा।",
            s2_title: "प्रगति देखीं", s2_desc: "आपन रिपोर्ट के हल होत लाइव देखीं।",
            s3_title: "नक्शा देखीं", s3_desc: "लाइव मैप पर आपन इलाका के सक्रिय समस्या देखीं।",
            s4_title: "परिणाम जाँचीं", s4_desc: "देखीं शहर रउआ इलाका में केतना जल्दी काम करेला।",
            s5_title: "सुरक्षित", s5_desc: "राउर डेटा सुरक्षित बा। खाली अधिकारी लोग ही महत्वपूर्ण विवरण देख सकेला।"
        },
        ar: {
            lang: "AR", skip: "تخطى", finish: "ابدأ",
            s1_title: "الإبلاغ بسرعة", s1_desc: "هل ترى مشكلة في مدينتك؟ أخبرنا ما هو الخطأ وأين.",
            s2_title: "تتبع التقدم", s2_desc: "شاهد تقريرك يتم حله في الوقت الفعلي.",
            s3_title: "عرض الخريطة", s3_desc: "شاهد المشكلات النشطة في منطقتك على خريطة حية.",
            s4_title: "تحقق من النتائج", s4_desc: "انظر مدى سرعة إصلاح المدينة للمشاكل في منطقتك.",
            s5_title: "آمن ومحمي", s5_desc: "بياناتك محمية. يمكن للمسؤولين فقط رؤية التفاصيل."
        },
        es: {
            lang: "ES", skip: "Omitir", finish: "Empezar",
            s1_title: "Reporte Rápido", s1_desc: "¿Ve un problema en su ciudad? Díganos qué y dónde está.",
            s2_title: "Siga el Progreso", s2_desc: "Vea cómo se resuelve su informe en tiempo real.",
            s3_title: "Ver el Mapa", s3_desc: "Vea los problemas activos en su área en un mapa en vivo.",
            s4_title: "Revise los Resultados", s4_desc: "Vea qué tan rápido repara la ciudad los problemas.",
            s5_title: "Seguro y Protegido", s5_desc: "Sus datos están protegidos. Solo los oficiales pueden ver detalles."
        },
        fr: {
            lang: "FR", skip: "Passer", finish: "Démarrer",
            s1_title: "Signalez Rapidement", s1_desc: "Un problème dans votre ville ? Dites-nous quoi et où.",
            s2_title: "Suivez les Progrès", s2_desc: "Regardez votre signalement être résolu en temps réel.",
            s3_title: "Voir la Carte", s3_desc: "Visualisez les problèmes de votre quartier sur une carte.",
            s4_title: "Vérifiez les Résultats", s4_desc: "Voyez à quelle vitesse la ville répare les problèmes.",
            s5_title: "Sécurisé", s5_desc: "Vos données sont protégées. Seuls les officiels y ont accès."
        },
        de: {
            lang: "DE", skip: "Überspringen", finish: "Starten",
            s1_title: "Schnell Melden", s1_desc: "Ein Problem in der Stadt? Sagen Sie uns was und wo.",
            s2_title: "Fortschritt Verfolgen", s2_desc: "Sehen Sie in Echtzeit, wie Ihr Bericht gelöst wird.",
            s3_title: "Karte Ansehen", s3_desc: "Sehen Sie aktive Probleme in Ihrer Nähe auf der Karte.",
            s4_title: "Ergebnisse Prüfen", s4_desc: "Sehen Sie, wie schnell die Stadt Probleme behebt.",
            s5_title: "Sicher", s5_desc: "Ihre Daten sind geschützt. Nur Beamte sehen Details."
        }
    };

    const currentT = t[lang] || t['en'];
    const languageOptions = [
        { code: 'en', label: 'English' }, { code: 'hi', label: 'हिन्दी' }, { code: 'hinglish', label: 'Hinglish' },
        { code: 'mr', label: 'मराठी' }, { code: 'gu', label: 'ગુજરાતી' }, { code: 'te', label: 'తెలుగు' },
        { code: 'ta', label: 'தமிழ்' }, { code: 'pa', label: 'ਪੰਜਾਬੀ' }, { code: 'bho', label: 'भोजपुरी' },
        { code: 'ar', label: 'العربية' }, { code: 'es', label: 'Español' }, { code: 'fr', label: 'Français' },
        { code: 'de', label: 'Deutsch' }
    ];

    const slideData = [
        { title: currentT.s1_title, desc: currentT.s1_desc, icon: AlertTriangle, color: "text-blue-500" },
        { title: currentT.s2_title, desc: currentT.s2_desc, icon: Activity, color: "text-emerald-500" },
        { title: currentT.s3_title, desc: currentT.s3_desc, icon: Map, color: "text-purple-500" },
        { title: currentT.s4_title, desc: currentT.s4_desc, icon: BarChart3, color: "text-amber-500" },
        { title: currentT.s5_title, desc: currentT.s5_desc, icon: ShieldCheck, color: "text-red-500" }
    ];

    const executeExit = () => {
        completeOnboarding();
        navigate('/civic/dashboard'); // Strictly routes to dashboard after completion
    };

    const handleNext = () => {
        if (currentSlide < slideData.length - 1) setCurrentSlide(prev => prev + 1);
        else executeExit();
    };

    const handlePrev = () => {
        if (currentSlide > 0) setCurrentSlide(prev => prev - 1);
    };

    // Swipe handler for Framer Motion drag end
    const handleDragEnd = (event, info) => {
        const threshold = 50; // Minimum swipe distance
        if (info.offset.x < -threshold) {
            handleNext(); // Swiped left -> Go Next
        } else if (info.offset.x > threshold) {
            handlePrev(); // Swiped right -> Go Prev
        }
    };

    const ActiveIcon = slideData[currentSlide].icon;

    return (
        <div className={`fixed inset-0 w-full h-full font-sans overflow-hidden flex flex-col transition-colors duration-300 ${
            theme === 'light' ? 'bg-[#ffffff] text-[#111111]' : 'bg-[#000000] text-white'
        }`}>
            
            {/* FLOATING UTILITY CONTROLS (Moved Logo Here) */}
            <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-50">
                <div className="flex items-center gap-2">
                    <button onClick={() => setShowLangPrompt(true)} className={`font-black text-[0.8rem] px-3 py-1.5 rounded-full transition-colors border ${theme === 'light' ? 'border-[#cccccc] hover:border-black' : 'border-[#333333] hover:border-white'}`}>
                        {currentT.lang}
                    </button>
                    <button onClick={toggleTheme} className={`p-1.5 rounded-full transition-colors ${theme === 'light' ? 'bg-[#f0f0f0] hover:bg-[#e0e0e0]' : 'bg-[#1a1a1a] hover:bg-[#333333]'}`}>
                        {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                    </button>
                </div>
                
                {/* CENTERED LOGO (Moved up & larger) */}
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 z-40">
                    <img src={theme === 'light' ? '/logo-3.png' : '/logo.png'} alt="Movyra" className="h-8 w-auto" onError={(e) => e.target.style.display = 'none'} />
                    <span className="font-black text-[1.5rem] tracking-tighter ml-[-5px]">
                        ovyra <span className={`${theme === 'light' ? 'text-[#888888]' : 'text-[#666666]'} font-medium text-[1.1rem] ml-0.5`}>Civic</span>
                    </span>
                </div>

                <button onClick={executeExit} className={`font-black text-[0.85rem] transition-colors ${theme === 'light' ? 'text-[#888888] hover:text-black' : 'text-[#666666] hover:text-white'}`}>
                    {currentT.skip}
                </button>
            </div>

            {/* TRANSLATION MODAL */}
            <AnimatePresence>
                {showLangPrompt && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`fixed inset-0 z-[60] backdrop-blur-md flex items-center justify-center p-6 ${theme === 'light' ? 'bg-white/90' : 'bg-black/90'}`}>
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className={`w-full max-w-[400px] rounded-3xl p-8 flex flex-col shadow-2xl relative border ${theme === 'light' ? 'bg-white border-[#e0e0e0]' : 'bg-[#0a0a0a] border-[#222222]'}`}>
                            <button onClick={() => setShowLangPrompt(false)} className="absolute top-4 right-4 p-2"><X size={18} /></button>
                            <h2 className="text-[1.4rem] font-black tracking-tight mb-6 text-center">Language</h2>
                            <div className="flex flex-col gap-2 max-h-[45vh] overflow-y-auto">
                                {languageOptions.map((option) => (
                                    <button 
                                        key={option.code}
                                        onClick={() => { setLang(option.code); setShowLangPrompt(false); }}
                                        className={`w-full p-4 rounded-xl flex items-center justify-between font-bold text-[0.95rem] transition-colors border ${theme === 'light' ? (lang === option.code ? 'bg-black text-white border-black' : 'bg-[#f5f5f5] text-[#555555] border-transparent hover:border-black') : (lang === option.code ? 'bg-white text-black border-white' : 'bg-[#111111] text-[#aaaaaa] border-transparent hover:border-white')}`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FULLSCREEN DRAGGABLE PRESENTATION */}
            <motion.div 
                className="flex-1 flex items-center justify-center w-full px-6 cursor-grab active:cursor-grabbing"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
            >
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={currentSlide}
                        initial={{ opacity: 0, scale: 0.9, x: 50 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9, x: -50 }}
                        transition={{ duration: 0.4 }}
                        className="flex flex-col items-center text-center max-w-[400px]"
                    >
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 border-2 shadow-2xl ${
                            theme === 'light' ? 'bg-[#f5f5f5] border-[#e0e0e0]' : 'bg-[#0a0a0a] border-[#222222]'
                        }`}>
                            <ActiveIcon size={40} className={slideData[currentSlide].color} />
                        </div>

                        <h1 className="text-[2.2rem] md:text-[2.5rem] font-black tracking-tighter leading-tight mb-4">
                            {slideData[currentSlide].title}
                        </h1>

                        <p className={`text-[1.1rem] leading-relaxed ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>
                            {slideData[currentSlide].desc}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </motion.div>

            {/* BOTTOM NAVIGATION MODULE */}
            <div className="w-full px-6 md:px-12 pb-12 pt-6 flex flex-col items-center gap-8 z-40">
                {/* Dots */}
                <div className="flex items-center gap-3">
                    {slideData.map((_, idx) => (
                        <div 
                            key={idx}
                            className={`h-2 rounded-full transition-all duration-300 ${
                                idx === currentSlide 
                                    ? (theme === 'light' ? 'w-8 bg-black' : 'w-8 bg-white') 
                                    : (theme === 'light' ? 'w-2 bg-[#cccccc]' : 'w-2 bg-[#333333]')
                            }`}
                        />
                    ))}
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-between w-full max-w-[400px]">
                    <button 
                        onClick={handlePrev} 
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-opacity ${currentSlide === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'} ${theme === 'light' ? 'bg-[#f0f0f0] text-black hover:bg-[#e0e0e0]' : 'bg-[#1a1a1a] text-white hover:bg-[#333333]'}`}
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <button
                        onClick={handleNext}
                        className={`px-8 py-4 rounded-full font-black text-[1rem] flex items-center gap-2 transition-colors outline-none shadow-xl ${
                            theme === 'light' ? 'bg-black text-white hover:bg-[#333333]' : 'bg-white text-black hover:bg-[#cccccc]'
                        }`}
                    >
                        {currentSlide === slideData.length - 1 ? currentT.finish : currentT.next}
                        {currentSlide !== slideData.length - 1 && <ArrowRight size={18} />}
                    </button>
                </div>
            </div>
            
            {/* Background Gradient */}
            <div className={`absolute bottom-0 left-0 w-full h-[50vh] z-0 pointer-events-none bg-gradient-to-t ${
                theme === 'light' ? 'from-white via-white/80 to-transparent' : 'from-black via-black/80 to-transparent'
            }`}></div>
        </div>
    );
}