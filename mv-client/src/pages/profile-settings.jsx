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
  User as UserIcon,
  LifeBuoy,
  Bell,
  Wallet
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { auth } from '../services/firebaseAuth';

/**
 * PAGE: PROFILE & PREMIUM SETTINGS (PREMIUM CARD UI)
 * Architecture: Detached 32px rounded cards on #F2F4F7 background.
 * Features: 
 * - Isolated Circular Navigation
 * - Grouped Settings Modules
 * - Dark-Mode Premium Membership Card
 * - Functional Firebase Logout
 */

export default function ProfileSettings() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // SECTION 1: Functional Logout Logic
  const handleLogout = async () => {
    try {
      await auth.signOut();
      logout();
      navigate('/auth-login', { replace: true });
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const displayName = user?.name || user?.email?.split('@')[0] || "Movyra Member";
  const displayEmail = user?.email || "No email linked";

  return (
    <div className="min-h-screen bg-[#F2F4F7] text-[#111111] font-sans relative flex flex-col">
      
      {/* SECTION 2: Isolated Circular Navigation */}
      <div className="px-6 pt-14 pb-4 flex items-center gap-4 sticky top-0 z-50 bg-[#F2F4F7]/90 backdrop-blur-md">
        <button 
          onClick={() => navigate('/dashboard-home')} 
          className="w-[46px] h-[46px] bg-white rounded-full flex items-center justify-center text-[#111111] shadow-[0_4px_15px_rgba(0,0,0,0.08)] active:scale-95 transition-all shrink-0"
        >
          <ChevronLeft size={24} strokeWidth={2.5} className="-ml-0.5" />
        </button>
        <h1 className="text-[32px] font-black tracking-tighter text-[#111111] leading-none">
          Settings
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-2 pb-32 space-y-4">
        
        {/* SECTION 3: Identity Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[32px] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-gray-50/50 flex items-center gap-5"
        >
          <div className="w-20 h-20 rounded-[24px] bg-[#F2F4F7] flex items-center justify-center relative border border-gray-100 p-1">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${displayEmail}`} 
              alt="Avatar" 
              className="w-full h-full rounded-[18px] bg-white"
            />
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#111111] rounded-full border-4 border-white flex items-center justify-center text-white shadow-sm">
              <Crown size={12} strokeWidth={3} />
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <h2 className="text-[22px] font-black text-[#111111] tracking-tight truncate capitalize">{displayName}</h2>
            <p className="text-[13px] font-bold text-gray-400 mt-0.5 truncate">{displayEmail}</p>
          </div>
        </motion.div>

        {/* SECTION 4: Premium Status Card (Dark Theme) */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-[#111111] rounded-[32px] p-7 shadow-[0_15px_35px_rgba(0,0,0,0.15)] relative overflow-hidden text-white"
        >
          {/* Animated Background Element */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#BCE3FF] blur-[80px] opacity-20" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 bg-white/10 w-fit px-3 py-1.5 rounded-full border border-white/10 mb-6">
              <Sparkles size={14} className="text-[#BCE3FF]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#BCE3FF]">Exclusive Member</span>
            </div>
            
            <div className="mb-8">
              <h3 className="text-[36px] font-black tracking-tighter leading-none mb-1">Movyra Plus.</h3>
              <p className="text-[13px] font-bold text-gray-400">Unlimited priority delivery enabled</p>
            </div>

            <button className="w-full bg-white text-[#111111] py-4 rounded-[20px] font-black text-[14px] active:scale-[0.98] transition-all shadow-lg">
              Manage Subscription
            </button>
          </div>
        </motion.div>

        {/* SECTION 5: Core Settings Group */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-[32px] p-2 shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-gray-50/50"
        >
          {[ 
            { i: MapPin, l: "Saved Addresses", d: "Manage home & work", action: () => navigate('/profile/addresses') }, 
            { i: Wallet, l: "Payment Methods", d: "Cards & UPI accounts", action: null }, 
            { i: Bell, l: "Notifications", d: "Status alerts & promos", action: null },
            { i: ShieldCheck, l: "Privacy & Security", d: "Biometrics & passwords", action: null }
          ].map((item, idx) => (
            <button 
              key={idx} 
              onClick={item.action}
              disabled={!item.action}
              className={`w-full flex items-center justify-between p-4 bg-white rounded-[24px] hover:bg-[#F2F4F7] active:scale-[0.98] transition-all group ${!item.action ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[18px] bg-[#F2F4F7] flex items-center justify-center text-gray-400 group-hover:bg-[#111111] group-hover:text-white transition-colors">
                  <item.i size={20} strokeWidth={2.5} />
                </div>
                <div className="text-left">
                  <span className="block font-black text-[15px] text-[#111111]">{item.l}</span>
                  <span className="block font-bold text-[12px] text-gray-400">{item.d}</span>
                </div>
              </div>
              {item.action && (
                <ChevronRight size={18} className="text-gray-300 group-hover:text-[#111111] transition-colors" />
              )}
            </button>
          ))}
        </motion.div>

        {/* SECTION 6: Support Group */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-[32px] p-2 shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-gray-50/50"
        >
          {[ 
            { i: LifeBuoy, l: "Help Center", d: "Support & FAQs", action: () => navigate('/support/dispute') },
            { i: Settings, l: "App Language", d: "English (Default)", action: null }
          ].map((item, idx) => (
            <button 
              key={idx} 
              onClick={item.action}
              disabled={!item.action}
              className={`w-full flex items-center justify-between p-4 bg-white rounded-[24px] hover:bg-[#F2F4F7] active:scale-[0.98] transition-all group ${!item.action ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[18px] bg-[#F2F4F7] flex items-center justify-center text-gray-400 group-hover:bg-[#111111] group-hover:text-white transition-colors">
                  <item.i size={20} strokeWidth={2.5} />
                </div>
                <div className="text-left">
                  <span className="block font-black text-[15px] text-[#111111]">{item.l}</span>
                  <span className="block font-bold text-[12px] text-gray-400">{item.d}</span>
                </div>
              </div>
              {item.action && (
                <ChevronRight size={18} className="text-gray-300 group-hover:text-[#111111] transition-colors" />
              )}
            </button>
          ))}
        </motion.div>

        {/* SECTION 7: Logout Action */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        >
          <button 
            onClick={handleLogout} 
            className="w-full bg-red-50 text-red-600 py-5 rounded-[32px] font-black tracking-wide flex justify-center items-center gap-2 active:scale-[0.98] transition-all border border-red-100 shadow-sm"
          >
            <LogOut size={20} strokeWidth={2.5} />
            Sign Out Account
          </button>
        </motion.div>
        
      </div>
      
    </div>
  );
}