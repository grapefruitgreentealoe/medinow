'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HeartPulseIcon, Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ROUTES } from '@/shared/constants/routes';
import axiosInstance from '@/lib/axios';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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
    __USER_ROLE__?: string;
  }
}

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string>('');

  useEffect(() => {
    const isInitLoggedIn = window.__INITIAL_IS_LOGGED_IN__ ?? false;
    const userRole = window.__USER_ROLE__ ?? '';
    setIsLoggedIn(isInitLoggedIn);
    setRole(userRole);
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

  const getMenuItems = () => {
    if (!isLoggedIn) {
      return [
        { href: ROUTES.SIGN_UP.ADMIN, label: '관리자 회원가입' },
        { href: ROUTES.SIGN_UP.USER, label: '회원가입' },
        { href: ROUTES.LOGIN, label: '로그인' },
      ];
    }
    if (role === 'admin') {
      return [
        { href: ROUTES.ADMIN.DASHBOARD, label: '관리자 대시보드' },
        { href: ROUTES.ADMIN.REVIEWS, label: '리뷰 보기' },
        { href: ROUTES.ADMIN.CHAT, label: '채팅' },
        { href: '#', label: '로그아웃', onClick: handleLogout },
      ];
    }

    return [
      { href: ROUTES.USER.ROOT, label: '마이페이지' },
      { href: ROUTES.USER.FAVORITES, label: '즐겨찾기' },
      { href: ROUTES.USER.WRITE_REVIEW, label: '리뷰 작성하기' },
      { href: ROUTES.USER.REVIEWS, label: '내 리뷰' },
      { href: ROUTES.USER.CHAT_LIST, label: '채팅' },
      { href: '#', label: '로그아웃', onClick: handleLogout },
    ];
  };

  return (
    <header className="fixed w-full min-h-[61px] !px-6 !py-3 border-b border-border bg-background text-foreground  z-50 ">
      <div className="flex justify-between items-center">
        <Link
          href={ROUTES.HOME}
          className="text-lg font-semibold tracking-tight"
        >
          <span className="text-primary text-2xl flex items-center gap-1">
            <HeartPulseIcon className="text-accent" /> MediNow
          </span>
        </Link>

        {isLoggedIn !== null ? (
          <nav className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="!p-2 w-[2rem] lg:hidden"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <Menu size={24} />
            </Button>
            {/* 데스크탑: 로그인 상태에 따라 버튼 분기 */}
            <div className="hidden lg:flex gap-[20px]">
              {isLoggedIn ? (
                <>
                  {role === 'admin' ? (
                    <Link href={ROUTES.ADMIN.DASHBOARD}>
                      <Button variant="ghost" className="text-sm">
                        관리자 대시보드
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Link href={ROUTES.USER.ROOT}>
                        <Button variant="ghost" className="text-sm ">
                          마이페이지
                        </Button>
                      </Link>
                      <Link href={ROUTES.USER.WRITE_REVIEW}>
                        <Button variant="ghost" className="text-sm ">
                          리뷰작성
                        </Button>
                      </Link>
                      <Link href={ROUTES.USER.CHAT_LIST}>
                        <Button variant="ghost" className="text-sm ">
                          채팅
                        </Button>
                      </Link>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="text-sm font-medium text-foreground "
                  >
                    로그아웃
                  </Button>
                </>
              ) : (
                <>
                  <Link href={ROUTES.SIGN_UP.ADMIN}>
                    <Button variant="ghost" className="text-sm ">
                      관리자 회원가입
                    </Button>
                  </Link>
                  <Link href={ROUTES.SIGN_UP.USER}>
                    <Button variant="ghost" className="text-sm ">
                      회원가입
                    </Button>
                  </Link>
                  <Link href={ROUTES.LOGIN}>
                    <Button className="text-sm bg-primary text-white ">
                      로그인
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        ) : null}
      </div>

      {/* 모바일 햄버거 버튼 */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="top" className="border-b border-border">
          <SheetHeader>
            <SheetTitle></SheetTitle>
            <SheetDescription> </SheetDescription>
          </SheetHeader>

          <nav className="flex flex-col">
            {getMenuItems().map(({ href, label, onClick }) => {
              if (onClick) {
                return (
                  <button
                    key={label}
                    onClick={() => {
                      setMenuOpen(false);
                      onClick();
                    }}
                    className="w-full h-[3rem] flex justify-center items-center text-base border-b border-border hover:bg-primary hover:text-white transition-colors"
                  >
                    {label}
                  </button>
                );
              }

              return (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="w-full h-[3rem] flex justify-center items-center text-base border-b border-border hover:bg-primary hover:!text-white transition-colors !text-primary"
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
