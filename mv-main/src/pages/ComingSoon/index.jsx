import React, { useState, useEffect } from 'react';
// IMPORTANT: Uncomment and point to your actual Firebase config file
// import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
// import { db } from '../../firebaseConfig'; 

export default function ComingSoon() {
  // 1. STATE MANAGEMENT
  const [lang, setLang] = useState('en');
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', role: 'Buyer' });
  const [status, setStatus] = useState('IDLE'); // IDLE, SUBMITTING, SUCCESS, ERROR
  const [telemetry, setTelemetry] = useState({ time: new Date(), os: 'Detecting...', connection: 'Detecting...' });

  // 2. REAL-TIME BROWSER TELEMETRY
  useEffect(() => {
    let frameId;
    const updateTelemetry = () => {
      setTelemetry({
        time: new Date(),
        os: navigator.platform || 'Unknown',
        connection: navigator.onLine ? (navigator.connection ? navigator.connection.effectiveType.toUpperCase() : 'SECURE TCP/IP') : 'OFFLINE'
      });
      setTimeout(() => { frameId = requestAnimationFrame(updateTelemetry); }, 1000);
    };
    frameId = requestAnimationFrame(updateTelemetry);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // 3. 11-LANGUAGE TRANSLATION DICTIONARY
  const t = {
    en: {
      nav_help: "Help Center", nav_lang: "English",
      slide1_title: "A New Delivery Experience Is Loading.", slide1_sub: "Website + App launching soon.",
      slide2_title: "We didn't just want to build an app.", slide2_sub: "We wanted to change the Experience.",
      slide3_title: "BLUE IS COMING", slide3_sub: "Your city is about to move smarter.",
      pillar1: "Fast Delivery", pillar2: "Trusted Service", pillar3: "Live Tracking", pillar4: "Always with you",
      form_title: "Join the Waitlist", form_name: "Full Name", form_phone: "WhatsApp Number", form_email: "Email Address", form_role: "I want to be a", form_submit: "Follow for updates",
      built_with: "Built with vision.", follow: "Follow for updates", success: "Welcome to the future of delivery. We will contact you soon."
    },
    hi: {
      nav_help: "सहायता केंद्र", nav_lang: "हिन्दी",
      slide1_title: "एक नया डिलीवरी अनुभव लोड हो रहा है।", slide1_sub: "वेबसाइट और ऐप जल्द ही आ रहे हैं।",
      slide2_title: "सपना सिर्फ app बनाना नहीं था।", slide2_sub: "Experience बदलना था।",
      slide3_title: "नीला रंग आ रहा है", slide3_sub: "आपका शहर अब स्मार्ट होने वाला है।",
      pillar1: "समय पर Delivery", pillar2: "भरोसेमंद Service", pillar3: "Live Tracking", pillar4: "हमेशा आपके साथ",
      form_title: "प्रतीक्षा सूची में शामिल हों", form_name: "पूरा नाम", form_phone: "व्हाट्सएप नंबर", form_email: "ईमेल पता", form_role: "मैं बनना चाहता हूँ", form_submit: "अपडेट के लिए फॉलो करें",
      built_with: "दृष्टिकोण के साथ निर्मित।", follow: "अपडेट के लिए फॉलो करें", success: "भविष्य की डिलीवरी में आपका स्वागत है। हम जल्द ही आपसे संपर्क करेंगे।"
    },
    hinglish: {
      nav_help: "Help Center", nav_lang: "Hinglish",
      slide1_title: "Ek naya delivery experience load ho raha hai.", slide1_sub: "Website + App jald aa rahe hain.",
      slide2_title: "Sapna sirf app banana nahi tha.", slide2_sub: "Experience badalna tha.",
      slide3_title: "BLUE IS COMING", slide3_sub: "Aapka city ab move karega smarter.",
      pillar1: "Samay par Delivery", pillar2: "Bharosemand Service", pillar3: "Live Tracking", pillar4: "Hamesha aapke saath",
      form_title: "Waitlist join karein", form_name: "Pura Naam", form_phone: "WhatsApp Number", form_email: "Email Address", form_role: "Main banna chahta hu", form_submit: "Updates ke liye follow karein",
      built_with: "Built with vision.", follow: "Updates ke liye follow karein", success: "Delivery ke future mein swagat hai. Hum jald hi contact karenge."
    },
    mr: {
      nav_help: "मदत केंद्र", nav_lang: "मराठी",
      slide1_title: "एक नवीन डिलिव्हरी अनुभव लोड होत आहे.", slide1_sub: "वेबसाइट आणि ॲप लवकरच लाँच होत आहे.",
      slide2_title: "फक्त ॲप बनवणे हे स्वप्न नव्हते.", slide2_sub: "अनुभव बदलायचा होता.",
      slide3_title: "निळा रंग येत आहे", slide3_sub: "तुमचे शहर आता स्मार्ट हलणार आहे.",
      pillar1: "वेळेवर डिलिव्हरी", pillar2: "विश्वसनीय सेवा", pillar3: "थेट ट्रॅकिंग", pillar4: "नेहमी तुमच्या सोबत",
      form_title: "प्रतीक्षा यादीत सामील व्हा", form_name: "पूर्ण नाव", form_phone: "व्हॉट्सॲप नंबर", form_email: "ईमेल", form_role: "मला बनायचे आहे", form_submit: "अपडेट्ससाठी फॉलो करा",
      built_with: "दृष्टीने बनवलेले.", follow: "अपडेट्ससाठी फॉलो करा", success: "डिलिव्हरीच्या भविष्यात आपले स्वागत आहे."
    },
    gu: {
      nav_help: "મદદ કેન્દ્ર", nav_lang: "ગુજરાતી",
      slide1_title: "એક નવો ડિલિવરી અનુભવ લોડ થઈ રહ્યો છે.", slide1_sub: "વેબસાઇટ અને એપ ટૂંક સમયમાં આવી રહી છે.",
      slide2_title: "ફક્ત એપ બનાવવાનું સપનું નહોતું.", slide2_sub: "અનુભવ બદલવો હતો.",
      slide3_title: "વાદળી રંગ આવી રહ્યો છે", slide3_sub: "તમારું શહેર હવે સ્માર્ટ બનવા જઈ રહ્યું છે.",
      pillar1: "સમયસર ડિલિવરી", pillar2: "વિશ્વસનીય સેવા", pillar3: "લાઇવ ટ્રેકિંગ", pillar4: "હંમેશા તમારી સાથે",
      form_title: "પ્રતીક્ષા સૂચિમાં જોડાઓ", form_name: "પૂરું નામ", form_phone: "વોટ્સએપ નંબર", form_email: "ઈમેલ", form_role: "મારે બનવું છે", form_submit: "અપડેટ્સ માટે ફોલો કરો",
      built_with: "દ્રષ્ટિ સાથે બનાવેલ.", follow: "અપડેટ્સ માટે ફોલો કરો", success: "ભવિષ્યમાં તમારું સ્વાગત છે."
    },
    bho: {
      nav_help: "मदद केंद्र", nav_lang: "भोजपुरी",
      slide1_title: "एगो नया डिलीवरी एक्सपीरियंस लोड हो रहल बा।", slide1_sub: "वेबसाइट अउर ऐप जल्दिये आवत बा।",
      slide2_title: "सपना खाली ऐप बनावल ना रहे।", slide2_sub: "एक्सपीरियंस बदले के रहे।",
      slide3_title: "नीला रंग आवत बा", slide3_sub: "रउआ शहर अब स्मार्ट होखे वाला बा।",
      pillar1: "समय पर डिलीवरी", pillar2: "भरोसेमंद सर्विस", pillar3: "लाइव ट्रैकिंग", pillar4: "हमेशा रउआ साथे",
      form_title: "वेटलिस्ट में शामिल होईं", form_name: "पूरा नाम", form_phone: "व्हाट्सएप नंबर", form_email: "ईमेल", form_role: "हम बनल चाहत बानी", form_submit: "अपडेट खातिर फॉलो करीं",
      built_with: "विजन के साथ बनल।", follow: "अपडेट खातिर फॉलो करीं", success: "भविष्य के डिलीवरी में रउआ स्वागत बा।"
    },
    te: {
      nav_help: "సహాయ కేంద్రం", nav_lang: "తెలుగు",
      slide1_title: "కొత్త డెలివరీ అనుభవం లోడ్ అవుతోంది.", slide1_sub: "వెబ్‌సైట్ మరియు యాప్ త్వరలో రానున్నాయి.",
      slide2_title: "కేవలం యాప్ చేయడమే కల కాదు.", slide2_sub: "అనుభవాన్ని మార్చాలనుకున్నాము.",
      slide3_title: "బ్లూ వస్తోంది", slide3_sub: "మీ నగరం మరింత స్మార్ట్‌గా మారనుంది.",
      pillar1: "సమయానికి డెలివరీ", pillar2: "నమ్మకమైన సేవ", pillar3: "లైవ్ ట్రాకింగ్", pillar4: "ఎల్లప్పుడూ మీతో",
      form_title: "వెయిట్‌లిస్ట్‌లో చేరండి", form_name: "పూర్తి పేరు", form_phone: "వాట్సాప్ నంబర్", form_email: "ఇమెయిల్", form_role: "నేను కావాలనుకుంటున్నాను", form_submit: "నవీకరణల కోసం అనుసరించండి",
      built_with: "దృష్టితో నిర్మించబడింది.", follow: "నవీకరణల కోసం అనుసరించండి", success: "డెలివరీ భవిష్యత్తుకు స్వాగతం."
    },
    ta: {
      nav_help: "உதவி மையம்", nav_lang: "தமிழ்",
      slide1_title: "ஒரு புதிய டெலிவரி அனுபவம் ஏற்றப்படுகிறது.", slide1_sub: "இணையதளம் மற்றும் ஆப் விரைவில்.",
      slide2_title: "ஆப் உருவாக்குவது மட்டும் கனவல்ல.", slide2_sub: "அனுபவத்தை மாற்ற விரும்பினோம்.",
      slide3_title: "நீலம் வருகிறது", slide3_sub: "உங்கள் நகரம் ஸ்மார்ட்டாக மாறப்போகிறது.",
      pillar1: "சரியான நேரத்தில் டெலிவரி", pillar2: "நம்பகமான சேவை", pillar3: "நேரலை கண்காணிப்பு", pillar4: "எப்போதும் உங்களுடன்",
      form_title: "காத்திருப்பு பட்டியலில் சேரவும்", form_name: "முழு பெயர்", form_phone: "வாட்ஸ்அப் எண்", form_email: "மின்னஞ்சல்", form_role: "நான் ஆக விரும்புகிறேன்", form_submit: "புதுப்பிப்புகளுக்கு பின்தொடரவும்",
      built_with: "பார்வையுடன் உருவாக்கப்பட்டது.", follow: "புதுப்பிப்புகளுக்கு பின்தொடரவும்", success: "எதிர்கால டெலிவரிக்கு வரவேற்கிறோம்."
    },
    pa: {
      nav_help: "ਸਹਾਇਤਾ ਕੇਂਦਰ", nav_lang: "ਪੰਜਾਬੀ",
      slide1_title: "ਇੱਕ ਨਵਾਂ ਡਿਲੀਵਰੀ ਤਜਰਬਾ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ।", slide1_sub: "ਵੈੱਬਸਾਈਟ ਅਤੇ ਐਪ ਜਲਦੀ ਆ ਰਹੇ ਹਨ।",
      slide2_title: "ਸਿਰਫ਼ ਐਪ ਬਣਾਉਣਾ ਸੁਪਨਾ ਨਹੀਂ ਸੀ।", slide2_sub: "ਅਨੁਭਵ ਬਦਲਣਾ ਸੀ।",
      slide3_title: "ਨੀਲਾ ਆ ਰਿਹਾ ਹੈ", slide3_sub: "ਤੁਹਾਡਾ ਸ਼ਹਿਰ ਸਮਾਰਟ ਹੋਣ ਵਾਲਾ ਹੈ।",
      pillar1: "ਸਮੇਂ ਸਿਰ ਡਿਲੀਵਰੀ", pillar2: "ਭਰੋਸੇਮੰਦ ਸੇਵਾ", pillar3: "ਲਾਈਵ ਟ੍ਰੈਕਿੰਗ", pillar4: "ਹਮੇਸ਼ਾ ਤੁਹਾਡੇ ਨਾਲ",
      form_title: "ਵੇਟਲਿਸਟ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋਵੋ", form_name: "ਪੂਰਾ ਨਾਮ", form_phone: "ਵਟਸਐਪ ਨੰਬਰ", form_email: "ਈਮੇਲ", form_role: "ਮੈਂ ਬਣਨਾ ਚਾਹੁੰਦਾ ਹਾਂ", form_submit: "ਅੱਪਡੇਟ ਲਈ ਫਾਲੋ ਕਰੋ",
      built_with: "ਵਿਜ਼ਨ ਨਾਲ ਬਣਾਇਆ.", follow: "ਅੱਪਡੇਟ ਲਈ ਫਾਲੋ ਕਰੋ", success: "ਭਵਿੱਖ ਦੀ ਡਿਲੀਵਰੀ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ।"
    },
    ar: {
      nav_help: "مركز المساعدة", nav_lang: "العربية",
      slide1_title: "تجربة توصيل جديدة قيد التحميل.", slide1_sub: "الموقع والتطبيق قريباً.",
      slide2_title: "لم يكن الحلم مجرد بناء تطبيق.", slide2_sub: "أردنا تغيير التجربة.",
      slide3_title: "اللون الأزرق قادم", slide3_sub: "مدينتك على وشك أن تصبح أذكى.",
      pillar1: "توصيل في الوقت", pillar2: "خدمة موثوقة", pillar3: "تتبع مباشر", pillar4: "دائماً معك",
      form_title: "انضم إلى قائمة الانتظار", form_name: "الاسم الكامل", form_phone: "رقم الواتساب", form_email: "البريد الإلكتروني", form_role: "أريد أن أكون", form_submit: "تابع للتحديثات",
      built_with: "بنيت برؤية.", follow: "تابع للتحديثات", success: "مرحباً بك في مستقبل التوصيل."
    },
    es: {
      nav_help: "Centro de ayuda", nav_lang: "Español",
      slide1_title: "Se está cargando una nueva experiencia de entrega.", slide1_sub: "Sitio web y aplicación próximamente.",
      slide2_title: "El sueño no era solo construir una aplicación.", slide2_sub: "Queríamos cambiar la experiencia.",
      slide3_title: "EL AZUL SE ACERCA", slide3_sub: "Tu ciudad está a punto de moverse de forma más inteligente.",
      pillar1: "Entrega a tiempo", pillar2: "Servicio confiable", pillar3: "Rastreo en vivo", pillar4: "Siempre contigo",
      form_title: "Únete a la lista de espera", form_name: "Nombre completo", form_phone: "Número de WhatsApp", form_email: "Correo electrónico", form_role: "Quiero ser", form_submit: "Síguenos para actualizaciones",
      built_with: "Construido con visión.", follow: "Síguenos para actualizaciones", success: "Bienvenido al futuro de las entregas."
    }
  };

  const currentT = t[lang];

  // 4. FORM HANDLING, FIRESTORE & WHATSAPP WEBHOOK
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setStatus('SUBMITTING');
    try {
      // FIRESTORE LOGIC (Uncomment when Firebase is configured)
      /*
      await addDoc(collection(db, 'pre_registrations'), {
        ...formData,
        createdAt: serverTimestamp(),
        source: 'coming_soon_monolithic'
      });
      */

      // WHATSAPP WEBHOOK LOGIC (Replace URL with your Zapier/Make/Cloud Function Webhook)
      const webhookUrl = "https://your-secure-webhook-url-here.com";
      // Stubbing the fetch request so it doesn't break without a real URL
      if(webhookUrl !== "https://your-secure-webhook-url-here.com"){
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }

      setStatus('SUCCESS');
      setFormData({ name: '', phone: '', email: '', role: 'Buyer' });
      setTimeout(() => setStatus('IDLE'), 5000);
    } catch (error) {
      console.error(error);
      setStatus('ERROR');
      setTimeout(() => setStatus('IDLE'), 3000);
    }
  };

  return (
    <div className="w-full min-h-screen font-sans selection:bg-[#0055ff] selection:text-white bg-[#0055ff]">
      
      {/* 5. INLINE HIGH-END KEYFRAMES */}
      <style>
        {`
          @keyframes pulseSoft { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
          @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes drawLine { from { stroke-dashoffset: 100; } to { stroke-dashoffset: 0; } }
          .animate-pulse-soft { animation: pulseSoft 3s infinite; }
          .animate-slide-up { animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}
      </style>

      {/* 6. FLOATING HEADER & LANGUAGE SWITCHER */}
      <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-[#333333] px-6 py-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="white"><path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13.5h-13L12 6.5z"/></svg>
          <span className="font-black text-[1.25rem] tracking-tighter">Movyra</span>
        </div>
        <div className="flex items-center gap-4">
          <select 
            value={lang} 
            onChange={(e) => setLang(e.target.value)}
            className="bg-transparent text-white border border-[#555555] rounded-full px-4 py-1 text-[0.85rem] font-bold outline-none cursor-pointer"
          >
            <option value="en" className="text-black">English</option>
            <option value="hi" className="text-black">हिन्दी</option>
            <option value="hinglish" className="text-black">Hinglish</option>
            <option value="mr" className="text-black">मराठी</option>
            <option value="gu" className="text-black">ગુજરાતી</option>
            <option value="bho" className="text-black">भोजपुरी</option>
            <option value="te" className="text-black">తెలుగు</option>
            <option value="ta" className="text-black">தமிழ்</option>
            <option value="pa" className="text-black">ਪੰਜਾਬੀ</option>
            <option value="ar" className="text-black">العربية</option>
            <option value="es" className="text-black">Español</option>
          </select>
          <span className="text-[0.85rem] text-[#aaaaaa] hidden md:block">{currentT.nav_help}</span>
        </div>
      </header>

      {/* 7. SECTION 1: BLACK THEME (A New Delivery Experience Is Loading) */}
      <section className="w-full bg-black text-white pt-32 pb-24 px-6 flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        <div className="w-16 h-16 bg-white text-black flex items-center justify-center rounded-2xl mb-8 animate-slide-up">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13.5h-13L12 6.5z"/></svg>
        </div>
        <h1 className="text-[3rem] md:text-[5rem] font-black leading-[1.1] tracking-tighter mb-6 max-w-[800px] animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {currentT.slide1_title}
        </h1>
        <p className="text-[1.25rem] text-[#aaaaaa] mb-16 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {currentT.slide1_sub}
        </p>

        {/* Abstract Browser Mockup representing the website loading */}
        <div className="w-full max-w-[1000px] border border-[#333333] rounded-t-[20px] bg-[#0a0a0a] overflow-hidden relative z-10 animate-slide-up shadow-[0_0_50px_rgba(255,255,255,0.05)]" style={{ animationDelay: '0.3s' }}>
          <div className="bg-[#1a1a1a] px-4 py-3 flex items-center gap-2 border-b border-[#333333]">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
            <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
            <div className="mx-auto bg-[#0a0a0a] text-[#888888] text-[0.7rem] px-8 py-1 rounded-md font-mono flex items-center gap-2">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
              movyra.in
            </div>
          </div>
          <div className="p-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-left opacity-30 pointer-events-none">
             <div><div className="h-4 bg-[#333333] w-24 mb-6 rounded"></div><div className="space-y-3"><div className="h-3 bg-[#222222] w-16 rounded"></div><div className="h-3 bg-[#222222] w-20 rounded"></div><div className="h-3 bg-[#222222] w-14 rounded"></div></div></div>
             <div><div className="h-4 bg-[#333333] w-24 mb-6 rounded"></div><div className="space-y-3"><div className="h-3 bg-[#222222] w-16 rounded"></div><div className="h-3 bg-[#222222] w-20 rounded"></div><div className="h-3 bg-[#222222] w-14 rounded"></div></div></div>
             <div><div className="h-4 bg-[#333333] w-24 mb-6 rounded"></div><div className="space-y-3"><div className="h-3 bg-[#222222] w-16 rounded"></div><div className="h-3 bg-[#222222] w-20 rounded"></div><div className="h-3 bg-[#222222] w-14 rounded"></div></div></div>
             <div><div className="h-4 bg-[#333333] w-24 mb-6 rounded"></div><div className="space-y-3"><div className="h-3 bg-[#222222] w-16 rounded"></div><div className="h-3 bg-[#222222] w-20 rounded"></div><div className="h-3 bg-[#222222] w-14 rounded"></div></div></div>
          </div>
        </div>
      </section>

      {/* 8. SECTION 2: VIBRANT BLUE THEME (Sapna sirf app banana nahi tha) */}
      <section className="w-full bg-[#0055ff] text-white py-24 px-6 flex flex-col items-center text-center relative overflow-hidden border-y border-[#0044cc]">
        <h2 className="text-[2.5rem] md:text-[4.5rem] font-black leading-[1.1] tracking-tighter mb-4 max-w-[900px] relative z-10">
          {currentT.slide2_title}
        </h2>
        <div className="flex items-center gap-4 mb-16 relative z-10">
          <div className="h-[2px] w-16 bg-white/50"></div>
          <p className="text-[1.5rem] md:text-[2rem] font-bold">{currentT.slide2_sub}</p>
          <div className="h-[2px] w-16 bg-white/50"></div>
        </div>

        {/* Abstract Delivery Illustration */}
        <div className="relative w-full max-w-[600px] h-[300px] mb-16 z-10">
          {/* Smartphone Backdrop */}
          <div className="absolute right-[10%] top-0 w-[180px] h-[300px] border-4 border-white/30 rounded-[30px] flex items-center justify-center overflow-hidden">
             <svg viewBox="0 0 100 200" className="w-full h-full opacity-50"><path d="M 20 180 L 50 100 L 80 150 L 120 50" fill="none" stroke="white" strokeWidth="2" strokeDasharray="5 5"/></svg>
             <div className="absolute top-10 right-4 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-[#0055ff] rounded-full"></div>
             </div>
          </div>
          {/* City Skyline */}
          <div className="absolute left-0 bottom-10 w-full flex items-end gap-2 opacity-30">
            <div className="w-8 h-32 border-2 border-white rounded-t-sm"></div>
            <div className="w-12 h-48 border-2 border-white rounded-t-sm"></div>
            <div className="w-10 h-24 border-2 border-white rounded-t-sm"></div>
            <div className="w-16 h-40 border-2 border-white rounded-t-sm flex justify-around pt-2"><div className="w-1 h-full border-r border-dashed border-white"></div><div className="w-1 h-full border-r border-dashed border-white"></div></div>
          </div>
          {/* Delivery Person Silhouette */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-56 border-t-4 border-x-4 border-white rounded-t-[40px] flex flex-col items-center justify-center bg-[#0055ff] z-20">
            <div className="w-16 h-16 rounded-full border-4 border-white -mt-24 mb-4 bg-[#0055ff]"></div>
            <span className="text-[3rem] font-black">M</span>
          </div>
          {/* Scooter Silhouette */}
          <div className="absolute bottom-0 left-[10%] w-32 h-24 border-2 border-white rounded-xl bg-[#0055ff] z-30 flex items-center justify-center">
             <span className="font-black text-xl">M</span>
             <div className="absolute -bottom-4 -left-2 w-8 h-8 rounded-full border-4 border-white bg-[#0055ff]"></div>
             <div className="absolute -bottom-4 -right-2 w-8 h-8 rounded-full border-4 border-white bg-[#0055ff]"></div>
          </div>
        </div>

        {/* 4 Pillars Grid (Fast Delivery, Trusted, Live Tracking, Always with you) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 w-full max-w-[900px] border-t border-white/20 pt-16 relative z-10">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center mb-4"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></div>
            <p className="font-bold">{currentT.pillar1}</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center mb-4"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="white" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg></div>
            <p className="font-bold">{currentT.pillar2}</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center mb-4"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="white" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
            <p className="font-bold">{currentT.pillar3}</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center mb-4"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="white" strokeWidth="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1v-6h3v4zM3 19a2 2 0 0 0 2 2h1v-6H3v4z"/></svg></div>
            <p className="font-bold">{currentT.pillar4}</p>
          </div>
        </div>
      </section>

      {/* 9. SECTION 3: WHITE THEME (BLUE IS COMING) */}
      <section className="w-full bg-white text-black py-24 px-6 flex flex-col items-center text-center">
        <h2 className="text-[4rem] md:text-[6rem] lg:text-[8rem] font-black leading-[0.9] tracking-tighter text-[#0055ff] mb-6 italic italic-font" style={{ transform: 'skewX(-10deg)' }}>
          BLUE <br/><span className="text-black text-[2rem] md:text-[3rem]">— IS —</span><br/> COMING <span className="text-[#0055ff]">💙</span>
        </h2>
        <p className="text-[1.5rem] font-bold text-[#333333] mb-16">{currentT.slide3_sub}</p>

        {/* 10. REAL-TIME WAITLIST REGISTRATION FORM */}
        <div className="w-full max-w-[500px] bg-white border border-[#eeeeee] rounded-[32px] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.06)] text-left">
          <h3 className="text-[1.5rem] font-black mb-6 text-center">{currentT.form_title}</h3>
          
          {status === 'SUCCESS' ? (
            <div className="bg-[#e6f4ea] text-[#05a357] p-6 rounded-2xl text-center font-bold border border-[#05a357]/30">
              {currentT.success}
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[0.8rem] font-bold uppercase tracking-widest text-[#888888] mb-1">{currentT.form_name}</label>
                <input required type="text" value={formData.name} onChange={(e)=>setFormData({...formData, name: e.target.value})} className="w-full bg-[#f8f9fa] border border-[#dddddd] px-4 py-3 rounded-xl outline-none focus:border-[#0055ff] focus:bg-white transition-colors" />
              </div>
              <div>
                <label className="block text-[0.8rem] font-bold uppercase tracking-widest text-[#888888] mb-1">{currentT.form_phone}</label>
                <input required type="tel" value={formData.phone} onChange={(e)=>setFormData({...formData, phone: e.target.value})} className="w-full bg-[#f8f9fa] border border-[#dddddd] px-4 py-3 rounded-xl outline-none focus:border-[#0055ff] focus:bg-white transition-colors" />
              </div>
              <div>
                <label className="block text-[0.8rem] font-bold uppercase tracking-widest text-[#888888] mb-1">{currentT.form_email}</label>
                <input required type="email" value={formData.email} onChange={(e)=>setFormData({...formData, email: e.target.value})} className="w-full bg-[#f8f9fa] border border-[#dddddd] px-4 py-3 rounded-xl outline-none focus:border-[#0055ff] focus:bg-white transition-colors" />
              </div>
              <div>
                <label className="block text-[0.8rem] font-bold uppercase tracking-widest text-[#888888] mb-1">{currentT.form_role}</label>
                <select value={formData.role} onChange={(e)=>setFormData({...formData, role: e.target.value})} className="w-full bg-[#f8f9fa] border border-[#dddddd] px-4 py-3 rounded-xl outline-none focus:border-[#0055ff] focus:bg-white transition-colors cursor-pointer">
                  <option value="Customer">Customer</option>
                  <option value="Driver Partner">Driver Partner</option>
                  <option value="Restaurant / Vendor">Restaurant / Vendor</option>
                </select>
              </div>
              <button disabled={status === 'SUBMITTING'} type="submit" className="w-full bg-[#0055ff] text-white font-bold text-[1.1rem] py-4 rounded-xl mt-4 hover:bg-[#0044cc] transition-colors disabled:opacity-50">
                {status === 'SUBMITTING' ? '...' : currentT.form_submit}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* 11. REAL-TIME BROWSER TELEMETRY & APP BADGES */}
      <section className="w-full bg-[#f4f6f8] text-black py-16 px-6 border-y border-[#eeeeee]">
        <div className="max-w-[1000px] mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[0.85rem] text-[#666666] font-bold uppercase tracking-widest">Client Sync: {telemetry.time.toLocaleTimeString()}</span>
            <span className="font-mono text-[0.85rem] text-[#666666] font-bold uppercase tracking-widest">Platform: {telemetry.os}</span>
            <span className="font-mono text-[0.85rem] text-[#05a357] font-bold uppercase tracking-widest flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#05a357] animate-pulse"></span> {telemetry.connection}</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
             {/* Apple Store SVG */}
             <div className="w-40 h-12 bg-black rounded-lg flex items-center justify-center cursor-pointer hover:-translate-y-1 transition-transform">
               <svg viewBox="0 0 135 40" width="135" height="40"><path d="M31.2,14.6c0-3.3,2.7-4.9,2.8-5c-1.5-2.2-3.9-2.5-4.7-2.6c-2-0.2-3.9,1.2-5,1.2c-1,0-2.6-1.1-4.2-1.1c-2.1,0-4.1,1.2-5.1,3c-2.2,3.8-0.6,9.4,1.5,12.5c1,1.5,2.2,3.1,3.8,3.1c1.5,0,2.1-0.9,3.9-0.9c1.8,0,2.4,0.9,4,0.9c1.6,0,2.6-1.5,3.6-3c1.2-1.7,1.7-3.4,1.7-3.5C33.4,19.1,31.2,17.3,31.2,14.6z M27.1,9.8c0.8-1,1.4-2.4,1.2-3.8c-1.2,0.1-2.7,0.8-3.6,1.8c-0.7,0.8-1.4,2.2-1.2,3.6C24.8,11.5,26.2,10.8,27.1,9.8z" fill="#FFFFFF"/><text x="45" y="16" fill="#FFFFFF" fontSize="10" fontFamily="sans-serif">Download on the</text><text x="45" y="32" fill="#FFFFFF" fontSize="16" fontFamily="sans-serif" fontWeight="bold">App Store</text></svg>
             </div>
             {/* Google Play SVG */}
             <div className="w-40 h-12 bg-black rounded-lg flex items-center justify-center cursor-pointer hover:-translate-y-1 transition-transform">
               <svg viewBox="0 0 135 40" width="135" height="40"><path d="M12.6,9.1L24,20.4L12.6,31.8c-0.5,0.5-1.4,0.1-1.4-0.6V9.7C11.2,9,12.1,8.6,12.6,9.1z" fill="#00E676"/><path d="M25.4,21.9l4.5,4.5l-17.3,9.8c-1.1,0.6-2.5-0.1-2.5-1.4v-0.6L25.4,21.9z" fill="#F44336"/><path d="M25.4,18.9L10.1,3.7v-0.6c0-1.3,1.4-2,2.5-1.4l17.3,9.8L25.4,18.9z" fill="#FFC107"/><path d="M31.8,18.9l-4.9-2.8l-1.4,1.4l0,0l0,0l1.4,1.4l4.9-2.8C32.6,19.9,32.6,19.3,31.8,18.9z" fill="#2196F3"/><text x="45" y="16" fill="#FFFFFF" fontSize="10" fontFamily="sans-serif">GET IT ON</text><text x="45" y="32" fill="#FFFFFF" fontSize="16" fontFamily="sans-serif" fontWeight="bold">Google Play</text></svg>
             </div>
          </div>
        </div>
      </section>

      {/* 12. GLOBAL CITIES & FOOTER SOCIALS */}
      <footer className="w-full bg-white text-black pt-16 pb-8 px-6 text-center border-t border-[#eeeeee]">
        <div className="flex flex-wrap justify-center gap-4 mb-10">
           {['San Francisco', 'New York', 'London', 'Dubai', 'Tokyo', 'Mumbai'].map(city => (
             <span key={city} className="bg-[#f0f0f0] px-4 py-2 rounded-full text-[0.85rem] font-bold uppercase tracking-widest text-[#666666] flex items-center gap-2">
               <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
               {city}
             </span>
           ))}
        </div>
        
        <div className="flex items-center justify-center gap-6 mb-8 text-[#0055ff]">
          <a href="#instagram" className="hover:opacity-70 transition-opacity"><svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>
          <a href="#twitter" className="hover:opacity-70 transition-opacity"><svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.006 4.15H5.078z"/></svg></a>
          <a href="#youtube" className="hover:opacity-70 transition-opacity"><svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg></a>
          <a href="#linkedin" className="hover:opacity-70 transition-opacity"><svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
        </div>
        
        <div className="flex flex-col items-center gap-2">
           <div className="flex items-center gap-2 border border-[#cccccc] rounded-full px-6 py-2">
             <span className="font-bold text-[0.9rem] text-[#333333]">{currentT.built_with}</span>
             <span className="font-bold text-[0.9rem] text-[#0055ff]">@movyra.in</span>
           </div>
           <p className="text-[0.8rem] text-[#aaaaaa] mt-4">&copy; {telemetry.time.getFullYear()} Movyra Technologies Inc.</p>
        </div>
      </footer>

    </div>
  );
}