import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Share2, MapPin, Play, Heart, MessageCircle, MoreVertical, Plus } from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

// Sub-component for individual video reels
const ReelItem = ({ reel, currentT, isMuted, toggleMute }) => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(reel.likes || 0);

    const currentUser = auth.currentUser;

    // Intersection Observer for Auto-Play
    useEffect(() => {
        const options = { root: null, rootMargin: '0px', threshold: 0.6 };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    videoRef.current?.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
                } else {
                    videoRef.current?.pause();
                    setIsPlaying(false);
                }
            });
        }, options);

        if (videoRef.current) observer.observe(videoRef.current);
        return () => {
            if (videoRef.current) observer.unobserve(videoRef.current);
        };
    }, []);

    // Check Initial Like Status
    useEffect(() => {
        if (!currentUser || !reel.id) return;
        const checkLike = async () => {
            const likeRef = doc(db, 'nagrik_likes', `${reel.id}_${currentUser.uid}`);
            const likeSnap = await getDoc(likeRef);
            if (likeSnap.exists()) setIsLiked(true);
        };
        checkLike();
    }, [currentUser, reel.id]);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
                setIsPlaying(false);
            } else {
                videoRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
            }
        }
    };

    const handleLike = async () => {
        if (!currentUser) {
            alert(currentT.req_login);
            return;
        }

        const likeRef = doc(db, 'nagrik_likes', `${reel.id}_${currentUser.uid}`);
        
        // Optimistic UI Update
        setIsLiked(!isLiked);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);

        try {
            if (isLiked) {
                await deleteDoc(likeRef);
            } else {
                await setDoc(likeRef, { reelId: reel.id, userId: currentUser.uid, timestamp: new Date() });
            }
        } catch (error) {
            console.error("Like toggle failed", error);
            // Revert on failure
            setIsLiked(!isLiked);
            setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: reel.title || currentT.share_title,
                    text: reel.description || currentT.share_desc,
                    url: window.location.href,
                });
            } catch (error) {
                console.error("Share failed", error);
            }
        }
    };

    return (
        <div className="w-full h-[100dvh] snap-center relative bg-[#111111] overflow-hidden flex items-center justify-center">
            {/* Media Element */}
            {reel.type === 'image' ? (
                <img src={reel.mediaUrl} alt={reel.title} className="w-full h-full object-cover" />
            ) : (
                <video 
                    ref={videoRef}
                    src={reel.mediaUrl || reel.videoUrl} // Fallback support
                    loop
                    muted={isMuted}
                    playsInline
                    className="w-full h-full object-cover"
                    onClick={togglePlay}
                />
            )}

            {/* Play State Indicator */}
            {reel.type !== 'image' && !isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="w-20 h-20 bg-[#111111]/40 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <Play size={40} className="text-[#FFFFFF] ml-2" fill="#FFFFFF" />
                    </div>
                </div>
            )}

            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/90 via-[#111111]/20 to-[#111111]/40 pointer-events-none"></div>

            {/* Top Bar / Location */}
            <div className="absolute top-24 left-4 right-16 z-20 flex items-center gap-2">
                <div className="bg-[#111111]/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#FFFFFF]/10 flex items-center gap-1.5">
                    <MapPin size={14} className="text-[#00897B]" />
                    <span className="text-[#FFFFFF] text-[0.75rem] font-bold tracking-wide">
                        {reel.location || currentT.local_update}
                    </span>
                </div>
            </div>

            {/* Side Action Buttons */}
            <div className="absolute right-4 bottom-28 z-20 flex flex-col gap-6 items-center">
                
                {/* Like Button */}
                <button onClick={handleLike} className="flex flex-col items-center gap-1 outline-none group">
                    <div className="w-12 h-12 bg-[#111111]/50 backdrop-blur-md rounded-full flex items-center justify-center border border-[#FFFFFF]/10 active:scale-95 transition-transform">
                        <Heart size={22} className={isLiked ? "text-[#FFB300]" : "text-[#FFFFFF]"} fill={isLiked ? "#FFB300" : "none"} />
                    </div>
                    <span className="text-[#FFFFFF] text-[0.75rem] font-bold drop-shadow-md">{likeCount}</span>
                </button>

                {/* Message Button */}
                <button onClick={() => alert(currentT.msg_dev)} className="flex flex-col items-center gap-1 outline-none">
                    <div className="w-12 h-12 bg-[#111111]/50 backdrop-blur-md rounded-full flex items-center justify-center border border-[#FFFFFF]/10 active:scale-95 transition-transform">
                        <MessageCircle size={22} className="text-[#FFFFFF]" />
                    </div>
                    <span className="text-[#FFFFFF] text-[0.75rem] font-bold drop-shadow-md">{currentT.chat}</span>
                </button>

                {/* Share Button */}
                <button onClick={handleShare} className="flex flex-col items-center gap-1 outline-none">
                    <div className="w-12 h-12 bg-[#111111]/50 backdrop-blur-md rounded-full flex items-center justify-center border border-[#FFFFFF]/10 active:scale-95 transition-transform">
                        <Share2 size={22} className="text-[#FFFFFF]" />
                    </div>
                </button>

                {/* Mute Toggle */}
                {reel.type !== 'image' && (
                    <button onClick={toggleMute} className="w-10 h-10 mt-2 bg-[#111111]/30 backdrop-blur-md rounded-full flex items-center justify-center border border-[#FFFFFF]/10 active:scale-95 transition-transform outline-none text-[#FFFFFF]">
                        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                )}
            </div>

            {/* Bottom Content Description */}
            <div className="absolute bottom-24 left-4 right-20 z-20">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[#00897B] border-2 border-[#FFFFFF] flex items-center justify-center shrink-0">
                        <span className="text-[#FFFFFF] font-black text-[0.7rem] uppercase">{reel.authorName?.charAt(0) || 'C'}</span>
                    </div>
                    <span className="text-[#FFFFFF] text-[0.9rem] font-black tracking-wide drop-shadow-md">
                        @{reel.authorName || 'Citizen'}
                    </span>
                    <button className="px-2 py-0.5 border border-[#FFFFFF]/50 rounded-full text-[#FFFFFF] text-[0.65rem] font-bold tracking-wider uppercase ml-2 active:bg-[#FFFFFF]/20 transition-colors outline-none">
                        {currentT.follow}
                    </button>
                </div>
                
                <h2 className="text-[#FFFFFF] text-[1.1rem] font-black leading-tight mb-2 tracking-tight drop-shadow-md">
                    {reel.title}
                </h2>
                <p className="text-[#FFFFFF]/90 text-[0.85rem] font-medium leading-snug line-clamp-2 drop-shadow-sm">
                    {reel.description}
                </p>
            </div>
        </div>
    );
};

export default function Feed() {
    const [lang, setLang] = useState('en');
    const [reels, setReels] = useState([]);
    const [stories, setStories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isMuted, setIsMuted] = useState(true);

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
        en: { title: "Community Feed", loading: "Loading feed...", no_data: "No updates found.", req_login: "Sign in required.", share_title: "Check this out on NagrikSetu", share_desc: "Local community update", local_update: "Local Update", chat: "Chat", follow: "Follow", my_story: "My Story", msg_dev: "Messaging interface loading..." },
        hi: { title: "सामुदायिक फ़ीड", loading: "फ़ीड लोड हो रहा है...", no_data: "कोई अपडेट नहीं मिला।", req_login: "साइन इन आवश्यक है।", share_title: "नागरिकसेतु पर इसे देखें", share_desc: "स्थानीय सामुदायिक अपडेट", local_update: "स्थानीय अपडेट", chat: "चैट", follow: "फॉलो करें", my_story: "मेरी स्टोरी", msg_dev: "मैसेजिंग इंटरफ़ेस लोड हो रहा है..." },
        hinglish: { title: "Community Feed", loading: "Feed load ho raha hai...", no_data: "Koi update nahi mila.", req_login: "Sign in zaroori hai.", share_title: "NagrikSetu par isko dekhein", share_desc: "Local community update", local_update: "Local Update", chat: "Chat", follow: "Follow", my_story: "Meri Story", msg_dev: "Messaging interface load ho raha hai..." },
        mr: { title: "सामुदायिक फीड", loading: "फीड लोड होत आहे...", no_data: "कोणतेही अपडेट्स आढळले नाहीत.", req_login: "साइन इन आवश्यक.", share_title: "नागरिकसेतू वर हे तपासा", share_desc: "स्थानिक समुदाय अपडेट", local_update: "स्थानिक अपडेट", chat: "चॅट", follow: "फॉलो करा", my_story: "माझी स्टोरी", msg_dev: "मेसेजिंग इंटरफेस लोड होत आहे..." },
        gu: { title: "સમુદાય ફીડ", loading: "ફીડ લોડ થઈ રહ્યું છે...", no_data: "કોઈ અપડેટ મળ્યા નથી.", req_login: "સાઇન ઇન જરૂરી છે.", share_title: "નાગરિકસેતુ પર આ જુઓ", share_desc: "સ્થાનિક સમુદાય અપડેટ", local_update: "સ્થાનિક અપડેટ", chat: "ચેટ", follow: "ફોલો કરો", my_story: "મારી સ્ટોરી", msg_dev: "મેસેજિંગ ઇન્ટરફેસ લોડ થઈ રહ્યું છે..." },
        te: { title: "కమ్యూనిటీ ఫీడ్", loading: "ఫీడ్ లోడ్ అవుతోంది...", no_data: "నవీకరణలు కనుగొనబడలేదు.", req_login: "సైన్ ఇన్ అవసరం.", share_title: "నాగ్రిక్ సేతులో దీనిని చూడండి", share_desc: "స్థానిక కమ్యూనిటీ నవీకరణ", local_update: "స్థానిక నవీకరణ", chat: "చాట్", follow: "అనుసరించండి", my_story: "నా స్టోరీ", msg_dev: "మెసేజింగ్ ఇంటర్‌ఫేస్ లోడ్ అవుతోంది..." },
        ta: { title: "சமூக ஊட்டம்", loading: "ஊட்டம் ஏற்றப்படுகிறது...", no_data: "புதுப்பிப்புகள் எதுவும் இல்லை.", req_login: "உள்நுழைவு தேவை.", share_title: "நாகரிக்சேதுவில் இதைப் பார்க்கவும்", share_desc: "உள்ளூர் சமூக புதுப்பிப்பு", local_update: "உள்ளூர் புதுப்பிப்பு", chat: "அரட்டை", follow: "பின்தொடர்", my_story: "என் கதை", msg_dev: "செய்தி இடைமுகம் ஏற்றப்படுகிறது..." },
        kn: { title: "ಸಮುದಾಯ ಫೀಡ್", loading: "ಫೀಡ್ ಲೋಡ್ ಆಗುತ್ತಿದೆ...", no_data: "ಯಾವುದೇ ನವೀಕರಣಗಳು ಕಂಡುಬಂದಿಲ್ಲ.", req_login: "ಸೈನ್ ಇನ್ ಅಗತ್ಯವಿದೆ.", share_title: "ನಾಗರಿಕ್ ಸೇತು ನಲ್ಲಿ ಇದನ್ನು ಪರಿಶೀಲಿಸಿ", share_desc: "ಸ್ಥಳೀಯ ಸಮುದಾಯ ನವೀಕರಣ", local_update: "ಸ್ಥಳೀಯ ನವೀಕರಣ", chat: "ಚಾಟ್", follow: "ಅನುಸರಿಸಿ", my_story: "ನನ್ನ ಕಥೆ", msg_dev: "ಮೆಸೇಜಿಂಗ್ ಇಂಟರ್ಫೇಸ್ ಲೋಡ್ ಆಗುತ್ತಿದೆ..." },
        ml: { title: "കമ്മ്യൂണിറ്റി ഫീഡ്", loading: "ഫീഡ് ലോഡ് ചെയ്യുന്നു...", no_data: "അപ്ഡേറ്റുകളൊന്നും കണ്ടെത്തിയില്ല.", req_login: "സൈൻ ഇൻ ആവശ്യമാണ്.", share_title: "നാഗരിക് സേതുവിൽ ഇത് പരിശോധിക്കുക", share_desc: "പ്രാദേശിക കമ്മ്യൂണിറ്റി അപ്ഡേറ്റ്", local_update: "പ്രാദേശിക അപ്ഡേറ്റ്", chat: "ചാറ്റ്", follow: "ഫോളോ ചെയ്യുക", my_story: "എന്റെ സ്റ്റോറി", msg_dev: "മെസേജിംഗ് ഇൻ്റർഫേസ് ലോഡ് ചെയ്യുന്നു..." },
        bn: { title: "কমিউনিটি ফিড", loading: "ফিড লোড হচ্ছে...", no_data: "কোনো আপডেট পাওয়া যায়নি।", req_login: "সাইন ইন প্রয়োজন।", share_title: "নাগরিকসেতুতে এটি দেখুন", share_desc: "স্থানীয় কমিউনিটি আপডেট", local_update: "স্থানীয় আপডেট", chat: "চ্যাট", follow: "ফলো করুন", my_story: "আমার স্টোরি", msg_dev: "মেসেজিং ইন্টারফেস লোড হচ্ছে..." },
        pa: { title: "ਭਾਈਚਾਰਕ ਫੀਡ", loading: "ਫੀਡ ਲੋਡ ਹੋ ਰਹੀ ਹੈ...", no_data: "ਕੋਈ ਅੱਪਡੇਟ ਨਹੀਂ ਮਿਲਿਆ।", req_login: "ਸਾਈਨ ਇਨ ਲੋੜੀਂਦਾ ਹੈ।", share_title: "ਨਾਗਰਿਕਸੇਤੂ 'ਤੇ ਇਸਦੀ ਜਾਂਚ ਕਰੋ", share_desc: "ਸਥਾਨਕ ਭਾਈਚਾਰਕ ਅੱਪਡੇਟ", local_update: "ਸਥਾਨਕ ਅੱਪਡੇਟ", chat: "ਚੈਟ", follow: "ਫਾਲੋ ਕਰੋ", my_story: "ਮੇਰੀ ਸਟੋਰੀ", msg_dev: "ਮੈਸੇਜਿੰਗ ਇੰਟਰਫੇਸ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ..." },
        or: { title: "ସମ୍ପ୍ରଦାୟ ଫିଡ୍", loading: "ଫିଡ୍ ଲୋଡ୍ ହେଉଛି...", no_data: "କୌଣସି ଅପଡେଟ୍ ମିଳିଲା ନାହିଁ।", req_login: "ସାଇନ୍ ଇନ୍ ଆବଶ୍ୟକ।", share_title: "ନାଗରିକସେତୁରେ ଏହା ଦେଖନ୍ତୁ", share_desc: "ସ୍ଥାନୀୟ ସମ୍ପ୍ରଦାୟ ଅପଡେଟ୍", local_update: "ସ୍ଥାନୀୟ ଅପଡେଟ୍", chat: "ଚାଟ୍", follow: "ଫଲୋ କରନ୍ତୁ", my_story: "ମୋର ଷ୍ଟୋରୀ", msg_dev: "ମେସେଜିଂ ଇଣ୍ଟରଫେସ୍ ଲୋଡ୍ ହେଉଛି..." },
        as: { title: "সম্প্ৰদায় ফীড", loading: "ফীড ল'ড হৈ আছে...", no_data: "কোনো আপডেট পোৱা নগ'ল।", req_login: "ছাইন ইন প্ৰয়োজনীয়।", share_title: "নাগৰিকসেতুত এইটো চাওক", share_desc: "স্থানীয় সম্প্ৰদায়ৰ আপডেট", local_update: "স্থানীয় আপডেট", chat: "চেট", follow: "ফলো কৰক", my_story: "মোৰ ষ্টোৰী", msg_dev: "মেছেজিং ইণ্টাৰফেচ ল'ড হৈ আছে..." },
        ur: { title: "کمیونٹی فیڈ", loading: "فیڈ لوڈ ہو رہی ہے۔۔۔", no_data: "کوئی اپ ڈیٹ نہیں ملا۔", req_login: "سائن ان درکار ہے۔", share_title: "ناگرک سیتو پر اسے چیک کریں", share_desc: "مقامی کمیونٹی اپ ڈیٹ", local_update: "مقامی اپ ڈیٹ", chat: "چیٹ", follow: "فالو کریں", my_story: "میری اسٹوری", msg_dev: "میسجنگ انٹرفیس لوڈ ہو رہا ہے۔۔۔" },
        bho: { title: "सामुदायिक फीड", loading: "फीड लोड हो रहल बा...", no_data: "कवनो अपडेट ना मिलल।", req_login: "साइन इन जरूरी बा।", share_title: "नागरिकसेतु पर एकरा के देखीं", share_desc: "स्थानीय सामुदायिक अपडेट", local_update: "स्थानीय अपडेट", chat: "चैट", follow: "फॉलो करीं", my_story: "हमार स्टोरी", msg_dev: "मैसेजिंग इंटरफ़ेस लोड हो रहल बा..." }
    };

    const currentT = t[lang] || t['en'];

    // Real-time Database Fetching for Video Feed
    useEffect(() => {
        setIsLoading(true);
        const reelsRef = collection(db, 'nagrik_reels');
        const q = query(reelsRef, orderBy('createdAt', 'desc'), limit(20));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // Artificial separation of stories vs feed based on existing logic constraint
            setStories(fetchedData.slice(0, 5));
            setReels(fetchedData);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching reels:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const toggleGlobalMute = () => {
        setIsMuted(!isMuted);
    };

    return (
        <div className="bg-[#111111] w-full h-[100dvh] overflow-y-scroll snap-y snap-mandatory hide-scrollbar relative">
            
            {/* Top Stories Bar */}
            <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-[#111111]/80 to-transparent pt-12 pb-4 px-4 pointer-events-auto flex items-center gap-4 overflow-x-auto no-scrollbar">
                {/* Add Story Node */}
                <div className="flex flex-col items-center gap-1 shrink-0 cursor-pointer">
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#111111]/50 flex items-center justify-center relative bg-[#FFFFFF]/10 backdrop-blur-sm">
                        <Plus size={24} className="text-[#FFFFFF]" />
                    </div>
                    <span className="text-[0.7rem] font-bold text-[#FFFFFF] drop-shadow-md">{currentT.my_story}</span>
                </div>

                {/* Dynamic Stories */}
                {stories.map((story) => (
                    <div key={story.id} className="flex flex-col items-center gap-1 shrink-0 cursor-pointer">
                        <div className="w-16 h-16 rounded-full border-2 border-[#00897B] p-0.5 flex items-center justify-center">
                            <img src={story.mediaUrl || story.thumbnailUrl || '/logo.png'} alt="Story" className="w-full h-full rounded-full object-cover bg-[#111111]" />
                        </div>
                        <span className="text-[0.7rem] font-bold text-[#FFFFFF] drop-shadow-md truncate w-16 text-center">
                            {story.authorName?.split(' ')[0] || 'Citizen'}
                        </span>
                    </div>
                ))}
            </div>

            {/* Loading & Empty States */}
            {isLoading && (
                <div className="absolute inset-0 z-50 bg-[#111111] flex flex-col items-center justify-center text-[#FFFFFF]">
                    <div className="w-8 h-8 border-4 border-t-transparent border-[#00897B] rounded-full animate-spin mb-4"></div>
                    <span className="font-bold text-[0.9rem]">{currentT.loading}</span>
                </div>
            )}
            
            {!isLoading && reels.length === 0 && (
                <div className="absolute inset-0 z-50 bg-[#111111] flex items-center justify-center text-[#FFFFFF]">
                    <span className="font-bold text-[1rem] text-[#FFFFFF]/50">{currentT.no_data}</span>
                </div>
            )}

            {/* Immersive Vertical Video List */}
            {!isLoading && reels.map((reel) => (
                <ReelItem 
                    key={reel.id} 
                    reel={reel} 
                    currentT={currentT} 
                    isMuted={isMuted} 
                    toggleMute={toggleGlobalMute} 
                />
            ))}
            
        </div>
    );
}