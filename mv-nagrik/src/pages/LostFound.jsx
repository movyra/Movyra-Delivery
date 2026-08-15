import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Search, Plus, MapPin, Phone, Info } from 'lucide-react';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

export default function LostFound() {
    const navigate = useNavigate();
    const [lang, setLang] = useState('en');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Form State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        type: 'Lost',
        title: '',
        description: '',
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
        const q = query(collection(db, 'lost_found'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedItems = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setItems(fetchedItems);
            setLoading(false);
        }, (error) => {
            console.error("Database sync failed:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // 15-Language Translation Dictionary
    const t = {
        en: { title: "Lost and Found", report: "Report Item", item_name: "Item Name", desc: "Description", contact: "Contact Number", submit: "Submit Report", lost: "Lost", found: "Found", fetching: "Loading records..." },
        hi: { title: "खोया और पाया", report: "वस्तु की रिपोर्ट करें", item_name: "वस्तु का नाम", desc: "विवरण", contact: "संपर्क नंबर", submit: "जमा करें", lost: "खो गया", found: "मिल गया", fetching: "रिकॉर्ड लोड हो रहे हैं..." },
        hinglish: { title: "Khoya aur Paya", report: "Item Report Karein", item_name: "Item Name", desc: "Details", contact: "Contact Number", submit: "Submit Karein", lost: "Lost", found: "Found", fetching: "Load ho raha hai..." },
        mr: { title: "हरवले आणि सापडले", report: "वस्तूची नोंद करा", item_name: "वस्तूचे नाव", desc: "तपशील", contact: "संपर्क क्रमांक", submit: "सबमिट करा", lost: "हरवले", found: "सापडले", fetching: "रेकॉर्ड लोड होत आहेत..." },
        gu: { title: "ખોવાયેલ અને મળેલ", report: "વસ્તુની જાણ કરો", item_name: "વસ્તુનું નામ", desc: "વિગતો", contact: "સંપર્ક નંબર", submit: "સબમિટ કરો", lost: "ખોવાયેલ", found: "મળેલ", fetching: "રેકોર્ડ લોડ થઈ રહ્યા છે..." },
        te: { title: "లాస్ట్ అండ్ ఫౌండ్", report: "వస్తువును నివేదించండి", item_name: "వస్తువు పేరు", desc: "వివరాలు", contact: "సంప్రదింపు నంబర్", submit: "సమర్పించండి", lost: "కోల్పోయిన", found: "దొరికిన", fetching: "రికార్డులు లోడ్ అవుతున్నాయి..." },
        ta: { title: "தொலைந்த மற்றும் கண்டறியப்பட்டவை", report: "பொருளைப் புகாரளி", item_name: "பொருள் பெயர்", desc: "விவரங்கள்", contact: "தொடர்பு எண்", submit: "சமர்ப்பி", lost: "தொலைந்த", found: "கண்டறியப்பட்ட", fetching: "பதிவுகள் ஏற்றப்படுகின்றன..." },
        kn: { title: "ಕಳೆದುಹೋದ ಮತ್ತು ಸಿಕ್ಕಿದ", report: "ವಸ್ತುವನ್ನು ವರದಿ ಮಾಡಿ", item_name: "ವಸ್ತುವಿನ ಹೆಸರು", desc: "ವಿವರಗಳು", contact: "ಸಂಪರ್ಕ ಸಂಖ್ಯೆ", submit: "ಸಲ್ಲಿಸಿ", lost: "ಕಳೆದುಹೋದ", found: "ಸಿಕ್ಕಿದ", fetching: "ದಾಖಲೆಗಳು ಲೋಡ್ ಆಗುತ್ತಿವೆ..." },
        ml: { title: "ലോസ്റ്റ് ആൻഡ് ഫൗണ്ട്", report: "വസ്തു റിപ്പോർട്ട് ചെയ്യുക", item_name: "വസ്തുവിന്റെ പേര്", desc: "വിശദാംശങ്ങൾ", contact: "കോൺടാക്റ്റ് നമ്പർ", submit: "സമർപ്പിക്കുക", lost: "നഷ്ടപ്പെട്ട", found: "കണ്ടെത്തിയ", fetching: "രേഖകൾ ലോഡുചെയ്യുന്നു..." },
        bn: { title: "হারানো ও প্রাপ্তি", report: "বস্তুর রিপোর্ট করুন", item_name: "বস্তুর নাম", desc: "বিবরণ", contact: "যোগাযোগের নম্বর", submit: "জমা দিন", lost: "হারানো", found: "প্রাপ্ত", fetching: "রেকর্ড লোড হচ্ছে..." },
        pa: { title: "ਗੁੰਮਿਆ ਅਤੇ ਮਿਲਿਆ", report: "ਆਈਟਮ ਦੀ ਰਿਪੋਰਟ ਕਰੋ", item_name: "ਆਈਟਮ ਦਾ ਨਾਮ", desc: "ਵੇਰਵੇ", contact: "ਸੰਪਰਕ ਨੰਬਰ", submit: "ਜਮ੍ਹਾਂ ਕਰੋ", lost: "ਗੁੰਮਿਆ", found: "ਮਿਲਿਆ", fetching: "ਰਿਕਾਰਡ ਲੋਡ ਹੋ ਰਹੇ ਹਨ..." },
        or: { title: "ହଜିଥିବା ଏବଂ ମିଳିଥିବା", report: "ଆଇଟମ୍ ରିପୋର୍ଟ କରନ୍ତୁ", item_name: "ଆଇଟମ୍ ନାମ", desc: "ବିବରଣୀ", contact: "ଯୋଗାଯୋଗ ନମ୍ବର", submit: "ଦାଖଲ କରନ୍ତୁ", lost: "ହଜିଥିବା", found: "ମିଳିଥିବା", fetching: "ରେକର୍ଡ ଲୋଡ୍ ହେଉଛି..." },
        as: { title: "হেৰুওৱা আৰু পোৱা", report: "বস্তুৰ প্ৰতিবেদন দিয়ক", item_name: "বস্তুৰ নাম", desc: "বিৱৰণ", contact: "যোগাযোগৰ নম্বৰ", submit: "দাখিল কৰক", lost: "হেৰুওৱা", found: "পোৱা", fetching: "ৰেকৰ্ডসমূহ লোড হৈ আছে..." },
        ur: { title: "گمشدہ اور دریافت", report: "آئٹم کی رپورٹ کریں", item_name: "آئٹم کا نام", desc: "تفصیلات", contact: "رابطہ نمبر", submit: "جمع کریں", lost: "گمشدہ", found: "دریافت", fetching: "ریکارڈ لوڈ ہو رہے ہیں۔۔۔" },
        bho: { title: "हेराइल आ मिलल", report: "सामान के रिपोर्ट करीं", item_name: "सामान के नाम", desc: "विवरण", contact: "संपर्क नंबर", submit: "जमा करीं", lost: "हेराइल", found: "मिलल", fetching: "रिकॉर्ड लोड हो रहल बा..." }
    };

    const currentT = t[lang] || t['en'];

    // Data Submission Logic
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.contact) return;
        
        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'lost_found'), {
                userId: auth.currentUser?.uid || 'guest',
                type: formData.type,
                title: formData.title,
                description: formData.description,
                contact: formData.contact,
                status: 'Active',
                createdAt: serverTimestamp()
            });
            setFormData({ type: 'Lost', title: '', description: '', contact: '' });
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
                            <div className="flex bg-[#FFFFFF] rounded-lg p-1 border border-[#111111]/20">
                                <button type="button" onClick={() => setFormData({...formData, type: 'Lost'})} className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${formData.type === 'Lost' ? 'bg-[#111111] text-[#FFFFFF]' : 'text-[#111111]/60'}`}>{currentT.lost}</button>
                                <button type="button" onClick={() => setFormData({...formData, type: 'Found'})} className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${formData.type === 'Found' ? 'bg-[#00897B] text-[#FFFFFF]' : 'text-[#111111]/60'}`}>{currentT.found}</button>
                            </div>
                            
                            <input type="text" placeholder={currentT.item_name} value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required className="w-full bg-[#FFFFFF] border border-[#111111]/20 rounded-lg p-3 text-[0.95rem] outline-none focus:border-[#00897B]" />
                            <textarea placeholder={currentT.desc} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required className="w-full bg-[#FFFFFF] border border-[#111111]/20 rounded-lg p-3 text-[0.95rem] outline-none focus:border-[#00897B] min-h-[100px]" />
                            <input type="tel" placeholder={currentT.contact} value={formData.contact} onChange={(e) => setFormData({...formData, contact: e.target.value})} required className="w-full bg-[#FFFFFF] border border-[#111111]/20 rounded-lg p-3 text-[0.95rem] outline-none focus:border-[#00897B]" />
                            
                            <button type="submit" disabled={isSubmitting} className="w-full bg-[#FFB300] text-[#111111] font-black py-4 rounded-lg mt-2 active:scale-95 transition-transform disabled:opacity-50 tracking-wide uppercase text-sm">
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
                    items.map((item) => (
                        <motion.div 
                            key={item.id} 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#FFFFFF] border border-[#111111]/10 rounded-xl p-5 shadow-sm"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className={`px-3 py-1 text-[0.7rem] font-black uppercase tracking-wider rounded-full ${item.type === 'Lost' ? 'bg-[#111111] text-[#FFFFFF]' : 'bg-[#00897B] text-[#FFFFFF]'}`}>
                                    {item.type === 'Lost' ? currentT.lost : currentT.found}
                                </span>
                                <span className="text-[0.75rem] font-bold text-[#111111]/40">
                                    {item.createdAt ? new Date(item.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                                </span>
                            </div>
                            <h3 className="text-[1.1rem] font-black text-[#111111] mb-2 leading-tight">{item.title}</h3>
                            <p className="text-[0.9rem] font-medium text-[#111111]/70 mb-4 leading-relaxed">{item.description}</p>
                            
                            <div className="flex items-center gap-2 bg-[#F9FAFB] p-3 rounded-lg border border-[#111111]/5">
                                <Phone size={16} className="text-[#00897B]" />
                                <span className="text-[0.85rem] font-bold text-[#111111] tracking-wide">{item.contact}</span>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}