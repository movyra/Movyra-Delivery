import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { useCivicStore } from '../../store/useCivicStore';
import { 
    ArrowLeft, 
    LogOut,
    X,
    Globe,
    ArrowUp,
    HeartHandshake,
    ShieldCheck,
    Building,
    CheckCircle,
    Users
} from 'lucide-react';

export default function SahayAbout() {
    const navigate = useNavigate();
    
    // 1. STATE MANAGEMENT
    const theme = useCivicStore((state) => state.theme) || 'light'; 
    const terminateSession = useCivicStore((state) => state.terminateSession);

    const [lang, setLang] = useState('en');
    const [showLangPrompt, setShowLangPrompt] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // 2. AUTHENTICATION & INITIALIZATION
    useEffect(() => {
        const sysLang = navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'hinglish', 'mr', 'gu', 'te', 'ta', 'pa', 'bho', 'ar', 'es', 'fr', 'de'];
        if (supported.includes(sysLang)) setLang(sysLang);

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUser(user);
            }
        });

        return () => unsubscribe();
    }, []);

    // 3. OPERATIONAL LOGIC
    const handleSignOut = async () => {
        try {
            await signOut(auth);
            terminateSession();
            navigate('/sahay');
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    // 4. 13-LANGUAGE DICTIONARY (Simple Consumer Context)
    const t = {
        en: {
            lang: "English", log_out: "Log out", careers: "Careers", products: "Products", back: "Back to Home",
            title: "About Movyra Sahay", sub: "Connecting people in need with verified help.",
            m_title: "Our Mission", m_desc: "We built this platform to ensure no emergency goes unnoticed. If you see someone who needs help, report it here. We will connect them to the right organization.",
            p_title: "Privacy First", p_desc: "Your identity is hidden. Private details are only shared with verified medical and rescue teams.",
            j_title: "How Partners Join", 
            step1: "Apply", step1_desc: "Submit your details.",
            step2: "Get Verified", step2_desc: "We check your documents.",
            step3: "Start Helping", step3_desc: "Receive rescue alerts.",
            btn_contact: "Contact Us"
        },
        hi: {
            lang: "हिन्दी", log_out: "लॉग आउट", careers: "करियर", products: "उत्पाद", back: "होम पर वापस जाएं",
            title: "मोविरा सहाय के बारे में", sub: "जरूरतमंद लोगों को सही मदद से जोड़ना।",
            m_title: "हमारा लक्ष्य", m_desc: "हमने यह सुनिश्चित करने के लिए यह मंच बनाया है कि कोई भी आपात स्थिति अनदेखी न रहे। यदि आप किसी को मदद की जरूरत में देखते हैं, तो यहां रिपोर्ट करें।",
            p_title: "गोपनीयता पहले", p_desc: "आपकी पहचान छिपी रहती है। निजी विवरण केवल सत्यापित टीमों के साथ साझा किए जाते हैं।",
            j_title: "पार्टनर कैसे जुड़ें", 
            step1: "आवेदन करें", step1_desc: "अपना विवरण जमा करें।",
            step2: "सत्यापित हों", step2_desc: "हम दस्तावेजों की जांच करते हैं।",
            step3: "मदद शुरू करें", step3_desc: "बचाव अलर्ट प्राप्त करें।",
            btn_contact: "संपर्क करें"
        },
        hinglish: {
            lang: "Hinglish", log_out: "Log out", careers: "Careers", products: "Products", back: "Home par wapas",
            title: "About Movyra Sahay", sub: "Zaruratmand logo ko sahi help se connect karna.",
            m_title: "Hamara Mission", m_desc: "Koi bhi emergency miss na ho, isliye humne ye platform banaya hai. Agar kisi ko help chahiye, yahan report karein.",
            p_title: "Privacy First", p_desc: "Aapki identity hide rehti hai. Private details sirf verified teams ko dikhti hain.",
            j_title: "Partners Kaise Join Karein", 
            step1: "Apply", step1_desc: "Details submit karein.",
            step2: "Verify", step2_desc: "Hum documents check karte hain.",
            step3: "Start Helping", step3_desc: "Rescue alerts receive karein.",
            btn_contact: "Contact Us"
        }
    };

    const currentT = t[lang] || t['en'];
    const languageOptions = [
        { code: 'en', label: 'English' }, { code: 'hi', label: 'हिन्दी' }, { code: 'hinglish', label: 'Hinglish' }
    ];

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };

    return (
        <div className="min-h-screen font-sans overflow-x-hidden flex flex-col relative bg-[#FFFFFF] text-[#111111] selection:bg-[#FF6B35] selection:text-white">
            
            <style>
                {`
                  @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                  .animate-fade { animation: fadeIn 0.8s ease-out forwards; }
                  html { scroll-behavior: smooth; }
                `}
            </style>

            {/* TOP HEADER */}
            <header className="w-full flex items-center justify-between px-6 md:px-12 py-6 animate-fade z-50 bg-[#FFFFFF]/90 border-b border-[#E5E7EB] backdrop-blur-md sticky top-0">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/sahay')}>
                    <img 
                        src={theme === 'light' ? '/logo-4.png' : '/logo.png'} 
                        alt="Movyra" 
                        className="h-8 w-auto" 
                        onError={(e) => e.target.style.display = 'none'} 
                    />
                    <span className="font-black text-[1.5rem] tracking-tighter ml-[-5px]">
                        ovyra <span className={`${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'} font-medium text-[1.2rem] ml-1`}>Sahay</span>
                    </span>
                </div>
                
                <div className="flex items-center gap-3 sm:gap-6 text-[0.9rem] font-bold">
                    <button onClick={() => setShowLangPrompt(true)} className="flex items-center gap-2 text-[#555555] hover:text-[#111111] transition-colors outline-none px-3 py-1.5 rounded-full border border-[#E5E7EB] hover:border-[#111111]">
                        <Globe size={14} /> <span className="hidden sm:inline">{currentT.lang}</span>
                    </button>
                    {currentUser && (
                        <>
                            <button onClick={handleSignOut} className="text-[#555555] hover:text-[#111111] transition-colors outline-none hidden sm:block">
                                {currentT.log_out}
                            </button>
                            <button onClick={handleSignOut} className="p-2 rounded-full bg-[#F7F7F7] text-[#111111] hover:bg-[#E5E7EB] transition-colors outline-none block sm:hidden">
                                <LogOut size={16} />
                            </button>
                        </>
                    )}
                </div>
            </header>

            {/* LANGUAGE SELECTOR MODAL */}
            <AnimatePresence>
                {showLangPrompt && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] bg-[#111111]/80 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-[400px] bg-[#FFFFFF] rounded-3xl p-8 flex flex-col shadow-2xl relative border border-[#E5E7EB]"
                        >
                            <button onClick={() => setShowLangPrompt(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[#555555] hover:text-[#111111] transition-colors outline-none">
                                <X size={18} />
                            </button>
                            <h2 className="text-[1.4rem] font-black tracking-tight mb-6 text-center text-[#111111]">Select Language</h2>
                            <div className="flex flex-col gap-2">
                                {languageOptions.map((option) => (
                                    <button 
                                        key={option.code}
                                        onClick={() => { setLang(option.code); setShowLangPrompt(false); }}
                                        className={`w-full p-4 rounded-xl flex items-center justify-between transition-colors border outline-none ${lang === option.code ? 'bg-[#FF6B35]/10 border-[#FF6B35] text-[#FF6B35]' : 'bg-[#F7F7F7] border-[#E5E7EB] text-[#555555] hover:border-[#111111] hover:text-[#111111]'}`}
                                    >
                                        <span className="font-bold text-[1rem]">{option.label}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="flex-1 max-w-[900px] w-full mx-auto px-6 md:px-12 py-12 animate-fade flex flex-col">
                
                <button onClick={() => navigate('/sahay')} className="flex items-center gap-2 mb-8 outline-none font-bold text-[0.9rem] text-[#555555] hover:text-[#111111] transition-colors self-start">
                    <ArrowLeft size={16} /> {currentT.back}
                </button>

                <div className="mb-12">
                    <h1 className="text-[2.5rem] md:text-[3.5rem] font-black leading-[1.1] tracking-tighter mb-4 text-[#111111]">
                        {currentT.title}
                    </h1>
                    <p className="text-[1.1rem] text-[#555555] font-medium">
                        {currentT.sub}
                    </p>
                </div>

                <motion.div initial="hidden" animate="visible" variants={containerVariants} className="flex flex-col gap-10">
                    
                    {/* Mission Section */}
                    <motion.section variants={itemVariants} className="bg-[#FF6B35]/5 border border-[#FF6B35]/20 rounded-3xl p-8 md:p-10">
                        <div className="flex items-center gap-3 mb-4">
                            <HeartHandshake size={28} className="text-[#FF6B35]" />
                            <h2 className="text-[1.5rem] font-black text-[#111111]">{currentT.m_title}</h2>
                        </div>
                        <p className="text-[1.05rem] text-[#555555] leading-relaxed">
                            {currentT.m_desc}
                        </p>
                    </motion.section>

                    {/* Privacy Section */}
                    <motion.section variants={itemVariants} className="bg-[#00A9F7]/5 border border-[#00A9F7]/20 rounded-3xl p-8 md:p-10">
                        <div className="flex items-center gap-3 mb-4">
                            <ShieldCheck size={28} className="text-[#00A9F7]" />
                            <h2 className="text-[1.5rem] font-black text-[#111111]">{currentT.p_title}</h2>
                        </div>
                        <p className="text-[1.05rem] text-[#555555] leading-relaxed">
                            {currentT.p_desc}
                        </p>
                    </motion.section>

                    {/* Partner Workflow Section */}
                    <motion.section variants={itemVariants} className="bg-[#F7F7F7] border border-[#E5E7EB] rounded-3xl p-8 md:p-10">
                        <div className="flex items-center gap-3 mb-8">
                            <Building size={28} className="text-[#111111]" />
                            <h2 className="text-[1.5rem] font-black text-[#111111]">{currentT.j_title}</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
                                <div className="w-10 h-10 rounded-full bg-[#111111] text-[#FFFFFF] font-black flex items-center justify-center mb-4">1</div>
                                <h3 className="text-[1.1rem] font-black text-[#111111] mb-2">{currentT.step1}</h3>
                                <p className="text-[0.9rem] text-[#555555]">{currentT.step1_desc}</p>
                            </div>
                            <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
                                <div className="w-10 h-10 rounded-full bg-[#F59E0B] text-[#FFFFFF] font-black flex items-center justify-center mb-4">2</div>
                                <h3 className="text-[1.1rem] font-black text-[#111111] mb-2">{currentT.step2}</h3>
                                <p className="text-[0.9rem] text-[#555555]">{currentT.step2_desc}</p>
                            </div>
                            <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
                                <div className="w-10 h-10 rounded-full bg-[#16A34A] text-[#FFFFFF] font-black flex items-center justify-center mb-4">3</div>
                                <h3 className="text-[1.1rem] font-black text-[#111111] mb-2">{currentT.step3}</h3>
                                <p className="text-[0.9rem] text-[#555555]">{currentT.step3_desc}</p>
                            </div>
                        </div>

                        <div className="mt-8 text-center">
                            <button 
                                onClick={() => navigate('/sahay/contact')}
                                className="bg-[#111111] text-[#FFFFFF] px-8 py-3 rounded-full font-bold hover:bg-[#333333] transition-colors outline-none"
                            >
                                {currentT.btn_contact}
                            </button>
                        </div>
                    </motion.section>

                </motion.div>
            </main>

            {/* FOOTER ALIGNMENT */}
            <footer className="w-full mx-auto flex flex-col md:flex-row items-center justify-between gap-8 px-8 md:px-16 py-12 border-t border-[#E5E7EB] bg-[#FFFFFF] relative z-10 animate-fade">
                <div className="flex flex-wrap items-center gap-6">
                    <button onClick={() => setShowLangPrompt(true)} className="flex items-center gap-2 text-[0.8rem] font-bold px-3 py-1.5 rounded-full transition-colors border border-[#E5E7EB] text-[#555555] hover:border-[#111111] hover:text-[#111111] outline-none">
                        <Globe size={14} /> {currentT.lang}
                    </button>
                    <div className="flex items-center gap-6 text-[#555555]">
                        <a href="https://www.linkedin.com/company/getmovyra/" target="_blank" rel="noopener noreferrer" className="hover:text-[#111111] transition-colors outline-none"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
                        <a href="#youtube" className="hover:text-[#111111] transition-colors outline-none"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg></a>
                        <a href="https://www.instagram.com/getmovyra" target="_blank" rel="noopener noreferrer" className="hover:text-[#111111] transition-colors outline-none"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>
                        <a href="#x" className="hover:text-[#111111] transition-colors outline-none"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.006 4.15H5.078z"/></svg></a>
                    </div>
                </div>
                
                <div className="flex flex-col md:flex-row items-center gap-6 text-[0.8rem] font-bold text-[#555555]">
                    <div className="flex items-center gap-6">
                        <Link to="/careers" className="hover:text-[#111111] transition-colors outline-none">{currentT.careers}</Link>
                    </div>
                    <span className="hidden md:block w-1 h-1 bg-[#E5E7EB] rounded-full"></span>
                    
                    <div className="flex items-center gap-2 text-[0.75rem] uppercase tracking-wider">
                        Built by 
                        <a href="https://rebrand.ly/aatns" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition-opacity outline-none">
                            <img src={theme === 'light' ? '/aat2.png' : '/aat.png'} alt="AnyAstro" className="h-4 w-auto object-contain" onError={(e) => { e.target.style.display = 'none'; e.target.insertAdjacentHTML('afterend', '<span class="underline text-[#111111]">AnyAstro</span>'); }} />
                        </a>
                    </div>

                    <button onClick={scrollToTop} className="p-2 rounded-full border border-[#E5E7EB] hover:bg-[#F7F7F7] hover:text-[#111111] transition-colors outline-none">
                        <ArrowUp size={16} />
                    </button>
                </div>
            </footer>
        </div>
    );
}