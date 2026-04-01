import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin } from 'lucide-react';

/**
 * UI COMPONENT: DARK TOOLTIP OVERLAY
 * Replicates the sharp, black rectangular tooltip ("Meet outside Stephen St...") 
 * floating over the map pin shown in the live tracking reference image.
 */
export default function DarkTooltipOverlay({ isVisible, icon: Icon = MapPin, title, subtitle }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="absolute z-[1000] flex flex-col items-center pointer-events-none"
          style={{ transform: 'translate(-50%, -100%)', marginTop: '-12px' }}
        >
          <div className="bg-[#111111] text-white rounded-none px-4 py-3 shadow-[0_10px_25px_rgba(0,0,0,0.3)] flex items-center gap-3 max-w-[280px]">
            <div className="w-8 h-8 border border-white/20 rounded flex items-center justify-center shrink-0">
              <Icon size={16} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col text-left">
              {title && <span className="text-[13px] font-black leading-tight truncate">{title}</span>}
              {subtitle && <span className="text-[11px] font-medium text-gray-300 leading-tight mt-0.5 line-clamp-2">{subtitle}</span>}
            </div>
          </div>
          {/* Sharp downward pointer triangle */}
          <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-[#111111] filter drop-shadow-md" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}