import React, { useState, useEffect } from 'react';

// Import Child Components
import Hero from './components/Hero';
import RegistrationForm from './components/RegistrationForm';
import SocialLinks from './components/SocialLinks';
import SuccessModal from './components/SuccessModal';

/**
 * ============================================================================
 * MODULE: MASTER "COMING SOON" ORCHESTRATOR (mv-main)
 * Architecture: Sequentially Stacked Components (Hero -> Form -> Socials)
 * Features: High-End Styling, Registration State Management, Live Telemetry.
 * ============================================================================
 */

export default function ComingSoon() {
  // Master state to control the visibility of the Success Modal after registration
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [sessionUptime, setSessionUptime] = useState(0);

  // Background Uptime Telemetry
  useEffect(() => {
    const startTime = Date.now();
    const timer = setInterval(() => {
      setSessionUptime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-[#000000] text-white font-sans overflow-x-hidden selection:bg-[#276ef1] selection:text-white flex flex-col">
      
      {/* High-End Global CSS-in-JS Setup for the Coming Soon Environment */}
      <style>
        {`
          @keyframes ambientGlow {
            0% { opacity: 0.1; transform: scale(1); }
            50% { opacity: 0.3; transform: scale(1.1); }
            100% { opacity: 0.1; transform: scale(1); }
          }
          .animate-ambient-glow {
            animation: ambientGlow 8s ease-in-out infinite;
          }
        `}
      </style>

      {/* Persistent Background Ambient Glow Elements */}
      <div className="fixed top-0 left-0 w-[800px] h-[800px] bg-[#276ef1] opacity-20 blur-[150px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 animate-ambient-glow z-0"></div>
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-[#05a357] opacity-10 blur-[120px] rounded-full pointer-events-none translate-x-1/3 translate-y-1/3 animate-ambient-glow z-0" style={{ animationDelay: '4s' }}></div>

      {/* Main Sequential Content Stack */}
      <main className="relative z-10 flex flex-col flex-grow items-center justify-start w-full max-w-[1400px] mx-auto px-6 lg:px-12 pt-12 pb-24">
        
        {/* Navigation / Header Stub */}
        <header className="w-full flex justify-between items-center mb-24 border-b border-[#333333] pb-6">
          <div className="text-[1.5rem] font-black tracking-tighter">Movyra.</div>
          <div className="flex items-center gap-3 bg-[#111111] px-4 py-2 rounded-full border border-[#222222]">
            <span className="w-2 h-2 rounded-full bg-[#e53935] animate-ping"></span>
            <span className="text-[0.75rem] font-bold uppercase tracking-widest text-[#aaaaaa]">In Development</span>
          </div>
        </header>

        {/* 1. Hero Section */}
        <div className="w-full mb-16">
          <Hero />
        </div>

        {/* 2. Registration Capture Form */}
        <div className="w-full max-w-[800px] mb-24">
          <RegistrationForm onSuccess={() => setIsSuccessModalOpen(true)} />
        </div>

        {/* 3. Social Media Linkages */}
        <div className="w-full border-t border-[#333333] pt-16 mt-auto">
          <SocialLinks />
        </div>

        {/* Development Telemetry Footer */}
        <div className="w-full text-center mt-16 text-[#555555] font-mono text-[0.8rem]">
          ACTIVE SESSION: {sessionUptime}s | NODE: SECURE
        </div>

      </main>

      {/* Success Modal Overlay */}
      {isSuccessModalOpen && (
        <SuccessModal onClose={() => setIsSuccessModalOpen(false)} />
      )}
    </div>
  );
}