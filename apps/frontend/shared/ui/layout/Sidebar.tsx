// features/my-page/ui/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/shared/constants/routes';

interface SidebarProps {
  navItems: {
    href: string;
    label: string;
    ssr?: boolean;
  }[];
}

export function Sidebar({ navItems }: SidebarProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2 !p-[20px]">
      {navItems.map(
        ({
          href,
          label,
          ssr = false,
        }: {
          href: string;
          label: string;
          ssr?: boolean;
        }) =>
          ssr ? (
            <Button
              key={href}
              variant={pathname === href ? 'secondary' : 'ghost'}
              className={cn('w-full justify-start')}
              onClick={() => {
                // 강제로 리로드 (SSR처럼 새 상태로 진입)
                window.location.href = href;
              }}
            >
              {label}
            </Button>
          ) : (
            <Link href={href} key={href}>
              <Button
                variant={pathname === href ? 'secondary' : 'ghost'}
                className={cn('w-full justify-start')}
              >
                {label}
              </Button>
            </Link>
          )
      )}
    </nav>
  );
}
