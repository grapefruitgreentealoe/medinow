// features/my-page/ui/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/user', label: '회원 정보' },
  { href: '/user/favorites', label: '즐겨찾기 병원' },
  { href: '/user/reviews', label: '내 리뷰' },
  { href: '/user/thanks', label: '감사 메시지' },
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
