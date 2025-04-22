'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import axiosInstance from '@/shared/lib/axios';
import { useEffect, useState } from 'react';

declare global {
  interface Window {
    __INITIAL_IS_LOGGED_IN__?: boolean;
  }
}

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    setIsLoggedIn(window.__INITIAL_IS_LOGGED_IN__ ?? false);
  }, []);

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/auth/logout', null, {
        withCredentials: true,
      });
      window.__INITIAL_IS_LOGGED_IN__ = false;
      location.reload();
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  return (
    <header className="w-full !px-6 !py-3 border-b border-border bg-background text-foreground flex justify-between items-center">
      <Link href="/" className="text-lg font-semibold tracking-tight">
        <span className="text-primary text-3xl">Medinow</span>
      </Link>
      <nav className="flex items-center gap-2">
        {isLoggedIn ? (
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-sm font-medium text-foreground hover:bg-muted"
          >
            로그아웃
          </Button>
        ) : (
          <div className="flex !gap-[20px]">
            <Link href="/signup/admin">
              <Button
                variant="ghost"
                className="text-sm font-medium text-foreground hover:bg-muted"
              >
                관리자 회원가입
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                variant="ghost"
                className="text-sm font-medium text-foreground hover:bg-muted"
              >
                회원가입
              </Button>
            </Link>
            <Link href="/login">
              <Button className="text-sm font-medium bg-primary text-white hover:bg-primary/90 !px-4">
                로그인
              </Button>
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
