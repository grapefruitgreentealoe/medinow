import { ReactNode } from 'react';
import HeaderWithAuth from '@/shared/ui/layout/HeaderWithAuth';

export default function AppProvider({ children }: { children: ReactNode }) {
  return (
    <>
      <HeaderWithAuth />
      {children}
    </>
  );
}
