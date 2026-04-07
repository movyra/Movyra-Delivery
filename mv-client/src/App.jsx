import React, { useState, useEffect, Suspense, lazy, Component, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Import initialized auth instance
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebaseAuth';

// Master Dependencies & Component Injections
import MobileAppLayout from './components/MobileAppLayout';
import OnboardingFlow from './components/Onboarding/OnboardingFlow';
import BottomNavBar from './components/Navigation/BottomNavBar';
import NetworkStatus from './components/UI/NetworkStatus';
import { useOnboardingStore } from './store/useOnboardingStore';
import usePreferencesStore from './store/usePreferencesStore';

// React Lazy Loading for Performance
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

// Profile, History, Business & Support
const OrderHistory = lazy(() => import('./pages/order-history'));
const OrderDetails = lazy(() => import('./pages/OrderHistory/OrderDetails'));
const ProfileSettings = lazy(() => import('./pages/profile-settings'));
const SavedAddresses = lazy(() => import('./pages/Profile/SavedAddresses'));
const HelpCenter = lazy(() => import('./pages/Support/HelpCenter'));
const InvoiceDashboard = lazy(() => import('./pages/Business/InvoiceDashboard'));

// GLOBAL ERROR BOUNDARY: Prevents fatal white screens during network drops
class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  componentDidCatch(error, errorInfo) { console.error("Global Error Boundary:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-[#111111] h-screen min-h-screen z-[999] relative px-6 text-center font-sans">
          <img src="/logo.png" alt="Movyra" className="w-16 h-16 object-contain mb-6" />
          <h1 className="text-[24px] font-black text-black dark:text-white mb-2">Network Sync Error</h1>
          <p className="text-[15px] font-bold text-gray-500 mb-8 max-w-[280px]">The update stream was interrupted. Tap below to reconnect.</p>
          <button onClick={() => window.location.reload(true)} className="w-full max-w-[280px] bg-black dark:bg-white text-white dark:text-black py-4 rounded-full font-bold">Retry Sync</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const GlobalLoadingScreen = () => (
  <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-[#111111] h-full min-h-screen z-[300] relative">
    <img src="/logo.png" alt="Movyra" className="w-16 h-16 object-contain mb-6" />
    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} className="w-8 h-8 border-4 border-black dark:border-white border-t-transparent dark:border-t-transparent rounded-full" />
  </div>
);

const RequireAuthGuard = ({ authStatus }) => {
  if (authStatus === 'loading') return <GlobalLoadingScreen />;
  return authStatus === 'authenticated' ? <Outlet /> : <Navigate to="/auth-login" replace={true} />;
};

const RequireGuestGuard = ({ authStatus }) => {
  if (authStatus === 'loading') return <GlobalLoadingScreen />;
  return authStatus === 'unauthenticated' ? <Outlet /> : <Navigate to="/dashboard-home" replace={true} />;
};

const MainViewport = ({ authStatus }) => {
  const location = useLocation();
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
    <div className="flex flex-col h-screen bg-white dark:bg-[#111111] overflow-hidden font-sans relative">
      <div className="flex-1 overflow-y-auto no-scrollbar relative z-0">
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="min-h-full">
            <Suspense fallback={<GlobalLoadingScreen />}>
              <Routes location={location}>
                <Route element={<RequireGuestGuard authStatus={authStatus} />}>
                  <Route path="/auth-login" element={<MobileLogin />} />
                  <Route path="/auth-signup" element={<MobileSignup />} />
                  <Route path="/auth/otp" element={<OTPVerification />} />
                  <Route path="/auth/set-password" element={<SetPassword />} />
                </Route>
                <Route element={<RequireAuthGuard authStatus={authStatus} />}>
                  <Route element={<MobileAppLayout title="Movyra" />}>
                    <Route path="/" element={<MobileHome />} />
                    <Route path="/dashboard-home" element={<MobileHome />} />
                    <Route path="/booking/set-location" element={<SetLocation />} />
                    <Route path="/booking/select-vehicle" element={<SelectVehicle />} />
                    <Route path="/booking/details" element={<BookingDetails />} />
                    <Route path="/booking/price-selection" element={<PriceSelection />} />
                    <Route path="/booking/searching" element={<SearchingDriver />} />
                    <Route path="/booking/review" element={<ReviewOrder />} />
                    <Route path="/tracking-active" element={<LiveTracking />} />
                    <Route path="/tracking/detail/:id" element={<ShipmentDetail />} />
                    <Route path="/tracking/complete" element={<DeliveryComplete />} />
                    <Route path="/tracking/rating" element={<Rating />} />
                    <Route path="/order-history" element={<OrderHistory />} />
                    <Route path="/order-history/detail/:id" element={<OrderDetails />} />
                    <Route path="/expense-tracker" element={<OrderHistory />} />
                    <Route path="/business/invoices" element={<InvoiceDashboard />} />
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
      <AnimatePresence>
        {activeTab && (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="absolute bottom-0 left-0 right-0 z-50">
            <BottomNavBar activeTab={activeTab} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const hasCompletedOnboarding = useOnboardingStore(state => state.hasCompletedOnboarding);
  const theme = usePreferencesStore(state => state.theme);
  const [authStatus, setAuthStatus] = useState('loading');
  const currentVersionRef = useRef(null);

  // THEME ENGINE
  useEffect(() => {
    const root = document.documentElement;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = () => {
      if (theme === 'dark' || (theme === 'system' && systemPrefersDark.matches)) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };
    applyTheme();
    const listener = () => { if (theme === 'system') applyTheme(); };
    systemPrefersDark.addEventListener('change', listener);
    return () => systemPrefersDark.removeEventListener('change', listener);
  }, [theme]);

  // INSTANT UPDATE WATCHER: Polls every 5 seconds for a version bump
  useEffect(() => {
    const checkAppVersion = async () => {
      try {
        // Use unique timestamp to bypass all CDN and browser caches strictly
        const response = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
        if (!response.ok) return;

        const data = await response.json();
        
        if (!currentVersionRef.current) {
          currentVersionRef.current = data.version;
        } else if (currentVersionRef.current !== data.version) {
          console.log(`[Push Update] Version ${data.version} detected. Force refreshing app...`);
          // Hard reload strictly bypasses cache to get fresh files
          window.location.reload(true);
        }
      } catch (err) {
        // Silent catch to prevent UI disruption during network flickers
      }
    };

    // Initial check on load
    checkAppVersion();
    // High-frequency polling (5 seconds) as requested
    const pollInterval = setInterval(checkAppVersion, 5000);
    return () => clearInterval(pollInterval);
  }, []);

  // Auth Observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthStatus(user ? 'authenticated' : 'unauthenticated');
    }, () => setAuthStatus('unauthenticated'));
    return () => unsubscribe();
  }, []);

  if (!hasCompletedOnboarding) {
    return <OnboardingFlow onComplete={() => useOnboardingStore.setState({ hasCompletedOnboarding: true })} />;
  }
  
  return (
    <BrowserRouter>
      <GlobalErrorBoundary>
        <NetworkStatus />
        <MainViewport authStatus={authStatus} />
      </GlobalErrorBoundary>
    </BrowserRouter>
  );
}