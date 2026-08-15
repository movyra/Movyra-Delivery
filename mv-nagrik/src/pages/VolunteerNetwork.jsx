import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Users, Plus, CheckCircle, MapPin, Briefcase } from 'lucide-react';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

export default function VolunteerNetwork() {
    const navigate = useNavigate();
    const [lang, setLang] = useState('en');
    const [volunteers, setVolunteers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Form State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        skills: '',
        availability: 'Weekends',
        contact: ''
    });

    // Language Synchronization
    useEffect(() => {
        const savedLang = localStorage.getItem('nagrik_lang') || navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'hinglish', 'mr', 'gu', 'te', 'ta', 'kn', 'ml', 'bn', 'pa', 'or', 'as', 'ur', 'bho'];
        if (supported.includes(savedLang)) setLang(savedLang);
    }, []);

    // Real-Time Database Connection
    useEffect(() => {
        const q = query(collection(db, 'volunteer_network'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setVolunteers(fetchedData);
            setLoading(false);
        }, (error) => {
            console.error("Database sync failed:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // 15-Language Translation Dictionary
    const t = {
        en: { title: "Volunteer Network", join: "Join Network", name: "Full Name", skills: "Primary Skills", avail: "Availability", contact: "Contact Number", submit: "Register Now", fetching: "Loading volunteers...", active: "Active Volunteer", weekends: "Weekends", weekdays: "Weekdays", anytime: "Anytime" },
        hi: { title: "स्वयंसेवक नेटवर्क", join: "नेटवर्क से जुड़ें", name: "पूरा नाम", skills: "प्राथमिक कौशल", avail: "उपलब्धता", contact: "संपर्क नंबर", submit: "अभी पंजीकरण करें", fetching: "स्वयंसेवकों को लोड किया जा रहा है...", active: "सक्रिय स्वयंसेवक", weekends: "सप्ताहांत", weekdays: "कार्यदिवस", anytime: "कभी भी" },
        hinglish: { title: "Volunteer Network", join: "Network Join Karein", name: "Full Name", skills: "Skills", avail: "Availability", contact: "Contact Number", submit: "Register Karein", fetching: "Load ho raha hai...", active: "Active Volunteer", weekends: "Weekends", weekdays: "Weekdays", anytime: "Anytime" },
        mr: { title: "स्वयंसेवक नेटवर्क", join: "नेटवर्कमध्ये सामील व्हा", name: "पूर्ण नाव", skills: "प्राथमिक कौशल्ये", avail: "उपलब्धता", contact: "संपर्क क्रमांक", submit: "आता नोंदणी करा", fetching: "स्वयंसेवक लोड होत आहेत...", active: "सक्रिय स्वयंसेवक", weekends: "शनिवार-रविवार", weekdays: "आठवड्याचे दिवस", anytime: "कधीही" },
        gu: { title: "સ્વયંસેવક નેટવર્ક", join: "નેટવર્કમાં જોડાઓ", name: "પૂરું નામ", skills: "પ્રાથમિક કૌશલ્ય", avail: "ઉપલબ્ધતા", contact: "સંપર્ક નંબર", submit: "હવે નોંધણી કરો", fetching: "સ્વયંસેવકો લોડ થઈ રહ્યા છે...", active: "સક્રિય સ્વયંસેવક", weekends: "સપ્તાહાંત", weekdays: "અઠવાડિયાના દિવસો", anytime: "ગમે ત્યારે" },
        te: { title: "వాలంటీర్ నెట్‌వర్క్", join: "నెట్‌వర్క్‌లో చేరండి", name: "పూర్తి పేరు", skills: "ప్రాథమిక నైపుణ్యాలు", avail: "లభ్యత", contact: "సంప్రదింపు నంబర్", submit: "ఇప్పుడే నమోదు చేయండి", fetching: "వాలంటీర్లను లోడ్ చేస్తోంది...", active: "చురుకైన వాలంటీర్", weekends: "వారాంతాలు", weekdays: "వారపు రోజులు", anytime: "ఎప్పుడైనా" },
        ta: { title: "தன்னார்வலர் நெட்வொர்க்", join: "நெட்வொர்க்கில் சேரவும்", name: "முழு பெயர்", skills: "முதன்மை திறன்கள்", avail: "கிடைக்கும் நேரம்", contact: "தொடர்பு எண்", submit: "இப்போது பதிவு செய்", fetching: "தன்னார்வலர்கள் ஏற்றப்படுகிறார்கள்...", active: "செயலில் உள்ள தன்னார்வலர்", weekends: "வார இறுதி", weekdays: "வார நாட்கள்", anytime: "எந்த நேரத்திலும்" },
        kn: { title: "ಸ್ವಯಂಸೇವಕ ನೆಟ್‌ವರ್ಕ್", join: "ನೆಟ್‌ವರ್ಕ್ ಸೇರಿ", name: "ಪೂರ್ಣ ಹೆಸರು", skills: "ಪ್ರಾಥಮಿಕ ಕೌಶಲ್ಯಗಳು", avail: "ಲಭ್ಯತೆ", contact: "ಸಂಪರ್ಕ ಸಂಖ್ಯೆ", submit: "ಈಗ ನೋಂದಾಯಿಸಿ", fetching: "ಸ್ವಯಂಸೇವಕರು ಲೋಡ್ ಆಗುತ್ತಿದ್ದಾರೆ...", active: "ಸಕ್ರಿಯ ಸ್ವಯಂಸೇವಕ", weekends: "ವಾರಾಂತ್ಯಗಳು", weekdays: "ವಾರದ ದಿನಗಳು", anytime: "ಯಾವಾಗಲಾದರೂ" },
        ml: { title: "വോളണ്ടിയർ നെറ്റ്‌വർക്ക്", join: "നെറ്റ്‌വർക്കിൽ ചേരുക", name: "പൂർണ്ണ പേര്", skills: "പ്രാഥമിക കഴിവുകൾ", avail: "ലഭ്യത", contact: "കോൺടാക്റ്റ് നമ്പർ", submit: "ഇപ്പോൾ രജിസ്റ്റർ ചെയ്യുക", fetching: "വോളന്റിയർമാരെ ലോഡുചെയ്യുന്നു...", active: "സജീവ വോളണ്ടിയർ", weekends: "വാരാന്ത്യങ്ങൾ", weekdays: "പ്രവൃത്തിദിവസങ്ങൾ", anytime: "എപ്പോൾ വേണമെങ്കിലും" },
        bn: { title: "স্বেচ্ছাসেবক নেটওয়ার্ক", join: "নেটওয়ার্কে যোগ দিন", name: "পুরো নাম", skills: "প্রাথমিক দক্ষতা", avail: "প্রাপ্যতা", contact: "যোগাযোগের নম্বর", submit: "এখন নিবন্ধন করুন", fetching: "স্বেচ্ছাসেবক লোড হচ্ছে...", active: "সক্রিয় স্বেচ্ছাসেবক", weekends: "সপ্তাহান্ত", weekdays: "সপ্তাহের দিন", anytime: "যেকোনো সময়" },
        pa: { title: "ਵਲੰਟੀਅਰ ਨੈੱਟਵਰਕ", join: "ਨੈੱਟਵਰਕ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋਵੋ", name: "ਪੂਰਾ ਨਾਮ", skills: "ਮੁੱਢਲੇ ਹੁਨਰ", avail: "ਉਪਲਬਧਤਾ", contact: "ਸੰਪਰਕ ਨੰਬਰ", submit: "ਹੁਣੇ ਰਜਿਸਟਰ ਕਰੋ", fetching: "ਵਲੰਟੀਅਰ ਲੋਡ ਹੋ ਰਹੇ ਹਨ...", active: "ਸਰਗਰਮ ਵਲੰਟੀਅਰ", weekends: "ਵੀਕਐਂਡ", weekdays: "ਹਫਤੇ ਦੇ ਦਿਨ", anytime: "ਕਿਸੇ ਵੀ ਸਮੇਂ" },
        or: { title: "ସ୍ୱେଚ୍ଛାସେବୀ ନେଟୱାର୍କ", join: "ନେଟୱାର୍କରେ ଯୋଗ ଦିଅନ୍ତୁ", name: "ପୂରା ନାମ", skills: "ପ୍ରାଥମିକ ଦକ୍ଷତା", avail: "ଉପଲବ୍ଧତା", contact: "ଯୋଗାଯୋଗ ନମ୍ବର", submit: "ବର୍ତ୍ତମାନ ପଞ୍ଜିକରଣ କରନ୍ତୁ", fetching: "ସ୍ୱେଚ୍ଛାସେବୀମାନଙ୍କୁ ଲୋଡ୍ କରାଯାଉଛି...", active: "ସକ୍ରିୟ ସ୍ୱେଚ୍ଛାସେବୀ", weekends: "ସପ୍ତାହନ୍ତ", weekdays: "କାର୍ଯ୍ୟ ଦିବସ", anytime: "ଯେକୌଣସି ସମୟରେ" },
        as: { title: "স্বেচ্ছাসেৱক নেটৱৰ্ক", join: "নেটৱৰ্কত যোগদান কৰক", name: "সম্পূৰ্ণ নাম", skills: "প্ৰাথমিক দক্ষতা", avail: "উপলব্ধতা", contact: "যোগাযোগৰ নম্বৰ", submit: "এতিয়া পঞ্জীয়ন কৰক", fetching: "স্বেচ্ছাসেৱকসকলক লোড কৰা হৈছে...", active: "সক্ৰিয় স্বেচ্ছাসেৱক", weekends: "সপ্তাহান্তিক", weekdays: "কৰ্মদিন", anytime: "যিকোনো সময়তে" },
        ur: { title: "رضاکار نیٹ ورک", join: "نیٹ ورک میں شامل ہوں", name: "پورا نام", skills: "ابتدائی مہارتیں", avail: "دستیابی", contact: "رابطہ نمبر", submit: "ابھی رجسٹر کریں", fetching: "رضاکار لوڈ ہو رہے ہیں۔۔۔", active: "فعال رضاکار", weekends: "اختتام ہفتہ", weekdays: "ہفتے کے دن", anytime: "کسی بھی وقت" },
        bho: { title: "स्वयंसेवक नेटवर्क", join: "नेटवर्क से जुड़ीं", name: "पूरा नाम", skills: "प्राथमिक कौशल", avail: "उपलब्धता", contact: "संपर्क नंबर", submit: "अभी पंजीकरण करीं", fetching: "स्वयंसेवक लोड हो रहल बाड़े...", active: "सक्रिय स्वयंसेवक", weekends: "सप्ताहांत", weekdays: "कार्यदिवस", anytime: "कबो भी" }
    };

    const currentT = t[lang] || t['en'];

    // Data Submission Logic
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.fullName || !formData.contact) return;
        
        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'volunteer_network'), {
                userId: auth.currentUser?.uid || 'guest',
                fullName: formData.fullName,
                skills: formData.skills,
                availability: formData.availability,
                contact: formData.contact,
                status: 'Active',
                createdAt: serverTimestamp()
            });
            setFormData({ fullName: '', skills: '', availability: 'Weekends', contact: '' });
            setShowForm(false);
        } catch (error) {
            console.error("Submission failed:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FFFFFF] font-sans text-[#111111]">
            
            {/* Standard Header */}
            <div className="w-full flex items-center justify-between px-6 pt-12 pb-4 border-b border-[#111111]/5 sticky top-0 bg-[#FFFFFF] z-30">
                <button onClick={() => navigate(-1)} className="text-[#00897B] outline-none active:scale-95 transition-transform">
                    <ChevronLeft size={28} strokeWidth={2.5} />
                </button>
                <span className="font-black text-[1.2rem] tracking-tight">{currentT.title}</span>
                <button 
                    onClick={() => setShowForm(!showForm)} 
                    className="text-[#00897B] outline-none bg-[#00897B]/10 p-2 rounded-full active:scale-95 transition-transform"
                >
                    <Plus size={22} strokeWidth={2.5} />
                </button>
            </div>

            {/* Submission Form Overlay */}
            <AnimatePresence>
                {showForm && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-[#F9FAFB] border-b border-[#111111]/10"
                    >
                        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                            <input type="text" placeholder={currentT.name} value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} required className="w-full bg-[#FFFFFF] border border-[#111111]/20 rounded-lg p-3 text-[0.95rem] outline-none focus:border-[#00897B]" />
                            <input type="text" placeholder={currentT.skills} value={formData.skills} onChange={(e) => setFormData({...formData, skills: e.target.value})} required className="w-full bg-[#FFFFFF] border border-[#111111]/20 rounded-lg p-3 text-[0.95rem] outline-none focus:border-[#00897B]" />
                            
                            <select value={formData.availability} onChange={(e) => setFormData({...formData, availability: e.target.value})} className="w-full bg-[#FFFFFF] border border-[#111111]/20 rounded-lg p-3 text-[0.95rem] outline-none focus:border-[#00897B] appearance-none">
                                <option value="Weekends">{currentT.weekends}</option>
                                <option value="Weekdays">{currentT.weekdays}</option>
                                <option value="Anytime">{currentT.anytime}</option>
                            </select>

                            <input type="tel" placeholder={currentT.contact} value={formData.contact} onChange={(e) => setFormData({...formData, contact: e.target.value})} required className="w-full bg-[#FFFFFF] border border-[#111111]/20 rounded-lg p-3 text-[0.95rem] outline-none focus:border-[#00897B]" />
                            
                            <button type="submit" disabled={isSubmitting} className="w-full bg-[#00897B] text-[#FFFFFF] font-black py-4 rounded-lg mt-2 active:scale-95 transition-transform disabled:opacity-50 tracking-wide uppercase text-sm">
                                {isSubmitting ? "..." : currentT.submit}
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Real-Time Feed */}
            <div className="p-6 flex flex-col gap-4">
                {loading ? (
                    <div className="w-full text-center py-10">
                        <div className="w-8 h-8 border-4 border-[#111111]/10 border-t-[#00897B] rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-sm font-bold text-[#111111]/50">{currentT.fetching}</p>
                    </div>
                ) : (
                    volunteers.map((person) => (
                        <motion.div 
                            key={person.id} 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#FFFFFF] border border-[#111111]/10 rounded-xl p-5 shadow-sm flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="flex items-center gap-1 px-3 py-1 text-[0.7rem] font-black uppercase tracking-wider rounded-full bg-[#00897B]/10 text-[#00897B]">
                                    <CheckCircle size={12} strokeWidth={3} /> {currentT.active}
                                </span>
                                <span className="text-[0.75rem] font-bold text-[#111111]/40">
                                    {person.createdAt ? new Date(person.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                                </span>
                            </div>
                            
                            <h3 className="text-[1.15rem] font-black text-[#111111] mb-1 leading-tight flex items-center gap-2">
                                <Users size={18} className="text-[#00897B]" /> {person.fullName}
                            </h3>
                            
                            <div className="flex items-start gap-2 mt-2">
                                <Briefcase size={16} className="text-[#111111]/50 shrink-0 mt-0.5" />
                                <p className="text-[0.9rem] font-medium text-[#111111]/70 leading-relaxed">{person.skills}</p>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-4 bg-[#F9FAFB] p-3 rounded-lg border border-[#111111]/5">
                                <MapPin size={16} className="text-[#FFB300]" strokeWidth={2.5} />
                                <span className="text-[0.85rem] font-bold text-[#111111] tracking-wide">{person.availability}</span>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}