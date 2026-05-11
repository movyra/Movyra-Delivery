import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { 
  WifiOff, AlertCircle, Command, Search, Share2, 
  HelpCircle, Moon, Sun, MousePointer2, ChevronRight, X 
} from 'lucide-react';

/**
 * ============================================================================
 * MODULE: MASTER ROUTER ARCHITECTURE (mv-main)
 * Features: 10+ Real-Time Global Enhancements & Strict Security
 * * 1. Global Scroll Restoration
 * 2. Real-Time Network Connection Monitor (BOM API)
 * 3. System Theme Sync Observer (prefers-color-scheme)
 * 4. Route-based Document Title Updater
 * 5. Global Error Boundary (Render Catching)
 * 6. Framer Motion Page Transitions
 * 7. Live Viewport Meta Management
 * 8. IN-DEVELOPMENT MASTER TOGGLE & ROUTE INTERCEPTOR
 * 9. STRICT SECURE ADMIN GATEWAY
 * 10. Global Animated Custom Magnetic Cursor
 * 11. Global Ambient SVG Node Background
 * 12. Command Palette Overlay (Cmd+K)
 * 13. Dynamic Scroll Progress Bar
 * 14. Floating Glassmorphic Quick Dock
 * 15. Real-Time Privacy Consent Engine
 * ============================================================================
 */

// --- SECURITY IMPORTS ---
import SecureAdminGate from './components/Admin/SecureAdminGate';

// --- IN-DEVELOPMENT & ADMIN IMPORTS ---
import ComingSoon from './pages/ComingSoon';
import WaitlistDashboard from './pages/Admin/WaitlistDashboard';

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
// MASTER DEVELOPMENT TOGGLE
// ============================================================================
const isDevelopmentMode = true;

// ============================================================================
// GLOBAL UI ENHANCEMENTS & WRAPPERS (10+ FEATURES)
// ============================================================================

// Feature 10: Global Custom Magnetic Cursor
const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    const handleMouseOver = (e) => {
      if (e.target.tagName.toLowerCase() === 'button' || e.target.tagName.toLowerCase() === 'a' || e.target.closest('button') || e.target.closest('a')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[9999] mix-blend-difference hidden md:flex items-center justify-center border-2 border-white"
      animate={{
        x: mousePosition.x - 16,
        y: mousePosition.y - 16,
        scale: isHovering ? 1.5 : 1,
        backgroundColor: isHovering ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0)',
      }}
      transition={{ type: 'spring', stiffness: 500, damping: 28, mass: 0.5 }}
    >
      {isHovering && <MousePointer2 size={12} className="text-black" />}
    </motion.div>
  );
};

// Feature 11: Global Ambient SVG Node Background
const AmbientBackground = () => (
  <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-[#050505]">
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.05)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
      <motion.circle 
        cx="50%" cy="50%" r="40%" 
        fill="none" stroke="url(#gradient)" strokeWidth="1" strokeOpacity="0.1"
        animate={{ rotate: 360, scale: [1, 1.05, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#276EF1" />
          <stop offset="100%" stopColor="#050505" />
        </linearGradient>
      </defs>
    </svg>
    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#050505] opacity-90" />
  </div>
);

// Feature 13: Dynamic Scroll Progress Bar
const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#276EF1] to-[#ffffff] z-[9998] origin-left"
      style={{ scaleX }}
    />
  );
};

// Feature 14: Floating Glassmorphic Quick Dock
const FloatingDock = () => {
  const [theme, setTheme] = useState('dark');
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1, type: 'spring', stiffness: 200 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9990] bg-black/60 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full flex items-center gap-4 shadow-2xl"
    >
      <button onClick={toggleTheme} className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10">
        {theme === 'dark' ? <Sun size={18} strokeWidth={2.5} /> : <Moon size={18} strokeWidth={2.5} />}
      </button>
      <div className="w-px h-6 bg-white/10" />
      <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10">
        <Share2 size={18} strokeWidth={2.5} />
      </button>
      <div className="w-px h-6 bg-white/10" />
      <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10">
        <HelpCircle size={18} strokeWidth={2.5} />
      </button>
    </motion.div>
  );
};

// Feature 12: Command Palette Overlay (Cmd+K)
const KeyboardCommander = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-start justify-center pt-[20vh]"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-2xl bg-[#111111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="flex items-center px-4 py-4 border-b border-white/10">
              <Search size={20} className="text-gray-400 mr-3" />
              <input 
                autoFocus 
                placeholder="Type a command or search..." 
                className="flex-1 bg-transparent text-white font-bold outline-none text-lg"
              />
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white p-1 bg-white/5 rounded-md"><X size={16}/></button>
            </div>
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-bold tracking-widest text-gray-500 uppercase">System Actions</div>
              <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-[#276EF1]/20 text-white font-bold flex items-center gap-3 transition-colors">
                <Command size={16} className="text-[#276EF1]" /> Authenticate Administrator
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Feature 15: Real-Time Privacy Consent Engine
const PrivacyConsentBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 right-6 z-[9980] max-w-sm bg-[#111111] border border-white/10 p-6 rounded-[24px] shadow-2xl"
        >
          <h4 className="text-white font-black text-lg mb-2">Privacy Protocol Active</h4>
          <p className="text-gray-400 text-sm font-medium mb-6 leading-relaxed">Movyra utilizes strict session parameters. By continuing, you agree to our encrypted operations policy.</p>
          <div className="flex gap-3">
            <button onClick={() => setIsVisible(false)} className="flex-1 bg-white text-black font-black py-3 rounded-full hover:bg-gray-200 transition-colors">Acknowledge</button>
            <button onClick={() => setIsVisible(false)} className="flex-1 bg-white/10 text-white font-black py-3 rounded-full hover:bg-white/20 transition-colors">Decline</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Feature 1, 4, 9: Scroll Restoration, Title Updater, & Route Analytics
const RouteController = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    
    const path = location.pathname === '/' ? 'Home' : location.pathname.substring(1);
    const formattedTitle = path.charAt(0).toUpperCase() + path.slice(1);
    document.title = isDevelopmentMode 
      ? `Movyra | Terminal Initialization` 
      : `Movyra | ${formattedTitle.replace('-', ' ')}`;
      
  }, [location.pathname]);

  return null;
};

// Feature 2: Real-Time Network Monitor (High-End Styling)
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
          className="fixed top-0 left-0 right-0 z-[9999] bg-[#e53935]/90 backdrop-blur-md text-white py-4 px-6 flex items-center justify-center gap-4 font-mono font-bold text-[0.85rem] uppercase tracking-widest shadow-[0_10px_30px_rgba(229,57,53,0.3)] border-b border-[#ff5252]"
        >
          <div className="w-8 h-8 rounded-full bg-white text-[#e53935] flex items-center justify-center animate-pulse">
            <WifiOff size={16} strokeWidth={3} /> 
          </div>
          CRITICAL: Grid Connection Severed. Local Operations Only.
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Feature 3, 7: System Observers & Meta Management
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

// Feature 5: Global Error Boundary (High-End Recovery UI)
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
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #333333 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
          <div className="relative z-10">
            <div className="w-24 h-24 bg-[#e53935]/10 rounded-3xl border border-[#e53935]/30 flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(229,57,53,0.3)] animate-pulse">
              <AlertCircle size={40} className="text-[#e53935]" />
            </div>
            <h1 className="text-[3rem] font-black tracking-tighter mb-4 text-white">Rendering Protocol Failed.</h1>
            <div className="bg-[#111111] border border-[#333333] p-6 rounded-2xl max-w-2xl mx-auto mb-10 text-left">
              <span className="text-[#e53935] font-mono text-[0.8rem] font-bold uppercase tracking-widest block mb-2">Stack Trace Log:</span>
              <p className="text-[#aaaaaa] font-mono text-[0.85rem]">{this.state.error?.toString()}</p>
            </div>
            <button onClick={() => window.location.reload()} className="bg-white text-black px-10 py-5 rounded-full font-black text-[1.1rem] hover:bg-gray-200 transition-colors shadow-xl flex items-center justify-center mx-auto gap-2">
              Initiate System Reboot <ChevronRight size={20} strokeWidth={3} />
            </button>
          </div>
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
      initial={{ opacity: 0, filter: 'blur(10px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, filter: 'blur(10px)' }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="w-full min-h-screen flex flex-col relative z-10"
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
        {/* GLOBAL FEATURE INJECTIONS */}
        <SystemObservers />
        <NetworkMonitor />
        <RouteController />
        <CustomCursor />
        <AmbientBackground />
        <ScrollProgress />
        <FloatingDock />
        <KeyboardCommander />
        <PrivacyConsentBanner />

        <AnimatePresence mode="wait">
          <Routes>
            {isDevelopmentMode ? (
              // ==============================================================
              // IN-DEVELOPMENT ROUTES
              // Intercepts all traffic to the Coming Soon page except Admin
              // ==============================================================
              <>
                <Route 
                  path='/admin' 
                  element={
                    <AnimatedRoute>
                      <SecureAdminGate>
                        <WaitlistDashboard />
                      </SecureAdminGate>
                    </AnimatedRoute>
                  } 
                />
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
              </>
            )}
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </GlobalErrorBoundary>
  );
}