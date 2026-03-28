import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, HelpCircle, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { setupRecaptcha, sendPhoneOTP } from '../../services/firebaseAuth';
import MovyraButton from '../../components/UI/MovyraButton';

// ============================================================================
// PAGE: MOBILE LOGIN (LIGHT THEME)
// Features a native numeric keyboard trigger, real Firebase reCAPTCHA,
// and graceful error handling for missing billing configurations.
// ============================================================================

export default function MobileLogin() {
  const navigate = useNavigate(); 
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Clear reCAPTCHA on unmount to prevent invisible widget duplicates
  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  // Handle native keyboard input (Strip non-numeric characters)
  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, ''); // Keep only numbers
    if (val.length <= 10) {
      setPhone(val);
    }
    if (error) setError(''); // Clear errors when user types
  };

  const handleSend = async () => {
    if (phone.length !== 10) return;
    setIsLoading(true);
    setError('');

    try {
      // 1. Initialize Google's bot-protection widget
      const verifier = setupRecaptcha('recaptcha-container');
      
      // 2. Format specifically for Indian telecom
      const formattedPhone = `+91${phone}`;
      
      // 3. Trigger actual Firebase SMS API
      const confirmationResult = await sendPhoneOTP(formattedPhone, verifier);
      
      // 4. Store confirmation object securely for the OTP screen to consume
      window.confirmationResult = confirmationResult;
      
      // 5. Navigate securely to OTP Verification
      navigate('/auth/otp', { state: { phone: formattedPhone } });

    } catch (err) {
      console.error("Firebase SMS Error:", err);
      
      // GRACEFUL ERROR HANDLING: Specifically intercept the billing error
      if (err.code === 'auth/billing-not-enabled' || (err.message && err.message.includes('billing-not-enabled'))) {
        setError('SMS delivery is currently disabled by the provider (Billing missing). Please contact Movyra Support.');
      } else {
        // Catch other real Firebase errors (e.g., rate limits, invalid formats)
        setError(err.message || 'Failed to send SMS. Please verify your number.');
      }
      
      // Reset reCAPTCHA so the user can try again without refreshing
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-movyra-surface text-gray-800 flex flex-col font-sans relative">
      {/* Hidden Firebase Recaptcha Container (Required for free SMS) */}
      <div id="recaptcha-container" className="absolute top-0 left-0"></div>

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
        <div className="w-8 h-8 rounded-lg overflow-hidden border border-gray-100 shadow-sm">
          <img src="/logo.png" alt="Movyra" className="w-full h-full object-cover" />
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
          <p className="text-gray-500 text-lg font-medium">Enter your phone number to receive a secure OTP.</p>
        </motion.div>
        
        {/* SECTION 3: Native Input Field */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3 mt-10 mb-6"
        >
          {/* Country Code Pill */}
          <div className="bg-white px-5 py-5 rounded-2xl border-2 border-gray-100 font-bold text-xl text-gray-400 shadow-sm">
            +91
          </div>
          
          {/* Native Phone Input Container */}
          <div className={`flex-1 bg-white px-5 py-5 rounded-2xl border-2 transition-all duration-300 shadow-sm ${phone.length === 10 ? 'border-movyra-blue shadow-lg shadow-movyra-blue/20' : 'border-gray-100 focus-within:border-blue-300'}`}>
            <input
              type="tel"
              inputMode="numeric"
              maxLength="10"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="Mobile Number"
              className="w-full text-2xl font-black tracking-widest text-gray-800 placeholder:text-gray-300 focus:outline-none bg-transparent"
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
          disabled={phone.length !== 10 || isLoading}
          className="mb-6"
        >
          {isLoading ? (
            <>
              <Loader2 size={24} className="animate-spin text-white" />
              <span>Verifying Network...</span>
            </>
          ) : (
            'Send Code'
          )}
        </MovyraButton>

        {/* Security Trust Badge */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <ShieldCheck size={18} className="text-movyra-blue" />
          <p className="text-xs text-gray-400 font-bold">
            Secured by Firebase & reCAPTCHA.
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