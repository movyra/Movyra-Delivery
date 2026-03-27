import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ShieldCheck } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

export default function OTPVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore(state => state.login);
  
  const phone = location.state?.phone || "your number";
  const [code, setCode] = useState(['', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs[0].current) {
      inputRefs[0].current.focus();
    }
  }, []);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    // Take only the last character if they pasted or typed fast
    newCode[index] = value.slice(-1); 
    setCode(newCode);

    // Auto-advance focus
    if (value && index < 3) {
      inputRefs[index + 1].current.focus();
    }

    // Auto-verify when 4 digits are entered
    if (value && index === 3 && newCode.every(digit => digit !== '')) {
      verifyOTP(newCode.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace auto-reverse
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const verifyOTP = async (fullCode) => {
    setIsVerifying(true);
    
    // Real API verification logic goes here
    // Example: const response = await apiClient.post('/auth/verify', { phone, code: fullCode });
    
    // For now, executing the Zustand store login securely
    setTimeout(() => {
      login({ id: 'USR_9012', phone: phone, name: location.state?.name || 'Movyra User' }, 'MOCK_JWT_TOKEN');
      // Force navigation directly to the authenticated mobile home dashboard
      navigate('/dashboard-home', { replace: true });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-surfaceBlack text-white flex flex-col font-sans relative overflow-hidden">
      {/* Background Ambient Security Glow */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-movyraMint/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      <div className="px-6 pt-14 pb-4 flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-surfaceDark rounded-full transition-colors">
          <ChevronLeft size={28} className="text-white" />
        </button>
      </div>

      <div className="px-8 mt-4 flex-1 flex flex-col">
        <div className="w-16 h-16 bg-surfaceDark border border-white/5 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(0,240,181,0.1)]">
          <ShieldCheck size={32} className="text-movyraMint drop-shadow-[0_0_10px_rgba(0,240,181,0.6)]" />
        </div>
        
        <h1 className="text-4xl font-bold mb-3 tracking-tight">Enter code.</h1>
        <p className="text-textGray text-lg mb-10 leading-relaxed">
          We sent a 4-digit secure code to <br/><span className="text-white font-bold">{phone}</span>
        </p>

        {/* 4-Digit Inputs */}
        <div className="flex gap-4 mb-10">
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
              className={`w-16 h-20 text-center text-3xl font-bold rounded-2xl bg-surfaceDarker outline-none transition-all duration-300 ${
                digit 
                  ? 'border-2 border-movyraMint text-white shadow-mintGlow' 
                  : 'border border-white/10 text-white/50 focus:border-movyraMint/50'
              }`}
            />
          ))}
        </div>

        <div className="mt-auto mb-12 flex flex-col items-center gap-6">
          <p className="text-textGray font-medium text-sm">
            Didn't receive it? <button className="text-movyraMint font-bold ml-1 active:opacity-70">Resend</button>
          </p>
          <button 
            disabled={isVerifying || code.join('').length !== 4}
            className="w-full bg-movyraMint text-surfaceBlack py-4 rounded-pill font-bold text-lg flex items-center justify-center gap-2 hover:bg-movyraMintDark active:scale-[0.98] transition-all shadow-mintGlow disabled:opacity-50 disabled:shadow-none"
          >
            {isVerifying ? 'Verifying Identity...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}