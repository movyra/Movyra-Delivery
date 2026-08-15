import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, MapPin, Plus, Droplets, UtilityPole, Hospital, TreePine } from 'lucide-react';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

export default function PublicAmenities() {
    const navigate = useNavigate();
    const [lang, setLang] = useState('en');
    const [amenities, setAmenities] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Form State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        category: 'Restroom',
        name: '',
        address: ''
    });

    // Language Synchronization
    useEffect(() => {
        const savedLang = localStorage.getItem('nagrik_lang') || navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'hinglish', 'mr', 'gu', 'te', 'ta', 'kn', 'ml', 'bn', 'pa', 'or', 'as', 'ur', 'bho'];
        if (supported.includes(savedLang)) setLang(savedLang);
    }, []);

    // Real-Time Database Connection
    useEffect(() => {
        const q = query(collection(db, 'public_amenities'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAmenities(fetchedData);
            setLoading(false);
        }, (error) => {
            console.error("Database sync failed:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // 15-Language Translation Dictionary
    const t = {
        en: { title: "Public Amenities", suggest: "Suggest Amenity", name: "Facility Name", address: "Full Address", submit: "Submit Location", fetching: "Loading facilities...", restroom: "Restroom", clinic: "Clinic", park: "Park", water: "Water Station" },
        hi: { title: "सार्वजनिक सुविधाएं", suggest: "सुविधा सुझाएं", name: "सुविधा का नाम", address: "पूरा पता", submit: "स्थान जमा करें", fetching: "सुविधाएं लोड हो रही हैं...", restroom: "शौचालय", clinic: "क्लिनिक", park: "पार्क", water: "जल केंद्र" },
        hinglish: { title: "Public Amenities", suggest: "Amenity Suggest Karein", name: "Facility Name", address: "Pura Address", submit: "Location Submit Karein", fetching: "Load ho raha hai...", restroom: "Restroom", clinic: "Clinic", park: "Park", water: "Water Station" },
        mr: { title: "सार्वजनिक सुविधा", suggest: "सुचवा", name: "सुविधेचे नाव", address: "संपूर्ण पत्ता", submit: "स्थान सबमिट करा", fetching: "सुविधा लोड होत आहेत...", restroom: "शौचालय", clinic: "दवाखाना", park: "पार्क", water: "पाणी केंद्र" },
        gu: { title: "જાહેર સુવિધાઓ", suggest: "સુવિધા સૂચવો", name: "સુવિધાનું નામ", address: "સંપૂર્ણ સરનામું", submit: "સ્થાન સબમિટ કરો", fetching: "સુવિધાઓ લોડ થઈ રહી છે...", restroom: "શૌચાલય", clinic: "ક્લિનિક", park: "પાર્ક", water: "પાણી કેન્દ્ર" },
        te: { title: "ప్రజా సౌకర్యాలు", suggest: "సౌకర్యాన్ని సూచించండి", name: "సౌకర్యం పేరు", address: "పూర్తి చిరునామా", submit: "స్థానాన్ని సమర్పించండి", fetching: "సౌకర్యాలు లోడ్ అవుతున్నాయి...", restroom: "విశ్రాంతి గది", clinic: "క్లినిక్", park: "పార్క్", water: "నీటి కేంద్రం" },
        ta: { title: "பொது வசதிகள்", suggest: "வசதியை பரிந்துரைக்கவும்", name: "வசதியின் பெயர்", address: "முழு முகவரி", submit: "இடத்தை சமர்ப்பிக்கவும்", fetching: "வசதிகள் ஏற்றப்படுகின்றன...", restroom: "கழிப்பறை", clinic: "கிளினிக்", park: "பூங்கா", water: "நீர் நிலையம்" },
        kn: { title: "ಸಾರ್ವಜನಿಕ ಸೌಲಭ್ಯಗಳು", suggest: "ಸೌಲಭ್ಯವನ್ನು ಸೂಚಿಸಿ", name: "ಸೌಲಭ್ಯದ ಹೆಸರು", address: "ಪೂರ್ಣ ವಿಳಾಸ", submit: "ಸ್ಥಳವನ್ನು ಸಲ್ಲಿಸಿ", fetching: "ಸೌಲಭ್ಯಗಳು ಲೋಡ್ ಆಗುತ್ತಿವೆ...", restroom: "ಶೌಚಾಲಯ", clinic: "ಕ್ಲಿನಿಕ್", park: "ಉದ್ಯಾನ", water: "ನೀರಿನ ಕೇಂದ್ರ" },
        ml: { title: "പൊതു സൗകര്യങ്ങൾ", suggest: "സൗകര്യം നിർദ്ദേശിക്കുക", name: "സൗകര്യത്തിന്റെ പേര്", address: "പൂർണ്ണ വിലാസം", submit: "സ്ഥലം സമർപ്പിക്കുക", fetching: "സൗകര്യങ്ങൾ ലോഡുചെയ്യുന്നു...", restroom: "ശൗചാലയം", clinic: "ക്ലിനിക്ക്", park: "പാർക്ക്", water: "ജല കേന്ദ്രം" },
        bn: { title: "সর্বজনীন সুবিধা", suggest: "সুবিধার পরামর্শ দিন", name: "সুবিধার নাম", address: "পূর্ণ ঠিকানা", submit: "অবস্থান জমা দিন", fetching: "সুবিধা লোড হচ্ছে...", restroom: "শৌচাগার", clinic: "ক্লিনিক", park: "পার্ক", water: "জলের স্টেশন" },
        pa: { title: "ਜਨਤਕ ਸਹੂਲਤਾਂ", suggest: "ਸਹੂਲਤ ਦਾ ਸੁਝਾਅ ਦਿਓ", name: "ਸਹੂਲਤ ਦਾ ਨਾਮ", address: "ਪੂਰਾ ਪਤਾ", submit: "ਸਥਾਨ ਜਮ੍ਹਾਂ ਕਰੋ", fetching: "ਸਹੂਲਤਾਂ ਲੋਡ ਹੋ ਰਹੀਆਂ ਹਨ...", restroom: "ਵਾਸ਼ਰੂਮ", clinic: "ਕਲੀਨਿਕ", park: "ਪਾਰਕ", water: "ਵਾਟਰ ਸਟੇਸ਼ਨ" },
        or: { title: "ସାର୍ବଜନୀନ ସୁବିଧା", suggest: "ସୁବିଧା ପରାମର୍ଶ ଦିଅନ୍ତୁ", name: "ସୁବିଧା ନାମ", address: "ସମ୍ପୂର୍ଣ୍ଣ ଠିକଣା", submit: "ସ୍ଥାନ ଦାଖଲ କରନ୍ତୁ", fetching: "ସୁବିଧା ଲୋଡ୍ ହେଉଛି...", restroom: "ଶୌଚାଳୟ", clinic: "କ୍ଲିନିକ୍", park: "ପାର୍କ", water: "ଜଳ କେନ୍ଦ୍ର" },
        as: { title: "ৰাজহুৱা সুবিধা", suggest: "সুবিধাৰ পৰামৰশ দিয়ক", name: "সুবিধাৰ নাম", address: "সম্পূৰ্ণ ঠিকনা", submit: "অৱস্থান দাখিল কৰক", fetching: "সুবিধাসমূহ লোড হৈ আছে...", restroom: "শৌচালয়", clinic: "ক্লিনিক", park: "পাৰ্ক", water: "পানীৰ ষ্টেচন" },
        ur: { title: "عوامی سہولیات", suggest: "سہولت تجویز کریں", name: "سہولت کا نام", address: "مکمل پتہ", submit: "مقام جمع کریں", fetching: "سہولیات لوڈ ہو رہی ہیں۔۔۔", restroom: "بیت الخلاء", clinic: "کلینک", park: "پارک", water: "واٹر اسٹیشن" },
        bho: { title: "सार्वजनिक सुविधा", suggest: "सुविधा सुझाईं", name: "सुविधा के नाम", address: "पूरा पता", submit: "स्थान जमा करीं", fetching: "सुविधा लोड हो रहल बा...", restroom: "शौचालय", clinic: "क्लिनिक", park: "पार्क", water: "जल केंद्र" }
    };

    const currentT = t[lang] || t['en'];

    const getCategoryIcon = (category) => {
        switch(category) {
            case 'Restroom': return <UtilityPole size={24} className="text-[#00897B]" />;
            case 'Clinic': return <Hospital size={24} className="text-[#00897B]" />;
            case 'Park': return <TreePine size={24} className="text-[#00897B]" />;
            case 'Water Station': return <Droplets size={24} className="text-[#00897B]" />;
            default: return <MapPin size={24} className="text-[#00897B]" />;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.address) return;
        
        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'public_amenities'), {
                userId: auth.currentUser?.uid || 'guest',
                category: formData.category,
                name: formData.name.trim(),
                address: formData.address.trim(),
                status: 'Active',
                createdAt: serverTimestamp()
            });
            setFormData({ category: 'Restroom', name: '', address: '' });
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
                            <select 
                                value={formData.category} 
                                onChange={(e) => setFormData({...formData, category: e.target.value})} 
                                className="w-full bg-[#FFFFFF] border border-[#111111]/20 rounded-lg p-3 text-[0.95rem] outline-none focus:border-[#00897B] appearance-none"
                            >
                                <option value="Restroom">{currentT.restroom}</option>
                                <option value="Clinic">{currentT.clinic}</option>
                                <option value="Park">{currentT.park}</option>
                                <option value="Water Station">{currentT.water}</option>
                            </select>

                            <input 
                                type="text" 
                                placeholder={currentT.name} 
                                value={formData.name} 
                                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                                required 
                                className="w-full bg-[#FFFFFF] border border-[#111111]/20 rounded-lg p-3 text-[0.95rem] outline-none focus:border-[#00897B]" 
                            />
                            
                            <textarea 
                                placeholder={currentT.address} 
                                value={formData.address} 
                                onChange={(e) => setFormData({...formData, address: e.target.value})} 
                                required 
                                className="w-full bg-[#FFFFFF] border border-[#111111]/20 rounded-lg p-3 text-[0.95rem] outline-none focus:border-[#00897B] min-h-[80px]" 
                            />
                            
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
                    amenities.map((item) => (
                        <motion.div 
                            key={item.id} 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#FFFFFF] border border-[#111111]/10 rounded-xl p-5 shadow-sm flex items-start gap-4"
                        >
                            <div className="w-12 h-12 rounded-full bg-[#00897B]/10 flex items-center justify-center shrink-0">
                                {getCategoryIcon(item.category)}
                            </div>
                            
                            <div className="flex flex-col flex-1 pt-1">
                                <h3 className="text-[1.1rem] font-black text-[#111111] mb-1 leading-tight">{item.name}</h3>
                                
                                <div className="flex items-start gap-1 mt-1">
                                    <MapPin size={14} className="text-[#111111]/40 shrink-0 mt-0.5" />
                                    <p className="text-[0.85rem] font-medium text-[#111111]/70 leading-relaxed">{item.address}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}