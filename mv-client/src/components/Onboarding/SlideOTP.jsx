import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, ShieldCheck, RefreshCw } from 'lucide-react';
import { sendOTP, generateOTP } from '../../services/emailService';
import { useOnboardingStore } from '../../store/useOnboardingStore';

const SlideOTP = ({ onNext }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('email'); // email, verify
  
  const setStoreEmail = useOnboardingStore(state => state.setEmail);
  const setVerificationSuccess = useOnboardingStore(state => state.setVerificationSuccess);

  const handleSendOTP = async () => {
    if (!email.includes('@')) return;
    setLoading(true);
    const newOtp = generateOTP();
    setGeneratedOtp(newOtp);
    try {
      await sendOTP(email, newOtp);
      setStoreEmail(email);
      setStep('verify');
    } catch (err) {
      alert("Failed to send OTP. Please check your EmailJS keys.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = () => {
    if (otp.join('') === generatedOtp) {
      setVerificationSuccess(true);
      onNext();
    } else {
      alert("Invalid OTP");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }} 
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col space-y-8 p-6"
    >
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-slate-900">
          {step === 'email' ? 'Secure Identity' : 'Verify Email'}
        </h2>
        <p className="text-slate-500">
          {step === 'email' ? 'Enter your official email for live verification.' : `We sent a code to ${email}`}
        </p>
      </div>

      {step === 'email' ? (
        <div className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="email"
              placeholder="name@company.com"
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button
            onClick={handleSendOTP}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-semibold flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            <span>Get Verification Code</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between gap-2">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                type="text"
                maxLength={1}
                className="w-12 h-14 text-center text-xl font-bold bg-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={digit}
                onChange={(e) => {
                  const newOtp = [...otp];
                  newOtp[idx] = e.target.value;
                  setOtp(newOtp);
                  if (e.target.value && e.target.nextSibling) e.target.nextSibling.focus();
                }}
              />
            ))}
          </div>
          <button
            onClick={handleVerify}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-semibold flex items-center justify-center space-x-2"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Verify & Secure Account</span>
          </button>
          <button onClick={() => setStep('email')} className="w-full text-slate-400 text-sm">Resend Code</button>
        </div>
      )}
    </motion.div>
  );
};

export default SlideOTP;