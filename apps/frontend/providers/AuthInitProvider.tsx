'use client';

import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { authTokenState } from '@/store/authState';

function AuthInitProvider({ children }: { children: React.ReactNode }) {
  const setToken = useSetRecoilState(authTokenState);

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) setToken(storedToken);
  }, []);

  return <>{children}</>;
}

export default AuthInitProvider;
