import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, Send, ArrowRight, Plus, History, 
  Activity, MapPin, Navigation, Clock, ChevronRight, UserCircle2, HelpCircle, CheckCircle2, Truck, AlertCircle
} from 'lucide-react';

// Real Store & Database Integration
import useBookingStore from '../../store/useBookingStore';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, collection, query, where, orderBy, limit } from 'firebase/firestore';

/**
 * PAGE: MOBILE HOME DASHBOARD (PREMIUM CARD UI)
 * Features: 
 * - Stark Headerless Navigation
 * - Massively Rounded "Where to?" Floating Action Card
 * - Light-Blue Active Dispatch Radar Card
 * - OrderInfoListCard Paradigm for Recent Activity
 * - Real-time Firestore Sync
 */

export default function MobileHome() {
  const navigate = useNavigate();
  const db = getFirestore();
  const auth = getAuth();
  
  // Real Global State
  const { activeOrder } = useBookingStore();

  // Real-time State
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Real Logistics Data States
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
        });

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
            
            // Calculate active pipeline
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

  // Status Icon Formatter
  const getStatusConfig = (status) => {
    switch(status?.toLowerCase()) {
      case 'searching': 
      case 'assigned': 
        return { icon: Loader2, bg: 'bg-[#BCE3FF]', text: 'text-[#111111]', spin: true };
      case 'picked_up': 
        return { icon: Truck, bg: 'bg-[#BCE3FF]', text: 'text-[#111111]', spin: false };
      case 'delivered': 
        return { icon: CheckCircle2, bg: 'bg-gray-100', text: 'text-gray-600', spin: false };
      case 'cancelled': 
        return { icon: AlertCircle, bg: 'bg-red-50', text: 'text-red-500', spin: false };
      default: 
        return { icon: Package, bg: 'bg-gray-100', text: 'text-gray-500', spin: false };
    }
  };

  // ============================================================================
  // RENDER UI
  // ============================================================================
  return (
    <div className="min-h-screen bg-[#F2F4F7] text-[#111111] font-sans pb-32 overflow-x-hidden relative">
      
      {/* SECTION 1: Minimalist Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="px-6 pt-16 pb-4 flex items-center justify-between sticky top-0 z-50 bg-[#F2F4F7]/90 backdrop-blur-md"
      >
        <div>
          <h2 className="text-[15px] font-bold text-gray-500 mb-1">{getGreeting()},</h2>
          <h1 className="text-[32px] font-black tracking-tighter leading-none text-[#111111]">
            {isLoading ? '...' : userName}
          </h1>
        </div>
        <button 
          onClick={() => navigate('/profile-settings')}
          className="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors shadow-sm active:scale-95"
        >
          <UserCircle2 size={24} className="text-gray-600" strokeWidth={2} />
        </button>
      </motion.div>

      {/* SECTION 2: Floating "Where to?" Primary Action Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
        className="px-6 my-6"
      >
        <button 
          onClick={() => navigate('/booking/set-location')}
          className="w-full bg-white rounded-[32px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-gray-50 flex flex-col gap-4 active:scale-[0.98] transition-transform text-left relative overflow-hidden group"
        >
          <div className="flex items-center justify-between w-full relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#F6F6F6] rounded-full flex items-center justify-center text-[#111111] shadow-sm">
                <Search size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-[22px] font-black text-[#111111] leading-none mb-1.5 tracking-tight">Where to?</h3>
                <p className="text-[14px] font-bold text-gray-400">Book a new delivery</p>
              </div>
            </div>
            <div className="w-12 h-12 bg-[#111111] rounded-full flex items-center justify-center text-white shadow-md group-hover:bg-gray-800 transition-colors">
              <ArrowRight size={20} strokeWidth={3} />
            </div>
          </div>
        </button>
      </motion.div>

      {/* SECTION 3: Active Dispatch / Live Shipments (Light Blue Floating Card Paradigm) */}
      <AnimatePresence>
        {activeShipmentsCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            className="px-6 mb-6 overflow-hidden"
          >
            <div 
              onClick={() => navigate('/tracking/live')}
              className="bg-[#BCE3FF] rounded-[32px] p-6 shadow-[0_10px_30px_rgba(188,227,255,0.4)] border border-[#A5D5F9] cursor-pointer active:scale-[0.98] transition-transform relative overflow-hidden"
            >
              {/* Radar pulse effect background */}
              <div className="absolute right-6 top-1/2 -translate-y-1/2 w-16 h-16 bg-white/30 rounded-full animate-ping opacity-75" />
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-14 h-14 bg-white/50 backdrop-blur-sm rounded-full flex items-center justify-center text-[#111111] shadow-sm">
                  <Activity size={24} strokeWidth={2.5} />
                </div>
                <div className="flex-1 text-left">
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

      {/* SECTION 4: Quick Actions Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
        className="px-6 mb-8 grid grid-cols-2 gap-4"
      >
        <button 
          onClick={() => navigate('/profile/addresses')}
          className="bg-white p-5 rounded-[28px] shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-gray-50 flex flex-col items-start gap-4 active:scale-95 transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-[#F6F6F6] flex items-center justify-center text-[#111111]">
            <MapPin size={18} strokeWidth={2.5} />
          </div>
          <span className="text-[15px] font-black text-[#111111] tracking-tight">Saved Places</span>
        </button>
        
        <button 
          onClick={() => navigate('/order-history')}
          className="bg-white p-5 rounded-[28px] shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-gray-50 flex flex-col items-start gap-4 active:scale-95 transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-[#F6F6F6] flex items-center justify-center text-[#111111]">
            <History size={18} strokeWidth={2.5} />
          </div>
          <span className="text-[15px] font-black text-[#111111] tracking-tight">Order History</span>
        </button>

        <button 
          className="bg-[#111111] p-5 rounded-[28px] shadow-[0_10px_20px_rgba(0,0,0,0.1)] flex flex-col items-start gap-4 active:scale-95 transition-all col-span-2 relative overflow-hidden"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col text-left">
              <span className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-1">Movyra Wallet</span>
              <span className="text-[32px] font-black text-white leading-none tracking-tighter">
                ₹{isLoading ? '...' : accountBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white backdrop-blur-sm">
              <Plus size={24} strokeWidth={2.5} />
            </div>
          </div>
        </button>
      </motion.div>

      {/* SECTION 5: Recent Activity (OrderInfoListCard Paradigm) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
        className="px-6"
      >
        <div className="flex items-center justify-between mb-4 px-2">
          <span className="text-[14px] font-black text-gray-400 uppercase tracking-widest">
            Recent Activity
          </span>
          <button onClick={() => navigate('/order-history')} className="text-[14px] font-bold text-[#111111] hover:underline">
            See All
          </button>
        </div>
        
        <div className="space-y-4">
          {isLoading ? (
            // Skeleton Loaders matching new rounded paradigm
            [1, 2].map(i => <div key={i} className="h-[100px] bg-white rounded-[32px] animate-pulse border border-gray-50" />)
          ) : recentActivity.length === 0 ? (
            // Empty State
            <div className="bg-white rounded-[32px] p-8 text-center border border-gray-50 shadow-[0_4px_15px_rgba(0,0,0,0.03)]">
              <p className="text-[15px] font-bold text-gray-400 leading-relaxed">
                No recent shipments found. Tap 'Where to?' to book your first delivery.
              </p>
            </div>
          ) : (
            // Live Data Feed (OrderInfoListCard style)
            recentActivity.map(order => {
              const config = getStatusConfig(order.status);
              const Icon = config.icon;
              const dateObj = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
              const formattedDate = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
              
              return (
                <div 
                  key={order.id} 
                  onClick={() => navigate(order.status === 'delivered' || order.status === 'cancelled' ? `/order-history/detail/${order.id}` : `/tracking/detail/${order.id}`)}
                  className="bg-white rounded-[32px] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-gray-50/50 flex flex-col gap-4 cursor-pointer hover:border-gray-200 active:scale-[0.98] transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 overflow-hidden pr-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${config.bg} ${config.text}`}>
                        <Icon size={18} strokeWidth={2.5} className={config.spin ? 'animate-spin' : ''} />
                      </div>
                      <span className="text-[15px] font-black text-[#111111] tracking-tight truncate">
                        {order.dropoffs ? order.dropoffs[order.dropoffs.length-1]?.address?.split(',')[0] : order.dropoff?.address?.split(',')[0] || 'Delivery'}
                      </span>
                    </div>
                    <button className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                      <ChevronRight size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                  
                  <div className="flex items-end justify-between mt-1 pl-[52px]">
                    <div className="flex-1 pr-4">
                      <p className={`text-[14px] font-bold leading-tight capitalize ${order.status === 'cancelled' ? 'text-red-500' : 'text-[#111111]'}`}>
                        {order.status?.replace('_', ' ') || 'Processing'}
                      </p>
                      <p className="text-[12px] font-medium text-gray-400 mt-1">
                        {formattedDate} • {order.vehicleType || 'Standard'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[20px] font-black text-[#111111] leading-none tracking-tight">
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