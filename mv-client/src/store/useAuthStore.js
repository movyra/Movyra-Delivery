import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Persistent store to keep users logged in across app restarts
const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      // Real logic to inject user data and token from your backend
      login: (userData, authToken) => set({ 
        user: userData, 
        token: authToken, 
        isAuthenticated: true 
      }),
      
      // Clears local session and resets state
      logout: () => set({ 
        user: null, 
        token: null, 
        isAuthenticated: false 
      }),
      
      // Real-time updates for avatar/name changes without forcing re-login
      updateProfile: (updates) => set((state) => ({
        user: { ...state.user, ...updates }
      })),
    }),
    {
      name: 'movyra-auth-storage', // Unique key for localStorage persistence
    }
  )
);

export default useAuthStore;