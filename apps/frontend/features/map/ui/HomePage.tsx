'use client';

import NearbyCareUnits from '@/features/map/ui/NearbyCareUnitsMap';
import { getQueryClient } from '@/lib/react-query';
import { QueryClientProvider } from '@tanstack/react-query';

export default function HomePage() {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-[calc(100vh-64px)] overflow-hidden">
        <NearbyCareUnits />
      </div>
    </QueryClientProvider>
  );
}
