import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, AlertCircle, Loader2, RefreshCcw, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { verifyOTPSession, generateOTP, sendOTPEmail } from '../../services/emailAuth';

// ============================================================================
// PAGE: OTP VERIFICATION (STARK MINIMALIST UI)
// High-contrast, raw numeric entry interface matching the Uber-inspired 
// design language. Features flat gray inputs and massive display typography.
// ============================================================================

export default function OTPVerification() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Securely retrieve state passed from MobileSignup
  const email = location.state?.email || "";
  const name = location.state?.name || "";

  // Kick out users who land here without an email context
  useEffect(() => {
    if (!email) navigate('/auth-signup', { replace: true });
  }, [email, navigate]);

  const [code, setCode] = useState(['', '', '', '']); // 4-digit EmailJS Standard
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];

  // SECTION 1: Resend Countdown Timer (Prevents API Spam)
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

  // SECTION 2: 4-Digit Auto-Focus Logic
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

  // SECTION 3: Local Verification & Redirect Logic
  const verifyOTP = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 4) return;

    setIsVerifying(true);
    setError('');

    try {
      // 1. Validate the local EmailJS OTP session strictly
      const validation = verifyOTPSession(fullCode);
      if (!validation.valid) {
        setError(validation.message);
        setIsVerifying(false);
        return;
      }

      // 2. OTP Valid -> Push user strictly to the new Set Password page
      navigate('/auth/set-password', { 
        state: { email, name },
        replace: true 
      });

    } catch (err) {
      console.error("Verification Error:", err);
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    // Root: Pure White Background
    <div className="min-h-screen bg-white text-black flex flex-col font-sans relative overflow-hidden">
      
      {/* SECTION 4: Top Navigation & Logo */}
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

      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col px-8 pt-8 pb-8">
        
        {/* SECTION 5: Massive Display Typography */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-12"
        >
          <h1 className="text-[44px] font-black text-black leading-[1.05] tracking-tighter mb-4">
            Enter <br/>code.
          </h1>
          <p className="text-[16px] text-gray-500 font-medium leading-relaxed">
            Sent securely to <span className="text-black font-bold">{email}</span>
          </p>
        </motion.div>

        {/* SECTION 6: Flat Minimalist 4-Digit Array Engine */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="flex gap-4 mb-8 justify-between" 
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
              className={`w-[72px] h-[88px] text-center text-[32px] font-black rounded-2xl outline-none transition-all duration-200 border-2 ${
                digit 
                  ? 'border-black bg-white text-black' 
                  : 'border-transparent bg-[#F6F6F6] text-gray-400 focus:border-black focus:bg-white'
              }`}
            />
          ))}
        </motion.div>

        {/* Resend Timer UI */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex mb-10"
        >
          <p className="text-gray-500 font-bold text-[15px] flex items-center gap-2">
            Didn't receive it? 
            {timeLeft > 0 ? (
              <span className="text-black">0:{timeLeft.toString().padStart(2, '0')}</span>
            ) : (
              <button onClick={handleResend} className="text-black flex items-center gap-1.5 active:scale-95 transition-transform underline decoration-2 underline-offset-4">
                <RefreshCcw size={16} strokeWidth={2.5} /> Resend
              </button>
            )}
          </p>
        </motion.div>

        {/* Real-Time Exception Catcher */}
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

        {/* SECTION 7: Stark Action Area */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
          className="mt-auto space-y-4 pb-4"
        >
          {/* Stark Black Primary Pill Button */}
          <button 
            onClick={verifyOTP}
            disabled={isVerifying || code.join('').length !== 4}
            className="w-full flex items-center justify-between px-6 bg-black text-white py-4 rounded-full font-bold text-[17px] hover:bg-gray-900 active:scale-[0.98] transition-all h-[60px] disabled:opacity-50"
          >
            <span className="flex-1 text-center pl-6">
              {isVerifying ? 'Verifying...' : 'Verify & Continue'}
            </span>
            {isVerifying ? (
              <Loader2 size={24} className="animate-spin text-white" />
            ) : (
              <ArrowRight size={24} className="text-white" />
            )}
          </button>
        </motion.div>

      </div>
    </div>
  );
}