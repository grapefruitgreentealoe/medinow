'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ROUTES } from '@/shared/constants/routes';
import axiosInstance from '@/lib/axios';

type Role = 'user' | 'admin';

interface User {
  id: string;
  email: string;
  role: Role;
  userProfile: {
    name: string;
    nickname: string;
  };
}

declare global {
  interface Window {
    __INITIAL_IS_LOGGED_IN__?: boolean;
  }
}

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const isInitLoggedIn = window.__INITIAL_IS_LOGGED_IN__ ?? false;
    setIsLoggedIn(isInitLoggedIn);

    if (isInitLoggedIn) {
      axiosInstance
        .get('/users', { withCredentials: true })
        .then((res) => {
          const [firstUser] = res.data.users;
          setUser(firstUser);
        })
        .catch(() => setUser(null));
    }
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
    <header className="w-full !px-6 !py-3 border-b border-border bg-background text-foreground relative z-50">
      <div className="flex justify-between items-center">
        <Link
          href={ROUTES.HOME}
          className="text-lg font-semibold tracking-tight"
        >
          <span className="text-primary text-3xl">Medinow</span>
        </Link>

        <nav className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              {user?.role === 'admin' ? (
                <Link href={ROUTES.ADMIN.DASHBOARD}>
                  <Button variant="ghost" className="text-sm font-medium !px-4">
                    관리자 대시보드
                  </Button>
                </Link>
              ) : (
                <Link href={ROUTES.USER.ROOT}>
                  <Button variant="ghost" className="text-sm font-medium !px-4">
                    마이페이지
                  </Button>
                </Link>
              )}

              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-sm font-medium text-foreground !px-4"
              >
                로그아웃
              </Button>
            </>
          ) : (
            <>
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  className="p-2 w-[2rem]"
                  onClick={() => setMenuOpen((prev) => !prev)}
                >
                  <Menu size={24} />
                </Button>
              </div>

              <div className="hidden md:flex gap-[20px]">
                <Link href={ROUTES.ADMIN_SIGN_UP}>
                  <Button variant="ghost" className="text-sm !px-4">
                    관리자 회원가입
                  </Button>
                </Link>
                <Link href={ROUTES.SIGN_UP}>
                  <Button variant="ghost" className="text-sm !px-4">
                    회원가입
                  </Button>
                </Link>
                <Link href={ROUTES.LOGIN}>
                  <Button className="text-sm bg-primary text-white !px-4">
                    로그인
                  </Button>
                </Link>
              </div>
            </>
          )}
        </nav>
      </div>

      {/* 모바일 메뉴 */}
      <AnimatePresence>
        {!isLoggedIn && menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden absolute top-full left-0 w-full bg-background border-t border-border shadow-xl flex flex-col"
          >
            {[
              { href: ROUTES.ADMIN_SIGN_UP, label: '관리자 회원가입' },
              { href: ROUTES.SIGN_UP, label: '회원가입' },
              { href: ROUTES.LOGIN, label: '로그인' },
            ].map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className="w-full h-[3rem] flex justify-center items-center text-base border-b border-border hover:bg-primary hover:text-white transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
