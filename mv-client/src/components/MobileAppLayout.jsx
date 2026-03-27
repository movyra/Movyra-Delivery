import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNavMobile from './BottomNavMobile';

/**
 * MobileAppLayout
 * Wraps all authenticated routes. Enforces a mobile-device width on desktop screens,
 * manages safe-area padding, and anchors the bottom navigation bar.
 */
export default function MobileAppLayout() {
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center font-sans">
      {/* Mobile Constraint Container 
        On desktop: Looks like an iOS device screen (rounded, shadowed, fixed width)
        On mobile: Takes full width/height
      */}
      <div className="w-full h-screen sm:h-[90vh] sm:max-w-[420px] bg-white sm:rounded-[40px] sm:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col relative sm:border-[8px] sm:border-gray-900 ring-1 ring-gray-200">
        
        {/* Safe Area Top for iOS (Notch padding simulation on desktop) */}
        <div className="hidden sm:block h-6 w-full bg-white shrink-0 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 bg-gray-900 rounded-b-3xl"></div>
        </div>

        {/* Dynamic Content Area (Injected via React Router) */}
        <main className="flex-1 overflow-y-auto bg-white relative hide-scrollbar pb-safe-bottom">
          <Outlet />
        </main>

        {/* Fixed Bottom Navigation */}
        <BottomNavMobile />
      </div>
    </div>
  );
}