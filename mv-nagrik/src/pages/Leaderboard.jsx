import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Trophy, Medal, Award, User } from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

export default function Leaderboard() {
    const navigate = useNavigate();
    const [lang, setLang] = useState('en');
    const [leaders, setLeaderboard] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

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

    // Real-Time Firestore Leaderboard Engine
    useEffect(() => {
        const q = query(
            collection(db, 'nagrik_leaderboard'),
            orderBy('points', 'desc'),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const leaderData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setLeaderboard(leaderData);
            setIsLoading(false);
        }, (error) => {
            console.error("Leaderboard fetch error:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // 15 Comprehensive Indian Language Translations
    const t = {
        en: { title: "Civic Leaderboard", desc: "Top contributors improving the community.", rank: "Rank", pts: "Karma Points", load: "Fetching rankings...", empty: "No contributors found yet.", you: "You" },
        hi: { title: "नागरिक लीडरबोर्ड", desc: "समुदाय को बेहतर बनाने वाले शीर्ष योगदानकर्ता।", rank: "रैंक", pts: "कर्म अंक", load: "रैंकिंग प्राप्त की जा रही है...", empty: "अभी तक कोई योगदानकर्ता नहीं मिला।", you: "आप" },
        hinglish: { title: "Civic Leaderboard", desc: "Community ko behtar banane wale top contributors.", rank: "Rank", pts: "Karma Points", load: "Rankings fetch ho rahi hain...", empty: "Koi contributor nahi mila.", you: "Aap" },
        mr: { title: "नागरी लीडरबोर्ड", desc: "समुदाय सुधारणारे शीर्ष योगदानकर्ते.", rank: "रँक", pts: "कर्म गुण", load: "रँकिंग आणत आहे...", empty: "अद्याप कोणतेही योगदानकर्ते आढळले नाहीत.", you: "तुम्ही" },
        gu: { title: "નાગરિક લીડરબોર્ડ", desc: "સમુદાયને સુધારતા ટોચના યોગદાનકર્તાઓ.", rank: "રેન્ક", pts: "કર્મ પોઈન્ટ", load: "રેન્કિંગ મેળવી રહ્યા છીએ...", empty: "હજી સુધી કોઈ યોગદાનકર્તા મળ્યા નથી.", you: "તમે" },
        te: { title: "సివిక్ లీడర్‌బోర్డ్", desc: "సమాజాన్ని మెరుగుపరుస్తున్న అగ్రశ్రేణి సహాయకులు.", rank: "ర్యాంక్", pts: "కర్మ పాయింట్లు", load: "ర్యాంకింగ్‌లను పొందుతోంది...", empty: "ఇంకా సహాయకులు కనుగొనబడలేదు.", you: "మీరు" },
        ta: { title: "குடிமக்கள் லீடர்போர்டு", desc: "சமூகத்தை மேம்படுத்தும் சிறந்த பங்களிப்பாளர்கள்.", rank: "தரம்", pts: "கர்மா புள்ளிகள்", load: "தரவரிசைகளை பெறுகிறது...", empty: "பங்களிப்பாளர்கள் இன்னும் கண்டறியப்படவில்லை.", you: "நீங்கள்" },
        kn: { title: "ಸಿವಿಕ್ ಲೀಡರ್‌ಬೋರ್ಡ್", desc: "ಸಮುದಾಯವನ್ನು ಸುಧಾರಿಸುವ ಉನ್ನತ ಕೊಡುಗೆದಾರರು.", rank: "ಶ್ರೇಣಿ", pts: "ಕರ್ಮ ಅಂಕಗಳು", load: "ಶ್ರೇಣಿಗಳನ್ನು ಪಡೆಯಲಾಗುತ್ತಿದೆ...", empty: "ಇನ್ನೂ ಯಾವುದೇ ಕೊಡುಗೆದಾರರು ಕಂಡುಬಂದಿಲ್ಲ.", you: "ನೀವು" },
        ml: { title: "സിവിക് ലീഡർബോർഡ്", desc: "സമൂഹത്തെ മെച്ചപ്പെടുത്തുന്ന മികച്ച സംഭാവനക്കാർ.", rank: "റാങ്ക്", pts: "കർമ്മ പോയിന്റുകൾ", load: "റാങ്കിംഗുകൾ നേടുന്നു...", empty: "സംഭാവനക്കാരെ ഇതുവരെ കണ്ടെത്തിയില്ല.", you: "നിങ്ങൾ" },
        bn: { title: "সিভিক লিডারবোর্ড", desc: "সম্প্রদায়ের উন্নতি করা শীর্ষ অবদানকারীরা।", rank: "র‌্যাঙ্ক", pts: "কর্ম পয়েন্ট", load: "র‌্যাঙ্কিং আনা হচ্ছে...", empty: "এখনও কোন অবদানকারী পাওয়া যায়নি।", you: "আপনি" },
        pa: { title: "ਨਾਗਰਿਕ ਲੀਡਰਬੋਰਡ", desc: "ਭਾਈਚਾਰੇ ਨੂੰ ਬਿਹਤਰ ਬਣਾਉਣ ਵਾਲੇ ਚੋਟੀ ਦੇ ਯੋਗਦਾਨ ਪਾਉਣ ਵਾਲੇ।", rank: "ਰੈਂਕ", pts: "ਕਰਮ ਅੰਕ", load: "ਰੈਂਕਿੰਗ ਪ੍ਰਾਪਤ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ...", empty: "ਅਜੇ ਤੱਕ ਕੋਈ ਯੋਗਦਾਨ ਪਾਉਣ ਵਾਲਾ ਨਹੀਂ ਮਿਲਿਆ।", you: "ਤੁਸੀਂ" },
        or: { title: "ସିଭିକ୍ ଲିଡରବୋର୍ଡ", desc: "ସମ୍ପ୍ରଦାୟକୁ ଉନ୍ନତ କରୁଥିବା ଶ୍ରେଷ୍ଠ ଯୋଗଦାନକାରୀମାନେ।", rank: "ମାନ୍ୟତା", pts: "କର୍ମ ପଏଣ୍ଟ", load: "ମାନ୍ୟତା ଅଣାଯାଉଛି...", empty: "ପର୍ଯ୍ୟନ୍ତ କୌଣସି ଯୋଗଦାନକାରୀ ମିଳିନାହାଁନ୍ତି।", you: "ଆପଣ" },
        as: { title: "চিভিক লিডাৰবোৰ্ড", desc: "সম্প্ৰদায় উন্নত কৰা শীৰ্ষ অৱদানকাৰীসকল।", rank: "ৰেংক", pts: "কৰ্ম পইণ্ট", load: "ৰেংকিং অনা হৈছে...", empty: "এতিয়ালৈকে কোনো অৱদানকাৰী পোৱা হোৱা নাই।", you: "আপুনি" },
        ur: { title: "سوک لیڈر بورڈ", desc: "معاشرے کو بہتر بنانے والے سرفہرست شراکت دار۔", rank: "رینک", pts: "کرما پوائنٹس", load: "رینکنگ حاصل کی جا رہی ہے۔۔۔", empty: "ابھی تک کوئی شراکت دار نہیں ملا۔", you: "آپ" },
        bho: { title: "नागरिक लीडरबोर्ड", desc: "समाज के बेहतर बनावे वाला शीर्ष योगदानकर्ता लोग।", rank: "रैंक", pts: "कर्म अंक", load: "रैंकिंग प्राप्त कइल जा रहल बा...", empty: "अभि ले कवनो योगदानकर्ता नइखे मिलल।", you: "रउआ" }
    };

    const currentT = t[lang] || t['en'];
    const currentUserId = auth.currentUser?.uid;

    // Staggered Animation Logic
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        show: { opacity: 1, x: 0 }
    };

    const getRankIcon = (index) => {
        switch(index) {
            case 0: return <Trophy size={24} className="text-[#FFB300]" strokeWidth={2.5} />;
            case 1: return <Medal size={24} className="text-[#111111]" strokeWidth={2.5} />;
            case 2: return <Award size={24} className="text-[#00897B]" strokeWidth={2.5} />;
            default: return <span className="text-[1rem] font-black text-[#111111]">{index + 1}</span>;
        }
    };

    return (
        <div className="min-h-screen bg-[#FFFFFF] font-sans text-[#111111] relative pb-32">
            
            {/* Action Header */}
            <div className="bg-[#FFFFFF] px-6 pt-12 pb-4 sticky top-0 z-40 border-b border-[#111111]/10 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="text-[#111111] outline-none">
                    <ChevronLeft size={28} strokeWidth={2.5} />
                </button>
                <span className="font-black text-[1.2rem] text-[#111111] tracking-tight">
                    {currentT.title}
                </span>
            </div>

            {/* Context Header Area */}
            <div className="bg-[#00897B] text-[#FFFFFF] px-6 py-10 shadow-md border-b border-[#111111]">
                <div className="max-w-[500px] mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-[1.8rem] font-black leading-tight tracking-tight mb-2">
                            {currentT.title}
                        </h1>
                        <p className="text-[0.95rem] font-medium opacity-90 max-w-[250px]">
                            {currentT.desc}
                        </p>
                    </div>
                    <Trophy size={64} className="text-[#FFB300] opacity-90 shrink-0" strokeWidth={1.5} />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-[500px] mx-auto px-4 mt-8">
                
                {isLoading ? (
                    <div className="w-full flex flex-col items-center justify-center py-20">
                        <div className="w-8 h-8 border-4 border-[#111111]/10 border-t-[#00897B] rounded-full animate-spin mb-4"></div>
                        <span className="font-bold text-[0.9rem] text-[#111111]">{currentT.load}</span>
                    </div>
                ) : leaders.length === 0 ? (
                    <div className="w-full text-center py-20 bg-[#FFFFFF] border border-[#111111]/10 rounded-2xl">
                        <span className="font-bold text-[0.9rem] text-[#111111]">{currentT.empty}</span>
                    </div>
                ) : (
                    <motion.div 
                        className="flex flex-col gap-3"
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                    >
                        {leaders.map((user, index) => {
                            const isCurrentUser = user.id === currentUserId;
                            
                            return (
                                <motion.div 
                                    key={user.id}
                                    variants={itemVariants}
                                    className={`w-full flex items-center justify-between p-4 rounded-[20px] transition-colors border ${
                                        isCurrentUser ? 'bg-[#00897B] border-[#00897B]' : 'bg-[#FFFFFF] border-[#111111]/10 hover:bg-[#111111]/5'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 flex items-center justify-center shrink-0 rounded-full border-2 ${
                                            isCurrentUser ? 'bg-[#FFFFFF] border-[#FFFFFF]' : 'bg-[#FFFFFF] border-[#111111]/10'
                                        }`}>
                                            {isCurrentUser && index > 2 ? <span className="text-[1rem] font-black text-[#00897B]">{index + 1}</span> : getRankIcon(index)}
                                        </div>
                                        
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className={`font-black text-[1.05rem] tracking-tight ${isCurrentUser ? 'text-[#FFFFFF]' : 'text-[#111111]'}`}>
                                                    {user.displayName || 'Citizen'}
                                                </span>
                                                {isCurrentUser && (
                                                    <span className="bg-[#FFB300] text-[#111111] text-[0.65rem] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                        {currentT.you}
                                                    </span>
                                                )}
                                            </div>
                                            <span className={`text-[0.8rem] font-bold mt-0.5 ${isCurrentUser ? 'text-[#FFFFFF]/80' : 'text-[#111111]/50'}`}>
                                                {user.location || 'Local Community'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end">
                                        <span className={`text-[1.2rem] font-black ${isCurrentUser ? 'text-[#FFB300]' : 'text-[#00897B]'}`}>
                                            {user.points || 0}
                                        </span>
                                        <span className={`text-[0.65rem] font-bold uppercase tracking-wider ${isCurrentUser ? 'text-[#FFFFFF]/80' : 'text-[#111111]/50'}`}>
                                            {currentT.pts}
                                        </span>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </motion.div>
                )}
            </div>
        </div>
    );
}