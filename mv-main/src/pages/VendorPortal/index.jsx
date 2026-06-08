import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../../firebaseConfig';
import { Link } from 'react-router-dom';
import VendorDashboard from './components/VendorDashboard';

/**
 * ============================================================================
 * COMPONENT: VENDOR PORTAL ROUTER (mv-main)
 * Purpose: Acts as the public module exporter. Conditionally renders the 
 * secure VendorDashboard for authenticated users, or the B2B Onboarding Form 
 * for guest users.
 * Structural Constraint: Strict zero emoji vector configuration. Existing
 * codebase strictly preserved.
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// PRESERVED EXISTING CODE: B2B ONBOARDING FORM
// ----------------------------------------------------------------------------
function VendorOnboarding() {
  const [formData, setFormData] = useState({
    businessName: '',
    name: '',
    email: '',
    phone: '',
    city: '',
    role: '',
    vehicle: ''
  });
  const [status, setStatus] = useState('IDLE'); // IDLE, LOADING, SUCCESS, ERROR
  const [lang, setLang] = useState('en');

  // 13-Language Dictionary for B2B Vendor Portal
  const t = {
    en: { title: "Partner Onboarding", subtitle: "Join the Movyra enterprise grid. List your business, restaurant, or fleet for seamless logistics integration.", bName: "Business / Entity Name", owner: "Contact Person Name", email: "Business Email", phone: "Phone Number", city: "Operating City", role: "Select Partner Category", roles: ["Restaurant / Cloud Kitchen", "FMCG Vendor", "Q-Commerce Partner", "Enterprise Fleet Owner", "Independent Courier"], vehicle: "Vehicle Class", vehicles: ["2-Wheeler (Bike/Scooter)", "3-Wheeler (EV/Auto)", "4-Wheeler (Mini Truck)", "Heavy Commercial"], submit: "Submit Application", success: "Application Received", successSub: "Our enterprise team will review your application and initiate the KYC verification process shortly.", back: "Return to Hub" },
    hi: { title: "पार्टनर ऑनबोर्डिंग", subtitle: "मूवीरा एंटरप्राइज ग्रिड से जुड़ें। अपने व्यवसाय या फ्लीट को सूचीबद्ध करें।", bName: "व्यवसाय का नाम", owner: "संपर्क व्यक्ति का नाम", email: "ईमेल", phone: "फ़ोन नंबर", city: "शहर", role: "श्रेणी चुनें", roles: ["रेस्टोरेंट / क्लाउड किचन", "FMCG वेंडर", "Q-कॉमर्स पार्टनर", "एंटरप्राइज फ्लीट मालिक", "स्वतंत्र कूरियर"], vehicle: "वाहन श्रेणी", vehicles: ["2-पहिया", "3-पहिया", "4-पहिया", "भारी वाणिज्यिक"], submit: "आवेदन जमा करें", success: "आवेदन प्राप्त हुआ", successSub: "हमारी टीम जल्द ही आपसे संपर्क करेगी।", back: "वापस जाएं" },
    hinglish: { title: "Partner Onboarding", subtitle: "Movyra grid join karein. Apne business ya fleet ko list karein.", bName: "Business Name", owner: "Owner Name", email: "Business Email", phone: "Phone Number", city: "City", role: "Select Category", roles: ["Restaurant / Cloud Kitchen", "FMCG Vendor", "Q-Commerce Partner", "Enterprise Fleet Owner", "Independent Courier"], vehicle: "Vehicle Type", vehicles: ["2-Wheeler", "3-Wheeler", "4-Wheeler", "Heavy Truck"], submit: "Submit Application", success: "Application Received", successSub: "Hamari team KYC verification ke liye jaldi contact karegi.", back: "Go Back" },
    mr: { title: "भागीदार ऑनबोर्डिंग", subtitle: "Movyra ग्रिडमध्ये सामील व्हा. तुमचा व्यवसाय नोंदवा.", bName: "व्यवसायाचे नाव", owner: "मालकाचे नाव", email: "ईमेल", phone: "फोन नंबर", city: "शहर", role: "श्रेणी निवडा", roles: ["रेस्टॉरंट / क्लाउड किचन", "FMCG विक्रेता", "Q-कॉमर्स भागीदार", "एंटरप्राइझ फ्लीट मालक", "स्वतंत्र कुरिअर"], vehicle: "वाहन प्रकार", vehicles: ["दुचाकी", "तीन चाकी", "चार चाकी", "जड वाहन"], submit: "अर्ज सबमिट करा", success: "अर्ज प्राप्त झाला", successSub: "आमची टीम लवकरच संपर्क साधेल.", back: "मागे जा" },
    gu: { title: "ભાગીદાર ઑનબોર્ડિંગ", subtitle: "તમારો વ્યવસાય અથવા ફ્લીટ રજીસ્ટર કરો.", bName: "વ્યવસાયનું નામ", owner: "માલિકનું નામ", email: "ઈમેલ", phone: "ફોન નંબર", city: "શહેર", role: "શ્રેણી પસંદ કરો", roles: ["રેસ્ટોરન્ટ / ક્લાઉડ કિચન", "FMCG વિક્રેતા", "Q-કોમર્સ પાર્ટનર", "એન્ટરપ્રાઇઝ ફ્લીટ માલિક", "સ્વતંત્ર કુરિયર"], vehicle: "વાહન પ્રકાર", vehicles: ["2-વ્હીલર", "3-વ્હીલર", "4-વ્હીલર", "હેવી ટ્રક"], submit: "અરજી સબમિટ કરો", success: "અરજી મળી ગઈ", successSub: "અમારી ટીમ ટૂંક સમયમાં તમારો સંપર્ક કરશે.", back: "પાછા જાઓ" },
    te: { title: "భాగస్వామి ఆన్‌బోర్డింగ్", subtitle: "Movyra ఎంటర్‌ప్రైజ్ గ్రిడ్‌లో చేరండి.", bName: "వ్యాపారం పేరు", owner: "యజమాని పేరు", email: "ఇమెయిల్", phone: "ఫోన్ నంబర్", city: "నగరం", role: "కేటగిరీ ఎంచుకోండి", roles: ["రెస్టారెంట్", "FMCG వెండర్", "Q-కామర్స్", "ఫ్లీట్ ఓనర్", "కొరియర్"], vehicle: "వాహనం రకం", vehicles: ["2-వీలర్", "3-వీలర్", "4-వీలర్", "హెవీ ట్రక్"], submit: "దరఖాస్తు సమర్పించండి", success: "దరఖాస్తు స్వీకరించబడింది", successSub: "మా బృందం త్వరలో మిమ్మల్ని సంప్రదిస్తుంది.", back: "వెనక్కి వెళ్ళు" },
    ta: { title: "கூட்டாளர் ஆன்போர்டிங்", subtitle: "உங்கள் வணிகம் அல்லது கடற்படையை பதிவு செய்யவும்.", bName: "வணிக பெயர்", owner: "உரிமையாளர் பெயர்", email: "மின்னஞ்சல்", phone: "தொலைபேசி எண்", city: "நகரம்", role: "வகையைத் தேர்ந்தெடுக்கவும்", roles: ["உணவகம்", "FMCG விற்பனையாளர்", "Q-காமர்ஸ்", "கடற்படை உரிமையாளர்", "கூரியர்"], vehicle: "வாகன வகை", vehicles: ["இரு சக்கர வாகனம்", "3 சக்கர வாகனம்", "4 சக்கர வாகனம்", "கனரக டிரக்"], submit: "விண்ணப்பத்தை சமர்ப்பிக்கவும்", success: "விண்ணப்பம் பெறப்பட்டது", successSub: "எங்கள் குழு விரைவில் உங்களை தொடர்பு கொள்ளும்.", back: "திரும்பி செல்" },
    pa: { title: "ਭਾਈਵਾਲ ਆਨਬੋਰਡਿੰਗ", subtitle: "ਆਪਣਾ ਕਾਰੋਬਾਰ ਜਾਂ ਫਲੀਟ ਰਜਿਸਟਰ ਕਰੋ।", bName: "ਕਾਰੋਬਾਰ ਦਾ ਨਾਮ", owner: "ਮਾਲਕ ਦਾ ਨਾਮ", email: "ਈਮੇਲ", phone: "ਫੋਨ ਨੰਬਰ", city: "ਸ਼ਹਿਰ", role: "ਸ਼੍ਰੇਣੀ ਚੁਣੋ", roles: ["ਰੈਸਟੋਰੈਂਟ", "FMCG ਵਿਕਰੇਤਾ", "Q-ਕਾਮਰਸ", "ਫਲੀਟ ਮਾਲਕ", "ਕੋਰੀਅਰ"], vehicle: "ਵਾਹਨ ਦੀ ਕਿਸਮ", vehicles: ["2-ਪਹੀਆ", "3-ਪਹੀਆ", "4-ਪਹੀਆ", "ਭਾਰੀ ਟਰੱਕ"], submit: "ਬਿਨੈਪੱਤਰ ਜਮ੍ਹਾਂ ਕਰੋ", success: "ਬਿਨੈਪੱਤਰ ਪ੍ਰਾਪਤ ਹੋਇਆ", successSub: "ਸਾਡੀ ਟੀਮ ਜਲਦੀ ਹੀ ਤੁਹਾਡੇ ਨਾਲ ਸੰਪਰਕ ਕਰੇਗੀ।", back: "ਵਾਪਸ ਜਾਓ" },
    bho: { title: "पार्टनर ऑनबोर्डिंग", subtitle: "Movyra ग्रिड से जुड़ीं। आपन व्यापार रजिस्टर करीं।", bName: "व्यापार के नाम", owner: "मालिक के नाम", email: "ईमेल", phone: "फोन नंबर", city: "शहर", role: "श्रेणी चुनीं", roles: ["रेस्टोरेंट", "FMCG वेंडर", "Q-कॉमर्स", "फ्लीट मालिक", "कूरियर"], vehicle: "वाहन प्रकार", vehicles: ["2-पहिया", "3-पहिया", "4-पहिया", "भारी ट्रक"], submit: "आवेदन जमा करीं", success: "आवेदन मिल गइल", successSub: "हमनी के टीम जल्दिए रउआ से संपर्क करी।", back: "पीछे जाईं" },
    ar: { title: "تسجيل الشركاء", subtitle: "انضم إلى شبكة Movyra. قم بإدراج عملك أو أسطولك.", bName: "اسم العمل", owner: "اسم المالك", email: "البريد الإلكتروني", phone: "رقم الهاتف", city: "المدينة", role: "اختر الفئة", roles: ["مطعم", "بائع FMCG", "شريك تجارة Q", "مالك أسطول", "ساعي مستقل"], vehicle: "فئة المركبة", vehicles: ["عجلتين", "ثلاث عجلات", "أربع عجلات", "شاحنة ثقيلة"], submit: "تقديم الطلب", success: "تم استلام الطلب", successSub: "سيقوم فريقنا بمراجعة طلبك قريباً.", back: "العودة" },
    es: { title: "Registro de Socios", subtitle: "Únase a la red de Movyra. Registre su negocio o flota.", bName: "Nombre del Negocio", owner: "Nombre del Propietario", email: "Correo Electrónico", phone: "Número de Teléfono", city: "Ciudad", role: "Seleccionar Categoría", roles: ["Restaurante", "Vendedor FMCG", "Socio Q-Commerce", "Propietario de Flota", "Mensajero"], vehicle: "Clase de Vehículo", vehicles: ["2 Ruedas", "3 Ruedas", "4 Ruedas", "Camión Pesado"], submit: "Enviar Solicitud", success: "Solicitud Recibida", successSub: "Nuestro equipo revisará su solicitud en breve.", back: "Volver" },
    fr: { title: "Intégration des Partenaires", subtitle: "Rejoignez le réseau Movyra. Inscrivez votre entreprise.", bName: "Nom de l'Entreprise", owner: "Nom du Propriétaire", email: "E-mail", phone: "Numéro de Téléphone", city: "Ville", role: "Sélectionner la Catégorie", roles: ["Restaurant", "Vendeur FMCG", "Partenaire Q-Commerce", "Propriétaire de Flotte", "Coursier"], vehicle: "Type de Véhicule", vehicles: ["2 Roues", "3 Roues", "4 Roues", "Poids Lourd"], submit: "Soumettre la Demande", success: "Demande Reçue", successSub: "Notre équipe examinera votre demande sous peu.", back: "Retour" },
    de: { title: "Partner-Onboarding", subtitle: "Treten Sie dem Movyra-Netzwerk bei. Registrieren Sie Ihr Unternehmen.", bName: "Firmenname", owner: "Name des Inhabers", email: "E-Mail", phone: "Telefonnummer", city: "Stadt", role: "Kategorie wählen", roles: ["Restaurant", "FMCG-Anbieter", "Q-Commerce-Partner", "Flottenbesitzer", "Kurier"], vehicle: "Fahrzeugklasse", vehicles: ["Zweirad", "Dreirad", "Vierrad", "Schwerer LKW"], submit: "Bewerbung einreichen", success: "Bewerbung erhalten", successSub: "Unser Team wird Ihre Bewerbung in Kürze prüfen.", back: "Zurück" }
  };

  const cur = t[lang] || t['en'];

  // Conditional Logic: Show vehicle selection only if role implies logistics
  const requiresVehicle = formData.role === cur.roles[3] || formData.role === cur.roles[4] || 
                          formData.role.includes('Fleet') || formData.role.includes('Courier');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('LOADING');
    try {
      await addDoc(collection(db, 'pre_registrations'), {
        businessName: formData.businessName,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        role: formData.role || 'Uncategorized Vendor',
        vehicle: requiresVehicle ? formData.vehicle : null,
        kycStatus: 'pending',
        pocketbaseId: 'none', // Default placeholder to prevent Admin dashboard crashes
        createdAt: serverTimestamp(),
        source: 'vendor_portal'
      });
      setStatus('SUCCESS');
      setFormData({ businessName: '', name: '', email: '', phone: '', city: '', role: '', vehicle: '' });
    } catch (error) {
      console.error("Database connection failed:", error);
      setStatus('ERROR');
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* CSS-IN-JS MINIMALIST STYLING */}
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
        <select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-black border border-[#333] text-white px-4 py-2 rounded-full outline-none cursor-pointer hover:border-white transition-colors text-[0.8rem] uppercase tracking-widest font-bold appearance-none">
          <option value="en">EN</option><option value="hi">HI</option><option value="hinglish">HIN</option>
          <option value="mr">MR</option><option value="gu">GU</option><option value="te">TE</option>
          <option value="ta">TA</option><option value="pa">PA</option><option value="bho">BHO</option>
          <option value="ar">AR</option><option value="es">ES</option><option value="fr">FR</option><option value="de">DE</option>
        </select>
      </div>

      <div className="w-full max-w-[600px] z-10 flex flex-col items-center py-12">
        <Link to="/" className="mb-10 opacity-0 animate-fade">
          <img src="/logo.png" alt="Movyra" className="h-10" onError={(e) => e.target.style.display='none'} />
        </Link>

        <div className="text-center mb-10 opacity-0 animate-fade stagger-1">
          <h1 className="text-[2.2rem] md:text-[2.8rem] font-black leading-tight tracking-tighter mb-4">{cur.title}</h1>
          <p className="text-[#888] text-[0.95rem] leading-relaxed max-w-[480px] mx-auto">{cur.subtitle}</p>
        </div>

        <div className="w-full bg-[#050505] border border-[#222] p-8 md:p-10 rounded-[24px] opacity-0 animate-fade stagger-2 shadow-[0_0_80px_rgba(255,255,255,0.03)]">
          {status === 'SUCCESS' ? (
            <div className="text-center py-10">
              <div className="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center mx-auto mb-8">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h3 className="font-black text-[1.5rem] mb-4">{cur.success}</h3>
              <p className="text-[#888] text-[0.9rem] mb-10 leading-relaxed max-w-[300px] mx-auto">{cur.successSub}</p>
              <button onClick={() => setStatus('IDLE')} className="border border-[#333] text-white px-8 py-3 rounded-full font-bold hover:bg-white hover:text-black transition-colors text-[0.85rem] uppercase tracking-widest">
                {cur.back}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <input 
                  type="text" 
                  placeholder={cur.bName}
                  value={formData.businessName}
                  onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                  required 
                  className="w-full bg-black border border-[#333] text-white px-5 py-4 rounded-xl outline-none focus:border-white transition-colors text-[0.95rem]"
                />
                <input 
                  type="text" 
                  placeholder={cur.owner}
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required 
                  className="w-full bg-black border border-[#333] text-white px-5 py-4 rounded-xl outline-none focus:border-white transition-colors text-[0.95rem]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <input 
                  type="email" 
                  placeholder={cur.email}
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <input 
                  type="text" 
                  placeholder={cur.city}
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  required 
                  className="w-full bg-black border border-[#333] text-white px-5 py-4 rounded-xl outline-none focus:border-white transition-colors text-[0.95rem]"
                />
                <div className="relative">
                  <select 
                    value={formData.role} 
                    onChange={(e) => setFormData({...formData, role: e.target.value, vehicle: ''})} 
                    required 
                    className="w-full bg-black border border-[#333] text-white px-5 py-4 rounded-xl outline-none focus:border-white transition-colors text-[0.95rem] appearance-none"
                  >
                    <option value="" disabled>{cur.role}</option>
                    {cur.roles.map((r, idx) => <option key={idx} value={r}>{r}</option>)}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#666]">▼</div>
                </div>
              </div>

              {requiresVehicle && (
                <div className="relative animate-fade">
                  <select 
                    value={formData.vehicle} 
                    onChange={(e) => setFormData({...formData, vehicle: e.target.value})} 
                    required={requiresVehicle}
                    className="w-full bg-black border border-[#333] text-white px-5 py-4 rounded-xl outline-none focus:border-white transition-colors text-[0.95rem] appearance-none"
                  >
                    <option value="" disabled>{cur.vehicle}</option>
                    {cur.vehicles.map((v, idx) => <option key={idx} value={v}>{v}</option>)}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#666]">▼</div>
                </div>
              )}

              <div className="text-[0.7rem] text-[#666] font-mono uppercase tracking-widest text-center mt-4 mb-2">
                * KYC Document Upload will be required post-registration.
              </div>

              <button 
                type="submit" 
                disabled={status === 'LOADING'}
                className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-[#e0e0e0] transition-colors mt-2 disabled:opacity-50 text-[0.95rem] uppercase tracking-widest"
              >
                {status === 'LOADING' ? 'Processing...' : cur.submit}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// NEW CODE: MASTER VIEW CONTROLLER ROUTER
// ----------------------------------------------------------------------------
export default function VendorIndex() {
  const [authState, setAuthState] = useState('loading'); // 'loading', 'guest', 'authenticated'

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthState('authenticated');
      } else {
        setAuthState('guest');
      }
    });

    return () => unsubscribe();
  }, []);

  if (authState === 'loading') {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[#666666] text-[0.8rem] uppercase tracking-widest font-bold">Initializing Node</span>
        </div>
      </div>
    );
  }

  // If authenticated, mount the new RBAC protected vendor dashboard
  if (authState === 'authenticated') {
    return <VendorDashboard />;
  }

  // If unauthenticated guest, mount the existing untouched B2B onboarding form
  return <VendorOnboarding />;
}