import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Trash2, Users, Video, AlertTriangle, Edit2 } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [lang, setLang] = useState('en');
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [activeTab, setActiveTab] = useState('reports');

    // Data States
    const [reports, setReports] = useState([]);
    const [reels, setReels] = useState([]);
    const [usersList, setUsersList] = useState([]);

    // Language Synchronization
    useEffect(() => {
        const savedLang = localStorage.getItem('nagrik_lang') || navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'hinglish', 'mr', 'gu', 'te', 'ta', 'kn', 'ml', 'bn', 'pa', 'or', 'as', 'ur', 'bho'];
        if (supported.includes(savedLang)) setLang(savedLang);

        const handleStorageChange = () => {
            const newLang = localStorage.getItem('nagrik_lang');
            if (newLang && supported.includes(newLang)) setLang(newLang);
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Super Admin Gateway Verification
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user && user.email === 'testcodecfg@gmail.com') {
                setIsAdmin(true);
                fetchAdminData();
            } else {
                setIsAdmin(false);
                navigate('/home');
            }
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [navigate]);

    // Real-Time Moderation Data Fetching
    const fetchAdminData = () => {
        // Fetch Reports
        const qReports = query(collection(db, 'nagrik_reports'), orderBy('createdAt', 'desc'));
        onSnapshot(qReports, (snapshot) => setReports(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))));

        // Fetch Reels
        const qReels = query(collection(db, 'nagrik_reels'), orderBy('createdAt', 'desc'));
        onSnapshot(qReels, (snapshot) => setReels(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))));

        // Fetch Users (Assuming a root 'users' collection exists)
        const qUsers = query(collection(db, 'users'));
        onSnapshot(qUsers, (snapshot) => setUsersList(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))));
    };

    // 15 Comprehensive Indian Language Translations
    const t = {
        en: { title: "Super Admin Console", tab_rep: "Manage Reports", tab_reels: "Moderate Reels", tab_users: "User Base", load: "Verifying Security Clearance...", purge: "Purge Record", update: "Update Profile", no_data: "No records found in database.", cat: "Category:", desc: "Description:", author: "Author:", role: "Role:" },
        hi: { title: "सुपर एडमिन कंसोल", tab_rep: "रिपोर्ट प्रबंधित करें", tab_reels: "रील्स मॉडरेट करें", tab_users: "उपयोगकर्ता आधार", load: "सुरक्षा मंजूरी सत्यापित की जा रही है...", purge: "रिकॉर्ड हटाएं", update: "प्रोफ़ाइल अपडेट करें", no_data: "डेटाबेस में कोई रिकॉर्ड नहीं मिला।", cat: "श्रेणी:", desc: "विवरण:", author: "लेखक:", role: "भूमिका:" },
        hinglish: { title: "Super Admin Console", tab_rep: "Reports Manage Karein", tab_reels: "Reels Moderate Karein", tab_users: "User Base", load: "Security Clearance verify ho raha hai...", purge: "Record Purge Karein", update: "Profile Update Karein", no_data: "Database mein koi record nahi mila.", cat: "Category:", desc: "Description:", author: "Author:", role: "Role:" },
        mr: { title: "सुपर अॅडमिन कन्सोल", tab_rep: "अहवाल व्यवस्थापित करा", tab_reels: "रील्स नियंत्रित करा", tab_users: "वापरकर्ता आधार", load: "सुरक्षा मंजुरी पडताळत आहे...", purge: "रेकॉर्ड पुसून टाका", update: "प्रोफाइल अपडेट करा", no_data: "डेटाबेसमध्ये कोणतेही रेकॉर्ड आढळले नाही.", cat: "श्रेणी:", desc: "वर्णन:", author: "लेखक:", role: "भूमिका:" },
        gu: { title: "સુપર એડમિન કન્સોલ", tab_rep: "રિપોર્ટ્સ મેનેજ કરો", tab_reels: "રીલ્સ મોડરેટ કરો", tab_users: "વપરાશકર્તા આધાર", load: "સુરક્ષા મંજૂરી ચકાસી રહ્યા છીએ...", purge: "રેકોર્ડ સાફ કરો", update: "પ્રોફાઇલ અપડેટ કરો", no_data: "ડેટાબેઝમાં કોઈ રેકોર્ડ મળ્યો નથી.", cat: "શ્રેણી:", desc: "વર્ણન:", author: "લેખક:", role: "ભૂમિકા:" },
        te: { title: "సూపర్ అడ్మిన్ కన్సోల్", tab_rep: "నివేదికలను నిర్వహించండి", tab_reels: "రీల్స్ మోడరేట్ చేయండి", tab_users: "వినియోగదారు ఆధారం", load: "భద్రతా క్లియరెన్స్ నిర్ధారిస్తోంది...", purge: "రికార్డును తొలగించండి", update: "ప్రొఫైల్ నవీకరించండి", no_data: "డేటాబేస్లో రికార్డులు కనుగొనబడలేదు.", cat: "వర్గం:", desc: "వివరణ:", author: "రచయిత:", role: "పాత్ర:" },
        ta: { title: "சூப்பர் நிர்வாகி கன்சோல்", tab_rep: "அறிக்கைகளை நிர்வகி", tab_reels: "ரீல்களை மதிப்பாய்வு செய்", tab_users: "பயனர் தளம்", load: "பாதுகாப்பு அனுமதியை சரிபார்க்கிறது...", purge: "பதிவை அழிக்கவும்", update: "சுயவிவரத்தை புதுப்பிக்கவும்", no_data: "தரவுத்தளத்தில் எந்த பதிவும் இல்லை.", cat: "வகை:", desc: "விளக்கம்:", author: "ஆசிரியர்:", role: "பங்கு:" },
        kn: { title: "ಸೂಪರ್ ಅಡ್ಮಿನ್ ಕನ್ಸೋಲ್", tab_rep: "ವರದಿಗಳನ್ನು ನಿರ್ವಹಿಸಿ", tab_reels: "ರೀಲ್ಸ್ ಮಾಡರೇಟ್ ಮಾಡಿ", tab_users: "ಬಳಕೆದಾರರ ಮೂಲ", load: "ಭದ್ರತಾ ಕ್ಲಿಯರೆನ್ಸ್ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...", purge: "ದಾಖಲೆಯನ್ನು ಅಳಿಸಿ", update: "ಪ್ರೊಫೈಲ್ ನವೀಕರಿಸಿ", no_data: "ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ಯಾವುದೇ ದಾಖಲೆ ಕಂಡುಬಂದಿಲ್ಲ.", cat: "ವರ್ಗ:", desc: "ವಿವರಣೆ:", author: "ಲೇಖಕ:", role: "ಪಾತ್ರ:" },
        ml: { title: "സൂപ്പർ അഡ്മിൻ കൺസോൾ", tab_rep: "റിപ്പോർട്ടുകൾ നിയന്ത്രിക്കുക", tab_reels: "റീലുകൾ മോഡറേറ്റ് ചെയ്യുക", tab_users: "ഉപയോക്തൃ അടിത്തറ", load: "സുരക്ഷാ ക്ലിയറൻസ് പരിശോധിക്കുന്നു...", purge: "റെക്കോർഡ് മായ്‌ക്കുക", update: "പ്രൊഫൈൽ അപ്ഡേറ്റ് ചെയ്യുക", no_data: "ഡാറ്റാബേസിൽ റെക്കോർഡുകളൊന്നും കണ്ടെത്തിയില്ല.", cat: "വിഭാഗം:", desc: "വിവരണം:", author: "രചയിതാവ്:", role: "പങ്ക്:" },
        bn: { title: "সুপার অ্যাডমিন কনসোল", tab_rep: "রিপোর্ট পরিচালনা করুন", tab_reels: "রিল মডারেট করুন", tab_users: "ব্যবহারকারী বেস", load: "নিরাপত্তা ছাড়পত্র যাচাই করা হচ্ছে...", purge: "রেকর্ড মুছুন", update: "প্রোফাইল আপডেট করুন", no_data: "ডাটাবেসে কোনো রেকর্ড পাওয়া যায়নি।", cat: "বিভাগ:", desc: "বিবরণ:", author: "লেখক:", role: "ভূমিকা:" },
        pa: { title: "ਸੁਪਰ ਐਡਮਿਨ ਕੰਸੋਲ", tab_rep: "ਰਿਪੋਰਟਾਂ ਦਾ ਪ੍ਰਬੰਧ ਕਰੋ", tab_reels: "ਰੀਲਾਂ ਨੂੰ ਮੋਡਰੇਟ ਕਰੋ", tab_users: "ਉਪਭੋਗਤਾ ਆਧਾਰ", load: "ਸੁਰੱਖਿਆ ਮਨਜ਼ੂਰੀ ਦੀ ਜਾਂਚ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ...", purge: "ਰਿਕਾਰਡ ਮਿਟਾਓ", update: "ਪ੍ਰੋਫਾਈਲ ਅੱਪਡੇਟ ਕਰੋ", no_data: "ਡਾਟਾਬੇਸ ਵਿੱਚ ਕੋਈ ਰਿਕਾਰਡ ਨਹੀਂ ਮਿਲਿਆ।", cat: "ਸ਼੍ਰੇਣੀ:", desc: "ਵਰਣਨ:", author: "ਲੇਖਕ:", role: "ਭੂਮਿਕਾ:" },
        or: { title: "ସୁପର ଆଡମିନ କନସୋଲ", tab_rep: "ରିପୋର୍ଟ ପରିଚାଳନା କରନ୍ତୁ", tab_reels: "ରିଲ୍ସ ମଡରେଟ୍ କରନ୍ତୁ", tab_users: "ବ୍ୟବହାରକାରୀ ଆଧାର", load: "ସୁରକ୍ଷା କ୍ଲିୟରାନ୍ସ ଯାଞ୍ଚ ହେଉଛି...", purge: "ରେକର୍ଡ ଲିଭାନ୍ତୁ", update: "ପ୍ରୋଫାଇଲ୍ ଅପଡେଟ୍ କରନ୍ତୁ", no_data: "ଡାଟାବେସରେ କୌଣସି ରେକର୍ଡ ମିଳିଲା ନାହିଁ।", cat: "ବର୍ଗ:", desc: "ବିବରଣୀ:", author: "ଲେଖକ:", role: "ଭୂମିକା:" },
        as: { title: "ছুপাৰ এডমিন কনচোল", tab_rep: "প্ৰতিবেদন পৰিচালনা কৰক", tab_reels: "ৰিলছ মডাৰেট কৰক", tab_users: "ব্যৱহাৰকাৰীৰ ভিত্তি", load: "নিৰাপত্তা ক্লিয়াৰেন্স পৰীক্ষা কৰা হৈছে...", purge: "ৰেকৰ্ড মচি পেলাওক", update: "প্ৰফাইল আপডেট কৰক", no_data: "ডাটাবেচত কোনো ৰেকৰ্ড পোৱা নগ'ল।", cat: "শ্ৰেণী:", desc: "বিৱৰণ:", author: "লেখক:", role: "ভূমিকা:" },
        ur: { title: "سپر ایڈمن کنسول", tab_rep: "رپورٹس کا نظم کریں", tab_reels: "ریلز کو معتدل کریں", tab_users: "صارف کی بنیاد", load: "سیکیورٹی کلیئرنس کی تصدیق کی جا رہی ہے۔۔۔", purge: "ریکارڈ حذف کریں", update: "پروفائل اپ ڈیٹ کریں", no_data: "ڈیٹا بیس میں کوئی ریکارڈ نہیں ملا۔", cat: "زمرہ:", desc: "تفصیل:", author: "مصنف:", role: "کردار:" },
        bho: { title: "सुपर एडमिन कंसोल", tab_rep: "रिपोर्ट प्रबंधित करीं", tab_reels: "रील्स मॉडरेट करीं", tab_users: "उपयोगकर्ता आधार", load: "सुरक्षा मंजूरी सत्यापित हो रहल बा...", purge: "रिकॉर्ड मिटाईं", update: "प्रोफ़ाइल अपडेट करीं", no_data: "डेटाबेस में कवनो रिकॉर्ड ना मिलल।", cat: "श्रेणी:", desc: "विवरण:", author: "लेखक:", role: "भूमिका:" }
    };

    const currentT = t[lang] || t['en'];

    // Action Execution Methods
    const handlePurgeReport = async (id) => {
        if (window.confirm("Execute absolute purge on this report?")) {
            await deleteDoc(doc(db, 'nagrik_reports', id));
        }
    };

    const handlePurgeReel = async (id) => {
        if (window.confirm("Execute absolute purge on this reel?")) {
            await deleteDoc(doc(db, 'nagrik_reels', id));
        }
    };

    const handleUpdateUserStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
        if (window.confirm(`Update user status to ${newStatus.toUpperCase()}?`)) {
            await updateDoc(doc(db, 'users', id), { status: newStatus });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center text-[#FFFFFF]">
                <Shield size={48} className="text-[#00897B] mb-4 animate-pulse" />
                <span className="font-bold tracking-widest uppercase text-[0.9rem]">{currentT.load}</span>
            </div>
        );
    }

    if (!isAdmin) return null; // Fallback, router intercepts first

    return (
        <div className="min-h-screen bg-[#FFFFFF] font-sans text-[#111111] pb-32">
            
            {/* Admin Header */}
            <div className="bg-[#111111] text-[#FFFFFF] px-6 pt-12 pb-8 shadow-md border-b-4 border-[#FFB300]">
                <div className="max-w-[800px] mx-auto flex items-center gap-3">
                    <Shield size={28} className="text-[#FFB300]" />
                    <h1 className="text-[1.8rem] font-black tracking-tight uppercase">{currentT.title}</h1>
                </div>
            </div>

            <div className="max-w-[800px] mx-auto px-4 pt-6">
                
                {/* Navigation Tabs */}
                <div className="flex bg-[#111111]/5 rounded-xl p-1 mb-8 border border-[#111111]/10 overflow-x-auto no-scrollbar">
                    <button onClick={() => setActiveTab('reports')} className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 rounded-lg text-[0.85rem] font-bold transition-all outline-none ${activeTab === 'reports' ? 'bg-[#00897B] text-[#FFFFFF] shadow-md' : 'text-[#111111]/60'}`}>
                        <AlertTriangle size={16} /> {currentT.tab_rep}
                    </button>
                    <button onClick={() => setActiveTab('reels')} className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 rounded-lg text-[0.85rem] font-bold transition-all outline-none ${activeTab === 'reels' ? 'bg-[#00897B] text-[#FFFFFF] shadow-md' : 'text-[#111111]/60'}`}>
                        <Video size={16} /> {currentT.tab_reels}
                    </button>
                    <button onClick={() => setActiveTab('users')} className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 rounded-lg text-[0.85rem] font-bold transition-all outline-none ${activeTab === 'users' ? 'bg-[#00897B] text-[#FFFFFF] shadow-md' : 'text-[#111111]/60'}`}>
                        <Users size={16} /> {currentT.tab_users}
                    </button>
                </div>

                {/* Content Render Area */}
                <div className="flex flex-col gap-4">
                    
                    {/* REPORTS VIEW */}
                    {activeTab === 'reports' && (
                        reports.length === 0 ? <p className="text-center font-bold text-[#111111]/50 mt-10">{currentT.no_data}</p> :
                        reports.map(report => (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={report.id} className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#111111]/10 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                <div className="flex-1">
                                    <p className="text-[0.75rem] font-black text-[#00897B] uppercase tracking-wider mb-1">{report.id}</p>
                                    <p className="text-[0.9rem] font-bold text-[#111111] mb-1"><span className="text-[#111111]/50">{currentT.cat}</span> {report.category}</p>
                                    <p className="text-[0.85rem] text-[#111111]/80 line-clamp-2">{report.description}</p>
                                </div>
                                <button onClick={() => handlePurgeReport(report.id)} className="shrink-0 bg-[#111111] text-[#FFFFFF] px-4 py-2 rounded-lg font-bold text-[0.8rem] flex items-center gap-2 hover:bg-[#FFB300] hover:text-[#111111] transition-colors outline-none">
                                    <Trash2 size={16} /> {currentT.purge}
                                </button>
                            </motion.div>
                        ))
                    )}

                    {/* REELS VIEW */}
                    {activeTab === 'reels' && (
                        reels.length === 0 ? <p className="text-center font-bold text-[#111111]/50 mt-10">{currentT.no_data}</p> :
                        reels.map(reel => (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={reel.id} className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#111111]/10 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                <div className="flex-1">
                                    <p className="text-[0.75rem] font-black text-[#00897B] uppercase tracking-wider mb-1">{reel.id}</p>
                                    <p className="text-[0.9rem] font-bold text-[#111111] mb-1"><span className="text-[#111111]/50">{currentT.author}</span> {reel.authorName}</p>
                                    <p className="text-[0.85rem] font-bold text-[#111111]"><span className="text-[#111111]/50">Title:</span> {reel.title}</p>
                                </div>
                                <button onClick={() => handlePurgeReel(reel.id)} className="shrink-0 bg-[#111111] text-[#FFFFFF] px-4 py-2 rounded-lg font-bold text-[0.8rem] flex items-center gap-2 hover:bg-[#FFB300] hover:text-[#111111] transition-colors outline-none">
                                    <Trash2 size={16} /> {currentT.purge}
                                </button>
                            </motion.div>
                        ))
                    )}

                    {/* USERS VIEW */}
                    {activeTab === 'users' && (
                        usersList.length === 0 ? <p className="text-center font-bold text-[#111111]/50 mt-10">{currentT.no_data}</p> :
                        usersList.map(user => (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={user.id} className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#111111]/10 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                <div className="flex-1">
                                    <p className="text-[0.75rem] font-black text-[#00897B] uppercase tracking-wider mb-1">{user.id}</p>
                                    <p className="text-[0.9rem] font-bold text-[#111111] mb-1">{user.name || user.email || 'Unknown User'}</p>
                                    <p className="text-[0.85rem] font-bold text-[#111111]/50 uppercase">{user.status || 'Active'}</p>
                                </div>
                                <button onClick={() => handleUpdateUserStatus(user.id, user.status)} className="shrink-0 bg-[#FFFFFF] border-2 border-[#111111] text-[#111111] px-4 py-2 rounded-lg font-bold text-[0.8rem] flex items-center gap-2 hover:bg-[#111111] hover:text-[#FFFFFF] transition-colors outline-none">
                                    <Edit2 size={16} /> {currentT.update}
                                </button>
                            </motion.div>
                        ))
                    )}

                </div>
            </div>
        </div>
    );
}