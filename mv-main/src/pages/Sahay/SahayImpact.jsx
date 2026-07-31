import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { useCivicStore } from '../../store/useCivicStore';
import { 
    ArrowLeft, 
    X,
    Globe,
    ArrowUp,
    BarChart,
    ShieldCheck,
    HeartHandshake,
    Users,
    Clock,
    MapPin,
    Activity,
    User
} from 'lucide-react';

export default function SahayImpact() {
    const navigate = useNavigate();
    
    // 1. STATE MANAGEMENT
    const theme = useCivicStore((state) => state.theme) || 'light'; 

    const [lang, setLang] = useState('en');
    const [showLangPrompt, setShowLangPrompt] = useState(false);
    const [showSitemap, setShowSitemap] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    
    const [isLoading, setIsLoading] = useState(true);
    const [globalMetrics, setGlobalMetrics] = useState({
        totalReports: 0,
        successfulRescues: 0,
        activeVolunteers: 0,
        avgResponseTime: 'Calculating...'
    });
    const [cityStats, setCityStats] = useState([]);

    // 2. AUTHENTICATION & LIVE DATA FETCHING
    useEffect(() => {
        const sysLang = navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'hinglish', 'mr', 'gu', 'te', 'ta', 'pa', 'bho', 'ar', 'es', 'fr', 'de'];
        if (supported.includes(sysLang)) setLang(sysLang);

        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });

        // LIVE FIRESTORE LISTENER (STRICT DATA FILTERING)
        const casesRef = collection(db, 'sahay_cases');
        const q = query(casesRef);
        
        const unsubscribeData = onSnapshot(q, (snapshot) => {
            const testKeywords = ['test', 'testing', 'testcodecfg@gmail.com'];
            const containsTestKeyword = (str) => {
                if (!str) return false;
                const lowerStr = str.toLowerCase();
                return testKeywords.some(kw => lowerStr.includes(kw));
            };

            let validReports = 0;
            let resolvedCases = 0;
            let activeVolunteersSet = new Set();
            let totalHours = 0;
            let validTimeRecords = 0;
            const cityCounts = { 'Mumbai': 0, 'Delhi': 0, 'Bengaluru': 0, 'Pune': 0, 'Hyderabad': 0, 'Chennai': 0, 'Jaipur': 0, 'Ahmedabad': 0, 'Other': 0 };

            snapshot.forEach(doc => {
                const data = doc.data();
                const isTest = containsTestKeyword(data.description) || 
                               containsTestKeyword(data.condition) ||
                               containsTestKeyword(data.address) || 
                               containsTestKeyword(data.category) || 
                               containsTestKeyword(data.reporterName) || 
                               containsTestKeyword(data.assignedToName) ||
                               (data.userId === 'testcodecfg@gmail.com');

                if (!isTest) {
                    validReports++;
                    
                    if (data.status === 'Closed') {
                        resolvedCases++;
                        if (data.createdAt && data.closedAt) {
                            const created = data.createdAt.toDate();
                            const closed = data.closedAt.toDate();
                            const diffHours = (closed - created) / (1000 * 60 * 60);
                            if (diffHours >= 0) {
                                totalHours += diffHours;
                                validTimeRecords++;
                            }
                        }
                    }

                    if (data.volunteersAssisting && Array.isArray(data.volunteersAssisting)) {
                        data.volunteersAssisting.forEach(v => activeVolunteersSet.add(v));
                    }
                    if (data.assignedToId) {
                        activeVolunteersSet.add(data.assignedToId);
                    }

                    const addressStr = (data.address || '').toLowerCase();
                    let matched = false;
                    Object.keys(cityCounts).forEach(city => {
                        if (city !== 'Other' && addressStr.includes(city.toLowerCase())) {
                            cityCounts[city]++;
                            matched = true;
                        }
                    });
                    if (!matched) cityCounts['Other']++;
                }
            });

            const avgHours = validTimeRecords > 0 ? (totalHours / validTimeRecords).toFixed(1) : '24.0';
            
            const formattedCityStats = Object.keys(cityCounts)
                .filter(city => cityCounts[city] > 0)
                .map(city => ({ name: city, count: cityCounts[city] }))
                .sort((a, b) => b.count - a.count);

            setGlobalMetrics({
                totalReports: validReports,
                successfulRescues: resolvedCases,
                activeVolunteers: activeVolunteersSet.size,
                avgResponseTime: validTimeRecords > 0 ? `${avgHours} Hours` : 'Pending Data'
            });

            setCityStats(formattedCityStats);
            setIsLoading(false);
        }, (error) => {
            console.error("Impact listener error:", error);
            setIsLoading(false);
        });

        return () => {
            unsubscribeAuth();
            unsubscribeData();
        };
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    // 3. 13-LANGUAGE DICTIONARY (Fully Translated, Professional)
    const t = {
        en: {
            lang: "English", log_out: "Log out", careers: "Careers", products: "Products", back: "Back to Home", sign_in: "Sign In", sitemap: "Sitemap", sitemap_desc: "Direct navigation to all Sahay modules.",
            title: "Impact Dashboard", sub: "Real-time statistics on rescue operations.",
            lbl_reports: "Total Reports", lbl_rescues: "Successful Rescues", lbl_vols: "Active Volunteers", lbl_time: "Avg. Response Time",
            sec_city: "City Performance", sec_city_sub: "Where help is reaching the fastest.",
            loading: "Loading statistics...", empty: "Not enough data yet."
        },
        hi: {
            lang: "हिन्दी", log_out: "लॉग आउट", careers: "करियर", products: "उत्पाद", back: "होम पर वापस जाएं", sign_in: "साइन इन", sitemap: "साइटमैप", sitemap_desc: "सभी सहाय मॉड्यूल पर सीधा नेविगेशन।",
            title: "प्रभाव डैशबोर्ड", sub: "बचाव कार्यों पर वास्तविक समय के आंकड़े।",
            lbl_reports: "कुल रिपोर्ट", lbl_rescues: "सफल बचाव", lbl_vols: "सक्रिय स्वयंसेवक", lbl_time: "औसत प्रतिक्रिया समय",
            sec_city: "शहर का प्रदर्शन", sec_city_sub: "जहां मदद सबसे तेजी से पहुंच रही है।",
            loading: "आंकड़े लोड हो रहे हैं...", empty: "अभी पर्याप्त डेटा नहीं है।"
        },
        hinglish: {
            lang: "Hinglish", log_out: "Log out", careers: "Careers", products: "Products", back: "Home par wapas", sign_in: "Sign In", sitemap: "Sitemap", sitemap_desc: "Sabhi Sahay modules ka direct navigation.",
            title: "Impact Dashboard", sub: "Rescue operations ke real-time stats.",
            lbl_reports: "Total Reports", lbl_rescues: "Successful Rescues", lbl_vols: "Active Volunteers", lbl_time: "Avg. Response Time",
            sec_city: "City Performance", sec_city_sub: "Kahan help sabse jaldi pahunch rahi hai.",
            loading: "Stats load ho rahe hain...", empty: "Abhi data available nahi hai."
        },
        mr: {
            lang: "मराठी", log_out: "लॉग आउट", careers: "करिअर", products: "उत्पादने", back: "मुख्यपृष्ठावर परत", sign_in: "साइन इन", sitemap: "साइटमॅप", sitemap_desc: "सर्व सहाय मॉड्यूल्ससाठी थेट नेव्हिगेशन.",
            title: "प्रभाव डॅशबोर्ड", sub: "बचाव कार्यावरील रिअल-टाइम आकडेवारी.",
            lbl_reports: "एकूण अहवाल", lbl_rescues: "यशस्वी बचाव", lbl_vols: "सक्रिय स्वयंसेवक", lbl_time: "सरासरी प्रतिसाद वेळ",
            sec_city: "शहराची कामगिरी", sec_city_sub: "जिथे मदत सर्वात वेगाने पोहोचत आहे.",
            loading: "आकडेवारी लोड करत आहे...", empty: "अद्याप पुरेसा डेटा नाही."
        },
        gu: {
            lang: "ગુજરાતી", log_out: "લૉગ આઉટ", careers: "કારકિર્દી", products: "ઉત્પાદનો", back: "હોમ પર પાછા ફરો", sign_in: "સાઇન ઇન", sitemap: "સાઇટમેપ", sitemap_desc: "તમામ સહાય મોડ્યુલો માટે સીધું નેવિગેશન.",
            title: "પ્રભાવ ડેશબોર્ડ", sub: "બચાવ કામગીરી પર રીઅલ-ટાઇમ આંકડા.",
            lbl_reports: "કુલ અહેવાલો", lbl_rescues: "સફળ બચાવ", lbl_vols: "સક્રિય સ્વયંસેવકો", lbl_time: "સરેરાશ પ્રતિસાદ સમય",
            sec_city: "શહેરની કામગીરી", sec_city_sub: "જ્યાં મદદ સૌથી ઝડપથી પહોંચી રહી છે.",
            loading: "આંકડા લોડ થઈ રહ્યા છે...", empty: "હજી પૂરતો ડેટા નથી."
        },
        te: {
            lang: "తెలుగు", log_out: "లాగౌట్", careers: "కెరీర్స్", products: "ఉత్పత్తులు", back: "హోమ్‌కు తిరిగి వెళ్లండి", sign_in: "సైన్ ఇన్", sitemap: "సైట్‌మ్యాప్", sitemap_desc: "అన్ని సహాయ్ మాడ్యూల్స్‌కు ప్రత్యక్ష నావిగేషన్.",
            title: "ప్రభావ డాష్‌బోర్డ్", sub: "రెస్క్యూ ఆపరేషన్లపై నిజ-సమయ గణాంకాలు.",
            lbl_reports: "మొత్తం నివేదికలు", lbl_rescues: "విజయవంతమైన రక్షణలు", lbl_vols: "క్రియాశీల వాలంటీర్లు", lbl_time: "సగటు ప్రతిస్పందన సమయం",
            sec_city: "నగర పనితీరు", sec_city_sub: "సహాయం వేగంగా ఎక్కడ చేరుతోంది.",
            loading: "గణాంకాలు లోడ్ అవుతున్నాయి...", empty: "ఇంకా తగినంత డేటా లేదు."
        },
        ta: {
            lang: "தமிழ்", log_out: "வெளியேறு", careers: "தொழில்கள்", products: "தயாரிப்புகள்", back: "முகப்புக்குத் திரும்பு", sign_in: "உள்நுழைய", sitemap: "தளத்தின் வரைபடம்", sitemap_desc: "அனைத்து சஹாய் தொகுதிகளுக்கும் நேரடி வழிசெலுத்தல்.",
            title: "தாக்க டாஷ்போர்டு", sub: "மீட்பு நடவடிக்கைகளின் நிகழ்நேர புள்ளிவிவரங்கள்.",
            lbl_reports: "மொத்த அறிக்கைகள்", lbl_rescues: "வெற்றிகரமான மீட்புகள்", lbl_vols: "செயலில் உள்ள தன்னார்வலர்கள்", lbl_time: "சராசரி பதில் நேரம்",
            sec_city: "நகர செயல்திறன்", sec_city_sub: "உதவி எங்கே வேகமாக சென்றடைகிறது.",
            loading: "புள்ளிவிவரங்கள் ஏற்றப்படுகின்றன...", empty: "போதுமான தரவு இன்னும் இல்லை."
        },
        pa: {
            lang: "ਪੰਜਾਬੀ", log_out: "ਲੌਗ ਆਉਟ", careers: "ਕਰੀਅਰ", products: "ਉਤਪਾਦ", back: "ਹੋਮ 'ਤੇ ਵਾਪਸ", sign_in: "ਸਾਈਨ ਇਨ", sitemap: "ਸਾਈਟਮੈਪ", sitemap_desc: "ਸਾਰੇ ਸਹਾਏ ਮੋਡਿਊਲਾਂ ਲਈ ਸਿੱਧੀ ਨੈਵੀਗੇਸ਼ਨ।",
            title: "ਪ੍ਰਭਾਵ ਡੈਸ਼ਬੋਰਡ", sub: "ਬਚਾਅ ਕਾਰਜਾਂ 'ਤੇ ਰੀਅਲ-ਟਾਈਮ ਅੰਕੜੇ।",
            lbl_reports: "ਕੁੱਲ ਰਿਪੋਰਟਾਂ", lbl_rescues: "ਸਫਲ ਬਚਾਅ", lbl_vols: "ਸਰਗਰਮ ਵਲੰਟੀਅਰ", lbl_time: "ਔਸਤ ਜਵਾਬ ਸਮਾਂ",
            sec_city: "ਸ਼ਹਿਰ ਦਾ ਪ੍ਰਦਰਸ਼ਨ", sec_city_sub: "ਜਿੱਥੇ ਮਦਦ ਸਭ ਤੋਂ ਤੇਜ਼ੀ ਨਾਲ ਪਹੁੰਚ ਰਹੀ ਹੈ।",
            loading: "ਅੰਕੜੇ ਲੋਡ ਕੀਤੇ ਜਾ ਰਹੇ ਹਨ...", empty: "ਹਾਲੇ ਕਾਫ਼ੀ ਡਾਟਾ ਨਹੀਂ ਹੈ।"
        },
        bho: {
            lang: "भोजपुरी", log_out: "लॉग आउट", careers: "करियर", products: "उत्पाद", back: "होम पर वापस", sign_in: "साइन इन", sitemap: "साइटमैप", sitemap_desc: "सब सहाय मॉड्यूल पर सीधा नेविगेशन।",
            title: "प्रभाव डैशबोर्ड", sub: "बचाव काम पर रीयल-टाइम आँकड़ा।",
            lbl_reports: "कुल रिपोर्ट", lbl_rescues: "सफल बचाव", lbl_vols: "सक्रिय स्वयंसेवक", lbl_time: "औसत प्रतिक्रिया समय",
            sec_city: "शहर के प्रदर्शन", sec_city_sub: "जहाँ मदद सबसे तेजी से पहुँच रहल बा।",
            loading: "आँकड़ा लोड हो रहल बा...", empty: "अभी पर्याप्त डेटा नईखे।"
        },
        ar: {
            lang: "العربية", log_out: "تسجيل الخروج", careers: "الوظائف", products: "المنتجات", back: "العودة إلى الصفحة الرئيسية", sign_in: "تسجيل الدخول", sitemap: "خريطة الموقع", sitemap_desc: "التنقل المباشر لجميع وحدات ساهاي.",
            title: "لوحة التأثير", sub: "إحصائيات في الوقت الفعلي لعمليات الإنقاذ.",
            lbl_reports: "إجمالي التقارير", lbl_rescues: "عمليات الإنقاذ الناجحة", lbl_vols: "المتطوعون النشطون", lbl_time: "متوسط وقت الاستجابة",
            sec_city: "أداء المدينة", sec_city_sub: "حيث تصل المساعدة بأسرع ما يمكن.",
            loading: "جاري تحميل الإحصائيات...", empty: "لا توجد بيانات كافية بعد."
        },
        es: {
            lang: "Español", log_out: "Cerrar sesión", careers: "Carreras", products: "Productos", back: "Volver a Inicio", sign_in: "Iniciar Sesión", sitemap: "Mapa del sitio", sitemap_desc: "Navegación directa a todos los módulos de Sahay.",
            title: "Panel de Impacto", sub: "Estadísticas en tiempo real sobre rescates.",
            lbl_reports: "Reportes Totales", lbl_rescues: "Rescates Exitosos", lbl_vols: "Voluntarios Activos", lbl_time: "Tiempo de Respuesta",
            sec_city: "Rendimiento de la Ciudad", sec_city_sub: "Dónde llega la ayuda más rápido.",
            loading: "Cargando estadísticas...", empty: "Aún no hay suficientes datos."
        },
        fr: {
            lang: "Français", log_out: "Se déconnecter", careers: "Carrières", products: "Produits", back: "Retour à l'accueil", sign_in: "Se Connecter", sitemap: "Plan du site", sitemap_desc: "Navigation directe vers tous les modules Sahay.",
            title: "Tableau d'Impact", sub: "Statistiques en temps réel sur les sauvetages.",
            lbl_reports: "Rapports Totaux", lbl_rescues: "Sauvetages Réussis", lbl_vols: "Bénévoles Actifs", lbl_time: "Temps de Réponse",
            sec_city: "Performance de la Ville", sec_city_sub: "Où l'aide arrive le plus vite.",
            loading: "Chargement des statistiques...", empty: "Pas encore assez de données."
        },
        de: {
            lang: "Deutsch", log_out: "Abmelden", careers: "Karriere", products: "Produkte", back: "Zurück zur Startseite", sign_in: "Anmelden", sitemap: "Seitenverzeichnis", sitemap_desc: "Direkte Navigation zu allen Sahay-Modulen.",
            title: "Auswirkungs-Dashboard", sub: "Echtzeitstatistiken zu Rettungseinsätzen.",
            lbl_reports: "Gesamte Berichte", lbl_rescues: "Erfolgreiche Rettungen", lbl_vols: "Aktive Freiwillige", lbl_time: "Reaktionszeit",
            sec_city: "Stadtleistung", sec_city_sub: "Wo Hilfe am schnellsten ankommt.",
            loading: "Statistiken werden geladen...", empty: "Noch nicht genügend Daten vorhanden."
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

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };

    return (
        <div className="min-h-screen font-sans overflow-x-hidden flex flex-col relative bg-[#FFFFFF] text-[#111111] selection:bg-[#FF6B35] selection:text-white">
            
            <style>
                {`
                  @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                  .animate-fade { animation: fadeIn 0.8s ease-out forwards; }
                  html { scroll-behavior: smooth; }
                `}
            </style>

            {/* TOP HEADER */}
            <header className="w-full flex items-center justify-between px-6 md:px-12 py-6 animate-fade z-50 bg-[#FFFFFF]/90 border-b border-[#E5E7EB] backdrop-blur-md sticky top-0">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/sahay')}>
                    <img 
                        src={theme === 'light' ? '/logo-4.png' : '/logo-4.png'} 
                        alt="Movyra" 
                        className="h-8 w-auto" 
                        onError={(e) => e.target.style.display = 'none'} 
                    />
                    <span className="font-black text-[1.5rem] tracking-tighter ml-[-5px]">
                        ovyra <span className={`${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'} font-medium text-[1.2rem] ml-1`}>Sahay</span>
                    </span>
                </div>
                
                <div className="flex items-center gap-3 sm:gap-6 text-[0.9rem] font-bold">
                    <button onClick={() => setShowLangPrompt(true)} className="flex items-center gap-2 text-[#555555] hover:text-[#111111] transition-colors outline-none px-3 py-1.5 rounded-full border border-[#E5E7EB] hover:border-[#111111]">
                        <Globe size={14} /> <span className="hidden sm:inline">{currentT.lang}</span>
                    </button>
                    {currentUser ? (
                        <button 
                            onClick={() => navigate('/sahay/profile')} 
                            className="p-2 rounded-full bg-[#F7F7F7] text-[#111111] border border-[#E5E7EB] hover:border-[#111111] hover:bg-[#E5E7EB] transition-colors outline-none flex items-center justify-center"
                        >
                            <User size={18} />
                        </button>
                    ) : (
                        <button onClick={() => navigate('/sahay/auth')} className="bg-[#111111] text-[#FFFFFF] px-4 py-2 rounded-full font-bold hover:bg-[#555555] transition-colors outline-none">
                            {currentT.sign_in}
                        </button>
                    )}
                </div>
            </header>

            {/* SITEMAP MODAL */}
            <AnimatePresence>
                {showSitemap && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] bg-[#111111]/90 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-[600px] bg-[#FFFFFF] rounded-3xl p-8 flex flex-col shadow-2xl relative border border-[#E5E7EB] max-h-[80vh] overflow-y-auto"
                        >
                            <button onClick={() => setShowSitemap(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[#555555] hover:text-[#111111] transition-colors outline-none">
                                <X size={18} />
                            </button>
                            <h2 className="text-[1.8rem] font-black tracking-tight mb-2 text-[#111111]">{currentT.sitemap}</h2>
                            <p className="text-[#555555] font-medium mb-6">{currentT.sitemap_desc}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { path: '/sahay', name: currentT.sm_home },
                                    { path: '/sahay/report', name: currentT.sm_report },
                                    { path: '/sahay/cases', name: currentT.sm_cases },
                                    { path: '/sahay/map', name: currentT.sm_map },
                                    { path: '/sahay/organization', name: currentT.sm_org },
                                    { path: '/sahay/volunteer', name: currentT.sm_vol },
                                    { path: '/sahay/impact', name: currentT.sm_imp },
                                    { path: '/sahay/emergency', name: currentT.sm_emg },
                                    { path: '/sahay/contact', name: currentT.sm_cont },
                                    { path: '/sahay/about', name: currentT.sm_abt },
                                    { path: '/sahay/auth', name: currentT.sm_auth },
                                    { path: '/sahay/admin', name: currentT.sm_adm }
                                ].map(link => (
                                    <Link 
                                        key={link.path} 
                                        to={link.path}
                                        onClick={() => setShowSitemap(false)}
                                        className="p-4 bg-[#F7F7F7] border border-[#E5E7EB] rounded-xl font-bold text-[#111111] hover:border-[#FF6B35] hover:text-[#FF6B35] transition-colors flex items-center justify-between group outline-none"
                                    >
                                        {link.name}
                                        <ArrowLeft size={16} className="rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* LANGUAGE SELECTOR MODAL */}
            <AnimatePresence>
                {showLangPrompt && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] bg-[#111111]/80 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-[400px] bg-[#FFFFFF] rounded-3xl p-8 flex flex-col shadow-2xl relative border border-[#E5E7EB] max-h-[80vh] overflow-y-auto"
                        >
                            <button onClick={() => setShowLangPrompt(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[#555555] hover:text-[#111111] transition-colors outline-none">
                                <X size={18} />
                            </button>
                            <h2 className="text-[1.4rem] font-black tracking-tight mb-6 text-center text-[#111111]">Select Language</h2>
                            <div className="flex flex-col gap-2">
                                {languageOptions.map((option) => (
                                    <button 
                                        key={option.code}
                                        onClick={() => { setLang(option.code); setShowLangPrompt(false); }}
                                        className={`w-full p-4 rounded-xl flex items-center justify-between transition-colors border outline-none ${lang === option.code ? 'bg-[#FF6B35]/10 border-[#FF6B35] text-[#FF6B35]' : 'bg-[#F7F7F7] border-[#E5E7EB] text-[#555555] hover:border-[#111111] hover:text-[#111111]'}`}
                                    >
                                        <span className="font-bold text-[1rem]">{option.label}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 md:px-12 py-12 animate-fade flex flex-col">
                
                <button onClick={() => navigate('/sahay')} className="flex items-center gap-2 mb-8 outline-none font-bold text-[0.9rem] text-[#555555] hover:text-[#111111] transition-colors self-start">
                    <ArrowLeft size={16} /> {currentT.back}
                </button>

                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-4 text-[#00A9F7]">
                        <BarChart size={32} />
                    </div>
                    <h1 className="text-[2.5rem] md:text-[3.5rem] font-black leading-[1.1] tracking-tighter mb-4 text-[#111111]">
                        {currentT.title}
                    </h1>
                    <p className="text-[1.1rem] text-[#555555] font-medium">
                        {currentT.sub}
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <div className="w-10 h-10 border-4 border-t-transparent border-[#00A9F7] rounded-full animate-spin mb-4"></div>
                        <span className="text-[1rem] font-bold text-[#555555]">{currentT.loading}</span>
                    </div>
                ) : (
                    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="flex flex-col gap-12">
                        
                        {/* Global Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <motion.div variants={itemVariants} className="bg-[#F7F7F7] border border-[#E5E7EB] p-8 rounded-3xl flex flex-col">
                                <div className="w-12 h-12 bg-[#FFFFFF] border border-[#E5E7EB] rounded-full flex items-center justify-center mb-6">
                                    <Activity size={20} className="text-[#FF6B35]" />
                                </div>
                                <h3 className="text-[2.5rem] font-black text-[#111111] leading-none mb-2">{globalMetrics.totalReports}</h3>
                                <p className="text-[#555555] font-bold text-[0.85rem] uppercase tracking-wider">{currentT.lbl_reports}</p>
                            </motion.div>

                            <motion.div variants={itemVariants} className="bg-[#F7F7F7] border border-[#E5E7EB] p-8 rounded-3xl flex flex-col">
                                <div className="w-12 h-12 bg-[#FFFFFF] border border-[#E5E7EB] rounded-full flex items-center justify-center mb-6">
                                    <HeartHandshake size={20} className="text-[#16A34A]" />
                                </div>
                                <h3 className="text-[2.5rem] font-black text-[#16A34A] leading-none mb-2">{globalMetrics.successfulRescues}</h3>
                                <p className="text-[#555555] font-bold text-[0.85rem] uppercase tracking-wider">{currentT.lbl_rescues}</p>
                            </motion.div>

                            <motion.div variants={itemVariants} className="bg-[#F7F7F7] border border-[#E5E7EB] p-8 rounded-3xl flex flex-col">
                                <div className="w-12 h-12 bg-[#FFFFFF] border border-[#E5E7EB] rounded-full flex items-center justify-center mb-6">
                                    <Users size={20} className="text-[#00A9F7]" />
                                </div>
                                <h3 className="text-[2.5rem] font-black text-[#00A9F7] leading-none mb-2">{globalMetrics.activeVolunteers}</h3>
                                <p className="text-[#555555] font-bold text-[0.85rem] uppercase tracking-wider">{currentT.lbl_vols}</p>
                            </motion.div>

                            <motion.div variants={itemVariants} className="bg-[#F7F7F7] border border-[#E5E7EB] p-8 rounded-3xl flex flex-col">
                                <div className="w-12 h-12 bg-[#FFFFFF] border border-[#E5E7EB] rounded-full flex items-center justify-center mb-6">
                                    <Clock size={20} className="text-[#F59E0B]" />
                                </div>
                                <h3 className="text-[2rem] font-black text-[#F59E0B] leading-none mb-2 mt-2">{globalMetrics.avgResponseTime}</h3>
                                <p className="text-[#555555] font-bold text-[0.85rem] uppercase tracking-wider mt-auto">{currentT.lbl_time}</p>
                            </motion.div>
                        </div>

                        {/* City Breakdown Section */}
                        <motion.section variants={itemVariants} className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-3xl p-8 md:p-12 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <MapPin size={24} className="text-[#00A9F7]" />
                                <h2 className="text-[1.8rem] font-black text-[#111111]">{currentT.sec_city}</h2>
                            </div>
                            <p className="text-[#555555] text-[1rem] mb-10">{currentT.sec_city_sub}</p>

                            {cityStats.length === 0 ? (
                                <div className="p-8 text-center bg-[#F7F7F7] rounded-2xl border border-[#E5E7EB]">
                                    <p className="text-[#555555] font-bold">{currentT.empty}</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-6">
                                    {cityStats.map((stat, idx) => {
                                        const maxCount = cityStats[0].count;
                                        const percentage = Math.round((stat.count / maxCount) * 100);

                                        return (
                                            <div key={idx} className="flex flex-col gap-2">
                                                <div className="flex items-center justify-between text-[#111111] font-bold text-[1rem]">
                                                    <span>{stat.name}</span>
                                                    <span>{stat.count} Rescues</span>
                                                </div>
                                                <div className="w-full bg-[#F7F7F7] h-4 rounded-full overflow-hidden border border-[#E5E7EB]">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${percentage}%` }}
                                                        transition={{ duration: 1, delay: 0.2 + (idx * 0.1) }}
                                                        className="h-full bg-[#00A9F7] rounded-full"
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.section>

                    </motion.div>
                )}
            </main>

            {/* FOOTER ALIGNMENT */}
            <footer className="w-full mx-auto flex flex-col md:flex-row items-center justify-between gap-8 px-8 md:px-16 py-12 border-t border-[#E5E7EB] bg-[#FFFFFF] relative z-10 animate-fade mt-auto">
                <div className="flex flex-wrap items-center gap-6">
                    <button onClick={() => setShowLangPrompt(true)} className="flex items-center gap-2 text-[0.8rem] font-bold px-3 py-1.5 rounded-full transition-colors border border-[#E5E7EB] text-[#555555] hover:border-[#111111] hover:text-[#111111] outline-none">
                        <Globe size={14} /> {currentT.lang}
                    </button>
                    <div className="flex items-center gap-6 text-[#555555]">
                        <a href="https://www.linkedin.com/company/getmovyra/" target="_blank" rel="noopener noreferrer" className="hover:text-[#111111] transition-colors outline-none"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
                        <a href="#youtube" className="hover:text-[#111111] transition-colors outline-none"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg></a>
                        <a href="https://www.instagram.com/getmovyra" target="_blank" rel="noopener noreferrer" className="hover:text-[#111111] transition-colors outline-none"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>
                        <a href="#x" className="hover:text-[#111111] transition-colors outline-none"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.006 4.15H5.078z"/></svg></a>
                    </div>
                </div>
                
                <div className="flex flex-col md:flex-row items-center gap-6 text-[0.8rem] font-bold text-[#555555]">
                    <div className="flex items-center gap-6">
                        <span onClick={() => setShowSitemap(true)} className="cursor-pointer hover:text-[#111111] transition-colors underline outline-none">{currentT.sitemap}</span>
                        <span className="w-1 h-1 bg-[#E5E7EB] rounded-full"></span>
                        <Link to="/careers" className="hover:text-[#111111] transition-colors outline-none">{currentT.careers}</Link>
                    </div>
                    <span className="hidden md:block w-1 h-1 bg-[#E5E7EB] rounded-full"></span>
                    
                    <div className="flex items-center gap-2 text-[0.75rem] uppercase tracking-wider">
                        Built by 
                        <a href="https://rebrand.ly/aatns" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition-opacity outline-none">
                            <img src={theme === 'light' ? '/aat2.png' : '/aat2.png'} alt="AnyAstro" className="h-4 w-auto object-contain" onError={(e) => { e.target.style.display = 'none'; e.target.insertAdjacentHTML('afterend', '<span class="underline text-[#111111]">AnyAstro</span>'); }} />
                        </a>
                    </div>

                    <button onClick={scrollToTop} className="p-2 rounded-full border border-[#E5E7EB] hover:bg-[#F7F7F7] hover:text-[#111111] transition-colors outline-none">
                        <ArrowUp size={16} />
                    </button>
                </div>
            </footer>
        </div>
    );
}