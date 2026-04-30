import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, XCircle, ShieldAlert, ArrowRight, 
  MapPin, Clock, Info, ShieldCheck, Activity, Package 
} from 'lucide-react';

// Real Global State & Integrations
import usePreferencesStore from '../../store/usePreferencesStore';
import { useSafetyContext } from '../../contexts/SafetyContext';
import { useGenderMode } from '../../contexts/GenderModeContext';
import { t } from '../../utils/translations';

/**
 * ============================================================================
 * UI COMPONENT: PREMIUM SERVICES CATALOG (UBER-STYLE GRID DIRECTORY)
 * Architecture: 10+ Real Features, 7 Sections.
 * Completely overhauled from a static list to an animated, multi-grid 
 * interface using high-end flat vector SVGs (Black & White aesthetic).
 * Strictly handles locked/upcoming modules via an interactive Toast Engine.
 * FIX: Included missing 'Package' import from lucide-react.
 * ============================================================================
 */

// ============================================================================
// PREMIUM BLACK & WHITE CUSTOM SVGs (STRICTLY NO EMOJIS)
// Matches the high-end flat-vector aesthetic requested by the user.
// ============================================================================
const PremiumIcon = ({ name, className }) => {
  const icons = {
    hyper: <path strokeLinecap="square" strokeLinejoin="miter" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />,
    shop: <path strokeLinecap="square" strokeLinejoin="miter" d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" />,
    veg: <path strokeLinecap="square" strokeLinejoin="miter" d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z M12 22v-5" />,
    cloth: <path strokeLinecap="square" strokeLinejoin="miter" d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z" />,
    eats: <path strokeLinecap="square" strokeLinejoin="miter" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z M12 11a2 2 0 100-4 2 2 0 000 4z" />,
    porter: <path strokeLinecap="square" strokeLinejoin="miter" d="M1 3h15v13H1z M16 8h4l3 3v5h-7V8z M5.5 16a2.5 2.5 0 100 5 2.5 2.5 0 000-5z M19.5 16a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" />,
    subs: <path strokeLinecap="square" strokeLinejoin="miter" d="M12 2v20 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />,
    car_city: <path strokeLinecap="square" strokeLinejoin="miter" d="M5 11l1.5-4.5h11L19 11M3 11h18v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6z M7 15h2 M15 15h2" />,
    car_intercity: <path strokeLinecap="square" strokeLinejoin="miter" d="M4 10l2-6h12l2 6M2 10h20v6a2 2 0 01-2 2H4a2 2 0 01-2-2v-6z M6 14h2.5 M15.5 14H18 M12 3v7" />,
    moto: <path strokeLinecap="square" strokeLinejoin="miter" d="M4 17a3 3 0 100-6 3 3 0 000 6zm16 0a3 3 0 100-6 3 3 0 000 6z M10.5 11.5L14 8h4 M7 14L10 9l3 2.5" />,
    rental: <path strokeLinecap="square" strokeLinejoin="miter" d="M15 7a2 2 0 012 2v4a2 2 0 01-2 2H9a2 2 0 01-2-2V9a2 2 0 012-2h6z M12 11v2 M12 7V5a2 2 0 00-2-2H8 M20 12h-3" />
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      {icons[name] || icons.hyper}
    </svg>
  );
};

export default function ServicesCatalog() {
  const navigate = useNavigate();
  const { language } = usePreferencesStore();
  const { triggerSilentSOS } = useSafetyContext();
  const { gender } = useGenderMode();
  
  // FEATURE 1: Search State Management
  const [searchQuery, setSearchQuery] = useState('');
  
  // FEATURE 2: Time-based Intelligence Greeting
  const [greeting, setGreeting] = useState('');

  // FEATURE 3: Locked Service Toast Engine
  const [lockedToastMsg, setLockedToastMsg] = useState(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const handleLockedModuleClick = (msg) => {
    setLockedToastMsg(msg);
    setTimeout(() => setLockedToastMsg(null), 4000);
  };

  // FEATURE 4: Master Service Payload (Active & Locked)
  const CORE_DELIVERY = [
    { id: 'hyper', label: 'Hyper Delivery', desc: 'Custom grocery & pharmacy lists', icon: 'hyper', route: '/modules/hyper', active: true },
    { id: 'shop', label: 'Shop Delivery', desc: 'Multi-vendor kirana and local shops', icon: 'shop', route: '/modules/shop', active: true },
    { id: 'veg', label: 'Veg & Fruit', desc: 'Direct from street vendors & mandis', icon: 'veg', route: '/modules/veg', active: true },
    { id: 'cloth', label: 'Cloth Try-On', desc: 'Try multiple sizes, return the rest', icon: 'cloth', route: '/modules/cloth', active: true },
  ];

  const MOBILITY_NETWORK = [
    { id: 'city', label: 'City Rides', desc: 'Everyday quick trips', icon: 'car_city', active: false, msg: 'City Rides deploying in Phase 4. Our pricing models are training.' },
    { id: 'intercity', label: 'Outstation', desc: 'Intercity travel & airport', icon: 'car_intercity', active: false, msg: 'Outstation cabs launching soon.' },
    { id: 'moto', label: 'Moto Bike', desc: 'Beat the traffic', icon: 'moto', active: false, msg: 'Moto bike taxis will be available post-beta.' },
    { id: 'rental', label: 'Rentals', desc: 'Keep a car for hours', icon: 'rental', active: false, msg: 'Hourly rentals with multi-stop routes coming Q4.' }
  ];

  const LIFESTYLE_FOOD = [
    { id: 'eats', label: 'Bongo Eats', desc: 'Restaurants & Home Chefs', icon: 'eats', route: '/modules/eats', active: true },
    { id: 'porter', label: 'Logistics', desc: 'Trucks & heavy goods moving', icon: 'porter', route: '/modules/porter', active: true },
    { id: 'subs', label: 'Subscriptions', desc: 'Daily milk, paper & essentials', icon: 'subs', route: '/modules/subs', active: true },
  ];

  // FEATURE 5: Real-time Search Filtering Engine across ALL arrays
  const filterArray = (arr) => {
    if (!searchQuery.trim()) return arr;
    const q = searchQuery.toLowerCase();
    return arr.filter(s => t(s.label, language).toLowerCase().includes(q) || t(s.desc, language).toLowerCase().includes(q));
  };

  const filteredCore = filterArray(CORE_DELIVERY);
  const filteredMobility = filterArray(MOBILITY_NETWORK);
  const filteredLifestyle = filterArray(LIFESTYLE_FOOD);

  // FEATURE 6: Staggered Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#000000] text-[#111111] dark:text-white pb-[120px] transition-colors duration-300 relative overflow-x-hidden">
      
      {/* SECTION 1: STICKY SEARCH & GREETING HEADER */}
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-[#000000]/95 backdrop-blur-xl px-5 pt-12 pb-4 border-b border-gray-100 dark:border-gray-900">
        <h1 className="text-[28px] font-black tracking-tighter mb-4 leading-none">
          {t(greeting, language)}, <br/>
          <span className="text-gray-400 dark:text-gray-500 text-[20px] font-bold">{t('What do you need?', language)}</span>
        </h1>
        
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={20} className="text-black dark:text-white stroke-[2.5]" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('Search services...', language)}
            className="w-full bg-[#EEEEEE] dark:bg-[#1A1A1A] text-[#111111] dark:text-white font-bold placeholder:text-gray-500 rounded-[16px] py-3.5 pl-12 pr-10 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all border-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-0 pr-4 flex items-center active:scale-90 transition-transform">
              <XCircle size={18} className="text-gray-500 dark:text-gray-400 fill-current" />
            </button>
          )}
        </div>
      </div>

      <div className="px-5 pt-6 space-y-10">
        
        {/* ========================================================= */}
        {/* SECTION 2: CORE ESSENTIALS (ACTIVE GRID)                  */}
        {/* ========================================================= */}
        {filteredCore.length > 0 && (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
            <h2 className="text-[18px] font-black tracking-tight flex items-center gap-2">
              <Package size={20} className="text-black dark:text-white" />
              {t('Daily Essentials', language)}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {filteredCore.map((service) => (
                <motion.div 
                  key={service.id} variants={itemVariants}
                  onClick={() => navigate(service.route)}
                  className="bg-[#F8F9FA] dark:bg-[#111111] border border-gray-100 dark:border-gray-900 p-4 rounded-[20px] cursor-pointer active:scale-95 transition-all group"
                >
                  <div className="w-12 h-12 bg-black dark:bg-white rounded-[14px] flex items-center justify-center mb-3">
                    <PremiumIcon name={service.icon} className="w-6 h-6 text-white dark:text-black" />
                  </div>
                  <h3 className="text-[15px] font-black tracking-tight leading-tight mb-1">{t(service.label, language)}</h3>
                  <p className="text-[12px] font-bold text-gray-500 leading-snug">{t(service.desc, language)}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* SECTION 3: MOBILITY NETWORK (LOCKED HORIZONTAL)           */}
        {/* ========================================================= */}
        {filteredMobility.length > 0 && (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-[18px] font-black tracking-tight text-gray-400">{t('Mobility Network', language)}</h2>
              <span className="bg-gray-200 dark:bg-gray-800 text-gray-500 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Beta</span>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-5 px-5">
              {filteredMobility.map((service) => (
                <motion.div 
                  key={service.id} variants={itemVariants}
                  onClick={() => handleLockedModuleClick(service.msg)}
                  className="w-[140px] shrink-0 bg-gray-50 dark:bg-[#111111] border border-dashed border-gray-200 dark:border-gray-800 p-4 rounded-[20px] cursor-pointer active:scale-95 transition-all opacity-70 hover:opacity-100 relative"
                >
                  <div className="w-10 h-10 bg-gray-200 dark:bg-[#1A1A1A] rounded-[12px] flex items-center justify-center mb-3 text-gray-500 dark:text-gray-400">
                    <PremiumIcon name={service.icon} className="w-5 h-5" />
                  </div>
                  <h3 className="text-[14px] font-black tracking-tight leading-tight text-gray-700 dark:text-gray-300">{t(service.label, language)}</h3>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* SECTION 4: FOOD & LOGISTICS (MARKETING HOOKS)             */}
        {/* ========================================================= */}
        {filteredLifestyle.length > 0 && (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
            <h2 className="text-[18px] font-black tracking-tight">{t('Lifestyle & Enterprise', language)}</h2>
            <div className="space-y-3">
              {filteredLifestyle.map((service) => (
                <motion.div 
                  key={service.id} variants={itemVariants}
                  onClick={() => navigate(service.route)}
                  className="w-full bg-[#F8F9FA] dark:bg-[#111111] border border-gray-100 dark:border-gray-900 p-4 rounded-[20px] cursor-pointer active:scale-[0.98] transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-[#1A1A1A] rounded-[14px] flex items-center justify-center text-black dark:text-white">
                      <PremiumIcon name={service.icon} className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-[16px] font-black tracking-tight mb-0.5">{t(service.label, language)}</h3>
                      <p className="text-[13px] font-bold text-gray-500">{t(service.desc, language)}</p>
                    </div>
                  </div>
                  <ArrowRight size={20} className="text-gray-400" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* SECTION 5: SAFETY & SUPPORT MATRICES                      */}
        {/* ========================================================= */}
        {!searchQuery && (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3 pt-6 border-t border-gray-100 dark:border-gray-900">
            <h2 className="text-[18px] font-black tracking-tight mb-2">{t('Safety & Support', language)}</h2>
            
            {/* Contextual Guardian Banner */}
            <div onClick={() => navigate('/safety/guardian')} className={`w-full p-5 rounded-[20px] shadow-sm cursor-pointer active:scale-95 transition-all flex items-center justify-between border ${gender === 'female' ? 'bg-purple-50 border-purple-100 dark:bg-purple-900/20 dark:border-purple-800' : 'bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-800'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${gender === 'female' ? 'bg-purple-200 text-purple-600 dark:bg-purple-800 dark:text-purple-300' : 'bg-red-200 text-red-600 dark:bg-red-800 dark:text-red-300'}`}>
                  <ShieldAlert size={24} />
                </div>
                <div>
                  <h3 className="text-[16px] font-black tracking-tight">{t('SOS & Guardian', language)}</h3>
                  <p className="text-[13px] font-bold text-gray-600 dark:text-gray-400">Live share & instant dispatch</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div onClick={() => navigate('/order-history')} className="bg-[#F8F9FA] dark:bg-[#111111] p-4 rounded-[20px] flex items-center gap-3 cursor-pointer active:scale-95">
                <Activity size={20} className="text-gray-400" />
                <span className="text-[14px] font-black">{t('Activity', language)}</span>
              </div>
              <div onClick={() => navigate('/support/dispute')} className="bg-[#F8F9FA] dark:bg-[#111111] p-4 rounded-[20px] flex items-center gap-3 cursor-pointer active:scale-95">
                <Info size={20} className="text-gray-400" />
                <span className="text-[14px] font-black">{t('Help Center', language)}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* SECTION 6: EMPTY STATE HANDLING */}
        {filteredCore.length === 0 && filteredMobility.length === 0 && filteredLifestyle.length === 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center pt-10 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mb-4">
              <Search size={24} className="text-gray-400" />
            </div>
            <h3 className="text-[18px] font-black text-[#111111] dark:text-white mb-2">{t('No services found', language)}</h3>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 font-bold max-w-[250px]">
              {t('Try searching for "Food", "Rides", or "Delivery".', language)}
            </p>
          </motion.div>
        )}

      </div>

      {/* SECTION 7: INTERACTIVE TOAST ENGINE FOR LOCKED RIDES */}
      <AnimatePresence>
        {lockedToastMsg && (
          <motion.div 
            initial={{ y: 50, opacity: 0, scale: 0.95 }} 
            animate={{ y: 0, opacity: 1, scale: 1 }} 
            exit={{ y: 20, opacity: 0, scale: 0.95 }} 
            transition={{ type: 'spring', damping: 20 }}
            className="fixed bottom-28 left-5 right-5 z-[200]"
          >
            <div className="bg-black dark:bg-white text-white dark:text-black p-4 rounded-2xl shadow-2xl flex items-start gap-3 border border-gray-800 dark:border-gray-200">
              <Info size={24} className="shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[14px] font-black tracking-tight mb-1">Service Locked</h4>
                <p className="text-[13px] font-bold opacity-80 leading-snug">{lockedToastMsg}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}