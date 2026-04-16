import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Download, Activity, Layers, Map, Shield } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

/**
 * ============================================================================
 * HIGH-END SVG ILLUSTRATIONS
 * ============================================================================
 */

const TopoBackground = () => (
  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
    <svg className="w-full h-full min-w-[1200px] object-cover opacity-10" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" fill="none">
      <path d="M -100 300 Q 300 100 800 400 T 1400 200" stroke="currentColor" strokeWidth="1" />
      <path d="M -100 400 Q 300 200 800 500 T 1400 300" stroke="currentColor" strokeWidth="1" />
      <circle cx="900" cy="300" r="140" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
      <circle cx="200" cy="700" r="180" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
    </svg>
  </div>
);

const AppStoreSVG = () => (
  <svg viewBox="0 0 180 54" fill="none" className="h-12 hover:opacity-80 transition-opacity cursor-pointer">
    <rect width="180" height="54" rx="12" fill="black" />
    <path d="M41.05 18.25c-.2-3.1 2.55-4.6 2.65-4.7-1.45-2.1-3.7-2.4-4.5-2.45-1.9-.2-3.7 1.15-4.65 1.15-.95 0-2.45-1.1-4.05-1.1-2.05 0-3.95 1.2-4.95 3-2.05 3.55-.5 8.75 1.45 11.65.95 1.4 2.1 2.95 3.6 2.9 1.45-.05 2.05-.95 3.8-.95 1.7 0 2.25.95 3.8.9 1.6-.05 2.55-1.45 3.5-2.85 1.1-1.6 1.55-3.15 1.6-3.25-.05-.05-3-1.15-3.25-4.3zM37.35 13.5c.8-1 1.35-2.35 1.2-3.75-1.15.05-2.6.8-3.45 1.8-.75.85-1.4 2.25-1.2 3.6 1.3.1 2.65-.65 3.45-1.65z" fill="white" />
    <text x="58" y="24" fill="white" fontSize="10" fontFamily="sans-serif">Download on the</text>
    <text x="56" y="42" fill="white" fontSize="20" fontFamily="sans-serif" fontWeight="bold">App Store</text>
  </svg>
);

const GooglePlaySVG = () => (
  <svg viewBox="0 0 190 54" fill="none" className="h-12 hover:opacity-80 transition-opacity cursor-pointer">
    <rect width="190" height="54" rx="12" fill="black" />
    <path d="M23.5 14.5l14.5 8.5-14.5 8.5v-17z" fill="white" />
    <path d="M23.5 14.5l14.5 8.5-5 5-9.5-13.5z" fill="white" opacity="0.8" />
    <path d="M23.5 31.5l14.5-8.5-5-5-9.5 13.5z" fill="white" opacity="0.6" />
    <text x="54" y="22" fill="white" fontSize="10" fontFamily="sans-serif">GET IT ON</text>
    <text x="52" y="42" fill="white" fontSize="20" fontFamily="sans-serif" fontWeight="bold">Google Play</text>
  </svg>
);

// Custom Minimalist 3D/Isometric SVGs for the feature grid
const IconCar3D = () => (
  <svg viewBox="0 0 100 100" fill="none" className="w-24 h-24 object-contain scale-125 origin-right">
    <path d="M20 60 L80 60 L75 40 L25 40 Z" fill="#E5E7EB" stroke="#111" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M15 60 C15 70 25 70 25 60 M75 60 C75 70 85 70 85 60" stroke="#111" strokeWidth="4" strokeLinecap="round"/>
    <path d="M30 40 L45 25 L65 25 L75 40" fill="none" stroke="#111" strokeWidth="2" strokeLinejoin="round"/>
  </svg>
);

const IconCalendar3D = () => (
  <svg viewBox="0 0 100 100" fill="none" className="w-24 h-24 object-contain scale-125 origin-right drop-shadow-xl">
    <rect x="20" y="25" width="60" height="55" rx="4" fill="#F3F4F6" stroke="#111" strokeWidth="2"/>
    <rect x="20" y="25" width="60" height="15" rx="4" fill="#EF4444" stroke="#111" strokeWidth="2"/>
    <line x1="35" y1="15" x2="35" y2="30" stroke="#111" strokeWidth="4" strokeLinecap="round"/>
    <line x1="65" y1="15" x2="65" y2="30" stroke="#111" strokeWidth="4" strokeLinecap="round"/>
    <rect x="30" y="50" width="10" height="10" fill="#111" />
  </svg>
);

const IconParcel3D = () => (
  <svg viewBox="0 0 100 100" fill="none" className="w-24 h-24 object-contain scale-125 origin-right">
    <path d="M50 20 L80 35 L80 65 L50 80 L20 65 L20 35 Z" fill="#FBBF24" stroke="#111" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M20 35 L50 50 L80 35 M50 50 L50 80" stroke="#111" strokeWidth="2" strokeLinejoin="round"/>
  </svg>
);

/**
 * ============================================================================
 * MAIN PAGE COMPONENT
 * ============================================================================
 */
export default function HomePage() {
  const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } };

  return (
    <div className="bg-white text-[#111111] font-sans selection:bg-black selection:text-white">
      <Header />

      {/* ========================================================= */}
      {/* 1. PRIMARY HERO (Consumer/Business Sync)                  */}
      {/* ========================================================= */}
      <section className="pt-32 pb-16 md:pt-48 md:pb-24 px-6 md:px-12 w-full max-w-[1400px] mx-auto relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <motion.div initial="hidden" animate="show" variants={fadeUp} className="w-full lg:w-1/2 flex flex-col items-start z-10">
            <h1 className="text-[52px] md:text-[68px] lg:text-[80px] font-black leading-[1.05] tracking-tighter mb-6 text-black">
              The logistics <br /> engine you know, <br /> reimagined.
            </h1>
            <p className="text-[18px] md:text-[20px] text-gray-700 font-medium mb-10 max-w-lg leading-relaxed">
              Movyra is a platform for managing global freight, hyper-local deliveries, and supply chain tracking, for companies and users of any size.
            </p>
            <div className="flex items-center gap-6">
              <button className="bg-black text-white px-8 py-4 rounded-xl font-bold text-[16px] hover:bg-gray-800 transition-colors">
                Get started
              </button>
              <a href="#" className="font-bold text-[16px] text-black border-b border-black hover:text-gray-600 hover:border-gray-600 transition-colors pb-0.5">
                Check out our solutions
              </a>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="w-full lg:w-1/2 relative z-10 rounded-[32px] overflow-hidden shadow-2xl">
            <img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80" alt="Corporate Logistics" className="w-full h-auto object-cover aspect-[4/3]" />
          </motion.div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. CORE MODALITIES GRID (Explore what you can do)         */}
      {/* ========================================================= */}
      <section className="py-24 px-6 md:px-12 w-full max-w-[1400px] mx-auto">
        <h2 className="text-[36px] md:text-[48px] font-black tracking-tight mb-12">Explore what you can do with Movyra</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { t: "Ride & Delivery", d: "Go anywhere or send anything. Request a driver, hop in, and go.", i: IconCar3D },
            { t: "Reserve", d: "Reserve your logistics in advance so you can relax on the day of dispatch.", i: IconCalendar3D },
            { t: "Intercity Freight", d: "Get convenient, affordable outstation trucking anytime at your facility door.", i: IconCar3D },
            { t: "Parcel", d: "Movyra makes same-day peer-to-peer item delivery easier than ever.", i: IconParcel3D },
            { t: "Rentals", d: "Request a commercial vehicle for a block of time and make multiple drops.", i: IconCar3D },
            { t: "Bike", d: "Get affordable motorbike document routing in minutes at your doorstep.", i: IconCar3D }
          ].map((card, idx) => (
            <motion.div key={idx} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="bg-[#F8FAFC] rounded-[24px] p-8 flex justify-between items-end hover:shadow-lg transition-shadow cursor-pointer border border-gray-100">
              <div className="flex flex-col h-full justify-between max-w-[65%]">
                <div>
                  <h3 className="text-[20px] font-bold mb-2">{card.t}</h3>
                  <p className="text-[14px] text-gray-600 font-medium leading-relaxed mb-6">{card.d}</p>
                </div>
                <button className="bg-white text-black px-5 py-2 rounded-full font-bold text-[14px] w-fit shadow-sm hover:bg-gray-100 transition-colors">
                  Details
                </button>
              </div>
              <div className="w-[35%] flex justify-end">
                 <card.i />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. EXECUTION PROTOCOL (Horizontal Scroll)                   */}
      {/* ========================================================= */}
      <section className="py-24 bg-black text-white overflow-hidden relative">
        <TopoBackground />
        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <h2 className="text-[40px] md:text-[56px] font-black tracking-tighter mb-16">Execution Protocol.</h2>
          <div className="flex gap-6 overflow-x-auto no-scrollbar pb-8 snap-x">
            {[
              { num: "01", t: "Initialize", d: "Define parameters: geolocation, constraints, and service tier." },
              { num: "02", t: "Allocate", d: "Algorithmic matching pairs your request with the optimal node." },
              { num: "03", t: "Monitor", d: "Continuous state updates via WebSocket GPS telemetry." },
              { num: "04", t: "Settle", d: "Cryptographic verification and automated fiat clearing." }
            ].map((item, i) => (
              <div key={i} className="min-w-[280px] md:min-w-[360px] p-10 rounded-[24px] bg-white/10 backdrop-blur-md border border-white/10 snap-center shrink-0">
                <div className="text-[48px] font-black text-white/30 leading-none mb-8">{item.num}</div>
                <h4 className="text-[24px] font-bold tracking-tight mb-4">{item.t}</h4>
                <p className="text-[16px] font-medium text-gray-400 leading-relaxed">{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. SPATIAL INTELLIGENCE & ANALYTICS                       */}
      {/* ========================================================= */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="w-full lg:w-1/2">
              <div className="w-14 h-14 bg-black rounded-xl flex items-center justify-center mb-8 shadow-md">
                <Activity size={28} className="text-white" />
              </div>
              <h2 className="text-[48px] font-black tracking-tighter mb-6 leading-[1.05] text-black">
                City-scale analytics.
              </h2>
              <p className="text-[18px] font-medium text-gray-600 mb-10 leading-relaxed max-w-lg">
                Empowering enterprise clients with actionable, anonymized traffic flow data to optimize corporate supply chains and warehousing infrastructure.
              </p>
              <ul className="space-y-6 mb-10">
                <li className="flex gap-4">
                  <Layers className="text-black shrink-0 mt-1" size={24} />
                  <div>
                    <h4 className="font-bold text-[18px]">Vector Aggregation</h4>
                    <p className="font-medium text-gray-500 text-[15px] mt-1">Analyze transit speed variations across specific date ranges.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <Map className="text-black shrink-0 mt-1" size={24} />
                  <div>
                    <h4 className="font-bold text-[18px]">Dynamic Geofencing</h4>
                    <p className="font-medium text-gray-500 text-[15px] mt-1">Isolate metrics to precise polygons and corporate campuses.</p>
                  </div>
                </li>
              </ul>
            </motion.div>

            {/* Simulated UI Panel matching reference image_08b077 */}
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="w-full lg:w-1/2 bg-[#F3F4F6] p-10 md:p-14 rounded-[32px] border border-gray-200 relative overflow-hidden">
               <div className="bg-white rounded-xl p-6 shadow-xl border border-gray-100 w-[90%] mb-6 relative z-10">
                  <div className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-4">Date Range Parameter</div>
                  <div className="h-10 bg-gray-50 border border-gray-200 rounded-lg w-full mb-4 flex items-center px-4 font-bold text-sm text-black">6/01/2026 → 6/30/2026</div>
                  <div className="flex gap-2">
                    <button className="bg-[#2563EB] text-white px-6 py-2 rounded font-bold text-[14px]">Apply</button>
                    <button className="bg-white border border-gray-200 text-black px-6 py-2 rounded font-bold text-[14px]">Reset</button>
                  </div>
               </div>
               <div className="bg-white rounded-xl p-6 shadow-xl border border-gray-100 w-[95%] ml-auto relative z-10">
                  <div className="text-[14px] font-bold text-gray-800 mb-4 flex items-center gap-2">Speed (Percent from free-flow)</div>
                  <div className="relative h-3 w-full rounded-full bg-gradient-to-r from-black via-orange-500 to-green-100 mb-6">
                    <div className="absolute top-1/2 -translate-y-1/2 left-[10%] w-4 h-4 bg-black rounded-full border-2 border-white shadow-md" />
                    <div className="absolute top-1/2 -translate-y-1/2 left-[40%] w-4 h-4 bg-black rounded-full border-2 border-white shadow-md" />
                  </div>
                  <div className="flex justify-between text-[11px] font-bold text-gray-500">
                    <span>-100%</span><span>-80%</span><span>-60%</span><span>-40%</span><span>-20%</span>
                  </div>
               </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. GLOBAL NETWORK STATS                                   */}
      {/* ========================================================= */}
      <section className="py-24 bg-[#F8FAFC] border-y border-gray-100">
        <div className="container mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-12">
          {[
            { metric: '10,000+', label: 'Active Cities' },
            { metric: '12ms', label: 'Routing Latency' },
            { metric: '99.9%', label: 'Uptime SLA' },
            { metric: '5M+', label: 'Fleet Nodes' }
          ].map((stat, i) => (
            <div key={i} className="text-left border-l-2 border-black/10 pl-6">
              <h3 className="text-[40px] font-black tracking-tighter mb-2 text-black">{stat.metric}</h3>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-[12px]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. SECURITY & COMPLIANCE                                  */}
      {/* ========================================================= */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center gap-16">
          <div className="w-full md:w-1/2">
            <h2 className="text-[48px] font-black tracking-tighter mb-8 leading-tight">Zero-trust <br />security model.</h2>
            <p className="text-[20px] font-medium text-gray-600 mb-10 leading-relaxed">
              Our infrastructure is built on the premise of constant verification. From strict KYC checks for operators to real-time route deviation alerts, safety is algorithmically enforced.
            </p>
            <button className="bg-black text-white px-8 py-4 rounded-xl font-bold text-[16px] hover:bg-gray-800 transition-colors">
              Read Security Whitepaper
            </button>
          </div>
          <div className="w-full md:w-1/2 flex justify-center">
            <div className="w-32 h-32 rounded-full border-8 border-gray-100 flex items-center justify-center shadow-2xl relative">
               <Shield size={64} className="text-black" strokeWidth={1.5} />
               <div className="absolute inset-0 rounded-full border border-black/10 animate-ping" style={{ animationDuration: '3s' }} />
               <div className="absolute -inset-10 rounded-full border border-black/5 animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. APP DEPLOYMENT (DOWNLOAD)                              */}
      {/* ========================================================= */}
      <section className="py-32 bg-[#F8FAFC] border-t border-gray-100">
        <div className="container mx-auto px-6 md:px-12 text-center max-w-4xl">
          <h2 className="text-[48px] md:text-[64px] font-black tracking-tighter leading-none mb-10 text-black">
            Deploy Movyra today.
          </h2>
          <p className="text-[20px] text-gray-600 font-medium mb-12">
            Install the Consumer or Partner terminal. Experience the full power of our logistics engine natively on your device.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <AppStoreSVG />
            <GooglePlaySVG />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}