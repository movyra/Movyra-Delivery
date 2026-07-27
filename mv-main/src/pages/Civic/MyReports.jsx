import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { useCivicStore } from '../../store/useCivicStore';
import { 
    ArrowLeft, 
    FileText, 
    Clock, 
    CheckCircle, 
    ShieldCheck, 
    Wrench, 
    ChevronDown, 
    ChevronUp,
    Sun,
    Moon,
    Home,
    LogOut,
    X,
    Globe,
    ArrowUp,
    ArrowRight
} from 'lucide-react';

export default function MyReports() {
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
    const [userReports, setUserReports] = useState([]);
    const [expandedReportId, setExpandedReportId] = useState(null);

    const localCity = "Mumbai";

    // 2. AUTHENTICATION & DATA FETCHING
    useEffect(() => {
        const sysLang = navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'mr', 'gu', 'te', 'ta', 'pa', 'bho', 'ar', 'es', 'fr', 'de'];
        if (supported.includes(sysLang)) setLang(sysLang);

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user);
                await fetchPersonalReports(user.uid);
            } else {
                navigate('/civic/auth');
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const fetchPersonalReports = async (userId) => {
        setIsLoading(true);
        try {
            const complaintsRef = collection(db, 'civic_complaints');
            const q = query(
                complaintsRef, 
                where('userId', '==', userId), 
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);
            const reports = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUserReports(reports);
        } catch (error) {
            console.error("Failed to retrieve personal reports:", error);
        } finally {
            setIsLoading(false);
        }
    };

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

    const toggleTimeline = (id) => {
        setExpandedReportId(expandedReportId === id ? null : id);
    };

    const getTimelineStage = (status) => {
        const stages = ['Submitted', 'Assigned', 'In Progress', 'Completed'];
        const index = stages.indexOf(status);
        return index >= 0 ? index : 0;
    };

    // 3. 13-LANGUAGE DICTIONARY (Personal Dashboard Context)
    const t = {
        en: {
            lang: "English", back: "Return to Dashboard", log_out: "Log out", careers: "Careers", products: "Products",
            title: "My Reports", sub: "View and track the status of your submitted infrastructure issues.",
            empty: "No reports found.", empty_sub: "You have not submitted any infrastructure reports yet.", btn_report: "Create New Report",
            lbl_id: "ID", lbl_status: "Status", lbl_track: "Track Progress", loading: "Loading your records...",
            step1: "Reported", step1_desc: "Sent to the database.",
            step2: "Assigned", step2_desc: "Team assigned to the issue.",
            step3: "In Progress", step3_desc: "Repair work is active.",
            step4: "Resolved", step4_desc: "Issue fixed."
        },
        hi: {
            lang: "हिन्दी", back: "डैशबोर्ड पर लौटें", log_out: "लॉग आउट", careers: "करियर", products: "उत्पाद",
            title: "मेरी रिपोर्ट", sub: "अपनी सबमिट की गई बुनियादी ढांचा समस्याओं की स्थिति देखें और ट्रैक करें।",
            empty: "कोई रिपोर्ट नहीं मिली।", empty_sub: "आपने अभी तक कोई बुनियादी ढांचा रिपोर्ट सबमिट नहीं की है।", btn_report: "नई रिपोर्ट बनाएं",
            lbl_id: "आईडी", lbl_status: "स्थिति", lbl_track: "प्रगति ट्रैक करें", loading: "आपके रिकॉर्ड लोड हो रहे हैं...",
            step1: "रिपोर्ट किया गया", step1_desc: "डेटाबेस में भेजा गया।",
            step2: "असाइन किया गया", step2_desc: "समस्या के लिए टीम असाइन की गई।",
            step3: "प्रगति पर है", step3_desc: "मरम्मत कार्य सक्रिय है।",
            step4: "हल हो गया", step4_desc: "समस्या ठीक हो गई।"
        },
        hinglish: {
            lang: "Hinglish", back: "Dashboard par wapas jayein", log_out: "Log out", careers: "Careers", products: "Products",
            title: "My Reports", sub: "Apne submit kiye gaye infrastructure issues ka status dekhein aur track karein.",
            empty: "Koi report nahi mili.", empty_sub: "Aapne abhi tak koi report submit nahi ki hai.", btn_report: "New Report Banayein",
            lbl_id: "ID", lbl_status: "Status", lbl_track: "Progress Track Karein", loading: "Aapke records load ho rahe hain...",
            step1: "Reported", step1_desc: "Database me bhej diya gaya.",
            step2: "Assigned", step2_desc: "Team ko issue assign kar diya gaya.",
            step3: "In Progress", step3_desc: "Repair ka kaam chal raha hai.",
            step4: "Resolved", step4_desc: "Issue theek ho gaya."
        },
        mr: {
            lang: "मराठी", back: "डॅशबोर्डवर परत जा", log_out: "लॉग आउट", careers: "करिअर", products: "उत्पादने",
            title: "माझे अहवाल", sub: "तुमच्या सबमिट केलेल्या पायाभूत सुविधांच्या समस्यांची स्थिती पहा आणि ट्रॅक करा.",
            empty: "कोणतेही अहवाल आढळले नाहीत.", empty_sub: "तुम्ही अद्याप कोणतेही अहवाल सबमिट केलेले नाहीत.", btn_report: "नवीन अहवाल तयार करा",
            lbl_id: "आयडी", lbl_status: "स्थिती", lbl_track: "प्रगती ट्रॅक करा", loading: "तुमचे रेकॉर्ड लोड करत आहे...",
            step1: "नोंदवली", step1_desc: "डेटाबेसमध्ये पाठवले.",
            step2: "नियुक्त केले", step2_desc: "समस्येसाठी टीम नियुक्त केली.",
            step3: "प्रगतीपथावर", step3_desc: "दुरुस्तीचे काम सक्रिय आहे.",
            step4: "सुटली", step4_desc: "समस्या दूर केली."
        },
        gu: {
            lang: "ગુજરાતી", back: "ડેશબોર્ડ પર પાછા ફરો", log_out: "લૉગ આઉટ", careers: "કારકિર્દી", products: "ઉત્પાદનો",
            title: "મારા અહેવાલો", sub: "તમારા સબમિટ કરેલા ઇન્ફ્રાસ્ટ્રક્ચર મુદ્દાઓની સ્થિતિ જુઓ અને ટ્રૅક કરો.",
            empty: "કોઈ રિપોર્ટ મળ્યા નથી.", empty_sub: "તમે હજુ સુધી કોઈ રિપોર્ટ સબમિટ કર્યો નથી.", btn_report: "નવો રિપોર્ટ બનાવો",
            lbl_id: "આઈડી", lbl_status: "સ્થિતિ", lbl_track: "પ્રગતિ ટ્રૅક કરો", loading: "તમારા રેકોર્ડ્સ લોડ થઈ રહ્યા છે...",
            step1: "નોંધાયેલ", step1_desc: "ડેટાબેઝમાં મોકલવામાં આવ્યું.",
            step2: "સોંપાયેલ", step2_desc: "સમસ્યા માટે ટીમ સોંપવામાં આવી.",
            step3: "પ્રગતિમાં છે", step3_desc: "સમારકામ કાર્ય સક્રિય છે.",
            step4: "ઉકેલાઈ", step4_desc: "સમસ્યા ઉકેલાઈ."
        },
        te: {
            lang: "తెలుగు", back: "డ్యాష్‌బోర్డ్‌కు తిరిగి వెళ్లండి", log_out: "లాగౌట్", careers: "కెరీర్స్", products: "ఉత్పత్తులు",
            title: "నా నివేదికలు", sub: "మీరు సమర్పించిన మౌలిక సదుపాయాల సమస్యల స్థితిని వీక్షించండి మరియు ట్రాక్ చేయండి.",
            empty: "నివేదికలు కనుగొనబడలేదు.", empty_sub: "మీరు ఇంకా నివేదికలు సమర్పించలేదు.", btn_report: "క్రొత్త నివేదికను సృష్టించండి",
            lbl_id: "ఐడి", lbl_status: "స్థితి", lbl_track: "పురోగతిని ట్రాక్ చేయండి", loading: "మీ రికార్డులను లోడ్ చేస్తోంది...",
            step1: "నివేదించబడింది", step1_desc: "డేటాబేస్కు పంపబడింది.",
            step2: "కేటాయించబడింది", step2_desc: "సమస్య కోసం బృందం కేటాయించబడింది.",
            step3: "పురోగతిలో ఉంది", step3_desc: "మరమ్మత్తు పని చురుకుగా ఉంది.",
            step4: "పరిష్కరించబడింది", step4_desc: "సమస్య పరిష్కరించబడింది."
        },
        ta: {
            lang: "தமிழ்", back: "டாஷ்போர்டுக்குத் திரும்பு", log_out: "வெளியேறு", careers: "தொழில்கள்", products: "தயாரிப்புகள்",
            title: "எனது அறிக்கைகள்", sub: "நீங்கள் சமர்ப்பித்த உள்கட்டமைப்பு சிக்கல்களின் நிலையைப் பார்த்து கண்காணிக்கவும்.",
            empty: "அறிக்கைகள் எதுவும் கிடைக்கவில்லை.", empty_sub: "நீங்கள் இன்னும் எந்த அறிக்கையும் சமர்ப்பிக்கவில்லை.", btn_report: "புதிய அறிக்கையை உருவாக்கவும்",
            lbl_id: "ஐடி", lbl_status: "நிலை", lbl_track: "முன்னேற்றத்தைக் கண்காணிக்கவும்", loading: "உங்கள் பதிவுகளை ஏற்றுகிறது...",
            step1: "புகாரளிக்கப்பட்டது", step1_desc: "தரவுத்தளத்திற்கு அனுப்பப்பட்டது.",
            step2: "ஒதுக்கப்பட்டுள்ளது", step2_desc: "பிரச்சனைக்கு குழு ஒதுக்கப்பட்டுள்ளது.",
            step3: "நடைபெறுகிறது", step3_desc: "பழுதுபார்க்கும் பணி தீவிரமாக உள்ளது.",
            step4: "தீர்க்கப்பட்டது", step4_desc: "பிரச்சனை சரி செய்யப்பட்டது."
        },
        pa: {
            lang: "ਪੰਜਾਬੀ", back: "ਡੈਸ਼ਬੋਰਡ 'ਤੇ ਵਾਪਸ ਜਾਓ", log_out: "ਲੌਗ ਆਉਟ", careers: "ਕਰੀਅਰ", products: "ਉਤਪਾਦ",
            title: "ਮੇਰੀਆਂ ਰਿਪੋਰਟਾਂ", sub: "ਆਪਣੇ ਸਬਮਿਟ ਕੀਤੇ ਬੁਨਿਆਦੀ ਢਾਂਚੇ ਦੀਆਂ ਸਮੱਸਿਆਵਾਂ ਦੀ ਸਥਿਤੀ ਦੇਖੋ ਅਤੇ ਟਰੈਕ ਕਰੋ।",
            empty: "ਕੋਈ ਰਿਪੋਰਟ ਨਹੀਂ ਮਿਲੀ।", empty_sub: "ਤੁਸੀਂ ਅਜੇ ਤੱਕ ਕੋਈ ਰਿਪੋਰਟ ਸਬਮਿਟ ਨਹੀਂ ਕੀਤੀ ਹੈ।", btn_report: "ਨਵੀਂ ਰਿਪੋਰਟ ਬਣਾਓ",
            lbl_id: "ਆਈਡੀ", lbl_status: "ਸਥਿਤੀ", lbl_track: "ਤਰੱਕੀ ਨੂੰ ਟਰੈਕ ਕਰੋ", loading: "ਤੁਹਾਡੇ ਰਿਕਾਰਡ ਲੋਡ ਕੀਤੇ ਜਾ ਰਹੇ ਹਨ...",
            step1: "ਰਿਪੋਰਟ ਕੀਤੀ ਗਈ", step1_desc: "ਡੇਟਾਬੇਸ ਨੂੰ ਭੇਜੀ ਗਈ।",
            step2: "ਨਿਰਧਾਰਤ ਕੀਤਾ ਗਿਆ", step2_desc: "ਸਮੱਸਿਆ ਲਈ ਟੀਮ ਨਿਰਧਾਰਤ ਕੀਤੀ ਗਈ।",
            step3: "ਜਾਰੀ ਹੈ", step3_desc: "ਮੁਰੰਮਤ ਦਾ ਕੰਮ ਸਰਗਰਮ ਹੈ।",
            step4: "ਹੱਲ ਹੋ ਗਈ", step4_desc: "ਸਮੱਸਿਆ ਠੀਕ ਹੋ ਗਈ।"
        },
        bho: {
            lang: "भोजपुरी", back: "डैशबोर्ड पर वापस जाईं", log_out: "लॉग आउट", careers: "करियर", products: "उत्पाद",
            title: "हमर रिपोर्ट", sub: "आपन सबमिट कइल गइल बुनियादी ढांचा के समस्या के स्थिति देखीं आ ट्रैक करीं।",
            empty: "कौनो रिपोर्ट ना मिलल।", empty_sub: "रउआ अभी तक कौनो रिपोर्ट सबमिट नइखीं कइले।", btn_report: "नया रिपोर्ट बनाईं",
            lbl_id: "आईडी", lbl_status: "स्थिति", lbl_track: "प्रगति ट्रैक करीं", loading: "राउर रिकॉर्ड लोड हो रहल बा...",
            step1: "रिपोर्ट कइल गइल", step1_desc: "डेटाबेस में भेजल गइल।",
            step2: "असाइन कइल गइल", step2_desc: "समस्या खातिर टीम असाइन कइल गइल।",
            step3: "प्रगति पर बा", step3_desc: "मरम्मत के काम सक्रिय बा।",
            step4: "हल हो गइल", step4_desc: "समस्या ठीक हो गइल।"
        },
        ar: {
            lang: "العربية", back: "العودة إلى لوحة القيادة", log_out: "تسجيل الخروج", careers: "الوظائف", products: "المنتجات",
            title: "تقاريري", sub: "عرض وتتبع حالة مشكلات البنية التحتية المرسلة.",
            empty: "لم يتم العثور على تقارير.", empty_sub: "لم تقم بتقديم أي تقارير بعد.", btn_report: "إنشاء تقرير جديد",
            lbl_id: "المعرف", lbl_status: "الحالة", lbl_track: "تتبع التقدم", loading: "جاري تحميل سجلاتك...",
            step1: "تم الإبلاغ", step1_desc: "تم الإرسال إلى قاعدة البيانات.",
            step2: "تم التعيين", step2_desc: "تم تعيين فريق للمشكلة.",
            step3: "قيد التنفيذ", step3_desc: "أعمال الإصلاح نشطة.",
            step4: "تم الحل", step4_desc: "تم إصلاح المشكلة."
        },
        es: {
            lang: "Español", back: "Volver al Tablero", log_out: "Cerrar sesión", careers: "Carreras", products: "Productos",
            title: "Mis Reportes", sub: "Vea y rastree el estado de sus problemas enviados.",
            empty: "No se encontraron reportes.", empty_sub: "Aún no ha enviado ningún reporte.", btn_report: "Crear Nuevo Reporte",
            lbl_id: "ID", lbl_status: "Estado", lbl_track: "Rastrear Progreso", loading: "Cargando sus registros...",
            step1: "Reportado", step1_desc: "Enviado a la base de datos.",
            step2: "Asignado", step2_desc: "Equipo asignado al problema.",
            step3: "En Progreso", step3_desc: "El trabajo de reparación está activo.",
            step4: "Resuelto", step4_desc: "Problema solucionado."
        },
        fr: {
            lang: "Français", back: "Retour au Tableau de bord", log_out: "Se déconnecter", careers: "Carrières", products: "Produits",
            title: "Mes Rapports", sub: "Affichez et suivez l'état de vos problèmes soumis.",
            empty: "Aucun rapport trouvé.", empty_sub: "Vous n'avez pas encore soumis de rapport.", btn_report: "Créer un Nouveau Rapport",
            lbl_id: "ID", lbl_status: "Statut", lbl_track: "Suivre la Progression", loading: "Chargement de vos dossiers...",
            step1: "Signalé", step1_desc: "Envoyé à la base de données.",
            step2: "Assigné", step2_desc: "Équipe assignée au problème.",
            step3: "En Cours", step3_desc: "Les travaux de réparation sont actifs.",
            step4: "Résolu", step4_desc: "Problème corrigé."
        },
        de: {
            lang: "Deutsch", back: "Zurück zum Dashboard", log_out: "Abmelden", careers: "Karriere", products: "Produkte",
            title: "Meine Berichte", sub: "Anzeigen und Verfolgen des Status Ihrer eingereichten Probleme.",
            empty: "Keine Berichte gefunden.", empty_sub: "Sie haben noch keine Berichte eingereicht.", btn_report: "Neuen Bericht Erstellen",
            lbl_id: "ID", lbl_status: "Status", lbl_track: "Fortschritt Verfolgen", loading: "Ihre Datensätze werden geladen...",
            step1: "Gemeldet", step1_desc: "An die Datenbank gesendet.",
            step2: "Zugewiesen", step2_desc: "Team dem Problem zugewiesen.",
            step3: "In Bearbeitung", step3_desc: "Die Reparaturarbeiten sind aktiv.",
            step4: "Gelöst", step4_desc: "Problem behoben."
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

    const timelineSteps = [
        { title: currentT.step1, icon: FileText, desc: currentT.step1_desc },
        { title: currentT.step2, icon: ShieldCheck, desc: currentT.step2_desc },
        { title: currentT.step3, icon: Wrench, desc: currentT.step3_desc },
        { title: currentT.step4, icon: CheckCircle, desc: currentT.step4_desc }
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
                                className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center transition-colors ${
                                    theme === 'light' ? 'text-[#888888] hover:text-black' : 'text-[#888888] hover:text-white'
                                }`}
                            >
                                <X size={18} />
                            </button>
                            
                            <div className="w-12 h-12 mx-auto rounded-full border border-[#333333] flex items-center justify-center mb-4">
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

                <div className="mb-12">
                    <h1 className="text-[2.5rem] md:text-[3.5rem] font-black leading-[1.1] tracking-tighter mb-4">
                        {currentT.title}
                    </h1>
                    <p className={`text-[1.1rem] ${theme === 'light' ? 'text-[#555555]' : 'text-[#aaaaaa]'}`}>
                        {currentT.sub}
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mb-4 ${theme === 'light' ? 'border-black' : 'border-white'}`}></div>
                        <span className={`text-[0.9rem] font-bold ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{currentT.loading}</span>
                    </div>
                ) : userReports.length === 0 ? (
                    <div className={`rounded-3xl p-12 text-center border border-dashed flex flex-col items-center justify-center ${
                        theme === 'light' ? 'bg-white border-[#cccccc]' : 'bg-[#111111] border-[#333333]'
                    }`}>
                        <FileText size={48} className={`mb-6 ${theme === 'light' ? 'text-[#cccccc]' : 'text-[#333333]'}`} />
                        <h2 className="text-[1.5rem] font-black tracking-tight mb-2">{currentT.empty}</h2>
                        <p className={`text-[1rem] mb-8 ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{currentT.empty_sub}</p>
                        <button 
                            onClick={() => navigate('/civic/report')}
                            className={`px-8 py-4 rounded-xl font-black text-[1rem] transition-colors outline-none ${
                                theme === 'light' ? 'bg-black text-white hover:bg-[#333333]' : 'bg-white text-black hover:bg-[#e0e0e0]'
                            }`}
                        >
                            {currentT.btn_report}
                        </button>
                    </div>
                ) : (
                    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="flex flex-col gap-6">
                        {userReports.map((report) => {
                            const dateString = report.createdAt ? report.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown Date';
                            const isExpanded = expandedReportId === report.id;
                            
                            return (
                                <motion.div 
                                    variants={itemVariants} 
                                    key={report.id} 
                                    className={`rounded-2xl border overflow-hidden transition-colors ${
                                        theme === 'light' ? 'bg-white border-[#e0e0e0] hover:border-[#cccccc]' : 'bg-[#111111] border-[#333333] hover:border-[#555555]'
                                    }`}
                                >
                                    {/* Report Header Card */}
                                    <div 
                                        onClick={() => toggleTimeline(report.id)}
                                        className="p-6 md:p-8 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`px-3 py-1 text-[0.75rem] font-black tracking-wider uppercase rounded-full ${
                                                    theme === 'light' ? 'bg-[#f0f0f0] text-[#555555]' : 'bg-[#222222] text-white'
                                                }`}>
                                                    {report.category}
                                                </span>
                                                <span className={`px-3 py-1 text-[0.75rem] font-black tracking-wider uppercase rounded-full ${
                                                    report.priority === 'Critical' ? 'bg-[#ffcccc] text-[#cc0000]' : 
                                                    report.priority === 'High' ? 'bg-[#ffeebb] text-[#cc8800]' : 
                                                    'bg-[#ccffdd] text-[#00aa55]'
                                                }`}>
                                                    {report.priority}
                                                </span>
                                            </div>
                                            <h3 className={`text-[1.25rem] font-black mb-1 ${theme === 'light' ? 'text-black' : 'text-white'}`}>{report.title}</h3>
                                            <div className={`text-[0.8rem] font-mono flex items-center gap-2 ${theme === 'light' ? 'text-[#888888]' : 'text-[#888888]'}`}>
                                                <span>{currentT.lbl_id}: {report.id.substring(0, 8)}</span>
                                                <span>•</span>
                                                <span>{dateString}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 w-full md:w-auto">
                                            <div className="flex-1 md:flex-none">
                                                <div className={`text-[0.75rem] font-bold uppercase tracking-wider mb-1 ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>
                                                    {currentT.lbl_status}
                                                </div>
                                                <div className={`font-black text-[1rem] ${
                                                    report.status === 'Completed' ? (theme === 'light' ? 'text-[#00aa55]' : 'text-[#00ff88]') : 
                                                    (theme === 'light' ? 'text-[#cc8800]' : 'text-[#ffaa00]')
                                                }`}>
                                                    {report.status}
                                                </div>
                                            </div>
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border transition-colors ${
                                                theme === 'light' ? 'bg-[#f5f5f5] border-[#cccccc] text-black' : 'bg-[#000000] border-[#333333] text-white'
                                            }`}>
                                                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expandable Timeline Drawer */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className={`border-t overflow-hidden ${theme === 'light' ? 'border-[#e0e0e0] bg-[#fcfcfc]' : 'border-[#333333] bg-[#0a0a0a]'}`}
                                            >
                                                <div className="p-6 md:p-8">
                                                    <div className="flex items-center justify-between mb-8">
                                                        <h4 className={`text-[1.1rem] font-black ${theme === 'light' ? 'text-black' : 'text-white'}`}>{currentT.lbl_track}</h4>
                                                    </div>
                                                    
                                                    <div className="relative">
                                                        <div className={`absolute left-[19px] top-4 bottom-4 w-[2px] z-0 ${theme === 'light' ? 'bg-[#e0e0e0]' : 'bg-[#333333]'}`}></div>
                                                        
                                                        <div className="flex flex-col gap-8 relative z-10">
                                                            {timelineSteps.map((step, index) => {
                                                                const currentStage = getTimelineStage(report.status);
                                                                const isCompleted = index <= currentStage;
                                                                const isCurrent = index === currentStage;
                                                                const StepIcon = step.icon;

                                                                return (
                                                                    <div key={index} className="flex gap-6">
                                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 ${
                                                                            isCompleted 
                                                                                ? (theme === 'light' ? 'bg-black border-black text-white' : 'bg-white border-white text-black')
                                                                                : (theme === 'light' ? 'bg-[#f9f9f9] border-[#cccccc] text-[#888888]' : 'bg-[#000000] border-[#333333] text-[#555555]')
                                                                        }`}>
                                                                            <StepIcon size={18} />
                                                                        </div>
                                                                        <div className="pt-1">
                                                                            <h4 className={`text-[1.05rem] font-black ${
                                                                                isCompleted 
                                                                                    ? (theme === 'light' ? 'text-black' : 'text-white')
                                                                                    : 'text-[#888888]'
                                                                            }`}>
                                                                                {step.title}
                                                                            </h4>
                                                                            <p className={`text-[0.9rem] mt-1 ${
                                                                                isCurrent 
                                                                                    ? (theme === 'light' ? 'text-[#555555]' : 'text-[#aaaaaa]')
                                                                                    : (theme === 'light' ? 'text-[#888888]' : 'text-[#555555]')
                                                                            }`}>
                                                                                {step.desc}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
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
                        <a href="https://www.instagram.com/movyra.in" target="_blank" rel="noopener noreferrer" className={`transition-colors ${theme === 'light' ? 'hover:text-black' : 'hover:text-white'}`}>
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                        </a>
                        <a href="#x" className={`transition-colors ${theme === 'light' ? 'hover:text-black' : 'hover:text-white'}`}>
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.006 4.15H5.078z"/></svg>
                        </a>
                    </div>
                </div>
                
                <div className={`flex flex-col md:flex-row items-center gap-6 text-[0.8rem] font-bold ${theme === 'light' ? 'text-[#666666]' : 'text-[#555555]'}`}>
                    <div className="flex items-center gap-6">
                        <button onClick={() => setShowProductsPrompt(true)} className={`transition-colors outline-none ${theme === 'light' ? 'hover:text-black' : 'hover:text-white'}`}>{currentT.products}</button>
                        <span className={`w-1 h-1 rounded-full ${theme === 'light' ? 'bg-[#cccccc]' : 'bg-[#333333]'}`}></span>
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