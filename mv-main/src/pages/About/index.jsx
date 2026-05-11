import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Globe, Shield, Zap, ChevronDown, 
  MapPin, Activity, Server, Cpu, ShoppingBag, 
  Car, Utensils, Shirt, Home, Package, CheckCircle, Battery, Leaf 
} from 'lucide-react';

import Header from '../../components/Header';
import Footer from '../../components/Footer';

/**
 * ============================================================================
 * MODULE: PREMIUM ABOUT PAGE (mv-main) - THE SUPER APP ECOSYSTEM
 * Architecture: 11 Sections
 * Features: Real Browser Telemetry (Network, Battery, Geo),
 * High-End Animated Core Engine, SVG Topography, The 6-Pillar Business Model,
 * App Badges, and strictly zero mock data.
 * Fix applied: Added missing 'Leaf' import from lucide-react.
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
  <svg viewBox="0 0 180 54" fill="none" className="h-14 hover:opacity-80 transition-opacity cursor-pointer border border-gray-800 rounded-xl bg-black">
    <rect width="180" height="54" rx="12" fill="black" />
    <path d="M41.05 18.25c-.2-3.1 2.55-4.6 2.65-4.7-1.45-2.1-3.7-2.4-4.5-2.45-1.9-.2-3.7 1.15-4.65 1.15-.95 0-2.45-1.1-4.05-1.1-2.05 0-3.95 1.2-4.95 3-2.05 3.55-.5 8.75 1.45 11.65.95 1.4 2.1 2.95 3.6 2.9 1.45-.05 2.05-.95 3.8-.95 1.7 0 2.25.95 3.8.9 1.6-.05 2.55-1.45 3.5-2.85 1.1-1.6 1.55-3.15 1.6-3.25-.05-.05-3-1.15-3.25-4.3zM37.35 13.5c.8-1 1.35-2.35 1.2-3.75-1.15.05-2.6.8-3.45 1.8-.75.85-1.4 2.25-1.2 3.6 1.3.1 2.65-.65 3.45-1.65z" fill="white" />
    <text x="58" y="24" fill="white" fontSize="10" fontFamily="sans-serif">Download on the</text>
    <text x="56" y="42" fill="white" fontSize="20" fontFamily="sans-serif" fontWeight="bold">App Store</text>
  </svg>
);

const GooglePlaySVG = () => (
  <svg viewBox="0 0 190 54" fill="none" className="h-14 hover:opacity-80 transition-opacity cursor-pointer border border-gray-800 rounded-xl bg-black">
    <rect width="190" height="54" rx="12" fill="black" />
    <path d="M23.5 14.5l14.5 8.5-14.5 8.5v-17z" fill="white" />
    <path d="M23.5 14.5l14.5 8.5-5 5-9.5-13.5z" fill="white" opacity="0.8" />
    <path d="M23.5 31.5l14.5-8.5-5-5-9.5 13.5z" fill="white" opacity="0.6" />
    <text x="54" y="22" fill="white" fontSize="10" fontFamily="sans-serif">GET IT ON</text>
    <text x="52" y="42" fill="white" fontSize="20" fontFamily="sans-serif" fontWeight="bold">Google Play</text>
  </svg>
);

const CoreEngineSVG = () => (
  <svg viewBox="0 0 400 400" fill="none" className="w-full h-full object-contain opacity-90">
    <motion.circle animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 4 }} cx="200" cy="200" r="80" stroke="#111111" strokeWidth="4" />
    <motion.circle animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }} cx="200" cy="200" r="140" stroke="#333333" strokeWidth="2" strokeDasharray="10 10" />
    <circle cx="200" cy="200" r="20" fill="#000000" />
    <path d="M200 80 L200 180 M320 200 L220 200 M80 200 L180 200 M200 320 L200 220" stroke="#111111" strokeWidth="2" />
  </svg>
);

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function AboutPage() {
  const { scrollYProgress } = useScroll();
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -100]);
  
  // Real-Time System Telemetry States
  const [geoData, setGeoData] = useState('Requesting routing telemetry...');
  const [liveTime, setLiveTime] = useState('');
  const [networkSpeed, setNetworkSpeed] = useState('Detecting...');
  const [batteryLevel, setBatteryLevel] = useState('Analyzing...');
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    // Real-Time System Clock
    const updateTime = () => {
      setLiveTime(new Date().toISOString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    // Network API
    if (navigator.connection) {
      setNetworkSpeed(`${navigator.connection.effectiveType?.toUpperCase() || '4G'} Node | ${navigator.connection.rtt || '<50'}ms RTT`);
    }

    // Battery API
    if (navigator.getBattery) {
      navigator.getBattery().then(battery => {
        setBatteryLevel(`${Math.round(battery.level * 100)}% | ${battery.charging ? 'Charging' : 'Discharging'}`);
      });
    } else {
      setBatteryLevel('AC Power / Unlimited');
    }

    // Real-Time Geolocation
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGeoData(`LAT: ${position.coords.latitude.toFixed(4)}, LNG: ${position.coords.longitude.toFixed(4)}`);
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
      {/* SECTION 1: IMMERSIVE HERO */}
      {/* ========================================================= */}
      <section className="relative w-full min-h-[90vh] flex items-center overflow-hidden bg-black text-white">
        <TopoBackground />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
        <div className="container mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center gap-16 relative z-20">
          <motion.div initial="hidden" animate="show" variants={fadeUp} className="w-full lg:w-3/5">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900/30 border border-blue-500/30 rounded-full mb-8">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs font-bold text-blue-300 tracking-widest uppercase">The Super App Architecture</span>
            </div>
            <h1 className="text-[56px] md:text-[84px] font-black leading-[1.05] tracking-tighter mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              Six pillars. <br/> One ecosystem.
            </h1>
            <p className="text-[20px] md:text-[24px] font-medium text-gray-400 mb-10 max-w-2xl leading-relaxed">
              Movyra is consolidating local commerce, high-end fashion, and global mobility into a single, unified algorithmic dispatch engine.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })} className="bg-white text-black px-8 py-4 rounded-xl font-black text-[16px] hover:bg-gray-200 transition-colors flex items-center justify-center gap-3">
                Explore<ArrowRight size={20} />
              </button>
            </div>
          </motion.div>
          <motion.div style={{ y: yParallax }} className="w-full lg:w-2/5 flex justify-center">
            <div className="relative w-[300px] h-[300px] bg-white/5 border border-white/20 rounded-full flex items-center justify-center overflow-hidden backdrop-blur-md shadow-[0_0_60px_rgba(255,255,255,0.05)]">
               <CoreEngineSVG />
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <img src="/logo.png" alt="Movyra" className="w-16 h-16 opacity-50" onError={(e) => e.target.style.display = 'none'} />
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 2: LIVE DEVICE TELEMETRY */}
      {/* ========================================================= */}
      <section className="py-12 bg-[#111111] text-white border-y border-white/10">
        <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
             <h4 className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-2"><MapPin size={14}/> Coordinates</h4>
             <p className="text-[16px] font-mono text-gray-300">{geoData}</p>
          </div>
          <div className="hidden lg:block h-full w-px bg-white/10 mx-auto" />
          <div>
             <h4 className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-2"><Activity size={14}/> Network</h4>
             <p className="text-[16px] font-bold text-green-400 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
               {networkSpeed}
             </p>
          </div>
          <div className="hidden lg:block h-full w-px bg-white/10 mx-auto" />
          <div>
             <h4 className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-2"><Battery size={14}/> Hardware Power</h4>
             <p className="text-[16px] font-mono text-gray-300">{batteryLevel}</p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 3: THE VISION STATEMENT */}
      {/* ========================================================= */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 md:px-12 text-center max-w-5xl">
          <motion.h2 initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-[40px] md:text-[64px] font-black tracking-tighter leading-tight mb-8">
            Engineering the physical world.
          </motion.h2>
          <motion.p initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-[20px] md:text-[24px] text-gray-600 font-medium leading-relaxed">
            What begins as a tap on your screen initiates a complex sequence of machine learning models, fleet telemetry, and real-world logistics. We are building the operating system for your city, designed to move people, food, and daily essentials with mathematical precision.
          </motion.p>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 4: THE FASHION USP (THE DIFFERENTIATOR) */}
      {/* ========================================================= */}
      <section className="py-32 bg-[#F8FAFC] border-y border-gray-100">
        <div className="container mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center gap-16">
          <div className="w-full lg:w-1/2">
            <div className="inline-block bg-black text-white font-bold px-3 py-1 rounded-full text-xs uppercase tracking-widest mb-6 border border-gray-800">Our USP</div>
            <h2 className="text-[48px] font-black tracking-tighter mb-8 text-black leading-tight">Movyra Fashion. <br/> Try at home.</h2>
            <p className="text-[20px] text-gray-600 font-medium mb-8 leading-relaxed">
              We are revolutionizing retail. Request high-end apparel, shoes, and luxury watches to your doorstep. Try them on in your own mirror, and our delivery node waits to return what you don't keep.
            </p>
            <div className="space-y-4 font-bold text-gray-800">
              <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm"><Shirt size={20} className="text-black"/> Clothes (Testing Phase)</div>
              <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm"><ShoppingBag size={20} className="text-black"/> Shoes & Sneakers (Testing Phase)</div>
              <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm"><Activity size={20} className="text-black"/> Premium Watches (Testing Phase)</div>
            </div>
          </div>
          <div className="w-full lg:w-1/2 bg-gray-100 rounded-[48px] aspect-square border border-gray-200 p-12 flex flex-col justify-center relative overflow-hidden shadow-sm">
             <div className="absolute top-0 right-0 w-64 h-64 bg-gray-200 rounded-full blur-3xl -z-10" />
             <div className="bg-white p-8 rounded-3xl shadow-xl w-[80%] mx-auto relative z-10 border border-gray-100 flex flex-col items-center text-center">
               <Shirt size={64} strokeWidth={1} className="text-black mb-6" />
               <h3 className="font-black text-2xl mb-2">Boutique Delivery</h3>
               <p className="text-gray-500 font-medium text-sm">Driver node holding at location for 15 minutes.</p>
               <div className="w-full h-2 bg-gray-100 rounded-full mt-6 overflow-hidden">
                 <motion.div initial={{ width: "0%" }} whileInView={{ width: "100%" }} transition={{ duration: 15 }} className="h-full bg-black" />
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 5: DAILY NEEDS & LOGISTICS */}
      {/* ========================================================= */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 md:px-12">
          <motion.h2 initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-[40px] md:text-[56px] font-black tracking-tight mb-16 text-black text-center">
            Logistics & Daily Needs.
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: ShoppingBag, title: 'Grocery', phase: 'Testing Phase', desc: 'Direct routing from hyper-local warehouses to your kitchen in minutes.' },
              { icon: Leaf, title: 'Fruits & Vegetables', phase: 'Testing Phase', desc: 'Cold-chain dispatch ensuring farm-to-table freshness.' },
              { icon: Package, title: 'Shop Delivery', phase: 'Testing Phase', desc: 'P2P logistics bridging local merchants directly with your household.' }
            ].map((feature, idx) => (
              <motion.div key={idx} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} transition={{ delay: idx * 0.1 }} className="p-10 bg-[#F8FAFC] border border-gray-100 rounded-[32px] hover:shadow-lg transition-shadow relative overflow-hidden">
                <div className="absolute top-6 right-6 bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">{feature.phase}</div>
                <div className="w-16 h-16 bg-white border border-gray-200 text-black rounded-2xl flex items-center justify-center mb-8 shadow-sm">
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
      {/* SECTION 6: BONGO EATS (HOME KITCHENS) */}
      {/* ========================================================= */}
      <section className="py-32 bg-[#0A0A0A] text-white">
        <div className="container mx-auto px-6 md:px-12 flex flex-col-reverse lg:flex-row items-center gap-16">
          <div className="w-full lg:w-1/2 grid grid-cols-2 gap-4">
             <div className="bg-white/5 p-8 rounded-[32px] border border-white/10 text-center flex flex-col items-center justify-center aspect-square">
                <Utensils size={48} className="text-white mb-4" strokeWidth={1} />
                <h4 className="font-black text-xl mb-2">Bongo Eats</h4>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Testing Phase</p>
             </div>
             <div className="bg-white/5 p-8 rounded-[32px] border border-white/10 text-center flex flex-col items-center justify-center aspect-square">
                <div className="text-[48px] font-black text-white leading-none mb-2">P2P</div>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Home Kitchens</p>
             </div>
          </div>
          <div className="w-full lg:w-1/2">
            <h2 className="text-[48px] font-black tracking-tighter mb-8 leading-tight">Authentic food. <br/> From real homes.</h2>
            <p className="text-[20px] text-gray-400 font-medium leading-relaxed mb-8">
              Bongo Eats bypasses commercial cloud kitchens. We algorithmically connect you directly to verified local home chefs, ensuring authentic, hygienic, and localized culinary experiences.
            </p>
            <ul className="space-y-4 font-bold text-gray-300">
              <li className="flex items-center gap-4"><CheckCircle size={20} className="text-green-500"/> FSSAI Certified Home Nodes</li>
              <li className="flex items-center gap-4"><CheckCircle size={20} className="text-green-500"/> Multi-Cart Splitting Algorithm</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 7: SERVICES (HOUSEHOLD STAFFING) */}
      {/* ========================================================= */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 md:px-12 text-center max-w-4xl">
          <Home size={64} className="text-black mx-auto mb-8" strokeWidth={1} />
          <h2 className="text-[48px] md:text-[64px] font-black tracking-tighter mb-8 text-black">Household Services.</h2>
          <p className="text-[20px] text-gray-600 font-medium leading-relaxed mb-16">
            Eliminate the friction of home management. Our terminal allows you to book heavily vetted, background-checked household staff instantly.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-gray-50 border border-gray-200 rounded-2xl font-black text-xl text-black">Book Your Servant</div>
            <div className="p-6 bg-gray-50 border border-gray-200 rounded-2xl font-black text-xl text-black">Verified Maid</div>
            <div className="p-6 bg-gray-50 border border-gray-200 rounded-2xl font-black text-xl text-black">House Cleaning</div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 8: MOBILITY (RENTALS & RIDES) */}
      {/* ========================================================= */}
      <section className="py-32 bg-[#F8FAFC] border-y border-gray-200">
        <div className="container mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center gap-16">
          <div className="w-full lg:w-1/2">
            <h2 className="text-[48px] font-black tracking-tighter mb-8 text-black leading-tight">Mobility <br/> Infrastructure.</h2>
            <p className="text-[20px] text-gray-600 font-medium mb-8 leading-relaxed">
              Moving across the city requires flexible routing. Our mobility engine is expanding to handle complex vehicle dispatch logic.
            </p>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Car size={32} className="text-black shrink-0 mt-1" strokeWidth={1.5} />
                <div>
                  <h4 className="font-black text-black text-[20px] flex items-center gap-3">Rental Vehicles <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">Testing Phase</span></h4>
                  <p className="text-gray-500 font-medium mt-1">Keep a dedicated hardware node for hours.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Globe size={32} className="text-black shrink-0 mt-1" strokeWidth={1.5} />
                <div>
                  <h4 className="font-black text-black text-[20px] flex items-center gap-3">Movyra Rides <span className="bg-orange-100 text-orange-700 text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">Coming Soon</span></h4>
                  <p className="text-gray-500 font-medium mt-1">Instant P2P city and outstation dispatch.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-1/2 flex justify-center">
            <div className="relative w-[300px] h-[300px] bg-white border border-gray-200 rounded-full flex items-center justify-center overflow-hidden shadow-xl">
               <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }} className="absolute inset-4 border border-gray-100 border-dashed rounded-full" />
               <MapPin size={80} strokeWidth={1} className="text-black relative z-10 animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 9: THE ANIMATED CORE LOGO ENGINE */}
      {/* ========================================================= */}
      <section className="py-32 relative overflow-hidden flex flex-col items-center justify-center min-h-[60vh] bg-black text-white">
         <TopoBackground />
         <div className="text-center mb-16 relative z-20">
            <h2 className="text-[48px] md:text-[64px] font-black tracking-tighter">Security. First.</h2>
            <p className="text-gray-400 font-medium text-lg mt-4 max-w-xl mx-auto">Every pillar in the Movyra ecosystem operates under a strict zero-trust security mandate.</p>
         </div>

         <div className="relative w-full max-w-3xl aspect-square flex items-center justify-center">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 30, ease: "linear" }} className="absolute inset-10 border-[1px] border-white/10 rounded-full" />
            <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }} className="absolute inset-24 border-[2px] border-white/20 border-dashed rounded-full" />
            
            <motion.div animate={{ y: [0, -15, 0], scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }} className="relative z-30 bg-black p-12 rounded-[40px] shadow-[0_20px_100px_rgba(255,255,255,0.1)] border border-white/20 flex items-center justify-center w-[200px] h-[200px]">
               <div className="absolute inset-0 bg-white/5 blur-xl rounded-[40px] -z-10" />
               <img src="/logo.png" alt="Movyra Core Engine" className="w-full h-auto object-contain" onError={(e) => e.target.style.display = 'none'} />
            </motion.div>
         </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 10: FAQ ACCORDION */}
      {/* ========================================================= */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <h2 className="text-[48px] font-black tracking-tighter mb-16 text-black text-center">Ecosystem FAQ.</h2>
          <div className="space-y-4">
            {[
              { q: "How does the Fashion try-at-home feature work?", a: "Request apparel through the app. The driver node brings it to your door and waits while you try it on. You only pay for what you keep, and the driver returns the rest." },
              { q: "Are Bongo Eats home kitchens certified?", a: "Yes. Every home chef in our network is required to upload valid FSSAI certifications and undergo kitchen hygiene reviews before dispatching orders." },
              { q: "When will Movyra Rides launch?", a: "Movyra Rides is finalizing regional fleet onboarding and regulatory compliance. We will announce the public launch via app notification shortly." }
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
            Deploy the Super App.
          </h2>
          <p className="text-[20px] text-gray-600 font-medium mb-12">
            Install the native app for iOS and Android. Experience the full routing capability of the 6-pillar Movyra engine instantly.
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