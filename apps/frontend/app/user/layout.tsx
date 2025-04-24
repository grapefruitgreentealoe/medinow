'use client';
import { ReactNode } from 'react';
import { Sidebar } from '@/features/user/ui/Sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { FloatingChatWidget } from '@/widgets/chat/FloatingChatWidget';
import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/react-query';

export default function UserLayout({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen bg-muted">
        <aside className="hidden md:block w-[240px] border-r border-border p-6 bg-background">
          <Sidebar />
        </aside>
        <main className="flex-1 p-8">{children}</main>
        <FloatingChatWidget />
      </div>
    </QueryClientProvider>
  );
}
