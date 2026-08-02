import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { useCivicStore } from '../../store/useCivicStore';
import { 
    ArrowLeft, 
    Search, 
    Megaphone, 
    Calendar, 
    ChevronDown, 
    ChevronUp, 
    User, 
    Building,
    Sun,
    Moon,
    Home,
    LogOut,
    X,
    Globe,
    ArrowUp
} from 'lucide-react';

export default function PublicNotices() {
    const navigate = useNavigate();
    
    // 1. STATE MANAGEMENT
    const theme = useCivicStore((state) => state.theme);
    const toggleTheme = useCivicStore((state) => state.toggleTheme);
    const terminateSession = useCivicStore((state) => state.terminateSession);

    const [lang, setLang] = useState('en');
    const [showLangPrompt, setShowLangPrompt] = useState(false);
    
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [notices, setNotices] = useState([]);
    const [filteredNotices, setFilteredNotices] = useState([]);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('All');
    const [expandedNoticeId, setExpandedNoticeId] = useState(null);

    const localCity = "Mumbai";

    // 2. AUTHENTICATION & DATA FETCHING
    useEffect(() => {
        const sysLang = navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'mr', 'gu', 'te', 'ta', 'pa', 'bho', 'ar', 'es', 'fr', 'de'];
        if (supported.includes(sysLang)) setLang(sysLang);

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user);
                await fetchOfficialNotices();
            } else {
                navigate('/civic/auth');
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const fetchOfficialNotices = async () => {
        setIsLoading(true);
        try {
            const noticesRef = collection(db, 'civic_notices');
            const q = query(
                noticesRef, 
                where('status', '==', 'Active'), 
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);
            const records = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setNotices(records);
            setFilteredNotices(records);
        } catch (error) {
            console.error("Failed to retrieve public notices:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // 3. FILTERING LOGIC
    useEffect(() => {
        let result = notices;
        
        if (selectedDepartment !== 'All') {
            result = result.filter(notice => notice.department === selectedDepartment);
        }
        
        if (searchQuery.trim()) {
            const queryLower = searchQuery.toLowerCase();
            result = result.filter(notice => 
                (notice.title && notice.title.toLowerCase().includes(queryLower)) || 
                (notice.description && notice.description.toLowerCase().includes(queryLower))
            );
        }
        
        setFilteredNotices(result);
    }, [searchQuery, selectedDepartment, notices]);

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

    const toggleNotice = (id) => {
        setExpandedNoticeId(expandedNoticeId === id ? null : id);
    };

    // 4. 13-LANGUAGE DICTIONARY (Simple Business Context)
    const t = {
        en: {
            lang: "English", back: "Back", log_out: "Log out", careers: "Careers",
            title: "City Announcements", sub: "View official notices, alerts, and updates from your local administration.",
            search_ph: "Search announcements...", filter_all: "All Departments", 
            empty: "No announcements found.", empty_sub: "There are currently no active notices matching your criteria.",
            lbl_issued: "Issued By", lbl_date: "Date", btn_read: "Read More", btn_close: "Close", loading: "Loading records..."
        },
        hi: {
            lang: "हिन्दी", back: "डैशबोर्ड पर लौटें", log_out: "लॉग आउट", careers: "करियर",
            title: "शहर की घोषणाएं", sub: "अपने स्थानीय प्रशासन से आधिकारिक नोटिस, अलर्ट और अपडेट देखें।",
            search_ph: "घोषणाएं खोजें...", filter_all: "सभी विभाग", 
            empty: "कोई घोषणा नहीं मिली।", empty_sub: "वर्तमान में आपके मानदंडों से मेल खाने वाले कोई सक्रिय नोटिस नहीं हैं।",
            lbl_issued: "जारी कर्ता", lbl_date: "दिनांक", btn_read: "अधिक पढ़ें", btn_close: "बंद करें", loading: "रिकॉर्ड लोड हो रहे हैं..."
        },
        hinglish: {
            lang: "Hinglish", back: "Dashboard par wapas jayein", log_out: "Log out", careers: "Careers",
            title: "City Announcements", sub: "Local administration ke official notices aur updates dekhein.",
            search_ph: "Announcements search karein...", filter_all: "All Departments", 
            empty: "Koi announcement nahi mili.", empty_sub: "Aapke search se match karta koi active notice nahi hai.",
            lbl_issued: "Issued By", lbl_date: "Date", btn_read: "Pura Padhein", btn_close: "Close", loading: "Records load ho rahe hain..."
        },
        mr: {
            lang: "मराठी", back: "डॅशबोर्डवर परत जा", log_out: "लॉग आउट", careers: "करिअर",
            title: "शहराच्या घोषणा", sub: "तुमच्या स्थानिक प्रशासनाकडून अधिकृत नोटीस, सूचना आणि अद्यतने पहा.",
            search_ph: "घोषणा शोधा...", filter_all: "सर्व विभाग", 
            empty: "कोणत्याही घोषणा आढळल्या नाहीत.", empty_sub: "सध्या तुमच्या निकषांशी जुळणाऱ्या कोणत्याही सक्रिय नोटीस नाहीत.",
            lbl_issued: "जारी करणारे", lbl_date: "तारीख", btn_read: "अधिक वाचा", btn_close: "बंद करा", loading: "रेकॉर्ड लोड करत आहे..."
        },
        gu: {
            lang: "ગુજરાતી", back: "ડેશબોર્ડ પર પાછા ફરો", log_out: "લૉગ આઉટ", careers: "કારકિર્દી",
            title: "શહેરની જાહેરાતો", sub: "તમારા સ્થાનિક વહીવટીતંત્ર તરફથી સત્તાવાર સૂચનાઓ, ચેતવણીઓ અને અપડેટ્સ જુઓ.",
            search_ph: "જાહેરાતો શોધો...", filter_all: "તમામ વિભાગો", 
            empty: "કોઈ જાહેરાતો મળી નથી.", empty_sub: "હાલમાં તમારા માપદંડો સાથે મેળ ખાતી કોઈ સક્રિય સૂચનાઓ નથી.",
            lbl_issued: "જારી કરનાર", lbl_date: "તારીખ", btn_read: "વધુ વાંચો", btn_close: "બંધ કરો", loading: "રેકોર્ડ્સ લોડ થઈ રહ્યા છે..."
        },
        te: {
            lang: "తెలుగు", back: "డ్యాష్‌బోర్డ్‌కు తిరిగి వెళ్లండి", log_out: "లాగౌట్", careers: "కెరీర్స్",
            title: "నగర ప్రకటనలు", sub: "మీ స్థానిక పరిపాలన నుండి అధికారిక నోటీసులు, హెచ్చరికలు మరియు నవీకరణలను వీక్షించండి.",
            search_ph: "ప్రకటనలను శోధించండి...", filter_all: "అన్ని విభాగాలు", 
            empty: "ప్రకటనలు కనుగొనబడలేదు.", empty_sub: "ప్రస్తుతం మీ ప్రమాణాలకు సరిపోలే క్రియాశీల నోటీసులు లేవు.",
            lbl_issued: "జారీ చేసిన వారు", lbl_date: "తేదీ", btn_read: "మరింత చదవండి", btn_close: "మూసివేయు", loading: "రికార్డులను లోడ్ చేస్తోంది..."
        },
        ta: {
            lang: "தமிழ்", back: "டாஷ்போர்டுக்குத் திரும்பு", log_out: "வெளியேறு", careers: "தொழில்கள்",
            title: "நகர அறிவிப்புகள்", sub: "உங்கள் உள்ளூர் நிர்வாகத்திடமிருந்து அதிகாரப்பூர்வ அறிவிப்புகள், விழிப்பூட்டல்கள் மற்றும் புதுப்பிப்புகளைக் காண்க.",
            search_ph: "அறிவிப்புகளைத் தேடு...", filter_all: "அனைத்து துறைகளும்", 
            empty: "அறிவிப்புகள் எதுவும் கிடைக்கவில்லை.", empty_sub: "தற்போது உங்கள் அளவுகோல்களுடன் பொருந்தக்கூடிய செயலில் உள்ள அறிவிப்புகள் எதுவும் இல்லை.",
            lbl_issued: "வழங்கியவர்", lbl_date: "தேதி", btn_read: "மேலும் படிக்க", btn_close: "மூடு", loading: "பதிவுகளை ஏற்றுகிறது..."
        },
        pa: {
            lang: "ਪੰਜਾਬੀ", back: "ਡੈਸ਼ਬੋਰਡ 'ਤੇ ਵਾਪਸ ਜਾਓ", log_out: "ਲੌਗ ਆਉਟ", careers: "ਕਰੀਅਰ",
            title: "ਸ਼ਹਿਰ ਦੀਆਂ ਘੋਸ਼ਣਾਵਾਂ", sub: "ਆਪਣੇ ਸਥਾਨਕ ਪ੍ਰਸ਼ਾਸਨ ਤੋਂ ਅਧਿਕਾਰਤ ਨੋਟਿਸ, ਅਲਰਟ ਅਤੇ ਅੱਪਡੇਟ ਦੇਖੋ।",
            search_ph: "ਘੋਸ਼ਣਾਵਾਂ ਖੋਜੋ...", filter_all: "ਸਾਰੇ ਵਿਭਾਗ", 
            empty: "ਕੋਈ ਘੋਸ਼ਣਾਵਾਂ ਨਹੀਂ ਮਿਲੀਆਂ।", empty_sub: "ਵਰਤਮਾਨ ਵਿੱਚ ਤੁਹਾਡੇ ਮਾਪਦੰਡਾਂ ਨਾਲ ਮੇਲ ਖਾਂਦੇ ਕੋਈ ਸਰਗਰਮ ਨੋਟਿਸ ਨਹੀਂ ਹਨ।",
            lbl_issued: "ਜਾਰੀ ਕਰਤਾ", lbl_date: "ਮਿਤੀ", btn_read: "ਹੋਰ ਪੜ੍ਹੋ", btn_close: "ਬੰਦ ਕਰੋ", loading: "ਰਿਕਾਰਡ ਲੋਡ ਕੀਤੇ ਜਾ ਰਹੇ ਹਨ..."
        },
        bho: {
            lang: "भोजपुरी", back: "डैशबोर्ड पर वापस जाईं", log_out: "लॉग आउट", careers: "करियर",
            title: "शहर के घोषणा", sub: "आपन स्थानीय प्रशासन से आधिकारिक नोटिस, अलर्ट आ अपडेट देखीं।",
            search_ph: "घोषणा खोजीं...", filter_all: "सभ विभाग", 
            empty: "कौनो घोषणा ना मिलल।", empty_sub: "वर्तमान में राउर मानदंड से मेल खाए वाला कौनो सक्रिय नोटिस नइखे।",
            lbl_issued: "जारी करे वाला", lbl_date: "तारीख", btn_read: "अउरी पढ़ीं", btn_close: "बंद करीं", loading: "रिकॉर्ड लोड हो रहल बा..."
        },
        ar: {
            lang: "العربية", back: "العودة إلى لوحة القيادة", log_out: "تسجيل الخروج", careers: "الوظائف",
            title: "إعلانات المدينة", sub: "عرض الإشعارات والتنبيهات والتحديثات الرسمية من الإدارة المحلية.",
            search_ph: "البحث في الإعلانات...", filter_all: "جميع الأقسام", 
            empty: "لم يتم العثور على إعلانات.", empty_sub: "لا توجد حاليًا إشعارات نشطة تطابق المعايير الخاصة بك.",
            lbl_issued: "صادر عن", lbl_date: "التاريخ", btn_read: "اقرأ المزيد", btn_close: "إغلاق", loading: "جاري تحميل السجلات..."
        },
        es: {
            lang: "Español", back: "Volver al Tablero", log_out: "Cerrar sesión", careers: "Carreras",
            title: "Anuncios de la Ciudad", sub: "Vea avisos oficiales, alertas y actualizaciones de su administración local.",
            search_ph: "Buscar anuncios...", filter_all: "Todos los Departamentos", 
            empty: "No se encontraron anuncios.", empty_sub: "Actualmente no hay avisos activos que coincidan con sus criterios.",
            lbl_issued: "Emitido Por", lbl_date: "Fecha", btn_read: "Leer Más", btn_close: "Cerrar", loading: "Cargando registros..."
        },
        fr: {
            lang: "Français", back: "Retour au Tableau de bord", log_out: "Se déconnecter", careers: "Carrières",
            title: "Annonces de la Ville", sub: "Consultez les avis officiels, les alertes et les mises à jour de votre administration locale.",
            search_ph: "Rechercher des annonces...", filter_all: "Tous les Départements", 
            empty: "Aucune annonce trouvée.", empty_sub: "Il n'y a actuellement aucun avis actif correspondant à vos critères.",
            lbl_issued: "Publié Par", lbl_date: "Date", btn_read: "Lire la Suite", btn_close: "Fermer", loading: "Chargement des dossiers..."
        },
        de: {
            lang: "Deutsch", back: "Zurück zum Dashboard", log_out: "Abmelden", careers: "Karriere",
            title: "Stadtankündigungen", sub: "Sehen Sie offizielle Mitteilungen, Warnungen und Aktualisierungen Ihrer lokalen Verwaltung.",
            search_ph: "Ankündigungen suchen...", filter_all: "Alle Abteilungen", 
            empty: "Keine Ankündigungen gefunden.", empty_sub: "Derzeit gibt es keine aktiven Mitteilungen, die Ihren Kriterien entsprechen.",
            lbl_issued: "Herausgegeben Von", lbl_date: "Datum", btn_read: "Mehr Lesen", btn_close: "Schließen", loading: "Datensätze werden geladen..."
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

    const departmentOptions = [
        { id: 'All', label: currentT.filter_all },
        { id: 'Road Maintenance', label: 'Roads' },
        { id: 'Sanitation Services', label: 'Sanitation' },
        { id: 'Water Supply', label: 'Water' },
        { id: 'Electrical Grid', label: 'Electricity' },
        { id: 'Public Safety', label: 'Safety' }
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
                            
                            <div className="w-12 h-12 mx-auto rounded-full border flex items-center justify-center mb-4 border-[#333333]">
                                <Globe size={24} stroke={theme === 'light' ? 'black' : 'white'} strokeWidth="1.5" />
                            </div>

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

            <div className="flex-1 max-w-[1000px] w-full mx-auto px-6 md:px-12 pb-12 mt-32 animate-fade">
                
                <button 
                    onClick={() => navigate('/civic')}
                    className={`flex items-center gap-2 mb-10 outline-none font-bold text-[0.9rem] transition-colors ${
                        theme === 'light' ? 'text-[#666666] hover:text-black' : 'text-[#888888] hover:text-white'
                    }`}
                >
                    <ArrowLeft size={16} /> {currentT.back}
                </button>

                <div className="mb-10">
                    <div className={`flex items-center gap-3 mb-4 ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>
                        <Megaphone size={24} className={theme === 'light' ? 'text-black' : 'text-white'} />
                    </div>
                    <h1 className="text-[2.5rem] md:text-[3.5rem] font-black leading-[1.1] tracking-tighter mb-4">
                        {currentT.title}
                    </h1>
                    <p className={`text-[1.1rem] ${theme === 'light' ? 'text-[#555555]' : 'text-[#aaaaaa]'}`}>
                        {currentT.sub}
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col gap-6 mb-10">
                    <div className="relative">
                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555555]" />
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={currentT.search_ph}
                            className={`w-full pl-12 pr-4 py-4 rounded-xl outline-none transition-colors text-[0.95rem] font-bold border ${
                                theme === 'light' ? 'bg-white border-[#cccccc] text-black focus:border-black' : 'bg-[#111111] border-[#333333] text-white focus:border-white'
                            }`}
                        />
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                        {departmentOptions.map((dept) => (
                            <button
                                key={dept.id}
                                onClick={() => setSelectedDepartment(dept.id)}
                                className={`px-4 py-2 rounded-full text-[0.85rem] font-bold transition-colors outline-none border ${
                                    theme === 'light'
                                        ? (selectedDepartment === dept.id ? 'bg-black text-white border-black' : 'bg-white text-[#666666] border-[#cccccc] hover:border-black')
                                        : (selectedDepartment === dept.id ? 'bg-white text-black border-white' : 'bg-[#111111] text-[#888888] border-[#333333] hover:border-white')
                                }`}
                            >
                                {dept.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notices List */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mb-4 ${theme === 'light' ? 'border-black' : 'border-white'}`}></div>
                        <span className={`text-[0.9rem] font-bold ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{currentT.loading}</span>
                    </div>
                ) : filteredNotices.length === 0 ? (
                    <div className={`rounded-3xl p-12 text-center border border-dashed flex flex-col items-center justify-center ${
                        theme === 'light' ? 'bg-white border-[#cccccc]' : 'bg-[#111111] border-[#333333]'
                    }`}>
                        <Megaphone size={48} className={`mb-6 opacity-50 ${theme === 'light' ? 'text-[#cccccc]' : 'text-[#333333]'}`} />
                        <h2 className="text-[1.5rem] font-black tracking-tight mb-2">{currentT.empty}</h2>
                        <p className={`text-[1rem] ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{currentT.empty_sub}</p>
                    </div>
                ) : (
                    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="flex flex-col gap-6">
                        {filteredNotices.map((notice) => {
                            const dateString = notice.createdAt ? notice.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent';
                            const isExpanded = expandedNoticeId === notice.id;
                            
                            return (
                                <motion.div 
                                    variants={itemVariants} 
                                    key={notice.id} 
                                    className={`rounded-2xl border overflow-hidden transition-colors ${
                                        theme === 'light' ? 'bg-white border-[#e0e0e0] hover:border-[#cccccc]' : 'bg-[#111111] border-[#333333] hover:border-[#555555]'
                                    }`}
                                >
                                    <div 
                                        onClick={() => toggleNotice(notice.id)}
                                        className="p-6 md:p-8 cursor-pointer flex flex-col md:flex-row justify-between gap-6"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className={`px-3 py-1 text-[0.75rem] font-black tracking-wider uppercase rounded-full ${
                                                    theme === 'light' ? 'bg-[#f0f0f0] text-[#555555]' : 'bg-[#222222] text-white'
                                                }`}>
                                                    {notice.department || 'General'}
                                                </span>
                                                {notice.priority && (
                                                    <span className={`px-3 py-1 text-[0.75rem] font-black tracking-wider uppercase rounded-full ${
                                                        notice.priority === 'High' ? 'bg-[#ffcccc] text-[#cc0000]' : 
                                                        'bg-[#ffeebb] text-[#cc8800]'
                                                    }`}>
                                                        {notice.priority} Priority
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className={`text-[1.25rem] font-black leading-snug mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>{notice.title}</h3>
                                            
                                            <div className={`text-[0.85rem] font-bold flex items-center gap-2 ${theme === 'light' ? 'text-[#888888]' : 'text-[#888888]'}`}>
                                                <Calendar size={14} /> {dateString}
                                            </div>
                                        </div>

                                        <div className="shrink-0 flex items-center justify-center self-start md:self-center">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${
                                                theme === 'light' ? 'bg-[#f5f5f5] border-[#cccccc] text-black' : 'bg-[#000000] border-[#333333] text-white'
                                            }`}>
                                                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                            </div>
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className={`border-t overflow-hidden ${theme === 'light' ? 'border-[#e0e0e0] bg-[#fcfcfc]' : 'border-[#333333] bg-[#0a0a0a]'}`}
                                            >
                                                <div className="p-6 md:p-8">
                                                    <p className={`text-[0.95rem] leading-relaxed whitespace-pre-wrap mb-8 ${theme === 'light' ? 'text-[#444444]' : 'text-[#cccccc]'}`}>
                                                        {notice.description}
                                                    </p>
                                                    
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-6 border-t border-dashed border-[#333333]">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${theme === 'light' ? 'bg-white border-[#cccccc]' : 'bg-[#111111] border-[#444444]'}`}>
                                                                <User size={16} className={theme === 'light' ? 'text-black' : 'text-white'} />
                                                            </div>
                                                            <div>
                                                                <p className={`text-[0.75rem] font-bold uppercase tracking-wider mb-1 ${theme === 'light' ? 'text-[#888888]' : 'text-[#888888]'}`}>{currentT.lbl_issued}</p>
                                                                <p className={`text-[0.9rem] font-black ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                                                                    {notice.issuedBy || 'Municipal Authority'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={() => toggleNotice(notice.id)}
                                                            className={`px-6 py-2 rounded-xl font-bold text-[0.9rem] transition-colors outline-none border ${
                                                                theme === 'light' ? 'bg-white border-[#cccccc] text-black hover:border-black' : 'bg-[#111111] border-[#444444] text-white hover:border-white'
                                                            }`}
                                                        >
                                                            {currentT.btn_close}
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </div>

            {/* FOOTER ALIGNMENT */}
            <footer className={`w-full mx-auto mt-auto flex flex-col md:flex-row items-center justify-between gap-8 px-8 md:px-16 py-12 border-t opacity-0 animate-fade stagger-3 relative z-10 ${
                theme === 'light' ? 'border-[#e0e0e0] bg-[#ffffff]' : 'border-[#111111] bg-[#050505]'
            }`}>
                <div className="flex flex-wrap items-center gap-6">
                    <button onClick={() => setShowLangPrompt(true)} className={`flex items-center gap-2 text-[0.8rem] font-bold px-3 py-1.5 rounded-full transition-colors border outline-none ${theme === 'light' ? 'border-[#cccccc] hover:border-black text-[#555555]' : 'border-[#333333] hover:border-white text-[#888888]'}`}>
                        <Globe size={14} /> {currentT.lang}
                    </button>
                    <div className={`flex items-center gap-6 ${theme === 'light' ? 'text-[#666666]' : 'text-[#555555]'}`}>
                        <a href="https://www.linkedin.com/company/getmovyra/" target="_blank" rel="noopener noreferrer" className={`transition-colors outline-none ${theme === 'light' ? 'hover:text-black' : 'hover:text-white'}`}>
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        </a>
                        <a href="#youtube" className={`transition-colors outline-none ${theme === 'light' ? 'hover:text-black' : 'hover:text-white'}`}>
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
                        </a>
                        <a href="https://www.instagram.com/getmovyra" target="_blank" rel="noopener noreferrer" className={`transition-colors outline-none ${theme === 'light' ? 'hover:text-black' : 'hover:text-white'}`}>
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                        </a>
                        <a href="#x" className={`transition-colors outline-none ${theme === 'light' ? 'hover:text-black' : 'hover:text-white'}`}>
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.006 4.15H5.078z"/></svg>
                        </a>
                    </div>
                </div>
                
                <div className={`flex flex-col md:flex-row items-center gap-6 text-[0.8rem] font-bold ${theme === 'light' ? 'text-[#666666]' : 'text-[#555555]'}`}>
                    <div className="flex items-center gap-6">
                        <Link to="/careers" className={`transition-colors outline-none ${theme === 'light' ? 'hover:text-black' : 'hover:text-white'}`}>{currentT.careers}</Link>
                        <span className={`w-1 h-1 rounded-full ${theme === 'light' ? 'bg-[#cccccc]' : 'bg-[#333333]'}`}></span>
                        <div className={`flex items-center gap-2 transition-colors cursor-default ${theme === 'light' ? 'hover:text-black' : 'hover:text-white'}`}>
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            {localCity}, IN
                        </div>
                    </div>
                    <span className={`hidden md:block w-1 h-1 rounded-full ${theme === 'light' ? 'bg-[#cccccc]' : 'bg-[#333333]'}`}></span>
                    
                    <div className="flex items-center gap-2 text-[0.75rem] uppercase tracking-wider">
                        Built by 
                        <a href="https://rebrand.ly/aatns" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition-opacity outline-none">
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