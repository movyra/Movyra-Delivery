import React from 'react';
import { Home, ClipboardList, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
export default function BottomNavBar() {
  const nav = useNavigate(); const loc = useLocation();
  const tabs = [{ path: '/dashboard-home', icon: Home }, { path: '/order-history', icon: ClipboardList }, { path: '/profile-settings', icon: User }];
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surfaceBlack pb-8 pt-4 px-8 flex justify-between z-50 rounded-t-mobile border-t border-white/5">
      {tabs.map((t, i) => {
        const active = loc.pathname.includes(t.path);
        const Icon = t.icon;
        return <button key={i} onClick={() => nav(t.path)} className={`p-3 rounded-2xl ${active ? 'bg-movyraMint/10 text-movyraMint' : 'text-textGray'}`}><Icon size={26} strokeWidth={active ? 2.5 : 2} /></button>
      })}
    </div>
  );
}
