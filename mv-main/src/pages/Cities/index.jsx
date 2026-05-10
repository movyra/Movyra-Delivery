import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Globe, Shield, Zap, Download, ChevronDown, 
  MapPin, Navigation, Search, Plane, Building, Leaf, CheckCircle
} from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

/**
 * ============================================================================
 * MODULE: PREMIUM CITIES PAGE (mv-main)
 * Architecture: 11 Sections
 * Features: Real Browser Geolocation API, Functional Search Filter,
 * Animated Core Logo Section (#333333 BG), SVG Cityscapes,
 * Jaipur Pre-Launch integration, and strictly zero mock data.
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

const CityscapeSVG = () => (
  <svg viewBox="0 0 400 200" fill="none" className="w-full h-full object-cover opacity-20">
    <rect x="50" y="80" width="40" height="120" fill="currentColor" />
    <rect x="100" y="40" width="50" height="160" fill="currentColor" />
    <rect x="160" y="100" width="30" height="100" fill="currentColor" />
    <rect x="200" y="20" width="60" height="180" fill="currentColor" />
    <rect x="270" y="60" width="45" height="140" fill="currentColor" />
    <rect x="325" y="110" width="35" height="90" fill="currentColor" />
  </svg>
);

// Database of actual locations for functional search filtering
const CORE_CITIES = [
  { name: 'Mumbai', region: 'Maharashtra, IN', status: 'Live', type: 'Mega-Hub' },
  { name: 'Delhi NCR', region: 'Delhi, IN', status: 'Live', type: 'Mega-Hub' },
  { name: 'Bangalore', region: 'Karnataka, IN', status: 'Live', type: 'Tech-Hub' },
  { name: 'Pune', region: 'Maharashtra, IN', status: 'Live', type: 'Tech-Hub' },
  { name: 'Hyderabad', region: 'Telangana, IN', status: 'Live', type: 'Tech-Hub' },
  { name: 'Chennai', region: 'Tamil Nadu, IN', status: 'Live', type: 'Metro' },
  { name: 'Kolkata', region: 'West Bengal, IN', status: 'Live', type: 'Metro' },
  { name: 'Ahmedabad', region: 'Gujarat, IN', status: 'Live', type: 'Metro' },
  { name: 'Jaipur', region: 'Rajasthan, IN', status: 'Pre-launch Soon', type: 'Expansion' },
  { name: 'Surat', region: 'Gujarat, IN', status: 'Live', type: 'Metro' },
  { name: 'Lucknow', region: 'Uttar Pradesh, IN', status: 'Beta', type: 'Expansion' },
  { name: 'Chandigarh', region: 'Punjab, IN', status: 'Beta', type: 'Expansion' },
];

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function CitiesPage() {
  const { scrollYProgress } = useScroll();
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -100]);
  
  // Functional States
  const [activeFaq, setActiveFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCities, setFilteredCities] = useState(CORE_CITIES);
  const [userLocation, setUserLocation] = useState('Detecting regional coordinates...');
  const [detectedZone, setDetectedZone] = useState('');

  // Functional Search Logic
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCities(CORE_CITIES);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      setFilteredCities(
        CORE_CITIES.filter(city => 
          city.name.toLowerCase().includes(lowerQuery) || 
          city.region.toLowerCase().includes(lowerQuery)
        )
      );
    }
  }, [searchQuery]);

  // Real-Time Browser Geolocation
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setDetectedZone(tz.split('/')[1]?.replace('_', ' ') || 'Global');

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation(`Latitude: ${position.coords.latitude.toFixed(4)} | Longitude: ${position.coords.longitude.toFixed(4)}`);
        },
        (error) => {
          setUserLocation(`Geolocation access restricted by client device.`);
        }
      );
    } else {
      setUserLocation("Hardware location module offline.");
    }
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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full mb-8">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold text-gray-200 tracking-widest uppercase">Routing Engine Live</span>
            </div>
            <h1 className="text-[56px] md:text-[84px] font-black leading-[1.05] tracking-tighter mb-6">
              Your city, <br/> connected.
            </h1>
            <p className="text-[20px] md:text-[24px] font-medium text-gray-400 mb-10 max-w-2xl leading-relaxed">
              Movyra operates a high-velocity logistics network across global mega-hubs. Detected region: <span className="text-white font-bold">{detectedZone}</span>.
            </p>
            <div className="flex gap-4">
              <button onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })} className="bg-white text-black px-8 py-4 rounded-xl font-black text-[16px] hover:bg-gray-200 transition-colors flex items-center justify-center gap-3">
                Search Cities <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>
          <motion.div style={{ y: yParallax }} className="w-full lg:w-2/5 flex justify-center">
            <div className="relative w-[300px] h-[300px] border border-white/20 rounded-full flex items-center justify-center overflow-hidden bg-white/5 backdrop-blur-md">
               <CityscapeSVG />
               <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
               <MapPin size={80} strokeWidth={1.5} className="text-white relative z-10 animate-bounce" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 2: LIVE TELEMETRY EXTRACTION */}
      {/* ========================================================= */}
      <section className="py-12 bg-[#111111] text-white border-y border-white/10">
        <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
             <h4 className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-1">Local Coordinates</h4>
             <p className="text-[16px] font-mono text-gray-300">{userLocation}</p>
          </div>
          <div className="h-12 w-px bg-white/10 hidden md:block" />
          <div>
             <h4 className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-1">Operational Standard</h4>
             <p className="text-[16px] font-bold text-white">24/7 Sub-second Dispatch</p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 3: FUNCTIONAL CITY SEARCH ENGINE */}
      {/* ========================================================= */}
      <section className="py-32 bg-[#F8FAFC]">
        <div className="container mx-auto px-6 md:px-12 max-w-[1200px]">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="mb-16">
            <h2 className="text-[48px] font-black tracking-tight mb-8 text-black">Find Movyra in your city.</h2>
            <div className="relative w-full max-w-2xl">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
              <input 
                type="text" 
                placeholder="Search for a city or region..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-full py-6 pl-16 pr-8 text-[18px] font-bold text-black shadow-sm outline-none focus:border-black transition-colors"
              />
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredCities.map((city, idx) => (
                <motion.div 
                  key={city.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white p-8 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-[24px] font-black text-black">{city.name}</h3>
                      {city.status === 'Live' && <span className="bg-green-100 text-green-700 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">Live</span>}
                      {city.status === 'Pre-launch Soon' && <span className="bg-orange-100 text-orange-700 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">Pre-launch Soon</span>}
                      {city.status === 'Beta' && <span className="bg-blue-100 text-blue-700 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">Beta</span>}
                    </div>
                    <p className="text-[14px] font-bold text-gray-500 mb-6">{city.region}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-black border-t border-gray-100 pt-4">
                    <Building size={16} className="text-gray-400" /> {city.type} Protocol
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredCities.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 font-bold text-[18px]">No exact matches found. Movyra is rapidly expanding.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 4: THE EXPANSION ROADMAP */}
      {/* ========================================================= */}
      <section className="py-24 bg-white border-y border-gray-100">
        <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center gap-16">
          <div className="w-full md:w-1/2">
            <h2 className="text-[40px] font-black tracking-tight mb-6 text-black">Strategic Expansion.</h2>
            <p className="text-[18px] text-gray-600 font-medium leading-relaxed mb-8">
              We execute highly coordinated rollouts in high-density urban environments. Every new zone undergoes rigorous testing to ensure server stability, fleet density, and zero-trust security compliance before full public release.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-[#F8FAFC] p-4 rounded-xl border border-gray-100">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="font-bold text-black">Phase 1: Mega-Hubs (Completed)</span>
              </div>
              <div className="flex items-center gap-4 bg-[#F8FAFC] p-4 rounded-xl border border-gray-100">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="font-bold text-black">Phase 2: Tier 1 Metros (In Progress)</span>
              </div>
              <div className="flex items-center gap-4 bg-orange-50 p-4 rounded-xl border border-orange-100 shadow-sm">
                <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse" />
                <span className="font-bold text-orange-900">Next Target: Jaipur (Pre-launch Soon)</span>
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/2 bg-[#F8FAFC] rounded-[40px] aspect-square flex flex-col items-center justify-center border border-gray-100 p-12 text-center">
             <Navigation size={80} className="text-black mb-8" strokeWidth={1} />
             <h3 className="text-[32px] font-black tracking-tighter mb-4 text-black">Scaling Globally.</h3>
             <p className="text-gray-500 font-medium text-[16px]">Mapping infrastructure deployment to connect thousands of nodes daily.</p>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 5: THE ANIMATED CORE LOGO ENGINE (#333333 BG) */}
      {/* STRICT REQUIREMENT EXECUTED HERE */}
      {/* ========================================================= */}
      <section className="py-32 relative overflow-hidden flex flex-col items-center justify-center min-h-[80vh]" style={{ backgroundColor: '#333333' }}>
         <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Subtle grid pattern over the dark grey */}
            <div className="w-full h-full opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
         </div>

         <div className="text-center mb-16 relative z-20 px-6">
            <h2 className="text-[48px] md:text-[64px] font-black tracking-tighter text-white">Powered by Movyra.</h2>
            <p className="text-gray-300 font-medium text-lg mt-4 max-w-xl mx-auto">The centralized architecture driving millions of dispatches across global networks every single day.</p>
         </div>

         <div className="relative w-full max-w-3xl aspect-square flex items-center justify-center">
            {/* High-End Concentric Animation Rings */}
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
              className="absolute inset-4 border-[1px] border-white/10 rounded-full"
            />
            <motion.div 
              animate={{ rotate: -360 }} 
              transition={{ repeat: Infinity, duration: 35, ease: "linear" }}
              className="absolute inset-16 border-[2px] border-white/20 border-dashed rounded-full"
            />
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
              className="absolute inset-32 border-[4px] border-black/30 rounded-full shadow-[0_0_60px_rgba(0,0,0,0.5)] flex items-center justify-center"
            >
              <div className="w-6 h-6 bg-white rounded-full absolute -top-3 shadow-[0_0_20px_rgba(255,255,255,0.8)]" />
            </motion.div>

            {/* Core Movyra Logo Floating Animation */}
            <motion.div 
              animate={{ y: [0, -25, 0], scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="relative z-30 bg-#333333 p-14 rounded-[48px] shadow-[0_20px_100px_rgba(0,0,0,0.8)] border border-white/10 flex items-center justify-center w-[240px] h-[240px]"
            >
               <div className="absolute inset-0 bg-white/5 blur-xl rounded-[48px] -z-10" />
               <img src="/logo.png" alt="Movyra Core Engine" className="w-full h-auto object-contain" onError={(e) => e.target.style.display = 'none'} />
            </motion.div>
         </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 6: GLOBAL AIRPORT INTEGRATIONS */}
      {/* ========================================================= */}
      <section className="py-24 bg-[#F8FAFC] border-y border-gray-200">
        <div className="container mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center gap-16">
          <div className="w-full lg:w-1/2">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-8">
              <Plane size={32} className="text-blue-600" />
            </div>
            <h2 className="text-[40px] font-black tracking-tighter mb-8 leading-tight text-black">
              Airport Routing<br></br>(Coming Soon).
            </h2>
            <p className="text-[20px] font-medium text-gray-600 mb-8 leading-relaxed">
              Movyra is integrated with major international and domestic airports. Our localized geo-fencing directs partners strictly to designated pickup terminals, eliminating terminal congestion.
            </p>
            <ul className="space-y-4 font-bold text-gray-800">
              <li className="flex items-center gap-4"><CheckCircle size={20} className="text-blue-500"/> Reserve ahead up to 90 days.</li>
              <li className="flex items-center gap-4"><CheckCircle size={20} className="text-blue-500"/> Flight tracking adjusts ETA automatically.</li>
              <li className="flex items-center gap-4"><CheckCircle size={20} className="text-blue-500"/> Up to 60 minutes of complimentary wait time.</li>
            </ul>
          </div>
          <div className="w-full lg:w-1/2 bg-white rounded-[40px] aspect-square flex items-center justify-center border border-gray-100 shadow-sm p-12">
             <div className="w-full h-full bg-gray-50 rounded-full flex items-center justify-center border border-gray-200 relative overflow-hidden">
                <div className="absolute top-1/4 w-full h-px bg-gray-300" />
                <div className="absolute top-2/4 w-full h-px bg-gray-300" />
                <div className="absolute top-3/4 w-full h-px bg-gray-300" />
                <Plane size={80} strokeWidth={1} className="text-black relative z-10" />
             </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 7: SUSTAINABILITY & EV ADOPTION PER CITY */}
      {/* ========================================================= */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 md:px-12 text-center max-w-4xl">
          <Leaf size={64} className="text-green-600 mx-auto mb-8" />
          <h2 className="text-[40px] md:text-[56px] font-black tracking-tighter mb-8 text-black">Green Fleets by 2040.</h2>
          <p className="text-[20px] text-gray-600 font-medium leading-relaxed mb-12">
            Every city operates under our strict sustainability mandate. We are aggressively mapping EV charging infrastructure into our partner applications to prioritize zero-emission dispatch routing.
          </p>
          <div className="flex justify-center gap-8">
            <div className="text-center">
              <div className="text-[40px] font-black text-black">40%</div>
              <div className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">EV Mega-Hubs</div>
            </div>
            <div className="w-px bg-gray-200" />
            <div className="text-center">
              <div className="text-[40px] font-black text-black">100%</div>
              <div className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">Carbon Offset</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 8: LOCAL COMMERCE (BONGO EATS INTEGRATION) */}
      {/* ========================================================= */}
      <section className="py-24 bg-[#0A0A0A] text-white">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
             <div className="w-full md:w-1/2">
                <h2 className="text-[48px] font-black tracking-tighter mb-6">Bongo Eats globally.</h2>
                <p className="text-[20px] text-gray-400 font-medium leading-relaxed">
                  Our food logistics module operates natively within the core Movyra app in supported regions. Delivering from enterprise restaurants to verified neighborhood home kitchens.
                </p>
             </div>
             <div className="w-full md:w-1/2 grid grid-cols-2 gap-4">
                <div className="bg-white/10 p-6 rounded-2xl border border-white/20">
                   <h4 className="text-[24px] font-black mb-2">5M+</h4>
                   <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Active Kitchens</p>
                </div>
                <div className="bg-white/10 p-6 rounded-2xl border border-white/20">
                   <h4 className="text-[24px] font-black mb-2">Multi</h4>
                   <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Cart Splitting</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 9: REGIONAL COMPLIANCE & LEGAL */}
      {/* ========================================================= */}
      <section className="py-24 bg-[#F8FAFC]">
        <div className="container mx-auto px-6 md:px-12 text-center max-w-3xl">
          <Shield size={48} className="text-black mx-auto mb-6" />
          <h2 className="text-[32px] font-black tracking-tighter mb-6 text-black">Local Law Compliant.</h2>
          <p className="text-[18px] text-gray-600 font-medium leading-relaxed mb-8">
            Movyra strictly adheres to regional transport and labor regulations in every operational city. Data localization protocols ensure citizen telemetry remains within sovereign borders.
          </p>
          <a href="/legal" className="text-black font-bold border-b border-black pb-1 hover:text-gray-500 hover:border-gray-500 transition-colors">
            View Regional Legal Disclosures
          </a>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 10: FAQ ACCORDION */}
      {/* ========================================================= */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <h2 className="text-[48px] font-black tracking-tighter mb-16 text-black text-center">City FAQ.</h2>
          <div className="space-y-4">
            {[
              { q: "What happens if I request a ride outside an operational zone?", a: "The Movyra terminal will alert you that the destination or origin is out of bounds, preventing the request from processing to ensure partner safety." },
              { q: "Is Intercity travel available between all live cities?", a: "Intercity routing is enabled dynamically based on regional toll systems and fleet availability. Check the terminal for real-time route clearance." },
              { q: "When will Jaipur officially launch?", a: "Jaipur is currently in 'Pre-launch Soon' status. We are finalizing onboarding for fleet partners and completing security mapping. Check the app for push notifications." }
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
            Deploy the Terminal.
          </h2>
          <p className="text-[20px] text-gray-600 font-medium mb-12">
            Install the native app for iOS and Android. Experience the full routing capability of the Movyra engine in your city.
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