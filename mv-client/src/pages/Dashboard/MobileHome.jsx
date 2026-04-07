import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, Send, ArrowRight, Plus, History, 
  Activity, MapPin, Navigation, Clock, ChevronRight, 
  UserCircle2, HelpCircle, CheckCircle2, Truck, 
  AlertCircle, Loader2 
} from 'lucide-react';

// Real Store, Prefs & Database Integration
import useBookingStore from '../../store/useBookingStore';
import usePreferencesStore from '../../store/usePreferencesStore';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { t } from '../../utils/translations';

// Premium Design System Components
import LineIconRegistry from '../../components/Icons/LineIconRegistry';

/**
 * PAGE: MOBILE HOME DASHBOARD (PREMIUM CARD UI)
 * Features: 
 * - Stark Headerless Navigation (Pure Typography)
 * - Massively Rounded "Where to?" Floating Action Card
 * - Exact 3-Icon Row (Rides, Eats, Scooter)
 * - Light-Blue Active Dispatch Banner
 * - OrderInfoListCard Paradigm for Recent Activity
 * - Real-time Firestore Sync for Wallet & Orders
 * - DARK MODE & i18n: 100% Global compliance wired
 */

export default function MobileHome() {
  const navigate = useNavigate();
  const db = getFirestore();
  const auth = getAuth();
  
  // Real Global State
  const { activeOrder } = useBookingStore();
  const { language } = usePreferencesStore();

  // Real-time Data States
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeShipmentsCount, setActiveShipmentsCount] = useState(0);
  const [accountBalance, setAccountBalance] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);

  // ============================================================================
  // LOGIC: REAL-TIME FIRESTORE DATA STREAMS
  // ============================================================================
  useEffect(() => {
    let unsubscribeUser;
    let unsubscribeOrders;

    const authUnsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const firstName = user.displayName ? user.displayName.split(' ')[0] : 'User';
        setUserName(firstName);

        // STREAM 1: Real-time Wallet Balance
        const userRef = doc(db, 'artifacts', typeof window.__app_id !== 'undefined' ? window.__app_id : 'default-app-id', 'users', user.uid);
        unsubscribeUser = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setAccountBalance(docSnap.data().walletBalance || 0);
          }
        }, (err) => console.error("Wallet Stream Error:", err));

        // STREAM 2: Real-time Logistics & Activity
        const ordersRef = collection(db, 'artifacts', typeof window.__app_id !== 'undefined' ? window.__app_id : 'default-app-id', 'users', user.uid, 'orders');
        const ordersQuery = query(
          ordersRef, 
          orderBy('createdAt', 'desc'),
          limit(5)
        );

        unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
          const fetchedOrders = [];
          let activeCount = 0;
          
          snapshot.docs.forEach(docSnap => {
            const data = docSnap.data();
            fetchedOrders.push({ id: docSnap.id, ...data });
            
            // Calculate active pipeline statuses
            if (['searching', 'assigned', 'picked_up'].includes(data.status)) {
              activeCount++;
            }
          });

          setRecentActivity(fetchedOrders);
          setActiveShipmentsCount(activeCount);
          setIsLoading(false);
        }, (error) => {
          console.error("Orders Stream Error:", error);
          setIsLoading(false);
        });

      } else {
        setUserName(t('Guest', language));
        setIsLoading(false);
      }
    });

    return () => {
      authUnsubscribe();
      if (unsubscribeUser) unsubscribeUser();
      if (unsubscribeOrders) unsubscribeOrders();
    };
  }, [auth, db, language]);

  // Dynamic Time Greeting (Translated)
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('Good morning', language);
    if (hour < 18) return t('Good afternoon', language);
    return t('Good evening', language);
  };

  // Status Configuration for Dynamic Icons (Dark Mode & i18n compliant)
  const getStatusConfig = (status) => {
    switch(status?.toLowerCase()) {
      case 'searching': 
      case 'assigned': 
        return { icon: Loader2, bg: 'bg-[#BCE3FF] dark:bg-[#1A365D]', text: 'text-[#111111] dark:text-[#E2F1FF]', spin: true, label: t('Active', language) };
      case 'picked_up': 
        return { icon: Truck, bg: 'bg-[#BCE3FF] dark:bg-[#1A365D]', text: 'text-[#111111] dark:text-[#E2F1FF]', spin: false, label: t('In Transit', language) };
      case 'delivered': 
        return { icon: CheckCircle2, bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-300', spin: false, label: t('Delivered', language) };
      case 'cancelled': 
        return { icon: AlertCircle, bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-500 dark:text-red-400', spin: false, label: t('Cancelled', language) };
      default: 
        return { icon: Package, bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500 dark:text-gray-400', spin: false, label: t('Pending', language) };
    }
  };

  // ============================================================================
  // RENDER UI
  // ============================================================================
  return (
    <div className="min-h-[100dvh] bg-[#F2F4F7] dark:bg-[#111111] text-[#111111] dark:text-[#F6F6F6] font-sans pb-32 overflow-x-hidden relative transition-colors duration-300">
      
      {/* SECTION 1: Stark Header Navigation */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="px-6 pt-16 pb-4 flex items-center justify-between sticky top-0 z-50 bg-[#F2F4F7]/90 dark:bg-[#111111]/90 backdrop-blur-md transition-colors duration-300"
      >
        <div>
          <h2 className="text-[15px] font-bold text-gray-500 dark:text-gray-400 mb-1 transition-colors">{getGreeting()},</h2>
          <h1 className="text-[32px] font-black tracking-tighter leading-none text-[#111111] dark:text-white transition-colors">
            {isLoading ? '...' : userName}
          </h1>
        </div>
        <button 
          onClick={() => navigate('/profile-settings')}
          className="w-[46px] h-[46px] rounded-full bg-white dark:bg-[#222222] flex items-center justify-center border border-gray-200 dark:border-gray-800 shadow-[0_4px_15px_rgba(0,0,0,0.05)] active:scale-95 transition-all shrink-0"
        >
          <UserCircle2 size={24} className="text-gray-600 dark:text-gray-300 transition-colors" strokeWidth={2} />
        </button>
      </motion.div>

      {/* SECTION 2: Massively Rounded "Where to?" Action Card & 3-Icon Row */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="px-6 my-6"
      >
        <button 
          onClick={() => navigate('/booking/set-location')}
          className="w-full bg-white dark:bg-[#1A1A1A] border border-gray-50/50 dark:border-[#333333] rounded-[32px] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] flex flex-col gap-4 active:scale-[0.98] transition-all text-left relative overflow-hidden mb-8"
        >
          <div className="flex items-center justify-between w-full relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#F6F6F6] dark:bg-[#2A2A2A] rounded-full flex items-center justify-center text-[#111111] dark:text-white shadow-sm shrink-0 transition-colors">
                <LineIconRegistry name="search" size={24} color="currentColor" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-[24px] font-black text-[#111111] dark:text-white leading-none mb-1.5 tracking-tight transition-colors">{t('Where to?', language)}</h3>
                <p className="text-[14px] font-bold text-gray-400 dark:text-gray-500 transition-colors">{t('Book a new delivery', language)}</p>
              </div>
            </div>
            <div className="w-12 h-12 bg-[#111111] dark:bg-white rounded-full flex items-center justify-center text-white dark:text-[#111111] shadow-md transition-colors shrink-0">
              <ArrowRight size={20} strokeWidth={3} />
            </div>
          </div>
        </button>

        {/* 3-Icon Row (Rides, Eats, Scooter) */}
        <div className="flex justify-between px-2 text-[#111111] dark:text-white">
          <div className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform" onClick={() => navigate('/booking/set-location')}>
            <div className="w-[72px] h-[72px] bg-gray-200/60 dark:bg-gray-800 rounded-full flex items-center justify-center shrink-0 transition-colors">
              <LineIconRegistry name="car" size={36} color="currentColor" strokeWidth={1.5} />
            </div>
            <span className="text-[14px] font-black tracking-tight">{t('Rides', language)}</span>
          </div>
          
          <div className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform">
            <div className="w-[72px] h-[72px] bg-gray-200/60 dark:bg-gray-800 rounded-full flex items-center justify-center shrink-0 transition-colors">
              <LineIconRegistry name="food" size={36} color="currentColor" strokeWidth={1.5} />
            </div>
            <span className="text-[14px] font-black tracking-tight">{t('Eats', language)}</span>
          </div>
          
          <div className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform">
            <div className="w-[72px] h-[72px] bg-gray-200/60 dark:bg-gray-800 rounded-full flex items-center justify-center shrink-0 transition-colors">
              <LineIconRegistry name="scooter" size={36} color="currentColor" strokeWidth={1.5} />
            </div>
            <span className="text-[14px] font-black tracking-tight">{t('Scooter', language)}</span>
          </div>
        </div>
      </motion.div>

      {/* SECTION 3: Active Dispatch (Uber-Style Floating Pill) */}
      <AnimatePresence>
        {activeShipmentsCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            className="px-6 mb-6"
          >
            <div 
              onClick={() => navigate('/tracking-active')}
              className="bg-[#BCE3FF] dark:bg-[#1A365D] rounded-[32px] p-6 shadow-[0_10px_30px_rgba(188,227,255,0.4)] dark:shadow-none border border-[#A5D5F9] dark:border-[#2A4365] cursor-pointer active:scale-[0.98] transition-all relative overflow-hidden"
            >
              <div className="absolute right-6 top-1/2 -translate-y-1/2 w-16 h-16 bg-white/30 dark:bg-[#BCE3FF]/10 rounded-full animate-ping opacity-75" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-14 h-14 bg-white/50 dark:bg-[#111111]/30 backdrop-blur-sm rounded-full flex items-center justify-center text-[#111111] dark:text-white shadow-sm shrink-0 transition-colors">
                  <Activity size={24} strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <span className="block text-[20px] font-black text-[#111111] dark:text-white leading-tight tracking-tight mb-1 transition-colors">
                    {activeShipmentsCount} {t('Active', language)} {activeShipmentsCount === 1 ? t('Shipment', language) : t('Shipments', language)}
                  </span>
                  <span className="block text-[13px] font-bold text-[#4A6B85] dark:text-[#E2F1FF] transition-colors">{t('Tap to track live routes', language)}</span>
                </div>
                <ChevronRight size={24} className="text-[#111111] dark:text-white transition-colors" strokeWidth={2.5} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION 4: Quick Action Grid & Wallet */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="px-6 mb-8 grid grid-cols-2 gap-4"
      >
        <button 
          onClick={() => navigate('/profile/addresses')}
          className="bg-white dark:bg-[#1A1A1A] p-5 rounded-[28px] shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-gray-50 dark:border-[#333333] flex flex-col items-start gap-4 active:scale-95 transition-all text-[#111111] dark:text-white"
        >
          <div className="w-10 h-10 rounded-full bg-[#F6F6F6] dark:bg-[#2A2A2A] flex items-center justify-center text-[#111111] dark:text-white transition-colors">
            <MapPin size={18} strokeWidth={2.5} />
          </div>
          <span className="text-[15px] font-black tracking-tight">{t('Saved Places', language)}</span>
        </button>
        
        <button 
          onClick={() => navigate('/order-history')}
          className="bg-white dark:bg-[#1A1A1A] p-5 rounded-[28px] shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-gray-50 dark:border-[#333333] flex flex-col items-start gap-4 active:scale-95 transition-all text-[#111111] dark:text-white"
        >
          <div className="w-10 h-10 rounded-full bg-[#F6F6F6] dark:bg-[#2A2A2A] flex items-center justify-center text-[#111111] dark:text-white transition-colors">
            <History size={18} strokeWidth={2.5} />
          </div>
          <span className="text-[15px] font-black tracking-tight">{t('Orders', language)}</span>
        </button>

        <button 
          className="bg-[#111111] dark:bg-[#000000] p-6 rounded-[32px] shadow-[0_10px_25px_rgba(0,0,0,0.15)] flex flex-col items-start gap-4 active:scale-95 transition-all col-span-2 relative overflow-hidden dark:border dark:border-[#333333]"
        >
          <div className="flex items-center justify-between w-full relative z-10">
            <div className="flex flex-col text-left">
              <span className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('Movyra Wallet', language)}</span>
              <span className="text-[36px] font-black text-white leading-none tracking-tighter">
                ₹{isLoading ? '...' : accountBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white backdrop-blur-sm shadow-inner shrink-0">
              <Plus size={28} strokeWidth={2.5} />
            </div>
          </div>
        </button>
      </motion.div>

      {/* SECTION 5: Recent Activity (OrderInfoListCard Aesthetic) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
        className="px-6"
      >
        <div className="flex items-center justify-between mb-4 px-2">
          <span className="text-[14px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-colors">
            {t('Recent Activity', language)}
          </span>
          <button onClick={() => navigate('/order-history')} className="text-[14px] font-bold text-[#111111] dark:text-white hover:underline transition-colors">
            {t('View All', language)}
          </button>
        </div>
        
        <div className="space-y-4">
          {isLoading ? (
            [1, 2].map(i => <div key={i} className="h-[120px] bg-white dark:bg-[#1A1A1A] rounded-[32px] animate-pulse border border-gray-50 dark:border-[#333333] transition-colors" />)
          ) : recentActivity.length === 0 ? (
            <div className="bg-white dark:bg-[#1A1A1A] rounded-[32px] p-8 text-center border border-gray-50/50 dark:border-[#333333] shadow-[0_4px_15px_rgba(0,0,0,0.03)] transition-colors">
              <p className="text-[15px] font-bold text-gray-400 dark:text-gray-500 leading-relaxed transition-colors">
                {t('No recent shipments found. Book your first delivery to see updates here.', language)}
              </p>
            </div>
          ) : (
            recentActivity.map(order => {
              const config = getStatusConfig(order.status);
              const StatusIcon = config.icon;
              const dateObj = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
              const formattedDate = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
              
              return (
                <div 
                  key={order.id} 
                  onClick={() => navigate(order.status === 'delivered' || order.status === 'cancelled' ? `/order-history/detail/${order.id}` : `/tracking/detail/${order.id}`)}
                  className="bg-white dark:bg-[#1A1A1A] rounded-[32px] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-gray-50/50 dark:border-[#333333] flex flex-col gap-4 cursor-pointer hover:border-gray-200 dark:hover:border-gray-600 active:scale-[0.98] transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${config.bg} ${config.text}`}>
                        <StatusIcon size={20} strokeWidth={2.5} className={config.spin ? 'animate-spin' : ''} />
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-[16px] font-black text-[#111111] dark:text-white tracking-tight truncate block transition-colors">
                          {order.dropoffs ? order.dropoffs[order.dropoffs.length-1]?.address?.split(',')[0] : order.dropoff?.address?.split(',')[0] || 'Delivery'}
                        </span>
                        <span className="text-[12px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide transition-colors">
                          {order.id.slice(-8).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shrink-0 transition-colors ${config.bg} ${config.text}`}>
                      {config.label}
                    </span>
                  </div>
                  
                  <div className="flex items-end justify-between mt-1">
                    <div>
                      <p className="text-[14px] font-bold text-gray-500 dark:text-gray-400 transition-colors">
                        {formattedDate} • {t(order.vehicleType || 'Standard', language)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[24px] font-black text-[#111111] dark:text-white leading-none tracking-tight transition-colors">
                        ₹{order.pricing?.estimatedPrice || order.totalFare || 0}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>

    </div>
  );
}