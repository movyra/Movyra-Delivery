import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Delete } from 'lucide-react';

export default function MobileLogin() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleKeyPress = (key) => {
    if (key === 'backspace') {
      setPhone(prev => prev.slice(0, -1));
    } else if (phone.length < 10) {
      setPhone(prev => prev + key);
    }
  };

  const handleSendOTP = async () => {
    if (phone.length !== 10) return;
    setIsSubmitting(true);
    
    // Real implementation: Here you would trigger Firebase Auth or your REST API
    // await firebaseAuth.signInWithPhoneNumber(`+91${phone}`, recaptchaVerifier);
    
    // Navigate to OTP screen passing the phone number in state
    navigate('/auth/otp', { state: { phone: `+91${phone}` } });
  };

  return (
    <div className="min-h-screen bg-surfaceBlack text-white flex flex-col font-sans">
      {/* Header */}
      <div className="px-6 pt-14 pb-4 flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-surfaceDark rounded-full transition-colors">
          <ChevronLeft size={28} className="text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="px-8 flex-1 flex flex-col">
        <div className="mt-8 mb-12">
          <h1 className="text-4xl font-bold mb-3 tracking-tight">Welcome <br/>back.</h1>
          <p className="text-textGray text-lg">Enter your phone number to continue.</p>
        </div>

        {/* Custom Phone Display */}
        <div className="flex items-center gap-4 mb-auto">
          <div className="bg-surfaceDarker px-5 py-4 rounded-2xl border border-white/5 font-bold text-xl text-textGray">
            +91
          </div>
          <div className={`flex-1 bg-surfaceDarker px-5 py-4 rounded-2xl border ${phone.length === 10 ? 'border-movyraMint shadow-mintGlow' : 'border-white/5'} flex items-center transition-all duration-300`}>
            <span className={`text-2xl font-bold tracking-widest ${phone.length > 0 ? 'text-white' : 'text-white/20'}`}>
              {phone || '0000000000'}
            </span>
          </div>
        </div>
      </div>

      {/* Custom Bottom Sheet Keypad */}
      <div className="bg-surfaceDark rounded-t-[40px] px-6 pt-8 pb-12 border-t border-white/5 shadow-[0_-20px_40px_rgba(0,0,0,0.5)]">
        <div className="grid grid-cols-3 gap-y-6 gap-x-4 mb-10">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button 
              key={num} 
              onClick={() => handleKeyPress(num.toString())}
              className="text-3xl font-medium py-2 active:scale-90 active:text-movyraMint transition-all"
            >
              {num}
            </button>
          ))}
          <div className="col-start-2">
            <button 
              onClick={() => handleKeyPress('0')}
              className="w-full text-3xl font-medium py-2 active:scale-90 active:text-movyraMint transition-all"
            >
              0
            </button>
          </div>
          <div className="col-start-3 flex justify-center items-center">
            <button 
              onClick={() => handleKeyPress('backspace')}
              className="py-2 active:scale-90 active:text-movyraMint transition-all text-textGray"
            >
              <Delete size={32} />
            </button>
          </div>
        </div>

        <button 
          onClick={handleSendOTP}
          disabled={phone.length !== 10 || isSubmitting}
          className={`w-full py-4 rounded-pill font-bold text-lg transition-all duration-300 ${
            phone.length === 10 
              ? 'bg-movyraMint text-surfaceBlack shadow-mintGlow active:scale-[0.98]' 
              : 'bg-surfaceDarker text-textGray cursor-not-allowed'
          }`}
        >
          {isSubmitting ? 'Sending...' : 'Send Code'}
        </button>
      </div>
    </div>
  );
}