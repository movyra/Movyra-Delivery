import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ArrowRight, Clock, ChevronRight, 
  MapPin, Star, Shield, Car, Package, 
  Calendar, Key, Plane, Zap, Info, Plus
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
 * PAGE: MOBILE HOME DASHBOARD (PREMIUM UBER-STYLE UI)
 * Features: 
 * - Contextual Toggle: Switch between 'Rides' and 'Delivery' context.
 * - Massive Search Card: Exact replica of the "Where to?" pill interaction.
 * - Suggestions Grid: Horizontal scrolling service registry.
 * - Promo Carousel: Illustrative "Ways to plan" cards.
 * - Dual-Path Engine: Restores legacy bookings while syncing new ones.
 */

const getAppId = () => {
  if (typeof window !== 'undefined' && window.__app_id) return window.__app_id;
  if (typeof __app_id !== 'undefined') return __app_id;
  return 'default-app-id';
};

export default function MobileHome() {
  const navigate = useNavigate();
  const db = getFirestore();
  const auth = getAuth();
  
  // Real Global State
  const { language } = usePreferencesStore();
  const [activeContext, setActiveContext] = useState('rides'); // 'rides' | 'delivery'

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

  return (
    <div className="min-h-[100dvh] bg-white dark:bg-[#000000] text-[#000000] dark:text-[#FFFFFF] font-sans pb-32 overflow-x-hidden relative transition-colors duration-300">
      
      {/* SECTION 1: CONTEXT TOGGLE HEADER */}
      <div className="px-6 pt-14 pb-4 flex items-center gap-8 sticky top-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-900 transition-all">
        <button 
          onClick={() => setActiveContext('rides')}
          className={`relative py-2 flex items-center gap-2.5 transition-all ${activeContext === 'rides' ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
        >
          <Car size={24} strokeWidth={2.5} />
          <span className="text-[20px] font-black tracking-tight">{t('Rides', language)}</span>
          {activeContext === 'rides' && <motion.div layoutId="contextUnderline" className="absolute -bottom-4 left-0 right-0 h-1 bg-black dark:bg-white rounded-full" />}
        </button>

        <button 
          onClick={() => setActiveContext('delivery')}
          className={`relative py-2 flex items-center gap-2.5 transition-all ${activeContext === 'delivery' ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
        >
          <Package size={24} strokeWidth={2.5} />
          <span className="text-[20px] font-black tracking-tight">{t('Delivery', language)}</span>
          {activeContext === 'delivery' && <motion.div layoutId="contextUnderline" className="absolute -bottom-4 left-0 right-0 h-1 bg-black dark:bg-white rounded-full" />}
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

        {/* SECTION 3: RECENT PLACES (UBER LIST STYLE) */}
        <div className="space-y-4">
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

        {/* SECTION 4: SUGGESTIONS GRID (HORIZONTAL SCROLL) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[20px] font-black tracking-tight">{t('Suggestions', language)}</h3>
            <button className="text-[14px] font-bold text-gray-500 hover:text-black dark:hover:text-white">{t('See all', language)}</button>
          </div>
          
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-5 px-5">
            {[
              { label: 'Ride', icon: 'car', color: 'bg-[#EEEEEE]' },
              { label: 'Package', icon: 'box', color: 'bg-[#EEEEEE]' },
              { label: 'Reserve', icon: 'calendar', color: 'bg-[#EEEEEE]' },
              { label: 'Rent', icon: 'key', color: 'bg-[#EEEEEE]' },
              { label: 'Travel', icon: 'plane', color: 'bg-[#EEEEEE]' }
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-3 shrink-0 cursor-pointer active:scale-95 transition-transform">
                <div className={`w-[84px] h-[84px] rounded-2xl ${item.color} dark:bg-[#1A1A1A] flex items-center justify-center shadow-sm`}>
                  <LineIconRegistry name={item.icon} size={42} strokeWidth={1.5} color="currentColor" />
                </div>
                <span className="text-[13px] font-black tracking-tight">{t(item.label, language)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 5: PROMO BANNER (ILLUSTRATIVE) */}
        <div className="relative w-full rounded-[24px] bg-[#1F5AF6] p-6 overflow-hidden shadow-lg cursor-pointer group">
          <div className="relative z-10 space-y-2 max-w-[60%]">
            <h3 className="text-[22px] font-black text-white leading-tight tracking-tighter">
              {t('We stand for safety.', language)}
            </h3>
            <p className="text-[14px] font-bold text-white/80 group-hover:underline flex items-center gap-1">
              {t('Safety Tools', language)} <ArrowRight size={14} />
            </p>
          </div>
          <div className="absolute right-0 bottom-0 top-0 w-[45%] opacity-90">
             <div className="w-full h-full bg-gradient-to-l from-white/10 to-transparent flex items-center justify-center">
                <Shield size={100} strokeWidth={1} className="text-white/20 -rotate-12" />
             </div>
          </div>
        </div>

        {/* SECTION 6: WAYS TO PLAN (CAROUSEL) */}
        <div className="space-y-4">
          <h3 className="text-[20px] font-black tracking-tight">{t('Ways to plan with Movyra', language)}</h3>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-5 px-5">
            
            <div className="w-[280px] shrink-0 space-y-3 cursor-pointer">
              <div className="w-full h-[140px] rounded-[24px] bg-[#91C6F9] relative overflow-hidden">
                <Plane size={120} className="absolute -bottom-5 -right-5 text-[#BCE3FF] -rotate-12" />
              </div>
              <div className="px-1">
                <h4 className="text-[16px] font-black tracking-tight flex items-center gap-2">
                  {t('Trip to airport', language)} <ArrowRight size={16} />
                </h4>
                <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400">
                  {t('Schedule your pickup up to 90 days in advance.', language)}
                </p>
              </div>
            </div>

            <div className="w-[280px] shrink-0 space-y-3 cursor-pointer">
              <div className="w-full h-[140px] rounded-[24px] bg-[#FFDAB9] relative overflow-hidden">
                <Zap size={120} className="absolute -bottom-5 -right-5 text-[#FFE4B5] -rotate-12" />
              </div>
              <div className="px-1">
                <h4 className="text-[16px] font-black tracking-tight flex items-center gap-2">
                  {t('Go green', language)} <ArrowRight size={16} />
                </h4>
                <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400">
                  {t('Help the planet with Movyra Green electric rides.', language)}
                </p>
              </div>
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
                  {activeShipmentsCount} {t('Active Trip', language)}
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