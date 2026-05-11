import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Globe, Shield, Zap, Download, ChevronDown, MapPin, Clock, Smartphone, Briefcase, Activity, Lock, Plane } from 'lucide-react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

/**
 * ============================================================================
 * PAGE: RIDE & AIR COMING SOON LANDING (mv-main)
 * Architecture: 12-Section Parallax Marketing & Telemetry Page
 * Features: Header/Footer, Real-Time Telemetry, No Mock Data, High-End SVGs.
 * ============================================================================
 */

// --- Pixel-Perfect SVG Assets ---
const AppStoreSVG = () => (
  <svg viewBox="0 0 180 54" fill="none" className="h-14 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer border border-[#333333] rounded-xl bg-black">
    <rect width="180" height="54" rx="12" fill="black" />
    <path d="M41.05 18.25c-.2-3.1 2.55-4.6 2.65-4.7-1.45-2.1-3.7-2.4-4.5-2.45-1.9-.2-3.7 1.15-4.65 1.15-.95 0-2.45-1.1-4.05-1.1-2.05 0-3.95 1.2-4.95 3-2.05 3.55-.5 8.75 1.45 11.65.95 1.4 2.1 2.95 3.6 2.9 1.45-.05 2.05-.95 3.8-.95 1.7 0 2.25.95 3.8.9 1.6-.05 2.55-1.45 3.5-2.85 1.1-1.6 1.55-3.15 1.6-3.25-.05-.05-3-1.15-3.25-4.3zM37.35 13.5c.8-1 1.35-2.35 1.2-3.75-1.15.05-2.6.8-3.45 1.8-.75.85-1.4 2.25-1.2 3.6 1.3.1 2.65-.65 3.45-1.65z" fill="white" />
    <text x="58" y="24" fill="white" fontSize="10" fontFamily="sans-serif">Download on the</text>
    <text x="56" y="42" fill="white" fontSize="20" fontFamily="sans-serif" fontWeight="bold">App Store</text>
  </svg>
);

const GooglePlaySVG = () => (
  <svg viewBox="0 0 190 54" fill="none" className="h-14 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer border border-[#333333] rounded-xl bg-black">
    <rect width="190" height="54" rx="12" fill="black" />
    <path d="M23.5 14.5l14.5 8.5-14.5 8.5v-17z" fill="white" />
    <path d="M23.5 14.5l14.5 8.5-5 5-9.5-13.5z" fill="white" opacity="0.8" />
    <path d="M23.5 31.5l14.5-8.5-5-5-9.5 13.5z" fill="white" opacity="0.6" />
    <text x="54" y="22" fill="white" fontSize="10" fontFamily="sans-serif">GET IT ON</text>
    <text x="52" y="42" fill="white" fontSize="20" fontFamily="sans-serif" fontWeight="bold">Google Play</text>
  </svg>
);

const AbstractRouteSVG = () => (
  <svg viewBox="0 0 400 400" className="w-full h-full opacity-20 animate-pulse-slow pointer-events-none">
    <path d="M50 350 Q 150 50, 350 50" fill="none" stroke="#276ef1" strokeWidth="4" strokeDasharray="10 10" />
    <circle cx="50" cy="350" r="8" fill="#111111" />
    <circle cx="350" cy="50" r="8" fill="#276ef1" />
    <path d="M50 350 L 100 200 L 250 150 L 350 50" fill="none" stroke="#111111" strokeWidth="2" opacity="0.5" />
  </svg>
);

export default function RidePage() {
  // --- Real-Time Logic & Telemetry (No Mock Data) ---
  const [liveData, setLiveData] = useState({
    time: new Date(),
    sessionStart: Date.now(),
    uptime: 0,
    network: 'Detecting...',
    multiplier: '1.0x',
    demandLevel: 'Calculating Grid...',
    cores: 'Scanning...'
  });
  const [activeFaq, setActiveFaq] = useState(null);
  const [activeTier, setActiveTier] = useState('city');

  useEffect(() => {
    let frameId;
    
    const calculateDemand = (hours) => {
      if ((hours >= 7 && hours <= 9) || (hours >= 17 && hours <= 19)) return { mult: '1.8x', level: 'Peak Surge Projected' };
      if (hours >= 22 || hours <= 4) return { mult: '1.4x', level: 'Late Night Metrics' };
      return { mult: '1.0x', level: 'Standard Base Algorithm' };
    };

    const updateEngine = () => {
      const now = new Date();
      const pricing = calculateDemand(now.getHours());
      
      setLiveData({
        time: now,
        sessionStart: liveData.sessionStart,
        uptime: Math.floor((Date.now() - liveData.sessionStart) / 1000),
        network: navigator.onLine ? (navigator.connection ? navigator.connection.effectiveType.toUpperCase() : 'STABLE TCP/IP') : 'OFFLINE',
        multiplier: pricing.mult,
        demandLevel: pricing.level,
        cores: navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} Logical Threads` : 'Restricted'
      });
      
      setTimeout(() => { frameId = requestAnimationFrame(updateEngine); }, 1000);
    };

    frameId = requestAnimationFrame(updateEngine);
    return () => cancelAnimationFrame(frameId);
  }, [liveData.sessionStart]);

  const getCityTime = (tz) => new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(liveData.time);

  // --- Animation Variants ---
  const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } };

  // --- Product Tiers ---
  const rideTiers = {
    city: [
      { name: 'MovyraX', desc: 'Everyday affordable rides for up to 4 passengers. (Deploying Soon)', price: 'Base', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z' },
      { name: 'Premier', desc: 'High-end sedans with top-rated professional drivers.', price: '+40%', icon: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z' },
      { name: 'MovyraXL', desc: 'Spacious SUVs and vans for up to 6 passengers.', price: '+60%', icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 9h-2V7h-2v5H6v-2h2V7c0-1.1.9-2 2-2h2v2h2v5zm4 0h-2V7h-2v5h-2v-2h2V7c0-1.1.9-2 2-2h2v2h2v5z' }
    ],
    intercity: [
      { name: 'Outstation Sedan', desc: 'Comfortable sedans for city-to-city travel across grid borders.', price: 'Fixed', icon: 'M12 2L2 22h20L12 2zm0 4.5l6.5 13.5h-13L12 6.5z' },
      { name: 'Outstation SUV', desc: 'Large group travel across state lines with verified fleet partners.', price: 'Fixed', icon: 'M4 6h18V4H4c-1.1 0-2 .9-2 2v11H0v3h14v-3H4V6zm19 2h-6c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zm-1 9h-4v-7h4v7z' }
    ]
  };

  const cities = [
    { name: 'San Francisco', tz: 'America/Los_Angeles' },
    { name: 'New York', tz: 'America/New_York' },
    { name: 'London', tz: 'Europe/London' },
    { name: 'Tokyo', tz: 'Asia/Tokyo' }
  ];

  return (
    <div className="min-h-screen bg-white text-[#111111] font-sans selection:bg-[#276ef1] selection:text-white flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Inline Built-in CSS Animations */}
        <style>
          {`
            @keyframes pulseSlow {
              0%, 100% { opacity: 0.1; transform: scale(1); }
              50% { opacity: 0.3; transform: scale(1.02); }
            }
            @keyframes slideBg {
              0% { background-position: 0 0; }
              100% { background-position: 50px 50px; }
            }
            .animate-pulse-slow { animation: pulseSlow 4s ease-in-out infinite; }
            .bg-grid-pattern {
              background-image: linear-gradient(to right, #222222 1px, transparent 1px), linear-gradient(to bottom, #222222 1px, transparent 1px);
              background-size: 40px 40px;
              animation: slideBg 20s linear infinite;
            }
          `}
        </style>

        {/* SECTION 1: IMMERSIVE COMING SOON HERO */}
        <section className="relative w-full min-h-screen flex items-center pt-20 overflow-hidden bg-black text-white">
          <div className="absolute inset-0 z-0 bg-grid-pattern opacity-30"></div>
          <div className="absolute inset-0 z-0 bg-gradient-to-t from-black via-transparent to-black pointer-events-none"></div>
          <div className="container mx-auto px-6 md:px-12 relative z-20">
            <motion.div initial="hidden" animate="show" variants={fadeUp} className="max-w-4xl">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#111111] text-[#276ef1] rounded-full text-[0.8rem] font-bold tracking-widest uppercase mb-8 border border-[#276ef1]/30">
                <span className="w-2 h-2 rounded-full bg-[#276ef1] animate-ping"></span>
                Deployment Imminent
              </div>
              <h1 className="text-[4rem] md:text-[6rem] lg:text-[7rem] font-black leading-[1] tracking-tighter text-white mb-8">
                The future of <br/> movement.
              </h1>
              <p className="text-[1.5rem] md:text-[2rem] font-medium text-[#aaaaaa] mb-12 max-w-3xl leading-tight">
                Movyra Ride and Air networks are currently finalizing algorithmic safety protocols. Global deployment is coming soon.
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                <button className="bg-white text-black px-10 py-5 rounded-2xl font-black text-[1.1rem] hover:bg-gray-200 transition-colors flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                  Join the Waitlist <ArrowRight size={20} strokeWidth={3} />
                </button>
              </div>
            </motion.div>
          </div>
          {/* Abstract Floating Graphic */}
          <div className="absolute right-0 bottom-0 w-[600px] h-[600px] bg-[#276ef1] opacity-20 blur-[120px] rounded-full pointer-events-none transform translate-x-1/3 translate-y-1/3"></div>
        </section>

        {/* SECTION 2: LIVE PLATFORM TELEMETRY (REAL LOGIC) */}
        <section className="py-8 bg-[#0a0a0a] text-white border-y border-[#222222] relative z-20">
          <div className="container mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-[#666666] font-bold uppercase tracking-widest text-[0.75rem] mb-1">Local Client Time</p>
              <p className="font-mono text-[1.2rem] font-bold">{liveData.time.toLocaleTimeString()}</p>
            </div>
            <div>
              <p className="text-[#666666] font-bold uppercase tracking-widest text-[0.75rem] mb-1">Active Session</p>
              <p className="font-mono text-[1.2rem] font-bold">{liveData.uptime} seconds</p>
            </div>
            <div>
              <p className="text-[#666666] font-bold uppercase tracking-widest text-[0.75rem] mb-1">Grid Connection</p>
              <p className="font-mono text-[1.2rem] font-bold text-[#05a357]">{liveData.network}</p>
            </div>
            <div>
              <p className="text-[#666666] font-bold uppercase tracking-widest text-[0.75rem] mb-1">Hardware Threads</p>
              <p className="font-mono text-[1.2rem] font-bold">{liveData.cores}</p>
            </div>
          </div>
        </section>

        {/* SECTION 3: VALUE PROPOSITION GRID */}
        <section className="py-32 bg-white relative overflow-hidden">
          <div className="container mx-auto px-6 md:px-12 relative z-10">
            <h2 className="text-[3rem] md:text-[4rem] font-black tracking-tight mb-16 text-black">
              Engineered for Movement.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { icon: Globe, title: 'Global Scale', desc: 'Preparing deployment across 10,000+ cities. One unified terminal for international borders.' },
                { icon: Zap, title: 'Algorithmic Dispatch', desc: 'Our proprietary ML routing engine analyzes traffic vectors to connect you with the nearest node in milliseconds.' },
                { icon: Lock, title: 'Zero-Trust Security', desc: 'Bank-level AES-256 encryption and real-time GPS deviation telemetry ensure absolute data and physical safety.' }
              ].map((feature, idx) => (
                <div key={idx} className="flex flex-col bg-[#f8f9fa] p-10 rounded-[32px] border border-[#eeeeee] hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <div className="w-16 h-16 bg-[#111111] text-white rounded-2xl flex items-center justify-center mb-8">
                    <feature.icon size={32} strokeWidth={2} />
                  </div>
                  <h3 className="text-[1.5rem] font-black mb-4 text-black">{feature.title}</h3>
                  <p className="text-[1rem] font-medium text-[#555555] leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 4: RIDE TIERS (INTERACTIVE CITY VS INTERCITY) */}
        <section className="py-32 bg-[#F4F6F8]">
          <div className="container mx-auto px-6 md:px-12">
            <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8 border-b border-[#dddddd] pb-12">
              <div>
                <span className="text-[#276ef1] font-bold uppercase tracking-widest text-[0.85rem] mb-2 block">The Fleet</span>
                <h2 className="text-[3rem] md:text-[4rem] font-black tracking-tight text-black mb-4">Choose your class.</h2>
                <p className="text-[1.25rem] text-[#555555]">Vehicles tailored to your exact spatial and economic requirements. (Coming Soon)</p>
              </div>
              <div className="bg-white p-2 rounded-2xl flex gap-2 border border-[#dddddd] shadow-sm">
                <button onClick={() => setActiveTier('city')} className={`px-8 py-4 rounded-xl font-bold text-[1rem] transition-all duration-300 ${activeTier === 'city' ? 'bg-[#111111] text-white shadow-md' : 'text-[#555555] hover:bg-gray-100'}`}>City Grid</button>
                <button onClick={() => setActiveTier('intercity')} className={`px-8 py-4 rounded-xl font-bold text-[1rem] transition-all duration-300 ${activeTier === 'intercity' ? 'bg-[#111111] text-white shadow-md' : 'text-[#555555] hover:bg-gray-100'}`}>Intercity Network</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {rideTiers[activeTier].map((tier, idx) => (
                <div key={idx} className="bg-white p-10 rounded-[32px] border border-[#eeeeee] hover:border-[#111111] transition-all duration-300 group cursor-pointer shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
                  <div className="flex justify-between items-start mb-12">
                    <h3 className="text-[2rem] font-black text-black">{tier.name}</h3>
                    <span className="bg-[#f4f6f8] text-[#111111] px-4 py-2 rounded-lg font-mono font-bold text-[0.85rem]">{tier.price}</span>
                  </div>
                  <div className="w-20 h-20 mb-8 text-[#276ef1] group-hover:text-[#111111] transition-colors duration-300 bg-[#f4f6f8] rounded-2xl flex items-center justify-center">
                     <svg viewBox="0 0 24 24" width="40" height="40" fill="currentColor"><path d={tier.icon}/></svg>
                  </div>
                  <p className="text-[1.1rem] font-medium text-[#666666] leading-relaxed">{tier.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 5: AIR TRANSIT (COMING SOON SPECIAL FEATURE) */}
        <section className="py-32 bg-black text-white relative overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-20">
             <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=2000&q=80" alt="Aviation Background" className="w-full h-full object-cover grayscale mix-blend-overlay" />
          </div>
          <div className="container mx-auto px-6 md:px-12 relative z-10 flex flex-col md:flex-row items-center justify-between gap-16">
            <div className="w-full md:w-1/2">
              <div className="w-20 h-20 bg-white text-black rounded-3xl flex items-center justify-center mb-8">
                <Plane size={40} strokeWidth={2} />
              </div>
              <h2 className="text-[3.5rem] md:text-[5rem] font-black tracking-tighter mb-6 leading-none">Movyra Air.<br/><span className="text-[#276ef1]">Coming Soon.</span></h2>
              <p className="text-[1.25rem] text-[#aaaaaa] leading-relaxed mb-8">
                We are actively testing VTOL (Vertical Take-Off and Landing) integrations across primary mega-cities. Urban aviation will bypass surface congestion entirely.
              </p>
              <span className="inline-block border border-white/20 px-6 py-3 rounded-full font-mono text-[0.85rem] text-[#276ef1] font-bold bg-black/50 backdrop-blur-md">
                AWAITING FAA & EASA APPROVALS
              </span>
            </div>
          </div>
        </section>

        {/* SECTION 6: REAL-TIME DYNAMIC PRICING ENGINE ALGORITHM PREVIEW */}
        <section className="py-32 bg-white relative overflow-hidden border-b border-[#eeeeee]">
          <div className="absolute right-0 top-0 w-1/2 h-full hidden lg:block">
            <AbstractRouteSVG />
          </div>
          <div className="container mx-auto px-6 md:px-12 relative z-10 flex flex-col md:flex-row items-center gap-16">
            <div className="w-full lg:w-1/2">
              <span className="text-[#276ef1] font-bold uppercase tracking-widest text-[0.85rem] mb-4 block">Algorithmic Transparency</span>
              <h2 className="text-[3rem] lg:text-[4rem] font-black tracking-tight mb-6 text-black leading-tight">Upfront, algorithmic fare computation.</h2>
              <p className="text-[1.25rem] text-[#666666] leading-relaxed mb-8">
                Fares are locked in before you confirm. The engine below demonstrates how our pricing algorithm reacts to your current local time and projected network demand.
              </p>
            </div>
            <div className="w-full lg:w-1/2">
              <div className="bg-[#111111] text-white p-10 lg:p-14 rounded-[40px] shadow-[0_30px_60px_rgba(0,0,0,0.15)] border border-[#333333]">
                <div className="flex justify-between items-center mb-8 border-b border-[#333333] pb-6">
                  <span className="font-bold text-[#888888]">Current Local Time</span>
                  <span className="font-mono text-[1.25rem] font-bold">{liveData.time.toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between items-center mb-8 border-b border-[#333333] pb-6">
                  <span className="font-bold text-[#888888]">Live Demand Level</span>
                  <span className={`font-mono text-[1.1rem] font-bold px-3 py-1 rounded bg-[#222222] border ${liveData.multiplier !== '1.0x' ? 'text-[#e53935] border-[#e53935]/30' : 'text-[#05a357] border-[#05a357]/30'}`}>
                    {liveData.demandLevel}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-[#888888] mb-2">Projected Fare Multiplier</span>
                  <span className="font-black text-[4rem] leading-none text-white">{liveData.multiplier}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7: AIRPORT TRANSFERS */}
        <section className="py-32 bg-[#F4F6F8]">
          <div className="container mx-auto px-6 md:px-12 flex flex-col-reverse md:flex-row items-center gap-16">
            <div className="w-full md:w-1/2">
              <div className="aspect-video bg-white rounded-[40px] flex items-center justify-center p-12 border border-[#eeeeee] shadow-sm">
                 <svg viewBox="0 0 24 24" width="120" height="120" fill="#276ef1"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="w-16 h-16 bg-[#111111] text-white rounded-2xl flex items-center justify-center mb-8 shadow-md">
                <MapPin size={32} />
              </div>
              <h2 className="text-[3rem] lg:text-[4rem] font-black tracking-tight mb-6 text-black leading-tight">Seamless Airport Logistics.</h2>
              <p className="text-[1.25rem] text-[#555555] leading-relaxed mb-10">
                Deploying to over 600 global airports. The Movyra engine automatically syncs with flight APIs to adjust your pickup time in case of delays.
              </p>
              <ul className="space-y-6">
                <li className="flex items-center gap-4 text-black font-bold text-[1.1rem]">
                  <div className="w-8 h-8 rounded-full bg-[#276ef1]/10 flex items-center justify-center text-[#276ef1]"><ArrowRight size={16} /></div>
                  Integrated flight tracking.
                </li>
                <li className="flex items-center gap-4 text-black font-bold text-[1.1rem]">
                  <div className="w-8 h-8 rounded-full bg-[#276ef1]/10 flex items-center justify-center text-[#276ef1]"><ArrowRight size={16} /></div>
                  Up to 60 minutes complimentary wait time.
                </li>
                <li className="flex items-center gap-4 text-black font-bold text-[1.1rem]">
                  <div className="w-8 h-8 rounded-full bg-[#276ef1]/10 flex items-center justify-center text-[#276ef1]"><ArrowRight size={16} /></div>
                  Curbside terminal matching.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* SECTION 8: SUSTAINABILITY & GREEN FLEET */}
        <section className="py-32 bg-[#001c10] text-white border-y border-[#05a357]/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#05a357] opacity-20 blur-[100px] rounded-full pointer-events-none"></div>
          <div className="container mx-auto px-6 md:px-12 text-center max-w-4xl relative z-10">
            <h2 className="text-[3rem] md:text-[5rem] font-black tracking-tight mb-6 text-[#8ce2b3]">Ride Green.</h2>
            <p className="text-[1.25rem] text-[#e6f4ea] leading-relaxed mb-12">
              Select the 'Movyra Green' tier to guarantee dispatch of a fully electric or hybrid node. We are aggressively transitioning our entire operational fleet to zero-emission vehicles by 2040.
            </p>
            <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-md px-8 py-4 rounded-full border border-[#05a357] shadow-lg">
               <div className="w-4 h-4 bg-[#05a357] rounded-full animate-ping"></div>
               <span className="font-bold text-[1rem] uppercase tracking-widest text-white">EV Protocol Ready</span>
            </div>
          </div>
        </section>

        {/* SECTION 9: GLOBAL HUB SYNCHRONIZATION (LIVE CLOCKS) */}
        <section className="py-32 bg-[#111111] text-white">
          <div className="container mx-auto px-6 md:px-12">
            <div className="text-center mb-16">
              <h2 className="text-[3rem] font-black tracking-tight mb-4 text-white">Global Dispatch Hubs</h2>
              <p className="text-[1.2rem] text-[#888888]">Monitoring launch readiness across all primary timezones.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {cities.map((city, idx) => (
                <div key={idx} className="bg-[#000000] border border-[#333333] rounded-[32px] p-10 text-center hover:border-[#276ef1] transition-colors duration-300 shadow-lg">
                  <h3 className="text-[1.5rem] font-bold text-white mb-4">{city.name}</h3>
                  <p className="font-mono text-[#276ef1] text-[1.5rem] font-bold mb-6">{getCityTime(city.tz)}</p>
                  <span className="text-[0.75rem] uppercase tracking-widest text-[#aaaaaa] font-bold border border-[#444444] px-4 py-2 rounded-full bg-[#111111]">Awaiting Launch</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 10: ENTERPRISE INTEGRATION */}
        <section className="py-32 bg-white">
          <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center gap-16">
            <div className="w-full md:w-1/2">
              <h2 className="text-[3.5rem] font-black tracking-tight mb-6 text-black leading-tight">Movyra for Business.</h2>
              <p className="text-[1.25rem] text-[#555555] leading-relaxed mb-10">
                Streamline corporate travel routing. Issue ride credits, set geographical boundaries, and integrate seamlessly with Concur or SAP for automated expense reporting upon launch.
              </p>
              <button className="bg-black text-white px-8 py-5 rounded-2xl font-black text-[1.1rem] hover:bg-[#222222] transition-colors shadow-xl">
                Explore Enterprise Solutions
              </button>
            </div>
            <div className="w-full md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="bg-[#f8f9fa] p-10 rounded-[32px] border border-[#eeeeee]">
                 <Briefcase size={40} className="text-[#276ef1] mb-6"/>
                 <h4 className="font-bold text-[1.25rem] mb-3 text-black">Automated Billing</h4>
                 <p className="text-[#666666] text-[1rem] leading-relaxed">Zero manual expensing through direct API integrations.</p>
               </div>
               <div className="bg-[#f8f9fa] p-10 rounded-[32px] border border-[#eeeeee]">
                 <Shield size={40} className="text-[#276ef1] mb-6"/>
                 <h4 className="font-bold text-[1.25rem] mb-3 text-black">Policy Controls</h4>
                 <p className="text-[#666666] text-[1rem] leading-relaxed">Enforce strict travel limits and time constraints.</p>
               </div>
            </div>
          </div>
        </section>

        {/* SECTION 11: FAQ ACCORDION */}
        <section className="py-32 bg-[#F4F6F8] border-y border-[#eeeeee]">
          <div className="container mx-auto px-6 md:px-12 max-w-4xl">
            <h2 className="text-[3rem] font-black tracking-tight mb-16 text-center text-black">Operating Protocols (FAQ)</h2>
            <div className="space-y-6">
              {[
                { q: "When is the official launch?", a: "Movyra Ride and Air are finalizing safety telemetry tests. We will notify waitlist users sequentially as municipal grids come online." },
                { q: "How is my fare calculated?", a: "Fares are calculated algorithmically based on real-time factors including route distance, estimated duration, and active network demand (surge logic). Prices are locked before confirmation." },
                { q: "Are drivers vetted?", a: "Yes. Our zero-trust architecture requires comprehensive background checks, vehicle registration validation, and continuous driving record monitoring for all active nodes." },
                { q: "Can I schedule a ride in advance?", a: "Yes, utilizing the 'Reserve' feature within the terminal, you can lock in a dispatch request up to 30 days in advance." }
              ].map((faq, idx) => (
                <div key={idx} className="bg-white rounded-[24px] overflow-hidden border border-[#dddddd] shadow-sm">
                  <button 
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full flex justify-between items-center font-black text-[1.2rem] text-black p-8 text-left focus:outline-none hover:bg-[#fafafa] transition-colors"
                  >
                    {faq.q}
                    <ChevronDown className={`transition-transform duration-300 text-[#276ef1] ${activeFaq === idx ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${activeFaq === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <p className="px-8 pb-8 text-[#555555] text-[1.1rem] font-medium leading-relaxed border-t border-[#eeeeee] pt-6">{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 12: DUAL APP DOWNLOAD TERMINAL */}
        <section className="py-32 bg-[#111111] text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#276ef1] opacity-10 blur-[150px] rounded-full pointer-events-none"></div>
          <div className="container mx-auto px-6 md:px-12 flex flex-col items-center text-center relative z-10">
            <span className="text-[#276ef1] font-bold uppercase tracking-widest text-[0.85rem] mb-6 block">Terminal Access</span>
            <h2 className="text-[3.5rem] md:text-[5rem] font-black tracking-tighter mb-8 leading-tight">Prepare for deployment.</h2>
            <p className="text-[1.25rem] text-[#aaaaaa] mb-12 max-w-2xl leading-relaxed">
              Download the native application. Interface directly with the Movyra routing engine to be first in line when the grid activates.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-8">
              <AppStoreSVG />
              <GooglePlaySVG />
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}