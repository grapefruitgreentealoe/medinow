'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/react-query';
import { ReactNode, useState } from 'react';
import HeaderWithAuth from '@/shared/ui/layout/HeaderWithAuth';
import { RecoilRoot } from 'recoil';

export default function AppProvider({ children }: { children: ReactNode }) {
  const [client] = useState(getQueryClient);

  return (
    <QueryClientProvider client={client}>
      <RecoilRoot>
        <HeaderWithAuth />
        {children}
      </RecoilRoot>
    </QueryClientProvider>
  );
}
