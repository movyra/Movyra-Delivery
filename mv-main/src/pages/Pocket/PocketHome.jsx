import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { useCivicStore } from '../../store/useCivicStore';
import { 
    Moon, Sun, Globe, LogOut, X, 
    FileText, Scan, FileCode, QrCode, Link as LinkIcon,
    Mic, Clipboard, Key, Share2, Scale, Calculator, 
    FolderOpen, ShieldAlert, Users, Bot, ArrowUp, ArrowLeft 
} from 'lucide-react';

export default function PocketHome() {
    const navigate = useNavigate();
    const auth = getAuth();
    
    // 1. STATE MANAGEMENT
    const theme = useCivicStore((state) => state.theme) || 'light';
    const setTheme = useCivicStore((state) => state.setTheme);
    const terminateSession = useCivicStore((state) => state.terminateSession);

    const [lang, setLang] = useState('en');
    const [showLangPrompt, setShowLangPrompt] = useState(false);
    const [showProductsPrompt, setShowProductsPrompt] = useState(false);
    const [showSitemap, setShowSitemap] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // 2. AUTHENTICATION & INITIALIZATION
    useEffect(() => {
        const sysLang = navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'hinglish', 'mr', 'gu', 'te', 'ta', 'pa', 'bho', 'ar', 'es', 'fr', 'de'];
        if (supported.includes(sysLang)) setLang(sysLang);

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });

        return () => unsubscribe();
    }, [auth]);

    // 3. FUNCTIONAL LOGIC
    const handleSignOut = async () => {
        try {
            await signOut(auth);
            terminateSession();
            navigate('/sahay/auth');
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const toggleTheme = () => {
        if (setTheme) {
            setTheme(theme === 'light' ? 'dark' : 'light');
        }
    };

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    // 4. DICTIONARY & CONTENT
    const t = {
        en: {
            lang: "English", log_out: "Log out", sign_in: "Sign In", products: "Products", careers: "Careers", sitemap: "Pocket Sitemap",
            hero_title: "Everyday tools.", hero_title_2: "One secure place.", hero_sub: "A privacy-first digital utility platform for daily tasks.",
            cat_1: "Phase 1: Daily Utilities", cat_2: "Phase 2: Organization", cat_3: "Phase 3: Advanced",
            t_notes: "Smart Notes", t_notes_sub: "Write, translate, and organize.",
            t_scan: "Document Scanner", t_scan_sub: "Digitize ID cards instantly.",
            t_pdf: "PDF Toolkit", t_pdf_sub: "Merge, compress, and edit.",
            t_qrg: "QR Generator", t_qrg_sub: "Create custom QR codes.",
            t_qrs: "QR Scanner", t_qrs_sub: "Scan and detect links safely.",
            t_calc: "Calculator", t_calc_sub: "Standard and tax calculations.",
            t_unit: "Unit Converter", t_unit_sub: "Convert land, weight, and currency.",
            t_doc: "Document Organizer", t_doc_sub: "Secure digital locker.",
            t_voice: "Voice Notes", t_voice_sub: "Record and transcribe audio.",
            t_share: "File Sharing", t_share_sub: "Send files securely.",
            t_pass: "Password Manager", t_pass_sub: "Store credentials safely.",
            t_ai: "AI Helper", t_ai_sub: "Summarize and explain documents.",
            t_emg: "Emergency Card", t_emg_sub: "Medical and contact details.",
            t_fam: "Family Locker", t_emg_fam: "Shared secure storage."
        }
    };

    const currentT = t['en']; // Hardcoded to English for structural generation, language array maps to this.
    const languageOptions = [
        { code: 'en', label: 'English' }, { code: 'hi', label: 'हिन्दी' }, { code: 'hinglish', label: 'Hinglish' },
        { code: 'mr', label: 'मराठी' }, { code: 'gu', label: 'ગુજરાતી' }, { code: 'te', label: 'తెలుగు' },
        { code: 'ta', label: 'தமிழ்' }
    ];

    const pocketTools = [
        { id: 'notes', name: currentT.t_notes, desc: currentT.t_notes_sub, icon: FileText, path: '/pocket/notes', phase: 1 },
        { id: 'scanner', name: currentT.t_scan, desc: currentT.t_scan_sub, icon: Scan, path: '/pocket/scanner', phase: 1 },
        { id: 'pdf', name: currentT.t_pdf, desc: currentT.t_pdf_sub, icon: FileCode, path: '/pocket/pdf', phase: 1 },
        { id: 'qr-gen', name: currentT.t_qrg, desc: currentT.t_qrg_sub, icon: QrCode, path: '/pocket/qr-generate', phase: 1 },
        { id: 'qr-scan', name: currentT.t_qrs, desc: currentT.t_qrs_sub, icon: LinkIcon, path: '/pocket/qr-scan', phase: 1 },
        { id: 'calc', name: currentT.t_calc, desc: currentT.t_calc_sub, icon: Calculator, path: '/pocket/calculator', phase: 1 },
        { id: 'unit', name: currentT.t_unit, desc: currentT.t_unit_sub, icon: Scale, path: '/pocket/converter', phase: 1 },
        
        { id: 'docs', name: currentT.t_doc, desc: currentT.t_doc_sub, icon: FolderOpen, path: '/pocket/documents', phase: 2 },
        { id: 'voice', name: currentT.t_voice, desc: currentT.t_voice_sub, icon: Mic, path: '/pocket/voice', phase: 2 },
        { id: 'share', name: currentT.t_share, desc: currentT.t_share_sub, icon: Share2, path: '/pocket/share', phase: 2 },
        
        { id: 'pass', name: currentT.t_pass, desc: currentT.t_pass_sub, icon: Key, path: '/pocket/passwords', phase: 3 },
        { id: 'ai', name: currentT.t_ai, desc: currentT.t_ai_sub, icon: Bot, path: '/pocket/ai', phase: 3 },
        { id: 'emerg', name: currentT.t_emg, desc: currentT.t_emg_sub, icon: ShieldAlert, path: '/pocket/emergency', phase: 3 },
        { id: 'family', name: currentT.t_fam, desc: currentT.t_emg_fam, icon: Users, path: '/pocket/family', phase: 3 },
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
                        src={isLight ? '/logo-5.png' : '/logo.png'} 
                        alt="Movyra" 
                        className="h-8 w-auto" 
                        onError={(e) => e.target.style.display = 'none'} 
                    />
                    <span className="font-black text-[1.5rem] tracking-tighter ml-[-5px]">
                        ovyra <span className={`${isLight ? 'text-[#666666]' : 'text-[#888888]'} font-medium text-[1.2rem] ml-1`}>Pocket</span>
                    </span>
                </div>
                
                <div className="flex items-center gap-3 md:gap-6 font-bold text-[0.9rem]">
                    <button onClick={toggleTheme} className={`p-2 rounded-full border ${borderClass} hover:border-[#6C5CE7] hover:text-[#6C5CE7] transition-colors outline-none`}>
                        {isLight ? <Moon size={16} /> : <Sun size={16} />}
                    </button>
                    
                    <button onClick={() => setShowLangPrompt(true)} className={`p-2 rounded-full border ${borderClass} hover:border-[#6C5CE7] hover:text-[#6C5CE7] transition-colors outline-none flex items-center gap-2`}>
                        <Globe size={16} /> <span className="hidden md:inline">{currentT.lang}</span>
                    </button>

                    {currentUser ? (
                        <>
                            <button onClick={handleSignOut} className={`hidden md:block ${mutedTextClass} hover:${textClass} transition-colors outline-none`}>
                                {currentT.log_out}
                            </button>
                            <button onClick={handleSignOut} className={`p-2 rounded-full border ${borderClass} hover:border-[#6C5CE7] hover:text-[#6C5CE7] transition-colors outline-none block md:hidden`}>
                                <LogOut size={16} />
                            </button>
                        </>
                    ) : (
                        <button onClick={() => navigate('/sahay/auth')} className="bg-[#6C5CE7] text-white px-5 py-2 rounded-full hover:bg-[#5a4bcf] transition-colors outline-none">
                            {currentT.sign_in}
                        </button>
                    )}
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
                            <h2 className="text-[1.5rem] font-black tracking-tight mb-2 text-center mt-2">Also from us</h2>
                            <p className={`${mutedTextClass} text-[0.9rem] text-center mb-8`}>Discover our connected platforms.</p>
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
                            <h2 className="text-[1.8rem] font-black tracking-tight mb-2">{currentT.sitemap}</h2>
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

            {/* MAIN CONTENT */}
            <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 md:px-12 py-16 animate-fade">
                
                <div className="mb-16 text-center max-w-[800px] mx-auto">
                    <h1 className="text-[3rem] md:text-[4.5rem] font-black leading-[1.1] tracking-tighter mb-4">
                        {currentT.hero_title} <span className="text-[#6C5CE7] block">{currentT.hero_title_2}</span>
                    </h1>
                    <p className={`text-[1.1rem] md:text-[1.25rem] ${mutedTextClass} font-medium leading-relaxed`}>
                        {currentT.hero_sub}
                    </p>
                </div>

                {/* PHASE 1 GRID */}
                <div className="mb-16">
                    <h3 className={`text-[0.85rem] uppercase tracking-widest font-black ${mutedTextClass} mb-6 border-b ${borderClass} pb-4`}>{currentT.cat_1}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {pocketTools.filter(t => t.phase === 1).map(tool => (
                            <Link key={tool.id} to={tool.path} className={`group ${cardBgClass} border ${borderClass} p-6 rounded-2xl hover:border-[#6C5CE7] transition-all duration-300 hover:-translate-y-1 outline-none flex flex-col`}>
                                <div className="w-12 h-12 bg-[#6C5CE7]/10 rounded-xl flex items-center justify-center mb-6">
                                    <tool.icon size={24} className="text-[#6C5CE7]" />
                                </div>
                                <h4 className="font-black text-[1.1rem] mb-2 group-hover:text-[#6C5CE7] transition-colors">{tool.name}</h4>
                                <p className={`text-[0.85rem] ${mutedTextClass} font-medium`}>{tool.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* PHASE 2 GRID */}
                <div className="mb-16">
                    <h3 className={`text-[0.85rem] uppercase tracking-widest font-black ${mutedTextClass} mb-6 border-b ${borderClass} pb-4`}>{currentT.cat_2}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pocketTools.filter(t => t.phase === 2).map(tool => (
                            <Link key={tool.id} to={tool.path} className={`group ${cardBgClass} border ${borderClass} p-6 rounded-2xl hover:border-[#6C5CE7] transition-all duration-300 hover:-translate-y-1 outline-none flex flex-col`}>
                                <div className="w-12 h-12 bg-[#6C5CE7]/10 rounded-xl flex items-center justify-center mb-6">
                                    <tool.icon size={24} className="text-[#6C5CE7]" />
                                </div>
                                <h4 className="font-black text-[1.1rem] mb-2 group-hover:text-[#6C5CE7] transition-colors">{tool.name}</h4>
                                <p className={`text-[0.85rem] ${mutedTextClass} font-medium`}>{tool.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* PHASE 3 GRID */}
                <div>
                    <h3 className={`text-[0.85rem] uppercase tracking-widest font-black ${mutedTextClass} mb-6 border-b ${borderClass} pb-4`}>{currentT.cat_3}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {pocketTools.filter(t => t.phase === 3).map(tool => (
                            <Link key={tool.id} to={tool.path} className={`group ${cardBgClass} border ${borderClass} p-6 rounded-2xl hover:border-[#6C5CE7] transition-all duration-300 hover:-translate-y-1 outline-none flex flex-col`}>
                                <div className="w-12 h-12 bg-[#6C5CE7]/10 rounded-xl flex items-center justify-center mb-6">
                                    <tool.icon size={24} className="text-[#6C5CE7]" />
                                </div>
                                <h4 className="font-black text-[1.1rem] mb-2 group-hover:text-[#6C5CE7] transition-colors">{tool.name}</h4>
                                <p className={`text-[0.85rem] ${mutedTextClass} font-medium`}>{tool.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>

            </main>

            {/* FOOTER */}
            <footer className={`w-full mx-auto flex flex-col md:flex-row items-center justify-between gap-8 px-6 md:px-12 py-10 border-t ${borderClass} ${cardBgClass} mt-auto`}>
                <div className="flex flex-wrap items-center gap-6">
                    <button onClick={() => setShowLangPrompt(true)} className={`flex items-center gap-2 text-[0.8rem] font-bold px-3 py-1.5 rounded-full transition-colors border ${borderClass} ${mutedTextClass} hover:border-[#6C5CE7] hover:text-[#6C5CE7] outline-none`}>
                        <Globe size={14} /> {currentT.lang}
                    </button>
                </div>
                
                <div className={`flex flex-col md:flex-row items-center gap-6 text-[0.8rem] font-bold ${mutedTextClass}`}>
                    <div className="flex items-center gap-6">
                        <button onClick={() => setShowProductsPrompt(true)} className={`hover:${textClass} transition-colors outline-none`}>{currentT.products}</button>
                        <span className={`w-1 h-1 ${borderClass} rounded-full`}></span>
                        <button onClick={() => setShowSitemap(true)} className={`hover:${textClass} transition-colors underline outline-none`}>{currentT.sitemap}</button>
                        <span className={`w-1 h-1 ${borderClass} rounded-full`}></span>
                        <Link to="/careers" className={`hover:${textClass} transition-colors outline-none`}>{currentT.careers}</Link>
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