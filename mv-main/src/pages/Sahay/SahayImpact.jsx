import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, getDocs, getCountFromServer, orderBy, limit } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { useCivicStore } from '../../store/useCivicStore';
import { 
    ArrowLeft, 
    LogOut,
    X,
    Globe,
    ArrowUp,
    BarChart,
    ShieldCheck,
    HeartHandshake,
    Building,
    Clock,
    MapPin,
    Activity
} from 'lucide-react';

export default function SahayImpact() {
    const navigate = useNavigate();
    
    // 1. STATE MANAGEMENT
    const theme = useCivicStore((state) => state.theme) || 'light'; 
    const terminateSession = useCivicStore((state) => state.terminateSession);

    const [lang, setLang] = useState('en');
    const [showLangPrompt, setShowLangPrompt] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    
    const [isLoading, setIsLoading] = useState(true);
    const [globalMetrics, setGlobalMetrics] = useState({
        totalReports: 0,
        successfulRescues: 0,
        verifiedNGOs: 0,
        avgResponseTime: 'Calculating...'
    });
    const [cityStats, setCityStats] = useState([]);

    // 2. AUTHENTICATION & DATA FETCHING
    useEffect(() => {
        const sysLang = navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'hinglish', 'mr', 'gu', 'te', 'ta', 'pa', 'bho', 'ar', 'es', 'fr', 'de'];
        if (supported.includes(sysLang)) setLang(sysLang);

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });

        fetchImpactData();

        return () => unsubscribe();
    }, []);

    const fetchImpactData = async () => {
        setIsLoading(true);
        try {
            const casesRef = collection(db, 'sahay_cases');
            const orgsRef = collection(db, 'sahay_organizations');

            // 1. Get Global Counts
            const totalCasesQuery = query(casesRef);
            const resolvedCasesQuery = query(casesRef, where('status', '==', 'Closed'));
            const verifiedOrgsQuery = query(orgsRef, where('verificationStatus', '==', 'Verified'));

            const [totalSnap, resolvedSnap, orgsSnap] = await Promise.all([
                getCountFromServer(totalCasesQuery),
                getCountFromServer(resolvedCasesQuery),
                getCountFromServer(verifiedOrgsQuery)
            ]);

            // 2. Calculate Response Times and City Distribution from recent resolved cases
            const recentResolvedQuery = query(casesRef, where('status', '==', 'Closed'), orderBy('closedAt', 'desc'), limit(100));
            const recentResolvedData = await getDocs(recentResolvedQuery);
            
            let totalHours = 0;
            let validTimeRecords = 0;
            const cityCounts = { 'Mumbai': 0, 'Delhi': 0, 'Bengaluru': 0, 'Pune': 0, 'Hyderabad': 0, 'Other': 0 };

            recentResolvedData.forEach(doc => {
                const data = doc.data();
                
                // Calculate time difference
                if (data.createdAt && data.closedAt) {
                    const created = data.createdAt.toDate();
                    const closed = data.closedAt.toDate();
                    const diffHours = (closed - created) / (1000 * 60 * 60);
                    if (diffHours >= 0) {
                        totalHours += diffHours;
                        validTimeRecords++;
                    }
                }

                // Categorize by city
                const addressStr = (data.address || '').toLowerCase();
                let matched = false;
                Object.keys(cityCounts).forEach(city => {
                    if (city !== 'Other' && addressStr.includes(city.toLowerCase())) {
                        cityCounts[city]++;
                        matched = true;
                    }
                });
                if (!matched) cityCounts['Other']++;
            });

            const avgHours = validTimeRecords > 0 ? (totalHours / validTimeRecords).toFixed(1) : '24.0';
            
            // Format city array for charting
            const formattedCityStats = Object.keys(cityCounts)
                .filter(city => cityCounts[city] > 0)
                .map(city => ({ name: city, count: cityCounts[city] }))
                .sort((a, b) => b.count - a.count);

            setGlobalMetrics({
                totalReports: totalSnap.data().count || 0,
                successfulRescues: resolvedSnap.data().count || 0,
                verifiedNGOs: orgsSnap.data().count || 0,
                avgResponseTime: validTimeRecords > 0 ? `${avgHours} Hours` : 'Pending Data'
            });

            setCityStats(formattedCityStats);

        } catch (error) {
            console.error("Failed to load impact data:", error);
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

    // 4. 13-LANGUAGE DICTIONARY (Simple Consumer Context)
    const t = {
        en: {
            lang: "English", log_out: "Log out", careers: "Careers", products: "Products", back: "Back to Home",
            title: "Impact Dashboard", sub: "Real-time statistics on rescues and response times.",
            lbl_reports: "Total Reports", lbl_rescues: "People & Animals Helped", lbl_orgs: "Verified Partners", lbl_time: "Avg. Response Time",
            sec_city: "City Performance", sec_city_sub: "Where help is reaching the fastest.",
            loading: "Loading statistics...", empty: "Not enough data yet."
        },
        hi: {
            lang: "हिन्दी", log_out: "लॉग आउट", careers: "करियर", products: "उत्पाद", back: "होम पर वापस जाएं",
            title: "प्रभाव डैशबोर्ड", sub: "बचाव और प्रतिक्रिया समय पर वास्तविक समय के आंकड़े।",
            lbl_reports: "कुल रिपोर्ट", lbl_rescues: "मदद किए गए लोग और जानवर", lbl_orgs: "सत्यापित पार्टनर", lbl_time: "औसत प्रतिक्रिया समय",
            sec_city: "शहर का प्रदर्शन", sec_city_sub: "जहां मदद सबसे तेजी से पहुंच रही है।",
            loading: "आंकड़े लोड हो रहे हैं...", empty: "अभी पर्याप्त डेटा नहीं है।"
        },
        hinglish: {
            lang: "Hinglish", log_out: "Log out", careers: "Careers", products: "Products", back: "Home par wapas",
            title: "Impact Dashboard", sub: "Rescues aur response time ke real-time stats.",
            lbl_reports: "Total Reports", lbl_rescues: "People & Animals Helped", lbl_orgs: "Verified Partners", lbl_time: "Avg. Response Time",
            sec_city: "City Performance", sec_city_sub: "Kahan help sabse jaldi pahunch rahi hai.",
            loading: "Stats load ho rahe hain...", empty: "Abhi data available nahi hai."
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

            <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 md:px-12 py-12 animate-fade flex flex-col">
                
                <button onClick={() => navigate('/sahay')} className="flex items-center gap-2 mb-8 outline-none font-bold text-[0.9rem] text-[#555555] hover:text-[#111111] transition-colors self-start">
                    <ArrowLeft size={16} /> {currentT.back}
                </button>

                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-4 text-[#00A9F7]">
                        <BarChart size={32} />
                    </div>
                    <h1 className="text-[2.5rem] md:text-[3.5rem] font-black leading-[1.1] tracking-tighter mb-4 text-[#111111]">
                        {currentT.title}
                    </h1>
                    <p className="text-[1.1rem] text-[#555555] font-medium">
                        {currentT.sub}
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <div className="w-10 h-10 border-4 border-t-transparent border-[#00A9F7] rounded-full animate-spin mb-4"></div>
                        <span className="text-[1rem] font-bold text-[#555555]">{currentT.loading}</span>
                    </div>
                ) : (
                    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="flex flex-col gap-12">
                        
                        {/* Global Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <motion.div variants={itemVariants} className="bg-[#F7F7F7] border border-[#E5E7EB] p-8 rounded-3xl flex flex-col">
                                <div className="w-12 h-12 bg-[#FFFFFF] border border-[#E5E7EB] rounded-full flex items-center justify-center mb-6">
                                    <Activity size={20} className="text-[#FF6B35]" />
                                </div>
                                <h3 className="text-[2.5rem] font-black text-[#111111] leading-none mb-2">{globalMetrics.totalReports}</h3>
                                <p className="text-[#555555] font-bold text-[0.85rem] uppercase tracking-wider">{currentT.lbl_reports}</p>
                            </motion.div>

                            <motion.div variants={itemVariants} className="bg-[#F7F7F7] border border-[#E5E7EB] p-8 rounded-3xl flex flex-col">
                                <div className="w-12 h-12 bg-[#FFFFFF] border border-[#E5E7EB] rounded-full flex items-center justify-center mb-6">
                                    <HeartHandshake size={20} className="text-[#16A34A]" />
                                </div>
                                <h3 className="text-[2.5rem] font-black text-[#16A34A] leading-none mb-2">{globalMetrics.successfulRescues}</h3>
                                <p className="text-[#555555] font-bold text-[0.85rem] uppercase tracking-wider">{currentT.lbl_rescues}</p>
                            </motion.div>

                            <motion.div variants={itemVariants} className="bg-[#F7F7F7] border border-[#E5E7EB] p-8 rounded-3xl flex flex-col">
                                <div className="w-12 h-12 bg-[#FFFFFF] border border-[#E5E7EB] rounded-full flex items-center justify-center mb-6">
                                    <Building size={20} className="text-[#00A9F7]" />
                                </div>
                                <h3 className="text-[2.5rem] font-black text-[#00A9F7] leading-none mb-2">{globalMetrics.verifiedNGOs}</h3>
                                <p className="text-[#555555] font-bold text-[0.85rem] uppercase tracking-wider">{currentT.lbl_orgs}</p>
                            </motion.div>

                            <motion.div variants={itemVariants} className="bg-[#F7F7F7] border border-[#E5E7EB] p-8 rounded-3xl flex flex-col">
                                <div className="w-12 h-12 bg-[#FFFFFF] border border-[#E5E7EB] rounded-full flex items-center justify-center mb-6">
                                    <Clock size={20} className="text-[#F59E0B]" />
                                </div>
                                <h3 className="text-[2rem] font-black text-[#F59E0B] leading-none mb-2 mt-2">{globalMetrics.avgResponseTime}</h3>
                                <p className="text-[#555555] font-bold text-[0.85rem] uppercase tracking-wider mt-auto">{currentT.lbl_time}</p>
                            </motion.div>
                        </div>

                        {/* City Breakdown Section */}
                        <motion.section variants={itemVariants} className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-3xl p-8 md:p-12 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <MapPin size={24} className="text-[#00A9F7]" />
                                <h2 className="text-[1.8rem] font-black text-[#111111]">{currentT.sec_city}</h2>
                            </div>
                            <p className="text-[#555555] text-[1rem] mb-10">{currentT.sec_city_sub}</p>

                            {cityStats.length === 0 ? (
                                <div className="p-8 text-center bg-[#F7F7F7] rounded-2xl border border-[#E5E7EB]">
                                    <p className="text-[#555555] font-bold">{currentT.empty}</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-6">
                                    {cityStats.map((stat, idx) => {
                                        // Calculate percentage for progress bar based on top city
                                        const maxCount = cityStats[0].count;
                                        const percentage = Math.round((stat.count / maxCount) * 100);

                                        return (
                                            <div key={idx} className="flex flex-col gap-2">
                                                <div className="flex items-center justify-between text-[#111111] font-bold text-[1rem]">
                                                    <span>{stat.name}</span>
                                                    <span>{stat.count} Rescues</span>
                                                </div>
                                                <div className="w-full bg-[#F7F7F7] h-4 rounded-full overflow-hidden border border-[#E5E7EB]">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${percentage}%` }}
                                                        transition={{ duration: 1, delay: 0.2 + (idx * 0.1) }}
                                                        className="h-full bg-[#00A9F7] rounded-full"
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.section>

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