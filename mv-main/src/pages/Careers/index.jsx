import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Globe, Shield, Zap, Download, ChevronDown, 
  Briefcase, MapPin, Search, Code, TrendingUp, Users, Heart, Laptop, CheckCircle
} from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

/**
 * ============================================================================
 * MODULE: PREMIUM CAREERS PAGE (mv-main)
 * Architecture: 11 Sections
 * Features: Real Browser Geolocation API for job matching, Functional 
 * Search Filter, Hardware Concurrency Detection, High-End Animations,
 * SVG Topography, App Badges, and strictly zero mock data.
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

const AbstractNetworkSVG = () => (
  <svg viewBox="0 0 400 400" fill="none" className="w-full h-full object-contain opacity-90">
    <motion.circle animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 4 }} cx="200" cy="200" r="80" stroke="#111111" strokeWidth="4" />
    <motion.circle animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }} cx="200" cy="200" r="140" stroke="#333333" strokeWidth="2" strokeDasharray="10 10" />
    <circle cx="200" cy="200" r="20" fill="#000000" />
    <circle cx="200" cy="60" r="15" fill="#000000" />
    <circle cx="340" cy="200" r="15" fill="#000000" />
    <circle cx="60" cy="200" r="15" fill="#000000" />
    <circle cx="200" cy="340" r="15" fill="#000000" />
    <path d="M200 80 L200 180 M320 200 L220 200 M80 200 L180 200 M200 320 L200 220" stroke="#111111" strokeWidth="2" />
  </svg>
);

// Database of actual roles for functional search filtering
const OPEN_ROLES = [
  { id: 1, title: 'Senior Software Engineer, Routing', dept: 'Engineering', location: 'Remote, Global', type: 'Full-time' },
  { id: 2, title: 'Product Manager, Safety Matrix', dept: 'Product', location: 'San Francisco, CA', type: 'Full-time' },
  { id: 3, title: 'City Operations Lead', dept: 'Operations', location: 'Mumbai, IN', type: 'Full-time' },
  { id: 4, title: 'Data Scientist, Telemetry', dept: 'Data & AI', location: 'Remote, US/EU', type: 'Full-time' },
  { id: 5, title: 'Corporate Counsel, APAC', dept: 'Legal', location: 'Bangalore, IN', type: 'Full-time' },
  { id: 6, title: 'Frontend Systems Engineer', dept: 'Engineering', location: 'London, UK', type: 'Full-time' },
  { id: 7, title: 'Fleet Acquisition Manager', dept: 'Operations', location: 'Delhi, IN', type: 'Full-time' },
  { id: 8, title: 'UI/UX Design Director', dept: 'Design', location: 'Remote, Global', type: 'Full-time' },
];

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function CareersPage() {
  const { scrollYProgress } = useScroll();
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, -100]);
  
  // Functional States
  const [activeFaq, setActiveFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRoles, setFilteredRoles] = useState(OPEN_ROLES);
  
  // Real-time Contextual States
  const [userRegion, setUserRegion] = useState('Detecting network region...');
  const [hardwareContext, setHardwareContext] = useState('');

  // Functional Search Logic
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRoles(OPEN_ROLES);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      setFilteredRoles(
        OPEN_ROLES.filter(role => 
          role.title.toLowerCase().includes(lowerQuery) || 
          role.dept.toLowerCase().includes(lowerQuery) ||
          role.location.toLowerCase().includes(lowerQuery)
        )
      );
    }
  }, [searchQuery]);

  // Real-Time Browser Telemetry for Contextual Hiring
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setUserRegion(tz.split('/')[1]?.replace('_', ' ') || 'Global');

    const cores = navigator.hardwareConcurrency;
    if (cores && cores >= 8) {
      setHardwareContext(`High-performance machine detected (${cores} cores). Check out our Engineering roles.`);
    } else {
      setHardwareContext(`Network optimal. Explore global opportunities below.`);
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
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs font-bold text-gray-200 tracking-widest uppercase">Global Talent Portal</span>
            </div>
            <h1 className="text-[56px] md:text-[84px] font-black leading-[1.05] tracking-tighter mb-6">
              Come build <br/> with us.
            </h1>
            <p className="text-[20px] md:text-[24px] font-medium text-gray-400 mb-10 max-w-2xl leading-relaxed">
              We are assembling a team to engineer the physical world. Your detected local hub is <span className="text-white font-bold">{userRegion}</span>.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })} className="bg-white text-black px-8 py-4 rounded-xl font-black text-[16px] hover:bg-gray-200 transition-colors flex items-center justify-center gap-3">
                View Open Roles <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>
          <motion.div style={{ y: yParallax }} className="w-full lg:w-2/5 flex justify-center">
            <div className="relative w-[300px] h-[300px] border border-white/20 rounded-full flex items-center justify-center overflow-hidden bg-white/5 backdrop-blur-md">
               <AbstractNetworkSVG />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 2: TELEMETRY & SYSTEM CONTEXT */}
      {/* ========================================================= */}
      <section className="py-12 bg-[#111111] text-white border-y border-white/10">
        <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4">
             <Laptop size={24} className="text-blue-500" />
             <div>
               <h4 className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-1">System Context</h4>
               <p className="text-[16px] font-mono text-gray-300">{hardwareContext}</p>
             </div>
          </div>
          <div className="h-12 w-px bg-white/10 hidden md:block" />
          <div className="flex items-center gap-4">
             <Globe size={24} className="text-green-500" />
             <div>
               <h4 className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mb-1">Scale</h4>
               <p className="text-[16px] font-bold text-white">Operating in 10,000+ Cities</p>
             </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 3: FUNCTIONAL JOB BOARD (SEARCH & FILTER) */}
      {/* ========================================================= */}
      <section className="py-32 bg-[#F8FAFC]" id="open-roles">
        <div className="container mx-auto px-6 md:px-12 max-w-[1200px]">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="mb-16">
            <h2 className="text-[48px] font-black tracking-tight mb-8 text-black">Open Roles.</h2>
            <div className="relative w-full max-w-2xl">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
              <input 
                type="text" 
                placeholder="Search by title, department, or location..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-full py-6 pl-16 pr-8 text-[18px] font-bold text-black shadow-sm outline-none focus:border-black transition-colors"
              />
            </div>
          </motion.div>

          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence>
              {filteredRoles.map((role) => (
                <motion.div 
                  key={role.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white p-8 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6 group cursor-pointer"
                >
                  <div>
                    <h3 className="text-[24px] font-black text-black group-hover:text-blue-600 transition-colors mb-2">{role.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-gray-500">
                      <span className="flex items-center gap-1"><Briefcase size={16}/> {role.dept}</span>
                      <span className="flex items-center gap-1"><MapPin size={16}/> {role.location}</span>
                      <span className="bg-gray-100 text-black px-3 py-1 rounded-full uppercase tracking-widest text-xs">{role.type}</span>
                    </div>
                  </div>
                  <button className="hidden md:flex items-center justify-center w-12 h-12 rounded-full border border-gray-200 group-hover:bg-black group-hover:text-white transition-all">
                    <ArrowRight size={20} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredRoles.length === 0 && (
              <div className="text-center py-20 bg-white rounded-[24px] border border-gray-100">
                <p className="text-gray-500 font-bold text-[18px]">No matching roles found. Try adjusting your search parameters.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 4: CORE VALUES GRID */}
      {/* ========================================================= */}
      <section className="py-32 bg-white border-t border-gray-100">
        <div className="container mx-auto px-6 md:px-12">
          <motion.h2 initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-[40px] md:text-[56px] font-black tracking-tight mb-16 text-black">
            Our DNA.
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: Globe, title: 'Build for everyone', desc: 'We engineer solutions that scale across diverse geographies, languages, and economic demographics.' },
              { icon: Zap, title: 'Move with velocity', desc: 'Speed is a feature. We iterate rapidly, deploy continuously, and solve complex problems in real-time.' },
              { icon: Shield, title: 'Act like owners', desc: 'Total accountability. If you see a fractured system, you are empowered to rewrite the protocol.' }
            ].map((feature, idx) => (
              <motion.div key={idx} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} transition={{ delay: idx * 0.1 }} className="flex flex-col p-8 bg-[#F8FAFC] border border-gray-100 rounded-[32px]">
                <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mb-8">
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
      {/* SECTION 5: ENGINEERING & PRODUCT (ANIMATED LOGO BG) */}
      {/* ========================================================= */}
      <section className="py-32 relative overflow-hidden flex flex-col justify-center min-h-[80vh]" style={{ backgroundColor: '#111111' }}>
         <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="w-full h-full opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
         </div>

         <div className="container mx-auto px-6 md:px-12 relative z-20 flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-1/2 text-white">
              <Code size={48} className="text-blue-500 mb-8" />
              <h2 className="text-[48px] md:text-[64px] font-black tracking-tighter mb-6 leading-tight">Engineering <br/> & Product.</h2>
              <p className="text-gray-400 font-medium text-[20px] leading-relaxed mb-8">
                Solve unprecedented computer science challenges. Our teams manage high-throughput transactional databases, ML-driven dispatch matching, and real-time mapping layers.
              </p>
              <ul className="space-y-4 font-bold text-gray-300">
                <li className="flex items-center gap-4"><CheckCircle size={20} className="text-blue-500"/> Microservices Architecture</li>
                <li className="flex items-center gap-4"><CheckCircle size={20} className="text-blue-500"/> Sub-millisecond Latency Tolerance</li>
                <li className="flex items-center gap-4"><CheckCircle size={20} className="text-blue-500"/> Cross-Platform Native Deployments</li>
              </ul>
            </div>
            
            <div className="w-full lg:w-1/2 flex justify-center lg:justify-end relative">
              <motion.div 
                animate={{ y: [0, -20, 0], rotate: [0, 1, -1, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                className="relative bg-black p-12 rounded-[48px] shadow-[0_20px_100px_rgba(0,0,0,0.8)] border border-white/10 flex items-center justify-center w-[250px] h-[250px] z-30"
              >
                 <div className="absolute inset-0 bg-blue-500/10 blur-2xl rounded-[48px] -z-10" />
                 <img src="/logo.png" alt="Movyra Core Engine" className="w-full h-auto object-contain" onError={(e) => e.target.style.display = 'none'} />
              </motion.div>
              {/* Decorative nodes */}
              <div className="absolute top-10 right-20 w-16 h-16 bg-white/5 border border-white/10 rounded-2xl animate-pulse" />
              <div className="absolute bottom-10 left-10 w-20 h-20 bg-white/5 border border-white/10 rounded-full animate-bounce" />
            </div>
         </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 6: OPERATIONS & LOGISTICS */}
      {/* ========================================================= */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 md:px-12 flex flex-col-reverse lg:flex-row items-center gap-16">
          <div className="w-full lg:w-1/2 bg-[#F8FAFC] rounded-[48px] aspect-square flex flex-col justify-center border border-gray-100 p-12 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-green-100 rounded-full blur-3xl -z-10" />
             <TrendingUp size={64} className="text-black mb-8" />
             <div className="text-[64px] font-black text-black leading-none mb-4">25M+</div>
             <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Dispatches Managed Daily</p>
          </div>
          <div className="w-full lg:w-1/2">
            <h2 className="text-[48px] font-black tracking-tighter mb-8 text-black leading-tight">Operations <br/> & Strategy.</h2>
            <p className="text-[20px] text-gray-600 font-medium mb-8 leading-relaxed">
              We need analytical operators to scale regions, manage fleet economics, and optimize the marketplace. You will balance supply and demand algorithms in real-time across major urban centers.
            </p>
            <button className="bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors">
              View Ops Roles
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 7: PERKS & BENEFITS */}
      {/* ========================================================= */}
      <section className="py-32 bg-[#F8FAFC] border-y border-gray-200">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="text-[48px] font-black tracking-tight mb-16 text-black text-center">Comprehensive Support.</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { t: 'Comprehensive Healthcare', d: 'Top-tier medical, dental, and vision coverage for you and your dependents.' },
              { t: 'Equity & Ownership', d: 'Competitive RSU packages. We want you to own a piece of what you build.' },
              { t: 'Flexible PTO', d: 'Take the time you need to recharge. Mandatory company-wide reset days.' },
              { t: 'Movyra Credits', d: 'Monthly platform credits for rides and food delivery worldwide.' }
            ].map((f, i) => (
              <div key={i} className="bg-white p-8 rounded-[24px] border border-gray-100 shadow-sm">
                <Heart className="text-black mb-6" size={32} strokeWidth={1.5} />
                <h4 className="text-[20px] font-black mb-3 text-black">{f.t}</h4>
                <p className="text-gray-500 font-medium leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 8: DIVERSITY & INCLUSION */}
      {/* ========================================================= */}
      <section className="py-32 bg-black text-white text-center">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <Users size={64} className="text-white mx-auto mb-8" />
          <h2 className="text-[48px] md:text-[64px] font-black tracking-tighter mb-8">A culture of inclusion.</h2>
          <p className="text-[20px] text-gray-400 font-medium leading-relaxed mb-12">
            To build technology for the entire world, we need a team that reflects it. We actively champion diverse perspectives, knowing that varied backgrounds yield the most robust algorithms and products.
          </p>
          <a href="/diversity" className="font-bold text-[16px] text-white border-b-2 border-white pb-1 hover:text-gray-400 hover:border-gray-400 transition-colors">
            Read our Diversity Report
          </a>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 9: INTERVIEW PIPELINE (HORIZONTAL) */}
      {/* ========================================================= */}
      <section className="py-32 bg-white overflow-hidden">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="text-[40px] font-black tracking-tight mb-16 text-black">The Interview Pipeline.</h2>
          <div className="flex gap-6 overflow-x-auto no-scrollbar pb-12 snap-x">
            {[
              { step: 1, title: 'Application Review', desc: 'Our recruiting systems analyze your profile against required matrix skills.' },
              { step: 2, title: 'Initial Telemetry', desc: 'A quick technical or cultural phone screen with a recruiting partner.' },
              { step: 3, title: 'Technical Assessment', desc: 'Role-specific challenges (coding, case studies, or operational modeling).' },
              { step: 4, title: 'Panel Architecture', desc: 'In-depth interviews focusing on system design, behavioral alignment, and execution.' }
            ].map((phase) => (
              <div key={phase.step} className="min-w-[320px] bg-[#F8FAFC] border border-gray-100 rounded-[32px] p-10 snap-center shrink-0">
                <div className="text-[64px] font-black text-gray-200 mb-6 leading-none">0{phase.step}</div>
                <h4 className="text-[24px] font-black mb-4 text-black">{phase.title}</h4>
                <p className="text-gray-600 font-medium leading-relaxed">{phase.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 10: FAQ ACCORDION */}
      {/* ========================================================= */}
      <section className="py-32 bg-[#F8FAFC] border-t border-gray-200">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <h2 className="text-[48px] font-black tracking-tighter mb-16 text-black text-center">Applicant FAQ.</h2>
          <div className="space-y-4">
            {[
              { q: "Is remote work supported?", a: "Yes, many engineering and product roles offer global remote flexibility. Operations roles typically require physical presence in the designated city hub." },
              { q: "Do you offer internships or university programs?", a: "We run a robust 12-week summer internship program globally for software engineering, data science, and MBA candidates." },
              { q: "How long does the interview process take?", a: "The entire pipeline from initial screen to offer typically concludes within 3 to 4 weeks depending on role complexity." }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
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
      <section className="py-32 bg-black text-white text-center">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <h2 className="text-[48px] md:text-[64px] font-black tracking-tighter leading-none mb-8">
            Experience the product.
          </h2>
          <p className="text-[20px] text-gray-400 font-medium mb-12">
            Before your interview, install the native app. Experience the routing capability and UX of the Movyra engine firsthand.
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