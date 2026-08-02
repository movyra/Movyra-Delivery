import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { useCivicStore } from '../../store/useCivicStore';
import { 
    ArrowLeft, 
    Star, 
    Send, 
    BarChart,
    CheckCircle,
    Sun,
    Moon,
    Home,
    LogOut,
    X,
    Globe,
    ArrowUp,
    ShieldCheck,
    ArrowRight
} from 'lucide-react';

export default function CitizenFeedback() {
    const navigate = useNavigate();
    
    // 1. STATE MANAGEMENT
    const theme = useCivicStore((state) => state.theme);
    const toggleTheme = useCivicStore((state) => state.toggleTheme);
    const terminateSession = useCivicStore((state) => state.terminateSession);

    const [lang, setLang] = useState('en');
    const [showLangPrompt, setShowLangPrompt] = useState(false);
    const [showProductsPrompt, setShowProductsPrompt] = useState(false);
    
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [resolvedIssues, setResolvedIssues] = useState([]);
    const [wardScore, setWardScore] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    
    // Form State
    const [selectedIssue, setSelectedIssue] = useState('');
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comments, setComments] = useState('');
    const [submitStatus, setSubmitStatus] = useState('IDLE');

    const localCity = "Mumbai";

    // 2. AUTHENTICATION & DATA FETCHING
    useEffect(() => {
        const sysLang = navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'mr', 'gu', 'te', 'ta', 'pa', 'bho', 'ar', 'es', 'fr', 'de'];
        if (supported.includes(sysLang)) setLang(sysLang);

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setCurrentUser(user);
                await fetchBaseData(user.uid);
            } else {
                navigate('/civic/auth');
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const fetchBaseData = async (userId) => {
        setIsLoading(true);
        try {
            // Fetch User's Resolved Complaints
            const complaintsRef = collection(db, 'civic_complaints');
            const q = query(complaintsRef, where('userId', '==', userId), where('status', '==', 'Completed'));
            const snapshot = await getDocs(q);
            
            const issues = snapshot.docs.map(doc => ({
                id: doc.id,
                title: doc.data().title,
                category: doc.data().category
            }));
            setResolvedIssues(issues);

            // Calculate Overall Ward Score from all feedback
            const feedbackRef = collection(db, 'civic_feedback');
            const feedbackSnapshot = await getDocs(feedbackRef);
            
            if (!feedbackSnapshot.empty) {
                let totalStars = 0;
                feedbackSnapshot.forEach(doc => {
                    totalStars += doc.data().rating;
                });
                const avgScore = (totalStars / feedbackSnapshot.size).toFixed(1);
                setWardScore(avgScore);
                setTotalReviews(feedbackSnapshot.size);
            } else {
                setWardScore(5.0); // Baseline default
                setTotalReviews(0);
            }

        } catch (error) {
            console.error("Failed to retrieve feedback data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        if (!selectedIssue || rating === 0) return;
        
        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'civic_feedback'), {
                userId: currentUser.uid,
                complaintId: selectedIssue,
                rating: rating,
                comment: comments,
                status: 'Published',
                createdAt: serverTimestamp()
            });
            
            setSubmitStatus('SUCCESS');
            setSelectedIssue('');
            setRating(0);
            setComments('');
            
            setTimeout(() => {
                setSubmitStatus('IDLE');
                fetchBaseData(currentUser.uid); // Refresh scores
            }, 3000);
            
        } catch (error) {
            console.error("Submission failed:", error);
            setSubmitStatus('ERROR');
            setTimeout(() => setSubmitStatus('IDLE'), 3000);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            terminateSession();
            navigate('/civic');
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 3. 13-LANGUAGE DICTIONARY (Simple Consumer Context)
    const t = {
        en: {
            lang: "English", back: "Back", log_out: "Log out", careers: "Careers", products: "Products",
            title: "Service Review", sub: "Rate the repair work and help us improve city services.",
            score_title: "City Score", score_sub: "Based on citizen reviews", reviews: "total reviews",
            form_issue: "Select Fixed Issue", form_issue_ph: "Choose an issue...", 
            form_rating: "Your Rating", form_comment: "Comments", form_comment_ph: "Tell us about the work done...",
            btn_submit: "Submit Review", btn_loading: "Sending...", 
            empty_title: "No Completed Issues", empty_sub: "You do not have any finished reports to review yet.",
            succ_title: "Thank You", succ_sub: "Your review has been saved.", err_msg: "Failed to send review."
        },
        hi: {
            lang: "हिन्दी", back: "डैशबोर्ड पर लौटें", log_out: "लॉग आउट", careers: "करियर", products: "उत्पाद",
            title: "सेवा समीक्षा", sub: "मरम्मत कार्य का मूल्यांकन करें और शहर की सेवाओं को बेहतर बनाने में मदद करें।",
            score_title: "शहर का स्कोर", score_sub: "नागरिक समीक्षाओं के आधार पर", reviews: "कुल समीक्षाएं",
            form_issue: "हल की गई समस्या चुनें", form_issue_ph: "एक समस्या चुनें...", 
            form_rating: "आपकी रेटिंग", form_comment: "टिप्पणियाँ", form_comment_ph: "किए गए काम के बारे में बताएं...",
            btn_submit: "समीक्षा भेजें", btn_loading: "भेजा जा रहा है...", 
            empty_title: "कोई हल की गई समस्या नहीं", empty_sub: "आपके पास समीक्षा करने के लिए कोई पूरी रिपोर्ट नहीं है।",
            succ_title: "धन्यवाद", succ_sub: "आपकी समीक्षा सहेज ली गई है।", err_msg: "समीक्षा भेजने में विफल।"
        },
        hinglish: {
            lang: "Hinglish", back: "Dashboard par wapas", log_out: "Log out", careers: "Careers", products: "Products",
            title: "Service Review", sub: "Repair work ko rate karein aur city services improve karne me help karein.",
            score_title: "City Score", score_sub: "Citizen reviews par based", reviews: "total reviews",
            form_issue: "Fixed Issue Select Karein", form_issue_ph: "Ek issue choose karein...", 
            form_rating: "Aapki Rating", form_comment: "Comments", form_comment_ph: "Kaam kaisa hua, batayein...",
            btn_submit: "Review Send Karein", btn_loading: "Bhej rahe hain...", 
            empty_title: "Koi Completed Issue Nahi", empty_sub: "Review karne ke liye koi finished report nahi hai.",
            succ_title: "Thank You", succ_sub: "Aapka review save ho gaya hai.", err_msg: "Review send nahi hua."
        },
        mr: {
            lang: "मराठी", back: "डॅशबोर्डवर परत जा", log_out: "लॉग आउट", careers: "करिअर", products: "उत्पादने",
            title: "सेवा पुनरावलोकन", sub: "दुरुस्तीच्या कामाचे मूल्यमापन करा आणि शहर सेवा सुधारण्यास मदत करा.",
            score_title: "शहर स्कोअर", score_sub: "नागरिकांच्या पुनरावलोकनांवर आधारित", reviews: "एकूण पुनरावलोकने",
            form_issue: "सोडवलेली समस्या निवडा", form_issue_ph: "एक समस्या निवडा...", 
            form_rating: "तुमचे रेटिंग", form_comment: "टिप्पण्या", form_comment_ph: "झालेल्या कामाबद्दल सांगा...",
            btn_submit: "पुनरावलोकन पाठवा", btn_loading: "पाठवत आहे...", 
            empty_title: "कोणत्याही पूर्ण झालेल्या समस्या नाहीत", empty_sub: "पुनरावलोकन करण्यासाठी तुमच्याकडे कोणतेही पूर्ण झालेले अहवाल नाहीत.",
            succ_title: "धन्यवाद", succ_sub: "तुमचे पुनरावलोकन जतन केले आहे.", err_msg: "पुनरावलोकन पाठविण्यात अयशस्वी."
        },
        gu: {
            lang: "ગુજરાતી", back: "ડેશબોર્ડ પર પાછા ફરો", log_out: "લૉગ આઉટ", careers: "કારકિર્દી", products: "ઉત્પાદનો",
            title: "સેવા સમીક્ષા", sub: "સમારકામના કામને રેટ કરો અને શહેરની સેવાઓ સુધારવામાં મદદ કરો.",
            score_title: "શહેરનો સ્કોર", score_sub: "નાગરિક સમીક્ષાઓ પર આધારિત", reviews: "કુલ સમીક્ષાઓ",
            form_issue: "ઉકેલાયેલ સમસ્યા પસંદ કરો", form_issue_ph: "એક સમસ્યા પસંદ કરો...", 
            form_rating: "તમારું રેટિંગ", form_comment: "ટિપ્પણીઓ", form_comment_ph: "થયેલા કામ વિશે જણાવો...",
            btn_submit: "સમીક્ષા મોકલો", btn_loading: "મોકલી રહ્યું છે...", 
            empty_title: "કોઈ પૂર્ણ થયેલી સમસ્યા નથી", empty_sub: "સમીક્ષા કરવા માટે તમારી પાસે કોઈ પૂર્ણ થયેલા અહેવાલો નથી.",
            succ_title: "આભાર", succ_sub: "તમારી સમીક્ષા સાચવવામાં આવી છે.", err_msg: "સમીક્ષા મોકલવામાં નિષ્ફળ."
        },
        te: {
            lang: "తెలుగు", back: "డ్యాష్‌బోర్డ్‌కు తిరిగి వెళ్లండి", log_out: "లాగౌట్", careers: "కెరీర్స్", products: "ఉత్పత్తులు",
            title: "సేవ సమీక్ష", sub: "మరమ్మత్తు పనిని రేట్ చేయండి మరియు నగర సేవలను మెరుగుపరచడంలో సహాయపడండి.",
            score_title: "నగర స్కోర్", score_sub: "పౌరుల సమీక్షల ఆధారంగా", reviews: "మొత్తం సమీక్షలు",
            form_issue: "పరిష్కరించబడిన సమస్యను ఎంచుకోండి", form_issue_ph: "ఒక సమస్యను ఎంచుకోండి...", 
            form_rating: "మీ రేటింగ్", form_comment: "వ్యాఖ్యలు", form_comment_ph: "చేసిన పని గురించి చెప్పండి...",
            btn_submit: "సమీక్షను పంపండి", btn_loading: "పంపుతోంది...", 
            empty_title: "పూర్తయిన సమస్యలు లేవు", empty_sub: "సమీక్షించడానికి మీకు పూర్తయిన నివేదికలు ఏవీ లేవు.",
            succ_title: "ధన్యవాదాలు", succ_sub: "మీ సమీక్ష సేవ్ చేయబడింది.", err_msg: "సమీక్ష పంపడం విఫలమైంది."
        },
        ta: {
            lang: "தமிழ்", back: "டாஷ்போர்டுக்குத் திரும்பு", log_out: "வெளியேறு", careers: "தொழில்கள்", products: "தயாரிப்புகள்",
            title: "சேவை மதிப்பாய்வு", sub: "பழுதுபார்க்கும் பணியை மதிப்பிடுங்கள் மற்றும் நகர சேவைகளை மேம்படுத்த உதவுங்கள்.",
            score_title: "நகர மதிப்பெண்", score_sub: "குடிமக்கள் மதிப்புரைகளின் அடிப்படையில்", reviews: "மொத்த மதிப்புரைகள்",
            form_issue: "சரிசெய்யப்பட்ட சிக்கலைத் தேர்ந்தெடுக்கவும்", form_issue_ph: "ஒரு சிக்கலைத் தேர்ந்தெடுக்கவும்...", 
            form_rating: "உங்கள் மதிப்பீடு", form_comment: "கருத்துகள்", form_comment_ph: "செய்யப்பட்ட வேலை பற்றி சொல்லுங்கள்...",
            btn_submit: "மதிப்பாய்வை அனுப்பு", btn_loading: "அனுப்புகிறது...", 
            empty_title: "முடிக்கப்பட்ட சிக்கல்கள் இல்லை", empty_sub: "மதிப்பாய்வு செய்ய முடிக்கப்பட்ட அறிக்கைகள் உங்களிடம் இல்லை.",
            succ_title: "நன்றி", succ_sub: "உங்கள் மதிப்பாய்வு சேமிக்கப்பட்டது.", err_msg: "மதிப்பாய்வை அனுப்ப முடியவில்லை."
        },
        pa: {
            lang: "ਪੰਜਾਬੀ", back: "ਡੈਸ਼ਬੋਰਡ 'ਤੇ ਵਾਪਸ ਜਾਓ", log_out: "ਲੌਗ ਆਉਟ", careers: "ਕਰੀਅਰ", products: "ਉਤਪਾਦ",
            title: "ਸੇਵਾ ਸਮੀਖਿਆ", sub: "ਮੁਰੰਮਤ ਦੇ ਕੰਮ ਨੂੰ ਦਰਜਾ ਦਿਓ ਅਤੇ ਸ਼ਹਿਰ ਦੀਆਂ ਸੇਵਾਵਾਂ ਨੂੰ ਬਿਹਤਰ ਬਣਾਉਣ ਵਿੱਚ ਮਦਦ ਕਰੋ।",
            score_title: "ਸ਼ਹਿਰ ਦਾ ਸਕੋਰ", score_sub: "ਨਾਗਰਿਕ ਸਮੀਖਿਆਵਾਂ ਦੇ ਆਧਾਰ 'ਤੇ", reviews: "ਕੁੱਲ ਸਮੀਖਿਆਵਾਂ",
            form_issue: "ਹੱਲ ਕੀਤੀ ਸਮੱਸਿਆ ਚੁਣੋ", form_issue_ph: "ਇੱਕ ਸਮੱਸਿਆ ਚੁਣੋ...", 
            form_rating: "ਤੁਹਾਡੀ ਰੇਟਿੰਗ", form_comment: "ਟਿੱਪਣੀਆਂ", form_comment_ph: "ਕੀਤੇ ਗਏ ਕੰਮ ਬਾਰੇ ਦੱਸੋ...",
            btn_submit: "ਸਮੀਖਿਆ ਭੇਜੋ", btn_loading: "ਭੇਜਿਆ ਜਾ ਰਿਹਾ ਹੈ...", 
            empty_title: "ਕੋਈ ਪੂਰੀ ਹੋਈ ਸਮੱਸਿਆ ਨਹੀਂ", empty_sub: "ਸਮੀਖਿਆ ਕਰਨ ਲਈ ਤੁਹਾਡੇ ਕੋਲ ਕੋਈ ਪੂਰੀ ਹੋਈ ਰਿਪੋਰਟ ਨਹੀਂ ਹੈ।",
            succ_title: "ਧੰਨਵਾਦ", succ_sub: "ਤੁਹਾਡੀ ਸਮੀਖਿਆ ਸੁਰੱਖਿਅਤ ਕੀਤੀ ਗਈ ਹੈ।", err_msg: "ਸਮੀਖਿਆ ਭੇਜਣ ਵਿੱਚ ਅਸਫਲ।"
        },
        bho: {
            lang: "भोजपुरी", back: "डैशबोर्ड पर वापस जाईं", log_out: "लॉग आउट", careers: "करियर", products: "उत्पाद",
            title: "सेवा समीक्षा", sub: "मरम्मत के काम के रेट करीं आ शहर के सेवा बेहतर बनावे में मदद करीं।",
            score_title: "शहर के स्कोर", score_sub: "नागरिक समीक्षा के आधार पर", reviews: "कुल समीक्षा",
            form_issue: "हल भइल समस्या चुनीं", form_issue_ph: "एगो समस्या चुनीं...", 
            form_rating: "राउर रेटिंग", form_comment: "टिप्पणी", form_comment_ph: "कइल गइल काम के बारे में बताईं...",
            btn_submit: "समीक्षा भेजीं", btn_loading: "भेजल जा रहल बा...", 
            empty_title: "कौनो पूरा भइल समस्या ना", empty_sub: "समीक्षा करे खातिर राउर कवनो पूरा रिपोर्ट नइखे।",
            succ_title: "धन्यवाद", succ_sub: "राउर समीक्षा सेव हो गइल बा।", err_msg: "समीक्षा भेजे में विफल।"
        },
        ar: {
            lang: "العربية", back: "العودة إلى لوحة القيادة", log_out: "تسجيل الخروج", careers: "الوظائف", products: "المنتجات",
            title: "مراجعة الخدمة", sub: "قيم أعمال الإصلاح وساعدنا في تحسين خدمات المدينة.",
            score_title: "درجة المدينة", score_sub: "بناءً على مراجعات المواطنين", reviews: "إجمالي المراجعات",
            form_issue: "حدد المشكلة الثابتة", form_issue_ph: "اختر مشكلة...", 
            form_rating: "تقييمك", form_comment: "التعليقات", form_comment_ph: "أخبرنا عن العمل المنجز...",
            btn_submit: "إرسال المراجعة", btn_loading: "جاري الإرسال...", 
            empty_title: "لا توجد مشكلات مكتملة", empty_sub: "ليس لديك أي تقارير منتهية لمراجعتها بعد.",
            succ_title: "شكرًا لك", succ_sub: "تم حفظ مراجعتك.", err_msg: "فشل إرسال المراجعة."
        },
        es: {
            lang: "Español", back: "Volver al Tablero", log_out: "Cerrar sesión", careers: "Carreras", products: "Productos",
            title: "Revisión de Servicio", sub: "Califique el trabajo de reparación y ayúdenos a mejorar.",
            score_title: "Puntuación", score_sub: "Basado en opiniones ciudadanas", reviews: "revisiones totales",
            form_issue: "Seleccionar Problema Resuelto", form_issue_ph: "Elija un problema...", 
            form_rating: "Su Calificación", form_comment: "Comentarios", form_comment_ph: "Cuéntenos sobre el trabajo...",
            btn_submit: "Enviar Revisión", btn_loading: "Enviando...", 
            empty_title: "No hay Problemas Completados", empty_sub: "Aún no tiene informes terminados para revisar.",
            succ_title: "Gracias", succ_sub: "Su revisión ha sido guardada.", err_msg: "Error al enviar la revisión."
        },
        fr: {
            lang: "Français", back: "Retour au Tableau de bord", log_out: "Se déconnecter", careers: "Carrières", products: "Produits",
            title: "Évaluation du Service", sub: "Évaluez les travaux de réparation et aidez-nous à nous améliorer.",
            score_title: "Score de la Ville", score_sub: "Basé sur les avis des citoyens", reviews: "avis au total",
            form_issue: "Sélectionner le Problème Résolu", form_issue_ph: "Choisissez un problème...", 
            form_rating: "Votre Note", form_comment: "Commentaires", form_comment_ph: "Parlez-nous du travail accompli...",
            btn_submit: "Envoyer l'Évaluation", btn_loading: "Envoi...", 
            empty_title: "Aucun Problème Terminé", empty_sub: "Vous n'avez pas encore de rapports terminés à évaluer.",
            succ_title: "Merci", succ_sub: "Votre évaluation a été enregistrée.", err_msg: "Échec de l'envoi de l'évaluation."
        },
        de: {
            lang: "Deutsch", back: "Zurück zum Dashboard", log_out: "Abmelden", careers: "Karriere", products: "Produkte",
            title: "Servicebewertung", sub: "Bewerten Sie die Reparaturarbeiten und helfen Sie uns, uns zu verbessern.",
            score_title: "Stadtbewertung", score_sub: "Basierend auf Bürgerbewertungen", reviews: "Gesamtbewertungen",
            form_issue: "Gelöstes Problem Auswählen", form_issue_ph: "Wählen Sie ein Problem...", 
            form_rating: "Ihre Bewertung", form_comment: "Kommentare", form_comment_ph: "Erzählen Sie uns von der Arbeit...",
            btn_submit: "Bewertung Senden", btn_loading: "Senden...", 
            empty_title: "Keine Abgeschlossenen Probleme", empty_sub: "Sie haben noch keine abgeschlossenen Berichte zu bewerten.",
            succ_title: "Danke", succ_sub: "Ihre Bewertung wurde gespeichert.", err_msg: "Fehler beim Senden der Bewertung."
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

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };

    return (
        <div className={`min-h-screen font-sans overflow-x-hidden flex flex-col relative transition-colors duration-300 ${
            theme === 'light' ? 'bg-[#f5f5f5] text-[#111111] selection:bg-black selection:text-white' : 'bg-[#050505] text-white selection:bg-white selection:text-black'
        }`}>
            <style>
                {`
                  @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                  .animate-fade { animation: fadeIn 0.8s ease-out forwards; }
                  html { scroll-behavior: smooth; }
                `}
            </style>

            {/* TOP HEADER */}
            <header className={`fixed top-0 left-0 right-0 w-full flex items-center justify-between px-6 md:px-12 py-6 animate-fade z-50 transition-colors border-b ${
                theme === 'light' ? 'bg-[#f5f5f5]/90 border-[#e0e0e0] backdrop-blur-md' : 'bg-[#050505]/90 border-[#111111] backdrop-blur-md'
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
                
                <div className="flex items-center gap-3 sm:gap-6 text-[0.9rem] font-bold">
                    <button 
                        onClick={handleSignOut} 
                        className={`transition-colors outline-none hidden sm:block ${theme === 'light' ? 'text-[#555555] hover:text-black' : 'text-[#888888] hover:text-white'}`}
                    >
                        {currentT.log_out}
                    </button>
                    
                    <button 
                        onClick={handleSignOut} 
                        className={`p-2 rounded-full transition-colors outline-none block sm:hidden ${theme === 'light' ? 'bg-[#e0e0e0] text-black hover:bg-[#cccccc]' : 'bg-[#222222] text-white hover:bg-[#333333]'}`}
                        aria-label="Log Out"
                    >
                        <LogOut size={18} />
                    </button>

                    <button 
                        onClick={toggleTheme}
                        className={`p-2 rounded-full transition-colors outline-none ${theme === 'light' ? 'bg-[#e0e0e0] text-black hover:bg-[#cccccc]' : 'bg-[#222222] text-white hover:bg-[#333333]'}`}
                        aria-label="Toggle Theme"
                    >
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    </button>

                    <button 
                        onClick={() => navigate('/civic')} 
                        className={`p-2.5 rounded-full flex items-center justify-center transition-colors outline-none border ${
                            theme === 'light' ? 'bg-white border-[#cccccc] text-black hover:border-black' : 'bg-[#111111] border-[#333333] text-white hover:border-white'
                        }`}
                        aria-label="Home"
                    >
                        <Home size={18} />
                    </button>
                </div>
            </header>

            {/* LANGUAGE SELECTOR MODAL */}
            <AnimatePresence>
                {showLangPrompt && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className={`fixed inset-0 z-[9999] backdrop-blur-md flex items-center justify-center p-6 ${theme === 'light' ? 'bg-white/90' : 'bg-black/90'}`}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className={`w-full max-w-[400px] rounded-3xl p-8 flex flex-col shadow-2xl relative max-h-[80vh] overflow-y-auto border ${
                                theme === 'light' ? 'bg-white border-[#e0e0e0]' : 'bg-[#0a0a0a] border-[#222222]'
                            }`}
                        >
                            <button 
                                onClick={() => setShowLangPrompt(false)} 
                                className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center transition-colors outline-none ${
                                    theme === 'light' ? 'text-[#888888] hover:text-black' : 'text-[#888888] hover:text-white'
                                }`}
                            >
                                <X size={18} />
                            </button>
                            
                            <div className="w-12 h-12 mx-auto rounded-full border border-[#333333] flex items-center justify-center mb-4">
                                <Globe size={24} stroke={theme === 'light' ? 'black' : 'white'} strokeWidth="1.5" />
                            </div>

                            <h2 className={`text-[1.4rem] font-black tracking-tight mb-6 text-center ${theme === 'light' ? 'text-black' : 'text-white'}`}>Select Language</h2>
                            
                            <div className="flex flex-col gap-2">
                                {languageOptions.map((option) => (
                                    <button 
                                        key={option.code}
                                        onClick={() => { setLang(option.code); setShowLangPrompt(false); }}
                                        className={`w-full p-4 rounded-xl flex items-center justify-between group transition-colors outline-none border ${
                                            theme === 'light' 
                                                ? (lang === option.code ? 'bg-[#f0f0f0] border-black' : 'bg-white border-[#e0e0e0] hover:border-black')
                                                : (lang === option.code ? 'bg-[#222222] border-white' : 'bg-[#0a0a0a] border-[#333333] hover:border-white')
                                        }`}
                                    >
                                        <span className={`font-bold text-[1rem] ${
                                            theme === 'light'
                                                ? (lang === option.code ? 'text-black' : 'text-[#666666] group-hover:text-black')
                                                : (lang === option.code ? 'text-white' : 'text-[#888888] group-hover:text-white')
                                        }`}>{option.label}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* PRODUCTS ECOSYSTEM MODAL */}
            <AnimatePresence>
                {showProductsPrompt && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className={`fixed inset-0 z-[9999] backdrop-blur-md flex items-center justify-center p-6 ${theme === 'light' ? 'bg-white/90' : 'bg-black/90'}`}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className={`w-full max-w-[500px] rounded-3xl p-8 flex flex-col shadow-2xl relative border ${
                                theme === 'light' ? 'bg-white border-[#e0e0e0]' : 'bg-[#0a0a0a] border-[#222222]'
                            }`}
                        >
                            <button 
                                onClick={() => setShowProductsPrompt(false)} 
                                className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center transition-colors outline-none ${
                                    theme === 'light' ? 'text-[#888888] hover:text-black' : 'text-[#888888] hover:text-white'
                                }`}
                            >
                                <X size={18} />
                            </button>

                            <h2 className={`text-[1.5rem] font-black tracking-tight mb-2 text-center mt-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>Also from us</h2>
                            <p className={`text-[0.9rem] text-center mb-8 ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>Discover our connected platforms.</p>

                            <Link to="/civic" className={`group flex flex-col items-center gap-4 p-6 rounded-2xl transition-colors text-center w-full outline-none border ${
                                theme === 'light' ? 'bg-[#f9f9f9] border-[#e0e0e0] hover:border-black' : 'bg-[#111111] border-[#333333] hover:border-white'
                            }`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <img 
                                        src={theme === 'light' ? '/logo-3.png' : '/logo.png'} 
                                        alt="Movyra" 
                                        className="h-6 w-auto" 
                                        onError={(e) => e.target.style.display = 'none'} 
                                    />
                                    <span className={`font-black text-[1.2rem] tracking-tighter ml-[-5px] ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                                        ovyra <span className="text-[#888888] font-medium text-[1rem] ml-1">Civic</span>
                                    </span>
                                </div>
                                <div>
                                    <p className={`text-[0.85rem] leading-relaxed transition-colors ${theme === 'light' ? 'text-[#666666] group-hover:text-black' : 'text-[#888888] group-hover:text-[#aaaaaa]'}`}>
                                        Smart city management. Report issues easily.
                                    </p>
                                </div>
                            </Link>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex-1 max-w-[1000px] w-full mx-auto px-6 md:px-12 pb-12 mt-32 animate-fade">
                
                <button 
                    onClick={() => navigate('/civic')}
                    className={`flex items-center gap-2 mb-10 outline-none font-bold text-[0.9rem] transition-colors ${
                        theme === 'light' ? 'text-[#666666] hover:text-black' : 'text-[#888888] hover:text-white'
                    }`}
                >
                    <ArrowLeft size={16} /> {currentT.back}
                </button>

                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div>
                        <h1 className="text-[2.5rem] md:text-[3.5rem] font-black leading-[1.1] tracking-tighter mb-4">
                            {currentT.title}
                        </h1>
                        <p className={`text-[1.1rem] ${theme === 'light' ? 'text-[#555555]' : 'text-[#aaaaaa]'}`}>
                            {currentT.sub}
                        </p>
                    </div>

                    <div className={`p-6 rounded-2xl border flex items-center gap-6 shrink-0 ${theme === 'light' ? 'bg-white border-[#e0e0e0]' : 'bg-[#111111] border-[#333333]'}`}>
                        <div>
                            <p className={`text-[0.8rem] font-bold uppercase tracking-wider mb-1 ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{currentT.score_title}</p>
                            <div className="flex items-end gap-2">
                                <span className={`text-[2.5rem] font-black leading-none ${theme === 'light' ? 'text-black' : 'text-white'}`}>{wardScore}</span>
                                <span className={`text-[1.2rem] font-bold pb-1 ${theme === 'light' ? 'text-[#aaaaaa]' : 'text-[#666666]'}`}>/ 5.0</span>
                            </div>
                            <p className={`text-[0.8rem] mt-1 ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{totalReviews} {currentT.reviews}</p>
                        </div>
                        <BarChart size={32} className={theme === 'light' ? 'text-[#cccccc]' : 'text-[#444444]'} />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mb-4 ${theme === 'light' ? 'border-black' : 'border-white'}`}></div>
                    </div>
                ) : resolvedIssues.length === 0 ? (
                    <div className={`rounded-3xl p-12 text-center border border-dashed flex flex-col items-center justify-center ${
                        theme === 'light' ? 'bg-white border-[#cccccc]' : 'bg-[#111111] border-[#333333]'
                    }`}>
                        <CheckCircle size={48} className={`mb-6 ${theme === 'light' ? 'text-[#cccccc]' : 'text-[#333333]'}`} />
                        <h2 className="text-[1.5rem] font-black tracking-tight mb-2">{currentT.empty_title}</h2>
                        <p className={`text-[1rem] mb-8 ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{currentT.empty_sub}</p>
                    </div>
                ) : (
                    <motion.div initial="hidden" animate="visible" variants={containerVariants} className={`rounded-3xl p-8 md:p-12 border ${
                        theme === 'light' ? 'bg-white border-[#e0e0e0]' : 'bg-[#111111] border-[#333333]'
                    }`}>
                        
                        <AnimatePresence mode="wait">
                            {submitStatus === 'SUCCESS' ? (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }} 
                                    animate={{ opacity: 1, scale: 1 }} 
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="flex flex-col items-center justify-center py-16 text-center"
                                >
                                    <CheckCircle size={64} className={`mb-6 ${theme === 'light' ? 'text-[#00aa55]' : 'text-[#00ff88]'}`} />
                                    <h2 className="text-[2rem] font-black tracking-tight mb-2">{currentT.succ_title}</h2>
                                    <p className={`text-[1.1rem] ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>{currentT.succ_sub}</p>
                                </motion.div>
                            ) : (
                                <motion.form 
                                    variants={itemVariants} 
                                    onSubmit={handleFeedbackSubmit} 
                                    className="flex flex-col gap-8"
                                    exit={{ opacity: 0 }}
                                >
                                    {submitStatus === 'ERROR' && (
                                        <p className="text-[#ff4444] font-bold bg-[#ff4444]/10 p-4 rounded-xl text-center">{currentT.err_msg}</p>
                                    )}

                                    <div>
                                        <label className={`block text-[0.85rem] font-bold uppercase tracking-wider mb-3 ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>
                                            {currentT.form_issue}
                                        </label>
                                        <select 
                                            required
                                            value={selectedIssue}
                                            onChange={(e) => setSelectedIssue(e.target.value)}
                                            className={`w-full p-4 rounded-xl outline-none transition-colors text-[0.95rem] font-bold appearance-none border ${
                                                theme === 'light' ? 'bg-[#f5f5f5] border-[#cccccc] text-black focus:border-black' : 'bg-[#000000] border-[#333333] text-white focus:border-white'
                                            }`}
                                        >
                                            <option value="" disabled hidden>{currentT.form_issue_ph}</option>
                                            {resolvedIssues.map(issue => (
                                                <option key={issue.id} value={issue.id}>{issue.category} - {issue.title}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className={`block text-[0.85rem] font-bold uppercase tracking-wider mb-3 ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>
                                            {currentT.form_rating}
                                        </label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onMouseEnter={() => setHoveredRating(star)}
                                                    onMouseLeave={() => setHoveredRating(0)}
                                                    onClick={() => setRating(star)}
                                                    className="p-2 outline-none transition-transform hover:scale-110"
                                                >
                                                    <Star 
                                                        size={36} 
                                                        className={`transition-colors ${
                                                            star <= (hoveredRating || rating) 
                                                                ? (theme === 'light' ? 'text-[#ffaa00] fill-[#ffaa00]' : 'text-[#ffcc00] fill-[#ffcc00]') 
                                                                : (theme === 'light' ? 'text-[#cccccc]' : 'text-[#333333]')
                                                        }`} 
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className={`block text-[0.85rem] font-bold uppercase tracking-wider mb-3 ${theme === 'light' ? 'text-[#666666]' : 'text-[#888888]'}`}>
                                            {currentT.form_comment}
                                        </label>
                                        <textarea 
                                            required
                                            rows="4"
                                            placeholder={currentT.form_comment_ph}
                                            value={comments}
                                            onChange={(e) => setComments(e.target.value)}
                                            className={`w-full p-4 rounded-xl outline-none transition-colors text-[0.95rem] resize-none border ${
                                                theme === 'light' ? 'bg-[#f5f5f5] border-[#cccccc] text-black focus:border-black' : 'bg-[#000000] border-[#333333] text-white focus:border-white'
                                            }`}
                                        ></textarea>
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting || rating === 0 || !selectedIssue}
                                        className={`w-full py-4 rounded-xl font-black text-[1rem] flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed outline-none ${
                                            theme === 'light' ? 'bg-black text-white hover:bg-[#333333]' : 'bg-white text-black hover:bg-[#e0e0e0]'
                                        }`}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className={`w-4 h-4 border-2 border-t-transparent rounded-full animate-spin ${theme === 'light' ? 'border-white' : 'border-black'}`}></div>
                                                {currentT.btn_loading}
                                            </>
                                        ) : (
                                            <>
                                                <Send size={18} /> {currentT.btn_submit}
                                            </>
                                        )}
                                    </button>
                                </motion.form>
                            )}
                        </AnimatePresence>

                    </motion.div>
                )}
            </div>

            {/* FOOTER ALIGNMENT */}
            <footer className={`w-full mx-auto mt-auto flex flex-col md:flex-row items-center justify-between gap-8 px-8 md:px-16 py-12 border-t opacity-0 animate-fade stagger-3 relative z-10 ${
                theme === 'light' ? 'border-[#e0e0e0] bg-[#ffffff]' : 'border-[#111111] bg-[#050505]'
            }`}>
                <div className="flex flex-wrap items-center gap-6">
                    <button onClick={() => setShowLangPrompt(true)} className={`flex items-center gap-2 text-[0.8rem] font-bold px-3 py-1.5 rounded-full transition-colors border outline-none ${theme === 'light' ? 'border-[#cccccc] hover:border-black text-[#555555]' : 'border-[#333333] hover:border-white text-[#888888]'}`}>
                        <Globe size={14} /> {currentT.lang}
                    </button>
                    <div className={`flex items-center gap-6 ${theme === 'light' ? 'text-[#666666]' : 'text-[#555555]'}`}>
                        <a href="https://www.linkedin.com/company/getmovyra/" target="_blank" rel="noopener noreferrer" className={`transition-colors outline-none ${theme === 'light' ? 'hover:text-black' : 'hover:text-white'}`}>
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        </a>
                        <a href="#youtube" className={`transition-colors outline-none ${theme === 'light' ? 'hover:text-black' : 'hover:text-white'}`}>
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
                        </a>
                        <a href="https://www.instagram.com/getmovyra" target="_blank" rel="noopener noreferrer" className={`transition-colors outline-none ${theme === 'light' ? 'hover:text-black' : 'hover:text-white'}`}>
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                        </a>
                        <a href="#x" className={`transition-colors outline-none ${theme === 'light' ? 'hover:text-black' : 'hover:text-white'}`}>
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.006 4.15H5.078z"/></svg>
                        </a>
                    </div>
                </div>
                
                <div className={`flex flex-col md:flex-row items-center gap-6 text-[0.8rem] font-bold ${theme === 'light' ? 'text-[#666666]' : 'text-[#555555]'}`}>
                    <div className="flex items-center gap-6">
                        <button onClick={() => setShowProductsPrompt(true)} className={`transition-colors outline-none ${theme === 'light' ? 'hover:text-black' : 'hover:text-white'}`}>{currentT.products}</button>
                        <span className={`w-1 h-1 rounded-full ${theme === 'light' ? 'bg-[#cccccc]' : 'bg-[#333333]'}`}></span>
                        <Link to="/careers" className={`transition-colors outline-none ${theme === 'light' ? 'hover:text-black' : 'hover:text-white'}`}>{currentT.careers}</Link>
                        <span className={`w-1 h-1 rounded-full ${theme === 'light' ? 'bg-[#cccccc]' : 'bg-[#333333]'}`}></span>
                        <div className={`flex items-center gap-2 transition-colors cursor-default ${theme === 'light' ? 'hover:text-black' : 'hover:text-white'}`}>
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            {localCity}, IN
                        </div>
                    </div>
                    <span className={`hidden md:block w-1 h-1 rounded-full ${theme === 'light' ? 'bg-[#cccccc]' : 'bg-[#333333]'}`}></span>
                    
                    <div className="flex items-center gap-2 text-[0.75rem] uppercase tracking-wider">
                        Built by 
                        <a href="https://rebrand.ly/aatns" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition-opacity outline-none">
                            <img 
                                src={theme === 'light' ? '/aat2' : '/aatns-dark.png'} 
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