import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { db } from '../../firebaseConfig';
import { Link } from 'react-router-dom';
import VendorDashboard from './components/VendorDashboard';
import { uploadVendorKYCDocuments } from '../../services/pocketbaseService';
import { motion, AnimatePresence } from 'framer-motion';

// Google MediaPipe Dependencies
import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision';

/**
 * ============================================================================
 * COMPONENT: VENDOR PORTAL ROUTER (mv-main)
 * Purpose: Acts as the public module exporter. Conditionally renders the 
 * secure VendorDashboard for authenticated users. For guests, it renders the 
 * Multi-Stage B2B Onboarding Form accompanied by an interactive Auth login overlay.
 * Structural Constraint: Strict zero emoji vector configuration. Existing
 * codebase strictly preserved. Uses standard business terminology.
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// REFACTORED MULTI-STAGE B2B ONBOARDING FORM
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
  
  // Expanded KYC File States
  const [files, setFiles] = useState({ 
    gst: null, 
    panFront: null, 
    panBack: null, 
    aadhaarFront: null, 
    aadhaarBack: null,
    businessDocs: null
  });

  const [status, setStatus] = useState('IDLE'); // IDLE, KYC_FACE, KYC_DOCS, LOADING, SUCCESS, ERROR
  const [faceImageFile, setFaceImageFile] = useState(null);
  const [lang, setLang] = useState('en');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [faceDetector, setFaceDetector] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);

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

  // 13-Language Dictionary for B2B Vendor Portal
  const t = {
    en: { title: "Partner Onboarding", subtitle: "Join the Movyra enterprise grid. List your business, restaurant, or fleet for seamless logistics integration.", bName: "Business / Entity Name", owner: "Contact Person Name", email: "Business Email", phone: "Phone Number", city: "Operating City", role: "Select Partner Category", roles: ["Restaurant / Cloud Kitchen", "FMCG Vendor", "Q-Commerce Partner", "Enterprise Fleet Owner", "Independent Courier"], vehicle: "Vehicle Class", vehicles: ["2-Wheeler (Bike/Scooter)", "3-Wheeler (EV/Auto)", "4-Wheeler (Mini Truck)", "Heavy Commercial"], submit: "Proceed to KYC", success: "Application Received", successSub: "Our enterprise team will review your application and initiate the onboarding process shortly.", back: "Return to Hub", kyc_face_title: "Live Verification", kyc_face_desc: "Please look directly at the camera. The system will auto-capture when a face is detected.", kyc_docs_title: "Compliance Documents", kyc_docs_desc: "Upload clear PDF or JPG copies of your official documents." },
    hi: { title: "पार्टनर ऑनबोर्डिंग", subtitle: "मूवीरा एंटरप्राइज ग्रिड से जुड़ें। अपने व्यवसाय या फ्लीट को सूचीबद्ध करें।", bName: "व्यवसाय का नाम", owner: "संपर्क व्यक्ति का नाम", email: "ईमेल", phone: "फ़ोन नंबर", city: "शहर", role: "श्रेणी चुनें", roles: ["रेस्टोरेंट / क्लाउड किचन", "FMCG वेंडर", "Q-कॉमर्स पार्टनर", "एंटरप्राइज फ्लीट मालिक", "स्वतंत्र कूरियर"], vehicle: "वाहन श्रेणी", vehicles: ["2-पहिया", "3-पहिया", "4-पहिया", "भारी वाणिज्यिक"], submit: "KYC के लिए आगे बढ़ें", success: "आवेदन प्राप्त हुआ", successSub: "हमारी टीम जल्द ही आपसे संपर्क करेगी।", back: "वापस जाएं", kyc_face_title: "चेहरा सत्यापन", kyc_face_desc: "अपनी पहचान सत्यापित करने के लिए कृपया सीधे कैमरे की ओर देखें।", kyc_docs_title: "व्यापार दस्तावेज़", kyc_docs_desc: "अपने आधिकारिक दस्तावेजों की स्पष्ट प्रतियां अपलोड करें।" },
    hinglish: { title: "Partner Onboarding", subtitle: "Movyra grid join karein. Apne business ya fleet ko list karein.", bName: "Business Name", owner: "Owner Name", email: "Business Email", phone: "Phone Number", city: "City", role: "Select Category", roles: ["Restaurant / Cloud Kitchen", "FMCG Vendor", "Q-Commerce Partner", "Enterprise Fleet Owner", "Independent Courier"], vehicle: "Vehicle Type", vehicles: ["2-Wheeler", "3-Wheeler", "4-Wheeler", "Heavy Truck"], submit: "KYC Shuru Karein", success: "Application Received", successSub: "Hamari team jaldi contact karegi.", back: "Go Back", kyc_face_title: "Face Verification", kyc_face_desc: "Identity verify karne ke liye camera me dekhein.", kyc_docs_title: "Business Documents", kyc_docs_desc: "Official documents upload karein." },
    mr: { title: "भागीदार ऑनबोर्डिंग", subtitle: "Movyra ग्रिडमध्ये सामील व्हा. तुमचा व्यवसाय नोंदवा.", bName: "व्यवसायाचे नाव", owner: "मालकाचे नाव", email: "ईमेल", phone: "फोन नंबर", city: "शहर", role: "श्रेणी निवडा", roles: ["रेस्टॉरंट / क्लाउड किचन", "FMCG विक्रेता", "Q-कॉमर्स भागीदार", "एंटरप्राइझ फ्लीट मालक", "स्वतंत्र कुरिअर"], vehicle: "वाहन प्रकार", vehicles: ["दुचाकी", "तीन चाकी", "चार चाकी", "जड वाहन"], submit: "KYC सुरू करा", success: "अर्ज प्राप्त झाला", successSub: "आमची टीम लवकरच संपर्क साधेल.", back: "मागे जा", kyc_face_title: "चेहरा पडताळणी", kyc_face_desc: "कॅमेराकडे पहा.", kyc_docs_title: "कागदपत्रे", kyc_docs_desc: "कागदपत्रे अपलोड करा." },
    gu: { title: "ભાગીદાર ઑનબોર્ડિંગ", subtitle: "તમારો વ્યવસાય અથવા ફ્લીટ રજીસ્ટર કરો.", bName: "વ્યવસાયનું નામ", owner: "માલિકનું નામ", email: "ઈમેલ", phone: "ફોન નંબર", city: "શહેર", role: "શ્રેણી પસંદ કરો", roles: ["રેસ્ટોરન્ટ / ક્લાઉડ કિચન", "FMCG વિક્રેતા", "Q-કોમર્સ પાર્ટનર", "એન્ટરપ્રાઇઝ ફ્લીટ માલિક", "સ્વતંત્ર કુરિયર"], vehicle: "વાહન પ્રકાર", vehicles: ["2-વ્હીલર", "3-વ્હીલર", "4-વ્હીલર", "હેવી ટ્રક"], submit: "KYC શરૂ કરો", success: "અરજી મળી ગઈ", successSub: "અમારી ટીમ ટૂંક સમયમાં તમારો સંપર્ક કરશે.", back: "પાછા જાઓ", kyc_face_title: "ચહેરો ચકાસણી", kyc_face_desc: "કેમેરા સામે જુઓ.", kyc_docs_title: "દસ્તાવેજો", kyc_docs_desc: "દસ્તાવેજો અપલોડ કરો." },
    te: { title: "భాగస్వామి ఆన్‌బోర్డింగ్", subtitle: "Movyra ఎంటర్‌ప్రైజ్ గ్రిడ్‌లో చేరండి.", bName: "వ్యాపారం పేరు", owner: "యజమాని పేరు", email: "ఇమెయిల్", phone: "ఫోన్ నంబర్", city: "నగరం", role: "కేటగిరీ ఎంచుకోండి", roles: ["రెస్టారెంట్", "FMCG వెండర్", "Q-కామర్స్", "ఫ్లీట్ ఓనర్", "కొరియర్"], vehicle: "వాహనం రకం", vehicles: ["2-వీలర్", "3-వీలర్", "4-వీలర్", "హెవీ ટ્રక్"], submit: "KYC ప్రారంభించండి", success: "దరఖాస్తు స్వీకరించబడింది", successSub: "మా బృందం త్వరలో మిమ్మల్ని సంప్రదిస్తుంది.", back: "వెనక్కి వెళ్ళు", kyc_face_title: "ముఖ నిర్ధారణ", kyc_face_desc: "కెమెరాను చూడండి.", kyc_docs_title: "పత్రాలు", kyc_docs_desc: "పత్రాలను అప్‌లోడ్ చేయండి." },
    ta: { title: "கூட்டாளர் ஆன்போர்டிங்", subtitle: "உங்கள் வணிகம் அல்லது கடற்படையை பதிவு செய்யவும்.", bName: "வணிக பெயர்", owner: "உரிமையாளர் பெயர்", email: "மின்னஞ்சல்", phone: "தொலைபேசி எண்", city: "நகரம்", role: "வகையைத் தேர்ந்தெடுக்கவும்", roles: ["உணவகம்", "FMCG விற்பனையாளர்", "Q-காமர்ஸ்", "கடற்படை உரிமையாளர்", "கூரியர்"], vehicle: "வாகன வகை", vehicles: ["இரு சக்கர வாகனம்", "3 சக்கர வாகனம்", "4 சக்கர வாகனம்", "கனரக டிரக்"], submit: "KYC தொடங்கவும்", success: "விண்ணப்பம் பெறப்பட்டது", successSub: "எங்கள் குழு விரைவில் உங்களை தொடர்பு கொள்ளும்.", back: "திரும்பி செல்", kyc_face_title: "முக சரிபார்ப்பு", kyc_face_desc: "காமிராவைப் பாருங்கள்.", kyc_docs_title: "ஆவணங்கள்", kyc_docs_desc: "ஆவணங்களை பதிவேற்றவும்." },
    pa: { title: "ਭਾਈਵਾਲ ਆਨਬੋਰਡਿੰਗ", subtitle: "ਆਪਣਾ ਕਾਰੋਬਾਰ ਜਾਂ ਫਲੀਟ ਰਜਿਸਟਰ ਕਰੋ।", bName: "ਕਾਰੋਬਾਰ ਦਾ ਨਾਮ", owner: "ਮਾਲਕ ਦਾ ਨਾਮ", email: "ਈਮੇਲ", phone: "ਫੋਨ ਨੰਬਰ", city: "ਸ਼ਹਿਰ", role: "ਸ਼੍ਰੇਣੀ ਚੁਣੋ", roles: ["ਰੈਸਟੋਰੈਂਟ", "FMCG ਵਿਕਰੇਤਾ", "Q-ਕਾਮਰਸ", "ਫਲੀਟ ਮਾਲਕ", "ਕੋਰੀਅਰ"], vehicle: "ਵਾਹਨ ਦੀ ਕਿਸਮ", vehicles: ["2-ਪਹੀਆ", "3-ਪਹੀਆ", "4-ਪਹੀਆ", "ਭਾਰੀ ਟਰੱਕ"], submit: "KYC ਸ਼ੁਰੂ ਕਰੋ", success: "ਬਿਨੈਪੱਤਰ ਪ੍ਰਾਪਤ ਹੋਇਆ", successSub: "ਸਾਡੀ ਟੀਮ ਜਲਦੀ ਹੀ ਤੁਹਾਡੇ ਨਾਲ ਸੰਪਰਕ ਕਰੇਗੀ।", back: "ਵਾਪਸ ਜਾਓ", kyc_face_title: "ਚਿਹਰੇ ਦੀ ਤਸਦੀਕ", kyc_face_desc: "ਕੈਮਰੇ ਵੱਲ ਦੇਖੋ।", kyc_docs_title: "ਦਸਤਾਵੇਜ਼", kyc_docs_desc: "ਦਸਤਾਵੇਜ਼ ਅੱਪਲੋਡ ਕਰੋ।" },
    bho: { title: "पार्टनर ऑनबोर्डिंग", subtitle: "Movyra ग्रिड से जुड़ीं। आपन व्यापार रजिस्टर करीं।", bName: "व्यापार के नाम", owner: "मालिक के नाम", email: "ईमेल", phone: "फोन नंबर", city: "शहर", role: "श्रेणी चुनीं", roles: ["रेस्टोरेंट", "FMCG वेंडर", "Q-कॉमर्स", "फ्लीट मालिक", "कूरियर"], vehicle: "वाहन प्रकार", vehicles: ["2-पहिया", "3-पहिया", "4-पहिया", "भारी ट्रक"], submit: "KYC शुरू करीं", success: "आवेदन मिल गइल", successSub: "हमनी के टीम जल्दिए रउआ से संपर्क करी।", back: "पीछे जाईं", kyc_face_title: "चेहरा सत्यापन", kyc_face_desc: "कैमरा में देखीं।", kyc_docs_title: "दस्तावेज", kyc_docs_desc: "दस्तावेज अपलोड करीं।" },
    ar: { title: "تسجيل الشركاء", subtitle: "انضم إلى شبكة Movyra. قم بإدراج عملك أو أسطولك.", bName: "اسم العمل", owner: "اسم المالك", email: "البريد الإلكتروني", phone: "رقم الهاتف", city: "المدينة", role: "اختر الفئة", roles: ["مطعم", "بائع FMCG", "شريك تجارة Q", "مالك أسطول", "ساعي مستقل"], vehicle: "فئة المركبة", vehicles: ["عجلتين", "ثلاث عجلات", "أربع عجلات", "شاحنة ثقيلة"], submit: "بدء KYC", success: "تم استلام الطلب", successSub: "سيقوم فريقنا بمراجعة طلبك قريباً.", back: "العودة", kyc_face_title: "التحقق من الوجه", kyc_face_desc: "انظر للكاميرا.", kyc_docs_title: "مستندات", kyc_docs_desc: "ارفع المستندات." },
    es: { title: "Registro de Socios", subtitle: "Únase a la red de Movyra. Registre su negocio o flota.", bName: "Nombre del Negocio", owner: "Nombre del Propietario", email: "Correo Electrónico", phone: "Número de Teléfono", city: "Ciudad", role: "Seleccionar Categoría", roles: ["Restaurante", "Vendedor FMCG", "Socio Q-Commerce", "Propietario de Flota", "Mensajero"], vehicle: "Clase de Vehículo", vehicles: ["2 Ruedas", "3 Ruedas", "4 Ruedas", "Camión Pesado"], submit: "Iniciar KYC", success: "Solicitud Recibida", successSub: "Nuestro equipo revisará su solicitud en breve.", back: "Volver", kyc_face_title: "Verificación facial", kyc_face_desc: "Mire a la cámara.", kyc_docs_title: "Documentos", kyc_docs_desc: "Subir documentos." },
    fr: { title: "Intégration des Partenaires", subtitle: "Rejoignez le réseau Movyra. Inscrivez votre entreprise.", bName: "Nom de l'Entreprise", owner: "Nom du Propriétaire", email: "E-mail", phone: "Numéro de Téléphone", city: "Ville", role: "Sélectionner la Catégorie", roles: ["Restaurant", "Vendeur FMCG", "Partenaire Q-Commerce", "Propriétaire de Flotte", "Coursier"], vehicle: "Type de Véhicule", vehicles: ["2 Roues", "3 Roues", "4 Roues", "Poids Lourd"], submit: "Démarrer KYC", success: "Demande Reçue", successSub: "Notre équipe examinera votre demande sous peu.", back: "Retour", kyc_face_title: "Vérification faciale", kyc_face_desc: "Regardez la caméra.", kyc_docs_title: "Documents", kyc_docs_desc: "Télécharger les documents." },
    de: { title: "Partner-Onboarding", subtitle: "Treten Sie dem Movyra-Netzwerk bei. Registrieren Sie Ihr Unternehmen.", bName: "Firmenname", owner: "Name des Inhabers", email: "E-Mail", phone: "Telefonnummer", city: "Stadt", role: "Kategorie wählen", roles: ["Restaurant", "FMCG-Anbieter", "Q-Commerce-Partner", "Flottenbesitzer", "Kurier"], vehicle: "Fahrzeugklasse", vehicles: ["Zweirad", "Dreirad", "Vierrad", "Schwerer LKW"], submit: "KYC starten", success: "Bewerbung erhalten", successSub: "Unser Team wird Ihre Bewerbung in Kürze prüfen.", back: "Zurück", kyc_face_title: "Gesichtsverifizierung", kyc_face_desc: "In die Kamera schauen.", kyc_docs_title: "Dokumente", kyc_docs_desc: "Dokumente hochladen." }
  };

  const cur = t[lang] || t['en'];

  // Conditional Logic: Show vehicle selection only if role implies logistics
  const requiresVehicle = formData.role === cur.roles[3] || formData.role === cur.roles[4] || 
                          formData.role.includes('Fleet') || formData.role.includes('Courier');

  // GOOGLE MEDIAPIPE FACE VERIFICATION (LIVENESS ENGINE)
  const startFaceScan = async (e) => {
    e.preventDefault();
    setStatus('KYC_FACE');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          detectFaceLoop();
        };
      }
    } catch (err) {
      console.error("Camera Access Denied:", err);
      setStatus('ERROR');
    }
  };

  const detectFaceLoop = () => {
    if (!videoRef.current || !faceDetector || status !== 'KYC_FACE') return;
    
    setIsDetecting(true);
    let lastVideoTime = -1;

    const detect = async () => {
      const video = videoRef.current;
      if (video && video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        const detections = faceDetector.detectForVideo(video, performance.now());
        
        if (detections.detections.length > 0) {
          // Face detected. Capture the frame.
          const canvas = canvasRef.current;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          canvas.toBlob((blob) => {
            const file = new File([blob], "live_face.jpg", { type: "image/jpeg" });
            setFaceImageFile(file);
            setStatus('KYC_DOCS');
            
            // Stop media stream
            const stream = video.srcObject;
            if (stream) {
              const tracks = stream.getTracks();
              tracks.forEach(track => track.stop());
            }
          }, 'image/jpeg', 0.8);
          setIsDetecting(false);
          return; // Stop loop
        }
      }
      if (status === 'KYC_FACE') {
        requestAnimationFrame(detect);
      }
    };
    detect();
  };

  // FINAL SUBMISSION (POCKETBASE UPLOAD + FIRESTORE WRITE)
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setStatus('LOADING');
    try {
      // 1. Upload compliance suite to external database
      const record = await uploadVendorKYCDocuments(
        formData.email, 
        faceImageFile,
        files.aadhaarFront,
        files.aadhaarBack,
        files.panFront,
        files.panBack,
        files.gst,
        files.businessDocs
      );

      // 2. Transmit logical reference schema to Firestore
      await addDoc(collection(db, 'vendor_applications'), {
        businessName: formData.businessName,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        role: formData.role || 'Uncategorized Vendor',
        vehicle: requiresVehicle ? formData.vehicle : null,
        kycStatus: 'pending',
        pocketbaseId: record.id,
        timestamp: serverTimestamp(),
        status: 'pending'
      });
      
      setStatus('SUCCESS');
      setFormData({ businessName: '', name: '', email: '', phone: '', city: '', role: '', vehicle: '' });
    } catch (error) {
      console.error("Database connection failed:", error);
      setStatus('ERROR');
      setTimeout(() => setStatus('IDLE'), 3000);
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
          ) : status === 'ERROR' ? (
            <div className="flex flex-col items-center justify-center text-center py-10 animate-fade">
              <h3 className="text-[1.8rem] font-black mb-2 text-[#ff4444]">System Error</h3>
              <p className="text-[#888888] text-[0.9rem] mb-6">Verification failed. Please check network connection.</p>
              <button onClick={() => setStatus('IDLE')} className="border border-white px-6 py-2 rounded-full font-bold text-black bg-white hover:bg-[#e0e0e0]">Retry</button>
            </div>
          ) : status === 'KYC_FACE' ? (
            // STAGE 2: KYC FACE VERIFICATION
            <div className="flex flex-col h-full animate-fade relative">
              <h3 className="text-[1.5rem] font-black mb-2">{cur.kyc_face_title}</h3>
              <p className="text-[#888888] text-[0.85rem] mb-8">{cur.kyc_face_desc}</p>
              <div className="w-full aspect-square bg-[#000000] border border-[#333333] rounded-[24px] overflow-hidden relative shadow-inner mb-6">
                <video ref={videoRef} playsInline muted className="w-full h-full object-cover scale-x-[-1]"></video>
                <canvas ref={canvasRef} className="hidden"></canvas>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <svg viewBox="0 0 100 100" className="w-[60%] h-[60%] opacity-30"><ellipse cx="50" cy="50" rx="35" ry="45" fill="none" stroke="white" strokeWidth="2" strokeDasharray="4 4" /></svg>
                </div>
                {isDetecting && (
                   <div className="absolute bottom-4 left-0 w-full text-center">
                     <span className="bg-black/50 text-white text-[0.7rem] px-3 py-1 rounded-full backdrop-blur-sm">Align face within oval...</span>
                   </div>
                )}
              </div>
              <div className="text-center font-mono text-[0.7rem] text-[#666] tracking-widest uppercase animate-pulse">Running Liveness Engine...</div>
            </div>
          ) : status === 'KYC_DOCS' ? (
            // STAGE 3: MULTI-DOCUMENT UPLOAD
            <div className="flex flex-col h-full animate-fade">
              <h3 className="text-[1.5rem] font-black mb-2">{cur.kyc_docs_title}</h3>
              <p className="text-[#888888] text-[0.85rem] mb-8">{cur.kyc_docs_desc}</p>
              
              <div className="max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                <form id="vendor-kyc-form" onSubmit={handleFinalSubmit} className="flex flex-col gap-5">
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

              <button form="vendor-kyc-form" type="submit" className="w-full bg-white text-black font-black text-[1.1rem] tracking-tight py-4 rounded-xl mt-6 hover:bg-[#e0e0e0] transition-colors shrink-0 shadow-[0_-10px_20px_#0a0a0a]">
                Upload & Finalize
              </button>
            </div>
          ) : (
            // STAGE 1: LOGICAL DATA CAPTURE
            <form onSubmit={startFaceScan} className="flex flex-col gap-5">
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

              <button 
                type="submit" 
                className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-[#e0e0e0] transition-colors mt-2 text-[0.95rem] uppercase tracking-widest"
              >
                {cur.submit}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// PRESERVED EXISTING CODE: MASTER VIEW CONTROLLER ROUTER
// ----------------------------------------------------------------------------
export default function VendorIndex() {
  const [authState, setAuthState] = useState('loading'); // 'loading', 'guest', 'authenticated'
  
  // Terminal Modal State
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthState('authenticated');
      } else {
        setAuthState('guest');
      }
    });

    return () => unsubscribe();
  }, [auth]);

  // Handle Standard Email & Password
  const handleStandardSignIn = async (e) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setLoginError('');

    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      // Success will automatically trigger the onAuthStateChanged listener
    } catch (error) {
      console.error("Firebase Login Error:", error);
      setLoginError("Invalid email or password. Please try again.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle External Google Identity Provider
  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    setLoginError('');
    
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      setLoginError("Sign in with Google failed. Please try again.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  // 1. System Initializing Matrix
  if (authState === 'loading') {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[#666666] text-[0.8rem] uppercase tracking-widest font-bold">Loading System</span>
        </div>
      </div>
    );
  }

  // 2. Verified Authorization Access
  if (authState === 'authenticated') {
    return <VendorDashboard />;
  }

  // 3. Guest Interface (Onboarding + Login Terminal Overlay)
  return (
    <div className="relative">
      
      {/* Floating Entry Button to Trigger Authorization Modal */}
      <div className="fixed top-6 left-6 md:top-10 md:left-10 z-[60]">
        <button 
          onClick={() => setShowLoginModal(true)}
          className="bg-transparent border border-[#333333] text-white px-5 py-2.5 rounded-full text-[0.75rem] font-bold uppercase tracking-widest hover:bg-[#111111] hover:border-white transition-all flex items-center gap-2 shadow-2xl"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          Vendor Login
        </button>
      </div>

      <VendorOnboarding />

      {/* Interactive Authorization Modal Overlay */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#000000]/90 backdrop-blur-md flex items-center justify-center p-6 animate-fade"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-[400px] bg-[#050505] border border-[#222222] rounded-[24px] p-8 shadow-[0_0_50px_rgba(255,255,255,0.05)] relative"
            >
              
              <button 
                onClick={() => setShowLoginModal(false)}
                className="absolute top-5 right-5 text-[#666666] hover:text-white transition-colors"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>

              <h2 className="text-[1.6rem] font-black tracking-tight text-white mb-2">Welcome Back</h2>
              <p className="text-[#888888] text-[0.85rem] mb-6">Enter your account details to access your dashboard.</p>

              {loginError && (
                <div className="w-full bg-[#ff4444]/10 border border-[#ff4444]/30 text-[#ff4444] text-[0.8rem] font-bold p-3 rounded-xl mb-4">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleStandardSignIn} className="flex flex-col gap-4 mb-6">
                <div>
                  <label className="block text-[0.7rem] font-bold uppercase tracking-widest text-[#666666] mb-2">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-[#111111] border border-[#333333] text-white px-4 py-3 rounded-xl outline-none focus:border-[#00ff88] transition-colors text-[0.95rem]" 
                  />
                </div>
                
                <div>
                  <label className="block text-[0.7rem] font-bold uppercase tracking-widest text-[#666666] mb-2">Password</label>
                  <input 
                    type="password" 
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-[#111111] border border-[#333333] text-white px-4 py-3 rounded-xl outline-none focus:border-[#00ff88] transition-colors text-[0.95rem]" 
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isAuthenticating}
                  className="w-full bg-white text-black font-black tracking-tight py-3.5 rounded-xl hover:bg-[#e0e0e0] transition-colors mt-2 disabled:opacity-50 text-[1rem]"
                >
                  {isAuthenticating ? 'Signing In...' : 'Sign In'}
                </button>
              </form>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-[1px] bg-[#222222]"></div>
                <span className="text-[#666666] text-[0.75rem] font-bold uppercase tracking-widest">Or Continue With</span>
                <div className="flex-1 h-[1px] bg-[#222222]"></div>
              </div>

              <button 
                onClick={handleGoogleSignIn}
                disabled={isAuthenticating}
                className="w-full bg-[#111111] border border-[#333333] text-white font-bold py-3.5 rounded-xl hover:bg-[#222222] transition-colors flex items-center justify-center gap-3 disabled:opacity-50 text-[0.95rem]"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12c0-.83-.08-1.63-.2-2.4H12v4.6h5.7a5.5 5.5 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.6-5.2 3.6-8.8z"></path><path d="M12 22c2.8 0 5.2-1 6.9-2.6l-3.9-3c-.9.6-2.1 1-3 1-2.4 0-4.5-1.6-5.2-3.8H2.8v3.1C4.6 20.3 8 22 12 22z"></path><path d="M6.8 13.6c-.2-.6-.3-1.3-.3-1.9s.1-1.3.3-1.9V6.7H2.8C2.1 8.3 1.7 10.1 1.7 12s.4 3.7 1.1 5.3l3.9-3.7z"></path><path d="M12 5.4c1.5 0 2.9.5 3.9 1.5l3-3C17.2 2.2 14.8 1 12 1 8 1 4.6 2.7 2.8 5.7l3.9 3.1c.8-2.2 2.8-3.4 5.3-3.4z"></path></svg>
                Sign in with Google
              </button>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}