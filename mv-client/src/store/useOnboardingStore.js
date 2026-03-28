import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useOnboardingStore = create(
  persist(
    (set) => ({
      currentStep: 0,
      isVerified: false,
      userLocation: null,
      email: '',
      otpSent: false,
      verificationSuccess: false,
      permissions: {
        location: 'prompt',
        notifications: 'prompt',
        camera: 'prompt',
      },
      networkStats: {
        effectiveType: 'unknown',
        downlink: 0,
        rtt: 0,
      },

      setStep: (step) => set({ currentStep: step }),
      nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
      
      setUserLocation: (location) => set({ userLocation: location }),
      setEmail: (email) => set({ email }),
      setOtpSent: (status) => set({ otpSent: status }),
      setVerificationSuccess: (status) => set({ verificationSuccess: status, isVerified: status }),
      
      updatePermissions: (key, status) => 
        set((state) => ({ 
          permissions: { ...state.permissions, [key]: status } 
        })),
        
      updateNetwork: (stats) => set({ networkStats: stats }),
      
      resetOnboarding: () => set({ 
        currentStep: 0, 
        verificationSuccess: false, 
        isVerified: false,
        otpSent: false 
      }),
    }),
    {
      name: 'movyra-onboarding-storage',
    }
  )
);