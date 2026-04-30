import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, ArrowLeft, Send, Package, 
  Briefcase, ShieldCheck, Share2, CheckCircle, 
  Clock, Zap, Info, ChevronDown, MapPin, 
  TrendingUp, Box, Layers, Scale
} from 'lucide-react';

// Real Firebase & Global Integrations
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import usePreferencesStore from '../../../store/usePreferencesStore';
import { t } from '../../../utils/translations';

/**
 * ============================================================================
 * MODULE: HEAVY LOGISTICS (COMING SOON HYPE ENGINE)
 * FIX: Replaced invalid 'MonitorWeight' icon with valid 'Scale' icon to 
 * prevent Vite bundler import crashes.
 * ============================================================================
 */

export default function ComingSoonPorter() {
  const navigate = useNavigate();
  const { language } = usePreferencesStore();
  const db = getFirestore();

  // FEATURE 1: Firebase Waitlist State
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // FEATURE 2: Live Cryptographic Countdown (Target: Dec 31, 2026)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // FEATURE 3: Interactive Weight & Fleet Estimator
  const [inventory, setInventory] = useState({ boxes: 0, furniture: 0, appliances: 0 });
  
  // FEATURE 4: Fare Calculator Preview
  const [estimatedDistance, setEstimatedDistance] = useState(10); // km

  // FEATURE 5: B2B vs Personal Toggle
  const [clientMode, setClientMode] = useState('personal');

  // FEATURE 6: FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(null);

  // FEATURE 7: Active Fleet Tab
  const [activeFleet, setActiveFleet] = useState('ace');

  // ======================================================================
  // LOGIC 1: Live Launch Countdown Engine
  // ======================================================================
  useEffect(() => {
    const launchDate = new Date('2026-12-31T00:00:00').getTime();
    
    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = launchDate - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // ======================================================================
  // LOGIC 2: Firebase Waitlist Capture Engine
  // ======================================================================
  const handleJoinWaitlist = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    // Strict Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'bongo_logistics_waitlist'), {
        email: email,
        languagePreference: language,
        clientType: clientMode,
        joinedAt: serverTimestamp(),
        source: 'customer_app_logistics_module'
      });
      setJoinSuccess(true);
      setEmail('');
    } catch (err) {
      console.error("Waitlist Error:", err);
      setErrorMsg('Network error. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ======================================================================
  // LOGIC 3: Native OS Share API
  // ======================================================================
  const handleShareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Movyra Heavy Logistics',
          text: 'Join the waitlist for transparent, instant fleet booking for moving and B2B goods delivery.',
          url: window.location.origin + '/modules/porter',
        });
      } catch (err) {
        console.log('Share dismissed or failed.', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.origin + '/modules/porter');
      alert('Link copied to clipboard!');
    }
  };

  // ======================================================================
  // LOGIC 4: Weight & Fleet Math Engine
  // ======================================================================
  const weightMetrics = useMemo(() => {
    const totalWeight = (inventory.boxes * 15) + (inventory.furniture * 60) + (inventory.appliances * 45); // Approx kg
    let recommendedVehicle = '2-Wheeler';
    if (totalWeight > 20 && totalWeight <= 500) recommendedVehicle = '3-Wheeler Auto';
    if (totalWeight > 500 && totalWeight <= 750) recommendedVehicle = 'Tata Ace';
    if (totalWeight > 750) recommendedVehicle = '8ft / 14ft Truck';

    return { totalWeight, recommendedVehicle };
  }, [inventory]);

  const updateInventory = (type, increment) => {
    setInventory(prev => ({
      ...prev,
      [type]: Math.max(0, prev[type] + increment)
    }));
  };

  // ======================================================================
  // LOGIC 5: Fare Calculation Math Engine
  // ======================================================================
  const calculateFare = (km) => {
    const baseFare = 250;
    const perKmRate = 25;
    return baseFare + (km * perKmRate);
  };

  const faqs = [
    { q: 'How does live bidding work for trucks?', a: 'Post your load requirements and destination. Local fleet owners and drivers will bid instantly. You review their trust score and price, then lock the deal.' },
    { q: 'Is there insurance for my goods?', a: 'Yes, all commercial and personal loads above a minimum value qualify for instantaneous transit insurance via our partner API.' },
    { q: 'Can I book for a business route?', a: 'Select B2B mode upon launch to schedule recurring vendor routes, receive GST invoices, and track your monthly logistics expenses.' }
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-[#000000] text-black dark:text-white font-sans pb-32">
      
      {/* SECTION 1: HEADER */}
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-md px-5 py-4 border-b border-gray-100 dark:border-gray-900 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard-home')} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#1A1A1A] flex items-center justify-center active:scale-95 transition-transform">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-[18px] font-black tracking-tight flex items-center gap-2">
            <Truck className="text-blue-600" size={20} /> Movyra Fleet
          </h1>
        </div>
        <button onClick={handleShareApp} className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center active:scale-95 transition-transform">
          <Share2 size={18} strokeWidth={2.5} />
        </button>
      </div>

      <div className="px-5 pt-8 space-y-8">
        
        {/* SECTION 2: HERO */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 px-4 py-1.5 rounded-full text-[12px] font-black tracking-widest uppercase mb-4 border border-blue-200 dark:border-blue-800">
            <Zap size={14} /> Phase 3 Expansion
          </div>
          <h1 className="text-[40px] font-black tracking-tighter leading-[1.1] mb-4">
            Moving, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Simplified.</span>
          </h1>
          <p className="text-[15px] font-bold text-gray-500 max-w-[300px] mx-auto">
            Book trucks, tempos, and commercial fleets instantly with real-time bidding and transparent pricing.
          </p>
        </motion.div>

        {/* SECTION 3: FIREBASE WAITLIST CAPTURE */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <div className="bg-white dark:bg-[#111111] p-6 rounded-[24px] shadow-xl border border-gray-100 dark:border-gray-900">
            <h2 className="text-[18px] font-black tracking-tight mb-4 flex items-center gap-2">
              <ShieldCheck className="text-blue-600" size={20} /> Secure Early Access
            </h2>
            
            <AnimatePresence mode="wait">
              {joinSuccess ? (
                <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl flex items-center gap-3 border border-green-100 dark:border-green-900/50">
                  <CheckCircle className="text-green-500 shrink-0" size={24} />
                  <p className="text-[14px] font-bold text-green-700 dark:text-green-400">Added to the manifest. We will notify you prior to network launch.</p>
                </motion.div>
              ) : (
                <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleJoinWaitlist} className="space-y-3">
                  <div className="flex gap-2 mb-3">
                     <button type="button" onClick={() => setClientMode('personal')} className={`flex-1 py-2 rounded-lg text-[13px] font-black transition-colors ${clientMode === 'personal' ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-gray-100 dark:bg-[#1A1A1A] text-gray-500'}`}>Personal</button>
                     <button type="button" onClick={() => setClientMode('business')} className={`flex-1 py-2 rounded-lg text-[13px] font-black transition-colors ${clientMode === 'business' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-[#1A1A1A] text-gray-500'}`}>Business (B2B)</button>
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address" disabled={isSubmitting}
                      className="flex-1 bg-[#EEEEEE] dark:bg-[#1A1A1A] rounded-xl px-4 py-3 text-[14px] font-bold outline-none focus:ring-2 focus:ring-blue-600 transition-all disabled:opacity-50"
                    />
                    <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-5 rounded-xl flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50">
                      {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={20} />}
                    </button>
                  </div>
                  {errorMsg && <p className="text-[12px] font-bold text-red-500 pl-1">{errorMsg}</p>}
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* SECTION 4: LIVE COUNTDOWN TIMER */}
        <div className="bg-gradient-to-br from-[#0B132B] to-[#1C2541] rounded-[24px] p-6 text-white shadow-lg border border-[#3A506B]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-black tracking-widest uppercase text-gray-400">Fleet Deployment</h3>
            <Clock className="text-blue-400" size={20} />
          </div>
          <div className="flex justify-between text-center gap-2">
            {[
              { label: 'Days', value: timeLeft.days },
              { label: 'Hours', value: timeLeft.hours },
              { label: 'Mins', value: timeLeft.minutes },
              { label: 'Secs', value: timeLeft.seconds }
            ].map(time => (
              <div key={time.label} className="bg-[#1C2541] p-3 rounded-xl flex-1 border border-[#3A506B]">
                <span className="block text-[24px] font-black tabular-nums">{time.value < 10 ? `0${time.value}` : time.value}</span>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">{time.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 5: INTERACTIVE WEIGHT ESTIMATOR */}
        <div className="bg-white dark:bg-[#111111] p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-900">
          <h2 className="text-[18px] font-black tracking-tight mb-2 flex items-center gap-2">
            <Scale className="text-blue-600" size={20} /> Smart Load Estimator
          </h2>
          <p className="text-[13px] font-bold text-gray-500 mb-5">Add your items to see how our algorithm automatically suggests the right fleet vehicle.</p>
          
          <div className="space-y-3 mb-5">
            {[
              { id: 'boxes', label: 'Medium Boxes', icon: Box },
              { id: 'furniture', label: 'Furniture Pieces', icon: Layers },
              { id: 'appliances', label: 'Heavy Appliances', icon: Package }
            ].map(item => (
              <div key={item.id} className="flex items-center justify-between bg-gray-50 dark:bg-[#1A1A1A] p-3 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white dark:bg-black flex items-center justify-center border border-gray-200 dark:border-gray-800">
                    <item.icon size={14} className="text-gray-600" />
                  </div>
                  <span className="text-[14px] font-bold">{item.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => updateInventory(item.id, -1)} className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center font-black">-</button>
                  <span className="text-[15px] font-black w-4 text-center">{inventory[item.id]}</span>
                  <button onClick={() => updateInventory(item.id, 1)} className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-black">+</button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[13px] font-bold text-gray-600 dark:text-gray-400">Est. Total Weight</span>
              <span className="text-[16px] font-black text-blue-700 dark:text-blue-400">{weightMetrics.totalWeight} kg</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[13px] font-bold text-gray-600 dark:text-gray-400">Algorithm Suggests</span>
              <span className="text-[14px] font-black bg-blue-600 text-white px-3 py-1 rounded-lg">{weightMetrics.recommendedVehicle}</span>
            </div>
          </div>
        </div>

        {/* SECTION 6: FARE CALCULATOR */}
        <div className="bg-white dark:bg-[#111111] p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-900">
          <h2 className="text-[18px] font-black tracking-tight mb-2 flex items-center gap-2">
            <TrendingUp className="text-green-600" size={20} /> Live Fare Math
          </h2>
          <p className="text-[13px] font-bold text-gray-500 mb-5">Slide to estimate delivery costs based on distance.</p>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-bold flex items-center gap-1"><MapPin size={16}/> Distance</span>
              <span className="text-[16px] font-black">{estimatedDistance} KM</span>
            </div>
            <input 
              type="range" min="1" max="100" value={estimatedDistance} onChange={(e) => setEstimatedDistance(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-gray-800">
              <span className="text-[14px] font-black uppercase tracking-widest text-gray-500">Base Estimate</span>
              <span className="text-[20px] font-black text-green-600">₹{calculateFare(estimatedDistance)}</span>
            </div>
          </div>
        </div>

        {/* SECTION 7: FLEET SHOWCASE TABS */}
        <div className="bg-white dark:bg-[#111111] p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-900">
          <h2 className="text-[18px] font-black tracking-tight mb-5">The Movyra Fleet</h2>
          <div className="flex bg-gray-100 dark:bg-[#1A1A1A] p-1 rounded-xl mb-5">
            {[
              { id: '2w', label: '2-Wheeler' },
              { id: 'ace', label: 'Tata Ace' },
              { id: 'truck', label: '8ft Truck' }
            ].map(tab => (
              <button 
                key={tab.id} onClick={() => setActiveFleet(tab.id)}
                className={`flex-1 py-2 rounded-lg text-[12px] font-black transition-all ${activeFleet === tab.id ? 'bg-white dark:bg-black shadow-sm' : 'text-gray-500'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="p-4 bg-blue-50 dark:bg-[#1A1A1A] rounded-xl border border-blue-100 dark:border-gray-800 flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-black flex items-center justify-center shrink-0 border border-blue-200 dark:border-gray-700">
              <Truck className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <div>
              <h4 className="text-[15px] font-black mb-1 capitalize">{activeFleet === 'ace' ? 'Tata Ace / Chota Hathi' : activeFleet === '2w' ? 'Delivery Bike' : '8ft Heavy Truck'}</h4>
              <p className="text-[13px] font-bold text-gray-500">
                {activeFleet === 'ace' ? 'Perfect for 1BHK moving, up to 750kg. Standard dimensions 7ft x 4.5ft.' : 
                 activeFleet === '2w' ? 'Fast city delivery for parcels and documents up to 20kg.' : 
                 'Industrial moving. Carries up to 1200kg. Standard dimensions 8ft x 4.5ft x 5.5ft.'}
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 8: B2B HIGHLIGHT */}
        {clientMode === 'business' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-blue-600 text-white p-6 rounded-[24px] shadow-md relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-[18px] font-black tracking-tight mb-2 flex items-center gap-2">
                <Briefcase size={20} /> Built for Enterprise
              </h3>
              <ul className="space-y-2 mt-4">
                {['GST Invoicing & Analytics', 'Dedicated Account Manager', 'Multi-Stop Route Optimization'].map((item, i) => (
                  <li key={i} className="text-[13px] font-bold flex items-center gap-2">
                    <CheckCircle size={14} className="text-blue-200" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <Briefcase size={120} className="absolute -right-4 -bottom-4 text-white/10 -rotate-12" />
          </motion.div>
        )}

        {/* SECTION 9: FAQ ACCORDION */}
        <div className="bg-white dark:bg-[#111111] p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-900">
          <h2 className="text-[18px] font-black tracking-tight mb-4 flex items-center gap-2"><Info size={20} className="text-blue-600" /> FAQ</h2>
          <div className="space-y-2">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left p-4 text-[14px] font-black bg-gray-50 dark:bg-[#1A1A1A] flex justify-between items-center"
                >
                  {faq.q}
                  <motion.span animate={{ rotate: openFaq === idx ? 180 : 0 }}>
                    <ChevronDown size={16} />
                  </motion.span>
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                      <p className="p-4 text-[13px] font-bold text-gray-500 bg-white dark:bg-[#111111] leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}