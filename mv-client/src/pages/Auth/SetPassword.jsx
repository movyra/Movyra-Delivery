import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Lock, Eye, EyeOff, AlertCircle, Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Real Firebase Imports for Authentication and Database
import { getAuth, createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// ============================================================================
// PAGE: SET PASSWORD (FINAL REGISTRATION STEP)
// Strictly handles password creation, Firebase Auth user provisioning, 
// and Firestore profile document creation after EmailJS OTP validation.
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
      const auth = getAuth();
      const db = getFirestore();

      // 1. Create the user in Firebase Authentication
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
    <div className="h-screen w-full bg-[#5D9C83] flex flex-col font-sans relative overflow-hidden transition-colors duration-500">
      
      {/* SECTION 2: Top Navigation */}
      <div className="absolute top-12 left-6 z-50">
        <button 
          onClick={() => navigate(-1)} 
          disabled={isLoading || success}
          className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all active:scale-95 disabled:opacity-50"
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      {/* SECTION 3: Upper Hero Area */}
      <div className="flex-1 flex flex-col justify-center px-8 pt-10 pb-6 text-white z-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-[20px] flex items-center justify-center mb-6 shadow-sm border border-white/30">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-[38px] font-extrabold leading-[1.1] mb-3 tracking-tight">
            Secure your <br/>account
          </h1>
          <p className="text-white/90 text-[17px] font-medium leading-relaxed">
            Create a strong password for <br/><span className="font-bold">{email}</span>
          </p>
        </motion.div>
      </div>
      
      {/* SECTION 4: Massive Bottom Sheet (Matching 60/40 UI Style) */}
      <div className="bg-white rounded-t-[40px] px-8 pt-10 pb-safe flex flex-col relative z-20 min-h-[55%] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] overflow-y-auto no-scrollbar">
        
        {success ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center text-center mt-4"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 size={40} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-black text-[#121212] mb-2">Account Created!</h2>
            <p className="text-gray-500 font-medium">Redirecting you to login...</p>
          </motion.div>
        ) : (
          <>
            {/* Password Input */}
            <div className="flex flex-col gap-4 mb-6">
              <div className={`flex items-center gap-3 bg-[#F8F9FA] px-5 py-4 rounded-[20px] border-[1.5px] transition-all duration-300 ${password.length >= 6 ? 'border-gray-300 bg-white' : 'border-transparent focus-within:border-gray-300 focus-within:bg-white'}`}>
                <Lock size={22} className={password.length >= 6 ? "text-[#121212]" : "text-gray-400"} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Create Password"
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

              {/* Confirm Password Input */}
              <div className={`flex items-center gap-3 bg-[#F8F9FA] px-5 py-4 rounded-[20px] border-[1.5px] transition-all duration-300 ${(confirmPassword && password === confirmPassword) ? 'border-green-500 bg-white shadow-lg shadow-green-500/10' : 'border-transparent focus-within:border-gray-300 focus-within:bg-white'}`}>
                <Lock size={22} className={(confirmPassword && password === confirmPassword) ? "text-green-500" : "text-gray-400"} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                  placeholder="Confirm Password"
                  className="w-full text-[17px] font-bold text-[#121212] placeholder:text-gray-400 focus:outline-none bg-transparent"
                />
                {confirmPassword && password === confirmPassword && (
                  <CheckCircle2 size={22} className="text-green-500" />
                )}
              </div>
            </div>

            {/* Password Requirements Guide */}
            <div className="mb-6 px-2">
              <p className={`text-sm font-bold flex items-center gap-2 ${password.length >= 6 ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${password.length >= 6 ? 'bg-green-600' : 'bg-gray-400'}`} />
                At least 6 characters long
              </p>
            </div>

            {/* Real-time Error Engine */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 rounded-[16px] p-4 flex items-start gap-3 mb-6 overflow-hidden"
                >
                  <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[14px] text-red-600 font-bold leading-snug">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Primary Action Button */}
            <button 
              onClick={handleCreateAccount}
              disabled={!password || !confirmPassword || isLoading}
              className="w-full flex items-center justify-center gap-2 bg-[#1A1A1A] text-white py-4 rounded-[24px] font-bold text-[17px] hover:bg-black active:scale-[0.98] transition-all h-[60px] mt-auto disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={24} className="animate-spin text-white" /> : 'Create Account'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}