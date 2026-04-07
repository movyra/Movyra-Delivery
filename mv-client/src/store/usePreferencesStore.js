import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * GLOBAL PREFERENCES STORE (ZUSTAND + PERSIST)
 * Manages global UI state including Theme (Light/Dark/System)
 * and Language/i18n (English, Hindi, Marathi).
 * Persists seamlessly across app reloads via browser localStorage.
 */
const usePreferencesStore = create(
  persist(
    (set) => ({
      // ============================================================================
      // 1. STATE DEFINITIONS
      // ============================================================================
      theme: 'system', // Options: 'light' | 'dark' | 'system'
      language: 'en',  // Options: 'en' (English) | 'hi' (Hindi) | 'mr' (Marathi)

      // ============================================================================
      // 2. MUTATORS & ACTIONS
      // ============================================================================
      setTheme: (newTheme) => {
        // Validate input strictly
        if (['light', 'dark', 'system'].includes(newTheme)) {
          set({ theme: newTheme });
        }
      },

      setLanguage: (newLanguage) => {
        // Validate input strictly
        if (['en', 'hi', 'mr'].includes(newLanguage)) {
          set({ language: newLanguage });
        }
      },
    }),
    {
      name: 'movyra-preferences-storage', // Strict storage key
      storage: createJSONStorage(() => localStorage), 
    }
  )
);

export default usePreferencesStore;