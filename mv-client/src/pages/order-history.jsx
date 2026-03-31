import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Search, Filter, Package, Truck, CheckCircle2, AlertCircle, Loader2, XCircle } from 'lucide-react';

// Real Database Integration
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// ============================================================================
// PAGE: ORDER HISTORY & SHIPMENTS (MOVYRA LIGHT THEME)
// Replaces the old dark mode list with a premium tabbed UI.
// Features 6 Functional Sections: Real-time Firestore Engine, Header, 
// Search/Filter, Stats Dashboard, Animated Tabs, and Dynamic Skeleton List.
// ============================================================================

const SkeletonCard = () => (
  <div className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-4 animate-pulse">
    <div className="w-14 h-14 rounded-[18px] bg-gray-100 flex-shrink-0"></div>
    <div className="flex-1 space-y-3 py-1">
      <div className="h-4 bg-gray-200 rounded-md w-1/2"></div>
      <div className="h-3 bg-gray-100 rounded-md w-3/4"></div>
    </div>
    <div className="flex flex-col items-end space-y-3 flex-shrink-0">
      <div className="h-4 bg-gray-200 rounded-md w-16"></div>
      <div className="h-3 bg-gray-100 rounded-md w-12"></div>
    </div>
  </div>
);

export default function OrderHistory() {
  const navigate = useNavigate();
  const db = getFirestore();
  const auth = getAuth();

  // SECTION 1: Real-time Data Engine & State Management
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // FEATURE 1: Real-time Firestore Sync
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setIsLoading(false);
      return;
    }

    // Query active user's actual past and current orders
    const q = query(collection(db, 'orders'), where('userId', '==', user.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Sort dynamically in JS to avoid complex Firestore indexing rules
      fetchedOrders.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      
      setOrders(fetchedOrders);
      setIsLoading(false);
    }, (err) => {
      console.error("Firestore Sync Error [OrderHistory]:", err);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [db, auth.currentUser]);

  // FEATURE 2: Dynamic Status Filtering Engine
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const status = (order.status || '').toLowerCase();
      
      // Tab Filtering
      const isCompleted = ['delivered', 'cancelled', 'failed'].includes(status);
      const matchesTab = 
        activeTab === 'All' || 
        (activeTab === 'Active' && !isCompleted) ||
        (activeTab === 'Completed' && isCompleted);
      
      // Search Filtering
      const normalizedSearch = searchQuery.toLowerCase();
      const origin = (order.pickup?.address || '').toLowerCase();
      const destination = (order.dropoffs?.[0]?.address || order.dropoff?.address || '').toLowerCase();
      
      const matchesSearch = 
        order.id.toLowerCase().includes(normalizedSearch) ||
        origin.includes(normalizedSearch) ||
        destination.includes(normalizedSearch);

      return matchesTab && matchesSearch;
    });
  }, [orders, activeTab, searchQuery]);

  // Compute Quick Stats
  const stats = useMemo(() => {
    return {
      active: orders.filter(o => !['delivered', 'cancelled', 'failed'].includes((o.status || '').toLowerCase())).length,
      completed: orders.filter(o => ['delivered', 'cancelled', 'failed'].includes((o.status || '').toLowerCase())).length,
    };
  }, [orders]);

  // FEATURE 4: Status Configuration UI Matrix
  const getStatusConfig = (status) => {
    const s = (status || '').toLowerCase();
    switch(s) {
      case 'transit':
      case 'active':
      case 'processing':
      case 'accepted':
      case 'assigned':
        return { icon: Truck, color: 'text-[#276EF1]', bg: 'bg-blue-50', border: 'border-blue-100', label: 'In Transit' };
      case 'delivered':
      case 'completed':
        return { icon: CheckCircle2, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100', label: 'Delivered' };
      case 'cancelled':
      case 'failed':
        return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100', label: 'Cancelled' };
      case 'alert':
        return { icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100', label: 'Exception' };
      default: 
        return { icon: Package, color: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-200', label: 'Processing' };
    }
  };

  // FEATURE 4: Intelligent Date Formatting
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown Date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans pb-32">
      
      {/* SECTION 2: Premium Header Navigation */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 pt-14 pb-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard-home')} 
            className="w-10 h-10 -ml-2 flex items-center justify-center text-black hover:bg-gray-100 rounded-full transition-colors active:scale-95"
          >
            <ChevronLeft size={28} strokeWidth={2.5} />
          </button>
          <h1 className="text-3xl font-black tracking-tight text-black">Shipments.</h1>
        </div>
        <div className="w-10 h-10 bg-black rounded-[10px] p-2 shadow-md flex items-center justify-center">
          <img src="/logo.png" alt="Movyra" className="w-full h-full object-contain" />
        </div>
      </motion.div>

      <div className="px-6">
        
        {/* SECTION 3: Real-time Search & Filter Engine */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-3 mb-6"
        >
          <div className="flex-1 bg-[#F6F6F6] rounded-2xl flex items-center px-4 py-3 border-2 border-transparent focus-within:border-black transition-colors shadow-sm">
            <Search size={20} className="text-gray-400 mr-3" strokeWidth={2.5} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID or City..." 
              className="bg-transparent outline-none text-[15px] font-bold text-black w-full placeholder:text-gray-400 placeholder:font-bold"
            />
          </div>
          <button className="w-[52px] h-[52px] bg-[#F6F6F6] rounded-2xl flex items-center justify-center text-black hover:bg-gray-200 active:scale-95 transition-all">
            <Filter size={20} strokeWidth={2.5} />
          </button>
        </motion.div>

        {/* SECTION 4: Statistical Summary Dashboard */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-4 mb-8"
        >
          <div className="flex-1 bg-white border border-gray-200 shadow-sm rounded-[24px] p-5 flex flex-col justify-between">
             <p className="text-3xl font-black text-[#276EF1] mb-1">{stats.active}</p>
             <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Active</p>
          </div>
          <div className="flex-1 bg-white border border-gray-200 shadow-sm rounded-[24px] p-5 flex flex-col justify-between">
             <p className="text-3xl font-black text-black mb-1">{stats.completed}</p>
             <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Completed</p>
          </div>
        </motion.div>

        {/* SECTION 5: Animated Tab Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-2 mb-6 bg-[#F6F6F6] p-1.5 rounded-2xl"
        >
          {['All', 'Active', 'Completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative flex-1 py-2.5 text-sm font-black tracking-wide rounded-xl transition-colors z-10 ${
                activeTab === tab ? 'text-black' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTabBackground"
                  className="absolute inset-0 bg-white rounded-xl shadow-sm -z-10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              {tab}
            </button>
          ))}
        </motion.div>

        {/* SECTION 6: Dynamic Staggered Shipment List */}
        <div className="flex flex-col gap-4">
          {isLoading ? (
            // FEATURE 3: Skeleton Loading States
            <div className="flex flex-col gap-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : (
            <AnimatePresence mode='popLayout'>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order, idx) => {
                  const config = getStatusConfig(order.status);
                  const Icon = config.icon;
                  const originShort = order.pickup?.address?.split(',')[0] || 'Origin';
                  const dropoffAddr = order.dropoffs?.[0]?.address || order.dropoff?.address || 'Destination';
                  const destinationShort = dropoffAddr.split(',')[0];
                  
                  return (
                    <motion.div
                      key={order.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                      transition={{ delay: idx * 0.05, type: 'spring', stiffness: 300, damping: 24 }}
                      // FEATURE 5: Seamless Routing to Mapbox Order Details
                      onClick={() => navigate(`/order-history/detail/${order.id}`)}
                      className="bg-white p-4 rounded-[24px] border border-gray-200 shadow-sm flex items-center gap-4 cursor-pointer active:scale-[0.98] hover:shadow-md transition-all"
                    >
                      {/* Status Icon Indicator */}
                      <div className={`w-14 h-14 rounded-[18px] flex items-center justify-center flex-shrink-0 border ${config.bg} ${config.color} ${config.border}`}>
                        <Icon size={24} strokeWidth={2.5} />
                      </div>
                      
                      {/* Shipment Data Payload */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-[16px] text-black tracking-wide truncate mb-0.5">
                          {order.id.slice(-8).toUpperCase()}
                        </h4>
                        <div className="flex items-center gap-1.5 text-gray-500 text-[13px] font-bold truncate">
                          <span className="truncate">{originShort}</span>
                          <span className="text-gray-300">→</span>
                          <span className="truncate">{destinationShort}</span>
                        </div>
                      </div>

                      {/* Right Side Context */}
                      <div className="flex flex-col items-end flex-shrink-0">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md mb-1 ${config.bg} ${config.color}`}>
                          {config.label}
                        </span>
                        <span className="text-gray-400 text-[11px] font-bold">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 bg-[#F6F6F6] rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <Package size={24} strokeWidth={2.5} />
                  </div>
                  <p className="text-[16px] font-black text-black mb-1">No Shipments Found</p>
                  <p className="text-[13px] font-bold text-gray-400">You haven't made any orders in this category yet.</p>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

      </div>
    </div>
  );
}