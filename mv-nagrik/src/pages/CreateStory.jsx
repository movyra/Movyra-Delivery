import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Camera, EyeOff, Eye, CheckCircle, Shield } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

export default function CreateStory() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [lang, setLang] = useState('en');
    const [isAnonymous, setIsAnonymous] = useState(false);

    // Media Upload State
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [mediaType, setMediaType] = useState('image'); 
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Language Synchronization
    useEffect(() => {
        const savedLang = localStorage.getItem('nagrik_lang') || navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'hinglish', 'mr', 'gu', 'te', 'ta', 'kn', 'ml', 'bn', 'pa', 'or', 'as', 'ur', 'bho'];
        if (supported.includes(savedLang)) setLang(savedLang);
    }, []);

    // 15 Comprehensive Indian Language Translations (Strictly Professional, No Emojis)
    const t = {
        en: { header: "New Story", capture: "Select Media", anon_title: "Hide Identity", anon_sub: "Publish anonymously", submit: "Publish Story", uploading: "Publishing...", err_media: "Please select a file.", err_auth: "Authentication required." },
        hi: { header: "नई स्टोरी", capture: "मीडिया चुनें", anon_title: "पहचान छिपाएं", anon_sub: "गुमनाम रूप से प्रकाशित करें", submit: "स्टोरी प्रकाशित करें", uploading: "प्रकाशित हो रहा है...", err_media: "कृपया एक फ़ाइल चुनें।", err_auth: "प्रमाणीकरण आवश्यक है।" },
        hinglish: { header: "New Story", capture: "Media Chunein", anon_title: "Identity Hide Karein", anon_sub: "Anonymous publish karein", submit: "Story Publish Karein", uploading: "Publish ho raha hai...", err_media: "Ek file choose karein.", err_auth: "Authentication zaroori hai." },
        mr: { header: "नवीन स्टोरी", capture: "मीडिया निवडा", anon_title: "ओळख लपवा", anon_sub: "अनामिकपणे प्रकाशित करा", submit: "स्टोरी प्रकाशित करा", uploading: "प्रकाशित करत आहे...", err_media: "कृपया फाइल निवडा.", err_auth: "प्रमाणीकरण आवश्यक आहे." },
        gu: { header: "નવી સ્ટોરી", capture: "મીડિયા પસંદ કરો", anon_title: "ઓળખ છુપાવો", anon_sub: "અનામી રીતે પ્રકાશિત કરો", submit: "સ્ટોરી પ્રકાશિત કરો", uploading: "પ્રકાશિત થઈ રહ્યું છે...", err_media: "કૃપા કરીને ફાઇલ પસંદ કરો.", err_auth: "પ્રમાણીકરણ જરૂરી છે." },
        te: { header: "కొత్త స్టోరీ", capture: "మీడియాను ఎంచుకోండి", anon_title: "గుర్తింపు దాచు", anon_sub: "అనామకంగా ప్రచురించండి", submit: "స్టోరీ ప్రచురించండి", uploading: "ప్రచురిస్తోంది...", err_media: "దయచేసి ఫైల్‌ను ఎంచుకోండి.", err_auth: "ప్రామాణీకరణ అవసరం." },
        ta: { header: "புதிய கதை", capture: "மீடியாவைத் தேர்ந்தெடு", anon_title: "அடையாளத்தை மறை", anon_sub: "அநாமதேயமாக வெளியிடு", submit: "கதையை வெளியிடு", uploading: "வெளியிடப்படுகிறது...", err_media: "ஒரு கோப்பைத் தேர்ந்தெடுக்கவும்.", err_auth: "அங்கீகாரம் தேவை." },
        kn: { header: "ಹೊಸ ಕಥೆ", capture: "ಮಾಧ್ಯಮ ಆಯ್ಕೆಮಾಡಿ", anon_title: "ಗುರುತನ್ನು ಮರೆಮಾಡಿ", anon_sub: "ಅನಾಮಧೇಯವಾಗಿ ಪ್ರಕಟಿಸಿ", submit: "ಕಥೆ ಪ್ರಕಟಿಸಿ", uploading: "ಪ್ರಕಟಿಸಲಾಗುತ್ತಿದೆ...", err_media: "ದಯವಿಟ್ಟು ಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ.", err_auth: "ದೃಢೀಕರಣದ ಅಗತ್ಯವಿದೆ." },
        ml: { header: "പുതിയ സ്റ്റോറി", capture: "മീഡിയ തിരഞ്ഞെടുക്കുക", anon_title: "ഐഡന്റിറ്റി മറയ്ക്കുക", anon_sub: "അജ്ഞാതമായി പ്രസിദ്ധീകരിക്കുക", submit: "സ്റ്റോറി പ്രസിദ്ധീകരിക്കുക", uploading: "പ്രസിദ്ധീകരിക്കുന്നു...", err_media: "ഒരു ഫയൽ തിരഞ്ഞെടുക്കുക.", err_auth: "ആധികാരികത ഉറപ്പാക്കേണ്ടതുണ്ട്." },
        bn: { header: "নতুন স্টোরি", capture: "মিডিয়া নির্বাচন করুন", anon_title: "পরিচয় লুকান", anon_sub: "বেনামে প্রকাশ করুন", submit: "স্টোরি প্রকাশ করুন", uploading: "প্রকাশ করা হচ্ছে...", err_media: "অনুগ্রহ করে একটি ফাইল নির্বাচন করুন।", err_auth: "যাচাইকরণ প্রয়োজন।" },
        pa: { header: "ਨਵੀਂ ਸਟੋਰੀ", capture: "ਮੀਡੀਆ ਚੁਣੋ", anon_title: "ਪਛਾਣ ਲੁਕਾਓ", anon_sub: "ਅਗਿਆਤ ਰੂਪ ਵਿੱਚ ਪ੍ਰਕਾਸ਼ਿਤ ਕਰੋ", submit: "ਸਟੋਰੀ ਪ੍ਰਕਾਸ਼ਿਤ ਕਰੋ", uploading: "ਪ੍ਰਕਾਸ਼ਿਤ ਹੋ ਰਿਹਾ ਹੈ...", err_media: "ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਫਾਈਲ ਚੁਣੋ।", err_auth: "ਪ੍ਰਮਾਣਿਕਤਾ ਲੋੜੀਂਦੀ ਹੈ।" },
        or: { header: "ନୂଆ ଷ୍ଟୋରୀ", capture: "ମିଡିଆ ଚୟନ କରନ୍ତୁ", anon_title: "ପରିଚୟ ଲୁଚାନ୍ତୁ", anon_sub: "ଅଜ୍ଞାତ ଭାବରେ ପ୍ରକାଶ କରନ୍ତୁ", submit: "ଷ୍ଟୋରୀ ପ୍ରକାଶ କରନ୍ତୁ", uploading: "ପ୍ରକାଶିତ ହେଉଛି...", err_media: "ଦୟାକରି ଏକ ଫାଇଲ୍ ଚୟନ କରନ୍ତୁ।", err_auth: "ପ୍ରମାଣୀକରଣ ଆବଶ୍ୟକ।" },
        as: { header: "নতুন ষ্টোৰী", capture: "মিডিয়া বাছনি কৰক", anon_title: "পৰিচয় লুকুৱাওক", anon_sub: "বেনামীভাৱে প্ৰকাশ কৰক", submit: "ষ্টোৰী প্ৰকাশ কৰক", uploading: "প্ৰকাশ হৈ আছে...", err_media: "অনুগ্ৰহ কৰি এটা ফাইল বাছনি কৰক।", err_auth: "প্ৰমাণীকৰণ প্ৰয়োজনীয়।" },
        ur: { header: "نئی اسٹوری", capture: "میڈیا منتخب کریں", anon_title: "شناخت چھپائیں", anon_sub: "گمنام طور پر شائع کریں", submit: "اسٹوری شائع کریں", uploading: "شائع ہو رہا ہے۔۔۔", err_media: "براہ کرم ایک فائل منتخب کریں۔", err_auth: "تصدیق درکار ہے۔" },
        bho: { header: "नया स्टोरी", capture: "मीडिया चुनीं", anon_title: "पहचान छिपाईं", anon_sub: "गुमनाम रूप से प्रकाशित करीं", submit: "स्टोरी प्रकाशित करीं", uploading: "प्रकाशित हो रहल बा...", err_media: "कृपया एगो फाइल चुनीं।", err_auth: "प्रमाणीकरण जरूरी बा।" }
    };

    const currentT = t[lang] || t['en'];

    // Handle File Selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setErrorMessage('');
        setSelectedFile(file);

        if (file.type.startsWith('video/')) {
            setMediaType('video');
        } else {
            setMediaType('image');
        }

        const localUrl = URL.createObjectURL(file);
        setPreviewUrl(localUrl);
    };

    // Remove Selected Media
    const handleRemoveMedia = () => {
        setSelectedFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Form Submission & Upload Handler
    const handleSubmit = async () => {
        setErrorMessage('');

        if (!selectedFile) {
            setErrorMessage(currentT.err_media);
            return;
        }

        const currentUser = auth.currentUser;
        if (!currentUser) {
            setErrorMessage(currentT.err_auth);
            return;
        }

        setIsSubmitting(true);

        try {
            const userId = currentUser.uid;
            const userDisplayName = currentUser.displayName || currentUser.email?.split('@')[0] || 'Citizen';

            // 1. Upload media strictly to Hugging Face PocketBase instance (stories_media collection)
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('user_id', userId);

            const pbResponse = await fetch('https://movyra-mv-main-db-gradio.hf.space/api/collections/stories_media/records', {
                method: 'POST',
                body: formData
            });

            if (!pbResponse.ok) {
                throw new Error("External storage upload failed.");
            }

            const pbRecord = await pbResponse.json();
            const mediaUrl = `https://movyra-mv-main-db-gradio.hf.space/api/files/${pbRecord.collectionId}/${pbRecord.id}/${pbRecord.file}`;

            // 2. Write metadata to Firestore collection
            await addDoc(collection(db, 'nagrik_reels'), {
                authorId: userId,
                authorName: isAnonymous ? 'Hidden Citizen' : userDisplayName,
                mediaUrl: mediaUrl,
                type: mediaType,
                isAnonymous: isAnonymous,
                isStory: true, // Distinguishes 24-hour stories from standard feed posts
                location: 'Local Update',
                likes: 0,
                createdAt: serverTimestamp()
            });

            navigate('/feed');
        } catch (err) {
            console.error("Story submission failed:", err);
            setErrorMessage("Failed to publish story. Verify connection.");
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed inset-0 z-50 bg-[#111111] font-sans text-[#FFFFFF] flex flex-col"
        >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-30 p-4 flex items-center justify-between bg-gradient-to-b from-[#111111]/80 to-transparent">
                <button onClick={() => navigate(-1)} className="w-10 h-10 bg-[#FFFFFF]/10 backdrop-blur-md rounded-full flex items-center justify-center outline-none active:scale-95 transition-transform">
                    <X size={24} className="text-[#FFFFFF]" />
                </button>
                <span className="font-black text-[1.1rem] tracking-tight drop-shadow-md">{currentT.header}</span>
                <div className="w-10"></div> {/* Spacer for centering */}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-[#111111]">
                
                {errorMessage && (
                    <div className="absolute top-20 left-4 right-4 z-40 p-3.5 bg-red-500/90 backdrop-blur-md border border-red-400 text-[#FFFFFF] text-sm font-bold rounded-xl text-center shadow-lg">
                        {errorMessage}
                    </div>
                )}

                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/jpeg,image/png,image/webp,video/mp4" 
                    capture="environment"
                    className="hidden" 
                />

                {!previewUrl ? (
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center gap-4 outline-none active:scale-95 transition-transform"
                    >
                        <div className="w-20 h-20 rounded-full bg-[#FFFFFF]/10 border border-[#FFFFFF]/20 flex items-center justify-center text-[#FFFFFF]">
                            <Camera size={36} strokeWidth={1.5} />
                        </div>
                        <span className="font-bold text-[1rem] tracking-wide text-[#FFFFFF]">{currentT.capture}</span>
                    </button>
                ) : (
                    <div className="w-full h-full relative">
                        {mediaType === 'image' ? (
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <video src={previewUrl} controls className="w-full h-full object-cover" autoPlay loop muted playsInline />
                        )}
                        <button 
                            type="button" 
                            onClick={handleRemoveMedia} 
                            className="absolute top-20 right-4 w-10 h-10 bg-[#111111]/60 backdrop-blur-md text-[#FFFFFF] rounded-full flex items-center justify-center outline-none shadow-md z-40 border border-[#FFFFFF]/20"
                        >
                            <X size={20} />
                        </button>
                    </div>
                )}
            </div>

            {/* Bottom Action Bar */}
            <div className="bg-[#111111] pb-8 pt-4 px-6 rounded-t-3xl border-t border-[#FFFFFF]/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-40 relative">
                
                {/* Anonymous Toggle */}
                <div 
                    onClick={() => setIsAnonymous(!isAnonymous)}
                    className={`w-full p-4 rounded-xl border mb-6 flex items-center justify-between cursor-pointer transition-all ${isAnonymous ? 'bg-[#FFFFFF]/10 border-[#FFB300]/50 text-[#FFFFFF]' : 'bg-[#FFFFFF]/5 border-[#FFFFFF]/10 text-[#FFFFFF]'}`}
                >
                    <div className="flex items-center gap-3">
                        {isAnonymous ? <EyeOff size={22} className="text-[#FFB300]" /> : <Eye size={22} className="text-[#FFFFFF]/60" />}
                        <div className="flex flex-col">
                            <span className="font-black text-[0.9rem] leading-tight flex items-center gap-1.5">
                                {currentT.anon_title}
                                {!isAnonymous && <Shield size={12} className="text-[#00897B]" fill="#00897B" />}
                            </span>
                            <span className={`text-[0.75rem] ${isAnonymous ? 'text-[#FFFFFF]/70' : 'text-[#FFFFFF]/50'}`}>{currentT.anon_sub}</span>
                        </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${isAnonymous ? 'bg-[#FFB300] border-[#FFB300] text-[#111111]' : 'border-[#FFFFFF]/30'}`}>
                        {isAnonymous && <CheckCircle size={16} strokeWidth={3} />}
                    </div>
                </div>

                {/* Submit Button */}
                <button 
                    onClick={handleSubmit}
                    disabled={!previewUrl || isSubmitting} 
                    className="w-full bg-[#00897B] text-[#FFFFFF] font-black py-4 rounded-xl active:scale-95 transition-transform disabled:opacity-50 tracking-wide uppercase text-sm shadow-md flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <div className="w-5 h-5 border-2 border-[#FFFFFF]/30 border-t-[#FFFFFF] rounded-full animate-spin"></div>
                            {currentT.uploading}
                        </>
                    ) : (
                        <>
                            <Upload size={18} />
                            {currentT.submit}
                        </>
                    )}
                </button>
            </div>
        </motion.div>
    );
}