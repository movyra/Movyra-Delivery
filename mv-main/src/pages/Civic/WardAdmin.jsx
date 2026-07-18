import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowLeft, 
    ShieldCheck, 
    Clock, 
    CheckCircle, 
    AlertTriangle, 
    Users, 
    Layers,
    FileText,
    Sun,
    Moon
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useCivicStore } from '../../store/useCivicStore';

export default function WardAdmin() {
    const navigate = useNavigate();
    
    // 1. STATE MANAGEMENT
    const theme = useCivicStore((state) => state.theme);
    const toggleTheme = useCivicStore((state) => state.toggleTheme);
    const [lang, setLang] = useState('en');
    const [showLangPrompt, setShowLangPrompt] = useState(false);

    const [incidents, setIncidents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [statusFilter, setStatusFilter] = useState('Active');

    useEffect(() => {
        // Detect System Language
        const sysLang = navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'mr', 'gu', 'te', 'ta', 'pa', 'bho', 'ar', 'es', 'fr', 'de'];
        if (supported.includes(sysLang)) setLang(sysLang);

        const complaintsRef = collection(db, 'civic_complaints');
        const adminQuery = query(complaintsRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(adminQuery, (snapshot) => {
            const records = snapshot.docs.map(document => ({
                id: document.id,
                ...document.data()
            }));
            setIncidents(records);
            setIsLoading(false);
        }, (error) => {
            console.error("Failed to establish real-time administrative stream:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // 2. 13-LANGUAGE DICTIONARY (Admin Context)
    const t = {
        en: { lang: "English", help: "Help Center", back: "Return to Operations Portal", console: "Administrative Console", title: "Ward Operations Control", sub: "Secure command center for managing infrastructural reports, assigning field personnel, and ensuring service level agreement compliance.", flt_active: "Active", flt_comp: "Completed", flt_dup: "Duplicate", th_id: "Tracking ID / Date", th_detail: "Deficiency Details", th_pri: "Priority / SLA", th_stat: "Operational Status", th_act: "Administrative Actions", sync: "Synchronizing administrative records...", no_rec: "No records found matching the current operational filter.", act_assign: "Assign Field Unit", act_init: "Initiate Operations", act_conc: "Conclude Operations", act_merge: "Merge / Mark Duplicate", supp: "Support", ev_att: "Evidence Attached", sla_breach: "SLA Breached", sla_appr: "Approaching Deadline", sla_comp: "Compliant" },
        hi: { lang: "हिन्दी", help: "सहायता केंद्र", back: "ऑपरेशंस पोर्टल पर लौटें", console: "प्रशासनिक कंसोल", title: "वार्ड ऑपरेशंस कंट्रोल", sub: "बुनियादी ढांचे की रिपोर्ट के प्रबंधन, फील्ड कर्मियों को सौंपने और सेवा स्तर समझौते के अनुपालन को सुनिश्चित करने के लिए सुरक्षित कमांड सेंटर।", flt_active: "सक्रिय", flt_comp: "पूरा हुआ", flt_dup: "डुप्लिकेट", th_id: "ट्रैकिंग आईडी / दिनांक", th_detail: "कमी का विवरण", th_pri: "प्राथमिकता / SLA", th_stat: "परिचालन स्थिति", th_act: "प्रशासनिक कार्य", sync: "प्रशासनिक रिकॉर्ड सिंक्रनाइज़ किए जा रहे हैं...", no_rec: "वर्तमान फ़िल्टर से मेल खाने वाला कोई रिकॉर्ड नहीं मिला।", act_assign: "फील्ड यूनिट असाइन करें", act_init: "संचालन आरंभ करें", act_conc: "संचालन संपन्न करें", act_merge: "मर्ज / डुप्लिकेट चिह्नित करें", supp: "समर्थन", ev_att: "साक्ष्य संलग्न", sla_breach: "SLA का उल्लंघन", sla_appr: "समय सीमा के करीब", sla_comp: "अनुपालन" },
        hinglish: { lang: "Hinglish", help: "Help Center", back: "Operations Portal par wapas jayein", console: "Administrative Console", title: "Ward Operations Control", sub: "Infrastructure reports manage karne, field personnel assign karne, aur SLA compliance ensure karne ke liye secure command center.", flt_active: "Active", flt_comp: "Completed", flt_dup: "Duplicate", th_id: "Tracking ID / Date", th_detail: "Deficiency Details", th_pri: "Priority / SLA", th_stat: "Operational Status", th_act: "Administrative Actions", sync: "Administrative records synchronize ho rahe hain...", no_rec: "Current filter se match karta koi record nahi mila.", act_assign: "Field Unit Assign Karein", act_init: "Operations Initiate Karein", act_conc: "Operations Conclude Karein", act_merge: "Merge / Duplicate Mark Karein", supp: "Support", ev_att: "Evidence Attached", sla_breach: "SLA Breached", sla_appr: "Approaching Deadline", sla_comp: "Compliant" },
        mr: { lang: "मराठी", help: "मदत केंद्र", back: "ऑपरेशन्स पोर्टलवर परत जा", console: "प्रशासकीय कन्सोल", title: "वॉर्ड ऑपरेशन्स कंट्रोल", sub: "पायाभूत सुविधा अहवाल व्यवस्थापित करण्यासाठी, फील्ड कर्मचारी नियुक्त करण्यासाठी आणि सेवा पातळी कराराचे पालन सुनिश्चित करण्यासाठी सुरक्षित कमांड सेंटर.", flt_active: "सक्रिय", flt_comp: "पूर्ण", flt_dup: "डुप्लिकेट", th_id: "ट्रॅकिंग आयडी / तारीख", th_detail: "त्रुटी तपशील", th_pri: "प्राधान्य / SLA", th_stat: "ऑपरेशनल स्थिती", th_act: "प्रशासकीय कृती", sync: "प्रशासकीय रेकॉर्ड सिंक्रोनाइझ करत आहे...", no_rec: "सध्याच्या फिल्टरशी जुळणारे कोणतेही रेकॉर्ड आढळले नाहीत.", act_assign: "फील्ड युनिट असाइन करा", act_init: "ऑपरेशन्स सुरू करा", act_conc: "ऑपरेशन्स पूर्ण करा", act_merge: "मर्ज / डुप्लिकेट चिन्हांकित करा", supp: "समर्थन", ev_att: "पुरावा जोडला", sla_breach: "SLA चे उल्लंघन", sla_appr: "अंतिम मुदतीच्या जवळ", sla_comp: "अनुपालन" },
        gu: { lang: "ગુજરાતી", help: "મદદ કેન્દ્ર", back: "ઓપરેશન્સ પોર્ટલ પર પાછા ફરો", console: "વહીવટી કન્સોલ", title: "વોર્ડ ઓપરેશન્સ કંટ્રોલ", sub: "ઇન્ફ્રાસ્ટ્રક્ચર રિપોર્ટ્સનું સંચાલન કરવા, ફિલ્ડ કર્મચારીઓને સોંપવા અને સેવા સ્તરના કરારના પાલનની ખાતરી કરવા માટે સુરક્ષિત કમાન્ડ સેન્ટર.", flt_active: "સક્રિય", flt_comp: "પૂર્ણ", flt_dup: "ડુપ્લિકેટ", th_id: "ટ્રેકિંગ ID / તારીખ", th_detail: "ખામીની વિગતો", th_pri: "પ્રાધાન્ય / SLA", th_stat: "ઓપરેશનલ સ્થિતિ", th_act: "વહીવટી પગલાં", sync: "વહીવટી રેકોર્ડ સિંક્રનાઇઝ થઈ રહ્યા છે...", no_rec: "વર્તમાન ફિલ્ટર સાથે મેળ ખાતો કોઈ રેકોર્ડ મળ્યો નથી.", act_assign: "ફિલ્ડ યુનિટ સોંપો", act_init: "ઓપરેશન્સ શરૂ કરો", act_conc: "ઓપરેશન્સ પૂર્ણ કરો", act_merge: "મર્જ / ડુપ્લિકેટ ચિહ્નિત કરો", supp: "આધાર", ev_att: "પુરાવા જોડાયેલ છે", sla_breach: "SLA નો ભંગ", sla_appr: "અંતિમ મુદત નજીક", sla_comp: "સુસંગત" },
        te: { lang: "తెలుగు", help: "సహాయ కేంద్రం", back: "ఆపరేషన్స్ పోర్టల్‌కు తిరిగి వెళ్లండి", console: "అడ్మినిస్ట్రేటివ్ కన్సోల్", title: "వార్డ్ ఆపరేషన్స్ కంట్రోల్", sub: "మౌలిక సదుపాయాల నివేదికలను నిర్వహించడానికి, ఫీల్డ్ సిబ్బందిని కేటాయించడానికి మరియు సేవా స్థాయి ఒప్పంద సమ్మతిని నిర్ధారించడానికి సురక్షిత కమాండ్ సెంటర్.", flt_active: "క్రియాశీల", flt_comp: "పూర్తయింది", flt_dup: "నకిలీ", th_id: "ట్రాకింగ్ ID / తేదీ", th_detail: "లోపం వివరాలు", th_pri: "ప్రాధాన్యత / SLA", th_stat: "కార్యాచరణ స్థితి", th_act: "పరిపాలనా చర్యలు", sync: "అడ్మినిస్ట్రేటివ్ రికార్డులను సమకాలీకరిస్తోంది...", no_rec: "ప్రస్తుత ఫిల్టర్‌తో సరిపోలే రికార్డులు ఏవీ కనుగొనబడలేదు.", act_assign: "ఫీల్డ్ యూనిట్‌ను కేటాయించండి", act_init: "కార్యకలాపాలను ప్రారంభించండి", act_conc: "కార్యకలాపాలను ముగించండి", act_merge: "విలీనం / నకిలీగా గుర్తించండి", supp: "మద్దతు", ev_att: "సాక్ష్యం జోడించబడింది", sla_breach: "SLA ఉల్లంఘించబడింది", sla_appr: "గడువు సమీపిస్తోంది", sla_comp: "కంప్లైంట్" },
        ta: { lang: "தமிழ்", help: "உதவி மையம்", back: "ஆபரேஷன் போர்ட்டலுக்குத் திரும்பு", console: "நிர்வாக கன்சோல்", title: "வார்டு செயல்பாட்டுக் கட்டுப்பாடு", sub: "உள்கட்டமைப்பு அறிக்கைகளை நிர்வகிப்பதற்கும், களப்பணியாளர்களை நியமிப்பதற்கும், சேவை நிலை ஒப்பந்த இணக்கத்தை உறுதி செய்வதற்கும் பாதுகாப்பான கட்டளை மையம்.", flt_active: "செயலில்", flt_comp: "முடிந்தது", flt_dup: "நகல்", th_id: "கண்காணிப்பு ஐடி / தேதி", th_detail: "குறைபாடு விவரங்கள்", th_pri: "முன்னுரிமை / SLA", th_stat: "செயல்பாட்டு நிலை", th_act: "நிர்வாக நடவடிக்கைகள்", sync: "நிர்வாகப் பதிவுகளை ஒத்திசைக்கிறது...", no_rec: "தற்போதைய வடிப்பானுடன் பொருந்தும் பதிவுகள் எதுவும் கிடைக்கவில்லை.", act_assign: "களப் பிரிவை ஒதுக்கு", act_init: "செயல்பாடுகளைத் தொடங்கு", act_conc: "செயல்பாடுகளை முடிக்கவும்", act_merge: "ஒன்றிணை / நகல் எனக் குறிக்கவும்", supp: "ஆதரவு", ev_att: "சான்று இணைக்கப்பட்டுள்ளது", sla_breach: "SLA மீறப்பட்டது", sla_appr: "கெடு நெருங்குகிறது", sla_comp: "இணக்கமானது" },
        pa: { lang: "ਪੰਜਾਬੀ", help: "ਸਹਾਇਤਾ ਕੇਂਦਰ", back: "ਓਪਰੇਸ਼ਨ ਪੋਰਟਲ 'ਤੇ ਵਾਪਸ ਜਾਓ", console: "ਪ੍ਰਸ਼ਾਸਕੀ ਕੰਸੋਲ", title: "ਵਾਰਡ ਓਪਰੇਸ਼ਨ ਕੰਟਰੋਲ", sub: "ਬੁਨਿਆਦੀ ਢਾਂਚੇ ਦੀਆਂ ਰਿਪੋਰਟਾਂ ਦੇ ਪ੍ਰਬੰਧਨ, ਫੀਲਡ ਕਰਮਚਾਰੀਆਂ ਨੂੰ ਨਿਯੁਕਤ ਕਰਨ, ਅਤੇ ਸੇਵਾ ਪੱਧਰ ਦੇ ਸਮਝੌਤੇ ਦੀ ਪਾਲਣਾ ਨੂੰ ਯਕੀਨੀ ਬਣਾਉਣ ਲਈ ਸੁਰੱਖਿਅਤ ਕਮਾਂਡ ਸੈਂਟਰ।", flt_active: "ਸਰਗਰਮ", flt_comp: "ਮੁਕੰਮਲ", flt_dup: "ਡੁਪਲੀਕੇਟ", th_id: "ਟਰੈਕਿੰਗ ਆਈਡੀ / ਮਿਤੀ", th_detail: "ਕਮੀ ਦੇ ਵੇਰਵੇ", th_pri: "ਤਰਜੀਹ / SLA", th_stat: "ਕਾਰਜਸ਼ੀਲ ਸਥਿਤੀ", th_act: "ਪ੍ਰਬੰਧਕੀ ਕਾਰਵਾਈਆਂ", sync: "ਪ੍ਰਬੰਧਕੀ ਰਿਕਾਰਡਾਂ ਨੂੰ ਸਿੰਕ੍ਰੋਨਾਈਜ਼ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...", no_rec: "ਮੌਜੂਦਾ ਫਿਲਟਰ ਨਾਲ ਮੇਲ ਖਾਂਦਾ ਕੋਈ ਰਿਕਾਰਡ ਨਹੀਂ ਮਿਲਿਆ।", act_assign: "ਫੀਲਡ ਯੂਨਿਟ ਨਿਰਧਾਰਤ ਕਰੋ", act_init: "ਸੰਚਾਲਨ ਸ਼ੁਰੂ ਕਰੋ", act_conc: "ਸੰਚਾਲਨ ਸਮਾਪਤ ਕਰੋ", act_merge: "ਮਿਲਾਓ / ਡੁਪਲੀਕੇਟ ਮਾਰਕ ਕਰੋ", supp: "ਸਮਰਥਨ", ev_att: "ਸਬੂਤ ਨੱਥੀ ਹੈ", sla_breach: "SLA ਦੀ ਉਲੰਘਣਾ", sla_appr: "ਆਖਰੀ ਮਿਤੀ ਨੇੜੇ ਹੈ", sla_comp: "ਪਾਲਣਾ" },
        bho: { lang: "भोजपुरी", help: "मदद केंद्र", back: "ऑपरेशंस पोर्टल पर वापस जाईं", console: "प्रशासनिक कंसोल", title: "वार्ड ऑपरेशंस कंट्रोल", sub: "बुनियादी ढांचा के रिपोर्ट के प्रबंधन, फील्ड कर्मियन के सौंपे आ सेवा स्तर समझौता के अनुपालन के सुनिश्चित करे खातिर सुरक्षित कमांड सेंटर।", flt_active: "सक्रिय", flt_comp: "पूरा भइल", flt_dup: "डुप्लिकेट", th_id: "ट्रैकिंग आईडी / तारीख", th_detail: "कमी के विवरण", th_pri: "प्राथमिकता / SLA", th_stat: "परिचालन स्थिति", th_act: "प्रशासनिक काम", sync: "प्रशासनिक रिकॉर्ड सिंक्रनाइज़ कइल जा रहल बा...", no_rec: "वर्तमान फिल्टर से मेल खाए वाला कवनो रिकॉर्ड ना मिलल।", act_assign: "फील्ड यूनिट असाइन करीं", act_init: "संचालन शुरू करीं", act_conc: "संचालन संपन्न करीं", act_merge: "मर्ज / डुप्लिकेट चिह्नित करीं", supp: "समर्थन", ev_att: "साक्ष्य संलग्न", sla_breach: "SLA के उल्लंघन", sla_appr: "समय सीमा के करीब", sla_comp: "अनुपालन" },
        ar: { lang: "العربية", help: "مركز المساعدة", back: "العودة إلى بوابة العمليات", console: "وحدة التحكم الإدارية", title: "مراقبة عمليات الجناح", sub: "مركز قيادة آمن لإدارة تقارير البنية التحتية، وتعيين الموظفين الميدانيين، وضمان الامتثال لاتفاقية مستوى الخدمة.", flt_active: "نشط", flt_comp: "مكتمل", flt_dup: "مكرر", th_id: "معرف التتبع / التاريخ", th_detail: "تفاصيل النقص", th_pri: "الأولوية / SLA", th_stat: "الحالة التشغيلية", th_act: "الإجراءات الإدارية", sync: "مزامنة السجلات الإدارية...", no_rec: "لم يتم العثور على سجلات تطابق المرشح الحالي.", act_assign: "تعيين وحدة ميدانية", act_init: "بدء العمليات", act_conc: "إنهاء العمليات", act_merge: "دمج / تعليم كمكرر", supp: "دعم", ev_att: "تم إرفاق الأدلة", sla_breach: "تم اختراق SLA", sla_appr: "اقتراب الموعد النهائي", sla_comp: "متوافق" },
        es: { lang: "Español", help: "Centro de ayuda", back: "Volver al Portal de Operaciones", console: "Consola Administrativa", title: "Control de Operaciones de Distrito", sub: "Centro de comando seguro para gestionar reportes de infraestructura, asignar personal de campo y asegurar el cumplimiento de acuerdos de nivel de servicio.", flt_active: "Activo", flt_comp: "Completado", flt_dup: "Duplicado", th_id: "ID de Rastreo / Fecha", th_detail: "Detalles de Deficiencia", th_pri: "Prioridad / SLA", th_stat: "Estado Operativo", th_act: "Acciones Administrativas", sync: "Sincronizando registros administrativos...", no_rec: "No se encontraron registros que coincidan con el filtro actual.", act_assign: "Asignar Unidad de Campo", act_init: "Iniciar Operaciones", act_conc: "Concluir Operaciones", act_merge: "Fusionar / Marcar Duplicado", supp: "Apoyo", ev_att: "Evidencia Adjunta", sla_breach: "SLA Incumplido", sla_appr: "Fecha Límite Próxima", sla_comp: "Cumpliendo" },
        fr: { lang: "Français", help: "Centre d'aide", back: "Retour au Portail des Opérations", console: "Console Administrative", title: "Contrôle des Opérations de Quartier", sub: "Centre de commande sécurisé pour gérer les rapports d'infrastructure, assigner le personnel de terrain et garantir le respect des accords de niveau de service.", flt_active: "Actif", flt_comp: "Terminé", flt_dup: "Doublon", th_id: "ID de Suivi / Date", th_detail: "Détails de la Lacune", th_pri: "Priorité / SLA", th_stat: "Statut Opérationnel", th_act: "Actions Administratives", sync: "Synchronisation des registres administratifs...", no_rec: "Aucun registre trouvé correspondant au filtre actuel.", act_assign: "Assigner une Unité de Terrain", act_init: "Initier les Opérations", act_conc: "Conclure les Opérations", act_merge: "Fusionner / Marquer comme Doublon", supp: "Soutien", ev_att: "Preuve Jointe", sla_breach: "SLA Non Respecté", sla_appr: "Date Limite Approchante", sla_comp: "Conforme" },
        de: { lang: "Deutsch", help: "Hilfezentrum", back: "Zurück zum Operationsportal", console: "Verwaltungskonsole", title: "Kontrolle der Bezirksoperationen", sub: "Sichere Kommandozentrale zur Verwaltung von Infrastrukturberichten, Zuweisung von Feldpersonal und Sicherstellung der Einhaltung von Service-Level-Agreements.", flt_active: "Aktiv", flt_comp: "Abgeschlossen", flt_dup: "Duplikat", th_id: "Tracking-ID / Datum", th_detail: "Mängeldetails", th_pri: "Priorität / SLA", th_stat: "Operativer Status", th_act: "Administrative Maßnahmen", sync: "Verwaltungsdaten werden synchronisiert...", no_rec: "Keine Datensätze gefunden, die dem aktuellen Filter entsprechen.", act_assign: "Feldeinheit Zuweisen", act_init: "Operationen Einleiten", act_conc: "Operationen Abschließen", act_merge: "Zusammenführen / Als Duplikat Markieren", supp: "Unterstützung", ev_att: "Beweise Angehängt", sla_breach: "SLA Verletzt", sla_appr: "Frist Rückt Näher", sla_comp: "Konform" }
    };

    const currentT = t[lang] || t['en'];
    const languageOptions = [
        { code: 'en', label: 'English' }, { code: 'hi', label: 'हिन्दी' }, { code: 'hinglish', label: 'Hinglish' },
        { code: 'mr', label: 'मराठी' }, { code: 'gu', label: 'ગુજરાતી' }, { code: 'te', label: 'తెలుగు' },
        { code: 'ta', label: 'தமிழ்' }, { code: 'pa', label: 'ਪੰਜਾਬੀ' }, { code: 'bho', label: 'भोजपुरी' },
        { code: 'ar', label: 'العربية' }, { code: 'es', label: 'Español' }, { code: 'fr', label: 'Français' },
        { code: 'de', label: 'Deutsch' }
    ];

    const modifyIncidentStatus = async (incidentId, newStatus) => {
        setProcessingId(incidentId);
        try {
            const incidentRef = doc(db, 'civic_complaints', incidentId);
            await updateDoc(incidentRef, {
                status: newStatus,
                updatedAt: new Date()
            });
        } catch (error) {
            console.error("Status modification failed:", error);
            alert("Authorization failed or network transmission error occurred.");
        } finally {
            setProcessingId(null);
        }
    };

    const determineSLAStatus = (createdAt, status) => {
        if (!createdAt || status === 'Completed' || status === 'Duplicate') return { label: currentT.sla_comp, color: theme === 'light' ? 'text-[#00aa55]' : 'text-[#00ff88]' };
        
        const submissionDate = createdAt.toDate();
        const currentDate = new Date();
        const hoursElapsed = (currentDate - submissionDate) / (1000 * 60 * 60);

        if (hoursElapsed > 72) return { label: currentT.sla_breach, color: theme === 'light' ? 'text-[#ff4444]' : 'text-[#ff4444]' };
        if (hoursElapsed > 48) return { label: currentT.sla_appr, color: theme === 'light' ? 'text-[#cc8800]' : 'text-[#ffaa00]' };
        return { label: currentT.sla_comp, color: theme === 'light' ? 'text-[#00aa55]' : 'text-[#00ff88]' };
    };

    const getFilteredIncidents = () => {
        if (statusFilter === 'Active') {
            return incidents.filter(i => ['Submitted', 'Assigned', 'In Progress'].includes(i.status));
        }
        if (statusFilter === 'Completed') {
            return incidents.filter(i => i.status === 'Completed');
        }
        if (statusFilter === 'Duplicate') {
            return incidents.filter(i => i.status === 'Duplicate');
        }
        return incidents;
    };

    const filteredRecords = getFilteredIncidents();

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };

    return (
        <div className={`min-h-screen font-sans overflow-x-hidden pt-24 pb-12 transition-colors duration-300 ${
            theme === 'light' ? 'bg-[#f5f5f5] text-[#111111] selection:bg-black selection:text-white' : 'bg-[#050505] text-white selection:bg-white selection:text-black'
        }`}>
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } } .animate-fade { animation: fadeIn 0.8s ease-out forwards; }`}</style>
            
            {/* TOP HEADER */}
            <header className="fixed top-0 left-0 right-0 w-full flex items-center justify-between px-6 md:px-12 py-6 animate-fade z-50 transition-colors">
                <div className="flex items-center gap-2">
                    <img src={theme === 'light' ? '/logo-3.png' : '/logo.png'} alt="Movyra" className="h-8 w-auto" onError={(e) => e.target.style.display = 'none'} />
                    <span className="font-black text-[1.5rem] tracking-tighter ml-[-5px]">
                        ovyra <span className={`${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'} font-medium text-[1.2rem] ml-1`}>Civic</span>
                    </span>
                </div>
                
                <div className="flex items-center gap-6 text-[0.9rem] font-bold">
                    <button onClick={() => setShowLangPrompt(true)} className={`transition-colors outline-none ${theme === 'light' ? 'text-[#555555] hover:text-black' : 'text-[#888888] hover:text-white'}`}>
                        {currentT.lang}
                    </button>

                    <button onClick={toggleTheme} className={`p-2 rounded-full transition-colors outline-none ${theme === 'light' ? 'bg-[#e0e0e0] text-black' : 'bg-[#222222] text-white'}`}>
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    </button>

                    <button onClick={() => navigate('/')} className={`px-5 py-2 rounded-full flex items-center gap-2 transition-colors outline-none border ${theme === 'light' ? 'bg-white border-[#cccccc] text-black hover:border-black' : 'bg-[#111111] border-[#333333] text-white hover:border-white'}`}>
                        Home
                    </button>
                </div>
            </header>

            {/* LANGUAGE SELECTOR MODAL */}
            <AnimatePresence>
                {showLangPrompt && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`fixed inset-0 z-[60] backdrop-blur-md flex items-center justify-center p-6 ${theme === 'light' ? 'bg-white/80' : 'bg-black/80'}`}>
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className={`w-full max-w-[400px] rounded-3xl p-8 flex flex-col shadow-2xl relative border ${theme === 'light' ? 'bg-white border-[#e0e0e0]' : 'bg-[#050505] border-[#333333]'}`}>
                            <button onClick={() => setShowLangPrompt(false)} className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center transition-colors ${theme === 'light' ? 'text-[#888888] hover:text-black' : 'text-[#888888] hover:text-white'}`}>
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                            
                            <h2 className={`text-[1.5rem] font-black tracking-tight mb-6 text-center ${theme === 'light' ? 'text-black' : 'text-white'}`}>Select Language</h2>
                            
                            <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto">
                                {languageOptions.map((option) => (
                                    <button 
                                        key={option.code}
                                        onClick={() => { setLang(option.code); setShowLangPrompt(false); }}
                                        className={`w-full p-4 rounded-xl flex items-center justify-between group transition-colors border ${theme === 'light' ? (lang === option.code ? 'bg-[#f0f0f0] border-black' : 'bg-white border-[#e0e0e0] hover:border-black') : (lang === option.code ? 'bg-[#222222] border-white' : 'bg-[#0a0a0a] border-[#333333] hover:border-white')}`}
                                    >
                                        <span className={`font-bold text-[1rem] ${theme === 'light' ? (lang === option.code ? 'text-black' : 'text-[#666666] group-hover:text-black') : (lang === option.code ? 'text-white' : 'text-[#888888] group-hover:text-white')}`}>{option.label}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                <button onClick={() => navigate('/civic')} className={`flex items-center gap-2 mb-8 font-bold text-[0.9rem] transition-colors outline-none ${theme === 'light' ? 'text-[#666666] hover:text-black' : 'text-[#888888] hover:text-white'}`}>
                    <ArrowLeft size={16} /> {currentT.back}
                </button>

                <motion.div initial="hidden" animate="visible" variants={containerVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <motion.div variants={itemVariants} className={`flex items-center gap-3 mb-4 ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>
                            <ShieldCheck size={20} className={theme === 'light' ? 'text-black' : 'text-white'} />
                            <span className="text-[0.9rem] font-bold tracking-widest uppercase">{currentT.console}</span>
                        </motion.div>
                        <motion.h1 variants={itemVariants} className="text-[2.5rem] md:text-[3.5rem] font-black leading-[1.1] tracking-tighter mb-4">
                            {currentT.title}
                        </motion.h1>
                        <motion.p variants={itemVariants} className={`text-[1.1rem] max-w-[700px] ${theme === 'light' ? 'text-[#555555]' : 'text-[#aaaaaa]'}`}>
                            {currentT.sub}
                        </motion.p>
                    </div>

                    <motion.div variants={itemVariants} className={`flex rounded-xl overflow-hidden shrink-0 border ${theme === 'light' ? 'bg-white border-[#e0e0e0]' : 'bg-[#111111] border-[#333333]'}`}>
                        {['Active', 'Completed', 'Duplicate'].map((filterType) => {
                            const labelMap = { 'Active': currentT.flt_active, 'Completed': currentT.flt_comp, 'Duplicate': currentT.flt_dup };
                            return (
                                <button
                                    key={filterType}
                                    onClick={() => setStatusFilter(filterType)}
                                    className={`px-6 py-4 font-bold text-[0.9rem] transition-colors outline-none border-r last:border-r-0 ${
                                        theme === 'light' 
                                            ? (statusFilter === filterType ? 'bg-black text-white border-black' : 'text-[#666666] border-[#e0e0e0] hover:bg-[#f5f5f5]') 
                                            : (statusFilter === filterType ? 'bg-white text-black border-white' : 'text-[#888888] border-[#333333] hover:bg-[#222222]')
                                    }`}
                                >
                                    {labelMap[filterType]}
                                </button>
                            );
                        })}
                    </motion.div>
                </motion.div>

                <div className={`rounded-2xl overflow-hidden min-h-[500px] border ${theme === 'light' ? 'bg-white border-[#e0e0e0]' : 'bg-[#111111] border-[#333333]'}`}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className={`border-b ${theme === 'light' ? 'bg-[#f9f9f9] border-[#e0e0e0]' : 'bg-[#0a0a0a] border-[#333333]'}`}>
                                    <th className={`p-6 text-[0.8rem] font-bold uppercase tracking-wider ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{currentT.th_id}</th>
                                    <th className={`p-6 text-[0.8rem] font-bold uppercase tracking-wider ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{currentT.th_detail}</th>
                                    <th className={`p-6 text-[0.8rem] font-bold uppercase tracking-wider ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{currentT.th_pri}</th>
                                    <th className={`p-6 text-[0.8rem] font-bold uppercase tracking-wider ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{currentT.th_stat}</th>
                                    <th className={`p-6 text-[0.8rem] font-bold uppercase tracking-wider text-right ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{currentT.th_act}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="5" className="p-12 text-center">
                                            <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4 ${theme === 'light' ? 'border-black' : 'border-white'}`}></div>
                                            <p className={`font-bold ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{currentT.sync}</p>
                                        </td>
                                    </tr>
                                ) : filteredRecords.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-12 text-center">
                                            <FileText size={32} className={`mx-auto mb-4 ${theme === 'light' ? 'text-[#cccccc]' : 'text-[#333333]'}`} />
                                            <p className={`font-bold ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{currentT.no_rec}</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRecords.map((incident) => {
                                        const sla = determineSLAStatus(incident.createdAt, incident.status);
                                        const dateString = incident.createdAt ? incident.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Unknown Date';
                                        
                                        return (
                                            <tr key={incident.id} className={`border-b transition-colors ${theme === 'light' ? 'border-[#e0e0e0] hover:bg-[#f5f5f5]' : 'border-[#333333] hover:bg-[#1a1a1a]'}`}>
                                                <td className="p-6 align-top">
                                                    <div className={`font-mono text-[0.85rem] mb-1 ${theme === 'light' ? 'text-black' : 'text-white'}`}>{incident.id.substring(0, 8).toUpperCase()}</div>
                                                    <div className={`text-[0.8rem] font-bold flex items-center gap-1 ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>
                                                        <Clock size={12} /> {dateString}
                                                    </div>
                                                </td>
                                                <td className="p-6 align-top max-w-[300px]">
                                                    <div className={`font-black text-[1rem] mb-1 truncate ${theme === 'light' ? 'text-black' : 'text-white'}`}>{incident.title}</div>
                                                    <div className={`text-[0.85rem] font-bold mb-2 ${theme === 'light' ? 'text-[#555555]' : 'text-[#aaaaaa]'}`}>{incident.category}</div>
                                                    <div className="flex items-center gap-3">
                                                        <span className={`flex items-center gap-1 text-[0.75rem] font-bold ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>
                                                            <Users size={12} /> {currentT.supp}: {incident.supportCount || 1}
                                                        </span>
                                                        {incident.evidenceUrl && (
                                                            <span className={`flex items-center gap-1 text-[0.75rem] font-bold ${theme === 'light' ? 'text-[#00aa55]' : 'text-[#00ff88]'}`}>
                                                                <Layers size={12} /> {currentT.ev_att}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-6 align-top">
                                                    <div className={`inline-block px-3 py-1 text-[0.75rem] font-black tracking-wider uppercase rounded-full mb-2 ${
                                                        incident.priority === 'Critical' ? (theme === 'light' ? 'bg-[#ffcccc] text-[#cc0000]' : 'bg-[#330000] text-[#ff4444]') : 
                                                        incident.priority === 'High' ? (theme === 'light' ? 'bg-[#ffeebb] text-[#cc8800]' : 'bg-[#331a00] text-[#ffaa00]') : 
                                                        (theme === 'light' ? 'bg-[#ccffdd] text-[#00aa55]' : 'bg-[#002211] text-[#00ff88]')
                                                    }`}>
                                                        {incident.priority}
                                                    </div>
                                                    <div className={`text-[0.8rem] font-bold flex items-center gap-1 ${sla.color}`}>
                                                        <AlertTriangle size={12} /> {sla.label}
                                                    </div>
                                                </td>
                                                <td className="p-6 align-top">
                                                    <span className={`text-[0.9rem] font-black ${theme === 'light' ? 'text-black' : 'text-white'}`}>{incident.status}</span>
                                                </td>
                                                <td className="p-6 align-top text-right">
                                                    <div className="flex flex-col gap-2 items-end">
                                                        {incident.status === 'Submitted' && (
                                                            <button 
                                                                onClick={() => modifyIncidentStatus(incident.id, 'Assigned')}
                                                                disabled={processingId === incident.id}
                                                                className={`px-4 py-2 rounded-lg font-bold text-[0.8rem] transition-colors disabled:opacity-50 ${
                                                                    theme === 'light' ? 'bg-black text-white hover:bg-[#333333]' : 'bg-white text-black hover:bg-[#e0e0e0]'
                                                                }`}
                                                            >
                                                                {currentT.act_assign}
                                                            </button>
                                                        )}
                                                        {incident.status === 'Assigned' && (
                                                            <button 
                                                                onClick={() => modifyIncidentStatus(incident.id, 'In Progress')}
                                                                disabled={processingId === incident.id}
                                                                className={`border px-4 py-2 rounded-lg font-bold text-[0.8rem] transition-colors disabled:opacity-50 ${
                                                                    theme === 'light' ? 'bg-white text-black border-[#cccccc] hover:border-black' : 'bg-[#222222] text-white border-[#555555] hover:border-white'
                                                                }`}
                                                            >
                                                                {currentT.act_init}
                                                            </button>
                                                        )}
                                                        {incident.status === 'In Progress' && (
                                                            <button 
                                                                onClick={() => modifyIncidentStatus(incident.id, 'Completed')}
                                                                disabled={processingId === incident.id}
                                                                className={`border px-4 py-2 rounded-lg font-bold text-[0.8rem] transition-colors disabled:opacity-50 ${
                                                                    theme === 'light' ? 'bg-[#e0ffe0] text-[#00aa55] border-[#00aa55] hover:bg-[#ccffdd]' : 'bg-[#002211] text-[#00ff88] border-[#00ff88] hover:bg-[#00331a]'
                                                                }`}
                                                            >
                                                                {currentT.act_conc}
                                                            </button>
                                                        )}
                                                        {['Submitted', 'Assigned'].includes(incident.status) && (
                                                            <button 
                                                                onClick={() => modifyIncidentStatus(incident.id, 'Duplicate')}
                                                                disabled={processingId === incident.id}
                                                                className={`px-4 py-2 font-bold text-[0.8rem] transition-colors disabled:opacity-50 ${
                                                                    theme === 'light' ? 'text-[#666666] hover:text-[#cc0000]' : 'text-[#888888] hover:text-[#ff4444]'
                                                                }`}
                                                            >
                                                                {currentT.act_merge}
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}