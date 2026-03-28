import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ============================================================================
// MOVYRA PRIMARY BUTTON ENGINE
// Matches the exact "Track Package" and "Send Package" buttons.
// Automatically handles active-press scaling and variant stylings.
// ============================================================================

const MovyraButton = ({ 
  children, 
  variant = 'solid', 
  onClick, 
  className, 
  icon,
  disabled = false,
  type = 'button'
}) => {
  // Base structural classes providing the rounded pill look and haptic scale effect
  const baseStyles = "w-full py-4 rounded-2xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-3 active:scale-95";
  
  // Design system specific variant mappings
  const variants = {
    // Reference: "Track Package" blue button
    solid: "bg-movyra-blue text-white shadow-lg shadow-movyra-blue/30 hover:bg-blue-700",
    // Reference: "Send Package" outlined button
    outline: "bg-white text-movyra-blue border-2 border-movyra-blue hover:bg-blue-50"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={twMerge(clsx(baseStyles, variants[variant], disabled && "opacity-50 cursor-not-allowed active:scale-100", className))}
    >
      {icon && <span className="flex items-center justify-center">{icon}</span>}
      {children}
    </button>
  );
};

export default MovyraButton;