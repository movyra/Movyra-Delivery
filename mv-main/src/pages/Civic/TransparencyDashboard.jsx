import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowLeft, 
    BarChart, 
    CheckCircle, 
    Clock, 
    TrendingUp,
    ShieldCheck,
    Sun,
    Moon
} from 'lucide-react';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useCivicStore } from '../../store/useCivicStore';

export default function TransparencyDashboard() {
    const navigate = useNavigate();
    
    // 1. STATE MANAGEMENT
    const theme = useCivicStore((state) => state.theme);
    const toggleTheme = useCivicStore((state) => state.toggleTheme);
    const [lang, setLang] = useState('en');
    const [showLangPrompt, setShowLangPrompt] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [performanceMetrics, setPerformanceMetrics] = useState({
        totalVolume: 0,
        resolvedVolume: 0,
        overallResolutionRate: 0,
        departmentStats: {}
    });

    useEffect(() => {
        const sysLang = navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'mr', 'gu', 'te', 'ta', 'pa', 'bho', 'ar', 'es', 'fr', 'de'];
        if (supported.includes(sysLang)) setLang(sysLang);

        const generateLiveAnalytics = async () => {
            setIsLoading(true);
            try {
                const complaintsRef = collection(db, 'civic_complaints');
                const analyticsQuery = query(complaintsRef, orderBy('createdAt', 'desc'), limit(500));
                const snapshot = await getDocs(analyticsQuery);
                
                let total = 0;
                let resolved = 0;
                const departments = {};

                snapshot.forEach((document) => {
                    const data = document.data();
                    const category = data.category || 'Uncategorized';
                    const isCompleted = data.status === 'Completed';

                    total += 1;
                    if (isCompleted) resolved += 1;

                    if (!departments[category]) {
                        departments[category] = { total: 0, resolved: 0 };
                    }
                    
                    departments[category].total += 1;
                    if (isCompleted) {
                        departments[category].resolved += 1;
                    }
                });

                const overallRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

                setPerformanceMetrics({
                    totalVolume: total,
                    resolvedVolume: resolved,
                    overallResolutionRate: overallRate,
                    departmentStats: departments
                });

            } catch (error) {
                console.error("Failed to aggregate live operational analytics:", error);
            } finally {
                setIsLoading(false);
            }
        };

        generateLiveAnalytics();
    }, []);

    // 2. 13-LANGUAGE DICTIONARY (Dashboard Context)
    const t = {
        en: { lang: "English", help: "Help Center", back: "Return to Operations Portal", title: "Performance Analytics", sub: "Live operational data reflecting municipal efficiency, departmental workloads, and overall resolution rates.", total: "Total Incidents", resolved: "Resolved", eff: "Efficiency Rate", workload: "Workload Progress", concluded: "Concluded", dpt: "Departmental Analysis", no_data: "Insufficient operational data to generate departmental metrics.", processing: "Aggregating live database records..." },
        hi: { lang: "हिन्दी", help: "सहायता केंद्र", back: "ऑपरेशंस पोर्टल पर लौटें", title: "प्रदर्शन विश्लेषण", sub: "नगर निगम दक्षता, विभागीय कार्यभार और समग्र समाधान दरों को दर्शाने वाला लाइव परिचालन डेटा।", total: "कुल घटनाएं", resolved: "समाधान", eff: "दक्षता दर", workload: "कार्यभार प्रगति", concluded: "संपन्न", dpt: "विभागीय विश्लेषण", no_data: "विभागीय मेट्रिक्स उत्पन्न करने के लिए अपर्याप्त परिचालन डेटा।", processing: "लाइव डेटाबेस रिकॉर्ड एकत्र किए जा रहे हैं..." },
        hinglish: { lang: "Hinglish", help: "Help Center", back: "Operations Portal par wapas jayein", title: "Performance Analytics", sub: "Live operational data jo municipal efficiency, departmental workloads, aur overall resolution rates reflect karta hai.", total: "Total Incidents", resolved: "Resolved", eff: "Efficiency Rate", workload: "Workload Progress", concluded: "Concluded", dpt: "Departmental Analysis", no_data: "Departmental metrics generate karne ke liye data insufficient hai.", processing: "Live database records aggregate ho rahe hain..." },
        mr: { lang: "मराठी", help: "मदत केंद्र", back: "ऑपरेशन्स पोर्टलवर परत जा", title: "कामगिरी विश्लेषण", sub: "महानगरपालिका कार्यक्षमता, विभागीय कार्यभार आणि एकूण रिझोल्यूशन दर दर्शवणारा लाइव्ह ऑपरेशनल डेटा.", total: "एकूण घटना", resolved: "सोडवलेले", eff: "कार्यक्षमता दर", workload: "कामाची प्रगती", concluded: "पूर्ण", dpt: "विभागीय विश्लेषण", no_data: "विभागीय मेट्रिक्स तयार करण्यासाठी अपुरा ऑपरेशनल डेटा.", processing: "लाइव्ह डेटाबेस रेकॉर्ड गोळा करत आहे..." },
        gu: { lang: "ગુજરાતી", help: "મદદ કેન્દ્ર", back: "ઓપરેશન્સ પોર્ટલ પર પાછા ફરો", title: "પ્રદર્શન વિશ્લેષણ", sub: "મ્યુનિસિપલ કાર્યક્ષમતા, વિભાગીય વર્કલોડ અને એકંદર ઠરાવ દરો દર્શાવતા લાઈવ ઓપરેશનલ ડેટા.", total: "કુલ ઘટનાઓ", resolved: "ઉકેલાયેલ", eff: "કાર્યક્ષમતા દર", workload: "વર્કલોડ પ્રગતિ", concluded: "પૂર્ણ", dpt: "વિભાગીય વિશ્લેષણ", no_data: "વિભાગીય મેટ્રિક્સ બનાવવા માટે અપૂરતો ડેટા.", processing: "લાઈવ ડેટાબેઝ રેકોર્ડ્સ એકત્રિત કરવામાં આવી રહ્યા છે..." },
        te: { lang: "తెలుగు", help: "సహాయ కేంద్రం", back: "ఆపరేషన్స్ పోర్టల్‌కు తిరిగి వెళ్లండి", title: "పనితీరు విశ్లేషణ", sub: "మున్సిపల్ సామర్థ్యం, శాఖల పనిభారం మరియు మొత్తం రిజల్యూషన్ రేట్లను ప్రతిబింబించే లైవ్ ఆపరేషనల్ డేటా.", total: "మొత్తం సంఘటనలు", resolved: "పరిష్కరించబడింది", eff: "సమర్థత రేటు", workload: "పనిభారం పురోగతి", concluded: "ముగిసింది", dpt: "డిపార్ట్‌మెంటల్ విశ్లేషణ", no_data: "డిపార్ట్‌మెంటల్ కొలమానాలను రూపొందించడానికి తగినంత డేటా లేదు.", processing: "లైవ్ డేటాబేస్ రికార్డులను సేకరిస్తోంది..." },
        ta: { lang: "தமிழ்", help: "உதவி மையம்", back: "ஆபரேஷன் போர்ட்டலுக்குத் திரும்பு", title: "செயல்திறன் பகுப்பாய்வு", sub: "நகராட்சி செயல்திறன், துறை சார்ந்த பணிச்சுமை மற்றும் ஒட்டுமொத்த தீர்மான விகிதங்களை பிரதிபலிக்கும் நேரலை தரவு.", total: "மொத்த சம்பவங்கள்", resolved: "தீர்க்கப்பட்டது", eff: "செயல்திறன் விகிதம்", workload: "பணிச்சுமை முன்னேற்றம்", concluded: "முடிந்தது", dpt: "துறை பகுப்பாய்வு", no_data: "துறை அளவீடுகளை உருவாக்க போதுமான தரவு இல்லை.", processing: "நேரலை தரவுத்தள பதிவுகள் சேகரிக்கப்படுகின்றன..." },
        pa: { lang: "ਪੰਜਾਬੀ", help: "ਸਹਾਇਤਾ ਕੇਂਦਰ", back: "ਓਪਰੇਸ਼ਨ ਪੋਰਟਲ 'ਤੇ ਵਾਪਸ ਜਾਓ", title: "ਪ੍ਰਦਰਸ਼ਨ ਵਿਸ਼ਲੇਸ਼ਣ", sub: "ਮਿਊਂਸੀਪਲ ਕੁਸ਼ਲਤਾ, ਵਿਭਾਗੀ ਕੰਮ ਦੇ ਬੋਝ ਅਤੇ ਸਮੁੱਚੀ ਰੈਜ਼ੋਲਿਊਸ਼ਨ ਦਰਾਂ ਨੂੰ ਦਰਸਾਉਂਦਾ ਲਾਈਵ ਸੰਚਾਲਨ ਡੇਟਾ।", total: "ਕੁੱਲ ਘਟਨਾਵਾਂ", resolved: "ਹੱਲ ਕੀਤਾ ਗਿਆ", eff: "ਕੁਸ਼ਲਤਾ ਦਰ", workload: "ਕੰਮ ਦੇ ਬੋਝ ਦੀ ਪ੍ਰਗਤੀ", concluded: "ਸਮਾਪਤ", dpt: "ਵਿਭਾਗੀ ਵਿਸ਼ਲੇਸ਼ਣ", no_data: "ਵਿਭਾਗੀ ਮੈਟ੍ਰਿਕਸ ਬਣਾਉਣ ਲਈ ਨਾਕਾਫ਼ੀ ਡੇਟਾ।", processing: "ਲਾਈਵ ਡੇਟਾਬੇਸ ਰਿਕਾਰਡ ਇਕੱਠੇ ਕੀਤੇ ਜਾ ਰਹੇ ਹਨ..." },
        bho: { lang: "भोजपुरी", help: "मदद केंद्र", back: "ऑपरेशंस पोर्टल पर वापस जाईं", title: "प्रदर्शन विश्लेषण", sub: "नगर निगम दक्षता, विभागीय कार्यभार आ समग्र समाधान दर के दर्शावे वाला लाइव परिचालन डेटा।", total: "कुल घटना", resolved: "समाधान", eff: "दक्षता दर", workload: "कार्यभार प्रगति", concluded: "संपन्न", dpt: "विभागीय विश्लेषण", no_data: "विभागीय मेट्रिक्स बनावे खातिर अपर्याप्त परिचालन डेटा।", processing: "लाइव डेटाबेस रिकॉर्ड जमा कइल जा रहल बा..." },
        ar: { lang: "العربية", help: "مركز المساعدة", back: "العودة إلى بوابة العمليات", title: "تحليلات الأداء", sub: "بيانات تشغيلية حية تعكس كفاءة البلدية وأعباء عمل الأقسام ومعدلات الحل الإجمالية.", total: "إجمالي الحوادث", resolved: "تم حلها", eff: "معدل الكفاءة", workload: "تقدم عبء العمل", concluded: "مكتمل", dpt: "تحليل الأقسام", no_data: "بيانات تشغيلية غير كافية لإنشاء مقاييس القسم.", processing: "يتم تجميع سجلات قاعدة البيانات المباشرة..." },
        es: { lang: "Español", help: "Centro de ayuda", back: "Volver al Portal de Operaciones", title: "Análisis de Rendimiento", sub: "Datos operativos en vivo que reflejan la eficiencia municipal, cargas de trabajo departamentales y tasas de resolución generales.", total: "Total Incidentes", resolved: "Resueltos", eff: "Tasa de Eficiencia", workload: "Progreso de Carga de Trabajo", concluded: "Concluido", dpt: "Análisis Departamental", no_data: "Datos operativos insuficientes para generar métricas departamentales.", processing: "Agregando registros de base de datos en vivo..." },
        fr: { lang: "Français", help: "Centre d'aide", back: "Retour au Portail des Opérations", title: "Analyse de Performance", sub: "Données opérationnelles en direct reflétant l'efficacité municipale, les charges de travail départementales et les taux de résolution globaux.", total: "Total Incidents", resolved: "Résolu", eff: "Taux d'Efficacité", workload: "Progression de la Charge", concluded: "Conclu", dpt: "Analyse Départementale", no_data: "Données opérationnelles insuffisantes pour générer des métriques départementales.", processing: "Agrégation des enregistrements en direct..." },
        de: { lang: "Deutsch", help: "Hilfezentrum", back: "Zurück zum Operationsportal", title: "Leistungsanalyse", sub: "Live-Betriebsdaten, die die kommunale Effizienz, Abteilungsarbeitslasten und allgemeine Lösungsraten widerspiegeln.", total: "Gesamtvorfälle", resolved: "Gelöst", eff: "Effizienzrate", workload: "Arbeitsbelastungsfortschritt", concluded: "Abgeschlossen", dpt: "Abteilungsanalyse", no_data: "Unzureichende Betriebsdaten zur Erstellung von Abteilungsmetriken.", processing: "Live-Datenbankdatensätze werden aggregiert..." }
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

    return (
        <div className={`min-h-screen font-sans overflow-x-hidden pt-24 pb-12 transition-colors duration-300 ${
            theme === 'light' ? 'bg-[#f5f5f5] text-[#111111] selection:bg-black selection:text-white' : 'bg-[#050505] text-white selection:bg-white selection:text-black'
        }`}>
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } } .animate-fade { animation: fadeIn 0.8s ease-out forwards; }`}</style>
            
            <header className="fixed top-0 left-0 right-0 w-full flex items-center justify-between px-6 md:px-12 py-6 animate-fade z-50 transition-colors">
                <div className="flex items-center gap-2">
                    <img src={theme === 'light' ? '/logo-3.png' : '/logo.png'} alt="Movyra" className="h-8 w-auto" />
                    <span className="font-black text-[1.5rem] tracking-tighter ml-[-5px]">ovyra <span className={`${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'} font-medium text-[1.2rem] ml-1`}>Civic</span></span>
                </div>
                <div className="flex items-center gap-6 text-[0.9rem] font-bold">
                    <button onClick={() => setShowLangPrompt(true)} className={theme === 'light' ? 'text-[#555555] hover:text-black' : 'text-[#888888] hover:text-white'}>{currentT.lang}</button>
                    <button onClick={toggleTheme} className={`p-2 rounded-full ${theme === 'light' ? 'bg-[#e0e0e0]' : 'bg-[#222222]'}`}>{theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}</button>
                    <button onClick={() => navigate('/')} className={`px-5 py-2 rounded-full border ${theme === 'light' ? 'bg-white border-[#cccccc]' : 'bg-[#111111] border-[#333333]'}`}>Home</button>
                </div>
            </header>

            <div className="max-w-[1200px] mx-auto px-6 md:px-12">
                <button onClick={() => navigate('/civic')} className={`flex items-center gap-2 mb-10 font-bold text-[0.9rem] ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}><ArrowLeft size={16} /> {currentT.back}</button>

                <motion.div initial="hidden" animate="visible" variants={containerVariants} className="mb-12">
                    <motion.h1 variants={itemVariants} className="text-[2.5rem] md:text-[3.5rem] font-black leading-[1.1] tracking-tighter mb-4">{currentT.title}</motion.h1>
                    <motion.p variants={itemVariants} className={`text-[1.1rem] max-w-[700px] ${theme === 'light' ? 'text-[#555555]' : 'text-[#aaaaaa]'}`}>{currentT.sub}</motion.p>
                </motion.div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20"><div className={`w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mb-4 ${theme === 'light' ? 'border-black' : 'border-white'}`}></div><p className="text-[#888888] font-bold">{currentT.processing}</p></div>
                ) : (
                    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            {[ { label: currentT.total, val: performanceMetrics.totalVolume, icon: BarChart }, { label: currentT.resolved, val: performanceMetrics.resolvedVolume, icon: CheckCircle }, { label: currentT.eff, val: `${performanceMetrics.overallResolutionRate}%`, icon: TrendingUp } ].map((stat, i) => (
                                <motion.div key={i} variants={itemVariants} className={`rounded-2xl p-8 border ${theme === 'light' ? 'bg-white border-[#e0e0e0]' : 'bg-[#111111] border-[#333333]'}`}>
                                    <div className="flex items-center justify-between mb-4"><h3 className={`font-bold text-[0.9rem] uppercase tracking-wider ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{stat.label}</h3><stat.icon size={20} /></div>
                                    <div className="text-[3rem] font-black leading-none mb-2">{stat.val}</div>
                                </motion.div>
                            ))}
                        </div>

                        <motion.h2 variants={itemVariants} className="text-[1.5rem] font-black mb-6">{currentT.dpt}</motion.h2>
                        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Object.entries(performanceMetrics.departmentStats).map(([dept, stats]) => {
                                const rate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;
                                return (
                                    <div key={dept} className={`rounded-2xl p-6 border ${theme === 'light' ? 'bg-white border-[#e0e0e0]' : 'bg-[#111111] border-[#333333]'}`}>
                                        <div className="flex items-center justify-between mb-6"><h3 className="font-black text-[1.1rem]">{dept}</h3><span className={`px-3 py-1 rounded-full text-[0.75rem] font-black ${theme === 'light' ? 'bg-[#f0f0f0]' : 'bg-[#222222]'}`}>{rate}% Resolution</span></div>
                                        <div className="flex items-center justify-between text-[0.9rem] font-bold mb-2"><span>{currentT.workload}</span><span>{stats.resolved} / {stats.total} {currentT.concluded}</span></div>
                                        <div className={`w-full rounded-full h-3 overflow-hidden ${theme === 'light' ? 'bg-[#e0e0e0]' : 'bg-[#222222]'}`}><div className={`h-full rounded-full ${theme === 'light' ? 'bg-black' : 'bg-white'}`} style={{ width: `${rate}%` }}></div></div>
                                    </div>
                                );
                            })}
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}