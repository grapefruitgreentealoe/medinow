'use client';

import { useEffect } from 'react';
import { authStore } from '@/store/auth-store';

export function AuthStateProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const isLogin = localStorage.getItem('isLogin') === 'true';

    authStore.setState({
      isAdmin,
      isLoggedIn: isLogin,
    });
  }, []);

  return <>{children}</>;
}
