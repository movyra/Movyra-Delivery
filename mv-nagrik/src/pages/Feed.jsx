import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Share2, MapPin, Play, Heart, MessageCircle, MoreVertical, Plus, Bookmark, EyeOff, Shield, ArrowRight, Lock, Users, Mail, Chrome } from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot, doc, setDoc, deleteDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { db, auth } from '../firebaseConfig';

// Sub-component for individual social posts
const PostItem = ({ post, currentT, isMuted, toggleMute, navigate }) => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likes || 0);

    const currentUser = auth.currentUser;

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

    useEffect(() => {
        if (!currentUser || !post.id) return;
        const checkStatus = async () => {
            const likeRef = doc(db, 'nagrik_likes', `${post.id}_${currentUser.uid}`);
            const bookmarkRef = doc(db, 'nagrik_bookmarks', `${post.id}_${currentUser.uid}`);
            
            const [likeSnap, bookmarkSnap] = await Promise.all([getDoc(likeRef), getDoc(bookmarkRef)]);
            if (likeSnap.exists()) setIsLiked(true);
            if (bookmarkSnap.exists()) setIsBookmarked(true);
        };
        checkStatus();
    }, [currentUser, post.id]);

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
        if (!currentUser) return alert(currentT.req_login);
        const likeRef = doc(db, 'nagrik_likes', `${post.id}_${currentUser.uid}`);
        setIsLiked(!isLiked);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
        try {
            if (isLiked) await deleteDoc(likeRef);
            else await setDoc(likeRef, { postId: post.id, userId: currentUser.uid, timestamp: serverTimestamp() });
        } catch (error) {
            setIsLiked(!isLiked);
            setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
        }
    };

    const handleBookmark = async () => {
        if (!currentUser) return alert(currentT.req_login);
        const bookmarkRef = doc(db, 'nagrik_bookmarks', `${post.id}_${currentUser.uid}`);
        setIsBookmarked(!isBookmarked);
        try {
            if (isBookmarked) await deleteDoc(bookmarkRef);
            else await setDoc(bookmarkRef, { postId: post.id, userId: currentUser.uid, timestamp: serverTimestamp() });
        } catch (error) {
            setIsBookmarked(!isBookmarked);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: post.title || currentT.share_title,
                    text: post.description || currentT.share_desc,
                    url: window.location.href,
                });
            } catch (error) {
                console.error("Share failed", error);
            }
        }
    };

    return (
        <div className="w-full bg-[#FFFFFF] border-b border-[#111111]/10 mb-2">
            <div className="flex items-center justify-between p-3">
                <div 
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => navigate(`/profile/${post.authorId || 'anonymous'}`)}
                >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#FFB300] to-[#00897B] p-[2px]">
                        <div className="w-full h-full bg-[#FFFFFF] rounded-full border border-[#FFFFFF] flex items-center justify-center overflow-hidden">
                            {post.isAnonymous ? (
                                <EyeOff size={16} className="text-[#111111]/50" />
                            ) : (
                                <span className="text-[#111111] font-black text-[0.8rem] uppercase">{post.authorName?.charAt(0) || 'C'}</span>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[#111111] text-[0.85rem] font-bold leading-tight flex items-center gap-1">
                            {post.isAnonymous ? 'Hidden Citizen' : (post.authorName || 'Citizen')}
                            {!post.isAnonymous && <Shield size={12} className="text-[#00897B]" fill="#00897B" />}
                        </span>
                        <span className="text-[#111111]/50 text-[0.7rem] font-medium leading-tight">
                            {post.location || currentT.local_update}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="text-[#00897B] text-[0.8rem] font-bold outline-none">{currentT.follow}</button>
                    <button className="text-[#111111] outline-none"><MoreVertical size={18} /></button>
                </div>
            </div>

            <div className="w-full bg-[#F9FAFB] relative aspect-square flex items-center justify-center overflow-hidden">
                {post.type === 'image' ? (
                    <img src={post.mediaUrl} alt={post.title} className="w-full h-full object-cover" />
                ) : (
                    <>
                        <video 
                            ref={videoRef}
                            src={post.mediaUrl || post.videoUrl}
                            loop
                            muted={isMuted}
                            playsInline
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={togglePlay}
                        />
                        {!isPlaying && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                                <div className="w-16 h-16 bg-[#111111]/40 rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <Play size={30} className="text-[#FFFFFF] ml-1" fill="#FFFFFF" />
                                </div>
                            </div>
                        )}
                        <button onClick={toggleMute} className="absolute bottom-3 right-3 w-8 h-8 bg-[#111111]/60 backdrop-blur-sm rounded-full flex items-center justify-center outline-none text-[#FFFFFF] z-20">
                            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                        </button>
                    </>
                )}
            </div>

            <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-4">
                    <button onClick={handleLike} className="outline-none active:scale-95 transition-transform">
                        <Heart size={24} className={isLiked ? "text-[#FFB300]" : "text-[#111111]"} fill={isLiked ? "#FFB300" : "none"} />
                    </button>
                    <button onClick={() => navigate(`/comments/${post.id}`)} className="outline-none active:scale-95 transition-transform text-[#111111]">
                        <MessageCircle size={24} />
                    </button>
                    <button onClick={handleShare} className="outline-none active:scale-95 transition-transform text-[#111111]">
                        <Share2 size={24} />
                    </button>
                </div>
                <button onClick={handleBookmark} className="outline-none active:scale-95 transition-transform">
                    <Bookmark size={24} className={isBookmarked ? "text-[#00897B]" : "text-[#111111]"} fill={isBookmarked ? "#00897B" : "none"} />
                </button>
            </div>

            <div className="px-4 pb-4">
                <span className="text-[#111111] text-[0.85rem] font-bold mb-1 block">{likeCount} {currentT.likes}</span>
                <p className="text-[0.85rem] text-[#111111] leading-snug mb-1">
                    <span className="font-bold mr-2">{post.isAnonymous ? 'Hidden Citizen' : (post.authorName || 'Citizen')}</span>
                    {post.description}
                </p>
                <button onClick={() => navigate(`/comments/${post.id}`)} className="text-[#111111]/50 text-[0.8rem] font-medium outline-none">
                    {currentT.view_comments}
                </button>
            </div>
        </div>
    );
};

export default function Feed() {
    const navigate = useNavigate();
    const [lang, setLang] = useState('en');
    const [posts, setPosts] = useState([]);
    const [stories, setStories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    
    // Core Navigation State
    const [step, setStep] = useState('loading'); // loading | login | tutorial | feed

    // Authentication Form State
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [authProcessing, setAuthProcessing] = useState(false);

    useEffect(() => {
        const savedLang = localStorage.getItem('nagrik_lang') || navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'hinglish', 'mr', 'gu', 'te', 'ta', 'kn', 'ml', 'bn', 'pa', 'or', 'as', 'ur', 'bho'];
        if (supported.includes(savedLang)) setLang(savedLang);
    }, []);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                // Check if it is a first time user by verifying tutorial completion flag in database
                const userRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userRef);
                
                if (userDoc.exists() && userDoc.data().tutorialCompleted) {
                    setStep('feed');
                    fetchFeedData();
                } else {
                    setStep('tutorial');
                }
            } else {
                setStep('login');
            }
        });
        return () => unsubscribe();
    }, []);

    const t = {
        en: { title: "Community Feed", loading: "Loading feed...", no_data: "No updates found.", req_login: "Sign in required.", share_title: "Check this out", share_desc: "Local community update", local_update: "Local Update", chat: "Chat", follow: "Follow", my_story: "Your Story", likes: "likes", view_comments: "View all comments", tut_title: "Welcome to Civic Hub", tut_desc: "Report issues anonymously, follow local updates, and connect with your community.", start: "Enter Network", login_title: "Citizen Access", email: "Email Address", pass: "Password", btn_login: "Sign In", btn_signup: "Create Account", btn_google: "Continue with Google", switch_signup: "Need an account?", switch_login: "Already have an account?", err_auth: "Authentication failed." },
        hi: { title: "सामुदायिक फ़ीड", loading: "फ़ीड लोड हो रहा है...", no_data: "कोई अपडेट नहीं मिला।", req_login: "साइन इन आवश्यक है।", share_title: "इसे देखें", share_desc: "स्थानीय सामुदायिक अपडेट", local_update: "स्थानीय अपडेट", chat: "चैट", follow: "फॉलो करें", my_story: "आपकी स्टोरी", likes: "पसंद", view_comments: "सभी टिप्पणियां देखें", tut_title: "नागरिक हब में आपका स्वागत है", tut_desc: "गुमनाम रूप से समस्याओं की रिपोर्ट करें, स्थानीय अपडेट का पालन करें, और अपने समुदाय से जुड़ें।", start: "नेटवर्क दर्ज करें", login_title: "नागरिक पहुंच", email: "ईमेल पता", pass: "पासवर्ड", btn_login: "साइन इन करें", btn_signup: "खाता बनाएं", btn_google: "Google के साथ जारी रखें", switch_signup: "क्या कोई खाता चाहिए?", switch_login: "क्या आपके पास पहले से खाता है?", err_auth: "प्रमाणीकरण विफल रहा।" }
    };
    const currentT = t[lang] || t['en'];

    const handleAuthSubmit = async (e) => {
        e.preventDefault();
        setLoginError('');
        setAuthProcessing(true);
        try {
            if (isSignUp) {
                await createUserWithEmailAndPassword(auth, email, password);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
        } catch (err) {
            setLoginError(currentT.err_auth);
            setAuthProcessing(false);
        }
    };

    const handleGoogleAuth = async () => {
        setLoginError('');
        setAuthProcessing(true);
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (err) {
            setLoginError(currentT.err_auth);
            setAuthProcessing(false);
        }
    };

    const completeTutorial = async () => {
        if (auth.currentUser) {
            const userRef = doc(db, 'users', auth.currentUser.uid);
            await setDoc(userRef, { tutorialCompleted: true }, { merge: true });
        }
        setStep('feed');
        fetchFeedData();
    };

    const fetchFeedData = () => {
        setIsLoading(true);
        const postsRef = collection(db, 'nagrik_reels');
        const q = query(postsRef, orderBy('createdAt', 'desc'), limit(20));

        onSnapshot(q, (snapshot) => {
            const fetchedData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setStories(fetchedData.slice(0, 6));
            setPosts(fetchedData);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching feed:", error);
            setIsLoading(false);
        });
    };

    const toggleGlobalMute = () => {
        setIsMuted(!isMuted);
    };

    if (step === 'loading') {
        return (
            <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-t-transparent border-[#00897B] rounded-full animate-spin"></div>
            </div>
        );
    }

    if (step === 'login') {
        return (
            <div className="min-h-screen bg-[#FFFFFF] flex flex-col justify-center px-6 py-12 font-sans text-[#111111] relative overflow-hidden">
                <div className="max-w-[400px] mx-auto w-full z-10">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-[#00897B]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#00897B]">
                            <Lock size={32} strokeWidth={2} />
                        </div>
                        <h2 className="text-[1.8rem] font-black tracking-tight text-[#111111]">{currentT.login_title}</h2>
                    </div>
                    
                    <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4 mb-6">
                        {loginError && <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-bold rounded-xl text-center">{loginError}</div>}
                        
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail size={18} className="text-[#111111]/40" />
                            </div>
                            <input type="email" placeholder={currentT.email} value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-[#F9FAFB] border border-[#111111]/15 rounded-xl py-4 pl-12 pr-4 text-[0.95rem] outline-none focus:border-[#00897B] font-medium transition-colors" disabled={authProcessing} />
                        </div>
                        
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock size={18} className="text-[#111111]/40" />
                            </div>
                            <input type="password" placeholder={currentT.pass} value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-[#F9FAFB] border border-[#111111]/15 rounded-xl py-4 pl-12 pr-4 text-[0.95rem] outline-none focus:border-[#00897B] font-medium transition-colors" disabled={authProcessing} />
                        </div>
                        
                        <button type="submit" disabled={authProcessing} className="w-full bg-[#111111] text-[#FFFFFF] font-black py-4 rounded-xl mt-2 active:scale-95 transition-transform tracking-wide uppercase text-sm shadow-lg disabled:opacity-70">
                            {isSignUp ? currentT.btn_signup : currentT.btn_login}
                        </button>
                    </form>

                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex-1 h-px bg-[#111111]/10"></div>
                        <span className="text-[#111111]/40 font-bold text-xs uppercase">OR</span>
                        <div className="flex-1 h-px bg-[#111111]/10"></div>
                    </div>

                    <button onClick={handleGoogleAuth} disabled={authProcessing} className="w-full bg-[#FFFFFF] border border-[#111111]/15 text-[#111111] font-bold py-4 rounded-xl flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-sm disabled:opacity-70">
                        <Chrome size={20} className="text-[#00897B]" />
                        {currentT.btn_google}
                    </button>

                    <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="w-full mt-8 text-[#111111]/60 font-bold text-[0.9rem] hover:text-[#00897B] transition-colors outline-none">
                        {isSignUp ? currentT.switch_login : currentT.switch_signup}
                    </button>
                </div>
            </div>
        );
    }

    if (step === 'tutorial') {
        return (
            <div className="min-h-screen bg-[#87CEEB] flex flex-col justify-between relative overflow-hidden font-sans select-none">
                
                {/* Sun and Clouds Animation */}
                <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }} className="absolute top-16 left-12 w-20 h-20 bg-[#FFD700] rounded-full blur-[2px] opacity-90" />
                <motion.div animate={{ x: [-100, window.innerWidth + 100] }} transition={{ repeat: Infinity, duration: 40, ease: "linear" }} className="absolute top-24 left-0 w-40 h-12 bg-[#FFFFFF] rounded-full blur-sm opacity-80" />
                <motion.div animate={{ x: [window.innerWidth + 100, -100] }} transition={{ repeat: Infinity, duration: 55, ease: "linear" }} className="absolute top-36 right-0 w-56 h-16 bg-[#FFFFFF] rounded-full blur-md opacity-60" />

                {/* Flying Birds Animation */}
                <motion.svg animate={{ x: [-50, window.innerWidth + 50], y: [0, -20, 0, 15, 0] }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }} className="absolute top-32 left-0 w-12 h-12 opacity-70" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12h10l-3-4" />
                    <path d="M22 12h-10l3-4" />
                </motion.svg>
                <motion.svg animate={{ x: [-100, window.innerWidth + 100], y: [0, 30, -10, 0] }} transition={{ repeat: Infinity, duration: 25, ease: "linear", delay: 2 }} className="absolute top-40 left-0 w-8 h-8 opacity-50" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12h10l-3-4" />
                    <path d="M22 12h-10l3-4" />
                </motion.svg>

                {/* Tutorial Content */}
                <div className="px-8 pt-24 z-20 max-w-lg mx-auto text-center relative">
                    <div className="inline-flex p-4 bg-[#FFFFFF]/20 rounded-2xl text-[#111111] mb-6 backdrop-blur-md border border-[#FFFFFF]/30 shadow-lg">
                        <Users size={40} strokeWidth={2} className="text-[#111111]" />
                    </div>
                    <h1 className="text-[2.2rem] font-black text-[#111111] tracking-tight leading-tight mb-4 drop-shadow-sm">{currentT.tut_title}</h1>
                    <p className="text-[1.1rem] font-medium text-[#111111]/80 leading-relaxed drop-shadow-sm max-w-[280px] mx-auto">{currentT.tut_desc}</p>
                </div>

                {/* Landscape Mountains & Trees Vector Bottom */}
                <div className="relative w-full h-[350px] z-10 flex items-end">
                    <svg className="absolute bottom-0 w-full h-full object-cover object-bottom" viewBox="0 0 1440 320" preserveAspectRatio="none">
                        <path fill="#2E8B57" opacity="0.4" d="M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,170.7C672,171,768,117,864,96C960,75,1056,85,1152,106.7C1248,128,1344,160,1392,176L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                        <path fill="#00897B" opacity="0.9" d="M0,224L60,213.3C120,203,240,181,360,192C480,203,600,245,720,240C840,235,960,181,1080,149.3C1200,117,1320,107,1380,101.3L1440,96L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
                        <path fill="#111111" d="M0,288L120,266.7C240,245,480,203,720,208C960,213,1200,267,1320,293.3L1440,320L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z"></path>
                    </svg>
                    
                    <div className="absolute inset-x-0 bottom-12 px-8 z-30 max-w-md mx-auto">
                        <button onClick={completeTutorial} className="w-full bg-[#FFB300] text-[#111111] font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.3)] active:scale-95 transition-transform outline-none uppercase tracking-wider text-sm">
                            <span>{currentT.start}</span>
                            <ArrowRight size={20} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ADVANCED FEED INTERFACE
    return (
        <div className="bg-[#FFFFFF] min-h-screen w-full font-sans text-[#111111] pb-24">
            <div className="sticky top-0 z-30 bg-[#FFFFFF] border-b border-[#111111]/10 px-4 py-3 flex items-center justify-between">
                <span className="font-black text-[1.4rem] tracking-tight text-[#00897B]">NagrikSetu</span>
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/create')} className="outline-none active:scale-95 transition-transform">
                        <Plus size={26} className="text-[#111111]" strokeWidth={2.5} />
                    </button>
                    <button onClick={() => navigate('/messages')} className="outline-none active:scale-95 transition-transform relative">
                        <MessageCircle size={26} className="text-[#111111]" strokeWidth={2} />
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FFB300] rounded-full border-2 border-[#FFFFFF]"></span>
                    </button>
                </div>
            </div>

            <div className="w-full bg-[#FFFFFF] border-b border-[#111111]/5 py-4 px-4 flex items-center gap-4 overflow-x-auto no-scrollbar">
                <div className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer" onClick={() => navigate('/create')}>
                    <div className="w-[68px] h-[68px] rounded-full border-2 border-[#111111]/10 flex items-center justify-center relative bg-[#F9FAFB]">
                        <Plus size={24} className="text-[#111111]/60" />
                        <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#00897B] rounded-full border-2 border-[#FFFFFF] flex items-center justify-center">
                            <Plus size={12} className="text-[#FFFFFF]" strokeWidth={3} />
                        </div>
                    </div>
                    <span className="text-[0.7rem] font-bold text-[#111111]/70">{currentT.my_story}</span>
                </div>

                {stories.map((story) => (
                    <div key={story.id} className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer" onClick={() => navigate(`/story/${story.id}`)}>
                        <div className="w-[68px] h-[68px] rounded-full bg-gradient-to-tr from-[#FFB300] to-[#00897B] p-[2.5px]">
                            <div className="w-full h-full bg-[#FFFFFF] rounded-full border-2 border-[#FFFFFF] overflow-hidden">
                                <img src={story.mediaUrl || story.thumbnailUrl || '/logo.png'} alt="Story" className="w-full h-full object-cover" />
                            </div>
                        </div>
                        <span className="text-[0.7rem] font-bold text-[#111111] truncate w-16 text-center">
                            {story.isAnonymous ? 'Citizen' : (story.authorName?.split(' ')[0] || 'User')}
                        </span>
                    </div>
                ))}
            </div>

            {isLoading && (
                <div className="w-full py-16 flex flex-col items-center justify-center text-[#111111]">
                    <div className="w-8 h-8 border-4 border-t-transparent border-[#00897B] rounded-full animate-spin mb-4"></div>
                    <span className="font-bold text-[0.9rem] text-[#111111]/60">{currentT.loading}</span>
                </div>
            )}
            
            {!isLoading && posts.length === 0 && (
                <div className="w-full py-16 flex items-center justify-center text-[#111111]">
                    <span className="font-bold text-[1rem] text-[#111111]/50">{currentT.no_data}</span>
                </div>
            )}

            <div className="flex flex-col w-full max-w-[600px] mx-auto">
                {!isLoading && posts.map((post) => (
                    <PostItem 
                        key={post.id} 
                        post={post} 
                        currentT={currentT} 
                        isMuted={isMuted} 
                        toggleMute={toggleGlobalMute} 
                        navigate={navigate}
                    />
                ))}
            </div>
            
        </div>
    );
}