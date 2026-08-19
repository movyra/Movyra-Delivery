import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, VolumeX, MoreVertical, Send, Shield, EyeOff } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function StoryViewer() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lang, setLang] = useState('en');
    
    const [stories, setStories] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [isPaused, setIsPaused] = useState(false);
    
    // Progress Bar State
    const [progress, setProgress] = useState(0);
    const progressInterval = useRef(null);
    const videoRef = useRef(null);

    // Language Synchronization
    useEffect(() => {
        const savedLang = localStorage.getItem('nagrik_lang') || navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'hinglish', 'mr', 'gu', 'te', 'ta', 'kn', 'ml', 'bn', 'pa', 'or', 'as', 'ur', 'bho'];
        if (supported.includes(savedLang)) setLang(savedLang);
    }, []);

    // 15 Comprehensive Indian Language Translations
    const t = {
        en: { loading: "Loading story...", reply: "Send message...", no_story: "Story expired or unavailable." },
        hi: { loading: "स्टोरी लोड हो रही है...", reply: "संदेश भेजें...", no_story: "स्टोरी समाप्त हो गई या अनुपलब्ध है।" },
        hinglish: { loading: "Story load ho rahi hai...", reply: "Message bhejein...", no_story: "Story expire ho gayi ya available nahi hai." },
        mr: { loading: "स्टोरी लोड होत आहे...", reply: "संदेश पाठवा...", no_story: "स्टोरी कालबाह्य झाली किंवा अनुपलब्ध आहे." },
        gu: { loading: "સ્ટોરી લોડ થઈ રહી છે...", reply: "સંદેશ મોકલો...", no_story: "સ્ટોરી સમાપ્ત થઈ ગઈ અથવા અનુપલબ્ધ છે." },
        te: { loading: "స్టోరీ లోడ్ అవుతోంది...", reply: "సందేశం పంపండి...", no_story: "స్టోరీ గడువు ముగిసింది లేదా అందుబాటులో లేదు." },
        ta: { loading: "கதை ஏற்றப்படுகிறது...", reply: "செய்தி அனுப்பு...", no_story: "கதை காலாவதியானது அல்லது கிடைக்கவில்லை." },
        kn: { loading: "ಕಥೆ ಲೋಡ್ ಆಗುತ್ತಿದೆ...", reply: "ಸಂದೇಶ ಕಳುಹಿಸಿ...", no_story: "ಕಥೆ ಅವಧಿ ಮೀರಿದೆ ಅಥವಾ ಲಭ್ಯವಿಲ್ಲ." },
        ml: { loading: "സ്റ്റോറി ലോഡ് ചെയ്യുന്നു...", reply: "സന്ദേശം അയയ്ക്കുക...", no_story: "സ്റ്റോറി കാലഹരണപ്പെട്ടു അല്ലെങ്കിൽ ലഭ്യമല്ല." },
        bn: { loading: "স্টোরি লোড হচ্ছে...", reply: "বার্তা পাঠান...", no_story: "স্টোরি মেয়াদ শেষ বা অনুপলব্ধ।" },
        pa: { loading: "ਸਟੋਰੀ ਲੋਡ ਹੋ ਰਹੀ ਹੈ...", reply: "ਸੁਨੇਹਾ ਭੇਜੋ...", no_story: "ਸਟੋਰੀ ਦੀ ਮਿਆਦ ਖਤਮ ਹੋ ਗਈ ਜਾਂ ਉਪਲਬਧ ਨਹੀਂ ਹੈ।" },
        or: { loading: "ଷ୍ଟୋରୀ ଲୋଡ୍ ହେଉଛି...", reply: "ବାର୍ତ୍ତା ପଠାନ୍ତୁ...", no_story: "ଷ୍ଟୋରୀର ମିଆଦ ଶେଷ ହୋଇଛି କିମ୍ବା ଉପଲବ୍ଧ ନାହିଁ।" },
        as: { loading: "ষ্টোৰী ল'ড হৈ আছে...", reply: "বাৰ্তা পঠাওক...", no_story: "ষ্টোৰীৰ ম্যাদ উকলিছে বা উপলব্ধ নহয়।" },
        ur: { loading: "اسٹوری لوڈ ہو رہی ہے۔۔۔", reply: "پیغام بھیجیں۔۔۔", no_story: "اسٹوری کی میعاد ختم ہو گئی یا دستیاب نہیں ہے۔" },
        bho: { loading: "स्टोरी लोड हो रहल बा...", reply: "संदेश भेजीं...", no_story: "स्टोरी खतम हो गइल भा उपलब्ध नइखे।" }
    };

    const currentT = t[lang] || t['en'];

    // Fetch Stories
    useEffect(() => {
        const fetchStories = async () => {
            setIsLoading(true);
            try {
                // Fetch recent posts to use as stories (filtering logic can be refined later for explicit 'story' tags)
                const q = query(collection(db, 'nagrik_reels'), orderBy('createdAt', 'desc'), limit(6));
                const snapshot = await getDocs(q);
                const fetchedStories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                if (fetchedStories.length > 0) {
                    setStories(fetchedStories);
                    // Find the index of the requested story, default to 0
                    const reqIndex = fetchedStories.findIndex(s => s.id === id);
                    setCurrentIndex(reqIndex >= 0 ? reqIndex : 0);
                }
            } catch (error) {
                console.error("Story fetch error", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStories();
    }, [id]);

    // Handle Auto-Advance and Progress Bar
    useEffect(() => {
        if (isLoading || stories.length === 0 || isPaused) {
            clearInterval(progressInterval.current);
            return;
        }

        const currentStory = stories[currentIndex];
        
        // If it's a video, let the video's 'timeupdate' event handle progress
        if (currentStory?.type !== 'image' && videoRef.current) {
            clearInterval(progressInterval.current);
            return; 
        }

        // For images, set a fixed 5-second timer
        const DURATION = 5000;
        const intervalTime = 50;
        const step = (intervalTime / DURATION) * 100;

        progressInterval.current = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval.current);
                    handleNextStory();
                    return 0;
                }
                return prev + step;
            });
        }, intervalTime);

        return () => clearInterval(progressInterval.current);
    }, [currentIndex, isLoading, isPaused, stories]);

    // Reset progress when index changes
    useEffect(() => {
        setProgress(0);
    }, [currentIndex]);

    // Video specific progress tracking
    const handleVideoProgress = (e) => {
        const video = e.target;
        if (!video.duration) return;
        const percent = (video.currentTime / video.duration) * 100;
        setProgress(percent);
    };

    const handleVideoEnded = () => {
        handleNextStory();
    };

    const handleNextStory = () => {
        if (currentIndex < stories.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            navigate('/feed'); // Exit if it's the last story
        }
    };

    const handlePrevStory = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        } else {
            setProgress(0); // Restart current if first
            if (videoRef.current) videoRef.current.currentTime = 0;
        }
    };

    // Screen Tap Navigation & Pausing
    const handleScreenTap = (e) => {
        const screenWidth = window.innerWidth;
        const tapX = e.clientX;
        
        // Tap on left 30% goes back, right 70% goes forward
        if (tapX < screenWidth * 0.3) {
            handlePrevStory();
        } else {
            handleNextStory();
        }
    };

    const handlePressStart = () => {
        setIsPaused(true);
        if (videoRef.current) videoRef.current.pause();
    };

    const handlePressEnd = () => {
        setIsPaused(false);
        if (videoRef.current) videoRef.current.play();
    };

    if (isLoading) {
        return (
            <div className="w-full h-[100dvh] bg-[#111111] flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-4 border-t-transparent border-[#FFFFFF] rounded-full animate-spin mb-4"></div>
                <span className="font-bold text-[0.9rem] text-[#FFFFFF]/60">{currentT.loading}</span>
            </div>
        );
    }

    if (stories.length === 0) {
        return (
            <div className="w-full h-[100dvh] bg-[#111111] flex flex-col items-center justify-center relative">
                <button onClick={() => navigate('/feed')} className="absolute top-6 right-4 text-[#FFFFFF] outline-none">
                    <X size={28} />
                </button>
                <span className="font-bold text-[1rem] text-[#FFFFFF]/50">{currentT.no_story}</span>
            </div>
        );
    }

    const activeStory = stories[currentIndex];
    const isAnonymous = activeStory.isAnonymous;
    const authorName = isAnonymous ? 'Hidden Citizen' : (activeStory.authorName || 'Citizen');

    return (
        <div className="w-full h-[100dvh] bg-[#111111] relative overflow-hidden select-none touch-none">
            
            {/* Progress Bars Container */}
            <div className="absolute top-0 left-0 right-0 z-40 pt-4 px-2 flex gap-1 bg-gradient-to-b from-[#111111]/80 to-transparent pb-6 pointer-events-none">
                {stories.map((_, idx) => (
                    <div key={idx} className="flex-1 h-0.5 bg-[#FFFFFF]/30 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-[#FFFFFF] rounded-full transition-all duration-75 ease-linear"
                            style={{ 
                                width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%' 
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Top Bar Header */}
            <div className="absolute top-8 left-0 right-0 z-40 px-4 flex items-center justify-between pointer-events-auto">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#FFFFFF]/20 border border-[#FFFFFF]/30 flex items-center justify-center backdrop-blur-sm overflow-hidden shrink-0">
                        {isAnonymous ? <EyeOff size={16} className="text-[#FFFFFF]" /> : <span className="text-[#FFFFFF] font-black text-[0.8rem] uppercase">{authorName.charAt(0)}</span>}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[#FFFFFF] text-[0.85rem] font-bold leading-tight flex items-center gap-1 drop-shadow-md">
                            {authorName}
                            {!isAnonymous && <Shield size={12} className="text-[#FFFFFF]" fill="#FFFFFF" />}
                        </span>
                        <span className="text-[#FFFFFF]/70 text-[0.7rem] font-medium leading-tight drop-shadow-md">
                            {activeStory.location || 'Local Area'}
                        </span>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <button onClick={() => setIsMuted(!isMuted)} className="text-[#FFFFFF] outline-none active:scale-95">
                        {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
                    </button>
                    <button className="text-[#FFFFFF] outline-none active:scale-95">
                        <MoreVertical size={22} />
                    </button>
                    <button onClick={() => navigate('/feed')} className="text-[#FFFFFF] outline-none active:scale-95 ml-2">
                        <X size={28} />
                    </button>
                </div>
            </div>

            {/* Media Content & Tap Detection Area */}
            <div 
                className="w-full h-full relative flex items-center justify-center bg-[#111111]"
                onPointerDown={handlePressStart}
                onPointerUp={(e) => {
                    handlePressEnd();
                    handleScreenTap(e);
                }}
                onPointerLeave={handlePressEnd}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeStory.id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="w-full h-full"
                    >
                        {activeStory.type === 'image' ? (
                            <img src={activeStory.mediaUrl} alt="Story" className="w-full h-full object-cover" draggable="false" />
                        ) : (
                            <video 
                                ref={videoRef}
                                src={activeStory.mediaUrl || activeStory.videoUrl} 
                                className="w-full h-full object-cover" 
                                autoPlay 
                                playsInline 
                                muted={isMuted}
                                onTimeUpdate={handleVideoProgress}
                                onEnded={handleVideoEnded}
                            />
                        )}
                        
                        {/* Gradient Overlay for Bottom Content */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/80 via-transparent to-transparent pointer-events-none" />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Bottom Interaction Bar */}
            <div className="absolute bottom-0 left-0 right-0 z-40 p-4 pb-6 pointer-events-auto flex items-center gap-3">
                <div className="flex-1 h-12 rounded-full border border-[#FFFFFF]/30 bg-[#111111]/20 backdrop-blur-md px-4 flex items-center">
                    <input 
                        type="text" 
                        placeholder={currentT.reply} 
                        className="w-full bg-transparent text-[#FFFFFF] text-[0.9rem] placeholder-[#FFFFFF]/60 outline-none"
                    />
                </div>
                <button className="w-12 h-12 rounded-full bg-[#111111]/20 backdrop-blur-md flex items-center justify-center outline-none active:scale-95 border border-[#FFFFFF]/30 text-[#FFFFFF]">
                    <Send size={20} className="ml-1" />
                </button>
            </div>

        </div>
    );
}