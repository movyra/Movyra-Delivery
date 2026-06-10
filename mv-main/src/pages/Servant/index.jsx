import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

/**
 * ============================================================================
 * COMPONENT: LOCAL SERVICES PORTAL (mv-main)
 * Purpose: Dedicated consumer application for domestic personnel and home services.
 * Behavior: Manages category browsing, service scheduling, and active contracts.
 * Design System: Black (#000000), White (#FFFFFF), Grey (#F2F4F7), 
 * Stark (#111111), Accent (#00A9F7).
 * Data Integrity: Operates strictly on authenticated Firestore connections.
 * ============================================================================
 */

export default function ServantApp() {
  const [activeTab, setActiveTab] = useState('Explore');
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const auth = getAuth();

  // 1. Establish Secure Authentication & Live Data Streams
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        initializeDataStreams(currentUser.uid);
      } else {
        window.location.href = '/'; // Enforce strict routing protocol
      }
    });
    return () => unsubscribeAuth();
  }, [auth]);

  const initializeDataStreams = (uid) => {
    // Stream Active & Historical Service Bookings
    const bookingQuery = query(collection(db, 'service_bookings'), where('userId', '==', uid), orderBy('serviceDate', 'desc'));
    const unsubscribeBookings = onSnapshot(bookingQuery, (snapshot) => {
      setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeBookings();
    };
  };

  // 2. Functional Transaction Dispatcher
  const handleServiceDispatch = async () => {
    if (!selectedService || !user) return;
    setIsBooking(true);
    try {
      
      // Calculate future service date (Tomorrow 9:00 AM)
      const serviceTime = new Date();
      serviceTime.setDate(serviceTime.getDate() + 1);
      serviceTime.setHours(9, 0, 0, 0);

      await addDoc(collection(db, 'service_bookings'), {
        userId: user.uid,
        serviceCategory: selectedService.title,
        status: 'Scheduled',
        price: selectedService.price,
        serviceDate: serviceTime,
        createdAt: serverTimestamp(),
        personnelType: selectedService.personnel
      });
      setIsBooking(false);
      setSelectedService(null);
      setActiveTab('Contracts');
    } catch (error) {
      console.error("Service scheduling failed:", error);
      setIsBooking(false);
    }
  };

  // 3. Application Data Matrices
  const serviceCategories = [
    { id: 'cleaning', title: 'Standard House Cleaning', price: 499, personnel: 'Verified Cleaner', duration: '2 Hours', icon: <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg> },
    { id: 'deep_cleaning', title: 'Deep Home Sanitization', price: 2499, personnel: 'Cleaning Team (3)', duration: '6 Hours', icon: <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg> },
    { id: 'cooking', title: 'Professional Home Chef', price: 399, personnel: 'Verified Cook', duration: 'Per Meal', icon: <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg> },
    { id: 'maid', title: 'Monthly Domestic Help', price: 6500, personnel: 'Verified Maid', duration: 'Monthly Contract', icon: <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> }
  ];

  // 4. Tab Rendering Matrices
  const renderExplore = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pb-24">
      
      {/* Brand Header */}
      <div className="bg-[#111111] px-6 pt-10 pb-8 rounded-b-[40px] shadow-sm relative z-40 border-b border-[#333333]">
        <h1 className="text-[#FFFFFF] font-black text-[2rem] leading-tight mb-2">Local Services</h1>
        <p className="text-[#888888] font-bold text-[0.95rem]">Verified personnel for your domestic needs.</p>
      </div>

      <div className="px-4 mt-6">
        
        {/* Verification Trust Banner */}
        <div className="w-full bg-[#111111] border border-[#333333] rounded-[24px] p-5 flex items-center justify-between shadow-sm mb-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#00A9F7]/10 rounded-full flex items-center justify-center text-[#00A9F7]">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[#FFFFFF] font-black text-[1rem]">100% Verified Personnel</span>
              <span className="text-[#888888] font-bold text-[0.75rem]">Background checked & trained professionals.</span>
            </div>
          </div>
        </div>

        <h3 className="text-[#FFFFFF] font-black text-[1.2rem] mb-4 pl-2">Available Categories</h3>
        
        {/* Service Category Matrix */}
        <div className="flex flex-col gap-4 mb-8">
          {serviceCategories.map((service) => (
            <div key={service.id} className="bg-[#111111] border border-[#333333] rounded-[24px] p-5 flex flex-col shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#000000] border border-[#333333] rounded-full flex items-center justify-center text-[#00A9F7]">
                    {service.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[#FFFFFF] font-black text-[1.1rem]">{service.title}</span>
                    <span className="text-[#888888] font-bold text-[0.8rem]">{service.personnel}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[#FFFFFF] font-black text-[1.2rem]">₹{service.price}</span>
                  <span className="text-[#888888] font-bold text-[0.7rem] uppercase tracking-wider">{service.duration}</span>
                </div>
              </div>
              <button onClick={() => setSelectedService(service)} className="w-full bg-[#FFFFFF] text-[#111111] py-3 rounded-xl font-black text-[0.95rem] hover:bg-[#F2F4F7] transition-colors mt-2">
                Schedule Service
              </button>
            </div>
          ))}
        </div>

      </div>

      {/* Dispatch Modal Overlay */}
      <AnimatePresence>
        {selectedService && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-[#000000]/80 backdrop-blur-sm flex items-end justify-center">
            <motion.div initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }} className="w-full max-w-[600px] bg-[#111111] border-t border-[#333333] rounded-t-3xl p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-[1.5rem] text-[#FFFFFF]">Confirm Schedule</h3>
                <button onClick={() => setSelectedService(null)} className="w-8 h-8 flex items-center justify-center text-[#FFFFFF]"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
              </div>
              
              <div className="bg-[#000000] border border-[#333333] rounded-[20px] p-5 mb-8 flex flex-col gap-4">
                 <div className="flex justify-between items-center pb-4 border-b border-[#333333]">
                   <span className="text-[#888888] font-bold text-[0.9rem]">Service Type</span>
                   <span className="text-[#FFFFFF] font-black text-[0.95rem]">{selectedService.title}</span>
                 </div>
                 <div className="flex justify-between items-center pb-4 border-b border-[#333333]">
                   <span className="text-[#888888] font-bold text-[0.9rem]">Estimated Cost</span>
                   <span className="text-[#FFFFFF] font-black text-[0.95rem]">₹{selectedService.price}</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-[#888888] font-bold text-[0.9rem]">Schedule Date</span>
                   <span className="text-[#00A9F7] font-black text-[0.95rem]">Tomorrow, 09:00 AM</span>
                 </div>
              </div>

              <button onClick={handleServiceDispatch} disabled={isProcessing} className="w-full bg-[#FFFFFF] text-[#111111] py-4 rounded-xl font-black text-[1.1rem] hover:bg-[#F2F4F7] transition-colors disabled:opacity-50 shadow-md">
                {isProcessing ? 'Securing Personnel...' : 'Confirm Booking'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  const renderContracts = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full min-h-screen bg-[#000000] pb-24">
      <div className="bg-[#111111] px-6 pt-10 pb-4 sticky top-0 z-40 shadow-sm border-b border-[#333333]">
        <h1 className="text-[#FFFFFF] font-black text-[1.8rem]">Active Contracts</h1>
      </div>
      
      <div className="p-4">
        {bookings.length === 0 ? (
          <div className="bg-[#111111] rounded-[24px] p-8 flex flex-col items-center text-center shadow-sm border border-[#333333] mt-4">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#333333" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            <span className="text-[#FFFFFF] font-black text-[1.1rem] mb-2">No active service records.</span>
            <span className="text-[#888888] font-bold text-[0.85rem]">Explore the services tab to schedule domestic personnel.</span>
          </div>
        ) : (
          <div className="flex flex-col gap-4 mt-2">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-[#111111] rounded-[24px] shadow-sm border border-[#333333] overflow-hidden">
                <div className="p-5 flex justify-between items-start border-b border-[#333333]">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#000000] border border-[#333333] rounded-full flex items-center justify-center text-[#FFFFFF]">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="4"></circle><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path></svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[#FFFFFF] font-black text-[1.1rem]">{booking.serviceCategory}</span>
                      <span className="text-[#888888] font-bold text-[0.8rem]">{booking.personnelType}</span>
                    </div>
                  </div>
                  <span className="text-[#FFFFFF] font-black text-[1.2rem]">₹{booking.price}</span>
                </div>
                
                <div className="px-5 py-4 bg-[#000000]/50 flex items-center justify-between">
                   <div className="flex flex-col">
                      <span className="text-[#888888] font-bold text-[0.7rem] uppercase tracking-wider mb-1">Scheduled For</span>
                      <span className="text-[#FFFFFF] font-black text-[0.95rem]">
                        {booking.serviceDate ? new Date(booking.serviceDate.toDate()).toLocaleString() : 'Processing...'}
                      </span>
                   </div>
                   <div className="bg-[#00A9F7]/10 border border-[#00A9F7]/30 px-3 py-1.5 rounded-lg flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#00A9F7] animate-pulse"></div>
                      <span className="text-[#00A9F7] font-black text-[0.8rem] uppercase tracking-wider">{booking.status}</span>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );

  // 5. Primary Master Control Matrix
  return (
    <div className="w-full min-h-screen bg-[#000000] font-sans selection:bg-[#FFFFFF] selection:text-[#000000] overflow-x-hidden">
      
      {/* Dynamic Content Frame */}
      <AnimatePresence mode="wait">
        {activeTab === 'Explore' && <motion.div key="explore">{renderExplore()}</motion.div>}
        {activeTab === 'Contracts' && <motion.div key="contracts">{renderContracts()}</motion.div>}
      </AnimatePresence>

      {/* Global Bottom Navigation Architecture */}
      <div className="fixed bottom-0 left-0 w-full bg-[#111111] border-t border-[#333333] px-6 py-3 flex justify-around items-center z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        {[
          { id: 'Explore', icon: <svg viewBox="0 0 24 24" width="24" height="24" fill={activeTab === 'Explore' ? '#FFFFFF' : 'none'} stroke={activeTab === 'Explore' ? '#FFFFFF' : '#888888'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg> },
          { id: 'Contracts', icon: <svg viewBox="0 0 24 24" width="24" height="24" fill={activeTab === 'Contracts' ? '#FFFFFF' : 'none'} stroke={activeTab === 'Contracts' ? '#FFFFFF' : '#888888'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> },
        ].map((tab) => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id)} 
            className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === tab.id ? 'text-[#FFFFFF]' : 'text-[#888888] hover:text-[#FFFFFF]'}`}
          >
            {tab.icon}
            <span className="text-[0.7rem] font-black tracking-wide">{tab.id}</span>
          </button>
        ))}
      </div>
    </div>
  );
}