import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
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
import OrderHistory from './pages/order-history';
import ProfileSettings from './pages/profile-settings';
import BottomNavBar from './components/Navigation/BottomNavBar';

// ============================================================================
// MAIN VIEWPORT CONTROLLER
// Handles dynamic routing and the visibility/active-state of the Bottom NavBar
// ============================================================================
const MainViewport = () => {
  const location = useLocation();
  
  // Real logic to determine which tab is currently active based on the URL
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard-home') return 'home';
    if (path === '/tracking-active') return 'tracking';
    if (path === '/order-history') return 'shipments';
    if (path === '/profile-settings') return 'settings';
    return null; // Return null to hide the nav bar on Auth/Booking flows
  };

  const activeTab = getActiveTab();

  return (
    <div className="flex flex-col h-screen bg-movyra-surface overflow-hidden">
      {/* Scrollable Viewport */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <Routes>
          <Route path="/auth-login" element={<MobileLogin />} />
          <Route path="/auth-signup" element={<MobileSignup />} />
          <Route path="/auth/otp" element={<OTPVerification />} />
          
          <Route element={<MobileAppLayout />}>
            <Route path="/" element={<MobileHome />} />
            <Route path="/dashboard-home" element={<MobileHome />} />
            <Route path="/booking/set-location" element={<SetLocation />} />
            <Route path="/booking/select-vehicle" element={<SelectVehicle />} />
            <Route path="/booking/review" element={<ReviewOrder />} />
            <Route path="/tracking-active" element={<LiveTracking />} />
            <Route path="/order-history" element={<OrderHistory />} />
            <Route path="/profile-settings" element={<ProfileSettings />} />
          </Route>
        </Routes>
      </div>
      
      {/* Persistent Bottom Dock: Only renders on primary hub screens */}
      {activeTab && <BottomNavBar activeTab={activeTab} />}
    </div>
  );
};

// ============================================================================
// ROOT APPLICATION INJECTION
// Manages the first-time Onboarding Interceptor before loading the App
// ============================================================================
export default function App() {
  const [show, setShow] = useState(true);
  
  useEffect(() => { 
    // Secure reader for the local storage flag
    if (localStorage.getItem('has_seen_onboarding')) {
      setShow(false);
    }
  }, []);

  const handleOnboardingComplete = () => {
    // Real logic to permanently bypass onboarding on next load
    localStorage.setItem('has_seen_onboarding', 'true');
    setShow(false);
  };

  if (show) return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  
  return (
    <BrowserRouter>
      <MainViewport />
    </BrowserRouter>
  );
}