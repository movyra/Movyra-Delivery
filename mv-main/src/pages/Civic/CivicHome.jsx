import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { 
    ShieldCheck, 
    BarChart3, 
    Map, 
    TerminalSquare, 
    ArrowRight,
    ArrowUp,
    Sun,
    Moon,
    Activity,
    Lock,
    Smartphone,
    Users,
    LayoutDashboard,
    X,
    Globe
} from 'lucide-react';
import { useCivicStore } from '../../store/useCivicStore';

export default function CivicHome() {
    const navigate = useNavigate();
    const theme = useCivicStore((state) => state.theme);
    const toggleTheme = useCivicStore((state) => state.toggleTheme);
    const terminateSession = useCivicStore((state) => state.terminateSession);

    const [user, setUser] = useState(null);
    const [lang, setLang] = useState('en');
    const [showLangPrompt, setShowLangPrompt] = useState(false);

    // Variables for the standardized footer
    const localCity = "Mumbai";

    // Track authentication state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    // Set initial language based on browser
    useEffect(() => {
        const sysLang = navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'mr', 'gu', 'te', 'ta', 'pa', 'bho', 'ar', 'es', 'fr', 'de'];
        if (supported.includes(sysLang)) setLang(sysLang);
    }, []);

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

    // 13-Language Comprehensive Dictionary (Simplified Terminology)
    const t = {
        en: {
            lang: "English", sign_in: "Sign In", sign_up: "Sign Up", log_out: "Log out", careers: "Careers", dev: "Developers",
            badge: "Smart City Operations",
            hero_title: "Manage City Services Fast & Securely.",
            hero_desc: "A simple, secure platform to report issues, track work progress, and manage daily municipal tasks in real time.",
            get_started: "Get Started",
            val_title: "Why Choose Us?", val_desc: "Built for speed, transparency, and simple tracking.",
            v1_t: "Location Tracking", v1_d: "Pinpoint exact locations for faster field response.",
            v2_t: "Live Updates", v2_d: "Watch the status of work change from pending to complete.",
            v3_t: "Secure Records", v3_d: "All data is stored safely with controlled access.",
            stat_title: "Clear Analytics.", stat_desc: "View performance dashboards instantly. Track total reports, resolution speed, and active areas without complex menus.",
            work_title: "How It Works", 
            w1_t: "Report", w1_d: "Submit details.", w2_t: "Assign", w2_d: "Routed to team.", w3_t: "Resolve", w3_d: "Work completed.",
            api_title: "Connect Systems.", api_desc: "Use our simple API to pull active task data into your existing tools. Standard JSON responses make integration fast.",
            api_btn: "Read API Docs",
            sec_title: "Data Privacy First.", sec_desc: "Your reports and personal details are protected by enterprise-grade security. We ensure that sensitive operational data is only accessible to authorized municipal personnel.",
            mob_title: "Access Anywhere.", mob_desc: "Report issues on the go. Our platform is fully optimized for smartphones and tablets, ensuring you can manage and track tasks from any field location.",
            imp_title: "Better Cities Together.", imp_desc: "Join thousands of citizens and municipal officials working in harmony. A unified network ensures faster resolutions and improves local infrastructure for everyone."
        },
        hi: {
            lang: "हिन्दी", sign_in: "साइन इन", sign_up: "साइन अप", log_out: "लॉग आउट", careers: "करियर", dev: "डेवलपर्स",
            badge: "स्मार्ट सिटी ऑपरेशंस",
            hero_title: "शहर की सेवाओं का तेजी से प्रबंधन करें।",
            hero_desc: "समस्याओं की रिपोर्ट करने और प्रगति को ट्रैक करने के लिए एक सुरक्षित मंच।",
            get_started: "शुरू करें",
            val_title: "हमें क्यों चुनें?", val_desc: "गति, पारदर्शिता और आसान ट्रैकिंग के लिए बनाया गया।",
            v1_t: "स्थान ट्रैकिंग", v1_d: "तेजी से प्रतिक्रिया के लिए सटीक स्थान।",
            v2_t: "लाइव अपडेट", v2_d: "लंबित से पूर्ण होने तक कार्य की स्थिति देखें।",
            v3_t: "सुरक्षित रिकॉर्ड", v3_d: "सभी डेटा सुरक्षित रूप से संग्रहीत किया जाता है।",
            stat_title: "स्पष्ट विश्लेषिकी।", stat_desc: "प्रदर्शन डैशबोर्ड तुरंत देखें। संकल्प गति और सक्रिय क्षेत्रों को ट्रैक करें।",
            work_title: "यह कैसे काम करता है", 
            w1_t: "रिपोर्ट", w1_d: "विवरण सबमिट करें।", w2_t: "असाइन", w2_d: "टीम को भेजा गया।", w3_t: "समाधान", w3_d: "काम पूरा हुआ।",
            api_title: "सिस्टम कनेक्ट करें।", api_desc: "अपने मौजूदा टूल में डेटा खींचने के लिए हमारे API का उपयोग करें।",
            api_btn: "API डॉक्स पढ़ें",
            sec_title: "डेटा गोपनीयता।", sec_desc: "आपकी रिपोर्ट सुरक्षित हैं। केवल अधिकृत कर्मचारी ही डेटा देख सकते हैं।",
            mob_title: "कहीं भी पहुँचें।", mob_desc: "चलते-फिरते समस्याओं की रिपोर्ट करें। स्मार्टफ़ोन के लिए अनुकूलित।",
            imp_title: "एक साथ बेहतर शहर।", imp_desc: "हजारों नागरिकों से जुड़ें। एक एकीकृत नेटवर्क तेज समाधान सुनिश्चित करता है।"
        },
        hinglish: {
            lang: "Hinglish", sign_in: "Sign In", sign_up: "Sign Up", log_out: "Log out", careers: "Careers", dev: "Developers",
            badge: "Smart City Operations",
            hero_title: "City Services ko fast manage karein.",
            hero_desc: "Issues report karne aur progress track karne ka secure platform.",
            get_started: "Start Karein",
            val_title: "Humein kyun chunein?", val_desc: "Speed, transparency, aur easy tracking ke liye bana.",
            v1_t: "Location Tracking", v1_d: "Fast response ke liye exact location.",
            v2_t: "Live Updates", v2_d: "Work status ko pending se complete hote dekhein.",
            v3_t: "Secure Records", v3_d: "Sabhi data safely store hota hai.",
            stat_title: "Clear Analytics.", stat_desc: "Performance dashboards turant dekhein. Resolution speed track karein.",
            work_title: "Yeh kaise kaam karta hai", 
            w1_t: "Report", w1_d: "Details submit karein.", w2_t: "Assign", w2_d: "Team ko bheja gaya.", w3_t: "Resolve", w3_d: "Kaam poora hua.",
            api_title: "Systems Connect Karein.", api_desc: "Apne existing tools me data pull karne ke liye hamara API use karein.",
            api_btn: "API Docs Padhein",
            sec_title: "Data Privacy.", sec_desc: "Aapki reports secure hain. Sirf authorized staff data dekh sakte hain.",
            mob_title: "Kahin se bhi access karein.", mob_desc: "Chalte-phirte issues report karein. Smartphones ke liye optimized.",
            imp_title: "Ek sath behtar shehar.", imp_desc: "Hazaron citizens se judein. Unified network fast resolution ensure karta hai."
        },
        mr: {
            lang: "मराठी", sign_in: "साइन इन करा", sign_up: "साइन अप करा", log_out: "लॉग आउट", careers: "करिअर", dev: "डेव्हलपर्स",
            badge: "स्मार्ट सिटी ऑपरेशन्स",
            hero_title: "शहराच्या सेवांचे वेगाने व्यवस्थापन करा.",
            hero_desc: "समस्यांची नोंद करण्यासाठी आणि प्रगती ट्रॅक करण्यासाठी सुरक्षित प्लॅटफॉर्म.",
            get_started: "सुरू करा",
            val_title: "आम्हाला का निवडावे?", val_desc: "वेग, पारदर्शकता आणि सोप्या ट्रॅकिंगसाठी बनवलेले.",
            v1_t: "लोकेशन ट्रॅकिंग", v1_d: "जलद प्रतिसादासाठी अचूक ठिकाण.",
            v2_t: "थेट अपडेट्स", v2_d: "काम प्रलंबित ते पूर्ण होईपर्यंत स्थिती पहा.",
            v3_t: "सुरक्षित रेकॉर्ड", v3_d: "सर्व डेटा सुरक्षितपणे जतन केला जातो.",
            stat_title: "स्पष्ट विश्लेषण.", stat_desc: "कामगिरी डॅशबोर्ड त्वरित पहा. सोडवण्याचा वेग ट्रॅक करा.",
            work_title: "हे कसे काम करते", 
            w1_t: "रिपोर्ट", w1_d: "तपशील सबमिट करा.", w2_t: "असाइन", w2_d: "टीम कडे पाठवले.", w3_t: "निराकरण", w3_d: "काम पूर्ण झाले.",
            api_title: "सिस्टम कनेक्ट करा.", api_desc: "तुमच्या सध्याच्या टूल्समध्ये डेटा ओढण्यासाठी आमचा API वापरा.",
            api_btn: "API डॉक्स वाचा",
            sec_title: "डेटा गोपनीयता.", sec_desc: "तुमचे रिपोर्ट सुरक्षित आहेत. केवळ अधिकृत कर्मचारीच डेटा पाहू शकतात.",
            mob_title: "कुठूनही प्रवेश करा.", mob_desc: "चालता-फिरता समस्यांची नोंद करा. स्मार्टफोन्ससाठी ऑप्टिमाइझ केलेले.",
            imp_title: "एकत्रित उत्तम शहरे.", imp_desc: "हजारो नागरिकांमध्ये सामील व्हा. एकसंध नेटवर्क जलद निराकरण सुनिश्चित करते."
        },
        gu: {
            lang: "ગુજરાતી", sign_in: "સાઇન ઇન", sign_up: "સાઇન અપ", log_out: "લૉગ આઉટ", careers: "કારકિર્દી", dev: "ડેવલપર્સ",
            badge: "સ્માર્ટ સિટી ઓપરેશન્સ",
            hero_title: "શહેરની સેવાઓનું ઝડપથી સંચાલન કરો.",
            hero_desc: "સમસ્યાઓની જાણ કરવા અને પ્રગતિને ટ્રૅક કરવા માટે એક સુરક્ષિત પ્લેટફોર્મ.",
            get_started: "શરૂ કરો",
            val_title: "અમને શા માટે પસંદ કરો?", val_desc: "ઝડપ, પારદર્શિતા અને સરળ ટ્રેકિંગ માટે બનાવેલ.",
            v1_t: "સ્થાન ટ્રેકિંગ", v1_d: "ઝડપી પ્રતિસાદ માટે ચોક્કસ સ્થાન.",
            v2_t: "લાઇવ અપડેટ્સ", v2_d: "કાર્ય પેન્ડિંગથી પૂર્ણ થાય ત્યાં સુધી સ્થિતિ જુઓ.",
            v3_t: "સુરક્ષિત રેકોર્ડ્સ", v3_d: "તમામ ડેટા સુરક્ષિત રીતે સંગ્રહિત છે.",
            stat_title: "સ્પષ્ટ એનાલિટિક્સ.", stat_desc: "પ્રદર્શન ડેશબોર્ડ તરત જ જુઓ. રિઝોલ્યુશનની ઝડપને ટ્રૅક કરો.",
            work_title: "તે કેવી રીતે કામ કરે છે", 
            w1_t: "રિપોર્ટ", w1_d: "વિગતો સબમિટ કરો.", w2_t: "સોંપો", w2_d: "ટીમને મોકલવામાં આવ્યું.", w3_t: "ઉકેલો", w3_d: "કામ પૂર્ણ થયું.",
            api_title: "સિસ્ટમ્સ કનેક્ટ કરો.", api_desc: "તમારા વર્તમાન ટૂલ્સમાં ડેટા ખેંચવા માટે અમારા API નો ઉપયોગ કરો.",
            api_btn: "API ડૉક્સ વાંચો",
            sec_title: "ડેટા ગોપનીયતા.", sec_desc: "તમારા રિપોર્ટ્સ સુરક્ષિત છે. માત્ર અધિકૃત સ્ટાફ જ ડેટા જોઈ શકે છે.",
            mob_title: "ગમે ત્યાંથી ઍક્સેસ કરો.", mob_desc: "સફરમાં સમસ્યાઓની જાણ કરો. સ્માર્ટફોન માટે ઑપ્ટિમાઇઝ.",
            imp_title: "એકસાથે વધુ સારા શહેરો.", imp_desc: "હજારો નાગરિકો સાથે જોડાઓ. એકીકૃત નેટવર્ક ઝડપી ઉકેલની ખાતરી કરે છે."
        },
        te: {
            lang: "తెలుగు", sign_in: "సైన్ ఇన్", sign_up: "సైన్ అప్", log_out: "లాగౌట్", careers: "కెరీర్స్", dev: "డెవలపర్లు",
            badge: "స్మార్ట్ సిటీ కార్యకలాపాలు",
            hero_title: "నగర సేవలను వేగంగా నిర్వహించండి.",
            hero_desc: "సమస్యలను నివేదించడానికి మరియు పురోగతిని ట్రాక్ చేయడానికి సురక్షిత వేదిక.",
            get_started: "ప్రారంభించండి",
            val_title: "మమ్మల్ని ఎందుకు ఎంచుకోవాలి?", val_desc: "వేగం, పారదర్శకత మరియు సులభమైన ట్రాకింగ్ కోసం నిర్మించబడింది.",
            v1_t: "స్థాన ట్రాకింగ్", v1_d: "వేగవంతమైన ప్రతిస్పందన కోసం ఖచ్చితమైన స్థానం.",
            v2_t: "ప్రత్యక్ష నవీకరణలు", v2_d: "పెండింగ్ నుండి పూర్తయ్యే వరకు పని స్థితిని చూడండి.",
            v3_t: "సురక్షిత రికార్డులు", v3_d: "మొత్తం డేటా సురక్షితంగా నిల్వ చేయబడుతుంది.",
            stat_title: "స్పష్టమైన విశ్లేషణలు.", stat_desc: "పనితీరు డ్యాష్‌బోర్డ్‌లను తక్షణమే చూడండి. రిజల్యూషన్ వేగాన్ని ట్రాక్ చేయండి.",
            work_title: "ఇది ఎలా పనిచేస్తుంది", 
            w1_t: "నివేదించు", w1_d: "వివరాలను సమర్పించండి.", w2_t: "కేటాయించు", w2_d: "బృందానికి పంపబడింది.", w3_t: "పరిష్కరించు", w3_d: "పని పూర్తయింది.",
            api_title: "సిస్టమ్‌లను కనెక్ట్ చేయండి.", api_desc: "మీ ప్రస్తుత సాధనాల్లోకి డేటాను లాగడానికి మా APIని ఉపయోగించండి.",
            api_btn: "API డాక్స్ చదవండి",
            sec_title: "డేటా గోప్యత.", sec_desc: "మీ నివేదికలు సురక్షితం. అధీకృత సిబ్బంది మాత్రమే డేటాను చూడగలరు.",
            mob_title: "ఎక్కడి నుండైనా యాక్సెస్ చేయండి.", mob_desc: "ప్రయాణంలో సమస్యలను నివేదించండి. స్మార్ట్‌ఫోన్‌ల కోసం ఆప్టిమైజ్ చేయబడింది.",
            imp_title: "కలిసి మెరుగైన నగరాలు.", imp_desc: "వేలాది మంది పౌరులతో చేరండి. ఏకీకృత నెట్‌వర్క్ వేగవంతమైన పరిష్కారాన్ని నిర్ధారిస్తుంది."
        },
        ta: {
            lang: "தமிழ்", sign_in: "உள்நுழை", sign_up: "பதிவு செய்", log_out: "வெளியேறு", careers: "தொழில்கள்", dev: "டெவலப்பர்கள்",
            badge: "ஸ்மார்ட் சிட்டி செயல்பாடுகள்",
            hero_title: "நகர சேவைகளை வேகமாக நிர்வகிக்கவும்.",
            hero_desc: "சிக்கல்களைப் புகாரளிக்க மற்றும் முன்னேற்றத்தைக் கண்காணிக்க பாதுகாப்பான தளம்.",
            get_started: "தொடங்கு",
            val_title: "எங்களை ஏன் தேர்வு செய்ய வேண்டும்?", val_desc: "வேகம், வெளிப்படைத்தன்மை மற்றும் எளிதான கண்காணிப்பிற்காக உருவாக்கப்பட்டது.",
            v1_t: "இடக் கண்காணிப்பு", v1_d: "வேகமான பதிலுக்கு சரியான இடம்.",
            v2_t: "நேரடி புதுப்பிப்புகள்", v2_d: "பணி நிலுவையிலிருந்து முடிவடையும் வரை பார்க்கவும்.",
            v3_t: "பாதுகாப்பான பதிவுகள்", v3_d: "அனைத்து தரவுகளும் பாதுகாப்பாக சேமிக்கப்படுகின்றன.",
            stat_title: "தெளிவான பகுப்பாய்வு.", stat_desc: "செயல்திறன் டாஷ்போர்டுகளை உடனடியாகப் பார்க்கவும். தீர்வு வேகத்தைக் கண்காணிக்கவும்.",
            work_title: "இது எப்படி வேலை செய்கிறது", 
            w1_t: "அறிக்கை", w1_d: "விவரங்களைச் சமர்ப்பிக்கவும்.", w2_t: "ஒதுக்கு", w2_d: "குழுவிற்கு அனுப்பப்பட்டது.", w3_t: "தீர்வு", w3_d: "பணி முடிந்தது.",
            api_title: "கணினிகளை இணைக்கவும்.", api_desc: "உங்கள் தற்போதைய கருவிகளில் தரவை இழுக்க எங்கள் API ஐப் பயன்படுத்தவும்.",
            api_btn: "API ஆவணங்களைப் படிக்கவும்",
            sec_title: "தரவு தனியுரிமை.", sec_desc: "உங்கள் அறிக்கைகள் பாதுகாப்பானவை. அங்கீகரிக்கப்பட்ட ஊழியர்கள் மட்டுமே தரவைப் பார்க்க முடியும்.",
            mob_title: "எங்கிருந்தும் அணுகலாம்.", mob_desc: "பயணத்தின்போது சிக்கல்களைப் புகாரளிக்கவும். ஸ்மார்ட்போன்களுக்கு உகந்ததாக உள்ளது.",
            imp_title: "ஒன்றாக சிறந்த நகரங்கள்.", imp_desc: "ஆயிரக்கணக்கான குடிமக்களுடன் இணையுங்கள். ஒருங்கிணைந்த நெட்வொர்க் விரைவான தீர்வை உறுதி செய்கிறது."
        },
        pa: {
            lang: "ਪੰਜਾਬੀ", sign_in: "ਸਾਈਨ ਇਨ", sign_up: "ਸਾਈਨ ਅੱਪ", log_out: "ਲੌਗ ਆਉਟ", careers: "ਕਰੀਅਰ", dev: "ਡਿਵੈਲਪਰ",
            badge: "ਸਮਾਰਟ ਸਿਟੀ ਸੰਚਾਲਨ",
            hero_title: "ਸ਼ਹਿਰ ਦੀਆਂ ਸੇਵਾਵਾਂ ਦਾ ਤੇਜ਼ੀ ਨਾਲ ਪ੍ਰਬੰਧਨ ਕਰੋ।",
            hero_desc: "ਸਮੱਸਿਆਵਾਂ ਦੀ ਰਿਪੋਰਟ ਕਰਨ ਅਤੇ ਤਰੱਕੀ ਨੂੰ ਟਰੈਕ ਕਰਨ ਲਈ ਇੱਕ ਸੁਰੱਖਿਅਤ ਪਲੇਟਫਾਰਮ।",
            get_started: "ਸ਼ੁਰੂ ਕਰੋ",
            val_title: "ਸਾਨੂੰ ਕਿਉਂ ਚੁਣੋ?", val_desc: "ਗਤੀ, ਪਾਰਦਰਸ਼ਤਾ ਅਤੇ ਆਸਾਨ ਟਰੈਕਿੰਗ ਲਈ ਬਣਾਇਆ ਗਿਆ।",
            v1_t: "ਸਥਾਨ ਟਰੈਕਿੰਗ", v1_d: "ਤੇਜ਼ ਜਵਾਬ ਲਈ ਸਹੀ ਸਥਾਨ।",
            v2_t: "ਲਾਈਵ ਅੱਪਡੇਟ", v2_d: "ਕੰਮ ਦੀ ਸਥਿਤੀ ਨੂੰ ਬਕਾਇਆ ਤੋਂ ਪੂਰਾ ਹੁੰਦੇ ਦੇਖੋ।",
            v3_t: "ਸੁਰੱਖਿਅਤ ਰਿਕਾਰਡ", v3_d: "ਸਾਰਾ ਡਾਟਾ ਸੁਰੱਖਿਅਤ ਢੰਗ ਨਾਲ ਸਟੋਰ ਕੀਤਾ ਜਾਂਦਾ ਹੈ।",
            stat_title: "ਸਪੱਸ਼ਟ ਵਿਸ਼ਲੇਸ਼ਣ।", stat_desc: "ਪ੍ਰਦਰਸ਼ਨ ਡੈਸ਼ਬੋਰਡ ਤੁਰੰਤ ਦੇਖੋ। ਹੱਲ ਦੀ ਗਤੀ ਨੂੰ ਟਰੈਕ ਕਰੋ।",
            work_title: "ਇਹ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ", 
            w1_t: "ਰਿਪੋਰਟ", w1_d: "ਵੇਰਵੇ ਸਬਮਿਟ ਕਰੋ।", w2_t: "ਨਿਰਧਾਰਤ ਕਰੋ", w2_d: "ਟੀਮ ਨੂੰ ਭੇਜਿਆ ਗਿਆ।", w3_t: "ਹੱਲ ਕਰੋ", w3_d: "ਕੰਮ ਪੂਰਾ ਹੋਇਆ।",
            api_title: "ਸਿਸਟਮ ਕਨੈਕਟ ਕਰੋ।", api_desc: "ਆਪਣੇ ਮੌਜੂਦਾ ਟੂਲਸ ਵਿੱਚ ਡਾਟਾ ਖਿੱਚਣ ਲਈ ਸਾਡੇ API ਦੀ ਵਰਤੋਂ ਕਰੋ।",
            api_btn: "API ਡੌਕਸ ਪੜ੍ਹੋ",
            sec_title: "ਡਾਟਾ ਗੋਪਨੀਯਤਾ।", sec_desc: "ਤੁਹਾਡੀਆਂ ਰਿਪੋਰਟਾਂ ਸੁਰੱਖਿਅਤ ਹਨ। ਸਿਰਫ਼ ਅਧਿਕਾਰਤ ਸਟਾਫ਼ ਹੀ ਡਾਟਾ ਦੇਖ ਸਕਦਾ ਹੈ।",
            mob_title: "ਕਿਤੇ ਵੀ ਪਹੁੰਚ ਕਰੋ।", mob_desc: "ਚਲਦੇ-ਫਿਰਦੇ ਸਮੱਸਿਆਵਾਂ ਦੀ ਰਿਪੋਰਟ ਕਰੋ। ਸਮਾਰਟਫ਼ੋਨਾਂ ਲਈ ਅਨੁਕੂਲਿਤ।",
            imp_title: "ਇਕੱਠੇ ਬਿਹਤਰ ਸ਼ਹਿਰ।", imp_desc: "ਹਜ਼ਾਰਾਂ ਨਾਗਰਿਕਾਂ ਨਾਲ ਜੁੜੋ। ਇੱਕ ਏਕੀਕ੍ਰਿਤ ਨੈੱਟਵਰਕ ਤੇਜ਼ ਹੱਲ ਯਕੀਨੀ ਬਣਾਉਂਦਾ ਹੈ।"
        },
        bho: {
            lang: "भोजपुरी", sign_in: "साइन इन", sign_up: "साइन अप", log_out: "लॉग आउट", careers: "करियर", dev: "डेवलपर्स",
            badge: "स्मार्ट सिटी ऑपरेशंस",
            hero_title: "शहर के सेवा सभ के तेजी से प्रबंधन करीं।",
            hero_desc: "समस्या सभ के रिपोर्ट करे आ प्रगति के ट्रैक करे खातिर एगो सुरक्षित मंच।",
            get_started: "शुरू करीं",
            val_title: "हमनी के काहे चुनीं?", val_desc: "गति, पारदर्शिता आ आसान ट्रैकिंग खातिर बनावल गइल।",
            v1_t: "स्थान ट्रैकिंग", v1_d: "तेजी से प्रतिक्रिया खातिर सटीक स्थान।",
            v2_t: "लाइव अपडेट", v2_d: "लंबित से पूरा भइल तक काम के स्थिति देखीं।",
            v3_t: "सुरक्षित रिकॉर्ड", v3_d: "सब डेटा सुरक्षित रूप से संग्रहीत कइल जाला।",
            stat_title: "स्पष्ट विश्लेषिकी।", stat_desc: "प्रदर्शन डैशबोर्ड तुरंत देखीं। संकल्प गति के ट्रैक करीं।",
            work_title: "ई कइसे काम करेला", 
            w1_t: "रिपोर्ट", w1_d: "विवरण सबमिट करीं।", w2_t: "असाइन", w2_d: "टीम के भेजल गइल।", w3_t: "समाधान", w3_d: "काम पूरा भइल।",
            api_title: "सिस्टम कनेक्ट करीं।", api_desc: "आपन मौजूदा टूल में डेटा खींचे खातिर हमनी के API के उपयोग करीं।",
            api_btn: "API डॉक्स पढ़ीं",
            sec_title: "डेटा गोपनीयता।", sec_desc: "राउर रिपोर्ट सुरक्षित बा। खाली अधिकृत कर्मचारी ही डेटा देख सकेला।",
            mob_title: "कहीं भी पहुँचीं।", mob_desc: "चलत-फिरत समस्या के रिपोर्ट करीं। स्मार्टफोन खातिर अनुकूलित।",
            imp_title: "एक साथ बेहतर शहर।", imp_desc: "हजारों नागरिक लोग से जुड़ीं। एगो एकीकृत नेटवर्क तेज समाधान सुनिश्चित करेला।"
        },
        ar: {
            lang: "العربية", sign_in: "تسجيل الدخول", sign_up: "التسجيل", log_out: "تسجيل الخروج", careers: "الوظائف", dev: "المطورون",
            badge: "عمليات المدينة الذكية",
            hero_title: "إدارة خدمات المدينة بسرعة وأمان.",
            hero_desc: "منصة آمنة للإبلاغ عن المشكلات وتتبع التقدم.",
            get_started: "ابدأ الآن",
            val_title: "لماذا تختارنا؟", val_desc: "مصمم للسرعة والشفافية والتتبع السهل.",
            v1_t: "تتبع الموقع", v1_d: "تحديد الموقع الدقيق لاستجابة أسرع.",
            v2_t: "تحديثات حية", v2_d: "شاهد حالة العمل من قيد الانتظار إلى مكتمل.",
            v3_t: "سجلات آمنة", v3_d: "يتم تخزين جميع البيانات بأمان.",
            stat_title: "تحليلات واضحة.", stat_desc: "عرض لوحات معلومات الأداء على الفور. تتبع سرعة الحل.",
            work_title: "كيف يعمل", 
            w1_t: "إبلاغ", w1_d: "إرسال التفاصيل.", w2_t: "تعيين", w2_d: "مُوجه إلى الفريق.", w3_t: "حل", w3_d: "اكتمل العمل.",
            api_title: "توصيل الأنظمة.", api_desc: "استخدم واجهة برمجة التطبيقات الخاصة بنا لسحب البيانات إلى أدواتك.",
            api_btn: "قراءة وثائق API",
            sec_title: "خصوصية البيانات.", sec_desc: "تقاريرك آمنة. يمكن للموظفين المصرح لهم فقط رؤية البيانات.",
            mob_title: "الوصول من أي مكان.", mob_desc: "الإبلاغ عن المشكلات أثناء التنقل. مُحسّن للهواتف الذكية.",
            imp_title: "مدن أفضل معًا.", imp_desc: "انضم إلى آلاف المواطنين. تضمن الشبكة الموحدة حلاً سريعًا."
        },
        es: {
            lang: "Español", sign_in: "Ingresar", sign_up: "Regístrate", log_out: "Cerrar sesión", careers: "Carreras", dev: "Desarrolladores",
            badge: "Operaciones de Ciudad Inteligente",
            hero_title: "Gestione los Servicios de la Ciudad Rápidamente.",
            hero_desc: "Una plataforma segura para reportar problemas y seguir el progreso.",
            get_started: "Comenzar",
            val_title: "¿Por qué elegirnos?", val_desc: "Creado para velocidad, transparencia y fácil seguimiento.",
            v1_t: "Rastreo de Ubicación", v1_d: "Ubicación exacta para una respuesta más rápida.",
            v2_t: "Actualizaciones en Vivo", v2_d: "Vea el estado del trabajo de pendiente a completo.",
            v3_t: "Registros Seguros", v3_d: "Todos los datos se almacenan de forma segura.",
            stat_title: "Análisis Claros.", stat_desc: "Vea paneles de rendimiento al instante. Rastree la velocidad de resolución.",
            work_title: "Cómo funciona", 
            w1_t: "Reportar", w1_d: "Enviar detalles.", w2_t: "Asignar", w2_d: "Enrutado al equipo.", w3_t: "Resolver", w3_d: "Trabajo completado.",
            api_title: "Conectar Sistemas.", api_desc: "Utilice nuestra API para extraer datos a sus herramientas existentes.",
            api_btn: "Leer Docs de API",
            sec_title: "Privacidad de Datos.", sec_desc: "Sus informes son seguros. Solo el personal autorizado puede ver los datos.",
            mob_title: "Accede a cualquier lugar.", mob_desc: "Reporte problemas sobre la marcha. Optimizado para smartphones.",
            imp_title: "Mejores ciudades juntos.", imp_desc: "Únase a miles de ciudadanos. Una red unificada asegura una resolución rápida."
        },
        fr: {
            lang: "Français", sign_in: "Se connecter", sign_up: "S'inscrire", log_out: "Se déconnecter", careers: "Carrières", dev: "Développeurs",
            badge: "Opérations de Ville Intelligente",
            hero_title: "Gérez les services de la ville rapidement.",
            hero_desc: "Une plateforme sécurisée pour signaler les problèmes et suivre les progrès.",
            get_started: "Commencer",
            val_title: "Pourquoi nous choisir ?", val_desc: "Conçu pour la vitesse, la transparence et un suivi facile.",
            v1_t: "Suivi de Localisation", v1_d: "Emplacement exact pour une réponse plus rapide.",
            v2_t: "Mises à jour en direct", v2_d: "Voyez l'état du travail passer de en attente à terminé.",
            v3_t: "Dossiers Sécurisés", v3_d: "Toutes les données sont stockées en toute sécurité.",
            stat_title: "Analyses Claires.", stat_desc: "Affichez les tableaux de bord de performances instantanément.",
            work_title: "Comment ça marche", 
            w1_t: "Signaler", w1_d: "Soumettre les détails.", w2_t: "Assigner", w2_d: "Acheminé à l'équipe.", w3_t: "Résoudre", w3_d: "Travail terminé.",
            api_title: "Connecter les systèmes.", api_desc: "Utilisez notre API pour extraire les données vers vos outils.",
            api_btn: "Lire la documentation API",
            sec_title: "Confidentialité des données.", sec_desc: "Vos rapports sont sécurisés. Seul le personnel autorisé peut voir les données.",
            mob_title: "Accédez n'importe où.", mob_desc: "Signalez les problèmes en déplacement. Optimisé pour les smartphones.",
            imp_title: "De meilleures villes ensemble.", imp_desc: "Rejoignez des milliers de citoyens. Un réseau unifié assure une résolution rapide."
        },
        de: {
            lang: "Deutsch", sign_in: "Anmelden", sign_up: "Registrieren", log_out: "Abmelden", careers: "Karriere", dev: "Entwickler",
            badge: "Smart City-Betrieb",
            hero_title: "Städtische Dienste schnell verwalten.",
            hero_desc: "Sichere Plattform, um Probleme zu melden und den Fortschritt zu verfolgen.",
            get_started: "Starten",
            val_title: "Warum uns wählen?", val_desc: "Gebaut für Geschwindigkeit, Transparenz und einfache Verfolgung.",
            v1_t: "Standortverfolgung", v1_d: "Genauer Standort für schnellere Reaktion.",
            v2_t: "Live-Updates", v2_d: "Sehen Sie den Arbeitsstatus von ausstehend bis abgeschlossen.",
            v3_t: "Sichere Aufzeichnungen", v3_d: "Alle Daten werden sicher gespeichert.",
            stat_title: "Klare Analysen.", stat_desc: "Leistungs-Dashboards sofort anzeigen. Lösungsgeschwindigkeit verfolgen.",
            work_title: "Wie es funktioniert", 
            w1_t: "Melden", w1_d: "Details einreichen.", w2_t: "Zuweisen", w2_d: "An Team weitergeleitet.", w3_t: "Lösen", w3_d: "Arbeit abgeschlossen.",
            api_title: "Systeme verbinden.", api_desc: "Verwenden Sie unsere API, um Daten in Ihre Tools zu ziehen.",
            api_btn: "API-Doku lesen",
            sec_title: "Datenschutz.", sec_desc: "Ihre Berichte sind sicher. Nur autorisiertes Personal kann Daten sehen.",
            mob_title: "Überall zugreifen.", mob_desc: "Probleme von unterwegs melden. Optimiert für Smartphones.",
            imp_title: "Gemeinsam bessere Städte.", imp_desc: "Schließen Sie sich Tausenden von Bürgern an. Ein einheitliches Netzwerk sorgt für schnelle Lösungen."
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

    const fadeUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
    };

    return (
        <div className={`min-h-screen font-sans overflow-x-hidden flex flex-col transition-colors duration-300 ${
            theme === 'light' ? 'bg-[#f5f5f5] text-[#111111] selection:bg-black selection:text-white' : 'bg-[#050505] text-white selection:bg-white selection:text-black'
        }`}>
            <style>
                {`
                @keyframes fade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade { animation: fade 0.6s ease-out forwards; }
                .stagger-3 { animation-delay: 0.3s; }
                html { scroll-behavior: smooth; }
                `}
            </style>

            {/* TRANSLATION MODAL */}
            <AnimatePresence>
                {showLangPrompt && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`fixed inset-0 z-[9999] backdrop-blur-md flex items-center justify-center p-6 ${theme === 'light' ? 'bg-white/90' : 'bg-black/90'}`}>
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className={`w-full max-w-[400px] rounded-3xl p-8 flex flex-col shadow-2xl relative border ${theme === 'light' ? 'bg-white border-[#e0e0e0]' : 'bg-[#0a0a0a] border-[#222222]'}`}>
                            <button onClick={() => setShowLangPrompt(false)} className="absolute top-4 right-4 p-2"><X size={18} /></button>
                            <h2 className="text-[1.4rem] font-black tracking-tight mb-6 text-center">Language</h2>
                            <div className="flex flex-col gap-2 max-h-[45vh] overflow-y-auto">
                                {languageOptions.map((option) => (
                                    <button 
                                        key={option.code}
                                        onClick={() => { setLang(option.code); setShowLangPrompt(false); }}
                                        className={`w-full p-4 rounded-xl flex items-center justify-between font-bold text-[0.95rem] transition-colors border ${theme === 'light' ? (lang === option.code ? 'bg-black text-white border-black' : 'bg-[#f5f5f5] text-[#555555] border-transparent hover:border-black') : (lang === option.code ? 'bg-white text-black border-white' : 'bg-[#111111] text-[#aaaaaa] border-transparent hover:border-white')}`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MASTER HEADER */}
            <header className={`fixed top-0 left-0 right-0 w-full flex items-center justify-between px-6 md:px-12 py-6 z-50 transition-colors backdrop-blur-md ${
                theme === 'light' ? 'bg-[#f5f5f5]/90 border-b border-[#e0e0e0]' : 'bg-[#050505]/90 border-b border-[#111111]'
            }`}>
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
                
                <div className="flex items-center gap-4 sm:gap-6 text-[0.9rem] font-bold">
                    <button 
                        onClick={toggleTheme} 
                        className={`p-2 rounded-full transition-colors outline-none ${
                            theme === 'light' ? 'bg-[#e0e0e0] text-black hover:bg-[#cccccc]' : 'bg-[#222222] text-white hover:bg-[#333333]'
                        }`}
                    >
                        {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                    </button>
                    
                    {user ? (
                        <>
                            <button 
                                onClick={handleSignOut} 
                                className={`transition-colors outline-none hidden sm:block ${theme === 'light' ? 'text-[#555555] hover:text-black' : 'text-[#888888] hover:text-white'}`}
                            >
                                {currentT.log_out}
                            </button>
                            <button 
                                onClick={() => navigate('/civic/dashboard')} 
                                className={`p-2 sm:px-6 sm:py-2.5 rounded-full flex items-center gap-2 transition-colors outline-none border ${
                                    theme === 'light' ? 'bg-black text-white border-black hover:bg-[#222222]' : 'bg-white text-black border-white hover:bg-[#e0e0e0]'
                                }`}
                            >
                                <LayoutDashboard size={16} />
                                <span className="hidden sm:inline">Dashboard</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <button 
                                onClick={() => navigate('/civic/auth')} 
                                className={`transition-colors outline-none hidden sm:block ${theme === 'light' ? 'text-[#555555] hover:text-black' : 'text-[#888888] hover:text-white'}`}
                            >
                                {currentT.sign_in}
                            </button>
                            <button 
                                onClick={() => navigate('/civic/auth')} 
                                className={`px-6 py-2.5 rounded-full transition-colors outline-none border ${
                                    theme === 'light' ? 'bg-black text-white border-black hover:bg-[#222222]' : 'bg-white text-black border-white hover:bg-[#e0e0e0]'
                                }`}
                            >
                                {currentT.sign_up}
                            </button>
                        </>
                    )}
                </div>
            </header>

            {/* SECTION 1: HERO */}
            <section className="relative pt-48 pb-20 px-6 md:px-12 max-w-[1400px] mx-auto flex flex-col justify-center w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="z-10">
                        <motion.div variants={fadeUp} className={`inline-flex items-center gap-3 px-4 py-2 rounded-full mb-8 border ${theme === 'light' ? 'bg-white border-[#cccccc]' : 'bg-[#111111] border-[#333333]'}`}>
                            <div className="w-2 h-2 rounded-full bg-[#00aa55] animate-pulse"></div>
                            <span className="text-[0.85rem] font-bold tracking-widest uppercase">{currentT.badge}</span>
                        </motion.div>
                        <motion.h1 variants={fadeUp} className="text-[3.5rem] md:text-[4.5rem] font-black leading-[1.1] tracking-tighter mb-6">
                            {currentT.hero_title}
                        </motion.h1>
                        <motion.p variants={fadeUp} className={`text-[1.1rem] md:text-[1.2rem] max-w-[500px] leading-relaxed mb-10 ${
                            theme === 'light' ? 'text-[#555555]' : 'text-[#aaaaaa]'
                        }`}>
                            {currentT.hero_desc}
                        </motion.p>
                        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-4">
                            <button 
                                onClick={() => navigate(user ? '/civic/dashboard' : '/civic/auth')} 
                                className={`w-full sm:w-auto px-8 py-4 rounded-xl font-black text-[1rem] flex items-center justify-center gap-2 transition-colors outline-none ${
                                    theme === 'light' ? 'bg-black text-white hover:bg-[#222222]' : 'bg-white text-black hover:bg-[#e0e0e0]'
                                }`}
                            >
                                {currentT.get_started} <ArrowRight size={18} />
                            </button>
                        </motion.div>
                    </motion.div>

                    {/* HERO GRAPHIC: Animated Network SVG */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="hidden lg:flex justify-end relative">
                        <svg viewBox="0 0 400 400" className="w-full h-auto max-w-[500px]" fill="none">
                            <circle cx="200" cy="200" r="180" stroke={theme === 'light' ? '#e0e0e0' : '#1a1a1a'} strokeWidth="2" strokeDasharray="8 8"/>
                            <circle cx="200" cy="200" r="120" stroke={theme === 'light' ? '#cccccc' : '#222222'} strokeWidth="1" />
                            <motion.circle cx="200" cy="200" r="60" fill={theme === 'light' ? '#000000' : '#ffffff'} initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }} />
                            <path d="M200 140 L200 50 M260 200 L350 200 M200 260 L200 350 M140 200 L50 200" stroke={theme === 'light' ? '#000000' : '#ffffff'} strokeWidth="3"/>
                            <circle cx="200" cy="50" r="8" fill={theme === 'light' ? '#000000' : '#ffffff'} />
                            <circle cx="350" cy="200" r="8" fill={theme === 'light' ? '#000000' : '#ffffff'} />
                            <circle cx="200" cy="350" r="8" fill={theme === 'light' ? '#000000' : '#ffffff'} />
                            <circle cx="50" cy="200" r="8" fill={theme === 'light' ? '#000000' : '#ffffff'} />
                        </svg>
                    </motion.div>
                </div>
            </section>

            {/* SECTION 2: CORE VALUES */}
            <section className={`py-24 px-6 md:px-12 border-t ${theme === 'light' ? 'bg-[#ffffff] border-[#e0e0e0]' : 'bg-[#0a0a0a] border-[#111111]'}`}>
                <div className="max-w-[1400px] mx-auto">
                    <div className="mb-16">
                        <h2 className="text-[2.5rem] font-black tracking-tighter mb-4">{currentT.val_title}</h2>
                        <p className={`text-[1.1rem] ${theme === 'light' ? 'text-[#555555]' : 'text-[#888888]'}`}>{currentT.val_desc}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { icon: Map, title: currentT.v1_t, desc: currentT.v1_d },
                            { icon: Activity, title: currentT.v2_t, desc: currentT.v2_d },
                            { icon: ShieldCheck, title: currentT.v3_t, desc: currentT.v3_d }
                        ].map((feature, idx) => (
                            <div key={idx} className={`p-8 rounded-3xl border transition-colors ${theme === 'light' ? 'bg-[#f9f9f9] border-[#e0e0e0] hover:border-black' : 'bg-[#111111] border-[#333333] hover:border-white'}`}>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 border ${theme === 'light' ? 'bg-white border-[#cccccc]' : 'bg-[#222222] border-[#444444]'}`}>
                                    <feature.icon size={20} className={theme === 'light' ? 'text-black' : 'text-white'} />
                                </div>
                                <h3 className="text-[1.25rem] font-black mb-2">{feature.title}</h3>
                                <p className={`text-[0.95rem] ${theme === 'light' ? 'text-[#555555]' : 'text-[#888888]'}`}>{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 3: LIVE ANALYTICS PREVIEW */}
            <section className="py-24 px-6 md:px-12 max-w-[1400px] mx-auto w-full">
                <div className={`rounded-3xl p-10 md:p-16 border flex flex-col lg:flex-row items-center justify-between gap-12 overflow-hidden relative ${
                    theme === 'light' ? 'bg-white border-[#cccccc]' : 'bg-[#111111] border-[#333333]'
                }`}>
                    <div className="relative z-10 lg:max-w-[40%]">
                        <BarChart3 size={32} className={`mb-6 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
                        <h2 className="text-[2.5rem] font-black tracking-tighter mb-4">{currentT.stat_title}</h2>
                        <p className={`text-[1.1rem] leading-relaxed mb-8 ${theme === 'light' ? 'text-[#555555]' : 'text-[#888888]'}`}>
                            {currentT.stat_desc}
                        </p>
                    </div>

                    {/* Animated Bar Chart Graphic */}
                    <div className="w-full lg:w-[50%] h-[300px] flex items-end gap-4 relative z-10">
                        <div className={`absolute bottom-0 left-0 w-full h-[1px] ${theme === 'light' ? 'bg-[#cccccc]' : 'bg-[#333333]'}`}></div>
                        {[40, 70, 45, 90, 60, 100].map((height, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ height: 0 }}
                                whileInView={{ height: `${height}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: idx * 0.1 }}
                                className={`flex-1 rounded-t-lg ${theme === 'light' ? 'bg-black' : 'bg-white'}`}
                            ></motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 4: CITIZEN WORKFLOW */}
            <section className={`py-24 px-6 md:px-12 border-t ${theme === 'light' ? 'bg-[#f9f9f9] border-[#e0e0e0]' : 'bg-[#0a0a0a] border-[#111111]'}`}>
                <div className="max-w-[1400px] mx-auto text-center">
                    <h2 className="text-[2.5rem] font-black tracking-tighter mb-16">{currentT.work_title}</h2>
                    
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8 relative">
                        {/* Connecting Line (Hidden on Mobile) */}
                        <div className={`hidden md:block absolute top-1/2 left-0 w-full h-[2px] -translate-y-1/2 z-0 ${theme === 'light' ? 'bg-[#cccccc]' : 'bg-[#333333]'}`}></div>

                        {[
                            { num: "1", title: currentT.w1_t, desc: currentT.w1_d },
                            { num: "2", title: currentT.w2_t, desc: currentT.w2_d },
                            { num: "3", title: currentT.w3_t, desc: currentT.w3_d }
                        ].map((step, idx) => (
                            <div key={idx} className={`relative z-10 w-full md:w-1/3 p-8 rounded-3xl border flex flex-col items-center text-center ${
                                theme === 'light' ? 'bg-white border-[#cccccc]' : 'bg-[#111111] border-[#333333]'
                            }`}>
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-[1.2rem] mb-4 ${
                                    theme === 'light' ? 'bg-black text-white' : 'bg-white text-black'
                                }`}>
                                    {step.num}
                                </div>
                                <h3 className="text-[1.25rem] font-black mb-2">{step.title}</h3>
                                <p className={`text-[0.95rem] ${theme === 'light' ? 'text-[#555555]' : 'text-[#888888]'}`}>{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 5: DEVELOPER INTEGRATION */}
            <section className="py-24 px-6 md:px-12 max-w-[1400px] mx-auto w-full">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                    <div className="lg:max-w-[40%]">
                        <div className="flex items-center gap-2 mb-4">
                            <TerminalSquare size={18} className={theme === 'light' ? 'text-black' : 'text-[#888888]'} />
                            <span className="text-[0.85rem] font-bold tracking-widest uppercase">{currentT.dev}</span>
                        </div>
                        <h2 className="text-[2.5rem] font-black tracking-tighter mb-4">{currentT.api_title}</h2>
                        <p className={`text-[1.1rem] leading-relaxed mb-8 ${theme === 'light' ? 'text-[#555555]' : 'text-[#888888]'}`}>
                            {currentT.api_desc}
                        </p>
                        <button className={`px-6 py-3 rounded-xl font-bold text-[0.95rem] border transition-colors outline-none ${
                            theme === 'light' ? 'bg-white text-black border-[#cccccc] hover:border-black' : 'bg-[#000000] text-white border-[#555555] hover:border-white'
                        }`}>
                            {currentT.api_btn}
                        </button>
                    </div>

                    <div className={`w-full lg:w-[50%] rounded-2xl p-6 font-mono text-[0.85rem] leading-loose border shadow-xl ${
                        theme === 'light' ? 'bg-[#f5f5f5] border-[#cccccc] text-[#333333]' : 'bg-[#0a0a0a] border-[#222222] text-[#aaaaaa]'
                    }`}>
                        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#333333]/20">
                            <div className="w-3 h-3 rounded-full bg-[#ff4444]"></div>
                            <div className="w-3 h-3 rounded-full bg-[#ffaa00]"></div>
                            <div className="w-3 h-3 rounded-full bg-[#00ff88]"></div>
                        </div>
                        <span className={theme === 'light' ? 'text-[#0055aa]' : 'text-[#44aaff]'}>GET</span> /api/status<br/><br/>
                        {`{`} <br/>
                        &nbsp;&nbsp;<span className={theme === 'light' ? 'text-[#000000]' : 'text-[#ffffff]'}>"active_tasks"</span>: 42,<br/>
                        &nbsp;&nbsp;<span className={theme === 'light' ? 'text-[#000000]' : 'text-[#ffffff]'}>"success_rate"</span>: "94%"<br/>
                        {`}`}
                    </div>
                </div>
            </section>

            {/* SECTION 6: ENTERPRISE SECURITY */}
            <section className={`py-24 px-6 md:px-12 border-t ${theme === 'light' ? 'bg-[#ffffff] border-[#e0e0e0]' : 'bg-[#050505] border-[#111111]'}`}>
                <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="order-2 lg:order-1 flex justify-center lg:justify-start">
                        {/* Custom Isometric Security Lock Vector */}
                        <svg viewBox="0 0 200 200" className="w-full max-w-[300px] h-auto" fill="none">
                            <motion.path 
                                d="M60 100 V70 C60 40 140 40 140 70 V100" 
                                stroke={theme === 'light' ? '#111111' : '#ffffff'} 
                                strokeWidth="16" strokeLinecap="round"
                                initial={{ y: 20 }} animate={{ y: 0 }} transition={{ repeat: Infinity, duration: 2, repeatType: "reverse", ease: "easeInOut" }}
                            />
                            <rect x="40" y="90" width="120" height="90" rx="16" fill={theme === 'light' ? '#111111' : '#ffffff'} />
                            <circle cx="100" cy="135" r="12" fill={theme === 'light' ? '#ffffff' : '#111111'} />
                            <path d="M96 145 L92 160 H108 L104 145 Z" fill={theme === 'light' ? '#ffffff' : '#111111'} />
                        </svg>
                    </motion.div>
                    <div className="order-1 lg:order-2">
                        <Lock size={32} className={`mb-6 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
                        <h2 className="text-[2.5rem] font-black tracking-tighter mb-4">{currentT.sec_title}</h2>
                        <p className={`text-[1.1rem] leading-relaxed ${theme === 'light' ? 'text-[#555555]' : 'text-[#888888]'}`}>
                            {currentT.sec_desc}
                        </p>
                    </div>
                </div>
            </section>

            {/* SECTION 7: MOBILE ACCESSIBILITY */}
            <section className={`py-24 px-6 md:px-12 border-t ${theme === 'light' ? 'bg-[#f9f9f9] border-[#e0e0e0]' : 'bg-[#0a0a0a] border-[#111111]'}`}>
                <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <Smartphone size={32} className={`mb-6 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
                        <h2 className="text-[2.5rem] font-black tracking-tighter mb-4">{currentT.mob_title}</h2>
                        <p className={`text-[1.1rem] leading-relaxed ${theme === 'light' ? 'text-[#555555]' : 'text-[#888888]'}`}>
                            {currentT.mob_desc}
                        </p>
                    </div>
                    <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="flex justify-center lg:justify-end">
                        {/* Custom Animated Smartphone Vector */}
                        <svg viewBox="0 0 200 200" className="w-full max-w-[300px] h-auto" fill="none">
                            <rect x="50" y="20" width="100" height="160" rx="20" fill={theme === 'light' ? '#e0e0e0' : '#222222'} stroke={theme === 'light' ? '#cccccc' : '#333333'} strokeWidth="4" />
                            <rect x="56" y="26" width="88" height="148" rx="14" fill={theme === 'light' ? '#ffffff' : '#050505'} />
                            <motion.rect x="66" y="50" width="56" height="12" rx="4" fill={theme === 'light' ? '#cccccc' : '#333333'} initial={{ opacity: 0.3 }} animate={{ opacity: 1 }} transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }} />
                            <rect x="66" y="70" width="68" height="8" rx="4" fill={theme === 'light' ? '#e0e0e0' : '#222222'} />
                            <rect x="66" y="86" width="48" height="8" rx="4" fill={theme === 'light' ? '#e0e0e0' : '#222222'} />
                            <circle cx="100" cy="155" r="8" stroke={theme === 'light' ? '#cccccc' : '#333333'} strokeWidth="2" />
                        </svg>
                    </motion.div>
                </div>
            </section>

            {/* SECTION 8: COMMUNITY IMPACT */}
            <section className={`py-24 px-6 md:px-12 border-t ${theme === 'light' ? 'bg-[#ffffff] border-[#e0e0e0]' : 'bg-[#050505] border-[#111111]'}`}>
                <div className="max-w-[1400px] mx-auto text-center flex flex-col items-center">
                    <Users size={32} className={`mb-6 ${theme === 'light' ? 'text-black' : 'text-white'}`} />
                    <h2 className="text-[2.5rem] font-black tracking-tighter mb-4">{currentT.imp_title}</h2>
                    <p className={`text-[1.1rem] max-w-[600px] leading-relaxed mb-12 ${theme === 'light' ? 'text-[#555555]' : 'text-[#888888]'}`}>
                        {currentT.imp_desc}
                    </p>
                    
                    {/* Custom Animated Network Nodes Vector */}
                    <div className="relative w-full max-w-[400px] aspect-video">
                        <svg viewBox="0 0 400 200" className="w-full h-full" fill="none">
                            <path d="M50 100 C150 150 250 50 350 100" stroke={theme === 'light' ? '#cccccc' : '#333333'} strokeWidth="2" strokeDasharray="6 6" />
                            <motion.circle cx="50" cy="100" r="10" fill={theme === 'light' ? '#111111' : '#ffffff'} initial={{ scale: 1 }} animate={{ scale: 1.5, opacity: 0.5 }} transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }} />
                            <motion.circle cx="200" cy="100" r="14" fill={theme === 'light' ? '#111111' : '#ffffff'} initial={{ scale: 1 }} animate={{ scale: 1.3, opacity: 0.8 }} transition={{ repeat: Infinity, duration: 2, repeatType: "reverse", delay: 0.5 }} />
                            <motion.circle cx="350" cy="100" r="10" fill={theme === 'light' ? '#111111' : '#ffffff'} initial={{ scale: 1 }} animate={{ scale: 1.5, opacity: 0.5 }} transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse", delay: 1 }} />
                        </svg>
                    </div>
                </div>
            </section>

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