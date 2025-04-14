'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Header() {
  return (
    <header className="w-full px-6 py-4 border-b flex justify-between items-center bg-white">
      <Link href="/" className="text-xl font-bold text-primary">
        🏥 Medinow
      </Link>
      <nav className="flex gap-4">
        <Link href="/signup">
          <Button variant="outline">회원가입</Button>
        </Link>
        <Link href="/login">
          <Button>로그인</Button>
        </Link>
      </nav>
    </header>
  );
}
