import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, AlertCircle, Loader2, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Using standard Firebase Auth SDK directly to resolve import compilation issues
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

// ============================================================================
// PAGE: MOBILE LOGIN (STARK MINIMALIST UI)
// Implements the high-contrast, pure black/white Uber-inspired aesthetic.
// Features flat gray inputs, massive display typography, and stark pill buttons.
// ============================================================================

export default function MobileLogin() {
  const navigate = useNavigate(); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  // Strict Regex for real-time email validation
  const isValidEmail = (emailAddress) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress);
  };

  // ============================================================================
  // LOGIC: FIREBASE EMAIL & PASSWORD AUTH
  // ============================================================================
  const handleEmailLogin = async () => {
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
      // Navigation calls removed as requested to prevent double-navigation.
      // The application's root auth guard will automatically handle the redirect.
    } catch (err) {
      console.error("Login Error:", err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else {
        setError('Login failed. Please check your network.');
      }
      setIsLoading(false);
    }
  };

  // ============================================================================
  // LOGIC: FIREBASE GOOGLE AUTHENTICATION
  // ============================================================================
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError('');
    
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // Navigation calls removed as requested to prevent double-navigation.
      // The application's root auth guard will automatically handle the redirect.
    } catch (err) {
      console.error("Google Auth Error:", err);
      setError('Google Sign-In failed or was cancelled.');
      setIsGoogleLoading(false);
    }
  };

  return (
    // Root: Pure White Background
    <div className="min-h-screen bg-white text-black flex flex-col font-sans relative overflow-hidden">

      {/* SECTION 1: Top Navigation & Logo */}
      <div className="pt-12 px-6 pb-2 flex items-center justify-between z-50">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-black hover:bg-gray-100 transition-colors active:scale-95"
        >
          <ChevronLeft size={28} strokeWidth={2.5} />
        </button>
        
        {/* Real Brand Logo */}
        <div className="w-8 h-8 rounded-md overflow-hidden bg-black flex items-center justify-center">
          <img src="/logo.png" alt="Movyra" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* SECTION 2: Main Viewport */}
      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col px-8 pt-8 pb-8">
        
        {/* SECTION 3: Massive Display Typography */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-12"
        >
          <h1 className="text-[44px] font-black text-black leading-[1.05] tracking-tighter mb-4">
            Welcome <br/>back.
          </h1>
          <p className="text-[16px] text-gray-500 font-medium leading-relaxed">
            Enter your credentials to continue.
          </p>
        </motion.div>
        
        {/* SECTION 4: Flat Minimalist Inputs */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="flex flex-col gap-4 mb-8"
        >
          {/* Email Input (Flat Gray to Stark Black Border) */}
          <div className={`flex items-center px-5 py-4.5 rounded-2xl border-2 transition-all duration-200 bg-[#F6F6F6] ${isValidEmail(email) ? 'border-black bg-white' : 'border-transparent focus-within:border-black focus-within:bg-white'}`}>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="Email address"
              className="w-full text-[17px] font-bold text-black placeholder:text-gray-400 placeholder:font-medium focus:outline-none bg-transparent"
            />
          </div>

          {/* Password Input */}
          <div className={`flex items-center px-5 py-4.5 rounded-2xl border-2 transition-all duration-200 bg-[#F6F6F6] ${password.length >= 6 ? 'border-black bg-white' : 'border-transparent focus-within:border-black focus-within:bg-white'}`}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="Password"
              className="w-full text-[17px] font-bold text-black placeholder:text-gray-400 placeholder:font-medium focus:outline-none bg-transparent"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-black transition-colors ml-2"
            >
              {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
            </button>
          </div>
        </motion.div>

        {/* Real-time Error Engine */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gray-100 border-l-4 border-black rounded-r-xl p-4 flex items-start gap-3 mb-8"
            >
              <AlertCircle size={20} className="text-black flex-shrink-0 mt-0.5" />
              <p className="text-[14px] text-black font-bold leading-snug">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* SECTION 5: Stark Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
          className="mt-auto space-y-4 pb-4"
        >
          
          {/* Stark Black Primary Pill Button */}
          <button 
            onClick={handleEmailLogin}
            disabled={!email || !password || isLoading || isGoogleLoading}
            className="w-full flex items-center justify-between px-6 bg-black text-white py-4 rounded-full font-bold text-[17px] hover:bg-gray-900 active:scale-[0.98] transition-all h-[60px] disabled:opacity-50"
          >
            <span className="flex-1 text-center pl-6">
              {isLoading ? 'Authenticating...' : 'Log in'}
            </span>
            {isLoading ? (
              <Loader2 size={24} className="animate-spin text-white" />
            ) : (
              <ArrowRight size={24} className="text-white" />
            )}
          </button>

          {/* Flat Gray Secondary Pill Button (Google) */}
          <button 
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isLoading}
            className="w-full flex items-center justify-center gap-3 bg-[#F6F6F6] text-black py-4 rounded-full font-bold text-[17px] hover:bg-gray-200 active:scale-[0.98] transition-all h-[60px] disabled:opacity-50"
          >
            {isGoogleLoading ? <Loader2 size={24} className="animate-spin text-black" /> : (
              <>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>
          
          <p className="text-center text-gray-500 text-[15px] pt-4 font-medium">
            Don't have an account? <Link to="/auth-signup" className="text-black font-extrabold hover:underline">Sign up</Link>
          </p>

        </motion.div>
      </div>
    </div>
  );
}