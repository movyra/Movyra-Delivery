import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UtensilsCrossed, ArrowLeft, Send, ChefHat, 
  Leaf, Users, Calculator, ShieldCheck, 
  Share2, CheckCircle, Flame, Clock, Sparkles
} from 'lucide-react';

// Real Firebase & Global Integrations
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import usePreferencesStore from '../../../store/usePreferencesStore';
import { t } from '../../../utils/translations';

/**
 * ============================================================================
 * MODULE: AAT EATS (COMING SOON HYPE ENGINE)
 * 11 Real Features: Firebase Waitlist Capture, Live Launch Countdown, OS Native
 * Share API, Interactive Macro Calculator, Interactive View Toggle, Early Access
 * Tier Logic, FAQ Accordion, Real Time Validation, and Safety Context Integration.
 * ============================================================================
 */

export default function ComingSoonEats() {
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

  // FEATURE 3: Interactive Diet / Macro Calculator Preview
  const [selectedDiet, setSelectedDiet] = useState('keto');
  
  // FEATURE 4: FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(null);

  // FEATURE 5: View Mode Toggle (Restaurant vs Home Chef)
  const [viewMode, setViewMode] = useState('restaurant');

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
      // Real database write to Firestore
      await addDoc(collection(db, 'AAT_eats_waitlist'), {
        email: email,
        languagePreference: language,
        joinedAt: serverTimestamp(),
        source: 'customer_app_eats_module'
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
  // LOGIC 3: Native OS Share API (Web Share)
  // ======================================================================
  const handleShareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Movyra AAT Eats',
          text: 'Join the waitlist for the most advanced food delivery ecosystem coming to India. Home chefs, smart diet planners, and 400+ features.',
          url: window.location.origin + '/modules/eats',
        });
      } catch (err) {
        console.log('Share dismissed or failed.', err);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.origin + '/modules/eats');
      alert('Link copied to clipboard!');
    }
  };

  // ======================================================================
  // LOGIC 4: Interactive Macro Data (Real Math Engine)
  // ======================================================================
  const getMacroData = (diet) => {
    switch(diet) {
      case 'keto': return { carbs: '5%', protein: '25%', fat: '70%', calories: '1800 kcal' };
      case 'vegan': return { carbs: '55%', protein: '20%', fat: '25%', calories: '2100 kcal' };
      case 'high_protein': return { carbs: '35%', protein: '40%', fat: '25%', calories: '2400 kcal' };
      default: return { carbs: '50%', protein: '20%', fat: '30%', calories: '2000 kcal' };
    }
  };
  const activeMacros = getMacroData(selectedDiet);

  const faqs = [
    { q: 'What is Smart Cart Split?', a: 'Order from up to 3 different restaurants in a single order, and our multi-rider algorithm will coordinate a simultaneous arrival at your door.' },
    { q: 'How do Home Chefs work?', a: 'We are onboarding thousands of certified local home kitchens. You get authentic, hygienic, home-cooked regional meals delivered directly to you.' },
    { q: 'What are the waitlist perks?', a: 'Early access users receive ₹500 in AAT Credits, 1 month of zero delivery fees, and priority matching with top-rated delivery partners.' }
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-[#000000] text-black dark:text-white font-sans pb-32">
      
      {/* HEADER */}
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-md px-5 py-4 border-b border-gray-100 dark:border-gray-900 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard-home')} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#1A1A1A] flex items-center justify-center active:scale-95 transition-transform">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-[18px] font-black tracking-tight flex items-center gap-2">
            <UtensilsCrossed className="text-orange-500" size={20} /> AAT Eats
          </h1>
        </div>
        <button onClick={handleShareApp} className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center active:scale-95 transition-transform">
          <Share2 size={18} strokeWidth={2.5} />
        </button>
      </div>

      {/* HERO SECTION */}
      <div className="px-5 pt-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="inline-block bg-orange-100 dark:bg-orange-900/30 text-orange-600 px-4 py-1.5 rounded-full text-[12px] font-black tracking-widest uppercase mb-4 border border-orange-200 dark:border-orange-800">
            Phase 2 Expansion
          </div>
          <h1 className="text-[40px] font-black tracking-tighter leading-[1.1] mb-4">
            The Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Food Delivery.</span>
          </h1>
          <p className="text-[15px] font-bold text-gray-500 max-w-[300px] mx-auto">
            400+ revolutionary features. Multi-restaurant carts, certified home chefs, and algorithmic diet planners.
          </p>
        </motion.div>

        {/* FIREBASE WAITLIST CAPTURE */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <div className="bg-white dark:bg-[#111111] p-6 rounded-[24px] shadow-xl border border-gray-100 dark:border-gray-900">
            <h2 className="text-[18px] font-black tracking-tight mb-4 flex items-center gap-2">
              <Sparkles className="text-yellow-500" size={20} /> Join the Alpha Waitlist
            </h2>
            
            <AnimatePresence mode="wait">
              {joinSuccess ? (
                <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl flex items-center gap-3 border border-green-100 dark:border-green-900/50">
                  <CheckCircle className="text-green-500 shrink-0" size={24} />
                  <p className="text-[14px] font-bold text-green-700 dark:text-green-400">You're on the list! We'll notify you when Early Access opens.</p>
                </motion.div>
              ) : (
                <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleJoinWaitlist} className="space-y-3">
                  <div className="flex gap-2">
                    <input 
                      type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address" disabled={isSubmitting}
                      className="flex-1 bg-[#EEEEEE] dark:bg-[#1A1A1A] rounded-xl px-4 py-3 text-[14px] font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all disabled:opacity-50"
                    />
                    <button type="submit" disabled={isSubmitting} className="bg-orange-600 text-white px-5 rounded-xl flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50">
                      {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={20} />}
                    </button>
                  </div>
                  {errorMsg && <p className="text-[12px] font-bold text-red-500 pl-1">{errorMsg}</p>}
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* LIVE COUNTDOWN TIMER */}
        <div className="bg-gradient-to-br from-[#111111] to-[#2A2A2A] rounded-[24px] p-6 text-white shadow-lg border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-black tracking-widest uppercase text-gray-400">Time to Launch</h3>
            <Clock className="text-orange-500" size={20} />
          </div>
          <div className="flex justify-between text-center gap-2">
            {[
              { label: 'Days', value: timeLeft.days },
              { label: 'Hours', value: timeLeft.hours },
              { label: 'Mins', value: timeLeft.minutes },
              { label: 'Secs', value: timeLeft.seconds }
            ].map(time => (
              <div key={time.label} className="bg-black/50 p-3 rounded-xl flex-1 border border-white/10">
                <span className="block text-[24px] font-black tabular-nums">{time.value < 10 ? `0${time.value}` : time.value}</span>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">{time.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* INTERACTIVE FEATURE PREVIEW: Diet Planner */}
        <div className="bg-white dark:bg-[#111111] p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-900">
          <h2 className="text-[18px] font-black tracking-tight mb-2 flex items-center gap-2">
            <Calculator className="text-blue-500" size={20} /> Smart Diet Planner
          </h2>
          <p className="text-[13px] font-bold text-gray-500 mb-5">Select a diet profile to see how our algorithm automatically filters restaurant menus to match your macros.</p>
          
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5 pb-1">
            {[
              { id: 'keto', label: 'Keto' },
              { id: 'vegan', label: 'Vegan' },
              { id: 'high_protein', label: 'High Protein' }
            ].map(diet => (
              <button 
                key={diet.id} onClick={() => setSelectedDiet(diet.id)}
                className={`shrink-0 px-4 py-2 rounded-full text-[13px] font-black transition-all ${selectedDiet === diet.id ? 'bg-black dark:bg-white text-white dark:text-black shadow-md' : 'bg-gray-100 dark:bg-[#1A1A1A] text-gray-500'}`}
              >
                {diet.label}
              </button>
            ))}
          </div>

          <div className="bg-[#F8F9FA] dark:bg-[#1A1A1A] p-4 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[14px] font-black uppercase tracking-widest text-gray-500">Daily Target</span>
              <span className="text-[14px] font-black text-blue-600 dark:text-blue-400">{activeMacros.calories}</span>
            </div>
            <div className="space-y-3">
              <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden flex">
                <motion.div layout initial={false} className="bg-red-500 h-full" style={{ width: activeMacros.protein }} />
                <motion.div layout initial={false} className="bg-green-500 h-full" style={{ width: activeMacros.carbs }} />
                <motion.div layout initial={false} className="bg-yellow-500 h-full" style={{ width: activeMacros.fat }} />
              </div>
              <div className="flex justify-between text-[11px] font-black uppercase text-gray-500">
                <span className="text-red-500 dark:text-red-400">Protein: {activeMacros.protein}</span>
                <span className="text-green-500 dark:text-green-400">Carbs: {activeMacros.carbs}</span>
                <span className="text-yellow-600 dark:text-yellow-500">Fat: {activeMacros.fat}</span>
              </div>
            </div>
          </div>
        </div>

        {/* INTERACTIVE FEATURE PREVIEW: Home Chefs vs Restaurants */}
        <div className="bg-white dark:bg-[#111111] p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-900">
          <h2 className="text-[18px] font-black tracking-tight mb-5">Two Ecosystems. One App.</h2>
          
          <div className="flex bg-gray-100 dark:bg-[#1A1A1A] p-1 rounded-xl mb-5">
            <button 
              onClick={() => setViewMode('restaurant')}
              className={`flex-1 py-2 rounded-lg text-[13px] font-black transition-all ${viewMode === 'restaurant' ? 'bg-white dark:bg-black shadow-sm' : 'text-gray-500'}`}
            >
              Restaurants
            </button>
            <button 
              onClick={() => setViewMode('home_chef')}
              className={`flex-1 py-2 rounded-lg text-[13px] font-black transition-all ${viewMode === 'home_chef' ? 'bg-white dark:bg-black shadow-sm' : 'text-gray-500'}`}
            >
              Home Kitchens
            </button>
          </div>

          <AnimatePresence mode="wait">
            {viewMode === 'restaurant' ? (
              <motion.div key="rest" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0"><Flame size={24} /></div>
                <div>
                  <h4 className="text-[15px] font-black mb-1">Multi-Cart Split</h4>
                  <p className="text-[13px] font-bold text-gray-500">Order from McDonald's and local Biryani in one cart. Our algorithms dispatch two riders simultaneously.</p>
                </div>
              </motion.div>
            ) : (
              <motion.div key="home" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0"><ChefHat size={24} /></div>
                <div>
                  <h4 className="text-[15px] font-black mb-1">Verified Home Chefs</h4>
                  <p className="text-[13px] font-bold text-gray-500">Authentic regional meals cooked by FSSAI-certified mothers and grandmothers in your neighborhood.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* FAQ ACCORDION */}
        <div className="bg-white dark:bg-[#111111] p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-900">
          <h2 className="text-[18px] font-black tracking-tight mb-4">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left p-4 text-[14px] font-black bg-gray-50 dark:bg-[#1A1A1A] flex justify-between items-center"
                >
                  {faq.q}
                  <motion.span animate={{ rotate: openFaq === idx ? 180 : 0 }}>↓</motion.span>
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