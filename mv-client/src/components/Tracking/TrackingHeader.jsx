import React from 'react';
import { ChevronLeft, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TrackingHeader({ trackingId }) {
  const navigate = useNavigate();

  return (
    <div className="absolute top-14 left-0 right-0 px-6 flex items-center justify-between z-50 pointer-events-none">
      <button 
        onClick={() => navigate(-1)} 
        className="p-3 -ml-2 bg-surfaceBlack/60 backdrop-blur-xl border border-white/10 rounded-full text-white pointer-events-auto active:scale-95 transition-all shadow-lg"
      >
        <ChevronLeft size={24} />
      </button>

      <div className="bg-surfaceBlack/80 backdrop-blur-xl border border-white/10 px-6 py-2 rounded-pill pointer-events-auto shadow-lg">
        <span className="font-bold text-white tracking-widest text-sm uppercase">
          {trackingId || 'Tracking'}
        </span>
      </div>

      <button className="p-3 -mr-2 bg-surfaceBlack/60 backdrop-blur-xl border border-white/10 rounded-full text-white pointer-events-auto active:scale-95 transition-all shadow-lg">
        <Info size={24} />
      </button>
    </div>
  );
}