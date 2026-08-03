import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Flame, Activity, Newspaper, TrendingUp, Share2, MessageSquare, ExternalLink } from 'lucide-react';

export default function More() {
    const [lang, setLang] = useState('en');

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
        en: { title: "More Utilities", desc: "Essential services and community tools", em: "Emergency & Safety", police: "Police", fire: "Fire Brigade", amb: "Ambulance", media: "Media", news: "Local News", prices: "Today's Prices", fuel: "Fuel Rates", comm: "Community", share: "Share Platform", feedback: "Submit Feedback" },
        hi: { title: "अधिक उपयोगिताएँ", desc: "आवश्यक सेवाएं और सामुदायिक उपकरण", em: "आपातकाल और सुरक्षा", police: "पुलिस", fire: "दमकल", amb: "एम्बुलेंस", media: "मीडिया", news: "स्थानीय समाचार", prices: "आज के दाम", fuel: "ईंधन दरें", comm: "समुदाय", share: "प्लेटफॉर्म साझा करें", feedback: "प्रतिक्रिया दें" },
        hinglish: { title: "More Utilities", desc: "Zaroori services aur community tools", em: "Emergency & Safety", police: "Police", fire: "Fire Brigade", amb: "Ambulance", media: "Media", news: "Local News", prices: "Aaj ke Prices", fuel: "Fuel Rates", comm: "Community", share: "Share Karein", feedback: "Feedback Dein" },
        mr: { title: "अधिक उपयुक्तता", desc: "अत्यावश्यक सेवा आणि समुदाय साधने", em: "आणीबाणी आणि सुरक्षा", police: "पोलीस", fire: "अग्निशमन दल", amb: "रुग्णवाहिका", media: "माध्यमे", news: "स्थानिक बातम्या", prices: "आजचे दर", fuel: "इंधनाचे दर", comm: "समुदाय", share: "प्लॅटफॉर्म शेअर करा", feedback: "अभिप्राय द्या" },
        gu: { title: "વધુ ઉપયોગિતાઓ", desc: "આવશ્યક સેવાઓ અને સમુદાય સાધનો", em: "કટોકટી અને સુરક્ષા", police: "પોલીસ", fire: "ફાયર બ્રિગેડ", amb: "એમ્બ્યુલન્સ", media: "મીડિયા", news: "સ્થાનિક સમાચાર", prices: "આજના ભાવો", fuel: "ઇંધણના દરો", comm: "સમુદાય", share: "પ્લેટફોર્મ શેર કરો", feedback: "પ્રતિસાદ સબમિટ કરો" },
        te: { title: "మరిన్ని ఉపయోగాలు", desc: "ముఖ్యమైన సేవలు మరియు కమ్యూనిటీ సాధనాలు", em: "అత్యవసర మరియు భద్రత", police: "పోలీసు", fire: "అగ్నిమాపక దళం", amb: "అంబులెన్స్", media: "మీడియా", news: "స్థానిక వార్తలు", prices: "నేటి ధరలు", fuel: "ఇంధన ధరలు", comm: "కమ్యూనిటీ", share: "ప్లాట్‌ఫారమ్‌ను భాగస్వామ్యం చేయండి", feedback: "అభిప్రాయాన్ని సమర్పించండి" },
        ta: { title: "மேலும் பயன்பாடுகள்", desc: "அத்தியாவசிய சேவைகள் மற்றும் சமூக கருவிகள்", em: "அவசரம் மற்றும் பாதுகாப்பு", police: "காவல்துறை", fire: "தீயணைப்பு படை", amb: "ஆம்புலன்ஸ்", media: "ஊடகம்", news: "உள்ளூர் செய்திகள்", prices: "இன்றைய விலைகள்", fuel: "எரிபொருள் விலைகள்", comm: "சமூகம்", share: "தளத்தை பகிரவும்", feedback: "கருத்து சமர்ப்பிக்கவும்" },
        kn: { title: "ಹೆಚ್ಚಿನ ಉಪಯುಕ್ತತೆಗಳು", desc: "ಅಗತ್ಯ ಸೇವೆಗಳು ಮತ್ತು ಸಮುದಾಯ ಪರಿಕರಗಳು", em: "ತುರ್ತು ಮತ್ತು ಸುರಕ್ಷತೆ", police: "ಪೊಲೀಸ್", fire: "ಅಗ್ನಿಶಾಮಕ ದಳ", amb: "ಆಂಬ್ಯುಲೆನ್ಸ್", media: "ಮಾಧ್ಯಮ", news: "ಸ್ಥಳೀಯ ಸುದ್ದಿ", prices: "ಇಂದಿನ ಬೆಲೆಗಳು", fuel: "ಇಂಧನ ದರಗಳು", comm: "ಸಮುದಾಯ", share: "ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಹಂಚಿಕೊಳ್ಳಿ", feedback: "ಪ್ರತಿಕ್ರಿಯೆ ಸಲ್ಲಿಸಿ" },
        ml: { title: "കൂടുതൽ സേവനങ്ങൾ", desc: "അവശ്യ സേവനങ്ങളും കമ്മ്യൂണിറ്റി ടൂളുകളും", em: "അടിയന്തരം & സുരക്ഷ", police: "പോലീസ്", fire: "ഫയർ ഫോഴ്സ്", amb: "ആംബുലൻസ്", media: "മാധ്യമങ്ങൾ", news: "പ്രാദേശിക വാർത്തകൾ", prices: "ഇന്നത്തെ വിലകൾ", fuel: "ഇന്ധന നിരക്കുകൾ", comm: "കമ്മ്യൂണിറ്റി", share: "പ്ലാറ്റ്ഫോം പങ്കിടുക", feedback: "അഭിപ്രായം സമർപ്പിക്കുക" },
        bn: { title: "আরও উপযোগিতা", desc: "প্রয়োজনীয় পরিষেবা এবং কমিউনিটি টুলস", em: "জরুরি এবং নিরাপত্তা", police: "পুলিশ", fire: "দমকল", amb: "অ্যাম্বুলেন্স", media: "মিডিয়া", news: "স্থানীয় খবর", prices: "আজকের দাম", fuel: "জ্বালানির দাম", comm: "কমিউনিটি", share: "প্ল্যাটফর্ম শেয়ার করুন", feedback: "মতামত জমা দিন" },
        pa: { title: "ਹੋਰ ਸਹੂਲਤਾਂ", desc: "ਜ਼ਰੂਰੀ ਸੇਵਾਵਾਂ ਅਤੇ ਭਾਈਚਾਰਕ ਟੂਲ", em: "ਐਮਰਜੈਂਸੀ ਅਤੇ ਸੁਰੱਖਿਆ", police: "ਪੁਲਿਸ", fire: "ਫਾਇਰ ਬ੍ਰਿਗੇਡ", amb: "ਐਂਬੂਲੈਂਸ", media: "ਮੀਡੀਆ", news: "ਸਥਾਨਕ ਖ਼ਬਰਾਂ", prices: "ਅੱਜ ਦੀਆਂ ਕੀਮਤਾਂ", fuel: "ਈਂਧਨ ਦੀਆਂ ਕੀਮਤਾਂ", comm: "ਭਾਈਚਾਰਾ", share: "ਪਲੇਟਫਾਰਮ ਸਾਂਝਾ ਕਰੋ", feedback: "ਫੀਡਬੈਕ ਜਮ੍ਹਾਂ ਕਰੋ" },
        or: { title: "ଅଧିକ ଉପଯୋଗିତା", desc: "ଜରୁରୀ ସେବା ଏବଂ ସମ୍ପ୍ରଦାୟ ଉପକରଣ", em: "ଜରୁରୀକାଳୀନ ଏବଂ ସୁରକ୍ଷା", police: "ପୋଲିସ୍", fire: "ଅଗ୍ନିଶମ ବାହିନୀ", amb: "ଆମ୍ବୁଲାନ୍ସ", media: "ମିଡିଆ", news: "ସ୍ଥାନୀୟ ଖବର", prices: "ଆଜିର ଦର", fuel: "ଇନ୍ଧନ ଦର", comm: "ସମ୍ପ୍ରଦାୟ", share: "ପ୍ଲାଟଫର୍ମ ସେୟାର୍ କରନ୍ତୁ", feedback: "ମତାମତ ଦିଅନ୍ତୁ" },
        as: { title: "অধিক উপযোগিতা", desc: "প্ৰয়োজনীয় সেৱা আৰু সম্প্ৰদায় সঁজুলি", em: "জৰুৰীকালীন আৰু নিৰাপত্তা", police: "আৰক্ষী", fire: "অগ্নি নিৰ্বাপক বাহিনী", amb: "এম্বুলেন্স", media: "মিডিয়া", news: "স্থানীয় খবৰ", prices: "আজিৰ মূল্য", fuel: "ইন্ধনৰ মূল্য", comm: "সম্প্ৰদায়", share: "প্লেটফৰ্ম শ্বেয়াৰ কৰক", feedback: "মতামত দিয়ক" },
        ur: { title: "مزید سہولیات", desc: "ضروری خدمات اور کمیونٹی ٹولز", em: "ہنگامی اور حفاظت", police: "پولیس", fire: "فائر بریگیڈ", amb: "ایمبولینس", media: "میڈیا", news: "مقامی خبریں", prices: "آج کی قیمتیں", fuel: "ایندھن کے نرخ", comm: "کمیونٹی", share: "پلیٹ فارم شیئر کریں", feedback: "رائے جمع کرائیں" },
        bho: { title: "अउरी सुविधा", desc: "जरूरी सेवा आ सामुदायिक उपकरण", em: "आपातकाल आ सुरक्षा", police: "पुलिस", fire: "दमकल", amb: "एम्बुलेंस", media: "मीडिया", news: "स्थानीय खबर", prices: "आज के दाम", fuel: "ईंधन के दर", comm: "समुदाय", share: "प्लेटफॉर्म साझा करीं", feedback: "प्रतिक्रिया दीं" }
    };

    const currentT = t[lang] || t['en'];

    // Real Action Logic
    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'NagrikSetu',
                    text: 'Join the community platform for better civic management.',
                    url: window.location.origin,
                });
            } catch (error) {
                console.error("Share failed", error);
            }
        } else {
            alert("Sharing is not supported on this device.");
        }
    };

    const openLink = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    // Staggered Animation Configuration
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans text-[#111111] pb-32">
            {/* Header */}
            <div className="bg-white pt-12 pb-6 px-6 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] sticky top-0 z-40 border-b border-[#E0E0E0]">
                <div className="max-w-[500px] mx-auto">
                    <h1 className="text-[1.8rem] font-black tracking-tight">{currentT.title}</h1>
                    <p className="text-[0.95rem] font-medium text-[#555555] mt-1">{currentT.desc}</p>
                </div>
            </div>

            <motion.div 
                className="max-w-[500px] mx-auto px-4 pt-6 flex flex-col gap-8"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                {/* Emergency & Safety Section */}
                <motion.div variants={itemVariants}>
                    <h2 className="text-[1.1rem] font-black mb-4 px-2">{currentT.em}</h2>
                    <div className="grid grid-cols-3 gap-3">
                        <a href="tel:100" className="bg-[#FFEBEE] border border-[#EF9A9A] rounded-[20px] p-4 flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform outline-none cursor-pointer">
                            <ShieldAlert size={24} className="text-[#D32F2F]" />
                            <span className="text-[0.8rem] font-bold text-[#D32F2F] text-center">{currentT.police}</span>
                        </a>
                        <a href="tel:101" className="bg-[#FFEBEE] border border-[#EF9A9A] rounded-[20px] p-4 flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform outline-none cursor-pointer">
                            <Flame size={24} className="text-[#D32F2F]" />
                            <span className="text-[0.8rem] font-bold text-[#D32F2F] text-center">{currentT.fire}</span>
                        </a>
                        <a href="tel:108" className="bg-[#FFEBEE] border border-[#EF9A9A] rounded-[20px] p-4 flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform outline-none cursor-pointer">
                            <Activity size={24} className="text-[#D32F2F]" />
                            <span className="text-[0.8rem] font-bold text-[#D32F2F] text-center">{currentT.amb}</span>
                        </a>
                    </div>
                </motion.div>

                {/* Media & News Section */}
                <motion.div variants={itemVariants}>
                    <h2 className="text-[1.1rem] font-black mb-4 px-2">{currentT.media}</h2>
                    <div className="bg-white border border-[#E0E0E0] rounded-[24px] overflow-hidden shadow-sm">
                        <button onClick={() => openLink('https://news.google.com/')} className="w-full flex items-center justify-between p-5 border-b border-[#E0E0E0] active:bg-[#FAFAFA] transition-colors outline-none">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#E3F2FD] flex items-center justify-center">
                                    <Newspaper size={18} className="text-[#1565C0]" />
                                </div>
                                <span className="font-bold text-[0.95rem]">{currentT.news}</span>
                            </div>
                            <ExternalLink size={16} className="text-[#888888]" />
                        </button>
                    </div>
                </motion.div>

                {/* Today's Prices Section */}
                <motion.div variants={itemVariants}>
                    <h2 className="text-[1.1rem] font-black mb-4 px-2">{currentT.prices}</h2>
                    <div className="bg-white border border-[#E0E0E0] rounded-[24px] overflow-hidden shadow-sm">
                        <button onClick={() => openLink('https://www.mypetrolprice.com/')} className="w-full flex items-center justify-between p-5 border-b border-[#E0E0E0] active:bg-[#FAFAFA] transition-colors outline-none">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#FFF8E1] flex items-center justify-center">
                                    <TrendingUp size={18} className="text-[#F57F17]" />
                                </div>
                                <span className="font-bold text-[0.95rem]">{currentT.fuel}</span>
                            </div>
                            <ExternalLink size={16} className="text-[#888888]" />
                        </button>
                    </div>
                </motion.div>

                {/* Community Section */}
                <motion.div variants={itemVariants}>
                    <h2 className="text-[1.1rem] font-black mb-4 px-2">{currentT.comm}</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={handleShare} className="bg-white border border-[#E0E0E0] rounded-[20px] p-5 flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform outline-none shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-[#E0F2F1] flex items-center justify-center">
                                <Share2 size={20} className="text-[#00897B]" />
                            </div>
                            <span className="font-bold text-[0.9rem]">{currentT.share}</span>
                        </button>
                        <button onClick={() => openLink('mailto:support@movyra.com')} className="bg-white border border-[#E0E0E0] rounded-[20px] p-5 flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform outline-none shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-[#E0F2F1] flex items-center justify-center">
                                <MessageSquare size={20} className="text-[#00897B]" />
                            </div>
                            <span className="font-bold text-[0.9rem]">{currentT.feedback}</span>
                        </button>
                    </div>
                </motion.div>

            </motion.div>
        </div>
    );
}