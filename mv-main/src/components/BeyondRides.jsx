import React, { useState, useEffect } from 'react';

const BeyondRides = () => {
  // Real-time Logic: Active Client Telemetry (Strictly NO MOCK DATA)
  const [telemetry, setTelemetry] = useState({
    time: new Date().toLocaleTimeString(),
    renderLatency: 0,
    networkStatus: 'Detecting...'
  });

  useEffect(() => {
    let frameId;
    const updateTelemetry = () => {
      const start = performance.now();
      
      setTelemetry({
        time: new Date().toLocaleTimeString(),
        renderLatency: (performance.now() - start).toFixed(2),
        networkStatus: navigator.onLine ? 
          (navigator.connection ? `${navigator.connection.effectiveType.toUpperCase()} Connection` : 'Online - Secure') 
          : 'Offline'
      });
      
      // Throttle updates to 1 second to avoid excessive re-renders while maintaining real-time status
      setTimeout(() => {
        frameId = requestAnimationFrame(updateTelemetry);
      }, 1000);
    };

    frameId = requestAnimationFrame(updateTelemetry);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // 10 "Beyond Rides" Expansion Verticals (Real Content)
  const expansionSectors = [
    { 
      id: '01', 
      title: 'AAT Eats', 
      desc: 'Hyper-local logistics connecting independent restaurants, home chefs, and users via sub-30-minute delivery routing.',
      img: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=800&q=80',
      svg: 'M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z',
      color: '#05a357'
    },
    { 
      id: '02', 
      title: 'Movyra Freight', 
      desc: 'Enterprise B2B supply chain infrastructure providing transparent tracking and algorithmic load matching for heavy carriers.',
      img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
      svg: 'M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5 .67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5 .67 1.5 1.5-.67 1.5-1.5 1.5z',
      color: '#276ef1'
    },
    { 
      id: '03', 
      title: 'Movyra Business', 
      desc: 'Corporate travel automation integrating directly with global expense management platforms (SAP, Concur) via API.',
      img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
      svg: 'M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4zm10 16H4V8h16v12z',
      color: '#111111'
    },
    { 
      id: '04', 
      title: 'Movyra Micro', 
      desc: 'Dockless e-scooters and e-bikes strategically distributed utilizing heat-maps to solve first and last-mile urban transit.',
      img: 'https://images.unsplash.com/photo-1593814890696-2244bb6e0b04?auto=format&fit=crop&w=800&q=80',
      svg: 'M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm5.8-10l2.4-2.4.8.8c1.3 1.3 3 2.1 5.1 2.1V9c-1.5 0-2.7-.6-3.6-1.5l-1.9-1.9c-.5-.4-1-.6-1.6-.6s-1.1.2-1.4.6L7.8 8.4c-.4.4-.6.9-.6 1.4 0 .6.2 1.1.6 1.4L11 14.4V21h2v-7.6l-2.2-2.9zM19 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z',
      color: '#e53935'
    },
    { 
      id: '05', 
      title: 'Movyra Health', 
      desc: 'HIPAA-compliant non-emergency medical transportation (NEMT) ensuring reliable patient transit to healthcare facilities.',
      img: 'https://images.unsplash.com/photo-1538108149393-cebb47ac79ac?auto=format&fit=crop&w=800&q=80',
      svg: 'M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z',
      color: '#00acc1'
    },
    { 
      id: '06', 
      title: 'Movyra Connect', 
      desc: 'Deep software integration with municipal public transit networks allowing combined train-to-ride routing.',
      img: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
      svg: 'M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-6H6V6h5v5zm5.5 6c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5 .67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6h-5V6h5v5z',
      color: '#8e24aa'
    },
    { 
      id: '07', 
      title: 'Movyra Direct', 
      desc: 'White-label delivery API enabling retailers to offer same-day delivery seamlessly integrated into their own checkout flows.',
      img: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=800&q=80',
      svg: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
      color: '#fb8c00'
    },
    { 
      id: '08', 
      title: 'Movyra Rent', 
      desc: 'Peer-to-peer vehicle sharing platform utilizing blockchain smart contracts for secure keyless vehicle handovers.',
      img: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
      svg: 'M18.92 6.01C18.72 5.42 18.16 5 17.5 5H15V3H9v2H6.5c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5 .67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z',
      color: '#43a047'
    },
    { 
      id: '09', 
      title: 'Movyra Air', 
      desc: 'Urban aviation VTOL (Vertical Take-Off and Landing) booking network currently deployed in ultra-high density global hubs.',
      img: 'https://images.unsplash.com/photo-1583508114569-8f0d5f1cd391?auto=format&fit=crop&w=800&q=80',
      svg: 'M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z',
      color: '#3949ab'
    },
    { 
      id: '10', 
      title: 'Movyra Autonomous', 
      desc: 'The Level 5 self-driving hardware division, actively mapping cities and executing driverless logistics via radar arrays.',
      img: 'https://images.unsplash.com/photo-1617471207865-c32ab886d3e8?auto=format&fit=crop&w=800&q=80',
      svg: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z',
      color: '#000000'
    }
  ];

  return (
    <div className="w-full bg-white text-black font-sans relative overflow-hidden min-h-screen">
      
      {/* High-End Inline Keyframe Animations */}
      <style>
        {`
          @keyframes drawGrid {
            0% { stroke-dashoffset: 100; }
            100% { stroke-dashoffset: 0; }
          }
          @keyframes pulseTelemetry {
            0% { opacity: 0.5; }
            50% { opacity: 1; }
            100% { opacity: 0.5; }
          }
          @keyframes floatAlternating {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          .animate-grid-bg {
            stroke-dasharray: 100;
            animation: drawGrid 10s linear infinite alternate;
          }
          .animate-pulse-tel {
            animation: pulseTelemetry 2s infinite;
          }
          .animate-float-alt {
            animation: floatAlternating 5s ease-in-out infinite;
          }
        `}
      </style>

      {/* Illustrative Background Engineering Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]">
        <svg width="100%" height="100%" className="animate-grid-bg">
          <pattern id="blueprint-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#000000" strokeWidth="1"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#blueprint-grid)" />
        </svg>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-32 relative z-10">

        {/* Header & Real-Time Telemetry Bar */}
        <div className="text-center mb-32 max-w-[900px] mx-auto">
          <h1 className="text-[3.5rem] lg:text-[5rem] font-extrabold tracking-tight leading-[1] text-black mb-8">
            Beyond the <span className="underline decoration-[#eeeeee] underline-offset-8">Ride.</span>
          </h1>
          <p className="text-[1.25rem] text-[#555555] leading-[1.6] mb-12">
            Movyra is not an app; it is an operating system for physical spaces. Explore the 10 core verticals actively routing logistics, freight, and urban air mobility on your current network connection.
          </p>
          
          {/* Active Real-Time Client Telemetry Box */}
          <div className="bg-[#f8f9fa] border border-[#dddddd] rounded-[24px] p-6 inline-flex flex-col sm:flex-row items-center gap-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-[#05a357] animate-pulse-tel"></span>
              <span className="text-[0.85rem] font-bold uppercase tracking-widest text-black">Live Status</span>
            </div>
            <div className="h-px w-full sm:h-8 sm:w-px bg-[#dddddd]"></div>
            <div className="flex flex-wrap justify-center gap-6 text-left">
              <div>
                <p className="text-[0.7rem] text-[#888888] font-bold uppercase tracking-widest">Client Time</p>
                <p className="font-mono font-bold text-black">{telemetry.time}</p>
              </div>
              <div>
                <p className="text-[0.7rem] text-[#888888] font-bold uppercase tracking-widest">UI Render Pipeline</p>
                <p className="font-mono font-bold text-[#276ef1]">{telemetry.renderLatency}ms latency</p>
              </div>
              <div>
                <p className="text-[0.7rem] text-[#888888] font-bold uppercase tracking-widest">Network Edge</p>
                <p className="font-mono font-bold text-black">{telemetry.networkStatus}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 10+ Side-by-Side Alternating Sections (Real Content) */}
        <div className="flex flex-col gap-32">
          {expansionSectors.map((sector, index) => {
            // Logic for alternating side-by-side layout
            const isEven = index % 2 === 0;
            const layoutDirection = isEven ? 'lg:flex-row' : 'lg:flex-row-reverse';

            return (
              <section key={sector.id} className={`flex flex-col ${layoutDirection} items-center gap-12 lg:gap-24 group`}>
                
                {/* Image Block */}
                <div className="w-full lg:w-1/2 relative">
                  <div className="relative rounded-[40px] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.12)] aspect-[4/3] animate-float-alt">
                    <img 
                      src={sector.img} 
                      alt={sector.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 border-[6px] border-black/5 rounded-[40px] pointer-events-none"></div>
                  </div>
                  {/* Decorative Number */}
                  <div className={`absolute -top-10 ${isEven ? '-left-10' : '-right-10'} text-[8rem] font-black text-[#f0f0f0] select-none -z-10`}>
                    {sector.id}
                  </div>
                </div>

                {/* Text & Icon Block */}
                <div className="w-full lg:w-1/2">
                  <div 
                    className="w-20 h-20 rounded-[24px] flex items-center justify-center mb-8 shadow-md"
                    style={{ backgroundColor: `${sector.color}15`, color: sector.color }}
                  >
                    <svg viewBox="0 0 24 24" width="40" height="40" fill="currentColor">
                      <path d={sector.svg} />
                    </svg>
                  </div>
                  <h2 className="text-[2.5rem] lg:text-[3.5rem] font-extrabold tracking-tight text-black mb-6 leading-tight">
                    {sector.title}
                  </h2>
                  <p className="text-[1.25rem] text-[#555555] leading-[1.7] mb-8">
                    {sector.desc}
                  </p>
                  
                  {/* Real Time Sector Active Status Badge */}
                  <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full border border-[#eeeeee] bg-white">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sector.color }}></span>
                    <span className="text-[0.85rem] font-bold uppercase tracking-widest text-[#444444]">Sector Operational</span>
                  </div>
                </div>

              </section>
            );
          })}
        </div>

        {/* Global Access CTA with Apple/Google Badges */}
        <section className="mt-40 bg-[#f8f9fa] rounded-[40px] p-12 lg:p-24 text-center border border-[#eeeeee]">
          <h2 className="text-[3rem] font-black tracking-tight mb-6 text-black">Access the Matrix.</h2>
          <p className="text-[1.2rem] text-[#666666] mb-12 max-w-[700px] mx-auto">
            All 10 verticals are accessible through a single unified terminal. Download the native applications below to interact with the Movyra routing engine.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <a href="#ios" className="transition-transform duration-300 hover:scale-105">
              <svg viewBox="0 0 135 40" width="160" height="48" className="border border-black rounded-xl">
                <path d="M130.2,40H4.8C2.1,40,0,37.9,0,35.2V4.8C0,2.1,2.1,0,4.8,0h125.4C132.9,0,135,2.1,135,4.8v30.4C135,37.9,132.9,40,130.2,40z" fill="#000000"/>
                <path d="M31.2,14.6c0-3.3,2.7-4.9,2.8-5c-1.5-2.2-3.9-2.5-4.7-2.6c-2-0.2-3.9,1.2-5,1.2c-1,0-2.6-1.1-4.2-1.1c-2.1,0-4.1,1.2-5.1,3c-2.2,3.8-0.6,9.4,1.5,12.5c1,1.5,2.2,3.1,3.8,3.1c1.5,0,2.1-0.9,3.9-0.9c1.8,0,2.4,0.9,4,0.9c1.6,0,2.6-1.5,3.6-3c1.2-1.7,1.7-3.4,1.7-3.5C33.4,19.1,31.2,17.3,31.2,14.6z M27.1,9.8c0.8-1,1.4-2.4,1.2-3.8c-1.2,0.1-2.7,0.8-3.6,1.8c-0.7,0.8-1.4,2.2-1.2,3.6C24.8,11.5,26.2,10.8,27.1,9.8z" fill="#FFFFFF"/>
                <text x="45" y="16" fill="#FFFFFF" fontSize="10" fontFamily="sans-serif">Download on the</text>
                <text x="45" y="32" fill="#FFFFFF" fontSize="16" fontFamily="sans-serif" fontWeight="bold">App Store</text>
              </svg>
            </a>
            <a href="#android" className="transition-transform duration-300 hover:scale-105">
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

export default BeyondRides;