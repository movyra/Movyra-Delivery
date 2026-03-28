import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// SECTION 1: Master Dependencies & Component Injections
import MobileAppLayout from './components/MobileAppLayout';
import OnboardingFlow from './components/Onboarding/OnboardingFlow';
import MobileLogin from './pages/Auth/MobileLogin';
import MobileSignup from './pages/Auth/MobileSignup';
import OTPVerification from './pages/Auth/OTPVerification';
import MobileHome from './pages/Dashboard/MobileHome';
import SetLocation from './pages/Booking/SetLocation';
import SelectVehicle from './pages/Booking/SelectVehicle';
import ReviewOrder from './pages/Booking/ReviewOrder';
import LiveTracking from './pages/Tracking/LiveTracking';
import ShipmentDetail from './pages/Tracking/ShipmentDetail'; // NEW INJECTION
import OrderHistory from './pages/order-history';
import ProfileSettings from './pages/profile-settings';
import BottomNavBar from './components/Navigation/BottomNavBar';

// Real-Time Global Store Injection
import { useOnboardingStore } from './store/useOnboardingStore';

// ============================================================================
// MAIN VIEWPORT CONTROLLER
// Handles dynamic routing, page transitions, and Bottom NavBar visibility
// ============================================================================
const MainViewport = () => {
  const location = useLocation();
  
  // SECTION 2: Dynamic Navigation Visibility Engine
  // Real logic to determine if the Bottom Dock should be rendered based on the URL context
  // Prevents the dock from overlapping full-screen maps or authentication flows.
  const getActiveTab = () => {
    const path = location.pathname;
    // Core Hub Screens that require the navigation dock
    if (path === '/' || path === '/dashboard-home') return 'home';
    if (path === '/tracking-active') return 'tracking';
    if (path === '/order-history') return 'shipments';
    if (path === '/profile-settings') return 'settings';
    
    // Return null to completely unmount the nav bar on Auth/Booking/Detail flows
    return null; 
  };

  const activeTab = getActiveTab();

  return (
    <div className="flex flex-col h-screen bg-movyra-surface overflow-hidden font-sans relative">
      
      {/* SECTION 3: Animated Viewport Controller */}
      {/* Utilizes Framer Motion to create smooth cross-fades between routes */}
      <div className="flex-1 overflow-y-auto no-scrollbar relative z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="min-h-full"
          >
            {/* SECTION 4: Core Routing Matrix */}
            <Routes location={location}>
              {/* Authentication Node */}
              <Route path="/auth-login" element={<MobileLogin />} />
              <Route path="/auth-signup" element={<MobileSignup />} />
              <Route path="/auth/otp" element={<OTPVerification />} />
              
              {/* Protected / Main Application Node */}
              <Route element={<MobileAppLayout />}>
                <Route path="/" element={<MobileHome />} />
                <Route path="/dashboard-home" element={<MobileHome />} />
                
                {/* Booking Engine Routes */}
                <Route path="/booking/set-location" element={<SetLocation />} />
                <Route path="/booking/select-vehicle" element={<SelectVehicle />} />
                <Route path="/booking/review" element={<ReviewOrder />} />
                
                {/* Tracking & History Routes */}
                <Route path="/tracking-active" element={<LiveTracking />} />
                <Route path="/tracking/detail/:id" element={<ShipmentDetail />} />
                <Route path="/order-history" element={<OrderHistory />} />
                
                {/* Profile & Settings Route */}
                <Route path="/profile-settings" element={<ProfileSettings />} />
              </Route>
            </Routes>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* SECTION 5: Global Persistent Bottom Dock Injection */}
      {/* Rendered OUTSIDE the routing switch to persist state during core tab navigation */}
      <AnimatePresence>
        {activeTab && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute bottom-0 left-0 right-0 z-50"
          >
            <BottomNavBar activeTab={activeTab} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// ROOT APPLICATION INJECTION
// Manages the strict Onboarding Guard based on Zustand Global State
// ============================================================================
export default function App() {
  // SECTION 6: Zustand Global State Interceptor
  // Pulls the real-time completion status from the persisted store
  const hasCompletedOnboarding = useOnboardingStore(state => state.hasCompletedOnboarding);

  const handleOnboardingComplete = () => {
    // Write directly to the Zustand store, which persists automatically to localStorage.
    // This unlocks the main application routing.
    useOnboardingStore.setState({ hasCompletedOnboarding: true });
  };

  // STRICT GUARD: Intercept the render cycle if the user has not completed the real-time flow.
  // This locks the user into the Onboarding component regardless of their URL path.
  if (!hasCompletedOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }
  
  // Initialize the core application and router ONLY when the global state allows
  return (
    <BrowserRouter>
      <MainViewport />
    </BrowserRouter>
  );
}