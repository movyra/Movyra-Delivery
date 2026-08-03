import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, MapPin, Edit2, Camera, AlertCircle, CheckCircle, X, User, Phone } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebaseConfig';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default Leaflet marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Auto-updater for map center when coordinates change
function ChangeView({ center }) {
    const map = useMap();
    map.setView(center, 16);
    return null;
}

export default function Report() {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Core State
    const [lang, setLang] = useState('en');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    
    // Strict Guest Data Capture
    const [guestName, setGuestName] = useState('');
    const [guestContact, setGuestContact] = useState('');
    
    // Location State
    const [coords, setCoords] = useState([20.5937, 78.9629]); // Default center India
    const [address, setAddress] = useState('');
    const [isLocating, setIsLocating] = useState(true);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [manualAddress, setManualAddress] = useState('');
    
    // Upload & Submission State
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    // Dynamic Leaflet CSS Injection
    useEffect(() => {
        if (!document.getElementById('leaflet-css')) {
            const link = document.createElement('link');
            link.id = 'leaflet-css';
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);
        }
    }, []);

    // Initialization, Auth & Language
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        setCategory(queryParams.get('category') || 'General Issue');

        const savedLang = localStorage.getItem('nagrik_lang') || navigator.language.slice(0, 2);
        const supported = ['en', 'hi', 'hinglish', 'mr', 'gu', 'te', 'ta', 'kn', 'ml', 'bn', 'pa', 'or', 'as', 'ur', 'bho'];
        if (supported.includes(savedLang)) setLang(savedLang);

        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });

        fetchCurrentLocation();
        
        return () => unsubscribeAuth();
    }, [location]);

    const fetchCurrentLocation = () => {
        setIsLocating(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    setCoords([lat, lon]);
                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                        const data = await response.json();
                        setAddress(data.display_name || 'Location identified');
                    } catch (error) {
                        setAddress('GPS Coordinates acquired. Exact address unavailable.');
                    } finally {
                        setIsLocating(false);
                    }
                },
                (error) => {
                    setAddress('Location access denied. Please enter manually.');
                    setIsLocating(false);
                },
                { timeout: 10000 }
            );
        } else {
            setAddress('Geolocation not supported by this device.');
            setIsLocating(false);
        }
    };

    // 15 Comprehensive Indian Language Translations
    const t = {
        en: { back: "Back", edit: "Edit Address", warning: "Submitting fake or misleading reports is strictly prohibited.", desc: "Description", placeholder: "Enter your message", anon: "Hide My Identity Publicly", submit: "Submit Report", loc_fetching: "Locating...", photo_added: "Photo Attached", manual_title: "Enter Address", save: "Save", cancel: "Cancel", g_title: "Contact Details", g_name: "Full Name", g_phone: "Phone Number", g_req: "Required for guest submissions." },
        hi: { back: "वापस", edit: "पता बदलें", warning: "झूठी या भ्रामक रिपोर्ट प्रस्तुत करना सख्त मना है।", desc: "विवरण", placeholder: "अपना संदेश लिखें", anon: "सार्वजनिक रूप से मेरी पहचान छुपाएं", submit: "रिपोर्ट जमा करें", loc_fetching: "स्थान खोज रहे हैं...", photo_added: "फोटो संलग्न", manual_title: "पता दर्ज करें", save: "सहेजें", cancel: "रद्द करें", g_title: "संपर्क विवरण (केवल व्यवस्थापक)", g_name: "पूरा नाम", g_phone: "फ़ोन नंबर", g_req: "अतिथि प्रस्तुतियाँ के लिए आवश्यक।" },
        hinglish: { back: "Peeche", edit: "Address Badlein", warning: "Jhoothi report submit karna sakht mana hai.", desc: "Details", placeholder: "Apna message likhein", anon: "Identity public se hide karein", submit: "Report Submit Karein", loc_fetching: "Location dhoondh rahe hain...", photo_added: "Photo Attached", manual_title: "Address Dalein", save: "Save Karein", cancel: "Cancel", g_title: "Contact Details", g_name: "Full Name", g_phone: "Phone Number", g_req: "Guest submissions ke liye zaroori hai." },
        mr: { back: "मागे", edit: "पत्ता बदला", warning: "खोटे किंवा दिशाभूल करणारे अहवाल सादर करण्यास सक्त मनाई आहे.", desc: "वर्णन", placeholder: "तुमचा संदेश प्रविष्ट करा", anon: "माझी ओळख सार्वजनिकपणे लपवा", submit: "अहवाल सबमिट करा", loc_fetching: "स्थान शोधत आहे...", photo_added: "फोटो जोडला", manual_title: "पत्ता प्रविष्ट करा", save: "जतन करा", cancel: "रद्द करा", g_title: "संपर्क तपशील (केवळ प्रशासक)", g_name: "पूर्ण नाव", g_phone: "फोन नंबर", g_req: "अतिथी सबमिशनसाठी आवश्यक." },
        gu: { back: "પાછા", edit: "સરનામું બદલો", warning: "નકલી અથવા ગેરમાર્ગે દોરનારા અહેવાલો સબમિટ કરવા સખત પ્રતિબંધિત છે.", desc: "વર્ણન", placeholder: "તમારો સંદેશ દાખલ કરો", anon: "જાહેરમાં મારી ઓળખ છુપાવો", submit: "રિપોર્ટ સબમિટ કરો", loc_fetching: "સ્થાન શોધી રહ્યા છીએ...", photo_added: "ફોટો જોડાયેલ", manual_title: "સરનામું દાખલ કરો", save: "સાચવો", cancel: "રદ કરો", g_title: "સંપર્ક વિગતો (ફક્ત એડમિન)", g_name: "પૂરું નામ", g_phone: "ફોન નંબર", g_req: "અતિથિ સબમિશન માટે જરૂરી." },
        te: { back: "వెనుకకు", edit: "చిరునామా మార్చండి", warning: "నకిలీ నివేదికలను సమర్పించడం ఖచ్చితంగా నిషేధించబడింది.", desc: "వివరణ", placeholder: "మీ సందేశాన్ని నమోదు చేయండి", anon: "నా గుర్తింపును బహిరంగంగా దాచండి", submit: "నివేదికను సమర్పించండి", loc_fetching: "స్థానాన్ని కనుగొంటున్నాము...", photo_added: "ఫోటో జోడించబడింది", manual_title: "చిరునామా నమోదు చేయండి", save: "సేవ్ చేయండి", cancel: "రద్దు చేయండి", g_title: "సంప్రదింపు వివరాలు (అడ్మిన్ మాత్రమే)", g_name: "పూర్తి పేరు", g_phone: "ఫోన్ నంబర్", g_req: "అతిథి సమర్పణలకు అవసరం." },
        ta: { back: "பின்னால்", edit: "முகவரியை மாற்று", warning: "போலியான அறிக்கைகளை சமர்ப்பிப்பது கண்டிப்பாக தடைசெய்யப்பட்டுள்ளது.", desc: "விளக்கம்", placeholder: "உங்கள் செய்தியை உள்ளிடவும்", anon: "எனது அடையாளத்தை பகிரங்கமாக மறைக்கவும்", submit: "அறிக்கையை சமர்ப்பிக்கவும்", loc_fetching: "இருப்பிடத்தைத் தேடுகிறது...", photo_added: "புகைப்படம் இணைக்கப்பட்டது", manual_title: "முகவரியை உள்ளிடவும்", save: "சேமி", cancel: "ரத்துசெய்", g_title: "தொடர்பு விவரங்கள் (நிர்வாகி மட்டும்)", g_name: "முழு பெயர்", g_phone: "தொலைபேசி எண்", g_req: "விருந்தினர் சமர்ப்பிப்புகளுக்கு தேவை." },
        kn: { back: "ಹಿಂದೆ", edit: "ವಿಳಾಸ ಬದಲಾಯಿಸಿ", warning: "ನಕಲಿ ವರದಿಗಳನ್ನು ಸಲ್ಲಿಸುವುದನ್ನು ಕಟ್ಟುನಿಟ್ಟಾಗಿ ನಿಷೇಧಿಸಲಾಗಿದೆ.", desc: "ವಿವರಣೆ", placeholder: "ನಿಮ್ಮ ಸಂದೇಶವನ್ನು ನಮೂದಿಸಿ", anon: "ನನ್ನ ಗುರುತನ್ನು ಸಾರ್ವಜನಿಕವಾಗಿ ಮರೆಮಾಡಿ", submit: "ವರದಿಯನ್ನು ಸಲ್ಲಿಸಿ", loc_fetching: "ಸ್ಥಳವನ್ನು ಹುಡುಕಲಾಗುತ್ತಿದೆ...", photo_added: "ಫೋಟೋ ಲಗತ್ತಿಸಲಾಗಿದೆ", manual_title: "ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ", save: "ಉಳಿಸಿ", cancel: "ರದ್ದುಗೊಳಿಸಿ", g_title: "ಸಂಪರ್ಕ ವಿವರಗಳು (ನಿರ್ವಾಹಕರು ಮಾತ್ರ)", g_name: "ಪೂರ್ಣ ಹೆಸರು", g_phone: "ಫೋನ್ ಸಂಖ್ಯೆ", g_req: "ಅತಿಥಿ ಸಲ್ಲಿಕೆಗಳಿಗೆ ಅಗತ್ಯವಿದೆ." },
        ml: { back: "പിന്നോട്ട്", edit: "വിലാസം മാറ്റുക", warning: "വ്യാജ റിപ്പോർട്ടുകൾ സമർപ്പിക്കുന്നത് കർശനമായി നിരോധിച്ചിരിക്കുന്നു.", desc: "വിവരണം", placeholder: "നിങ്ങളുടെ സന്ദേശം നൽകുക", anon: "എന്റെ ഐഡന്റിറ്റി പരസ്യമായി മറയ്ക്കുക", submit: "റിപ്പോർട്ട് സമർപ്പിക്കുക", loc_fetching: "സ്ഥലം കണ്ടെത്തുന്നു...", photo_added: "ഫോട്ടോ ഘടിപ്പിച്ചു", manual_title: "വിലാസം നൽകുക", save: "സംരക്ഷിക്കുക", cancel: "റദ്ദാക്കുക", g_title: "ബന്ധപ്പെടാനുള്ള വിവരങ്ങൾ (അഡ്മിൻ മാത്രം)", g_name: "പൂർണ്ണ നാമം", g_phone: "ഫോൺ നമ്പർ", g_req: "അതിഥി സമർപ്പണങ്ങൾക്ക് ആവശ്യമാണ്." },
        bn: { back: "পিছনে", edit: "ঠিকানা পরিবর্তন করুন", warning: "জাল রিপোর্ট জমা দেওয়া কঠোরভাবে নিষিদ্ধ।", desc: "বিবরণ", placeholder: "আপনার বার্তা লিখুন", anon: "জনসাধারণের কাছে আমার পরিচয় লুকান", submit: "রিপোর্ট জমা দিন", loc_fetching: "অবস্থান খুঁজছি...", photo_added: "ছবি সংযুক্ত", manual_title: "ঠিকানা লিখুন", save: "সংরক্ষণ করুন", cancel: "বাতিল করুন", g_title: "যোগাযোগের বিবরণ (শুধুমাত্র অ্যাডমিন)", g_name: "পুরো নাম", g_phone: "ফোন নম্বর", g_req: "অতিথি জমার জন্য প্রয়োজনীয়।" },
        pa: { back: "ਪਿੱਛੇ", edit: "ਪਤਾ ਬਦਲੋ", warning: "ਜਾਅਲੀ ਰਿਪੋਰਟਾਂ ਜਮ੍ਹਾਂ ਕਰਨਾ ਸਖ਼ਤੀ ਨਾਲ ਮਨ੍ਹਾ ਹੈ।", desc: "ਵਰਣਨ", placeholder: "ਆਪਣਾ ਸੁਨੇਹਾ ਦਰਜ ਕਰੋ", anon: "ਮੇਰੀ ਪਛਾਣ ਜਨਤਕ ਤੌਰ 'ਤੇ ਛੁਪਾਓ", submit: "ਰਿਪੋਰਟ ਜਮ੍ਹਾਂ ਕਰੋ", loc_fetching: "ਸਥਾਨ ਲੱਭ ਰਹੇ ਹਾਂ...", photo_added: "ਫੋਟੋ ਨੱਥੀ ਹੈ", manual_title: "ਪਤਾ ਦਰਜ ਕਰੋ", save: "ਸੰਭਾਲੋ", cancel: "ਰੱਦ ਕਰੋ", g_title: "ਸੰਪਰਕ ਵੇਰਵੇ (ਸਿਰਫ਼ ਐਡਮਿਨ)", g_name: "ਪੂਰਾ ਨਾਮ", g_phone: "ਫੋਨ ਨੰਬਰ", g_req: "ਮਹਿਮਾਨ ਬੇਨਤੀਆਂ ਲਈ ਜ਼ਰੂਰੀ।" },
        or: { back: "ପଛକୁ", edit: "ଠିକଣା ବଦଳାନ୍ତୁ", warning: "ନକଲି ରିପୋର୍ଟ ଦାଖଲ କରିବା କଠୋର ଭାବରେ ନିଷେଧ।", desc: "ବିବରଣୀ", placeholder: "ଆପଣଙ୍କ ବାର୍ତ୍ତା ଲେଖନ୍ତୁ", anon: "ମୋର ପରିଚୟ ସାର୍ବଜନୀନ ଭାବରେ ଲୁଚାନ୍ତୁ", submit: "ରିପୋର୍ଟ ଦାଖଲ କରନ୍ତୁ", loc_fetching: "ସ୍ଥାନ ଖୋଜୁଛୁ...", photo_added: "ଫଟୋ ସଂଲଗ୍ନ ହୋଇଛି", manual_title: "ଠିକଣା ଲେଖନ୍ତୁ", save: "ସେଭ୍ କରନ୍ତୁ", cancel: "ବାତିଲ୍ କରନ୍ତୁ", g_title: "ଯୋଗାଯୋଗ ବିବରଣୀ (କେବଳ ଆଡମିନ୍)", g_name: "ପୂରା ନାମ", g_phone: "ଫୋନ୍ ନମ୍ବର", g_req: "ଅତିଥି ଦାଖଲ ପାଇଁ ଆବଶ୍ୟକ।" },
        as: { back: "পিছলৈ", edit: "ঠিকনা সলনি কৰক", warning: "ভুৱা প্ৰতিবেদন দাখিল কৰা কঠোৰভাৱে নিষিদ্ধ।", desc: "বিৱৰণ", placeholder: "আপোনাৰ বাৰ্তা লিখক", anon: "ৰাজহুৱাভাৱে মোৰ পৰিচয় লুকুৱাওক", submit: "প্ৰতিবেদন দাখিল কৰক", loc_fetching: "অৱস্থান বিচাৰি আছোঁ...", photo_added: "ফটো সংলগ্ন কৰা হৈছে", manual_title: "ঠিকনা লিখক", save: "সংৰক্ষণ কৰক", cancel: "বাতিল কৰক", g_title: "যোগাযোগৰ বিৱৰণ (কেৱল এডমিন)", g_name: "সম্পূৰ্ণ নাম", g_phone: "ফোন নম্বৰ", g_req: "অতিথি দাখিলৰ বাবে প্ৰয়োজনীয়।" },
        ur: { back: "پیچھے", edit: "پتہ تبدیل کریں", warning: "جعلی رپورٹس جمع کرانا سختی سے منع ہے۔", desc: "تفصیل", placeholder: "اپنا پیغام درج کریں", anon: "میری شناخت عوامی طور پر چھپائیں", submit: "رپورٹ جمع کروائیں", loc_fetching: "مقام تلاش کر رہے ہیں۔۔۔", photo_added: "تصویر منسلک ہے", manual_title: "پتہ درج کریں", save: "محفوظ کریں", cancel: "منسوخ کریں", g_title: "رابطے کی تفصیلات (صرف ایڈمن)", g_name: "پورا نام", g_phone: "فون نمبر", g_req: "مہمان کی درخواستوں کے لیے ضروری ہے۔" },
        bho: { back: "पीछे", edit: "पता बदलीं", warning: "झूठा रिपोर्ट जमा कइल सख्त मना बा।", desc: "विवरण", placeholder: "आपन संदेश लिखीं", anon: "सार्वजनिक रूप से हमार पहचान छिपाईं", submit: "रिपोर्ट जमा करीं", loc_fetching: "स्थान खोज रहल बानी...", photo_added: "फोटो जुड़ गइल", manual_title: "पता डालीं", save: "सेव करीं", cancel: "रद्द करीं", g_title: "संपर्क विवरण (खाली एडमिन)", g_name: "पूरा नाम", g_phone: "फोन नंबर", g_req: "अतिथि सबमिशन खातिर जरूरी।" }
    };

    const currentT = t[lang] || t['en'];

    // File Handling logic
    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPhotoPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    // Form Submission Logic 
    const handleSubmit = async () => {
        // Strict Validation
        if (!description.trim() && !photoFile) {
            alert("Please provide a description or a photo.");
            return;
        }

        if (!currentUser && (!guestName.trim() || !guestContact.trim())) {
            alert("Guest details (Name and Contact) are strictly required for security validation.");
            return;
        }
        
        setIsSubmitting(true);
        try {
            let uploadedPhotoUrl = null;
            
            // Strictly mapped to the external PocketBase collection
            if (photoFile) {
                const formData = new FormData();
                formData.append('evidence_image', photoFile);
                
                try {
                    const pbResponse = await fetch('https://movyra-mv-main-db-gradio.hf.space/api/collections/nagrik_evidence/records', {
                        method: 'POST',
                        body: formData
                    });
                    
                    if (pbResponse.ok) {
                        const pbData = await pbResponse.json();
                        uploadedPhotoUrl = `https://movyra-mv-main-db-gradio.hf.space/api/files/${pbData.collectionId}/${pbData.id}/${pbData.evidence_image}`;
                    } else {
                        console.error("PocketBase API error.");
                    }
                } catch (pbError) {
                    console.warn("PocketBase upload failed, proceeding with local fallback.", pbError);
                    uploadedPhotoUrl = photoPreview;
                }
            }

            // Real Firestore Document Creation (Enforcing the Security Rule Schema)
            const reportPayload = {
                category,
                description,
                address,
                coordinates: coords,
                isAnonymous,
                evidenceUrl: uploadedPhotoUrl,
                status: 'Submitted',
                reporterId: currentUser ? currentUser.uid : 'guest',
                createdAt: serverTimestamp()
            };

            // Inject Mandatory Guest Data exclusively for Admin visibility
            if (!currentUser) {
                reportPayload.guestName = guestName;
                reportPayload.guestContact = guestContact;
            }

            await addDoc(collection(db, 'nagrik_reports'), reportPayload);
            navigate('/alerts');
            
        } catch (error) {
            console.error("Submission error:", error);
            alert("Failed to submit report. Please check your connection and try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleManualAddressSave = () => {
        if (manualAddress.trim()) {
            setAddress(manualAddress);
        }
        setShowAddressModal(false);
    };

    return (
        <div className="min-h-screen bg-[#FFFFFF] font-sans text-[#111111] relative">
            {/* Header Section */}
            <div className="bg-[#00897B] text-[#FFFFFF] px-6 pt-12 pb-24 rounded-b-[40px]">
                <div className="max-w-[500px] mx-auto">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-1 font-bold text-[0.9rem] mb-6 outline-none">
                        <ChevronLeft size={20} /> {category.replace('emergency_', '').toUpperCase()}
                    </button>
                    <h1 className="text-[2rem] font-black leading-[1.1] tracking-tight mb-2">
                        Every Detail Matters.
                    </h1>
                    <p className="text-[1rem] font-medium opacity-90">
                        Add location, description, and evidence for better action.
                    </p>
                </div>
            </div>

            {/* Form Container */}
            <div className="max-w-[500px] mx-auto px-4 -mt-16 relative z-10 pb-32">
                <div className="bg-[#FFFFFF] rounded-[32px] shadow-[0_10px_30px_-10px_rgba(17,17,17,0.1)] p-6 border border-[#111111]/10">
                    
                    {/* Location Block */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex gap-2">
                            <MapPin size={20} className="text-[#00897B] shrink-0 mt-0.5" />
                            <p className="text-[0.9rem] font-bold text-[#111111] leading-tight pr-4">
                                {isLocating ? currentT.loc_fetching : address}
                            </p>
                        </div>
                        <button 
                            onClick={() => setShowAddressModal(true)}
                            className="flex items-center gap-1 text-[#00897B] text-[0.75rem] font-black uppercase tracking-wider shrink-0 outline-none"
                        >
                            <Edit2 size={12} /> {currentT.edit}
                        </button>
                    </div>

                    {/* Leaflet Map Preview */}
                    <div className="w-full h-[120px] bg-[#111111]/5 rounded-[20px] mb-6 overflow-hidden border border-[#111111]/10 relative z-0">
                        <MapContainer center={coords} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false} dragging={false}>
                            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                            <Marker position={coords} />
                            <ChangeView center={coords} />
                        </MapContainer>
                    </div>

                    {/* Strict Guest Data Capture Block */}
                    {!currentUser && (
                        <div className="mb-6 bg-[#111111]/5 border border-[#111111]/10 rounded-[20px] p-4">
                            <h3 className="text-[0.9rem] font-black text-[#111111] mb-1 flex items-center gap-2">
                                <AlertCircle size={16} className="text-[#FFB300]" /> {currentT.g_title}
                            </h3>
                            <p className="text-[0.75rem] font-bold text-[#111111]/60 mb-4">{currentT.g_req}</p>
                            
                            <div className="flex flex-col gap-3">
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#111111]/40" size={18} />
                                    <input 
                                        type="text" 
                                        placeholder={currentT.g_name}
                                        value={guestName}
                                        onChange={(e) => setGuestName(e.target.value)}
                                        className="w-full bg-[#FFFFFF] border border-[#111111]/10 rounded-[12px] py-3 pl-12 pr-4 text-[0.9rem] font-bold text-[#111111] focus:border-[#00897B] focus:ring-1 focus:ring-[#00897B] outline-none transition-all"
                                    />
                                </div>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#111111]/40" size={18} />
                                    <input 
                                        type="tel" 
                                        placeholder={currentT.g_phone}
                                        value={guestContact}
                                        onChange={(e) => setGuestContact(e.target.value)}
                                        className="w-full bg-[#FFFFFF] border border-[#111111]/10 rounded-[12px] py-3 pl-12 pr-4 text-[0.9rem] font-bold text-[#111111] focus:border-[#00897B] focus:ring-1 focus:ring-[#00897B] outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Warning Box */}
                    <div className="bg-[#FFB300]/10 border border-[#FFB300] rounded-2xl p-4 flex gap-3 mb-6">
                        <AlertCircle size={20} className="text-[#FFB300] shrink-0" />
                        <p className="text-[0.8rem] font-medium text-[#111111]/80 leading-relaxed">
                            {currentT.warning}
                        </p>
                    </div>

                    {/* Description Textarea */}
                    <div className="mb-6">
                        <div className="flex justify-between items-end mb-2">
                            <label className="text-[0.9rem] font-black text-[#111111]">{currentT.desc}</label>
                            <span className="text-[0.75rem] font-bold text-[#111111]/50">{description.length}/200</span>
                        </div>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value.slice(0, 200))}
                            placeholder={currentT.placeholder}
                            className="w-full bg-[#FFFFFF] border border-[#111111]/10 rounded-2xl p-4 text-[0.9rem] font-medium text-[#111111] focus:border-[#00897B] focus:ring-1 focus:ring-[#00897B] outline-none transition-all resize-none h-[100px]"
                        ></textarea>
                    </div>

                    {/* Anonymous Toggle */}
                    <div className="flex items-center gap-3 mb-8">
                        <div 
                            onClick={() => setIsAnonymous(!isAnonymous)}
                            className={`w-6 h-6 rounded-md flex items-center justify-center cursor-pointer border transition-colors ${
                                isAnonymous ? 'bg-[#00897B] border-[#00897B]' : 'bg-[#FFFFFF] border-[#111111]/20'
                            }`}
                        >
                            {isAnonymous && <CheckCircle size={16} className="text-[#FFFFFF]" />}
                        </div>
                        <span className="text-[0.9rem] font-bold text-[#111111]/80 cursor-pointer" onClick={() => setIsAnonymous(!isAnonymous)}>
                            {currentT.anon}
                        </span>
                    </div>

                    {/* Action Footer */}
                    <div className="flex items-center gap-4">
                        <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            ref={fileInputRef} 
                            onChange={handlePhotoChange} 
                        />
                        <button 
                            onClick={() => fileInputRef.current.click()}
                            className="w-[60px] h-[60px] shrink-0 rounded-[20px] border-2 border-[#111111]/10 flex items-center justify-center text-[#00897B] hover:bg-[#111111]/5 transition-colors outline-none relative overflow-hidden"
                        >
                            {photoPreview ? (
                                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <Camera size={24} strokeWidth={2.5} />
                            )}
                        </button>
                        
                        <button 
                            onClick={handleSubmit}
                            disabled={isSubmitting || (!description.trim() && !photoFile)}
                            className="flex-1 h-[60px] bg-[#111111] text-[#FFFFFF] rounded-[20px] font-bold text-[1rem] transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center outline-none"
                        >
                            {isSubmitting ? (
                                <div className="w-6 h-6 border-2 border-t-transparent border-[#FFFFFF] rounded-full animate-spin"></div>
                            ) : (
                                currentT.submit
                            )}
                        </button>
                    </div>
                    {photoPreview && <p className="text-[0.7rem] font-bold text-[#00897B] mt-2 ml-2">{currentT.photo_added}</p>}
                </div>
            </div>

            {/* Manual Address Override Modal */}
            <AnimatePresence>
                {showAddressModal && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[99999] bg-[#111111]/60 backdrop-blur-sm flex items-center justify-center p-6"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            className="bg-[#FFFFFF] w-full max-w-[400px] rounded-[32px] p-6 shadow-2xl relative"
                        >
                            <button onClick={() => setShowAddressModal(false)} className="absolute top-4 right-4 text-[#111111]/50 hover:text-[#111111] outline-none">
                                <X size={20} />
                            </button>
                            <h3 className="text-[1.2rem] font-black text-[#111111] mb-4">{currentT.manual_title}</h3>
                            <textarea
                                value={manualAddress}
                                onChange={(e) => setManualAddress(e.target.value)}
                                className="w-full bg-[#FFFFFF] border border-[#111111]/10 rounded-2xl p-4 text-[0.9rem] font-medium text-[#111111] focus:border-[#00897B] outline-none resize-none h-[80px] mb-4"
                                placeholder={address}
                            ></textarea>
                            <div className="flex gap-3">
                                <button onClick={() => setShowAddressModal(false)} className="flex-1 py-3 font-bold text-[#111111]/70 bg-[#111111]/5 rounded-xl outline-none">{currentT.cancel}</button>
                                <button onClick={handleManualAddressSave} className="flex-1 py-3 font-bold text-[#FFFFFF] bg-[#00897B] rounded-xl outline-none">{currentT.save}</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}