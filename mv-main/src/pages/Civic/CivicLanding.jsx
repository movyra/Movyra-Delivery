import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from 'firebase/auth';
import { 
    AlertTriangle, 
    FileText, 
    Activity, 
    Map, 
    ArrowRight, 
    ShieldCheck, 
    Clock, 
    TrendingUp,
    MapPin,
    Sun,
    Moon,
    X,
    Globe,
    ArrowUp,
    Home,
    LogOut
} from 'lucide-react';
import { collection, getDocs, query, limit, where } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import { getPublicNotices } from '../../services/civicService';
import { useCivicStore } from '../../store/useCivicStore';

export default function CivicLanding() {
    const navigate = useNavigate();
    
    // 1. STATE MANAGEMENT
    const currentLocation = useCivicStore((state) => state.currentLocation);
    const theme = useCivicStore((state) => state.theme);
    const toggleTheme = useCivicStore((state) => state.toggleTheme);
    const terminateSession = useCivicStore((state) => state.terminateSession);
    
    const [lang, setLang] = useState('en');
    const [showLangPrompt, setShowLangPrompt] = useState(false);
    
    const [notices, setNotices] = useState([]);
    const [healthMetrics, setHealthMetrics] = useState({
        totalActive: 0,
        resolvedToday: 0,
        averageResolutionTime: 'Calculating...',
        healthScore: 100
    });
    const [isLoading, setIsLoading] = useState(true);

    const localCity = "Mumbai";

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

    useEffect(() => {
        const sysLang = navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'mr', 'gu', 'te', 'ta', 'pa', 'bho', 'ar', 'es', 'fr', 'de'];
        if (supported.includes(sysLang)) setLang(sysLang);

        const initializeCivicPortal = async () => {
            setIsLoading(true);
            try {
                const fetchedNotices = await getPublicNotices();
                setNotices(fetchedNotices);

                const complaintsRef = collection(db, 'civic_complaints');
                
                const activeQuery = query(complaintsRef, where('status', 'in', ['Submitted', 'Assigned', 'In Progress']));
                const activeSnapshot = await getDocs(activeQuery);
                const activeCount = activeSnapshot.size;

                const resolvedQuery = query(complaintsRef, where('status', '==', 'Completed'), limit(100));
                const resolvedSnapshot = await getDocs(resolvedQuery);
                const resolvedCount = resolvedSnapshot.size;

                const totalIssues = activeCount + resolvedCount;
                let currentScore = 100;
                if (totalIssues > 0) {
                    const resolutionRate = (resolvedCount / totalIssues) * 100;
                    currentScore = Math.max(10, Math.round(resolutionRate)); 
                }

                setHealthMetrics({
                    totalActive: activeCount,
                    resolvedToday: resolvedCount, 
                    averageResolutionTime: resolvedCount > 0 ? '48 Hours' : 'Pending Data',
                    healthScore: currentScore
                });

            } catch (error) {
                console.error("Failed to initialize civic data streams:", error);
            } finally {
                setIsLoading(false);
            }
        };

        initializeCivicPortal();
    }, []);

    // 2. 13-LANGUAGE DASHBOARD DICTIONARY
    const t = {
        en: {
            lang: "English", log_out: "Log out", careers: "Careers",
            main_title: "Smart Infrastructure Management.", main_sub: "A centralized platform to monitor infrastructure, report issues, and track resolutions with absolute transparency.",
            report_title: "Report Incident", report_sub: "Submit a new infrastructure deficiency for municipal review.", report_btn: "Initiate Report",
            track_title: "Track Resolution", track_sub: "Monitor the real-time status of active infrastructure repairs.", track_btn: "View Tracker",
            map_title: "Zone Heatmap", map_sub: "Analyze geographic clusters of reported civic deficiencies.", map_btn: "Explore Map",
            data_title: "Performance Data", data_sub: "Review departmental response times and resolution metrics.", data_btn: "Access Analytics",
            score: "Infrastructure Score", localized: "Localized", active: "Active Incidents", avg_res: "Avg. Resolution",
            notices: "Official Directives", archive: "View Archive", no_notices: "No Active Directives", no_notices_sub: "There are currently no active public notices for your operational zone."
        },
        hi: {
            lang: "हिन्दी", log_out: "लॉग आउट", careers: "करियर",
            main_title: "स्मार्ट इंफ्रास्ट्रक्चर प्रबंधन।", main_sub: "बुनियादी ढांचे की निगरानी, समस्याओं की रिपोर्ट करने और पारदर्शिता के साथ समाधान ट्रैक करने का एक मंच।",
            report_title: "घटना की रिपोर्ट करें", report_sub: "नगर निगम समीक्षा के लिए एक नई कमी दर्ज करें।", report_btn: "रिपोर्ट शुरू करें",
            track_title: "समाधान ट्रैक करें", track_sub: "सक्रिय मरम्मत की वास्तविक समय स्थिति की निगरानी करें।", track_btn: "ट्रैकर देखें",
            map_title: "ज़ोन हीटमैप", map_sub: "रिपोर्ट की गई नागरिक कमियों के भौगोलिक समूहों का विश्लेषण करें।", map_btn: "मानचित्र देखें",
            data_title: "प्रदर्शन डेटा", data_sub: "विभागीय प्रतिक्रिया समय और समाधान मेट्रिक्स की समीक्षा करें।", data_btn: "एनालिटिक्स देखें",
            score: "इंफ्रास्ट्रक्चर स्कोर", localized: "स्थानीयकृत", active: "सक्रिय घटनाएं", avg_res: "औसत समाधान",
            notices: "आधिकारिक निर्देश", archive: "पुरालेख देखें", no_notices: "कोई सक्रिय निर्देश नहीं", no_notices_sub: "आपके परिचालन क्षेत्र के लिए वर्तमान में कोई सक्रिय सार्वजनिक नोटिस नहीं हैं।"
        },
        hinglish: {
            lang: "Hinglish", log_out: "Log out", careers: "Careers",
            main_title: "Smart Infrastructure Management.", main_sub: "Public infrastructure monitor karne aur issues report karne ka centralized platform.",
            report_title: "Incident Report Karein", report_sub: "Municipal review ke liye naya issue submit karein.", report_btn: "Report Initiate Karein",
            track_title: "Resolution Track Karein", track_sub: "Active repairs ka real-time status monitor karein.", track_btn: "Tracker Dekhein",
            map_title: "Zone Heatmap", map_sub: "Reported civic issues ke geographic clusters analyze karein.", map_btn: "Map Explore Karein",
            data_title: "Performance Data", data_sub: "Department response time aur metrics review karein.", data_btn: "Analytics Access Karein",
            score: "Infrastructure Score", localized: "Localized", active: "Active Incidents", avg_res: "Avg. Resolution",
            notices: "Official Directives", archive: "Archive Dekhein", no_notices: "No Active Directives", no_notices_sub: "Aapke zone me abhi koi active public notice nahi hai."
        },
        mr: {
            lang: "मराठी", log_out: "लॉग आउट", careers: "करिअर",
            main_title: "स्मार्ट इन्फ्रास्ट्रक्चर व्यवस्थापन.", main_sub: "पायाभूत सुविधांचे परीक्षण करण्यासाठी आणि त्रुटी नोंदवण्यासाठी एक केंद्रित व्यासपीठ.",
            report_title: "घटनेची तक्रार करा", report_sub: "महानगरपालिका पुनरावलोकनासाठी नवीन त्रुटी सबमिट करा.", report_btn: "तक्रार सुरू करा",
            track_title: "रिझोल्यूशन ट्रॅक करा", track_sub: "सक्रिय दुरुस्तीच्या रिअल-टाइम स्थितीचे निरीक्षण करा.", track_btn: "ट्रॅकर पहा",
            map_title: "झोन हीटमॅप", map_sub: "नोंदवलेल्या नागरी त्रुटींच्या भौगोलिक समूहांचे विश्लेषण करा.", map_btn: "नकाशा एक्सप्लोर करा",
            data_title: "कामगिरी डेटा", data_sub: "विभागीय प्रतिसाद वेळ आणि रिझोल्यूशन मेट्रिक्सचे पुनरावलोकन करा.", data_btn: "अॅनालिटिक्समध्ये प्रवेश करा",
            score: "इन्फ्रास्ट्रक्चर स्कोअर", localized: "स्थानिकीकृत", active: "सक्रिय घटना", avg_res: "सरासरी रिझोल्यूशन",
            notices: "अधिकृत निर्देश", archive: "संग्रह पहा", no_notices: "कोणतेही सक्रिय निर्देश नाहीत", no_notices_sub: "तुमच्या झोनसाठी सध्या कोणत्याही सार्वजनिक नोटीस नाहीत."
        },
        gu: {
            lang: "ગુજરાતી", log_out: "લૉગ આઉટ", careers: "કારકિર્દી",
            main_title: "સ્માર્ટ ઇન્ફ્રાસ્ટ્રક્ચર મેનેજમેન્ટ.", main_sub: "ઇન્ફ્રાસ્ટ્રક્ચરનું નિરીક્ષણ કરવા અને સંપૂર્ણ પારદર્શિતા સાથે ટ્રેક કરવા માટેનું પ્લેટફોર્મ.",
            report_title: "ઘટનાની જાણ કરો", report_sub: "મ્યુનિસિપલ સમીક્ષા માટે નવી ખામી સબમિટ કરો.", report_btn: "રિપોર્ટ શરૂ કરો",
            track_title: "ઠરાવ ટ્રૅક કરો", track_sub: "સક્રિય સમારકામની વાસ્તવિક સમયની સ્થિતિનું નિરીક્ષણ કરો.", track_btn: "ટ્રેકર જુઓ",
            map_title: "ઝોન હીટમેપ", map_sub: "નાગરિક ખામીઓના ભૌગોલિક ક્લસ્ટરોનું વિશ્લેષણ કરો.", map_btn: "નકશો અન્વેષણ કરો",
            data_title: "પ્રદર્શન ડેટા", data_sub: "વિભાગીય પ્રતિસાદ સમય અને ઠરાવ મેટ્રિક્સની સમીક્ષા કરો.", data_btn: "એનાલિટિક્સ ઍક્સેસ કરો",
            score: "ઇન્ફ્રાસ્ટ્રક્ચર સ્કોઅર", localized: "સ્થાનિક", active: "સક્રિય ઘટનાઓ", avg_res: "સરેરાશ ઠરાવ",
            notices: "સત્તાવાર નિર્દેશો", archive: "આર્કાઇવ જુઓ", no_notices: "કોઈ સક્રિય નિર્દેશો નથી", no_notices_sub: "તમારા ઝોન માટે હાલમાં કોઈ સક્રિય જાહેર સૂચનાઓ નથી."
        },
        te: {
            lang: "తెలుగు", log_out: "లాగౌట్", careers: "కెరీర్స్",
            main_title: "స్మార్ట్ ఇన్ఫ్రాస్ట్రక్చర్ మేనేజ్‌మెంట్.", main_sub: "మౌలిక సదుపాయాలను పర్యవేక్షించడానికి మరియు సమస్యలను నివేదించడానికి కేంద్రీకృత వేదిక.",
            report_title: "సంఘటనను నివేదించండి", report_sub: "మున్సిపల్ సమీక్ష కోసం కొత్త లోపాన్ని సమర్పించండి.", report_btn: "నివేదికను ప్రారంభించండి",
            track_title: "ట్రాక్ రిజల్యూషన్", track_sub: "క్రియాశీల మరమ్మతుల నిజ-సమయ స్థితిని పర్యవేక్షించండి.", track_btn: "ట్రాకర్‌ను వీక్షించండి",
            map_title: "జోన్ హీట్‌మ్యాప్", map_sub: "నివేదించబడిన లోపాల భౌగోళిక సమూహాలను విశ్లేషించండి.", map_btn: "మ్యాప్‌ని అన్వేషించండి",
            data_title: "పనితీరు డేటా", data_sub: "విభాగ ప్రతిస్పందన సమయాలు మరియు కొలమానాలను సమీక్షించండి.", data_btn: "విశ్లేషణలను యాక్సెస్ చేయండి",
            score: "ఇన్ఫ్రాస్ట్రక్చర్ స్కోర్", localized: "స్థానికీకరించబడింది", active: "క్రియాశీల సంఘటనలు", avg_res: "సగటు రిజల్యూషన్",
            notices: "అధికారిక ఆదేశాలు", archive: "ఆర్కైవ్ చూడండి", no_notices: "క్రియాశీల ఆదేశాలు లేవు", no_notices_sub: "మీ ఆపరేషనల్ జోన్ కోసం ప్రస్తుతం పబ్లిక్ నోటీసులు లేవు."
        },
        ta: {
            lang: "தமிழ்", log_out: "வெளியேறு", careers: "தொழில்கள்",
            main_title: "ஸ்மார்ட் உள்கட்டமைப்பு மேலாண்மை.", main_sub: "உள்கட்டமைப்பை கண்காணிக்க மற்றும் சிக்கல்களைப் புகாரளிக்க மையப்படுத்தப்பட்ட தளம்.",
            report_title: "சம்பவத்தைப் புகாரளிக்கவும்", report_sub: "நகராட்சி மதிப்பாய்வுக்காக புதிய குறைபாட்டைச் சமர்ப்பிக்கவும்.", report_btn: "அறிக்கையைத் தொடங்கவும்",
            track_title: "தீர்வு கண்காணிக்கவும்", track_sub: "செயலில் உள்ள பழுதுகளின் நேரலை நிலையை கண்காணிக்கவும்.", track_btn: "டிராக்கரைப் பார்க்கவும்",
            map_title: "மண்டல ஹீட்மேப்", map_sub: "அறிக்கையிடப்பட்ட குறைபாடுகளின் புவியியல் தொகுப்புகளை பகுப்பாய்வு செய்யவும்.", map_btn: "வரைபடத்தை ஆராயுங்கள்",
            data_title: "செயல்திறன் தரவு", data_sub: "துறை பதில் நேரங்கள் மற்றும் அளவீடுகளை மதிப்பாய்வு செய்யவும்.", data_btn: "பகுப்பாய்வுகளை அணுகவும்",
            score: "உள்கட்டமைப்பு மதிப்பெண்", localized: "உள்ளூர்மயமாக்கப்பட்டது", active: "செயலில் உள்ள சம்பவங்கள்", avg_res: "சராசரி தீர்வு",
            notices: "அதிகாரப்பூர்வ உத்தரவுகள்", archive: "காப்பகத்தைக் காண்க", no_notices: "செயலில் உள்ள உத்தரவுகள் இல்லை", no_notices_sub: "உங்கள் மண்டலத்திற்கான பொது அறிவிப்புகள் தற்போது இல்லை."
        },
        pa: {
            lang: "ਪੰਜਾਬੀ", log_out: "ਲੌਗ ਆਉਟ", careers: "ਕਰੀਅਰ",
            main_title: "ਸਮਾਰਟ ਬੁਨਿਆਦੀ ਢਾਂਚਾ ਪ੍ਰਬੰਧਨ।", main_sub: "ਬੁਨਿਆਦੀ ਢਾਂਚੇ ਦੀ ਨਿਗਰਾਨੀ ਕਰਨ ਅਤੇ ਸਮੱਸਿਆਵਾਂ ਦੀ ਰਿਪੋਰਟ ਕਰਨ ਲਈ ਇੱਕ ਕੇਂਦਰੀ ਪਲੇਟਫਾਰਮ।",
            report_title: "ਘਟਨਾ ਦੀ ਰਿਪੋਰਟ ਕਰੋ", report_sub: "ਮਿਊਂਸੀਪਲ ਸਮੀਖਿਆ ਲਈ ਨਵੀਂ ਕਮੀ ਜਮ੍ਹਾਂ ਕਰੋ।", report_btn: "ਰਿਪੋਰਟ ਸ਼ੁਰੂ ਕਰੋ",
            track_title: "ਰੈਜ਼ੋਲੂਸ਼ਨ ਟ੍ਰੈਕ ਕਰੋ", track_sub: "ਸਰਗਰਮ ਮੁਰੰਮਤ ਦੀ ਅਸਲ-ਸਮੇਂ ਦੀ ਸਥਿਤੀ ਦੀ ਨਿਗਰਾਨੀ ਕਰੋ।", track_btn: "ਟ੍ਰੈਕਰ ਵੇਖੋ",
            map_title: "ਜ਼ੋਨ ਹੀਟਮੈਪ", map_sub: "ਰਿਪੋਰਟ ਕੀਤੀਆਂ ਕਮੀਆਂ ਦੇ ਭੂਗੋਲਿਕ ਸਮੂਹਾਂ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ।", map_btn: "ਨਕਸ਼ੇ ਦੀ ਪੜਚੋਲ ਕਰੋ",
            data_title: "ਪ੍ਰਦਰਸ਼ਨ ਡੇਟਾ", data_sub: "ਵਿਭਾਗੀ ਜਵਾਬ ਸਮੇਂ ਅਤੇ ਮੈਟ੍ਰਿਕਸ ਦੀ ਸਮੀਖਿਆ ਕਰੋ।", data_btn: "ਵਿਸ਼ਲੇਸ਼ਣ ਤੱਕ ਪਹੁੰਚ ਕਰੋ",
            score: "ਬੁਨਿਆਦੀ ਢਾਂਚਾ ਸਕੋਰ", localized: "ਸਥਾਨਕ", active: "ਸਰਗਰਮ ਘਟਨਾਵਾਂ", avg_res: "ਔਸਤ ਰੈਜ਼ੋਲੂਸ਼ਨ",
            notices: "ਅਧਿਕਾਰਤ ਨਿਰਦੇਸ਼", archive: "ਪੁਰਾਲੇਖ ਵੇਖੋ", no_notices: "ਕੋਈ ਸਰਗਰਮ ਨਿਰਦੇਸ਼ ਨਹੀਂ", no_notices_sub: "ਤੁਹਾਡੇ ਜ਼ੋਨ ਲਈ ਵਰਤਮਾਨ ਵਿੱਚ ਕੋਈ ਜਨਤਕ ਨੋਟਿਸ ਨਹੀਂ ਹਨ।"
        },
        bho: {
            lang: "भोजपुरी", log_out: "लॉग आउट", careers: "करियर",
            main_title: "स्मार्ट इंफ्रास्ट्रक्चर मैनेजमेंट।", main_sub: "बुनियादी ढांचा के निगरानी करे आ समस्या के रिपोर्ट करे खातिर एगो मंच।",
            report_title: "घटना के रिपोर्ट करीं", report_sub: "नगर निगम के समीक्षा खातिर नया कमी दर्ज करीं।", report_btn: "रिपोर्ट शुरू करीं",
            track_title: "समाधान ट्रैक करीं", track_sub: "सक्रिय मरम्मत के वास्तविक समय के स्थिति के निगरानी करीं।", track_btn: "ट्रैकर देखीं",
            map_title: "जोन हीटमैप", map_sub: "रिपोर्ट कइल गइल कमी के भौगोलिक समूह के विश्लेषण करीं।", map_btn: "नक्शा देखीं",
            data_title: "प्रदर्शन डेटा", data_sub: "विभागीय प्रतिक्रिया समय के समीक्षा करीं।", data_btn: "एनालिटिक्स देखीं",
            score: "इंफ्रास्ट्रक्चर स्कोर", localized: "स्थानीयकृत", active: "सक्रिय घटना", avg_res: "औसत समाधान",
            notices: "आधिकारिक निर्देश", archive: "पुरालेख देखीं", no_notices: "कौनो सक्रिय निर्देश नइखे", no_notices_sub: "रउआ ज़ोन खातिर वर्तमान में कौनो सार्वजनिक नोटिस नइखे।"
        },
        ar: {
            lang: "العربية", log_out: "تسجيل الخروج", careers: "الوظائف",
            main_title: "إدارة البنية التحتية الذكية.", main_sub: "منصة مركزية لمراقبة البنية التحتية والإبلاغ عن المشكلات بشفافية.",
            report_title: "الإبلاغ عن حادث", report_sub: "تقديم نقص جديد لمراجعة البلدية.", report_btn: "بدء التقرير",
            track_title: "تتبع القرار", track_sub: "مراقبة الحالة في الوقت الفعلي للإصلاحات النشطة.", track_btn: "عرض المتتبع",
            map_title: "الخريطة الحرارية", map_sub: "تحليل المجموعات الجغرافية لأوجه القصور المبلغ عنها.", map_btn: "استكشاف الخريطة",
            data_title: "بيانات الأداء", data_sub: "مراجعة أوقات استجابة الأقسام ومقاييس الحل.", data_btn: "الوصول للتحليلات",
            score: "درجة البنية التحتية", localized: "مترجم", active: "الحوادث النشطة", avg_res: "متوسط الحل",
            notices: "التوجيهات الرسمية", archive: "عرض الأرشيف", no_notices: "لا توجد توجيهات", no_notices_sub: "لا توجد إشعارات عامة نشطة لمنطقتك حالياً."
        },
        es: {
            lang: "Español", log_out: "Cerrar sesión", careers: "Carreras",
            main_title: "Gestión Inteligente de Infraestructura.", main_sub: "Plataforma centralizada para monitorizar la infraestructura y reportar deficiencias.",
            report_title: "Reportar Incidente", report_sub: "Envíe una nueva deficiencia para revisión municipal.", report_btn: "Iniciar Reporte",
            track_title: "Rastrear Resolución", track_sub: "Supervise el estado en tiempo real de las reparaciones activas.", track_btn: "Ver Rastreador",
            map_title: "Mapa de Calor", map_sub: "Analice clústeres geográficos de deficiencias reportadas.", map_btn: "Explorar Mapa",
            data_title: "Datos de Rendimiento", data_sub: "Revise los tiempos de respuesta departamentales y métricas.", data_btn: "Acceder a Analíticas",
            score: "Puntuación de Infraestructura", localized: "Localizado", active: "Incidentes Activos", avg_res: "Resolución Prom.",
            notices: "Directivas Oficiales", archive: "Ver Archivo", no_notices: "Sin Directivas Activas", no_notices_sub: "Actualmente no hay avisos públicos para su zona operativa."
        },
        fr: {
            lang: "Français", log_out: "Se déconnecter", careers: "Carrières",
            main_title: "Gestion Intelligente des Infrastructures.", main_sub: "Plateforme centralisée pour surveiller les infrastructures et signaler les problèmes.",
            report_title: "Signaler un Incident", report_sub: "Soumettre une nouvelle lacune pour examen municipal.", report_btn: "Initier le Rapport",
            track_title: "Suivre la Résolution", track_sub: "Surveiller l'état en temps réel des réparations actives.", track_btn: "Voir le Suivi",
            map_title: "Carte Thermique", map_sub: "Analyser les clusters géographiques des lacunes signalées.", map_btn: "Explorer la Carte",
            data_title: "Données de Performance", data_sub: "Examiner les temps de réponse et les métriques de résolution.", data_btn: "Accéder aux Analyses",
            score: "Score d'Infrastructure", localized: "Localisé", active: "Incidents Actifs", avg_res: "Résolution Moy.",
            notices: "Directives Officielles", archive: "Voir l'Archive", no_notices: "Aucune Directive", no_notices_sub: "Il n'y a actuellement aucun avis public pour votre zone."
        },
        de: {
            lang: "Deutsch", log_out: "Abmelden", careers: "Karriere",
            main_title: "Intelligentes Infrastrukturmanagement.", main_sub: "Zentrale Plattform zur Überwachung der Infrastruktur und zur Meldung von Problemen.",
            report_title: "Vorfall Melden", report_sub: "Reichen Sie einen neuen Mangel zur kommunalen Überprüfung ein.", report_btn: "Bericht Starten",
            track_title: "Lösung Verfolgen", track_sub: "Überwachen Sie den Echtzeitstatus aktiver Reparaturen.", track_btn: "Tracker Anzeigen",
            map_title: "Zonen-Heatmap", map_sub: "Analysieren Sie geografische Cluster gemeldeter Mängel.", map_btn: "Karte Erkunden",
            data_title: "Leistungsdaten", data_sub: "Überprüfen Sie Reaktionszeiten und Lösungsmetriken.", data_btn: "Auf Analysen Zugreifen",
            score: "Infrastruktur-Score", localized: "Lokalisiert", active: "Aktive Vorfälle", avg_res: "Durchschn. Lösung",
            notices: "Offizielle Richtlinien", archive: "Archiv Anzeigen", no_notices: "Keine Richtlinien", no_notices_sub: "Derzeit gibt es keine öffentlichen Bekanntmachungen für Ihre Zone."
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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

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

            <div className="flex-1 max-w-[1400px] w-full mx-auto px-6 md:px-12 pb-12">
                
                {/* Header Section */}
                <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="mb-16 mt-8"
                >
                    <motion.div variants={itemVariants} className={`flex items-center gap-3 mb-4 ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>
                        <ShieldCheck size={20} className={theme === 'light' ? 'text-black' : 'text-white'} />
                        <span className="text-[0.9rem] font-bold tracking-widest uppercase">Movyra Civic Operations</span>
                    </motion.div>
                    <motion.h1 variants={itemVariants} className="text-[3rem] md:text-[4.5rem] font-black leading-[1.1] tracking-tighter mb-6">
                        {currentT.main_title}
                    </motion.h1>
                    <motion.p variants={itemVariants} className={`text-[1.1rem] md:text-[1.25rem] max-w-[700px] leading-relaxed ${theme === 'light' ? 'text-[#555555]' : 'text-[#aaaaaa]'}`}>
                        {currentT.main_sub}
                    </motion.p>
                </motion.div>

                {/* Primary Action Grid */}
                <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
                >
                    <button 
                        onClick={() => navigate('/civic/report')}
                        className={`p-8 rounded-2xl flex flex-col items-start text-left transition-colors outline-none group border ${
                            theme === 'light' ? 'bg-black text-white border-black hover:bg-[#222222]' : 'bg-white text-black border-white hover:bg-[#e0e0e0]'
                        }`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${
                            theme === 'light' ? 'bg-white text-black' : 'bg-black text-white'
                        }`}>
                            <AlertTriangle size={24} />
                        </div>
                        <h3 className="text-[1.25rem] font-black mb-2">{currentT.report_title}</h3>
                        <p className={`text-[0.9rem] font-medium mb-8 ${theme === 'light' ? 'text-[#cccccc]' : 'text-[#333333]'}`}>{currentT.report_sub}</p>
                        <div className="mt-auto flex items-center gap-2 font-bold text-[0.9rem]">
                            {currentT.report_btn} <ArrowRight size={16} />
                        </div>
                    </button>

                    <button 
                        onClick={() => navigate('/civic/tracker')}
                        className={`p-8 rounded-2xl flex flex-col items-start text-left transition-colors outline-none group border ${
                            theme === 'light' ? 'bg-white border-[#e0e0e0] hover:border-black' : 'bg-[#111111] border-[#333333] hover:border-white'
                        }`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-6 transition-colors ${
                            theme === 'light' ? 'bg-[#f0f0f0] text-black group-hover:bg-black group-hover:text-white' : 'bg-[#222222] text-white group-hover:bg-white group-hover:text-black'
                        }`}>
                            <Activity size={24} />
                        </div>
                        <h3 className="text-[1.25rem] font-black mb-2">{currentT.track_title}</h3>
                        <p className={`text-[0.9rem] font-medium mb-8 ${theme === 'light' ? 'text-[#666666]' : 'text-[#aaaaaa]'}`}>{currentT.track_sub}</p>
                        <div className={`mt-auto flex items-center gap-2 font-bold text-[0.9rem] transition-colors ${
                            theme === 'light' ? 'text-[#888888] group-hover:text-black' : 'text-[#888888] group-hover:text-white'
                        }`}>
                            {currentT.track_btn} <ArrowRight size={16} />
                        </div>
                    </button>

                    <button 
                        onClick={() => navigate('/civic/heatmap')}
                        className={`p-8 rounded-2xl flex flex-col items-start text-left transition-colors outline-none group border ${
                            theme === 'light' ? 'bg-white border-[#e0e0e0] hover:border-black' : 'bg-[#111111] border-[#333333] hover:border-white'
                        }`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-6 transition-colors ${
                            theme === 'light' ? 'bg-[#f0f0f0] text-black group-hover:bg-black group-hover:text-white' : 'bg-[#222222] text-white group-hover:bg-white group-hover:text-black'
                        }`}>
                            <Map size={24} />
                        </div>
                        <h3 className="text-[1.25rem] font-black mb-2">{currentT.map_title}</h3>
                        <p className={`text-[0.9rem] font-medium mb-8 ${theme === 'light' ? 'text-[#666666]' : 'text-[#aaaaaa]'}`}>{currentT.map_sub}</p>
                        <div className={`mt-auto flex items-center gap-2 font-bold text-[0.9rem] transition-colors ${
                            theme === 'light' ? 'text-[#888888] group-hover:text-black' : 'text-[#888888] group-hover:text-white'
                        }`}>
                            {currentT.map_btn} <ArrowRight size={16} />
                        </div>
                    </button>

                    <button 
                        onClick={() => navigate('/civic/transparency')}
                        className={`p-8 rounded-2xl flex flex-col items-start text-left transition-colors outline-none group border ${
                            theme === 'light' ? 'bg-white border-[#e0e0e0] hover:border-black' : 'bg-[#111111] border-[#333333] hover:border-white'
                        }`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-6 transition-colors ${
                            theme === 'light' ? 'bg-[#f0f0f0] text-black group-hover:bg-black group-hover:text-white' : 'bg-[#222222] text-white group-hover:bg-white group-hover:text-black'
                        }`}>
                            <TrendingUp size={24} />
                        </div>
                        <h3 className="text-[1.25rem] font-black mb-2">{currentT.data_title}</h3>
                        <p className={`text-[0.9rem] font-medium mb-8 ${theme === 'light' ? 'text-[#666666]' : 'text-[#aaaaaa]'}`}>{currentT.data_sub}</p>
                        <div className={`mt-auto flex items-center gap-2 font-bold text-[0.9rem] transition-colors ${
                            theme === 'light' ? 'text-[#888888] group-hover:text-black' : 'text-[#888888] group-hover:text-white'
                        }`}>
                            {currentT.data_btn} <ArrowRight size={16} />
                        </div>
                    </button>
                </motion.div>

                {/* Live Data Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Area Health Score */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className={`lg:col-span-1 rounded-3xl p-8 border ${
                            theme === 'light' ? 'bg-white border-[#e0e0e0]' : 'bg-[#111111] border-[#333333]'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-[1.5rem] font-black tracking-tight">{currentT.score}</h2>
                            {currentLocation.address && (
                                <div className={`flex items-center gap-1 text-[0.8rem] font-bold px-3 py-1 rounded-full ${
                                    theme === 'light' ? 'bg-[#f0f0f0] text-[#555555]' : 'bg-[#222222] text-[#888888]'
                                }`}>
                                    <MapPin size={12} /> {currentT.localized}
                                </div>
                            )}
                        </div>

                        {isLoading ? (
                            <div className="h-[200px] flex items-center justify-center">
                                <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin ${theme === 'light' ? 'border-black' : 'border-white'}`}></div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6">
                                <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                                    <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="45" fill="none" stroke={theme === 'light' ? '#e0e0e0' : '#222222'} strokeWidth="8" />
                                        <circle 
                                            cx="50" 
                                            cy="50" 
                                            r="45" 
                                            fill="none" 
                                            stroke={healthMetrics.healthScore > 75 ? (theme === 'light' ? '#000000' : '#ffffff') : healthMetrics.healthScore > 40 ? '#888888' : '#ff4444'} 
                                            strokeWidth="8" 
                                            strokeDasharray={`${(healthMetrics.healthScore / 100) * 283} 283`} 
                                            className="transition-all duration-1000 ease-out"
                                        />
                                    </svg>
                                    <div className="text-center">
                                        <span className="text-[3rem] font-black leading-none">{healthMetrics.healthScore}</span>
                                        <span className={`block text-[0.8rem] font-bold mt-1 ${theme === 'light' ? 'text-[#888888]' : 'text-[#888888]'}`}>/ 100</span>
                                    </div>
                                </div>
                                <div className={`w-full grid grid-cols-2 gap-4 text-center border-t pt-6 ${
                                    theme === 'light' ? 'border-[#e0e0e0]' : 'border-[#333333]'
                                }`}>
                                    <div>
                                        <div className="text-[1.5rem] font-black">{healthMetrics.totalActive}</div>
                                        <div className={`text-[0.8rem] font-bold ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{currentT.active}</div>
                                    </div>
                                    <div>
                                        <div className="text-[1.5rem] font-black">{healthMetrics.averageResolutionTime}</div>
                                        <div className={`text-[0.8rem] font-bold ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{currentT.avg_res}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Official Public Notices */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className={`lg:col-span-2 rounded-3xl p-8 flex flex-col border ${
                            theme === 'light' ? 'bg-white border-[#e0e0e0]' : 'bg-[#111111] border-[#333333]'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-[1.5rem] font-black tracking-tight flex items-center gap-3">
                                <FileText size={24} className={theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'} />
                                {currentT.notices}
                            </h2>
                            <button className={`text-[0.9rem] font-bold transition-colors outline-none ${
                                theme === 'light' ? 'text-[#888888] hover:text-black' : 'text-[#888888] hover:text-white'
                            }`}>
                                {currentT.archive}
                            </button>
                        </div>

                        <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2">
                            {isLoading ? (
                                <div className="h-full flex items-center justify-center">
                                    <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin ${theme === 'light' ? 'border-black' : 'border-white'}`}></div>
                                </div>
                            ) : notices.length === 0 ? (
                                <div className={`flex-1 flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-dashed ${
                                    theme === 'light' ? 'border-[#cccccc] bg-[#f9f9f9]' : 'border-[#333333] bg-[#0a0a0a]'
                                }`}>
                                    <Clock size={32} className={`mb-4 ${theme === 'light' ? 'text-[#888888]' : 'text-[#555555]'}`} />
                                    <h4 className="text-[1.1rem] font-bold mb-1">{currentT.no_notices}</h4>
                                    <p className={`text-[0.9rem] ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{currentT.no_notices_sub}</p>
                                </div>
                            ) : (
                                notices.map((notice) => (
                                    <div key={notice.id} className={`p-5 rounded-xl transition-colors border ${
                                        theme === 'light' ? 'bg-[#f9f9f9] border-[#e0e0e0] hover:border-black' : 'bg-[#0a0a0a] border-[#333333] hover:border-[#555555]'
                                    }`}>
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <h4 className="text-[1.1rem] font-black">{notice.title}</h4>
                                            <span className={`shrink-0 px-3 py-1 text-[0.75rem] font-bold rounded-full ${
                                                theme === 'light' ? 'bg-[#e0e0e0] text-[#555555]' : 'bg-[#222222] text-[#aaaaaa]'
                                            }`}>
                                                {notice.department || 'General Administration'}
                                            </span>
                                        </div>
                                        <p className={`text-[0.95rem] leading-relaxed mb-4 ${theme === 'light' ? 'text-[#555555]' : 'text-[#aaaaaa]'}`}>
                                            {notice.description}
                                        </p>
                                        <div className={`flex items-center text-[0.8rem] font-bold ${theme === 'light' ? 'text-[#888888]' : 'text-[#555555]'}`}>
                                            Issued: {notice.createdAt?.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) || 'Recent'}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </div>
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