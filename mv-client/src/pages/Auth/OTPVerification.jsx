import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ShieldCheck, AlertCircle, Loader2, RefreshCcw, CheckSquare, Square } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import apiClient from '../../services/apiClient';

export default function OTPVerification() {
  const location = useLocation();
  const navigate = useNavigate();
  const login = useAuthStore(s => s.login);
  const phone = location.state?.phone || "your number";

  const [code, setCode] = useState(['', '', '', '', '', '']); // 6-digit Firebase Standard
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  
  // New Section States
  const [timeLeft, setTimeLeft] = useState(60);
  const [rememberDevice, setRememberDevice] = useState(true);
  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  // NEW SECTION 1: Resend Countdown Timer (Prevents Google API Spam)
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);

  // NEW SECTION 2: Premium 6-Digit Auto-Focus Logic
  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    setError(''); // Clear errors on typing
    
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    // Auto-advance
    if (value && index < 5) inputRefs[index + 1].current.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).replace(/\D/g, '');
    if (pastedData) {
      const newCode = [...code];
      for (let i = 0; i < pastedData.length; i++) newCode[i] = pastedData[i];
      setCode(newCode);
      // Focus last filled input
      const focusIndex = Math.min(pastedData.length, 5);
      inputRefs[focusIndex].current?.focus();
    }
  };

  const verifyOTP = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) return;

    if (!window.confirmationResult) {
      setError("Session expired. Please go back and request a new code.");
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      // 1. Send code to Google for real cryptographic verification
      const result = await window.confirmationResult.confirm(fullCode);
      
      // 2. Extract the secure JWT for your Rust Backend
      const token = await result.user.getIdToken(true);
      
      // 3. Trigger Real Backend Sync (creates PG database row if new user)
      try {
        await apiClient.post('/auth/sync', 
          { phone: result.user.phoneNumber, remember_device: rememberDevice },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (syncErr) {
        console.warn("Backend sync warning (continuing login):", syncErr);
      }

      // 4. Store user securely in Zustand and release into the app
      login(
        { id: result.user.uid, phone: result.user.phoneNumber, isAnonymous: false }, 
        token
      );
      
      // Clear security object from window
      window.confirmationResult = null;
      
      // 5. Hard navigate to dashboard, clearing auth stack
      navigate('/dashboard-home', { replace: true });

    } catch (err) {
      console.error("Firebase OTP Verification Error:", err);
      // Map common Firebase errors to user-friendly text
      if (err.code === 'auth/invalid-verification-code') {
        setError('The code you entered is incorrect. Please try again.');
      } else if (err.code === 'auth/code-expired') {
        setError('This code has expired. Please request a new one.');
      } else {
        setError(err.message || 'Verification failed. Please try again.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-surfaceBlack text-white flex flex-col font-sans relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-movyraMint/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      {/* NEW SECTION 3: Secure Header Navigation */}
      <div className="px-6 pt-14 pb-4 flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-surfaceDark rounded-full transition-colors active:scale-95">
          <ChevronLeft size={28} className="text-white" />
        </button>
        <span className="ml-2 font-bold tracking-widest text-sm uppercase text-textGray">Verification</span>
      </div>

      <div className="px-8 mt-4 flex-1 flex flex-col">
        <div className="w-16 h-16 bg-surfaceDark border border-white/5 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(0,240,181,0.1)]">
          <ShieldCheck size={32} className="text-movyraMint drop-shadow-[0_0_10px_rgba(0,240,181,0.6)]" />
        </div>
        
        <h1 className="text-4xl font-bold mb-3 tracking-tight">Enter code.</h1>
        <p className="text-textGray text-lg mb-8 leading-relaxed">
          Sent securely to <br/><span className="text-white font-bold">{phone}</span>
        </p>

        {/* NEW SECTION 4: Real-Time Exception Catcher */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-start gap-3 mb-6 animate-in fade-in">
            <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-200 font-medium">{error}</p>
          </div>
        )}

        {/* 6-Digit Array Input Engine */}
        <div className="flex gap-2 mb-8 justify-between" onPaste={handlePaste}>
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
              className={`w-12 h-16 text-center text-2xl font-bold rounded-2xl bg-surfaceDarker outline-none transition-all duration-300 ${
                digit 
                  ? 'border-2 border-movyraMint text-white shadow-mintGlow' 
                  : 'border border-white/10 text-white/50 focus:border-movyraMint/50'
              }`}
            />
          ))}
        </div>

        {/* NEW SECTION 5: "Remember Device" Trust Toggle */}
        <div 
          onClick={() => setRememberDevice(!rememberDevice)}
          className="flex items-center gap-3 mb-10 cursor-pointer w-fit opacity-80 hover:opacity-100 transition-opacity"
        >
          {rememberDevice ? <CheckSquare size={20} className="text-movyraMint" /> : <Square size={20} className="text-textGray" />}
          <span className="text-sm font-medium select-none">Remember this device</span>
        </div>

        <div className="mt-auto mb-12 flex flex-col items-center gap-6">
          {/* Resend Timer UI */}
          <p className="text-textGray font-medium text-sm flex items-center gap-2">
            Didn't receive it? 
            {timeLeft > 0 ? (
              <span className="text-white">0:{timeLeft.toString().padStart(2, '0')}</span>
            ) : (
              <button onClick={() => navigate(-1)} className="text-movyraMint font-bold flex items-center gap-1 active:opacity-70">
                <RefreshCcw size={14} /> Resend
              </button>
            )}
          </p>

          <button 
            onClick={verifyOTP}
            disabled={isVerifying || code.join('').length !== 6}
            className="w-full bg-movyraMint text-surfaceBlack py-4 rounded-pill font-bold text-lg flex items-center justify-center gap-2 hover:bg-movyraMintDark active:scale-[0.98] transition-all shadow-mintGlow disabled:opacity-50 disabled:shadow-none"
          >
            {isVerifying ? (
              <>
                <Loader2 size={24} className="animate-spin text-surfaceBlack" />
                <span>Decrypting Token...</span>
              </>
            ) : (
              'Confirm Identity'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}