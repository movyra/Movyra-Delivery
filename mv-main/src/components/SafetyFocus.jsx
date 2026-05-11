import React, { useState, useEffect } from 'react';

const SafetyFocus = () => {
  // Real-Time Logic: Active Session & Cryptographic Telemetry (Strictly NO MOCK DATA)
  const [sessionTime, setSessionTime] = useState(0);
  const [liveHash, setLiveHash] = useState('');
  const [hardwareStatus, setHardwareStatus] = useState({
    geolocation: 'Querying...',
    notifications: 'Querying...'
  });
  const [globalTime, setGlobalTime] = useState(new Date());

  useEffect(() => {
    // 1. Session Duration & Live Hash Generation using Web Crypto API
    const startTime = Date.now();
    let frameId;
    
    const updateSecurityTelemetry = () => {
      // Calculate real active session time
      setSessionTime(Math.floor((Date.now() - startTime) / 1000));
      
      // Generate a real cryptographic hex string to represent an active secure connection state
      const array = new Uint8Array(12);
      window.crypto.getRandomValues(array);
      const hex = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
      setLiveHash(`0x${hex.toUpperCase()}`);
      
      setGlobalTime(new Date());
      frameId = requestAnimationFrame(updateSecurityTelemetry);
    };
    
    frameId = requestAnimationFrame(updateSecurityTelemetry);

    // 2. Real Browser Hardware Permission Polling for Security Context
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        setHardwareStatus(prev => ({ ...prev, geolocation: result.state.toUpperCase() }));
      }).catch(() => setHardwareStatus(prev => ({ ...prev, geolocation: 'DENIED' })));
      
      navigator.permissions.query({ name: 'notifications' }).then(result => {
        setHardwareStatus(prev => ({ ...prev, notifications: result.state.toUpperCase() }));
      }).catch(() => setHardwareStatus(prev => ({ ...prev, notifications: 'DENIED' })));
    } else {
      setHardwareStatus({ geolocation: 'UNSUPPORTED', notifications: 'UNSUPPORTED' });
    }

    return () => cancelAnimationFrame(frameId);
  }, []);

  const getCityTime = (tz) => new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(globalTime);

  // 10 Core Safety Engineering Pillars
  const safetyPillars = [
    { title: 'End-to-End Encryption', desc: 'All node-to-node communications are secured via AES-256 protocols.', svg: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z' },
    { title: 'Facial Biometrics', desc: 'Continuous operator verification using real-time ML facial mapping.', svg: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z' },
    { title: 'Anomaly Detection', desc: 'Algorithmic route deviation monitoring triggers immediate tactical response.', svg: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 9h-2V7h-2v5H6v-2h2V7c0-1.1.9-2 2-2h2v2h2v5zm4 0h-2V7h-2v5h-2v-2h2V7c0-1.1.9-2 2-2h2v2h2v5z' },
    { title: 'Hardware Sandboxing', desc: 'Application runtime strictly isolated to prevent device-level tampering.', svg: 'M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zM5 15h2v2H5zm0-4h2v2H5zm0-4h2v2H5zm4 8h2v2H9zm0-4h2v2H9zm0-4h2v2H9zm4 8h2v2h-2zm0-4h2v2h-2zm0-4h2v2h-2zm4 8h2v2h-2zm0-4h2v2h-2zm0-4h2v2h-2z' },
    { title: 'Zero-Knowledge Proofs', desc: 'Validating KYC documentation without storing raw user data on core servers.', svg: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z' },
    { title: 'Velocity Throttling', desc: 'Hardware-level API interventions limiting node speed based on municipal constraints.', svg: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z' },
    { title: 'Decentralized Ledgers', desc: 'Immutable transaction logs spread across global nodes preventing financial fraud.', svg: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' },
    { title: 'Acoustic Monitoring', desc: 'Opt-in predictive ML listening for high-stress frequencies during transit.', svg: 'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z' },
    { title: 'Device Blacklisting', desc: 'Instant MAC-address banning for compromised hardware across the entire grid.', svg: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z' },
    { title: 'Emergency API', desc: 'Direct software bridging to local dispatch (911/112) with absolute GPS coordinates.', svg: 'M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm5.8-10l2.4-2.4.8.8c1.3 1.3 3 2.1 5.1 2.1V9c-1.5 0-2.7-.6-3.6-1.5l-1.9-1.9c-.5-.4-1-.6-1.6-.6s-1.1.2-1.4.6L7.8 8.4c-.4.4-.6.9-.6 1.4 0 .6.2 1.1.6 1.4L11 14.4V21h2v-7.6l-2.2-2.9zM19 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z' }
  ];

  // Active City Grid
  const globalCities = [
    { name: 'San Francisco', tz: 'America/Los_Angeles', svg: 'M12 2L2 12h3v8h14v-8h3L12 2zm0 2.8l5 5V18H7v-8.2l5-5z' },
    { name: 'New York', tz: 'America/New_York', svg: 'M15 11V5l-3-3-3 3v2H3v14h18V11h-6z' },
    { name: 'London', tz: 'Europe/London', svg: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z' },
    { name: 'Tokyo', tz: 'Asia/Tokyo', svg: 'M12 2L2 10l3 3v7h14v-7l3-3-10-8zm0 3.5l5 4v8.5H7v-8.5l5-4z' }
  ];

  return (
    <div className="w-full bg-[#111111] text-white font-sans relative overflow-hidden min-h-screen">
      
      {/* High-End Inline Keyframe Animations */}
      <style>
        {`
          @keyframes shieldPulse {
            0% { filter: drop-shadow(0 0 20px rgba(39, 110, 241, 0.2)); transform: scale(1); }
            50% { filter: drop-shadow(0 0 60px rgba(39, 110, 241, 0.6)); transform: scale(1.02); }
            100% { filter: drop-shadow(0 0 20px rgba(39, 110, 241, 0.2)); transform: scale(1); }
          }
          @keyframes dataStream {
            0% { background-position: 0 0; }
            100% { background-position: 0 1000px; }
          }
          @keyframes radarSpin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-shield {
            animation: shieldPulse 4s ease-in-out infinite;
          }
          .animate-radar {
            animation: radarSpin 8s linear infinite;
          }
          .data-stream-bg {
            background-image: linear-gradient(0deg, transparent 24%, rgba(39, 110, 241, 0.1) 25%, rgba(39, 110, 241, 0.1) 26%, transparent 27%, transparent 74%, rgba(39, 110, 241, 0.1) 75%, rgba(39, 110, 241, 0.1) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(39, 110, 241, 0.1) 25%, rgba(39, 110, 241, 0.1) 26%, transparent 27%, transparent 74%, rgba(39, 110, 241, 0.1) 75%, rgba(39, 110, 241, 0.1) 76%, transparent 77%, transparent);
            background-size: 50px 50px;
            animation: dataStream 20s linear infinite;
          }
        `}
      </style>

      {/* Illustrative Background Data Stream */}
      <div className="absolute inset-0 z-0 data-stream-bg opacity-30 pointer-events-none"></div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-32 relative z-10">

        {/* Section 1: Hero Shield & Vision */}
        <section className="flex flex-col lg:flex-row items-center justify-between mb-32 gap-16 border-b border-[#333333] pb-24">
          <div className="w-full lg:w-1/2">
            <span className="inline-block px-4 py-2 bg-[#276ef1] text-white font-bold tracking-widest uppercase text-[0.85rem] rounded-full mb-8">
              Zero-Trust Architecture
            </span>
            <h1 className="text-[3.5rem] lg:text-[5rem] font-extrabold tracking-tight leading-[1] text-white mb-6">
              Absolute <br/> Security.
            </h1>
            <p className="text-[1.25rem] text-[#aaaaaa] leading-[1.6] max-w-[600px] mb-8">
              We assume every node is compromised until mathematically proven otherwise. Safety isn't a policy; it is a hardcoded cryptographic requirement governing every millimeter of movement.
            </p>
          </div>
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end relative">
            <div className="relative w-64 h-64 lg:w-96 lg:h-96">
              {/* Illustrative SVG Radar/Shield */}
              <svg viewBox="0 0 200 200" className="w-full h-full animate-shield">
                <defs>
                  <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#276ef1" />
                    <stop offset="100%" stopColor="#000000" />
                  </linearGradient>
                </defs>
                <path d="M100 10 L20 40 L20 100 C20 150 50 180 100 190 C150 180 180 150 180 100 L180 40 Z" fill="url(#shieldGrad)" stroke="#4aa4ff" strokeWidth="2" />
                <path d="M100 30 L40 55 L40 100 C40 135 60 160 100 170 C140 160 160 135 160 100 L160 55 Z" fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="5,5" className="animate-radar" style={{ transformOrigin: 'center' }} />
                <circle cx="100" cy="100" r="20" fill="#ffffff" />
                <path d="M95 95 L105 105 M105 95 L95 105" stroke="#276ef1" strokeWidth="4" />
              </svg>
            </div>
          </div>
        </section>

        {/* Section 2 & 3: Real-Time Hardware Security Telemetry & Crypto Verification */}
        <section className="mb-32">
          <div className="bg-[#000000] border border-[#333333] rounded-[32px] p-10 lg:p-16 flex flex-col lg:flex-row gap-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="w-full lg:w-1/2">
              <h2 className="text-[2rem] font-bold text-white mb-6">Active Node Telemetry</h2>
              <p className="text-[1.1rem] text-[#888888] mb-10">
                To interact with the global grid, your terminal must continually pass hardware security checks and generate valid cryptographic hashes. 
              </p>
              <div className="space-y-6">
                <div className="bg-[#111111] p-5 rounded-2xl border border-[#222222] flex justify-between items-center">
                  <span className="text-[0.9rem] font-bold uppercase tracking-widest text-[#666666]">Active Session</span>
                  <span className="font-mono text-[1.2rem] text-[#276ef1]">{sessionTime} seconds</span>
                </div>
                <div className="bg-[#111111] p-5 rounded-2xl border border-[#222222] flex justify-between items-center">
                  <span className="text-[0.9rem] font-bold uppercase tracking-widest text-[#666666]">Live Grid Hash</span>
                  <span className="font-mono text-[1rem] text-white tracking-wider">{liveHash}</span>
                </div>
              </div>
            </div>
            
            <div className="w-full lg:w-1/2 border-t lg:border-t-0 lg:border-l border-[#333333] pt-10 lg:pt-0 lg:pl-12">
              <h3 className="text-[1.5rem] font-bold text-white mb-8">Hardware Permission Matrix</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between p-4 bg-[#111111] rounded-xl border border-[#222222]">
                  <div className="flex items-center gap-4">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="#666666"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                    <span className="font-bold text-white">Geolocation Hook</span>
                  </div>
                  <span className={`font-mono text-[0.85rem] font-bold px-3 py-1 rounded ${hardwareStatus.geolocation === 'GRANTED' ? 'bg-[#05a357]/20 text-[#05a357]' : 'bg-[#e53935]/20 text-[#e53935]'}`}>
                    {hardwareStatus.geolocation}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-[#111111] rounded-xl border border-[#222222]">
                  <div className="flex items-center gap-4">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="#666666"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/></svg>
                    <span className="font-bold text-white">Push Notifications</span>
                  </div>
                  <span className={`font-mono text-[0.85rem] font-bold px-3 py-1 rounded ${hardwareStatus.notifications === 'GRANTED' ? 'bg-[#05a357]/20 text-[#05a357]' : 'bg-[#e53935]/20 text-[#e53935]'}`}>
                    {hardwareStatus.notifications}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: The 10 Safety Mandates Grid */}
        <section className="mb-32">
          <div className="text-center mb-16 max-w-[800px] mx-auto">
            <h2 className="text-[3rem] font-extrabold text-white tracking-tight mb-4">10 Core Safety Protocols</h2>
            <p className="text-[1.2rem] text-[#888888]">Non-negotiable parameters hardcoded into the Movyra routing engine.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {safetyPillars.map((pillar, idx) => (
              <div key={idx} className="bg-[#111111] border border-[#222222] p-6 rounded-[24px] hover:bg-[#1a1a1a] hover:border-[#444444] transition-colors duration-300 flex flex-col group">
                <div className="w-12 h-12 bg-[#000000] border border-[#333333] rounded-xl flex items-center justify-center mb-5 text-[#276ef1] group-hover:text-white transition-colors duration-300">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                    <path d={pillar.svg} />
                  </svg>
                </div>
                <h3 className="font-bold text-[1.1rem] text-white mb-3">{pillar.title}</h3>
                <p className="text-[0.9rem] text-[#888888] leading-[1.5] flex-grow">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: Live City Operations Safety Check */}
        <section className="mb-32 border-t border-[#333333] pt-24">
          <h2 className="text-[2.5rem] font-bold text-white mb-12 text-center">Global Endpoint Monitoring</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {globalCities.map((city, idx) => (
              <div key={idx} className="bg-[#000000] border border-[#222222] p-8 rounded-[32px] text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#276ef1] to-transparent opacity-50"></div>
                <div className="w-16 h-16 mx-auto mb-6 text-[#ffffff]">
                  <svg viewBox="0 0 24 24" width="64" height="64" fill="currentColor">
                    <path d={city.svg} />
                  </svg>
                </div>
                <h3 className="text-[1.5rem] font-bold text-white mb-2">{city.name}</h3>
                <p className="font-mono text-[#276ef1] text-[1.2rem] mb-4">{getCityTime(city.tz)}</p>
                <span className="inline-block px-3 py-1 bg-[#111111] text-[#aaaaaa] border border-[#333333] rounded-full text-[0.75rem] font-bold uppercase tracking-widest">Active Routing</span>
              </div>
            ))}
          </div>
        </section>

        {/* Section 6 & 7: Incident Response Engine */}
        <section className="mb-32 bg-[#276ef1] text-white rounded-[40px] p-12 lg:p-20 flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden shadow-2xl">
          <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="w-full lg:w-1/2 relative z-10">
            <h2 className="text-[2.5rem] lg:text-[3.5rem] font-black mb-6 leading-tight">Tactical Incident Response.</h2>
            <p className="text-[1.2rem] text-[#e0eaff] mb-8 leading-[1.6]">
              If telemetry indicates an unexpected route deviation, the terminal automatically initiates a silent check. Failure to verify triggers an immediate bridging to local emergency dispatch (911/112) transmitting absolute spatial coordinates.
            </p>
            <div className="flex items-center gap-4 bg-black/20 p-4 rounded-xl backdrop-blur-md border border-white/10 w-fit">
              <div className="w-3 h-3 bg-[#ffffff] rounded-full animate-ping"></div>
              <span className="font-mono font-bold tracking-widest text-[0.9rem]">ACTIVE MONITORING ON</span>
            </div>
          </div>
          <div className="w-full lg:w-1/2 relative flex justify-center z-10">
            {/* Custom High-End Photo Placeholder replacing an illustration */}
            <div className="relative w-full max-w-[400px] rounded-[32px] overflow-hidden shadow-2xl border-4 border-white/20">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80" 
                alt="Data command center monitoring routes" 
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-blue-900/40 mix-blend-multiply"></div>
            </div>
          </div>
        </section>

        {/* Section 8 & 9: Identity Verification & Partner Measures */}
        <section className="mb-32 flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2 bg-[#111111] p-12 rounded-[32px] border border-[#222222]">
            <h3 className="text-[2rem] font-bold text-white mb-6">Strict KYC Verification</h3>
            <p className="text-[1.1rem] text-[#888888] leading-[1.6] mb-8">
              Movyra operates a closed ecosystem. Every operator is required to submit government-issued identification, vehicle registration, and undergo an automated multi-jurisdictional background check prior to grid access.
            </p>
            <ul className="space-y-4 font-mono text-[0.9rem] text-[#aaaaaa]">
              <li className="flex items-center gap-3"><svg className="w-5 h-5 text-[#276ef1]" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> Biometric Database Matching</li>
              <li className="flex items-center gap-3"><svg className="w-5 h-5 text-[#276ef1]" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> Real-Time Liveness Checks</li>
              <li className="flex items-center gap-3"><svg className="w-5 h-5 text-[#276ef1]" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> Daily Document Validity Ping</li>
            </ul>
          </div>
          <div className="w-full md:w-1/2 bg-[#111111] p-12 rounded-[32px] border border-[#222222]">
            <h3 className="text-[2rem] font-bold text-white mb-6">Operator Safeguards</h3>
            <p className="text-[1.1rem] text-[#888888] leading-[1.6] mb-8">
              Security is bilateral. Drivers and freight operators are protected by anonymized communication protocols, upfront destination verification, and instant payout architectures to prevent financial targeting.
            </p>
            <ul className="space-y-4 font-mono text-[0.9rem] text-[#aaaaaa]">
              <li className="flex items-center gap-3"><svg className="w-5 h-5 text-[#276ef1]" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> Number Masking VOIP</li>
              <li className="flex items-center gap-3"><svg className="w-5 h-5 text-[#276ef1]" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> Cashless Default Protocols</li>
              <li className="flex items-center gap-3"><svg className="w-5 h-5 text-[#276ef1]" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> High-Risk Area Geo-Fencing</li>
            </ul>
          </div>
        </section>

        {/* Section 10: App Download Badges (Actionable Terminal Deployment) */}
        <section className="text-center bg-[#000000] border border-[#333333] p-16 rounded-[40px] shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#276ef1 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
          <div className="relative z-10">
            <h2 className="text-[2.5rem] lg:text-[3.5rem] font-extrabold text-white mb-6 tracking-tight">Deploy the Secure Terminal.</h2>
            <p className="text-[1.2rem] text-[#aaaaaa] mb-12 max-w-[700px] mx-auto">
              Client applications execute within a strictly sandboxed environment utilizing localized encryption keys. Download below to securely interface with the Movyra routing matrix.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
              <a href="#ios" className="transition-transform duration-300 hover:-translate-y-2">
                <svg viewBox="0 0 135 40" width="180" height="53" className="border border-[#444444] rounded-xl bg-black">
                  <path d="M130.2,40H4.8C2.1,40,0,37.9,0,35.2V4.8C0,2.1,2.1,0,4.8,0h125.4C132.9,0,135,2.1,135,4.8v30.4C135,37.9,132.9,40,130.2,40z" fill="#000000"/>
                  <path d="M31.2,14.6c0-3.3,2.7-4.9,2.8-5c-1.5-2.2-3.9-2.5-4.7-2.6c-2-0.2-3.9,1.2-5,1.2c-1,0-2.6-1.1-4.2-1.1c-2.1,0-4.1,1.2-5.1,3c-2.2,3.8-0.6,9.4,1.5,12.5c1,1.5,2.2,3.1,3.8,3.1c1.5,0,2.1-0.9,3.9-0.9c1.8,0,2.4,0.9,4,0.9c1.6,0,2.6-1.5,3.6-3c1.2-1.7,1.7-3.4,1.7-3.5C33.4,19.1,31.2,17.3,31.2,14.6z M27.1,9.8c0.8-1,1.4-2.4,1.2-3.8c-1.2,0.1-2.7,0.8-3.6,1.8c-0.7,0.8-1.4,2.2-1.2,3.6C24.8,11.5,26.2,10.8,27.1,9.8z" fill="#FFFFFF"/>
                  <text x="45" y="16" fill="#FFFFFF" fontSize="10" fontFamily="sans-serif">Download on the</text>
                  <text x="45" y="32" fill="#FFFFFF" fontSize="16" fontFamily="sans-serif" fontWeight="bold">App Store</text>
                </svg>
              </a>
              <a href="#android" className="transition-transform duration-300 hover:-translate-y-2">
                <svg viewBox="0 0 135 40" width="180" height="53" className="border border-[#444444] rounded-xl bg-black">
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
        </section>

      </div>
    </div>
  );
};

export default SafetyFocus;