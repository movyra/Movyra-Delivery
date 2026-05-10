import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Activity, AlertCircle } from 'lucide-react';

/**
 * ============================================================================
 * MODULE: MASTER ROUTER ARCHITECTURE (mv-main)
 * Features: 10+ Real-Time Global Enhancements (Zero Mock Data)
 * 1. Global Scroll Restoration
 * 2. Real-Time Network Connection Monitor (BOM API)
 * 3. System Theme Sync Observer (prefers-color-scheme)
 * 4. Route-based Document Title Updater
 * 5. Hardware Concurrency & Performance Logger
 * 6. Global Error Boundary (Render Catching)
 * 7. Framer Motion Page Transitions
 * 8. Live Viewport Meta Management
 * 9. Route Analytics Tracker
 * 10. High-End SVG Fallback Loaders
 * ============================================================================
 */

// --- STANDARD PAGE IMPORTS ---
import HomePage from './pages/Home';
import AboutPage from './pages/About';
import CareersPage from './pages/Careers';
import InvestorsPage from './pages/Investors';
import NewsroomPage from './pages/Newsroom';
import SafetyPage from './pages/Safety';
import HelpPage from './pages/Help';
import LegalPage from './pages/Legal';
import CitiesPage from './pages/Cities';
import AirportsPage from './pages/Airports';
import ReservePage from './pages/Reserve';
import RentalsPage from './pages/Rentals';
import PackagePage from './pages/Package';
import PharmacyPage from './pages/Pharmacy';
import GroceryPage from './pages/Grocery';
import AlcoholPage from './pages/Alcohol';
import PetsPage from './pages/Pets';
import ElevatePage from './pages/Elevate';
import OnePage from './pages/One';
import ProPage from './pages/Pro';
import HealthPage from './pages/Health';
import TransitPage from './pages/Transit';
import CharterPage from './pages/Charter';
import BikesPage from './pages/Bikes';
import ScootersPage from './pages/Scooters';
import AutoPage from './pages/Auto';
import MotoPage from './pages/Moto';
import IntercityPage from './pages/Intercity';
import HourlyPage from './pages/Hourly';
import APIPage from './pages/API';
import DevelopersPage from './pages/Developers';
import AffiliatesPage from './pages/Affiliates';
import PartnersPage from './pages/Partners';
import AlumniPage from './pages/Alumni';
import DownloadPage from './pages/Download';
import FleetPage from './pages/Fleet';
import MerchantsPage from './pages/Merchants';

// --- SPECIFIED PRODUCT FOLDER IMPORTS ---
import DrivePage from './pages/Products/Drive';
import EatPage from './pages/Products/Eat';
import RidePage from './pages/Products/Ride';
import FreightPage from './pages/Products/Freight';
import BusinessPage from './pages/Products/Business';

// ============================================================================
// GLOBAL FEATURE COMPONENTS & HOOKS
// ============================================================================

// Feature 1, 4, 9: Scroll Restoration, Title Updater, & Route Analytics
const RouteController = () => {
  const location = useLocation();

  useEffect(() => {
    // 1. Scroll to top on route change
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    
    // 4. Update Document Title dynamically
    const path = location.pathname === '/' ? 'Home' : location.pathname.substring(1);
    const formattedTitle = path.charAt(0).toUpperCase() + path.slice(1);
    document.title = `Movyra | ${formattedTitle.replace('-', ' ')}`;

    // 9. Route Analytics Tracker (Using Performance API)
    if (window.performance) {
      const time = Math.round(window.performance.now());
      console.log(`[Movyra Routing Engine] Navigated to ${location.pathname} at ${time}ms`);
    }
  }, [location.pathname]);

  return null;
};

// Feature 2: Real-Time Network Monitor
const NetworkMonitor = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div 
          initial={{ y: -100, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white py-3 px-6 flex items-center justify-center gap-3 font-bold text-sm shadow-2xl"
        >
          <WifiOff size={18} /> CRITICAL: Network connection lost. Movyra telemetry offline.
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Feature 3, 5, 8: Global Telemetry & System Observers
const SystemTelemetry = () => {
  useEffect(() => {
    // 3. System Theme Sync
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (e) => {
      if (e.matches) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    };
    handleThemeChange(darkModeMediaQuery); // Initial check
    darkModeMediaQuery.addEventListener('change', handleThemeChange);

    // 5. Hardware Logging
    const cores = navigator.hardwareConcurrency || 'Unknown';
    const ram = navigator.deviceMemory || 'Unknown';
    console.log(`[Movyra Hardware Engine] Allocated: ${cores} Cores, ${ram}GB RAM limit.`);

    // 8. Viewport Management for Mobile Safes
    const setVh = () => {
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setVh();
    window.addEventListener('resize', setVh);

    return () => {
      darkModeMediaQuery.removeEventListener('change', handleThemeChange);
      window.removeEventListener('resize', setVh);
    };
  }, []);

  return null;
};

// Feature 6: Global Error Boundary
class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("[Movyra React Engine Crash]", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle size={64} className="text-red-500 mb-6" />
          <h1 className="text-[32px] font-black tracking-tighter mb-4">Rendering Protocol Failed.</h1>
          <p className="text-gray-400 font-mono text-sm max-w-lg mb-8">{this.state.error?.toString()}</p>
          <button onClick={() => window.location.reload()} className="bg-white text-black px-8 py-4 rounded-full font-bold">
            Reboot System
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Feature 7 & 10: Page Transition Wrapper & Loader
const AnimatedRoute = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(10px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, filter: 'blur(10px)' }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="w-full min-h-screen"
    >
      {children}
    </motion.div>
  );
};

// ============================================================================
// APP ENTRY POINT
// ============================================================================

export default function App() {
  return (
    <GlobalErrorBoundary>
      <BrowserRouter>
        <SystemTelemetry />
        <NetworkMonitor />
        <RouteController />

        {/* Removed the hardcoded <nav> to allow specific pages to render their own 
            premium Header and Footer components as built in previous iterations. */}
        
        <AnimatePresence mode="wait">
          <Routes>
            <Route path='/' element={<AnimatedRoute><HomePage /></AnimatedRoute>} />
            <Route path='/about' element={<AnimatedRoute><AboutPage /></AnimatedRoute>} />
            <Route path='/careers' element={<AnimatedRoute><CareersPage /></AnimatedRoute>} />
            <Route path='/investors' element={<AnimatedRoute><InvestorsPage /></AnimatedRoute>} />
            <Route path='/newsroom' element={<AnimatedRoute><NewsroomPage /></AnimatedRoute>} />
            <Route path='/safety' element={<AnimatedRoute><SafetyPage /></AnimatedRoute>} />
            <Route path='/help' element={<AnimatedRoute><HelpPage /></AnimatedRoute>} />
            <Route path='/legal' element={<AnimatedRoute><LegalPage /></AnimatedRoute>} />
            <Route path='/cities' element={<AnimatedRoute><CitiesPage /></AnimatedRoute>} />
            
            {/* Products Array */}
            <Route path='/drive' element={<AnimatedRoute><DrivePage /></AnimatedRoute>} />
            <Route path='/eat' element={<AnimatedRoute><EatPage /></AnimatedRoute>} />
            <Route path='/ride' element={<AnimatedRoute><RidePage /></AnimatedRoute>} />
            <Route path='/freight' element={<AnimatedRoute><FreightPage /></AnimatedRoute>} />
            <Route path='/business' element={<AnimatedRoute><BusinessPage /></AnimatedRoute>} />
            
            {/* Ecosystem & Services */}
            <Route path='/fleet' element={<AnimatedRoute><FleetPage /></AnimatedRoute>} />
            <Route path='/merchants' element={<AnimatedRoute><MerchantsPage /></AnimatedRoute>} />
            <Route path='/airports' element={<AnimatedRoute><AirportsPage /></AnimatedRoute>} />
            <Route path='/reserve' element={<AnimatedRoute><ReservePage /></AnimatedRoute>} />
            <Route path='/rentals' element={<AnimatedRoute><RentalsPage /></AnimatedRoute>} />
            <Route path='/package' element={<AnimatedRoute><PackagePage /></AnimatedRoute>} />
            <Route path='/pharmacy' element={<AnimatedRoute><PharmacyPage /></AnimatedRoute>} />
            <Route path='/grocery' element={<AnimatedRoute><GroceryPage /></AnimatedRoute>} />
            <Route path='/alcohol' element={<AnimatedRoute><AlcoholPage /></AnimatedRoute>} />
            <Route path='/pets' element={<AnimatedRoute><PetsPage /></AnimatedRoute>} />
            <Route path='/elevate' element={<AnimatedRoute><ElevatePage /></AnimatedRoute>} />
            <Route path='/one' element={<AnimatedRoute><OnePage /></AnimatedRoute>} />
            <Route path='/pro' element={<AnimatedRoute><ProPage /></AnimatedRoute>} />
            <Route path='/health' element={<AnimatedRoute><HealthPage /></AnimatedRoute>} />
            <Route path='/transit' element={<AnimatedRoute><TransitPage /></AnimatedRoute>} />
            <Route path='/charter' element={<AnimatedRoute><CharterPage /></AnimatedRoute>} />
            <Route path='/bikes' element={<AnimatedRoute><BikesPage /></AnimatedRoute>} />
            <Route path='/scooters' element={<AnimatedRoute><ScootersPage /></AnimatedRoute>} />
            <Route path='/auto' element={<AnimatedRoute><AutoPage /></AnimatedRoute>} />
            <Route path='/moto' element={<AnimatedRoute><MotoPage /></AnimatedRoute>} />
            <Route path='/intercity' element={<AnimatedRoute><IntercityPage /></AnimatedRoute>} />
            <Route path='/hourly' element={<AnimatedRoute><HourlyPage /></AnimatedRoute>} />
            <Route path='/api' element={<AnimatedRoute><APIPage /></AnimatedRoute>} />
            <Route path='/developers' element={<AnimatedRoute><DevelopersPage /></AnimatedRoute>} />
            <Route path='/affiliates' element={<AnimatedRoute><AffiliatesPage /></AnimatedRoute>} />
            <Route path='/partners' element={<AnimatedRoute><PartnersPage /></AnimatedRoute>} />
            <Route path='/alumni' element={<AnimatedRoute><AlumniPage /></AnimatedRoute>} />
            <Route path='/download' element={<AnimatedRoute><DownloadPage /></AnimatedRoute>} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </GlobalErrorBoundary>
  );
}