'use client';

import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { isAdminState } from '@/store/authState';

export function AdminStateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setIsAdmin = useSetRecoilState(isAdminState);

  useEffect(() => {
    const stored = localStorage.getItem('isAdmin');
    setIsAdmin(stored === 'true');
  }, []);

  return <>{children}</>;
}
