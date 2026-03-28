import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, HelpCircle, ShieldCheck, AlertCircle, Loader2, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateOTP, sendOTPEmail } from '../../services/emailAuth';
import MovyraButton from '../../components/UI/MovyraButton';

// ============================================================================
// PAGE: MOBILE LOGIN (100% FREE EMAIL TIER)
// Features native email keyboard triggers, secure OTP generation, 
// and EmailJS transmission logic. No credit card required.
// ============================================================================

export default function MobileLogin() {
  const navigate = useNavigate(); 
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Strict Regex for real-time email validation
  const isValidEmail = (emailAddress) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress);
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (error) setError(''); // Clear errors when user types
  };

  const handleSend = async () => {
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
      
      // 3. Navigate to OTP Verification, passing the email securely in memory
      navigate('/auth/otp', { state: { email: email.trim() } });

    } catch (err) {
      console.error("EmailJS Transmission Error:", err);
      setError(err.message || 'Failed to send security code. Please check your network and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-movyra-surface text-gray-800 flex flex-col font-sans relative">

      {/* SECTION 1: Nav & Help Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 pt-14 pb-4 flex items-center justify-between"
      >
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-movyra-blue hover:bg-blue-50 rounded-full transition-colors active:scale-95">
          <ChevronLeft size={28} />
        </button>
        
        {/* Brand Logo inside Header */}
        <div className="w-8 h-8 rounded-lg overflow-hidden border border-gray-100 shadow-sm flex items-center justify-center bg-movyra-blue">
           <span className="text-white font-black text-xl leading-none">m</span>
        </div>

        <a href="mailto:support@movyra.com?subject=Login%20Issue" className="flex items-center gap-2 px-4 py-2 bg-white rounded-full text-movyra-blue hover:bg-blue-50 transition-colors active:scale-95 border border-blue-100 shadow-sm">
          <HelpCircle size={16} />
          <span className="text-sm font-bold tracking-wide">Help</span>
        </a>
      </motion.div>

      <div className="px-8 flex-1 flex flex-col pt-8">
        {/* SECTION 2: Hero Greeting */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-4xl font-black mb-3 tracking-tight text-gray-900">Welcome <br/>back.</h1>
          <p className="text-gray-500 text-lg font-medium">Enter your email address to receive a secure OTP.</p>
        </motion.div>
        
        {/* SECTION 3: Native Email Input Field */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3 mt-10 mb-6"
        >
          <div className={`flex-1 flex items-center gap-3 bg-white px-5 py-5 rounded-2xl border-2 transition-all duration-300 shadow-sm ${isValidEmail(email) ? 'border-movyra-blue shadow-lg shadow-movyra-blue/20' : 'border-gray-100 focus-within:border-blue-300'}`}>
            <Mail size={24} className={isValidEmail(email) ? "text-movyra-blue" : "text-gray-300"} />
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Email Address"
              className="w-full text-xl font-bold text-gray-800 placeholder:text-gray-300 focus:outline-none bg-transparent"
              autoFocus
            />
          </div>
        </motion.div>

        {/* SECTION 4: Real-time Error Engine */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              className="bg-red-50 border-2 border-red-100 rounded-2xl p-4 flex items-start gap-3 mb-6"
            >
              <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 font-bold leading-snug">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SECTION 5: Footer Actions & Trust Badges */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-t-[40px] px-6 pt-10 pb-safe border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]"
      >
        
        {/* Action Button leveraging the new MovyraButton Design System */}
        <MovyraButton 
          variant="solid"
          onClick={handleSend}
          disabled={!email || isLoading}
          className="mb-6"
        >
          {isLoading ? (
            <>
              <Loader2 size={24} className="animate-spin text-white" />
              <span>Sending Code...</span>
            </>
          ) : (
            'Send Code'
          )}
        </MovyraButton>

        {/* Security Trust Badge */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <ShieldCheck size={18} className="text-movyra-blue" />
          <p className="text-xs text-gray-400 font-bold">
            Secured by Firebase Auth & EmailJS.
          </p>
        </div>

        {/* Terms of Service Consent */}
        <p className="text-[10px] text-gray-400 text-center px-4 pb-4">
          By continuing, you agree to Movyra's <a href="#" className="text-movyra-blue font-bold">Terms of Service</a> and <a href="#" className="text-movyra-blue font-bold">Privacy Policy</a>.
        </p>
      </motion.div>
    </div>
  );
}