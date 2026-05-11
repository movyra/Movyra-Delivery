import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export default function WaitlistDashboard() {
  // 1. STATE MANAGEMENT
  const [waitlistData, setWaitlistData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lang, setLang] = useState('en');

  // Derived Business KPIs from Live Data
  const total = waitlistData.length;
  const pendingKYC = waitlistData.filter(u => u.kycStatus === 'pending').length;
  const approvedFleet = waitlistData.filter(u => u.kycStatus === 'approved' && u.role === 'Driver Partner').length;
  const approvedVendors = waitlistData.filter(u => u.kycStatus === 'approved' && u.role.includes('Restaurant')).length;

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

  // 3. 13-LANGUAGE ADMIN DICTIONARY
  const t = {
    en: { title: "Admin Overview", export: "Export CSV", total: "Total Registry", pending: "Pending KYC", fleet: "Active Fleet", vendors: "Active Vendors", th_id: "ID", th_user: "User Entity", th_ops: "Operations", th_status: "Status", th_act: "Actions", doc: "Docs", app: "Approve", den: "Deny", ban: "Ban" },
    hi: { title: "प्रशासक अवलोकन", export: "CSV निर्यात", total: "कुल पंजीकरण", pending: "लंबित KYC", fleet: "सक्रिय फ्लीट", vendors: "सक्रिय विक्रेता", th_id: "आईडी", th_user: "उपयोगकर्ता", th_ops: "संचालन", th_status: "स्थिति", th_act: "कार्रवाई", doc: "दस्तावेज़", app: "मंजूरी", den: "अस्वीकार", ban: "बैन" },
    hinglish: { title: "Admin Overview", export: "CSV Export", total: "Total Users", pending: "Pending KYC", fleet: "Active Drivers", vendors: "Active Vendors", th_id: "ID", th_user: "User Details", th_ops: "Operations", th_status: "Status", th_act: "Actions", doc: "Docs", app: "Approve", den: "Deny", ban: "Ban" },
    mr: { title: "प्रशासक विहंगावलोकन", export: "CSV निर्यात", total: "एकूण नोंदणी", pending: "प्रलंबित KYC", fleet: "सक्रिय फ्लीट", vendors: "सक्रिय विक्रेते", th_id: "आयडी", th_user: "वापरकर्ता", th_ops: "ऑपरेशन्स", th_status: "स्थिती", th_act: "कृती", doc: "कागदपत्रे", app: "मंजूर", den: "नाकारणे", ban: "बंदी" },
    gu: { title: "એડમિન વિહંગાવલોકન", export: "CSV નિકાસ", total: "કુલ નોંધણી", pending: "બાકી KYC", fleet: "સક્રિય ફ્લીટ", vendors: "સક્રિય વિક્રેતાઓ", th_id: "આઈડી", th_user: "વપરાશકર્તા", th_ops: "કામગીરી", th_status: "સ્થિતિ", th_act: "ક્રિયાઓ", doc: "દસ્તાવેજ", app: "મંજૂર", den: "નકારો", ban: "પ્રતિબંધ" },
    te: { title: "అడ్మిన్ అవలోకనం", export: "CSV ఎగుమతి", total: "మొత్తం రిజిస్ట్రీ", pending: "పెండింగ్ KYC", fleet: "యాక్టివ్ ఫ్లీట్", vendors: "యాక్టివ్ వెండర్స్", th_id: "ID", th_user: "యూజర్", th_ops: "ఆపరేషన్స్", th_status: "స్థితి", th_act: "చర్యలు", doc: "పత్రాలు", app: "ఆమోదించండి", den: "తిరస్కరించు", ban: "నిషేధం" },
    ta: { title: "நிர்வாக கண்ணோட்டம்", export: "CSV ஏற்றுமதி", total: "மொத்த பதிவு", pending: "நிலுவையில் உள்ள KYC", fleet: "செயலில் உள்ள கடற்படை", vendors: "செயலில் உள்ள விற்பனையாளர்கள்", th_id: "ஐடி", th_user: "பயனர்", th_ops: "செயல்பாடுகள்", th_status: "நிலை", th_act: "செயல்கள்", doc: "ஆவணங்கள்", app: "ஒப்புதல்", den: "மறுக்க", ban: "தடை" },
    pa: { title: "ਐਡਮਿਨ ਸੰਖੇਪ ਜਾਣਕਾਰੀ", export: "CSV ਨਿਰਯਾਤ", total: "ਕੁੱਲ ਰਜਿਸਟਰੀ", pending: "ਬਕਾਇਆ KYC", fleet: "ਐਕਟਿਵ ਫਲੀਟ", vendors: "ਐਕਟਿਵ ਵਿਕਰੇਤਾ", th_id: "ID", th_user: "ਯੂਜ਼ਰ", th_ops: "ਕਾਰਵਾਈਆਂ", th_status: "ਸਥਿਤੀ", th_act: "ਐਕਸ਼ਨ", doc: "ਦਸਤਾਵੇਜ਼", app: "ਮਨਜ਼ੂਰ", den: "ਇਨਕਾਰ", ban: "ਪਾਬੰਦੀ" },
    bho: { title: "एडमिन ओवरव्यू", export: "CSV एक्सपोर्ट", total: "कुल रजिस्ट्री", pending: "पेंडिंग KYC", fleet: "एक्टिव फ्लीट", vendors: "एक्टिव वेंडर", th_id: "ID", th_user: "यूजर", th_ops: "ऑपरेशंस", th_status: "स्टेटस", th_act: "एक्शन", doc: "डाक्यूमेंट्स", app: "मंजूर", den: "अस्वीकार", ban: "बैन" },
    ar: { title: "نظرة عامة للمسؤول", export: "تصدير CSV", total: "إجمالي التسجيل", pending: "KYC قيد الانتظار", fleet: "الأسطول النشط", vendors: "البائعون النشطون", th_id: "المعرف", th_user: "المستخدم", th_ops: "العمليات", th_status: "الحالة", th_act: "الإجراءات", doc: "مستندات", app: "موافقة", den: "رفض", ban: "حظر" },
    es: { title: "Resumen del Administrador", export: "Exportar CSV", total: "Registro Total", pending: "KYC Pendiente", fleet: "Flota Activa", vendors: "Vendedores Activos", th_id: "ID", th_user: "Usuario", th_ops: "Operaciones", th_status: "Estado", th_act: "Acciones", doc: "Docs", app: "Aprobar", den: "Denegar", ban: "Prohibir" },
    fr: { title: "Aperçu de l'Administrateur", export: "Exporter CSV", total: "Registre Total", pending: "KYC en attente", fleet: "Flotte Active", vendors: "Vendeurs Actifs", th_id: "ID", th_user: "Utilisateur", th_ops: "Opérations", th_status: "Statut", th_act: "Actions", doc: "Docs", app: "Approuver", den: "Refuser", ban: "Bannir" },
    de: { title: "Admin Übersicht", export: "CSV Export", total: "Gesamtregister", pending: "Ausstehendes KYC", fleet: "Aktive Flotte", vendors: "Aktive Anbieter", th_id: "ID", th_user: "Benutzer", th_ops: "Betrieb", th_status: "Status", th_act: "Aktionen", doc: "Doks", app: "Genehmigen", den: "Ablehnen", ban: "Sperren" }
  };

  const cur = t[lang] || t['en'];

  // 4. ADMIN LIVE DATABASE ACTIONS
  const handleAction = async (userId, newStatus) => {
    try {
      const userRef = doc(db, 'pre_registrations', userId);
      await updateDoc(userRef, { kycStatus: newStatus });
    } catch (error) {
      console.error("Database Update Failed:", error);
      alert("Error: Insufficient privileges or database disconnect.");
    }
  };

  // 5. POCKETBASE DOCUMENT VIEWER
  const viewDocs = (pbId) => {
    if (!pbId) return alert("System Log: No PocketBase artifact ID associated with this entity.");
    // In production, this connects to the HF PocketBase instance via an authenticated API call
    alert(`Secure Tunnel Initiated.\nFetching KYC Artifacts (GST/PAN/Aadhaar) for Record: ${pbId}\nConnecting to Hugging Face instance...`);
  };

  // 6. CSV EXPORT ENGINE
  const exportCSV = () => {
    if (waitlistData.length === 0) return;
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Role', 'City', 'Vehicle', 'Status', 'Timestamp'];
    const rows = waitlistData.map(u => [ 
      u.id, `"${u.name}"`, `"${u.email}"`, `"${u.phone}"`, `"${u.role}"`, 
      `"${u.city || ''}"`, `"${u.vehicle || ''}"`, `"${u.kycStatus}"`, `"${u.timestamp}"` 
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
      <header className="w-full flex items-center justify-between px-8 md:px-16 py-8 border-b border-[#222222] bg-black sticky top-0 z-50 animate-fade">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="white"><path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13.5h-13L12 6.5z"/></svg>
          <span className="font-black text-[1.5rem] tracking-tighter ml-[-5px]">movyra <span className="text-[#666] font-normal tracking-widest text-[1rem] uppercase ml-2">Admin</span></span>
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
            <table className="w-full text-left border-collapse min-w-[1000px]">
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
                        <div className="font-bold text-white mb-1 text-[1rem]">{user.name}</div>
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
                          {/* Secure Document Viewer Button (Vendors/Drivers Only) */}
                          {user.role !== 'Customer' && (
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
    </div>
  );
}