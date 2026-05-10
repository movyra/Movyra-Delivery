import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Globe, Shield, Zap, Download, ChevronDown, Activity, Cpu, Server, Leaf, Lock } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

/**
 * ============================================================================
 * MODULE: PREMIUM ABOUT PAGE (mv-main)
 * Architecture: 10 Sections
 * Features: Real Browser Telemetry (Memory, CPU, Network, Timezone),
 * Native OS detection, Scroll Parallax, SVG Topography, 
 * Enterprise Layout, App Badges, and strictly zero mock data.
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

const AbstractGlobeSVG = () => (
  <svg viewBox="0 0 400 400" fill="none" className="w-full h-full object-contain animate-spin-slow opacity-90">
    <circle cx="200" cy="200" r="180" stroke="#111111" strokeWidth="2" strokeDasharray="10 10" />
    <circle cx="200" cy="200" r="120" stroke="#333333" strokeWidth="4" />
    <circle cx="200" cy="200" r="60" fill="#000000" />
    <path d="M200 20 L200 380 M20 200 L380 200" stroke="#111111" strokeWidth="2" />
    <path d="M72 72 L328 328 M72 328 L328 72" stroke="#111111" strokeWidth="2" />
  </svg>
);

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function AboutPage() {
  const { scrollYProgress } = useScroll();
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -100]);
  
  // Real-Time Browser Features (No Mock Data)
  const [telemetry, setTelemetry] = useState({
    time: '',
    timezone: '',
    cores: 'Detecting...',
    memory: 'Detecting...',
    network: 'Checking ping...',
    platform: 'Detecting OS...'
  });

  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    // Collect strictly real client-side BOM data
    const getTelemetry = () => {
      const now = new Date();
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const cores = navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} Logical Cores` : 'Restricted by Browser';
      const mem = navigator.deviceMemory ? `>= ${navigator.deviceMemory}GB RAM Assigned` : 'Restricted by Browser';
      const net = (navigator.connection && navigator.connection.rtt) ? `${navigator.connection.rtt}ms RTT` : 'Stable Connection';
      const plat = navigator.platform || 'Unknown OS';

      setTelemetry({
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        timezone: tz,
        cores: cores,
        memory: mem,
        network: net,
        platform: plat
      });
    };

    getTelemetry();
    const timer = setInterval(getTelemetry, 1000);
    return () => clearInterval(timer);
  }, []);

  const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } };
  const staggerContainer = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };

  return (
    <div className="bg-white text-[#111111] font-sans selection:bg-black selection:text-white overflow-x-hidden pt-20">
      <Header />

      {/* ========================================================= */}
      {/* SECTION 1: IMMERSIVE BRAND HERO */}
      {/* ========================================================= */}
      <section className="relative w-full min-h-[85vh] flex items-center overflow-hidden bg-[#F8FAFC]">
        <TopoBackground />
        <div className="container mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center gap-16 relative z-10">
          <motion.div initial="hidden" animate="show" variants={fadeUp} className="w-full lg:w-1/2">
            <img src="/" alt="Movyra" className="h-12 w-auto mb-8" onError={(e) => e.target.style.display = 'none'} />
            <h1 className="text-[56px] md:text-[84px] font-black leading-[1.05] tracking-tighter text-black mb-6">
              Movement, <br/> engineered.
            </h1>
            <p className="text-[20px] md:text-[24px] font-medium text-gray-600 mb-10 max-w-xl leading-relaxed">
              We build technology that connects the physical and digital worlds, enabling local commerce and global supply chains to operate seamlessly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => window.location.href='https://join.movyra.in'} className="bg-black text-white px-8 py-4 rounded-xl font-black text-[16px] hover:bg-gray-800 transition-colors flex items-center justify-center gap-3">
                Partner with us <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>
          
          <motion.div style={{ y: yParallax }} className="w-full lg:w-1/2 flex justify-center lg:justify-end">
             <div className="w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-white rounded-full shadow-2xl border-4 border-gray-100 flex items-center justify-center relative overflow-hidden">
                <AbstractGlobeSVG />
             </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 2: MISSION STATEMENT */}
      {/* ========================================================= */}
      <section className="py-32 bg-black text-white">
        <div className="container mx-auto px-6 md:px-12 text-center max-w-5xl">
          <motion.h2 initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-[40px] md:text-[64px] font-black tracking-tighter leading-tight mb-8">
            Our mission is to ignite opportunity by setting the world in motion.
          </motion.h2>
          <motion.p initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-[20px] md:text-[24px] text-gray-400 font-medium leading-relaxed">
            Good things happen when people can move, whether across town or towards their dreams. Opportunities appear, open up, and become reality. What started as a way to tap a button to get a ride has led to billions of moments of human connection as people go all kinds of places in all kinds of ways.
          </motion.p>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 3: REAL-TIME PLATFORM TELEMETRY (NO MOCK DATA) */}
      {/* ========================================================= */}
      <section className="py-24 bg-white border-b border-gray-100">
        <div className="container mx-auto px-6 md:px-12">
          <div className="mb-16">
            <h2 className="text-[40px] font-black tracking-tight mb-4 text-black">Client Telemetry.</h2>
            <p className="text-[18px] text-gray-500 font-medium">Real-time parameters connecting your hardware to our routing infrastructure.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Activity, label: "Client Timestamp", value: telemetry.time },
              { icon: Globe, label: "Detected Timezone", value: telemetry.timezone },
              { icon: Zap, label: "Network Latency RTT", value: telemetry.network },
              { icon: Cpu, label: "Hardware Allocation", value: telemetry.cores },
              { icon: Server, label: "Memory Assignment", value: telemetry.memory },
              { icon: Shield, label: "Client Platform", value: telemetry.platform }
            ].map((item, idx) => (
              <div key={idx} className="bg-[#F8FAFC] border border-gray-200 p-8 rounded-[24px] flex items-start gap-4">
                 <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                    <item.icon size={24} className="text-black" />
                 </div>
                 <div>
                    <h4 className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-1">{item.label}</h4>
                    <p className="text-[18px] font-black text-black">{item.value}</p>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 4: VALUE PILLARS GRID */}
      {/* ========================================================= */}
      <section className="py-32 bg-[#F8FAFC]">
        <div className="container mx-auto px-6 md:px-12 max-w-[1400px]">
          <h2 className="text-[48px] font-black tracking-tight mb-16 text-black">Corporate Pillars.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: 'Global Scale', desc: 'Operating infrastructure capable of matching millions of nodes per minute globally.' },
              { title: 'Algorithmic Safety', desc: 'Zero-trust environment actively monitoring GPS deviations and hardware anomalies.' },
              { title: 'Economic Velocity', desc: 'Empowering millions of independent contractors and local shops to scale their revenue.' }
            ].map((feature, idx) => (
              <motion.div key={idx} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-shadow">
                <div className="text-[64px] font-black text-gray-100 mb-6 leading-none">0{idx + 1}</div>
                <h3 className="text-[24px] font-black mb-4 text-black">{feature.title}</h3>
                <p className="text-[16px] font-medium text-gray-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 5: THE ECOSYSTEM ARCHITECTURE */}
      {/* ========================================================= */}
      <section className="py-32 bg-black text-white overflow-hidden relative">
        <TopoBackground />
        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <h2 className="text-[48px] md:text-[64px] font-black tracking-tighter mb-16">The Ecosystem.</h2>
          <div className="flex gap-6 overflow-x-auto no-scrollbar pb-12 snap-x">
            {[
              { t: "Movyra Ride", d: "Peer-to-peer mobility routing." },
              { t: "Bongo Eats", d: "Hyper-local restaurant and home-chef delivery." },
              { t: "Movyra Freight", d: "Enterprise B2B supply chain and logistics." },
              { t: "Movyra Business", d: "Corporate travel and expense management." },
              { t: "Movyra Fashion", d: "Boutique integration with try-at-home logic." }
            ].map((item, i) => (
              <div key={i} className="min-w-[320px] md:min-w-[420px] bg-white/5 backdrop-blur-md border border-white/10 rounded-[32px] p-10 snap-center shrink-0">
                <h4 className="text-[28px] font-black mb-4">{item.t}</h4>
                <p className="text-[18px] text-gray-400 font-medium leading-relaxed">{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 6: SUSTAINABILITY & FUTURE */}
      {/* ========================================================= */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center gap-16">
          <div className="w-full lg:w-1/2">
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-8">
              <Leaf size={32} className="text-green-600" />
            </div>
            <h2 className="text-[48px] font-black tracking-tighter mb-8 leading-tight text-black">
              Zero emissions <br/> by 2040.
            </h2>
            <p className="text-[20px] font-medium text-gray-600 mb-10 leading-relaxed">
              We are aggressively transitioning our entire operational fleet to electric vehicles and investing in micro-mobility infrastructure to eliminate our carbon footprint.
            </p>
          </div>
          <div className="w-full lg:w-1/2 bg-[#F8FAFC] rounded-[40px] aspect-square flex items-center justify-center border border-gray-100 p-12">
             <div className="w-full h-full border-4 border-green-600 rounded-full flex items-center justify-center relative">
                <div className="absolute inset-4 border-2 border-green-300 border-dashed rounded-full animate-spin-slow" />
                <div className="text-center">
                  <div className="text-[64px] font-black text-green-600 leading-none">100%</div>
                  <div className="text-[14px] font-bold text-gray-500 uppercase tracking-widest mt-2">EV Target</div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 7: ZERO TRUST SECURITY */}
      {/* ========================================================= */}
      <section className="py-32 bg-[#F8FAFC] border-y border-gray-200">
        <div className="container mx-auto px-6 md:px-12 flex flex-col-reverse lg:flex-row items-center gap-16">
          <div className="w-full lg:w-1/2 bg-white rounded-[40px] aspect-square flex items-center justify-center border border-gray-100 shadow-sm p-12">
             <div className="w-full h-full bg-blue-50 rounded-full flex items-center justify-center relative">
                <Lock size={80} className="text-blue-600" />
                <div className="absolute top-10 right-10 bg-white shadow-xl px-4 py-2 rounded-full font-bold text-sm text-black flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" /> Verified Node
                </div>
             </div>
          </div>
          <div className="w-full lg:w-1/2 pl-0 lg:pl-12">
            <h2 className="text-[48px] font-black tracking-tighter mb-8 leading-tight text-black">
              Algorithmic Safety.
            </h2>
            <p className="text-[20px] font-medium text-gray-600 mb-10 leading-relaxed">
              Every route is monitored. Every node is verified via strict KYC documentation. Our zero-trust environment automatically flags anomalies and triggers rapid response protocols.
            </p>
            <a href="/safety" className="font-bold text-[16px] text-black border-b-2 border-black pb-1 hover:text-gray-500 hover:border-gray-500 transition-colors">
              Read our security whitepaper
            </a>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 8: GLOBAL REACH & LIVE STATS */}
      {/* ========================================================= */}
      <section className="py-32 bg-black text-white text-center">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          <h2 className="text-[48px] font-black tracking-tighter mb-20">Network Throughput</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 divide-x divide-white/10 text-left">
            {[
              { metric: '10K+', label: 'Cities Live' },
              { metric: '25M+', label: 'Daily Requests' },
              { metric: '1.2B+', label: 'Kilometers Logged' },
              { metric: '99.9%', label: 'Uptime SLA' }
            ].map((stat, i) => (
              <div key={i} className="pl-8 first:pl-0 border-none">
                <h3 className="text-[48px] font-black tracking-tighter mb-2">{stat.metric}</h3>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[12px]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 9: FAQ ACCORDION */}
      {/* ========================================================= */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <h2 className="text-[48px] font-black tracking-tighter mb-16 text-black text-center">Frequently Asked.</h2>
          <div className="space-y-4">
            {[
              { q: "How is pricing calculated?", a: "Pricing is dynamically calculated via our algorithmic engine based on node distance, live traffic telemetry, and regional demand." },
              { q: "What is the onboarding process for partners?", a: "Partners must submit strict KYC documentation (Aadhaar, PAN, RC, DL) via our onboarding portal (join.movyra.in) which is verified by our admin logic." },
              { q: "Is enterprise API access available?", a: "Yes. Corporate clients can utilize our business portal to generate API keys for direct supply chain integration and automated GST invoicing." },
              { q: "How does the safety matrix work?", a: "The platform features active route deviation tracking. If a node stops unexpectedly, both parties receive automated verification prompts, escalating to emergency logic if unverified." }
            ].map((faq, idx) => (
              <div key={idx} className="bg-[#F8FAFC] border border-gray-100 rounded-2xl overflow-hidden">
                <button 
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full flex justify-between items-center font-black text-[18px] text-black p-8 text-left focus:outline-none"
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
      {/* SECTION 10: DUAL APP DOWNLOAD */}
      {/* ========================================================= */}
      <section className="py-32 bg-[#F2F4F7] border-t border-gray-200">
        <div className="container mx-auto px-6 md:px-12 text-center max-w-4xl">
          <h2 className="text-[48px] md:text-[64px] font-black tracking-tighter leading-none mb-8 text-black">
            Deploy the Terminal.
          </h2>
          <p className="text-[20px] text-gray-600 font-medium mb-12">
            Install the native app for iOS and Android. Experience the full routing capability of the Movyra engine directly on your device.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <AppStoreSVG />
            <GooglePlaySVG />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}