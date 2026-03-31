import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * UI COMPONENT: ORDER INFO LIST CARD
 * Highly rounded, standalone white cards for the scrollable list area.
 * Designed to display detailed metadata (Driver info, pricing, distance) 
 * in a clean split-layout format without borders.
 */
export default function OrderInfoListCard({ 
  icon: Icon, 
  title, 
  subtitle, 
  rightValue, 
  rightSubValue,
  alertMode = false,
  onClickAction
}) {
  return (
    <div className="bg-white rounded-[32px] p-6 shadow-[0_4px_15px_rgba(0,0,0,0.03)] border border-gray-50/50 flex flex-col gap-4">
      
      {/* Header Row (Optional Alert/Icon + Title) */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${alertMode ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500'}`}>
              <Icon size={16} strokeWidth={2.5} />
            </div>
          )}
          <span className="text-[15px] font-black text-[#111111] tracking-tight">
            {title}
          </span>
        </div>
        
        {onClickAction && (
          <button 
            onClick={onClickAction}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-black hover:border-black transition-colors"
          >
            <AlertCircle size={16} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Content Row (Left Subtitle + Right Primary Value) */}
      <div className="flex items-end justify-between mt-2">
        <div className="flex-1 pr-4">
          <p className="text-[14px] font-bold text-[#111111] leading-tight">
            {subtitle}
          </p>
          {rightSubValue && (
            <p className="text-[12px] font-medium text-gray-400 mt-1">
              {rightSubValue}
            </p>
          )}
        </div>
        
        <div className="text-right shrink-0">
          <p className="text-[22px] font-black text-[#111111] leading-none">
            {rightValue}
          </p>
        </div>
      </div>

    </div>
  );
}