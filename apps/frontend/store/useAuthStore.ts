// store/useAuthStore.ts
import { create } from 'zustand';

interface AuthState {
  isLoggedIn: boolean;
  isAdmin: boolean;
  setAuth: (auth: { isLoggedIn: boolean; isAdmin: boolean }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  isAdmin: false,
  setAuth: ({ isLoggedIn, isAdmin }) => set({ isLoggedIn, isAdmin }),
  logout: () => set({ isLoggedIn: false, isAdmin: false }),
}));
