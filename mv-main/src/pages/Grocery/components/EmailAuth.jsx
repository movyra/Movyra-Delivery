import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../../firebaseConfig';

/**
 * ============================================================================
 * COMPONENT: GROCERY EMAIL AUTHENTICATION (mv-main)
 * Purpose: Secure Entry Gateway (Login, Signup, Password Reset, Google OAuth).
 * Behavior: Authenticates via Firebase. Parent orchestrator handles routing
 * automatically upon successful token generation.
 * ============================================================================
 */

export default function EmailAuth() {
  const [view, setView] = useState('login'); // 'login', 'signup', 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const googleProvider = new GoogleAuthProvider();

  // 1. FIREBASE AUTHENTICATION HANDLERS
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Note: No explicit routing needed here. 
      // The Orchestrator's onAuthStateChanged listener will catch this and advance the step.
    } catch (err) {
      console.error(err);
      setError('Invalid credentials. Please check your email and password.');
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (password !== confirmPassword) {
      setError('Security Check Failed: Passwords do not match.');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('Security Check Failed: Password must be at least 6 characters.');
      setLoading(false);
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Orchestrator will automatically advance state
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else {
        setError('Failed to create account. Please try again.');
      }
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      // Orchestrator will automatically advance state
    } catch (err) {
      console.error(err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google sign-in failed. Please try again.');
      }
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('Recovery email sent. Please check your inbox.');
      setTimeout(() => setView('login'), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to send recovery email. Ensure the address is correct.');
    } finally {
      setLoading(false);
    }
  };

  // 2. UI TRANSITION VARIANTS
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  };

  return (
    <div className="w-full min-h-screen bg-[#000000] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Ambient Brand Glow */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#00ff88]/5 to-transparent pointer-events-none"></div>

      <div className="w-full max-w-[400px] z-10 flex flex-col">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-10">
          <img src="/logo.png" alt="Movyra" className="h-10 mb-6" onError={(e) => e.target.style.display='none'} />
          <h1 className="text-[2rem] font-black tracking-tight text-center leading-tight">
            {view === 'login' ? 'Welcome Back' : view === 'signup' ? 'Create Account' : 'Recover Access'}
          </h1>
          <p className="text-[#888888] text-[0.9rem] mt-2 text-center">
            {view === 'login' ? 'Sign in to access Movyra Grocery.' : view === 'signup' ? 'Join the grid for lightning fast deliveries.' : 'Enter your email to reset your credentials.'}
          </p>
        </div>

        {/* Dynamic Form Viewport */}
        <div className="w-full bg-[#050505] border border-[#222222] p-8 rounded-[24px] shadow-[0_0_80px_rgba(255,255,255,0.02)]">
          
          {/* Status Messages */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-[#111111] border border-[#ff4444]/30 text-[#ff4444] text-[0.8rem] p-3 rounded-lg mb-6 text-center font-bold">
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-[#111111] border border-[#00ff88]/30 text-[#00ff88] text-[0.8rem] p-3 rounded-lg mb-6 text-center font-bold">
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {/* LOGIN FORM */}
            {view === 'login' && (
              <motion.form key="login" variants={formVariants} initial="hidden" animate="visible" exit="exit" onSubmit={handleLogin} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[0.75rem] font-bold uppercase tracking-widest text-[#666666] mb-2">Email Address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-[#000000] border border-[#333333] text-white px-4 py-3.5 rounded-xl outline-none focus:border-[#00ff88] transition-colors text-[0.95rem]" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[0.75rem] font-bold uppercase tracking-widest text-[#666666]">Password</label>
                    <button type="button" onClick={() => { setView('reset'); setError(''); }} className="text-[0.75rem] text-[#00ff88] hover:text-white transition-colors font-bold">Forgot?</button>
                  </div>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-[#000000] border border-[#333333] text-white px-4 py-3.5 rounded-xl outline-none focus:border-[#00ff88] transition-colors text-[0.95rem]" />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-white text-black font-black text-[1.1rem] tracking-tight py-4 rounded-xl mt-4 hover:bg-[#e0e0e0] transition-colors disabled:opacity-50">
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>

                {/* Google Sign In - Login View */}
                <div className="flex items-center gap-4 my-2">
                  <div className="flex-1 h-[1px] bg-[#222222]"></div>
                  <span className="text-[#666666] text-[0.7rem] uppercase tracking-widest">Or</span>
                  <div className="flex-1 h-[1px] bg-[#222222]"></div>
                </div>

                <button type="button" onClick={handleGoogleLogin} disabled={loading} className="w-full bg-[#000000] border border-[#333333] text-white font-bold py-3.5 rounded-xl hover:border-white hover:bg-[#111111] transition-colors flex items-center justify-center gap-3 disabled:opacity-50">
                  <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Continue with Google
                </button>

                <div className="text-center mt-4">
                  <span className="text-[#666666] text-[0.85rem]">New to Movyra? </span>
                  <button type="button" onClick={() => { setView('signup'); setError(''); }} className="text-white text-[0.85rem] font-bold hover:text-[#00ff88] transition-colors">Create Account</button>
                </div>
              </motion.form>
            )}

            {/* SIGNUP FORM */}
            {view === 'signup' && (
              <motion.form key="signup" variants={formVariants} initial="hidden" animate="visible" exit="exit" onSubmit={handleSignup} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[0.75rem] font-bold uppercase tracking-widest text-[#666666] mb-2">Email Address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-[#000000] border border-[#333333] text-white px-4 py-3.5 rounded-xl outline-none focus:border-[#00ff88] transition-colors text-[0.95rem]" />
                </div>
                <div>
                  <label className="block text-[0.75rem] font-bold uppercase tracking-widest text-[#666666] mb-2">Secure Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-[#000000] border border-[#333333] text-white px-4 py-3.5 rounded-xl outline-none focus:border-[#00ff88] transition-colors text-[0.95rem]" />
                </div>
                <div>
                  <label className="block text-[0.75rem] font-bold uppercase tracking-widest text-[#666666] mb-2">Confirm Password</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full bg-[#000000] border border-[#333333] text-white px-4 py-3.5 rounded-xl outline-none focus:border-[#00ff88] transition-colors text-[0.95rem]" />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-[#00ff88] text-black font-black text-[1.1rem] tracking-tight py-4 rounded-xl mt-4 hover:bg-[#00cc6a] transition-colors disabled:opacity-50">
                  {loading ? 'Processing...' : 'Create Account'}
                </button>

                {/* Google Sign In - Signup View */}
                <div className="flex items-center gap-4 my-2">
                  <div className="flex-1 h-[1px] bg-[#222222]"></div>
                  <span className="text-[#666666] text-[0.7rem] uppercase tracking-widest">Or</span>
                  <div className="flex-1 h-[1px] bg-[#222222]"></div>
                </div>

                <button type="button" onClick={handleGoogleLogin} disabled={loading} className="w-full bg-[#000000] border border-[#333333] text-white font-bold py-3.5 rounded-xl hover:border-white hover:bg-[#111111] transition-colors flex items-center justify-center gap-3 disabled:opacity-50">
                  <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Continue with Google
                </button>

                <div className="text-center mt-4">
                  <span className="text-[#666666] text-[0.85rem]">Already on the grid? </span>
                  <button type="button" onClick={() => { setView('login'); setError(''); }} className="text-white text-[0.85rem] font-bold hover:text-[#00ff88] transition-colors">Sign In</button>
                </div>
              </motion.form>
            )}

            {/* PASSWORD RESET FORM */}
            {view === 'reset' && (
              <motion.form key="reset" variants={formVariants} initial="hidden" animate="visible" exit="exit" onSubmit={handleReset} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[0.75rem] font-bold uppercase tracking-widest text-[#666666] mb-2">Account Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-[#000000] border border-[#333333] text-white px-4 py-3.5 rounded-xl outline-none focus:border-[#00ff88] transition-colors text-[0.95rem]" />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-white text-black font-black text-[1.1rem] tracking-tight py-4 rounded-xl mt-4 hover:bg-[#e0e0e0] transition-colors disabled:opacity-50">
                  {loading ? 'Sending...' : 'Send Recovery Link'}
                </button>
                <div className="text-center mt-4">
                  <button type="button" onClick={() => { setView('login'); setError(''); }} className="text-[#888888] text-[0.85rem] font-bold hover:text-white transition-colors">Cancel & Return to Login</button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}