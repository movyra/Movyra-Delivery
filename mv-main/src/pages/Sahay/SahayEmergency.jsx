import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { useCivicStore } from '../../store/useCivicStore';
import { 
    ArrowLeft, 
    LogOut,
    X,
    Globe,
    ArrowUp,
    Phone,
    ShieldAlert,
    Search,
    Filter,
    Activity,
    HeartHandshake,
    ShieldCheck,
    Building,
    AlertTriangle // Added missing import
} from 'lucide-react';

export default function SahayEmergency() {
    const navigate = useNavigate();
    
    // 1. STATE MANAGEMENT
    const theme = useCivicStore((state) => state.theme) || 'light'; 
    const terminateSession = useCivicStore((state) => state.terminateSession);

    const [lang, setLang] = useState('en');
    const [showLangPrompt, setShowLangPrompt] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [showSitemap, setShowSitemap] = useState(false); // Added for sitemap modal
    
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    // 2. AUTHENTICATION & INITIALIZATION
    useEffect(() => {
        const sysLang = navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'hinglish', 'mr', 'gu', 'te', 'ta', 'pa', 'bho', 'ar', 'es', 'fr', 'de'];
        if (supported.includes(sysLang)) setLang(sysLang);

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });

        return () => unsubscribe();
    }, []);

    // 3. OPERATIONAL LOGIC
    const handleSignOut = async () => {
        try {
            await signOut(auth);
            terminateSession();
            navigate('/sahay'); // Redirect changed to /sahay for consistency
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    // 4. REAL-WORLD DATA MATRIX (India)
    const emergencyDirectory = [
        { id: '1', category: 'Critical', name: 'National Emergency', desc: 'All-in-one emergency response', phone: '112', icon: ShieldAlert, color: 'text-[#DC2626]', bg: 'bg-[#DC2626]/10' },
        { id: '2', category: 'Critical', name: 'Police Control', desc: 'Law enforcement and immediate security', phone: '100', icon: ShieldCheck, color: 'text-[#DC2626]', bg: 'bg-[#DC2626]/10' },
        { id: '3', category: 'Medical', name: 'Ambulance Services', desc: 'Immediate medical transport', phone: '108', icon: Activity, color: 'text-[#DC2626]', bg: 'bg-[#DC2626]/10' },
        { id: '4', category: 'Women', name: 'Women Helpline', desc: 'Support and rescue for women in distress', phone: '1091', icon: ShieldCheck, color: 'text-[#FF6B35]', bg: 'bg-[#FF6B35]/10' },
        { id: '5', category: 'Elderly', name: 'Elder Line', desc: 'National helpline for senior citizens', phone: '14567', icon: HeartHandshake, color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10' },
        { id: '6', category: 'Children', name: 'Childline India', desc: 'Rescue and support for children', phone: '1098', icon: HeartHandshake, color: 'text-[#00A9F7]', bg: 'bg-[#00A9F7]/10' },
        { id: '7', category: 'Disaster', name: 'Disaster Management', desc: 'Municipal natural disaster response', phone: '1916', icon: AlertTriangle, color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10' },
        { id: '8', category: 'Mental Health', name: 'Kiran Helpline', desc: 'Mental health and suicide prevention', phone: '18005990019', icon: Activity, color: 'text-[#FF6B35]', bg: 'bg-[#FF6B35]/10' },
        { id: '9', category: 'Animal', name: 'People For Animals', desc: 'National animal rescue headquarters', phone: '01123381585', icon: Building, color: 'text-[#16A34A]', bg: 'bg-[#16A34A]/10' },
        { id: '10', category: 'Disaster', name: 'NDRF Control', desc: 'National Disaster Response Force', phone: '9711077372', icon: AlertTriangle, color: 'text-[#FF6B35]', bg: 'bg-[#FF6B35]/10' }
    ];

    const filteredDirectory = emergencyDirectory.filter(contact => {
        const matchesCategory = activeCategory === 'All' || contact.category === activeCategory;
        const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) || contact.desc.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // 5. 13-LANGUAGE DICTIONARY (Simple Consumer Context + Sitemap)
    const t = {
        en: {
            lang: "English", log_out: "Log out", careers: "Careers", back: "Back to Home", sitemap: "Sitemap", sitemap_desc: "Direct navigation to all Sahay modules.",
            title: "Emergency Directory", sub: "One-tap direct lines to national rescue and support services.",
            search_ph: "Search for a service...", filter_cat: "Filter by need:",
            cat_all: "All Numbers", cat_crit: "Critical", cat_med: "Medical", cat_wom: "Women", cat_eld: "Elderly", cat_anim: "Animal",
            btn_call: "Call Now", empty: "No numbers found.", empty_sub: "Try adjusting your search terms.",
            sm_home: "Home Gateway", sm_report: "Submit Report", sm_cases: "Public Feed", sm_map: "Live Map", sm_org: "Partner Dashboard", sm_vol: "Volunteer Portal", sm_imp: "Impact Analytics", sm_emg: "Emergency Directory", sm_cont: "Contact & Inquiries", sm_abt: "About Mission", sm_auth: "Authentication", sm_adm: "Admin Console"
        },
        hi: {
            lang: "हिन्दी", log_out: "लॉग आउट", careers: "करियर", back: "होम पर वापस जाएं", sitemap: "प्लेटफ़ॉर्म साइटमैप", sitemap_desc: "सभी सहाय मॉड्यूल पर सीधा नेविगेशन।",
            title: "आपातकालीन निर्देशिका", sub: "राष्ट्रीय बचाव और सहायता सेवाओं के लिए सीधे नंबर।",
            search_ph: "सेवा खोजें...", filter_cat: "ज़रूरत के अनुसार फ़िल्टर करें:",
            cat_all: "सभी नंबर", cat_crit: "गंभीर", cat_med: "चिकित्सा", cat_wom: "महिलाएं", cat_eld: "बुजुर्ग", cat_anim: "जानवर",
            btn_call: "अभी कॉल करें", empty: "कोई नंबर नहीं मिला।", empty_sub: "अपने खोज शब्दों को बदलने का प्रयास करें।",
            sm_home: "होम गेटवे", sm_report: "रिपोर्ट सबमिट करें", sm_cases: "सार्वजनिक फ़ीड", sm_map: "लाइव मानचित्र", sm_org: "पार्टनर डैशबोर्ड", sm_vol: "स्वयंसेवक पोर्टल", sm_imp: "प्रभाव विश्लेषिकी", sm_emg: "आपातकालीन निर्देशिका", sm_cont: "संपर्क और पूछताछ", sm_abt: "मिशन के बारे में", sm_auth: "प्रमाणीकरण", sm_adm: "एडमिन कंसोल"
        },
        hinglish: {
            lang: "Hinglish", log_out: "Log out", careers: "Careers", back: "Home par wapas", sitemap: "Platform Sitemap", sitemap_desc: "Sabhi Sahay modules ka direct navigation.",
            title: "Emergency Directory", sub: "National rescue aur support services ke liye direct numbers.",
            search_ph: "Service search karein...", filter_cat: "Need ke hisaab se filter karein:",
            cat_all: "All Numbers", cat_crit: "Critical", cat_med: "Medical", cat_wom: "Women", cat_eld: "Elderly", cat_anim: "Animal",
            btn_call: "Call Karein", empty: "Koi number nahi mila.", empty_sub: "Search terms change karke dekhein.",
            sm_home: "Home Gateway", sm_report: "Report Submit Karein", sm_cases: "Public Feed", sm_map: "Live Map", sm_org: "Partner Dashboard", sm_vol: "Volunteer Portal", sm_imp: "Impact Analytics", sm_emg: "Emergency Directory", sm_cont: "Contact aur Inquiries", sm_abt: "Mission ke baare mein", sm_auth: "Authentication", sm_adm: "Admin Console"
        },
        mr: {
            lang: "मराठी", log_out: "लॉग आउट", careers: "करिअर", back: "होम वर परत जा", sitemap: "प्लॅटफॉर्म साइटमॅप", sitemap_desc: "सर्व सहाय मॉड्यूल्ससाठी थेट नेव्हिगेशन.",
            title: "आपत्कालीन निर्देशिका", sub: "राष्ट्रीय बचाव आणि समर्थन सेवांसाठी थेट क्रमांक.",
            search_ph: "सेवा शोधा...", filter_cat: "गरजेनुसार फिल्टर करा:",
            cat_all: "सर्व क्रमांक", cat_crit: "गंभीर", cat_med: "वैद्यकीय", cat_wom: "महिला", cat_eld: "वृद्ध", cat_anim: "प्राणी",
            btn_call: "आता कॉल करा", empty: "कोणतेही क्रमांक आढळले नाहीत.", empty_sub: "तुमचे शोध शब्द बदलून पहा.",
            sm_home: "होम गेटवे", sm_report: "अहवाल सबमिट करा", sm_cases: "सार्वजनिक फीड", sm_map: "थेट नकाशा", sm_org: "भागीदार डॅशबोर्ड", sm_vol: "स्वयंसेवक पोर्टल", sm_imp: "प्रभाव विश्लेषण", sm_emg: "आपत्कालीन निर्देशिका", sm_cont: "संपर्क आणि चौकशी", sm_abt: "मिशन बद्दल", sm_auth: "प्रमाणीकरण", sm_adm: "प्रशासन कन्सोल"
        },
        gu: {
            lang: "ગુજરાતી", log_out: "લૉગ આઉટ", careers: "કારકિર્દી", back: "હોમ પર પાછા જાઓ", sitemap: "પ્લેટફોર્મ સાઇટમેપ", sitemap_desc: "તમામ સહાય મોડ્યુલો માટે સીધું નેવિગેશન.",
            title: "કટોકટી ડિરેક્ટરી", sub: "રાષ્ટ્રીય બચાવ અને આધાર સેવાઓ માટે સીધા નંબરો.",
            search_ph: "સેવા શોધો...", filter_cat: "જરૂરિયાત મુજબ ફિલ્ટર કરો:",
            cat_all: "બધા નંબરો", cat_crit: "ગંભીર", cat_med: "તબીબી", cat_wom: "મહિલા", cat_eld: "વૃદ્ધ", cat_anim: "પ્રાણી",
            btn_call: "હવે કૉલ કરો", empty: "કોઈ નંબરો મળ્યા નથી.", empty_sub: "તમારા શોધ શબ્દો બદલવાનો પ્રયાસ કરો.",
            sm_home: "હોમ ગેટવે", sm_report: "રિપોર્ટ સબમિટ કરો", sm_cases: "જાહેર ફીડ", sm_map: "જીવંત નકશો", sm_org: "ભાગીદાર ડેશબોર્ડ", sm_vol: "સ્વયંસેવક પોર્ટલ", sm_imp: "અસર એનાલિટિક્સ", sm_emg: "કટોકટી ડિરેક્ટરી", sm_cont: "સંપર્ક અને પૂછપરછ", sm_abt: "મિશન વિશે", sm_auth: "પ્રમાણીકરણ", sm_adm: "એડમિન કન્સોલ"
        },
        te: {
            lang: "తెలుగు", log_out: "లాగౌట్", careers: "కెరీర్స్", back: "హోమ్ కి తిరిగి వెళ్ళండి", sitemap: "ప్లాట్‌ఫారమ్ సైట్‌మ్యాప్", sitemap_desc: "అన్ని సహాయ్ మాడ్యూల్స్‌కు ప్రత్యక్ష నావిగేషన్.",
            title: "అత్యవసర డైరెక్టరీ", sub: "జాతీయ రక్షణ మరియు మద్దతు సేవల కోసం ప్రత్యక్ష సంఖ్యలు.",
            search_ph: "సేవ కోసం వెతకండి...", filter_cat: "అవసరాల ప్రకారం ఫిల్టర్ చేయండి:",
            cat_all: "అన్ని సంఖ్యలు", cat_crit: "క్లిష్టమైన", cat_med: "వైద్య", cat_wom: "మహిళలు", cat_eld: "వృద్ధులు", cat_anim: "జంతువు",
            btn_call: "ఇప్పుడే కాల్ చేయండి", empty: "సంఖ్యలు కనుగొనబడలేదు.", empty_sub: "మీ శోధన పదాలను మార్చడానికి ప్రయత్నించండి.",
            sm_home: "హోమ్ గేట్‌వే", sm_report: "నివేదిక సమర్పించండి", sm_cases: "పబ్లిక్ ఫీడ్", sm_map: "లైవ్ మ్యాప్", sm_org: "భాగస్వామి డాష్‌బోర్డ్", sm_vol: "వాలంటీర్ పోర్టల్", sm_imp: "ఇంపాక్ట్ అనలిటిక్స్", sm_emg: "అత్యవసర డైరెక్టరీ", sm_cont: "సంప్రదింపులు మరియు విచారణలు", sm_abt: "మిషన్ గురించి", sm_auth: "ప్రామాణీకరణ", sm_adm: "అడ్మిన్ కన్సోల్"
        },
        ta: {
            lang: "தமிழ்", log_out: "வெளியேறு", careers: "தொழில்கள்", back: "முகப்பிற்கு திரும்புக", sitemap: "தளத்தின் வரைபடம்", sitemap_desc: "அனைத்து சஹாய் தொகுதிகளுக்கும் நேரடி வழிசெலுத்தல்.",
            title: "அவசர அடைவு", sub: "தேசிய மீட்பு மற்றும் ஆதரவு சேவைகளுக்கான நேரடி எண்கள்.",
            search_ph: "சேவையை தேடுங்கள்...", filter_cat: "தேவைக்கேற்ப வடிகட்டவும்:",
            cat_all: "அனைத்து எண்கள்", cat_crit: "முக்கியமான", cat_med: "மருத்துவ", cat_wom: "பெண்கள்", cat_eld: "முதியோர்", cat_anim: "விலங்கு",
            btn_call: "இப்போது அழைக்கவும்", empty: "எண்கள் எதுவும் கிடைக்கவில்லை.", empty_sub: "உங்கள் தேடல் சொற்களை மாற்ற முயற்சிக்கவும்.",
            sm_home: "முகப்பு நுழைவாயில்", sm_report: "அறிக்கையை சமர்ப்பிக்கவும்", sm_cases: "பொது ஊட்டம்", sm_map: "நேரடி வரைபடம்", sm_org: "கூட்டாளர் டாஷ்போர்டு", sm_vol: "தன்னார்வ போர்டல்", sm_imp: "தாக்க பகுப்பாய்வு", sm_emg: "அவசர அடைவு", sm_cont: "தொடர்பு மற்றும் விசாரணைகள்", sm_abt: "பணி பற்றி", sm_auth: "அங்கீகாரம்", sm_adm: "நிர்வாக கன்சோல்"
        },
        pa: {
            lang: "ਪੰਜਾਬੀ", log_out: "ਲੌਗ ਆਉਟ", careers: "ਕਰੀਅਰ", back: "ਹੋਮ 'ਤੇ ਵਾਪਸ ਜਾਓ", sitemap: "ਪਲੇਟਫਾਰਮ ਸਾਈਟਮੈਪ", sitemap_desc: "ਸਾਰੇ ਸਹਾਏ ਮੋਡਿਊਲਾਂ ਲਈ ਸਿੱਧੀ ਨੈਵੀਗੇਸ਼ਨ।",
            title: "ਐਮਰਜੈਂਸੀ ਡਾਇਰੈਕਟਰੀ", sub: "ਰਾਸ਼ਟਰੀ ਬਚਾਅ ਅਤੇ ਸਹਾਇਤਾ ਸੇਵਾਵਾਂ ਲਈ ਸਿੱਧੇ ਨੰਬਰ।",
            search_ph: "ਸੇਵਾ ਖੋਜੋ...", filter_cat: "ਲੋੜ ਅਨੁਸਾਰ ਫਿਲਟਰ ਕਰੋ:",
            cat_all: "ਸਾਰੇ ਨੰਬਰ", cat_crit: "ਗੰਭੀਰ", cat_med: "ਮੈਡੀਕਲ", cat_wom: "ਔਰਤਾਂ", cat_eld: "ਬਜ਼ੁਰਗ", cat_anim: "ਜਾਨਵਰ",
            btn_call: "ਹੁਣ ਕਾਲ ਕਰੋ", empty: "ਕੋਈ ਨੰਬਰ ਨਹੀਂ ਮਿਲਿਆ।", empty_sub: "ਆਪਣੇ ਖੋਜ ਸ਼ਬਦਾਂ ਨੂੰ ਬਦਲਣ ਦੀ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
            sm_home: "ਹੋਮ ਗੇਟਵੇ", sm_report: "ਰਿਪੋਰਟ ਦਰਜ ਕਰੋ", sm_cases: "ਜਨਤਕ ਫੀਡ", sm_map: "ਲਾਈਵ ਨਕਸ਼ਾ", sm_org: "ਪਾਰਟਨਰ ਡੈਸ਼ਬੋਰਡ", sm_vol: "ਵਲੰਟੀਅਰ ਪੋਰਟਲ", sm_imp: "ਪ੍ਰਭਾਵ ਵਿਸ਼ਲੇਸ਼ਣ", sm_emg: "ਐਮਰਜੈਂਸੀ ਡਾਇਰੈਕਟਰੀ", sm_cont: "ਸੰਪਰਕ ਅਤੇ ਪੁੱਛਗਿੱਛ", sm_abt: "ਮਿਸ਼ਨ ਬਾਰੇ", sm_auth: "ਪ੍ਰਮਾਣਿਕਤਾ", sm_adm: "ਐਡਮਿਨ ਕੰਸੋਲ"
        },
        bho: {
            lang: "भोजपुरी", log_out: "लॉग आउट", careers: "करियर", back: "होम पर वापस जाईं", sitemap: "प्लेटफॉर्म साइटमैप", sitemap_desc: "सब सहाय मॉड्यूल पर सीधा नेविगेशन।",
            title: "आपातकालीन निर्देशिका", sub: "राष्ट्रीय बचाव आ सहायता सेवा खातिर सीधा नंबर।",
            search_ph: "सेवा खोजीं...", filter_cat: "जरूरत के हिसाब से फिल्टर करीं:",
            cat_all: "सब नंबर", cat_crit: "गंभीर", cat_med: "चिकित्सा", cat_wom: "मेहरारू", cat_eld: "बुजुर्ग", cat_anim: "जानवर",
            btn_call: "अभी कॉल करीं", empty: "कवनो नंबर ना मिलल।", empty_sub: "आपन खोज शब्द बदले के कोशिश करीं।",
            sm_home: "होम गेटवे", sm_report: "रिपोर्ट सबमिट करीं", sm_cases: "सार्वजनिक फीड", sm_map: "लाइव नक्शा", sm_org: "पार्टनर डैशबोर्ड", sm_vol: "स्वयंसेवक पोर्टल", sm_imp: "प्रभाव विश्लेषिकी", sm_emg: "आपातकालीन निर्देशिका", sm_cont: "संपर्क आ पूछताछ", sm_abt: "मिशन के बारे में", sm_auth: "प्रमाणीकरण", sm_adm: "एडमिन कंसोल"
        },
        ar: {
            lang: "العربية", log_out: "تسجيل الخروج", careers: "الوظائف", back: "العودة إلى الصفحة الرئيسية", sitemap: "خريطة الموقع", sitemap_desc: "التنقل المباشر لجميع وحدات ساهاي.",
            title: "دليل الطوارئ", sub: "أرقام مباشرة لخدمات الإنقاذ والدعم الوطنية.",
            search_ph: "ابحث عن خدمة...", filter_cat: "تصفية حسب الحاجة:",
            cat_all: "جميع الأرقام", cat_crit: "حرج", cat_med: "طبي", cat_wom: "نساء", cat_eld: "كبار السن", cat_anim: "حيوان",
            btn_call: "اتصل الان", empty: "لم يتم العثور على أرقام.", empty_sub: "حاول تغيير كلمات البحث الخاصة بك.",
            sm_home: "البوابة الرئيسية", sm_report: "إرسال تقرير", sm_cases: "الخلاصة العامة", sm_map: "خريطة حية", sm_org: "لوحة تحكم الشريك", sm_vol: "بوابة المتطوعين", sm_imp: "تحليلات التأثير", sm_emg: "دليل الطوارئ", sm_cont: "الاتصال والاستفسارات", sm_abt: "حول المهمة", sm_auth: "المصادقة", sm_adm: "وحدة تحكم الإدارة"
        },
        es: {
            lang: "Español", log_out: "Cerrar sesión", careers: "Carreras", back: "Volver a Inicio", sitemap: "Mapa del sitio", sitemap_desc: "Navegación directa a todos los módulos de Sahay.",
            title: "Directorio de Emergencia", sub: "Líneas directas a servicios nacionales de rescate y apoyo.",
            search_ph: "Buscar un servicio...", filter_cat: "Filtrar por necesidad:",
            cat_all: "Todos los Números", cat_crit: "Crítico", cat_med: "Médico", cat_wom: "Mujeres", cat_eld: "Ancianos", cat_anim: "Animal",
            btn_call: "Llamar Ahora", empty: "No se encontraron números.", empty_sub: "Intente ajustar sus términos de búsqueda.",
            sm_home: "Portal de Inicio", sm_report: "Enviar Reporte", sm_cases: "Feed Público", sm_map: "Mapa en Vivo", sm_org: "Panel de Socios", sm_vol: "Portal de Voluntarios", sm_imp: "Análisis de Impacto", sm_emg: "Directorio de Emergencia", sm_cont: "Contacto", sm_abt: "Acerca de la Misión", sm_auth: "Autenticación", sm_adm: "Consola de Administración"
        },
        fr: {
            lang: "Français", log_out: "Se déconnecter", careers: "Carrières", back: "Retour à l'accueil", sitemap: "Plan du site", sitemap_desc: "Navigation directe vers tous les modules Sahay.",
            title: "Annuaire d'Urgence", sub: "Lignes directes vers les services nationaux de sauvetage et de soutien.",
            search_ph: "Rechercher un service...", filter_cat: "Filtrer par besoin:",
            cat_all: "Tous les Numéros", cat_crit: "Critique", cat_med: "Médical", cat_wom: "Femmes", cat_eld: "Personnes âgées", cat_anim: "Animal",
            btn_call: "Appeler Maintenant", empty: "Aucun numéro trouvé.", empty_sub: "Essayez de modifier vos termes de recherche.",
            sm_home: "Portail d'Accueil", sm_report: "Soumettre un Rapport", sm_cases: "Flux Public", sm_map: "Carte en Direct", sm_org: "Tableau de Bord", sm_vol: "Portail Bénévole", sm_imp: "Analyse d'Impact", sm_emg: "Annuaire d'Urgence", sm_cont: "Contact", sm_abt: "À Propos", sm_auth: "Authentification", sm_adm: "Console d'Administration"
        },
        de: {
            lang: "Deutsch", log_out: "Abmelden", careers: "Karriere", back: "Zurück zur Startseite", sitemap: "Seitenverzeichnis", sitemap_desc: "Direkte Navigation zu allen Sahay-Modulen.",
            title: "Notfallverzeichnis", sub: "Direkte Nummern zu nationalen Rettungs- und Unterstützungsdiensten.",
            search_ph: "Dienst suchen...", filter_cat: "Nach Bedarf filtern:",
            cat_all: "Alle Nummern", cat_crit: "Kritisch", cat_med: "Medizinisch", cat_wom: "Frauen", cat_eld: "Ältere", cat_anim: "Tier",
            btn_call: "Jetzt Anrufen", empty: "Keine Nummern gefunden.", empty_sub: "Versuchen Sie, Ihre Suchbegriffe anzupassen.",
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
                    <button onClick={() => setShowLangPrompt(true)} className="flex items-center gap-2 text-[#555555] hover:text-[#111111] transition-colors outline-none px-3 py-1.5 rounded-full border border-[#E5E7EB] hover:border-[#111111]">
                        <Globe size={14} /> <span className="hidden sm:inline">{currentT.lang}</span>
                    </button>
                    {currentUser && (
                        <>
                            <button onClick={handleSignOut} className="text-[#555555] hover:text-[#111111] transition-colors outline-none hidden sm:block">
                                {currentT.log_out}
                            </button>
                            <button onClick={handleSignOut} className="p-2 rounded-full bg-[#F7F7F7] text-[#111111] hover:bg-[#E5E7EB] transition-colors outline-none block sm:hidden">
                                <LogOut size={16} />
                            </button>
                        </>
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

                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-4 text-[#DC2626]">
                        <ShieldAlert size={32} />
                    </div>
                    <h1 className="text-[2.5rem] md:text-[3.5rem] font-black leading-[1.1] tracking-tighter mb-4 text-[#111111]">
                        {currentT.title}
                    </h1>
                    <p className="text-[1.1rem] text-[#555555] font-medium max-w-[600px]">
                        {currentT.sub}
                    </p>
                </div>

                {/* Filters Section */}
                <div className="flex flex-col gap-6 mb-12">
                    <div className="relative max-w-[600px]">
                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555555]" />
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={currentT.search_ph}
                            className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#F7F7F7] border border-[#E5E7EB] text-[#111111] font-bold text-[0.95rem] outline-none focus:border-[#FF6B35] transition-colors"
                        />
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-[#111111] font-black text-[0.9rem] flex items-center gap-2 mr-2"><Filter size={16}/> {currentT.filter_cat}</span>
                        {[
                            { id: 'All', label: currentT.cat_all },
                            { id: 'Critical', label: currentT.cat_crit },
                            { id: 'Medical', label: currentT.cat_med },
                            { id: 'Women', label: currentT.cat_wom },
                            { id: 'Elderly', label: currentT.cat_eld },
                            { id: 'Animal', label: currentT.cat_anim }
                        ].map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-5 py-2.5 rounded-full font-bold text-[0.85rem] transition-colors border outline-none ${
                                    activeCategory === cat.id ? 'bg-[#111111] text-[#FFFFFF] border-[#111111]' : 'bg-[#FFFFFF] text-[#555555] border-[#E5E7EB] hover:border-[#111111] hover:text-[#111111]'
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Directory Grid */}
                {filteredDirectory.length === 0 ? (
                    <div className="rounded-3xl p-12 text-center border border-dashed border-[#D1D5DB] bg-[#F7F7F7] flex flex-col items-center justify-center max-w-[600px]">
                        <Phone size={48} className="mb-6 text-[#D1D5DB]" />
                        <h2 className="text-[1.5rem] font-black tracking-tight mb-2 text-[#111111]">{currentT.empty}</h2>
                        <p className="text-[1rem] text-[#555555]">{currentT.empty_sub}</p>
                    </div>
                ) : (
                    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDirectory.map((contact) => {
                            const IconComponent = contact.icon;
                            const isCritical = contact.category === 'Critical';

                            return (
                                <motion.div 
                                    variants={itemVariants} 
                                    key={contact.id} 
                                    className="rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-6 shadow-sm flex flex-col justify-between hover:border-[#111111] transition-colors"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${contact.bg} ${contact.color}`}>
                                                <IconComponent size={24} />
                                            </div>
                                            <span className="px-3 py-1 bg-[#F7F7F7] text-[#555555] text-[0.7rem] font-black tracking-wider uppercase rounded-full border border-[#E5E7EB]">
                                                {contact.category}
                                            </span>
                                        </div>
                                        
                                        <h3 className="text-[1.25rem] font-black text-[#111111] mb-2">{contact.name}</h3>
                                        <p className="text-[0.9rem] font-medium text-[#555555] mb-8 leading-relaxed">
                                            {contact.desc}
                                        </p>
                                    </div>

                                    <a 
                                        href={`tel:${contact.phone}`}
                                        className={`w-full py-4 rounded-xl font-black text-[1rem] flex items-center justify-center gap-2 transition-colors outline-none border ${
                                            isCritical ? 'bg-[#DC2626] text-[#FFFFFF] border-[#DC2626] hover:bg-[#B91C1C]' : 'bg-[#FF6B35] text-[#FFFFFF] border-[#FF6B35] hover:bg-[#E85D2A]'
                                        }`}
                                    >
                                        <Phone size={18} /> {currentT.btn_call} {contact.phone}
                                    </a>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </main>

            {/* FOOTER ALIGNMENT */}
            <footer className="w-full mx-auto flex flex-col md:flex-row items-center justify-between gap-8 px-8 md:px-16 py-12 border-t border-[#E5E7EB] bg-[#FFFFFF] relative z-10 animate-fade">
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
                            <img src={theme === 'light' ? '/aat2.png' : '/aat.png'} alt="AnyAstro" className="h-4 w-auto object-contain" onError={(e) => { e.target.style.display = 'none'; e.target.insertAdjacentHTML('afterend', '<span class="underline text-[#111111]">AnyAstro</span>'); }} />
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