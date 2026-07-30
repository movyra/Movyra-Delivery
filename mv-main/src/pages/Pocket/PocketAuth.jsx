import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signInWithPopup, 
    GoogleAuthProvider,
    onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { useCivicStore } from '../../store/useCivicStore';
import { 
    Moon, Sun, Globe, X, ArrowUp, ArrowLeft, ArrowRight,
    FileText, Scan, FileCode, QrCode, Link as LinkIcon,
    Mic, Key, Share2, Scale, Calculator, FolderOpen, 
    ShieldAlert, Users, Bot
} from 'lucide-react';

export default function PocketAuth() {
    const navigate = useNavigate();
    const googleProvider = new GoogleAuthProvider();
    
    // 1. STATE MANAGEMENT
    const theme = useCivicStore((state) => state.theme) || 'light';
    const setTheme = useCivicStore((state) => state.setTheme);

    const [lang, setLang] = useState('en');
    const [showLangPrompt, setShowLangPrompt] = useState(false);
    const [showProductsPrompt, setShowProductsPrompt] = useState(false);
    const [showSitemap, setShowSitemap] = useState(false);

    // Auth States
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // 2. INITIALIZATION
    useEffect(() => {
        const sysLang = navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'hinglish', 'mr', 'gu', 'te', 'ta', 'pa', 'bho', 'ar', 'es', 'fr', 'de'];
        if (supported.includes(sysLang)) setLang(sysLang);

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                navigate('/pocket');
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    // 3. FUNCTIONAL LOGIC
    const handleStandardAuth = async (e) => {
        e.preventDefault();
        setAuthError('');
        setIsLoading(true);
        try {
            if (isLoginMode) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
            navigate('/pocket');
        } catch (error) {
            setAuthError('Authentication failed. Please verify your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        setAuthError('');
        setIsLoading(true);
        try {
            await signInWithPopup(auth, googleProvider);
            navigate('/pocket');
        } catch (error) {
            setAuthError('Google verification failed. Please try again.');
            setIsLoading(false);
        }
    };

    const handleGuestAccess = () => {
        navigate('/pocket');
    };

    const toggleTheme = () => {
        if (setTheme) {
            setTheme(theme === 'light' ? 'dark' : 'light');
        }
    };

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    // 4. DICTIONARY & CONTENT
    const languageOptions = [
        { code: 'en', label: 'English' }, { code: 'hi', label: 'हिन्दी' }, { code: 'hinglish', label: 'Hinglish' },
        { code: 'mr', label: 'मराठी' }, { code: 'gu', label: 'ગુજરાતી' }, { code: 'te', label: 'తెలుగు' },
        { code: 'ta', label: 'தமிழ்' }
    ];

    const pocketTools = [
        { id: 'notes', name: 'Smart Notes', icon: FileText, path: '/pocket/notes' },
        { id: 'scanner', name: 'Document Scanner', icon: Scan, path: '/pocket/scanner' },
        { id: 'pdf', name: 'PDF Toolkit', icon: FileCode, path: '/pocket/pdf' },
        { id: 'qr-gen', name: 'QR Generator', icon: QrCode, path: '/pocket/qr-generate' },
        { id: 'qr-scan', name: 'QR Scanner', icon: LinkIcon, path: '/pocket/qr-scan' },
        { id: 'calc', name: 'Calculator', icon: Calculator, path: '/pocket/calculator' },
        { id: 'unit', name: 'Unit Converter', icon: Scale, path: '/pocket/converter' },
        { id: 'docs', name: 'Document Organizer', icon: FolderOpen, path: '/pocket/documents' },
        { id: 'voice', name: 'Voice Notes', icon: Mic, path: '/pocket/voice' },
        { id: 'share', name: 'File Sharing', icon: Share2, path: '/pocket/share' },
        { id: 'pass', name: 'Password Manager', icon: Key, path: '/pocket/passwords' },
        { id: 'ai', name: 'AI Helper', icon: Bot, path: '/pocket/ai' },
        { id: 'emerg', name: 'Emergency Card', icon: ShieldAlert, path: '/pocket/emergency' },
        { id: 'family', name: 'Family Locker', icon: Users, path: '/pocket/family' }
    ];

    // Theme mapping
    const isLight = theme === 'light';
    const bgClass = isLight ? 'bg-[#FFFFFF]' : 'bg-[#0a0a0a]';
    const textClass = isLight ? 'text-[#111111]' : 'text-[#FFFFFF]';
    const borderClass = isLight ? 'border-[#E5E7EB]' : 'border-[#333333]';
    const cardBgClass = isLight ? 'bg-[#F7F7F7]' : 'bg-[#111111]';
    const mutedTextClass = isLight ? 'text-[#555555]' : 'text-[#888888]';

    return (
        <div className={`min-h-screen font-sans overflow-x-hidden flex flex-col relative transition-colors duration-300 ${bgClass} ${textClass} selection:bg-[#6C5CE7] selection:text-white`}>
            
            <style>
                {`
                  @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                  .animate-fade { animation: fadeIn 0.8s ease-out forwards; }
                  html { scroll-behavior: smooth; }
                `}
            </style>

            {/* HEADER */}
            <header className={`w-full flex items-center justify-between px-6 md:px-12 py-6 animate-fade z-50 border-b ${borderClass} backdrop-blur-md sticky top-0 bg-transparent`}>
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/pocket')}>
                    <img 
                        src={theme === 'light' ? '/logo-5.png' : '/logo.png'} 
                        alt="Movyra" 
                        className="h-8 w-auto" 
                        onError={(e) => e.target.style.display = 'none'} 
                    />
                    <span className="font-black text-[1.5rem] tracking-tighter ml-[-5px]">
                        ovyra <span className={`${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'} font-medium text-[1.2rem] ml-1`}>Pocket</span>
                    </span>
                </div>
                
                <div className="flex items-center gap-3 md:gap-6 font-bold text-[0.9rem]">
                    <button onClick={toggleTheme} className={`p-2 rounded-full border ${borderClass} hover:border-[#6C5CE7] hover:text-[#6C5CE7] transition-colors outline-none`}>
                        {isLight ? <Moon size={16} /> : <Sun size={16} />}
                    </button>
                    
                    <button onClick={() => setShowLangPrompt(true)} className={`p-2 rounded-full border ${borderClass} hover:border-[#6C5CE7] hover:text-[#6C5CE7] transition-colors outline-none flex items-center gap-2`}>
                        <Globe size={16} /> <span className="hidden md:inline">Language</span>
                    </button>
                </div>
            </header>

            {/* MODALS */}
            <AnimatePresence>
                {/* Language Modal */}
                {showLangPrompt && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className={`w-full max-w-[400px] ${bgClass} rounded-3xl p-8 flex flex-col shadow-2xl relative border ${borderClass} max-h-[80vh] overflow-y-auto`}>
                            <button onClick={() => setShowLangPrompt(false)} className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center ${mutedTextClass} hover:${textClass} transition-colors outline-none`}><X size={18} /></button>
                            <h2 className="text-[1.4rem] font-black tracking-tight mb-6 text-center">Select Language</h2>
                            <div className="flex flex-col gap-2">
                                {languageOptions.map((option) => (
                                    <button key={option.code} onClick={() => { setLang(option.code); setShowLangPrompt(false); }} className={`w-full p-4 rounded-xl flex items-center justify-between transition-colors border outline-none ${lang === option.code ? 'bg-[#6C5CE7]/10 border-[#6C5CE7] text-[#6C5CE7]' : `${cardBgClass} ${borderClass} ${mutedTextClass} hover:border-[#6C5CE7] hover:text-[#6C5CE7]`}`}>
                                        <span className="font-bold text-[1rem]">{option.label}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Products Modal */}
                {showProductsPrompt && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className={`w-full max-w-[500px] ${bgClass} rounded-3xl p-8 flex flex-col shadow-2xl relative border ${borderClass}`}>
                            <button onClick={() => setShowProductsPrompt(false)} className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center ${mutedTextClass} hover:${textClass} transition-colors outline-none`}><X size={18} /></button>
                            <h2 className="text-[1.5rem] font-black tracking-tight mb-2 text-center mt-2">Connected Platforms</h2>
                            <p className={`${mutedTextClass} text-[0.9rem] text-center mb-8`}>Explore the Movyra ecosystem.</p>
                            <div className="flex flex-col gap-4">
                                <Link to="/civic" className={`group flex flex-col items-center gap-4 ${cardBgClass} border ${borderClass} p-6 rounded-2xl hover:border-[#00A9F7] transition-colors text-center w-full outline-none`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <img src={isLight ? '/logo-3.png' : '/logo.png'} alt="Movyra" className="h-6 w-auto" onError={(e) => e.target.style.display = 'none'} />
                                        <span className="font-black text-[1.2rem] tracking-tighter ml-[-5px]">ovyra <span className="text-[#888888] font-medium text-[1rem] ml-1">Civic</span></span>
                                    </div>
                                    <p className={`${mutedTextClass} text-[0.85rem] leading-relaxed group-hover:${textClass} transition-colors`}>Smart city management. Report issues easily.</p>
                                </Link>
                                <Link to="/sahay" className={`group flex flex-col items-center gap-4 ${cardBgClass} border ${borderClass} p-6 rounded-2xl hover:border-[#FF6B35] transition-colors text-center w-full outline-none`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <img src={isLight ? '/logo-4.png' : '/logo.png'} alt="Movyra" className="h-6 w-auto" onError={(e) => e.target.style.display = 'none'} />
                                        <span className="font-black text-[1.2rem] tracking-tighter ml-[-5px]">ovyra <span className="text-[#888888] font-medium text-[1rem] ml-1">Sahay</span></span>
                                    </div>
                                    <p className={`${mutedTextClass} text-[0.85rem] leading-relaxed group-hover:${textClass} transition-colors`}>Humanitarian rescue operations and support.</p>
                                </Link>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Sitemap Modal (Pocket Only) */}
                {showSitemap && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className={`w-full max-w-[600px] ${bgClass} rounded-3xl p-8 flex flex-col shadow-2xl relative border ${borderClass} max-h-[80vh] overflow-y-auto`}>
                            <button onClick={() => setShowSitemap(false)} className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center ${mutedTextClass} hover:${textClass} transition-colors outline-none`}><X size={18} /></button>
                            <h2 className="text-[1.8rem] font-black tracking-tight mb-2">Pocket Sitemap</h2>
                            <p className={`${mutedTextClass} font-medium mb-6`}>Direct navigation to utility tools.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {pocketTools.map(tool => (
                                    <Link key={tool.id} to={tool.path} onClick={() => setShowSitemap(false)} className={`p-4 ${cardBgClass} border ${borderClass} rounded-xl font-bold hover:border-[#6C5CE7] hover:text-[#6C5CE7] transition-colors flex items-center gap-3 outline-none`}>
                                        <tool.icon size={16} /> {tool.name}
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MAIN CONTENT - AUTH CARD */}
            <main className="flex-1 w-full flex items-center justify-center px-6 py-12 animate-fade">
                <div className={`w-full max-w-[450px] ${cardBgClass} border ${borderClass} rounded-3xl p-8 md:p-10 shadow-lg`}>
                    
                    <h1 className="text-[1.8rem] font-black tracking-tight mb-2 text-center">
                        {isLoginMode ? 'Secure Access' : 'Create Account'}
                    </h1>
                    <p className={`${mutedTextClass} text-[0.95rem] text-center mb-8 font-medium`}>
                        {isLoginMode ? 'Access your private digital toolkit.' : 'Start organizing your digital tools.'}
                    </p>

                    {authError && (
                        <div className="bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/20 p-4 rounded-xl text-[0.85rem] font-bold mb-6 text-center">
                            {authError}
                        </div>
                    )}

                    <form onSubmit={handleStandardAuth} className="flex flex-col gap-4 mb-6">
                        <input 
                            type="email" 
                            required 
                            placeholder="Email Address" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            className={`w-full ${bgClass} border ${borderClass} ${textClass} px-4 py-3.5 rounded-xl outline-none focus:border-[#6C5CE7] transition-colors text-[0.95rem] font-medium`} 
                        />
                        <input 
                            type="password" 
                            required 
                            placeholder="Password" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            className={`w-full ${bgClass} border ${borderClass} ${textClass} px-4 py-3.5 rounded-xl outline-none focus:border-[#6C5CE7] transition-colors text-[0.95rem] font-medium`} 
                        />
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-[#6C5CE7] text-white py-3.5 rounded-xl font-black mt-2 hover:bg-[#5a4bcf] transition-colors disabled:opacity-50 outline-none"
                        >
                            {isLoading ? 'Processing...' : isLoginMode ? 'Sign In' : 'Sign Up'}
                        </button>
                    </form>

                    <div className="flex items-center gap-4 mb-6">
                        <div className={`flex-1 h-px ${borderClass}`}></div>
                        <span className={`${mutedTextClass} text-[0.8rem] font-bold tracking-widest uppercase`}>OR</span>
                        <div className={`flex-1 h-px ${borderClass}`}></div>
                    </div>

                    <button 
                        onClick={handleGoogleAuth} 
                        disabled={isLoading}
                        className={`w-full ${bgClass} border ${borderClass} ${textClass} py-3.5 rounded-xl font-bold flex items-center justify-center gap-3 hover:border-[#6C5CE7] transition-colors mb-8 outline-none disabled:opacity-50`}
                    >
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Continue with Google
                    </button>

                    <div className="flex flex-col gap-4 text-center">
                        <button 
                            onClick={handleGuestAccess} 
                            className={`flex items-center justify-center gap-2 text-[0.95rem] font-bold ${mutedTextClass} hover:${textClass} transition-colors outline-none`}
                        >
                            Continue without signing in <ArrowRight size={16} />
                        </button>
                        
                        <p className={`${mutedTextClass} text-[0.85rem]`}>
                            {isLoginMode ? "Need an account? " : "Already registered? "}
                            <button onClick={() => setIsLoginMode(!isLoginMode)} className={`${textClass} font-bold hover:underline outline-none`}>
                                {isLoginMode ? 'Sign Up' : 'Sign In'}
                            </button>
                        </p>
                    </div>

                </div>
            </main>

            {/* FOOTER */}
            <footer className={`w-full mx-auto flex flex-col md:flex-row items-center justify-between gap-8 px-6 md:px-12 py-10 border-t ${borderClass} ${cardBgClass} mt-auto`}>
                <div className="flex flex-wrap items-center gap-6">
                    <button onClick={() => setShowLangPrompt(true)} className={`flex items-center gap-2 text-[0.8rem] font-bold px-3 py-1.5 rounded-full transition-colors border ${borderClass} ${mutedTextClass} hover:border-[#6C5CE7] hover:text-[#6C5CE7] outline-none`}>
                        <Globe size={14} /> Language
                    </button>
                </div>
                
                <div className={`flex flex-col md:flex-row items-center gap-6 text-[0.8rem] font-bold ${mutedTextClass}`}>
                    <div className="flex items-center gap-6">
                        <button onClick={() => setShowProductsPrompt(true)} className={`hover:${textClass} transition-colors outline-none`}>Products</button>
                        <span className={`w-1 h-1 ${borderClass} rounded-full`}></span>
                        <button onClick={() => setShowSitemap(true)} className={`hover:${textClass} transition-colors underline outline-none`}>Sitemap</button>
                        <span className={`w-1 h-1 ${borderClass} rounded-full`}></span>
                        <Link to="/careers" className={`hover:${textClass} transition-colors outline-none`}>Careers</Link>
                    </div>
                    <span className={`hidden md:block w-1 h-1 ${borderClass} rounded-full`}></span>
                    
                    <div className="flex items-center gap-2 text-[0.75rem] uppercase tracking-wider">
                        Built by 
                        <a href="https://rebrand.ly/aatns" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition-opacity outline-none">
                            <img src={isLight ? '/aat2.png' : '/aat.png'} alt="AnyAstro" className="h-4 w-auto object-contain" onError={(e) => { e.target.style.display = 'none'; e.target.insertAdjacentHTML('afterend', `<span class="underline ${textClass}">AnyAstro</span>`); }} />
                        </a>
                    </div>

                    <button onClick={scrollToTop} className={`p-2 rounded-full border ${borderClass} hover:border-[#6C5CE7] hover:text-[#6C5CE7] transition-colors outline-none`}>
                        <ArrowUp size={16} />
                    </button>
                </div>
            </footer>
        </div>
    );
}