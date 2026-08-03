import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Share2, MapPin, Play } from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';

// Sub-component for individual video reels to manage Intersection Observer independently
const ReelItem = ({ reel, currentT, isMuted, toggleMute }) => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.6
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    videoRef.current?.play().then(() => setIsPlaying(true)).catch(console.error);
                } else {
                    videoRef.current?.pause();
                    setIsPlaying(false);
                }
            });
        }, options);

        if (videoRef.current) {
            observer.observe(videoRef.current);
        }

        return () => {
            if (videoRef.current) {
                observer.unobserve(videoRef.current);
            }
        };
    }, []);

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

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: reel.title,
                    text: reel.description,
                    url: window.location.href,
                });
            } catch (error) {
                console.error("Share failed", error);
            }
        }
    };

    return (
        <div className="w-full h-[100dvh] snap-center relative bg-[#111111] overflow-hidden flex items-center justify-center">
            {/* Real Video Element */}
            <video 
                ref={videoRef}
                src={reel.videoUrl}
                loop
                muted={isMuted}
                playsInline
                className="w-full h-full object-cover"
                onClick={togglePlay}
            />

            {/* Play State Indicator */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="w-20 h-20 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <Play size={40} className="text-white ml-2" fill="white" />
                    </div>
                </div>
            )}

            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none"></div>

            {/* Header / Location */}
            <div className="absolute top-12 left-4 right-16 z-20 flex items-center gap-2">
                <div className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5">
                    <MapPin size={14} className="text-[#D32F2F]" />
                    <span className="text-white text-[0.75rem] font-bold tracking-wide">{reel.location}</span>
                </div>
            </div>

            {/* Side Action Buttons */}
            <div className="absolute right-4 bottom-32 z-20 flex flex-col gap-6 items-center">
                <button 
                    onClick={toggleMute}
                    className="w-12 h-12 bg-black/50 backdrop-blur-md rounded-full flex flex-col items-center justify-center border border-white/10 active:scale-95 transition-transform outline-none text-white"
                >
                    {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
                </button>
                
                <button 
                    onClick={handleShare}
                    className="w-12 h-12 bg-black/50 backdrop-blur-md rounded-full flex flex-col items-center justify-center border border-white/10 active:scale-95 transition-transform outline-none text-white"
                >
                    <Share2 size={22} />
                </button>
            </div>

            {/* Bottom Content Description */}
            <div className="absolute bottom-24 left-4 right-20 z-20">
                <h2 className="text-white text-[1.1rem] font-black leading-tight mb-2 tracking-tight drop-shadow-md">
                    {reel.title}
                </h2>
                <p className="text-white/90 text-[0.9rem] font-medium leading-snug line-clamp-2 drop-shadow-sm">
                    {reel.description}
                </p>
            </div>
        </div>
    );
};

export default function Feed() {
    const [lang, setLang] = useState('en');
    const [reels, setReels] = useState([]);
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
        en: { title: "Community Updates", loading: "Loading updates...", no_data: "No updates found at the moment." },
        hi: { title: "सामुदायिक अपडेट", loading: "अपडेट लोड हो रहे हैं...", no_data: "फिलहाल कोई अपडेट नहीं मिला।" },
        hinglish: { title: "Community Updates", loading: "Updates load ho rahe hain...", no_data: "Abhi koi update nahi mila." },
        mr: { title: "सामुदायिक अपडेट", loading: "अपडेट्स लोड होत आहेत...", no_data: "सध्या कोणतेही अपडेट आढळले नाहीत." },
        gu: { title: "સમુદાય અપડેટ્સ", loading: "અપડેટ્સ લોડ થઈ રહ્યા છે...", no_data: "હાલમાં કોઈ અપડેટ મળ્યું નથી." },
        te: { title: "కమ్యూనిటీ అప్‌డేట్‌లు", loading: "నవీకరణలు లోడ్ అవుతున్నాయి...", no_data: "ప్రస్తుతం ఎలాంటి నవీకరణలు కనుగొనబడలేదు." },
        ta: { title: "சமூக அறிவிப்புகள்", loading: "புதுப்பிப்புகள் ஏற்றப்படுகின்றன...", no_data: "தற்போது எந்த புதுப்பிப்புகளும் இல்லை." },
        kn: { title: "ಸಮುದಾಯದ ನವೀಕರಣಗಳು", loading: "ನವೀಕರಣಗಳು ಲೋಡ್ ಆಗುತ್ತಿವೆ...", no_data: "ಪ್ರಸ್ತುತ ಯಾವುದೇ ನವೀಕರಣಗಳು ಕಂಡುಬಂದಿಲ್ಲ." },
        ml: { title: "കമ്മ്യൂണിറ്റി അപ്ഡേറ്റുകൾ", loading: "അപ്ഡേറ്റുകൾ ലോഡ് ചെയ്യുന്നു...", no_data: "നിലവിൽ അപ്ഡേറ്റുകളൊന്നും കണ്ടെത്തിയില്ല." },
        bn: { title: "কমিউনিটি আপডেট", loading: "আপডেট লোড হচ্ছে...", no_data: "এই মুহূর্তে কোনো আপডেট পাওয়া যায়নি।" },
        pa: { title: "ਭਾਈਚਾਰਕ ਅੱਪਡੇਟ", loading: "ਅੱਪਡੇਟ ਲੋਡ ਹੋ ਰਹੇ ਹਨ...", no_data: "ਇਸ ਸਮੇਂ ਕੋਈ ਅੱਪਡੇਟ ਨਹੀਂ ਮਿਲਿਆ।" },
        or: { title: "ସମ୍ପ୍ରଦାୟ ଅପଡେଟ୍", loading: "ଅପଡେଟ୍ ଲୋଡ୍ ହେଉଛି...", no_data: "ବର୍ତ୍ତମାନ କୌଣସି ଅପଡେଟ୍ ମିଳିଲା ନାହିଁ।" },
        as: { title: "সম্প্ৰদায়ৰ আপডেট", loading: "আপডেট ল'ড হৈ আছে...", no_data: "বৰ্তমান কোনো আপডেট পোৱা নগ'ল।" },
        ur: { title: "کمیونٹی اپ ڈیٹس", loading: "اپ ڈیٹس لوڈ ہو رہے ہیں۔۔۔", no_data: "فی الحال کوئی اپ ڈیٹ نہیں ملا۔" },
        bho: { title: "सामुदायिक अपडेट", loading: "अपडेट लोड हो रहल बा...", no_data: "फिलहाल कवनो अपडेट ना मिलल।" }
    };

    const currentT = t[lang] || t['en'];

    // Real-time Database Fetching for Video Feed
    useEffect(() => {
        setIsLoading(true);
        const reelsRef = collection(db, 'nagrik_reels');
        const q = query(reelsRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedReels = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setReels(fetchedReels);
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
        <div className="bg-[#000000] w-full h-[100dvh] overflow-y-scroll snap-y snap-mandatory hide-scrollbar relative">
            
            {/* Loading & Empty States */}
            {isLoading && (
                <div className="absolute inset-0 z-50 bg-[#111111] flex flex-col items-center justify-center text-white">
                    <div className="w-8 h-8 border-4 border-t-transparent border-[#00897B] rounded-full animate-spin mb-4"></div>
                    <span className="font-bold text-[0.9rem]">{currentT.loading}</span>
                </div>
            )}
            
            {!isLoading && reels.length === 0 && (
                <div className="absolute inset-0 z-50 bg-[#111111] flex items-center justify-center text-white">
                    <span className="font-bold text-[1rem] text-[#888888]">{currentT.no_data}</span>
                </div>
            )}

            {/* Video List */}
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