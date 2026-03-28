import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, HelpCircle, ShieldCheck, AlertCircle, Loader2, Mail, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateOTP, sendOTPEmail } from '../../services/emailAuth';
import MovyraButton from '../../components/UI/MovyraButton';

// ============================================================================
// PAGE: MOBILE SIGNUP (100% FREE EMAIL TIER)
// Features native email/text keyboard triggers, secure OTP generation, 
// and EmailJS transmission logic for new account creation.
// ============================================================================

export default function MobileSignup() {
  const navigate = useNavigate(); 
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Strict Regex for real-time email validation
  const isValidEmail = (emailAddress) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress);
  };

  const handleSend = async () => {
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
        
        {/* Brand Logo inside Header (Using user's PNG) */}
        <div className="w-8 h-8 rounded-lg overflow-hidden border border-gray-100 shadow-sm flex items-center justify-center bg-white">
          <img src="/logo.png" alt="Movyra Logo" className="w-full h-full object-cover" />
        </div>

        <a href="mailto:support@movyra.com?subject=Signup%20Issue" className="flex items-center gap-2 px-4 py-2 bg-white rounded-full text-movyra-blue hover:bg-blue-50 transition-colors active:scale-95 border border-blue-100 shadow-sm">
          <HelpCircle size={16} />
          <span className="text-sm font-bold tracking-wide">Help</span>
        </a>
      </motion.div>

      <div className="px-8 flex-1 flex flex-col pt-4">
        {/* SECTION 2: Hero Greeting */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-4xl font-black mb-3 tracking-tight text-gray-900">Join <br/>Movyra.</h1>
          <p className="text-gray-500 text-lg font-medium">Create your free account to start tracking and shipping.</p>
        </motion.div>
        
        {/* SECTION 3: Native Input Fields */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-4 mt-8 mb-6"
        >
          {/* Full Name Input */}
          <div className={`flex items-center gap-3 bg-white px-5 py-4 rounded-2xl border-2 transition-all duration-300 shadow-sm ${name.length >= 2 ? 'border-movyra-blue/50' : 'border-gray-100 focus-within:border-blue-300'}`}>
            <User size={24} className={name.length >= 2 ? "text-movyra-blue" : "text-gray-300"} />
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              placeholder="Full Name"
              className="w-full text-xl font-bold text-gray-800 placeholder:text-gray-300 focus:outline-none bg-transparent"
            />
          </div>

          {/* Email Address Input */}
          <div className={`flex items-center gap-3 bg-white px-5 py-4 rounded-2xl border-2 transition-all duration-300 shadow-sm ${isValidEmail(email) ? 'border-movyra-blue shadow-lg shadow-movyra-blue/20' : 'border-gray-100 focus-within:border-blue-300'}`}>
            <Mail size={24} className={isValidEmail(email) ? "text-movyra-blue" : "text-gray-300"} />
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="Email Address"
              className="w-full text-xl font-bold text-gray-800 placeholder:text-gray-300 focus:outline-none bg-transparent"
            />
          </div>
        </motion.div>

        {/* SECTION 4: Real-time Error Engine & Login Redirect */}
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

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-gray-500 text-sm mt-2 mb-4"
        >
          Already have an account? <Link to="/auth-login" className="text-movyra-blue font-bold hover:underline">Log in</Link>
        </motion.p>
      </div>

      {/* SECTION 5: Footer Actions & Trust Badges */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-t-[40px] px-6 pt-10 pb-safe border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]"
      >
        
        {/* Action Button leveraging the new MovyraButton Design System */}
        <MovyraButton 
          variant="solid"
          onClick={handleSend}
          disabled={!email || !name || isLoading}
          className="mb-6"
        >
          {isLoading ? (
            <>
              <Loader2 size={24} className="animate-spin text-white" />
              <span>Sending Code...</span>
            </>
          ) : (
            'Continue'
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
          By registering, you agree to Movyra's <a href="#" className="text-movyra-blue font-bold">Terms of Service</a> and <a href="#" className="text-movyra-blue font-bold">Privacy Policy</a>.
        </p>
      </motion.div>
    </div>
  );
}