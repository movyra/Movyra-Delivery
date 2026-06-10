import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

// Import New Visual Architecture Components
import DeliveryOnboarding from './components/DeliveryOnboarding';
import DeliveryDashboard from './components/DeliveryDashboard';
import SendParcelForm from './components/SendParcelForm';
import ActiveTrackingMap from './components/ActiveTrackingMap';
import QRScanner from './components/QRScanner';

/**
 * ============================================================================
 * COMPONENT: ENTERPRISE LOGISTICS PORTAL (MASTER CONTAINER)
 * Purpose: Dedicated consumer application for advanced point-to-point delivery.
 * Behavior: Orchestrates modular sub-components for onboarding, booking,
 * and secure geospatial tracking based on reference architecture.
 * Design System: Black (#000000), White (#FFFFFF), Grey (#F2F4F7), 
 * Stark (#111111).
 * Data Integrity: Operates strictly on live Firestore connections.
 * ============================================================================
 */

export default function DeliveryApp() {
  const [searchParams] = useSearchParams();
  const initialAction = searchParams.get('action') || null;

  // View Orchestration States
  // 'Onboarding' | 'Dashboard' | 'SendParcel' | 'TrackingMap' | 'QRScanner'
  const [activeView, setActiveView] = useState('Dashboard'); 
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // Global Context States
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({});
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [activeTrackingId, setActiveTrackingId] = useState(null);

  const auth = getAuth();

  // 1. Establish Secure Authentication & Global State
  useEffect(() => {
    // Check local storage for onboarding completion to bypass carousel on return visits
    const onboardingStatus = localStorage.getItem('movyra_delivery_onboarded');
    if (!onboardingStatus) {
      setActiveView('Onboarding');
    } else {
      setHasCompletedOnboarding(true);
      if (initialAction === 'track') setActiveView('TrackingMap');
    }

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchUserProfile(currentUser.uid);
        setIsAuthenticating(false);
      } else {
        // Enforce strict routing protocol - redirect to main login gateway
        window.location.href = '/'; 
      }
    });
    return () => unsubscribeAuth();
  }, [auth, initialAction]);

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

  // 2. View Transition Controllers
  const handleOnboardingComplete = () => {
    localStorage.setItem('movyra_delivery_onboarded', 'true');
    setHasCompletedOnboarding(true);
    setActiveView('Dashboard');
  };

  const handleInitiateBooking = () => {
    setActiveView('SendParcel');
  };

  const handleInitiateTracking = (trackingId) => {
    setActiveTrackingId(trackingId);
    setActiveView('TrackingMap');
  };

  const handleOpenScanner = () => {
    setActiveView('QRScanner');
  };

  const handleReturnToDashboard = () => {
    setActiveView('Dashboard');
    setActiveTrackingId(null);
  };

  if (isAuthenticating) return <div className="min-h-screen bg-[#000000]"></div>;

  // 3. Primary Master Control Matrix Orchestration
  return (
    <div className="w-full min-h-screen bg-[#000000] font-sans selection:bg-[#FFFFFF] selection:text-[#000000] overflow-x-hidden">
      
      {/* Dynamic Module Rendering Engine */}
      <AnimatePresence mode="wait">
        
        {activeView === 'Onboarding' && (
          <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <DeliveryOnboarding onComplete={handleOnboardingComplete} />
          </motion.div>
        )}

        {activeView === 'Dashboard' && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <DeliveryDashboard 
              user={user} 
              profile={profile}
              onBookParcel={handleInitiateBooking}
              onTrackParcel={handleInitiateTracking}
              onOpenScanner={handleOpenScanner}
            />
            {/* Standard Global Bottom Navigation for Dashboard Only */}
            <div className="fixed bottom-0 left-0 w-full bg-[#111111] border-t border-[#333333] px-6 py-4 flex justify-around items-center z-50 rounded-t-[30px] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
              <button className="flex flex-col items-center gap-1 text-[#FFFFFF]">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                <span className="text-[0.7rem] font-bold">Home</span>
              </button>
              <button className="flex flex-col items-center gap-1 text-[#888888] hover:text-[#FFFFFF] transition-colors">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
                <span className="text-[0.7rem] font-bold">Order</span>
              </button>
              <div className="relative -top-8 bg-[#111111] rounded-full p-2">
                <button onClick={handleInitiateBooking} className="w-14 h-14 bg-[#FFFFFF] rounded-full flex items-center justify-center text-[#111111] shadow-lg hover:scale-105 transition-transform">
                   <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
              </div>
              <button onClick={() => setActiveView('TrackingMap')} className="flex flex-col items-center gap-1 text-[#888888] hover:text-[#FFFFFF] transition-colors">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>
                <span className="text-[0.7rem] font-bold">Tracking</span>
              </button>
              <button className="flex flex-col items-center gap-1 text-[#888888] hover:text-[#FFFFFF] transition-colors">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <span className="text-[0.7rem] font-bold">Profile</span>
              </button>
            </div>
          </motion.div>
        )}

        {activeView === 'SendParcel' && (
          <motion.div key="sendparcel" initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }}>
            <SendParcelForm 
              user={user} 
              onBack={handleReturnToDashboard} 
              onComplete={(trackingId) => handleInitiateTracking(trackingId)}
            />
          </motion.div>
        )}

        {activeView === 'TrackingMap' && (
          <motion.div key="trackingmap" initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }}>
            <ActiveTrackingMap 
              trackingId={activeTrackingId} 
              onBack={handleReturnToDashboard} 
            />
          </motion.div>
        )}

        {activeView === 'QRScanner' && (
          <motion.div key="qrscanner" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
            <QRScanner 
              onBack={handleReturnToDashboard} 
              onScanComplete={handleInitiateTracking}
            />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}