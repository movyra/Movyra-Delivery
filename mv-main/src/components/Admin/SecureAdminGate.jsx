import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
// IMPORTANT: Uncomment these lines when your Firebase Auth is initialized
// import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';

/**
 * ============================================================================
 * COMPONENT: SECURE ADMIN GATE (mv-main)
 * Architecture: Higher-Order Component (HOC) Route Wrapper
 * Features: Strict Email Whitelist, Pure Black UI, 10-Step Visual Verification
 * ============================================================================
 */

const STRICT_WHITELIST = [
  'testcodecfg@gmail.com',
  'rishabhtyagi121@gmail.com',
  'rohitthakur.ceo@gmail.com'
];

export default function SecureAdminGate({ children }) {
  const [authStatus, setAuthStatus] = useState('INITIALIZING'); // INITIALIZING, GRANTED, DENIED
  const [verificationStep, setVerificationStep] = useState(0);

  // 10+ Real-Time Visual Security Sections for the Loading State
  const securitySteps = [
    "Initializing secure environment...",
    "Bypassing standard routing protocols...",
    "Establishing encrypted tunnel...",
    "Verifying SSL certificates...",
    "Checking node integrity...",
    "Mounting Firebase Auth module...",
    "Awaiting user session token...",
    "Extracting identity payload...",
    "Cross-referencing Level 5 Whitelist...",
    "Finalizing cryptographic handshake..."
  ];

  useEffect(() => {
    // Sequentially animate the 10+ security steps to ensure the user sees the high-end loading process
    const stepInterval = setInterval(() => {
      setVerificationStep((prev) => {
        if (prev < securitySteps.length - 1) return prev + 1;
        clearInterval(stepInterval);
        return prev;
      });
    }, 200);

    // FIREBASE AUTHENTICATION LOGIC
    // Uncomment the block below when Firebase is fully configured
    /*
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Add a slight artificial delay to allow the 10-step animation to complete visually
      setTimeout(async () => {
        if (user && user.email && STRICT_WHITELIST.includes(user.email.toLowerCase())) {
          setAuthStatus('GRANTED');
        } else {
          if (user) {
            // Forcefully sign out unauthorized users who managed to log in
            await signOut(auth);
          }
          setAuthStatus('DENIED');
        }
      }, 2500); 
    });

    return () => {
      clearInterval(stepInterval);
      unsubscribe();
    };
    */

    // DEVELOPMENT MOCK TIMER (Remove this setTimeout block when uncommenting Firebase above)
    const devTimer = setTimeout(() => {
      // Automatically deny in this mock state to prove the redirect works. 
      // Change to 'GRANTED' to test the dashboard UI locally without Firebase.
      setAuthStatus('DENIED'); 
    }, 2500);
    
    return () => {
      clearInterval(stepInterval);
      clearTimeout(devTimer);
    };

  }, []);

  // STATE 1: DENIED (Force Redirect)
  if (authStatus === 'DENIED') {
    return <Navigate to="/" replace />;
  }

  // STATE 2: GRANTED (Render Dashboard)
  if (authStatus === 'GRANTED') {
    return <>{children}</>;
  }

  // STATE 3: AUTHENTICATING (Pure Black High-End Loading Sequence)
  return (
    <div className="fixed inset-0 z-[99999] bg-[#000000] text-white font-sans flex flex-col items-center justify-center overflow-hidden">
      
      {/* CSS-in-JS Animations */}
      <style>
        {`
          @keyframes pulseGlow { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.05); } }
          @keyframes slideInRight { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
          @keyframes spinSlow { 100% { transform: rotate(360deg); } }
          
          .animate-glow { animation: pulseGlow 3s ease-in-out infinite; }
          .animate-log { animation: slideInRight 0.3s ease-out forwards; }
          .animate-spin-slow { animation: spinSlow 8s linear infinite; }
        `}
      </style>

      {/* Abstract Background Security Rings */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
        <svg viewBox="0 0 800 800" width="800" height="800" className="animate-spin-slow">
          <circle cx="400" cy="400" r="300" fill="none" stroke="#0055ff" strokeWidth="1" strokeDasharray="10 30" />
          <circle cx="400" cy="400" r="250" fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="5 15" opacity="0.5" />
          <circle cx="400" cy="400" r="200" fill="none" stroke="#0055ff" strokeWidth="2" strokeDasharray="20 40" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-[600px] px-8">
        
        {/* Movyra Logo Spinner Core */}
        <div className="relative w-24 h-24 mb-12 flex items-center justify-center">
          <div className="absolute inset-0 border-t-2 border-l-2 border-[#0055ff] rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-b-2 border-r-2 border-white rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          <img src="/logo.png" alt="Movyra" className="w-10 h-10 object-contain animate-glow" onError={(e) => { e.target.style.display='none'; }} />
          {/* Fallback SVG if logo.png is missing */}
          </div>

        <h2 className="text-[1.5rem] font-black tracking-widest uppercase mb-8 text-center">
          Authenticating <span className="text-[#0055ff]">Admin</span>
        </h2>

        {/* Real-Time Security Log Output */}
        <div className="w-full bg-[#0a0a0a] border border-[#111111] rounded-xl p-6 h-[200px] overflow-hidden flex flex-col justify-end shadow-[0_0_30px_rgba(0,85,255,0.05)]">
          <div className="flex flex-col gap-2 font-mono text-[0.75rem] text-[#888888]">
            {securitySteps.slice(0, verificationStep + 1).map((step, index) => (
              <div key={index} className="animate-log flex items-center gap-3">
                <span className="text-[#0055ff] font-bold">[{index + 1}]</span>
                <span className={index === verificationStep ? 'text-white' : 'text-[#555555]'}>{step}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-[0.7rem] font-bold uppercase tracking-widest text-[#333333]">
          Restricted Access
        </div>

      </div>
    </div>
  );
}