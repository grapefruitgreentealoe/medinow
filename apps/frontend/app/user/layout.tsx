'use client';
import { ReactNode } from 'react';
import { Sidebar } from '@/shared/ui/layout/Sidebar';
import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/react-query';
import { ROUTES } from '@/shared/constants/routes';

export default function UserLayout({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  const navItems = [
    { href: ROUTES.USER.ROOT, label: '회원 정보' },
    { href: ROUTES.USER.FAVORITES, label: '즐겨찾기한 의료기관' },
    { href: ROUTES.USER.REVIEWS, label: '내 리뷰' },
    { href: ROUTES.USER.WRITE_REVIEW, label: '리뷰 작성하러 가기', ssr: true },
  ];

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen bg-muted">
        <aside className="hidden md:block w-[240px] border-r border-border p-6 bg-background">
          <Sidebar navItems={navItems} />
        </aside>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </QueryClientProvider>
  );
}
