import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Delete, HelpCircle, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { setupRecaptcha, sendPhoneOTP } from '../../services/firebaseAuth';

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

  const type = (k) => {
    if (k === 'del') {
      setPhone(p => p.slice(0, -1));
    } else if (phone.length < 10) {
      setPhone(p => p + k);
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
      // Catch real Firebase errors (e.g., rate limits, invalid formats)
      setError(err.message || 'Failed to send SMS. Please verify your number.');
      
      // Reset reCAPTCHA so the user can try again
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surfaceBlack text-white flex flex-col font-sans relative">
      {/* Hidden Firebase Recaptcha Container (Required for free SMS) */}
      <div id="recaptcha-container" className="absolute top-0 left-0"></div>

      {/* NEW SECTION 1: Help & Support Header */}
      <div className="px-6 pt-14 pb-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-surfaceDark rounded-full transition-colors active:scale-95">
          <ChevronLeft size={28} className="text-white" />
        </button>
        <a href="mailto:support@movyra.com?subject=Login%20Issue" className="flex items-center gap-2 px-4 py-2 bg-surfaceDark rounded-full text-textGray hover:text-white transition-colors active:scale-95 border border-white/5">
          <HelpCircle size={16} />
          <span className="text-sm font-bold tracking-wide">Help</span>
        </a>
      </div>

      <div className="px-8 flex-1 flex flex-col">
        <h1 className="text-4xl font-bold mb-3 tracking-tight">Welcome <br/>back.</h1>
        <p className="text-textGray text-lg">Enter your phone number to receive a secure OTP.</p>
        
        <div className="flex items-center gap-4 mt-8 mb-4">
          <div className="bg-surfaceDarker px-5 py-4 rounded-2xl border border-white/5 font-bold text-xl text-textGray">
            +91
          </div>
          <div className={`flex-1 bg-surfaceDarker px-5 py-4 rounded-2xl border transition-all duration-300 ${phone.length === 10 ? 'border-movyraMint shadow-mintGlow' : 'border-white/5'}`}>
            <span className={`text-2xl font-bold tracking-widest ${phone.length > 0 ? 'text-white' : 'text-white/20'}`}>
              {phone || '0000000000'}
            </span>
          </div>
        </div>

        {/* NEW SECTION 2: Real-time Error Engine */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-start gap-3 mb-4 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-200 font-medium leading-snug">{error}</p>
          </div>
        )}

        {/* NEW SECTION 3: Security Trust Badge */}
        <div className="flex items-center gap-2 mt-4 opacity-60">
          <ShieldCheck size={16} className="text-movyraMint" />
          <p className="text-xs text-textGray">
            Secured by Firebase & reCAPTCHA Enterprise.
          </p>
        </div>
      </div>

      <div className="bg-surfaceDark rounded-t-[40px] px-6 pt-8 pb-8 border-t border-white/5 shadow-[0_-20px_40px_rgba(0,0,0,0.5)]">
        {/* Custom Numpad */}
        <div className="grid grid-cols-3 gap-y-6 gap-x-4 mb-10 text-3xl font-medium text-center">
          {[1,2,3,4,5,6,7,8,9].map(n => (
            <button key={n} onClick={() => type(n.toString())} className="py-2 active:scale-90 active:text-movyraMint transition-all">{n}</button>
          ))}
          <div className="col-start-2">
            <button onClick={() => type('0')} className="w-full py-2 active:scale-90 active:text-movyraMint transition-all">0</button>
          </div>
          <div className="col-start-3 flex justify-center items-center">
            <button onClick={() => type('del')} className="py-2 active:scale-90 active:text-movyraMint transition-all text-textGray"><Delete size={32}/></button>
          </div>
        </div>

        {/* Action Button with Loading State */}
        <button 
          onClick={handleSend} 
          disabled={phone.length !== 10 || isLoading} 
          className="w-full bg-movyraMint text-surfaceBlack py-4 rounded-pill font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:shadow-none shadow-mintGlow active:scale-[0.98]"
        >
          {isLoading ? (
            <>
              <Loader2 size={24} className="animate-spin text-surfaceBlack" />
              <span>Verifying Network...</span>
            </>
          ) : (
            'Send Code'
          )}
        </button>

        {/* Terms of Service Consent */}
        <p className="text-[10px] text-textGray text-center mt-6 px-4">
          By continuing, you agree to Movyra's <a href="#" className="text-white underline">Terms of Service</a> and <a href="#" className="text-white underline">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}