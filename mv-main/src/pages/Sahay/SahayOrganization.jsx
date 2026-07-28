import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, orderBy, getDocs, doc, updateDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { useCivicStore } from '../../store/useCivicStore';
import { 
    ArrowLeft, 
    LogOut,
    X,
    Globe,
    ArrowUp,
    MapPin,
    AlertTriangle,
    CheckCircle,
    Building,
    ClipboardEdit,
    Send,
    Users,
    Clock
} from 'lucide-react';

export default function SahayOrganization() {
    const navigate = useNavigate();
    
    // 1. STATE MANAGEMENT
    const theme = useCivicStore((state) => state.theme) || 'light'; 
    const terminateSession = useCivicStore((state) => state.terminateSession);

    const [lang, setLang] = useState('en');
    const [showLangPrompt, setShowLangPrompt] = useState(false);
    const [showProductsPrompt, setShowProductsPrompt] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    
    const [cases, setCases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('New'); // 'New' or 'Active'
    
    const [noteText, setNoteText] = useState('');
    const [activeNoteCaseId, setActiveNoteCaseId] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    // 2. AUTHENTICATION & DATA FETCHING
    useEffect(() => {
        const sysLang = navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'hinglish', 'mr', 'gu', 'te', 'ta', 'pa', 'bho', 'ar', 'es', 'fr', 'de'];
        if (supported.includes(sysLang)) setLang(sysLang);

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // In a real app, verify user role == 'NGO/Hospital' here before allowing access
                setCurrentUser(user);
                fetchCases();
            } else {
                navigate('/sahay/auth');
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const fetchCases = async () => {
        setIsLoading(true);
        try {
            const casesRef = collection(db, 'sahay_cases');
            const q = query(casesRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            
            const records = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                privateNotes: doc.data().privateNotes || []
            }));
            
            setCases(records);
        } catch (error) {
            console.error("Failed to fetch cases:", error);
        } finally {
            setIsLoading(false);
        }
    };

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

    const handleClaimCase = async (caseId) => {
        setIsUpdating(true);
        try {
            const caseRef = doc(db, 'sahay_cases', caseId);
            await updateDoc(caseRef, {
                status: 'Assigned',
                assignedToId: currentUser.uid,
                assignedAt: serverTimestamp()
            });

            // Update local state instantly
            setCases(cases.map(c => c.id === caseId ? { ...c, status: 'Assigned', assignedToId: currentUser.uid } : c));
        } catch (error) {
            console.error("Failed to claim case:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleResolveCase = async (caseId) => {
        setIsUpdating(true);
        try {
            const caseRef = doc(db, 'sahay_cases', caseId);
            await updateDoc(caseRef, {
                status: 'Closed',
                closedAt: serverTimestamp()
            });

            setCases(cases.map(c => c.id === caseId ? { ...c, status: 'Closed' } : c));
        } catch (error) {
            console.error("Failed to resolve case:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleAddNote = async (e, caseId) => {
        e.preventDefault();
        if (!noteText.trim()) return;
        setIsUpdating(true);
        
        try {
            const newNote = {
                text: noteText,
                authorId: currentUser.uid,
                timestamp: new Date().toISOString()
            };

            const caseRef = doc(db, 'sahay_cases', caseId);
            await updateDoc(caseRef, {
                privateNotes: arrayUnion(newNote)
            });

            setCases(cases.map(c => {
                if (c.id === caseId) {
                    return { ...c, privateNotes: [...c.privateNotes, newNote] };
                }
                return c;
            }));
            
            setNoteText('');
            setActiveNoteCaseId(null);
        } catch (error) {
            console.error("Failed to add note:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    // Filtered Views
    const newCases = cases.filter(c => c.status === 'Reported' || c.status === 'Verified');
    const activeOperations = cases.filter(c => (c.status === 'Assigned' || c.status === 'In Progress') && c.assignedToId === currentUser?.uid);

    const displayCases = activeTab === 'New' ? newCases : activeOperations;

    // Color Helpers based on brand system
    const getSeverityBadge = (sev) => {
        if (sev === 'Critical') return 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]';
        if (sev === 'Urgent') return 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]';
        return 'bg-[#FF6B35]/10 text-[#FF6B35] border-[#FF6B35]';
    };

    // 4. 13-LANGUAGE DICTIONARY (Simple Partner Context)
    const t = {
        en: {
            lang: "English", log_out: "Log out", careers: "Careers", products: "Products", back: "Back to Home",
            title: "Partner Dashboard", sub: "Manage active rescues, dispatch help, and log operational notes.",
            tab_new: "New Requests", tab_active: "My Operations",
            btn_claim: "Accept Case", btn_resolve: "Mark as Resolved", btn_note: "Add Note", btn_cancel: "Cancel",
            lbl_desc: "Description", lbl_note_ph: "Type a private medical or rescue note...", loading: "Loading dashboard...",
            empty_new: "No new requests.", empty_active: "You have no active operations.",
            succ: "Success"
        },
        hi: {
            lang: "हिन्दी", log_out: "लॉग आउट", careers: "करियर", products: "उत्पाद", back: "होम पर वापस जाएं",
            title: "पार्टनर डैशबोर्ड", sub: "सक्रिय बचाव का प्रबंधन करें, सहायता भेजें, और नोट्स लॉग करें।",
            tab_new: "नए अनुरोध", tab_active: "मेरे ऑपरेशंस",
            btn_claim: "केस स्वीकार करें", btn_resolve: "हल के रूप में चिह्नित करें", btn_note: "नोट जोड़ें", btn_cancel: "रद्द करें",
            lbl_desc: "विवरण", lbl_note_ph: "एक निजी चिकित्सा या बचाव नोट टाइप करें...", loading: "डैशबोर्ड लोड हो रहा है...",
            empty_new: "कोई नया अनुरोध नहीं।", empty_active: "आपके पास कोई सक्रिय ऑपरेशन नहीं है।",
            succ: "सफलता"
        },
        hinglish: {
            lang: "Hinglish", log_out: "Log out", careers: "Careers", products: "Products", back: "Home par wapas",
            title: "Partner Dashboard", sub: "Active rescues manage karein, help bhejein, aur notes log karein.",
            tab_new: "New Requests", tab_active: "My Operations",
            btn_claim: "Case Accept Karein", btn_resolve: "Resolved Mark Karein", btn_note: "Note Add Karein", btn_cancel: "Cancel",
            lbl_desc: "Details", lbl_note_ph: "Ek private medical ya rescue note type karein...", loading: "Dashboard load ho raha hai...",
            empty_new: "Koi nayi request nahi.", empty_active: "Aapke paas koi active operation nahi hai.",
            succ: "Success"
        }
    };

    const currentT = t[lang] || t['en'];
    const languageOptions = [
        { code: 'en', label: 'English' }, { code: 'hi', label: 'हिन्दी' }, { code: 'hinglish', label: 'Hinglish' }
    ];

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };

    return (
        <div className="min-h-screen font-sans overflow-x-hidden flex flex-col relative bg-[#FFFFFF] text-[#111111] selection:bg-[#16A34A] selection:text-white">
            
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
                                        className={`w-full p-4 rounded-xl flex items-center justify-between transition-colors border outline-none ${lang === option.code ? 'bg-[#16A34A]/10 border-[#16A34A] text-[#16A34A]' : 'bg-[#F7F7F7] border-[#E5E7EB] text-[#555555] hover:border-[#111111] hover:text-[#111111]'}`}
                                    >
                                        <span className="font-bold text-[1rem]">{option.label}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="flex-1 max-w-[1000px] w-full mx-auto px-6 md:px-12 py-12 animate-fade flex flex-col">
                
                <button onClick={() => navigate('/sahay')} className="flex items-center gap-2 mb-8 outline-none font-bold text-[0.9rem] text-[#555555] hover:text-[#111111] transition-colors self-start">
                    <ArrowLeft size={16} /> {currentT.back}
                </button>

                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-4 text-[#16A34A]">
                        <Building size={28} />
                    </div>
                    <h1 className="text-[2.5rem] md:text-[3.5rem] font-black leading-[1.1] tracking-tighter mb-4 text-[#111111]">
                        {currentT.title}
                    </h1>
                    <p className="text-[1.1rem] text-[#555555] font-medium">
                        {currentT.sub}
                    </p>
                </div>

                {/* Dashboard Tabs */}
                <div className="flex gap-4 mb-8 border-b border-[#E5E7EB]">
                    <button 
                        onClick={() => setActiveTab('New')}
                        className={`pb-4 px-2 font-black text-[1.1rem] outline-none transition-colors relative ${activeTab === 'New' ? 'text-[#111111]' : 'text-[#555555] hover:text-[#111111]'}`}
                    >
                        {currentT.tab_new}
                        {activeTab === 'New' && <motion.div layoutId="tabIndicator" className="absolute bottom-0 left-0 right-0 h-1 bg-[#111111]" />}
                    </button>
                    <button 
                        onClick={() => setActiveTab('Active')}
                        className={`pb-4 px-2 font-black text-[1.1rem] outline-none transition-colors relative ${activeTab === 'Active' ? 'text-[#111111]' : 'text-[#555555] hover:text-[#111111]'}`}
                    >
                        {currentT.tab_active}
                        {activeTab === 'Active' && <motion.div layoutId="tabIndicator" className="absolute bottom-0 left-0 right-0 h-1 bg-[#111111]" />}
                    </button>
                </div>

                {/* Dashboard Feed */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-t-transparent border-[#16A34A] rounded-full animate-spin mb-4"></div>
                        <span className="text-[0.9rem] font-bold text-[#555555]">{currentT.loading}</span>
                    </div>
                ) : displayCases.length === 0 ? (
                    <div className="rounded-3xl p-12 text-center border border-dashed border-[#D1D5DB] bg-[#F7F7F7] flex flex-col items-center justify-center">
                        <CheckCircle size={48} className="mb-6 text-[#D1D5DB]" />
                        <h2 className="text-[1.5rem] font-black tracking-tight mb-2 text-[#111111]">
                            {activeTab === 'New' ? currentT.empty_new : currentT.empty_active}
                        </h2>
                    </div>
                ) : (
                    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="flex flex-col gap-6">
                        {displayCases.map((caseItem) => {
                            const dateString = caseItem.createdAt ? caseItem.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent';
                            const confirmCount = caseItem.confirmedBy ? caseItem.confirmedBy.length : 0;
                            const isNoteOpen = activeNoteCaseId === caseItem.id;

                            return (
                                <motion.div 
                                    variants={itemVariants} 
                                    key={caseItem.id} 
                                    className="rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] overflow-hidden shadow-sm"
                                >
                                    <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between gap-8">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-4">
                                                <span className="px-3 py-1 bg-[#111111] text-[#FFFFFF] text-[0.75rem] font-black tracking-wider uppercase rounded-full">
                                                    {caseItem.category}
                                                </span>
                                                <span className={`px-3 py-1 text-[0.75rem] font-black tracking-wider uppercase rounded-full border ${getSeverityBadge(caseItem.severity)}`}>
                                                    {caseItem.severity}
                                                </span>
                                                {confirmCount > 0 && (
                                                    <span className="px-3 py-1 bg-[#F7F7F7] text-[#555555] border border-[#E5E7EB] text-[0.75rem] font-bold rounded-full flex items-center gap-1">
                                                        <Users size={12}/> {confirmCount} confirms
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <p className="text-[1rem] font-medium text-[#111111] mb-6 leading-relaxed bg-[#F7F7F7] p-4 rounded-xl border border-[#E5E7EB]">
                                                {caseItem.description}
                                            </p>

                                            <div className="flex flex-col gap-2 text-[0.85rem] font-bold text-[#555555]">
                                                <span className="flex items-center gap-2"><MapPin size={16} className="text-[#00A9F7]" /> {caseItem.address}</span>
                                                <span className="flex items-center gap-2"><Clock size={16} className="text-[#555555]" /> Reported: {dateString}</span>
                                            </div>

                                            {/* Private Notes Section (Visible only in Active Tab) */}
                                            {activeTab === 'Active' && caseItem.privateNotes.length > 0 && (
                                                <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
                                                    <h4 className="text-[0.8rem] font-bold uppercase tracking-wider text-[#555555] mb-3">Internal Notes</h4>
                                                    <div className="flex flex-col gap-3">
                                                        {caseItem.privateNotes.map((note, idx) => (
                                                            <div key={idx} className="bg-[#F59E0B]/5 border border-[#F59E0B]/20 p-3 rounded-lg text-[0.9rem] text-[#111111]">
                                                                {note.text}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col items-end gap-3 min-w-[180px]">
                                            {activeTab === 'New' ? (
                                                <button
                                                    onClick={() => handleClaimCase(caseItem.id)}
                                                    disabled={isUpdating}
                                                    className="w-full bg-[#111111] text-[#FFFFFF] px-6 py-3 rounded-xl font-bold text-[0.95rem] hover:bg-[#333333] transition-colors outline-none disabled:opacity-50"
                                                >
                                                    {currentT.btn_claim}
                                                </button>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleResolveCase(caseItem.id)}
                                                        disabled={isUpdating}
                                                        className="w-full bg-[#16A34A] text-[#FFFFFF] px-6 py-3 rounded-xl font-bold text-[0.95rem] flex items-center justify-center gap-2 hover:bg-[#15803D] transition-colors outline-none disabled:opacity-50"
                                                    >
                                                        <CheckCircle size={16} /> {currentT.btn_resolve}
                                                    </button>
                                                    
                                                    {!isNoteOpen && (
                                                        <button
                                                            onClick={() => setActiveNoteCaseId(caseItem.id)}
                                                            className="w-full bg-[#FFFFFF] text-[#111111] border border-[#E5E7EB] px-6 py-3 rounded-xl font-bold text-[0.95rem] flex items-center justify-center gap-2 hover:border-[#111111] transition-colors outline-none"
                                                        >
                                                            <ClipboardEdit size={16} /> {currentT.btn_note}
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Note Input Drawer */}
                                    <AnimatePresence>
                                        {isNoteOpen && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t border-[#E5E7EB] bg-[#F7F7F7]"
                                            >
                                                <form onSubmit={(e) => handleAddNote(e, caseItem.id)} className="p-6 md:p-8 flex flex-col gap-4">
                                                    <textarea 
                                                        autoFocus
                                                        required
                                                        rows="3"
                                                        placeholder={currentT.lbl_note_ph}
                                                        value={noteText}
                                                        onChange={(e) => setNoteText(e.target.value)}
                                                        className="w-full p-4 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] text-[#111111] font-medium text-[0.95rem] outline-none focus:border-[#111111] transition-colors resize-none"
                                                    ></textarea>
                                                    <div className="flex items-center justify-end gap-3">
                                                        <button 
                                                            type="button"
                                                            onClick={() => { setActiveNoteCaseId(null); setNoteText(''); }}
                                                            className="px-6 py-2.5 rounded-xl font-bold text-[0.9rem] text-[#555555] hover:bg-[#E5E7EB] transition-colors outline-none"
                                                        >
                                                            {currentT.btn_cancel}
                                                        </button>
                                                        <button 
                                                            type="submit"
                                                            disabled={isUpdating || !noteText.trim()}
                                                            className="bg-[#111111] text-[#FFFFFF] px-6 py-2.5 rounded-xl font-bold text-[0.9rem] flex items-center gap-2 hover:bg-[#333333] transition-colors disabled:opacity-50 outline-none"
                                                        >
                                                            <Send size={14} /> {currentT.btn_note}
                                                        </button>
                                                    </div>
                                                </form>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
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