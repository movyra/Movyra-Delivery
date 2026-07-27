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
    LogOut,
    Megaphone,
    Star,
    Phone
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
    const [showProductsPrompt, setShowProductsPrompt] = useState(false);
    
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

    // 2. 13-LANGUAGE DASHBOARD DICTIONARY (Simplified)
    const t = {
        en: {
            lang: "English", log_out: "Log out", careers: "Careers", products: "Products",
            main_title: "Smart City Management.", main_sub: "One place to report issues, track repairs, and see how your city is doing.",
            report_title: "Report Issue", report_sub: "Tell us about a problem in your area.", report_btn: "Start Report",
            track_title: "Track Progress", track_sub: "See the status of current repairs.", track_btn: "View Progress",
            map_title: "City Map", map_sub: "See where problems are being reported.", map_btn: "View Map",
            data_title: "City Stats", data_sub: "See how fast the city fixes problems.", data_btn: "View Stats",
            my_rep_title: "My Reports", my_rep_sub: "Check the status of your own reports.", my_rep_btn: "View Mine",
            notice_title: "Notices", notice_sub: "Read official updates from the city.", notice_btn: "View Notices",
            feed_title: "Feedback", feed_sub: "Rate the repair work done.", feed_btn: "Give Feedback",
            emerg_title: "Emergency", emergency_sub: "Quick numbers for help.", emerg_btn: "View Contacts",
            score: "City Score", localized: "Local", active: "Active Issues", avg_res: "Avg. Fix Time",
            notices: "Official Updates", archive: "View Old", no_notices: "No Updates", no_notices_sub: "There are no new notices right now."
        },
        hi: {
            lang: "हिन्दी", log_out: "लॉग आउट", careers: "करियर", products: "उत्पाद",
            main_title: "स्मार्ट शहर प्रबंधन।", main_sub: "समस्याएं बताने और सुधार देखने के लिए एक आसान जगह।",
            report_title: "समस्या बताएं", report_sub: "अपने क्षेत्र की समस्या हमें बताएं।", report_btn: "शुरू करें",
            track_title: "प्रगति देखें", track_sub: "वर्तमान सुधारों की स्थिति देखें।", track_btn: "प्रगति देखें",
            map_title: "शहर का नक्शा", map_sub: "देखें कि कहां समस्याएं बताई जा रही हैं।", map_btn: "नक्शा देखें",
            data_title: "शहर के आंकड़े", data_sub: "देखें कि शहर कितनी जल्दी काम करता है।", data_btn: "आंकड़े देखें",
            my_rep_title: "मेरी रिपोर्ट", my_rep_sub: "अपनी रिपोर्ट की स्थिति जांचें।", my_rep_btn: "मेरी देखें",
            notice_title: "सूचनाएं", notice_sub: "शहर से आधिकारिक अपडेट पढ़ें।", notice_btn: "सूचनाएं देखें",
            feed_title: "प्रतिक्रिया", feed_sub: "किए गए मरम्मत कार्य को रेट करें।", feed_btn: "प्रतिक्रिया दें",
            emerg_title: "आपातकाल", emergency_sub: "मदद के लिए जरूरी नंबर।", emerg_btn: "नंबर देखें",
            score: "शहर का स्कोर", localized: "स्थानीय", active: "सक्रिय समस्याएं", avg_res: "औसत समय",
            notices: "आधिकारिक अपडेट", archive: "पुराने देखें", no_notices: "कोई अपडेट नहीं", no_notices_sub: "अभी कोई नई सूचना नहीं है।"
        },
        hinglish: {
            lang: "Hinglish", log_out: "Log out", careers: "Careers", products: "Products",
            main_title: "Smart City Management.", main_sub: "Issues report karne aur repairs track karne ka aasan tarika.",
            report_title: "Issue Report Karein", report_sub: "Apne area ki problem batayein.", report_btn: "Start Karein",
            track_title: "Progress Track Karein", track_sub: "Current repairs ka status dekhein.", track_btn: "Progress Dekhein",
            map_title: "City Map", map_sub: "Dekhein kahan problems report ho rahi hain.", map_btn: "Map Dekhein",
            data_title: "City Stats", data_sub: "Dekhein city kitni jaldi problems theek karti hai.", data_btn: "Stats Dekhein",
            my_rep_title: "Meri Reports", my_rep_sub: "Apni reports ka status check karein.", my_rep_btn: "Meri Dekhein",
            notice_title: "Notices", notice_sub: "City ke official updates padhein.", notice_btn: "Notices Dekhein",
            feed_title: "Feedback", feed_sub: "Huye repair work ko rate karein.", feed_btn: "Feedback Dein",
            emerg_title: "Emergency", emergency_sub: "Help ke liye quick numbers.", emerg_btn: "Contacts Dekhein",
            score: "City Score", localized: "Local", active: "Active Issues", avg_res: "Avg. Time",
            notices: "Official Updates", archive: "Purane Dekhein", no_notices: "No Updates", no_notices_sub: "Abhi koi naya notice nahi hai."
        },
        mr: {
            lang: "मराठी", log_out: "लॉग आउट", careers: "करिअर", products: "उत्पादने",
            main_title: "स्मार्ट शहर व्यवस्थापन.", main_sub: "समस्या नोंदवण्यासाठी आणि दुरुस्ती पाहण्यासाठी एक ठिकाण.",
            report_title: "समस्या नोंदवा", report_sub: "तुमच्या क्षेत्रातील समस्या सांगा.", report_btn: "सुरू करा",
            track_title: "प्रगती पहा", track_sub: "सध्याच्या दुरुस्तीची स्थिती पहा.", track_btn: "प्रगती पहा",
            map_title: "शहराचा नकाशा", map_sub: "समस्या कुठे नोंदवल्या जात आहेत ते पहा.", map_btn: "नकाशा पहा",
            data_title: "शहराची आकडेवारी", data_sub: "शहर किती वेगाने काम करते ते पहा.", data_btn: "आकडेवारी पहा",
            my_rep_title: "माझे अहवाल", my_rep_sub: "तुमच्या अहवालांची स्थिती तपासा.", my_rep_btn: "माझे पहा",
            notice_title: "सूचना", notice_sub: "शहराचे अधिकृत अपडेट वाचा.", notice_btn: "सूचना पहा",
            feed_title: "अभिप्राय", feed_sub: "झालेल्या दुरुस्तीच्या कामाला रेट करा.", feed_btn: "अभिप्राय द्या",
            emerg_title: "आणीबाणी", emergency_sub: "मदतीसाठी आवश्यक क्रमांक.", emerg_btn: "संपर्क पहा",
            score: "शहराचा स्कोअर", localized: "स्थानिक", active: "सक्रिय समस्या", avg_res: "सरासरी वेळ",
            notices: "अधिकृत अपडेट", archive: "जुने पहा", no_notices: "कोणतेही अपडेट नाहीत", no_notices_sub: "सध्या कोणतीही नवीन सूचना नाही."
        },
        gu: {
            lang: "ગુજરાતી", log_out: "લૉગ આઉટ", careers: "કારકિર્દી", products: "ઉત્પાદનો",
            main_title: "સ્માર્ટ સિટી મેનેજમેન્ટ.", main_sub: "સમસ્યાઓ જણાવવા અને સમારકામ જોવા માટે એક સ્થળ.",
            report_title: "સમસ્યા જણાવો", report_sub: "તમારા વિસ્તારની સમસ્યા જણાવો.", report_btn: "શરૂ કરો",
            track_title: "પ્રગતિ જુઓ", track_sub: "વર્તમાન સમારકામની સ્થિતિ જુઓ.", track_btn: "પ્રગતિ જુઓ",
            map_title: "શહેરનો નકશો", map_sub: "જુઓ ક્યાં સમસ્યાઓ નોંધાઈ રહી છે.", map_btn: "નકશો જુઓ",
            data_title: "શહેરના આંકડા", data_sub: "શહેર કેટલી ઝડપથી કામ કરે છે તે જુઓ.", data_btn: "આંકડા જુઓ",
            my_rep_title: "મારા અહેવાલો", my_rep_sub: "તમારા અહેવાલોની સ્થિતિ તપાસો.", my_rep_btn: "મારા જુઓ",
            notice_title: "સૂચનાઓ", notice_sub: "શહેરના સત્તાવાર અપડેટ્સ વાંચો.", notice_btn: "સૂચનાઓ જુઓ",
            feed_title: "પ્રતિસાદ", feed_sub: "થયેલા સમારકામ કાર્યને રેટ કરો.", feed_btn: "પ્રતિસાદ આપો",
            emerg_title: "કટોકટી", emergency_sub: "મદદ માટે જરૂરી નંબરો.", emerg_btn: "સંપર્કો જુઓ",
            score: "શહેરનો સ્કોર", localized: "સ્થાનિક", active: "સક્રિય સમસ્યાઓ", avg_res: "સરેરાશ સમય",
            notices: "સત્તાવાર અપડેટ્સ", archive: "જૂના જુઓ", no_notices: "કોઈ અપડેટ્સ નથી", no_notices_sub: "અત્યારે કોઈ નવી સૂચના નથી."
        },
        te: {
            lang: "తెలుగు", log_out: "లాగౌట్", careers: "కెరీర్స్", products: "ఉత్పత్తులు",
            main_title: "స్మార్ట్ సిటీ మేనేజ్‌మెంట్.", main_sub: "సమస్యలను నివేదించడానికి మరియు మరమ్మతులను చూడటానికి ఒక స్థలం.",
            report_title: "సమస్యను నివేదించండి", report_sub: "మీ ప్రాంతంలో సమస్యను మాకు చెప్పండి.", report_btn: "ప్రారంభించండి",
            track_title: "పురోగతిని చూడండి", track_sub: "ప్రస్తుత మరమ్మతుల స్థితిని చూడండి.", track_btn: "పురోగతిని చూడండి",
            map_title: "నగర మ్యాప్", map_sub: "సమస్యలు ఎక్కడ నివేదించబడుతున్నాయో చూడండి.", map_btn: "మ్యాప్‌ని చూడండి",
            data_title: "నగర గణాంకాలు", data_sub: "నగరం ఎంత త్వరగా పనిచేస్తుందో చూడండి.", data_btn: "గణాంకాలను చూడండి",
            my_rep_title: "నా నివేదికలు", my_rep_sub: "మీ నివేదికల స్థితిని తనిఖీ చేయండి.", my_rep_btn: "నావి చూడండి",
            notice_title: "నోటీసులు", notice_sub: "నగరం నుండి అధికారిక నవీకరణలను చదవండి.", notice_btn: "నోటీసులను చూడండి",
            feed_title: "అభిప్రాయం", feed_sub: "చేసిన మరమ్మత్తు పనిని రేట్ చేయండి.", feed_btn: "అభిప్రాయం ఇవ్వండి",
            emerg_title: "అత్యవసర పరిస్థితి", emergency_sub: "సహాయం కోసం త్వరిత సంఖ్యలు.", emerg_btn: "పరిచయాలను చూడండి",
            score: "నగర స్కోర్", localized: "స్థానిక", active: "క్రియాశీల సమస్యలు", avg_res: "సగటు సమయం",
            notices: "అధికారిక నవీకరణలు", archive: "పాతవి చూడండి", no_notices: "నవీకరణలు లేవు", no_notices_sub: "ప్రస్తుతం కొత్త నోటీసులు ఏవీ లేవు."
        },
        ta: {
            lang: "தமிழ்", log_out: "வெளியேறு", careers: "தொழில்கள்", products: "தயாரிப்புகள்",
            main_title: "ஸ்மார்ட் சிட்டி மேலாண்மை.", main_sub: "பிரச்சனைகளைப் புகாரளிக்கவும் மற்றும் பழுதுகளைக் கண்காணிக்கவும் ஒரு இடம்.",
            report_title: "பிரச்சனையைப் புகாரளிக்கவும்", report_sub: "உங்கள் பகுதியில் உள்ள பிரச்சனையை எங்களிடம் கூறுங்கள்.", report_btn: "தொடங்கவும்",
            track_title: "முன்னேற்றத்தைப் பார்க்கவும்", track_sub: "தற்போதைய பழுதுகளின் நிலையைப் பார்க்கவும்.", track_btn: "முன்னேற்றத்தைப் பார்க்கவும்",
            map_title: "நகர வரைபடம்", map_sub: "பிரச்சனைகள் எங்கே புகாரளிக்கப்படுகின்றன என்பதைப் பார்க்கவும்.", map_btn: "வரைபடத்தைப் பார்க்கவும்",
            data_title: "நகர புள்ளிவிவரங்கள்", data_sub: "நகரம் எவ்வளவு விரைவாக வேலை செய்கிறது என்பதைப் பார்க்கவும்.", data_btn: "புள்ளிவிவரங்களைப் பார்க்கவும்",
            my_rep_title: "எனது அறிக்கைகள்", my_rep_sub: "உங்கள் அறிக்கைகளின் நிலையை சரிபார்க்கவும்.", my_rep_btn: "என்னுடையதைப் பார்க்கவும்",
            notice_title: "அறிவிப்புகள்", notice_sub: "நகரத்தின் அதிகாரப்பூர்வ புதுப்பிப்புகளைப் படிக்கவும்.", notice_btn: "அறிவிப்புகளைப் பார்க்கவும்",
            feed_title: "பின்னூட்டம்", feed_sub: "செய்யப்பட்ட பழுதுபார்க்கும் பணியை மதிப்பிடவும்.", feed_btn: "பின்னூட்டம் கொடுங்கள்",
            emerg_title: "அவசரநிலை", emergency_sub: "உதவிக்கு விரைவான எண்கள்.", emerg_btn: "தொடர்புகளைப் பார்க்கவும்",
            score: "நகர மதிப்பெண்", localized: "உள்ளூர்", active: "செயலில் உள்ள பிரச்சனைகள்", avg_res: "சராசரி நேரம்",
            notices: "அதிகாரப்பூர்வ புதுப்பிப்புகள்", archive: "பழையவற்றைப் பார்க்கவும்", no_notices: "புதுப்பிப்புகள் இல்லை", no_notices_sub: "தற்போது புதிய அறிவிப்புகள் எதுவும் இல்லை."
        },
        pa: {
            lang: "ਪੰਜਾਬੀ", log_out: "ਲੌਗ ਆਉਟ", careers: "ਕਰੀਅਰ", products: "ਉਤਪਾਦ",
            main_title: "ਸਮਾਰਟ ਸਿਟੀ ਪ੍ਰਬੰਧਨ।", main_sub: "ਸਮੱਸਿਆਵਾਂ ਦੀ ਰਿਪੋਰਟ ਕਰਨ ਅਤੇ ਮੁਰੰਮਤ ਦੇਖਣ ਲਈ ਇੱਕ ਥਾਂ।",
            report_title: "ਸਮੱਸਿਆ ਦੀ ਰਿਪੋਰਟ ਕਰੋ", report_sub: "ਸਾਨੂੰ ਆਪਣੇ ਖੇਤਰ ਦੀ ਸਮੱਸਿਆ ਬਾਰੇ ਦੱਸੋ।", report_btn: "ਸ਼ੁਰੂ ਕਰੋ",
            track_title: "ਤਰੱਕੀ ਦੇਖੋ", track_sub: "ਮੌਜੂਦਾ ਮੁਰੰਮਤ ਦੀ ਸਥਿਤੀ ਦੇਖੋ।", track_btn: "ਤਰੱਕੀ ਦੇਖੋ",
            map_title: "ਸ਼ਹਿਰ ਦਾ ਨਕਸ਼ਾ", map_sub: "ਦੇਖੋ ਕਿੱਥੇ ਸਮੱਸਿਆਵਾਂ ਦੀ ਰਿਪੋਰਟ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ।", map_btn: "ਨਕਸ਼ਾ ਦੇਖੋ",
            data_title: "ਸ਼ਹਿਰ ਦੇ ਅੰਕੜੇ", data_sub: "ਦੇਖੋ ਸ਼ਹਿਰ ਕਿੰਨੀ ਜਲਦੀ ਕੰਮ ਕਰਦਾ ਹੈ।", data_btn: "ਅੰਕੜੇ ਦੇਖੋ",
            my_rep_title: "ਮੇਰੀਆਂ ਰਿਪੋਰਟਾਂ", my_rep_sub: "ਆਪਣੀਆਂ ਰਿਪੋਰਟਾਂ ਦੀ ਸਥਿਤੀ ਦੀ ਜਾਂਚ ਕਰੋ।", my_rep_btn: "ਮੇਰੀਆਂ ਦੇਖੋ",
            notice_title: "ਨੋਟਿਸ", notice_sub: "ਸ਼ਹਿਰ ਤੋਂ ਅਧਿਕਾਰਤ ਅੱਪਡੇਟ ਪੜ੍ਹੋ।", notice_btn: "ਨੋਟਿਸ ਦੇਖੋ",
            feed_title: "ਫੀਡਬੈਕ", feed_sub: "ਕੀਤੇ ਗਏ ਮੁਰੰਮਤ ਦੇ ਕੰਮ ਨੂੰ ਦਰਜਾ ਦਿਓ।", feed_btn: "ਫੀਡਬੈਕ ਦਿਓ",
            emerg_title: "ਐਮਰਜੈਂਸੀ", emergency_sub: "ਮਦਦ ਲਈ ਤੁਰੰਤ ਨੰਬਰ।", emerg_btn: "ਸੰਪਰਕ ਦੇਖੋ",
            score: "ਸ਼ਹਿਰ ਦਾ ਸਕੋਰ", localized: "ਸਥਾਨਕ", active: "ਸਰਗਰਮ ਸਮੱਸਿਆਵਾਂ", avg_res: "ਔਸਤ ਸਮਾਂ",
            notices: "ਅਧਿਕਾਰਤ ਅੱਪਡੇਟ", archive: "ਪੁਰਾਣੇ ਦੇਖੋ", no_notices: "ਕੋਈ ਅੱਪਡੇਟ ਨਹੀਂ", no_notices_sub: "ਫਿਲਹਾਲ ਕੋਈ ਨਵਾਂ ਨੋਟਿਸ ਨਹੀਂ ਹੈ।"
        },
        bho: {
            lang: "भोजपुरी", log_out: "लॉग आउट", careers: "करियर", products: "उत्पाद",
            main_title: "स्मार्ट सिटी मैनेजमेंट।", main_sub: "समस्या बतावे आ मरम्मत देखे खातिर एगो जगह।",
            report_title: "समस्या बताईं", report_sub: "आपन एरिया के समस्या हमनी के बताईं।", report_btn: "शुरू करीं",
            track_title: "प्रगति देखीं", track_sub: "वर्तमान मरम्मत के स्थिति देखीं।", track_btn: "प्रगति देखीं",
            map_title: "शहर के नक्शा", map_sub: "देखीं कहाँ समस्या बतावल जा रहल बा।", map_btn: "नक्शा देखीं",
            data_title: "शहर के आँकड़ा", data_sub: "देखीं शहर केतना जल्दी काम करेला।", data_btn: "आँकड़ा देखीं",
            my_rep_title: "हमर रिपोर्ट", my_rep_sub: "आपन रिपोर्ट के स्थिति जाँचीं।", my_rep_btn: "हमर देखीं",
            notice_title: "नोटिस", notice_sub: "शहर से आधिकारिक अपडेट पढ़ीं।", notice_btn: "नोटिस देखीं",
            feed_title: "फीडबैक", feed_sub: "भइल मरम्मत के काम के रेट करीं।", feed_btn: "फीडबैक दीं",
            emerg_title: "आपातकाल", emergency_sub: "मदद खातिर जरूरी नंबर।", emerg_btn: "संपर्क देखीं",
            score: "शहर के स्कोर", localized: "स्थानीय", active: "सक्रिय समस्या", avg_res: "औसत समय",
            notices: "आधिकारिक अपडेट", archive: "पुरान देखीं", no_notices: "कौनो अपडेट ना", no_notices_sub: "अभी कौनो नया नोटिस नइखे।"
        },
        ar: {
            lang: "العربية", log_out: "تسجيل الخروج", careers: "الوظائف", products: "المنتجات",
            main_title: "إدارة المدينة الذكية.", main_sub: "مكان واحد للإبلاغ عن المشكلات وتتبع الإصلاحات.",
            report_title: "الإبلاغ عن مشكلة", report_sub: "أخبرنا بمشكلة في منطقتك.", report_btn: "بدء التقرير",
            track_title: "تتبع التقدم", track_sub: "رؤية حالة الإصلاحات الحالية.", track_btn: "عرض التقدم",
            map_title: "خريطة المدينة", map_sub: "شاهد أين يتم الإبلاغ عن المشكلات.", map_btn: "عرض الخريطة",
            data_title: "إحصائيات المدينة", data_sub: "شاهد مدى سرعة المدينة في إصلاح المشكلات.", data_btn: "عرض الإحصائيات",
            my_rep_title: "تقاريري", my_rep_sub: "تحقق من حالة تقاريرك.", my_rep_btn: "عرض الخاص بي",
            notice_title: "إشعارات", notice_sub: "اقرأ التحديثات الرسمية من المدينة.", notice_btn: "عرض الإشعارات",
            feed_title: "ملاحظات", feed_sub: "قيم أعمال الإصلاح التي تمت.", feed_btn: "تقديم ملاحظات",
            emerg_title: "طوارئ", emergency_sub: "أرقام سريعة للمساعدة.", emerg_btn: "عرض جهات الاتصال",
            score: "درجة المدينة", localized: "محلي", active: "مشكلات نشطة", avg_res: "متوسط الوقت",
            notices: "تحديثات رسمية", archive: "عرض القديم", no_notices: "لا توجد تحديثات", no_notices_sub: "لا توجد إشعارات جديدة الآن."
        },
        es: {
            lang: "Español", log_out: "Cerrar sesión", careers: "Carreras", products: "Productos",
            main_title: "Gestión de Ciudad Inteligente.", main_sub: "Un lugar para reportar problemas y ver reparaciones.",
            report_title: "Reportar Problema", report_sub: "Cuéntenos sobre un problema en su área.", report_btn: "Iniciar Reporte",
            track_title: "Ver Progreso", track_sub: "Vea el estado de las reparaciones actuales.", track_btn: "Ver Progreso",
            map_title: "Mapa de la Ciudad", map_sub: "Vea dónde se reportan los problemas.", map_btn: "Ver Mapa",
            data_title: "Estadísticas", data_sub: "Vea qué tan rápido la ciudad arregla problemas.", data_btn: "Ver Estadísticas",
            my_rep_title: "Mis Reportes", my_rep_sub: "Revise el estado de sus reportes.", my_rep_btn: "Ver los Míos",
            notice_title: "Avisos", notice_sub: "Lea actualizaciones oficiales de la ciudad.", notice_btn: "Ver Avisos",
            feed_title: "Comentarios", feed_sub: "Califique el trabajo de reparación realizado.", feed_btn: "Dar Comentarios",
            emerg_title: "Emergencia", emergency_sub: "Números rápidos para ayuda.", emerg_btn: "Ver Contactos",
            score: "Puntuación de Ciudad", localized: "Local", active: "Problemas Activos", avg_res: "Tiempo Promedio",
            notices: "Actualizaciones Oficiales", archive: "Ver Antiguos", no_notices: "Sin Actualizaciones", no_notices_sub: "No hay nuevos avisos en este momento."
        },
        fr: {
            lang: "Français", log_out: "Se déconnecter", careers: "Carrières", products: "Produits",
            main_title: "Gestion de Ville Intelligente.", main_sub: "Un endroit pour signaler les problèmes et suivre les réparations.",
            report_title: "Signaler un Problème", report_sub: "Parlez-nous d'un problème dans votre quartier.", report_btn: "Commencer",
            track_title: "Voir les Progrès", track_sub: "Voir l'état des réparations actuelles.", track_btn: "Voir les Progrès",
            map_title: "Carte de la Ville", map_sub: "Voir où les problèmes sont signalés.", map_btn: "Voir la Carte",
            data_title: "Statistiques", data_sub: "Voir à quelle vitesse la ville règle les problèmes.", data_btn: "Voir les Stats",
            my_rep_title: "Mes Rapports", my_rep_sub: "Vérifiez l'état de vos rapports.", my_rep_btn: "Voir les Miens",
            notice_title: "Avis", notice_sub: "Lisez les mises à jour officielles de la ville.", notice_btn: "Voir les Avis",
            feed_title: "Commentaires", feed_sub: "Évaluez les travaux de réparation effectués.", feed_btn: "Donner un Avis",
            emerg_title: "Urgence", emergency_sub: "Numéros rapides pour obtenir de l'aide.", emerg_btn: "Voir les Contacts",
            score: "Score de la Ville", localized: "Local", active: "Problèmes Actifs", avg_res: "Temps Moyen",
            notices: "Mises à jour Officielles", archive: "Voir les Anciens", no_notices: "Pas de Mises à jour", no_notices_sub: "Il n'y a pas de nouveaux avis pour le moment."
        },
        de: {
            lang: "Deutsch", log_out: "Abmelden", careers: "Karriere", products: "Produkte",
            main_title: "Smart City Management.", main_sub: "Ein Ort, um Probleme zu melden und Reparaturen zu verfolgen.",
            report_title: "Problem Melden", report_sub: "Erzählen Sie uns von einem Problem in Ihrer Nähe.", report_btn: "Bericht Starten",
            track_title: "Fortschritt Verfolgen", track_sub: "Sehen Sie den Status aktueller Reparaturen.", track_btn: "Fortschritt Anzeigen",
            map_title: "Stadtplan", map_sub: "Sehen Sie, wo Probleme gemeldet werden.", map_btn: "Karte Anzeigen",
            data_title: "Stadtstatistiken", data_sub: "Sehen Sie, wie schnell die Stadt Probleme behebt.", data_btn: "Statistiken Anzeigen",
            my_rep_title: "Meine Berichte", my_rep_sub: "Überprüfen Sie den Status Ihrer Berichte.", my_rep_btn: "Meine Anzeigen",
            notice_title: "Mitteilungen", notice_sub: "Lesen Sie offizielle Updates der Stadt.", notice_btn: "Mitteilungen Anzeigen",
            feed_title: "Feedback", feed_sub: "Bewerten Sie die durchgeführten Reparaturarbeiten.", feed_btn: "Feedback Geben",
            emerg_title: "Notfall", emergency_sub: "Schnelle Nummern für Hilfe.", emerg_btn: "Kontakte Anzeigen",
            score: "Stadt-Score", localized: "Lokal", active: "Aktive Probleme", avg_res: "Durchschn. Zeit",
            notices: "Offizielle Updates", archive: "Alte Anzeigen", no_notices: "Keine Updates", no_notices_sub: "Es gibt derzeit keine neuen Mitteilungen."
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
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
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
                                className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center transition-colors outline-none ${
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
                                        className={`w-full p-4 rounded-xl flex items-center justify-between group transition-colors border outline-none ${
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

                            <Link to="/civic" className={`group flex flex-col items-center gap-4 p-6 rounded-2xl transition-colors text-center w-full outline-none border ${
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

                {/* Extended Action Grid (8 Cards) */}
                <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
                >
                    {/* Primary Report Card */}
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

                    {/* Secondary Access Cards */}
                    <button 
                        onClick={() => navigate('/civic/my-reports')}
                        className={`p-8 rounded-2xl flex flex-col items-start text-left transition-colors outline-none group border ${
                            theme === 'light' ? 'bg-white border-[#e0e0e0] hover:border-black' : 'bg-[#111111] border-[#333333] hover:border-white'
                        }`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-6 transition-colors ${
                            theme === 'light' ? 'bg-[#f0f0f0] text-black group-hover:bg-black group-hover:text-white' : 'bg-[#222222] text-white group-hover:bg-white group-hover:text-black'
                        }`}>
                            <FileText size={24} />
                        </div>
                        <h3 className="text-[1.25rem] font-black mb-2">{currentT.my_rep_title}</h3>
                        <p className={`text-[0.9rem] font-medium mb-8 ${theme === 'light' ? 'text-[#666666]' : 'text-[#aaaaaa]'}`}>{currentT.my_rep_sub}</p>
                        <div className={`mt-auto flex items-center gap-2 font-bold text-[0.9rem] transition-colors ${
                            theme === 'light' ? 'text-[#888888] group-hover:text-black' : 'text-[#888888] group-hover:text-white'
                        }`}>
                            {currentT.my_rep_btn} <ArrowRight size={16} />
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
                        onClick={() => navigate('/civic/notices')}
                        className={`p-8 rounded-2xl flex flex-col items-start text-left transition-colors outline-none group border ${
                            theme === 'light' ? 'bg-white border-[#e0e0e0] hover:border-black' : 'bg-[#111111] border-[#333333] hover:border-white'
                        }`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-6 transition-colors ${
                            theme === 'light' ? 'bg-[#f0f0f0] text-black group-hover:bg-black group-hover:text-white' : 'bg-[#222222] text-white group-hover:bg-white group-hover:text-black'
                        }`}>
                            <Megaphone size={24} />
                        </div>
                        <h3 className="text-[1.25rem] font-black mb-2">{currentT.notice_title}</h3>
                        <p className={`text-[0.9rem] font-medium mb-8 ${theme === 'light' ? 'text-[#666666]' : 'text-[#aaaaaa]'}`}>{currentT.notice_sub}</p>
                        <div className={`mt-auto flex items-center gap-2 font-bold text-[0.9rem] transition-colors ${
                            theme === 'light' ? 'text-[#888888] group-hover:text-black' : 'text-[#888888] group-hover:text-white'
                        }`}>
                            {currentT.notice_btn} <ArrowRight size={16} />
                        </div>
                    </button>

                    {/* Lower Tier Access Cards */}
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

                    <button 
                        onClick={() => navigate('/civic/feedback')}
                        className={`p-8 rounded-2xl flex flex-col items-start text-left transition-colors outline-none group border ${
                            theme === 'light' ? 'bg-white border-[#e0e0e0] hover:border-black' : 'bg-[#111111] border-[#333333] hover:border-white'
                        }`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-6 transition-colors ${
                            theme === 'light' ? 'bg-[#f0f0f0] text-black group-hover:bg-black group-hover:text-white' : 'bg-[#222222] text-white group-hover:bg-white group-hover:text-black'
                        }`}>
                            <Star size={24} />
                        </div>
                        <h3 className="text-[1.25rem] font-black mb-2">{currentT.feed_title}</h3>
                        <p className={`text-[0.9rem] font-medium mb-8 ${theme === 'light' ? 'text-[#666666]' : 'text-[#aaaaaa]'}`}>{currentT.feed_sub}</p>
                        <div className={`mt-auto flex items-center gap-2 font-bold text-[0.9rem] transition-colors ${
                            theme === 'light' ? 'text-[#888888] group-hover:text-black' : 'text-[#888888] group-hover:text-white'
                        }`}>
                            {currentT.feed_btn} <ArrowRight size={16} />
                        </div>
                    </button>

                    <button 
                        onClick={() => navigate('/civic/emergency')}
                        className={`p-8 rounded-2xl flex flex-col items-start text-left transition-colors outline-none group border ${
                            theme === 'light' ? 'bg-[#fff0f0] border-[#ffcccc] hover:border-[#ff4444]' : 'bg-[#220000] border-[#550000] hover:border-[#ff4444]'
                        }`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-6 transition-colors ${
                            theme === 'light' ? 'bg-[#ffcccc] text-[#cc0000] group-hover:bg-[#cc0000] group-hover:text-white' : 'bg-[#550000] text-[#ff4444] group-hover:bg-[#ff4444] group-hover:text-white'
                        }`}>
                            <Phone size={24} />
                        </div>
                        <h3 className={`text-[1.25rem] font-black mb-2 ${theme === 'light' ? 'text-[#cc0000]' : 'text-[#ff4444]'}`}>{currentT.emerg_title}</h3>
                        <p className={`text-[0.9rem] font-medium mb-8 ${theme === 'light' ? 'text-[#884444]' : 'text-[#cc8888]'}`}>{currentT.emergency_sub}</p>
                        <div className={`mt-auto flex items-center gap-2 font-bold text-[0.9rem] transition-colors ${
                            theme === 'light' ? 'text-[#cc0000]' : 'text-[#ff4444]'
                        }`}>
                            {currentT.emerg_btn} <ArrowRight size={16} />
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
                            <button 
                                onClick={() => navigate('/civic/notices')}
                                className={`text-[0.9rem] font-bold transition-colors outline-none ${
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
                                                {notice.department || 'General'}
                                            </span>
                                        </div>
                                        <p className={`text-[0.95rem] line-clamp-2 leading-relaxed mb-4 ${theme === 'light' ? 'text-[#555555]' : 'text-[#aaaaaa]'}`}>
                                            {notice.description}
                                        </p>
                                        <div className={`flex items-center text-[0.8rem] font-bold ${theme === 'light' ? 'text-[#888888]' : 'text-[#555555]'}`}>
                                            {notice.createdAt?.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) || 'Recent'}
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