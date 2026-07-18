import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Map, 
    ArrowLeft, 
    Layers, 
    Filter,
    AlertCircle,
    Activity,
    Sun,
    Moon
} from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useCivicStore } from '../../store/useCivicStore';

export default function CivicHeatmap() {
    const navigate = useNavigate();
    
    // 1. STATE MANAGEMENT
    const theme = useCivicStore((state) => state.theme);
    const toggleTheme = useCivicStore((state) => state.toggleTheme);
    const [lang, setLang] = useState('en');
    const [showLangPrompt, setShowLangPrompt] = useState(false);
    
    const [activeIncidents, setActiveIncidents] = useState([]);
    const [filteredIncidents, setFilteredIncidents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        // Detect System Language
        const sysLang = navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'mr', 'gu', 'te', 'ta', 'pa', 'bho', 'ar', 'es', 'fr', 'de'];
        if (supported.includes(sysLang)) setLang(sysLang);

        const fetchGeographicData = async () => {
            setIsLoading(true);
            try {
                const complaintsRef = collection(db, 'civic_complaints');
                // Retrieve only currently active operations to prevent historical data skew
                const activeQuery = query(
                    complaintsRef, 
                    where('status', 'in', ['Submitted', 'Assigned', 'In Progress'])
                );
                
                const snapshot = await getDocs(activeQuery);
                const records = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })).filter(record => record.location && record.location.latitude && record.location.longitude);
                
                setActiveIncidents(records);
                setFilteredIncidents(records);
            } catch (error) {
                console.error("Geographic data retrieval failed:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGeographicData();
    }, []);

    // Departmental filtering logic
    useEffect(() => {
        if (selectedCategory === 'All') {
            setFilteredIncidents(activeIncidents);
        } else {
            const filtered = activeIncidents.filter(incident => incident.category === selectedCategory);
            setFilteredIncidents(filtered);
        }
    }, [selectedCategory, activeIncidents]);

    // 2. 13-LANGUAGE DICTIONARY (Heatmap Context)
    const t = {
        en: {
            lang: "English", help: "Help Center", back: "Return to Operations Portal",
            title: "Geographic Distribution", sub: "Identify high-density infrastructural deficiency zones to optimize municipal resource allocation and deployment routes.",
            active_plots: "Active Plots", filters: "Departmental Filters", filter_sub: "Isolate data points by operational division.",
            legend: "Density Legend", iso_inc: "Isolated Incident", high_den: "High-Density Cluster", rendering: "Rendering geographic data points...", status: "Status",
            cat_all: "All", cat_road: "Road Maintenance", cat_san: "Sanitation Services", cat_water: "Water Supply", cat_elec: "Electrical Grid", cat_safe: "Public Safety"
        },
        hi: {
            lang: "हिन्दी", help: "सहायता केंद्र", back: "ऑपरेशंस पोर्टल पर लौटें",
            title: "भौगोलिक वितरण", sub: "नगर निगम संसाधन आवंटन और तैनाती मार्गों को अनुकूलित करने के लिए उच्च-घनत्व वाले बुनियादी ढांचे की कमी वाले क्षेत्रों की पहचान करें।",
            active_plots: "सक्रिय प्लॉट्स", filters: "विभागीय फ़िल्टर", filter_sub: "परिचालन प्रभाग द्वारा डेटा बिंदुओं को अलग करें।",
            legend: "घनत्व किंवदंती", iso_inc: "पृथक घटना", high_den: "उच्च-घनत्व क्लस्टर", rendering: "भौगोलिक डेटा पॉइंट रेंडर किए जा रहे हैं...", status: "स्थिति",
            cat_all: "सभी", cat_road: "सड़क रखरखाव", cat_san: "स्वच्छता सेवाएं", cat_water: "जल आपूर्ति", cat_elec: "इलेक्ट्रिकल ग्रिड", cat_safe: "सार्वजनिक सुरक्षा"
        },
        hinglish: {
            lang: "Hinglish", help: "Help Center", back: "Operations Portal par wapas jayein",
            title: "Geographic Distribution", sub: "Municipal resources aur deployment routes optimize karne ke liye high-density issue zones identify karein.",
            active_plots: "Active Plots", filters: "Departmental Filters", filter_sub: "Operational division ke hisaab se data points isolate karein.",
            legend: "Density Legend", iso_inc: "Isolated Incident", high_den: "High-Density Cluster", rendering: "Geographic data points render ho rahe hain...", status: "Status",
            cat_all: "All", cat_road: "Road Maintenance", cat_san: "Sanitation Services", cat_water: "Water Supply", cat_elec: "Electrical Grid", cat_safe: "Public Safety"
        },
        mr: {
            lang: "मराठी", help: "मदत केंद्र", back: "ऑपरेशन्स पोर्टलवर परत जा",
            title: "भौगोलिक वितरण", sub: "महानगरपालिका संसाधन वाटप आणि उपयोजन मार्ग अनुकूल करण्यासाठी उच्च-घनतेच्या पायाभूत सुविधांच्या त्रुटी क्षेत्रांची ओळख करा.",
            active_plots: "सक्रिय प्लॉट्स", filters: "विभागीय फिल्टर", filter_sub: "ऑपरेशनल विभागानुसार डेटा पॉइंट्स वेगळे करा.",
            legend: "घनता लीजेंड", iso_inc: "वेगळी घटना", high_den: "उच्च-घनता क्लस्टर", rendering: "भौगोलिक डेटा पॉइंट्स रेंडर करत आहे...", status: "स्थिती",
            cat_all: "सर्व", cat_road: "रस्ते देखभाल", cat_san: "स्वच्छता सेवा", cat_water: "पाणी पुरवठा", cat_elec: "विद्युत ग्रिड", cat_safe: "सार्वजनिक सुरक्षा"
        },
        gu: {
            lang: "ગુજરાતી", help: "મદદ કેન્દ્ર", back: "ઓપરેશન્સ પોર્ટલ પર પાછા ફરો",
            title: "ભૌગોલિક વિતરણ", sub: "મ્યુનિસિપલ સંસાધનની ફાળવણી અને જમાવટના માર્ગોને શ્રેષ્ઠ બનાવવા માટે ઉચ્ચ-ઘનતાવાળા ઇન્ફ્રાસ્ટ્રક્ચર ખામીવાળા વિસ્તારોને ઓળખો.",
            active_plots: "સક્રિય પ્લોટ્સ", filters: "વિભાગીય ફિલ્ટર્સ", filter_sub: "ઓપરેશનલ વિભાગ દ્વારા ડેટા પોઈન્ટ્સને અલગ કરો.",
            legend: "ઘનતા લિજેન્ડ", iso_inc: "અલગ ઘટના", high_den: "ઉચ્ચ-ઘનતા ક્લસ્ટર", rendering: "ભૌગોલિક ડેટા પોઈન્ટ રેન્ડર થઈ રહ્યા છે...", status: "સ્થિતિ",
            cat_all: "બધા", cat_road: "રોડ જાળવણી", cat_san: "સ્વચ્છતા સેવાઓ", cat_water: "પાણી પુરવઠો", cat_elec: "ઇલેક્ટ્રિકલ ગ્રીડ", cat_safe: "જાહેર સુરક્ષા"
        },
        te: {
            lang: "తెలుగు", help: "సహాయ కేంద్రం", back: "ఆపరేషన్స్ పోర్టల్‌కు తిరిగి వెళ్లండి",
            title: "భౌగోళిక పంపిణీ", sub: "మున్సిపల్ వనరుల కేటాయింపు మరియు విస్తరణ మార్గాలను ఆప్టిమైజ్ చేయడానికి అధిక-సాంద్రత గల మౌలిక సదుపాయాల లోపం ఉన్న ప్రాంతాలను గుర్తించండి.",
            active_plots: "క్రియాశీల ప్లాట్లు", filters: "డిపార్ట్‌మెంటల్ ఫిల్టర్లు", filter_sub: "కార్యాచరణ విభాగం ద్వారా డేటా పాయింట్లను వేరు చేయండి.",
            legend: "సాంద్రత లెజెండ్", iso_inc: "వివిక్త సంఘటన", high_den: "అధిక-సాంద్రత క్లస్టర్", rendering: "భౌగోళిక డేటా పాయింట్లను రెండర్ చేస్తోంది...", status: "స్థితి",
            cat_all: "అన్నీ", cat_road: "రహదారి నిర్వహణ", cat_san: "పారిశుద్ధ్య సేవలు", cat_water: "నీటి సరఫరా", cat_elec: "ఎలక్ట్రికల్ గ్రిడ్", cat_safe: "ప్రజా భద్రత"
        },
        ta: {
            lang: "தமிழ்", help: "உதவி மையம்", back: "ஆபரேஷன் போர்ட்டலுக்குத் திரும்பு",
            title: "புவியியல் விநியோகம்", sub: "நகராட்சி வள ஒதுக்கீடு மற்றும் வரிசைப்படுத்தல் வழிகளை மேம்படுத்த அதிக அடர்த்தி கொண்ட உள்கட்டமைப்பு குறைபாடு மண்டலங்களை அடையாளம் காணவும்.",
            active_plots: "செயலில் உள்ள அடுக்குகள்", filters: "துறை வடிப்பான்கள்", filter_sub: "செயல்பாட்டுப் பிரிவின்படி தரவுப் புள்ளிகளைத் தனிமைப்படுத்தவும்.",
            legend: "அடர்த்தி லெஜண்ட்", iso_inc: "தனிமைப்படுத்தப்பட்ட சம்பவம்", high_den: "உயர் அடர்த்தி கிளஸ்டர்", rendering: "புவியியல் தரவு புள்ளிகளை ரெண்டரிங் செய்கிறது...", status: "நிலை",
            cat_all: "அனைத்தும்", cat_road: "சாலை பராமரிப்பு", cat_san: "சுகாதார சேவைகள்", cat_water: "நீர் வழங்கல்", cat_elec: "மின்சார கட்டம்", cat_safe: "பொது பாதுகாப்பு"
        },
        pa: {
            lang: "ਪੰਜਾਬੀ", help: "ਸਹਾਇਤਾ ਕੇਂਦਰ", back: "ਓਪਰੇਸ਼ਨ ਪੋਰਟਲ 'ਤੇ ਵਾਪਸ ਜਾਓ",
            title: "ਭੂਗੋਲਿਕ ਵੰਡ", sub: "ਮਿਉਂਸਪਲ ਸਰੋਤ ਵੰਡ ਅਤੇ ਤੈਨਾਤੀ ਮਾਰਗਾਂ ਨੂੰ ਅਨੁਕੂਲ ਬਣਾਉਣ ਲਈ ਉੱਚ-ਘਣਤਾ ਵਾਲੇ ਬੁਨਿਆਦੀ ਢਾਂਚੇ ਦੀ ਕਮੀ ਵਾਲੇ ਜ਼ੋਨਾਂ ਦੀ ਪਛਾਣ ਕਰੋ।",
            active_plots: "ਸਰਗਰਮ ਪਲਾਟ", filters: "ਵਿਭਾਗੀ ਫਿਲਟਰ", filter_sub: "ਕਾਰਜਸ਼ੀਲ ਡਿਵੀਜ਼ਨ ਦੁਆਰਾ ਡੇਟਾ ਪੁਆਇੰਟਾਂ ਨੂੰ ਅਲੱਗ ਕਰੋ।",
            legend: "ਘਣਤਾ ਦੰਤਕਥਾ", iso_inc: "ਅਲੱਗ-ਥਲੱਗ ਘਟਨਾ", high_den: "ਉੱਚ-ਘਣਤਾ ਕਲੱਸਟਰ", rendering: "ਭੂਗੋਲਿਕ ਡਾਟਾ ਪੁਆਇੰਟ ਰੈਂਡਰ ਕੀਤੇ ਜਾ ਰਹੇ ਹਨ...", status: "ਸਥਿਤੀ",
            cat_all: "ਸਾਰੇ", cat_road: "ਸੜਕ ਦੀ ਸਾਂਭ-ਸੰਭਾਲ", cat_san: "ਸੈਨੀਟੇਸ਼ਨ ਸੇਵਾਵਾਂ", cat_water: "ਪਾਣੀ ਦੀ ਸਪਲਾਈ", cat_elec: "ਇਲੈਕਟ੍ਰੀਕਲ ਗਰਿੱਡ", cat_safe: "ਜਨਤਕ ਸੁਰੱਖਿਆ"
        },
        bho: {
            lang: "भोजपुरी", help: "मदद केंद्र", back: "ऑपरेशंस पोर्टल पर वापस जाईं",
            title: "भौगोलिक वितरण", sub: "नगर निगम संसाधन आवंटन आ तैनाती मार्ग के अनुकूल बनावे खातिर उच्च-घनत्व वाला बुनियादी ढांचा के कमी वाला क्षेत्रन के पहचान करीं।",
            active_plots: "सक्रिय प्लॉट्स", filters: "विभागीय फिल्टर", filter_sub: "परिचालन प्रभाग द्वारा डेटा बिंदु के अलग करीं।",
            legend: "घनत्व लीजेंड", iso_inc: "अलग घटना", high_den: "उच्च-घनत्व क्लस्टर", rendering: "भौगोलिक डेटा पॉइंट रेंडर कइल जा रहल बा...", status: "स्थिति",
            cat_all: "सभ", cat_road: "सड़क रखरखाव", cat_san: "स्वच्छता सेवा", cat_water: "जल आपूर्ति", cat_elec: "इलेक्ट्रिकल ग्रिड", cat_safe: "सार्वजनिक सुरक्षा"
        },
        ar: {
            lang: "العربية", help: "مركز المساعدة", back: "العودة إلى بوابة العمليات",
            title: "التوزيع الجغرافي", sub: "تحديد مناطق نقص البنية التحتية عالية الكثافة لتحسين تخصيص الموارد وطرق النشر للبلدية.",
            active_plots: "النقاط النشطة", filters: "مرشحات الأقسام", filter_sub: "عزل نقاط البيانات حسب القسم التشغيلي.",
            legend: "مفتاح الكثافة", iso_inc: "حادث معزول", high_den: "مجموعة عالية الكثافة", rendering: "تقديم نقاط البيانات الجغرافية...", status: "الحالة",
            cat_all: "الكل", cat_road: "صيانة الطرق", cat_san: "خدمات الصرف الصحي", cat_water: "إمدادات المياه", cat_elec: "الشبكة الكهربائية", cat_safe: "السلامة العامة"
        },
        es: {
            lang: "Español", help: "Centro de ayuda", back: "Volver al Portal de Operaciones",
            title: "Distribución Geográfica", sub: "Identifique zonas de deficiencia de infraestructura de alta densidad para optimizar la asignación de recursos y rutas de despliegue municipal.",
            active_plots: "Parcelas Activas", filters: "Filtros Departamentales", filter_sub: "Aísle los puntos de datos por división operativa.",
            legend: "Leyenda de Densidad", iso_inc: "Incidente Aislado", high_den: "Clúster de Alta Densidad", rendering: "Renderizando puntos de datos geográficos...", status: "Estado",
            cat_all: "Todos", cat_road: "Mantenimiento de Carreteras", cat_san: "Servicios de Saneamiento", cat_water: "Suministro de Agua", cat_elec: "Red Eléctrica", cat_safe: "Seguridad Pública"
        },
        fr: {
            lang: "Français", help: "Centre d'aide", back: "Retour au Portail des Opérations",
            title: "Distribution Géographique", sub: "Identifiez les zones de déficit d'infrastructure à haute densité pour optimiser l'allocation des ressources municipales et les itinéraires de déploiement.",
            active_plots: "Parcelles Actives", filters: "Filtres Départementaux", filter_sub: "Isolez les points de données par division opérationnelle.",
            legend: "Légende de Densité", iso_inc: "Incident Isolé", high_den: "Cluster à Haute Densité", rendering: "Rendu des points de données géographiques...", status: "Statut",
            cat_all: "Tous", cat_road: "Entretien Routier", cat_san: "Services d'Assainissement", cat_water: "Approvisionnement en Eau", cat_elec: "Réseau Électrique", cat_safe: "Sécurité Publique"
        },
        de: {
            lang: "Deutsch", help: "Hilfezentrum", back: "Zurück zum Operationsportal",
            title: "Geografische Verteilung", sub: "Identifizieren Sie Zonen mit hoher Dichte an Infrastrukturmängeln, um die kommunale Ressourcenallokation und Einsatzrouten zu optimieren.",
            active_plots: "Aktive Plots", filters: "Abteilungsfilter", filter_sub: "Isolieren Sie Datenpunkte nach operativer Abteilung.",
            legend: "Dichte-Legende", iso_inc: "Isolierter Vorfall", high_den: "Hochdichter Cluster", rendering: "Geografische Datenpunkte werden gerendert...", status: "Status",
            cat_all: "Alle", cat_road: "Straßeninstandhaltung", cat_san: "Sanitärdienste", cat_water: "Wasserversorgung", cat_elec: "Stromnetz", cat_safe: "Öffentliche Sicherheit"
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

    const mappedCategories = [
        { id: 'All', label: currentT.cat_all },
        { id: 'Road Maintenance', label: currentT.cat_road },
        { id: 'Sanitation Services', label: currentT.cat_san },
        { id: 'Water Supply', label: currentT.cat_water },
        { id: 'Electrical Grid', label: currentT.cat_elec },
        { id: 'Public Safety', label: currentT.cat_safe }
    ];

    return (
        <div className={`min-h-screen font-sans overflow-hidden flex flex-col pt-24 transition-colors duration-300 ${
            theme === 'light' ? 'bg-[#f5f5f5] text-[#111111] selection:bg-black selection:text-white' : 'bg-[#050505] text-white selection:bg-white selection:text-black'
        }`}>
            
            <style>
                {`
                  @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                  .animate-fade { animation: fadeIn 0.8s ease-out forwards; }
                `}
            </style>

            {/* TOP HEADER */}
            <header className={`fixed top-0 left-0 right-0 w-full flex items-center justify-between px-6 md:px-12 py-6 animate-fade z-50 transition-colors border-b ${
                theme === 'light' ? 'bg-[#f5f5f5]/90 border-[#e0e0e0] backdrop-blur-md' : 'bg-[#050505]/90 border-[#111111] backdrop-blur-md'
            }`}>
                <div className="flex items-center gap-2">
                    <img 
                        src={theme === 'light' ? '/logo-light.png' : '/logo.png'} 
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
                        Main Portal
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
            
            {/* Header Area */}
            <div className="shrink-0 px-6 md:px-12 mb-6 animate-fade">
                <button 
                    onClick={() => navigate('/civic')}
                    className={`flex items-center gap-2 mb-6 outline-none font-bold text-[0.9rem] transition-colors ${
                        theme === 'light' ? 'text-[#666666] hover:text-black' : 'text-[#888888] hover:text-white'
                    }`}
                >
                    <ArrowLeft size={16} /> {currentT.back}
                </button>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-[2.5rem] font-black leading-[1.1] tracking-tighter mb-2">
                            {currentT.title}
                        </h1>
                        <p className={`text-[1rem] max-w-[600px] ${theme === 'light' ? 'text-[#555555]' : 'text-[#aaaaaa]'}`}>
                            {currentT.sub}
                        </p>
                    </div>

                    <div className={`flex items-center gap-4 px-6 py-4 rounded-xl border ${
                        theme === 'light' ? 'bg-white border-[#e0e0e0]' : 'bg-[#111111] border-[#333333]'
                    }`}>
                        <div className="flex flex-col">
                            <span className={`text-[0.8rem] font-bold uppercase tracking-wider ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{currentT.active_plots}</span>
                            <span className={`text-[1.5rem] font-black leading-none ${theme === 'light' ? 'text-black' : 'text-white'}`}>{filteredIncidents.length}</span>
                        </div>
                        <div className={`w-[1px] h-10 mx-2 ${theme === 'light' ? 'bg-[#cccccc]' : 'bg-[#333333]'}`}></div>
                        <Activity size={24} className={theme === 'light' ? 'text-[#888888]' : 'text-[#555555]'} />
                    </div>
                </div>
            </div>

            {/* Main Visualizer Area */}
            <div className={`flex-1 flex flex-col md:flex-row border-t relative animate-fade ${theme === 'light' ? 'border-[#e0e0e0]' : 'border-[#333333]'}`}>
                
                {/* Control Panel Sidebar */}
                <div className={`w-full md:w-[350px] shrink-0 border-r flex flex-col z-10 ${
                    theme === 'light' ? 'bg-[#f9f9f9] border-[#e0e0e0]' : 'bg-[#0a0a0a] border-[#333333]'
                }`}>
                    <div className={`p-6 border-b ${theme === 'light' ? 'border-[#e0e0e0]' : 'border-[#333333]'}`}>
                        <h3 className="text-[1.1rem] font-black flex items-center gap-2 mb-1">
                            <Filter size={18} /> {currentT.filters}
                        </h3>
                        <p className={`text-[0.85rem] ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{currentT.filter_sub}</p>
                    </div>
                    
                    <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-2">
                        {mappedCategories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`w-full text-left px-5 py-4 rounded-xl font-bold text-[0.95rem] transition-colors outline-none flex items-center justify-between border ${
                                    theme === 'light'
                                        ? (selectedCategory === cat.id ? 'bg-black text-white border-black' : 'bg-white border-[#cccccc] text-[#666666] hover:border-black')
                                        : (selectedCategory === cat.id ? 'bg-white text-black border-white' : 'bg-[#111111] border-[#333333] text-[#aaaaaa] hover:border-[#555555]')
                                }`}
                            >
                                {cat.label}
                                {selectedCategory === cat.id && <Layers size={16} />}
                            </button>
                        ))}
                    </div>

                    <div className={`p-6 border-t ${theme === 'light' ? 'border-[#e0e0e0] bg-[#f5f5f5]' : 'border-[#333333] bg-[#050505]'}`}>
                        <h4 className={`text-[0.8rem] font-bold uppercase tracking-wider mb-3 ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{currentT.legend}</h4>
                        <div className="flex items-center gap-3 text-[0.85rem] font-bold">
                            <div className="w-4 h-4 rounded-full bg-[#ff4444] opacity-30 border border-[#ff4444]"></div>
                            <span className={theme === 'light' ? 'text-black' : 'text-white'}>{currentT.iso_inc}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[0.85rem] font-bold mt-2">
                            <div className="w-4 h-4 rounded-full bg-[#ff4444] opacity-90 border border-[#ff4444]"></div>
                            <span className={theme === 'light' ? 'text-black' : 'text-white'}>{currentT.high_den}</span>
                        </div>
                    </div>
                </div>

                {/* Map Interface */}
                <div className={`flex-1 relative min-h-[500px] ${theme === 'light' ? 'bg-[#f0f0f0]' : 'bg-[#111111]'}`}>
                    {isLoading ? (
                        <div className={`absolute inset-0 flex flex-col items-center justify-center z-20 ${theme === 'light' ? 'bg-[#f5f5f5]' : 'bg-[#050505]'}`}>
                            <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mb-4 ${theme === 'light' ? 'border-black' : 'border-white'}`}></div>
                            <span className={`text-[0.9rem] font-bold ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{currentT.rendering}</span>
                        </div>
                    ) : (
                        <MapContainer 
                            center={[19.0760, 72.8777]} // Default operational zone
                            zoom={12} 
                            style={{ height: '100%', width: '100%', background: theme === 'light' ? '#f5f5f5' : '#0a0a0a' }}
                            zoomControl={true}
                        >
                            {/* Dynamic tile mapping based on active theme logic */}
                            <TileLayer
                                url={theme === 'light' ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"}
                            />
                            
                            {filteredIncidents.map((incident) => (
                                <CircleMarker
                                    key={incident.id}
                                    center={[incident.location.latitude, incident.location.longitude]}
                                    radius={20}
                                    pathOptions={{
                                        color: '#ff4444',
                                        fillColor: '#ff4444',
                                        fillOpacity: 0.3, // Overlapping low opacity generates the heat effect
                                        stroke: false
                                    }}
                                >
                                    <Popup className="civic-custom-popup">
                                        <div className="p-1">
                                            <div className="text-[0.7rem] font-bold text-[#888888] uppercase tracking-wider mb-1">
                                                {incident.category}
                                            </div>
                                            <div className="font-black text-[1rem] text-black leading-tight mb-2">
                                                {incident.title}
                                            </div>
                                            <div className="text-[0.8rem] font-bold text-[#555555] flex items-center gap-1">
                                                <AlertCircle size={12} /> {currentT.status}: {incident.status}
                                            </div>
                                        </div>
                                    </Popup>
                                </CircleMarker>
                            ))}
                        </MapContainer>
                    )}
                </div>

            </div>
            
            {/* Custom CSS overrides for Leaflet Popups */}
            <style>
                {`
                    .leaflet-popup-content-wrapper {
                        background-color: #ffffff;
                        color: #000000;
                        border-radius: 12px;
                        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
                    }
                    .leaflet-popup-tip {
                        background-color: #ffffff;
                    }
                    .leaflet-container {
                        font-family: inherit;
                    }
                `}
            </style>
        </div>
    );
}