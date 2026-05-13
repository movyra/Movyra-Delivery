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
  
  // Document Viewer State
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
      // SecureAdminGate observer will automatically catch this state change and eject the user
    } catch (error) {
      console.error("Session termination failed:", error);
      alert("Error: Unable to safely terminate session.");
    }
  };

  // 4. 13-LANGUAGE ADMIN DICTIONARY
  const t = {
    en: { title: "Admin Ledger", export: "Export CSV", logout: "Terminate Session", total: "Total Registry", pending: "Pending KYC", fleet: "Active Fleet", vendors: "Active Vendors", th_id: "ID", th_user: "User Entity", th_ops: "Operations", th_status: "Status", th_act: "Actions", doc: "Docs", app: "Approve", den: "Deny", ban: "Ban", close: "Close Viewer" },
    hi: { title: "एडमिन लेजर", export: "CSV निर्यात", logout: "सत्र समाप्त करें", total: "कुल पंजीकरण", pending: "लंबित KYC", fleet: "सक्रिय फ्लीट", vendors: "सक्रिय विक्रेता", th_id: "आईडी", th_user: "उपयोगकर्ता", th_ops: "संचालन", th_status: "स्थिति", th_act: "कार्रवाई", doc: "दस्तावेज़", app: "मंजूरी", den: "अस्वीकार", ban: "बैन", close: "बंद करें" }
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
    if (!pbId || pbId === 'none') {
      alert("System Log: No PocketBase artifact ID associated with this entity.");
      return;
    }
    
    setDocModalActive(true);
    setDocLoading(true);
    setDocError(null);

    try {
      const urls = await getKYCDocumentUrls(pbId);
      setActiveDocUrls({
        gst: urls.gstUrl,
        pan: urls.panUrl,
        aadhaar: urls.aadhaarUrl
      });
    } catch (error) {
      console.error("Document fetch failed:", error);
      setDocError("Failed to establish secure tunnel to Hugging Face instance. Artifacts unavailable.");
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

      {/* SECURE HEADER */}
      <header className="w-full flex items-center justify-between px-8 md:px-16 py-8 border-b border-[#222222] bg-[#000000] sticky top-0 z-40 animate-fade">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13.5h-13L12 6.5z"/></svg>
          <span className="font-black text-[1.5rem] tracking-tighter">movyra <span className="text-[#666] font-normal tracking-widest text-[0.8rem] uppercase ml-2">Admin Ledger</span></span>
        </div>
        
        <div className="flex items-center gap-4 text-[0.85rem] font-bold">
          <select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-transparent outline-none cursor-pointer hover:text-[#aaa] transition-colors appearance-none uppercase tracking-widest mr-4">
            <option value="en" className="text-black">EN</option>
            <option value="hi" className="text-black">HI</option>
          </select>
          <button onClick={exportCSV} className="border border-[#333] text-white px-5 py-2 rounded-xl font-bold hover:bg-white hover:text-black transition-colors">{cur.export}</button>
          <button onClick={handleSignOut} className="bg-[#111] border border-[#ff4444]/30 text-[#ff4444] px-5 py-2 rounded-xl font-bold hover:bg-[#ff4444] hover:text-white transition-colors">{cur.logout}</button>
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
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className="border-b border-[#222] text-[#666] text-[0.7rem] uppercase tracking-widest bg-[#0a0a0a]">
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
                    <td colSpan="5" className="p-16 text-center">
                      <div className="w-6 h-6 border-2 border-[#333] border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                      <div className="text-[#666] font-mono uppercase tracking-widest text-[0.7rem]">Syncing live database...</div>
                    </td>
                  </tr>
                ) : waitlistData.length === 0 ? (
                  <tr><td colSpan="5" className="p-16 text-center text-[#666] font-mono uppercase tracking-widest">Registry Empty</td></tr>
                ) : (
                  waitlistData.map((user) => (
                    <tr key={user.id} className="border-b border-[#111] hover-minimal transition-colors">
                      
                      <td className="p-6 font-mono text-[#666]">{user.id?.substring(0,8)}</td>
                      
                      <td className="p-6">
                        <div className="font-bold text-white mb-1 text-[1rem] flex items-center gap-2">
                          {user.name} 
                          {user.businessName && <span className="text-[0.7rem] font-mono bg-[#222] px-2 py-0.5 rounded text-[#aaa]">{user.businessName}</span>}
                        </div>
                        <div className="text-[#666]">{user.email} <span className="mx-2">|</span> {user.phone}</div>
                      </td>
                      
                      <td className="p-6">
                        <div className="font-bold text-[#aaa] mb-1">{user.role}</div>
                        <div className="text-[#666]">{user.city} {user.vehicle ? `| [${user.vehicle}]` : ''}</div>
                      </td>
                      
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-widest border ${
                          user.kycStatus === 'approved' ? 'border-white text-white bg-white/5' : 
                          user.kycStatus === 'banned' ? 'border-[#ff4444] text-[#ff4444] bg-[#ff4444]/5' : 
                          'border-[#aaa] text-[#aaa]'
                        }`}>
                          {user.kycStatus || 'pending'}
                        </span>
                      </td>
                      
                      <td className="p-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {/* Secure Document Viewer Button (Exclude Consumers) */}
                          {user.role !== 'Consumer / Buyer' && user.role !== 'Buyer' && user.role !== 'Customer' && (
                            <button onClick={() => viewDocs(user.pocketbaseId)} className="text-[#888] hover:text-white font-bold text-[0.75rem] uppercase tracking-widest transition-colors flex items-center gap-1">
                              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                              [{cur.doc}]
                            </button>
                          )}
                          
                          {/* Admin Live Action Group */}
                          <div className="flex gap-1 ml-4 border border-[#222] rounded-full p-1 bg-black">
                            <button onClick={() => handleAction(user.id, 'approved')} className="px-3 py-1.5 rounded-full text-[0.65rem] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors">{cur.app}</button>
                            <button onClick={() => handleAction(user.id, 'pending')} className="px-3 py-1.5 rounded-full text-[0.65rem] font-bold uppercase tracking-widest hover:bg-[#222] transition-colors">{cur.den}</button>
                            <button onClick={() => handleAction(user.id, 'banned')} className="px-3 py-1.5 rounded-full text-[0.65rem] font-bold uppercase tracking-widest text-[#ff4444] hover:bg-[#ff4444] hover:text-white transition-colors">{cur.ban}</button>
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
              <h3 className="font-black text-[1.2rem] flex items-center gap-3">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Compliance Artifact Viewer
              </h3>
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
                <div className="flex flex-col items-center justify-center h-full gap-4 text-[#ff4444]">
                  <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <p className="font-bold">{docError}</p>
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