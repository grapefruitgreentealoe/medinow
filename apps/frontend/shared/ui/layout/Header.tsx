'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

import axiosInstance from '@/lib/axios';
import { useEffect, useState } from 'react';

declare global {
  interface Window {
    __INITIAL_IS_LOGGED_IN__?: boolean;
  }
}

export default function Header() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    // SSR에서 주입한 값 사용
    setIsLoggedIn(window.__INITIAL_IS_LOGGED_IN__ ?? false);
  }, []);

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/auth/logout', null, {
        withCredentials: true,
      });
      router.refresh();
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  return (
    <header className="w-full px-6 py-4 border-b flex justify-between items-center bg-white">
      <Link href="/" className="text-xl font-bold ">
        <span className="text-black">🏥 Medinow</span>
      </Link>
      <nav className="flex gap-4">
        {isLoggedIn ? (
          <Button
            variant="outline"
            onClick={handleLogout}
            className="text-black"
          >
            로그아웃
          </Button>
        ) : (
          <>
            <Link href="/signup/admin">
              <Button variant="outline" className="text-black">
                관리자 회원가입
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" className="text-black">
                회원가입
              </Button>
            </Link>
            <Link href="/login">
              <Button>로그인</Button>
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
