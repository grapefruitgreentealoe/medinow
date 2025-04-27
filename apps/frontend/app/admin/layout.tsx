'use client';
import { ReactNode } from 'react';
import { Sidebar } from '@/shared/ui/layout/Sidebar';
import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/react-query';
import { ROUTES } from '@/shared/constants/routes';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  const navItems = [
    { href: ROUTES.ADMIN.DASHBOARD, label: '회원 정보' },
    { href: ROUTES.ADMIN.REVIEWS, label: '리뷰 목록' },
    { href: ROUTES.ADMIN.CHAT, label: '채팅방' },
  ];

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen bg-muted">
        <aside className="hidden md:block w-[200px] border-r border-border p-6 bg-background">
          <Sidebar navItems={navItems} />
        </aside>
        <main className="flex-1 !w-[calc(100%-200px)]">{children}</main>
      </div>
    </QueryClientProvider>
  );
}
