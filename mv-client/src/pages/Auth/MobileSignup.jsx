import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, AlertCircle, Loader2, Mail, User, ArrowRight, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateOTP, sendOTPEmail } from '../../services/emailAuth';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

// ============================================================================
// PAGE: MOBILE SIGNUP (STARK MINIMALIST UI)
// Implements the high-contrast, pure black/white Uber-inspired aesthetic.
// Features flat gray inputs, massive display typography, and stark pill buttons.
// Integrates EmailJS OTP Handshake & Firebase Google Auth.
// ============================================================================

export default function MobileSignup() {
  const navigate = useNavigate(); 
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  // New B2B State
  const [isBusiness, setIsBusiness] = useState(false);
  const [gstNumber, setGstNumber] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  // Strict Regex for real-time email validation
  const isValidEmail = (emailAddress) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress);
  };

  // ============================================================================
  // LOGIC: EMAILJS OTP HANDSHAKE
  // ============================================================================
  const handleSendOTP = async () => {
    if (name.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    // B2B Strict Validation
    if (isBusiness && gstNumber.trim().length !== 15) {
      setError('Please enter a valid 15-character GST number.');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      // 1. Generate a cryptographically secure 4-digit code
      const otp = generateOTP();
      
      // 2. Trigger the EmailJS API to deliver the code
      await sendOTPEmail(email, otp);
      
      // 3. Navigate to OTP Verification, passing name, email, and B2B data securely
      navigate('/auth/otp', { 
        state: { 
          email: email.trim(), 
          name: name.trim(), 
          isBusiness,
          gstNumber: isBusiness ? gstNumber.trim().toUpperCase() : null,
          isSignup: true 
        } 
      });

    } catch (err) {
      console.error("EmailJS Transmission Error:", err);
      setError('Failed to send security code. Please check your network.');
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // LOGIC: FIREBASE GOOGLE AUTHENTICATION
  // ============================================================================
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError('');
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    
    try {
      await signInWithPopup(auth, provider);
      // Navigation removed to prevent double-navigation conflicts.
      // If successful, the global RequireGuestGuard in App.jsx will instantly redirect to the dashboard.
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
          className="mb-10"
        >
          <h1 className="text-[44px] font-black text-black leading-[1.05] tracking-tighter mb-4">
            Create an <br/>account.
          </h1>
          <p className="text-[16px] text-gray-500 font-medium leading-relaxed">
            Join Movyra for global logistics and live tracking.
          </p>
        </motion.div>
        
        {/* Flat Gray Secondary Pill Button (Google) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
        >
          <button 
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isLoading}
            className="w-full flex items-center justify-center gap-3 bg-[#F6F6F6] text-black py-4 rounded-full font-bold text-[17px] hover:bg-gray-200 active:scale-[0.98] transition-all h-[60px] mb-6 disabled:opacity-50"
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
        </motion.div>

        {/* Minimalist Divider */}
        <div className="flex items-center gap-4 mb-6 opacity-60">
          <div className="h-px bg-gray-300 flex-1"></div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">or</span>
          <div className="h-px bg-gray-300 flex-1"></div>
        </div>

        {/* SECTION 4: Flat Minimalist Inputs & B2B Toggle */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
          className="flex flex-col gap-4 mb-6"
        >
          {/* Full Name Input */}
          <div className={`flex items-center px-5 py-4.5 rounded-2xl border-2 transition-all duration-200 bg-[#F6F6F6] ${name.length >= 2 ? 'border-black bg-white' : 'border-transparent focus-within:border-black focus-within:bg-white'}`}>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              placeholder="Full Name"
              className="w-full text-[17px] font-bold text-black placeholder:text-gray-400 placeholder:font-medium focus:outline-none bg-transparent"
            />
          </div>

          {/* Email Input */}
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

          {/* Business Profile Toggle */}
          <div className="flex items-center justify-between p-5 rounded-2xl border-2 border-transparent bg-[#F6F6F6] transition-all">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isBusiness ? 'bg-black text-white' : 'bg-gray-200 text-gray-400'}`}>
                <Briefcase size={20} strokeWidth={2.5} />
              </div>
              <div>
                <span className="block text-[15px] font-bold text-black leading-tight">Business Profile</span>
                <span className="block text-[12px] font-medium text-gray-500 mt-0.5">For B2B expense tracking</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => { setIsBusiness(!isBusiness); setError(''); }}
              className={`w-[46px] h-[26px] rounded-full p-[3px] transition-colors duration-300 ease-in-out ${isBusiness ? 'bg-[#276EF1]' : 'bg-gray-300'}`}
            >
              <motion.div
                layout
                className="w-5 h-5 bg-white rounded-full shadow-sm"
                animate={{ x: isBusiness ? 20 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
          </div>

          {/* GST Input (Animated Expansion) */}
          <AnimatePresence>
            {isBusiness && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: -16 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 0 }}
                exit={{ opacity: 0, height: 0, marginTop: -16 }}
                className="overflow-hidden"
              >
                <div className={`flex items-center px-5 py-4.5 rounded-2xl border-2 transition-all duration-200 bg-[#F6F6F6] ${gstNumber.length === 15 ? 'border-black bg-white' : 'border-transparent focus-within:border-black focus-within:bg-white'}`}>
                  <input
                    type="text"
                    maxLength={15}
                    value={gstNumber}
                    onChange={(e) => { setGstNumber(e.target.value.toUpperCase()); setError(''); }}
                    placeholder="15-Digit GST Number"
                    className="w-full text-[17px] font-bold text-black placeholder:text-gray-400 placeholder:font-medium focus:outline-none bg-transparent uppercase"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>

        {/* Real-time Error Engine */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-50 text-red-600 p-4 rounded-2xl font-bold text-sm flex items-start gap-2 mb-6"
            >
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="leading-snug">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* SECTION 5: Stark Action Area */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
          className="mt-auto space-y-4 pb-4"
        >
          {/* Stark Black Primary Pill Button */}
          <button 
            onClick={handleSendOTP}
            disabled={!email || !name || isLoading || isGoogleLoading}
            className="w-full flex items-center justify-between px-6 bg-black text-white py-4 rounded-full font-bold text-[17px] hover:bg-gray-900 active:scale-[0.98] transition-all h-[60px] disabled:opacity-50"
          >
            <span className="flex-1 text-center pl-6">
              {isLoading ? 'Sending...' : 'Verify Email'}
            </span>
            {isLoading ? (
              <Loader2 size={24} className="animate-spin text-white" />
            ) : (
              <ArrowRight size={24} className="text-white" />
            )}
          </button>

          {/* Login Redirect */}
          <p className="text-center text-gray-500 text-[15px] pt-4 font-medium">
            Already have an account? <Link to="/auth-login" className="text-black font-extrabold hover:underline">Log in</Link>
          </p>
        </motion.div>
        
      </div>
    </div>
  );
}