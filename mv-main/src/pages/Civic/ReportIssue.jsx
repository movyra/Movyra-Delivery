import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signOut } from 'firebase/auth';
import { 
    MapPin, 
    UploadCloud, 
    CheckCircle, 
    AlertTriangle, 
    ArrowLeft,
    FileText,
    Wand2,
    EyeOff,
    Sun,
    Moon,
    Home,
    LogOut,
    X,
    Globe,
    ArrowUp
} from 'lucide-react';

import { 
    uploadCivicEvidence, 
    submitCivicComplaint, 
    findNearbyDuplicate,
    addCommunitySupport
} from '../../services/civicService';
import { useCivicStore } from '../../store/useCivicStore';
import { auth } from '../../firebaseConfig';

// Import newly created mapping and interception components
import LocationPicker from '../../components/Civic/LocationPicker';
import DuplicateWarning from '../../components/Civic/DuplicateWarning';

// Geographic hash generator for proximity sorting
const generateGeohash = (latitude, longitude, precision = 7) => {
    const base32 = '0123456789bcdefghjkmnpqrstuvwxyz';
    let isEven = true;
    let lat = [-90.0, 90.0];
    let lon = [-180.0, 180.0];
    let bit = 0;
    let ch = 0;
    let geohash = '';

    while (geohash.length < precision) {
        if (isEven) {
            const mid = (lon[0] + lon[1]) / 2;
            if (longitude > mid) {
                ch |= (1 << (4 - bit));
                lon[0] = mid;
            } else {
                lon[1] = mid;
            }
        } else {
            const mid = (lat[0] + lat[1]) / 2;
            if (latitude > mid) {
                ch |= (1 << (4 - bit));
                lat[0] = mid;
            } else {
                lat[1] = mid;
            }
        }
        isEven = !isEven;
        if (bit < 4) {
            bit++;
        } else {
            geohash += base32[ch];
            bit = 0;
            ch = 0;
        }
    }
    return geohash;
};

export default function ReportIssue() {
    const navigate = useNavigate();
    const saveDraft = useCivicStore((state) => state.saveDraft);
    const terminateSession = useCivicStore((state) => state.terminateSession);
    
    // 1. STATE MANAGEMENT
    const theme = useCivicStore((state) => state.theme);
    const toggleTheme = useCivicStore((state) => state.toggleTheme);
    const [lang, setLang] = useState('en');
    const [showLangPrompt, setShowLangPrompt] = useState(false);

    const [selectedLocation, setSelectedLocation] = useState(null);
    const [evidenceFile, setEvidenceFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [duplicateFound, setDuplicateFound] = useState(null);
    const [submissionSuccess, setSubmissionSuccess] = useState(false);
    const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
    const fileInputRef = useRef(null);

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
    }, []);

    // 2. 13-LANGUAGE DICTIONARY (Reporting Context)
    const t = {
        en: {
            lang: "English", help: "Help Center", back: "Return to Dashboard", log_out: "Log out", careers: "Careers",
            title: "Report Issue", sub: "Complete the form below to notify administrators of required infrastructure maintenance.",
            form_cat: "Categorization", form_title_label: "Report Title", form_title_ph: "Brief identification of the issue",
            form_div_label: "Category", form_div_ph: "Select Division...", 
            cat_road: "Road Maintenance", cat_san: "Sanitation Services", cat_water: "Water Supply", cat_elec: "Electrical Grid", cat_safe: "Public Safety",
            form_pri_label: "Priority", pri_std: "Standard Maintenance", pri_high: "High Urgency", pri_crit: "Critical Hazard",
            form_desc_label: "Details", form_desc_btn: "Structure Text", form_desc_ph: "Provide details about the issue...",
            priv_title: "Anonymous Submission", priv_sub: "Hide your identity from the public record.",
            submit_btn: "Submit Report", submit_proc: "Submitting...",
            map_title: "Location", ev_title: "Visual Evidence", ev_sub: "Select Image", ev_sub2: "JPEG, PNG supported", ev_ready: "Ready for upload",
            err_title: "Title must contain at least 5 characters", err_cat: "Please select a category", err_desc: "Please provide a more detailed description (min 20 characters)",
            alert_map: "Please identify the exact location on the map before proceeding.", alert_fail: "Submission failed. Your report has been saved as a draft.",
            succ_title: "Report Submitted", succ_sub: "The issue has been registered. Teams will be dispatched according to priority."
        },
        hi: {
            lang: "हिन्दी", help: "सहायता केंद्र", back: "डैशबोर्ड पर लौटें", log_out: "लॉग आउट", careers: "करियर",
            title: "समस्या की रिपोर्ट करें", sub: "बुनियादी ढांचे के रखरखाव को सूचित करने के लिए नीचे दिया गया फॉर्म भरें।",
            form_cat: "वर्गीकरण", form_title_label: "रिपोर्ट का शीर्षक", form_title_ph: "समस्या की संक्षिप्त पहचान",
            form_div_label: "श्रेणी", form_div_ph: "विभाग चुनें...",
            cat_road: "सड़क रखरखाव", cat_san: "स्वच्छता सेवाएं", cat_water: "जल आपूर्ति", cat_elec: "इलेक्ट्रिकल ग्रिड", cat_safe: "सार्वजनिक सुरक्षा",
            form_pri_label: "प्राथमिकता", pri_std: "मानक रखरखाव", pri_high: "अत्यधिक तात्कालिकता", pri_crit: "गंभीर खतरा",
            form_desc_label: "विवरण", form_desc_btn: "संरचना पाठ", form_desc_ph: "समस्या के बारे में विवरण प्रदान करें...",
            priv_title: "गुमनाम सबमिशन", priv_sub: "सार्वजनिक रिकॉर्ड से अपनी पहचान छिपाएं।",
            submit_btn: "रिपोर्ट जमा करें", submit_proc: "सबमिट हो रहा है...",
            map_title: "स्थान", ev_title: "दृश्य साक्ष्य", ev_sub: "छवि चुनें", ev_sub2: "JPEG, PNG समर्थित", ev_ready: "अपलोड के लिए तैयार",
            err_title: "शीर्षक में कम से कम 5 अक्षर होने चाहिए", err_cat: "कृपया एक श्रेणी चुनें", err_desc: "कृपया अधिक विस्तृत विवरण प्रदान करें (न्यूनतम 20 अक्षर)",
            alert_map: "कृपया आगे बढ़ने से पहले मानचित्र पर सटीक स्थान की पहचान करें।", alert_fail: "सबमिशन विफल। आपकी रिपोर्ट ड्राफ्ट के रूप में सहेज ली गई है।",
            succ_title: "रिपोर्ट सबमिट की गई", succ_sub: "समस्या दर्ज कर ली गई है। प्राथमिकता के अनुसार टीमों को भेजा जाएगा।"
        },
        hinglish: {
            lang: "Hinglish", help: "Help Center", back: "Dashboard par wapas jayein", log_out: "Log out", careers: "Careers",
            title: "Issue Report Karein", sub: "Infrastructure maintenance ki jankari admin tak pahunchane ke liye form bharein.",
            form_cat: "Categorization", form_title_label: "Report Title", form_title_ph: "Issue ki short pehchan",
            form_div_label: "Category", form_div_ph: "Division Select Karein...",
            cat_road: "Road Maintenance", cat_san: "Sanitation Services", cat_water: "Water Supply", cat_elec: "Electrical Grid", cat_safe: "Public Safety",
            form_pri_label: "Priority", pri_std: "Standard Maintenance", pri_high: "High Urgency", pri_crit: "Critical Hazard",
            form_desc_label: "Details", form_desc_btn: "Structure Text", form_desc_ph: "Issue ke details dein...",
            priv_title: "Anonymous Submission", priv_sub: "Public record se apni identity chhipayein.",
            submit_btn: "Report Submit Karein", submit_proc: "Submit ho raha hai...",
            map_title: "Location", ev_title: "Visual Evidence", ev_sub: "Image Select Karein", ev_sub2: "JPEG, PNG supported", ev_ready: "Upload ke liye ready",
            err_title: "Title me kam se kam 5 characters hone chahiye", err_cat: "Please ek category select karein", err_desc: "Please detailed description dein (minimum 20 characters)",
            alert_map: "Aage badhne se pehle map par exact location identify karein.", alert_fail: "Submission fail ho gaya. Aapki report draft me save ho gayi hai.",
            succ_title: "Report Submitted", succ_sub: "Issue register ho gaya hai. Priority ke hisaab se teams bhej di jayengi."
        },
        mr: {
            lang: "मराठी", help: "मदत केंद्र", back: "डॅशबोर्डवर परत जा", log_out: "लॉग आउट", careers: "करिअर",
            title: "समस्येची नोंद करा", sub: "पायाभूत सुविधांच्या देखभालीबाबत प्रशासकांना सूचित करण्यासाठी खालील फॉर्म भरा.",
            form_cat: "वर्गीकरण", form_title_label: "अहवालाचे शीर्षक", form_title_ph: "समस्येची संक्षिप्त ओळख",
            form_div_label: "श्रेणी", form_div_ph: "विभाग निवडा...",
            cat_road: "रस्ते देखभाल", cat_san: "स्वच्छता सेवा", cat_water: "पाणी पुरवठा", cat_elec: "विद्युत ग्रिड", cat_safe: "सार्वजनिक सुरक्षा",
            form_pri_label: "प्राधान्य", pri_std: "मानक देखभाल", pri_high: "उच्च तातडी", pri_crit: "गंभीर धोका",
            form_desc_label: "तपशील", form_desc_btn: "स्ट्रक्चर मजकूर", form_desc_ph: "समस्येबाबत तपशील द्या...",
            priv_title: "निनावी सबमिशन", priv_sub: "सार्वजनिक रेकॉर्डमधून तुमची ओळख लपवा.",
            submit_btn: "अहवाल सबमिट करा", submit_proc: "सबमिट करत आहे...",
            map_title: "स्थान", ev_title: "दृश्य पुरावा", ev_sub: "प्रतिमा निवडा", ev_sub2: "JPEG, PNG समर्थित", ev_ready: "अपलोडसाठी तयार",
            err_title: "शीर्षकामध्ये किमान ५ अक्षरे असणे आवश्यक आहे", err_cat: "कृपया श्रेणी निवडा", err_desc: "कृपया अधिक तपशीलवार वर्णन द्या (किमान २० अक्षरे)",
            alert_map: "कृपया पुढे जाण्यापूर्वी नकाशावर अचूक स्थान ओळखा.", alert_fail: "सबमिशन अयशस्वी. तुमचा अहवाल ड्राफ्ट म्हणून जतन केला गेला आहे.",
            succ_title: "अहवाल सबमिट केला", succ_sub: "समस्येची नोंद झाली आहे. प्राधान्यानुसार टीम्स पाठवल्या जातील."
        },
        gu: {
            lang: "ગુજરાતી", help: "મદદ કેન્દ્ર", back: "ડેશબોર્ડ પર પાછા ફરો", log_out: "લૉગ આઉટ", careers: "કારકિર્દી",
            title: "સમસ્યાની જાણ કરો", sub: "ઇન્ફ્રાસ્ટ્રક્ચર જાળવણી વિશે સંચાલકોને સૂચિત કરવા માટે નીચેનું ફોર્મ ભરો.",
            form_cat: "વર્ગીકરણ", form_title_label: "રિપોર્ટ શીર્ષક", form_title_ph: "સમસ્યાની ટૂંકી ઓળખ",
            form_div_label: "શ્રેણી", form_div_ph: "વિભાગ પસંદ કરો...",
            cat_road: "રોડ જાળવણી", cat_san: "સ્વચ્છતા સેવાઓ", cat_water: "પાણી પુરવઠો", cat_elec: "ઇલેક્ટ્રિકલ ગ્રીડ", cat_safe: "જાહેર સુરક્ષા",
            form_pri_label: "પ્રાધાન્ય", pri_std: "પ્રમાણભૂત જાળવણી", pri_high: "ઉચ્ચ તાકીદ", pri_crit: "ગંભીર સંકટ",
            form_desc_label: "વિગતો", form_desc_btn: "સ્ટ્રક્ચર ટેક્સ્ટ", form_desc_ph: "સમસ્યા વિશે વિગતો પ્રદાન કરો...",
            priv_title: "અનામી સબમિશન", priv_sub: "જાહેર રેકોર્ડમાંથી તમારી ઓળખ છુપાવો.",
            submit_btn: "રિપોર્ટ સબમિટ કરો", submit_proc: "સબમિટ થઈ રહ્યું છે...",
            map_title: "સ્થાન", ev_title: "વિઝ્યુઅલ પુરાવા", ev_sub: "છબી પસંદ કરો", ev_sub2: "JPEG, PNG સમર્થિત", ev_ready: "અપલોડ માટે તૈયાર છે",
            err_title: "શીર્ષકમાં ઓછામાં ઓછા 5 અક્ષરો હોવા જોઈએ", err_cat: "કૃપા કરીને શ્રેણી પસંદ કરો", err_desc: "કૃપા કરીને વધુ વિગતવાર વર્ણન આપો (ન્યૂનતમ 20 અક્ષરો)",
            alert_map: "આગળ વધતા પહેલા કૃપા કરીને નકશા પર ચોક્કસ સ્થાન ઓળખો.", alert_fail: "સબમિશન નિષ્ફળ. તમારો રિપોર્ટ ડ્રાફ્ટ તરીકે સાચવવામાં આવ્યો છે.",
            succ_title: "રિપોર્ટ સબમિટ કર્યો", succ_sub: "સમસ્યા નોંધવામાં આવી છે. અગ્રતા અનુસાર ટીમો મોકલવામાં આવશે."
        },
        te: {
            lang: "తెలుగు", help: "సహాయ కేంద్రం", back: "డ్యాష్‌బోర్డ్‌కు తిరిగి వెళ్లండి", log_out: "లాగౌట్", careers: "కెరీర్స్",
            title: "సమస్యను నివేదించండి", sub: "మౌలిక సదుపాయాల నిర్వహణ గురించి నిర్వాహకులకు తెలియజేయడానికి దిగువ ఫారమ్‌ను పూరించండి.",
            form_cat: "వర్గీకరణ", form_title_label: "నివేదిక శీర్షిక", form_title_ph: "సమస్య యొక్క సంక్షిప్త గుర్తింపు",
            form_div_label: "వర్గం", form_div_ph: "విభాగాన్ని ఎంచుకోండి...",
            cat_road: "రహదారి నిర్వహణ", cat_san: "పారిశుద్ధ్య సేవలు", cat_water: "నీటి సరఫరా", cat_elec: "ఎలక్ట్రికల్ గ్రిడ్", cat_safe: "ప్రజా భద్రత",
            form_pri_label: "ప్రాధాన్యత", pri_std: "ప్రామాణిక నిర్వహణ", pri_high: "అధిక ఆవశ్యకత", pri_crit: "క్లిష్టమైన ప్రమాదం",
            form_desc_label: "వివరాలు", form_desc_btn: "నిర్మాణ వచనం", form_desc_ph: "సమస్య గురించి వివరాలను అందించండి...",
            priv_title: "అనామక సమర్పణ", priv_sub: "పబ్లిక్ రికార్డ్ నుండి మీ గుర్తింపును దాచండి.",
            submit_btn: "నివేదికను సమర్పించండి", submit_proc: "సమర్పిస్తోంది...",
            map_title: "స్థానం", ev_title: "దృశ్య ఆధారం", ev_sub: "చిత్రాన్ని ఎంచుకోండి", ev_sub2: "JPEG, PNG మద్దతు ఉంది", ev_ready: "అప్‌లోడ్ కోసం సిద్ధంగా ఉంది",
            err_title: "శీర్షికలో కనీసం 5 అక్షరాలు ఉండాలి", err_cat: "దయచేసి ఒక వర్గాన్ని ఎంచుకోండి", err_desc: "దయచేసి మరింత వివరణాత్మక వివరణను అందించండి (కనీసం 20 అక్షరాలు)",
            alert_map: "కొనసాగడానికి ముందు దయచేసి మ్యాప్‌లో ఖచ్చితమైన స్థానాన్ని గుర్తించండి.", alert_fail: "సమర్పణ విఫలమైంది. మీ నివేదిక డ్రాఫ్ట్‌గా సేవ్ చేయబడింది.",
            succ_title: "నివేదిక సమర్పించబడింది", succ_sub: "సమస్య నమోదు చేయబడింది. ప్రాధాన్యత ప్రకారం బృందాలు పంపబడతాయి."
        },
        ta: {
            lang: "தமிழ்", help: "உதவி மையம்", back: "டாஷ்போர்டுக்குத் திரும்பு", log_out: "வெளியேறு", careers: "தொழில்கள்",
            title: "பிரச்சனையைப் புகாரளிக்கவும்", sub: "உள்கட்டமைப்பு பராமரிப்பு குறித்து நிர்வாகிகளுக்கு தெரிவிக்க கீழே உள்ள படிவத்தை பூர்த்தி செய்யவும்.",
            form_cat: "வகைப்பாடு", form_title_label: "அறிக்கை தலைப்பு", form_title_ph: "பிரச்சனையின் சுருக்கமான அடையாளம்",
            form_div_label: "வகை", form_div_ph: "பிரிவைத் தேர்ந்தெடுக்கவும்...",
            cat_road: "சாலை பராமரிப்பு", cat_san: "சுகாதார சேவைகள்", cat_water: "நீர் வழங்கல்", cat_elec: "மின்சார கட்டம்", cat_safe: "பொது பாதுகாப்பு",
            form_pri_label: "முன்னுரிமை", pri_std: "நிலையான பராமரிப்பு", pri_high: "அதிக அவசரம்", pri_crit: "முக்கியமான ஆபத்து",
            form_desc_label: "விவரங்கள்", form_desc_btn: "கட்டமைப்பு உரை", form_desc_ph: "பிரச்சனை பற்றிய விவரங்களை வழங்கவும்...",
            priv_title: "அநாமதேய சமர்ப்பிப்பு", priv_sub: "பொது பதிவிலிருந்து உங்கள் அடையாளத்தை மறைக்கவும்.",
            submit_btn: "அறிக்கையை சமர்ப்பிக்கவும்", submit_proc: "சமர்ப்பிக்கிறது...",
            map_title: "இடம்", ev_title: "காட்சி சான்று", ev_sub: "படத்தைத் தேர்ந்தெடுக்கவும்", ev_sub2: "JPEG, PNG ஆதரிக்கப்படுகிறது", ev_ready: "பதிவேற்றத்திற்கு தயார்",
            err_title: "தலைப்பில் குறைந்தது 5 எழுத்துக்கள் இருக்க வேண்டும்", err_cat: "தயவுசெய்து ஒரு வகையை தேர்ந்தெடுக்கவும்", err_desc: "மேலும் விரிவான விளக்கத்தை வழங்கவும் (குறைந்தது 20 எழுத்துக்கள்)",
            alert_map: "தொடர்வதற்கு முன் வரைபடத்தில் சரியான இடத்தை அடையாளம் காணவும்.", alert_fail: "சமர்ப்பிப்பு தோல்வியடைந்தது. உங்கள் அறிக்கை வரைவாக சேமிக்கப்பட்டுள்ளது.",
            succ_title: "அறிக்கை சமர்ப்பிக்கப்பட்டது", succ_sub: "பிரச்சனை பதிவு செய்யப்பட்டுள்ளது. முன்னுரிமைப்படி குழுக்கள் அனுப்பப்படும்."
        },
        pa: {
            lang: "ਪੰਜਾਬੀ", help: "ਸਹਾਇਤਾ ਕੇਂਦਰ", back: "ਡੈਸ਼ਬੋਰਡ 'ਤੇ ਵਾਪਸ ਜਾਓ", log_out: "ਲੌਗ ਆਉਟ", careers: "ਕਰੀਅਰ",
            title: "ਸਮੱਸਿਆ ਦੀ ਰਿਪੋਰਟ ਕਰੋ", sub: "ਬੁਨਿਆਦੀ ਢਾਂਚੇ ਦੇ ਰੱਖ-ਰਖਾਅ ਬਾਰੇ ਪ੍ਰਸ਼ਾਸਕਾਂ ਨੂੰ ਸੂਚਿਤ ਕਰਨ ਲਈ ਹੇਠਾਂ ਦਿੱਤਾ ਫਾਰਮ ਭਰੋ।",
            form_cat: "ਵਰਗੀਕਰਨ", form_title_label: "ਰਿਪੋਰਟ ਦਾ ਸਿਰਲੇਖ", form_title_ph: "ਸਮੱਸਿਆ ਦੀ ਸੰਖੇਪ ਪਛਾਣ",
            form_div_label: "ਸ਼੍ਰੇਣੀ", form_div_ph: "ਵਿਭਾਗ ਚੁਣੋ...",
            cat_road: "ਸੜਕ ਦੀ ਸਾਂਭ-ਸੰਭਾਲ", cat_san: "ਸੈਨੀਟੇਸ਼ਨ ਸੇਵਾਵਾਂ", cat_water: "ਪਾਣੀ ਦੀ ਸਪਲਾਈ", cat_elec: "ਇਲੈਕਟ੍ਰੀਕਲ ਗਰਿੱਡ", cat_safe: "ਜਨਤਕ ਸੁਰੱਖਿਆ",
            form_pri_label: "ਤਰਜੀਹ", pri_std: "ਮਿਆਰੀ ਰੱਖ-ਰਖਾਅ", pri_high: "ਉੱਚ ਜ਼ਰੂਰੀ", pri_crit: "ਗੰਭੀਰ ਖਤਰਾ",
            form_desc_label: "ਵੇਰਵੇ", form_desc_btn: "ਬਣਤਰ ਟੈਕਸਟ", form_desc_ph: "ਸਮੱਸਿਆ ਬਾਰੇ ਵੇਰਵੇ ਪ੍ਰਦਾਨ ਕਰੋ...",
            priv_title: "ਗੁਮਨਾਮ ਸਬਮਿਸ਼ਨ", priv_sub: "ਜਨਤਕ ਰਿਕਾਰਡ ਤੋਂ ਆਪਣੀ ਪਛਾਣ ਲੁਕਾਓ।",
            submit_btn: "ਰਿਪੋਰਟ ਜਮ੍ਹਾਂ ਕਰੋ", submit_proc: "ਜਮ੍ਹਾਂ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...",
            map_title: "ਸਥਾਨ", ev_title: "ਵਿਜ਼ੂਅਲ ਸਬੂਤ", ev_sub: "ਚਿੱਤਰ ਚੁਣੋ", ev_sub2: "JPEG, PNG ਸਮਰਥਿਤ ਹਨ", ev_ready: "ਅੱਪਲੋਡ ਲਈ ਤਿਆਰ",
            err_title: "ਸਿਰਲੇਖ ਵਿੱਚ ਘੱਟੋ-ਘੱਟ 5 ਅੱਖਰ ਹੋਣੇ ਚਾਹੀਦੇ ਹਨ", err_cat: "ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਸ਼੍ਰੇਣੀ ਚੁਣੋ", err_desc: "ਕਿਰਪਾ ਕਰਕੇ ਵਧੇਰੇ ਵਿਸਤ੍ਰਿਤ ਵਰਣਨ ਪ੍ਰਦਾਨ ਕਰੋ (ਘੱਟੋ-ਘੱਟ 20 ਅੱਖਰ)",
            alert_map: "ਕਿਰਪਾ ਕਰਕੇ ਅੱਗੇ ਵਧਣ ਤੋਂ ਪਹਿਲਾਂ ਨਕਸ਼ੇ 'ਤੇ ਸਹੀ ਸਥਾਨ ਦੀ ਪਛਾਣ ਕਰੋ।", alert_fail: "ਸਬਮਿਸ਼ਨ ਅਸਫਲ ਰਿਹਾ। ਤੁਹਾਡੀ ਰਿਪੋਰਟ ਡਰਾਫਟ ਵਜੋਂ ਸੁਰੱਖਿਅਤ ਕੀਤੀ ਗਈ ਹੈ।",
            succ_title: "ਰਿਪੋਰਟ ਜਮ੍ਹਾਂ ਕੀਤੀ ਗਈ", succ_sub: "ਸਮੱਸਿਆ ਦਰਜ ਕਰ ਲਈ ਗਈ ਹੈ। ਤਰਜੀਹ ਅਨੁਸਾਰ ਟੀਮਾਂ ਭੇਜੀਆਂ ਜਾਣਗੀਆਂ।"
        },
        bho: {
            lang: "भोजपुरी", help: "मदद केंद्र", back: "डैशबोर्ड पर वापस जाईं", log_out: "लॉग आउट", careers: "करियर",
            title: "समस्या के रिपोर्ट करीं", sub: "प्रशासक लोग के बुनियादी ढांचा के रखरखाव के सूचना देवे खातिर नीचे दिहल फॉर्म भरीं।",
            form_cat: "वर्गीकरण", form_title_label: "रिपोर्ट के शीर्षक", form_title_ph: "समस्या के संक्षिप्त पहचान",
            form_div_label: "श्रेणी", form_div_ph: "विभाग चुनीं...",
            cat_road: "सड़क रखरखाव", cat_san: "स्वच्छता सेवा", cat_water: "जल आपूर्ति", cat_elec: "इलेक्ट्रिकल ग्रिड", cat_safe: "सार्वजनिक सुरक्षा",
            form_pri_label: "प्राथमिकता", pri_std: "मानक रखरखाव", pri_high: "अधिक तात्कालिकता", pri_crit: "गंभीर खतरा",
            form_desc_label: "विवरण", form_desc_btn: "संरचना पाठ", form_desc_ph: "समस्या के बारे में विवरण दीं...",
            priv_title: "गुमनाम सबमिशन", priv_sub: "सार्वजनिक रिकॉर्ड से आपन पहचान छिपाईं।",
            submit_btn: "रिपोर्ट जमा करीं", submit_proc: "जमा हो रहल बा...",
            map_title: "स्थान", ev_title: "दृश्य साक्ष्य", ev_sub: "छवि चुनीं", ev_sub2: "JPEG, PNG समर्थित", ev_ready: "अपलोड खातिर तइयार",
            err_title: "शीर्षक में कम से कम 5 अक्षर होखे के चाहीं", err_cat: "कृपया एगो श्रेणी चुनीं", err_desc: "कृपया अउरी विस्तृत विवरण दीं (कम से कम 20 अक्षर)",
            alert_map: "कृपया आगे बढ़े से पहिले नक्शा पर सटीक स्थान के पहचान करीं।", alert_fail: "सबमिशन विफल हो गइल। राउर रिपोर्ट ड्राफ्ट के रूप में सहेज लिहल गइल बा।",
            succ_title: "रिपोर्ट जमा भइल", succ_sub: "समस्या दर्ज क लिहल गइल बा। प्राथमिकता के अनुसार टीम भेजल जाई।"
        },
        ar: {
            lang: "العربية", help: "مركز المساعدة", back: "العودة إلى لوحة القيادة", log_out: "تسجيل الخروج", careers: "الوظائف",
            title: "الإبلاغ عن مشكلة", sub: "أكمل النموذج أدناه لإخطار المسؤولين بصيانة البنية التحتية المطلوبة.",
            form_cat: "التصنيف", form_title_label: "عنوان التقرير", form_title_ph: "تحديد موجز للمشكلة",
            form_div_label: "الفئة", form_div_ph: "اختر القسم...", 
            cat_road: "صيانة الطرق", cat_san: "خدمات الصرف الصحي", cat_water: "إمدادات المياه", cat_elec: "الشبكة الكهربائية", cat_safe: "السلامة العامة",
            form_pri_label: "الأولوية", pri_std: "صيانة قياسية", pri_high: "إلحاح شديد", pri_crit: "خطر حرج",
            form_desc_label: "التفاصيل", form_desc_btn: "نص الهيكل", form_desc_ph: "قدم تفاصيل حول المشكلة...",
            priv_title: "تقديم مجهول", priv_sub: "إخفاء هويتك من السجل العام.",
            submit_btn: "إرسال التقرير", submit_proc: "جاري الإرسال...",
            map_title: "الموقع", ev_title: "الأدلة البصرية", ev_sub: "تحديد صورة", ev_sub2: "تنسيقات JPEG و PNG مدعومة", ev_ready: "جاهز للتحميل",
            err_title: "يجب أن يحتوي العنوان على 5 أحرف على الأقل", err_cat: "يرجى تحديد فئة", err_desc: "يرجى تقديم وصف أكثر تفصيلاً (20 حرفًا على الأقل)",
            alert_map: "يرجى تحديد الموقع الدقيق على الخريطة قبل المتابعة.", alert_fail: "فشل الإرسال. تم حفظ تقريرك كمسودة.",
            succ_title: "تم إرسال التقرير", succ_sub: "تم تسجيل المشكلة. سيتم إرسال الفرق حسب الأولوية."
        },
        es: {
            lang: "Español", help: "Centro de ayuda", back: "Volver al Tablero", log_out: "Cerrar sesión", careers: "Carreras",
            title: "Reportar Problema", sub: "Complete el formulario para notificar a los administradores sobre el mantenimiento requerido.",
            form_cat: "Categorización", form_title_label: "Título del Reporte", form_title_ph: "Breve identificación del problema",
            form_div_label: "Categoría", form_div_ph: "Seleccione División...", 
            cat_road: "Mantenimiento de Carreteras", cat_san: "Servicios de Saneamiento", cat_water: "Suministro de Agua", cat_elec: "Red Eléctrica", cat_safe: "Seguridad Pública",
            form_pri_label: "Prioridad", pri_std: "Mantenimiento Estándar", pri_high: "Alta Urgencia", pri_crit: "Peligro Crítico",
            form_desc_label: "Detalles", form_desc_btn: "Estructurar Texto", form_desc_ph: "Proporcione detalles sobre el problema...",
            priv_title: "Envío Anónimo", priv_sub: "Oculte su identidad del registro público.",
            submit_btn: "Enviar Reporte", submit_proc: "Enviando...",
            map_title: "Ubicación", ev_title: "Evidencia Visual", ev_sub: "Seleccionar Imagen", ev_sub2: "JPEG, PNG soportados", ev_ready: "Listo para cargar",
            err_title: "El título debe contener al menos 5 caracteres", err_cat: "Por favor seleccione una categoría", err_desc: "Por favor proporcione una descripción más detallada (mínimo 20 caracteres)",
            alert_map: "Por favor identifique la ubicación exacta en el mapa antes de proceder.", alert_fail: "Fallo en el envío. Su reporte ha sido guardado como borrador.",
            succ_title: "Reporte Enviado", succ_sub: "El problema ha sido registrado. Los equipos serán despachados según la prioridad."
        },
        fr: {
            lang: "Français", help: "Centre d'aide", back: "Retour au Tableau de bord", log_out: "Se déconnecter", careers: "Carrières",
            title: "Signaler un Problème", sub: "Remplissez le formulaire ci-dessous pour informer les administrateurs de l'entretien requis.",
            form_cat: "Catégorisation", form_title_label: "Titre du Rapport", form_title_ph: "Brève identification du problème",
            form_div_label: "Catégorie", form_div_ph: "Sélectionnez la Division...", 
            cat_road: "Entretien Routier", cat_san: "Services d'Assainissement", cat_water: "Approvisionnement en Eau", cat_elec: "Réseau Électrique", cat_safe: "Sécurité Publique",
            form_pri_label: "Priorité", pri_std: "Entretien Standard", pri_high: "Haute Urgence", pri_crit: "Danger Critique",
            form_desc_label: "Détails", form_desc_btn: "Structurer le Texte", form_desc_ph: "Fournissez des détails sur le problème...",
            priv_title: "Soumission Anonyme", priv_sub: "Cachez votre identité du registre public.",
            submit_btn: "Soumettre le Rapport", submit_proc: "Soumission...",
            map_title: "Emplacement", ev_title: "Preuve Visuelle", ev_sub: "Sélectionner une Image", ev_sub2: "JPEG, PNG pris en charge", ev_ready: "Prêt pour le téléchargement",
            err_title: "Le titre doit contenir au moins 5 caractères", err_cat: "Veuillez sélectionner une catégorie", err_desc: "Veuillez fournir une description plus détaillée (minimum 20 caractères)",
            alert_map: "Veuillez identifier l'emplacement exact sur la carte avant de continuer.", alert_fail: "Échec de la soumission. Votre rapport a été enregistré comme brouillon.",
            succ_title: "Rapport Soumis", succ_sub: "Le problème a été enregistré. Des équipes seront dépêchées selon la priorité."
        },
        de: {
            lang: "Deutsch", help: "Hilfezentrum", back: "Zurück zum Dashboard", log_out: "Abmelden", careers: "Karriere",
            title: "Problem Melden", sub: "Füllen Sie das Formular aus, um Administratoren über die erforderliche Wartung zu informieren.",
            form_cat: "Kategorisierung", form_title_label: "Berichtstitel", form_title_ph: "Kurze Identifikation des Problems",
            form_div_label: "Kategorie", form_div_ph: "Abteilung Auswählen...", 
            cat_road: "Straßeninstandhaltung", cat_san: "Sanitärdienste", cat_water: "Wasserversorgung", cat_elec: "Stromnetz", cat_safe: "Öffentliche Sicherheit",
            form_pri_label: "Priorität", pri_std: "Standardwartung", pri_high: "Hohe Dringlichkeit", pri_crit: "Kritische Gefahr",
            form_desc_label: "Details", form_desc_btn: "Text Strukturieren", form_desc_ph: "Geben Sie Details zum Problem an...",
            priv_title: "Anonyme Einreichung", priv_sub: "Verbergen Sie Ihre Identität in der öffentlichen Akte.",
            submit_btn: "Bericht Einreichen", submit_proc: "Einreichen...",
            map_title: "Standort", ev_title: "Visueller Beweis", ev_sub: "Bild Auswählen", ev_sub2: "JPEG, PNG unterstützt", ev_ready: "Bereit zum Hochladen",
            err_title: "Titel muss mindestens 5 Zeichen enthalten", err_cat: "Bitte wählen Sie eine Kategorie aus", err_desc: "Bitte geben Sie eine detailliertere Beschreibung an (mindestens 20 Zeichen)",
            alert_map: "Bitte identifizieren Sie den genauen Standort auf der Karte, bevor Sie fortfahren.", alert_fail: "Einreichung fehlgeschlagen. Ihr Bericht wurde als Entwurf gespeichert.",
            succ_title: "Bericht Eingereicht", succ_sub: "Das Problem wurde registriert. Teams werden nach Priorität entsandt."
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

    // Schema mapped dynamically to translation dictionary
    const dynamicSchema = z.object({
        title: z.string().min(5, currentT.err_title).max(100),
        category: z.string().min(1, currentT.err_cat),
        priority: z.enum(['Standard', 'High', 'Critical']),
        description: z.string().min(20, currentT.err_desc),
        isAnonymous: z.boolean().default(false)
    });

    const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(dynamicSchema),
        defaultValues: {
            title: '',
            category: '',
            priority: 'Standard',
            description: '',
            isAnonymous: false
        }
    });

    const currentCategory = watch('category');
    const currentDescription = watch('description');

    useEffect(() => {
        const checkDuplicates = async () => {
            if (selectedLocation && currentCategory) {
                const prefix = generateGeohash(selectedLocation[0], selectedLocation[1], 6);
                try {
                    const duplicates = await findNearbyDuplicate(prefix, currentCategory);
                    if (duplicates && duplicates.length > 0) {
                        setDuplicateFound(duplicates[0]);
                        setShowDuplicateWarning(true);
                    } else {
                        setDuplicateFound(null);
                        setShowDuplicateWarning(false);
                    }
                } catch (error) {
                    console.error("Proximity scan error:", error);
                }
            }
        };
        checkDuplicates();
    }, [selectedLocation, currentCategory]);

    const enhanceDescription = () => {
        if (!currentDescription || currentDescription.length < 10) return;
        const structuredText = `OFFICIAL INCIDENT REPORT\nCategory: ${currentCategory || 'Unspecified'}\nPriority Assessment: Pending Review\nDetails: ${currentDescription.charAt(0).toUpperCase() + currentDescription.slice(1)}\n\nPlease deploy necessary assessment personnel to evaluate the reported condition.`;
        setValue('description', structuredText);
    };

    const handleFileSelection = (e) => {
        if (e.target.files && e.target.files[0]) {
            setEvidenceFile(e.target.files[0]);
        }
    };

    const processSubmission = async (data) => {
        if (!selectedLocation) {
            alert(currentT.alert_map);
            return;
        }
        setIsProcessing(true);
        try {
            let evidenceUrl = null;
            if (evidenceFile) {
                evidenceUrl = await uploadCivicEvidence(evidenceFile);
            }
            const activeUser = auth.currentUser;
            const finalPayload = {
                title: data.title,
                category: data.category,
                priority: data.priority,
                description: data.description,
                isAnonymous: data.isAnonymous,
                location: { latitude: selectedLocation[0], longitude: selectedLocation[1] },
                geohash: generateGeohash(selectedLocation[0], selectedLocation[1]),
                evidenceUrl: evidenceUrl,
                userId: data.isAnonymous ? 'ANONYMOUS_CITIZEN' : (activeUser ? activeUser.uid : 'UNREGISTERED_CITIZEN'),
                ward: 'Zone A',
            };
            await submitCivicComplaint(finalPayload);
            setSubmissionSuccess(true);
            setTimeout(() => { navigate('/civic'); }, 3000);
        } catch (error) {
            console.error("Submission processing failed:", error);
            saveDraft(data);
            alert(currentT.alert_fail);
            setIsProcessing(false);
        }
    };

    const handleSupportExisting = async () => {
        if (!duplicateFound) return;
        setIsProcessing(true);
        try {
            await addCommunitySupport(duplicateFound.id);
            setShowDuplicateWarning(false);
            setSubmissionSuccess(true);
            setTimeout(() => navigate('/civic'), 3000);
        } catch (error) {
            setIsProcessing(false);
        }
    };

    if (submissionSuccess) {
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${theme === 'light' ? 'bg-[#f5f5f5] text-black' : 'bg-[#050505] text-white'}`}>
                <CheckCircle size={64} className={theme === 'light' ? 'text-black mb-6' : 'text-[#ffffff] mb-6'} />
                <h1 className="text-[2.5rem] font-black tracking-tight mb-4 text-center">{currentT.succ_title}</h1>
                <p className={`text-center max-w-[400px] ${theme === 'light' ? 'text-[#555555]' : 'text-[#888888]'}`}>
                    {currentT.succ_sub}
                </p>
            </div>
        );
    }

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

            <DuplicateWarning 
                isVisible={showDuplicateWarning} 
                existingIssue={duplicateFound} 
                onSupportExisting={handleSupportExisting}
                onProceedAnyway={() => setShowDuplicateWarning(false)}
                onClose={() => setShowDuplicateWarning(false)}
            />

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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit(processSubmission)} className="flex flex-col gap-6">
                            
                            {/* Basic Details */}
                            <div className={`rounded-2xl p-6 md:p-8 border ${theme === 'light' ? 'bg-white border-[#e0e0e0]' : 'bg-[#111111] border-[#333333]'}`}>
                                <h3 className="text-[1.2rem] font-black mb-6 flex items-center gap-2">
                                    <FileText size={20} /> {currentT.form_cat}
                                </h3>
                                
                                <div className="flex flex-col gap-5">
                                    <div>
                                        <label className={`block text-[0.85rem] font-bold mb-2 uppercase tracking-wider ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{currentT.form_title_label}</label>
                                        <Controller
                                            name="title"
                                            control={control}
                                            render={({ field }) => (
                                                <input {...field} placeholder={currentT.form_title_ph} className={`w-full px-4 py-3 rounded-xl outline-none transition-colors text-[0.95rem] border ${
                                                    theme === 'light' ? 'bg-[#f5f5f5] border-[#cccccc] text-black focus:border-black' : 'bg-[#000000] border-[#333333] text-white focus:border-white'
                                                }`} />
                                            )}
                                        />
                                        {errors.title && <span className="text-red-500 text-[0.8rem] mt-1 block">{errors.title.message}</span>}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className={`block text-[0.85rem] font-bold mb-2 uppercase tracking-wider ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{currentT.form_div_label}</label>
                                            <Controller
                                                name="category"
                                                control={control}
                                                render={({ field }) => (
                                                    <select {...field} className={`w-full px-4 py-3 rounded-xl outline-none transition-colors text-[0.95rem] appearance-none border ${
                                                        theme === 'light' ? 'bg-[#f5f5f5] border-[#cccccc] text-black focus:border-black' : 'bg-[#000000] border-[#333333] text-white focus:border-white'
                                                    }`}>
                                                        <option value="">{currentT.form_div_ph}</option>
                                                        <option value="Road Maintenance">{currentT.cat_road}</option>
                                                        <option value="Sanitation Services">{currentT.cat_san}</option>
                                                        <option value="Water Supply">{currentT.cat_water}</option>
                                                        <option value="Electrical Grid">{currentT.cat_elec}</option>
                                                        <option value="Public Safety">{currentT.cat_safe}</option>
                                                    </select>
                                                )}
                                            />
                                            {errors.category && <span className="text-red-500 text-[0.8rem] mt-1 block">{errors.category.message}</span>}
                                        </div>

                                        <div>
                                            <label className={`block text-[0.85rem] font-bold mb-2 uppercase tracking-wider ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{currentT.form_pri_label}</label>
                                            <Controller
                                                name="priority"
                                                control={control}
                                                render={({ field }) => (
                                                    <select {...field} className={`w-full px-4 py-3 rounded-xl outline-none transition-colors text-[0.95rem] appearance-none border ${
                                                        theme === 'light' ? 'bg-[#f5f5f5] border-[#cccccc] text-black focus:border-black' : 'bg-[#000000] border-[#333333] text-white focus:border-white'
                                                    }`}>
                                                        <option value="Standard">{currentT.pri_std}</option>
                                                        <option value="High">{currentT.pri_high}</option>
                                                        <option value="Critical">{currentT.pri_crit}</option>
                                                    </select>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className={`block text-[0.85rem] font-bold uppercase tracking-wider ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{currentT.form_desc_label}</label>
                                            <button type="button" onClick={enhanceDescription} className={`text-[0.8rem] font-bold transition-colors flex items-center gap-1 outline-none ${
                                                theme === 'light' ? 'text-[#888888] hover:text-black' : 'text-[#aaaaaa] hover:text-white'
                                            }`}>
                                                <Wand2 size={14} /> {currentT.form_desc_btn}
                                            </button>
                                        </div>
                                        <Controller
                                            name="description"
                                            control={control}
                                            render={({ field }) => (
                                                <textarea {...field} rows="5" placeholder={currentT.form_desc_ph} className={`w-full px-4 py-3 rounded-xl outline-none transition-colors text-[0.95rem] resize-none border ${
                                                    theme === 'light' ? 'bg-[#f5f5f5] border-[#cccccc] text-black focus:border-black' : 'bg-[#000000] border-[#333333] text-white focus:border-white'
                                                }`}></textarea>
                                            )}
                                        />
                                        {errors.description && <span className="text-red-500 text-[0.8rem] mt-1 block">{errors.description.message}</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Privacy Controls */}
                            <div className={`rounded-2xl p-6 md:p-8 flex items-center justify-between border ${theme === 'light' ? 'bg-white border-[#e0e0e0]' : 'bg-[#111111] border-[#333333]'}`}>
                                <div>
                                    <h3 className="text-[1.1rem] font-black flex items-center gap-2 mb-1">
                                        <EyeOff size={18} /> {currentT.priv_title}
                                    </h3>
                                    <p className={`text-[0.85rem] ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{currentT.priv_sub}</p>
                                </div>
                                <Controller
                                    name="isAnonymous"
                                    control={control}
                                    render={({ field }) => (
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={field.value} onChange={field.onChange} />
                                            <div className={`w-11 h-6 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                                                theme === 'light' 
                                                    ? 'bg-[#e0e0e0] peer-checked:after:border-black after:bg-white after:border-gray-300 peer-checked:bg-black' 
                                                    : 'bg-[#333333] peer-checked:after:border-white after:bg-white after:border-gray-300 peer-checked:bg-[#ffffff]'
                                            }`}></div>
                                        </label>
                                    )}
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={isProcessing || duplicateFound !== null}
                                className={`w-full py-4 rounded-xl font-black text-[1rem] transition-colors disabled:opacity-50 disabled:cursor-not-allowed outline-none mt-4 ${
                                    theme === 'light' ? 'bg-black text-white hover:bg-[#333333]' : 'bg-white text-black hover:bg-[#e0e0e0]'
                                }`}
                            >
                                {isProcessing ? currentT.submit_proc : currentT.submit_btn}
                            </button>
                        </form>
                    </div>

                    <div className="lg:col-span-1 flex flex-col gap-6">
                        {/* Interactive Location Picker */}
                        <div className={`border rounded-2xl p-6 ${theme === 'light' ? 'bg-white border-[#e0e0e0]' : 'bg-[#111111] border-[#333333]'}`}>
                            <h3 className="text-[1.1rem] font-black mb-4 flex items-center gap-2">
                                <MapPin size={18} /> {currentT.map_title}
                            </h3>
                            <LocationPicker onLocationSelect={(coords) => setSelectedLocation([coords.latitude, coords.longitude])} />
                        </div>

                        {/* Evidence Upload */}
                        <div className={`border rounded-2xl p-6 ${theme === 'light' ? 'bg-white border-[#e0e0e0]' : 'bg-[#111111] border-[#333333]'}`}>
                            <h3 className="text-[1.1rem] font-black mb-4 flex items-center gap-2">
                                <UploadCloud size={18} /> {currentT.ev_title}
                            </h3>
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className={`w-full border-2 border-dashed transition-colors rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer text-center ${
                                    theme === 'light' ? 'border-[#cccccc] hover:border-black bg-[#f9f9f9]' : 'border-[#333333] hover:border-white bg-[#0a0a0a]'
                                }`}
                            >
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleFileSelection} 
                                    accept="image/*" 
                                    className="hidden" 
                                />
                                {evidenceFile ? (
                                    <>
                                        <CheckCircle size={28} className={`mb-2 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
                                        <span className={`text-[0.9rem] font-bold break-all ${theme === 'light' ? 'text-black' : 'text-white'}`}>{evidenceFile.name}</span>
                                        <span className={`text-[0.8rem] mt-1 ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{currentT.ev_ready}</span>
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud size={28} className={`mb-2 ${theme === 'light' ? 'text-[#888888]' : 'text-[#555555]'}`} />
                                        <span className={`text-[0.9rem] font-bold ${theme === 'light' ? 'text-black' : 'text-white'}`}>{currentT.ev_sub}</span>
                                        <span className={`text-[0.8rem] mt-1 ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{currentT.ev_sub2}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
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