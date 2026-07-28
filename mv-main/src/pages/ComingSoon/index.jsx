import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';

// CORRECTED PATH MAPPING VECTORS
import { db } from '../../firebaseConfig'; 
import { uploadVendorKYCDocuments } from '../../services/pocketbaseService';

import { motion, AnimatePresence } from 'framer-motion';

// Google MediaPipe Dependencies
import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision';

// Import Icons
import { X, LogOut, ArrowRight, ArrowUp, Globe } from 'lucide-react';

export default function ComingSoon() {
  // 1. STATE MANAGEMENT
  const [lang, setLang] = useState('en');
  const [showLangPrompt, setShowLangPrompt] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showHelpPrompt, setShowHelpPrompt] = useState(false);
  const [showProductsPrompt, setShowProductsPrompt] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  
  // Navigation & UI States
  const [showExploreOptions, setShowExploreOptions] = useState(false);
  const [showOrderExpansions, setShowOrderExpansions] = useState(false);
  
  // Auth States
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authError, setAuthError] = useState('');
  
  // Registration States
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', role: 'Customer / Buyer', city: '', vehicle: '' });
  const [businessData, setBusinessData] = useState({ businessName: '' });
  
  // Expanded KYC File States
  const [files, setFiles] = useState({ 
    gst: null, 
    panFront: null, 
    panBack: null, 
    aadhaarFront: null, 
    aadhaarBack: null,
    businessDocs: null
  });
  
  const [status, setStatus] = useState('IDLE'); 
  const [faceImageFile, setFaceImageFile] = useState(null);
  const [localCity, setLocalCity] = useState('Mumbai');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [faceDetector, setFaceDetector] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);

  // Help Center State
  const [helpStatus, setHelpStatus] = useState('IDLE');

  const auth = getAuth();
  const googleProvider = new GoogleAuthProvider();

  // DYNAMIC ROLE CHECKS BASED ON EXPANDED TAXONOMY
  const isConsumer = formData.role === 'Customer / Buyer';
  const isDriver = ['Independent Courier', 'Enterprise Fleet Owner', '3PL Logistics Partner'].includes(formData.role);
  const requiresVehicle = formData.role === 'Enterprise Fleet Owner' || formData.role === 'Independent Courier' || 
                          formData.role.includes('Fleet') || formData.role.includes('Courier');

  // 2. REAL-TIME LOGIC & AUTH LISTENER
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    const sysLang = navigator.language.slice(0, 2);
    const supported = ['en', 'hi', 'mr', 'gu', 'te', 'ta', 'pa', 'bho', 'ar', 'es', 'fr', 'de'];
    if (supported.includes(sysLang)) setLang(sysLang);

    const indianCities = ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad'];
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz === 'Asia/Kolkata') {
        const day = new Date().getDay();
        setLocalCity(indianCities[day % indianCities.length]);
      } else {
        setLocalCity('Mumbai');
      }
    } catch (e) {
      setLocalCity('Bengaluru');
    }

    return () => unsubscribe();
  }, [auth]);

  // Initialize MediaPipe Vision Task
  useEffect(() => {
    const initializeFaceDetector = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        const detector = await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
            delegate: "GPU"
          },
          runningMode: "VIDEO"
        });
        setFaceDetector(detector);
      } catch (error) {
        console.error("MediaPipe initialization failed:", error);
      }
    };
    initializeFaceDetector();
  }, []);

  // 4. AUTHENTICATION HANDLERS
  const handleStandardAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, authEmail, authPassword);
      } else {
        await createUserWithEmailAndPassword(auth, authEmail, authPassword);
      }
      setShowLoginPrompt(false);
    } catch (error) {
      setAuthError('Sign in failed. Please try again.');
    }
  };

  const handleGoogleAuth = async () => {
    setAuthError('');
    try {
      await signInWithPopup(auth, googleProvider);
      setShowLoginPrompt(false);
    } catch (error) {
      setAuthError('Google sign-in failed.');
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setShowLoginPrompt(false);
  };

  const submitHelpRequest = (e) => {
    e.preventDefault();
    setHelpStatus('SUBMITTING');
    setTimeout(() => {
        setHelpStatus('SUCCESS');
        setTimeout(() => {
            setShowHelpPrompt(false);
            setHelpStatus('IDLE');
        }, 2000);
    }, 1000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 5. 13-LANGUAGE MARKETING DICTIONARY (Simplified Terminology)
  const t = {
    en: {
      help: "Help Center", lang: "English", login: "Sign In", careers: "Careers", products: "Products",
      main_title: "India's Smartest Delivery Network is Coming.",
      main_sub: "Experience zero delays. A fast and easy network built for you.",
      val1_title: "Super Fast", val1_sub: "Smart maps to avoid traffic.",
      val2_title: "No Extra Fees", val2_sub: "Clear prices. Pay only what you see.",
      val3_title: "Live Tracking", val3_sub: "Watch your order move on the map.",
      val4_title: "24/7 Support", val4_sub: "We are always here to help you.",
      form_title: "Join the Waitlist", form_desc: "Sign up now for early access and special benefits.",
      form_name: "Full Name", form_phone: "WhatsApp Number", form_email: "Email Address", form_city: "Your City", form_role: "I want to be a", form_vehicle: "Vehicle Type", form_business: "Business Name", form_submit: "Save My Spot", form_kyc_btn: "Start Verification",
      kyc_face_title: "Face Check", kyc_face_desc: "Look at the camera. The system will take a photo automatically.",
      kyc_docs_title: "Upload Documents", kyc_docs_desc: "Upload clear photos of your ID cards.",
      success: "Received!", successSub: "We will contact you soon.", back: "Back to Home",
      error: "Failed. Please try again.",
      help_title: "Contact Us", help_desc: "Tell us your problem and we will help.", help_btn: "Send Message", help_succ: "Message Sent"
    },
    hi: {
      help: "सहायता केंद्र", lang: "हिन्दी", login: "साइन इन", careers: "करियर", products: "उत्पाद",
      main_title: "भारत का सबसे स्मार्ट डिलीवरी नेटवर्क आ रहा है।",
      main_sub: "बिना किसी देरी के। आपके लिए बना एक तेज़ और आसान नेटवर्क।",
      val1_title: "बहुत तेज़", val1_sub: "ट्रैफिक से बचने के लिए स्मार्ट मैप।",
      val2_title: "कोई अतिरिक्त शुल्क नहीं", val2_sub: "साफ कीमतें। केवल वही चुकाएं जो आप देखते हैं।",
      val3_title: "लाइव ट्रैकिंग", val3_sub: "अपने ऑर्डर को मैप पर चलते हुए देखें।",
      val4_title: "24/7 सहायता", val4_sub: "हम आपकी मदद के लिए हमेशा यहाँ हैं।",
      form_title: "वेटलिस्ट में शामिल हों", form_desc: "जल्दी लाभ पाने के लिए अभी साइन अप करें।",
      form_name: "पूरा नाम", form_phone: "व्हाट्सएप नंबर", form_email: "ईमेल पता", form_city: "आपका शहर", form_role: "मैं बनना चाहता हूँ", form_vehicle: "वाहन प्रकार", form_business: "व्यवसाय का नाम", form_submit: "मेरी जगह पक्की करें", form_kyc_btn: "सत्यापन शुरू करें",
      kyc_face_title: "चेहरा जांच", kyc_face_desc: "कैमरे की ओर देखें। सिस्टम अपने आप फोटो ले लेगा।",
      kyc_docs_title: "दस्तावेज़ अपलोड करें", kyc_docs_desc: "अपने आईडी कार्ड की साफ फोटो अपलोड करें।",
      success: "प्राप्त हुआ!", successSub: "हम जल्द ही आपसे संपर्क करेंगे।", back: "वापस जाएं",
      error: "विफल रहा। कृपया पुनः प्रयास करें।",
      help_title: "संपर्क करें", help_desc: "अपनी समस्या बताएं और हम मदद करेंगे।", help_btn: "संदेश भेजें", help_succ: "संदेश भेजा गया"
    },
    hinglish: {
      help: "Help Center", lang: "Hinglish", login: "Sign In", careers: "Careers", products: "Products",
      main_title: "India ka Smartest Delivery Network aa raha hai.",
      main_sub: "Zero delays ka maza lein. Aapke liye bana fast aur easy network.",
      val1_title: "Bahut Tez", val1_sub: "Traffic se bachne ke liye smart maps.",
      val2_title: "No Extra Fees", val2_sub: "Clear prices. Sirf wahi pay karein jo dikhe.",
      val3_title: "Live Tracking", val3_sub: "Apne order ko map par track karein.",
      val4_title: "24/7 Support", val4_sub: "Hum hamesha aapki help ke liye yahan hain.",
      form_title: "Waitlist Join Karein", form_desc: "Early access aur fayde ke liye abhi sign up karein.",
      form_name: "Pura Naam", form_phone: "WhatsApp Number", form_email: "Email Address", form_city: "Aapka City", form_role: "Main banna chahta hu", form_vehicle: "Vehicle Type", form_business: "Business Name", form_submit: "Meri Jagah Pukki Karein", form_kyc_btn: "Verification Shuru Karein",
      kyc_face_title: "Face Check", kyc_face_desc: "Camera ki taraf dekhein. System automatically photo le lega.",
      kyc_docs_title: "Documents Upload Karein", kyc_docs_desc: "Apne ID cards ki saaf photo upload karein.",
      success: "Received!", successSub: "Hum jaldi hi aapko contact karenge.", back: "Back to Home",
      error: "Fail ho gaya. Phir se try karein.",
      help_title: "Contact Us", help_desc: "Apni problem batayein, hum help karenge.", help_btn: "Message Bhejein", help_succ: "Message Bhej Diya"
    },
    mr: { help: "मदत केंद्र", lang: "मराठी", login: "साइन इन", careers: "करिअर", products: "उत्पादने", main_title: "भारताचे सर्वात स्मार्ट डिलिव्हरी नेटवर्क येत आहे.", main_sub: "कोणताही विलंब नाही. तुमच्यासाठी बनवलेले वेगवान नेटवर्क.", val1_title: "अतिशय वेगवान", val1_sub: "ट्रॅफिक टाळण्यासाठी स्मार्ट नकाशे.", val2_title: "कोणतेही अतिरिक्त शुल्क नाही", val2_sub: "स्पष्ट किंमती. जे दिसते तेच द्या.", val3_title: "लाइव्ह ट्रॅकिंग", val3_sub: "तुमची ऑर्डर नकाशावर पहा.", val4_title: "24/7 मदत", val4_sub: "आम्ही नेहमी मदतीसाठी येथे आहोत.", form_title: "वेटलिस्टमध्ये सामील व्हा", form_desc: "लवकर प्रवेश मिळवण्यासाठी आता साइन अप करा.", form_name: "पूर्ण नाव", form_phone: "व्हॉट्सॲप नंबर", form_email: "ईमेल", form_city: "तुमचे शहर", form_role: "भूमिका", form_vehicle: "वाहन", form_business: "व्यवसायाचे नाव", form_submit: "माझी जागा निश्चित करा", form_kyc_btn: "पडताळणी सुरू करा", kyc_face_title: "चेहरा तपासा", kyc_face_desc: "कॅमेराकडे पहा. सिस्टम आपोआप फोटो घेईल.", kyc_docs_title: "कागदपत्रे अपलोड करा", kyc_docs_desc: "तुमच्या आयडी कार्डचे स्पष्ट फोटो अपलोड करा.", success: "प्राप्त झाले!", successSub: "आम्ही लवकरच आपल्याशी संपर्क साधू.", back: "मागे जा", error: "अयशस्वी. पुन्हा प्रयत्न करा.", help_title: "संपर्क साधा", help_desc: "तुमची समस्या सांगा आणि आम्ही मदत करू.", help_btn: "संदेश पाठवा", help_succ: "संदेश पाठवला" },
    gu: { help: "મદદ કેન્દ્ર", lang: "ગુજરાતી", login: "સાઇન ઇન", careers: "કારકિર્દી", products: "ઉત્પાદનો", main_title: "ભારતનું સૌથી સ્માર્ટ ડિલિવરી નેટવર્ક આવી રહ્યું છે.", main_sub: "કોઈ વિલંબ નહીં. તમારા માટે બનાવેલ ઝડપી નેટવર્ક.", val1_title: "ખૂબ ઝડપી", val1_sub: "ટ્રાફિક ટાળવા માટે સ્માર્ટ નકશા.", val2_title: "કોઈ વધારાની ફી નથી", val2_sub: "સ્પષ્ટ કિંમતો. જે જુઓ તે જ ચૂકવો.", val3_title: "લાઇવ ટ્રેકિંગ", val3_sub: "તમારો ઓર્ડર નકશા પર જુઓ.", val4_title: "24/7 મદદ", val4_sub: "અમે હંમેશા મદદ માટે અહીં છીએ.", form_title: "વેઇટલિસ્ટમાં જોડાઓ", form_desc: "વહેલો પ્રવેશ મેળવવા માટે અત્યારે સાઇન અપ કરો.", form_name: "પૂરું નામ", form_phone: "ફોન નંબર", form_email: "ઈમેલ", form_city: "શહેર", form_role: "ભૂમિકા", form_vehicle: "વાહન", form_business: "વ્યવસાયનું નામ", form_submit: "મારી જગ્યા નક્કી કરો", form_kyc_btn: "ચકાસણી શરૂ કરો", kyc_face_title: "ચહેરો તપાસો", kyc_face_desc: "કેમેરા સામે જુઓ. સિસ્ટમ આપમેળે ફોટો લેશે.", kyc_docs_title: "દસ્તાવેજો અપલોડ કરો", kyc_docs_desc: "તમારા આઈડી કાર્ડના સ્પષ્ટ ફોટા અપલોડ કરો.", success: "પ્રાપ્ત થયું!", successSub: "અમે ટૂંક સમયમાં તમારો સંપર્ક કરીશું.", back: "પાછા જાઓ", error: "નિષ્ફળ. ફરીથી પ્રયાસ કરો.", help_title: "સંપર્ક કરો", help_desc: "તમારી સમસ્યા જણાવો અને અમે મદદ કરીશું.", help_btn: "સંદેશ મોકલો", help_succ: "સંદેશ મોકલ્યો" },
    te: { help: "సహాయ కేంద్రం", lang: "తెలుగు", login: "సైన్ ఇన్", careers: "కెరీర్స్", products: "ఉత్పత్తులు", main_title: "భారతదేశపు స్మార్ట్ డెలివరీ నెట్‌వర్క్ వస్తోంది.", main_sub: "ఆలస్యం లేదు. మీ కోసం రూపొందించబడిన వేగవంతమైన నెట్‌వర్క్.", val1_title: "చాలా వేగంగా", val1_sub: "ట్రాఫిక్ నివారించడానికి స్మార్ట్ మ్యాప్‌లు.", val2_title: "అదనపు రుసుము లేదు", val2_sub: "స్పష్టమైన ధరలు. మీరు చూసేదే చెల్లించండి.", val3_title: "లైవ్ ట్రాకింగ్", val3_sub: "మీ ఆర్డర్‌ను మ్యాప్‌లో చూడండి.", val4_title: "24/7 మద్దతు", val4_sub: "మేము ఎల్లప్పుడూ సహాయం చేయడానికి ఇక్కడే ఉన్నాము.", form_title: "వెయిట్‌లిస్ట్‌లో చేరండి", form_desc: "ముందస్తు యాక్సెస్ కోసం ఇప్పుడే సైన్ అప్ చేయండి.", form_name: "పేరు", form_phone: "ఫోన్", form_email: "ఇమెయిల్", form_city: "నగరం", form_role: "పాత్ర", form_vehicle: "వాహనం", form_business: "వ్యాపారం పేరు", form_submit: "నా స్థానాన్ని సేవ్ చేయండి", form_kyc_btn: "ధృవీకరణ ప్రారంభించండి", kyc_face_title: "ముఖ తనిఖీ", kyc_face_desc: "కెమెరాను చూడండి. సిస్టమ్ స్వయంచాలకంగా ఫోటో తీస్తుంది.", kyc_docs_title: "పత్రాలను అప్‌లోడ్ చేయండి", kyc_docs_desc: "మీ ID కార్డ్‌ల స్పష్టమైన ఫోటోలను అప్‌లోడ్ చేయండి.", success: "స్వీకరించబడింది!", successSub: "మేము త్వరలో మిమ్మల్ని సంప్రదిస్తాము.", back: "వెనక్కి వెళ్ళు", error: "విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.", help_title: "మమ్మల్ని సంప్రదించండి", help_desc: "మీ సమస్యను చెప్పండి మరియు మేము సహాయం చేస్తాము.", help_btn: "సందేశం పంపండి", help_succ: "సందేశం పంపబడింది" },
    ta: { help: "உதவி மையம்", lang: "தமிழ்", login: "உள்நுழைய", careers: "தொழில்", products: "தயாரிப்புகள்", main_title: "இந்தியாவின் ஸ்மார்ட் டெலிவரி நெட்வொர்க் வருகிறது.", main_sub: "தாமதம் இல்லை. உங்களுக்காக உருவாக்கப்பட்ட விரைவான நெட்வொர்க்.", val1_title: "மிக வேகமாக", val1_sub: "போக்குவரத்தை தவிர்க்க ஸ்மார்ட் வரைபடங்கள்.", val2_title: "கூடுதல் கட்டணம் இல்லை", val2_sub: "தெளிவான விலைகள். நீங்கள் பார்ப்பதை மட்டும் செலுத்துங்கள்.", val3_title: "நேரலை கண்காணிப்பு", val3_sub: "உங்கள் ஆர்டரை வரைபடத்தில் பார்க்கவும்.", val4_title: "24/7 ஆதரவு", val4_sub: "உதவ நாங்கள் எப்போதும் இருக்கிறோம்.", form_title: "காத்திருப்பு பட்டியலில் சேரவும்", form_desc: "முன்கூட்டியே அணுக இப்போதே பதிவு செய்யவும்.", form_name: "பெயர்", form_phone: "தொலைபேசி", form_email: "மின்னஞ்சல்", form_city: "நகரம்", form_role: "பங்கு", form_vehicle: "வாகனம்", form_business: "வணிக பெயர்", form_submit: "எனது இடத்தை உறுதி செய்யவும்", form_kyc_btn: "சரிபார்ப்பை தொடங்கவும்", kyc_face_title: "முக சரிபார்ப்பு", kyc_face_desc: "காமிராவைப் பாருங்கள். கணினி தானாகவே புகைப்படம் எடுக்கும்.", kyc_docs_title: "ஆவணங்களை பதிவேற்றவும்", kyc_docs_desc: "உங்கள் அடையாள அட்டைகளின் தெளிவான புகைப்படங்களை பதிவேற்றவும்.", success: "பெறப்பட்டது!", successSub: "நாங்கள் விரைவில் உங்களை தொடர்புகொள்வோம்.", back: "திரும்பி செல்", error: "தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.", help_title: "தொடர்பு கொள்ள", help_desc: "உங்கள் பிரச்சனையை சொல்லுங்கள் நாங்கள் உதவுகிறோம்.", help_btn: "செய்தி அனுப்பு", help_succ: "செய்தி அனுப்பப்பட்டது" },
    pa: { help: "ਸਹਾਇਤਾ ਕੇਂਦਰ", lang: "ਪੰਜਾਬੀ", login: "ਸਾਈਨ ਇਨ", careers: "ਕਰੀਅਰ", products: "ਉਤਪਾਦ", main_title: "ਭਾਰਤ ਦਾ ਸਭ ਤੋਂ ਸਮਾਰਟ ਡਿਲਿਵਰੀ ਨੈੱਟਵਰਕ ਆ ਰਿਹਾ ਹੈ।", main_sub: "ਕੋਈ ਦੇਰੀ ਨਹੀਂ। ਤੁਹਾਡੇ ਲਈ ਬਣਾਇਆ ਇੱਕ ਤੇਜ਼ ਨੈੱਟਵਰਕ।", val1_title: "ਬਹੁਤ ਤੇਜ਼", val1_sub: "ਟ੍ਰੈਫਿਕ ਤੋਂ ਬਚਣ ਲਈ ਸਮਾਰਟ ਨਕਸ਼ੇ।", val2_title: "ਕੋਈ ਵਾਧੂ ਫੀਸ ਨਹੀਂ", val2_sub: "ਸਾਫ਼ ਕੀਮਤਾਂ। ਸਿਰਫ਼ ਉਹੀ ਭੁਗਤਾਨ ਕਰੋ ਜੋ ਤੁਸੀਂ ਦੇਖਦੇ ਹੋ।", val3_title: "ਲਾਈਵ ਟ੍ਰੈਕਿੰਗ", val3_sub: "ਆਪਣੇ ਆਰਡਰ ਨੂੰ ਨਕਸ਼ੇ 'ਤੇ ਦੇਖੋ।", val4_title: "24/7 ਮਦਦ", val4_sub: "ਅਸੀਂ ਹਮੇਸ਼ਾ ਮਦਦ ਲਈ ਇੱਥੇ ਹਾਂ।", form_title: "ਵੇਟਲਿਸਟ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋਵੋ", form_desc: "ਜਲਦੀ ਪਹੁੰਚ ਲਈ ਹੁਣੇ ਸਾਈਨ ਅੱਪ ਕਰੋ।", form_name: "ਨਾਮ", form_phone: "ਫੋਨ", form_email: "ਈਮੇਲ", form_city: "ਸ਼ਹਿਰ", form_role: "ਭੂਮਿਕਾ", form_vehicle: "ਵਾਹਨ", form_business: "ਕਾਰੋਬਾਰ ਦਾ ਨਾਮ", form_submit: "ਮੇਰੀ ਜਗ੍ਹਾ ਪੱਕੀ ਕਰੋ", form_kyc_btn: "ਤਸਦੀਕ ਸ਼ੁਰੂ ਕਰੋ", kyc_face_title: "ਚਿਹਰਾ ਚੈੱਕ", kyc_face_desc: "ਕੈਮਰੇ ਵੱਲ ਦੇਖੋ। ਸਿਸਟਮ ਆਪਣੇ ਆਪ ਫੋਟੋ ਲੈ ਲਵੇਗਾ।", kyc_docs_title: "ਦਸਤਾਵੇਜ਼ ਅੱਪਲੋਡ ਕਰੋ", kyc_docs_desc: "ਆਪਣੇ ਆਈਡੀ ਕਾਰਡਾਂ ਦੀਆਂ ਸਾਫ਼ ਫੋਟੋਆਂ ਅੱਪਲੋਡ ਕਰੋ।", success: "ਪ੍ਰਾਪਤ ਹੋਇਆ!", successSub: "ਅਸੀਂ ਜਲਦੀ ਹੀ ਤੁਹਾਡੇ ਨਾਲ ਸੰਪਰਕ ਕਰਾਂਗੇ।", back: "ਵਾਪਸ ਜਾਓ", error: "ਅਸਫਲ. ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।", help_title: "ਸੰਪਰਕ ਕਰੋ", help_desc: "ਆਪਣੀ ਸਮੱਸਿਆ ਦੱਸੋ ਅਤੇ ਅਸੀਂ ਮਦਦ ਕਰਾਂਗੇ।", help_btn: "ਸੁਨੇਹਾ ਭੇਜੋ", help_succ: "ਸੁਨੇਹਾ ਭੇਜਿਆ ਗਿਆ" },
    bho: { help: "मदद केंद्र", lang: "भोजपुरी", login: "साइन इन", careers: "करियर", products: "उत्पाद", main_title: "भारत के स्मार्ट डिलीवरी नेटवर्क आवत बा।", main_sub: "कौनो देरी ना। रउआ खातिर बनल तेज नेटवर्क।", val1_title: "बहुत तेज", val1_sub: "ट्रैफिक से बचे खातिर स्मार्ट मैप।", val2_title: "कौनो अतिरिक्त फीस ना", val2_sub: "साफ कीमत। खाली उहे दीं जवन रउआ देखत बानी।", val3_title: "लाइव ट्रैकिंग", val3_sub: "आपन ऑर्डर के मैप पर देखीं।", val4_title: "24/7 मदद", val4_sub: "हमनी के रउआ मदद खातिर हमेशा इहाँ बानी जा।", form_title: "वेटलिस्ट में शामिल होईं", form_desc: "जल्दी फायदा पावे खातिर अभी साइन अप करीं।", form_name: "नाम", form_phone: "फोन", form_email: "ईमेल", form_city: "शहर", form_role: "भूमिका", form_vehicle: "वाहन", form_business: "व्यापार के नाम", form_submit: "हमर जगह पक्का करीं", form_kyc_btn: "सत्यापन शुरू करीं", kyc_face_title: "चेहरा जांच", kyc_face_desc: "कैमरा में देखीं। सिस्टम अपने आप फोटो ले ली।", kyc_docs_title: "दस्तावेज अपलोड करीं", kyc_docs_desc: "आपन आईडी कार्ड के साफ फोटो अपलोड करीं।", success: "मिल गइल!", successSub: "हमनी के टीम जल्दिए रउआ से संपर्क करी।", back: "पीछे जाईं", error: "विफल। फेरू कोशिश करीं।", help_title: "संपर्क करीं", help_desc: "आपन समस्या बताईं आ हमनी के मदद करब जा।", help_btn: "संदेश भेजीं", help_succ: "संदेश भेजल गइल" },
    ar: { help: "مركز المساعدة", lang: "العربية", login: "تسجيل الدخول", careers: "وظائف", products: "المنتجات", main_title: "أذكى شبكة توصيل في الهند قادمة.", main_sub: "تجربة بدون تأخير. شبكة سريعة مصممة لك.", val1_title: "سريع جداً", val1_sub: "خرائط ذكية لتجنب الازدحام.", val2_title: "لا رسوم إضافية", val2_sub: "أسعار واضحة. ادفع فقط ما تراه.", val3_title: "تتبع مباشر", val3_sub: "شاهد طلبك على الخريطة.", val4_title: "مساعدة 24/7", val4_sub: "نحن دائماً هنا للمساعدة.", form_title: "انضم إلى قائمة الانتظار", form_desc: "سجل الآن للوصول المبكر.", form_name: "الاسم", form_phone: "الهاتف", form_email: "البريد", form_city: "المدينة", form_role: "الدور", form_vehicle: "المركبة", form_business: "اسم العمل", form_submit: "احجز مكاني", form_kyc_btn: "بدء التحقق", kyc_face_title: "فحص الوجه", kyc_face_desc: "انظر للكاميرا. سيلتقط النظام صورة تلقائياً.", kyc_docs_title: "رفع المستندات", kyc_docs_desc: "ارفع صور واضحة لبطاقات الهوية الخاصة بك.", success: "تم الاستلام!", successSub: "سنتصل بك قريباً.", back: "العودة", error: "فشل. حاول مرة أخرى.", help_title: "اتصل بنا", help_desc: "أخبرنا بمشكلتك وسنساعدك.", help_btn: "إرسال رسالة", help_succ: "تم الإرسال" },
    es: { help: "Centro de ayuda", lang: "Español", login: "Iniciar Sesión", careers: "Carreras", products: "Productos", main_title: "La red de entrega más inteligente está en camino.", main_sub: "Cero retrasos. Una red rápida construida para ti.", val1_title: "Súper rápido", val1_sub: "Mapas inteligentes para evitar el tráfico.", val2_title: "Sin tarifas extra", val2_sub: "Precios claros. Paga solo lo que ves.", val3_title: "Rastreo en vivo", val3_sub: "Mira tu pedido en el mapa.", val4_title: "Ayuda 24/7", val4_sub: "Siempre estamos aquí para ayudar.", form_title: "Únete a la lista", form_desc: "Regístrate ahora para acceso anticipado.", form_name: "Nombre", form_phone: "Teléfono", form_email: "Correo", form_city: "Ciudad", form_role: "Rol", form_vehicle: "Vehículo", form_business: "Nombre de la empresa", form_submit: "Guardar mi lugar", form_kyc_btn: "Iniciar Verificación", kyc_face_title: "Comprobación facial", kyc_face_desc: "Mire a la cámara. El sistema tomará una foto automáticamente.", kyc_docs_title: "Subir Documentos", kyc_docs_desc: "Sube fotos claras de tus tarjetas de identificación.", success: "¡Recibido!", successSub: "Te contactaremos pronto.", back: "Volver", error: "Falló. Inténtalo de nuevo.", help_title: "Contáctanos", help_desc: "Dinos tu problema y te ayudaremos.", help_btn: "Enviar Mensaje", help_succ: "Mensaje Enviado" },
    fr: { help: "Centre d'aide", lang: "Français", login: "Se Connecter", careers: "Carrières", products: "Produits", main_title: "Le réseau de livraison le plus intelligent arrive.", main_sub: "Zéro retard. Un réseau rapide conçu pour vous.", val1_title: "Super rapide", val1_sub: "Cartes intelligentes pour éviter le trafic.", val2_title: "Pas de frais supplémentaires", val2_sub: "Prix clairs. Payez uniquement ce que vous voyez.", val3_title: "Suivi en direct", val3_sub: "Regardez votre commande sur la carte.", val4_title: "Aide 24/7", val4_sub: "Nous sommes toujours là pour aider.", form_title: "Rejoindre la liste", form_desc: "Inscrivez-vous maintenant pour un accès anticipé.", form_name: "Nom", form_phone: "Téléphone", form_email: "Email", form_city: "Ville", form_role: "Rôle", form_vehicle: "Véhicule", form_business: "Nom de l'entreprise", form_submit: "Garder ma place", form_kyc_btn: "Commencer la Vérification", kyc_face_title: "Vérification faciale", kyc_face_desc: "Regardez la caméra. Le système prendra une photo automatiquement.", kyc_docs_title: "Télécharger des documents", kyc_docs_desc: "Téléchargez des photos claires de vos pièces d'identité.", success: "Reçu !", successSub: "Nous vous contacterons bientôt.", back: "Retour", error: "Échec. Réessayez.", help_title: "Contactez-nous", help_desc: "Dites-nous votre problème et nous vous aiderons.", help_btn: "Envoyer le message", help_succ: "Message Envoyé" },
    de: { help: "Hilfezentrum", lang: "Deutsch", login: "Anmelden", careers: "Karriere", products: "Produkte", main_title: "Das intelligenteste Liefernetzwerk kommt.", main_sub: "Keine Verzögerungen. Ein schnelles Netzwerk für Sie.", val1_title: "Super schnell", val1_sub: "Intelligente Karten, um Staus zu vermeiden.", val2_title: "Keine Extragebühren", val2_sub: "Klare Preise. Zahlen Sie nur, was Sie sehen.", val3_title: "Live-Tracking", val3_sub: "Sehen Sie Ihre Bestellung auf der Karte.", val4_title: "24/7 Hilfe", val4_sub: "Wir sind immer hier, um zu helfen.", form_title: "Warteliste beitreten", form_desc: "Melden Sie sich jetzt für frühen Zugang an.", form_name: "Name", form_phone: "Telefon", form_email: "E-Mail", form_city: "Stadt", form_role: "Rolle", form_vehicle: "Fahrzeug", form_business: "Firmenname", form_submit: "Meinen Platz speichern", form_kyc_btn: "Überprüfung Starten", kyc_face_title: "Gesichtsprüfung", kyc_face_desc: "Schauen Sie in die Kamera. Das System macht automatisch ein Foto.", kyc_docs_title: "Dokumente Hochladen", kyc_docs_desc: "Laden Sie klare Fotos Ihrer Ausweise hoch.", success: "Erhalten!", successSub: "Wir werden Sie bald kontaktieren.", back: "Zurück", error: "Fehlgeschlagen. Bitte versuchen Sie es erneut.", help_title: "Kontakt", help_desc: "Sagen Sie uns Ihr Problem und wir helfen.", help_btn: "Nachricht Senden", help_succ: "Nachricht Gesendet" }
  };

  const currentT = t[lang] || t['en'];
  const languageOptions = [
    { code: 'en', label: 'English' }, { code: 'hi', label: 'हिन्दी' }, { code: 'mr', label: 'मराठी' },
    { code: 'gu', label: 'ગુજરાતી' }, { code: 'te', label: 'తెలుగు' }, { code: 'ta', label: 'தமிழ்' },
    { code: 'pa', label: 'ਪੰਜਾਬੀ' }, { code: 'bho', label: 'भोजपुरी' }, { code: 'hinglish', label: 'Hinglish' },
    { code: 'ar', label: 'العربية' }, { code: 'es', label: 'Español' }, { code: 'fr', label: 'Français' },
    { code: 'de', label: 'Deutsch' }
  ];

  // ----------------------------------------------------------------------------
  // ANIMATED SUCCESS SVG MARKER
  // ----------------------------------------------------------------------------
  const tickVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 1, 
      transition: { duration: 0.8, ease: "easeInOut" } 
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#000000] text-white font-sans selection:bg-white selection:text-black overflow-x-hidden flex flex-col relative">
      
      {/* CSS-IN-JS FOR MINIMALIST ANIMATIONS */}
      <style>
        {`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
          .animate-fade { animation: fadeIn 0.8s ease-out forwards; }
          .stagger-1 { animation-delay: 0.1s; }
          .stagger-2 { animation-delay: 0.2s; }
          .stagger-3 { animation-delay: 0.3s; }
          input:focus, select:focus, textarea:focus { border-color: #ffffff !important; }
          html { scroll-behavior: smooth; }
        `}
      </style>

      {/* HELP CENTER MODAL */}
      <AnimatePresence>
        {showHelpPrompt && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-[400px] bg-[#050505] border border-[#333333] rounded-3xl p-8 flex flex-col shadow-2xl relative"
            >
              <button 
                onClick={() => setShowHelpPrompt(false)} 
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[#888888] hover:text-white transition-colors outline-none"
              >
                <X size={18} />
              </button>

              <h2 className="text-[1.5rem] font-black tracking-tight mb-2 text-white text-center mt-2">{currentT.help_title}</h2>
              <p className="text-[#888888] text-[0.9rem] text-center mb-6">{currentT.help_desc}</p>

              {helpStatus === 'SUCCESS' ? (
                <div className="flex flex-col items-center justify-center py-6">
                    <div className="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center mb-4">
                        <motion.svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial="hidden" animate="visible">
                            <motion.polyline points="20 6 9 17 4 12" variants={tickVariants} />
                        </motion.svg>
                    </div>
                    <span className="font-bold">{currentT.help_succ}</span>
                </div>
              ) : (
                <form onSubmit={submitHelpRequest} className="flex flex-col gap-4">
                  <input type="email" required placeholder="Email Address" className="w-full bg-[#111111] border border-[#333333] text-white px-4 py-3.5 rounded-xl outline-none transition-colors text-[0.9rem]" />
                  <textarea required rows="4" placeholder="How can we help you?" className="w-full bg-[#111111] border border-[#333333] text-white px-4 py-3.5 rounded-xl outline-none transition-colors text-[0.9rem] resize-none"></textarea>
                  <button type="submit" disabled={helpStatus === 'SUBMITTING'} className="w-full bg-white text-black py-3.5 rounded-xl font-black mt-2 hover:bg-[#e0e0e0] transition-colors disabled:opacity-50 outline-none">
                    {helpStatus === 'SUBMITTING' ? '...' : currentT.help_btn}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PRODUCTS ECOSYSTEM MODAL */}
      <AnimatePresence>
        {showProductsPrompt && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-[500px] bg-[#050505] border border-[#333333] rounded-3xl p-8 flex flex-col shadow-2xl relative"
            >
              <button 
                onClick={() => setShowProductsPrompt(false)} 
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[#888888] hover:text-white transition-colors outline-none"
              >
                <X size={18} />
              </button>

              <h2 className="text-[1.5rem] font-black tracking-tight mb-2 text-white text-center mt-2">Also from us</h2>
              <p className="text-[#888888] text-[0.9rem] text-center mb-8">Discover our other platforms.</p>

              <Link to="/sahay" className="group flex flex-col items-center gap-4 bg-[#111111] border border-[#333333] p-6 rounded-2xl hover:border-white transition-colors text-center w-full outline-none mb-4">
                  <div className="flex items-center gap-2 mb-2">
                      <img 
                          src="/logo.png" 
                          alt="Movyra" 
                          className="h-6 w-auto" 
                          onError={(e) => e.target.style.display = 'none'} 
                      />
                      <span className="font-black text-[1.2rem] tracking-tighter ml-[-5px] text-white">
                          ovyra <span className="text-[#888888] font-medium text-[1rem] ml-1">Sahay</span>
                      </span>
                  </div>
                  <div>
                      <p className="text-[#888888] text-[0.85rem] leading-relaxed group-hover:text-[#aaaaaa] transition-colors">
                          Humanitarian rescue operations. Connect and report easily.
                      </p>
                  </div>
              </Link>

              <Link to="/civic" className="group flex flex-col items-center gap-4 bg-[#111111] border border-[#333333] p-6 rounded-2xl hover:border-white transition-colors text-center w-full outline-none">
                  <div className="flex items-center gap-2 mb-2">
                      <img 
                          src="/logo.png" 
                          alt="Movyra" 
                          className="h-6 w-auto" 
                          onError={(e) => e.target.style.display = 'none'} 
                      />
                      <span className="font-black text-[1.2rem] tracking-tighter ml-[-5px] text-white">
                          ovyra <span className="text-[#888888] font-medium text-[1rem] ml-1">Civic</span>
                      </span>
                  </div>
                  <div>
                      <p className="text-[#888888] text-[0.85rem] leading-relaxed group-hover:text-[#aaaaaa] transition-colors">
                          Smart city management. Report issues easily.
                      </p>
                  </div>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP HEADER */}
      <header className="w-full flex items-center justify-between px-8 md:px-16 py-8 animate-fade relative z-50">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Movyra" className="h-8 w-auto" onError={(e) => e.target.style.display = 'none'} />
          <span className="font-black text-[1.5rem] tracking-tighter ml-[-5px]">ovyra</span>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-6 text-[0.9rem] font-bold">
          <button onClick={() => setShowHelpPrompt(true)} className="cursor-pointer hover:text-[#aaaaaa] transition-colors hidden sm:block outline-none text-white">
            {currentT.help}
          </button>
          
          {/* CUSTOM LANGUAGE PROMPT TRIGGER */}
          <button 
            onClick={() => setShowLangPrompt(true)}
            className="flex items-center gap-2 hover:text-[#aaaaaa] transition-colors outline-none text-white"
          >
            {currentT.lang}
          </button>

          {/* DYNAMIC AUTHENTICATION DISPLAY */}
          {currentUser ? (
            <>
                <button onClick={handleSignOut} className="bg-[#111111] border border-[#333333] text-white px-5 py-2 rounded-full hidden sm:flex items-center gap-2 hover:border-white transition-colors outline-none">
                    Sign Out
                </button>
                {/* Mobile Logout Icon */}
                <button onClick={handleSignOut} className="p-2 rounded-full bg-[#111111] border border-[#333333] text-white hover:border-white transition-colors outline-none block sm:hidden">
                    <LogOut size={16} />
                </button>
            </>
          ) : (
            <button onClick={() => setShowLoginPrompt(true)} className="bg-white text-black px-5 py-2 rounded-full flex items-center gap-2 hover:bg-[#e0e0e0] transition-colors outline-none">
              {currentT.login}
            </button>
          )}

        </div>
      </header>

      {/* LANGUAGE SELECTOR MODAL */}
      <AnimatePresence>
        {showLangPrompt && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-[400px] bg-[#050505] border border-[#333333] rounded-3xl p-8 flex flex-col shadow-2xl relative max-h-[80vh] overflow-y-auto"
            >
              <button 
                onClick={() => setShowLangPrompt(false)} 
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[#888888] hover:text-white transition-colors outline-none"
              >
                <X size={18} />
              </button>
              
              <div className="w-12 h-12 mx-auto rounded-full border border-[#333333] flex items-center justify-center mb-4">
                <Globe size={24} stroke="white" strokeWidth="1.5" />
              </div>

              <h2 className="text-[1.5rem] font-black tracking-tight mb-2 text-white text-center">Select Language</h2>
              <p className="text-[#888888] text-[0.9rem] text-center mb-8">Choose your preferred viewing language.</p>
              
              <div className="flex flex-col gap-2">
                {languageOptions.map((option) => (
                  <button 
                    key={option.code}
                    onClick={() => { setLang(option.code); setShowLangPrompt(false); }}
                    className={`w-full p-4 rounded-xl flex items-center justify-between group transition-colors outline-none ${lang === option.code ? 'bg-[#222222] border border-white' : 'bg-[#0a0a0a] border border-[#333333] hover:border-white'}`}
                  >
                    <span className={`font-bold text-[1rem] ${lang === option.code ? 'text-white' : 'text-[#888888] group-hover:text-white'}`}>{option.label}</span>
                    {lang === option.code && <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GLOBAL LOGIN ROUTING MODAL */}
      <AnimatePresence>
        {showLoginPrompt && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-[400px] bg-[#050505] border border-[#333333] rounded-3xl p-8 flex flex-col shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => { setShowLoginPrompt(false); }} 
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[#888888] hover:text-white transition-colors outline-none"
              >
                <X size={18} />
              </button>
              
              <h2 className="text-[1.5rem] font-black tracking-tight mb-2 text-white text-center mt-2">Welcome</h2>
              <p className="text-[#888888] text-[0.9rem] text-center mb-6">Sign in to your account.</p>
              
              {/* AUTHENTICATION FORM */}
              {!currentUser && (
                <div className="mb-4">
                  {authError && (
                    <div className="bg-[#ff4444]/10 text-[#ff4444] border border-[#ff4444]/20 p-4 rounded-xl text-[0.85rem] font-bold mb-6 text-center">
                      {authError}
                    </div>
                  )}

                  <form onSubmit={handleStandardAuth} className="flex flex-col gap-4 mb-6">
                    <input type="email" required placeholder="Email Address" value={authEmail} onChange={e => setAuthEmail(e.target.value)} className="w-full bg-[#111111] border border-[#333333] text-white px-4 py-3.5 rounded-xl outline-none focus:border-white transition-colors text-[0.9rem]" />
                    <input type="password" required placeholder="Password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} className="w-full bg-[#111111] border border-[#333333] text-white px-4 py-3.5 rounded-xl outline-none focus:border-white transition-colors text-[0.9rem]" />
                    <button type="submit" className="w-full bg-white text-black py-3.5 rounded-xl font-black mt-2 hover:bg-[#e0e0e0] transition-colors outline-none">
                      {isLoginMode ? 'Sign In' : 'Sign Up'}
                    </button>
                  </form>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 h-px bg-[#333333]"></div>
                    <span className="text-[#888888] text-[0.8rem] font-bold">OR</span>
                    <div className="flex-1 h-px bg-[#333333]"></div>
                  </div>

                  <button onClick={handleGoogleAuth} className="w-full bg-[#111111] border border-[#333333] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-[#222222] transition-colors mb-6 outline-none">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Continue with Google
                  </button>

                  <p className="text-center text-[#666666] text-[0.85rem]">
                    {isLoginMode ? "Don't have an account? " : "Already have an account? "}
                    <button onClick={() => setIsLoginMode(!isLoginMode)} className="text-white font-bold hover:underline outline-none">
                      {isLoginMode ? 'Sign Up' : 'Sign In'}
                    </button>
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTAINER */}
      <div className="w-full max-w-[1400px] mx-auto px-8 md:px-16 py-12 flex flex-col lg:flex-row gap-20 items-start justify-between relative z-10">
        
        {/* SECTION 1: MARKETING HERO & VALUE PROPOSITIONS */}
        <div className="flex-1 opacity-0 animate-fade stagger-1">
          <h1 className="text-[3.5rem] md:text-[5rem] lg:text-[6rem] font-black leading-[1] tracking-tighter mb-6 text-white max-w-[800px]">
            {currentT.main_title}
          </h1>
          <p className="text-[1.25rem] md:text-[1.5rem] text-[#aaaaaa] font-medium leading-[1.5] max-w-[600px] mb-8">
            {currentT.main_sub}
          </p>

          {/* DYNAMIC NAVIGATION ROUTING */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md mb-16 relative">
            <AnimatePresence mode="wait">
              {!showExploreOptions ? (
                <motion.div key="main-btns" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex w-full gap-4">
                  <button onClick={() => setShowExploreOptions(true)} className="w-full bg-white text-black py-4 rounded-full font-black text-[1rem] hover:bg-[#e0e0e0] transition-colors outline-none">
                    Explore Now
                  </button>
                  <Link to="/vendor" className="w-full bg-[#111111] border border-[#333333] text-white py-4 rounded-full font-black text-[1rem] text-center hover:border-white transition-colors outline-none">
                    Partner With Us
                  </Link>
                </motion.div>
              ) : (
                <motion.div key="expanded-btns" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col w-full gap-3 bg-[#111111] p-4 rounded-3xl border border-[#333333]">
                  <div className="flex justify-between items-center mb-2 px-2">
                    <span className="text-[#888888] font-bold text-[0.8rem] uppercase tracking-widest">Select Ecosystem</span>
                    <button onClick={() => { setShowExploreOptions(false); setShowOrderExpansions(false); }} className="text-[#888888] hover:text-white outline-none"><X size={18} /></button>
                  </div>
                  
                  <Link to="/delivery" className="w-full bg-white text-black py-3.5 rounded-2xl font-black text-[0.95rem] text-center hover:bg-[#e0e0e0] transition-colors outline-none">
                    Deliver Now
                  </Link>
                  
                  {!showOrderExpansions ? (
                    <button onClick={() => setShowOrderExpansions(true)} className="w-full bg-[#000000] border border-[#333333] text-white py-3.5 rounded-2xl font-black text-[0.95rem] text-center hover:border-white transition-colors flex items-center justify-center gap-2 outline-none">
                      Order Now <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </button>
                  ) : (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex flex-col gap-2 pl-4 border-l-2 border-[#333333] ml-2">
                      <Link to="/order" className="text-[#aaaaaa] font-bold text-[0.9rem] hover:text-white py-2 flex items-center gap-2 outline-none"><div className="w-1.5 h-1.5 rounded-full bg-white"></div> Complete Marketplace</Link>
                      <Link to="/grocery" className="text-[#aaaaaa] font-bold text-[0.9rem] hover:text-white py-2 flex items-center gap-2 outline-none"><div className="w-1.5 h-1.5 rounded-full bg-[#00ff88]"></div> Daily Needs & Grocery</Link>
                      <Link to="/veggies" className="text-[#aaaaaa] font-bold text-[0.9rem] hover:text-white py-2 flex items-center gap-2 outline-none"><div className="w-1.5 h-1.5 rounded-full bg-[#00A9F7]"></div> Fresh Veggies & Fruits</Link>
                    </motion.div>
                  )}
                  
                  <Link to="/vendor" className="w-full bg-[#000000] border border-[#333333] text-white py-3.5 rounded-2xl font-black text-[0.95rem] text-center hover:border-white transition-colors mt-1 outline-none">
                    Partner With Us
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="flex flex-col gap-2">
               <div className="w-10 h-10 rounded-full border border-[#333333] flex items-center justify-center mb-2"><svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg></div>
               <h4 className="font-black text-[1.2rem]">{currentT.val1_title}</h4>
               <p className="text-[#888888] text-[0.95rem] leading-relaxed">{currentT.val1_sub}</p>
            </div>
            <div className="flex flex-col gap-2">
               <div className="w-10 h-10 rounded-full border border-[#333333] flex items-center justify-center mb-2"><svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg></div>
               <h4 className="font-black text-[1.2rem]">{currentT.val2_title}</h4>
               <p className="text-[#888888] text-[0.95rem] leading-relaxed">{currentT.val2_sub}</p>
            </div>
            <div className="flex flex-col gap-2">
               <div className="w-10 h-10 rounded-full border border-[#333333] flex items-center justify-center mb-2"><svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3" fill="black"/></svg></div>
               <h4 className="font-black text-[1.2rem]">{currentT.val3_title}</h4>
               <p className="text-[#888888] text-[0.95rem] leading-relaxed">{currentT.val3_sub}</p>
            </div>
            <div className="flex flex-col gap-2">
               <div className="w-10 h-10 rounded-full border border-[#333333] flex items-center justify-center mb-2"><svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg></div>
               <h4 className="font-black text-[1.2rem]">{currentT.val4_title}</h4>
               <p className="text-[#888888] text-[0.95rem] leading-relaxed">{currentT.val4_sub}</p>
            </div>
          </div>
        </div>

        {/* SECTION 2: MULTI-STAGE REGISTRATION & KYC HUB (UNAUTHENTICATED ACCESS) */}
        <div className="w-full lg:w-[480px] bg-[#0a0a0a] border border-[#222222] rounded-[32px] p-8 shadow-[0_20px_60px_rgba(255,255,255,0.02)] opacity-0 animate-fade stagger-2 shrink-0 min-h-[400px]">
          
          {/* STAGE: SUCCESS OR ERROR */}
          {status === 'SUCCESS' ? (
            <div className="text-center py-10 flex flex-col items-center">
              <div className="w-24 h-24 bg-transparent border-4 border-white rounded-full flex items-center justify-center mb-8 relative">
                 <motion.svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial="hidden" animate="visible">
                   <motion.polyline points="20 6 9 17 4 12" variants={tickVariants} />
                 </motion.svg>
              </div>
              <h3 className="font-black text-[1.8rem] mb-2">{currentT.success}</h3>
              <p className="text-[#888888] text-[1.1rem] mb-10 font-bold">{currentT.successSub}</p>
              <button onClick={() => setStatus('IDLE')} className="w-full border border-[#333] text-white py-4 rounded-xl font-black hover:bg-white hover:text-black transition-colors text-[0.95rem] uppercase tracking-widest outline-none">
                {currentT.back}
              </button>
            </div>
          ) : status === 'ERROR' ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-10 animate-fade">
              <h3 className="text-[1.8rem] font-black mb-2 text-[#ff4444]">System Error</h3>
              <p className="text-[#888888] text-[0.9rem] mb-6">{currentT.error}</p>
              <button onClick={() => setStatus('IDLE')} className="border border-white px-6 py-2 rounded-full font-bold text-black bg-white hover:bg-[#e0e0e0] outline-none">Retry</button>
            </div>
          ) : status === 'KYC_FACE' ? (
            // STAGE: KYC FACE VERIFICATION (WEBCAM WITH MEDIAPIPE)
            <div className="flex flex-col h-full animate-fade relative">
              <h3 className="text-[1.5rem] font-black mb-2">{currentT.kyc_face_title}</h3>
              <p className="text-[#888888] text-[0.85rem] mb-8">{currentT.kyc_face_desc}</p>
              <div className="w-full aspect-square bg-[#000000] border border-[#333333] rounded-[24px] overflow-hidden relative shadow-inner mb-6">
                <video ref={videoRef} playsInline muted className="w-full h-full object-cover scale-x-[-1]"></video>
                <canvas ref={canvasRef} className="hidden"></canvas>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <svg viewBox="0 0 100 100" className="w-[60%] h-[60%] opacity-30 mb-8"><ellipse cx="50" cy="50" rx="35" ry="45" fill="none" stroke="white" strokeWidth="2" strokeDasharray="4 4" /></svg>
                </div>
                {/* MANUAL CAPTURE OVERRIDE BUTTON */}
                <div className="absolute bottom-8 left-0 w-full flex justify-center z-10">
                   <button onClick={processCapture} className="w-16 h-16 bg-white rounded-full border-4 border-[#333] shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform outline-none"></button>
                </div>
              </div>
              <div className="text-center font-mono text-[0.7rem] text-[#666] tracking-widest uppercase animate-pulse">Running Liveness Engine...</div>
            </div>
          ) : status === 'KYC_DOCS' ? (
            // STAGE: EXPANDED KYC DOCUMENT UPLOAD
            <div className="flex flex-col h-full animate-fade">
              <h3 className="text-[1.5rem] font-black mb-2">{currentT.kyc_docs_title}</h3>
              <p className="text-[#888888] text-[0.85rem] mb-8">{currentT.kyc_docs_desc}</p>
              
              <div className="max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                <form id="kyc-docs-form" onSubmit={handleFinalSubmit} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-3">
                    <label className="block text-[0.75rem] font-bold uppercase tracking-widest text-[#FFFFFF] border-b border-[#333333] pb-1">Aadhaar Card</label>
                    <input type="file" required onChange={(e)=>setFiles({...files, aadhaarFront: e.target.files[0]})} className="w-full bg-[#000000] border border-[#333333] text-[#aaaaaa] px-4 py-2 rounded-xl outline-none text-[0.8rem] file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-[0.75rem] file:font-bold file:bg-white file:text-black cursor-pointer" title="Front Side" />
                    <input type="file" required onChange={(e)=>setFiles({...files, aadhaarBack: e.target.files[0]})} className="w-full bg-[#000000] border border-[#333333] text-[#aaaaaa] px-4 py-2 rounded-xl outline-none text-[0.8rem] file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-[0.75rem] file:font-bold file:bg-white file:text-black cursor-pointer" title="Back Side" />
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="block text-[0.75rem] font-bold uppercase tracking-widest text-[#FFFFFF] border-b border-[#333333] pb-1">PAN Card</label>
                    <input type="file" required onChange={(e)=>setFiles({...files, panFront: e.target.files[0]})} className="w-full bg-[#000000] border border-[#333333] text-[#aaaaaa] px-4 py-2 rounded-xl outline-none text-[0.8rem] file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-[0.75rem] file:font-bold file:bg-white file:text-black cursor-pointer" title="Front Side" />
                    <input type="file" required onChange={(e)=>setFiles({...files, panBack: e.target.files[0]})} className="w-full bg-[#000000] border border-[#333333] text-[#aaaaaa] px-4 py-2 rounded-xl outline-none text-[0.8rem] file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-[0.75rem] file:font-bold file:bg-white file:text-black cursor-pointer" title="Back Side" />
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="block text-[0.75rem] font-bold uppercase tracking-widest text-[#FFFFFF] border-b border-[#333333] pb-1">Business Registration</label>
                    <input type="file" required onChange={(e)=>setFiles({...files, gst: e.target.files[0]})} className="w-full bg-[#000000] border border-[#333333] text-[#aaaaaa] px-4 py-2 rounded-xl outline-none text-[0.8rem] file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-[0.75rem] file:font-bold file:bg-white file:text-black cursor-pointer" title="GST Certificate" />
                    <input type="file" required onChange={(e)=>setFiles({...files, businessDocs: e.target.files[0]})} className="w-full bg-[#000000] border border-[#333333] text-[#aaaaaa] px-4 py-2 rounded-xl outline-none text-[0.8rem] file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-[0.75rem] file:font-bold file:bg-white file:text-black cursor-pointer" title="Incorporation/Shop Act" />
                  </div>
                </form>
              </div>

              <button form="kyc-docs-form" type="submit" className="w-full bg-white text-black font-black text-[1.1rem] tracking-tight py-4 rounded-xl mt-6 hover:bg-[#e0e0e0] transition-colors shrink-0 shadow-[0_-10px_20px_#0a0a0a] outline-none">
                Upload & Finalize
              </button>
            </div>
          ) : (
            // STAGE: INITIAL REGISTRATION FORM (UNAUTHENTICATED ALLOWED)
            <div className="animate-fade">
              <h3 className="text-[1.8rem] font-black mb-2 text-white">{currentT.form_title}</h3>
              <p className="text-[#888888] text-[0.9rem] mb-8">{currentT.form_desc}</p>
              
              <form onSubmit={(e) => { e.preventDefault(); isConsumer ? handleFinalSubmit(e) : startFaceScan(); }} className="flex flex-col gap-4">
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-1/2">
                    <label className="block text-[0.75rem] font-bold uppercase tracking-widest text-[#666666] mb-2">{currentT.form_name}</label>
                    <input required type="text" value={formData.name} onChange={(e)=>setFormData({...formData, name: e.target.value})} className="w-full bg-[#000000] border border-[#333333] text-white px-4 py-3.5 rounded-xl outline-none transition-colors text-[0.9rem]" />
                  </div>
                  <div className="w-full sm:w-1/2">
                    <label className="block text-[0.75rem] font-bold uppercase tracking-widest text-[#666666] mb-2">{currentT.form_phone}</label>
                    <input required type="tel" value={formData.phone} onChange={(e)=>setFormData({...formData, phone: e.target.value})} className="w-full bg-[#000000] border border-[#333333] text-white px-4 py-3.5 rounded-xl outline-none transition-colors text-[0.9rem]" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[0.7rem] font-bold uppercase tracking-widest text-[#666666] mb-2">{currentT.form_email}</label>
                  <input required type="email" value={formData.email} onChange={(e)=>setFormData({...formData, email: e.target.value})} className="w-full bg-[#000000] border border-[#333333] text-white px-4 py-3.5 rounded-xl outline-none transition-colors text-[0.9rem]" />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-1/2">
                    <label className="block text-[0.75rem] font-bold uppercase tracking-widest text-[#666666] mb-2">{currentT.form_city}</label>
                    <input required type="text" value={formData.city} onChange={(e)=>setFormData({...formData, city: e.target.value})} className="w-full bg-[#000000] border border-[#333333] text-white px-4 py-3.5 rounded-xl outline-none transition-colors text-[0.9rem]" />
                  </div>
                  <div className="w-full sm:w-1/2">
                    <label className="block text-[0.75rem] font-bold uppercase tracking-widest text-[#666666] mb-2">{currentT.form_role}</label>
                    <select value={formData.role} onChange={(e)=>setFormData({...formData, role: e.target.value, vehicle: ''})} className="w-full bg-[#000000] border border-[#333333] text-white px-4 py-3.5 rounded-xl outline-none transition-colors cursor-pointer text-[0.9rem] appearance-none">
                      <option value="Customer / Buyer">Customer / Buyer</option>
                      <option value="Independent Courier">Independent Courier</option>
                      <option value="Enterprise Fleet Owner">Enterprise Fleet Owner</option>
                      <option value="Restaurant / Cloud Kitchen">Restaurant / Cloud Kitchen</option>
                      <option value="FMCG Vendor">FMCG Vendor</option>
                      <option value="Q-Commerce Partner">Q-Commerce Partner</option>
                      <option value="3PL Logistics Partner">3PL Logistics Partner</option>
                    </select>
                  </div>
                </div>

                {/* Conditional Business Name for non-consumer roles */}
                {!isConsumer && (
                  <div className="animate-fade">
                    <label className="block text-[0.75rem] font-bold uppercase tracking-widest text-white mb-2">{currentT.form_business}</label>
                    <input required type="text" value={businessData.businessName} onChange={(e)=>setBusinessData({...businessData, businessName: e.target.value})} className="w-full bg-[#111111] border border-white text-white px-4 py-3.5 rounded-xl outline-none transition-colors text-[0.9rem]" />
                  </div>
                )}

                {/* Conditional Vehicle Input for Fleet and Driver roles strictly */}
                {isDriver && (
                  <div className="animate-fade">
                    <label className="block text-[0.75rem] font-bold uppercase tracking-widest text-white mb-2">{currentT.form_vehicle}</label>
                    <select required value={formData.vehicle} onChange={(e)=>setFormData({...formData, vehicle: e.target.value})} className="w-full bg-[#111111] border border-white text-white px-4 py-3.5 rounded-xl outline-none transition-colors cursor-pointer text-[0.9rem] appearance-none">
                      <option value="" disabled>Select Vehicle</option>
                      <option value="Two Wheeler (Bike/Scooter)">Two Wheeler (Bike/Scooter)</option>
                      <option value="Three Wheeler (Auto)">Three Wheeler (Auto)</option>
                      <option value="Light Commercial (Tata Ace/Chota Hathi)">Light Commercial (Tata Ace)</option>
                      <option value="Heavy Truck">Heavy Truck</option>
                      <option value="EV / Cycle">EV / Bicycle</option>
                    </select>
                  </div>
                )}

                <button disabled={status === 'SUBMITTING'} type="submit" className="w-full bg-white text-black font-black text-[1.1rem] tracking-tight py-4 rounded-xl mt-4 hover:bg-[#e0e0e0] transition-colors disabled:opacity-50 outline-none">
                  {status === 'SUBMITTING' ? 'PROCESSING...' : isConsumer ? currentT.form_submit : currentT.form_kyc_btn}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER ALIGNMENT */}
      <footer className="w-full max-w-[1400px] mx-auto mt-auto flex flex-col md:flex-row items-center justify-between gap-8 px-8 md:px-16 py-8 border-t border-[#111111] opacity-0 animate-fade stagger-3 relative z-10">
        
        {/* Custom SVG Social Icons */}
        <div className="flex items-center gap-8 text-[#555555]">
          <a href="https://www.linkedin.com/company/getmovyra/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors outline-none"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
          <a href="#youtube" className="hover:text-white transition-colors outline-none"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg></a>
          <a href="https://www.instagram.com/getmovyra" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors outline-none"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>
          <a href="#x" className="hover:text-white transition-colors outline-none"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.006 4.15H5.078z"/></svg></a>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-6 text-[0.8rem] font-bold text-[#555555]">
          <div className="flex items-center gap-6">
            <button onClick={() => setShowProductsPrompt(true)} className="hover:text-white transition-colors outline-none">{currentT.products}</button>
            <span className="w-1 h-1 bg-[#333333] rounded-full"></span>
            <Link to="/careers" className="hover:text-white transition-colors outline-none">{currentT.careers}</Link>
            <span className="w-1 h-1 bg-[#333333] rounded-full"></span>
            <div className="flex items-center gap-2 hover:text-white transition-colors cursor-default">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {localCity}, IN
            </div>
          </div>
          <span className="hidden md:block w-1 h-1 bg-[#333333] rounded-full"></span>
          
          <div className="flex items-center gap-2 text-[0.75rem] uppercase tracking-wider text-[#666666]">
              Built by 
              <a href="https://rebrand.ly/aatns" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition-opacity outline-none">
                  <img src="/aat.png" alt="AnyAstro" className="h-4 w-auto object-contain" onError={(e) => { e.target.style.display = 'none'; e.target.insertAdjacentHTML('afterend', '<span class="underline text-[#aaaaaa]">AnyAstro</span>'); }} />
              </a>
          </div>

          <button onClick={scrollToTop} className="p-2 rounded-full border border-[#333333] hover:bg-[#222222] transition-colors outline-none">
              <ArrowUp size={16} />
          </button>
        </div>
      </footer>
    </div>
  );
}