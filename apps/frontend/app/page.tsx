'use client';

import NearbyCareUnits from '@/features/map/ui/KakaoMapWithPins';
import { getQueryClient } from '@/lib/react-query';
import { QueryClientProvider } from '@tanstack/react-query';

export default function HomePage() {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <NearbyCareUnits />
    </QueryClientProvider>
  );
}
