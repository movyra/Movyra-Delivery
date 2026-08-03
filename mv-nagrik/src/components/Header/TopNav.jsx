import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogIn } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { motion } from 'framer-motion';

export default function TopNav() {
    const navigate = useNavigate();
    const [lang, setLang] = useState('en');
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

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
        });
        return () => unsubscribe();
    }, []);

    // 15 Comprehensive Indian Language Translations for Accessibility and Tooltips
    const t = {
        en: { profile: "Profile", login: "Sign In / Sign Up", logo_alt: "NagrikSetu Logo" },
        hi: { profile: "प्रोफ़ाइल", login: "साइन इन / साइन अप", logo_alt: "नागरिकसेतु लोगो" },
        hinglish: { profile: "Profile", login: "Sign In / Sign Up", logo_alt: "NagrikSetu Logo" },
        mr: { profile: "प्रोफाइल", login: "साइन इन / साइन अप", logo_alt: "नागरिकसेतू लोगो" },
        gu: { profile: "પ્રોફાઇલ", login: "સાઇન ઇન / સાઇન અપ", logo_alt: "નાગરિકસેતુ લોગો" },
        te: { profile: "ప్రొఫైల్", login: "సైన్ ఇన్ / సైన్ అప్", logo_alt: "నాగ్రిక్ సేతు లోగో" },
        ta: { profile: "சுயவிவரம்", login: "உள்நுழைக / பதிவு செய்க", logo_alt: "நாகரிக்சேது லோகோ" },
        kn: { profile: "ಪ್ರೊಫೈಲ್", login: "ಸೈನ್ ಇನ್ / ಸೈನ್ ಅಪ್", logo_alt: "ನಾಗರಿಕ್ ಸೇತು ಲೋಗೋ" },
        ml: { profile: "പ്രൊഫൈൽ", login: "സൈൻ ഇൻ / സൈൻ അപ്പ്", logo_alt: "നാഗരിക് സേതു ലോഗോ" },
        bn: { profile: "প্রোফাইল", login: "সাইন ইন / সাইন আপ", logo_alt: "নাগরিকসেতু লোগো" },
        pa: { profile: "ਪ੍ਰੋਫਾਈਲ", login: "ਸਾਈਨ ਇਨ / ਸਾਈਨ ਅੱਪ", logo_alt: "ਨਾਗਰਿਕਸੇਤੂ ਲੋਗੋ" },
        or: { profile: "ପ୍ରୋଫାଇଲ୍", login: "ସାଇନ୍ ଇନ୍ / ସାଇନ୍ ଅପ୍", logo_alt: "ନାଗରିକସେତୁ ଲୋଗୋ" },
        as: { profile: "প্ৰফাইল", login: "চাইন ইন / চাইন আপ", logo_alt: "নাগৰিকসেতু লোগো" },
        ur: { profile: "پروفائل", login: "سائن ان / سائن اپ", logo_alt: "ناگرک سیتو لوگو" },
        bho: { profile: "प्रोफाइल", login: "साइन इन / साइन अप", logo_alt: "नागरिकसेतु लोगो" }
    };

    const currentT = t[lang] || t['en'];

    const handleAuthClick = () => {
        if (user) {
            navigate('/profile');
        } else {
            navigate('/onboarding');
        }
    };

    return (
        <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-0 left-0 right-0 h-16 bg-[#FFFFFF] border-b border-[#E0E0E0] z-[9990] flex items-center justify-between px-6 shadow-sm"
        >
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/home')}>
                {/* Strictly using the required .png based logo format */}
                <img 
                    src="/logo.png" 
                    alt={currentT.logo_alt} 
                    className="h-8 w-auto object-contain"
                    onError={(e) => {
                        // Fallback text if logo.png is not yet placed in the public folder
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
                    <div className="w-8 h-8 rounded-full bg-[#E0E0E0] animate-pulse"></div>
                ) : (
                    <button 
                        onClick={handleAuthClick}
                        className="w-10 h-10 rounded-full bg-[#E0F2F1] flex items-center justify-center border border-[#00897B] active:scale-95 transition-transform outline-none"
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
    );
}