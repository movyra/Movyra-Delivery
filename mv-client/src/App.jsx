import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

export default function App() {
  const [show, setShow] = useState(true);
  useEffect(() => { if (localStorage.getItem('has_seen_onboarding')) setShow(false); }, []);
  if (show) return <OnboardingFlow onComplete={() => setShow(false)} />;
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}
