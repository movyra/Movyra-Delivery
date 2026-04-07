import React from 'react';

/**
 * UI COMPONENT: LINE ICON REGISTRY
 * Replicates the custom, stroke-based SVG icons shown in the premium dashboard reference.
 * Optimized for Uber-style line weights (1.5 - 2.5) to maintain professional crispness.
 */
export default function LineIconRegistry({ name, size = 24, color = "currentColor", strokeWidth = 2, className = "" }) {
  
  const ICONS = {
    // Core App Modes (High Fidelity)
    car: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.7C2.1 11 2 11.4 2 11.8V16c0 .6.4 1 1 1h2" />
        <circle cx="7" cy="17" r="2" />
        <path d="M9 17h6" />
        <circle cx="17" cy="17" r="2" />
      </svg>
    ),
    box: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m7.5 4.27 9 5.15" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
    calendar: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <circle cx="12" cy="16" r="2" />
      </svg>
    ),
    key: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m21 2-1.46 1.46a2 2 0 0 1-.7.46l-3.03.95a2 2 0 0 1-1.34-.07l-2.79-1.19a2 2 0 0 0-1.34-.07l-3.03.95a2 2 0 0 1-.7.46L2 6.5" />
        <path d="m7 15-3 3" />
        <path d="m9 17-3 3" />
        <circle cx="17" cy="7" r="4" />
      </svg>
    ),
    plane: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3.5c-.5-.5-2.5 0-4 1.5L13.5 8.5 5.3 6.7c-1.1-.3-2.2.3-2.5 1.4-.2.9.2 1.8 1 2.3l6.5 4.5-2 2-3-.5c-.6-.1-1.3.1-1.7.6L2.5 18c-.4.4-.5 1-.2 1.5s.8.7 1.3.6l2.1-.5 2.1 2.1c.5.5 1.1.4 1.5 0l1.1-1.1c.5-.4.7-1.1.6-1.7l-.5-3 2-2 4.5 6.5c.5.8 1.4 1.2 2.3 1s1.7-1.4 1.4-2.5z" />
      </svg>
    ),

    // Support Elements
    food: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M3 11h18l-1.5 7h-15L3 11z" />
        <path d="M12 11V3" />
        <path d="M8 3h8" />
        <circle cx="6" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
      </svg>
    ),
    scooter: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="6" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
        <path d="M6 16h12" />
        <path d="M8 16l3-10h4" />
        <path d="M15 6h2" />
      </svg>
    ),
    mapPin: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    search: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    wallet: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M20 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z" />
        <path d="M22 12h-4" />
        <circle cx="16" cy="12" r="1" />
      </svg>
    )
  };

  const TargetIcon = ICONS[name] || ICONS['box']; // Default fallback

  return TargetIcon;
}