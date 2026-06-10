import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

/**
 * ============================================================================
 * COMPONENT: LIVE BIDDING SYSTEM
 * Purpose: Manages reverse-auction mechanics for fleet dispatch.
 * Behavior: Retrieves active bids from drivers, sorts by price/rating, 
 * and handles final transaction acceptance.
 * Design System: Black (#000000), White (#FFFFFF), Grey (#F2F4F7), 
 * Stark (#111111), Accent (#00A9F7).
 * ============================================================================
 */

export default function LiveBiddingSystem({ user }) {
  const [activeBids, setActiveBids] = useState([]);
  const [sortParam, setSortParam] = useState('price'); // price, ETA, rating
  const [isAccepting, setIsAccepting] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState(null);

  // 1. Establish Real-Time Active Order Connection
  useEffect(() => {
    if (!user) return;

    // Fetch the most recent pending order for this user to attach bids to
    const orderQuery = query(
      collection(db, 'delivery_multi_stop'), 
      where('userId', '==', user.uid), 
      where('status', '==', 'Pending Bids')
    );

    const unsubscribeOrder = onSnapshot(orderQuery, (snapshot) => {
      if (!snapshot.empty) {
        // Use the most recent pending order
        const docs = snapshot.docs;
        docs.sort((a, b) => b.data().createdAt?.toMillis() - a.data().createdAt?.toMillis());
        setActiveOrderId(docs[0].id);
      } else {
        setActiveOrderId(null);
      }
    });

    return () => unsubscribeOrder();
  }, [user]);

  // 2. Stream Live Incoming Bids
  useEffect(() => {
    if (!activeOrderId) return;

    // In a production environment, this query would target 'driver_bids' where orderId == activeOrderId.
    // For this structural execution, we mock incoming bids to verify UI rendering, 
    // as driver fleet apps are not currently connected to populate the live database.
    
    const generateBids = () => {
      const mockData = [
        { id: 'b1', driverName: 'Sanjay M.', rating: 4.8, price: 340, eta: '12 min', vehicleId: 'MH-12-XX-4012' },
        { id: 'b2', driverName: 'Arif K.', rating: 4.5, price: 290, eta: '18 min', vehicleId: 'MH-14-XY-8810' },
        { id: 'b3', driverName: 'Rajesh P.', rating: 4.9, price: 410, eta: '8 min', vehicleId: 'MH-12-AB-1102' }
      ];
      setActiveBids(mockData);
    };

    generateBids();
    
    // Simulate incoming bids over time
    const timer = setTimeout(() => {
      setActiveBids(prev => [...prev, { id: 'b4', driverName: 'Vikram S.', rating: 4.7, price: 310, eta: '15 min', vehicleId: 'MH-14-ZZ-9921' }]);
    }, 4500);

    return () => clearTimeout(timer);

  }, [activeOrderId]);

  // 3. Execution Logic
  const handleAcceptBid = async (bid) => {
    if (!activeOrderId) return;
    setIsAccepting(true);

    try {
      const orderRef = doc(db, 'delivery_multi_stop', activeOrderId);
      await updateDoc(orderRef, {
        status: 'Driver En Route',
        acceptedBidId: bid.id,
        finalPrice: bid.price,
        driverAssigned: bid.driverName
      });
      // Component will unmount or redirect based on master container state change
    } catch (error) {
      console.error("Transaction execution failed:", error);
      setIsAccepting(false);
    }
  };

  // 4. Sorting Parameters
  const sortedBids = [...activeBids].sort((a, b) => {
    if (sortParam === 'price') return a.price - b.price;
    if (sortParam === 'rating') return b.rating - a.rating;
    if (sortParam === 'ETA') return parseInt(a.eta) - parseInt(b.eta);
    return 0;
  });

  return (
    <div className="pb-24 min-h-screen bg-[#000000]">
      {/* Brand Header */}
      <div className="bg-[#111111] px-4 pt-10 pb-6 border-b border-[#333333] sticky top-0 z-40">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-[#FFFFFF] font-black text-[1.8rem]">Incoming Bids</h1>
          <div className="bg-[#00A9F7]/10 px-3 py-1 rounded-full border border-[#00A9F7]/30 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00A9F7] animate-pulse"></div>
            <span className="text-[#00A9F7] font-black text-[0.75rem] uppercase tracking-widest">Live</span>
          </div>
        </div>
        <p className="text-[#888888] font-bold text-[0.85rem]">Evaluating fleet availability in your sector.</p>
      </div>

      <div className="p-4 flex flex-col gap-6 mt-2">

        {/* Sorting Controls */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {['price', 'ETA', 'rating'].map((param) => (
            <button 
              key={param}
              onClick={() => setSortParam(param)}
              className={`px-5 py-2 rounded-full font-black text-[0.85rem] whitespace-nowrap border transition-colors ${sortParam === param ? 'bg-[#FFFFFF] text-[#111111] border-[#FFFFFF]' : 'bg-[#111111] text-[#888888] border-[#333333] hover:border-[#FFFFFF]'}`}
            >
              Sort by {param.charAt(0).toUpperCase() + param.slice(1)}
            </button>
          ))}
        </div>

        {/* Active Bids Matrix */}
        {!activeOrderId ? (
          <div className="bg-[#111111] border border-[#333333] rounded-[24px] p-8 flex flex-col items-center text-center shadow-sm mt-8">
             <div className="w-16 h-16 rounded-full border border-[#333333] flex items-center justify-center text-[#888888] mb-4">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
             </div>
             <span className="text-[#FFFFFF] font-black text-[1.1rem] mb-2">No Active Broadcasts</span>
             <span className="text-[#888888] font-bold text-[0.85rem]">Initiate a route dispatch to receive driver proposals.</span>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <AnimatePresence>
              {sortedBids.map((bid, index) => (
                <motion.div 
                  initial={{ opacity: 0, x: 50 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1 }}
                  key={bid.id} 
                  className="bg-[#111111] border border-[#333333] rounded-[24px] p-5 shadow-sm flex flex-col"
                >
                  <div className="flex justify-between items-start mb-4 border-b border-[#333333] pb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#000000] border border-[#333333] rounded-full flex items-center justify-center text-[#FFFFFF]">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[#FFFFFF] font-black text-[1.1rem]">{bid.driverName}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="bg-[#FEF3C7] text-[#D97706] font-black text-[0.7rem] px-2 py-0.5 rounded flex items-center gap-1"><svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg> {bid.rating}</span>
                          <span className="text-[#888888] font-bold text-[0.7rem] uppercase tracking-wider">{bid.vehicleId}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[#FFFFFF] font-black text-[1.5rem]">₹{bid.price}</span>
                      <span className="text-[#00A9F7] font-black text-[0.8rem] bg-[#00A9F7]/10 px-2 py-0.5 rounded mt-1">{bid.eta} Away</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleAcceptBid(bid)} 
                    disabled={isAccepting}
                    className="w-full bg-[#FFFFFF] text-[#111111] py-3 rounded-xl font-black text-[1rem] hover:bg-[#F2F4F7] transition-colors disabled:opacity-50"
                  >
                    {isAccepting ? 'Processing Transaction...' : 'Accept Proposal'}
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}