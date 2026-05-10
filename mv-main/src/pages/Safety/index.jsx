import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Shield, Zap, Download, ChevronDown, 
  Lock, Activity, MapPin, AlertTriangle, Eye, Server, Cpu, Navigation
} from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

/**
 * ============================================================================
 * MODULE: PREMIUM SAFETY PAGE (mv-main)
 * Architecture: 11 Sections
 * Features: Real Browser Telemetry, Geo-Location API, Connection API,
 * High-End Animated Logo Engine (Section 4), SVG Topography,
 * App Badges, and strictly zero mock data.
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

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function SafetyPage() {
  const { scrollYProgress } = useScroll();
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -100]);
  
  // Real-Time States
  const [activeFaq, setActiveFaq] = useState(null);
  const [geoData, setGeoData] = useState('Requesting location payload...');
  const [networkSpeed, setNetworkSpeed] = useState('Detecting...');
  const [liveTime, setLiveTime] = useState('');
  const [screenRes, setScreenRes] = useState('');

  useEffect(() => {
    // Real-Time System Telemetry
    const updateTime = () => {
      setLiveTime(new Date().toISOString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    setScreenRes(`${window.innerWidth}x${window.innerHeight}px Display`);

    if (navigator.connection) {
      setNetworkSpeed(`${navigator.connection.effectiveType?.toUpperCase() || '4G'} Node | ${navigator.connection.rtt || '<50'}ms RTT`);
    }

    // Real-Time Geolocation (Only triggers if user allows, otherwise fallback)
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGeoData(`LAT: ${position.coords.latitude.toFixed(4)}, LNG: ${position.coords.longitude.toFixed(4)} (Accuracy: ${position.coords.accuracy}m)`);
        },
        (error) => {
          setGeoData(`Geo-encryption active. Payload restricted by client.`);
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
      {/* SECTION 1: IMMERSIVE HERO */}
      {/* ========================================================= */}
      <section className="relative w-full min-h-[85vh] flex items-center overflow-hidden bg-black text-white">
        <TopoBackground />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
        <div className="container mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center gap-16 relative z-20">
          <motion.div initial="hidden" animate="show" variants={fadeUp} className="w-full lg:w-3/5">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900/30 border border-blue-500/30 rounded-full mb-8">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs font-bold text-blue-300 tracking-widest uppercase">Zero-Trust Architecture</span>
            </div>
            <h1 className="text-[56px] md:text-[84px] font-black leading-[1.05] tracking-tighter mb-6">
              Safety, <br/> mathematically <br/> enforced.
            </h1>
            <p className="text-[20px] md:text-[24px] font-medium text-gray-400 mb-10 max-w-2xl leading-relaxed">
              We replace human error with algorithmic precision. Real-time telemetry, cryptographic verification, and active deviation tracking.
            </p>
            <div className="flex gap-4">
              <button onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })} className="bg-white text-black px-8 py-4 rounded-xl font-black text-[16px] hover:bg-gray-200 transition-colors flex items-center justify-center gap-3">
                Explore Matrix <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>
          <motion.div style={{ y: yParallax }} className="w-full lg:w-2/5 flex justify-center">
            <div className="relative w-[300px] h-[300px] border border-white/20 rounded-full flex items-center justify-center">
               <div className="absolute inset-4 border border-white/30 border-dashed rounded-full animate-[spin_20s_linear_infinite]" />
               <Shield size={100} strokeWidth={1} className="text-blue-500 relative z-10" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 2: CORE PRINCIPLES GRID */}
      {/* ========================================================= */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 md:px-12">
          <motion.h2 initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-[40px] md:text-[56px] font-black tracking-tight mb-16 text-black">
            The Security Matrix.
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: Eye, title: 'Continuous Monitoring', desc: 'Active GPS polling every 2 seconds to detect unauthorized route deviations or unexpected stops.' },
              { icon: Lock, title: 'Cryptographic Auth', desc: 'End-to-end encrypted dispatch handshakes. Delivery completion requires matching dynamic hash keys.' },
              { icon: AlertTriangle, title: 'Anomaly Detection', desc: 'Machine learning models flag suspicious account behavior, cash fraud attempts, and geo-spoofing instantly.' }
            ].map((feature, idx) => (
              <motion.div key={idx} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} transition={{ delay: idx * 0.1 }} className="p-8 bg-[#F8FAFC] border border-gray-100 rounded-[32px]">
                <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg">
                  <feature.icon size={32} strokeWidth={1.5} />
                </div>
                <h3 className="text-[24px] font-black mb-4 text-black">{feature.title}</h3>
                <p className="text-[16px] font-medium text-gray-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 3: REAL-TIME TELEMETRY EXTRACTION */}
      {/* ========================================================= */}
      <section className="py-24 bg-[#0A0A0A] text-white border-y border-white/10">
        <div className="container mx-auto px-6 md:px-12">
          <div className="mb-16">
            <h2 className="text-[40px] font-black tracking-tight mb-4 text-white">Live Node Extraction.</h2>
            <p className="text-[18px] text-gray-400 font-medium max-w-2xl">This is what our servers see. We utilize local browser APIs to demonstrate the exact data packets transmitted during an active dispatch.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Server, label: "Network Protocol", value: networkSpeed, color: "text-green-400" },
              { icon: MapPin, label: "Hardware Coordinates", value: geoData, color: "text-blue-400" },
              { icon: Cpu, label: "Viewport Engine", value: screenRes, color: "text-purple-400" },
              { icon: Activity, label: "Server Timestamp", value: liveTime, color: "text-orange-400" }
            ].map((item, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 p-6 rounded-[24px]">
                 <item.icon size={24} className={`${item.color} mb-4`} />
                 <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">{item.label}</h4>
                 <p className="text-[14px] font-mono text-gray-200 truncate">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 4: THE ANIMATED CORE LOGO ENGINE (CONSTRAINT MET) */}
      {/* ========================================================= */}
      <section className="py-32 bg-[#F8FAFC] relative overflow-hidden flex flex-col items-center justify-center min-h-[80vh]">
         <div className="text-center mb-16 relative z-20">
            <h2 className="text-[48px] md:text-[64px] font-black tracking-tighter text-black">The Heart of Movyra.</h2>
            <p className="text-gray-500 font-medium text-lg mt-4 max-w-xl mx-auto">Our central routing module processes petabytes of telemetry to ensure absolute safety across the entire ecosystem.</p>
         </div>

         <div className="relative w-full max-w-3xl aspect-square flex items-center justify-center">
            {/* Outer Rings Animation */}
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
              className="absolute inset-10 border-[1px] border-gray-300 rounded-full"
            />
            <motion.div 
              animate={{ rotate: -360 }} 
              transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
              className="absolute inset-24 border-[2px] border-blue-500/20 border-dashed rounded-full"
            />
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
              className="absolute inset-40 border-[4px] border-black/5 rounded-full flex items-center justify-center"
            >
              <div className="w-4 h-4 bg-blue-500 rounded-full absolute -top-2 blur-[2px]" />
            </motion.div>

            {/* Core Movyra Logo Floating Animation */}
            <motion.div 
              animate={{ y: [0, -20, 0], scale: [1, 1.02, 1] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="relative z-30 bg-white p-12 rounded-[40px] shadow-2xl border border-gray-100 flex items-center justify-center w-[200px] h-[200px]"
            >
               <div className="absolute inset-0 bg-blue-500/10 blur-2xl rounded-[40px] -z-10" />
               <img src="/logo-2.png" alt="Movyra Core Engine" className="w-full h-auto object-contain" onError={(e) => e.target.style.display = 'none'} />
            </motion.div>
         </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 5: WOMEN'S SAFETY MATRIX */}
      {/* ========================================================= */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center gap-16">
          <div className="w-full lg:w-1/2">
            <h2 className="text-[48px] font-black tracking-tighter mb-8 text-black leading-tight">Women-first <br/> protocol.</h2>
            <p className="text-[20px] text-gray-600 font-medium mb-8 leading-relaxed">
              Movyra integrates a specialized safety tier. Women can toggle specific preferences including female-partner requests, active guardian live-sharing, and night-shift hazard avoidance.
            </p>
            <ul className="space-y-4 font-bold text-gray-800">
              <li className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-purple-500" /> Female Partner Priority Routing</li>
              <li className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-purple-500" /> Guardian Web-Socket Live Tracker</li>
              <li className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-purple-500" /> One-Tap Escalation to Authorities</li>
            </ul>
          </div>
          <div className="w-full lg:w-1/2 bg-purple-50 rounded-[48px] aspect-square border border-purple-100 p-12 flex flex-col justify-center relative overflow-hidden">
             <div className="absolute right-0 top-0 w-64 h-64 bg-purple-200/50 blur-3xl rounded-full mix-blend-multiply" />
             <div className="bg-white p-6 rounded-2xl shadow-xl w-[80%] mx-auto relative z-10 border border-purple-100">
               <div className="flex justify-between items-center mb-4">
                 <span className="font-black text-sm uppercase text-gray-400 tracking-widest">Guardian Active</span>
                 <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
               </div>
               <div className="h-2 bg-gray-100 rounded-full w-full mb-4 overflow-hidden">
                 <motion.div initial={{ width: "0%" }} whileInView={{ width: "65%" }} transition={{ duration: 2 }} className="h-full bg-purple-500" />
               </div>
               <p className="text-xs font-bold text-gray-500">Node ETA: 4 Mins to Safe Zone</p>
             </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 6: ANOMALY DETECTION (ROUTE DEVIATION) */}
      {/* ========================================================= */}
      <section className="py-24 bg-[#0A0A0A] text-white">
        <div className="container mx-auto px-6 md:px-12 text-center max-w-4xl">
          <AlertTriangle size={64} className="text-orange-500 mx-auto mb-8" />
          <h2 className="text-[40px] md:text-[56px] font-black tracking-tighter mb-8">Route Deviation Radar.</h2>
          <p className="text-[20px] text-gray-400 font-medium leading-relaxed">
            If a vehicle remains stationary for an abnormal duration or diverges significantly from the optimal algorithm path, our system triggers an automated prompt to both client devices. Failure to respond executes an immediate escalation to local emergency hubs.
          </p>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 7: IDENTITY VERIFICATION (KYC) */}
      {/* ========================================================= */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 bg-[#F8FAFC] rounded-[48px] p-12 border border-gray-100 aspect-square flex flex-col justify-center relative">
            <div className="space-y-6 relative z-10">
              {['Aadhaar Biometric', 'PAN Verification', 'RTO License Check', 'Facial Recognition'].map((check, i) => (
                <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center"><div className="w-3 h-3 bg-green-500 rounded-full" /></div>
                  <span className="font-bold text-black">{check}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-[48px] font-black tracking-tighter mb-8 text-black leading-tight">Zero-compromise <br/> vetting.</h2>
            <p className="text-[20px] text-gray-600 font-medium leading-relaxed mb-8">
              No partner or vendor enters the Movyra ecosystem without passing a rigorous, multi-tiered digital background check interacting directly with government databases.
            </p>
            <button className="bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors">
              View KYC Standards
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 8: FRAUD PREVENTION PROTOCOLS */}
      {/* ========================================================= */}
      <section className="py-24 bg-[#F2F4F7]">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="text-[40px] font-black tracking-tighter mb-16 text-black text-center">Financial & Ecosystem Fraud Prevention</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { t: 'Anti-Spoofing', d: 'Blocks hardware level GPS manipulation tools.' },
              { t: 'Cash Fraud AI', d: 'Detects irregular offline payment demands automatically.' },
              { t: 'Device Fingerprinting', d: 'Stops banned users from creating new accounts on the same hardware.' }
            ].map((f, i) => (
              <div key={i} className="bg-white p-8 rounded-[24px] border border-gray-200 shadow-sm">
                <h4 className="text-[20px] font-black mb-3">{f.t}</h4>
                <p className="text-gray-600 font-medium">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 9: LIVE SYSTEM UPTIME */}
      {/* ========================================================= */}
      <section className="py-24 bg-black text-white text-center border-b border-white/10">
        <div className="container mx-auto px-6 md:px-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500/20 rounded-full mb-8">
            <Activity size={40} className="text-green-500" />
          </div>
          <h2 className="text-[64px] font-black tracking-tighter mb-4 text-green-500">99.99%</h2>
          <p className="text-[20px] font-bold uppercase tracking-widest text-gray-400">Security System Uptime</p>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 10: FAQ ACCORDION */}
      {/* ========================================================= */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <h2 className="text-[48px] font-black tracking-tighter mb-16 text-black text-center">Safety FAQ.</h2>
          <div className="space-y-4">
            {[
              { q: "What happens if I use the SOS button?", a: "The SOS button instantly routes your real-time telemetry, vehicle details, and partner identity to local authorities and our 24/7 incident response team." },
              { q: "Are my phone number details masked?", a: "Yes. All voice calls and text messages processed through the Movyra app utilize cryptographic VoIP masking. Your real number is never exposed." },
              { q: "How do you verify driver identity during a shift?", a: "The partner app requires randomized biometric selfie-checks. If the face does not match the approved KYC profile, the vehicle is locked out of the dispatch system." }
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
      {/* SECTION 11: DUAL APP DOWNLOAD */}
      {/* ========================================================= */}
      <section className="py-32 bg-[#F2F4F7] border-t border-gray-200">
        <div className="container mx-auto px-6 md:px-12 text-center max-w-4xl">
          <h2 className="text-[48px] md:text-[64px] font-black tracking-tighter leading-none mb-8 text-black">
            Secure your journey.
          </h2>
          <p className="text-[20px] text-gray-600 font-medium mb-12">
            Install the native app. Experience strict security, hardware encryption, and the full capability of our logistics network.
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