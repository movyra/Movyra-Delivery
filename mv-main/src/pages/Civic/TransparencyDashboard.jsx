import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from 'firebase/auth';
import { 
    ArrowLeft, 
    BarChart, 
    CheckCircle, 
    TrendingUp,
    ShieldCheck,
    Sun,
    Moon,
    Home,
    LogOut,
    X,
    Globe,
    ArrowUp
} from 'lucide-react';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import { useCivicStore } from '../../store/useCivicStore';

export default function TransparencyDashboard() {
    const navigate = useNavigate();
    
    // 1. STATE MANAGEMENT
    const theme = useCivicStore((state) => state.theme);
    const toggleTheme = useCivicStore((state) => state.toggleTheme);
    const terminateSession = useCivicStore((state) => state.terminateSession);

    const [lang, setLang] = useState('en');
    const [showLangPrompt, setShowLangPrompt] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    const [performanceMetrics, setPerformanceMetrics] = useState({
        totalVolume: 0,
        resolvedVolume: 0,
        overallResolutionRate: 0,
        departmentStats: {}
    });

    const localCity = "Mumbai";

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            terminateSession();
            navigate('/civic');
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => {
        const sysLang = navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'mr', 'gu', 'te', 'ta', 'pa', 'bho', 'ar', 'es', 'fr', 'de'];
        if (supported.includes(sysLang)) setLang(sysLang);

        const generateLiveAnalytics = async () => {
            setIsLoading(true);
            try {
                const complaintsRef = collection(db, 'civic_complaints');
                const analyticsQuery = query(complaintsRef, orderBy('createdAt', 'desc'), limit(500));
                const snapshot = await getDocs(analyticsQuery);
                
                let total = 0;
                let resolved = 0;
                const departments = {};

                snapshot.forEach((document) => {
                    const data = document.data();
                    const category = data.category || 'Uncategorized Operations';
                    const isCompleted = data.status === 'Completed';

                    total += 1;
                    if (isCompleted) resolved += 1;

                    if (!departments[category]) {
                        departments[category] = { total: 0, resolved: 0 };
                    }
                    
                    departments[category].total += 1;
                    if (isCompleted) {
                        departments[category].resolved += 1;
                    }
                });

                const overallRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

                setPerformanceMetrics({
                    totalVolume: total,
                    resolvedVolume: resolved,
                    overallResolutionRate: overallRate,
                    departmentStats: departments
                });

            } catch (error) {
                console.error("Failed to aggregate live operational analytics:", error);
            } finally {
                setIsLoading(false);
            }
        };

        generateLiveAnalytics();
    }, []);

    // 2. 13-LANGUAGE DICTIONARY (Dashboard Context)
    const t = {
        en: { lang: "English", help: "Help Center", back: "Return to Dashboard", log_out: "Log out", careers: "Careers", title: "Performance Data", sub: "Live data showing city efficiency, department work, and resolution rates.", total: "Total Reports", resolved: "Resolved", eff: "Efficiency Rate", workload: "Work Progress", concluded: "Finished", dpt: "Department Analysis", no_data: "Not enough data to show department metrics.", processing: "Loading live records...", acc: "Public Stats" },
        hi: { lang: "हिन्दी", help: "सहायता केंद्र", back: "डैशबोर्ड पर लौटें", log_out: "लॉग आउट", careers: "करियर", title: "प्रदर्शन डेटा", sub: "शहर की दक्षता, विभाग के काम और समाधान दरों को दिखाने वाला लाइव डेटा।", total: "कुल रिपोर्ट", resolved: "हल किया गया", eff: "दक्षता दर", workload: "कार्य प्रगति", concluded: "समाप्त", dpt: "विभाग विश्लेषण", no_data: "विभाग मेट्रिक्स दिखाने के लिए पर्याप्त डेटा नहीं है।", processing: "लाइव रिकॉर्ड लोड हो रहे हैं...", acc: "सार्वजनिक आंकड़े" },
        hinglish: { lang: "Hinglish", help: "Help Center", back: "Dashboard par wapas jayein", log_out: "Log out", careers: "Careers", title: "Performance Data", sub: "City efficiency, department work, aur resolution rates show karne wala live data.", total: "Total Reports", resolved: "Resolved", eff: "Efficiency Rate", workload: "Work Progress", concluded: "Finished", dpt: "Department Analysis", no_data: "Department metrics show karne ke liye data kafi nahi hai.", processing: "Live records load ho rahe hain...", acc: "Public Stats" },
        mr: { lang: "मराठी", help: "मदत केंद्र", back: "डॅशबोर्डवर परत जा", log_out: "लॉग आउट", careers: "करिअर", title: "कामगिरी डेटा", sub: "शहराची कार्यक्षमता, विभागाचे काम आणि निराकरण दर दर्शवणारा थेट डेटा.", total: "एकूण अहवाल", resolved: "सोडवले", eff: "कार्यक्षमता दर", workload: "कामाची प्रगती", concluded: "पूर्ण झाले", dpt: "विभाग विश्लेषण", no_data: "विभाग मेट्रिक्स दर्शविण्यासाठी पुरेसा डेटा नाही.", processing: "थेट रेकॉर्ड लोड करत आहे...", acc: "सार्वजनिक आकडेवारी" },
        gu: { lang: "ગુજરાતી", help: "મદદ કેન્દ્ર", back: "ડેશબોર્ડ પર પાછા ફરો", log_out: "લૉગ આઉટ", careers: "કારકિર્દી", title: "પ્રદર્શન ડેટા", sub: "શહેરની કાર્યક્ષમતા, વિભાગનું કાર્ય અને ઠરાવ દરો દર્શાવતો લાઇવ ડેટા.", total: "કુલ અહેવાલો", resolved: "ઉકેલાયેલ", eff: "કાર્યક્ષમતા દર", workload: "કાર્ય પ્રગતિ", concluded: "સમાપ્ત", dpt: "વિભાગ વિશ્લેષણ", no_data: "વિભાગ મેટ્રિક્સ બતાવવા માટે પૂરતો ડેટા નથી.", processing: "લાઇવ રેકોર્ડ્સ લોડ થઈ રહ્યાં છે...", acc: "જાહેર આંકડા" },
        te: { lang: "తెలుగు", help: "సహాయ కేంద్రం", back: "డ్యాష్‌బోర్డ్‌కు తిరిగి వెళ్లండి", log_out: "లాగౌట్", careers: "కెరీర్స్", title: "పనితీరు డేటా", sub: "నగర సామర్థ్యం, డిపార్ట్‌మెంట్ పని మరియు రిజల్యూషన్ రేట్లను చూపే ప్రత్యక్ష డేటా.", total: "మొత్తం నివేదికలు", resolved: "పరిష్కరించబడింది", eff: "సమర్థత రేటు", workload: "పని పురోగతి", concluded: "పూర్తయింది", dpt: "విభాగం విశ్లేషణ", no_data: "విభాగం కొలమానాలను చూపించడానికి తగినంత డేటా లేదు.", processing: "ప్రత్యక్ష రికార్డులను లోడ్ చేస్తోంది...", acc: "ప్రజా గణాంకాలు" },
        ta: { lang: "தமிழ்", help: "உதவி மையம்", back: "டாஷ்போர்டுக்குத் திரும்பு", log_out: "வெளியேறு", careers: "தொழில்கள்", title: "செயல்திறன் தரவு", sub: "நகர செயல்திறன், துறை வேலை மற்றும் தீர்வு விகிதங்களைக் காட்டும் நேரடி தரவு.", total: "மொத்த அறிக்கைகள்", resolved: "தீர்க்கப்பட்டது", eff: "செயல்திறன் விகிதம்", workload: "பணி முன்னேற்றம்", concluded: "முடிந்தது", dpt: "துறை பகுப்பாய்வு", no_data: "துறை அளவீடுகளைக் காட்ட போதுமான தரவு இல்லை.", processing: "நேரடி பதிவுகளை ஏற்றுகிறது...", acc: "பொது புள்ளிவிவரங்கள்" },
        pa: { lang: "ਪੰਜਾਬੀ", help: "ਸਹਾਇਤਾ ਕੇਂਦਰ", back: "ਡੈਸ਼ਬੋਰਡ 'ਤੇ ਵਾਪਸ ਜਾਓ", log_out: "ਲੌਗ ਆਉਟ", careers: "ਕਰੀਅਰ", title: "ਪ੍ਰਦਰਸ਼ਨ ਡੇਟਾ", sub: "ਸ਼ਹਿਰ ਦੀ ਕੁਸ਼ਲਤਾ, ਵਿਭਾਗ ਦੇ ਕੰਮ ਅਤੇ ਰੈਜ਼ੋਲਿਊਸ਼ਨ ਦਰਾਂ ਨੂੰ ਦਿਖਾਉਣ ਵਾਲਾ ਲਾਈਵ ਡੇਟਾ।", total: "ਕੁੱਲ ਰਿਪੋਰਟਾਂ", resolved: "ਹੱਲ ਕੀਤਾ ਗਿਆ", eff: "ਕੁਸ਼ਲਤਾ ਦਰ", workload: "ਕੰਮ ਦੀ ਪ੍ਰਗਤੀ", concluded: "ਖਤਮ ਹੋਇਆ", dpt: "ਵਿਭਾਗ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ", no_data: "ਵਿਭਾਗ ਦੇ ਮੈਟ੍ਰਿਕਸ ਦਿਖਾਉਣ ਲਈ ਲੋੜੀਂਦਾ ਡੇਟਾ ਨਹੀਂ ਹੈ।", processing: "ਲਾਈਵ ਰਿਕਾਰਡ ਲੋਡ ਕੀਤੇ ਜਾ ਰਹੇ ਹਨ...", acc: "ਜਨਤਕ ਅੰਕੜੇ" },
        bho: { lang: "भोजपुरी", help: "मदद केंद्र", back: "डैशबोर्ड पर वापस जाईं", log_out: "लॉग आउट", careers: "करियर", title: "प्रदर्शन डेटा", sub: "शहर के दक्षता, विभाग के काम आ समाधान दर के देखावे वाला लाइव डेटा।", total: "कुल रिपोर्ट", resolved: "हल हो गइल", eff: "दक्षता दर", workload: "काम के प्रगति", concluded: "खतम हो गइल", dpt: "विभाग विश्लेषण", no_data: "विभाग मेट्रिक्स देखावे खातिर पर्याप्त डेटा नइखे।", processing: "लाइव रिकॉर्ड लोड हो रहल बा...", acc: "सार्वजनिक आँकड़ा" },
        ar: { lang: "العربية", help: "مركز المساعدة", back: "العودة إلى لوحة القيادة", log_out: "تسجيل الخروج", careers: "الوظائف", title: "بيانات الأداء", sub: "بيانات حية تظهر كفاءة المدينة وعمل الأقسام ومعدلات الحل.", total: "إجمالي التقارير", resolved: "تم الحل", eff: "معدل الكفاءة", workload: "تقدم العمل", concluded: "تم الانتهاء", dpt: "تحليل القسم", no_data: "لا توجد بيانات كافية لإظهار مقاييس القسم.", processing: "تحميل السجلات الحية...", acc: "الإحصاءات العامة" },
        es: { lang: "Español", help: "Centro de ayuda", back: "Volver al Tablero", log_out: "Cerrar sesión", careers: "Carreras", title: "Datos de Rendimiento", sub: "Datos en vivo que muestran la eficiencia de la ciudad, el trabajo del departamento y las tasas de resolución.", total: "Total de Reportes", resolved: "Resueltos", eff: "Tasa de Eficiencia", workload: "Progreso del Trabajo", concluded: "Terminado", dpt: "Análisis del Departamento", no_data: "No hay suficientes datos para mostrar las métricas del departamento.", processing: "Cargando registros en vivo...", acc: "Estadísticas Públicas" },
        fr: { lang: "Français", help: "Centre d'aide", back: "Retour au Tableau de bord", log_out: "Se déconnecter", careers: "Carrières", title: "Données de Performance", sub: "Données en direct montrant l'efficacité de la ville, le travail des départements et les taux de résolution.", total: "Rapports Totaux", resolved: "Résolu", eff: "Taux d'Efficacité", workload: "Progression du Travail", concluded: "Terminé", dpt: "Analyse du Département", no_data: "Pas assez de données pour afficher les métriques du département.", processing: "Chargement des enregistrements en direct...", acc: "Statistiques Publiques" },
        de: { lang: "Deutsch", help: "Hilfezentrum", back: "Zurück zum Dashboard", log_out: "Abmelden", careers: "Karriere", title: "Leistungsdaten", sub: "Live-Daten, die die Effizienz der Stadt, die Arbeit der Abteilungen und die Lösungsraten zeigen.", total: "Gesamtberichte", resolved: "Gelöst", eff: "Effizienzrate", workload: "Arbeitsfortschritt", concluded: "Beendet", dpt: "Abteilungsanalyse", no_data: "Nicht genügend Daten, um Abteilungsmetriken anzuzeigen.", processing: "Live-Aufzeichnungen werden geladen...", acc: "Öffentliche Statistiken" }
    };

    const currentT = t[lang] || t['en'];
    const languageOptions = [
        { code: 'en', label: 'English' }, { code: 'hi', label: 'हिन्दी' }, { code: 'hinglish', label: 'Hinglish' },
        { code: 'mr', label: 'मराठी' }, { code: 'gu', label: 'ગુજરાતી' }, { code: 'te', label: 'తెలుగు' },
        { code: 'ta', label: 'தமிழ்' }, { code: 'pa', label: 'ਪੰਜਾਬੀ' }, { code: 'bho', label: 'भोजपुरी' },
        { code: 'ar', label: 'العربية' }, { code: 'es', label: 'Español' }, { code: 'fr', label: 'Français' },
        { code: 'de', label: 'Deutsch' }
    ];

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };

    return (
        <div className={`min-h-screen font-sans overflow-x-hidden flex flex-col relative transition-colors duration-300 ${
            theme === 'light' ? 'bg-[#f5f5f5] text-[#111111] selection:bg-black selection:text-white' : 'bg-[#050505] text-white selection:bg-white selection:text-black'
        }`}>
            <style>
                {`
                  @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                  .animate-fade { animation: fadeIn 0.8s ease-out forwards; }
                  html { scroll-behavior: smooth; }
                `}
            </style>
            
            {/* TOP HEADER */}
            <header className={`fixed top-0 left-0 right-0 w-full flex items-center justify-between px-6 md:px-12 py-6 animate-fade z-50 transition-colors border-b ${
                theme === 'light' ? 'bg-[#f5f5f5]/90 border-[#e0e0e0] backdrop-blur-md' : 'bg-[#050505]/90 border-[#111111] backdrop-blur-md'
            }`}>
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/civic')}>
                    <img 
                        src={theme === 'light' ? '/logo-3.png' : '/logo.png'} 
                        alt="Movyra" 
                        className="h-8 w-auto" 
                        onError={(e) => e.target.style.display = 'none'} 
                    />
                    <span className="font-black text-[1.5rem] tracking-tighter ml-[-5px]">
                        ovyra <span className={`${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'} font-medium text-[1.2rem] ml-1`}>Civic</span>
                    </span>
                </div>
                
                <div className="flex items-center gap-3 sm:gap-6 text-[0.9rem] font-bold">
                    <button 
                        onClick={handleSignOut} 
                        className={`transition-colors outline-none hidden sm:block ${theme === 'light' ? 'text-[#555555] hover:text-black' : 'text-[#888888] hover:text-white'}`}
                    >
                        {currentT.log_out}
                    </button>
                    
                    <button 
                        onClick={handleSignOut} 
                        className={`p-2 rounded-full transition-colors outline-none block sm:hidden ${theme === 'light' ? 'bg-[#e0e0e0] text-black hover:bg-[#cccccc]' : 'bg-[#222222] text-white hover:bg-[#333333]'}`}
                        aria-label="Log Out"
                    >
                        <LogOut size={18} />
                    </button>

                    <button 
                        onClick={toggleTheme}
                        className={`p-2 rounded-full transition-colors outline-none ${theme === 'light' ? 'bg-[#e0e0e0] text-black hover:bg-[#cccccc]' : 'bg-[#222222] text-white hover:bg-[#333333]'}`}
                        aria-label="Toggle Theme"
                    >
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    </button>

                    <button 
                        onClick={() => navigate('/civic')} 
                        className={`p-2.5 rounded-full flex items-center justify-center transition-colors outline-none border ${
                            theme === 'light' ? 'bg-white border-[#cccccc] text-black hover:border-black' : 'bg-[#111111] border-[#333333] text-white hover:border-white'
                        }`}
                        aria-label="Home"
                    >
                        <Home size={18} />
                    </button>
                </div>
            </header>

            {/* LANGUAGE SELECTOR MODAL */}
            <AnimatePresence>
                {showLangPrompt && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className={`fixed inset-0 z-[9999] backdrop-blur-md flex items-center justify-center p-6 ${theme === 'light' ? 'bg-white/90' : 'bg-black/90'}`}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className={`w-full max-w-[400px] rounded-3xl p-8 flex flex-col shadow-2xl relative max-h-[80vh] overflow-y-auto border ${
                                theme === 'light' ? 'bg-white border-[#e0e0e0]' : 'bg-[#0a0a0a] border-[#222222]'
                            }`}
                        >
                            <button 
                                onClick={() => setShowLangPrompt(false)} 
                                className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center transition-colors ${
                                    theme === 'light' ? 'text-[#888888] hover:text-black' : 'text-[#888888] hover:text-white'
                                }`}
                            >
                                <X size={18} />
                            </button>
                            
                            <h2 className={`text-[1.4rem] font-black tracking-tight mb-6 text-center ${theme === 'light' ? 'text-black' : 'text-white'}`}>Select Language</h2>
                            
                            <div className="flex flex-col gap-2">
                                {languageOptions.map((option) => (
                                    <button 
                                        key={option.code}
                                        onClick={() => { setLang(option.code); setShowLangPrompt(false); }}
                                        className={`w-full p-4 rounded-xl flex items-center justify-between group transition-colors border ${
                                            theme === 'light' 
                                                ? (lang === option.code ? 'bg-[#f0f0f0] border-black' : 'bg-white border-[#e0e0e0] hover:border-black')
                                                : (lang === option.code ? 'bg-[#222222] border-white' : 'bg-[#0a0a0a] border-[#333333] hover:border-white')
                                        }`}
                                    >
                                        <span className={`font-bold text-[1rem] ${
                                            theme === 'light'
                                                ? (lang === option.code ? 'text-black' : 'text-[#666666] group-hover:text-black')
                                                : (lang === option.code ? 'text-white' : 'text-[#888888] group-hover:text-white')
                                        }`}>{option.label}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex-1 max-w-[1200px] w-full mx-auto px-6 md:px-12 pb-12 mt-32 animate-fade">
                <button 
                    onClick={() => navigate('/civic')} 
                    className={`flex items-center gap-2 mb-10 font-bold text-[0.9rem] transition-colors outline-none ${
                        theme === 'light' ? 'text-[#666666] hover:text-black' : 'text-[#888888] hover:text-white'
                    }`}
                >
                    <ArrowLeft size={16} /> {currentT.back}
                </button>

                <motion.div initial="hidden" animate="visible" variants={containerVariants} className="mb-12">
                    <motion.div variants={itemVariants} className={`flex items-center gap-3 mb-4 ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>
                        <BarChart size={20} className={theme === 'light' ? 'text-black' : 'text-white'} />
                        <span className="text-[0.9rem] font-bold tracking-widest uppercase">{currentT.acc}</span>
                    </motion.div>
                    <motion.h1 variants={itemVariants} className="text-[2.5rem] md:text-[3.5rem] font-black leading-[1.1] tracking-tighter mb-4">
                        {currentT.title}
                    </motion.h1>
                    <motion.p variants={itemVariants} className={`text-[1.1rem] max-w-[700px] ${theme === 'light' ? 'text-[#555555]' : 'text-[#aaaaaa]'}`}>
                        {currentT.sub}
                    </motion.p>
                </motion.div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className={`w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mb-4 ${theme === 'light' ? 'border-black' : 'border-white'}`}></div>
                        <p className={`font-bold ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{currentT.processing}</p>
                    </div>
                ) : (
                    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
                        
                        {/* High-Level Executive Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            {[ 
                                { label: currentT.total, val: performanceMetrics.totalVolume, icon: BarChart, color: theme === 'light' ? 'text-black' : 'text-white' }, 
                                { label: currentT.resolved, val: performanceMetrics.resolvedVolume, icon: CheckCircle, color: theme === 'light' ? 'text-[#00aa55]' : 'text-[#00ff88]' }, 
                                { label: currentT.eff, val: `${performanceMetrics.overallResolutionRate}%`, icon: TrendingUp, color: theme === 'light' ? 'text-black' : 'text-white' } 
                            ].map((stat, i) => (
                                <motion.div key={i} variants={itemVariants} className={`rounded-2xl p-8 border ${theme === 'light' ? 'bg-white border-[#e0e0e0]' : 'bg-[#111111] border-[#333333]'}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className={`font-bold text-[0.9rem] uppercase tracking-wider ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{stat.label}</h3>
                                        <stat.icon size={20} className={stat.color} />
                                    </div>
                                    <div className="text-[3rem] font-black leading-none mb-2">{stat.val}</div>
                                    <p className={`text-[0.85rem] font-bold ${theme === 'light' ? 'text-[#555555]' : 'text-[#555555]'}`}>
                                        {i === 0 ? "Documented Reports" : i === 1 ? "Successfully Fixed" : "Aggregate Output"}
                                    </p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Departmental Breakdown */}
                        <motion.h2 variants={itemVariants} className="text-[1.5rem] font-black mb-6 flex items-center gap-2">
                            <ShieldCheck size={24} className={theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'} /> {currentT.dpt}
                        </motion.h2>
                        
                        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Object.entries(performanceMetrics.departmentStats).length === 0 ? (
                                <div className={`col-span-1 md:col-span-2 rounded-2xl p-10 text-center border ${theme === 'light' ? 'bg-white border-[#e0e0e0]' : 'bg-[#111111] border-[#333333]'}`}>
                                    <p className={`font-bold ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{currentT.no_data}</p>
                                </div>
                            ) : (
                                Object.entries(performanceMetrics.departmentStats).map(([department, stats]) => {
                                    const rate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;
                                    return (
                                        <div key={department} className={`rounded-2xl p-6 border ${theme === 'light' ? 'bg-white border-[#e0e0e0]' : 'bg-[#111111] border-[#333333]'}`}>
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className={`font-black text-[1.1rem] ${theme === 'light' ? 'text-black' : 'text-white'}`}>{department}</h3>
                                                <span className={`px-3 py-1 rounded-full text-[0.75rem] font-black tracking-wider uppercase ${
                                                    theme === 'light' ? 'bg-[#f0f0f0] text-black' : 'bg-[#222222] text-white'
                                                }`}>
                                                    {rate}% Resolution
                                                </span>
                                            </div>
                                            
                                            <div className={`flex items-center justify-between text-[0.9rem] font-bold mb-2 ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>
                                                <span>{currentT.workload}</span>
                                                <span>{stats.resolved} / {stats.total} {currentT.concluded}</span>
                                            </div>
                                            
                                            <div className={`w-full rounded-full h-3 overflow-hidden ${theme === 'light' ? 'bg-[#e0e0e0]' : 'bg-[#222222]'}`}>
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-1000 ${theme === 'light' ? 'bg-black' : 'bg-white'}`}
                                                    style={{ width: `${rate}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </div>

            {/* FOOTER ALIGNMENT */}
            <footer className={`w-full mx-auto mt-auto flex flex-col md:flex-row items-center justify-between gap-8 px-8 md:px-16 py-12 border-t opacity-0 animate-fade stagger-3 relative z-10 ${
                theme === 'light' ? 'border-[#e0e0e0] bg-[#ffffff]' : 'border-[#111111] bg-[#050505]'
            }`}>
                <div className="flex flex-wrap items-center gap-6">
                    <button onClick={() => setShowLangPrompt(true)} className={`flex items-center gap-2 text-[0.8rem] font-bold px-3 py-1.5 rounded-full transition-colors border ${theme === 'light' ? 'border-[#cccccc] hover:border-black text-[#555555]' : 'border-[#333333] hover:border-white text-[#888888]'}`}>
                        <Globe size={14} /> {currentT.lang}
                    </button>
                    <div className={`flex items-center gap-6 ${theme === 'light' ? 'text-[#666666]' : 'text-[#555555]'}`}>
                        <a href="https://www.linkedin.com/company/getmovyra/" target="_blank" rel="noopener noreferrer" className={`transition-colors ${theme === 'light' ? 'hover:text-black' : 'hover:text-white'}`}>
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        </a>
                        <a href="#youtube" className={`transition-colors ${theme === 'light' ? 'hover:text-black' : 'hover:text-white'}`}>
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
                        </a>
                        <a href="https://www.instagram.com/getmovyra" target="_blank" rel="noopener noreferrer" className={`transition-colors ${theme === 'light' ? 'hover:text-black' : 'hover:text-white'}`}>
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                        </a>
                        <a href="#x" className={`transition-colors ${theme === 'light' ? 'hover:text-black' : 'hover:text-white'}`}>
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.006 4.15H5.078z"/></svg>
                        </a>
                    </div>
                </div>
                
                <div className={`flex flex-col md:flex-row items-center gap-6 text-[0.8rem] font-bold ${theme === 'light' ? 'text-[#666666]' : 'text-[#555555]'}`}>
                    <div className="flex items-center gap-6">
                        <Link to="/careers" className={`transition-colors ${theme === 'light' ? 'hover:text-black' : 'hover:text-white'}`}>{currentT.careers}</Link>
                        <span className={`w-1 h-1 rounded-full ${theme === 'light' ? 'bg-[#cccccc]' : 'bg-[#333333]'}`}></span>
                        <div className={`flex items-center gap-2 transition-colors cursor-default ${theme === 'light' ? 'hover:text-black' : 'hover:text-white'}`}>
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            {localCity}, IN
                        </div>
                    </div>
                    <span className={`hidden md:block w-1 h-1 rounded-full ${theme === 'light' ? 'bg-[#cccccc]' : 'bg-[#333333]'}`}></span>
                    <div className="flex items-center gap-2 text-[0.75rem] uppercase tracking-wider">
                        Built by 
                        <a href="https://rebrand.ly/aatns" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition-opacity">
                            <img 
                                src={theme === 'light' ? '/aat2.png' : '/aat.png'} 
                                alt="AnyAstro" 
                                className="h-4 w-auto object-contain" 
                                onError={(e) => { e.target.style.display = 'none'; e.target.insertAdjacentHTML('afterend', '<span class="underline">AnyAstro</span>'); }} 
                            />
                        </a>
                    </div>
                    <button onClick={scrollToTop} className={`p-2 rounded-full transition-colors border outline-none ${theme === 'light' ? 'bg-[#f5f5f5] border-[#cccccc] hover:bg-[#e0e0e0]' : 'bg-[#111111] border-[#333333] hover:bg-[#222222]'}`}>
                        <ArrowUp size={16} />
                    </button>
                </div>
            </footer>
        </div>
    );
}