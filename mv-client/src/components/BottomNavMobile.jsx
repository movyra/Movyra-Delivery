import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, LayoutGrid, ReceiptText, User } from 'lucide-react';

/**
 * BottomNavMobile
 * Replicates the Uber-style bottom navigation bar shown in the reference image.
 * Features: Home, Services, Activity, Account.
 */
export default function BottomNavMobile() {
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation schema matching image_c84fc0.jpg
  const navItems = [
    { label: 'Home', path: '/dashboard-home', icon: Home },
    { label: 'Services', path: '/services', icon: LayoutGrid },
    { label: 'Activity', path: '/order-history', icon: ReceiptText },
    { label: 'Account', path: '/profile-settings', icon: User },
  ];

  return (
    <div className="bg-white border-t border-gray-100 px-6 py-2 pb-6 sm:pb-4 flex justify-between items-center shrink-0 shadow-[0_-5px_20px_rgba(0,0,0,0.02)] z-50">
      {navItems.map((item) => {
        const Icon = item.icon;
        // Determine if the current route matches the tab's path
        const isActive = location.pathname.startsWith(item.path);
        
        return (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center gap-1 w-16 pt-2 pb-1 transition-all active:scale-95"
          >
            <div className="relative">
              <Icon 
                size={24} 
                strokeWidth={isActive ? 2.5 : 2} 
                className={`${isActive ? 'text-black' : 'text-gray-400'} transition-colors`} 
                fill={isActive && item.label !== 'Services' ? 'currentColor' : 'transparent'}
              />
              {/* Optional notification dot for specific tabs could go here */}
            </div>
            <span 
              className={`text-[10px] tracking-tight ${
                isActive ? 'text-black font-bold' : 'text-gray-500 font-medium'
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}