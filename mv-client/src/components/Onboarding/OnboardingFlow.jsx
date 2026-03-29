import React from 'react';
import PromoSlides from './PromoSlides';

// ============================================================================
// ONBOARDING MASTER CONTROLLER
// Simplified architecture strictly rendering the promotional slide sequence.
// Legacy hardware/GPS gates have been removed in favor of OTP-first signup.
// ============================================================================

export default function OnboardingFlow({ onComplete }) {
  return (
    <div className="fixed inset-0 bg-movyra-surface text-gray-800 overflow-hidden flex flex-col z-[200]">
      {/* Strict Injection of PromoSlides component only.
        Passes the onComplete handler down to unlock the app state upon completion
        and let PromoSlides handle the redirect to /auth-signup.
      */}
      <PromoSlides onComplete={onComplete} />
    </div>
  );
}