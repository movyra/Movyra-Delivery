import React from 'react';
import { ChevronRight } from 'lucide-react';
import CustomTruckIcon from '../../assets/icons/CustomTruckIcon';
export default function ShippingListItem({ trackingId, origin, destination, onClick }) {
  return (
    <div onClick={onClick} className="flex items-center justify-between p-4 bg-surfaceBlack rounded-card cursor-pointer hover:bg-surfaceDarker transition-colors active:scale-[0.98]">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-movyraMint/10 rounded-2xl flex items-center justify-center text-movyraMint"><CustomTruckIcon size={22} /></div>
        <div><p className="font-bold text-[15px] text-white">{trackingId}</p><p className="text-textGray text-[13px] font-medium mt-0.5">{origin} → {destination}</p></div>
      </div>
      <ChevronRight size={20} className="text-textGray" />
    </div>
  );
}
