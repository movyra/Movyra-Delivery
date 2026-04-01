import React from 'react';

/**
 * UI COMPONENT: LINE ICON REGISTRY
 * Replicates the massive spiral of custom, stroke-based SVG icons shown in the reference images.
 * Pure SVG vectors ensuring absolute crispness at any scale, replacing standard Lucide icons.
 */
export default function LineIconRegistry({ name, size = 24, color = "currentColor", strokeWidth = 2, className = "" }) {
  
  const ICONS = {
    // Core App Modes (From the 'Rides, Eats, Scooter' reference)
    car: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M5 10l1.5-4.5A2 2 0 0 1 8.4 4h7.2a2 2 0 0 1 1.9 1.5L19 10" />
        <path d="M22 10v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6c0-1.1.9-2 2-2h16a2 2 0 0 1 2 2z" />
        <circle cx="7" cy="15" r="1.5" />
        <circle cx="17" cy="15" r="1.5" />
      </svg>
    ),
    food: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9z" />
        <path d="M12 21V3" />
        <path d="M10 4v4" />
        <path d="M14 4v4" />
      </svg>
    ),
    scooter: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M11 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
        <path d="M19 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
        <path d="M11 17H5l2-14h5" />
        <path d="M19 17h-6l-2-7" />
      </svg>
    ),
    
    // Logistics & Tracking
    box: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
    mapPin: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    
    // UI Fundamentals
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