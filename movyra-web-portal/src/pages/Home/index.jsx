import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Globe, Shield, Zap, ChevronDown, 
  Smartphone, Truck, Building2, MapPin, BarChart3, 
  CheckCircle2, Package, Car, Clock, Activity, 
  Lock, Camera, CreditCard, Navigation, HardDrive
} from 'lucide-react';

/**
 * ============================================================================
 * HIGH-END SVG ILLUSTRATIONS & STORE BADGES
 * ============================================================================
 */

const AppStoreSVG = () => (
  <svg viewBox="0 0 180 54" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-auto h-12 md:h-14 hover:opacity-80 transition-opacity cursor-pointer">
    <rect width="180" height="54" rx="12" fill="currentColor" />
    <path d="M41.05 18.25c-.2-3.1 2.55-4.6 2.65-4.7-1.45-2.1-3.7-2.4-4.5-2.45-1.9-.2-3.7 1.15-4.65 1.15-.95 0-2.45-1.1-4.05-1.1-2.05 0-3.95 1.2-4.95 3-2.05 3.55-.5 8.75 1.45 11.65.95 1.4 2.1 2.95 3.6 2.9 1.45-.05 2.05-.95 3.8-.95 1.7 0 2.25.95 3.8.9 1.6-.05 2.55-1.45 3.5-2.85 1.1-1.6 1.55-3.15 1.6-3.25-.05-.05-3-1.15-3.25-4.3zM37.35 13.5c.8-1 1.35-2.35 1.2-3.75-1.15.05-2.6.8-3.45 1.8-.75.85-1.4 2.25-1.2 3.6 1.3.1 2.65-.65 3.45-1.65z" fill="var(--bg-invert, #000)" />
    <text x="58" y="24" fill="var(--bg-invert, #000)" fontSize="10" fontFamily="sans-serif" letterSpacing="0.5">Download on the</text>
    <text x="56" y="42" fill="var(--bg-invert, #000)" fontSize="20" fontFamily="sans-serif" fontWeight="bold">App Store</text>
  </svg>
);

const GooglePlaySVG = () => (
  <svg viewBox="0 0 190 54" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-auto h-12 md:h-14 hover:opacity-80 transition-opacity cursor-pointer">
    <rect width="190" height="54" rx="12" fill="currentColor" />
    <path d="M23.5 14.5l14.5 8.5-14.5 8.5v-17z" fill="var(--bg-invert, #000)" />
    <path d="M23.5 14.5l14.5 8.5-5 5-9.5-13.5z" fill="var(--bg-invert, #000)" opacity="0.8" />
    <path d="M23.5 31.5l14.5-8.5-5-5-9.5 13.5z" fill="var(--bg-invert, #000)" opacity="0.6" />
    <text x="54" y="22" fill="var(--bg-invert, #000)" fontSize="10" fontFamily="sans-serif" letterSpacing="0.5">GET IT ON</text>
    <text x="52" y="42" fill="var(--bg-invert, #000)" fontSize="20" fontFamily="sans-serif" fontWeight="bold">Google Play</text>
  </svg>
);

const SpatialIntelligenceSVG = () => (
  <svg viewBox="0 0 800 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <g className="opacity-20 text-gray-400">
      {Array.from({ length: 60 }).map((_, i) => (
        <ellipse key={i} cx="400" cy="300" rx={i * 15} ry={i * 5} stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 6" />
      ))}
    </g>
    <path d="M 150 500 C 250 350, 450 200, 800 100" stroke="#00A9F7" strokeWidth="60" strokeLinecap="round" className="opacity-10" />
    <path d="M 150 500 C 250 350, 450 200, 800 100" stroke="#00A9F7" strokeWidth="2" strokeDasharray="12 12" />
    <g transform="translate(320, 320)">
      <path d="M 0 0 L 80 -30 L 140 0 L 110 50 L 30 70 Z" stroke="white" strokeWidth="1.5" fill="rgba(255,255,255,0.05)" />
      <circle cx="70" cy="15" r="5" fill="#00A9F7" />
    </g>
    <g transform="translate(580, 80)">
      <rect x="0" y="0" width="100" height="70" fill="#00A9F7" fillOpacity="0.2" stroke="#00A9F7" strokeWidth="1.5" />
      <rect x="15" y="15" width="100" height="70" stroke="#00A9F7" strokeWidth="0.5" />
      <circle cx="55" cy="40" r="4" fill="white" />
    </g>
  </svg>
);

/**
 * ============================================================================
 * DATA ARCHITECTURE: CUSTOMER & PARTNER FEATURES
 * ============================================================================
 */

const customerFeatures = [
  {
    title: "Account & Identity",
    icon: Shield,
    items: [
      "Mobile number authentication via OTP",
      "Optional email secondary login",
      "Persistent auto-login sessions",
      "Profile management (Name, Photo, Preferences)",
      "Device session tracking and forced logout",
      "Algorithmic fraud detection flagging"
    ]
  },
  {
    title: "Spatial & Addressing",
    icon: MapPin,
    items: [
      "High-precision GPS auto-detection",
      "Manual pin-drop mapping",
      "Categorized address book (Home, Work, Custom)",
      "Auto-suggestion based on routing history",
      "Frequent route machine learning"
    ]
  },
  {
    title: "Logistics Booking",
    icon: Package,
    items: [
      "Multi-category selection (Docs, Groceries, Freight)",
      "Automated weight and dimensional estimation",
      "Specialized handling instructions (Fragile, Liquid)",
      "Dedicated driver routing notes",
      "Pickup and destination contact mapping"
    ]
  },
  {
    title: "Computer Vision",
    icon: Camera,
    items: [
      "AI-driven package dimension scanning",
      "Location verification photography",
      "Optical Character Recognition (OCR) for addressing",
      "Digital invoice and bill attachment",
      "Mandatory delivery proof and damage comparison"
    ]
  },
  {
    title: "Fleet Allocation",
    icon: Truck,
    items: [
      "Multimodal selection (Bike, Auto, Mini-truck)",
      "Real-time ETAs and volumetric capacity display",
      "Algorithmic vehicle suggestion based on load",
      "Advanced distance and temporal pricing models"
    ]
  },
  {
    title: "Financial Engine",
    icon: CreditCard,
    items: [
      "Dynamic surge network indicators",
      "Interactive driver bidding protocol",
      "Market price comparison (Cheapest vs Fastest)",
      "Cash and Manual UPI (QR) settlement",
      "Automated invoice generation and history"
    ]
  },
  {
    title: "Tracking & Telemetry",
    icon: Activity,
    items: [
      "Live WebSocket mapping and vehicle visualization",
      "Dynamic ETA recalculation",
      "State tracking (Assigned, In-Transit, Delivered)",
      "Route deviation and delay network alerts"
    ]
  },
  {
    title: "Safety & Communication",
    icon: Lock,
    items: [
      "In-app encrypted chat and masked calling",
      "Emergency SOS trip sharing",
      "Cryptographic OTP delivery verification",
      "Digital signature and photo handover proof"
    ]
  }
];

const partnerFeatures = [
  {
    title: "Onboarding & KYC",
    icon: Shield,
    items: [
      "Mobile OTP authentication protocol",
      "Digital upload for Aadhaar, PAN, and License",
      "Vehicle RC digital verification",
      "Supabase storage integration for secure documents",
      "PostgreSQL status tracking (Pending, Approved)"
    ]
  },
  {
    title: "Network Operations",
    icon: Zap,
    items: [
      "Redis-backed active driver status toggles",
      "Inactivity automated offline protocol",
      "Real-time WebSocket order broadcasting",
      "Interactive acceptance and rejection flows",
      "Automated request timeouts"
    ]
  },
  {
    title: "Fleet Management",
    icon: Car,
    items: [
      "Dynamic vehicle categorization",
      "Capacity and dimension registration",
      "Multi-vehicle profile switching",
      "Real-time active status monitoring"
    ]
  },
  {
    title: "Routing & Navigation",
    icon: Navigation,
    items: [
      "MapLibre integration for high-fidelity UI",
      "OSRM optimized routing infrastructure",
      "Continuous 2-5s GPS location pulsing",
      "Background worker tracking architecture"
    ]
  },
  {
    title: "Yield & Pricing",
    icon: BarChart3,
    items: [
      "Granular control over per-km pricing",
      "Manual and algorithmic system price overrides",
      "Daily, weekly, and cumulative earnings ledger",
      "Per-order financial breakdown"
    ]
  },
  {
    title: "System Architecture",
    icon: HardDrive,
    items: [
      "JWT authenticated secure endpoints",
      "Network partition retry logic and offline fallback",
      "React lazy-loading and API caching",
      "Strict rate limiting and input sanitization"
    ]
  }
];

/**
 * ============================================================================
 * PAGE: HOME LANDING (STARK ENTERPRISE)
 * ============================================================================
 */
export default function HomePage() {
  const [activeCustomerTab, setActiveCustomerTab] = useState(0);
  const [activePartnerTab, setActivePartnerTab] = useState(0);

  const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } };

  return (
    <div className="min-h-screen bg-[#F2F4F7] dark:bg-[#111111] text-[#111111] dark:text-white font-sans transition-colors duration-300">
      
      {/* ========================================================= */}
      {/* SECTION 1: IMMERSIVE HERO (Dark Mode) */}
      {/* ========================================================= */}
      <section className="relative w-full min-h-[90vh] flex items-center pt-20 overflow-hidden bg-black text-white">
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-gradient-to-r from-black/90 to-black/40 absolute inset-0 z-10" />
          <img src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop" alt="Logistics Infrastructure" className="w-full h-full object-cover grayscale opacity-50" />
        </div>
        <div className="container mx-auto px-6 md:px-12 relative z-20">
          <motion.div initial="hidden" animate="show" variants={fadeUp} className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 text-[12px] font-black uppercase tracking-widest mb-8 bg-white/5 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#00A9F7] animate-pulse" />
              Global Infrastructure Active
            </div>
            <h1 className="text-[56px] md:text-[84px] font-black leading-[1.05] tracking-tighter text-white mb-6">
              The logistics engine for the modern world.
            </h1>
            <p className="text-[20px] md:text-[24px] font-medium text-gray-400 mb-10 max-w-2xl leading-relaxed">
              Movyra connects businesses, fleets, and consumers through a unified, high-velocity delivery network.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-[#00A9F7] text-white px-8 py-4.5 rounded-full font-black text-[16px] hover:bg-[#0090D4] transition-colors flex items-center justify-center gap-3">
                Access Platform <ArrowRight size={20} strokeWidth={2.5} />
              </button>
              <button className="bg-white text-black px-8 py-4.5 rounded-full font-black text-[16px] hover:bg-gray-200 transition-colors">
                Explore Enterprise APIs
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 2: VALUE PROPOSITION (Light Grey) */}
      {/* ========================================================= */}
      <section className="py-24 bg-[#F2F4F7] dark:bg-[#111111]">
        <div className="container mx-auto px-6 md:px-12">
          <motion.h2 initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-[40px] font-black tracking-tight mb-16">
            Why build on Movyra?
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: Globe, title: 'Hyper-Local & Global', desc: 'From last-mile micro-deliveries to city-wide freight, our network scales seamlessly to your operational needs.' },
              { icon: Zap, title: 'Algorithmic Dispatch', desc: 'Our proprietary routing engine matches incoming orders to the optimal fleet nodes with sub-second latency.' },
              { icon: Shield, title: 'Cryptographic Security', desc: 'Zero-trust architecture ensuring package integrity, verifiable proof-of-delivery, and automated settlement.' }
            ].map((feature, idx) => (
              <motion.div key={idx} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} transition={{ delay: idx * 0.1 }} className="flex flex-col">
                <div className="w-16 h-16 bg-black dark:bg-white text-white dark:text-black rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon size={32} strokeWidth={2} />
                </div>
                <h3 className="text-[24px] font-black mb-4">{feature.title}</h3>
                <p className="text-[16px] font-medium text-gray-600 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 3: CONSUMER TERMINAL CAPABILITIES (White) */}
      {/* ========================================================= */}
      <section className="py-32 bg-white dark:bg-[#050505]">
        <div className="container mx-auto px-6 md:px-12">
          <div className="mb-16">
            <h2 className="text-[48px] md:text-[64px] font-black tracking-tighter leading-tight mb-6">Consumer Terminal.</h2>
            <p className="text-[20px] text-gray-500 font-medium max-w-3xl">An exhaustive suite of features designed to make personal logistics and mobility entirely frictionless.</p>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Left Sidebar Tabs */}
            <div className="w-full lg:w-1/3 flex flex-col gap-2">
              {customerFeatures.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveCustomerTab(idx)}
                  className={`flex items-center gap-4 p-5 rounded-2xl text-left transition-all ${activeCustomerTab === idx ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg' : 'hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500'}`}
                >
                  <cat.icon size={24} />
                  <span className="font-black text-[18px]">{cat.title}</span>
                </button>
              ))}
            </div>

            {/* Right Content Area */}
            <div className="w-full lg:w-2/3 bg-[#F8FAFC] dark:bg-[#111111] rounded-[32px] p-10 md:p-16 border border-gray-100 dark:border-white/5 relative overflow-hidden">
              <div className="absolute -top-24 -right-24 text-gray-200 dark:text-white/5">
                {React.createElement(customerFeatures[activeCustomerTab].icon, { size: 300, strokeWidth: 1 })}
              </div>
              <div className="relative z-10">
                <h3 className="text-[32px] font-black mb-10">{customerFeatures[activeCustomerTab].title} Modules</h3>
                <ul className="space-y-6">
                  {customerFeatures[activeCustomerTab].items.map((item, i) => (
                    <motion.li 
                      key={i} 
                      initial={{ opacity: 0, x: -20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-4 text-[18px] font-bold text-gray-700 dark:text-gray-300"
                    >
                      <CheckCircle2 className="text-[#00A9F7] shrink-0 mt-1" size={24} />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 4: PARTNER FLEET ARCHITECTURE (Brand Blue) */}
      {/* ========================================================= */}
      <section className="py-32 bg-[#00A9F7] text-white">
        <div className="container mx-auto px-6 md:px-12">
          <div className="mb-16">
            <h2 className="text-[48px] md:text-[64px] font-black tracking-tighter leading-tight mb-6 text-white">Partner Fleet Engine.</h2>
            <p className="text-[20px] text-white/80 font-medium max-w-3xl">Military-grade infrastructure built for operators. Manage KYC, routing, and financials in one robust terminal.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partnerFeatures.map((cat, idx) => (
              <div key={idx} className="bg-white/10 border border-white/20 p-8 rounded-[24px] hover:bg-white/20 transition-all">
                <div className="w-12 h-12 bg-white text-[#00A9F7] rounded-xl flex items-center justify-center mb-6">
                  <cat.icon size={24} />
                </div>
                <h4 className="text-[24px] font-black mb-6">{cat.title}</h4>
                <ul className="space-y-4">
                  {cat.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-[15px] font-bold text-white/90">
                      <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 5: SPATIAL INTELLIGENCE (Dark/Black) */}
      {/* ========================================================= */}
      <section className="py-32 bg-[#050505] text-white overflow-hidden relative">
        <div className="container mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center gap-24">
          <div className="w-full lg:w-1/2 z-10">
            <h2 className="text-[48px] md:text-[64px] font-black tracking-tighter mb-8 leading-[0.95]">
              Spatial <br />Intelligence.
            </h2>
            <p className="text-[20px] font-medium text-gray-400 mb-12 max-w-lg leading-relaxed">
              Movyra processes petabytes of environmental telemetry daily. Our mapping architecture understands lane-level topology, traffic vectors, and transient obstructions to optimize global routing.
            </p>
            <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
              <div>
                <h4 className="text-[32px] font-black text-[#00A9F7] mb-2">Sub-meter</h4>
                <p className="font-bold text-gray-500 text-[14px] uppercase tracking-widest">Accuracy Level</p>
              </div>
              <div>
                <h4 className="text-[32px] font-black text-[#00A9F7] mb-2">50Hz</h4>
                <p className="font-bold text-gray-500 text-[14px] uppercase tracking-widest">Refresh Rate</p>
              </div>
            </div>
          </div>
          
          <div className="w-full lg:w-1/2 h-[400px] md:h-[600px] relative">
            <div className="absolute inset-0 -right-10 md:-right-20">
              <SpatialIntelligenceSVG />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 6: EXECUTION PROTOCOL (Horizontal Scroll) */}
      {/* ========================================================= */}
      <section className="py-32 bg-[#F2F4F7] dark:bg-[#111111] overflow-hidden">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="text-[40px] font-black tracking-tight mb-16">Execution Protocol</h2>
          <div className="flex gap-8 overflow-x-auto no-scrollbar pb-12 snap-x">
            {[
              { num: "01", title: "Demand Initialization", desc: "Push delivery parameters via our B2B REST API or the Movyra consumer terminal." },
              { num: "02", title: "Algorithmic Allocation", desc: "The system evaluates network density, traffic vectors, and fleet proximity to assign the ideal partner." },
              { num: "03", title: "Real-Time Telemetry", desc: "Monitor asset movement with 50Hz GPS tracking and live status webhooks directly to your dashboard." },
              { num: "04", title: "Cryptographic Settlement", desc: "Secure handoff with OTP verification, photo proof, and instant automated fiat clearing." },
              { num: "05", title: "Dispute & Support", desc: "Automated invoice generation, proof upload, and dedicated support resolution queues." }
            ].map((step, idx) => (
              <div key={idx} className="min-w-[300px] md:min-w-[400px] bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-white/5 rounded-[32px] p-10 snap-center shrink-0 shadow-sm">
                <div className="text-[64px] font-black text-[#00A9F7] opacity-20 leading-none mb-8">{step.num}</div>
                <h4 className="text-[24px] font-black mb-4">{step.title}</h4>
                <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 7: GLOBAL STATS (Black) */}
      {/* ========================================================= */}
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { metric: '10,000+', label: 'Active Cities' },
            { metric: '25M+', label: 'Daily Operations' },
            { metric: '99.9%', label: 'Uptime SLA' },
            { metric: '5M+', label: 'Fleet Nodes' }
          ].map((stat, i) => (
            <div key={i} className="text-center md:text-left">
              <h3 className="text-[48px] font-black tracking-tighter mb-2 text-[#00A9F7]">{stat.metric}</h3>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[12px]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 8: DUAL APP DOWNLOAD (White) */}
      {/* ========================================================= */}
      <section className="py-32 bg-white dark:bg-[#000000] relative overflow-hidden border-y border-gray-100 dark:border-white/5">
        <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-16 relative z-10">
          <div className="max-w-2xl text-center md:text-left">
            <h2 className="text-[48px] md:text-[64px] font-black tracking-tighter mb-6 leading-tight">Deploy Movyra.</h2>
            <p className="text-[20px] text-gray-500 font-medium mb-12">Install the Consumer or Partner terminal for iOS and Android. Experience the full power of our logistics engine natively on your device.</p>
            <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-6" style={{ '--bg-invert': 'var(--tw-colors-white, #fff)' }}>
              <div className="bg-black text-white px-6 py-2 rounded-2xl">
                <AppStoreSVG />
              </div>
              <div className="bg-black text-white px-6 py-2 rounded-2xl">
                <GooglePlaySVG />
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/3 aspect-square bg-[#F8FAFC] dark:bg-[#111111] rounded-[48px] flex items-center justify-center border border-gray-100 dark:border-white/10 shadow-2xl relative overflow-hidden p-8">
             <img src="Movyra.jpg" alt="Movyra Ecosystem" className="w-full h-full object-cover rounded-[32px] shadow-lg" />
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 9: FAQ ACCORDION (Light Grey) */}
      {/* ========================================================= */}
      <section className="py-24 bg-[#F2F4F7] dark:bg-[#0A0A0A]">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <h2 className="text-[40px] font-black tracking-tight mb-16 text-center">System Inquiries</h2>
          <div className="space-y-4">
            {[
              { q: "How is the dynamic pricing model constructed?", a: "Fares are computed algorithmically by analyzing spatial distance, temporal estimates, live fleet density, and dimensional weight. Upfront transparency is guaranteed before booking." },
              { q: "What is the B2B API integration timeline?", a: "Enterprise engineering teams generally finalize sandbox validation and progress to production deployment within a standard 48-hour sprint." },
              { q: "How are fleet operators and vehicles verified?", a: "Every node in our network undergoes severe KYC procedures, biometric facial verification, digital RC validation, and continuous background telemetry assessment." },
              { q: "Does the platform handle offline edge cases?", a: "Yes. Both consumer and partner terminals employ background worker tracking and Redis queue persistence to handle temporary network partitions without data loss." }
            ].map((faq, idx) => (
              <details key={idx} className="group bg-white dark:bg-[#111111] rounded-2xl cursor-pointer border border-gray-100 dark:border-white/5 shadow-sm">
                <summary className="flex justify-between items-center font-black text-[18px] p-8 list-none">
                  {faq.q}
                  <span className="transition group-open:rotate-180 text-[#00A9F7]">
                    <ChevronDown size={24} strokeWidth={3} />
                  </span>
                </summary>
                <div className="text-gray-500 font-medium p-8 pt-0 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 10: MEGA FOOTER (Black) */}
      {/* ========================================================= */}
      <footer className="bg-black text-white py-24">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex items-center gap-4 mb-16">
            <img src="logo.png" alt="Movyra Logo" className="w-12 h-12 rounded-lg object-contain bg-white" onError={(e) => { e.target.style.display='none'; }} />
            <div className="text-[40px] font-black tracking-tighter">Movyra.</div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div>
              <h4 className="font-bold text-gray-500 uppercase tracking-widest text-[12px] mb-6">Corporate</h4>
              <ul className="space-y-4 font-bold text-[16px]">
                <li><a href="/about" className="hover:text-[#00A9F7] transition-colors">About</a></li>
                <li><a href="/investors" className="hover:text-[#00A9F7] transition-colors">Investor Relations</a></li>
                <li><a href="/newsroom" className="hover:text-[#00A9F7] transition-colors">Newsroom</a></li>
                <li><a href="/careers" className="hover:text-[#00A9F7] transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-500 uppercase tracking-widest text-[12px] mb-6">Infrastructure</h4>
              <ul className="space-y-4 font-bold text-[16px]">
                <li><a href="/consumer" className="hover:text-[#00A9F7] transition-colors">Consumer Terminal</a></li>
                <li><a href="/partner" className="hover:text-[#00A9F7] transition-colors">Operator Fleet</a></li>
                <li><a href="/api" className="hover:text-[#00A9F7] transition-colors">REST API</a></li>
                <li><a href="/freight" className="hover:text-[#00A9F7] transition-colors">Freight Network</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-500 uppercase tracking-widest text-[12px] mb-6">Compliance</h4>
              <ul className="space-y-4 font-bold text-[16px]">
                <li><a href="/safety" className="hover:text-[#00A9F7] transition-colors">Zero-Trust Security</a></li>
                <li><a href="/sustainability" className="hover:text-[#00A9F7] transition-colors">Emissions Pledge</a></li>
                <li><a href="/standards" className="hover:text-[#00A9F7] transition-colors">Community Standards</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-500 uppercase tracking-widest text-[12px] mb-6">Connect</h4>
              <ul className="space-y-4 font-bold text-[16px]">
                <li><a href="/support" className="hover:text-[#00A9F7] transition-colors">Global Support</a></li>
                <li><a href="/cities" className="hover:text-[#00A9F7] transition-colors">Active Nodes</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-gray-500 font-bold text-[14px]">&copy; 2026 Movyra Technologies Inc. All rights reserved.</p>
            <div className="flex gap-8 font-bold text-[14px] text-gray-400">
              <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="/legal" className="hover:text-white transition-colors">Legal Ledger</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}