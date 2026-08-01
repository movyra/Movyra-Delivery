import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, orderBy, getDocs, doc, updateDoc, setDoc, deleteDoc, where, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { useCivicStore } from '../../store/useCivicStore';
import { 
    ArrowLeft, 
    LogOut,
    X,
    Globe,
    ArrowUp,
    ShieldCheck,
    CheckCircle,
    Building,
    AlertTriangle,
    Merge,
    FileText,
    MapPin,
    XCircle,
    Image as ImageIcon
} from 'lucide-react';

export default function SahayAdmin() {
    const navigate = useNavigate();
    
    // 1. STATE MANAGEMENT
    const theme = useCivicStore((state) => state.theme) || 'light'; 
    const terminateSession = useCivicStore((state) => state.terminateSession);

    const [lang, setLang] = useState('en');
    const [showLangPrompt, setShowLangPrompt] = useState(false);
    const [showProductsPrompt, setShowProductsPrompt] = useState(false);
    const [showSitemap, setShowSitemap] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    
    const [pendingPartners, setPendingPartners] = useState([]);
    const [activeCases, setActiveCases] = useState([]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Partners'); 
    const [isUpdating, setIsUpdating] = useState(false);

    // 2. AUTHENTICATION, STRICT ACCESS CONTROL & DATA FETCHING
    useEffect(() => {
        const sysLang = navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'hinglish', 'mr', 'gu', 'te', 'ta', 'pa', 'bho', 'ar', 'es', 'fr', 'de'];
        if (supported.includes(sysLang)) setLang(sysLang);

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            // STRICT ACCESS EVALUATION: Only allow the specific test admin email
            if (user && user.email === 'testcodecfg@gmail.com') {
                setCurrentUser(user);
                fetchDashboardData();
            } else {
                alert("Unauthorized Access. This portal is restricted to primary administrators.");
                navigate('/sahay');
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            // Fetch Pending Organizations
            const orgsRef = collection(db, 'sahay_organizations');
            const qOrgs = query(orgsRef, where('verificationStatus', '==', 'Pending'));
            const snapOrgs = await getDocs(qOrgs);
            const orgRecords = snapOrgs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPendingPartners(orgRecords);

            // Fetch Active Cases for moderation
            const casesRef = collection(db, 'sahay_cases');
            const qCases = query(casesRef, where('status', 'in', ['Reported', 'Verified']), orderBy('createdAt', 'desc'));
            const snapCases = await getDocs(qCases);
            const caseRecords = snapCases.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setActiveCases(caseRecords);

        } catch (error) {
            console.error("Failed to load admin data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // 3. OPERATIONAL LOGIC
    const handleSignOut = async () => {
        try {
            await signOut(auth);
            terminateSession();
            navigate('/sahay');
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    // Approve Partner & Upgrade Role
    const handleApprovePartner = async (orgId) => {
        if (!currentUser) return;
        setIsUpdating(true);
        try {
            // 1. Update Organization Verification Status
            const orgRef = doc(db, 'sahay_organizations', orgId);
            await updateDoc(orgRef, {
                verificationStatus: 'Verified',
                verifiedAt: serverTimestamp()
            });

            // 2. Upgrade User Role to grant Organization Access
            const userRef = doc(db, 'sahay_users', orgId);
            await setDoc(userRef, {
                role: 'Organization'
            }, { merge: true });

            setPendingPartners(pendingPartners.filter(p => p.id !== orgId));
        } catch (error) {
            console.error("Failed to approve partner:", error);
            alert("Approval failed. Please check network connection.");
        } finally {
            setIsUpdating(false);
        }
    };

    // Reject Partner Application
    const handleRejectPartner = async (orgId) => {
        if (!window.confirm("Are you sure you want to reject and delete this application?")) return;
        setIsUpdating(true);
        try {
            const orgRef = doc(db, 'sahay_organizations', orgId);
            await deleteDoc(orgRef);
            setPendingPartners(pendingPartners.filter(p => p.id !== orgId));
        } catch (error) {
            console.error("Failed to reject partner:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    // Merge/Close a duplicate case
    const handleMergeCase = async (caseId) => {
        if (!currentUser) return;
        setIsUpdating(true);
        try {
            const caseRef = doc(db, 'sahay_cases', caseId);
            await updateDoc(caseRef, {
                status: 'Closed',
                moderationNote: 'Merged as duplicate',
                closedAt: serverTimestamp()
            });

            setActiveCases(activeCases.filter(c => c.id !== caseId));
        } catch (error) {
            console.error("Failed to merge case:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    // 4. 13-LANGUAGE DICTIONARY (Fully Translated, Professional)
    const t = {
        en: {
            lang: "English", log_out: "Log out", careers: "Careers", products: "Products", back: "Back to Home", sitemap: "Sitemap", sitemap_desc: "Direct navigation to all Sahay modules.",
            title: "Admin Console", sub: "Review partner applications and manage rescue reports.",
            tab_part: "Partner Approvals", tab_cases: "Report Moderation",
            btn_approve: "Approve", btn_reject: "Reject", btn_merge: "Merge Duplicate",
            lbl_docs: "Verification Documents", loading: "Loading data...",
            empty_part: "No pending partner applications.", empty_cases: "No recent reports to moderate.",
            lbl_loc: "Location", lbl_cat: "Type", lbl_id: "Government ID", lbl_photo: "Organization Photo",
            sm_home: "Home Gateway", sm_report: "Submit Report", sm_cases: "Public Feed", sm_map: "Live Map", sm_org: "Partner Dashboard", sm_vol: "Volunteer Portal", sm_imp: "Impact Analytics", sm_emg: "Emergency Directory", sm_cont: "Contact & Inquiries", sm_abt: "About Mission", sm_auth: "Authentication", sm_adm: "Admin Console"
        },
        hi: {
            lang: "हिन्दी", log_out: "लॉग आउट", careers: "करियर", products: "उत्पाद", back: "होम पर वापस जाएं", sitemap: "साइटमैप", sitemap_desc: "सभी सहाय मॉड्यूल पर सीधा नेविगेशन।",
            title: "एडमिन कंसोल", sub: "पार्टनर आवेदनों की समीक्षा करें और बचाव रिपोर्ट प्रबंधित करें।",
            tab_part: "पार्टनर स्वीकृतियां", tab_cases: "रिपोर्ट मॉडरेशन",
            btn_approve: "स्वीकृत करें", btn_reject: "अस्वीकार करें", btn_merge: "डुप्लिकेट मर्ज करें",
            lbl_docs: "सत्यापन दस्तावेज़", loading: "डेटा लोड हो रहा है...",
            empty_part: "कोई लंबित पार्टनर आवेदन नहीं।", empty_cases: "मॉडरेट करने के लिए कोई हालिया रिपोर्ट नहीं।",
            lbl_loc: "स्थान", lbl_cat: "प्रकार", lbl_id: "सरकारी आईडी", lbl_photo: "संगठन का फोटो",
            sm_home: "होम गेटवे", sm_report: "रिपोर्ट सबमिट करें", sm_cases: "सार्वजनिक फ़ीड", sm_map: "लाइव मानचित्र", sm_org: "पार्टनर डैशबोर्ड", sm_vol: "स्वयंसेवक पोर्टल", sm_imp: "प्रभाव विश्लेषिकी", sm_emg: "आपातकालीन निर्देशिका", sm_cont: "संपर्क और पूछताछ", sm_abt: "मिशन के बारे में", sm_auth: "प्रमाणीकरण", sm_adm: "एडमिन कंसोल"
        },
        hinglish: {
            lang: "Hinglish", log_out: "Log out", careers: "Careers", products: "Products", back: "Home par wapas", sitemap: "Sitemap", sitemap_desc: "Sabhi Sahay modules ka direct navigation.",
            title: "Admin Console", sub: "Partner applications review karein aur reports manage karein.",
            tab_part: "Partner Approvals", tab_cases: "Report Moderation",
            btn_approve: "Approve", btn_reject: "Reject", btn_merge: "Duplicate Merge Karein",
            lbl_docs: "Verification Documents", loading: "Data load ho raha hai...",
            empty_part: "Koi pending partner application nahi.", empty_cases: "Moderate karne ke liye koi nayi report nahi.",
            lbl_loc: "Location", lbl_cat: "Type", lbl_id: "Government ID", lbl_photo: "Organization Photo",
            sm_home: "Home Gateway", sm_report: "Report Submit Karein", sm_cases: "Public Feed", sm_map: "Live Map", sm_org: "Partner Dashboard", sm_vol: "Volunteer Portal", sm_imp: "Impact Analytics", sm_emg: "Emergency Directory", sm_cont: "Contact aur Inquiries", sm_abt: "Mission ke baare mein", sm_auth: "Authentication", sm_adm: "Admin Console"
        },
        mr: {
            lang: "मराठी", log_out: "लॉग आउट", careers: "करिअर", products: "उत्पादने", back: "मुख्यपृष्ठावर परत", sitemap: "साइटमॅप", sitemap_desc: "सर्व सहाय मॉड्यूल्ससाठी थेट नेव्हिगेशन.",
            title: "प्रशासन कन्सोल", sub: "भागीदार अर्जांचे पुनरावलोकन करा आणि बचाव अहवाल व्यवस्थापित करा.",
            tab_part: "भागीदार मान्यता", tab_cases: "अहवाल मॉडरेशन",
            btn_approve: "मंजूर करा", btn_reject: "नाकारा", btn_merge: "डुप्लिकेट विलीन करा",
            lbl_docs: "सत्यापन दस्तऐवज", loading: "डेटा लोड करत आहे...",
            empty_part: "कोणतेही प्रलंबित भागीदार अर्ज नाहीत.", empty_cases: "मॉडरेट करण्यासाठी कोणतेही अलीकडील अहवाल नाहीत.",
            lbl_loc: "स्थान", lbl_cat: "प्रकार", lbl_id: "शासकीय ओळखपत्र", lbl_photo: "संस्थेचा फोटो",
            sm_home: "होम गेटवे", sm_report: "अहवाल सबमिट करा", sm_cases: "सार्वजनिक फीड", sm_map: "थेट नकाशा", sm_org: "भागीदार डॅशबोर्ड", sm_vol: "स्वयंसेवक पोर्टल", sm_imp: "प्रभाव विश्लेषण", sm_emg: "आपत्कालीन निर्देशिका", sm_cont: "संपर्क आणि चौकशी", sm_abt: "मिशन बद्दल", sm_auth: "प्रमाणीकरण", sm_adm: "प्रशासन कन्सोल"
        },
        gu: {
            lang: "ગુજરાતી", log_out: "લૉગ આઉટ", careers: "કારકિર્દી", products: "ઉત્પાદનો", back: "હોમ પર પાછા ફરો", sitemap: "સાઇટમેપ", sitemap_desc: "તમામ સહાય મોડ્યુલો માટે સીધું નેવિગેશન.",
            title: "વહીવટી કન્સોલ", sub: "ભાગીદાર અરજીઓની સમીક્ષા કરો અને બચાવ અહેવાલોનું સંચાલન કરો.",
            tab_part: "ભાગીદાર મંજૂરીઓ", tab_cases: "અહેવાલ મોડરેશન",
            btn_approve: "મંજૂર કરો", btn_reject: "નકારો", btn_merge: "ડુપ્લિકેટ મર્જ કરો",
            lbl_docs: "ચકાસણી દસ્તાવેજો", loading: "ડેટા લોડ થઈ રહ્યો છે...",
            empty_part: "કોઈ પડતર ભાગીદાર અરજીઓ નથી.", empty_cases: "મોડરેટ કરવા માટે કોઈ તાજેતરના અહેવાલો નથી.",
            lbl_loc: "સ્થાન", lbl_cat: "પ્રકાર", lbl_id: "સરકારી આઈડી", lbl_photo: "સંસ્થાનો ફોટો",
            sm_home: "હોમ ગેટવે", sm_report: "રિપોર્ટ સબમિટ કરો", sm_cases: "જાહેર ફીડ", sm_map: "જીવંત નકશો", sm_org: "ભાગીદાર ડેશબોર્ડ", sm_vol: "સ્વયંસેવક પોર્ટલ", sm_imp: "અસર એનાલિટિક્સ", sm_emg: "કટોકટી ડિરેક્ટરી", sm_cont: "સંપર્ક અને પૂછપરછ", sm_abt: "મિશન વિશે", sm_auth: "પ્રમાણીકરણ", sm_adm: "એડમિન કન્સોલ"
        },
        te: {
            lang: "తెలుగు", log_out: "లాగౌట్", careers: "కెరీర్స్", products: "ఉత్పత్తులు", back: "హోమ్‌కు తిరిగి వెళ్లండి", sitemap: "సైట్‌మ్యాప్", sitemap_desc: "అన్ని సహాయ్ మాడ్యూల్స్‌కు ప్రత్యక్ష నావిగేషన్.",
            title: "అడ్మిన్ కన్సోల్", sub: "భాగస్వామి అప్లికేషన్‌లను సమీక్షించండి మరియు నివేదికలను నిర్వహించండి.",
            tab_part: "భాగస్వామి ఆమోదాలు", tab_cases: "రిపోర్ట్ మోడరేషన్",
            btn_approve: "ఆమోదించండి", btn_reject: "తిరస్కరించండి", btn_merge: "నకిలీని విలీనం చేయండి",
            lbl_docs: "ధృవీకరణ పత్రాలు", loading: "డేటా లోడ్ అవుతోంది...",
            empty_part: "పెండింగ్ భాగస్వామి అప్లికేషన్‌లు లేవు.", empty_cases: "మోడరేట్ చేయడానికి ఇటీవలి నివేదికలు లేవు.",
            lbl_loc: "స్థానం", lbl_cat: "రకం", lbl_id: "ప్రభుత్వ ID", lbl_photo: "సంస్థ ఫోటో",
            sm_home: "హోమ్ గేట్‌వే", sm_report: "నివేదిక సమర్పించండి", sm_cases: "పబ్లిక్ ఫీడ్", sm_map: "లైవ్ మ్యాప్", sm_org: "భాగస్వామి డాష్‌బోర్డ్", sm_vol: "వాలంటీర్ పోర్టల్", sm_imp: "ఇంపాక్ట్ అనలిటిక్స్", sm_emg: "అత్యవసర డైరెక్టరీ", sm_cont: "సంప్రదింపులు మరియు విచారణలు", sm_abt: "మిషన్ గురించి", sm_auth: "ప్రామాణీకరణ", sm_adm: "అడ్మిన్ కన్సోల్"
        },
        ta: {
            lang: "தமிழ்", log_out: "வெளியேறு", careers: "தொழில்கள்", products: "தயாரிப்புகள்", back: "முகப்புக்குத் திரும்பு", sitemap: "தளத்தின் வரைபடம்", sitemap_desc: "அனைத்து சஹாய் தொகுதிகளுக்கும் நேரடி வழிசெலுத்தல்.",
            title: "நிர்வாக கன்சோல்", sub: "கூட்டாளர் விண்ணப்பங்களை மதிப்பாய்வு செய்யவும் மற்றும் அறிக்கைகளை நிர்வகிக்கவும்.",
            tab_part: "கூட்டாளர் ஒப்புதல்கள்", tab_cases: "அறிக்கை மதிப்பீடு",
            btn_approve: "ஒப்புதல் அளி", btn_reject: "நிராகரி", btn_merge: "நகலை ஒன்றிணைக்கவும்",
            lbl_docs: "சரிபார்ப்பு ஆவணங்கள்", loading: "தரவு ஏற்றப்படுகிறது...",
            empty_part: "நிலுவையில் உள்ள கூட்டாளர் விண்ணப்பங்கள் எதுவும் இல்லை.", empty_cases: "மதிப்பாய்வு செய்ய சமீபத்திய அறிக்கைகள் எதுவும் இல்லை.",
            lbl_loc: "இடம்", lbl_cat: "வகை", lbl_id: "அரசு ஐடி", lbl_photo: "நிறுவனத்தின் புகைப்படம்",
            sm_home: "முகப்பு நுழைவாயில்", sm_report: "அறிக்கையை சமர்ப்பிக்கவும்", sm_cases: "பொது ஊட்டம்", sm_map: "நேரடி வரைபடம்", sm_org: "கூட்டாளர் டாஷ்போர்டு", sm_vol: "தன்னார்வ போர்டல்", sm_imp: "தாக்க பகுப்பாய்வு", sm_emg: "அவசர அடைவு", sm_cont: "தொடர்பு மற்றும் விசாரணைகள்", sm_abt: "பணி பற்றி", sm_auth: "அங்கீகாரம்", sm_adm: "நிர்வாக கன்சோல்"
        },
        pa: {
            lang: "ਪੰਜਾਬੀ", log_out: "ਲੌਗ ਆਉਟ", careers: "ਕਰੀਅਰ", products: "ਉਤਪਾਦ", back: "ਹੋਮ 'ਤੇ ਵਾਪਸ", sitemap: "ਸਾਈਟਮੈਪ", sitemap_desc: "ਸਾਰੇ ਸਹਾਏ ਮੋਡਿਊਲਾਂ ਲਈ ਸਿੱਧੀ ਨੈਵੀਗੇਸ਼ਨ।",
            title: "ਐਡਮਿਨ ਕੰਸੋਲ", sub: "ਪਾਰਟਨਰ ਐਪਲੀਕੇਸ਼ਨਾਂ ਦੀ ਸਮੀਖਿਆ ਕਰੋ ਅਤੇ ਰਿਪੋਰਟਾਂ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ।",
            tab_part: "ਪਾਰਟਨਰ ਪ੍ਰਵਾਨਗੀਆਂ", tab_cases: "ਰਿਪੋਰਟ ਸੰਚਾਲਨ",
            btn_approve: "ਮਨਜ਼ੂਰ ਕਰੋ", btn_reject: "ਰੱਦ ਕਰੋ", btn_merge: "ਡੁਪਲੀਕੇਟ ਮਿਲਾਓ",
            lbl_docs: "ਤਸਦੀਕ ਦਸਤਾਵੇਜ਼", loading: "ਡੇਟਾ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...",
            empty_part: "ਕੋਈ ਲੰਬਿਤ ਪਾਰਟਨਰ ਐਪਲੀਕੇਸ਼ਨ ਨਹੀਂ।", empty_cases: "ਸੰਚਾਲਨ ਲਈ ਕੋਈ ਹਾਲੀਆ ਰਿਪੋਰਟਾਂ ਨਹੀਂ।",
            lbl_loc: "ਸਥਾਨ", lbl_cat: "ਕਿਸਮ", lbl_id: "ਸਰਕਾਰੀ ਆਈ.ਡੀ", lbl_photo: "ਸੰਗਠਨ ਦੀ ਫੋਟੋ",
            sm_home: "ਹੋਮ ਗੇਟਵੇ", sm_report: "ਰਿਪੋਰਟ ਦਰਜ ਕਰੋ", sm_cases: "ਜਨਤਕ ਫੀਡ", sm_map: "ਲਾਈਵ ਨਕਸ਼ਾ", sm_org: "ਪਾਰਟਨਰ ਡੈਸ਼ਬੋਰਡ", sm_vol: "ਵਲੰਟੀਅਰ ਪੋਰਟਲ", sm_imp: "ਪ੍ਰਭਾਵ ਵਿਸ਼ਲੇਸ਼ਣ", sm_emg: "ਐਮਰਜੈਂਸੀ ਡਾਇਰੈਕਟਰੀ", sm_cont: "ਸੰਪਰਕ ਅਤੇ ਪੁੱਛਗਿੱਛ", sm_abt: "ਮਿਸ਼ਨ ਬਾਰੇ", sm_auth: "ਪ੍ਰਮਾਣਿਕਤਾ", sm_adm: "ਐਡਮਿਨ ਕੰਸੋਲ"
        },
        bho: {
            lang: "भोजपुरी", log_out: "लॉग आउट", careers: "करियर", products: "उत्पाद", back: "होम पर वापस", sitemap: "साइटमैप", sitemap_desc: "सब सहाय मॉड्यूल पर सीधा नेविगेशन।",
            title: "एडमिन कंसोल", sub: "पार्टनर आवेदन के समीक्षा करीं आ बचाव रिपोर्ट प्रबंधित करीं।",
            tab_part: "पार्टनर स्वीकृति", tab_cases: "रिपोर्ट मॉडरेशन",
            btn_approve: "स्वीकृत करीं", btn_reject: "अस्वीकार करीं", btn_merge: "डुप्लिकेट मर्ज करीं",
            lbl_docs: "सत्यापन दस्तावेज", loading: "डेटा लोड हो रहल बा...",
            empty_part: "कवनो लंबित पार्टनर आवेदन नईखे।", empty_cases: "मॉडरेट करे खातिर कवनो हाल के रिपोर्ट नईखे।",
            lbl_loc: "स्थान", lbl_cat: "प्रकार", lbl_id: "सरकारी आईडी", lbl_photo: "संगठन के फोटो",
            sm_home: "होम गेटवे", sm_report: "रिपोर्ट सबमिट करीं", sm_cases: "सार्वजनिक फीड", sm_map: "लाइव नक्शा", sm_org: "पार्टनर डैशबोर्ड", sm_vol: "स्वयंसेवक पोर्टल", sm_imp: "प्रभाव विश्लेषिकी", sm_emg: "आपातकालीन निर्देशिका", sm_cont: "संपर्क आ पूछताछ", sm_abt: "मिशन के बारे में", sm_auth: "प्रमाणीकरण", sm_adm: "एडमिन कंसोल"
        },
        ar: {
            lang: "العربية", log_out: "تسجيل الخروج", careers: "الوظائف", products: "المنتجات", back: "العودة إلى الصفحة الرئيسية", sitemap: "خريطة الموقع", sitemap_desc: "التنقل المباشر لجميع وحدات ساهاي.",
            title: "وحدة تحكم الإدارة", sub: "مراجعة طلبات الشركاء وإدارة تقارير الإنقاذ.",
            tab_part: "موافقات الشركاء", tab_cases: "إدارة التقارير",
            btn_approve: "موافقة", btn_reject: "رفض", btn_merge: "دمج التكرار",
            lbl_docs: "مستندات التحقق", loading: "جاري تحميل البيانات...",
            empty_part: "لا توجد طلبات شركاء معلقة.", empty_cases: "لا توجد تقارير حديثة لإدارتها.",
            lbl_loc: "الموقع", lbl_cat: "النوع", lbl_id: "الهوية الحكومية", lbl_photo: "صورة المنظمة",
            sm_home: "البوابة الرئيسية", sm_report: "إرسال تقرير", sm_cases: "الخلاصة العامة", sm_map: "خريطة حية", sm_org: "لوحة تحكم الشريك", sm_vol: "بوابة المتطوعين", sm_imp: "تحليلات التأثير", sm_emg: "دليل الطوارئ", sm_cont: "الاتصال والاستفسارات", sm_abt: "حول المهمة", sm_auth: "المصادقة", sm_adm: "وحدة تحكم الإدارة"
        },
        es: {
            lang: "Español", log_out: "Cerrar sesión", careers: "Carreras", products: "Productos", back: "Volver a Inicio", sitemap: "Mapa del sitio", sitemap_desc: "Navegación directa a todos los módulos de Sahay.",
            title: "Consola de Administración", sub: "Revise solicitudes de socios y gestione reportes.",
            tab_part: "Aprobaciones de Socios", tab_cases: "Moderación de Reportes",
            btn_approve: "Aprobar", btn_reject: "Rechazar", btn_merge: "Fusionar Duplicado",
            lbl_docs: "Documentos de Verificación", loading: "Cargando datos...",
            empty_part: "No hay solicitudes de socios pendientes.", empty_cases: "No hay reportes recientes para moderar.",
            lbl_loc: "Ubicación", lbl_cat: "Tipo", lbl_id: "ID Gubernamental", lbl_photo: "Foto de la Organización",
            sm_home: "Portal de Inicio", sm_report: "Enviar Reporte", sm_cases: "Feed Público", sm_map: "Mapa en Vivo", sm_org: "Panel de Socios", sm_vol: "Portal de Voluntarios", sm_imp: "Análisis de Impacto", sm_emg: "Directorio de Emergencia", sm_cont: "Contacto", sm_abt: "Acerca de la Misión", sm_auth: "Autenticación", sm_adm: "Consola de Administración"
        },
        fr: {
            lang: "Français", log_out: "Se déconnecter", careers: "Carrières", products: "Produits", back: "Retour à l'accueil", sitemap: "Plan du site", sitemap_desc: "Navigation directe vers tous les modules Sahay.",
            title: "Console d'Administration", sub: "Examinez les demandes de partenaires et gérez les rapports.",
            tab_part: "Approbations des Partenaires", tab_cases: "Modération des Rapports",
            btn_approve: "Approuver", btn_reject: "Rejeter", btn_merge: "Fusionner le doublon",
            lbl_docs: "Documents de vérification", loading: "Chargement des données...",
            empty_part: "Aucune demande de partenaire en attente.", empty_cases: "Aucun rapport récent à modérer.",
            lbl_loc: "Emplacement", lbl_cat: "Type", lbl_id: "Pièce d'identité", lbl_photo: "Photo de l'organisation",
            sm_home: "Portail d'Accueil", sm_report: "Soumettre un Rapport", sm_cases: "Flux Public", sm_map: "Carte en Direct", sm_org: "Tableau de Bord", sm_vol: "Portail Bénévole", sm_imp: "Analyse d'Impact", sm_emg: "Annuaire d'Urgence", sm_cont: "Contact", sm_abt: "À Propos", sm_auth: "Authentification", sm_adm: "Console d'Administration"
        },
        de: {
            lang: "Deutsch", log_out: "Abmelden", careers: "Karriere", products: "Produkte", back: "Zurück zur Startseite", sitemap: "Seitenverzeichnis", sitemap_desc: "Direkte Navigation zu allen Sahay-Modulen.",
            title: "Admin-Konsole", sub: "Überprüfen Sie Partneranträge und verwalten Sie Berichte.",
            tab_part: "Partnerzulassungen", tab_cases: "Berichtsmoderation",
            btn_approve: "Genehmigen", btn_reject: "Ablehnen", btn_merge: "Duplikat zusammenführen",
            lbl_docs: "Verifizierungsdokumente", loading: "Daten werden geladen...",
            empty_part: "Keine ausstehenden Partneranträge.", empty_cases: "Keine aktuellen Berichte zum Moderieren.",
            lbl_loc: "Standort", lbl_cat: "Typ", lbl_id: "Behördlicher Ausweis", lbl_photo: "Organisationsfoto",
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
        <div className="min-h-screen font-sans overflow-x-hidden flex flex-col relative bg-[#FFFFFF] text-[#111111] selection:bg-[#00A9F7] selection:text-white">
            
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
                                        className="p-4 bg-[#F7F7F7] border border-[#E5E7EB] rounded-xl font-bold text-[#111111] hover:border-[#00A9F7] hover:text-[#00A9F7] transition-colors flex items-center justify-between group outline-none"
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
                                        className={`w-full p-4 rounded-xl flex items-center justify-between transition-colors border outline-none ${lang === option.code ? 'bg-[#00A9F7]/10 border-[#00A9F7] text-[#00A9F7]' : 'bg-[#F7F7F7] border-[#E5E7EB] text-[#555555] hover:border-[#111111] hover:text-[#111111]'}`}
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
                    <div className="flex items-center gap-3 mb-4 text-[#00A9F7]">
                        <ShieldCheck size={28} />
                    </div>
                    <h1 className="text-[2.5rem] md:text-[3.5rem] font-black leading-[1.1] tracking-tighter mb-4 text-[#111111]">
                        {currentT.title}
                    </h1>
                    <p className="text-[1.1rem] text-[#555555] font-medium">
                        {currentT.sub}
                    </p>
                </div>

                {/* Admin Tabs */}
                <div className="flex gap-4 mb-8 border-b border-[#E5E7EB]">
                    <button 
                        onClick={() => setActiveTab('Partners')}
                        className={`pb-4 px-2 font-black text-[1.1rem] outline-none transition-colors relative ${activeTab === 'Partners' ? 'text-[#111111]' : 'text-[#555555] hover:text-[#111111]'}`}
                    >
                        {currentT.tab_part}
                        {activeTab === 'Partners' && <motion.div layoutId="tabIndicator" className="absolute bottom-0 left-0 right-0 h-1 bg-[#00A9F7]" />}
                    </button>
                    <button 
                        onClick={() => setActiveTab('Cases')}
                        className={`pb-4 px-2 font-black text-[1.1rem] outline-none transition-colors relative ${activeTab === 'Cases' ? 'text-[#111111]' : 'text-[#555555] hover:text-[#111111]'}`}
                    >
                        {currentT.tab_cases}
                        {activeTab === 'Cases' && <motion.div layoutId="tabIndicator" className="absolute bottom-0 left-0 right-0 h-1 bg-[#00A9F7]" />}
                    </button>
                </div>

                {/* Dashboard Feed */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-t-transparent border-[#00A9F7] rounded-full animate-spin mb-4"></div>
                        <span className="text-[0.9rem] font-bold text-[#555555]">{currentT.loading}</span>
                    </div>
                ) : activeTab === 'Partners' ? (
                    
                    // PARTNER APPROVALS VIEW
                    pendingPartners.length === 0 ? (
                        <div className="rounded-3xl p-12 text-center border border-dashed border-[#D1D5DB] bg-[#F7F7F7] flex flex-col items-center justify-center">
                            <CheckCircle size={48} className="mb-6 text-[#16A34A]" />
                            <h2 className="text-[1.5rem] font-black tracking-tight mb-2 text-[#111111]">{currentT.empty_part}</h2>
                        </div>
                    ) : (
                        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="flex flex-col gap-6">
                            {pendingPartners.map((org) => (
                                <motion.div 
                                    variants={itemVariants} 
                                    key={org.id} 
                                    className="rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-6 shadow-sm flex flex-col lg:flex-row justify-between gap-8"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Building size={18} className="text-[#00A9F7]" />
                                            <h3 className="text-[1.25rem] font-black text-[#111111]">{org.name || 'Unnamed Organization'}</h3>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                            <div className="bg-[#F7F7F7] p-4 rounded-xl border border-[#E5E7EB]">
                                                <p className="text-[0.7rem] font-bold text-[#888888] uppercase tracking-wider mb-1">Email Address</p>
                                                <p className="text-[0.95rem] font-bold text-[#111111] truncate">{org.email}</p>
                                            </div>
                                            <div className="bg-[#F7F7F7] p-4 rounded-xl border border-[#E5E7EB]">
                                                <p className="text-[0.7rem] font-bold text-[#888888] uppercase tracking-wider mb-1">Contact Number</p>
                                                <p className="text-[0.95rem] font-bold text-[#111111] truncate">{org.phone}</p>
                                            </div>
                                            <div className="sm:col-span-2 bg-[#F7F7F7] p-4 rounded-xl border border-[#E5E7EB]">
                                                <p className="text-[0.7rem] font-bold text-[#888888] uppercase tracking-wider mb-1">Registered Address</p>
                                                <p className="text-[0.95rem] font-bold text-[#111111]">{org.address}</p>
                                            </div>
                                        </div>

                                        <p className="text-[0.8rem] font-bold text-[#555555] uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <FileText size={14} /> {currentT.lbl_docs}
                                        </p>
                                        <div className="grid grid-cols-2 gap-4">
                                            {org.idDocumentUrl && (
                                                <a href={org.idDocumentUrl} target="_blank" rel="noopener noreferrer" className="relative group rounded-xl overflow-hidden border border-[#E5E7EB] aspect-video bg-[#F7F7F7] block">
                                                    <img src={org.idDocumentUrl} alt="ID Document" className="w-full h-full object-cover group-hover:opacity-75 transition-opacity" />
                                                    <div className="absolute inset-x-0 bottom-0 bg-[#111111]/80 text-[#FFFFFF] text-[0.7rem] font-bold px-2 py-2 text-center">{currentT.lbl_id}</div>
                                                </a>
                                            )}
                                            {org.orgPhotoUrl && (
                                                <a href={org.orgPhotoUrl} target="_blank" rel="noopener noreferrer" className="relative group rounded-xl overflow-hidden border border-[#E5E7EB] aspect-video bg-[#F7F7F7] block">
                                                    <img src={org.orgPhotoUrl} alt="Organization" className="w-full h-full object-cover group-hover:opacity-75 transition-opacity" />
                                                    <div className="absolute inset-x-0 bottom-0 bg-[#111111]/80 text-[#FFFFFF] text-[0.7rem] font-bold px-2 py-2 text-center">{currentT.lbl_photo}</div>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col items-end justify-center min-w-[200px] gap-3 border-t lg:border-t-0 lg:border-l border-[#E5E7EB] pt-6 lg:pt-0 lg:pl-8">
                                        <button
                                            onClick={() => handleApprovePartner(org.id)}
                                            disabled={isUpdating}
                                            className="w-full bg-[#111111] text-[#FFFFFF] py-4 rounded-xl font-black text-[0.95rem] flex items-center justify-center gap-2 hover:bg-[#333333] transition-colors outline-none disabled:opacity-50"
                                        >
                                            <ShieldCheck size={16} /> {currentT.btn_approve}
                                        </button>
                                        <button
                                            onClick={() => handleRejectPartner(org.id)}
                                            disabled={isUpdating}
                                            className="w-full bg-[#FFFFFF] text-[#DC2626] border border-[#E5E7EB] py-4 rounded-xl font-bold text-[0.95rem] flex items-center justify-center gap-2 hover:bg-[#DC2626]/5 transition-colors outline-none disabled:opacity-50"
                                        >
                                            <XCircle size={16} /> {currentT.btn_reject}
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )
                ) : (
                    
                    // CASE MODERATION VIEW
                    activeCases.length === 0 ? (
                        <div className="rounded-3xl p-12 text-center border border-dashed border-[#D1D5DB] bg-[#F7F7F7] flex flex-col items-center justify-center">
                            <CheckCircle size={48} className="mb-6 text-[#16A34A]" />
                            <h2 className="text-[1.5rem] font-black tracking-tight mb-2 text-[#111111]">{currentT.empty_cases}</h2>
                        </div>
                    ) : (
                        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="flex flex-col gap-6">
                            {activeCases.map((caseItem) => (
                                <motion.div 
                                    variants={itemVariants} 
                                    key={caseItem.id} 
                                    className="rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-6 shadow-sm flex flex-col lg:flex-row justify-between gap-8"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="px-3 py-1 bg-[#F7F7F7] border border-[#E5E7EB] text-[#555555] text-[0.75rem] font-black tracking-wider uppercase rounded-full">
                                                ID: {caseItem.id.substring(0, 8)}
                                            </span>
                                            {caseItem.danger === 'Yes' && (
                                                <span className="px-3 py-1 bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626] text-[0.75rem] font-black tracking-wider uppercase rounded-full flex items-center gap-1">
                                                    <AlertTriangle size={12}/> Critical
                                                </span>
                                            )}
                                        </div>
                                        
                                        <p className="text-[1.05rem] font-bold text-[#111111] mb-4 leading-relaxed">
                                            {caseItem.description}
                                        </p>

                                        <div className="flex flex-wrap gap-4 text-[0.85rem] font-bold text-[#555555] bg-[#F7F7F7] p-3 rounded-lg border border-[#E5E7EB]">
                                            <span className="flex items-center gap-1"><MapPin size={14} className="text-[#00A9F7]" /> {caseItem.address}</span>
                                            <span>{currentT.lbl_cat}: {caseItem.category}</span>
                                            <span>Reporter: {caseItem.reporterName || 'Anonymous'}</span>
                                        </div>

                                        {caseItem.mediaUrl && (
                                            <div className="mt-4">
                                                <a href={caseItem.mediaUrl} target="_blank" rel="noopener noreferrer" className="relative group rounded-xl overflow-hidden border border-[#E5E7EB] inline-block h-32 w-32 bg-[#F7F7F7]">
                                                    <img src={caseItem.mediaUrl} alt="Report Evidence" className="w-full h-full object-cover group-hover:opacity-75 transition-opacity" />
                                                    <div className="absolute inset-x-0 bottom-0 bg-[#111111]/80 text-[#FFFFFF] text-[0.65rem] font-bold px-2 py-1 text-center truncate">Evidence</div>
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col items-end justify-center min-w-[200px] border-t lg:border-t-0 lg:border-l border-[#E5E7EB] pt-6 lg:pt-0 lg:pl-8">
                                        <button
                                            onClick={() => handleMergeCase(caseItem.id)}
                                            disabled={isUpdating}
                                            className="w-full bg-[#FFFFFF] text-[#111111] border border-[#E5E7EB] py-4 rounded-xl font-bold text-[0.95rem] flex items-center justify-center gap-2 hover:border-[#111111] transition-colors outline-none disabled:opacity-50"
                                        >
                                            <Merge size={16} /> {currentT.btn_merge}
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )
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