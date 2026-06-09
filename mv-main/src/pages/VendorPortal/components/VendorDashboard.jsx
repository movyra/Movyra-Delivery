import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

import ProductCatalogManager from './ProductCatalogManager';
import ProductEntryForm from './ProductEntryForm';
import GradioImageIntegration from './GradioImageIntegration';

/**
 * ============================================================================
 * COMPONENT: VENDOR DASHBOARD MASTER CONTROLLER (mv-main)
 * Purpose: Secure RBAC routing for Admins and Vendors.
 * Behavior: Authenticates session, validates against Admin UIDs or Store registry,
 * and mounts requested management sub-views.
 * Structural Constraint: Strict zero emoji vector configuration. Uses clear
 * business language without technical jargon.
 * ============================================================================
 */

const ADMIN_UIDS = [
  'oGZkaJTtkISgYS3UyQKhhxANWFa2',
  '8zAyPwFZZBfU7MD1NkBDDWbIzXt1',
  'REr2KNUjOmWOsUxuvq3YtmlkJsB3'
];

export default function VendorDashboard() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('loading'); // 'loading', 'admin', 'vendor', 'unauthorized'
  const [storeData, setStoreData] = useState(null);
  const [activeView, setActiveView] = useState('catalog'); // 'catalog', 'entry', 'ai_image'

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // 1. Check Global Admin Access
        if (ADMIN_UIDS.includes(currentUser.uid)) {
          setRole('admin');
        } else {
          // 2. Check Standard Vendor Access
          try {
            const storeRef = doc(db, 'stores', currentUser.uid);
            const storeSnap = await getDoc(storeRef);
            
            if (storeSnap.exists()) {
              setStoreData(storeSnap.data());
              setRole('vendor');
            } else {
              setRole('unauthorized');
            }
          } catch (error) {
            console.error("Account Verification Error:", error);
            setRole('unauthorized');
          }
        }
      } else {
        setUser(null);
        setRole('unauthorized');
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'catalog':
        return <ProductCatalogManager role={role} storeId={user?.uid} />;
      case 'entry':
        return <ProductEntryForm role={role} storeId={user?.uid} />;
      case 'ai_image':
        return <GradioImageIntegration />;
      default:
        return <ProductCatalogManager role={role} storeId={user?.uid} />;
    }
  };

  if (role === 'loading') {
    return (
      <div className="w-full min-h-screen bg-[#000000] text-white flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[#666666] text-[0.8rem] uppercase tracking-widest font-bold">Verifying your account</span>
        </div>
      </div>
    );
  }

  if (role === 'unauthorized') {
    return (
      <div className="w-full min-h-screen bg-[#000000] text-white flex items-center justify-center font-sans p-6 text-center">
        <div className="max-w-[400px] flex flex-col items-center">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#ff4444" strokeWidth="1.5" className="mb-6">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <line x1="9" y1="12" x2="15" y2="12"></line>
          </svg>
          <h1 className="text-[1.5rem] font-black tracking-tight mb-2">Access Denied</h1>
          <p className="text-[#888888] text-[0.9rem] leading-relaxed mb-8">
            Your account does not have permission to view the vendor dashboard. Please contact support if you believe this is an error.
          </p>
          <button 
            onClick={handleSignOut}
            className="w-full bg-[#111111] border border-[#222222] text-white py-3 rounded-xl font-bold hover:bg-[#222222] transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#000000] text-white font-sans flex flex-col md:flex-row overflow-hidden">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-[280px] bg-[#050505] border-b md:border-b-0 md:border-r border-[#111111] flex flex-col flex-shrink-0 relative z-20">
        
        {/* Header Segment */}
        <div className="p-6 border-b border-[#111111]">
          <span className="text-[#00ff88] text-[0.65rem] uppercase tracking-widest font-black inline-block mb-1 border border-[#00ff88]/20 bg-[#00ff88]/10 px-2 py-0.5 rounded-sm">
            {role === 'admin' ? 'System Administrator' : 'Vendor'}
          </span>
          <h2 className="text-[1.2rem] font-black tracking-tight leading-tight mt-2 text-white line-clamp-1">
            {role === 'admin' ? 'Main Dashboard' : storeData?.name || 'My Store'}
          </h2>
          <span className="text-[#666666] text-[0.7rem] font-mono mt-1 block truncate">
            Account ID: {user?.uid}
          </span>
        </div>

        {/* Navigation Actions */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
          
          <button 
            onClick={() => setActiveView('catalog')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[0.9rem] transition-colors ${
              activeView === 'catalog' ? 'bg-white text-black' : 'text-[#888888] hover:bg-[#111111] hover:text-white'
            }`}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
            Manage Inventory
          </button>

          <button 
            onClick={() => setActiveView('entry')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[0.9rem] transition-colors ${
              activeView === 'entry' ? 'bg-white text-black' : 'text-[#888888] hover:bg-[#111111] hover:text-white'
            }`}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            Add New Product
          </button>

          <button 
            onClick={() => setActiveView('ai_image')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[0.9rem] transition-colors ${
              activeView === 'ai_image' ? 'bg-white text-black' : 'text-[#888888] hover:bg-[#111111] hover:text-white'
            }`}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            Upload Product Image
          </button>

        </nav>

        {/* Footer Segment */}
        <div className="p-4 border-t border-[#111111]">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[0.85rem] font-bold text-[#ff4444] hover:bg-[#ff4444]/10 transition-colors"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Dynamic Master Viewport */}
      <main className="flex-1 relative h-screen overflow-y-auto overflow-x-hidden bg-[#000000]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full min-h-full"
          >
            {renderActiveView()}
          </motion.div>
        </AnimatePresence>
      </main>

    </div>
  );
}