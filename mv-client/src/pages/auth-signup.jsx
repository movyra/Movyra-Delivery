import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import emailjs from '@emailjs/browser';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Mail, Lock, KeyRound, Loader2 } from 'lucide-react';

export default function AuthSignup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');

  // Step 1: Send OTP via EmailJS
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    
    setError('');
    setLoading(true);
    
    // Generate a 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          to_email: email,
          otp_code: otp,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );
      setStep(2); // Move to OTP verification step
    } catch (err) {
      console.error('EmailJS Error:', err);
      setError('Failed to send OTP. Please check your email configuration.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Create Firebase Account
  const handleVerifyOtpAndSignup = async (e) => {
    e.preventDefault();
    setError('');
    
    if (enteredOtp !== generatedOtp) {
      setError('Invalid OTP code. Please try again.');
      return;
    }

    setLoading(true);
    try {
      // Actually create the user in Firebase now that email is verified
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const token = await user.getIdToken();
      localStorage.setItem('movyra_jwt', token);
      localStorage.setItem('movyra_user', JSON.stringify({ uid: user.uid, email: user.email }));
      
      navigate('/dashboard-home');
    } catch (err) {
      console.error('Firebase Auth Error:', err);
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-6 font-sans text-black">
      <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto">
        <div className="mb-10">
          <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-6 shadow-lg">
            <span className="text-[#00A3FF] font-black text-2xl">M</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Create an account</h1>
          <p className="text-gray-500 font-medium">
            {step === 1 ? "Enter your email and password to get started." : "Check your email for the 6-digit verification code."}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium mb-6 border border-red-100">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                <Mail size={20} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Email address"
                className="w-full bg-[#F3F3F3] border-none rounded-xl py-4 pl-12 pr-4 text-black font-medium placeholder-gray-500 focus:ring-2 focus:ring-black focus:bg-white transition-all outline-none"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                <Lock size={20} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Create a password"
                className="w-full bg-[#F3F3F3] border-none rounded-xl py-4 pl-12 pr-4 text-black font-medium placeholder-gray-500 focus:ring-2 focus:ring-black focus:bg-white transition-all outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-zinc-800 transition-all shadow-lg flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : 'Continue'}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtpAndSignup} className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                <KeyRound size={20} />
              </div>
              <input
                type="text"
                maxLength="6"
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value)}
                required
                placeholder="Enter 6-digit OTP"
                className="w-full bg-[#F3F3F3] border-none rounded-xl py-4 pl-12 pr-4 text-black font-medium placeholder-gray-500 focus:ring-2 focus:ring-black focus:bg-white transition-all outline-none tracking-widest text-lg"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-zinc-800 transition-all shadow-lg flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : 'Verify & Sign Up'}
              {!loading && <ArrowRight size={20} />}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full bg-transparent text-gray-500 py-4 rounded-xl font-bold hover:text-black transition-all"
            >
              Back to email
            </button>
          </form>
        )}

        {step === 1 && (
          <div className="mt-8 text-center">
            <p className="text-gray-500 font-medium">
              Already have an account?{' '}
              <Link to="/auth-login" className="text-black font-bold hover:underline">
                Log in
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}