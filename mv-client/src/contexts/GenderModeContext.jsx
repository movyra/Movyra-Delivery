import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * ============================================================================
 * FEATURE DOMAIN: STRICT GENDER & SAFETY MODE STATE MACHINE
 * Contains 10+ real logic modules to dynamically adapt the app's security
 * posture based on the user's gender and the real-time local clock.
 * ============================================================================
 */

// Utility: Real-time calculation to determine if local time is between 8 PM and 6 AM
const checkIsNightTime = () => {
  const currentHour = new Date().getHours();
  return currentHour >= 20 || currentHour < 6;
};

export const useGenderMode = create(
  persist(
    (set, get) => ({
      // 1. Core Identity State
      gender: 'unassigned', // 'female', 'male', or 'unassigned'
      
      // 2. Real-Time Environment State
      isNightTime: checkIsNightTime(),
      
      // 3. Dynamic Trust Thresholds
      // Female mode requires a near-perfect driver score, especially at night
      minDriverTrustScore: 4.0, 
      
      // 4. Strict Verification Enforcement
      requireVerifiedDriver: false,
      
      // 5. Guardian System Automation
      enableGuardianAutoShare: false,
      
      // 6. Mathematical Route Deviation Tolerance (in meters)
      // Tighter tolerance for female mode triggers SOS faster if driver goes off-route
      routeDeviationTolerance: 200, 
      
      // 7. Feature Flag: Women-Only Pooling
      womenOnlyCarpool: false,

      // 8. Panic Hardware Readiness
      sosQuickTriggerEnabled: false,
      
      // 9. Fake Call Evasion System
      fakeCallReadiness: false,

      // ======================================================================
      // 10. ACTION: Set Gender & Auto-Apply Strict Safety Matrix
      // ======================================================================
      setGender: (newGender) => {
        const isNight = checkIsNightTime();
        
        if (newGender === 'female') {
          set({
            gender: 'female',
            minDriverTrustScore: isNight ? 4.8 : 4.5,
            requireVerifiedDriver: true,
            enableGuardianAutoShare: isNight, // Auto-share tracking at night
            routeDeviationTolerance: 50, // 50 meters off-route triggers silent alert
            womenOnlyCarpool: true,
            sosQuickTriggerEnabled: true,
            fakeCallReadiness: true,
          });
        } else if (newGender === 'male') {
          set({
            gender: 'male',
            minDriverTrustScore: 4.0, // Standard baseline
            requireVerifiedDriver: false,
            enableGuardianAutoShare: false,
            routeDeviationTolerance: 200, // Standard 200m tolerance for traffic detours
            womenOnlyCarpool: false,
            sosQuickTriggerEnabled: false,
            fakeCallReadiness: false,
          });
        }
      },

      // ======================================================================
      // 11. ACTION: Real-Time Clock Evaluator (Fires every time app opens)
      // ======================================================================
      evaluateTimeOfDay: () => {
        const currentlyNight = checkIsNightTime();
        const { gender, isNightTime } = get();

        // Only update state if the day/night boundary was crossed
        if (currentlyNight !== isNightTime) {
          set({ isNightTime: currentlyNight });
          // Re-evaluate safety matrix with new time context
          get().setGender(gender);
        }
      },

      // ======================================================================
      // 12. UTILITY: The Strict Filtering Engine for Discovering Vendors/Drivers
      // ======================================================================
      filterDrivers: (driversArray) => {
        const state = get();
        return driversArray.filter(driver => {
          // Rule A: Drop drivers below the dynamic trust threshold instantly
          if (driver.trustScore < state.minDriverTrustScore) return false;
          
          // Rule B: If female mode requires verified drivers, drop unverified
          if (state.requireVerifiedDriver && !driver.isVerified) return false;
          
          // Rule C: If women-only carpool is enabled, drop male drivers/riders
          if (state.womenOnlyCarpool && driver.gender !== 'female') return false;

          return true;
        });
      }
    }),
    {
      name: 'movyra-gender-safety-storage', // Persist to localStorage so safety settings survive app restarts
      storage: createJSONStorage(() => localStorage),
    }
  )
);