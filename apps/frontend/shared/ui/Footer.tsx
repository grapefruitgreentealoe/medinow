'use client';

import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  const isHome = pathname === '/'; // 루트에서만 표시

  if (!isHome) return null;

  return (
    <footer className="fixed bottom-0 left-0 w-full bg-white border-t shadow-md !py-6 text-center text-sm text-muted-foreground z-50">
      <div>© 2025 MediNow. All rights reserved.</div>
      <div className="mt-1 text-xs">Created by 삼시세코</div>
    </footer>
  );
}
