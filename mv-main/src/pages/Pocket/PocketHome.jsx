import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { useCivicStore } from '../../store/useCivicStore';
import { 
    Moon, Sun, Globe, LogOut, X, 
    FileText, Scan, FileCode, QrCode, Link as LinkIcon,
    Mic, Key, Share2, Scale, Calculator, 
    FolderOpen, ShieldAlert, Users, Bot, ArrowUp, ShieldCheck, WifiOff
} from 'lucide-react';

export default function PocketHome() {
    const navigate = useNavigate();
    const auth = getAuth();
    
    // 1. STATE MANAGEMENT
    const globalTheme = useCivicStore((state) => state.theme) || 'light';
    const setTheme = useCivicStore((state) => state.setTheme);
    const terminateSession = useCivicStore((state) => state.terminateSession);

    // FORCE LOCAL THEME STATE TO BYPASS ZUSTAND DELAYS
    const [localTheme, setLocalTheme] = useState(globalTheme);
    const [lang, setLang] = useState('en');
    const [showLangPrompt, setShowLangPrompt] = useState(false);
    const [showProductsPrompt, setShowProductsPrompt] = useState(false);
    const [showSitemap, setShowSitemap] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // 2. AUTHENTICATION & INITIALIZATION
    useEffect(() => {
        const sysLang = navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'hinglish', 'mr', 'gu', 'te', 'ta', 'pa', 'bho', 'ar', 'es', 'fr', 'de'];
        if (supported.includes(sysLang)) setLang(sysLang);

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });

        // Initialize DOM strictly based on localTheme
        if (localTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        return () => unsubscribe();
    }, [auth, localTheme]);

    // 3. FUNCTIONAL LOGIC
    const handleSignOut = async () => {
        try {
            await signOut(auth);
            terminateSession();
            navigate('/pocket/auth');
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const toggleTheme = () => {
        const newTheme = localTheme === 'light' ? 'dark' : 'light';
        // Immediately mutate local state and DOM for instant feedback
        setLocalTheme(newTheme);
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        // Sync with global store in background
        if (setTheme) {
            setTheme(newTheme);
        }
    };

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    // 4. DICTIONARY & CONTENT (13 Languages, Simple Terms)
    const t = {
        en: {
            lang: "English", log_out: "Log out", sign_in: "Sign In", products: "Products", careers: "Careers", sitemap: "Sitemap",
            hero_title: "Everyday tools.", hero_title_2: "One secure place.", hero_sub: "A private digital toolbox for your daily tasks.",
            cat_work: "Work & Study", cat_links: "Smart Links", cat_math: "Math & Measures", cat_files: "Storage & Sharing", cat_sec: "Security Hub", cat_safe: "Family & Safety",
            t_notes: "Smart Notes", t_notes_sub: "Write, translate, and organize.",
            t_scan: "Document Scanner", t_scan_sub: "Digitize ID cards instantly.",
            t_pdf: "PDF Toolkit", t_pdf_sub: "Merge, compress, and edit.",
            t_qrg: "QR Generator", t_qrg_sub: "Create custom QR codes.",
            t_qrs: "QR Scanner", t_qrs_sub: "Scan and detect links safely.",
            t_calc: "Calculator", t_calc_sub: "Standard and tax calculations.",
            t_unit: "Unit Converter", t_unit_sub: "Convert land, weight, and currency.",
            t_doc: "Document Organizer", t_doc_sub: "Secure digital locker.",
            t_voice: "Voice Notes", t_voice_sub: "Record and transcribe audio.",
            t_share: "File Sharing", t_share_sub: "Send files securely.",
            t_pass: "Password Manager", t_pass_sub: "Store credentials safely.",
            t_ai: "AI Helper", t_ai_sub: "Summarize and explain documents.",
            t_emg: "Emergency Card", t_emg_sub: "Medical and contact details.",
            t_fam: "Family Locker", t_emg_fam: "Shared secure storage.",
            why_title: "Why use Pocket?", why_sub: "Built for speed, privacy, and simplicity.",
            why_1_title: "Zero Ads", why_1_sub: "No tracking, no distractions.",
            why_2_title: "Offline Ready", why_2_sub: "Works without an internet connection.",
            why_3_title: "Bank-Grade Security", why_3_sub: "Your data is encrypted and private.",
            why_4_title: "AI Powered", why_4_sub: "Smart tools to save you time."
        },
        hi: {
            lang: "हिन्दी", log_out: "लॉग आउट", sign_in: "साइन इन", products: "उत्पाद", careers: "करियर", sitemap: "साइटमैप",
            hero_title: "रोजमर्रा के उपकरण।", hero_title_2: "एक सुरक्षित जगह।", hero_sub: "आपके दैनिक कार्यों के लिए एक निजी डिजिटल टूलबॉक्स।",
            cat_work: "काम और पढ़ाई", cat_links: "स्मार्ट लिंक", cat_math: "गणित और माप", cat_files: "स्टोरेज और शेयरिंग", cat_sec: "सुरक्षा हब", cat_safe: "परिवार और सुरक्षा",
            t_notes: "स्मार्ट नोट्स", t_notes_sub: "लिखें, अनुवाद करें और व्यवस्थित करें।",
            t_scan: "दस्तावेज़ स्कैनर", t_scan_sub: "आईडी कार्ड को तुरंत डिजिटल बनाएं।",
            t_pdf: "पीडीएफ टूलकिट", t_pdf_sub: "मर्ज करें, छोटा करें और संपादित करें।",
            t_qrg: "क्यूआर जेनरेटर", t_qrg_sub: "कस्टम क्यूआर कोड बनाएं।",
            t_qrs: "क्यूआर स्कैनर", t_qrs_sub: "लिंक को सुरक्षित रूप से स्कैन करें।",
            t_calc: "कैलकुलेटर", t_calc_sub: "मानक और कर गणना।",
            t_unit: "इकाई कनवर्टर", t_unit_sub: "भूमि, वजन और मुद्रा बदलें।",
            t_doc: "दस्तावेज़ आयोजक", t_doc_sub: "सुरक्षित डिजिटल लॉकर।",
            t_voice: "वॉयस नोट्स", t_voice_sub: "ऑडियो रिकॉर्ड करें और लिखें।",
            t_share: "फ़ाइल शेयरिंग", t_share_sub: "फ़ाइलें सुरक्षित रूप से भेजें।",
            t_pass: "पासवर्ड मैनेजर", t_pass_sub: "पासवर्ड सुरक्षित रखें।",
            t_ai: "एआई हेल्पर", t_ai_sub: "दस्तावेजों को समझें।",
            t_emg: "आपातकालीन कार्ड", t_emg_sub: "चिकित्सा और संपर्क विवरण।",
            t_fam: "फैमिली लॉकर", t_emg_fam: "साझा सुरक्षित स्टोरेज।",
            why_title: "पॉकेट का उपयोग क्यों करें?", why_sub: "गति, गोपनीयता और सरलता के लिए निर्मित।",
            why_1_title: "कोई विज्ञापन नहीं", why_1_sub: "कोई ट्रैकिंग नहीं, कोई ध्यान भंग नहीं।",
            why_2_title: "ऑफ़लाइन तैयार", why_2_sub: "इंटरनेट के बिना काम करता है।",
            why_3_title: "बैंक-स्तरीय सुरक्षा", why_3_sub: "आपका डेटा एन्क्रिप्टेड और निजी है।",
            why_4_title: "एआई संचालित", why_4_sub: "समय बचाने के लिए स्मार्ट टूल।"
        },
        hinglish: {
            lang: "Hinglish", log_out: "Log out", sign_in: "Sign In", products: "Products", careers: "Careers", sitemap: "Sitemap",
            hero_title: "Daily tools.", hero_title_2: "Ek secure jagah.", hero_sub: "Aapke daily tasks ke liye private digital toolbox.",
            cat_work: "Work aur Study", cat_links: "Smart Links", cat_math: "Math aur Measures", cat_files: "Storage aur Share", cat_sec: "Security Hub", cat_safe: "Family aur Safety",
            t_notes: "Smart Notes", t_notes_sub: "Likhein, translate aur organize karein.",
            t_scan: "Document Scanner", t_scan_sub: "ID cards scan karein.",
            t_pdf: "PDF Toolkit", t_pdf_sub: "PDF merge, compress aur edit karein.",
            t_qrg: "QR Generator", t_qrg_sub: "Apne QR codes banayein.",
            t_qrs: "QR Scanner", t_qrs_sub: "Safe scanning karein.",
            t_calc: "Calculator", t_calc_sub: "Normal aur tax calculations.",
            t_unit: "Unit Converter", t_unit_sub: "Land, weight aur currency convert karein.",
            t_doc: "Document Organizer", t_doc_sub: "Secure digital locker.",
            t_voice: "Voice Notes", t_voice_sub: "Audio record karein.",
            t_share: "File Sharing", t_share_sub: "Files safely send karein.",
            t_pass: "Password Manager", t_pass_sub: "Passwords safe rakhein.",
            t_ai: "AI Helper", t_ai_sub: "Documents samajhne me help.",
            t_emg: "Emergency Card", t_emg_sub: "Medical aur contact details.",
            t_fam: "Family Locker", t_emg_fam: "Shared secure storage.",
            why_title: "Pocket kyu use karein?", why_sub: "Fast, private aur simple.",
            why_1_title: "No Ads", why_1_sub: "Koi tracking nahi.",
            why_2_title: "Offline Ready", why_2_sub: "Bina internet ke chalega.",
            why_3_title: "Bank-Grade Security", why_3_sub: "Aapka data safe hai.",
            why_4_title: "AI Powered", why_4_sub: "Smart tools aapke liye."
        },
        mr: {
            lang: "मराठी", log_out: "लॉग आउट", sign_in: "साइन इन", products: "उत्पादने", careers: "करिअर", sitemap: "साइटमॅप",
            hero_title: "रोजची साधने.", hero_title_2: "एक सुरक्षित जागा.", hero_sub: "तुमच्या दैनंदिन कामांसाठी खाजगी डिजिटल टूलबॉक्स.",
            cat_work: "काम आणि अभ्यास", cat_links: "स्मार्ट लिंक्स", cat_math: "गणित आणि मोजमाप", cat_files: "स्टोरेज आणि शेअरिंग", cat_sec: "सुरक्षा", cat_safe: "कुटुंब आणि सुरक्षा",
            t_notes: "स्मार्ट नोट्स", t_notes_sub: "लिहा, भाषांतर करा आणि व्यवस्थापित करा.",
            t_scan: "दस्तऐवज स्कॅनर", t_scan_sub: "आयडी कार्ड त्वरित डिजिटल करा.",
            t_pdf: "पीडीएफ टूलकिट", t_pdf_sub: "मर्ज, कॉम्प्रेस आणि संपादित करा.",
            t_qrg: "क्यूआर जनरेटर", t_qrg_sub: "कस्टम क्यूआर कोड तयार करा.",
            t_qrs: "क्यूआर स्कॅनर", t_qrs_sub: "लिंक सुरक्षितपणे स्कॅन करा.",
            t_calc: "कॅल्क्युलेटर", t_calc_sub: "प्रमाणित आणि कर गणना.",
            t_unit: "युनिट कनव्हर्टर", t_unit_sub: "जमीन, वजन आणि चलन बदला.",
            t_doc: "दस्तऐवज व्यवस्थापक", t_doc_sub: "सुरक्षित डिजिटल लॉकर.",
            t_voice: "व्हॉइस नोट्स", t_voice_sub: "ऑडिओ रेकॉर्ड करा.",
            t_share: "फाईल शेअरिंग", t_share_sub: "फाईल्स सुरक्षितपणे पाठवा.",
            t_pass: "पासवर्ड मॅनेजर", t_pass_sub: "पासवर्ड सुरक्षित ठेवा.",
            t_ai: "एआय मदतनीस", t_ai_sub: "दस्तऐवज समजून घ्या.",
            t_emg: "आणीबाणी कार्ड", t_emg_sub: "वैद्यकीय आणि संपर्क तपशील.",
            t_fam: "फॅमिली लॉकर", t_emg_fam: "सामायिक सुरक्षित स्टोरेज.",
            why_title: "पॉकेट का वापरावे?", why_sub: "वेग, गोपनीयता आणि साधेपणासाठी.",
            why_1_title: "जाहिराती नाहीत", why_1_sub: "कोणतेही ट्रॅकिंग नाही.",
            why_2_title: "ऑफलाइन चालते", why_2_sub: "इंटरनेटशिवाय काम करते.",
            why_3_title: "बँक-स्तरीय सुरक्षा", why_3_sub: "तुमचा डेटा सुरक्षित आहे.",
            why_4_title: "एआय समर्थित", why_4_sub: "वेळ वाचवणारी साधने."
        },
        gu: {
            lang: "ગુજરાતી", log_out: "લૉગ આઉટ", sign_in: "સાઇન ઇન", products: "ઉત્પાદનો", careers: "કારકિર્દી", sitemap: "સાઇટમેપ",
            hero_title: "રોજિંદા સાધનો.", hero_title_2: "એક સુરક્ષિત જગ્યા.", hero_sub: "તમારા દૈનિક કાર્યો માટે એક ખાનગી ડિજિટલ ટૂલબોક્સ.",
            cat_work: "કામ અને અભ્યાસ", cat_links: "સ્માર્ટ લિંક્સ", cat_math: "ગણિત અને માપ", cat_files: "સ્ટોરેજ અને શેરિંગ", cat_sec: "સુરક્ષા", cat_safe: "કુટુંબ અને સલામતી",
            t_notes: "સ્માર્ટ નોટ્સ", t_notes_sub: "લખો, અનુવાદ કરો અને ગોઠવો.",
            t_scan: "દસ્તાવેજ સ્કેનર", t_scan_sub: "આઈડી કાર્ડને તરત જ ડિજિટલ બનાવો.",
            t_pdf: "પીડીએફ ટૂલકિટ", t_pdf_sub: "મર્જ કરો, સંકુચિત કરો અને સંપાદિત કરો.",
            t_qrg: "ક્યૂઆર જનરેટર", t_qrg_sub: "કસ્ટમ ક્યૂઆર કોડ બનાવો.",
            t_qrs: "ક્યૂઆર સ્કેનર", t_qrs_sub: "લિંક્સને સુરક્ષિત રીતે સ્કેન કરો.",
            t_calc: "કેલ્ક્યુલેટર", t_calc_sub: "પ્રમાણભૂત અને કર ગણતરીઓ.",
            t_unit: "યુનિટ કન્વર્ટર", t_unit_sub: "જમીન, વજન અને ચલણ બદલો.",
            t_doc: "દસ્તાવેજ આયોજક", t_doc_sub: "સુરક્ષિત ડિજિટલ લોકર.",
            t_voice: "વોઇસ નોટ્સ", t_voice_sub: "ઓડિયો રેકોર્ડ કરો.",
            t_share: "ફાઇલ શેરિંગ", t_share_sub: "ફાઇલો સુરક્ષિત રીતે મોકલો.",
            t_pass: "પાસવર્ડ મેનેજર", t_pass_sub: "પાસવર્ડ સુરક્ષિત રાખો.",
            t_ai: "એઆઈ હેલ્પર", t_ai_sub: "દસ્તાવેજો સમજો.",
            t_emg: "ઇમરજન્સી કાર્ડ", t_emg_sub: "તબીબી અને સંપર્ક વિગતો.",
            t_fam: "ફેમિલી લોકર", t_emg_fam: "શેર કરેલ સુરક્ષિત સ્ટોરેજ.",
            why_title: "પોકેટ શા માટે?", why_sub: "ઝડપ અને સરળતા.",
            why_1_title: "કોઈ જાહેરાતો નથી", why_1_sub: "કોઈ ટ્રેકિંગ નથી.",
            why_2_title: "ઓફલાઇન તૈયાર", why_2_sub: "ઇન્ટરનેટ વિના કાર્ય કરે છે.",
            why_3_title: "સુરક્ષિત", why_3_sub: "તમારો ડેટા ખાનગી છે.",
            why_4_title: "AI", why_4_sub: "સ્માર્ટ ટૂલ્સ."
        },
        te: {
            lang: "తెలుగు", log_out: "లాగ్ అవుట్", sign_in: "సైన్ ఇన్", products: "ఉత్పత్తులు", careers: "కెరీర్స్", sitemap: "సైట్‌మ్యాప్",
            hero_title: "రోజువారీ సాధనాలు.", hero_title_2: "ఒక సురక్షిత ప్రదేశం.", hero_sub: "మీ పనుల కోసం డిజిటల్ టూల్‌బాక్స్.",
            cat_work: "పని & అధ్యయనం", cat_links: "స్మార్ట్ లింకులు", cat_math: "గణితం & కొలతలు", cat_files: "నిల్వ & భాగస్వామ్యం", cat_sec: "భద్రతా హబ్", cat_safe: "కుటుంబం & భద్రత",
            t_notes: "స్మార్ట్ నోట్స్", t_notes_sub: "వ్రాయండి మరియు నిర్వహించండి.",
            t_scan: "డాక్యుమెంట్ స్కానర్", t_scan_sub: "ID కార్డ్‌లను స్కాన్ చేయండి.",
            t_pdf: "PDF టూల్‌కిట్", t_pdf_sub: "కలపండి మరియు సవరించండి.",
            t_qrg: "QR జనరేటర్", t_qrg_sub: "QR కోడ్‌లను సృష్టించండి.",
            t_qrs: "QR స్కానర్", t_qrs_sub: "సురక్షితంగా స్కాన్ చేయండి.",
            t_calc: "క్యాలిక్యులేటర్", t_calc_sub: "ప్రామాణిక మరియు పన్ను గణనలు.",
            t_unit: "యూనిట్ కన్వర్టర్", t_unit_sub: "భూమి మరియు బరువు మార్చండి.",
            t_doc: "డాక్యుమెంట్ ఆర్గనైజర్", t_doc_sub: "సురక్షిత డిజిటల్ లాకర్.",
            t_voice: "వాయిస్ నోట్స్", t_voice_sub: "ఆడియోను రికార్డ్ చేయండి.",
            t_share: "ఫైల్ షేరింగ్", t_share_sub: "ఫైల్‌లను సురక్షితంగా పంపండి.",
            t_pass: "పాస్‌వర్డ్ మేనేజర్", t_pass_sub: "పాస్‌వర్డ్‌లను సేవ్ చేయండి.",
            t_ai: "AI సహాయకుడు", t_ai_sub: "పత్రాలను అర్థం చేసుకోండి.",
            t_emg: "ఎమర్జెన్సీ కార్డ్", t_emg_sub: "వైద్య మరియు సంప్రదింపు వివరాలు.",
            t_fam: "ఫ్యామిలీ లాకర్", t_emg_fam: "భాగస్వామ్య నిల్వ.",
            why_title: "పాకెట్ ఎందుకు?", why_sub: "వేగం మరియు గోప్యత.",
            why_1_title: "ప్రకటనలు లేవు", why_1_sub: "ట్రాకింగ్ లేదు.",
            why_2_title: "ఆఫ్‌లైన్", why_2_sub: "ఇంటర్నెట్ లేకుండా పనిచేస్తుంది.",
            why_3_title: "భద్రత", why_3_sub: "మీ డేటా సురక్షితం.",
            why_4_title: "AI", why_4_sub: "స్మార్ట్ సాధనాలు."
        },
        ta: {
            lang: "தமிழ்", log_out: "வெளியேறு", sign_in: "உள்நுழைய", products: "தயாரிப்புகள்", careers: "தொழில்", sitemap: "தளவரைபடம்",
            hero_title: "தினசரி கருவிகள்.", hero_title_2: "ஒரு பாதுகாப்பான இடம்.", hero_sub: "உங்கள் பணிகளுக்கான டிஜிட்டல் கருவிப்பெட்டி.",
            cat_work: "வேலை & படிப்பு", cat_links: "ஸ்மார்ட் இணைப்புகள்", cat_math: "கணிதம் & அளவுகள்", cat_files: "சேமிப்பு & பகிர்வு", cat_sec: "பாதுகாப்பு", cat_safe: "குடும்பம் & பாதுகாப்பு",
            t_notes: "ஸ்மார்ட் குறிப்புகள்", t_notes_sub: "எழுதுங்கள் மற்றும் ஒழுங்கமைக்கவும்.",
            t_scan: "ஆவண ஸ்கேனர்", t_scan_sub: "அடையாள அட்டைகளை ஸ்கேன் செய்யவும்.",
            t_pdf: "PDF கருவி", t_pdf_sub: "இணைக்கவும் மற்றும் திருத்தவும்.",
            t_qrg: "QR ஜெனரேட்டர்", t_qrg_sub: "QR குறியீடுகளை உருவாக்கவும்.",
            t_qrs: "QR ஸ்கேனர்", t_qrs_sub: "பாதுகாப்பாக ஸ்கேன் செய்யவும்.",
            t_calc: "கால்குலேட்டர்", t_calc_sub: "நிலையான மற்றும் வரி கணக்கீடுகள்.",
            t_unit: "அலகு மாற்றி", t_unit_sub: "நிலம் மற்றும் எடையை மாற்றவும்.",
            t_doc: "ஆவண அமைப்பாளர்", t_doc_sub: "பாதுகாப்பான டிஜிட்டல் லாக்கர்.",
            t_voice: "குரல் குறிப்புகள்", t_voice_sub: "ஆடியோவை பதிவு செய்யவும்.",
            t_share: "கோப்பு பகிர்வு", t_share_sub: "கோப்புகளைப் பாதுகாப்பாக அனுப்பவும்.",
            t_pass: "கடவுச்சொல் மேலாளர்", t_pass_sub: "கடவுச்சொற்களைச் சேமிக்கவும்.",
            t_ai: "AI உதவியாளர்", t_ai_sub: "ஆவணங்களைப் புரிந்து கொள்ளுங்கள்.",
            t_emg: "அவசர அட்டை", t_emg_sub: "மருத்துவ மற்றும் தொடர்பு விவரங்கள்.",
            t_fam: "குடும்ப லாக்கர்", t_emg_fam: "பகிரப்பட்ட சேமிப்பு.",
            why_title: "பாக்கெட் ஏன்?", why_sub: "வேகம் மற்றும் எளிமை.",
            why_1_title: "விளம்பரங்கள் இல்லை", why_1_sub: "கண்காணிப்பு இல்லை.",
            why_2_title: "ஆஃப்லைன்", why_2_sub: "இணையம் இல்லாமல் வேலை செய்யும்.",
            why_3_title: "பாதுகாப்பு", why_3_sub: "உங்கள் தரவு பாதுகாப்பானது.",
            why_4_title: "AI", why_4_sub: "புத்திசாலித்தனமான கருவிகள்."
        },
        pa: {
            lang: "ਪੰਜਾਬੀ", log_out: "ਲੌਗ ਆਉਟ", sign_in: "ਸਾਈਨ ਇਨ", products: "ਉਤਪਾਦ", careers: "ਕਰੀਅਰ", sitemap: "ਸਾਈਟਮੈਪ",
            hero_title: "ਰੋਜ਼ਾਨਾ ਟੂਲ.", hero_title_2: "ਇੱਕ ਸੁਰੱਖਿਅਤ ਜਗ੍ਹਾ.", hero_sub: "ਤੁਹਾਡੇ ਰੋਜ਼ਾਨਾ ਕੰਮਾਂ ਲਈ ਇੱਕ ਨਿੱਜੀ ਡਿਜੀਟਲ ਟੂਲਬਾਕਸ।",
            cat_work: "ਕੰਮ ਅਤੇ ਪੜ੍ਹਾਈ", cat_links: "ਸਮਾਰਟ ਲਿੰਕ", cat_math: "ਗਣਿਤ ਅਤੇ ਮਾਪ", cat_files: "ਸਟੋਰੇਜ ਅਤੇ ਸ਼ੇਅਰਿੰਗ", cat_sec: "ਸੁਰੱਖਿਆ", cat_safe: "ਪਰਿਵਾਰ ਅਤੇ ਸੁਰੱਖਿਆ",
            t_notes: "ਸਮਾਰਟ ਨੋਟਸ", t_notes_sub: "ਲਿਖੋ ਅਤੇ ਪ੍ਰਬੰਧਿਤ ਕਰੋ.",
            t_scan: "ਦਸਤਾਵੇਜ਼ ਸਕੈਨਰ", t_scan_sub: "ਆਈਡੀ ਕਾਰਡ ਸਕੈਨ ਕਰੋ.",
            t_pdf: "ਪੀਡੀਐਫ ਟੂਲਕਿੱਟ", t_pdf_sub: "ਮਿਲਾਓ ਅਤੇ ਸੰਪਾਦਿਤ ਕਰੋ.",
            t_qrg: "ਕਿਊਆਰ ਜਨਰੇਟਰ", t_qrg_sub: "ਕਿਊਆਰ ਕੋਡ ਬਣਾਓ.",
            t_qrs: "ਕਿਊਆਰ ਸਕੈਨਰ", t_qrs_sub: "ਸੁਰੱਖਿਅਤ ਢੰਗ ਨਾਲ ਸਕੈਨ ਕਰੋ.",
            t_calc: "ਕੈਲਕੁਲੇਟਰ", t_calc_sub: "ਆਮ ਅਤੇ ਟੈਕਸ ਗਣਨਾ.",
            t_unit: "ਯੂਨਿਟ ਕਨਵਰਟਰ", t_unit_sub: "ਜ਼ਮੀਨ ਅਤੇ ਭਾਰ ਬਦਲੋ.",
            t_doc: "ਦਸਤਾਵੇਜ਼ ਆਯੋਜਕ", t_doc_sub: "ਸੁਰੱਖਿਅਤ ਡਿਜੀਟਲ ਲਾਕਰ.",
            t_voice: "ਵੌਇਸ ਨੋਟਸ", t_voice_sub: "ਆਡੀਓ ਰਿਕਾਰਡ ਕਰੋ.",
            t_share: "ਫਾਈਲ ਸ਼ੇਅਰਿੰਗ", t_share_sub: "ਫਾਈਲਾਂ ਸੁਰੱਖਿਅਤ ਭੇਜੋ.",
            t_pass: "ਪਾਸਵਰਡ ਮੈਨੇਜਰ", t_pass_sub: "ਪਾਸਵਰਡ ਸੁਰੱਖਿਅਤ ਰੱਖੋ.",
            t_ai: "ਏਆਈ ਹੈਲਪਰ", t_ai_sub: "ਦਸਤਾਵੇਜ਼ ਸਮਝੋ.",
            t_emg: "ਐਮਰਜੈਂਸੀ ਕਾਰਡ", t_emg_sub: "ਡਾਕਟਰੀ ਅਤੇ ਸੰਪਰਕ ਵੇਰਵੇ.",
            t_fam: "ਫੈਮਿਲੀ ਲਾਕਰ", t_emg_fam: "ਸਾਂਝੀ ਸਟੋਰੇਜ.",
            why_title: "ਪਾਕੇਟ ਕਿਉਂ?", why_sub: "ਸਪੀਡ ਅਤੇ ਗੋਪਨੀਯਤਾ.",
            why_1_title: "ਕੋਈ ਵਿਗਿਆਪਨ ਨਹੀਂ", why_1_sub: "ਕੋਈ ਟਰੈਕਿੰਗ ਨਹੀਂ.",
            why_2_title: "ਔਫਲਾਈਨ", why_2_sub: "ਬਿਨਾਂ ਇੰਟਰਨੈੱਟ ਦੇ ਚੱਲਦਾ ਹੈ.",
            why_3_title: "ਸੁਰੱਖਿਆ", why_3_sub: "ਤੁਹਾਡਾ ਡਾਟਾ ਸੁਰੱਖਿਅਤ ਹੈ.",
            why_4_title: "AI", why_4_sub: "ਸਮਾਰਟ ਟੂਲ."
        },
        bho: {
            lang: "भोजपुरी", log_out: "लॉग आउट", sign_in: "साइन इन", products: "उत्पाद", careers: "करियर", sitemap: "साइटमैप",
            hero_title: "रोज के टूल।", hero_title_2: "एक सुरक्षित जगह।", hero_sub: "रउआ दैनिक काम खातिर डिजिटल टूलबॉक्स।",
            cat_work: "काम आ पढ़ाई", cat_links: "स्मार्ट लिंक", cat_math: "गणित आ माप", cat_files: "स्टोरेज आ शेयरिंग", cat_sec: "सुरक्षा", cat_safe: "परिवार आ सुरक्षा",
            t_notes: "स्मार्ट नोट्स", t_notes_sub: "लिखीं आ व्यवस्थित करीं।",
            t_scan: "दस्तावेज़ स्कैनर", t_scan_sub: "आईडी कार्ड स्कैन करीं।",
            t_pdf: "पीडीएफ टूलकिट", t_pdf_sub: "मर्ज आ एडिट करीं।",
            t_qrg: "क्यूआर जेनरेटर", t_qrg_sub: "क्यूआर कोड बनाईं।",
            t_qrs: "क्यूआर स्कैनर", t_qrs_sub: "सुरक्षित स्कैनिंग।",
            t_calc: "कैलकुलेटर", t_calc_sub: "सामान्य आ टैक्स गणना।",
            t_unit: "इकाई कनवर्टर", t_unit_sub: "जमीन आ वजन बदलीं।",
            t_doc: "दस्तावेज़ आयोजक", t_doc_sub: "सुरक्षित डिजिटल लॉकर।",
            t_voice: "वॉयस नोट्स", t_voice_sub: "ऑडियो रिकॉर्ड करीं।",
            t_share: "फ़ाइल शेयरिंग", t_share_sub: "फ़ाइल सुरक्षित भेजीं।",
            t_pass: "पासवर्ड मैनेजर", t_pass_sub: "पासवर्ड सेव रखीं।",
            t_ai: "एआई हेल्पर", t_ai_sub: "दस्तावेज़ समझीं।",
            t_emg: "आपातकालीन कार्ड", t_emg_sub: "मेडिकल आ संपर्क।",
            t_fam: "फैमिली लॉकर", t_emg_fam: "साझा स्टोरेज।",
            why_title: "पॉकेट काहें?", why_sub: "फास्ट आ प्राइवेट।",
            why_1_title: "कौनो प्रचार ना", why_1_sub: "कौनो ट्रैकिंग ना।",
            why_2_title: "ऑफ़लाइन", why_2_sub: "बिना इंटरनेट के काम करेला।",
            why_3_title: "सुरक्षा", why_3_sub: "रउआ डेटा सेफ बा।",
            why_4_title: "AI", why_4_sub: "स्मार्ट टूल।"
        },
        ar: {
            lang: "العربية", log_out: "تسجيل خروج", sign_in: "تسجيل الدخول", products: "منتجات", careers: "وظائف", sitemap: "خريطة الموقع",
            hero_title: "أدوات يومية.", hero_title_2: "مكان واحد آمن.", hero_sub: "صندوق أدوات رقمي خاص لمهامك اليومية.",
            cat_work: "العمل والدراسة", cat_links: "روابط ذكية", cat_math: "الرياضيات والقياسات", cat_files: "التخزين والمشاركة", cat_sec: "الأمان", cat_safe: "العائلة والسلامة",
            t_notes: "ملاحظات ذكية", t_notes_sub: "الكتابة والتنظيم.",
            t_scan: "ماسح المستندات", t_scan_sub: "مسح بطاقات الهوية.",
            t_pdf: "أدوات PDF", t_pdf_sub: "الدمج والتعديل.",
            t_qrg: "صانع QR", t_qrg_sub: "إنشاء رموز QR.",
            t_qrs: "ماسح QR", t_qrs_sub: "المسح بأمان.",
            t_calc: "آلة حاسبة", t_calc_sub: "الحسابات القياسية.",
            t_unit: "محول الوحدات", t_unit_sub: "تحويل الأوزان والعملات.",
            t_doc: "منظم المستندات", t_doc_sub: "خزانة رقمية آمنة.",
            t_voice: "ملاحظات صوتية", t_voice_sub: "تسجيل الصوت.",
            t_share: "مشاركة الملفات", t_share_sub: "إرسال الملفات بأمان.",
            t_pass: "مدير كلمات المرور", t_pass_sub: "حفظ كلمات المرور.",
            t_ai: "مساعد ذكي", t_ai_sub: "فهم المستندات.",
            t_emg: "بطاقة الطوارئ", t_emg_sub: "التفاصيل الطبية.",
            t_fam: "خزانة العائلة", t_emg_fam: "تخزين مشترك آمن.",
            why_title: "لماذا بوكيت؟", why_sub: "سريع وخاص.",
            why_1_title: "بدون إعلانات", why_1_sub: "لا تتبع.",
            why_2_title: "بدون إنترنت", why_2_sub: "يعمل أوفلاين.",
            why_3_title: "أمان", why_3_sub: "بياناتك مشفرة.",
            why_4_title: "ذكاء اصطناعي", why_4_sub: "أدوات ذكية."
        },
        es: {
            lang: "Español", log_out: "Cerrar sesión", sign_in: "Iniciar sesión", products: "Productos", careers: "Carreras", sitemap: "Mapa del sitio",
            hero_title: "Herramientas diarias.", hero_title_2: "Un lugar seguro.", hero_sub: "Una caja de herramientas digital privada.",
            cat_work: "Trabajo y Estudio", cat_links: "Enlaces", cat_math: "Matemáticas y Medidas", cat_files: "Archivos", cat_sec: "Seguridad", cat_safe: "Familia y Seguridad",
            t_notes: "Notas", t_notes_sub: "Escribir y organizar.",
            t_scan: "Escáner", t_scan_sub: "Escanear documentos.",
            t_pdf: "Herramientas PDF", t_pdf_sub: "Combinar y editar.",
            t_qrg: "Crear QR", t_qrg_sub: "Generar códigos QR.",
            t_qrs: "Escanear QR", t_qrs_sub: "Escanear de forma segura.",
            t_calc: "Calculadora", t_calc_sub: "Cálculos estándar.",
            t_unit: "Convertidor", t_unit_sub: "Convertir unidades.",
            t_doc: "Documentos", t_doc_sub: "Armario digital seguro.",
            t_voice: "Notas de voz", t_voice_sub: "Grabar audio.",
            t_share: "Compartir", t_share_sub: "Enviar archivos.",
            t_pass: "Contraseñas", t_pass_sub: "Guardar contraseñas.",
            t_ai: "Asistente AI", t_ai_sub: "Entender documentos.",
            t_emg: "Tarjeta de emergencia", t_emg_sub: "Detalles médicos.",
            t_fam: "Armario familiar", t_emg_fam: "Almacenamiento compartido.",
            why_title: "¿Por qué Pocket?", why_sub: "Rápido y privado.",
            why_1_title: "Sin anuncios", why_1_sub: "Sin rastreo.",
            why_2_title: "Sin conexión", why_2_sub: "Funciona offline.",
            why_3_title: "Seguridad", why_3_sub: "Tus datos están a salvo.",
            why_4_title: "IA", why_4_sub: "Herramientas inteligentes."
        },
        fr: {
            lang: "Français", log_out: "Déconnexion", sign_in: "Se connecter", products: "Produits", careers: "Carrières", sitemap: "Plan du site",
            hero_title: "Outils quotidiens.", hero_title_2: "Un endroit sûr.", hero_sub: "Une boîte à outils numérique privée.",
            cat_work: "Travail et Études", cat_links: "Liens", cat_math: "Mathématiques", cat_files: "Fichiers", cat_sec: "Sécurité", cat_safe: "Famille et Sécurité",
            t_notes: "Notes", t_notes_sub: "Écrire et organiser.",
            t_scan: "Scanner", t_scan_sub: "Numériser des documents.",
            t_pdf: "Outils PDF", t_pdf_sub: "Fusionner et modifier.",
            t_qrg: "Créer QR", t_qrg_sub: "Générer des codes QR.",
            t_qrs: "Scanner QR", t_qrs_sub: "Scanner en toute sécurité.",
            t_calc: "Calculatrice", t_calc_sub: "Calculs standards.",
            t_unit: "Convertisseur", t_unit_sub: "Convertir des unités.",
            t_doc: "Documents", t_doc_sub: "Casier numérique sûr.",
            t_voice: "Notes vocales", t_voice_sub: "Enregistrer l'audio.",
            t_share: "Partager", t_share_sub: "Envoyer des fichiers.",
            t_pass: "Mots de passe", t_pass_sub: "Enregistrer les mots de passe.",
            t_ai: "Assistant IA", t_ai_sub: "Comprendre les documents.",
            t_emg: "Carte d'urgence", t_emg_sub: "Détails médicaux.",
            t_fam: "Casier familial", t_emg_fam: "Stockage partagé.",
            why_title: "Pourquoi Pocket?", why_sub: "Rapide et privé.",
            why_1_title: "Sans publicité", why_1_sub: "Pas de suivi.",
            why_2_title: "Hors ligne", why_2_sub: "Fonctionne sans internet.",
            why_3_title: "Sécurité", why_3_sub: "Vos données sont sûres.",
            why_4_title: "IA", why_4_sub: "Outils intelligents."
        },
        de: {
            lang: "Deutsch", log_out: "Abmelden", sign_in: "Anmelden", products: "Produkte", careers: "Karriere", sitemap: "Seitenübersicht",
            hero_title: "Tägliche Werkzeuge.", hero_title_2: "Ein sicherer Ort.", hero_sub: "Ein privater digitaler Werkzeugkasten.",
            cat_work: "Arbeit & Studium", cat_links: "Links", cat_math: "Mathematik", cat_files: "Dateien", cat_sec: "Sicherheit", cat_safe: "Familie & Sicherheit",
            t_notes: "Notizen", t_notes_sub: "Schreiben und organisieren.",
            t_scan: "Scanner", t_scan_sub: "Dokumente scannen.",
            t_pdf: "PDF-Werkzeuge", t_pdf_sub: "Zusammenführen und bearbeiten.",
            t_qrg: "QR erstellen", t_qrg_sub: "QR-Codes generieren.",
            t_qrs: "QR scannen", t_qrs_sub: "Sicher scannen.",
            t_calc: "Taschenrechner", t_calc_sub: "Standardberechnungen.",
            t_unit: "Konverter", t_unit_sub: "Einheiten umrechnen.",
            t_doc: "Dokumente", t_doc_sub: "Sicheres digitales Schließfach.",
            t_voice: "Sprachnotizen", t_voice_sub: "Audio aufnehmen.",
            t_share: "Teilen", t_share_sub: "Dateien senden.",
            t_pass: "Passwörter", t_pass_sub: "Passwörter speichern.",
            t_ai: "KI-Helfer", t_ai_sub: "Dokumente verstehen.",
            t_emg: "Notfallkarte", t_emg_sub: "Medizinische Details.",
            t_fam: "Familienschließfach", t_emg_fam: "Geteilter Speicher.",
            why_title: "Warum Pocket?", why_sub: "Schnell und privat.",
            why_1_title: "Keine Werbung", why_1_sub: "Kein Tracking.",
            why_2_title: "Offline", why_2_sub: "Funktioniert ohne Internet.",
            why_3_title: "Sicherheit", why_3_sub: "Ihre Daten sind sicher.",
            why_4_title: "KI", why_4_sub: "Smarte Werkzeuge."
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

    const pocketTools = [
        { id: 'notes', name: currentT.t_notes, desc: currentT.t_notes_sub, icon: FileText, path: '/pocket/notes', category: 'work' },
        { id: 'scanner', name: currentT.t_scan, desc: currentT.t_scan_sub, icon: Scan, path: '/pocket/scanner', category: 'work' },
        { id: 'pdf', name: currentT.t_pdf, desc: currentT.t_pdf_sub, icon: FileCode, path: '/pocket/pdf', category: 'work' },
        
        { id: 'qr-gen', name: currentT.t_qrg, desc: currentT.t_qrg_sub, icon: QrCode, path: '/pocket/qr-generate', category: 'links' },
        { id: 'qr-scan', name: currentT.t_qrs, desc: currentT.t_qrs_sub, icon: LinkIcon, path: '/pocket/qr-scan', category: 'links' },
        
        { id: 'calc', name: currentT.t_calc, desc: currentT.t_calc_sub, icon: Calculator, path: '/pocket/calculator', category: 'math' },
        { id: 'unit', name: currentT.t_unit, desc: currentT.t_unit_sub, icon: Scale, path: '/pocket/converter', category: 'math' },
        
        { id: 'docs', name: currentT.t_doc, desc: currentT.t_doc_sub, icon: FolderOpen, path: '/pocket/documents', category: 'files' },
        { id: 'voice', name: currentT.t_voice, desc: currentT.t_voice_sub, icon: Mic, path: '/pocket/voice', category: 'files' },
        { id: 'share', name: currentT.t_share, desc: currentT.t_share_sub, icon: Share2, path: '/pocket/share', category: 'files' },
        
        { id: 'pass', name: currentT.t_pass, desc: currentT.t_pass_sub, icon: Key, path: '/pocket/passwords', category: 'security' },
        { id: 'ai', name: currentT.t_ai, desc: currentT.t_ai_sub, icon: Bot, path: '/pocket/ai', category: 'security' },
        
        { id: 'emerg', name: currentT.t_emg, desc: currentT.t_emg_sub, icon: ShieldAlert, path: '/pocket/emergency', category: 'safety' },
        { id: 'family', name: currentT.t_fam, desc: currentT.t_emg_fam, icon: Users, path: '/pocket/family', category: 'safety' },
    ];

    // STRICT THEME CLASS MAPPING BASED ON LOCAL STATE
    const isLight = localTheme === 'light';
    const bgClass = isLight ? 'bg-[#FFFFFF]' : 'bg-[#0a0a0a]';
    const textClass = isLight ? 'text-[#111111]' : 'text-[#FFFFFF]';
    const borderClass = isLight ? 'border-[#E5E7EB]' : 'border-[#333333]';
    const cardBgClass = isLight ? 'bg-[#F7F7F7]' : 'bg-[#111111]';
    const mutedTextClass = isLight ? 'text-[#555555]' : 'text-[#888888]';

    return (
        <div className={`min-h-screen font-sans overflow-x-hidden flex flex-col relative transition-colors duration-300 ${bgClass} ${textClass} selection:bg-[#6C5CE7] selection:text-white`}>
            
            <style>
                {`
                  @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                  .animate-fade { animation: fadeIn 0.8s ease-out forwards; }
                  html { scroll-behavior: smooth; }
                `}
            </style>

            {/* HEADER */}
            <header className={`w-full flex items-center justify-between px-6 md:px-12 py-6 animate-fade z-50 border-b ${borderClass} backdrop-blur-md sticky top-0 bg-transparent`}>
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/pocket')}>
                    <img 
                        src={isLight ? '/logo-5.png' : '/logo.png'} 
                        alt="Movyra" 
                        className="h-8 w-auto" 
                        onError={(e) => e.target.style.display = 'none'} 
                    />
                    <span className="font-black text-[1.5rem] tracking-tighter ml-[-5px]">
                        ovyra <span className={`${isLight ? 'text-[#666666]' : 'text-[#888888]'} font-medium text-[1.2rem] ml-1`}>Pocket</span>
                    </span>
                </div>
                
                <div className="flex items-center gap-3 md:gap-6 font-bold text-[0.9rem]">
                    <button onClick={toggleTheme} className={`p-2 rounded-full border ${borderClass} hover:border-[#6C5CE7] hover:text-[#6C5CE7] transition-colors outline-none`}>
                        {isLight ? <Moon size={16} /> : <Sun size={16} />}
                    </button>
                    
                    <button onClick={() => setShowLangPrompt(true)} className={`p-2 rounded-full border ${borderClass} hover:border-[#6C5CE7] hover:text-[#6C5CE7] transition-colors outline-none flex items-center gap-2`}>
                        <Globe size={16} /> <span className="hidden md:inline">{currentT.lang}</span>
                    </button>

                    {currentUser ? (
                        <>
                            <button onClick={handleSignOut} className={`hidden md:block ${mutedTextClass} hover:${textClass} transition-colors outline-none`}>
                                {currentT.log_out}
                            </button>
                            <button onClick={handleSignOut} className={`p-2 rounded-full border ${borderClass} hover:border-[#6C5CE7] hover:text-[#6C5CE7] transition-colors outline-none block md:hidden`}>
                                <LogOut size={16} />
                            </button>
                        </>
                    ) : (
                        <button onClick={() => navigate('/pocket/auth')} className="bg-[#6C5CE7] text-white px-5 py-2 rounded-full hover:bg-[#5a4bcf] transition-colors outline-none">
                            {currentT.sign_in}
                        </button>
                    )}
                </div>
            </header>

            {/* MODALS */}
            <AnimatePresence>
                {/* Language Modal */}
                {showLangPrompt && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className={`w-full max-w-[400px] ${bgClass} rounded-3xl p-8 flex flex-col shadow-2xl relative border ${borderClass} max-h-[80vh] overflow-y-auto`}>
                            <button onClick={() => setShowLangPrompt(false)} className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center ${mutedTextClass} hover:${textClass} transition-colors outline-none`}><X size={18} /></button>
                            <h2 className="text-[1.4rem] font-black tracking-tight mb-6 text-center">Select Language</h2>
                            <div className="flex flex-col gap-2">
                                {languageOptions.map((option) => (
                                    <button key={option.code} onClick={() => { setLang(option.code); setShowLangPrompt(false); }} className={`w-full p-4 rounded-xl flex items-center justify-between transition-colors border outline-none ${lang === option.code ? 'bg-[#6C5CE7]/10 border-[#6C5CE7] text-[#6C5CE7]' : `${cardBgClass} ${borderClass} ${mutedTextClass} hover:border-[#6C5CE7] hover:text-[#6C5CE7]`}`}>
                                        <span className="font-bold text-[1rem]">{option.label}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Products Modal */}
                {showProductsPrompt && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className={`w-full max-w-[500px] ${bgClass} rounded-3xl p-8 flex flex-col shadow-2xl relative border ${borderClass}`}>
                            <button onClick={() => setShowProductsPrompt(false)} className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center ${mutedTextClass} hover:${textClass} transition-colors outline-none`}><X size={18} /></button>
                            <h2 className="text-[1.5rem] font-black tracking-tight mb-2 text-center mt-2">Also from us</h2>
                            <p className={`${mutedTextClass} text-[0.9rem] text-center mb-8`}>Discover our connected platforms.</p>
                            <div className="flex flex-col gap-4">
                                <Link to="/civic" className={`group flex flex-col items-center gap-4 ${cardBgClass} border ${borderClass} p-6 rounded-2xl hover:border-[#00A9F7] transition-colors text-center w-full outline-none`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <img src={isLight ? '/logo-3.png' : '/logo.png'} alt="Movyra" className="h-6 w-auto" onError={(e) => e.target.style.display = 'none'} />
                                        <span className="font-black text-[1.2rem] tracking-tighter ml-[-5px]">ovyra <span className="text-[#888888] font-medium text-[1rem] ml-1">Civic</span></span>
                                    </div>
                                    <p className={`${mutedTextClass} text-[0.85rem] leading-relaxed group-hover:${textClass} transition-colors`}>Smart city management. Report issues easily.</p>
                                </Link>
                                <Link to="/sahay" className={`group flex flex-col items-center gap-4 ${cardBgClass} border ${borderClass} p-6 rounded-2xl hover:border-[#FF6B35] transition-colors text-center w-full outline-none`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <img src={isLight ? '/logo-4.png' : '/logo.png'} alt="Movyra" className="h-6 w-auto" onError={(e) => e.target.style.display = 'none'} />
                                        <span className="font-black text-[1.2rem] tracking-tighter ml-[-5px]">ovyra <span className="text-[#888888] font-medium text-[1rem] ml-1">Sahay</span></span>
                                    </div>
                                    <p className={`${mutedTextClass} text-[0.85rem] leading-relaxed group-hover:${textClass} transition-colors`}>Humanitarian rescue operations and support.</p>
                                </Link>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Sitemap Modal (Pocket Only) */}
                {showSitemap && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className={`w-full max-w-[600px] ${bgClass} rounded-3xl p-8 flex flex-col shadow-2xl relative border ${borderClass} max-h-[80vh] overflow-y-auto`}>
                            <button onClick={() => setShowSitemap(false)} className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center ${mutedTextClass} hover:${textClass} transition-colors outline-none`}><X size={18} /></button>
                            <h2 className="text-[1.8rem] font-black tracking-tight mb-2">{currentT.sitemap}</h2>
                            <p className={`${mutedTextClass} font-medium mb-6`}>Direct navigation to utility tools.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {pocketTools.map(tool => (
                                    <Link key={tool.id} to={tool.path} onClick={() => setShowSitemap(false)} className={`p-4 ${cardBgClass} border ${borderClass} rounded-xl font-bold hover:border-[#6C5CE7] hover:text-[#6C5CE7] transition-colors flex items-center gap-3 outline-none`}>
                                        <tool.icon size={16} /> {tool.name}
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MAIN CONTENT */}
            <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 md:px-12 py-16 animate-fade">
                
                <div className="mb-20 text-center max-w-[800px] mx-auto">
                    <h1 className="text-[3rem] md:text-[4.5rem] font-black leading-[1.1] tracking-tighter mb-4">
                        {currentT.hero_title} <span className="text-[#6C5CE7] block">{currentT.hero_title_2}</span>
                    </h1>
                    <p className={`text-[1.1rem] md:text-[1.25rem] ${mutedTextClass} font-medium leading-relaxed`}>
                        {currentT.hero_sub}
                    </p>
                </div>

                {/* Section 1: Work & Study */}
                <div className="mb-16">
                    <h3 className={`text-[0.85rem] uppercase tracking-widest font-black ${mutedTextClass} mb-6 border-b ${borderClass} pb-4`}>{currentT.cat_work}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pocketTools.filter(t => t.category === 'work').map(tool => (
                            <Link key={tool.id} to={tool.path} className={`group ${cardBgClass} border ${borderClass} p-6 rounded-2xl hover:border-[#6C5CE7] transition-all duration-300 hover:-translate-y-1 outline-none flex flex-col`}>
                                <div className="w-12 h-12 bg-[#6C5CE7]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#6C5CE7] group-hover:scale-110 transition-all duration-300">
                                    <tool.icon size={24} className="text-[#6C5CE7] group-hover:text-white transition-colors" />
                                </div>
                                <h4 className="font-black text-[1.1rem] mb-2 group-hover:text-[#6C5CE7] transition-colors">{tool.name}</h4>
                                <p className={`text-[0.85rem] ${mutedTextClass} font-medium`}>{tool.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Section 2: Smart Links */}
                <div className="mb-16">
                    <h3 className={`text-[0.85rem] uppercase tracking-widest font-black ${mutedTextClass} mb-6 border-b ${borderClass} pb-4`}>{currentT.cat_links}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {pocketTools.filter(t => t.category === 'links').map(tool => (
                            <Link key={tool.id} to={tool.path} className={`group ${cardBgClass} border ${borderClass} p-6 rounded-2xl hover:border-[#6C5CE7] transition-all duration-300 hover:-translate-y-1 outline-none flex flex-col`}>
                                <div className="w-12 h-12 bg-[#6C5CE7]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#6C5CE7] group-hover:scale-110 transition-all duration-300">
                                    <tool.icon size={24} className="text-[#6C5CE7] group-hover:text-white transition-colors" />
                                </div>
                                <h4 className="font-black text-[1.1rem] mb-2 group-hover:text-[#6C5CE7] transition-colors">{tool.name}</h4>
                                <p className={`text-[0.85rem] ${mutedTextClass} font-medium`}>{tool.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Section 3: Math & Measures */}
                <div className="mb-16">
                    <h3 className={`text-[0.85rem] uppercase tracking-widest font-black ${mutedTextClass} mb-6 border-b ${borderClass} pb-4`}>{currentT.cat_math}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {pocketTools.filter(t => t.category === 'math').map(tool => (
                            <Link key={tool.id} to={tool.path} className={`group ${cardBgClass} border ${borderClass} p-6 rounded-2xl hover:border-[#6C5CE7] transition-all duration-300 hover:-translate-y-1 outline-none flex flex-col`}>
                                <div className="w-12 h-12 bg-[#6C5CE7]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#6C5CE7] group-hover:scale-110 transition-all duration-300">
                                    <tool.icon size={24} className="text-[#6C5CE7] group-hover:text-white transition-colors" />
                                </div>
                                <h4 className="font-black text-[1.1rem] mb-2 group-hover:text-[#6C5CE7] transition-colors">{tool.name}</h4>
                                <p className={`text-[0.85rem] ${mutedTextClass} font-medium`}>{tool.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Section 4: Storage & Sharing */}
                <div className="mb-16">
                    <h3 className={`text-[0.85rem] uppercase tracking-widest font-black ${mutedTextClass} mb-6 border-b ${borderClass} pb-4`}>{currentT.cat_files}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pocketTools.filter(t => t.category === 'files').map(tool => (
                            <Link key={tool.id} to={tool.path} className={`group ${cardBgClass} border ${borderClass} p-6 rounded-2xl hover:border-[#6C5CE7] transition-all duration-300 hover:-translate-y-1 outline-none flex flex-col`}>
                                <div className="w-12 h-12 bg-[#6C5CE7]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#6C5CE7] group-hover:scale-110 transition-all duration-300">
                                    <tool.icon size={24} className="text-[#6C5CE7] group-hover:text-white transition-colors" />
                                </div>
                                <h4 className="font-black text-[1.1rem] mb-2 group-hover:text-[#6C5CE7] transition-colors">{tool.name}</h4>
                                <p className={`text-[0.85rem] ${mutedTextClass} font-medium`}>{tool.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Section 5: Security Hub */}
                <div className="mb-16">
                    <h3 className={`text-[0.85rem] uppercase tracking-widest font-black ${mutedTextClass} mb-6 border-b ${borderClass} pb-4`}>{currentT.cat_sec}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {pocketTools.filter(t => t.category === 'security').map(tool => (
                            <Link key={tool.id} to={tool.path} className={`group ${cardBgClass} border ${borderClass} p-6 rounded-2xl hover:border-[#6C5CE7] transition-all duration-300 hover:-translate-y-1 outline-none flex flex-col`}>
                                <div className="w-12 h-12 bg-[#6C5CE7]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#6C5CE7] group-hover:scale-110 transition-all duration-300">
                                    <tool.icon size={24} className="text-[#6C5CE7] group-hover:text-white transition-colors" />
                                </div>
                                <h4 className="font-black text-[1.1rem] mb-2 group-hover:text-[#6C5CE7] transition-colors">{tool.name}</h4>
                                <p className={`text-[0.85rem] ${mutedTextClass} font-medium`}>{tool.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Section 6: Family & Safety */}
                <div className="mb-24">
                    <h3 className={`text-[0.85rem] uppercase tracking-widest font-black ${mutedTextClass} mb-6 border-b ${borderClass} pb-4`}>{currentT.cat_safe}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {pocketTools.filter(t => t.category === 'safety').map(tool => (
                            <Link key={tool.id} to={tool.path} className={`group ${cardBgClass} border ${borderClass} p-6 rounded-2xl hover:border-[#6C5CE7] transition-all duration-300 hover:-translate-y-1 outline-none flex flex-col`}>
                                <div className="w-12 h-12 bg-[#6C5CE7]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#6C5CE7] group-hover:scale-110 transition-all duration-300">
                                    <tool.icon size={24} className="text-[#6C5CE7] group-hover:text-white transition-colors" />
                                </div>
                                <h4 className="font-black text-[1.1rem] mb-2 group-hover:text-[#6C5CE7] transition-colors">{tool.name}</h4>
                                <p className={`text-[0.85rem] ${mutedTextClass} font-medium`}>{tool.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* INFORMATIONAL SECTIONS */}
                <div className="mb-24">
                    <div className="text-center mb-12">
                        <h2 className="text-[2rem] font-black mb-2">{currentT.why_title}</h2>
                        <p className={`${mutedTextClass}`}>{currentT.why_sub}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className={`p-8 rounded-3xl border ${borderClass} ${cardBgClass} flex gap-6 items-start`}>
                            <div className="w-12 h-12 bg-[#DC2626]/10 rounded-full flex items-center justify-center shrink-0">
                                <ShieldCheck className="text-[#DC2626]" size={24} />
                            </div>
                            <div>
                                <h4 className="font-black text-[1.2rem] mb-2">{currentT.why_1_title}</h4>
                                <p className={`${mutedTextClass} leading-relaxed text-[0.95rem]`}>{currentT.why_1_sub}</p>
                            </div>
                        </div>

                        <div className={`p-8 rounded-3xl border ${borderClass} ${cardBgClass} flex gap-6 items-start`}>
                            <div className="w-12 h-12 bg-[#6C5CE7]/10 rounded-full flex items-center justify-center shrink-0">
                                <WifiOff className="text-[#6C5CE7]" size={24} />
                            </div>
                            <div>
                                <h4 className="font-black text-[1.2rem] mb-2">{currentT.why_2_title}</h4>
                                <p className={`${mutedTextClass} leading-relaxed text-[0.95rem]`}>{currentT.why_2_sub}</p>
                            </div>
                        </div>

                        <div className={`p-8 rounded-3xl border ${borderClass} ${cardBgClass} flex gap-6 items-start`}>
                            <div className="w-12 h-12 bg-[#00A86B]/10 rounded-full flex items-center justify-center shrink-0">
                                <Key className="text-[#00A86B]" size={24} />
                            </div>
                            <div>
                                <h4 className="font-black text-[1.2rem] mb-2">{currentT.why_3_title}</h4>
                                <p className={`${mutedTextClass} leading-relaxed text-[0.95rem]`}>{currentT.why_3_sub}</p>
                            </div>
                        </div>

                        <div className={`p-8 rounded-3xl border ${borderClass} ${cardBgClass} flex gap-6 items-start`}>
                            <div className="w-12 h-12 bg-[#00A9F7]/10 rounded-full flex items-center justify-center shrink-0">
                                <Bot className="text-[#00A9F7]" size={24} />
                            </div>
                            <div>
                                <h4 className="font-black text-[1.2rem] mb-2">{currentT.why_4_title}</h4>
                                <p className={`${mutedTextClass} leading-relaxed text-[0.95rem]`}>{currentT.why_4_sub}</p>
                            </div>
                        </div>
                    </div>
                </div>

            </main>

            {/* FOOTER */}
            <footer className={`w-full mx-auto flex flex-col md:flex-row items-center justify-between gap-8 px-6 md:px-12 py-10 border-t ${borderClass} ${cardBgClass} mt-auto`}>
                <div className="flex flex-wrap items-center gap-6">
                    <button onClick={() => setShowLangPrompt(true)} className={`flex items-center gap-2 text-[0.8rem] font-bold px-3 py-1.5 rounded-full transition-colors border ${borderClass} ${mutedTextClass} hover:border-[#6C5CE7] hover:text-[#6C5CE7] outline-none`}>
                        <Globe size={14} /> {currentT.lang}
                    </button>
                </div>
                
                <div className={`flex flex-col md:flex-row items-center gap-6 text-[0.8rem] font-bold ${mutedTextClass}`}>
                    <div className="flex items-center gap-6">
                        <button onClick={() => setShowProductsPrompt(true)} className={`hover:${textClass} transition-colors outline-none`}>{currentT.products}</button>
                        <span className={`w-1 h-1 ${borderClass} rounded-full`}></span>
                        <button onClick={() => setShowSitemap(true)} className={`hover:${textClass} transition-colors underline outline-none`}>{currentT.sitemap}</button>
                        <span className={`w-1 h-1 ${borderClass} rounded-full`}></span>
                        <Link to="/careers" className={`hover:${textClass} transition-colors outline-none`}>{currentT.careers}</Link>
                    </div>
                    <span className={`hidden md:block w-1 h-1 ${borderClass} rounded-full`}></span>
                    
                    <div className="flex items-center gap-2 text-[0.75rem] uppercase tracking-wider">
                        Built by 
                        <a href="https://rebrand.ly/aatns" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition-opacity outline-none">
                            <img src={isLight ? '/aat2.png' : '/aat.png'} alt="AnyAstro" className="h-4 w-auto object-contain" onError={(e) => { e.target.style.display = 'none'; e.target.insertAdjacentHTML('afterend', `<span class="underline ${textClass}">AnyAstro</span>`); }} />
                        </a>
                    </div>

                    <button onClick={scrollToTop} className={`p-2 rounded-full border ${borderClass} hover:border-[#6C5CE7] hover:text-[#6C5CE7] transition-colors outline-none`}>
                        <ArrowUp size={16} />
                    </button>
                </div>
            </footer>
        </div>
    );
}