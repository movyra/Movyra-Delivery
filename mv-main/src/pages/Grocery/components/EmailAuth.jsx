import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../../firebaseConfig';

/**
 * ============================================================================
 * COMPONENT: GROCERY EMAIL AUTHENTICATION (mv-main)
 * Purpose: Secure Entry Gateway (Login, Signup, Password Reset).
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