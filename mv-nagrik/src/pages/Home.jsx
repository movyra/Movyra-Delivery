import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Car, 
    AlertTriangle, 
    Trash2, 
    Droplet, 
    TreePine, 
    Lightbulb, 
    Zap, 
    Activity, 
    Flame, 
    MapPin, 
    User 
} from 'lucide-react';

export default function Home() {
    const navigate = useNavigate();
    const [lang, setLang] = useState('en');
    const [currentLocation, setCurrentLocation] = useState('');
    const [isLocating, setIsLocating] = useState(true);

    // Language Synchronization
    useEffect(() => {
        const savedLang = localStorage.getItem('nagrik_lang') || navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'hinglish', 'mr', 'gu', 'te', 'ta', 'kn', 'ml', 'bn', 'pa', 'or', 'as', 'ur', 'bho'];
        
        if (supported.includes(savedLang)) {
            setLang(savedLang);
        }

        const handleStorageChange = () => {
            const newLang = localStorage.getItem('nagrik_lang');
            if (newLang && supported.includes(newLang)) {
                setLang(newLang);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // 15 Comprehensive Indian Language Translations
    const t = {
        en: { 
            title_main: "Choose a ", title_highlight: "Category", title_end: ",", sub_main: "Report with ease.", sub_desc: "From emergencies to everyday issues.",
            loc_label: "Reporting from", loc_fetching: "Identifying location...", loc_denied: "Location access restricted",
            cat_traffic: "Traffic Violation", cat_accident: "Accident", cat_garbage: "Illegal Dumping", cat_water: "Damaged Water Pipe", 
            cat_park: "Public Park Damage", cat_light: "Street Light", cat_cable: "Loose Cable",
            em_title: "Emergency Services", em_amb: "Ambulance", em_fire: "Fire"
        },
        hi: { 
            title_main: "एक ", title_highlight: "श्रेणी", title_end: " चुनें,", sub_main: "आसानी से रिपोर्ट करें।", sub_desc: "आपात स्थिति से लेकर रोजमर्रा की समस्याओं तक।",
            loc_label: "यहाँ से रिपोर्ट कर रहे हैं", loc_fetching: "स्थान खोज रहे हैं...", loc_denied: "स्थान पहुंच प्रतिबंधित है",
            cat_traffic: "यातायात उल्लंघन", cat_accident: "दुर्घटना", cat_garbage: "अवैध डंपिंग", cat_water: "क्षतिग्रस्त पाइप", 
            cat_park: "पार्क का नुकसान", cat_light: "स्ट्रीट लाइट", cat_cable: "खुला केबल",
            em_title: "आपातकालीन सेवाएं", em_amb: "एम्बुलेंस", em_fire: "आग"
        },
        hinglish: { 
            title_main: "Ek ", title_highlight: "Category", title_end: " chunein,", sub_main: "Aasani se report karein.", sub_desc: "Emergency se daily issues tak.",
            loc_label: "Yahan se report kar rahe hain", loc_fetching: "Location dhoondh rahe hain...", loc_denied: "Location access denied",
            cat_traffic: "Traffic Violation", cat_accident: "Accident", cat_garbage: "Illegal Dumping", cat_water: "Damaged Pipe", 
            cat_park: "Park Damage", cat_light: "Street Light", cat_cable: "Loose Cable",
            em_title: "Emergency Services", em_amb: "Ambulance", em_fire: "Fire"
        },
        mr: { 
            title_main: "एक ", title_highlight: "श्रेणी", title_end: " निवडा,", sub_main: "सहजतेने तक्रार करा.", sub_desc: "आणीबाणीपासून दररोजच्या समस्यांपर्यंत.",
            loc_label: "येथून तक्रार करत आहे", loc_fetching: "स्थान शोधत आहे...", loc_denied: "स्थान प्रवेश प्रतिबंधित",
            cat_traffic: "वाहतूक उल्लंघन", cat_accident: "अपघात", cat_garbage: "बेकायदेशीर डंपिंग", cat_water: "खराब झालेला पाईप", 
            cat_park: "उद्यानाचे नुकसान", cat_light: "पथदिवे", cat_cable: "सैल केबल",
            em_title: "आपत्कालीन सेवा", em_amb: "रुग्णवाहिका", em_fire: "आग"
        },
        gu: { 
            title_main: "એક ", title_highlight: "શ્રેણી", title_end: " પસંદ કરો,", sub_main: "સરળતાથી રિપોર્ટ કરો.", sub_desc: "કટોકટીથી લઈને રોજિંદા સમસ્યાઓ સુધી.",
            loc_label: "અહીંથી રિપોર્ટ કરી રહ્યા છીએ", loc_fetching: "સ્થાન શોધી રહ્યા છીએ...", loc_denied: "સ્થાન ઍક્સેસ પ્રતિબંધિત",
            cat_traffic: "ટ્રાફિક ઉલ્લંઘન", cat_accident: "અકસ્માત", cat_garbage: "ગેરકાયદેસર ડમ્પિંગ", cat_water: "ક્ષતિગ્રસ્ત પાઇપ", 
            cat_park: "પાર્ક નુકસાન", cat_light: "સ્ટ્રીટ લાઇટ", cat_cable: "છૂટો કેબલ",
            em_title: "કટોકટી સેવાઓ", em_amb: "એમ્બ્યુલન્સ", em_fire: "આગ"
        },
        te: { 
            title_main: "ఒక ", title_highlight: "వర్గాన్ని", title_end: " ఎంచుకోండి,", sub_main: "సులభంగా నివేదించండి.", sub_desc: "అత్యవసరాల నుండి రోజువారీ సమస్యల వరకు.",
            loc_label: "ఇక్కడి నుండి నివేదిస్తున్నారు", loc_fetching: "స్థానాన్ని కనుగొంటున్నాము...", loc_denied: "స్థాన యాక్సెస్ నిరాకరించబడింది",
            cat_traffic: "ట్రాఫిక్ ఉల్లంఘన", cat_accident: "ప్రమాదం", cat_garbage: "అక్రమ డంపింగ్", cat_water: "దెబ్బతిన్న పైపు", 
            cat_park: "పార్క్ నష్టం", cat_light: "వీధి దీపం", cat_cable: "వదులుగా ఉన్న కేబుల్",
            em_title: "అత్యవసర సేవలు", em_amb: "అంబులెన్స్", em_fire: "అగ్నిమాపక"
        },
        ta: { 
            title_main: "ஒரு ", title_highlight: "வகையைத்", title_end: " தேர்ந்தெடுக்கவும்,", sub_main: "எளிதாகப் புகாரளிக்கவும்.", sub_desc: "அவசரநிலைகள் முதல் அன்றாடப் பிரச்சினைகள் வரை.",
            loc_label: "இங்கிருந்து புகாரளிக்கிறது", loc_fetching: "இருப்பிடத்தைத் தேடுகிறது...", loc_denied: "இருப்பிட அணுகல் மறுக்கப்பட்டது",
            cat_traffic: "போக்குவரத்து மீறல்", cat_accident: "விபத்து", cat_garbage: "சட்டவிரோத குப்பை", cat_water: "சேதமடைந்த குழாய்", 
            cat_park: "பூங்கா சேதம்", cat_light: "தெரு விளக்கு", cat_cable: "தளர்வான கேபிள்",
            em_title: "அவசர சேவைகள்", em_amb: "ஆம்புலன்ஸ்", em_fire: "தீ"
        },
        kn: { 
            title_main: "ಒಂದು ", title_highlight: "ವರ್ಗವನ್ನು", title_end: " ಆಯ್ಕೆಮಾಡಿ,", sub_main: "ಸುಲಭವಾಗಿ ವರದಿ ಮಾಡಿ.", sub_desc: "ತುರ್ತು ಪರಿಸ್ಥಿತಿಗಳಿಂದ ದೈನಂದಿನ ಸಮಸ್ಯೆಗಳವರೆಗೆ.",
            loc_label: "ಇಲ್ಲಿಂದ ವರದಿ ಮಾಡಲಾಗುತ್ತಿದೆ", loc_fetching: "ಸ್ಥಳವನ್ನು ಹುಡುಕಲಾಗುತ್ತಿದೆ...", loc_denied: "ಸ್ಥಳ ಪ್ರವೇಶ ನಿರ್ಬಂಧಿಸಲಾಗಿದೆ",
            cat_traffic: "ಸಂಚಾರ ಉಲ್ಲಂಘನೆ", cat_accident: "ಅಪಘಾತ", cat_garbage: "ಅಕ್ರಮ ಡಂಪಿಂಗ್", cat_water: "ಹಾನಿಗೊಳಗಾದ ಪೈಪ್", 
            cat_park: "ಪಾರ್ಕ್ ಹಾನಿ", cat_light: "ಬೀದಿ ದೀಪ", cat_cable: "ಸಡಿಲವಾದ ಕೇಬಲ್",
            em_title: "ತುರ್ತು ಸೇವೆಗಳು", em_amb: "ಆಂಬ್ಯುಲೆನ್ಸ್", em_fire: "ಬೆಂಕಿ"
        },
        ml: { 
            title_main: "ഒരു ", title_highlight: "വിഭാഗം", title_end: " തിരഞ്ഞെടുക്കുക,", sub_main: "എളുപ്പത്തിൽ റിപ്പോർട്ട് ചെയ്യുക.", sub_desc: "അത്യാഹിതങ്ങൾ മുതൽ ദൈനംദിന പ്രശ്നങ്ങൾ വരെ.",
            loc_label: "ഇവിടെ നിന്ന് റിപ്പോർട്ട് ചെയ്യുന്നു", loc_fetching: "സ്ഥലം കണ്ടെത്തുന്നു...", loc_denied: "ലൊക്കേഷൻ ആക്സസ് പരിമിതപ്പെടുത്തി",
            cat_traffic: "ഗതാഗത ലംഘനം", cat_accident: "അപകടം", cat_garbage: "അനധികൃത ഡംപിംഗ്", cat_water: "തകർന്ന പൈപ്പ്", 
            cat_park: "പാർക്ക് നാശം", cat_light: "തെരുവ് വിളക്ക്", cat_cable: "അയഞ്ഞ കേബിൾ",
            em_title: "അടിയന്തര സേവനങ്ങൾ", em_amb: "ആംബുലൻസ്", em_fire: "തീ"
        },
        bn: { 
            title_main: "একটি ", title_highlight: "বিভাগ", title_end: " নির্বাচন করুন,", sub_main: "সহজে রিপোর্ট করুন।", sub_desc: "জরুরি অবস্থা থেকে দৈনন্দিন সমস্যা পর্যন্ত।",
            loc_label: "এখান থেকে রিপোর্ট করছেন", loc_fetching: "অবস্থান খুঁজছি...", loc_denied: "অবস্থান অ্যাক্সেস সীমাবদ্ধ",
            cat_traffic: "ট্রাফিক লঙ্ঘন", cat_accident: "দুর্ঘটনা", cat_garbage: "অবৈধ ডাম্পিং", cat_water: "ক্ষতিগ্রস্ত পাইপ", 
            cat_park: "পার্কের ক্ষতি", cat_light: "রাস্তার আলো", cat_cable: "আলগা তার",
            em_title: "জরুরি সেবা", em_amb: "অ্যাম্বুলেন্স", em_fire: "আগুন"
        },
        pa: { 
            title_main: "ਇੱਕ ", title_highlight: "ਸ਼੍ਰੇਣੀ", title_end: " ਚੁਣੋ,", sub_main: "ਆਸਾਨੀ ਨਾਲ ਰਿਪੋਰਟ ਕਰੋ।", sub_desc: "ਐਮਰਜੈਂਸੀ ਤੋਂ ਲੈ ਕੇ ਰੋਜ਼ਾਨਾ ਦੀਆਂ ਸਮੱਸਿਆਵਾਂ ਤੱਕ।",
            loc_label: "ਇੱਥੋਂ ਰਿਪੋਰਟ ਕਰ ਰਹੇ ਹਾਂ", loc_fetching: "ਸਥਾਨ ਲੱਭ ਰਹੇ ਹਾਂ...", loc_denied: "ਸਥਾਨ ਪਹੁੰਚ ਪ੍ਰਤੀਬੰਧਿਤ ਹੈ",
            cat_traffic: "ਟ੍ਰੈਫਿਕ ਉਲੰਘਣਾ", cat_accident: "ਹਾਦਸਾ", cat_garbage: "ਗੈਰ-ਕਾਨੂੰਨੀ ਡੰਪਿੰਗ", cat_water: "ਖਰਾਬ ਪਾਈਪ", 
            cat_park: "ਪਾਰਕ ਦਾ ਨੁਕਸਾਨ", cat_light: "ਸਟ੍ਰੀਟ ਲਾਈਟ", cat_cable: "ਢਿੱਲੀ ਤਾਰ",
            em_title: "ਐਮਰਜੈਂਸੀ ਸੇਵਾਵਾਂ", em_amb: "ਐਂਬੂਲੈਂਸ", em_fire: "ਅੱਗ"
        },
        or: { 
            title_main: "ଗୋଟିଏ ", title_highlight: "ବର୍ଗ", title_end: " ବାଛନ୍ତୁ,", sub_main: "ସହଜରେ ରିପୋର୍ଟ କରନ୍ତୁ।", sub_desc: "ଜରୁରୀକାଳୀନ ପରିସ୍ଥିତିରୁ ଦୈନନ୍ଦିନ ସମସ୍ୟା ପର୍ଯ୍ୟନ୍ତ।",
            loc_label: "ଏଠାରୁ ରିପୋର୍ଟ କରୁଛନ୍ତି", loc_fetching: "ସ୍ଥାନ ଖୋଜୁଛୁ...", loc_denied: "ସ୍ଥାନ ପ୍ରବେଶ ବାରଣ କରାଯାଇଛି",
            cat_traffic: "ଟ୍ରାଫିକ୍ ଉଲ୍ଲଂଘନ", cat_accident: "ଦୁର୍ଘଟଣା", cat_garbage: "ଅବୈଧ ଡମ୍ପିଂ", cat_water: "ନଷ୍ଟ ହୋଇଥିବା ପାଇପ୍", 
            cat_park: "ପାର୍କ କ୍ଷତି", cat_light: "ଷ୍ଟ୍ରିଟ୍ ଲାଇଟ୍", cat_cable: "ଢିଲା ତାର",
            em_title: "ଜରୁରୀକାଳୀନ ସେବା", em_amb: "ଆମ୍ବୁଲାନ୍ସ", em_fire: "ନିଆଁ"
        },
        as: { 
            title_main: "এটা ", title_highlight: "শ্ৰেণী", title_end: " বাছনি কৰক,", sub_main: "সহজে ৰিপৰ্ট কৰক।", sub_desc: "জৰুৰী অৱস্থাৰ পৰা দৈনন্দিন সমস্যালৈকে।",
            loc_label: "ইয়াৰ পৰা ৰিপৰ্ট কৰিছে", loc_fetching: "অৱস্থান বিচাৰি আছোঁ...", loc_denied: "অৱস্থান প্ৰৱেশ বাধাগ্ৰস্ত",
            cat_traffic: "ট্ৰেফিক উলংঘন", cat_accident: "দুৰ্ঘটনা", cat_garbage: "অবৈধ ডাম্পিং", cat_water: "ক্ষতিগ্ৰস্ত পাইপ", 
            cat_park: "পাৰ্কৰ ক্ষতি", cat_light: "ষ্ট্ৰীট লাইট", cat_cable: "ঢিলা তাঁৰ",
            em_title: "জৰুৰীকালীন সেৱা", em_amb: "এম্বুলেন্স", em_fire: "জুই"
        },
        ur: { 
            title_main: "ایک ", title_highlight: "زمرہ", title_end: " منتخب کریں،", sub_main: "آسانی سے رپورٹ کریں۔", sub_desc: "ہنگامی حالات سے روزمرہ کے مسائل تک۔",
            loc_label: "یہاں سے رپورٹ کر رہے ہیں", loc_fetching: "مقام تلاش کر رہے ہیں۔۔۔", loc_denied: "مقام تک رسائی محدود ہے",
            cat_traffic: "ٹریفک کی خلاف ورزی", cat_accident: "حادثہ", cat_garbage: "غیر قانونی ڈمپنگ", cat_water: "خراب پائپ", 
            cat_park: "پارک کا نقصان", cat_light: "اسٹریٹ لائٹ", cat_cable: "ڈھیلی تار",
            em_title: "ہنگامی خدمات", em_amb: "ایمبولینس", em_fire: "آگ"
        },
        bho: { 
            title_main: "एगो ", title_highlight: "श्रेणी", title_end: " चुनीं,", sub_main: "आसानी से रिपोर्ट करीं।", sub_desc: "आपात स्थिति से ले के रोजमर्रा के समस्या तक।",
            loc_label: "इहाँ से रिपोर्ट कर रहल बानी", loc_fetching: "स्थान खोज रहल बानी...", loc_denied: "स्थान पहुंच प्रतिबंधित बा",
            cat_traffic: "यातायात उल्लंघन", cat_accident: "दुर्घटना", cat_garbage: "अवैध डंपिंग", cat_water: "टूट गइल पाइप", 
            cat_park: "पार्क के नुकसान", cat_light: "स्ट्रीट लाइट", cat_cable: "खुलल केबल",
            em_title: "आपातकालीन सेवा", em_amb: "एम्बुलेंस", em_fire: "आग"
        }
    };

    const currentT = t[lang] || t['en'];

    // Real-time Geolocation Logic
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
                        const data = await response.json();
                        
                        // Extracting city or local area name specifically
                        const localArea = data.address.suburb || data.address.city_district || data.address.city || data.address.town || "Unknown Area";
                        const stateRegion = data.address.state || data.address.region || "";
                        
                        setCurrentLocation(`${localArea}${stateRegion ? `, ${stateRegion}` : ''}`);
                    } catch (error) {
                        setCurrentLocation(currentT.loc_denied);
                    } finally {
                        setIsLocating(false);
                    }
                },
                (error) => {
                    setCurrentLocation(currentT.loc_denied);
                    setIsLocating(false);
                },
                { timeout: 10000 }
            );
        } else {
            setCurrentLocation(currentT.loc_denied);
            setIsLocating(false);
        }
    }, [currentT.loc_denied]);

    const handleCategorySelect = (categoryId) => {
        navigate(`/report?category=${categoryId}`);
    };

    const floatingCategories = [
        { id: 'traffic', label: currentT.cat_traffic, icon: Car, size: 'large', float: 'animate-[float_4s_ease-in-out_infinite]' },
        { id: 'accident', label: currentT.cat_accident, icon: AlertTriangle, size: 'medium', float: 'animate-[float_5s_ease-in-out_infinite_0.5s]' },
        { id: 'garbage', label: currentT.cat_garbage, icon: Trash2, size: 'medium', float: 'animate-[float_4.5s_ease-in-out_infinite_1s]' },
        { id: 'water', label: currentT.cat_water, icon: Droplet, size: 'medium', float: 'animate-[float_5.5s_ease-in-out_infinite_0.2s]' },
        { id: 'park', label: currentT.cat_park, icon: TreePine, size: 'small', float: 'animate-[float_4s_ease-in-out_infinite_1.5s]' },
        { id: 'light', label: currentT.cat_light, icon: Lightbulb, size: 'small', float: 'animate-[float_6s_ease-in-out_infinite_0.8s]' },
        { id: 'cable', label: currentT.cat_cable, icon: Zap, size: 'small', float: 'animate-[float_5s_ease-in-out_infinite_0.3s]' },
    ];

    const emergencyServices = [
        { id: 'ambulance', label: currentT.em_amb, icon: Activity },
        { id: 'fire', label: currentT.em_fire, icon: Flame }
    ];

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans text-[#111111] pb-32">
            {/* Header Section */}
            <div className="px-6 pt-12 pb-6 max-w-[500px] mx-auto">
                <h1 className="text-[2.2rem] font-black leading-[1.1] tracking-tight mb-2">
                    {currentT.title_main} 
                    <span className="text-[#D32F2F]">{currentT.title_highlight}</span>
                    <span className="text-[#111111]">{currentT.title_end}</span>
                    <br />
                    <span className="text-[#111111]">{currentT.sub_main}</span>
                </h1>
                <p className="text-[1.05rem] text-[#555555] font-medium leading-relaxed">
                    {currentT.sub_desc}
                </p>
            </div>

            {/* Floating Grid Section */}
            <div className="px-4 py-8 max-w-[500px] mx-auto min-h-[350px] relative flex flex-wrap justify-center items-center gap-4">
                {floatingCategories.map((cat, index) => {
                    // Dynamic sizing mapped to the requested UI
                    let cardClasses = "bg-white shadow-[0_8px_20px_-6px_rgba(0,0,0,0.08)] flex flex-col items-center justify-center text-center cursor-pointer transition-transform active:scale-95 border border-[#E0E0E0] outline-none ";
                    let iconSize = 24;
                    
                    if (cat.size === 'large') {
                        cardClasses += "w-[140px] h-[140px] rounded-[32px] p-4";
                        iconSize = 36;
                    } else if (cat.size === 'medium') {
                        cardClasses += "w-[110px] h-[110px] rounded-[24px] p-3";
                        iconSize = 28;
                    } else {
                        cardClasses += "w-[90px] h-[90px] rounded-[20px] p-2";
                        iconSize = 20;
                    }

                    return (
                        <motion.button
                            key={cat.id}
                            onClick={() => handleCategorySelect(cat.id)}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={`${cardClasses} ${cat.float}`}
                        >
                            <cat.icon size={iconSize} className="text-[#D32F2F] mb-2" strokeWidth={2} />
                            <span className={`font-bold leading-tight text-[#111111] ${cat.size === 'small' ? 'text-[0.65rem]' : 'text-[0.8rem]'}`}>
                                {cat.label}
                            </span>
                        </motion.button>
                    );
                })}
            </div>

            {/* Bottom Content Area */}
            <div className="px-6 mt-4 max-w-[500px] mx-auto">
                {/* Real-time Location Card */}
                <div className="bg-white rounded-2xl p-4 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.05)] border border-[#E0E0E0] flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#FFEBEE] flex items-center justify-center shrink-0">
                            <MapPin size={18} className="text-[#D32F2F]" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[0.75rem] text-[#888888] font-bold uppercase tracking-wider">{currentT.loc_label}</span>
                            <span className="text-[0.95rem] font-black text-[#111111] truncate max-w-[200px]">
                                {isLocating ? currentT.loc_fetching : currentLocation}
                            </span>
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#111111] flex items-center justify-center shrink-0 cursor-pointer">
                        <User size={18} className="text-white" />
                    </div>
                </div>

                {/* Emergency Services */}
                <div>
                    <h3 className="text-[1.1rem] font-black text-[#111111] mb-4">{currentT.em_title}</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {emergencyServices.map((service) => (
                            <button 
                                key={service.id}
                                onClick={() => handleCategorySelect(`emergency_${service.id}`)}
                                className="bg-white rounded-2xl p-5 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.05)] border border-[#E0E0E0] flex flex-col items-center justify-center gap-3 transition-transform active:scale-95 outline-none"
                            >
                                <div className="w-12 h-12 rounded-full bg-[#FFEBEE] flex items-center justify-center">
                                    <service.icon size={24} className="text-[#D32F2F]" strokeWidth={2.5} />
                                </div>
                                <span className="font-bold text-[0.9rem] text-[#111111]">{service.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}