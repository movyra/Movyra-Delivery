import { create } from 'zustand'; import { persist } from 'zustand/middleware';
const useAuthStore = create(persist((set) => ({ user: null, token: null, isAuthenticated: false, login: (u, t) => set({ user: u, token: t, isAuthenticated: true }), logout: () => set({ user: null, token: null, isAuthenticated: false }) }), { name: 'movyra-auth' }));
export default useAuthStore;
