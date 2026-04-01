import React from 'react';
import { motion } from 'framer-motion';

/**
 * UI COMPONENT: DIAGONAL HATCH CHART
 * Replicates the dynamic bar chart with the diagonal hatched line pattern 
 * and light blue (#BCE3FF) columns shown in the Analytics reference image.
 */
export default function DiagonalHatchChart({ 
  data = [], 
  totalValue = "0.00", 
  currency = "€", 
  dateRange = "Okt 2025 - Nov 2024" 
}) {
  const maxVal = Math.max(...data.map(d => d.value), 1); 
  
  return (
    <div className="bg-[#BCE3FF] rounded-[32px] p-6 shadow-sm w-full relative overflow-hidden">
      
      {/* SVG Definitions for the Hatch Pattern */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <pattern id="hatch-pattern-dark" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#111111" strokeWidth="2.5" />
          </pattern>
        </defs>
      </svg>

      {/* Header Data */}
      <div className="mb-8">
        <p className="text-[12px] font-bold text-[#4A6B85] mb-1 tracking-wide">{dateRange}</p>
        <h2 className="text-[42px] font-black text-[#111111] leading-none tracking-tighter">
          {totalValue}{currency}
        </h2>
      </div>

      {/* Chart Canvas */}
      <div className="relative h-[220px] w-full flex items-end justify-between gap-2.5 mt-4">
        
        {/* Horizontal Average/Target Line */}
        <div className="absolute top-1/2 left-0 right-0 border-t-[1.5px] border-dashed border-[#4A6B85]/30 z-0 pointer-events-none" />
        
        {/* Dynamic Bars */}
        {data.map((item, index) => {
          const heightPct = `${Math.max((item.value / maxVal) * 100, 8)}%`;
          
          return (
            <div key={index} className="flex flex-col items-center justify-end h-full flex-1 z-10 group relative">
              
              {/* Tooltip on Hover */}
              <div className="absolute -top-8 bg-[#111111] text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
                {item.value}{currency}
              </div>

              {/* The Bar */}
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: heightPct }}
                transition={{ duration: 0.8, delay: index * 0.1, type: 'spring', bounce: 0.2 }}
                className="w-full rounded-t-[14px] overflow-hidden transition-all duration-300 relative border-2 border-transparent"
                style={{ 
                  backgroundColor: item.isActive ? 'transparent' : '#93C5E9',
                  borderColor: item.isActive ? '#111111' : 'transparent'
                }}
              >
                {/* SVG rect to hold the hatch pattern if active */}
                {item.isActive && (
                  <svg width="100%" height="100%" className="absolute inset-0">
                    <rect width="100%" height="100%" fill="url(#hatch-pattern-dark)" />
                  </svg>
                )}
              </motion.div>
              
              {/* X-Axis Label */}
              <span className={`text-[12px] font-bold mt-3 transition-colors ${item.isActive ? 'text-[#111111]' : 'text-[#4A6B85]'}`}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}