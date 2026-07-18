import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, 
    ArrowLeft, 
    CheckCircle, 
    Clock, 
    Wrench, 
    FileText,
    Calendar,
    Image as ImageIcon,
    ShieldCheck,
    Sun,
    Moon
} from 'lucide-react';
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useCivicStore } from '../../store/useCivicStore';

export default function IssueTracker() {
    const navigate = useNavigate();
    
    // 1. STATE MANAGEMENT
    const theme = useCivicStore((state) => state.theme);
    const toggleTheme = useCivicStore((state) => state.toggleTheme);
    const [lang, setLang] = useState('en');
    const [showLangPrompt, setShowLangPrompt] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [activeRecord, setActiveRecord] = useState(null);
    const [recentRecords, setRecentRecords] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [searchMessage, setSearchMessage] = useState('');

    useEffect(() => {
        // Detect System Language
        const sysLang = navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'mr', 'gu', 'te', 'ta', 'pa', 'bho', 'ar', 'es', 'fr', 'de'];
        if (supported.includes(sysLang)) setLang(sysLang);

        const fetchRecentActivity = async () => {
            try {
                const complaintsRef = collection(db, 'civic_complaints');
                const recentQuery = query(complaintsRef, orderBy('createdAt', 'desc'), limit(5));
                const snapshot = await getDocs(recentQuery);
                
                const records = snapshot.docs.map(document => ({
                    id: document.id,
                    ...document.data()
                }));
                setRecentRecords(records);
            } catch (error) {
                console.error("Failed to retrieve recent activity logs:", error);
            }
        };

        fetchRecentActivity();
    }, []);

    // 2. 13-LANGUAGE DICTIONARY (Tracker Context)
    const t = {
        en: {
            lang: "English", help: "Help Center", back: "Return to Operations Portal",
            title: "Resolution Tracker", sub: "Monitor the operational status and deployment progress of reported infrastructure deficiencies.",
            search_ph: "Enter Incident Tracking Identification Number...", btn_retrieve: "Retrieve Record", btn_query: "Querying...",
            err_not_found: "No administrative record found matching this identification number.", err_net: "Network transmission failed. Please try again.",
            lbl_priority: "Priority", lbl_est_res: "Estimated Resolution", lbl_timeline: "Operational Timeline", lbl_desc: "Detailed Assessment", 
            lbl_doc: "Initial Documentation", lbl_recent: "Recent Public Filings", lbl_retrieving: "Retrieving administrative records...", lbl_status: "Status",
            step1_title: "Incident Registered", step1_desc: "Report successfully transmitted to municipal database.",
            step2_title: "Personnel Assigned", step2_desc: "Departmental review complete and operations team allocated.",
            step3_title: "Maintenance In Progress", step3_desc: "Field personnel are actively executing required repairs.",
            step4_title: "Operations Concluded", step4_desc: "Infrastructure deficiency resolved and verified.",
            concluded: "Operations Concluded", pending: "Pending Assignment"
        },
        hi: {
            lang: "हिन्दी", help: "सहायता केंद्र", back: "ऑपरेशंस पोर्टल पर लौटें",
            title: "समाधान ट्रैकर", sub: "रिपोर्ट की गई बुनियादी ढांचे की कमियों की परिचालन स्थिति और तैनाती प्रगति की निगरानी करें।",
            search_ph: "घटना ट्रैकिंग पहचान संख्या दर्ज करें...", btn_retrieve: "रिकॉर्ड प्राप्त करें", btn_query: "खोजा जा रहा है...",
            err_not_found: "इस पहचान संख्या से मेल खाने वाला कोई प्रशासनिक रिकॉर्ड नहीं मिला।", err_net: "नेटवर्क ट्रांसमिशन विफल रहा। कृपया पुनः प्रयास करें।",
            lbl_priority: "प्राथमिकता", lbl_est_res: "अनुमानित समाधान", lbl_timeline: "परिचालन समयरेखा", lbl_desc: "विस्तृत मूल्यांकन", 
            lbl_doc: "प्रारंभिक दस्तावेज़ीकरण", lbl_recent: "हाल की सार्वजनिक फाइलिंग", lbl_retrieving: "प्रशासनिक रिकॉर्ड प्राप्त किए जा रहे हैं...", lbl_status: "स्थिति",
            step1_title: "घटना पंजीकृत", step1_desc: "रिपोर्ट सफलतापूर्वक नगर निगम डेटाबेस में प्रसारित की गई।",
            step2_title: "कार्मिक नियुक्त", step2_desc: "विभागीय समीक्षा पूर्ण और संचालन दल आवंटित।",
            step3_title: "रखरखाव प्रगति पर", step3_desc: "फील्ड कर्मी सक्रिय रूप से आवश्यक मरम्मत कर रहे हैं।",
            step4_title: "संचालन संपन्न", step4_desc: "बुनियादी ढांचे की कमी का समाधान और सत्यापन किया गया।",
            concluded: "संचालन संपन्न", pending: "नियुक्ति लंबित"
        },
        hinglish: {
            lang: "Hinglish", help: "Help Center", back: "Operations Portal par wapas jayein",
            title: "Resolution Tracker", sub: "Reported infrastructure deficiencies ka operational status aur progress monitor karein.",
            search_ph: "Incident Tracking ID enter karein...", btn_retrieve: "Record Retrieve Karein", btn_query: "Querying...",
            err_not_found: "Is identification number se match karta koi record nahi mila.", err_net: "Network transmission fail ho gaya. Phir se try karein.",
            lbl_priority: "Priority", lbl_est_res: "Estimated Resolution", lbl_timeline: "Operational Timeline", lbl_desc: "Detailed Assessment", 
            lbl_doc: "Initial Documentation", lbl_recent: "Recent Public Filings", lbl_retrieving: "Administrative records retrieve ho rahe hain...", lbl_status: "Status",
            step1_title: "Incident Registered", step1_desc: "Report municipal database me successfully transmit ho gayi hai.",
            step2_title: "Personnel Assigned", step2_desc: "Departmental review complete aur operations team allocate kar di gayi hai.",
            step3_title: "Maintenance In Progress", step3_desc: "Field personnel required repairs execute kar rahe hain.",
            step4_title: "Operations Concluded", step4_desc: "Infrastructure deficiency resolve aur verify ho gayi hai.",
            concluded: "Operations Concluded", pending: "Assignment Pending"
        },
        mr: {
            lang: "मराठी", help: "मदत केंद्र", back: "ऑपरेशन्स पोर्टलवर परत जा",
            title: "रिझोल्यूशन ट्रॅकर", sub: "नोंदवलेल्या पायाभूत सुविधांच्या त्रुटींच्या ऑपरेशनल स्थितीचे आणि प्रगतीचे निरीक्षण करा.",
            search_ph: "इन्सिडेंट ट्रॅकिंग आयडेंटिफिकेशन नंबर एंटर करा...", btn_retrieve: "रेकॉर्ड मिळवा", btn_query: "शोधत आहे...",
            err_not_found: "या ओळख क्रमांकाशी जुळणारा कोणताही प्रशासकीय रेकॉर्ड आढळला नाही.", err_net: "नेटवर्क ट्रान्समिशन अयशस्वी. कृपया पुन्हा प्रयत्न करा.",
            lbl_priority: "प्राधान्य", lbl_est_res: "अंदाजित रिझोल्यूशन", lbl_timeline: "ऑपरेशनल टाइमलाइन", lbl_desc: "सविस्तर मूल्यांकन", 
            lbl_doc: "प्रारंभिक दस्तऐवजीकरण", lbl_recent: "अलीकडील सार्वजनिक फायलिंग", lbl_retrieving: "प्रशासकीय रेकॉर्ड मिळवत आहे...", lbl_status: "स्थिती",
            step1_title: "घटनेची नोंद", step1_desc: "अहवाल महानगरपालिका डेटाबेसमध्ये यशस्वीरित्या प्रसारित केला गेला.",
            step2_title: "कर्मचारी नियुक्त", step2_desc: "विभागीय पुनरावलोकन पूर्ण आणि ऑपरेशन्स टीमचे वाटप केले गेले.",
            step3_title: "दुरुस्ती सुरू आहे", step3_desc: "फील्ड कर्मचारी सक्रियपणे आवश्यक दुरुस्ती करत आहेत.",
            step4_title: "ऑपरेशन्स पूर्ण", step4_desc: "पायाभूत सुविधांची त्रुटी दूर केली आणि सत्यापित केली.",
            concluded: "ऑपरेशन्स पूर्ण", pending: "असाइनमेंट प्रलंबित"
        },
        gu: {
            lang: "ગુજરાતી", help: "મદદ કેન્દ્ર", back: "ઓપરેશન્સ પોર્ટલ પર પાછા ફરો",
            title: "રિઝોલ્યુશન ટ્રેકર", sub: "નોંધાયેલી ઇન્ફ્રાસ્ટ્રક્ચર ખામીઓની ઓપરેશનલ સ્થિતિ અને પ્રગતિનું નિરીક્ષણ કરો.",
            search_ph: "ઇન્સિડન્ટ ટ્રેકિંગ આઇડેન્ટિફિકેશન નંબર દાખલ કરો...", btn_retrieve: "રેકોર્ડ મેળવો", btn_query: "શોધાઇ રહ્યુ છે...",
            err_not_found: "આ ઓળખ નંબર સાથે મેળ ખાતો કોઈ વહીવટી રેકોર્ડ મળ્યો નથી.", err_net: "નેટવર્ક ટ્રાન્સમિશન નિષ્ફળ ગયું. કૃપા કરીને ફરી પ્રયાસ કરો.",
            lbl_priority: "પ્રાધાન્ય", lbl_est_res: "અંદાજિત રિઝોલ્યુશન", lbl_timeline: "ઓપરેશનલ ટાઇમલાઇન", lbl_desc: "વિગતવાર આકારણી", 
            lbl_doc: "પ્રારંભિક દસ્તાવેજીકરણ", lbl_recent: "તાજેતરની જાહેર ફાઇલિંગ", lbl_retrieving: "વહીવટી રેકોર્ડ્સ પ્રાપ્ત કરી રહ્યાં છે...", lbl_status: "સ્થિતિ",
            step1_title: "ઘટના નોંધાયેલ", step1_desc: "મ્યુનિસિપલ ડેટાબેઝમાં રિપોર્ટ સફળતાપૂર્વક પ્રસારિત થયો.",
            step2_title: "કર્મચારીઓ સોંપાયેલ", step2_desc: "વિભાગીય સમીક્ષા પૂર્ણ અને ઓપરેશન ટીમ ફાળવવામાં આવી.",
            step3_title: "જાળવણી ચાલુ છે", step3_desc: "ક્ષેત્રના કર્મચારીઓ સક્રિયપણે જરૂરી સમારકામ કરી રહ્યા છે.",
            step4_title: "ઓપરેશન્સ પૂર્ણ", step4_desc: "ઇન્ફ્રાસ્ટ્રક્ચરની ખામી ઉકેલાઈ અને ચકાસવામાં આવી.",
            concluded: "ઓપરેશન્સ પૂર્ણ", pending: "અસાઇનમેન્ટ બાકી છે"
        },
        te: {
            lang: "తెలుగు", help: "సహాయ కేంద్రం", back: "ఆపరేషన్స్ పోర్టల్‌కు తిరిగి వెళ్లండి",
            title: "రిజల్యూషన్ ట్రాకర్", sub: "నివేదించబడిన మౌలిక సదుపాయాల లోపాల యొక్క కార్యాచరణ స్థితి మరియు పురోగతిని పర్యవేక్షించండి.",
            search_ph: "ఇన్సిడెంట్ ట్రాకింగ్ ఐడెంటిఫికేషన్ నంబర్‌ను నమోదు చేయండి...", btn_retrieve: "రికార్డ్‌ను తిరిగి పొందండి", btn_query: "ప్రశ్నిస్తోంది...",
            err_not_found: "ఈ గుర్తింపు సంఖ్యకు సరిపోలే పరిపాలనా రికార్డు ఏదీ కనుగొనబడలేదు.", err_net: "నెట్‌వర్క్ ప్రసారం విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.",
            lbl_priority: "ప్రాధాన్యత", lbl_est_res: "అంచనా వేసిన రిజల్యూషన్", lbl_timeline: "కార్యాచరణ కాలక్రమం", lbl_desc: "వివరణాత్మక అంచనా", 
            lbl_doc: "ప్రారంభ డాక్యుమెంటేషన్", lbl_recent: "ఇటీవలి పబ్లిక్ ఫైలింగ్‌లు", lbl_retrieving: "అడ్మినిస్ట్రేటివ్ రికార్డులను తిరిగి పొందుతోంది...", lbl_status: "స్థితి",
            step1_title: "సంఘటన నమోదు చేయబడింది", step1_desc: "నివేదిక విజయవంతంగా మున్సిపల్ డేటాబేస్కు ప్రసారం చేయబడింది.",
            step2_title: "సిబ్బంది కేటాయించబడింది", step2_desc: "డిపార్ట్‌మెంటల్ సమీక్ష పూర్తయింది మరియు ఆపరేషన్స్ బృందం కేటాయించబడింది.",
            step3_title: "నిర్వహణ పురోగతిలో ఉంది", step3_desc: "ఫీల్డ్ సిబ్బంది అవసరమైన మరమ్మతులను చురుకుగా అమలు చేస్తున్నారు.",
            step4_title: "కార్యకలాపాలు ముగిశాయి", step4_desc: "మౌలిక సదుపాయాల లోపం పరిష్కరించబడింది మరియు ధృవీకరించబడింది.",
            concluded: "కార్యకలాపాలు ముగిశాయి", pending: "అసైన్‌మెంట్ పెండింగ్‌లో ఉంది"
        },
        ta: {
            lang: "தமிழ்", help: "உதவி மையம்", back: "ஆபரேஷன் போர்ட்டலுக்குத் திரும்பு",
            title: "தீர்வு டிராக்கர்", sub: "அறிக்கையிடப்பட்ட உள்கட்டமைப்பு குறைபாடுகளின் செயல்பாட்டு நிலை மற்றும் முன்னேற்றத்தைக் கண்காணிக்கவும்.",
            search_ph: "சம்பவ கண்காணிப்பு அடையாள எண்ணை உள்ளிடவும்...", btn_retrieve: "பதிவை மீட்டெடுக்கவும்", btn_query: "தேடப்படுகிறது...",
            err_not_found: "இந்த அடையாள எண்ணுடன் பொருந்தும் நிர்வாக பதிவு எதுவும் கிடைக்கவில்லை.", err_net: "நெட்வொர்க் பரிமாற்றம் தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.",
            lbl_priority: "முன்னுரிமை", lbl_est_res: "மதிப்பிடப்பட்ட தீர்வு", lbl_timeline: "செயல்பாட்டு காலவரிசை", lbl_desc: "விரிவான மதிப்பீடு", 
            lbl_doc: "ஆரம்ப ஆவணங்கள்", lbl_recent: "சமீபத்திய பொதுத் தாக்கல்", lbl_retrieving: "நிர்வாக பதிவுகள் மீட்டெடுக்கப்படுகின்றன...", lbl_status: "நிலை",
            step1_title: "சம்பவம் பதிவு செய்யப்பட்டது", step1_desc: "நகராட்சி தரவுத்தளத்திற்கு அறிக்கை வெற்றிகரமாக அனுப்பப்பட்டது.",
            step2_title: "பணியாளர்கள் நியமிக்கப்பட்டுள்ளனர்", step2_desc: "துறை மதிப்பாய்வு முடிந்தது மற்றும் செயல்பாட்டுக் குழு ஒதுக்கப்பட்டுள்ளது.",
            step3_title: "பராமரிப்பு நடைபெறுகிறது", step3_desc: "களப் பணியாளர்கள் தேவையான பழுதுபார்ப்புகளை தீவிரமாகச் செய்து வருகின்றனர்.",
            step4_title: "செயல்பாடுகள் முடிவடைந்தன", step4_desc: "உள்கட்டமைப்பு குறைபாடு தீர்க்கப்பட்டு சரிபார்க்கப்பட்டது.",
            concluded: "செயல்பாடுகள் முடிவடைந்தன", pending: "ஒதுக்கீடு நிலுவையில் உள்ளது"
        },
        pa: {
            lang: "ਪੰਜਾਬੀ", help: "ਸਹਾਇਤਾ ਕੇਂਦਰ", back: "ਓਪਰੇਸ਼ਨ ਪੋਰਟਲ 'ਤੇ ਵਾਪਸ ਜਾਓ",
            title: "ਰੈਜ਼ੋਲੂਸ਼ਨ ਟ੍ਰੈਕਰ", sub: "ਰਿਪੋਰਟ ਕੀਤੀਆਂ ਬੁਨਿਆਦੀ ਢਾਂਚੇ ਦੀਆਂ ਕਮੀਆਂ ਦੀ ਸੰਚਾਲਨ ਸਥਿਤੀ ਅਤੇ ਪ੍ਰਗਤੀ ਦੀ ਨਿਗਰਾਨੀ ਕਰੋ।",
            search_ph: "ਘਟਨਾ ਟ੍ਰੈਕਿੰਗ ਪਛਾਣ ਨੰਬਰ ਦਾਖਲ ਕਰੋ...", btn_retrieve: "ਰਿਕਾਰਡ ਪ੍ਰਾਪਤ ਕਰੋ", btn_query: "ਖੋਜ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ...",
            err_not_found: "ਇਸ ਪਛਾਣ ਨੰਬਰ ਨਾਲ ਮੇਲ ਖਾਂਦਾ ਕੋਈ ਪ੍ਰਬੰਧਕੀ ਰਿਕਾਰਡ ਨਹੀਂ ਮਿਲਿਆ।", err_net: "ਨੈੱਟਵਰਕ ਟ੍ਰਾਂਸਮਿਸ਼ਨ ਅਸਫਲ ਰਿਹਾ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
            lbl_priority: "ਤਰਜੀਹ", lbl_est_res: "ਅਨੁਮਾਨਿਤ ਰੈਜ਼ੋਲੂਸ਼ਨ", lbl_timeline: "ਕਾਰਜਸ਼ੀਲ ਸਮਾਂਰੇਖਾ", lbl_desc: "ਵਿਸਤ੍ਰਿਤ ਮੁਲਾਂਕਣ", 
            lbl_doc: "ਸ਼ੁਰੂਆਤੀ ਦਸਤਾਵੇਜ਼", lbl_recent: "ਤਾਜ਼ਾ ਜਨਤਕ ਫਾਈਲਿੰਗ", lbl_retrieving: "ਪ੍ਰਸ਼ਾਸਨਿਕ ਰਿਕਾਰਡ ਪ੍ਰਾਪਤ ਕੀਤੇ ਜਾ ਰਹੇ ਹਨ...", lbl_status: "ਸਥਿਤੀ",
            step1_title: "ਘਟਨਾ ਦਰਜ", step1_desc: "ਰਿਪੋਰਟ ਸਫਲਤਾਪੂਰਵਕ ਮਿਉਂਸਪਲ ਡੇਟਾਬੇਸ ਵਿੱਚ ਪ੍ਰਸਾਰਿਤ ਕੀਤੀ ਗਈ।",
            step2_title: "ਕਰਮਚਾਰੀ ਨਿਯੁਕਤ ਕੀਤੇ ਗਏ", step2_desc: "ਵਿਭਾਗੀ ਸਮੀਖਿਆ ਪੂਰੀ ਅਤੇ ਕਾਰਜ ਟੀਮ ਅਲਾਟ ਕੀਤੀ ਗਈ।",
            step3_title: "ਰੱਖ-ਰਖਾਅ ਜਾਰੀ ਹੈ", step3_desc: "ਫੀਲਡ ਕਰਮਚਾਰੀ ਸਰਗਰਮੀ ਨਾਲ ਲੋੜੀਂਦੀ ਮੁਰੰਮਤ ਕਰ ਰਹੇ ਹਨ।",
            step4_title: "ਸੰਚਾਲਨ ਸਮਾਪਤ", step4_desc: "ਬੁਨਿਆਦੀ ਢਾਂਚੇ ਦੀ ਕਮੀ ਦਾ ਹੱਲ ਅਤੇ ਪ੍ਰਮਾਣਿਤ ਕੀਤਾ ਗਿਆ।",
            concluded: "ਸੰਚਾਲਨ ਸਮਾਪਤ", pending: "ਨਿਯੁਕਤੀ ਲੰਬਿਤ ਹੈ"
        },
        bho: {
            lang: "भोजपुरी", help: "मदद केंद्र", back: "ऑपरेशंस पोर्टल पर वापस जाईं",
            title: "समाधान ट्रैकर", sub: "रिपोर्ट कइल गइल बुनियादी ढांचा के कमी के परिचालन स्थिति आ प्रगति के निगरानी करीं।",
            search_ph: "घटना ट्रैकिंग पहचान संख्या दर्ज करीं...", btn_retrieve: "रिकॉर्ड प्राप्त करीं", btn_query: "खोजल जा रहल बा...",
            err_not_found: "एह पहचान संख्या से मेल खाए वाला कवनो प्रशासनिक रिकॉर्ड ना मिलल।", err_net: "नेटवर्क ट्रांसमिशन विफल हो गइल। कृपया फेर से प्रयास करीं।",
            lbl_priority: "प्राथमिकता", lbl_est_res: "अनुमानित समाधान", lbl_timeline: "परिचालन समयरेखा", lbl_desc: "विस्तृत मूल्यांकन", 
            lbl_doc: "प्रारंभिक दस्तावेजीकरण", lbl_recent: "हाल के सार्वजनिक फाइलिंग", lbl_retrieving: "प्रशासनिक रिकॉर्ड प्राप्त कइल जा रहल बा...", lbl_status: "स्थिति",
            step1_title: "घटना पंजीकृत", step1_desc: "रिपोर्ट सफलतापूर्वक नगर निगम डेटाबेस में प्रसारित कइल गइल।",
            step2_title: "कर्मचारी नियुक्त", step2_desc: "विभागीय समीक्षा पूरा आ संचालन दल आवंटित।",
            step3_title: "रखरखाव प्रगति पर", step3_desc: "फील्ड कर्मी सक्रिय रूप से जरूरी मरम्मत कर रहल बाड़ें।",
            step4_title: "संचालन संपन्न", step4_desc: "बुनियादी ढांचा के कमी के समाधान आ सत्यापन कइल गइल।",
            concluded: "संचालन संपन्न", pending: "नियुक्ति लंबित"
        },
        ar: {
            lang: "العربية", help: "مركز المساعدة", back: "العودة إلى بوابة العمليات",
            title: "متتبع القرار", sub: "مراقبة الحالة التشغيلية وتقدم النشر لأوجه القصور المبلغ عنها.",
            search_ph: "أدخل رقم تعريف تتبع الحادث...", btn_retrieve: "استرداد السجل", btn_query: "جاري الاستعلام...",
            err_not_found: "لم يتم العثور على سجل إداري يطابق رقم التعريف هذا.", err_net: "فشل نقل الشبكة. يرجى المحاولة مرة أخرى.",
            lbl_priority: "الأولوية", lbl_est_res: "الحل المقدر", lbl_timeline: "الجدول الزمني التشغيلي", lbl_desc: "تقييم مفصل", 
            lbl_doc: "الوثائق الأولية", lbl_recent: "الملفات العامة الأخيرة", lbl_retrieving: "جاري استرداد السجلات...", lbl_status: "الحالة",
            step1_title: "تم تسجيل الحادث", step1_desc: "تم نقل التقرير بنجاح إلى قاعدة بيانات البلدية.",
            step2_title: "تم تعيين الموظفين", step2_desc: "اكتملت مراجعة القسم وتم تخصيص فريق العمليات.",
            step3_title: "الصيانة قيد التقدم", step3_desc: "يقوم الموظفون الميدانيون بتنفيذ الإصلاحات المطلوبة بنشاط.",
            step4_title: "اختتمت العمليات", step4_desc: "تم حل نقص البنية التحتية والتحقق منه.",
            concluded: "اختتمت العمليات", pending: "التعيين معلق"
        },
        es: {
            lang: "Español", help: "Centro de ayuda", back: "Volver al Portal de Operaciones",
            title: "Rastreador de Resolución", sub: "Supervise el estado operativo y el progreso de las deficiencias reportadas.",
            search_ph: "Ingrese el Número de Identificación de Rastreo...", btn_retrieve: "Recuperar Registro", btn_query: "Consultando...",
            err_not_found: "No se encontró ningún registro administrativo que coincida con esta identificación.", err_net: "Fallo en la transmisión de red. Por favor, inténtelo de nuevo.",
            lbl_priority: "Prioridad", lbl_est_res: "Resolución Estimada", lbl_timeline: "Cronograma Operativo", lbl_desc: "Evaluación Detallada", 
            lbl_doc: "Documentación Inicial", lbl_recent: "Registros Públicos Recientes", lbl_retrieving: "Recuperando registros administrativos...", lbl_status: "Estado",
            step1_title: "Incidente Registrado", step1_desc: "Reporte transmitido exitosamente a la base de datos municipal.",
            step2_title: "Personal Asignado", step2_desc: "Revisión departamental completa y equipo de operaciones asignado.",
            step3_title: "Mantenimiento en Progreso", step3_desc: "El personal de campo está ejecutando activamente las reparaciones requeridas.",
            step4_title: "Operaciones Concluidas", step4_desc: "Deficiencia de infraestructura resuelta y verificada.",
            concluded: "Operaciones Concluidas", pending: "Asignación Pendiente"
        },
        fr: {
            lang: "Français", help: "Centre d'aide", back: "Retour au Portail des Opérations",
            title: "Suivi de Résolution", sub: "Surveiller l'état opérationnel et la progression des lacunes signalées.",
            search_ph: "Entrez le Numéro d'Identification de Suivi...", btn_retrieve: "Récupérer le Registre", btn_query: "Interrogation...",
            err_not_found: "Aucun registre administratif ne correspond à ce numéro d'identification.", err_net: "Échec de la transmission réseau. Veuillez réessayer.",
            lbl_priority: "Priorité", lbl_est_res: "Résolution Estimée", lbl_timeline: "Chronologie Opérationnelle", lbl_desc: "Évaluation Détaillée", 
            lbl_doc: "Documentation Initiale", lbl_recent: "Dépôts Publics Récents", lbl_retrieving: "Récupération des registres administratifs...", lbl_status: "Statut",
            step1_title: "Incident Enregistré", step1_desc: "Rapport transmis avec succès à la base de données municipale.",
            step2_title: "Personnel Assigné", step2_desc: "Examen départemental terminé et équipe d'opérations allouée.",
            step3_title: "Maintenance en Cours", step3_desc: "Le personnel de terrain exécute activement les réparations requises.",
            step4_title: "Opérations Conclues", step4_desc: "Lacune d'infrastructure résolue et vérifiée.",
            concluded: "Opérations Conclues", pending: "Assignation en Attente"
        },
        de: {
            lang: "Deutsch", help: "Hilfezentrum", back: "Zurück zum Operationsportal",
            title: "Lösungs-Tracker", sub: "Überwachen Sie den operativen Status und den Fortschritt gemeldeter Mängel.",
            search_ph: "Geben Sie die Vorfall-Tracking-ID ein...", btn_retrieve: "Datensatz Abrufen", btn_query: "Abfrage läuft...",
            err_not_found: "Es wurde kein Verwaltungsdatensatz gefunden, der dieser ID entspricht.", err_net: "Netzwerkübertragung fehlgeschlagen. Bitte versuchen Sie es erneut.",
            lbl_priority: "Priorität", lbl_est_res: "Geschätzte Lösung", lbl_timeline: "Operativer Zeitplan", lbl_desc: "Detaillierte Bewertung", 
            lbl_doc: "Anfangsdokumentation", lbl_recent: "Aktuelle Öffentliche Einreichungen", lbl_retrieving: "Verwaltungsdaten werden abgerufen...", lbl_status: "Status",
            step1_title: "Vorfall Registriert", step1_desc: "Bericht erfolgreich an die kommunale Datenbank übermittelt.",
            step2_title: "Personal Zugewiesen", step2_desc: "Abteilungsprüfung abgeschlossen und Einsatzteam zugewiesen.",
            step3_title: "Wartung in Gange", step3_desc: "Feldpersonal führt aktiv erforderliche Reparaturen durch.",
            step4_title: "Betrieb Abgeschlossen", step4_desc: "Infrastrukturmangel behoben und verifiziert.",
            concluded: "Betrieb Abgeschlossen", pending: "Zuweisung Ausstehend"
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

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsProcessing(true);
        setSearchMessage('');
        setActiveRecord(null);

        try {
            const documentRef = doc(db, 'civic_complaints', searchQuery.trim());
            const documentSnapshot = await getDoc(documentRef);

            if (documentSnapshot.exists()) {
                setActiveRecord({ id: documentSnapshot.id, ...documentSnapshot.data() });
            } else {
                setSearchMessage(currentT.err_not_found);
            }
        } catch (error) {
            console.error("Search execution failed:", error);
            setSearchMessage(currentT.err_net);
        } finally {
            setIsProcessing(false);
        }
    };

    const loadRecordDirectly = (record) => {
        setActiveRecord(record);
        setSearchQuery(record.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const calculateEstimatedResolution = (createdAt, priority) => {
        if (!createdAt) return currentT.pending;
        
        const baseDate = createdAt.toDate();
        let daysToAdd = 7; // Standard Priority default
        
        if (priority === 'Critical') daysToAdd = 1;
        if (priority === 'High') daysToAdd = 3;

        baseDate.setDate(baseDate.getDate() + daysToAdd);
        return baseDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const getTimelineStage = (status) => {
        const stages = ['Submitted', 'Assigned', 'In Progress', 'Completed'];
        const currentIndex = stages.indexOf(status);
        return currentIndex >= 0 ? currentIndex : 0;
    };

    const timelineSteps = [
        { title: currentT.step1_title, icon: FileText, description: currentT.step1_desc },
        { title: currentT.step2_title, icon: ShieldCheck, description: currentT.step2_desc },
        { title: currentT.step3_title, icon: Wrench, description: currentT.step3_desc },
        { title: currentT.step4_title, icon: CheckCircle, description: currentT.step4_desc }
    ];

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

                {/* Search Interface */}
                <div className={`rounded-2xl p-6 md:p-8 mb-12 border ${theme === 'light' ? 'bg-white border-[#e0e0e0]' : 'bg-[#111111] border-[#333333]'}`}>
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555555]" />
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={currentT.search_ph} 
                                className={`w-full pl-12 pr-4 py-4 rounded-xl outline-none transition-colors text-[0.95rem] border ${
                                    theme === 'light' ? 'bg-[#f5f5f5] border-[#cccccc] text-black focus:border-black' : 'bg-[#000000] border-[#333333] text-white focus:border-white'
                                }`}
                            />
                        </div>
                        <button 
                            type="submit"
                            disabled={isProcessing || !searchQuery.trim()}
                            className={`px-8 py-4 rounded-xl font-black text-[0.95rem] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 outline-none ${
                                theme === 'light' ? 'bg-black text-white hover:bg-[#333333]' : 'bg-white text-black hover:bg-[#e0e0e0]'
                            }`}
                        >
                            {isProcessing ? currentT.btn_query : currentT.btn_retrieve}
                        </button>
                    </form>
                    {searchMessage && (
                        <p className="text-[#ff4444] text-[0.9rem] mt-4 font-bold">{searchMessage}</p>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    {activeRecord ? (
                        <motion.div 
                            key="active-record"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`rounded-2xl overflow-hidden border ${theme === 'light' ? 'bg-white border-[#e0e0e0]' : 'bg-[#111111] border-[#333333]'}`}
                        >
                            <div className={`p-6 md:p-8 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${theme === 'light' ? 'border-[#e0e0e0]' : 'border-[#333333]'}`}>
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-3 py-1 text-[0.75rem] font-black tracking-wider uppercase rounded-full ${
                                            theme === 'light' ? 'bg-[#f0f0f0] text-[#555555]' : 'bg-[#222222] text-white'
                                        }`}>
                                            {activeRecord.category}
                                        </span>
                                        <span className={`px-3 py-1 text-[0.75rem] font-black tracking-wider uppercase rounded-full ${
                                            activeRecord.priority === 'Critical' ? 'bg-[#ffcccc] text-[#cc0000]' : 
                                            activeRecord.priority === 'High' ? 'bg-[#ffeebb] text-[#cc8800]' : 
                                            'bg-[#ccffdd] text-[#00aa55]'
                                        }`}>
                                            {activeRecord.priority} {currentT.lbl_priority}
                                        </span>
                                    </div>
                                    <h2 className={`text-[1.5rem] font-black ${theme === 'light' ? 'text-black' : 'text-white'}`}>{activeRecord.title}</h2>
                                    <p className={`text-[0.9rem] font-mono mt-1 ${theme === 'light' ? 'text-[#888888]' : 'text-[#888888]'}`}>{currentT.lbl_id}: {activeRecord.id}</p>
                                </div>
                                
                                <div className={`rounded-xl p-4 min-w-[200px] border ${theme === 'light' ? 'bg-[#f9f9f9] border-[#e0e0e0]' : 'bg-[#000000] border-[#333333]'}`}>
                                    <div className="flex items-center gap-2 text-[#888888] text-[0.8rem] font-bold uppercase tracking-wider mb-1">
                                        <Calendar size={14} /> {currentT.lbl_est_res}
                                    </div>
                                    <div className={`font-bold text-[0.95rem] ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                                        {activeRecord.status === 'Completed' ? currentT.concluded : calculateEstimatedResolution(activeRecord.createdAt, activeRecord.priority)}
                                    </div>
                                </div>
                            </div>

                            <div className={`p-6 md:p-8 border-b ${theme === 'light' ? 'border-[#e0e0e0]' : 'border-[#333333]'}`}>
                                <h3 className={`text-[1.1rem] font-black mb-6 ${theme === 'light' ? 'text-black' : 'text-white'}`}>{currentT.lbl_timeline}</h3>
                                <div className="relative">
                                    <div className={`absolute left-[19px] top-4 bottom-4 w-[2px] z-0 ${theme === 'light' ? 'bg-[#e0e0e0]' : 'bg-[#333333]'}`}></div>
                                    
                                    <div className="flex flex-col gap-8 relative z-10">
                                        {timelineSteps.map((step, index) => {
                                            const currentStage = getTimelineStage(activeRecord.status);
                                            const isCompleted = index <= currentStage;
                                            const isCurrent = index === currentStage;
                                            const StepIcon = step.icon;

                                            return (
                                                <div key={index} className="flex gap-6">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 ${
                                                        isCompleted 
                                                            ? (theme === 'light' ? 'bg-black border-black text-white' : 'bg-white border-white text-black')
                                                            : (theme === 'light' ? 'bg-[#f9f9f9] border-[#cccccc] text-[#888888]' : 'bg-[#000000] border-[#333333] text-[#555555]')
                                                    }`}>
                                                        <StepIcon size={18} />
                                                    </div>
                                                    <div className="pt-1">
                                                        <h4 className={`text-[1.05rem] font-black ${
                                                            isCompleted 
                                                                ? (theme === 'light' ? 'text-black' : 'text-white')
                                                                : 'text-[#888888]'
                                                        }`}>
                                                            {step.title}
                                                        </h4>
                                                        <p className={`text-[0.9rem] mt-1 ${
                                                            isCurrent 
                                                                ? (theme === 'light' ? 'text-[#555555]' : 'text-[#aaaaaa]')
                                                                : (theme === 'light' ? 'text-[#888888]' : 'text-[#555555]')
                                                        }`}>
                                                            {step.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className={`p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 ${theme === 'light' ? 'bg-[#f9f9f9]' : 'bg-[#0a0a0a]'}`}>
                                <div>
                                    <h3 className="text-[0.9rem] font-bold text-[#888888] uppercase tracking-wider mb-3 flex items-center gap-2">
                                        <FileText size={16} /> {currentT.lbl_desc}
                                    </h3>
                                    <p className={`text-[0.95rem] leading-relaxed whitespace-pre-wrap ${theme === 'light' ? 'text-[#555555]' : 'text-[#aaaaaa]'}`}>
                                        {activeRecord.description}
                                    </p>
                                </div>
                                
                                {activeRecord.evidenceUrl && (
                                    <div>
                                        <h3 className="text-[0.9rem] font-bold text-[#888888] uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <ImageIcon size={16} /> {currentT.lbl_doc}
                                        </h3>
                                        <div className={`w-full aspect-video rounded-xl overflow-hidden border ${theme === 'light' ? 'bg-[#e0e0e0] border-[#cccccc]' : 'bg-[#000000] border-[#333333]'}`}>
                                            <img 
                                                src={activeRecord.evidenceUrl} 
                                                alt="Infrastructure Deficiency Documentation" 
                                                className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="recent-records"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <h3 className={`text-[1.2rem] font-black mb-6 flex items-center gap-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                                <Clock size={20} className="text-[#888888]" /> {currentT.lbl_recent}
                            </h3>
                            
                            {recentRecords.length === 0 ? (
                                <div className={`rounded-2xl p-10 text-center border ${theme === 'light' ? 'bg-white border-[#e0e0e0]' : 'bg-[#111111] border-[#333333]'}`}>
                                    <p className="text-[#888888]">{currentT.lbl_retrieving}</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    {recentRecords.map((record) => (
                                        <div 
                                            key={record.id}
                                            onClick={() => loadRecordDirectly(record)}
                                            className={`p-6 rounded-2xl transition-colors cursor-pointer group border ${
                                                theme === 'light' ? 'bg-white border-[#e0e0e0] hover:border-black' : 'bg-[#111111] border-[#333333] hover:border-white'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start gap-4 mb-3">
                                                <h4 className={`text-[1.1rem] font-black group-hover:underline ${theme === 'light' ? 'text-black' : 'text-white'}`}>{record.title}</h4>
                                                <span className="shrink-0 text-[0.8rem] font-mono text-[#888888]">{currentT.lbl_id}: {record.id.substring(0, 8)}...</span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4 text-[0.85rem] font-bold">
                                                <span className={theme === 'light' ? 'text-[#666666]' : 'text-[#aaaaaa]'}>{record.category}</span>
                                                <span className={`w-1 h-1 rounded-full ${theme === 'light' ? 'bg-[#cccccc]' : 'bg-[#333333]'}`}></span>
                                                <span className={record.status === 'Completed' ? 'text-[#00aa55]' : 'text-[#cc8800]'}>
                                                    {currentT.lbl_status}: {record.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}