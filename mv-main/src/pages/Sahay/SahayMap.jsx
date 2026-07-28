import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { useCivicStore } from '../../store/useCivicStore';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
    ArrowLeft, 
    MapPin, 
    Filter,
    LogOut,
    X,
    Globe,
    ArrowUp,
    ShieldCheck,
    AlertTriangle,
    Info
} from 'lucide-react';

export default function SahayMap() {
    const navigate = useNavigate();
    
    // 1. STATE MANAGEMENT
    const theme = useCivicStore((state) => state.theme);
    const terminateSession = useCivicStore((state) => state.terminateSession);

    const [lang, setLang] = useState('en');
    const [showLangPrompt, setShowLangPrompt] = useState(false);
    const [showProductsPrompt, setShowProductsPrompt] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    
    const [activeCases, setActiveCases] = useState([]);
    const [filteredCases, setFilteredCases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');

    const defaultCenter = [19.0760, 72.8777]; // Mumbai Center

    // 2. AUTHENTICATION & INITIALIZATION
    useEffect(() => {
        const sysLang = navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'hinglish', 'mr', 'gu', 'te', 'ta', 'pa', 'bho', 'ar', 'es', 'fr', 'de'];
        if (supported.includes(sysLang)) setLang(sysLang);

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUser(user);
                fetchLiveCases();
            } else {
                navigate('/sahay/auth');
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    // 3. FETCH LIVE MAP DATA
    const fetchLiveCases = async () => {
        setIsLoading(true);
        try {
            const casesRef = collection(db, 'sahay_cases');
            const q = query(casesRef, where('status', 'in', ['Reported', 'Assigned', 'In Progress']));
            const snapshot = await getDocs(q);
            
            const records = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(record => record.location && record.location.lat && record.location.lng);
            
            setActiveCases(records);
            setFilteredCases(records);
        } catch (error) {
            console.error("Failed to fetch map data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // 4. FILTERING LOGIC
    useEffect(() => {
        if (activeFilter === 'All') {
            setFilteredCases(activeCases);
        } else {
            setFilteredCases(activeCases.filter(c => c.category === activeFilter));
        }
    }, [activeFilter, activeCases]);

    // 5. FUNCTIONAL LOGIC
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

    // Custom Map Markers matching Sahay Brand Colors
    const getMarkerIcon = (severity) => {
        let color = '#FF6B35'; // Humanitarian Orange (Default/Moderate)
        if (severity === 'Critical') color = '#DC2626'; // Alert Red
        if (severity === 'Urgent') color = '#F59E0B'; // Warm Yellow

        return L.divIcon({
            className: 'custom-leaflet-marker',
            html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid #FFFFFF; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });
    };

    // 6. 13-LANGUAGE DICTIONARY (Simple Consumer Context)
    const t = {
        en: {
            lang: "English", log_out: "Log out", careers: "Careers", products: "Products", back: "Back to Home",
            title: "Live Rescue Map", sub: "View active help requests across the city in real time.",
            filter_all: "All Cases", filter_1: "Homeless", filter_2: "Elderly", filter_3: "Animal", filter_4: "Medical",
            lbl_status: "Status", lbl_severity: "Urgency", lbl_desc: "Details", loading: "Loading map data..."
        },
        hi: {
            lang: "हिन्दी", log_out: "लॉग आउट", careers: "करियर", products: "उत्पाद", back: "होम पर वापस जाएं",
            title: "लाइव बचाव मानचित्र", sub: "वास्तविक समय में शहर भर में सक्रिय सहायता अनुरोध देखें।",
            filter_all: "सभी मामले", filter_1: "बेघर", filter_2: "बुजुर्ग", filter_3: "जानवर", filter_4: "चिकित्सा",
            lbl_status: "स्थिति", lbl_severity: "तात्कालिकता", lbl_desc: "विवरण", loading: "मानचित्र डेटा लोड हो रहा है..."
        },
        hinglish: {
            lang: "Hinglish", log_out: "Log out", careers: "Careers", products: "Products", back: "Home par wapas",
            title: "Live Rescue Map", sub: "Real time mein city ke active help requests dekhein.",
            filter_all: "All Cases", filter_1: "Homeless", filter_2: "Elderly", filter_3: "Animal", filter_4: "Medical",
            lbl_status: "Status", lbl_severity: "Urgency", lbl_desc: "Details", loading: "Map data load ho raha hai..."
        }
    };

    // Fallback dictionary assignment
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
                  .leaflet-container { z-index: 10; font-family: inherit; }
                  .leaflet-popup-content-wrapper { border-radius: 12px; padding: 0; overflow: hidden; }
                  .leaflet-popup-content { margin: 0; width: 280px !important; }
                  .leaflet-popup-tip-container { display: none; }
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
                        ovyra <span className={`${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'} font-medium text-[1.2rem] ml-1`}>Civic</span>
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

            <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 md:px-12 py-12 animate-fade flex flex-col">
                
                <button onClick={() => navigate('/sahay')} className="flex items-center gap-2 mb-8 outline-none font-bold text-[0.9rem] text-[#555555] hover:text-[#111111] transition-colors self-start">
                    <ArrowLeft size={16} /> {currentT.back}
                </button>

                <div className="mb-8">
                    <h1 className="text-[2.5rem] md:text-[3.5rem] font-black leading-[1.1] tracking-tighter mb-4 text-[#111111]">
                        {currentT.title}
                    </h1>
                    <p className="text-[1.1rem] text-[#555555] font-medium">
                        {currentT.sub}
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 mb-8">
                    <div className="flex items-center gap-2 text-[#111111] font-black mr-4">
                        <Filter size={18} /> Filter:
                    </div>
                    {[
                        { id: 'All', label: currentT.filter_all },
                        { id: 'Homeless', label: currentT.filter_1 },
                        { id: 'Elderly', label: currentT.filter_2 },
                        { id: 'Animal', label: currentT.filter_3 },
                        { id: 'Medical', label: currentT.filter_4 }
                    ].map(filter => (
                        <button
                            key={filter.id}
                            onClick={() => setActiveFilter(filter.id)}
                            className={`px-5 py-2.5 rounded-full font-bold text-[0.9rem] transition-colors border outline-none ${
                                activeFilter === filter.id 
                                ? 'bg-[#111111] text-[#FFFFFF] border-[#111111]' 
                                : 'bg-[#FFFFFF] text-[#555555] border-[#E5E7EB] hover:border-[#111111] hover:text-[#111111]'
                            }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>

                {/* Map Container */}
                <div className="w-full flex-1 min-h-[500px] rounded-3xl overflow-hidden border border-[#E5E7EB] relative shadow-sm">
                    {isLoading && (
                        <div className="absolute inset-0 z-20 bg-[#FFFFFF]/80 backdrop-blur-sm flex flex-col items-center justify-center">
                            <div className="w-8 h-8 border-2 border-t-transparent border-[#FF6B35] rounded-full animate-spin mb-4"></div>
                            <span className="font-bold text-[#555555]">{currentT.loading}</span>
                        </div>
                    )}
                    
                    <MapContainer center={defaultCenter} zoom={12} className="w-full h-full">
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://carto.com/">Carto</a>'
                        />
                        {filteredCases.map(caseItem => (
                            <Marker 
                                key={caseItem.id} 
                                position={[caseItem.location.lat, caseItem.location.lng]}
                                icon={getMarkerIcon(caseItem.severity)}
                            >
                                <Popup>
                                    <div className="p-5 flex flex-col bg-[#FFFFFF] text-[#111111]">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="px-3 py-1 bg-[#F7F7F7] text-[#111111] font-black text-[0.7rem] uppercase tracking-wider rounded-full border border-[#E5E7EB]">
                                                {caseItem.category}
                                            </span>
                                            <span className={`px-3 py-1 font-black text-[0.7rem] uppercase tracking-wider rounded-full border ${
                                                caseItem.severity === 'Critical' ? 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]' :
                                                caseItem.severity === 'Urgent' ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]' :
                                                'bg-[#FF6B35]/10 text-[#FF6B35] border-[#FF6B35]'
                                            }`}>
                                                {caseItem.severity}
                                            </span>
                                        </div>
                                        <p className="text-[0.9rem] font-bold text-[#555555] mb-2 flex items-start gap-2">
                                            <MapPin size={14} className="mt-1 shrink-0 text-[#00A9F7]" />
                                            <span className="line-clamp-2">{caseItem.address}</span>
                                        </p>
                                        <div className="w-full h-px bg-[#E5E7EB] my-3"></div>
                                        <p className="text-[0.85rem] text-[#111111] line-clamp-3 mb-4 leading-relaxed">
                                            {caseItem.description}
                                        </p>
                                        <div className="flex items-center justify-between mt-auto">
                                            <span className="text-[0.75rem] font-bold uppercase text-[#555555]">
                                                {currentT.lbl_status}: <span className="text-[#111111]">{caseItem.status}</span>
                                            </span>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
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