import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { onAuthStateChanged } from 'firebase/auth';

// Real Pre-Initialized Firebase Auth Instance
import { auth } from './services/firebaseAuth';

// SECTION 1: Master Dependencies & Component Injections
import MobileAppLayout from './components/MobileAppLayout';
import OnboardingFlow from './components/Onboarding/OnboardingFlow';
import MobileLogin from './pages/Auth/MobileLogin';
import MobileSignup from './pages/Auth/MobileSignup';
import OTPVerification from './pages/Auth/OTPVerification';
import SetPassword from './pages/Auth/SetPassword'; 
import MobileHome from './pages/Dashboard/MobileHome';
import SetLocation from './pages/Booking/SetLocation';
import SelectVehicle from './pages/Booking/SelectVehicle';
import ReviewOrder from './pages/Booking/ReviewOrder';
import LiveTracking from './pages/Tracking/LiveTracking';
import ShipmentDetail from './pages/Tracking/ShipmentDetail';
import OrderHistory from './pages/order-history';
import ProfileSettings from './pages/profile-settings';
import BottomNavBar from './components/Navigation/BottomNavBar';

// Real-Time Global Store Injection
import { useOnboardingStore } from './store/useOnboardingStore';

// ============================================================================
// SHARED LOADING STATE (Used during Firebase Auth resolution)
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
// Strictly locks out unauthenticated users. Uses 'replace' to fix loops.
// ============================================================================
const RequireAuthGuard = ({ isAuthenticated }) => {
  if (isAuthenticated === null) return <GlobalLoadingScreen />;
  // Using replace={true} is critical to prevent history stack loops
  return isAuthenticated ? <Outlet /> : <Navigate to="/auth-login" replace={true} />;
};

// ============================================================================
// SECTION 7B: REVERSE AUTHENTICATION GUARD (GUEST ROUTES)
// Prevents logged-in users from seeing Auth screens. Uses 'replace' to fix loops.
// ============================================================================
const RequireGuestGuard = ({ isAuthenticated }) => {
  if (isAuthenticated === null) return <GlobalLoadingScreen />;
  // Using replace={true} is critical to prevent history stack loops
  return !isAuthenticated ? <Outlet /> : <Navigate to="/dashboard-home" replace={true} />;
};

// ============================================================================
// MAIN VIEWPORT CONTROLLER
// Handles global auth state, routing, and Bottom NavBar visibility
// ============================================================================
const MainViewport = () => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  // LIFTOUT: Global Auth State resolved BEFORE routing is evaluated
  // This refined listener prevents race conditions during internal redirects.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Explicitly check for boolean truthiness to avoid re-renders during hydration
      setIsAuthenticated(!!user);
    }, (error) => {
      console.error("Firebase Auth Listener Error:", error);
      setIsAuthenticated(false);
    });
    return () => unsubscribe();
  }, []);
  
  // SECTION 2: Dynamic Navigation Visibility Engine
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard-home') return 'home';
    if (path === '/tracking-active') return 'tracking';
    if (path === '/order-history') return 'history';
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
            {/* SECTION 4: Core Routing Matrix */}
            <Routes location={location}>
              
              {/* GUEST NODE: Locked if user is already logged in */}
              <Route element={<RequireGuestGuard isAuthenticated={isAuthenticated} />}>
                <Route path="/auth-login" element={<MobileLogin />} />
                <Route path="/auth-signup" element={<MobileSignup />} />
                <Route path="/auth/otp" element={<OTPVerification />} />
                <Route path="/auth/set-password" element={<SetPassword />} />
              </Route>
              
              {/* PROTECTED NODE: Locked if user is NOT logged in */}
              <Route element={<RequireAuthGuard isAuthenticated={isAuthenticated} />}>
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
              </Route>
            </Routes>
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
// Manages the strict Onboarding Guard based on Zustand Global State
// ============================================================================
export default function App() {
  // SECTION 6: Zustand Global State Interceptor
  const hasCompletedOnboarding = useOnboardingStore(state => state.hasCompletedOnboarding);

  const handleOnboardingComplete = () => {
    useOnboardingStore.setState({ hasCompletedOnboarding: true });
  };

  // STRICT GUARD: Intercept the render cycle if the user has not completed onboarding
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