import React from 'react';
import { MapPin, PhoneCall, ShieldCheck } from 'lucide-react';

export default function DriverBottomCard({ driver, currentLocation, destination }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-surfaceBlack rounded-t-[40px] px-6 pt-8 pb-10 border-t border-white/5 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] z-50">
      <div className="w-12 h-1.5 bg-surfaceDarker rounded-full mx-auto mb-8"></div>

      {/* Driver Info Profile */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-surfaceDark overflow-hidden border-2 border-surfaceDarker">
              <img src={driver?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Driver"} alt="Driver" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-movyraMint rounded-full flex items-center justify-center border-2 border-surfaceBlack">
              <ShieldCheck size={12} className="text-surfaceBlack" strokeWidth={3} />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">{driver?.name || 'Assigned Driver'}</h3>
            <p className="text-textGray text-sm font-medium">{driver?.vehiclePlate || 'MH 12 AB 1234'} • {driver?.vehicleModel || 'Electric Cargo'}</p>
          </div>
        </div>
        
        {/* Real Action Button */}
        <a 
          href={`tel:${driver?.phone || '+910000000000'}`}
          className="w-12 h-12 bg-surfaceDark border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-movyraMint hover:text-surfaceBlack hover:border-movyraMint hover:shadow-mintGlow transition-all active:scale-90"
        >
          <PhoneCall size={20} />
        </a>
      </div>

      {/* Location Status */}
      <div className="bg-surfaceDark rounded-3xl p-5 border border-white/5">
        <div className="flex items-start gap-4">
          <div className="mt-1 w-8 h-8 bg-surfaceDarker rounded-full flex items-center justify-center text-textGray">
            <MapPin size={16} />
          </div>
          <div className="flex-1">
            <p className="text-textGray text-xs font-bold tracking-wider uppercase mb-1">Current Location</p>
            <p className="font-medium text-white text-[15px] leading-snug">{currentLocation || 'Updating GPS...'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}