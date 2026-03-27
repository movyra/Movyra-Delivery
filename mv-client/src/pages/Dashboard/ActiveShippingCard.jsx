import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from 'lucide-react';

export default function ActiveShippingCard({ activeOrder }) {
  const navigate = useNavigate();

  if (!activeOrder) return null;

  return (
    <div className="px-6 mb-8">
      <h3 className="font-bold mb-4 text-[15px] text-white tracking-wide">Current Shipping</h3>
      <div 
        onClick={() => navigate(`/tracking-active?id=${activeOrder.id}`)}
        className="bg-surfaceDark rounded-[32px] p-6 border border-white/5 relative overflow-hidden cursor-pointer active:scale-[0.98] transition-all shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
      >
        {/* Left Content */}
        <div className="relative z-10 w-[60%] flex flex-col justify-between min-h-[120px]">
          <div>
            <p className="text-textGray text-[13px] font-medium mb-1">Shipping number</p>
            <p className="font-bold text-[15px] text-white tracking-wide">{activeOrder.id}</p>
          </div>
          <div className="mt-6">
            <p className="text-textGray text-[13px] font-medium mb-1">Current Location</p>
            <p className="font-bold text-[14px] text-white leading-snug">{activeOrder.currentLocation}</p>
          </div>
        </div>

        {/* Right Embedded Map Visual (Matching the exact UI from the screenshot) */}
        <div className="absolute top-4 right-4 bottom-4 w-[35%] bg-surfaceBlack rounded-3xl border border-white/5 overflow-hidden">
           {/* Map Grid Pattern */}
           <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
           
           {/* Active Route Line */}
           <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 150" fill="none">
             <path d="M 20 20 Q 50 80 80 120" stroke="#00F0B5" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 6" className="opacity-50" />
             <path d="M 20 20 Q 50 80 60 95" stroke="#00F0B5" strokeWidth="3" strokeLinecap="round" />
           </svg>

           {/* Location Pin */}
           <div className="absolute top-[60%] left-[55%] w-6 h-6 bg-movyraMint/20 rounded-full flex items-center justify-center -translate-x-1/2 -translate-y-1/2 shadow-mintGlow">
              <Navigation size={12} className="text-movyraMint fill-movyraMint rotate-180" />
           </div>
        </div>
      </div>
    </div>
  );
}