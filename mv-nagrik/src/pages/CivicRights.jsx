import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Search, Scale, ChevronDown, FileText } from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function CivicRights() {
    const navigate = useNavigate();
    const [lang, setLang] = useState('en');
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedId, setExpandedId] = useState(null);

    // Language Synchronization
    useEffect(() => {
        const savedLang = localStorage.getItem('nagrik_lang') || navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'hinglish', 'mr', 'gu', 'te', 'ta', 'kn', 'ml', 'bn', 'pa', 'or', 'as', 'ur', 'bho'];
        if (supported.includes(savedLang)) setLang(savedLang);
    }, []);

    // Real-Time Database Connection (Read-Only for Public)
    useEffect(() => {
        const q = query(collection(db, 'civic_rights_kb'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setArticles(fetchedData);
            setLoading(false);
        }, (error) => {
            console.error("Database sync failed:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // 15-Language Translation Dictionary
    const t = {
        en: { title: "Civic Rights", search: "Search rights...", loading: "Loading knowledge base...", read_more: "Read More", close: "Close", category: "Category", not_found: "No rights found." },
        hi: { title: "नागरिक अधिकार", search: "अधिकार खोजें...", loading: "ज्ञानकोष लोड हो रहा है...", read_more: "अधिक पढ़ें", close: "बंद करें", category: "श्रेणी", not_found: "कोई अधिकार नहीं मिला।" },
        hinglish: { title: "Civic Rights", search: "Rights search karein...", loading: "Knowledge base load ho raha hai...", read_more: "Aur Padhein", close: "Band Karein", category: "Category", not_found: "Koi rights nahi milay." },
        mr: { title: "नागरिक हक्क", search: "हक्क शोधा...", loading: "ज्ञानकोष लोड होत आहे...", read_more: "अधिक वाचा", close: "बंद करा", category: "श्रेणी", not_found: "कोणतेही हक्क आढळले नाहीत." },
        gu: { title: "નાગરિક અધિકાર", search: "અધિકાર શોધો...", loading: "જ્ઞાનકોશ લોડ થઈ રહ્યો છે...", read_more: "વધુ વાંચો", close: "બંધ કરો", category: "શ્રેણી", not_found: "કોઈ અધિકાર મળ્યા નથી." },
        te: { title: "పౌర హక్కులు", search: "హక్కులను శోధించండి...", loading: "నాలెడ్జ్ బేస్ లోడ్ అవుతోంది...", read_more: "ఇంకా చదవండి", close: "మూసివేయి", category: "వర్గం", not_found: "హక్కులు కనుగొనబడలేదు." },
        ta: { title: "குடிமை உரிமைகள்", search: "உரிமைகளைத் தேடு...", loading: "அறிவு தளம் ஏற்றப்படுகிறது...", read_more: "மேலும் படிக்க", close: "மூடு", category: "வகை", not_found: "உரிமைகள் கிடைக்கவில்லை." },
        kn: { title: "ನಾಗರಿಕ ಹಕ್ಕುಗಳು", search: "ಹಕ್ಕುಗಳನ್ನು ಹುಡುಕಿ...", loading: "ಜ್ಞಾನದ ಮೂಲ ಲೋಡ್ ಆಗುತ್ತಿದೆ...", read_more: "ಇನ್ನಷ್ಟು ಓದಿ", close: "ಮುಚ್ಚಿ", category: "ವರ್ಗ", not_found: "ಯಾವುದೇ ಹಕ್ಕುಗಳು ಕಂಡುಬಂದಿಲ್ಲ." },
        ml: { title: "പൗരാവകാശങ്ങൾ", search: "അവകാശങ്ങൾ തിരയുക...", loading: "വിവരങ്ങൾ ലോഡുചെയ്യുന്നു...", read_more: "കൂടുതൽ വായിക്കുക", close: "അടയ്ക്കുക", category: "വിഭാഗം", not_found: "അവകാശങ്ങൾ കണ്ടെത്തിയില്ല." },
        bn: { title: "নাগরিক অধিকার", search: "অধিকার খুঁজুন...", loading: "তথ্য ভান্ডার লোড হচ্ছে...", read_more: "আরও পড়ুন", close: "বন্ধ করুন", category: "বিভাগ", not_found: "কোনো অধিকার পাওয়া যায়নি।" },
        pa: { title: "ਨਾਗਰਿਕ ਅਧਿਕਾਰ", search: "ਅਧਿਕਾਰ ਖੋਜੋ...", loading: "ਗਿਆਨ ਅਧਾਰ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...", read_more: "ਹੋਰ ਪੜ੍ਹੋ", close: "ਬੰਦ ਕਰੋ", category: "ਸ਼੍ਰੇਣੀ", not_found: "ਕੋਈ ਅਧਿਕਾਰ ਨਹੀਂ ਮਿਲਿਆ।" },
        or: { title: "ନାଗରିକ ଅଧିକାର", search: "ଅଧିକାର ଖୋଜନ୍ତୁ...", loading: "ଜ୍ଞାନକୋଷ ଲୋଡ୍ ହେଉଛି...", read_more: "ଅଧିକ ପଢନ୍ତୁ", close: "ବନ୍ଦ କରନ୍ତୁ", category: "ବିଭାଗ", not_found: "କୌଣସି ଅଧିକାର ମିଳିଲା ନାହିଁ।" },
        as: { title: "নাগৰিক অধিকাৰ", search: "অধিকাৰ অনুসন্ধান কৰক...", loading: "জ্ঞানকোষ লোড হৈ আছে...", read_more: "অধিক পঢ়ক", close: "বন্ধ কৰক", category: "বিভাগ", not_found: "কোনো অধিকাৰ পোৱা নগ'ল।" },
        ur: { title: "شہری حقوق", search: "حقوق تلاش کریں۔۔۔", loading: "نالج بیس لوڈ ہو رہا ہے۔۔۔", read_more: "مزید پڑھیں", close: "بند کریں", category: "زمرہ", not_found: "کوئی حقوق نہیں ملے۔" },
        bho: { title: "नागरिक अधिकार", search: "अधिकार खोजीं...", loading: "ज्ञानकोष लोड हो रहल बा...", read_more: "अउर पढ़ीं", close: "बंद करीं", category: "श्रेणी", not_found: "कवनो अधिकार ना मिलल।" }
    };

    const currentT = t[lang] || t['en'];

    // Search Filter Logic
    const filteredArticles = articles.filter(article => 
        (article.title && article.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (article.category && article.category.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const toggleAccordion = (id) => {
        if (expandedId === id) {
            setExpandedId(null);
        } else {
            setExpandedId(id);
        }
    };

    return (
        <div className="min-h-screen bg-[#FFFFFF] font-sans text-[#111111]">
            
            {/* Standard Header */}
            <div className="w-full flex items-center justify-between px-6 pt-12 pb-4 border-b border-[#111111]/5 sticky top-0 bg-[#FFFFFF] z-30">
                <button onClick={() => navigate(-1)} className="text-[#00897B] outline-none active:scale-95 transition-transform">
                    <ChevronLeft size={28} strokeWidth={2.5} />
                </button>
                <div className="flex items-center gap-2">
                    <Scale size={20} className="text-[#111111]" strokeWidth={2.5} />
                    <span className="font-black text-[1.2rem] tracking-tight">{currentT.title}</span>
                </div>
                <div className="w-7"></div>
            </div>

            {/* Search Bar */}
            <div className="px-6 pt-6 pb-2 bg-[#FFFFFF] sticky top-[72px] z-20">
                <div className="relative w-full">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search size={18} className="text-[#111111]/40" />
                    </div>
                    <input 
                        type="text" 
                        placeholder={currentT.search} 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#F9FAFB] border border-[#111111]/10 rounded-xl py-3 pl-11 pr-4 text-[0.95rem] font-medium outline-none focus:border-[#00897B] focus:bg-[#FFFFFF] transition-all"
                    />
                </div>
            </div>

            {/* Real-Time Feed */}
            <div className="p-6 flex flex-col gap-4 pb-20">
                {loading ? (
                    <div className="w-full text-center py-10">
                        <div className="w-8 h-8 border-4 border-[#111111]/10 border-t-[#00897B] rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-sm font-bold text-[#111111]/50">{currentT.loading}</p>
                    </div>
                ) : filteredArticles.length === 0 ? (
                    <div className="w-full text-center py-10">
                        <Scale size={40} className="text-[#111111]/20 mx-auto mb-3" />
                        <p className="text-[0.95rem] font-bold text-[#111111]/40">{currentT.not_found}</p>
                    </div>
                ) : (
                    filteredArticles.map((article) => {
                        const isExpanded = expandedId === article.id;
                        return (
                            <motion.div 
                                key={article.id} 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-[#FFFFFF] border border-[#111111]/10 rounded-xl overflow-hidden shadow-sm"
                            >
                                <button 
                                    onClick={() => toggleAccordion(article.id)}
                                    className="w-full text-left p-5 flex items-start justify-between gap-4 outline-none active:bg-[#F9FAFB] transition-colors"
                                >
                                    <div className="flex flex-col gap-2">
                                        <span className="inline-block px-2 py-1 bg-[#111111]/5 text-[#111111]/70 text-[0.65rem] font-black uppercase tracking-wider rounded w-max">
                                            {article.category || currentT.category}
                                        </span>
                                        <h3 className="text-[1.1rem] font-black text-[#111111] leading-tight pr-2">
                                            {article.title}
                                        </h3>
                                    </div>
                                    <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${isExpanded ? 'bg-[#00897B] text-[#FFFFFF] rotate-180' : 'bg-[#F9FAFB] text-[#111111]/50'}`}>
                                        <ChevronDown size={20} strokeWidth={2} />
                                    </div>
                                </button>

                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden bg-[#F9FAFB] border-t border-[#111111]/5"
                                        >
                                            <div className="p-5 flex flex-col gap-4">
                                                <div className="flex items-start gap-3">
                                                    <FileText size={18} className="text-[#00897B] shrink-0 mt-1" />
                                                    <p className="text-[0.95rem] font-medium text-[#111111]/80 leading-relaxed whitespace-pre-wrap">
                                                        {article.content}
                                                    </p>
                                                </div>
                                                
                                                {article.sourceLink && (
                                                    <a 
                                                        href={article.sourceLink} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="mt-2 text-[#00897B] font-bold text-[0.85rem] uppercase tracking-wide self-start"
                                                    >
                                                        {currentT.read_more} &rarr;
                                                    </a>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
}