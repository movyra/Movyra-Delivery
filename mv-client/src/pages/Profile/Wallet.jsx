import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, QrCode, MoreHorizontal, Loader2 } from 'lucide-react';

// Real Store & Database Integration
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, collection, query, where, orderBy, limit } from 'firebase/firestore';

/**
 * PAGE: WALLET (HIGH-CONTRAST PREMIUM UI)
 * Architecture: Pure white background, deeply rounded high-elevation cards.
 * Features: 
 * - Real-time Firestore sync for Wallet Balance & Credit Limit
 * - Real-time recent transaction ledger mapped directly inside the Cash card
 * - Dynamic Progress Bar for Credit Utilization
 */

export default function Wallet() {
  const navigate = useNavigate();
  const db = getFirestore();
  const auth = getAuth();

  // Real-time Data States
  const [isLoading, setIsLoading] = useState(true);
  const [walletData, setWalletData] = useState({
    cashBalance: 0,
    creditUsed: 0,
    creditLimit: 5000, // Default limit if not set in DB
    cashbackEarned: 0
  });
  const [recentTransactions, setRecentTransactions] = useState([]);

  // ============================================================================
  // LOGIC: REAL-TIME FIRESTORE DATA STREAMS
  // ============================================================================
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setIsLoading(false);
      return;
    }

    // STREAM 1: User Financial Data (Cash, Credit, Cashback)
    const userRef = doc(db, 'users', user.uid);
    const unsubscribeUser = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setWalletData({
          cashBalance: data.walletBalance || 0,
          creditUsed: data.creditUsed || 0,
          creditLimit: data.creditLimit || 5000,
          cashbackEarned: data.cashbackEarned || 0
        });
      }
    }, (err) => console.error("Wallet Stream Error:", err));

    // STREAM 2: Recent Transactions (Last 2 orders for the ledger)
    const ordersRef = collection(db, 'orders');
    const ordersQuery = query(
      ordersRef, 
      where('userId', '==', user.uid),
      where('status', 'in', ['delivered', 'cancelled']),
      orderBy('createdAt', 'desc'),
      limit(2)
    );

    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      const fetchedTx = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setRecentTransactions(fetchedTx);
      setIsLoading(false);
    }, (error) => {
      console.error("Transaction Stream Error:", error);
      setIsLoading(false);
    });

    return () => {
      unsubscribeUser();
      unsubscribeOrders();
    };
  }, [auth, db]);

  const creditProgressPercentage = Math.min((walletData.creditUsed / walletData.creditLimit) * 100, 100);

  return (
    <div className="min-h-screen bg-white text-[#111111] font-sans pb-32 overflow-x-hidden relative">
      
      {/* SECTION 1: Minimalist Header */}
      <div className="pt-14 px-6 pb-2 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-50">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 -ml-2 text-[#111111] active:scale-95 transition-transform"
        >
          <X size={28} strokeWidth={2.5} />
        </button>
        <button className="w-8 h-8 bg-[#111111] rounded-full flex items-center justify-center text-white active:scale-95 transition-transform shadow-md">
          <QrCode size={14} strokeWidth={3} />
        </button>
      </div>

      <div className="px-6 pt-4">
        {/* SECTION 2: Typography Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-[40px] font-black tracking-tighter text-[#111111] leading-none">
            Wallet
          </h1>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={32} className="animate-spin text-gray-300" />
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* SECTION 3: Movyra Cash Card (White, High Shadow) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white rounded-[32px] p-6 shadow-[0_15px_40px_rgba(0,0,0,0.08)] border border-gray-50/50 relative overflow-hidden flex flex-col"
            >
              <div className="flex justify-between items-start mb-1 z-10">
                <span className="text-[13px] font-bold text-gray-500">Movyra Cash</span>
                <button className="text-gray-400 active:scale-95 transition-transform">
                  <MoreHorizontal size={20} strokeWidth={2.5} />
                </button>
              </div>
              <div className="mb-6 z-10">
                <span className="text-[42px] font-black tracking-tighter text-[#111111] leading-none">
                  ₹{walletData.cashBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Real-time Ledger */}
              <div className="z-10 flex flex-col gap-3">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((tx, idx) => (
                    <div key={tx.id} className="flex justify-between items-center py-3 border-t border-gray-100/80">
                      <span className="text-[15px] font-bold text-[#111111] truncate pr-4">
                        {tx.vehicleType === 'bike' ? 'Movyra Moto' : tx.vehicleType === '3wheeler' ? 'Movyra 3W' : 'Movyra Truck'}
                      </span>
                      <span className="text-[15px] font-bold text-[#111111] shrink-0">
                        -₹{tx.pricing?.estimatedPrice || tx.totalFare || 0}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-3 border-t border-gray-100/80">
                    <span className="text-[14px] font-bold text-gray-400">No recent transactions</span>
                  </div>
                )}
              </div>

              {/* Giant Faded Watermark */}
              <div className="absolute -bottom-4 -right-2 select-none pointer-events-none">
                <span className="text-[72px] font-black text-gray-50/80 tracking-tighter">Movyra</span>
              </div>
            </motion.div>

            {/* SECTION 4: Movyra Credit Line Card (Dark Grey) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-[#1C1F26] rounded-[32px] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.2)] flex flex-col relative"
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-[13px] font-bold text-gray-400">Movyra Credit Line</span>
                <button className="text-gray-500 active:scale-95 transition-transform">
                  <MoreHorizontal size={20} strokeWidth={2.5} />
                </button>
              </div>
              <div className="mb-4">
                <span className="text-[42px] font-black tracking-tighter text-white leading-none">
                  ₹{walletData.creditUsed.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-white/10 rounded-full mb-6 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} animate={{ width: `${creditProgressPercentage}%` }} transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                  className="h-full bg-white rounded-full"
                />
              </div>

              <div>
                <button className="bg-[#111111] text-white px-5 py-3 rounded-[16px] text-[14px] font-bold active:scale-95 transition-transform shadow-md">
                  Pay early
                </button>
              </div>
            </motion.div>

            {/* SECTION 5: Cashback Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-white rounded-[32px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-50/50 mt-2"
            >
              <span className="text-[13px] font-bold text-gray-500 block mb-2">Cash back</span>
              <p className="text-[16px] font-bold text-[#111111] leading-snug">
                You earned <span className="text-[#276EF1]">₹{walletData.cashbackEarned.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span> cash back this week
              </p>
            </motion.div>

          </div>
        )}
      </div>
    </div>
  );
}