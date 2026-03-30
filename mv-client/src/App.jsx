import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Using standard Firebase Auth SDK directly to resolve import compilation issues
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// SECTION 1: Master Dependencies & Component Injections
import MobileAppLayout from './components/MobileAppLayout';
import OnboardingFlow from './components/Onboarding/OnboardingFlow';
import BottomNavBar from './components/Navigation/BottomNavBar';
import { useOnboardingStore } from './store/useOnboardingStore';

// ============================================================================
// PERFORMANCE OPTIMIZATION: React Lazy Loading
// Splitting the bundle to ensure the app loads instantly on weak 3G networks.
// ============================================================================
const MobileLogin = lazy(() => import('./pages/Auth/MobileLogin'));
const MobileSignup = lazy(() => import('./pages/Auth/MobileSignup'));
const OTPVerification = lazy(() => import('./pages/Auth/OTPVerification'));
const SetPassword = lazy(() => import('./pages/Auth/SetPassword')); 
const MobileHome = lazy(() => import('./pages/Dashboard/MobileHome'));

// Core Booking Engine
const SetLocation = lazy(() => import('./pages/Booking/SetLocation'));
const SelectVehicle = lazy(() => import('./pages/Booking/SelectVehicle'));
const BookingDetails = lazy(() => import('./pages/Booking/BookingDetails'));
const PriceSelection = lazy(() => import('./pages/Booking/PriceSelection'));
const SearchingDriver = lazy(() => import('./pages/Booking/SearchingDriver'));
const ReviewOrder = lazy(() => import('./pages/Booking/ReviewOrder'));

// Tracking & Delivery
const LiveTracking = lazy(() => import('./pages/Tracking/LiveTracking'));
const ShipmentDetail = lazy(() => import('./pages/Tracking/ShipmentDetail'));
const DeliveryComplete = lazy(() => import('./pages/Tracking/DeliveryComplete'));
const Rating = lazy(() => import('./pages/Tracking/Rating'));

// Profile, History & Support
const OrderHistory = lazy(() => import('./pages/order-history'));
const OrderDetails = lazy(() => import('./pages/OrderHistory/OrderDetails'));
const ProfileSettings = lazy(() => import('./pages/profile-settings'));
const SavedAddresses = lazy(() => import('./pages/Profile/SavedAddresses'));
const HelpCenter = lazy(() => import('./pages/Support/HelpCenter'));

// ============================================================================
// SHARED LOADING STATE
// Strictly covers the entire screen to prevent flickering of protected UI.
// Used for both Auth verification AND Lazy-Loading Suspense.
// ============================================================================
const GlobalLoadingScreen = () => (
  <div className="flex-1 flex flex-col items-center justify-center bg-white h-full min-h-screen z-[300] relative">
    <div className="w-12 h-12 rounded-md overflow-hidden bg-black flex items-center justify-center mb-6 shadow-md">
      <img src="/logo.png" alt="Movyra" className="w-full h-full object-cover" />
    </div>
    <motion.div 
      animate={{ rotate: 360 }} 
      transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} 
      className="w-8 h-8 border-4 border-black border-t-transparent rounded-full shadow-sm" 
    />
  </div>
);

// ============================================================================
// SECTION 7A: ENTERPRISE FIREBASE AUTHENTICATION GUARD (PROTECTED ROUTES)
// ============================================================================
const RequireAuthGuard = ({ authStatus }) => {
  if (authStatus === 'loading') return <GlobalLoadingScreen />;
  return authStatus === 'authenticated' 
    ? <Outlet /> 
    : <Navigate to="/auth-login" replace={true} />;
};

// ============================================================================
// SECTION 7B: REVERSE AUTHENTICATION GUARD (GUEST ROUTES)
// ============================================================================
const RequireGuestGuard = ({ authStatus }) => {
  if (authStatus === 'loading') return <GlobalLoadingScreen />;
  return authStatus === 'unauthenticated' 
    ? <Outlet /> 
    : <Navigate to="/dashboard-home" replace={true} />;
};

// ============================================================================
// MAIN VIEWPORT CONTROLLER
// Handles global auth state, routing, and Bottom NavBar visibility
// ============================================================================
const MainViewport = ({ authStatus }) => {
  const location = useLocation();
  
  // SECTION 2: Dynamic Navigation Visibility Engine
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard-home') return 'home';
    if (path === '/tracking-active') return 'tracking';
    if (path === '/order-history' || path === '/expense-tracker') return 'history';
    if (path === '/profile-settings') return 'profile';
    return null; 
  };

  const activeTab = getActiveTab();

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden font-sans relative">
      
      {/* SECTION 3: Animated Viewport Controller */}
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
            {/* Suspense Wrapper for Lazy Loaded Routes */}
            <Suspense fallback={<GlobalLoadingScreen />}>
              <Routes location={location}>
                
                {/* GUEST NODE */}
                <Route element={<RequireGuestGuard authStatus={authStatus} />}>
                  <Route path="/auth-login" element={<MobileLogin />} />
                  <Route path="/auth-signup" element={<MobileSignup />} />
                  <Route path="/auth/otp" element={<OTPVerification />} />
                  <Route path="/auth/set-password" element={<SetPassword />} />
                </Route>
                
                {/* PROTECTED NODE */}
                <Route element={<RequireAuthGuard authStatus={authStatus} />}>
                  <Route element={<MobileAppLayout title="Movyra" />}>
                    <Route path="/" element={<MobileHome />} />
                    <Route path="/dashboard-home" element={<MobileHome />} />
                    
                    {/* Booking Engine Routes */}
                    <Route path="/booking/set-location" element={<SetLocation />} />
                    <Route path="/booking/select-vehicle" element={<SelectVehicle />} />
                    <Route path="/booking/details" element={<BookingDetails />} />
                    <Route path="/booking/price-selection" element={<PriceSelection />} />
                    <Route path="/booking/searching" element={<SearchingDriver />} />
                    <Route path="/booking/review" element={<ReviewOrder />} />
                    
                    {/* Tracking & Delivery Routes */}
                    <Route path="/tracking-active" element={<LiveTracking />} />
                    <Route path="/tracking/detail/:id" element={<ShipmentDetail />} />
                    <Route path="/tracking/complete" element={<DeliveryComplete />} />
                    <Route path="/tracking/rating" element={<Rating />} />
                    
                    {/* History & Finances */}
                    <Route path="/order-history" element={<OrderHistory />} />
                    <Route path="/order-history/detail/:id" element={<OrderDetails />} />
                    <Route path="/expense-tracker" element={<OrderHistory />} /> {/* Shares UI with history toggle */}
                    
                    {/* Profile & Settings Routes */}
                    <Route path="/profile-settings" element={<ProfileSettings />} />
                    <Route path="/profile/addresses" element={<SavedAddresses />} />
                    <Route path="/support/dispute" element={<HelpCenter />} />
                  </Route>
                </Route>
              </Routes>
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* SECTION 5: Global Persistent Bottom Dock Injection */}
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
// Manages the single source of truth for Authentication Status
// ============================================================================
export default function App() {
  const hasCompletedOnboarding = useOnboardingStore(state => state.hasCompletedOnboarding);
  
  // TRI-STATE AUTH LOGIC: loading | authenticated | unauthenticated
  const [authStatus, setAuthStatus] = useState('loading');

  useEffect(() => {
    // Persistent listener that survives path changes
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthStatus('authenticated');
      } else {
        setAuthStatus('unauthenticated');
      }
    }, (error) => {
      console.error("Firebase Auth Root Error:", error);
      setAuthStatus('unauthenticated');
    });

    return () => unsubscribe();
  }, []);

  const handleOnboardingComplete = () => {
    useOnboardingStore.setState({ hasCompletedOnboarding: true });
  };

  // STRICT GUARD: Intercept the render cycle if the user has not completed onboarding
  if (!hasCompletedOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }
  
  return (
    <BrowserRouter>
      <MainViewport authStatus={authStatus} />
    </BrowserRouter>
  );
}