import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { useCivicStore } from '../../store/useCivicStore';
import { 
    Camera, 
    MapPin, 
    AlertTriangle, 
    Send, 
    LogOut,
    X,
    Globe,
    ArrowUp,
    Save,
    CheckCircle
} from 'lucide-react';

export default function SahayReport() {
    const navigate = useNavigate();
    
    // 1. STATE MANAGEMENT
    const theme = useCivicStore((state) => state.theme);
    const terminateSession = useCivicStore((state) => state.terminateSession);

    const [lang, setLang] = useState('en');
    const [showLangPrompt, setShowLangPrompt] = useState(false);
    const [showProductsPrompt, setShowProductsPrompt] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    
    // Form State
    const [formData, setFormData] = useState({
        category: '',
        address: '',
        lat: null,
        lng: null,
        danger: 'No',
        description: ''
    });
    
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const fileInputRef = useRef(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [submitStatus, setSubmitStatus] = useState('IDLE');
    const [estimatedSeverity, setEstimatedSeverity] = useState('Low');
    const [draftSavedMessage, setDraftSavedMessage] = useState(false);

    // 2. AUTHENTICATION & INITIALIZATION
    useEffect(() => {
        const sysLang = navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'hinglish', 'mr', 'gu', 'te', 'ta', 'pa', 'bho', 'ar', 'es', 'fr', 'de'];
        if (supported.includes(sysLang)) setLang(sysLang);

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUser(user);
            } else {
                navigate('/sahay/auth');
            }
        });

        const savedDraft = localStorage.getItem('sahay_report_draft');
        if (savedDraft) {
            try {
                const parsed = JSON.parse(savedDraft);
                setFormData(parsed);
            } catch (e) {
                console.error("Draft parsing failed.");
            }
        }

        return () => unsubscribe();
    }, [navigate]);

    // 3. OFFLINE DRAFT & SEVERITY ESTIMATION ENGINE
    useEffect(() => {
        if (formData.category || formData.address || formData.description) {
            localStorage.setItem('sahay_report_draft', JSON.stringify(formData));
            setDraftSavedMessage(true);
            const timer = setTimeout(() => setDraftSavedMessage(false), 2000);
            return () => clearTimeout(timer);
        }

        let severity = 'Low';
        const descLower = formData.description.toLowerCase();
        const criticalWords = ['bleeding', 'unconscious', 'not breathing', 'accident', 'dying', 'attacked', 'severe'];
        const urgentWords = ['injured', 'sick', 'crying', 'fever', 'cannot move', 'starving'];

        const hasCritical = criticalWords.some(word => descLower.includes(word));
        const hasUrgent = urgentWords.some(word => descLower.includes(word));

        if (formData.danger === 'Yes' || hasCritical) {
            severity = 'Critical';
        } else if (hasUrgent) {
            severity = 'Urgent';
        } else if (formData.category) {
            severity = 'Moderate';
        }

        setEstimatedSeverity(severity);
    }, [formData]);

    // 4. FUNCTIONAL LOGIC
    const handleSignOut = async () => {
        try {
            await signOut(auth);
            terminateSession();
            navigate('/sahay/home');
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    const handlePhotoCapture = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPhotoPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const getLocation = () => {
        setIsLocating(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData(prev => ({
                        ...prev,
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        address: "Location captured via GPS"
                    }));
                    setIsLocating(false);
                },
                (error) => {
                    console.error("GPS Error:", error);
                    alert(currentT.gps_err);
                    setIsLocating(false);
                },
                { enableHighAccuracy: true }
            );
        } else {
            alert("GPS not supported.");
            setIsLocating(false);
        }
    };

    const uploadToPocketBase = async (file) => {
        const pbUrl = import.meta.env.VITE_POCKETBASE_URL || 'https://your-pocketbase-instance.com';
        const formData = new FormData();
        formData.append('media', file);
        
        try {
            const response = await fetch(`${pbUrl}/api/collections/sahay_media/records`, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            return data.id; 
        } catch (error) {
            console.warn("PocketBase upload failed.");
            return null;
        }
    };

    const submitReport = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('IDLE');

        try {
            let mediaId = null;
            if (photoFile) {
                mediaId = await uploadToPocketBase(photoFile);
            }

            await addDoc(collection(db, 'sahay_cases'), {
                userId: currentUser.uid,
                category: formData.category,
                address: formData.address,
                location: formData.lat ? { lat: formData.lat, lng: formData.lng } : null,
                danger: formData.danger,
                description: formData.description,
                severity: estimatedSeverity,
                mediaId: mediaId,
                status: 'Reported',
                createdAt: serverTimestamp()
            });

            localStorage.removeItem('sahay_report_draft');
            setFormData({ category: '', address: '', lat: null, lng: null, danger: 'No', description: '' });
            setPhotoFile(null);
            setPhotoPreview(null);
            
            setSubmitStatus('SUCCESS');
            
        } catch (error) {
            console.error("Submission error:", error);
            setSubmitStatus('ERROR');
        } finally {
            setIsSubmitting(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // 5. 13-LANGUAGE DICTIONARY (Simple Consumer Context)
    const t = {
        en: {
            lang: "English", log_out: "Log out", careers: "Careers", products: "Products", back: "Back to Home",
            title: "Report a Need", sub: "Help us connect them with verified rescue teams quickly.",
            draft_saved: "Draft Saved", gps_err: "Could not get location. Please type the address.",
            lbl_cat: "Who needs help?", cat_1: "Homeless Person", cat_2: "Abandoned Elderly", cat_3: "Injured Animal", cat_4: "Medical Emergency",
            lbl_photo: "Photo Evidence", btn_photo: "Take Photo / Upload",
            lbl_loc: "Where are they?", btn_gps: "Use My Current Location", ph_address: "Or type exact address and landmarks...",
            lbl_danger: "Are they in immediate danger?",
            lbl_desc: "Details", ph_desc: "Describe their condition, age, injuries, or any helpful details...",
            lbl_severity: "Urgency:",
            btn_submit: "Send Report", btn_loading: "Sending Data...",
            succ_title: "Report Received", succ_sub: "Organizations have been notified. Thank you.", btn_new: "Report Another"
        },
        hi: {
            lang: "हिन्दी", log_out: "लॉग आउट", careers: "करियर", products: "उत्पाद", back: "होम पर वापस जाएं",
            title: "जरूरत की रिपोर्ट करें", sub: "उन्हें बचाव टीमों से जल्दी जोड़ने में हमारी मदद करें।",
            draft_saved: "ड्राफ्ट सेव हुआ", gps_err: "लोकेशन नहीं मिल सका। कृपया पता टाइप करें।",
            lbl_cat: "किसे मदद चाहिए?", cat_1: "बेघर व्यक्ति", cat_2: "अकेले बुजुर्ग", cat_3: "घायल जानवर", cat_4: "चिकित्सा आपातकाल",
            lbl_photo: "फोटो प्रमाण", btn_photo: "फोटो लें / अपलोड करें",
            lbl_loc: "वे कहाँ हैं?", btn_gps: "मेरा वर्तमान स्थान उपयोग करें", ph_address: "या सटीक पता और लैंडमार्क टाइप करें...",
            lbl_danger: "क्या वे तत्काल खतरे में हैं?",
            lbl_desc: "विवरण", ph_desc: "उनकी स्थिति, उम्र, चोटों का वर्णन करें...",
            lbl_severity: "तात्कालिकता:",
            btn_submit: "रिपोर्ट भेजें", btn_loading: "डेटा भेजा जा रहा है...",
            succ_title: "रिपोर्ट प्राप्त हुई", succ_sub: "संगठनों को सूचित कर दिया गया है। धन्यवाद।", btn_new: "एक और रिपोर्ट करें"
        },
        hinglish: {
            lang: "Hinglish", log_out: "Log out", careers: "Careers", products: "Products", back: "Home par wapas",
            title: "Report Darj Karein", sub: "Unhe rescue teams se jaldi connect karne mein help karein.",
            draft_saved: "Draft Save Ho Gaya", gps_err: "Location nahi mil paayi. Kripya address type karein.",
            lbl_cat: "Kisko help chahiye?", cat_1: "Homeless Person", cat_2: "Abandoned Elderly", cat_3: "Injured Animal", cat_4: "Medical Emergency",
            lbl_photo: "Photo Evidence", btn_photo: "Photo Lein / Upload",
            lbl_loc: "Wo kahan hain?", btn_gps: "Mera Current Location Use Karein", ph_address: "Ya exact address type karein...",
            lbl_danger: "Kya wo immediate danger mein hain?",
            lbl_desc: "Details", ph_desc: "Unki condition, age, injuries batayein...",
            lbl_severity: "Urgency:",
            btn_submit: "Report Send Karein", btn_loading: "Bhej rahe hain...",
            succ_title: "Report Mil Gayi", succ_sub: "Organizations ko notify kar diya gaya hai. Shukriya.", btn_new: "Dusri Report Karein"
        }
    };

    const currentT = t[lang] || t['en'];
    const languageOptions = [
        { code: 'en', label: 'English' }, { code: 'hi', label: 'हिन्दी' }, { code: 'hinglish', label: 'Hinglish' }
    ];

    const getSeverityColor = (sev) => {
        if (sev === 'Critical') return 'text-[#DC2626] bg-[#DC2626]/10 border-[#DC2626]';
        if (sev === 'Urgent') return 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]';
        return 'text-[#16A34A] bg-[#16A34A]/10 border-[#16A34A]';
    };

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
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/sahay/home')}>
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
                    {draftSavedMessage && (
                        <div className="hidden md:flex items-center gap-2 text-[#16A34A] text-[0.8rem] animate-pulse">
                            <Save size={14} /> {currentT.draft_saved}
                        </div>
                    )}
                    <button onClick={() => setShowLangPrompt(true)} className="flex items-center gap-2 text-[#555555] hover:text-[#111111] transition-colors outline-none px-3 py-1.5 rounded-full border border-[#E5E7EB] hover:border-[#111111]">
                        <Globe size={14} /> <span className="hidden sm:inline">{currentT.lang}</span>
                    </button>
                    {currentUser && (
                        <>
                            {/* Desktop Logout Text */}
                            <button onClick={handleSignOut} className="text-[#555555] hover:text-[#111111] transition-colors outline-none hidden sm:block">
                                {currentT.log_out}
                            </button>
                            {/* Mobile Logout Icon */}
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

            <main className="flex-1 w-full max-w-[800px] mx-auto px-6 md:px-12 py-12 animate-fade">
                
                <button onClick={() => navigate('/sahay/home')} className="flex items-center gap-2 mb-8 outline-none font-bold text-[0.9rem] text-[#555555] hover:text-[#111111] transition-colors">
                    <ArrowLeft size={16} /> {currentT.back}
                </button>

                {submitStatus === 'SUCCESS' ? (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#F7F7F7] border border-[#E5E7EB] rounded-3xl p-12 text-center flex flex-col items-center">
                        <CheckCircle size={64} className="text-[#16A34A] mb-6" />
                        <h2 className="text-[2rem] font-black tracking-tight mb-2 text-[#111111]">{currentT.succ_title}</h2>
                        <p className="text-[#555555] text-[1.1rem] mb-8">{currentT.succ_sub}</p>
                        <button onClick={() => setSubmitStatus('IDLE')} className="bg-[#FF6B35] text-[#FFFFFF] px-8 py-3 rounded-full font-bold hover:bg-[#E85D2A] transition-colors outline-none">
                            {currentT.btn_new}
                        </button>
                    </motion.div>
                ) : (
                    <>
                        <div className="mb-10">
                            <h1 className="text-[2.5rem] md:text-[3.5rem] font-black leading-[1.1] tracking-tighter mb-4 text-[#111111]">
                                {currentT.title}
                            </h1>
                            <p className="text-[1.1rem] text-[#555555] font-medium">
                                {currentT.sub}
                            </p>
                        </div>

                        <form onSubmit={submitReport} className="flex flex-col gap-8 bg-[#F7F7F7] p-6 md:p-10 rounded-3xl border border-[#E5E7EB]">
                            
                            {/* Category Selection */}
                            <div>
                                <label className="block text-[0.85rem] font-bold uppercase tracking-wider text-[#555555] mb-3">{currentT.lbl_cat}</label>
                                <select 
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                    className="w-full p-4 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] text-[#111111] font-bold text-[0.95rem] outline-none focus:border-[#FF6B35] transition-colors appearance-none cursor-pointer"
                                >
                                    <option value="" disabled hidden>Select Category</option>
                                    <option value="Homeless">{currentT.cat_1}</option>
                                    <option value="Elderly">{currentT.cat_2}</option>
                                    <option value="Animal">{currentT.cat_3}</option>
                                    <option value="Medical">{currentT.cat_4}</option>
                                </select>
                            </div>

                            {/* Photo Capture */}
                            <div>
                                <label className="block text-[0.85rem] font-bold uppercase tracking-wider text-[#555555] mb-3">{currentT.lbl_photo}</label>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    capture="environment" 
                                    ref={fileInputRef} 
                                    onChange={handlePhotoCapture} 
                                    className="hidden" 
                                />
                                {photoPreview ? (
                                    <div className="relative w-full h-48 rounded-xl overflow-hidden border border-[#E5E7EB]">
                                        <img src={photoPreview} alt="Evidence" className="w-full h-full object-cover" />
                                        <button 
                                            type="button" 
                                            onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                                            className="absolute top-2 right-2 w-8 h-8 bg-[#111111] rounded-full flex items-center justify-center text-[#FFFFFF] hover:bg-[#DC2626] transition-colors outline-none"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                        type="button" 
                                        onClick={() => fileInputRef.current.click()}
                                        className="w-full p-8 rounded-xl bg-[#FFFFFF] border-2 border-dashed border-[#D1D5DB] hover:border-[#FF6B35] hover:bg-[#FF6B35]/5 flex flex-col items-center justify-center gap-3 transition-colors outline-none text-[#555555] hover:text-[#FF6B35]"
                                    >
                                        <Camera size={32} />
                                        <span className="font-bold text-[0.95rem]">{currentT.btn_photo}</span>
                                    </button>
                                )}
                            </div>

                            {/* Location GPS */}
                            <div>
                                <label className="block text-[0.85rem] font-bold uppercase tracking-wider text-[#555555] mb-3">{currentT.lbl_loc}</label>
                                <div className="flex flex-col gap-3">
                                    <button 
                                        type="button" 
                                        onClick={getLocation}
                                        disabled={isLocating}
                                        className="w-full p-4 rounded-xl bg-[#E5E7EB] text-[#111111] font-bold text-[0.95rem] flex items-center justify-center gap-2 hover:bg-[#D1D5DB] transition-colors outline-none disabled:opacity-50"
                                    >
                                        {isLocating ? <div className="w-4 h-4 border-2 border-t-transparent border-[#111111] rounded-full animate-spin"></div> : <MapPin size={18} className="text-[#00A9F7]" />}
                                        {currentT.btn_gps}
                                    </button>
                                    <input 
                                        type="text" 
                                        required 
                                        placeholder={currentT.ph_address}
                                        value={formData.address}
                                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                                        className="w-full p-4 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] text-[#111111] font-bold text-[0.95rem] outline-none focus:border-[#FF6B35] transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Danger Toggle */}
                            <div>
                                <label className="block text-[0.85rem] font-bold uppercase tracking-wider text-[#555555] mb-3">{currentT.lbl_danger}</label>
                                <div className="flex gap-4">
                                    <button 
                                        type="button" 
                                        onClick={() => setFormData({...formData, danger: 'Yes'})}
                                        className={`flex-1 p-4 rounded-xl font-black text-[1rem] border transition-colors outline-none ${
                                            formData.danger === 'Yes' ? 'bg-[#DC2626] text-[#FFFFFF] border-[#DC2626]' : 'bg-[#FFFFFF] text-[#555555] border-[#E5E7EB] hover:border-[#DC2626]'
                                        }`}
                                    >
                                        YES
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setFormData({...formData, danger: 'No'})}
                                        className={`flex-1 p-4 rounded-xl font-black text-[1rem] border transition-colors outline-none ${
                                            formData.danger === 'No' ? 'bg-[#16A34A] text-[#FFFFFF] border-[#16A34A]' : 'bg-[#FFFFFF] text-[#555555] border-[#E5E7EB] hover:border-[#16A34A]'
                                        }`}
                                    >
                                        NO
                                    </button>
                                </div>
                            </div>

                            {/* Details & AI Severity */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-[0.85rem] font-bold uppercase tracking-wider text-[#555555]">{currentT.lbl_desc}</label>
                                    {formData.description.length > 5 && (
                                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[0.7rem] font-bold border ${getSeverityColor(estimatedSeverity)}`}>
                                            <AlertTriangle size={12} /> {currentT.lbl_severity} {estimatedSeverity}
                                        </div>
                                    )}
                                </div>
                                <textarea 
                                    required
                                    rows="4"
                                    placeholder={currentT.ph_desc}
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    className="w-full p-4 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] text-[#111111] font-medium text-[0.95rem] outline-none focus:border-[#FF6B35] transition-colors resize-none"
                                ></textarea>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="w-full bg-[#FF6B35] text-[#FFFFFF] py-4 rounded-xl font-black text-[1.1rem] flex items-center justify-center gap-2 hover:bg-[#E85D2A] transition-colors disabled:opacity-50 outline-none mt-4 shadow-lg shadow-[#FF6B35]/20"
                            >
                                {isSubmitting ? (
                                    <><div className="w-5 h-5 border-2 border-t-transparent border-[#FFFFFF] rounded-full animate-spin"></div> {currentT.btn_loading}</>
                                ) : (
                                    <><Send size={18} /> {currentT.btn_submit}</>
                                )}
                            </button>

                        </form>
                    </>
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