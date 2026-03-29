import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Eye, EyeOff, AlertCircle, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Real Firebase Imports for Authentication and Database
import { createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Centralized Firebase Auth Instance
import { auth } from '../../services/firebaseAuth';

// ============================================================================
// PAGE: SET PASSWORD (STARK MINIMALIST UI)
// Strictly handles password creation and Firebase Auth provisioning.
// Matches the high-contrast Uber-inspired aesthetic (pure white, massive text).
// ============================================================================

export default function SetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  // Securely retrieve the verified email and name from the OTP screen
  const email = location.state?.email || "";
  const name = location.state?.name || "";

  // Kick out users who try to bypass the OTP flow directly to this URL
  useEffect(() => {
    if (!email) navigate('/auth-signup', { replace: true });
  }, [email, navigate]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // SECTION 1: Master Registration Logic
  const handleCreateAccount = async () => {
    setError('');
    
    // Strict Validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      // Initialize Firestore cleanly using the default app initialized in firebaseAuth.js
      const db = getFirestore();

      // 1. Create the user in Firebase Authentication using centralized auth instance
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Attach the user's Full Name to their Auth Profile
      await updateProfile(user, { displayName: name });

      // 3. Create their secure profile document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: email,
        fullName: name,
        accountStatus: 'active',
        role: 'customer',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        settings: {
          notificationsEnabled: true,
          currency: 'USD'
        }
      });

      // 4. Force sign out so they must log in manually (per strict requirements)
      await signOut(auth);

      // 5. Show success state momentarily before strict redirect
      setSuccess(true);
      setTimeout(() => {
        navigate('/auth-login', { replace: true, state: { email } });
      }, 2000);

    } catch (err) {
      console.error("Firebase Provisioning Error:", err);
      // Format Firebase error codes to be user-friendly
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error. Please check your connection.');
      } else {
        setError(err.message || 'Failed to create account. Please try again.');
      }
    } finally {
      if (!success) setIsLoading(false);
    }
  };

  return (
    // Root: Pure White Background
    <div className="min-h-screen bg-white text-black flex flex-col font-sans relative overflow-hidden transition-colors duration-500">
      
      {/* SECTION 2: Top Navigation & Logo */}
      <div className="pt-12 px-6 pb-2 flex items-center justify-between z-50">
        <button 
          onClick={() => navigate(-1)} 
          disabled={isLoading || success}
          className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-black hover:bg-gray-100 transition-colors active:scale-95 disabled:opacity-50"
        >
          <ChevronLeft size={28} strokeWidth={2.5} />
        </button>
        
        {/* Real Brand Logo */}
        <div className="w-8 h-8 rounded-md overflow-hidden bg-black flex items-center justify-center">
          <img src="/logo.png" alt="Movyra" className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col px-8 pt-8 pb-8">
        
        {success ? (
          // STARK SUCCESS STATE
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center mt-4"
          >
            <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center mb-8 shadow-[0_10px_40px_rgba(0,0,0,0.15)]">
              <CheckCircle2 size={48} className="text-white" strokeWidth={2} />
            </div>
            <h2 className="text-[32px] font-black text-black leading-tight mb-3 tracking-tighter">Account <br/>Created</h2>
            <p className="text-gray-500 font-medium">Redirecting you to login...</p>
          </motion.div>
        ) : (
          <>
            {/* SECTION 3: Massive Display Typography */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="mb-10"
            >
              <h1 className="text-[44px] font-black text-black leading-[1.05] tracking-tighter mb-4">
                Secure <br/>account.
              </h1>
              <p className="text-[16px] text-gray-500 font-medium leading-relaxed">
                Create a strong password for <br/><span className="text-black font-bold">{email}</span>
              </p>
            </motion.div>

            {/* SECTION 4: Flat Minimalist Inputs */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
              className="flex flex-col gap-4 mb-6"
            >
              {/* Password Input */}
              <div className={`flex items-center px-5 py-4.5 rounded-2xl border-2 transition-all duration-200 bg-[#F6F6F6] ${password.length >= 6 ? 'border-black bg-white' : 'border-transparent focus-within:border-black focus-within:bg-white'}`}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Create Password"
                  className="w-full text-[17px] font-bold text-black placeholder:text-gray-400 placeholder:font-medium focus:outline-none bg-transparent"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-black transition-colors ml-2"
                >
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>

              {/* Confirm Password Input */}
              <div className={`flex items-center px-5 py-4.5 rounded-2xl border-2 transition-all duration-200 bg-[#F6F6F6] ${(confirmPassword && password === confirmPassword) ? 'border-black bg-white' : 'border-transparent focus-within:border-black focus-within:bg-white'}`}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                  placeholder="Confirm Password"
                  className="w-full text-[17px] font-bold text-black placeholder:text-gray-400 placeholder:font-medium focus:outline-none bg-transparent"
                />
                {confirmPassword && password === confirmPassword && (
                  <CheckCircle2 size={22} className="text-black ml-2" />
                )}
              </div>
            </motion.div>

            {/* Password Requirements Guide */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mb-8 px-2"
            >
              <p className={`text-[15px] font-bold flex items-center gap-2 ${password.length >= 6 ? 'text-black' : 'text-gray-400'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${password.length >= 6 ? 'bg-black' : 'bg-gray-400'}`} />
                At least 6 characters long
              </p>
            </motion.div>

            {/* Real-time Error Engine */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-gray-100 border-l-4 border-black rounded-r-xl p-4 flex items-start gap-3 mb-8 overflow-hidden"
                >
                  <AlertCircle size={20} className="text-black flex-shrink-0 mt-0.5" />
                  <p className="text-[14px] text-black font-bold leading-snug">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* SECTION 5: Stark Action Area */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
              className="mt-auto pb-4"
            >
              {/* Stark Black Primary Pill Button */}
              <button 
                onClick={handleCreateAccount}
                disabled={!password || !confirmPassword || isLoading}
                className="w-full flex items-center justify-between px-6 bg-black text-white py-4 rounded-full font-bold text-[17px] hover:bg-gray-900 active:scale-[0.98] transition-all h-[60px] disabled:opacity-50"
              >
                <span className="flex-1 text-center pl-6">
                  {isLoading ? 'Creating...' : 'Create Account'}
                </span>
                {isLoading ? (
                  <Loader2 size={24} className="animate-spin text-white" />
                ) : (
                  <ArrowRight size={24} className="text-white" />
                )}
              </button>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}