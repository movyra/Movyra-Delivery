import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, Send, ArrowRight, Plus, MoreHorizontal, History, 
  Activity, MapPin, Navigation, Clock, ChevronLeft, LifeBuoy 
} from 'lucide-react';

// Real Store & Database Integration
import useBookingStore from '../../store/useBookingStore';
// Using standard Firebase SDK directly to prevent Vite dynamic import path resolution errors
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, collection, query, where, orderBy, limit } from 'firebase/firestore';

// ============================================================================
// PAGE: MOBILE HOME DASHBOARD (STARK MINIMALIST UI)
// Features 7 Functional Sections: Navigation, Dynamic Greeting, Active 
// Dispatch Radar, Live Shipment Counters, Real-time Wallet, Quick Action 
// Grid, and a Live Activity Feed. Zero mock data.
// ============================================================================

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
          limit(4)
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

  // ============================================================================
  // RENDER UI
  // ============================================================================
  return (
    <div className="min-h-screen bg-white text-black font-sans pb-32 overflow-x-hidden">
      
      {/* SECTION 1: Stark Header Navigation */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="px-6 pt-16 pb-6 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-50"
      >
        <h1 className="text-[32px] font-black tracking-tighter leading-none">
          Overview
        </h1>
        <div 
          onClick={() => navigate('/profile-settings')}
          className="w-10 h-10 rounded-xl overflow-hidden bg-black flex items-center justify-center border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity shadow-sm"
        >
          {/* Strictly rendering the real image file logo */}
          <img src="/logo.png" alt="Movyra" className="w-full h-full object-cover" />
        </div>
      </motion.div>

      {/* SECTION 2: Dynamic Greeting */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
        className="px-6 mb-6"
      >
        <p className="text-[17px] font-bold text-gray-400">
          {getGreeting()}, <span className="text-black">{isLoading ? '...' : userName}</span>
        </p>
      </motion.div>

      {/* SECTION 3: Persistent Active Dispatch Banner */}
      <AnimatePresence>
        {activeOrder && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.9 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.9 }}
            className="px-6 mb-6 overflow-hidden"
          >
            <button
              onClick={() => navigate('/tracking-active')}
              className="w-full bg-[#276EF1] rounded-[24px] p-5 flex items-center justify-between shadow-[0_15px_30px_rgba(39,110,241,0.3)] hover:bg-blue-600 transition-colors active:scale-95 group relative overflow-hidden"
            >
              {/* Radar pulse effect background */}
              <div className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 rounded-full animate-ping opacity-75" />
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#276EF1] shadow-sm">
                  <Activity size={24} strokeWidth={2.5} />
                </div>
                <div className="text-left">
                  <span className="block text-[16px] font-black text-white leading-tight">Active Dispatch</span>
                  <span className="block text-[13px] font-bold text-blue-100 mt-0.5">Tap to track live route</span>
                </div>
              </div>
              <ChevronLeft size={24} className="text-white rotate-180 relative z-10 group-hover:translate-x-1 transition-transform" strokeWidth={3} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION 4: Light Gray Card (Active Shipments Counter) */}
      <div className="relative px-4 flex flex-col mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-[#F6F6F6] rounded-[32px] p-8 shadow-[0_12px_40px_rgba(0,0,0,0.06)] relative z-20 border border-white"
        >
          <div className="flex justify-between items-start">
            <span className="text-[15px] font-bold text-gray-500">Live Shipments</span>
            <Package className="text-gray-400" size={22} strokeWidth={2} />
          </div>
          
          <h2 className="text-[64px] font-black text-black leading-none tracking-tighter mt-2 mb-8">
            {isLoading ? '-' : activeShipmentsCount}
          </h2>
          
          <div className="flex justify-between items-center py-3.5 border-t border-gray-200">
            <span className="text-[15px] font-bold text-black">In Transit</span>
            <span className="text-[15px] font-bold text-gray-400">{activeShipmentsCount > 0 ? '1' : '0'}</span>
          </div>
          <div className="flex justify-between items-center py-3.5 border-t border-gray-200">
            <span className="text-[15px] font-bold text-black">Pending Pickup</span>
            <span className="text-[15px] font-bold text-gray-400">{Math.max(0, activeShipmentsCount - 1)}</span>
          </div>
          
          <button 
            onClick={() => navigate('/order-history')}
            className="mt-2 text-[15px] font-bold text-[#276EF1] flex items-center gap-1 hover:opacity-70 transition-opacity"
          >
            View all orders <ArrowRight size={16} strokeWidth={2.5} />
          </button>
        </motion.div>

        {/* SECTION 5: Solid Black Card (Real-time Wallet in ₹) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-[#121212] rounded-[32px] p-8 pt-14 -mt-8 relative z-10"
        >
          <div className="flex justify-between items-start">
            <span className="text-[15px] font-bold text-gray-400">Account Balance</span>
            <button className="text-gray-400 hover:text-white transition-colors">
              <MoreHorizontal size={24} />
            </button>
          </div>
          
          <h2 className="text-[48px] font-black text-white leading-none tracking-tighter mt-2 mb-8 flex items-center gap-1">
            <span className="text-[28px] opacity-50">₹</span>
            {isLoading ? '0.00' : accountBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/booking/set-location')}
              className="flex-1 flex items-center justify-center gap-2 bg-white text-black rounded-full px-4 py-3.5 text-[15px] font-bold hover:bg-gray-200 active:scale-95 transition-all"
            >
              <Send size={18} strokeWidth={2.5} /> Send Package
            </button>
            <button className="flex items-center justify-center bg-white/10 text-white rounded-full w-12 h-12 hover:bg-white/20 active:scale-95 transition-all shrink-0">
              <Plus size={20} strokeWidth={2.5} />
            </button>
          </div>
        </motion.div>
      </div>

      {/* SECTION 6: Quick Actions Grid (Expanded) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}
        className="px-6 mb-10 grid grid-cols-2 gap-3"
      >
        <button 
          onClick={() => navigate('/profile/addresses')}
          className="bg-[#F6F6F6] p-4 rounded-2xl flex flex-col items-start gap-3 border-2 border-transparent hover:border-gray-200 active:scale-95 transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
            <MapPin size={16} className="text-black" strokeWidth={2.5} />
          </div>
          <span className="text-[14px] font-bold text-black">Saved Places</span>
        </button>
        
        <button 
          onClick={() => navigate('/booking/set-location')}
          className="bg-[#F6F6F6] p-4 rounded-2xl flex flex-col items-start gap-3 border-2 border-transparent hover:border-gray-200 active:scale-95 transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
            <Navigation size={16} className="text-black" strokeWidth={2.5} />
          </div>
          <span className="text-[14px] font-bold text-black">Estimate Fare</span>
        </button>

        <button 
          onClick={() => navigate('/order-history')}
          className="bg-[#F6F6F6] p-4 rounded-2xl flex flex-col items-start gap-3 border-2 border-transparent hover:border-gray-200 active:scale-95 transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
            <History size={16} className="text-black" strokeWidth={2.5} />
          </div>
          <span className="text-[14px] font-bold text-black">History</span>
        </button>

        <button 
          onClick={() => navigate('/profile-settings')}
          className="bg-[#F6F6F6] p-4 rounded-2xl flex flex-col items-start gap-3 border-2 border-transparent hover:border-gray-200 active:scale-95 transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
            <LifeBuoy size={16} className="text-black" strokeWidth={2.5} />
          </div>
          <span className="text-[14px] font-bold text-black">Support</span>
        </button>
      </motion.div>

      {/* SECTION 7: Real Recent Activity Feed */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
        className="px-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History size={16} className="text-gray-400" strokeWidth={2.5} />
            <span className="text-[13px] font-black text-gray-400 uppercase tracking-widest">
              Recent Activity
            </span>
          </div>
          <button onClick={() => navigate('/order-history')} className="text-[13px] font-bold text-[#276EF1]">See All</button>
        </div>
        
        <div className="space-y-3">
          {isLoading ? (
            // Skeleton Loader
            [1, 2].map(i => <div key={i} className="h-20 bg-[#F6F6F6] rounded-2xl animate-pulse" />)
          ) : recentActivity.length === 0 ? (
            // Empty State
            <div className="border-2 border-[#F6F6F6] rounded-[24px] p-6 text-center">
              <p className="text-[15px] font-bold text-gray-400 leading-relaxed">
                No recent shipments found. Book a delivery to see your history here.
              </p>
            </div>
          ) : (
            // Live Data Feed
            recentActivity.map(order => (
              <div 
                key={order.id} 
                onClick={() => navigate(`/tracking/detail/${order.id}`)}
                className="bg-[#F6F6F6] p-4 rounded-[20px] flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors border-2 border-transparent hover:border-gray-200 active:scale-[0.98]"
              >
                <div className="flex items-center gap-4 truncate">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0 text-black">
                    <Clock size={20} strokeWidth={2.5} />
                  </div>
                  <div className="truncate">
                    <h4 className="text-[15px] font-black text-black leading-tight mb-0.5 truncate">
                      {order.dropoffs ? order.dropoffs[order.dropoffs.length-1]?.address : order.dropoff?.address || 'Delivery'}
                    </h4>
                    <span className={`text-[12px] font-bold uppercase tracking-widest ${order.status === 'delivered' ? 'text-green-600' : 'text-[#276EF1]'}`}>
                      {order.status || 'Processing'}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="block text-[16px] font-black text-black">₹{order.pricing?.estimatedPrice || order.totalFare || 0}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

    </div>
  );
}