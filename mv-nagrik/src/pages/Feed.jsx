import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Share2, MapPin, Play, Heart, MessageCircle, MoreVertical, Plus, Bookmark, EyeOff, Shield, ArrowRight, Lock, Users, Mail } from 'lucide-react';
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
    
    const [step, setStep] = useState('loading'); // loading | login | tutorial | feed

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
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                // If logged in, skip everything and go straight to feed
                setStep('feed');
                fetchFeedData();
            } else {
                // If not logged in, show tutorial ONLY if they haven't seen it before
                const tutDone = localStorage.getItem('nagrik_tutorial_done');
                if (tutDone) {
                    setStep('login');
                } else {
                    setStep('tutorial');
                }
            }
        });
        return () => unsubscribe();
    }, []);

    const t = {
        en: { title: "Community", loading: "Loading...", no_data: "No news found.", req_login: "Please login first.", share_title: "See this", share_desc: "Local news", local_update: "Local News", chat: "Chat", follow: "Follow", my_story: "Add Story", likes: "likes", view_comments: "See all comments", tut_title: "Welcome to our Community", tut_desc: "Share local news, tell problems safely, and help people.", start: "Join Now", login_title: "User Login", email: "Email", pass: "Password", btn_login: "Login", btn_signup: "Sign Up", btn_google: "oogle", switch_signup: "No account? Sign up", switch_login: "Have an account? Login", err_auth: "Login failed. Try again." },
        hi: { title: "समुदाय", loading: "लोड हो रहा है...", no_data: "कोई खबर नहीं।", req_login: "कृपया पहले लॉगिन करें।", share_title: "इसे देखें", share_desc: "स्थानीय खबर", local_update: "स्थानीय खबर", chat: "चैट", follow: "फॉलो करें", my_story: "स्टोरी डालें", likes: "पसंद", view_comments: "सभी कमेंट देखें", tut_title: "हमारे समुदाय में आपका स्वागत है", tut_desc: "स्थानीय खबरें साझा करें, समस्याएं बताएं और लोगों की मदद करें।", start: "शुरू करें", login_title: "यूजर लॉगिन", email: "ईमेल", pass: "पासवर्ड", btn_login: "लॉगिन", btn_signup: "खाता बनाएं", btn_google: "oogle", switch_signup: "खाता नहीं है? बनाएं", switch_login: "खाता है? लॉगिन करें", err_auth: "लॉगिन विफल। पुनः प्रयास करें।" },
        hinglish: { title: "Community", loading: "Load ho raha hai...", no_data: "Koi news nahi hai.", req_login: "Pehle login karein.", share_title: "Ise dekhein", share_desc: "Local news", local_update: "Local News", chat: "Chat", follow: "Follow", my_story: "Story Daalein", likes: "likes", view_comments: "Sabhi comments dekhein", tut_title: "Hamari Community mein Swagat hai", tut_desc: "Local news share karein, problem batayein aur logon ki madad karein.", start: "Join Now", login_title: "User Login", email: "Email", pass: "Password", btn_login: "Login", btn_signup: "Sign Up", btn_google: "oogle", switch_signup: "Account nahi hai? Sign up karein", switch_login: "Account hai? Login karein", err_auth: "Login fail. Phir try karein." },
        mr: { title: "समुदाय", loading: "लोड होत आहे...", no_data: "कोणतीही बातमी नाही.", req_login: "कृपया आधी लॉगिन करा.", share_title: "हे पहा", share_desc: "स्थानिक बातमी", local_update: "स्थानिक बातमी", chat: "चॅट", follow: "फॉलो करा", my_story: "स्टोरी जोडा", likes: "पसंत", view_comments: "सर्व कमेंट्स पहा", tut_title: "आमच्या समुदायात आपले स्वागत आहे", tut_desc: "स्थानिक बातम्या सामायिक करा, समस्या सांगा आणि लोकांना मदत करा.", start: "सुरू करा", login_title: "वापरकर्ता लॉगिन", email: "ईमेल", pass: "पासवर्ड", btn_login: "लॉगिन", btn_signup: "साइन अप", btn_google: "oogle", switch_signup: "खाते नाही? साइन अप करा", switch_login: "खाते आहे? लॉगिन करा", err_auth: "लॉगिन अयशस्वी. पुन्हा प्रयत्न करा." },
        gu: { title: "સમુદાય", loading: "લોડ થઈ રહ્યું છે...", no_data: "કોઈ સમાચાર નથી.", req_login: "કૃપા કરીને પહેલા લોગિન કરો.", share_title: "આ જુઓ", share_desc: "સ્થાનિક સમાચાર", local_update: "સ્થાનિક સમાચાર", chat: "ચેટ", follow: "ફોલો કરો", my_story: "સ્ટોરી ઉમેરો", likes: "પસંદ", view_comments: "બધી ટિપ્પણીઓ જુઓ", tut_title: "અમારા સમુદાયમાં તમારું સ્વાગત છે", tut_desc: "સ્થાનિક સમાચાર શેર કરો, સમસ્યાઓ કહો અને લોકોને મદદ કરો.", start: "શરૂ કરો", login_title: "વપરાશકર્તા લોગિન", email: "ઇમેઇલ", pass: "પાસવર્ડ", btn_login: "લોગિન", btn_signup: "સાઇન અપ", btn_google: "oogle", switch_signup: "એકાઉન્ટ નથી? સાઇન અપ કરો", switch_login: "એકાઉન્ટ છે? લોગિન કરો", err_auth: "લોગિન નિષ્ફળ. ફરી પ્રયાસ કરો." },
        te: { title: "కమ్యూనిటీ", loading: "లోడ్ అవుతోంది...", no_data: "వార్తలు లేవు.", req_login: "దయచేసి లాగిన్ చేయండి.", share_title: "దీన్ని చూడండి", share_desc: "స్థానిక వార్తలు", local_update: "స్థానిక వార్తలు", chat: "చాట్", follow: "అనుసరించండి", my_story: "స్టోరీ జోడించండి", likes: "ఇష్టాలు", view_comments: "అన్ని వ్యాఖ్యలను చూడండి", tut_title: "మా కమ్యూనిటీకి స్వాగతం", tut_desc: "స్థానిక వార్తలను పంచుకోండి, సమస్యలను చెప్పండి మరియు ప్రజలకు సహాయం చేయండి.", start: "ప్రారంభించండి", login_title: "వినియోగదారు లాగిన్", email: "ఇమెయిల్", pass: "పాస్‌వర్డ్", btn_login: "లాగిన్", btn_signup: "సైన్ అప్", btn_google: "oogle", switch_signup: "ఖాతా లేదా? సైన్ అప్ చేయండి", switch_login: "ఖాతా ఉందా? లాగిన్ చేయండి", err_auth: "లాగిన్ విఫలమైంది. మళ్లీ ప్రయత్నించండి." },
        ta: { title: "சமூகம்", loading: "ஏற்றப்படுகிறது...", no_data: "செய்திகள் இல்லை.", req_login: "உள்நுழையவும்.", share_title: "இதைப் பார்க்கவும்", share_desc: "உள்ளூர் செய்திகள்", local_update: "உள்ளூர் செய்திகள்", chat: "அரட்டை", follow: "பின்தொடர்", my_story: "கதையைச் சேர்", likes: "விருப்பங்கள்", view_comments: "அனைத்து கருத்துகளையும் காண்க", tut_title: "எங்கள் சமூகத்திற்கு வரவேற்கிறோம்", tut_desc: "உள்ளூர் செய்திகளைப் பகிரவும், பிரச்சினைகளைக் கூறவும், மக்களுக்கு உதவவும்.", start: "தொடங்கு", login_title: "பயனர் உள்நுழைவு", email: "மின்னஞ்சல்", pass: "கடவுச்சொல்", btn_login: "உள்நுழை", btn_signup: "பதிவு செய்", btn_google: "oogle", switch_signup: "கணக்கு இல்லையா? பதிவு செய்", switch_login: "கணக்கு உள்ளதா? உள்நுழை", err_auth: "உள்நுழைவு தோல்வி. மீண்டும் முயற்சிக்கவும்." },
        kn: { title: "ಸಮುದಾಯ", loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...", no_data: "ಯಾವುದೇ ಸುದ್ದಿಯಿಲ್ಲ.", req_login: "ದಯವಿಟ್ಟು ಲಾಗಿನ್ ಮಾಡಿ.", share_title: "ಇದನ್ನು ನೋಡಿ", share_desc: "ಸ್ಥಳೀಯ ಸುದ್ದಿ", local_update: "ಸ್ಥಳೀಯ ಸುದ್ದಿ", chat: "ಚಾಟ್", follow: "ಅನುಸರಿಸಿ", my_story: "ಕಥೆ ಸೇರಿಸಿ", likes: "ಇಷ್ಟಗಳು", view_comments: "ಎಲ್ಲಾ ಕಾಮೆಂಟ್‌ಗಳನ್ನು ನೋಡಿ", tut_title: "ನಮ್ಮ ಸಮುದಾಯಕ್ಕೆ ಸ್ವಾಗತ", tut_desc: "ಸ್ಥಳೀಯ ಸುದ್ದಿಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಿ, ಸಮಸ್ಯೆಗಳನ್ನು ಹೇಳಿ ಮತ್ತು ಜನರಿಗೆ ಸಹಾಯ ಮಾಡಿ.", start: "ಪ್ರಾರಂಭಿಸಿ", login_title: "ಬಳಕೆದಾರ ಲಾಗಿನ್", email: "ಇಮೇಲ್", pass: "ಪಾಸ್‌ವರ್ಡ್", btn_login: "ಲಾಗಿನ್", btn_signup: "ಸೈನ್ ಅಪ್", btn_google: "oogle", switch_signup: "ಖಾತೆ ಇಲ್ಲವೇ? ಸೈನ್ ಅಪ್ ಮಾಡಿ", switch_login: "ಖಾತೆ ಇದೆಯೇ? ಲಾಗಿನ್ ಮಾಡಿ", err_auth: "ಲಾಗಿನ್ ವಿಫಲವಾಗಿದೆ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ." },
        ml: { title: "കമ്മ്യൂണിറ്റി", loading: "ലോഡ് ചെയ്യുന്നു...", no_data: "വാർത്തകളില്ല.", req_login: "ദയവായി ലോഗിൻ ചെയ്യുക.", share_title: "ഇത് കാണുക", share_desc: "പ്രാദേശിക വാർത്തകൾ", local_update: "പ്രാദേശിക വാർത്തകൾ", chat: "ചാറ്റ്", follow: "ഫോളോ ചെയ്യുക", my_story: "സ്റ്റോറി ചേർക്കുക", likes: "ലൈക്കുകൾ", view_comments: "എല്ലാ അഭിപ്രായങ്ങളും കാണുക", tut_title: "ഞങ്ങളുടെ കമ്മ്യൂണിറ്റിയിലേക്ക് സ്വാഗതം", tut_desc: "പ്രാദേശിക വാർത്തകൾ പങ്കിടുക, പ്രശ്നങ്ങൾ പറയുക, ആളുകളെ സഹായിക്കുക.", start: "ആരംഭിക്കുക", login_title: "ലോഗിൻ", email: "ഇമെയിൽ", pass: "പാസ്‌വേർഡ്", btn_login: "ലോഗിൻ", btn_signup: "സൈൻ അപ്പ്", btn_google: "oogle", switch_signup: "അക്കൗണ്ട് ഇല്ലേ? സൈൻ അപ്പ് ചെയ്യുക", switch_login: "അക്കൗണ്ട് ഉണ്ടോ? ലോഗിൻ ചെയ്യുക", err_auth: "ലോഗിൻ പരാജയപ്പെട്ടു. വീണ്ടും ശ്രമിക്കുക." },
        bn: { title: "সম্প্রদায়", loading: "লোড হচ্ছে...", no_data: "কোনো খবর নেই।", req_login: "দয়া করে লগইন করুন।", share_title: "এটি দেখুন", share_desc: "স্থানীয় খবর", local_update: "স্থানীয় খবর", chat: "চ্যাট", follow: "ফলো করুন", my_story: "স্টোরি যোগ করুন", likes: "লাইক", view_comments: "সব মন্তব্য দেখুন", tut_title: "আমাদের সম্প্রদায়ে স্বাগতম", tut_desc: "স্থানীয় খবর শেয়ার করুন, সমস্যা জানান এবং মানুষকে সাহায্য করুন।", start: "শুরু করুন", login_title: "লগইন", email: "ইমেইল", pass: "পাসওয়ার্ড", btn_login: "লগইন", btn_signup: "সাইন আপ", btn_google: "oogle", switch_signup: "অ্যাকাউন্ট নেই? সাইন আপ করুন", switch_login: "অ্যাকাউন্ট আছে? লগইন করুন", err_auth: "লগইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।" },
        pa: { title: "ਭਾਈਚਾਰਾ", loading: "ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...", no_data: "ਕੋਈ ਖ਼ਬਰ ਨਹੀਂ।", req_login: "ਕਿਰਪਾ ਕਰਕੇ ਲਾਗਇਨ ਕਰੋ।", share_title: "ਇਹ ਦੇਖੋ", share_desc: "ਸਥਾਨਕ ਖ਼ਬਰਾਂ", local_update: "ਸਥਾਨਕ ਖ਼ਬਰਾਂ", chat: "ਚੈਟ", follow: "ਫਾਲੋ ਕਰੋ", my_story: "ਸਟੋਰੀ ਸ਼ਾਮਲ ਕਰੋ", likes: "ਪਸੰਦ", view_comments: "ਸਾਰੀਆਂ ਟਿੱਪਣੀਆਂ ਦੇਖੋ", tut_title: "ਸਾਡੇ ਭਾਈਚਾਰੇ ਵਿੱਚ ਸੁਆਗਤ ਹੈ", tut_desc: "ਸਥਾਨਕ ਖ਼ਬਰਾਂ ਸਾਂਝੀਆਂ ਕਰੋ, ਸਮੱਸਿਆਵਾਂ ਦੱਸੋ ਅਤੇ ਲੋਕਾਂ ਦੀ ਮਦਦ ਕਰੋ।", start: "ਸ਼ੁਰੂ ਕਰੋ", login_title: "ਲਾਗਇਨ", email: "ਈਮੇਲ", pass: "ਪਾਸਵਰਡ", btn_login: "ਲਾਗਇਨ", btn_signup: "ਸਾਈਨ ਅੱਪ", btn_google: "oogle", switch_signup: "ਖਾਤਾ ਨਹੀਂ ਹੈ? ਸਾਈਨ ਅੱਪ ਕਰੋ", switch_login: "ਖਾਤਾ ਹੈ? ਲਾਗਇਨ ਕਰੋ", err_auth: "ਲਾਗਇਨ ਫੇਲ੍ਹ। ਮੁੜ ਕੋਸ਼ਿਸ਼ ਕਰੋ।" },
        or: { title: "ସମ୍ପ୍ରଦାୟ", loading: "ଲୋଡ୍ ହେଉଛି...", no_data: "କୌଣସି ଖବର ନାହିଁ।", req_login: "ଦୟାକରି ଲଗଇନ୍ କରନ୍ତୁ।", share_title: "ଏହା ଦେଖନ୍ତୁ", share_desc: "ସ୍ଥାନୀୟ ଖବର", local_update: "ସ୍ଥାନୀୟ ଖବର", chat: "ଚାଟ୍", follow: "ଫଲୋ କରନ୍ତୁ", my_story: "ଷ୍ଟୋରୀ ଯୋଡନ୍ତୁ", likes: "ଲାଇକ୍", view_comments: "ସବୁ ମନ୍ତବ୍ୟ ଦେଖନ୍ତୁ", tut_title: "ଆମ ସମ୍ପ୍ରଦାୟକୁ ସ୍ୱାଗତ", tut_desc: "ସ୍ଥାନୀୟ ଖବର ଅଂଶୀଦାର କରନ୍ତୁ, ସମସ୍ୟା ଜଣାନ୍ତୁ ଏବଂ ଲୋକଙ୍କୁ ସାହାଯ୍ୟ କରନ୍ତୁ।", start: "ଆରମ୍ଭ କରନ୍ତୁ", login_title: "ଲଗଇନ୍", email: "ଇମେଲ୍", pass: "ପାସୱାର୍ଡ", btn_login: "ଲଗଇନ୍", btn_signup: "ସାଇନ୍ ଅପ୍", btn_google: "oogle", switch_signup: "ଖାତା ନାହିଁ? ସାଇନ୍ ଅପ୍ କରନ୍ତୁ", switch_login: "ଖାତା ଅଛି? ଲଗଇନ୍ କରନ୍ତୁ", err_auth: "ଲଗଇନ୍ ବିଫଳ। ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।" },
        as: { title: "সম্প্ৰদায়", loading: "ল'ড হৈ আছে...", no_data: "কোনো খবৰ নাই।", req_login: "অনুগ্ৰহ কৰি লগইন কৰক।", share_title: "এইটো চাওক", share_desc: "স্থানীয় খবৰ", local_update: "স্থানীয় খবৰ", chat: "চেট", follow: "ফলো কৰক", my_story: "ষ্টোৰী যোগ কৰক", likes: "লাইক", view_comments: "সকলো মন্তব্য চাওক", tut_title: "আমাৰ সম্প্ৰদায়লৈ স্বাগতম", tut_desc: "স্থানীয় খবৰ শ্বেয়াৰ কৰক, সমস্যা জনাওক আৰু মানুহক সহায় কৰক।", start: "আৰম্ভ কৰক", login_title: "লগইন", email: "ইমেইল", pass: "পাছৱৰ্ড", btn_login: "লগইন", btn_signup: "ছাইন আপ", btn_google: "oogle", switch_signup: "একাউণ্ট নাই? ছাইন আপ কৰক", switch_login: "একাউণ্ট আছে? লগইন কৰক", err_auth: "লগইন বিফল। পুনৰ চেষ্টা কৰক।" },
        ur: { title: "کمیونٹی", loading: "لوڈ ہو رہا ہے۔۔۔", no_data: "کوئی خبر نہیں ہے۔", req_login: "براہ کرم لاگ ان کریں۔", share_title: "یہ دیکھیں", share_desc: "مقامی خبریں", local_update: "مقامی خبریں", chat: "چیٹ", follow: "فالو کریں", my_story: "اسٹوری شامل کریں", likes: "پسند", view_comments: "تمام تبصرے دیکھیں", tut_title: "ہماری کمیونٹی میں خوش آمدید", tut_desc: "مقامی خبریں شیئر کریں، مسائل بتائیں اور لوگوں کی مدد کریں۔", start: "شروع کریں", login_title: "لاگ ان", email: "ای میل", pass: "پاس ورڈ", btn_login: "لاگ ان", btn_signup: "سائن اپ", btn_google: "oogle", switch_signup: "اکاؤنٹ نہیں ہے؟ سائن اپ کریں", switch_login: "اکاؤنٹ ہے؟ لاگ ان کریں", err_auth: "لاگ ان ناکام۔ دوبارہ کوشش کریں۔" },
        bho: { title: "समुदाय", loading: "लोड हो रहल बा...", no_data: "कवनो खबर नइखे।", req_login: "कृपया पहिले लॉगिन करीं।", share_title: "एकरा के देखीं", share_desc: "स्थानीय खबर", local_update: "स्थानीय खबर", chat: "चैट", follow: "फॉलो करीं", my_story: "स्टोरी डालीं", likes: "पसंद", view_comments: "सभ कमेंट देखीं", tut_title: "हमार समुदाय में राउर स्वागत बा", tut_desc: "स्थानीय खबर साझा करीं, समस्या बताईं आ लोग के मदद करीं।", start: "शुरू करीं", login_title: "लॉगिन", email: "ईमेल", pass: "पासवर्ड", btn_login: "लॉगिन", btn_signup: "खाता बनाईं", btn_google: "oogle", switch_signup: "खाता नइखे? बनाईं", switch_login: "खाता बा? लॉगिन करीं", err_auth: "लॉगिन विफल। फेर से कोशिश करीं।" }
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

    const completeTutorial = () => {
        localStorage.setItem('nagrik_tutorial_done', 'true');
        setStep('login');
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

                    <button onClick={handleGoogleAuth} disabled={authProcessing} className="w-full bg-[#FFFFFF] border border-[#111111]/15 text-[#111111] font-bold py-3.5 rounded-xl flex items-center justify-center active:scale-95 transition-transform shadow-sm disabled:opacity-70 outline-none">
                        Continue with&nbsp;<svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        <span className="font-bold text-[1.1rem] -ml-0.5 mt-0.5 tracking-tight">{currentT.btn_google}</span>
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
                    
                    <button onClick={completeTutorial} className="mt-8 w-full bg-[#FFB300] text-[#111111] font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.3)] active:scale-95 transition-transform outline-none uppercase tracking-wider text-sm mx-auto max-w-[250px]">
                        <span>{currentT.start}</span>
                        <ArrowRight size={20} strokeWidth={3} />
                    </button>
                </div>

                {/* Landscape Mountains & Trees Vector Bottom */}
                <div className="relative w-full h-[350px] z-10 flex items-end">
                    <svg className="absolute bottom-0 w-full h-full object-cover object-bottom" viewBox="0 0 1440 320" preserveAspectRatio="none">
                        <path fill="#2E8B57" opacity="0.4" d="M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,170.7C672,171,768,117,864,96C960,75,1056,85,1152,106.7C1248,128,1344,160,1392,176L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                        <path fill="#00897B" opacity="0.9" d="M0,224L60,213.3C120,203,240,181,360,192C480,203,600,245,720,240C840,235,960,181,1080,149.3C1200,117,1320,107,1380,101.3L1440,96L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
                        <path fill="#111111" d="M0,288L120,266.7C240,245,480,203,720,208C960,213,1200,267,1320,293.3L1440,320L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z"></path>
                    </svg>
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
                <div className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer" onClick={() => navigate('/create-story')}>
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