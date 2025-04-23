'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ROUTES } from '@/shared/constants/routes';

declare global {
  interface Window {
    __INITIAL_IS_LOGGED_IN__?: boolean;
  }
}

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

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
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-sm font-medium text-foreground !px-4"
            >
              로그아웃
            </Button>
          ) : (
            <>
              {/* 모바일 햄버거 */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  className="p-2 w-[2rem]"
                  onClick={() => setMenuOpen((prev) => !prev)}
                >
                  <Menu size={24} />
                </Button>
              </div>

              {/* 데스크탑 버튼들 */}
              <div className="hidden md:flex gap-[20px]">
                <Link href={ROUTES.ADMIN_SIGN_UP}>
                  <Button
                    variant="ghost"
                    className="text-sm font-medium text-foreground !px-4"
                  >
                    관리자 회원가입
                  </Button>
                </Link>
                <Link href={ROUTES.SIGN_UP}>
                  <Button
                    variant="ghost"
                    className="text-sm font-medium text-foreground !px-4"
                  >
                    회원가입
                  </Button>
                </Link>
                <Link href={ROUTES.LOGIN}>
                  <Button className="text-sm font-medium bg-primary text-white hover:bg-primary/90 !px-4">
                    로그인
                  </Button>
                </Link>
              </div>
            </>
          )}
        </nav>
      </div>

      {/* 모바일 드롭다운 메뉴 */}
      <AnimatePresence>
        {!isLoggedIn && menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden absolute top-full left-0 w-full bg-background border-t border-border shadow-xl flex flex-col"
          >
            {[
              { href: ROUTES.ADMIN_SIGN_UP, label: '관리자 회원가입' },
              { href: ROUTES.SIGN_UP, label: '회원가입' },
              { href: ROUTES.LOGIN, label: '로그인' },
            ].map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className="w-full h-[3rem] text-center flex items-center justify-center text-base border-b border-border hover:bg-primary hover:!text-white transition-colors"
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
