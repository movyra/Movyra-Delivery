import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, RotateCcw, BarChart3, Clock, MapPin, 
  Receipt, Download, Loader2, AlertCircle, TrendingUp 
} from 'lucide-react';

// Real Store & Firestore Integration
import useBookingStore from '../../store/useBookingStore';
import { getFirestore, collection, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { auth } from '../../services/firebaseAuth';

// ============================================================================
// PAGE: ORDER HISTORY & EXPENSE TRACKER (STARK MINIMALIST UI)
// Features real-time Firestore synchronization, B2B Expense reporting, 
// and instantaneous multi-stop route reconstruction for rebooking.
// ============================================================================

export default function OrderHistory() {
  const navigate = useNavigate();
  const db = getFirestore();
  
  // Global State
  const { resetBooking, setPickup, addDropoff, setVehicle } = useBookingStore();

  // Local State
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // B2B & View State
  const [isBusinessProfile, setIsBusinessProfile] = useState(false);
  const [viewMode, setViewMode] = useState('history'); // 'history' | 'expenses'

  // ============================================================================
  // LOGIC: REAL-TIME DATA FETCHING & B2B DETECTION
  // ============================================================================
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/auth-login', { replace: true });
      return;
    }

    // 1. Detect if User is a B2B Business Profile
    const checkUserProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && (userDoc.data().isBusiness || userDoc.data().gstNumber)) {
          setIsBusinessProfile(true);
        }
      } catch (err) {
        console.error("Profile Fetch Error:", err);
      }
    };
    checkUserProfile();

    // 2. Real-time strict listener on past orders
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef, 
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setOrders(fetchedOrders);
      setIsLoading(false);
    }, (err) => {
      console.error("Firestore Orders Error:", err);
      // Fallback: If indexes are missing in dev environment, show error.
      if (err.message.includes('index')) {
        setError('Database indexes are building. Please try again in a few minutes.');
      } else {
        setError('Failed to load order history. Please check your connection.');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [navigate, db]);

  // ============================================================================
  // LOGIC: B2B MONTHLY EXPENSE AGGREGATION
  // ============================================================================
  const monthlyStats = useMemo(() => {
    if (orders.length === 0) return [];
    
    const statsMap = {};
    
    orders.forEach(order => {
      // Only aggregate completed/delivered orders
      if (order.status === 'cancelled') return;
      
      const date = order.createdAt?.toDate ? order.createdAt.toDate() : new Date();
      const monthYear = date.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
      const amount = order.pricing?.estimatedPrice || order.totalFare || 0;

      if (!statsMap[monthYear]) {
        statsMap[monthYear] = { month: monthYear, totalSpent: 0, totalDeliveries: 0, dateObj: date };
      }
      
      statsMap[monthYear].totalSpent += amount;
      statsMap[monthYear].totalDeliveries += 1;
    });

    // Convert to array and sort chronologically (newest first)
    return Object.values(statsMap).sort((a, b) => b.dateObj - a.dateObj);
  }, [orders]);

  // ============================================================================
  // LOGIC: REBOOK EXACT ROUTE
  // ============================================================================
  const handleRebook = (order) => {
    // 1. Wipe current booking state cleanly
    resetBooking();

    // 2. Reconstruct the exact route
    if (order.pickup) setPickup(order.pickup);
    if (order.dropoffs && Array.isArray(order.dropoffs)) {
      order.dropoffs.forEach(drop => addDropoff(drop));
    } else if (order.dropoff) {
      // Backwards compatibility for single-stop legacy schema
      addDropoff(order.dropoff);
    }

    // 3. Set the previous vehicle preference
    if (order.vehicleType) setVehicle(order.vehicleType);

    // 4. Fast-track user directly to vehicle confirmation
    navigate('/booking/select-vehicle');
  };

  // ============================================================================
  // RENDER UI
  // ============================================================================
  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-sans relative">
      
      {/* SECTION 1: Top Navigation & Branding */}
      <div className="pt-12 px-6 pb-2 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-50 border-b border-gray-50">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-black hover:bg-gray-100 transition-colors active:scale-95"
        >
          <ChevronLeft size={28} strokeWidth={2.5} />
        </button>
        <div className="w-8 h-8 rounded-md overflow-hidden bg-black flex items-center justify-center">
          <img src="/logo.png" alt="Movyra" className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col px-6 pt-6 pb-32">
        
        {/* SECTION 2: Massive Header & B2B View Toggle */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-[40px] font-black text-black leading-[1.05] tracking-tighter mb-4">
            {viewMode === 'history' ? 'Order \nHistory.' : 'Expense \nReport.'}
          </h1>
          
          {isBusinessProfile && (
            <div className="bg-[#F6F6F6] p-1.5 rounded-full flex relative border-2 border-transparent focus-within:border-black transition-all">
              <div 
                className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-full shadow-sm transition-all duration-300 ease-out"
                style={{ left: viewMode === 'expenses' ? 'calc(50% + 3px)' : '6px' }}
              />
              <button 
                onClick={() => setViewMode('history')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-[14px] font-bold transition-colors z-10 ${viewMode === 'history' ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Clock size={16} strokeWidth={2.5} /> Past Orders
              </button>
              <button 
                onClick={() => setViewMode('expenses')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-[14px] font-bold transition-colors z-10 ${viewMode === 'expenses' ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <BarChart3 size={16} strokeWidth={2.5} /> B2B Expenses
              </button>
            </div>
          )}
        </motion.div>

        {/* Global Error Handle */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="bg-red-50 text-red-600 p-4 rounded-2xl font-bold text-sm flex items-start gap-2 mb-6"
            >
              <AlertCircle size={18} className="shrink-0 mt-0.5" /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* SECTION 3A: ORDER HISTORY VIEW */}
        <AnimatePresence mode="wait">
          {viewMode === 'history' && (
            <motion.div 
              key="history-view"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {isLoading ? (
                // Skeletons
                [1, 2, 3].map(i => <div key={i} className="h-48 bg-[#F6F6F6] rounded-[24px] animate-pulse" />)
              ) : orders.length === 0 ? (
                // Empty State
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Receipt size={24} className="text-gray-400" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-[18px] font-black text-black mb-1">No orders yet</h3>
                  <p className="text-[14px] font-bold text-gray-400">Your past deliveries will appear here.</p>
                </div>
              ) : (
                // Real Order List
                orders.map((order, idx) => {
                  const dateStr = order.createdAt?.toDate 
                    ? order.createdAt.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) 
                    : 'Unknown Date';
                  const dropoffCount = order.dropoffs ? order.dropoffs.length : (order.dropoff ? 1 : 0);
                  const statusColor = order.status === 'cancelled' ? 'text-red-500 bg-red-50' : 
                                      order.status === 'delivered' ? 'text-green-600 bg-green-50' : 
                                      'text-[#276EF1] bg-blue-50';

                  return (
                    <motion.div 
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                      className="bg-white border-2 border-gray-100 p-5 rounded-[24px] shadow-sm hover:border-black transition-colors"
                    >
                      {/* Card Header */}
                      <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-100">
                        <div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-[11px] font-black uppercase tracking-wider mb-2 ${statusColor}`}>
                            {order.status || 'Processing'}
                          </span>
                          <h3 className="text-[16px] font-black text-black leading-none">{dateStr}</h3>
                          <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mt-1 block">
                            {order.vehicleType || 'Delivery'} • {dropoffCount} Drop{dropoffCount !== 1 && 's'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="block text-[20px] font-black text-black">
                            ₹{order.pricing?.estimatedPrice || order.totalFare || 0}
                          </span>
                          {order.pricing?.isGroupDelivery && (
                            <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Group Pool</span>
                          )}
                        </div>
                      </div>

                      {/* Route Preview */}
                      <div className="relative border-l-2 border-dashed border-gray-300 ml-2 pl-4 space-y-3 mb-5">
                        <div className="relative">
                          <div className="absolute -left-[23px] top-1.5 w-2.5 h-2.5 bg-black rounded-full ring-4 ring-white" />
                          <p className="text-[13px] font-bold text-gray-600 truncate">{order.pickup?.address || 'Origin'}</p>
                        </div>
                        <div className="relative">
                          <div className="absolute -left-[23px] top-1.5 w-2.5 h-2.5 bg-white border-4 border-black rounded-sm ring-4 ring-white" />
                          <p className="text-[13px] font-bold text-gray-600 truncate">
                            {order.dropoffs ? order.dropoffs[order.dropoffs.length - 1]?.address : (order.dropoff?.address || 'Destination')}
                          </p>
                        </div>
                      </div>

                      {/* CTA Actions */}
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleRebook(order)}
                          className="flex-1 bg-black text-white py-3 rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-gray-900 active:scale-95 transition-all"
                        >
                          <RotateCcw size={16} strokeWidth={2.5} /> Rebook Exact Route
                        </button>
                        <button 
                          onClick={() => navigate(`/tracking/detail/${order.id}`)}
                          className="w-12 h-12 bg-[#F6F6F6] text-black rounded-xl flex items-center justify-center hover:bg-gray-200 active:scale-95 transition-all shrink-0"
                        >
                          <Receipt size={18} strokeWidth={2.5} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* SECTION 3B: B2B EXPENSE REPORT VIEW */}
        <AnimatePresence mode="wait">
          {viewMode === 'expenses' && (
            <motion.div 
              key="expense-view"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {monthlyStats.length === 0 ? (
                <div className="text-center py-16">
                  <BarChart3 size={32} className="text-gray-300 mx-auto mb-4" strokeWidth={2} />
                  <h3 className="text-[18px] font-black text-black">No Expense Data</h3>
                  <p className="text-[14px] font-bold text-gray-400 mt-1">Complete deliveries to generate reports.</p>
                </div>
              ) : (
                <>
                  {/* Current Month Highlight */}
                  <div className="bg-[#1C1F26] p-6 rounded-[24px] text-white shadow-[0_15px_30px_rgba(0,0,0,0.15)] relative overflow-hidden">
                    <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
                      <TrendingUp size={120} strokeWidth={1} className="-mt-4 -mr-4" />
                    </div>
                    <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                      {monthlyStats[0].month} Total
                    </span>
                    <h2 className="text-[44px] font-black tracking-tighter leading-none mb-4">
                      ₹{monthlyStats[0].totalSpent.toLocaleString('en-IN')}
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="bg-white/10 px-3 py-1.5 rounded-lg text-[13px] font-bold">
                        {monthlyStats[0].totalDeliveries} Deliveries
                      </span>
                      <button className="bg-white text-black px-4 py-1.5 rounded-lg text-[13px] font-bold flex items-center gap-1.5 ml-auto active:scale-95 transition-all">
                        <Download size={14} /> PDF
                      </button>
                    </div>
                  </div>

                  {/* Previous Months Breakdown */}
                  <div>
                    <h3 className="text-[14px] font-bold text-gray-400 uppercase tracking-widest mb-4 ml-2">Previous Months</h3>
                    <div className="space-y-3">
                      {monthlyStats.slice(1).map((stat, idx) => (
                        <div key={idx} className="bg-[#F6F6F6] p-5 rounded-2xl flex items-center justify-between hover:bg-gray-100 transition-colors cursor-pointer">
                          <div>
                            <h4 className="text-[16px] font-black text-black">{stat.month}</h4>
                            <p className="text-[13px] font-bold text-gray-500">{stat.totalDeliveries} Deliveries</p>
                          </div>
                          <div className="text-right">
                            <span className="block text-[18px] font-black text-black">₹{stat.totalSpent.toLocaleString('en-IN')}</span>
                            <span className="text-[11px] font-bold text-[#276EF1] uppercase tracking-wider flex items-center justify-end gap-1 mt-0.5">
                              <Download size={12} /> Statement
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}