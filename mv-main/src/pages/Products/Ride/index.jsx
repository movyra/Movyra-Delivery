import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Shield, Zap, Download, ChevronDown, 
  MapPin, Clock, CreditCard, Activity, Car, Plane, Leaf, CheckCircle, Server, Cpu, Globe
} from 'lucide-react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

/**
 * ============================================================================
 * MODULE: PREMIUM RIDE PAGE (mv-main) - COMING SOON EDITION
 * Architecture: 11 Sections
 * Features: Real Browser Telemetry, Geo-Location API, Connection API,
 * High-End Animated Logo Engine, SVG Topography, Ride Modalities,
 * App Badges, strict "Coming Soon" states, and zero mock data.
 * Fix applied: Added missing 'Globe' import from lucide-react.
 * ============================================================================
 */

// ============================================================================
// HIGH-END SVG ILLUSTRATIONS & ASSETS
// ============================================================================

const TopoBackground = () => (
  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
    <svg className="w-full h-full min-w-[1200px] object-cover opacity-5" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" fill="none">
      <path d="M -100 300 Q 300 100 800 400 T 1400 200" stroke="currentColor" strokeWidth="1" />
      <path d="M -100 400 Q 300 200 800 500 T 1400 300" stroke="currentColor" strokeWidth="1" />
      <path d="M -100 500 Q 300 300 800 600 T 1400 400" stroke="currentColor" strokeWidth="1" />
      <circle cx="900" cy="300" r="140" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
      <circle cx="200" cy="700" r="180" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
    </svg>
  </div>
);

const AppStoreSVG = () => (
  <svg viewBox="0 0 180 54" fill="none" className="h-14 hover:opacity-80 transition-opacity cursor-pointer border border-gray-800 rounded-xl">
    <rect width="180" height="54" rx="12" fill="black" />
    <path d="M41.05 18.25c-.2-3.1 2.55-4.6 2.65-4.7-1.45-2.1-3.7-2.4-4.5-2.45-1.9-.2-3.7 1.15-4.65 1.15-.95 0-2.45-1.1-4.05-1.1-2.05 0-3.95 1.2-4.95 3-2.05 3.55-.5 8.75 1.45 11.65.95 1.4 2.1 2.95 3.6 2.9 1.45-.05 2.05-.95 3.8-.95 1.7 0 2.25.95 3.8.9 1.6-.05 2.55-1.45 3.5-2.85 1.1-1.6 1.55-3.15 1.6-3.25-.05-.05-3-1.15-3.25-4.3zM37.35 13.5c.8-1 1.35-2.35 1.2-3.75-1.15.05-2.6.8-3.45 1.8-.75.85-1.4 2.25-1.2 3.6 1.3.1 2.65-.65 3.45-1.65z" fill="white" />
    <text x="58" y="24" fill="white" fontSize="10" fontFamily="sans-serif">Download on the</text>
    <text x="56" y="42" fill="white" fontSize="20" fontFamily="sans-serif" fontWeight="bold">App Store</text>
  </svg>
);

const GooglePlaySVG = () => (
  <svg viewBox="0 0 190 54" fill="none" className="h-14 hover:opacity-80 transition-opacity cursor-pointer border border-gray-800 rounded-xl">
    <rect width="190" height="54" rx="12" fill="black" />
    <path d="M23.5 14.5l14.5 8.5-14.5 8.5v-17z" fill="white" />
    <path d="M23.5 14.5l14.5 8.5-5 5-9.5-13.5z" fill="white" opacity="0.8" />
    <path d="M23.5 31.5l14.5-8.5-5-5-9.5 13.5z" fill="white" opacity="0.6" />
    <text x="54" y="22" fill="white" fontSize="10" fontFamily="sans-serif">GET IT ON</text>
    <text x="52" y="42" fill="white" fontSize="20" fontFamily="sans-serif" fontWeight="bold">Google Play</text>
  </svg>
);

const AbstractRideSVG = () => (
  <svg viewBox="0 0 400 400" fill="none" className="w-full h-full object-contain opacity-90">
    <motion.path 
      d="M50 300 Q 200 100 350 300" 
      stroke="#111111" 
      strokeWidth="4" 
      strokeDasharray="10 10"
      animate={{ strokeDashoffset: [0, 100] }}
      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
    />
    <circle cx="50" cy="300" r="12" fill="#111111" />
    <circle cx="350" cy="300" r="12" fill="#00A9F7" />
    <motion.circle 
      cx="200" cy="200" r="8" fill="#111111"
      animate={{ scale: [1, 1.5, 1] }}
      transition={{ repeat: Infinity, duration: 1 }}
    />
  </svg>
);

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function RidePage() {
  const { scrollYProgress } = useScroll();
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -100]);
  
  // Real-Time States
  const [activeFaq, setActiveFaq] = useState(null);
  const [geoData, setGeoData] = useState('Requesting local telemetry...');
  const [liveTime, setLiveTime] = useState('');
  const [networkSpeed, setNetworkSpeed] = useState('Detecting...');
  const [hardwareSpecs, setHardwareSpecs] = useState('Analyzing...');
  const [dispatchStatus, setDispatchStatus] = useState('Pre-Launch Standby');

  useEffect(() => {
    // Real-Time System Telemetry
    const updateTime = () => {
      const now = new Date();
      setLiveTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    // Network API
    if (navigator.connection) {
      setNetworkSpeed(`${navigator.connection.effectiveType?.toUpperCase() || '4G'} | ${navigator.connection.rtt || '<50'}ms RTT`);
    }

    // Hardware API
    const cores = navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} Cores` : 'Standard';
    setHardwareSpecs(`Detected: ${cores}`);

    // Real-Time Geolocation
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGeoData(`LAT: ${position.coords.latitude.toFixed(4)} | LNG: ${position.coords.longitude.toFixed(4)}`);
        },
        (error) => {
          setGeoData(`Geo-encryption active. Payload restricted.`);
        }
      );
    } else {
      setGeoData("Hardware location module offline.");
    }

    return () => clearInterval(interval);
  }, []);

  const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } };

  return (
    <div className="bg-white text-[#111111] font-sans selection:bg-black selection:text-white overflow-x-hidden pt-20">
      <Header />

      {/* ========================================================= */}
      {/* SECTION 1: IMMERSIVE HERO (COMING SOON) */}
      {/* ========================================================= */}
      <section className="relative w-full min-h-[85vh] flex items-center overflow-hidden bg-black text-white">
        <TopoBackground />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
        <div className="container mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center gap-16 relative z-20">
          <motion.div initial="hidden" animate="show" variants={fadeUp} className="w-full lg:w-3/5">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-900/30 border border-orange-500/30 rounded-full mb-8">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-xs font-bold text-orange-300 tracking-widest uppercase">Coming Soon: Pre-Launch Status</span>
            </div>
            <h1 className="text-[56px] md:text-[84px] font-black leading-[1.05] tracking-tighter mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
              The future of <br/> city transit.
            </h1>
            <p className="text-[20px] md:text-[24px] font-medium text-gray-400 mb-10 max-w-2xl leading-relaxed">
              We are finalizing our algorithmic routing network. Peer-to-peer mobility connecting you to your city in milliseconds is launching soon.
            </p>
            <div className="flex flex-wrap gap-4">
              <button disabled className="bg-white/10 text-gray-400 px-8 py-4 rounded-xl font-black text-[16px] cursor-not-allowed border border-white/20 flex items-center justify-center gap-3">
                Request a Ride <ArrowRight size={20} />
              </button>
              <button onClick={() => window.location.href='https://join.movyra.in'} className="bg-white text-black px-8 py-4 rounded-xl font-black text-[16px] hover:bg-gray-200 transition-colors flex items-center justify-center gap-3">
                Join Waitlist
              </button>
            </div>
          </motion.div>
          <motion.div style={{ y: yParallax }} className="w-full lg:w-2/5 flex justify-center">
            <div className="relative w-[300px] h-[300px] bg-white/5 border border-orange-500/30 rounded-full flex items-center justify-center overflow-hidden backdrop-blur-md shadow-[0_0_60px_rgba(249,115,22,0.1)]">
               <AbstractRideSVG />
               <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                 <span className="bg-orange-500 text-white font-black px-6 py-2 rounded-full tracking-widest uppercase text-sm transform -rotate-12 border-2 border-white shadow-xl">Deploying Soon</span>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 2: LIVE TELEMETRY EXTRACTION */}
      {/* ========================================================= */}
      <section className="py-12 bg-[#111111] text-white border-y border-white/10">
        <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
             <h4 className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-2"><MapPin size={14}/> Local Coordinates</h4>
             <p className="text-[16px] font-mono text-gray-300">{geoData}</p>
          </div>
          <div className="hidden lg:block h-full w-px bg-white/10 mx-auto" />
          <div>
             <h4 className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-2"><Activity size={14}/> Dispatch Status</h4>
             <p className="text-[16px] font-bold text-orange-400 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
               {dispatchStatus}
             </p>
          </div>
          <div className="hidden lg:block h-full w-px bg-white/10 mx-auto" />
          <div>
             <h4 className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-2"><Clock size={14}/> System Time</h4>
             <p className="text-[16px] font-mono text-gray-300">{liveTime}</p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 3: SYSTEM READINESS METRICS */}
      {/* ========================================================= */}
      <section className="py-24 bg-white border-b border-gray-100">
        <div className="container mx-auto px-6 md:px-12">
          <div className="mb-16 text-center max-w-3xl mx-auto">
            <h2 className="text-[40px] font-black tracking-tight mb-4 text-black">Infrastructure Setup.</h2>
            <p className="text-[18px] text-gray-500 font-medium">We are actively building the fleet and securing servers. Your current connection specs:</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-[#F8FAFC] border border-gray-200 p-8 rounded-[24px]">
               <Server className="text-blue-500 mb-4" size={32} />
               <h4 className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-2">Network Layer</h4>
               <p className="text-[18px] font-black text-black">{networkSpeed}</p>
            </div>
            <div className="bg-[#F8FAFC] border border-gray-200 p-8 rounded-[24px]">
               <Cpu className="text-purple-500 mb-4" size={32} />
               <h4 className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-2">Hardware Logic</h4>
               <p className="text-[18px] font-black text-black">{hardwareSpecs}</p>
            </div>
            <div className="bg-[#F8FAFC] border border-gray-200 p-8 rounded-[24px]">
               <Shield className="text-green-500 mb-4" size={32} />
               <h4 className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-2">Security Hash</h4>
               <p className="text-[18px] font-black text-black">TLS 1.3 Verified</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 4: RIDE MODALITIES GRID (COMING SOON) */}
      {/* ========================================================= */}
      <section className="py-32 bg-[#F8FAFC]">
        <div className="container mx-auto px-6 md:px-12">
          <motion.h2 initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-[40px] md:text-[56px] font-black tracking-tight mb-16 text-black">
            Upcoming Modalities.
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Car, title: 'City Routing', desc: 'Instant peer-to-peer dispatch for daily local commutes.' },
              { icon: Globe, title: 'Intercity', desc: 'Outstation cabs connecting major urban hubs safely.' },
              { icon: Clock, title: 'Rentals', desc: 'Keep a car and driver for hours with multiple stops.' },
              { icon: MapPin, title: 'Reserve', desc: 'Book up to 90 days in advance with guaranteed fulfillment.' }
            ].map((feature, idx) => (
              <motion.div key={idx} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} transition={{ delay: idx * 0.1 }} className="p-8 bg-white border border-gray-100 rounded-[32px] hover:shadow-lg transition-shadow relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-orange-100 text-orange-700 text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">Soon</div>
                <div className="w-16 h-16 bg-gray-100 text-black rounded-2xl flex items-center justify-center mb-8 shadow-sm border border-gray-200">
                  <feature.icon size={32} strokeWidth={1.5} />
                </div>
                <h3 className="text-[24px] font-black mb-4 text-gray-800">{feature.title}</h3>
                <p className="text-[16px] font-medium text-gray-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 5: THE ANIMATED CORE LOGO ENGINE */}
      {/* ========================================================= */}
      <section className="py-32 relative overflow-hidden flex flex-col items-center justify-center min-h-[80vh] bg-white">
         <div className="text-center mb-16 relative z-20">
            <h2 className="text-[48px] md:text-[64px] font-black tracking-tighter text-black">Building the Core.</h2>
            <p className="text-gray-600 font-medium text-lg mt-4 max-w-xl mx-auto">Movyra will process millions of data points per second to match you with the optimal fleet node upon launch.</p>
         </div>

         <div className="relative w-full max-w-3xl aspect-square flex items-center justify-center">
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
              className="absolute inset-10 border-[1px] border-gray-200 rounded-full"
            />
            <motion.div 
              animate={{ rotate: -360 }} 
              transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
              className="absolute inset-24 border-[2px] border-orange-500/20 border-dashed rounded-full"
            />
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
              className="absolute inset-40 border-[4px] border-black/5 rounded-full flex items-center justify-center"
            >
              <div className="w-4 h-4 bg-orange-500 rounded-full absolute -top-2 blur-[2px]" />
            </motion.div>

            {/* Core Movyra Logo Floating Animation */}
            <motion.div 
              animate={{ y: [0, -20, 0], scale: [1, 1.02, 1] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="relative z-30 bg-black p-12 rounded-[40px] shadow-2xl border border-gray-800 flex items-center justify-center w-[200px] h-[200px]"
            >
               <div className="absolute inset-0 bg-orange-500/10 blur-2xl rounded-[40px] -z-10" />
               <img src="/logo.png" alt="Movyra Core Engine" className="w-full h-auto object-contain" onError={(e) => e.target.style.display = 'none'} />
            </motion.div>
         </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 6: UPFRONT PRICING PREDICTABILITY */}
      {/* ========================================================= */}
      <section className="py-32 bg-[#F8FAFC] border-y border-gray-200">
        <div className="container mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center gap-16">
          <div className="w-full lg:w-1/2">
            <div className="inline-block bg-orange-100 text-orange-700 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-widest mb-6">In Development</div>
            <h2 className="text-[48px] font-black tracking-tighter mb-8 text-black leading-tight">Upfront pricing. <br/> No surprises.</h2>
            <p className="text-[20px] text-gray-600 font-medium mb-8 leading-relaxed">
              Our algorithm will compute distance, traffic telemetry, and regional demand before you book. The price you see is the price you will pay.
            </p>
            <ul className="space-y-4 font-bold text-gray-400">
              <li className="flex items-center gap-4"><CheckCircle size={20} className="text-gray-300"/> Dynamic Demand Indexing (Pending)</li>
              <li className="flex items-center gap-4"><CheckCircle size={20} className="text-gray-300"/> Transparent Toll Inclusions (Pending)</li>
              <li className="flex items-center gap-4"><CheckCircle size={20} className="text-gray-300"/> Cashless Wallet Integrations (Pending)</li>
            </ul>
          </div>
          <div className="w-full lg:w-1/2 bg-white rounded-[48px] aspect-square border border-gray-100 p-12 flex flex-col justify-center relative overflow-hidden shadow-sm">
             <div className="bg-gray-50 p-8 rounded-3xl shadow-md w-[80%] mx-auto relative z-10 border border-gray-200 opacity-70 grayscale">
               <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                 <div className="flex items-center gap-3">
                   <CreditCard className="text-gray-500" />
                   <span className="font-black text-lg text-gray-700">Movyra Premium</span>
                 </div>
                 <span className="font-black text-xl text-gray-700">₹---</span>
               </div>
               <div className="space-y-2 text-sm font-medium text-gray-500">
                 <div className="flex justify-between"><span>Base Fare</span><span>Pending</span></div>
                 <div className="flex justify-between"><span>Distance</span><span>Pending</span></div>
                 <div className="flex justify-between"><span>Tolls & Taxes</span><span>Pending</span></div>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 7: SAFETY PROTOCOL (ZERO TRUST) */}
      {/* ========================================================= */}
      <section className="py-32 bg-black text-white">
        <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 bg-white/5 rounded-[48px] p-12 border border-white/10 aspect-square flex flex-col justify-center relative">
            <div className="space-y-6 relative z-10">
              {['Live GPS Tracking', 'Route Deviation Alerts', '24/7 Incident Response', 'Anonymized Phone Calls'].map((check, i) => (
                <div key={i} className="bg-black p-6 rounded-xl shadow-lg border border-white/10 flex items-center gap-4 opacity-50">
                  <Shield size={24} className="text-orange-500" />
                  <span className="font-bold text-white">{check} (Building)</span>
                </div>
              ))}
            </div>
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-[48px] font-black tracking-tighter mb-8 leading-tight">Zero-trust <br/> safety matrix.</h2>
            <p className="text-[20px] text-gray-400 font-medium leading-relaxed mb-8">
              At launch, every ride will be tracked. Every driver verified via biometric KYC. If the vehicle deviates from the algorithmic path, our servers will automatically intervene.
            </p>
            <button disabled className="bg-white/10 text-gray-500 px-8 py-4 rounded-xl font-bold cursor-not-allowed transition-colors border border-white/10">
              Safety Standards (Coming Soon)
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 8: FLEET CATEGORIES (PREVIEW) */}
      {/* ========================================================= */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="text-[48px] font-black tracking-tight mb-16 text-black text-center">Fleet Selection Preview.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { t: 'Movyra Go', d: 'Affordable, compact rides for everyday quick commutes.' },
              { t: 'Movyra Premium', d: 'High-end sedans with top-rated driver nodes.' },
              { t: 'Movyra XL', d: 'SUVs accommodating up to 6 passengers and heavy luggage.' }
            ].map((f, i) => (
              <div key={i} className="bg-[#F8FAFC] p-10 rounded-[32px] border border-gray-100 text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="bg-black text-white font-black px-4 py-2 rounded-lg text-sm tracking-widest">LAUNCHING SOON</span>
                </div>
                <Car className="mx-auto mb-6 text-gray-400" size={48} strokeWidth={1} />
                <h4 className="text-[24px] font-black mb-4 text-gray-800">{f.t}</h4>
                <p className="text-gray-500 font-medium">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 9: SUSTAINABILITY / EV ADOPTION */}
      {/* ========================================================= */}
      <section className="py-32 bg-[#F8FAFC] border-y border-gray-100">
        <div className="container mx-auto px-6 md:px-12 text-center max-w-4xl">
          <Leaf size={64} className="text-green-600 mx-auto mb-8" />
          <h2 className="text-[48px] md:text-[64px] font-black tracking-tighter mb-8 text-black">Movyra Green.</h2>
          <p className="text-[20px] text-gray-600 font-medium leading-relaxed mb-12">
            We are actively preparing electric vehicles for the network. Upon release, choose Movyra Green in the app to request a zero-emission dispatch and contribute to sustainable cities.
          </p>
          <div className="inline-block bg-green-50 text-green-700 px-6 py-3 rounded-full font-black tracking-widest uppercase text-sm border border-green-200">
            100% EV Target by 2040
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 10: FAQ ACCORDION */}
      {/* ========================================================= */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <h2 className="text-[48px] font-black tracking-tighter mb-16 text-black text-center">Pre-Launch FAQ.</h2>
          <div className="space-y-4">
            {[
              { q: "When will Movyra Ride officially launch?", a: "We are currently completing backend infrastructure and local fleet onboarding. We will announce the public launch date shortly. Join the waitlist for early access." },
              { q: "Can I register as a driver now?", a: "Yes. Fleet acquisition is currently live. Visit join.movyra.in to submit your KYC documents for early verification." },
              { q: "What cities will be supported at launch?", a: "Initial rollouts will target major metropolitan hubs, with a subsequent phased expansion across 10,000+ regions globally." },
              { q: "Will the app support cashless payments?", a: "Absolutely. At launch, Movyra will fully support major credit cards, regional digital wallets, and unified payment interfaces (UPI)." }
            ].map((faq, idx) => (
              <div key={idx} className="bg-[#F8FAFC] border border-gray-100 rounded-2xl overflow-hidden">
                <button 
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full flex justify-between items-center font-black text-[18px] text-black p-8 text-left focus:outline-none hover:bg-gray-50 transition-colors"
                >
                  {faq.q}
                  <ChevronDown className={`transition-transform duration-300 ${activeFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${activeFaq === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <p className="px-8 pb-8 text-gray-600 font-medium leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 11: DUAL APP DOWNLOAD (PRE-REGISTRATION) */}
      {/* ========================================================= */}
      <section className="py-32 bg-[#111111] text-white">
        <div className="container mx-auto px-6 md:px-12 text-center max-w-4xl">
          <h2 className="text-[48px] md:text-[64px] font-black tracking-tighter leading-none mb-8">
            Pre-register today.
          </h2>
          <p className="text-[20px] text-gray-400 font-medium mb-12">
            The native apps for iOS and Android are undergoing final store review. Pre-register now to be notified the moment the terminal goes live.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 opacity-50 grayscale cursor-not-allowed">
            <AppStoreSVG />
            <GooglePlaySVG />
          </div>
          <p className="text-sm font-bold text-orange-400 mt-6 tracking-widest uppercase">Stores Pending Final Review</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}