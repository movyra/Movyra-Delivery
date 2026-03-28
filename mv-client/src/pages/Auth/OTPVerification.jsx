import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ShieldCheck, AlertCircle, Loader2, RefreshCcw, MailCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../store/useAuthStore';
import apiClient from '../../services/apiClient';
import { verifyOTPSession, generateOTP, sendOTPEmail } from '../../services/emailAuth';
import { authenticateSeamlessly } from '../../services/firebaseAuth';
import MovyraButton from '../../components/UI/MovyraButton';

// ============================================================================
// PAGE: OTP VERIFICATION (100% FREE TIER)
// Validates the 4-digit EmailJS code and securely provisions/authenticates
// the user via Firebase's free Email/Password tier.
// ============================================================================

export default function OTPVerification() {
  const location = useLocation();
  const navigate = useNavigate();
  const login = useAuthStore(s => s.login);
  
  // Securely retrieve state passed from MobileLogin/MobileSignup
  const email = location.state?.email || "";
  const name = location.state?.name || "";

  // Kick out users who land here without an email context
  useEffect(() => {
    if (!email) navigate('/auth-login', { replace: true });
  }, [email, navigate]);

  const [code, setCode] = useState(['', '', '', '']); // 4-digit EmailJS Standard
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];

  // NEW SECTION 1: Resend Countdown Timer (Prevents API Spam)
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);

  const handleResend = async () => {
    setIsVerifying(true);
    setError('');
    try {
      const otp = generateOTP();
      await sendOTPEmail(email, otp);
      setTimeLeft(60); // Reset timer to 60 seconds
    } catch (err) {
      setError(err.message || "Failed to resend code.");
    } finally {
      setIsVerifying(false);
    }
  };

  // NEW SECTION 2: 4-Digit Auto-Focus Logic
  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    setError(''); 
    
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    // Auto-advance
    if (value && index < 3) inputRefs[index + 1].current.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4).replace(/\D/g, '');
    if (pastedData) {
      const newCode = [...code];
      for (let i = 0; i < pastedData.length; i++) newCode[i] = pastedData[i];
      setCode(newCode);
      const focusIndex = Math.min(pastedData.length, 3);
      inputRefs[focusIndex].current?.focus();
    }
  };

  const verifyOTP = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 4) return;

    setIsVerifying(true);
    setError('');

    try {
      // 1. Validate the local EmailJS OTP session
      const validation = verifyOTPSession(fullCode);
      if (!validation.valid) {
        setError(validation.message);
        setIsVerifying(false);
        return;
      }

      // 2. OTP Valid -> Authenticate or Register silently via Firebase free tier
      const { user, isNewUser } = await authenticateSeamlessly(email);
      
      // 3. Extract the secure JWT for your Rust Backend
      const token = await user.getIdToken(true);
      
      // 4. Trigger Real Backend Sync (creates PG database row if new user)
      try {
        await apiClient.post('/auth/sync', 
          { email: user.email, name: name || user.displayName || "User", isNewUser },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (syncErr) {
        console.warn("Backend sync warning (continuing login):", syncErr);
      }

      // 5. Store user securely in Zustand and release into the app
      login(
        { id: user.uid, email: user.email, isAnonymous: false }, 
        token
      );
      
      // 6. Hard navigate to dashboard, clearing auth stack
      navigate('/dashboard-home', { replace: true });

    } catch (err) {
      console.error("Firebase Authentication Error:", err);
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-movyra-surface text-gray-800 flex flex-col font-sans relative overflow-hidden">
      
      {/* SECTION 1: Secure Header Navigation with User Logo */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 pt-14 pb-4 flex items-center justify-between"
      >
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-movyra-blue hover:bg-blue-50 rounded-full transition-colors active:scale-95">
            <ChevronLeft size={28} />
          </button>
          <span className="ml-2 font-bold tracking-widest text-sm uppercase text-gray-400">Verification</span>
        </div>
        
        {/* Brand Logo inside Header */}
        <div className="w-8 h-8 rounded-lg overflow-hidden border border-gray-100 shadow-sm flex items-center justify-center bg-white">
          <img src="/logo.png" alt="Movyra Logo" className="w-full h-full object-cover" />
        </div>
      </motion.div>

      <div className="px-8 mt-4 flex-1 flex flex-col">
        {/* SECTION 2: Hero Identity */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="w-16 h-16 bg-white border border-gray-100 rounded-2xl flex items-center justify-center mb-8 shadow-sm"
        >
          <MailCheck size={32} className="text-movyra-blue" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-4xl font-black mb-3 tracking-tight text-gray-900">Enter code.</h1>
          <p className="text-gray-500 text-lg mb-8 leading-relaxed">
            Sent securely to <br/><span className="text-movyra-blue font-bold">{email}</span>
          </p>
        </motion.div>

        {/* SECTION 3: Real-Time Exception Catcher */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              className="bg-red-50 border-2 border-red-100 rounded-2xl p-4 flex items-start gap-3 mb-6"
            >
              <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 font-bold">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SECTION 4: 4-Digit Array Input Engine */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-4 mb-8 justify-center" 
          onPaste={handlePaste}
        >
          {code.map((digit, index) => (
            <input
              key={index}
              ref={inputRefs[index]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-16 h-20 text-center text-3xl font-black rounded-2xl bg-white outline-none transition-all duration-300 shadow-sm ${
                digit 
                  ? 'border-2 border-movyra-blue text-gray-900 shadow-lg shadow-movyra-blue/20' 
                  : 'border-2 border-gray-100 text-gray-400 focus:border-blue-300'
              }`}
            />
          ))}
        </motion.div>

        {/* Resend Timer UI */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center mb-10"
        >
          <p className="text-gray-500 font-bold text-sm flex items-center gap-2">
            Didn't receive it? 
            {timeLeft > 0 ? (
              <span className="text-gray-900">0:{timeLeft.toString().padStart(2, '0')}</span>
            ) : (
              <button onClick={handleResend} className="text-movyra-blue flex items-center gap-1 active:scale-95 transition-transform">
                <RefreshCcw size={16} /> Resend
              </button>
            )}
          </p>
        </motion.div>
      </div>

      {/* SECTION 5: Footer Actions & Trust Badges */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-t-[40px] px-6 pt-10 pb-safe border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]"
      >
        <MovyraButton 
          variant="solid"
          onClick={verifyOTP}
          disabled={isVerifying || code.join('').length !== 4}
          className="mb-6"
        >
          {isVerifying ? (
            <>
              <Loader2 size={24} className="animate-spin text-white" />
              <span>Authenticating...</span>
            </>
          ) : (
            'Confirm Identity'
          )}
        </MovyraButton>

        <div className="flex items-center justify-center gap-2 mb-8">
          <ShieldCheck size={18} className="text-movyra-blue" />
          <p className="text-xs text-gray-400 font-bold">
            256-bit Secure Authentication
          </p>
        </div>
      </motion.div>

    </div>
  );
}