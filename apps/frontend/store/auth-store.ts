import { createStore } from 'zustand/vanilla';

export interface AuthState {
  isLoggedIn: boolean;
  isAdmin: boolean;
  setAuth: (auth: { isLoggedIn: boolean; isAdmin: boolean }) => void;
  login: () => void;
  logout: () => void;
}

export const authStore = createStore<AuthState>((set) => ({
  setAuth: ({ isLoggedIn, isAdmin }) => set({ isLoggedIn, isAdmin }),
  isLoggedIn: false,
  isAdmin: false,
  login: (isAdmin = false) => set({ isLoggedIn: true, isAdmin }),
  logout: () => set({ isLoggedIn: false, isAdmin: false }),
}));
