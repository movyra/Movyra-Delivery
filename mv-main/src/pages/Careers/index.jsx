import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; 
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ============================================================================
 * COMPONENT: CORPORATE RECRUITMENT PORTAL (mv-main)
 * Purpose: Secure intake gateway for prospective team members.
 * Behavior: Multi-stage evaluation process featuring dynamic, role-specific 
 * technical and operational questionnaires. Submits encrypted payloads to
 * the isolated career_applications database node.
 * Structural Constraint: Strict zero emoji vector configuration. Black and 
 * white minimalist design architecture.
 * ============================================================================
 */

export default function Careers() {
  const [lang, setLang] = useState('en');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langDropdownRef = useRef(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState('IDLE'); 

  // NEW: Support Modal States
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportText, setSupportText] = useState('');
  const [supportStatus, setSupportStatus] = useState('IDLE');

  const [formData, setFormData] = useState({
    fullName: '', phone: '', email: '', city: '', state: '',
    linkedin: '', github: '', portfolio: '',
    roleCategory: '', specificRole: '', employmentType: 'Full-Time', expectedSalary: '',
    inquiryType: 'Application',
    startupReason: '', budgetStrategy: '',
    techArch: '', nearestPartner: '', aiPrompt: '', aiHallucination: '', 
    marketingAcquisition: '', opsPeakHours: '', opsFraud: ''
  });

  useEffect(() => {
    const sysLang = navigator.language.slice(0, 2);
    const supported = ['en', 'hi', 'hinglish', 'mr', 'gu', 'te', 'ta', 'pa', 'bho', 'ar', 'es', 'fr', 'de'];
    if (supported.includes(sysLang)) setLang(sysLang);

    const handleClickOutside = (event) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const languageOptions = [
    { code: 'en', label: 'English' }, { code: 'hi', label: 'हिन्दी' }, { code: 'hinglish', label: 'Hinglish' },
    { code: 'mr', label: 'मराठी' }, { code: 'gu', label: 'ગુજરાતી' }, { code: 'te', label: 'తెలుగు' },
    { code: 'ta', label: 'தமிழ்' }, { code: 'pa', label: 'ਪੰਜਾਬੀ' }, { code: 'bho', label: 'भोजपुरी' },
    { code: 'ar', label: 'العربية' }, { code: 'es', label: 'Español' }, { code: 'fr', label: 'Français' },
    { code: 'de', label: 'Deutsch' }
  ];

  const t = {
    en: { 
      title: "Join Our Team.", sub: "Deliveries are on hold, but we are building. We are hiring people now.", next: "Next", submit: "Submit", back: "Back",
      culture: "Our Way of Work", cult1: "Fast Focus", cult1_d: "We act quickly.", cult2: "Fair Rules", cult2_d: "Equal respect for all.", cult3: "Team First", cult3_d: "We win together.",
      perks: "Good Benefits", perk1: "Health Care", perk1_d: "Medical cover.", perk2: "Time Off", perk2_d: "Rest when needed.", perk3: "Learning", perk3_d: "Grow your skills.",
      process: "How We Hire", proc1: "Apply", proc2: "Talk", proc3: "Task", proc4: "Join",
      faq: "Common Questions", faq1: "Are you hiring?", faq1_a: "Yes, we are looking for team members.", faq2: "Is it remote?", faq2_a: "Depends on the role.", faq3: "What is the process?", faq3_a: "Submit form, talk to us, do a task, join.",
      support: "Need Help?", supp_desc: "Tell us your technical issue.", supp_btn: "Send Issue"
    },
    hi: { 
      title: "हमारी टीम से जुड़ें।", sub: "डिलीवरी अभी बंद है, लेकिन हम काम कर रहे हैं और लोगों को काम दे रहे हैं।", next: "आगे बढ़ें", submit: "जमा करें", back: "पीछे",
      culture: "काम का तरीका", cult1: "तेज काम", cult1_d: "हम जल्दी करते हैं।", cult2: "समान नियम", cult2_d: "सबका सम्मान।", cult3: "टीम पहले", cult3_d: "हम साथ जीतते हैं।",
      perks: "अच्छे फायदे", perk1: "स्वास्थ्य सुरक्षा", perk1_d: "मेडिकल कवर।", perk2: "छुट्टी", perk2_d: "आराम करें।", perk3: "सीखना", perk3_d: "कौशल बढ़ाएं।",
      process: "चयन प्रक्रिया", proc1: "आवेदन", proc2: "बातचीत", proc3: "टास्क", proc4: "जुड़ें",
      faq: "आम सवाल", faq1: "क्या आप भर्ती कर रहे हैं?", faq1_a: "हां, हम लोगों को काम दे रहे हैं।", faq2: "क्या घर से काम है?", faq2_a: "भूमिका पर निर्भर करता है।", faq3: "प्रक्रिया क्या है?", faq3_a: "फॉर्म भरें, हमसे बात करें, काम करें, जुड़ें।",
      support: "मदद चाहिए?", supp_desc: "अपनी तकनीकी समस्या बताएं।", supp_btn: "भेजें"
    },
    hinglish: { 
      title: "Hamari Team Join Karein.", sub: "Deliveries abhi band hain, par hum kaam kar rahe hain aur hiring chalu hai.", next: "Next", submit: "Submit", back: "Back",
      culture: "Kaam Ka Tareeka", cult1: "Fast Kaam", cult1_d: "Hum jaldi karte hain.", cult2: "Fair Rules", cult2_d: "Sabki izzat.", cult3: "Team Pehle", cult3_d: "Sath jeette hain.",
      perks: "Acche Fayde", perk1: "Health Care", perk1_d: "Medical cover.", perk2: "Chhutti", perk2_d: "Aaram karein.", perk3: "Seekhna", perk3_d: "Skills badhayein.",
      process: "Hiring Process", proc1: "Apply", proc2: "Baat Karein", proc3: "Task", proc4: "Join",
      faq: "Aam Sawaal", faq1: "Hiring chalu hai?", faq1_a: "Haan, hum hire kar rahe hain.", faq2: "Work from home hai?", faq2_a: "Role par depend karta hai.", faq3: "Process kya hai?", faq3_a: "Form bharein, baat karein, task karein, join karein.",
      support: "Help Chahiye?", supp_desc: "Apni technical problem batayein.", supp_btn: "Send Karein"
    },
    mr: { 
      title: "आमच्या टीममध्ये सामील व्हा.", sub: "डिलिव्हरी सध्या बंद आहे, परंतु आम्ही काम करत आहोत आणि लोकांना काम देत आहोत.", next: "पुढे जा", submit: "सबमिट करा", back: "मागे",
      culture: "कामाची पद्धत", cult1: "जलद काम", cult1_d: "आम्ही वेगात काम करतो.", cult2: "समान नियम", cult2_d: "सर्वांचा आदर.", cult3: "टीम प्रथम", cult3_d: "आम्ही एकत्र जिंकतो.",
      perks: "चांगले फायदे", perk1: "आरोग्य काळजी", perk1_d: "मेडिकल कव्हर.", perk2: "सुट्टी", perk2_d: "आराम करा.", perk3: "शिकणे", perk3_d: "कौशल्य वाढवा.",
      process: "निवड प्रक्रिया", proc1: "अर्ज करा", proc2: "बोलणे", proc3: "टास्क", proc4: "सामील व्हा",
      faq: "सामान्य प्रश्न", faq1: "भरती सुरू आहे का?", faq1_a: "होय, आम्ही लोकांना काम देत आहोत.", faq2: "घरून काम आहे का?", faq2_a: "भूमिकेवर अवलंबून आहे.", faq3: "प्रक्रिया काय आहे?", faq3_a: "फॉर्म भरा, आमच्याशी बोला, काम करा, सामील व्हा.",
      support: "मदत हवी आहे?", supp_desc: "तुमची तांत्रिक समस्या सांगा.", supp_btn: "पाठवा"
    },
    gu: { 
      title: "અમારી ટીમમાં જોડાઓ.", sub: "ડિલિવરી હાલમાં બંધ છે, પરંતુ અમે કામ કરી રહ્યા છીએ અને લોકોને કામ આપી રહ્યા છીએ.", next: "આગળ", submit: "સબમિટ કરો", back: "પાછળ",
      culture: "કામ કરવાની રીત", cult1: "ઝડપી કામ", cult1_d: "અમે ઝડપથી કામ કરીએ છીએ.", cult2: "સમાન નિયમો", cult2_d: "બધાને સન્માન.", cult3: "ટીમ પ્રથમ", cult3_d: "અમે સાથે જીતીએ છીએ.",
      perks: "સારા ફાયદા", perk1: "આરોગ્ય સંભાળ", perk1_d: "મેડિકલ કવર.", perk2: "રજા", perk2_d: "આરામ કરો.", perk3: "શીખવું", perk3_d: "કૌશલ્ય વધારો.",
      process: "પસંદગી પ્રક્રિયા", proc1: "અરજી કરો", proc2: "વાતચીત", proc3: "ટાસ્ક", proc4: "જોડાવો",
      faq: "સામાન્ય પ્રશ્નો", faq1: "શું ભરતી ચાલુ છે?", faq1_a: "હા, અમે લોકોને કામ આપી રહ્યા છીએ.", faq2: "શું ઘરેથી કામ છે?", faq2_a: "ભૂમિકા પર આધાર રાખે છે.", faq3: "પ્રક્રિયા શું છે?", faq3_a: "ફોર્મ ભરો, અમારી સાથે વાત કરો, કામ કરો, જોડાવો.",
      support: "મદદ જોઈએ છે?", supp_desc: "તમારી તકનીકી સમસ્યા જણાવો.", supp_btn: "મોકલો"
    },
    te: { 
      title: "మా బృందంలో చేరండి.", sub: "డెలివరీలు ఆపివేయబడ్డాయి, కానీ మేము పని చేస్తున్నాము మరియు ఉద్యోగాలు ఇస్తున్నాము.", next: "తరువాత", submit: "సమర్పించండి", back: "వెనుకకు",
      culture: "పని చేసే విధానం", cult1: "వేగవంతమైన పని", cult1_d: "మేము వేగంగా పని చేస్తాము.", cult2: "సమాన నియమాలు", cult2_d: "అందరికీ గౌరవం.", cult3: "జట్టు ముందు", cult3_d: "మేము కలిసి గెలుస్తాము.",
      perks: "మంచి ప్రయోజనాలు", perk1: "ఆరోగ్య సంరక్షణ", perk1_d: "వైద్య సదుపాయం.", perk2: "సెలవు", perk2_d: "విశ్రాంతి తీసుకోండి.", perk3: "నేర్చుకోవడం", perk3_d: "నైపుణ్యాలను పెంచుకోండి.",
      process: "ఎంపిక ప్రక్రియ", proc1: "దరఖాస్తు", proc2: "మాట్లాడటం", proc3: "టాస్క్", proc4: "చేరండి",
      faq: "సాధారణ ప్రశ్నలు", faq1: "ఉద్యోగాలు ఉన్నాయా?", faq1_a: "అవును, మేము ఉద్యోగాలు ఇస్తున్నాము.", faq2: "ఇంటి నుండి పని ఉందా?", faq2_a: "పాత్రపై ఆధారపడి ఉంటుంది.", faq3: "ప్రక్రియ ఏమిటి?", faq3_a: "ఫారమ్ నింపండి, మాతో మాట్లాడండి, పని చేయండి, చేరండి.",
      support: "సహాయం కావాలా?", supp_desc: "మీ సాంకేతిక సమస్యను చెప్పండి.", supp_btn: "పంపండి"
    },
    ta: { 
      title: "எங்கள் குழுவில் சேரவும்.", sub: "டெலிவரிகள் நிறுத்தப்பட்டுள்ளன, ஆனால் நாங்கள் வேலை செய்கிறோம், வேலை தருகிறோம்.", next: "அடுத்து", submit: "சமர்ப்பிக்கவும்", back: "பின்னால்",
      culture: "வேலை செய்யும் முறை", cult1: "வேகமான வேலை", cult1_d: "நாங்கள் விரைவாக செயல்படுகிறோம்.", cult2: "சமமான விதிகள்", cult2_d: "அனைவருக்கும் மரியாதை.", cult3: "குழு முதலில்", cult3_d: "நாங்கள் ஒன்றாக வெல்கிறோம்.",
      perks: "நல்ல சலுகைகள்", perk1: "சுகாதார பாதுகாப்பு", perk1_d: "மருத்துவ காப்பீடு.", perk2: "விடுமுறை", perk2_d: "ஓய்வெடுங்கள்.", perk3: "கற்றல்", perk3_d: "திறன்களை வளர்த்துக் கொள்ளுங்கள்.",
      process: "தேர்வு முறை", proc1: "விண்ணப்பிக்கவும்", proc2: "பேசுங்கள்", proc3: "பணி", proc4: "சேரவும்",
      faq: "பொதுவான கேள்விகள்", faq1: "வேலைகள் உள்ளதா?", faq1_a: "ஆம், நாங்கள் வேலை தருகிறோம்.", faq2: "வீட்டிலிருந்து வேலையா?", faq2_a: "பங்கை பொறுத்தது.", faq3: "நடைமுறை என்ன?", faq3_a: "படிவத்தை நிரப்பவும், எங்களுடன் பேசவும், வேலை செய்யவும், சேரவும்.",
      support: "உதவி தேவையா?", supp_desc: "உங்கள் தொழில்நுட்ப சிக்கலை கூறுங்கள்.", supp_btn: "அனுப்பு"
    },
    pa: { 
      title: "ਸਾਡੀ ਟੀਮ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋਵੋ।", sub: "ਡਿਲਿਵਰੀ ਫਿਲਹਾਲ ਬੰਦ ਹੈ, ਪਰ ਅਸੀਂ ਕੰਮ ਕਰ ਰਹੇ ਹਾਂ ਅਤੇ ਲੋਕਾਂ ਨੂੰ ਕੰਮ ਦੇ ਰਹੇ ਹਾਂ।", next: "ਅੱਗੇ", submit: "ਜਮ੍ਹਾਂ ਕਰੋ", back: "ਪਿੱਛੇ",
      culture: "ਕੰਮ ਕਰਨ ਦਾ ਤਰੀਕਾ", cult1: "ਤੇਜ਼ ਕੰਮ", cult1_d: "ਅਸੀਂ ਤੇਜ਼ੀ ਨਾਲ ਕੰਮ ਕਰਦੇ ਹਾਂ।", cult2: "ਸਮਾਨ ਨਿਯਮ", cult2_d: "ਸਾਰਿਆਂ ਦਾ ਸਨਮਾਨ।", cult3: "ਟੀਮ ਪਹਿਲਾਂ", cult3_d: "ਅਸੀਂ ਇਕੱਠੇ ਜਿੱਤਦੇ ਹਾਂ।",
      perks: "ਚੰਗੇ ਫਾਇਦੇ", perk1: "ਸਿਹਤ ਸੰਭਾਲ", perk1_d: "ਮੈਡੀਕਲ ਕਵਰ।", perk2: "ਛੁੱਟੀ", perk2_d: "ਆਰਾਮ ਕਰੋ।", perk3: "ਸਿੱਖਣਾ", perk3_d: "ਹੁਨਰ ਵਧਾਓ।",
      process: "ਚੋਣ ਪ੍ਰਕਿਰਿਆ", proc1: "ਅਰਜ਼ੀ ਦਿਓ", proc2: "ਗੱਲ ਕਰੋ", proc3: "ਟਾਸਕ", proc4: "ਸ਼ਾਮਲ ਹੋਵੋ",
      faq: "ਆਮ ਸਵਾਲ", faq1: "ਕੀ ਭਰਤੀ ਚਾਲੂ ਹੈ?", faq1_a: "ਹਾਂ, ਅਸੀਂ ਲੋਕਾਂ ਨੂੰ ਕੰਮ ਦੇ ਰਹੇ ਹਾਂ।", faq2: "ਕੀ ਘਰ ਤੋਂ ਕੰਮ ਹੈ?", faq2_a: "ਭੂਮਿਕਾ 'ਤੇ ਨਿਰਭਰ ਕਰਦਾ ਹੈ।", faq3: "ਪ੍ਰਕਿਰਿਆ ਕੀ ਹੈ?", faq3_a: "ਫਾਰਮ ਭਰੋ, ਸਾਡੇ ਨਾਲ ਗੱਲ ਕਰੋ, ਕੰਮ ਕਰੋ, ਸ਼ਾਮਲ ਹੋਵੋ।",
      support: "ਮਦਦ ਚਾਹੀਦੀ ਹੈ?", supp_desc: "ਆਪਣੀ ਤਕਨੀਕੀ ਸਮੱਸਿਆ ਦੱਸੋ।", supp_btn: "ਭੇਜੋ"
    },
    bho: { 
      title: "हमनी के टीम में शामिल होईं।", sub: "डिलीवरी अभी बंद बा, बाकिर हमनी के काम करत बानी जा आ लोग के काम देत बानी जा।", next: "आगे", submit: "जमा करीं", back: "पाछे",
      culture: "काम के तरीका", cult1: "तेज काम", cult1_d: "हमनी के जल्दी काम करेनी जा।", cult2: "समान नियम", cult2_d: "सबकर सम्मान।", cult3: "टीम पहिले", cult3_d: "हमनी के एक साथ जीतेनी जा।",
      perks: "बढ़िया फायदा", perk1: "स्वास्थ्य देखभाल", perk1_d: "मेडिकल कवर।", perk2: "छुट्टी", perk2_d: "आराम करीं।", perk3: "सीखल", perk3_d: "कौशल बढ़ाईं।",
      process: "चयन प्रक्रिया", proc1: "आवेदन करीं", proc2: "बातचीत", proc3: "टास्क", proc4: "जुड़ीं",
      faq: "आम सवाल", faq1: "का बहाली चालू बा?", faq1_a: "हाँ, हमनी के लोग के काम देत बानी जा।", faq2: "का घर से काम बा?", faq2_a: "भूमिका पर निर्भर करेला।", faq3: "प्रक्रिया का बा?", faq3_a: "फॉर्म भरीं, हमनी से बात करीं, काम करीं, जुड़ीं।",
      support: "मदद चाहीं?", supp_desc: "आपन तकनीकी समस्या बताईं।", supp_btn: "भेजीं"
    },
    ar: { 
      title: "انضم إلى فريقنا.", sub: "عمليات التوصيل متوقفة، لكننا نعمل ونوظف.", next: "التالي", submit: "إرسال", back: "خلف",
      culture: "طريقتنا في العمل", cult1: "عمل سريع", cult1_d: "نحن نتصرف بسرعة.", cult2: "قواعد عادلة", cult2_d: "احترام متساوٍ للجميع.", cult3: "الفريق أولاً", cult3_d: "نحن نفوز معًا.",
      perks: "فوائد جيدة", perk1: "رعاية صحية", perk1_d: "تغطية طبية.", perk2: "وقت مستقطع", perk2_d: "ارتح عندما تحتاج.", perk3: "تعلم", perk3_d: "طور مهاراتك.",
      process: "كيف نوظف", proc1: "تطبيق", proc2: "تحدث", proc3: "مهمة", proc4: "انضم",
      faq: "أسئلة شائعة", faq1: "هل توظفون؟", faq1_a: "نعم، نحن نبحث عن أعضاء.", faq2: "هل العمل عن بعد؟", faq2_a: "يعتمد على الدور.", faq3: "ما هي العملية؟", faq3_a: "أرسل النموذج، تحدث إلينا، قم بمهمة، انضم.",
      support: "تحتاج مساعدة؟", supp_desc: "أخبرنا بمشكلتك الفنية.", supp_btn: "إرسال"
    },
    es: { 
      title: "Únete a nuestro equipo.", sub: "Las entregas están pausadas, pero seguimos trabajando y contratando.", next: "Siguiente", submit: "Enviar", back: "Atrás",
      culture: "Nuestra Cultura", cult1: "Trabajo Rápido", cult1_d: "Actuamos rápido.", cult2: "Reglas Justas", cult2_d: "Respeto para todos.", cult3: "Equipo Primero", cult3_d: "Ganamos juntos.",
      perks: "Buenos Beneficios", perk1: "Salud", perk1_d: "Cobertura médica.", perk2: "Tiempo Libre", perk2_d: "Descansa cuando necesites.", perk3: "Aprendizaje", perk3_d: "Mejora tus habilidades.",
      process: "Proceso de Contratación", proc1: "Aplicar", proc2: "Hablar", proc3: "Tarea", proc4: "Unirse",
      faq: "Preguntas Frecuentes", faq1: "¿Están contratando?", faq1_a: "Sí, buscamos personas.", faq2: "¿Es remoto?", faq2_a: "Depende del rol.", faq3: "¿Cuál es el proceso?", faq3_a: "Llena el formulario, habla, haz una tarea, únete.",
      support: "¿Necesitas Ayuda?", supp_desc: "Dinos tu problema técnico.", supp_btn: "Enviar"
    },
    fr: { 
      title: "Rejoignez notre équipe.", sub: "Les livraisons sont en pause, mais nous travaillons et recrutons.", next: "Suivant", submit: "Soumettre", back: "Retour",
      culture: "Notre Culture", cult1: "Travail Rapide", cult1_d: "Nous agissons vite.", cult2: "Règles Justes", cult2_d: "Respect pour tous.", cult3: "Équipe D'abord", cult3_d: "Nous gagnons ensemble.",
      perks: "Bons Avantages", perk1: "Santé", perk1_d: "Couverture médicale.", perk2: "Temps Libre", perk2_d: "Reposez-vous.", perk3: "Apprentissage", perk3_d: "Améliorez vos compétences.",
      process: "Processus d'Embauche", proc1: "Appliquer", proc2: "Parler", proc3: "Tâche", proc4: "Rejoindre",
      faq: "Questions Fréquentes", faq1: "Embauchez-vous ?", faq1_a: "Oui, nous cherchons des personnes.", faq2: "Est-ce à distance ?", faq2_a: "Cela dépend du rôle.", faq3: "Quel est le processus ?", faq3_a: "Remplissez le formulaire, parlez, faites une tâche, rejoignez.",
      support: "Besoin d'aide ?", supp_desc: "Dites-nous votre problème technique.", supp_btn: "Envoyer"
    },
    de: { 
      title: "Trete unserem Team bei.", sub: "Lieferungen pausieren, aber wir arbeiten und stellen ein.", next: "Weiter", submit: "Einreichen", back: "Zurück",
      culture: "Unsere Kultur", cult1: "Schnelle Arbeit", cult1_d: "Wir handeln schnell.", cult2: "Faire Regeln", cult2_d: "Respekt für alle.", cult3: "Team Zuerst", cult3_d: "Wir gewinnen zusammen.",
      perks: "Gute Vorteile", perk1: "Gesundheit", perk1_d: "Medizinische Versorgung.", perk2: "Freizeit", perk2_d: "Ruh dich aus.", perk3: "Lernen", perk3_d: "Fähigkeiten verbessern.",
      process: "Einstellungsprozess", proc1: "Bewerben", proc2: "Sprechen", proc3: "Aufgabe", proc4: "Beitreten",
      faq: "Häufige Fragen", faq1: "Stellen Sie ein?", faq1_a: "Ja, wir suchen Leute.", faq2: "Ist es remote?", faq2_a: "Hängt von der Rolle ab.", faq3: "Was ist der Prozess?", faq3_a: "Formular ausfüllen, sprechen, Aufgabe machen, beitreten.",
      support: "Brauchen Sie Hilfe?", supp_desc: "Teilen Sie uns Ihr technisches Problem mit.", supp_btn: "Senden"
    }
  };

  const currentT = t[lang] || t['en'];

  // Interactive Department Cards
  const departments = [
    { id: 1, name: "Support", desc: "Help users.", mapTo: "Operations & Logistics", icon: <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> },
    { id: 2, name: "Development", desc: "Write code.", mapTo: "Engineering & Tech", icon: <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg> },
    { id: 3, name: "Sales", desc: "Grow business.", mapTo: "Marketing & Sales", icon: <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg> },
    { id: 4, name: "Customer Care", desc: "Talk to people.", mapTo: "Operations & Logistics", icon: <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> },
    { id: 5, name: "Teamwork", desc: "Work together.", mapTo: "Marketing & Sales", icon: <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> },
    { id: 6, name: "Operations", desc: "Manage systems.", mapTo: "Operations & Logistics", icon: <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg> }
  ];

  const handleDepartmentClick = (deptMap) => {
    setFormData({ ...formData, roleCategory: deptMap, specificRole: '' });
    setCurrentStep(2); // Jump to Role Selection
    const formElement = document.getElementById('application-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    setCurrentStep(prev => prev + 1);
    const formElement = document.getElementById('application-form');
    if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    const formElement = document.getElementById('application-form');
    if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'career_applications'), {
        ...formData,
        status: 'Pending Review',
        timestamp: serverTimestamp()
      });
      setSubmissionStatus('SUCCESS');
    } catch (error) {
      console.error("Submission Failure:", error);
      setSubmissionStatus('ERROR');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    setSupportStatus('SUBMITTING');
    try {
      await addDoc(collection(db, 'technical_issues'), {
        issue: supportText,
        timestamp: serverTimestamp()
      });
      setSupportStatus('SUCCESS');
      setTimeout(() => {
        setShowSupportModal(false);
        setSupportStatus('IDLE');
        setSupportText('');
      }, 2000);
    } catch (error) {
      console.error("Support Error:", error);
      setSupportStatus('ERROR');
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#000000] text-white font-sans selection:bg-white selection:text-black flex flex-col items-center relative">
      
      {/* FLOATING SUPPORT BUTTON */}
      <button 
        onClick={() => setShowSupportModal(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-white text-black rounded-full shadow-2xl flex items-center justify-center font-black text-xl hover:scale-110 transition-transform z-50 outline-none border-4 border-[#333333]"
      >
        ?
      </button>

      {/* SUPPORT MODAL */}
      <AnimatePresence>
        {showSupportModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-[400px] bg-[#050505] border border-[#333333] rounded-3xl p-8 flex flex-col shadow-2xl relative"
            >
              <button 
                onClick={() => setShowSupportModal(false)} 
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[#888888] hover:text-white transition-colors outline-none"
              >
                <X size={18} />
              </button>
              <h2 className="text-[1.5rem] font-black tracking-tight mb-2 text-white text-center">{currentT.support}</h2>
              <p className="text-[#888888] text-[0.9rem] text-center mb-6">{currentT.supp_desc}</p>

              {supportStatus === 'SUCCESS' ? (
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center mb-4">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSupportSubmit} className="flex flex-col gap-4">
                  <textarea required rows="4" value={supportText} onChange={(e) => setSupportText(e.target.value)} placeholder="Type here..." className="w-full bg-[#111111] border border-[#333333] text-white px-4 py-3.5 rounded-xl outline-none transition-colors text-[0.9rem] resize-none"></textarea>
                  <button type="submit" disabled={supportStatus === 'SUBMITTING'} className="w-full bg-white text-black py-3.5 rounded-xl font-black mt-2 hover:bg-[#e0e0e0] transition-colors disabled:opacity-50 outline-none">
                    {supportStatus === 'SUBMITTING' ? '...' : currentT.supp_btn}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <header className="w-full max-w-[1000px] flex items-center justify-between px-6 py-8 border-b border-[#1c1c1c]">
        <div className="flex items-center gap-1.5">
        <img src="/logo.png" alt="Movyra" className="h-8 w-auto" onError={(e) => e.target.style.display = 'none'} />
        <span className="font-black text-[1.5rem] tracking-tighter ml-[-5px]">ovyra Careers</span>
        </div>
        
        {/* LANGUAGE SELECTOR */}
        <div className="relative" ref={langDropdownRef}>
          <button 
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            className="flex items-center gap-2 text-[#888888] hover:text-white transition-colors outline-none text-[0.85rem] font-bold"
          >
            {languageOptions.find(opt => opt.code === lang)?.label || 'Language'}
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ${isLangMenuOpen ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
          <AnimatePresence>
            {isLangMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
                className="absolute right-0 mt-4 w-48 bg-[#0a0a0a] border border-[#222222] rounded-2xl shadow-2xl overflow-hidden flex flex-col z-50 max-h-[60vh] overflow-y-auto"
              >
                {languageOptions.map((option) => (
                  <button 
                    key={option.code}
                    onClick={() => { setLang(option.code); setIsLangMenuOpen(false); }}
                    className={`px-4 py-3 text-left hover:bg-[#111111] transition-colors ${lang === option.code ? 'text-white font-black' : 'text-[#888888] font-bold'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="w-full max-w-[900px] px-6 py-12 flex-1">
        
        {submissionStatus === 'SUCCESS' ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center text-center py-20">
            <div className="w-20 h-20 border-2 border-white rounded-full flex items-center justify-center mb-6">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h1 className="text-[2.5rem] font-black tracking-tight mb-4">Application Received</h1>
            <p className="text-[#888888] text-[1.1rem] max-w-[400px]">Your professional profile has been securely logged. Our assessment systems will process your data shortly.</p>
          </motion.div>
        ) : (
          <>
            {/* HERO SECTION */}
            <div className="mb-16 text-center">
              <h1 className="text-[2.5rem] md:text-[4rem] font-black tracking-tighter leading-[1.1] mb-6">{currentT.title}</h1>
              <p className="text-[#aaaaaa] text-[1.1rem] max-w-[600px] mx-auto">{currentT.sub}</p>
            </div>

            {/* SECTION 1: INTERACTIVE DEPARTMENTS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-20">
              {departments.map((dept, index) => (
                 <motion.button 
                    key={dept.id} 
                    onClick={() => handleDepartmentClick(dept.mapTo)}
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: index * 0.1 }}
                    className="bg-[#0a0a0a] border border-[#1c1c1c] p-8 rounded-[2rem] flex flex-col items-center text-center hover:bg-[#111111] hover:border-white transition-all outline-none"
                 >
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2.5, delay: index * 0.2 }} className="mb-4 text-white">
                        {dept.icon}
                    </motion.div>
                    <h3 className="font-bold text-[1.1rem] mb-1">{dept.name}</h3>
                    <p className="text-[#888888] text-[0.85rem]">{dept.desc}</p>
                 </motion.button>
              ))}
            </div>

            {/* SECTION 2: CULTURE */}
            <div className="mb-20">
               <h2 className="text-[2rem] font-black tracking-tight mb-8 text-center">{currentT.culture}</h2>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="border border-[#222222] p-6 rounded-2xl bg-[#050505]">
                     <h3 className="font-bold text-[1.2rem] mb-2">{currentT.cult1}</h3>
                     <p className="text-[#888888] text-[0.9rem]">{currentT.cult1_d}</p>
                  </div>
                  <div className="border border-[#222222] p-6 rounded-2xl bg-[#050505]">
                     <h3 className="font-bold text-[1.2rem] mb-2">{currentT.cult2}</h3>
                     <p className="text-[#888888] text-[0.9rem]">{currentT.cult2_d}</p>
                  </div>
                  <div className="border border-[#222222] p-6 rounded-2xl bg-[#050505]">
                     <h3 className="font-bold text-[1.2rem] mb-2">{currentT.cult3}</h3>
                     <p className="text-[#888888] text-[0.9rem]">{currentT.cult3_d}</p>
                  </div>
               </div>
            </div>

            {/* SECTION 3: PERKS */}
            <div className="mb-20">
               <h2 className="text-[2rem] font-black tracking-tight mb-8 text-center">{currentT.perks}</h2>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="border border-[#222222] p-6 rounded-2xl bg-[#050505]">
                     <h3 className="font-bold text-[1.2rem] mb-2">{currentT.perk1}</h3>
                     <p className="text-[#888888] text-[0.9rem]">{currentT.perk1_d}</p>
                  </div>
                  <div className="border border-[#222222] p-6 rounded-2xl bg-[#050505]">
                     <h3 className="font-bold text-[1.2rem] mb-2">{currentT.perk2}</h3>
                     <p className="text-[#888888] text-[0.9rem]">{currentT.perk2_d}</p>
                  </div>
                  <div className="border border-[#222222] p-6 rounded-2xl bg-[#050505]">
                     <h3 className="font-bold text-[1.2rem] mb-2">{currentT.perk3}</h3>
                     <p className="text-[#888888] text-[0.9rem]">{currentT.perk3_d}</p>
                  </div>
               </div>
            </div>

            {/* SECTION 4: HIRING PROCESS TIMELINE */}
            <div className="mb-20 bg-[#111111] border border-[#222222] rounded-[2rem] p-8 md:p-12">
               <h2 className="text-[2rem] font-black tracking-tight mb-8 text-center">{currentT.process}</h2>
               <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex flex-col items-center text-center">
                     <div className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center font-black mb-4">1</div>
                     <span className="font-bold text-[0.9rem]">{currentT.proc1}</span>
                  </div>
                  <div className="hidden md:block flex-1 h-[2px] bg-[#333333] mt-[-20px]"></div>
                  <div className="flex flex-col items-center text-center">
                     <div className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center font-black mb-4">2</div>
                     <span className="font-bold text-[0.9rem]">{currentT.proc2}</span>
                  </div>
                  <div className="hidden md:block flex-1 h-[2px] bg-[#333333] mt-[-20px]"></div>
                  <div className="flex flex-col items-center text-center">
                     <div className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center font-black mb-4">3</div>
                     <span className="font-bold text-[0.9rem]">{currentT.proc3}</span>
                  </div>
                  <div className="hidden md:block flex-1 h-[2px] bg-[#333333] mt-[-20px]"></div>
                  <div className="flex flex-col items-center text-center">
                     <div className="w-12 h-12 bg-[#00ff88] text-black rounded-full flex items-center justify-center font-black mb-4">4</div>
                     <span className="font-bold text-[0.9rem]">{currentT.proc4}</span>
                  </div>
               </div>
            </div>

            {/* SECTION 5: FAQs */}
            <div className="mb-20">
               <h2 className="text-[2rem] font-black tracking-tight mb-8 text-center">{currentT.faq}</h2>
               <div className="flex flex-col gap-4">
                  <div className="border border-[#222222] p-6 rounded-2xl bg-[#050505]">
                     <h3 className="font-bold text-[1.1rem] mb-2">{currentT.faq1}</h3>
                     <p className="text-[#888888] text-[0.9rem]">{currentT.faq1_a}</p>
                  </div>
                  <div className="border border-[#222222] p-6 rounded-2xl bg-[#050505]">
                     <h3 className="font-bold text-[1.1rem] mb-2">{currentT.faq2}</h3>
                     <p className="text-[#888888] text-[0.9rem]">{currentT.faq2_a}</p>
                  </div>
                  <div className="border border-[#222222] p-6 rounded-2xl bg-[#050505]">
                     <h3 className="font-bold text-[1.1rem] mb-2">{currentT.faq3}</h3>
                     <p className="text-[#888888] text-[0.9rem]">{currentT.faq3_a}</p>
                  </div>
               </div>
            </div>

            {/* SECTION 6: APPLICATION FORM MODULE */}
            <div id="application-form" className="pt-10 scroll-mt-20">
              
              {/* PROGRESS INDICATOR */}
              <div className="flex items-center justify-between mb-12">
                {[1, 2, 3, 4].map((stepNumber) => (
                  <div key={stepNumber} className="flex-1 flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[0.85rem] transition-colors ${currentStep >= stepNumber ? 'bg-white text-black' : 'bg-[#111111] text-[#666666] border border-[#333333]'}`}>
                      {stepNumber}
                    </div>
                    {stepNumber < 4 && (
                      <div className={`h-[2px] flex-1 mx-2 rounded-full transition-colors ${currentStep > stepNumber ? 'bg-white' : 'bg-[#222222]'}`}></div>
                    )}
                  </div>
                ))}
              </div>

              <form onSubmit={currentStep === 4 ? handleFinalSubmit : handleNext} className="bg-[#050505] border border-[#1c1c1c] p-8 md:p-12 rounded-[2rem] shadow-2xl">
                
                {/* STEP 1: BASIC INFORMATION */}
                {currentStep === 1 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <h2 className="text-[1.5rem] font-black mb-8 border-b border-[#1c1c1c] pb-4">Professional Profile</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-[0.75rem] font-bold uppercase tracking-widest text-[#888888] mb-2">Legal Full Name</label>
                        <input required type="text" value={formData.fullName} onChange={(e)=>setFormData({...formData, fullName: e.target.value})} className="w-full bg-[#000000] border border-[#333333] text-white px-5 py-4 rounded-xl outline-none focus:border-white transition-colors" />
                      </div>
                      <div>
                        <label className="block text-[0.75rem] font-bold uppercase tracking-widest text-[#888888] mb-2">Contact Number</label>
                        <input required type="tel" value={formData.phone} onChange={(e)=>setFormData({...formData, phone: e.target.value})} className="w-full bg-[#000000] border border-[#333333] text-white px-5 py-4 rounded-xl outline-none focus:border-white transition-colors" />
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-[0.75rem] font-bold uppercase tracking-widest text-[#888888] mb-2">Email Address</label>
                      <input required type="email" value={formData.email} onChange={(e)=>setFormData({...formData, email: e.target.value})} className="w-full bg-[#000000] border border-[#333333] text-white px-5 py-4 rounded-xl outline-none focus:border-white transition-colors" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-[0.75rem] font-bold uppercase tracking-widest text-[#888888] mb-2">LinkedIn URL</label>
                        <input required type="url" value={formData.linkedin} onChange={(e)=>setFormData({...formData, linkedin: e.target.value})} className="w-full bg-[#000000] border border-[#333333] text-white px-5 py-4 rounded-xl outline-none focus:border-white transition-colors" placeholder="https://linkedin.com/in/..." />
                      </div>
                      <div>
                        <label className="block text-[0.75rem] font-bold uppercase tracking-widest text-[#888888] mb-2">GitHub / Portfolio URL</label>
                        <input type="url" value={formData.github} onChange={(e)=>setFormData({...formData, github: e.target.value})} className="w-full bg-[#000000] border border-[#333333] text-white px-5 py-4 rounded-xl outline-none focus:border-white transition-colors" placeholder="Optional" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: ROLE SELECTION */}
                {currentStep === 2 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <h2 className="text-[1.5rem] font-black mb-8 border-b border-[#1c1c1c] pb-4">Position Allocation</h2>
                    
                    <div className="mb-6">
                      <label className="block text-[0.75rem] font-bold uppercase tracking-widest text-[#888888] mb-2">Target Department</label>
                      <div className="relative">
                        <select required value={formData.roleCategory} onChange={(e)=>setFormData({...formData, roleCategory: e.target.value, specificRole: ''})} className="w-full bg-[#000000] border border-[#333333] text-white px-5 py-4 rounded-xl outline-none focus:border-white transition-colors appearance-none cursor-pointer">
                          <option value="" disabled>Select Department</option>
                          <option value="Engineering & Tech">Engineering & Architecture</option>
                          <option value="AI & Data">Artificial Intelligence & Prompt Engineering</option>
                          <option value="Operations & Logistics">Operations & Fleet Logistics</option>
                          <option value="Marketing & Sales">Growth, Marketing & Business Development</option>
                        </select>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </div>
                    </div>

                    {formData.roleCategory && (
                      <div className="mb-6">
                        <label className="block text-[0.75rem] font-bold uppercase tracking-widest text-[#888888] mb-2">Specific Role / Inquiry</label>
                        <div className="relative">
                          <select required value={formData.specificRole} onChange={(e)=>setFormData({...formData, specificRole: e.target.value})} className="w-full bg-[#000000] border border-[#333333] text-white px-5 py-4 rounded-xl outline-none focus:border-white transition-colors appearance-none cursor-pointer">
                            <option value="" disabled>Select Role</option>
                            {formData.roleCategory === 'Engineering & Tech' && (
                              <>
                                <option value="Flutter Developer">Flutter Mobile Architect</option>
                                <option value="Backend Developer">Backend Systems Engineer</option>
                                <option value="Full Stack Developer">Full Stack Engineer</option>
                                <option value="General Inquiry">General Technical Inquiry</option>
                              </>
                            )}
                            {formData.roleCategory === 'AI & Data' && (
                              <>
                                <option value="AI Engineer">Artificial Intelligence Engineer</option>
                                <option value="Prompt Engineer">LLM Prompt Architect</option>
                                <option value="General Inquiry">Data Science Inquiry</option>
                              </>
                            )}
                            {formData.roleCategory === 'Operations & Logistics' && (
                              <>
                                <option value="Logistics Manager">Logistics Flow Controller</option>
                                <option value="Vendor Onboarding">Vendor Partnership Executive</option>
                                <option value="Customer Success">Customer Success Analyst</option>
                                <option value="General Inquiry">Support & Ops Inquiry</option>
                              </>
                            )}
                            {formData.roleCategory === 'Marketing & Sales' && (
                              <>
                                <option value="Growth Marketer">Performance Growth Strategist</option>
                                <option value="B2B Sales">B2B Sales & Acquisition</option>
                                <option value="Content Strategist">Digital Content Architect</option>
                                <option value="General Inquiry">Business Inquiry</option>
                              </>
                            )}
                          </select>
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-[0.75rem] font-bold uppercase tracking-widest text-[#888888] mb-2">Engagement Type</label>
                        <div className="relative">
                          <select required value={formData.employmentType} onChange={(e)=>setFormData({...formData, employmentType: e.target.value})} className="w-full bg-[#000000] border border-[#333333] text-white px-5 py-4 rounded-xl outline-none focus:border-white transition-colors appearance-none cursor-pointer">
                            <option value="Full-Time">Full-Time Commitment</option>
                            <option value="Internship (Performance Based)">Internship (Performance Evaluated)</option>
                            <option value="Contract / Freelance">Contract / Project Basis</option>
                            <option value="General Inquiry">Just asking a question</option>
                          </select>
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none"><polyline points="6 9 12 15 18 9"></polyline></svg>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[0.75rem] font-bold uppercase tracking-widest text-[#888888] mb-2">Expected Compensation (INR)</label>
                        <input required type="text" value={formData.expectedSalary} onChange={(e)=>setFormData({...formData, expectedSalary: e.target.value})} className="w-full bg-[#000000] border border-[#333333] text-white px-5 py-4 rounded-xl outline-none focus:border-white transition-colors" placeholder="e.g. 50,000/month or N/A" />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: STARTUP MINDSET EVALUATION */}
                {currentStep === 3 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <h2 className="text-[1.5rem] font-black mb-8 border-b border-[#1c1c1c] pb-4">Startup Philosophy & Execution</h2>
                    
                    <div className="bg-[#111111] p-6 rounded-2xl border border-[#222222] mb-8">
                      <p className="text-[#aaaaaa] text-[0.85rem] uppercase tracking-widest font-bold mb-2">Evaluation Note</p>
                      <p className="text-white text-[0.95rem] leading-relaxed">Movyra operates in an intense, zero-to-one startup environment. We prioritize extreme ownership, rapid execution, and problem-solving velocity over standard credentials.</p>
                    </div>

                    <div className="mb-8">
                      <label className="block text-[0.95rem] font-bold text-white mb-3 leading-snug">If you were acting as the founder and had only ₹10,000 for marketing, what exactly would you do in the next 30 days to acquire 100 active users in a new city?</label>
                      <textarea required rows="5" value={formData.budgetStrategy} onChange={(e)=>setFormData({...formData, budgetStrategy: e.target.value})} className="w-full bg-[#000000] border border-[#333333] text-white px-5 py-4 rounded-xl outline-none focus:border-white transition-colors resize-none text-[0.9rem] leading-relaxed" placeholder="Detail your exact execution strategy, channels, and operational methodology..."></textarea>
                    </div>

                    <div className="mb-6">
                      <label className="block text-[0.95rem] font-bold text-white mb-3 leading-snug">Why are you actively seeking an early-stage startup environment where infrastructure is minimal and responsibilities are constantly shifting?</label>
                      <textarea required rows="4" value={formData.startupReason} onChange={(e)=>setFormData({...formData, startupReason: e.target.value})} className="w-full bg-[#000000] border border-[#333333] text-white px-5 py-4 rounded-xl outline-none focus:border-white transition-colors resize-none text-[0.9rem] leading-relaxed" placeholder="Explain your professional motivations..."></textarea>
                    </div>
                  </motion.div>
                )}

                {/* STEP 4: ROLE SPECIFIC EVALUATION */}
                {currentStep === 4 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <h2 className="text-[1.5rem] font-black mb-8 border-b border-[#1c1c1c] pb-4">Technical Assessment: {formData.roleCategory}</h2>
                    
                    {formData.specificRole === 'General Inquiry' ? (
                       <div className="mb-8">
                          <label className="block text-[0.95rem] font-bold text-white mb-3 leading-snug">Please detail your specific inquiry or request regarding this department.</label>
                          <textarea required rows="6" value={formData.techArch} onChange={(e)=>setFormData({...formData, techArch: e.target.value})} className="w-full bg-[#000000] border border-[#333333] text-white px-5 py-4 rounded-xl outline-none focus:border-white transition-colors resize-none text-[0.9rem] leading-relaxed"></textarea>
                       </div>
                    ) : (
                      <>
                        {formData.roleCategory === 'Engineering & Tech' && (
                          <>
                            <div className="mb-8">
                              <label className="block text-[0.95rem] font-bold text-white mb-3 leading-snug">How would you architect a real-time logistics system (similar to Swiggy/Uber) to identify and assign the absolute nearest delivery partner to a vendor while handling 10,000 concurrent orders?</label>
                              <textarea required rows="5" value={formData.nearestPartner} onChange={(e)=>setFormData({...formData, nearestPartner: e.target.value})} className="w-full bg-[#000000] border border-[#333333] text-white px-5 py-4 rounded-xl outline-none focus:border-white transition-colors resize-none text-[0.9rem] leading-relaxed"></textarea>
                            </div>
                            <div className="mb-6">
                              <label className="block text-[0.95rem] font-bold text-white mb-3 leading-snug">Describe your preferred backend schema and real-time database architecture for live GPS coordinate tracking.</label>
                              <textarea required rows="4" value={formData.techArch} onChange={(e)=>setFormData({...formData, techArch: e.target.value})} className="w-full bg-[#000000] border border-[#333333] text-white px-5 py-4 rounded-xl outline-none focus:border-white transition-colors resize-none text-[0.9rem] leading-relaxed"></textarea>
                            </div>
                          </>
                        )}

                        {formData.roleCategory === 'AI & Data' && (
                          <>
                            <div className="mb-8">
                              <label className="block text-[0.95rem] font-bold text-white mb-3 leading-snug">Write an optimized, production-grade system prompt designed to convert a standard LLM into a highly effective, empathetic Customer Support agent for a logistics platform facing severe delivery delays.</label>
                              <textarea required rows="5" value={formData.aiPrompt} onChange={(e)=>setFormData({...formData, aiPrompt: e.target.value})} className="w-full bg-[#000000] border border-[#333333] text-white px-5 py-4 rounded-xl outline-none focus:border-white transition-colors resize-none text-[0.9rem] leading-relaxed"></textarea>
                            </div>
                            <div className="mb-6">
                              <label className="block text-[0.95rem] font-bold text-white mb-3 leading-snug">Explain how you would architect a RAG (Retrieval-Augmented Generation) pipeline while strictly mitigating model hallucination.</label>
                              <textarea required rows="4" value={formData.aiHallucination} onChange={(e)=>setFormData({...formData, aiHallucination: e.target.value})} className="w-full bg-[#000000] border border-[#333333] text-white px-5 py-4 rounded-xl outline-none focus:border-white transition-colors resize-none text-[0.9rem] leading-relaxed"></textarea>
                            </div>
                          </>
                        )}

                        {formData.roleCategory === 'Marketing & Sales' && (
                          <div className="mb-8">
                            <label className="block text-[0.95rem] font-bold text-white mb-3 leading-snug">Draft a specific, actionable B2B cold acquisition strategy to convince 50 local grocery store owners to bypass existing aggregators and route their inventory exclusively through Movyra.</label>
                            <textarea required rows="6" value={formData.marketingAcquisition} onChange={(e)=>setFormData({...formData, marketingAcquisition: e.target.value})} className="w-full bg-[#000000] border border-[#333333] text-white px-5 py-4 rounded-xl outline-none focus:border-white transition-colors resize-none text-[0.9rem] leading-relaxed"></textarea>
                          </div>
                        )}

                        {formData.roleCategory === 'Operations & Logistics' && (
                          <>
                            <div className="mb-8">
                              <label className="block text-[0.95rem] font-bold text-white mb-3 leading-snug">During a severe thunderstorm, active orders spike by 300% while online delivery partners drop by 40%. Outline your exact operational protocol to stabilize the grid and manage customer expectations.</label>
                              <textarea required rows="5" value={formData.opsPeakHours} onChange={(e)=>setFormData({...formData, opsPeakHours: e.target.value})} className="w-full bg-[#000000] border border-[#333333] text-white px-5 py-4 rounded-xl outline-none focus:border-white transition-colors resize-none text-[0.9rem] leading-relaxed"></textarea>
                            </div>
                            <div className="mb-6">
                              <label className="block text-[0.95rem] font-bold text-white mb-3 leading-snug">How would you systematically identify, investigate, and penalize delivery partners utilizing GPS spoofing applications to artificially inflate earning metrics?</label>
                              <textarea required rows="4" value={formData.opsFraud} onChange={(e)=>setFormData({...formData, opsFraud: e.target.value})} className="w-full bg-[#000000] border border-[#333333] text-white px-5 py-4 rounded-xl outline-none focus:border-white transition-colors resize-none text-[0.9rem] leading-relaxed"></textarea>
                            </div>
                          </>
                        )}
                      </>
                    )}
                    
                    {formData.roleCategory === '' && (
                      <div className="w-full p-8 text-center text-[#888888] border border-[#333333] border-dashed rounded-xl">
                        Please return to Step 2 and designate a specific Role Category to generate the relevant technical assessment block.
                      </div>
                    )}
                  </motion.div>
                )}

                {/* FORM NAVIGATION CONTROLS */}
                <div className="mt-12 flex gap-4 pt-8 border-t border-[#1c1c1c]">
                  {currentStep > 1 && (
                    <button type="button" onClick={handleBack} disabled={isSubmitting} className="px-8 py-4 bg-transparent border border-[#333333] text-white font-bold rounded-xl hover:border-white transition-colors disabled:opacity-50">
                      {currentT.back}
                    </button>
                  )}
                  
                  <button type="submit" disabled={isSubmitting || (currentStep === 4 && formData.roleCategory === '')} className="flex-1 bg-white text-black font-black text-[1.1rem] py-4 rounded-xl hover:bg-[#e0e0e0] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Transmitting Data...
                      </>
                    ) : currentStep === 4 ? (
                      currentT.submit
                    ) : (
                      currentT.next
                    )}
                  </button>
                </div>

              </form>
            </div>
          </>
        )}
      </main>

    </div>
  );
}