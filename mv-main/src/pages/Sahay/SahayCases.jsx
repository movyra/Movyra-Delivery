import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, orderBy, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { useCivicStore } from '../../store/useCivicStore';
import { 
    Search, 
    Filter,
    ArrowLeft, 
    LogOut,
    X,
    Globe,
    ArrowUp,
    MapPin,
    AlertTriangle,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    Eye,
    Clock,
    ShieldCheck,
    Users
} from 'lucide-react';

export default function SahayCases() {
    const navigate = useNavigate();
    
    // 1. STATE MANAGEMENT
    const theme = useCivicStore((state) => state.theme) || 'light'; // Fallback to light for Sahay brand
    const terminateSession = useCivicStore((state) => state.terminateSession);

    const [lang, setLang] = useState('en');
    const [showLangPrompt, setShowLangPrompt] = useState(false);
    const [showProductsPrompt, setShowProductsPrompt] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    
    const [cases, setCases] = useState([]);
    const [filteredCases, setFilteredCases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [activeStatus, setActiveStatus] = useState('Active');
    
    const [expandedCaseId, setExpandedCaseId] = useState(null);
    const [confirmingId, setConfirmingId] = useState(null);

    // 2. AUTHENTICATION & DATA FETCHING
    useEffect(() => {
        const sysLang = navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'hinglish', 'mr', 'gu', 'te', 'ta', 'pa', 'bho', 'ar', 'es', 'fr', 'de'];
        if (supported.includes(sysLang)) setLang(sysLang);

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
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
                confirmedBy: doc.data().confirmedBy || []
            }));
            
            setCases(records);
            applyFilters(records, 'All', 'Active', '');
        } catch (error) {
            console.error("Failed to fetch cases:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // 3. FILTERING LOGIC
    const applyFilters = (data, category, status, queryText) => {
        let result = data;

        if (category !== 'All') {
            result = result.filter(c => c.category === category);
        }

        if (status === 'Active') {
            result = result.filter(c => c.status !== 'Closed');
        } else if (status === 'Resolved') {
            result = result.filter(c => c.status === 'Closed');
        }

        if (queryText.trim()) {
            const lowerQuery = queryText.toLowerCase();
            result = result.filter(c => 
                (c.address && c.address.toLowerCase().includes(lowerQuery)) || 
                (c.description && c.description.toLowerCase().includes(lowerQuery)) ||
                (c.category && c.category.toLowerCase().includes(lowerQuery))
            );
        }

        setFilteredCases(result);
    };

    useEffect(() => {
        applyFilters(cases, activeCategory, activeStatus, searchQuery);
    }, [searchQuery, activeCategory, activeStatus, cases]);

    // 4. FUNCTIONAL LOGIC
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

    const toggleTimeline = (id) => {
        setExpandedCaseId(expandedCaseId === id ? null : id);
    };

    const handleSawThisToo = async (e, caseId) => {
        e.stopPropagation();
        if (!currentUser || confirmingId === caseId) return;

        setConfirmingId(caseId);
        try {
            const caseRef = doc(db, 'sahay_cases', caseId);
            await updateDoc(caseRef, {
                confirmedBy: arrayUnion(currentUser.uid)
            });

            // Update local state to reflect change instantly
            const updatedCases = cases.map(c => {
                if (c.id === caseId) {
                    return { ...c, confirmedBy: [...c.confirmedBy, currentUser.uid] };
                }
                return c;
            });
            setCases(updatedCases);
        } catch (error) {
            console.error("Failed to confirm case:", error);
        } finally {
            setConfirmingId(null);
        }
    };

    const getTimelineStage = (status) => {
        const stages = ['Reported', 'Verified', 'Assigned', 'Closed'];
        const index = stages.indexOf(status);
        return index >= 0 ? index : 0;
    };

    // Color Helpers based on brand system
    const getSeverityBadge = (sev) => {
        if (sev === 'Critical') return 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]';
        if (sev === 'Urgent') return 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]';
        return 'bg-[#FF6B35]/10 text-[#FF6B35] border-[#FF6B35]';
    };

    // 5. 13-LANGUAGE DICTIONARY (Simple Consumer Context)
    const t = {
        en: {
            lang: "English", log_out: "Log out", careers: "Careers", products: "Products", back: "Back to Home",
            title: "Help Feed", sub: "See active help requests and confirm sightings in your area.",
            search_ph: "Search address or details...", filter_cat: "Category:", filter_stat: "Status:",
            stat_active: "Active", stat_res: "Resolved",
            cat_all: "All", cat_1: "Homeless", cat_2: "Elderly", cat_3: "Animal", cat_4: "Medical",
            btn_saw: "I Saw This Too", btn_confirmed: "Confirmed", loading: "Loading cases...",
            empty: "No cases found.", empty_sub: "Try changing your search or filters.",
            step1: "Reported", step1_desc: "Added to the system.",
            step2: "Verified", step2_desc: "Checking details.",
            step3: "Assigned", step3_desc: "Rescue team is on the way.",
            step4: "Resolved", step4_desc: "Help provided successfully."
        },
        hi: {
            lang: "हिन्दी", log_out: "लॉग आउट", careers: "करियर", products: "उत्पाद", back: "होम पर वापस जाएं",
            title: "सहायता फ़ीड", sub: "सक्रिय सहायता अनुरोध देखें और अपने क्षेत्र में पुष्टि करें।",
            search_ph: "पता या विवरण खोजें...", filter_cat: "श्रेणी:", filter_stat: "स्थिति:",
            stat_active: "सक्रिय", stat_res: "हल हो गया",
            cat_all: "सभी", cat_1: "बेघर", cat_2: "बुजुर्ग", cat_3: "जानवर", cat_4: "चिकित्सा",
            btn_saw: "मैंने भी इसे देखा", btn_confirmed: "पुष्टि की गई", loading: "मामले लोड हो रहे हैं...",
            empty: "कोई मामला नहीं मिला।", empty_sub: "अपनी खोज या फ़िल्टर बदलने का प्रयास करें।",
            step1: "रिपोर्ट किया गया", step1_desc: "सिस्टम में जोड़ा गया।",
            step2: "सत्यापित", step2_desc: "विवरण की जाँच की जा रही है।",
            step3: "सौंपा गया", step3_desc: "बचाव दल रास्ते में है।",
            step4: "हल हो गया", step4_desc: "सफलतापूर्वक मदद की गई।"
        },
        hinglish: {
            lang: "Hinglish", log_out: "Log out", careers: "Careers", products: "Products", back: "Home par wapas",
            title: "Help Feed", sub: "Active help requests dekhein aur confirm karein.",
            search_ph: "Address ya details search karein...", filter_cat: "Category:", filter_stat: "Status:",
            stat_active: "Active", stat_res: "Resolved",
            cat_all: "All", cat_1: "Homeless", cat_2: "Elderly", cat_3: "Animal", cat_4: "Medical",
            btn_saw: "Maine Bhi Dekha", btn_confirmed: "Confirmed", loading: "Cases load ho rahe hain...",
            empty: "Koi case nahi mila.", empty_sub: "Apne search ya filters change karein.",
            step1: "Reported", step1_desc: "System mein add kiya gaya.",
            step2: "Verified", step2_desc: "Details check ho rahi hain.",
            step3: "Assigned", step3_desc: "Rescue team raste mein hai.",
            step4: "Resolved", step4_desc: "Help provide kar di gayi hai."
        }
    };

    const currentT = t[lang] || t['en'];
    const languageOptions = [
        { code: 'en', label: 'English' }, { code: 'hi', label: 'हिन्दी' }, { code: 'hinglish', label: 'Hinglish' }
    ];

    const timelineSteps = [
        { title: currentT.step1, icon: Clock, desc: currentT.step1_desc },
        { title: currentT.step2, icon: Eye, desc: currentT.step2_desc },
        { title: currentT.step3, icon: ShieldCheck, desc: currentT.step3_desc },
        { title: currentT.step4, icon: CheckCircle, desc: currentT.step4_desc }
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

            <main className="flex-1 max-w-[1000px] w-full mx-auto px-6 md:px-12 py-12 animate-fade flex flex-col">
                
                <button onClick={() => navigate('/sahay')} className="flex items-center gap-2 mb-8 outline-none font-bold text-[0.9rem] text-[#555555] hover:text-[#111111] transition-colors self-start">
                    <ArrowLeft size={16} /> {currentT.back}
                </button>

                <div className="mb-10">
                    <h1 className="text-[2.5rem] md:text-[3.5rem] font-black leading-[1.1] tracking-tighter mb-4 text-[#111111]">
                        {currentT.title}
                    </h1>
                    <p className="text-[1.1rem] text-[#555555] font-medium">
                        {currentT.sub}
                    </p>
                </div>

                {/* Filters Section */}
                <div className="flex flex-col gap-6 mb-10">
                    <div className="relative">
                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555555]" />
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={currentT.search_ph}
                            className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#F7F7F7] border border-[#E5E7EB] text-[#111111] font-bold text-[0.95rem] outline-none focus:border-[#FF6B35] transition-colors"
                        />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="text-[#111111] font-black text-[0.9rem] flex items-center gap-2"><Filter size={16}/> {currentT.filter_cat}</span>
                            {[
                                { id: 'All', label: currentT.cat_all },
                                { id: 'Homeless', label: currentT.cat_1 },
                                { id: 'Elderly', label: currentT.cat_2 },
                                { id: 'Animal', label: currentT.cat_3 },
                                { id: 'Medical', label: currentT.cat_4 }
                            ].map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`px-4 py-2 rounded-full font-bold text-[0.85rem] transition-colors border outline-none ${
                                        activeCategory === cat.id ? 'bg-[#111111] text-[#FFFFFF] border-[#111111]' : 'bg-[#FFFFFF] text-[#555555] border-[#E5E7EB] hover:border-[#111111] hover:text-[#111111]'
                                    }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        <div className="hidden sm:block w-px h-8 bg-[#E5E7EB]"></div>

                        <div className="flex items-center gap-3">
                            <span className="text-[#111111] font-black text-[0.9rem]">{currentT.filter_stat}</span>
                            <button
                                onClick={() => setActiveStatus('Active')}
                                className={`px-4 py-2 rounded-full font-bold text-[0.85rem] transition-colors border outline-none ${
                                    activeStatus === 'Active' ? 'bg-[#FF6B35] text-[#FFFFFF] border-[#FF6B35]' : 'bg-[#FFFFFF] text-[#555555] border-[#E5E7EB] hover:border-[#FF6B35] hover:text-[#FF6B35]'
                                }`}
                            >
                                {currentT.stat_active}
                            </button>
                            <button
                                onClick={() => setActiveStatus('Resolved')}
                                className={`px-4 py-2 rounded-full font-bold text-[0.85rem] transition-colors border outline-none ${
                                    activeStatus === 'Resolved' ? 'bg-[#16A34A] text-[#FFFFFF] border-[#16A34A]' : 'bg-[#FFFFFF] text-[#555555] border-[#E5E7EB] hover:border-[#16A34A] hover:text-[#16A34A]'
                                }`}
                            >
                                {currentT.stat_res}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Case Feed */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-t-transparent border-[#FF6B35] rounded-full animate-spin mb-4"></div>
                        <span className="text-[0.9rem] font-bold text-[#555555]">{currentT.loading}</span>
                    </div>
                ) : filteredCases.length === 0 ? (
                    <div className="rounded-3xl p-12 text-center border border-dashed border-[#D1D5DB] bg-[#F7F7F7] flex flex-col items-center justify-center">
                        <AlertTriangle size={48} className="mb-6 text-[#D1D5DB]" />
                        <h2 className="text-[1.5rem] font-black tracking-tight mb-2 text-[#111111]">{currentT.empty}</h2>
                        <p className="text-[1rem] text-[#555555]">{currentT.empty_sub}</p>
                    </div>
                ) : (
                    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="flex flex-col gap-6">
                        {filteredCases.map((caseItem) => {
                            const dateString = caseItem.createdAt ? caseItem.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent';
                            const isExpanded = expandedCaseId === caseItem.id;
                            const hasConfirmed = currentUser && caseItem.confirmedBy.includes(currentUser.uid);
                            const confirmCount = caseItem.confirmedBy.length;
                            const isClosed = caseItem.status === 'Closed';

                            return (
                                <motion.div 
                                    variants={itemVariants} 
                                    key={caseItem.id} 
                                    className="rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] overflow-hidden hover:border-[#111111] transition-colors shadow-sm"
                                >
                                    <div 
                                        onClick={() => toggleTimeline(caseItem.id)}
                                        className="p-6 md:p-8 cursor-pointer flex flex-col md:flex-row md:items-start justify-between gap-6"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="px-3 py-1 bg-[#111111] text-[#FFFFFF] text-[0.75rem] font-black tracking-wider uppercase rounded-full">
                                                    {caseItem.category}
                                                </span>
                                                <span className={`px-3 py-1 text-[0.75rem] font-black tracking-wider uppercase rounded-full border ${getSeverityBadge(caseItem.severity)}`}>
                                                    {caseItem.severity}
                                                </span>
                                            </div>
                                            
                                            <h3 className="text-[1.1rem] font-medium text-[#111111] mb-4 line-clamp-2 leading-relaxed">
                                                {caseItem.description}
                                            </h3>

                                            <div className="flex items-center gap-4 text-[0.8rem] font-bold text-[#555555]">
                                                <span className="flex items-center gap-1"><MapPin size={14} className="text-[#00A9F7]" /> {caseItem.address.substring(0, 30)}...</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1"><Clock size={14} /> {dateString}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end justify-between gap-4 h-full">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center border border-[#E5E7EB] bg-[#F7F7F7] text-[#111111] self-end shrink-0">
                                                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                            </div>

                                            {/* Community Confirmation Button */}
                                            {!isClosed && (
                                                <button
                                                    onClick={(e) => handleSawThisToo(e, caseItem.id)}
                                                    disabled={hasConfirmed || confirmingId === caseItem.id}
                                                    className={`mt-4 md:mt-0 px-4 py-2 rounded-lg font-bold text-[0.85rem] flex items-center gap-2 transition-colors outline-none border ${
                                                        hasConfirmed 
                                                            ? 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A] cursor-not-allowed' 
                                                            : 'bg-[#FF6B35] text-[#FFFFFF] border-[#FF6B35] hover:bg-[#E85D2A]'
                                                    }`}
                                                >
                                                    {confirmingId === caseItem.id ? (
                                                        <div className="w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin"></div>
                                                    ) : hasConfirmed ? (
                                                        <CheckCircle size={14} />
                                                    ) : (
                                                        <Eye size={14} />
                                                    )}
                                                    {hasConfirmed ? currentT.btn_confirmed : currentT.btn_saw}
                                                    {confirmCount > 0 && <span className="ml-1 bg-current opacity-20 w-px h-3 inline-block"></span>}
                                                    {confirmCount > 0 && <span>{confirmCount}</span>}
                                                </button>
                                            )}
                                            {isClosed && (
                                                <div className="px-4 py-2 rounded-lg font-bold text-[0.85rem] bg-[#16A34A] text-[#FFFFFF] flex items-center gap-2 mt-4 md:mt-0">
                                                    <CheckCircle size={14} /> {currentT.stat_res}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Expandable Timeline Drawer */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t border-[#E5E7EB] bg-[#F7F7F7] overflow-hidden"
                                            >
                                                <div className="p-6 md:p-8">
                                                    <div className="relative">
                                                        <div className="absolute left-[19px] top-4 bottom-4 w-[2px] z-0 bg-[#D1D5DB]"></div>
                                                        
                                                        <div className="flex flex-col gap-8 relative z-10">
                                                            {timelineSteps.map((step, index) => {
                                                                const currentStage = getTimelineStage(caseItem.status);
                                                                const isCompleted = index <= currentStage;
                                                                const isCurrent = index === currentStage;
                                                                const StepIcon = step.icon;

                                                                return (
                                                                    <div key={index} className="flex gap-6">
                                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 ${
                                                                            isCompleted 
                                                                                ? 'bg-[#111111] border-[#111111] text-[#FFFFFF]'
                                                                                : 'bg-[#FFFFFF] border-[#D1D5DB] text-[#D1D5DB]'
                                                                        }`}>
                                                                            <StepIcon size={18} />
                                                                        </div>
                                                                        <div className="pt-1">
                                                                            <h4 className={`text-[1.05rem] font-black ${
                                                                                isCompleted ? 'text-[#111111]' : 'text-[#555555]'
                                                                            }`}>
                                                                                {step.title}
                                                                            </h4>
                                                                            <p className={`text-[0.9rem] mt-1 font-medium ${
                                                                                isCurrent ? 'text-[#FF6B35]' : 'text-[#555555]'
                                                                            }`}>
                                                                                {step.desc}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
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