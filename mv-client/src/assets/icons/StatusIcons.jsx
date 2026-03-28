import React from 'react';

// ============================================================================
// WARNING ICON (Ref: Recently Tracked - Alert state)
// Solid triangle with exclamation mark punch-out
// ============================================================================
export const WarningIcon = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L1 21H23L12 2ZM11 10H13V15H11V10ZM11 17H13V19H11V17Z" />
  </svg>
);

// ============================================================================
// CHECKMARK ICON (Ref: Recently Tracked - Success state)
// Solid circle with checkmark punch-out
// ============================================================================
export const CheckIcon = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" />
  </svg>
);

// ============================================================================
// PROCESSING ICON (Ref: Recently Tracked - In Transit state)
// Central hub node with horizontal connection bars
// ============================================================================
export const ProcessingIcon = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 7C9.24 7 7 9.24 7 12C7 14.76 9.24 17 12 17C14.76 17 17 14.76 17 12C17 9.24 14.76 7 12 7ZM12 14.5C10.62 14.5 9.5 13.38 9.5 12C9.5 10.62 10.62 9.5 12 9.5C13.38 9.5 14.5 10.62 14.5 12C14.5 13.38 13.38 14.5 12 14.5Z" />
    <path d="M5 10H2V14H5V10Z" />
    <path d="M22 10H19V14H22V10Z" />
    <path d="M12 2C6.48 2 2 6.48 2 12H4C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12H22C22 6.48 17.52 2 12 2Z" />
    <path d="M12 22C17.52 22 22 17.52 22 12H20C20 16.42 16.42 20 12 20C7.58 20 4 16.42 4 12H2C2 17.52 6.48 22 12 22Z" />
  </svg>
);

// ============================================================================
// ORANGE 3D BOX (Ref: Shipments List UI)
// Isometric projection package icon with 3 distinct lighting shades
// ============================================================================
export const OrangeBoxIcon = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Top Face (Light Orange) */}
    <path d="M12 2L2 7.5L12 13L22 7.5L12 2Z" fill="#FFB74D"/>
    {/* Left Face (Medium Orange) */}
    <path d="M2 7.5V18L12 23.5V13L2 7.5Z" fill="#FF9800"/>
    {/* Right Face (Dark Orange) */}
    <path d="M22 7.5V18L12 23.5V13L22 7.5Z" fill="#F57C00"/>
  </svg>
);