import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Search, Filter, Package, Truck, CheckCircle2, AlertCircle, Loader2, XCircle } from 'lucide-react';

// Real Database Integration
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Modular UI Components (Premium Split-Screen Aesthetic)
import OrderSegmentedToggle from '../../components/OrderDetails/OrderSegmentedToggle';

// ============================================================================
// PAGE: ORDER HISTORY & SHIPMENTS (PREMIUM CARD UI)
// Architecture: Deeply rounded 32px cards on #F2F4F7 background.
// Features: Real-time Firestore Engine, Isolated Navigation, 
// Segmented Toggles, and Light-Blue (#BCE3FF) Active States.
// ============================================================================

const TABS = [
  { id: 'All', label: 'All' },
  { id: 'Active', label: 'Active' },
  { id: 'Completed', label: 'Completed' },
  { id: 'Cancelled', label: 'Cancelled' }
];

const SkeletonCard = () => (
  <div className="bg-white p-6 rounded-[32px] border border-gray-50/50 shadow-[0_4px_15px_rgba(0,0,0,0.03)] flex flex-col gap-4 animate-pulse">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex-shrink-0"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded-md w-24"></div>
          <div className="h-3 bg-gray-100 rounded-md w-16"></div>
        </div>
      </div>
      <div className="h-6 w-16 bg-gray-100 rounded-full"></div>
    </div>
    <div className="h-4 bg-gray-100 rounded-md w-full mt-2"></div>
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
      const isCompleted = ['delivered'].includes(status);
      const isCancelled = ['cancelled', 'failed'].includes(status);
      const isActive = !isCompleted && !isCancelled;

      const matchesTab = 
        activeTab === 'All' || 
        (activeTab === 'Active' && isActive) ||
        (activeTab === 'Completed' && isCompleted) ||
        (activeTab === 'Cancelled' && isCancelled);
      
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

  // FEATURE 3: Premium Status Configuration UI Matrix
  const getStatusConfig = (status) => {
    const s = (status || '').toLowerCase();
    switch(s) {
      case 'transit':
      case 'active':
      case 'processing':
      case 'accepted':
      case 'assigned':
      case 'searching':
      case 'picked_up':
        return { icon: Truck, color: 'text-[#111111]', bg: 'bg-[#BCE3FF]', border: 'border-[#A5D5F9]', label: 'Active' };
      case 'delivered':
      case 'completed':
        return { icon: CheckCircle2, color: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-200', label: 'Delivered' };
      case 'cancelled':
      case 'failed':
        return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100', label: 'Cancelled' };
      case 'alert':
        return { icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100', label: 'Exception' };
      default: 
        return { icon: Package, color: 'text-gray-500', bg: 'bg-gray-100', border: 'border-gray-200', label: 'Processing' };
    }
  };

  // FEATURE 4: Intelligent Date Formatting
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown Date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#F2F4F7] text-[#111111] font-sans pb-32">
      
      {/* SECTION 2: Stark Header Navigation (No Box Shadows or Backgrounds) */}
      <div className="px-6 pt-12 pb-6 flex items-center gap-4 sticky top-0 z-50 bg-[#F2F4F7]/90 backdrop-blur-md">
        <button 
          onClick={() => navigate('/dashboard-home')} 
          className="w-[46px] h-[46px] bg-white rounded-full flex items-center justify-center text-[#111111] shadow-[0_4px_15px_rgba(0,0,0,0.08)] active:scale-95 transition-all shrink-0"
        >
          <ChevronLeft size={24} strokeWidth={2.5} className="-ml-0.5" />
        </button>
        <h1 className="text-[32px] font-black tracking-tighter text-[#111111] leading-none">
          Shipments
        </h1>
      </div>

      <div className="px-6">
        
        {/* SECTION 3: Real-time Search & Filter Engine */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-3 mb-6"
        >
          <div className="flex-1 bg-white rounded-[20px] flex items-center px-4 py-3 border border-gray-100 focus-within:border-gray-300 transition-colors shadow-[0_4px_15px_rgba(0,0,0,0.02)]">
            <Search size={20} className="text-gray-400 mr-3" strokeWidth={2.5} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID or City..." 
              className="bg-transparent outline-none text-[15px] font-bold text-[#111111] w-full placeholder:text-gray-400 placeholder:font-bold"
            />
          </div>
          <button className="w-[52px] h-[52px] bg-white border border-gray-100 rounded-[20px] flex items-center justify-center text-[#111111] shadow-[0_4px_15px_rgba(0,0,0,0.02)] active:scale-95 transition-all">
            <Filter size={20} strokeWidth={2.5} />
          </button>
        </motion.div>

        {/* SECTION 4: Statistical Summary Dashboard (Rounded Card Aesthetic) */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-4 mb-8"
        >
          <div className="flex-1 bg-white shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-gray-50/50 rounded-[28px] p-6 flex flex-col justify-between">
             <p className="text-[32px] font-black text-[#111111] mb-1 leading-none">{stats.active}</p>
             <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Active</p>
          </div>
          <div className="flex-1 bg-white shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-gray-50/50 rounded-[28px] p-6 flex flex-col justify-between">
             <p className="text-[32px] font-black text-gray-500 mb-1 leading-none">{stats.completed}</p>
             <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Completed</p>
          </div>
        </motion.div>

        {/* SECTION 5: Modular Segmented Tab Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <OrderSegmentedToggle 
            tabs={TABS} 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />
        </motion.div>

        {/* SECTION 6: Dynamic Staggered Shipment List (Massive Rounded Cards) */}
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
                      onClick={() => navigate(order.status === 'delivered' || order.status === 'cancelled' ? `/order-history/detail/${order.id}` : `/tracking/detail/${order.id}`)}
                      className="bg-white p-6 rounded-[32px] border border-gray-50/50 shadow-[0_4px_15px_rgba(0,0,0,0.03)] flex flex-col gap-4 cursor-pointer active:scale-[0.98] hover:border-gray-200 transition-all"
                    >
                      {/* Top Row: Icon + ID + Status Pill */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 pr-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${config.bg} ${config.color}`}>
                            <Icon size={20} strokeWidth={2.5} />
                          </div>
                          <div className="flex flex-col">
                            <h4 className="font-black text-[16px] text-[#111111] tracking-tight mb-0.5">
                              {order.id.slice(-8).toUpperCase()}
                            </h4>
                            <span className="text-gray-400 text-[12px] font-bold">
                              {formatDate(order.createdAt)}
                            </span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shrink-0 ${config.bg} ${config.color}`}>
                          {config.label}
                        </span>
                      </div>

                      {/* Route Row */}
                      <div className="flex items-center gap-2 text-[#4A6B85] text-[14px] font-bold mt-2">
                        <span className="truncate flex-1">{originShort}</span>
                        <span className="text-gray-300 shrink-0">→</span>
                        <span className="truncate flex-1">{destinationShort}</span>
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
                  <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <Package size={24} strokeWidth={2.5} />
                  </div>
                  <p className="text-[16px] font-black text-[#111111] mb-1">No Shipments Found</p>
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