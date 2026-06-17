import React, { useState, useEffect } from 'react';

const Sustainability = () => {
  // Real-time logic 1: Live countdown to 2040 Zero-Emission Mandate
  const [countdown, setCountdown] = useState({ years: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
  // Real-time logic 2: Client system energy check (Dark Mode saves OLED power)
  const [systemDarkTheme, setSystemDarkTheme] = useState(false);

  useEffect(() => {
    // Zero-Emission Target: January 1, 2040
    const targetDate = new Date('2040-01-01T00:00:00Z').getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setCountdown({
          years: Math.floor(difference / (1000 * 60 * 60 * 24 * 365.25)),
          days: Math.floor((difference % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);

    // Detect actual system theme for real UI energy telemetry
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setSystemDarkTheme(true);
    }
    
    const colorSchemeListener = (e) => setSystemDarkTheme(e.matches);
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', colorSchemeListener);
    }

    return () => {
      clearInterval(timer);
      if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', colorSchemeListener);
      }
    };
  }, []);

  // 10 Real Operational Sustainability Features
  const greenFeatures = [
    { title: '100% EV Transition', desc: 'Mandating zero-emission vehicles across the entire global grid by 2040.', svg: 'M18.92 6.01C18.72 5.42 18.16 5 17.5 5H15V3H9v2H6.5c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5 .67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z' },
    { title: 'Algorithmic Dead-Mile Reduction', desc: 'Predictive positioning eliminates empty vehicle transit, cutting passive emissions by 40%.', svg: 'M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zM8 15v-4.5H6.5v6H11v-1.5H8zm5-4.5h-1.5v6H13v-6zm3.5 0H15v6h1.5v-6z' },
    { title: 'Micro-Mobility Nodes', desc: 'Integrating high-density e-scooter and e-bike routing for urban first/last mile logic.', svg: 'M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm5.8-10l2.4-2.4.8.8c1.3 1.3 3 2.1 5.1 2.1V9c-1.5 0-2.7-.6-3.6-1.5l-1.9-1.9c-.5-.4-1-.6-1.6-.6s-1.1.2-1.4.6L7.8 8.4c-.4.4-.6.9-.6 1.4 0 .6.2 1.1.6 1.4L11 14.4V21h2v-7.6l-2.2-2.9zM19 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z' },
    { title: 'Renewable Datacenters', desc: '100% of the Movyra routing engine is powered by solar and wind-backed server farms.', svg: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 9h-2V7h-2v5H6v-2h2V7c0-1.1.9-2 2-2h2v2h2v5zm4 0h-2V7h-2v5h-2v-2h2V7c0-1.1.9-2 2-2h2v2h2v5z' },
    { title: 'Carbon-Negative Freight', desc: 'Heavy logistics routed strictly via verified low-emission carrier partnerships.', svg: 'M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5 .67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5 .67 1.5 1.5-.67 1.5-1.5 1.5z' },
    { title: 'Dynamic Transit Hook', desc: 'APIs that suggest public train/bus integration when it reduces journey carbon cost.', svg: 'M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-6H6V6h5v5zm5.5 6c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5 .67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6h-5V6h5v5z' },
    { title: 'Biodegradable Packaging', desc: 'AAT Eats mandates compostable material protocols for all restaurant vendors.', svg: 'M12 2.02c-5.51 0-9.98 4.47-9.98 9.98s4.47 9.98 9.98 9.98 9.98-4.47 9.98-9.98S17.51 2.02 12 2.02zM11.48 20v-6.26H8L13 4v6.26h3.35L11.48 20z' },
    { title: 'Hardware Lifecycle', desc: 'Driver terminal devices are recycled to reclaim rare-earth metals and lithium.', svg: 'M15 11V5l-3-3-3 3v2H3v14h18V11h-6z' },
    { title: 'Tree-Canopy Analysis', desc: 'We supply municipal bodies with thermal mapping data to plan urban forestry.', svg: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z' },
    { title: 'Carbon Transparency', desc: 'Users see real-time gCO2e avoidance metrics on their personal mobility receipts.', svg: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' }
  ];

  // Custom Cities Grid
  const globalCities = [
    { name: 'San Francisco', desc: '100% EV Node', svg: 'M12 2L2 12h3v8h14v-8h3L12 2zm0 2.8l5 5V18H7v-8.2l5-5z' },
    { name: 'London', desc: 'Congestion Zone API', svg: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z' },
    { name: 'Paris', desc: 'Micro-Mobility Hub', svg: 'M12 2L8 22h8L12 2z' },
    { name: 'Tokyo', desc: 'Smart Transit Hook', svg: 'M12 2L2 10l3 3v7h14v-7l3-3-10-8zm0 3.5l5 4v8.5H7v-8.5l5-4z' }
  ];

  return (
    <div className="w-full bg-[#f8fafc] text-black font-sans relative overflow-hidden min-h-screen">
      
      {/* High-End Inline Keyframe Animations */}
      <style>
        {`
          @keyframes ecoFloat {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-15px) rotate(2deg); }
          }
          @keyframes leafPulse {
            0% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(1); opacity: 0.8; }
          }
          @keyframes orbitWind {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-eco-float {
            animation: ecoFloat 6s ease-in-out infinite;
          }
          .animate-leaf-pulse {
            animation: leafPulse 3s ease-in-out infinite;
          }
          .animate-wind-spin {
            animation: orbitWind 20s linear infinite;
          }
        `}
      </style>

      {/* Illustrative Background Geometry */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]">
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <pattern id="leaf-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M10 2c-4 0-8 4-8 8s4 8 8 8 8-4 8-8-4-8-8-8z" fill="none" stroke="#000000" strokeWidth="0.5"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#leaf-pattern)" />
        </svg>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-24 relative z-10">

        {/* Section 1: Hero & Vision */}
        <section className="flex flex-col lg:flex-row items-center justify-between mb-32 gap-16">
          <div className="w-full lg:w-1/2">
            <div className="w-20 h-20 bg-[#e6f4ea] rounded-[24px] flex items-center justify-center mb-8 shadow-sm">
              <svg viewBox="0 0 24 24" width="40" height="40" fill="#05a357" className="animate-leaf-pulse">
                <path d="M17 5.92L9 2v18H7v-1.73c-2.24.23-4-.7-4-2.27 0-1.12 1.34-1.92 3-2.14V5.92L17 2v18h-2v-1.73c2.24.23 4-.7 4-2.27 0-1.12-1.34-1.92-3-2.14z"/>
              </svg>
            </div>
            <h1 className="text-[3.5rem] lg:text-[5rem] font-extrabold tracking-tight leading-[1] text-black mb-6">
              Zero <span className="text-[#05a357]">Emissions.</span><br/>Absolute Action.
            </h1>
            <p className="text-[1.25rem] text-[#555555] leading-[1.6] max-w-[600px]">
              It is our responsibility as the largest mobility platform globally to aggressively tackle climate change. We engineer technology to expedite a clean, just energy transition.
            </p>
          </div>
          <div className="w-full lg:w-1/2 relative h-[500px]">
            {/* Custom High-End Photo Placeholder & Graphic Overlay */}
            <div className="absolute inset-0 rounded-[40px] overflow-hidden shadow-2xl animate-eco-float">
              <img 
                src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1000&q=80" 
                alt="Lush green canopy reflecting our sustainability goals" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-10">
                <p className="text-white font-bold text-[1.5rem] leading-[1.2]">Rewriting the physical infrastructure of cities.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Real-Time Target 2040 Countdown Engine */}
        <section className="mb-32">
          <div className="bg-black text-white rounded-[40px] p-10 lg:p-16 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#05a357] opacity-20 blur-[80px] rounded-full pointer-events-none"></div>
            <h2 className="text-[2.5rem] lg:text-[3.5rem] font-black mb-4">Mandate: Jan 1, 2040</h2>
            <p className="text-[1.2rem] text-[#aaaaaa] mb-12">The real-time countdown to a fully zero-emission Movyra grid.</p>
            
            <div className="flex flex-wrap justify-center gap-6 lg:gap-10">
              {Object.entries(countdown).map(([unit, value], idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className="bg-[#111111] border border-[#333333] rounded-[24px] w-24 h-24 lg:w-32 lg:h-32 flex items-center justify-center mb-4 shadow-[0_10px_30px_rgba(5,163,87,0.1)]">
                    <span className="text-[2.5rem] lg:text-[3.5rem] font-mono font-bold text-[#05a357]">{value}</span>
                  </div>
                  <span className="text-[0.85rem] font-bold uppercase tracking-widest text-[#888888]">{unit}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: Client-Side Energy Telemetry (Real Logic) */}
        <section className="mb-32">
          <div className="bg-white border-2 border-[#05a357] rounded-[32px] p-10 flex flex-col md:flex-row items-center justify-between shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#e6f4ea] rounded-bl-[100%] z-0"></div>
            <div className="relative z-10 w-full md:w-2/3 pr-0 md:pr-10 mb-8 md:mb-0">
              <span className="inline-block px-3 py-1 bg-[#05a357] text-white text-[0.75rem] font-bold uppercase tracking-widest rounded-full mb-4">Live Client Telemetry</span>
              <h2 className="text-[2rem] font-bold text-black mb-4">UI Energy Efficiency Check</h2>
              <p className="text-[1.1rem] text-[#555555]">
                Digital infrastructure requires physical energy. We optimize our UI based on your device parameters. Your current system theme is rendered below.
              </p>
            </div>
            <div className="relative z-10 w-full md:w-1/3 flex justify-center md:justify-end">
              <div className={`p-8 rounded-[24px] border-2 transition-all duration-500 flex flex-col items-center text-center w-full max-w-[250px] ${systemDarkTheme ? 'bg-black border-[#333333] text-white' : 'bg-[#f0f0f0] border-[#dddddd] text-black'}`}>
                <svg viewBox="0 0 24 24" width="40" height="40" fill="currentColor" className="mb-4">
                  <path d={systemDarkTheme ? "M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" : "M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"} />
                </svg>
                <p className="font-bold text-[1.1rem] mb-1">{systemDarkTheme ? 'Dark Mode' : 'Light Mode'}</p>
                <p className="text-[0.8rem] opacity-70 uppercase tracking-wider">{systemDarkTheme ? 'OLED Power Saved' : 'Standard Draw'}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Sections 4, 5, 6, 7: 10 Real Operational Sustainability Features Grid */}
        <section className="mb-32">
          <div className="mb-16 text-center">
            <h2 className="text-[3rem] font-bold text-black mb-4 tracking-tight">The 10 Green Engineering Protocols</h2>
            <p className="text-[1.2rem] text-[#666666]">Concrete features embedded in the current platform.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {greenFeatures.map((feature, idx) => (
              <div key={idx} className="bg-white p-6 rounded-[24px] shadow-[0_10px_20px_rgba(0,0,0,0.03)] border border-[#eeeeee] hover:border-[#05a357] transition-colors duration-300 group flex flex-col">
                <div className="w-12 h-12 bg-[#f0f0f0] rounded-xl flex items-center justify-center mb-5 group-hover:bg-[#05a357] group-hover:text-white transition-colors duration-300 text-black">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                    <path d={feature.svg} />
                  </svg>
                </div>
                <h3 className="font-bold text-[1.1rem] text-black mb-3">{feature.title}</h3>
                <p className="text-[0.9rem] text-[#666666] leading-[1.5] flex-grow">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 8: Global City Adaptation SVG Matrix */}
        <section className="mb-32">
          <h2 className="text-[2.5rem] font-bold text-black mb-10 text-center">Urban Adaptation Status</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {globalCities.map((city, idx) => (
              <div key={idx} className="bg-white border border-[#eeeeee] p-8 rounded-[32px] text-center flex flex-col items-center hover:shadow-xl transition-shadow duration-300">
                <div className="w-20 h-20 border-4 border-[#05a357] rounded-full flex items-center justify-center mb-6">
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="#000000">
                    <path d={city.svg} />
                  </svg>
                </div>
                <h3 className="text-[1.5rem] font-bold text-black mb-2">{city.name}</h3>
                <span className="bg-[#e6f4ea] text-[#05a357] px-4 py-1 rounded-full text-[0.8rem] font-bold uppercase tracking-widest">{city.desc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Section 9: Carbon-Negative Graphic Block */}
        <section className="mb-32 bg-[#001c10] text-white rounded-[40px] p-12 lg:p-20 flex flex-col lg:flex-row items-center justify-between gap-12 overflow-hidden relative">
          <div className="w-full lg:w-1/2 relative z-10">
            <h2 className="text-[2.5rem] lg:text-[3.5rem] font-black mb-6 leading-tight">Going beyond zero.</h2>
            <p className="text-[1.2rem] text-[#8ce2b3] mb-8 leading-[1.6]">
              Sustainability isn't just about doing less harm; it's about actively repairing the grid. We are investing capital directly into active carbon capture technologies globally.
            </p>
            <div className="flex items-center gap-4 border-l-4 border-[#05a357] pl-6">
              <span className="text-[2rem] font-bold">1M+</span>
              <span className="text-[1rem] uppercase tracking-widest text-[#aaaaaa]">Tons CO2e Reversed Annually</span>
            </div>
          </div>
          <div className="w-full lg:w-1/2 relative flex justify-center z-10">
             <div className="w-64 h-64 border-[8px] border-[#05a357] rounded-full flex items-center justify-center border-dashed animate-wind-spin">
               <div className="w-32 h-32 bg-[#05a357] rounded-full opacity-50 blur-xl"></div>
             </div>
             <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 24 24" width="80" height="80" fill="#ffffff">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                </svg>
             </div>
          </div>
        </section>

        {/* Section 10: App Download Badges (Actionable Terminal) */}
        <section className="text-center bg-white border border-[#eeeeee] p-16 rounded-[40px] shadow-sm">
          <h2 className="text-[2.5rem] font-bold text-black mb-4">Ride Green. Deploy the Terminal.</h2>
          <p className="text-[1.1rem] text-[#666666] mb-10 max-w-[600px] mx-auto">
            Choose the 'Green' routing option in the native app to ensure your request is matched strictly with an EV or hybrid node.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <a href="#ios" className="transition-transform duration-300 hover:-translate-y-2">
              <svg viewBox="0 0 135 40" width="160" height="48" className="border border-black rounded-xl">
                <path d="M130.2,40H4.8C2.1,40,0,37.9,0,35.2V4.8C0,2.1,2.1,0,4.8,0h125.4C132.9,0,135,2.1,135,4.8v30.4C135,37.9,132.9,40,130.2,40z" fill="#000000"/>
                <path d="M31.2,14.6c0-3.3,2.7-4.9,2.8-5c-1.5-2.2-3.9-2.5-4.7-2.6c-2-0.2-3.9,1.2-5,1.2c-1,0-2.6-1.1-4.2-1.1c-2.1,0-4.1,1.2-5.1,3c-2.2,3.8-0.6,9.4,1.5,12.5c1,1.5,2.2,3.1,3.8,3.1c1.5,0,2.1-0.9,3.9-0.9c1.8,0,2.4,0.9,4,0.9c1.6,0,2.6-1.5,3.6-3c1.2-1.7,1.7-3.4,1.7-3.5C33.4,19.1,31.2,17.3,31.2,14.6z M27.1,9.8c0.8-1,1.4-2.4,1.2-3.8c-1.2,0.1-2.7,0.8-3.6,1.8c-0.7,0.8-1.4,2.2-1.2,3.6C24.8,11.5,26.2,10.8,27.1,9.8z" fill="#FFFFFF"/>
                <text x="45" y="16" fill="#FFFFFF" fontSize="10" fontFamily="sans-serif">Download on the</text>
                <text x="45" y="32" fill="#FFFFFF" fontSize="16" fontFamily="sans-serif" fontWeight="bold">App Store</text>
              </svg>
            </a>
            <a href="#android" className="transition-transform duration-300 hover:-translate-y-2">
              <svg viewBox="0 0 135 40" width="160" height="48" className="border border-black rounded-xl bg-black">
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

export default Sustainability;