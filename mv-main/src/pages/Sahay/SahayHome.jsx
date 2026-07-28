import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { useCivicStore } from '../../store/useCivicStore';
import { 
    AlertCircle, 
    HeartHandshake, 
    PhoneCall, 
    MapPin, 
    ShieldCheck, 
    Activity,
    LogOut,
    X,
    Globe,
    ArrowUp,
    Building,
    ArrowLeft
} from 'lucide-react';

export default function SahayHome() {
    const navigate = useNavigate();
    
    // 1. STATE MANAGEMENT
    const theme = useCivicStore((state) => state.theme) || 'light';
    const terminateSession = useCivicStore((state) => state.terminateSession);

    const [lang, setLang] = useState('en');
    const [showLangPrompt, setShowLangPrompt] = useState(false);
    const [showProductsPrompt, setShowProductsPrompt] = useState(false);
    const [showSitemap, setShowSitemap] = useState(false); // Sitemap Control State
    
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCity, setSelectedCity] = useState('All Cities');
    
    // Live Telemetry State
    const [metrics, setMetrics] = useState({
        totalReports: 0,
        successfulRescues: 0,
        verifiedPartners: 0
    });

    // 2. AUTHENTICATION & LIVE DATA FETCHING
    useEffect(() => {
        const sysLang = navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'hinglish', 'mr', 'gu', 'te', 'ta', 'pa', 'bho', 'ar', 'es', 'fr', 'de'];
        if (supported.includes(sysLang)) setLang(sysLang);

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });

        fetchLiveMetrics();

        return () => unsubscribe();
    }, []);

    const fetchLiveMetrics = async () => {
        setIsLoading(true);
        try {
            const casesRef = collection(db, 'sahay_cases');
            const orgsRef = collection(db, 'sahay_organizations');

            const totalCasesQuery = query(casesRef);
            const resolvedCasesQuery = query(casesRef, where('status', '==', 'Closed'));
            const verifiedOrgsQuery = query(orgsRef, where('verificationStatus', '==', 'Verified'));

            const [totalSnap, resolvedSnap, orgsSnap] = await Promise.all([
                getCountFromServer(totalCasesQuery),
                getCountFromServer(resolvedCasesQuery),
                getCountFromServer(verifiedOrgsQuery)
            ]);

            setMetrics({
                totalReports: totalSnap.data().count || 0,
                successfulRescues: resolvedSnap.data().count || 0,
                verifiedPartners: orgsSnap.data().count || 0
            });
        } catch (error) {
            console.error("Failed to fetch Sahay telemetry:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            terminateSession();
            navigate('/sahay/auth');
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 3. 13-LANGUAGE DICTIONARY (Simple, Professional, No Jargon + Sitemap Links)
    const t = {
        en: {
            lang: "English", log_out: "Log out", careers: "Careers", products: "Products", sign_in: "Sign In", sitemap: "Sitemap", sitemap_desc: "Direct navigation to all Sahay modules.",
            hero_title: "Report. Connect. Rescue.", hero_sub: "Help us connect homeless individuals, abandoned elderly, and injured animals with verified rescue organizations.",
            btn_report: "Report a Need", btn_partner: "Join as Partner",
            stat_reports: "Total Reports", stat_rescues: "Successful Rescues", stat_partners: "Verified Partners",
            emerg_title: "Emergency Contacts", emerg_sub: "Direct lines for immediate assistance.", 
            call_police: "Police Control", call_medical: "Ambulance", call_women: "Women Helpline", call_rescue: "Animal Rescue",
            city_select: "Select City", map_link: "View Rescue Map",
            sm_home: "Home Gateway", sm_report: "Submit Report", sm_cases: "Public Feed", sm_map: "Live Map", sm_org: "Partner Dashboard", sm_vol: "Volunteer Portal", sm_imp: "Impact Analytics", sm_emg: "Emergency Directory", sm_cont: "Contact & Inquiries", sm_abt: "About Mission", sm_auth: "Authentication", sm_adm: "Admin Console"
        },
        hi: {
            lang: "हिन्दी", log_out: "लॉग आउट", careers: "करियर", products: "उत्पाद", sign_in: "साइन इन", sitemap: "प्लेटफ़ॉर्म साइटमैप", sitemap_desc: "सभी सहाय मॉड्यूल पर सीधा नेविगेशन।",
            hero_title: "रिपोर्ट करें। संपर्क करें। बचाएं।", hero_sub: "बेघर व्यक्तियों, बुजुर्गों और घायल जानवरों को सत्यापित बचाव संगठनों से जोड़ने में हमारी मदद करें।",
            btn_report: "रिपोर्ट दर्ज करें", btn_partner: "पार्टनर के रूप में जुड़ें",
            stat_reports: "कुल रिपोर्ट", stat_rescues: "सफल बचाव", stat_partners: "सत्यापित पार्टनर",
            emerg_title: "आपातकालीन संपर्क", emerg_sub: "तत्काल सहायता के लिए सीधे नंबर।", 
            call_police: "पुलिस कंट्रोल", call_medical: "एम्बुलेंस", call_women: "महिला हेल्पलाइन", call_rescue: "पशु बचाव",
            city_select: "शहर चुनें", map_link: "बचाव मानचित्र देखें",
            sm_home: "होम गेटवे", sm_report: "रिपोर्ट सबमिट करें", sm_cases: "सार्वजनिक फ़ीड", sm_map: "लाइव मानचित्र", sm_org: "पार्टनर डैशबोर्ड", sm_vol: "स्वयंसेवक पोर्टल", sm_imp: "प्रभाव विश्लेषिकी", sm_emg: "आपातकालीन निर्देशिका", sm_cont: "संपर्क और पूछताछ", sm_abt: "मिशन के बारे में", sm_auth: "प्रमाणीकरण", sm_adm: "एडमिन कंसोल"
        },
        hinglish: {
            lang: "Hinglish", log_out: "Log out", careers: "Careers", products: "Products", sign_in: "Sign In", sitemap: "Platform Sitemap", sitemap_desc: "Sabhi Sahay modules ka direct navigation.",
            hero_title: "Report. Connect. Rescue.", hero_sub: "Homeless logo, abandoned elderly, aur injured animals ko verified NGOs se connect karne mein help karein.",
            btn_report: "Report Darj Karein", btn_partner: "Partner Banein",
            stat_reports: "Total Reports", stat_rescues: "Successful Rescues", stat_partners: "Verified Partners",
            emerg_title: "Emergency Contacts", emerg_sub: "Immediate help ke liye direct numbers.", 
            call_police: "Police Control", call_medical: "Ambulance", call_women: "Women Helpline", call_rescue: "Animal Rescue",
            city_select: "City Select Karein", map_link: "Rescue Map Dekhein",
            sm_home: "Home Gateway", sm_report: "Report Submit Karein", sm_cases: "Public Feed", sm_map: "Live Map", sm_org: "Partner Dashboard", sm_vol: "Volunteer Portal", sm_imp: "Impact Analytics", sm_emg: "Emergency Directory", sm_cont: "Contact aur Inquiries", sm_abt: "Mission ke baare mein", sm_auth: "Authentication", sm_adm: "Admin Console"
        },
        mr: {
            lang: "मराठी", log_out: "लॉग आउट", careers: "करिअर", products: "उत्पादने", sign_in: "साइन इन", sitemap: "प्लॅटफॉर्म साइटमॅप", sitemap_desc: "सर्व सहाय मॉड्यूल्ससाठी थेट नेव्हिगेशन.",
            hero_title: "अहवाल द्या. संपर्क करा. वाचवा.", hero_sub: "बेघर व्यक्ती, बेवारस वृद्ध आणि जखमी प्राण्यांना सत्यापित बचाव संस्थांशी जोडण्यात आम्हाला मदत करा.",
            btn_report: "अहवाल नोंदवा", btn_partner: "भागीदार म्हणून सामील व्हा",
            stat_reports: "एकूण अहवाल", stat_rescues: "यशस्वी बचाव", stat_partners: "सत्यापित भागीदार",
            emerg_title: "आपत्कालीन संपर्क", emerg_sub: "तात्काळ मदतीसाठी थेट क्रमांक.", 
            call_police: "पोलीस नियंत्रण", call_medical: "रुग्णवाहिका", call_women: "महिला हेल्पलाइन", call_rescue: "प्राणी बचाव",
            city_select: "शहर निवडा", map_link: "बचाव नकाशा पहा",
            sm_home: "होम गेटवे", sm_report: "अहवाल सबमिट करा", sm_cases: "सार्वजनिक फीड", sm_map: "थेट नकाशा", sm_org: "भागीदार डॅशबोर्ड", sm_vol: "स्वयंसेवक पोर्टल", sm_imp: "प्रभाव विश्लेषण", sm_emg: "आपत्कालीन निर्देशिका", sm_cont: "संपर्क आणि चौकशी", sm_abt: "मिशन बद्दल", sm_auth: "प्रमाणीकरण", sm_adm: "प्रशासन कन्सोल"
        },
        gu: {
            lang: "ગુજરાતી", log_out: "લૉગ આઉટ", careers: "કારકિર્દી", products: "ઉત્પાદનો", sign_in: "સાઇન ઇન", sitemap: "પ્લેટફોર્મ સાઇટમેપ", sitemap_desc: "તમામ સહાય મોડ્યુલો માટે સીધું નેવિગેશન.",
            hero_title: "રિપોર્ટ. કનેક્ટ. બચાવ.", hero_sub: "બેઘર વ્યક્તિઓ, ત્યજી દેવાયેલા વૃદ્ધો અને ઘાયલ પ્રાણીઓને ચકાસાયેલ બચાવ સંસ્થાઓ સાથે જોડવામાં અમારી સહાય કરો.",
            btn_report: "જરૂરિયાતની જાણ કરો", btn_partner: "ભાગીદાર તરીકે જોડાઓ",
            stat_reports: "કુલ અહેવાલો", stat_rescues: "સફળ બચાવ", stat_partners: "ચકાસાયેલ ભાગીદારો",
            emerg_title: "કટોકટી સંપર્કો", emerg_sub: "તાત્કાલિક સહાય માટે સીધા નંબરો.", 
            call_police: "પોલીસ નિયંત્રણ", call_medical: "એમ્બ્યુલન્સ", call_women: "મહિલા હેલ્પલાઇન", call_rescue: "પ્રાણી બચાવ",
            city_select: "શહેર પસંદ કરો", map_link: "બચાવ નકશો જુઓ",
            sm_home: "હોમ ગેટવે", sm_report: "રિપોર્ટ સબમિટ કરો", sm_cases: "જાહેર ફીડ", sm_map: "જીવંત નકશો", sm_org: "ભાગીદાર ડેશબોર્ડ", sm_vol: "સ્વયંસેવક પોર્ટલ", sm_imp: "અસર એનાલિટિક્સ", sm_emg: "કટોકટી ડિરેક્ટરી", sm_cont: "સંપર્ક અને પૂછપરછ", sm_abt: "મિશન વિશે", sm_auth: "પ્રમાણીકરણ", sm_adm: "એડમિન કન્સોલ"
        },
        te: {
            lang: "తెలుగు", log_out: "లాగౌట్", careers: "కెరీర్స్", products: "ఉత్పత్తులు", sign_in: "సైన్ ఇన్", sitemap: "ప్లాట్‌ఫారమ్ సైట్‌మ్యాప్", sitemap_desc: "అన్ని సహాయ్ మాడ్యూల్స్‌కు ప్రత్యక్ష నావిగేషన్.",
            hero_title: "నివేదించండి. కనెక్ట్ చేయండి. రక్షించండి.", hero_sub: "నిరాశ్రయులైన వ్యక్తులు, వదిలివేయబడిన వృద్ధులు మరియు గాయపడిన జంతువులను ధృవీకరించబడిన సంస్థలతో కనెక్ట్ చేయడంలో మాకు సహాయపడండి.",
            btn_report: "అవసరాన్ని నివేదించండి", btn_partner: "భాగస్వామిగా చేరండి",
            stat_reports: "మొత్తం నివేదికలు", stat_rescues: "విజయవంతమైన రక్షణలు", stat_partners: "ధృవీకరించబడిన భాగస్వాములు",
            emerg_title: "అత్యవసర పరిచయాలు", emerg_sub: "తక్షణ సహాయం కోసం ప్రత్యక్ష సంఖ్యలు.", 
            call_police: "పోలీస్ కంట్రోల్", call_medical: "అంబులెన్స్", call_women: "మహిళా హెల్ప్‌లైన్", call_rescue: "జంతు రక్షణ",
            city_select: "నగరాన్ని ఎంచుకోండి", map_link: "రెస్క్యూ మ్యాప్‌ని వీక్షించండి",
            sm_home: "హోమ్ గేట్‌వే", sm_report: "నివేదిక సమర్పించండి", sm_cases: "పబ్లిక్ ఫీడ్", sm_map: "లైవ్ మ్యాప్", sm_org: "భాగస్వామి డాష్‌బోర్డ్", sm_vol: "వాలంటీర్ పోర్టల్", sm_imp: "ఇంపాక్ట్ అనలిటిక్స్", sm_emg: "అత్యవసర డైరెక్టరీ", sm_cont: "సంప్రదింపులు మరియు విచారణలు", sm_abt: "మిషన్ గురించి", sm_auth: "ప్రామాణీకరణ", sm_adm: "అడ్మిన్ కన్సోల్"
        },
        ta: {
            lang: "தமிழ்", log_out: "வெளியேறு", careers: "தொழில்கள்", products: "தயாரிப்புகள்", sign_in: "உள்நுழைய", sitemap: "தளத்தின் வரைபடம்", sitemap_desc: "அனைத்து சஹாய் தொகுதிகளுக்கும் நேரடி வழிசெலுத்தல்.",
            hero_title: "புகாரளி. இணை. காப்பாற்று.", hero_sub: "வீடற்ற நபர்கள், கைவிடப்பட்ட முதியவர்கள் மற்றும் காயமடைந்த விலங்குகளை சரிபார்க்கப்பட்ட அமைப்புகளுடன் இணைக்க உதவுங்கள்.",
            btn_report: "தேவையை புகாரளிக்கவும்", btn_partner: "கூட்டாளராக சேரவும்",
            stat_reports: "மொத்த அறிக்கைகள்", stat_rescues: "வெற்றிகரமான மீட்புகள்", stat_partners: "சரிபார்க்கப்பட்ட கூட்டாளர்கள்",
            emerg_title: "அவசர தொடர்புகள்", emerg_sub: "உடனடி உதவிக்கான நேரடி எண்கள்.", 
            call_police: "காவல்துறை கட்டுப்பாடு", call_medical: "ஆம்புலன்ஸ்", call_women: "பெண்கள் உதவி எண்", call_rescue: "விலங்கு மீட்பு",
            city_select: "நகரத்தைத் தேர்ந்தெடுக்கவும்", map_link: "மீட்பு வரைபடத்தைக் காண்க",
            sm_home: "முகப்பு நுழைவாயில்", sm_report: "அறிக்கையை சமர்ப்பிக்கவும்", sm_cases: "பொது ஊட்டம்", sm_map: "நேரடி வரைபடம்", sm_org: "கூட்டாளர் டாஷ்போர்டு", sm_vol: "தன்னார்வ போர்டல்", sm_imp: "தாக்க பகுப்பாய்வு", sm_emg: "அவசர அடைவு", sm_cont: "தொடர்பு மற்றும் விசாரணைகள்", sm_abt: "பணி பற்றி", sm_auth: "அங்கீகாரம்", sm_adm: "நிர்வாக கன்சோல்"
        },
        pa: {
            lang: "ਪੰਜਾਬੀ", log_out: "ਲੌਗ ਆਉਟ", careers: "ਕਰੀਅਰ", products: "ਉਤਪਾਦ", sign_in: "ਸਾਈਨ ਇਨ", sitemap: "ਪਲੇਟਫਾਰਮ ਸਾਈਟਮੈਪ", sitemap_desc: "ਸਾਰੇ ਸਹਾਏ ਮੋਡਿਊਲਾਂ ਲਈ ਸਿੱਧੀ ਨੈਵੀਗੇਸ਼ਨ।",
            hero_title: "ਰਿਪੋਰਟ. ਕਨੈਕਟ. ਬਚਾਓ.", hero_sub: "ਬੇਘਰ ਵਿਅਕਤੀਆਂ, ਬਜ਼ੁਰਗਾਂ ਅਤੇ ਜ਼ਖਮੀ ਜਾਨਵਰਾਂ ਨੂੰ ਪ੍ਰਮਾਣਿਤ ਬਚਾਅ ਸੰਸਥਾਵਾਂ ਨਾਲ ਜੋੜਨ ਵਿੱਚ ਸਾਡੀ ਮਦਦ ਕਰੋ।",
            btn_report: "ਲੋੜ ਦੀ ਰਿਪੋਰਟ ਕਰੋ", btn_partner: "ਪਾਰਟਨਰ ਵਜੋਂ ਸ਼ਾਮਲ ਹੋਵੋ",
            stat_reports: "ਕੁੱਲ ਰਿਪੋਰਟਾਂ", stat_rescues: "ਸਫਲ ਬਚਾਅ", stat_partners: "ਪ੍ਰਮਾਣਿਤ ਭਾਈਵਾਲ",
            emerg_title: "ਐਮਰਜੈਂਸੀ ਸੰਪਰਕ", emerg_sub: "ਤੁਰੰਤ ਸਹਾਇਤਾ ਲਈ ਸਿੱਧੇ ਨੰਬਰ।", 
            call_police: "ਪੁਲਿਸ ਕੰਟਰੋਲ", call_medical: "ਐਂਬੂਲੈਂਸ", call_women: "ਮਹਿਲਾ ਹੈਲਪਲਾਈਨ", call_rescue: "ਜਾਨਵਰ ਬਚਾਅ",
            city_select: "ਸ਼ਹਿਰ ਚੁਣੋ", map_link: "ਬਚਾਅ ਨਕਸ਼ਾ ਦੇਖੋ",
            sm_home: "ਹੋਮ ਗੇਟਵੇ", sm_report: "ਰਿਪੋਰਟ ਦਰਜ ਕਰੋ", sm_cases: "ਜਨਤਕ ਫੀਡ", sm_map: "ਲਾਈਵ ਨਕਸ਼ਾ", sm_org: "ਪਾਰਟਨਰ ਡੈਸ਼ਬੋਰਡ", sm_vol: "ਵਲੰਟੀਅਰ ਪੋਰਟਲ", sm_imp: "ਪ੍ਰਭਾਵ ਵਿਸ਼ਲੇਸ਼ਣ", sm_emg: "ਐਮਰਜੈਂਸੀ ਡਾਇਰੈਕਟਰੀ", sm_cont: "ਸੰਪਰਕ ਅਤੇ ਪੁੱਛਗਿੱਛ", sm_abt: "ਮਿਸ਼ਨ ਬਾਰੇ", sm_auth: "ਪ੍ਰਮਾਣਿਕਤਾ", sm_adm: "ਐਡਮਿਨ ਕੰਸੋਲ"
        },
        bho: {
            lang: "भोजपुरी", log_out: "लॉग आउट", careers: "करियर", products: "उत्पाद", sign_in: "साइन इन", sitemap: "प्लेटफॉर्म साइटमैप", sitemap_desc: "सब सहाय मॉड्यूल पर सीधा नेविगेशन।",
            hero_title: "रिपोर्ट करीं। संपर्क करीं। बचाईं।", hero_sub: "बेघर लोग, बुजुर्ग आ घायल जानवरन के सत्यापित बचाव संगठनन से जोड़े में हमनी के मदद करीं।",
            btn_report: "जरूरत के रिपोर्ट करीं", btn_partner: "पार्टनर के रूप में जुड़ीं",
            stat_reports: "कुल रिपोर्ट", stat_rescues: "सफल बचाव", stat_partners: "सत्यापित पार्टनर",
            emerg_title: "आपातकालीन संपर्क", emerg_sub: "तुरंत मदद खातिर सीधा नंबर।", 
            call_police: "पुलिस कंट्रोल", call_medical: "एम्बुलेंस", call_women: "महिला हेल्पलाइन", call_rescue: "जानवर बचाव",
            city_select: "शहर चुनीं", map_link: "बचाव नक्शा देखीं",
            sm_home: "होम गेटवे", sm_report: "रिपोर्ट सबमिट करीं", sm_cases: "सार्वजनिक फीड", sm_map: "लाइव नक्शा", sm_org: "पार्टनर डैशबोर्ड", sm_vol: "स्वयंसेवक पोर्टल", sm_imp: "प्रभाव विश्लेषिकी", sm_emg: "आपातकालीन निर्देशिका", sm_cont: "संपर्क आ पूछताछ", sm_abt: "मिशन के बारे में", sm_auth: "प्रमाणीकरण", sm_adm: "एडमिन कंसोल"
        },
        ar: {
            lang: "العربية", log_out: "تسجيل الخروج", careers: "الوظائف", products: "المنتجات", sign_in: "تسجيل الدخول", sitemap: "خريطة الموقع", sitemap_desc: "التنقل المباشر لجميع وحدات ساهاي.",
            hero_title: "إبلاغ. تواصل. إنقاذ.", hero_sub: "ساعدنا في ربط الأفراد المشردين وكبار السن والحيوانات المصابة بمنظمات الإنقاذ المعتمدة.",
            btn_report: "الإبلاغ عن حاجة", btn_partner: "انضم كشريك",
            stat_reports: "إجمالي التقارير", stat_rescues: "عمليات الإنقاذ الناجحة", stat_partners: "الشركاء المعتمدون",
            emerg_title: "جهات اتصال الطوارئ", emerg_sub: "خطوط مباشرة للمساعدة الفورية.", 
            call_police: "شرطة", call_medical: "إسعاف", call_women: "خط مساعدة النساء", call_rescue: "إنقاذ الحيوانات",
            city_select: "اختر مدينة", map_link: "عرض خريطة الإنقاذ",
            sm_home: "البوابة الرئيسية", sm_report: "إرسال تقرير", sm_cases: "الخلاصة العامة", sm_map: "خريطة حية", sm_org: "لوحة تحكم الشريك", sm_vol: "بوابة المتطوعين", sm_imp: "تحليلات التأثير", sm_emg: "دليل الطوارئ", sm_cont: "الاتصال والاستفسارات", sm_abt: "حول المهمة", sm_auth: "المصادقة", sm_adm: "وحدة تحكم الإدارة"
        },
        es: {
            lang: "Español", log_out: "Cerrar sesión", careers: "Carreras", products: "Productos", sign_in: "Iniciar Sesión", sitemap: "Mapa del sitio", sitemap_desc: "Navegación directa a todos los módulos de Sahay.",
            hero_title: "Reportar. Conectar. Rescatar.", hero_sub: "Ayúdenos a conectar personas sin hogar, ancianos abandonados y animales heridos con organizaciones verificadas.",
            btn_report: "Reportar una Necesidad", btn_partner: "Únete como Socio",
            stat_reports: "Reportes Totales", stat_rescues: "Rescates Exitosos", stat_partners: "Socios Verificados",
            emerg_title: "Contactos de Emergencia", emerg_sub: "Líneas directas para asistencia inmediata.", 
            call_police: "Policía", call_medical: "Ambulancia", call_women: "Ayuda a Mujeres", call_rescue: "Rescate Animal",
            city_select: "Seleccionar Ciudad", map_link: "Ver Mapa de Rescate",
            sm_home: "Portal de Inicio", sm_report: "Enviar Reporte", sm_cases: "Feed Público", sm_map: "Mapa en Vivo", sm_org: "Panel de Socios", sm_vol: "Portal de Voluntarios", sm_imp: "Análisis de Impacto", sm_emg: "Directorio de Emergencia", sm_cont: "Contacto", sm_abt: "Acerca de la Misión", sm_auth: "Autenticación", sm_adm: "Consola de Administración"
        },
        fr: {
            lang: "Français", log_out: "Se déconnecter", careers: "Carrières", products: "Produits", sign_in: "Se Connecter", sitemap: "Plan du site", sitemap_desc: "Navigation directe vers tous les modules Sahay.",
            hero_title: "Signaler. Connecter. Sauver.", hero_sub: "Aidez-nous à connecter les sans-abri, les personnes âgées abandonnées et les animaux blessés avec des organisations vérifiées.",
            btn_report: "Signaler un Besoin", btn_partner: "Rejoindre en tant que Partenaire",
            stat_reports: "Rapports Totaux", stat_rescues: "Sauvetages Réussis", stat_partners: "Partenaires Vérifiés",
            emerg_title: "Contacts d'Urgence", emerg_sub: "Lignes directes pour une assistance immédiate.", 
            call_police: "Police", call_medical: "Ambulance", call_women: "Aide aux Femmes", call_rescue: "Sauvetage Animal",
            city_select: "Sélectionner la Ville", map_link: "Voir la Carte des Sauvetages",
            sm_home: "Portail d'Accueil", sm_report: "Soumettre un Rapport", sm_cases: "Flux Public", sm_map: "Carte en Direct", sm_org: "Tableau de Bord", sm_vol: "Portail Bénévole", sm_imp: "Analyse d'Impact", sm_emg: "Annuaire d'Urgence", sm_cont: "Contact", sm_abt: "À Propos", sm_auth: "Authentification", sm_adm: "Console d'Administration"
        },
        de: {
            lang: "Deutsch", log_out: "Abmelden", careers: "Karriere", products: "Produkte", sign_in: "Anmelden", sitemap: "Seitenverzeichnis", sitemap_desc: "Direkte Navigation zu allen Sahay-Modulen.",
            hero_title: "Melden. Verbinden. Retten.", hero_sub: "Helfen Sie uns, Obdachlose, verlassene ältere Menschen und verletzte Tiere an verifizierte Organisationen zu vermitteln.",
            btn_report: "Einen Bedarf Melden", btn_partner: "Als Partner Beitreten",
            stat_reports: "Gesamte Berichte", stat_rescues: "Erfolgreiche Rettungen", stat_partners: "Verifizierte Partner",
            emerg_title: "Notfallkontakte", emerg_sub: "Direkte Nummern für sofortige Hilfe.", 
            call_police: "Polizei", call_medical: "Krankenwagen", call_women: "Frauen-Helpline", call_rescue: "Tierrettung",
            city_select: "Stadt Wählen", map_link: "Rettungskarte Anzeigen",
            sm_home: "Startportal", sm_report: "Meldung Einreichen", sm_cases: "Öffentlicher Feed", sm_map: "Live-Karte", sm_org: "Partner-Dashboard", sm_vol: "Freiwilligen-Portal", sm_imp: "Auswirkungsanalyse", sm_emg: "Notfallverzeichnis", sm_cont: "Kontakt", sm_abt: "Über die Mission", sm_auth: "Authentifizierung", sm_adm: "Admin-Konsole"
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

    const indianCities = ['All Cities', 'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Ahmedabad', 'Jaipur'];

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
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
                    <img 
                        src={theme === 'light' ? '/logo-4.png' : '/logo.png'} 
                        alt="Movyra" 
                        className="h-8 w-auto" 
                        onError={(e) => e.target.style.display = 'none'} 
                    />
                    <span className="font-black text-[1.5rem] tracking-tighter ml-[-5px]">
                        ovyra <span className={`${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'} font-medium text-[1.2rem] ml-1`}>Sahay</span>
                    </span>
                </div>
                
                <div className="flex items-center gap-3 sm:gap-6 text-[0.9rem] font-bold">
                    <button 
                        onClick={() => setShowLangPrompt(true)}
                        className="flex items-center gap-2 text-[#555555] hover:text-[#111111] transition-colors outline-none px-3 py-1.5 rounded-full border border-[#E5E7EB] hover:border-[#111111]"
                    >
                        <Globe size={14} /> <span className="hidden sm:inline">{currentT.lang}</span>
                    </button>

                    {currentUser ? (
                        <>
                            <button onClick={handleSignOut} className="text-[#555555] hover:text-[#111111] transition-colors outline-none hidden sm:block">
                                {currentT.log_out}
                            </button>
                            <button onClick={handleSignOut} className="p-2 rounded-full bg-[#F7F7F7] text-[#111111] hover:bg-[#E5E7EB] transition-colors outline-none block sm:hidden">
                                <LogOut size={16} />
                            </button>
                        </>
                    ) : (
                        <button onClick={() => navigate('/sahay/auth')} className="bg-[#111111] text-[#FFFFFF] px-5 py-2 rounded-full flex items-center gap-2 hover:bg-[#555555] transition-colors outline-none">
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
                            className="w-full max-w-[400px] bg-[#FFFFFF] rounded-3xl p-8 flex flex-col shadow-2xl relative max-h-[80vh] overflow-y-auto border border-[#E5E7EB]"
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
                                        className={`w-full p-4 rounded-xl flex items-center justify-between group transition-colors border outline-none ${
                                            lang === option.code ? 'bg-[#FF6B35]/10 border-[#FF6B35] text-[#FF6B35]' : 'bg-[#F7F7F7] border-[#E5E7EB] text-[#555555] hover:border-[#111111] hover:text-[#111111]'
                                        }`}
                                    >
                                        <span className="font-bold text-[1rem]">{option.label}</span>
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
                        className="fixed inset-0 z-[9999] bg-[#111111]/80 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-[500px] bg-[#FFFFFF] rounded-3xl p-8 flex flex-col shadow-2xl relative border border-[#E5E7EB]"
                        >
                            <button onClick={() => setShowProductsPrompt(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[#555555] hover:text-[#111111] transition-colors outline-none">
                                <X size={18} />
                            </button>

                            <h2 className="text-[1.5rem] font-black tracking-tight mb-2 text-center mt-2 text-[#111111]">Also from us</h2>
                            <p className="text-[#555555] text-[0.9rem] text-center mb-8">Discover our connected platforms.</p>

                            <Link to="/civic/" className="group flex flex-col items-center gap-4 p-6 rounded-2xl transition-colors text-center w-full outline-none border bg-[#F7F7F7] border-[#E5E7EB] hover:border-[#111111]">
                                <div className="flex items-center gap-2 mb-2">
                                    <img src="/logo-3.png" alt="Movyra" className="h-6 w-auto" onError={(e) => e.target.style.display = 'none'} />
                                    <span className="font-black text-[1.2rem] tracking-tighter ml-[-5px] text-[#111111]">
                                        ovyra <span className="text-[#555555] font-medium text-[1rem] ml-1">Civic</span>
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[0.85rem] leading-relaxed transition-colors text-[#555555] group-hover:text-[#111111]">
                                        Smart city management. Report issues easily.
                                    </p>
                                </div>
                            </Link>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="flex-1 flex flex-col">
                
                {/* HERO SECTION */}
                <section className="w-full bg-[#F7F7F7] py-20 px-6 md:px-12 border-b border-[#E5E7EB]">
                    <div className="max-w-[1200px] mx-auto flex flex-col items-center text-center animate-fade">
                        <div className="w-16 h-16 bg-[#FF6B35]/10 rounded-full flex items-center justify-center mb-6">
                            <HeartHandshake size={32} className="text-[#FF6B35]" />
                        </div>
                        <h1 className="text-[3rem] md:text-[4.5rem] font-black leading-[1.1] tracking-tighter mb-6 text-[#111111]">
                            {currentT.hero_title}
                        </h1>
                        <p className="text-[1.1rem] md:text-[1.25rem] text-[#555555] font-medium leading-relaxed max-w-[700px] mb-10">
                            {currentT.hero_sub}
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                            <button 
                                onClick={() => navigate('/sahay/report')}
                                className="w-full sm:w-auto bg-[#FF6B35] text-[#FFFFFF] px-10 py-4 rounded-full font-black text-[1.1rem] hover:bg-[#E85D2A] transition-colors shadow-lg shadow-[#FF6B35]/20 outline-none"
                            >
                                {currentT.btn_report}
                            </button>
                            <button 
                                onClick={() => navigate('/sahay/contact')}
                                className="w-full sm:w-auto bg-[#FFFFFF] text-[#111111] border border-[#E5E7EB] px-10 py-4 rounded-full font-black text-[1.1rem] hover:border-[#111111] transition-colors outline-none"
                            >
                                {currentT.btn_partner}
                            </button>
                        </div>
                    </div>
                </section>

                {/* TELEMETRY SECTION */}
                <section className="w-full py-16 px-6 md:px-12">
                    <div className="max-w-[1200px] mx-auto animate-fade" style={{ animationDelay: '0.2s' }}>
                        
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-[1.5rem] font-black text-[#111111]">Live Impact</h2>
                            <select 
                                value={selectedCity} 
                                onChange={(e) => setSelectedCity(e.target.value)}
                                className="bg-[#F7F7F7] border border-[#E5E7EB] text-[#111111] px-4 py-2 rounded-lg text-[0.9rem] font-bold outline-none cursor-pointer hover:border-[#111111] transition-colors appearance-none"
                            >
                                {indianCities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-[#FFFFFF] border border-[#E5E7EB] p-8 rounded-2xl flex flex-col">
                                <div className="w-10 h-10 bg-[#F7F7F7] rounded-full flex items-center justify-center mb-4">
                                    <Activity size={20} className="text-[#555555]" />
                                </div>
                                <h3 className="text-[2.5rem] font-black text-[#111111] leading-none mb-2">
                                    {isLoading ? "..." : metrics.totalReports}
                                </h3>
                                <p className="text-[#555555] font-bold text-[0.9rem] uppercase tracking-wider">{currentT.stat_reports}</p>
                            </div>
                            
                            <div className="bg-[#FFFFFF] border border-[#E5E7EB] p-8 rounded-2xl flex flex-col">
                                <div className="w-10 h-10 bg-[#16A34A]/10 rounded-full flex items-center justify-center mb-4">
                                    <ShieldCheck size={20} className="text-[#16A34A]" />
                                </div>
                                <h3 className="text-[2.5rem] font-black text-[#16A34A] leading-none mb-2">
                                    {isLoading ? "..." : metrics.successfulRescues}
                                </h3>
                                <p className="text-[#555555] font-bold text-[0.9rem] uppercase tracking-wider">{currentT.stat_rescues}</p>
                            </div>

                            <div className="bg-[#FFFFFF] border border-[#E5E7EB] p-8 rounded-2xl flex flex-col">
                                <div className="w-10 h-10 bg-[#00A9F7]/10 rounded-full flex items-center justify-center mb-4">
                                    <Building size={20} className="text-[#00A9F7]" />
                                </div>
                                <h3 className="text-[2.5rem] font-black text-[#00A9F7] leading-none mb-2">
                                    {isLoading ? "..." : metrics.verifiedPartners}
                                </h3>
                                <p className="text-[#555555] font-bold text-[0.9rem] uppercase tracking-wider">{currentT.stat_partners}</p>
                            </div>
                        </div>

                        <button 
                            onClick={() => navigate('/sahay/map')}
                            className="w-full mt-6 bg-[#F7F7F7] border border-[#E5E7EB] py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-[#111111] hover:bg-[#E5E7EB] transition-colors outline-none"
                        >
                            <MapPin size={18} className="text-[#00A9F7]" /> {currentT.map_link}
                        </button>
                    </div>
                </section>

                {/* EMERGENCY ACTIONS SECTION */}
                <section className="w-full bg-[#111111] py-16 px-6 md:px-12">
                    <div className="max-w-[1200px] mx-auto animate-fade" style={{ animationDelay: '0.3s' }}>
                        <div className="mb-10 text-center">
                            <h2 className="text-[2rem] font-black text-[#FFFFFF] mb-2">{currentT.emerg_title}</h2>
                            <p className="text-[#888888]">{currentT.emerg_sub}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <a href="tel:100" className="bg-[#DC2626] text-[#FFFFFF] p-6 rounded-2xl flex items-center gap-4 hover:bg-[#B91C1C] transition-colors outline-none">
                                <div className="w-12 h-12 bg-[#FFFFFF]/20 rounded-full flex items-center justify-center shrink-0">
                                    <AlertCircle size={24} />
                                </div>
                                <div>
                                    <div className="font-black text-[1.2rem]">100</div>
                                    <div className="text-[0.8rem] font-bold opacity-90">{currentT.call_police}</div>
                                </div>
                            </a>
                            <a href="tel:108" className="bg-[#DC2626] text-[#FFFFFF] p-6 rounded-2xl flex items-center gap-4 hover:bg-[#B91C1C] transition-colors outline-none">
                                <div className="w-12 h-12 bg-[#FFFFFF]/20 rounded-full flex items-center justify-center shrink-0">
                                    <Activity size={24} />
                                </div>
                                <div>
                                    <div className="font-black text-[1.2rem]">108</div>
                                    <div className="text-[0.8rem] font-bold opacity-90">{currentT.call_medical}</div>
                                </div>
                            </a>
                            <a href="tel:1091" className="bg-[#FF6B35] text-[#FFFFFF] p-6 rounded-2xl flex items-center gap-4 hover:bg-[#E85D2A] transition-colors outline-none">
                                <div className="w-12 h-12 bg-[#FFFFFF]/20 rounded-full flex items-center justify-center shrink-0">
                                    <ShieldCheck size={24} />
                                </div>
                                <div>
                                    <div className="font-black text-[1.2rem]">1091</div>
                                    <div className="text-[0.8rem] font-bold opacity-90">{currentT.call_women}</div>
                                </div>
                            </a>
                            <a href="tel:1916" className="bg-[#F59E0B] text-[#FFFFFF] p-6 rounded-2xl flex items-center gap-4 hover:bg-[#D97706] transition-colors outline-none">
                                <div className="w-12 h-12 bg-[#FFFFFF]/20 rounded-full flex items-center justify-center shrink-0">
                                    <PhoneCall size={24} />
                                </div>
                                <div>
                                    <div className="font-black text-[1.2rem]">1916</div>
                                    <div className="text-[0.8rem] font-bold opacity-90">{currentT.call_rescue}</div>
                                </div>
                            </a>
                        </div>
                    </div>
                </section>

            </main>

            {/* FOOTER ALIGNMENT */}
            <footer className="w-full mx-auto flex flex-col md:flex-row items-center justify-between gap-8 px-8 md:px-16 py-12 border-t border-[#E5E7EB] bg-[#FFFFFF] relative z-10 animate-fade" style={{ animationDelay: '0.4s' }}>
                <div className="flex flex-wrap items-center gap-6">
                    <button onClick={() => setShowLangPrompt(true)} className="flex items-center gap-2 text-[0.8rem] font-bold px-3 py-1.5 rounded-full transition-colors border border-[#E5E7EB] text-[#555555] hover:border-[#111111] hover:text-[#111111] outline-none">
                        <Globe size={14} /> {currentT.lang}
                    </button>
                    <div className="flex items-center gap-6 text-[#555555]">
                        <a href="https://www.linkedin.com/company/getmovyra/" target="_blank" rel="noopener noreferrer" className="hover:text-[#111111] transition-colors outline-none">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        </a>
                        <a href="#youtube" className="hover:text-[#111111] transition-colors outline-none">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
                        </a>
                        <a href="https://www.instagram.com/getmovyra" target="_blank" rel="noopener noreferrer" className="hover:text-[#111111] transition-colors outline-none">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                        </a>
                        <a href="#x" className="hover:text-[#111111] transition-colors outline-none">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.006 4.15H5.078z"/></svg>
                        </a>
                    </div>
                </div>
                
                <div className="flex flex-col md:flex-row items-center gap-6 text-[0.8rem] font-bold text-[#555555]">
                    <div className="flex items-center gap-6">
                        <button onClick={() => setShowProductsPrompt(true)} className="hover:text-[#111111] transition-colors outline-none">{currentT.products}</button>
                        <span className="w-1 h-1 bg-[#E5E7EB] rounded-full"></span>
                        <span onClick={() => setShowSitemap(true)} className="cursor-pointer hover:text-[#111111] transition-colors underline outline-none">{currentT.sitemap}</span>
                        <span className="w-1 h-1 bg-[#E5E7EB] rounded-full"></span>
                        <Link to="/careers" className="hover:text-[#111111] transition-colors outline-none">{currentT.careers}</Link>
                    </div>
                    <span className="hidden md:block w-1 h-1 bg-[#E5E7EB] rounded-full"></span>
                    
                    <div className="flex items-center gap-2 text-[0.75rem] uppercase tracking-wider">
                        Built by 
                        <a href="https://rebrand.ly/aatns" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition-opacity outline-none">
                            <img 
                                src={theme === 'light' ? '/aat2.png' : '/aat.png'} 
                                alt="AnyAstro" 
                                className="h-4 w-auto object-contain" 
                                onError={(e) => { e.target.style.display = 'none'; e.target.insertAdjacentHTML('afterend', '<span class="underline text-[#111111]">AnyAstro</span>'); }} 
                            />
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