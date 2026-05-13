import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../../firebaseConfig';
import { getKYCDocumentUrls } from '../../services/pocketbaseService';

export default function WaitlistDashboard() {
  // 1. STATE MANAGEMENT
  const [waitlistData, setWaitlistData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lang, setLang] = useState('en');
  
  // Document Viewer Modal State
  const [docModalActive, setDocModalActive] = useState(false);
  const [activeDocUrls, setActiveDocUrls] = useState({ gst: null, pan: null, aadhaar: null });
  const [docLoading, setDocLoading] = useState(false);
  const [docError, setDocError] = useState(null);

  // Derived Business KPIs from Live Data
  const total = waitlistData.length;
  const pendingKYC = waitlistData.filter(u => u.kycStatus === 'pending').length;
  const approvedFleet = waitlistData.filter(u => u.kycStatus === 'approved' && ['Independent Courier', 'Enterprise Fleet Owner', '3PL Logistics Partner', 'Driver Partner'].includes(u.role)).length;
  const approvedVendors = waitlistData.filter(u => u.kycStatus === 'approved' && ['Restaurant / Cloud Kitchen', 'FMCG Vendor', 'Q-Commerce Partner', 'Restaurant / Vendor'].includes(u.role)).length;

  // 2. REAL-TIME FIRESTORE INGESTION
  useEffect(() => {
    const q = query(collection(db, 'pre_registrations'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(document => ({
        id: document.id,
        ...document.data(),
        // Safely parse Firestore timestamps to local readable strings
        timestamp: document.data().createdAt?.toDate ? document.data().createdAt.toDate().toLocaleString() : 'N/A'
      }));
      setWaitlistData(data);
      setIsLoading(false);
    }, (error) => {
      console.error("Critical Firestore Sync Error:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 3. MANUAL SESSION TERMINATION
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Session termination failed:", error);
    }
  };

  // 4. 13-LANGUAGE ADMIN DICTIONARY
  const t = {
    en: { title: "Admin Overview", export: "Export CSV", logout: "Log Out", total: "Total Registry", pending: "Pending KYC", fleet: "Active Fleet", vendors: "Active Vendors", th_id: "ID", th_user: "User Entity", th_ops: "Operations", th_status: "Status", th_act: "Actions", doc: "Docs", app: "Approve", den: "Deny", ban: "Ban", close: "Close Viewer" },
    hi: { title: "प्रशासक अवलोकन", export: "CSV निर्यात", logout: "लॉग आउट", total: "कुल पंजीकरण", pending: "लंबित KYC", fleet: "सक्रिय फ्लीट", vendors: "सक्रिय विक्रेता", th_id: "आईडी", th_user: "उपयोगकर्ता", th_ops: "संचालन", th_status: "स्थिति", th_act: "कार्रवाई", doc: "दस्तावेज़", app: "मंजूरी", den: "अस्वीकार", ban: "बैन", close: "बंद करें" },
    hinglish: { title: "Admin Overview", export: "CSV Export", logout: "Log Out", total: "Total Users", pending: "Pending KYC", fleet: "Active Drivers", vendors: "Active Vendors", th_id: "ID", th_user: "User Details", th_ops: "Operations", th_status: "Status", th_act: "Actions", doc: "Docs", app: "Approve", den: "Deny", ban: "Ban", close: "Close Viewer" },
    mr: { title: "प्रशासक विहंगावलोकन", export: "CSV निर्यात", logout: "लॉग आउट", total: "एकूण नोंदणी", pending: "प्रलंबित KYC", fleet: "सक्रिय फ्लीट", vendors: "सक्रिय विक्रेते", th_id: "आयडी", th_user: "वापरकर्ता", th_ops: "ऑपरेशन्स", th_status: "स्थिती", th_act: "कृती", doc: "कागदपत्रे", app: "मंजूर", den: "नाकारणे", ban: "बंदी", close: "बंद करा" },
    gu: { title: "એડમિન વિહંગાવલોકન", export: "CSV નિકાસ", logout: "લૉગ આઉટ", total: "કુલ નોંધણી", pending: "બાકી KYC", fleet: "સક્રિય ફ્લીટ", vendors: "સક્રિય વિક્રેતાઓ", th_id: "આઈડી", th_user: "વપરાશકર્તા", th_ops: "કામગીરી", th_status: "સ્થિતિ", th_act: "ક્રિયાઓ", doc: "દસ્તાવેજ", app: "મંજૂર", den: "નકારો", ban: "પ્રતિબંધ", close: "બંધ કરો" },
    te: { title: "అడ్మిన్ అవలోకనం", export: "CSV ఎగుమతి", logout: "లాగ్ అవుట్", total: "మొత్తం రిజిస్ట్రీ", pending: "పెండింగ్ KYC", fleet: "యాక్టివ్ ఫ్లీట్", vendors: "యాక్టివ్ వెండర్స్", th_id: "ID", th_user: "యూజర్", th_ops: "ఆపరేషన్స్", th_status: "స్థితి", th_act: "చర్యలు", doc: "పత్రాలు", app: "ఆమోదించండి", den: "తిరస్కరించు", ban: "నిషేధం", close: "మూసివేయు" },
    ta: { title: "நிர்வாக கண்ணோட்டம்", export: "CSV ஏற்றுமதி", logout: "வெளியேறு", total: "மொத்த பதிவு", pending: "நிலுவையில் உள்ள KYC", fleet: "செயலில் உள்ள கடற்படை", vendors: "செயலில் உள்ள விற்பனையாளர்கள்", th_id: "ஐடி", th_user: "பயனர்", th_ops: "செயல்பாடுகள்", th_status: "நிலை", th_act: "செயல்கள்", doc: "ஆவணங்கள்", app: "ஒப்புதல்", den: "மறுக்க", ban: "தடை", close: "மூடு" },
    pa: { title: "ਐਡਮਿਨ ਸੰਖੇਪ ਜਾਣਕਾਰੀ", export: "CSV ਨਿਰਯਾਤ", logout: "ਲਾਗ ਆਉਟ", total: "ਕੁੱਲ ਰਜਿਸਟਰੀ", pending: "ਬਕਾਇਆ KYC", fleet: "ਐਕਟਿਵ ਫਲੀਟ", vendors: "ਐਕਟਿਵ ਵਿਕਰੇਤਾ", th_id: "ID", th_user: "ਯੂਜ਼ਰ", th_ops: "ਕਾਰਵਾਈਆਂ", th_status: "ਸਥਿਤੀ", th_act: "ਐਕਸ਼ਨ", doc: "ਦਸਤਾਵੇਜ਼", app: "ਮਨਜ਼ੂਰ", den: "ਇਨਕਾਰ", ban: "ਪਾਬੰਦੀ", close: "ਬੰਦ ਕਰੋ" },
    bho: { title: "एडमिन ओवरव्यू", export: "CSV एक्सपोर्ट", logout: "लॉग आउट", total: "कुल रजिस्ट्री", pending: "पेंडिंग KYC", fleet: "एक्टिव फ्लीट", vendors: "एक्टिव वेंडर", th_id: "ID", th_user: "यूजर", th_ops: "ऑपरेशंस", th_status: "स्टेटस", th_act: "एक्शन", doc: "डाक्यूमेंट्स", app: "मंजूर", den: "अस्वीकार", ban: "बैन", close: "बंद करीं" },
    ar: { title: "نظرة عامة للمسؤول", export: "تصدير CSV", logout: "تسجيل الخروج", total: "إجمالي التسجيل", pending: "KYC قيد الانتظار", fleet: "الأسطول النشط", vendors: "البائعون النشطون", th_id: "المعرف", th_user: "المستخدم", th_ops: "العمليات", th_status: "الحالة", th_act: "الإجراءات", doc: "مستندات", app: "موافقة", den: "رفض", ban: "حظر", close: "إغلاق" },
    es: { title: "Resumen del Administrador", export: "Exportar CSV", logout: "Cerrar Sesión", total: "Registro Total", pending: "KYC Pendiente", fleet: "Flota Activa", vendors: "Vendedores Activos", th_id: "ID", th_user: "Usuario", th_ops: "Operaciones", th_status: "Estado", th_act: "Acciones", doc: "Docs", app: "Aprobar", den: "Denegar", ban: "Prohibir", close: "Cerrar" },
    fr: { title: "Aperçu de l'Administrateur", export: "Exporter CSV", logout: "Se Déconnecter", total: "Registre Total", pending: "KYC en attente", fleet: "Flotte Active", vendors: "Vendeurs Actifs", th_id: "ID", th_user: "Utilisateur", th_ops: "Opérations", th_status: "Statut", th_act: "Actions", doc: "Docs", app: "Approuver", den: "Refuser", ban: "Bannir", close: "Fermer" },
    de: { title: "Admin Übersicht", export: "CSV Export", logout: "Abmelden", total: "Gesamtregister", pending: "Ausstehendes KYC", fleet: "Aktive Flotte", vendors: "Aktive Anbieter", th_id: "ID", th_user: "Benutzer", th_ops: "Betrieb", th_status: "Status", th_act: "Aktionen", doc: "Doks", app: "Genehmigen", den: "Ablehnen", ban: "Sperren", close: "Schließen" }
  };

  const cur = t[lang] || t['en'];

  // 5. ADMIN LIVE DATABASE ACTIONS
  const handleAction = async (userId, newStatus) => {
    try {
      const userRef = doc(db, 'pre_registrations', userId);
      await updateDoc(userRef, { kycStatus: newStatus });
    } catch (error) {
      console.error("Database Update Failed:", error);
      alert("Error: Insufficient privileges or database disconnect.");
    }
  };

  // 6. POCKETBASE LIVE DOCUMENT VIEWER
  const viewDocs = async (pbId) => {
    if (!pbId || pbId === 'none') return alert("System Log: No PocketBase artifact ID associated with this entity.");
    
    setDocModalActive(true);
    setDocLoading(true);
    setDocError(null);

    try {
      const urls = await getKYCDocumentUrls(pbId);
      setActiveDocUrls({ gst: urls.gstUrl, pan: urls.panUrl, aadhaar: urls.aadhaarUrl });
    } catch (error) {
      console.error("Document fetch failed:", error);
      setDocError("Access Denied: Please verify that the 'view' API rule is unlocked in your Hugging Face PocketBase dashboard.");
    } finally {
      setDocLoading(false);
    }
  };

  const closeDocModal = () => {
    setDocModalActive(false);
    setActiveDocUrls({ gst: null, pan: null, aadhaar: null });
    setDocError(null);
  };

  // 7. CSV EXPORT ENGINE
  const exportCSV = () => {
    if (waitlistData.length === 0) return;
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Role', 'Business Name', 'City', 'Vehicle', 'Status', 'Timestamp'];
    const rows = waitlistData.map(u => [ 
      u.id, `"${u.name}"`, `"${u.email}"`, `"${u.phone}"`, `"${u.role}"`, `"${u.businessName || 'N/A'}"`, 
      `"${u.city || ''}"`, `"${u.vehicle || 'N/A'}"`, `"${u.kycStatus}"`, `"${u.timestamp}"` 
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Movyra_Onboarding_Ledger_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div className="w-full min-h-screen bg-[#000000] text-white font-sans selection:bg-white selection:text-black">
      
      {/* CSS-IN-JS MINIMALIST STYLING */}
      <style>
        {`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .animate-fade { animation: fadeIn 0.6s ease-out forwards; }
          .stagger-1 { animation-delay: 0.1s; }
          .stagger-2 { animation-delay: 0.2s; }
          
          .border-minimal { border: 1px solid #222; }
          .bg-minimal { background-color: #050505; }
          .hover-minimal:hover { background-color: #111; }
        `}
      </style>

      {/* HEADER */}
      <header className="w-full flex items-center justify-between px-8 md:px-16 py-8 border-b border-[#222222] bg-black sticky top-0 z-40 animate-fade">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Movyra" className="h-8 w-auto" onError={(e) => e.target.style.display = 'none'} />
          <span className="font-black text-[1.5rem] tracking-tighter ml-[-5px]">ovyra <span className="text-[#666] font-normal tracking-widest text-[1rem] uppercase ml-2">Admin</span></span>
        </div>
        
        <div className="flex items-center gap-6 text-[0.9rem] font-bold">
          <select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-transparent border border-[#333] px-4 py-1.5 rounded-full outline-none cursor-pointer hover:border-white transition-colors appearance-none">
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
          <button onClick={exportCSV} className="bg-white text-black px-6 py-1.5 rounded-full font-bold hover:bg-[#e0e0e0] transition-colors">{cur.export}</button>
          <button onClick={handleSignOut} className="bg-[#111] border border-[#ff4444]/30 text-[#ff4444] px-6 py-1.5 rounded-full font-bold hover:bg-[#ff4444] hover:text-white transition-colors">{cur.logout}</button>
        </div>
      </header>

      <main className="w-full max-w-[1600px] mx-auto px-8 md:px-16 py-12 flex flex-col gap-12">
        
        {/* KPI METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 opacity-0 animate-fade stagger-1">
          <div className="bg-minimal border-minimal p-8 rounded-[24px]">
            <span className="text-[#666] font-bold uppercase tracking-widest text-[0.75rem] block mb-2">{cur.total}</span>
            <span className="text-[3.5rem] font-black leading-none text-white">{total}</span>
          </div>
          <div className="bg-minimal border-minimal p-8 rounded-[24px]">
            <span className="text-[#666] font-bold uppercase tracking-widest text-[0.75rem] block mb-2">{cur.pending}</span>
            <span className="text-[3.5rem] font-black leading-none text-white">{pendingKYC}</span>
          </div>
          <div className="bg-minimal border-minimal p-8 rounded-[24px]">
            <span className="text-[#666] font-bold uppercase tracking-widest text-[0.75rem] block mb-2">{cur.fleet}</span>
            <span className="text-[3.5rem] font-black leading-none text-white">{approvedFleet}</span>
          </div>
          <div className="bg-minimal border-minimal p-8 rounded-[24px]">
            <span className="text-[#666] font-bold uppercase tracking-widest text-[0.75rem] block mb-2">{cur.vendors}</span>
            <span className="text-[3.5rem] font-black leading-none text-white">{approvedVendors}</span>
          </div>
        </div>

        {/* LIVE DATA LEDGER TABLE */}
        <div className="bg-minimal border-minimal rounded-[24px] overflow-hidden opacity-0 animate-fade stagger-2">
          <div className="p-8 border-b border-[#222]">
            <h2 className="text-[1.5rem] font-black">{cur.title}</h2>
          </div>
          
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1100px]">
              <thead>
                <tr className="border-b border-[#222] text-[#666] text-[0.7rem] uppercase tracking-widest">
                  <th className="p-6 font-bold">{cur.th_id}</th>
                  <th className="p-6 font-bold">{cur.th_user}</th>
                  <th className="p-6 font-bold">{cur.th_ops}</th>
                  <th className="p-6 font-bold">{cur.th_status}</th>
                  <th className="p-6 font-bold text-right">{cur.th_act}</th>
                </tr>
              </thead>
              <tbody className="text-[0.85rem]">
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="p-12 text-center">
                      <div className="w-6 h-6 border-2 border-[#333] border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                      <div className="text-[#666] font-mono uppercase tracking-widest text-[0.7rem]">Syncing live database...</div>
                    </td>
                  </tr>
                ) : waitlistData.length === 0 ? (
                  <tr><td colSpan="5" className="p-12 text-center text-[#666] font-mono">Registry Empty.</td></tr>
                ) : (
                  waitlistData.map((user) => (
                    <tr key={user.id} className="border-b border-[#111] hover-minimal transition-colors">
                      
                      <td className="p-6 font-mono text-[#666]">{user.id?.substring(0,8)}</td>
                      
                      <td className="p-6">
                        <div className="font-bold text-white mb-1 text-[1rem] flex items-center gap-2">
                          {user.name}
                          {user.businessName && <span className="text-[0.65rem] font-mono bg-[#222] px-2 py-0.5 rounded text-[#aaa] tracking-widest uppercase">{user.businessName}</span>}
                        </div>
                        <div className="text-[#666]">{user.email} <span className="mx-2">|</span> {user.phone}</div>
                      </td>
                      
                      <td className="p-6">
                        <div className="font-bold text-[#aaa]">{user.role}</div>
                        <div className="text-[#666]">{user.city} {user.vehicle ? `| ${user.vehicle}` : ''}</div>
                      </td>
                      
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-widest border ${
                          user.kycStatus === 'approved' ? 'border-white text-white' : 
                          user.kycStatus === 'banned' ? 'border-[#666] text-[#666] line-through' : 
                          'border-[#aaa] text-[#aaa]'
                        }`}>
                          {user.kycStatus || 'pending'}
                        </span>
                      </td>
                      
                      <td className="p-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {/* Secure Document Viewer Button */}
                          {(!['Buyer', 'Customer', 'Consumer / Buyer'].includes(user.role)) && (
                            <button onClick={() => viewDocs(user.pocketbaseId)} className="text-[#666] hover:text-white font-bold text-[0.75rem] uppercase tracking-widest transition-colors">
                              [{cur.doc}]
                            </button>
                          )}
                          
                          {/* Admin Live Action Group */}
                          <div className="flex gap-1 ml-4 border border-[#333] rounded-full p-1 bg-black">
                            <button onClick={() => handleAction(user.id, 'approved')} className="px-3 py-1 rounded-full text-[0.7rem] font-bold hover:bg-white hover:text-black transition-colors">{cur.app}</button>
                            <button onClick={() => handleAction(user.id, 'pending')} className="px-3 py-1 rounded-full text-[0.7rem] font-bold hover:bg-[#333] transition-colors">{cur.den}</button>
                            <button onClick={() => handleAction(user.id, 'banned')} className="px-3 py-1 rounded-full text-[0.7rem] font-bold text-[#666] hover:text-white hover:bg-[#222] transition-colors">{cur.ban}</button>
                          </div>
                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* MODAL: DOCUMENT VIEWER */}
      {docModalActive && (
        <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-8 animate-fade">
          <div className="w-full max-w-[1000px] h-[85vh] bg-[#050505] border border-[#222] rounded-[24px] flex flex-col overflow-hidden shadow-[0_0_100px_rgba(255,255,255,0.05)]">
            
            <div className="p-6 border-b border-[#222] flex items-center justify-between bg-black">
              <h3 className="font-black text-[1.2rem]">Compliance Artifact Viewer</h3>
              <button onClick={closeDocModal} className="text-[#888] hover:text-white font-bold text-[0.8rem] uppercase tracking-widest transition-colors px-4 py-2 border border-[#333] rounded-lg hover:border-white">
                {cur.close}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-10">
              {docLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <div className="w-8 h-8 border-2 border-[#333] border-t-white rounded-full animate-spin"></div>
                  <p className="text-[#888] font-mono text-[0.8rem] uppercase tracking-widest">Establishing Secure Tunnel...</p>
                </div>
              ) : docError ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-[#ff4444] text-center max-w-[600px] mx-auto">
                  <p className="font-bold text-[1.2rem]">Integrity Fault</p>
                  <p className="text-[0.9rem] leading-relaxed">{docError}</p>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-4">
                    <h4 className="text-[0.8rem] font-black uppercase tracking-widest text-[#666]">1. GST Certificate</h4>
                    {activeDocUrls.gst ? (
                      <div className="w-full h-[500px] border border-[#222] rounded-xl overflow-hidden bg-black">
                        <iframe src={activeDocUrls.gst} className="w-full h-full" title="GST Document" />
                      </div>
                    ) : <p className="text-[#444] font-mono text-[0.8rem]">Artifact Missing</p>}
                  </div>

                  <div className="flex flex-col gap-4">
                    <h4 className="text-[0.8rem] font-black uppercase tracking-widest text-[#666]">2. Permanent Account Number (PAN)</h4>
                    {activeDocUrls.pan ? (
                      <div className="w-full h-[500px] border border-[#222] rounded-xl overflow-hidden bg-black">
                        <iframe src={activeDocUrls.pan} className="w-full h-full" title="PAN Document" />
                      </div>
                    ) : <p className="text-[#444] font-mono text-[0.8rem]">Artifact Missing</p>}
                  </div>

                  <div className="flex flex-col gap-4">
                    <h4 className="text-[0.8rem] font-black uppercase tracking-widest text-[#666]">3. Aadhaar Verification</h4>
                    {activeDocUrls.aadhaar ? (
                      <div className="w-full h-[500px] border border-[#222] rounded-xl overflow-hidden bg-black">
                        <iframe src={activeDocUrls.aadhaar} className="w-full h-full" title="Aadhaar Document" />
                      </div>
                    ) : <p className="text-[#444] font-mono text-[0.8rem]">Artifact Missing</p>}
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}