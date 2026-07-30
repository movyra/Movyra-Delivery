import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, orderBy, getDocs, doc, updateDoc, where } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { useCivicStore } from '../../store/useCivicStore';
import { 
    ArrowLeft, 
    LogOut,
    X,
    Globe,
    ArrowUp,
    ShieldCheck,
    CheckCircle,
    Building,
    AlertTriangle,
    Merge,
    FileText,
    MapPin
} from 'lucide-react';

export default function SahayAdmin() {
    const navigate = useNavigate();
    
    // 1. STATE MANAGEMENT
    const theme = useCivicStore((state) => state.theme) || 'light'; 
    const terminateSession = useCivicStore((state) => state.terminateSession);

    const [lang, setLang] = useState('en');
    const [showLangPrompt, setShowLangPrompt] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    
    const [pendingPartners, setPendingPartners] = useState([]);
    const [activeCases, setActiveCases] = useState([]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Partners'); 
    const [isUpdating, setIsUpdating] = useState(false);

    // 2. AUTHENTICATION & DATA FETCHING
    useEffect(() => {
        const sysLang = navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'hinglish', 'mr', 'gu', 'te', 'ta', 'pa', 'bho', 'ar', 'es', 'fr', 'de'];
        if (supported.includes(sysLang)) setLang(sysLang);

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // In a production app, verify custom claims here (e.g., user.claims.admin)
                setCurrentUser(user);
                fetchDashboardData();
            } else {
                navigate('/sahay/auth');
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            // Fetch Pending NGOs
            const orgsRef = collection(db, 'sahay_organizations');
            const qOrgs = query(orgsRef, where('verificationStatus', '==', 'Pending'));
            const snapOrgs = await getDocs(qOrgs);
            const orgRecords = snapOrgs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPendingPartners(orgRecords);

            // Fetch Active Cases for moderation (duplicates)
            const casesRef = collection(db, 'sahay_cases');
            const qCases = query(casesRef, where('status', 'in', ['Reported', 'Verified']), orderBy('createdAt', 'desc'));
            const snapCases = await getDocs(qCases);
            const caseRecords = snapCases.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setActiveCases(caseRecords);

        } catch (error) {
            console.error("Failed to load admin data:", error);
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

    // Approve an NGO
    const handleApprovePartner = async (orgId) => {
        if (!currentUser) return;
        setIsUpdating(true);
        try {
            const orgRef = doc(db, 'sahay_organizations', orgId);
            await updateDoc(orgRef, {
                verificationStatus: 'Verified'
            });

            // Remove from local pending list
            setPendingPartners(pendingPartners.filter(p => p.id !== orgId));
        } catch (error) {
            console.error("Failed to approve partner:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    // Merge/Close a duplicate case
    const handleMergeCase = async (caseId) => {
        if (!currentUser) return;
        setIsUpdating(true);
        try {
            const caseRef = doc(db, 'sahay_cases', caseId);
            await updateDoc(caseRef, {
                status: 'Closed',
                moderationNote: 'Merged as duplicate'
            });

            // Remove from local active list
            setActiveCases(activeCases.filter(c => c.id !== caseId));
        } catch (error) {
            console.error("Failed to merge case:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    // 4. 13-LANGUAGE DICTIONARY (Simple Admin Context)
    const t = {
        en: {
            lang: "English", log_out: "Log out", careers: "Careers", back: "Back to Home",
            title: "Admin Console", sub: "Review partner applications and manage rescue reports.",
            tab_part: "Partner Approvals", tab_cases: "Report Moderation",
            btn_approve: "Approve Partner", btn_merge: "Merge Duplicate",
            lbl_docs: "Documents Provided", loading: "Loading data...",
            empty_part: "No pending partner applications.", empty_cases: "No recent reports to moderate.",
            lbl_loc: "Location", lbl_cat: "Type"
        },
        hi: {
            lang: "हिन्दी", log_out: "लॉग आउट", careers: "करियर", back: "होम पर वापस जाएं",
            title: "एडमिन कंसोल", sub: "पार्टनर आवेदनों की समीक्षा करें और बचाव रिपोर्ट प्रबंधित करें।",
            tab_part: "पार्टनर स्वीकृतियां", tab_cases: "रिपोर्ट मॉडरेशन",
            btn_approve: "पार्टनर स्वीकृत करें", btn_merge: "डुप्लिकेट मर्ज करें",
            lbl_docs: "प्रदान किए गए दस्तावेज़", loading: "डेटा लोड हो रहा है...",
            empty_part: "कोई लंबित पार्टनर आवेदन नहीं।", empty_cases: "मॉडरेट करने के लिए कोई हालिया रिपोर्ट नहीं।",
            lbl_loc: "स्थान", lbl_cat: "प्रकार"
        },
        hinglish: {
            lang: "Hinglish", log_out: "Log out", careers: "Careers", back: "Home par wapas",
            title: "Admin Console", sub: "Partner applications review karein aur reports manage karein.",
            tab_part: "Partner Approvals", tab_cases: "Report Moderation",
            btn_approve: "Partner Approve Karein", btn_merge: "Duplicate Merge Karein",
            lbl_docs: "Documents Provided", loading: "Data load ho raha hai...",
            empty_part: "Koi pending partner application nahi.", empty_cases: "Moderate karne ke liye koi nayi report nahi.",
            lbl_loc: "Location", lbl_cat: "Type"
        }
    };

    const currentT = t[lang] || t['en'];
    const languageOptions = [
        { code: 'en', label: 'English' }, { code: 'hi', label: 'हिन्दी' }, { code: 'hinglish', label: 'Hinglish' }
    ];

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };

    return (
        <div className="min-h-screen font-sans overflow-x-hidden flex flex-col relative bg-[#FFFFFF] text-[#111111] selection:bg-[#00A9F7] selection:text-white">
            
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
                                        className={`w-full p-4 rounded-xl flex items-center justify-between transition-colors border outline-none ${lang === option.code ? 'bg-[#00A9F7]/10 border-[#00A9F7] text-[#00A9F7]' : 'bg-[#F7F7F7] border-[#E5E7EB] text-[#555555] hover:border-[#111111] hover:text-[#111111]'}`}
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
                    <div className="flex items-center gap-3 mb-4 text-[#00A9F7]">
                        <ShieldCheck size={32} />
                    </div>
                    <h1 className="text-[2.5rem] md:text-[3.5rem] font-black leading-[1.1] tracking-tighter mb-4 text-[#111111]">
                        {currentT.title}
                    </h1>
                    <p className="text-[1.1rem] text-[#555555] font-medium">
                        {currentT.sub}
                    </p>
                </div>

                {/* Admin Tabs */}
                <div className="flex gap-4 mb-8 border-b border-[#E5E7EB]">
                    <button 
                        onClick={() => setActiveTab('Partners')}
                        className={`pb-4 px-2 font-black text-[1.1rem] outline-none transition-colors relative ${activeTab === 'Partners' ? 'text-[#111111]' : 'text-[#555555] hover:text-[#111111]'}`}
                    >
                        {currentT.tab_part}
                        {activeTab === 'Partners' && <motion.div layoutId="tabIndicator" className="absolute bottom-0 left-0 right-0 h-1 bg-[#00A9F7]" />}
                    </button>
                    <button 
                        onClick={() => setActiveTab('Cases')}
                        className={`pb-4 px-2 font-black text-[1.1rem] outline-none transition-colors relative ${activeTab === 'Cases' ? 'text-[#111111]' : 'text-[#555555] hover:text-[#111111]'}`}
                    >
                        {currentT.tab_cases}
                        {activeTab === 'Cases' && <motion.div layoutId="tabIndicator" className="absolute bottom-0 left-0 right-0 h-1 bg-[#00A9F7]" />}
                    </button>
                </div>

                {/* Dashboard Feed */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-t-transparent border-[#00A9F7] rounded-full animate-spin mb-4"></div>
                        <span className="text-[0.9rem] font-bold text-[#555555]">{currentT.loading}</span>
                    </div>
                ) : activeTab === 'Partners' ? (
                    
                    // PARTNER APPROVALS VIEW
                    pendingPartners.length === 0 ? (
                        <div className="rounded-3xl p-12 text-center border border-dashed border-[#D1D5DB] bg-[#F7F7F7] flex flex-col items-center justify-center">
                            <CheckCircle size={48} className="mb-6 text-[#16A34A]" />
                            <h2 className="text-[1.5rem] font-black tracking-tight mb-2 text-[#111111]">{currentT.empty_part}</h2>
                        </div>
                    ) : (
                        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="flex flex-col gap-6">
                            {pendingPartners.map((org) => (
                                <motion.div 
                                    variants={itemVariants} 
                                    key={org.id} 
                                    className="rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Building size={18} className="text-[#00A9F7]" />
                                            <h3 className="text-[1.25rem] font-black text-[#111111]">{org.name || 'Unnamed Organization'}</h3>
                                        </div>
                                        <p className="text-[0.95rem] font-medium text-[#555555] mb-4">
                                            {org.description || 'No description provided.'}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-4 text-[0.85rem] font-bold text-[#555555] bg-[#F7F7F7] p-3 rounded-lg border border-[#E5E7EB]">
                                            <span>Email: {org.email}</span>
                                            <span>Phone: {org.phone}</span>
                                            <span className="flex items-center gap-1 text-[#00A9F7]"><FileText size={14}/> {currentT.lbl_docs}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end justify-center min-w-[150px]">
                                        <button
                                            onClick={() => handleApprovePartner(org.id)}
                                            disabled={isUpdating}
                                            className="w-full bg-[#111111] text-[#FFFFFF] py-3 rounded-xl font-bold text-[0.95rem] flex items-center justify-center gap-2 hover:bg-[#333333] transition-colors outline-none disabled:opacity-50"
                                        >
                                            <ShieldCheck size={16} /> {currentT.btn_approve}
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )
                ) : (
                    
                    // CASE MODERATION VIEW
                    activeCases.length === 0 ? (
                        <div className="rounded-3xl p-12 text-center border border-dashed border-[#D1D5DB] bg-[#F7F7F7] flex flex-col items-center justify-center">
                            <CheckCircle size={48} className="mb-6 text-[#16A34A]" />
                            <h2 className="text-[1.5rem] font-black tracking-tight mb-2 text-[#111111]">{currentT.empty_cases}</h2>
                        </div>
                    ) : (
                        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="flex flex-col gap-6">
                            {activeCases.map((caseItem) => (
                                <motion.div 
                                    variants={itemVariants} 
                                    key={caseItem.id} 
                                    className="rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="px-3 py-1 bg-[#F7F7F7] border border-[#E5E7EB] text-[#555555] text-[0.75rem] font-black tracking-wider uppercase rounded-full">
                                                ID: {caseItem.id.substring(0, 6)}
                                            </span>
                                            {caseItem.danger === 'Yes' && (
                                                <span className="px-3 py-1 bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626] text-[0.75rem] font-black tracking-wider uppercase rounded-full flex items-center gap-1">
                                                    <AlertTriangle size={12}/> Critical
                                                </span>
                                            )}
                                        </div>
                                        
                                        <p className="text-[1rem] font-medium text-[#111111] mb-4 leading-relaxed">
                                            {caseItem.description}
                                        </p>

                                        <div className="flex flex-wrap gap-4 text-[0.85rem] font-bold text-[#555555]">
                                            <span className="flex items-center gap-1"><MapPin size={14} className="text-[#00A9F7]" /> {caseItem.address}</span>
                                            <span>{currentT.lbl_cat}: {caseItem.category}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end justify-center min-w-[150px]">
                                        <button
                                            onClick={() => handleMergeCase(caseItem.id)}
                                            disabled={isUpdating}
                                            className="w-full bg-[#FFFFFF] text-[#111111] border border-[#E5E7EB] py-3 rounded-xl font-bold text-[0.95rem] flex items-center justify-center gap-2 hover:border-[#111111] transition-colors outline-none disabled:opacity-50"
                                        >
                                            <Merge size={16} /> {currentT.btn_merge}
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )
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