import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    updateProfile,
    sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { Sun, Moon, ShieldCheck, X } from 'lucide-react';
import { useCivicStore } from '../../store/useCivicStore';

export default function CivicAuth() {
    const navigate = useNavigate();
    const theme = useCivicStore((state) => state.theme);
    const toggleTheme = useCivicStore((state) => state.toggleTheme);
    
    const [authMode, setAuthMode] = useState('login'); // 'login', 'register', 'reset'
    const [lang, setLang] = useState('en');
    const [showLangPrompt, setShowLangPrompt] = useState(false);
    
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const sysLang = navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'mr', 'gu', 'te', 'ta', 'pa', 'bho', 'ar', 'es', 'fr', 'de'];
        if (supported.includes(sysLang)) setLang(sysLang);
    }, []);

    const t = {
        en: { 
            lang: "English", title: "Identity Verification", sub: "Access the civic portal to report, track, and analyze municipal operations.", 
            name: "Full Legal Name", email: "Official Email Address", pass: "Secure Password", 
            login_btn: "Authenticate Session", reg_btn: "Register Credentials", reset_btn: "Transmit Recovery Link",
            switch_reg: "Request Administrative Access", switch_log: "Return to Authentication", forgot: "Recover Lost Credentials",
            reset_msg: "Verification link dispatched. Please review your secure email inbox."
        },
        hi: { 
            lang: "हिन्दी", title: "पहचान सत्यापन", sub: "नगर निगम ऑपरेशंस को रिपोर्ट करने, ट्रैक करने और विश्लेषण करने के लिए पोर्टल तक पहुंचें।", 
            name: "पूरा कानूनी नाम", email: "आधिकारिक ईमेल पता", pass: "सुरक्षित पासवर्ड", 
            login_btn: "सत्र प्रमाणित करें", reg_btn: "क्रेडेंशियल पंजीकृत करें", reset_btn: "रिकवरी लिंक ट्रांसमिट करें",
            switch_reg: "प्रशासनिक पहुँच का अनुरोध करें", switch_log: "प्रमाणीकरण पर लौटें", forgot: "खोए हुए क्रेडेंशियल पुनर्प्राप्त करें",
            reset_msg: "सत्यापन लिंक भेज दिया गया है। कृपया अपना सुरक्षित ईमेल इनबॉक्स जांचें।"
        },
        hinglish: { 
            lang: "Hinglish", title: "Identity Verification", sub: "Municipal operations report, track aur analyze karne ke liye portal access karein.", 
            name: "Full Legal Name", email: "Official Email Address", pass: "Secure Password", 
            login_btn: "Session Authenticate Karein", reg_btn: "Credentials Register Karein", reset_btn: "Recovery Link Transmit Karein",
            switch_reg: "Administrative Access Request Karein", switch_log: "Authentication par wapas jayein", forgot: "Lost Credentials Recover Karein",
            reset_msg: "Verification link dispatch ho gaya hai. Apna secure email inbox check karein."
        },
        mr: { 
            lang: "मराठी", title: "ओळख पडताळणी", sub: "महानगरपालिका ऑपरेशन्सचा अहवाल देण्यासाठी, ट्रॅक करण्यासाठी आणि विश्लेषण करण्यासाठी पोर्टलमध्ये प्रवेश करा.", 
            name: "पूर्ण कायदेशीर नाव", email: "अधिकृत ईमेल पत्ता", pass: "सुरक्षित पासवर्ड", 
            login_btn: "सत्र प्रमाणित करा", reg_btn: "क्रेडेन्शियल नोंदणी करा", reset_btn: "रिकव्हरी लिंक ट्रान्समिट करा",
            switch_reg: "प्रशासकीय प्रवेशाची विनंती करा", switch_log: "प्रमाणीकरणावर परत जा", forgot: "हरवलेले क्रेडेन्शियल पुनर्प्राप्त करा",
            reset_msg: "पडताळणी लिंक पाठवली आहे. कृपया तुमचा सुरक्षित ईमेल इनबॉक्स तपासा."
        },
        gu: { 
            lang: "ગુજરાતી", title: "ઓળખ ચકાસણી", sub: "મ્યુનિસિપલ ઓપરેશન્સને રિપોર્ટ કરવા, ટ્રૅક કરવા અને વિશ્લેષણ કરવા માટે પોર્ટલ ઍક્સેસ કરો.", 
            name: "સંપૂર્ણ કાનૂની નામ", email: "સત્તાવાર ઇમેઇલ સરનામું", pass: "સુરક્ષિત પાસવર્ડ", 
            login_btn: "સત્ર પ્રમાણિત કરો", reg_btn: "ક્રેડેન્શિયલ્સ રજીસ્ટર કરો", reset_btn: "રિકવરી લિંક ટ્રાન્સમિટ કરો",
            switch_reg: "વહીવટી ઍક્સેસની વિનંતી કરો", switch_log: "પ્રમાણીકરણ પર પાછા ફરો", forgot: "ખોવાયેલા ઓળખપત્રો પુનઃપ્રાપ્ત કરો",
            reset_msg: "ચકાસણી લિંક રવાના કરવામાં આવી છે. કૃપા કરીને તમારો સુરક્ષિત ઇમેઇલ ઇનબૉક્સ તપાસો."
        },
        te: { 
            lang: "తెలుగు", title: "గుర్తింపు ధృవీకరణ", sub: "మున్సిపల్ కార్యకలాపాలను నివేదించడానికి, ట్రాక్ చేయడానికి మరియు విశ్లేషించడానికి పోర్టల్‌ను యాక్సెస్ చేయండి.", 
            name: "పూర్తి చట్టపరమైన పేరు", email: "అధికారిక ఇమెయిల్ చిరునామా", pass: "సురక్షిత పాస్‌వర్డ్", 
            login_btn: "సెషన్‌ను ప్రామాణీకరించండి", reg_btn: "క్రెడెన్షియల్స్ నమోదు చేయండి", reset_btn: "రికవరీ లింక్‌ను ప్రసారం చేయండి",
            switch_reg: "అడ్మినిస్ట్రేటివ్ యాక్సెస్‌ను అభ్యర్థించండి", switch_log: "ప్రామాణీకరణకు తిరిగి వెళ్లండి", forgot: "కోల్పోయిన క్రెడెన్షియల్స్‌ను తిరిగి పొందండి",
            reset_msg: "ధృవీకరణ లింక్ పంపబడింది. దయచేసి మీ సురక్షిత ఇమెయిల్ ఇన్‌బాక్స్‌ను తనిఖీ చేయండి."
        },
        ta: { 
            lang: "தமிழ்", title: "அடையாள சரிபார்ப்பு", sub: "நகராட்சி செயல்பாடுகளைப் புகாரளிக்க, கண்காணிக்க மற்றும் பகுப்பாய்வு செய்ய போர்ட்டலை அணுகவும்.", 
            name: "முழு சட்டப்பூர்வ பெயர்", email: "அதிகாரப்பூர்வ மின்னஞ்சல் முகவரி", pass: "பாதுகாப்பான கடவுச்சொல்", 
            login_btn: "அமர்வை அங்கீகரிக்கவும்", reg_btn: "சான்றுகளை பதிவு செய்யவும்", reset_btn: "மீட்பு இணைப்பை அனுப்பவும்",
            switch_reg: "நிர்வாக அணுகலைக் கோரவும்", switch_log: "அங்கீகாரத்திற்குத் திரும்பு", forgot: "இழந்த சான்றுகளை மீட்டெடுக்கவும்",
            reset_msg: "சரிபார்ப்பு இணைப்பு அனுப்பப்பட்டது. உங்கள் பாதுகாப்பான மின்னஞ்சல் இன்பாக்ஸைச் சரிபார்க்கவும்."
        },
        pa: { 
            lang: "ਪੰਜਾਬੀ", title: "ਪਛਾਣ ਤਸਦੀਕ", sub: "ਮਿਉਂਸਪਲ ਓਪਰੇਸ਼ਨਾਂ ਦੀ ਰਿਪੋਰਟ ਕਰਨ, ਟਰੈਕ ਕਰਨ ਅਤੇ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰਨ ਲਈ ਪੋਰਟਲ ਤੱਕ ਪਹੁੰਚ ਕਰੋ।", 
            name: "ਪੂਰਾ ਕਾਨੂੰਨੀ ਨਾਮ", email: "ਅਧਿਕਾਰਤ ਈਮੇਲ ਪਤਾ", pass: "ਸੁਰੱਖਿਅਤ ਪਾਸਵਰਡ", 
            login_btn: "ਸੈਸ਼ਨ ਪ੍ਰਮਾਣਿਤ ਕਰੋ", reg_btn: "ਪ੍ਰਮਾਣ ਪੱਤਰ ਰਜਿਸਟਰ ਕਰੋ", reset_btn: "ਰਿਕਵਰੀ ਲਿੰਕ ਟ੍ਰਾਂਸਮਿਟ ਕਰੋ",
            switch_reg: "ਪ੍ਰਸ਼ਾਸਕੀ ਪਹੁੰਚ ਦੀ ਬੇਨਤੀ ਕਰੋ", switch_log: "ਪ੍ਰਮਾਣਿਕਤਾ 'ਤੇ ਵਾਪਸ ਜਾਓ", forgot: "ਗੁਆਚੇ ਪ੍ਰਮਾਣ ਪੱਤਰ ਪ੍ਰਾਪਤ ਕਰੋ",
            reset_msg: "ਤਸਦੀਕ ਲਿੰਕ ਭੇਜਿਆ ਗਿਆ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਸੁਰੱਖਿਅਤ ਈਮੇਲ ਇਨਬਾਕਸ ਦੇਖੋ।"
        },
        bho: { 
            lang: "भोजपुरी", title: "पहचान सत्यापन", sub: "नगर निगम ऑपरेशंस के रिपोर्ट करे, ट्रैक करे आ विश्लेषण करे खातिर पोर्टल तक पहुंचें।", 
            name: "पूरा कानूनी नाम", email: "आधिकारिक ईमेल पता", pass: "सुरक्षित पासवर्ड", 
            login_btn: "सत्र प्रमाणित करीं", reg_btn: "क्रेडेंशियल पंजीकृत करीं", reset_btn: "रिकवरी लिंक ट्रांसमिट करीं",
            switch_reg: "प्रशासनिक पहुँच के अनुरोध करीं", switch_log: "प्रमाणीकरण पर वापस जाईं", forgot: "खो गइल क्रेडेंशियल वापस पाईं",
            reset_msg: "सत्यापन लिंक भेज दिहल गइल बा। कृपया आपन सुरक्षित ईमेल इनबॉक्स जाँचीं।"
        },
        ar: { 
            lang: "العربية", title: "التحقق من الهوية", sub: "الوصول إلى بوابة البلدية للإبلاغ عن العمليات وتتبعها وتحليلها.", 
            name: "الاسم القانوني الكامل", email: "عنوان البريد الإلكتروني الرسمي", pass: "كلمة مرور آمنة", 
            login_btn: "مصادقة الجلسة", reg_btn: "تسجيل بيانات الاعتماد", reset_btn: "إرسال رابط الاسترداد",
            switch_reg: "طلب الوصول الإداري", switch_log: "العودة إلى المصادقة", forgot: "استرداد بيانات الاعتماد المفقودة",
            reset_msg: "تم إرسال رابط التحقق. يرجى مراجعة صندوق البريد الإلكتروني الآمن الخاص بك."
        },
        es: { 
            lang: "Español", title: "Verificación de Identidad", sub: "Acceda al portal municipal para reportar, rastrear y analizar operaciones.", 
            name: "Nombre Legal Completo", email: "Dirección de Correo Oficial", pass: "Contraseña Segura", 
            login_btn: "Autenticar Sesión", reg_btn: "Registrar Credenciales", reset_btn: "Transmitir Enlace de Recuperación",
            switch_reg: "Solicitar Acceso Administrativo", switch_log: "Volver a Autenticación", forgot: "Recuperar Credenciales Perdidas",
            reset_msg: "Enlace de verificación enviado. Por favor revise su bandeja de entrada segura."
        },
        fr: { 
            lang: "Français", title: "Vérification d'Identité", sub: "Accédez au portail municipal pour signaler, suivre et analyser les opérations.", 
            name: "Nom Légal Complet", email: "Adresse E-mail Officielle", pass: "Mot de passe Sécurisé", 
            login_btn: "Authentifier la Session", reg_btn: "Enregistrer les Identifiants", reset_btn: "Transmettre le Lien de Récupération",
            switch_reg: "Demander un Accès Administratif", switch_log: "Retour à l'Authentification", forgot: "Récupérer les Identifiants Perdus",
            reset_msg: "Lien de vérification expédié. Veuillez consulter votre boîte de réception sécurisée."
        },
        de: { 
            lang: "Deutsch", title: "Identitätsprüfung", sub: "Greifen Sie auf das kommunale Portal zu, um Operationen zu melden, zu verfolgen und zu analysieren.", 
            name: "Vollständiger Rechtsname", email: "Offizielle E-Mail-Adresse", pass: "Sicheres Passwort", 
            login_btn: "Sitzung Authentifizieren", reg_btn: "Anmeldeinformationen Registrieren", reset_btn: "Wiederherstellungslink Übertragen",
            switch_reg: "Administrativem Zugang Anfordern", switch_log: "Zurück zur Authentifizierung", forgot: "Verlorene Anmeldeinformationen Wiederherstellen",
            reset_msg: "Verifizierungslink versandt. Bitte überprüfen Sie Ihren sicheren E-Mail-Posteingang."
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
            }
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
        setFormData({ ...formData, password: '' });
    };

    return (
        <div className={`min-h-screen font-sans overflow-x-hidden transition-colors duration-300 flex flex-col items-center justify-center p-6 ${
            theme === 'light' ? 'bg-[#f5f5f5] text-[#111111] selection:bg-black selection:text-white' : 'bg-[#050505] text-white selection:bg-white selection:text-black'
        }`}>
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .animate-fade { animation: fadeIn 0.5s ease-out forwards; }`}</style>
            
            <header className="fixed top-0 left-0 right-0 w-full flex items-center justify-between px-6 md:px-12 py-6 z-50 animate-fade">
                <div className="flex items-center gap-2">
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
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 border ${
                    theme === 'light' ? 'bg-[#f5f5f5] border-[#e0e0e0]' : 'bg-[#050505] border-[#333333]'
                }`}>
                    <ShieldCheck size={24} className={theme === 'light' ? 'text-black' : 'text-white'} />
                </div>
                
                <h1 className="text-[2rem] md:text-[2.2rem] font-black tracking-tighter leading-tight mb-2">
                    {currentT.title}
                </h1>
                <p className={`text-[0.95rem] mb-8 leading-relaxed ${theme === 'light' ? 'text-[#666666]' : 'text-[#aaaaaa]'}`}>
                    {currentT.sub}
                </p>
                
                <form onSubmit={processAuthentication} className="flex flex-col gap-4">
                    {authMode === 'register' && (
                        <input 
                            type="text" 
                            placeholder={currentT.name} 
                            required 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})} 
                            className={`w-full p-4 rounded-xl outline-none transition-colors text-[0.95rem] border ${
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
                        className={`w-full p-4 rounded-xl outline-none transition-colors text-[0.95rem] border ${
                            theme === 'light' ? 'bg-[#f5f5f5] border-[#cccccc] text-black focus:border-black' : 'bg-[#000000] border-[#333333] text-white focus:border-white'
                        }`} 
                    />
                    
                    {authMode !== 'reset' && (
                        <input 
                            type="password" 
                            placeholder={currentT.pass} 
                            required 
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})} 
                            className={`w-full p-4 rounded-xl outline-none transition-colors text-[0.95rem] border ${
                                theme === 'light' ? 'bg-[#f5f5f5] border-[#cccccc] text-black focus:border-black' : 'bg-[#000000] border-[#333333] text-white focus:border-white'
                            }`} 
                        />
                    )}

                    {errorMessage && <p className="text-[#ff4444] text-[0.85rem] font-bold px-2">{errorMessage}</p>}
                    {successMessage && <p className="text-[#00aa55] text-[0.85rem] font-bold px-2">{successMessage}</p>}
                    
                    <button 
                        type="submit"
                        disabled={isLoading} 
                        className={`w-full py-4 mt-2 rounded-xl font-black text-[1rem] transition-colors disabled:opacity-50 outline-none ${
                            theme === 'light' ? 'bg-black text-white hover:bg-[#333333]' : 'bg-white text-black hover:bg-[#e0e0e0]'
                        }`}
                    >
                        {isLoading ? "..." : (authMode === 'login' ? currentT.login_btn : authMode === 'register' ? currentT.reg_btn : currentT.reset_btn)}
                    </button>
                </form>

                <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-dashed border-[#333333]">
                    {authMode === 'login' ? (
                        <>
                            <button 
                                onClick={() => switchAuthMode('reset')} 
                                className={`text-[0.85rem] font-bold transition-colors outline-none text-left ${theme === 'light' ? 'text-[#666666] hover:text-black' : 'text-[#888888] hover:text-white'}`}
                            >
                                {currentT.forgot}
                            </button>
                            <button 
                                onClick={() => switchAuthMode('register')} 
                                className={`text-[0.85rem] font-bold transition-colors outline-none text-left ${theme === 'light' ? 'text-[#666666] hover:text-black' : 'text-[#888888] hover:text-white'}`}
                            >
                                {currentT.switch_reg}
                            </button>
                        </>
                    ) : (
                        <button 
                            onClick={() => switchAuthMode('login')} 
                            className={`text-[0.85rem] font-bold transition-colors outline-none text-left ${theme === 'light' ? 'text-[#666666] hover:text-black' : 'text-[#888888] hover:text-white'}`}
                        >
                            {currentT.switch_log}
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}