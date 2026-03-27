import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layouts
import MobileAppLayout from './components/MobileAppLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import AuthLogin from './pages/auth-login';
import AuthSignup from './pages/auth-signup';

// Authenticated Mobile Pages
import DashboardHome from './pages/dashboard-home';
import LocationPicker from './pages/location-picker';
import ParcelType from './pages/parcel-type';
import VehicleSelection from './pages/vehicle-selection';
import OrderConfirm from './pages/order-confirm';
import TrackingActive from './pages/tracking-active';
import OrderHistory from './pages/order-history';
import ProfileSettings from './pages/profile-settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes (Wide Desktop/Marketing) */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth-login" element={<AuthLogin />} />
        <Route path="/auth-signup" element={<AuthSignup />} />

        {/* Authenticated Routes (Strict Mobile App Layout) */}
        <Route element={<MobileAppLayout />}>
          <Route path="/dashboard-home" element={<DashboardHome />} />
          <Route path="/location-picker" element={<LocationPicker />} />
          <Route path="/parcel-type" element={<ParcelType />} />
          <Route path="/vehicle-selection" element={<VehicleSelection />} />
          <Route path="/order-confirm" element={<OrderConfirm />} />
          <Route path="/tracking-active" element={<TrackingActive />} />
          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="/profile-settings" element={<ProfileSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;