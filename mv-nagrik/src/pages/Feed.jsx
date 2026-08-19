import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Share2, MapPin, Play, Heart, MessageCircle, MoreVertical, Plus, Bookmark, EyeOff, Shield, ArrowRight, Lock } from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot, doc, setDoc, deleteDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../firebaseConfig';

// Sub-component for individual social posts
const PostItem = ({ post, currentT, isMuted, toggleMute, navigate }) => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likes || 0);

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

    // Check Initial Like & Bookmark Status
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
            console.error("Like toggle failed", error);
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
            {/* Post Header */}
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

            {/* Media Content */}
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

            {/* Post Actions */}
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

            {/* Details */}
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
    const [step, setStep] = useState('tutorial'); // tutorial | login | feed

    // Login Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    // Language Synchronization
    useEffect(() => {
        const savedLang = localStorage.getItem('nagrik_lang') || navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'hinglish', 'mr', 'gu', 'te', 'ta', 'kn', 'ml', 'bn', 'pa', 'or', 'as', 'ur', 'bho'];
        if (supported.includes(savedLang)) setLang(savedLang);
    }, []);

    // Authentication Gateway
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setStep('feed');
                fetchFeedData();
            } else {
                if (step === 'feed') setStep('tutorial');
            }
        });
        return () => unsubscribe();
    }, [step]);

    // 15 Comprehensive Indian Language Translations
    const t = {
        en: { title: "Community Feed", loading: "Loading feed...", no_data: "No updates found.", req_login: "Sign in required.", share_title: "Check this out on NagrikSetu", share_desc: "Local community update", local_update: "Local Update", chat: "Chat", follow: "Follow", my_story: "Your Story", msg_dev: "Messaging loading...", likes: "likes", view_comments: "View all comments", tut_title: "Civic Social Hub", tut_desc: "Connect securely with your community, report anonymously, and follow local updates.", start: "Proceed to Login", login_title: "Citizen Access", email: "Email Address", pass: "Password", btn_login: "Access Network" },
        hi: { title: "सामुदायिक फ़ीड", loading: "फ़ीड लोड हो रहा है...", no_data: "कोई अपडेट नहीं मिला।", req_login: "साइन इन आवश्यक है।", share_title: "नागरिकसेतु पर इसे देखें", share_desc: "स्थानीय सामुदायिक अपडेट", local_update: "स्थानीय अपडेट", chat: "चैट", follow: "फॉलो करें", my_story: "आपकी स्टोरी", msg_dev: "मैसेजिंग लोड हो रहा है...", likes: "पसंद", view_comments: "सभी टिप्पणियां देखें", tut_title: "नागरिक सामाजिक हब", tut_desc: "अपने समुदाय के साथ सुरक्षित रूप से जुड़ें, गुमनाम रूप से रिपोर्ट करें, और अपडेट का पालन करें।", start: "लॉगिन पर जाएं", login_title: "नागरिक पहुंच", email: "ईमेल पता", pass: "पासवर्ड", btn_login: "नेटवर्क एक्सेस करें" },
        hinglish: { title: "Community Feed", loading: "Feed load ho raha hai...", no_data: "Koi update nahi mila.", req_login: "Sign in zaroori hai.", share_title: "NagrikSetu par isko dekhein", share_desc: "Local community update", local_update: "Local Update", chat: "Chat", follow: "Follow", my_story: "Your Story", msg_dev: "Messaging load ho raha hai...", likes: "likes", view_comments: "Sabhi comments dekhein", tut_title: "Civic Social Hub", tut_desc: "Community ke saath securely connect karein, aur anonymous reports file karein.", start: "Login Par Jayein", login_title: "Citizen Access", email: "Email Address", pass: "Password", btn_login: "Network Access Karein" },
        mr: { title: "सामुदायिक फीड", loading: "फीड लोड होत आहे...", no_data: "कोणतेही अपडेट्स आढळले नाहीत.", req_login: "साइन इन आवश्यक.", share_title: "नागरिकसेतू वर हे तपासा", share_desc: "स्थानिक समुदाय अपडेट", local_update: "स्थानिक अपडेट", chat: "चॅट", follow: "फॉलो करा", my_story: "तुमची स्टोरी", msg_dev: "मेसेजिंग लोड होत आहे...", likes: "पसंत", view_comments: "सर्व टिप्पण्या पहा", tut_title: "नागरी सामाजिक हब", tut_desc: "तुमच्या समुदायाशी सुरक्षितपणे कनेक्ट व्हा, अज्ञातपणे अहवाल द्या.", start: "लॉगिन करा", login_title: "नागरिक प्रवेश", email: "ईमेल पत्ता", pass: "पासवर्ड", btn_login: "नेटवर्क प्रवेश करा" },
        gu: { title: "સમુદાય ફીડ", loading: "ફીડ લોડ થઈ રહ્યું છે...", no_data: "કોઈ અપડેટ મળ્યા નથી.", req_login: "સાઇન ઇન જરૂરી છે.", share_title: "નાગરિકસેતુ પર આ જુઓ", share_desc: "સ્થાનિક સમુદાય અપડેટ", local_update: "સ્થાનિક અપડેટ", chat: "ચેટ", follow: "ફોલો કરો", my_story: "તમારી સ્ટોરી", msg_dev: "મેસેજિંગ લોડ થઈ રહ્યું છે...", likes: "પસંદ", view_comments: "બધી ટિપ્પણીઓ જુઓ", tut_title: "નાગરિક સામાજિક હબ", tut_desc: "તમારા સમુદાય સાથે સુરક્ષિત રીતે કનેક્ટ થાઓ અને અનામી રીતે જાણ કરો.", start: "લોગિન પર જાઓ", login_title: "નાગરિક પ્રવેશ", email: "ઇમેઇલ સરનામું", pass: "પાસવર્ડ", btn_login: "નેટવર્ક ઍક્સેસ કરો" },
        te: { title: "కమ్యూనిటీ ఫీడ్", loading: "ఫీడ్ లోడ్ అవుతోంది...", no_data: "నవీకరణలు కనుగొనబడలేదు.", req_login: "సైన్ ఇన్ అవసరం.", share_title: "నాగ్రిక్ సేతులో దీనిని చూడండి", share_desc: "స్థానిక కమ్యూనిటీ నవీకరణ", local_update: "స్థానిక నవీకరణ", chat: "చాట్", follow: "అనుసరించండి", my_story: "మీ స్టోరీ", msg_dev: "మెసేజింగ్ లోడ్ అవుతోంది...", likes: "ఇష్టాలు", view_comments: "అన్ని వ్యాఖ్యలను చూడండి", tut_title: "సివిక్ సోషల్ హబ్", tut_desc: "మీ సంఘంతో సురక్షితంగా కనెక్ట్ అవ్వండి మరియు అనామకంగా నివేదించండి.", start: "లాగిన్‌కి వెళ్లండి", login_title: "పౌర ప్రాప్యత", email: "ఇమెయిల్ చిరునామా", pass: "పాస్‌వర్డ్", btn_login: "నెట్‌వర్క్ యాక్సెస్ చేయండి" },
        ta: { title: "சமூக ஊட்டம்", loading: "ஊட்டம் ஏற்றப்படுகிறது...", no_data: "புதுப்பிப்புகள் எதுவும் இல்லை.", req_login: "உள்நுழைவு தேவை.", share_title: "நாகரிக்சேதுவில் இதைப் பார்க்கவும்", share_desc: "உள்ளூர் சமூக புதுப்பிப்பு", local_update: "உள்ளூர் புதுப்பிப்பு", chat: "அரட்டை", follow: "பின்தொடர்", my_story: "உங்கள் கதை", msg_dev: "செய்தியிடல் ஏற்றப்படுகிறது...", likes: "விருப்பங்கள்", view_comments: "அனைத்து கருத்துகளையும் காண்க", tut_title: "குடிமை சமூக மையம்", tut_desc: "உங்கள் சமூகத்துடன் பாதுகாப்பாக இணைக்கவும், அநாமதேயமாக புகாரளிக்கவும்.", start: "உள்நுழைவுக்குச் செல்", login_title: "குடிமகன் அணுகல்", email: "மின்னஞ்சல் முகவரி", pass: "கடவுச்சொல்", btn_login: "நெட்வொர்க்கை அணுகவும்" },
        kn: { title: "ಸಮುದಾಯ ಫೀಡ್", loading: "ಫೀಡ್ ಲೋಡ್ ಆಗುತ್ತಿದೆ...", no_data: "ಯಾವುದೇ ನವೀಕರಣಗಳು ಕಂಡುಬಂದಿಲ್ಲ.", req_login: "ಸೈನ್ ಇನ್ ಅಗತ್ಯವಿದೆ.", share_title: "ನಾಗರಿಕ್ ಸೇತು ನಲ್ಲಿ ಇದನ್ನು ಪರಿಶೀಲಿಸಿ", share_desc: "ಸ್ಥಳೀಯ ಸಮುದಾಯ ನವೀಕರಣ", local_update: "ಸ್ಥಳೀಯ ನವೀಕರಣ", chat: "ಚಾಟ್", follow: "ಅನುಸರಿಸಿ", my_story: "ನಿಮ್ಮ ಕಥೆ", msg_dev: "ಮೆಸೇಜಿಂಗ್ ಲೋಡ್ ಆಗುತ್ತಿದೆ...", likes: "ಇಷ್ಟಗಳು", view_comments: "ಎಲ್ಲಾ ಕಾಮೆಂಟ್‌ಗಳನ್ನು ವೀಕ್ಷಿಸಿ", tut_title: "ನಾಗರಿಕ ಸಾಮಾಜಿಕ ಕೇಂದ್ರ", tut_desc: "ನಿಮ್ಮ ಸಮುದಾಯದೊಂದಿಗೆ ಸುರಕ್ಷಿತವಾಗಿ ಸಂಪರ್ಕ ಸಾಧಿಸಿ ಮತ್ತು ಅನಾಮಧೇಯವಾಗಿ ವರದಿ ಮಾಡಿ.", start: "ಲಾಗಿನ್‌ಗೆ ಮುಂದುವರಿಯಿರಿ", login_title: "ನಾಗರಿಕ ಪ್ರವೇಶ", email: "ಇಮೇಲ್ ವಿಳಾಸ", pass: "ಪಾಸ್‌ವರ್ಡ್", btn_login: "ನೆಟ್‌ವರ್ಕ್ ಪ್ರವೇಶಿಸಿ" },
        ml: { title: "കമ്മ്യൂണിറ്റി ഫീഡ്", loading: "ഫീഡ് ലോഡ് ചെയ്യുന്നു...", no_data: "അപ്ഡേറ്റുകളൊന്നും കണ്ടെത്തിയില്ല.", req_login: "സൈൻ ഇൻ ആവശ്യമാണ്.", share_title: "നാഗരിക് സേതുവിൽ ഇത് പരിശോധിക്കുക", share_desc: "പ്രാദേശിക കമ്മ്യൂണിറ്റി അപ്ഡേറ്റ്", local_update: "പ്രാദേശിക അപ്ഡേറ്റ്", chat: "ചാറ്റ്", follow: "ഫോളോ ചെയ്യുക", my_story: "നിങ്ങളുടെ സ്റ്റോറി", msg_dev: "മെസേജിംഗ് ലോഡ് ചെയ്യുന്നു...", likes: "ലൈക്കുകൾ", view_comments: "എല്ലാ അഭിപ്രായങ്ങളും കാണുക", tut_title: "സിവിക് സോഷ്യൽ ഹബ്", tut_desc: "നിങ്ങളുടെ കമ്മ്യൂണിറ്റിയുമായി സുരക്ഷിതമായി കണക്റ്റുചെയ്യുക, അജ്ഞാതമായി റിപ്പോർട്ട് ചെയ്യുക.", start: "ലോഗിൻ ചെയ്യുക", login_title: "പൗര പ്രവേശനം", email: "ഇമെയിൽ വിലാസം", pass: "പാസ്‌വേർഡ്", btn_login: "നെറ്റ്‌വർക്ക് ആക്സസ് ചെയ്യുക" },
        bn: { title: "কমিউনিটি ফিড", loading: "ফিড লোড হচ্ছে...", no_data: "কোনো আপডেট পাওয়া যায়নি।", req_login: "সাইন ইন প্রয়োজন।", share_title: "নাগরিকসেতুতে এটি দেখুন", share_desc: "স্থানীয় কমিউনিটি আপডেট", local_update: "স্থানীয় আপডেট", chat: "চ্যাট", follow: "ফলো করুন", my_story: "আপনার স্টোরি", msg_dev: "মেসেজিং লোড হচ্ছে...", likes: "লাইক", view_comments: "সব মন্তব্য দেখুন", tut_title: "নাগরিক সামাজিক হাব", tut_desc: "আপনার সম্প্রদায়ের সাথে নিরাপদে সংযুক্ত হন এবং বেনামে রিপোর্ট করুন।", start: "লগইন করুন", login_title: "নাগরিক অ্যাক্সেস", email: "ইমেল ঠিকানা", pass: "পাসওয়ার্ড", btn_login: "নেটওয়ার্ক অ্যাক্সেস করুন" },
        pa: { title: "ਭਾਈਚਾਰਕ ਫੀਡ", loading: "ਫੀਡ ਲੋਡ ਹੋ ਰਹੀ ਹੈ...", no_data: "ਕੋਈ ਅੱਪਡੇਟ ਨਹੀਂ ਮਿਲਿਆ।", req_login: "ਸਾਈਨ ਇਨ ਲੋੜੀਂਦਾ ਹੈ।", share_title: "ਨਾਗਰਿਕਸੇਤੂ 'ਤੇ ਇਸਦੀ ਜਾਂਚ ਕਰੋ", share_desc: "ਸਥਾਨਕ ਭਾਈਚਾਰਕ ਅੱਪਡੇਟ", local_update: "ਸਥਾਨਕ ਅੱਪਡੇਟ", chat: "ਚੈਟ", follow: "ਫਾਲੋ ਕਰੋ", my_story: "ਤੁਹਾਡੀ ਸਟੋਰੀ", msg_dev: "ਮੈਸੇਜਿੰਗ ਲੋਡ ਹੋ ਰਹੀ ਹੈ...", likes: "ਪਸੰਦ", view_comments: "ਸਾਰੀਆਂ ਟਿੱਪਣੀਆਂ ਦੇਖੋ", tut_title: "ਨਾਗਰਿਕ ਸਮਾਜਿਕ ਹੱਬ", tut_desc: "ਆਪਣੇ ਭਾਈਚਾਰੇ ਨਾਲ ਸੁਰੱਖਿਅਤ ਢੰਗ ਨਾਲ ਜੁੜੋ ਅਤੇ ਅਗਿਆਤ ਰੂਪ ਵਿੱਚ ਰਿਪੋਰਟ ਕਰੋ।", start: "ਲਾਗਇਨ ਕਰੋ", login_title: "ਨਾਗਰਿਕ ਪਹੁੰਚ", email: "ਈਮੇਲ ਪਤਾ", pass: "ਪਾਸਵਰਡ", btn_login: "ਨੈੱਟਵਰਕ ਤੱਕ ਪਹੁੰਚ ਕਰੋ" },
        or: { title: "ସମ୍ପ୍ରଦାୟ ଫିଡ୍", loading: "ଫିଡ୍ ଲୋଡ୍ ହେଉଛି...", no_data: "କୌଣସି ଅପଡେଟ୍ ମିଳିଲା ନାହିଁ।", req_login: "ସାଇନ୍ ଇନ୍ ଆବଶ୍ୟକ।", share_title: "ନାଗରିକସେତୁରେ ଏହା ଦେଖନ୍ତୁ", share_desc: "ସ୍ଥାନୀୟ ସମ୍ପ୍ରଦାୟ ଅପଡେଟ୍", local_update: "ସ୍ଥାନୀୟ ଅପଡେଟ୍", chat: "ଚାଟ୍", follow: "ଫଲୋ କରନ୍ତୁ", my_story: "ଆପଣଙ୍କ ଷ୍ଟୋରୀ", msg_dev: "ମେସେଜିଂ ଲୋଡ୍ ହେଉଛି...", likes: "ଲାଇକ୍", view_comments: "ସମସ୍ତ ମନ୍ତବ୍ୟ ଦେଖନ୍ତୁ", tut_title: "ନାଗରିକ ସାମାଜିକ ହବ୍", tut_desc: "ଆପଣଙ୍କ ସମ୍ପ୍ରଦାୟ ସହିତ ସୁରକ୍ଷିତ ଭାବରେ ସଂଯୋଗ କରନ୍ତୁ ଏବଂ ଅଜ୍ଞାତ ଭାବରେ ରିପୋର୍ଟ କରନ୍ତୁ।", start: "ଲଗଇନ୍ କରନ୍ତୁ", login_title: "ନାଗରିକ ଆକ୍ସେସ୍", email: "ଇମେଲ୍ ଠିକଣା", pass: "ପାସୱାର୍ଡ", btn_login: "ନେଟୱାର୍କ ଆକ୍ସେସ୍ କରନ୍ତୁ" },
        as: { title: "সম্প্ৰদায় ফীড", loading: "ফীড ল'ড হৈ আছে...", no_data: "কোনো আপডেট পোৱা নগ'ল।", req_login: "ছাইন ইন প্ৰয়োজনীয়।", share_title: "নাগৰিকসেতুত এইটো চাওক", share_desc: "স্থানীয় সম্প্ৰদায়ৰ আপডেট", local_update: "স্থানীয় আপডেট", chat: "চেট", follow: "ফলো কৰক", my_story: "আপোনাৰ ষ্টোৰী", msg_dev: "মেছেজিং ল'ড হৈ আছে...", likes: "লাইক", view_comments: "সকলো মন্তব্য চাওক", tut_title: "নাগৰিক সামাজিক হাব", tut_desc: "আপোনাৰ সম্প্ৰদায়ৰ সৈতে সুৰক্ষিতভাৱে সংযোগ কৰক আৰু বেনামীভাৱে ৰিপৰ্ট কৰক।", start: "লগইন কৰক", login_title: "নাগৰিক প্ৰৱেশ", email: "ইমেইল ঠিকনা", pass: "পাছৱৰ্ড", btn_login: "নেটৱৰ্ক প্ৰৱেশ কৰক" },
        ur: { title: "کمیونٹی فیڈ", loading: "فیڈ لوڈ ہو رہی ہے۔۔۔", no_data: "کوئی اپ ڈیٹ نہیں ملا۔", req_login: "سائن ان درکار ہے۔", share_title: "ناگرک سیتو پر اسے چیک کریں", share_desc: "مقامی کمیونٹی اپ ڈیٹ", local_update: "مقامی اپ ڈیٹ", chat: "چیٹ", follow: "فالو کریں", my_story: "آپ کی اسٹوری", msg_dev: "میسجنگ لوڈ ہو رہی ہے۔۔۔", likes: "پسند", view_comments: "تمام تبصرے دیکھیں", tut_title: "شہری سماجی ہب", tut_desc: "اپنی کمیونٹی کے ساتھ محفوظ طریقے سے جڑیں اور گمنام طور پر رپورٹ کریں۔", start: "لاگ ان کریں", login_title: "شہری رسائی", email: "ای میل پتہ", pass: "پاس ورڈ", btn_login: "نیٹ ورک تک رسائی حاصل کریں" },
        bho: { title: "सामुदायिक फीड", loading: "फीड लोड हो रहल बा...", no_data: "कवनो अपडेट ना मिलल।", req_login: "साइन इन जरूरी बा।", share_title: "नागरिकसेतु पर एकरा के देखीं", share_desc: "स्थानीय सामुदायिक अपडेट", local_update: "स्थानीय अपडेट", chat: "चैट", follow: "फॉलो करीं", my_story: "राउर स्टोरी", msg_dev: "मैसेजिंग लोड हो रहल बा...", likes: "पसंद", view_comments: "सभ टिप्पणी देखीं", tut_title: "नागरिक सामाजिक हब", tut_desc: "अपन समुदाय के साथ सुरक्षित रूप से जुड़ीं आ गुमनाम रूप से रिपोर्ट करीं।", start: "लॉगिन करीं", login_title: "नागरिक पहुँच", email: "ईमेल पता", pass: "पासवर्ड", btn_login: "नेटवर्क एक्सेस करीं" }
    };

    const currentT = t[lang] || t['en'];

    // Login Submission
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            setLoginError("Invalid credentials.");
        }
    };

    const fetchFeedData = () => {
        setIsLoading(true);
        const postsRef = collection(db, 'nagrik_reels'); // Mapping legacy collection to new UI for seamless transition
        const q = query(postsRef, orderBy('createdAt', 'desc'), limit(20));

        onSnapshot(q, (snapshot) => {
            const fetchedData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setStories(fetchedData.slice(0, 6)); // Top carousel stories
            setPosts(fetchedData); // Main feed
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching feed:", error);
            setIsLoading(false);
        });
    };

    const toggleGlobalMute = () => {
        setIsMuted(!isMuted);
    };

    // TUTORIAL SCREEN
    if (step === 'tutorial') {
        return (
            <div className="min-h-screen bg-[#00897B] flex flex-col justify-between relative overflow-hidden font-sans select-none">
                <motion.div animate={{ x: [-100, 400] }} transition={{ repeat: Infinity, duration: 25, ease: "linear" }} className="absolute top-12 left-0 w-32 h-10 bg-white/20 rounded-full blur-md" />
                <motion.div animate={{ x: [300, -150] }} transition={{ repeat: Infinity, duration: 35, ease: "linear" }} className="absolute top-24 right-0 w-48 h-14 bg-white/15 rounded-full blur-lg" />
                <motion.div animate={{ x: [-50, 500], y: [-20, 20] }} transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }} className="absolute top-32 left-10 text-white/60 font-black text-lg">v v</motion.div>

                <div className="px-8 pt-16 z-20 max-w-lg mx-auto text-center">
                    <span className="inline-block p-4 bg-white/10 rounded-2xl text-white mb-6 backdrop-blur-sm border border-white/20 shadow-lg">
                        <Users size={36} strokeWidth={2} />
                    </span>
                    <h1 className="text-[2.2rem] font-black text-white tracking-tight leading-tight mb-4">{currentT.tut_title}</h1>
                    <p className="text-[1.05rem] font-medium text-white/80 leading-relaxed">{currentT.tut_desc}</p>
                </div>

                <div className="relative w-full h-[280px] z-10 flex items-end">
                    <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
                        <path fill="#00695C" fillOpacity="0.5" d="M0,192L48,181.3C96,171,192,149,288,160C384,171,480,213,576,213.3C672,213,768,171,864,165.3C960,160,1056,192,1152,197.3C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                        <path fill="#111111" fillOpacity="0.9" d="M0,256L60,240C120,224,240,192,360,197.3C480,203,600,245,720,240C840,235,960,181,1080,165.3C1200,149,1320,171,1380,181.3L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
                    </svg>
                    <div className="absolute inset-x-0 bottom-10 px-8 z-30 max-w-md mx-auto">
                        <button onClick={() => setStep('login')} className="w-full bg-[#FFB300] text-[#111111] font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.3)] active:scale-95 transition-transform outline-none uppercase tracking-wider text-sm">
                            <span>{currentT.start}</span>
                            <ArrowRight size={20} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // LOGIN SCREEN
    if (step === 'login') {
        return (
            <div className="min-h-screen bg-[#FFFFFF] flex flex-col justify-center px-6 py-12 font-sans text-[#111111]">
                <div className="max-w-[400px] mx-auto w-full">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-[#00897B]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#00897B]">
                            <Lock size={32} strokeWidth={2} />
                        </div>
                        <h2 className="text-[1.8rem] font-black tracking-tight text-[#111111]">{currentT.login_title}</h2>
                    </div>
                    <form onSubmit={handleLogin} className="flex flex-col gap-4">
                        {loginError && <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-bold rounded-xl text-center">{loginError}</div>}
                        <input type="email" placeholder={currentT.email} value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-[#F9FAFB] border border-[#111111]/15 rounded-xl p-4 text-[0.95rem] outline-none focus:border-[#00897B] font-medium" />
                        <input type="password" placeholder={currentT.pass} value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-[#F9FAFB] border border-[#111111]/15 rounded-xl p-4 text-[0.95rem] outline-none focus:border-[#00897B] font-medium" />
                        <button type="submit" className="w-full bg-[#111111] text-[#FFFFFF] font-black py-4 rounded-xl mt-2 active:scale-95 transition-transform tracking-wide uppercase text-sm shadow-lg">{currentT.btn_login}</button>
                    </form>
                </div>
            </div>
        );
    }

    // ADVANCED FEED INTERFACE (Target Design)
    return (
        <div className="bg-[#FFFFFF] min-h-screen w-full font-sans text-[#111111] pb-24">
            
            {/* Top Navigation Bar */}
            <div className="sticky top-0 z-30 bg-[#FFFFFF] border-b border-[#111111]/10 px-4 py-3 flex items-center justify-between">
                <span className="font-black text-[1.4rem] tracking-tight text-[#00897B]">NagrikSetu</span>
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/create')} className="outline-none active:scale-95 transition-transform">
                        <Plus size={26} className="text-[#111111]" strokeWidth={2.5} />
                    </button>
                    <button onClick={() => alert(currentT.msg_dev)} className="outline-none active:scale-95 transition-transform relative">
                        <MessageCircle size={26} className="text-[#111111]" strokeWidth={2} />
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FFB300] rounded-full border-2 border-[#FFFFFF]"></span>
                    </button>
                </div>
            </div>

            {/* Stories Carousel */}
            <div className="w-full bg-[#FFFFFF] border-b border-[#111111]/5 py-4 px-4 flex items-center gap-4 overflow-x-auto no-scrollbar">
                {/* Current User Story Addition */}
                <div className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer" onClick={() => navigate('/create-story')}>
                    <div className="w-[68px] h-[68px] rounded-full border-2 border-[#111111]/10 flex items-center justify-center relative bg-[#F9FAFB]">
                        <Plus size={24} className="text-[#111111]/60" />
                        <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#00897B] rounded-full border-2 border-[#FFFFFF] flex items-center justify-center">
                            <Plus size={12} className="text-[#FFFFFF]" strokeWidth={3} />
                        </div>
                    </div>
                    <span className="text-[0.7rem] font-bold text-[#111111]/70">{currentT.my_story}</span>
                </div>

                {/* Network Stories */}
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

            {/* Loading State */}
            {isLoading && (
                <div className="w-full py-16 flex flex-col items-center justify-center text-[#111111]">
                    <div className="w-8 h-8 border-4 border-t-transparent border-[#00897B] rounded-full animate-spin mb-4"></div>
                    <span className="font-bold text-[0.9rem] text-[#111111]/60">{currentT.loading}</span>
                </div>
            )}
            
            {/* Empty State */}
            {!isLoading && posts.length === 0 && (
                <div className="w-full py-16 flex items-center justify-center text-[#111111]">
                    <span className="font-bold text-[1rem] text-[#111111]/50">{currentT.no_data}</span>
                </div>
            )}

            {/* Main Feed Posts */}
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