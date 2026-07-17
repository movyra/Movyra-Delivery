import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * ============================================================================
 * MODULE: MOVYRA CIVIC LOCAL STATE MANAGEMENT
 * Features:
 * 1. Geographic Location Tracking & Memory
 * 2. Administrative Dashboard Filter State
 * 3. Offline Complaint Drafting & Persistence
 * ============================================================================
 */

export const useCivicStore = create(
  persist(
    (set) => ({
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
    }),
    {
      name: 'movyra-civic-local-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);