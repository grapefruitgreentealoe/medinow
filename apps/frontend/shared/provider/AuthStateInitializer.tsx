'use client';

import { ReactNode } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { isLoggedInAtom, userRoleAtom } from '@/atoms/auth';
import { set } from 'zod';

interface Props {
  isLoggedIn: boolean;
  userRole: string;
  children: ReactNode;
}

export const AuthStateInitializer = ({
  isLoggedIn,
  userRole,
  children,
}: Props) => {
  const setIsLoggedIn = useSetAtom(isLoggedInAtom);
  const setUserRole = useSetAtom(userRoleAtom);

  setIsLoggedIn(isLoggedIn);
  setUserRole(userRole);

  return <>{children}</>;
};
