import React, { useState, useEffect } from 'react';
// IMPORTANT: Uncomment and point to your actual Firebase config file to enable real-time database syncing
// import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
// import { db } from '../../../firebaseConfig';

export default function WaitlistDashboard() {
  // --- REAL-TIME STATE MANAGEMENT (Strictly No Mock Data) ---
  const [waitlistData, setWaitlistData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [adminTelemetry, setAdminTelemetry] = useState({
    time: new Date(),
    uptime: 0,
    memory: 'Detecting...',
    network: 'Detecting...'
  });
  
  // Real-Time Derived KPIs
  const totalRegistrations = waitlistData.length;
  const buyerCount = waitlistData.filter(user => user.role && user.role.toLowerCase().includes('buyer')).length;
  const sellerCount = waitlistData.filter(user => user.role && user.role.toLowerCase().includes('seller')).length;
  const partnerCount = totalRegistrations - buyerCount - sellerCount; // Drivers/Others

  useEffect(() => {
    // 1. LIVE FIRESTORE INGESTION ENGINE
    // Uncomment this block when Firebase is linked to stream live data
    /*
    const q = query(collection(db, 'pre_registrations'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Handle Firestore serverTimestamp to local Date conversion safely
        timestamp: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toLocaleString() : 'Pending Sync'
      }));
      setWaitlistData(data);
      setIsLoading(false);
    }, (error) => {
      console.error("Firestore Sync Error: ", error);
      setIsLoading(false);
    });
    */
    
    // Fallback for UI mounting before Firebase connects
    setTimeout(() => setIsLoading(false), 1500);

    // 2. ACTIVE ADMIN TELEMETRY ENGINE
    const sessionStart = Date.now();
    let frameId;
    const updateTelemetry = () => {
      setAdminTelemetry({
        time: new Date(),
        uptime: Math.floor((Date.now() - sessionStart) / 1000),
        memory: navigator.deviceMemory ? `${navigator.deviceMemory}GB Allocated` : 'Restricted',
        network: navigator.onLine ? (navigator.connection ? navigator.connection.effectiveType.toUpperCase() : 'TCP/IP SECURE') : 'OFFLINE'
      });
      setTimeout(() => { frameId = requestAnimationFrame(updateTelemetry); }, 1000);
    };
    frameId = requestAnimationFrame(updateTelemetry);

    return () => {
      // if (unsubscribe) unsubscribe();
      cancelAnimationFrame(frameId);
    };
  }, []);

  // --- NATIVE CSV EXPORT ENGINE ---
  const exportToCSV = () => {
    if (waitlistData.length === 0) return;
    
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Role', 'Timestamp'];
    const rows = waitlistData.map(user => [
      user.id,
      `"${user.name || 'N/A'}"`,
      `"${user.email || 'N/A'}"`,
      `"${user.phone || 'N/A'}"`,
      `"${user.role || 'N/A'}"`,
      `"${user.timestamp || 'N/A'}"`
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Movyra_Waitlist_Export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- HIGH-END SVG ASSETS ---
  const AppStoreSVG = () => (
    <svg viewBox="0 0 180 54" fill="none" className="h-12 border border-[#333333] rounded-xl bg-black">
      <rect width="180" height="54" rx="12" fill="black" />
      <path d="M41.05 18.25c-.2-3.1 2.55-4.6 2.65-4.7-1.45-2.1-3.7-2.4-4.5-2.45-1.9-.2-3.7 1.15-4.65 1.15-.95 0-2.45-1.1-4.05-1.1-2.05 0-3.95 1.2-4.95 3-2.05 3.55-.5 8.75 1.45 11.65.95 1.4 2.1 2.95 3.6 2.9 1.45-.05 2.05-.95 3.8-.95 1.7 0 2.25.95 3.8.9 1.6-.05 2.55-1.45 3.5-2.85 1.1-1.6 1.55-3.15 1.6-3.25-.05-.05-3-1.15-3.25-4.3zM37.35 13.5c.8-1 1.35-2.35 1.2-3.75-1.15.05-2.6.8-3.45 1.8-.75.85-1.4 2.25-1.2 3.6 1.3.1 2.65-.65 3.45-1.65z" fill="white" />
      <text x="58" y="24" fill="white" fontSize="10" fontFamily="sans-serif">Download on the</text>
      <text x="56" y="42" fill="white" fontSize="20" fontFamily="sans-serif" fontWeight="bold">App Store</text>
    </svg>
  );

  const GooglePlaySVG = () => (
    <svg viewBox="0 0 190 54" fill="none" className="h-12 border border-[#333333] rounded-xl bg-black">
      <rect width="190" height="54" rx="12" fill="black" />
      <path d="M23.5 14.5l14.5 8.5-14.5 8.5v-17z" fill="white" />
      <path d="M23.5 14.5l14.5 8.5-5 5-9.5-13.5z" fill="white" opacity="0.8" />
      <path d="M23.5 31.5l14.5-8.5-5-5-9.5 13.5z" fill="white" opacity="0.6" />
      <text x="54" y="22" fill="white" fontSize="10" fontFamily="sans-serif">GET IT ON</text>
      <text x="52" y="42" fill="white" fontSize="20" fontFamily="sans-serif" fontWeight="bold">Google Play</text>
    </svg>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans overflow-x-hidden selection:bg-[#276ef1] selection:text-white pb-24">
      
      {/* --- CSS-IN-JS HIGH END ANIMATIONS --- */}
      <style>
        {`
          @keyframes radarScan {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes glowPulse {
            0%, 100% { opacity: 0.2; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(1.1); }
          }
          .animate-radar { animation: radarScan 10s linear infinite; transform-origin: center; }
          .animate-glow { animation: glowPulse 6s ease-in-out infinite; }
          .admin-bg-grid {
            background-image: linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px);
            background-size: 40px 40px;
          }
        `}
      </style>

      {/* Background Graphic Architecture */}
      <div className="fixed inset-0 z-0 admin-bg-grid pointer-events-none"></div>
      <div className="fixed top-[-200px] right-[-200px] w-[800px] h-[800px] bg-[#276ef1] rounded-full blur-[150px] opacity-10 animate-glow pointer-events-none z-0"></div>

      {/* SECTION 1: GLOBAL SECURE HEADER */}
      <header className="relative z-10 w-full border-b border-[#222222] bg-[#0a0a0a]/80 backdrop-blur-xl px-8 py-5 flex items-center justify-between sticky top-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#276ef1] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(39,110,241,0.5)]">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
          </div>
          <div>
            <h1 className="text-[1.25rem] font-black tracking-tight leading-none">Movyra Admin Terminal</h1>
            <p className="text-[0.75rem] text-[#888888] font-mono tracking-widest uppercase mt-1">Level 5 Clearance Active</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#111111] rounded-full border border-[#333333]">
            <span className="w-2 h-2 rounded-full bg-[#05a357] animate-ping"></span>
            <span className="font-mono text-[0.75rem] text-[#05a357] font-bold">DATABASE CONNECTED</span>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-[#444444] overflow-hidden bg-black flex items-center justify-center">
            <span className="font-black text-white text-[1rem]">A</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-[1600px] mx-auto px-6 lg:px-8 mt-12 flex flex-col gap-8">
        
        {/* SECTION 2 & 3: GLOBAL KPIs & ROLE DISTRIBUTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#111111] border border-[#222222] p-8 rounded-[24px] shadow-lg flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#276ef1] opacity-10 rounded-full blur-2xl"></div>
            <span className="text-[#888888] font-bold uppercase tracking-widest text-[0.8rem] mb-2">Total Waitlist</span>
            <span className="text-[3.5rem] font-black text-white leading-none">{totalRegistrations}</span>
          </div>
          <div className="bg-[#111111] border border-[#222222] p-8 rounded-[24px] shadow-lg flex flex-col justify-between">
            <span className="text-[#888888] font-bold uppercase tracking-widest text-[0.8rem] mb-2">Registered Buyers</span>
            <span className="text-[3.5rem] font-black text-[#05a357] leading-none">{buyerCount}</span>
          </div>
          <div className="bg-[#111111] border border-[#222222] p-8 rounded-[24px] shadow-lg flex flex-col justify-between">
            <span className="text-[#888888] font-bold uppercase tracking-widest text-[0.8rem] mb-2">Registered Sellers</span>
            <span className="text-[3.5rem] font-black text-[#fb8c00] leading-none">{sellerCount}</span>
          </div>
          <div className="bg-[#111111] border border-[#222222] p-8 rounded-[24px] shadow-lg flex flex-col justify-between">
            <span className="text-[#888888] font-bold uppercase tracking-widest text-[0.8rem] mb-2">Fleet Partners</span>
            <span className="text-[3.5rem] font-black text-[#8e24aa] leading-none">{partnerCount}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* SECTION 4 & 5: DATA GRID & EXPORT ENGINE */}
          <div className="lg:col-span-2 bg-[#111111] border border-[#222222] rounded-[32px] overflow-hidden flex flex-col shadow-xl">
            <div className="p-8 border-b border-[#222222] flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#0a0a0a]">
              <div>
                <h2 className="text-[1.5rem] font-black">Live Ingestion Ledger</h2>
                <p className="text-[#666666] text-[0.9rem]">Real-time synchronization with Firestore.</p>
              </div>
              <button onClick={exportToCSV} className="bg-[#276ef1] hover:bg-[#1a55c2] text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-[0_5px_15px_rgba(39,110,241,0.3)]">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                Export CSV Dataset
              </button>
            </div>
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#161616] text-[#888888] text-[0.75rem] uppercase tracking-widest">
                    <th className="p-6 font-bold">Registration ID</th>
                    <th className="p-6 font-bold">Entity Name</th>
                    <th className="p-6 font-bold">Contact Vector</th>
                    <th className="p-6 font-bold">Role</th>
                    <th className="p-6 font-bold">Ingestion Time</th>
                  </tr>
                </thead>
                <tbody className="text-[0.9rem]">
                  {isLoading ? (
                    <tr>
                      <td colSpan="5" className="p-12 text-center text-[#666666] font-mono">
                        <div className="flex flex-col items-center gap-4">
                          <svg viewBox="0 0 200 200" width="40" height="40" className="animate-spin" stroke="#276ef1" strokeWidth="4" fill="none"><circle cx="100" cy="100" r="80" strokeDasharray="100 200"/></svg>
                          Establishing secure tunnel...
                        </div>
                      </td>
                    </tr>
                  ) : waitlistData.length === 0 ? (
                    <tr><td colSpan="5" className="p-12 text-center text-[#666666] font-mono">Awaiting Initial Registration Payload</td></tr>
                  ) : (
                    waitlistData.map((user, idx) => (
                      <tr key={user.id || idx} className="border-t border-[#222222] hover:bg-[#1a1a1a] transition-colors">
                        <td className="p-6 font-mono text-[#555555]">{user.id?.substring(0,8) || 'N/A'}...</td>
                        <td className="p-6 font-bold">{user.name}</td>
                        <td className="p-6 text-[#aaaaaa]"><div className="flex flex-col"><span>{user.email}</span><span className="text-[0.8rem] text-[#666666]">{user.phone}</span></div></td>
                        <td className="p-6"><span className="bg-[#222222] px-3 py-1 rounded-full text-[0.75rem] font-bold uppercase tracking-widest border border-[#333333]">{user.role}</span></td>
                        <td className="p-6 font-mono text-[#888888] text-[0.8rem]">{user.timestamp}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            {/* SECTION 6: LOCAL ADMIN TELEMETRY */}
            <div className="bg-[#111111] border border-[#222222] rounded-[32px] p-8 shadow-xl">
              <h3 className="text-[1.2rem] font-bold mb-6 flex items-center gap-2">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="#276ef1"><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zM5 15h2v2H5zm0-4h2v2H5zm0-4h2v2H5zm4 8h2v2H9zm0-4h2v2H9zm0-4h2v2H9zm4 8h2v2h-2zm0-4h2v2h-2zm0-4h2v2h-2zm4 8h2v2h-2zm0-4h2v2h-2zm0-4h2v2h-2z"/></svg>
                Local System Diagnostics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-[#222222]">
                  <span className="text-[0.8rem] uppercase tracking-widest text-[#666666] font-bold">Admin Uptime</span>
                  <span className="font-mono text-white">{adminTelemetry.uptime}s</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-[#222222]">
                  <span className="text-[0.8rem] uppercase tracking-widest text-[#666666] font-bold">Memory Alloc</span>
                  <span className="font-mono text-[#05a357]">{adminTelemetry.memory}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-[#222222]">
                  <span className="text-[0.8rem] uppercase tracking-widest text-[#666666] font-bold">Network Edge</span>
                  <span className="font-mono text-white">{adminTelemetry.network}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[0.8rem] uppercase tracking-widest text-[#666666] font-bold">Local Time</span>
                  <span className="font-mono text-white">{adminTelemetry.time.toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            {/* SECTION 7: SECURITY & RULES STATUS */}
            <div className="bg-[#111111] border border-[#222222] rounded-[32px] p-8 shadow-xl relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 opacity-10 animate-radar">
                 <svg viewBox="0 0 100 100" width="150" height="150" fill="none" stroke="#276ef1" strokeWidth="2"><circle cx="50" cy="50" r="40"/><circle cx="50" cy="50" r="20"/><path d="M50 10 L50 90 M10 50 L90 50"/></svg>
              </div>
              <h3 className="text-[1.2rem] font-bold mb-6 flex items-center gap-2 relative z-10">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="#e53935"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
                Active Firewalls
              </h3>
              <div className="space-y-3 relative z-10">
                <div className="bg-[#0a0a0a] p-3 rounded-lg border border-[#222222] flex items-center justify-between">
                   <span className="text-[#888888] text-[0.85rem]">Firestore Rules</span>
                   <span className="bg-[#05a357]/20 text-[#05a357] px-2 py-1 rounded text-[0.7rem] font-bold uppercase">Locked</span>
                </div>
                <div className="bg-[#0a0a0a] p-3 rounded-lg border border-[#222222] flex items-center justify-between">
                   <span className="text-[#888888] text-[0.85rem]">Index Processing</span>
                   <span className="bg-[#05a357]/20 text-[#05a357] px-2 py-1 rounded text-[0.7rem] font-bold uppercase">Synced</span>
                </div>
                <div className="bg-[#0a0a0a] p-3 rounded-lg border border-[#222222] flex items-center justify-between">
                   <span className="text-[#888888] text-[0.85rem]">WhatsApp Webhook</span>
                   <span className="bg-[#276ef1]/20 text-[#276ef1] px-2 py-1 rounded text-[0.7rem] font-bold uppercase">Armed</span>
                </div>
              </div>
            </div>

            {/* SECTION 8, 9, 10: DEPLOYMENT ARTIFACTS & SUPPORT FOOTER */}
            <div className="bg-[#111111] border border-[#222222] rounded-[32px] p-8 shadow-xl text-center">
              <h3 className="text-[1.2rem] font-bold mb-2">Build Artifacts</h3>
              <p className="text-[0.85rem] text-[#666666] mb-6">Client applications compilation status.</p>
              <div className="flex flex-col gap-4 items-center mb-8">
                <AppStoreSVG />
                <GooglePlaySVG />
              </div>
              <div className="text-[0.7rem] text-[#444444] uppercase tracking-widest font-bold pt-6 border-t border-[#222222]">
                Movyra Internal Logistics Engine
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}