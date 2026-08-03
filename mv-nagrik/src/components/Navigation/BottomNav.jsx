import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Bell, PlaySquare, LayoutGrid } from 'lucide-react';

export default function BottomNav() {
    const location = useLocation();
    const currentPath = location.pathname;

    const [lang, setLang] = useState('en');

    // Real-time language listener for global consistency without complex state libraries
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

    // 15 Comprehensive Indian Language Translations
    const t = {
        en: { home: "Home", alerts: "Alerts", feed: "Feed", more: "More" },
        hi: { home: "होम", alerts: "अलर्ट", feed: "फ़ीड", more: "अधिक" },
        hinglish: { home: "Home", alerts: "Alerts", feed: "Feed", more: "More" },
        mr: { home: "मुख्यपृष्ठ", alerts: "सूचना", feed: "फीड", more: "अधिक" },
        gu: { home: "હોમ", alerts: "એલર્ટ", feed: "ફીડ", more: "વધુ" },
        te: { home: "హోమ్", alerts: "అలర్ట్స్", feed: "ఫీడ్", more: "మరింత" },
        ta: { home: "முகப்பு", alerts: "அலர்ட்ஸ்", feed: "ஃபீட்", more: "மேலும்" },
        kn: { home: "ಮುಖಪುಟ", alerts: "ಅಲರ್ಟ್ಸ್", feed: "ಫೀಡ್", more: "ಇನ್ನಷ್ಟು" },
        ml: { home: "ഹോം", alerts: "അലർട്ടുകൾ", feed: "ഫീഡ്", more: "കൂടുതൽ" },
        bn: { home: "হোম", alerts: "অ্যালার্ট", feed: "ফিড", more: "আরও" },
        pa: { home: "ਹੋਮ", alerts: "ਅਲਰਟ", feed: "ਫੀਡ", more: "ਹੋਰ" },
        or: { home: "ହୋମ୍", alerts: "ଆଲର୍ଟ", feed: "ଫିଡ୍", more: "ଅଧିକ" },
        as: { home: "হোম", alerts: "এলাৰ்ட்", feed: "ফীড", more: "অধিক" },
        ur: { home: "ہوم", alerts: "الرٹس", feed: "فیڈ", more: "مزید" },
        bho: { home: "होम", alerts: "अलर्ट", feed: "फीड", more: "अउरी" }
    };

    const currentT = t[lang] || t['en'];

    // Navigation Schema Mapping
    const navItems = [
        { path: '/home', icon: Home, label: currentT.home },
        { path: '/alerts', icon: Bell, label: currentT.alerts },
        { path: '/feed', icon: PlaySquare, label: currentT.feed },
        { path: '/more', icon: LayoutGrid, label: currentT.more }
    ];

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[400px] bg-[#111111] text-white rounded-full px-2 py-2 flex justify-between items-center z-[9999] shadow-2xl border border-[#333333]">
            {navItems.map((item) => {
                const isActive = currentPath.startsWith(item.path);
                return (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex flex-col items-center justify-center w-full py-2.5 px-1 rounded-full transition-colors outline-none ${
                            isActive ? 'bg-[#2a2a2a] text-white' : 'text-[#888888] hover:text-[#cccccc]'
                        }`}
                    >
                        <item.icon size={22} className="mb-1" strokeWidth={isActive ? 2.5 : 2} />
                        <span className="text-[0.7rem] font-bold tracking-wide">{item.label}</span>
                    </Link>
                );
            })}
        </div>
    );
}