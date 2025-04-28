'use client';
import { ReactNode } from 'react';
import { Sidebar } from '@/shared/ui/layout/Sidebar';
import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/react-query';
import { ROUTES } from '@/shared/constants/routes';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function UserLayout({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();
  const pathname = usePathname();

  const navItems = [
    { href: ROUTES.USER.ROOT, label: '회원 정보' },
    { href: ROUTES.USER.FAVORITES, label: '즐겨찾기한 의료기관' },
    { href: ROUTES.USER.REVIEWS, label: '내 리뷰' },
    { href: ROUTES.USER.WRITE_REVIEW, label: '리뷰 작성하러 가기' },
  ];

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex bg-muted">
        <aside className="hidden lg:block w-[240px] border-r border-border p-6 bg-background">
          <Sidebar navItems={navItems} />
        </aside>
        <AnimatePresence mode="wait">
          <main className="flex-1">
            <motion.section
              key={pathname}
              initial={{ opacity: 0, y: 10 }} // 처음에는 아래에 + 투명
              animate={{ opacity: 1, y: 0 }} // 부드럽게 올라오면서 보임
              exit={{ opacity: 0, y: -10 }} // 나갈 때 위로 사라짐
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="min-h-[calc(100vh-61px)]"
            >
              {children}
            </motion.section>
          </main>
        </AnimatePresence>
      </div>
    </QueryClientProvider>
  );
}
