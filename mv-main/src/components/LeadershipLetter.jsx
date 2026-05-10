import React, { useState, useEffect } from 'react';

const LeadershipLetter = () => {
  // Real-time logic: Scroll progress indicator & live date rendering
  const [scrollProgress, setScrollProgress] = useState(0);
  const [liveDate, setLiveDate] = useState('');

  useEffect(() => {
    // Live date string generation
    const updateDate = () => {
      const now = new Date();
      setLiveDate(new Intl.DateTimeFormat('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short'
      }).format(now));
    };
    updateDate();
    const timer = setInterval(updateDate, 1000);

    // Real-time scroll telemetry
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = `${totalScroll / windowHeight}`;
      setScrollProgress(Number(scroll));
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      clearInterval(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 10 Strategic Vision Pillars for Rohit Thakur (CEO)
  const visionPillars = [
    { id: '01', title: 'Algorithmic Dominance', desc: 'Refining our routing ML models to predict demand spikes before they physically manifest in the urban grid.', svg: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' },
    { id: '02', title: 'Quantum Readiness', desc: 'Preparing our backend infrastructure for quantum-encrypted ledgers to secure global mobility transactions.', svg: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z' },
    { id: '03', title: 'Carbon-Negative Infrastructure', desc: 'Moving beyond zero-emission. We are investing in active carbon capture protocols at every major transit hub.', svg: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
    { id: '04', title: 'Autonomous Integration', desc: 'Deploying Level 5 autonomous fleet API hooks, ensuring Movyra is the default protocol for self-driving vehicles.', svg: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z' },
    { id: '05', title: 'Micro-Economic Velocity', desc: 'Decreasing driver payout latency to sub-second intervals utilizing real-time banking rails.', svg: 'M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z' },
    { id: '06', title: 'Global Policy Hubs', desc: 'Establishing transparent data-sharing agreements with municipal governments to actively reduce traffic congestion.', svg: 'M15 11V5l-3-3-3 3v2H3v14h18V11h-6zm-8 8H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V9h2v2zm6 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2zm6 12h-2v-2h2v2zm0-4h-2v-2h2v2z' },
    { id: '07', title: 'Next-Gen UI/UX', desc: 'Eliminating friction. Designing interfaces that anticipate user intent before the screen is even touched.', svg: 'M4 6h18V4H4c-1.1 0-2 .9-2 2v11H0v3h14v-3H4V6zm19 2h-6c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zm-1 9h-4v-7h4v7z' },
    { id: '08', title: 'Supply Chain Transparency', desc: 'Providing end-to-end cryptographic proofs of delivery for enterprise freight partners.', svg: 'M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5 .67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5 .67 1.5 1.5-.67 1.5-1.5 1.5z' }
  ];

  return (
    <div className="relative w-full bg-[#f8f9fa] text-black font-sans min-h-screen overflow-hidden">
      
      {/* Built-in Custom Styles */}
      <style>
        {`
          @keyframes signatureDraw {
            0% { stroke-dashoffset: 1000; }
            100% { stroke-dashoffset: 0; }
          }
          @keyframes gradientShiftX {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-signature {
            stroke-dasharray: 1000;
            animation: signatureDraw 4s ease-in-out forwards;
          }
          .bg-gradient-animate {
            background-size: 200% 200%;
            animation: gradientShiftX 15s ease infinite;
          }
        `}
      </style>

      {/* Real-Time Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1 bg-black z-50 transition-all duration-100 ease-out"
        style={{ width: `${scrollProgress * 100}%` }}
      />

      {/* Background Graphic */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-[#e0f2fe] to-transparent rounded-full blur-3xl opacity-40 -translate-y-1/2 translate-x-1/3 pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-6 lg:px-12 py-24 relative z-10">
        
        {/* Section 1: Letter Header & Portrait */}
        <section className="mb-24 flex flex-col md:flex-row items-start md:items-center gap-12 border-b border-[#dddddd] pb-16">
          <div className="w-full md:w-1/3">
            <div className="relative rounded-[32px] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.12)]">
              {/* High-end unspalsh placeholder representing the CEO */}
              <img 
                src="https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=800&q=80" 
                alt="Rohit Thakur, CEO" 
                className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 text-white">
                <p className="font-extrabold text-[1.5rem]">Rohit Thakur</p>
                <p className="text-[0.9rem] font-medium tracking-widest uppercase opacity-80">Chief Executive Officer</p>
              </div>
            </div>
          </div>
          <div className="w-full md:w-2/3">
            <span className="inline-block px-4 py-2 bg-black text-white rounded-full text-[0.8rem] font-bold tracking-widest uppercase mb-8">
              A Letter from the CEO
            </span>
            <h1 className="text-[3rem] lg:text-[4rem] font-extrabold leading-[1.1] tracking-[-2px] mb-8 text-black">
              Engineering the <br/> Velocity of Tomorrow.
            </h1>
            <p className="text-[1.25rem] text-[#555555] leading-[1.8] font-medium">
              We did not build Movyra to participate in the mobility sector; we built it to rewrite the foundational code of human movement. As we look at the next decade, our focus shifts from localized convenience to global structural efficiency.
            </p>
          </div>
        </section>

        {/* Section 2: Core Philosophy */}
        <section className="mb-24 max-w-[900px] mx-auto text-center">
          <p className="text-[1.5rem] lg:text-[2rem] font-semibold leading-[1.6] text-black italic">
            "Technology is only as powerful as the physical barriers it removes. Our mandate is to make physical distance computationally irrelevant."
          </p>
        </section>

        {/* Sections 3 to 10: 8 Vision Pillars Grid */}
        <section className="mb-24">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-[2.5rem] font-extrabold tracking-tight text-black">The 8 Mandates</h2>
            <span className="text-[0.9rem] font-mono text-[#666666] hidden md:block">Active Strategy Matrix</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {visionPillars.map((pillar, index) => (
              <div key={index} className="bg-white p-10 rounded-[24px] shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 border border-transparent hover:border-[#eeeeee] flex flex-col group">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-14 h-14 bg-[#f4f4f4] rounded-2xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors duration-300">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                      <path d={pillar.svg} />
                    </svg>
                  </div>
                  <span className="text-[3rem] font-black text-[#f0f0f0] leading-none select-none">{pillar.id}</span>
                </div>
                <h3 className="text-[1.5rem] font-bold mb-4 text-black">{pillar.title}</h3>
                <p className="text-[1rem] text-[#666666] leading-[1.6]">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 11: Real-Time Commitment & Signature */}
        <section className="border-t border-[#dddddd] pt-16 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="w-full md:w-1/2">
            <h3 className="text-[2rem] font-bold tracking-tight mb-6 text-black">A commitment forged in real-time.</h3>
            <p className="text-[1.1rem] text-[#555555] leading-[1.7] mb-8">
              This isn't a static manifesto. It is an evolving architecture. Every feature we deploy, every market we open, is a direct execution of this vision.
            </p>
            {/* Live Timestamp Display */}
            <div className="bg-white p-4 rounded-xl border border-[#eeeeee] inline-block shadow-sm">
              <p className="text-[0.75rem] font-bold text-[#888888] uppercase tracking-widest mb-1">Live Document Timestamp</p>
              <p className="text-[1rem] font-mono text-black">{liveDate || 'Syncing clock...'}</p>
            </div>
          </div>
          
          <div className="w-full md:w-1/2 flex flex-col items-center md:items-end text-center md:text-right">
            {/* Custom SVG Signature Animation */}
            <div className="mb-4">
              <svg width="250" height="80" viewBox="0 0 250 80" fill="none" stroke="#000000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-signature">
                <path d="M10 50 Q 30 10, 50 40 T 90 30 Q 110 70, 130 40 T 170 20 Q 200 60, 230 40" />
                <path d="M40 45 L 200 45" strokeWidth="1" strokeOpacity="0.5" />
              </svg>
            </div>
            <p className="text-[1.25rem] font-extrabold text-black">Rohit Thakur</p>
            <p className="text-[1rem] text-[#666666]">CEO, Movyra</p>
          </div>
        </section>

        {/* Section 12: Actionable App Store Deployment */}
        <section className="mt-24 bg-gradient-animate bg-gradient-to-r from-black via-[#222222] to-black p-12 rounded-[32px] flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-[2rem] font-bold text-white mb-4">Execute the Vision.</h3>
            <p className="text-[#cccccc] mb-8 text-[1.1rem]">Download the terminal and connect to the global grid.</p>
            <div className="flex flex-wrap justify-center gap-6">
              {/* Apple Store Badge */}
              <a href="#ios" className="transition-transform duration-300 hover:scale-105">
                <svg viewBox="0 0 135 40" width="150" height="44" className="border border-[#444444] rounded-[10px] bg-black">
                  <path d="M130.2,40H4.8C2.1,40,0,37.9,0,35.2V4.8C0,2.1,2.1,0,4.8,0h125.4C132.9,0,135,2.1,135,4.8v30.4C135,37.9,132.9,40,130.2,40z" fill="#000000"/>
                  <path d="M31.2,14.6c0-3.3,2.7-4.9,2.8-5c-1.5-2.2-3.9-2.5-4.7-2.6c-2-0.2-3.9,1.2-5,1.2c-1,0-2.6-1.1-4.2-1.1c-2.1,0-4.1,1.2-5.1,3c-2.2,3.8-0.6,9.4,1.5,12.5c1,1.5,2.2,3.1,3.8,3.1c1.5,0,2.1-0.9,3.9-0.9c1.8,0,2.4,0.9,4,0.9c1.6,0,2.6-1.5,3.6-3c1.2-1.7,1.7-3.4,1.7-3.5C33.4,19.1,31.2,17.3,31.2,14.6z M27.1,9.8c0.8-1,1.4-2.4,1.2-3.8c-1.2,0.1-2.7,0.8-3.6,1.8c-0.7,0.8-1.4,2.2-1.2,3.6C24.8,11.5,26.2,10.8,27.1,9.8z" fill="#FFFFFF"/>
                  <text x="45" y="16" fill="#FFFFFF" fontSize="10" fontFamily="sans-serif">Download on the</text>
                  <text x="45" y="32" fill="#FFFFFF" fontSize="16" fontFamily="sans-serif" fontWeight="bold">App Store</text>
                </svg>
              </a>
              {/* Google Play Badge */}
              <a href="#android" className="transition-transform duration-300 hover:scale-105">
                <svg viewBox="0 0 135 40" width="150" height="44" className="border border-[#444444] rounded-[10px] bg-black">
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
          </div>
          {/* Abstract Topo Graphic Overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
             <svg width="100%" height="100%">
               <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                 <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" strokeWidth="1"/>
               </pattern>
               <rect width="100%" height="100%" fill="url(#gridPattern)" />
             </svg>
          </div>
        </section>

      </div>
    </div>
  );
};

export default LeadershipLetter;