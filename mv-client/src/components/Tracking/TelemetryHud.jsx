import React from 'react';
import { BatteryMedium, CornerUpLeft, Compass } from 'lucide-react';

export default function TelemetryHud({ speed = 0, direction = "Turn left", distance = "0.0 mi", battery = 85 }) {
  return (
    <div className="absolute top-32 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
      {/* Speed & Battery Widget */}
      <div className="bg-surfaceBlack/80 backdrop-blur-2xl border border-white/10 p-5 rounded-[32px] shadow-2xl pointer-events-auto flex items-center gap-6">
        <div className="flex flex-col items-center gap-1 opacity-70">
           <BatteryMedium size={20} className="text-movyraMint" />
           <span className="text-[10px] font-bold text-white">{battery}%</span>
        </div>
        
        <div className="flex flex-col items-center justify-center">
          <div className="text-5xl font-black text-white leading-none tracking-tighter mb-1">
            {speed}
          </div>
          <span className="text-xs font-bold text-textGray uppercase tracking-widest">mph</span>
        </div>

        {/* Updated Icon: Replaced SteeringWheel with Compass for valid resolution */}
        <div className="w-10 h-10 bg-movyraMint/10 rounded-full flex items-center justify-center border border-movyraMint/30 shadow-mintGlow">
          <Compass size={20} className="text-movyraMint" />
        </div>
      </div>

      {/* Navigation Instruction Widget */}
      <div className="bg-surfaceDark/90 backdrop-blur-xl border border-white/5 pl-4 pr-6 py-4 rounded-[24px] flex items-center gap-4 shadow-xl pointer-events-auto">
        <div className="w-10 h-10 bg-surfaceBlack rounded-xl flex items-center justify-center border border-white/10">
          <CornerUpLeft size={20} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-white text-[15px]">{distance}</p>
          <p className="text-textGray text-xs font-medium">{direction}</p>
        </div>
      </div>
    </div>
  );
}