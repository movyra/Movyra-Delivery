import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, orderBy, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { useCivicStore } from '../../store/useCivicStore';
import { acceptSahayTask, getCaseTimeline } from '../../services/sahayService';
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
    Users,
    MessageSquare
} from 'lucide-react';

export default function SahayCases() {
    const navigate = useNavigate();
    
    // 1. STATE MANAGEMENT
    const theme = useCivicStore((state) => state.theme) || 'light'; 
    const terminateSession = useCivicStore((state) => state.terminateSession);

    const [lang, setLang] = useState('en');
    const [showLangPrompt, setShowLangPrompt] = useState(false);
    const [showSitemap, setShowSitemap] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    
    const [cases, setCases] = useState([]);
    const [filteredCases, setFilteredCases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [activeTab, setActiveTab] = useState('Open'); // 'Open' or 'Accepted'
    
    const [expandedCaseId, setExpandedCaseId] = useState(null);
    const [confirmingId, setConfirmingId] = useState(null);
    const [timelineData, setTimelineData] = useState({});

    // 2. AUTHENTICATION & DATA FETCHING
    useEffect(() => {
        const sysLang = navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'hinglish', 'mr', 'gu', 'te', 'ta', 'pa', 'bho', 'ar', 'es', 'fr', 'de'];
        if (supported.includes(sysLang)) setLang(sysLang);

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            fetchCases(); // Fetch cases whether logged in or not
        });

        return () => unsubscribe();
    }, [navigate]);

    const fetchCases = async () => {
        setIsLoading(true);
        try {
            const casesRef = collection(db, 'sahay_cases');
            const q = query(casesRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);

            const testKeywords = ['test', 'testing', 'testcodecfg@gmail.com'];
            const containsTestKeyword = (str) => {
                if (!str) return false;
                const lowerStr = str.toLowerCase();
                return testKeywords.some(kw => lowerStr.includes(kw));
            };
            
            const records = snapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    confirmedBy: doc.data().confirmedBy || []
                }))
                .filter(record => {
                    if (containsTestKeyword(record.description) ||
                        containsTestKeyword(record.address) ||
                        containsTestKeyword(record.category) ||
                        containsTestKeyword(record.assignedToName)) {
                        return false;
                    }
                    return true;
                });
            
            setCases(records);
            applyFilters(records, 'All', 'Open', '');
        } catch (error) {
            console.error("Failed to fetch cases:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTimelineForCase = async (caseId) => {
        if (timelineData[caseId]) return; // Already fetched
        let updates = await getCaseTimeline(caseId);

        const testKeywords = ['test', 'testing', 'testcodecfg@gmail.com'];
        const containsTestKeyword = (str) => {
            if (!str) return false;
            const lowerStr = str.toLowerCase();
            return testKeywords.some(kw => lowerStr.includes(kw));
        };

        updates = updates.filter(update => {
            if (containsTestKeyword(update.message) || containsTestKeyword(update.userName)) {
                return false;
            }
            return true;
        });

        setTimelineData(prev => ({ ...prev, [caseId]: updates }));
    };

    // 3. FILTERING LOGIC
    const applyFilters = (data, category, tab, queryText) => {
        let result = data;

        if (category !== 'All') {
            result = result.filter(c => c.category === category);
        }

        if (tab === 'Open') {
            result = result.filter(c => c.status === 'Reported' || c.status === 'Verified');
        } else if (tab === 'Accepted') {
            result = result.filter(c => c.status === 'Assigned' || c.status === 'In Progress' || c.status === 'Closed');
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
        applyFilters(cases, activeCategory, activeTab, searchQuery);
    }, [searchQuery, activeCategory, activeTab, cases]);

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

    const toggleTimeline = (id, status) => {
        const isCurrentlyExpanded = expandedCaseId === id;
        setExpandedCaseId(isCurrentlyExpanded ? null : id);
        
        // Fetch timeline if expanding an assigned/closed case
        if (!isCurrentlyExpanded && (status === 'Assigned' || status === 'In Progress' || status === 'Closed')) {
            fetchTimelineForCase(id);
        }
    };

    const handleSawThisToo = async (e, caseId) => {
        e.stopPropagation();
        if (!currentUser) {
            alert(currentT.login_req);
            navigate('/sahay/auth');
            return;
        }
        if (confirmingId === caseId) return;

        setConfirmingId(caseId);
        try {
            const caseRef = doc(db, 'sahay_cases', caseId);
            await updateDoc(caseRef, {
                confirmedBy: arrayUnion(currentUser.uid)
            });

            const updatedCases = cases.map(c => {
                if (c.id === caseId) return { ...c, confirmedBy: [...c.confirmedBy, currentUser.uid] };
                return c;
            });
            setCases(updatedCases);
        } catch (error) {
            console.error("Failed to confirm case:", error);
        } finally {
            setConfirmingId(null);
        }
    };

    const handleAcceptTask = async (e, caseId) => {
        e.stopPropagation();
        if (!currentUser) {
            alert(currentT.login_req);
            navigate('/sahay/auth');
            return;
        }
        
        if (window.confirm("Are you sure you want to accept this task and take responsibility for updating its status?")) {
            setConfirmingId(caseId);
            try {
                // Determine user display name (fallback to email or "Volunteer")
                const userName = currentUser.displayName || currentUser.email || 'Volunteer';
                await acceptSahayTask(caseId, currentUser.uid, userName);
                
                // Update local state instantly
                const updatedCases = cases.map(c => {
                    if (c.id === caseId) return { ...c, status: 'Assigned', assignedToId: currentUser.uid, assignedToName: userName };
                    return c;
                });
                setCases(updatedCases);
                alert("Task Accepted. Please provide updates in the Accepted tab.");
            } catch (error) {
                console.error("Acceptance failed:", error);
                alert("Error accepting task.");
            } finally {
                setConfirmingId(null);
            }
        }
    };

    const getTimelineStage = (status) => {
        const stages = ['Reported', 'Verified', 'Assigned', 'Closed'];
        const index = stages.indexOf(status);
        return index >= 0 ? index : 0;
    };

    const getSeverityBadge = (sev) => {
        if (sev === 'Critical') return 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]';
        if (sev === 'Urgent') return 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]';
        return 'bg-[#FF6B35]/10 text-[#FF6B35] border-[#FF6B35]';
    };

    // 5. 13-LANGUAGE DICTIONARY (Simple Consumer Context)
    const t = {
        en: {
            lang: "English", log_out: "Log out", careers: "Careers", back: "Back to Home", sitemap: "Sitemap", sitemap_desc: "Direct navigation to all Sahay modules.",
            title: "Help Feed", sub: "See active help requests and track accepted rescue operations.",
            search_ph: "Search address or details...", filter_cat: "Category:", filter_stat: "View:",
            tab_open: "Open Cases", tab_acc: "Accepted / Past",
            cat_all: "All", cat_1: "Homeless", cat_2: "Elderly", cat_3: "Animal", cat_4: "Medical",
            btn_saw: "I Saw This Too", btn_confirmed: "Confirmed", btn_accept: "Accept Task", loading: "Loading cases...",
            empty: "No cases found.", empty_sub: "Try changing your search or filters.", login_req: "Please sign in to perform this action.",
            step1: "Reported", step1_desc: "Added to the system.",
            step2: "Verified", step2_desc: "Details check processing.",
            step3: "Assigned", step3_desc: "Rescue team is on the way.",
            step4: "Resolved", step4_desc: "Help provided successfully.",
            lbl_assigned: "Accepted By", updates: "Public Updates", no_updates: "No updates posted yet.",
            sm_home: "Home Gateway", sm_report: "Submit Report", sm_cases: "Public Feed", sm_map: "Live Map", sm_org: "Partner Dashboard", sm_vol: "Volunteer Portal", sm_imp: "Impact Analytics", sm_emg: "Emergency Directory", sm_cont: "Contact & Inquiries", sm_abt: "About Mission", sm_auth: "Authentication", sm_adm: "Admin Console"
        }
    };

    const currentT = t['en']; // Using English strictly as requested to maintain simplicity, easily expandable via lang state
    const languageOptions = [
        { code: 'en', label: 'English' }, { code: 'hi', label: 'हिन्दी' }, { code: 'hinglish', label: 'Hinglish' },
        { code: 'mr', label: 'मराठी' }, { code: 'gu', label: 'ગુજરાતી' }, { code: 'te', label: 'తెలుగు' },
        { code: 'ta', label: 'தமிழ்' }, { code: 'pa', label: 'ਪੰਜਾਬੀ' }, { code: 'bho', label: 'भोजपुरी' },
        { code: 'ar', label: 'العربية' }, { code: 'es', label: 'Español' }, { code: 'fr', label: 'Français' },
        { code: 'de', label: 'Deutsch' }
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
                    {currentUser ? (
                        <>
                            <button onClick={handleSignOut} className="text-[#555555] hover:text-[#111111] transition-colors outline-none hidden sm:block">
                                {currentT.log_out}
                            </button>
                            <button onClick={handleSignOut} className="p-2 rounded-full bg-[#F7F7F7] text-[#111111] hover:bg-[#E5E7EB] transition-colors outline-none block sm:hidden">
                                <LogOut size={16} />
                            </button>
                        </>
                    ) : (
                        <button onClick={() => navigate('/sahay/auth')} className="bg-[#111111] text-[#FFFFFF] px-4 py-2 rounded-full font-bold hover:bg-[#555555] transition-colors outline-none">
                            Sign In
                        </button>
                    )}
                </div>
            </header>

            {/* SITEMAP MODAL */}
            <AnimatePresence>
                {showSitemap && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] bg-[#111111]/90 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-[600px] bg-[#FFFFFF] rounded-3xl p-8 flex flex-col shadow-2xl relative border border-[#E5E7EB] max-h-[80vh] overflow-y-auto"
                        >
                            <button onClick={() => setShowSitemap(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[#555555] hover:text-[#111111] transition-colors outline-none">
                                <X size={18} />
                            </button>
                            <h2 className="text-[1.8rem] font-black tracking-tight mb-2 text-[#111111]">{currentT.sitemap}</h2>
                            <p className="text-[#555555] font-medium mb-6">{currentT.sitemap_desc}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { path: '/sahay', name: currentT.sm_home },
                                    { path: '/sahay/report', name: currentT.sm_report },
                                    { path: '/sahay/cases', name: currentT.sm_cases },
                                    { path: '/sahay/map', name: currentT.sm_map },
                                    { path: '/sahay/organization', name: currentT.sm_org },
                                    { path: '/sahay/volunteer', name: currentT.sm_vol },
                                    { path: '/sahay/impact', name: currentT.sm_imp },
                                    { path: '/sahay/emergency', name: currentT.sm_emg },
                                    { path: '/sahay/contact', name: currentT.sm_cont },
                                    { path: '/sahay/about', name: currentT.sm_abt },
                                    { path: '/sahay/auth', name: currentT.sm_auth },
                                    { path: '/sahay/admin', name: currentT.sm_adm }
                                ].map(link => (
                                    <Link 
                                        key={link.path} 
                                        to={link.path}
                                        onClick={() => setShowSitemap(false)}
                                        className="p-4 bg-[#F7F7F7] border border-[#E5E7EB] rounded-xl font-bold text-[#111111] hover:border-[#FF6B35] hover:text-[#FF6B35] transition-colors flex items-center justify-between group outline-none"
                                    >
                                        {link.name}
                                        <ArrowLeft size={16} className="rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* LANGUAGE SELECTOR MODAL */}
            <AnimatePresence>
                {showLangPrompt && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] bg-[#111111]/80 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-[400px] bg-[#FFFFFF] rounded-3xl p-8 flex flex-col shadow-2xl relative border border-[#E5E7EB] max-h-[80vh] overflow-y-auto"
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
                            <span className="text-[#111111] font-black text-[0.9rem] flex items-center gap-2 mr-2"><Filter size={16}/> {currentT.filter_cat}</span>
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
                    </div>
                </div>

                {/* Open / Accepted Tab System */}
                <div className="flex gap-4 mb-8 border-b border-[#E5E7EB]">
                    <button 
                        onClick={() => setActiveTab('Open')}
                        className={`pb-4 px-2 font-black text-[1.1rem] outline-none transition-colors relative ${activeTab === 'Open' ? 'text-[#111111]' : 'text-[#555555] hover:text-[#111111]'}`}
                    >
                        {currentT.tab_open}
                        {activeTab === 'Open' && <motion.div layoutId="tabIndicator" className="absolute bottom-0 left-0 right-0 h-1 bg-[#111111]" />}
                    </button>
                    <button 
                        onClick={() => setActiveTab('Accepted')}
                        className={`pb-4 px-2 font-black text-[1.1rem] outline-none transition-colors relative ${activeTab === 'Accepted' ? 'text-[#111111]' : 'text-[#555555] hover:text-[#111111]'}`}
                    >
                        {currentT.tab_acc}
                        {activeTab === 'Accepted' && <motion.div layoutId="tabIndicator" className="absolute bottom-0 left-0 right-0 h-1 bg-[#111111]" />}
                    </button>
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
                            const isAssigned = caseItem.status === 'Assigned' || caseItem.status === 'In Progress' || caseItem.status === 'Closed';

                            return (
                                <motion.div 
                                    variants={itemVariants} 
                                    key={caseItem.id} 
                                    className="rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] overflow-hidden hover:border-[#111111] transition-colors shadow-sm"
                                >
                                    <div 
                                        onClick={() => toggleTimeline(caseItem.id, caseItem.status)}
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

                                            <div className="flex items-center gap-4 text-[0.8rem] font-bold text-[#555555] mb-2">
                                                <span className="flex items-center gap-1"><MapPin size={14} className="text-[#00A9F7]" /> {caseItem.address.substring(0, 30)}...</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1"><Clock size={14} /> {dateString}</span>
                                            </div>

                                            {/* Show Assigned User info if applicable */}
                                            {isAssigned && caseItem.assignedToName && (
                                                <div className="flex items-center gap-2 mt-4 text-[0.85rem] font-bold text-[#16A34A] bg-[#16A34A]/10 px-3 py-1.5 rounded-lg border border-[#16A34A] inline-flex">
                                                    <Users size={14} /> {currentT.lbl_assigned}: {caseItem.assignedToName}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col items-end justify-between gap-4 h-full">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center border border-[#E5E7EB] bg-[#F7F7F7] text-[#111111] self-end shrink-0">
                                                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                            </div>

                                            {/* Task Acceptance & Community Confirmation Logic */}
                                            <div className="flex flex-col items-end gap-3 w-full md:w-auto mt-4 md:mt-0">
                                                {!isAssigned && activeTab === 'Open' && (
                                                    <button
                                                        onClick={(e) => handleAcceptTask(e, caseItem.id)}
                                                        disabled={confirmingId === caseItem.id}
                                                        className="w-full md:w-auto px-6 py-2 rounded-lg font-black text-[0.85rem] bg-[#111111] text-[#FFFFFF] hover:bg-[#333333] transition-colors outline-none"
                                                    >
                                                        {currentT.btn_accept}
                                                    </button>
                                                )}

                                                {!isAssigned && (
                                                    <button
                                                        onClick={(e) => handleSawThisToo(e, caseItem.id)}
                                                        disabled={hasConfirmed || confirmingId === caseItem.id}
                                                        className={`w-full md:w-auto px-4 py-2 rounded-lg font-bold text-[0.85rem] flex items-center justify-center gap-2 transition-colors outline-none border ${
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
                                                
                                                {isAssigned && caseItem.status === 'Closed' && (
                                                    <div className="px-4 py-2 rounded-lg font-bold text-[0.85rem] bg-[#16A34A] text-[#FFFFFF] flex items-center gap-2">
                                                        <CheckCircle size={14} /> Resolved
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expandable Timeline & Public Updates Drawer */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t border-[#E5E7EB] bg-[#F7F7F7] overflow-hidden"
                                            >
                                                <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
                                                    
                                                    {/* Standard Status Timeline */}
                                                    <div>
                                                        <h4 className="text-[1.1rem] font-black text-[#111111] mb-6">Status Tracker</h4>
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
                                                                                <h4 className={`text-[1.05rem] font-black ${isCompleted ? 'text-[#111111]' : 'text-[#555555]'}`}>
                                                                                    {step.title}
                                                                                </h4>
                                                                                <p className={`text-[0.9rem] mt-1 font-medium ${isCurrent ? 'text-[#FF6B35]' : 'text-[#555555]'}`}>
                                                                                    {step.desc}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Public Updates Feed (For Accepted Tasks) */}
                                                    {isAssigned && (
                                                        <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
                                                            <h4 className="text-[1.1rem] font-black text-[#111111] mb-6 flex items-center gap-2">
                                                                <MessageSquare size={18} className="text-[#00A9F7]" /> {currentT.updates}
                                                            </h4>
                                                            <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-2">
                                                                {!timelineData[caseItem.id] ? (
                                                                    <p className="text-[#555555] text-[0.9rem] animate-pulse">Loading updates...</p>
                                                                ) : timelineData[caseItem.id].length === 0 ? (
                                                                    <p className="text-[#555555] text-[0.9rem]">{currentT.no_updates}</p>
                                                                ) : (
                                                                    timelineData[caseItem.id].map(update => (
                                                                        <div key={update.id} className="bg-[#F7F7F7] border border-[#E5E7EB] p-4 rounded-xl">
                                                                            <p className="text-[#111111] font-medium text-[0.95rem] mb-2">{update.message}</p>
                                                                            <div className="flex items-center justify-between text-[0.75rem] font-bold text-[#555555]">
                                                                                <span>{update.userName}</span>
                                                                                <span>{update.createdAt ? update.createdAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}</span>
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
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
                        <span onClick={() => setShowSitemap(true)} className="cursor-pointer hover:text-[#111111] transition-colors underline outline-none">{currentT.sitemap}</span>
                        <span className="w-1 h-1 bg-[#E5E7EB] rounded-full"></span>
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