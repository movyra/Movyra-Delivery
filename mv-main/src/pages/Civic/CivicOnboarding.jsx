import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShieldCheck, 
    AlertTriangle, 
    Activity, 
    Map, 
    BarChart3, 
    ArrowRight, 
    X,
    Sun,
    Moon
} from 'lucide-react';
import { useCivicStore } from '../../store/useCivicStore';

export default function CivicOnboarding() {
    const navigate = useNavigate();
    
    // State and Store Configuration
    const theme = useCivicStore((state) => state.theme);
    const toggleTheme = useCivicStore((state) => state.toggleTheme);
    const completeOnboarding = useCivicStore((state) => state.completeOnboarding);
    
    const [currentSlide, setCurrentSlide] = useState(0);
    const [lang, setLang] = useState('en');
    const [showLangPrompt, setShowLangPrompt] = useState(false);

    useEffect(() => {
        const sysLang = navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'mr', 'gu', 'te', 'ta', 'pa', 'bho', 'ar', 'es', 'fr', 'de'];
        if (supported.includes(sysLang)) setLang(sysLang);
    }, []);

    // 13-Language Onboarding Dictionary
    const t = {
        en: {
            lang: "English", skip: "Skip", finish: "Get Started", next: "Continue",
            s1_title: "Incident Documentation", s1_desc: "Log infrastructure deficiencies with precise technical descriptions directly to the municipal routing system.",
            s2_title: "Resolution Tracking", s2_desc: "Monitor real-time status changes and personnel milestones throughout the operational life cycle.",
            s3_title: "Geographic Visualizer", s3_desc: "Analyze regional data cluster density to monitor resource deployment across target sectors.",
            s4_title: "Performance Metrics", s4_desc: "Access objective evaluation data regarding municipal resolution speed and department backlogs.",
            s5_title: "Secure Verification", s5_desc: "Authenticated authorization models ensure user compliance and validate data ledger entries."
        },
        hi: {
            lang: "हिन्दी", skip: "छोड़ें", finish: "शुरू करें", next: "आगे बढ़ें",
            s1_title: "घटना का दस्तावेज़ीकरण", s1_desc: "सटीक विवरण के साथ बुनियादी ढांचे की कमियों को सीधे नगर निगम प्रबंधन प्रणाली में दर्ज करें।",
            s2_title: "समाधान ट्रैकिंग", s2_desc: "संपूर्ण परिचालन चक्र के दौरान वास्तविक समय के स्थिति परिवर्तनों और परिचालन मील के पत्थरों की निगरानी करें।",
            s3_title: "भौगोलिक विज़ुअलाइज़र", s3_desc: "लक्षित क्षेत्रों में संसाधन आवंटन की निगरानी के लिए क्षेत्रीय डेटा क्लस्टर घनत्व का विश्लेषण करें।",
            s4_title: "प्रदर्शन मेट्रिक्स", s4_desc: "नगर निगम समाधान गति और विभागीय कार्यभार के संबंध में निष्पक्ष मूल्यांकन डेटा तक पहुंचें।",
            s5_title: "सुरक्षित सत्यापन", s5_desc: "प्रमाणित प्रमाणीकरण मॉडल उपयोगकर्ता अनुपालन सुनिश्चित करते हैं और डेटा लेज़र प्रविष्टियों को मान्य करते हैं।"
        },
        hinglish: {
            lang: "Hinglish", skip: "Skip", finish: "Get Started", next: "Continue",
            s1_title: "Incident Documentation", s1_desc: "Infrastructure issues ko detailed technical descriptions ke sath seedhe municipal system me log karein.",
            s2_title: "Resolution Tracking", s2_desc: "Operational life cycle ke dauran real-time status changes aur team assignment ko monitor karein.",
            s3_title: "Geographic Visualizer", s3_desc: "Target sectors me resource deployment ko monitor karne ke liye regional data clusters analyze karein.",
            s4_title: "Performance Metrics", s4_desc: "Municipal resolution speed aur department workloads ka live objective analytics data access karein.",
            s5_title: "Secure Verification", s5_desc: "Authenticated access models user compliance maintain karte hain aur ledger data ko validate karte hain."
        },
        mr: {
            lang: "मराठी", skip: "वगळा", finish: "सुरू करा", next: "पुढे जा",
            s1_title: "घटनेचे दस्तऐवजीकरण", s1_desc: "पायाभूत सुविधांमधील त्रुटी अचूक तांत्रिक वर्णनांसह थेट महानगरपालिका प्रणालीमध्ये नोंदवा.",
            s2_title: "निवारण ट्रॅकिंग", s2_desc: "संपूर्ण ऑपरेशनल लाइफ सायकल दरम्यान रिअल-टाइम स्थितीतील बदल आणि कर्मचाऱ्यांच्या टप्प्यांचे निरीक्षण करा.",
            s3_title: "भौगोलिक व्हिज्युअलाइझर", s3_desc: "लक्षित क्षेत्रांमध्ये संसाधनांच्या वितरणावर लक्ष ठेवण्यासाठी प्रादेशिक डेटा क्लस्टर घनतेचे विश्लेषण करा.",
            s4_title: "कामगिरी मेट्रिक्स", s4_desc: "महानगरपालिका निवारण गती आणि विभागीय प्रलंबित कामांविषयी वस्तुनिष्ठ मूल्यमापन डेटामध्ये प्रवेश करा.",
            s5_title: "सुरक्षित पडताळणी", s5_desc: "प्रमाणित प्रमाणीकरण मॉडेल वापरकर्त्याचे अनुपालन सुनिश्चित करतात आणि डेटा लेजर नोंदी वैध करतात."
        },
        gu: {
            lang: "ગુજરાતી", skip: "છોડી દો", finish: "શરૂ કરો", next: "આગળ વધો",
            s1_title: "ઘટના દસ્તાવેજીકરણ", s1_desc: "ઇન્ફ્રાસ્ટ્રક્ચરની ખામીઓને ચોક્કસ તકનીકી વર્ણનો સાથે સીધા મ્યુનિસિપલ સિસ્ટમમાં રેકોર્ડ કરો.",
            s2_title: "નિવારણ ટ્રેકિંગ", s2_desc: "સમગ્ર ઓપરેશનલ લાઇફ સાયકલ દરમિયાન રીઅલ-ટાઇમ સ્ટેટસ ફેરફારો અને સ્ટાફના માઇલસ્ટોન્સનું નિરીક્ષણ કરો.",
            s3_title: "ભૌગોલિક વિઝ્યુઅલાઇઝર", s3_desc: "લક્ષિત ક્ષેત્રોમાં સંસાધનોની જમાવટ પર નજર રાખવા માટે પ્રાદેશિક ડેટા ક્લસ્ટર ઘનતાનું વિશ્લેષણ કરો.",
            s4_title: "પ્રદર્શન મેટ્રિક્સ", s4_desc: "મ્યુનિસિપલ સોલ્યુશન સ્પીડ અને વિભાગીય બેકલોગ સંબંધિત નિષ્પક્ષ મૂલ્યાંકન ડેટા મેળવો.",
            s5_title: "સુરક્ષિત ચકાસણી", s5_desc: "પ્રમાણિત પ્રમાણીકરણ મોડલ્સ વપરાશકર્તાના પાલનની ખાતરી કરે છે અને ડેટા લેજર એન્ટ્રીઓને માન્ય કરે છે."
        },
        te: {
            lang: "తెలుగు", skip: "దాటవేయి", finish: "ప్రారంభించండి", next: "కొనసాగించు",
            s1_title: "సంఘటన డాక్యుమెంటేషన్", s1_desc: "మౌలిక సదుపాయాల లోపాలను ఖచ్చితమైన సాంకేతిక వివరణలతో నేరుగా మున్సిపల్ సిస్టమ్‌లో నమోదు చేయండి.",
            s2_title: "పరిష్కార ట్రాకింగ్", s2_desc: "మొత్తం కార్యాచరణ జీవిత చక్రంలో నిజ-సమయ స్థితి మార్పులు మరియు సిబ్బంది మైలురాళ్లను పర్యవేక్షించండి.",
            s3_title: "భౌగోళిక విజువలైజర్", s3_desc: "లక్ష్య రంగాలలో వనరుల విస్తరణను పర్యవేక్షించడానికి ప్రాంతీయ డేటా క్లస్టర్ సాంద్రతను విశ్लेषण చేయండి.",
            s4_title: "పనితీరు కొలమానాలు", s4_desc: "మున్సిపల్ పరిష్కార వేగం మరియు శాఖల నిలిచిపోయిన పనులకు సంబంధించిన నిష్పాక్షిక అంచనా డేటాను యాక్సెస్ చేయండి.",
            s5_title: "సురక్షిత ధృవీకరణ", s5_desc: "ధృవీకరించబడిన ప్రామాణీకరణ నమూనాలు వినియోగదారు సమ్మతిని నిర్ధారిస్తాయి మరియు డేటా లెడ్జర్ నమోదులను ధృవీకరిస్తాయి."
        },
        ta: {
            lang: "தமிழ்", skip: "தவிர்", finish: "தொடங்கு", next: "தொடரு",
            s1_title: "சம்பவ ஆவணமாக்கல்", s1_desc: "உள்கட்டமைப்பு குறைபாடுகளை துல்லியமான தொழில்நுட்ப விளக்கங்களுடன் நேரடியாக நகராட்சி அமைப்பில் பதிவு செய்யவும்.",
            s2_title: "தீர்வு கண்காணிப்பு", s2_desc: "முழு செயல்பாட்டு வாழ்க்கைச் சுழற்சி முழுவதும் நிகழ்நேர நிலை மாற்றங்கள் மற்றும் பணியாளர்களின் மைல்கற்களைக் கண்காணிக்கவும்.",
            s3_title: "புவியியல் புள்ளிவிவரம்", s3_desc: "இலக்குத் துறைகளில் வளங்கள் பயன்படுத்தப்படுவதைக் கண்காணிக்க பிராந்திய தரவுக் கூட்டங்களின் அடர்த்தியை பகுப்பாய்வு செய்யவும்.",
            s4_title: "செயல்திறன் அளவீடுகள்", s4_desc: "நகராட்சி தீர்வு வேகம் மற்றும் துறைசார்ந்த நிலுவைகள் தொடர்பான புறநிலை மதிப்பீட்டுத் தரவை அணுகவும்.",
            s5_title: "பாதுகாப்பான சரிபார்ப்பு", s5_desc: "அங்கீகரிக்கப்பட்ட அங்கீகார மாதிரிகள் பயனர் இணக்கத்தை உறுதிசெய்து தரவுப் பதிவேட்டு உள்ளீடுகளைச் சரிபார்க்கின்றன."
        },
        pa: {
            lang: "ਪੰਜਾਬੀ", skip: "ਛੱਡੋ", finish: "ਸ਼ੁਰੂ ਕਰੋ", next: "ਜਾਰੀ ਰੱਖੋ",
            s1_title: "ਘਟਨਾ ਦਸਤਾਵੇਜ਼ੀਕਰਨ", s1_desc: "ਬੁਨਿਆਦੀ ਢਾਂਚੇ ਦੀਆਂ ਕਮੀਆਂ ਨੂੰ ਸਹੀ ਤਕਨੀਕੀ ਵੇਰਵਿਆਂ ਦੇ ਨਾਲ ਸਿੱਧਾ ਮਿਊਂਸੀਪਲ ਸਿਸਟਮ ਵਿੱਚ ਦਰਜ ਕਰੋ।",
            s2_title: "ਹੱਲ ਟ੍ਰੈਕਿੰਗ", s2_desc: "ਸਮੁੱਚੇ ਸੰਚਾਲਨ ਜੀਵਨ ਚੱਕਰ ਦੌਰਾਨ ਰੀਅਲ-ਟਾਈਮ ਸਥਿਤੀ ਦੇ ਬਦਲਾਅ ਅਤੇ ਕਰਮਚਾਰੀਆਂ ਦੇ ਮੀਲ ਪੱਥਰਾਂ ਦੀ ਨਿਗਰਾਨੀ ਕਰੋ।",
            s3_title: "ਭੂਗੋਲਿਕ ਵਿਜ਼ੂਅਲਾਈਜ਼ਰ", s3_desc: "ਲਕਸ਼ਿਤ ਖੇਤਰਾਂ ਵਿੱਚ ਸਰੋਤਾਂ ਦੀ ਤੈਨਾਤੀ 'ਤੇ ਨਜ਼ਰ ਰੱਖਣ ਲਈ ਖੇਤਰੀ ਡੇਟਾ ਕਲੱਸਟਰ ਘਣਤਾ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ।",
            s4_title: "ਪ੍ਰਦਰਸ਼ਨ ਮੈਟ੍ਰਿਕਸ", s4_desc: "ਮਿਊਂਸੀਪਲ ਹੱਲ ਦੀ ਗਤੀ ਅਤੇ ਵਿਭਾਗੀ ਬੈਕਲੌਗ ਦੇ ਸਬੰਧ ਵਿੱਚ ਨਿਰਪੱਖ ਮੁਲਾਂਕਣ ਡੇਟਾ ਤੱਕ ਪਹੁੰਚ ਕਰੋ।",
            s5_title: "ਸੁਰੱਖਿਅਤ ਪੁਸ਼ਟੀਕਰਨ", s5_desc: "ਪ੍ਰਮਾਣਿਤ ਪ੍ਰਮਾਣਿਕਤਾ ਮਾਡਲ ਉਪਭੋਗਤਾ ਦੀ ਪਾਲਣਾ ਨੂੰ ਯਕੀਨੀ ਬਣਾਉਂਦੇ ਹਨ ਅਤੇ ਡੇਟਾ ਲੇਜ਼ਰ ਐਂਟਰੀਆਂ ਨੂੰ ਵੈਧ ਕਰਦੇ ਹਨ।"
        },
        bho: {
            lang: "भोजपुरी", skip: "छोड़ीं", finish: "शुरू करीं", next: "आगे बढ़ीं",
            s1_title: "घटना के दस्तावेजीकरण", s1_desc: "सटीक विवरण के साथ बुनियादी ढांचा के कमी के सीधे नगर निगम प्रबंधन प्रणाली में दर्ज करीं।",
            s2_title: "समाधान ट्रैकिंग", s2_desc: "पूरा परिचालन चक्र के दौरान वास्तविक समय के स्थिति बदलाव आ परिचालन मील के पत्थर के निगरानी करीं।",
            s3_title: "भौगोलिक विज़ुअलाइज़र", s3_desc: "लक्षित क्षेत्रन में संसाधन आवंटन के निगरानी खातिर क्षेत्रीय डेटा क्लस्टर घनत्व के विश्लेषण करीं।",
            s4_title: "प्रदर्शन मेट्रिक्स", s4_desc: "नगर निगम समाधान गति आ विभागीय कार्यभार के संबंध में निष्पक्ष मूल्यांकन डेटा तक पहुँच पाईं।",
            s5_title: "सुरक्षित सत्यापन", s5_desc: "प्रमाणित प्रमाणीकरण मॉडल उपयोगकर्ता अनुपालन सुनिश्चित करेला आ डेटा लेजर प्रविष्टियन के मान्य करेला।"
        },
        ar: {
            lang: "العربية", skip: "تخطى", finish: "ابدأ الآن", next: "التالي",
            s1_title: "توثيق الحوادث", s1_desc: "تسجيل قصور البنية التحتية مع أوصاف تقنية دقيقة مباشرة إلى نظام التوجيه البلدي.",
            s2_title: "تتبع الحلول", s2_desc: "مراقبة تغييرات الحالة في الوقت الفعلي ومعالم الموظفين طوال دورة الحياة التشغيلية.",
            s3_title: "المصور الجغرافي", s3_desc: "تحليل كثافة مجموعات البيانات الإقليمية لمراقبة نشر الموارد عبر القطاعات المستهدفة.",
            s4_title: "مقاييس الأداء", s4_desc: "الوصول إلى بيانات التقييم الموضوعية المتعلقة بسرعة الحل البلدي وتراكم الأعمال الإدارية.",
            s5_title: "التحقق الآمن", s5_desc: "تضمن نماذج التفويض المعتمدة امتثال المستخدم والتحقق من صحة إدخالات دفتر أستاذ البيانات."
        },
        es: {
            lang: "Español", skip: "Omitir", finish: "Comenzar", next: "Continuar",
            s1_title: "Documentación de Incidentes", s1_desc: "Registre deficiencias de infraestructura con descripciones técnicas precisas directamente en el sistema municipal.",
            s2_title: "Seguimiento de Resolución", s2_desc: "Supervise cambios de estado en tiempo real y metas de personal durante todo el ciclo de vida operativo.",
            s3_title: "Visualizador Geográfico", s3_desc: "Analice la densidad de grupos de datos regionales para controlar el despliegue de recursos en los sectores objetivo.",
            s4_title: "Métricas de Rendimiento", s4_desc: "Acceda a datos objetivos de evaluación sobre la velocidad de resolución municipal y los retrasos departamentales.",
            s5_title: "Verificación Segura", s5_desc: "Los modelos de autorización autenticados garantizan el cumplimiento del usuario y validan los registros de datos."
        },
        fr: {
            lang: "Français", skip: "Passer", finish: "Démarrer", next: "Continuer",
            s1_title: "Documentation des Incidents", s1_desc: "Enregistrez les défaillances d'infrastructure avec des descriptions techniques précises directement dans le système municipal.",
            s2_title: "Suivi des Résolutions", s2_desc: "Suivez les changements de statut en temps réel et les étapes clés du personnel tout au long du cycle de vie opérationnel.",
            s3_title: "Visualiseur Géographique", s3_desc: "Analysez la densité des grappes de données régionales pour surveiller le déploiement des ressources dans les secteurs cibles.",
            s4_title: "Mètres de Performance", s4_desc: "Accédez à des données d'évaluation objectives concernant la vitesse de résolution municipale et les retards des services.",
            s5_title: "Vérification Sécurisée", s5_desc: "Les modèles d'autorisation authentifiés garantissent la conformité des utilisateurs et valident les entrées du registre."
        },
        de: {
            lang: "Deutsch", skip: "Überspringen", finish: "Starten", next: "Weiter",
            s1_title: "Vorfalldokumentation", s1_desc: "Erfassen Sie Infrastrukturmängel mit präzisen technischen Beschreibungen direkt im kommunalen Leitsystem.",
            s2_title: "Lösungsverfolgung", s2_desc: "Überwachen Sie Statusänderungen in Echtzeit und Meilensteine des Personals während des gesamten betrieblichen Lebenszyklus.",
            s3_title: "Geografischer Visualisierer", s3_desc: "Analysieren Sie die Dichte regionaler Datencluster, um den Ressourceneinsatz in den Zielsektoren zu überwachen.",
            s4_title: "Leistungsmetriken", s4_desc: "Greifen Sie auf objektive Bewertungsdaten zur kommunalen Lösungsgeschwindigkeit und zu Rückständen in den Abteilungen zu.",
            s5_title: "Sichere Verifizierung", s5_desc: "Authentifizierte Autorisierungsmodelle stellen die Benutzer-Compliance sicher und validieren Einträge im Daten-Ledger."
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

    const slideData = [
        { title: currentT.s1_title, desc: currentT.s1_desc, icon: AlertTriangle, bg: "from-blue-600/20 to-transparent" },
        { title: currentT.s2_title, desc: currentT.s2_desc, icon: Activity, bg: "from-emerald-600/20 to-transparent" },
        { title: currentT.s3_title, desc: currentT.s3_desc, icon: Map, bg: "from-purple-600/20 to-transparent" },
        { title: currentT.s4_title, desc: currentT.s4_desc, icon: BarChart3, bg: "from-amber-600/20 to-transparent" },
        { title: currentT.s5_title, desc: currentT.s5_desc, icon: ShieldCheck, bg: "from-red-600/20 to-transparent" }
    ];

    const executeExit = () => {
        completeOnboarding();
        navigate('/civic/auth');
    };

    const handleNext = () => {
        if (currentSlide < slideData.length - 1) {
            setCurrentSlide(prev => prev + 1);
        } else {
            executeExit();
        }
    };

    const ActiveIcon = slideData[currentSlide].icon;

    return (
        <div className={`min-h-screen font-sans overflow-x-hidden flex flex-col relative transition-colors duration-300 ${
            theme === 'light' ? 'bg-[#f5f5f5] text-[#111111] selection:bg-black selection:text-white' : 'bg-[#050505] text-white selection:bg-white selection:text-black'
        }`}>
            <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } .animate-fade { animation: fadeIn 0.6s ease-out forwards; }`}</style>
            
            {/* UTILITY CONTROL ROW */}
                        <header className="fixed top-0 left-0 right-0 w-full flex items-center justify-between px-6 md:px-12 py-6 z-50 animate-fade">
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
                            
                            <div className="flex items-center gap-4 text-[0.85rem] font-bold">
                                <button 
                                    onClick={() => setShowLangPrompt(true)} 
                                    className={`transition-colors outline-none border px-3 py-1.5 rounded-full ${
                                        theme === 'light' ? 'border-[#cccccc] hover:border-black text-[#555555]' : 'border-[#333333] hover:border-white text-[#888888]'
                                    }`}
                                >
                                    {currentT.lang}
                                </button>
                                <button 
                                    onClick={toggleTheme} 
                                    className={`p-2 rounded-full transition-colors outline-none ${
                                        theme === 'light' ? 'bg-[#e0e0e0] text-black' : 'bg-[#222222] text-white'
                                    }`}
                                >
                                    {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                                </button>
                            </div>
                        </header>

            {/* TRANSLATION MODAL DIALOG */}
            <AnimatePresence>
                {showLangPrompt && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`fixed inset-0 z-[60] backdrop-blur-md flex items-center justify-center p-6 ${theme === 'light' ? 'bg-white/80' : 'bg-black/80'}`}>
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className={`w-full max-w-[400px] rounded-3xl p-8 flex flex-col shadow-2xl relative border ${theme === 'light' ? 'bg-white border-[#e0e0e0]' : 'bg-[#050505] border-[#333333]'}`}>
                            <button onClick={() => setShowLangPrompt(false)} className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center transition-colors ${theme === 'light' ? 'text-[#888888] hover:text-black' : 'text-[#888888] hover:text-white'}`}>
                                <X size={18} />
                            </button>
                            <h2 className={`text-[1.4rem] font-black tracking-tight mb-6 text-center ${theme === 'light' ? 'text-black' : 'text-white'}`}>Select Language</h2>
                            <div className="flex flex-col gap-1.5 max-h-[45vh] overflow-y-auto pr-1">
                                {languageOptions.map((option) => (
                                    <button 
                                        key={option.code}
                                        onClick={() => { setLang(option.code); setShowLangPrompt(false); }}
                                        className={`w-full p-3.5 rounded-xl flex items-center justify-between group transition-colors border text-left ${theme === 'light' ? (lang === option.code ? 'bg-[#f0f0f0] border-black text-black' : 'bg-white border-[#e0e0e0] text-[#666666] hover:border-black hover:text-black') : (lang === option.code ? 'bg-[#222222] border-white text-white' : 'bg-[#0a0a0a] border-[#333333] text-[#888888] hover:border-white hover:text-white')}`}
                                    >
                                        <span className="font-bold text-[0.95rem]">{option.label}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* PRESENTATION DISPLAY MATRIX */}
            <div className="flex-1 flex items-center justify-center px-6 py-4 animate-fade">
                <div className={`w-full max-w-[550px] rounded-3xl p-8 md:p-12 border bg-gradient-to-b relative overflow-hidden transition-all duration-500 ${theme === 'light' ? 'bg-white border-[#e0e0e0]' : 'bg-[#111111] border-[#333333]'} ${slideData[currentSlide].bg}`}>
                    
                    <div className="min-h-[280px] flex flex-col items-center text-center justify-center relative z-10">
                        <div className={`w-16 h-12 rounded-2xl flex items-center justify-center mb-8 border ${theme === 'light' ? 'bg-[#f5f5f5] border-[#e0e0e0]' : 'bg-[#050505] border-[#333333]'}`}>
                            <ActiveIcon size={28} className={theme === 'light' ? 'text-black' : 'text-white'} />
                        </div>

                        <h1 className="text-[1.8rem] md:text-[2.2rem] font-black tracking-tighter leading-tight mb-4">
                            {slideData[currentSlide].title}
                        </h1>

                        <p className={`text-[0.95rem] md:text-[1.05rem] leading-relaxed max-w-[400px] ${theme === 'light' ? 'text-[#555555]' : 'text-[#aaaaaa]'}`}>
                            {slideData[currentSlide].desc}
                        </p>
                    </div>

                    {/* INTERACTIVE NAVIGATION CONTROL MODULE */}
                    <div className="mt-12 flex items-center justify-between relative z-10">
                        {/* STEPS INDICATOR LOGIC */}
                        <div className="flex items-center gap-2">
                            {slideData.map((_, idx) => (
                                <div 
                                    key={idx}
                                    onClick={() => setCurrentSlide(idx)}
                                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                                        idx === currentSlide 
                                            ? (theme === 'light' ? 'w-6 bg-black' : 'w-6 bg-white') 
                                            : (theme === 'light' ? 'w-1.5 bg-[#cccccc]' : 'w-1.5 bg-[#333333]')
                                    }`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={handleNext}
                            className={`px-6 py-3.5 rounded-xl font-black text-[0.9rem] flex items-center gap-2 transition-colors border outline-none ${
                                theme === 'light' ? 'bg-black border-black text-white hover:bg-[#222222]' : 'bg-white border-white text-black hover:bg-[#e0e0e0]'
                            }`}
                        >
                            {currentSlide === slideData.length - 1 ? currentT.finish : currentT.next}
                            <ArrowRight size={16} />
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}