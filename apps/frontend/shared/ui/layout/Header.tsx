'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HeartPulseIcon, Menu, MapPinIcon } from 'lucide-react';
import { useState } from 'react';
import { ROUTES } from '@/shared/constants/routes';
import axiosInstance from '@/lib/axios';
import { useAtomValue, useSetAtom } from 'jotai';
import { isLoggedInAtom, userRoleAtom } from '@/atoms/auth';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

export default function Header() {
  const isLoggedIn = useAtomValue(isLoggedInAtom);
  const role = useAtomValue(userRoleAtom);
  const setIsLoggedIn = useSetAtom(isLoggedInAtom);

  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/auth/logout', null, {
        withCredentials: true,
      });
      setIsLoggedIn(false); // 상태 업데이트
      location.reload();
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  type getMenuItemsType = {
    href: string;
    label: string;
    onClick?: () => void;
  };

  const getMenuItems = (): getMenuItemsType[] => {
    const commonItems = [{ href: ROUTES.MAP, label: '지도 보기' }];

    if (!isLoggedIn) {
      return [
        ...commonItems,
        { href: ROUTES.SIGN_UP.ADMIN, label: '관리자 회원가입' },
        { href: ROUTES.SIGN_UP.USER, label: '회원가입' },
        { href: ROUTES.LOGIN, label: '로그인' },
      ];
    }

    if (role === 'admin') {
      return [
        ...commonItems,
        { href: ROUTES.ADMIN.DASHBOARD, label: '관리자 대시보드' },
        { href: ROUTES.ADMIN.REVIEWS, label: '리뷰 보기' },
        { href: ROUTES.ADMIN.CHAT, label: '채팅' },
        { href: '#', label: '로그아웃', onClick: handleLogout },
      ];
    }

    return [
      ...commonItems,
      { href: ROUTES.USER.ROOT, label: '마이페이지' },
      { href: ROUTES.USER.FAVORITES, label: '즐겨찾기' },
      { href: ROUTES.USER.WRITE_REVIEW, label: '리뷰 작성하기' },
      { href: ROUTES.USER.REVIEWS, label: '내 리뷰' },
      {
        href: ROUTES.USER.CHAT('be8a7508-d911-49cb-99e6-4891c5f77afb'),
        label: '채팅(베타체험)',
      },
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

        {isLoggedIn !== null && (
          <nav className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="!p-2 w-[2rem] lg:hidden"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <Menu size={24} />
            </Button>

            <div className="hidden lg:flex gap-[20px]">
              <Link href={ROUTES.MAP}>
                <Button
                  variant="ghost"
                  className="text-sm flex items-center gap-1"
                >
                  <MapPinIcon size={16} /> 지도 보기
                </Button>
              </Link>

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
                      <Link
                        href={ROUTES.USER.CHAT(
                          'be8a7508-d911-49cb-99e6-4891c5f77afb'
                        )}
                      >
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
        )}
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
