import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from 'firebase/auth';
import { 
    Search, 
    ArrowLeft, 
    CheckCircle, 
    Clock, 
    Wrench, 
    FileText,
    Calendar,
    Image as ImageIcon,
    ShieldCheck,
    Sun,
    Moon,
    Home,
    LogOut,
    X,
    Globe,
    ArrowUp
} from 'lucide-react';
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import { useCivicStore } from '../../store/useCivicStore';

export default function IssueTracker() {
    const navigate = useNavigate();
    
    // 1. STATE MANAGEMENT
    const theme = useCivicStore((state) => state.theme);
    const toggleTheme = useCivicStore((state) => state.toggleTheme);
    const terminateSession = useCivicStore((state) => state.terminateSession);

    const [lang, setLang] = useState('en');
    const [showLangPrompt, setShowLangPrompt] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [activeRecord, setActiveRecord] = useState(null);
    const [recentRecords, setRecentRecords] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [searchMessage, setSearchMessage] = useState('');

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
        // Detect System Language
        const sysLang = navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'mr', 'gu', 'te', 'ta', 'pa', 'bho', 'ar', 'es', 'fr', 'de'];
        if (supported.includes(sysLang)) setLang(sysLang);

        const fetchRecentActivity = async () => {
            try {
                const complaintsRef = collection(db, 'civic_complaints');
                const recentQuery = query(complaintsRef, orderBy('createdAt', 'desc'), limit(5));
                const snapshot = await getDocs(recentQuery);
                
                const records = snapshot.docs.map(document => ({
                    id: document.id,
                    ...document.data()
                }));
                setRecentRecords(records);
            } catch (error) {
                console.error("Failed to retrieve recent activity logs:", error);
            }
        };

        fetchRecentActivity();
    }, []);

    // 2. 13-LANGUAGE DICTIONARY (Tracker Context)
    const t = {
        en: {
            lang: "English", help: "Help Center", back: "Return to Dashboard", log_out: "Log out", careers: "Careers",
            title: "Track Issue", sub: "Monitor the status of your reported issue.",
            search_ph: "Enter Tracking ID...", btn_retrieve: "Track Issue", btn_query: "Searching...",
            err_not_found: "No record found matching this ID.", err_net: "Network failed. Please try again.",
            lbl_priority: "Priority", lbl_est_res: "Estimated Resolution", lbl_timeline: "Timeline", lbl_desc: "Details", 
            lbl_doc: "Image", lbl_recent: "Recent Reports", lbl_retrieving: "Loading...", lbl_status: "Status", lbl_id: "ID",
            step1_title: "Reported", step1_desc: "Report sent to the database.",
            step2_title: "Assigned", step2_desc: "Team assigned to the issue.",
            step3_title: "In Progress", step3_desc: "Team is working on the repair.",
            step4_title: "Resolved", step4_desc: "Issue fixed and verified.",
            concluded: "Resolved", pending: "Pending"
        },
        hi: {
            lang: "हिन्दी", help: "सहायता केंद्र", back: "डैशबोर्ड पर लौटें", log_out: "लॉग आउट", careers: "करियर",
            title: "समस्या ट्रैक करें", sub: "अपनी रिपोर्ट की गई समस्या की स्थिति देखें।",
            search_ph: "ट्रैकिंग आईडी दर्ज करें...", btn_retrieve: "ट्रैक करें", btn_query: "खोजा जा रहा है...",
            err_not_found: "इस आईडी से मेल खाने वाला कोई रिकॉर्ड नहीं मिला।", err_net: "नेटवर्क विफल। कृपया पुनः प्रयास करें।",
            lbl_priority: "प्राथमिकता", lbl_est_res: "अनुमानित समाधान", lbl_timeline: "समयरेखा", lbl_desc: "विवरण", 
            lbl_doc: "छवि", lbl_recent: "हाल की रिपोर्टें", lbl_retrieving: "लोड हो रहा है...", lbl_status: "स्थिति", lbl_id: "आईडी",
            step1_title: "रिपोर्ट किया गया", step1_desc: "रिपोर्ट डेटाबेस में भेजी गई।",
            step2_title: "असाइन किया गया", step2_desc: "समस्या के लिए टीम असाइन की गई।",
            step3_title: "प्रगति पर है", step3_desc: "टीम मरम्मत पर काम कर रही है।",
            step4_title: "हल हो गया", step4_desc: "समस्या ठीक हो गई और सत्यापित हो गई।",
            concluded: "हल हो गया", pending: "लंबित"
        },
        hinglish: {
            lang: "Hinglish", help: "Help Center", back: "Dashboard par wapas jayein", log_out: "Log out", careers: "Careers",
            title: "Issue Track Karein", sub: "Apni reported issue ka status dekhein.",
            search_ph: "Tracking ID enter karein...", btn_retrieve: "Track Karein", btn_query: "Search ho raha hai...",
            err_not_found: "Is ID se match karta koi record nahi mila.", err_net: "Network fail ho gaya. Phir se try karein.",
            lbl_priority: "Priority", lbl_est_res: "Estimated Resolution", lbl_timeline: "Timeline", lbl_desc: "Details", 
            lbl_doc: "Image", lbl_recent: "Recent Reports", lbl_retrieving: "Load ho raha hai...", lbl_status: "Status", lbl_id: "ID",
            step1_title: "Reported", step1_desc: "Report database me bhej di gayi hai.",
            step2_title: "Assigned", step2_desc: "Issue ke liye team assign ho gayi hai.",
            step3_title: "In Progress", step3_desc: "Team repair par kaam kar rahi hai.",
            step4_title: "Resolved", step4_desc: "Issue fix aur verify ho gaya hai.",
            concluded: "Resolved", pending: "Pending"
        },
        mr: {
            lang: "मराठी", help: "मदत केंद्र", back: "डॅशबोर्डवर परत जा", log_out: "लॉग आउट", careers: "करिअर",
            title: "समस्या ट्रॅक करा", sub: "तुमच्या नोंदवलेल्या समस्येची स्थिती पहा.",
            search_ph: "ट्रॅकिंग आयडी एंटर करा...", btn_retrieve: "ट्रॅक करा", btn_query: "शोधत आहे...",
            err_not_found: "या आयडीशी जुळणारा कोणताही रेकॉर्ड आढळला नाही.", err_net: "नेटवर्क अयशस्वी. कृपया पुन्हा प्रयत्न करा.",
            lbl_priority: "प्राधान्य", lbl_est_res: "अंदाजित रिझोल्यूशन", lbl_timeline: "टाइमलाइन", lbl_desc: "तपशील", 
            lbl_doc: "प्रतिमा", lbl_recent: "अलीकडील अहवाल", lbl_retrieving: "लोड करत आहे...", lbl_status: "स्थिती", lbl_id: "आयडी",
            step1_title: "नोंदवली", step1_desc: "अहवाल डेटाबेसमध्ये पाठवला.",
            step2_title: "नियुक्त केले", step2_desc: "समस्येसाठी टीम नियुक्त केली.",
            step3_title: "प्रगतीपथावर", step3_desc: "टीम दुरुस्तीवर काम करत आहे.",
            step4_title: "सुटली", step4_desc: "समस्या दूर केली आणि सत्यापित केली.",
            concluded: "सुटली", pending: "प्रलंबित"
        },
        gu: {
            lang: "ગુજરાતી", help: "મદદ કેન્દ્ર", back: "ડેશબોર્ડ પર પાછા ફરો", log_out: "લૉગ આઉટ", careers: "કારકિર્દી",
            title: "સમસ્યાને ટ્રૅક કરો", sub: "તમારી નોંધાયેલી સમસ્યાની સ્થિતિ જુઓ.",
            search_ph: "ટ્રેકિંગ આઈડી દાખલ કરો...", btn_retrieve: "ટ્રૅક કરો", btn_query: "શોધાઇ રહ્યુ છે...",
            err_not_found: "આ આઈડી સાથે મેળ ખાતો કોઈ રેકોર્ડ મળ્યો નથી.", err_net: "નેટવર્ક નિષ્ફળ ગયું. કૃપા કરીને ફરી પ્રયાસ કરો.",
            lbl_priority: "પ્રાધાન્ય", lbl_est_res: "અંદાજિત રિઝોલ્યુશન", lbl_timeline: "ટાઇમલાઇન", lbl_desc: "વિગતો", 
            lbl_doc: "છબી", lbl_recent: "તાજેતરના અહેવાલો", lbl_retrieving: "લોડ થઈ રહ્યું છે...", lbl_status: "સ્થિતિ", lbl_id: "આઈડી",
            step1_title: "નોંધાયેલ", step1_desc: "રિપોર્ટ ડેટાબેઝમાં મોકલવામાં આવ્યો.",
            step2_title: "સોંપાયેલ", step2_desc: "સમસ્યા માટે ટીમ સોંપવામાં આવી.",
            step3_title: "પ્રગતિમાં છે", step3_desc: "ટીમ સમારકામ પર કામ કરી રહી છે.",
            step4_title: "ઉકેલાઈ", step4_desc: "સમસ્યા ઉકેલાઈ અને ચકાસવામાં આવી.",
            concluded: "ઉકેલાઈ", pending: "બાકી છે"
        },
        te: {
            lang: "తెలుగు", help: "సహాయ కేంద్రం", back: "డ్యాష్‌బోర్డ్‌కు తిరిగి వెళ్లండి", log_out: "లాగౌట్", careers: "కెరీర్స్",
            title: "సమస్యను ట్రాక్ చేయండి", sub: "మీరు నివేదించిన సమస్య యొక్క స్థితిని చూడండి.",
            search_ph: "ట్రాకింగ్ ఐడిని నమోదు చేయండి...", btn_retrieve: "ట్రాక్ చేయండి", btn_query: "వెతుకుతోంది...",
            err_not_found: "ఈ ఐడికి సరిపోలే రికార్డు ఏదీ కనుగొనబడలేదు.", err_net: "నెట్‌వర్క్ విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.",
            lbl_priority: "ప్రాధాన్యత", lbl_est_res: "అంచనా వేసిన రిజల్యూషన్", lbl_timeline: "కాలక్రమం", lbl_desc: "వివరాలు", 
            lbl_doc: "చిత్రం", lbl_recent: "ఇటీవలి నివేదికలు", lbl_retrieving: "లోడ్ అవుతోంది...", lbl_status: "స్థితి", lbl_id: "ఐడి",
            step1_title: "నివేదించబడింది", step1_desc: "నివేదిక డేటాబేస్కు పంపబడింది.",
            step2_title: "కేటాయించబడింది", step2_desc: "సమస్య కోసం బృందం కేటాయించబడింది.",
            step3_title: "పురోగతిలో ఉంది", step3_desc: "బృందం మరమ్మత్తుపై పనిచేస్తోంది.",
            step4_title: "పరిష్కరించబడింది", step4_desc: "సమస్య పరిష్కరించబడింది మరియు ధృవీకరించబడింది.",
            concluded: "పరిష్కరించబడింది", pending: "పెండింగ్‌లో ఉంది"
        },
        ta: {
            lang: "தமிழ்", help: "உதவி மையம்", back: "டாஷ்போர்டுக்குத் திரும்பு", log_out: "வெளியேறு", careers: "தொழில்கள்",
            title: "பிரச்சனையைக் கண்காணிக்கவும்", sub: "நீங்கள் புகாரளித்த பிரச்சனையின் நிலையைப் பார்க்கவும்.",
            search_ph: "கண்காணிப்பு ஐடியை உள்ளிடவும்...", btn_retrieve: "கண்காணிக்கவும்", btn_query: "தேடப்படுகிறது...",
            err_not_found: "இந்த ஐடியுடன் பொருந்தும் எந்த பதிவும் கிடைக்கவில்லை.", err_net: "நெட்வொர்க் தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.",
            lbl_priority: "முன்னுரிமை", lbl_est_res: "மதிப்பிடப்பட்ட தீர்வு", lbl_timeline: "காலவரிசை", lbl_desc: "விவரங்கள்", 
            lbl_doc: "படம்", lbl_recent: "சமீபத்திய அறிக்கைகள்", lbl_retrieving: "ஏற்றுகிறது...", lbl_status: "நிலை", lbl_id: "ஐடி",
            step1_title: "புகாரளிக்கப்பட்டது", step1_desc: "அறிக்கை தரவுத்தளத்திற்கு அனுப்பப்பட்டது.",
            step2_title: "ஒதுக்கப்பட்டுள்ளது", step2_desc: "பிரச்சனைக்கு குழு ஒதுக்கப்பட்டுள்ளது.",
            step3_title: "நடைபெறுகிறது", step3_desc: "குழு பழுதுபார்க்கும் பணியில் ஈடுபட்டுள்ளது.",
            step4_title: "தீர்க்கப்பட்டது", step4_desc: "பிரச்சனை சரி செய்யப்பட்டு சரிபார்க்கப்பட்டது.",
            concluded: "தீர்க்கப்பட்டது", pending: "நிலுவையில் உள்ளது"
        },
        pa: {
            lang: "ਪੰਜਾਬੀ", help: "ਸਹਾਇਤਾ ਕੇਂਦਰ", back: "ਡੈਸ਼ਬੋਰਡ 'ਤੇ ਵਾਪਸ ਜਾਓ", log_out: "ਲੌਗ ਆਉਟ", careers: "ਕਰੀਅਰ",
            title: "ਸਮੱਸਿਆ ਨੂੰ ਟ੍ਰੈਕ ਕਰੋ", sub: "ਆਪਣੀ ਰਿਪੋਰਟ ਕੀਤੀ ਸਮੱਸਿਆ ਦੀ ਸਥਿਤੀ ਦੇਖੋ।",
            search_ph: "ਟ੍ਰੈਕਿੰਗ ਆਈਡੀ ਦਰਜ ਕਰੋ...", btn_retrieve: "ਟ੍ਰੈਕ ਕਰੋ", btn_query: "ਖੋਜ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ...",
            err_not_found: "ਇਸ ਆਈਡੀ ਨਾਲ ਮੇਲ ਖਾਂਦਾ ਕੋਈ ਰਿਕਾਰਡ ਨਹੀਂ ਮਿਲਿਆ।", err_net: "ਨੈੱਟਵਰਕ ਫੇਲ੍ਹ ਹੋ ਗਿਆ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
            lbl_priority: "ਤਰਜੀਹ", lbl_est_res: "ਅਨੁਮਾਨਿਤ ਰੈਜ਼ੋਲੂਸ਼ਨ", lbl_timeline: "ਸਮਾਂਰੇਖਾ", lbl_desc: "ਵੇਰਵੇ", 
            lbl_doc: "ਚਿੱਤਰ", lbl_recent: "ਤਾਜ਼ਾ ਰਿਪੋਰਟਾਂ", lbl_retrieving: "ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...", lbl_status: "ਸਥਿਤੀ", lbl_id: "ਆਈਡੀ",
            step1_title: "ਰਿਪੋਰਟ ਕੀਤੀ ਗਈ", step1_desc: "ਰਿਪੋਰਟ ਡੇਟਾਬੇਸ ਨੂੰ ਭੇਜੀ ਗਈ।",
            step2_title: "ਨਿਰਧਾਰਤ ਕੀਤਾ ਗਿਆ", step2_desc: "ਸਮੱਸਿਆ ਲਈ ਟੀਮ ਨਿਰਧਾਰਤ ਕੀਤੀ ਗਈ।",
            step3_title: "ਜਾਰੀ ਹੈ", step3_desc: "ਟੀਮ ਮੁਰੰਮਤ 'ਤੇ ਕੰਮ ਕਰ ਰਹੀ ਹੈ।",
            step4_title: "ਹੱਲ ਹੋ ਗਈ", step4_desc: "ਸਮੱਸਿਆ ਠੀਕ ਹੋ ਗਈ ਅਤੇ ਪ੍ਰਮਾਣਿਤ ਹੋ ਗਈ।",
            concluded: "ਹੱਲ ਹੋ ਗਈ", pending: "ਲੰਬਿਤ ਹੈ"
        },
        bho: {
            lang: "भोजपुरी", help: "मदद केंद्र", back: "डैशबोर्ड पर वापस जाईं", log_out: "लॉग आउट", careers: "करियर",
            title: "समस्या के ट्रैक करीं", sub: "आपन रिपोर्ट कइल गइल समस्या के स्थिति देखीं।",
            search_ph: "ट्रैकिंग आईडी दर्ज करीं...", btn_retrieve: "ट्रैक करीं", btn_query: "खोजल जा रहल बा...",
            err_not_found: "एह आईडी से मेल खाए वाला कवनो रिकॉर्ड ना मिलल।", err_net: "नेटवर्क विफल हो गइल। कृपया फेर से प्रयास करीं।",
            lbl_priority: "प्राथमिकता", lbl_est_res: "अनुमानित समाधान", lbl_timeline: "समयरेखा", lbl_desc: "विवरण", 
            lbl_doc: "छवि", lbl_recent: "हाल के रिपोर्ट", lbl_retrieving: "लोड हो रहल बा...", lbl_status: "स्थिति", lbl_id: "आईडी",
            step1_title: "रिपोर्ट कइल गइल", step1_desc: "रिपोर्ट डेटाबेस में भेजल गइल।",
            step2_title: "असाइन कइल गइल", step2_desc: "समस्या खातिर टीम असाइन कइल गइल।",
            step3_title: "प्रगति पर बा", step3_desc: "टीम मरम्मत पर काम कर रहल बा।",
            step4_title: "हल हो गइल", step4_desc: "समस्या ठीक हो गइल आ सत्यापित हो गइल।",
            concluded: "हल हो गइल", pending: "लंबित"
        },
        ar: {
            lang: "العربية", help: "مركز المساعدة", back: "العودة إلى لوحة القيادة", log_out: "تسجيل الخروج", careers: "الوظائف",
            title: "تتبع المشكلة", sub: "مراقبة حالة مشكلتك المبلغ عنها.",
            search_ph: "أدخل معرف التتبع...", btn_retrieve: "تتبع المشكلة", btn_query: "جاري البحث...",
            err_not_found: "لم يتم العثور على سجل يطابق هذا المعرف.", err_net: "فشل الشبكة. يرجى المحاولة مرة أخرى.",
            lbl_priority: "الأولوية", lbl_est_res: "الحل المقدر", lbl_timeline: "الجدول الزمني", lbl_desc: "التفاصيل", 
            lbl_doc: "الصورة", lbl_recent: "التقارير الأخيرة", lbl_retrieving: "جاري التحميل...", lbl_status: "الحالة", lbl_id: "المعرف",
            step1_title: "تم الإبلاغ", step1_desc: "تم إرسال التقرير إلى قاعدة البيانات.",
            step2_title: "تم التعيين", step2_desc: "تم تعيين فريق للمشكلة.",
            step3_title: "قيد التنفيذ", step3_desc: "الفريق يعمل على الإصلاح.",
            step4_title: "تم الحل", step4_desc: "تم إصلاح المشكلة والتحقق منها.",
            concluded: "تم الحل", pending: "قيد الانتظار"
        },
        es: {
            lang: "Español", help: "Centro de ayuda", back: "Volver al Tablero", log_out: "Cerrar sesión", careers: "Carreras",
            title: "Rastrear Problema", sub: "Supervise el estado de su problema reportado.",
            search_ph: "Ingrese el ID de Rastreo...", btn_retrieve: "Rastrear", btn_query: "Buscando...",
            err_not_found: "No se encontró ningún registro que coincida con este ID.", err_net: "Fallo de red. Por favor, inténtelo de nuevo.",
            lbl_priority: "Prioridad", lbl_est_res: "Resolución Estimada", lbl_timeline: "Cronograma", lbl_desc: "Detalles", 
            lbl_doc: "Imagen", lbl_recent: "Reportes Recientes", lbl_retrieving: "Cargando...", lbl_status: "Estado", lbl_id: "ID",
            step1_title: "Reportado", step1_desc: "Reporte enviado a la base de datos.",
            step2_title: "Asignado", step2_desc: "Equipo asignado al problema.",
            step3_title: "En Progreso", step3_desc: "El equipo está trabajando en la reparación.",
            step4_title: "Resuelto", step4_desc: "Problema solucionado y verificado.",
            concluded: "Resuelto", pending: "Pendiente"
        },
        fr: {
            lang: "Français", help: "Centre d'aide", back: "Retour au Tableau de bord", log_out: "Se déconnecter", careers: "Carrières",
            title: "Suivre le Problème", sub: "Surveillez l'état de votre problème signalé.",
            search_ph: "Entrez l'ID de Suivi...", btn_retrieve: "Suivre", btn_query: "Recherche...",
            err_not_found: "Aucun enregistrement trouvé correspondant à cet ID.", err_net: "Échec du réseau. Veuillez réessayer.",
            lbl_priority: "Priorité", lbl_est_res: "Résolution Estimée", lbl_timeline: "Chronologie", lbl_desc: "Détails", 
            lbl_doc: "Image", lbl_recent: "Rapports Récents", lbl_retrieving: "Chargement...", lbl_status: "Statut", lbl_id: "ID",
            step1_title: "Signalé", step1_desc: "Rapport envoyé à la base de données.",
            step2_title: "Assigné", step2_desc: "Équipe assignée au problème.",
            step3_title: "En Cours", step3_desc: "L'équipe travaille sur la réparation.",
            step4_title: "Résolu", step4_desc: "Problème corrigé et vérifié.",
            concluded: "Résolu", pending: "En attente"
        },
        de: {
            lang: "Deutsch", help: "Hilfezentrum", back: "Zurück zum Dashboard", log_out: "Abmelden", careers: "Karriere",
            title: "Problem Verfolgen", sub: "Überwachen Sie den Status Ihres gemeldeten Problems.",
            search_ph: "Tracking-ID eingeben...", btn_retrieve: "Verfolgen", btn_query: "Suchen...",
            err_not_found: "Kein Datensatz für diese ID gefunden.", err_net: "Netzwerkfehler. Bitte versuchen Sie es erneut.",
            lbl_priority: "Priorität", lbl_est_res: "Geschätzte Lösung", lbl_timeline: "Zeitplan", lbl_desc: "Details", 
            lbl_doc: "Bild", lbl_recent: "Aktuelle Berichte", lbl_retrieving: "Laden...", lbl_status: "Status", lbl_id: "ID",
            step1_title: "Gemeldet", step1_desc: "Bericht an die Datenbank gesendet.",
            step2_title: "Zugewiesen", step2_desc: "Team dem Problem zugewiesen.",
            step3_title: "In Bearbeitung", step3_desc: "Das Team arbeitet an der Reparatur.",
            step4_title: "Gelöst", step4_desc: "Problem behoben und verifiziert.",
            concluded: "Gelöst", pending: "Ausstehend"
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

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsProcessing(true);
        setSearchMessage('');
        setActiveRecord(null);

        try {
            const documentRef = doc(db, 'civic_complaints', searchQuery.trim());
            const documentSnapshot = await getDoc(documentRef);

            if (documentSnapshot.exists()) {
                setActiveRecord({ id: documentSnapshot.id, ...documentSnapshot.data() });
            } else {
                setSearchMessage(currentT.err_not_found);
            }
        } catch (error) {
            console.error("Search execution failed:", error);
            setSearchMessage(currentT.err_net);
        } finally {
            setIsProcessing(false);
        }
    };

    const loadRecordDirectly = (record) => {
        setActiveRecord(record);
        setSearchQuery(record.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const calculateEstimatedResolution = (createdAt, priority) => {
        if (!createdAt) return currentT.pending;
        
        const baseDate = createdAt.toDate();
        let daysToAdd = 7; // Standard Priority default
        
        if (priority === 'Critical') daysToAdd = 1;
        if (priority === 'High') daysToAdd = 3;

        baseDate.setDate(baseDate.getDate() + daysToAdd);
        return baseDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const getTimelineStage = (status) => {
        const stages = ['Submitted', 'Assigned', 'In Progress', 'Completed'];
        const currentIndex = stages.indexOf(status);
        return currentIndex >= 0 ? currentIndex : 0;
    };

    const timelineSteps = [
        { title: currentT.step1_title, icon: FileText, description: currentT.step1_desc },
        { title: currentT.step2_title, icon: ShieldCheck, description: currentT.step2_desc },
        { title: currentT.step3_title, icon: Wrench, description: currentT.step3_desc },
        { title: currentT.step4_title, icon: CheckCircle, description: currentT.step4_desc }
    ];

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
            <header className="w-full flex items-center justify-between px-6 md:px-12 py-8 animate-fade relative z-50">
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
                    {/* Desktop Text Logout */}
                    <button 
                        onClick={handleSignOut} 
                        className={`transition-colors outline-none hidden sm:block ${theme === 'light' ? 'text-[#555555] hover:text-black' : 'text-[#888888] hover:text-white'}`}
                    >
                        {currentT.log_out}
                    </button>
                    
                    {/* Mobile Icon Logout */}
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

            <div className="flex-1 max-w-[1000px] w-full mx-auto px-6 md:px-12 pb-12 mt-8 animate-fade">
                
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

                {/* Search Interface */}
                <div className={`rounded-2xl p-6 md:p-8 mb-12 border ${theme === 'light' ? 'bg-white border-[#e0e0e0]' : 'bg-[#111111] border-[#333333]'}`}>
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555555]" />
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={currentT.search_ph} 
                                className={`w-full pl-12 pr-4 py-4 rounded-xl outline-none transition-colors text-[0.95rem] border ${
                                    theme === 'light' ? 'bg-[#f5f5f5] border-[#cccccc] text-black focus:border-black' : 'bg-[#000000] border-[#333333] text-white focus:border-white'
                                }`}
                            />
                        </div>
                        <button 
                            type="submit"
                            disabled={isProcessing || !searchQuery.trim()}
                            className={`px-8 py-4 rounded-xl font-black text-[0.95rem] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 outline-none ${
                                theme === 'light' ? 'bg-black text-white hover:bg-[#333333]' : 'bg-white text-black hover:bg-[#e0e0e0]'
                            }`}
                        >
                            {isProcessing ? currentT.btn_query : currentT.btn_retrieve}
                        </button>
                    </form>
                    {searchMessage && (
                        <p className="text-[#ff4444] text-[0.9rem] mt-4 font-bold">{searchMessage}</p>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    {activeRecord ? (
                        <motion.div 
                            key="active-record"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`rounded-2xl overflow-hidden border ${theme === 'light' ? 'bg-white border-[#e0e0e0]' : 'bg-[#111111] border-[#333333]'}`}
                        >
                            <div className={`p-6 md:p-8 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${theme === 'light' ? 'border-[#e0e0e0]' : 'border-[#333333]'}`}>
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-3 py-1 text-[0.75rem] font-black tracking-wider uppercase rounded-full ${
                                            theme === 'light' ? 'bg-[#f0f0f0] text-[#555555]' : 'bg-[#222222] text-white'
                                        }`}>
                                            {activeRecord.category}
                                        </span>
                                        <span className={`px-3 py-1 text-[0.75rem] font-black tracking-wider uppercase rounded-full ${
                                            activeRecord.priority === 'Critical' ? 'bg-[#ffcccc] text-[#cc0000]' : 
                                            activeRecord.priority === 'High' ? 'bg-[#ffeebb] text-[#cc8800]' : 
                                            'bg-[#ccffdd] text-[#00aa55]'
                                        }`}>
                                            {activeRecord.priority} {currentT.lbl_priority}
                                        </span>
                                    </div>
                                    <h2 className={`text-[1.5rem] font-black ${theme === 'light' ? 'text-black' : 'text-white'}`}>{activeRecord.title}</h2>
                                    <p className={`text-[0.9rem] font-mono mt-1 ${theme === 'light' ? 'text-[#888888]' : 'text-[#888888]'}`}>{currentT.lbl_id}: {activeRecord.id}</p>
                                </div>
                                
                                <div className={`rounded-xl p-4 min-w-[200px] border ${theme === 'light' ? 'bg-[#f9f9f9] border-[#e0e0e0]' : 'bg-[#000000] border-[#333333]'}`}>
                                    <div className="flex items-center gap-2 text-[#888888] text-[0.8rem] font-bold uppercase tracking-wider mb-1">
                                        <Calendar size={14} /> {currentT.lbl_est_res}
                                    </div>
                                    <div className={`font-bold text-[0.95rem] ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                                        {activeRecord.status === 'Completed' ? currentT.concluded : calculateEstimatedResolution(activeRecord.createdAt, activeRecord.priority)}
                                    </div>
                                </div>
                            </div>

                            <div className={`p-6 md:p-8 border-b ${theme === 'light' ? 'border-[#e0e0e0]' : 'border-[#333333]'}`}>
                                <h3 className={`text-[1.1rem] font-black mb-6 ${theme === 'light' ? 'text-black' : 'text-white'}`}>{currentT.lbl_timeline}</h3>
                                <div className="relative">
                                    <div className={`absolute left-[19px] top-4 bottom-4 w-[2px] z-0 ${theme === 'light' ? 'bg-[#e0e0e0]' : 'bg-[#333333]'}`}></div>
                                    
                                    <div className="flex flex-col gap-8 relative z-10">
                                        {timelineSteps.map((step, index) => {
                                            const currentStage = getTimelineStage(activeRecord.status);
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
                                                            {step.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className={`p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 ${theme === 'light' ? 'bg-[#f9f9f9]' : 'bg-[#0a0a0a]'}`}>
                                <div>
                                    <h3 className="text-[0.9rem] font-bold text-[#888888] uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <FileText size={16} /> {currentT.lbl_desc}
                                    </h3>
                                    <p className={`text-[0.95rem] leading-relaxed whitespace-pre-wrap ${theme === 'light' ? 'text-[#555555]' : 'text-[#aaaaaa]'}`}>
                                        {activeRecord.description}
                                    </p>
                                </div>
                                
                                {activeRecord.evidenceUrl && (
                                    <div>
                                        <h3 className="text-[0.9rem] font-bold text-[#888888] uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <ImageIcon size={16} /> {currentT.lbl_doc}
                                        </h3>
                                        <div className={`w-full aspect-video rounded-xl overflow-hidden border ${theme === 'light' ? 'bg-[#e0e0e0] border-[#cccccc]' : 'bg-[#000000] border-[#333333]'}`}>
                                            <img 
                                                src={activeRecord.evidenceUrl} 
                                                alt="Infrastructure Deficiency Documentation" 
                                                className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="recent-records"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <h3 className={`text-[1.2rem] font-black mb-6 flex items-center gap-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                                <Clock size={20} className="text-[#888888]" /> {currentT.lbl_recent}
                            </h3>
                            
                            {recentRecords.length === 0 ? (
                                <div className={`rounded-2xl p-10 text-center border ${theme === 'light' ? 'bg-white border-[#e0e0e0]' : 'bg-[#111111] border-[#333333]'}`}>
                                    <p className="text-[#888888]">{currentT.lbl_retrieving}</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    {recentRecords.map((record) => (
                                        <div 
                                            key={record.id}
                                            onClick={() => loadRecordDirectly(record)}
                                            className={`p-6 rounded-2xl transition-colors cursor-pointer group border ${
                                                theme === 'light' ? 'bg-white border-[#e0e0e0] hover:border-black' : 'bg-[#111111] border-[#333333] hover:border-white'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start gap-4 mb-3">
                                                <h4 className={`text-[1.1rem] font-black group-hover:underline ${theme === 'light' ? 'text-black' : 'text-white'}`}>{record.title}</h4>
                                                <span className="shrink-0 text-[0.8rem] font-mono text-[#888888]">{currentT.lbl_id}: {record.id.substring(0, 8)}...</span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4 text-[0.85rem] font-bold">
                                                <span className={theme === 'light' ? 'text-[#666666]' : 'text-[#aaaaaa]'}>{record.category}</span>
                                                <span className={`w-1 h-1 rounded-full ${theme === 'light' ? 'bg-[#cccccc]' : 'bg-[#333333]'}`}></span>
                                                <span className={record.status === 'Completed' ? 'text-[#00aa55]' : 'text-[#cc8800]'}>
                                                    {currentT.lbl_status}: {record.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* FOOTER ALIGNMENT */}
            <footer className={`w-full mx-auto mt-auto flex flex-col md:flex-row items-center justify-between gap-8 px-8 md:px-16 py-12 border-t opacity-0 animate-fade stagger-3 relative z-10 ${
                theme === 'light' ? 'border-[#e0e0e0] bg-[#ffffff]' : 'border-[#111111] bg-[#050505]'
            }`}>
                
                {/* Social Icons & Utilities */}
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
                    
                    {/* Image Attribution Link (Theme Aware) */}
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
                    
                    {/* Back to Top */}
                    <button onClick={scrollToTop} className={`p-2 rounded-full transition-colors border outline-none ${theme === 'light' ? 'bg-[#f5f5f5] border-[#cccccc] hover:bg-[#e0e0e0]' : 'bg-[#111111] border-[#333333] hover:bg-[#222222]'}`}>
                        <ArrowUp size={16} />
                    </button>
                </div>
            </footer>
        </div>
    );
}