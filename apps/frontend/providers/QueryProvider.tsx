'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/react-query';
import { ReactNode, useState } from 'react';

export default function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(getQueryClient);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
