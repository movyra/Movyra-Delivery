import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * ============================================================================
 * MODULE: MOVYRA CIVIC LOCAL STATE MANAGEMENT
 * Features:
 * 1. Geographic Location Tracking & Memory
 * 2. Administrative Dashboard Filter State
 * 3. Offline Complaint Drafting & Persistence
 * 4. Persistent Interface Theme Configuration (Light/Dark Mode)
 * 5. Persistent Onboarding Documentation History Tracker
 * 6. Global Session Termination Logic
 * ============================================================================
 */

export const useCivicStore = create(
  persist(
    (set) => ({
      // ======================================================================
      // INTERFACE THEME CONFIGURATION
      // ======================================================================
      theme: 'dark', // Defaults to corporate master identity
      
      toggleTheme: () => 
        set((state) => ({
          theme: state.theme === 'dark' ? 'light' : 'dark'
        })),

      // ======================================================================
      // USER ONBOARDING OPERATIONS STATE
      // ======================================================================
      onboardingCompleted: false,

      completeOnboarding: () =>
        set({
          onboardingCompleted: true
        }),

      // ======================================================================
      // GEOGRAPHIC LOCATION STATE
      // ======================================================================
      currentLocation: {
        latitude: null,
        longitude: null,
        address: '',
        isTracking: false,
      },
      
      setLocation: (latitude, longitude, address) => 
        set((state) => ({
          currentLocation: { 
            ...state.currentLocation, 
            latitude, 
            longitude, 
            address 
          }
        })),
        
      setTrackingStatus: (status) =>
        set((state) => ({
          currentLocation: { 
            ...state.currentLocation, 
            isTracking: status 
          }
        })),

      // ======================================================================
      // ADMINISTRATIVE FILTER STATE
      // ======================================================================
      activeFilters: {
        category: 'All',
        status: 'All',
        dateRange: '30 Days',
        ward: 'All',
      },
      
      setFilters: (newFilters) => 
        set((state) => ({
          activeFilters: { 
            ...state.activeFilters, 
            ...newFilters 
          }
        })),
        
      clearFilters: () => 
        set({
          activeFilters: { 
            category: 'All', 
            status: 'All', 
            dateRange: '30 Days', 
            ward: 'All' 
          }
        }),

      // ======================================================================
      // OFFLINE DRAFT MANAGEMENT & DATA RETENTION
      // ======================================================================
      offlineDrafts: [],
      
      saveDraft: (draftData) => 
        set((state) => ({
          offlineDrafts: [
            ...state.offlineDrafts, 
            { 
              ...draftData, 
              savedAt: new Date().toISOString(), 
              draftId: crypto.randomUUID() 
            }
          ]
        })),
        
      removeDraft: (draftId) => 
        set((state) => ({
          offlineDrafts: state.offlineDrafts.filter(draft => draft.draftId !== draftId)
        })),
        
      clearAllDrafts: () => 
        set({ 
          offlineDrafts: [] 
        }),

      // ======================================================================
      // GLOBAL SESSION TERMINATION PROTOCOL
      // ======================================================================
      // This resets all sensitive local data when the user signs out.
      // We retain the theme and onboarding status so the app looks right upon return.
      terminateSession: () =>
        set({
          currentLocation: { latitude: null, longitude: null, address: '', isTracking: false },
          activeFilters: { category: 'All', status: 'All', dateRange: '30 Days', ward: 'All' },
          offlineDrafts: []
        }),
    }),
    {
      name: 'movyra-civic-local-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);