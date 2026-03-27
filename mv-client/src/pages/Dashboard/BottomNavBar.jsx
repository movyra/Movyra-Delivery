import React from 'react';
import { Home, ClipboardList, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function BottomNavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'home', path: '/dashboard-home', icon: Home },
    { id: 'orders', path: '/order-history', icon: ClipboardList },
    { id: 'profile', path: '/profile-settings', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surfaceBlack pb-8 pt-4 px-8 flex justify-between items-center z-50 rounded-t-mobile border-t border-white/5">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname.includes(item.path);

        return (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`p-3 transition-all duration-300 rounded-2xl flex items-center justify-center ${
              isActive 
                ? 'bg-movyraMint/10 text-movyraMint shadow-[0_0_15px_rgba(0,240,181,0.1)]' 
                : 'text-textGray hover:text-white'
            }`}
          >
            <Icon size={26} strokeWidth={isActive ? 2.5 : 2} />
          </button>
        );
      })}
    </div>
  );
}