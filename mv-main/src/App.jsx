import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, AlertCircle } from 'lucide-react';

/**
 * ============================================================================
 * MODULE: MASTER ROUTER ARCHITECTURE (mv-main)
 * Features: 
 * 1. Global Scroll Restoration
 * 2. Real-Time Network Connection Monitor
 * 3. System Theme Sync Observer
 * 4. Route-based Document Title Updater
 * 5. Global Error Boundary (Pure Black Minimalist UI)
 * 6. Framer Motion Page Transitions
 * 7. Live Viewport Meta Management
 * 8. IN-DEVELOPMENT MASTER TOGGLE & SECURE ROUTE INTERCEPTOR
 * 9. GLOBAL QUOTA BLOCKER INTERCEPTION
 * 10. CIVIC MODULE SECURE ACCESS GATEWAY
 * ============================================================================
 */

// --- FIREBASE & STORE IMPORTS ---
import { auth } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { useCivicStore } from './store/useCivicStore';

// --- IN-DEVELOPMENT & ADMIN IMPORTS ---
import ComingSoon from './pages/ComingSoon';
import WaitlistDashboard from './pages/Admin/WaitlistDashboard';
import SecureAdminGate from './components/Admin/SecureAdminGate';
import ConsumerPortal from './pages/ConsumerPortal';
import VendorPortal from './pages/VendorPortal';

// --- SYSTEM MAINTENANCE COMPONENT ---
import ScheduledMaintenance from './components/m';

// --- GLOBAL QUOTA BLOCKER COMPONENT ---
import FirebaseQuotaBlocker from './components/f';

// --- STANDARD PAGE IMPORTS ---
import HomePage from './pages/Home';
import AboutPage from './pages/About';
import ContactPage from './pages/Contact';
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
import VeggiesPage from './pages/Veggies';
import DeliveryPage from './pages/Delivery';
import ServantPage from './pages/Servant';
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

// --- MOVYRA CIVIC MODULE IMPORTS ---
import CivicHome from './pages/Civic/CivicHome';
import CivicLanding from './pages/Civic/CivicLanding';
import ReportIssue from './pages/Civic/ReportIssue';
import IssueTracker from './pages/Civic/IssueTracker';
import CivicHeatmap from './pages/Civic/CivicHeatmap';
import TransparencyDashboard from './pages/Civic/TransparencyDashboard';
import WardAdmin from './pages/Civic/WardAdmin';
import CivicOnboarding from './pages/Civic/CivicOnboarding';
import CivicAuth from './pages/Civic/CivicAuth';
import SessionMonitor from './components/Civic/SessionMonitor';

// ============================================================================
// MASTER ARCHITECTURE CONTROLS
// ============================================================================
const isDevelopmentMode = true; // Set to false to unlock standard routing
const isUnderMaintenance = true; // Master toggle to intercept specified commercial routes
const isQuotaExceeded = false; // MASTER TOGGLE: Set to true to enforce global infrastructure lockdown

// ============================================================================
// GLOBAL FEATURE COMPONENTS & HOOKS
// ============================================================================

// Feature 1 & 4: Scroll Restoration & Title Updater
const RouteController = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    
    const path = location.pathname === '/' ? 'Home' : location.pathname.substring(1);
    const formattedTitle = path.charAt(0).toUpperCase() + path.slice(1);
    document.title = isDevelopmentMode 
      ? `Movyra` 
      : `Movyra | ${formattedTitle.replace('-', ' ')}`;
  }, [location.pathname]);

  return null;
};

// Feature 2: Real-Time Network Monitor (Minimalist Styling)
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
          className="fixed top-0 left-0 right-0 z-[9999] bg-[#000000] text-white py-4 px-6 flex items-center justify-center gap-4 font-sans font-bold text-[0.85rem] border-b border-[#333333]"
        >
          <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center animate-pulse">
            <WifiOff size={14} strokeWidth={3} /> 
          </div>
          No internet connection. Displaying offline view.
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Feature 3 & 7: System Theme Sync & Viewport Management
const SystemObservers = () => {
  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (e) => {
      if (e.matches) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    };
    handleThemeChange(darkModeMediaQuery);
    darkModeMediaQuery.addEventListener('change', handleThemeChange);

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

// Feature 5: Global Error Boundary (Pure Black Minimalist UI)
class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Application Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#000000] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-[#111111] border border-[#333333] rounded-full flex items-center justify-center mx-auto mb-8">
            <AlertCircle size={28} className="text-white" />
          </div>
          <h1 className="text-[2.5rem] font-black tracking-tighter mb-4 text-white">System Error.</h1>
          <p className="text-[#888888] font-sans text-[0.95rem] mb-10 max-w-md mx-auto">
            An unexpected application error has occurred. Our engineers have been notified.
          </p>
          <button onClick={() => window.location.reload()} className="bg-white text-black px-8 py-3 rounded-full font-bold text-[0.95rem] hover:bg-[#e0e0e0] transition-colors">
            Restart Session
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Feature 6: Page Transition Wrapper
const AnimatedRoute = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="w-full min-h-screen flex flex-col"
    >
      {children}
    </motion.div>
  );
};

// Feature 10: Civic Operations Security Gateway
const SecureCivicGateway = ({ children }) => {
  const onboardingCompleted = useCivicStore(state => state.onboardingCompleted);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[#888888] font-bold text-[0.9rem]">Verifying identity credentials...</p>
      </div>
    );
  }

  if (!onboardingCompleted) {
    return <Navigate to="/civic/onboarding" replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/civic/auth" replace />;
  }

  return children;
};

// ============================================================================
// APP ENTRY POINT
// ============================================================================

export default function App() {
  
  // --------------------------------------------------------------------------
  // GLOBAL ACCESS INTERCEPTION PROTOCOL
  // If the quota flag is active, strictly bypass all routing and render blocker.
  // --------------------------------------------------------------------------
  if (isQuotaExceeded) {
      return <FirebaseQuotaBlocker />;
  }

  return (
    <GlobalErrorBoundary>
      <BrowserRouter>
        <SystemObservers />
        <NetworkMonitor />
        <RouteController />

        <AnimatePresence mode="wait">
          <Routes>
            {isDevelopmentMode ? (
              // ==============================================================
              // IN-DEVELOPMENT ROUTES
              // Intercepts traffic to the Coming Soon page except for open gateways
              // and evaluates the global maintenance protocol for specified modules.
              // ==============================================================
              <>
                <Route path='/admin' element={<AnimatedRoute><SecureAdminGate><WaitlistDashboard /></SecureAdminGate></AnimatedRoute>} />
                <Route path='/order' element={<AnimatedRoute><ConsumerPortal /></AnimatedRoute>} />
                <Route path='/vendor' element={<AnimatedRoute><VendorPortal /></AnimatedRoute>} />
                
                {/* Dynamically intercepted commercial pathways based on master toggle */}
                <Route path='/grocery' element={<AnimatedRoute>{isUnderMaintenance ? <ScheduledMaintenance /> : <GroceryPage />}</AnimatedRoute>} />
                <Route path='/veggies' element={<AnimatedRoute>{isUnderMaintenance ? <ScheduledMaintenance /> : <VeggiesPage />}</AnimatedRoute>} />
                <Route path='/delivery' element={<AnimatedRoute>{isUnderMaintenance ? <ScheduledMaintenance /> : <DeliveryPage />}</AnimatedRoute>} />
                
                <Route path='/servant' element={<AnimatedRoute><ServantPage /></AnimatedRoute>} />
                <Route path='/careers' element={<AnimatedRoute><CareersPage /></AnimatedRoute>} />

                {/* MOVYRA CIVIC MODULE */}
                <Route path='/civic' element={<AnimatedRoute><CivicHome /></AnimatedRoute>} />
                <Route path='/civic/onboarding' element={<AnimatedRoute><CivicOnboarding /></AnimatedRoute>} />
                <Route path='/civic/auth' element={<AnimatedRoute><CivicAuth /></AnimatedRoute>} />
                
                <Route path='/civic/dashboard' element={<AnimatedRoute><SecureCivicGateway><SessionMonitor><CivicLanding /></SessionMonitor></SecureCivicGateway></AnimatedRoute>} />
                <Route path='/civic/report' element={<AnimatedRoute><SecureCivicGateway><SessionMonitor><ReportIssue /></SessionMonitor></SecureCivicGateway></AnimatedRoute>} />
                <Route path='/civic/tracker' element={<AnimatedRoute><SecureCivicGateway><SessionMonitor><IssueTracker /></SessionMonitor></SecureCivicGateway></AnimatedRoute>} />
                <Route path='/civic/heatmap' element={<AnimatedRoute><SecureCivicGateway><SessionMonitor><CivicHeatmap /></SessionMonitor></SecureCivicGateway></AnimatedRoute>} />
                <Route path='/civic/transparency' element={<AnimatedRoute><SecureCivicGateway><SessionMonitor><TransparencyDashboard /></SessionMonitor></SecureCivicGateway></AnimatedRoute>} />
                <Route path='/civic/admin' element={<AnimatedRoute><SecureCivicGateway><SessionMonitor><SecureAdminGate><WardAdmin /></SecureAdminGate></SessionMonitor></SecureCivicGateway></AnimatedRoute>} />

                <Route path='*' element={<AnimatedRoute><ComingSoon /></AnimatedRoute>} />
              </>
            ) : (
              // ==============================================================
              // PRODUCTION ROUTES
              // Standard routing tree activated when isDevelopmentMode = false
              // ==============================================================
              <>
                <Route path='/' element={<AnimatedRoute><HomePage /></AnimatedRoute>} />
                <Route path='/about' element={<AnimatedRoute><AboutPage /></AnimatedRoute>} />
                <Route path='/contact' element={<AnimatedRoute><ContactPage /></AnimatedRoute>} />
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
                <Route path='/veggies' element={<AnimatedRoute><VeggiesPage /></AnimatedRoute>} />
                <Route path='/delivery' element={<AnimatedRoute><DeliveryPage /></AnimatedRoute>} />
                <Route path='/servant' element={<AnimatedRoute><ServantPage /></AnimatedRoute>} />
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

                {/* MOVYRA CIVIC MODULE */}
                <Route path='/civic' element={<AnimatedRoute><CivicHome /></AnimatedRoute>} />
                <Route path='/civic/onboarding' element={<AnimatedRoute><CivicOnboarding /></AnimatedRoute>} />
                <Route path='/civic/auth' element={<AnimatedRoute><CivicAuth /></AnimatedRoute>} />
                
                <Route path='/civic/dashboard' element={<AnimatedRoute><SecureCivicGateway><SessionMonitor><CivicLanding /></SessionMonitor></SecureCivicGateway></AnimatedRoute>} />
                <Route path='/civic/report' element={<AnimatedRoute><SecureCivicGateway><SessionMonitor><ReportIssue /></SessionMonitor></SecureCivicGateway></AnimatedRoute>} />
                <Route path='/civic/tracker' element={<AnimatedRoute><SecureCivicGateway><SessionMonitor><IssueTracker /></SessionMonitor></SecureCivicGateway></AnimatedRoute>} />
                <Route path='/civic/heatmap' element={<AnimatedRoute><SecureCivicGateway><SessionMonitor><CivicHeatmap /></SessionMonitor></SecureCivicGateway></AnimatedRoute>} />
                <Route path='/civic/transparency' element={<AnimatedRoute><SecureCivicGateway><SessionMonitor><TransparencyDashboard /></SessionMonitor></SecureCivicGateway></AnimatedRoute>} />
                <Route path='/civic/admin' element={<AnimatedRoute><SecureCivicGateway><SessionMonitor><SecureAdminGate><WardAdmin /></SecureAdminGate></SessionMonitor></SecureCivicGateway></AnimatedRoute>} />
              </>
            )}
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </GlobalErrorBoundary>
  );
}