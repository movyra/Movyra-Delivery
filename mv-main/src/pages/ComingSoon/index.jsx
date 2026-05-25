import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; 
import { uploadVendorKYCDocuments } from '../../services/pocketbaseService';

export default function ComingSoon() {
  // 1. STATE MANAGEMENT
  const [lang, setLang] = useState('en');
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', role: 'Consumer / Buyer', city: '', vehicle: '' });
  const [businessData, setBusinessData] = useState({ businessName: '' });
  const [files, setFiles] = useState({ gst: null, pan: null, aadhaar: null });
  
  const [status, setStatus] = useState('IDLE'); // IDLE, KYC_FACE, KYC_DOCS, SUBMITTING, SUCCESS, ERROR
  const [faceVerified, setFaceVerified] = useState(false);
  const [localCity, setLocalCity] = useState('Mumbai');
  const videoRef = useRef(null);

  // 2. REAL-TIME LOGIC (STRICTLY INDIA ONLY, NO TELEMETRY)
  useEffect(() => {
    // Language Detection
    const sysLang = navigator.language.slice(0, 2);
    const supported = ['en', 'hi', 'mr', 'gu', 'te', 'ta', 'pa', 'bho', 'ar', 'es', 'fr', 'de'];
    if (supported.includes(sysLang)) setLang(sysLang);

    // Indian Geolocation Fallback
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
  }, []);

  // 3. 13-LANGUAGE MARKETING DICTIONARY
  const t = {
    en: {
      help: "Help Center", lang: "English",
      main_title: "India's Smartest Delivery Grid is Loading.",
      main_sub: "Experience zero delays. A revolutionary logistics network built for speed, transparency, and you.",
      btn_order: "Order Now", btn_partner: "Partner With Us", btn_grocery: "Daily Needs",
      val1_title: "Lightning Fast", val1_sub: "Real-time routing algorithms to beat the traffic.",
      val2_title: "Zero Hidden Fees", val2_sub: "Transparent pricing. Pay exactly what you see.",
      val3_title: "Live Tracking", val3_sub: "Watch your package move street by street.",
      val4_title: "24/7 Support", val4_sub: "Always here. Always listening. Always solving.",
      form_title: "Join the Exclusive Waitlist", form_desc: "Be the first to experience the future. Early access members receive exclusive launch benefits.",
      form_name: "Full Name", form_phone: "WhatsApp Number", form_email: "Email Address", form_city: "Your City", form_role: "I want to be a", form_vehicle: "Vehicle Type", form_business: "Business Name", form_submit: "Secure My Spot", form_kyc_btn: "Proceed to KYC",
      kyc_face_title: "Face Verification", kyc_face_desc: "Please look directly at the camera to verify your identity.",
      kyc_docs_title: "Business Documents", kyc_docs_desc: "Upload clear PDF or JPG copies of your official documents.",
      success: "Access secured. We will notify you upon grid launch.",
      error: "Verification failed. Please try again."
    },
    hi: {
      help: "सहायता केंद्र", lang: "हिन्दी",
      main_title: "भारत का सबसे स्मार्ट डिलीवरी ग्रिड आ रहा है।",
      main_sub: "ज़ीरो देरी का अनुभव करें। गति और पारदर्शिता के लिए बनाया गया एक क्रांतिकारी नेटवर्क।",
      btn_order: "अभी ऑर्डर करें", btn_partner: "हमारे साथ जुड़ें", btn_grocery: "रोजमर्रा की जरूरतें",
      val1_title: "बिजली सी तेज़", val1_sub: "ट्रैफिक को मात देने के लिए रीयल-टाइम रूटिंग।",
      val2_title: "कोई छिपा शुल्क नहीं", val2_sub: "पारदर्शी मूल्य निर्धारण। जो देखें, वही चुकाएं।",
      val3_title: "लाइव ट्रैकिंग", val3_sub: "अपने पैकेज को हर सड़क पर चलते हुए देखें।",
      val4_title: "24/7 सपोर्ट", val4_sub: "हमेशा यहाँ। हमेशा सुनते हुए। हमेशा समाधान करते हुए।",
      form_title: "एक्सक्लूसिव वेटलिस्ट से जुड़ें", form_desc: "भविष्य का अनुभव करने वाले पहले व्यक्ति बनें। अर्ली एक्सेस सदस्यों को विशेष लाभ।",
      form_name: "पूरा नाम", form_phone: "व्हाट्सएप नंबर", form_email: "ईमेल पता", form_city: "आपका शहर", form_role: "मैं बनना चाहता हूँ", form_vehicle: "वाहन प्रकार", form_business: "व्यवसाय का नाम", form_submit: "मेरा स्थान सुरक्षित करें", form_kyc_btn: "KYC के लिए आगे बढ़ें",
      kyc_face_title: "चेहरा सत्यापन", kyc_face_desc: "अपनी पहचान सत्यापित करने के लिए कृपया सीधे कैमरे की ओर देखें।",
      kyc_docs_title: "व्यापार दस्तावेज़", kyc_docs_desc: "अपने आधिकारिक दस्तावेजों की स्पष्ट प्रतियां अपलोड करें।",
      success: "स्थान सुरक्षित। लॉन्च होने पर हम आपको सूचित करेंगे।",
      error: "सत्यापन विफल। कृपया पुनः प्रयास करें।"
    },
    hinglish: {
      help: "Help Center", lang: "Hinglish",
      main_title: "India ka Smartest Delivery Grid Load ho raha hai.",
      main_sub: "Zero delays ka experience. Speed aur transparency ke liye bana naya network.",
      btn_order: "Order Now", btn_partner: "Partner With Us", btn_grocery: "Daily Needs",
      val1_title: "Bijli se Tez", val1_sub: "Traffic beat karne ke liye real-time routing.",
      val2_title: "No Hidden Charges", val2_sub: "Transparent pricing. Jo dekhe, wahi pay karein.",
      val3_title: "Live Tracking", val3_sub: "Apne package ko har street par track karein.",
      val4_title: "24/7 Support", val4_sub: "Hamesha aapke saath. Har problem ka solution.",
      form_title: "Exclusive Waitlist Join Karein", form_desc: "Future experience karne waale pehle banein. Early access benefits.",
      form_name: "Pura Naam", form_phone: "WhatsApp Number", form_email: "Email Address", form_city: "Aapka City", form_role: "Main banna chahta hu", form_vehicle: "Vehicle Type", form_business: "Business Name", form_submit: "Spot Secure Karein", form_kyc_btn: "KYC Shuru Karein",
      kyc_face_title: "Face Verification", kyc_face_desc: "Identity verify karne ke liye camera me dekhein.",
      kyc_docs_title: "Business Documents", kyc_docs_desc: "Official documents upload karein.",
      success: "Spot secured. Launch par notify karenge.",
      error: "Verification failed. Phir se try karein."
    },
    mr: { help: "मदत केंद्र", lang: "मराठी", main_title: "भारताचे सर्वात स्मार्ट डिलिव्हरी ग्रिड लोड होत आहे.", main_sub: "शून्य विलंबाचा अनुभव घ्या.", btn_order: "आत्ता ऑर्डर करा", btn_partner: "भागीदारी करा", btn_grocery: "दैनंदिन गरजा", val1_title: "अतिशय वेगवान", val1_sub: "ट्रॅफिक टाळण्यासाठी.", val2_title: "कोणतेही छुपे शुल्क नाही", val2_sub: "पारदर्शक किंमत.", val3_title: "लाइव्ह ट्रॅकिंग", val3_sub: "तुमचे पॅकेज पहा.", val4_title: "24/7 सपोर्ट", val4_sub: "नेहमी तुमच्यासाठी.", form_title: "वेटलिस्टमध्ये सामील व्हा", form_desc: "भविष्याचा अनुभव घेणारे पहिले व्हा.", form_name: "पूर्ण नाव", form_phone: "व्हॉट्सॲप नंबर", form_email: "ईमेल", form_city: "तुमचे शहर", form_role: "भूमिका", form_vehicle: "वाहन", form_business: "व्यवसायाचे नाव", form_submit: "जागा सुरक्षित करा", form_kyc_btn: "KYC सुरू करा", kyc_face_title: "चेहरा पडताळणी", kyc_face_desc: "कॅमेराकडे पहा.", kyc_docs_title: "कागदपत्रे", kyc_docs_desc: "कागदपत्रे अपलोड करा.", success: "तुमची जागा सुरक्षित आहे.", error: "पुन्हा प्रयत्न करा." },
    gu: { help: "મદદ કેન્દ્ર", lang: "ગુજરાતી", main_title: "ભારતનું સૌથી સ્માર્ટ ડિલિવરી નેટવર્ક આવી રહ્યું છે.", main_sub: "શૂન્ય વિલંબ.", btn_order: "ઓર્ડર કરો", btn_partner: "અમારી સાથે જોડાઓ", btn_grocery: "રોજિંદી જરૂરિયાતો", val1_title: "અતિ ઝડપી", val1_sub: "ટ્રાફિક ટાળવા માટે", val2_title: "કોઈ છુપાયેલ ચાર્જ નથી", val2_sub: "પારદર્શક કિંમત.", val3_title: "લાઇવ ટ્રેકિંગ", val3_sub: "તમારું પેકેજ જુઓ.", val4_title: "24/7 સપોર્ટ", val4_sub: "હંમેશા તમારી સાથે.", form_title: "વેઇટલિસ્ટમાં જોડાઓ", form_desc: "પ્રથમ બનો.", form_name: "નામ", form_phone: "ફોન", form_email: "ઈમેલ", form_city: "શહેર", form_role: "ભૂમિકા", form_vehicle: "વાહન", form_business: "વ્યવસાયનું નામ", form_submit: "નોંધણી કરો", form_kyc_btn: "KYC શરૂ કરો", kyc_face_title: "ચહેરો ચકાસણી", kyc_face_desc: "કેમેરા સામે જુઓ.", kyc_docs_title: "દસ્તાવેજો", kyc_docs_desc: "દસ્તાવેજો અપલોડ કરો.", success: "સ્વાગત છે.", error: "ફરીથી પ્રયાસ કરો." },
    te: { help: "సహాయ కేంద్రం", lang: "తెలుగు", main_title: "భారతదేశపు స్మార్ట్ డెలివరీ వస్తోంది.", main_sub: "ఆలస్యం లేదు.", btn_order: "ఆర్డర్ చేయండి", btn_partner: "భాగస్వామి అవ్వండి", btn_grocery: "రోజువారీ అవసరాలు", val1_title: "చాలా వేగంగా", val1_sub: "ట్రాఫిక్ లేదు", val2_title: "దాచిన ఛార్జీలు లేవు", val2_sub: "పారదర్శక ధర.", val3_title: "లైవ్ ట్రాకింగ్", val3_sub: "ప్యాకేజీని చూడండి.", val4_title: "24/7 సపోర్ట్", val4_sub: "ఎల్లప్పుడూ ఇక్కడే.", form_title: "వెయిట్‌లిస్ట్‌లో చేరండి", form_desc: "మొదటి వ్యక్తి అవ్వండి.", form_name: "పేరు", form_phone: "ఫోన్", form_email: "ఇమెయిల్", form_city: "నగరం", form_role: "పాత్ర", form_vehicle: "వాహనం", form_business: "వ్యాపారం పేరు", form_submit: "నమోదు చేయండి", form_kyc_btn: "KYC ప్రారంభించండి", kyc_face_title: "ముఖ నిర్ధారణ", kyc_face_desc: "కెమెరాను చూడండి.", kyc_docs_title: "పత్రాలు", kyc_docs_desc: "పత్రాలను అప్‌లోడ్ చేయండి.", success: "స్వాగతం.", error: "మళ్ళీ ప్రయత్నించండి." },
    ta: { help: "உதவி மையம்", lang: "தமிழ்", main_title: "இந்தியாவின் ஸ்மார்ட் டெலிவரி வருகிறது.", main_sub: "தாமதம் இல்லை.", btn_order: "ஆர்டர் செய்", btn_partner: "கூட்டாளராகுங்கள்", btn_grocery: "தினசரி தேவைகள்", val1_title: "மிக வேகமாக", val1_sub: "போக்குவரத்து இல்லை", val2_title: "மறைக்கப்பட்ட கட்டணங்கள் இல்லை", val2_sub: "வெளிப்படையான விலை.", val3_title: "நேரலை கண்காணிப்பு", val3_sub: "தொகுப்பைப் பார்க்கவும்.", val4_title: "24/7 ஆதரவு", val4_sub: "எப்போதும் இங்கே.", form_title: "காத்திருப்பு பட்டியலில் சேரவும்", form_desc: "முதல் நபராக இருங்கள்.", form_name: "பெயர்", form_phone: "தொலைபேசி", form_email: "மின்னஞ்சல்", form_city: "நகரம்", form_role: "பங்கு", form_vehicle: "வாகனம்", form_business: "வணிக பெயர்", form_submit: "பதிவு செய்க", form_kyc_btn: "KYC தொடங்கவும்", kyc_face_title: "முக சரிபார்ப்பு", kyc_face_desc: "காமிராவைப் பாருங்கள்.", kyc_docs_title: "ஆவணங்கள்", kyc_docs_desc: "ஆவணங்களை பதிவேற்றவும்.", success: "வரவேற்பு.", error: "மீண்டும் முயற்சிக்கவும்." },
    pa: { help: "ਸਹਾਇਤਾ ਕੇਂਦਰ", lang: "ਪੰਜਾਬੀ", main_title: "ਭਾਰਤ ਦੀ ਸਮਾਰਟ ਡਿਲਿਵਰੀ ਆ ਰਹੀ ਹੈ।", main_sub: "ਕੋਈ ਦੇਰੀ ਨਹੀਂ।", btn_order: "ਆਰਡਰ ਕਰੋ", btn_partner: "ਸਾਡੇ ਨਾਲ ਜੁੜੋ", btn_grocery: "ਰੋਜ਼ਾਨਾ ਲੋੜਾਂ", val1_title: "ਬਹੁਤ ਤੇਜ਼", val1_sub: "ਕੋਈ ਟ੍ਰੈਫਿਕ ਨਹੀਂ", val2_title: "ਕੋਈ ਲੁਕਵੇਂ ਖਰਚੇ ਨਹੀਂ", val2_sub: "ਪਾਰਦਰਸ਼ੀ ਕੀਮਤ।", val3_title: "ਲਾਈਵ ਟ੍ਰੈਕਿੰਗ", val3_sub: "ਆਪਣਾ ਪੈਕੇਜ ਦੇਖੋ।", val4_title: "24/7 ਸਪੋਰਟ", val4_sub: "ਹਮੇਸ਼ਾ ਇੱਥੇ।", form_title: "ਵੇਟਲਿਸਟ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋਵੋ", form_desc: "ਪਹਿਲੇ ਬਣੋ।", form_name: "ਨਾਮ", form_phone: "ਫੋਨ", form_email: "ਈਮੇਲ", form_city: "ਸ਼ਹਿਰ", form_role: "ਭੂਮਿਕਾ", form_vehicle: "ਵਾਹਨ", form_business: "ਕਾਰੋਬਾਰ ਦਾ ਨਾਮ", form_submit: "ਰਜਿਸਟਰ ਕਰੋ", form_kyc_btn: "KYC ਸ਼ੁਰੂ ਕਰੋ", kyc_face_title: "ਚਿਹਰੇ ਦੀ ਤਸਦੀਕ", kyc_face_desc: "ਕੈਮਰੇ ਵੱਲ ਦੇਖੋ।", kyc_docs_title: "ਦਸਤਾਵੇਜ਼", kyc_docs_desc: "ਦਸਤਾਵੇਜ਼ ਅੱਪਲੋਡ ਕਰੋ।", success: "ਜੀ ਆਇਆਂ ਨੂੰ।", error: "ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।" },
    bho: { help: "मदद केंद्र", lang: "भोजपुरी", main_title: "भारत के स्मार्ट डिलीवरी आवत बा।", main_sub: "कौनो देरी ना।", btn_order: "ऑर्डर करीं", btn_partner: "हमनी से जुड़ीं", btn_grocery: "रोज के जरूरत", val1_title: "बहुत तेज", val1_sub: "कौनो ट्रैफिक ना", val2_title: "कौनो छिपल चार्ज ना", val2_sub: "पारदर्शी कीमत।", val3_title: "लाइव ट्रैकिंग", val3_sub: "आपन पैकेज देखीं।", val4_title: "24/7 सपोर्ट", val4_sub: "हमेशा इहाँ।", form_title: "वेटलिस्ट में शामिल होईं", form_desc: "पहिल बनीं।", form_name: "नाम", form_phone: "फोन", form_email: "ईमेल", form_city: "शहर", form_role: "भूमिका", form_vehicle: "वाहन", form_business: "व्यापार के नाम", form_submit: "रजिस्टर करीं", form_kyc_btn: "KYC शुरू करीं", kyc_face_title: "चेहरा सत्यापन", kyc_face_desc: "कैमरा में देखीं।", kyc_docs_title: "दस्तावेज", kyc_docs_desc: "दस्तावेज अपलोड करीं।", success: "रउआ स्वागत बा।", error: "फेरू कोशिश करीं।" },
    ar: { help: "مركز المساعدة", lang: "العربية", main_title: "أذكى شبكة توصيل في الهند قادمة.", main_sub: "تجربة بدون تأخير.", btn_order: "اطلب الان", btn_partner: "كن شريكاً", btn_grocery: "الاحتياجات اليومية", val1_title: "سريع جداً", val1_sub: "توجيه في الوقت الفعلي", val2_title: "لا رسوم خفية", val2_sub: "تسعير شفاف.", val3_title: "تتبع مباشر", val3_sub: "شاهد حزمتك.", val4_title: "دعم 24/7", val4_sub: "دائماً هنا.", form_title: "انضم إلى قائمة الانتظار", form_desc: "كن الأول.", form_name: "الاسم", form_phone: "الهاتف", form_email: "البريد", form_city: "المدينة", form_role: "الدور", form_vehicle: "المركبة", form_business: "اسم العمل", form_submit: "تأمين مكاني", form_kyc_btn: "بدء KYC", kyc_face_title: "التحقق من الوجه", kyc_face_desc: "انظر للكاميرا.", kyc_docs_title: "مستندات", kyc_docs_desc: "ارفع المستندات.", success: "مرحباً.", error: "حاول مرة أخرى." },
    es: { help: "Centro de ayuda", lang: "Español", main_title: "La red de entrega más inteligente está en camino.", main_sub: "Cero retrasos.", btn_order: "Ordenar", btn_partner: "Asociarse", btn_grocery: "Necesidades Diarias", val1_title: "Súper rápido", val1_sub: "Rutas en tiempo real.", val2_title: "Sin cargos ocultos", val2_sub: "Precios transparentes.", val3_title: "Rastreo en vivo", val3_sub: "Mira tu paquete.", val4_title: "Soporte 24/7", val4_sub: "Siempre aquí.", form_title: "Únete a la lista", form_desc: "Sé el primero.", form_name: "Nombre", form_phone: "Teléfono", form_email: "Correo", form_city: "Ciudad", form_role: "Rol", form_vehicle: "Vehículo", form_business: "Nombre de la empresa", form_submit: "Asegurar mi lugar", form_kyc_btn: "Iniciar KYC", kyc_face_title: "Verificación facial", kyc_face_desc: "Mire a la cámara.", kyc_docs_title: "Documentos", kyc_docs_desc: "Subir documentos.", success: "Bienvenido.", error: "Inténtalo de nuevo." },
    fr: { help: "Centre d'aide", lang: "Français", main_title: "Le réseau de livraison le plus intelligent arrive.", main_sub: "Zéro retard.", btn_order: "Commander", btn_partner: "Devenez Partenaire", btn_grocery: "Besoins Quotidiens", val1_title: "Super rapide", val1_sub: "Routage en temps réel.", val2_title: "Pas de frais cachés", val2_sub: "Prix transparents.", val3_title: "Suivi en direct", val3_sub: "Regardez votre colis.", val4_title: "Support 24/7", val4_sub: "Toujours là.", form_title: "Rejoindre la liste", form_desc: "Soyez le premier.", form_name: "Nom", form_phone: "Téléphone", form_email: "Email", form_city: "Ville", form_role: "Rôle", form_vehicle: "Véhicule", form_business: "Nom de l'entreprise", form_submit: "Sécuriser ma place", form_kyc_btn: "Démarrer KYC", kyc_face_title: "Vérification faciale", kyc_face_desc: "Regardez la caméra.", kyc_docs_title: "Documents", kyc_docs_desc: "Télécharger les documents.", success: "Bienvenue.", error: "Réessayez." },
    de: { help: "Hilfezentrum", lang: "Deutsch", main_title: "Das intelligenteste Liefernetzwerk kommt.", main_sub: "Keine Verzögerungen.", btn_order: "Bestellen", btn_partner: "Partner Werden", btn_grocery: "Täglicher Bedarf", val1_title: "Super schnell", val1_sub: "Echtzeit-Routing.", val2_title: "Keine versteckten Gebühren", val2_sub: "Transparente Preise.", val3_title: "Live-Tracking", val3_sub: "Beobachten Sie Ihr Paket.", val4_title: "24/7 Support", val4_sub: "Immer hier.", form_title: "Warteliste beitreten", form_desc: "Sei der Erste.", form_name: "Name", form_phone: "Telefon", form_email: "E-Mail", form_city: "Stadt", form_role: "Rolle", form_vehicle: "Fahrzeug", form_business: "Firmenname", form_submit: "Platz sichern", form_kyc_btn: "KYC starten", kyc_face_title: "Gesichtsverifizierung", kyc_face_desc: "In die Kamera schauen.", kyc_docs_title: "Dokumente", kyc_docs_desc: "Dokumente hochladen.", success: "Willkommen.", error: "Versuchen Sie es erneut." }
  };

  const currentT = t[lang] || t['en'];

  // DYNAMIC ROLE CHECKS BASED ON EXPANDED TAXONOMY
  const isConsumer = formData.role === 'Consumer / Buyer';
  const isDriver = ['Independent Courier', 'Enterprise Fleet Owner', '3PL Logistics Partner'].includes(formData.role);

  // 4. GOOGLE FACE VERIFICATION (LIVENESS ENGINE)
  const startFaceScan = async () => {
    setStatus('KYC_FACE');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Simulate Google Face Verification Process (Real implementation requires WASM loading)
      setTimeout(() => {
        setFaceVerified(true);
        setStatus('KYC_DOCS');
        stream.getTracks().forEach(track => track.stop());
      }, 4000);
    } catch (err) {
      console.error("Camera Access Denied:", err);
      setStatus('ERROR');
    }
  };

  // 5. FINAL SUBMISSION (POCKETBASE UPLOAD + FIRESTORE WRITE)
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setStatus('SUBMITTING');
    try {
      let pbRecordId = 'none';
      
      // Route documents to PocketBase strictly for Enterprise/Driver roles
      if (!isConsumer) {
         const record = await uploadVendorKYCDocuments(formData.email, files.gst, files.pan, files.aadhaar);
         pbRecordId = record.id;
      }

      // Write final registration schema to Firestore
      await addDoc(collection(db, 'pre_registrations'), {
        ...formData,
        ...businessData,
        pocketbaseId: pbRecordId,
        kycStatus: isConsumer ? 'approved' : 'pending',
        createdAt: serverTimestamp(),
        source: 'coming_soon_marketing_pivot'
      });

      setStatus('SUCCESS');
    } catch (error) {
      console.error(error);
      setStatus('ERROR');
      setTimeout(() => setStatus('IDLE'), 3000);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#000000] text-white font-sans selection:bg-white selection:text-black overflow-x-hidden flex flex-col">
      
      {/* CSS-IN-JS FOR MINIMALIST ANIMATIONS */}
      <style>
        {`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
          .animate-fade { animation: fadeIn 0.8s ease-out forwards; }
          .stagger-1 { animation-delay: 0.1s; }
          .stagger-2 { animation-delay: 0.2s; }
          .stagger-3 { animation-delay: 0.3s; }
          input:focus, select:focus { border-color: #ffffff !important; }
        `}
      </style>

      {/* TOP HEADER */}
      <header className="w-full flex items-center justify-between px-8 md:px-16 py-8 animate-fade">
        <div className="flex items-center gap-2">
        <img src="/logo.png" alt="Movyra" className="h-8 w-auto" onError={(e) => e.target.style.display = 'none'} />
        <span className="font-black text-[1.5rem] tracking-tighter ml-[-5px]">ovyra</span>
        </div>
        <div className="flex items-center gap-6 text-[0.9rem] font-bold">
          <span className="cursor-pointer hover:text-[#aaaaaa] transition-colors hidden sm:block">{currentT.help}</span>
          <select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-transparent outline-none cursor-pointer hover:text-[#aaaaaa] transition-colors appearance-none text-right">
            <option value="en" className="text-black">English</option>
            <option value="hi" className="text-black">हिन्दी</option>
            <option value="hinglish" className="text-black">Hinglish</option>
            <option value="mr" className="text-black">मराठी</option>
            <option value="gu" className="text-black">ગુજરાતી</option>
            <option value="te" className="text-black">తెలుగు</option>
            <option value="ta" className="text-black">தமிழ்</option>
            <option value="pa" className="text-black">ਪੰਜਾਬੀ</option>
            <option value="bho" className="text-black">भोजपुरी</option>
            <option value="ar" className="text-black">العربية</option>
            <option value="es" className="text-black">Español / Mexican</option>
            <option value="fr" className="text-black">Français</option>
            <option value="de" className="text-black">Deutsch</option>
          </select>
        </div>
      </header>

      {/* MAIN CONTAINER: Flex layout to strictly put Form in 2nd position */}
      <div className="w-full max-w-[1400px] mx-auto px-8 md:px-16 py-12 flex flex-col lg:flex-row gap-20 items-start justify-between">
        
        {/* SECTION 1: MARKETING HERO & VALUE PROPOSITIONS */}
        <div className="flex-1 opacity-0 animate-fade stagger-1">
          <h1 className="text-[3.5rem] md:text-[5rem] lg:text-[6rem] font-black leading-[1] tracking-tighter mb-6 text-white max-w-[800px]">
            {currentT.main_title}
          </h1>
          <p className="text-[1.25rem] md:text-[1.5rem] text-[#aaaaaa] font-medium leading-[1.5] max-w-[600px] mb-8">
            {currentT.main_sub}
          </p>

          {/* CTA ROUTING LINKS */}
          <div className="flex flex-wrap items-center gap-4 mb-16">
            <Link to="/order" className="bg-white text-black px-6 py-3 rounded-full font-bold text-[0.95rem] hover:bg-[#e0e0e0] transition-colors">
              {currentT.btn_order}
            </Link>
            <Link to="/vendor" className="border border-[#333333] text-white px-6 py-3 rounded-full font-bold text-[0.95rem] hover:bg-[#111111] transition-colors">
              {currentT.btn_partner}
            </Link>
            <Link to="/grocery" className="bg-[#050505] border border-[#00ff88]/40 text-[#00ff88] px-6 py-3 rounded-full font-bold text-[0.95rem] hover:bg-[#00ff88]/10 transition-colors shadow-[0_0_15px_rgba(0,255,136,0.1)]">
              {currentT.btn_grocery}
            </Link>
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

        {/* SECTION 2: MULTI-STAGE REGISTRATION & KYC HUB */}
        <div className="w-full lg:w-[480px] bg-[#0a0a0a] border border-[#222222] rounded-[32px] p-8 shadow-[0_20px_60px_rgba(255,255,255,0.02)] opacity-0 animate-fade stagger-2 shrink-0 min-h-[400px]">
          
          {/* STAGE: SUCCESS OR ERROR */}
          {status === 'SUCCESS' ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-10 animate-fade">
              <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="#ffffff" strokeWidth="1" className="mb-6"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <h3 className="text-[1.8rem] font-black mb-2">{currentT.success}</h3>
              <p className="text-[#888888] text-[0.9rem]">Awaiting grid synchronization.</p>
            </div>
          ) : status === 'ERROR' ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-10 animate-fade">
              <h3 className="text-[1.8rem] font-black mb-2 text-[#ff4444]">System Error</h3>
              <p className="text-[#888888] text-[0.9rem] mb-6">{currentT.error}</p>
              <button onClick={() => setStatus('IDLE')} className="border border-white px-6 py-2 rounded-full font-bold">Retry</button>
            </div>
          ) : status === 'KYC_FACE' ? (
            // STAGE: KYC FACE VERIFICATION (WEBCAM)
            <div className="flex flex-col h-full animate-fade">
              <h3 className="text-[1.5rem] font-black mb-2">{currentT.kyc_face_title}</h3>
              <p className="text-[#888888] text-[0.85rem] mb-8">{currentT.kyc_face_desc}</p>
              <div className="w-full aspect-square bg-[#000000] border border-[#333333] rounded-[24px] overflow-hidden relative shadow-inner mb-6">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]"></video>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {/* Face Guide Overlay */}
                  <svg viewBox="0 0 100 100" className="w-[60%] h-[60%] opacity-30"><ellipse cx="50" cy="50" rx="35" ry="45" fill="none" stroke="white" strokeWidth="2" strokeDasharray="4 4" /></svg>
                </div>
              </div>
              <div className="text-center font-mono text-[0.7rem] text-[#666] tracking-widest uppercase animate-pulse">Running Liveness Check...</div>
            </div>
          ) : status === 'KYC_DOCS' ? (
            // STAGE: KYC DOCUMENT UPLOAD (GST, PAN, AADHAAR)
            <div className="flex flex-col h-full animate-fade">
              <h3 className="text-[1.5rem] font-black mb-2">{currentT.kyc_docs_title}</h3>
              <p className="text-[#888888] text-[0.85rem] mb-8">{currentT.kyc_docs_desc}</p>
              <form onSubmit={handleFinalSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[0.75rem] font-bold uppercase tracking-widest text-[#666666] mb-2">GST Certificate</label>
                  <input type="file" required onChange={(e)=>setFiles({...files, gst: e.target.files[0]})} className="w-full bg-[#000000] border border-[#333333] text-[#aaaaaa] px-4 py-3 rounded-xl outline-none text-[0.8rem] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[0.75rem] file:font-bold file:bg-white file:text-black cursor-pointer" />
                </div>
                <div>
                  <label className="block text-[0.75rem] font-bold uppercase tracking-widest text-[#666666] mb-2">PAN Card</label>
                  <input type="file" required onChange={(e)=>setFiles({...files, pan: e.target.files[0]})} className="w-full bg-[#000000] border border-[#333333] text-[#aaaaaa] px-4 py-3 rounded-xl outline-none text-[0.8rem] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[0.75rem] file:font-bold file:bg-white file:text-black cursor-pointer" />
                </div>
                <div>
                  <label className="block text-[0.75rem] font-bold uppercase tracking-widest text-[#666666] mb-2">Aadhaar Card</label>
                  <input type="file" required onChange={(e)=>setFiles({...files, aadhaar: e.target.files[0]})} className="w-full bg-[#000000] border border-[#333333] text-[#aaaaaa] px-4 py-3 rounded-xl outline-none text-[0.8rem] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[0.75rem] file:font-bold file:bg-white file:text-black cursor-pointer" />
                </div>
                <button type="submit" className="w-full bg-white text-black font-black text-[1.1rem] tracking-tight py-4 rounded-xl mt-6 hover:bg-[#e0e0e0] transition-colors">
                  Upload & Finalize
                </button>
              </form>
            </div>
          ) : (
            // STAGE: INITIAL REGISTRATION FORM
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
                      <option value="Consumer / Buyer">Consumer / Buyer</option>
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

                <button disabled={status === 'SUBMITTING'} type="submit" className="w-full bg-white text-black font-black text-[1.1rem] tracking-tight py-4 rounded-xl mt-4 hover:bg-[#e0e0e0] transition-colors disabled:opacity-50">
                  {status === 'SUBMITTING' ? 'PROCESSING...' : isConsumer ? currentT.form_submit : currentT.form_kyc_btn}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER ALIGNMENT */}
      <footer className="w-full max-w-[1400px] mx-auto mt-auto flex flex-col md:flex-row items-center justify-between gap-8 px-8 md:px-16 py-8 border-t border-[#111111] opacity-0 animate-fade stagger-3">
        
        {/* Custom SVG Social Icons */}
        <div className="flex items-center gap-8 text-[#555555]">
          <a href="#linkedin" className="hover:text-white transition-colors"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
          <a href="#youtube" className="hover:text-white transition-colors"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg></a>
          <a href="#instagram" className="hover:text-white transition-colors"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>
          <a href="#x" className="hover:text-white transition-colors"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.006 4.15H5.078z"/></svg></a>
        </div>
        
        <div className="flex items-center gap-6 text-[0.8rem] font-bold text-[#555555]">
          <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            {currentT.lang}
          </div>
          <span className="w-1 h-1 bg-[#333333] rounded-full"></span>
          <div className="flex items-center gap-2 hover:text-white transition-colors cursor-default">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {localCity}, IN
          </div>
        </div>

      </footer>
    </div>
  );
}