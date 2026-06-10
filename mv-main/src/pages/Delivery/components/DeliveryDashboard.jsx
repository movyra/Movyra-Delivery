import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

/**
 * ============================================================================
 * COMPONENT: DELIVERY DASHBOARD
 * Purpose: Primary interface for logistics operations. Renders personalized
 * greetings, promotional banners, action routers, and real-time dispatch tracking.
 * Design System: Black (#000000), White (#FFFFFF), Grey (#F2F4F7), Stark (#111111).
 * Data Integrity: Operates strictly on live Firestore connections.
 * ============================================================================
 */

export default function DeliveryDashboard({ user, profile, onBookParcel, onTrackParcel, onOpenScanner }) {
  const [activeOrder, setActiveOrder] = useState(null);
  const [searchTrackingId, setSearchTrackingId] = useState('');

  // 1. Establish Real-Time Active Order Connection
  useEffect(() => {
    if (!user) return;

    // Fetch the most recent active order to display in the tracking widget
    const activeOrderQuery = query(
      collection(db, 'delivery_orders'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(activeOrderQuery, (snapshot) => {
      if (!snapshot.empty) {
        const orderData = snapshot.docs[0].data();
        // Only display if it's currently active (not completed or cancelled)
        if (orderData.status !== 'Completed' && orderData.status !== 'Cancelled') {
          setActiveOrder({ id: snapshot.docs[0].id, ...orderData });
        } else {
          setActiveOrder(null);
        }
      } else {
        setActiveOrder(null);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // 2. Execution Logic
  const handleSearchTracking = (e) => {
    e.preventDefault();
    if (searchTrackingId.trim()) {
      onTrackParcel(searchTrackingId.trim());
    }
  };

  // Determine progress bar state based on active order status
  const getProgressState = (status) => {
    switch(status) {
      case 'Pending Bids': return { step: 1, label: 'Securing Fleet' };
      case 'Driver Assigned': return { step: 2, label: 'En Route to Origin' };
      case 'Driver En Route': return { step: 3, label: 'In Transit' };
      case 'Arrived at Drop-off': return { step: 4, label: 'Arrived' };
      case 'Delivery Secured': return { step: 5, label: 'Delivered' };
      default: return { step: 1, label: 'Processing' };
    }
  };

  const currentProgress = activeOrder ? getProgressState(activeOrder.status) : null;

  return (
    <div className="w-full min-h-screen bg-[#000000] text-white font-sans flex flex-col relative overflow-x-hidden pb-24">
      
      {/* Dynamic Header Architecture */}
      <div className="w-full bg-[#111111] px-6 pt-12 pb-8 rounded-b-[40px] shadow-sm relative z-40 border-b border-[#333333]">
        <div className="flex items-center justify-between mb-8">
           <div className="w-12 h-12 bg-[#000000] border border-[#333333] rounded-full overflow-hidden flex items-center justify-center">
              {profile.profileImageUrl ? (
                <img src={profile.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className="text-[#888888]"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              )}
           </div>
           <button className="w-12 h-12 bg-[#000000] border border-[#333333] rounded-full flex items-center justify-center text-[#FFFFFF] relative hover:bg-[#222222] transition-colors">
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-[#FFFFFF] border-2 border-[#111111] rounded-full"></span>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
           </button>
        </div>

        <div className="flex flex-col mb-8">
           <span className="text-[#888888] font-bold text-[1.1rem]">Hello,</span>
           <span className="text-[#FFFFFF] font-black text-[2.5rem] leading-none tracking-tight">
             {profile.name ? profile.name.split(' ')[0] : 'User'}! 👋
           </span>
        </div>

        {/* Global Search & Scan Matrix */}
        <form onSubmit={handleSearchTracking} className="w-full relative">
           <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888888]">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
           </div>
           <input 
             type="text" 
             value={searchTrackingId}
             onChange={(e) => setSearchTrackingId(e.target.value)}
             placeholder="Track your parcel" 
             className="w-full bg-[#000000] border border-[#333333] text-[#FFFFFF] pl-12 pr-16 py-4 rounded-[20px] outline-none focus:border-[#FFFFFF] transition-colors font-bold text-[0.95rem]"
           />
           <button type="button" onClick={onOpenScanner} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#FFFFFF] hover:scale-110 transition-transform">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><rect x="7" y="7" width="3" height="3"></rect><rect x="14" y="7" width="3" height="3"></rect><rect x="7" y="14" width="3" height="3"></rect><rect x="14" y="14" width="3" height="3"></rect></svg>
           </button>
        </form>
      </div>

      <div className="px-6 mt-6 flex flex-col gap-6">
        
        {/* Promotional Architecture */}
        <div className="w-full bg-[#111111] border border-[#333333] rounded-[24px] p-6 shadow-sm relative overflow-hidden flex items-center justify-between">
           <div className="flex flex-col relative z-10">
              <span className="text-[#FFFFFF] font-black text-[1.8rem] leading-none mb-1">20% OFF</span>
              <span className="text-[#888888] font-bold text-[0.85rem] mb-4">On express delivery</span>
              <button onClick={onBookParcel} className="text-[#FFFFFF] font-black text-[0.9rem] flex items-center gap-2 hover:underline">
                 Book now <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </button>
           </div>
           
           {/* Abstract Geometric Representation of Speed/Delivery */}
           <div className="relative z-10 w-24 h-24">
              <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
                 <path d="M10 50 L40 20 L90 20 L60 50 Z" fill="#FFFFFF" stroke="#111111" strokeWidth="2" strokeLinejoin="round"/>
                 <path d="M10 50 L60 50 L60 80 L10 80 Z" fill="#333333" stroke="#111111" strokeWidth="2" strokeLinejoin="round"/>
                 <path d="M60 50 L90 20 L90 50 L60 80 Z" fill="#888888" stroke="#111111" strokeWidth="2" strokeLinejoin="round"/>
                 <path d="M20 90 L80 90" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeDasharray="10 10"/>
              </svg>
           </div>
        </div>

        {/* Primary Action Routing */}
        <div className="grid grid-cols-2 gap-4">
           <button onClick={onBookParcel} className="bg-[#FFFFFF] text-[#000000] rounded-[24px] p-5 flex items-center justify-center gap-3 shadow-sm hover:scale-[1.02] transition-transform">
              <div className="w-10 h-10 bg-[#000000] rounded-full flex items-center justify-center text-[#FFFFFF]">
                 <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </div>
              <span className="font-black text-[1rem]">Send parcel</span>
           </button>
           
           <button onClick={() => onTrackParcel('')} className="bg-[#111111] border border-[#333333] text-[#FFFFFF] rounded-[24px] p-5 flex items-center justify-center gap-3 shadow-sm hover:border-[#FFFFFF] transition-colors">
              <div className="w-10 h-10 bg-[#000000] border border-[#333333] rounded-full flex items-center justify-center text-[#FFFFFF]">
                 <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              </div>
              <span className="font-black text-[1rem]">Track order</span>
           </button>
        </div>

        {/* Active Delivery Telemetry Component */}
        <div className="mt-4">
           <div className="flex items-center justify-between mb-4 pl-2">
              <span className="text-[#FFFFFF] font-black text-[1.2rem]">Active delivery</span>
           </div>

           {!activeOrder ? (
              <div className="bg-[#111111] border border-[#333333] rounded-[24px] p-8 flex flex-col items-center text-center shadow-sm">
                <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                <span className="text-[#FFFFFF] font-black text-[1.1rem] mb-1">No Active Dispatches</span>
                <span className="text-[#888888] font-bold text-[0.85rem]">Initiate a new delivery to monitor progress.</span>
              </div>
           ) : (
              <div onClick={() => onTrackParcel(activeOrder.id)} className="bg-[#111111] border border-[#333333] rounded-[24px] p-6 shadow-sm cursor-pointer hover:border-[#FFFFFF] transition-colors relative overflow-hidden">
                 
                 <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4">
                       <div className="w-14 h-14 bg-[#000000] border border-[#333333] rounded-full flex items-center justify-center text-[#FFFFFF]">
                          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                       </div>
                       <div className="flex flex-col">
                          <span className="text-[#888888] font-bold text-[0.75rem] uppercase tracking-widest mb-1">ID: {activeOrder.id.substring(0, 8).toUpperCase()}</span>
                          <span className="text-[#FFFFFF] font-black text-[1.1rem] leading-tight truncate max-w-[150px]">{activeOrder.dropoffLocation}</span>
                       </div>
                    </div>
                    <span className="bg-[#333333] text-[#FFFFFF] px-3 py-1 rounded-lg font-black text-[0.75rem] uppercase tracking-wider">{currentProgress.label}</span>
                 </div>

                 {/* Visual Tracking Slider */}
                 <div className="relative w-full mb-6">
                    {/* Background Track */}
                    <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full h-1 bg-[#333333] rounded-full"></div>
                    {/* Active Track */}
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 left-0 h-1 bg-[#FFFFFF] rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${(currentProgress.step / 5) * 100}%` }}
                    ></div>
                    
                    {/* Execution Nodes */}
                    <div className="relative z-10 flex justify-between items-center w-full">
                       {[1, 2, 3, 4, 5].map((step) => (
                         <div 
                           key={step} 
                           className={`w-4 h-4 rounded-full border-[3px] transition-colors duration-500 ${step <= currentProgress.step ? 'bg-[#FFFFFF] border-[#111111]' : 'bg-[#333333] border-[#111111]'}`}
                         ></div>
                       ))}
                    </div>
                 </div>

                 <div className="flex justify-between items-center px-1">
                    <div className="flex flex-col">
                       <span className="text-[#888888] font-bold text-[0.7rem] uppercase tracking-widest">Origin</span>
                       <span className="text-[#FFFFFF] font-black text-[0.85rem] truncate max-w-[100px]">{activeOrder.pickupLocation.split(',')[0]}</span>
                    </div>
                    <div className="flex flex-col text-right">
                       <span className="text-[#888888] font-bold text-[0.7rem] uppercase tracking-widest">Destination</span>
                       <span className="text-[#FFFFFF] font-black text-[0.85rem] truncate max-w-[100px]">{activeOrder.dropoffLocation.split(',')[0]}</span>
                    </div>
                 </div>

              </div>
           )}
        </div>
      </div>
    </div>
  );
}