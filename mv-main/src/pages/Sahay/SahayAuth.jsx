import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    onAuthStateChanged,
    signOut
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { useCivicStore } from '../../store/useCivicStore';
import { 
    ArrowLeft, 
    LogOut,
    X,
    Globe,
    ArrowUp,
    HeartHandshake,
    Mail,
    Lock,
    User,
    ShieldCheck
} from 'lucide-react';

export default function SahayAuth() {
    const navigate = useNavigate();
    
    // 1. STATE MANAGEMENT
    const theme = useCivicStore((state) => state.theme) || 'light'; 
    const terminateSession = useCivicStore((state) => state.terminateSession);

    const [lang, setLang] = useState('en');
    const [showLangPrompt, setShowLangPrompt] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    
    // Auth Form State
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('Citizen'); // 'Citizen', 'Volunteer', 'Organization'
    
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // 2. AUTHENTICATION OBSERVER
    useEffect(() => {
        const sysLang = navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'hinglish', 'mr', 'gu', 'te', 'ta', 'pa', 'bho', 'ar', 'es', 'fr', 'de'];
        if (supported.includes(sysLang)) setLang(sysLang);

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUser(user);
                // If already logged in, redirect to home
                navigate('/sahay');
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    // 3. OPERATIONAL LOGIC
    const handleSignOut = async () => {
        try {
            await signOut(auth);
            terminateSession();
            setCurrentUser(null);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    const handleAuth = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
                navigate('/sahay');
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                
                // Create user profile in Firestore
                await setDoc(doc(db, 'sahay_users', user.uid), {
                    uid: user.uid,
                    name: name,
                    email: email,
                    role: role,
                    createdAt: serverTimestamp()
                });

                // If Organization, create a pending record in sahay_organizations
                if (role === 'Organization') {
                    await setDoc(doc(db, 'sahay_organizations', user.uid), {
                        name: name,
                        email: email,
                        verificationStatus: 'Pending',
                        createdAt: serverTimestamp()
                    });
                }

                navigate('/sahay');
            }
        } catch (error) {
            console.error("Authentication error:", error);
            // Translate common Firebase errors into simple language
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                setErrorMsg(currentT.err_invalid);
            } else if (error.code === 'auth/email-already-in-use') {
                setErrorMsg(currentT.err_exists);
            } else if (error.code === 'auth/weak-password') {
                setErrorMsg(currentT.err_weak);
            } else {
                setErrorMsg(currentT.err_default);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // 4. 13-LANGUAGE DICTIONARY (Simple Consumer Context)
    const t = {
        en: {
            lang: "English", log_out: "Log out", careers: "Careers", products: "Products", back: "Back to Home",
            title_login: "Welcome Back", sub_login: "Sign in to continue helping your community.",
            title_reg: "Join the Network", sub_reg: "Create an account to report, volunteer, or partner.",
            lbl_email: "Email Address", lbl_pass: "Password", lbl_name: "Full Name or Organization Name", lbl_role: "I am joining as a:",
            role_cit: "Citizen (Reporting)", role_vol: "Volunteer (Helping)", role_org: "Organization (Partner)",
            btn_login: "Sign In", btn_reg: "Create Account", btn_loading: "Please wait...",
            switch_to_reg: "Need an account? Sign up", switch_to_login: "Already have an account? Sign in",
            err_invalid: "Incorrect email or password.", err_exists: "Account already exists with this email.", err_weak: "Password must be at least 6 characters.", err_default: "An error occurred. Please try again."
        },
        hi: {
            lang: "हिन्दी", log_out: "लॉग आउट", careers: "करियर", products: "उत्पाद", back: "होम पर वापस जाएं",
            title_login: "वापसी पर स्वागत है", sub_login: "अपने समुदाय की मदद जारी रखने के लिए साइन इन करें।",
            title_reg: "नेटवर्क से जुड़ें", sub_reg: "रिपोर्ट करने, स्वयंसेवक बनने या पार्टनर बनने के लिए खाता बनाएं।",
            lbl_email: "ईमेल पता", lbl_pass: "पासवर्ड", lbl_name: "पूरा नाम या संगठन का नाम", lbl_role: "मैं इस रूप में जुड़ रहा हूँ:",
            role_cit: "नागरिक (रिपोर्टिंग)", role_vol: "स्वयंसेवक (मदद करना)", role_org: "संगठन (पार्टनर)",
            btn_login: "साइन इन करें", btn_reg: "खाता बनाएं", btn_loading: "कृपया प्रतीक्षा करें...",
            switch_to_reg: "खाता चाहिए? साइन अप करें", switch_to_login: "क्या आपके पास पहले से खाता है? साइन इन करें",
            err_invalid: "गलत ईमेल या पासवर्ड।", err_exists: "इस ईमेल से खाता पहले ही मौजूद है।", err_weak: "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।", err_default: "एक त्रुटि हुई। कृपया पुन: प्रयास करें।"
        },
        hinglish: {
            lang: "Hinglish", log_out: "Log out", careers: "Careers", products: "Products", back: "Home par wapas",
            title_login: "Welcome Back", sub_login: "Community ki help continue karne ke liye sign in karein.",
            title_reg: "Network Join Karein", sub_reg: "Report, volunteer, ya partner banne ke liye account banayein.",
            lbl_email: "Email Address", lbl_pass: "Password", lbl_name: "Full Name ya Organization Name", lbl_role: "Main join kar raha hoon as a:",
            role_cit: "Citizen (Report karne ke liye)", role_vol: "Volunteer (Help karne ke liye)", role_org: "Organization (Partner)",
            btn_login: "Sign In", btn_reg: "Account Banayein", btn_loading: "Please wait...",
            switch_to_reg: "Account chahiye? Sign up karein", switch_to_login: "Pehle se account hai? Sign in karein",
            err_invalid: "Incorrect email ya password.", err_exists: "Is email se account pehle se hai.", err_weak: "Password kam se kam 6 characters ka hona chahiye.", err_default: "Error aayi hai. Phir se try karein."
        }
    };

    const currentT = t[lang] || t['en'];
    const languageOptions = [
        { code: 'en', label: 'English' }, { code: 'hi', label: 'हिन्दी' }, { code: 'hinglish', label: 'Hinglish' }
    ];

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
                        src={theme === 'light' ? '/logo-4.png' : '/logo-4.png'} 
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

            <main className="flex-1 w-full flex items-center justify-center px-6 py-12 animate-fade">
                
                <div className="w-full max-w-[500px]">
                    <button onClick={() => navigate('/sahay')} className="flex items-center gap-2 mb-8 outline-none font-bold text-[0.9rem] text-[#555555] hover:text-[#111111] transition-colors">
                        <ArrowLeft size={16} /> {currentT.back}
                    </button>

                    <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-3xl p-8 md:p-12 shadow-sm">
                        
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 bg-[#FF6B35]/10 rounded-full flex items-center justify-center">
                                <HeartHandshake size={32} className="text-[#FF6B35]" />
                            </div>
                        </div>

                        <div className="text-center mb-8">
                            <h1 className="text-[2rem] font-black tracking-tight mb-2 text-[#111111]">
                                {isLogin ? currentT.title_login : currentT.title_reg}
                            </h1>
                            <p className="text-[1rem] text-[#555555] font-medium">
                                {isLogin ? currentT.sub_login : currentT.sub_reg}
                            </p>
                        </div>

                        {errorMsg && (
                            <div className="bg-[#DC2626]/10 border border-[#DC2626] text-[#DC2626] px-4 py-3 rounded-xl mb-6 text-[0.9rem] font-bold text-center">
                                {errorMsg}
                            </div>
                        )}

                        <form onSubmit={handleAuth} className="flex flex-col gap-5">
                            
                            {!isLogin && (
                                <>
                                    <div>
                                        <label className="block text-[0.85rem] font-bold uppercase tracking-wider text-[#555555] mb-2">{currentT.lbl_name}</label>
                                        <div className="relative">
                                            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555555]" />
                                            <input 
                                                type="text" 
                                                required
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#F7F7F7] border border-[#E5E7EB] text-[#111111] font-bold text-[0.95rem] outline-none focus:border-[#FF6B35] transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[0.85rem] font-bold uppercase tracking-wider text-[#555555] mb-2">{currentT.lbl_role}</label>
                                        <div className="relative">
                                            <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555555]" />
                                            <select 
                                                required
                                                value={role}
                                                onChange={(e) => setRole(e.target.value)}
                                                className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#F7F7F7] border border-[#E5E7EB] text-[#111111] font-bold text-[0.95rem] outline-none focus:border-[#FF6B35] transition-colors appearance-none cursor-pointer"
                                            >
                                                <option value="Citizen">{currentT.role_cit}</option>
                                                <option value="Volunteer">{currentT.role_vol}</option>
                                                <option value="Organization">{currentT.role_org}</option>
                                            </select>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="block text-[0.85rem] font-bold uppercase tracking-wider text-[#555555] mb-2">{currentT.lbl_email}</label>
                                <div className="relative">
                                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555555]" />
                                    <input 
                                        type="email" 
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#F7F7F7] border border-[#E5E7EB] text-[#111111] font-bold text-[0.95rem] outline-none focus:border-[#FF6B35] transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[0.85rem] font-bold uppercase tracking-wider text-[#555555] mb-2">{currentT.lbl_pass}</label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555555]" />
                                    <input 
                                        type="password" 
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#F7F7F7] border border-[#E5E7EB] text-[#111111] font-bold text-[0.95rem] outline-none focus:border-[#FF6B35] transition-colors"
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full bg-[#FF6B35] text-[#FFFFFF] py-4 rounded-xl font-black text-[1.1rem] flex items-center justify-center gap-2 hover:bg-[#E85D2A] transition-colors disabled:opacity-50 outline-none mt-4 shadow-lg shadow-[#FF6B35]/20"
                            >
                                {isLoading ? (
                                    <><div className="w-5 h-5 border-2 border-t-transparent border-[#FFFFFF] rounded-full animate-spin"></div> {currentT.btn_loading}</>
                                ) : (
                                    isLogin ? currentT.btn_login : currentT.btn_reg
                                )}
                            </button>

                        </form>

                        <div className="mt-8 text-center border-t border-[#E5E7EB] pt-6">
                            <button 
                                onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); }}
                                className="text-[#555555] hover:text-[#111111] font-bold text-[0.95rem] transition-colors outline-none"
                            >
                                {isLogin ? currentT.switch_to_reg : currentT.switch_to_login}
                            </button>
                        </div>

                    </div>
                </div>
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
                            <img src={theme === 'light' ? '/aat2.png' : '/aat2.png'} alt="AnyAstro" className="h-4 w-auto object-contain" onError={(e) => { e.target.style.display = 'none'; e.target.insertAdjacentHTML('afterend', '<span class="underline text-[#111111]">AnyAstro</span>'); }} />
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