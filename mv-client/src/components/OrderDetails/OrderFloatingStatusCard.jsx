import React from 'react';
import { motion } from 'framer-motion';
import { Settings2, RefreshCw } from 'lucide-react';

/**
 * UI COMPONENT: ORDER FLOATING STATUS CARD
 * Replicates the light-blue overlapping card from the reference image.
 * Upgraded to include a vertical timeline with two dots (Pickup & Dropoff)
 * as requested, connecting the route visually within the card.
 */
export default function OrderFloatingStatusCard({ 
  pickupAddress, 
  dropoffAddress, 
  statusText, 
  subText, 
  onActionClick, 
  actionIcon: ActionIcon = Settings2 
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="w-full z-[2000]"
    >
      <div className="bg-[#BCE3FF] rounded-[32px] p-5 shadow-[0_10px_30px_rgba(188,227,255,0.4)] relative overflow-hidden border border-[#A5D5F9]">
        
        <div className="flex items-stretch gap-4">
          {/* Vertical Timeline (Two Dots: Pickup & Dropoff) */}
          <div className="flex flex-col items-center justify-between py-1 relative w-4 shrink-0">
            {/* Top Dot (Pickup - Hollow) */}
            <div className="w-3 h-3 rounded-full border-[2.5px] border-[#111111] bg-[#BCE3FF] z-10" />
            
            {/* Connecting Line */}
            <div className="absolute top-[10px] bottom-[10px] left-1/2 -translate-x-1/2 w-[2px] border-l-2 border-dotted border-[#111111]/40 z-0" />
            
            {/* Bottom Dot (Dropoff - Solid) */}
            <div className="w-3 h-3 rounded-full bg-[#111111] z-10" />
          </div>

          {/* Central Route Content */}
          <div className="flex-1 flex flex-col justify-between py-0.5 overflow-hidden gap-3">
            <div className="overflow-hidden">
              <p className="text-[15px] font-black text-[#111111] truncate leading-tight">
                {pickupAddress || 'Resolving Pickup...'}
              </p>
            </div>
            <div className="overflow-hidden">
              <p className="text-[15px] font-black text-[#111111] truncate leading-tight">
                {dropoffAddress || 'Resolving Dropoff...'}
              </p>
            </div>
          </div>

          {/* Right Action Button (e.g., Settings, Refresh) */}
          <div className="shrink-0 flex items-center justify-center">
            <button 
              onClick={onActionClick}
              className="w-[42px] h-[42px] bg-white/30 rounded-full backdrop-blur-sm flex items-center justify-center text-[#111111] hover:bg-white/50 active:scale-95 transition-all"
            >
              <ActionIcon size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Dynamic Sub-status Area (ETA, Price Drop Alerts, etc.) */}
        {statusText && (
          <div className="mt-5 pt-4 border-t border-[#111111]/10 flex items-start gap-3">
            <RefreshCw size={16} className="text-[#111111] shrink-0 mt-0.5" strokeWidth={2.5} />
            <div>
              <p className="text-[14px] font-bold text-[#111111] leading-tight">
                {statusText}
              </p>
              {subText && (
                <p className="text-[12px] font-medium text-[#4A6B85] uppercase tracking-wide mt-1">
                  {subText}
                </p>
              )}
            </div>
          </div>
        )}

      </div>
    </motion.div>
  );
}