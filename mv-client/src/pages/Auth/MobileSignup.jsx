import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ArrowRight, User, Mail, Phone } from 'lucide-react';

export default function MobileSignup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

  const handleNext = () => {
    if (step === 1 && formData.name && formData.email) {
      setStep(2);
    } else if (step === 2 && formData.phone.length === 10) {
      // Real Implementation: Push to backend or Firebase
      navigate('/auth/otp', { state: { phone: `+91${formData.phone}`, isNewUser: true, ...formData } });
    }
  };

  return (
    <div className="min-h-screen bg-surfaceBlack text-white flex flex-col font-sans">
      <div className="px-6 pt-14 pb-4 flex items-center justify-between">
        <button 
          onClick={() => step === 2 ? setStep(1) : navigate(-1)} 
          className="p-2 -ml-2 hover:bg-surfaceDark rounded-full transition-colors"
        >
          <ChevronLeft size={28} className="text-white" />
        </button>
        <span className="text-sm font-bold text-textGray tracking-widest uppercase">Step {step} of 2</span>
      </div>

      <div className="px-8 mt-6 flex-1 flex flex-col">
        <h1 className="text-4xl font-bold mb-3 tracking-tight">
          {step === 1 ? "Create an\naccount." : "Add your\nnumber."}
        </h1>
        <p className="text-textGray text-lg mb-10">
          {step === 1 ? "We just need a few details." : "Required for secure deliveries."}
        </p>

        <div className="space-y-5">
          {step === 1 ? (
            <>
              <div className="relative group">
                <User size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-textGray group-focus-within:text-movyraMint transition-colors" />
                <input 
                  type="text" 
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-surfaceDarker border border-white/5 rounded-2xl py-4 pl-14 pr-5 text-white placeholder-textGray focus:border-movyraMint focus:bg-surfaceDark transition-all outline-none"
                />
              </div>
              <div className="relative group">
                <Mail size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-textGray group-focus-within:text-movyraMint transition-colors" />
                <input 
                  type="email" 
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-surfaceDarker border border-white/5 rounded-2xl py-4 pl-14 pr-5 text-white placeholder-textGray focus:border-movyraMint focus:bg-surfaceDark transition-all outline-none"
                />
              </div>
            </>
          ) : (
            <div className="relative group flex gap-3">
               <div className="bg-surfaceDarker px-5 py-4 rounded-2xl border border-white/5 font-bold text-lg text-textGray flex items-center">
                +91
              </div>
              <div className="relative flex-1">
                <Phone size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-textGray group-focus-within:text-movyraMint transition-colors" />
                <input 
                  type="tel" 
                  maxLength={10}
                  inputMode="numeric"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})}
                  className="w-full bg-surfaceDarker border border-white/5 rounded-2xl py-4 pl-14 pr-5 text-white placeholder-textGray focus:border-movyraMint focus:bg-surfaceDark transition-all outline-none font-bold tracking-wider"
                />
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={handleNext}
          disabled={(step === 1 && (!formData.name || !formData.email)) || (step === 2 && formData.phone.length !== 10)}
          className="mt-auto mb-12 w-full bg-movyraMint text-surfaceBlack py-4 rounded-pill font-bold text-lg flex items-center justify-center gap-2 hover:bg-movyraMintDark active:scale-[0.98] transition-all shadow-mintGlow disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
        >
          {step === 1 ? 'Next' : 'Send Code'}
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}