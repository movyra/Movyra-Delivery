import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, MapPin, X, CheckCircle, ChevronLeft } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

export default function SOS() {
    const navigate = useNavigate();
    const [lang, setLang] = useState('en');
    
    // Geolocation State
    const [coords, setCoords] = useState(null);
    const [address, setAddress] = useState('');
    const [isLocating, setIsLocating] = useState(true);
    
    // Broadcast State
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [hasBroadcasted, setHasBroadcasted] = useState(false);
    const [countdown, setCountdown] = useState(3);
    const timerRef = useRef(null);

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

    // Real-Time GPS Tracking
    useEffect(() => {
        if (!("geolocation" in navigator)) {
            setAddress("Location services not available.");
            setIsLocating(false);
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                setCoords([lat, lon]);
                
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                    const data = await response.json();
                    setAddress(data.display_name || "Location identified");
                } catch (error) {
                    setAddress("GPS Coordinates acquired. Exact address unavailable.");
                } finally {
                    setIsLocating(false);
                }
            },
            (error) => {
                setAddress("Location access denied. Please enable GPS.");
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    // 15 Comprehensive Indian Language Translations
    const t = {
        en: { title: "Emergency SOS", desc: "Instantly alert local authorities and nearby citizens.", btn: "Tap to Send Alert", cancel: "Cancel Alert", loc: "Your Live Location", fetching: "Locating...", active: "Alert Active", sent: "Help is on the way. Your location is being tracked.", sending: "Broadcasting in" },
        hi: { title: "आपातकालीन एसओएस", desc: "स्थानीय अधिकारियों और नागरिकों को तुरंत अलर्ट करें।", btn: "अलर्ट भेजने के लिए टैप करें", cancel: "अलर्ट रद्द करें", loc: "आपका वर्तमान स्थान", fetching: "स्थान खोज रहे हैं...", active: "अलर्ट सक्रिय", sent: "मदद रास्ते में है। आपके स्थान को ट्रैक किया जा रहा है।", sending: "प्रसारण शुरू होगा" },
        hinglish: { title: "Emergency SOS", desc: "Authorities aur citizens ko turant alert karein.", btn: "Alert bhejne ke liye tap karein", cancel: "Alert Cancel Karein", loc: "Aapki Live Location", fetching: "Locate kar rahe hain...", active: "Alert Active", sent: "Help aa rahi hai. Location track ho rahi hai.", sending: "Broadcast in" },
        mr: { title: "आणीबाणी एसओएस", desc: "स्थानिक अधिकारी आणि नागरिकांना त्वरित सतर्क करा.", btn: "अलर्ट पाठवण्यासाठी टॅप करा", cancel: "अलर्ट रद्द करा", loc: "तुमचे वर्तमान स्थान", fetching: "स्थान शोधत आहे...", active: "अलर्ट सक्रिय", sent: "मदत येत आहे. तुमच्या स्थानाचा मागोवा घेतला जात आहे.", sending: "प्रसारण सुरू होईल" },
        gu: { title: "કટોકટી એસઓએસ", desc: "સ્થાનિક સત્તાવાળાઓ અને નાગરિકોને તરત જ ચેતવણી આપો.", btn: "એલર્ટ મોકલવા માટે ટેપ કરો", cancel: "એલર્ટ રદ કરો", loc: "તમારું વર્તમાન સ્થાન", fetching: "સ્થાન શોધી રહ્યા છીએ...", active: "એલર્ટ સક્રિય", sent: "મદદ રસ્તામાં છે. તમારા સ્થાનને ટ્રેક કરવામાં આવી રહ્યું છે.", sending: "પ્રસારણ શરૂ થશે" },
        te: { title: "అత్యవసర ఎస్ఓఎస్", desc: "అధికారులను మరియు పౌరులను వెంటనే అప్రమత్తం చేయండి.", btn: "అలర్ట్ పంపడానికి నొక్కండి", cancel: "అలర్ట్ రద్దు చేయండి", loc: "మీ ప్రత్యక్ష స్థానం", fetching: "స్థానాన్ని కనుగొంటున్నాము...", active: "అలర్ట్ సక్రియం", sent: "సహాయం వస్తోంది. మీ స్థానం ట్రాక్ చేయబడుతోంది.", sending: "ప్రసారం ప్రారంభం" },
        ta: { title: "அவசர எஸ்ஓஎஸ்", desc: "அதிகாரிகள் மற்றும் குடிமக்களை உடனடியாக எச்சரிக்கவும்.", btn: "அலர்ட் அனுப்ப தட்டவும்", cancel: "அலர்ட் ரத்துசெய்", loc: "உங்கள் நேரடி இருப்பிடம்", fetching: "இருப்பிடத்தைத் தேடுகிறது...", active: "அலர்ட் செயலில் உள்ளது", sent: "உதவி வருகிறது. உங்கள் இருப்பிடம் கண்காணிக்கப்படுகிறது.", sending: "ஒளிபரப்பு தொடங்கும்" },
        kn: { title: "ತುರ್ತು ಎಸ್‌ಒಎಸ್", desc: "ಅಧಿಕಾರಿಗಳು ಮತ್ತು ನಾಗರಿಕರನ್ನು ತಕ್ಷಣ ಎಚ್ಚರಿಸಿ.", btn: "ಅಲರ್ಟ್ ಕಳುಹಿಸಲು ಟ್ಯಾಪ್ ಮಾಡಿ", cancel: "ಅಲರ್ಟ್ ರದ್ದುಗೊಳಿಸಿ", loc: "ನಿಮ್ಮ ಲೈವ್ ಸ್ಥಳ", fetching: "ಸ್ಥಳವನ್ನು ಹುಡುಕಲಾಗುತ್ತಿದೆ...", active: "ಅಲರ್ಟ್ ಸಕ್ರಿಯ", sent: "ಸಹಾಯ ಬರುತ್ತಿದೆ. ನಿಮ್ಮ ಸ್ಥಳವನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಲಾಗುತ್ತಿದೆ.", sending: "ಪ್ರಸಾರ ಪ್ರಾರಂಭ" },
        ml: { title: "അടിയന്തര എസ്ഒഎസ്", desc: "അധികാരികളെയും പൗരന്മാരെയും ഉടനടി അറിയിക്കുക.", btn: "അലർട്ട് അയക്കാൻ ടാപ്പ് ചെയ്യുക", cancel: "അലർട്ട് റദ്ദാക്കുക", loc: "നിങ്ങളുടെ ലൈവ് സ്ഥലം", fetching: "സ്ഥലം കണ്ടെത്തുന്നു...", active: "അലർട്ട് സജീവം", sent: "സഹായം വരുന്നു. നിങ്ങളുടെ സ്ഥലം ട്രാക്ക് ചെയ്യുന്നു.", sending: "സംപ്രേക്ഷണം തുടങ്ങുന്നു" },
        bn: { title: "জরুরি এসওএস", desc: "কর্তৃপক্ষ এবং নাগরিকদের অবিলম্বে সতর্ক করুন।", btn: "অ্যালার্ট পাঠাতে ট্যাপ করুন", cancel: "অ্যালার্ট বাতিল করুন", loc: "আপনার লাইভ অবস্থান", fetching: "অবস্থান খুঁজছি...", active: "অ্যালার্ট সক্রিয়", sent: "সাহায্য আসছে। আপনার অবস্থান ট্র্যাক করা হচ্ছে।", sending: "সম্প্রচার শুরু হবে" },
        pa: { title: "ਐਮਰਜੈਂਸੀ ਐਸਓਐਸ", desc: "ਅਧਿਕਾਰੀਆਂ ਅਤੇ ਨਾਗਰਿਕਾਂ ਨੂੰ ਤੁਰੰਤ ਸੁਚੇਤ ਕਰੋ।", btn: "ਅਲਰਟ ਭੇਜਣ ਲਈ ਟੈਪ ਕਰੋ", cancel: "ਅਲਰਟ ਰੱਦ ਕਰੋ", loc: "ਤੁਹਾਡਾ ਲਾਈਵ ਸਥਾਨ", fetching: "ਸਥਾਨ ਲੱਭ ਰਹੇ ਹਾਂ...", active: "ਅਲਰਟ ਸਰਗਰਮ", sent: "ਮਦਦ ਆ ਰਹੀ ਹੈ। ਤੁਹਾਡੇ ਸਥਾਨ ਨੂੰ ਟਰੈਕ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ।", sending: "ਪ੍ਰਸਾਰਣ ਸ਼ੁਰੂ ਹੋਵੇਗਾ" },
        or: { title: "ଜରୁରୀକାଳୀନ ଏସଓଏସ", desc: "ଅଧିକାରୀ ଏବଂ ନାଗରିକମାନଙ୍କୁ ତୁରନ୍ତ ସତର୍କ କରନ୍ତୁ।", btn: "ଆଲର୍ଟ ପଠାଇବାକୁ ଟ୍ୟାପ୍ କରନ୍ତୁ", cancel: "ଆଲର୍ଟ ବାତିଲ୍ କରନ୍ତୁ", loc: "ଆପଣଙ୍କ ଲାଇଭ୍ ସ୍ଥାନ", fetching: "ସ୍ଥାନ ଖୋଜୁଛୁ...", active: "ଆଲର୍ଟ ସକ୍ରିୟ", sent: "ସାହାଯ୍ୟ ଆସୁଛି। ଆପଣଙ୍କ ସ୍ଥାନ ଟ୍ରାକ୍ କରାଯାଉଛି।", sending: "ପ୍ରସାରଣ ଆରମ୍ଭ ହେବ" },
        as: { title: "জৰুৰীকালীন এছঅএছ", desc: "কৰ্তৃপক্ষ আৰু নাগৰিকসকলক লগে লগে সতৰ্ক কৰক।", btn: "এলাৰ্ট পঠিয়াবলৈ টেপ কৰক", cancel: "এলাৰ্ট বাতিল কৰক", loc: "আপোনাৰ লাইভ অৱস্থান", fetching: "অৱস্থান বিচাৰি আছোঁ...", active: "এলাৰ্ট সক্ৰিয়", sent: "সাহায্য আহি আছে। আপোনাৰ অৱস্থান ট্ৰেক কৰা হৈছে।", sending: "সম্প্ৰচাৰ আৰম্ভ হ'ব" },
        ur: { title: "ہنگامی ایس او ایس", desc: "حکام اور شہریوں کو فوری طور پر الرٹ کریں۔", btn: "الرٹ بھیجنے کے لیے ٹیپ کریں", cancel: "الرٹ منسوخ کریں", loc: "آپ کا لائیو مقام", fetching: "مقام تلاش کر رہے ہیں۔۔۔", active: "الرٹ فعال", sent: "مدد راستے میں ہے۔ آپ کے مقام کو ٹریک کیا جا رہا ہے۔", sending: "نشریات شروع ہوں گی" },
        bho: { title: "आपातकालीन एसओएस", desc: "अधिकारी आ नागरिक लोग के तुरंत अलर्ट करीं।", btn: "अलर्ट भेजे खातिर टैप करीं", cancel: "अलर्ट रद्द करीं", loc: "राउर लाइव स्थान", fetching: "स्थान खोज रहल बानी...", active: "अलर्ट सक्रिय", sent: "मदद रस्ता में बा। राउर स्थान के ट्रैक कइल जा रहल बा।", sending: "प्रसारण सुरू होखी" }
    };

    const currentT = t[lang] || t['en'];

    // Core Logic
    const triggerCountdown = () => {
        if (hasBroadcasted || isBroadcasting) return;
        
        setIsBroadcasting(true);
        setCountdown(3);
        
        timerRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    executeBroadcast();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const cancelCountdown = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        setIsBroadcasting(false);
        setCountdown(3);
    };

    const executeBroadcast = async () => {
        try {
            await addDoc(collection(db, 'nagrik_sos'), {
                userId: auth.currentUser?.uid || 'guest',
                coordinates: coords || [0, 0],
                address: address || 'Unknown Location',
                status: 'Active',
                createdAt: serverTimestamp()
            });
            setHasBroadcasted(true);
        } catch (error) {
            console.error("SOS Broadcast Failed:", error);
            setIsBroadcasting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FFFFFF] font-sans text-[#111111] flex flex-col relative overflow-hidden">
            
            {/* Header */}
            <div className="w-full flex items-center justify-between px-6 pt-12 pb-4 z-20">
                <button onClick={() => navigate(-1)} className="text-[#00897B] outline-none">
                    <ChevronLeft size={28} strokeWidth={2.5} />
                </button>
                <span className="font-black text-[1.2rem] text-[#111111] tracking-tight">{currentT.title}</span>
                <div className="w-7"></div>
            </div>

            {/* Context Area */}
            <div className="px-6 text-center max-w-[400px] mx-auto z-20 mt-4">
                <p className="text-[1rem] font-medium text-[#111111]/70 leading-relaxed">
                    {currentT.desc}
                </p>
            </div>

            {/* Main Interactive Zone */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-20 px-6 mt-12 mb-20">
                <AnimatePresence mode="wait">
                    {!hasBroadcasted ? (
                        <motion.div 
                            key="action-zone"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="flex flex-col items-center"
                        >
                            {/* The Strict Accent Color Button */}
                            <button
                                onClick={isBroadcasting ? cancelCountdown : triggerCountdown}
                                className={`relative w-[220px] h-[220px] rounded-full flex flex-col items-center justify-center transition-all duration-300 outline-none shadow-[0_10px_40px_-10px_rgba(17,17,17,0.2)] border-4 ${
                                    isBroadcasting ? 'bg-[#FFFFFF] border-[#FFB300]' : 'bg-[#FFB300] border-[#FFB300] active:scale-95'
                                }`}
                            >
                                {isBroadcasting ? (
                                    <>
                                        <span className="text-[4rem] font-black text-[#FFB300] leading-none mb-2">{countdown}</span>
                                        <span className="text-[0.8rem] font-bold text-[#111111] tracking-widest uppercase">{currentT.cancel}</span>
                                        <X size={20} className="text-[#111111] mt-2" strokeWidth={3} />
                                    </>
                                ) : (
                                    <>
                                        <ShieldAlert size={64} className="text-[#111111] mb-4" strokeWidth={1.5} />
                                        <span className="text-[1.1rem] font-black text-[#111111] uppercase tracking-wider">{currentT.title}</span>
                                    </>
                                )}

                                {/* Radar Ripple Effect */}
                                {isBroadcasting && (
                                    <span className="absolute inset-0 rounded-full animate-ping border-4 border-[#FFB300] opacity-50"></span>
                                )}
                            </button>

                            <p className="mt-8 text-[1.1rem] font-bold text-[#111111]">
                                {isBroadcasting ? currentT.sending : currentT.btn}
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="success-zone"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-col items-center text-center bg-[#FFFFFF] border border-[#111111]/10 rounded-[32px] p-8 shadow-xl max-w-[400px] w-full"
                        >
                            <div className="w-24 h-24 rounded-full bg-[#00897B] flex items-center justify-center mb-6">
                                <CheckCircle size={40} className="text-[#FFFFFF]" strokeWidth={2.5} />
                            </div>
                            <h2 className="text-[1.8rem] font-black text-[#111111] mb-3 tracking-tight">{currentT.active}</h2>
                            <p className="text-[1.05rem] font-medium text-[#111111]/80 leading-relaxed">
                                {currentT.sent}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Live Location Bar */}
            <div className="w-full bg-[#FFFFFF] border-t border-[#111111]/10 px-6 py-6 pb-12 z-20">
                <div className="max-w-[400px] mx-auto flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#111111]/5 flex items-center justify-center shrink-0">
                        <MapPin size={24} className="text-[#00897B]" strokeWidth={2} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[0.8rem] font-bold text-[#111111]/50 uppercase tracking-wider mb-1">{currentT.loc}</span>
                        <span className="text-[0.95rem] font-black text-[#111111] leading-snug">
                            {isLocating ? currentT.fetching : address}
                        </span>
                    </div>
                </div>
            </div>

            {/* Background Aesthetic */}
            <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[50%] bg-[#FFB300]/10 rounded-full blur-[100px] pointer-events-none z-0"></div>
        </div>
    );
}