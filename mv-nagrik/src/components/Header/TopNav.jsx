import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogIn, Mail, Lock, X } from 'lucide-react';
import { 
    onAuthStateChanged, signInWithRedirect, GoogleAuthProvider, 
    signInWithEmailAndPassword, createUserWithEmailAndPassword 
} from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { motion, AnimatePresence } from 'framer-motion';

// Custom Minimalist Google SVG Icon
const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg" className="mx-[1px]">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
);

export default function TopNav() {
    const navigate = useNavigate();
    const [lang, setLang] = useState('en');
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Modal Auth State
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [authError, setAuthError] = useState('');

    // Real-time language listener for global consistency
    useEffect(() => {
        const savedLang = localStorage.getItem('nagrik_lang') || navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'hinglish', 'mr', 'gu', 'te', 'ta', 'kn', 'ml', 'bn', 'pa', 'or', 'as', 'ur', 'bho'];
        
        if (supported.includes(savedLang)) {
            setLang(savedLang);
        }

        const handleStorageChange = () => {
            const newLang = localStorage.getItem('nagrik_lang');
            if (newLang && supported.includes(newLang)) {
                setLang(newLang);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Real-time Firebase Authentication Listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setIsLoading(false);
            if (currentUser) {
                setShowAuthModal(false); // Auto-close modal if login succeeds
            }
        });
        return () => unsubscribe();
    }, []);

    // 15 Comprehensive Indian Language Translations
    const t = {
        en: { profile: "Profile", login: "Sign In", logo_alt: "NagrikSetu Logo", signup: "Create Account", email: "Email Address", pass: "Password", no_acc: "Need an account?", has_acc: "Already have an account?" },
        hi: { profile: "प्रोफ़ाइल", login: "साइन इन", logo_alt: "नागरिकसेतु लोगो", signup: "खाता बनाएं", email: "ईमेल पता", pass: "पासवर्ड", no_acc: "खाता चाहिए?", has_acc: "क्या आपके पास पहले से खाता है?" },
        hinglish: { profile: "Profile", login: "Sign In", logo_alt: "NagrikSetu Logo", signup: "Account Banayein", email: "Email Address", pass: "Password", no_acc: "Account nahi hai?", has_acc: "Pehle se account hai?" },
        mr: { profile: "प्रोफाइल", login: "साइन इन करा", logo_alt: "नागरिकसेतू लोगो", signup: "खाते तयार करा", email: "ईमेल पत्ता", pass: "पासवर्ड", no_acc: "खाते हवे आहे?", has_acc: "आधीच खाते आहे का?" },
        gu: { profile: "પ્રોફાઇલ", login: "સાઇન ઇન", logo_alt: "નાગરિકસેતુ લોગો", signup: "એકાઉન્ટ બનાવો", email: "ઇમેઇલ સરનામું", pass: "પાસવર્ડ", no_acc: "એકાઉન્ટની જરૂર છે?", has_acc: "શું તમારી પાસે પહેલેથી એકાઉન્ટ છે?" },
        te: { profile: "ప్రొఫైల్", login: "సైన్ ఇన్", logo_alt: "నాగ్రిక్ సేతు లోగో", signup: "ఖాతా సృష్టించండి", email: "ఇమెయిల్ చిరునామా", pass: "పాస్వర్డ్", no_acc: "ఖాతా కావాలా?", has_acc: "ఇప్పటికే ఖాతా ఉందా?" },
        ta: { profile: "சுயவிவரம்", login: "உள்நுழைக", logo_alt: "நாகரிக்சேது லோகோ", signup: "கணக்கை உருவாக்கு", email: "மின்னஞ்சல் முகவரி", pass: "கடவுச்சொல்", no_acc: "கணக்கு வேண்டுமா?", has_acc: "ஏற்கனவே கணக்கு உள்ளதா?" },
        kn: { profile: "ಪ್ರೊಫೈಲ್", login: "ಸೈನ್ ಇನ್", logo_alt: "ನಾಗರಿಕ್ ಸೇತು ಲೋಗೋ", signup: "ಖಾತೆ ರಚಿಸಿ", email: "ಇಮೇಲ್ ವಿಳಾಸ", pass: "ಪಾಸ್‌ವರ್ಡ್", no_acc: "ಖಾತೆ ಬೇಕೇ?", has_acc: "ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?" },
        ml: { profile: "പ്രൊഫൈൽ", login: "സൈൻ ഇൻ", logo_alt: "നാഗരിക് സേതു ലോഗോ", signup: "അക്കൗണ്ട് സൃഷ്ടിക്കുക", email: "ഇമെയിൽ വിലാസം", pass: "പാസ്‌വേഡ്", no_acc: "അക്കൗണ്ട് വേണോ?", has_acc: "ഇതിനകം ഒരു അക്കൗണ്ട് ഉണ്ടോ?" },
        bn: { profile: "প্রোফাইল", login: "সাইন ইন", logo_alt: "নাগরিকসেতু লোগো", signup: "অ্যাকাউন্ট তৈরি করুন", email: "ইমেইল ঠিকানা", pass: "পাসওয়ার্ড", no_acc: "একটি অ্যাকাউন্ট প্রয়োজন?", has_acc: "ইতিমধ্যে একটি অ্যাকাউন্ট আছে?" },
        pa: { profile: "ਪ੍ਰੋਫਾਈਲ", login: "ਸਾਈਨ ਇਨ", logo_alt: "ਨਾਗਰਿਕਸੇਤੂ ਲੋਗੋ", signup: "ਖਾਤਾ ਬਣਾਓ", email: "ਈਮੇਲ ਪਤਾ", pass: "ਪਾਸਵਰਡ", no_acc: "ਕੀ ਕੋਈ ਖਾਤਾ ਚਾਹੀਦਾ ਹੈ?", has_acc: "ਕੀ ਪਹਿਲਾਂ ਹੀ ਕੋਈ ਖਾਤਾ ਹੈ?" },
        or: { profile: "ପ୍ରୋଫାଇଲ୍", login: "ସାଇନ୍ ଇନ୍", logo_alt: "ନାଗରିକସେତୁ ଲୋଗୋ", signup: "ଖାତା ତିଆରି କରନ୍ତୁ", email: "ଇମେଲ୍ ଠିକଣା", pass: "ପାସୱାର୍ଡ", no_acc: "ଏକ ଖାତା ଦରକାର କି?", has_acc: "ପୂର୍ବରୁ ଏକ ଖାତା ଅଛି କି?" },
        as: { profile: "প্ৰফাইল", login: "ছাইন ইন", logo_alt: "নাগৰিকসেতু লোগো", signup: "একাউণ্ট বনাওক", email: "ইমেইল ঠিকনা", pass: "পাছৱৰ্ড", no_acc: "একাউণ্ট লাগে নেকি?", has_acc: "ইতিমধ্যে এটা একাউণ্ট আছে নেকি?" },
        ur: { profile: "پروفائل", login: "سائن ان کریں", logo_alt: "ناگرک سیتو لوگو", signup: "اکاؤنٹ بنائیں", email: "ای میل ایڈریس", pass: "پاس ورڈ", no_acc: "اکاؤنٹ درکار ہے؟", has_acc: "کیا پہلے سے اکاؤنٹ ہے؟" },
        bho: { profile: "प्रोफाइल", login: "साइन इन", logo_alt: "नागरिकसेतु लोगो", signup: "खाता बनाईं", email: "ईमेल पता", pass: "पासवर्ड", no_acc: "खाता चाहीं?", has_acc: "का पहिले से खाता बा?" }
    };

    const currentT = t[lang] || t['en'];

    const handleAuthClick = () => {
        if (user) {
            navigate('/profile');
        } else {
            setShowAuthModal(true);
        }
    };

    // Modal Authentication Handlers
    const handleGoogleSignIn = async () => {
        if (isAuthenticating) return;
        setIsAuthenticating(true);
        const provider = new GoogleAuthProvider();
        try {
            await signInWithRedirect(auth, provider);
        } catch (error) {
            console.error("Google Auth failed:", error);
            setAuthError("Sign-in failed. Please try again.");
            setIsAuthenticating(false);
        }
    };

    const handleManualAuth = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setAuthError("Please fill all fields.");
            return;
        }
        
        setIsAuthenticating(true);
        setAuthError('');
        
        try {
            if (authMode === 'signup') {
                await createUserWithEmailAndPassword(auth, email, password);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
        } catch (error) {
            console.error("Manual Auth failed:", error);
            setAuthError("Invalid credentials or account exists.");
        } finally {
            setIsAuthenticating(false);
        }
    };

    const closeAuthModal = () => {
        setShowAuthModal(false);
        setEmail('');
        setPassword('');
        setAuthError('');
        setAuthMode('login');
    };

    return (
        <>
            <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="fixed top-0 left-0 right-0 h-16 bg-[#FFFFFF] border-b border-[#111111]/10 z-[40] flex items-center justify-between px-6 shadow-sm"
            >
                <div className="flex items-center cursor-pointer" onClick={() => navigate('/home')}>
                    <img 
                        src="/logo.png" 
                        alt={currentT.logo_alt} 
                        className="h-8 w-auto object-contain"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                        }}
                    />
                    <span className="hidden text-[1.2rem] font-black tracking-tight text-[#111111] ml-2">
                        <span className="text-[#00897B]">N</span>agrikSetu
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    {isLoading ? (
                        <div className="w-8 h-8 rounded-full bg-[#111111]/10 animate-pulse"></div>
                    ) : (
                        <button 
                            onClick={handleAuthClick}
                            className="w-10 h-10 rounded-full bg-[#FFFFFF] flex items-center justify-center border border-[#00897B] active:scale-95 transition-transform outline-none"
                            aria-label={user ? currentT.profile : currentT.login}
                            title={user ? currentT.profile : currentT.login}
                        >
                            {user ? (
                                <User size={20} className="text-[#00897B]" strokeWidth={2.5} />
                            ) : (
                                <LogIn size={20} className="text-[#00897B]" strokeWidth={2.5} />
                            )}
                        </button>
                    )}
                </div>
            </motion.div>

            {/* Integrated Auth Modal */}
            <AnimatePresence>
                {showAuthModal && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[99999] bg-[#111111]/60 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 20 }} 
                            animate={{ scale: 1, y: 0 }} 
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-[#FFFFFF] w-full max-w-[400px] rounded-[32px] p-6 shadow-2xl relative flex flex-col"
                        >
                            <button 
                                onClick={closeAuthModal} 
                                className="absolute top-4 right-4 text-[#111111]/40 hover:text-[#111111] transition-colors outline-none"
                            >
                                <X size={24} strokeWidth={2} />
                            </button>

                            <div className="text-center mb-8 mt-2">
                                <h2 className="text-[1.8rem] font-black text-[#111111] tracking-tight">
                                    {authMode === 'login' ? currentT.login : currentT.signup}
                                </h2>
                            </div>

                            <form onSubmit={handleManualAuth} className="flex flex-col gap-4">
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#111111]/40" size={20} />
                                    <input 
                                        type="email" 
                                        placeholder={currentT.email}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full bg-[#FFFFFF] border border-[#111111]/10 rounded-[16px] py-3.5 pl-12 pr-4 text-[#111111] font-medium focus:border-[#00897B] focus:ring-1 focus:ring-[#00897B] outline-none transition-all"
                                    />
                                </div>
                                
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#111111]/40" size={20} />
                                    <input 
                                        type="password" 
                                        placeholder={currentT.pass}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full bg-[#FFFFFF] border border-[#111111]/10 rounded-[16px] py-3.5 pl-12 pr-4 text-[#111111] font-medium focus:border-[#00897B] focus:ring-1 focus:ring-[#00897B] outline-none transition-all"
                                    />
                                </div>

                                {authError && (
                                    <p className="text-[#D32F2F] text-[0.8rem] font-bold text-center">{authError}</p>
                                )}

                                <button 
                                    type="submit"
                                    disabled={isAuthenticating}
                                    className="w-full bg-[#111111] text-[#FFFFFF] font-bold text-[1rem] py-3.5 rounded-[16px] mt-2 transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center outline-none shadow-md"
                                >
                                    {isAuthenticating ? (
                                        <div className="w-5 h-5 border-2 border-t-transparent border-[#FFFFFF] rounded-full animate-spin"></div>
                                    ) : (
                                        authMode === 'login' ? currentT.login : currentT.signup
                                    )}
                                </button>
                            </form>

                            <div className="flex items-center gap-4 my-6">
                                <div className="flex-1 h-px bg-[#111111]/10"></div>
                                <span className="text-[#111111]/40 text-[0.8rem] font-black uppercase tracking-wider">OR</span>
                                <div className="flex-1 h-px bg-[#111111]/10"></div>
                            </div>

                            {/* Strict Custom Google Button Design */}
                            <button 
                                onClick={handleGoogleSignIn}
                                disabled={isAuthenticating}
                                className="w-full bg-[#FFFFFF] border border-[#111111]/10 text-[#111111] font-bold text-[0.95rem] py-3.5 rounded-[16px] transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center outline-none shadow-sm hover:bg-[#111111]/5"
                            >
                                <span className="flex items-center">
                                    Continue with&nbsp;<GoogleIcon /> oogle
                                </span>
                            </button>

                            <div className="mt-8 text-center">
                                <p className="text-[#111111]/70 text-[0.9rem] font-medium">
                                    {authMode === 'login' ? currentT.no_acc : currentT.has_acc}
                                    <button 
                                        onClick={() => {
                                            setAuthMode(authMode === 'login' ? 'signup' : 'login');
                                            setAuthError('');
                                        }}
                                        className="ml-2 text-[#00897B] font-black hover:underline outline-none"
                                    >
                                        {authMode === 'login' ? currentT.signup : currentT.login}
                                    </button>
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}