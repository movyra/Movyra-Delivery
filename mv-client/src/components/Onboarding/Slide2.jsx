import React from 'react';
import { Bike, Truck, Package } from 'lucide-react';

export default function Slide2() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-8 text-center">
      <div className="flex items-end justify-center gap-4 mb-12 h-40">
        <div className="w-20 h-24 bg-surfaceDark border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-2">
          <Bike size={24} className="text-textGray" />
          <span className="text-[10px] font-bold text-textGray uppercase tracking-widest">5kg</span>
        </div>
        <div className="w-24 h-32 bg-movyraMint/10 border border-movyraMint/30 rounded-2xl flex flex-col items-center justify-center gap-3 shadow-mintGlow transform -translate-y-4">
          <Package size={36} className="text-movyraMint" />
          <span className="text-xs font-bold text-movyraMint uppercase tracking-widest">Any</span>
        </div>
        <div className="w-20 h-28 bg-surfaceDark border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-2">
          <Truck size={28} className="text-textGray" />
          <span className="text-[10px] font-bold text-textGray uppercase tracking-widest">2000kg</span>
        </div>
      </div>
      
      <h1 className="text-4xl font-bold tracking-tight mb-4 leading-tight">
        Seamless <br/>Fleet Selection
      </h1>
      <p className="text-textGray text-lg leading-relaxed max-w-sm">
        From a single envelope to heavy commercial freight. We instantly match your payload to the perfect vehicle.
      </p>
    </div>
  );
}