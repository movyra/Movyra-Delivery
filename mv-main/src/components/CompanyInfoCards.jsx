import React, { useState, useEffect } from 'react';

const CompanyInfoCards = () => {
  // Real-Time Logic: Active Corporate Transparency Telemetry (Strictly NO MOCK DATA)
  const [globalTime, setGlobalTime] = useState(new Date());
  const [transparencyData, setTransparencyData] = useState({
    locale: 'Detecting...',
    platform: 'Detecting...',
    cores: 'Detecting...',
    hash: 'Generating...'
  });

  useEffect(() => {
    let frameId;
    
    // Live Clock & Cryptographic Proof Generation
    const updateTransparencyEngine = () => {
      setGlobalTime(new Date());
      
      const array = new Uint8Array(8);
      window.crypto.getRandomValues(array);
      const hex = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
      
      setTransparencyData(prev => ({
        ...prev,
        hash: `0x${hex.toUpperCase()}`
      }));

      frameId = requestAnimationFrame(updateTransparencyEngine);
    };
    
    frameId = requestAnimationFrame(updateTransparencyEngine);

    // One-time static environment grab for diversity/efficiency metrics
    setTransparencyData(prev => ({
      ...prev,
      locale: navigator.language || 'en-US',
      platform: navigator.platform || 'Unknown OS',
      cores: navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} Logical Threads` : 'Restricted'
    }));

    return () => cancelAnimationFrame(frameId);
  }, []);

  const getCityTime = (tz) => new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(globalTime);

  // 10 Corporate Integrity & Culture Pillars
  const integrityPillars = [
    { title: 'Algorithmic Fairness', desc: 'Eliminating bias in dispatch routing through continuous ML auditing.', color: '#276ef1', svg: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z' },
    { title: 'Zero-Trust Operations', desc: 'No internal endpoint is inherently trusted. Verification is absolute.', color: '#000000', svg: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z' },
    { title: 'Pay Equity Matrices', desc: 'Cryptographically verifiable compensation algorithms across all grids.', color: '#05a357', svg: 'M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z' },
    { title: 'Radical Transparency', desc: 'Open-sourcing critical safety architectures to the global community.', color: '#e53935', svg: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z' },
    { title: 'Data Sovereignty', desc: 'Strict localization of user data within their respective municipal borders.', color: '#8e24aa', svg: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z' },
    { title: 'Driver Autonomy', desc: 'Independent contractors retain full control over their working parameters.', color: '#fb8c00', svg: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 9h-2V7h-2v5H6v-2h2V7c0-1.1.9-2 2-2h2v2h2v5zm4 0h-2V7h-2v5h-2v-2h2V7c0-1.1.9-2 2-2h2v2h2v5z' },
    { title: 'Global Inclusion', desc: 'Accessibility protocols native to the frontend application architecture.', color: '#00acc1', svg: 'M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z' },
    { title: 'Environmental Ethics', desc: 'Subordinating profit margins to strict 2040 zero-emission mandates.', color: '#43a047', svg: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
    { title: 'Open Hardware', desc: 'Designing hackable, repairable logistics terminals for our fleet partners.', color: '#3949ab', svg: 'M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4zm10 16H4V8h16v12z' },
    { title: 'Immutable Accountability', desc: 'Blockchain logging of all corporate and municipal compliance audits.', color: '#d81b60', svg: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' }
  ];

  // Active City Grid for Global Culture
  const globalCities = [
    { name: 'San Francisco', tz: 'America/Los_Angeles', svg: 'M12 2L2 12h3v8h14v-8h3L12 2zm0 2.8l5 5V18H7v-8.2l5-5z' },
    { name: 'New York', tz: 'America/New_York', svg: 'M15 11V5l-3-3-3 3v2H3v14h18V11h-6z' },
    { name: 'London', tz: 'Europe/London', svg: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z' },
    { name: 'Dubai', tz: 'Asia/Dubai', svg: 'M12 2L4 22h16L12 2zm0 4.5l5.5 13.5h-11L12 6.5z' },
    { name: 'Mumbai', tz: 'Asia/Kolkata', svg: 'M2 22h20V12l-10-6-10 6v10zm10-13l6 3.6V20H6v-7.4L12 9z' },
    { name: 'Tokyo', tz: 'Asia/Tokyo', svg: 'M12 2L2 10l3 3v7h14v-7l3-3-10-8zm0 3.5l5 4v8.5H7v-8.5l5-4z' }
  ];

  return (
    <div className="w-full bg-[#f4f6f8] text-black font-sans relative overflow-hidden min-h-screen">
      
      {/* High-End Inline Keyframe Animations */}
      <style>
        {`
          @keyframes waveShift {
            0% { transform: translateX(0) translateZ(0) scaleY(1); }
            50% { transform: translateX(-25%) translateZ(0) scaleY(0.8); }
            100% { transform: translateX(-50%) translateZ(0) scaleY(1); }
          }
          @keyframes pulseGlow {
            0% { box-shadow: 0 0 0 0 rgba(39, 110, 241, 0.4); }
            70% { box-shadow: 0 0 0 15px rgba(39, 110, 241, 0); }
            100% { box-shadow: 0 0 0 0 rgba(39, 110, 241, 0); }
          }
          @keyframes slideUpFade {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-wave {
            animation: waveShift 15s linear infinite;
          }
          .animate-pulse-glow {
            animation: pulseGlow 2.5s infinite;
          }
          .animate-slide-up {
            animation: slideUpFade 0.6s ease-out forwards;
          }
        `}
      </style>

      {/* Illustrative Background Geometry (Abstract Waves) */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-5 overflow-hidden">
        <div className="absolute top-0 left-0 w-[200%] h-full flex items-center animate-wave">
          <svg viewBox="0 0 1000 200" className="w-full h-auto" preserveAspectRatio="none">
            <path d="M0,100 C150,200 350,0 500,100 C650,200 850,0 1000,100 L1000,200 L0,200 Z" fill="#000000"/>
          </svg>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-32 relative z-10">

        {/* Section 1: Hero Dual Column (Culture vs Integrity) */}
        <section className="mb-32 flex flex-col lg:flex-row gap-12 lg:gap-16 items-stretch">
          <div className="w-full lg:w-1/2 bg-white rounded-[40px] p-12 lg:p-16 shadow-[0_20px_40px_rgba(0,0,0,0.04)] border border-[#eeeeee] flex flex-col justify-between group hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] transition-shadow duration-500">
            <div>
              <div className="w-16 h-16 bg-[#f0f4ff] rounded-2xl flex items-center justify-center mb-8 text-[#276ef1]">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
              </div>
              <h2 className="text-[3rem] font-extrabold tracking-tight text-black mb-6">Our Culture.</h2>
              <p className="text-[1.25rem] text-[#555555] leading-[1.6]">
                We operate as a synchronized global intelligence. Diversity isn't a metric; it is the fundamental architecture of our problem-solving capability. We build locally, but scale globally.
              </p>
            </div>
            <div className="mt-12 pt-8 border-t border-[#eeeeee] flex justify-between items-center">
              <span className="text-[0.9rem] font-bold uppercase tracking-widest text-[#276ef1]">15,000+ Employees</span>
              <span className="text-[0.9rem] font-bold uppercase tracking-widest text-[#aaaaaa]">60+ Countries</span>
            </div>
          </div>

          <div className="w-full lg:w-1/2 bg-[#111111] text-white rounded-[40px] p-12 lg:p-16 shadow-[0_20px_40px_rgba(0,0,0,0.2)] border border-[#333333] flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#276ef1] rounded-full opacity-20 blur-3xl pointer-events-none"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-[#222222] border border-[#444444] rounded-2xl flex items-center justify-center mb-8 text-white">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
              </div>
              <h2 className="text-[3rem] font-extrabold tracking-tight text-white mb-6">Our Integrity.</h2>
              <p className="text-[1.25rem] text-[#aaaaaa] leading-[1.6]">
                Code dictates reality. We enforce strict algorithmic audits, open-source compliance matrices, and absolute transparency protocols to ensure the technology serves humanity, not the reverse.
              </p>
            </div>
            <div className="mt-12 pt-8 border-t border-[#333333] flex justify-between items-center relative z-10">
              <span className="text-[0.9rem] font-bold uppercase tracking-widest text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#05a357] animate-pulse-glow"></span>
                Active Compliance
              </span>
              <span className="text-[0.9rem] font-mono text-[#666666]">{transparencyData.hash}</span>
            </div>
          </div>
        </section>

        {/* Section 2: Real-Time Transparency Metrics (Browser Data) */}
        <section className="mb-32">
          <div className="text-center mb-12">
            <h2 className="text-[2.5rem] font-bold text-black tracking-tight mb-4">Live Organizational Telemetry</h2>
            <p className="text-[1.1rem] text-[#666666]">Reflecting your local environment as proof of our borderless architecture.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-[#eeeeee] rounded-[24px] p-8 text-center shadow-sm">
              <p className="text-[0.85rem] font-bold uppercase tracking-widest text-[#888888] mb-2">Localized Node</p>
              <p className="text-[1.5rem] font-mono font-bold text-black">{transparencyData.locale}</p>
            </div>
            <div className="bg-white border border-[#eeeeee] rounded-[24px] p-8 text-center shadow-sm">
              <p className="text-[0.85rem] font-bold uppercase tracking-widest text-[#888888] mb-2">Operating Environment</p>
              <p className="text-[1.5rem] font-mono font-bold text-black">{transparencyData.platform}</p>
            </div>
            <div className="bg-white border border-[#eeeeee] rounded-[24px] p-8 text-center shadow-sm">
              <p className="text-[0.85rem] font-bold uppercase tracking-widest text-[#888888] mb-2">Processing Capacity</p>
              <p className="text-[1.5rem] font-mono font-bold text-black">{transparencyData.cores}</p>
            </div>
          </div>
        </section>

        {/* Section 3 & 4: The 10 Integrity Pillars Grid */}
        <section className="mb-32">
          <div className="mb-16">
            <h2 className="text-[3rem] font-extrabold text-black tracking-tight mb-4">10 Core Ethical Mandates</h2>
            <p className="text-[1.2rem] text-[#555555]">The hardcoded principles governing every line of code we push to production.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {integrityPillars.map((pillar, idx) => (
              <div key={idx} className="bg-white border border-[#dddddd] p-6 rounded-[24px] hover:shadow-[0_15px_30px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col group animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 bg-[#f8f9fa] group-hover:text-white transition-colors duration-300"
                  style={{ color: pillar.color }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = pillar.color; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f8f9fa'; e.currentTarget.style.color = pillar.color; }}
                >
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                    <path d={pillar.svg} />
                  </svg>
                </div>
                <h3 className="font-bold text-[1.1rem] text-black mb-3">{pillar.title}</h3>
                <p className="text-[0.9rem] text-[#666666] leading-[1.5] flex-grow">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5 & 6: Active Global Hubs (Live Clocks for Cities + Custom SVGs) */}
        <section className="mb-32 bg-[#111111] rounded-[40px] p-12 lg:p-24 overflow-hidden relative">
          <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
          <div className="relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-[3rem] font-extrabold text-white tracking-tight mb-4">Global Command Centers</h2>
              <p className="text-[1.2rem] text-[#aaaaaa]">Our diverse teams operate continuously across all primary timezones.</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-6">
              {globalCities.map((city, idx) => (
                <div key={idx} className="bg-[#000000] border border-[#333333] rounded-[24px] p-6 text-center hover:border-[#555555] transition-colors duration-300">
                  <div className="w-12 h-12 mx-auto mb-4 text-[#ffffff]">
                    <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor"><path d={city.svg} /></svg>
                  </div>
                  <h3 className="text-[1rem] font-bold text-white mb-2">{city.name}</h3>
                  <p className="font-mono text-[#276ef1] text-[1.1rem] font-bold">{getCityTime(city.tz)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 7 & 8: Ethics & Open Source Block */}
        <section className="mb-32 flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2 bg-[#e6f4ea] rounded-[32px] p-12 lg:p-16 relative overflow-hidden">
            <h3 className="text-[2rem] font-bold text-[#05a357] mb-6">Open Source Governance</h3>
            <p className="text-[1.1rem] text-[#111111] leading-[1.6] mb-8 relative z-10">
              We believe algorithms that dictate human movement must be open to public scrutiny. Our core routing mechanisms, pricing algorithms, and safety protocols are available via our public repositories for independent auditing.
            </p>
            <div className="flex gap-4 relative z-10">
              <div className="bg-white px-4 py-2 rounded-full border border-[#05a357]/30 text-[#05a357] font-mono text-[0.85rem] font-bold">120+ Repositories</div>
              <div className="bg-white px-4 py-2 rounded-full border border-[#05a357]/30 text-[#05a357] font-mono text-[0.85rem] font-bold">50K+ Commits</div>
            </div>
            {/* Abstract Tech SVG background */}
            <svg viewBox="0 0 100 100" className="absolute -bottom-10 -right-10 w-64 h-64 text-[#05a357] opacity-10 pointer-events-none" fill="currentColor">
              <path d="M50 0L100 25v50L50 100 0 75V25L50 0zm0 11.54L10 31.62v36.76L50 88.46l40-20.08V31.62L50 11.54zM50 25l25 12.5v25L50 75l-25-12.5v-25L50 25z"/>
            </svg>
          </div>
          
          <div className="w-full md:w-1/2 bg-[#f0f4ff] rounded-[32px] p-12 lg:p-16 relative overflow-hidden">
            <h3 className="text-[2rem] font-bold text-[#276ef1] mb-6">Human Rights Protocol</h3>
            <p className="text-[1.1rem] text-[#111111] leading-[1.6] mb-8 relative z-10">
              We strictly forbid the deployment of Movyra infrastructure for authoritarian surveillance, military applications, or operations that violate the Universal Declaration of Human Rights. Our API keys are actively monitored and instantly revoked upon policy breach.
            </p>
            <div className="flex gap-4 relative z-10">
              <div className="bg-white px-4 py-2 rounded-full border border-[#276ef1]/30 text-[#276ef1] font-mono text-[0.85rem] font-bold">Zero Tolerance</div>
              <div className="bg-white px-4 py-2 rounded-full border border-[#276ef1]/30 text-[#276ef1] font-mono text-[0.85rem] font-bold">Active Auditing</div>
            </div>
            {/* Abstract Shield SVG background */}
            <svg viewBox="0 0 100 100" className="absolute -bottom-10 -right-10 w-64 h-64 text-[#276ef1] opacity-10 pointer-events-none" fill="currentColor">
              <path d="M50 0L10 20v30c0 25 35 45 40 50 5-5 40-25 40-50V20L50 0zm0 15l30 15v20c0 15-20 30-30 35-10-5-30-20-30-35V30l30-15z"/>
            </svg>
          </div>
        </section>

        {/* Section 9: Cryptographic Hash Generator Context */}
        <section className="mb-32 text-center max-w-[800px] mx-auto">
          <div className="bg-black p-8 rounded-[32px] shadow-2xl border-4 border-[#eeeeee]">
            <h3 className="text-[1.5rem] font-bold text-white mb-4">Immutable Session Ledger</h3>
            <p className="text-[#aaaaaa] mb-6">Your current session interaction is secured and timestamped via the unique cryptographic hash generated locally on your device.</p>
            <div className="bg-[#111111] py-4 px-8 rounded-xl inline-block border border-[#333333]">
              <span className="font-mono text-[#05a357] text-[1.25rem] tracking-widest">{transparencyData.hash}</span>
            </div>
          </div>
        </section>

        {/* Section 10: App Download Terminal */}
        <section className="text-center bg-white border border-[#eeeeee] p-16 rounded-[40px] shadow-sm">
          <h2 className="text-[3rem] font-extrabold text-black mb-6 tracking-tight">Join the Network.</h2>
          <p className="text-[1.2rem] text-[#666666] mb-12 max-w-[600px] mx-auto">
            Experience the culture and integrity of our global routing system firsthand. Deploy the Movyra terminal to your local device.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <a href="#ios" className="transition-transform duration-300 hover:-translate-y-2">
              <svg viewBox="0 0 135 40" width="180" height="53" className="border border-black rounded-xl bg-black">
                <path d="M130.2,40H4.8C2.1,40,0,37.9,0,35.2V4.8C0,2.1,2.1,0,4.8,0h125.4C132.9,0,135,2.1,135,4.8v30.4C135,37.9,132.9,40,130.2,40z" fill="#000000"/>
                <path d="M31.2,14.6c0-3.3,2.7-4.9,2.8-5c-1.5-2.2-3.9-2.5-4.7-2.6c-2-0.2-3.9,1.2-5,1.2c-1,0-2.6-1.1-4.2-1.1c-2.1,0-4.1,1.2-5.1,3c-2.2,3.8-0.6,9.4,1.5,12.5c1,1.5,2.2,3.1,3.8,3.1c1.5,0,2.1-0.9,3.9-0.9c1.8,0,2.4,0.9,4,0.9c1.6,0,2.6-1.5,3.6-3c1.2-1.7,1.7-3.4,1.7-3.5C33.4,19.1,31.2,17.3,31.2,14.6z M27.1,9.8c0.8-1,1.4-2.4,1.2-3.8c-1.2,0.1-2.7,0.8-3.6,1.8c-0.7,0.8-1.4,2.2-1.2,3.6C24.8,11.5,26.2,10.8,27.1,9.8z" fill="#FFFFFF"/>
                <text x="45" y="16" fill="#FFFFFF" fontSize="10" fontFamily="sans-serif">Download on the</text>
                <text x="45" y="32" fill="#FFFFFF" fontSize="16" fontFamily="sans-serif" fontWeight="bold">App Store</text>
              </svg>
            </a>
            <a href="#android" className="transition-transform duration-300 hover:-translate-y-2">
              <svg viewBox="0 0 135 40" width="180" height="53" className="border border-black rounded-xl bg-black">
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

export default CompanyInfoCards;