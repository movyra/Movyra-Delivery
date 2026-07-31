import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, orderBy, getDocs, doc, getDoc, updateDoc, serverTimestamp, arrayUnion, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { useCivicStore } from '../../store/useCivicStore';
import { 
    ArrowLeft, 
    X,
    Globe,
    ArrowUp,
    MapPin,
    AlertTriangle,
    CheckCircle,
    Building,
    ClipboardEdit,
    Send,
    Users,
    Clock,
    User,
    Trash2,
    Image as ImageIcon
} from 'lucide-react';

export default function SahayOrganization() {
    const navigate = useNavigate();
    
    // 1. STATE MANAGEMENT
    const theme = useCivicStore((state) => state.theme) || 'light'; 
    const terminateSession = useCivicStore((state) => state.terminateSession);

    const [lang, setLang] = useState('en');
    const [showLangPrompt, setShowLangPrompt] = useState(false);
    const [showProductsPrompt, setShowProductsPrompt] = useState(false);
    const [showSitemap, setShowSitemap] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [isAuthorized, setIsAuthorized] = useState(false);
    
    const [cases, setCases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('New'); 
    
    const [noteText, setNoteText] = useState('');
    const [activeNoteCaseId, setActiveNoteCaseId] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    // 2. AUTHENTICATION & ROLE VERIFICATION
    useEffect(() => {
        const sysLang = navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'hinglish', 'mr', 'gu', 'te', 'ta', 'pa', 'bho', 'ar', 'es', 'fr', 'de'];
        if (supported.includes(sysLang)) setLang(sysLang);

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user);
                
                // Strict Role-Based Access Control (RBAC)
                if (user.email === 'testcodecfg@gmail.com') {
                    setIsAuthorized(true);
                    fetchCases();
                } else {
                    try {
                        const userDoc = await getDoc(doc(db, 'sahay_users', user.uid));
                        if (userDoc.exists() && userDoc.data().role === 'Organization') {
                            setIsAuthorized(true);
                            fetchCases();
                        } else {
                            alert(currentT.err_auth);
                            navigate('/sahay');
                        }
                    } catch (error) {
                        console.error("Authorization check failed:", error);
                        navigate('/sahay');
                    }
                }
            } else {
                navigate('/sahay/auth');
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const fetchCases = async () => {
        setIsLoading(true);
        try {
            const casesRef = collection(db, 'sahay_cases');
            const q = query(casesRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            
            const records = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                privateNotes: doc.data().privateNotes || []
            }));
            
            setCases(records);
        } catch (error) {
            console.error("Failed to fetch cases:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // 3. OPERATIONAL LOGIC
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    const handleClaimCase = async (caseId) => {
        setIsUpdating(true);
        try {
            const caseRef = doc(db, 'sahay_cases', caseId);
            await updateDoc(caseRef, {
                status: 'Assigned',
                assignedToId: currentUser.uid,
                assignedAt: serverTimestamp()
            });

            setCases(cases.map(c => c.id === caseId ? { ...c, status: 'Assigned', assignedToId: currentUser.uid } : c));
        } catch (error) {
            console.error("Failed to claim case:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleResolveCase = async (caseId) => {
        setIsUpdating(true);
        try {
            const caseRef = doc(db, 'sahay_cases', caseId);
            await updateDoc(caseRef, {
                status: 'Closed',
                closedAt: serverTimestamp()
            });

            setCases(cases.map(c => c.id === caseId ? { ...c, status: 'Closed' } : c));
        } catch (error) {
            console.error("Failed to resolve case:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleAddNote = async (e, caseId) => {
        e.preventDefault();
        if (!noteText.trim()) return;
        setIsUpdating(true);
        
        try {
            const newNote = {
                text: noteText,
                authorId: currentUser.uid,
                timestamp: new Date().toISOString()
            };

            const caseRef = doc(db, 'sahay_cases', caseId);
            await updateDoc(caseRef, {
                privateNotes: arrayUnion(newNote)
            });

            setCases(cases.map(c => {
                if (c.id === caseId) {
                    return { ...c, privateNotes: [...c.privateNotes, newNote] };
                }
                return c;
            }));
            
            setNoteText('');
            setActiveNoteCaseId(null);
        } catch (error) {
            console.error("Failed to add note:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteCase = async (caseId) => {
        if (!window.confirm("Are you sure you want to permanently delete this report?")) return;
        
        setDeletingId(caseId);
        try {
            await deleteDoc(doc(db, 'sahay_cases', caseId));
            setCases(cases.filter(c => c.id !== caseId));
        } catch (error) {
            console.error("Deletion failed:", error);
            alert("Delete failed. Insufficient permissions.");
        } finally {
            setDeletingId(null);
        }
    };

    // Filtered Views
    const newCases = cases.filter(c => c.status === 'Reported' || c.status === 'Verified');
    const activeOperations = cases.filter(c => (c.status === 'Assigned' || c.status === 'In Progress') && c.assignedToId === currentUser?.uid);

    const displayCases = activeTab === 'New' ? newCases : activeOperations;

    const getSeverityBadge = (sev) => {
        if (sev === 'Critical') return 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]';
        if (sev === 'Urgent') return 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]';
        return 'bg-[#FF6B35]/10 text-[#FF6B35] border-[#FF6B35]';
    };

    // 4. 13-LANGUAGE DICTIONARY (Fully Translated, Professional)
    const t = {
        en: {
            lang: "English", careers: "Careers", products: "Products", back: "Back to Home", sitemap: "Sitemap", sitemap_desc: "Direct navigation to all Sahay modules.",
            title: "Partner Dashboard", sub: "Manage active rescues, dispatch help, and log operational notes.",
            tab_new: "New Requests", tab_active: "My Operations",
            btn_claim: "Accept Case", btn_resolve: "Mark as Resolved", btn_note: "Add Note", btn_cancel: "Cancel",
            lbl_desc: "Description", lbl_note_ph: "Type a private medical or rescue note...", loading: "Loading dashboard...",
            empty_new: "No new requests.", empty_active: "You have no active operations.",
            err_auth: "Unauthorized. Organization access required.",
            lbl_reporter: "Reporter", lbl_needy: "Person in Need", lbl_blood: "Blood Group", lbl_media: "Attached Evidence",
            sm_home: "Home Gateway", sm_report: "Submit Report", sm_cases: "Public Feed", sm_map: "Live Map", sm_org: "Partner Dashboard", sm_vol: "Volunteer Portal", sm_imp: "Impact Analytics", sm_emg: "Emergency Directory", sm_cont: "Contact & Inquiries", sm_abt: "About Mission", sm_auth: "Authentication", sm_adm: "Admin Console"
        },
        hi: {
            lang: "हिन्दी", careers: "करियर", products: "उत्पाद", back: "होम पर वापस जाएं", sitemap: "साइटमैप", sitemap_desc: "सभी सहाय मॉड्यूल पर सीधा नेविगेशन।",
            title: "पार्टनर डैशबोर्ड", sub: "सक्रिय बचाव का प्रबंधन करें, सहायता भेजें, और नोट्स लॉग करें।",
            tab_new: "नए अनुरोध", tab_active: "मेरे ऑपरेशंस",
            btn_claim: "केस स्वीकार करें", btn_resolve: "हल के रूप में चिह्नित करें", btn_note: "नोट जोड़ें", btn_cancel: "रद्द करें",
            lbl_desc: "विवरण", lbl_note_ph: "एक निजी चिकित्सा या बचाव नोट टाइप करें...", loading: "डैशबोर्ड लोड हो रहा है...",
            empty_new: "कोई नया अनुरोध नहीं।", empty_active: "आपके पास कोई सक्रिय ऑपरेशन नहीं है।",
            err_auth: "अनधिकृत। संगठन पहुंच आवश्यक है।",
            lbl_reporter: "रिपोर्टर", lbl_needy: "जरूरतमंद व्यक्ति", lbl_blood: "रक्त समूह", lbl_media: "संलग्न साक्ष्य",
            sm_home: "होम गेटवे", sm_report: "रिपोर्ट सबमिट करें", sm_cases: "सार्वजनिक फ़ीड", sm_map: "लाइव मानचित्र", sm_org: "पार्टनर डैशबोर्ड", sm_vol: "स्वयंसेवक पोर्टल", sm_imp: "प्रभाव विश्लेषिकी", sm_emg: "आपातकालीन निर्देशिका", sm_cont: "संपर्क और पूछताछ", sm_abt: "मिशन के बारे में", sm_auth: "प्रमाणीकरण", sm_adm: "एडमिन कंसोल"
        },
        hinglish: {
            lang: "Hinglish", careers: "Careers", products: "Products", back: "Home par wapas", sitemap: "Sitemap", sitemap_desc: "Sabhi Sahay modules ka direct navigation.",
            title: "Partner Dashboard", sub: "Active rescues manage karein, help bhejein, aur notes log karein.",
            tab_new: "New Requests", tab_active: "My Operations",
            btn_claim: "Case Accept Karein", btn_resolve: "Resolved Mark Karein", btn_note: "Note Add Karein", btn_cancel: "Cancel",
            lbl_desc: "Details", lbl_note_ph: "Ek private medical ya rescue note type karein...", loading: "Dashboard load ho raha hai...",
            empty_new: "Koi nayi request nahi.", empty_active: "Aapke paas koi active operation nahi hai.",
            err_auth: "Unauthorized. Organization access required hai.",
            lbl_reporter: "Reporter", lbl_needy: "Zarooratmand", lbl_blood: "Blood Group", lbl_media: "Attached Evidence",
            sm_home: "Home Gateway", sm_report: "Report Submit Karein", sm_cases: "Public Feed", sm_map: "Live Map", sm_org: "Partner Dashboard", sm_vol: "Volunteer Portal", sm_imp: "Impact Analytics", sm_emg: "Emergency Directory", sm_cont: "Contact aur Inquiries", sm_abt: "Mission ke baare mein", sm_auth: "Authentication", sm_adm: "Admin Console"
        },
        mr: {
            lang: "मराठी", careers: "करिअर", products: "उत्पादने", back: "मुख्यपृष्ठावर परत", sitemap: "साइटमॅप", sitemap_desc: "सर्व सहाय मॉड्यूल्ससाठी थेट नेव्हिगेशन.",
            title: "भागीदार डॅशबोर्ड", sub: "सक्रिय बचाव व्यवस्थापित करा, मदत पाठवा आणि नोट्स नोंदवा.",
            tab_new: "नवीन विनंत्या", tab_active: "माझे ऑपरेशन्स",
            btn_claim: "केस स्वीकारा", btn_resolve: "निराकरण म्हणून चिन्हांकित करा", btn_note: "नोट जोडा", btn_cancel: "रद्द करा",
            lbl_desc: "तपशील", lbl_note_ph: "खाजगी वैद्यकीय किंवा बचाव नोट टाइप करा...", loading: "डॅशबोर्ड लोड करत आहे...",
            empty_new: "कोणत्याही नवीन विनंत्या नाहीत.", empty_active: "तुमचे कोणतेही सक्रिय ऑपरेशन्स नाहीत.",
            err_auth: "अनधिकृत. संस्था प्रवेश आवश्यक आहे.",
            lbl_reporter: "अहवाल देणारा", lbl_needy: "गरजू व्यक्ती", lbl_blood: "रक्तगट", lbl_media: "संलग्न पुरावा",
            sm_home: "होम गेटवे", sm_report: "अहवाल सबमिट करा", sm_cases: "सार्वजनिक फीड", sm_map: "थेट नकाशा", sm_org: "भागीदार डॅशबोर्ड", sm_vol: "स्वयंसेवक पोर्टल", sm_imp: "प्रभाव विश्लेषण", sm_emg: "आपत्कालीन निर्देशिका", sm_cont: "संपर्क आणि चौकशी", sm_abt: "मिशन बद्दल", sm_auth: "प्रमाणीकरण", sm_adm: "प्रशासन कन्सोल"
        },
        gu: {
            lang: "ગુજરાતી", careers: "કારકિર્દી", products: "ઉત્પાદનો", back: "હોમ પર પાછા ફરો", sitemap: "સાઇટમેપ", sitemap_desc: "તમામ સહાય મોડ્યુલો માટે સીધું નેવિગેશન.",
            title: "ભાગીદાર ડેશબોર્ડ", sub: "સક્રિય બચાવનું સંચાલન કરો, મદદ મોકલો અને નોંધો લોગ કરો.",
            tab_new: "નવી વિનંતીઓ", tab_active: "મારી કામગીરી",
            btn_claim: "કેસ સ્વીકારો", btn_resolve: "ઉકેલાયેલ તરીકે ચિહ્નિત કરો", btn_note: "નોંધ ઉમેરો", btn_cancel: "રદ કરો",
            lbl_desc: "વિગતો", lbl_note_ph: "ખાનગી તબીબી અથવા બચાવ નોંધ લખો...", loading: "ડેશબોર્ડ લોડ થઈ રહ્યું છે...",
            empty_new: "કોઈ નવી વિનંતીઓ નથી.", empty_active: "તમારી પાસે કોઈ સક્રિય કામગીરી નથી.",
            err_auth: "અનધિકૃત. સંસ્થાની ઍક્સેસ આવશ્યક છે.",
            lbl_reporter: "રિપોર્ટર", lbl_needy: "જરૂરિયાતમંદ વ્યક્તિ", lbl_blood: "રક્ત જૂથ", lbl_media: "જોડાયેલ પુરાવા",
            sm_home: "હોમ ગેટવે", sm_report: "રિપોર્ટ સબમિટ કરો", sm_cases: "જાહેર ફીડ", sm_map: "જીવંત નકશો", sm_org: "ભાગીદાર ડેશબોર્ડ", sm_vol: "સ્વયંસેવક પોર્ટલ", sm_imp: "અસર એનાલિટિક્સ", sm_emg: "કટોકટી ડિરેક્ટરી", sm_cont: "સંપર્ક અને પૂછપરછ", sm_abt: "મિશન વિશે", sm_auth: "પ્રમાણીકરણ", sm_adm: "એડમિન કન્સોલ"
        },
        te: {
            lang: "తెలుగు", careers: "కెరీర్స్", products: "ఉత్పత్తులు", back: "హోమ్‌కు తిరిగి వెళ్లండి", sitemap: "సైట్‌మ్యాప్", sitemap_desc: "అన్ని సహాయ్ మాడ్యూల్స్‌కు ప్రత్యక్ష నావిగేషన్.",
            title: "భాగస్వామి డాష్‌బోర్డ్", sub: "క్రియాశీల రక్షణలను నిర్వహించండి, సహాయాన్ని పంపండి మరియు గమనికలను లాగ్ చేయండి.",
            tab_new: "కొత్త అభ్యర్థనలు", tab_active: "నా కార్యకలాపాలు",
            btn_claim: "కేసును అంగీకరించండి", btn_resolve: "పరిష్కరించబడినట్లుగా గుర్తించండి", btn_note: "గమనికను జోడించండి", btn_cancel: "రద్దు చేయండి",
            lbl_desc: "వివరాలు", lbl_note_ph: "ప్రైవేట్ వైద్య లేదా రెస్క్యూ నోట్‌ను టైప్ చేయండి...", loading: "డాష్‌బోర్డ్ లోడ్ అవుతోంది...",
            empty_new: "కొత్త అభ్యర్థనలు లేవు.", empty_active: "మీకు క్రియాశీల కార్యకలాపాలు లేవు.",
            err_auth: "అనధికారికం. సంస్థ యాక్సెస్ అవసరం.",
            lbl_reporter: "రిపోర్టర్", lbl_needy: "అవసరమైన వ్యక్తి", lbl_blood: "రక్త వర్గం", lbl_media: "జోడించిన సాక్ష్యం",
            sm_home: "హోమ్ గేట్‌వే", sm_report: "నివేదిక సమర్పించండి", sm_cases: "పబ్లిక్ ఫీడ్", sm_map: "లైవ్ మ్యాప్", sm_org: "భాగస్వామి డాష్‌బోర్డ్", sm_vol: "వాలంటీర్ పోర్టల్", sm_imp: "ఇంపాక్ట్ అనలిటిక్స్", sm_emg: "అత్యవసర డైరెక్టరీ", sm_cont: "సంప్రదింపులు మరియు విచారణలు", sm_abt: "మిషన్ గురించి", sm_auth: "ప్రామాణీకరణ", sm_adm: "అడ్మిన్ కన్సోల్"
        },
        ta: {
            lang: "தமிழ்", careers: "தொழில்கள்", products: "தயாரிப்புகள்", back: "முகப்புக்குத் திரும்பு", sitemap: "தளத்தின் வரைபடம்", sitemap_desc: "அனைத்து சஹாய் தொகுதிகளுக்கும் நேரடி வழிசெலுத்தல்.",
            title: "கூட்டாளர் டாஷ்போர்டு", sub: "செயலில் உள்ள மீட்புகளை நிர்வகிக்கவும், உதவியை அனுப்பவும் மற்றும் குறிப்புகளை பதிவு செய்யவும்.",
            tab_new: "புதிய கோரிக்கைகள்", tab_active: "எனது செயல்பாடுகள்",
            btn_claim: "வழக்கை ஏற்கவும்", btn_resolve: "தீர்க்கப்பட்டதாகக் குறிக்கவும்", btn_note: "குறிப்பைச் சேர்", btn_cancel: "ரத்துசெய்",
            lbl_desc: "விவரங்கள்", lbl_note_ph: "ஒரு தனிப்பட்ட மருத்துவ அல்லது மீட்பு குறிப்பை தட்டச்சு செய்யவும்...", loading: "டாஷ்போர்டு ஏற்றப்படுகிறது...",
            empty_new: "புதிய கோரிக்கைகள் இல்லை.", empty_active: "உங்களுக்கு செயலில் உள்ள செயல்பாடுகள் எதுவும் இல்லை.",
            err_auth: "அங்கீகரிக்கப்படாதது. நிறுவன அணுகல் தேவை.",
            lbl_reporter: "நிருபர்", lbl_needy: "தேவையுள்ள நபர்", lbl_blood: "இரத்த வகை", lbl_media: "இணைக்கப்பட்ட சான்று",
            sm_home: "முகப்பு நுழைவாயில்", sm_report: "அறிக்கையை சமர்ப்பிக்கவும்", sm_cases: "பொது ஊட்டம்", sm_map: "நேரடி வரைபடம்", sm_org: "கூட்டாளர் டாஷ்போர்டு", sm_vol: "தன்னார்வ போர்டல்", sm_imp: "தாக்க பகுப்பாய்வு", sm_emg: "அவசர அடைவு", sm_cont: "தொடர்பு மற்றும் விசாரணைகள்", sm_abt: "பணி பற்றி", sm_auth: "அங்கீகாரம்", sm_adm: "நிர்வாக கன்சோல்"
        },
        pa: {
            lang: "ਪੰਜਾਬੀ", careers: "ਕਰੀਅਰ", products: "ਉਤਪਾਦ", back: "ਹੋਮ 'ਤੇ ਵਾਪਸ", sitemap: "ਸਾਈਟਮੈਪ", sitemap_desc: "ਸਾਰੇ ਸਹਾਏ ਮੋਡਿਊਲਾਂ ਲਈ ਸਿੱਧੀ ਨੈਵੀਗੇਸ਼ਨ।",
            title: "ਪਾਰਟਨਰ ਡੈਸ਼ਬੋਰਡ", sub: "ਸਰਗਰਮ ਬਚਾਅ ਕਾਰਜਾਂ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ, ਮਦਦ ਭੇਜੋ, ਅਤੇ ਨੋਟਸ ਲੌਗ ਕਰੋ।",
            tab_new: "ਨਵੀਆਂ ਬੇਨਤੀਆਂ", tab_active: "ਮੇਰੇ ਓਪਰੇਸ਼ਨ",
            btn_claim: "ਕੇਸ ਸਵੀਕਾਰ ਕਰੋ", btn_resolve: "ਹੱਲ ਕੀਤੇ ਵਜੋਂ ਨਿਸ਼ਾਨਬੱਧ ਕਰੋ", btn_note: "ਨੋਟ ਸ਼ਾਮਲ ਕਰੋ", btn_cancel: "ਰੱਦ ਕਰੋ",
            lbl_desc: "ਵੇਰਵੇ", lbl_note_ph: "ਇੱਕ ਨਿੱਜੀ ਮੈਡੀਕਲ ਜਾਂ ਬਚਾਅ ਨੋਟ ਟਾਈਪ ਕਰੋ...", loading: "ਡੈਸ਼ਬੋਰਡ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...",
            empty_new: "ਕੋਈ ਨਵੀਆਂ ਬੇਨਤੀਆਂ ਨਹੀਂ।", empty_active: "ਤੁਹਾਡੇ ਕੋਲ ਕੋਈ ਸਰਗਰਮ ਕਾਰਜ ਨਹੀਂ ਹੈ।",
            err_auth: "ਅਣਅਧਿਕਾਰਤ। ਸੰਗਠਨ ਦੀ ਪਹੁੰਚ ਜ਼ਰੂਰੀ ਹੈ।",
            lbl_reporter: "ਰਿਪੋਰਟਰ", lbl_needy: "ਲੋੜਵੰਦ ਵਿਅਕਤੀ", lbl_blood: "ਬਲੱਡ ਗਰੁੱਪ", lbl_media: "ਨੱਥੀ ਸਬੂਤ",
            sm_home: "ਹੋਮ ਗੇਟਵੇ", sm_report: "ਰਿਪੋਰਟ ਦਰਜ ਕਰੋ", sm_cases: "ਜਨਤਕ ਫੀਡ", sm_map: "ਲਾਈਵ ਨਕਸ਼ਾ", sm_org: "ਪਾਰਟਨਰ ਡੈਸ਼ਬੋਰਡ", sm_vol: "ਵਲੰਟੀਅਰ ਪੋਰਟਲ", sm_imp: "ਪ੍ਰਭਾਵ ਵਿਸ਼ਲੇਸ਼ਣ", sm_emg: "ਐਮਰਜੈਂਸੀ ਡਾਇਰੈਕਟਰੀ", sm_cont: "ਸੰਪਰਕ ਅਤੇ ਪੁੱਛਗਿੱਛ", sm_abt: "ਮਿਸ਼ਨ ਬਾਰੇ", sm_auth: "ਪ੍ਰਮਾਣਿਕਤਾ", sm_adm: "ਐਡਮਿਨ ਕੰਸੋਲ"
        },
        bho: {
            lang: "भोजपुरी", careers: "करियर", products: "उत्पाद", back: "होम पर वापस", sitemap: "साइटमैप", sitemap_desc: "सब सहाय मॉड्यूल पर सीधा नेविगेशन।",
            title: "पार्टनर डैशबोर्ड", sub: "सक्रिय बचाव के प्रबंधन करीं, मदद भेजीं, आ नोट लॉग करीं।",
            tab_new: "नया अनुरोध", tab_active: "हमार ऑपरेशंस",
            btn_claim: "केस स्वीकार करीं", btn_resolve: "हल के रूप में चिह्नित करीं", btn_note: "नोट जोड़ीं", btn_cancel: "रद्द करीं",
            lbl_desc: "विवरण", lbl_note_ph: "एगो निजी मेडिकल भा बचाव नोट टाइप करीं...", loading: "डैशबोर्ड लोड हो रहल बा...",
            empty_new: "कवनो नया अनुरोध नईखे।", empty_active: "रउरा पास कवनो सक्रिय ऑपरेशन नईखे।",
            err_auth: "अनधिकृत। संगठन के पहुँच जरूरी बा।",
            lbl_reporter: "रिपोर्टर", lbl_needy: "जरूरतमंद व्यक्ति", lbl_blood: "रक्त समूह", lbl_media: "संलग्न साक्ष्य",
            sm_home: "होम गेटवे", sm_report: "रिपोर्ट सबमिट करीं", sm_cases: "सार्वजनिक फीड", sm_map: "लाइव नक्शा", sm_org: "पार्टनर डैशबोर्ड", sm_vol: "स्वयंसेवक पोर्टल", sm_imp: "प्रभाव विश्लेषिकी", sm_emg: "आपातकालीन निर्देशिका", sm_cont: "संपर्क आ पूछताछ", sm_abt: "मिशन के बारे में", sm_auth: "प्रमाणीकरण", sm_adm: "एडमिन कंसोल"
        },
        ar: {
            lang: "العربية", careers: "الوظائف", products: "المنتجات", back: "العودة إلى الصفحة الرئيسية", sitemap: "خريطة الموقع", sitemap_desc: "التنقل المباشر لجميع وحدات ساهاي.",
            title: "لوحة تحكم الشريك", sub: "إدارة عمليات الإنقاذ النشطة، إرسال المساعدة، وتسجيل الملاحظات.",
            tab_new: "الطلبات الجديدة", tab_active: "عملياتي",
            btn_claim: "قبول الحالة", btn_resolve: "وضع علامة كمنجز", btn_note: "إضافة ملاحظة", btn_cancel: "إلغاء",
            lbl_desc: "التفاصيل", lbl_note_ph: "اكتب ملاحظة طبية أو إنقاذ خاصة...", loading: "جاري تحميل لوحة التحكم...",
            empty_new: "لا توجد طلبات جديدة.", empty_active: "ليس لديك عمليات نشطة.",
            err_auth: "غير مصرح به. مطلوب وصول المنظمة.",
            lbl_reporter: "المراسل", lbl_needy: "الشخص المحتاج", lbl_blood: "فصيلة الدم", lbl_media: "الأدلة المرفقة",
            sm_home: "البوابة الرئيسية", sm_report: "إرسال تقرير", sm_cases: "الخلاصة العامة", sm_map: "خريطة حية", sm_org: "لوحة تحكم الشريك", sm_vol: "بوابة المتطوعين", sm_imp: "تحليلات التأثير", sm_emg: "دليل الطوارئ", sm_cont: "الاتصال والاستفسارات", sm_abt: "حول المهمة", sm_auth: "المصادقة", sm_adm: "وحدة تحكم الإدارة"
        },
        es: {
            lang: "Español", careers: "Carreras", products: "Productos", back: "Volver a Inicio", sitemap: "Mapa del sitio", sitemap_desc: "Navegación directa a todos los módulos de Sahay.",
            title: "Panel de Socios", sub: "Gestione rescates activos, envíe ayuda y registre notas.",
            tab_new: "Nuevas Solicitudes", tab_active: "Mis Operaciones",
            btn_claim: "Aceptar Caso", btn_resolve: "Marcar como Resuelto", btn_note: "Añadir Nota", btn_cancel: "Cancelar",
            lbl_desc: "Detalles", lbl_note_ph: "Escriba una nota médica o de rescate privada...", loading: "Cargando panel...",
            empty_new: "No hay nuevas solicitudes.", empty_active: "No tiene operaciones activas.",
            err_auth: "No autorizado. Se requiere acceso de organización.",
            lbl_reporter: "Reportero", lbl_needy: "Persona Necesitada", lbl_blood: "Grupo Sanguíneo", lbl_media: "Evidencia Adjunta",
            sm_home: "Portal de Inicio", sm_report: "Enviar Reporte", sm_cases: "Feed Público", sm_map: "Mapa en Vivo", sm_org: "Panel de Socios", sm_vol: "Portal de Voluntarios", sm_imp: "Análisis de Impacto", sm_emg: "Directorio de Emergencia", sm_cont: "Contacto", sm_abt: "Acerca de la Misión", sm_auth: "Autenticación", sm_adm: "Consola de Administración"
        },
        fr: {
            lang: "Français", careers: "Carrières", products: "Produits", back: "Retour à l'accueil", sitemap: "Plan du site", sitemap_desc: "Navigation directe vers tous les modules Sahay.",
            title: "Tableau de Bord Partenaire", sub: "Gérez les sauvetages actifs, envoyez de l'aide et enregistrez des notes.",
            tab_new: "Nouvelles Demandes", tab_active: "Mes Opérations",
            btn_claim: "Accepter le Cas", btn_resolve: "Marquer comme Résolu", btn_note: "Ajouter une Note", btn_cancel: "Annuler",
            lbl_desc: "Détails", lbl_note_ph: "Tapez une note médicale ou de sauvetage privée...", loading: "Chargement du tableau de bord...",
            empty_new: "Pas de nouvelles demandes.", empty_active: "Vous n'avez aucune opération active.",
            err_auth: "Non autorisé. Accès organisation requis.",
            lbl_reporter: "Signaleur", lbl_needy: "Personne dans le Besoin", lbl_blood: "Groupe Sanguin", lbl_media: "Preuve Jointe",
            sm_home: "Portail d'Accueil", sm_report: "Soumettre un Rapport", sm_cases: "Flux Public", sm_map: "Carte en Direct", sm_org: "Tableau de Bord", sm_vol: "Portail Bénévole", sm_imp: "Analyse d'Impact", sm_emg: "Annuaire d'Urgence", sm_cont: "Contact", sm_abt: "À Propos", sm_auth: "Authentification", sm_adm: "Console d'Administration"
        },
        de: {
            lang: "Deutsch", careers: "Karriere", products: "Produkte", back: "Zurück zur Startseite", sitemap: "Seitenverzeichnis", sitemap_desc: "Direkte Navigation zu allen Sahay-Modulen.",
            title: "Partner-Dashboard", sub: "Verwalten Sie aktive Rettungen, senden Sie Hilfe und protokollieren Sie Notizen.",
            tab_new: "Neue Anfragen", tab_active: "Meine Operationen",
            btn_claim: "Fall Akzeptieren", btn_resolve: "Als Gelöst Markieren", btn_note: "Notiz Hinzufügen", btn_cancel: "Abbrechen",
            lbl_desc: "Details", lbl_note_ph: "Geben Sie eine private medizinische oder Rettungsnotiz ein...", loading: "Dashboard wird geladen...",
            empty_new: "Keine neuen Anfragen.", empty_active: "Sie haben keine aktiven Operationen.",
            err_auth: "Nicht autorisiert. Organisationszugriff erforderlich.",
            lbl_reporter: "Melder", lbl_needy: "Bedürftige Person", lbl_blood: "Blutgruppe", lbl_media: "Angehängter Beweis",
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

    if (!isAuthorized) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFFFF] text-[#111111]">
                <div className="w-8 h-8 border-2 border-t-transparent border-[#16A34A] rounded-full animate-spin mb-4"></div>
                <p className="font-bold text-[#555555]">Verifying access permissions...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen font-sans overflow-x-hidden flex flex-col relative bg-[#FFFFFF] text-[#111111] selection:bg-[#16A34A] selection:text-white">
            
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
                        <button 
                            onClick={() => navigate('/sahay/profile')} 
                            className="p-2 rounded-full bg-[#F7F7F7] text-[#111111] border border-[#E5E7EB] hover:border-[#111111] hover:bg-[#E5E7EB] transition-colors outline-none flex items-center justify-center"
                        >
                            <User size={18} />
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
                                        className="p-4 bg-[#F7F7F7] border border-[#E5E7EB] rounded-xl font-bold text-[#111111] hover:border-[#16A34A] hover:text-[#16A34A] transition-colors flex items-center justify-between group outline-none"
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
                                        className={`w-full p-4 rounded-xl flex items-center justify-between transition-colors border outline-none ${lang === option.code ? 'bg-[#16A34A]/10 border-[#16A34A] text-[#16A34A]' : 'bg-[#F7F7F7] border-[#E5E7EB] text-[#555555] hover:border-[#111111] hover:text-[#111111]'}`}
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
                
                <div className="flex items-center justify-between mb-8">
                    <button onClick={() => navigate('/sahay')} className="flex items-center gap-2 outline-none font-bold text-[0.9rem] text-[#555555] hover:text-[#111111] transition-colors self-start">
                        <ArrowLeft size={16} /> {currentT.back}
                    </button>
                    {currentUser && currentUser.email === 'testcodecfg@gmail.com' && (
                         <span className="text-[#DC2626] font-black text-[0.8rem] uppercase tracking-wider bg-[#DC2626]/10 px-3 py-1 rounded-full">Super Admin</span>
                    )}
                </div>

                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-4 text-[#16A34A]">
                        <Building size={28} />
                    </div>
                    <h1 className="text-[2.5rem] md:text-[3.5rem] font-black leading-[1.1] tracking-tighter mb-4 text-[#111111]">
                        {currentT.title}
                    </h1>
                    <p className="text-[1.1rem] text-[#555555] font-medium">
                        {currentT.sub}
                    </p>
                </div>

                {/* Dashboard Tabs */}
                <div className="flex gap-4 mb-8 border-b border-[#E5E7EB]">
                    <button 
                        onClick={() => setActiveTab('New')}
                        className={`pb-4 px-2 font-black text-[1.1rem] outline-none transition-colors relative ${activeTab === 'New' ? 'text-[#111111]' : 'text-[#555555] hover:text-[#111111]'}`}
                    >
                        {currentT.tab_new}
                        {activeTab === 'New' && <motion.div layoutId="tabIndicator" className="absolute bottom-0 left-0 right-0 h-1 bg-[#111111]" />}
                    </button>
                    <button 
                        onClick={() => setActiveTab('Active')}
                        className={`pb-4 px-2 font-black text-[1.1rem] outline-none transition-colors relative ${activeTab === 'Active' ? 'text-[#111111]' : 'text-[#555555] hover:text-[#111111]'}`}
                    >
                        {currentT.tab_active}
                        {activeTab === 'Active' && <motion.div layoutId="tabIndicator" className="absolute bottom-0 left-0 right-0 h-1 bg-[#111111]" />}
                    </button>
                </div>

                {/* Dashboard Feed */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-t-transparent border-[#16A34A] rounded-full animate-spin mb-4"></div>
                        <span className="text-[0.9rem] font-bold text-[#555555]">{currentT.loading}</span>
                    </div>
                ) : displayCases.length === 0 ? (
                    <div className="rounded-3xl p-12 text-center border border-dashed border-[#D1D5DB] bg-[#F7F7F7] flex flex-col items-center justify-center">
                        <CheckCircle size={48} className="mb-6 text-[#D1D5DB]" />
                        <h2 className="text-[1.5rem] font-black tracking-tight mb-2 text-[#111111]">
                            {activeTab === 'New' ? currentT.empty_new : currentT.empty_active}
                        </h2>
                    </div>
                ) : (
                    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="flex flex-col gap-6">
                        {displayCases.map((caseItem) => {
                            const dateString = caseItem.createdAt ? caseItem.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent';
                            const confirmCount = caseItem.confirmedBy ? caseItem.confirmedBy.length : 0;
                            const isNoteOpen = activeNoteCaseId === caseItem.id;

                            return (
                                <motion.div 
                                    variants={itemVariants} 
                                    key={caseItem.id} 
                                    className="rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] overflow-hidden shadow-sm"
                                >
                                    <div className="p-6 md:p-8 flex flex-col lg:flex-row justify-between gap-10">
                                        
                                        {/* Main Details Panel */}
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-3 mb-6">
                                                <span className="px-3 py-1 bg-[#111111] text-[#FFFFFF] text-[0.75rem] font-black tracking-wider uppercase rounded-full">
                                                    {caseItem.category}
                                                </span>
                                                <span className={`px-3 py-1 text-[0.75rem] font-black tracking-wider uppercase rounded-full border ${getSeverityBadge(caseItem.severity)}`}>
                                                    {caseItem.severity}
                                                </span>
                                                {confirmCount > 0 && (
                                                    <span className="px-3 py-1 bg-[#F7F7F7] text-[#555555] border border-[#E5E7EB] text-[0.75rem] font-bold rounded-full flex items-center gap-1">
                                                        <Users size={12}/> {confirmCount} confirms
                                                    </span>
                                                )}
                                                <span className="ml-auto md:ml-0 px-3 py-1 bg-[#F7F7F7] border border-[#E5E7EB] text-[#111111] font-bold text-[0.75rem] rounded-full flex items-center gap-1">
                                                    <Clock size={12} /> {dateString}
                                                </span>
                                            </div>

                                            {/* Data Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 bg-[#F7F7F7] p-6 rounded-2xl border border-[#E5E7EB]">
                                                <div>
                                                    <p className="text-[0.75rem] font-bold text-[#888888] uppercase tracking-wider mb-1">{currentT.lbl_reporter}</p>
                                                    <p className="text-[0.95rem] font-bold text-[#111111]">{caseItem.reporterName || 'Anonymous'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[0.75rem] font-bold text-[#888888] uppercase tracking-wider mb-1">{currentT.lbl_needy}</p>
                                                    <p className="text-[0.95rem] font-bold text-[#111111]">{caseItem.needyName || 'Unknown'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[0.75rem] font-bold text-[#888888] uppercase tracking-wider mb-1">{currentT.lbl_blood}</p>
                                                    <p className="text-[0.95rem] font-bold text-[#111111]">{caseItem.bloodGroup || 'Not Provided'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[0.75rem] font-bold text-[#888888] uppercase tracking-wider mb-1">Status</p>
                                                    <p className="text-[0.95rem] font-bold text-[#111111]">{caseItem.status}</p>
                                                </div>
                                                <div className="md:col-span-2 border-t border-[#E5E7EB] pt-4 mt-2">
                                                    <p className="text-[0.75rem] font-bold text-[#888888] uppercase tracking-wider mb-2 flex items-center gap-1"><MapPin size={12}/> Location</p>
                                                    <p className="text-[0.95rem] font-bold text-[#111111] leading-relaxed">{caseItem.address}</p>
                                                </div>
                                                <div className="md:col-span-2 border-t border-[#E5E7EB] pt-4 mt-2">
                                                    <p className="text-[0.75rem] font-bold text-[#888888] uppercase tracking-wider mb-2">{currentT.lbl_desc}</p>
                                                    <p className="text-[0.95rem] font-bold text-[#111111] leading-relaxed bg-[#FFFFFF] p-4 rounded-xl border border-[#E5E7EB]">
                                                        {caseItem.description}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Media Gallery */}
                                            {(caseItem.mediaUrl || caseItem.acceptanceNeedyPhotoUrl || caseItem.volunteerPhotoUrl) && (
                                                <div className="mb-6">
                                                    <p className="text-[0.8rem] font-bold text-[#555555] uppercase tracking-wider mb-3 flex items-center gap-2">
                                                        <ImageIcon size={14} /> {currentT.lbl_media}
                                                    </p>
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                                        {caseItem.mediaUrl && (
                                                            <div className="relative group rounded-xl overflow-hidden border border-[#E5E7EB] aspect-square bg-[#F7F7F7]">
                                                                <img src={caseItem.mediaUrl} alt="Initial Report" className="w-full h-full object-cover" />
                                                                <div className="absolute inset-x-0 bottom-0 bg-[#111111]/80 text-[#FFFFFF] text-[0.7rem] font-bold px-2 py-1 text-center truncate">Reported</div>
                                                            </div>
                                                        )}
                                                        {caseItem.acceptanceNeedyPhotoUrl && (
                                                            <div className="relative group rounded-xl overflow-hidden border border-[#E5E7EB] aspect-square bg-[#F7F7F7]">
                                                                <img src={caseItem.acceptanceNeedyPhotoUrl} alt="Verified Person" className="w-full h-full object-cover" />
                                                                <div className="absolute inset-x-0 bottom-0 bg-[#111111]/80 text-[#FFFFFF] text-[0.7rem] font-bold px-2 py-1 text-center truncate">Verified Needy</div>
                                                            </div>
                                                        )}
                                                        {caseItem.volunteerPhotoUrl && (
                                                            <div className="relative group rounded-xl overflow-hidden border border-[#E5E7EB] aspect-square bg-[#F7F7F7]">
                                                                <img src={caseItem.volunteerPhotoUrl} alt="Assigned Volunteer" className="w-full h-full object-cover" />
                                                                <div className="absolute inset-x-0 bottom-0 bg-[#111111]/80 text-[#FFFFFF] text-[0.7rem] font-bold px-2 py-1 text-center truncate">Assigned Volunteer</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Private Notes Section (Visible only in Active Tab) */}
                                            {activeTab === 'Active' && caseItem.privateNotes.length > 0 && (
                                                <div className="mb-6 pt-6 border-t border-[#E5E7EB]">
                                                    <h4 className="text-[0.8rem] font-bold uppercase tracking-wider text-[#555555] mb-3">Internal Operational Notes</h4>
                                                    <div className="flex flex-col gap-3">
                                                        {caseItem.privateNotes.map((note, idx) => (
                                                            <div key={idx} className="bg-[#16A34A]/5 border border-[#16A34A]/20 p-4 rounded-xl text-[0.95rem] text-[#111111] font-medium">
                                                                {note.text}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Sidebar */}
                                        <div className="flex flex-col items-stretch justify-start gap-3 w-full lg:w-[220px] shrink-0 border-t lg:border-t-0 lg:border-l border-[#E5E7EB] pt-6 lg:pt-0 lg:pl-8">
                                            {activeTab === 'New' ? (
                                                <button
                                                    onClick={() => handleClaimCase(caseItem.id)}
                                                    disabled={isUpdating}
                                                    className="w-full bg-[#111111] text-[#FFFFFF] px-4 py-4 rounded-xl font-bold text-[0.95rem] hover:bg-[#333333] transition-colors outline-none disabled:opacity-50"
                                                >
                                                    {currentT.btn_claim}
                                                </button>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleResolveCase(caseItem.id)}
                                                        disabled={isUpdating}
                                                        className="w-full bg-[#16A34A] text-[#FFFFFF] px-4 py-4 rounded-xl font-bold text-[0.95rem] flex items-center justify-center gap-2 hover:bg-[#15803D] transition-colors outline-none disabled:opacity-50"
                                                    >
                                                        <CheckCircle size={16} /> {currentT.btn_resolve}
                                                    </button>
                                                    
                                                    {!isNoteOpen && (
                                                        <button
                                                            onClick={() => setActiveNoteCaseId(caseItem.id)}
                                                            className="w-full bg-[#FFFFFF] text-[#111111] border border-[#E5E7EB] px-4 py-4 rounded-xl font-bold text-[0.95rem] flex items-center justify-center gap-2 hover:border-[#111111] transition-colors outline-none"
                                                        >
                                                            <ClipboardEdit size={16} /> {currentT.btn_note}
                                                        </button>
                                                    )}
                                                </>
                                            )}

                                            {currentUser && currentUser.email === 'testcodecfg@gmail.com' && (
                                                <button
                                                    onClick={() => handleDeleteCase(caseItem.id)}
                                                    disabled={deletingId === caseItem.id}
                                                    className="w-full mt-auto bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626] px-4 py-4 rounded-xl font-bold text-[0.95rem] flex items-center justify-center gap-2 hover:bg-[#DC2626] hover:text-[#FFFFFF] transition-colors outline-none disabled:opacity-50"
                                                >
                                                    {deletingId === caseItem.id ? (
                                                        <div className="w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin"></div>
                                                    ) : (
                                                        <Trash2 size={16} />
                                                    )}
                                                    Delete Case
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Note Input Drawer */}
                                    <AnimatePresence>
                                        {isNoteOpen && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t border-[#E5E7EB] bg-[#F7F7F7]"
                                            >
                                                <form onSubmit={(e) => handleAddNote(e, caseItem.id)} className="p-6 md:p-8 flex flex-col gap-4">
                                                    <textarea 
                                                        autoFocus
                                                        required
                                                        rows="3"
                                                        placeholder={currentT.lbl_note_ph}
                                                        value={noteText}
                                                        onChange={(e) => setNoteText(e.target.value)}
                                                        className="w-full p-4 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] text-[#111111] font-medium text-[0.95rem] outline-none focus:border-[#111111] transition-colors resize-none shadow-sm"
                                                    ></textarea>
                                                    <div className="flex items-center justify-end gap-3">
                                                        <button 
                                                            type="button"
                                                            onClick={() => { setActiveNoteCaseId(null); setNoteText(''); }}
                                                            className="px-6 py-3 rounded-xl font-bold text-[0.9rem] text-[#555555] hover:bg-[#E5E7EB] transition-colors outline-none"
                                                        >
                                                            {currentT.btn_cancel}
                                                        </button>
                                                        <button 
                                                            type="submit"
                                                            disabled={isUpdating || !noteText.trim()}
                                                            className="bg-[#111111] text-[#FFFFFF] px-8 py-3 rounded-xl font-bold text-[0.9rem] flex items-center gap-2 hover:bg-[#333333] transition-colors disabled:opacity-50 outline-none shadow-md"
                                                        >
                                                            <Send size={14} /> {currentT.btn_note}
                                                        </button>
                                                    </div>
                                                </form>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
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