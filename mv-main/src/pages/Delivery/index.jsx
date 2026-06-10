import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

// Import Advanced Logistics Modules
import AdvancedBookingEngine from './components/AdvancedBookingEngine';
import LiveBiddingSystem from './components/LiveBiddingSystem';
import PackageSecurityTracker from './components/PackageSecurityTracker';

/**
 * ============================================================================
 * COMPONENT: ENTERPRISE LOGISTICS PORTAL (MASTER CONTAINER)
 * Purpose: Dedicated consumer application for advanced point-to-point delivery.
 * Behavior: Orchestrates modular sub-components for complex routing, live bidding,
 * and secure package tracking.
 * Design System: Black (#000000), White (#FFFFFF), Grey (#F2F4F7), 
 * Stark (#111111).
 * Data Integrity: Operates strictly on live Firestore connections.
 * ============================================================================
 */

export default function DeliveryApp() {
  const [searchParams] = useSearchParams();
  const initialPickup = searchParams.get('pickup') || '';
  const initialDropoff = searchParams.get('dropoff') || '';

  const [activeTab, setActiveTab] = useState('Dispatch');
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({});
  const [wallet, setWallet] = useState({ balance: 0, coins: 0 });
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  const auth = getAuth();

  // 1. Establish Secure Authentication & Global State
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchUserProfile(currentUser.uid);
        initializeWalletStream(currentUser.uid);
        setIsAuthenticating(false);
      } else {
        window.location.href = '/'; // Strict redirection if unauthenticated
      }
    });
    return () => unsubscribeAuth();
  }, [auth]);

  const fetchUserProfile = async (uid) => {
    try {
      const docRef = doc(db, 'shopper_accounts', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data());
      }
    } catch (error) {
      console.error("Profile synchronization failed:", error);
    }
  };

  const initializeWalletStream = (uid) => {
    const walletQuery = query(collection(db, 'digital_wallets'), where('userId', '==', uid));
    const unsubscribeWallet = onSnapshot(walletQuery, (snapshot) => {
      if (!snapshot.empty) {
        setWallet(snapshot.docs[0].data());
      }
    });
    return () => unsubscribeWallet();
  };

  const executeSystemSignOut = async () => {
    await signOut(auth);
  };

  // 2. Global UI Components (Account & Finance)
  const renderAccount = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full min-h-screen bg-[#000000] pb-24">
      <div className="bg-[#111111] px-4 pt-10 pb-4 sticky top-0 z-40 flex items-center gap-4 border-b border-[#333333]">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        <h1 className="text-[#FFFFFF] font-black text-[1.5rem]">Profile Details</h1>
      </div>
      
      <div className="p-4">
        <div className="bg-[#111111] rounded-[24px] p-6 shadow-sm border border-[#333333] mb-4">
          <div className="flex items-center justify-between mb-6 border-b border-[#333333] pb-4">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-[#000000] border border-[#333333] rounded-full flex items-center justify-center text-[#FFFFFF]">
                 <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
               </div>
               <span className="text-[#FFFFFF] font-black text-[1.2rem]">Personal Details</span>
            </div>
            <span className="text-[#FFFFFF] font-black text-[0.95rem] cursor-pointer">Edit</span>
          </div>
          
          <div className="flex flex-col gap-2 mb-4">
             <span className="text-[#FFFFFF] font-black text-[1.1rem]">{profile.name || user?.email?.split('@')[0] || 'Authorized User'}</span>
             <span className="text-[#888888] font-bold text-[0.95rem]">{user?.email || 'admin@movyra.in'}</span>
          </div>

          <div className="bg-[#000000] inline-block px-3 py-1.5 rounded-lg border border-[#333333]">
             <span className="text-[#FFFFFF] font-black text-[0.95rem]">{profile.phone || '+91 - Authorized'}</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-6">
           <div className="bg-[#111111] rounded-[24px] p-5 shadow-sm border border-[#333333] flex flex-col gap-2">
             <div onClick={executeSystemSignOut} className="flex items-center justify-between cursor-pointer py-2">
               <div className="flex items-center gap-4">
                 <div className="text-[#FFFFFF]"><svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z"/></svg></div>
                 <span className="text-[#ff4444] font-black text-[1.1rem]">Sign Out</span>
               </div>
             </div>
           </div>
        </div>
      </div>
    </motion.div>
  );

  if (isAuthenticating) return <div className="min-h-screen bg-[#000000]"></div>;

  // 3. Primary Master Control Matrix Orchestration
  return (
    <div className="w-full min-h-screen bg-[#000000] font-sans selection:bg-[#FFFFFF] selection:text-[#000000] overflow-x-hidden">
      
      {/* Dynamic Module Rendering */}
      <AnimatePresence mode="wait">
        {activeTab === 'Dispatch' && (
          <motion.div key="dispatch">
            <AdvancedBookingEngine 
              user={user} 
              initialPickup={initialPickup} 
              initialDropoff={initialDropoff} 
              onRouteToBids={() => setActiveTab('Bids')} 
            />
          </motion.div>
        )}
        {activeTab === 'Bids' && (
          <motion.div key="bids">
            <LiveBiddingSystem user={user} />
          </motion.div>
        )}
        {activeTab === 'Tracking' && (
          <motion.div key="tracking">
            <PackageSecurityTracker user={user} profile={profile} />
          </motion.div>
        )}
        {activeTab === 'Account' && (
          <motion.div key="account">
            {renderAccount()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Bottom Navigation Architecture */}
      <div className="fixed bottom-0 left-0 w-full bg-[#111111] border-t border-[#333333] px-6 py-3 flex justify-between items-center z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        {[
          { id: 'Dispatch', icon: <svg viewBox="0 0 24 24" width="24" height="24" fill={activeTab === 'Dispatch' ? '#FFFFFF' : 'none'} stroke={activeTab === 'Dispatch' ? '#FFFFFF' : '#888888'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg> },
          { id: 'Bids', icon: <svg viewBox="0 0 24 24" width="24" height="24" fill={activeTab === 'Bids' ? '#FFFFFF' : 'none'} stroke={activeTab === 'Bids' ? '#FFFFFF' : '#888888'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> },
          { id: 'Tracking', icon: <svg viewBox="0 0 24 24" width="24" height="24" fill={activeTab === 'Tracking' ? '#FFFFFF' : 'none'} stroke={activeTab === 'Tracking' ? '#FFFFFF' : '#888888'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> },
          { id: 'Account', icon: <svg viewBox="0 0 24 24" width="24" height="24" fill={activeTab === 'Account' ? '#FFFFFF' : 'none'} stroke={activeTab === 'Account' ? '#FFFFFF' : '#888888'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> }
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