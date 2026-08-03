import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ChevronRight, X, Calendar, Clock, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

export default function Alerts() {
    const [lang, setLang] = useState('en');
    const [activeTab, setActiveTab] = useState('all');
    const [alerts, setAlerts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAlert, setSelectedAlert] = useState(null);

    // Language Synchronization
    useEffect(() => {
        const savedLang = localStorage.getItem('nagrik_lang') || navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'hinglish', 'mr', 'gu', 'te', 'ta', 'kn', 'ml', 'bn', 'pa', 'or', 'as', 'ur', 'bho'];
        if (supported.includes(savedLang)) setLang(savedLang);

        const handleStorageChange = () => {
            const newLang = localStorage.getItem('nagrik_lang');
            if (newLang && supported.includes(newLang)) setLang(newLang);
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // 15 Comprehensive Indian Language Translations
    const t = {
        en: { title: "Alerts", tab_all: "All alerts", tab_my: "My alerts", status_active: "Active", status_move: "On Move", status_clear: "All Clear", loc_title: "Incident location", hist_title: "Status History", no_data: "No reports found.", loading: "Loading updates...", time_ago: "ago", msg_submitted: "Report received and under review.", msg_working: "Team has been notified and is responding.", msg_resolved: "Issue resolved. Thank you for your support." },
        hi: { title: "अलर्ट", tab_all: "सभी अलर्ट", tab_my: "मेरे अलर्ट", status_active: "सक्रिय", status_move: "प्रगति पर", status_clear: "समाधान हो गया", loc_title: "घटना स्थल", hist_title: "स्थिति इतिहास", no_data: "कोई रिपोर्ट नहीं मिली।", loading: "अपडेट लोड हो रहे हैं...", time_ago: "पहले", msg_submitted: "रिपोर्ट प्राप्त हुई और समीक्षाधीन है।", msg_working: "टीम को सूचित कर दिया गया है और काम जारी है।", msg_resolved: "समस्या का समाधान हो गया है। आपके सहयोग के लिए धन्यवाद।" },
        hinglish: { title: "Alerts", tab_all: "Sabhi alerts", tab_my: "Mere alerts", status_active: "Active", status_move: "Kaam chalu hai", status_clear: "Solve ho gaya", loc_title: "Incident location", hist_title: "Status History", no_data: "Koi report nahi mili.", loading: "Updates load ho rahe hain...", time_ago: "pehle", msg_submitted: "Report mil gayi hai aur check ho rahi hai.", msg_working: "Team ko bata diya gaya hai aur action liya ja raha hai.", msg_resolved: "Problem solve ho gayi hai. Support ke liye shukriya." },
        mr: { title: "सूचना", tab_all: "सर्व सूचना", tab_my: "माझ्या सूचना", status_active: "सक्रिय", status_move: "प्रगतीपथावर", status_clear: "निराकरण झाले", loc_title: "घटनेचे ठिकाण", hist_title: "स्थिती इतिहास", no_data: "कोणताही अहवाल आढळला नाही.", loading: "अपडेट्स लोड होत आहेत...", time_ago: "पूर्वी", msg_submitted: "अहवाल प्राप्त झाला आणि पुनरावलोकनाखाली आहे.", msg_working: "संघाला सूचित केले आहे आणि काम सुरू आहे.", msg_resolved: "समस्या सुटली. तुमच्या सहकार्याबद्दल धन्यवाद." },
        gu: { title: "એલર્ટ", tab_all: "તમામ એલર્ટ", tab_my: "મારા એલર્ટ", status_active: "સક્રિય", status_move: "પ્રગતિમાં", status_clear: "ઉકેલ આવી ગયો", loc_title: "ઘટના સ્થળ", hist_title: "સ્થિતિ ઇતિહાસ", no_data: "કોઈ રિપોર્ટ મળ્યો નથી.", loading: "અપડેટ્સ લોડ થઈ રહ્યા છે...", time_ago: "પહેલાં", msg_submitted: "રિપોર્ટ પ્રાપ્ત થયો અને સમીક્ષા હેઠળ છે.", msg_working: "ટીમને જાણ કરવામાં આવી છે અને કામ ચાલુ છે.", msg_resolved: "સમસ્યા હલ થઈ ગઈ. તમારા સહકાર બદલ આભાર." },
        te: { title: "అలర్ట్స్", tab_all: "అన్ని అలర్ట్స్", tab_my: "నా అలర్ట్స్", status_active: "క్రియాశీల", status_move: "పురోగతిలో", status_clear: "పరిష్కరించబడింది", loc_title: "సంఘటన స్థలం", hist_title: "స్థితి చరిత్ర", no_data: "ఎటువంటి నివేదిక కనుగొనబడలేదు.", loading: "నవీకరణలు లోడ్ అవుతున్నాయి...", time_ago: "క్రితం", msg_submitted: "నివేదిక స్వీకరించబడింది మరియు సమీక్షలో ఉంది.", msg_working: "బృందానికి తెలియజేయబడింది మరియు పని జరుగుతోంది.", msg_resolved: "సమస్య పరిష్కరించబడింది. మీ మద్దతుకు ధన్యవాదాలు." },
        ta: { title: "அலர்ட்ஸ்", tab_all: "அனைத்து அலர்ட்ஸ்", tab_my: "எனது அலர்ட்ஸ்", status_active: "செயலில்", status_move: "செயல்பாட்டில்", status_clear: "தீர்க்கப்பட்டது", loc_title: "சம்பவ இடம்", hist_title: "நிலை வரலாறு", no_data: "எந்த அறிக்கையும் காணப்படவில்லை.", loading: "புதுப்பிப்புகள் ஏற்றப்படுகின்றன...", time_ago: "முன்பு", msg_submitted: "அறிக்கை பெறப்பட்டு மதிப்பாய்வில் உள்ளது.", msg_working: "குழுவிற்கு தெரிவிக்கப்பட்டு நடவடிக்கை எடுக்கப்படுகிறது.", msg_resolved: "பிரச்சனை தீர்க்கப்பட்டது. உங்கள் ஆதரவிற்கு நன்றி." },
        kn: { title: "ಅಲರ್ಟ್ಸ್", tab_all: "ಎಲ್ಲಾ ಅಲರ್ಟ್ಸ್", tab_my: "ನನ್ನ ಅಲರ್ಟ್ಸ್", status_active: "ಸಕ್ರಿಯ", status_move: "ಪ್ರಗತಿಯಲ್ಲಿದೆ", status_clear: "ಬಗೆಹರಿಸಲಾಗಿದೆ", loc_title: "ಘಟನಾ ಸ್ಥಳ", hist_title: "ಸ್ಥಿತಿ ಇತಿಹಾಸ", no_data: "ಯಾವುದೇ ವರದಿ ಕಂಡುಬಂದಿಲ್ಲ.", loading: "ನವೀಕರಣಗಳು ಲೋಡ್ ಆಗುತ್ತಿವೆ...", time_ago: "ಹಿಂದೆ", msg_submitted: "ವರದಿ ಸ್ವೀಕರಿಸಲಾಗಿದೆ ಮತ್ತು ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ.", msg_working: "ತಂಡಕ್ಕೆ ತಿಳಿಸಲಾಗಿದೆ ಮತ್ತು ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿದೆ.", msg_resolved: "ಸಮಸ್ಯೆ ಬಗೆಹರಿಸಲಾಗಿದೆ. ನಿಮ್ಮ ಬೆಂಬಲಕ್ಕೆ ಧನ್ಯವಾದಗಳು." },
        ml: { title: "അലർട്ടുകൾ", tab_all: "എല്ലാ അലർട്ടുകളും", tab_my: "എൻ്റെ അലർട്ടുകൾ", status_active: "സജീവം", status_move: "പുരോഗമിക്കുന്നു", status_clear: "പരിഹരിച്ചു", loc_title: "സംഭവ സ്ഥലം", hist_title: "സ്റ്റാറ്റസ് ചരിത്രം", no_data: "റിപ്പോർട്ടുകളൊന്നും കണ്ടെത്തിയില്ല.", loading: "അപ്ഡേറ്റുകൾ ലോഡ് ചെയ്യുന്നു...", time_ago: "മുമ്പ്", msg_submitted: "റിപ്പോർട്ട് ലഭിച്ചു, അവലോകനത്തിലാണ്.", msg_working: "ടീമിനെ അറിയിച്ചു, നടപടിയെടുക്കുന്നു.", msg_resolved: "പ്രശ്നം പരിഹരിച്ചു. നിങ്ങളുടെ പിന്തുണയ്ക്ക് നന്ദി." },
        bn: { title: "অ্যালার্ট", tab_all: "সব অ্যালার্ট", tab_my: "আমার অ্যালার্ট", status_active: "সক্রিয়", status_move: "চলমান", status_clear: "সমাধান হয়েছে", loc_title: "ঘটনার স্থান", hist_title: "স্ট্যাটাস ইতিহাস", no_data: "কোনো রিপোর্ট পাওয়া যায়নি।", loading: "আপডেট লোড হচ্ছে...", time_ago: "আগে", msg_submitted: "রিপোর্ট প্রাপ্ত হয়েছে এবং পর্যালোচনাধীন।", msg_working: "টিমকে জানানো হয়েছে এবং কাজ চলছে।", msg_resolved: "সমস্যা সমাধান হয়েছে। আপনার সহায়তার জন্য ধন্যবাদ।" },
        pa: { title: "ਅਲਰਟ", tab_all: "ਸਾਰੇ ਅਲਰਟ", tab_my: "ਮੇਰੇ ਅਲਰਟ", status_active: "ਸਰਗਰਮ", status_move: "ਚੱਲ ਰਿਹਾ ਹੈ", status_clear: "ਹੱਲ ਹੋ ਗਿਆ", loc_title: "ਘਟਨਾ ਸਥਾਨ", hist_title: "ਸਥਿਤੀ ਇਤਿਹਾਸ", no_data: "ਕੋਈ ਰਿਪੋਰਟ ਨਹੀਂ ਮਿਲੀ।", loading: "ਅਪਡੇਟ ਲੋਡ ਹੋ ਰਹੇ ਹਨ...", time_ago: "ਪਹਿਲਾਂ", msg_submitted: "ਰਿਪੋਰਟ ਪ੍ਰਾਪਤ ਹੋਈ ਅਤੇ ਸਮੀਖਿਆ ਅਧੀਨ ਹੈ।", msg_working: "ਟੀਮ ਨੂੰ ਸੂਚਿਤ ਕਰ ਦਿੱਤਾ ਗਿਆ ਹੈ ਅਤੇ ਕਾਰਵਾਈ ਜਾਰੀ ਹੈ।", msg_resolved: "ਸਮੱਸਿਆ ਹੱਲ ਹੋ ਗਈ। ਤੁਹਾਡੇ ਸਹਿਯੋਗ ਲਈ ਧੰਨਵਾਦ।" },
        or: { title: "ଆଲର୍ଟ", tab_all: "ସମସ୍ତ ଆଲର୍ଟ", tab_my: "ମୋର ଆଲର୍ଟ", status_active: "ସକ୍ରିୟ", status_move: "ପ୍ରଗତିରେ", status_clear: "ସମାଧାନ ହୋଇଛି", loc_title: "ଘଟଣା ସ୍ଥଳ", hist_title: "ସ୍ଥିତି ଇତିହାସ", no_data: "କୌଣସି ରିପୋର୍ଟ ମିଳିଲା ନାହିଁ।", loading: "ଅପଡେଟ୍ ଲୋଡ୍ ହେଉଛି...", time_ago: "ପୂର୍ବେ", msg_submitted: "ରିପୋର୍ଟ ଗ୍ରହଣ କରାଯାଇଛି ଏବଂ ସମୀକ୍ଷାଧୀନ ଅଛି।", msg_working: "ଟିମ୍ କୁ ସୂଚିତ କରାଯାଇଛି ଏବଂ କାର୍ଯ୍ୟ ଜାରି ରହିଛି।", msg_resolved: "ସମସ୍ୟାର ସମାଧାନ ହୋଇଛି। ଆପଣଙ୍କ ସମର୍ଥନ ପାଇଁ ଧନ୍ୟବାଦ।" },
        as: { title: "এলাৰ্ট", tab_all: "সকলো এলাৰ্ট", tab_my: "মোৰ এলাৰ্ট", status_active: "সক্ৰিয়", status_move: "প্ৰগতিশীল", status_clear: "সমাধান হ'ল", loc_title: "ঘটনাৰ স্থান", hist_title: "স্থিতি ইতিহাস", no_data: "কোনো প্ৰতিবেদন পোৱা নগ'ল।", loading: "আপডেট ল'ড হৈ আছে...", time_ago: "আগতে", msg_submitted: "প্ৰতিবেদন গ্ৰহণ কৰা হৈছে আৰু পৰ্যালোচনাৰ অধীনত আছে।", msg_working: "দলটোক অৱগত কৰা হৈছে আৰু কাম চলি আছে।", msg_resolved: "সমস্যাৰ সমাধান হ'ল। আপোনাৰ সহায়ৰ বাবে ধন্যবাদ।" },
        ur: { title: "الرٹس", tab_all: "تمام الرٹس", tab_my: "میرے الرٹس", status_active: "فعال", status_move: "جاری ہے", status_clear: "حل ہو گیا", loc_title: "واقعے کا مقام", hist_title: "حیثیت کی تاریخ", no_data: "کوئی رپورٹ نہیں ملی۔", loading: "اپ ڈیٹس لوڈ ہو رہے ہیں۔۔۔", time_ago: "پہلے", msg_submitted: "رپورٹ موصول ہو گئی ہے اور زیر غور ہے۔", msg_working: "ٹیم کو مطلع کر دیا گیا ہے اور کارروائی جاری ہے۔", msg_resolved: "مسئلہ حل ہو گیا۔ آپ کے تعاون کا شکریہ۔" },
        bho: { title: "अलर्ट", tab_all: "सभ अलर्ट", tab_my: "हमार अलर्ट", status_active: "सक्रिय", status_move: "काम चालू बा", status_clear: "हल हो गइल", loc_title: "घटना के जगह", hist_title: "स्थिति के इतिहास", no_data: "कवनो रिपोर्ट ना मिलल।", loading: "अपडेट लोड हो रहल बा...", time_ago: "पहिले", msg_submitted: "रिपोर्ट मिल गइल बा आ जाँच हो रहल बा।", msg_working: "टीम के बता दिहल गइल बा आ काम चालू बा।", msg_resolved: "समस्या हल हो गइल। राउर मदद खातिर धन्यवाद।" }
    };

    const currentT = t[lang] || t['en'];

    // Real-time Database Subscription
    useEffect(() => {
        setIsLoading(true);
        const reportsRef = collection(db, 'nagrik_reports');
        let q;

        if (activeTab === 'my') {
            const currentUserId = auth.currentUser?.uid || 'guest';
            q = query(reportsRef, where('reporterId', '==', currentUserId), orderBy('createdAt', 'desc'));
        } else {
            q = query(reportsRef, orderBy('createdAt', 'desc'));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedAlerts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setAlerts(fetchedAlerts);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching reports:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [activeTab]);

    // Utility: Format Time Ago
    const getTimeAgo = (timestamp) => {
        if (!timestamp) return `Just now`;
        const seconds = Math.floor((new Date() - timestamp.toDate()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years " + currentT.time_ago;
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months " + currentT.time_ago;
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days " + currentT.time_ago;
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours " + currentT.time_ago;
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes " + currentT.time_ago;
        return Math.floor(seconds) + " seconds " + currentT.time_ago;
    };

    // Utility: Status Styling Configuration
    const getStatusConfig = (status) => {
        switch (status) {
            case 'Resolved':
                return { label: currentT.status_clear, bg: 'bg-[#E8F5E9]', text: 'text-[#2E7D32]', border: 'border-[#A5D6A7]', message: currentT.msg_resolved };
            case 'Working':
            case 'Assigned':
                return { label: currentT.status_move, bg: 'bg-[#FFF8E1]', text: 'text-[#F57F17]', border: 'border-[#FFE082]', message: currentT.msg_working };
            default:
                return { label: currentT.status_active, bg: 'bg-[#FFEBEE]', text: 'text-[#D32F2F]', border: 'border-[#EF9A9A]', message: currentT.msg_submitted };
        }
    };

    // Utility: Category Icon Configuration
    const getCategoryIcon = (category) => {
        if (category.toLowerCase().includes('traffic') || category.toLowerCase().includes('accident')) return <AlertTriangle size={18} className="text-[#D32F2F]" />;
        if (category.toLowerCase().includes('emergency')) return <Activity size={18} className="text-[#D32F2F]" />;
        if (category.toLowerCase().includes('resolved')) return <CheckCircle size={18} className="text-[#2E7D32]" />;
        return <AlertTriangle size={18} className="text-[#D32F2F]" />;
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans pb-32">
            
            {/* Header */}
            <div className="bg-white pt-12 pb-4 px-6 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] sticky top-0 z-40 border-b border-[#E0E0E0]">
                <div className="max-w-[500px] mx-auto flex items-center justify-between">
                    <h1 className="text-[1.8rem] font-black text-[#111111] tracking-tight">{currentT.title}</h1>
                    <div className="w-10 h-10 rounded-full bg-[#FAFAFA] border border-[#E0E0E0] flex items-center justify-center">
                        <MapPin size={18} className="text-[#111111]" />
                    </div>
                </div>
                
                {/* Tab Switcher */}
                <div className="max-w-[500px] mx-auto mt-6 bg-[#FAFAFA] rounded-full p-1 border border-[#E0E0E0] flex">
                    <button 
                        onClick={() => setActiveTab('all')}
                        className={`flex-1 py-2.5 rounded-full text-[0.85rem] font-bold transition-all outline-none ${activeTab === 'all' ? 'bg-[#00897B] text-white shadow-md' : 'text-[#555555] hover:text-[#111111]'}`}
                    >
                        {currentT.tab_all}
                    </button>
                    <button 
                        onClick={() => setActiveTab('my')}
                        className={`flex-1 py-2.5 rounded-full text-[0.85rem] font-bold transition-all outline-none ${activeTab === 'my' ? 'bg-[#D32F2F] text-white shadow-md' : 'text-[#555555] hover:text-[#111111]'}`}
                    >
                        {currentT.tab_my}
                    </button>
                </div>
            </div>

            {/* Feed List */}
            <div className="max-w-[500px] mx-auto px-4 pt-6 flex flex-col gap-4 relative z-10">
                {isLoading ? (
                    <div className="text-center py-10 text-[#888888] font-bold text-[0.9rem] flex flex-col items-center justify-center">
                        <div className="w-6 h-6 border-2 border-t-transparent border-[#00897B] rounded-full animate-spin mb-3"></div>
                        {currentT.loading}
                    </div>
                ) : alerts.length === 0 ? (
                    <div className="text-center py-10 text-[#888888] font-bold text-[0.9rem]">
                        {currentT.no_data}
                    </div>
                ) : (
                    alerts.map((alert) => {
                        const statusConfig = getStatusConfig(alert.status);
                        const timeAgo = getTimeAgo(alert.createdAt);
                        const displayCategory = alert.category.replace('emergency_', '').replace(/_/g, ' ').toUpperCase();

                        return (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={alert.id}
                                onClick={() => setSelectedAlert(alert)}
                                className="bg-white rounded-[24px] p-5 shadow-[0_4px_15px_-5px_rgba(0,0,0,0.05)] border border-[#E0E0E0] cursor-pointer hover:shadow-md transition-shadow outline-none flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-[#FAFAFA] border border-[#E0E0E0] flex items-center justify-center shrink-0">
                                        {getCategoryIcon(alert.category)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[0.95rem] font-black text-[#111111] tracking-tight">{displayCategory}</span>
                                        <div className="flex items-center gap-1.5 text-[#888888] mt-0.5">
                                            <Clock size={12} />
                                            <span className="text-[0.75rem] font-bold">{timeAgo}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-[0.75rem] font-bold px-3 py-1.5 rounded-full ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border`}>
                                        {statusConfig.label}
                                    </span>
                                    <ChevronRight size={16} className="text-[#cccccc]" />
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Detail Tracking Modal */}
            <AnimatePresence>
                {selectedAlert && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-6"
                    >
                        <motion.div 
                            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white w-full max-w-[500px] h-[85vh] sm:h-auto sm:max-h-[85vh] rounded-t-[32px] sm:rounded-[32px] overflow-hidden flex flex-col relative"
                        >
                            <div className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-md rounded-full p-2 cursor-pointer shadow-sm border border-[#E0E0E0]" onClick={() => setSelectedAlert(null)}>
                                <X size={20} className="text-[#111111]" />
                            </div>

                            {/* Evidence Image */}
                            <div className="w-full h-[220px] bg-[#FAFAFA] relative">
                                {selectedAlert.evidenceUrl ? (
                                    <img src={selectedAlert.evidenceUrl} alt="Evidence" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[#888888] font-bold text-[0.8rem] flex-col gap-2">
                                        <AlertTriangle size={32} className="text-[#cccccc]" />
                                        No Image Provided
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <h2 className="absolute bottom-4 left-6 text-white font-black text-[1.5rem] tracking-tight">
                                    {selectedAlert.category.replace('emergency_', '').replace(/_/g, ' ').toUpperCase()}
                                </h2>
                            </div>

                            {/* Details Content */}
                            <div className="p-6 flex-1 overflow-y-auto">
                                
                                {/* Location */}
                                <div className="mb-8">
                                    <h3 className="text-[0.8rem] font-bold text-[#888888] uppercase tracking-wider mb-2">{currentT.loc_title}</h3>
                                    <div className="flex items-start gap-3 bg-[#FAFAFA] border border-[#E0E0E0] p-4 rounded-2xl">
                                        <MapPin size={18} className="text-[#D32F2F] shrink-0 mt-0.5" />
                                        <p className="text-[0.95rem] font-bold text-[#111111] leading-tight">
                                            {selectedAlert.address}
                                        </p>
                                    </div>
                                    <div className="mt-4">
                                        <p className="text-[0.9rem] font-medium text-[#555555] leading-relaxed">
                                            {selectedAlert.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Status Timeline */}
                                <div>
                                    <h3 className="text-[0.8rem] font-bold text-[#888888] uppercase tracking-wider mb-4">{currentT.hist_title}</h3>
                                    <div className="relative pl-4 border-l-2 border-[#E0E0E0] flex flex-col gap-6 ml-2">
                                        
                                        {/* Current Live Status Node */}
                                        <div className="relative">
                                            <div className="absolute -left-[23px] top-1 w-4 h-4 rounded-full bg-white border-[4px] border-[#00897B]"></div>
                                            <div className="bg-white border border-[#E0E0E0] rounded-2xl p-4 shadow-sm">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`text-[0.7rem] font-bold px-2 py-1 rounded-md ${getStatusConfig(selectedAlert.status).bg} ${getStatusConfig(selectedAlert.status).text}`}>
                                                        {getStatusConfig(selectedAlert.status).label}
                                                    </span>
                                                    <span className="text-[0.75rem] font-bold text-[#888888] flex items-center gap-1">
                                                        <Calendar size={12} /> {selectedAlert.createdAt?.toDate().toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-[0.85rem] font-medium text-[#555555] leading-relaxed">
                                                    {getStatusConfig(selectedAlert.status).message}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Initial Submission Node */}
                                        <div className="relative">
                                            <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-[#cccccc]"></div>
                                            <div className="pl-2">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[0.75rem] font-bold text-[#111111]">Report Created</span>
                                                    <span className="text-[0.75rem] font-bold text-[#888888]">
                                                        {selectedAlert.createdAt?.toDate().toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-[0.8rem] font-medium text-[#888888]">
                                                    System registered the incident successfully.
                                                </p>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}