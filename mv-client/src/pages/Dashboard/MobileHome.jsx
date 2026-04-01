import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, Send, ArrowRight, Plus, History, 
  Activity, MapPin, Navigation, Clock, ChevronRight, 
  UserCircle2, HelpCircle, CheckCircle2, Truck, 
  AlertCircle, Loader2 
} from 'lucide-react';

// Real Store & Database Integration
import useBookingStore from '../../store/useBookingStore';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, collection, query, where, orderBy, limit } from 'firebase/firestore';

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
 */

export default function MobileHome() {
  const navigate = useNavigate();
  const db = getFirestore();
  const auth = getAuth();
  
  // Real Global State
  const { activeOrder } = useBookingStore();

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
        const userRef = doc(db, 'users', user.uid);
        unsubscribeUser = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setAccountBalance(docSnap.data().walletBalance || 0);
          }
        }, (err) => console.error("Wallet Stream Error:", err));

        // STREAM 2: Real-time Logistics & Activity
        const ordersRef = collection(db, 'orders');
        const ordersQuery = query(
          ordersRef, 
          where('userId', '==', user.uid),
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
        setUserName('Guest');
        setIsLoading(false);
      }
    });

    return () => {
      authUnsubscribe();
      if (unsubscribeUser) unsubscribeUser();
      if (unsubscribeOrders) unsubscribeOrders();
    };
  }, [auth, db]);

  // Dynamic Time Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Status Configuration for Dynamic Icons
  const getStatusConfig = (status) => {
    switch(status?.toLowerCase()) {
      case 'searching': 
      case 'assigned': 
        return { icon: Loader2, bg: 'bg-[#BCE3FF]', text: 'text-[#111111]', spin: true, label: 'Active' };
      case 'picked_up': 
        return { icon: Truck, bg: 'bg-[#BCE3FF]', text: 'text-[#111111]', spin: false, label: 'In Transit' };
      case 'delivered': 
        return { icon: CheckCircle2, bg: 'bg-gray-100', text: 'text-gray-600', spin: false, label: 'Delivered' };
      case 'cancelled': 
        return { icon: AlertCircle, bg: 'bg-red-50', text: 'text-red-500', spin: false, label: 'Cancelled' };
      default: 
        return { icon: Package, bg: 'bg-gray-100', text: 'text-gray-500', spin: false, label: 'Pending' };
    }
  };

  // ============================================================================
  // RENDER UI
  // ============================================================================
  return (
    <div className="min-h-screen bg-[#F2F4F7] text-[#111111] font-sans pb-32 overflow-x-hidden relative">
      
      {/* SECTION 1: Stark Header Navigation (Eradicated Legacy Logo) */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="px-6 pt-16 pb-4 flex items-center justify-between sticky top-0 z-50 bg-[#F2F4F7]/90 backdrop-blur-md"
      >
        <div>
          <h2 className="text-[15px] font-bold text-gray-500 mb-1">{getGreeting()},</h2>
          <h1 className="text-[32px] font-black tracking-tighter leading-none">
            {isLoading ? '...' : userName}
          </h1>
        </div>
        <button 
          onClick={() => navigate('/profile-settings')}
          className="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-gray-200 shadow-[0_4px_15px_rgba(0,0,0,0.05)] active:scale-95 transition-all"
        >
          <UserCircle2 size={24} className="text-gray-600" strokeWidth={2} />
        </button>
      </motion.div>

      {/* SECTION 2: Massively Rounded "Where to?" Action Card & 3-Icon Row */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="px-6 my-6"
      >
        <button 
          onClick={() => navigate('/booking/set-location')}
          className="w-full bg-white rounded-[32px] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.05)] flex flex-col gap-4 active:scale-[0.98] transition-transform text-left relative overflow-hidden mb-8"
        >
          <div className="flex items-center justify-between w-full relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#F6F6F6] rounded-full flex items-center justify-center text-[#111111] shadow-sm shrink-0">
                <LineIconRegistry name="search" size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-[24px] font-black text-[#111111] leading-none mb-1.5 tracking-tight">Where to?</h3>
                <p className="text-[14px] font-bold text-gray-400">Book a new delivery</p>
              </div>
            </div>
            <div className="w-12 h-12 bg-[#111111] rounded-full flex items-center justify-center text-white shadow-md">
              <ArrowRight size={20} strokeWidth={3} />
            </div>
          </div>
        </button>

        {/* 3-Icon Row (Rides, Eats, Scooter) */}
        <div className="flex justify-between px-2">
          <div className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform" onClick={() => navigate('/booking/set-location')}>
            <div className="w-[72px] h-[72px] bg-gray-200/60 rounded-full flex items-center justify-center shrink-0">
              <LineIconRegistry name="car" size={36} color="#111111" strokeWidth={1.5} />
            </div>
            <span className="text-[14px] font-black tracking-tight text-[#111111]">Rides</span>
          </div>
          
          <div className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform">
            <div className="w-[72px] h-[72px] bg-gray-200/60 rounded-full flex items-center justify-center shrink-0">
              <LineIconRegistry name="food" size={36} color="#111111" strokeWidth={1.5} />
            </div>
            <span className="text-[14px] font-black tracking-tight text-[#111111]">Eats</span>
          </div>
          
          <div className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform">
            <div className="w-[72px] h-[72px] bg-gray-200/60 rounded-full flex items-center justify-center shrink-0">
              <LineIconRegistry name="scooter" size={36} color="#111111" strokeWidth={1.5} />
            </div>
            <span className="text-[14px] font-black tracking-tight text-[#111111]">Scooter</span>
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
              onClick={() => navigate('/tracking/live')}
              className="bg-[#BCE3FF] rounded-[32px] p-6 shadow-[0_10px_30px_rgba(188,227,255,0.4)] border border-[#A5D5F9] cursor-pointer active:scale-[0.98] transition-transform relative overflow-hidden"
            >
              <div className="absolute right-6 top-1/2 -translate-y-1/2 w-16 h-16 bg-white/30 rounded-full animate-ping opacity-75" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-14 h-14 bg-white/50 backdrop-blur-sm rounded-full flex items-center justify-center text-[#111111] shadow-sm shrink-0">
                  <Activity size={24} strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <span className="block text-[20px] font-black text-[#111111] leading-tight tracking-tight mb-1">
                    {activeShipmentsCount} Active {activeShipmentsCount === 1 ? 'Shipment' : 'Shipments'}
                  </span>
                  <span className="block text-[13px] font-bold text-[#4A6B85]">Tap to track live routes</span>
                </div>
                <ChevronRight size={24} className="text-[#111111]" strokeWidth={2.5} />
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
          className="bg-white p-5 rounded-[28px] shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-gray-50 flex flex-col items-start gap-4 active:scale-95 transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-[#F6F6F6] flex items-center justify-center text-[#111111]">
            <MapPin size={18} strokeWidth={2.5} />
          </div>
          <span className="text-[15px] font-black tracking-tight">Saved Places</span>
        </button>
        
        <button 
          onClick={() => navigate('/order-history')}
          className="bg-white p-5 rounded-[28px] shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-gray-50 flex flex-col items-start gap-4 active:scale-95 transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-[#F6F6F6] flex items-center justify-center text-[#111111]">
            <History size={18} strokeWidth={2.5} />
          </div>
          <span className="text-[15px] font-black tracking-tight">Orders</span>
        </button>

        <button 
          className="bg-[#111111] p-6 rounded-[32px] shadow-[0_10px_25px_rgba(0,0,0,0.15)] flex flex-col items-start gap-4 active:scale-95 transition-all col-span-2 relative overflow-hidden"
        >
          <div className="flex items-center justify-between w-full relative z-10">
            <div className="flex flex-col text-left">
              <span className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-1">Movyra Wallet</span>
              <span className="text-[36px] font-black text-white leading-none tracking-tighter">
                ₹{isLoading ? '...' : accountBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white backdrop-blur-sm shadow-inner">
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
          <span className="text-[14px] font-black text-gray-400 uppercase tracking-widest">
            Recent Activity
          </span>
          <button onClick={() => navigate('/order-history')} className="text-[14px] font-bold text-[#111111] hover:underline">
            View All
          </button>
        </div>
        
        <div className="space-y-4">
          {isLoading ? (
            [1, 2].map(i => <div key={i} className="h-[120px] bg-white rounded-[32px] animate-pulse border border-gray-50" />)
          ) : recentActivity.length === 0 ? (
            <div className="bg-white rounded-[32px] p-8 text-center border border-gray-50 shadow-[0_4px_15px_rgba(0,0,0,0.03)]">
              <p className="text-[15px] font-bold text-gray-400 leading-relaxed">
                No recent shipments found. Book your first delivery to see updates here.
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
                  className="bg-white rounded-[32px] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-gray-50/50 flex flex-col gap-4 cursor-pointer hover:border-gray-200 active:scale-[0.98] transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${config.bg} ${config.text}`}>
                        <StatusIcon size={20} strokeWidth={2.5} className={config.spin ? 'animate-spin' : ''} />
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-[16px] font-black text-[#111111] tracking-tight truncate block">
                          {order.dropoffs ? order.dropoffs[order.dropoffs.length-1]?.address?.split(',')[0] : order.dropoff?.address?.split(',')[0] || 'Delivery'}
                        </span>
                        <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wide">
                          {order.id.slice(-8).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shrink-0 ${config.bg} ${config.text}`}>
                      {config.label}
                    </span>
                  </div>
                  
                  <div className="flex items-end justify-between mt-1">
                    <div>
                      <p className="text-[14px] font-bold text-gray-500">
                        {formattedDate} • {order.vehicleType || 'Standard'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[24px] font-black text-[#111111] leading-none tracking-tight">
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