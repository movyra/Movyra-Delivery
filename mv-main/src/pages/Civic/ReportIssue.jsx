import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
    Moon
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { 
    uploadCivicEvidence, 
    submitCivicComplaint, 
    findNearbyDuplicate,
    addCommunitySupport
} from '../../services/civicService';
import { useCivicStore } from '../../store/useCivicStore';
import { auth } from '../../firebaseConfig';

// Fix for default Leaflet marker icons missing in build pipelines
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

// Interactive map component to extract exact geographic coordinates
function LocationSelector({ position, setPosition }) {
    useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
        },
    });
    return position ? <Marker position={position} /> : null;
}

export default function ReportIssue() {
    const navigate = useNavigate();
    const saveDraft = useCivicStore((state) => state.saveDraft);
    
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
    const fileInputRef = useRef(null);

    useEffect(() => {
        // Detect System Language
        const sysLang = navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'mr', 'gu', 'te', 'ta', 'pa', 'bho', 'ar', 'es', 'fr', 'de'];
        if (supported.includes(sysLang)) setLang(sysLang);
    }, []);

    // 2. 13-LANGUAGE DICTIONARY (Reporting Context)
    const t = {
        en: {
            lang: "English", help: "Help Center", back: "Return to Operations Portal",
            title: "Incident Report", sub: "Complete the documentation below to notify administrative personnel of required infrastructure maintenance.",
            form_cat: "Categorization", form_title_label: "Report Title", form_title_ph: "Brief identification of the issue",
            form_div_label: "Operational Category", form_div_ph: "Select Division...", 
            cat_road: "Road Maintenance", cat_san: "Sanitation Services", cat_water: "Water Supply", cat_elec: "Electrical Grid", cat_safe: "Public Safety",
            form_pri_label: "Priority Level", pri_std: "Standard Maintenance", pri_high: "High Urgency", pri_crit: "Critical Hazard",
            form_desc_label: "Detailed Assessment", form_desc_btn: "Structure Text", form_desc_ph: "Provide complete operational details regarding the deficiency...",
            priv_title: "Anonymous Submission", priv_sub: "Omit your personal identification from the public administrative record.",
            submit_btn: "Submit Incident Report", submit_proc: "Transmitting Data...",
            dup_title: "Existing Incident Detected", dup_sub: "Administrative records indicate a similar deficiency is currently under review for this exact location.", dup_btn: "Register Community Support",
            map_title: "Geographic Location", map_sub: "Tap the map to designate the precise incident coordinates.",
            ev_title: "Visual Evidence", ev_sub: "Select Documentation", ev_sub2: "JPEG, PNG formats supported", ev_ready: "Ready for transmission",
            err_title: "Title must contain at least 5 characters", err_cat: "Please select an operational category", err_desc: "Please provide a more detailed description (minimum 20 characters)",
            alert_map: "Please identify the exact geographic location on the map before proceeding.", alert_fail: "Network transmission failed. Your report has been saved securely to local storage.",
            succ_title: "Report Transmitted", succ_sub: "The infrastructure deficiency has been successfully registered in the municipal database. Operations teams will be dispatched according to the assigned priority level."
        },
        hi: {
            lang: "हिन्दी", help: "सहायता केंद्र", back: "ऑपरेशंस पोर्टल पर लौटें",
            title: "घटना रिपोर्ट", sub: "आवश्यक बुनियादी ढांचे के रखरखाव के प्रशासनिक कर्मियों को सूचित करने के लिए नीचे दिए गए दस्तावेज़ को पूरा करें।",
            form_cat: "वर्गीकरण", form_title_label: "रिपोर्ट का शीर्षक", form_title_ph: "समस्या की संक्षिप्त पहचान",
            form_div_label: "परिचालन श्रेणी", form_div_ph: "विभाग चुनें...",
            cat_road: "सड़क रखरखाव", cat_san: "स्वच्छता सेवाएं", cat_water: "जल आपूर्ति", cat_elec: "इलेक्ट्रिकल ग्रिड", cat_safe: "सार्वजनिक सुरक्षा",
            form_pri_label: "प्राथमिकता स्तर", pri_std: "मानक रखरखाव", pri_high: "अत्यधिक तात्कालिकता", pri_crit: "गंभीर खतरा",
            form_desc_label: "विस्तृत मूल्यांकन", form_desc_btn: "संरचना पाठ", form_desc_ph: "कमी के संबंध में संपूर्ण परिचालन विवरण प्रदान करें...",
            priv_title: "गुमनाम सबमिशन", priv_sub: "सार्वजनिक प्रशासनिक रिकॉर्ड से अपनी व्यक्तिगत पहचान हटा दें।",
            submit_btn: "घटना रिपोर्ट जमा करें", submit_proc: "डेटा संचारित किया जा रहा है...",
            dup_title: "मौजूदा घटना का पता चला", dup_sub: "प्रशासनिक रिकॉर्ड दर्शाते हैं कि इस सटीक स्थान के लिए वर्तमान में एक समान कमी की समीक्षा की जा रही है।", dup_btn: "सामुदायिक समर्थन दर्ज करें",
            map_title: "भौगोलिक स्थिति", map_sub: "सटीक घटना निर्देशांक निर्दिष्ट करने के लिए मानचित्र पर टैप करें।",
            ev_title: "दृश्य साक्ष्य", ev_sub: "दस्तावेज़ का चयन करें", ev_sub2: "JPEG, PNG स्वरूप समर्थित", ev_ready: "प्रसारण के लिए तैयार",
            err_title: "शीर्षक में कम से कम 5 अक्षर होने चाहिए", err_cat: "कृपया एक परिचालन श्रेणी चुनें", err_desc: "कृपया अधिक विस्तृत विवरण प्रदान करें (न्यूनतम 20 अक्षर)",
            alert_map: "कृपया आगे बढ़ने से पहले मानचित्र पर सटीक भौगोलिक स्थान की पहचान करें।", alert_fail: "नेटवर्क प्रसारण विफल रहा। आपकी रिपोर्ट स्थानीय संग्रहण में सुरक्षित रूप से सहेज ली गई है।",
            succ_title: "रिपोर्ट प्रसारित", succ_sub: "नगर निगम डेटाबेस में बुनियादी ढांचे की कमी को सफलतापूर्वक दर्ज कर लिया गया है। निर्धारित प्राथमिकता स्तर के अनुसार संचालन दल भेजे जाएंगे।"
        },
        hinglish: {
            lang: "Hinglish", help: "Help Center", back: "Operations Portal par wapas jayein",
            title: "Incident Report", sub: "Required infrastructure maintenance ki jankari admin tak pahunchane ke liye documentation complete karein.",
            form_cat: "Categorization", form_title_label: "Report Title", form_title_ph: "Issue ki short pehchan",
            form_div_label: "Operational Category", form_div_ph: "Division Select Karein...",
            cat_road: "Road Maintenance", cat_san: "Sanitation Services", cat_water: "Water Supply", cat_elec: "Electrical Grid", cat_safe: "Public Safety",
            form_pri_label: "Priority Level", pri_std: "Standard Maintenance", pri_high: "High Urgency", pri_crit: "Critical Hazard",
            form_desc_label: "Detailed Assessment", form_desc_btn: "Structure Text", form_desc_ph: "Issue ke baare me complete operational details dein...",
            priv_title: "Anonymous Submission", priv_sub: "Public admin record se apni personal identification chhipayein.",
            submit_btn: "Incident Report Submit Karein", submit_proc: "Data Transmit ho raha hai...",
            dup_title: "Existing Incident Detected", dup_sub: "Admin records batate hain ki is exact location par ek similar issue pehle se review me hai.", dup_btn: "Community Support Register Karein",
            map_title: "Geographic Location", map_sub: "Exact incident coordinates ke liye map par tap karein.",
            ev_title: "Visual Evidence", ev_sub: "Documentation Select Karein", ev_sub2: "JPEG, PNG formats supported", ev_ready: "Transmission ke liye ready",
            err_title: "Title me kam se kam 5 characters hone chahiye", err_cat: "Please ek operational category select karein", err_desc: "Please aur detailed description dein (minimum 20 characters)",
            alert_map: "Aage badhne se pehle map par exact geographic location identify karein.", alert_fail: "Network transmission fail ho gaya. Aapki report local storage me secure save ho gayi hai.",
            succ_title: "Report Transmitted", succ_sub: "Infrastructure issue municipal database me successfully register ho gaya hai. Priority level ke hisaab se operations teams bhej di jayengi."
        },
        mr: {
            lang: "मराठी", help: "मदत केंद्र", back: "ऑपरेशन्स पोर्टलवर परत जा",
            title: "घटनेचा अहवाल", sub: "आवश्यक पायाभूत सुविधांच्या देखभालीबाबत प्रशासकीय कर्मचाऱ्यांना सूचित करण्यासाठी खालील दस्तऐवज पूर्ण करा.",
            form_cat: "वर्गीकरण", form_title_label: "अहवालाचे शीर्षक", form_title_ph: "समस्येची संक्षिप्त ओळख",
            form_div_label: "ऑपरेशनल श्रेणी", form_div_ph: "विभाग निवडा...",
            cat_road: "रस्ते देखभाल", cat_san: "स्वच्छता सेवा", cat_water: "पाणी पुरवठा", cat_elec: "विद्युत ग्रिड", cat_safe: "सार्वजनिक सुरक्षा",
            form_pri_label: "प्राधान्य पातळी", pri_std: "मानक देखभाल", pri_high: "उच्च तातडी", pri_crit: "गंभीर धोका",
            form_desc_label: "सविस्तर मूल्यांकन", form_desc_btn: "स्ट्रक्चर मजकूर", form_desc_ph: "त्रुटीबाबत संपूर्ण ऑपरेशनल तपशील द्या...",
            priv_title: "निनावी सबमिशन", priv_sub: "सार्वजनिक प्रशासकीय रेकॉर्डमधून तुमची वैयक्तिक ओळख वगळा.",
            submit_btn: "घटना अहवाल सबमिट करा", submit_proc: "डेटा प्रसारित करत आहे...",
            dup_title: "विद्यमान घटना आढळली", dup_sub: "प्रशासकीय नोंदी दर्शवतात की या अचूक स्थानासाठी सध्या तत्सम त्रुटीचे पुनरावलोकन सुरू आहे.", dup_btn: "समुदाय समर्थन नोंदवा",
            map_title: "भौगोलिक स्थान", map_sub: "अचूक घटनेचे निर्देशांक निश्चित करण्यासाठी नकाशावर टॅप करा.",
            ev_title: "व्हिज्युअल पुरावा", ev_sub: "दस्तऐवजीकरण निवडा", ev_sub2: "JPEG, PNG स्वरूपना समर्थित", ev_ready: "प्रसारणासाठी तयार",
            err_title: "शीर्षकामध्ये किमान ५ अक्षरे असणे आवश्यक आहे", err_cat: "कृपया ऑपरेशनल श्रेणी निवडा", err_desc: "कृपया अधिक तपशीलवार वर्णन द्या (किमान २० अक्षरे)",
            alert_map: "कृपया पुढे जाण्यापूर्वी नकाशावर अचूक भौगोलिक स्थान ओळखा.", alert_fail: "नेटवर्क प्रसारण अयशस्वी. तुमचा अहवाल स्थानिक स्टोरेजमध्ये सुरक्षितपणे जतन केला गेला आहे.",
            succ_title: "अहवाल प्रसारित", succ_sub: "महानगरपालिका डेटाबेसमध्ये पायाभूत सुविधांची त्रुटी यशस्वीरित्या नोंदवली गेली आहे. नियुक्त केलेल्या प्राधान्य पातळीनुसार ऑपरेशन्स टीम पाठवल्या जातील."
        },
        gu: {
            lang: "ગુજરાતી", help: "મદદ કેન્દ્ર", back: "ઓપરેશન્સ પોર્ટલ પર પાછા ફરો",
            title: "ઘટના અહેવાલ", sub: "જરૂરી ઈન્ફ્રાસ્ટ્રક્ચર જાળવણી માટે વહીવટી કર્મચારીઓને સૂચિત કરવા માટે નીચેના દસ્તાવેજીકરણ પૂર્ણ કરો.",
            form_cat: "વર્ગીકરણ", form_title_label: "રિપોર્ટ શીર્ષક", form_title_ph: "સમસ્યાની સંક્ષિપ્ત ઓળખ",
            form_div_label: "ઓપરેશનલ શ્રેણી", form_div_ph: "વિભાગ પસંદ કરો...",
            cat_road: "રોડ જાળવણી", cat_san: "સ્વચ્છતા સેવાઓ", cat_water: "પાણી પુરવઠો", cat_elec: "ઇલેક્ટ્રિકલ ગ્રીડ", cat_safe: "જાહેર સુરક્ષા",
            form_pri_label: "પ્રાધાન્ય સ્તર", pri_std: "પ્રમાણભૂત જાળવણી", pri_high: "ઉચ્ચ તાકીદ", pri_crit: "ગંભીર સંકટ",
            form_desc_label: "વિગતવાર આકારણી", form_desc_btn: "સ્ટ્રક્ચર ટેક્સ્ટ", form_desc_ph: "ખામી અંગે સંપૂર્ણ ઓપરેશનલ વિગતો પ્રદાન કરો...",
            priv_title: "અનામી સબમિશન", priv_sub: "જાહેર વહીવટી રેકોર્ડમાંથી તમારી વ્યક્તિગત ઓળખ બાકાત રાખો.",
            submit_btn: "ઘટના રિપોર્ટ સબમિટ કરો", submit_proc: "ડેટા ટ્રાન્સમિટ થઈ રહ્યો છે...",
            dup_title: "હાલની ઘટના મળી", dup_sub: "વહીવટી રેકોર્ડ્સ દર્શાવે છે કે આ ચોક્કસ સ્થાન માટે હાલમાં સમાન ખામીની સમીક્ષા ચાલી રહી છે.", dup_btn: "સમુદાય સમર્થન નોંધાવો",
            map_title: "ભૌગોલિક સ્થાન", map_sub: "ચોક્કસ ઘટના કોઓર્ડિનેટ્સ નિયુક્ત કરવા માટે નકશા પર ટેપ કરો.",
            ev_title: "વિઝ્યુઅલ પુરાવા", ev_sub: "દસ્તાવેજીકરણ પસંદ કરો", ev_sub2: "JPEG, PNG ફોર્મેટ્સ સપોર્ટેડ છે", ev_ready: "ટ્રાન્સમિશન માટે તૈયાર છે",
            err_title: "શીર્ષકમાં ઓછામાં ઓછા 5 અક્ષરો હોવા આવશ્યક છે", err_cat: "કૃપા કરીને ઓપરેશનલ શ્રેણી પસંદ કરો", err_desc: "કૃપા કરીને વધુ વિગતવાર વર્ણન પ્રદાન કરો (ન્યૂનતમ 20 અક્ષરો)",
            alert_map: "આગળ વધતા પહેલા કૃપા કરીને નકશા પર ચોક્કસ ભૌગોલિક સ્થાન ઓળખો.", alert_fail: "નેટવર્ક ટ્રાન્સમિશન નિષ્ફળ ગયું. તમારો રિપોર્ટ સ્થાનિક સ્ટોરેજમાં સુરક્ષિત રીતે સાચવવામાં આવ્યો છે.",
            succ_title: "રિપોર્ટ ટ્રાન્સમિટ થયો", succ_sub: "મ્યુનિસિપલ ડેટાબેઝમાં ઇન્ફ્રાસ્ટ્રક્ચરની ખામી સફળતાપૂર્વક નોંધાઈ છે. ઓપરેશન ટીમોને અસાઇન કરેલ અગ્રતા સ્તર અનુસાર મોકલવામાં આવશે."
        },
        te: {
            lang: "తెలుగు", help: "సహాయ కేంద్రం", back: "ఆపరేషన్స్ పోర్టల్‌కు తిరిగి వెళ్లండి",
            title: "సంఘటన నివేదిక", sub: "అవసరమైన మౌలిక సదుపాయాల నిర్వహణ గురించి నిర్వాహక సిబ్బందికి తెలియజేయడానికి దిగువ పత్రాలను పూర్తి చేయండి.",
            form_cat: "వర్గీకరణ", form_title_label: "నివేదిక శీర్షిక", form_title_ph: "సమస్య యొక్క సంక్షిప్త గుర్తింపు",
            form_div_label: "ఆపరేషనల్ కేటగిరీ", form_div_ph: "విభాగాన్ని ఎంచుకోండి...",
            cat_road: "రహదారి నిర్వహణ", cat_san: "పారిశుద్ధ్య సేవలు", cat_water: "నీటి సరఫరా", cat_elec: "ఎలక్ట్రికల్ గ్రిడ్", cat_safe: "ప్రజా భద్రత",
            form_pri_label: "ప్రాధాన్యత స్థాయి", pri_std: "ప్రామాణిక నిర్వహణ", pri_high: "అధిక ఆవశ్యకత", pri_crit: "క్లిష్టమైన ప్రమాదం",
            form_desc_label: "వివరణాత్మక అంచనా", form_desc_btn: "నిర్మాణ వచనం", form_desc_ph: "లోపానికి సంబంధించి పూర్తి కార్యాచరణ వివరాలను అందించండి...",
            priv_title: "అనామక సమర్పణ", priv_sub: "పబ్లిక్ అడ్మినిస్ట్రేటివ్ రికార్డ్ నుండి మీ వ్యక్తిగత గుర్తింపును మినహాయించండి.",
            submit_btn: "సంఘటన నివేదికను సమర్పించండి", submit_proc: "డేటా ప్రసారం చేయబడుతోంది...",
            dup_title: "ప్రస్తుత సంఘటన కనుగొనబడింది", dup_sub: "అడ్మినిస్ట్రేటివ్ రికార్డులు ఈ ఖచ్చితమైన స్థానం కోసం ఒకే విధమైన లోపం ప్రస్తుతం సమీక్షలో ఉందని సూచిస్తున్నాయి.", dup_btn: "కమ్యూనిటీ మద్దతును నమోదు చేయండి",
            map_title: "భౌగోళిక స్థానం", map_sub: "ఖచ్చితమైన సంఘటన కోఆర్డినేట్‌లను నియమించడానికి మ్యాప్‌ను నొక్కండి.",
            ev_title: "దృశ్య ఆధారం", ev_sub: "డాక్యుమెంటేషన్‌ను ఎంచుకోండి", ev_sub2: "JPEG, PNG ఫార్మాట్‌లకు మద్దతు ఉంది", ev_ready: "ప్రసారం కోసం సిద్ధంగా ఉంది",
            err_title: "శీర్షికలో కనీసం 5 అక్షరాలు ఉండాలి", err_cat: "దయచేసి కార్యాచరణ వర్గాన్ని ఎంచుకోండి", err_desc: "దయచేసి మరింత వివరణాత్మక వివరణను అందించండి (కనీసం 20 అక్షరాలు)",
            alert_map: "కొనసాగడానికి ముందు దయచేసి మ్యాప్‌లో ఖచ్చితమైన భౌగోళిక స్థానాన్ని గుర్తించండి.", alert_fail: "నెట్‌వర్క్ ప్రసారం విఫలమైంది. మీ నివేదిక స్థానిక నిల్వలో సురక్షితంగా సేవ్ చేయబడింది.",
            succ_title: "నివేదిక ప్రసారం చేయబడింది", succ_sub: "మున్సిపల్ డేటాబేస్లో మౌలిక సదుపాయాల లోపం విజయవంతంగా నమోదు చేయబడింది. కేటాయించిన ప్రాధాన్యత స్థాయి ప్రకారం ఆపరేషన్ బృందాలు పంపబడతాయి."
        },
        ta: {
            lang: "தமிழ்", help: "உதவி மையம்", back: "ஆபரேஷன் போர்ட்டலுக்குத் திரும்பு",
            title: "சம்பவ அறிக்கை", sub: "தேவையான உள்கட்டமைப்பு பராமரிப்பு குறித்து நிர்வாக ஊழியர்களுக்கு தெரிவிக்க கீழே உள்ள ஆவணங்களை பூர்த்தி செய்யவும்.",
            form_cat: "வகைப்பாடு", form_title_label: "அறிக்கை தலைப்பு", form_title_ph: "பிரச்சனையின் சுருக்கமான அடையாளம்",
            form_div_label: "செயல்பாட்டு வகை", form_div_ph: "பிரிவைத் தேர்ந்தெடுக்கவும்...",
            cat_road: "சாலை பராமரிப்பு", cat_san: "சுகாதார சேவைகள்", cat_water: "நீர் வழங்கல்", cat_elec: "மின்சார கட்டம்", cat_safe: "பொது பாதுகாப்பு",
            form_pri_label: "முன்னுரிமை நிலை", pri_std: "நிலையான பராமரிப்பு", pri_high: "அதிக அவசரம்", pri_crit: "முக்கியமான ஆபத்து",
            form_desc_label: "விரிவான மதிப்பீடு", form_desc_btn: "கட்டமைப்பு உரை", form_desc_ph: "குறைபாடு தொடர்பான முழுமையான செயல்பாட்டு விவரங்களை வழங்கவும்...",
            priv_title: "அநாமதேய சமர்ப்பிப்பு", priv_sub: "பொது நிர்வாக பதிவிலிருந்து உங்கள் தனிப்பட்ட அடையாளத்தை தவிர்க்கவும்.",
            submit_btn: "சம்பவ அறிக்கையை சமர்ப்பிக்கவும்", submit_proc: "தரவு அனுப்பப்படுகிறது...",
            dup_title: "தற்போதுள்ள சம்பவம் கண்டறியப்பட்டுள்ளது", dup_sub: "இந்த சரியான இடத்திற்கு இதே போன்ற குறைபாடு தற்போது மதிப்பாய்வில் இருப்பதை நிர்வாக பதிவுகள் குறிக்கின்றன.", dup_btn: "சமூக ஆதரவை பதிவு செய்யவும்",
            map_title: "புவியியல் இடம்", map_sub: "சரியான சம்பவ ஆயக்கட்டுகளை நியமிக்க வரைபடத்தைத் தட்டவும்.",
            ev_title: "காட்சி சான்று", ev_sub: "ஆவணங்களைத் தேர்ந்தெடுக்கவும்", ev_sub2: "JPEG, PNG வடிவங்கள் ஆதரிக்கப்படுகின்றன", ev_ready: "பரிமாற்றத்திற்கு தயார்",
            err_title: "தலைப்பில் குறைந்தது 5 எழுத்துக்கள் இருக்க வேண்டும்", err_cat: "செயல்பாட்டு வகையை தேர்ந்தெடுக்கவும்", err_desc: "மேலும் விரிவான விளக்கத்தை வழங்கவும் (குறைந்தது 20 எழுத்துக்கள்)",
            alert_map: "தொடர்வதற்கு முன் வரைபடத்தில் சரியான புவியியல் இருப்பிடத்தை அடையாளம் காணவும்.", alert_fail: "நெட்வொர்க் பரிமாற்றம் தோல்வியடைந்தது. உங்கள் அறிக்கை உள்ளூர் சேமிப்பகத்தில் பாதுகாப்பாக சேமிக்கப்பட்டுள்ளது.",
            succ_title: "அறிக்கை அனுப்பப்பட்டது", succ_sub: "நகராட்சி தரவுத்தளத்தில் உள்கட்டமைப்பு குறைபாடு வெற்றிகரமாக பதிவு செய்யப்பட்டுள்ளது. ஒதுக்கப்பட்ட முன்னுரிமை நிலையின்படி செயல்பாட்டுக் குழுக்கள் அனுப்பப்படும்."
        },
        pa: {
            lang: "ਪੰਜਾਬੀ", help: "ਸਹਾਇਤਾ ਕੇਂਦਰ", back: "ਓਪਰੇਸ਼ਨ ਪੋਰਟਲ 'ਤੇ ਵਾਪਸ ਜਾਓ",
            title: "ਘਟਨਾ ਰਿਪੋਰਟ", sub: "ਲੋੜੀਂਦੇ ਬੁਨਿਆਦੀ ਢਾਂਚੇ ਦੇ ਰੱਖ-ਰਖਾਅ ਬਾਰੇ ਪ੍ਰਬੰਧਕੀ ਕਰਮਚਾਰੀਆਂ ਨੂੰ ਸੂਚਿਤ ਕਰਨ ਲਈ ਹੇਠਾਂ ਦਿੱਤੇ ਦਸਤਾਵੇਜ਼ਾਂ ਨੂੰ ਪੂਰਾ ਕਰੋ।",
            form_cat: "ਵਰਗੀਕਰਨ", form_title_label: "ਰਿਪੋਰਟ ਦਾ ਸਿਰਲੇਖ", form_title_ph: "ਸਮੱਸਿਆ ਦੀ ਸੰਖੇਪ ਪਛਾਣ",
            form_div_label: "ਕਾਰਜਸ਼ੀਲ ਸ਼੍ਰੇਣੀ", form_div_ph: "ਵਿਭਾਗ ਚੁਣੋ...",
            cat_road: "ਸੜਕ ਦੀ ਸਾਂਭ-ਸੰਭਾਲ", cat_san: "ਸੈਨੀਟੇਸ਼ਨ ਸੇਵਾਵਾਂ", cat_water: "ਪਾਣੀ ਦੀ ਸਪਲਾਈ", cat_elec: "ਇਲੈਕਟ੍ਰੀਕਲ ਗਰਿੱਡ", cat_safe: "ਜਨਤਕ ਸੁਰੱਖਿਆ",
            form_pri_label: "ਤਰਜੀਹ ਪੱਧਰ", pri_std: "ਮਿਆਰੀ ਰੱਖ-ਰਖਾਅ", pri_high: "ਉੱਚ ਜ਼ਰੂਰੀ", pri_crit: "ਗੰਭੀਰ ਖਤਰਾ",
            form_desc_label: "ਵਿਸਤ੍ਰਿਤ ਮੁਲਾਂਕਣ", form_desc_btn: "ਬਣਤਰ ਟੈਕਸਟ", form_desc_ph: "ਕਮੀ ਬਾਰੇ ਪੂਰੇ ਕਾਰਜਸ਼ੀਲ ਵੇਰਵੇ ਪ੍ਰਦਾਨ ਕਰੋ...",
            priv_title: "ਗੁਮਨਾਮ ਸਬਮਿਸ਼ਨ", priv_sub: "ਜਨਤਕ ਪ੍ਰਸ਼ਾਸਨਿਕ ਰਿਕਾਰਡ ਤੋਂ ਆਪਣੀ ਨਿੱਜੀ ਪਛਾਣ ਹਟਾਓ।",
            submit_btn: "ਘਟਨਾ ਰਿਪੋਰਟ ਜਮ੍ਹਾਂ ਕਰੋ", submit_proc: "ਡਾਟਾ ਸੰਚਾਰਿਤ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...",
            dup_title: "ਮੌਜੂਦਾ ਘਟਨਾ ਦਾ ਪਤਾ ਲੱਗਾ", dup_sub: "ਪ੍ਰਸ਼ਾਸਨਿਕ ਰਿਕਾਰਡ ਦਰਸਾਉਂਦੇ ਹਨ ਕਿ ਇਸ ਸਹੀ ਸਥਾਨ ਲਈ ਵਰਤਮਾਨ ਵਿੱਚ ਇੱਕ ਸਮਾਨ ਕਮੀ ਦੀ ਸਮੀਖਿਆ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ।", dup_btn: "ਕਮਿਊਨਿਟੀ ਸਪੋਰਟ ਰਜਿਸਟਰ ਕਰੋ",
            map_title: "ਭੂਗੋਲਿਕ ਸਥਿਤੀ", map_sub: "ਸਹੀ ਘਟਨਾ ਨਿਰਦੇਸ਼ਾਂਕ ਨਿਰਧਾਰਤ ਕਰਨ ਲਈ ਨਕਸ਼ੇ 'ਤੇ ਟੈਪ ਕਰੋ।",
            ev_title: "ਵਿਜ਼ੂਅਲ ਸਬੂਤ", ev_sub: "ਦਸਤਾਵੇਜ਼ ਚੁਣੋ", ev_sub2: "JPEG, PNG ਫਾਰਮੈਟ ਸਮਰਥਿਤ ਹਨ", ev_ready: "ਪ੍ਰਸਾਰਣ ਲਈ ਤਿਆਰ",
            err_title: "ਸਿਰਲੇਖ ਵਿੱਚ ਘੱਟੋ-ਘੱਟ 5 ਅੱਖਰ ਹੋਣੇ ਚਾਹੀਦੇ ਹਨ", err_cat: "ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਕਾਰਜਸ਼ੀਲ ਸ਼੍ਰੇਣੀ ਚੁਣੋ", err_desc: "ਕਿਰਪਾ ਕਰਕੇ ਵਧੇਰੇ ਵਿਸਤ੍ਰਿਤ ਵਰਣਨ ਪ੍ਰਦਾਨ ਕਰੋ (ਘੱਟੋ-ਘੱਟ 20 ਅੱਖਰ)",
            alert_map: "ਕਿਰਪਾ ਕਰਕੇ ਅੱਗੇ ਵਧਣ ਤੋਂ ਪਹਿਲਾਂ ਨਕਸ਼ੇ 'ਤੇ ਸਹੀ ਭੂਗੋਲਿਕ ਸਥਾਨ ਦੀ ਪਛਾਣ ਕਰੋ।", alert_fail: "ਨੈੱਟਵਰਕ ਟ੍ਰਾਂਸਮਿਸ਼ਨ ਅਸਫਲ ਰਿਹਾ। ਤੁਹਾਡੀ ਰਿਪੋਰਟ ਸਥਾਨਕ ਸਟੋਰੇਜ ਵਿੱਚ ਸੁਰੱਖਿਅਤ ਢੰਗ ਨਾਲ ਸੁਰੱਖਿਅਤ ਕੀਤੀ ਗਈ ਹੈ।",
            succ_title: "ਰਿਪੋਰਟ ਪ੍ਰਸਾਰਿਤ", succ_sub: "ਮਿਊਂਸੀਪਲ ਡੇਟਾਬੇਸ ਵਿੱਚ ਬੁਨਿਆਦੀ ਢਾਂਚੇ ਦੀ ਕਮੀ ਨੂੰ ਸਫਲਤਾਪੂਰਵਕ ਰਜਿਸਟਰ ਕੀਤਾ ਗਿਆ ਹੈ। ਨਿਰਧਾਰਤ ਤਰਜੀਹ ਪੱਧਰ ਦੇ ਅਨੁਸਾਰ ਆਪਰੇਸ਼ਨ ਟੀਮਾਂ ਭੇਜੀਆਂ ਜਾਣਗੀਆਂ।"
        },
        bho: {
            lang: "भोजपुरी", help: "मदद केंद्र", back: "ऑपरेशंस पोर्टल पर वापस जाईं",
            title: "घटना रिपोर्ट", sub: "जरूरी बुनियादी ढांचा के रखरखाव के प्रशासनिक कर्मियन के सूचित करे खातिर नीचे दिहल दस्तावेज के पूरा करीं।",
            form_cat: "वर्गीकरण", form_title_label: "रिपोर्ट के शीर्षक", form_title_ph: "समस्या के संक्षिप्त पहचान",
            form_div_label: "परिचालन श्रेणी", form_div_ph: "विभाग चुनीं...",
            cat_road: "सड़क रखरखाव", cat_san: "स्वच्छता सेवा", cat_water: "जल आपूर्ति", cat_elec: "इलेक्ट्रिकल ग्रिड", cat_safe: "सार्वजनिक सुरक्षा",
            form_pri_label: "प्राथमिकता स्तर", pri_std: "मानक रखरखाव", pri_high: "अधिक तात्कालिकता", pri_crit: "गंभीर खतरा",
            form_desc_label: "विस्तृत मूल्यांकन", form_desc_btn: "संरचना पाठ", form_desc_ph: "कमी के संबंध में पूरा परिचालन विवरण दीं...",
            priv_title: "गुमनाम सबमिशन", priv_sub: "सार्वजनिक प्रशासनिक रिकॉर्ड से आपन व्यक्तिगत पहचान हटा दीं।",
            submit_btn: "घटना रिपोर्ट जमा करीं", submit_proc: "डेटा ट्रांसमिट हो रहल बा...",
            dup_title: "मौजूदा घटना के पता चलल", dup_sub: "प्रशासनिक रिकॉर्ड देखावत बा कि एह सटीक स्थान खातिर वर्तमान में एगो अइसने कमी के समीक्षा कइल जा रहल बा।", dup_btn: "सामुदायिक समर्थन दर्ज करीं",
            map_title: "भौगोलिक स्थिति", map_sub: "सटीक घटना निर्देशांक निर्दिष्ट करे खातिर नक्शा पर टैप करीं।",
            ev_title: "दृश्य साक्ष्य", ev_sub: "दस्तावेज चुनीं", ev_sub2: "JPEG, PNG प्रारूप समर्थित", ev_ready: "प्रसारण खातिर तइयार",
            err_title: "शीर्षक में कम से कम 5 अक्षर होखे के चाहीं", err_cat: "कृपया एगो परिचालन श्रेणी चुनीं", err_desc: "कृपया अउरी विस्तृत विवरण दीं (कम से कम 20 अक्षर)",
            alert_map: "कृपया आगे बढ़े से पहिले नक्शा पर सटीक भौगोलिक स्थान के पहचान करीं।", alert_fail: "नेटवर्क प्रसारण विफल हो गइल। राउर रिपोर्ट स्थानीय संग्रहण में सुरक्षित रूप से सहेज लिहल गइल बा।",
            succ_title: "रिपोर्ट प्रसारित", succ_sub: "नगर निगम डेटाबेस में बुनियादी ढांचा के कमी के सफलतापूर्वक दर्ज क लिहल गइल बा। निर्धारित प्राथमिकता स्तर के अनुसार संचालन दल भेजल जाई।"
        },
        ar: {
            lang: "العربية", help: "مركز المساعدة", back: "العودة إلى بوابة العمليات",
            title: "تقرير الحادث", sub: "أكمل الوثائق أدناه لإخطار الموظفين الإداريين بصيانة البنية التحتية المطلوبة.",
            form_cat: "التصنيف", form_title_label: "عنوان التقرير", form_title_ph: "تعريف موجز للمشكلة",
            form_div_label: "الفئة التشغيلية", form_div_ph: "اختر القسم...",
            cat_road: "صيانة الطرق", cat_san: "خدمات الصرف الصحي", cat_water: "إمدادات المياه", cat_elec: "الشبكة الكهربائية", cat_safe: "السلامة العامة",
            form_pri_label: "مستوى الأولوية", pri_std: "صيانة قياسية", pri_high: "إلحاح شديد", pri_crit: "خطر حرج",
            form_desc_label: "تقييم مفصل", form_desc_btn: "نص الهيكل", form_desc_ph: "قدم التفاصيل التشغيلية الكاملة بخصوص النقص...",
            priv_title: "تقديم مجهول", priv_sub: "احذف هويتك الشخصية من السجل الإداري العام.",
            submit_btn: "إرسال تقرير الحادث", submit_proc: "جاري نقل البيانات...",
            dup_title: "تم اكتشاف حادث حالي", dup_sub: "تشير السجلات الإدارية إلى وجود نقص مماثل قيد المراجعة حاليًا لهذا الموقع بالضبط.", dup_btn: "تسجيل دعم المجتمع",
            map_title: "الموقع الجغرافي", map_sub: "اضغط على الخريطة لتعيين إحداثيات الحادث الدقيقة.",
            ev_title: "الأدلة البصرية", ev_sub: "تحديد الوثائق", ev_sub2: "تنسيقات JPEG و PNG مدعومة", ev_ready: "جاهز للنقل",
            err_title: "يجب أن يحتوي العنوان على 5 أحرف على الأقل", err_cat: "يرجى تحديد فئة تشغيلية", err_desc: "يرجى تقديم وصف أكثر تفصيلاً (20 حرفًا على الأقل)",
            alert_map: "يرجى تحديد الموقع الجغرافي الدقيق على الخريطة قبل المتابعة.", alert_fail: "فشل نقل الشبكة. تم حفظ تقريرك بشكل آمن في التخزين المحلي.",
            succ_title: "تم نقل التقرير", succ_sub: "تم تسجيل نقص البنية التحتية بنجاح في قاعدة بيانات البلدية. سيتم إرسال فرق العمليات وفقًا لمستوى الأولوية المعين."
        },
        es: {
            lang: "Español", help: "Centro de ayuda", back: "Volver al Portal de Operaciones",
            title: "Reporte de Incidente", sub: "Complete la documentación a continuación para notificar al personal administrativo sobre el mantenimiento de infraestructura requerido.",
            form_cat: "Categorización", form_title_label: "Título del Reporte", form_title_ph: "Breve identificación del problema",
            form_div_label: "Categoría Operativa", form_div_ph: "Seleccione División...",
            cat_road: "Mantenimiento de Carreteras", cat_san: "Servicios de Saneamiento", cat_water: "Suministro de Agua", cat_elec: "Red Eléctrica", cat_safe: "Seguridad Pública",
            form_pri_label: "Nivel de Prioridad", pri_std: "Mantenimiento Estándar", pri_high: "Alta Urgencia", pri_crit: "Peligro Crítico",
            form_desc_label: "Evaluación Detallada", form_desc_btn: "Estructurar Texto", form_desc_ph: "Proporcione detalles operativos completos sobre la deficiencia...",
            priv_title: "Envío Anónimo", priv_sub: "Omita su identificación personal del registro administrativo público.",
            submit_btn: "Enviar Reporte de Incidente", submit_proc: "Transmitiendo Datos...",
            dup_title: "Incidente Existente Detectado", dup_sub: "Los registros administrativos indican que una deficiencia similar está actualmente bajo revisión para esta ubicación exacta.", dup_btn: "Registrar Apoyo de la Comunidad",
            map_title: "Ubicación Geográfica", map_sub: "Toque el mapa para designar las coordenadas exactas del incidente.",
            ev_title: "Evidencia Visual", ev_sub: "Seleccionar Documentación", ev_sub2: "Formatos JPEG, PNG soportados", ev_ready: "Listo para transmisión",
            err_title: "El título debe contener al menos 5 caracteres", err_cat: "Por favor seleccione una categoría operativa", err_desc: "Por favor proporcione una descripción más detallada (mínimo 20 caracteres)",
            alert_map: "Por favor identifique la ubicación geográfica exacta en el mapa antes de proceder.", alert_fail: "Fallo en la transmisión de red. Su reporte ha sido guardado de forma segura en el almacenamiento local.",
            succ_title: "Reporte Transmitido", succ_sub: "La deficiencia de infraestructura se ha registrado con éxito en la base de datos municipal. Se despacharán equipos de operaciones según el nivel de prioridad asignado."
        },
        fr: {
            lang: "Français", help: "Centre d'aide", back: "Retour au Portail des Opérations",
            title: "Rapport d'Incident", sub: "Complétez la documentation ci-dessous pour informer le personnel administratif de l'entretien requis des infrastructures.",
            form_cat: "Catégorisation", form_title_label: "Titre du Rapport", form_title_ph: "Brève identification du problème",
            form_div_label: "Catégorie Opérationnelle", form_div_ph: "Sélectionnez la Division...",
            cat_road: "Entretien Routier", cat_san: "Services d'Assainissement", cat_water: "Approvisionnement en Eau", cat_elec: "Réseau Électrique", cat_safe: "Sécurité Publique",
            form_pri_label: "Niveau de Priorité", pri_std: "Entretien Standard", pri_high: "Haute Urgence", pri_crit: "Danger Critique",
            form_desc_label: "Évaluation Détaillée", form_desc_btn: "Structurer le Texte", form_desc_ph: "Fournissez des détails opérationnels complets concernant la lacune...",
            priv_title: "Soumission Anonyme", priv_sub: "Omettez votre identification personnelle du registre administratif public.",
            submit_btn: "Soumettre le Rapport d'Incident", submit_proc: "Transmission des Données...",
            dup_title: "Incident Existant Détecté", dup_sub: "Les registres administratifs indiquent qu'une lacune similaire est actuellement en cours d'examen pour cet emplacement exact.", dup_btn: "Enregistrer le Soutien de la Communauté",
            map_title: "Emplacement Géographique", map_sub: "Appuyez sur la carte pour désigner les coordonnées exactes de l'incident.",
            ev_title: "Preuve Visuelle", ev_sub: "Sélectionner la Documentation", ev_sub2: "Formats JPEG, PNG pris en charge", ev_ready: "Prêt pour la transmission",
            err_title: "Le titre doit contenir au moins 5 caractères", err_cat: "Veuillez sélectionner une catégorie opérationnelle", err_desc: "Veuillez fournir une description plus détaillée (minimum 20 caractères)",
            alert_map: "Veuillez identifier l'emplacement géographique exact sur la carte avant de continuer.", alert_fail: "Échec de la transmission réseau. Votre rapport a été enregistré en toute sécurité dans le stockage local.",
            succ_title: "Rapport Transmis", succ_sub: "La lacune d'infrastructure a été enregistrée avec succès dans la base de données municipale. Des équipes d'intervention seront dépêchées selon le niveau de priorité assigné."
        },
        de: {
            lang: "Deutsch", help: "Hilfezentrum", back: "Zurück zum Operationsportal",
            title: "Vorfallbericht", sub: "Füllen Sie die nachstehende Dokumentation aus, um das Verwaltungspersonal über die erforderliche Wartung der Infrastruktur zu informieren.",
            form_cat: "Kategorisierung", form_title_label: "Berichtstitel", form_title_ph: "Kurze Identifikation des Problems",
            form_div_label: "Operative Kategorie", form_div_ph: "Abteilung Auswählen...",
            cat_road: "Straßeninstandhaltung", cat_san: "Sanitärdienste", cat_water: "Wasserversorgung", cat_elec: "Stromnetz", cat_safe: "Öffentliche Sicherheit",
            form_pri_label: "Prioritätsstufe", pri_std: "Standardwartung", pri_high: "Hohe Dringlichkeit", pri_crit: "Kritische Gefahr",
            form_desc_label: "Detaillierte Bewertung", form_desc_btn: "Text Strukturieren", form_desc_ph: "Geben Sie vollständige operative Details zum Mangel an...",
            priv_title: "Anonyme Einreichung", priv_sub: "Lassen Sie Ihre persönliche Identifikation aus der öffentlichen Verwaltungsakte weg.",
            submit_btn: "Vorfallbericht Einreichen", submit_proc: "Daten werden übertragen...",
            dup_title: "Bestehender Vorfall Erkannt", dup_sub: "Verwaltungsunterlagen deuten darauf hin, dass ein ähnlicher Mangel für diesen genauen Ort derzeit überprüft wird.", dup_btn: "Community-Unterstützung Registrieren",
            map_title: "Geografische Lage", map_sub: "Tippen Sie auf die Karte, um die genauen Koordinaten des Vorfalls festzulegen.",
            ev_title: "Visueller Beweis", ev_sub: "Dokumentation Auswählen", ev_sub2: "JPEG, PNG Formate unterstützt", ev_ready: "Bereit zur Übertragung",
            err_title: "Titel muss mindestens 5 Zeichen enthalten", err_cat: "Bitte wählen Sie eine operative Kategorie aus", err_desc: "Bitte geben Sie eine detailliertere Beschreibung an (mindestens 20 Zeichen)",
            alert_map: "Bitte identifizieren Sie die genaue geografische Lage auf der Karte, bevor Sie fortfahren.", alert_fail: "Netzwerkübertragung fehlgeschlagen. Ihr Bericht wurde sicher im lokalen Speicher gespeichert.",
            succ_title: "Bericht Übertragen", succ_sub: "Der Infrastrukturmangel wurde erfolgreich in der kommunalen Datenbank registriert. Einsatzteams werden gemäß der zugewiesenen Prioritätsstufe entsandt."
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
                    } else {
                        setDuplicateFound(null);
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
                `}
            </style>

            {/* TOP HEADER */}
            <header className="w-full flex items-center justify-between px-6 md:px-12 py-8 animate-fade relative z-50">
                <div className="flex items-center gap-2">
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
                
                <div className="flex items-center gap-6 text-[0.9rem] font-bold">
                    <span className={`cursor-pointer transition-colors hidden sm:block ${theme === 'light' ? 'text-[#555555] hover:text-black' : 'text-[#888888] hover:text-white'}`}>
                        {currentT.help}
                    </span>
                    
                    <button 
                        onClick={() => setShowLangPrompt(true)}
                        className={`flex items-center gap-2 transition-colors outline-none ${theme === 'light' ? 'text-[#555555] hover:text-black' : 'text-[#888888] hover:text-white'}`}
                    >
                        {currentT.lang}
                    </button>

                    <button 
                        onClick={toggleTheme}
                        className={`p-2 rounded-full transition-colors outline-none ${theme === 'light' ? 'bg-[#e0e0e0] text-black hover:bg-[#cccccc]' : 'bg-[#222222] text-white hover:bg-[#333333]'}`}
                        aria-label="Toggle Theme"
                    >
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    </button>

                    <button 
                        onClick={() => navigate('/')} 
                        className={`px-5 py-2 rounded-full flex items-center gap-2 transition-colors outline-none border ${
                            theme === 'light' ? 'bg-white border-[#cccccc] text-black hover:border-black' : 'bg-[#111111] border-[#333333] text-white hover:border-white'
                        }`}
                    >
                        Home
                    </button>
                </div>
            </header>

            {/* LANGUAGE SELECTOR MODAL */}
            <AnimatePresence>
                {showLangPrompt && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className={`fixed inset-0 z-[60] backdrop-blur-md flex items-center justify-center p-6 ${theme === 'light' ? 'bg-white/80' : 'bg-black/80'}`}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className={`w-full max-w-[400px] rounded-3xl p-8 flex flex-col shadow-2xl relative max-h-[80vh] overflow-y-auto border ${
                                theme === 'light' ? 'bg-white border-[#e0e0e0]' : 'bg-[#050505] border-[#333333]'
                            }`}
                        >
                            <button 
                                onClick={() => setShowLangPrompt(false)} 
                                className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center transition-colors ${
                                    theme === 'light' ? 'text-[#888888] hover:text-black' : 'text-[#888888] hover:text-white'
                                }`}
                            >
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                            
                            <div className={`w-12 h-12 mx-auto rounded-full border flex items-center justify-center mb-4 ${
                                theme === 'light' ? 'border-[#cccccc]' : 'border-[#333333]'
                            }`}>
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke={theme === 'light' ? 'black' : 'white'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"></path></svg>
                            </div>

                            <h2 className={`text-[1.5rem] font-black tracking-tight mb-2 text-center ${theme === 'light' ? 'text-black' : 'text-white'}`}>Select Language</h2>
                            <p className={`text-[0.9rem] text-center mb-8 ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>Choose your preferred viewing language.</p>
                            
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
                                        {lang === option.code && <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={theme === 'light' ? 'black' : 'white'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
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
                        
                        {/* Duplicate Detection Warning */}
                        <AnimatePresence>
                            {duplicateFound && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className={`border rounded-2xl p-6 overflow-hidden ${
                                        theme === 'light' ? 'bg-[#fff5f5] border-[#ffcccc]' : 'bg-[#111111] border-white'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <AlertTriangle size={24} className={theme === 'light' ? 'text-[#ff4444]' : 'text-white'} />
                                        <h4 className={`font-black text-[1.1rem] ${theme === 'light' ? 'text-[#ff4444]' : 'text-white'}`}>{currentT.dup_title}</h4>
                                    </div>
                                    <p className={`text-[0.9rem] mb-4 ${theme === 'light' ? 'text-[#555555]' : 'text-[#aaaaaa]'}`}>
                                        {currentT.dup_sub} ({duplicateFound.title}). 
                                    </p>
                                    <button 
                                        onClick={handleSupportExisting}
                                        disabled={isProcessing}
                                        className={`w-full py-3 rounded-xl font-bold text-[0.9rem] transition-colors disabled:opacity-50 ${
                                            theme === 'light' ? 'bg-[#ff4444] text-white hover:bg-[#cc0000]' : 'bg-white text-black hover:bg-[#e0e0e0]'
                                        }`}
                                    >
                                        {currentT.dup_btn}
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Location Picker */}
                        <div className={`border rounded-2xl p-6 flex flex-col h-[400px] ${theme === 'light' ? 'bg-white border-[#e0e0e0]' : 'bg-[#111111] border-[#333333]'}`}>
                            <h3 className="text-[1.1rem] font-black mb-4 flex items-center gap-2 shrink-0">
                                <MapPin size={18} /> {currentT.map_title}
                            </h3>
                            <div className={`w-full flex-1 rounded-xl overflow-hidden border relative z-0 ${theme === 'light' ? 'border-[#cccccc]' : 'border-[#333333]'}`}>
                                <MapContainer 
                                    center={[19.0760, 72.8777]} // Default coordinates
                                    zoom={13} 
                                    style={{ height: '100%', width: '100%', background: theme === 'light' ? '#f5f5f5' : '#0a0a0a' }}
                                    zoomControl={false}
                                >
                                    <TileLayer
                                        url={theme === 'light' ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"}
                                    />
                                    <LocationSelector position={selectedLocation} setPosition={setSelectedLocation} />
                                </MapContainer>
                            </div>
                            <p className={`text-[0.8rem] mt-3 shrink-0 text-center font-bold ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>
                                {currentT.map_sub}
                            </p>
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
        </div>
    );
}