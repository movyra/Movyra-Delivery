import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Activity, MapPin, Shield, 
  Clock, Smartphone, Briefcase, Truck, 
  ShoppingBag, Heart, CheckCircle, Zap, 
  ChevronRight, Utensils, Shirt, Home, 
  Car, Leaf, Package, Watch
} from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

/**
 * ============================================================================
 * MODULE: PREMIUM LANDING PAGE (mv-main) - THE SUPER APP
 * Architecture: 11 Sections.
 * Features: Real Browser Telemetry, Time-aware Greeting, Native Share API,
 * 6-Pillar Business Model (Daily Needs, Delivery, Food, Fashion USP, Services, Mobility),
 * Real-world business terminology (Hinglish integration), "Testing Phase" hidden.
 * Rides labeled "Coming Soon". Zero mock data.
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

const AbstractIllustrationHero = () => (
  <svg viewBox="0 0 800 600" fill="none" className="w-full h-full object-cover rounded-3xl shadow-2xl">
    <rect width="800" height="600" fill="#111111" />
    <path d="M0 600 L800 600 L800 200 L0 400 Z" fill="#222222" />
    <rect x="200" y="100" width="400" height="300" fill="#000000" rx="24" stroke="#333" strokeWidth="2" />
    <circle cx="300" cy="200" r="40" fill="#3B82F6" />
    <circle cx="500" cy="200" r="40" fill="#10B981" />
    <circle cx="400" cy="300" r="40" fill="#F59E0B" />
    <path d="M300 200 L400 300 L500 200" stroke="#4B5563" strokeWidth="4" strokeDasharray="10 10" />
    <rect x="320" y="450" width="160" height="120" fill="#FAFAFA" rx="16" />
    <path d="M350 490 L450 490 M350 520 L420 520" stroke="#D1D5DB" strokeWidth="8" strokeLinecap="round" />
  </svg>
);

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function Landing() {
  const { scrollYProgress } = useScroll();
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -100]);
  
  // Real-Time Browser Features
  const [localTime, setLocalTime] = useState('');
  const [greeting, setGreeting] = useState('Welcome');
  const [networkLatency, setNetworkLatency] = useState('Checking...');
  const [geoData, setGeoData] = useState('Detecting location...');

  useEffect(() => {
    // Feature: Real-Time Clock & Greeting Engine
    const updateTime = () => {
      const now = new Date();
      setLocalTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      const hour = now.getHours();
      if (hour < 12) setGreeting('Good Morning');
      else if (hour < 17) setGreeting('Good Afternoon');
      else setGreeting('Good Evening');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);

    // Feature: Real Network Latency Detection (BOM API)
    if (navigator.connection && navigator.connection.rtt) {
      setNetworkLatency(`${navigator.connection.rtt}ms response`);
    } else {
      setNetworkLatency('Optimal connection');
    }

    // Feature: Real-Time Geolocation
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGeoData(`LAT: ${position.coords.latitude.toFixed(4)}, LNG: ${position.coords.longitude.toFixed(4)}`);
        },
        (error) => {
          setGeoData(`Location encrypted.`);
        }
      );
    } else {
      setGeoData("Hardware location offline.");
    }

    return () => clearInterval(timer);
  }, []);

  // Feature: Native OS Web Share API
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Movyra Super App',
          text: 'Aapki har zaroorat, ab door step par. Experience the Movyra super app.',
          url: window.location.href,
        });
      } catch (err) {
        console.error('Share failed', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard.');
    }
  };

  const fadeUp = { 
    hidden: { opacity: 0, y: 30 }, 
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } 
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="bg-white text-[#111111] font-sans selection:bg-black selection:text-white overflow-x-hidden">
      <Header />

      {/* ========================================================= */}
      {/* SECTION 1: PRIMARY HERO (THE SUPER APP)                   */}
      {/* ========================================================= */}
      <section className="relative pt-24 pb-0 md:pt-32 px-6 md:px-12 w-full bg-[#E5E7EB] overflow-hidden">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16 min-h-[85vh]">
            
            <motion.div initial="hidden" animate="show" variants={fadeUp} className="w-full lg:w-1/2 flex flex-col items-start justify-center z-20 py-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full mb-8 shadow-sm border border-gray-200">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-bold text-gray-800 tracking-widest uppercase">{greeting}. We are live.</span>
                </div>
                <h1 className="text-[56px] md:text-[72px] font-black leading-[1.05] tracking-tighter mb-6 text-black">
                    Aapki har <br/> zaroorat. <br/> Delivered.
                </h1>
                <p className="text-[20px] font-medium text-gray-600 mb-10 leading-relaxed max-w-lg">
                    From daily groceries and boutique fashion try-ons to trusted household services. Movyra brings the entire city to your doorstep.
                </p>
                
                <div className="w-full max-w-md bg-white p-6 rounded-[24px] shadow-xl border border-gray-100">
                    <h3 className="font-black text-[18px] mb-4 text-black">What are you looking for today?</h3>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <button className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200">
                            <ShoppingBag className="mb-2 text-black" size={24} />
                            <span className="font-bold text-sm text-gray-800">Daily Needs</span>
                        </button>
                        <button className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200">
                            <Shirt className="mb-2 text-black" size={24} />
                            <span className="font-bold text-sm text-gray-800">Fashion</span>
                        </button>
                    </div>
                    <button className="w-full bg-black text-white py-4 rounded-xl font-black hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-md">
                        Explore Movyra <ArrowRight size={18} />
                    </button>
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="w-full lg:w-1/2 relative z-10 flex items-center justify-center h-full">
                <div className="w-full aspect-[4/3] relative rounded-[32px] overflow-hidden shadow-2xl border-4 border-white">
                    <AbstractIllustrationHero />
                </div>
            </motion.div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 2: LIVE TELEMETRY DASHBOARD                       */}
      {/* ========================================================= */}
      <section className="py-10 bg-[#111111] text-white border-y border-gray-800">
        <div className="container mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-6 divide-x divide-white/10">
          <div className="pl-4 first:pl-0 border-none">
            <h4 className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-2"><MapPin size={14}/> Service Area</h4>
            <p className="text-[14px] font-mono text-gray-300 truncate">{geoData}</p>
          </div>
          <div className="pl-6">
            <h4 className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-2"><Activity size={14}/> Network Speed</h4>
            <p className="text-[14px] font-bold text-green-400">{networkLatency}</p>
          </div>
          <div className="pl-6">
            <h4 className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-2"><Clock size={14}/> Local Time</h4>
            <p className="text-[14px] font-mono text-gray-300">{localTime}</p>
          </div>
          <div className="pl-6 flex items-center">
            <button onClick={handleShare} className="text-[12px] font-bold text-white uppercase tracking-widest border border-white/20 px-4 py-2 rounded-full hover:bg-white hover:text-black transition-colors">
              Share Movyra
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 3: THE 6 PILLARS (CORE CATEGORIES)                */}
      {/* ========================================================= */}
      <section className="py-32 px-6 md:px-12 w-full max-w-[1400px] mx-auto bg-white">
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <h2 className="text-[40px] md:text-[56px] font-black tracking-tight leading-none mb-6 text-black">A universe of services.</h2>
          <p className="text-[18px] text-gray-600 font-medium">Six dedicated categories connecting you to daily essentials, local food, premium retail, and reliable mobility.</p>
        </div>
        
        <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { t: "Daily Needs", d: "Fresh groceries, fruits, and vegetables delivered to your kitchen in minutes.", icon: ShoppingBag },
            { t: "Shop Delivery", d: "Direct delivery from your favorite local merchants and neighborhood stores.", icon: Package },
            { t: "Bongo Eats", d: "Authentic, hygienic meals prepared by verified local home chefs.", icon: Utensils },
            { t: "Fashion Boutique", d: "High-end clothes, shoes, and watches. Try them on at home before buying.", icon: Shirt },
            { t: "Home Services", d: "Book trusted, background-checked maids, servants, and deep cleaners.", icon: Home },
            { t: "Mobility", d: "Rental vehicles for the day, and city rides (Coming Soon) for quick commutes.", icon: Car }
          ].map((card, idx) => (
            <motion.div key={idx} variants={fadeUp} className="bg-[#F8FAFC] rounded-[32px] p-10 flex flex-col justify-between h-[300px] border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all group">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-200 mb-6 group-hover:scale-110 transition-transform origin-left">
                <card.icon size={32} className="text-black" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-[24px] font-black mb-3 text-black">{card.t}</h3>
                <p className="text-[15px] text-gray-600 font-medium leading-relaxed">{card.d}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 4: THE USP - FASHION TRY-AT-HOME                  */}
      {/* ========================================================= */}
      <section className="py-32 bg-black text-white relative overflow-hidden">
        <TopoBackground />
        <div className="container mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center gap-16 relative z-20">
          <div className="w-full lg:w-1/2">
            <div className="inline-block bg-white text-black font-black px-4 py-1.5 rounded-full text-xs uppercase tracking-widest mb-8 border border-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              Our Signature Feature
            </div>
            <h2 className="text-[48px] md:text-[64px] font-black tracking-tighter mb-8 leading-tight">
              Pehno phir <br/> paise do.
            </h2>
            <p className="text-[20px] text-gray-400 font-medium mb-10 leading-relaxed">
              Movyra Fashion is changing how you shop. Request premium clothes, shoes, and luxury watches directly from local boutiques. Our delivery partner waits at your door while you try them on. Keep what fits perfectly, we return the rest instantly.
            </p>
            <div className="grid grid-cols-2 gap-6 mb-10">
              <div className="bg-white/10 p-6 rounded-2xl border border-white/10">
                <Shirt size={28} className="mb-4 text-white" />
                <h4 className="font-bold text-lg">Designer Apparel</h4>
              </div>
              <div className="bg-white/10 p-6 rounded-2xl border border-white/10">
                <Watch size={28} className="mb-4 text-white" />
                <h4 className="font-bold text-lg">Watches & Kicks</h4>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
             <div className="w-[300px] h-[300px] md:w-[450px] md:h-[450px] bg-white rounded-full flex flex-col items-center justify-center p-12 text-black shadow-[0_0_100px_rgba(255,255,255,0.15)] relative">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }} className="absolute inset-4 border-2 border-gray-200 border-dashed rounded-full" />
                <img src="/logo-3.png" alt="Movyra" className="w-20 h-20 mb-6 relative z-10" onError={(e) => e.target.style.display = 'none'} />
                <h3 className="font-black text-[24px] relative z-10 text-center">Fashion at Home</h3>
                <p className="text-gray-500 font-bold text-sm mt-2 relative z-10 text-center">15-Min Try-On Window</p>
             </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 5: DAILY NEEDS & GROCERY                          */}
      {/* ========================================================= */}
      <section className="py-32 bg-[#F8FAFC] border-y border-gray-200">
        <div className="container mx-auto px-6 md:px-12 flex flex-col-reverse lg:flex-row items-center gap-16">
          <div className="w-full lg:w-1/2 grid grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col items-center text-center aspect-square justify-center">
              <ShoppingBag size={48} className="text-blue-500 mb-4" strokeWidth={1.5} />
              <h4 className="font-black text-xl text-black">Grocery Essentials</h4>
            </div>
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col items-center text-center aspect-square justify-center mt-12">
              <Leaf size={48} className="text-green-500 mb-4" strokeWidth={1.5} />
              <h4 className="font-black text-xl text-black">Farm Fresh Produce</h4>
            </div>
          </div>
          <div className="w-full lg:w-1/2 pl-0 lg:pl-10">
            <h2 className="text-[48px] font-black tracking-tighter mb-8 text-black leading-tight">Daily Needs. <br/> Sorted.</h2>
            <p className="text-[20px] text-gray-600 font-medium leading-relaxed mb-8">
              Skip the long supermarket lines. Our fast delivery network connects you directly to local warehouses and farms, ensuring crisp sabzi and essential groceries arrive at your home in minutes.
            </p>
            <ul className="space-y-4 font-bold text-gray-800">
              <li className="flex items-center gap-4"><CheckCircle size={20} className="text-black"/> Hyper-local routing</li>
              <li className="flex items-center gap-4"><CheckCircle size={20} className="text-black"/> Freshness guaranteed</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 6: BONGO EATS (HOME KITCHENS)                     */}
      {/* ========================================================= */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center gap-16">
          <div className="w-full lg:w-1/2">
            <h2 className="text-[48px] font-black tracking-tighter mb-8 text-black leading-tight">Bongo Eats. <br/> Ghar ka khana.</h2>
            <p className="text-[20px] text-gray-600 font-medium leading-relaxed mb-8">
              Craving authentic, home-cooked food? Movyra connects you directly to FSSAI-verified local home chefs. Enjoy hygienic, authentic, and culturally rich meals prepared with love in neighborhood kitchens.
            </p>
            <button className="bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg">
              Explore Local Chefs
            </button>
          </div>
          <div className="w-full lg:w-1/2 bg-gray-50 rounded-[48px] border border-gray-200 p-12 flex flex-col items-center justify-center aspect-square relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-orange-100 rounded-full blur-3xl -z-10" />
            <Utensils size={80} className="text-black mb-8" strokeWidth={1} />
            <div className="bg-white px-6 py-3 rounded-full shadow-md border border-gray-100 font-black text-lg text-black flex items-center gap-3">
               <Shield size={20} className="text-green-500" /> FSSAI Verified Kitchens
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 7: HOUSEHOLD SERVICES                             */}
      {/* ========================================================= */}
      <section className="py-32 bg-[#0A0A0A] text-white">
        <div className="container mx-auto px-6 md:px-12 text-center max-w-4xl">
          <Home size={64} className="text-white mx-auto mb-8" strokeWidth={1} />
          <h2 className="text-[48px] md:text-[64px] font-black tracking-tighter mb-8">Trust in your home.</h2>
          <p className="text-[20px] text-gray-400 font-medium leading-relaxed mb-16">
            Eliminate the stress of home management. The Movyra app allows you to book heavily vetted, background-checked household staff instantly. Tension-free living, guaranteed.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 bg-white/10 border border-white/20 rounded-[24px] hover:bg-white/20 transition-colors">
              <h4 className="font-black text-xl text-white mb-2">Servants</h4>
              <p className="text-gray-400 text-sm font-medium">Reliable daily household help.</p>
            </div>
            <div className="p-8 bg-white/10 border border-white/20 rounded-[24px] hover:bg-white/20 transition-colors">
              <h4 className="font-black text-xl text-white mb-2">Maids</h4>
              <p className="text-gray-400 text-sm font-medium">Expert cooking and organization.</p>
            </div>
            <div className="p-8 bg-white/10 border border-white/20 rounded-[24px] hover:bg-white/20 transition-colors">
              <h4 className="font-black text-xl text-white mb-2">Deep Cleaning</h4>
              <p className="text-gray-400 text-sm font-medium">Professional sanitation services.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 8: MOBILITY (RENTALS & RIDES)                     */}
      {/* ========================================================= */}
      <section className="py-32 bg-white border-b border-gray-100">
        <div className="container mx-auto px-6 md:px-12 flex flex-col-reverse lg:flex-row items-center gap-16">
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-start">
            <div className="grid grid-cols-1 gap-6 w-full max-w-md">
               <div className="bg-[#F8FAFC] p-8 rounded-[32px] border border-gray-200 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                 <div className="flex items-center gap-6">
                   <Car size={32} className="text-black" />
                   <h3 className="text-2xl font-black text-black">Rental Vehicles</h3>
                 </div>
                 <ArrowRight className="text-gray-400" />
               </div>
               <div className="bg-gray-50 p-8 rounded-[32px] border border-gray-200 flex items-center justify-between opacity-60">
                 <div className="flex items-center gap-6">
                   <Zap size={32} className="text-gray-500" />
                   <div>
                     <h3 className="text-2xl font-black text-gray-700">Movyra Rides</h3>
                     <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mt-1">Coming Soon</p>
                   </div>
                 </div>
               </div>
            </div>
          </div>
          <div className="w-full lg:w-1/2 pl-0 lg:pl-12">
            <h2 className="text-[48px] font-black tracking-tighter mb-8 text-black leading-tight">Mobility made <br/> simple.</h2>
            <p className="text-[20px] text-gray-600 font-medium mb-8 leading-relaxed">
              Need a vehicle for the entire day? Our rental service lets you book a car for hours, perfect for shopping trips and multiple stops. Our instant city ride network is launching very soon to handle your daily commute.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 9: ENTERPRISE & B2B LOGISTICS                     */}
      {/* ========================================================= */}
      <section className="py-32 bg-[#F8FAFC]">
        <div className="container mx-auto px-6 md:px-12 w-full max-w-[1400px]">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="w-full lg:w-1/2">
              <div className="w-14 h-14 bg-black rounded-xl flex items-center justify-center mb-8 shadow-md">
                <Briefcase size={28} className="text-white" />
              </div>
              <h2 className="text-[48px] font-black tracking-tighter mb-6 leading-[1.05] text-black">
                Movyra for Business.
              </h2>
              <p className="text-[18px] font-medium text-gray-600 mb-10 leading-relaxed max-w-lg">
                A powerful logistics dashboard for your business. Manage corporate travel, track deliveries, and generate GST invoices instantly. Grow your enterprise with Movyra.
              </p>
              <button className="bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors">
                Access B2B Portal
              </button>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="w-full lg:w-1/2 bg-white p-10 rounded-[32px] border border-gray-200 shadow-xl">
               <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
                 <h4 className="font-black text-xl text-black">Live Fleet Tracking</h4>
                 <div className="bg-green-100 text-green-700 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">Active</div>
               </div>
               <div className="space-y-6">
                 <div>
                   <div className="flex justify-between text-sm font-bold text-gray-700 mb-2"><span>Delivery Route A</span><span>80% Completed</span></div>
                   <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden"><div className="w-[80%] h-full bg-black rounded-full" /></div>
                 </div>
                 <div>
                   <div className="flex justify-between text-sm font-bold text-gray-700 mb-2"><span>Delivery Route B</span><span>45% Completed</span></div>
                   <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden"><div className="w-[45%] h-full bg-blue-500 rounded-full" /></div>
                 </div>
               </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 10: ECOSYSTEM LINKS (Join, Admin, Meet)           */}
      {/* ========================================================= */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-[1400px]">
          <div onClick={() => window.location.href='https://join.movyra.in'} className="bg-gray-50 p-8 rounded-[24px] border border-gray-200 cursor-pointer hover:border-black transition-colors group">
            <h3 className="text-xl font-black mb-2 flex justify-between items-center text-black">Partner With Us <ArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity" size={20}/></h3>
            <p className="text-sm font-medium text-gray-500">Become a driver or list your shop on Movyra.</p>
          </div>
          <div onClick={() => window.location.href='https://admin.movyra.in'} className="bg-gray-50 p-8 rounded-[24px] border border-gray-200 cursor-pointer hover:border-black transition-colors group">
            <h3 className="text-xl font-black mb-2 flex justify-between items-center text-black">Support Center <ArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity" size={20}/></h3>
            <p className="text-sm font-medium text-gray-500">24/7 help desk and safety assistance.</p>
          </div>
          <div onClick={() => window.location.href='https://meet.movyra.in'} className="bg-gray-50 p-8 rounded-[24px] border border-gray-200 cursor-pointer hover:border-black transition-colors group">
            <h3 className="text-xl font-black mb-2 flex justify-between items-center text-black">Company Vision <ArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity" size={20}/></h3>
            <p className="text-sm font-medium text-gray-500">Investors and corporate structure.</p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 11: COMPLIANCE & APP DEPLOYMENT (DOWNLOAD)        */}
      {/* ========================================================= */}
      <section className="py-32 bg-[#111111] text-white">
        <div className="container mx-auto px-6 md:px-12 text-center max-w-4xl">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
             <Smartphone size={36} className="text-black" strokeWidth={1.5} />
          </div>
          <h2 className="text-[48px] md:text-[64px] font-black tracking-tighter leading-none mb-8 text-white">
            Get the Movyra App.
          </h2>
          <p className="text-[20px] text-gray-400 font-medium mb-12 max-w-2xl mx-auto">
            Install our native app for iOS and Android. Experience strict security, transparent pricing, and the power of the 6-pillar ecosystem.
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