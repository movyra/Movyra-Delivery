import React, { useState, useEffect } from 'react';
import { Globe, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ============================================================================
 * MODULE: PREMIUM HEADER NAVIGATION (mv-main)
 * Architecture: Dark-themed shell matching reference imagery.
 * Features: High-end custom SVG icons, Login/Signup dropdowns with 
 * 6+ structural roles, Full-screen Language Modal, Mobile Hamburger Menu,
 * Scroll-aware backdrop styling. Strict Zero Emoji policy.
 * ============================================================================
 */

// ============================================================================
// CUSTOM ICONS (Pixel-perfect line vectors)
// ============================================================================

const IconRide = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="18" r="2.5" fill="currentColor" stroke="none" />
    <rect x="15" y="4" width="5" height="5" rx="1" fill="currentColor" stroke="none" />
    <path d="M6 15v-1a4 4 0 0 1 4-4h3a4 4 0 0 0 4-4V7" />
  </svg>
);

const IconDrive = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
    <path d="M12 15v6" />
    <path d="M9.5 10.5L4.5 6.5" />
    <path d="M14.5 10.5L19.5 6.5" />
  </svg>
);

const IconBusiness = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8l1.5-4h15L21 8" />
    <path d="M3 8v2a3 3 0 0 0 6 0v-2" />
    <path d="M9 8v2a3 3 0 0 0 6 0v-2" />
    <path d="M15 8v2a3 3 0 0 0 6 0v-2" />
    <path d="M4 10v10h16V10" />
    <rect x="10" y="14" width="4" height="6" fill="currentColor" stroke="none" />
  </svg>
);

const IconAdmin = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M12 8v4" />
    <path d="M12 16h.01" />
  </svg>
);

const IconVendor = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const IconInvestor = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const TwoLineMenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="3" y1="15" x2="21" y2="15" />
  </svg>
);

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isLogInOpen, setIsLogInOpen] = useState(false);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent background scrolling when modals are open
  useEffect(() => {
    if (isLangModalOpen || isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isLangModalOpen, isMobileMenuOpen]);

  const languages = [
    "English", "हिन्दी", "বাংলা", "मराठी", 
    "తెలుగు", "தமிழ்", "ગુજરાती", "اردو", 
    "ಕನ್ನಡ", "ଓଡ଼િયા", "മലയാളം", "ਪੰਜਾਬੀ"
  ];

  // Routing Configuration Matrix
  const roleRoutes = [
    { label: 'Customer', icon: IconRide, link: 'https://movyra.web.app' },
    { label: 'Delivery Partner', icon: IconDrive, link: 'https://join.movyra.in/partner' },
    { label: 'Shop Vendor', icon: IconVendor, link: 'https://join.movyra.in/vendor' },
    { label: 'Enterprise / B2B', icon: IconBusiness, link: 'https://join.movyra.in/enterprise' },
    { label: 'System Admin', icon: IconAdmin, link: 'https://admin.movyra.in' },
    { label: 'Investor Relations', icon: IconInvestor, link: 'https://meet.movyra.in' }
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-300 ${scrolled ? 'bg-black py-4 shadow-xl' : 'bg-black py-5'}`}>
        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
          
          {/* Left: Brand & Primary Links */}
          <div className="flex items-center gap-10">
            <a href="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="Movyra" className="h-8 w-auto" onError={(e) => e.target.style.display = 'none'} />
              <span className="text-[28px] font-black tracking-tighter text-white hover:text-gray-300 transition-colors">
                Movyra
              </span>
            </a>
            
            <div className="hidden lg:flex items-center gap-6 font-bold text-[15px] text-white">
              <a href="/ride" className="hover:bg-white/10 px-4 py-2 rounded-full transition-all">Ride</a>
              <a href="/drive" className="hover:bg-white/10 px-4 py-2 rounded-full transition-all">Drive</a>
              <a href="/business" className="hover:bg-white/10 px-4 py-2 rounded-full transition-all">Business</a>
              <a href="/about" className="hover:bg-white/10 px-4 py-2 rounded-full transition-all flex items-center gap-2">About <ChevronDownIcon /></a>
            </div>
          </div>

          {/* Right: Secondary Links & Actions */}
          <div className="hidden lg:flex items-center gap-4 font-bold text-[15px] text-white">
            
            <button 
              onClick={() => setIsLangModalOpen(true)}
              className="flex items-center gap-2 hover:bg-white/10 px-3 py-2 rounded-full transition-all"
            >
              <Globe size={16} /> EN
            </button>
            
            <button className="hover:bg-white/10 px-3 py-2 rounded-full transition-all">Help</button>
            
            {/* LOG IN DROPDOWN */}
            <div 
              className="relative"
              onMouseEnter={() => setIsLogInOpen(true)}
              onMouseLeave={() => setIsLogInOpen(false)}
            >
              <button className="hover:bg-white/10 px-3 py-2 rounded-full transition-all">Log in</button>
              <AnimatePresence>
                {isLogInOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute right-0 top-full mt-4 w-[320px] bg-white rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.2)] py-4 flex flex-col border border-gray-100 z-50 overflow-hidden"
                  >
                    <div className="absolute -top-4 left-0 w-full h-4 bg-transparent" />
                    <div className="px-6 pb-2 pt-2 text-xs font-black text-gray-400 uppercase tracking-widest">Sign in to portal</div>
                    {roleRoutes.map((role, idx) => (
                      <a key={idx} href={role.link} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group">
                        <span className="text-[16px] font-bold text-black tracking-tight group-hover:text-blue-600 transition-colors">{role.label}</span>
                        <div className="text-gray-400 group-hover:text-blue-600 transition-colors"><role.icon /></div>
                      </a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* SIGN UP DROPDOWN */}
            <div 
              className="relative ml-2"
              onMouseEnter={() => setIsSignUpOpen(true)}
              onMouseLeave={() => setIsSignUpOpen(false)}
            >
              <button className="bg-white text-black px-5 py-2.5 rounded-full font-black hover:bg-gray-200 transition-colors shadow-sm">
                Sign up
              </button>
              
              <AnimatePresence>
                {isSignUpOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute right-0 top-full mt-4 w-[320px] bg-white rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.2)] py-4 flex flex-col border border-gray-100 z-50 overflow-hidden"
                  >
                    <div className="absolute -top-4 left-0 w-full h-4 bg-transparent" />
                    <div className="px-6 pb-2 pt-2 text-xs font-black text-gray-400 uppercase tracking-widest">Create Account</div>
                    {roleRoutes.map((role, idx) => (
                      <a key={idx} href={role.link} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group">
                        <span className="text-[16px] font-bold text-black tracking-tight group-hover:text-blue-600 transition-colors">{role.label}</span>
                        <div className="text-gray-400 group-hover:text-blue-600 transition-colors"><role.icon /></div>
                      </a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden text-white hover:bg-white/10 p-2 rounded-full transition-colors"
          >
            <TwoLineMenuIcon />
          </button>
        </div>
      </nav>

      {/* =====================================================================
          FULL-SCREEN LANGUAGE MODAL 
          ===================================================================== */}
      <AnimatePresence>
        {isLangModalOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-[100] bg-white flex flex-col pt-24 px-6 md:px-24 overflow-y-auto"
          >
            <div className="w-full flex justify-end mb-12">
              <button 
                onClick={() => setIsLangModalOpen(false)}
                className="text-black hover:bg-gray-100 p-3 rounded-full transition-colors"
              >
                <X size={32} strokeWidth={3} />
              </button>
            </div>
            
            <div className="max-w-5xl mx-auto w-full">
              <h2 className="text-[40px] md:text-[56px] font-black text-black tracking-tighter mb-20">
                Select your preferred language
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-y-16 gap-x-8 pb-20">
                {languages.map((lang, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setIsLangModalOpen(false)}
                    className="text-left text-[20px] md:text-[24px] font-medium text-black hover:text-blue-600 transition-colors"
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================================
          FULL-SCREEN MOBILE MENU
          ===================================================================== */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-[100] bg-black text-white flex flex-col"
          >
            <div className="flex items-center justify-between p-6">
              <span className="text-[28px] font-black tracking-tighter">Movyra.</span>
              <div className="flex items-center gap-4">
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-white hover:bg-white/10 p-2 rounded-full ml-2">
                  <X size={28} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            <div className="flex flex-col px-6 pt-10 gap-8 flex-grow overflow-y-auto">
              <a href="/ride" className="text-[40px] font-bold tracking-tight hover:text-gray-300 transition-colors">Ride</a>
              <a href="/drive" className="text-[40px] font-bold tracking-tight hover:text-gray-300 transition-colors">Drive</a>
              <a href="/business" className="text-[40px] font-bold tracking-tight hover:text-gray-300 transition-colors">Business</a>
              <a href="/about" className="text-[40px] font-bold tracking-tight hover:text-gray-300 transition-colors flex items-center justify-between">
                About <ChevronDownIcon />
              </a>
              <a href="/help" className="text-[40px] font-bold tracking-tight hover:text-gray-300 transition-colors mt-4">Help</a>
              
              {/* Mobile Role Selection Matrix */}
              <div className="mt-8 border-t border-white/20 pt-8 space-y-6">
                <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Access Portals</p>
                {roleRoutes.map((role, idx) => (
                   <a key={idx} href={role.link} className="flex items-center gap-4 text-white hover:text-gray-300">
                     <div className="text-white"><role.icon /></div>
                     <span className="text-xl font-bold">{role.label}</span>
                   </a>
                ))}
              </div>

              <button 
                onClick={() => { setIsMobileMenuOpen(false); setIsLangModalOpen(true); }}
                className="flex items-center gap-3 text-[18px] font-bold mt-12 w-fit hover:text-gray-300 transition-colors pb-12"
              >
                <Globe size={24} /> EN
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}