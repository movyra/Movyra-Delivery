import React from 'react';
import { Bell } from 'lucide-react';
export default function UserHeader({ user, notificationsCount }) {
  return (
    <div className="pt-16 px-6 pb-6 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-surfaceDarker overflow-hidden border border-white/10"><img src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=User"} alt="User" className="w-full h-full object-cover" /></div>
        <div>
          <h2 className="font-bold text-[17px] text-white flex items-center gap-2">{user?.name || "User"} 👋🏼</h2>
          <p className="text-textGray text-[13px]">{user?.location || "Pune, India"}</p>
        </div>
      </div>
      <button className="relative w-12 h-12 bg-surfaceDark rounded-full flex items-center justify-center">
        {notificationsCount > 0 && <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 bg-movyraMint rounded-full flex items-center justify-center"><span className="text-[8px] text-surfaceBlack font-black">{notificationsCount}</span></div>}
        <Bell size={22} className="text-white" />
      </button>
    </div>
  );
}
