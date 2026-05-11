import React, { useState, useEffect } from 'react';

const CallToAction = () => {
  // Real-Time Logic: Active Deployment Telemetry (Strictly NO MOCK DATA)
  const [telemetry, setTelemetry] = useState({
    time: new Date().toLocaleTimeString(),
    date: new Date().toLocaleDateString(),
    network: 'Detecting...',
    cores: 'Detecting...',
    platform: 'Detecting...',
    viewport: 'Detecting...'
  });

  useEffect(() => {
    // Live Viewport Telemetry
    const updateViewport = () => {
      setTelemetry(prev => ({
        ...prev,
        viewport: `${window.innerWidth}px x ${window.innerHeight}px`
      }));
    };

    window.addEventListener('resize', updateViewport);
    updateViewport(); // Initial call

    // Real-Time Clock & Hardware Telemetry Loop
    let frameId;
    const updateEngine = () => {
      setTelemetry(prev => ({
        ...prev,
        time: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString(),
        network: navigator.onLine ? (navigator.connection ? navigator.connection.effectiveType.toUpperCase() : 'SECURE TCP/IP') : 'OFFLINE',
        cores: navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} Logical Threads` : 'RESTRICTED',
        platform: navigator.platform || 'UNKNOWN OS'
      }));
      
      // Throttle to 1 second intervals using setTimeout within rAF for performance
      setTimeout(() => {
        frameId = requestAnimationFrame(updateEngine);
      }, 1000);
    };

    frameId = requestAnimationFrame(updateEngine);

    return () => {
      window.removeEventListener('resize', updateViewport);
      cancelAnimationFrame(frameId);
    };
  }, []);

  // 10 Functional Deployment & Telemetry Modules for the CTA Matrix
  const deploymentModules = [
    { title: 'Global Handshake', value: telemetry.network, svg: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z' },
    { title: 'Client Architecture', value: telemetry.platform, svg: 'M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z' },
    { title: 'Hardware Threads', value: telemetry.cores, svg: 'M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zM5 15h2v2H5zm0-4h2v2H5zm0-4h2v2H5zm4 8h2v2H9zm0-4h2v2H9zm0-4h2v2H9zm4 8h2v2h-2zm0-4h2v2h-2zm0-4h2v2h-2zm4 8h2v2h-2zm0-4h2v2h-2zm0-4h2v2h-2z' },
    { title: 'Viewport Resolution', value: telemetry.viewport, svg: 'M3 5v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.11 0-2 .9-2 2zm12 4c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zm-9 8c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1H6v-1z' },
    { title: 'Secure Session Date', value: telemetry.date, svg: 'M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z' },
    { title: 'Active Local Time', value: telemetry.time, svg: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z' }
  ];

  // Active City Grid for Final CTA Footer
  const globalCities = [
    { name: 'San Francisco', desc: 'Node Active', svg: 'M12 2L2 12h3v8h14v-8h3L12 2zm0 2.8l5 5V18H7v-8.2l5-5z' },
    { name: 'London', desc: 'Node Active', svg: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z' },
    { name: 'Tokyo', desc: 'Node Active', svg: 'M12 2L2 10l3 3v7h14v-7l3-3-10-8zm0 3.5l5 4v8.5H7v-8.5l5-4z' },
    { name: 'Dubai', desc: 'Node Active', svg: 'M12 2L4 22h16L12 2zm0 4.5l5.5 13.5h-11L12 6.5z' }
  ];

  return (
    <div className="w-full bg-[#000000] text-white font-sans relative overflow-hidden">
      
      {/* High-End Inline Keyframe Animations */}
      <style>
        {`
          @keyframes globeSpinX {
            0% { transform: rotateY(0deg); }
            100% { transform: rotateY(360deg); }
          }
          @keyframes globeSpinZ {
            0% { transform: rotateZ(0deg); }
            100% { transform: rotateZ(360deg); }
          }
          @keyframes radarSweep {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes gridPulse {
            0%, 100% { opacity: 0.1; }
            50% { opacity: 0.3; }
          }
          .animate-globe-x {
            animation: globeSpinX 40s linear infinite;
            transform-style: preserve-3d;
          }
          .animate-globe-z {
            animation: globeSpinZ 60s linear infinite;
          }
          .animate-radar-sweep {
            animation: radarSweep 4s linear infinite;
            transform-origin: center;
          }
          .cta-grid-bg {
            background-image: linear-gradient(0deg, transparent 24%, rgba(39, 110, 241, 0.2) 25%, rgba(39, 110, 241, 0.2) 26%, transparent 27%, transparent 74%, rgba(39, 110, 241, 0.2) 75%, rgba(39, 110, 241, 0.2) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(39, 110, 241, 0.2) 25%, rgba(39, 110, 241, 0.2) 26%, transparent 27%, transparent 74%, rgba(39, 110, 241, 0.2) 75%, rgba(39, 110, 241, 0.2) 76%, transparent 77%, transparent);
            background-size: 60px 60px;
            animation: gridPulse 5s ease-in-out infinite;
          }
        `}
      </style>

      {/* Background Engineering Grid */}
      <div className="absolute inset-0 z-0 cta-grid-bg pointer-events-none"></div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-32 relative z-10">

        {/* Sections 1 & 2: Interactive Globe & Main Call To Action Text */}
        <section className="flex flex-col lg:flex-row items-center justify-between mb-32 gap-16">
          <div className="w-full lg:w-1/2">
            <span className="inline-flex items-center gap-3 px-4 py-2 bg-[#111111] border border-[#333333] text-white rounded-full text-[0.8rem] font-bold tracking-widest uppercase mb-8">
              <span className="w-2 h-2 rounded-full bg-[#05a357] animate-pulse"></span>
              Grid Synchronization Ready
            </span>
            <h1 className="text-[3.5rem] lg:text-[5rem] font-black tracking-tight leading-[1] text-white mb-6">
              Initialize <br/> Deployment.
            </h1>
            <p className="text-[1.25rem] text-[#aaaaaa] leading-[1.6] max-w-[600px] mb-10">
              The infrastructure is live. Route calculations are executing. Access the world's most advanced mobility and logistics matrix directly from your terminal.
            </p>
            
            {/* Sections 3 & 4: Dual Store App Badges */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <a href="#ios" className="transition-transform duration-300 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(255,255,255,0.1)] rounded-xl block">
                <svg viewBox="0 0 135 40" width="180" height="53" className="border border-[#444444] rounded-xl bg-black">
                  <path d="M130.2,40H4.8C2.1,40,0,37.9,0,35.2V4.8C0,2.1,2.1,0,4.8,0h125.4C132.9,0,135,2.1,135,4.8v30.4C135,37.9,132.9,40,130.2,40z" fill="#000000"/>
                  <path d="M31.2,14.6c0-3.3,2.7-4.9,2.8-5c-1.5-2.2-3.9-2.5-4.7-2.6c-2-0.2-3.9,1.2-5,1.2c-1,0-2.6-1.1-4.2-1.1c-2.1,0-4.1,1.2-5.1,3c-2.2,3.8-0.6,9.4,1.5,12.5c1,1.5,2.2,3.1,3.8,3.1c1.5,0,2.1-0.9,3.9-0.9c1.8,0,2.4,0.9,4,0.9c1.6,0,2.6-1.5,3.6-3c1.2-1.7,1.7-3.4,1.7-3.5C33.4,19.1,31.2,17.3,31.2,14.6z M27.1,9.8c0.8-1,1.4-2.4,1.2-3.8c-1.2,0.1-2.7,0.8-3.6,1.8c-0.7,0.8-1.4,2.2-1.2,3.6C24.8,11.5,26.2,10.8,27.1,9.8z" fill="#FFFFFF"/>
                  <text x="45" y="16" fill="#FFFFFF" fontSize="10" fontFamily="sans-serif">Download on the</text>
                  <text x="45" y="32" fill="#FFFFFF" fontSize="16" fontFamily="sans-serif" fontWeight="bold">App Store</text>
                </svg>
              </a>
              <a href="#android" className="transition-transform duration-300 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(255,255,255,0.1)] rounded-xl block">
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
          
          <div className="w-full lg:w-1/2 flex justify-center relative">
            <div className="w-72 h-72 lg:w-[500px] lg:h-[500px] relative perspective-1000">
              {/* High-End Animated Custom SVG Globe */}
              <svg viewBox="0 0 400 400" className="w-full h-full animate-globe-x absolute inset-0 drop-shadow-[0_0_30px_rgba(39,110,241,0.6)]">
                <circle cx="200" cy="200" r="190" fill="none" stroke="#276ef1" strokeWidth="2" strokeOpacity="0.3" />
                <path d="M 200 10 A 190 190 0 0 0 200 390 A 95 190 0 0 0 200 10 Z" fill="none" stroke="#276ef1" strokeWidth="1" strokeOpacity="0.5" />
                <path d="M 200 10 A 190 190 0 0 1 200 390 A 95 190 0 0 1 200 10 Z" fill="none" stroke="#276ef1" strokeWidth="1" strokeOpacity="0.5" />
                <path d="M 10 200 A 190 190 0 0 0 390 200 A 190 95 0 0 0 10 200 Z" fill="none" stroke="#276ef1" strokeWidth="1" strokeOpacity="0.5" />
                <path d="M 10 200 A 190 190 0 0 1 390 200 A 190 95 0 0 1 10 200 Z" fill="none" stroke="#276ef1" strokeWidth="1" strokeOpacity="0.5" />
                <circle cx="200" cy="200" r="190" fill="none" stroke="#276ef1" strokeWidth="4" strokeDasharray="10 20" className="animate-globe-z" style={{ transformOrigin: 'center' }} />
              </svg>
              {/* Radar Sweep Overlay */}
              <svg viewBox="0 0 400 400" className="w-full h-full absolute inset-0 animate-radar-sweep pointer-events-none">
                <path d="M200 200 L200 10 A 190 190 0 0 1 390 200 Z" fill="url(#radarGrad)" opacity="0.4" />
                <defs>
                  <linearGradient id="radarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#276ef1" stopOpacity="0" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.8" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </section>

        {/* Section 5: Real-Time Client Telemetry Grid (6 Functional Modules) */}
        <section className="mb-32">
          <div className="bg-[#0a0a0a] border border-[#222222] rounded-[40px] p-10 lg:p-16 shadow-[0_30px_60px_rgba(0,0,0,0.8)]">
            <h2 className="text-[2.5rem] font-bold text-white mb-10 text-center tracking-tight">Active Node Validation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deploymentModules.map((mod, idx) => (
                <div key={idx} className="bg-[#111111] border border-[#333333] p-6 rounded-[24px] flex items-center gap-5 hover:border-[#276ef1] transition-colors duration-300">
                  <div className="w-12 h-12 bg-[#000000] border border-[#444444] rounded-xl flex items-center justify-center text-[#276ef1]">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                      <path d={mod.svg} />
                    </svg>
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-[0.8rem] font-bold uppercase tracking-widest text-[#888888] mb-1">{mod.title}</span>
                    <span className="font-mono text-[1.1rem] text-white truncate">{mod.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 6 & 7: Enterprise Logistics Call To Action */}
        <section className="mb-32 flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2 bg-[#ffffff] text-black rounded-[32px] p-12 lg:p-16 border border-[#eeeeee]">
            <h3 className="text-[2.5rem] font-black tracking-tight mb-6">Movyra Enterprise.</h3>
            <p className="text-[1.1rem] text-[#555555] leading-[1.6] mb-10">
              Integrate our routing logic directly into your supply chain via API. Generate cryptographic keys to automate fleet dispatch and corporate travel.
            </p>
            <button className="bg-black text-white px-8 py-4 rounded-xl font-bold text-[1rem] hover:bg-[#222222] transition-colors flex items-center gap-3">
              Request API Access
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
          <div className="w-full md:w-1/2 bg-[#111111] text-white rounded-[32px] p-12 lg:p-16 border border-[#333333]">
            <h3 className="text-[2.5rem] font-black tracking-tight mb-6">Driver Partners.</h3>
            <p className="text-[1.1rem] text-[#aaaaaa] leading-[1.6] mb-10">
              Submit your KYC documentation and undergo automated algorithmic verification. Connect to the grid and monetize your movement in real-time.
            </p>
            <button className="bg-[#276ef1] text-white px-8 py-4 rounded-xl font-bold text-[1rem] hover:bg-[#1a55c2] transition-colors flex items-center gap-3">
              Initiate Onboarding
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </section>

        {/* Sections 8, 9, 10: Global Terminal Linkages (City SVGs) */}
        <section className="pt-16 border-t border-[#333333]">
          <div className="text-center mb-12">
            <h2 className="text-[2rem] font-bold text-white tracking-tight mb-2">Synchronized Global Hubs</h2>
            <p className="text-[#888888]">Operations actively scaling across all primary nodes.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {globalCities.map((city, idx) => (
              <div key={idx} className="bg-[#000000] border border-[#222222] p-6 rounded-[24px] text-center hover:bg-[#111111] transition-colors duration-300">
                <div className="w-12 h-12 mx-auto mb-4 text-[#ffffff]">
                  <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
                    <path d={city.svg} />
                  </svg>
                </div>
                <h3 className="text-[1.1rem] font-bold text-white mb-1">{city.name}</h3>
                <span className="text-[0.7rem] uppercase tracking-widest text-[#05a357] font-bold">{city.desc}</span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default CallToAction;