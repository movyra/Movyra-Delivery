import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    updateProfile,
    sendPasswordResetEmail,
    signInWithPopup,
    GoogleAuthProvider
} from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { Sun, Moon, ShieldCheck, X, Zap, Activity, Lock, Globe, ArrowUp } from 'lucide-react';
import { useCivicStore } from '../../store/useCivicStore';

export default function CivicAuth() {
    const navigate = useNavigate();
    const theme = useCivicStore((state) => state.theme);
    const toggleTheme = useCivicStore((state) => state.toggleTheme);
    
    // Modes: 'login' (Sign In), 'register' (Sign Up), 'reset' (Forgot Password), 'admin_req' (Request Admin)
    const [authMode, setAuthMode] = useState('login'); 
    const [lang, setLang] = useState('en');
    const [showLangPrompt, setShowLangPrompt] = useState(false);
    
    const [formData, setFormData] = useState({ name: '', email: '', password: '', purpose: '', questions: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Variables for the standardized footer
    const localCity = "Mumbai";

    useEffect(() => {
        const sysLang = navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'mr', 'gu', 'te', 'ta', 'pa', 'bho', 'ar', 'es', 'fr', 'de'];
        if (supported.includes(sysLang)) setLang(sysLang);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 13-Language Dictionary (Simplified Terminology)
    const t = {
        en: { 
            lang: "English", title: "Welcome Back", sub: "Sign in to manage reports and track progress.", 
            name: "Full Name", email: "Email Address", pass: "Password", purpose: "Role / Purpose", questions: "Why do you need access?",
            login_btn: "Sign In", reg_btn: "Sign Up", reset_btn: "Send Link", admin_btn: "Submit Request",
            switch_reg: "Need an account? Sign Up", switch_log: "Already have an account? Sign In", forgot: "Forgot Password?", switch_admin: "Request Admin Access",
            reset_msg: "Link sent. Check your email.", admin_msg: "Request sent. Waiting for approval.",
            google_btn: "Sign in with Google", careers: "Careers"
        },
        hi: { 
            lang: "हिन्दी", title: "वापसी पर स्वागत है", sub: "रिपोर्ट प्रबंधित करने और प्रगति को ट्रैक करने के लिए साइन इन करें।", 
            name: "पूरा नाम", email: "ईमेल पता", pass: "पासवर्ड", purpose: "भूमिका / उद्देश्य", questions: "आपको पहुँच की आवश्यकता क्यों है?",
            login_btn: "साइन इन", reg_btn: "साइन अप", reset_btn: "लिंक भेजें", admin_btn: "अनुरोध सबमिट करें",
            switch_reg: "खाता चाहिए? साइन अप करें", switch_log: "पहले से खाता है? साइन इन करें", forgot: "पासवर्ड भूल गए?", switch_admin: "एडमिन एक्सेस का अनुरोध करें",
            reset_msg: "लिंक भेजा गया। अपना ईमेल जांचें।", admin_msg: "अनुरोध भेजा गया। मंजूरी का इंतजार है।",
            google_btn: "Google से साइन इन करें", careers: "करियर"
        },
        hinglish: { 
            lang: "Hinglish", title: "Welcome Back", sub: "Reports manage karne aur progress track karne ke liye sign in karein.", 
            name: "Full Name", email: "Email Address", pass: "Password", purpose: "Role / Purpose", questions: "Aapko access kyun chahiye?",
            login_btn: "Sign In", reg_btn: "Sign Up", reset_btn: "Link Bhejein", admin_btn: "Request Submit Karein",
            switch_reg: "Account chahiye? Sign Up karein", switch_log: "Pehle se account hai? Sign In karein", forgot: "Password bhool gaye?", switch_admin: "Admin Access Request Karein",
            reset_msg: "Link send ho gaya. Email check karein.", admin_msg: "Request send ho gayi. Approval ka wait karein.",
            google_btn: "Google se sign in karein", careers: "Careers"
        },
        mr: { 
            lang: "मराठी", title: "स्वागत आहे", sub: "अहवाल व्यवस्थापित करण्यासाठी आणि प्रगती ट्रॅक करण्यासाठी साइन इन करा.", 
            name: "पूर्ण नाव", email: "ईमेल पत्ता", pass: "पासवर्ड", purpose: "भूमिका / हेतू", questions: "तुम्हाला प्रवेश का हवा आहे?",
            login_btn: "साइन इन करा", reg_btn: "साइन अप करा", reset_btn: "लिंक पाठवा", admin_btn: "विनंती सबमिट करा",
            switch_reg: "खाते हवे आहे? साइन अप करा", switch_log: "आधीच खाते आहे? साइन इन करा", forgot: "पासवर्ड विसरलात?", switch_admin: "अॅडमिन अॅक्सेसची विनंती करा",
            reset_msg: "लिंक पाठवली. तुमचा ईमेल तपासा.", admin_msg: "विनंती पाठवली. मंजुरीची प्रतीक्षा आहे.",
            google_btn: "Google सह साइन इन करा", careers: "करिअर"
        },
        gu: { 
            lang: "ગુજરાતી", title: "સ્વાગત છે", sub: "રિપોર્ટ્સ મેનેજ કરવા અને પ્રગતિ ટ્રૅક કરવા માટે સાઇન ઇન કરો.", 
            name: "પૂરું નામ", email: "ઈમેલ એડ્રેસ", pass: "પાસવર્ડ", purpose: "ભૂમિકા / હેતુ", questions: "તમારે ઍક્સેસ શા માટે જોઈએ છે?",
            login_btn: "સાઇન ઇન", reg_btn: "સાઇન અપ", reset_btn: "લિંક મોકલો", admin_btn: "વિનંતી સબમિટ કરો",
            switch_reg: "એકાઉન્ટ જોઈએ છે? સાઇન અપ કરો", switch_log: "પહેલેથી એકાઉન્ટ છે? સાઇન ઇન કરો", forgot: "પાસવર્ડ ભૂલી ગયા છો?", switch_admin: "એડમિન એક્સેસની વિનંતી કરો",
            reset_msg: "લિંક મોકલી. તમારો ઇમેઇલ તપાસો.", admin_msg: "વિનંતી મોકલી. મંજૂરીની રાહ જોવાય છે.",
            google_btn: "Google થી સાઇન ઇન કરો", careers: "કારકિર્દી"
        },
        te: { 
            lang: "తెలుగు", title: "స్వాగతం", sub: "నివేదికలను నిర్వహించడానికి మరియు పురోగతిని ట్రాక్ చేయడానికి సైన్ ఇన్ చేయండి.", 
            name: "పూర్తి పేరు", email: "ఈమెయిల్ చిరునామా", pass: "పాస్‌వర్డ్", purpose: "పాత్ర / ప్రయోజనం", questions: "మీకు యాక్సెస్ ఎందుకు కావాలి?",
            login_btn: "సైన్ ఇన్ చేయండి", reg_btn: "సైన్ అప్ చేయండి", reset_btn: "లింక్ పంపండి", admin_btn: "అభ్యర్థనను సమర్పించండి",
            switch_reg: "ఖాతా కావాలా? సైన్ అప్ చేయండి", switch_log: "ఇప్పటికే ఖాతా ఉందా? సైన్ ఇన్ చేయండి", forgot: "పాస్‌వర్డ్ మర్చిపోయారా?", switch_admin: "అడ్మిన్ యాక్సెస్‌ను అభ్యర్థించండి",
            reset_msg: "లింక్ పంపబడింది. మీ ఇమెయిల్‌ను తనిఖీ చేయండి.", admin_msg: "అభ్యర్థన పంపబడింది. ఆమోదం కోసం వేచి ఉంది.",
            google_btn: "Google తో సైన్ ఇన్ చేయండి", careers: "కెరీర్స్"
        },
        ta: { 
            lang: "தமிழ்", title: "நல்வரவு", sub: "அறிக்கைகளை நிர்வகிக்க மற்றும் முன்னேற்றத்தை கண்காணிக்க உள்நுழையவும்.", 
            name: "முழு பெயர்", email: "மின்னஞ்சல் முகவரி", pass: "கடவுச்சொல்", purpose: "பங்கு / நோக்கம்", questions: "உங்களுக்கு அணுகல் ஏன் தேவை?",
            login_btn: "உள்நுழைய", reg_btn: "பதிவு செய்", reset_btn: "இணைப்பை அனுப்பு", admin_btn: "கோரிக்கையை சமர்ப்பி",
            switch_reg: "கணக்கு வேண்டுமா? பதிவு செய்", switch_log: "ஏற்கனவே கணக்கு உள்ளதா? உள்நுழைய", forgot: "கடவுச்சொல்லை மறந்துவிட்டீர்களா?", switch_admin: "நிர்வாகி அணுகலைக் கோரவும்",
            reset_msg: "இணைப்பு அனுப்பப்பட்டது. மின்னஞ்சலைச் சரிபார்க்கவும்.", admin_msg: "கோரிக்கை அனுப்பப்பட்டது. ஒப்புதலுக்காக காத்திருக்கிறது.",
            google_btn: "Google மூலம் உள்நுழைக", careers: "வேலைவாய்ப்புகள்"
        },
        pa: { 
            lang: "ਪੰਜਾਬੀ", title: "ਜੀ ਆਇਆਂ ਨੂੰ", sub: "ਰਿਪੋਰਟਾਂ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰਨ ਅਤੇ ਤਰੱਕੀ ਨੂੰ ਟਰੈਕ ਕਰਨ ਲਈ ਸਾਈਨ ਇਨ ਕਰੋ।", 
            name: "ਪੂਰਾ ਨਾਮ", email: "ਈਮੇਲ ਪਤਾ", pass: "ਪਾਸਵਰਡ", purpose: "ਭੂਮਿਕਾ / ਉਦੇਸ਼", questions: "ਤੁਹਾਨੂੰ ਪਹੁੰਚ ਦੀ ਲੋੜ ਕਿਉਂ ਹੈ?",
            login_btn: "ਸਾਈਨ ਇਨ ਕਰੋ", reg_btn: "ਸਾਈਨ ਅੱਪ ਕਰੋ", reset_btn: "ਲਿੰਕ ਭੇਜੋ", admin_btn: "ਬੇਨਤੀ ਸਬਮਿਟ ਕਰੋ",
            switch_reg: "ਖਾਤਾ ਚਾਹੀਦਾ ਹੈ? ਸਾਈਨ ਅੱਪ ਕਰੋ", switch_log: "ਕੀ ਪਹਿਲਾਂ ਹੀ ਖਾਤਾ ਹੈ? ਸਾਈਨ ਇਨ ਕਰੋ", forgot: "ਕੀ ਪਾਸਵਰਡ ਭੁੱਲ ਗਏ ਹੋ?", switch_admin: "ਐਡਮਿਨ ਐਕਸੈਸ ਦੀ ਬੇਨਤੀ ਕਰੋ",
            reset_msg: "ਲਿੰਕ ਭੇਜਿਆ ਗਿਆ। ਆਪਣੀ ਈਮੇਲ ਚੈੱਕ ਕਰੋ।", admin_msg: "ਬੇਨਤੀ ਭੇਜੀ ਗਈ। ਮਨਜ਼ੂਰੀ ਦੀ ਉਡੀਕ ਹੈ।",
            google_btn: "Google ਨਾਲ ਸਾਈਨ ਇਨ ਕਰੋ", careers: "ਕਰੀਅਰ"
        },
        bho: { 
            lang: "भोजपुरी", title: "स्वागत बा", sub: "रिपोर्ट प्रबंधित करे आ प्रगति ट्रैक करे खातिर साइन इन करीं।", 
            name: "पूरा नाम", email: "ईमेल पता", pass: "पासवर्ड", purpose: "भूमिका / उद्देश्य", questions: "रउआँ के एक्सेस काहें चाहीं?",
            login_btn: "साइन इन", reg_btn: "साइन अप", reset_btn: "लिंक भेजीं", admin_btn: "अनुरोध सबमिट करीं",
            switch_reg: "खाता चाहीं? साइन अप करीं", switch_log: "पहिले से खाता बा? साइन इन करीं", forgot: "पासवर्ड भुला गइलें?", switch_admin: "एडमिन एक्सेस के अनुरोध करीं",
            reset_msg: "लिंक भेजल गइल। आपन ईमेल जाँचीं।", admin_msg: "अनुरोध भेजल गइल। मंजूरी के इंतजार बा।",
            google_btn: "Google से साइन इन करीं", careers: "करियर"
        },
        ar: { 
            lang: "العربية", title: "مرحباً بعودتك", sub: "قم بتسجيل الدخول لإدارة التقارير وتتبع التقدم.", 
            name: "الاسم الكامل", email: "عنوان البريد الإلكتروني", pass: "كلمة المرور", purpose: "الدور / الغرض", questions: "لماذا تحتاج إلى الوصول؟",
            login_btn: "تسجيل الدخول", reg_btn: "إنشاء حساب", reset_btn: "إرسال الرابط", admin_btn: "إرسال الطلب",
            switch_reg: "تحتاج إلى حساب؟ إنشاء حساب", switch_log: "هل لديك حساب؟ تسجيل الدخول", forgot: "هل نسيت كلمة المرور؟", switch_admin: "طلب وصول المسؤول",
            reset_msg: "تم إرسال الرابط. تحقق من بريدك الإلكتروني.", admin_msg: "تم إرسال الطلب. في انتظار الموافقة.",
            google_btn: "تسجيل الدخول باستخدام Google", careers: "الوظائف"
        },
        es: { 
            lang: "Español", title: "Bienvenido", sub: "Inicie sesión para gestionar informes y seguir el progreso.", 
            name: "Nombre Completo", email: "Correo Electrónico", pass: "Contraseña", purpose: "Rol / Propósito", questions: "¿Por qué necesita acceso?",
            login_btn: "Iniciar Sesión", reg_btn: "Registrarse", reset_btn: "Enviar Enlace", admin_btn: "Enviar Solicitud",
            switch_reg: "¿Necesita una cuenta? Registrarse", switch_log: "¿Ya tiene cuenta? Iniciar Sesión", forgot: "¿Olvidó la contraseña?", switch_admin: "Solicitar Acceso de Administrador",
            reset_msg: "Enlace enviado. Revise su correo.", admin_msg: "Solicitud enviada. Esperando aprobación.",
            google_btn: "Iniciar sesión con Google", careers: "Carreras"
        },
        fr: { 
            lang: "Français", title: "Bon retour", sub: "Connectez-vous pour gérer les rapports et suivre les progrès.", 
            name: "Nom Complet", email: "Adresse E-mail", pass: "Mot de passe", purpose: "Rôle / Objectif", questions: "Pourquoi avez-vous besoin d'accès ?",
            login_btn: "Se Connecter", reg_btn: "S'inscrire", reset_btn: "Envoyer le Lien", admin_btn: "Soumettre la Demande",
            switch_reg: "Besoin d'un compte ? S'inscrire", switch_log: "Déjà un compte ? Se Connecter", forgot: "Mot de passe oublié ?", switch_admin: "Demander un Accès Administrateur",
            reset_msg: "Lien envoyé. Vérifiez votre e-mail.", admin_msg: "Demande envoyée. En attente d'approbation.",
            google_btn: "Se connecter avec Google", careers: "Carrières"
        },
        de: { 
            lang: "Deutsch", title: "Willkommen zurück", sub: "Melden Sie sich an, um Berichte zu verwalten und den Fortschritt zu verfolgen.", 
            name: "Vollständiger Name", email: "E-Mail-Adresse", pass: "Passwort", purpose: "Rolle / Zweck", questions: "Warum benötigen Sie Zugriff?",
            login_btn: "Anmelden", reg_btn: "Registrieren", reset_btn: "Link Senden", admin_btn: "Anfrage Senden",
            switch_reg: "Brauchen Sie ein Konto? Registrieren", switch_log: "Haben Sie bereits ein Konto? Anmelden", forgot: "Passwort vergessen?", switch_admin: "Admin-Zugang Anfordern",
            reset_msg: "Link gesendet. Überprüfen Sie Ihre E-Mail.", admin_msg: "Anfrage gesendet. Warten auf Genehmigung.",
            google_btn: "Mit Google anmelden", careers: "Karriere"
        }
    };

    const currentT = t[lang] || t['en'];
    const languageOptions = [
        { code: 'en', label: 'English' }, { code: 'hi', label: 'हिन्दी' }, { code: 'hinglish', label: 'Hinglish' },
        { code: 'mr', label: 'मराठी' }, { code: 'gu', label: 'ગુજરાતી' }, { code: 'te', label: 'తెలుగు' },
        { code: 'ta', label: 'தமிழ்' }, { code: 'pa', label: 'ਪੰਜਾਬੀ' }, { code: 'bho', label: 'भोजपुरी' },
        { code: 'ar', label: 'العربية' }, { code: 'es', label: 'Español' }, { code: 'fr', label: 'Français' },
        { code: 'de', label: 'Deutsch' }
    ];

    const processAuthentication = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            if (authMode === 'login') {
                await signInWithEmailAndPassword(auth, formData.email, formData.password);
                navigate('/civic/dashboard');
            } else if (authMode === 'register') {
                const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
                await updateProfile(userCredential.user, { displayName: formData.name });
                navigate('/civic/dashboard');
            } else if (authMode === 'reset') {
                await sendPasswordResetEmail(auth, formData.email);
                setSuccessMessage(currentT.reset_msg);
                setFormData({ ...formData, password: '' });
            } else if (authMode === 'admin_req') {
                const adminRequestsRef = collection(db, 'civic_admin_requests');
                await addDoc(adminRequestsRef, {
                    name: formData.name,
                    email: formData.email,
                    purpose: formData.purpose,
                    questions: formData.questions,
                    status: 'Pending Review',
                    createdAt: serverTimestamp()
                });
                setSuccessMessage(currentT.admin_msg);
                setFormData({ name: '', email: '', password: '', purpose: '', questions: '' });
            }
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        setIsLoading(true);
        setErrorMessage('');
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            navigate('/civic/dashboard');
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const switchAuthMode = (mode) => {
        setAuthMode(mode);
        setErrorMessage('');
        setSuccessMessage('');
        setFormData({ name: '', email: '', password: '', purpose: '', questions: '' });
    };

    const fadeUpAnim = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    return (
        <div className={`min-h-screen font-sans overflow-x-hidden transition-colors duration-300 flex flex-col ${
            theme === 'light' ? 'bg-[#f5f5f5] text-[#111111] selection:bg-black selection:text-white' : 'bg-[#050505] text-white selection:bg-white selection:text-black'
        }`}>
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .animate-fade { animation: fadeIn 0.5s ease-out forwards; } html { scroll-behavior: smooth; }`}</style>
            
            {/* MASTER HEADER */}
            <header className={`fixed top-0 left-0 right-0 w-full flex items-center justify-between px-6 md:px-12 py-6 z-50 transition-colors backdrop-blur-md ${
                theme === 'light' ? 'bg-[#f5f5f5]/90 border-b border-[#e0e0e0]' : 'bg-[#050505]/90 border-b border-[#111111]'
            }`}>
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/civic')}>
                    <img 
                        src={theme === 'light' ? '/logo-3.png' : '/logo.png'} 
                        alt="Movyra" 
                        className="h-8 w-auto" 
                        onError={(e) => e.target.style.display = 'none'} 
                    />
                    <span className="font-black text-[1.5rem] tracking-tighter ml-[-5px]">
                        ovyra <span className={`${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'} font-medium text-[1.2rem] ml-1`}>Civic</span>
                    </span>
                </div>
                
                <div className="flex items-center gap-4 text-[0.85rem] font-bold">
                    <button 
                        onClick={() => setShowLangPrompt(true)} 
                        className={`transition-colors outline-none border px-3 py-1.5 rounded-full ${
                            theme === 'light' ? 'border-[#cccccc] hover:border-black text-[#555555]' : 'border-[#333333] hover:border-white text-[#888888]'
                        }`}
                    >
                        {currentT.lang}
                    </button>
                    <button 
                        onClick={toggleTheme} 
                        className={`p-2 rounded-full transition-colors outline-none ${
                            theme === 'light' ? 'bg-[#e0e0e0] text-black hover:bg-[#cccccc]' : 'bg-[#222222] text-white hover:bg-[#333333]'
                        }`}
                    >
                        {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                    </button>
                </div>
            </header>

            {/* TRANSLATION MODAL */}
            <AnimatePresence>
                {showLangPrompt && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`fixed inset-0 z-[60] backdrop-blur-md flex items-center justify-center p-6 ${theme === 'light' ? 'bg-white/80' : 'bg-black/80'}`}>
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className={`w-full max-w-[400px] rounded-3xl p-8 flex flex-col shadow-2xl relative border ${theme === 'light' ? 'bg-white border-[#e0e0e0]' : 'bg-[#050505] border-[#333333]'}`}>
                            <button onClick={() => setShowLangPrompt(false)} className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center transition-colors ${theme === 'light' ? 'text-[#888888] hover:text-black' : 'text-[#888888] hover:text-white'}`}>
                                <X size={18} />
                            </button>
                            <h2 className={`text-[1.4rem] font-black tracking-tight mb-6 text-center ${theme === 'light' ? 'text-black' : 'text-white'}`}>Select Language</h2>
                            <div className="flex flex-col gap-1.5 max-h-[45vh] overflow-y-auto pr-1">
                                {languageOptions.map((option) => (
                                    <button 
                                        key={option.code}
                                        onClick={() => { setLang(option.code); setShowLangPrompt(false); }}
                                        className={`w-full p-3.5 rounded-xl flex items-center justify-between group transition-colors border text-left ${theme === 'light' ? (lang === option.code ? 'bg-[#f0f0f0] border-black text-black' : 'bg-white border-[#e0e0e0] text-[#666666] hover:border-black hover:text-black') : (lang === option.code ? 'bg-[#222222] border-white text-white' : 'bg-[#0a0a0a] border-[#333333] text-[#888888] hover:border-white hover:text-white')}`}
                                    >
                                        <span className="font-bold text-[0.95rem]">{option.label}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* AUTHENTICATION GATEWAY SECTION */}
            <section className="relative pt-40 pb-20 px-6 md:px-12 flex flex-col items-center justify-center flex-1">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className={`w-full max-w-[450px] p-8 md:p-10 rounded-3xl border animate-fade z-10 ${
                        theme === 'light' ? 'bg-white border-[#e0e0e0] shadow-xl shadow-black/5' : 'bg-[#111111] border-[#333333] shadow-2xl'
                    }`}
                >
                    <div className="flex items-center gap-4 mb-8">
                        
                        <div>
                            <h1 className="text-[1.5rem] font-black tracking-tight leading-tight">
                                {authMode === 'admin_req' ? "Admin Request" : currentT.title}
                            </h1>
                            <p className={`text-[0.8rem] font-bold mt-1 ${theme === 'light' ? 'text-[#666666]' : 'text-[#aaaaaa]'}`}>
                                {authMode === 'admin_req' ? "Submit credentials for review." : currentT.sub}
                            </p>
                        </div>
                    </div>
                    
                    <form onSubmit={processAuthentication} className="flex flex-col gap-4">
                        {(authMode === 'register' || authMode === 'admin_req') && (
                            <input 
                                type="text" 
                                placeholder={currentT.name} 
                                required 
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                                className={`w-full p-4 rounded-xl outline-none transition-colors font-bold text-[0.9rem] border ${
                                    theme === 'light' ? 'bg-[#f5f5f5] border-[#cccccc] text-black focus:border-black' : 'bg-[#000000] border-[#333333] text-white focus:border-white'
                                }`} 
                            />
                        )}
                        
                        <input 
                            type="email" 
                            placeholder={currentT.email} 
                            required 
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})} 
                            className={`w-full p-4 rounded-xl outline-none transition-colors font-bold text-[0.9rem] border ${
                                theme === 'light' ? 'bg-[#f5f5f5] border-[#cccccc] text-black focus:border-black' : 'bg-[#000000] border-[#333333] text-white focus:border-white'
                            }`} 
                        />
                        
                        {authMode === 'admin_req' && (
                            <>
                                <select
                                    required
                                    value={formData.purpose}
                                    onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                                    className={`w-full p-4 rounded-xl outline-none transition-colors font-bold text-[0.9rem] border appearance-none ${
                                        theme === 'light' ? 'bg-[#f5f5f5] border-[#cccccc] text-black focus:border-black' : 'bg-[#000000] border-[#333333] text-white focus:border-white'
                                    }`}
                                >
                                    <option value="" disabled hidden>{currentT.purpose}</option>
                                    <option value="Ward Officer">Ward Officer / Municipal Rep.</option>
                                    <option value="Field Support Unit">Field Support Unit</option>
                                    <option value="System Administrator">System Administrator</option>
                                </select>
                                
                                <textarea 
                                    placeholder={currentT.questions} 
                                    required 
                                    rows="3"
                                    value={formData.questions}
                                    onChange={(e) => setFormData({...formData, questions: e.target.value})} 
                                    className={`w-full p-4 rounded-xl outline-none transition-colors font-bold text-[0.9rem] border resize-none ${
                                        theme === 'light' ? 'bg-[#f5f5f5] border-[#cccccc] text-black focus:border-black' : 'bg-[#000000] border-[#333333] text-white focus:border-white'
                                    }`} 
                                ></textarea>
                            </>
                        )}

                        {(authMode === 'login' || authMode === 'register') && (
                            <input 
                                type="password" 
                                placeholder={currentT.pass} 
                                required 
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                                className={`w-full p-4 rounded-xl outline-none transition-colors font-bold text-[0.9rem] border ${
                                    theme === 'light' ? 'bg-[#f5f5f5] border-[#cccccc] text-black focus:border-black' : 'bg-[#000000] border-[#333333] text-white focus:border-white'
                                }`} 
                            />
                        )}

                        {errorMessage && <p className="text-[#ff4444] text-[0.85rem] font-bold px-2">{errorMessage}</p>}
                        {successMessage && <p className="text-[#00aa55] text-[0.85rem] font-bold px-2">{successMessage}</p>}
                        
                        <button 
                            type="submit"
                            disabled={isLoading} 
                            className={`w-full py-4 mt-2 rounded-xl font-black text-[0.95rem] transition-colors disabled:opacity-50 outline-none ${
                                theme === 'light' ? 'bg-black text-white hover:bg-[#333333]' : 'bg-white text-black hover:bg-[#e0e0e0]'
                            }`}
                        >
                            {isLoading ? "..." : (authMode === 'login' ? currentT.login_btn : authMode === 'register' ? currentT.reg_btn : authMode === 'reset' ? currentT.reset_btn : currentT.admin_btn)}
                        </button>
                    </form>

                    {(authMode === 'login' || authMode === 'register') && (
                        <div className="mt-4">
                            <button 
                                type="button"
                                onClick={handleGoogleAuth}
                                disabled={isLoading}
                                className={`w-full py-4 rounded-xl font-black text-[0.95rem] flex items-center justify-center gap-3 transition-colors disabled:opacity-50 outline-none border ${
                                    theme === 'light' ? 'bg-white border-[#cccccc] text-black hover:border-black' : 'bg-[#111111] border-[#333333] text-white hover:border-white'
                                }`}
                            >
                                <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
                                {currentT.google_btn}
                            </button>
                        </div>
                    )}

                    <div className="flex flex-col gap-3 mt-8 pt-6 border-t border-dashed border-[#333333]">
                        {authMode === 'login' && (
                            <>
                                <button onClick={() => switchAuthMode('reset')} className={`text-[0.85rem] font-bold transition-colors outline-none text-left ${theme === 'light' ? 'text-[#666666] hover:text-black' : 'text-[#888888] hover:text-white'}`}>{currentT.forgot}</button>
                                <button onClick={() => switchAuthMode('register')} className={`text-[0.85rem] font-bold transition-colors outline-none text-left ${theme === 'light' ? 'text-[#666666] hover:text-black' : 'text-[#888888] hover:text-white'}`}>{currentT.switch_reg}</button>
                                <button onClick={() => switchAuthMode('admin_req')} className={`text-[0.85rem] font-bold transition-colors outline-none text-left ${theme === 'light' ? 'text-[#00aa55] hover:text-black' : 'text-[#00ff88] hover:text-white'}`}>{currentT.switch_admin}</button>
                            </>
                        )}
                        {(authMode === 'register' || authMode === 'reset' || authMode === 'admin_req') && (
                            <button onClick={() => switchAuthMode('login')} className={`text-[0.85rem] font-bold transition-colors outline-none text-left ${theme === 'light' ? 'text-[#666666] hover:text-black' : 'text-[#888888] hover:text-white'}`}>{currentT.switch_log}</button>
                        )}
                    </div>
                </motion.div>
                
                {/* Background Decor */}
                <div className={`absolute top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-[100px] opacity-10 z-0 pointer-events-none ${
                    theme === 'light' ? 'bg-[#aaaaaa]' : 'bg-[#222222]'
                }`}></div>
            </section>

            {/* FOOTER ALIGNMENT */}
            <footer className={`w-full mx-auto flex flex-col md:flex-row items-center justify-between gap-8 px-8 md:px-16 py-12 border-t relative z-10 ${
                theme === 'light' ? 'border-[#e0e0e0] bg-[#ffffff]' : 'border-[#111111] bg-[#050505]'
            }`}>
                <div className="flex flex-wrap items-center gap-6">
                    <button onClick={() => setShowLangPrompt(true)} className={`flex items-center gap-2 text-[0.8rem] font-bold px-3 py-1.5 rounded-full transition-colors border ${theme === 'light' ? 'border-[#cccccc] hover:border-black text-[#555555]' : 'border-[#333333] hover:border-white text-[#888888]'}`}>
                        <Globe size={14} /> {currentT.lang}
                    </button>
                    <div className={`flex items-center gap-6 ${theme === 'light' ? 'text-[#666666]' : 'text-[#555555]'}`}>
                        <a href="https://www.linkedin.com/company/getmovyra/" target="_blank" rel="noopener noreferrer" className={`transition-colors ${theme === 'light' ? 'hover:text-black' : 'hover:text-white'}`}>
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        </a>
                        <a href="#youtube" className={`transition-colors ${theme === 'light' ? 'hover:text-black' : 'hover:text-white'}`}>
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
                        </a>
                        <a href="https://www.instagram.com/getmovyra" target="_blank" rel="noopener noreferrer" className={`transition-colors ${theme === 'light' ? 'hover:text-black' : 'hover:text-white'}`}>
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                        </a>
                        <a href="#x" className={`transition-colors ${theme === 'light' ? 'hover:text-black' : 'hover:text-white'}`}>
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.006 4.15H5.078z"/></svg>
                        </a>
                    </div>
                </div>
                
                <div className={`flex flex-col md:flex-row items-center gap-6 text-[0.8rem] font-bold ${theme === 'light' ? 'text-[#666666]' : 'text-[#555555]'}`}>
                    <div className="flex items-center gap-6">
                        <Link to="/careers" className={`transition-colors ${theme === 'light' ? 'hover:text-black' : 'hover:text-white'}`}>{currentT.careers}</Link>
                        <span className={`w-1 h-1 rounded-full ${theme === 'light' ? 'bg-[#cccccc]' : 'bg-[#333333]'}`}></span>
                        <div className={`flex items-center gap-2 transition-colors cursor-default ${theme === 'light' ? 'hover:text-black' : 'hover:text-white'}`}>
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            {localCity}, IN
                        </div>
                    </div>
                    <span className={`hidden md:block w-1 h-1 rounded-full ${theme === 'light' ? 'bg-[#cccccc]' : 'bg-[#333333]'}`}></span>
                    <div className="flex items-center gap-2 text-[0.75rem] uppercase tracking-wider">
                        Built by 
                        <a href="https://rebrand.ly/aatns" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition-opacity">
                            <img 
                                src={theme === 'light' ? '/aat2.png' : '/aat.png'} 
                                alt="AnyAstro" 
                                className="h-4 w-auto object-contain" 
                                onError={(e) => { e.target.style.display = 'none'; e.target.insertAdjacentHTML('afterend', '<span class="underline">AnyAstro</span>'); }} 
                            />
                        </a>
                    </div>
                    <button onClick={scrollToTop} className={`p-2 rounded-full transition-colors border outline-none ${theme === 'light' ? 'bg-[#f5f5f5] border-[#cccccc] hover:bg-[#e0e0e0]' : 'bg-[#111111] border-[#333333] hover:bg-[#222222]'}`}>
                        <ArrowUp size={16} />
                    </button>
                </div>
            </footer>
        </div>
    );
}