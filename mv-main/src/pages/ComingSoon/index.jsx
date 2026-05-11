import React, { useState, useEffect } from 'react';
// IMPORTANT: Uncomment and point to your actual Firebase config file when ready
// import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
// import { db } from '../../firebaseConfig'; 

export default function ComingSoon() {
  // 1. STATE MANAGEMENT
  const [lang, setLang] = useState('en');
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', role: 'Buyer', city: '', vehicle: '' });
  const [status, setStatus] = useState('IDLE'); // IDLE, SUBMITTING, SUCCESS, ERROR
  const [localCity, setLocalCity] = useState('Mumbai');

  // 2. REAL-TIME LOGIC (STRICTLY NO TELEMETRY, INDIA LOCATION ONLY)
  useEffect(() => {
    // Automatic System Language Detection (Expanded to 13+ languages)
    const sysLang = navigator.language.slice(0, 2);
    const supportedLangs = ['en', 'hi', 'mr', 'gu', 'te', 'ta', 'pa', 'bho', 'ar', 'es', 'fr', 'de'];
    if (supportedLangs.includes(sysLang)) setLang(sysLang);

    // Indian Geolocation Mapping (Strictly India)
    const indianCities = ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad'];
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz === 'Asia/Kolkata') {
        const day = new Date().getDay();
        setLocalCity(indianCities[day % indianCities.length]);
      } else {
        setLocalCity('Mumbai'); // Strict fallback to India
      }
    } catch (e) {
      setLocalCity('Bengaluru');
    }
  }, []);

  // 3. 13-LANGUAGE MARKETING DICTIONARY (Aggressive Value Propositions)
  const t = {
    en: {
      help: "Help Center", lang: "English",
      main_title: "India's Smartest Delivery Grid is Loading.",
      main_sub: "Experience zero delays. A revolutionary logistics network built for speed, transparency, and you.",
      val1_title: "Lightning Fast", val1_sub: "Real-time routing algorithms to beat the traffic.",
      val2_title: "Zero Hidden Fees", val2_sub: "Transparent pricing. Pay exactly what you see.",
      val3_title: "Live Tracking", val3_sub: "Watch your package move street by street.",
      val4_title: "24/7 Support", val4_sub: "Always here. Always listening. Always solving.",
      form_title: "Join the Exclusive Waitlist", form_desc: "Be the first to experience the future. Early access members receive exclusive launch benefits.",
      form_name: "Full Name", form_phone: "WhatsApp Number", form_email: "Email Address", form_city: "Your City", form_role: "I want to be a", form_vehicle: "Vehicle Type (If Driver)", form_submit: "Secure My Spot", success: "Access secured. We will notify you upon grid launch."
    },
    hi: {
      help: "सहायता केंद्र", lang: "हिन्दी",
      main_title: "भारत का सबसे स्मार्ट डिलीवरी ग्रिड आ रहा है।",
      main_sub: "ज़ीरो देरी का अनुभव करें। गति और पारदर्शिता के लिए बनाया गया एक क्रांतिकारी नेटवर्क।",
      val1_title: "बिजली सी तेज़", val1_sub: "ट्रैफिक को मात देने के लिए रीयल-टाइम रूटिंग।",
      val2_title: "कोई छिपा शुल्क नहीं", val2_sub: "पारदर्शी मूल्य निर्धारण। जो देखें, वही चुकाएं।",
      val3_title: "लाइव ट्रैकिंग", val3_sub: "अपने पैकेज को हर सड़क पर चलते हुए देखें।",
      val4_title: "24/7 सपोर्ट", val4_sub: "हमेशा यहाँ। हमेशा सुनते हुए। हमेशा समाधान करते हुए।",
      form_title: "एक्सक्लूसिव वेटलिस्ट से जुड़ें", form_desc: "भविष्य का अनुभव करने वाले पहले व्यक्ति बनें। अर्ली एक्सेस सदस्यों को विशेष लाभ।",
      form_name: "पूरा नाम", form_phone: "व्हाट्सएप नंबर", form_email: "ईमेल पता", form_city: "आपका शहर", form_role: "मैं बनना चाहता हूँ", form_vehicle: "वाहन प्रकार", form_submit: "मेरा स्थान सुरक्षित करें", success: "स्थान सुरक्षित। लॉन्च होने पर हम आपको सूचित करेंगे।"
    },
    hinglish: {
      help: "Help Center", lang: "Hinglish",
      main_title: "India ka Smartest Delivery Grid Load ho raha hai.",
      main_sub: "Zero delays ka experience. Speed aur transparency ke liye bana naya network.",
      val1_title: "Bijli se Tez", val1_sub: "Traffic beat karne ke liye real-time routing.",
      val2_title: "No Hidden Charges", val2_sub: "Transparent pricing. Jo dekhe, wahi pay karein.",
      val3_title: "Live Tracking", val3_sub: "Apne package ko har street par track karein.",
      val4_title: "24/7 Support", val4_sub: "Hamesha aapke saath. Har problem ka solution.",
      form_title: "Exclusive Waitlist Join Karein", form_desc: "Future experience karne waale pehle banein. Early access benefits.",
      form_name: "Pura Naam", form_phone: "WhatsApp Number", form_email: "Email Address", form_city: "Aapka City", form_role: "Main banna chahta hu", form_vehicle: "Vehicle Type", form_submit: "Spot Secure Karein", success: "Spot secured. Launch par notify karenge."
    },
    mr: {
      help: "मदत केंद्र", lang: "मराठी",
      main_title: "भारताचे सर्वात स्मार्ट डिलिव्हरी ग्रिड लोड होत आहे.",
      main_sub: "शून्य विलंबाचा अनुभव घ्या. वेगासाठी तयार केलेले नेटवर्क.",
      val1_title: "अतिशय वेगवान", val1_sub: "ट्रॅफिक टाळण्यासाठी रिअल-टाइम राउटिंग.",
      val2_title: "कोणतेही छुपे शुल्क नाही", val2_sub: "पारदर्शक किंमत. जे पाहता तेच भरा.",
      val3_title: "लाइव्ह ट्रॅकिंग", val3_sub: "तुमचे पॅकेज रस्त्यावर जाताना पहा.",
      val4_title: "24/7 सपोर्ट", val4_sub: "नेहमी तुमच्यासाठी.",
      form_title: "वेटलिस्टमध्ये सामील व्हा", form_desc: "भविष्याचा अनुभव घेणारे पहिले व्हा.",
      form_name: "पूर्ण नाव", form_phone: "व्हॉट्सॲप नंबर", form_email: "ईमेल", form_city: "तुमचे शहर", form_role: "भूमिका", form_vehicle: "वाहन", form_submit: "माझी जागा सुरक्षित करा", success: "तुमची जागा सुरक्षित आहे."
    },
    gu: { help: "મદદ કેન્દ્ર", lang: "ગુજરાતી", main_title: "ભારતનું સૌથી સ્માર્ટ ડિલિવરી નેટવર્ક આવી રહ્યું છે.", main_sub: "શૂન્ય વિલંબ.", val1_title: "અતિ ઝડપી", val1_sub: "ટ્રાફિક ટાળવા માટે", val2_title: "કોઈ છુપાયેલ ચાર્જ નથી", val2_sub: "પારદર્શક કિંમત.", val3_title: "લાઇવ ટ્રેકિંગ", val3_sub: "તમારું પેકેજ જુઓ.", val4_title: "24/7 સપોર્ટ", val4_sub: "હંમેશા તમારી સાથે.", form_title: "વેઇટલિસ્ટમાં જોડાઓ", form_desc: "પ્રથમ બનો.", form_name: "નામ", form_phone: "ફોન", form_email: "ઈમેલ", form_city: "શહેર", form_role: "ભૂમિકા", form_vehicle: "વાહન", form_submit: "નોંધણી કરો", success: "સ્વાગત છે." },
    te: { help: "సహాయ కేంద్రం", lang: "తెలుగు", main_title: "భారతదేశపు స్మార్ట్ డెలివరీ వస్తోంది.", main_sub: "ఆలస్యం లేదు.", val1_title: "చాలా వేగంగా", val1_sub: "ట్రాఫిక్ లేదు", val2_title: "దాచిన ఛార్జీలు లేవు", val2_sub: "పారదర్శక ధర.", val3_title: "లైవ్ ట్రాకింగ్", val3_sub: "ప్యాకేజీని చూడండి.", val4_title: "24/7 సపోర్ట్", val4_sub: "ఎల్లప్పుడూ ఇక్కడే.", form_title: "వెయిట్‌లిస్ట్‌లో చేరండి", form_desc: "మొదటి వ్యక్తి అవ్వండి.", form_name: "పేరు", form_phone: "ఫోన్", form_email: "ఇమెయిల్", form_city: "నగరం", form_role: "పాత్ర", form_vehicle: "వాహనం", form_submit: "నమోదు చేయండి", success: "స్వాగతం." },
    ta: { help: "உதவி மையம்", lang: "தமிழ்", main_title: "இந்தியாவின் ஸ்மார்ட் டெலிவரி வருகிறது.", main_sub: "தாமதம் இல்லை.", val1_title: "மிக வேகமாக", val1_sub: "போக்குவரத்து இல்லை", val2_title: "மறைக்கப்பட்ட கட்டணங்கள் இல்லை", val2_sub: "வெளிப்படையான விலை.", val3_title: "நேரலை கண்காணிப்பு", val3_sub: "தொகுப்பைப் பார்க்கவும்.", val4_title: "24/7 ஆதரவு", val4_sub: "எப்போதும் இங்கே.", form_title: "காத்திருப்பு பட்டியலில் சேரவும்", form_desc: "முதல் நபராக இருங்கள்.", form_name: "பெயர்", form_phone: "தொலைபேசி", form_email: "மின்னஞ்சல்", form_city: "நகரம்", form_role: "பங்கு", form_vehicle: "வாகனம்", form_submit: "பதிவு செய்க", success: "வரவேற்பு." },
    pa: { help: "ਸਹਾਇਤਾ ਕੇਂਦਰ", lang: "ਪੰਜਾਬੀ", main_title: "ਭਾਰਤ ਦੀ ਸਮਾਰਟ ਡਿਲਿਵਰੀ ਆ ਰਹੀ ਹੈ।", main_sub: "ਕੋਈ ਦੇਰੀ ਨਹੀਂ।", val1_title: "ਬਹੁਤ ਤੇਜ਼", val1_sub: "ਕੋਈ ਟ੍ਰੈਫਿਕ ਨਹੀਂ", val2_title: "ਕੋਈ ਲੁਕਵੇਂ ਖਰਚੇ ਨਹੀਂ", val2_sub: "ਪਾਰਦਰਸ਼ੀ ਕੀਮਤ।", val3_title: "ਲਾਈਵ ਟ੍ਰੈਕਿੰਗ", val3_sub: "ਆਪਣਾ ਪੈਕੇਜ ਦੇਖੋ।", val4_title: "24/7 ਸਪੋਰਟ", val4_sub: "ਹਮੇਸ਼ਾ ਇੱਥੇ।", form_title: "ਵੇਟਲਿਸਟ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋਵੋ", form_desc: "ਪਹਿਲੇ ਬਣੋ।", form_name: "ਨਾਮ", form_phone: "ਫੋਨ", form_email: "ਈਮੇਲ", form_city: "ਸ਼ਹਿਰ", form_role: "ਭੂਮਿਕਾ", form_vehicle: "ਵਾਹਨ", form_submit: "ਰਜਿਸਟਰ ਕਰੋ", success: "ਜੀ ਆਇਆਂ ਨੂੰ।" },
    bho: { help: "मदद केंद्र", lang: "भोजपुरी", main_title: "भारत के स्मार्ट डिलीवरी आवत बा।", main_sub: "कौनो देरी ना।", val1_title: "बहुत तेज", val1_sub: "कौनो ट्रैफिक ना", val2_title: "कौनो छिपल चार्ज ना", val2_sub: "पारदर्शी कीमत।", val3_title: "लाइव ट्रैकिंग", val3_sub: "आपन पैकेज देखीं।", val4_title: "24/7 सपोर्ट", val4_sub: "हमेशा इहाँ।", form_title: "वेटलिस्ट में शामिल होईं", form_desc: "पहिल बनीं।", form_name: "नाम", form_phone: "फोन", form_email: "ईमेल", form_city: "शहर", form_role: "भूमिका", form_vehicle: "वाहन", form_submit: "रजिस्टर करीं", success: "रउआ स्वागत बा।" },
    ar: { help: "مركز المساعدة", lang: "العربية", main_title: "أذكى شبكة توصيل في الهند قادمة.", main_sub: "تجربة بدون تأخير.", val1_title: "سريع جداً", val1_sub: "توجيه في الوقت الفعلي", val2_title: "لا رسوم خفية", val2_sub: "تسعير شفاف.", val3_title: "تتبع مباشر", val3_sub: "شاهد حزمتك.", val4_title: "دعم 24/7", val4_sub: "دائماً هنا.", form_title: "انضم إلى قائمة الانتظار", form_desc: "كن الأول.", form_name: "الاسم", form_phone: "الهاتف", form_email: "البريد", form_city: "المدينة", form_role: "الدور", form_vehicle: "المركبة", form_submit: "تأمين مكاني", success: "مرحباً." },
    es: { help: "Centro de ayuda", lang: "Español", main_title: "La red de entrega más inteligente está en camino.", main_sub: "Cero retrasos.", val1_title: "Súper rápido", val1_sub: "Rutas en tiempo real.", val2_title: "Sin cargos ocultos", val2_sub: "Precios transparentes.", val3_title: "Rastreo en vivo", val3_sub: "Mira tu paquete.", val4_title: "Soporte 24/7", val4_sub: "Siempre aquí.", form_title: "Únete a la lista", form_desc: "Sé el primero.", form_name: "Nombre", form_phone: "Teléfono", form_email: "Correo", form_city: "Ciudad", form_role: "Rol", form_vehicle: "Vehículo", form_submit: "Asegurar mi lugar", success: "Bienvenido." },
    fr: { help: "Centre d'aide", lang: "Français", main_title: "Le réseau de livraison le plus intelligent arrive.", main_sub: "Zéro retard.", val1_title: "Super rapide", val1_sub: "Routage en temps réel.", val2_title: "Pas de frais cachés", val2_sub: "Prix transparents.", val3_title: "Suivi en direct", val3_sub: "Regardez votre colis.", val4_title: "Support 24/7", val4_sub: "Toujours là.", form_title: "Rejoindre la liste", form_desc: "Soyez le premier.", form_name: "Nom", form_phone: "Téléphone", form_email: "Email", form_city: "Ville", form_role: "Rôle", form_vehicle: "Véhicule", form_submit: "Sécuriser ma place", success: "Bienvenue." },
    de: { help: "Hilfezentrum", lang: "Deutsch", main_title: "Das intelligenteste Liefernetzwerk kommt.", main_sub: "Keine Verzögerungen.", val1_title: "Super schnell", val1_sub: "Echtzeit-Routing.", val2_title: "Keine versteckten Gebühren", val2_sub: "Transparente Preise.", val3_title: "Live-Tracking", val3_sub: "Beobachten Sie Ihr Paket.", val4_title: "24/7 Support", val4_sub: "Immer hier.", form_title: "Warteliste beitreten", form_desc: "Sei der Erste.", form_name: "Name", form_phone: "Telefon", form_email: "E-Mail", form_city: "Stadt", form_role: "Rolle", form_vehicle: "Fahrzeug", form_submit: "Platz sichern", success: "Willkommen." }
  };

  const currentT = t[lang] || t['en'];

  // 4. EXPANDED FORM HANDLING, FIRESTORE & WHATSAPP WEBHOOK
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setStatus('SUBMITTING');
    try {
      // FIRESTORE LOGIC (Uncomment when Firebase is configured)
      /*
      await addDoc(collection(db, 'pre_registrations'), {
        ...formData,
        createdAt: serverTimestamp(),
        source: 'coming_soon_marketing_pivot'
      });
      */

      const webhookUrl = "https://your-secure-webhook-url-here.com";
      if(webhookUrl !== "https://your-secure-webhook-url-here.com"){
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }

      setStatus('SUCCESS');
      setFormData({ name: '', phone: '', email: '', role: 'Buyer', city: '', vehicle: '' });
      setTimeout(() => setStatus('IDLE'), 5000);
    } catch (error) {
      console.error(error);
      setStatus('ERROR');
      setTimeout(() => setStatus('IDLE'), 3000);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#000000] text-white font-sans selection:bg-white selection:text-black overflow-x-hidden">
      
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
          <p className="text-[1.25rem] md:text-[1.5rem] text-[#aaaaaa] font-medium leading-[1.5] max-w-[600px] mb-16">
            {currentT.main_sub}
          </p>
          
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

        {/* SECTION 2: EXPANDED REGISTRATION FORM */}
        <div className="w-full lg:w-[480px] bg-[#0a0a0a] border border-[#222222] rounded-[32px] p-8 shadow-[0_20px_60px_rgba(255,255,255,0.02)] opacity-0 animate-fade stagger-2 shrink-0">
          <h3 className="text-[1.8rem] font-black mb-2 text-white">{currentT.form_title}</h3>
          <p className="text-[#888888] text-[0.9rem] mb-8">{currentT.form_desc}</p>
          
          {status === 'SUCCESS' ? (
            <div className="bg-[#111111] border border-[#05a357] text-[#05a357] p-8 rounded-2xl text-center font-bold text-[1.1rem]">
              <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto mb-4"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              {currentT.success}
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
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
                <label className="block text-[0.75rem] font-bold uppercase tracking-widest text-[#666666] mb-2">{currentT.form_email}</label>
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
                    <option value="Customer">Buyer / Customer</option>
                    <option value="Driver Partner">Driver Partner</option>
                    <option value="Restaurant / Vendor">Business / Vendor</option>
                  </select>
                </div>
              </div>

              {/* Conditional Vehicle Input for Drivers Only */}
              {formData.role === 'Driver Partner' && (
                <div className="animate-fade">
                  <label className="block text-[0.75rem] font-bold uppercase tracking-widest text-[#05a357] mb-2">{currentT.form_vehicle}</label>
                  <select required value={formData.vehicle} onChange={(e)=>setFormData({...formData, vehicle: e.target.value})} className="w-full bg-[#05a357]/10 border border-[#05a357]/30 text-[#05a357] px-4 py-3.5 rounded-xl outline-none transition-colors cursor-pointer text-[0.9rem] appearance-none">
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
                {status === 'SUBMITTING' ? 'VERIFYING...' : currentT.form_submit}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* FOOTER ALIGNMENT */}
      <footer className="w-full max-w-[1400px] mx-auto mt-24 flex flex-col md:flex-row items-center justify-between gap-8 px-8 md:px-16 py-8 border-t border-[#111111] opacity-0 animate-fade stagger-3">
        
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