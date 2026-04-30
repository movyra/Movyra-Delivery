import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ArrowRight, Clock, ChevronRight, 
  MapPin, Star, Shield, Car, Package, 
  Calendar, Key, Plane, Zap, Info, Plus, Lock
} from 'lucide-react';

// Real Store, Prefs & Database Integration
import useBookingStore from '../../store/useBookingStore';
import usePreferencesStore from '../../store/usePreferencesStore';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { t } from '../../utils/translations';

// Premium Design System Components
import LineIconRegistry from '../../components/Icons/LineIconRegistry';
import SystemCard from '../../components/UI/SystemCard';

/**
 * PAGE: MOBILE HOME DASHBOARD (PREMIUM SUPER-APP UI)
 * Features: 
 * - Contextual Toggle: Switch between 'Rides' and 'Delivery' context.
 * - Massive Search Card: Exact replica of the "Where to?" pill interaction.
 * - Active Launch Modules: Hyper, Shop, Veg, Cloth (Custom SVGs).
 * - Coming Soon Modules: Eats, Porter, Subs (Grayed-out state logic).
 * - Promo Carousel: Safety matrix integrations.
 * - Dual-Path Engine: Restores legacy bookings while syncing new ones.
 */

const getAppId = () => {
  if (typeof window !== 'undefined' && window.__app_id) return window.__app_id;
  if (typeof __app_id !== 'undefined') return __app_id;
  return 'default-app-id';
};

// ============================================================================
// PIXEL-PERFECT CUSTOM SVG REGISTRY FOR SUPER-APP MODULES
// ============================================================================
const CustomModuleIcon = ({ name, className }) => {
  const icons = {
    hyper: <path strokeLinecap="round" strokeLinejoin="round" d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
    shop: <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" />,
    veg: <path strokeLinecap="round" strokeLinejoin="round" d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z M12 22v-5" />,
    cloth: <path strokeLinecap="round" strokeLinejoin="round" d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z" />,
    eats: <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z M12 11a2 2 0 100-4 2 2 0 000 4z" />,
    porter: <path strokeLinecap="round" strokeLinejoin="round" d="M1 3h15v13H1z M16 8h4l3 3v5h-7V8z M5.5 16a2.5 2.5 0 100 5 2.5 2.5 0 000-5z M19.5 16a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" />,
    subs: <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      {icons[name]}
    </svg>
  );
};

export default function MobileHome() {
  const navigate = useNavigate();
  const db = getFirestore();
  const auth = getAuth();
  
  // Real Global State
  const { language } = usePreferencesStore();
  const [activeContext, setActiveContext] = useState('delivery'); // Defaulting to Delivery for Super-App focus

  // Real-time Data States
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [accountBalance, setAccountBalance] = useState(0);
  const [secureOrders, setSecureOrders] = useState([]);
  const [legacyOrders, setLegacyOrders] = useState([]);

  // ============================================================================
  // LOGIC: DUAL-PATH REAL-TIME DATA STREAMS
  // ============================================================================
  useEffect(() => {
    let unsubscribeUser, unsubscribeSecure, unsubscribeLegacy;

    const authUnsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const firstName = user.displayName ? user.displayName.split(' ')[0] : 'User';
        const appId = getAppId();
        setUserName(firstName);

        const userRef = doc(db, 'artifacts', appId, 'users', user.uid);
        unsubscribeUser = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) setAccountBalance(docSnap.data().walletBalance || 0);
        });

        const secureRef = collection(db, 'artifacts', appId, 'users', user.uid, 'orders');
        const qSecure = query(secureRef, orderBy('createdAt', 'desc'), limit(5));
        unsubscribeSecure = onSnapshot(qSecure, (snapshot) => {
          setSecureOrders(snapshot.docs.map(d => ({ id: d.id, ...d.data(), _source: 'secure' })));
          setIsLoading(false);
        });

        const legacyRef = collection(db, 'orders');
        const qLegacy = query(legacyRef, where('userId', '==', user.uid), orderBy('createdAt', 'desc'), limit(5));
        unsubscribeLegacy = onSnapshot(qLegacy, (snapshot) => {
          setLegacyOrders(snapshot.docs.map(d => ({ id: d.id, ...d.data(), _source: 'legacy' })));
        });
      } else {
        setUserName(t('Guest', language));
        setIsLoading(false);
      }
    });

    return () => {
      authUnsubscribe();
      if (unsubscribeUser) unsubscribeUser();
      if (unsubscribeSecure) unsubscribeSecure();
      if (unsubscribeLegacy) unsubscribeLegacy();
    };
  }, [auth, db, language]);

  const { recentActivity, activeShipmentsCount } = useMemo(() => {
    const combined = [...secureOrders, ...legacyOrders];
    const uniqueMap = new Map();
    combined.forEach(o => { if (!uniqueMap.has(o.id) || o._source === 'secure') uniqueMap.set(o.id, o); });
    const sorted = Array.from(uniqueMap.values()).sort((a, b) => {
      const dA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const dB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return dB - dA;
    });
    const active = sorted.filter(o => ['searching', 'assigned', 'picked_up'].includes(o.status)).length;
    return { recentActivity: sorted.slice(0, 3), activeShipmentsCount: active };
  }, [secureOrders, legacyOrders]);

  // ============================================================================
  // SUPER-APP MODULE DEFINITIONS (10+ ACTIVE & UPCOMING FEATURES)
  // ============================================================================
  const activeModules = [
    { id: 'hyper', label: 'Hyper Delivery', icon: 'hyper', route: '/modules/hyper', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
    { id: 'shop', label: 'Shop Delivery', icon: 'shop', route: '/modules/shop', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
    { id: 'veg', label: 'Veg & Fruit', icon: 'veg', route: '/modules/veg', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
    { id: 'cloth', label: 'Cloth Try-On', icon: 'cloth', route: '/modules/cloth', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
  ];

  const comingSoonModules = [
    { id: 'eats', label: 'Bongo Eats', icon: 'eats', route: '/modules/eats' },
    { id: 'porter', label: 'Heavy Logistics', icon: 'porter', route: '/modules/porter' },
    { id: 'subs', label: 'Subscriptions', icon: 'subs', route: '/modules/subs' },
  ];

  return (
    <div className="min-h-[100dvh] bg-white dark:bg-[#000000] text-[#000000] dark:text-[#FFFFFF] font-sans pb-32 overflow-x-hidden relative transition-colors duration-300">
      
      {/* SECTION 1: CONTEXT TOGGLE HEADER */}
      <div className="px-6 pt-14 pb-4 flex items-center gap-8 sticky top-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-900 transition-all">
        <button 
          onClick={() => setActiveContext('delivery')}
          className={`relative py-2 flex items-center gap-2.5 transition-all ${activeContext === 'delivery' ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
        >
          <Package size={24} strokeWidth={2.5} />
          <span className="text-[20px] font-black tracking-tight">{t('Delivery', language)}</span>
          {activeContext === 'delivery' && <motion.div layoutId="contextUnderline" className="absolute -bottom-4 left-0 right-0 h-1 bg-black dark:bg-white rounded-full" />}
        </button>

        <button 
          onClick={() => setActiveContext('rides')}
          className={`relative py-2 flex items-center gap-2.5 transition-all ${activeContext === 'rides' ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
        >
          <Car size={24} strokeWidth={2.5} />
          <span className="text-[20px] font-black tracking-tight">{t('Rides', language)}</span>
          {activeContext === 'rides' && <motion.div layoutId="contextUnderline" className="absolute -bottom-4 left-0 right-0 h-1 bg-black dark:bg-white rounded-full" />}
        </button>
      </div>

      <div className="px-5 pt-6 space-y-8">
        
        {/* SECTION 2: MASSIVE SEARCH PILL */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate('/booking/set-location')}
          className="w-full bg-[#EEEEEE] dark:bg-[#1A1A1A] rounded-full p-4 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all shadow-sm"
        >
          <div className="flex items-center gap-4 flex-1">
            <div className="w-10 h-10 rounded-full bg-transparent flex items-center justify-center">
              <Search size={24} strokeWidth={3} className="text-black dark:text-white" />
            </div>
            <span className="text-[22px] font-black tracking-tight text-[#000000] dark:text-white">
              {t('Where to?', language)}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-[#2A2A2A] px-4 py-2 rounded-full shadow-sm">
            <Clock size={16} strokeWidth={2.5} />
            <span className="text-[14px] font-bold">{t('Now', language)}</span>
            <ChevronRight size={16} />
          </div>
        </motion.div>

        {/* SECTION 3: SUPER-APP MODULES GRID (ACTIVE) */}
        <div className="space-y-4">
          <h3 className="text-[20px] font-black tracking-tight">{t('Core Services', language)}</h3>
          <div className="grid grid-cols-4 gap-3">
            {activeModules.map((module) => (
              <div 
                key={module.id} 
                onClick={() => navigate(module.route)}
                className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform group"
              >
                <div className={`w-full aspect-square rounded-2xl ${module.color} flex items-center justify-center shadow-sm group-hover:shadow-md transition-all`}>
                  <CustomModuleIcon name={module.icon} className="w-8 h-8" />
                </div>
                <span className="text-[12px] font-bold tracking-tight text-center leading-tight">
                  {t(module.label, language)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4: UPCOMING MODULES GRID (GRAYED OUT) */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2">
            <h3 className="text-[20px] font-black tracking-tight text-gray-400 dark:text-gray-600">{t('Coming Soon', language)}</h3>
            <Lock size={16} className="text-gray-400 dark:text-gray-600" />
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-5 px-5">
            {comingSoonModules.map((module) => (
              <div 
                key={module.id} 
                onClick={() => navigate(module.route)}
                className="flex flex-col items-center gap-3 shrink-0 cursor-pointer active:scale-95 transition-transform opacity-50 grayscale"
              >
                <div className="w-[84px] h-[84px] rounded-2xl bg-[#F5F5F5] dark:bg-[#111111] border border-dashed border-gray-300 dark:border-gray-800 flex items-center justify-center">
                  <CustomModuleIcon name={module.icon} className="w-8 h-8 text-gray-400" />
                </div>
                <span className="text-[13px] font-black tracking-tight text-gray-500">{t(module.label, language)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 5: RECENT PLACES (UBER LIST STYLE) */}
        {recentActivity.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-900">
            <h3 className="text-[20px] font-black tracking-tight">{t('Recent Activity', language)}</h3>
            {recentActivity.map((place, idx) => (
              <div key={place.id} className="flex items-center gap-5 group cursor-pointer" onClick={() => navigate(`/tracking/detail/${place.id}`)}>
                <div className="w-12 h-12 rounded-full bg-[#EEEEEE] dark:bg-[#1A1A1A] flex items-center justify-center shrink-0 group-active:bg-gray-200 transition-colors">
                  <Clock size={20} className="text-black dark:text-white" />
                </div>
                <div className="flex-1 border-b border-gray-100 dark:border-gray-900 pb-4">
                  <h4 className="text-[17px] font-bold tracking-tight truncate">
                    {place.dropoffs ? place.dropoffs[place.dropoffs.length-1]?.address?.split(',')[0] : place.dropoff?.address?.split(',')[0] || 'Previous Place'}
                  </h4>
                  <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400 truncate">
                    {place.id.slice(-8).toUpperCase()} • {t(place.vehicleType || 'Standard', language)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SECTION 6: PROMO BANNER (SAFETY MATRIX INTEGRATION) */}
        <div 
          onClick={() => navigate('/safety/guardian')}
          className="relative w-full rounded-[24px] bg-[#111111] dark:bg-[#1A1A1A] p-6 overflow-hidden shadow-lg cursor-pointer group border border-gray-800"
        >
          <div className="relative z-10 space-y-2 max-w-[60%]">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mb-4">
              <Shield size={16} className="text-white" />
            </div>
            <h3 className="text-[22px] font-black text-white leading-tight tracking-tighter">
              {t('Strict Safety. Real Time.', language)}
            </h3>
            <p className="text-[14px] font-bold text-white/80 group-hover:underline flex items-center gap-1">
              {t('Setup Guardian Mode', language)} <ArrowRight size={14} />
            </p>
          </div>
          <div className="absolute right-0 bottom-0 top-0 w-[50%] opacity-90">
             <div className="w-full h-full bg-gradient-to-l from-[#1F5AF6]/20 to-transparent flex items-center justify-center">
                <Shield size={120} strokeWidth={0.5} className="text-white/10 -rotate-12 translate-x-4" />
             </div>
          </div>
        </div>

        {/* SECTION 7: ACTIVE PIPELINE DOCK (ONLY IF ORDERS ACTIVE) */}
        {activeShipmentsCount > 0 && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="fixed bottom-[96px] left-5 right-5 z-[100]"
          >
            <div 
              onClick={() => navigate('/tracking-active')}
              className="bg-black dark:bg-white text-white dark:text-black px-6 py-4 rounded-full flex items-center justify-between shadow-2xl active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
                <span className="text-[15px] font-black tracking-tight">
                  {activeShipmentsCount} {t('Active Order', language)}
                </span>
              </div>
              <ArrowRight size={20} strokeWidth={3} />
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}