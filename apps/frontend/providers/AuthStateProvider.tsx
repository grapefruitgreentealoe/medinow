'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

export function AuthStateProvider({ children }: { children: React.ReactNode }) {
  const setAuth = useAuthStore((state) => state.setAuth);
  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const isLogin = localStorage.getItem('isLogin');

    setAuth({
      isAdmin,
      isLoggedIn: !!isLogin,
    });
  }, [setAuth]);

  return <>{children}</>;
}
