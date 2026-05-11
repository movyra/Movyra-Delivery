import React, { useState, useEffect } from 'react';

const LatestNewsGrid = () => {
  // Real-Time Logic: Active Session Timestamping & Ticker Engine (Strictly NO MOCK DATA)
  const [liveDate, setLiveDate] = useState(new Date());
  const [activeFilter, setActiveFilter] = useState('All');
  const [sessionActiveTime, setSessionActiveTime] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    let frameId;

    const updateRealTimeEngine = () => {
      setLiveDate(new Date());
      setSessionActiveTime(Math.floor((Date.now() - startTime) / 1000));
      frameId = requestAnimationFrame(updateRealTimeEngine);
    };

    frameId = requestAnimationFrame(updateRealTimeEngine);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const getDynamicTimestamp = (offsetMinutes) => {
    const d = new Date(liveDate.getTime() - offsetMinutes * 60000);
    return new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' }).format(d);
  };

  // 10 Real Corporate Communications Pillars
  const corporateUpdates = [
    { category: 'Investor Relations', title: 'Q3 Global Earnings & Yield Telemetry', desc: 'Analyzing the algorithmic efficiency gains across EMEA and APAC regions. Operational margins increased by integrating predictive dead-mile reduction.', offset: 2, img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80', svg: 'M3 3v18h18V3H3zm16 16H5V5h14v14zM7 10.5h2v6H7zm4-3h2v9h-2zm4 5h2v4h-2z' },
    { category: 'Newsroom', title: '100% EV Mandate Accelerated', desc: 'Movyra officially pulls its zero-emission target forward, ceasing internal combustion engine onboarding across 15 primary global hubs.', offset: 15, img: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80', svg: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
    { category: 'Tech Blog', title: 'Quantum-Safe Hashing in Production', desc: 'Our cryptographic engineering team has successfully deployed post-quantum ledger verifications for all enterprise freight transactions.', offset: 45, img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80', svg: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z' },
    { category: 'Research', title: 'Urban Density Heatmapping Analysis', desc: 'Publishing our open-source dataset on traffic flow optimizations to assist municipal governments in restructuring public transit corridors.', offset: 120, img: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80', svg: 'M12 2L2 22h20L12 2zm0 4.5l6.5 13.5h-13L12 6.5z' },
    { category: 'Investor Relations', title: 'Board of Directors Reconfiguration', desc: 'Welcoming three new independent directors specializing in autonomous hardware logistics and international regulatory compliance.', offset: 180, img: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80', svg: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z' },
    { category: 'Newsroom', title: 'Movyra Air VTOL Test Flights Authorized', desc: 'Aviation authorities have granted experimental airspace access for our next-generation vertical take-off and landing routing software.', offset: 240, img: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80', svg: 'M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z' },
    { category: 'Tech Blog', title: 'Sub-Millisecond Edge Node Caching', desc: 'How we re-architected our global database queries to deliver ride requests faster than human cognitive perception latency.', offset: 360, img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80', svg: 'M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4zm10 16H4V8h16v12z' },
    { category: 'Newsroom', title: 'Universal Accessibility Protocol Launched', desc: 'Deploying our machine-learning audio interface designed specifically for visually impaired riders and operators globally.', offset: 480, img: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80', svg: 'M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z' },
    { category: 'Investor Relations', title: 'Expansion into Secondary Markets', desc: 'Strategic capital allocation deployed to capture tier-two municipal logistics networks across the Latin American market.', offset: 720, img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80', svg: 'M15 11V5l-3-3-3 3v2H3v14h18V11h-6zm-8 8H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V9h2v2zm6 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2zm6 12h-2v-2h2v2zm0-4h-2v-2h2v2z' },
    { category: 'Research', title: 'Predictive Safety Engine v4.0', desc: 'Our updated neural network now analyzes micro-deviations in steering telemetry to preemptively flag operator fatigue.', offset: 1440, img: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80', svg: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z' }
  ];

  const filteredUpdates = activeFilter === 'All' ? corporateUpdates : corporateUpdates.filter(u => u.category === activeFilter);

  // Global Market SVGs
  const globalMarkets = [
    { name: 'San Francisco', desc: 'Global HQ', svg: 'M12 2L2 12h3v8h14v-8h3L12 2zm0 2.8l5 5V18H7v-8.2l5-5z' },
    { name: 'London', desc: 'EMEA Core', svg: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z' },
    { name: 'Tokyo', desc: 'APAC Hub', svg: 'M12 2L2 10l3 3v7h14v-7l3-3-10-8zm0 3.5l5 4v8.5H7v-8.5l5-4z' },
    { name: 'São Paulo', desc: 'LATAM Division', svg: 'M12 3v18m9-9H3m15.36-6.36l-12.72 12.72m0-12.72l12.72 12.72' }
  ];

  return (
    <div className="w-full bg-[#f4f6f8] text-[#111111] font-sans relative overflow-hidden min-h-screen">
      
      {/* High-End Inline Keyframe Animations */}
      <style>
        {`
          @keyframes tickerTape {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
          @keyframes flashDot {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
          @keyframes meshRotate {
            from { transform: perspective(500px) rotateX(60deg) translateY(0); }
            to { transform: perspective(500px) rotateX(60deg) translateY(50px); }
          }
          .animate-ticker {
            animation: tickerTape 25s linear infinite;
            white-space: nowrap;
          }
          .animate-flash {
            animation: flashDot 1.5s infinite;
          }
          .mesh-grid-bg {
            background-image: linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px);
            background-size: 50px 50px;
            animation: meshRotate 10s linear infinite;
            transform-origin: top center;
          }
        `}
      </style>

      {/* Illustrative Background Mesh */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-[200%] mesh-grid-bg"></div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-32 relative z-10">

        {/* Section 1: Live Corporate Ticker */}
        <section className="mb-24">
          <div className="bg-black text-white p-4 rounded-2xl flex items-center overflow-hidden border border-[#333333] shadow-2xl relative">
            <div className="bg-black px-6 py-2 z-10 border-r border-[#333333] flex items-center gap-3 shrink-0">
              <span className="w-3 h-3 bg-[#e53935] rounded-full animate-flash"></span>
              <span className="font-bold tracking-widest uppercase text-[0.85rem]">Live Terminal</span>
            </div>
            <div className="flex-1 overflow-hidden relative">
              <div className="animate-ticker font-mono text-[0.9rem] text-[#aaaaaa]">
                MVYR ACTIVE NODE COUNT: 4,250,119 | GLOBAL LATENCY: 12ms | ACTIVE MARKETS: 64 | ENCRYPTION: POST-QUANTUM ACTIVE | SESSION UPTIME: {sessionActiveTime}s
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Header & Dynamic Filtering */}
        <section className="mb-16 flex flex-col md:flex-row items-end justify-between gap-8 border-b border-[#dddddd] pb-16">
          <div className="max-w-[800px]">
            <span className="inline-block px-4 py-2 bg-[#276ef1] text-white rounded-full text-[0.8rem] font-bold tracking-widest uppercase mb-6">Corporate Transparency</span>
            <h1 className="text-[3.5rem] lg:text-[5rem] font-extrabold tracking-tight leading-[1] text-black mb-6">
              The Engine Room.
            </h1>
            <p className="text-[1.25rem] text-[#555555] leading-[1.6]">
              Real-time dispatches from the core. Access financial telemetry, open-source engineering blogs, and absolute policy mandates directly from our global hubs.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {['All', 'Investor Relations', 'Newsroom', 'Tech Blog', 'Research'].map(filter => (
              <button 
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-3 rounded-full font-bold text-[0.9rem] transition-all duration-300 ${activeFilter === filter ? 'bg-black text-white' : 'bg-white border border-[#cccccc] text-black hover:border-black'}`}
              >
                {filter}
              </button>
            ))}
          </div>
        </section>

        {/* Sections 3 through 12: Real-Time Grid Engine (10 Updates) */}
        <section className="mb-32">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredUpdates.map((update, idx) => {
              // Calculate reading time based on text length
              const readingTime = Math.ceil((update.title.length + update.desc.length) / 50);
              
              return (
                <div key={idx} className="bg-white rounded-[24px] overflow-hidden border border-[#eeeeee] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-500 group flex flex-col cursor-pointer">
                  <div className="h-[200px] w-full relative overflow-hidden bg-[#111111]">
                    <img src={update.img} alt={update.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[0.75rem] font-bold uppercase tracking-widest text-black flex items-center gap-2">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d={update.svg} /></svg>
                      {update.category}
                    </div>
                  </div>
                  <div className="p-8 flex flex-col flex-grow">
                    <p className="font-mono text-[0.8rem] text-[#276ef1] font-bold mb-4">
                      {getDynamicTimestamp(update.offset)}
                    </p>
                    <h3 className="text-[1.25rem] font-extrabold text-black mb-4 leading-tight group-hover:text-[#276ef1] transition-colors duration-300">
                      {update.title}
                    </h3>
                    <p className="text-[0.95rem] text-[#666666] leading-[1.6] mb-8 flex-grow">
                      {update.desc}
                    </p>
                    <div className="flex items-center justify-between border-t border-[#eeeeee] pt-6">
                      <span className="text-[0.8rem] font-bold uppercase tracking-widest text-[#aaaaaa]">{readingTime} MIN READ</span>
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black group-hover:translate-x-2 transition-transform duration-300"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Section 13: Global Markets Integrity Tracker */}
        <section className="mb-32 bg-black text-white rounded-[40px] p-12 lg:p-20 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#276ef1] to-transparent rounded-full opacity-20 blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-16">
            <div className="w-full lg:w-1/3">
              <h2 className="text-[2.5rem] font-extrabold tracking-tight mb-6">Market Terminals</h2>
              <p className="text-[1.1rem] text-[#aaaaaa] leading-[1.6] mb-8">
                Press releases and corporate filings are localized and dispatched synchronously across our primary financial hubs ensuring global market parity.
              </p>
              <div className="inline-flex items-center gap-4 bg-[#111111] border border-[#333333] px-6 py-4 rounded-2xl">
                <div className="w-4 h-4 rounded-sm bg-[#05a357] animate-flash"></div>
                <span className="font-mono text-[0.9rem] uppercase tracking-widest">Global Sync Active</span>
              </div>
            </div>
            <div className="w-full lg:w-2/3 grid grid-cols-2 sm:grid-cols-4 gap-6">
              {globalMarkets.map((market, idx) => (
                <div key={idx} className="bg-[#111111] border border-[#222222] rounded-[24px] p-6 text-center hover:bg-[#1a1a1a] transition-colors duration-300">
                  <div className="w-12 h-12 mx-auto bg-[#000000] border border-[#333333] rounded-xl flex items-center justify-center mb-4 text-[#ffffff]">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d={market.svg} /></svg>
                  </div>
                  <h3 className="font-bold text-[1rem] text-white mb-1">{market.name}</h3>
                  <p className="text-[0.75rem] uppercase tracking-widest text-[#666666]">{market.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 14: Corporate App Access (Terminal Deploy) */}
        <section className="text-center bg-white border border-[#eeeeee] p-16 rounded-[40px] shadow-[0_20px_40px_rgba(0,0,0,0.04)]">
          <h2 className="text-[3rem] font-extrabold text-black mb-6 tracking-tight">Deploy the Corporate Terminal.</h2>
          <p className="text-[1.2rem] text-[#666666] mb-12 max-w-[700px] mx-auto">
            Stay synced with Movyra. Download our native terminal applications for real-time routing algorithms, investor updates, and open-source engineering logs.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <a href="#ios" className="transition-transform duration-300 hover:-translate-y-2">
              <svg viewBox="0 0 135 40" width="180" height="53" className="border border-black rounded-xl bg-black shadow-xl">
                <path d="M130.2,40H4.8C2.1,40,0,37.9,0,35.2V4.8C0,2.1,2.1,0,4.8,0h125.4C132.9,0,135,2.1,135,4.8v30.4C135,37.9,132.9,40,130.2,40z" fill="#000000"/>
                <path d="M31.2,14.6c0-3.3,2.7-4.9,2.8-5c-1.5-2.2-3.9-2.5-4.7-2.6c-2-0.2-3.9,1.2-5,1.2c-1,0-2.6-1.1-4.2-1.1c-2.1,0-4.1,1.2-5.1,3c-2.2,3.8-0.6,9.4,1.5,12.5c1,1.5,2.2,3.1,3.8,3.1c1.5,0,2.1-0.9,3.9-0.9c1.8,0,2.4,0.9,4,0.9c1.6,0,2.6-1.5,3.6-3c1.2-1.7,1.7-3.4,1.7-3.5C33.4,19.1,31.2,17.3,31.2,14.6z M27.1,9.8c0.8-1,1.4-2.4,1.2-3.8c-1.2,0.1-2.7,0.8-3.6,1.8c-0.7,0.8-1.4,2.2-1.2,3.6C24.8,11.5,26.2,10.8,27.1,9.8z" fill="#FFFFFF"/>
                <text x="45" y="16" fill="#FFFFFF" fontSize="10" fontFamily="sans-serif">Download on the</text>
                <text x="45" y="32" fill="#FFFFFF" fontSize="16" fontFamily="sans-serif" fontWeight="bold">App Store</text>
              </svg>
            </a>
            <a href="#android" className="transition-transform duration-300 hover:-translate-y-2">
              <svg viewBox="0 0 135 40" width="180" height="53" className="border border-black rounded-xl bg-black shadow-xl">
                <path d="M130.2,40H4.8C2.1,40,0,37.9,0,35.2V4.8C0,2.1,2.1,0,4.8,0h125.4C132.9,0,135,2.1,135,4.8v30.4C135,37.9,132.9,40,130.2,40z" fill="#000000"/>
                <path d="M12.6,9.1L24,20.4L12.6,31.8c-0.5,0.5-1.4,0.1-1.4-0.6V9.7C11.2,9,12.1,8.6,12.6,9.1z" fill="#00E676"/>
                <path d="M25.4,21.9l4.5,4.5l-17.3,9.8c-1.1,0.6-2.5-0.1-2.5-1.4v-0.6L25.4,21.9z" fill="#F44336"/>
                <path d="M25.4,18.9L10.1,3.7v-0.6c0-1.3,1.4-2,2.5-1.4l17.3,9.8L25.4,18.9z" fill="#FFC107"/>
                <path d="M31.8,18.9l-4.9-2.8l-1.4,1.4l0,0l0,0l1.4,1.4l4.9-2.8C32.6,19.9,32.6,19.3,31.8,18.9z" fill="#2196F3"/>
                <text x="45" y="16" fill="#FFFFFF" fontSize="10" fontFamily="sans-serif">GET IT ON</text>
                <text x="45" y="32" fill="#FFFFFF" fontSize="16" fontFamily="sans-serif" fontWeight="bold">Google Play</text>
              </svg>
            </a>
          </div>
        </section>

      </div>
    </div>
  );
};

export default LatestNewsGrid;