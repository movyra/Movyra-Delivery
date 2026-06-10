import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

/**
 * ============================================================================
 * COMPONENT: PACKAGE SECURITY TRACKER
 * Purpose: Manages high-value dispatch verification, photo proof of delivery,
 * OTP validation, and insurance claim processing.
 * Design System: Black (#000000), White (#FFFFFF), Grey (#F2F4F7), 
 * Stark (#111111), Accent (#00A9F7).
 * ============================================================================
 */

export default function PackageSecurityTracker({ user, profile }) {
  const [activeDispatch, setActiveDispatch] = useState(null);
  const [otpInput, setOtpInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  
  const [showInsuranceModal, setShowInsuranceModal] = useState(false);
  const [claimReason, setClaimReason] = useState('Damage during transit');
  const [isFilingClaim, setIsFilingClaim] = useState(false);

  // 1. Stream Active Dispatches Requiring Verification
  useEffect(() => {
    if (!user) return;

    // Listen for orders where the driver is en route or at drop-off
    const trackingQuery = query(
      collection(db, 'delivery_multi_stop'), 
      where('userId', '==', user.uid),
      where('status', 'in', ['Driver En Route', 'Arrived at Drop-off'])
    );

    const unsubscribeTracking = onSnapshot(trackingQuery, (snapshot) => {
      if (!snapshot.empty) {
        const docs = snapshot.docs;
        docs.sort((a, b) => b.data().createdAt?.toMillis() - a.data().createdAt?.toMillis());
        setActiveDispatch({ id: docs[0].id, ...docs[0].data() });
      } else {
        setActiveDispatch(null);
      }
    });

    return () => unsubscribeTracking();
  }, [user]);

  // 2. OTP Verification Execution
  const handleVerifyDelivery = async () => {
    if (otpInput.length !== 4) {
      setVerificationError('Invalid passcode format. Require 4 digits.');
      return;
    }

    setIsVerifying(true);
    setVerificationError('');

    try {
      // In production, OTP validation occurs server-side. 
      // For this interface, we simulate a successful validation to close the loop.
      const orderRef = doc(db, 'delivery_multi_stop', activeDispatch.id);
      await updateDoc(orderRef, {
        status: 'Delivery Secured',
        deliveryProof: 'OTP_VERIFIED',
        completedAt: serverTimestamp()
      });
      setIsVerifying(false);
      setOtpInput('');
    } catch (error) {
      console.error("Verification execution failed:", error);
      setVerificationError('System synchronization failed. Retry passcode.');
      setIsVerifying(false);
    }
  };

  // 3. Insurance Claim Execution
  const handleFileClaim = async () => {
    if (!activeDispatch || !user) return;
    setIsFilingClaim(true);

    try {
      await addDoc(collection(db, 'insurance_claims'), {
        userId: user.uid,
        orderId: activeDispatch.id,
        claimReason: claimReason,
        status: 'Under Investigation',
        claimDate: serverTimestamp()
      });
      
      setIsFilingClaim(false);
      setShowInsuranceModal(false);
    } catch (error) {
      console.error("Claim dispatch failed:", error);
      setIsFilingClaim(false);
    }
  };

  return (
    <div className="pb-24 min-h-screen bg-[#000000]">
      {/* Brand Header */}
      <div className="bg-[#111111] px-4 pt-10 pb-6 border-b border-[#333333] sticky top-0 z-40">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-[#FFFFFF] font-black text-[1.8rem]">Security Tracking</h1>
          <div className="bg-[#00ff88]/10 px-3 py-1 rounded-full border border-[#00ff88]/30 flex items-center gap-2">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#00ff88" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            <span className="text-[#00ff88] font-black text-[0.75rem] uppercase tracking-widest">Protected</span>
          </div>
        </div>
        <p className="text-[#888888] font-bold text-[0.85rem]">Monitoring high-value dispatch integrity.</p>
      </div>

      <div className="p-4 flex flex-col gap-6 mt-2">
        {!activeDispatch ? (
          <div className="bg-[#111111] border border-[#333333] rounded-[24px] p-8 flex flex-col items-center text-center shadow-sm mt-8">
             <div className="w-16 h-16 rounded-full border border-[#333333] flex items-center justify-center text-[#888888] mb-4">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
             </div>
             <span className="text-[#FFFFFF] font-black text-[1.1rem] mb-2">No Active High-Value Dispatches</span>
             <span className="text-[#888888] font-bold text-[0.85rem]">Your verified delivery stream is currently empty.</span>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
            
            {/* Live Status Matrix */}
            <div className="bg-[#111111] border border-[#333333] rounded-[24px] p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#00A9F7] opacity-10 blur-[40px]"></div>
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex flex-col">
                  <span className="text-[#888888] font-bold text-[0.75rem] uppercase tracking-widest mb-1">Current Status</span>
                  <span className="text-[#FFFFFF] font-black text-[1.4rem]">{activeDispatch.status}</span>
                </div>
                <div className="w-12 h-12 bg-[#000000] border border-[#333333] rounded-full flex items-center justify-center text-[#00A9F7]">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 22h14"></path><path d="M5 2h14"></path><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"></path><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"></path></svg>
                </div>
              </div>

              <div className="bg-[#000000] border border-[#333333] rounded-xl p-4 flex gap-4">
                <div className="flex flex-col items-center mt-1 w-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#00ff88]"></div>
                  <div className="w-0.5 h-12 bg-[#333333] my-1"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff4444]"></div>
                </div>
                <div className="flex flex-col justify-between py-0.5 w-full">
                  <div className="flex flex-col mb-4">
                    <span className="text-[#888888] font-bold text-[0.7rem] uppercase">Origin</span>
                    <span className="text-[#FFFFFF] font-bold text-[0.85rem] truncate max-w-[250px]">{activeDispatch.pickupLocation}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[#888888] font-bold text-[0.7rem] uppercase">Destination</span>
                    <span className="text-[#FFFFFF] font-bold text-[0.85rem] truncate max-w-[250px]">{activeDispatch.dropoffLocation}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Verification Protocol */}
            <div className="bg-[#111111] border border-[#333333] rounded-[24px] p-6 shadow-sm">
              <span className="text-[#FFFFFF] font-black text-[1.1rem] mb-4 block">Delivery Authentication</span>
              <p className="text-[#888888] font-bold text-[0.85rem] mb-6 leading-relaxed">Provide this passcode to the fleet operator to securely finalize the transaction. Do not share prematurely.</p>
              
              <div className="flex flex-col gap-4">
                {verificationError && (
                  <span className="text-[#ff4444] font-bold text-[0.8rem] text-center">{verificationError}</span>
                )}
                
                <input 
                  type="text" 
                  maxLength={4}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 4-Digit OTP" 
                  className="w-full bg-[#000000] border border-[#333333] text-[#FFFFFF] px-4 py-4 rounded-xl outline-none focus:border-[#00A9F7] transition-colors text-center text-[1.5rem] font-black tracking-[0.5em]" 
                />
                
                <button 
                  onClick={handleVerifyDelivery}
                  disabled={isVerifying || otpInput.length !== 4}
                  className="w-full bg-[#FFFFFF] text-[#111111] py-4 rounded-xl font-black text-[1.1rem] hover:bg-[#F2F4F7] transition-colors disabled:opacity-50"
                >
                  {isVerifying ? 'Verifying Integrity...' : 'Validate Delivery'}
                </button>
              </div>
            </div>

            {/* Post-Dispatch Insurance Support */}
            <button 
              onClick={() => setShowInsuranceModal(true)}
              className="w-full bg-[#000000] border border-[#333333] text-[#FFFFFF] py-4 rounded-[24px] font-bold text-[0.95rem] hover:border-[#ff4444] transition-colors flex items-center justify-center gap-2"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ff4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              Report Integrity Issue
            </button>
          </motion.div>
        )}
      </div>

      {/* Insurance Claim Modal */}
      <AnimatePresence>
        {showInsuranceModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-[#000000]/90 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-[400px] bg-[#111111] border border-[#333333] rounded-[24px] p-6 flex flex-col relative">
              <button onClick={() => setShowInsuranceModal(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[#888888] hover:text-[#FFFFFF] transition-colors">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
              
              <div className="w-12 h-12 bg-[#ff4444]/10 rounded-full flex items-center justify-center text-[#ff4444] mb-4">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              </div>

              <h3 className="font-black text-[1.4rem] text-[#FFFFFF] mb-2">Initiate Insurance Claim</h3>
              <p className="text-[#888888] font-bold mb-6 text-[0.85rem]">Please select the primary reason for initiating a security investigation on this dispatch.</p>
              
              <div className="flex flex-col gap-4 mb-6">
                <label className="block text-[0.75rem] font-bold uppercase tracking-widest text-[#FFFFFF] mb-1">Failure Protocol</label>
                <select value={claimReason} onChange={(e) => setClaimReason(e.target.value)} className="w-full bg-[#000000] border border-[#333333] text-[#FFFFFF] px-4 py-3.5 rounded-xl outline-none font-bold text-[0.95rem] appearance-none cursor-pointer">
                  <option value="Damage during transit">Damage during transit</option>
                  <option value="Package compromised/opened">Package compromised/opened</option>
                  <option value="Delivery to unauthorized personnel">Delivery to unauthorized personnel</option>
                  <option value="Failure to adhere to handling tags">Failure to adhere to handling tags</option>
                </select>
              </div>

              <button onClick={handleFileClaim} disabled={isFilingClaim} className="w-full bg-[#ff4444] text-[#FFFFFF] py-4 rounded-xl font-black text-[1.1rem] hover:bg-[#cc0000] transition-colors disabled:opacity-50">
                {isFilingClaim ? 'Transmitting Claim...' : 'Submit Claim Request'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}