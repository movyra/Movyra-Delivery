import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Map, 
    ArrowLeft, 
    Layers, 
    Filter,
    AlertCircle,
    Activity,
    Sun,
    Moon,
    Home,
    X,
    Globe,
    ArrowUp
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
    const [showProductsPrompt, setShowProductsPrompt] = useState(false);
    const [showSitemap, setShowSitemap] = useState(false);
    
    const [activeIncidents, setActiveIncidents] = useState([]);
    const [filteredIncidents, setFilteredIncidents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');

    const localCity = "Mumbai";

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => {
        const sysLang = navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'hinglish', 'mr', 'gu', 'te', 'ta', 'pa', 'bho', 'ar', 'es', 'fr', 'de'];
        if (supported.includes(sysLang)) setLang(sysLang);

        const fetchGeographicData = async () => {
            setIsLoading(true);
            try {
                const complaintsRef = collection(db, 'civic_complaints');
                const activeQuery = query(
                    complaintsRef, 
                    where('status', 'in', ['Reported', 'Assigned', 'In Progress', 'Submitted'])
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
            lang: "English", help: "Help Center", back: "Back", careers: "Careers", products: "Products", sitemap: "Sitemap", sitemap_desc: "Direct navigation to all civic pages.",
            title: "Live Heatmap", sub: "View reported issues on a live geographic map to see problem hotspots in your city.",
            active_plots: "Active Issues", filters: "Filter by Category", filter_sub: "Select a category to view specific issues.",
            legend: "Map Legend", iso_inc: "Single Issue", high_den: "Multiple Issues", rendering: "Loading map data...", status: "Status",
            cat_all: "All Issues", cat_road: "Road Maintenance", cat_san: "Sanitation Services", cat_water: "Water Supply", cat_elec: "Electrical Grid", cat_safe: "Public Safety",
            sm_home: "Public Portal", sm_report: "File a Report", sm_map: "Live Transparency Map", sm_admin: "Admin Console"
        },
        hi: {
            lang: "हिन्दी", help: "सहायता केंद्र", back: "होम पर लौटें", careers: "करियर", products: "उत्पाद", sitemap: "साइटमैप", sitemap_desc: "सभी सिविक मॉड्यूल पर सीधा नेविगेशन।",
            title: "लाइव हीटमैप", sub: "अपने शहर में समस्या वाले स्थानों को देखने के लिए एक लाइव भौगोलिक मानचित्र पर रिपोर्ट की गई समस्याएं देखें।",
            active_plots: "सक्रिय समस्याएं", filters: "श्रेणी के अनुसार फ़िल्टर करें", filter_sub: "विशिष्ट समस्याओं को देखने के लिए एक श्रेणी चुनें।",
            legend: "मानचित्र किंवदंती", iso_inc: "एकल समस्या", high_den: "एकाधिक समस्याएं", rendering: "मानचित्र डेटा लोड हो रहा है...", status: "स्थिति",
            cat_all: "सभी समस्याएं", cat_road: "सड़क रखरखाव", cat_san: "स्वच्छता सेवाएं", cat_water: "जल आपूर्ति", cat_elec: "इलेक्ट्रिकल ग्रिड", cat_safe: "सार्वजनिक सुरक्षा",
            sm_home: "सार्वजनिक पोर्टल", sm_report: "रिपोर्ट दर्ज करें", sm_map: "लाइव पारदर्शिता मानचित्र", sm_admin: "एडमिन कंसोल"
        },
        hinglish: {
            lang: "Hinglish", help: "Help Center", back: "Home par wapas jayein", careers: "Careers", products: "Products", sitemap: "Sitemap", sitemap_desc: "Sabhi Civic modules ka direct navigation.",
            title: "Live Heatmap", sub: "Apne city ke problem hotspots dekhne ke liye live map par reported issues dekhein.",
            active_plots: "Active Issues", filters: "Category se Filter karein", filter_sub: "Specific issues dekhne ke liye category select karein.",
            legend: "Map Legend", iso_inc: "Single Issue", high_den: "Multiple Issues", rendering: "Map data load ho raha hai...", status: "Status",
            cat_all: "All Issues", cat_road: "Road Maintenance", cat_san: "Sanitation Services", cat_water: "Water Supply", cat_elec: "Electrical Grid", cat_safe: "Public Safety",
            sm_home: "Public Portal", sm_report: "Report Darj Karein", sm_map: "Live Transparency Map", sm_admin: "Admin Console"
        },
        mr: {
            lang: "मराठी", help: "मदत केंद्र", back: "मुख्यपृष्ठावर परत जा", careers: "करिअर", products: "उत्पादने", sitemap: "साइटमॅप", sitemap_desc: "सर्व सिविक मॉड्यूल्ससाठी थेट नेव्हिगेशन.",
            title: "थेट हीटमॅप", sub: "तुमच्या शहरातील समस्यांचे हॉटस्पॉट पाहण्यासाठी थेट नकाशावर नोंदवलेल्या समस्या पहा.",
            active_plots: "सक्रिय समस्या", filters: "श्रेणीनुसार फिल्टर करा", filter_sub: "विशिष्ट समस्या पाहण्यासाठी श्रेणी निवडा.",
            legend: "नकाशा लीजेंड", iso_inc: "एकल समस्या", high_den: "अनेक समस्या", rendering: "नकाशा डेटा लोड करत आहे...", status: "स्थिती",
            cat_all: "सर्व समस्या", cat_road: "रस्ते देखभाल", cat_san: "स्वच्छता सेवा", cat_water: "पाणी पुरवठा", cat_elec: "विद्युत ग्रिड", cat_safe: "सार्वजनिक सुरक्षा",
            sm_home: "सार्वजनिक पोर्टल", sm_report: "अहवाल दाखल करा", sm_map: "थेट पारदर्शकता नकाशा", sm_admin: "प्रशासन कन्सोल"
        },
        gu: {
            lang: "ગુજરાતી", help: "મદદ કેન્દ્ર", back: "હોમ પર પાછા ફરો", careers: "કારકિર્દી", products: "ઉત્પાદનો", sitemap: "સાઇટમેપ", sitemap_desc: "તમામ સિવિક મોડ્યુલો માટે સીધું નેવિગેશન.",
            title: "લાઇવ હીટમેપ", sub: "તમારા શહેરમાં સમસ્યાવાળા સ્થાનો જોવા માટે જીવંત નકશા પર નોંધાયેલી સમસ્યાઓ જુઓ.",
            active_plots: "સક્રિય સમસ્યાઓ", filters: "શ્રેણી દ્વારા ફિલ્ટર કરો", filter_sub: "ચોક્કસ સમસ્યાઓ જોવા માટે શ્રેણી પસંદ કરો.",
            legend: "નકશો લિજેન્ડ", iso_inc: "એકલ સમસ્યા", high_den: "બહુવિધ સમસ્યાઓ", rendering: "નકશા ડેટા લોડ થઈ રહ્યો છે...", status: "સ્થિતિ",
            cat_all: "બધી સમસ્યાઓ", cat_road: "રોડ જાળવણી", cat_san: "સ્વચ્છતા સેવાઓ", cat_water: "પાણી પુરવઠો", cat_elec: "ઇલેક્ટ્રિકલ ગ્રીડ", cat_safe: "જાહેર સુરક્ષા",
            sm_home: "જાહેર પોર્ટલ", sm_report: "રિપોર્ટ ફાઇલ કરો", sm_map: "જીવંત પારદર્શિતા નકશો", sm_admin: "એડમિન કન્સોલ"
        },
        te: {
            lang: "తెలుగు", help: "సహాయ కేంద్రం", back: "హోమ్‌కు తిరిగి వెళ్లండి", careers: "కెరీర్స్", products: "ఉత్పత్తులు", sitemap: "సైట్‌మ్యాప్", sitemap_desc: "అన్ని సివిక్ మాడ్యూల్స్‌కు ప్రత్యక్ష నావిగేషన్.",
            title: "లైవ్ హీట్‌మ్యాప్", sub: "మీ నగరంలోని సమస్యల హాట్‌స్పాట్‌లను చూడటానికి ప్రత్యక్ష మ్యాప్‌లో నివేదించబడిన సమస్యలను వీక్షించండి.",
            active_plots: "క్రియాశీల సమస్యలు", filters: "వర్గం ద్వారా ఫిల్టర్ చేయండి", filter_sub: "నిర్దిష్ట సమస్యలను వీక్షించడానికి ఒక వర్గాన్ని ఎంచుకోండి.",
            legend: "మ్యాప్ లెజెండ్", iso_inc: "ఒకే సమస్య", high_den: "బహుళ సమస్యలు", rendering: "మ్యాప్ డేటా లోడ్ అవుతోంది...", status: "స్థితి",
            cat_all: "అన్ని సమస్యలు", cat_road: "రహదారి నిర్వహణ", cat_san: "పారిశుద్ధ్య సేవలు", cat_water: "నీటి సరఫరా", cat_elec: "ఎలక్ట్రికల్ గ్రిడ్", cat_safe: "ప్రజా భద్రత",
            sm_home: "పబ్లిక్ పోర్టల్", sm_report: "నివేదిక దాఖలు చేయండి", sm_map: "లైవ్ పారదర్శకత మ్యాప్", sm_admin: "అడ్మిన్ కన్సోల్"
        },
        ta: {
            lang: "தமிழ்", help: "உதவி மையம்", back: "முகப்புக்குத் திரும்பு", careers: "தொழில்கள்", products: "தயாரிப்புகள்", sitemap: "தளத்தின் வரைபடம்", sitemap_desc: "அனைத்து சிவிக் தொகுதிகளுக்கும் நேரடி வழிசெலுத்தல்.",
            title: "நேரடி ஹீட்மேப்", sub: "உங்கள் நகரத்தில் உள்ள பிரச்சனைகளின் மையப் பகுதிகளைப் பார்க்க நேரடி வரைபடத்தில் புகாரளிக்கப்பட்ட சிக்கல்களைக் காண்க.",
            active_plots: "செயலில் உள்ள பிரச்சனைகள்", filters: "வகையின்படி வடிகட்டவும்", filter_sub: "குறிப்பிட்ட சிக்கல்களைக் காண ஒரு வகையைத் தேர்ந்தெடுக்கவும்.",
            legend: "வரைபட லெஜண்ட்", iso_inc: "ஒற்றை பிரச்சனை", high_den: "பல பிரச்சனைகள்", rendering: "வரைபடத் தரவை ஏற்றுகிறது...", status: "நிலை",
            cat_all: "அனைத்து பிரச்சனைகள்", cat_road: "சாலை பராமரிப்பு", cat_san: "சுகாதார சேவைகள்", cat_water: "நீர் வழங்கல்", cat_elec: "மின்சார கட்டம்", cat_safe: "பொது பாதுகாப்பு",
            sm_home: "பொது போர்டல்", sm_report: "அறிக்கையை தாக்கல் செய்", sm_map: "நேரடி வெளிப்படைத்தன்மை வரைபடம்", sm_admin: "நிர்வாக கன்சோல்"
        },
        pa: {
            lang: "ਪੰਜਾਬੀ", help: "ਸਹਾਇਤਾ ਕੇਂਦਰ", back: "ਹੋਮ 'ਤੇ ਵਾਪਸ", careers: "ਕਰੀਅਰ", products: "ਉਤਪਾਦ", sitemap: "ਸਾਈਟਮੈਪ", sitemap_desc: "ਸਾਰੇ ਸਿਵਿਕ ਮੋਡਿਊਲਾਂ ਲਈ ਸਿੱਧੀ ਨੈਵੀਗੇਸ਼ਨ।",
            title: "ਲਾਈਵ ਹੀਟਮੈਪ", sub: "ਆਪਣੇ ਸ਼ਹਿਰ ਵਿੱਚ ਸਮੱਸਿਆ ਵਾਲੇ ਸਥਾਨਾਂ ਨੂੰ ਦੇਖਣ ਲਈ ਲਾਈਵ ਨਕਸ਼ੇ 'ਤੇ ਰਿਪੋਰਟ ਕੀਤੀਆਂ ਸਮੱਸਿਆਵਾਂ ਦੇਖੋ।",
            active_plots: "ਸਰਗਰਮ ਸਮੱਸਿਆਵਾਂ", filters: "ਸ਼੍ਰੇਣੀ ਦੁਆਰਾ ਫਿਲਟਰ ਕਰੋ", filter_sub: "ਖਾਸ ਸਮੱਸਿਆਵਾਂ ਨੂੰ ਦੇਖਣ ਲਈ ਇੱਕ ਸ਼੍ਰੇਣੀ ਚੁਣੋ।",
            legend: "ਨਕਸ਼ਾ ਦੰਤਕਥਾ", iso_inc: "ਇਕੱਲੀ ਸਮੱਸਿਆ", high_den: "ਕਈ ਸਮੱਸਿਆਵਾਂ", rendering: "ਨਕਸ਼ਾ ਡਾਟਾ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...", status: "ਸਥਿਤੀ",
            cat_all: "ਸਾਰੀਆਂ ਸਮੱਸਿਆਵਾਂ", cat_road: "ਸੜਕ ਦੀ ਸਾਂਭ-ਸੰਭਾਲ", cat_san: "ਸੈਨੀਟੇਸ਼ਨ ਸੇਵਾਵਾਂ", cat_water: "ਪਾਣੀ ਦੀ ਸਪਲਾਈ", cat_elec: "ਇਲੈਕਟ੍ਰੀਕਲ ਗਰਿੱਡ", cat_safe: "ਜਨਤਕ ਸੁਰੱਖਿਆ",
            sm_home: "ਜਨਤਕ ਪੋਰਟਲ", sm_report: "ਰਿਪੋਰਟ ਦਰਜ ਕਰੋ", sm_map: "ਲਾਈਵ ਪਾਰਦਰਸ਼ਤਾ ਨਕਸ਼ਾ", sm_admin: "ਐਡਮਿਨ ਕੰਸੋਲ"
        },
        bho: {
            lang: "भोजपुरी", help: "मदद केंद्र", back: "होम पर वापस", careers: "करियर", products: "उत्पाद", sitemap: "साइटमैप", sitemap_desc: "सब सिविक मॉड्यूल पर सीधा नेविगेशन।",
            title: "लाइव हीटमैप", sub: "आपन शहर में समस्या के हॉटस्पॉट देखे खातिर लाइव नक्शा पर रिपोर्ट कइल गइल समस्या देखीं।",
            active_plots: "सक्रिय समस्या", filters: "श्रेणी के अनुसार फिल्टर करीं", filter_sub: "विशिष्ट समस्या देखे खातिर श्रेणी चुनीं।",
            legend: "नक्शा लीजेंड", iso_inc: "एकल समस्या", high_den: "एकाधिक समस्या", rendering: "नक्शा डेटा लोड हो रहल बा...", status: "स्थिति",
            cat_all: "सभ समस्या", cat_road: "सड़क रखरखाव", cat_san: "स्वच्छता सेवा", cat_water: "जल आपूर्ति", cat_elec: "इलेक्ट्रिकल ग्रिड", cat_safe: "सार्वजनिक सुरक्षा",
            sm_home: "सार्वजनिक पोर्टल", sm_report: "रिपोर्ट सबमिट करीं", sm_map: "लाइव पारदर्शिता नक्शा", sm_admin: "एडमिन कंसोल"
        },
        ar: {
            lang: "العربية", help: "مركز المساعدة", back: "العودة إلى الصفحة الرئيسية", careers: "الوظائف", products: "المنتجات", sitemap: "خريطة الموقع", sitemap_desc: "التنقل المباشر لجميع وحدات المدنية.",
            title: "خريطة حرارية حية", sub: "عرض المشكلات المبلغ عنها على خريطة جغرافية حية لرؤية النقاط الساخنة للمشكلات في مدينتك.",
            active_plots: "المشكلات النشطة", filters: "تصفية حسب الفئة", filter_sub: "حدد فئة لعرض مشكلات محددة.",
            legend: "مفتاح الخريطة", iso_inc: "مشكلة واحدة", high_den: "مشكلات متعددة", rendering: "تحميل بيانات الخريطة...", status: "الحالة",
            cat_all: "جميع المشكلات", cat_road: "صيانة الطرق", cat_san: "خدمات الصرف الصحي", cat_water: "إمدادات المياه", cat_elec: "الشبكة الكهربائية", cat_safe: "السلامة العامة",
            sm_home: "البوابة العامة", sm_report: "تقديم تقرير", sm_map: "خريطة الشفافية المباشرة", sm_admin: "وحدة تحكم الإدارة"
        },
        es: {
            lang: "Español", help: "Centro de ayuda", back: "Volver a Inicio", careers: "Carreras", products: "Productos", sitemap: "Mapa del sitio", sitemap_desc: "Navegación directa a todos los módulos Cívicos.",
            title: "Mapa de Calor en Vivo", sub: "Vea los problemas reportados en un mapa para ver los puntos críticos de su ciudad.",
            active_plots: "Problemas Activos", filters: "Filtrar por Categoría", filter_sub: "Seleccione una categoría para ver problemas específicos.",
            legend: "Leyenda del Mapa", iso_inc: "Problema Único", high_den: "Múltiples Problemas", rendering: "Cargando datos del mapa...", status: "Estado",
            cat_all: "Todos los Problemas", cat_road: "Mantenimiento de Carreteras", cat_san: "Servicios de Saneamiento", cat_water: "Suministro de Agua", cat_elec: "Red Eléctrica", cat_safe: "Seguridad Pública",
            sm_home: "Portal Público", sm_report: "Presentar un Reporte", sm_map: "Mapa de Transparencia", sm_admin: "Consola de Administración"
        },
        fr: {
            lang: "Français", help: "Centre d'aide", back: "Retour à l'accueil", careers: "Carrières", products: "Produits", sitemap: "Plan du site", sitemap_desc: "Navigation directe vers tous les modules Civiques.",
            title: "Carte Thermique en Direct", sub: "Consultez les problèmes signalés sur une carte pour voir les points chauds de votre ville.",
            active_plots: "Problèmes Actifs", filters: "Filtrer par Catégorie", filter_sub: "Sélectionnez une catégorie pour voir des problèmes spécifiques.",
            legend: "Légende de la Carte", iso_inc: "Problème Unique", high_den: "Problèmes Multiples", rendering: "Chargement des données de la carte...", status: "Statut",
            cat_all: "Tous les Problèmes", cat_road: "Entretien Routier", cat_san: "Services d'Assainissement", cat_water: "Approvisionnement en Eau", cat_elec: "Réseau Électrique", cat_safe: "Sécurité Publique",
            sm_home: "Portail Public", sm_report: "Soumettre un Rapport", sm_map: "Carte de Transparence", sm_admin: "Console d'Administration"
        },
        de: {
            lang: "Deutsch", help: "Hilfezentrum", back: "Zurück zur Startseite", careers: "Karriere", products: "Produkte", sitemap: "Seitenverzeichnis", sitemap_desc: "Direkte Navigation zu allen Civic-Modulen.",
            title: "Live-Heatmap", sub: "Zeigen Sie gemeldete Probleme auf einer Live-Karte an, um Problem-Hotspots in Ihrer Stadt zu sehen.",
            active_plots: "Aktive Probleme", filters: "Nach Kategorie Filtern", filter_sub: "Wählen Sie eine Kategorie aus, um bestimmte Probleme anzuzeigen.",
            legend: "Kartenlegende", iso_inc: "Einzelnes Problem", high_den: "Mehrere Probleme", rendering: "Kartendaten werden geladen...", status: "Status",
            cat_all: "Alle Probleme", cat_road: "Straßeninstandhaltung", cat_san: "Sanitärdienste", cat_water: "Wasserversorgung", cat_elec: "Stromnetz", cat_safe: "Öffentliche Sicherheit",
            sm_home: "Öffentliches Portal", sm_report: "Meldung Einreichen", sm_map: "Live-Transparenzkarte", sm_admin: "Admin-Konsole"
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
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/civic')}>
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
                                    <img src={theme === 'light' ? '/logo-4.png' : '/logo-4.png'} alt="Movyra" className="h-6 w-auto" onError={(e) => e.target.style.display = 'none'} />
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
            <div className={`flex-1 flex flex-col md:flex-row border-t border-b relative animate-fade ${theme === 'light' ? 'border-[#e0e0e0]' : 'border-[#333333]'}`}>
                
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
            
            {/* FOOTER ALIGNMENT */}
            <footer className={`w-full mx-auto flex flex-col md:flex-row items-center justify-between gap-8 px-8 md:px-16 py-8 ${
                theme === 'light' ? 'bg-[#ffffff]' : 'bg-[#050505]'
            }`}>
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
                        <button onClick={() => setShowProductsPrompt(true)} className={`transition-colors outline-none ${theme === 'light' ? 'hover:text-black' : 'hover:text-white'}`}>{currentT.products}</button>
                        <span className={`w-1 h-1 rounded-full ${theme === 'light' ? 'bg-[#cccccc]' : 'bg-[#333333]'}`}></span>
                        <span onClick={() => setShowSitemap(true)} className={`cursor-pointer transition-colors underline outline-none ${theme === 'light' ? 'hover:text-black' : 'hover:text-white'}`}>{currentT.sitemap}</span>
                        <span className={`w-1 h-1 rounded-full ${theme === 'light' ? 'bg-[#cccccc]' : 'bg-[#333333]'}`}></span>
                        <Link to="/careers" className={`transition-colors ${theme === 'light' ? 'hover:text-black' : 'hover:text-white'}`}>{currentT.careers}</Link>
                    </div>
                    <span className={`hidden md:block w-1 h-1 rounded-full ${theme === 'light' ? 'bg-[#cccccc]' : 'bg-[#333333]'}`}></span>
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
                    <button onClick={scrollToTop} className={`p-2 rounded-full transition-colors border outline-none ${theme === 'light' ? 'bg-[#f5f5f5] border-[#cccccc] hover:bg-[#e0e0e0]' : 'bg-[#111111] border-[#333333] hover:bg-[#222222]'}`}>
                        <ArrowUp size={16} />
                    </button>
                </div>
            </footer>

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