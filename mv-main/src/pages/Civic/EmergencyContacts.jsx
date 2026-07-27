import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { useCivicStore } from '../../store/useCivicStore';
import { 
    ArrowLeft, 
    Search, 
    Phone, 
    ShieldAlert, 
    Building, 
    Activity,
    Sun,
    Moon,
    Home,
    LogOut,
    X,
    Globe,
    ArrowUp,
    ShieldCheck,
    ArrowRight
} from 'lucide-react';

export default function EmergencyContacts() {
    const navigate = useNavigate();
    
    // 1. STATE MANAGEMENT
    const theme = useCivicStore((state) => state.theme);
    const toggleTheme = useCivicStore((state) => state.toggleTheme);
    const terminateSession = useCivicStore((state) => state.terminateSession);

    const [lang, setLang] = useState('en');
    const [showLangPrompt, setShowLangPrompt] = useState(false);
    const [showProductsPrompt, setShowProductsPrompt] = useState(false);
    
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedWard, setSelectedWard] = useState('All');

    const localCity = "Mumbai";

    // 2. AUTHENTIC REAL-WORLD DATA MATRIX (Mumbai Base)
    const publicDirectory = [
        { id: '1', department: 'Central Command', name: 'National Emergency', phone: '112', ward: 'All', status: 'Active' },
        { id: '2', department: 'Law Enforcement', name: 'City Police Control Room', phone: '100', ward: 'All', status: 'Active' },
        { id: '3', department: 'Medical Response', name: 'Central Ambulance', phone: '108', ward: 'All', status: 'Active' },
        { id: '4', department: 'Fire Response', name: 'Fire Brigade', phone: '101', ward: 'All', status: 'Active' },
        { id: '5', department: 'Municipal Authority', name: 'Disaster Management', phone: '1916', ward: 'All', status: 'Active' },
        { id: '6', department: 'Public Safety', name: 'Women Support Desk', phone: '1091', ward: 'All', status: 'Active' },
        { id: '7', department: 'Law Enforcement', name: 'Highway Traffic Control', phone: '103', ward: 'All', status: 'Active' },
        { id: '8', department: 'Municipal Authority', name: 'Zone A Control (Colaba)', phone: '02222624000', ward: 'Zone A', status: 'Active' },
        { id: '9', department: 'Municipal Authority', name: 'Zone G Control (Prabhadevi)', phone: '02224305031', ward: 'Zone G', status: 'Active' },
        { id: '10', department: 'Municipal Authority', name: 'Zone K Control (Andheri)', phone: '02226239499', ward: 'Zone K', status: 'Active' }
    ];

    // 3. AUTHENTICATION & INITIALIZATION
    useEffect(() => {
        const sysLang = navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'mr', 'gu', 'te', 'ta', 'pa', 'bho', 'ar', 'es', 'fr', 'de'];
        if (supported.includes(sysLang)) setLang(sysLang);

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUser(user);
            } else {
                navigate('/civic/auth');
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [navigate]);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            terminateSession();
            navigate('/civic/home');
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 4. FILTERING LOGIC
    const filteredDirectory = publicDirectory.filter(contact => {
        const matchesWard = selectedWard === 'All' || contact.ward === selectedWard || contact.ward === 'All';
        const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              contact.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              contact.phone.includes(searchQuery);
        return matchesWard && matchesSearch;
    });

    // 5. 13-LANGUAGE DICTIONARY (Simple Consumer Context)
    const t = {
        en: {
            lang: "English", back: "Return to Dashboard", log_out: "Log out", careers: "Careers", products: "Products",
            title: "Emergency Directory", sub: "Direct lines to local authorities and rapid response units.",
            search_ph: "Search service or department...", filter_all: "All Zones",
            btn_call: "Call Now", status_active: "Active", loading: "Loading directory...", empty: "No contacts found.", empty_sub: "Try adjusting your search criteria.",
            lbl_dept: "Department", lbl_zone: "Zone"
        },
        hi: {
            lang: "हिन्दी", back: "डैशबोर्ड पर लौटें", log_out: "लॉग आउट", careers: "करियर", products: "उत्पाद",
            title: "आपातकालीन निर्देशिका", sub: "स्थानीय अधिकारियों और त्वरित प्रतिक्रिया इकाइयों के लिए सीधी लाइनें।",
            search_ph: "सेवा या विभाग खोजें...", filter_all: "सभी ज़ोन",
            btn_call: "अभी कॉल करें", status_active: "सक्रिय", loading: "निर्देशिका लोड हो रही है...", empty: "कोई संपर्क नहीं मिला।", empty_sub: "अपना खोज मानदंड बदलने का प्रयास करें।",
            lbl_dept: "विभाग", lbl_zone: "ज़ोन"
        },
        hinglish: {
            lang: "Hinglish", back: "Dashboard par wapas", log_out: "Log out", careers: "Careers", products: "Products",
            title: "Emergency Directory", sub: "Local authorities aur rapid response units ke direct numbers.",
            search_ph: "Service ya department search karein...", filter_all: "All Zones",
            btn_call: "Call Karein", status_active: "Active", loading: "Directory load ho rahi hai...", empty: "Koi contact nahi mila.", empty_sub: "Search criteria change karke try karein.",
            lbl_dept: "Department", lbl_zone: "Zone"
        },
        mr: {
            lang: "मराठी", back: "डॅशबोर्डवर परत जा", log_out: "लॉग आउट", careers: "करिअर", products: "उत्पादने",
            title: "आपत्कालीन निर्देशिका", sub: "स्थानिक अधिकारी आणि जलद प्रतिसाद युनिट्ससाठी थेट क्रमांक.",
            search_ph: "सेवा किंवा विभाग शोधा...", filter_all: "सर्व झोन",
            btn_call: "आता कॉल करा", status_active: "सक्रिय", loading: "निर्देशिका लोड करत आहे...", empty: "कोणतेही संपर्क आढळले नाहीत.", empty_sub: "तुमचे शोध निकष बदलून पहा.",
            lbl_dept: "विभाग", lbl_zone: "झोन"
        },
        gu: {
            lang: "ગુજરાતી", back: "ડેશબોર્ડ પર પાછા ફરો", log_out: "લૉગ આઉટ", careers: "કારકિર્દી", products: "ઉત્પાદનો",
            title: "કટોકટી નિર્દેશિકા", sub: "સ્થાનિક સત્તાવાળાઓ અને ઝડપી પ્રતિસાદ એકમો માટે સીધા નંબરો.",
            search_ph: "સેવા અથવા વિભાગ શોધો...", filter_all: "તમામ ઝોન",
            btn_call: "હમણાં કૉલ કરો", status_active: "સક્રિય", loading: "ડિરેક્ટરી લોડ થઈ રહી છે...", empty: "કોઈ સંપર્કો મળ્યા નથી.", empty_sub: "તમારા શોધ માપદંડોને બદલવાનો પ્રયાસ કરો.",
            lbl_dept: "વિભાગ", lbl_zone: "ઝોન"
        },
        te: {
            lang: "తెలుగు", back: "డ్యాష్‌బోర్డ్‌కు తిరిగి వెళ్లండి", log_out: "లాగౌట్", careers: "కెరీర్స్", products: "ఉత్పత్తులు",
            title: "అత్యవసర డైరెక్టరీ", sub: "స్థానిక అధికారులు మరియు వేగవంతమైన ప్రతిస్పందన విభాగాలకు ప్రత్యక్ష సంఖ్యలు.",
            search_ph: "సేవ లేదా విభాగాన్ని శోధించండి...", filter_all: "అన్ని జోన్‌లు",
            btn_call: "ఇప్పుడే కాల్ చేయండి", status_active: "క్రియాశీల", loading: "డైరెక్టరీని లోడ్ చేస్తోంది...", empty: "పరిచయాలు కనుగొనబడలేదు.", empty_sub: "మీ శోధన ప్రమాణాలను సర్దుబాటు చేయడానికి ప్రయత్నించండి.",
            lbl_dept: "విభాగం", lbl_zone: "జోన్"
        },
        ta: {
            lang: "தமிழ்", back: "டாஷ்போர்டுக்குத் திரும்பு", log_out: "வெளியேறு", careers: "தொழில்கள்", products: "தயாரிப்புகள்",
            title: "அவசரக் கோப்பகம்", sub: "உள்ளூர் அதிகாரிகள் மற்றும் விரைவான பதில் பிரிவுகளுக்கான நேரடி எண்கள்.",
            search_ph: "சேவை அல்லது துறையைத் தேடு...", filter_all: "அனைத்து மண்டலங்களும்",
            btn_call: "இப்போது அழைக்கவும்", status_active: "செயலில்", loading: "கோப்பகத்தை ஏற்றுகிறது...", empty: "தொடர்புகள் எதுவும் கிடைக்கவில்லை.", empty_sub: "உங்கள் தேடல் அளவுகோல்களை மாற்ற முயற்சிக்கவும்.",
            lbl_dept: "துறை", lbl_zone: "மண்டலம்"
        },
        pa: {
            lang: "ਪੰਜਾਬੀ", back: "ਡੈਸ਼ਬੋਰਡ 'ਤੇ ਵਾਪਸ ਜਾਓ", log_out: "ਲੌਗ ਆਉਟ", careers: "ਕਰੀਅਰ", products: "ਉਤਪਾਦ",
            title: "ਐਮਰਜੈਂਸੀ ਡਾਇਰੈਕਟਰੀ", sub: "ਸਥਾਨਕ ਅਧਿਕਾਰੀਆਂ ਅਤੇ ਤੁਰੰਤ ਜਵਾਬ ਯੂਨਿਟਾਂ ਲਈ ਸਿੱਧੇ ਨੰਬਰ।",
            search_ph: "ਸੇਵਾ ਜਾਂ ਵਿਭਾਗ ਖੋਜੋ...", filter_all: "ਸਾਰੇ ਜ਼ੋਨ",
            btn_call: "ਹੁਣੇ ਕਾਲ ਕਰੋ", status_active: "ਸਰਗਰਮ", loading: "ਡਾਇਰੈਕਟਰੀ ਲੋਡ ਹੋ ਰਹੀ ਹੈ...", empty: "ਕੋਈ ਸੰਪਰਕ ਨਹੀਂ ਮਿਲੇ।", empty_sub: "ਆਪਣੇ ਖੋਜ ਮਾਪਦੰਡਾਂ ਨੂੰ ਬਦਲਣ ਦੀ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
            lbl_dept: "ਵਿਭਾਗ", lbl_zone: "ਜ਼ੋਨ"
        },
        bho: {
            lang: "भोजपुरी", back: "डैशबोर्ड पर वापस जाईं", log_out: "लॉग आउट", careers: "करियर", products: "उत्पाद",
            title: "आपातकालीन निर्देशिका", sub: "स्थानीय अधिकारी आ त्वरित प्रतिक्रिया इकाई खातिर सीधा नंबर।",
            search_ph: "सेवा भा विभाग खोजीं...", filter_all: "सभ ज़ोन",
            btn_call: "अभी कॉल करीं", status_active: "सक्रिय", loading: "निर्देशिका लोड हो रहल बा...", empty: "कौनो संपर्क ना मिलल।", empty_sub: "आपन खोज मानदंड बदले के प्रयास करीं।",
            lbl_dept: "विभाग", lbl_zone: "ज़ोन"
        },
        ar: {
            lang: "العربية", back: "العودة إلى لوحة القيادة", log_out: "تسجيل الخروج", careers: "الوظائف", products: "المنتجات",
            title: "دليل الطوارئ", sub: "أرقام مباشرة للسلطات المحلية ووحدات الاستجابة السريعة.",
            search_ph: "ابحث عن خدمة أو قسم...", filter_all: "جميع المناطق",
            btn_call: "اتصل الان", status_active: "نشط", loading: "جاري تحميل الدليل...", empty: "لم يتم العثور على جهات اتصال.", empty_sub: "حاول تعديل معايير البحث.",
            lbl_dept: "القسم", lbl_zone: "المنطقة"
        },
        es: {
            lang: "Español", back: "Volver al Tablero", log_out: "Cerrar sesión", careers: "Carreras", products: "Productos",
            title: "Directorio de Emergencia", sub: "Líneas directas a autoridades locales y unidades de respuesta rápida.",
            search_ph: "Buscar servicio o departamento...", filter_all: "Todas las Zonas",
            btn_call: "Llamar Ahora", status_active: "Activo", loading: "Cargando directorio...", empty: "No se encontraron contactos.", empty_sub: "Intente ajustar sus criterios de búsqueda.",
            lbl_dept: "Departamento", lbl_zone: "Zona"
        },
        fr: {
            lang: "Français", back: "Retour au Tableau de bord", log_out: "Se déconnecter", careers: "Carrières", products: "Produits",
            title: "Annuaire d'Urgence", sub: "Lignes directes vers les autorités locales et les unités d'intervention rapide.",
            search_ph: "Rechercher un service ou un département...", filter_all: "Toutes les Zones",
            btn_call: "Appeler", status_active: "Actif", loading: "Chargement de l'annuaire...", empty: "Aucun contact trouvé.", empty_sub: "Essayez d'ajuster vos critères de recherche.",
            lbl_dept: "Département", lbl_zone: "Zone"
        },
        de: {
            lang: "Deutsch", back: "Zurück zum Dashboard", log_out: "Abmelden", careers: "Karriere", products: "Produkte",
            title: "Notfallverzeichnis", sub: "Direkte Nummern zu lokalen Behörden und Schnelleinsatzeinheiten.",
            search_ph: "Dienst oder Abteilung suchen...", filter_all: "Alle Zonen",
            btn_call: "Jetzt Anrufen", status_active: "Aktiv", loading: "Verzeichnis wird geladen...", empty: "Keine Kontakte gefunden.", empty_sub: "Versuchen Sie, Ihre Suchkriterien anzupassen.",
            lbl_dept: "Abteilung", lbl_zone: "Zone"
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

    const zoneOptions = [
        { id: 'All', label: currentT.filter_all },
        { id: 'Zone A', label: 'Zone A' },
        { id: 'Zone G', label: 'Zone G' },
        { id: 'Zone K', label: 'Zone K' }
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
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/civic/home')}>
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
                                className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center transition-colors outline-none ${
                                    theme === 'light' ? 'text-[#888888] hover:text-black' : 'text-[#888888] hover:text-white'
                                }`}
                            >
                                <X size={18} />
                            </button>
                            
                            <div className={`w-12 h-12 mx-auto rounded-full border flex items-center justify-center mb-4 ${theme === 'light' ? 'border-[#cccccc]' : 'border-[#333333]'}`}>
                                <Globe size={24} stroke={theme === 'light' ? 'black' : 'white'} strokeWidth="1.5" />
                            </div>

                            <h2 className={`text-[1.4rem] font-black tracking-tight mb-6 text-center ${theme === 'light' ? 'text-black' : 'text-white'}`}>Select Language</h2>
                            
                            <div className="flex flex-col gap-2">
                                {languageOptions.map((option) => (
                                    <button 
                                        key={option.code}
                                        onClick={() => { setLang(option.code); setShowLangPrompt(false); }}
                                        className={`w-full p-4 rounded-xl flex items-center justify-between group transition-colors outline-none border ${
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

            {/* PRODUCTS ECOSYSTEM MODAL */}
            <AnimatePresence>
                {showProductsPrompt && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className={`fixed inset-0 z-[9999] backdrop-blur-md flex items-center justify-center p-6 ${theme === 'light' ? 'bg-white/90' : 'bg-black/90'}`}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className={`w-full max-w-[500px] rounded-3xl p-8 flex flex-col shadow-2xl relative border ${
                                theme === 'light' ? 'bg-white border-[#e0e0e0]' : 'bg-[#0a0a0a] border-[#222222]'
                            }`}
                        >
                            <button 
                                onClick={() => setShowProductsPrompt(false)} 
                                className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center transition-colors outline-none ${
                                    theme === 'light' ? 'text-[#888888] hover:text-black' : 'text-[#888888] hover:text-white'
                                }`}
                            >
                                <X size={18} />
                            </button>

                            <h2 className={`text-[1.5rem] font-black tracking-tight mb-2 text-center mt-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>Movyra Products</h2>
                            <p className={`text-[0.9rem] text-center mb-8 ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>Discover our connected platforms.</p>

                            <Link to="/civic/home" className={`group flex flex-col items-center gap-4 p-6 rounded-2xl transition-colors text-center w-full outline-none border ${
                                theme === 'light' ? 'bg-[#f9f9f9] border-[#e0e0e0] hover:border-black' : 'bg-[#111111] border-[#333333] hover:border-white'
                            }`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <img 
                                        src={theme === 'light' ? '/logo-3.png' : '/logo.png'} 
                                        alt="Movyra" 
                                        className="h-6 w-auto" 
                                        onError={(e) => e.target.style.display = 'none'} 
                                    />
                                    <span className={`font-black text-[1.2rem] tracking-tighter ml-[-5px] ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                                        ovyra <span className="text-[#888888] font-medium text-[1rem] ml-1">Civic</span>
                                    </span>
                                </div>
                                <div>
                                    <p className={`text-[0.85rem] leading-relaxed transition-colors ${theme === 'light' ? 'text-[#666666] group-hover:text-black' : 'text-[#888888] group-hover:text-[#aaaaaa]'}`}>
                                        Smart city management. Report issues easily.
                                    </p>
                                </div>
                            </Link>
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
                        <ShieldAlert size={24} className={theme === 'light' ? 'text-black' : 'text-white'} />
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
                        {zoneOptions.map((zone) => (
                            <button
                                key={zone.id}
                                onClick={() => setSelectedWard(zone.id)}
                                className={`px-4 py-2 rounded-full text-[0.85rem] font-bold transition-colors outline-none border ${
                                    theme === 'light'
                                        ? (selectedWard === zone.id ? 'bg-black text-white border-black' : 'bg-white text-[#666666] border-[#cccccc] hover:border-black')
                                        : (selectedWard === zone.id ? 'bg-white text-black border-white' : 'bg-[#111111] text-[#888888] border-[#333333] hover:border-white')
                                }`}
                            >
                                {zone.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Directory List */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mb-4 ${theme === 'light' ? 'border-black' : 'border-white'}`}></div>
                        <span className={`text-[0.9rem] font-bold ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{currentT.loading}</span>
                    </div>
                ) : filteredDirectory.length === 0 ? (
                    <div className={`rounded-3xl p-12 text-center border border-dashed flex flex-col items-center justify-center ${
                        theme === 'light' ? 'bg-white border-[#cccccc]' : 'bg-[#111111] border-[#333333]'
                    }`}>
                        <Phone size={48} className={`mb-6 opacity-50 ${theme === 'light' ? 'text-[#cccccc]' : 'text-[#333333]'}`} />
                        <h2 className="text-[1.5rem] font-black tracking-tight mb-2">{currentT.empty}</h2>
                        <p className={`text-[1rem] ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{currentT.empty_sub}</p>
                    </div>
                ) : (
                    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredDirectory.map((contact) => (
                            <motion.div 
                                variants={itemVariants} 
                                key={contact.id} 
                                className={`rounded-2xl border p-6 flex flex-col justify-between transition-colors ${
                                    theme === 'light' ? 'bg-white border-[#e0e0e0] hover:border-[#cccccc]' : 'bg-[#111111] border-[#333333] hover:border-[#555555]'
                                }`}
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-3 mb-4">
                                        <span className={`px-3 py-1 text-[0.75rem] font-black tracking-wider uppercase rounded-full ${
                                            theme === 'light' ? 'bg-[#f0f0f0] text-[#555555]' : 'bg-[#222222] text-white'
                                        }`}>
                                            {contact.department}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-[#00aa55] animate-pulse"></div>
                                            <span className={`text-[0.75rem] font-bold uppercase tracking-wider ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{currentT.status_active}</span>
                                        </div>
                                    </div>
                                    
                                    <h3 className={`text-[1.25rem] font-black leading-snug mb-1 ${theme === 'light' ? 'text-black' : 'text-white'}`}>{contact.name}</h3>
                                    <p className={`text-[0.85rem] font-bold mb-6 ${theme === 'light' ? 'text-[#888888]' : 'text-[#888888]'}`}>{currentT.lbl_zone}: {contact.ward}</p>
                                </div>

                                <a 
                                    href={`tel:${contact.phone}`}
                                    className={`w-full py-4 rounded-xl font-black text-[0.95rem] flex items-center justify-center gap-2 transition-colors outline-none border ${
                                        theme === 'light' ? 'bg-black text-white border-black hover:bg-[#333333]' : 'bg-white text-black border-white hover:bg-[#e0e0e0]'
                                    }`}
                                >
                                    <Phone size={16} /> {currentT.btn_call} {contact.phone}
                                </a>
                            </motion.div>
                        ))}
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
                        <button onClick={() => setShowProductsPrompt(true)} className={`transition-colors outline-none ${theme === 'light' ? 'hover:text-black' : 'hover:text-white'}`}>{currentT.products}</button>
                        <span className={`w-1 h-1 rounded-full ${theme === 'light' ? 'bg-[#cccccc]' : 'bg-[#333333]'}`}></span>
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
                                src={theme === 'light' ? '/aat2.png' : '/aatns-dark.png'} 
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