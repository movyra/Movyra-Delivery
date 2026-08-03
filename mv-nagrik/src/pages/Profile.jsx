import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, LogOut, Mail, Calendar, ShieldCheck } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';

export default function Profile() {
    const navigate = useNavigate();
    const [lang, setLang] = useState('en');
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

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

    // Real-time Firebase Authentication Listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                // Instantly redirect unauthorized users to the onboarding flow
                navigate('/onboarding', { replace: true });
            }
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [navigate]);

    // 15 Comprehensive Indian Language Translations
    const t = {
        en: { title: "Profile", email: "Email Address", member: "Member Since", account: "Account ID", logout: "Sign Out", secure: "Secure Account", load: "Verifying Session..." },
        hi: { title: "प्रोफ़ाइल", email: "ईमेल पता", member: "सदस्य बने", account: "खाता आईडी", logout: "साइन आउट", secure: "सुरक्षित खाता", load: "सत्र सत्यापित हो रहा है..." },
        hinglish: { title: "Profile", email: "Email Address", member: "Member Since", account: "Account ID", logout: "Sign Out", secure: "Secure Account", load: "Session verify ho raha hai..." },
        mr: { title: "प्रोफाइल", email: "ईमेल पत्ता", member: "सदस्य झाल्यापासून", account: "खाते आयडी", logout: "साइन आउट", secure: "सुरक्षित खाते", load: "सत्र सत्यापित करत आहे..." },
        gu: { title: "પ્રોફાઇલ", email: "ઇમેઇલ સરનામું", member: "સભ્ય બન્યા", account: "એકાઉન્ટ આઈડી", logout: "સાઇન આઉટ", secure: "સુરક્ષિત એકાઉન્ટ", load: "સત્ર ચકાસી રહ્યા છીએ..." },
        te: { title: "ప్రొఫైల్", email: "ఇమెయిల్ చిరునామా", member: "సభ్యుడైన తేదీ", account: "ఖాతా ID", logout: "సైన్ అవుట్", secure: "సురక్షిత ఖాతా", load: "సెషన్ ధృవీకరించబడుతోంది..." },
        ta: { title: "சுயவிவரம்", email: "மின்னஞ்சல் முகவரி", member: "உறுப்பினர் ஆன நாள்", account: "கணக்கு ID", logout: "வெளியேறு", secure: "பாதுகாப்பான கணக்கு", load: "அமர்வு சரிபார்க்கப்படுகிறது..." },
        kn: { title: "ಪ್ರೊಫೈಲ್", email: "ಇಮೇಲ್ ವಿಳಾಸ", member: "ಸದಸ್ಯರಾದ ದಿನಾಂಕ", account: "ಖಾತೆ ಐಡಿ", logout: "ಸೈನ್ ಔಟ್", secure: "ಸುರಕ್ಷಿತ ಖಾತೆ", load: "ಸೆಷನ್ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ..." },
        ml: { title: "പ്രൊഫൈൽ", email: "ഇമെയിൽ വിലാസം", member: "അംഗമായ തീയതി", account: "അക്കൗണ്ട് ഐഡി", logout: "സൈൻ ഔട്ട്", secure: "സുരക്ഷിത അക്കൗണ്ട്", load: "സെഷൻ പരിശോധിക്കുന്നു..." },
        bn: { title: "প্রোফাইল", email: "ইমেইল ঠিকানা", member: "সদস্য হওয়ার তারিখ", account: "অ্যাকাউন্ট আইডি", logout: "সাইন আউট", secure: "নিরাপদ অ্যাকাউন্ট", load: "সেশন যাচাই করা হচ্ছে..." },
        pa: { title: "ਪ੍ਰੋਫਾਈਲ", email: "ਈਮੇਲ ਪਤਾ", member: "ਮੈਂਬਰ ਬਣਨ ਦੀ ਮਿਤੀ", account: "ਖਾਤਾ ਆਈਡੀ", logout: "ਸਾਈਨ ਆਉਟ", secure: "ਸੁਰੱਖਿਅਤ ਖਾਤਾ", load: "ਸੈਸ਼ਨ ਪ੍ਰਮਾਣਿਤ ਹੋ ਰਿਹਾ ਹੈ..." },
        or: { title: "ପ୍ରୋଫାଇଲ୍", email: "ଇମେଲ୍ ଠିକଣା", member: "ସଦସ୍ୟ ହେବା ଦିନ", account: "ଆକାଉଣ୍ଟ୍ ଆଇଡି", logout: "ସାଇନ୍ ଆଉଟ୍", secure: "ସୁରକ୍ଷିତ ଆକାଉଣ୍ଟ୍", load: "ଅଧିବେଶନ ଯାଞ୍ଚ ହେଉଛି..." },
        as: { title: "প্ৰফাইল", email: "ইমেইল ঠিকনা", member: "সদস্য হোৱা তাৰিখ", account: "একাউণ্ট আইডি", logout: "ছাইন আউট", secure: "সুৰক্ষিত একাউণ্ট", load: "অধিবেশন পৰীক্ষা কৰা হৈছে..." },
        ur: { title: "پروفائل", email: "ای میل ایڈریس", member: "ممبر بننے کی تاریخ", account: "اکاؤنٹ آئی ڈی", logout: "سائن آؤٹ", secure: "محفوظ اکاؤنٹ", load: "سیشن کی تصدیق ہو رہی ہے۔۔۔" },
        bho: { title: "प्रोफाइल", email: "ईमेल पता", member: "सदस्य बनला के तारीख", account: "खाता आईडी", logout: "साइन आउट", secure: "सुरक्षित खाता", load: "सत्र सत्यापित हो रहल बा..." }
    };

    const currentT = t[lang] || t['en'];

    // Real Firebase Logout Logic
    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await signOut(auth);
            navigate('/onboarding', { replace: true });
        } catch (error) {
            console.error("Logout failed:", error);
            setIsLoggingOut(false);
        }
    };

    // Date formatting for account creation
    const formatCreationDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center text-[#111111]">
                <div className="w-8 h-8 border-4 border-[#E0F2F1] border-t-[#00897B] rounded-full animate-spin mb-4"></div>
                <span className="font-bold text-[0.9rem] text-[#888888]">{currentT.load}</span>
            </div>
        );
    }

    if (!user) return null; // Fallback before redirect executes

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans pb-32">
            {/* Header Section */}
            <div className="bg-[#00897B] pt-12 pb-24 px-6 rounded-b-[40px] shadow-sm">
                <div className="max-w-[500px] mx-auto text-center mt-8">
                    <h1 className="text-[2rem] font-black text-white tracking-tight leading-tight">
                        {currentT.title}
                    </h1>
                </div>
            </div>

            {/* Profile Card Container */}
            <div className="max-w-[500px] mx-auto px-4 -mt-16 relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[32px] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] p-6 border border-[#E0E0E0] flex flex-col items-center"
                >
                    {/* User Avatar */}
                    <div className="w-24 h-24 bg-[#E0F2F1] rounded-full border-4 border-white shadow-sm flex items-center justify-center -mt-16 mb-4">
                        {user.photoURL ? (
                            <img src={user.photoURL} alt="User" className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <User size={40} className="text-[#00897B]" strokeWidth={2.5} />
                        )}
                    </div>

                    <h2 className="text-[1.5rem] font-black text-[#111111] tracking-tight mb-1">
                        {user.displayName || 'Citizen'}
                    </h2>
                    <div className="flex items-center gap-1.5 bg-[#E8F5E9] text-[#2E7D32] px-3 py-1 rounded-full border border-[#A5D6A7] mb-8">
                        <ShieldCheck size={14} />
                        <span className="text-[0.75rem] font-bold tracking-wide uppercase">{currentT.secure}</span>
                    </div>

                    {/* Account Details */}
                    <div className="w-full flex flex-col gap-4 mb-8">
                        {/* Email Field */}
                        <div className="flex items-start gap-4 p-4 rounded-[20px] bg-[#FAFAFA] border border-[#E0E0E0]">
                            <div className="w-10 h-10 rounded-full bg-[#E3F2FD] flex items-center justify-center shrink-0">
                                <Mail size={18} className="text-[#1565C0]" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[0.8rem] font-bold text-[#888888]">{currentT.email}</span>
                                <span className="text-[0.95rem] font-black text-[#111111] break-all">{user.email || 'N/A'}</span>
                            </div>
                        </div>

                        {/* Member Since Field */}
                        <div className="flex items-start gap-4 p-4 rounded-[20px] bg-[#FAFAFA] border border-[#E0E0E0]">
                            <div className="w-10 h-10 rounded-full bg-[#E0F2F1] flex items-center justify-center shrink-0">
                                <Calendar size={18} className="text-[#00897B]" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[0.8rem] font-bold text-[#888888]">{currentT.member}</span>
                                <span className="text-[0.95rem] font-black text-[#111111] break-all">{formatCreationDate(user.metadata.creationTime)}</span>
                            </div>
                        </div>

                        {/* Account ID Field */}
                        <div className="flex flex-col items-center mt-2">
                            <span className="text-[0.7rem] font-bold text-[#888888] uppercase tracking-wider mb-1">{currentT.account}</span>
                            <span className="text-[0.7rem] font-mono font-medium text-[#cccccc] bg-[#FAFAFA] px-2 py-1 rounded-md border border-[#E0E0E0]">{user.uid}</span>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <button 
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full h-[60px] bg-[#FFEBEE] text-[#D32F2F] rounded-[20px] font-black text-[1rem] transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 border border-[#EF9A9A] outline-none"
                    >
                        {isLoggingOut ? (
                            <div className="w-6 h-6 border-2 border-t-transparent border-[#D32F2F] rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <LogOut size={20} strokeWidth={2.5} />
                                {currentT.logout}
                            </>
                        )}
                    </button>
                </motion.div>
            </div>
        </div>
    );
}