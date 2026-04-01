import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * UI COMPONENT: SYSTEM BUTTON
 * The massively rounded, high-contrast primary action button.
 * Enforces the 60px/64px height and typography scale for bottom-sheet CTAs.
 */
export default function SystemButton({ 
  children, 
  onClick, 
  disabled = false, 
  loading = false, 
  variant = 'primary', // 'primary' (black) | 'secondary' (gray) | 'white' | 'danger'
  icon: Icon,
  className = ''
}) {
  const baseStyle = "w-full flex items-center justify-center gap-3 px-6 py-4 rounded-[28px] font-black text-[17px] transition-all h-[64px] active:scale-[0.98] disabled:opacity-50 disabled:shadow-none disabled:active:scale-100";
  
  const variants = {
    primary: "bg-[#111111] text-white shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:bg-gray-900",
    secondary: "bg-[#F2F4F7] text-[#111111] border border-gray-200 hover:bg-gray-200",
    white: "bg-white text-[#111111] shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-gray-100 hover:bg-gray-50",
    danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100"
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {loading ? (
        <Loader2 size={24} className="animate-spin" strokeWidth={3} />
      ) : (
        <>
          {Icon && <Icon size={22} strokeWidth={2.5} />}
          <span className="truncate">{children}</span>
        </>
      )}
    </button>
  );
}