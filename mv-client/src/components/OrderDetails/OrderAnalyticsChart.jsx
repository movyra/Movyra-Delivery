import React from 'react';

/**
 * UI COMPONENT: ANALYTICS BAR CHART
 * Replicates the right side of the reference image.
 * Uses native React + SVG definitions to create a fluid, responsive bar chart
 * with dynamic heights and the signature diagonal "hatched" pattern for the active column.
 * Completely driven by real data arrays passed via props.
 */
export default function OrderAnalyticsChart({ 
  data = [], 
  totalValue = "0.00", 
  currency = "€", 
  dateRange = "N/A" 
}) {
  
  // Mathematical bounds to scale bars automatically
  const maxVal = Math.max(...data.map(d => d.value), 1); // Prevent divide by zero
  
  return (
    <div className="bg-[#BCE3FF] rounded-[32px] p-6 shadow-sm w-full relative overflow-hidden">
      
      {/* SVG Definitions for the Hatch Pattern */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <pattern id="hatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#111111" strokeWidth="3" />
          </pattern>
        </defs>
      </svg>

      {/* Header Data */}
      <div className="mb-8">
        <p className="text-[13px] font-bold text-[#4A6B85] mb-1">{dateRange}</p>
        <h2 className="text-[40px] font-black text-[#111111] leading-none tracking-tighter">
          {totalValue}{currency}
        </h2>
      </div>

      {/* Chart Canvas */}
      <div className="relative h-[200px] w-full flex items-end justify-between gap-2 mt-4">
        
        {/* Horizontal Average/Target Line */}
        <div className="absolute top-1/2 left-0 right-0 border-t-2 border-dashed border-[#111111]/20 z-0 pointer-events-none" />
        
        {/* Dynamic Bars */}
        {data.map((item, index) => {
          // Calculate percentage height relative to the max value (capped at 100%)
          const heightPct = `${Math.max((item.value / maxVal) * 100, 5)}%`;
          
          return (
            <div key={index} className="flex flex-col items-center justify-end h-full flex-1 z-10 group relative">
              
              {/* Tooltip on Hover (Desktop) / Active State */}
              <div className="absolute -top-8 bg-[#111111] text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                {item.value}{currency}
              </div>

              {/* The Bar */}
              <div 
                className="w-full rounded-t-xl transition-all duration-500 ease-out"
                style={{ 
                  height: heightPct,
                  backgroundColor: item.isActive ? 'transparent' : '#94C9EE',
                  fill: item.isActive ? 'url(#hatch)' : 'none',
                  border: item.isActive ? '2px solid #111111' : 'none'
                }}
              >
                {/* SVG rect to hold the hatch pattern if active */}
                {item.isActive && (
                  <svg width="100%" height="100%" className="rounded-t-xl overflow-hidden">
                    <rect width="100%" height="100%" fill="url(#hatch)" />
                  </svg>
                )}
              </div>
              
              {/* X-Axis Label */}
              <span className={`text-[12px] font-bold mt-3 ${item.isActive ? 'text-[#111111]' : 'text-[#4A6B85]'}`}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}