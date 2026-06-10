import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, doc, setDoc, getDoc, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

/**
 * ============================================================================
 * COMPONENT: VEGGIES & FRUITS STOREFRONT GATEWAY (mv-main)
 * Purpose: Dedicated consumer application for fresh produce.
 * Behavior: Manages secure shopper authentication, visual account onboarding,
 * and real-time inventory synchronization filtered specifically for the
 * 'Veggies & Fruits' routing parameter.
 * Structural Constraint: Strict zero emoji vector configuration.
 * Uses clear business language. Designed for mobile-first user experience.
 * ============================================================================
 */

// Visual Assets for Onboarding (SVG format to ensure zero external dependencies)
const ONBOARDING_STEPS = [
  {
    title: "Welcome to Movyra Fresh",
    description: "Get your fresh produce delivered efficiently and conveniently.",
    icon: <svg viewBox="0 0 24 24" width="120" height="120" fill="none" stroke="#000000" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
  },
  {
    title: "Rapid Dispatch",
    description: "Ensuring all your items arrive in perfect condition without any hassle.",
    icon: <svg viewBox="0 0 24 24" width="120" height="120" fill="none" stroke="#000000" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
  },
  {
    title: "Protected Packaging",
    description: "Your groceries are carefully packaged to maintain premium freshness.",
    icon: <svg viewBox="0 0 24 24" width="120" height="120" fill="none" stroke="#000000" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
  }
];

const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
};

export default function VeggiesStorefront() {
  // Application State
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [appState, setAppState] = useState('auth'); // auth, onboarding, store
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Auth Form State
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Onboarding State
  const [currentStep, setCurrentStep] = useState(0);

  const auth = getAuth();
  const googleProvider = new GoogleAuthProvider();

  // Initialization & Authentication Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await verifyShopperProfile(currentUser);
      } else {
        setUser(null);
        setAppState('auth');
        setAuthLoading(false);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  // Inventory Synchronization Listener
  useEffect(() => {
    if (appState !== 'store') return;

    const q = query(
      collection(db, 'products'),
      where('storefrontDestination', '==', 'Veggies & Fruits'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveInventory = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(liveInventory);
    }, (error) => {
      console.error("Inventory synchronization failed:", error);
    });

    return () => unsubscribe();
  }, [appState]);

  // Account Management Functions
  const verifyShopperProfile = async (currentUser) => {
    try {
      const profileRef = doc(db, 'shopper_accounts', currentUser.uid);
      const profileSnap = await getDoc(profileRef);
      
      if (profileSnap.exists() && profileSnap.data().onboardingComplete) {
        setAppState('store');
      } else {
        setAppState('onboarding');
      }
    } catch (error) {
      console.error("Profile verification failed:", error);
    } finally {
      setAuthLoading(false);
    }
  };

  const completeOnboardingSequence = async () => {
    try {
      await setDoc(doc(db, 'shopper_accounts', user.uid), {
        email: user.email,
        createdAt: serverTimestamp(),
        onboardingComplete: true
      }, { merge: true });
      setAppState('store');
    } catch (error) {
      console.error("Failed to finalize account configuration:", error);
    }
  };

  const handleStandardAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      setAuthError('Authentication failed. Please verify your credentials.');
    }
  };

  const handleGoogleAuth = async () => {
    setAuthError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      setAuthError('Google sign-in request was rejected or cancelled.');
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  // Render Authentication Gateway
  if (authLoading) {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center font-sans">
        <div className="w-8 h-8 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin"></div>
        <span className="text-[#666666] text-[0.8rem] font-bold uppercase tracking-widest mt-4">Establishing Secure Connection</span>
      </div>
    );
  }

  if (appState === 'auth') {
    return (
      <div className="w-full min-h-screen bg-white flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-full max-w-[400px]">
          <img src="/logo.png" alt="Movyra" className="h-8 w-auto" onError={(e) => e.target.style.display = 'none'} />
          <h1 className="text-[2.5rem] font-black tracking-tight mb-2 text-black">ovyra Fresh</h1>
          <p className="text-[#666666] text-[0.95rem] mb-8">Access the premium produce marketplace.</p>

          {authError && (
            <div className="bg-[#ff4444]/10 text-[#ff4444] border border-[#ff4444]/20 p-4 rounded-xl text-[0.85rem] font-bold mb-6">
              {authError}
            </div>
          )}

          <form onSubmit={handleStandardAuth} className="flex flex-col gap-4 mb-6">
            <input 
              type="email" 
              required 
              placeholder="Email Address" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full bg-[#f5f5f5] border border-[#e0e0e0] text-black px-4 py-4 rounded-xl outline-none focus:border-[#00ff88] transition-colors"
            />
            <input 
              type="password" 
              required 
              placeholder="Password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full bg-[#f5f5f5] border border-[#e0e0e0] text-black px-4 py-4 rounded-xl outline-none focus:border-[#00ff88] transition-colors"
            />
            <button type="submit" className="w-full bg-black text-white py-4 rounded-xl font-black tracking-tight mt-2 hover:bg-[#222222] transition-colors">
              {isLogin ? 'Sign In Securely' : 'Create Account'}
            </button>
          </form>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-[#e0e0e0]"></div>
            <span className="text-[#888888] text-[0.8rem] font-bold">OR</span>
            <div className="flex-1 h-px bg-[#e0e0e0]"></div>
          </div>

          <button onClick={handleGoogleAuth} className="w-full bg-white border border-[#e0e0e0] text-black py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-[#f5f5f5] transition-colors mb-8">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>

          <p className="text-center text-[#666666] text-[0.85rem]">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-black font-bold hover:underline">
              {isLogin ? 'Register Here' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Render Visual Onboarding Sequence
  if (appState === 'onboarding') {
    const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;
    return (
      <div className="w-full min-h-screen bg-white flex flex-col font-sans relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-[40vh] bg-[#00ff88]/10 rounded-b-[50%] -translate-y-[10%]"></div>

        <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-12 text-[#000000]">
                {ONBOARDING_STEPS[currentStep].icon}
              </div>
              <h2 className="text-[1.8rem] font-black tracking-tight mb-4 text-black">
                {ONBOARDING_STEPS[currentStep].title}
              </h2>
              <p className="text-[#666666] text-[1rem] leading-relaxed max-w-[300px]">
                {ONBOARDING_STEPS[currentStep].description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="p-8 pb-12 flex flex-col items-center">
          <div className="flex gap-2 mb-8">
            {ONBOARDING_STEPS.map((_, idx) => (
              <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${currentStep === idx ? 'w-8 bg-[#00ff88]' : 'w-2 bg-[#e0e0e0]'}`} />
            ))}
          </div>
          
          <div className="w-full flex gap-4">
            {!isLastStep && (
              <button onClick={() => completeOnboardingSequence()} className="flex-1 py-4 text-[#888888] font-bold text-[0.95rem]">
                Skip
              </button>
            )}
            <button 
              onClick={() => isLastStep ? completeOnboardingSequence() : setCurrentStep(s => s + 1)}
              className="flex-[2] bg-black text-white py-4 rounded-xl font-black text-[1rem] hover:bg-[#222222] transition-colors"
            >
              {isLastStep ? 'Start Shopping' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render Primary Consumer Storefront
  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const categories = ['All', 'Produce', 'Organic', 'Seasonal'];

  return (
    <div className="w-full min-h-screen bg-[#f8f9fa] font-sans pb-24">
      
      {/* Header Section */}
      <div className="bg-white px-6 pt-10 pb-6 rounded-b-3xl shadow-sm sticky top-0 z-40">
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="text-[#888888] text-[0.75rem] font-bold uppercase tracking-widest block mb-1">Deliver to</span>
            <div className="flex items-center gap-2">
              <span className="font-black text-[1.1rem] text-black">Current Location</span>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
          </div>
          <button onClick={handleSignOut} className="w-10 h-10 rounded-full bg-[#f5f5f5] flex items-center justify-center text-black">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </button>
        </div>

        <div className="w-full bg-[#f5f5f5] rounded-xl flex items-center px-4 py-3 border border-transparent focus-within:border-[#00ff88] transition-colors">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#888888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" placeholder="Search fresh produce..." className="bg-transparent w-full outline-none text-[0.95rem] text-black placeholder:text-[#888888]" />
        </div>
      </div>

      <div className="p-6">
        
        {/* Promotional Banner */}
        <div className="w-full bg-gradient-to-r from-[#000000] to-[#222222] rounded-2xl p-6 text-white mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ff88] rounded-full blur-[50px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>
          <span className="text-[#00ff88] text-[0.7rem] font-bold uppercase tracking-widest block mb-2">Fresh Arrivals</span>
          <h2 className="text-[1.5rem] font-black leading-tight mb-4 max-w-[200px]">Farm to Table Guarantee</h2>
          <button className="bg-white text-black px-5 py-2.5 rounded-lg text-[0.85rem] font-black tracking-tight">Explore Harvest</button>
        </div>

        {/* Category Navigation */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-[1.2rem] text-black">Categories</h3>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-xl text-[0.9rem] font-bold whitespace-nowrap transition-colors ${
                activeCategory === cat ? 'bg-black text-white' : 'bg-white text-[#666666] border border-[#e0e0e0]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Inventory Grid */}
        <div className="mt-6">
          <h3 className="font-black text-[1.2rem] text-black mb-4">Available Produce</h3>
          
          {products.length === 0 ? (
            <div className="w-full bg-white rounded-2xl p-8 flex flex-col items-center justify-center text-center border border-[#e0e0e0]">
              <span className="text-[#888888] font-bold text-[0.95rem]">Awaiting Fresh Deliveries</span>
              <span className="text-[#aaaaaa] text-[0.8rem] mt-1">Vendors are currently updating this catalog.</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl p-3 border border-[#e0e0e0] flex flex-col relative">
                  
                  <div className="w-full aspect-square bg-[#f5f5f5] rounded-xl mb-3 overflow-hidden flex items-center justify-center relative">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#cccccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    )}
                    <button className="absolute bottom-2 right-2 w-8 h-8 bg-black rounded-full flex items-center justify-center text-white shadow-lg hover:scale-105 transition-transform">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                  </div>
                  
                  <span className="text-[0.95rem] font-black text-black leading-tight mb-1 truncate">{product.name}</span>
                  <span className="text-[#888888] text-[0.75rem] font-medium mb-2">{product.weight}</span>
                  <span className="text-[1.1rem] font-black text-[#00ff88] mt-auto">{formatINR(product.price)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-[#e0e0e0] px-6 py-4 flex justify-between items-center z-50">
        <button className="flex flex-col items-center gap-1 text-black">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          <span className="text-[0.65rem] font-bold">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#aaaaaa] hover:text-black transition-colors">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
          <span className="text-[0.65rem] font-bold">Cart</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#aaaaaa] hover:text-black transition-colors">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <span className="text-[0.65rem] font-bold">Orders</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#aaaaaa] hover:text-black transition-colors">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <span className="text-[0.65rem] font-bold">Profile</span>
        </button>
      </div>

    </div>
  );
}