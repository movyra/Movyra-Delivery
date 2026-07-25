import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Sun, Moon, ShieldCheck, X } from 'lucide-react';
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

    useEffect(() => {
        const sysLang = navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'mr', 'gu', 'te', 'ta', 'pa', 'bho', 'ar', 'es', 'fr', 'de'];
        if (supported.includes(sysLang)) setLang(sysLang);
    }, []);

    // 13-Language Dictionary (Simplified Terminology)
    const t = {
        en: { 
            lang: "English", title: "Identity Verification", sub: "Access the civic portal to report, track, and analyze municipal operations.", 
            name: "Full Name", email: "Email Address", pass: "Password", purpose: "Operational Purpose", questions: "Additional Questions or Context",
            login_btn: "Sign In", reg_btn: "Sign Up", reset_btn: "Send Recovery Link", admin_btn: "Submit Access Request",
            switch_reg: "Need an account? Sign Up", switch_log: "Already registered? Sign In", forgot: "Forgot Password?", switch_admin: "Request Admin Access",
            reset_msg: "Recovery link sent. Check your inbox.", admin_msg: "Request submitted securely. Awaiting administrative review.",
            google_btn: "Continue with Google"
        },
        hi: { 
            lang: "हिन्दी", title: "पहचान सत्यापन", sub: "नगर निगम ऑपरेशंस को रिपोर्ट करने, ट्रैक करने और विश्लेषण करने के लिए पोर्टल तक पहुंचें।", 
            name: "पूरा नाम", email: "ईमेल पता", pass: "पासवर्ड", purpose: "परिचालन उद्देश्य", questions: "अतिरिक्त प्रश्न या संदर्भ",
            login_btn: "साइन इन", reg_btn: "साइन अप", reset_btn: "रिकवरी लिंक भेजें", admin_btn: "एक्सेस अनुरोध सबमिट करें",
            switch_reg: "खाता चाहिए? साइन अप करें", switch_log: "पहले से पंजीकृत हैं? साइन इन करें", forgot: "पासवर्ड भूल गए?", switch_admin: "एडमिन एक्सेस का अनुरोध करें",
            reset_msg: "रिकवरी लिंक भेज दिया गया है। अपना इनबॉक्स जांचें।", admin_msg: "अनुरोध सुरक्षित रूप से सबमिट किया गया। प्रशासनिक समीक्षा की प्रतीक्षा है।",
            google_btn: "Google के साथ जारी रखें"
        },
        hinglish: { 
            lang: "Hinglish", title: "Identity Verification", sub: "Municipal operations report, track aur analyze karne ke liye portal access karein.", 
            name: "Full Name", email: "Email Address", pass: "Password", purpose: "Operational Purpose", questions: "Additional Questions or Context",
            login_btn: "Sign In", reg_btn: "Sign Up", reset_btn: "Recovery Link Bhejein", admin_btn: "Access Request Submit Karein",
            switch_reg: "Account chahiye? Sign Up karein", switch_log: "Pehle se registered hain? Sign In karein", forgot: "Password bhool gaye?", switch_admin: "Admin Access Request Karein",
            reset_msg: "Recovery link send ho gaya hai. Inbox check karein.", admin_msg: "Request securely submit ho gayi hai. Admin review ka wait karein.",
            google_btn: "Google ke sath continue karein"
        },
        mr: { 
            lang: "मराठी", title: "ओळख पडताळणी", sub: "महानगरपालिका ऑपरेशन्सचा अहवाल देण्यासाठी, ट्रॅक करण्यासाठी आणि विश्लेषण करण्यासाठी पोर्टलमध्ये प्रवेश करा.", 
            name: "पूर्ण नाव", email: "ईमेल पत्ता", pass: "पासवर्ड", purpose: "ऑपरेशनल हेतू", questions: "अतिरिक्त प्रश्न किंवा संदर्भ",
            login_btn: "साइन इन करा", reg_btn: "साइन अप करा", reset_btn: "रिकव्हरी लिंक पाठवा", admin_btn: "अॅक्सेस विनंती सबमिट करा",
            switch_reg: "खाते हवे आहे? साइन अप करा", switch_log: "आधीच नोंदणीकृत आहात? साइन इन करा", forgot: "पासवर्ड विसरलात?", switch_admin: "अॅडमिन अॅक्सेसची विनंती करा",
            reset_msg: "रिकव्हरी लिंक पाठवली आहे. तुमचा इनबॉक्स तपासा.", admin_msg: "विनंती सुरक्षितपणे सबमिट केली. प्रशासकीय पुनरावलोकनाची प्रतीक्षा करत आहे.",
            google_btn: "Google सह सुरू ठेवा"
        },
        gu: { 
            lang: "ગુજરાતી", title: "ઓળખ ચકાસણી", sub: "મ્યુનિસિપલ ઓપરેશન્સને રિપોર્ટ કરવા, ટ્રૅક કરવા અને વિશ્લેષણ કરવા માટે પોર્ટલ ઍક્સેસ કરો.", 
            name: "પૂરું નામ", email: "ઈમેલ એડ્રેસ", pass: "પાસવર્ડ", purpose: "ઓપરેશનલ હેતુ", questions: "વધારાના પ્રશ્નો અથવા સંદર્ભ",
            login_btn: "સાઇન ઇન", reg_btn: "સાઇન અપ", reset_btn: "રિકવરી લિંક મોકલો", admin_btn: "ઍક્સેસ વિનંતી સબમિટ કરો",
            switch_reg: "એકાઉન્ટ જોઈએ છે? સાઇન અપ કરો", switch_log: "પહેલેથી નોંધાયેલ છો? સાઇન ઇન કરો", forgot: "પાસવર્ડ ભૂલી ગયા છો?", switch_admin: "એડમિન એક્સેસની વિનંતી કરો",
            reset_msg: "રિકવરી લિંક મોકલવામાં આવી. તમારું ઇનબૉક્સ તપાસો.", admin_msg: "વિનંતી સુરક્ષિત રીતે સબમિટ કરવામાં આવી. વહીવટી સમીક્ષાની રાહ જોવાય છે.",
            google_btn: "Google સાથે ચાલુ રાખો"
        },
        te: { 
            lang: "తెలుగు", title: "గుర్తింపు ధృవీకరణ", sub: "మున్సిపల్ కార్యకలాపాలను నివేదించడానికి, ట్రాక్ చేయడానికి మరియు విశ్లేషించడానికి పోర్టల్‌ను యాక్సెస్ చేయండి.", 
            name: "పూర్తి పేరు", email: "ఈమెయిల్ చిరునామా", pass: "పాస్‌వర్డ్", purpose: "కార్యాచరణ ప్రయోజనం", questions: "అదనపు ప్రశ్నలు లేదా సందర్భం",
            login_btn: "సైన్ ఇన్ చేయండి", reg_btn: "సైన్ అప్ చేయండి", reset_btn: "రికవరీ లింక్ పంపండి", admin_btn: "యాక్సెస్ అభ్యర్థనను సమర్పించండి",
            switch_reg: "ఖాతా కావాలా? సైన్ అప్ చేయండి", switch_log: "ఇప్పటికే నమోదు చేసుకున్నారా? సైన్ ఇన్ చేయండి", forgot: "పాస్‌వర్డ్ మర్చిపోయారా?", switch_admin: "అడ్మిన్ యాక్సెస్‌ను అభ్యర్థించండి",
            reset_msg: "రికవరీ లింక్ పంపబడింది. మీ ఇన్‌బాక్స్‌ని తనిఖీ చేయండి.", admin_msg: "అభ్యర్థన సురక్షితంగా సమర్పించబడింది. అడ్మినిస్ట్రేటివ్ సమీక్ష కోసం వేచి ఉంది.",
            google_btn: "Google తో కొనసాగించండి"
        },
        ta: { 
            lang: "தமிழ்", title: "அடையாள சரிபார்ப்பு", sub: "நகராட்சி செயல்பாடுகளைப் புகாரளிக்க, கண்காணிக்க மற்றும் பகுப்பாய்வு செய்ய போர்ட்டலை அணுகவும்.", 
            name: "முழு பெயர்", email: "மின்னஞ்சல் முகவரி", pass: "கடவுச்சொல்", purpose: "செயல்பாட்டு நோக்கம்", questions: "கூடுதல் கேள்விகள் அல்லது சூழல்",
            login_btn: "உள்நுழைய", reg_btn: "பதிவு செய்", reset_btn: "மீட்பு இணைப்பை அனுப்பு", admin_btn: "அணுகல் கோரிக்கையை சமர்ப்பிக்கவும்",
            switch_reg: "கணக்கு வேண்டுமா? பதிவு செய்", switch_log: "ஏற்கனவே பதிவு செய்யப்பட்டதா? உள்நுழைய", forgot: "கடவுச்சொல்லை மறந்துவிட்டீர்களா?", switch_admin: "நிர்வாகி அணுகலைக் கோரவும்",
            reset_msg: "மீட்பு இணைப்பு அனுப்பப்பட்டது. உங்கள் இன்பாக்ஸைச் சரிபார்க்கவும்.", admin_msg: "கோரிக்கை பாதுகாப்பாக சமர்ப்பிக்கப்பட்டது. நிர்வாக மதிப்பாய்விற்காக காத்திருக்கிறது.",
            google_btn: "Google உடன் தொடரவும்"
        },
        pa: { 
            lang: "ਪੰਜਾਬੀ", title: "ਪਛਾਣ ਤਸਦੀਕ", sub: "ਮਿਉਂਸਪਲ ਓਪਰੇਸ਼ਨਾਂ ਦੀ ਰਿਪੋਰਟ ਕਰਨ, ਟਰੈਕ ਕਰਨ ਅਤੇ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰਨ ਲਈ ਪੋਰਟਲ ਤੱਕ ਪਹੁੰਚ ਕਰੋ।", 
            name: "ਪੂਰਾ ਨਾਮ", email: "ਈਮੇਲ ਪਤਾ", pass: "ਪਾਸਵਰਡ", purpose: "ਸੰਚਾਲਨ ਉਦੇਸ਼", questions: "ਵਾਧੂ ਸਵਾਲ ਜਾਂ ਸੰਦਰਭ",
            login_btn: "ਸਾਈਨ ਇਨ ਕਰੋ", reg_btn: "ਸਾਈਨ ਅੱਪ ਕਰੋ", reset_btn: "ਰਿਕਵਰੀ ਲਿੰਕ ਭੇਜੋ", admin_btn: "ਪਹੁੰਚ ਬੇਨਤੀ ਸਬਮਿਟ ਕਰੋ",
            switch_reg: "ਖਾਤਾ ਚਾਹੀਦਾ ਹੈ? ਸਾਈਨ ਅੱਪ ਕਰੋ", switch_log: "ਕੀ ਪਹਿਲਾਂ ਹੀ ਰਜਿਸਟਰਡ ਹੈ? ਸਾਈਨ ਇਨ ਕਰੋ", forgot: "ਕੀ ਪਾਸਵਰਡ ਭੁੱਲ ਗਏ ਹੋ?", switch_admin: "ਐਡਮਿਨ ਐਕਸੈਸ ਦੀ ਬੇਨਤੀ ਕਰੋ",
            reset_msg: "ਰਿਕਵਰੀ ਲਿੰਕ ਭੇਜਿਆ ਗਿਆ। ਆਪਣਾ ਇਨਬਾਕਸ ਚੈੱਕ ਕਰੋ।", admin_msg: "ਬੇਨਤੀ ਸੁਰੱਖਿਅਤ ਢੰਗ ਨਾਲ ਸਬਮਿਟ ਕੀਤੀ ਗਈ। ਪ੍ਰਬੰਧਕੀ ਸਮੀਖਿਆ ਦੀ ਉਡੀਕ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ।",
            google_btn: "Google ਨਾਲ ਜਾਰੀ ਰੱਖੋ"
        },
        bho: { 
            lang: "भोजपुरी", title: "पहचान सत्यापन", sub: "नगर निगम ऑपरेशंस के रिपोर्ट करे, ट्रैक करे आ विश्लेषण करे खातिर पोर्टल तक पहुंचें।", 
            name: "पूरा नाम", email: "ईमेल पता", pass: "पासवर्ड", purpose: "परिचालन उद्देश्य", questions: "अतिरिक्त प्रश्न या संदर्भ",
            login_btn: "साइन इन", reg_btn: "साइन अप", reset_btn: "रिकवरी लिंक भेजीं", admin_btn: "एक्सेस अनुरोध सबमिट करीं",
            switch_reg: "खाता चाहीं? साइन अप करीं", switch_log: "पहिले से पंजीकृत बानी? साइन इन करीं", forgot: "पासवर्ड भुला गइलें?", switch_admin: "एडमिन एक्सेस के अनुरोध करीं",
            reset_msg: "रिकवरी लिंक भेज दिहल गइल बा। आपन इनबॉक्स जाँचीं।", admin_msg: "अनुरोध सुरक्षित रूप से सबमिट कइल गइल। प्रशासनिक समीक्षा के प्रतीक्षा बा।",
            google_btn: "Google के साथ जारी रखीं"
        },
        ar: { 
            lang: "العربية", title: "التحقق من الهوية", sub: "الوصول إلى بوابة البلدية للإبلاغ عن العمليات وتتبعها وتحليلها.", 
            name: "الاسم الكامل", email: "عنوان البريد الإلكتروني", pass: "كلمة المرور", purpose: "الهدف التشغيلي", questions: "أسئلة إضافية أو سياق",
            login_btn: "تسجيل الدخول", reg_btn: "إنشاء حساب", reset_btn: "إرسال رابط الاسترداد", admin_btn: "إرسال طلب الوصول",
            switch_reg: "هل تحتاج إلى حساب؟ إنشاء حساب", switch_log: "هل أنت مسجل بالفعل؟ تسجيل الدخول", forgot: "هل نسيت كلمة المرور؟", switch_admin: "طلب وصول المسؤول",
            reset_msg: "تم إرسال رابط الاسترداد. تحقق من صندوق الوارد الخاص بك.", admin_msg: "تم إرسال الطلب بشكل آمن. في انتظار المراجعة الإدارية.",
            google_btn: "المتابعة باستخدام Google"
        },
        es: { 
            lang: "Español", title: "Verificación de Identidad", sub: "Acceda al portal municipal para reportar, rastrear y analizar operaciones.", 
            name: "Nombre Completo", email: "Dirección de Correo", pass: "Contraseña", purpose: "Propósito Operativo", questions: "Preguntas Adicionales o Contexto",
            login_btn: "Iniciar Sesión", reg_btn: "Registrarse", reset_btn: "Enviar Enlace de Recuperación", admin_btn: "Enviar Solicitud de Acceso",
            switch_reg: "¿Necesita una cuenta? Registrarse", switch_log: "¿Ya está registrado? Iniciar Sesión", forgot: "¿Olvidó su contraseña?", switch_admin: "Solicitar Acceso de Administrador",
            reset_msg: "Enlace de recuperación enviado. Revise su bandeja de entrada.", admin_msg: "Solicitud enviada de forma segura. En espera de revisión administrativa.",
            google_btn: "Continuar con Google"
        },
        fr: { 
            lang: "Français", title: "Vérification d'Identité", sub: "Accédez au portail municipal pour signaler, suivre et analyser les opérations.", 
            name: "Nom Complet", email: "Adresse E-mail", pass: "Mot de passe", purpose: "Objectif Opérationnel", questions: "Questions Supplémentaires ou Contexte",
            login_btn: "Se Connecter", reg_btn: "S'inscrire", reset_btn: "Envoyer le Lien de Récupération", admin_btn: "Soumettre la Demande d'Accès",
            switch_reg: "Besoin d'un compte ? S'inscrire", switch_log: "Déjà inscrit ? Se Connecter", forgot: "Mot de passe oublié ?", switch_admin: "Demander un Accès Administrateur",
            reset_msg: "Lien de récupération envoyé. Vérifiez votre boîte de réception.", admin_msg: "Demande soumise en toute sécurité. En attente d'examen administratif.",
            google_btn: "Continuer avec Google"
        },
        de: { 
            lang: "Deutsch", title: "Identitätsprüfung", sub: "Greifen Sie auf das kommunale Portal zu, um Operationen zu melden, zu verfolgen und zu analysieren.", 
            name: "Vollständiger Name", email: "E-Mail-Adresse", pass: "Passwort", purpose: "Operativer Zweck", questions: "Zusätzliche Fragen oder Kontext",
            login_btn: "Anmelden", reg_btn: "Registrieren", reset_btn: "Wiederherstellungslink Senden", admin_btn: "Zugangsanfrage Einreichen",
            switch_reg: "Brauchen Sie ein Konto? Registrieren", switch_log: "Bereits registriert? Anmelden", forgot: "Passwort vergessen?", switch_admin: "Admin-Zugang Anfordern",
            reset_msg: "Wiederherstellungslink gesendet. Überprüfen Sie Ihren Posteingang.", admin_msg: "Anfrage sicher eingereicht. Warten auf administrative Prüfung.",
            google_btn: "Weiter mit Google"
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
                navigate('/civic');
            } else if (authMode === 'register') {
                const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
                await updateProfile(userCredential.user, { displayName: formData.name });
                navigate('/civic');
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
            navigate('/civic');
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

    return (
        <div className={`min-h-screen font-sans overflow-x-hidden transition-colors duration-300 flex flex-col items-center justify-center p-6 ${
            theme === 'light' ? 'bg-[#f5f5f5] text-[#111111] selection:bg-black selection:text-white' : 'bg-[#050505] text-white selection:bg-white selection:text-black'
        }`}>
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .animate-fade { animation: fadeIn 0.5s ease-out forwards; }`}</style>
            
            <header className="fixed top-0 left-0 right-0 w-full flex items-center justify-between px-6 md:px-12 py-6 z-50 animate-fade">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/civic/home')}>
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
                            theme === 'light' ? 'bg-[#e0e0e0] text-black' : 'bg-[#222222] text-white'
                        }`}
                    >
                        {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                    </button>
                </div>
            </header>

            {/* TRANSLATION MODAL DIALOG */}
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

            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className={`w-full max-w-[450px] p-8 md:p-10 rounded-3xl border animate-fade mt-16 ${
                    theme === 'light' ? 'bg-white border-[#e0e0e0] shadow-xl shadow-black/5' : 'bg-[#111111] border-[#333333] shadow-2xl'
                }`}
            >
                <div className="flex items-center gap-4 mb-8">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
                        theme === 'light' ? 'bg-[#f5f5f5] border-[#e0e0e0]' : 'bg-[#050505] border-[#333333]'
                    }`}>
                        <ShieldCheck size={24} className={theme === 'light' ? 'text-black' : 'text-white'} />
                    </div>
                    <div>
                        <h1 className="text-[1.5rem] font-black tracking-tight leading-tight">
                            {authMode === 'admin_req' ? "Admin Request" : currentT.title}
                        </h1>
                        <p className={`text-[0.8rem] font-bold ${theme === 'light' ? 'text-[#666666]' : 'text-[#aaaaaa]'}`}>
                            {authMode === 'admin_req' ? "Submit credentials for review" : "Secure access portal"}
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
                                <option value="Ward Officer">Ward Officer / Municipal Representative</option>
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
        </div>
    );
}