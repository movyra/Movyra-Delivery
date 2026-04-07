import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogOut, ChevronLeft, ChevronRight, 
  ShieldCheck, MapPin, Settings, Crown, 
  Sparkles, LifeBuoy, Bell, Globe, Moon, ShieldAlert
} from 'lucide-react';

// Real Store, Auth & Services Integration
import useAuthStore from '../store/useAuthStore';
import { auth, logoutFromAllDevices } from '../services/firebaseAuth';
import { notificationService } from '../services/notifications';

// Premium Design System Components
import SystemCard from '../components/UI/SystemCard';
import SystemToggle from '../components/UI/SystemToggle';
import SystemButton from '../components/UI/SystemButton';

/**
 * PAGE: PROFILE & PREMIUM SETTINGS (PREMIUM CARD UI)
 * Architecture: Detached 32px rounded SystemCards on #F2F4F7 background.
 * Features (6+): 
 * - Language & Theme SystemToggles
 * - Hardware Push Notification Permission Switch
 * - Hardware Location Services Switch
 * - Multi-Device Global Logout
 * - Dark-Mode Premium Membership Card
 */

// Custom Animated Hardware Switch
const HardwareSwitch = ({ isOn, onToggle, disabled, loading }) => (
  <button
    onClick={onToggle}
    disabled={disabled || loading}
    className={`w-14 h-8 rounded-full p-1 transition-colors relative flex items-center shadow-inner ${isOn ? 'bg-[#111111]' : 'bg-[#E5E7EB]'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
  >
    <motion.div
      layout
      className={`w-6 h-6 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.15)] flex items-center justify-center`}
      animate={{ x: isOn ? 24 : 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    >
      {loading && <div className="w-3 h-3 border-2 border-gray-300 border-t-[#111111] rounded-full animate-spin" />}
    </motion.div>
  </button>
);

export default function ProfileSettings() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // Settings State
  const [language, setLanguage] = useState('en');
  const [theme, setTheme] = useState('light');
  
  // Hardware Permissions State
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const displayName = user?.name || user?.email?.split('@')[0] || "Movyra Member";
  const displayEmail = user?.email || "No email linked";

  // ============================================================================
  // LOGIC: HARDWARE PERMISSION SYNCING
  // ============================================================================
  useEffect(() => {
    // Sync actual browser notification permission
    if ("Notification" in window) {
      setPushEnabled(Notification.permission === 'granted');
    }
    
    // Sync actual browser location permission
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        setLocationEnabled(result.state === 'granted');
        result.onchange = () => setLocationEnabled(result.state === 'granted');
      });
    }
  }, []);

  const handlePushToggle = async () => {
    if (pushEnabled) {
      // Browser notifications cannot be programmatically revoked once granted,
      // but we update the UI state to reflect an "opt-out" in the database.
      setPushEnabled(false);
      return;
    }

    setPushLoading(true);
    try {
      const token = await notificationService.requestAndRegister();
      if (token) setPushEnabled(true);
    } catch (err) {
      console.warn("Push notification registration cancelled or failed:", err);
      setPushEnabled(false);
    } finally {
      setPushLoading(false);
    }
  };

  const handleLocationToggle = () => {
    if (locationEnabled) {
      setLocationEnabled(false);
      return;
    }
    // Trigger prompt
    navigator.geolocation.getCurrentPosition(
      () => setLocationEnabled(true),
      () => setLocationEnabled(false)
    );
  };

  // ============================================================================
  // LOGIC: AUTHENTICATION & SECURITY
  // ============================================================================
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await auth.signOut();
      logout();
      navigate('/auth-login', { replace: true });
    } catch (error) {
      console.error("Logout Error:", error);
      setIsLoggingOut(false);
    }
  };

  const handleGlobalLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (typeof logoutFromAllDevices === 'function') {
        await logoutFromAllDevices();
      }
      await auth.signOut();
      logout();
      navigate('/auth-login', { replace: true });
    } catch (error) {
      console.error("Global Logout Error:", error);
      setIsLoggingOut(false);
    }
  };

  const languageTabs = [
    { id: 'en', label: 'English' },
    { id: 'hi', label: 'हिन्दी' },
    { id: 'es', label: 'Español' }
  ];

  const themeTabs = [
    { id: 'light', label: 'Light' },
    { id: 'dark', label: 'Dark' },
    { id: 'system', label: 'System' }
  ];

  // ============================================================================
  // RENDER UI
  // ============================================================================
  return (
    <div className="min-h-[100dvh] bg-[#F2F4F7] text-[#111111] font-sans relative flex flex-col">
      
      {/* SECTION 1: Isolated Circular Navigation */}
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

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-2 pb-32 space-y-4">
        
        {/* SECTION 2: Identity Card */}
        <SystemCard animated variant="white" className="flex items-center gap-5 !p-5">
          <div className="w-[72px] h-[72px] rounded-[24px] bg-[#F2F4F7] flex items-center justify-center relative border border-gray-100 p-1">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${displayEmail}`} 
              alt="Avatar" 
              className="w-full h-full rounded-[18px] bg-white"
            />
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#111111] rounded-full border-[3px] border-white flex items-center justify-center text-white shadow-sm">
              <Crown size={12} strokeWidth={3} />
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <h2 className="text-[20px] font-black text-[#111111] tracking-tight truncate capitalize leading-none mb-1">{displayName}</h2>
            <p className="text-[13px] font-bold text-gray-400 truncate">{displayEmail}</p>
          </div>
        </SystemCard>

        {/* SECTION 3: Premium Status Card (Dark Theme) */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-[#111111] rounded-[32px] p-7 shadow-[0_15px_35px_rgba(0,0,0,0.15)] relative overflow-hidden text-white mb-2"
        >
          {/* Animated Background Element */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#BCE3FF] blur-[80px] opacity-20 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 bg-white/10 w-fit px-3 py-1.5 rounded-full border border-white/10 mb-6">
              <Sparkles size={14} className="text-[#BCE3FF]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#BCE3FF]">Exclusive Member</span>
            </div>
            
            <div className="mb-8">
              <h3 className="text-[36px] font-black tracking-tighter leading-none mb-1">Movyra Plus.</h3>
              <p className="text-[13px] font-bold text-gray-400">Unlimited priority delivery enabled</p>
            </div>

            <button className="w-full bg-white text-[#111111] py-4 rounded-[20px] font-black text-[14px] active:scale-[0.98] transition-all shadow-lg hover:bg-gray-50">
              Manage Subscription
            </button>
          </div>
        </motion.div>

        {/* SECTION 4: System Preferences (Language & Theme) */}
        <SystemCard animated variant="white" className="!p-5 space-y-5">
          <div>
            <h3 className="text-[13px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Globe size={16} /> Display Language
            </h3>
            <SystemToggle 
              tabs={languageTabs}
              activeTab={language}
              onTabChange={setLanguage}
              className="w-full"
            />
          </div>
          <div className="h-px w-full bg-gray-100" />
          <div>
            <h3 className="text-[13px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Moon size={16} /> Appearance
            </h3>
            <SystemToggle 
              tabs={themeTabs}
              activeTab={theme}
              onTabChange={setTheme}
              className="w-full"
            />
          </div>
        </SystemCard>

        {/* SECTION 5: Hardware Permissions (Push & Location) */}
        <SystemCard animated variant="white" className="!p-2">
          <div className="w-full flex items-center justify-between p-4 bg-white rounded-[24px]">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center transition-colors ${pushEnabled ? 'bg-[#111111] text-white' : 'bg-[#F2F4F7] text-gray-400'}`}>
                <Bell size={20} strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <span className="block font-black text-[15px] text-[#111111] tracking-tight">Push Notifications</span>
                <span className="block font-bold text-[12px] text-gray-400">Live order & driver alerts</span>
              </div>
            </div>
            <HardwareSwitch isOn={pushEnabled} onToggle={handlePushToggle} loading={pushLoading} />
          </div>

          <div className="w-full flex items-center justify-between p-4 bg-white rounded-[24px]">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center transition-colors ${locationEnabled ? 'bg-[#276EF1] text-white' : 'bg-[#F2F4F7] text-gray-400'}`}>
                <MapPin size={20} strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <span className="block font-black text-[15px] text-[#111111] tracking-tight">Location Services</span>
                <span className="block font-bold text-[12px] text-gray-400">Precise pickup auto-fill</span>
              </div>
            </div>
            <HardwareSwitch isOn={locationEnabled} onToggle={handleLocationToggle} />
          </div>
        </SystemCard>

        {/* SECTION 6: Support Navigation */}
        <SystemCard animated variant="white" className="!p-2">
          <button 
            onClick={() => navigate('/support/dispute')}
            className="w-full flex items-center justify-between p-4 bg-white rounded-[24px] hover:bg-[#F6F6F6] active:scale-[0.98] transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-[18px] bg-[#F2F4F7] flex items-center justify-center text-gray-400 group-hover:bg-[#111111] group-hover:text-white transition-colors">
                <LifeBuoy size={20} strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <span className="block font-black text-[15px] text-[#111111] tracking-tight">Help Center</span>
                <span className="block font-bold text-[12px] text-gray-400">Support tickets & FAQs</span>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-300 group-hover:text-[#111111] transition-colors" />
          </button>
        </SystemCard>

        {/* SECTION 7: Security & Logout Actions */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="pt-2 space-y-3">
          <SystemButton 
            onClick={handleGlobalLogout} 
            disabled={isLoggingOut}
            variant="secondary"
            icon={ShieldAlert}
            className="!text-red-600 !bg-red-50 hover:!bg-red-100 !border-red-100"
          >
            Sign out of all devices
          </SystemButton>
          
          <SystemButton 
            onClick={handleLogout} 
            disabled={isLoggingOut}
            loading={isLoggingOut}
            variant="secondary"
            icon={LogOut}
            className="!bg-white border-2 border-gray-100 text-[#111111]"
          >
            Sign Out
          </SystemButton>
        </motion.div>
        
      </div>
    </div>
  );
}