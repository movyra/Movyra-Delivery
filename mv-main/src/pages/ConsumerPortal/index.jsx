import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Link } from 'react-router-dom';

export default function ConsumerPortal() {
  const [formData, setFormData] = useState({ name: '', phone: '', city: '' });
  const [status, setStatus] = useState('IDLE'); // IDLE, LOADING, SUCCESS, ERROR
  const [lang, setLang] = useState('en');

  // 13-Language Dictionary for Consumer Portal
  const t = {
    en: { title: "Early Access", subtitle: "Join the consumer waitlist for priority access to next-generation urban logistics and seamless ordering.", name: "Full Name", phone: "Phone Number", city: "Delivery City", submit: "Request Access", success: "Access Requested Successfully", back: "Return to Hub" },
    hi: { title: "प्रारंभिक पहुँच", subtitle: "प्राथमिकता के लिए उपभोक्ता प्रतीक्षा सूची में शामिल हों।", name: "पूरा नाम", phone: "फ़ोन नंबर", city: "शहर", submit: "पहुँच का अनुरोध करें", success: "अनुरोध सफलतापूर्वक भेजा गया", back: "वापस जाएं" },
    hinglish: { title: "Early Access", subtitle: "Priority delivery access ke liye waitlist join karein.", name: "Full Name", phone: "Phone Number", city: "City", submit: "Request Access", success: "Request Sent Successfully", back: "Go Back" },
    mr: { title: "लवकर प्रवेश", subtitle: "प्राधान्य प्रवेशासाठी प्रतीक्षा यादीत सामील व्हा.", name: "पूर्ण नाव", phone: "फोन नंबर", city: "शहर", submit: "प्रवेशाची विनंती करा", success: "विनंती यशस्वी", back: "मागे जा" },
    gu: { title: "વહેલો પ્રવેશ", subtitle: "પ્રાથમિકતા ઍક્સેસ માટે ગ્રાહક વેઇટલિસ્ટમાં જોડાઓ.", name: "પૂરું નામ", phone: "ફોન નંબર", city: "શહેર", submit: "વિનંતી કરો", success: "વિનંતી સફળ", back: "પાછા જાઓ" },
    te: { title: "ప్రారంభ యాక్సెస్", subtitle: "ప్రాధాన్యత యాక్సెస్ కోసం వినియోగదారుల వెయిట్‌లిస్ట్‌లో చేరండి.", name: "పూర్తి పేరు", phone: "ఫోన్ నంబర్", city: "నగరం", submit: "యాక్సెస్ అభ్యర్థించండి", success: "అభ్యర్థన విజయవంతమైంది", back: "వెనక్కి వెళ్ళు" },
    ta: { title: "ஆரம்ப அணுகல்", subtitle: "முன்னுரிமை அணுகலுக்கு நுகர்வோர் காத்திருப்பு பட்டியலில் சேரவும்.", name: "முழு பெயர்", phone: "தொலைபேசி எண்", city: "நகரம்", submit: "அணுகலைக் கோரு", success: "கோரிக்கை வெற்றிகரமானது", back: "திரும்பி செல்" },
    pa: { title: "ਸ਼ੁਰੂਆਤੀ ਪਹੁੰਚ", subtitle: "ਪਹਿਲ ਦੇ ਅਧਾਰ 'ਤੇ ਪਹੁੰਚ ਲਈ ਖਪਤਕਾਰ ਉਡੀਕ ਸੂਚੀ ਵਿੱਚ ਸ਼ਾਮਲ ਹੋਵੋ।", name: "ਪੂਰਾ ਨਾਮ", phone: "ਫੋਨ ਨੰਬਰ", city: "ਸ਼ਹਿਰ", submit: "ਪਹੁੰਚ ਦੀ ਬੇਨਤੀ ਕਰੋ", success: "ਬੇਨਤੀ ਸਫਲ ਰਹੀ", back: "ਵਾਪਸ ਜਾਓ" },
    bho: { title: "शुरुआती पहुँच", subtitle: "प्राथमिकता खातिर उपभोक्ता वेटलिस्ट में शामिल होखीं।", name: "पूरा नाम", phone: "फोन नंबर", city: "शहर", submit: "एक्सेस मांगी", success: "अनुरोध सफल भइल", back: "पीछे जाईं" },
    ar: { title: "الوصول المبكر", subtitle: "انضم إلى قائمة انتظار المستهلكين للحصول على أولوية الوصول.", name: "الاسم الكامل", phone: "رقم الهاتف", city: "المدينة", submit: "طلب الوصول", success: "تم إرسال الطلب بنجاح", back: "العودة" },
    es: { title: "Acceso Anticipado", subtitle: "Únase a la lista de espera de consumidores para tener acceso prioritario.", name: "Nombre Completo", phone: "Número de Teléfono", city: "Ciudad", submit: "Solicitar Acceso", success: "Solicitud enviada con éxito", back: "Volver" },
    fr: { title: "Accès Anticipé", subtitle: "Rejoignez la liste d'attente des consommateurs pour un accès prioritaire.", name: "Nom Complet", phone: "Numéro de Téléphone", city: "Ville", submit: "Demander l'Accès", success: "Demande envoyée avec succès", back: "Retour" },
    de: { title: "Vorabzugang", subtitle: "Treten Sie der Warteliste für Verbraucher bei, um vorrangigen Zugang zu erhalten.", name: "Vollständiger Name", phone: "Telefonnummer", city: "Stadt", submit: "Zugang anfordern", success: "Anfrage erfolgreich gesendet", back: "Zurück" }
  };

  const cur = t[lang] || t['en'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('LOADING');
    try {
      await addDoc(collection(db, 'pre_registrations'), {
        name: formData.name,
        phone: formData.phone,
        city: formData.city,
        role: 'Consumer',
        kycStatus: 'pending',
        createdAt: serverTimestamp(),
        source: 'consumer_portal'
      });
      setStatus('SUCCESS');
      setFormData({ name: '', phone: '', city: '' });
    } catch (error) {
      console.error("Database connection failed:", error);
      setStatus('ERROR');
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      <style>
        {`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          .animate-fade { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .stagger-1 { animation-delay: 0.1s; }
          .stagger-2 { animation-delay: 0.2s; }
        `}
      </style>

      {/* Language Selector */}
      <div className="absolute top-6 right-6 md:top-10 md:right-10 z-50">
        <select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-black border border-[#333] text-white px-4 py-2 rounded-full outline-none cursor-pointer hover:border-white transition-colors text-[0.8rem] uppercase tracking-widest font-bold">
          <option value="en">EN</option><option value="hi">HI</option><option value="hinglish">HIN</option>
          <option value="mr">MR</option><option value="gu">GU</option><option value="te">TE</option>
          <option value="ta">TA</option><option value="pa">PA</option><option value="bho">BHO</option>
          <option value="ar">AR</option><option value="es">ES</option><option value="fr">FR</option><option value="de">DE</option>
        </select>
      </div>

      <div className="w-full max-w-[500px] z-10 flex flex-col items-center">
        <Link to="/" className="mb-12 opacity-0 animate-fade">
          <img src="/logo.png" alt="Movyra" className="h-10" onError={(e) => e.target.style.display='none'} />
        </Link>

        <div className="text-center mb-10 opacity-0 animate-fade stagger-1">
          <h1 className="text-[2.5rem] font-black leading-tight tracking-tighter mb-4">{cur.title}</h1>
          <p className="text-[#888] text-[0.95rem] leading-relaxed max-w-[400px] mx-auto">{cur.subtitle}</p>
        </div>

        <div className="w-full bg-[#050505] border border-[#222] p-8 rounded-[24px] opacity-0 animate-fade stagger-2 shadow-[0_0_80px_rgba(255,255,255,0.03)]">
          {status === 'SUCCESS' ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center mx-auto mb-6">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h3 className="font-black text-[1.2rem] mb-6">{cur.success}</h3>
              <button onClick={() => setStatus('IDLE')} className="border border-[#333] text-white px-6 py-2 rounded-full font-bold hover:bg-white hover:text-black transition-colors text-[0.85rem] uppercase tracking-widest">
                {cur.back}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <input 
                type="text" 
                placeholder={cur.name}
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required 
                className="w-full bg-black border border-[#333] text-white px-5 py-4 rounded-xl outline-none focus:border-white transition-colors text-[0.95rem]"
              />
              <input 
                type="tel" 
                placeholder={cur.phone}
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required 
                className="w-full bg-black border border-[#333] text-white px-5 py-4 rounded-xl outline-none focus:border-white transition-colors text-[0.95rem]"
              />
              <input 
                type="text" 
                placeholder={cur.city}
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                required 
                className="w-full bg-black border border-[#333] text-white px-5 py-4 rounded-xl outline-none focus:border-white transition-colors text-[0.95rem]"
              />
              <button 
                type="submit" 
                disabled={status === 'LOADING'}
                className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-[#e0e0e0] transition-colors mt-2 disabled:opacity-50 text-[0.95rem] uppercase tracking-widest"
              >
                {status === 'LOADING' ? '...' : cur.submit}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}