import React from 'react';
import { Bell } from 'lucide-react';

export default function UserHeader({ user, notificationsCount }) {
  return (
    <div className="pt-16 px-6 pb-6 flex justify-between items-center">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-surfaceDarker overflow-hidden border border-white/10 relative">
          <img 
            src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=MovyraUser"} 
            alt="User Profile" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* User Info */}
        <div>
          <h2 className="font-bold text-[17px] text-white leading-tight flex items-center gap-2">
            {user?.name || "Movyra User"} <span className="text-xl">👋🏼</span>
          </h2>
          <p className="text-textGray text-[13px] font-medium mt-0.5">
            {user?.location || "Pune, India"}
          </p>
        </div>
      </div>

      {/* Notification Bell */}
      <button className="relative w-12 h-12 bg-surfaceDark rounded-full flex items-center justify-center hover:bg-surfaceDarker transition-colors active:scale-95">
        {notificationsCount > 0 && (
          <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 bg-movyraMint rounded-full border-[2.5px] border-surfaceDark flex items-center justify-center z-10">
             <span className="text-[8px] text-surfaceBlack font-black leading-none">{notificationsCount}</span>
          </div>
        )}
        <Bell size={22} className="text-white" />
      </button>
    </div>
  );
}