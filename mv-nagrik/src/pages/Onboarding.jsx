import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    signInWithRedirect, getRedirectResult, GoogleAuthProvider, 
    signInWithEmailAndPassword, createUserWithEmailAndPassword,
    onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { Users, Camera, Activity, PlaySquare, ShieldCheck, Mail, Lock, ChevronLeft } from 'lucide-react';

// Custom Minimalist Google SVG Icon
const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg" className="mx-[1px]">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
);

export default function Onboarding() {
    const navigate = useNavigate();
    const [lang, setLang] = useState('en');
    
    // Auth State
    const [isAuthenticating, setIsAuthenticating] = useState(true); // Default to true while checking redirect
    const [authMode, setAuthMode] = useState('slides'); // 'slides' | 'login' | 'signup'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');

    // Carousel State
    const [currentSlide, setCurrentSlide] = useState(0);

    // Handle Google Redirect Result and Existing Auth State on Mount
    useEffect(() => {
        // 1. Immediately check if a user is already authenticated from a previous session
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                navigate('/home');
            }
        });

        // 2. Check for fresh login data returning from Google Redirect
        const checkRedirectResult = async () => {
            try {
                const result = await getRedirectResult(auth);
                if (result && result.user) {
                    navigate('/home');
                }
            } catch (error) {
                console.error("Redirect auth error:", error);
                setAuthError("Google sign in failed. Try again.");
                setAuthMode('login');
            } finally {
                setIsAuthenticating(false);
            }
        };
        
        checkRedirectResult();

        // Cleanup listener on unmount
        return () => unsubscribe();
    }, [navigate]);

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
        window.dispatchEvent(new Event('storage'));
    };

    // Authentication Handlers
    const handleGoogleSignIn = async () => {
        if (isAuthenticating) return;
        setIsAuthenticating(true);
        const provider = new GoogleAuthProvider();
        try {
            await signInWithRedirect(auth, provider);
        } catch (error) {
            console.error("Google Auth failed:", error);
            setAuthError("Google sign in failed. Try again.");
            setIsAuthenticating(false);
        }
    };

    const handleManualAuth = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setAuthError("Please fill all fields.");
            return;
        }
        
        setIsAuthenticating(true);
        setAuthError('');
        
        try {
            if (authMode === 'signup') {
                await createUserWithEmailAndPassword(auth, email, password);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            navigate('/home');
        } catch (error) {
            console.error("Manual Auth failed:", error);
            setAuthError("Invalid credentials or user already exists.");
        } finally {
            setIsAuthenticating(false);
        }
    };

    const handleGuestContinue = () => navigate('/home');

    // 15 Comprehensive Indian Language Translations
    const t = {
        en: { skip: "Skip", btn_guest: "Continue as Guest", lang_select: "Language", s1_t: "Civic Movement", s1_d: "Your voice for a better community.", s2_t: "Report Issues", s2_d: "Snap a photo, tag the location, and submit instantly.", s3_t: "Track Live", s3_d: "Get real-time updates on your submitted reports.", s4_t: "Local Updates", s4_d: "Watch community videos and stay informed.", s5_t: "Secure Access", s5_d: "Your data is protected. Sign in to start.", login: "Sign In", signup: "Create Account", email: "Email Address", pass: "Password", no_acc: "Need an account?", has_acc: "Already have an account?" },
        hi: { skip: "छोड़ें", btn_guest: "अतिथि के रूप में जारी रखें", lang_select: "भाषा", s1_t: "नागरिक आंदोलन", s1_d: "बेहतर समुदाय के लिए आपकी आवाज़।", s2_t: "समस्याएं दर्ज करें", s2_d: "फोटो लें, स्थान टैग करें और तुरंत सबमिट करें।", s3_t: "लाइव ट्रैक करें", s3_d: "अपनी रिपोर्ट पर रीयल-टाइम अपडेट प्राप्त करें।", s4_t: "स्थानीय अपडेट", s4_d: "सामुदायिक वीडियो देखें और सूचित रहें।", s5_t: "सुरक्षित पहुँच", s5_d: "आपका डेटा सुरक्षित है। शुरू करने के लिए साइन इन करें।", login: "साइन इन", signup: "खाता बनाएं", email: "ईमेल पता", pass: "पासवर्ड", no_acc: "खाता चाहिए?", has_acc: "क्या आपके पास पहले से खाता है?" },
        hinglish: { skip: "Skip", btn_guest: "Guest ke roop mein continue karein", lang_select: "Language", s1_t: "Civic Movement", s1_d: "Behtar community ke liye aapki aawaz.", s2_t: "Report Issues", s2_d: "Photo lein, location tag karein aur submit karein.", s3_t: "Track Live", s3_d: "Apni reports par real-time updates payein.", s4_t: "Local Updates", s4_d: "Community videos dekhein aur updated rahein.", s5_t: "Secure Access", s5_d: "Aapka data safe hai. Start karne ke liye sign in karein.", login: "Sign In", signup: "Account Banayein", email: "Email Address", pass: "Password", no_acc: "Account nahi hai?", has_acc: "Pehle se account hai?" },
        mr: { skip: "वगळा", btn_guest: "अतिथी म्हणून सुरू ठेवा", lang_select: "भाषा", s1_t: "नागरी चळवळ", s1_d: "उत्तम समुदायासाठी तुमचा आवाज.", s2_t: "समस्या नोंदवा", s2_d: "फोटो काढा, ठिकाण टॅग करा आणि त्वरित सबमिट करा.", s3_t: "थेट मागोवा", s3_d: "तुमच्या अहवालांवर रिअल-टाइम अपडेट्स मिळवा.", s4_t: "स्थानिक अपडेट्स", s4_d: "सामुदायिक व्हिडिओ पहा आणि माहिती मिळवा.", s5_t: "सुरक्षित प्रवेश", s5_d: "तुमचा डेटा सुरक्षित आहे. सुरू करण्यासाठी साइन इन करा.", login: "साइन इन करा", signup: "खाते तयार करा", email: "ईमेल पत्ता", pass: "पासवर्ड", no_acc: "खाते हवे आहे?", has_acc: "आधीच खाते आहे का?" },
        gu: { skip: "છોડો", btn_guest: "અતિથિ તરીકે ચાલુ રાખો", lang_select: "ભાષા", s1_t: "નાગરિક ચળવળ", s1_d: "વધુ સારા સમુદાય માટે તમારો અવાજ.", s2_t: "સમસ્યાઓ નોંધો", s2_d: "ફોટો લો, સ્થાન ટેગ કરો અને તરત જ સબમિટ કરો.", s3_t: "લાઇવ ટ્રેક કરો", s3_d: "તમારા રિપોર્ટ્સ પર રીઅલ-ટાઇમ અપડેટ્સ મેળવો.", s4_t: "સ્થાનિક અપડેટ્સ", s4_d: "સમુદાયના વિડિઓઝ જુઓ અને માહિતગાર રહો.", s5_t: "સુરક્ષિત ઍક્સેસ", s5_d: "તમારો ડેટા સુરક્ષિત છે. શરૂ કરવા માટે સાઇન ઇન કરો.", login: "સાઇન ઇન", signup: "એકાઉન્ટ બનાવો", email: "ઇમેઇલ સરનામું", pass: "પાસવર્ડ", no_acc: "એકાઉન્ટની જરૂર છે?", has_acc: "શું તમારી પાસે પહેલેથી એકાઉન્ટ છે?" },
        te: { skip: "దాటవేయి", btn_guest: "అతిథిగా కొనసాగించండి", lang_select: "భాష", s1_t: "పౌర ఉద్యమం", s1_d: "మెరుగైన సమాజం కోసం మీ స్వరం.", s2_t: "సమస్యలను నివేదించండి", s2_d: "ఫోటో తీయండి, స్థానాన్ని ట్యాగ్ చేయండి మరియు సమర్పించండి.", s3_t: "లైవ్ ట్రాక్", s3_d: "మీ నివేదికలపై నిజ-సమయ నవీకరణలను పొందండి.", s4_t: "స్థానిక నవీకరణలు", s4_d: "కమ్యూనిటీ వీడియోలను చూడండి మరియు సమాచారం పొందండి.", s5_t: "సురక్షిత యాక్సెస్", s5_d: "మీ డేటా రక్షించబడింది. ప్రారంభించడానికి సైన్ ఇన్ చేయండి.", login: "సైన్ ఇన్", signup: "ఖాతా సృష్టించండి", email: "ఇమెయిల్ చిరునామా", pass: "పాస్వర్డ్", no_acc: "ఖాతా కావాలా?", has_acc: "ఇప్పటికే ఖాతా ఉందా?" },
        ta: { skip: "தவிர்", btn_guest: "விருந்தினராக தொடரவும்", lang_select: "மொழி", s1_t: "குடிமக்கள் இயக்கம்", s1_d: "சிறந்த சமூகத்திற்கான உங்கள் குரல்.", s2_t: "சிக்கல்களை புகாரளிக்கவும்", s2_d: "புகைப்படம் எடுக்கவும், இடத்தை குறியிடவும், சமர்ப்பிக்கவும்.", s3_t: "நேரடி கண்காணிப்பு", s3_d: "உங்கள் அறிக்கைகள் குறித்த நிகழ்நேர புதுப்பிப்புகளைப் பெறவும்.", s4_t: "உள்ளூர் புதுப்பிப்புகள்", s4_d: "சமூக வீடியோக்களைப் பார்த்து தகவல்களை அறியவும்.", s5_t: "பாதுகாப்பான அணுகல்", s5_d: "உங்கள் தரவு பாதுகாக்கப்படுகிறது. தொடங்க உள்நுழையவும்.", login: "உள்நுழைய", signup: "கணக்கை உருவாக்கு", email: "மின்னஞ்சல் முகவரி", pass: "கடவுச்சொல்", no_acc: "கணக்கு வேண்டுமா?", has_acc: "ஏற்கனவே கணக்கு உள்ளதா?" },
        kn: { skip: "ಬಿಟ್ಟುಬಿಡಿ", btn_guest: "ಅತಿಥಿಯಾಗಿ ಮುಂದುವರಿಯಿರಿ", lang_select: "ಭಾಷೆ", s1_t: "ನಾಗರಿಕ ಚಳುವಳಿ", s1_d: "ಉತ್ತಮ ಸಮಾಜಕ್ಕಾಗಿ ನಿಮ್ಮ ಧ್ವನಿ.", s2_t: "ಸಮಸ್ಯೆಗಳನ್ನು ವರದಿ ಮಾಡಿ", s2_d: "ಫೋಟೋ ತೆಗೆಯಿರಿ, ಸ್ಥಳವನ್ನು ಟ್ಯಾಗ್ ಮಾಡಿ ಮತ್ತು ಸಲ್ಲಿಸಿ.", s3_t: "ಲೈವ್ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ", s3_d: "ನಿಮ್ಮ ವರದಿಗಳ ಮೇಲೆ ನೈಜ-ಸಮಯದ ನವೀಕರಣಗಳನ್ನು ಪಡೆಯಿರಿ.", s4_t: "ಸ್ಥಳೀಯ ನವೀಕರಣಗಳು", s4_d: "ಸಮುದಾಯದ ವೀಡಿಯೊಗಳನ್ನು ವೀಕ್ಷಿಸಿ ಮತ್ತು ಮಾಹಿತಿ ಪಡೆಯಿರಿ.", s5_t: "ಸುರಕ್ಷಿತ ಪ್ರವೇಶ", s5_d: "ನಿಮ್ಮ ಡೇಟಾ ಸುರಕ್ಷಿತವಾಗಿದೆ. ಪ್ರಾರಂಭಿಸಲು ಸೈನ್ ಇನ್ ಮಾಡಿ.", login: "ಸೈನ್ ಇನ್", signup: "ಖಾತೆ ರಚಿಸಿ", email: "ಇಮೇಲ್ ವಿಳಾಸ", pass: "ಪಾಸ್‌ವರ್ಡ್", no_acc: "ಖಾತೆ ಬೇಕೇ?", has_acc: "ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?" },
        ml: { skip: "ഒഴിവാക്കുക", btn_guest: "അതിഥിയായി തുടരുക", lang_select: "ഭാഷ", s1_t: "പൗര പ്രസ്ഥാനം", s1_d: "മികച്ച സമൂഹത്തിനായി നിങ്ങളുടെ ശബ്ദം.", s2_t: "പ്രശ്നങ്ങൾ റിപ്പോർട്ട് ചെയ്യുക", s2_d: "ഒരു ഫോട്ടോ എടുക്കുക, സ്ഥലം ടാഗ് ചെയ്യുക, സമർപ്പിക്കുക.", s3_t: "ലൈവ് ട്രാക്ക് ചെയ്യുക", s3_d: "നിങ്ങളുടെ റിപ്പോർട്ടുകളിൽ തത്സമയ അപ്‌ഡേറ്റുകൾ നേടുക.", s4_t: "പ്രാദേശിക അപ്ഡേറ്റുകൾ", s4_d: "കമ്മ്യൂണിറ്റി വീഡിയോകൾ കാണുക, വിവരങ്ങൾ അറിയുക.", s5_t: "സുരക്ഷിത പ്രവേശനം", s5_d: "നിങ്ങളുടെ ഡാറ്റ സുരക്ഷിതമാണ്. ആരംഭിക്കാൻ സൈൻ ഇൻ ചെയ്യുക.", login: "സൈൻ ഇൻ", signup: "അക്കൗണ്ട് സൃഷ്ടിക്കുക", email: "ഇമെയിൽ വിലാസം", pass: "പാസ്‌വേഡ്", no_acc: "അക്കൗണ്ട് വേണോ?", has_acc: "ഇതിനകം ഒരു അക്കൗണ്ട് ഉണ്ടോ?" },
        bn: { skip: "এড়িয়ে যান", btn_guest: "অতিথি হিসাবে চালিয়ে যান", lang_select: "ভাষা", s1_t: "নাগরিক আন্দোলন", s1_d: "উন্নত সম্প্রদায়ের জন্য আপনার কণ্ঠস্বর।", s2_t: "সমস্যা রিপোর্ট করুন", s2_d: "ছবি তুলুন, অবস্থান ট্যাগ করুন এবং জমা দিন।", s3_t: "লাইভ ট্র্যাক করুন", s3_d: "আপনার রিপোর্টের রিয়েল-টাইম আপডেট পান।", s4_t: "স্থানীয় আপডেট", s4_d: "কমিউনিটি ভিডিও দেখুন এবং আপডেটেড থাকুন।", s5_t: "নিরাপদ অ্যাক্সেস", s5_d: "আপনার ডেটা সুরক্ষিত। শুরু করতে সাইন ইন করুন।", login: "সাইন ইন", signup: "অ্যাকাউন্ট তৈরি করুন", email: "ইমেইল ঠিকানা", pass: "পাসওয়ার্ড", no_acc: "একটি অ্যাকাউন্ট প্রয়োজন?", has_acc: "ইতিমধ্যে একটি অ্যাকাউন্ট আছে?" },
        pa: { skip: "ਛੱਡੋ", btn_guest: "ਮਹਿਮਾਨ ਵਜੋਂ ਜਾਰੀ ਰੱਖੋ", lang_select: "ਭਾਸ਼ਾ", s1_t: "ਨਾਗਰਿਕ ਲਹਿਰ", s1_d: "ਬਿਹਤਰ ਭਾਈਚਾਰੇ ਲਈ ਤੁਹਾਡੀ ਆਵਾਜ਼।", s2_t: "ਸਮੱਸਿਆਵਾਂ ਦੀ ਰਿਪੋਰਟ ਕਰੋ", s2_d: "ਫੋਟੋ ਲਓ, ਸਥਾਨ ਟੈਗ ਕਰੋ ਅਤੇ ਜਮ੍ਹਾਂ ਕਰੋ।", s3_t: "ਲਾਈਵ ਟਰੈਕ ਕਰੋ", s3_d: "ਆਪਣੀਆਂ ਰਿਪੋਰਟਾਂ 'ਤੇ ਰੀਅਲ-ਟਾਈਮ ਅੱਪਡੇਟ ਪ੍ਰਾਪਤ ਕਰੋ।", s4_t: "ਸਥਾਨਕ ਅੱਪਡੇਟ", s4_d: "ਭਾਈਚਾਰਕ ਵੀਡੀਓ ਦੇਖੋ ਅਤੇ ਜਾਣੂ ਰਹੋ।", s5_t: "ਸੁਰੱਖਿਅਤ ਪਹੁੰਚ", s5_d: "ਤੁਹਾਡਾ ਡੇਟਾ ਸੁਰੱਖਿਅਤ ਹੈ। ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ।", login: "ਸਾਈਨ ਇਨ", signup: "ਖਾਤਾ ਬਣਾਓ", email: "ਈਮੇਲ ਪਤਾ", pass: "ਪਾਸਵਰਡ", no_acc: "ਕੀ ਕੋਈ ਖਾਤਾ ਚਾਹੀਦਾ ਹੈ?", has_acc: "ਕੀ ਪਹਿਲਾਂ ਹੀ ਕੋਈ ਖਾਤਾ ਹੈ?" },
        or: { skip: "ବାଦ୍ ଦିଅନ୍ତୁ", btn_guest: "ଅତିଥି ଭାବରେ ଜାରି ରଖନ୍ତୁ", lang_select: "ଭାଷା", s1_t: "ନାଗରିକ ଆନ୍ଦୋଳନ", s1_d: "ଉନ୍ନତ ସମାଜ ପାଇଁ ଆପଣଙ୍କ ସ୍ୱର।", s2_t: "ସମସ୍ୟା ରିପୋର୍ଟ କରନ୍ତୁ", s2_d: "ଫଟୋ ନିଅନ୍ତୁ, ସ୍ଥାନ ଟ୍ୟାଗ୍ କରନ୍ତୁ ଏବଂ ଦାଖଲ କରନ୍ତୁ।", s3_t: "ଲାଇଭ୍ ଟ୍ରାକ୍ କରନ୍ତୁ", s3_d: "ଆପଣଙ୍କ ରିପୋର୍ଟ ଉପରେ ରିଅଲ୍-ଟାଇମ୍ ଅପଡେଟ୍ ପାଆନ୍ତୁ।", s4_t: "ସ୍ଥାନୀୟ ଅପଡେଟ୍", s4_d: "ସମ୍ପ୍ରଦାୟର ଭିଡିଓ ଦେଖନ୍ତୁ ଏବଂ ସୂଚିତ ରୁହନ୍ତୁ।", s5_t: "ସୁରକ୍ଷିତ ପ୍ରବେଶ", s5_d: "ଆପଣଙ୍କ ଡାଟା ସୁରକ୍ଷିତ। ଆରମ୍ଭ କରିବାକୁ ସାଇନ୍ ଇନ୍ କରନ୍ତୁ।", login: "ସାଇନ୍ ଇନ୍", signup: "ଖାତା ତିଆରି କରନ୍ତୁ", email: "ଇମେଲ୍ ଠିକଣା", pass: "ପାସୱାର୍ଡ", no_acc: "ଏକ ଖାତା ଦରକାର କି?", has_acc: "ପୂର୍ବରୁ ଏକ ଖାତା ଅଛି କି?" },
        as: { skip: "এৰাই চলক", btn_guest: "অতিথি হিচাপে আগবাঢ়ক", lang_select: "ভাষা", s1_t: "নাগৰিক আন্দোলন", s1_d: "উন্নত সমাজৰ বাবে আপোনাৰ মাত।", s2_t: "সমস্যা প্ৰতিবেদন কৰক", s2_d: "ফটো লওক, অৱস্থান টেগ কৰক আৰু দাখিল কৰক।", s3_t: "লাইভ ট্ৰেক কৰক", s3_d: "আপোনাৰ প্ৰতিবেদনৰ ৰিয়েল-টাইম আপডেট পাওক।", s4_t: "স্থানীয় আপডেট", s4_d: "সম্প্ৰদায়ৰ ভিডিঅ' চাওক আৰু অৱগত থাকক।", s5_t: "সুৰক্ষিত প্ৰৱেশ", s5_d: "আপোনাৰ ডেটা সুৰক্ষিত। আৰম্ভ কৰিবলৈ ছাইন ইন কৰক।", login: "ছাইন ইন", signup: "একাউণ্ট বনাওক", email: "ইমেইল ঠিকনা", pass: "পাছৱৰ্ড", no_acc: "একাউণ্ট লাগে নেকি?", has_acc: "ইতিমধ্যে এটা একাউণ্ট আছে নেকি?" },
        ur: { skip: "چھوڑیں", btn_guest: "مہمان کے طور پر جاری رکھیں", lang_select: "زبان", s1_t: "شہری تحریک", s1_d: "بہتر معاشرے کے لیے آپ کی آواز۔", s2_t: "مسائل کی رپورٹ کریں", s2_d: "تصویر لیں، مقام ٹیگ کریں اور جمع کرائیں۔", s3_t: "لائیو ٹریک کریں", s3_d: "اپنی رپورٹس پر ریئل ٹائم اپ ڈیٹس حاصل کریں۔", s4_t: "مقامی اپ ڈیٹس", s4_d: "کمیونٹی کی ویڈیوز دیکھیں اور باخبر رہیں۔", s5_t: "محفوظ رسائی", s5_d: "آپ کا ڈیٹا محفوظ ہے۔ شروع کرنے کے لیے سائن ان کریں۔", login: "سائن ان کریں", signup: "اکاؤنٹ بنائیں", email: "ای میل ایڈریس", pass: "پاس ورڈ", no_acc: "اکاؤنٹ درکار ہے؟", has_acc: "کیا پہلے سے اکاؤنٹ ہے؟" },
        bho: { skip: "छोड़ीं", btn_guest: "अतिथि के रूप में चालू राखीं", lang_select: "भाषा", s1_t: "नागरिक आंदोलन", s1_d: "बढ़िया समाज खातिर राउर आवाज़।", s2_t: "समस्या रिपोर्ट करीं", s2_d: "फोटो खींचीं, जगह टैग करीं आ जमा करीं।", s3_t: "लाइव ट्रैक करीं", s3_d: "आपन रिपोर्ट पर रीयल-टाइम अपडेट पाईं।", s4_t: "स्थानीय अपडेट", s4_d: "सामुदायिक वीडियो देखीं आ जानकारी रखीं।", s5_t: "सुरक्षित पहुँच", s5_d: "राउर डेटा सुरक्षित बा। सुरू करे खातिर साइन इन करीं।", login: "साइन इन", signup: "खाता बनाईं", email: "ईमेल पता", pass: "पासवर्ड", no_acc: "खाता चाहीं?", has_acc: "का पहिले से खाता बा?" }
    };

    const currentT = t[lang] || t['en'];

    const slides = [
        { icon: Users, title: currentT.s1_t, desc: currentT.s1_d },
        { icon: Camera, title: currentT.s2_t, desc: currentT.s2_d },
        { icon: Activity, title: currentT.s3_t, desc: currentT.s3_d },
        { icon: PlaySquare, title: currentT.s4_t, desc: currentT.s4_d },
        { icon: ShieldCheck, title: currentT.s5_t, desc: currentT.s5_d }
    ];

    const handleDragEnd = (event, info) => {
        const threshold = 50;
        if (info.offset.x < -threshold && currentSlide < slides.length - 1) {
            setCurrentSlide(prev => prev + 1);
        } else if (info.offset.x > threshold && currentSlide > 0) {
            setCurrentSlide(prev => prev - 1);
        }
    };

    const skipToAuth = () => {
        setAuthMode('login');
    };

    return (
        <div className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-between font-sans overflow-hidden relative pb-8">
            
            {/* Header: Logo & Controls */}
            <div className="w-full flex items-center justify-between px-6 pt-12 z-20 max-w-[500px] mx-auto">
                <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
                    <span className="font-black text-[1.1rem] text-[#111111] tracking-tight">
                        <span className="text-[#00897B]"></span>
                    </span>
                </div>
                {authMode === 'slides' && currentSlide < slides.length - 1 && (
                    <button onClick={skipToAuth} className="text-[#111111]/50 font-bold text-[0.9rem] outline-none hover:text-[#111111] transition-colors">
                        {currentT.skip}
                    </button>
                )}
                {authMode !== 'slides' && (
                    <button onClick={() => setAuthMode('slides')} className="text-[#111111] font-bold text-[0.9rem] outline-none flex items-center">
                        <ChevronLeft size={20} />
                    </button>
                )}
            </div>

            {/* Language Selector */}
            <div className="w-full px-6 mt-4 z-20 max-w-[500px] mx-auto flex justify-end">
                <select 
                    value={lang} 
                    onChange={(e) => changeLanguage(e.target.value)}
                    className="bg-[#FFFFFF] text-[0.8rem] font-bold text-[#111111] outline-none border border-[#111111]/10 rounded-full px-3 py-1.5 focus:border-[#00897B] transition-colors"
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

            <AnimatePresence mode="wait">
                {authMode === 'slides' ? (
                    <motion.div 
                        key="slides"
                        initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}
                        className="flex-1 w-full max-w-[500px] mx-auto flex flex-col justify-between"
                    >
                        {/* Swipeable Carousel Area */}
                        <div className="flex-1 flex items-center justify-center relative px-6 mt-4">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentSlide}
                                    initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
                                    transition={{ duration: 0.3 }}
                                    drag="x" dragConstraints={{ left: 0, right: 0 }} onDragEnd={handleDragEnd}
                                    className="w-full flex flex-col items-center text-center cursor-grab active:cursor-grabbing"
                                >
                                    <div className="w-32 h-32 bg-[#00897B]/10 rounded-full flex items-center justify-center mb-8 shadow-sm">
                                        {React.createElement(slides[currentSlide].icon, { size: 56, className: "text-[#00897B]" })}
                                    </div>
                                    <h2 className="text-[1.8rem] font-black text-[#111111] leading-tight tracking-tight mb-3">
                                        {slides[currentSlide].title}
                                    </h2>
                                    <p className="text-[1rem] text-[#111111]/70 font-medium leading-relaxed max-w-[280px]">
                                        {slides[currentSlide].desc}
                                    </p>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Bottom Actions Card for Slides */}
                        <div className="w-full px-6">
                            <div className="flex justify-center items-center gap-2 mb-8">
                                {slides.map((_, index) => (
                                    <div 
                                        key={index} 
                                        className={`h-1.5 rounded-full transition-all duration-300 ${
                                            currentSlide === index ? 'w-6 bg-[#00897B]' : 'w-2 bg-[#111111]/10'
                                        }`}
                                    />
                                ))}
                            </div>

                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={() => setAuthMode('login')}
                                    className="w-full bg-[#111111] text-[#FFFFFF] font-bold text-[1rem] py-4 rounded-[16px] transition-transform active:scale-95 outline-none"
                                >
                                    {currentT.login}
                                </button>
                                
                                <button 
                                    onClick={handleGuestContinue}
                                    className="w-full bg-transparent text-[#00897B] font-bold text-[0.95rem] py-3 rounded-[16px] transition-opacity active:opacity-70 outline-none border border-[#00897B]/30 hover:bg-[#00897B]/5"
                                >
                                    {currentT.btn_guest}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="auth"
                        initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
                        className="flex-1 w-full max-w-[500px] mx-auto px-6 flex flex-col justify-center pb-12 mt-8"
                    >
                        <div className="text-center mb-10">
                            <h2 className="text-[2rem] font-black text-[#111111] mb-2 tracking-tight">
                                {authMode === 'login' ? currentT.login : currentT.signup}
                            </h2>
                            <p className="text-[#111111]/70 text-[0.95rem] font-medium">{currentT.s1_d}</p>
                        </div>

                        <form onSubmit={handleManualAuth} className="flex flex-col gap-4">
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#111111]/40" size={20} />
                                <input 
                                    type="email" 
                                    placeholder={currentT.email}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-[#FFFFFF] border border-[#111111]/10 rounded-[16px] py-4 pl-12 pr-4 text-[#111111] font-medium focus:border-[#00897B] focus:ring-1 focus:ring-[#00897B] outline-none transition-all"
                                />
                            </div>
                            
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#111111]/40" size={20} />
                                <input 
                                    type="password" 
                                    placeholder={currentT.pass}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-[#FFFFFF] border border-[#111111]/10 rounded-[16px] py-4 pl-12 pr-4 text-[#111111] font-medium focus:border-[#00897B] focus:ring-1 focus:ring-[#00897B] outline-none transition-all"
                                />
                            </div>

                            {authError && (
                                <p className="text-[#D32F2F] text-[0.8rem] font-bold text-center mt-1">{authError}</p>
                            )}

                            <button 
                                type="submit"
                                disabled={isAuthenticating}
                                className="w-full bg-[#111111] text-[#FFFFFF] font-bold text-[1rem] py-4 rounded-[16px] mt-2 transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center outline-none shadow-md"
                            >
                                {isAuthenticating ? (
                                    <div className="w-5 h-5 border-2 border-t-transparent border-[#FFFFFF] rounded-full animate-spin"></div>
                                ) : (
                                    authMode === 'login' ? currentT.login : currentT.signup
                                )}
                            </button>
                        </form>

                        <div className="flex items-center gap-4 my-8">
                            <div className="flex-1 h-px bg-[#111111]/10"></div>
                            <span className="text-[#111111]/40 text-[0.8rem] font-black uppercase tracking-wider">OR</span>
                            <div className="flex-1 h-px bg-[#111111]/10"></div>
                        </div>

                        {/* Strict Custom Google Button Design */}
                        <button 
                            onClick={handleGoogleSignIn}
                            disabled={isAuthenticating}
                            className="w-full bg-[#FFFFFF] border border-[#111111]/10 text-[#111111] font-bold text-[1rem] py-4 rounded-[16px] transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center outline-none shadow-sm hover:bg-[#111111]/5"
                        >
                            {isAuthenticating ? (
                                <div className="w-5 h-5 border-2 border-t-transparent border-[#111111] rounded-full animate-spin"></div>
                            ) : (
                                <span className="flex items-center">
                                    Continue with&nbsp;<GoogleIcon /> oogle
                                </span>
                            )}
                        </button>

                        <div className="mt-10 text-center">
                            <p className="text-[#111111]/70 text-[0.9rem] font-medium">
                                {authMode === 'login' ? currentT.no_acc : currentT.has_acc}
                                <button 
                                    onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                                    className="ml-2 text-[#00897B] font-black hover:underline outline-none"
                                >
                                    {authMode === 'login' ? currentT.signup : currentT.login}
                                </button>
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}