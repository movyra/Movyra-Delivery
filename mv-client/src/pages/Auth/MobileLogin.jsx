import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, AlertCircle, Loader2, Mail, Lock, Eye, EyeOff, Fingerprint } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Real Firebase Auth Integration
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

// ============================================================================
// PAGE: MOBILE LOGIN (FUTURISTIC GRID UI)
// Perfectly replicates the tech/biometric grid aesthetic. Incorporates 
// standard Email/Password and Google SSO with strict Firebase validation.
// ============================================================================

export default function MobileLogin() {
  const navigate = useNavigate(); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  // Strict Regex for real-time email validation
  const isValidEmail = (emailAddress) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress);
  };

  // ============================================================================
  // LOGIC: FIREBASE EMAIL & PASSWORD AUTH
  // ============================================================================
  const handleEmailLogin = async () => {
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
      // App.jsx RequireAuthGuard automatically redirects to /dashboard-home
      navigate('/dashboard-home', { replace: true });
    } catch (err) {
      console.error("Login Error:", err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password. Please try again.');
      } else {
        setError('Login failed. Please check your network and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // LOGIC: FIREBASE GOOGLE AUTHENTICATION
  // ============================================================================
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError('');
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    
    try {
      await signInWithPopup(auth, provider);
      navigate('/dashboard-home', { replace: true });
    } catch (err) {
      console.error("Google Auth Error:", err);
      setError('Google Sign-In failed or was cancelled.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    // Root: The specific Light Periwinkle/Blue background
    <div className="min-h-screen bg-[#F0F4FF] text-gray-800 flex flex-col font-sans relative overflow-hidden">

      {/* SECTION 1: Architectural Grid Background (Matching Reference Image) */}
      <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden">
        {/* Vertical Lines */}
        <div className="absolute left-[20%] top-0 bottom-0 w-px bg-[#DCE4F7]" />
        <div className="absolute right-[20%] top-0 bottom-0 w-px bg-[#DCE4F7]" />
        
        {/* Horizontal Lines */}
        <div className="absolute top-[25%] left-0 right-0 h-px bg-[#DCE4F7]" />
        <div className="absolute top-[50%] left-0 right-0 h-px bg-[#DCE4F7]" />
        
        {/* Intersection Crosshair Nodes */}
        <div className="absolute left-[20%] top-[25%] w-1.5 h-1.5 rounded-full bg-[#9AAEE0] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute right-[20%] top-[25%] w-1.5 h-1.5 rounded-full bg-[#9AAEE0] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute left-[20%] top-[50%] w-1.5 h-1.5 rounded-full bg-[#9AAEE0] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute right-[20%] top-[50%] w-1.5 h-1.5 rounded-full bg-[#9AAEE0] -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* SECTION 2: Top Navigation */}
      <div className="absolute top-12 left-6 z-50">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center text-[#121212] hover:bg-white/80 transition-all active:scale-95 shadow-sm border border-[#DCE4F7]"
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      {/* SECTION 3: Main Scrolling Viewport */}
      <div className="flex-1 overflow-y-auto no-scrollbar relative z-10 flex flex-col pt-24 px-8 pb-8">
        
        {/* Animated Central Lock & Biometric Visuals */}
        <div className="flex flex-col items-center justify-center mb-10 relative">
          
          {/* Pulsing Concentric Security Rings */}
          <div className="relative w-28 h-28 flex items-center justify-center mb-6">
            <motion.div 
              animate={{ scale: [1, 1.6], opacity: [0.5, 0] }} 
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeOut" }} 
              className="absolute inset-0 border-[2px] border-[#3B6AEC] rounded-full" 
            />
            <motion.div 
              animate={{ scale: [1, 1.3], opacity: [0.8, 0] }} 
              transition={{ repeat: Infinity, duration: 2.5, delay: 0.6, ease: "easeOut" }} 
              className="absolute inset-0 border-[2px] border-[#3B6AEC] rounded-full" 
            />
            
            {/* The Vault / Padlock Core with Movyra 'M' */}
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(59,106,236,0.2)] relative border border-[#DCE4F7] z-10">
              <div className="absolute -top-1.5 w-6 h-6 border-[3px] border-gray-300 rounded-t-full border-b-0" />
              <div className="w-10 h-10 bg-[#3B6AEC] rounded-full flex items-center justify-center z-10">
                <span className="text-white font-black text-xl tracking-tighter">M</span>
              </div>
            </div>
          </div>

          {/* Biometric Face-Scan SVG Bracket */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-[#9AAEE0]"
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 3H5a2 2 0 0 0-2 2v2M17 3h2a2 2 0 0 1 2 2v2M3 17v2a2 2 0 0 0 2 2h2M21 17v2a2 2 0 0 1-2 2h-2"/>
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 19v-2"/>
            </svg>
          </motion.div>
        </div>

        {/* SECTION 4: Typography (Strict Match to Image) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-10"
        >
          <h3 className="text-[15px] font-bold text-[#121212] mb-1">Welcome back.</h3>
          <h1 className="text-[38px] font-extrabold text-[#121212] leading-[1.1] tracking-tight mb-4">
            Unlock your<br/>account.
          </h1>
          <p className="text-[14px] text-gray-500 font-medium leading-relaxed max-w-[260px] mx-auto">
            You have a Movyra account stored. Enter your credentials to start the secure session.
          </p>
        </motion.div>
        
        {/* SECTION 5: Native Input Fields */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col gap-4 mb-6 relative z-20"
        >
          {/* Email Input */}
          <div className={`flex items-center gap-3 bg-white px-5 py-4 rounded-[20px] border-[1.5px] transition-all duration-300 shadow-sm ${isValidEmail(email) ? 'border-[#3B6AEC]' : 'border-white focus-within:border-[#DCE4F7]'}`}>
            <Mail size={22} className={isValidEmail(email) ? "text-[#3B6AEC]" : "text-gray-400"} />
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="Email Address"
              className="w-full text-[17px] font-bold text-[#121212] placeholder:text-gray-400 focus:outline-none bg-transparent"
            />
          </div>

          {/* Password Input */}
          <div className={`flex items-center gap-3 bg-white px-5 py-4 rounded-[20px] border-[1.5px] transition-all duration-300 shadow-sm ${password.length >= 6 ? 'border-[#3B6AEC]' : 'border-white focus-within:border-[#DCE4F7]'}`}>
            <Lock size={22} className={password.length >= 6 ? "text-[#3B6AEC]" : "text-gray-400"} />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="Password"
              className="w-full text-[17px] font-bold text-[#121212] placeholder:text-gray-400 focus:outline-none bg-transparent"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-[#121212] transition-colors"
            >
              {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
            </button>
          </div>
        </motion.div>

        {/* Real-time Error Engine */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-50/90 backdrop-blur-sm border border-red-100 rounded-[16px] p-4 flex items-start gap-3 mb-6 relative z-20"
            >
              <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-[14px] text-red-600 font-bold leading-snug">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* SECTION 6: Action Buttons */}
        <div className="mt-auto space-y-4 relative z-20 pb-4">
          
          {/* Vivid Blue Primary Button */}
          <button 
            onClick={handleEmailLogin}
            disabled={!email || !password || isLoading || isGoogleLoading}
            className="w-full flex items-center justify-center gap-2 bg-[#3B6AEC] text-white py-4 rounded-[24px] font-bold text-[17px] hover:bg-blue-700 active:scale-[0.98] transition-all h-[60px] disabled:opacity-50 shadow-[0_8px_20px_rgba(59,106,236,0.25)]"
          >
            {isLoading ? <Loader2 size={24} className="animate-spin text-white" /> : (
              <>
                <span>Login with Password</span>
                <Fingerprint size={20} className="ml-1 opacity-80" />
              </>
            )}
          </button>

          {/* Clean Google SSO Button */}
          <button 
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white text-[#121212] py-4 rounded-[24px] font-bold text-[17px] hover:bg-gray-50 active:scale-[0.98] transition-all h-[60px] disabled:opacity-50 shadow-sm border border-[#DCE4F7]"
          >
            {isGoogleLoading ? <Loader2 size={24} className="animate-spin text-[#121212]" /> : (
              <>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>
          
          <p className="text-center text-[#666666] text-[15px] pt-4 font-medium">
            New to Movyra? <Link to="/auth-signup" className="text-[#3B6AEC] font-extrabold hover:underline">Create account</Link>
          </p>

        </div>
      </div>
    </div>
  );
}