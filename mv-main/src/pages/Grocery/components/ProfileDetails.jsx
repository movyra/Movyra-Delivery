import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAuth, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

/**
 * ============================================================================
 * COMPONENT: GROCERY PROFILE DETAILS (mv-main)
 * Purpose: Authenticated user account management and settings gateway.
 * Behavior: Reads active session data and executes secure session termination.
 * Structural Constraint: Strict zero emoji vector configuration.
 * ============================================================================
 */

export default function ProfileDetails({ userProfile, onSelectOrder }) {
  const [sessionUser, setSessionUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const auth = getAuth();

  useEffect(() => {
    async function hydrateProfileData() {
      try {
        setLoading(true);
        const currentUser = auth.currentUser;
        
        if (currentUser) {
          // Fetch supplementary profile data from Firestore to merge with Auth object
          const docRef = doc(db, 'grocery_profiles', currentUser.uid);
          const docSnap = await getDoc(docRef);
          
          let supplementaryData = {};
          if (docSnap.exists()) {
            supplementaryData = docSnap.data();
          }

          setSessionUser({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || supplementaryData.name || 'Valued Member',
            photoURL: currentUser.photoURL || null,
            ...supplementaryData
          });
        }
      } catch (error) {
        console.error("Profile resolution failure:", error);
      } finally {
        setLoading(false);
      }
    }

    hydrateProfileData();
  }, [auth]);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut(auth);
      // The global onAuthStateChanged listener in the Orchestrator handles routing automatically
    } catch (error) {
      console.error("Session termination failure:", error);
      setIsSigningOut(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#000000] text-white flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[#666666] text-[0.8rem] uppercase tracking-widest font-bold">Verifying Session</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#000000] text-white font-sans flex flex-col pb-32">
      
      {/* Top Navigation Header */}
      <div className="w-full bg-[#000000]/90 backdrop-blur-md border-b border-[#111111] px-6 py-4 sticky top-0 z-40">
        <span className="text-[1.2rem] font-black tracking-tight text-white">Profile Details</span>
      </div>

      <div className="w-full px-6 pt-6 flex-1">
        
        {/* User Identity Card */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full bg-[#050505] border border-[#1c1c1c] rounded-2xl p-4 flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            {/* Avatar Placeholder / Renderer */}
            <div className="w-14 h-14 bg-[#111111] border border-[#222222] rounded-full flex items-center justify-center overflow-hidden">
              {sessionUser?.photoURL ? (
                <img src={sessionUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              )}
            </div>
            
            <div className="flex flex-col">
              <h2 className="font-bold text-[1.05rem] tracking-tight">{sessionUser?.displayName}</h2>
              <span className="text-[#888888] text-[0.85rem] mt-0.5">{sessionUser?.email}</span>
            </div>
          </div>
          
          <button className="w-10 h-10 flex items-center justify-center text-[#666666] hover:text-white transition-colors">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
        </motion.div>

        {/* General Settings Section */}
        <div className="mb-8">
          <h3 className="text-[1.1rem] font-black tracking-tight mb-4">General</h3>
          <div className="w-full bg-[#050505] border border-[#1c1c1c] rounded-2xl overflow-hidden flex flex-col">
            
            <button className="w-full flex items-center justify-between p-4 border-b border-[#111111] hover:bg-[#111111] transition-colors">
              <div className="flex items-center gap-4">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#888888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <span className="font-bold text-[0.95rem]">Address Detail</span>
              </div>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>

            <button className="w-full flex items-center justify-between p-4 border-b border-[#111111] hover:bg-[#111111] transition-colors">
              <div className="flex items-center gap-4">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#888888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                <span className="font-bold text-[0.95rem]">Pickup Option</span>
              </div>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>

            <button className="w-full flex items-center justify-between p-4 border-b border-[#111111] hover:bg-[#111111] transition-colors">
              <div className="flex items-center gap-4">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#888888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                <span className="font-bold text-[0.95rem]">My Orders</span>
              </div>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>

            <button className="w-full flex items-center justify-between p-4 border-b border-[#111111] hover:bg-[#111111] transition-colors">
              <div className="flex items-center gap-4">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#888888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                <span className="font-bold text-[0.95rem]">Appearance</span>
              </div>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>

            <button className="w-full flex items-center justify-between p-4 hover:bg-[#111111] transition-colors">
              <div className="flex items-center gap-4">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#888888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <span className="font-bold text-[0.95rem]">Change Password</span>
              </div>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        </div>

        {/* Support Section */}
        <div className="mb-10">
          <h3 className="text-[1.1rem] font-black tracking-tight mb-4">Support</h3>
          <div className="w-full bg-[#050505] border border-[#1c1c1c] rounded-2xl overflow-hidden flex flex-col">
            
            <button className="w-full flex items-center justify-between p-4 border-b border-[#111111] hover:bg-[#111111] transition-colors">
              <div className="flex items-center gap-4">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#888888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                <span className="font-bold text-[0.95rem]">Need Help? Lets Chat</span>
              </div>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>

            <button className="w-full flex items-center justify-between p-4 hover:bg-[#111111] transition-colors">
              <div className="flex items-center gap-4">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#888888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                <span className="font-bold text-[0.95rem]">Privacy Policy</span>
              </div>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        </div>

        {/* Secure Session Termination */}
        <button 
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="w-full bg-[#111111] border border-[#ff4444]/30 text-[#ff4444] font-black text-[1rem] tracking-tight py-4 rounded-xl hover:bg-[#ff4444]/10 transition-colors disabled:opacity-50 flex items-center justify-center gap-3 mb-8"
        >
          {isSigningOut ? (
            <div className="w-5 h-5 border-2 border-[#ff4444] border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              Sign Out Securely
            </>
          )}
        </button>

      </div>
    </div>
  );
}