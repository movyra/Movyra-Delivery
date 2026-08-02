import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
    ArrowLeft, 
    ShieldCheck, 
    Clock, 
    CheckCircle, 
    AlertTriangle, 
    Users, 
    Layers,
    FileText,
    Sun,
    Moon,
    Home,
    LogOut,
    X,
    Globe,
    ArrowUp,
    Phone,
    User
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import { useCivicStore } from '../../store/useCivicStore';

export default function WardAdmin() {
    const navigate = useNavigate();
    
    // 1. STATE MANAGEMENT
    const theme = useCivicStore((state) => state.theme);
    const toggleTheme = useCivicStore((state) => state.toggleTheme);
    const terminateSession = useCivicStore((state) => state.terminateSession);
    
    const [lang, setLang] = useState('en');
    const [showLangPrompt, setShowLangPrompt] = useState(false);
    const [showProductsPrompt, setShowProductsPrompt] = useState(false);
    const [showSitemap, setShowSitemap] = useState(false);

    const [incidents, setIncidents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [statusFilter, setStatusFilter] = useState('Active');

    const localCity = "Mumbai";

    // 2. STRICT AUTHENTICATION VERIFICATION
    useEffect(() => {
        const sysLang = navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'hinglish', 'mr', 'gu', 'te', 'ta', 'pa', 'bho', 'ar', 'es', 'fr', 'de'];
        if (supported.includes(sysLang)) setLang(sysLang);

        const authUnsubscribe = onAuthStateChanged(auth, (user) => {
            if (user && user.email === 'testcodecfg@gmail.com') {
                initializeDataStream();
            } else {
                alert("Unauthorized Access. This portal is restricted to primary administrators.");
                navigate('/civic');
            }
        });

        return () => authUnsubscribe();
    }, [navigate]);

    const initializeDataStream = () => {
        const complaintsRef = collection(db, 'civic_complaints');
        const adminQuery = query(complaintsRef, orderBy('createdAt', 'desc'));

        const dataUnsubscribe = onSnapshot(adminQuery, (snapshot) => {
            const records = snapshot.docs.map(document => ({
                id: document.id,
                ...document.data()
            }));
            setIncidents(records);
            setIsLoading(false);
        }, (error) => {
            console.error("Failed to establish real-time administrative stream:", error);
            setIsLoading(false);
        });

        return dataUnsubscribe; // This will clean up the snapshot if the component ever unmounts
    };

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

    // 3. 13-LANGUAGE DICTIONARY (Admin Context)
    const t = {
        en: { lang: "English", log_out: "Log out", careers: "Careers", products: "Products", help: "Help Center", back: "Back", console: "Administrative Console", title: "Operations Control", sub: "Secure command center for managing public infrastructure reports and operational field assignments.", flt_active: "Active", flt_comp: "Completed", flt_dup: "Duplicate", th_id: "Tracking ID / Date", th_detail: "Deficiency Details", th_pri: "Priority / SLA", th_stat: "Operational Status", th_act: "Administrative Actions", sync: "Synchronizing administrative records...", no_rec: "No records found matching the current operational filter.", act_assign: "Assign Field Unit", act_init: "Initiate Operations", act_conc: "Conclude Operations", act_merge: "Merge / Mark Duplicate", supp: "Support", ev_att: "Evidence Attached", sla_breach: "SLA Breached", sla_appr: "Approaching Deadline", sla_comp: "Compliant", rep_un: "Anonymous", sitemap: "Sitemap", sitemap_desc: "Direct navigation to all civic pages..", sm_home: "Public Portal", sm_report: "File a Report", sm_map: "Live Transparency Map", sm_admin: "Admin Console" },
        hi: { lang: "हिन्दी", log_out: "लॉग आउट", careers: "करियर", products: "उत्पाद", help: "सहायता केंद्र", back: "डैशबोर्ड पर लौटें", console: "प्रशासनिक कंसोल", title: "ऑपरेशंस कंट्रोल", sub: "सार्वजनिक बुनियादी ढांचे की रिपोर्ट और परिचालन क्षेत्र असाइनमेंट के प्रबंधन के लिए सुरक्षित कमांड सेंटर।", flt_active: "सक्रिय", flt_comp: "पूरा हुआ", flt_dup: "डुप्लिकेट", th_id: "ट्रैकिंग आईडी / दिनांक", th_detail: "कमी का विवरण", th_pri: "प्राथमिकता / SLA", th_stat: "परिचालन स्थिति", th_act: "प्रशासनिक कार्य", sync: "प्रशासनिक रिकॉर्ड सिंक्रनाइज़ किए जा रहे हैं...", no_rec: "वर्तमान फ़िल्टर से मेल खाने वाला कोई रिकॉर्ड नहीं मिला।", act_assign: "फील्ड यूनिट असाइन करें", act_init: "संचालन आरंभ करें", act_conc: "संचालन संपन्न करें", act_merge: "मर्ज / डुप्लिकेट चिह्नित करें", supp: "समर्थन", ev_att: "साक्ष्य संलग्न", sla_breach: "SLA का उल्लंघन", sla_appr: "समय सीमा के करीब", sla_comp: "अनुपालन", rep_un: "गुमनाम", sitemap: "साइटमैप", sitemap_desc: "सभी सिविक मॉड्यूल पर सीधा नेविगेशन।", sm_home: "सार्वजनिक पोर्टल", sm_report: "रिपोर्ट दर्ज करें", sm_map: "लाइव पारदर्शिता मानचित्र", sm_admin: "एडमिन कंसोल" },
        hinglish: { lang: "Hinglish", log_out: "Log out", careers: "Careers", products: "Products", help: "Help Center", back: "Dashboard par wapas jayein", console: "Administrative Console", title: "Operations Control", sub: "Public infrastructure reports aur operational assignments manage karne ke liye secure command center.", flt_active: "Active", flt_comp: "Completed", flt_dup: "Duplicate", th_id: "Tracking ID / Date", th_detail: "Deficiency Details", th_pri: "Priority / SLA", th_stat: "Operational Status", th_act: "Administrative Actions", sync: "Administrative records synchronize ho rahe hain...", no_rec: "Current filter se match karta koi record nahi mila.", act_assign: "Field Unit Assign Karein", act_init: "Operations Initiate Karein", act_conc: "Operations Conclude Karein", act_merge: "Merge / Duplicate Mark Karein", supp: "Support", ev_att: "Evidence Attached", sla_breach: "SLA Breached", sla_appr: "Approaching Deadline", sla_comp: "Compliant", rep_un: "Anonymous", sitemap: "Sitemap", sitemap_desc: "Sabhi Civic modules ka direct navigation.", sm_home: "Public Portal", sm_report: "Report Darj Karein", sm_map: "Live Transparency Map", sm_admin: "Admin Console" },
        mr: { lang: "मराठी", log_out: "लॉग आउट", careers: "करिअर", products: "उत्पादने", help: "मदत केंद्र", back: "डॅशबोर्डवर परत जा", console: "प्रशासकीय कन्सोल", title: "ऑपरेशन्स कंट्रोल", sub: "सार्वजनिक पायाभूत सुविधा अहवाल आणि ऑपरेशनल फील्ड असाइनमेंट व्यवस्थापित करण्यासाठी सुरक्षित कमांड सेंटर.", flt_active: "सक्रिय", flt_comp: "पूर्ण", flt_dup: "डुप्लिकेट", th_id: "ट्रॅकिंग आयडी / तारीख", th_detail: "त्रुटी तपशील", th_pri: "प्राधान्य / SLA", th_stat: "ऑपरेशनल स्थिती", th_act: "प्रशासकीय कृती", sync: "प्रशासकीय रेकॉर्ड सिंक्रोनाइझ करत आहे...", no_rec: "सध्याच्या फिल्टरशी जुळणारे कोणतेही रेकॉर्ड आढळले नाहीत.", act_assign: "फील्ड युनिट असाइन करा", act_init: "ऑपरेशन्स सुरू करा", act_conc: "ऑपरेशन्स पूर्ण करा", act_merge: "मर्ज / डुप्लिकेट चिन्हांकित करा", supp: "समर्थन", ev_att: "पुरावा जोडला", sla_breach: "SLA चे उल्लंघन", sla_appr: "अंतिम मुदतीच्या जवळ", sla_comp: "अनुपालन", rep_un: "निनावी", sitemap: "साइटमॅप", sitemap_desc: "सर्व सिविक मॉड्यूल्ससाठी थेट नेव्हिगेशन.", sm_home: "सार्वजनिक पोर्टल", sm_report: "अहवाल दाखल करा", sm_map: "थेट पारदर्शकता नकाशा", sm_admin: "प्रशासन कन्सोल" },
        gu: { lang: "ગુજરાતી", log_out: "લૉગ આઉટ", careers: "કારકિર્દી", products: "ઉત્પાદનો", help: "મદદ કેન્દ્ર", back: "ડેશબોર્ડ પર પાછા ફરો", console: "વહીવટી કન્સોલ", title: "ઓપરેશન્સ કંટ્રોલ", sub: "જાહેર ઈન્ફ્રાસ્ટ્રક્ચર રિપોર્ટ્સ અને ઓપરેશનલ ફિલ્ડ અસાઇનમેન્ટ્સનું સંચાલન કરવા માટે સુરક્ષિત કમાન્ડ સેન્ટર.", flt_active: "સક્રિય", flt_comp: "પૂર્ણ", flt_dup: "ડુપ્લિકેટ", th_id: "ટ્રેકિંગ ID / તારીખ", th_detail: "ખામીની વિગતો", th_pri: "પ્રાધાન્ય / SLA", th_stat: "ઓપરેશનલ સ્થિતિ", th_act: "વહીવટી પગલાં", sync: "વહીવટી રેકોર્ડ સિંક્રનાઇઝ થઈ રહ્યા છે...", no_rec: "વર્તમાન ફિલ્ટર સાથે મેળ ખાતો કોઈ રેકોર્ડ મળ્યો નથી.", act_assign: "ફિલ્ડ યુનિટ સોંપો", act_init: "ઓપરેશન્સ શરૂ કરો", act_conc: "ઓપરેશન્સ પૂર્ણ કરો", act_merge: "મર્જ / ડુપ્લિકેટ ચિહ્નિત કરો", supp: "આધાર", ev_att: "પુરાવા જોડાયેલ છે", sla_breach: "SLA નો ભંગ", sla_appr: "અંતિમ મુદત નજીક", sla_comp: "સુસંગત", rep_un: "અનામી", sitemap: "સાઇટમેપ", sitemap_desc: "તમામ સિવિક મોડ્યુલો માટે સીધું નેવિગેશન.", sm_home: "જાહેર પોર્ટલ", sm_report: "રિપોર્ટ ફાઇલ કરો", sm_map: "જીવંત પારદર્શિતા નકશો", sm_admin: "એડમિન કન્સોલ" },
        te: { lang: "తెలుగు", log_out: "లాగౌట్", careers: "కెరీర్స్", products: "ఉత్పత్తులు", help: "సహాయ కేంద్రం", back: "డ్యాష్‌బోర్డ్‌కు తిరిగి వెళ్లండి", console: "అడ్మినిస్ట్రేటివ్ కన్సోల్", title: "ఆపరేషన్స్ కంట్రోల్", sub: "పబ్లిక్ ఇన్‌ఫ్రాస్ట్రక్చర్ నివేదికలను మరియు కార్యాచరణ ఫీల్డ్ అసైన్‌మెంట్‌లను నిర్వహించడానికి సురక్షిత కమాండ్ సెంటర్.", flt_active: "క్రియాశీల", flt_comp: "పూర్తయింది", flt_dup: "నకిలీ", th_id: "ట్రాకింగ్ ID / తేదీ", th_detail: "లోపం వివరాలు", th_pri: "ప్రాధాన్యత / SLA", th_stat: "కార్యాచరణ స్థితి", th_act: "పరిపాలనా చర్యలు", sync: "అడ్మినిస్ట్రేటివ్ రికార్డులను సమకాలీకరిస్తోంది...", no_rec: "ప్రస్తుత ఫిల్టర్‌తో సరిపోలే రికార్డులు ఏవీ కనుగొనబడలేదు.", act_assign: "ఫీల్డ్ యూనిట్‌ను కేటాయించండి", act_init: "కార్యకలాపాలను ప్రారంభించండి", act_conc: "కార్యకలాపాలను ముగించండి", act_merge: "విలీనం / నకిలీగా గుర్తించండి", supp: "మద్దతు", ev_att: "సాక్ష్యం జోడించబడింది", sla_breach: "SLA ఉల్లంఘించబడింది", sla_appr: "గడువు సమీపిస్తోంది", sla_comp: "కంప్లైంట్", rep_un: "అనామక", sitemap: "సైట్‌మ్యాప్", sitemap_desc: "అన్ని సివిక్ మాడ్యూల్స్‌కు ప్రత్యక్ష నావిగేషన్.", sm_home: "పబ్లిక్ పోర్టల్", sm_report: "నివేదిక దాఖలు చేయండి", sm_map: "లైవ్ పారదర్శకత మ్యాప్", sm_admin: "అడ్మిన్ కన్సోల్" },
        ta: { lang: "தமிழ்", log_out: "வெளியேறு", careers: "தொழில்கள்", products: "தயாரிப்புகள்", help: "உதவி மையம்", back: "டாஷ்போர்டுக்குத் திரும்பு", console: "நிர்வாக கன்சோல்", title: "செயல்பாட்டுக் கட்டுப்பாடு", sub: "பொது உள்கட்டமைப்பு அறிக்கைகள் மற்றும் செயல்பாட்டு கள பணிகளை நிர்வகிப்பதற்கான பாதுகாப்பான கட்டளை மையம்.", flt_active: "செயலில்", flt_comp: "முடிந்தது", flt_dup: "நகல்", th_id: "கண்காணிப்பு ஐடி / தேதி", th_detail: "குறைபாடு விவரங்கள்", th_pri: "முன்னுரிமை / SLA", th_stat: "செயல்பாட்டு நிலை", th_act: "நிர்வாக நடவடிக்கைகள்", sync: "நிர்வாகப் பதிவுகளை ஒத்திசைக்கிறது...", no_rec: "தற்போதைய வடிப்பானுடன் பொருந்தும் பதிவுகள் எதுவும் கிடைக்கவில்லை.", act_assign: "களப் பிரிவை ஒதுக்கு", act_init: "செயல்பாடுகளைத் தொடங்கு", act_conc: "செயல்பாடுகளை முடிக்கவும்", act_merge: "ஒன்றிணை / நகல் எனக் குறிக்கவும்", supp: "ஆதரவு", ev_att: "சான்று இணைக்கப்பட்டுள்ளது", sla_breach: "SLA மீறப்பட்டது", sla_appr: "கெடு நெருங்குகிறது", sla_comp: "இணக்கமானது", rep_un: "அநாமதேய", sitemap: "தளத்தின் வரைபடம்", sitemap_desc: "அனைத்து சிவிக் தொகுதிகளுக்கும் நேரடி வழிசெலுத்தல்.", sm_home: "பொது போர்டல்", sm_report: "அறிக்கையை தாக்கல் செய்", sm_map: "நேரடி வெளிப்படைத்தன்மை வரைபடம்", sm_admin: "நிர்வாக கன்சோல்" },
        pa: { lang: "ਪੰਜਾਬੀ", log_out: "ਲੌਗ ਆਉਟ", careers: "ਕਰੀਅਰ", products: "ਉਤਪਾਦ", help: "ਸਹਾਇਤਾ ਕੇਂਦਰ", back: "ਡੈਸ਼ਬੋਰਡ 'ਤੇ ਵਾਪਸ ਜਾਓ", console: "ਪ੍ਰਸ਼ਾਸਕੀ ਕੰਸੋਲ", title: "ਓਪਰੇਸ਼ਨ ਕੰਟਰੋਲ", sub: "ਜਨਤਕ ਬੁਨਿਆਦੀ ਢਾਂਚੇ ਦੀਆਂ ਰਿਪੋਰਟਾਂ ਅਤੇ ਸੰਚਾਲਨ ਖੇਤਰ ਦੀਆਂ ਅਸਾਈਨਮੈਂਟਾਂ ਦੇ ਪ੍ਰਬੰਧਨ ਲਈ ਸੁਰੱਖਿਅਤ ਕਮਾਂਡ ਸੈਂਟਰ।", flt_active: "ਸਰਗਰਮ", flt_comp: "ਮੁਕੰਮਲ", flt_dup: "ਡੁਪਲੀਕੇਟ", th_id: "ਟਰੈਕਿੰਗ ਆਈਡੀ / ਮਿਤੀ", th_detail: "ਕਮੀ ਦੇ ਵੇਰਵੇ", th_pri: "ਤਰਜੀਹ / SLA", th_stat: "ਕਾਰਜਸ਼ੀਲ ਸਥਿਤੀ", th_act: "ਪ੍ਰਬੰਧਕੀ ਕਾਰਵਾਈਆਂ", sync: "ਪ੍ਰਬੰਧਕੀ ਰਿਕਾਰਡਾਂ ਨੂੰ ਸਿੰਕ੍ਰੋਨਾਈਜ਼ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...", no_rec: "ਮੌਜੂਦਾ ਫਿਲਟਰ ਨਾਲ ਮੇਲ ਖਾਂਦਾ ਕੋਈ ਰਿਕਾਰਡ ਨਹੀਂ ਮਿਲਿਆ।", act_assign: "ਫੀਲਡ ਯੂਨਿਟ ਨਿਰਧਾਰਤ ਕਰੋ", act_init: "ਸੰਚਾਲਨ ਸ਼ੁਰੂ ਕਰੋ", act_conc: "ਸੰਚਾਲਨ ਸਮਾਪਤ ਕਰੋ", act_merge: "ਮਿਲਾਓ / ਡੁਪਲੀਕੇਟ ਮਾਰਕ ਕਰੋ", supp: "ਸਮਰਥਨ", ev_att: "ਸਬੂਤ ਨੱਥੀ ਹੈ", sla_breach: "SLA ਦੀ ਉਲੰਘਣਾ", sla_appr: "ਆਖਰੀ ਮਿਤੀ ਨੇੜੇ ਹੈ", sla_comp: "ਪਾਲਣਾ", rep_un: "ਗੁਮਨਾਮ", sitemap: "ਸਾਈਟਮੈਪ", sitemap_desc: "ਸਾਰੇ ਸਿਵਿਕ ਮੋਡਿਊਲਾਂ ਲਈ ਸਿੱਧੀ ਨੈਵੀਗੇਸ਼ਨ।", sm_home: "ਜਨਤਕ ਪੋਰਟਲ", sm_report: "ਰਿਪੋਰਟ ਦਰਜ ਕਰੋ", sm_map: "ਲਾਈਵ ਪਾਰਦਰਸ਼ਤਾ ਨਕਸ਼ਾ", sm_admin: "ਐਡਮਿਨ ਕੰਸੋਲ" },
        bho: { lang: "भोजपुरी", log_out: "लॉग आउट", careers: "करियर", products: "उत्पाद", help: "मदद केंद्र", back: "डैशबोर्ड पर वापस जाईं", console: "प्रशासनिक कंसोल", title: "ऑपरेशंस कंट्रोल", sub: "सार्वजनिक बुनियादी ढांचा के रिपोर्ट आ परिचालन क्षेत्र असाइनमेंट के प्रबंधन खातिर सुरक्षित कमांड सेंटर।", flt_active: "सक्रिय", flt_comp: "पूरा भइल", flt_dup: "डुप्लिकेट", th_id: "ट्रैकिंग आईडी / तारीख", th_detail: "कमी के विवरण", th_pri: "प्राथमिकता / SLA", th_stat: "परिचालन स्थिति", th_act: "प्रशासनिक काम", sync: "प्रशासनिक रिकॉर्ड सिंक्रनाइज़ कइल जा रहल बा...", no_rec: "वर्तमान फिल्टर से मेल खाए वाला कवनो रिकॉर्ड ना मिलल।", act_assign: "फील्ड यूनिट असाइन करीं", act_init: "संचालन शुरू करीं", act_conc: "संचालन संपन्न करीं", act_merge: "मर्ज / डुप्लिकेट चिह्नित करीं", supp: "समर्थन", ev_att: "साक्ष्य संलग्न", sla_breach: "SLA के उल्लंघन", sla_appr: "समय सीमा के करीब", sla_comp: "अनुपालन", rep_un: "गुमनाम", sitemap: "साइटमैप", sitemap_desc: "सब सिविक मॉड्यूल पर सीधा नेविगेशन।", sm_home: "सार्वजनिक पोर्टल", sm_report: "रिपोर्ट सबमिट करीं", sm_map: "लाइव पारदर्शिता नक्शा", sm_admin: "एडमिन कंसोल" },
        ar: { lang: "العربية", log_out: "تسجيل الخروج", careers: "الوظائف", products: "المنتجات", help: "مركز المساعدة", back: "العودة إلى لوحة القيادة", console: "وحدة التحكم الإدارية", title: "مراقبة العمليات", sub: "مركز قيادة آمن لإدارة تقارير البنية التحتية العامة والمهام الميدانية التشغيلية.", flt_active: "نشط", flt_comp: "مكتمل", flt_dup: "مكرر", th_id: "معرف التتبع / التاريخ", th_detail: "تفاصيل النقص", th_pri: "الأولوية / SLA", th_stat: "الحالة التشغيلية", th_act: "الإجراءات الإدارية", sync: "مزامنة السجلات الإدارية...", no_rec: "لم يتم العثور على سجلات تطابق المرشح الحالي.", act_assign: "تعيين وحدة ميدانية", act_init: "بدء العمليات", act_conc: "إنهاء العمليات", act_merge: "دمج / تعليم كمكرر", supp: "دعم", ev_att: "تم إرفاق الأدلة", sla_breach: "تم اختراق SLA", sla_appr: "اقتراب الموعد النهائي", sla_comp: "متوافق", rep_un: "مجهول", sitemap: "خريطة الموقع", sitemap_desc: "التنقل المباشر لجميع وحدات المدنية.", sm_home: "البوابة العامة", sm_report: "تقديم تقرير", sm_map: "خريطة الشفافية المباشرة", sm_admin: "وحدة تحكم الإدارة" },
        es: { lang: "Español", log_out: "Cerrar sesión", careers: "Carreras", products: "Productos", help: "Centro de ayuda", back: "Volver al Tablero", console: "Consola Administrativa", title: "Control de Operaciones", sub: "Centro de comando seguro para gestionar reportes de infraestructura pública y asignaciones de campo.", flt_active: "Activo", flt_comp: "Completado", flt_dup: "Duplicado", th_id: "ID de Rastreo / Fecha", th_detail: "Detalles de Deficiencia", th_pri: "Prioridad / SLA", th_stat: "Estado Operativo", th_act: "Acciones Administrativas", sync: "Sincronizando registros administrativos...", no_rec: "No se encontraron registros que coincidan con el filtro actual.", act_assign: "Asignar Unidad de Campo", act_init: "Iniciar Operaciones", act_conc: "Concluir Operaciones", act_merge: "Fusionar / Marcar Duplicado", supp: "Apoyo", ev_att: "Evidencia Adjunta", sla_breach: "SLA Incumplido", sla_appr: "Fecha Límite Próxima", sla_comp: "Cumpliendo", rep_un: "Anónimo", sitemap: "Mapa del sitio", sitemap_desc: "Navegación directa a todos los módulos Cívicos.", sm_home: "Portal Público", sm_report: "Presentar un Reporte", sm_map: "Mapa de Transparencia", sm_admin: "Consola de Administración" },
        fr: { lang: "Français", log_out: "Se déconnecter", careers: "Carrières", products: "Produits", help: "Centre d'aide", back: "Retour au Tableau de bord", console: "Console Administrative", title: "Contrôle des Opérations", sub: "Centre de commande sécurisé pour gérer les rapports d'infrastructure publique et les affectations sur le terrain.", flt_active: "Actif", flt_comp: "Terminé", flt_dup: "Doublon", th_id: "ID de Suivi / Date", th_detail: "Détails de la Lacune", th_pri: "Priorité / SLA", th_stat: "Statut Opérationnel", th_act: "Actions Administratives", sync: "Synchronisation des registres administratifs...", no_rec: "Aucun registre trouvé correspondant au filtre actuel.", act_assign: "Assigner une Unité de Terrain", act_init: "Initier les Opérations", act_conc: "Conclure les Opérations", act_merge: "Fusionner / Marquer comme Doublon", supp: "Soutien", ev_att: "Preuve Jointe", sla_breach: "SLA Non Respecté", sla_appr: "Date Limite Approchante", sla_comp: "Conforme", rep_un: "Anonyme", sitemap: "Plan du site", sitemap_desc: "Navigation directe vers tous les modules Civiques.", sm_home: "Portail Public", sm_report: "Soumettre un Rapport", sm_map: "Carte de Transparence", sm_admin: "Console d'Administration" },
        de: { lang: "Deutsch", log_out: "Abmelden", careers: "Karriere", products: "Produkte", help: "Hilfezentrum", back: "Zurück zum Dashboard", console: "Verwaltungskonsole", title: "Operationskontrolle", sub: "Sichere Kommandozentrale zur Verwaltung öffentlicher Infrastrukturberichte und Feldeinsätze.", flt_active: "Aktiv", flt_comp: "Abgeschlossen", flt_dup: "Duplikat", th_id: "Tracking-ID / Datum", th_detail: "Mängeldetails", th_pri: "Priorität / SLA", th_stat: "Operativer Status", th_act: "Administrative Maßnahmen", sync: "Verwaltungsdaten werden synchronisiert...", no_rec: "Keine Datensätze gefunden, die dem aktuellen Filter entsprechen.", act_assign: "Feldeinheit Zuweisen", act_init: "Operationen Einleiten", act_conc: "Operationen Abschließen", act_merge: "Zusammenführen / Als Duplikat Markieren", supp: "Unterstützung", ev_att: "Beweise Angehängt", sla_breach: "SLA Verletzt", sla_appr: "Frist Rückt Näher", sla_comp: "Konform", rep_un: "Anonym", sitemap: "Seitenverzeichnis", sitemap_desc: "Direkte Navigation zu allen Civic-Modulen.", sm_home: "Öffentliches Portal", sm_report: "Meldung Einreichen", sm_map: "Live-Transparenzkarte", sm_admin: "Admin-Konsole" }
    };

    const currentT = t[lang] || t['en'];
    const languageOptions = [
        { code: 'en', label: 'English' }, { code: 'hi', label: 'हिन्दी' }, { code: 'hinglish', label: 'Hinglish' },
        { code: 'mr', label: 'मराठी' }, { code: 'gu', label: 'ગુજરાતી' }, { code: 'te', label: 'తెలుగు' },
        { code: 'ta', label: 'தமிழ்' }, { code: 'pa', label: 'ਪੰਜਾਬੀ' }, { code: 'bho', label: 'भोजपुरी' },
        { code: 'ar', label: 'العربية' }, { code: 'es', label: 'Español' }, { code: 'fr', label: 'Français' },
        { code: 'de', label: 'Deutsch' }
    ];

    const modifyIncidentStatus = async (incidentId, newStatus) => {
        setProcessingId(incidentId);
        try {
            const incidentRef = doc(db, 'civic_complaints', incidentId);
            await updateDoc(incidentRef, {
                status: newStatus,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Status modification failed:", error);
            alert("Authorization failed or network transmission error occurred.");
        } finally {
            setProcessingId(null);
        }
    };

    const determineSLAStatus = (createdAt, status) => {
        if (!createdAt || status === 'Completed' || status === 'Duplicate') return { label: currentT.sla_comp, color: theme === 'light' ? 'text-[#00aa55]' : 'text-[#00ff88]' };
        
        const submissionDate = createdAt.toDate();
        const currentDate = new Date();
        const hoursElapsed = (currentDate - submissionDate) / (1000 * 60 * 60);

        if (hoursElapsed > 72) return { label: currentT.sla_breach, color: theme === 'light' ? 'text-[#ff4444]' : 'text-[#ff4444]' };
        if (hoursElapsed > 48) return { label: currentT.sla_appr, color: theme === 'light' ? 'text-[#cc8800]' : 'text-[#ffaa00]' };
        return { label: currentT.sla_comp, color: theme === 'light' ? 'text-[#00aa55]' : 'text-[#00ff88]' };
    };

    const getFilteredIncidents = () => {
        if (statusFilter === 'Active') {
            return incidents.filter(i => ['Submitted', 'Reported', 'Assigned', 'In Progress'].includes(i.status));
        }
        if (statusFilter === 'Completed') {
            return incidents.filter(i => i.status === 'Completed');
        }
        if (statusFilter === 'Duplicate') {
            return incidents.filter(i => i.status === 'Duplicate');
        }
        return incidents;
    };

    const filteredRecords = getFilteredIncidents();

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };

    return (
        <div className={`min-h-screen font-sans overflow-x-hidden pt-24 pb-12 transition-colors duration-300 ${
            theme === 'light' ? 'bg-[#f5f5f5] text-[#111111] selection:bg-black selection:text-white' : 'bg-[#050505] text-white selection:bg-white selection:text-black'
        }`}>
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } } .animate-fade { animation: fadeIn 0.8s ease-out forwards; } html { scroll-behavior: smooth; }`}</style>
            
            {/* TOP HEADER */}
            <header className={`fixed top-0 left-0 right-0 w-full flex items-center justify-between px-6 md:px-12 py-6 animate-fade z-50 transition-colors border-b ${
                theme === 'light' ? 'bg-[#f5f5f5]/90 border-[#e0e0e0] backdrop-blur-md' : 'bg-[#050505]/90 border-[#111111] backdrop-blur-md'
            }`}>
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/civic')}>
                    <img src={theme === 'light' ? '/logo-3.png' : '/logo.png'} alt="Movyra" className="h-8 w-auto" onError={(e) => e.target.style.display = 'none'} />
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
                        className={`p-2.5 rounded-full flex items-center justify-center transition-colors outline-none border ${theme === 'light' ? 'bg-white border-[#cccccc] text-black hover:border-black' : 'bg-[#111111] border-[#333333] text-white hover:border-white'}`}
                        aria-label="Home"
                    >
                        <Home size={18} />
                    </button>
                </div>
            </header>

            {/* LANGUAGE SELECTOR MODAL */}
            <AnimatePresence>
                {showLangPrompt && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`fixed inset-0 z-[9999] backdrop-blur-md flex items-center justify-center p-6 ${theme === 'light' ? 'bg-white/90' : 'bg-black/90'}`}>
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className={`w-full max-w-[400px] rounded-3xl p-8 flex flex-col shadow-2xl relative max-h-[80vh] overflow-y-auto border ${theme === 'light' ? 'bg-white border-[#e0e0e0]' : 'bg-[#0a0a0a] border-[#222222]'}`}>
                            <button onClick={() => setShowLangPrompt(false)} className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center transition-colors ${theme === 'light' ? 'text-[#888888] hover:text-black' : 'text-[#888888] hover:text-white'}`}>
                                <X size={18} />
                            </button>
                            
                            <h2 className={`text-[1.4rem] font-black tracking-tight mb-6 text-center ${theme === 'light' ? 'text-black' : 'text-white'}`}>Select Language</h2>
                            
                            <div className="flex flex-col gap-2">
                                {languageOptions.map((option) => (
                                    <button 
                                        key={option.code}
                                        onClick={() => { setLang(option.code); setShowLangPrompt(false); }}
                                        className={`w-full p-4 rounded-xl flex items-center justify-between group transition-colors border ${theme === 'light' ? (lang === option.code ? 'bg-[#f0f0f0] border-black' : 'bg-white border-[#e0e0e0] hover:border-black') : (lang === option.code ? 'bg-[#222222] border-white' : 'bg-[#0a0a0a] border-[#333333] hover:border-white')}`}
                                    >
                                        <span className={`font-bold text-[1rem] ${theme === 'light' ? (lang === option.code ? 'text-black' : 'text-[#666666] group-hover:text-black') : (lang === option.code ? 'text-white' : 'text-[#888888] group-hover:text-white')}`}>{option.label}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SITEMAP MODAL */}
            <AnimatePresence>
                {showSitemap && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className={`fixed inset-0 z-[9999] backdrop-blur-md flex items-center justify-center p-6 ${theme === 'light' ? 'bg-white/90' : 'bg-black/90'}`}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className={`w-full max-w-[600px] rounded-3xl p-8 flex flex-col shadow-2xl relative max-h-[80vh] overflow-y-auto border ${
                                theme === 'light' ? 'bg-white border-[#e0e0e0]' : 'bg-[#0a0a0a] border-[#222222]'
                            }`}
                        >
                            <button onClick={() => setShowSitemap(false)} className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center transition-colors outline-none ${theme === 'light' ? 'text-[#888888] hover:text-black' : 'text-[#888888] hover:text-white'}`}>
                                <X size={18} />
                            </button>
                            <h2 className={`text-[1.8rem] font-black tracking-tight mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>{currentT.sitemap}</h2>
                            <p className={`font-medium mb-6 ${theme === 'light' ? 'text-[#555555]' : 'text-[#888888]'}`}>{currentT.sitemap_desc}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { path: '/civic', name: currentT.sm_home },
                                    { path: '/civic/report', name: currentT.sm_report },
                                    { path: '/civic/heatmap', name: currentT.sm_map },
                                    { path: '/civic/admin', name: currentT.sm_admin }
                                ].map(link => (
                                    <Link 
                                        key={link.path} 
                                        to={link.path}
                                        onClick={() => setShowSitemap(false)}
                                        className={`p-4 border rounded-xl font-bold transition-colors flex items-center justify-between group outline-none ${
                                            theme === 'light' ? 'bg-[#f5f5f5] border-[#cccccc] text-black hover:border-black' : 'bg-[#111111] border-[#333333] text-white hover:border-white'
                                        }`}
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
                            <button onClick={() => setShowProductsPrompt(false)} className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center transition-colors outline-none ${theme === 'light' ? 'text-[#888888] hover:text-black' : 'text-[#888888] hover:text-white'}`}>
                                <X size={18} />
                            </button>

                            <h2 className={`text-[1.5rem] font-black tracking-tight mb-2 text-center mt-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>Also from us</h2>
                            <p className={`text-[0.9rem] text-center mb-8 ${theme === 'light' ? 'text-[#555555]' : 'text-[#888888]'}`}>Discover our connected platforms.</p>

                            <Link to="/sahay/" className={`group flex flex-col items-center gap-4 p-6 rounded-2xl transition-colors text-center w-full outline-none border ${
                                theme === 'light' ? 'bg-[#f5f5f5] border-[#cccccc] hover:border-black' : 'bg-[#111111] border-[#333333] hover:border-white'
                            }`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <img src={theme === 'light' ? '/logo-4.png' : '/logo.png'} alt="Movyra" className="h-6 w-auto" onError={(e) => e.target.style.display = 'none'} />
                                    <span className={`font-black text-[1.2rem] tracking-tighter ml-[-5px] ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                                        ovyra <span className={`font-medium text-[1rem] ml-1 ${theme === 'light' ? 'text-[#555555]' : 'text-[#888888]'}`}>Sahay</span>
                                    </span>
                                </div>
                                <div>
                                    <p className={`text-[0.85rem] leading-relaxed transition-colors ${theme === 'light' ? 'text-[#555555] group-hover:text-black' : 'text-[#888888] group-hover:text-white'}`}>
                                        Humanitarian rescue network. Report emergencies and dispatch help.
                                    </p>
                                </div>
                            </Link>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex-1 mt-8">
                <button onClick={() => navigate('/civic')} className={`flex items-center gap-2 mb-8 font-bold text-[0.9rem] transition-colors outline-none ${theme === 'light' ? 'text-[#666666] hover:text-black' : 'text-[#888888] hover:text-white'}`}>
                    <ArrowLeft size={16} /> {currentT.back}
                </button>

                <motion.div initial="hidden" animate="visible" variants={containerVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <motion.div variants={itemVariants} className={`flex items-center gap-3 mb-4 ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>
                            <ShieldCheck size={20} className={theme === 'light' ? 'text-black' : 'text-white'} />
                            <span className="text-[0.9rem] font-bold tracking-widest uppercase">{currentT.console}</span>
                        </motion.div>
                        <motion.h1 variants={itemVariants} className="text-[2.5rem] md:text-[3.5rem] font-black leading-[1.1] tracking-tighter mb-4">
                            {currentT.title}
                        </motion.h1>
                        <motion.p variants={itemVariants} className={`text-[1.1rem] max-w-[700px] ${theme === 'light' ? 'text-[#555555]' : 'text-[#aaaaaa]'}`}>
                            {currentT.sub}
                        </motion.p>
                    </div>

                    <motion.div variants={itemVariants} className={`flex rounded-xl overflow-hidden shrink-0 border ${theme === 'light' ? 'bg-white border-[#e0e0e0]' : 'bg-[#111111] border-[#333333]'}`}>
                        {['Active', 'Completed', 'Duplicate'].map((filterType) => {
                            const labelMap = { 'Active': currentT.flt_active, 'Completed': currentT.flt_comp, 'Duplicate': currentT.flt_dup };
                            return (
                                <button
                                    key={filterType}
                                    onClick={() => setStatusFilter(filterType)}
                                    className={`px-6 py-4 font-bold text-[0.9rem] transition-colors outline-none border-r last:border-r-0 ${
                                        theme === 'light' 
                                            ? (statusFilter === filterType ? 'bg-black text-white border-black' : 'text-[#666666] border-[#e0e0e0] hover:bg-[#f5f5f5]') 
                                            : (statusFilter === filterType ? 'bg-white text-black border-white' : 'text-[#888888] border-[#333333] hover:bg-[#222222]')
                                    }`}
                                >
                                    {labelMap[filterType]}
                                </button>
                            );
                        })}
                    </motion.div>
                </motion.div>

                <div className={`rounded-2xl overflow-hidden min-h-[500px] border mb-12 ${theme === 'light' ? 'bg-white border-[#e0e0e0]' : 'bg-[#111111] border-[#333333]'}`}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className={`border-b ${theme === 'light' ? 'bg-[#f9f9f9] border-[#e0e0e0]' : 'bg-[#0a0a0a] border-[#333333]'}`}>
                                    <th className={`p-6 text-[0.8rem] font-bold uppercase tracking-wider ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{currentT.th_id}</th>
                                    <th className={`p-6 text-[0.8rem] font-bold uppercase tracking-wider ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{currentT.th_detail}</th>
                                    <th className={`p-6 text-[0.8rem] font-bold uppercase tracking-wider ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{currentT.th_pri}</th>
                                    <th className={`p-6 text-[0.8rem] font-bold uppercase tracking-wider ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{currentT.th_stat}</th>
                                    <th className={`p-6 text-[0.8rem] font-bold uppercase tracking-wider text-right ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{currentT.th_act}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="5" className="p-12 text-center">
                                            <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4 ${theme === 'light' ? 'border-black' : 'border-white'}`}></div>
                                            <p className={`font-bold ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{currentT.sync}</p>
                                        </td>
                                    </tr>
                                ) : filteredRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-12 text-center">
                                            <FileText size={32} className={`mx-auto mb-4 ${theme === 'light' ? 'text-[#cccccc]' : 'text-[#333333]'}`} />
                                            <p className={`font-bold ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{currentT.no_rec}</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRecords.map((incident) => {
                                        const sla = determineSLAStatus(incident.createdAt, incident.status);
                                        const dateString = incident.createdAt ? incident.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Unknown Date';
                                        
                                        return (
                                            <tr key={incident.id} className={`border-b transition-colors ${theme === 'light' ? 'border-[#e0e0e0] hover:bg-[#f5f5f5]' : 'border-[#333333] hover:bg-[#1a1a1a]'}`}>
                                                <td className="p-6 align-top">
                                                    <div className={`font-mono text-[0.85rem] mb-1 ${theme === 'light' ? 'text-black' : 'text-white'}`}>{incident.id.substring(0, 8).toUpperCase()}</div>
                                                    <div className={`text-[0.8rem] font-bold flex items-center gap-1 ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>
                                                        <Clock size={12} /> {dateString}
                                                    </div>
                                                </td>
                                                <td className="p-6 align-top max-w-[300px]">
                                                    <div className={`font-black text-[1rem] mb-1 truncate ${theme === 'light' ? 'text-black' : 'text-white'}`}>{incident.title}</div>
                                                    <div className={`text-[0.85rem] font-bold mb-2 ${theme === 'light' ? 'text-[#555555]' : 'text-[#aaaaaa]'}`}>{incident.category}</div>
                                                    
                                                    {/* REPORTER DETAILS INJECTION FOR ADMIN VIEW */}
                                                    <div className={`mt-3 p-3 rounded-lg border text-[0.8rem] ${theme === 'light' ? 'bg-[#f9f9f9] border-[#e0e0e0]' : 'bg-[#0a0a0a] border-[#222222]'}`}>
                                                        <div className="flex items-center gap-2 mb-1 text-[#888888] font-bold uppercase tracking-wider">
                                                            <User size={12} /> Reporter Data
                                                        </div>
                                                        <div className={`font-medium truncate ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                                                            {incident.isAnonymous ? currentT.rep_un : (incident.reporterName || currentT.rep_un)}
                                                        </div>
                                                        {!incident.isAnonymous && incident.reporterPhone && (
                                                            <div className={`font-medium flex items-center gap-1 mt-1 truncate ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                                                                <Phone size={10} /> {incident.reporterPhone}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {/* END REPORTER DETAILS */}

                                                    <div className="flex items-center gap-3 mt-3">
                                                        <span className={`flex items-center gap-1 text-[0.75rem] font-bold ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>
                                                            <Users size={12} /> {currentT.supp}: {incident.supportCount || 1}
                                                        </span>
                                                        {incident.evidenceUrl && (
                                                            <a href={incident.evidenceUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1 text-[0.75rem] font-bold hover:underline outline-none ${theme === 'light' ? 'text-[#00aa55]' : 'text-[#00ff88]'}`}>
                                                                <Layers size={12} /> {currentT.ev_att}
                                                            </a>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-6 align-top">
                                                    <div className={`inline-block px-3 py-1 text-[0.75rem] font-black tracking-wider uppercase rounded-full mb-2 ${
                                                        incident.priority === 'Critical' ? (theme === 'light' ? 'bg-[#ffcccc] text-[#cc0000]' : 'bg-[#330000] text-[#ff4444]') : 
                                                        incident.priority === 'High' ? (theme === 'light' ? 'bg-[#ffeebb] text-[#cc8800]' : 'bg-[#331a00] text-[#ffaa00]') : 
                                                        (theme === 'light' ? 'bg-[#ccffdd] text-[#00aa55]' : 'bg-[#002211] text-[#00ff88]')
                                                    }`}>
                                                        {incident.priority}
                                                    </div>
                                                    <div className={`text-[0.8rem] font-bold flex items-center gap-1 ${sla.color}`}>
                                                        <AlertTriangle size={12} /> {sla.label}
                                                    </div>
                                                </td>
                                                <td className="p-6 align-top">
                                                    <span className={`text-[0.9rem] font-black ${theme === 'light' ? 'text-black' : 'text-white'}`}>{incident.status}</span>
                                                </td>
                                                <td className="p-6 align-top text-right">
                                                    <div className="flex flex-col gap-2 items-end">
                                                        {['Submitted', 'Reported'].includes(incident.status) && (
                                                            <button 
                                                                onClick={() => modifyIncidentStatus(incident.id, 'Assigned')}
                                                                disabled={processingId === incident.id}
                                                                className={`px-4 py-2 rounded-lg font-bold text-[0.8rem] transition-colors disabled:opacity-50 outline-none ${
                                                                    theme === 'light' ? 'bg-black text-white hover:bg-[#333333]' : 'bg-white text-black hover:bg-[#e0e0e0]'
                                                                }`}
                                                            >
                                                                {currentT.act_assign}
                                                            </button>
                                                        )}
                                                        {incident.status === 'Assigned' && (
                                                            <button 
                                                                onClick={() => modifyIncidentStatus(incident.id, 'In Progress')}
                                                                disabled={processingId === incident.id}
                                                                className={`border px-4 py-2 rounded-lg font-bold text-[0.8rem] transition-colors disabled:opacity-50 outline-none ${
                                                                    theme === 'light' ? 'bg-white text-black border-[#cccccc] hover:border-black' : 'bg-[#222222] text-white border-[#555555] hover:border-white'
                                                                }`}
                                                            >
                                                                {currentT.act_init}
                                                            </button>
                                                        )}
                                                        {incident.status === 'In Progress' && (
                                                            <button 
                                                                onClick={() => modifyIncidentStatus(incident.id, 'Completed')}
                                                                disabled={processingId === incident.id}
                                                                className={`border px-4 py-2 rounded-lg font-bold text-[0.8rem] transition-colors disabled:opacity-50 outline-none ${
                                                                    theme === 'light' ? 'bg-[#e0ffe0] text-[#00aa55] border-[#00aa55] hover:bg-[#ccffdd]' : 'bg-[#002211] text-[#00ff88] border-[#00ff88] hover:bg-[#00331a]'
                                                                }`}
                                                            >
                                                                {currentT.act_conc}
                                                            </button>
                                                        )}
                                                        {['Submitted', 'Reported', 'Assigned'].includes(incident.status) && (
                                                            <button 
                                                                onClick={() => modifyIncidentStatus(incident.id, 'Duplicate')}
                                                                disabled={processingId === incident.id}
                                                                className={`px-4 py-2 font-bold text-[0.8rem] transition-colors disabled:opacity-50 outline-none ${
                                                                    theme === 'light' ? 'text-[#666666] hover:text-[#cc0000]' : 'text-[#888888] hover:text-[#ff4444]'
                                                                }`}
                                                            >
                                                                {currentT.act_merge}
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* FOOTER ALIGNMENT */}
            <footer className={`w-full mx-auto flex flex-col md:flex-row items-center justify-between gap-8 px-8 md:px-16 py-12 border-t opacity-0 animate-fade stagger-3 relative z-10 ${
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
                        <span onClick={() => setShowSitemap(true)} className={`cursor-pointer transition-colors underline outline-none ${theme === 'light' ? 'hover:text-black' : 'hover:text-white'}`}>{currentT.sitemap}</span>
                        <span className={`w-1 h-1 rounded-full ${theme === 'light' ? 'bg-[#cccccc]' : 'bg-[#333333]'}`}></span>
                        <Link to="/careers" className={`transition-colors outline-none ${theme === 'light' ? 'hover:text-black' : 'hover:text-white'}`}>{currentT.careers}</Link>
                    </div>
                    <span className={`hidden md:block w-1 h-1 rounded-full ${theme === 'light' ? 'bg-[#cccccc]' : 'bg-[#333333]'}`}></span>
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
                    <button onClick={scrollToTop} className={`p-2 rounded-full transition-colors border outline-none ${theme === 'light' ? 'bg-[#f5f5f5] border-[#cccccc] hover:bg-[#e0e0e0]' : 'bg-[#111111] border-[#333333] hover:bg-[#222222]'}`}>
                        <ArrowUp size={16} />
                    </button>
                </div>
            </footer>
        </div>
    );
}