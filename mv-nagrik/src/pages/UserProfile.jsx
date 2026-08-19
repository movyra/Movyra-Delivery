import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Settings, Grid, Bookmark, Shield, MapPin, EyeOff, Edit2, Play } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

export default function UserProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lang, setLang] = useState('en');
    
    // State Management
    const [currentUser, setCurrentUser] = useState(null);
    const [profileData, setProfileData] = useState(null);
    const [posts, setPosts] = useState([]);
    const [savedPosts, setSavedPosts] = useState([]);
    const [stats, setStats] = useState({ followers: 0, following: 0, karma: 0 });
    const [activeTab, setActiveTab] = useState('posts'); // posts | saved
    const [isLoading, setIsLoading] = useState(true);

    const profileId = id || currentUser?.uid;
    const isOwnProfile = currentUser?.uid === profileId;

    // Language Synchronization
    useEffect(() => {
        const savedLang = localStorage.getItem('nagrik_lang') || navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'hinglish', 'mr', 'gu', 'te', 'ta', 'kn', 'ml', 'bn', 'pa', 'or', 'as', 'ur', 'bho'];
        if (supported.includes(savedLang)) setLang(savedLang);
    }, []);

    // 15 Comprehensive Indian Language Translations
    const t = {
        en: { title: "Profile", posts: "Posts", followers: "Followers", following: "Following", edit: "Edit Profile", anon_on: "Identity Hidden", anon_off: "Public Identity", karma: "Civic Karma", saved: "Saved", no_posts: "No records published yet.", fetching: "Synchronizing data...", hide_identity: "Hide Identity", show_identity: "Show Identity" },
        hi: { title: "प्रोफ़ाइल", posts: "पोस्ट", followers: "फ़ॉलोअर्स", following: "फ़ॉलोइंग", edit: "प्रोफ़ाइल संपादित करें", anon_on: "पहचान छिपी हुई", anon_off: "सार्वजनिक पहचान", karma: "नागरिक कर्म", saved: "सहेजा गया", no_posts: "अभी तक कोई रिकॉर्ड प्रकाशित नहीं हुआ।", fetching: "डेटा सिंक्रनाइज़ हो रहा है...", hide_identity: "पहचान छिपाएं", show_identity: "पहचान दिखाएं" },
        hinglish: { title: "Profile", posts: "Posts", followers: "Followers", following: "Following", edit: "Profile Edit", anon_on: "Identity Hidden", anon_off: "Public Identity", karma: "Civic Karma", saved: "Saved", no_posts: "Koi record publish nahi hua.", fetching: "Data sync ho raha hai...", hide_identity: "Identity Hide Karein", show_identity: "Identity Show Karein" },
        mr: { title: "प्रोफाइल", posts: "पोस्ट", followers: "फॉलोअर्स", following: "फॉलोइंग", edit: "प्रोफाइल संपादित करा", anon_on: "ओळख लपवली", anon_off: "सार्वजनिक ओळख", karma: "नागरी कर्म", saved: "सेव्ह केलेले", no_posts: "अद्याप कोणतेही रेकॉर्ड प्रकाशित नाही.", fetching: "डेटा सिंक्रोनाइझ करत आहे...", hide_identity: "ओळख लपवा", show_identity: "ओळख दाखवा" },
        gu: { title: "પ્રોફાઇલ", posts: "પોસ્ટ્સ", followers: "અનુયાયીઓ", following: "અનુસરી રહ્યા છે", edit: "પ્રોફાઇલ સંપાદિત કરો", anon_on: "ઓળખ છુપાયેલ", anon_off: "જાહેર ઓળખ", karma: "નાગરિક કર્મ", saved: "સાચવેલ", no_posts: "હજી સુધી કોઈ રેકોર્ડ પ્રકાશિત થયો નથી.", fetching: "ડેટા સિંક્રનાઇઝ કરી રહ્યાં છીએ...", hide_identity: "ઓળખ છુપાવો", show_identity: "ઓળખ બતાવો" },
        te: { title: "ప్రొఫైల్", posts: "పోస్ట్‌లు", followers: "అనుచరులు", following: "అనుసరిస్తున్నారు", edit: "ప్రొఫైల్‌ను సవరించండి", anon_on: "గుర్తింపు దాచబడింది", anon_off: "పబ్లిక్ గుర్తింపు", karma: "సివిక్ కర్మ", saved: "సేవ్ చేయబడింది", no_posts: "ఇంకా రికార్డులు ప్రచురించబడలేదు.", fetching: "డేటా సమకాలీకరించబడుతోంది...", hide_identity: "గుర్తింపు దాచు", show_identity: "గుర్తింపు చూపించు" },
        ta: { title: "சுயவிவரம்", posts: "பதிவுகள்", followers: "பின்தொடர்பவர்கள்", following: "பின்தொடர்கிறார்கள்", edit: "சுயவிவரத்தை திருத்து", anon_on: "அடையாளம் மறைக்கப்பட்டது", anon_off: "பொது அடையாளம்", karma: "குடிமை கர்மா", saved: "சேமிக்கப்பட்டது", no_posts: "எந்த பதிவுகளும் வெளியிடப்படவில்லை.", fetching: "தரவு ஒத்திசைக்கப்படுகிறது...", hide_identity: "அடையாளத்தை மறை", show_identity: "அடையாளத்தை காட்டு" },
        kn: { title: "ಪ್ರೊಫೈಲ್", posts: "ಪೋಸ್ಟ್‌ಗಳು", followers: "ಅನುಯಾಯಿಗಳು", following: "ಅನುಸರಿಸುತ್ತಿದ್ದಾರೆ", edit: "ಪ್ರೊಫೈಲ್ ಸಂಪಾದಿಸಿ", anon_on: "ಗುರುತನ್ನು ಮರೆಮಾಡಲಾಗಿದೆ", anon_off: "ಸಾರ್ವಜನಿಕ ಗುರುತು", karma: "ನಾಗರಿಕ ಕರ್ಮ", saved: "ಉಳಿಸಲಾಗಿದೆ", no_posts: "ಇನ್ನೂ ಯಾವುದೇ ದಾಖಲೆಗಳನ್ನು ಪ್ರಕಟಿಸಲಾಗಿಲ್ಲ.", fetching: "ಡೇಟಾ ಸಿಂಕ್ರೊನೈಸ್ ಆಗುತ್ತಿದೆ...", hide_identity: "ಗುರುತನ್ನು ಮರೆಮಾಡಿ", show_identity: "ಗುರುತನ್ನು ತೋರಿಸಿ" },
        ml: { title: "പ്രൊഫൈൽ", posts: "പോസ്റ്റുകൾ", followers: "അനുയായികൾ", following: "പിന്തുടരുന്നവർ", edit: "പ്രൊഫൈൽ എഡിറ്റ് ചെയ്യുക", anon_on: "ഐഡന്റിറ്റി മറച്ചു", anon_off: "പൊതു ഐഡന്റിറ്റി", karma: "സിവിക് കർമ്മ", saved: "സംരക്ഷിച്ചു", no_posts: "രേഖകളൊന്നും പ്രസിദ്ധീകരിച്ചിട്ടില്ല.", fetching: "ഡാറ്റ സമന്വയിപ്പിക്കുന്നു...", hide_identity: "ഐഡന്റിറ്റി മറയ്ക്കുക", show_identity: "ഐഡന്റിറ്റി കാണിക്കുക" },
        bn: { title: "প্রোফাইল", posts: "পোস্ট", followers: "অনুসরণকারী", following: "অনুসরণ করছে", edit: "প্রোফাইল সম্পাদনা করুন", anon_on: "পরিচয় লুকানো", anon_off: "পাবলিক পরিচয়", karma: "নাগরিক কর্ম", saved: "সংরক্ষিত", no_posts: "এখনও কোনো রেকর্ড প্রকাশিত হয়নি।", fetching: "ডেটা সিঙ্ক্রোনাইজ হচ্ছে...", hide_identity: "পরিচয় লুকান", show_identity: "পরিচয় দেখান" },
        pa: { title: "ਪ੍ਰੋਫਾਈਲ", posts: "ਪੋਸਟਾਂ", followers: "ਫਾਲੋਅਰਜ਼", following: "ਫਾਲੋਇੰਗ", edit: "ਪ੍ਰੋਫਾਈਲ ਸੋਧੋ", anon_on: "ਪਛਾਣ ਲੁਕਾਈ ਗਈ", anon_off: "ਜਨਤਕ ਪਛਾਣ", karma: "ਸਿਵਿਕ ਕਰਮ", saved: "ਸੁਰੱਖਿਅਤ ਕੀਤਾ", no_posts: "ਅਜੇ ਤੱਕ ਕੋਈ ਰਿਕਾਰਡ ਪ੍ਰਕਾਸ਼ਿਤ ਨਹੀਂ ਹੋਇਆ।", fetching: "ਡਾਟਾ ਸਿੰਕ੍ਰੋਨਾਈਜ਼ ਹੋ ਰਿਹਾ ਹੈ...", hide_identity: "ਪਛਾਣ ਲੁਕਾਓ", show_identity: "ਪਛਾਣ ਦਿਖਾਓ" },
        or: { title: "ପ୍ରୋଫାଇଲ୍", posts: "ପୋଷ୍ଟଗୁଡିକ", followers: "ଅନୁସରଣକାରୀ", following: "ଅନୁସରଣ କରୁଛନ୍ତି", edit: "ପ୍ରୋଫାଇଲ୍ ସମ୍ପାଦନ କରନ୍ତୁ", anon_on: "ପରିଚୟ ଲୁକ୍କାୟିତ", anon_off: "ସାର୍ବଜନୀନ ପରିଚୟ", karma: "ନାଗରିକ କର୍ମ", saved: "ସଂରକ୍ଷିତ", no_posts: "ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ରେକର୍ଡ ପ୍ରକାଶିତ ହୋଇନାହିଁ।", fetching: "ଡାଟା ସିଙ୍କ୍ରୋନାଇଜ୍ ହେଉଛି...", hide_identity: "ପରିଚୟ ଲୁଚାନ୍ତୁ", show_identity: "ପରିଚୟ ଦେଖାନ୍ତୁ" },
        as: { title: "প্ৰফাইল", posts: "পোষ্ট", followers: "ফলোয়াৰ", following: "ফলো কৰিছে", edit: "প্ৰফাইল সম্পাদনা কৰক", anon_on: "পৰিচয় লুকুৱাই ৰখা হৈছে", anon_off: "ৰাজহুৱা পৰিচয়", karma: "নাগৰিক কৰ্ম", saved: "সংৰক্ষণ কৰা হৈছে", no_posts: "এতিয়ালৈকে কোনো ৰেকৰ্ড প্ৰকাশ কৰা হোৱা নাই।", fetching: "ডাটা ছিংক্ৰনাইজ কৰা হৈছে...", hide_identity: "পৰিচয় লুকুৱাওক", show_identity: "পৰিচয় দেখুৱাওক" },
        ur: { title: "پروفائل", posts: "پوسٹس", followers: "پیروکار", following: "پیروی کر رہے ہیں", edit: "پروفائل میں ترمیم کریں", anon_on: "شناخت پوشیدہ", anon_off: "عوامی شناخت", karma: "شہری کرما", saved: "محفوظ شدہ", no_posts: "ابھی تک کوئی ریکارڈ شائع نہیں ہوا۔", fetching: "ڈیٹا ہم آہنگ ہو رہا ہے۔۔۔", hide_identity: "شناخت چھپائیں", show_identity: "شناخت دکھائیں" },
        bho: { title: "प्रोफ़ाइल", posts: "पोस्ट", followers: "फॉलोअर्स", following: "फॉलोइंग", edit: "प्रोफ़ाइल संपादित करीं", anon_on: "पहचान छिपल बा", anon_off: "सार्वजनिक पहचान", karma: "नागरिक कर्म", saved: "सेव कइल गइल", no_posts: "अभी ले कवनो रिकॉर्ड प्रकाशित नइखे भइल।", fetching: "डेटा सिंक हो रहल बा...", hide_identity: "पहचान छिपाईं", show_identity: "पहचान दिखाईं" }
    };

    const currentT = t[lang] || t['en'];

    // Authentication Listener
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setCurrentUser(user);
        });
        return () => unsubscribe();
    }, []);

    // Real-Time Profile and Posts Fetching
    useEffect(() => {
        if (!profileId) return;

        setIsLoading(true);

        // Fetch User Profile Document
        const userRef = doc(db, 'users', profileId);
        const unsubUser = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                setProfileData(docSnap.data());
                setStats(prev => ({ ...prev, karma: docSnap.data().karma || 0 }));
            }
        });

        // Fetch User Posts
        const postsQuery = query(collection(db, 'nagrik_reels'), where('authorId', '==', profileId), orderBy('createdAt', 'desc'));
        const unsubPosts = onSnapshot(postsQuery, (snapshot) => {
            setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setIsLoading(false);
        }, (error) => {
            console.error("Posts fetch error:", error);
            setIsLoading(false);
        });

        // Mock Follower Stats for Architecture Placeholder (Replace with real collection queries when scaled)
        setStats(prev => ({ ...prev, followers: 245, following: 120 }));

        return () => {
            unsubUser();
            unsubPosts();
        };
    }, [profileId]);

    // Privacy Toggle Logic
    const toggleAnonymousMode = async () => {
        if (!isOwnProfile || !profileData) return;
        try {
            const userRef = doc(db, 'users', profileId);
            await updateDoc(userRef, { isAnonymous: !profileData.isAnonymous });
        } catch (error) {
            console.error("Privacy update failed", error);
        }
    };

    if (isLoading) {
        return (
            <div className="w-full min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-4 border-t-transparent border-[#00897B] rounded-full animate-spin mb-4"></div>
                <span className="font-bold text-[0.9rem] text-[#111111]/60">{currentT.fetching}</span>
            </div>
        );
    }

    const displayName = profileData?.isAnonymous && !isOwnProfile 
        ? "Hidden Citizen" 
        : (profileData?.name || "Citizen");

    return (
        <div className="bg-[#FFFFFF] min-h-screen w-full font-sans text-[#111111] pb-24">
            
            {/* Header */}
            <div className="sticky top-0 z-30 bg-[#FFFFFF] border-b border-[#111111]/10 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="outline-none active:scale-95 transition-transform">
                        <ChevronLeft size={28} className="text-[#111111]" strokeWidth={2.5} />
                    </button>
                    <span className="font-black text-[1.1rem] tracking-tight">{displayName}</span>
                </div>
                {isOwnProfile && (
                    <button className="outline-none active:scale-95 transition-transform">
                        <Settings size={24} className="text-[#111111]" />
                    </button>
                )}
            </div>

            {/* Profile Overview */}
            <div className="px-4 pt-6 pb-4 border-b border-[#111111]/5">
                <div className="flex items-center justify-between mb-6">
                    {/* Avatar */}
                    <div className="w-[86px] h-[86px] rounded-full bg-gradient-to-tr from-[#FFB300] to-[#00897B] p-[3px] shrink-0">
                        <div className="w-full h-full bg-[#FFFFFF] rounded-full border-2 border-[#FFFFFF] flex items-center justify-center overflow-hidden">
                            {profileData?.isAnonymous ? (
                                <EyeOff size={32} className="text-[#111111]/40" />
                            ) : (
                                <span className="text-[#111111] font-black text-[2rem] uppercase">{displayName.charAt(0)}</span>
                            )}
                        </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="flex-1 flex items-center justify-evenly ml-4">
                        <div className="flex flex-col items-center">
                            <span className="font-black text-[1.2rem]">{posts.length}</span>
                            <span className="text-[0.75rem] text-[#111111]/60 font-bold">{currentT.posts}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="font-black text-[1.2rem]">{stats.followers}</span>
                            <span className="text-[0.75rem] text-[#111111]/60 font-bold">{currentT.followers}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="font-black text-[1.2rem]">{stats.following}</span>
                            <span className="text-[0.75rem] text-[#111111]/60 font-bold">{currentT.following}</span>
                        </div>
                    </div>
                </div>

                {/* Bio & Badges */}
                <div className="mb-4">
                    <h2 className="font-black text-[1rem] flex items-center gap-1.5">
                        {displayName}
                        {!profileData?.isAnonymous && <Shield size={14} className="text-[#00897B]" fill="#00897B" />}
                    </h2>
                    <p className="text-[0.85rem] text-[#111111]/70 font-medium mt-1">
                        {profileData?.bio || "Civic contributor driving local community impact."}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 bg-[#FFB300]/20 text-[#111111] px-2 py-1 rounded text-[0.7rem] font-bold tracking-wide uppercase">
                            <Shield size={12} className="text-[#FFB300]" fill="#FFB300" />
                            {stats.karma} {currentT.karma}
                        </span>
                        <span className="inline-flex items-center gap-1 bg-[#00897B]/10 text-[#00897B] px-2 py-1 rounded text-[0.7rem] font-bold tracking-wide uppercase">
                            <MapPin size={12} /> {profileData?.ward || "Local Area"}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                {isOwnProfile && (
                    <div className="flex items-center gap-2 mt-4">
                        <button className="flex-1 bg-[#F9FAFB] border border-[#111111]/15 py-1.5 rounded-lg text-[0.85rem] font-bold active:bg-[#111111]/5 transition-colors flex items-center justify-center gap-1.5">
                            <Edit2 size={14} /> {currentT.edit}
                        </button>
                        <button 
                            onClick={toggleAnonymousMode}
                            className={`flex-1 border py-1.5 rounded-lg text-[0.85rem] font-bold active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 ${profileData?.isAnonymous ? 'bg-[#111111] text-[#FFFFFF] border-[#111111]' : 'bg-[#FFFFFF] text-[#111111] border-[#111111]/15'}`}
                        >
                            <EyeOff size={14} /> {profileData?.isAnonymous ? currentT.show_identity : currentT.hide_identity}
                        </button>
                    </div>
                )}
            </div>

            {/* Content Tabs */}
            <div className="flex border-b border-[#111111]/10">
                <button 
                    onClick={() => setActiveTab('posts')}
                    className={`flex-1 flex items-center justify-center py-3 border-b-2 transition-colors ${activeTab === 'posts' ? 'border-[#111111] text-[#111111]' : 'border-transparent text-[#111111]/40'}`}
                >
                    <Grid size={22} />
                </button>
                <button 
                    onClick={() => setActiveTab('saved')}
                    className={`flex-1 flex items-center justify-center py-3 border-b-2 transition-colors ${activeTab === 'saved' ? 'border-[#111111] text-[#111111]' : 'border-transparent text-[#111111]/40'}`}
                >
                    <Bookmark size={22} />
                </button>
            </div>

            {/* Media Grid */}
            <div className="w-full">
                {activeTab === 'posts' && (
                    posts.length === 0 ? (
                        <div className="py-16 text-center text-[#111111]/50 font-bold text-[0.9rem]">
                            {currentT.no_posts}
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-[2px]">
                            {posts.map(post => (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={post.id} className="aspect-square bg-[#F9FAFB] relative cursor-pointer group">
                                    {post.type === 'image' ? (
                                        <img src={post.mediaUrl} alt="Post" className="w-full h-full object-cover" />
                                    ) : (
                                        <>
                                            <video src={post.mediaUrl || post.videoUrl} className="w-full h-full object-cover" />
                                            <div className="absolute top-1 right-1 text-[#FFFFFF] drop-shadow-md">
                                                <Play size={16} fill="#FFFFFF" />
                                            </div>
                                        </>
                                    )}
                                    <div className="absolute inset-0 bg-[#111111]/0 group-hover:bg-[#111111]/20 transition-colors"></div>
                                </motion.div>
                            ))}
                        </div>
                    )
                )}

                {activeTab === 'saved' && (
                    <div className="py-16 text-center text-[#111111]/50 font-bold text-[0.9rem]">
                        {currentT.no_posts}
                    </div>
                )}
            </div>

        </div>
    );
}