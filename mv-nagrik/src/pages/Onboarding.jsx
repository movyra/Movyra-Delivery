import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebaseConfig'; // Ensure your firebaseConfig is initialized

export default function Onboarding() {
    const navigate = useNavigate();
    const [lang, setLang] = useState('en');
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    // Initialize language from local storage or browser preference
    useEffect(() => {
        const savedLang = localStorage.getItem('nagrik_lang') || navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'hinglish', 'mr', 'gu', 'te', 'ta', 'kn', 'ml', 'bn', 'pa', 'or', 'as', 'ur', 'bho'];
        if (supported.includes(savedLang)) {
            setLang(savedLang);
        }
    }, []);

    const changeLanguage = (newLang) => {
        setLang(newLang);
        localStorage.setItem('nagrik_lang', newLang);
        window.dispatchEvent(new Event('storage')); // Trigger global sync
    };

    // Authentication Workflows
    const handleGoogleSignIn = async () => {
        if (isAuthenticating) return;
        setIsAuthenticating(true);
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            navigate('/home');
        } catch (error) {
            console.error("Authentication failed:", error);
            alert("Google Sign-In failed. Please try again or continue as guest.");
        } finally {
            setIsAuthenticating(false);
        }
    };

    const handleGuestContinue = () => {
        navigate('/home');
    };

    // 15 Comprehensive Indian Language Translations
    const t = {
        en: { 
            title_part1: "Your ", title_highlight: "Voice", title_part2: " for a Better Community.", 
            sub: "Photos. Location. Proof.", slide_t: "Submit Reports", slide_d: "Spotted an issue in your community? Snap a photo and report it in a few taps.", 
            btn_google: "Continue with Google", btn_guest: "Continue as Guest", lang_select: "Language" 
        },
        hi: { 
            title_part1: "बेहतर समुदाय के लिए आपकी ", title_highlight: "आवाज़", title_part2: "।", 
            sub: "तस्वीरें। स्थान। प्रमाण।", slide_t: "रिपोर्ट जमा करें", slide_d: "अपने समुदाय में कोई समस्या देखी? एक फोटो लें और कुछ ही टैप में रिपोर्ट करें।", 
            btn_google: "Google के साथ जारी रखें", btn_guest: "अतिथि के रूप में जारी रखें", lang_select: "भाषा" 
        },
        hinglish: { 
            title_part1: "Behtar community ke liye aapki ", title_highlight: "Aawaz", title_part2: ".", 
            sub: "Photos. Location. Proof.", slide_t: "Report Submit Karein", slide_d: "Community mein koi issue dekha? Photo lein aur kuch taps mein report karein.", 
            btn_google: "Google ke sath continue karein", btn_guest: "Guest ke roop mein continue karein", lang_select: "Language" 
        },
        mr: { 
            title_part1: "उत्तम समुदायासाठी तुमचा ", title_highlight: "आवाज", title_part2: ".", 
            sub: "फोटो. ठिकाण. पुरावा.", slide_t: "अहवाल सबमिट करा", slide_d: "तुमच्या परिसरात काही समस्या दिसली? फोटो काढा आणि काही टॅप्समध्ये नोंदवा.", 
            btn_google: "Google सह सुरू ठेवा", btn_guest: "अतिथी म्हणून सुरू ठेवा", lang_select: "भाषा" 
        },
        gu: { 
            title_part1: "વધુ સારા સમુદાય માટે તમારો ", title_highlight: "અવાજ", title_part2: ".", 
            sub: "ફોટા. સ્થાન. પુરાવો.", slide_t: "રિપોર્ટ સબમિટ કરો", slide_d: "તમારા વિસ્તારમાં કોઈ સમસ્યા દેખાય છે? ફોટો લો અને થોડા જ ટેપમાં રિપોર્ટ કરો.", 
            btn_google: "Google સાથે ચાલુ રાખો", btn_guest: "અતિથિ તરીકે ચાલુ રાખો", lang_select: "ભાષા" 
        },
        te: { 
            title_part1: "మెరుగైన సమాజం కోసం మీ ", title_highlight: "స్వరం", title_part2: ".", 
            sub: "ఫోటోలు. స్థానం. సాక్ష్యం.", slide_t: "నివేదికలను సమర్పించండి", slide_d: "మీ ప్రాంతంలో సమస్యను గుర్తించారా? ఒక ఫోటో తీసి నివేదించండి.", 
            btn_google: "Google తో కొనసాగించండి", btn_guest: "అతిథిగా కొనసాగించండి", lang_select: "భాష" 
        },
        ta: { 
            title_part1: "சிறந்த சமூகத்திற்கான உங்கள் ", title_highlight: "குரல்", title_part2: ".", 
            sub: "புகைப்படங்கள். இடம். ஆதாரம்.", slide_t: "அறிக்கைகளை சமர்ப்பிக்கவும்", slide_d: "உங்கள் பகுதியில் சிக்கலைக் கண்டீர்களா? ஒரு புகைப்படம் எடுத்து புகாரளிக்கவும்.", 
            btn_google: "Google உடன் தொடரவும்", btn_guest: "விருந்தினராக தொடரவும்", lang_select: "மொழி" 
        },
        kn: { 
            title_part1: "ಉತ್ತಮ ಸಮಾಜಕ್ಕಾಗಿ ನಿಮ್ಮ ", title_highlight: "ಧ್ವನಿ", title_part2: ".", 
            sub: "ಫೋಟೋಗಳು. ಸ್ಥಳ. ಪುರಾವೆ.", slide_t: "ವರದಿಗಳನ್ನು ಸಲ್ಲಿಸಿ", slide_d: "ನಿಮ್ಮ ಪ್ರದೇಶದಲ್ಲಿ ಸಮಸ್ಯೆ ಕಂಡರೆ? ಫೋಟೋ ತೆಗೆದು ವರದಿ ಮಾಡಿ.", 
            btn_google: "Google ನೊಂದಿಗೆ ಮುಂದುವರಿಯಿರಿ", btn_guest: "ಅತಿಥಿಯಾಗಿ ಮುಂದುವರಿಯಿರಿ", lang_select: "ಭಾಷೆ" 
        },
        ml: { 
            title_part1: "മികച്ച സമൂഹത്തിനായി നിങ്ങളുടെ ", title_highlight: "ശബ്ദം", title_part2: ".", 
            sub: "ഫോട്ടോകൾ. സ്ഥലം. തെളിവ്.", slide_t: "റിപ്പോർട്ടുകൾ സമർപ്പിക്കുക", slide_d: "നിങ്ങളുടെ പ്രദേശത്ത് ഒരു പ്രശ്നം കണ്ടോ? ഒരു ഫോട്ടോ എടുത്ത് റിപ്പോർട്ട് ചെയ്യുക.", 
            btn_google: "Google ഉപയോഗിച്ച് തുടരുക", btn_guest: "അതിഥിയായി തുടരുക", lang_select: "ഭാഷ" 
        },
        bn: { 
            title_part1: "উন্নত সম্প্রদায়ের জন্য আপনার ", title_highlight: "কণ্ঠস্বর", title_part2: "।", 
            sub: "ছবি। অবস্থান। প্রমাণ।", slide_t: "রিপোর্ট জমা দিন", slide_d: "আপনার এলাকায় কোনো সমস্যা দেখেছেন? একটি ছবি তুলুন এবং রিপোর্ট করুন।", 
            btn_google: "Google এর সাথে চালিয়ে যান", btn_guest: "অতিথি হিসাবে চালিয়ে যান", lang_select: "ভাষা" 
        },
        pa: { 
            title_part1: "ਬਿਹਤਰ ਭਾਈਚਾਰੇ ਲਈ ਤੁਹਾਡੀ ", title_highlight: "ਆਵਾਜ਼", title_part2: "।", 
            sub: "ਫੋਟੋਆਂ। ਸਥਾਨ। ਸਬੂਤ।", slide_t: "ਰਿਪੋਰਟਾਂ ਜਮ੍ਹਾਂ ਕਰੋ", slide_d: "ਆਪਣੇ ਖੇਤਰ ਵਿੱਚ ਕੋਈ ਸਮੱਸਿਆ ਦੇਖੀ? ਇੱਕ ਫੋਟੋ ਲਓ ਅਤੇ ਰਿਪੋਰਟ ਕਰੋ।", 
            btn_google: "Google ਨਾਲ ਜਾਰੀ ਰੱਖੋ", btn_guest: "ਮਹਿਮਾਨ ਵਜੋਂ ਜਾਰੀ ਰੱਖੋ", lang_select: "ਭਾਸ਼ਾ" 
        },
        or: { 
            title_part1: "ଉନ୍ନତ ସମାଜ ପାଇଁ ଆପଣଙ୍କ ", title_highlight: "ସ୍ୱର", title_part2: "।", 
            sub: "ଫଟୋ। ସ୍ଥାନ। ପ୍ରମାଣ।", slide_t: "ରିପୋର୍ଟ ଦାଖଲ କରନ୍ତୁ", slide_d: "ଆପଣଙ୍କ ଅଞ୍ଚଳରେ କୌଣସି ସମସ୍ୟା ଦେଖିଲେ? ଗୋଟିଏ ଫଟୋ ନେଇ ରିପୋର୍ଟ କରନ୍ତୁ।", 
            btn_google: "Google ସହିତ ଜାରି ରଖନ୍ତୁ", btn_guest: "ଅତିଥି ଭାବରେ ଜାରି ରଖନ୍ତୁ", lang_select: "ଭାଷା" 
        },
        as: { 
            title_part1: "উন্নত সমাজৰ বাবে আপোনাৰ ", title_highlight: "মাত", title_part2: "।", 
            sub: "ফটো। অৱস্থান। প্ৰমাণ।", slide_t: "প্ৰতিবেদন দাখিল কৰক", slide_d: "আপোনাৰ অঞ্চলত কোনো সমস্যা দেখিছে নেকি? এটা ফটো লওক আৰু প্ৰতিবেদন কৰক।", 
            btn_google: "Google ৰ সৈতে আগবাঢ়ক", btn_guest: "অতিথি হিচাপে আগবাঢ়ক", lang_select: "ভাষা" 
        },
        ur: { 
            title_part1: "بہتر معاشرے کے لیے آپ کی ", title_highlight: "آواز", title_part2: "۔", 
            sub: "تصاویر۔ مقام۔ ثبوت۔", slide_t: "رپورٹ جمع کروائیں", slide_d: "اپنے علاقے میں کوئی مسئلہ دیکھا؟ ایک تصویر لیں اور رپورٹ کریں۔", 
            btn_google: "Google کے ساتھ جاری رکھیں", btn_guest: "مہمان کے طور پر جاری رکھیں", lang_select: "زبان" 
        },
        bho: { 
            title_part1: "बढ़िया समाज खातिर राउर ", title_highlight: "आवाज़", title_part2: "।", 
            sub: "फोटो। जगह। प्रमाण।", slide_t: "रिपोर्ट जमा करीं", slide_d: "आपन इलाका में कवनो दिक्कत लउकत बा? एगो फोटो खींचीं आ रिपोर्ट करीं।", 
            btn_google: "Google के साथ चालू राखीं", btn_guest: "अतिथि के रूप में चालू राखीं", lang_select: "भाषा" 
        }
    };

    const currentT = t[lang] || t['en'];

    return (
        <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-between font-sans overflow-hidden relative">
            
            {/* Header / Language Selection */}
            <div className="w-full flex items-center justify-between px-6 pt-12 z-20 max-w-[500px] mx-auto">
                <div className="flex items-center gap-1.5">
                    <span className="text-[#D32F2F] font-black text-[1.4rem] tracking-tighter">P</span>
                    <div className="flex flex-col leading-none">
                        <span className="font-black text-[0.85rem] text-[#111111] tracking-tight">nagrik</span>
                        <span className="font-black text-[0.85rem] text-[#D32F2F] tracking-tight">alert.</span>
                    </div>
                </div>
                
                <select 
                    value={lang} 
                    onChange={(e) => changeLanguage(e.target.value)}
                    className="bg-transparent text-[0.8rem] font-bold text-[#111111] outline-none border border-[#E0E0E0] rounded-full px-3 py-1.5 focus:border-[#00897B] transition-colors"
                >
                    <option value="en">English</option>
                    <option value="hi">हिन्दी</option>
                    <option value="hinglish">Hinglish</option>
                    <option value="mr">मराठी</option>
                    <option value="gu">ગુજરાતી</option>
                    <option value="te">తెలుగు</option>
                    <option value="ta">தமிழ்</option>
                    <option value="kn">ಕನ್ನಡ</option>
                    <option value="ml">മലയാളം</option>
                    <option value="bn">বাংলা</option>
                    <option value="pa">ਪੰਜਾਬੀ</option>
                    <option value="or">ଓଡ଼ିଆ</option>
                    <option value="as">অসমীয়া</option>
                    <option value="ur">اردو</option>
                    <option value="bho">भोजपुरी</option>
                </select>
            </div>

            {/* Typography Header Section */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.6 }}
                className="w-full px-6 pt-10 text-center max-w-[500px] mx-auto z-20"
            >
                <h1 className="text-[2.2rem] sm:text-[2.5rem] font-black leading-[1.1] text-[#111111] tracking-tight">
                    {currentT.title_part1}
                    <span className="text-[#D32F2F]">{currentT.title_highlight}</span>
                    {currentT.title_part2}
                </h1>
                <p className="text-[1.1rem] text-[#555555] font-medium mt-3">
                    {currentT.sub}
                </p>
            </motion.div>

            {/* Central Illustration Area */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex-1 w-full max-w-[500px] mx-auto flex items-center justify-center relative mt-4 px-4 z-10"
            >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#FAFAFA] z-10 pointer-events-none"></div>
                <img 
                    src="image_9bfb2b.jpg" 
                    alt="Community Reporting" 
                    className="w-full h-auto object-contain scale-[1.1]"
                    onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="w-full h-[250px] bg-[#E0E0E0] animate-pulse rounded-3xl mx-4 flex items-center justify-center"><span class="text-[#888888] font-bold text-sm">Illustration</span></div>';
                    }}
                />
            </motion.div>

            {/* Bottom Actions Card */}
            <motion.div 
                initial={{ opacity: 0, y: 40 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.6, delay: 0.3 }}
                className="w-full bg-[#FFFFFF] rounded-t-[32px] shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.05)] px-8 pt-10 pb-12 z-20 max-w-[500px] mx-auto relative"
            >
                <div className="text-center mb-8">
                    <h2 className="text-[1.35rem] font-black text-[#111111] mb-2">{currentT.slide_t}</h2>
                    <p className="text-[#555555] text-[0.95rem] font-medium leading-relaxed max-w-[300px] mx-auto">
                        {currentT.slide_d}
                    </p>
                </div>

                {/* Navigation Dots Indicator */}
                <div className="flex justify-center items-center gap-1.5 mb-8">
                    <div className="w-4 h-1.5 rounded-full bg-[#111111]"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#E0E0E0]"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#E0E0E0]"></div>
                </div>

                <div className="flex flex-col gap-4">
                    <button 
                        onClick={handleGoogleSignIn}
                        disabled={isAuthenticating}
                        className="w-full bg-[#111111] text-[#FFFFFF] font-bold text-[1rem] py-4 rounded-[16px] transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 outline-none"
                    >
                        {isAuthenticating ? (
                            <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                        ) : (
                            currentT.btn_google
                        )}
                    </button>
                    
                    <button 
                        onClick={handleGuestContinue}
                        disabled={isAuthenticating}
                        className="w-full bg-transparent text-[#D32F2F] font-bold text-[0.95rem] py-3 rounded-[16px] transition-opacity active:opacity-70 disabled:opacity-50 outline-none"
                    >
                        {currentT.btn_guest}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}