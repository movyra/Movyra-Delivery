import React from 'react';
import { LogOut, ChevronRight, CreditCard, Shield, MapPin, Settings } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { auth } from '../services/firebaseAuth';
import { useNavigate } from 'react-router-dom';

export default function ProfileSettings() {
  const { user, logout } = useAuthStore(); const nav = useNavigate();
  const handleLogout = async () => { await auth.signOut(); logout(); nav('/auth-login'); };

  return (
    <div className="min-h-screen bg-surfaceBlack text-white px-6 pt-14 pb-32 font-sans">
      {/* Sec 1: Header */}
      <h1 className="text-3xl font-bold mb-8">Profile.</h1>
      
      {/* Sec 2: User Card */}
      <div className="bg-surfaceDark rounded-[32px] p-6 border border-white/5 flex items-center gap-5 mb-6">
        <div className="w-16 h-16 rounded-full bg-surfaceDarker"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Kretya" className="w-full h-full rounded-full"/></div>
        <div><h2 className="text-xl font-bold text-white">{user?.name || "Kretya Studio"}</h2><p className="text-sm text-textGray">{user?.phone || "+91 98765 43210"}</p></div>
      </div>

      {/* Sec 3: Wallet Quick Access */}
      <div className="bg-movyraMint/10 border border-movyraMint/30 rounded-2xl p-5 mb-8 flex justify-between items-center">
        <div><p className="text-movyraMint text-xs font-bold uppercase tracking-wider mb-1">Wallet Balance</p><p className="text-2xl font-black text-white">₹1,240.00</p></div>
        <button className="bg-movyraMint text-surfaceBlack px-4 py-2 rounded-lg font-bold text-sm shadow-mintGlow">Add Funds</button>
      </div>

      {/* Sec 4: Settings Menu */}
      <div className="bg-surfaceDark rounded-[32px] p-2 flex flex-col gap-1 border border-white/5 mb-8">
        {[ {i:CreditCard, l:"Payment Methods"}, {i:MapPin, l:"Saved Addresses"}, {i:Shield, l:"Privacy"}, {i:Settings, l:"App Settings"} ].map((x, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 bg-surfaceBlack rounded-[24px]"><div className="flex items-center gap-4"><x.i size={18} className="text-textGray"/><span className="font-bold text-[15px]">{x.l}</span></div><ChevronRight size={18} className="text-textGray"/></div>
        ))}
      </div>

      {/* Sec 5: Logout */}
      <button onClick={handleLogout} className="w-full bg-red-500/10 text-red-500 py-4 rounded-pill font-bold flex justify-center gap-2"><LogOut size={20}/>Log Out</button>
    </div>
  );
}
