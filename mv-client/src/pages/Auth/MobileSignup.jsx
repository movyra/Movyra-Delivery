import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, AlertCircle, Loader2, Mail, User, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateOTP, sendOTPEmail } from '../../services/emailAuth';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

// ============================================================================
// PAGE: MOBILE SIGNUP (OTP-FIRST ARCHITECTURE)
// Premium UI matching the new rounded aesthetic. Password fields removed.
// Integrates EmailJS OTP Handshake & Firebase Google Auth.
// ============================================================================

export default function MobileSignup() {
  const navigate = useNavigate(); 
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
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
    
    setIsLoading(true);
    setError('');

    try {
      // 1. Generate a cryptographically secure 4-digit code
      const otp = generateOTP();
      
      // 2. Trigger the EmailJS API to deliver the code
      await sendOTPEmail(email, otp);
      
      // 3. Navigate to OTP Verification, passing both name and email securely
      navigate('/auth/otp', { state: { email: email.trim(), name: name.trim(), isSignup: true } });

    } catch (err) {
      console.error("EmailJS Transmission Error:", err);
      setError('Failed to send security code. Please check your network and try again.');
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
      // If successful, the global RequireAuthGuard in App.jsx will instantly unlock the dashboard
      navigate('/dashboard-home');
    } catch (err) {
      console.error("Google Auth Error:", err);
      setError('Google Sign-In failed or was cancelled.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#4B75C6] flex flex-col font-sans relative overflow-hidden transition-colors duration-500">
      
      {/* SECTION 1: Top Navigation (Transparent over color) */}
      <div className="absolute top-12 left-6 z-50">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all active:scale-95"
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      {/* SECTION 2: Upper Hero Area */}
      <div className="flex-1 flex flex-col justify-center px-8 pt-10 pb-6 text-white z-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h1 className="text-[38px] font-extrabold leading-[1.1] mb-3 tracking-tight">
            Create your <br/>account
          </h1>
          <p className="text-white/80 text-[17px] font-medium max-w-[280px] leading-relaxed">
            Join Movyra for global logistics, live tracking, and instant pricing.
          </p>
        </motion.div>
      </div>
      
      {/* SECTION 3: Massive Bottom Sheet (Matching Image UI perfectly) */}
      <div className="bg-white rounded-t-[40px] px-8 pt-10 pb-safe flex flex-col relative z-20 min-h-[60%] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] overflow-y-auto no-scrollbar">
        
        {/* Google Single Sign-On */}
        <button 
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading || isLoading}
          className="w-full flex items-center justify-center gap-3 bg-white border-[1.5px] border-gray-200 text-gray-800 py-4 rounded-[24px] font-bold text-[17px] hover:bg-gray-50 active:scale-[0.98] transition-all h-[60px] mb-6 shadow-sm disabled:opacity-50"
        >
          {isGoogleLoading ? <Loader2 size={24} className="animate-spin text-gray-400" /> : (
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

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px bg-gray-200 flex-1"></div>
          <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">or email</span>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>

        {/* Native Input Fields */}
        <div className="flex flex-col gap-4 mb-6">
          <div className={`flex items-center gap-3 bg-[#F8F9FA] px-5 py-4 rounded-[20px] border-[1.5px] transition-all duration-300 ${name.length >= 2 ? 'border-gray-300 bg-white' : 'border-transparent focus-within:border-gray-300 focus-within:bg-white'}`}>
            <User size={22} className={name.length >= 2 ? "text-[#121212]" : "text-gray-400"} />
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              placeholder="Full Name"
              className="w-full text-[17px] font-bold text-[#121212] placeholder:text-gray-400 focus:outline-none bg-transparent"
            />
          </div>

          <div className={`flex items-center gap-3 bg-[#F8F9FA] px-5 py-4 rounded-[20px] border-[1.5px] transition-all duration-300 ${isValidEmail(email) ? 'border-gray-300 bg-white' : 'border-transparent focus-within:border-gray-300 focus-within:bg-white'}`}>
            <Mail size={22} className={isValidEmail(email) ? "text-[#121212]" : "text-gray-400"} />
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="Email Address"
              className="w-full text-[17px] font-bold text-[#121212] placeholder:text-gray-400 focus:outline-none bg-transparent"
            />
          </div>
        </div>

        {/* Real-time Error Engine */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-50 rounded-[16px] p-4 flex items-start gap-3 mb-6"
            >
              <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-[14px] text-red-600 font-bold leading-snug">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Primary Action Button (Matches the Get Started pill from the image) */}
        <button 
          onClick={handleSendOTP}
          disabled={!email || !name || isLoading || isGoogleLoading}
          className="w-full flex items-center justify-center gap-2 bg-[#1A1A1A] text-white py-4 rounded-[24px] font-bold text-[17px] hover:bg-black active:scale-[0.98] transition-all h-[60px] disabled:opacity-50 mt-auto"
        >
          {isLoading ? <Loader2 size={24} className="animate-spin text-white" /> : (
            <>
              <span>Verify Email</span>
              <ArrowRight size={20} />
            </>
          )}
        </button>

        {/* Login Redirect */}
        <p className="text-center text-[#666666] text-[15px] mt-6 pb-4 font-medium">
          Already have an account? <Link to="/auth-login" className="text-[#1A1A1A] font-extrabold hover:underline">Log in</Link>
        </p>
        
      </div>
    </div>
  );
}