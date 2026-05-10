import React, { useState, useEffect } from 'react';

const MissionStatement = () => {
  // Real-time Engine: Drives the live global operations logic
  const [liveTime, setLiveTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Helper to get real-time formatted strings for global cities
  const getCityTime = (timeZone) => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(liveTime);
  };

  // 10+ Operational Pillars (Real Content)
  const operationalPillars = [
    { title: 'Algorithmic Dispatch', desc: 'Sub-millisecond routing optimizing global fleet efficiency.', svg: 'M12 2L2 22h20L12 2zm0 4.5l6.5 13.5h-13L12 6.5z' },
    { title: 'Climate Commitment', desc: 'Aggressive transition to 100% zero-emission platforms.', svg: 'M12 2.02c-5.51 0-9.98 4.47-9.98 9.98s4.47 9.98 9.98 9.98 9.98-4.47 9.98-9.98S17.51 2.02 12 2.02zM11.48 20v-6.26H8L13 4v6.26h3.35L11.48 20z' },
    { title: 'Economic Empowerment', desc: 'Providing flexible earning opportunities for millions.', svg: 'M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z' },
    { title: 'Predictive Safety', desc: 'Machine learning models anticipating and preventing incidents.', svg: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z' },
    { title: 'Urban Integration', desc: 'Partnering with transit agencies to reduce congestion.', svg: 'M15 11V5l-3-3-3 3v2H3v14h18V11h-6zm-8 8H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V9h2v2zm6 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2zm6 12h-2v-2h2v2zm0-4h-2v-2h2v2z' },
    { title: 'Autonomous Horizons', desc: 'Pioneering self-driving technology for safer futures.', svg: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z' },
    { title: 'Micro-Mobility', desc: 'E-bikes and scooters for first and last-mile connectivity.', svg: 'M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm5.8-10l2.4-2.4.8.8c1.3 1.3 3 2.1 5.1 2.1V9c-1.5 0-2.7-.6-3.6-1.5l-1.9-1.9c-.5-.4-1-.6-1.6-.6s-1.1.2-1.4.6L7.8 8.4c-.4.4-.6.9-.6 1.4 0 .6.2 1.1.6 1.4L11 14.4V21h2v-7.6l-2.2-2.9zM19 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z' },
    { title: 'Enterprise Solutions', desc: 'Streamlining global travel and expense management.', svg: 'M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4zm10 16H4V8h16v12z' },
    { title: 'Freight Logistics', desc: 'Transparent pricing and real-time tracking for carriers.', svg: 'M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5 .67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5 .67 1.5 1.5-.67 1.5-1.5 1.5z' },
    { title: 'Universal Accessibility', desc: 'Wheelchair-accessible vehicles and screen reader optimizations.', svg: 'M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z' }
  ];

  // 10 Global Cities for Real-Time Logic
  const globalCities = [
    { name: 'San Francisco', tz: 'America/Los_Angeles', svg: 'M12 2L2 12h3v8h14v-8h3L12 2zm0 2.8l5 5V18H7v-8.2l5-5z' },
    { name: 'New York', tz: 'America/New_York', svg: 'M15 11V5l-3-3-3 3v2H3v14h18V11h-6z' },
    { name: 'London', tz: 'Europe/London', svg: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z' },
    { name: 'Paris', tz: 'Europe/Paris', svg: 'M12 2L8 22h8L12 2z' },
    { name: 'Dubai', tz: 'Asia/Dubai', svg: 'M12 2L4 22h16L12 2zm0 4.5l5.5 13.5h-11L12 6.5z' },
    { name: 'Mumbai', tz: 'Asia/Kolkata', svg: 'M2 22h20V12l-10-6-10 6v10zm10-13l6 3.6V20H6v-7.4L12 9z' },
    { name: 'Singapore', tz: 'Asia/Singapore', svg: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z' },
    { name: 'Tokyo', tz: 'Asia/Tokyo', svg: 'M12 2L2 10l3 3v7h14v-7l3-3-10-8zm0 3.5l5 4v8.5H7v-8.5l5-4z' },
    { name: 'Sydney', tz: 'Australia/Sydney', svg: 'M4 22h16v-2H4v2zm8-18C8.13 4 5 7.13 5 11h14c0-3.87-3.13-7-7-7zm0 2c2.21 0 4.09 1.43 4.76 3.42l-9.52.01C7.91 7.43 9.79 6 12 6z' },
    { name: 'São Paulo', tz: 'America/Sao_Paulo', svg: 'M12 3v18m9-9H3m15.36-6.36l-12.72 12.72m0-12.72l12.72 12.72' }
  ];

  return (
    <section className="relative w-full max-w-[1400px] mx-auto px-6 lg:px-12 py-32 font-sans text-black overflow-hidden">
      
      {/* Inline styles for custom high-end keyframes */}
      <style>
        {`
          @keyframes customOrbit1 {
            from { transform: rotate(0deg) scale(1); }
            50% { transform: rotate(180deg) scale(1.2); }
            to { transform: rotate(360deg) scale(1); }
          }
          @keyframes customOrbit2 {
            from { transform: rotate(360deg) scale(1); }
            50% { transform: rotate(180deg) scale(0.8); }
            to { transform: rotate(0deg) scale(1); }
          }
          @keyframes customPulseGreen {
            0% { box-shadow: 0 0 0 0 rgba(5, 163, 87, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(5, 163, 87, 0); }
            100% { box-shadow: 0 0 0 0 rgba(5, 163, 87, 0); }
          }
          @keyframes customFloatPhone {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
          .animate-orbit-1 { animation: customOrbit1 40s linear infinite; transform-origin: center; }
          .animate-orbit-2 { animation: customOrbit2 30s linear infinite; transform-origin: center; }
          .animate-pulse-green { animation: customPulseGreen 2s infinite; }
          .animate-float-phone { animation: customFloatPhone 6s ease-in-out infinite; }
        `}
      </style>

      {/* High-End Illustrative Background Animation */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <svg viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <g filter="url(#bbblurry-filter)">
            <ellipse rx="150" ry="150" cx="400" cy="400" fill="#f0f0f0" opacity="0.5" className="animate-orbit-1"></ellipse>
            <ellipse rx="200" ry="100" cx="400" cy="400" fill="#e8e8e8" opacity="0.4" className="animate-orbit-2"></ellipse>
          </g>
          <defs>
            <filter id="bbblurry-filter" x="-20%" y="-20%" width="140%" height="140%" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feGaussianBlur stdDeviation="80" x="0%" y="0%" width="100%" height="100%" in="SourceGraphic" edgeMode="none" result="blur"></feGaussianBlur>
            </filter>
          </defs>
        </svg>
      </div>

      {/* Core Typography Section */}
      <div className="relative z-10 max-w-[900px] mb-32">
        <h1 className="text-[clamp(2.5rem,5vw,4.5rem)] font-extrabold leading-[1.1] tracking-[-1.5px] mb-8 text-black">
          We reimagine the way the world moves for the better
        </h1>
        <p className="text-[clamp(1.1rem,2vw,1.25rem)] leading-[1.7] text-[#444444]">
          Movement is what we power. It is our lifeblood. It runs through our veins. It is what gets us out of bed each morning. It pushes us to constantly reimagine how we can move better. For you. For all the places you want to go. For all the things you want to get. For all the ways you want to earn. Across the entire world. In real time. At the incredible speed of now.
        </p>
      </div>

      {/* Real-time Global Operations Matrix (10 Cities) */}
      <div className="relative z-10 bg-[#f8f9fa] rounded-[24px] p-8 lg:p-16 mb-32">
        <div className="text-center mb-10">
          <h2 className="text-[2.5rem] font-bold mb-3 text-black">Operating at the Speed of Now</h2>
          <p className="text-[1.1rem] text-[#666666]">Real-time telemetry across our top 10 global hubs.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {globalCities.map((city, index) => (
            <div className="bg-white p-5 rounded-2xl flex items-center gap-4 shadow-[0_10px_20px_rgba(0,0,0,0.04)] relative transition-transform duration-300 hover:-translate-y-1" key={index}>
              <svg viewBox="0 0 24 24" width="24" height="24" fill="#000000" className="shrink-0">
                <path d={city.svg} />
              </svg>
              <div className="flex flex-col overflow-hidden">
                <span className="font-bold text-[0.95rem] mb-1 truncate text-black">{city.name}</span>
                <span className="font-mono text-[0.85rem] text-[#555555] truncate">{getCityTime(city.tz)}</span>
              </div>
              <div className="w-2 h-2 bg-[#05a357] rounded-full absolute top-5 right-5 animate-pulse-green"></div>
            </div>
          ))}
        </div>
      </div>

      {/* 10+ Operational Pillars Grid */}
      <div className="relative z-10 mb-32">
        <h2 className="text-[2.5rem] font-bold mb-10 text-black">The Pillars of Reimagination</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {operationalPillars.map((pillar, index) => (
            <div className="p-8 border-b-2 border-[#eeeeee] transition-colors duration-300 hover:border-black" key={index}>
              <div className="mb-5">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="#000000">
                  <path d={pillar.svg} />
                </svg>
              </div>
              <h3 className="text-[1.2rem] font-bold mb-3 text-black">{pillar.title}</h3>
              <p className="text-[0.95rem] text-[#555555] leading-[1.5]">{pillar.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Graphic & App Store CTA */}
      <div className="relative z-10 bg-black text-white rounded-[32px] p-8 lg:p-20 flex flex-col lg:flex-row items-center justify-between overflow-hidden">
        <div className="flex-1 max-w-[500px] relative z-20 text-center lg:text-left mb-16 lg:mb-0">
          <h2 className="text-[2.5rem] lg:text-[3rem] font-bold mb-5 text-white">Ready to move the world?</h2>
          <p className="text-[1.2rem] text-[#cccccc] mb-10">Download the app and experience real-time mobility.</p>
          <div className="flex flex-wrap justify-center lg:justify-start gap-5">
            <a href="#ios-store" className="transition-transform duration-300 hover:-translate-y-1 hover:scale-105 block">
              <svg viewBox="0 0 135 40" width="160" height="48">
                <path d="M130.2,40H4.8C2.1,40,0,37.9,0,35.2V4.8C0,2.1,2.1,0,4.8,0h125.4C132.9,0,135,2.1,135,4.8v30.4C135,37.9,132.9,40,130.2,40z" fill="#000000"/>
                <path d="M31.2,14.6c0-3.3,2.7-4.9,2.8-5c-1.5-2.2-3.9-2.5-4.7-2.6c-2-0.2-3.9,1.2-5,1.2c-1,0-2.6-1.1-4.2-1.1c-2.1,0-4.1,1.2-5.1,3c-2.2,3.8-0.6,9.4,1.5,12.5c1,1.5,2.2,3.1,3.8,3.1c1.5,0,2.1-0.9,3.9-0.9c1.8,0,2.4,0.9,4,0.9c1.6,0,2.6-1.5,3.6-3c1.2-1.7,1.7-3.4,1.7-3.5C33.4,19.1,31.2,17.3,31.2,14.6z M27.1,9.8c0.8-1,1.4-2.4,1.2-3.8c-1.2,0.1-2.7,0.8-3.6,1.8c-0.7,0.8-1.4,2.2-1.2,3.6C24.8,11.5,26.2,10.8,27.1,9.8z" fill="#FFFFFF"/>
                <text x="45" y="16" fill="#FFFFFF" fontSize="10" fontFamily="sans-serif">Download on the</text>
                <text x="45" y="32" fill="#FFFFFF" fontSize="16" fontFamily="sans-serif" fontWeight="bold">App Store</text>
              </svg>
            </a>
            <a href="#android-store" className="transition-transform duration-300 hover:-translate-y-1 hover:scale-105 block">
              <svg viewBox="0 0 135 40" width="160" height="48">
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
        <div className="flex-1 flex justify-center lg:justify-end relative z-10 translate-y-[20px] lg:translate-y-[40px]">
          {/* Custom App Interface Representation SVG */}
          <svg viewBox="0 0 200 400" width="100%" height="auto" className="max-w-[250px] animate-float-phone">
            <rect x="10" y="10" width="180" height="380" rx="20" fill="#000000" />
            <rect x="14" y="14" width="172" height="372" rx="16" fill="#ffffff" />
            <circle cx="100" cy="100" r="40" fill="#f0f0f0" />
            <path d="M80 100 L100 120 L130 80" stroke="#000000" strokeWidth="6" fill="none" />
            <rect x="30" y="170" width="140" height="20" rx="10" fill="#f0f0f0" />
            <rect x="30" y="210" width="100" height="20" rx="10" fill="#f0f0f0" />
            <rect x="30" y="320" width="140" height="40" rx="20" fill="#000000" />
          </svg>
        </div>
      </div>
    </section>
  );
};

export default MissionStatement;