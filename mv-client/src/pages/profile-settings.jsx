import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  CreditCard, 
  ShieldCheck, 
  MapPin, 
  Settings, 
  Crown, 
  Sparkles,
  User as UserIcon
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { auth } from '../services/firebaseAuth';

// ============================================================================
// PAGE: PROFILE & PREMIUM SETTINGS (MOVYRA LIGHT THEME)
// Replaces the old wallet dashboard with the Premium Membership screen.
// Features 6 Functional Sections: Auth Engine, Header, Identity Render,
// Descriptive Text, Large Premium Card, Settings List, and Logout Action.
// ============================================================================

export default function ProfileSettings() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // SECTION 1: Secure Authentication Engine
  const handleLogout = async () => {
    try {
      await auth.signOut();
      logout();
      navigate('/auth-login', { replace: true });
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  // Derive display name from email if name is missing (common in basic auth)
  const displayName = user?.name || user?.email?.split('@')[0] || "Movyra Member";
  const displayEmail = user?.email || "No email linked";

  return (
    <div className="min-h-screen bg-movyra-surface text-gray-900 px-6 pt-12 pb-32 font-sans relative overflow-hidden">
      
      {/* Background Accent Glow for Premium feel */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[100px] pointer-events-none -z-10 opacity-60"></div>

      {/* SECTION 2: Header Navigation */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8 relative z-10"
      >
        <button 
          onClick={() => navigate('/dashboard-home')} 
          className="p-2 -ml-2 text-movyra-blue hover:bg-blue-50 rounded-full transition-colors active:scale-95"
        >
          <ChevronLeft size={32} />
        </button>
        <h1 className="text-xl font-black tracking-wide">Profile</h1>
        <div className="w-10"></div> {/* Spacer to center title */}
      </motion.div>

      {/* SECTION 3: Dynamic Identity Render */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-5 mb-8"
      >
        {/* Dynamic Avatar */}
        <div className="w-20 h-20 rounded-[24px] bg-white border-2 border-gray-100 shadow-sm flex items-center justify-center p-1 relative">
          <img 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${displayEmail}`} 
            alt="User Avatar" 
            className="w-full h-full rounded-[18px] bg-blue-50"
          />
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-movyra-blue rounded-full border-4 border-movyra-surface flex items-center justify-center text-white">
            <Crown size={12} strokeWidth={3} />
          </div>
        </div>
        
        <div className="flex flex-col">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight capitalize">{displayName}</h2>
          <p className="text-[13px] font-bold text-gray-400 mt-1">{displayEmail}</p>
        </div>
      </motion.div>

      {/* SECTION 4: Descriptive Text Context */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <h3 className="text-lg font-black text-gray-900 mb-2 tracking-wide">Movyra Premium</h3>
        <p className="text-[13px] text-gray-500 font-medium leading-relaxed pr-4">
          Enjoy exclusive benefits with your premium membership, including priority sorting, free extended warehouse storage, and 24/7 dedicated routing support.
        </p>
      </motion.div>

      {/* SECTION 5: The Large Premium Card Component */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
        className="w-full bg-gray-900 rounded-[32px] p-6 mb-10 shadow-[0_20px_40px_rgba(15,23,42,0.15)] relative overflow-hidden text-white"
      >
        {/* Ambient Card Decor */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-movyra-blue blur-[60px] opacity-40"></div>
        <div className="absolute bottom-0 right-0 p-4 opacity-10">
          <Crown size={100} />
        </div>

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              <Sparkles size={14} className="text-movyra-blue" />
              <span className="text-[11px] font-black uppercase tracking-widest text-blue-100">Active Plan</span>
            </div>
          </div>

          <div className="flex flex-col mb-6">
            <span className="text-4xl font-black tracking-tighter mb-1">Premium.</span>
            <span className="text-sm font-bold text-gray-400">Renews Oct 24, 2026</span>
          </div>

          <button className="w-full bg-white text-gray-900 py-3.5 rounded-2xl font-black text-sm active:scale-[0.98] transition-transform">
            Manage Subscription
          </button>
        </div>
      </motion.div>

      {/* SECTION 6: Settings Menu List */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-[32px] p-2 flex flex-col gap-1 border border-gray-100 shadow-sm mb-8"
      >
        {[ 
          { i: UserIcon, l: "Account Details" }, 
          { i: MapPin, l: "Saved Addresses" }, 
          { i: CreditCard, l: "Payment Methods" }, 
          { i: ShieldCheck, l: "Privacy & Security" }, 
          { i: Settings, l: "App Preferences" } 
        ].map((item, idx) => (
          <button 
            key={idx} 
            className="flex items-center justify-between p-4 bg-white rounded-[24px] hover:bg-gray-50 active:scale-[0.98] transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-movyra-blue transition-colors">
                <item.i size={18} strokeWidth={2.5} />
              </div>
              <span className="font-bold text-[15px] text-gray-800">{item.l}</span>
            </div>
            <ChevronRight size={18} className="text-gray-300 group-hover:text-movyra-blue transition-colors" />
          </button>
        ))}
      </motion.div>

      {/* SECTION 7: Functional Logout Sequence */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <button 
          onClick={handleLogout} 
          className="w-full bg-red-50 text-red-600 py-5 rounded-3xl font-black tracking-wide flex justify-center items-center gap-2 active:scale-[0.98] transition-all hover:bg-red-100 border border-red-100"
        >
          <LogOut size={20} strokeWidth={2.5} />
          Log Out
        </button>
      </motion.div>
      
    </div>
  );
}