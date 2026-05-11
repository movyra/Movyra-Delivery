import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../../firebaseConfig';

/**
 * ============================================================================
 * COMPONENT: SECURE ADMIN GATE (mv-main)
 * Architecture: Authentication State Machine & Route Wrapper
 * Features: Live Firebase Auth, Targeted Password Resets, Pure Black Minimal UI
 * ============================================================================
 */

const MANDATORY_RESET_EMAILS = ['rishabhtyagi121@gmail.com', 'rohitthakur.ceo@gmail.com'];
const OPTIONAL_RESET_EMAILS = ['testcodecfg@gmail.com'];
const WHITELIST = [...MANDATORY_RESET_EMAILS, ...OPTIONAL_RESET_EMAILS];

export default function SecureAdminGate({ children }) {
  const [authStatus, setAuthStatus] = useState('INITIALIZING'); 
  // States: INITIALIZING, UNAUTHENTICATED, RESET_PROMPT, AUTHENTICATING, GRANTED, DENIED
  
  const [currentUser, setCurrentUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationStep, setVerificationStep] = useState(0);

  const businessSteps = [
    "Verifying credentials...",
    "Establishing secure session...",
    "Validating administrator privileges...",
    "Loading dashboard environment..."
  ];

  // 1. LIVE FIREBASE AUTHENTICATION LISTENER
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.email) {
        const userEmail = user.email.toLowerCase();
        
        // Strict Whitelist Verification
        if (WHITELIST.includes(userEmail)) {
          setCurrentUser(user);
          const hasReset = localStorage.getItem(`pwd_reset_${userEmail}`);
          
          if (!hasReset) {
            setAuthStatus('RESET_PROMPT');
          } else {
            setAuthStatus('AUTHENTICATING');
          }
        } else {
          // Force sign out unauthorized users
          await signOut(auth);
          setAuthStatus('UNAUTHENTICATED');
          setAuthError('Access Denied: Email not authorized for administrative access.');
        }
      } else {
        setAuthStatus('UNAUTHENTICATED');
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. LOADING SEQUENCE MANAGER
  useEffect(() => {
    if (authStatus === 'AUTHENTICATING') {
      const stepInterval = setInterval(() => {
        setVerificationStep((prev) => {
          if (prev < businessSteps.length - 1) return prev + 1;
          clearInterval(stepInterval);
          setTimeout(() => setAuthStatus('GRANTED'), 500);
          return prev;
        });
      }, 600);
      return () => clearInterval(stepInterval);
    }
  }, [authStatus]);

  // 3. LOGIN HANDLERS
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setAuthError('Invalid credentials or unauthorized access.');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setAuthError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setAuthError('Google sign-in sequence failed.');
      setLoading(false);
    }
  };

  // 4. PASSWORD RESET HANDLER
  const handleResetAction = async (triggerEmail) => {
    if (triggerEmail && currentUser) {
      try {
        await sendPasswordResetEmail(auth, currentUser.email);
        alert(`Security notice sent to ${currentUser.email}. Please check your inbox.`);
      } catch (err) {
        console.error(err);
        alert("System error: Unable to dispatch reset link.");
      }
    }
    // Set local flag to bypass prompt on next load
    localStorage.setItem(`pwd_reset_${currentUser.email}`, 'true');
    setAuthStatus('AUTHENTICATING');
  };

  // ==========================================================================
  // RENDER STATE MACHINE
  // ==========================================================================

  if (authStatus === 'DENIED') return <Navigate to="/" replace />;
  if (authStatus === 'GRANTED') return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[99999] bg-[#000000] text-white font-sans flex flex-col items-center justify-center overflow-hidden">
      
      {/* MINIMALIST CSS-IN-JS */}
      <style>
        {`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .animate-fade { animation: fadeIn 0.4s ease-out forwards; }
        `}
      </style>

      {/* STATE: INITIALIZING (Blank Loading) */}
      {authStatus === 'INITIALIZING' && (
        <div className="w-8 h-8 border-2 border-[#333333] border-t-white rounded-full animate-spin"></div>
      )}

      {/* STATE: UNAUTHENTICATED (Login Wall) */}
      {authStatus === 'UNAUTHENTICATED' && (
        <div className="w-full max-w-[400px] p-10 border border-[#222222] bg-[#050505] rounded-[24px] animate-fade">
          <div className="flex justify-center mb-8">
            <img src="/logo.png" alt="Movyra" className="h-10" onError={(e) => e.target.style.display='none'} />
          </div>
          <h2 className="text-[1.2rem] font-black text-center mb-8 uppercase tracking-widest text-white">Admin Access</h2>
          
          {authError && (
            <div className="bg-[#111111] border border-[#333333] text-white text-[0.8rem] p-3 rounded-lg mb-6 text-center font-bold">
              {authError}
            </div>
          )}
          
          <form onSubmit={handleEmailLogin} className="flex flex-col gap-4 mb-6">
            <input 
              type="email" 
              placeholder="Administrator Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="w-full bg-[#000000] border border-[#333333] text-white px-4 py-3 rounded-lg outline-none focus:border-white transition-colors text-[0.9rem]"
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="w-full bg-[#000000] border border-[#333333] text-white px-4 py-3 rounded-lg outline-none focus:border-white transition-colors text-[0.9rem]"
            />
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-[#e0e0e0] transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? 'Processing...' : 'Sign In'}
            </button>
          </form>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-[1px] bg-[#222222]"></div>
            <span className="text-[#666666] text-[0.7rem] uppercase tracking-widest">Or</span>
            <div className="flex-1 h-[1px] bg-[#222222]"></div>
          </div>

          <button 
            onClick={handleGoogleLogin} 
            disabled={loading}
            className="w-full bg-[#000000] border border-[#333333] text-white font-bold py-3 rounded-lg hover:border-white hover:bg-[#111111] transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Sign in with Google
          </button>
        </div>
      )}

      {/* STATE: RESET PROMPT (Mandatory vs Optional) */}
      {authStatus === 'RESET_PROMPT' && (
        <div className="w-full max-w-[480px] p-10 border border-[#222222] bg-[#050505] rounded-[24px] animate-fade text-center">
          <div className="w-12 h-12 bg-[#0055ff]/10 border border-[#0055ff]/30 text-[#0055ff] rounded-full flex items-center justify-center mx-auto mb-6">
             <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
          </div>
          <h2 className="text-[1.5rem] font-black mb-4">Security Requirement</h2>
          <p className="text-[#888888] text-[0.9rem] mb-8 leading-relaxed">
            {MANDATORY_RESET_EMAILS.includes(currentUser?.email) 
              ? "As part of our protocol, you are required to reset your administrator password before proceeding to the dashboard."
              : "You have the option to reset your password for enhanced security, or you may proceed directly to the dashboard."}
          </p>
          <div className="flex flex-col gap-4">
            <button onClick={() => handleResetAction(true)} className="w-full bg-[#0055ff] text-white font-bold py-3.5 rounded-lg hover:bg-[#0044cc] transition-colors">
              Send Reset Link & Proceed
            </button>
            {OPTIONAL_RESET_EMAILS.includes(currentUser?.email) && (
              <button onClick={() => handleResetAction(false)} className="w-full bg-transparent border border-[#333333] text-white font-bold py-3.5 rounded-lg hover:bg-[#111111] transition-colors">
                Skip & Proceed
              </button>
            )}
          </div>
        </div>
      )}

      {/* STATE: AUTHENTICATING (Loading Sequence) */}
      {authStatus === 'AUTHENTICATING' && (
        <div className="flex flex-col items-center animate-fade">
          <img src="/logo.png" alt="Loading" className="w-12 h-12 mb-8 animate-pulse" onError={(e) => e.target.style.display='none'} />
          <div className="text-[1rem] font-bold mb-4">Authenticating Session</div>
          <div className="text-[#666666] text-[0.85rem] font-mono h-6">
            {businessSteps[verificationStep]}
          </div>
        </div>
      )}

    </div>
  );
}