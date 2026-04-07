import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Search, Filter, Package, Truck, 
  CheckCircle2, AlertCircle, Loader2, XCircle, Briefcase, Receipt 
} from 'lucide-react';

// Real Database Integration
import { getFirestore, collection, query, onSnapshot } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Real Store & Global Prefs Integration
import usePreferencesStore from '../store/usePreferencesStore';
import { t } from '../utils/translations';

// Premium UI Components
import OrderSegmentedToggle from '../components/OrderDetails/OrderSegmentedToggle';
import OrderAnalyticsChart from '../components/OrderDetails/OrderAnalyticsChart';
import SystemCard from '../components/UI/SystemCard';
import SystemToggle from '../components/UI/SystemToggle';

/**
 * PAGE: ORDER HISTORY & SHIPMENTS (PREMIUM CARD UI)
 * Architecture: Detached 32px rounded SystemCards on #F2F4F7 background.
 * Logic: 
 * - Real-time Firestore sync with strict isolated tenant path
 * - Monthly Business Expense Tracking (B2B Mode)
 * - Dynamic Search & Multi-state filtering
 * - DARK MODE & i18n: Fully wired global compliance
 * - FEATURE INJECTION: Native route to B2B Tax Invoice Dashboard
 */

const getAppId = () => {
  if (typeof window !== 'undefined' && window.__app_id) return window.__app_id;
  if (typeof __app_id !== 'undefined') return __app_id;
  return 'default-app-id';
};

const SkeletonCard = () => (
  <SystemCard variant="white" className="!p-6 flex flex-col gap-4 animate-pulse border border-gray-50/50 dark:bg-[#1A1A1A] dark:border-[#333333]">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex-shrink-0"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-24"></div>
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-md w-16"></div>
        </div>
      </div>
      <div className="h-6 w-16 bg-gray-100 dark:bg-gray-800 rounded-full"></div>
    </div>
    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-md w-full mt-2"></div>
  </SystemCard>
);

export default function OrderHistory() {
  const navigate = useNavigate();
  const db = getFirestore();
  const auth = getAuth();
  
  const { language } = usePreferencesStore();

  const TABS = [
    { id: 'All', label: t('All', language) || 'All' },
    { id: 'Active', label: t('Active', language) || 'Active' },
    { id: 'Completed', label: t('Completed', language) || 'Completed' },
    { id: 'Cancelled', label: t('Cancelled', language) || 'Cancelled' }
  ];

  // State Management
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isBusinessMode, setIsBusinessMode] = useState(false);

  // ============================================================================
  // REAL-TIME FIRESTORE DATA SYNC (STRICT AUTH RACE-CONDITION FIX)
  // ============================================================================
  useEffect(() => {
    let unsubscribeSnapshot;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const appId = getAppId();
        // Strict isolated path to bypass index requirements and ensure security
        const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'orders'));
        
        unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const fetchedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          // Sort dynamically by creation date (newest first)
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
      } else {
        setIsLoading(false);
        navigate('/auth-login', { replace: true });
      }
    });

    return () => {
      if (unsubscribeSnapshot) unsubscribeSnapshot();
      unsubscribeAuth();
    };
  }, [db, auth, navigate]);

  // Status Configuration UI Matrix (Dark Mode compliant)
  const getStatusConfig = (status) => {
    const s = (status || '').toLowerCase();
    switch(s) {
      case 'searching':
      case 'assigned':
      case 'picked_up':
        return { icon: Truck, color: 'text-[#111111] dark:text-[#E2F1FF]', bg: 'bg-[#BCE3FF] dark:bg-[#1A365D]', label: t('Active', language) || 'Active' };
      case 'delivered':
        return { icon: CheckCircle2, color: 'text-gray-600 dark:text-gray-300', bg: 'bg-gray-100 dark:bg-gray-800', label: t('Delivered', language) || 'Delivered' };
      case 'cancelled':
      case 'failed':
        return { icon: XCircle, color: 'text-red-500 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', label: t('Cancelled', language) || 'Cancelled' };
      default: 
        return { icon: Package, color: 'text-gray-500 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800', label: t('Pending', language) || 'Pending' };
    }
  };

  // Filtering Engine
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const status = (order.status || '').toLowerCase();
      
      const isCompleted = ['delivered'].includes(status);
      const isCancelled = ['cancelled', 'failed'].includes(status);
      const isActive = !isCompleted && !isCancelled;

      const matchesTab = 
        activeTab === 'All' || 
        (activeTab === 'Active' && isActive) ||
        (activeTab === 'Completed' && isCompleted) ||
        (activeTab === 'Cancelled' && isCancelled);
      
      const normalizedSearch = searchQuery.toLowerCase();
      const origin = (order.pickup?.address || '').toLowerCase();
      const orderId = order.id.toLowerCase();

      return matchesTab && (orderId.includes(normalizedSearch) || origin.includes(normalizedSearch));
    });
  }, [orders, activeTab, searchQuery]);

  // Business Expense Engine
  const currentMonth = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const monthlyTotal = useMemo(() => {
    const now = new Date();
    return orders.reduce((sum, order) => {
      const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt || 0);
      if (orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear()) {
        const price = order.pricing?.estimatedPrice || order.totalFare || 0;
        return sum + price;
      }
      return sum;
    }, 0);
  }, [orders]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown Date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const businessTabs = [
    { id: 'personal', label: t('Personal', language) || 'Personal' },
    { id: 'business', label: t('Business B2B', language) || 'Business B2B' }
  ];

  return (
    <div className="min-h-[100dvh] bg-[#F2F4F7] dark:bg-[#111111] text-[#111111] dark:text-[#F6F6F6] font-sans pb-32 relative transition-colors duration-300">
      
      {/* SECTION 1: Isolated Navigation & B2B Invoice Trigger */}
      <div className="px-6 pt-14 pb-4 flex items-center justify-between sticky top-0 z-50 bg-[#F2F4F7]/90 dark:bg-[#111111]/90 backdrop-blur-md transition-colors duration-300">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard-home')} 
            className="w-[46px] h-[46px] bg-white dark:bg-[#222222] rounded-full flex items-center justify-center text-[#111111] dark:text-white shadow-[0_4px_15px_rgba(0,0,0,0.08)] active:scale-95 transition-all shrink-0"
          >
            <ChevronLeft size={24} strokeWidth={2.5} className="-ml-0.5" />
          </button>
          <h1 className="text-[32px] font-black tracking-tighter text-[#111111] dark:text-white leading-none transition-colors">
            {t('Shipments', language) || 'Shipments'}
          </h1>
        </div>
        
        {/* PREMIUM TRIGGER: Direct Link to B2B Invoice Dashboard */}
        <button 
          onClick={() => navigate('/business/invoices')}
          className="flex items-center gap-2 bg-[#111111] dark:bg-white text-white dark:text-[#111111] px-4 py-2.5 rounded-[20px] font-black text-[13px] active:scale-95 transition-all shadow-sm shrink-0"
        >
          <Receipt size={16} strokeWidth={2.5} />
          <span className="hidden sm:inline">Tax Invoices</span>
        </button>
      </div>

      <div className="px-5 pt-2">
        
        {/* SECTION 2: Business Mode & Analytics Dashboard */}
        <div className="mb-6">
          <SystemToggle 
            tabs={businessTabs}
            activeTab={isBusinessMode ? 'business' : 'personal'}
            onTabChange={(id) => setIsBusinessMode(id === 'business')}
            className="w-full mb-4"
          />
          
          <AnimatePresence>
            {isBusinessMode && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }} 
                className="overflow-hidden"
              >
                <OrderAnalyticsChart 
                  totalValue={monthlyTotal.toFixed(2)}
                  currency="₹"
                  dateRange={`Monthly Expense (${currentMonth})`}
                  data={[
                    { label: 'Active Deliveries', value: orders.filter(o => !['delivered','cancelled','failed'].includes((o.status || '').toLowerCase())).length, isActive: false },
                    { label: 'Total Orders', value: orders.length, isActive: false },
                    { label: 'Monthly Spend', value: monthlyTotal.toFixed(2), isActive: true }
                  ]}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SECTION 3: Search Engine */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="flex gap-3 mb-6"
        >
          <div className="flex-1 bg-white dark:bg-[#2A2A2A] rounded-[24px] flex items-center px-5 py-4 border-2 border-transparent focus-within:border-[#111111] dark:focus-within:border-white transition-all shadow-[0_4px_15px_rgba(0,0,0,0.02)]">
            <Search size={20} className="text-gray-400 dark:text-gray-500 mr-3" strokeWidth={2.5} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID or address..." 
              className="bg-transparent outline-none text-[15px] font-bold text-[#111111] dark:text-white w-full placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
            />
          </div>
        </motion.div>

        {/* SECTION 4: Sub-navigation Filter */}
        <div className="mb-8">
          <OrderSegmentedToggle 
            tabs={TABS} 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />
        </div>

        {/* SECTION 5: Dynamic SystemCard Order Feed */}
        <div className="flex flex-col gap-4">
          {isLoading ? (
            [1, 2, 3].map(i => <SkeletonCard key={i} />)
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
                    <SystemCard
                      key={order.id}
                      animated
                      variant="white"
                      onClick={() => navigate(order.status === 'delivered' || order.status === 'cancelled' ? `/order-history/detail/${order.id}` : `/tracking/detail/${order.id}`)}
                      className="!p-5 flex flex-col gap-4 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4 pr-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${config.bg} ${config.color}`}>
                            <Icon size={20} strokeWidth={2.5} />
                          </div>
                          <div className="flex flex-col">
                            <h4 className="font-black text-[16px] text-[#111111] dark:text-white tracking-tight mb-0.5 transition-colors">
                              {order.id.slice(-8).toUpperCase()}
                            </h4>
                            <span className="text-gray-400 dark:text-gray-500 text-[12px] font-bold transition-colors">
                              {formatDate(order.createdAt)}
                            </span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shrink-0 transition-colors ${config.bg} ${config.color}`}>
                          {config.label}
                        </span>
                      </div>

                      <div className="h-px w-full bg-gray-50 dark:bg-gray-800 my-1 transition-colors" />

                      <div className="flex items-center gap-2 text-[#4A6B85] dark:text-[#A0AEC0] text-[14px] font-bold transition-colors">
                        <span className="truncate flex-1 text-[#111111] dark:text-white transition-colors">{originShort}</span>
                        <span className="text-gray-300 dark:text-gray-600 shrink-0 transition-colors">→</span>
                        <span className="truncate flex-1 text-[#111111] dark:text-white transition-colors">{destinationShort}</span>
                      </div>
                    </SystemCard>
                  );
                })
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 bg-white dark:bg-[#1A1A1A] shadow-sm border border-gray-100 dark:border-[#333333] rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 dark:text-gray-500 transition-colors">
                    <Package size={24} strokeWidth={2.5} />
                  </div>
                  <p className="text-[18px] font-black tracking-tight text-[#111111] dark:text-white mb-1 transition-colors">No Orders Found</p>
                  <p className="text-[14px] font-bold text-gray-400 dark:text-gray-500 transition-colors">Try switching tabs or adjusting your search.</p>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

      </div>
    </div>
  );
}