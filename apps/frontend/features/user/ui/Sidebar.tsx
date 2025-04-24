// features/my-page/ui/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/shared/constants/routes';

const navItems = [
  { href: ROUTES.USER.ROOT, label: '회원 정보' },
  { href: ROUTES.USER.FAVORITES, label: '즐겨찾기한 의료기관' },
  { href: ROUTES.USER.REVIEWS, label: '내 리뷰' },
  { href: ROUTES.USER.THANKS, label: '내 감사 메시지' },
  { href: ROUTES.USER.WRITE_REVIEW, label: '리뷰 작성하러 가기' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2 !p-[20px]">
      {navItems.map(({ href, label }) => (
        <Link href={href} key={href}>
          <Button
            variant={pathname === href ? 'secondary' : 'ghost'}
            className={cn('w-full justify-start')}
          >
            {label}
          </Button>
        </Link>
      ))}
    </nav>
  );
}
