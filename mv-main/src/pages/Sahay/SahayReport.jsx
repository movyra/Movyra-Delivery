import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { useCivicStore } from '../../store/useCivicStore';
import { uploadSahayMedia } from '../../services/pocketbase';
import { 
    Camera, 
    MapPin, 
    AlertTriangle, 
    Send, 
    X,
    Globe,
    ArrowUp,
    ArrowLeft,
    Save,
    CheckCircle,
    User
} from 'lucide-react';

export default function SahayReport() {
    const navigate = useNavigate();
    
    // 1. STATE MANAGEMENT
    const theme = useCivicStore((state) => state.theme);
    const terminateSession = useCivicStore((state) => state.terminateSession);

    const [lang, setLang] = useState('en');
    const [showLangPrompt, setShowLangPrompt] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    
    // Form State
    const [formData, setFormData] = useState({
        reporterName: '',
        needyName: '',
        bloodGroup: '',
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

    // Autocomplete State
    const [addressSuggestions, setAddressSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const debounceTimeout = useRef(null);

    // 2. AUTHENTICATION & INITIALIZATION
    useEffect(() => {
        const sysLang = navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'hinglish', 'mr', 'gu', 'te', 'ta', 'pa', 'bho', 'ar', 'es', 'fr', 'de'];
        if (supported.includes(sysLang)) setLang(sysLang);

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) setCurrentUser(user);
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
    }, []);

    // 3. OFFLINE DRAFT & SEVERITY ESTIMATION ENGINE
    useEffect(() => {
        if (formData.category || formData.address || formData.description || formData.needyName) {
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

    // 4. FUNCTIONAL LOGIC & GEOCODING
    const handleSignOut = async () => {
        try {
            await signOut(auth);
            terminateSession();
            navigate('/sahay');
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

    // Address Autocomplete Logic
    const handleAddressChange = (e) => {
        const val = e.target.value;
        setFormData({ ...formData, address: val });

        if (val.length < 3) {
            setAddressSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

        debounceTimeout.current = setTimeout(async () => {
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&limit=5&countrycodes=in`);
                const data = await response.json();
                setAddressSuggestions(data);
                setShowSuggestions(true);
            } catch (error) {
                console.error("Geocoding failed:", error);
            }
        }, 600); // 600ms debounce to prevent API rate limits
    };

    const selectSuggestion = (suggestion) => {
        setFormData({
            ...formData,
            address: suggestion.display_name,
            lat: parseFloat(suggestion.lat),
            lng: parseFloat(suggestion.lon)
        });
        setShowSuggestions(false);
    };

    // Exact Location Capture (Reverse Geocoding)
    const getLocation = () => {
        setIsLocating(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                        const data = await response.json();
                        setFormData(prev => ({
                            ...prev,
                            lat: lat,
                            lng: lng,
                            address: data.display_name || "Location captured via GPS"
                        }));
                    } catch (error) {
                        setFormData(prev => ({
                            ...prev,
                            lat: lat,
                            lng: lng,
                            address: "Location captured via GPS"
                        }));
                    }
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

    const submitReport = async (e) => {
        e.preventDefault();
        
        if (!photoFile) {
            alert(currentT.err_photo_req);
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus('IDLE');

        try {
            const uploaderType = currentUser ? 'registered_user' : 'anonymous';
            const mediaUrl = await uploadSahayMedia(photoFile, null, 'needy_photo', uploaderType);

            await addDoc(collection(db, 'sahay_cases'), {
                userId: currentUser ? currentUser.uid : 'anonymous',
                reporterName: formData.reporterName || 'Anonymous',
                needyName: formData.needyName,
                bloodGroup: formData.bloodGroup || 'Unknown',
                category: formData.category,
                address: formData.address,
                location: formData.lat ? { lat: formData.lat, lng: formData.lng } : null,
                danger: formData.danger,
                condition: formData.description,
                severity: estimatedSeverity,
                mediaUrl: mediaUrl,
                status: 'Reported',
                createdAt: serverTimestamp()
            });

            localStorage.removeItem('sahay_report_draft');
            setFormData({ reporterName: '', needyName: '', bloodGroup: '', category: '', address: '', lat: null, lng: null, danger: 'No', description: '' });
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

    // 5. 13-LANGUAGE DICTIONARY (Fully Translated, Professional, Simple Terms)
    const t = {
        en: {
            lang: "English", log_out: "Log out", careers: "Careers", products: "Products", back: "Back to Home", sign_in: "Sign In",
            title: "Report a Need", sub: "Help us connect them with verified rescue teams quickly. No account required.",
            draft_saved: "Draft Saved", gps_err: "Could not get location. Please type the address.",
            lbl_reporter: "Your Name (Optional)", lbl_needy: "Person in Need Name (Required)", lbl_blood: "Blood Group (Optional)",
            lbl_cat: "Category", cat_1: "Homeless Person", cat_2: "Abandoned Elderly", cat_3: "Injured Animal", cat_4: "Medical Emergency",
            lbl_photo: "Live Photo (Required)", btn_photo: "Take Photo / Upload", err_photo_req: "A photo of the person in need is strictly required for verification.",
            lbl_loc: "Exact Location", btn_gps: "Use My Current Location", ph_address: "Search or type exact address...",
            lbl_danger: "Are they in immediate danger?",
            lbl_desc: "Condition Details", ph_desc: "Describe their condition, age, injuries, or any helpful details...",
            lbl_severity: "Urgency:",
            btn_submit: "Submit Report", btn_loading: "Uploading Securely...",
            succ_title: "Report Received", succ_sub: "Organizations have been notified. Thank you.", btn_new: "Report Another"
        },
        hi: {
            lang: "हिन्दी", log_out: "लॉग आउट", careers: "करियर", products: "उत्पाद", back: "होम पर वापस जाएं", sign_in: "साइन इन",
            title: "सहायता की रिपोर्ट करें", sub: "उन्हें सत्यापित बचाव दलों से जल्दी जोड़ने में हमारी मदद करें। किसी खाते की आवश्यकता नहीं है।",
            draft_saved: "ड्राफ्ट सहेजा गया", gps_err: "स्थान प्राप्त नहीं हो सका। कृपया पता टाइप करें।",
            lbl_reporter: "आपका नाम (वैकल्पिक)", lbl_needy: "जरूरतमंद का नाम (आवश्यक)", lbl_blood: "रक्त समूह (वैकल्पिक)",
            lbl_cat: "श्रेणी", cat_1: "बेघर व्यक्ति", cat_2: "अकेले बुजुर्ग", cat_3: "घायल जानवर", cat_4: "चिकित्सा आपातकाल",
            lbl_photo: "लाइव फोटो (आवश्यक)", btn_photo: "फोटो लें / अपलोड करें", err_photo_req: "सत्यापन के लिए जरूरतमंद व्यक्ति की फोटो अनिवार्य है।",
            lbl_loc: "सटीक स्थान", btn_gps: "मेरे वर्तमान स्थान का उपयोग करें", ph_address: "सटीक पता खोजें या टाइप करें...",
            lbl_danger: "क्या वे तत्काल खतरे में हैं?",
            lbl_desc: "स्थिति का विवरण", ph_desc: "उनकी स्थिति, आयु, चोट या कोई सहायक विवरण बताएं...",
            lbl_severity: "तात्कालिकता:",
            btn_submit: "रिपोर्ट जमा करें", btn_loading: "सुरक्षित रूप से अपलोड हो रहा है...",
            succ_title: "रिपोर्ट प्राप्त हुई", succ_sub: "संगठनों को सूचित कर दिया गया है। धन्यवाद।", btn_new: "एक और रिपोर्ट करें"
        },
        hinglish: {
            lang: "Hinglish", log_out: "Log out", careers: "Careers", products: "Products", back: "Home par wapas", sign_in: "Sign In",
            title: "Report Darj Karein", sub: "Unhe verified rescue teams se jaldi connect karne mein help karein. Account ki zaroorat nahi hai.",
            draft_saved: "Draft Save Ho Gaya", gps_err: "Location nahi mil paayi. Kripya address type karein.",
            lbl_reporter: "Aapka Naam (Optional)", lbl_needy: "Zarooratmand ka Naam (Required)", lbl_blood: "Blood Group (Optional)",
            lbl_cat: "Category", cat_1: "Homeless Person", cat_2: "Abandoned Elderly", cat_3: "Injured Animal", cat_4: "Medical Emergency",
            lbl_photo: "Live Photo (Required)", btn_photo: "Photo Lein / Upload", err_photo_req: "Verification ke liye photo strictly required hai.",
            lbl_loc: "Exact Location", btn_gps: "Mera Current Location Use Karein", ph_address: "Search ya exact address type karein...",
            lbl_danger: "Kya wo immediate danger mein hain?",
            lbl_desc: "Condition Details", ph_desc: "Unki condition, age, injuries ya koi helpful details batayein...",
            lbl_severity: "Urgency:",
            btn_submit: "Report Submit Karein", btn_loading: "Securely upload ho raha hai...",
            succ_title: "Report Mil Gayi", succ_sub: "Organizations ko notify kar diya gaya hai. Shukriya.", btn_new: "Dusri Report Karein"
        },
        mr: {
            lang: "मराठी", log_out: "लॉग आउट", careers: "करिअर", products: "उत्पादने", back: "मुख्यपृष्ठावर परत", sign_in: "साइन इन",
            title: "गरजेचा अहवाल द्या", sub: "त्यांना सत्यापित बचाव पथकांशी त्वरित जोडण्यास आम्हाला मदत करा. खात्याची आवश्यकता नाही.",
            draft_saved: "मसुदा जतन केला", gps_err: "स्थान मिळू शकले नाही. कृपया पत्ता टाइप करा.",
            lbl_reporter: "तुमचे नाव (पर्यायी)", lbl_needy: "गरजू व्यक्तीचे नाव (आवश्यक)", lbl_blood: "रक्तगट (पर्यायी)",
            lbl_cat: "श्रेणी", cat_1: "बेघर व्यक्ती", cat_2: "बेवारस वृद्ध", cat_3: "जखमी प्राणी", cat_4: "वैद्यकीय आणीबाणी",
            lbl_photo: "थेट फोटो (आवश्यक)", btn_photo: "फोटो घ्या / अपलोड करा", err_photo_req: "सत्यापनासाठी गरजू व्यक्तीचा फोटो काटेकोरपणे आवश्यक आहे.",
            lbl_loc: "अचूक स्थान", btn_gps: "माझे वर्तमान स्थान वापरा", ph_address: "शोधा किंवा अचूक पत्ता टाइप करा...",
            lbl_danger: "ते तात्काळ धोक्यात आहेत का?",
            lbl_desc: "स्थिती तपशील", ph_desc: "त्यांची स्थिती, वय, जखम किंवा कोणतेही उपयुक्त तपशील वर्णन करा...",
            lbl_severity: "तात्कालिकता:",
            btn_submit: "अहवाल सादर करा", btn_loading: "सुरक्षितपणे अपलोड होत आहे...",
            succ_title: "अहवाल प्राप्त झाला", succ_sub: "संस्थांना सूचित केले आहे. धन्यवाद.", btn_new: "दुसरा अहवाल द्या"
        },
        gu: {
            lang: "ગુજરાતી", log_out: "લોગ આઉટ", careers: "કારકિર્દી", products: "ઉત્પાદનો", back: "હોમ પર પાછા ફરો", sign_in: "સાઇન ઇન",
            title: "જરૂરિયાતની જાણ કરો", sub: "તેમને ચકાસાયેલ બચાવ ટીમો સાથે ઝડપથી જોડવામાં અમારી સહાય કરો. ખાતાની જરૂર નથી.",
            draft_saved: "ડ્રાફ્ટ સાચવેલ છે", gps_err: "સ્થાન મેળવી શક્યા નથી. કૃપા કરીને સરનામું લખો.",
            lbl_reporter: "તમારું નામ (વૈકલ્પિક)", lbl_needy: "જરૂરિયાતમંદનું નામ (આવશ્યક)", lbl_blood: "રક્ત જૂથ (વૈકલ્પિક)",
            lbl_cat: "શ્રેણી", cat_1: "બેઘર વ્યક્તિ", cat_2: "ત્યજી દેવાયેલા વૃદ્ધ", cat_3: "ઘાયલ પ્રાણી", cat_4: "તબીબી કટોકટી",
            lbl_photo: "જીવંત ફોટો (આવશ્યક)", btn_photo: "ફોટો લો / અપલોડ કરો", err_photo_req: "ચકાસણી માટે જરૂરિયાતમંદ વ્યક્તિનો ફોટો સખત રીતે જરૂરી છે.",
            lbl_loc: "ચોક્કસ સ્થાન", btn_gps: "મારું વર્તમાન સ્થાન વાપરો", ph_address: "ચોક્કસ સરનામું શોધો અથવા લખો...",
            lbl_danger: "શું તેઓ તાત્કાલિક જોખમમાં છે?",
            lbl_desc: "સ્થિતિ વિગતો", ph_desc: "તેમની સ્થિતિ, ઉંમર, ઇજાઓ અથવા કોઈપણ મદદરૂપ વિગતો વર્ણવો...",
            lbl_severity: "તાકીદ:",
            btn_submit: "અહેવાલ સબમિટ કરો", btn_loading: "સુરક્ષિત રીતે અપલોડ થઈ રહ્યું છે...",
            succ_title: "અહેવાલ પ્રાપ્ત થયો", succ_sub: "સંસ્થાઓને જાણ કરવામાં આવી છે. આભાર.", btn_new: "બીજો અહેવાલ આપો"
        },
        te: {
            lang: "తెలుగు", log_out: "లాగౌట్", careers: "కెరీర్స్", products: "ఉత్పత్తులు", back: "హోమ్‌కు తిరిగి వెళ్లండి", sign_in: "సైన్ ఇన్",
            title: "అవసరాన్ని నివేదించండి", sub: "ధృవీకరించబడిన రెస్క్యూ బృందాలతో వారిని త్వరగా కనెక్ట్ చేయడంలో మాకు సహాయపడండి. ఖాతా అవసరం లేదు.",
            draft_saved: "డ్రాఫ్ట్ సేవ్ చేయబడింది", gps_err: "స్థానాన్ని పొందలేకపోయాము. దయచేసి చిరునామాను టైప్ చేయండి.",
            lbl_reporter: "మీ పేరు (ఐచ్ఛికం)", lbl_needy: "అవసరమైన వ్యక్తి పేరు (తప్పనిసరి)", lbl_blood: "రక్త వర్గం (ఐచ్ఛికం)",
            lbl_cat: "వర్గం", cat_1: "నిరాశ్రయులైన వ్యక్తి", cat_2: "వదిలివేయబడిన వృద్ధులు", cat_3: "గాయపడిన జంతువు", cat_4: "వైద్య అత్యవసరం",
            lbl_photo: "లైవ్ ఫోటో (తప్పనిసరి)", btn_photo: "ఫోటో తీయండి / అప్‌లోడ్ చేయండి", err_photo_req: "ధృవీకరణ కోసం అవసరమైన వ్యక్తి ఫోటో ఖచ్చితంగా అవసరం.",
            lbl_loc: "ఖచ్చితమైన స్థానం", btn_gps: "నా ప్రస్తుత స్థానాన్ని ఉపయోగించండి", ph_address: "ఖచ్చితమైన చిరునామాను శోధించండి లేదా టైప్ చేయండి...",
            lbl_danger: "వారు తక్షణ ప్రమాదంలో ఉన్నారా?",
            lbl_desc: "పరిస్థితి వివరాలు", ph_desc: "వారి పరిస్థితి, వయస్సు, గాయాలు లేదా ఏదైనా సహాయకరమైన వివరాలను వివరించండి...",
            lbl_severity: "అత్యవసరం:",
            btn_submit: "నివేదికను సమర్పించండి", btn_loading: "సురక్షితంగా అప్‌లోడ్ చేయబడుతోంది...",
            succ_title: "నివేదిక స్వీకరించబడింది", succ_sub: "సంస్థలకు తెలియజేయబడింది. ధన్యవాదాలు.", btn_new: "మరొకటి నివేదించండి"
        },
        ta: {
            lang: "தமிழ்", log_out: "வெளியேறு", careers: "தொழில்கள்", products: "தயாரிப்புகள்", back: "முகப்புக்குத் திரும்பு", sign_in: "உள்நுழைய",
            title: "தேவையை புகாரளிக்கவும்", sub: "சரிபார்க்கப்பட்ட மீட்புக் குழுக்களுடன் அவர்களை விரைவாக இணைக்க எங்களுக்கு உதவுங்கள். கணக்கு தேவையில்லை.",
            draft_saved: "வரைவு சேமிக்கப்பட்டது", gps_err: "இருப்பிடத்தைப் பெற முடியவில்லை. முகவரியைத் தட்டச்சு செய்யவும்.",
            lbl_reporter: "உங்கள் பெயர் (விருப்பம்)", lbl_needy: "தேவையுள்ள நபரின் பெயர் (கட்டாயம்)", lbl_blood: "இரத்த வகை (விருப்பம்)",
            lbl_cat: "வகை", cat_1: "வீடற்ற நபர்", cat_2: "கைவிடப்பட்ட முதியவர்கள்", cat_3: "காயமடைந்த விலங்கு", cat_4: "மருத்துவ அவசரம்",
            lbl_photo: "நேரடி புகைப்படம் (கட்டாயம்)", btn_photo: "புகைப்படம் எடு / பதிவேற்று", err_photo_req: "சரிபார்ப்புக்கு தேவையுள்ள நபரின் புகைப்படம் கண்டிப்பாக தேவை.",
            lbl_loc: "சரியான இடம்", btn_gps: "எனது தற்போதைய இருப்பிடத்தைப் பயன்படுத்து", ph_address: "சரியான முகவரியைத் தேடவும் அல்லது தட்டச்சு செய்யவும்...",
            lbl_danger: "அவர்கள் உடனடி ஆபத்தில் உள்ளார்களா?",
            lbl_desc: "நிலை விவரங்கள்", ph_desc: "அவர்களின் நிலை, வயது, காயங்கள் அல்லது ஏதேனும் பயனுள்ள விவரங்களை விவரிக்கவும்...",
            lbl_severity: "அவசரம்:",
            btn_submit: "அறிக்கையை சமர்ப்பிக்கவும்", btn_loading: "பாதுகாப்பாக பதிவேற்றப்படுகிறது...",
            succ_title: "அறிக்கை பெறப்பட்டது", succ_sub: "அமைப்புகளுக்கு அறிவிக்கப்பட்டுள்ளது. நன்றி.", btn_new: "மற்றொன்றை புகாரளிக்கவும்"
        },
        pa: {
            lang: "ਪੰਜਾਬੀ", log_out: "ਲੌਗ ਆਉਟ", careers: "ਕਰੀਅਰ", products: "ਉਤਪਾਦ", back: "ਹੋਮ 'ਤੇ ਵਾਪਸ", sign_in: "ਸਾਈਨ ਇਨ",
            title: "ਲੋੜ ਦੀ ਰਿਪੋਰਟ ਕਰੋ", sub: "ਪ੍ਰਮਾਣਿਤ ਬਚਾਅ ਟੀਮਾਂ ਨਾਲ ਉਹਨਾਂ ਨੂੰ ਜਲਦੀ ਜੋੜਨ ਵਿੱਚ ਸਾਡੀ ਮਦਦ ਕਰੋ। ਕਿਸੇ ਖਾਤੇ ਦੀ ਲੋੜ ਨਹੀਂ।",
            draft_saved: "ਡਰਾਫਟ ਸੁਰੱਖਿਅਤ ਕੀਤਾ ਗਿਆ", gps_err: "ਸਥਾਨ ਪ੍ਰਾਪਤ ਨਹੀਂ ਕੀਤਾ ਜਾ ਸਕਿਆ। ਕਿਰਪਾ ਕਰਕੇ ਪਤਾ ਟਾਈਪ ਕਰੋ।",
            lbl_reporter: "ਤੁਹਾਡਾ ਨਾਮ (ਵਿਕਲਪਿਕ)", lbl_needy: "ਲੋੜਵੰਦ ਦਾ ਨਾਮ (ਲਾਜ਼ਮੀ)", lbl_blood: "ਬਲੱਡ ਗਰੁੱਪ (ਵਿਕਲਪਿਕ)",
            lbl_cat: "ਸ਼੍ਰੇਣੀ", cat_1: "ਬੇਘਰ ਵਿਅਕਤੀ", cat_2: "ਛੱਡੇ ਗਏ ਬਜ਼ੁਰਗ", cat_3: "ਜ਼ਖਮੀ ਜਾਨਵਰ", cat_4: "ਮੈਡੀਕਲ ਐਮਰਜੈਂਸੀ",
            lbl_photo: "ਲਾਈਵ ਫੋਟੋ (ਲਾਜ਼ਮੀ)", btn_photo: "ਫੋਟੋ ਲਓ / ਅੱਪਲੋਡ ਕਰੋ", err_photo_req: "ਤਸਦੀਕ ਲਈ ਲੋੜਵੰਦ ਵਿਅਕਤੀ ਦੀ ਫੋਟੋ ਸਖਤੀ ਨਾਲ ਜ਼ਰੂਰੀ ਹੈ।",
            lbl_loc: "ਸਹੀ ਸਥਾਨ", btn_gps: "ਮੇਰਾ ਮੌਜੂਦਾ ਸਥਾਨ ਵਰਤੋ", ph_address: "ਸਹੀ ਪਤਾ ਖੋਜੋ ਜਾਂ ਟਾਈਪ ਕਰੋ...",
            lbl_danger: "ਕੀ ਉਹ ਤੁਰੰਤ ਖ਼ਤਰੇ ਵਿੱਚ ਹਨ?",
            lbl_desc: "ਸਥਿਤੀ ਦੇ ਵੇਰਵੇ", ph_desc: "ਉਹਨਾਂ ਦੀ ਸਥਿਤੀ, ਉਮਰ, ਸੱਟਾਂ ਜਾਂ ਕੋਈ ਮਦਦਗਾਰ ਵੇਰਵਿਆਂ ਦਾ ਵਰਣਨ ਕਰੋ...",
            lbl_severity: "ਜ਼ਰੂਰੀ:",
            btn_submit: "ਰਿਪੋਰਟ ਦਰਜ ਕਰੋ", btn_loading: "ਸੁਰੱਖਿਅਤ ਢੰਗ ਨਾਲ ਅੱਪਲੋਡ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...",
            succ_title: "ਰਿਪੋਰਟ ਪ੍ਰਾਪਤ ਹੋਈ", succ_sub: "ਸੰਸਥਾਵਾਂ ਨੂੰ ਸੂਚਿਤ ਕਰ ਦਿੱਤਾ ਗਿਆ ਹੈ। ਧੰਨਵਾਦ।", btn_new: "ਇੱਕ ਹੋਰ ਰਿਪੋਰਟ ਕਰੋ"
        },
        bho: {
            lang: "भोजपुरी", log_out: "लॉग आउट", careers: "करियर", products: "उत्पाद", back: "होम पर वापस", sign_in: "साइन इन",
            title: "जरूरत के रिपोर्ट करीं", sub: "सत्यापित बचाव टीम के साथ जल्दी से जोड़े में हमनी के मदद करीं। कवनो खाता के जरूरत नईखे।",
            draft_saved: "ड्राफ्ट सेव हो गईल", gps_err: "लोकेशन ना मिल पावल। कृपया पता टाइप करीं।",
            lbl_reporter: "रउरा नाम (वैकल्पिक)", lbl_needy: "जरूरतमंद के नाम (जरूरी)", lbl_blood: "ब्लड ग्रुप (वैकल्पिक)",
            lbl_cat: "श्रेणी", cat_1: "बेघर व्यक्ति", cat_2: "अकेले बुजुर्ग", cat_3: "घायल जानवर", cat_4: "मेडिकल इमरजेंसी",
            lbl_photo: "लाइव फोटो (जरूरी)", btn_photo: "फोटो लीं / अपलोड करीं", err_photo_req: "सत्यापन खातिर जरूरतमंद व्यक्ति के फोटो एकदम जरूरी बा।",
            lbl_loc: "सटीक लोकेशन", btn_gps: "हमर वर्तमान लोकेशन इस्तेमाल करीं", ph_address: "सटीक पता खोजीं या टाइप करीं...",
            lbl_danger: "का उ लोग तुरंत खतरा में बा?",
            lbl_desc: "स्थिति विवरण", ph_desc: "उनकर स्थिति, उम्र, चोट भा कवनो मददगार जानकारी बताईं...",
            lbl_severity: "तात्कालिकता:",
            btn_submit: "रिपोर्ट जमा करीं", btn_loading: "सुरक्षित रूप से अपलोड हो रहल बा...",
            succ_title: "रिपोर्ट मिल गईल", succ_sub: "संगठन के सूचित कर दिहल गइल बा। धन्यवाद।", btn_new: "दोसर रिपोर्ट करीं"
        },
        ar: {
            lang: "العربية", log_out: "تسجيل الخروج", careers: "وظائف", products: "منتجات", back: "العودة إلى الصفحة الرئيسية", sign_in: "تسجيل الدخول",
            title: "الإبلاغ عن حاجة", sub: "ساعدنا في ربطهم بفرق الإنقاذ المعتمدة بسرعة. لا يشترط وجود حساب.",
            draft_saved: "تم حفظ المسودة", gps_err: "تعذر الحصول على الموقع. يرجى كتابة العنوان.",
            lbl_reporter: "اسمك (اختياري)", lbl_needy: "اسم المحتاج (مطلوب)", lbl_blood: "فصيلة الدم (اختياري)",
            lbl_cat: "الفئة", cat_1: "شخص مشرد", cat_2: "مسن مهجور", cat_3: "حيوان مصاب", cat_4: "حالة طبية طارئة",
            lbl_photo: "صورة مباشرة (مطلوب)", btn_photo: "التقاط صورة / تحميل", err_photo_req: "صورة الشخص المحتاج مطلوبة بشدة للتحقق.",
            lbl_loc: "الموقع الدقيق", btn_gps: "استخدام موقعي الحالي", ph_address: "ابحث أو اكتب العنوان الدقيق...",
            lbl_danger: "هل هم في خطر محدق؟",
            lbl_desc: "تفاصيل الحالة", ph_desc: "صف حالتهم، عمرهم، إصاباتهم، أو أي تفاصيل مفيدة...",
            lbl_severity: "درجة الإلحاح:",
            btn_submit: "إرسال التقرير", btn_loading: "جاري التحميل بأمان...",
            succ_title: "تم استلام التقرير", succ_sub: "تم إخطار المنظمات. شكراً لك.", btn_new: "الإبلاغ عن حالة أخرى"
        },
        es: {
            lang: "Español", log_out: "Cerrar sesión", careers: "Carreras", products: "Productos", back: "Volver a Inicio", sign_in: "Iniciar sesión",
            title: "Reportar una Necesidad", sub: "Ayúdenos a conectarlos rápidamente con equipos de rescate. No requiere cuenta.",
            draft_saved: "Borrador guardado", gps_err: "No se pudo obtener la ubicación. Por favor escriba la dirección.",
            lbl_reporter: "Su Nombre (Opcional)", lbl_needy: "Nombre del Necesitado (Requerido)", lbl_blood: "Grupo Sanguíneo (Opcional)",
            lbl_cat: "Categoría", cat_1: "Persona sin hogar", cat_2: "Anciano abandonado", cat_3: "Animal herido", cat_4: "Emergencia médica",
            lbl_photo: "Foto en vivo (Requerido)", btn_photo: "Tomar Foto / Subir", err_photo_req: "La foto de la persona es estrictamente obligatoria para la verificación.",
            lbl_loc: "Ubicación Exacta", btn_gps: "Usar mi ubicación actual", ph_address: "Buscar o escribir dirección exacta...",
            lbl_danger: "¿Están en peligro inmediato?",
            lbl_desc: "Detalles de la condición", ph_desc: "Describa su estado, edad, lesiones o cualquier detalle útil...",
            lbl_severity: "Urgencia:",
            btn_submit: "Enviar Reporte", btn_loading: "Subiendo de forma segura...",
            succ_title: "Reporte Recibido", succ_sub: "Las organizaciones han sido notificadas. Gracias.", btn_new: "Reportar Otro"
        },
        fr: {
            lang: "Français", log_out: "Se déconnecter", careers: "Carrières", products: "Produits", back: "Retour à l'accueil", sign_in: "Se connecter",
            title: "Signaler un Besoin", sub: "Aidez-nous à les connecter rapidement aux équipes de sauvetage. Aucun compte requis.",
            draft_saved: "Brouillon enregistré", gps_err: "Impossible d'obtenir l'emplacement. Veuillez saisir l'adresse.",
            lbl_reporter: "Votre Nom (Optionnel)", lbl_needy: "Nom de la personne (Requis)", lbl_blood: "Groupe Sanguin (Optionnel)",
            lbl_cat: "Catégorie", cat_1: "Personne sans abri", cat_2: "Personne âgée abandonnée", cat_3: "Animal blessé", cat_4: "Urgence médicale",
            lbl_photo: "Photo en direct (Requis)", btn_photo: "Prendre une photo / Télécharger", err_photo_req: "Une photo de la personne est strictement requise pour vérification.",
            lbl_loc: "Emplacement Exact", btn_gps: "Utiliser ma position actuelle", ph_address: "Rechercher ou taper l'adresse exacte...",
            lbl_danger: "Sont-ils en danger immédiat ?",
            lbl_desc: "Détails de l'état", ph_desc: "Décrivez leur état, âge, blessures ou tout détail utile...",
            lbl_severity: "Urgence :",
            btn_submit: "Soumettre le rapport", btn_loading: "Téléchargement sécurisé...",
            succ_title: "Rapport Reçu", succ_sub: "Les organisations ont été informées. Merci.", btn_new: "Signaler un autre"
        },
        de: {
            lang: "Deutsch", log_out: "Abmelden", careers: "Karriere", products: "Produkte", back: "Zurück zur Startseite", sign_in: "Anmelden",
            title: "Bedarf Melden", sub: "Helfen Sie uns, sie schnell mit Rettungsteams zu verbinden. Kein Konto erforderlich.",
            draft_saved: "Entwurf gespeichert", gps_err: "Standort konnte nicht ermittelt werden. Bitte Adresse eingeben.",
            lbl_reporter: "Ihr Name (Optional)", lbl_needy: "Name der hilfsbedürftigen Person (Erforderlich)", lbl_blood: "Blutgruppe (Optional)",
            lbl_cat: "Kategorie", cat_1: "Obdachlose Person", cat_2: "Verlassene ältere Menschen", cat_3: "Verletztes Tier", cat_4: "Medizinischer Notfall",
            lbl_photo: "Live-Foto (Erforderlich)", btn_photo: "Foto aufnehmen / Hochladen", err_photo_req: "Ein Foto der bedürftigen Person ist zur Überprüfung zwingend erforderlich.",
            lbl_loc: "Genauer Standort", btn_gps: "Meinen aktuellen Standort verwenden", ph_address: "Genaue Adresse suchen oder eingeben...",
            lbl_danger: "Sind sie in unmittelbarer Gefahr?",
            lbl_desc: "Zustandsdetails", ph_desc: "Beschreiben Sie ihren Zustand, Alter, Verletzungen oder hilfreiche Details...",
            lbl_severity: "Dringlichkeit:",
            btn_submit: "Bericht einreichen", btn_loading: "Sicher hochladen...",
            succ_title: "Bericht Erhalten", succ_sub: "Organisationen wurden benachrichtigt. Danke.", btn_new: "Weiteren Bericht melden"
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
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/sahay')}>
                    <img 
                        src={theme === 'light' ? '/logo-4.png' : '/logo-4.png'} 
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
                    {currentUser ? (
                        <button 
                            onClick={() => navigate('/sahay/profile')} 
                            className="p-2 rounded-full bg-[#F7F7F7] text-[#111111] border border-[#E5E7EB] hover:border-[#111111] hover:bg-[#E5E7EB] transition-colors outline-none flex items-center justify-center"
                        >
                            <User size={18} />
                        </button>
                    ) : (
                        <button onClick={() => navigate('/sahay/auth')} className="bg-[#111111] text-[#FFFFFF] px-4 py-2 rounded-full font-bold hover:bg-[#555555] transition-colors outline-none">
                            {currentT.sign_in}
                        </button>
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
                            className="w-full max-w-[400px] bg-[#FFFFFF] rounded-3xl p-8 flex flex-col shadow-2xl relative border border-[#E5E7EB] max-h-[80vh] overflow-y-auto"
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
                
                <button onClick={() => navigate('/sahay')} className="flex items-center gap-2 mb-8 outline-none font-bold text-[0.9rem] text-[#555555] hover:text-[#111111] transition-colors">
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
                            
                            {/* Identity Section */}
                            <div>
                                <label className="block text-[0.85rem] font-bold uppercase tracking-wider text-[#555555] mb-3">{currentT.lbl_reporter}</label>
                                <input 
                                    type="text" 
                                    placeholder="Anonymous"
                                    value={formData.reporterName}
                                    onChange={(e) => setFormData({...formData, reporterName: e.target.value})}
                                    className="w-full p-4 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] text-[#111111] font-bold text-[0.95rem] outline-none focus:border-[#FF6B35] transition-colors mb-6"
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[0.85rem] font-bold uppercase tracking-wider text-[#555555] mb-3">{currentT.lbl_needy}</label>
                                        <input 
                                            type="text" 
                                            required
                                            placeholder="Name"
                                            value={formData.needyName}
                                            onChange={(e) => setFormData({...formData, needyName: e.target.value})}
                                            className="w-full p-4 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] text-[#111111] font-bold text-[0.95rem] outline-none focus:border-[#FF6B35] transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[0.85rem] font-bold uppercase tracking-wider text-[#555555] mb-3">{currentT.lbl_blood}</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. O+"
                                            value={formData.bloodGroup}
                                            onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                                            className="w-full p-4 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] text-[#111111] font-bold text-[0.95rem] outline-none focus:border-[#FF6B35] transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>

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

                            {/* Location GPS & Autocomplete */}
                            <div>
                                <label className="block text-[0.85rem] font-bold uppercase tracking-wider text-[#555555] mb-3">{currentT.lbl_loc}</label>
                                <div className="flex flex-col gap-3 relative">
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
                                        onChange={handleAddressChange}
                                        className="w-full p-4 rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] text-[#111111] font-bold text-[0.95rem] outline-none focus:border-[#FF6B35] transition-colors"
                                    />

                                    {/* Autocomplete Dropdown */}
                                    <AnimatePresence>
                                        {showSuggestions && addressSuggestions.length > 0 && (
                                            <motion.ul 
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute top-[100%] left-0 right-0 mt-2 bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl shadow-xl z-50 overflow-hidden"
                                            >
                                                {addressSuggestions.map((suggestion) => (
                                                    <li 
                                                        key={suggestion.place_id}
                                                        onClick={() => selectSuggestion(suggestion)}
                                                        className="p-4 border-b border-[#E5E7EB] last:border-b-0 cursor-pointer hover:bg-[#F7F7F7] text-[0.9rem] text-[#111111] font-medium transition-colors"
                                                    >
                                                        {suggestion.display_name}
                                                    </li>
                                                ))}
                                            </motion.ul>
                                        )}
                                    </AnimatePresence>
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
            <footer className="w-full mx-auto flex flex-col md:flex-row items-center justify-between gap-8 px-8 md:px-16 py-12 border-t border-[#E5E7EB] bg-[#FFFFFF] relative z-10 animate-fade mt-auto">
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
                            <img src={theme === 'light' ? '/aat2.png' : '/aat2.png'} alt="AnyAstro" className="h-4 w-auto object-contain" onError={(e) => { e.target.style.display = 'none'; e.target.insertAdjacentHTML('afterend', '<span class="underline text-[#111111]">AnyAstro</span>'); }} />
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